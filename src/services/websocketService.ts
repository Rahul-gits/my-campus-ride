import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnected = false;
  private messageQueue: any[] = [];

  constructor() {
    super();
    this.connect();
  }

  private connect() {
    // Attempt a soft connection only if a WS URL is configured; otherwise run in simulation mode
    const wsUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
    if (typeof window !== 'undefined' && wsUrl && 'WebSocket' in window) {
      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.emit('connected');
          this.processMessageQueue();
          this.startHeartbeat();
        };

        this.socket.onerror = () => {
          // Fall back to simulation silently
          this.isConnected = false;
          this.startHeartbeat();
        };

        this.socket.onclose = () => {
          this.isConnected = false;
        };
      } catch {
        // Fallback to simulation
        this.isConnected = false;
        this.startHeartbeat();
      }
    } else {
      // No WS URL or not supported: run in simulation mode without trying to connect
      this.isConnected = false;
      this.startHeartbeat();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection_failed');
    }
  }

  private startHeartbeat() {
    // Simulate periodic messages for demo
    setInterval(() => {
      if (this.isConnected) {
        this.simulateRealTimeUpdates();
      }
    }, 30000); // Every 30 seconds
  }

  private simulateRealTimeUpdates() {
    const updates = [
      {
        type: 'bus_location_update',
        data: {
          busId: 'BUS-001',
          location: { lat: 40.7128 + Math.random() * 0.01, lng: -74.0060 + Math.random() * 0.01 },
          speed: Math.floor(Math.random() * 50) + 10,
          passengers: Math.floor(Math.random() * 45),
          nextStop: 'Main Gate',
          eta: Math.floor(Math.random() * 10) + 2
        }
      },
      {
        type: 'route_status_update',
        data: {
          routeId: 'Route A',
          status: Math.random() > 0.8 ? 'delayed' : 'on_time',
          delay: Math.random() > 0.8 ? Math.floor(Math.random() * 15) + 5 : 0
        }
      },
      {
        type: 'passenger_count_update',
        data: {
          busId: 'BUS-002',
          passengers: Math.floor(Math.random() * 45),
          capacity: 45,
          occupancyRate: Math.floor(Math.random() * 100)
        }
      }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    this.emit(randomUpdate.type, randomUpdate.data);
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  send(data: any) {
    if (this.isConnected && this.socket) {
      try {
        this.socket.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messageQueue.push(data);
      }
    } else {
      this.messageQueue.push(data);
    }
  }

  // Simulate emergency alerts
  simulateEmergencyAlert() {
    const emergencyTypes = [
      {
        type: 'emergency_alert',
        data: {
          id: Date.now().toString(),
          type: 'medical',
          description: 'Medical emergency reported on Route B',
          location: { lat: 40.7128, lng: -74.0060, address: 'Main Campus' },
          busId: 'BUS-003',
          severity: 'high',
          timestamp: new Date()
        }
      },
      {
        type: 'emergency_alert',
        data: {
          id: Date.now().toString(),
          type: 'mechanical',
          description: 'Bus breakdown reported',
          location: { lat: 40.7128, lng: -74.0060, address: 'Downtown Stop' },
          busId: 'BUS-001',
          severity: 'medium',
          timestamp: new Date()
        }
      }
    ];

    const randomEmergency = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
    this.emit(randomEmergency.type, randomEmergency.data);
  }

  // Simulate route updates
  simulateRouteUpdate() {
    const routeUpdates = [
      {
        type: 'route_update',
        data: {
          routeId: 'Route A',
          status: 'delayed',
          message: 'Route A delayed due to traffic congestion',
          delay: 10,
          timestamp: new Date()
        }
      },
      {
        type: 'route_update',
        data: {
          routeId: 'Route B',
          status: 'on_time',
          message: 'Route B running on schedule',
          delay: 0,
          timestamp: new Date()
        }
      }
    ];

    const randomUpdate = routeUpdates[Math.floor(Math.random() * routeUpdates.length)];
    this.emit(randomUpdate.type, randomUpdate.data);
  }

  // Simulate maintenance alerts
  simulateMaintenanceAlert() {
    this.emit('maintenance_alert', {
      busId: 'BUS-002',
      type: 'scheduled',
      description: 'Scheduled maintenance due in 2 hours',
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      priority: 'medium'
    });
  }

  // Simulate payment notifications
  simulatePaymentNotification() {
    this.emit('payment_notification', {
      userId: 'user123',
      type: 'success',
      amount: 25.00,
      passType: 'Monthly Pass',
      transactionId: 'TXN-' + Date.now()
    });
  }

  // Simulate gamification updates
  simulateGamificationUpdate() {
    this.emit('gamification_update', {
      userId: 'user123',
      achievement: 'Eco-Friendly Rider',
      points: 50,
      badge: 'eco-badge',
      description: 'Completed 10 eco-friendly rides'
    });
  }

  // Simulate system notifications
  simulateSystemNotification() {
    const systemNotifications = [
      {
        type: 'system_maintenance',
        message: 'System maintenance scheduled for tonight at 2 AM',
        scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000)
      },
      {
        type: 'feature_update',
        message: 'New route tracking features are now available!',
        features: ['Real-time occupancy', 'Predictive arrival times']
      },
      {
        type: 'policy_update',
        message: 'Updated safety policies effective immediately',
        priority: 'high'
      }
    ];

    const randomNotification = systemNotifications[Math.floor(Math.random() * systemNotifications.length)];
    this.emit('system_notification', randomNotification);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Public methods for triggering demo events
  triggerEmergencyAlert() {
    this.simulateEmergencyAlert();
  }

  triggerRouteUpdate() {
    this.simulateRouteUpdate();
  }

  triggerMaintenanceAlert() {
    this.simulateMaintenanceAlert();
  }

  triggerPaymentNotification() {
    this.simulatePaymentNotification();
  }

  triggerGamificationUpdate() {
    this.simulateGamificationUpdate();
  }

  triggerSystemNotification() {
    this.simulateSystemNotification();
  }

  // Method to simulate all types of notifications for testing
  triggerAllNotifications() {
    setTimeout(() => this.simulateEmergencyAlert(), 1000);
    setTimeout(() => this.simulateRouteUpdate(), 2000);
    setTimeout(() => this.simulateMaintenanceAlert(), 3000);
    setTimeout(() => this.simulatePaymentNotification(), 4000);
    setTimeout(() => this.simulateGamificationUpdate(), 5000);
    setTimeout(() => this.simulateSystemNotification(), 6000);
  }
}

export const websocketService = new WebSocketService();