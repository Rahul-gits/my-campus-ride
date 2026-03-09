export interface RouteOptimization {
  id: string;
  routeId: string;
  currentRoute: {
    stops: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      order: number;
    }>;
    totalDistance: number;
    estimatedDuration: number;
    efficiency: number;
  };
  optimizedRoute: {
    stops: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      order: number;
    }>;
    totalDistance: number;
    estimatedDuration: number;
    efficiency: number;
  };
  improvements: {
    distanceSaved: number;
    timeSaved: number;
    efficiencyGain: number;
    fuelSaved: number;
    co2Reduced: number;
  };
  algorithm: 'genetic' | 'simulated_annealing' | 'ant_colony' | 'neural_network';
  confidence: number;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TrafficData {
  routeId: string;
  segmentId: string;
  currentSpeed: number;
  averageSpeed: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  delay: number; // in minutes
  timestamp: Date;
  weatherImpact: number;
  eventImpact: number;
}

export interface DemandForecast {
  routeId: string;
  stopId: string;
  date: string;
  hour: number;
  predictedDemand: number;
  confidence: number;
  factors: {
    weather: number;
    events: number;
    historical: number;
    seasonality: number;
  };
}

export interface DynamicRoute {
  id: string;
  name: string;
  baseRoute: string;
  variations: Array<{
    id: string;
    name: string;
    stops: string[];
    conditions: {
      timeOfDay?: { start: string; end: string };
      dayOfWeek?: number[];
      weather?: string[];
      events?: string[];
    };
    priority: number;
  }>;
  isActive: boolean;
  lastUpdated: Date;
}

