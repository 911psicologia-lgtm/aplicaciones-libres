const SHELL_CACHE='tarjeticas-v0.5.0-shell';
const RUNTIME_CACHE='tarjeticas-v0.5.0-runtime';
const RUNTIME_LIMIT=180;
const SHELL=[
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/icon.svg','./data/phrases.js','./data/assets-manifest.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)));
});

self.addEventListener('activate',event=>{
  const allowed=new Set([SHELL_CACHE,RUNTIME_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>!allowed.has(key)).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});

async function trimRuntimeCache(){
  const cache=await caches.open(RUNTIME_CACHE);
  const keys=await cache.keys();
  if(keys.length<=RUNTIME_LIMIT)return;
  await Promise.all(keys.slice(0,keys.length-RUNTIME_LIMIT).map(request=>cache.delete(request)));
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  let url;
  try{url=new URL(request.url)}catch{return}

  // Evita el error de Cache.put con chrome-extension:// y otros esquemas no compatibles.
  if(url.protocol!=='http:'&&url.protocol!=='https:')return;
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(SHELL_CACHE).then(cache=>cache.put('./index.html',copy));
          }
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response.ok&&response.type==='basic'){
        const copy=response.clone();
        const shellFiles=SHELL.filter(item=>item!=='./').map(item=>item.replace('./',''));
        const target=shellFiles.some(file=>url.pathname.endsWith(file))?SHELL_CACHE:RUNTIME_CACHE;
        caches.open(target).then(cache=>cache.put(request,copy)).then(()=>target===RUNTIME_CACHE?trimRuntimeCache():undefined);
      }
      return response;
    }))
  );
});
