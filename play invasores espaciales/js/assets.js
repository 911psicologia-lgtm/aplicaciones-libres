window.SF = window.SF || {};
SF.Assets = (() => {
  const manifest = {
    ship_vanguard:'assets/ships/vanguard.png',
    ship_warden:'assets/ships/warden.png',
    ship_specter:'assets/ships/specter.png',
    enemy_swarm_1:'assets/enemies/swarm_1.png',
    enemy_swarm_2:'assets/enemies/swarm_2.png',
    enemy_swarm_3:'assets/enemies/swarm_3.png',
    enemy_swarm_4:'assets/enemies/swarm_4.png',
    enemy_attacker_1:'assets/enemies/attacker_1.png',
    enemy_attacker_2:'assets/enemies/attacker_2.png',
    enemy_attacker_3:'assets/enemies/attacker_3.png',
    enemy_elite_1:'assets/enemies/elite_1.png',
    vfx_beam:'assets/vfx/plasma_beam.png',
    vfx_spread:'assets/vfx/spread_shot.png',
    vfx_missiles:'assets/vfx/missile_volley.png',
    vfx_shield:'assets/vfx/shield.png',
    vfx_chain:'assets/vfx/chain_lightning.png',
    vfx_emp:'assets/vfx/emp_burst.png',
    obs_planet:'assets/obstacles/planet.png',
    obs_destroyed:'assets/obstacles/destroyed_planet.png',
    obs_asteroids:'assets/obstacles/asteroid_cluster.png',
    obs_meteor_large:'assets/obstacles/meteor_large.png',
    obs_meteor_medium:'assets/obstacles/meteor_medium.png',
    obs_meteor_small:'assets/obstacles/meteor_small.png',
    obs_wreckage_a:'assets/obstacles/wreckage_a.png',
    obs_wreckage_b:'assets/obstacles/wreckage_b.png',
    obs_wreckage_c:'assets/obstacles/wreckage_c.png',
    obs_wreckage_d:'assets/obstacles/wreckage_d.png',
    bg_nebula:'assets/backgrounds/nebula_sector.webp',
    bg_orbit:'assets/backgrounds/planetary_orbit.webp',
    bg_anomaly:'assets/backgrounds/deep_space_anomaly.webp'
  };
  const images = {};
  const spriteCache = new Map();
  const coverCache = new Map();
  const deferredIds = new Set(['vfx_beam','vfx_spread','vfx_missiles','vfx_shield','vfx_chain','vfx_emp']);
  let ready = false;

  async function loadOne(id){
    if(images[id])return images[id];
    const src=manifest[id];if(!src)return null;
    return new Promise(resolve=>{
      const img=new Image();img.decoding='async';
      img.onload=()=>{images[id]=img;resolve(img);};
      img.onerror=()=>{console.warn('Asset failed',id,src);resolve(null);};
      img.src=src;
    });
  }

  async function loadAll(onProgress){
    // Large VFX concept PNGs are kept on disk but deferred: active gameplay powers
    // use procedural Canvas effects, avoiding unnecessary startup memory.
    const entries = Object.entries(manifest).filter(([id])=>!deferredIds.has(id));
    let done=0;
    await Promise.all(entries.map(([id,src]) => new Promise(resolve => {
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{images[id]=img;done++;onProgress?.(done,entries.length,id);resolve();};
      img.onerror=()=>{console.warn('Asset failed',id,src);done++;onProgress?.(done,entries.length,id);resolve();};
      img.src=src;
    })));
    ready=true;
    return images;
  }

  function get(id){ return images[id] || null; }
  function has(id){ return !!images[id]; }

  function drawContain(ctx,id,x,y,w,h,opt={}){
    const img=get(id);
    if(!img) return false;
    const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
    const s=Math.min(w/iw,h/ih);
    const dw=iw*s, dh=ih*s;
    ctx.save();
    ctx.globalAlpha=opt.alpha ?? 1;
    if(opt.filter) ctx.filter=opt.filter;
    if(opt.glow){ctx.shadowColor=opt.glow;ctx.shadowBlur=opt.glowBlur ?? 12;}
    const cx=x+w/2,cy=y+h/2;
    ctx.translate(cx,cy);
    if(opt.rotation) ctx.rotate(opt.rotation);
    if(opt.scaleX===-1) ctx.scale(-1,1);
    ctx.drawImage(img,-dw/2,-dh/2,dw,dh);
    ctx.restore();
    return true;
  }

  function cacheLimit(){return SF.Config?.performance?.spriteCacheEntries||72;}
  function quant(v,step=6){return Math.max(step,Math.round(v/step)*step);}

  function getCachedSprite(id,w,h){
    const img=get(id);if(!img)return null;
    const cw=quant(w),ch=quant(h),key=`${id}:${cw}x${ch}`;
    let c=spriteCache.get(key);
    if(c){
      // refresh LRU position
      spriteCache.delete(key);spriteCache.set(key,c);return c;
    }
    c=document.createElement('canvas');c.width=cw;c.height=ch;
    const cc=c.getContext('2d',{alpha:true});
    const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
    const s=Math.min(cw/iw,ch/ih),dw=iw*s,dh=ih*s;
    cc.clearRect(0,0,cw,ch);cc.drawImage(img,(cw-dw)/2,(ch-dh)/2,dw,dh);
    spriteCache.set(key,c);
    while(spriteCache.size>cacheLimit())spriteCache.delete(spriteCache.keys().next().value);
    return c;
  }

  // Fast path for repeated gameplay sprites. It avoids re-scaling large PNGs and
  // avoids expensive shadowBlur per enemy every frame.
  function drawFast(ctx,id,x,y,w,h,opt={}){
    const c=getCachedSprite(id,w,h);if(!c)return false;
    const alpha=opt.alpha ?? 1,rot=opt.rotation||0,flip=opt.scaleX===-1,filter=opt.filter||'';
    if(alpha===1&&!rot&&!flip&&!filter){ctx.drawImage(c,x,y,w,h);return true;}
    ctx.save();ctx.globalAlpha=alpha;if(filter)ctx.filter=filter;
    const cx=x+w/2,cy=y+h/2;ctx.translate(cx,cy);if(rot)ctx.rotate(rot);if(flip)ctx.scale(-1,1);
    ctx.drawImage(c,-w/2,-h/2,w,h);ctx.restore();return true;
  }

  function getCoverCache(id,w,h){
    const img=get(id);if(!img)return null;
    const qw=Math.max(64,Math.round(w/8)*8),qh=Math.max(64,Math.round(h/8)*8);
    const key=`${id}:${qw}x${qh}`;
    let hit=coverCache.get(key);
    if(hit){coverCache.delete(key);coverCache.set(key,hit);return hit;}
    const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
    const scale=Math.max(qw/iw,qh/ih),dw=Math.ceil(iw*scale),dh=Math.ceil(ih*scale);
    const c=document.createElement('canvas');c.width=dw;c.height=dh;
    c.getContext('2d',{alpha:false}).drawImage(img,0,0,dw,dh);
    hit={canvas:c,dw,dh,qw,qh};coverCache.set(key,hit);
    while(coverCache.size>2)coverCache.delete(coverCache.keys().next().value);
    return hit;
  }

  function drawCover(ctx,id,w,h,offset=0,alpha=1){
    const bg=getCoverCache(id,w,h);if(!bg)return false;
    const sx=w/bg.qw,sy=h/bg.qh;
    const dw=bg.dw*sx,dh=bg.dh*sy,x=(w-dw)/2;
    const off=((offset%dh)+dh)%dh;
    ctx.save();ctx.globalAlpha=alpha;
    ctx.drawImage(bg.canvas,x,-off,dw,dh);
    ctx.drawImage(bg.canvas,x,-off+dh,dw,dh);
    if(-off+2*dh<h)ctx.drawImage(bg.canvas,x,-off+2*dh,dw,dh);
    ctx.restore();return true;
  }

  function clearSpriteCache(){spriteCache.clear();coverCache.clear();}

  return {manifest,images,loadAll,loadOne,get,has,drawContain,drawFast,drawCover,clearSpriteCache,get ready(){return ready;}};
})();
