import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';

class WebSocketService extends EventEmitter {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageQueue: any[] = [];
  private token: string | null = null;

  constructor() {
    super();
    // Try to retrieve token from localStorage to auto-connect if possible
    try {
      const stored = localStorage.getItem('mcr_auth_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.token) {
          this.token = parsed.token;
        }
      }
    } catch (e) {
      console.error('Error loading token in WebSocketService constructor:', e);
    }
    
    this.connect(this.token || undefined);
  }

  connect(token?: string) {
    if (token) {
      this.token = token;
    } else {
      try {
        const stored = localStorage.getItem('mcr_auth_state');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.token) {
            this.token = parsed.token;
          }
        }
        if (!this.token) {
          this.token = localStorage.getItem('auth_token');
        }
      } catch (e) {}
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    // Connect to the backend Socket.IO port
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:5000';

    if (typeof window !== 'undefined' && 'WebSocket' in window) {
      try {
        console.log(`Connecting to Socket.IO server at ${wsUrl}...`);
        this.socket = io(wsUrl, {
          auth: {
            token: this.token
          },
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          this.emit('connected');
          this.processMessageQueue();
          console.log(`Socket.IO Connected! ID: ${this.socket?.id}`);
        });

        this.socket.on('connect_error', (error) => {
          console.warn('Socket.IO connection error:', error.message);
          this.isConnected = false;
          this.emit('disconnected');
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`Socket.IO disconnected. Reason: ${reason}`);
          this.isConnected = false;
          this.emit('disconnected');
        });

        // Forward all standard event updates from Socket.IO server to EventEmitter listeners
        this.socket.on('bus-location-update', (data) => {
          this.emit('bus_location_update', data);
        });

        this.socket.on('bus-status-update', (data) => {
          this.emit('bus_status_update', data);
          this.emit('passenger_count_update', data);
        });

        this.socket.on('route-update', (data) => {
          this.emit('route_update', data);
          this.emit('route_status_update', data);
        });

        this.socket.on('incident-report', (data) => {
          this.emit('incident_report', data);
          this.emit('emergency_alert', data);
        });

        this.socket.on('notification', (data) => {
          this.emit('notification', data);
          this.emit('system_notification', data);
        });

      } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
        this.isConnected = false;
        this.emit('disconnected');
      }
    } else {
      this.isConnected = false;
    }
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected && this.socket) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  send(data: any) {
    if (this.isConnected && this.socket) {
      try {
        if (data.type === 'subscribe_bus' || data.type === 'join-bus-tracking') {
          this.socket.emit('join-bus-tracking', data.busId);
        } else if (data.type === 'unsubscribe_bus' || data.type === 'leave-bus-tracking') {
          this.socket.emit('leave-bus-tracking', data.busId);
        } else if (data.type === 'subscribe_route' || data.type === 'join-route-tracking') {
          this.socket.emit('join-route-tracking', data.routeId);
        } else if (data.type === 'unsubscribe_route' || data.type === 'leave-route-tracking') {
          this.socket.emit('leave-route-tracking', data.routeId);
        } else if (data.type === 'driver-location-update') {
          this.socket.emit('driver-location-update', data.data);
        } else if (data.type === 'driver-incident') {
          this.socket.emit('driver-incident', data.data);
        } else {
          this.socket.send(data);
        }
      } catch (error) {
        console.error('Failed to send Socket.IO message:', error);
        this.messageQueue.push(data);
      }
    } else {
      this.messageQueue.push(data);
    }
  }

  // Socket.IO direct emit method
  emitEvent(eventName: string, data: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit(eventName, data);
    } else {
      this.messageQueue.push({ type: 'emit', eventName, data });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Public triggers to maintain demo interface support
  triggerEmergencyAlert() {
    this.emit('emergency_alert', {
      id: Date.now().toString(),
      type: 'mechanical',
      description: 'Breakdown reported on Route A',
      location: { lat: 17.3850, lng: 78.4867, address: 'Main Gate' },
      busId: 'BUS-001',
      severity: 'high',
      timestamp: new Date()
    });
  }

  triggerRouteUpdate() {
    this.emit('route_update', {
      routeId: 'route-1',
      status: 'delayed',
      message: 'Route delayed due to traffic',
      delay: 15,
      timestamp: new Date()
    });
  }

  triggerMaintenanceAlert() {
    this.emit('maintenance_alert', {
      busId: 'BUS-002',
      type: 'scheduled',
      description: 'Scheduled maintenance check',
      priority: 'medium'
    });
  }

  triggerPaymentNotification() {
    this.emit('payment_notification', {
      userId: 'user123',
      type: 'success',
      amount: 25.00,
      transactionId: 'TXN-' + Date.now()
    });
  }

  triggerGamificationUpdate() {
    this.emit('gamification_update', {
      achievement: 'Eco-Rider Badge',
      points: 100
    });
  }

  triggerSystemNotification() {
    this.emit('system_notification', {
      message: 'Scheduled server maintenance tonight'
    });
  }

  triggerAllNotifications() {
    this.triggerEmergencyAlert();
    this.triggerRouteUpdate();
  }
}

export const websocketService = new WebSocketService();
export default websocketService;