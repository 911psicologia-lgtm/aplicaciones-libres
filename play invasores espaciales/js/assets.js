window.SF = window.SF || {};
(function(NS){
  const manifest={
    ships:{vanguard:'assets/ships/vanguard.png',warden:'assets/ships/warden.png',specter:'assets/ships/specter.png'},
    enemies:{raider:'assets/enemies/swarm_shell.png',striker:'assets/enemies/wing_raider.png',gunner:'assets/enemies/jelly_gunner.png',diver:'assets/enemies/spear_diver.png',sentinel:'assets/enemies/swarm_spider.png',reanimator:'assets/enemies/tentacle_guard.png',breeder:'assets/enemies/jelly_gunner.png',drone:'assets/enemies/swarm_shell.png',guardian:'assets/enemies/blade_guard.png',miniboss:'assets/enemies/tentacle_guard.png',boss:'assets/enemies/sector_boss.png'},
    obstacles:['assets/obstacles/meteor_defender_a.png','assets/obstacles/meteor_defender_b.png','assets/obstacles/meteor_defender_c.png'],
    backgrounds:['assets/backgrounds/nebula.webp','assets/backgrounds/orbit.webp','assets/backgrounds/anomaly.webp']
  };
  const cache=new Map();
  const pending=new Map();
  const worldLoaded=new Set();
  const loadHealth={attempted:new Set(),failed:new Set(),timeouts:new Set()};
  function loadOnce(src,timeoutMs=14000){
    return new Promise(resolve=>{
      const img=new Image(); img.decoding='async'; let done=false;
      const finish=(value,timeout=false)=>{ if(done) return; done=true; clearTimeout(timer); img.onload=null; img.onerror=null; if(timeout) loadHealth.timeouts.add(src); resolve(value); };
      const timer=setTimeout(()=>finish(null,true),timeoutMs);
      img.onload=()=>finish(img,false); img.onerror=()=>finish(null,false); img.src=src;
    });
  }
  async function load(src,opts={}){
    if(!src) return null;
    if(cache.has(src)) return cache.get(src);
    if(pending.has(src)) return pending.get(src);
    loadHealth.attempted.add(src);
    const task=(async()=>{
      const retries=Math.max(0,Number(opts.retries??1)); const timeoutMs=Math.max(4000,Number(opts.timeoutMs??14000));
      let img=null;
      for(let attempt=0;attempt<=retries && !img;attempt++) img=await loadOnce(src,timeoutMs+(attempt*4000));
      if(img){ cache.set(src,img); loadHealth.failed.delete(src); loadHealth.timeouts.delete(src); }
      else loadHealth.failed.add(src);
      pending.delete(src); return img;
    })();
    pending.set(src,task); return task;
  }
  async function loadBatch(urls,concurrency){
    const queue=[...new Set((urls||[]).filter(Boolean))];
    const limit=Math.max(2,Math.min(10,concurrency||6)); let cursor=0;
    async function worker(){ while(cursor<queue.length){ const i=cursor++; await load(queue[i]); } }
    await Promise.all(Array.from({length:Math.min(limit,queue.length||1)},worker));
  }
  function normalizeWorldSector(sector){
    const list=NS.worldContent?.worlds||[];
    if(!Number.isFinite(sector) || sector<1 || !list.length) return 0;
    const maxIntegrated=Math.min(NS.config?.worldFamilies?.maxIntegratedWorld||list.length,list.length);
    if(sector<=maxIntegrated) return sector;
    if(NS.config?.worldFamilies?.cycleBeyondIntegrated===false) return 0;
    return ((sector-1)%maxIntegrated)+1;
  }
  function world(sector){
    const list=NS.worldContent?.worlds||[];
    const normalized=normalizeWorldSector(sector);
    return list.find(w=>w.id===normalized)||null;
  }
  function collectWorldUrls(w){
    if(!w) return [];
    const urls=[];
    Object.values(w.minions||{}).forEach(m=>urls.push(m.base,m.elite,m.sheet));
    (w.subbosses||[]).forEach(s=>urls.push(s.base,s.sheet));
    if(w.boss) urls.push(w.boss.base,w.boss.phasesSheet,w.boss.openCore,w.boss.deathSheet,w.boss.relicSheet);
    (w.projectiles||[]).forEach(p=>urls.push(p.sheet));
    Object.values(w.powerups||{}).forEach(p=>urls.push(p));
    (w.obstacles||[]).forEach(o=>urls.push(o.path));
    Object.values(w.backgrounds||{}).forEach(bg=>urls.push(bg));
    return [...new Set(urls.filter(Boolean))];
  }
  async function loadWorld(sector){
    const normalized=normalizeWorldSector(sector);
    const w=world(normalized); if(!w) return null;
    if(worldLoaded.has(normalized)) return w;
    await loadBatch(collectWorldUrls(w),(typeof innerWidth!=='undefined'&&innerWidth<=700)?4:7);
    worldLoaded.add(normalized);
    return w;
  }
  function unloadWorld(sector){
    const normalized=normalizeWorldSector(sector);
    const w=world(normalized); if(!w) return 0;
    let removed=0;
    for(const src of collectWorldUrls(w)){
      if(cache.delete(src)) removed++;
    }
    worldLoaded.delete(normalized);
    return removed;
  }
  function trimWorldCache(keepSectors=[]){
    const keep=new Set((keepSectors||[]).filter(n=>Number.isFinite(n)&&n>0));
    let removed=0;
    for(const w of (NS.worldContent?.worlds||[])){
      if(!keep.has(w.id) && worldLoaded.has(w.id)) removed+=unloadWorld(w.id);
    }
    return removed;
  }
  async function loadAll(){
    const urls=[...new Set([...Object.values(manifest.ships),...Object.values(manifest.enemies),...manifest.obstacles,...manifest.backgrounds])];
    await loadBatch(urls,(typeof innerWidth!=='undefined'&&innerWidth<=700)?4:7);
    // Solo precarga el primer mundo. Los demás se cargan al entrar para mantener la app ligera.
    await loadWorld(1);
  }
  function worldMinion(sector,role,elite=false){
    const w=world(sector), m=w?.minions?.[role];
    if(!m) return null;
    return {img:cache.get(elite?m.elite:m.base)||cache.get(m.base)||null,sheet:cache.get(m.sheet)||null,frames:m.frames||6,role,worldId:w.id};
  }
  function worldSubboss(sector,index=0){
    const w=world(sector), s=w?.subbosses?.[index%Math.max(1,w?.subbosses?.length||1)];
    if(!s) return null;
    return {img:cache.get(s.base)||null,sheet:cache.get(s.sheet)||null,frames:s.frames||8,id:s.id,worldId:w.id};
  }
  function worldBoss(sector){
    const w=world(sector), b=w?.boss; if(!b) return null;
    return {name:b.name,img:cache.get(b.base)||null,phasesSheet:cache.get(b.phasesSheet)||null,phaseFrames:b.phaseFrames||6,openCore:cache.get(b.openCore)||null,deathSheet:cache.get(b.deathSheet)||null,deathFrames:b.deathFrames||8,relicSheet:cache.get(b.relicSheet)||null,relicFrames:b.relicFrames||3,worldId:w.id};
  }
  function worldProjectile(sector,index=0){
    const w=world(sector), p=w?.projectiles?.[index%Math.max(1,w?.projectiles?.length||1)]; if(!p) return null;
    return {sheet:cache.get(p.sheet)||null,frames:p.frames||6,worldId:w.id,index};
  }
  function worldObstacle(sector,index=0){
    const w=world(sector), o=w?.obstacles?.[index%Math.max(1,w?.obstacles?.length||1)];
    if(!o) return null; return {img:cache.get(o.path)||null,source:o.source,worldId:w.id};
  }
  function worldBackground(sector,phase='base'){
    const w=world(sector), src=w?.backgrounds?.[phase]||w?.backgrounds?.base; return src?cache.get(src)||null:null;
  }
  function worldPowerup(sector,key){
    const w=world(sector), src=w?.powerups?.[key]; return src?cache.get(src)||null:null;
  }
  function health(){ const expected=loadHealth.attempted.size,failed=[...loadHealth.failed],timeouts=[...loadHealth.timeouts]; return {expected,loaded:Math.max(0,expected-failed.length),failed,timeouts,pending:pending.size}; }
  async function retryFailed(){ const list=[...loadHealth.failed]; if(!list.length) return health(); await loadBatch(list,(typeof innerWidth!=='undefined'&&innerWidth<=700)?3:5); return health(); }
  NS.assets={
    manifest,cache,loadAll,loadWorld,world,normalizeWorldSector,hasWorld:sector=>!!world(sector),health,retryFailed,
    getShip:id=>cache.get(manifest.ships[id]),
    getEnemy:kind=>cache.get(manifest.enemies[kind]),
    getObstacle:i=>cache.get(manifest.obstacles[i%manifest.obstacles.length]),
    getBackground:sector=>cache.get(manifest.backgrounds[(sector-1)%manifest.backgrounds.length]),
    getWorldMinion:worldMinion,getWorldSubboss:worldSubboss,getWorldBoss:worldBoss,getWorldProjectile:worldProjectile,getWorldObstacle:worldObstacle,getWorldBackground:worldBackground,getWorldPowerup:worldPowerup,unloadWorld,trimWorldCache
  };
})(window.SF);
