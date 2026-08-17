const CACHE='easy-speak-v0.4.5';
const ASSETS=[
  './','./index.html','./css/styles.css',
  './js/spanish.js','./js/storage.js','./js/scoring.js','./js/speech.js','./js/conversation-engine.js','./js/pronunciation.js','./js/app.js',
  './data/a1.js','./data/a2.js','./data/b1.js','./data/b2.js',
  './data/es-a1.js','./data/es-a2.js','./data/es-b1.js','./data/es-b2.js',
  './icons/icon-192.png','./icons/icon-512.png','./manifest.json'
];

self.addEventListener('install',event=>{
  // Intentionally do not call skipWaiting here. A new version stays waiting
  // until the user chooses the subtle in-app update action.
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  event.respondWith(
    caches.open(CACHE).then(async cache=>{
      const hit=await cache.match(event.request,{ignoreSearch:true});
      if(hit)return hit;
      try{
        const response=await fetch(event.request);
        if(response?.ok)cache.put(event.request,response.clone());
        return response;
      }catch{
        if(event.request.mode==='navigate')return cache.match('./index.html');
        throw new Error('offline');
      }
    })
  );
});
