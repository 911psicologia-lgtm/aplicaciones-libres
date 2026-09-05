const CACHE='starfall-frontier-v0.2.0';
const CORE=[
  './','index.html','css/main.css','js/config.js','js/assets.js','js/storage.js','js/audio.js','js/input.js','js/game.js','js/ui.js','js/main.js',
  'assets/ships/vanguard.png','assets/ships/warden.png','assets/ships/specter.png',
  'assets/backgrounds/nebula_sector.webp','assets/backgrounds/planetary_orbit.webp','assets/backgrounds/deep_space_anomaly.webp'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp;}).catch(()=>r)));});
