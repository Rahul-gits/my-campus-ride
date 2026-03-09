// Comprehensive API Service for all application endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIService {
  private static instance: APIService;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Get authentication token
  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  // Clear authentication token
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method with error handling
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    isFormData?: boolean
  ): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
    try {
      const headers: HeadersInit = {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      };

      const config: RequestInit = {
        method,
        headers: isFormData ? {} : { ...headers, 'Content-Type': 'application/json' },
      };

      if (isFormData && data) {
        config.body = data;
        if (headers.Authorization) {
          config.headers = { ...config.headers, Authorization: headers.Authorization };
        }
      } else if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
        config.headers = { ...headers, 'Content-Type': 'application/json' };
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Request failed',
          message: result.message || 'An error occurred'
        };
      }

      return {
        success: result.success ?? true,
        data: result.data,
        message: result.message
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // ===== AUTH ENDPOINTS =====
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('POST', '/auth/login', { email, password });
  }

  async register(username: string, email: string, password: string, role: string = 'student') {
    return this.request<{ token: string; user: any }>('POST', '/auth/register', {
      username,
      email,
      password,
      role
    });
  }

  async getCurrentUser() {
    return this.request<any>('GET', '/auth/me');
  }

  async updateProfile(profile: any) {
    return this.request<any>('PUT', '/auth/profile', { profile });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<any>('POST', '/auth/change-password', { currentPassword, newPassword });
  }

  // ===== BUS ENDPOINTS =====
  async getAllBuses() {
    return this.request<any[]>('GET', '/buses');
  }

  async getBusById(busId: string) {
    return this.request<any>('GET', `/buses/${busId}`);
  }

  async getBusesByRoute(routeId: string) {
    return this.request<any[]>('GET', `/buses/route/${routeId}`);
  }

  async getNearbyBuses(lat: number, lng: number, radius?: number) {
    const query = radius ? `?radius=${radius}` : '';
    return this.request<any[]>('GET', `/buses/near/${lat}/${lng}${query}`);
  }

  async createBus(busData: any) {
    return this.request<any>('POST', '/buses', busData);
  }

  async updateBus(busId: string, data: any) {
    return this.request<any>('PUT', `/buses/${busId}`, data);
  }

  async updateBusLocation(busId: string, lat: number, lng: number, address?: string, speed?: number, direction?: number) {
    return this.request<any>('POST', `/buses/${busId}/location`, {
      lat,
      lng,
      address,
      speed,
      direction
    });
  }

  async updateBusStatus(busId: string, status: string, speed?: number, direction?: number) {
    return this.request<any>('POST', `/buses/${busId}/status`, { status, speed, direction });
  }

  async deleteBus(busId: string) {
    return this.request<any>('DELETE', `/buses/${busId}`);
  }

  // ===== ROUTE ENDPOINTS =====
  async getAllRoutes() {
    return this.request<any[]>('GET', '/routes');
  }

  async getRouteById(routeId: string) {
    return this.request<any>('GET', `/routes/${routeId}`);
  }

  async createRoute(routeData: any) {
    return this.request<any>('POST', '/routes', routeData);
  }

  async updateRoute(routeId: string, data: any) {
    return this.request<any>('PUT', `/routes/${routeId}`, data);
  }

  async deleteRoute(routeId: string) {
    return this.request<any>('DELETE', `/routes/${routeId}`);
  }

  // ===== STOP ENDPOINTS =====
  async getAllStops() {
    return this.request<any[]>('GET', '/stops');
  }

  async getStopById(stopId: string) {
    return this.request<any>('GET', `/stops/${stopId}`);
  }

  async getNearbyStops(lat: number, lng: number, radius?: number) {
    const query = radius ? `?radius=${radius}` : '';
    return this.request<any[]>('GET', `/stops/near/${lat}/${lng}${query}`);
  }

  async createStop(stopData: any) {
    return this.request<any>('POST', '/stops', stopData);
  }

  async updateStop(stopId: string, data: any) {
    return this.request<any>('PUT', `/stops/${stopId}`, data);
  }

  async deleteStop(stopId: string) {
    return this.request<any>('DELETE', `/stops/${stopId}`);
  }

  // ===== TRACKING ENDPOINTS =====
  async getBusTrackingHistory(busId: string, startDate?: Date, endDate?: Date, limit?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>('GET', `/tracking/bus/${busId}${query}`);
  }

  async getLatestBusTracking(busId: string) {
    return this.request<any>('GET', `/tracking/bus/${busId}/latest`);
  }

  async getNearbyBusTracking(lat: number, lng: number, radius?: number) {
    const query = radius ? `?radius=${radius}` : '';
    return this.request<any[]>('GET', `/tracking/near/${lat}/${lng}${query}`);
  }

  async getRouteTracking(routeId: string) {
    return this.request<any[]>('GET', `/tracking/route/${routeId}`);
  }

  async simulateTracking(busId: string, lat: number, lng: number, status?: string, speed?: number) {
    return this.request<any>('POST', '/tracking/simulate', { busId, lat, lng, status, speed });
  }

  // ===== USER ENDPOINTS =====
  async getAllUsers(role?: string) {
    const query = role ? `?role=${role}` : '';
    return this.request<any[]>('GET', `/users${query}`);
  }

  async getUserById(userId: string) {
    return this.request<any>('GET', `/users/${userId}`);
  }

  async createUser(userData: any) {
    return this.request<any>('POST', '/users', userData);
  }

  async updateUser(userId: string, data: any) {
    return this.request<any>('PUT', `/users/${userId}`, data);
  }

  async deleteUser(userId: string) {
    return this.request<any>('DELETE', `/users/${userId}`);
  }

  // ===== BATCH OPERATIONS =====
  async uploadBusData(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<any>('POST', '/buses/import', formData, true);
  }

  // ===== UTILITY FUNCTIONS =====
  async getSystemHealth() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: 'Health check failed' };
    }
  }
}

export const apiService = APIService.getInstance();
export default apiService;