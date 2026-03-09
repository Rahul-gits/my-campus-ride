import type { Notification } from '@/components/NotificationSystem';

class SmartNotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  constructor() {
    this.loadFromStorage();
    this.setupPeriodicCleanup();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('campus-ride-notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
          readAt: n.readAt ? new Date(n.readAt) : undefined,
          scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
      this.notifications = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('campus-ride-notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private setupPeriodicCleanup() {
    // Clean up expired notifications every 5 minutes
    setInterval(() => {
      const now = new Date();
      this.notifications = this.notifications.filter(notification => {
        if (notification.expiresAt && notification.expiresAt < now) {
          return false;
        }
        return true;
      });
      this.saveToStorage();
      this.notifyListeners();
    }, 5 * 60 * 1000);
  }

  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners();

    // Send push notification if supported
    this.sendPushNotification(newNotification);

    return newNotification;
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.readAt = new Date();
      notification.updatedAt = new Date();
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  async markAllAsRead(): Promise<void> {
    const now = new Date();
    this.notifications.forEach(notification => {
      if (!notification.readAt) {
        notification.readAt = now;
        notification.updatedAt = now;
      }
    });
    this.saveToStorage();
    this.notifyListeners();
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  async clearAllNotifications(): Promise<void> {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  async getNotificationsByCategory(category: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.category === category);
  }

  async getNotificationsByPriority(priority: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.priority === priority);
  }

  async getUnreadCount(): Promise<number> {
    return this.notifications.filter(n => !n.readAt).length;
  }

  // Smart notification creation methods
  async createRouteDelayNotification(routeId: string, delayMinutes: number, busId?: string): Promise<Notification> {
    return this.addNotification({
      type: 'warning',
      priority: delayMinutes > 15 ? 'high' : 'medium',
      title: 'Route Delay',
      message: `Route ${routeId} is delayed by ${delayMinutes} minutes${busId ? ` (Bus ${busId})` : ''}`,
      category: 'route',
      routeId,
      busId,
      actions: [
        { id: 'track', label: 'Track Bus', action: 'track_bus', type: 'primary' },
        { id: 'alternative', label: 'Find Alternative', action: 'find_alternative', type: 'secondary' }
      ],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Expire in 30 minutes
    });
  }

  async createPaymentSuccessNotification(amount: number, passType: string): Promise<Notification> {
    return this.addNotification({
      type: 'success',
      priority: 'low',
      title: 'Payment Successful',
      message: `Your ${passType} payment of $${amount.toFixed(2)} has been processed successfully.`,
      category: 'payment',
      actions: [
        { id: 'receipt', label: 'View Receipt', action: 'view_receipt', type: 'primary' }
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire in 24 hours
    });
  }

  async createEmergencyAlertNotification(description: string, location?: any, busId?: string): Promise<Notification> {
    return this.addNotification({
      type: 'emergency',
      priority: 'critical',
      title: 'Emergency Alert',
      message: description,
      category: 'safety',
      location,
      busId,
      actions: [
        { id: 'respond', label: 'Respond', action: 'respond_emergency', type: 'danger' },
        { id: 'safe', label: 'Mark Safe', action: 'mark_safe', type: 'primary' }
      ],
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // Expire in 2 hours
    });
  }

  async createMaintenanceNotification(busId: string, maintenanceType: string, scheduledDate: Date): Promise<Notification> {
    return this.addNotification({
      type: 'info',
      priority: 'medium',
      title: 'Maintenance Scheduled',
      message: `Bus ${busId} is scheduled for ${maintenanceType} on ${scheduledDate.toLocaleDateString()}`,
      category: 'maintenance',
      busId,
      scheduledFor: scheduledDate,
      actions: [
        { id: 'view', label: 'View Details', action: 'view_maintenance', type: 'primary' }
      ],
      expiresAt: new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000) // Expire 24 hours after scheduled time
    });
  }

  async createPromotionNotification(title: string, message: string, discountPercent?: number): Promise<Notification> {
    return this.addNotification({
      type: 'promotion',
      priority: 'low',
      title,
      message,
      category: 'promotion',
      actions: [
        { id: 'claim', label: 'Claim Offer', action: 'claim_offer', type: 'primary' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
    });
  }

  async createRideReminderNotification(routeId: string, departureTime: Date): Promise<Notification> {
    return this.addNotification({
      type: 'info',
      priority: 'medium',
      title: 'Ride Reminder',
      message: `Your bus on Route ${routeId} departs in 10 minutes`,
      category: 'ride',
      routeId,
      scheduledFor: departureTime,
      actions: [
        { id: 'track', label: 'Track Bus', action: 'track_bus', type: 'primary' },
        { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' }
      ],
      expiresAt: new Date(departureTime.getTime() + 30 * 60 * 1000) // Expire 30 minutes after departure
    });
  }

  async createGamificationNotification(achievement: string, points: number): Promise<Notification> {
    return this.addNotification({
      type: 'success',
      priority: 'low',
      title: 'Achievement Unlocked!',
      message: `You've earned ${points} points for ${achievement}`,
      category: 'promotion',
      actions: [
        { id: 'view', label: 'View Profile', action: 'view_profile', type: 'primary' }
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expire in 24 hours
    });
  }

  // WebSocket integration
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const pushNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          tag: notification.id,
          requireInteraction: notification.priority === 'critical',
          silent: notification.priority === 'low'
        });

        pushNotification.onclick = () => {
          window.focus();
          pushNotification.close();
        };

        // Auto-close after 5 seconds for non-critical notifications
        if (notification.priority !== 'critical') {
          setTimeout(() => {
            pushNotification.close();
          }, 5000);
        }
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  // Analytics and insights
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const stats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.readAt).length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    this.notifications.forEach(notification => {
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }
}

export const smartNotificationService = new SmartNotificationService();