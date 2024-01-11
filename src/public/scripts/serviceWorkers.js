// Define a unique cache name for your PWA
const CACHE_NAME = 'phoenix-share-cache-v1';

// List of URLs to cache when the Service Worker is installed
const urlsToCache = [
  '/',
  '/login', // Add all the URLs you want to cache here
  '/create-account',
  '/upload',
  '/download',
  '/error'
];

// Install the Service Worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when there's no network connection
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Remove old caches when a new version of the PWA is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
