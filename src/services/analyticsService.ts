export interface AnalyticsData {
  overview: {
    totalRides: number;
    totalRevenue: number;
    activeUsers: number;
    fleetUtilization: number;
    onTimePerformance: number;
    customerSatisfaction: number;
  };
  trends: {
    daily: Array<{ date: string; rides: number; revenue: number }>;
    weekly: Array<{ week: string; rides: number; revenue: number }>;
    monthly: Array<{ month: string; rides: number; revenue: number }>;
  };
  routes: Array<{
    routeId: string;
    name: string;
    popularity: number;
    revenue: number;
    averageRating: number;
    peakHours: string[];
  }>;
  users: {
    demographics: {
      students: number;
      faculty: number;
      staff: number;
    };
    behavior: {
      averageRidesPerUser: number;
      peakUsageHours: string[];
      mostPopularRoutes: string[];
    };
  };
  fleet: {
    utilization: Array<{
      busId: string;
      utilization: number;
      revenue: number;
      maintenanceCost: number;
    }>;
    performance: {
      averageSpeed: number;
      fuelEfficiency: number;
      maintenanceFrequency: number;
    };
  };
  environmental: {
    carbonFootprint: number;
    fuelConsumption: number;
    emissionsSaved: number;
  };
}

export interface ReportConfig {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
  includeCharts: boolean;
  includeDetails: boolean;
  format: 'pdf' | 'excel' | 'csv';
}

export interface PredictiveData {
  demandForecast: Array<{
    date: string;
    predictedRides: number;
    confidence: number;
  }>;
  maintenanceSchedule: Array<{
    busId: string;
    nextMaintenance: string;
    urgency: 'low' | 'medium' | 'high';
    estimatedCost: number;
  }>;
  routeOptimization: Array<{
    routeId: string;
    currentEfficiency: number;
    suggestedEfficiency: number;
    potentialSavings: number;
  }>;
}

class AnalyticsService {
  private baseUrl = '/api/analytics';

  // Overview analytics
  async getOverview(): Promise<AnalyticsData['overview']> {
    const response = await fetch(`${this.baseUrl}/overview`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch overview analytics');
    }
    
    return response.json();
  }

  // Trend analytics
  async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AnalyticsData['trends']> {
    const response = await fetch(`${this.baseUrl}/trends?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch trend analytics');
    }
    
    return response.json();
  }

  // Route analytics
  async getRouteAnalytics(): Promise<AnalyticsData['routes']> {
    const response = await fetch(`${this.baseUrl}/routes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch route analytics');
    }
    
    return response.json();
  }

  // User analytics
  async getUserAnalytics(): Promise<AnalyticsData['users']> {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user analytics');
    }
    
    return response.json();
  }

  // Fleet analytics
  async getFleetAnalytics(): Promise<AnalyticsData['fleet']> {
    const response = await fetch(`${this.baseUrl}/fleet`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch fleet analytics');
    }
    
    return response.json();
  }

  // Environmental analytics
  async getEnvironmentalAnalytics(): Promise<AnalyticsData['environmental']> {
    const response = await fetch(`${this.baseUrl}/environmental`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch environmental analytics');
    }
    
    return response.json();
  }

  // Predictive analytics
  async getPredictiveData(): Promise<PredictiveData> {
    const response = await fetch(`${this.baseUrl}/predictive`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch predictive data');
    }
    
    return response.json();
  }

  // Report generation
  async generateReport(config: ReportConfig): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    
    return response.blob();
  }

  // Real-time analytics
  async getRealTimeMetrics(): Promise<{
    activeBuses: number;
    currentPassengers: number;
    averageWaitTime: number;
    systemHealth: 'good' | 'warning' | 'critical';
  }> {
    const response = await fetch(`${this.baseUrl}/realtime`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch real-time metrics');
    }
    
    return response.json();
  }

  // Utility functions
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getPerformanceColor(value: number, threshold: number): string {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  }

  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  getTrendIcon(growthRate: number): string {
    if (growthRate > 0) return '📈';
    if (growthRate < 0) return '📉';
    return '➡️';
  }

  // Chart data formatting
  formatChartData(data: any[], xKey: string, yKey: string) {
    return data.map(item => ({
      x: item[xKey],
      y: item[yKey],
    }));
  }

  // Export functions
  async exportToCSV(data: any[], filename: string): Promise<void> {
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, filename, 'text/csv');
  }

  async exportToExcel(data: any[], filename: string): Promise<void> {
    // This would typically use a library like xlsx
    console.log('Excel export not implemented yet');
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
