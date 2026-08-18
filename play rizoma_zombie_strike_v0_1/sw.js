const CACHE_NAME = 'rizoma-zombie-strike-v0-7-17-dsebi-f5';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.registration.unregister()).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => { return; });
