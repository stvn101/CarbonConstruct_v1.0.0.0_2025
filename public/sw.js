// Service Worker for CarbonConstruct PWA
const CACHE_NAME = 'carbonconstruct-v4';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper to check if request is cacheable
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Skip non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return false;
  }
  
  // Skip chrome-extension:// and other non-http(s) URLs
  if (!url.protocol.startsWith('http')) {
    return false;
  }
  
  // Skip localhost tracing endpoints
  if (url.hostname === 'localhost' && url.pathname.includes('/v1/traces')) {
    return false;
  }
  
  // Skip analytics and tracking URLs
  if (url.hostname.includes('analytics') || 
      url.hostname.includes('facebook') || 
      url.hostname.includes('tiktok')) {
    return false;
  }
  
  return true;
}

// Fetch event - cache-first for hashed assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-cacheable requests
  if (!isCacheableRequest(request)) {
    return;
  }
  
  const url = new URL(request.url);

  // Cache-first strategy for hashed assets (JS, CSS, images with hashes)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    (request.destination === 'image' && url.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/)) ||
    url.pathname.match(/assets\/.*\.(js|css)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {
              // Silently fail cache put errors
            });
          });

          return response;
        }).catch(() => {
          return caches.match(request);
        });
      })
    );
    return;
  }

  // Network-first strategy for HTML and API requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(() => {
              // Silently fail cache put errors
            });
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
