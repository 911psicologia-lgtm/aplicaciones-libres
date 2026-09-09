window.SF = window.SF || {};
(function(NS){
  const manifest={
    ships:{vanguard:'assets/ships/vanguard.png',warden:'assets/ships/warden.png',specter:'assets/ships/specter.png'},
    enemies:{raider:'assets/enemies/swarm_shell.png',striker:'assets/enemies/wing_raider.png',gunner:'assets/enemies/jelly_gunner.png',diver:'assets/enemies/spear_diver.png',sentinel:'assets/enemies/swarm_spider.png',reanimator:'assets/enemies/tentacle_guard.png',breeder:'assets/enemies/jelly_gunner.png',drone:'assets/enemies/swarm_shell.png',guardian:'assets/enemies/blade_guard.png',miniboss:'assets/enemies/tentacle_guard.png',boss:'assets/enemies/sector_boss.png'},
    obstacles:['assets/obstacles/meteor_defender_a.png','assets/obstacles/meteor_defender_b.png','assets/obstacles/meteor_defender_c.png'],
    backgrounds:['assets/backgrounds/nebula.webp','assets/backgrounds/orbit.webp','assets/backgrounds/anomaly.webp']
  };
  const cache=new Map();
  const worldLoaded=new Set();
  function load(src){
    if(!src) return Promise.resolve(null);
    if(cache.has(src)) return Promise.resolve(cache.get(src));
    return new Promise(resolve=>{
      const img=new Image(); img.decoding='async';
      img.onload=()=>{cache.set(src,img);resolve(img)};
      img.onerror=()=>resolve(null);
      img.src=src;
    });
  }
  function world(sector){
    const list=NS.worldContent?.worlds||[];
    return list.find(w=>w.id===sector)||null;
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
    const w=world(sector); if(!w) return null;
    if(worldLoaded.has(sector)) return w;
    await Promise.all(collectWorldUrls(w).map(load));
    worldLoaded.add(sector);
    return w;
  }
  async function loadAll(){
    const urls=[...new Set([...Object.values(manifest.ships),...Object.values(manifest.enemies),...manifest.obstacles,...manifest.backgrounds])];
    await Promise.all(urls.map(load));
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
  NS.assets={
    manifest,cache,loadAll,loadWorld,world,hasWorld:sector=>!!world(sector),
    getShip:id=>cache.get(manifest.ships[id]),
    getEnemy:kind=>cache.get(manifest.enemies[kind]),
    getObstacle:i=>cache.get(manifest.obstacles[i%manifest.obstacles.length]),
    getBackground:sector=>cache.get(manifest.backgrounds[(sector-1)%manifest.backgrounds.length]),
    getWorldMinion:worldMinion,getWorldSubboss:worldSubboss,getWorldBoss:worldBoss,getWorldProjectile:worldProjectile,getWorldObstacle:worldObstacle,getWorldBackground:worldBackground,getWorldPowerup:worldPowerup
  };
})(window.SF);
