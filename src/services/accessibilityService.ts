export interface AccessibilityFeature {
  id: string;
  name: string;
  type: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'speech';
  description: string;
  isEnabled: boolean;
  settings: Record<string, any>;
}

export interface AccessibilityProfile {
  userId: string;
  preferences: {
    visual: {
      highContrast: boolean;
      largeText: boolean;
      colorBlindSupport: boolean;
      screenReader: boolean;
      reducedMotion: boolean;
    };
    auditory: {
      audioDescriptions: boolean;
      visualAlerts: boolean;
      volumeBoost: boolean;
      speechSynthesis: boolean;
    };
    motor: {
      voiceControl: boolean;
      keyboardNavigation: boolean;
      touchAssistance: boolean;
      gestureRecognition: boolean;
    };
    cognitive: {
      simplifiedInterface: boolean;
      readingAssistance: boolean;
      memoryAids: boolean;
      focusMode: boolean;
    };
  };
  assistiveTechnologies: string[];
  lastUpdated: Date;
}

export interface AccessibilityAudit {
  id: string;
  page: string;
  timestamp: Date;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    code: string;
    message: string;
    element: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fix: string;
  }>;
  score: number;
  recommendations: string[];
}

export interface AccessibilityReport {
  id: string;
  userId: string;
  type: 'issue' | 'suggestion' | 'feedback';
  category: 'navigation' | 'content' | 'forms' | 'media' | 'interaction';
  description: string;
  location: {
    page: string;
    element?: string;
    coordinates?: { x: number; y: number };
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'text';
    url: string;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  parameters?: Record<string, any>;
  description: string;
  category: 'navigation' | 'information' | 'action' | 'emergency';
  isActive: boolean;
}

class AccessibilityService {
  private baseUrl = '/api/accessibility';
  private currentProfile: AccessibilityProfile | null = null;

  // Accessibility Profile Management
  async getAccessibilityProfile(): Promise<AccessibilityProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accessibility profile');
    }
    
    const profile = await response.json();
    this.currentProfile = profile;
    return profile;
  }

  async updateAccessibilityProfile(updates: Partial<AccessibilityProfile>): Promise<AccessibilityProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update accessibility profile');
    }
    
    const profile = await response.json();
    this.currentProfile = profile;
    this.applyAccessibilitySettings(profile);
    return profile;
  }

  // Accessibility Features
  async getAccessibilityFeatures(): Promise<AccessibilityFeature[]> {
    const response = await fetch(`${this.baseUrl}/features`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accessibility features');
    }
    
    return response.json();
  }

  async toggleAccessibilityFeature(featureId: string, isEnabled: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/features/${featureId}/toggle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isEnabled }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle accessibility feature');
    }
  }

  async updateFeatureSettings(featureId: string, settings: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/features/${featureId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ settings }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update feature settings');
    }
  }

  // Accessibility Audits
  async performAccessibilityAudit(page: string): Promise<AccessibilityAudit> {
    const response = await fetch(`${this.baseUrl}/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ page }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to perform accessibility audit');
    }
    
    return response.json();
  }

  async getAccessibilityAudits(): Promise<AccessibilityAudit[]> {
    const response = await fetch(`${this.baseUrl}/audits`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accessibility audits');
    }
    
    return response.json();
  }

  // Accessibility Reports
  async createAccessibilityReport(report: Omit<AccessibilityReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessibilityReport> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(report),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create accessibility report');
    }
    
    return response.json();
  }

  async getAccessibilityReports(status?: string): Promise<AccessibilityReport[]> {
    const url = status ? `${this.baseUrl}/reports?status=${status}` : `${this.baseUrl}/reports`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch accessibility reports');
    }
    
    return response.json();
  }

  async updateReportStatus(reportId: string, status: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update report status');
    }
  }

  // Voice Commands
  async getVoiceCommands(): Promise<VoiceCommand[]> {
    const response = await fetch(`${this.baseUrl}/voice-commands`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voice commands');
    }
    
    return response.json();
  }

  async executeVoiceCommand(command: string): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/voice-commands/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ command }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute voice command');
    }
    
    return response.json();
  }

  // Screen Reader Support
  async announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): Promise<void> {
    // This would typically integrate with screen reader APIs
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Keyboard Navigation
  setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      } else if (event.key === 'Enter' || event.key === ' ') {
        this.handleActivation(event);
      } else if (event.key === 'Escape') {
        this.handleEscape(event);
      }
    });
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    // Ensure proper tab order and focus management
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    
    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (currentIndex === 0) {
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        event.preventDefault();
      }
    } else {
      // Tab (forward)
      if (currentIndex === focusableElements.length - 1) {
        (focusableElements[0] as HTMLElement).focus();
        event.preventDefault();
      }
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
      target.click();
    }
  }

  private handleEscape(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label="Close"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    });
  }

  // Apply Accessibility Settings
  private applyAccessibilitySettings(profile: AccessibilityProfile): void {
    const root = document.documentElement;
    
    // Visual settings
    if (profile.preferences.visual.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (profile.preferences.visual.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (profile.preferences.visual.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply CSS custom properties
    root.style.setProperty('--font-size', profile.preferences.visual.largeText ? '1.2em' : '1em');
    root.style.setProperty('--contrast-ratio', profile.preferences.visual.highContrast ? '4.5' : '3');
  }

  // Utility Functions
  getAccessibilityScore(audit: AccessibilityAudit): string {
    if (audit.score >= 90) return 'Excellent';
    if (audit.score >= 80) return 'Good';
    if (audit.score >= 70) return 'Fair';
    if (audit.score >= 60) return 'Poor';
    return 'Very Poor';
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getIssueTypeIcon(type: string): string {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  }

  formatAccessibilityReport(report: AccessibilityReport): string {
    return `${report.type.toUpperCase()}: ${report.description} (${report.severity})`;
  }

  // ARIA Support
  setupARIA(): void {
    // Add ARIA landmarks
    const main = document.querySelector('main');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }
    
    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }
    
    // Add skip links
    this.addSkipLinks();
  }

  private addSkipLinks(): void {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#search" class="skip-link">Skip to search</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  // Focus Management
  trapFocus(element: HTMLElement): void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    });
  }

  // Color Contrast Checker
  checkColorContrast(foreground: string, background: string): {
    ratio: number;
    level: 'AA' | 'AAA' | 'fail';
    isPassing: boolean;
  } {
    // This is a simplified version - in production, you'd use a proper color contrast library
    const ratio = this.calculateContrastRatio(foreground, background);
    
    let level: 'AA' | 'AAA' | 'fail';
    let isPassing: boolean;
    
    if (ratio >= 7) {
      level = 'AAA';
      isPassing = true;
    } else if (ratio >= 4.5) {
      level = 'AA';
      isPassing = true;
    } else {
      level = 'fail';
      isPassing = false;
    }
    
    return { ratio, level, isPassing };
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast ratio calculation
    // In production, use a proper color library
    return 4.5; // Placeholder
  }
}

export const accessibilityService = new AccessibilityService();
export default accessibilityService;
