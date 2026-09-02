const BUILD = '2026.09.02-r10.7-song-scope-adaptive-sound';
const CACHE = 'mpf-r10.7-song-scope-adaptive-sound';
const CORE = [
  './',
  './index.html',
  './styles.css?v=r10.7-song-scope-adaptive-sound',
  './app.js?v=r10.7-song-scope-adaptive-sound',
  './manifest.webmanifest?v=r10.7-song-scope-adaptive-sound',
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
  let url;try{url=new URL(req.url);}catch{return;}
  if(!/^https?:$/.test(url.protocol)||url.origin !== self.location.origin) return;
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
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});}
      return res;
    }).catch(()=>new Response('',{status:504,statusText:'Offline'})))
  );
});
