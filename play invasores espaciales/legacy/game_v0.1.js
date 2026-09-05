
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
    this.enemies=[];this.enemyDir=1;this.boss=null;
    this.playerBullets=[];this.enemyBullets=[];this.obstacles=[];this.powerups=[];this.particles=[];
    this.lastShot=0;this.lastEnemyShot=0;this.lastObstacle=0;this.lastMissile=0;this.lastBeamTick=0;
    this.waveTransitionUntil=0;
    this.effects={spreadUntil:0,beamUntil:0,missilesUntil:0,shieldUntil:0,empUntil:0,chainUntil:0,missileFlashUntil:0};
    this.chainPoints=[];
    this._pauseCooldown=0;
  }

  setUI(ui){this.ui=ui;}

  resize(){
    this.dpr=Math.min(window.devicePixelRatio||1,2);
    this.canvas.width=Math.round(innerWidth*this.dpr);
    this.canvas.height=Math.round(innerHeight*this.dpr);
    this.canvas.style.width=innerWidth+'px';
    this.canvas.style.height=innerHeight+'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.w=innerWidth;this.h=innerHeight;
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
    this.lastT=now;this.lastShot=0;this.lastEnemyShot=0;this.lastObstacle=now+800;
    this.playerBullets=[];this.enemyBullets=[];this.obstacles=[];this.powerups=[];this.particles=[];
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
    this.waveTransitionUntil=0;
    if(this.wave%SF.Config.bossEvery===0){
      this.spawnBoss();
      return;
    }
    const p=this.profile();
    const portrait=this.h>=this.w;
    const cols=Math.min(p.cols,portrait?7:9), rows=p.rows;
    const enemyW=Math.max(34,Math.min(54,this.w/(cols+3)));
    const enemyH=enemyW*1.02;
    const gapX=Math.max(8,(this.w-cols*enemyW)/(cols+1));
    const gapY=Math.max(7,enemyH*.25);
    const startY=68;
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let kind='octo',hp=1,pts=20;
        if(r===0){kind=c%2?'squid':'crab';pts=30;}
        else if(r===1){kind=c%3===0?'octo':'crab';pts=24;}
        else if(this.wave>=3&&r===rows-1){kind=c%2?'mosquito':'carrier';hp=1+Math.floor(this.wave/6);pts=45;}
        if(this.wave>=6&&r>=rows-2&&c%3===0){kind='plasma_orb';hp=2+Math.floor(this.wave/7);pts=60;}
        if(this.wave>=8&&r===0&&c===Math.floor(cols/2)){kind='elite_eye';hp=5+Math.floor(this.wave/3);pts=150;}
        const x=gapX+(enemyW+gapX)*c;
        const y=startY+(enemyH+gapY)*r;
        this.enemies.push({x,y,w:enemyW,h:enemyH,kind,hp,maxHp:hp,pts,alive:true,phase:Math.random()*6.28});
      }
    }
    this.enemyDir=1;
  }

  spawnBoss(){
    const bw=Math.min(300,Math.max(150,this.w*.52));
    const bh=bw*1.12;
    this.boss={
      x:this.w/2-bw/2,y:64,w:bw,h:bh,
      hp:80+this.wave*15,maxHp:80+this.wave*15,
      vx:95+this.wave*5,dir:1,lastShot:0,phase:0,kind:'boss'
    };
    this.message(`⚠ ENTIDAD ÉLITE · ${this.wave}`,1200);
    SF.Audio.boom();
  }

  loop(now){
    let dt=Math.min(33,now-(this.lastT||now));this.lastT=now;
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
    this.bgOffset+=dt*.014;
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
      this.waveTransitionUntil=now+900;
      this.message('SECTOR ASEGURADO',700);
      this.save();
    }
    if(this.waveTransitionUntil && now>=this.waveTransitionUntil){
      this.wave++;
      this.playerBullets=[];this.enemyBullets=[];
      this.obstacles=this.obstacles.filter(o=>o.static && o.ttl>1200).slice(0,1);
      this.spawnWave();
      this.message(`SECTOR ${this.wave}`,900);
      SF.Audio.wave();
      this.save();
    }
  }

  updatePlayer(dt,now){
    if(this.input.pointerActive){
      const target=this.input.pointerX*this.w-this.player.w/2;
      const lerp=Math.min(1,dt/55);
      this.player.x+=(target-this.player.x)*lerp;
    }else{
      const axis=this.input.axis();
      const speed=Math.max(390,this.w*.88)*this.ship.speed;
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
    if(now<this.effects.missilesUntil && now-this.lastMissile>1180){
      this.lastMissile=now;this.fireMissiles(now);
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
    this.playerBullets.push({x:x-w/2,y:y-h,w,h,vx,vy,type,damage:type==='heavy'?1.45:1});
    if(this.playerBullets.length>60)this.playerBullets.shift();
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

      const obstacle=this.obstacles.find(o=>!o.dead && this.hit(b,this.collisionBox(o,.68)));
      if(obstacle){
        this.damageObstacle(obstacle,b.damage,b.x,b.y);
        this.playerBullets.splice(i,1);continue;
      }

      if(this.boss && this.hit(b,this.collisionBox(this.boss,.72))){
        this.damageBoss(b.damage,b.x,b.y);
        this.playerBullets.splice(i,1);continue;
      }

      let hitEnemy=false;
      for(const e of this.enemies){
        if(!e.alive)continue;
        if(this.hit(b,this.collisionBox(e,.65))){
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
      if(this.obstacles.some(o=>!o.dead&&this.hit(b,this.collisionBox(o,.64)))){
        this.enemyBullets.splice(i,1);continue;
      }
      if(now>=this.player.invulnUntil && this.hit(b,this.collisionBox(this.player,.58))){
        this.enemyBullets.splice(i,1);
        this.damagePlayer();continue;
      }
      if(b.y>this.h+50||b.x<-60||b.x>this.w+60)this.enemyBullets.splice(i,1);
    }
  }

  updateEnemies(dt,now){
    const alive=this.enemies.filter(e=>e.alive);
    if(!alive.length)return;
    const p=this.profile();
    let reverse=false;
    for(const e of alive){
      e.x+=this.enemyDir*p.enemyStep*dt/1000;
      e.y+=Math.sin(now*.0018+e.phase)*.008*dt;
      if(e.x<8||e.x+e.w>this.w-8)reverse=true;
    }
    if(reverse){
      this.enemyDir*=-1;
      for(const e of alive){
        e.x=Math.max(8,Math.min(this.w-e.w-8,e.x));
        e.y+=Math.max(10,Math.min(23,7+this.wave*.75));
      }
    }
    const lowest=Math.max(...alive.map(e=>e.y+e.h));
    if(lowest>this.player.y-42 && now>=this.player.invulnUntil){
      this.damagePlayer(true);
      for(const e of alive)e.y=Math.max(65,e.y-72);
    }
  }

  updateBoss(dt,now){
    const b=this.boss;if(!b)return;
    const ratio=b.hp/b.maxHp;
    const mul=ratio>.6?1:ratio>.3?1.35:1.75;
    b.x+=b.vx*b.dir*mul*dt/1000;
    b.y=68+Math.sin(now*.0018)*18+(ratio<.3?Math.sin(now*.005)*13:0);
    if(b.x<8||b.x+b.w>this.w-8){b.dir*=-1;b.x=Math.max(8,Math.min(this.w-b.w-8,b.x));}
    if(now-b.lastShot>Math.max(420,1100-this.wave*28)){
      b.lastShot=now;
      const cx=b.x+b.w/2,cy=b.y+b.h*.73;
      const px=this.player.x+this.player.w/2,py=this.player.y;
      const dx=px-cx,dy=py-cy,d=Math.hypot(dx,dy)||1;
      const sp=240+this.wave*9;
      this.enemyBullets.push({x:cx-4,y:cy,w:8,h:15,vx:dx/d*sp,vy:Math.max(120,dy/d*sp),type:'boss'});
      if(ratio<.6){
        for(const vx of [-150,150])this.enemyBullets.push({x:cx-3,y:cy,w:6,h:12,vx,vy:230+this.wave*5,type:'boss'});
      }
      if(ratio<.3){
        for(const vx of [-260,-85,85,260])this.enemyBullets.push({x:cx-3,y:cy,w:6,h:12,vx,vy:210+this.wave*6,type:'boss'});
      }
    }
  }

  updateEnemyFire(now){
    if(this.boss)return;
    const p=this.profile();
    if(now-this.lastEnemyShot<p.enemyFire)return;
    this.lastEnemyShot=now;
    const alive=this.enemies.filter(e=>e.alive);
    if(!alive.length)return;
    const shooter=alive[Math.floor(Math.random()*alive.length)];
    const sx=shooter.x+shooter.w/2,sy=shooter.y+shooter.h*.72;
    const px=this.player.x+this.player.w/2,py=this.player.y;
    const dx=px-sx,dy=py-sy,d=Math.hypot(dx,dy)||1;
    const speed=190+this.wave*7;
    this.enemyBullets.push({x:sx-3,y:sy,w:6,h:13,vx:dx/d*speed*.32,vy:Math.max(145,dy/d*speed),type:'alien'});
    if(this.enemyBullets.length>100)this.enemyBullets.shift();
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
      if(now>=this.player.invulnUntil && this.hit(this.collisionBox(this.player,.56),this.collisionBox(o,.62))){
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
    const diagonal=!useStatic && Math.random()<p.diagonalChance;
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
      if(this.hit(this.collisionBox(p,.78),this.collisionBox(this.player,.64))){
        this.applyPower(p.kind,now);this.powerups.splice(i,1);continue;
      }
      if(p.y>this.h+40)this.powerups.splice(i,1);
    }
  }

  dropPower(x,y){
    if(this.powerups.length>3||Math.random()>.105)return;
    const kinds=['spread','beam','missiles','shield','chain','emp'];
    const kind=kinds[Math.floor(Math.random()*kinds.length)];
    this.powerups.push({x:x-16,y,w:32,h:32,kind,vy:88,phase:Math.random()*6.28});
  }

  applyPower(kind,now){
    const def=SF.Config.powers[kind];if(!def)return;
    SF.Audio.pickup();this.message(def.label,700);
    if(kind==='spread')this.effects.spreadUntil=now+def.duration;
    else if(kind==='beam')this.effects.beamUntil=now+def.duration;
    else if(kind==='missiles')this.effects.missilesUntil=now+def.duration;
    else if(kind==='shield')this.effects.shieldUntil=now+def.duration;
    else if(kind==='chain')this.triggerChain(now);
    else if(kind==='emp')this.triggerEMP(now);
  }

  triggerChain(now){
    const targets=this.getTargets().slice(0,6);
    const pts=[{x:this.player.x+this.player.w/2,y:this.player.y}];
    for(const t of targets){
      pts.push({x:t.x+t.w/2,y:t.y+t.h/2});
      if(t===this.boss)this.damageBoss(5,t.x+t.w/2,t.y+t.h/2);
      else{t.hp-=3;if(t.hp<=0)this.killEnemy(t);}
    }
    this.chainPoints=pts;this.effects.chainUntil=now+520;
  }

  triggerEMP(now){
    this.enemyBullets=[];
    for(const e of this.enemies){if(e.alive){e.hp-=1;if(e.hp<=0)this.killEnemy(e);}}
    if(this.boss)this.damageBoss(4,this.boss.x+this.boss.w/2,this.boss.y+this.boss.h/2);
    this.effects.empUntil=now+650;
  }

  updateBeam(now){
    if(now>=this.effects.beamUntil)return;
    if(now-this.lastBeamTick<95)return;
    this.lastBeamTick=now;
    const cx=this.player.x+this.player.w/2;
    const top=this.getBeamTop(cx);
    const beam={x:cx-11,y:top,w:22,h:this.player.y-top};
    for(const e of this.enemies){
      if(e.alive&&this.hit(beam,this.collisionBox(e,.65))){e.hp-=1.1;if(e.hp<=0)this.killEnemy(e);}
    }
    if(this.boss&&this.hit(beam,this.collisionBox(this.boss,.72)))this.damageBoss(1.4,cx,this.boss.y+this.boss.h/2);
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
    this.particles=this.particles.filter(p=>p.life>0).slice(-320);
  }

  damagePlayer(breach=false){
    const now=performance.now();
    if(now<this.effects.shieldUntil){
      this.effects.shieldUntil=0;this.effects.empUntil=now+180;SF.Audio.hit();return;
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
    this.explode(e.x+e.w/2,e.y+e.h/2,'#ff394f',12);
    this.dropPower(e.x+e.w/2,e.y+e.h/2);
  }

  damageBoss(dmg,x,y){
    if(!this.boss)return;
    this.boss.hp-=dmg;this.burst(x,y,'#ff7d5c',7);
    if(this.boss.hp<=0){
      const b=this.boss;
      this.score+=900+this.wave*70;this.checkLife();
      this.explode(b.x+b.w/2,b.y+b.h/2,'#ff5b39',45);SF.Audio.boom();
      this.boss=null;
    }
  }

  checkLife(){
    if(this.score>=this.nextLife){
      this.lives++;this.nextLife+=2500;this.message('+1 VIDA',650);SF.Audio.pickup();
    }
  }

  entityAlive(t){return t===this.boss?!!this.boss:!!t?.alive;}

  hit(a,b){return a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

  collisionBox(o,scale=.7){
    const w=o.w*scale,h=o.h*scale;
    return{x:o.x+(o.w-w)/2,y:o.y+(o.h-h)/2,w,h};
  }

  burst(x,y,col='#fff',n=6){
    for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:180+Math.random()*180,size:1+Math.random()*2.5,col});
  }

  explode(x,y,col='#fff',n=18){
    for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*310,vy:(Math.random()-.5)*310,life:360+Math.random()*420,size:1.5+Math.random()*4,col});
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
    for(const o of this.obstacles){
      const glow=o.id==='meteor'?'rgba(255,112,32,.55)':o.id==='destroyed'?'rgba(255,85,20,.42)':'rgba(150,205,255,.18)';
      SF.Assets.drawContain(this.ctx,o.asset,o.x,o.y,o.w,o.h,{rotation:o.rotation,alpha:o.alpha,glow,glowBlur:o.id==='meteor'?14:6});
      if(o.destructible&&o.hp<o.maxHp){
        const ctx=this.ctx;ctx.save();ctx.globalAlpha=.65;
        ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(o.x,o.y-4,o.w,3);
        ctx.fillStyle='#ffb047';ctx.fillRect(o.x,o.y-4,o.w*Math.max(0,o.hp/o.maxHp),3);ctx.restore();
      }
    }
  }

  drawEnemies(now){
    for(const e of this.enemies){
      if(!e.alive)continue;
      const asset=SF.Config.enemyAssets[e.kind]||'enemy_swarm_1';
      const pulse=.92+Math.sin(now*.004+e.phase)*.06;
      const dw=e.w*pulse,dh=e.h*pulse;
      SF.Assets.drawContain(this.ctx,asset,e.x+(e.w-dw)/2,e.y+(e.h-dh)/2,dw,dh,{glow:'rgba(255,55,70,.48)',glowBlur:8});
      if(e.maxHp>1&&e.hp<e.maxHp){
        this.ctx.fillStyle='rgba(0,0,0,.65)';this.ctx.fillRect(e.x,e.y-4,e.w,3);
        this.ctx.fillStyle='#ff5d67';this.ctx.fillRect(e.x,e.y-4,e.w*Math.max(0,e.hp/e.maxHp),3);
      }
    }
  }

  drawBoss(now){
    const b=this.boss;if(!b)return;
    const ratio=b.hp/b.maxHp;
    const hue=(this.wave*31)%280;
    SF.Assets.drawContain(this.ctx,'enemy_elite_1',b.x,b.y,b.w,b.h,{
      glow:ratio<.3?'rgba(255,30,30,.88)':'rgba(255,60,75,.62)',glowBlur:ratio<.3?24:14,
      filter:`hue-rotate(${hue}deg) saturate(${ratio<.35?1.5:1.15})`
    });
  }

  drawPlayer(now){
    const p=this.player;
    if(now<p.invulnUntil&&Math.floor(now/80)%2===0)return;
    SF.Assets.drawContain(this.ctx,this.ship.asset,p.x,p.y,p.w,p.h,{glow:this.shipId==='specter'?'rgba(154,104,255,.56)':'rgba(70,190,255,.44)',glowBlur:10});
    if(p.maxHp>1){
      const ratio=p.hp/p.maxHp;
      this.ctx.fillStyle='rgba(0,0,0,.65)';this.ctx.fillRect(p.x,p.y+p.h+3,p.w,4);
      this.ctx.fillStyle=ratio>.45?'#7dff9b':'#ff6b57';this.ctx.fillRect(p.x,p.y+p.h+3,p.w*ratio,4);
    }
  }

  drawBullets(now){
    const ctx=this.ctx;
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    for(const b of this.playerBullets){
      if(b.type==='missile'){
        ctx.shadowColor='#ff9a35';ctx.shadowBlur=10;ctx.fillStyle='#fff2c4';ctx.fillRect(b.x+2,b.y,4,b.h*.55);
        ctx.fillStyle='#ff8a24';ctx.fillRect(b.x,b.y+b.h*.52,b.w,b.h*.48);
      }else{
        const col=b.type==='heavy'?'#ffb14a':b.type==='precision'?'#c794ff':'#74e7ff';
        ctx.shadowColor=col;ctx.shadowBlur=b.type==='precision'?14:9;ctx.fillStyle='#ffffff';ctx.fillRect(b.x,b.y,b.w,b.h*.58);
        ctx.fillStyle=col;ctx.fillRect(b.x,b.y+b.h*.45,b.w,b.h*.55);
      }
    }
    for(const b of this.enemyBullets){
      ctx.shadowColor='#ff4c3d';ctx.shadowBlur=10;ctx.fillStyle='#fff0b0';ctx.fillRect(b.x,b.y,b.w,b.h*.38);
      ctx.fillStyle='#ff533c';ctx.fillRect(b.x,b.y+b.h*.3,b.w,b.h*.7);
    }
    ctx.restore();
  }

  drawPowerups(now){
    const ctx=this.ctx;
    for(const p of this.powerups){
      const def=SF.Config.powers[p.kind],pulse=1+Math.sin(now*.006+p.phase)*.12;
      const s=p.w*pulse;
      ctx.save();ctx.globalAlpha=.82;
      ctx.shadowColor=p.kind==='shield'?'#5eeeff':p.kind==='emp'?'#a46cff':'#ffb54b';ctx.shadowBlur=18;
      ctx.strokeStyle=ctx.shadowColor;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x+p.w/2,p.y+p.h/2,s*.42,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='rgba(4,10,20,.72)';ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='700 9px Segoe UI,Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(def.label.slice(0,3),p.x+p.w/2,p.y+p.h/2);
      ctx.restore();
    }
  }

  drawEffects(now){
    const ctx=this.ctx,p=this.player,cx=p.x+p.w/2;
    if(now<this.effects.beamUntil){
      const top=this.getBeamTop(cx),h=Math.max(10,p.y-top);
      SF.Assets.drawContain(ctx,'vfx_beam',cx-34,top,68,h,{alpha:.88,glow:'rgba(89,197,255,.75)',glowBlur:14});
    }
    if(now<this.effects.shieldUntil){
      const s=Math.max(p.w,p.h)*1.72;
      SF.Assets.drawContain(ctx,'vfx_shield',cx-s/2,p.y+p.h/2-s/2,s,s,{alpha:.74,rotation:now*.00025});
    }
    if(now<this.effects.empUntil){
      const left=this.effects.empUntil-now;
      const k=1-left/650,s=Math.max(this.w,this.h)*(.35+k*.72);
      SF.Assets.drawContain(ctx,'vfx_emp',cx-s/2,p.y+p.h/2-s/2,s,s,{alpha:Math.max(0,left/650)*.74,rotation:k*.5});
    }
    if(now<this.effects.chainUntil&&this.chainPoints.length>1){
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#7bcfff';ctx.lineWidth=3;ctx.shadowColor='#62a8ff';ctx.shadowBlur=14;
      ctx.beginPath();ctx.moveTo(this.chainPoints[0].x,this.chainPoints[0].y);
      for(let i=1;i<this.chainPoints.length;i++){
        const a=this.chainPoints[i-1],b=this.chainPoints[i];
        const mx=(a.x+b.x)/2+(Math.random()-.5)*18,my=(a.y+b.y)/2+(Math.random()-.5)*10;
        ctx.lineTo(mx,my);ctx.lineTo(b.x,b.y);
      }
      ctx.stroke();ctx.restore();
    }
    if(now<this.effects.missileFlashUntil){
      SF.Assets.drawContain(ctx,'vfx_missiles',p.x-28,p.y-58,p.w+56,p.h+72,{alpha:.34});
    }
  }

  drawParticles(){
    const ctx=this.ctx;ctx.save();ctx.globalCompositeOperation='lighter';
    for(const p of this.particles){
      ctx.globalAlpha=Math.max(0,p.life/700);ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=7;
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
    this.ui.updateHud(
      `${this.playerName} · ${this.ship.name}`,
      `${this.background.label} · N${this.wave}${active.length?' · '+active.join(' · '):''}`,
      `${Math.floor(this.score)} · ${this.lives}▲`
    );
  }
};
