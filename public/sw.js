const CACHE_NAME = 'campus-ride-v1';
const OFFLINE_CACHE = 'campus-ride-offline-v1';
const API_CACHE = 'campus-ride-api-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html',
  '/styles/main.css',
  '/scripts/main.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/routes',
  '/api/stops',
  '/api/schedules',
  '/api/buses'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      // Cache API data
      caches.open(API_CACHE).then((cache) => {
        console.log('Caching API data');
        return Promise.all(
          API_ENDPOINTS.map(endpoint => 
            fetch(endpoint)
              .then(response => cache.put(endpoint, response))
              .catch(() => console.log(`Failed to cache ${endpoint}`))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - try network first, fallback to cache
      event.respondWith(handleApiRequest(request));
    } else if (url.pathname.startsWith('/static/') || url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
      // Static assets - cache first, fallback to network
      event.respondWith(handleStaticRequest(request));
    } else {
      // HTML pages - network first, fallback to offline page
      event.respondWith(handlePageRequest(request));
    }
  } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    // Non-GET requests - try network, queue for background sync if offline
    event.respondWith(handleNonGetRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This data is not available offline',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static resource:', request.url);
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline.html');
  }
}

// Handle non-GET requests
async function handleNonGetRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed, queuing for background sync:', request.url);
    
    // Queue for background sync
    await queueForBackgroundSync(request);
    
    // Return a response indicating the request was queued
    return new Response(
      JSON.stringify({ 
        queued: true, 
        message: 'Request queued for when connection is restored' 
      }),
      {
        status: 202,
        statusText: 'Accepted',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Queue request for background sync
async function queueForBackgroundSync(request) {
  const queue = await getBackgroundSyncQueue();
  
  const queuedRequest = {
    id: generateId(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 3
  };
  
  queue.push(queuedRequest);
  await saveBackgroundSyncQueue(queue);
  
  // Register for background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(`background-sync-${queuedRequest.id}`);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag.startsWith('background-sync-')) {
    event.waitUntil(processBackgroundSync(event.tag));
  }
});

// Process background sync
async function processBackgroundSync(syncTag) {
  const requestId = syncTag.replace('background-sync-', '');
  const queue = await getBackgroundSyncQueue();
  const queuedRequest = queue.find(req => req.id === requestId);
  
  if (!queuedRequest) {
    console.log('Queued request not found:', requestId);
    return;
  }
  
  try {
    // Recreate the request
    const request = new Request(queuedRequest.url, {
      method: queuedRequest.method,
      headers: queuedRequest.headers,
      body: queuedRequest.body
    });
    
    // Try to send the request
    const response = await fetch(request);
    
    if (response.ok) {
      // Remove from queue on success
      const updatedQueue = queue.filter(req => req.id !== requestId);
      await saveBackgroundSyncQueue(updatedQueue);
      
      console.log('Background sync successful:', queuedRequest.url);
      
      // Notify client of successful sync
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_SYNC_SUCCESS',
          requestId: requestId,
          url: queuedRequest.url
        });
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('Background sync failed:', error);
    
    // Increment retry count
    queuedRequest.retryCount++;
    
    if (queuedRequest.retryCount < queuedRequest.maxRetries) {
      // Update queue with new retry count
      const updatedQueue = queue.map(req => 
        req.id === requestId ? queuedRequest : req
      );
      await saveBackgroundSyncQueue(updatedQueue);
      
      // Schedule retry
      setTimeout(() => {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(registration => {
            registration.sync.register(syncTag);
          });
        }
      }, Math.pow(2, queuedRequest.retryCount) * 1000);
    } else {
      // Remove from queue after max retries
      const updatedQueue = queue.filter(req => req.id !== requestId);
      await saveBackgroundSyncQueue(updatedQueue);
      
      console.log('Background sync failed after max retries:', queuedRequest.url);
      
      // Notify client of failed sync
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_SYNC_FAILED',
          requestId: requestId,
          url: queuedRequest.url,
          error: error.message
        });
      });
    }
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      data: data.data,
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: data.tag || 'campus-ride-notification',
      timestamp: Date.now()
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action) {
    // Handle action button clicks
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Handle notification body click
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Handle notification actions
async function handleNotificationAction(action, data) {
  const clients = await self.clients.matchAll();
  
  switch (action) {
    case 'track':
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: 'track',
          data: data
        });
      });
      break;
    case 'view':
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: 'view',
          data: data
        });
      });
      break;
    case 'dismiss':
      // Just close the notification (already done)
      break;
    default:
      console.log('Unknown notification action:', action);
  }
}

// Message event
self.addEventListener('message', (event) => {
  console.log('Message received:', event.data);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_DATA':
      handleCacheData(event.data.data);
      break;
    case 'CLEAR_CACHE':
      handleClearCache(event.data.cacheName);
      break;
    default:
      console.log('Unknown message type:', event.data.type);
  }
});

// Handle cache data
async function handleCacheData(data) {
  const cache = await caches.open(OFFLINE_CACHE);
  await cache.put('offline-data', new Response(JSON.stringify(data)));
}

// Handle clear cache
async function handleClearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

// Utility functions
async function getBackgroundSyncQueue() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await cache.match('background-sync-queue');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.log('Failed to get background sync queue:', error);
  }
  return [];
}

async function saveBackgroundSyncQueue(queue) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put('background-sync-queue', new Response(JSON.stringify(queue)));
  } catch (error) {
    console.log('Failed to save background sync queue:', error);
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data
async function syncOfflineData() {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await cache.match('offline-data');
    
    if (response) {
      const data = await response.json();
      
      // Sync data with server
      for (const item of data) {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(item)
          });
        } catch (error) {
          console.log('Failed to sync item:', error);
        }
      }
      
      // Clear offline data after successful sync
      await cache.delete('offline-data');
    }
  } catch (error) {
    console.log('Failed to sync offline data:', error);
  }
}

console.log('Service Worker loaded successfully');
