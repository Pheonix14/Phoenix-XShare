// service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  // Precache and serve the index.html file
  workbox.precaching.precacheAndRoute([{'url': '/', 'revision': '1'}]);

  // Cache the Google Fonts stylesheets
  workbox.routing.registerRoute(
    new RegExp('https://fonts.googleapis.com/css'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache the Google Fonts webfonts
  workbox.routing.registerRoute(
    new RegExp('https://fonts.gstatic.com/s/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    })
  );

  // Update the service worker and refresh the page whenever a new version is available
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((cacheName) => cacheName.startsWith('workbox-precache')).map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
} else {
  console.error('Workbox could not be loaded. Please check the network.');
}