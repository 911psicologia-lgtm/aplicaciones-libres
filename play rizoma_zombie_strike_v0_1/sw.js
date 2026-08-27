const CACHE_NAME = 'rizoma-zombie-strike-v3-3-1';
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// v3.3.1: el SW se conserva para la experiencia instalable, pero la red sigue siendo la fuente
// principal para evitar que una versión antigua del juego quede congelada en caché.
self.addEventListener('fetch', () => {});
