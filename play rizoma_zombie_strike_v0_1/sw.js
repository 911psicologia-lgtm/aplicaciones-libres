const CACHE_NAME = 'rizoma-zombie-strike-v3-34-0';
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
// v3.34.0: firma visual de impacto por Nave Rizoma con VFX reales; conserva identidad/build v3.33, curva M1–M20 y sistemas v3.32
// principal para evitar que una versión antigua del juego quede congelada en caché.
self.addEventListener('fetch', () => {});
