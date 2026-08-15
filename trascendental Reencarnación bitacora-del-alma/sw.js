/* Bitácora del alma — Service Worker PWA
   Cambia SW_VERSION en cada entrega para forzar detección de actualización. */
const SW_VERSION = 'bitacora-alma-v20260720-pwa-62-menu-contextual';
const CACHE_NAME = `${SW_VERSION}-static`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/main.css',
  './js/state.js',
  './js/mic.js',
  './js/screens-intro.js',
  './js/screens-principios.js',
  './js/screens-modulos.js',
  './js/screens-familia-eventos.js',
  './js/screens-importar.js',
  './js/screens-tirada.js',
  './js/screens-informe.js',
  './js/main.js',
  './js/pwa.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/branding/splash-inicio.png',
  './assets/branding/home-simbolo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if(res && res.status === 200){
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
