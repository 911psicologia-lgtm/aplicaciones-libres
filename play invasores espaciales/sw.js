const CACHE='starfall-shell-v0.6.1';
const SHELL=[
  './','./index.html','./css/main.css','./manifest.webmanifest','./pwa-icon-192.png','./pwa-icon-512.png',
  './js/config.js','./js/world_content.js','./js/assets.js','./js/storage.js','./js/economy.js','./js/reactive_matrix.js','./js/audio.js','./js/ui.js','./js/game.js','./js/main.js'
];
self.addEventListener('install',event=>{ event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',event=>{ event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k.startsWith('starfall-shell-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r;}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(SHELL.some(p=>url.pathname.endsWith(p.replace('./','')))) event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});
