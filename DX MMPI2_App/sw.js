const VERSION='mmpi2-suite-17.2-r1';
const FILES=['./','./index.html','./app.css?v=17.2','./app.js?v=17.2','./mmpi-data.js?v=17.2','./mmpi-engine.js?v=17.2','./mmpi-questions.js?v=17.2','./mmpi-sections.js?v=17.2','./mmpi-prompt.js?v=17.2','./mmpi-report.js?v=17.2','./mmpi-cases.js?v=17.2','./mmpi-io.js?v=17.2','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-512.png','./assets/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mmpi2-')&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Never cache imported files or generated reports. Only the application shell.
 const relative=url.href.slice(self.registration.scope.length),known=FILES.some(file=>file.replace(/^\.\//,'')===relative);
 if(request.mode==='navigate')event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put('./index.html',copy));}return response;}).catch(()=>caches.match('./index.html')));
 else if(known)event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(VERSION).then(cache=>cache.put(request,copy));}return response;})));
});
