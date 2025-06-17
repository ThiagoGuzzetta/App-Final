const CACHE_NAME = 'inventario-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/service-worker.js',
  '/libs/xlsx.full.min.js',
  'icon-192.png',
  'icon-512.png',
  // Si agregás CSS, imágenes u otros JS, ponelos acá
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si está cacheado, devuelvo eso
        if (cachedResponse) {
          return cachedResponse;
        }
        // Sino hago la petición normalmente y opcionalmente la agrego al cache
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // Cachear solo respuestas válidas (status 200)
            if(networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});
