const CACHE_NAME = 'rizoma-zombie-strike-v1-9-0-dominio-arsenal-critico';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => { return; });
