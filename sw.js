/* UNHCR Service Worker v2 — Network-first with offline fallback */
var CACHE_NAME = 'unhcr-v2';
var OFFLINE_URLS = ['/', '/index.html'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(OFFLINE_URLS).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){return k!==CACHE_NAME;}).map(function(k){return caches.delete(k);}));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if(e.request.method!=='GET') return;
  var url = new URL(e.request.url);
  if(url.origin!==self.location.origin) return;
  /* API calls — network only */
  if(url.pathname.match(/^\/(approve|complete|cancel-payment)/)) return;
  /* HTML — network-first, cache fallback */
  if(url.pathname.endsWith('.html')||url.pathname==='/') {
    e.respondWith(
      fetch(e.request).then(function(r){
        var rc=r.clone();
        caches.open(CACHE_NAME).then(function(c){c.put(e.request,rc);});
        return r;
      }).catch(function(){ return caches.match(e.request)||caches.match('/index.html'); })
    );
  }
});
