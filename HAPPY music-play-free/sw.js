const CACHE_NAME = 'mpf-v2';
const APP_BASE = new URL('./', self.location.href);
const PRECACHE_URLS = [
  new URL('./', APP_BASE).href,
  new URL('./index.html', APP_BASE).href,
  new URL('./manifest.webmanifest', APP_BASE).href,
  new URL('./favicon.svg', APP_BASE).href,
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of PRECACHE_URLS) {
        try { await cache.add(url); } catch (_) {}
      }
    })
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () =>
        (await caches.match(new URL('./index.html', APP_BASE).href)) ||
        caches.match(new URL('./', APP_BASE).href)
      )
    );
    return;
  }
  const path = url.pathname;
  const isShell =
    path.endsWith('/index.html') ||
    path.endsWith('/manifest.webmanifest') ||
    path.endsWith('/favicon.svg') ||
    path.includes('/icons/');
  if (isShell) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }
  if (/\.(?:js|css|woff2?|ttf|svg)$/i.test(path)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const update = fetch(request)
          .then(async (response) => {
            if (response.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || update;
      })
    );
  }
});
