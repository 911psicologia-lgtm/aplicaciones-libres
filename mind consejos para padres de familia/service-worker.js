const CACHE='puentes-v1.11.0';
const CORE=[
  './',
  './index.html',
  './styles.css?v=1.11.0',
  './app.js?v=1.11.0',
  './manifest.webmanifest?v=1.11.0',
  './data/cards.json',
  './data/cards.js?v=1.0.0',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/scenes/scene-01.png?v=1.11.0',
  './assets/scenes/scene-02.png?v=1.11.0',
  './assets/scenes/scene-03.png?v=1.11.0',
  './assets/scenes/scene-04.png?v=1.11.0',
  './assets/scenes/scene-05.png?v=1.11.0',
  './assets/scenes/scene-06.png?v=1.11.0',
  './assets/scenes/scene-07.png?v=1.11.0',
  './assets/scenes/scene-08.png?v=1.11.0',
  './assets/scenes/scene-09.png?v=1.11.0',
  './assets/scenes/scene-10.png?v=1.11.0',
  './assets/scenes/scene-11.png?v=1.11.0',
  './assets/scenes/scene-12.png?v=1.11.0',
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});


self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirst(request){
  try{
    const response=await fetch(request);
    if(response&&response.ok){
      const cache=await caches.open(CACHE);
      cache.put(request,response.clone());
    }
    return response;
  }catch(error){
    return (await caches.match(request)) || (request.mode==='navigate' ? caches.match('./index.html') : Promise.reject(error));
  }
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(event.request.mode==='navigate' || ['script','style','worker','manifest'].includes(event.request.destination)){
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
      if(response&&response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});
