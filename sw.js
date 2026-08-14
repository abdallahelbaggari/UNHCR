/* HumHub SW v10 - SELF DESTRUCT - build:2026-08-14T11:42 */
var CACHE_VERSION = 'humhub-v10-2026-08-14T11-42';

self.addEventListener('install', function(e) {
  console.log('[SW] Installing v10 - will self destruct');
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('[SW] Activating v10 - destroying all caches');
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(k) {
          console.log('[SW] Deleting cache:', k);
          return caches.delete(k);
        })
      );
    })
    .then(function() { return self.clients.claim(); })
    .then(function() {
      /* Unregister self so no SW runs going forward */
      return self.registration.unregister();
    })
    .then(function() {
      /* Tell all clients to reload */
      return self.clients.matchAll().then(function(clients) {
        clients.forEach(function(c) { c.navigate(c.url); });
      });
    })
  );
});

self.addEventListener('fetch', function(e) {
  /* Always network - never cache */
  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .catch(function() { return fetch(e.request); })
    );
  }
});
