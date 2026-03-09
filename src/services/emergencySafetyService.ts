export interface EmergencyAlert {
  id: string;
  type: 'medical' | 'safety' | 'mechanical' | 'security' | 'weather' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'escalated';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    busId?: string;
    routeId?: string;
  };
  reportedBy: {
    userId: string;
    role: 'student' | 'driver' | 'admin';
    name: string;
  };
  assignedTo?: {
    userId: string;
    name: string;
    role: string;
  };
  actions: Array<{
    id: string;
    action: string;
    takenBy: string;
    timestamp: Date;
    notes?: string;
  }>;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    description?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface SafetyReport {
  id: string;
  type: 'incident' | 'hazard' | 'maintenance' | 'behavior' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    busId?: string;
    routeId?: string;
  };
  reportedBy: {
    userId: string;
    role: 'student' | 'driver' | 'admin';
    name: string;
  };
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: {
    userId: string;
    name: string;
    role: string;
  };
  investigation?: {
    findings: string;
    recommendations: string[];
    actionsTaken: string[];
    completedBy: string;
    completedAt: Date;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    description?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: 'police' | 'medical' | 'fire' | 'dispatch' | 'maintenance' | 'security';
  phone: string;
  email?: string;
  isActive: boolean;
  priority: number;
}

export interface SafetyProtocol {
  id: string;
  name: string;
  type: 'medical' | 'mechanical' | 'security' | 'weather' | 'evacuation';
  steps: Array<{
    order: number;
    action: string;
    description: string;
    responsible: string;
    estimatedTime: number;
  }>;
  isActive: boolean;
  lastUpdated: Date;
}

class EmergencySafetyService {
  private baseUrl = '/api/emergency';

  // Emergency alerts
  async getEmergencyAlerts(status?: string): Promise<EmergencyAlert[]> {
    const url = status ? `${this.baseUrl}/alerts?status=${status}` : `${this.baseUrl}/alerts`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency alerts');
    }
    
    return response.json();
  }

  async createEmergencyAlert(alert: Omit<EmergencyAlert, 'id' | 'createdAt' | 'updatedAt' | 'actions'>): Promise<EmergencyAlert> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(alert),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create emergency alert');
    }
    
    return response.json();
  }

  async updateEmergencyAlert(id: string, updates: Partial<EmergencyAlert>): Promise<EmergencyAlert> {
    const response = await fetch(`${this.baseUrl}/alerts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update emergency alert');
    }
    
    return response.json();
  }

  async addEmergencyAction(alertId: string, action: Omit<EmergencyAlert['actions'][0], 'id' | 'timestamp'>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/alerts/${alertId}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(action),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add emergency action');
    }
  }

  // Safety reports
  async getSafetyReports(status?: string): Promise<SafetyReport[]> {
    const url = status ? `${this.baseUrl}/reports?status=${status}` : `${this.baseUrl}/reports`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch safety reports');
    }
    
    return response.json();
  }

  async createSafetyReport(report: Omit<SafetyReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<SafetyReport> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(report),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create safety report');
    }
    
    return response.json();
  }

  async updateSafetyReport(id: string, updates: Partial<SafetyReport>): Promise<SafetyReport> {
    const response = await fetch(`${this.baseUrl}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update safety report');
    }
    
    return response.json();
  }

  async addInvestigation(reportId: string, investigation: SafetyReport['investigation']): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/investigation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(investigation),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add investigation');
    }
  }

  // Emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await fetch(`${this.baseUrl}/contacts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency contacts');
    }
    
    return response.json();
  }

  async createEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const response = await fetch(`${this.baseUrl}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(contact),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create emergency contact');
    }
    
    return response.json();
  }

  // Safety protocols
  async getSafetyProtocols(): Promise<SafetyProtocol[]> {
    const response = await fetch(`${this.baseUrl}/protocols`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch safety protocols');
    }
    
    return response.json();
  }

  async getSafetyProtocol(type: string): Promise<SafetyProtocol> {
    const response = await fetch(`${this.baseUrl}/protocols/${type}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch safety protocol');
    }
    
    return response.json();
  }

  // Panic button functionality
  async triggerPanicButton(location: { latitude: number; longitude: number; address: string }, busId?: string): Promise<EmergencyAlert> {
    const alert = await this.createEmergencyAlert({
      type: 'security',
      severity: 'critical',
      status: 'active',
      title: 'Panic Button Activated',
      description: 'Emergency panic button has been activated',
      location: { ...location, busId },
      reportedBy: {
        userId: localStorage.getItem('userId') || 'unknown',
        role: 'student',
        name: localStorage.getItem('username') || 'Unknown User',
      },
      actions: [],
    });

    // Immediately notify emergency contacts
    await this.notifyEmergencyContacts(alert);
    
    return alert;
  }

  private async notifyEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    const contacts = await this.getEmergencyContacts();
    const criticalContacts = contacts.filter(c => c.role === 'police' || c.role === 'medical' || c.role === 'security');
    
    // In a real implementation, this would send actual notifications
    console.log('Notifying emergency contacts:', criticalContacts);
  }

  // File upload for attachments
  async uploadAttachment(file: File, type: 'image' | 'video' | 'audio' | 'document'): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
    
    return response.json();
  }

  // Analytics and reporting
  async getEmergencyStats(): Promise<{
    totalAlerts: number;
    activeAlerts: number;
    resolvedAlerts: number;
    averageResolutionTime: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency stats');
    }
    
    return response.json();
  }

  async getSafetyStats(): Promise<{
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    averageResolutionTime: number;
  }> {
    const response = await fetch(`${this.baseUrl}/safety-stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch safety stats');
    }
    
    return response.json();
  }

  // Utility functions
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'medical': return '🏥';
      case 'safety': return '⚠️';
      case 'mechanical': return '🔧';
      case 'security': return '🛡️';
      case 'weather': return '🌧️';
      case 'traffic': return '🚦';
      default: return '🚨';
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Location services
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number; address: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
            );
            const data = await response.json();
            const address = data.features[0]?.place_name || 'Unknown location';
            
            resolve({ latitude, longitude, address });
          } catch (error) {
            resolve({ latitude, longitude, address: 'Unknown location' });
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  // Quick actions
  async quickReportIncident(type: string, description: string, busId?: string): Promise<SafetyReport> {
    const location = await this.getCurrentLocation();
    
    return this.createSafetyReport({
      type: type as any,
      severity: 'medium',
      title: `Incident Report - ${type}`,
      description,
      location: { ...location, busId },
      reportedBy: {
        userId: localStorage.getItem('userId') || 'unknown',
        role: 'student',
        name: localStorage.getItem('username') || 'Unknown User',
      },
      status: 'pending',
    });
  }

  async quickReportHazard(description: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<SafetyReport> {
    const location = await this.getCurrentLocation();
    
    return this.createSafetyReport({
      type: 'hazard',
      severity,
      title: 'Hazard Report',
      description,
      location,
      reportedBy: {
        userId: localStorage.getItem('userId') || 'unknown',
        role: 'student',
        name: localStorage.getItem('username') || 'Unknown User',
      },
      status: 'pending',
    });
  }
}

export const emergencySafetyService = new EmergencySafetyService();
export default emergencySafetyService;
