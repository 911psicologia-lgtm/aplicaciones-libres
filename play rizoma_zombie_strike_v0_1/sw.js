const CACHE_NAME = 'rizoma-zombie-strike-v1-2-0-flow-progression';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => self.registration.unregister()).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => { return; });
