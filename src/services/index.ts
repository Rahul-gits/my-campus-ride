// Core Services
export { default as websocketService } from './websocketService';
export { default as paymentService } from './paymentService';
export { default as analyticsService } from './analyticsService';
export { default as smartNotificationService } from './smartNotificationService';
export { default as routeOptimizationService } from './routeOptimizationService';
export { default as emergencySafetyService } from './emergencySafetyService';
export { default as gamificationService } from './gamificationService';
export { default as accessibilityService } from './accessibilityService';
export { default as pwaService } from './pwaService';
export { default as aiFeaturesService } from './aiFeaturesService';

// Service Types
export type {
  BusLocationUpdate,
  RouteUpdate,
  NotificationUpdate,
  EmergencyAlert,
} from './websocketService';

export type {
  PaymentMethod,
  Transaction,
  RidePass,
  Wallet,
  PaymentRequest,
} from './paymentService';

export type {
  AnalyticsData,
  ReportConfig,
  PredictiveData,
} from './analyticsService';

export type {
  SmartNotification,
  NotificationPreferences,
  NotificationTemplate,
} from './smartNotificationService';

export type {
  RouteOptimization,
  TrafficData,
  DemandForecast,
  DynamicRoute,
  RoutePerformance,
} from './routeOptimizationService';

export type {
  SafetyReport,
  EmergencyContact,
  SafetyProtocol,
} from './emergencySafetyService';

export type {
  UserAchievement,
  Achievement,
  UserProfile,
  LeaderboardEntry,
  Challenge,
  ReferralProgram,
} from './gamificationService';

export type {
  AccessibilityFeature,
  AccessibilityProfile,
  AccessibilityAudit,
  AccessibilityReport,
  VoiceCommand,
} from './accessibilityService';

export type {
  PWAConfig,
  OfflineData,
  PushNotification,
  BackgroundSync,
} from './pwaService';

export type {
  AIInsight,
  PredictiveModel,
  ChatMessage,
  ChatSession,
  PersonalizedRecommendation,
  AnomalyDetection,
} from './aiFeaturesService';

// Service Manager Class
class ServiceManager {
  private services: Map<string, any> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    // Register all services
    this.services.set('websocket', websocketService);
    this.services.set('payment', paymentService);
    this.services.set('analytics', analyticsService);
    this.services.set('notifications', smartNotificationService);
    this.services.set('routeOptimization', routeOptimizationService);
    this.services.set('emergency', emergencySafetyService);
    this.services.set('gamification', gamificationService);
    this.services.set('accessibility', accessibilityService);
    this.services.set('pwa', pwaService);
    this.services.set('ai', aiFeaturesService);

    this.initialized = true;
  }

  getService<T>(name: string): T {
    if (!this.initialized) {
      throw new Error('Services not initialized');
    }
    
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    
    return service as T;
  }

  async initializeAllServices(): Promise<void> {
    try {
      // Initialize WebSocket connection
      const token = localStorage.getItem('token');
      if (token) {
        websocketService.connect(token);
      }

      // Initialize PWA
      await pwaService.registerServiceWorker();

      // Initialize accessibility
      accessibilityService.setupARIA();
      accessibilityService.setupKeyboardNavigation();

      // Load user preferences
      const profile = await accessibilityService.getAccessibilityProfile();
      accessibilityService.updateAccessibilityProfile(profile);

      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Disconnect WebSocket
      websocketService.disconnect();

      // Clear caches
      await pwaService.clearCache();

      console.log('Services cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup services:', error);
    }
  }

  // Service health check
  async healthCheck(): Promise<{
    services: Record<string, { status: 'healthy' | 'unhealthy'; error?: string }>;
    overall: 'healthy' | 'unhealthy';
  }> {
    const results: Record<string, { status: 'healthy' | 'unhealthy'; error?: string }> = {};
    
    for (const [name, service] of this.services) {
      try {
        // Basic health check for each service
        if (name === 'websocket') {
          results[name] = { status: websocketService.isConnected() ? 'healthy' : 'unhealthy' };
        } else if (name === 'pwa') {
          results[name] = { status: 'healthy' }; // PWA service is always healthy
        } else {
          results[name] = { status: 'healthy' };
        }
      } catch (error) {
        results[name] = { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    const overall = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

    return { services: results, overall };
  }
}

// Export singleton instance
export const serviceManager = new ServiceManager();

// Export individual services for direct access
export {
  websocketService,
  paymentService,
  analyticsService,
  smartNotificationService,
  routeOptimizationService,
  emergencySafetyService,
  gamificationService,
  accessibilityService,
  pwaService,
  aiFeaturesService,
};

// Utility functions
export const serviceUtils = {
  // Format currency
  formatCurrency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format distance
  formatDistance: (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance.toFixed(0)} m`;
  },

  // Format duration
  formatDuration: (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  // Format percentage
  formatPercentage: (value: number) => {
    return `${value.toFixed(1)}%`;
  },

  // Get status color
  getStatusColor: (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'failed':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'info':
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Generate unique ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

export default serviceManager;
