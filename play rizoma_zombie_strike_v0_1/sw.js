const CACHE_NAME = 'rizoma-zombie-strike-v3-44-0';
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
// v3.44.0: Adaptive Boss Director SHADOW MODE: potencia/DPS/TTK A0–A3; solo observación y telemetría, sin cambios de combate, HP, daño, spawns ni cadencias.
// principal para evitar que una versión antigua del juego quede congelada en caché.
self.addEventListener('fetch', () => {});
