window.SF = window.SF || {};
(function(NS){
  const C = NS.config;
  const UI = ()=>NS.ui;
  const S = ()=>NS.storage;
  const A = ()=>NS.audio;

  const G = {
    canvas:null, ctx:null, w:0, h:0, dpr:1,
    mode:'menu', running:false, paused:false,
    player:'', shipId:null, ship:null,
    sector:1, wave:1, score:0, nextLifeAt:C.progression.extraLifeEvery,
    hp:10, maxHp:10, lives:3, invulnUntil:0,
    px:0, py:0, pw:34, ph:50, vx:0, vy:0,
    keys:{}, pointer:{active:false,x:0,y:0},
    enemies:[], playerBullets:[], enemyBullets:[], particles:[], texts:[], powerDrops:[], rewardPods:[], obstacles:[],
    formation:{x:0,y:0,vx:84,dir:1,width:0,height:0},
    phase:'wave', phaseName:'FORMACIÓN', subphase:0, checkpointWave:1, checkpoint:null,
    timers:{fire:0, enemyFire:0, dive:0, save:0, reward:0, hitFx:0},
    stars:[], shake:0, combo:0, comboUntil:0,
    activePowers:{spread:0, shield:0, chain:0, missile:0, overdrive:0},
    backgroundTick:0, lastTs:0, bgOffset:0,
    lowFx:false, threatPulseUntil:0
  };

  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function rectHit(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function circleRect(cx,cy,r,rect){ const nx=clamp(cx,rect.x,rect.x+rect.w), ny=clamp(cy,rect.y,rect.y+rect.h); const dx=cx-nx, dy=cy-ny; return dx*dx+dy*dy<=r*r; }

  function currentSectorCfg(){ return C.sectors[(G.sector-1)%C.sectors.length]; }
  function currentPowerText(){
    const now = performance.now();
    const list=[];
    if(G.activePowers.spread>now) list.push('DISP');
    if(G.activePowers.shield>now) list.push('ESC');
    if(G.activePowers.chain>now) list.push('CAD');
    if(G.activePowers.missile>now) list.push('MIS');
    if(G.activePowers.overdrive>now) list.push('OVR');
    return list.join(' · ');
  }
  function snapshot(){
    return {
      player:G.player, shipId:G.shipId, ship:G.ship, sector:G.sector, wave:G.wave, score:G.score,
      hp:G.maxHp, maxHp:G.maxHp, lives:G.lives, nextLifeAt:G.nextLifeAt, checkpointWave:G.checkpointWave,
      phase:G.phase, phaseName:G.phaseName
    };
  }
  function saveProgress(){ S().saveGame(snapshot()); }
  function setCheckpoint(){
    G.checkpointWave = G.wave;
    G.checkpoint = snapshot();
    saveProgress();
    A().checkpoint();
    addText(G.w*.5, G.h*.3, 'CHECKPOINT', '#9ce8ff', 1100, 0, -18, true);
    UI().flashMsg(`CHECKPOINT OLEADA ${G.wave}`, 900);
  }
  function bestScore(){ const r=S().loadRanking(); return r.length?r[0].score:0; }

  function addText(x,y,text,color='#fff',life=800,vx=0,vy=-24,bold=false){ G.texts.push({x,y,text,color,life,maxLife:life,vx,vy,bold}); }
  function explode(x,y,color='#fff',count=8,speed=120){
    const n = G.lowFx ? Math.max(4,Math.floor(count*.45)) : count;
    for(let i=0;i<n;i++) G.particles.push({x,y,vx:rand(-speed,speed),vy:rand(-speed,speed),life:rand(260,620),maxLife:620,size:rand(1.5,3.8),color});
  }

  function init(canvas){
    G.canvas=canvas; G.ctx=canvas.getContext('2d'); resize(); seedStars();
    bindInput();
  }

  function resize(){
    G.w = window.innerWidth; G.h = window.innerHeight;
    G.dpr = (G.w*G.h > 1_350_000) ? 1 : Math.min(window.devicePixelRatio||1, 2);
    G.canvas.width = Math.floor(G.w*G.dpr); G.canvas.height = Math.floor(G.h*G.dpr);
    G.canvas.style.width = G.w+'px'; G.canvas.style.height = G.h+'px';
    G.ctx.setTransform(G.dpr,0,0,G.dpr,0,0);
    G.px = clamp(G.px||G.w*.5, 28, G.w-28); G.py = clamp(G.py||G.h*.78, G.h*.42, G.h-42);
  }

  function seedStars(){
    G.stars = Array.from({length: Math.max(70,Math.floor(G.w*G.h/16000))}, ()=>({x:Math.random()*G.w, y:Math.random()*G.h, z:Math.random()*1+0.2, a:Math.random()*0.8+0.2}));
  }

  function resetArrays(){ G.enemies=[]; G.playerBullets=[]; G.enemyBullets=[]; G.particles=[]; G.texts=[]; G.powerDrops=[]; G.rewardPods=[]; G.obstacles=[]; }

  function startNew(player, shipId){
    const ship = C.ships.find(s=>s.id===shipId) || C.ships[0];
    Object.assign(G, { running:true, paused:false, mode:'game', player, shipId:ship.id, ship,
      sector:1, wave:1, score:0, nextLifeAt:C.progression.extraLifeEvery,
      hp:ship.hp, maxHp:ship.hp, lives:3, invulnUntil:0, phase:'wave', phaseName:'FORMACIÓN', subphase:0,
      combo:0, comboUntil:0, activePowers:{spread:0,shield:0,chain:0,missile:0,overdrive:0}, backgroundTick:0, lowFx:false
    });
    G.px=G.w*.5; G.py=G.h*.82; resetArrays(); buildStage(); setCheckpoint(); UI().showHud(true); UI().hideScreens();
  }

  function continueFromSave(data){
    const ship = C.ships.find(s=>s.id===data.shipId) || C.ships[0];
    Object.assign(G, { running:true, paused:false, mode:'game', player:data.player||'PILOTO', shipId:ship.id, ship,
      sector:data.sector||1, wave:data.wave||1, score:data.score||0, nextLifeAt:data.nextLifeAt||C.progression.extraLifeEvery,
      hp:data.hp||ship.hp, maxHp:data.maxHp||ship.hp, lives:data.lives||3, invulnUntil:0,
      checkpointWave:data.checkpointWave||data.wave||1, phase:'wave', phaseName:'FORMACIÓN', subphase:0,
      combo:0, comboUntil:0, activePowers:{spread:0,shield:0,chain:0,missile:0,overdrive:0}, backgroundTick:0, lowFx:false
    });
    G.px=G.w*.5; G.py=G.h*.82; resetArrays(); buildStage(); G.checkpoint=snapshot(); UI().showHud(true); UI().hideScreens();
  }

  function buildStage(){
    resetArrays();
    G.phase = 'wave'; G.phaseName = G.wave===C.progression.bossWave ? 'AVANZADA' : G.wave===C.progression.miniBossWave ? 'PRESIÓN' : 'FORMACIÓN';
    buildObstacles(); buildWaveFormation(); buildRewardPods(); A().wave(); UI().flashMsg(`SECTOR ${G.sector} · OLEADA ${G.wave}`, 1100);
    if(C.progression.checkpointEveryWave) setCheckpoint(); else saveProgress();
  }

  function buildObstacles(){
    const count = clamp(C.obstacles.baseCount + ((G.wave>=4||G.sector>=2)?1:0), 1, C.obstacles.maxCount);
    for(let i=0;i<count;i++){
      const r = rand(C.obstacles.radius[0], C.obstacles.radius[1]);
      G.obstacles.push({
        x: G.w*(count===1?.5:(i===0?.34:.66)),
        y: G.h*(0.34 + i*0.08), r, hp: Math.round(C.obstacles.hpBase + G.sector*4 + G.wave*2 + r*.2), maxHp: Math.round(C.obstacles.hpBase + G.sector*4 + G.wave*2 + r*.2),
        angle: Math.random()*Math.PI*2, spin: rand(C.obstacles.spinRange[0], C.obstacles.spinRange[1]) * (Math.random()<.5?-1:1), alive:true
      });
    }
  }

  function buildWaveFormation(){
    const portrait = G.h >= G.w;
    const colsMax = portrait ? C.wave.maxColsPortrait : C.wave.maxColsLandscape;
    const rowsMax = portrait ? C.wave.maxRowsPortrait : C.wave.maxRowsLandscape;
    const cols = clamp(C.wave.startCols + Math.floor((G.sector-1)*1.4) + (G.wave>2?1:0), C.wave.startCols, colsMax);
    const rows = clamp(C.wave.startRows + Math.floor((G.sector-1)*0.7) + (G.wave>3?1:0), C.wave.startRows, rowsMax);
    const spacingX = C.wave.baseSpacingX + (portrait?1:2);
    const spacingY = C.wave.baseSpacingY + (portrait?0:1);
    const ew = 28, eh = 26;
    const width = cols*ew + (cols-1)*spacingX;
    const startX = Math.max(22, (G.w-width)/2);
    const startY = 84;
    G.formation = {x:startX, y:startY, vx:C.wave.baseEnemySpeed + (G.sector-1)*C.wave.stepEnemySpeed + G.wave*6, dir:1, width, height: rows*eh + (rows-1)*spacingY};

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const kind = r===0 ? 'striker' : (r<=2 ? 'raider' : (Math.random()<0.23?'gunner':'raider'));
        const hp = kind==='gunner' ? 3 + Math.floor(G.sector*.35) : kind==='striker' ? 2 + Math.floor(G.sector*.25) : 2;
        G.enemies.push({
          kind, role:'formation', row:r,col:c, ox:c*(ew+spacingX), oy:r*(eh+spacingY), w:ew,h:eh,
          x:startX+c*(ew+spacingX), y:startY+r*(eh+spacingY), hp, maxHp:hp, alive:true,
          shootBias: Math.random(), nextShot: performance.now()+rand(900,4200), zig: Math.random()<C.wave.zigzagRatio, zigSeed: Math.random()*Math.PI*2,
          score: kind==='gunner'?55: kind==='striker'?45:35,
          color: kind==='gunner' ? '#ff856f' : kind==='striker' ? '#b497ff' : '#71e8ff'
        });
      }
    }
    if(G.wave>=2){ spawnGuard(false); }
    if(G.wave===C.progression.miniBossWave){ spawnGuard(true); }
    if(G.wave===C.progression.bossWave){ spawnGuard(true); }
  }

  function spawnGuard(mini=false){
    const hp = mini ? 16 + G.sector*6 + G.wave*2 : 9 + G.sector*4 + G.wave;
    G.enemies.push({
      kind: mini ? 'miniboss' : 'guardian', role: mini ? 'miniboss' : 'guardian', x: G.w*.5-38, y: 50, w:76, h:54,
      baseX:G.w*.5-38, baseY:64, hp, maxHp:hp, alive:true, t:0, score: mini?420:180, color: mini?'#ffb969':'#ffa07a', shootBias:0, nextShot:performance.now()+700
    });
    mini ? A().miniboss() : UI().flashMsg('GUARDIÁN ENTRANTE', 850);
  }

  function spawnBoss(){
    G.phase = 'boss'; G.phaseName='JEFE';
    const hp = 46 + G.sector*16;
    G.enemies.push({ kind:'boss', role:'boss', x:G.w*.5-88, y:62, w:176, h:106, baseX:G.w*.5-88, baseY:62, hp, maxHp:hp, alive:true, t:0, score:1300+G.sector*240, color:'#ff8466', nextShot:performance.now()+800, burst:0 });
    UI().flashMsg(`JEFE DEL SECTOR ${G.sector}`, 1100); A().boss();
  }

  function buildRewardPods(){
    const kinds = ['spread','shield','chain','missile','heal','overdrive','emp'];
    const pod1 = {x:G.w*0.25, y: G.h*0.42, w:24,h:24,hp:3,maxHp:3, kind:pick(kinds), bob:Math.random()*Math.PI*2, open:false};
    const pod2 = {x:G.w*0.75, y: G.h*0.68, w:24,h:24,hp:3,maxHp:3, kind:Math.random()<0.18?'life':'heal', bob:Math.random()*Math.PI*2, open:false};
    G.rewardPods.push(pod1);
    if(G.wave>=2 || Math.random()<0.5) G.rewardPods.push(pod2);
  }

  function spawnPowerDrop(x,y,kind){ G.powerDrops.push({x,y,w:20,h:20,kind,vy:80,life:10000,blink:0,phase:Math.random()*Math.PI*2}); }

  function bindInput(){
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', e=>{
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S','p','P'].includes(e.key)) e.preventDefault();
      G.keys[e.key]=true;
      if((e.key==='p'||e.key==='P') && G.running) togglePause();
    });
    window.addEventListener('keyup', e=>{ G.keys[e.key]=false; });
    const down = e => { A().ensure(); G.pointer.active=true; const p = getPoint(e); G.pointer.x=p.x; G.pointer.y=p.y; };
    const move = e => { if(!G.pointer.active) return; const p = getPoint(e); G.pointer.x=p.x; G.pointer.y=p.y; };
    const up = ()=>{ G.pointer.active=false; };
    G.canvas.addEventListener('mousedown', down); G.canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    G.canvas.addEventListener('touchstart', e=>{ down(e.touches[0]); }, {passive:false});
    G.canvas.addEventListener('touchmove', e=>{ e.preventDefault(); move(e.touches[0]); }, {passive:false});
    window.addEventListener('touchend', up, {passive:true});
  }
  function getPoint(e){ const rect=G.canvas.getBoundingClientRect(); return {x:e.clientX-rect.left, y:e.clientY-rect.top}; }

  function update(dt, now){
    if(!G.running || G.paused) return;
    G.lowFx = dt > 20;
    updatePlayer(dt, now);
    autoShoot(now);
    updateFormation(dt, now);
    maybeLaunchDiver(now);
    updateEnemies(dt, now);
    updateBullets(dt, now);
    updateObstacles(dt);
    updatePowerDrops(dt, now);
    updateRewardPods(dt, now);
    updateParticles(dt);
    updateTexts(dt);
    updateProgression(now);
    if(G.score >= G.nextLifeAt){ G.lives++; G.nextLifeAt += C.progression.extraLifeEvery; A().extraLife(); addText(G.px,G.py-30,'VIDA EXTRA','#ffd86b',1300,0,-20,true); }
    if(now > G.comboUntil) G.combo = 0;
    if(now - G.timers.save > 2300){ G.timers.save = now; saveProgress(); }
  }

  function updatePlayer(dt, now){
    const k = G.keys; const speed = G.ship.speed * (now < G.activePowers.overdrive ? 1.25 : 1);
    let mx=0,my=0;
    if(k.ArrowLeft||k.a||k.A) mx -= 1;
    if(k.ArrowRight||k.d||k.D) mx += 1;
    if(k.ArrowUp||k.w||k.W) my -= 1;
    if(k.ArrowDown||k.s||k.S) my += 1;
    if(G.pointer.active){
      G.px += (G.pointer.x - G.px) * Math.min(1, dt/70);
      G.py += (G.pointer.y - G.py) * Math.min(1, dt/70);
    } else {
      const mag = Math.hypot(mx,my)||1;
      G.px += (mx/mag) * speed * dt/1000;
      G.py += (my/mag) * speed * dt/1000;
    }
    G.px = clamp(G.px, 28, G.w-28);
    G.py = clamp(G.py, G.h*0.38, G.h-36);
  }

  function autoShoot(now){
    const rate = G.ship.fireRate * (now < G.activePowers.overdrive ? 0.75 : 1);
    if(now - G.timers.fire < rate*1000) return;
    G.timers.fire = now; A().shot();
    const damage = G.ship.damage;
    firePlayerBullet(G.px, G.py-28, 0, -620, 8, 18, damage, '#bfefff');
    const spread = G.activePowers.spread>now;
    if(spread){ firePlayerBullet(G.px-12, G.py-22, -130, -590, 7, 15, damage, '#ffcf89'); firePlayerBullet(G.px+12, G.py-22, 130, -590, 7, 15, damage, '#ffcf89'); }
    if(G.activePowers.missile>now && Math.random()<0.72){ firePlayerBullet(G.px-16,G.py-14,-35,-460,8,18,damage*2,'#ffd067',true); firePlayerBullet(G.px+16,G.py-14,35,-460,8,18,damage*2,'#ffd067',true); A().power('missile'); }
  }
  function firePlayerBullet(x,y,vx,vy,w,h,damage,color,isMissile=false){ G.playerBullets.push({x:x-w/2,y:y-h/2,w,h,vx,vy,damage,color,isMissile,life:2200}); }
  function fireEnemyBullet(x,y,vx,vy,r,color,damage=1,type='orb'){ G.enemyBullets.push({x,y,w:r*2,h:r*2,vx,vy,r,color,damage,type,life:4200}); }

  function updateFormation(dt, now){
    const f = G.formation;
    if(!f || !G.enemies.some(e=>e.alive && e.role==='formation')) return;
    f.x += f.vx * f.dir * dt/1000;
    let minX=Infinity, maxX=-Infinity;
    G.enemies.forEach(e=>{
      if(!e.alive || e.role!=='formation') return;
      e.x = f.x + e.ox + (e.zig ? Math.sin(now/350 + e.zigSeed + e.row*.3)*5 : 0);
      e.y = f.y + e.oy + (e.zig ? Math.cos(now/520 + e.zigSeed + e.col*.2)*4 : 0);
      minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x+e.w);
    });
    if(minX < 16 || maxX > G.w-16){
      f.dir *= -1; f.y += C.wave.collectiveDrop + Math.min(9,G.sector*1.2);
      G.enemies.forEach(e=>{ if(e.role==='formation') e.oy += 0; });
    }
  }

  function maybeLaunchDiver(now){
    if(now - G.timers.dive < Math.max(900, 2600 - G.sector*180 - G.wave*120)) return;
    G.timers.dive = now;
    const pool = G.enemies.filter(e=>e.alive && e.role==='formation' && e.kind!=='diver' && e.row <= 2);
    if(!pool.length) return;
    const e = pick(pool);
    e.role='diver'; e.kind='diver'; e.t=0; e.baseX=e.x; e.baseY=e.y; e.phase=Math.random()*Math.PI*2; e.hp += 1; A().enemyDive();
  }

  function isFrontShooter(e){
    if(e.role!=='formation') return false;
    return !G.enemies.some(o=>o.alive && o.role==='formation' && o.col===e.col && o.row>e.row);
  }

  function fireAimed(x,y,speed,r,color,damage=1,type='orb',spread=0){
    const dx=(G.px-x)+rand(-spread,spread), dy=(G.py-y)+rand(-spread*.25,spread*.25);
    const mag=Math.hypot(dx,dy)||1;
    fireEnemyBullet(x,y,dx/mag*speed,dy/mag*speed,r,color,damage,type);
  }

  function updateEnemies(dt, now){
    const playerRect = {x:G.px-16,y:G.py-25,w:32,h:50};
    G.enemies.forEach(e=>{
      if(!e.alive) return;
      if(e.role==='guardian'){
        e.t += dt/1000;
        e.x = G.w*.5 - e.w/2 + Math.sin(e.t*1.7)*Math.min(G.w*.28,140);
        e.y = 70 + Math.cos(e.t*2.2)*18;
        if(now>e.nextShot){ shootGuardian(e); e.nextShot=now+rand(1050,1750)-G.sector*30; }
      } else if(e.role==='miniboss'){
        e.t += dt/1000;
        e.x = G.w*.5 - e.w/2 + Math.sin(e.t*1.25)*Math.min(G.w*.32,170);
        e.y = 58 + Math.sin(e.t*2.1)*15;
        if(now>e.nextShot){ shootMiniboss(e); e.nextShot=now+rand(850,1450)-G.sector*22; }
      } else if(e.role==='boss'){
        e.t += dt/1000;
        e.x = G.w*.5 - e.w/2 + Math.sin(e.t*0.85)*Math.min(G.w*.34,220);
        e.y = 52 + Math.cos(e.t*1.9)*16;
        if(now>e.nextShot){ shootBoss(e); e.nextShot=now+rand(650,1120)-G.sector*20; }
      } else if(e.role==='diver'){
        e.t += dt/1000;
        e.y += (195 + G.sector*15)*dt/1000;
        e.x += Math.sin(e.t*7.6 + e.phase) * (175*dt/1000);
        if(!e.nextShot) e.nextShot=now+rand(260,700);
        if(now>e.nextShot && e.y<G.py-65){
          fireAimed(e.x+e.w/2,e.y+e.h,290+G.sector*12,4.1,'#ffb18f',1,'bolt',26);
          e.nextShot=now+rand(700,1150);
        }
        if(e.y > G.h+50){ e.alive=false; }
      } else if(isFrontShooter(e)){
        if(!e.nextShot) e.nextShot=now+rand(900,3600);
        if(now>e.nextShot){
          const speed=245+G.sector*15+G.wave*6;
          const type=e.kind==='gunner'?'plasma':e.kind==='striker'?'bolt':'orb';
          fireAimed(e.x+e.w/2,e.y+e.h,speed,e.kind==='gunner'?4.7:3.8,e.kind==='gunner'?'#ff9c7a':'#ffb997',1,type,36);
          if(e.kind==='gunner' && Math.random()<.35) setTimeout(()=>{ if(e.alive&&G.running&&!G.paused) fireAimed(e.x+e.w/2,e.y+e.h,speed+18,4.2,'#ffba8a',1,'orb',50); },120);
          e.nextShot=now+rand(1800,3500)-Math.min(650,G.sector*65+G.wave*50);
          A().enemyShot();
        }
      }
      if(rectHit({x:e.x,y:e.y,w:e.w,h:e.h}, playerRect) && performance.now() > G.invulnUntil){ damagePlayer(2, 'COLISIÓN'); e.alive=false; explode(e.x+e.w/2,e.y+e.h/2,e.color,10); }
    });
    G.enemies = G.enemies.filter(e=>e.alive);
  }

  function shootGuardian(e){
    fireAimed(e.x+e.w*.32,e.y+e.h,305,4.3,'#ff996b',1,'bolt',38);
    fireAimed(e.x+e.w*.68,e.y+e.h,305,4.3,'#ff996b',1,'bolt',38);
    A().enemyShot();
  }
  function shootMiniboss(e){
    const cx=e.x+e.w/2, cy=e.y+e.h;
    fireAimed(cx,cy,320,5,'#ffc08a',1,'plasma',15);
    fireEnemyBullet(cx-12,cy,-85,305,4.4,'#ff9f78',1,'bolt');
    fireEnemyBullet(cx+12,cy,85,305,4.4,'#ff9f78',1,'bolt');
    G.threatPulseUntil=performance.now()+450;
    A().minibossShot();
  }
  function shootBoss(e){
    const cx=e.x+e.w/2, cy=e.y+e.h*.72;
    const mode=Math.floor(e.t)%3;
    if(mode===0){
      for(let i=-2;i<=2;i++) fireEnemyBullet(cx,cy,i*58,295+Math.abs(i)*8,4.8,i===0?'#ffd59d':'#ff9f7c',1,'plasma');
    } else if(mode===1){
      fireAimed(e.x+e.w*.24,e.y+e.h,360,5.2,'#ff7d7d',2,'lance',28);
      fireAimed(e.x+e.w*.76,e.y+e.h,360,5.2,'#ff7d7d',2,'lance',28);
    } else {
      for(let i=-1;i<=1;i++) fireAimed(cx+i*28,cy,330+i*8,4.6,'#ffba8d',1,'bolt',70);
    }
    G.threatPulseUntil=performance.now()+360;
    A().bossShot();
  }

  function updateBullets(dt, now){
    // player bullets
    for(let i=G.playerBullets.length-1;i>=0;i--){
      const b=G.playerBullets[i]; b.x += b.vx*dt/1000; b.y += b.vy*dt/1000; b.life -= dt;
      if(b.isMissile){ b.vx *= 0.99; }
      if(b.life<=0 || b.y<-90 || b.x<-80 || b.x>G.w+80){ G.playerBullets.splice(i,1); continue; }

      let consumed=false;
      for(const ob of G.obstacles){ if(ob.alive && Math.hypot((b.x+b.w/2)-ob.x,(b.y+b.h/2)-ob.y) < ob.r){ ob.hp -= b.damage * (b.isMissile?1.4:1); explode(b.x,b.y,'#ffb76e',3,80); G.playerBullets.splice(i,1); consumed=true; if(ob.hp<=0){ destroyMeteor(ob); } break; } }
      if(consumed) continue;
      for(const pod of G.rewardPods){ if(!pod.open && rectHit(b,pod)){ pod.hp -= b.damage; G.playerBullets.splice(i,1); explode(pod.x+pod.w/2,pod.y+pod.h/2,C.powers[pod.kind].color,4,70); consumed=true; if(pod.hp<=0){ pod.open=true; spawnPowerDrop(pod.x+pod.w/2,pod.y+pod.h/2,pod.kind); addText(pod.x,pod.y-8,'PREMIO','#fff49a',850); } break; } }
      if(consumed) continue;

      // chain effect seeks nearest enemy occasionally
      if(now < G.activePowers.chain && Math.random()<0.08){ const target = nearestEnemy(b.x,b.y); if(target){ target.hp -= 0.45; explode(target.x+target.w/2,target.y+target.h/2,'#9ebeff',2,50); } }

      for(const e of G.enemies){
        if(e.alive && rectHit(b,{x:e.x,y:e.y,w:e.w,h:e.h})){
          e.hp -= b.damage * (b.isMissile?1.6:1); G.playerBullets.splice(i,1); consumed=true; explode(b.x,b.y,b.color,4,90);
          if(e.hp<=0){ killEnemy(e); }
          break;
        }
      }
    }

    for(let i=G.enemyBullets.length-1;i>=0;i--){
      const b=G.enemyBullets[i]; b.x += b.vx*dt/1000; b.y += b.vy*dt/1000; b.life -= dt;
      if(b.life<=0 || b.y>G.h+80 || b.x<-80 || b.x>G.w+80){ G.enemyBullets.splice(i,1); continue; }
      let eaten=false;
      for(const ob of G.obstacles){ if(ob.alive && Math.hypot(b.x-ob.x,b.y-ob.y) < ob.r){ ob.hp -= 0.35; G.enemyBullets.splice(i,1); eaten=true; if(ob.hp<=0) destroyMeteor(ob); break; } }
      if(eaten) continue;
      const pr = {x:G.px-16,y:G.py-25,w:32,h:50};
      if(rectHit({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2}, pr)){
        G.enemyBullets.splice(i,1);
        if(now < G.activePowers.shield){ explode(G.px,G.py,'#77edff',4,65); }
        else if(now > G.invulnUntil){ damagePlayer(b.damage, 'IMPACTO'); }
      }
    }
  }

  function nearestEnemy(x,y){ let best=null, bd=Infinity; for(const e of G.enemies){ if(!e.alive) continue; const d=(e.x+e.w/2-x)**2+(e.y+e.h/2-y)**2; if(d<bd){bd=d;best=e;} } return best; }

  function killEnemy(e){
    e.alive=false; G.score += Math.round(e.score * (1 + Math.min(.5,G.combo*.03)));
    G.combo++; G.comboUntil = performance.now() + 2200;
    explode(e.x+e.w/2,e.y+e.h/2,e.color, e.role==='boss'?28:e.role==='miniboss'?18:10, e.role==='boss'?200:130);
    if(e.role==='boss'){
      addText(e.x+e.w/2,e.y,'SECTOR LIMPIO','#ffe091',1600,0,-24,true);
      UI().flashMsg('SECTOR COMPLETADO', 1100);
      maybeDrop('life', e.x+e.w/2,e.y+e.h/2,.3); advanceSector(); return;
    }
    if(e.role==='miniboss'){ addText(e.x+e.w/2,e.y,'AMAZING','#ffc46f',1200,0,-18,true); maybeDrop('heal', e.x+e.w/2,e.y+e.h/2,.75); }
    else if(e.role==='guardian'){ addText(e.x+e.w/2,e.y,'BONUS','#ffe686',900,0,-16,true); maybeDrop(pick(['spread','shield','missile','chain']), e.x+e.w/2,e.y+e.h/2,.85); }
    else { maybeDrop(pick(['spread','shield','heal','missile','chain','overdrive']), e.x+e.w/2,e.y+e.h/2, .12); }
    if(G.combo===5){ addText(e.x,e.y,'RACHA x5','#8df9ff',1100,0,-18,true); A().combo(5); }
    if(G.combo===10){ addText(e.x,e.y,'AMAZING','#ffd067',1200,0,-18,true); A().combo(10); }
    if(G.combo===15){ addText(e.x,e.y,'DOMINIO','#ff9df0',1250,0,-18,true); A().combo(15); }
  }

  function maybeDrop(kind,x,y,p=.15){ if(Math.random()<p) spawnPowerDrop(x,y,kind); }

  function damagePlayer(amount, reason='DAÑO'){
    G.hp -= amount; G.invulnUntil = performance.now()+900; G.shake = 8; A().hit(); addText(G.px,G.py-20,reason,'#ff9e93',700,0,-15,true);
    if(G.hp > 0 && G.hp <= Math.max(2,Math.ceil(G.maxHp*.25))){ addText(G.px,G.py-44,'VIDA CRÍTICA','#ff6e7b',1000,0,-12,true); A().critical(); }
    if(G.hp <= 0) loseLife();
  }

  function loseLife(){
    G.lives -= 1; explode(G.px,G.py,'#fff',18,180); A().boom();
    if(G.lives <= 0){ gameOver(); return; }
    const cp = G.checkpoint || snapshot();
    G.hp = G.maxHp; G.score = cp.score; G.sector = cp.sector; G.wave = cp.wave; G.nextLifeAt = cp.nextLifeAt || G.nextLifeAt; G.invulnUntil = performance.now()+1800;
    buildStage(); G.px = G.w*.5; G.py = G.h*.82; UI().flashMsg('REANUDANDO DESDE CHECKPOINT', 1100);
  }

  function gameOver(){
    G.running=false; G.mode='menu'; UI().showHud(false); UI().flashMsg('GAME OVER', 1600); S().saveRanking(G.player,G.score,G.sector,G.wave); S().clearGame(); NS.main.refreshPanels(); setTimeout(()=>{ UI().showScreen('splash'); }, 1200);
  }

  function destroyMeteor(ob){ ob.alive=false; explode(ob.x,ob.y,'#ffb45e',22,160); addText(ob.x,ob.y,'ROCA DESTRUIDA','#ffcf7c',900); maybeDrop(Math.random()<.2?'heal':'spread', ob.x, ob.y, 1); }

  function updateObstacles(dt){ G.obstacles = G.obstacles.filter(o=>o.alive); G.obstacles.forEach(o=>{ o.angle += o.spin * dt/1000; }); }

  function updatePowerDrops(dt, now){
    for(let i=G.powerDrops.length-1;i>=0;i--){
      const p = G.powerDrops[i]; p.y += p.vy*dt/1000; p.life -= dt; p.phase += dt/200;
      if(p.life<=0 || p.y>G.h+40){ G.powerDrops.splice(i,1); continue; }
      const rect = {x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h};
      const playerRect = {x:G.px-16,y:G.py-25,w:32,h:50};
      if(rectHit(rect, playerRect)){ applyPower(p.kind); G.powerDrops.splice(i,1); }
    }
  }

  function updateRewardPods(dt, now){
    for(const pod of G.rewardPods){ if(pod.open) continue; pod.bob += dt/600; pod.y += Math.sin(pod.bob)*0.12; }
  }

  function applyPower(kind){
    const now = performance.now();
    if(kind==='heal'){ G.hp = Math.min(G.maxHp, G.hp + 4); }
    else if(kind==='life'){ G.lives++; }
    else if(kind==='emp'){
      for(const e of G.enemies){ if(e.role!=='boss'){ e.hp -= 2.4; if(e.hp<=0) killEnemy(e); } }
      explode(G.px,G.py,'#c8a7ff',22,150);
    } else {
      const durations = {spread:8000, shield:7000, chain:7000, missile:6500, overdrive:7000};
      G.activePowers[kind] = now + (durations[kind] || 6000);
    }
    A().power(kind); UI().flashMsg(C.powers[kind].label, 700); addText(G.px,G.py-28,C.powers[kind].label,C.powers[kind].color,1000,0,-18,true);
  }

  function updateParticles(dt){
    for(let i=G.particles.length-1;i>=0;i--){ const p=G.particles[i]; p.x+=p.vx*dt/1000; p.y+=p.vy*dt/1000; p.life-=dt; p.vx*=0.992; p.vy*=0.992; if(p.life<=0) G.particles.splice(i,1);} 
    const max = G.lowFx ? 180 : 300; if(G.particles.length > max) G.particles.splice(0, G.particles.length-max);
  }
  function updateTexts(dt){ for(let i=G.texts.length-1;i>=0;i--){ const t=G.texts[i]; t.x += t.vx*dt/1000; t.y += t.vy*dt/1000; t.life -= dt; if(t.life<=0) G.texts.splice(i,1);} }

  function advanceSector(){
    G.sector += 1; G.wave = 1; G.hp = Math.min(G.maxHp, G.hp + 3); G.lives += 1; A().extraLife(); buildStage();
  }

  function updateProgression(now){
    const aliveFormation = G.enemies.some(e=>e.alive && (e.role==='formation' || e.role==='guardian' || e.role==='diver' || e.role==='miniboss'));
    const aliveBoss = G.enemies.some(e=>e.alive && e.role==='boss');
    if(!aliveFormation && !aliveBoss){
      if(G.wave===C.progression.bossWave && G.phase!=='boss'){
        if(G.subphase===0){ // post horde
          G.subphase=1; G.phaseName='HORDA'; spawnPostHorde(); UI().flashMsg('HORDA FINAL', 900);
        } else if(G.subphase===1){
          G.subphase=2; spawnBoss();
        }
      } else {
        nextWave();
      }
    }
  }

  function spawnPostHorde(){
    G.enemies=[];
    const n = 12 + G.sector*2;
    for(let i=0;i<n;i++){
      G.enemies.push({ kind:'diver', role:'diver', x: rand(24,G.w-24), y: rand(-220,-20), w:26,h:24, hp:2,maxHp:2, alive:true, t:rand(0,2), phase:Math.random()*Math.PI*2, score:40, color:'#ff8fa1' });
    }
  }

  function nextWave(){
    if(G.wave < C.progression.wavesPerSector){ G.wave += 1; G.subphase=0; buildStage(); }
    else { advanceSector(); }
  }

  function render(now){
    const ctx = G.ctx; if(!ctx) return;
    const sc = currentSectorCfg();
    ctx.clearRect(0,0,G.w,G.h);
    renderBg(ctx, sc, now);
    if(!G.running) return;
    if(G.shake>0){ const sx=rand(-G.shake,G.shake), sy=rand(-G.shake,G.shake); ctx.save(); ctx.translate(sx,sy); G.shake *= 0.84; if(G.shake<.35) G.shake=0; }
    renderObstacles(ctx);
    renderRewardPods(ctx);
    renderPowerDrops(ctx, now);
    renderEnemies(ctx, now);
    renderBullets(ctx, now);
    renderPlayer(ctx, now);
    renderParticles(ctx);
    renderTexts(ctx);
    renderBossBars(ctx);
    if(G.shake>0||G.shake===0) ctx.restore?.();
    UI().renderHud({player:G.player, ship:G.ship, sector:G.sector, wave:G.wave, score:G.score, lives:G.lives, hp:G.hp, maxHp:G.maxHp, checkpointWave:G.checkpointWave, activePowerText:currentPowerText(), phaseName:G.phaseName});
  }

  function renderBg(ctx, sc, now){
    const img=NS.assets?.getBackground(G.sector);
    if(img){
      const scale=Math.max(G.w/img.width,G.h/img.height);
      const dw=img.width*scale, dh=img.height*scale;
      const x=(G.w-dw)/2;
      const scroll=((now*0.009)%(dh));
      const y=-scroll;
      ctx.globalAlpha=.78; ctx.drawImage(img,x,y,dw,dh); ctx.drawImage(img,x,y+dh,dw,dh); ctx.globalAlpha=1;
      const shade=ctx.createLinearGradient(0,0,0,G.h); shade.addColorStop(0,'rgba(0,0,0,.08)'); shade.addColorStop(.5,'rgba(0,0,0,.18)'); shade.addColorStop(1,'rgba(0,0,0,.3)'); ctx.fillStyle=shade; ctx.fillRect(0,0,G.w,G.h);
    } else {
      const g=ctx.createLinearGradient(0,0,0,G.h); g.addColorStop(0,sc.bg[0]); g.addColorStop(.56,sc.bg[1]); g.addColorStop(1,sc.bg[2]); ctx.fillStyle=g; ctx.fillRect(0,0,G.w,G.h);
    }
    G.stars.forEach(st=>{ st.y += st.z*0.9; if(st.y>G.h){ st.y=-2; st.x=Math.random()*G.w; } ctx.globalAlpha=st.a*.5; ctx.fillStyle='#fff'; ctx.fillRect(st.x,st.y,st.z*1.7,st.z*1.7); }); ctx.globalAlpha=1;
    if(now<G.threatPulseUntil){ ctx.globalAlpha=.08; ctx.fillStyle='#ff6f55'; ctx.fillRect(0,0,G.w,G.h); ctx.globalAlpha=1; }
  }

  function renderPlayer(ctx, now){
    ctx.save(); ctx.translate(G.px,G.py);
    ctx.globalAlpha = now < G.invulnUntil && Math.floor(now/90)%2===0 ? 0.35 : 1;
    if(now < G.activePowers.shield){
      ctx.strokeStyle='rgba(111,239,255,.92)'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.arc(0,0,31 + Math.sin(now/120)*2,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha*=0.18; ctx.fillStyle='#6fefff'; ctx.beginPath(); ctx.arc(0,0,29,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = now < G.invulnUntil && Math.floor(now/90)%2===0 ? 0.35 : 1;
    }
    const img=NS.assets?.getShip(G.shipId);
    if(img){
      const h=60, w=h*(img.width/img.height); ctx.shadowColor=G.ship.color; ctx.shadowBlur=9; ctx.drawImage(img,-w/2,-h/2,w,h); ctx.shadowBlur=0;
    } else {
      ctx.fillStyle=G.ship.color; ctx.beginPath(); ctx.moveTo(0,-24); ctx.lineTo(18,18); ctx.lineTo(0,14); ctx.lineTo(-18,18); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=.65; ctx.fillStyle=G.ship.accent; const flame=8+Math.sin(now/80)*3; ctx.fillRect(-7,26,4,flame); ctx.fillRect(3,26,4,flame); ctx.globalAlpha=1;
    ctx.restore();
  }

  function renderEnemies(ctx, now){
    for(const e of G.enemies){
      ctx.save(); ctx.translate(e.x+e.w/2, e.y+e.h/2);
      if(e.role==='diver') ctx.rotate(Math.sin(e.t*8)*0.38);
      const key=e.role==='boss'?'boss':e.role==='miniboss'?'miniboss':e.role==='guardian'?'guardian':e.role==='diver'?'diver':e.kind;
      const img=NS.assets?.getEnemy(key);
      if(img){
        let h=e.role==='boss'?128:e.role==='miniboss'?72:e.role==='guardian'?58:e.role==='diver'?42:34;
        if(e.kind==='striker'&&e.role==='formation') h=33;
        const w=h*(img.width/img.height);
        ctx.shadowColor=e.color; ctx.shadowBlur=e.role==='boss'?14:6;
        ctx.drawImage(img,-w/2,-h/2,w,h); ctx.shadowBlur=0;
      } else {
        ctx.fillStyle=e.color; ctx.beginPath(); ctx.moveTo(0,-e.h/2); ctx.lineTo(e.w/2,0); ctx.lineTo(0,e.h/2); ctx.lineTo(-e.w/2,0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      if(e.role==='guardian'||e.role==='miniboss') drawSmallHp(ctx,e);
    }
  }

  function drawSmallHp(ctx,e){ const w=e.w, x=e.x, y=e.y-7; ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(x,y,w,4); ctx.fillStyle='#ff9269'; ctx.fillRect(x,y,w*(e.hp/e.maxHp),4); }
  function renderBossBars(ctx){ for(const e of G.enemies){ if(e.role==='boss'){ const w=Math.min(G.w*.44,280), x=G.w/2-w/2, y=48; ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(x,y,w,12); ctx.fillStyle='#ff8f64'; ctx.fillRect(x,y,w*(e.hp/e.maxHp),12); ctx.strokeStyle='#ffe6b4'; ctx.strokeRect(x,y,w,12); } } }

  function renderObstacles(ctx){
    G.obstacles.forEach((o,idx)=>{
      ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.angle);
      const img=NS.assets?.getObstacle(idx);
      if(img){
        const size=o.r*2.25; const iw=size, ih=size*(img.height/img.width);
        ctx.shadowColor='rgba(255,145,75,.25)'; ctx.shadowBlur=8; ctx.drawImage(img,-iw/2,-ih/2,iw,ih); ctx.shadowBlur=0;
      } else {
        const lg=ctx.createRadialGradient(-o.r*.2,-o.r*.2,3,0,0,o.r); lg.addColorStop(0,'#7d8a96'); lg.addColorStop(.65,'#3c4550'); lg.addColorStop(1,'#232b33'); ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(0,0,o.r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(o.x-o.r,o.y+o.r+5,o.r*2,4); ctx.fillStyle='#ffb46e'; ctx.fillRect(o.x-o.r,o.y+o.r+5,(o.r*2)*(o.hp/o.maxHp),4);
    });
  }

  function renderRewardPods(ctx){
    G.rewardPods.forEach(p=>{ if(p.open) return; ctx.save(); ctx.translate(p.x,p.y); drawPowerIcon(ctx,p.kind,C.powers[p.kind].color, 1 + Math.sin(p.bob)*0.05, true); ctx.restore(); });
  }

  function renderPowerDrops(ctx, now){
    G.powerDrops.forEach(p=>{ const blink = Math.sin(p.phase*5) > -0.1; if(!blink) return; ctx.save(); ctx.translate(p.x,p.y); drawPowerIcon(ctx,p.kind,C.powers[p.kind].color, 1 + Math.sin(now/170)*0.06, false); ctx.restore(); });
  }

  function drawPowerIcon(ctx, kind, color, scale=1, frameBox=false){
    ctx.scale(scale,scale); if(frameBox){ ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1.4; ctx.strokeRect(-12,-12,24,24); }
    ctx.fillStyle='rgba(0,0,0,.28)'; ctx.beginPath(); ctx.roundRect?.(-11,-11,22,22,6); if(ctx.roundRect) ctx.fill();
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2;
    switch(kind){
      case 'shield': ctx.beginPath(); ctx.arc(0,0,7.5,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,3.5,0,Math.PI*2); ctx.fill(); break;
      case 'spread': for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(i*5,7); ctx.lineTo(i*6,-5); ctx.lineTo(i*2,-1); ctx.closePath(); ctx.fill(); } break;
      case 'chain': ctx.beginPath(); ctx.moveTo(-7,-6); ctx.lineTo(-1,0); ctx.lineTo(-5,0); ctx.lineTo(0,7); ctx.lineTo(1,1); ctx.lineTo(6,1); ctx.lineTo(3,-6); ctx.stroke(); break;
      case 'emp': ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4); ctx.lineTo(Math.cos(a)*10,Math.sin(a)*10);} ctx.stroke(); break;
      case 'missile': ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(6,1); ctx.lineTo(2,0); ctx.lineTo(2,8); ctx.lineTo(-2,8); ctx.lineTo(-2,0); ctx.lineTo(-6,1); ctx.closePath(); ctx.fill(); break;
      case 'heal': case 'life': ctx.fillRect(-2,-8,4,16); ctx.fillRect(-8,-2,16,4); break;
      case 'overdrive': ctx.beginPath(); ctx.moveTo(-7,6); ctx.lineTo(0,-8); ctx.lineTo(7,6); ctx.lineTo(0,1); ctx.closePath(); ctx.fill(); break;
      default: ctx.fillRect(-5,-5,10,10);
    }
  }

  function renderBullets(ctx, now){
    G.playerBullets.forEach(b=>{
      ctx.save(); ctx.translate(b.x+b.w/2,b.y+b.h/2); ctx.strokeStyle=b.color; ctx.lineWidth=b.isMissile?3:2.2; ctx.globalAlpha=.42; ctx.beginPath(); ctx.moveTo(0,b.h*.8); ctx.lineTo(-b.vx*.025,b.h*1.9); ctx.stroke(); ctx.globalAlpha=1; ctx.fillStyle=b.color; ctx.beginPath(); ctx.ellipse(0,0,b.w*.48,b.h*.52,0,0,Math.PI*2); ctx.fill(); if(b.isMissile){ctx.fillStyle='#fff2bf';ctx.fillRect(-2,b.h*.35,4,6);} ctx.restore();
    });
    G.enemyBullets.forEach(b=>{
      ctx.save(); ctx.translate(b.x,b.y);
      const ang=Math.atan2(b.vy,b.vx)+Math.PI/2; ctx.rotate(ang);
      if(b.type==='lance'){
        const gr=ctx.createLinearGradient(0,-14,0,10); gr.addColorStop(0,'rgba(255,255,255,.95)'); gr.addColorStop(.25,b.color); gr.addColorStop(1,'rgba(255,80,60,.05)'); ctx.fillStyle=gr; ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(4,6); ctx.lineTo(0,10); ctx.lineTo(-4,6); ctx.closePath(); ctx.fill();
      } else {
        ctx.globalAlpha=.28; ctx.strokeStyle=b.color; ctx.lineWidth=b.type==='plasma'?5:3; ctx.beginPath(); ctx.moveTo(0,-b.r*4.5); ctx.lineTo(0,b.r*.8); ctx.stroke(); ctx.globalAlpha=1;
        const rg=ctx.createRadialGradient(0,0,1,0,0,b.r*1.8); rg.addColorStop(0,'#fff'); rg.addColorStop(.38,b.color); rg.addColorStop(1,'rgba(255,100,80,0)'); ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(0,0,b.r*1.8,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    });
  }
  function renderParticles(ctx){ G.particles.forEach(p=>{ ctx.globalAlpha=Math.max(0,p.life/p.maxLife); ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,p.size,p.size); }); ctx.globalAlpha=1; }
  function renderTexts(ctx){ G.texts.forEach(t=>{ ctx.globalAlpha=Math.max(0,t.life/t.maxLife); ctx.fillStyle=t.color; ctx.font = `${t.bold?'800':'700'} ${t.bold?16:13}px Inter,Arial`; ctx.textAlign='center'; ctx.fillText(t.text,t.x,t.y); }); ctx.globalAlpha=1; }

  function togglePause(){ if(!G.running) return; G.paused=!G.paused; UI().renderPause(G); }
  function exitToMenu(){ G.running=false; G.mode='menu'; G.paused=false; UI().showHud(false); UI().renderPause(G); UI().showScreen('splash'); NS.main.refreshPanels(); }

  function loop(ts){
    const dt = Math.min(34, ts - (G.lastTs || ts)); G.lastTs = ts;
    update(dt, ts); render(ts); requestAnimationFrame(loop);
  }

  NS.game = { init, resize, startNew, continueFromSave, loop, togglePause, exitToMenu, state:G, currentPowerText, saveProgress };
})(window.SF);
