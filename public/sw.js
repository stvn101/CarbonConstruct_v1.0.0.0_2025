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

// Fetch event
// IMPORTANT: only cache immutable build assets. Caching dev/runtime files can cause React version mismatches.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (POST, PUT, DELETE cannot be cached)
  if (request.method !== 'GET') return;

  // Skip chrome-extension URLs
  if (request.url.startsWith('chrome-extension://')) return;

  // Skip tracing endpoints
  if (request.url.includes('localhost:4318')) return;

  const url = new URL(request.url);

  const isHashedAsset =
    url.pathname.startsWith('/assets/') &&
    (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'));

  const isImageAsset =
    request.destination === 'image' &&
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg)$/);

  // Cache-first strategy ONLY for built hashed assets + images
  if (isHashedAsset || isImageAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        });
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Navigation requests: network-first, fallback to cached shell (do NOT cache the response)
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  // Everything else: just fetch (do NOT cache)
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
