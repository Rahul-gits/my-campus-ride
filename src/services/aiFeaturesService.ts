export interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'anomaly' | 'optimization' | 'trend';
  category: 'demand' | 'route' | 'maintenance' | 'safety' | 'user_behavior' | 'financial';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  recommendations: Array<{
    action: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: string;
  }>;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'demand_forecast' | 'maintenance_prediction' | 'route_optimization' | 'user_behavior' | 'anomaly_detection';
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'deprecated';
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    mape: number; // Mean Absolute Percentage Error
  };
  features: string[];
  performance: Array<{
    date: string;
    accuracy: number;
    predictions: number;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Array<{ name: string; value: string; confidence: number }>;
    suggestions?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: {
    currentRoute?: string;
    userPreferences?: any;
    sessionData?: any;
  };
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface PersonalizedRecommendation {
  id: string;
  userId: string;
  type: 'route' | 'schedule' | 'pass' | 'feature' | 'promotion';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
  data: any;
  actions: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
  createdAt: Date;
  expiresAt: Date;
  isViewed: boolean;
  isActedUpon: boolean;
}

export interface AnomalyDetection {
  id: string;
  type: 'traffic' | 'demand' | 'maintenance' | 'safety' | 'financial' | 'user_behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  data: {
    expected: any;
    actual: any;
    deviation: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  affectedEntities: string[];
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: {
    description: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
}

class AIFeaturesService {
  private baseUrl = '/api/ai';

  // AI Insights
  async getAIInsights(category?: string): Promise<AIInsight[]> {
    const url = category ? `${this.baseUrl}/insights?category=${category}` : `${this.baseUrl}/insights`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch AI insights');
    }
    
    return response.json();
  }

  async createAIInsight(insight: Omit<AIInsight, 'id' | 'createdAt'>): Promise<AIInsight> {
    const response = await fetch(`${this.baseUrl}/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(insight),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create AI insight');
    }
    
    return response.json();
  }

  async updateInsightStatus(insightId: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/insights/${insightId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isActive }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update insight status');
    }
  }

  // Predictive Models
  async getPredictiveModels(): Promise<PredictiveModel[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch predictive models');
    }
    
    return response.json();
  }

  async trainModel(modelId: string, trainingData: any): Promise<{ status: string; progress: number }> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(trainingData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to train model');
    }
    
    return response.json();
  }

  async getModelPredictions(modelId: string, inputData: any): Promise<{
    predictions: any[];
    confidence: number;
    metadata: any;
  }> {
    const response = await fetch(`${this.baseUrl}/models/${modelId}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(inputData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get model predictions');
    }
    
    return response.json();
  }

  // Chat Assistant
  async createChatSession(): Promise<ChatSession> {
    const response = await fetch(`${this.baseUrl}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to create chat session');
    }
    
    return response.json();
  }

  async sendChatMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ content: message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }
    
    return response.json();
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }
    
    return response.json();
  }

  async getChatSuggestions(sessionId: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}/suggestions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chat suggestions');
    }
    
    return response.json();
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendation[]> {
    const response = await fetch(`${this.baseUrl}/recommendations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch personalized recommendations');
    }
    
    return response.json();
  }

  async markRecommendationViewed(recommendationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recommendations/${recommendationId}/viewed`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark recommendation as viewed');
    }
  }

  async markRecommendationActedUpon(recommendationId: string, action: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/recommendations/${recommendationId}/acted`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ action }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark recommendation as acted upon');
    }
  }

  // Anomaly Detection
  async getAnomalies(severity?: string): Promise<AnomalyDetection[]> {
    const url = severity ? `${this.baseUrl}/anomalies?severity=${severity}` : `${this.baseUrl}/anomalies`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch anomalies');
    }
    
    return response.json();
  }

  async resolveAnomaly(anomalyId: string, resolution: {
    description: string;
    resolvedBy: string;
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/anomalies/${anomalyId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(resolution),
    });
    
    if (!response.ok) {
      throw new Error('Failed to resolve anomaly');
    }
  }

  async markAnomalyAsFalsePositive(anomalyId: string, reason: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/anomalies/${anomalyId}/false-positive`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark anomaly as false positive');
    }
  }

  // Smart Analytics
  async getSmartAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    insights: AIInsight[];
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      change: number;
      confidence: number;
    }>;
    predictions: Array<{
      metric: string;
      predictedValue: number;
      confidence: number;
      timeframe: string;
    }>;
    recommendations: Array<{
      type: string;
      priority: 'low' | 'medium' | 'high';
      description: string;
      impact: string;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/smart-analytics?timeframe=${timeframe}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch smart analytics');
    }
    
    return response.json();
  }

  // Natural Language Processing
  async processNaturalLanguageQuery(query: string): Promise<{
    intent: string;
    entities: Array<{ name: string; value: string; confidence: number }>;
    response: string;
    suggestions: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/nlp/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process natural language query');
    }
    
    return response.json();
  }

  // Utility functions
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  }

  getImpactColor(impact: string): string {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  }

  formatConfidence(confidence: number): string {
    return `${(confidence * 100).toFixed(1)}%`;
  }

  formatPrediction(prediction: any): string {
    if (typeof prediction === 'number') {
      return prediction.toFixed(2);
    }
    return String(prediction);
  }

  // AI-powered features
  async generateRouteDescription(routeId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate/route-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ routeId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate route description');
    }
    
    const data = await response.json();
    return data.description;
  }

  async generatePersonalizedMessage(userId: string, context: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate/personalized-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate personalized message');
    }
    
    const data = await response.json();
    return data.message;
  }

  async analyzeUserBehavior(userId: string): Promise<{
    patterns: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    preferences: Array<{
      category: string;
      value: string;
      strength: number;
    }>;
    recommendations: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/analyze/user-behavior`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze user behavior');
    }
    
    return response.json();
  }
}

export const aiFeaturesService = new AIFeaturesService();
export default aiFeaturesService;
