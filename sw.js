const CACHE_NAME = 'tabuada-cache-v1';
const urlsToCache = [
  '/tabuada/',
  '/tabuada/index.html',
  '/tabuada/style.css',
  '/tabuada/script.js',
  '/tabuada/manifest.json',
  '/tabuada/icon.svg'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptando requisições (Network First strategy for dynamic updates)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a rede funcionou, clona e atualiza o cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Se a rede falhou (offline), busca no cache
        return caches.match(event.request);
      })
  );
});
