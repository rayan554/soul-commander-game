// Service Worker for Soul Commander PWA v2.1
const CACHE_NAME = 'soul-commander-v2.1';
const APP_VERSION = '2.1.0';

const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/game.js',
    '/manifest.json',
    // Add other assets as needed
];

// Custom error pages
const OFFLINE_PAGE = '/index.html';
const ERROR_IMAGE = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚔️</text></svg>';

// Install event
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing version', APP_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache)
                    .then(() => self.skipWaiting())
                    .catch(err => {
                        console.error('[Service Worker] Cache addAll failed:', err);
                    });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating version', APP_VERSION);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Take control of all clients
            return self.clients.claim();
        })
        .then(() => {
            console.log('[Service Worker] Ready to handle fetches');
        })
    );
});

// Enhanced fetch with better offline handling
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            handleNavigationRequest(event)
        );
        return;
    }
    
    // Handle other requests
    event.respondWith(
        handleResourceRequest(event)
    );
});

async function handleNavigationRequest(event) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(event.request);
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Navigation failed, serving offline page');
        
        // Try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Serve offline page
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Last resort - create simple response
        return new Response(
            '<!DOCTYPE html><html><head><title>Soul Commander</title></head><body><h1>⚔️ Soul Commander</h1><p>You are offline. Please check your connection.</p></body></html>',
            {
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

async function handleResourceRequest(event) {
    const request = event.request;
    
    // Try cache first strategy for better performance
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        // Update cache in background
        event.waitUntil(
            updateCache(request)
        );
        return cachedResponse;
    }
    
    // Try network
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
            });
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Fetch failed:', error);
        
        // For images, return a fallback
        if (request.headers.get('Accept')?.includes('image')) {
            return new Response(
                ERROR_IMAGE,
                {
                    headers: { 'Content-Type': 'image/svg+xml' }
                }
            );
        }
        
        // For other resources, return error
        return new Response('Offline - Soul Commander', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
                'Content-Type': 'text/plain'
            })
        });
    }
}

async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response);
        }
    } catch (error) {
        // Silently fail - we already have cached version
    }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'sync-game-data') {
        event.waitUntil(syncGameData());
    }
});

async function syncGameData() {
    // Implement game data sync here
    console.log('[Service Worker] Syncing game data');
}

// Push notifications
self.addEventListener('push', event => {
    const options = {
        body: event.data?.text() || 'New update from Soul Commander!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚔️</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎮</text></svg>',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Soul Commander', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Focus existing window if available
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window if none exists
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});