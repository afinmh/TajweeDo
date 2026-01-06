// Basic service worker for offline caching of static assets and pages
const CACHE_NAME = 'tajweedo-cache-v5';
const ASSETS = [
  '/',
  '/manifest.json',
  '/mascot.svg',
  '/star.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Don't serve cached auth/me after logout directive
  if (request.url.endsWith('/api/auth/me')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        const clone = resp.clone();
        // Cache successful basic responses
        if (resp.ok && request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return resp;
      }).catch(() => cached || caches.match('/') );
    })
  );
});

// Listen for logout to clear all caches
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LOGOUT') {
    // Clear specific auth cache (backwards compatibility)
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        keys.forEach(req => {
          if (req.url.endsWith('/api/auth/me')) cache.delete(req);
        });
      });
    });
  }
  
  // Complete logout: delete ALL caches
  if (event.data && event.data.type === 'LOGOUT_CLEAR_ALL') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      // Notify all clients that cache is cleared
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      });
    });
  }
});
