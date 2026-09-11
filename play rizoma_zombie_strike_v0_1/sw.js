const CACHE_NAME = 'rizoma-zombie-strike-v3-43-0';
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
// v3.43.0: perfiles comparables de build + aislamiento completo del Playtest Guiado; diagnóstico local sin transmisión ni cambios de combate, HP, daño o cadencias.
// principal para evitar que una versión antigua del juego quede congelada en caché.
self.addEventListener('fetch', () => {});
