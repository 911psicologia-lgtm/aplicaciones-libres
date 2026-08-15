// Atlas del Asombro v47 · PWA retirada
// Este service worker solo existe para limpiar versiones anteriores y desregistrarse.
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.includes('atlas-del-asombro') || k.includes('atlas')).map(k => caches.delete(k)));
    } catch (e) {}
    try {
      await self.registration.unregister();
    } catch (e) {}
    try {
      const clientsList = await self.clients.matchAll({type:'window'});
      for (const client of clientsList) client.navigate(client.url);
    } catch (e) {}
  })());
});
self.addEventListener('fetch', event => {
  // Sin control de caché: dejar pasar todas las solicitudes a la red.
});
