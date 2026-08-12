/* Humanitarian Hub — SW v9 — FORCE FRESH */
/* Unregisters self and all old SWs. Forces Pi Browser to fetch new code. */
self.addEventListener('install', function() {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        console.log('[SW] Deleting cache:', k);
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    }).then(function() {
      /* Tell all open pages to reload with fresh content */
      return self.clients.matchAll({includeUncontrolled: true}).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({type: 'SW_UPDATED'});
        });
      });
    })
  );
});
self.addEventListener('fetch', function(e) {
  /* Network only — never serve from cache */
  /* This ensures Pi Browser always gets fresh HTML from Cloudflare */
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  /* Skip Pi SDK and external APIs */
  if (url.origin !== self.location.origin) return;
  /* Skip payment endpoints */
  if (url.pathname.match(/^\/(approve|complete|cancel-payment)/)) return;
  /* For everything else: network only, no cache */
  e.respondWith(
    fetch(e.request, {cache: 'no-store'}).catch(function() {
      return caches.match(e.request);
    })
  );
});
