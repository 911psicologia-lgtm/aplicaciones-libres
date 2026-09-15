const VERSION = '3.49.0';
const SHELL_CACHE = `rizoma-shell-v${VERSION}`;
const RUNTIME_CACHE = `rizoma-runtime-v${VERSION}`;
const CORE = [
  './',
  './index.html',
  './css/styles.css?v=3.49.0',
  './js/game.js?v=3.49.0',
  './manifest.json?v=3.49.0',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/ui/intro_poster_mobile.webp',
  './assets/ui/intro_poster.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(name, maxItems = 320) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  while (keys.length > maxItems) await cache.delete(keys.shift());
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put('./index.html', response.clone());
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || (await caches.match('./index.html')) || new Response('Rizoma Zombie Strike no está disponible sin conexión todavía.', {status:503, headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}

async function cacheFirstRuntime(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type !== 'opaque') {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
      await trimCache(RUNTIME_CACHE);
    }
    return response;
  } catch (_) {
    return new Response('', {status:503, statusText:'Offline'});
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Las solicitudes Range de audio/video se dejan al navegador para no romper streaming.
  if (request.headers.has('range')) return;

  const cacheableDestinations = new Set(['script','style','image','font','audio','manifest']);
  const cacheable = cacheableDestinations.has(request.destination) || /\.(?:json|svg|webp|png|jpe?g)$/i.test(url.pathname);
  if (cacheable) event.respondWith(cacheFirstRuntime(request));
});
