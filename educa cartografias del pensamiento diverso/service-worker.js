const CACHE='cartografias-v3.9.1-aj-1474';
const CORE=[
  './','./index.html','./styles.css?v=3.9.1','./app.js?v=3.9.1','./manifest.webmanifest?v=3.9.1',
  './assets/guide-approved.png','./assets/guide-compact.png','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png',
  './data/cards.json','./data/dossiers.json','./data/historical-layer.json','./data/project-snapshot.json','./data/guide-messages.json','./data/collections.json','./data/taxonomy.json','./data/discipline-index.json',
  './data/card-schema-v2.json','./data/inventory-master.json','./data/source-policy.json'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  let url;try{url=new URL(request.url)}catch(e){return}
  if(url.origin!==self.location.origin||!['http:','https:'].includes(url.protocol))return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy)).catch(()=>{})}return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
    if(response&&response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{})}
    return response;
  })));
});
