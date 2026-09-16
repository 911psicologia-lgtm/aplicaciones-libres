const CACHE='starfall-shell-v0.7.5';
const SHELL=[
  './','./index.html','./css/main.css','./manifest.webmanifest','./pwa-icon-192.png','./pwa-icon-512.png',
  './js/config.js','./js/world_content.js','./js/assets.js','./js/storage.js','./js/economy.js','./js/reactive_matrix.js','./js/audio.js','./js/ui.js','./js/game.js','./js/main.js'
];

function cacheableResponse(r){
  return !!r && r.status===200 && r.type!=='opaque' && !r.headers.get('content-range');
}

async function preCacheShell(){
  const cache=await caches.open(CACHE);
  await Promise.all(SHELL.map(async rel=>{
    try{
      const req=new Request(new URL(rel,self.registration.scope),{cache:'reload',credentials:'same-origin'});
      const res=await fetch(req);
      if(cacheableResponse(res)) await cache.put(req,res.clone());
    }catch(_e){ /* La instalación no debe caer por un recurso aislado. */ }
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(preCacheShell().then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('starfall-shell-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(!req || req.method!=='GET') return;

  let url;
  try{ url=new URL(req.url); }catch(_e){ return; }

  // No tocar extensiones del navegador, otros orígenes ni esquemas especiales.
  if(!/^https?:$/.test(url.protocol) || url.origin!==self.location.origin) return;

  // Audio/video y peticiones Range deben ir directo a red. Cache Storage no acepta 206.
  if(req.headers.has('range') || req.destination==='audio' || req.destination==='video') return;

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const res=await fetch(req,{cache:'no-store'});
        if(cacheableResponse(res)){
          const cache=await caches.open(CACHE);
          const key=new Request(new URL('./index.html',self.registration.scope),{credentials:'same-origin'});
          await cache.put(key,res.clone());
        }
        return res;
      }catch(_e){
        const cache=await caches.open(CACHE);
        return (await cache.match(new URL('./index.html',self.registration.scope))) || Response.error();
      }
    })());
    return;
  }

  const shellUrlSet=new Set(SHELL.map(rel=>new URL(rel,self.registration.scope).href));
  if(!shellUrlSet.has(url.href)) return;

  // Network-first evita mezclar JS viejo con HTML nuevo al desplegar builds.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const res=await fetch(req,{cache:'no-store'});
      if(cacheableResponse(res)) await cache.put(req,res.clone());
      return res;
    }catch(_e){
      return (await cache.match(req)) || Response.error();
    }
  })());
});
