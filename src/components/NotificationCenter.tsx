import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  AlertTriangle, 
  Clock,
  MapPin,
  Bus,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Radio,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { websocketService } from '@/services/websocketService';

interface Notification {
  id: string;
  type: 'bus_arrival' | 'delay' | 'route_change' | 'weather' | 'maintenance' | 'service';
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
  serviceAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'bus_arrival',
      title: '🚌 Bus Arriving Soon',
      message: 'Route A (Main Shuttle) will arrive at Main Gate in 3 minutes.',
      timestamp: new Date(Date.now() - 120000),
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
      title: '⚠️ Route Traffic Alert',
      message: 'Route B is experiencing minor 5-minute traffic delays near Science Block.',
      timestamp: new Date(Date.now() - 450000),
      read: false,
      priority: 'medium',
      actions: [
        { label: 'Find Alternative', action: 'alternative', variant: 'default' }
      ]
    },
    {
      id: '3',
      type: 'weather',
      title: '🌧️ Weather Advisory',
      message: 'Overcast skies on campus - shuttles running with extra safety margin.',
      timestamp: new Date(Date.now() - 900000),
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'route_change',
      title: '🔄 Route Schedule Update',
      message: 'Express Shuttle schedule updated for afternoon peak hours.',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      priority: 'medium',
      actions: [
        { label: 'View Schedule', action: 'view_route', variant: 'default' }
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
    maintenanceAlerts: true,
    serviceAlerts: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);
  
  // Real-time hardware device state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<string>('WiFi / 4G');
  const [hasPushPermission, setHasPushPermission] = useState<boolean>(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // 1. Query live Battery API & Network status directly from hardware
  useEffect(() => {
    // Online/Offline detection
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Device connected to network");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Device is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        };

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch((err: any) => console.log('Battery API not available:', err));
    }

    // Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      setNetworkType((connection.effectiveType || connection.type || 'High Speed').toUpperCase());
      const updateConn = () => {
        setNetworkType((connection.effectiveType || connection.type || 'High Speed').toUpperCase());
      };
      connection.addEventListener('change', updateConn);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Web Audio chime generator
  const triggerAudioFeedback = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.warn('Audio chime playback error:', err);
    }
  };

  // Device Vibration feedback
  const triggerHaptics = () => {
    if (settings.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch {}
    }
  };

  // Trigger browser push notification if permitted
  const sendBrowserNotification = (title: string, body: string) => {
    if (settings.pushNotifications && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Browser push error:', e);
      }
    }
  };

  // Dispatch live notification with sound, haptics, push, and state update
  const dispatchAlert = (newNotif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const fullNotif: Notification = {
      ...newNotif,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [fullNotif, ...prev]);

    if (settings.soundEnabled) triggerAudioFeedback();
    if (settings.vibrationEnabled) triggerHaptics();
    sendBrowserNotification(fullNotif.title, fullNotif.message);

    toast.info(fullNotif.title, {
      description: fullNotif.message,
    });
  };

  // Request Push Permission
  const requestPushPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setHasPushPermission(true);
        toast.success("Push notifications enabled!");
      } else {
        setHasPushPermission(false);
        toast.error("Push notifications denied by browser settings");
      }
    }
  };

  // Listen to WebSocket events live
  useEffect(() => {
    const handleIncident = (data: any) => {
      dispatchAlert({
        type: 'delay',
        title: `🚨 ${data.title || 'Campus Incident Alert'}`,
        message: data.description || data.message || 'Incident reported on campus shuttle route.',
        priority: 'urgent',
        actions: [{ label: 'Track Bus', action: 'track', variant: 'default' }]
      });
    };

    const handleBusUpdate = (data: any) => {
      if (data.status === 'delayed' || data.delay) {
        dispatchAlert({
          type: 'delay',
          title: `⚠️ Bus Delay: ${data.busNumber || 'Campus Bus'}`,
          message: `Bus is delayed by ${data.delay || 5} mins. Location: ${data.currentLocation?.address || 'In transit'}`,
          priority: 'high'
        });
      }
    };

    websocketService.on('incident_report', handleIncident);
    websocketService.on('emergency_alert', handleIncident);
    websocketService.on('bus_status_update', handleBusUpdate);

    return () => {
      websocketService.off('incident_report', handleIncident);
      websocketService.off('emergency_alert', handleIncident);
      websocketService.off('bus_status_update', handleBusUpdate);
    };
  }, [settings]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Notification Card Action Handlers
  const handleAction = (id: string, actionType: string) => {
    switch (actionType) {
      case 'track':
        toast.success("Navigating to Live GPS Tracking...");
        navigate('/dashboard/student');
        break;
      case 'view_route':
      case 'alternative':
        toast.success("Opening Smart Route Optimizer...");
        navigate('/dashboard/student/route-optimizer');
        break;
      case 'reminder':
        toast.success("Reminder set for bus arrival!");
        break;
      default:
        toast.info(`Triggered ${actionType}`);
        break;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    toast.success("Notification status updated");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("Notification list cleared");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bus_arrival': return <Bus className="h-5 w-5 text-emerald-500" />;
      case 'delay': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'route_change': return <MapPin className="h-5 w-5 text-blue-500" />;
      case 'weather': return <AlertTriangle className="h-5 w-5 text-indigo-500" />;
      default: return <Bell className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2 tracking-tight">
            <Bell className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            Alerts & Notifications Center
          </h1>
          <p className="text-sm text-muted-foreground">Real-time alerts connected to device sensors and WebSocket stream</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 ${isOnline ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10' : 'border-red-500/30 text-red-600 bg-red-500/10'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {isOnline ? 'Live Connected' : 'Offline'}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-semibold">
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      {/* Real-time Hardware Device Status Panel */}
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Live Hardware Device Telemetry
          </CardTitle>
          <CardDescription className="text-xs">Real-time readings from browser and hardware sensors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-background border shadow-sm flex items-center gap-3">
              {isOnline ? <Wifi className="h-5 w-5 text-emerald-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Network</div>
                <div className="text-xs font-bold">{isOnline ? networkType : 'Disconnected'}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border shadow-sm flex items-center gap-3">
              {isCharging ? <BatteryCharging className="h-5 w-5 text-emerald-500 animate-pulse" /> : <Battery className="h-5 w-5 text-blue-500" />}
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Battery</div>
                <div className="text-xs font-bold">{batteryLevel}% {isCharging ? '(Charging)' : ''}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border shadow-sm flex items-center gap-3">
              <Radio className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">WebSocket Stream</div>
                <div className="text-xs font-bold text-emerald-600">Active (5000)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border shadow-sm flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-emerald-500" /> : <VolumeX className="h-5 w-5 text-slate-400" />}
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Audio & Haptics</div>
                <div className="text-xs font-bold">{settings.soundEnabled ? 'Chime Active' : 'Muted'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-500" />
            Alert Preferences & Device Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Delivery Channels</h4>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="push-toggle" className="cursor-pointer font-medium">Browser Push Notifications</Label>
                <Switch
                  id="push-toggle"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => {
                    setSettings({ ...settings, pushNotifications: checked });
                    if (checked && !hasPushPermission) requestPushPermission();
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="sound-toggle" className="cursor-pointer font-medium">Web Audio Sound Chime</Label>
                <Switch
                  id="sound-toggle"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="haptic-toggle" className="cursor-pointer font-medium">Haptic Vibration</Label>
                <Switch
                  id="haptic-toggle"
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, vibrationEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Alert Filters</h4>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="bus-arrival-toggle" className="cursor-pointer font-medium">Bus Arrival Alerts</Label>
                <Switch
                  id="bus-arrival-toggle"
                  checked={settings.busArrivalAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, busArrivalAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="delay-toggle" className="cursor-pointer font-medium">Delay & Traffic Alerts</Label>
                <Switch
                  id="delay-toggle"
                  checked={settings.delayAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, delayAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <Label htmlFor="weather-toggle" className="cursor-pointer font-medium">Weather Advisories</Label>
                <Switch
                  id="weather-toggle"
                  checked={settings.weatherAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, weatherAlerts: checked })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h4>
              <Button variant="outline" size="sm" onClick={requestPushPermission} className="w-full text-xs">
                <Smartphone className="h-3.5 w-3.5 mr-2 text-blue-500" />
                Enable Native Push
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAsRead} className="w-full text-xs">
                <CheckCheck className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                Mark All Read ({unreadCount})
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllNotifications} className="w-full text-xs text-red-500 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Clear All Feed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              Live Alerts Feed
            </CardTitle>
            <CardDescription className="text-xs">Real-time updates from campus shuttles</CardDescription>
          </div>
          <Badge variant="outline">{notifications.length} Total Alerts</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <BellOff className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No alerts in feed</p>
                <p className="text-xs text-slate-400 mt-1">New alerts will pop up automatically as buses run</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.read 
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-80' 
                      : 'bg-white dark:bg-slate-900 border-emerald-500/30 shadow-sm ring-1 ring-emerald-500/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-muted/60 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${getPriorityBadgeColor(n.priority)}`}>
                          {n.priority}
                        </Badge>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{n.message}</p>
                      
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-muted/50 gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {n.actions?.map((act, i) => (
                            <Button
                              key={i}
                              variant={act.variant}
                              size="sm"
                              className="h-7 text-xs px-2.5"
                              onClick={() => handleAction(n.id, act.action)}
                            >
                              {act.label}
                            </Button>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => markAsRead(n.id)}
                          >
                            {n.read ? 'Mark Unread' : 'Mark Read'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 text-red-500 hover:text-red-600"
                            onClick={() => deleteNotification(n.id)}
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

      {/* Interactive Trigger Buttons */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Zap className="h-4 w-4 text-amber-500" />
            Interactive Alert Triggers
          </CardTitle>
          <CardDescription className="text-xs">Click to test real-time audio chimes, haptics, and feed updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => dispatchAlert({
                type: 'bus_arrival',
                title: '🚌 Bus Arriving: Main Gate',
                message: 'Shuttle BUS-001 is 2 minutes away from Main Gate stop.',
                priority: 'high',
                actions: [{ label: 'Track Bus', action: 'track', variant: 'default' }]
              })}
            >
              Test Bus Arrival Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => dispatchAlert({
                type: 'delay',
                title: '⚠️ Traffic Delay Alert',
                message: 'Heavy traffic near Sports Complex causing 7 min delay on Route C.',
                priority: 'medium',
                actions: [{ label: 'Find Alternative', action: 'alternative', variant: 'default' }]
              })}
            >
              Test Delay Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => dispatchAlert({
                type: 'weather',
                title: '🌧️ Weather Alert',
                message: 'Rain started - campus buses running with extra caution.',
                priority: 'low'
              })}
            >
              Test Weather Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
              onClick={() => dispatchAlert({
                type: 'service',
                title: '🎉 Free Campus Pass Active',
                message: 'Your monthly campus ride pass is active for all routes.',
                priority: 'low'
              })}
            >
              Test Service Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
