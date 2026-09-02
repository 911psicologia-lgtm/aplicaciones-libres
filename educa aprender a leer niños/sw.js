const CACHE='emilia-bosque-v0.4.1';
const ASSETS=[
'./','./index.html','./manifest.webmanifest','./css/tokens.css','./css/base.css','./css/screens.css','./css/animations.css',
'./data/content.js','./js/state/store.js','./js/audio/audio-bank.js','./js/audio/voice.js','./js/learning/mastery.js','./js/learning/tracing.js','./js/learning/scheduler.js','./js/learning/engine.js','./js/screens/renderers.js','./js/app.js',
'./assets/characters/lumi.svg','./assets/characters/lumi_guide.png','./assets/characters/lumi_thinking.png','./assets/characters/lumi_cheer.png','./assets/characters/lumi_victory.png','./assets/worlds/forest.svg','./assets/worlds/river.svg','./assets/worlds/sprout.svg','./assets/icons/app-icon.svg',
'./assets/objects/mama.svg','./assets/objects/papa.svg','./assets/objects/puma.svg','./assets/objects/sapo.svg','./assets/objects/sopa.svg','./assets/objects/lupa.svg','./assets/objects/mesa.svg','./assets/objects/mono.svg','./assets/objects/lola.svg'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('./index.html'))));});
