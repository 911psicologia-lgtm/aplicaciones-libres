window.SF = window.SF || {};
(function(NS){
  const manifest={
    ships:{vanguard:'assets/ships/vanguard.png',warden:'assets/ships/warden.png',specter:'assets/ships/specter.png'},
    enemies:{raider:'assets/enemies/swarm_shell.png',striker:'assets/enemies/wing_raider.png',gunner:'assets/enemies/jelly_gunner.png',diver:'assets/enemies/spear_diver.png',guardian:'assets/enemies/blade_guard.png',miniboss:'assets/enemies/tentacle_guard.png',boss:'assets/enemies/sector_boss.png'},
    obstacles:['assets/obstacles/meteor_defender_a.png','assets/obstacles/meteor_defender_b.png','assets/obstacles/meteor_defender_c.png'],
    backgrounds:['assets/backgrounds/nebula.webp','assets/backgrounds/orbit.webp','assets/backgrounds/anomaly.webp']
  };
  const cache=new Map();
  function load(src){ if(cache.has(src)) return Promise.resolve(cache.get(src)); return new Promise(resolve=>{ const img=new Image(); img.decoding='async'; img.onload=()=>{cache.set(src,img);resolve(img)}; img.onerror=()=>resolve(null); img.src=src; }); }
  async function loadAll(){ const urls=[...Object.values(manifest.ships),...Object.values(manifest.enemies),...manifest.obstacles,...manifest.backgrounds]; await Promise.all(urls.map(load)); }
  NS.assets={manifest,cache,loadAll,getShip:id=>cache.get(manifest.ships[id]),getEnemy:kind=>cache.get(manifest.enemies[kind]),getObstacle:i=>cache.get(manifest.obstacles[i%manifest.obstacles.length]),getBackground:sector=>cache.get(manifest.backgrounds[(sector-1)%manifest.backgrounds.length])};
})(window.SF);
