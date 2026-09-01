const BUILD = '2026.08.31-r8-smart-library';
const CACHE = 'mpf-r8-smart-library';
const CORE = [
  './',
  './index.html',
  './styles.css?v=r8-smart',
  './app.js?v=r8-smart',
  './manifest.webmanifest?v=r8-smart',
  './version.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', event => {
  // Initial installs activate normally. Updates remain waiting so the UI can
  // explicitly offer the user the update instead of refreshing unexpectedly.
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

  // Build-versioned assets can be cache-first without trapping an old build.
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
