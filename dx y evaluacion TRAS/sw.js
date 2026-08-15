const CACHE='tras-v0.16.27';
const ASSETS=['./','./index.html','./assets/css/styles.css','./assets/img/logo.png','./js/dataset.js','./js/signature-sample.js','./js/ui.js','./js/state.js','./js/encryption.js','./js/matrizca.js','./js/voice.js','./js/interview.js','./js/interpret.js','./js/export.js','./js/goldstein.js','./js/aiflow.js','./js/anexos.js','./js/personalidad.js','./js/demo.js','./js/v0164.js','./js/v0165.js','./js/v0166.js','./js/app.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(cached=>{
    const fresh=fetch(event.request).then(response=>{if(response&&response.ok&&new URL(event.request.url).origin===location.origin)caches.open(CACHE).then(c=>c.put(event.request,response.clone()));return response;}).catch(()=>cached);
    return cached||fresh;
  }));
});