export interface RoutePerformance {
  routeId: string;
  metrics: {
    onTimePerformance: number;
    averageSpeed: number;
    fuelEfficiency: number;
    passengerSatisfaction: number;
    utilizationRate: number;
  };
  trends: {
    performance: Array<{ date: string; value: number }>;
    demand: Array<{ date: string; value: number }>;
    efficiency: Array<{ date: string; value: number }>;
  };
  recommendations: Array<{
    type: 'schedule' | 'route' | 'capacity' | 'maintenance';
    priority: 'low' | 'medium' | 'high';
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

class RouteOptimizationService {
  private baseUrl = '/api/route-optimization';

  // Route optimization
  async optimizeRoute(routeId: string, options: {
    algorithm?: 'genetic' | 'simulated_annealing' | 'ant_colony' | 'neural_network';
    constraints?: {
      maxStops?: number;
      maxDistance?: number;
      timeWindows?: Array<{ stopId: string; start: string; end: string }>;
    };
    objectives?: Array<'distance' | 'time' | 'fuel' | 'passenger_satisfaction'>;
  } = {}): Promise<RouteOptimization> {
    const response = await fetch(`${this.baseUrl}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ routeId, ...options }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to optimize route');
    }
    
    return response.json();
  }

  async getOptimizationHistory(routeId: string): Promise<RouteOptimization[]> {
    const response = await fetch(`${this.baseUrl}/history/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch optimization history');
    }
    
    return response.json();
  }

  async applyOptimization(optimizationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/apply/${optimizationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to apply optimization');
    }
  }

  // Traffic data
  async getTrafficData(routeId: string): Promise<TrafficData[]> {
    const response = await fetch(`${this.baseUrl}/traffic/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch traffic data');
    }
    
    return response.json();
  }

  async getRealTimeTraffic(routeId: string): Promise<TrafficData> {
    const response = await fetch(`${this.baseUrl}/traffic/${routeId}/realtime`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch real-time traffic data');
    }
    
    return response.json();
  }

  // Demand forecasting
  async getDemandForecast(routeId: string, days = 7): Promise<DemandForecast[]> {
    const response = await fetch(`${this.baseUrl}/demand-forecast/${routeId}?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch demand forecast');
    }
    
    return response.json();
  }

  async updateDemandForecast(routeId: string, data: {
    stopId: string;
    actualDemand: number;
    timestamp: Date;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/demand-forecast/${routeId}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update demand forecast');
    }
  }

  // Dynamic routing
  async getDynamicRoutes(): Promise<DynamicRoute[]> {
    const response = await fetch(`${this.baseUrl}/dynamic-routes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dynamic routes');
    }
    
    return response.json();
  }

  async createDynamicRoute(route: Omit<DynamicRoute, 'id' | 'lastUpdated'>): Promise<DynamicRoute> {
    const response = await fetch(`${this.baseUrl}/dynamic-routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(route),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create dynamic route');
    }
    
    return response.json();
  }

  async updateDynamicRoute(id: string, updates: Partial<DynamicRoute>): Promise<DynamicRoute> {
    const response = await fetch(`${this.baseUrl}/dynamic-routes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update dynamic route');
    }
    
    return response.json();
  }

  async getOptimalRoute(origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }, options: {
    time?: string;
    preferences?: Array<'fastest' | 'shortest' | 'scenic' | 'accessible'>;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  } = {}): Promise<{
    route: Array<{ latitude: number; longitude: number }>;
    distance: number;
    duration: number;
    instructions: Array<{
      instruction: string;
      distance: number;
      duration: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/optimal-route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ origin, destination, ...options }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get optimal route');
    }
    
    return response.json();
  }

  // Route performance
  async getRoutePerformance(routeId: string): Promise<RoutePerformance> {
    const response = await fetch(`${this.baseUrl}/performance/${routeId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch route performance');
    }
    
    return response.json();
  }

  async getPerformanceComparison(routeIds: string[]): Promise<Array<{
    routeId: string;
    metrics: RoutePerformance['metrics'];
    ranking: number;
  }>> {
    const response = await fetch(`${this.baseUrl}/performance/comparison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ routeIds }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance comparison');
    }
    
    return response.json();
  }

  // Alternative routes
  async getAlternativeRoutes(routeId: string, options: {
    maxAlternatives?: number;
    maxDistanceIncrease?: number;
    maxTimeIncrease?: number;
  } = {}): Promise<Array<{
    id: string;
    name: string;
    stops: string[];
    distance: number;
    duration: number;
    efficiency: number;
    advantages: string[];
    disadvantages: string[];
  }>> {
    const response = await fetch(`${this.baseUrl}/alternatives/${routeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(options),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch alternative routes');
    }
    
    return response.json();
  }

  // Route suggestions
  async getRouteSuggestions(userId: string, preferences: {
    frequentRoutes?: string[];
    timePreferences?: Array<{ day: string; time: string }>;
    distancePreferences?: 'short' | 'medium' | 'long';
    accessibilityNeeds?: string[];
  }): Promise<Array<{
    routeId: string;
    name: string;
    matchScore: number;
    reasons: string[];
    estimatedSavings: {
      time: number;
      distance: number;
      cost: number;
    };
  }>> {
    const response = await fetch(`${this.baseUrl}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, preferences }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch route suggestions');
    }
    
    return response.json();
  }

  // Utility functions
  calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  calculateEfficiency(distance: number, time: number, passengers: number): number {
    // Efficiency = passengers / (distance * time)
    return passengers / (distance * time);
  }

  formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance.toFixed(0)} m`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  getCongestionColor(level: string): string {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'severe': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getCongestionIcon(level: string): string {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'severe': return '🔴';
      default: return '⚪';
    }
  }

  // Analytics
  async getOptimizationStats(): Promise<{
    totalOptimizations: number;
    averageImprovement: number;
    totalSavings: {
      distance: number;
      time: number;
      fuel: number;
      co2: number;
    };
    topPerformingRoutes: Array<{
      routeId: string;
      improvement: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch optimization stats');
    }
    
    return response.json();
  }
}

export const routeOptimizationService = new RouteOptimizationService();
export default routeOptimizationService;
