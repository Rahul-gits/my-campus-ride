import React, { useState, useEffect, createContext, useContext } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { smartNotificationService } from '@/services/smartNotificationService';
import { websocketService } from '@/services/websocketService';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: 'ride' | 'route' | 'payment' | 'safety' | 'maintenance' | 'promotion' | 'system';
  userId?: string;
  role?: 'student' | 'driver' | 'admin';
  busId?: string;
  routeId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  actions?: Array<{
    id: string;
    label: string;
    action: string;
    type: 'primary' | 'secondary' | 'danger';
    url?: string;
  }>;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Shared helpers (used by dropdown, item, and alerts)
const sharedGetNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'emergency': return <Zap className="h-4 w-4 text-red-500" />;
    case 'promotion': return <Zap className="h-4 w-4 text-purple-500" />;
    default: return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const sharedGetPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'border-red-500 bg-red-50';
    case 'high': return 'border-orange-500 bg-orange-50';
    case 'medium': return 'border-yellow-500 bg-yellow-50';
    case 'low': return 'border-blue-500 bg-blue-50';
    default: return 'border-gray-500 bg-gray-50';
  }
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByCategory: (category: string) => Notification[];
  getNotificationsByPriority: (priority: string) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize notifications
  useEffect(() => {
    loadNotifications();
    setupWebSocketListeners();
    setupPeriodicNotifications();
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.readAt).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const loadedNotifications = await smartNotificationService.getNotifications();
      setNotifications(loadedNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Load mock notifications for demo
      loadMockNotifications();
    }
  };

  const loadMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        priority: 'medium',
        title: 'Route Update',
        message: 'Route A schedule has been updated. New departure times available.',
        category: 'route',
        role: 'student',
        routeId: 'Route A',
        actions: [
          { id: 'view', label: 'View Schedule', action: 'view_schedule', type: 'primary' },
          { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 5)
      },
      {
        id: '2',
        type: 'warning',
        priority: 'high',
        title: 'Bus Delay Alert',
        message: 'Bus BUS-001 is delayed by 10 minutes due to traffic congestion.',
        category: 'ride',
        role: 'student',
        busId: 'BUS-001',
        routeId: 'Route A',
        actions: [
          { id: 'track', label: 'Track Bus', action: 'track_bus', type: 'primary' },
          { id: 'alternative', label: 'Find Alternative', action: 'find_alternative', type: 'secondary' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 2)
      },
      {
        id: '3',
        type: 'success',
        priority: 'low',
        title: 'Payment Successful',
        message: 'Your monthly pass payment of $25.00 has been processed successfully.',
        category: 'payment',
        role: 'student',
        actions: [
          { id: 'receipt', label: 'View Receipt', action: 'view_receipt', type: 'primary' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        id: '4',
        type: 'emergency',
        priority: 'critical',
        title: 'Emergency Alert',
        message: 'Emergency situation reported on Route B. Please avoid the area.',
        category: 'safety',
        role: 'student',
        routeId: 'Route B',
        actions: [
          { id: 'report', label: 'Report Status', action: 'report_status', type: 'danger' },
          { id: 'safe', label: 'Mark Safe', action: 'mark_safe', type: 'primary' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 1)
      },
      {
        id: '5',
        type: 'promotion',
        priority: 'low',
        title: 'Special Offer',
        message: 'Get 20% off your next ride pass! Limited time offer.',
        category: 'promotion',
        role: 'student',
        actions: [
          { id: 'claim', label: 'Claim Offer', action: 'claim_offer', type: 'primary' },
          { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' }
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 30)
      }
    ];
    setNotifications(mockNotifications);
  };

  const setupWebSocketListeners = () => {
    websocketService.on('notification', (notification: Notification) => {
      addNotification(notification);
    });

    websocketService.on('emergency_alert', (alert: any) => {
      addNotification({
        type: 'emergency',
        priority: 'critical',
        title: 'Emergency Alert',
        message: alert.description,
        category: 'safety',
        location: alert.location,
        busId: alert.busId,
        actions: [
          { id: 'respond', label: 'Respond', action: 'respond_emergency', type: 'danger' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    websocketService.on('route_update', (update: any) => {
      addNotification({
        type: update.status === 'delayed' ? 'warning' : 'info',
        priority: update.status === 'delayed' ? 'high' : 'medium',
        title: 'Route Update',
        message: update.message || `Route ${update.routeId} status: ${update.status}`,
        category: 'route',
        routeId: update.routeId,
        actions: [
          { id: 'view', label: 'View Route', action: 'view_route', type: 'primary' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  };

  const setupPeriodicNotifications = () => {
    // Simulate periodic notifications for demo
    const intervals = [
      { delay: 30000, type: 'info', message: 'System maintenance scheduled for tonight at 2 AM' },
      { delay: 60000, type: 'promotion', message: 'New route added! Check out Route D for faster campus access' },
      { delay: 90000, type: 'success', message: 'Your ride streak continues! 5 days in a row!' }
    ];

    intervals.forEach(({ delay, type, message }) => {
      setTimeout(() => {
        addNotification({
          type: type as any,
          priority: 'low',
          title: 'System Update',
          message,
          category: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }, delay);
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new window.Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/icon-192x192.png',
        tag: newNotification.id
      });
    }

    // Auto-dismiss low priority notifications after 10 seconds
    if (newNotification.priority === 'low') {
      setTimeout(() => {
        deleteNotification(newNotification.id);
      }, 10000);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await smartNotificationService.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, readAt: new Date() }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    try {
      await smartNotificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }

    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        readAt: notification.readAt || new Date()
      }))
    );
  };

  const deleteNotification = async (id: string) => {
    try {
      await smartNotificationService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }

    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(n => n.category === category);
  };

  const getNotificationsByPriority = (priority: string) => {
    return notifications.filter(n => n.priority === priority);
  };

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByCategory,
    getNotificationsByPriority
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component
export const NotificationBell: React.FC<{
  className?: string;
  showCount?: boolean;
  onClick?: () => void;
}> = ({ className = '', showCount = true, onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="outline"
      size="sm"
      className={`relative ${className}`}
      onClick={onClick}
    >
      <Bell className="h-4 w-4" />
      {showCount && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

// Notification Dropdown Component
export const NotificationDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}> = ({ isOpen, onClose, className = '' }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByPriority
  } = useNotifications();

  const criticalNotifications = getNotificationsByPriority('critical');
  const highPriorityNotifications = getNotificationsByPriority('high');
  const otherNotifications = notifications.filter(
    n => n.priority !== 'critical' && n.priority !== 'high'
  );

  const handleNotificationAction = (notification: Notification, action: string) => {
    console.log(`Action ${action} triggered for notification ${notification.id}`);
    
    switch (action) {
      case 'track_bus':
        // Navigate to bus tracking
        window.location.href = '/dashboard/student?tab=tracking';
        break;
      case 'view_route':
        // Navigate to route details
        window.location.href = '/dashboard/student?tab=routes';
        break;
      case 'view_receipt':
        // Navigate to payment history
        window.location.href = '/dashboard/student?tab=payments';
        break;
      case 'respond_emergency':
        // Navigate to emergency page
        window.location.href = '/emergency';
        break;
      case 'dismiss':
        deleteNotification(notification.id);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  // Use shared helpers within dropdown
  const getNotificationIcon = (type: string) => sharedGetNotificationIcon(type);
  const getPriorityColor = (priority: string) => sharedGetPriorityColor(priority);

  if (!isOpen) return null;

  return (
    <div className={`absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark All Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {/* Critical Notifications */}
            {criticalNotifications.length > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded">
                  CRITICAL ALERTS
                </div>
                {criticalNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={handleNotificationAction}
                    onMarkRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    className={getPriorityColor(notification.priority)}
                  />
                ))}
              </div>
            )}

            {/* High Priority Notifications */}
            {highPriorityNotifications.length > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded">
                  HIGH PRIORITY
                </div>
                {highPriorityNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={handleNotificationAction}
                    onMarkRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    className={getPriorityColor(notification.priority)}
                  />
                ))}
              </div>
            )}

            {/* Other Notifications */}
            {otherNotifications.length > 0 && (
              <div className="space-y-2">
                <div className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                  OTHER NOTIFICATIONS
                </div>
                {otherNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={handleNotificationAction}
                    onMarkRead={() => markAsRead(notification.id)}
                    onDelete={() => deleteNotification(notification.id)}
                    className={getPriorityColor(notification.priority)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            onClose();
            window.location.href = '/alerts';
          }}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
};

// Individual Notification Item Component
const NotificationItem: React.FC<{
  notification: Notification;
  onAction: (notification: Notification, action: string) => void;
  onMarkRead: () => void;
  onDelete: () => void;
  className?: string;
}> = ({ notification, onAction, onMarkRead, onDelete, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${className} ${!notification.readAt ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {notification.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-2">
                {!notification.readAt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead();
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.type === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(notification, action.action);
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Notification Alert Component for Dashboard Integration
export const NotificationAlert: React.FC<{
  notification: Notification;
  onDismiss: () => void;
  className?: string;
}> = ({ notification, onDismiss, className = '' }) => {
  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'error': return 'destructive';
      case 'emergency': return 'destructive';
      case 'promotion': return 'default';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'emergency': return <Zap className="h-4 w-4" />;
      case 'promotion': return <Zap className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={getAlertVariant(notification.type)} className={`${className}`}>
      <div className="flex items-start gap-2">
        {getAlertIcon(notification.type)}
        <div className="flex-1">
          <AlertDescription>
            <div className="font-semibold">{notification.title}</div>
            <div className="text-sm mt-1">{notification.message}</div>
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-2">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.type === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      console.log(`Action ${action.action} triggered`);
                      if (action.action === 'dismiss') {
                        onDismiss();
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
};

export default NotificationProvider;
