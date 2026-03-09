export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable';
  }>;
}

export interface OfflineData {
  routes: any[];
  stops: any[];
  schedules: any[];
  lastUpdated: Date;
  version: string;
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface BackgroundSync {
  id: string;
  type: 'ride_tracking' | 'data_sync' | 'notification_sync';
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

class PWAService {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineData: OfflineData | null = null;
  private backgroundSyncQueue: BackgroundSync[] = [];

  constructor() {
    this.setupEventListeners();
    this.loadOfflineData();
  }

  // Service Worker Registration
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });
        
        return this.registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    } else {
      throw new Error('Service Workers not supported');
    }
  }

  // Install Prompt
  async showInstallPrompt(): Promise<boolean> {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ action: 'skipWaiting' });
      return true;
    }
    return false;
  }

  async promptInstall(): Promise<void> {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      (window as any).deferredPrompt = null;
    }
  }

  // Offline Support
  async loadOfflineData(): Promise<void> {
    try {
      const data = await this.getFromCache('offline-data');
      if (data) {
        this.offlineData = data;
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  async saveOfflineData(data: OfflineData): Promise<void> {
    try {
      await this.saveToCache('offline-data', data);
      this.offlineData = data;
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isOnline || !this.offlineData) return;
    
    try {
      // Sync routes
      for (const route of this.offlineData.routes) {
        await this.syncRouteData(route);
      }
      
      // Sync stops
      for (const stop of this.offlineData.stops) {
        await this.syncStopData(stop);
      }
      
      // Clear offline data after successful sync
      await this.clearCache('offline-data');
      this.offlineData = null;
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }
    
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || ''),
      });
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async sendPushNotification(notification: PushNotification): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }
    
    await this.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data,
      actions: notification.actions,
      requireInteraction: true,
    });
  }

  // Background Sync
  async queueBackgroundSync(type: string, data: any): Promise<void> {
    const syncItem: BackgroundSync = {
      id: this.generateId(),
      type: type as any,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
    };
    
    this.backgroundSyncQueue.push(syncItem);
    await this.saveToCache('background-sync-queue', this.backgroundSyncQueue);
    
    if (this.registration && 'sync' in this.registration) {
      await this.registration.sync.register(syncItem.id);
    }
  }

  async processBackgroundSync(syncId: string): Promise<void> {
    const syncItem = this.backgroundSyncQueue.find(item => item.id === syncId);
    if (!syncItem) return;
    
    try {
      await this.executeBackgroundSync(syncItem);
      this.removeFromSyncQueue(syncId);
    } catch (error) {
      console.error('Background sync failed:', error);
      syncItem.retryCount++;
      
      if (syncItem.retryCount < syncItem.maxRetries) {
        // Retry later
        setTimeout(() => {
          this.processBackgroundSync(syncId);
        }, Math.pow(2, syncItem.retryCount) * 1000);
      } else {
        this.removeFromSyncQueue(syncId);
      }
    }
  }

  // Cache Management
  async getFromCache(key: string): Promise<any> {
    if (!('caches' in window)) return null;
    
    const cache = await caches.open('campus-ride-cache');
    const response = await cache.match(key);
    
    if (response) {
      return await response.json();
    }
    
    return null;
  }

  async saveToCache(key: string, data: any): Promise<void> {
    if (!('caches' in window)) return;
    
    const cache = await caches.open('campus-ride-cache');
    const response = new Response(JSON.stringify(data));
    await cache.put(key, response);
  }

  async clearCache(key?: string): Promise<void> {
    if (!('caches' in window)) return;
    
    const cache = await caches.open('campus-ride-cache');
    
    if (key) {
      await cache.delete(key);
    } else {
      await cache.delete('offline-data');
      await cache.delete('background-sync-queue');
    }
  }

  // App Lifecycle
  async handleAppInstall(): Promise<void> {
    // Show install banner
    this.showInstallBanner();
    
    // Preload critical data
    await this.preloadCriticalData();
  }

  async handleAppUpdate(): Promise<void> {
    // Show update notification
    this.showUpdateNotification();
    
    // Clear old cache
    await this.clearOldCache();
  }

  // Utility Functions
  private setupEventListeners(): void {
    // Online/Offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.processBackgroundSyncQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    // Install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      (window as any).deferredPrompt = event;
      this.showInstallBanner();
    });
    
    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallBanner();
    });
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(subscription),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  }

  private async executeBackgroundSync(syncItem: BackgroundSync): Promise<void> {
    switch (syncItem.type) {
      case 'ride_tracking':
        await this.syncRideTracking(syncItem.data);
        break;
      case 'data_sync':
        await this.syncData(syncItem.data);
        break;
      case 'notification_sync':
        await this.syncNotifications(syncItem.data);
        break;
    }
  }

  private async syncRideTracking(data: any): Promise<void> {
    // Sync ride tracking data
    const response = await fetch('/api/rides/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync ride tracking');
    }
  }

  private async syncData(data: any): Promise<void> {
    // Sync general data
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync data');
    }
  }

  private async syncNotifications(data: any): Promise<void> {
    // Sync notification data
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync notifications');
    }
  }

  private async syncRouteData(route: any): Promise<void> {
    // Sync individual route data
    const response = await fetch(`/api/routes/${route.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(route),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync route data');
    }
  }

  private async syncStopData(stop: any): Promise<void> {
    // Sync individual stop data
    const response = await fetch(`/api/stops/${stop.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(stop),
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync stop data');
    }
  }

  private async processBackgroundSyncQueue(): Promise<void> {
    const queue = await this.getFromCache('background-sync-queue');
    if (queue) {
      this.backgroundSyncQueue = queue;
      
      for (const syncItem of this.backgroundSyncQueue) {
        await this.processBackgroundSync(syncItem.id);
      }
    }
  }

  private removeFromSyncQueue(syncId: string): void {
    this.backgroundSyncQueue = this.backgroundSyncQueue.filter(item => item.id !== syncId);
    this.saveToCache('background-sync-queue', this.backgroundSyncQueue);
  }

  private async preloadCriticalData(): Promise<void> {
    try {
      // Preload routes, stops, and schedules
      const [routes, stops, schedules] = await Promise.all([
        fetch('/api/routes').then(r => r.json()),
        fetch('/api/stops').then(r => r.json()),
        fetch('/api/schedules').then(r => r.json()),
      ]);
      
      const offlineData: OfflineData = {
        routes,
        stops,
        schedules,
        lastUpdated: new Date(),
        version: '1.0.0',
      };
      
      await this.saveOfflineData(offlineData);
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }

  private async clearOldCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => name.startsWith('campus-ride-cache-'));
      
      await Promise.all(
        oldCaches.map(name => caches.delete(name))
      );
    }
  }

  private showInstallBanner(): void {
    // Show install banner UI
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-text">
          <h3>Install Campus Ride</h3>
          <p>Get quick access to your campus transportation</p>
        </div>
        <div class="install-banner-actions">
          <button id="install-btn" class="btn btn-primary">Install</button>
          <button id="dismiss-btn" class="btn btn-secondary">Dismiss</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('install-btn')?.addEventListener('click', () => {
      this.promptInstall();
    });
    
    document.getElementById('dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner(): void {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }

  private showUpdateNotification(): void {
    // Show update notification UI
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-notification-text">
          <h3>Update Available</h3>
          <p>A new version of Campus Ride is available</p>
        </div>
        <div class="update-notification-actions">
          <button id="update-btn" class="btn btn-primary">Update</button>
          <button id="dismiss-update-btn" class="btn btn-secondary">Later</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listeners
    document.getElementById('update-btn')?.addEventListener('click', () => {
      this.showInstallPrompt();
    });
    
    document.getElementById('dismiss-update-btn')?.addEventListener('click', () => {
      this.hideUpdateNotification();
    });
  }

  private hideUpdateNotification(): void {
    const notification = document.getElementById('update-notification');
    if (notification) {
      notification.remove();
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public API
  isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  isOnlineMode(): boolean {
    return this.isOnline;
  }

  getOfflineData(): OfflineData | null {
    return this.offlineData;
  }

  async getAppVersion(): Promise<string> {
    const manifest = await this.getFromCache('app-manifest');
    return manifest?.version || '1.0.0';
  }
}

export const pwaService = new PWAService();
export default pwaService;
