
window.SF = window.SF || {};

SF.Game = class {
  constructor(canvas,input){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.input=input;
    this.ui=null;
    this.mode='menu';
    this.paused=false;
    this.over=false;
    this.w=0;this.h=0;this.dpr=1;
    this.lastT=0;
    this.bgOffset=0;
    this.playerName='PILOTO';
    this.wave=1;this.lives=5;this.score=0;this.nextLife=2500;
    this.shipId='vanguard';this.ship=null;
    this.player={x:0,y:0,w:62,h:78,hp:1,maxHp:1,invulnUntil:0};
    this.enemies=[];this.enemyDir=1;this.boss=null;this.bossPending=false;
    this.formation={x:0,drop:0,dir:1};
    this.playerBullets=[];this.enemyBullets=[];this.obstacles=[];this.powerups=[];this.particles=[];
    this.lastShot=0;this.lastEnemyShot=0;this.lastObstacle=0;this.lastMissile=0;this.lastBeamTick=0;this.lastGuardianShot=0;
    this.waveTransitionUntil=0;
    this.effects={spreadUntil:0,beamUntil:0,missilesUntil:0,shieldUntil:0,empUntil:0,chainUntil:0,missileFlashUntil:0,spreadFlashUntil:0,powerPulseUntil:0,powerPulseKind:''};
    this.chainPoints=[];
    this.perf={ema:16.7,fx:1};
    this._pauseCooldown=0;
  }

  setUI(ui){this.ui=ui;}

  resize(){
    const area=Math.max(1,innerWidth*innerHeight);
    const dprCap=area>1600000?1.25:area>900000?1.4:1.6;
    this.dpr=Math.min(window.devicePixelRatio||1,dprCap);
    this.canvas.width=Math.round(innerWidth*this.dpr);
    this.canvas.height=Math.round(innerHeight*this.dpr);
    this.canvas.style.width=innerWidth+'px';
    this.canvas.style.height=innerHeight+'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.w=innerWidth;this.h=innerHeight;
    SF.Assets.clearSpriteCache?.();
    const pw=Math.max(48,Math.min(82,this.w*(this.h>=this.w ? 0.155 : 0.09)));
    this.player.w=pw;this.player.h=pw*1.28;
    this.player.y=this.h-this.player.h-34;
    this.player.x=Math.max(8,Math.min(this.w-this.player.w-8,this.player.x||this.w/2-this.player.w/2));
  }

  boot(){
    this.resize();
    addEventListener('resize',()=>this.resize());
    requestAnimationFrame(t=>this.loop(t));
  }

  start({player='PILOTO',fromSave=false}={}){
    SF.Audio.unlock();
    const sv=fromSave?SF.Storage.loadGame():null;
    const now=performance.now();
    this.playerName=(sv?.player||player||'PILOTO').trim().toUpperCase().slice(0,18)||'PILOTO';
    this.wave=Math.max(1,sv?.wave||1);
    this.lives=Math.max(1,sv?.lives||5);
    this.score=Math.max(0,sv?.score||0);
    this.nextLife=Math.max(2500,(Math.floor(this.score/2500)+1)*2500);
    this.shipId=sv?.shipType||SF.Storage.getShip();
    this.ship=SF.Config.ships.find(s=>s.id===this.shipId)||SF.Config.ships[0];
    this.shipId=this.ship.id;
    this.effects.spreadUntil=sv?.spreadLeft?now+sv.spreadLeft:0;
    this.effects.beamUntil=sv?.beamLeft?now+sv.beamLeft:0;
    this.effects.missilesUntil=sv?.missileLeft?now+sv.missileLeft:0;
    this.effects.shieldUntil=sv?.shieldLeft?now+sv.shieldLeft:0;
    this.effects.empUntil=0;this.effects.chainUntil=0;
    this.player.maxHp=this.ship.hp;this.player.hp=this.ship.hp;
    this.player.invulnUntil=now+1700;
    this.player.x=this.w/2-this.player.w/2;this.player.y=this.h-this.player.h-34;
    this.mode='game';this.paused=false;this.over=false;
    this.lastT=now;this.lastShot=0;this.lastEnemyShot=0;this.lastGuardianShot=0;this.lastObstacle=now+500;
    this.playerBullets=[];this.enemyBullets=[];this.obstacles=[];this.powerups=[];this.particles=[];
    this.formation={x:0,drop:0,dir:1};this.perf={ema:16.7,fx:1};
    this.spawnWave();
    this.ui?.showGame();
    this.message(`SECTOR ${this.wave}`,1000);
    this.save();
  }

  save(){
    if(this.mode!=='game'||this.over) return;
    const now=performance.now();
    SF.Storage.saveGame({
      player:this.playerName,wave:this.wave,lives:this.lives,score:this.score,shipType:this.shipId,
      spreadLeft:Math.max(0,this.effects.spreadUntil-now),
      beamLeft:Math.max(0,this.effects.beamUntil-now),
      missileLeft:Math.max(0,this.effects.missilesUntil-now),
      shieldLeft:Math.max(0,this.effects.shieldUntil-now)
    });
    this.ui?.refreshSavePreview();
  }

  togglePause(){
    if(this.mode!=='game'||this.over) return;
    this.paused=!this.paused;
    if(this.paused)this.save();
    this.ui?.setPause(this.paused,this);
  }

  message(txt,ms=900){this.ui?.message(txt,ms);}

  get background(){
    return SF.Config.backgrounds.find(b=>this.wave>=b.from&&this.wave<=b.to)||SF.Config.backgrounds[0];
  }

  profile(){return SF.Config.waveProfile(this.wave);}

  spawnWave(){
    this.enemies=[];this.boss=null;this.enemyBullets=[];this.playerBullets=[];
    this.waveTransitionUntil=0;this.bossPending=this.wave%SF.Config.bossEvery===0;
    this.formation={x:0,drop:0,dir:1};
    const p=this.profile();
    const portrait=this.h>=this.w;
    const cols=Math.min(p.cols,portrait?9:14), rows=p.rows;
    const maxEnemyW=portrait?48:Math.min(62,Math.max(50,this.w*.055));
    const targetFormationW=Math.min(this.w*.84,cols*maxEnemyW+(cols-1)*4);
    const gapX=Math.max(2.4,Math.min(4.8,this.w*.008));
    const enemyW=Math.max(27,Math.min(maxEnemyW,(targetFormationW-(cols-1)*gapX)/cols));
    const enemyH=enemyW*.94;
    const gapY=Math.max(1.8,Math.min(4,enemyH*.09));
    const guardianSpace=p.guardian?38:0;
    const startY=66+guardianSpace;
    const formationW=cols*enemyW+(cols-1)*gapX;
    const startX=Math.max(5,(this.w-formationW)/2);

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let kind='octo',hp=1,pts=20;
        if(r===0){kind=c%2?'squid':'crab';pts=30;}
        else if(r===1){kind=c%3===0?'octo':'crab';pts=24;}
        else if(this.wave>=3&&r===rows-1){kind=c%2?'mosquito':'carrier';hp=1+Math.floor(this.wave/7);pts=45;}
        if(this.wave>=5&&r>=rows-2&&c%4===0){kind='plasma_orb';hp=2+Math.floor(this.wave/8);pts=60;}
        if(this.wave>=7&&r===1&&c%5===2){kind='scarab';hp=2+Math.floor(this.wave/9);pts=65;}
        const baseX=startX+(enemyW+gapX)*c;
        const baseY=startY+(enemyH+gapY)*r;
        const diagonal=Math.random()<p.diagonalChance && r>0;
        this.enemies.push({
          x:baseX,y:baseY,baseX,baseY,w:enemyW,h:enemyH,kind,hp,maxHp:hp,pts,alive:true,
          phase:Math.random()*6.28,motion:diagonal?'diagonal':'sway',
          ampX:diagonal?p.diagonalAmp*(.55+Math.random()*.45):2+Math.random()*4,
          ampY:diagonal?4+Math.random()*5:1+Math.random()*2,
          freq:(diagonal?.0025:.0018)+Math.random()*.0013,isGuardian:false
        });
      }
    }

    // Formation Guardian: a medium elite stays behind the first row, moves independently
    // inside a controlled diagonal envelope and requires sustained fire to destroy.
    if(p.guardian){
      const gw=enemyW*1.52,gh=enemyH*1.52;
      const baseX=this.w/2-gw/2,baseY=58;
      this.enemies.push({
        x:baseX,y:baseY,baseX,baseY,w:gw,h:gh,kind:'guardian',
        hp:p.guardianHp,maxHp:p.guardianHp,pts:260+this.wave*24,alive:true,
        phase:Math.random()*6.28,motion:'guardian',ampX:Math.min(34,enemyW*.72),ampY:10+Math.min(8,this.wave*.55),
        freq:.00165+Math.min(.00075,this.wave*.00004),isGuardian:true
      });
    }
    this.enemyDir=1;
    if(this.bossPending)this.message('⚠ FIRMA ÉLITE DETECTADA',900);
  }

  spawnBoss(){
    const bw=Math.min(290,Math.max(148,this.w*.46));
    const bh=bw*1.10;
    this.boss={
      x:this.w/2-bw/2,y:62,w:bw,h:bh,
      hp:88+this.wave*17,maxHp:88+this.wave*17,
      vx:145+this.wave*7,dir:1,lastShot:0,phase:Math.random()*6.28,kind:'boss',baseY:62
    };
    this.enemyBullets=[];this.playerBullets=[];
    this.message(`⚠ ENTIDAD ÉLITE · ${this.wave}`,1200);
    SF.Audio.boom();
  }

  loop(now){
    const rawDt=now-(this.lastT||now);
    let dt=Math.min(33,rawDt);this.lastT=now;
    this.perf.ema=this.perf.ema*.94+Math.max(8,Math.min(60,rawDt||16.7))*.06;
    this.perf.fx=this.perf.ema>28?.48:this.perf.ema>23?.68:this.perf.ema>19?.84:1;
    if(this.mode==='game'){
      if(this.input.consumePause() && now>this._pauseCooldown){this._pauseCooldown=now+250;this.togglePause();}
      if(!this.paused&&!this.over)this.update(dt,now);
      this.render(dt,now);
    }else{
      this.renderBackground(dt,now,.58);
    }
    requestAnimationFrame(t=>this.loop(t));
  }

  update(dt,now){
    const prof=this.profile();
    this.bgOffset+=dt*prof.backgroundScroll;
    this.updatePlayer(dt,now);
    this.updateShooting(now);
    this.updateBullets(dt,now);
    this.updateEnemies(dt,now);
    this.updateBoss(dt,now);
    this.updateEnemyFire(now);
    this.updateObstacles(dt,now);
    this.updatePowerups(dt,now);
    this.updateParticles(dt);
    this.updateBeam(now);

    if(!this.boss && this.enemies.every(e=>!e.alive) && !this.waveTransitionUntil){
      if(this.bossPending){
        this.bossPending=false;
        this.spawnBoss();
      }else{
        this.waveTransitionUntil=now+560;
        this.message('SECTOR ASEGURADO',480);
        this.save();
      }
    }
    if(this.waveTransitionUntil && now>=this.waveTransitionUntil){
      this.wave++;
      this.playerBullets=[];this.enemyBullets=[];
      this.obstacles=this.obstacles.filter(o=>o.static && o.ttl>1200).slice(0,1);
      this.spawnWave();
      this.message(`SECTOR ${this.wave}`,620);
      SF.Audio.wave();
      this.save();
    }
  }

  updatePlayer(dt,now){
    if(this.input.pointerActive){
      const target=this.input.pointerX*this.w-this.player.w/2;
      const lerp=Math.min(1,dt/38);
      this.player.x+=(target-this.player.x)*lerp;
    }else{
      const axis=this.input.axis();
      const speed=Math.max(470,this.w*1.04)*this.ship.speed;
      this.player.x+=axis*speed*dt/1000;
    }
    this.player.x=Math.max(7,Math.min(this.w-this.player.w-7,this.player.x));
    this.player.y=this.h-this.player.h-34;
  }

  updateShooting(now){
    if(now-this.lastShot>=this.ship.fireCd){
      this.lastShot=now;
      this.firePrimary(now);
      SF.Audio.shot(this.shipId);
    }
    if(now<this.effects.missilesUntil && now-this.lastMissile>1380){
      this.lastMissile=now;this.fireMissiles(now);SF.Audio.missileLaunch();
    }
  }

  firePrimary(now){
    const px=this.player.x+this.player.w/2,py=this.player.y+5;
    const speed=this.ship.bulletSpeed;
    const spread=now<this.effects.spreadUntil;
    if(this.shipId==='warden'){
      const offs=[-this.player.w*.18,this.player.w*.18];
      for(const off of offs)this.spawnPlayerBullet(px+off,py,0,-speed,'heavy',7,19);
      if(spread){
        this.spawnPlayerBullet(px-this.player.w*.30,py+3,-165,-speed*.95,'energy',4,17);
        this.spawnPlayerBullet(px+this.player.w*.30,py+3,165,-speed*.95,'energy',4,17);
      }
    }else if(spread){
      for(const vx of [-230,-110,0,110,230])this.spawnPlayerBullet(px,py,vx,-speed,'energy',4,18);
    }else if(this.shipId==='specter'){
      this.spawnPlayerBullet(px,py,0,-speed,'precision',3,22);
      if(Math.floor(now/this.ship.fireCd)%4===0){
        this.spawnPlayerBullet(px-9,py+5,-45,-speed*.96,'precision',3,17);
        this.spawnPlayerBullet(px+9,py+5,45,-speed*.96,'precision',3,17);
      }
    }else{
      this.spawnPlayerBullet(px,py,0,-speed,'energy',4,19);
    }
  }

  spawnPlayerBullet(x,y,vx,vy,type='energy',w=4,h=18){
    this.playerBullets.push({x:x-w/2,y:y-h,w,h,vx,vy,type,damage:type==='heavy'?1.5:1});
    const cap=SF.Config.performance.maxPlayerBullets;
    if(this.playerBullets.length>cap)this.playerBullets.splice(0,this.playerBullets.length-cap);
  }

  fireMissiles(now){
    const targets=this.getTargets().slice(0,2);
    for(let i=0;i<2;i++){
      const x=this.player.x+this.player.w*(i?0.72:0.28);
      this.playerBullets.push({x:x-4,y:this.player.y,w:8,h:20,vx:(i?80:-80),vy:-520,type:'missile',damage:4,target:targets[i]||targets[0]||null,turn:4.2});
    }
    this.effects.missileFlashUntil=now+260;
  }

  getTargets(){
    const arr=this.enemies.filter(e=>e.alive);
    if(this.boss)arr.push(this.boss);
    const px=this.player.x+this.player.w/2,py=this.player.y;
    return arr.sort((a,b)=>Math.hypot(a.x-px,a.y-py)-Math.hypot(b.x-px,b.y-py));
  }

  updateBullets(dt,now){
    for(let i=this.playerBullets.length-1;i>=0;i--){
      const b=this.playerBullets[i];
      if(b.type==='missile' && b.target && this.entityAlive(b.target)){
        const tx=b.target.x+b.target.w/2,ty=b.target.y+b.target.h/2;
        const dx=tx-(b.x+b.w/2),dy=ty-(b.y+b.h/2),d=Math.hypot(dx,dy)||1;
        const sp=650;
        b.vx+=(dx/d*sp-b.vx)*Math.min(1,b.turn*dt/1000);
        b.vy+=(dy/d*sp-b.vy)*Math.min(1,b.turn*dt/1000);
      }
      b.x+=b.vx*dt/1000;b.y+=b.vy*dt/1000;

      const obstacle=this.obstacles.find(o=>!o.dead && this.hitScaledPair(b,1,o,.68));
      if(obstacle){
        this.damageObstacle(obstacle,b.damage,b.x,b.y);
        this.playerBullets.splice(i,1);continue;
      }

      if(this.boss && this.hitScaledPair(b,1,this.boss,.72)){
        this.damageBoss(b.damage,b.x,b.y);
        this.playerBullets.splice(i,1);continue;
      }

      let hitEnemy=false;
      for(const e of this.enemies){
        if(!e.alive)continue;
        if(this.hitScaledPair(b,1,e,.65)){
          e.hp-=b.damage;this.burst(b.x,b.y,'#ff5252',5);
          if(e.hp<=0)this.killEnemy(e);
          else SF.Audio.hit();
          hitEnemy=true;break;
        }
      }
      if(hitEnemy){this.playerBullets.splice(i,1);continue;}
      if(b.y<-60||b.x<-80||b.x>this.w+80)this.playerBullets.splice(i,1);
    }

    for(let i=this.enemyBullets.length-1;i>=0;i--){
      const b=this.enemyBullets[i];
      b.x+=b.vx*dt/1000;b.y+=b.vy*dt/1000;
      if(this.obstacles.some(o=>!o.dead&&this.hitScaledPair(b,1,o,.64))){
        this.enemyBullets.splice(i,1);continue;
      }
      if(now>=this.player.invulnUntil && this.hitScaledPair(b,1,this.player,.58)){
        this.enemyBullets.splice(i,1);
        this.damagePlayer();continue;
      }
      if(b.y>this.h+50||b.x<-60||b.x>this.w+60)this.enemyBullets.splice(i,1);
    }
  }

  updateEnemies(dt,now){
    const alive=this.enemies.filter(e=>e.alive);
    if(!alive.length)return;
    const p=this.profile(),f=this.formation;
    const moveSpeed=Math.max(p.formationSpeed,this.w*.11);
    const step=f.dir*moveSpeed*dt/1000;
    const normal=alive.filter(e=>!e.isGuardian);
    const edgeSet=normal.length?normal:alive;
    const minBase=Math.min(...edgeSet.map(e=>e.baseX));
    const maxBase=Math.max(...edgeSet.map(e=>e.baseX+e.w));
    let candidate=f.x+step;
    if(minBase+candidate<7||maxBase+candidate>this.w-7){
      f.dir*=-1;this.enemyDir=f.dir;
      f.drop+=p.formationDrop;
      candidate=f.x;
    }
    f.x=candidate;

    for(const e of alive){
      const osc=Math.sin(now*e.freq+e.phase);
      const diag=Math.sin(now*(e.freq*.82)+e.phase*1.7);
      let localX=osc*e.ampX,localY=diag*e.ampY;
      if(e.isGuardian){
        localX+=Math.sin(now*.0031+e.phase)*Math.min(18,p.diagonalAmp);
        localY+=Math.cos(now*.00225+e.phase)*5;
      }
      e.x=e.baseX+f.x+localX;
      e.y=e.baseY+f.drop+localY;
      e.x=Math.max(5,Math.min(this.w-e.w-5,e.x));
    }
    const lowest=Math.max(...alive.map(e=>e.y+e.h));
    if(lowest>this.player.y-42 && now>=this.player.invulnUntil){
      this.damagePlayer(true);
      f.drop=Math.max(0,f.drop-78);
    }
  }

  updateBoss(dt,now){
    const b=this.boss;if(!b)return;
    const ratio=b.hp/b.maxHp;
    const mul=ratio>.62?1:ratio>.30?1.34:1.72;
    b.x+=b.vx*b.dir*mul*dt/1000;
    b.y=b.baseY+Math.sin(now*.00245+b.phase)*24+(ratio<.45?Math.sin(now*.0047)*12:0);
    if(b.x<7||b.x+b.w>this.w-7){b.dir*=-1;b.x=Math.max(7,Math.min(this.w-b.w-7,b.x));}
    if(now-b.lastShot>Math.max(330,850-this.wave*24)){
      b.lastShot=now;
      const cx=b.x+b.w/2,cy=b.y+b.h*.73;
      const px=this.player.x+this.player.w/2,py=this.player.y;
      const dx=px-cx,dy=py-cy,d=Math.hypot(dx,dy)||1;
      const sp=300+this.wave*11;
      this.enemyBullets.push({x:cx-4,y:cy,w:8,h:15,vx:dx/d*sp*.48,vy:Math.max(180,dy/d*sp),type:'boss'});
      if(ratio<.68){
        for(const vx of [-185,185])this.enemyBullets.push({x:cx-3,y:cy,w:6,h:12,vx,vy:285+this.wave*6,type:'boss'});
      }
      if(ratio<.32){
        for(const vx of [-300,-100,100,300])this.enemyBullets.push({x:cx-3,y:cy,w:6,h:12,vx,vy:255+this.wave*7,type:'boss'});
      }
      const cap=SF.Config.performance.maxEnemyBullets;
      if(this.enemyBullets.length>cap)this.enemyBullets.splice(0,this.enemyBullets.length-cap);
    }
  }

  updateEnemyFire(now){
    if(this.boss)return;
    const p=this.profile();
    const alive=this.enemies.filter(e=>e.alive);
    if(!alive.length)return;

    const guardian=alive.find(e=>e.isGuardian);
    if(guardian && now-this.lastGuardianShot>=p.guardianFire){
      this.lastGuardianShot=now;
      const sx=guardian.x+guardian.w/2,sy=guardian.y+guardian.h*.70;
      const px=this.player.x+this.player.w/2,py=this.player.y;
      const dx=px-sx,dy=py-sy,d=Math.hypot(dx,dy)||1;
      const sp=p.enemyBulletSpeed*1.08;
      for(const drift of [-105,0,105]){
        this.enemyBullets.push({x:sx-4,y:sy,w:8,h:14,vx:dx/d*sp*.38+drift,vy:Math.max(190,dy/d*sp),type:'guardian'});
      }
      if(this.wave>=6){
        this.enemyBullets.push({x:sx-3,y:sy,w:6,h:12,vx:-190,vy:sp*.82,type:'guardian'});
        this.enemyBullets.push({x:sx-3,y:sy,w:6,h:12,vx:190,vy:sp*.82,type:'guardian'});
      }
    }

    if(now-this.lastEnemyShot>=p.enemyFire){
      this.lastEnemyShot=now;
      const regular=alive.filter(e=>!e.isGuardian);
      const count=this.wave>=6?2:1;
      for(let i=0;i<count&&regular.length;i++){
        const shooter=regular[Math.floor(Math.random()*regular.length)];
        const sx=shooter.x+shooter.w/2,sy=shooter.y+shooter.h*.72;
        const px=this.player.x+this.player.w/2,py=this.player.y;
        const dx=px-sx,dy=py-sy,d=Math.hypot(dx,dy)||1;
        const speed=p.enemyBulletSpeed*(.90+Math.random()*.16);
        const lateral=shooter.motion==='diagonal'?(Math.random()-.5)*95:0;
        this.enemyBullets.push({x:sx-3,y:sy,w:6,h:13,vx:dx/d*speed*.34+lateral,vy:Math.max(175,dy/d*speed),type:'alien'});
      }
    }
    const cap=SF.Config.performance.maxEnemyBullets;
    if(this.enemyBullets.length>cap)this.enemyBullets.splice(0,this.enemyBullets.length-cap);
  }

  updateObstacles(dt,now){
    const p=this.profile();
    if(this.wave>=2 && now-this.lastObstacle>p.obstacleInterval && this.obstacles.filter(o=>!o.dead).length<p.maxObstacles){
      this.lastObstacle=now;this.spawnObstacle(now);
    }
    for(const o of this.obstacles){
      if(o.dead)continue;
      if(o.static){
        o.ttl-=dt;
        if(o.ttl<=0){o.dead=true;continue;}
        o.alpha=Math.min(1,o.ttl/850);
      }else{
        o.x+=o.vx*dt/1000;
        if(o.baseY!==undefined)o.y=o.baseY+Math.sin(now*.0015+o.phase)*o.waveAmp;
        else o.y+=o.vy*dt/1000;
      }
      o.rotation+=(o.rotSpeed||0)*dt/1000;
      if(now>=this.player.invulnUntil && this.hitScaledPair(this.player,.56,o,.62)){
        o.dead=o.destructible;
        this.damagePlayer();
      }
      if(o.x<-o.w*2||o.x>this.w+o.w*2||o.y>this.h+o.h*2)o.dead=true;
    }
    this.obstacles=this.obstacles.filter(o=>!o.dead);
  }

  spawnObstacle(now){
    const p=this.profile();
    const pool=SF.Config.obstacleTypes.filter(t=>this.wave>=t.minWave);
    const sum=pool.reduce((s,t)=>s+t.weight,0);
    let r=Math.random()*sum,type=pool[0];
    for(const t of pool){r-=t.weight;if(r<=0){type=t;break;}}
    let asset=type.asset;
    if(type.id==='meteor')asset=['obs_meteor_large','obs_meteor_medium','obs_meteor_small'][Math.floor(Math.random()*3)];
    if(type.id==='wreckage')asset=['obs_wreckage_a','obs_wreckage_b','obs_wreckage_c','obs_wreckage_d'][Math.floor(Math.random()*4)];
    const size=type.minSize+Math.random()*(type.maxSize-type.minSize);
    const useStatic=Math.random()<p.staticChance && ['asteroids','planet','destroyed'].includes(type.id);
    const diagonal=!useStatic && Math.random()<p.obstacleDiagonalChance;
    const dir=Math.random()<.5?1:-1;
    const speed=p.obstacleSpeed*(.82+Math.random()*.45);
    const o={
      id:type.id,asset,w:size,h:size*(type.id==='wreckage'?.78:.92),hp:type.hp,maxHp:type.hp,
      destructible:type.destructible,score:type.score,x:0,y:0,vx:0,vy:0,rotation:Math.random()*6.28,
      rotSpeed:(Math.random()-.5)*.75,phase:Math.random()*6.28,waveAmp:7+Math.random()*13,
      static:useStatic,ttl:useStatic?5000+Math.random()*2800:0,alpha:1,dead:false
    };
    if(useStatic){
      o.x=18+Math.random()*Math.max(1,this.w-o.w-36);
      o.y=this.h*(.28+Math.random()*.31);
    }else if(diagonal){
      o.x=dir>0?-o.w-12:this.w+12;
      o.y=40+Math.random()*this.h*.18;
      o.vx=dir*speed*.75;o.vy=speed*(.55+Math.random()*.35);
    }else{
      o.x=dir>0?-o.w-12:this.w+12;
      o.baseY=this.h*(.25+Math.random()*.43);o.y=o.baseY;
      o.vx=dir*speed;o.vy=0;
    }
    this.obstacles.push(o);
  }

  damageObstacle(o,damage,x,y){
    this.burst(x,y,o.id==='meteor'?'#ff8a3c':'#a9d4ff',5);
    if(!o.destructible)return;
    o.hp-=damage;
    if(o.hp<=0){
      o.dead=true;this.score+=o.score;this.explode(o.x+o.w/2,o.y+o.h/2,o.id==='meteor'?'#ff7a27':'#9eb7c9',14);
      SF.Audio.boom();this.checkLife();
    }
  }

  updatePowerups(dt,now){
    for(let i=this.powerups.length-1;i>=0;i--){
      const p=this.powerups[i];
      p.y+=p.vy*dt/1000;p.phase+=dt*.004;
      if(this.hitScaledPair(p,.78,this.player,.64)){
        this.applyPower(p.kind,now);this.powerups.splice(i,1);continue;
      }
      if(p.y>this.h+40)this.powerups.splice(i,1);
    }
  }

  dropPower(x,y,forced=false){
    if(this.powerups.length>=SF.Config.performance.maxPowerups||(!forced&&Math.random()>.11))return;
    const weights=SF.Config.powerDropWeights,total=Object.values(weights).reduce((a,b)=>a+b,0);
    let roll=Math.random()*total,kind='spread';
    for(const [k,w] of Object.entries(weights)){roll-=w;if(roll<=0){kind=k;break;}}
    this.powerups.push({x:x-16,y,w:32,h:32,kind,vy:118,phase:Math.random()*6.28});
  }

  applyPower(kind,now){
    const def=SF.Config.powers[kind];if(!def)return;
    SF.Audio.power(kind);this.message(def.label,620);
    this.effects.powerPulseUntil=now+380;this.effects.powerPulseKind=kind;
    if(kind==='spread'){this.effects.spreadUntil=now+def.duration;this.effects.spreadFlashUntil=now+420;}
    else if(kind==='beam')this.effects.beamUntil=now+def.duration;
    else if(kind==='missiles')this.effects.missilesUntil=now+def.duration;
    else if(kind==='shield')this.effects.shieldUntil=now+def.duration;
    else if(kind==='chain')this.triggerChain(now);
    else if(kind==='emp')this.triggerEMP(now);
  }

  triggerChain(now){
    const targets=this.getTargets().slice(0,5);
    const pts=[{x:this.player.x+this.player.w/2,y:this.player.y}];
    for(const t of targets){
      pts.push({x:t.x+t.w/2,y:t.y+t.h/2});
      if(t===this.boss)this.damageBoss(5,t.x+t.w/2,t.y+t.h/2);
      else{t.hp-=3;if(t.hp<=0)this.killEnemy(t);}
    }
    this.chainPoints=pts;this.effects.chainUntil=now+430;
  }

  triggerEMP(now){
    this.enemyBullets=[];
    let killed=0,scoreGain=0,fxCount=0;
    for(const e of this.enemies){
      if(!e.alive)continue;
      e.hp-=e.isGuardian?2:1;
      if(e.hp<=0){
        e.alive=false;killed++;scoreGain+=e.pts||20;
        // EMP can erase a dense formation. Cap per-enemy debris so the power never
        // creates a one-frame particle storm on phones/tablets.
        if(fxCount<9){this.burst(e.x+e.w/2,e.y+e.h/2,e.isGuardian?'#ff9b45':'#8fcfff',3);fxCount++;}
      }
    }
    if(scoreGain){this.score+=scoreGain;this.checkLife();}
    if(this.boss)this.damageBoss(4.5,this.boss.x+this.boss.w/2,this.boss.y+this.boss.h/2);
    this.effects.empUntil=now+540;
    if(killed>0)this.message(`EMP · ${killed} OBJETIVOS`,520);
  }

  updateBeam(now){
    if(now>=this.effects.beamUntil)return;
    if(now-this.lastBeamTick<135)return;
    this.lastBeamTick=now;
    const cx=this.player.x+this.player.w/2;
    const top=this.getBeamTop(cx);
    const beam={x:cx-11,y:top,w:22,h:this.player.y-top};
    for(const e of this.enemies){
      if(e.alive&&this.hitScaledPair(beam,1,e,.65)){e.hp-=1.45;if(e.hp<=0)this.killEnemy(e);}
    }
    if(this.boss&&this.hitScaledPair(beam,1,this.boss,.72))this.damageBoss(1.8,cx,this.boss.y+this.boss.h/2);
  }

  getBeamTop(cx){
    let top=0;
    for(const o of this.obstacles){
      if(o.dead)continue;
      const b=this.collisionBox(o,.65);
      if(cx>=b.x&&cx<=b.x+b.w&&b.y+b.h<this.player.y)top=Math.max(top,b.y+b.h);
    }
    return top;
  }

  updateParticles(dt){
    for(const p of this.particles){
      p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.life-=dt;p.vy+=22*dt/1000;
    }
    const cap=SF.Config.performance.maxParticles;
    this.particles=this.particles.filter(p=>p.life>0).slice(-cap);
  }

  damagePlayer(breach=false){
    const now=performance.now();
    if(now<this.effects.shieldUntil){
      this.effects.shieldUntil=0;this.effects.empUntil=now+150;SF.Audio.power('shield');return;
    }
    if(this.player.hp>1){
      this.player.hp--;this.player.invulnUntil=now+1300;this.explode(this.player.x+this.player.w/2,this.player.y+this.player.h/2,'#ff9a4f',12);SF.Audio.hit();return;
    }
    this.lives--;this.player.hp=this.player.maxHp;this.player.invulnUntil=now+1900;
    this.explode(this.player.x+this.player.w/2,this.player.y+this.player.h/2,'#ff4d5b',24);SF.Audio.boom();
    if(this.lives<=0){this.gameOver();return;}
    this.message(breach?'LÍNEA ENEMIGA':'NAVE DAÑADA',700);this.save();
  }

  gameOver(){
    if(this.over)return;this.over=true;
    SF.Storage.addRank({name:this.playerName,score:Math.floor(this.score),wave:this.wave,at:new Date().toLocaleDateString()});
    SF.Storage.deleteGame();
    this.message('MISIÓN PERDIDA',1700);
    this.ui?.refreshRanking();
    setTimeout(()=>{if(this.over){this.mode='menu';this.ui?.showScreen('splash');}},2200);
  }

  killEnemy(e){
    if(!e.alive)return;e.alive=false;
    this.score+=e.pts||20;this.checkLife();
    this.explode(e.x+e.w/2,e.y+e.h/2,e.isGuardian?'#ff9b45':'#ff394f',e.isGuardian?22:10);
    if(e.isGuardian){this.message('GUARDIÁN ELIMINADO',520);SF.Audio.boom();}
    this.dropPower(e.x+e.w/2,e.y+e.h/2,e.isGuardian);
  }

  damageBoss(dmg,x,y){
    if(!this.boss)return;
    this.boss.hp-=dmg;this.burst(x,y,'#ff7d5c',7);
    if(this.boss.hp<=0){
      const b=this.boss;
      this.score+=900+this.wave*70;this.checkLife();
      this.explode(b.x+b.w/2,b.y+b.h/2,'#ff5b39',34);SF.Audio.boom();
      this.boss=null;
    }
  }

  checkLife(){
    let gained=0;
    while(this.score>=this.nextLife){this.lives++;this.nextLife+=2500;gained++;}
    if(gained){this.message(gained>1?`+${gained} VIDAS`:'+1 VIDA',650);SF.Audio.pickup();}
  }

  entityAlive(t){return t===this.boss?!!this.boss:!!t?.alive;}

  hit(a,b){return a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

  hitScaledPair(a,sa,b,sb){
    if(!a||!b)return false;
    const aw=a.w*sa,ah=a.h*sa,ax=a.x+(a.w-aw)/2,ay=a.y+(a.h-ah)/2;
    const bw=b.w*sb,bh=b.h*sb,bx=b.x+(b.w-bw)/2,by=b.y+(b.h-bh)/2;
    return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
  }

  collisionBox(o,scale=.7){
    const w=o.w*scale,h=o.h*scale;
    return{x:o.x+(o.w-w)/2,y:o.y+(o.h-h)/2,w,h};
  }

  burst(x,y,col='#fff',n=6){
    n=Math.max(2,Math.round(n*this.perf.fx));
    for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:150+Math.random()*160,size:1+Math.random()*2.4,col});
  }

  explode(x,y,col='#fff',n=18){
    n=Math.max(5,Math.round(n*this.perf.fx));
    for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,life:300+Math.random()*360,size:1.4+Math.random()*3.6,col});
  }

  render(dt,now){
    this.renderBackground(dt,now,1);
    if(this.mode!=='game')return;
    const ctx=this.ctx;
    this.drawObstacles(now);
    this.drawEnemies(now);
    this.drawBoss(now);
    this.drawPowerups(now);
    this.drawBullets(now);
    this.drawEffects(now);
    this.drawPlayer(now);
    this.drawParticles();
    this.drawBossHud();
    this.updateHud(now);
  }

  renderBackground(dt,now,alpha=1){
    const ctx=this.ctx,bg=this.background;
    if(!SF.Assets.drawCover(ctx,bg.id,this.w,this.h,this.bgOffset,alpha)){
      ctx.fillStyle='#02040a';ctx.fillRect(0,0,this.w,this.h);
    }
    ctx.save();
    ctx.globalAlpha=.22;ctx.fillStyle='#01030a';ctx.fillRect(0,0,this.w,this.h);
    const g=ctx.createLinearGradient(0,0,0,this.h);
    g.addColorStop(0,'rgba(0,0,0,.18)');g.addColorStop(.55,'rgba(0,0,0,.04)');g.addColorStop(1,'rgba(0,0,0,.30)');
    ctx.fillStyle=g;ctx.fillRect(0,0,this.w,this.h);
    ctx.restore();
  }

  drawObstacles(now){
    const ctx=this.ctx;
    for(const o of this.obstacles){
      SF.Assets.drawFast(ctx,o.asset,o.x,o.y,o.w,o.h,{rotation:o.rotation,alpha:o.alpha});
      if(o.id==='meteor'){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.30;
        ctx.fillStyle='#ff7a2d';ctx.beginPath();ctx.arc(o.x+o.w*.42,o.y+o.h*.50,Math.max(3,o.w*.12),0,Math.PI*2);ctx.fill();ctx.restore();
      }
      if(o.destructible&&o.hp<o.maxHp){
        ctx.save();ctx.globalAlpha=.72;ctx.fillStyle='rgba(0,0,0,.66)';ctx.fillRect(o.x,o.y-4,o.w,3);
        ctx.fillStyle='#ffb047';ctx.fillRect(o.x,o.y-4,o.w*Math.max(0,o.hp/o.maxHp),3);ctx.restore();
      }
    }
  }

  drawEnemies(now){
    const ctx=this.ctx;
    for(const e of this.enemies){
      if(!e.alive)continue;
      const asset=SF.Config.enemyAssets[e.kind]||'enemy_swarm_1';
      const pulse=e.isGuardian?(.96+Math.sin(now*.005+e.phase)*.035):(.97+Math.sin(now*.004+e.phase)*.025);
      const dw=e.w*pulse,dh=e.h*pulse;
      if(e.isGuardian){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.26+.08*Math.sin(now*.006);
        ctx.strokeStyle='#ff5a4e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,Math.max(e.w,e.h)*.48,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      SF.Assets.drawFast(ctx,asset,e.x+(e.w-dw)/2,e.y+(e.h-dh)/2,dw,dh);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=e.isGuardian?.7:.42;
      ctx.fillStyle=e.isGuardian?'#ff8a45':'#ff394f';ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h*.46,Math.max(1.4,e.w*(e.isGuardian?.055:.038)),0,Math.PI*2);ctx.fill();ctx.restore();
      if(e.isGuardian||(e.maxHp>1&&e.hp<e.maxHp)){
        const barY=e.y-5,barH=e.isGuardian?4:3;
        ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(e.x,barY,e.w,barH);
        ctx.fillStyle=e.isGuardian?'#ffad45':'#ff5d67';ctx.fillRect(e.x,barY,e.w*Math.max(0,e.hp/e.maxHp),barH);
      }
    }
  }

  drawBoss(now){
    const b=this.boss;if(!b)return;
    const ctx=this.ctx,ratio=b.hp/b.maxHp,hue=(this.wave*31)%280;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=ratio<.3?.28:.16;
    ctx.strokeStyle=ratio<.3?'#ff2a2a':'#ff604b';ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(b.x+b.w/2,b.y+b.h/2,b.w*.43,b.h*.38,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    SF.Assets.drawFast(ctx,'enemy_elite_1',b.x,b.y,b.w,b.h,{filter:`hue-rotate(${hue}deg) saturate(${ratio<.35?1.42:1.10})`});
  }

  drawPlayer(now){
    const p=this.player,ctx=this.ctx;
    if(now<p.invulnUntil&&Math.floor(now/70)%2===0)return;
    SF.Assets.drawFast(ctx,this.ship.asset,p.x,p.y,p.w,p.h);
    // inexpensive engine intensity cue makes the faster movement feel more physical
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55+.2*Math.sin(now*.025);
    ctx.fillStyle=this.shipId==='specter'?'#9b74ff':this.shipId==='warden'?'#ff8b38':'#51bfff';
    ctx.beginPath();ctx.moveTo(p.x+p.w*.38,p.y+p.h*.80);ctx.lineTo(p.x+p.w*.48,p.y+p.h*1.03);ctx.lineTo(p.x+p.w*.52,p.y+p.h*.80);ctx.fill();
    ctx.beginPath();ctx.moveTo(p.x+p.w*.52,p.y+p.h*.80);ctx.lineTo(p.x+p.w*.62,p.y+p.h*1.03);ctx.lineTo(p.x+p.w*.66,p.y+p.h*.80);ctx.fill();ctx.restore();
    if(p.maxHp>1){
      const ratio=p.hp/p.maxHp;
      ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(p.x,p.y+p.h+3,p.w,4);
      ctx.fillStyle=ratio>.45?'#7dff9b':'#ff6b57';ctx.fillRect(p.x,p.y+p.h+3,p.w*ratio,4);
    }
  }

  drawBullets(now){
    const ctx=this.ctx;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(const b of this.playerBullets){
      if(b.type==='missile'){
        ctx.globalAlpha=.9;ctx.fillStyle='#fff4d4';ctx.fillRect(b.x+2,b.y,Math.max(2,b.w-4),b.h*.52);
        ctx.fillStyle='#ff8428';ctx.fillRect(b.x,b.y+b.h*.48,b.w,b.h*.52);
        ctx.globalAlpha=.36;ctx.fillStyle='#ffb34a';ctx.fillRect(b.x+1,b.y+b.h,b.w-2,7);
      }else{
        const col=b.type==='heavy'?'#ffb14a':b.type==='precision'?'#c794ff':'#74e7ff';
        ctx.globalAlpha=.92;ctx.fillStyle='#ffffff';ctx.fillRect(b.x,b.y,b.w,b.h*.52);
        ctx.fillStyle=col;ctx.fillRect(b.x,b.y+b.h*.42,b.w,b.h*.58);
      }
    }
    for(const b of this.enemyBullets){
      const guard=b.type==='guardian',boss=b.type==='boss';
      ctx.globalAlpha=.92;ctx.fillStyle=guard?'#ffd0ff':boss?'#fff0b0':'#ffe9a6';ctx.fillRect(b.x,b.y,b.w,b.h*.34);
      ctx.fillStyle=guard?'#df55ff':boss?'#ff3f34':'#ff633f';ctx.fillRect(b.x,b.y+b.h*.28,b.w,b.h*.72);
    }
    ctx.restore();
  }

  drawPowerups(now){
    const ctx=this.ctx;
    for(const p of this.powerups){
      const def=SF.Config.powers[p.kind],pulse=1+Math.sin(now*.006+p.phase)*.11;
      const s=p.w*pulse,col=p.kind==='shield'?'#5eeeff':p.kind==='emp'?'#a46cff':p.kind==='chain'?'#79a8ff':'#ffb54b';
      ctx.save();ctx.globalAlpha=.88;ctx.strokeStyle=col;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+p.h/2,s*.42,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.22;ctx.fillStyle=col;ctx.fill();
      ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.font='700 9px Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(def.label.slice(0,3),p.x+p.w/2,p.y+p.h/2);ctx.restore();
    }
  }

  drawEffects(now){
    const ctx=this.ctx,p=this.player,cx=p.x+p.w/2,cy=p.y+p.h/2;
    ctx.save();ctx.globalCompositeOperation='lighter';

    // Plasma beam: procedural layers instead of scaling a large PNG every frame.
    if(now<this.effects.beamUntil){
      const top=this.getBeamTop(cx),h=Math.max(10,p.y-top),flick=.75+.25*Math.sin(now*.045);
      const grad=ctx.createLinearGradient(cx-16,0,cx+16,0);
      grad.addColorStop(0,'rgba(30,130,255,0)');grad.addColorStop(.28,`rgba(40,160,255,${.30*flick})`);
      grad.addColorStop(.5,`rgba(205,245,255,${.88*flick})`);grad.addColorStop(.72,`rgba(40,160,255,${.30*flick})`);grad.addColorStop(1,'rgba(30,130,255,0)');
      ctx.fillStyle=grad;ctx.fillRect(cx-18,top,36,h);
      ctx.globalAlpha=.94;ctx.fillStyle='#ecffff';ctx.fillRect(cx-3,top,6,h);
      ctx.globalAlpha=.34;ctx.fillStyle='#6ddcff';ctx.fillRect(cx-8+Math.sin(now*.055)*2,top,3,h);
    }

    // Shield: two lightweight rings + rotating segmented arc.
    if(now<this.effects.shieldUntil){
      const r=Math.max(p.w,p.h)*.72;
      ctx.globalAlpha=.38;ctx.strokeStyle='#65eaff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.60;ctx.strokeStyle='#c9fbff';ctx.lineWidth=1.4;ctx.setLineDash([12,9]);ctx.lineDashOffset=-now*.035;
      ctx.beginPath();ctx.arc(cx,cy,r*.88,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      ctx.globalAlpha=.07;ctx.fillStyle='#55dfff';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    }

    // EMP: one expanding shock ring, no full-screen texture resize.
    if(now<this.effects.empUntil){
      const left=this.effects.empUntil-now,k=Math.max(0,Math.min(1,1-left/540));
      const r=28+Math.max(this.w,this.h)*.52*k;
      ctx.globalAlpha=(1-k)*.70;ctx.strokeStyle='#b477ff';ctx.lineWidth=Math.max(1,5*(1-k));
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=(1-k)*.30;ctx.strokeStyle='#f4dcff';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(cx,cy,r*.84,0,Math.PI*2);ctx.stroke();
    }

    // Chain lightning uses deterministic jitter so it reads as animated without allocations.
    if(now<this.effects.chainUntil&&this.chainPoints.length>1){
      for(let pass=0;pass<2;pass++){
        ctx.globalAlpha=pass? .34:.82;ctx.strokeStyle=pass?'#4a7fff':'#d8f7ff';ctx.lineWidth=pass?5:2;
        ctx.beginPath();ctx.moveTo(this.chainPoints[0].x,this.chainPoints[0].y);
        for(let i=1;i<this.chainPoints.length;i++){
          const a=this.chainPoints[i-1],b=this.chainPoints[i];
          const j=Math.sin(now*.031+i*4.21)*(pass?12:7);
          const mx=(a.x+b.x)/2+j,my=(a.y+b.y)/2-Math.cos(now*.027+i*2.7)*(pass?7:4);
          ctx.lineTo(mx,my);ctx.lineTo(b.x,b.y);
        }
        ctx.stroke();
      }
    }

    // Spread activation fan.
    if(now<this.effects.spreadFlashUntil){
      const left=this.effects.spreadFlashUntil-now,a=Math.max(0,left/420);
      ctx.globalAlpha=.46*a;ctx.strokeStyle='#ffb54b';ctx.lineWidth=2;
      for(const dx of [-55,-28,0,28,55]){ctx.beginPath();ctx.moveTo(cx,p.y);ctx.lineTo(cx+dx,p.y-58);ctx.stroke();}
    }

    // Missile launch flash is local to the player rather than a large sprite.
    if(now<this.effects.missileFlashUntil){
      const a=Math.max(0,(this.effects.missileFlashUntil-now)/260);
      ctx.globalAlpha=.54*a;ctx.strokeStyle='#ff9d37';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(p.x+p.w*.28,p.y+p.h*.15);ctx.lineTo(p.x+p.w*.18,p.y-34);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p.x+p.w*.72,p.y+p.h*.15);ctx.lineTo(p.x+p.w*.82,p.y-34);ctx.stroke();
    }

    // Short activation pulse shared by every power, color-coded.
    if(now<this.effects.powerPulseUntil){
      const left=this.effects.powerPulseUntil-now,k=1-Math.max(0,left/380);
      const cmap={spread:'#ffb34a',beam:'#64d9ff',missiles:'#ff8237',shield:'#6df2ff',chain:'#719bff',emp:'#b06bff'};
      ctx.globalAlpha=(1-k)*.55;ctx.strokeStyle=cmap[this.effects.powerPulseKind]||'#fff';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,18+k*64,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }

  drawParticles(){
    const ctx=this.ctx;ctx.save();ctx.globalCompositeOperation='lighter';
    for(const p of this.particles){
      ctx.globalAlpha=Math.max(0,p.life/650);ctx.fillStyle=p.col;
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();ctx.globalAlpha=1;
  }

  drawBossHud(){
    const b=this.boss;if(!b)return;
    const ctx=this.ctx,w=Math.min(310,this.w*.62),x=(this.w-w)/2,y=47;
    ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(x-2,y-2,w+4,10);
    ctx.fillStyle='#351219';ctx.fillRect(x,y,w,6);
    ctx.fillStyle='#ff4a4a';ctx.fillRect(x,y,w*Math.max(0,b.hp/b.maxHp),6);
    ctx.strokeStyle='rgba(255,220,190,.55)';ctx.strokeRect(x,y,w,6);
  }

  updateHud(now){
    if(!this.ui)return;
    const active=[];
    if(now<this.effects.spreadUntil)active.push(`DISP ${Math.ceil((this.effects.spreadUntil-now)/1000)}s`);
    if(now<this.effects.beamUntil)active.push(`PLASMA ${Math.ceil((this.effects.beamUntil-now)/1000)}s`);
    if(now<this.effects.missilesUntil)active.push(`MSL ${Math.ceil((this.effects.missilesUntil-now)/1000)}s`);
    if(now<this.effects.shieldUntil)active.push(`ESC ${Math.ceil((this.effects.shieldUntil-now)/1000)}s`);
    const guard=this.enemies.find(e=>e.alive&&e.isGuardian);
    if(guard)active.push(`GUARD ${Math.ceil(guard.hp/guard.maxHp*100)}%`);
    this.ui.updateHud(
      `${this.playerName} · ${this.ship.name}`,
      `${this.background.label} · N${this.wave}${active.length?' · '+active.join(' · '):''}`,
      `${Math.floor(this.score)} · ${this.lives}▲`
    );
  }
};
