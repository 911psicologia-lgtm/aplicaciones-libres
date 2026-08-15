const CACHE_NAME='tareas-sin-pelea-v4-2-3-pin-whatsapp';
const ASSETS=['./','./index.html','./manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.url.includes('sw.js'))return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request,{redirect:'follow'}).catch(()=>caches.match('./index.html'))));});
