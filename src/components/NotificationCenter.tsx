import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Bus,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'bus_arrival' | 'delay' | 'route_change' | 'weather' | 'maintenance' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string;
    variant: 'default' | 'outline' | 'destructive';
  }>;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  busArrivalAlerts: boolean;
  delayAlerts: boolean;
  weatherAlerts: boolean;
  maintenanceAlerts: boolean;
  promotionAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'bus_arrival',
      title: '🚌 Bus Arriving Soon',
      message: 'Route A bus will arrive at Main Gate in 3 minutes',
      timestamp: new Date(Date.now() - 300000),
      read: false,
      priority: 'high',
      actions: [
        { label: 'Track Bus', action: 'track', variant: 'default' },
        { label: 'Set Reminder', action: 'reminder', variant: 'outline' }
      ]
    },
    {
      id: '2',
      type: 'delay',
      title: '⚠️ Route Delay Alert',
      message: 'Route B is experiencing 8-minute delays due to traffic congestion',
      timestamp: new Date(Date.now() - 600000),
      read: false,
      priority: 'medium',
      actions: [
        { label: 'Find Alternative', action: 'alternative', variant: 'default' },
        { label: 'Report Issue', action: 'report', variant: 'outline' }
      ]
    },
    {
      id: '3',
      type: 'weather',
      title: '🌧️ Weather Alert',
      message: 'Light rain expected - buses may run 2-3 minutes slower',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'route_change',
      title: '🔄 Route Update',
      message: 'Route C has been temporarily rerouted due to road construction',
      timestamp: new Date(Date.now() - 1200000),
      read: true,
      priority: 'medium',
      actions: [
        { label: 'View New Route', action: 'view_route', variant: 'default' }
      ]
    },
    {
      id: '5',
      type: 'promotion',
      title: '🎉 Special Offer',
      message: 'Get 20% off your next ride with promo code SAVE20',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      priority: 'low',
      actions: [
        { label: 'Use Code', action: 'use_code', variant: 'default' }
      ]
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    busArrivalAlerts: true,
    delayAlerts: true,
    weatherAlerts: true,
    maintenanceAlerts: false,
    promotionAlerts: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00'
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ['bus_arrival', 'delay', 'weather', 'promotion'][Math.floor(Math.random() * 4)] as any,
        title: '🚌 New Bus Update',
        message: 'Real-time update: Bus location and ETA refreshed',
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      };

      setNotifications(prev => [newNotification, ...prev]);
      
      // Simulate notification sound
      if (settings.soundEnabled) {
        playNotificationSound();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings.soundEnabled]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Simulate device status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1);
      setBatteryLevel(Math.max(10, Math.min(100, batteryLevel + (Math.random() * 4 - 2))));
      setSignalStrength(Math.max(1, Math.min(5, signalStrength + (Math.random() * 2 - 1))));
    }, 15000);

    return () => clearInterval(interval);
  }, [batteryLevel, signalStrength]);

  const playNotificationSound = () => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    console.log(`Notification ${id} marked as read`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    console.log("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log(`Notification ${id} deleted`);
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log(`Action ${action} triggered for notification ${notificationId}`);
    switch (action) {
      case 'track':
        console.log("Opening bus tracking...");
        break;
      case 'route':
        console.log("Opening route details...");
        break;
      case 'dismiss':
        deleteNotification(notificationId);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const addTestNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'bus_arrival',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working',
      timestamp: new Date(),
      read: false,
      priority: 'medium',
      actions: [
        { label: 'Test Action', action: 'test', variant: 'default' },
        { label: 'Dismiss', action: 'dismiss', variant: 'outline' }
      ]
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bus_arrival': return <Bus className="h-4 w-4 text-green-500" />;
      case 'delay': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'route_change': return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'weather': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-gray-500" />;
      case 'promotion': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-500" />
            Notification Center
          </h1>
          <p className="text-muted-foreground">Stay updated with real-time alerts and notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-500" />
            Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm">Network: {isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-green-500" />
              <span className="text-sm">Battery: {batteryLevel}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-green-500" />
              <span className="text-sm">Signal: {signalStrength}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-green-500" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
              <span className="text-sm">Sound: {settings.soundEnabled ? 'On' : 'Off'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-500" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Delivery Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <Switch
                    id="push"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <Switch
                    id="email"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Notifications
                  </Label>
                  <Switch
                    id="sms"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Alert Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bus-arrival">Bus Arrival Alerts</Label>
                  <Switch
                    id="bus-arrival"
                    checked={settings.busArrivalAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, busArrivalAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="delay">Delay Alerts</Label>
                  <Switch
                    id="delay"
                    checked={settings.delayAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, delayAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather">Weather Alerts</Label>
                  <Switch
                    id="weather"
                    checked={settings.weatherAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, weatherAlerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance">Maintenance Alerts</Label>
                  <Switch
                    id="maintenance"
                    checked={settings.maintenanceAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceAlerts: checked})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">Sound Enabled</Label>
                  <Switch
                    id="sound"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, soundEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vibration">Vibration Enabled</Label>
                  <Switch
                    id="vibration"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, vibrationEnabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => setSettings({...settings, quietHours: {...settings.quietHours, enabled: checked}})}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Recent Notifications
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" onClick={() => setNotifications([])}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          {notification.actions?.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant}
                              size="sm"
                              onClick={() => handleNotificationAction(notification.id, action.action)}
                            >
                              {action.label}
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {notification.read ? 'Mark Unread' : 'Mark Read'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Test Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const testNotification: Notification = {
                  id: Date.now().toString(),
                  type: 'bus_arrival',
                  title: '🚌 Test Bus Alert',
                  message: 'This is a test notification for bus arrival',
                  timestamp: new Date(),
                  read: false,
                  priority: 'high'
                };
                setNotifications(prev => [testNotification, ...prev]);
                if (settings.soundEnabled) playNotificationSound();
              }}
            >
              Test Bus Alert
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const testNotification: Notification = {
                  id: Date.now().toString(),
                  type: 'delay',
                  title: '⚠️ Test Delay Alert',
                  message: 'This is a test notification for route delays',
                  timestamp: new Date(),
                  read: false,
                  priority: 'medium'
                };
                setNotifications(prev => [testNotification, ...prev]);
                if (settings.soundEnabled) playNotificationSound();
              }}
            >
              Test Delay Alert
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const testNotification: Notification = {
                  id: Date.now().toString(),
                  type: 'weather',
                  title: '🌧️ Test Weather Alert',
                  message: 'This is a test notification for weather updates',
                  timestamp: new Date(),
                  read: false,
                  priority: 'low'
                };
                setNotifications(prev => [testNotification, ...prev]);
                if (settings.soundEnabled) playNotificationSound();
              }}
            >
              Test Weather Alert
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const testNotification: Notification = {
                  id: Date.now().toString(),
                  type: 'promotion',
                  title: '🎉 Test Promotion',
                  message: 'This is a test notification for promotions',
                  timestamp: new Date(),
                  read: false,
                  priority: 'low'
                };
                setNotifications(prev => [testNotification, ...prev]);
                if (settings.soundEnabled) playNotificationSound();
              }}
            >
              Test Promotion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
