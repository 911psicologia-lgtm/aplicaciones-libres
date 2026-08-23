const CACHE='swarm-rift-v1.2.0';
const ASSETS=['./','./index.html','./css/game.css','./js/game.js','./manifest.json','./assets/icon.svg','./assets/logo.svg','./assets/player_ship.png','./assets/enemy_atlas.png','./assets/bg_rust_canyon.png','./assets/bg_toxic_ravine.png','./assets/bg_rift_tunnel.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('./index.html'))));});
