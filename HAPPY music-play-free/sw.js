const BUILD = '2026.09.01-r10-library-first';
const CACHE = 'mpf-r10-library-first';
const CORE = [
  './',
  './index.html',
  './styles.css?v=r10-library-first',
  './app.js?v=r10-library-first',
  './manifest.webmanifest?v=r10-library-first',
  './version.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-256.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  if(url.pathname.includes('/api/')){ event.respondWith(fetch(req)); return; }

  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req)
        .then(res => {
          if(res.ok) caches.open(CACHE).then(cache => cache.put('./index.html', res.clone())).catch(()=>{});
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if(res.ok){
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{});
      }
      return res;
    }))
  );
});
