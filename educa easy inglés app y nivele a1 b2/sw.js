const CACHE_NAME = 'easy-english-go-5.0.66-refuerzo-iconos-tooltips';
const APP_ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './content/content.v1.json',
  './manual-usuario.html',
  './assets/icons/app-icon.svg',
  './assets/images/logo_easy_english_go.png',
  './assets/images/logo_ipd.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isShellAsset = /\/(app\.js|app\.css|index\.html|manifest\.json)$/.test(url.pathname) || url.pathname.endsWith('/');
  if (isShellAsset) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const networkPromise = fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      return cached || networkPromise;
    })
  );
});


self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
