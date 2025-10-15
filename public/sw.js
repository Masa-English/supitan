
// Service Worker for スピ単
const CACHE_NAME = 'spitan-v1-1760529904702';
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/learning/categories',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});
