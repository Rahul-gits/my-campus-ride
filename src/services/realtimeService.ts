import { websocketService } from './websocketService';
import { apiService } from './apiService';

/**
 * Real-time Service for handling live location updates, notifications, and data synchronization
 * Integrates WebSocket service with API calls for seamless real-time experience
 */
class RealtimeService {
  private static instance: RealtimeService;
  private listeners: Map<string, Function[]> = new Map();
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.setupWebSocketListeners();
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  private setupWebSocketListeners() {
    // Bus location updates
    websocketService.on('bus_location_update', (data) => {
      this.emit('bus_location_update', data);
    });

    // Route status updates
    websocketService.on('route_status_update', (data) => {
      this.emit('route_status_update', data);
    });

    // Passenger count updates
    websocketService.on('passenger_count_update', (data) => {
      this.emit('passenger_count_update', data);
    });

    // Emergency alerts
    websocketService.on('emergency_alert', (data) => {
      this.emit('emergency_alert', data);
    });

    // Maintenance alerts
    websocketService.on('maintenance_alert', (data) => {
      this.emit('maintenance_alert', data);
    });

    // Connection events
    websocketService.on('connected', () => {
      this.emit('connected', { status: 'connected' });
      this.startHealthCheck();
    });

    websocketService.on('disconnected', () => {
      this.emit('disconnected', { status: 'disconnected' });
    });
  }

  // Subscribe to real-time events
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit events to subscribers
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Start live bus tracking
  startLiveBusTracking(busId: string) {
    this.emit('tracking_started', { busId });
    websocketService.send({
      type: 'subscribe_bus',
      busId
    });
  }

  // Stop live bus tracking
  stopLiveBusTracking(busId: string) {
    this.emit('tracking_stopped', { busId });
    websocketService.send({
      type: 'unsubscribe_bus',
      busId
    });
  }

  // Subscribe to route updates
  subscribeToRoute(routeId: string) {
    websocketService.send({
      type: 'subscribe_route',
      routeId
    });
  }

  // Unsubscribe from route updates
  unsubscribeFromRoute(routeId: string) {
    websocketService.send({
      type: 'unsubscribe_route',
      routeId
    });
  }

  // Send real-time location update
  async updateBusLocation(busId: string, lat: number, lng: number, speed?: number) {
    try {
      const result = await apiService.updateBusLocation(busId, lat, lng, undefined, speed);
      if (result.success) {
        this.emit('location_updated', { busId, lat, lng, speed });
      }
      return result;
    } catch (error) {
      console.error('Error updating bus location:', error);
      throw error;
    }
  }

  // Send real-time status update
  async updateBusStatus(busId: string, status: string) {
    try {
      const result = await apiService.updateBusStatus(busId, status);
      if (result.success) {
        this.emit('status_updated', { busId, status });
      }
      return result;
    } catch (error) {
      console.error('Error updating bus status:', error);
      throw error;
    }
  }

  // Fetch latest bus data with real-time sync
  async fetchBusesWithRealtime(routeId?: string) {
    try {
      let result;
      if (routeId) {
        result = await apiService.getBusesByRoute(routeId);
      } else {
        result = await apiService.getAllBuses();
      }
      if (result.success) {
        this.emit('buses_fetched', result.data);
      }
      return result;
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  }

  // Health check for connection
  private startHealthCheck() {
    this.updateInterval = setInterval(() => {
      if (!websocketService.isSocketConnected()) {
        this.emit('connection_lost', { timestamp: new Date() });
      }
    }, 30000); // Check every 30 seconds
  }

  // Clean up
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.listeners.clear();
  }

  // Manually trigger real-time simulations for demo
  triggerDemoUpdates() {
    websocketService.triggerAllNotifications();
  }
}

export const realtimeService = RealtimeService.getInstance();
export default realtimeService;
