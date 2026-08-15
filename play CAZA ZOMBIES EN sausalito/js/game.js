/* game.js v2.5.3 — Motor mejorado: responsive, combos, partículas, logros y gaveta móvil */
'use strict';

class Game {
  constructor() {
    this.ROWS=5; this.COLS=9;
    this.CELL_W=88; this.CELL_H=78;

    this.running=false; this.paused=false; this.gameOver=false;
    this.playerName='Jugador'; this.currentLevel=0;
    this.score=0; this.suns=50; this.helperStars=0;
    this.waveIndex=0; this.waveActive=false;
    this._zombieAtBoard=false;
    this.prepTimer=0; this._prepTotal=30000;
    this.lastTs=0; this.raf=null;
    this._boardScale=1;

    this.board=Array.from({length:5},()=>Array(9).fill(null));
    this._plants=[]; this._zombies=[]; this._projectiles=[];
    this._sunOrbs=[]; this._specials=[];
    this._zombieSpawnQueue=[]; this._waveSpawnTimer=0;
    this._id=1;

    this.tostadoras=[true,true,true,true,true];
    this.tostadorasUsedCount=0;
    this.defenders=Array.from({length:this.ROWS},()=>({hp:120,maxHp:120,spent:false}));
    this.selectedPlant=null;
    this.selectedHelper=null;
    this.helperCooldowns=Object.fromEntries(Object.keys(HELPERS).map(k=>[k,0]));

    this._skyTimer=7500;

    // ── Prize system ─────────────────────────────────
    this._prizes=[];             // active prizes on tray
    this._prizeTimer=0;
    this._selectedPrize=null;
    this._scoreLastPrize=0;
    this._sunsLastPrize=0;
    this._killsLastPrize=0;

    // Stats per run
    this.zombiesKilledRun=0;
    this.sunsCollectedRun=0;
    this.maxCombo=0;

    // Combo system
    this._comboCount=0;
    this._comboTimer=0;
    this.COMBO_WINDOW=3500;
    this._lastHelperHintAt=0;

    // DOM
    this.boardEl=document.getElementById('game-board');
    this.hudSunsEl=document.getElementById('hud-suns');
    this.hudStarsEl=document.getElementById('hud-stars');
    this.hudScoreEl=document.getElementById('hud-score');
    this.hudWaveEl=document.getElementById('hud-wave');
    this.prepOverEl=document.getElementById('prep-overlay');
    this.prepCntEl=document.getElementById('prep-countdown');
    this.prepRingEl=document.getElementById('prep-ring-fill');
    this.comboHudEl=document.getElementById('combo-hud');
    this.comboTxtEl=document.getElementById('hud-combo-txt');
  }

  // ══════════════════════════════════════════════
  // RESPONSIVE: calcular escala del tablero
  // ══════════════════════════════════════════════
  _computeScale() {
    const wrap = document.getElementById('game-board-wrap');
    if (!wrap) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const compact = window.innerWidth <= 1024 || (coarse && Math.max(window.innerWidth, window.innerHeight) <= 1180);
    const isLandscape = window.innerWidth > window.innerHeight;
    const shortSide = Math.min(window.innerWidth, window.innerHeight);

    document.body.classList.toggle('compact-seed-ui', compact);
    if (!compact) document.body.classList.remove('seed-drawer-open');

    const root=document.documentElement;
    if (compact) {
      if (isLandscape) {
        const ultra = shortSide <= 430;
        const phone = shortSide <= 520;
        root.style.setProperty('--hud-h', ultra ? '30px' : (phone ? '32px' : '36px'));
        root.style.setProperty('--seed-h', '0px');
        root.style.setProperty('--tray-w', ultra ? '20px' : (phone ? '22px' : '24px'));
        root.style.setProperty('--game-top-gap', ultra ? '4px' : (phone ? '5px' : '6px'));
        root.style.setProperty('--hud-top-gap', `max(${ultra ? '14px' : (phone ? '16px' : '18px')}, env(safe-area-inset-top, 0px))`);
      } else {
        root.style.setProperty('--hud-h', shortSide <= 430 ? '42px' : '46px');
        root.style.setProperty('--seed-h', '0px');
        root.style.setProperty('--tray-w', shortSide <= 430 ? '28px' : '30px');
        root.style.setProperty('--game-top-gap', shortSide <= 430 ? '12px' : '10px');
        root.style.setProperty('--hud-top-gap', `max(${shortSide <= 430 ? '16px' : '14px'}, env(safe-area-inset-top, 0px))`);
      }
    } else if (window.innerWidth <= 1400) {
      root.style.setProperty('--hud-h', '56px');
      root.style.setProperty('--seed-h', '70px');
      root.style.setProperty('--tray-w', '38px');
      root.style.setProperty('--game-top-gap', '4px');
    } else {
      root.style.setProperty('--hud-h', '68px');
      root.style.setProperty('--seed-h', '76px');
      root.style.setProperty('--tray-w', '44px');
      root.style.setProperty('--game-top-gap', '2px');
    }

    const wW = Math.max(40, wrap.clientWidth - 2);
    const wH = Math.max(40, wrap.clientHeight - 2);
    const bW = this.COLS * this.CELL_W;
    const bH = this.ROWS * this.CELL_H;
    const sx = wW / bW;
    const sy = wH / bH;

    let extra = 1;
    let maxScale = 1;
    const desktopWide = !compact && window.innerWidth >= 900;
    if (compact) {
      // Autofit puro: el tablero llena el espacio disponible con un margen del 4%
      // para que ninguna fila ni columna quede cortada, en cualquier dispositivo.
      const FIT_MARGIN = 0.96; // 4% de margen perimetral
      document.documentElement.style.setProperty('--board-scale-y', '1');
      this._boardScale = Math.min(sx, sy) * FIT_MARGIN;
    } else {
      maxScale = window.innerWidth >= 1800 ? 2.3 : (window.innerWidth >= 1600 ? 2.1 : (window.innerWidth >= 1360 ? 1.98 : (window.innerWidth >= 1180 ? 1.84 : 1.68)));
      const widthScale = Math.min(maxScale, sx * 0.99);
      let scaleY = 1;
      const projectedH = bH * widthScale;
      if (projectedH > wH) {
        scaleY = Math.max(0.78, Math.min(1, wH / projectedH));
      }
      document.documentElement.style.setProperty('--board-scale-y', scaleY.toFixed(3));
      this._boardScale = widthScale;
    }
    document.documentElement.style.setProperty('--board-scale', this._boardScale);

    const renderedY = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-scale-y')) || 1;
    const renderedH = Math.round(bH * this._boardScale * renderedY);
    const renderedW = Math.round(bW * this._boardScale);
    const tost = document.getElementById('tostadoras-col');
    if (tost) {
      if (desktopWide) {
        tost.style.alignSelf = 'stretch';
        tost.style.height = `${Math.max(0, renderedH)}px`;
      } else {
        tost.style.height = '';
        tost.style.alignSelf = '';
      }
    }
    if (this.boardEl) {
      this.boardEl.style.width = `${bW}px`;
      this.boardEl.style.height = `${bH}px`;
    }
    wrap.style.justifyContent = desktopWide ? 'flex-start' : '';
    wrap.style.paddingLeft = desktopWide ? '4px' : '';
    wrap.style.alignItems = desktopWide ? 'stretch' : '';
    wrap.style.paddingTop = desktopWide ? '4px' : '';
    wrap.style.paddingBottom = desktopWide ? '6px' : '';
    wrap.style.overflow = desktopWide ? 'visible' : '';
  }

  _applyWorldTheme(levelData) {
    const world = levelData?.worldClass || 'jardin';
    const gameScreen = document.getElementById('screen-game');
    if (gameScreen) gameScreen.dataset.world = world;
    if (this.boardEl) this.boardEl.dataset.world = world;
    document.body.dataset.world = world;
  }

  // ══════════════════════════════════════════════
  // INICIAR NIVEL
  // ══════════════════════════════════════════════
  startLevel(levelIndex, savedState) {
    this.currentLevel = levelIndex;
    const lv = LEVELS[levelIndex];
    if (!lv) return;

    this._reset();
    STORAGE.addStat('gamesPlayed');

    this._buildBoard();
    this._applyWorldTheme(lv);
    this._buildTostadoras();
    this._buildSeedBank(lv.allowedPlants);
    this._buildHelperButtons();

    if (savedState) {
      this._restoreState(savedState);
    } else {
      this.suns=lv.startSuns+(window._carrySuns||0); this.score=0; this.helperStars=(window._carryStars||0);
      this.waveIndex=0;
      this.prepTimer=lv.prepTime*1000;
      this._prepTotal=lv.prepTime*1000;
    }
    this._updateHUD();
    this._updateDefenderHUD();
    this._updatePrepRing(this._prepTotal ? this.prepTimer/this._prepTotal : 0);
    if (this.prepOverEl) {
      if (this.prepTimer>0) this.prepOverEl.classList.remove('hidden');
      else this.prepOverEl.classList.add('hidden');
    }
    if (!savedState && this.helperStars>0) {
      setTimeout(()=>{
        this._showToast(`⭐ Conservaste ${this.helperStars} estrellas del nivel anterior.`, 'success', 2300);
        this._maybePromptHelpers();
      }, 500);
    }
    if (savedState && this.prepTimer<=0 && !this.waveActive && this._zombies.length===0 && this._zombieSpawnQueue.length===0) {
      setTimeout(()=>{ if(!this.gameOver) this._startWave(); }, 300);
    }

    AUDIO.music(lv.music||'eerie');

    this.running=true; this.paused=false; this.gameOver=false;
    if (this.currentLevel===2) setTimeout(()=>this._showToast('🫛 Premio del mundo 2: la Alberja ahora dispara doble.', 'success', 2600), 1200);
    if (this.currentLevel===3) setTimeout(()=>this._showToast('🫛 Premio del mundo 3: la Alberja ahora dispara triple.', 'success', 2600), 1200);
    this.lastTs=performance.now();
    this.raf=requestAnimationFrame(ts=>this._loop(ts));

    // Resize listener
    window._gameResizeHandler = () => this._computeScale();
    window.addEventListener('resize', window._gameResizeHandler);
    setTimeout(()=>this._computeScale(), 100);
  }

  _loop(ts) {
    if (!this.running) return;
    const dt=Math.min(ts-this.lastTs,60);
    this.lastTs=ts;
    if (!this.paused && !this.gameOver) this._update(dt);
    this.raf=requestAnimationFrame(t=>this._loop(t));
  }

  _update(dt) {
    this._updatePrep(dt);
    this._updateSkyDrops(dt);
    this._updateSunOrbs(dt);
    this._updateZombieSpawn(dt);
    this._updatePlants(dt);
    this._updateProjectiles(dt);
    this._updateZombies(dt);
    this._updateSpecials(dt);
    this._updateHelperCooldowns(dt);
    this._updateComboTimer(dt);
    this._updatePrizeSystem(dt);
    this._checkWaveEnd();
    this._ensureWaveFlow(dt);
    this._updateHUD();
  }

  _ensureWaveFlow(dt) {
    const lv = LEVELS[this.currentLevel];
    if (!lv || this.gameOver) return;

    const alive = this._zombies.filter(z=>!z.dead).length;
    if (this.prepTimer <= 0 && !this.waveActive && alive === 0 && this._zombieSpawnQueue.length === 0 && this.waveIndex < lv.waves.length) {
      this._waveRecoveryTimer = (this._waveRecoveryTimer || 0) + dt;
      if (this._waveRecoveryTimer > 1800) {
        this._waveRecoveryTimer = 0;
        this._startWave();
      }
    } else {
      this._waveRecoveryTimer = 0;
    }

    const longestAlive = this._zombies.reduce((m,z)=> !z.dead ? Math.max(m,(z.lifeMs||0)) : m, 0);
    if (this.waveActive && this._zombieSpawnQueue.length===0 && alive>0 && this.waveIndex < lv.waves.length-1) {
      this._wavePressureTimer = (this._wavePressureTimer||0) + dt;
      if ((alive <= 2 && longestAlive > 12000) || this._wavePressureTimer > 9000) {
        this.waveActive = false;
        this._zombieAtBoard = false;
        this.waveIndex++;
        this._wavePressureTimer = 0;
        setTimeout(()=>{ if(!this.gameOver) this._startWave(); }, 1200);
      }
    } else {
      this._wavePressureTimer = 0;
    }

    if (this.waveActive && alive === 0 && this._zombieSpawnQueue.length > 0) {
      this._waveStallTimer = (this._waveStallTimer || 0) + dt;
      if (this._waveStallTimer > 2600) {
        const overdue = this._zombieSpawnQueue.filter(q => this._waveSpawnTimer >= q.at - 180);
        overdue.forEach(q => this._spawnZombie(q));
        this._zombieSpawnQueue = this._zombieSpawnQueue.filter(q => !overdue.includes(q));
        this._zombieAtBoard = this._zombieAtBoard || overdue.length > 0;
        this._waveStallTimer = 0;
      }
    } else {
      this._waveStallTimer = 0;
    }
  }

  // ── Preparación ─────────────────────────────
  _updatePrep(dt) {
    if (this.prepTimer<=0||this.waveActive) return;
    this.prepTimer-=dt;
    const sec=Math.ceil(this.prepTimer/1000);
    if (this.prepCntEl) this.prepCntEl.textContent=sec;
    const pct=Math.max(0,this.prepTimer/this._prepTotal);
    this._updatePrepRing(pct);
    if (this.prepTimer<=0) {
      if (this.prepOverEl) this.prepOverEl.classList.add('hidden');
      this._startWave();
    }
  }

  _updatePrepRing(pct) {
    if (!this.prepRingEl) return;
    const circumference=339.3;
    this.prepRingEl.style.strokeDashoffset = circumference*(1-pct);
  }

  // ── Soles ────────────────────────────────────
  _updateSkyDrops(dt) {
    this._skyTimer-=dt;
    if (this._skyTimer<=0) {
      this._skyTimer=6923+Math.random()*3846;
      this._dropSkySun();
    }
  }

  _dropSkySun() {
    const x=20+Math.random()*(this.COLS*this.CELL_W-40);
    const ty=20+Math.random()*(this.ROWS*this.CELL_H-40);
    this._createSunOrb(x,-20,x,ty,25);
  }

  _createPickup(kind,x,y,tx,ty,amount) {
    const id=this._id++;
    const emoji = kind==='star' ? '⭐' : '☀️';
    const cls = kind==='star' ? 'star-orb' : 'sun-orb';
    const el=document.createElement('div');
    el.className=cls; el.textContent=emoji;
    el.style.left=x+'px'; el.style.top=y+'px';
    el.addEventListener('click', ev=>{ev.stopPropagation();this._collectPickup(id);});
    el.addEventListener('touchend', ev=>{ev.preventDefault();ev.stopPropagation();this._collectPickup(id);},{passive:false});
    this.boardEl.appendChild(el);
    const orb={id,kind,el,x,y,tx,ty,amount,falling:true,lifetime:12000,collected:false};
    this._sunOrbs.push(orb);
    AUDIO.play(kind==='star'?'star':'sun');
    return orb;
  }

  _createSunOrb(x,y,tx,ty,amount) { return this._createPickup('sun',x,y,tx,ty,amount); }
  _createStarOrb(x,y,tx,ty,amount) { return this._createPickup('star',x,y,tx,ty,amount); }

  _updateSunOrbs(dt) {
    this._sunOrbs=this._sunOrbs.filter(orb=>{
      if (orb.collected){orb.el&&orb.el.remove();return false;}
      if (orb.falling){
        const dist=Math.hypot(orb.tx-orb.x,orb.ty-orb.y);
        if (dist<6){orb.falling=false;}
        else{
          const spd=2.8*(dt/16);
          orb.x+=(orb.tx-orb.x)/dist*spd;
          orb.y+=(orb.ty-orb.y)/dist*spd;
        }
      }
      orb.lifetime-=dt;
      if (orb.lifetime<=0){orb.el&&orb.el.remove();return false;}
      if (orb.el){
        orb.el.style.left=orb.x+'px'; orb.el.style.top=orb.y+'px';
        if (orb.lifetime<3000) orb.el.style.opacity=orb.lifetime/3000;
      }
      return true;
    });
  }

  _collectPickup(id) {
    const orb=this._sunOrbs.find(o=>o.id===id);
    if (!orb||orb.collected) return;
    orb.collected=true;
    if (orb.kind==='star') {
      this.helperStars += orb.amount;
      // Cada estrella acumulada vale +1 punto (bonus progresivo)
      const bonusPoints = this.helperStars;
      this.score += bonusPoints;
      // Popup visual del bonus
      if (this.hudStarsEl && bonusPoints > 0) {
        const pop = document.createElement('span');
        pop.className = 'star-bonus-pop';
        pop.textContent = `+${bonusPoints}🏆`;
        this.hudStarsEl.parentElement.appendChild(pop);
        setTimeout(() => pop.remove(), 950);
      }
      AUDIO.play('star');
      this._maybePromptHelpers();
    } else {
      this.suns += orb.amount;
      this.sunsCollectedRun += orb.amount;
      AUDIO.play('sun');
      if (this.sunsCollectedRun>=100) this._earnLogro('coleccionista');
      STORAGE.addStat('sunsCollected', orb.amount);
    }
    if (orb.el){
      const orbRect = orb.el.getBoundingClientRect();
      const hudEl = orb.kind==='star' ? this.hudStarsEl : this.hudSunsEl;
      const hudRect = hudEl ? hudEl.getBoundingClientRect() : null;
      if (hudRect && orbRect.width > 0) {
        const clone = orb.el.cloneNode(true);
        clone.style.cssText = `position:fixed;left:${orbRect.left}px;top:${orbRect.top}px;z-index:9999;pointer-events:none;transition:none;font-size:22px;`;
        document.body.appendChild(clone);
        void clone.offsetWidth;
        const tx = hudRect.left + hudRect.width/2 - 10;
        const ty = hudRect.top  + hudRect.height/2 - 10;
        clone.style.transition = 'left .38s cubic-bezier(.4,0,.2,1), top .38s cubic-bezier(.4,0,.2,1), transform .38s ease-in, opacity .2s ease .22s';
        clone.style.left = tx+'px';
        clone.style.top  = ty+'px';
        clone.style.transform = 'scale(0.3)';
        clone.style.opacity = '0';
        setTimeout(() => clone.remove(), 450);
        // Bounce del HUD al recibir
        if (hudEl) {
          hudEl.classList.add('hud-bounce');
          setTimeout(() => hudEl.classList.remove('hud-bounce'), 380);
        }
      }
      orb.el.remove();
    }
    this._updateHUD();
    this._updateSeedBankAffordability();
  }

  _dropStarLoot(z) {
    const amount = Math.max(2, Math.round((z.data.points||10)/8));
    const tx = Math.min(this.COLS*this.CELL_W-24, Math.max(20, z.x));
    const ty = Math.min(this.ROWS*this.CELL_H-20, z.row*this.CELL_H + 26);
    this._createStarOrb(tx, ty-18, tx, ty, amount);
  }

  // ── Sistema de Combo ─────────────────────────
  _addCombo() {
    this._comboCount++;
    this._comboTimer=this.COMBO_WINDOW;
    if (this._comboCount>this.maxCombo) this.maxCombo=this._comboCount;

    // Bonus de puntos
    if (this._comboCount>=2) {
      const bonus=this._comboCount*5;
      this.score+=bonus;
      this._showComboPopup(`⚡ COMBO ×${this._comboCount} +${bonus}`);
      if (this._comboCount===2) AUDIO.play('combo2');
      else if (this._comboCount===3) AUDIO.play('combo3');
      else if (this._comboCount>=5) { AUDIO.play('combo5'); this._earnLogro('combo_5'); }
    }
    if (this.comboHudEl) this.comboHudEl.classList.remove('hidden');
    if (this.comboTxtEl) this.comboTxtEl.textContent=`×${this._comboCount}`;
  }

  _updateComboTimer(dt) {
    if (this._comboCount===0) return;
    this._comboTimer-=dt;
    if (this._comboTimer<=0) {
      this._comboCount=0;
      if (this.comboHudEl) this.comboHudEl.classList.add('hidden');
    }
  }

  _showComboPopup(msg) {
    const el=document.getElementById('combo-pop');
    if (!el) return;
    el.textContent=msg;
    el.classList.remove('hidden');
    void el.offsetWidth;
    el.style.animation='none';
    void el.offsetWidth;
    el.style.animation='';
    el.classList.remove('hidden');
    clearTimeout(this._comboPopTimer);
    this._comboPopTimer=setTimeout(()=>el.classList.add('hidden'),750);
  }

  // ── Oleadas ──────────────────────────────────
  _startWave() {
    const lv=LEVELS[this.currentLevel];
    if (this.waveIndex>=lv.waves.length){this._allWavesCleared();return;}
    this.waveActive=true;
    const wave=lv.waves[this.waveIndex];
    const isFinal=!!wave.isFinal;
    this._showWaveBanner(this.waveIndex+1,lv.waves.length,isFinal,wave.title||'');
    AUDIO.play('wave');
    if (isFinal) setTimeout(()=>AUDIO.play('boss'),800);
    wave.enemies.forEach(def=>this._zombieSpawnQueue.push({...def, type:def.type,row:def.row,at:def.delay}));
    this._waveSpawnTimer=0;
    this._zombieAtBoard=false;
    this._waveRecoveryTimer=0;
    this._waveStallTimer=0;
  }

  _updateZombieSpawn(dt) {
    if (!this.waveActive) return;
    this._waveSpawnTimer+=dt;
    for (let i=this._zombieSpawnQueue.length-1;i>=0;i--) {
      const q=this._zombieSpawnQueue[i];
      if (this._waveSpawnTimer>=q.at){
        this._spawnZombie(q);
        this._zombieSpawnQueue.splice(i,1);
        this._zombieAtBoard=true;
      }
    }
  }

  _checkWaveEnd() {
    if (!this.waveActive) return;
    if (this._zombieSpawnQueue.length>0) return;
    const alive=this._zombies.filter(z=>!z.dead).length;
    if (alive===0&&this._zombieAtBoard) {
      this.waveActive=false; this._zombieAtBoard=false;
      const lv=LEVELS[this.currentLevel];
      const wave=lv.waves[this.waveIndex];
      const isLast=this.waveIndex>=lv.waves.length-1;
      if (isLast){
        setTimeout(()=>this._victory(),2000);
      } else {
        const sunReward = wave.sunReward || 50;
        const starReward = wave.starReward || 10;
        this._showToast(`✅ ¡Oleada superada! +${sunReward}☀️ y +${starReward}⭐`, 'success');
        this.suns += sunReward;
        const starDrops = Math.max(3, Math.min(5, Math.round(starReward / 5)));
        const perDrop = Math.max(6, Math.round(starReward / starDrops));
        for(let i=0;i<starDrops;i++){ this._createStarOrb(60+i*28,18+i*6,130+i*24,70+i*4,perDrop); }
        this._updateHUD();
        this.waveIndex++;
        setTimeout(()=>{if(!this.gameOver)this._startWave();},wave.nextDelay||8000);
      }
    }
  }

  _allWavesCleared(){this._victory();}

  // ── Spawn zombie ─────────────────────────────
  _spawnZombie(typeOrDef,rowMaybe) {
    const def = typeof typeOrDef === 'object' && typeOrDef ? typeOrDef : { type:typeOrDef, row:rowMaybe };
    const typeId = def.type;
    const data=ZOMBIES[typeId]; if (!data) return;
    let row = def.row;
    if (row === undefined || row === null || row === 'random') row = Math.floor(Math.random()*this.ROWS);
    // Ground-burst: emerge en el campo (no desde el borde derecho)
    const isGroundBurst = !!data.groundBurst;
    const startX = isGroundBurst
      ? (3 + Math.floor(Math.random()*4)) * this.CELL_W   // columnas 3-6 (mitad del tablero)
      : this.COLS*this.CELL_W+80+Math.random()*40;
    const id=this._id++;
    const el=document.createElement('div');
    const variant = 1 + Math.floor(Math.random()*3);
    el.className=`zombie zombie-${typeId}${data.boss?' zombie-boss':''} zombie-family-${data.family||'zombie'} zombie-variant-${variant}`;
    if (data.boardEmojiHTML) el.innerHTML = data.boardEmojiHTML; else el.textContent=data.emoji;
    if (data.glow) el.style.filter=`drop-shadow(0 0 6px ${data.glow}) drop-shadow(0 0 16px ${data.glow})`;
    if (variant===2) el.style.opacity='0.94';
    if (variant===3) el.style.filter = `${el.style.filter||''} hue-rotate(${(data.family==='dark'?18:data.family==='specter'?120: data.family==='beast'?-20:6)}deg) brightness(1.08)`;

    el.style.left=(startX-25)+'px';
    el.style.top=(row*this.CELL_H+8)+'px';
    if (data.flies) el.classList.add('zombie-flies');
    this.boardEl.appendChild(el);
    // Ground-burst VFX
    if (isGroundBurst) {
      el.classList.add('zombie-ground-burst');
      for (let d=0;d<5;d++){
        const dirt=document.createElement('div');
        dirt.className='ground-burst-dirt';
        dirt.textContent=['🟫','💨','🌿','🪨'][Math.floor(Math.random()*4)];
        dirt.style.left=(startX-25+Math.random()*40-20)+'px';
        dirt.style.top=(row*this.CELL_H+20)+'px';
        dirt.style.setProperty('--dx',(Math.random()*60-30)+'px');
        dirt.style.setProperty('--dy',(-20-Math.random()*30)+'px');
        this.boardEl.appendChild(dirt);
        setTimeout(()=>dirt.remove(),560);
      }
    }
    const scaledData = {
      ...data,
      hp: Math.max(1, Math.round((data.hp||100) * (def.hpMult || 1))),
      damage: Math.max(1, Math.round((data.damage||1) * (def.damageMult || 1))),
      speed: Math.max(12, Math.round((data.speed||24) * (def.speedMult || 1))),
      points: Math.max(1, Math.round((data.points||10) * (def.pointsMult || 1))),
    };
    const z={id,typeId,data:scaledData,row,x:startX,hp:scaledData.hp,maxHp:scaledData.hp,
      speed:scaledData.speed,currentSpeed:scaledData.speed,el,dead:false,
      state:'walking',eatTarget:null,eatTimer:0, attackMode:null,
      slowTimer:0,hasJumped:false,minionSpawned:false,
      flies:!!data.flies,popBalloon:false,hypnotized:false,silenceTimer:0,
    };
    this._zombies.push(z);
    AUDIO.play('zombieGrunt');
    // ── Entrada dramática del jefe ──
    if (data.boss) {
      el.classList.add('zombie-boss-entrance');
      setTimeout(() => el.classList.remove('zombie-boss-entrance'), 800);
      AUDIO.play('boss');
      this._showToast(`👑 ¡${scaledData.name || 'JEFE'} ha llegado!`, 'danger', 2600);
    }
    return z;
  }

  // ── Actualizar zombies ───────────────────────

_updateZombies(dt) {
  const dtS=dt/1000;
  this._zombies=this._zombies.filter(z=>{
    if (z.dead){ z.el&&z.el.remove(); return false; }

    if (z.hypnotized){
      z.x+=z.currentSpeed*dtS;
      if (z.el) z.el.style.left=(z.x-25)+'px';
      if (z.x>this.COLS*this.CELL_W+200){ z.dead=true; z.el&&z.el.remove(); return false; }
      return true;
    }

    z.lifeMs = (z.lifeMs||0) + dt;

    if (z.slowTimer>0){
      z.slowTimer-=dt;
      z.currentSpeed=z.slowTimer>0?z.speed*.35:z.speed;
      z.el&&z.el.classList.toggle('zombie-slowed',z.slowTimer>0);
    }

    // ── COMPORTAMIENTO DE JEFES MALEVOLENTES ────────────────────────
    if (z.data && z.data.boss && !z.hypnotized && !z.dead) {
      z.bossTimer = (z.bossTimer || 0) + dt;

      // FASE DE FURIA: HP baja del 60%
      if (!z.rageActivated && z.hp < z.maxHp * 0.60) {
        z.rageActivated = true;
        z.speed = Math.round(z.speed * 1.38);
        if (z.slowTimer <= 0) z.currentSpeed = z.speed;
        z.data = { ...z.data, damage: Math.ceil((z.data.damage || 2) * 1.35) };
        if (z.el) {
          z.el.classList.add('zombie-rage');
          z.el.querySelector('.mob-core') && (z.el.querySelector('.mob-core').textContent = '💀');
        }
        this._showToast('💢 ¡JEFE EN FURIA! Más veloz y más letal', 'danger', 2400);
        AUDIO.play('bossRage');
      }

      // INVOCACIÓN DE MINIONS: cada 8s (cada 6s en furia)
      const summonInterval = z.rageActivated ? 6000 : 8000;
      if (z.bossTimer - (z.lastSummon || 0) > summonInterval) {
        z.lastSummon = z.bossTimer;
        const minionType = z.rageActivated ? 'casco' : 'basico';
        const extraType = (z.data.multiSummon && z.rageActivated) ? 'corredor' : null;
        [z.row - 1, z.row + 1].filter(r => r >= 0 && r < this.ROWS).forEach(r => {
          setTimeout(() => { if (!this.gameOver) this._spawnZombie(minionType, r); }, 220);
          if (extraType) setTimeout(() => { if (!this.gameOver) this._spawnZombie(extraType, r); }, 900);
        });
        if (z.el) {
          z.el.classList.add('zombie-summon-pulse');
          setTimeout(() => z.el && z.el.classList.remove('zombie-summon-pulse'), 800);
        }
      }

      // RUGIDO ZOMBIE: cada 13s — daña todas las plantas del carril
      if (z.bossTimer - (z.lastRoar || 0) > 13000) {
        z.lastRoar = z.bossTimer;
        let hit = false;
        for (let c = 0; c < this.COLS; c++) {
          const target = this.board[z.row] && this.board[z.row][c];
          if (target && !target.dead) {
            this._damagePlant(target, Math.max(18, (z.data.damage || 2) * 14));
            hit = true;
          }
        }
        if (hit) this._showToast('🧟 ¡RUGIDO ZOMBIE! Las plantas del carril tambalean', 'warn', 1800);
        AUDIO.play('bossRoar');
      }

      // ESCUDO MALIGNO: HP < 35%, activo 3s cada 18s
      if (z.hp < z.maxHp * 0.35) {
        if (z.bossTimer - (z.lastShield || 0) > 18000) {
          z.lastShield = z.bossTimer;
          z.shieldActive = true;
          z.shieldTimer = 3000;
          if (z.el) z.el.classList.add('zombie-shield');
          this._showToast('🛡️ ¡ESCUDO MALIGNO activado!', 'warn', 1600);
        }
      }
      if (z.shieldActive) {
        z.shieldTimer = (z.shieldTimer || 0) - dt;
        if (z.shieldTimer <= 0) {
          z.shieldActive = false;
          if (z.el) z.el.classList.remove('zombie-shield');
        }
      }

      // REGENERACIÓN DE HP (nivel ≥ 15)
      if (z.data.regen && z.hp > 0 && z.hp < z.maxHp) {
        z.hp = Math.min(z.maxHp, z.hp + (z.data.regenRate || 3) * dt / 1000);
        if (z.el) {
          let bar = z.el.querySelector('.z-hp-fill');
          if (bar) bar.style.width = Math.max(0, z.hp / z.maxHp * 100) + '%';
        }
      }

      // DISPARO DE VUELTA (nivel ≥ 20): proyectil corrosivo hacia plantas
      if (z.data.shootsBack) {
        z.shootTimer = (z.shootTimer || 0) + dt;
        if (z.shootTimer > 5500) {
          z.shootTimer = 0;
          // Daña la planta más cercana en la misma fila a la derecha del jefe
          const col = Math.floor(z.x / this.CELL_W);
          for (let c = Math.max(0, col); c < this.COLS; c++) {
            const target = this.board[z.row] && this.board[z.row][c];
            if (target && !target.dead) {
              this._damagePlant(target, Math.max(25, (z.data.damage || 2) * 18));
              this._spawnParticles(target.x || c * this.CELL_W, z.row * this.CELL_H + this.CELL_H / 2, '☣️', 3);
              AUDIO.play('rocket');
              break;
            }
          }
        }
      }
    }
    // ── FIN COMPORTAMIENTO JEFE ──────────────────────────────────────

    // ── CURANDERO: cura zombies cercanos cada ~4s ─────────────────
    if (z.data.healer && !z.hypnotized && !z.dead) {
      z.healTimer = (z.healTimer||0) + dt;
      if (z.healTimer >= (z.data.healInterval||4000)) {
        z.healTimer = 0;
        const rate = z.data.healRate || 15;
        this._zombies.forEach(other => {
          if (!other.dead && !other.hypnotized && other.id !== z.id &&
              Math.abs(other.row - z.row) <= 1 && Math.abs(other.x - z.x) < 90) {
            other.hp = Math.min(other.maxHp, other.hp + Math.round(other.maxHp * rate / 100));
            if (other.el) {
              const bar = other.el.querySelector('.z-hp-fill');
              if (bar) { bar.style.width = Math.max(0, other.hp/other.maxHp*100)+'%'; }
            }
            this._spawnParticlesContextual(other.x, other.row*this.CELL_H+this.CELL_H/2, 'slow', 2);
          }
        });
      }
    }

    // ── EXCAVADOR: se tuneliza en col 5 y reaparece en col 1 ─────
    if (z.data.tunnels && !z.tunneled && !z.tunneling && !z.hypnotized &&
        z.x <= this.CELL_W * 5.5 && z.x > this.CELL_W * 0.5) {
      z.tunneling = true; z.tunneled = true;
      if (z.el) { z.el.classList.add('zombie-tunneling'); }
      this._spawnParticlesContextual(z.x, z.row*this.CELL_H+this.CELL_H/2, 'normal', 4);
      const savedZ = z;
      setTimeout(() => {
        if (!savedZ.dead) {
          savedZ.x = this.CELL_W * 1.2;
          savedZ.tunneling = false;
          if (savedZ.el) {
            savedZ.el.classList.remove('zombie-tunneling');
            savedZ.el.classList.add('zombie-emerge');
            savedZ.el.style.left = (savedZ.x-25)+'px';
            setTimeout(() => savedZ.el && savedZ.el.classList.remove('zombie-emerge'), 500);
          }
          this._spawnParticlesContextual(savedZ.x, savedZ.row*this.CELL_H+this.CELL_H/2, 'explosion', 4);
          this._showToast('⛏️ ¡Zombie excavador emergió tras las líneas!', 'danger', 1800);
        }
      }, 700);
    }
    // No mover el excavador mientras está tunelizando
    if (z.tunneling) return true;

    // ── LANZADOR: ataca plantas a distancia ──────────────────────
    if (z.data.rangedAttack && !z.hypnotized) {
      const range = z.data.attackRange || 4;
      const col = Math.floor(z.x / this.CELL_W);
      let targetPlant = null;
      for (let c = col; c >= Math.max(0, col - range); c--) {
        const p = this.board[z.row] && this.board[z.row][c];
        if (p && !p.dead) { targetPlant = p; break; }
      }
      if (targetPlant && z.x - targetPlant.col * this.CELL_W > this.CELL_W * 1.5) {
        z.rangedTimer = (z.rangedTimer||0) + dt;
        if (z.rangedTimer >= (z.data.rangedInterval||2400)) {
          z.rangedTimer = 0;
          this._damagePlant(targetPlant, Math.max(18, (z.data.damage||1) * 16));
          this._spawnParticlesContextual(targetPlant.col*this.CELL_W + this.CELL_W/2,
            z.row*this.CELL_H+this.CELL_H/2, 'normal', 2);
          if (z.el) {
            z.el.classList.add('zombie-throw');
            setTimeout(() => z.el && z.el.classList.remove('zombie-throw'), 350);
          }
        }
      }
    }

    if (z.state==='attackingDefender'){
      const defender=this.defenders[z.row];
      z.eatTimer+=dt;
      if (!defender || defender.spent){
        z.state='walking';
      } else if (z.eatTimer>=900){
        z.eatTimer=0;
        this._damageDefender(z.row, Math.max(5,(z.data.damage||1)*9));
      }
      return true;
    }

    if (z.state==='eatingSpecial'){
      z.eatTimer+=dt;
      if (!z.eatTarget || z.eatTarget.dead){
        z.state='walking'; z.eatTarget=null; z.chewTime=0;
      } else if (z.eatTimer>=1000){
        z.eatTimer=0;
        this._damageSpecial(z.eatTarget, Math.max(5,(z.data.damage||1)*9));
      }
      return true;
    }

    if (z.state==='eating'){
      z.eatTimer+=dt;
      if (!z.eatTarget || z.eatTarget.dead){
        z.state='walking'; z.eatTarget=null; z.chewTime=0;
        z.el&&z.el.classList.remove('zombie-chewing');
      } else if (z.eatTimer>=820){
        z.eatTimer=0;
        // Animación de masticado rítmico
        if (z.el && !z.el.classList.contains('zombie-chewing')) z.el.classList.add('zombie-chewing');
        const baseBite = Math.max(13,(z.data.damage||1)*20);
        const shieldMult = (z.data.shieldMultiplier&&z.eatTarget.typeId==='muro') ? z.data.shieldMultiplier : 1;
        this._damagePlant(z.eatTarget, baseBite * shieldMult);
        z.chewTime = (z.chewTime||0) + 820;
        if (z.chewTime > 5600 && z.eatTarget && !z.eatTarget.dead) {
          this._damagePlant(z.eatTarget, Math.max(16, baseBite*0.72));
          z.chewTime = 0;
        }
      }
      return true;
    }

    const prevX = z.x;
    z.x-=z.currentSpeed*dtS;
    if (z.el) z.el.style.left=(z.x-25)+'px';
    if (Math.abs((z.lastX ?? prevX) - z.x) < 0.35 && z.state==='walking') { z.stuckTimer=(z.stuckTimer||0)+dt; } else { z.stuckTimer=0; }
    z.lastX = z.x;
    if (z.stuckTimer>1800) { z.x -= 28; z.state='walking'; z.eatTarget=null; z.eatTimer=0; z.stuckTimer=0; z.stuckHits=(z.stuckHits||0)+1; if (z.el) z.el.style.left=(z.x-25)+'px'; }
    if ((z.stuckHits||0) >= 2 && !z.dead) { this._damageZombie(z, Math.max(110, Math.round(z.maxHp * 0.24))); z.stuckHits = 0; }
    if (z.x > this.COLS*this.CELL_W + 160) { z.x = this.COLS*this.CELL_W + 60; if (z.el) z.el.style.left=(z.x-25)+'px'; }

    const defender=this.defenders[z.row];
    if (z.x<=18 && defender && !defender.spent){
      z.x=18;
      if (z.el) z.el.style.left=(z.x-25)+'px';
      z.state='attackingDefender';
      z.eatTimer=0; z.chewTime=0;
      return true;
    }

    if (z.x<-40){ this._damageCasa(); z.dead=true; return false; }

    if (!z.flies||z.popBalloon){
      const helper = this._specials.find(s=>!s.dead && s.row===z.row && Math.abs((s.x+18)-z.x)<28);
      if (helper) { z.state='eatingSpecial'; z.eatTarget=helper; z.eatTimer=0; z.chewTime=0; return true; }
      const col=Math.floor(z.x/this.CELL_W);
      if (col>=0&&col<this.COLS){
        for (let c=col;c>=Math.max(0,col-1);c--){
          const plant=this.board[z.row]&&this.board[z.row][c];
          if (plant&&!plant.dead&&z.x<(c+1)*this.CELL_W+15){
            if (z.data.jumps&&!z.hasJumped&&plant.typeId!=='granmuro'){
              z.hasJumped=true;
              z.x=c*this.CELL_W-30;
              z.el&&z.el.classList.add('zombie-jump');
              setTimeout(()=>z.el&&z.el.classList.remove('zombie-jump'),500);
              break;
            }
            if (plant.typeId==='narcotica'&&!plant.activated){
              plant.activated=true; z.hypnotized=true;
              z.state='walking'; z.el&&z.el.classList.add('zombie-ally');
              this._destroyPlant(plant); AUDIO.play('place'); break;
            }
            z.state='eating'; z.eatTarget=plant; z.eatTimer=0; z.chewTime=0;
            break;
          }
        }
      }
    }

    if (z.data.spawnsMinions&&!z.minionSpawned&&z.x<this.COLS*this.CELL_W-100){
      z.minionSpawned=true;
      [z.row-1,z.row+1].filter(r=>r>=0&&r<this.ROWS).forEach(r=>{
        setTimeout(()=>{ if(!this.gameOver) this._spawnZombie('basico',r); },400);
      });
    }
    return true;
  });
}

// ── Defensores / Tostadora ──────────────────
  _triggerTostadora(row,zombie) {
    this._activateDefender(row, zombie);
  }

  _damageDefender(row,dmg){
    const d=this.defenders[row];
    if(!d || d.spent) return;
    d.hp=Math.max(0,d.hp-dmg);
    this._updateDefenderHUD();
    if(d.hp<=0){
      this._activateDefender(row);
    }
  }

  _activateDefender(row, zombie){
    const d=this.defenders[row];
    if(!d || d.spent){
      this._damageCasa();
      if(zombie) zombie.dead=true;
      return;
    }
    d.hp=0; d.spent=true;
    this.tostadoras[row]=false; this.tostadorasUsedCount++;
    AUDIO.play('tostadora');
    this._showToast(`🍞 ¡Defensor de la fila ${row+1} activado!`,'warn');
    this._zombies.forEach(z=>{
      if (z.row===row && !z.dead){
        z.dead=true;
        this.score+=z.data.points||10;
        if (z.el){ const el=z.el; z.el=null; const fam=z.data.family||"zombie"; el.classList.remove("zombie-family-zombie","zombie-family-beast","zombie-family-dark","zombie-family-specter","zombie-chewing"); void el.offsetWidth; el.classList.add("zombie-die-"+fam); setTimeout(()=>el.remove(), fam==="specter"?750:fam==="dark"?680:fam==="beast"?420:550); }
        this.zombiesKilledRun++;
      }
    });
    const tEl=document.querySelector(`.tostadora[data-row="${row}"]`);
    if (tEl) tEl.classList.add('tostadora-used','tostadora-broken');
    this._updateDefenderHUD();
    if (zombie) zombie.dead=true;
  }

  _damageCasa(){ this._showToast('😱 ¡Un zombie logró pasar!','error'); this._defeat(); }

  // ── Actualizar plantas ───────────────────────
  _updatePlants(dt) {
    this._plants.forEach(plant=>{
      if (plant.dead) return;

      // Sol de margarita
      if (plant.sunTimer!==undefined){
        plant.sunTimer-=dt;
        if (plant.sunTimer<=0){
          plant.sunTimer=PLANTS[plant.typeId].sunRate||7500;
          const cx=plant.col*this.CELL_W+this.CELL_W/2-20;
          const cy=plant.row*this.CELL_H+10;
          this._createSunOrb(cx,cy,cx,cy+40,PLANTS[plant.typeId].sunAmt||25);
        }
      }

      const data=PLANTS[plant.typeId];
      if (data.mine) {
        if (!plant.armed) {
          plant.armTimer = (plant.armTimer||data.armTime||3200) - dt;
          if (plant.armTimer <= 0) { plant.armed = true; if (plant.el) plant.el.classList.add('plant-mine-armed'); }
        }
        if (plant.armed) {
          const trigger = this._zombies.find(z=>!z.dead && !z.hypnotized && z.row===plant.row && Math.abs(z.x - (plant.col*this.CELL_W + this.CELL_W/2)) < 26);
          if (trigger) {
            this._explodePlant(plant, data);
          }
        }
        return;
      }
      if (data.magnetCollect) {
        plant.fireTimer=(plant.fireTimer||0)+dt;
        if (plant.fireTimer >= (data.magnetRate||3200)) {
          plant.fireTimer = 0;
          this._sunOrbs.slice().forEach(orb=>this._collectPickup(orb.id));
          if (this._sunOrbs.length) this._showToast('🧲 El imán recogió soles y estrellas.','success',1400);
        }
        return;
      }
      if (!data.attack||plant.typeId==='bomba'||plant.typeId==='narcotica') return;
      if (plant.typeId==='atrapadora'){this._updateChomper(plant,dt);return;}

      plant.fireTimer=(plant.fireTimer||0)+dt;
      // Animación de carga 220ms antes del disparo
      if (plant.el) {
        const charging = plant.fireTimer >= data.fireRate - 220 && !!this._findTarget(plant);
        plant.el.classList.toggle('plant-charging', charging);
      }
      if (plant.fireTimer<data.fireRate) return;
      const target=this._findTarget(plant);
      if (!target) return;
      plant.fireTimer=0;
      if (plant.el){plant.el.classList.add('plant-shoot');setTimeout(()=>plant.el&&plant.el.classList.remove('plant-shoot'),200);}
      let shots=data.shots||1;
      if (plant.typeId==='lanzadora') shots = this.currentLevel>=3 ? 3 : (this.currentLevel>=2 ? 2 : 1);
      for (let s=0;s<shots;s++){
        setTimeout(()=>{if(!plant.dead)this._fireProjectile(plant,data);},s*110);
      }
    });
  }

  _findTarget(plant) {
    const data=PLANTS[plant.typeId];
    const range=data.range||9;
    return this._zombies.find(z=>
      !z.dead&&z.row===plant.row&&!z.hypnotized&&
      z.x>plant.col*this.CELL_W&&z.x<(plant.col+range+1)*this.CELL_W+60
    );
  }

  _updateChomper(plant,dt) {
    if (plant.eating){
      plant.eatCooldown=(plant.eatCooldown||0)+dt;
      if (plant.eatCooldown>=(PLANTS.atrapadora.eatTime||5000)){
        plant.eating=false;plant.eatCooldown=0;plant.eatTargetId=null;
        plant.el&&plant.el.classList.remove('plant-eating');
      }
      return;
    }
    plant.fireTimer=(plant.fireTimer||0)+dt;
    if (plant.fireTimer<PLANTS.atrapadora.fireRate) return;
    const target=this._findTarget(plant);
    if (!target) return;
    plant.fireTimer=0;plant.eating=true;plant.eatCooldown=0;plant.eatTargetId=target.id;
    plant.el&&plant.el.classList.add('plant-eating');
    this._killZombie(target);
    AUDIO.play('zombieDie');
  }

  // ── Proyectiles ──────────────────────────────
  _spawnProjectile(cfg={}) {
    const id=this._id++;
    const el=document.createElement('div');
    // Clase de estela según tipo de proyectil
    const trailClass = cfg.projType ? `proj-${cfg.projType}` : '';
    el.className=`projectile ${cfg.className||''} ${trailClass}`.trim();
    el.textContent=cfg.emoji||'🟢';
    el.style.left=(cfg.x||0)+'px';
    el.style.top=(cfg.y||0)+'px';
    this.boardEl.appendChild(el);
    const proj={
      id, el,
      row:cfg.row||0, x:cfg.x||0, y:cfg.y||0,
      speed:cfg.speed||360,
      damage:cfg.damage||20,
      slows:!!cfg.slows, slowDur:cfg.slowDur||3000,
      dead:false, aoe:cfg.aoe||0, owner:cfg.owner||'plant',
      explosionEmoji:cfg.explosionEmoji||'💥',
      projType:cfg.projType||'normal',
    };
    this._projectiles.push(proj);
    return proj;
  }

  _fireProjectile(plant,data) {
    const startX=plant.col*this.CELL_W+this.CELL_W;
    const startY=plant.row*this.CELL_H+this.CELL_H/2-8;
    let projType = 'normal';
    if (data.slows && data.burn) projType = 'fire';
    else if (data.slows) projType = 'freeze';
    else if (data.burn) projType = 'fire';
    else if (data.shots && data.shots >= 2) projType = 'double';
    else if (plant.typeId === 'brocoli' || plant.typeId === 'berenjena') projType = 'slow';

    // Aplicar efectos de sinergia
    let extraSlows = data.slows, extraSlowDur = data.slowDur||3000;
    let extraBurn = data.burn, extraDamage = data.damage||20;
    if (plant.synergy === 'superFreeze')  { extraSlows = true; extraSlowDur = Math.round((data.slowDur||3000) * 1.7); extraDamage = Math.round(extraDamage * 1.2); projType = 'freeze'; }
    if (plant.synergy === 'burnDouble')   { extraBurn = true; extraDamage = Math.round(extraDamage * 1.35); projType = 'fire'; }
    if (plant.synergy === 'icePeas')      { extraSlows = true; extraSlowDur = 2800; projType = 'freeze'; }

    this._spawnProjectile({
      row:plant.row, x:startX, y:startY,
      emoji: (plant.synergy==='superFreeze') ? '🧊' : (plant.synergy==='icePeas') ? '🧊' : (plant.synergy==='burnDouble') ? '🔥' : (data.projEmoji||'🟢'),
      speed:data.projSpeed||360,
      damage:extraDamage,
      slows:extraSlows, slowDur:extraSlowDur,
      aoe:data.splash ? 1 : 0,
      explosionEmoji:extraBurn ? '🔥' : '💥',
      owner:'plant',
      projType,
    });
    AUDIO.play(extraSlows?'freeze':(extraBurn?'rocket':(data.shots&&data.shots>1?'shoot2':'shoot')));
  }

  _explodeProjectile(proj) {
    const ex=document.createElement('div');
    ex.className='explosion-vfx';
    ex.textContent=proj.explosionEmoji||'💥';
    ex.style.left=(proj.x-22)+'px';
    ex.style.top=(proj.y-22)+'px';
    this.boardEl.appendChild(ex);
    setTimeout(()=>ex.remove(),650);
    this._zombies.forEach(z=>{
      if (!z.dead && !z.hypnotized && Math.abs(z.row-proj.row)<=proj.aoe && Math.abs(z.x-proj.x)<90) {
        this._damageZombie(z, proj.damage, proj.aoe>0 ? 'explosive' : 'normal');
      }
    });
    AUDIO.play('explode');
  }

  _updateProjectiles(dt) {
    const dtS=dt/1000;
    this._projectiles=this._projectiles.filter(proj=>{
      if (proj.dead){proj.el&&proj.el.remove();return false;}
      proj.x+=proj.speed*dtS;
      if (proj.el) proj.el.style.left=proj.x+'px';
      if (proj.x>this.COLS*this.CELL_W+80){proj.el&&proj.el.remove();return false;}
      const hit=this._zombies.find(z=>!z.dead&&!z.hypnotized&&z.row===proj.row&&Math.abs(z.x-proj.x)<36);
      if (hit){
        if (proj.aoe>0) {
          this._explodeProjectile(proj);
          this._spawnParticlesContextual(proj.x, proj.y, 'explosion', 5);
        } else if (hit.flies&&!hit.popBalloon){
          hit.popBalloon=true;hit.flies=false;
          hit.el&&hit.el.classList.remove('zombie-flies');
          AUDIO.play('hit');
          this._spawnParticlesContextual(proj.x, proj.y, 'normal', 2);
        } else {
          this._damageZombie(hit,proj.damage, 'normal');
          if (proj.slows) hit.slowTimer=proj.slowDur;
          // Partículas según tipo de proyectil
          const particleType = proj.projType || 'normal';
          this._spawnParticlesContextual(proj.x, proj.y, particleType, 3);
        }
        proj.dead=true;proj.el&&proj.el.remove();proj.el=null;return false;
      }
      return true;
    });
  }

  // ── Daño ─────────────────────────────────────
  _damageZombie(z,dmg,kind='normal') {
    if (z.dead) return;
    let finalDmg = dmg;
    if (kind==='explosive' && z.data && z.data.explosiveResist) finalDmg = Math.round(dmg * z.data.explosiveResist);
    if (kind==='boardFire' && z.data && z.data.boss) finalDmg = Math.round(Math.min(z.hp * 0.22, finalDmg * 0.55));
    // Escudo maligno del jefe: absorbe 65% del daño
    if (z.shieldActive && dmg > 0) finalDmg = Math.max(1, Math.round(finalDmg * 0.35));
    z.hp-=finalDmg; AUDIO.play('hit');
    if (z.el){
      z.el.classList.add('zombie-hit');
      setTimeout(()=>z.el&&z.el.classList.remove('zombie-hit'),130);
      let bar=z.el.querySelector('.z-hp-fill');
      if (!bar){
        const w=document.createElement('div');w.className='z-hp-bar';
        bar=document.createElement('div');bar.className='z-hp-fill';
        w.appendChild(bar);z.el.appendChild(w);
      }
      const hpPct = Math.max(0, z.hp/z.maxHp);
      bar.style.width=hpPct*100+'%';
      if (hpPct<.3) bar.style.background='#f44336';
      else if (hpPct<.6) bar.style.background='#ff9800';

      // ── Etapas visuales de daño en jefes ──
      if (z.data.boss) {
        z.el.classList.remove('zombie-boss-stage1','zombie-boss-stage2','zombie-boss-stage3');
        if (hpPct < 0.25) {
          z.el.classList.add('zombie-boss-stage3');
          if (!z._stage3announced) {
            z._stage3announced = true;
            this._showToast('☠️ ¡JEFE AL LÍMITE! Último estadio', 'danger', 2000);
          }
        } else if (hpPct < 0.50) {
          z.el.classList.add('zombie-boss-stage2');
          if (!z._stage2announced) {
            z._stage2announced = true;
            this._showToast('🩸 ¡Jefe debilitado! Segundo estadio', 'warn', 1800);
          }
        } else if (hpPct < 0.75) {
          z.el.classList.add('zombie-boss-stage1');
          if (!z._stage1announced) {
            z._stage1announced = true;
            this._showToast('⚡ ¡Jefe dañado! Primer estadio', 'warn', 1600);
          }
        }
        // Partículas en cada golpe al jefe
        if (finalDmg > 0) {
          this._spawnParticlesContextual(z.x, z.row*this.CELL_H+this.CELL_H/2, kind==='explosive'?'explosion':'normal', 2);
        }
      }
    }
    // ── Escape del Dr. Sombra al 20% HP ──────────────
    if (!z.dead && z.data.escapes && !z.escaping && z.hp > 0 && z.hp <= z.maxHp * 0.20) {
      z.escaping = true;
      z.speed = z.speed * 3.5;
      z.currentSpeed = z.speed;
      if (z.el) {
        z.el.classList.add('zombie-escaping');
        this._showToast(`🧪 ¡${z.data.name || 'Dr. Sombra'} está escapando! 💨`, 'warn', 2200);
      }
      // Cuenta como "escape" — no otorga puntos completos
      setTimeout(() => {
        if (!z.dead && z.escaping) {
          z.dead = true;
          if (z.el) { z.el.remove(); z.el = null; }
          this.score += Math.floor((z.data.points || 500) * 0.15);
          this._showToast('🧪 ¡Escapó! Volverá más fuerte...', 'warn', 2000);
          this._updateHUD();
        }
      }, 1100);
    }
    if (z.hp<=0) this._killZombie(z);
  }

  _killZombie(z) {
    if (z.dead) return;
    z.dead=true;
    const pts=z.data.points||10;
    this.score+=pts;
    this.zombiesKilledRun++;
    this._dropStarLoot(z);
    this._addCombo();
    AUDIO.play('zombieDie');

    const family = z.data.family || 'zombie';
    const cx = z.x;
    const cy = z.row*this.CELL_H + this.CELL_H/2;

    if (z.el) {
      const el = z.el;   // ← guardar referencia local ANTES de nullificar
      z.el = null;

      // Quitar todas las clases de animación de familia para que muerte no compita
      el.classList.remove(
        'zombie-family-zombie','zombie-family-beast',
        'zombie-family-dark','zombie-family-specter','zombie-family-boss',
        'zombie-chewing','zombie-rage','zombie-shield',
        'zombie-boss-stage1','zombie-boss-stage2','zombie-boss-stage3',
        'zombie-boss-entrance'
      );
      // Forzar reflow para que el browser registre la eliminación antes del nuevo keyframe
      void el.offsetWidth;

      if (z.data.boss) {
        el.classList.add('zombie-die-boss');
        if (this.boardEl) {
          this.boardEl.classList.add('board-shake');
          setTimeout(() => this.boardEl&&this.boardEl.classList.remove('board-shake'), 460);
          setTimeout(() => { this.boardEl&&this.boardEl.classList.add('boss-death-flash'); }, 80);
          setTimeout(() => this.boardEl&&this.boardEl.classList.remove('boss-death-flash'), 800);
        }
        this._spawnParticlesContextual(cx, cy, 'boss', 12);
        this._showToast('💀 ¡JEFE ELIMINADO!', 'success', 2200);
        setTimeout(() => el.remove(), 850);   // ← usa 'el', no 'z.el'
      } else {
        el.classList.add(`zombie-die-${family}`);
        const removeDelay = family==='specter' ? 750 : family==='dark' ? 680 : family==='beast' ? 420 : 580;
        setTimeout(() => el.remove(), removeDelay);  // ← usa 'el', no 'z.el'
      }
    }

    // Partículas contextuales por familia
    this._spawnParticlesContextual(cx, cy, family, z.data.boss ? 10 : 4);
    this._updateHUD();
    this._checkHelperUnlock();
    this._checkAchievements();
    STORAGE.addStat('zombiesKilled');
  }


  _explodePlant(plant, data) {
    if (!plant || plant.dead) return;
    const cx = plant.col*this.CELL_W + this.CELL_W/2;
    const cy = plant.row*this.CELL_H + this.CELL_H/2;
    AUDIO.play('bomb');
    this._spawnParticles(cx-10, cy-10, '💥', 8);
    this._zombies.forEach(z=>{
      if (!z.dead && !z.hypnotized) {
        const dx = Math.abs(z.x - cx);
        const dy = Math.abs(z.row - plant.row);
        if (dy <= (data.aoe||1) && dx < this.CELL_W * ((data.aoe||1)+0.8)) {
          this._damageZombie(z, data.damage || 900, 'explosive');
        }
      }
    });
    this._destroyPlant(plant);
  }

  _damagePlant(plant,dmg) {
    if (plant.dead) return;
    plant.hp-=dmg;
    if (plant.el){
      plant.el.classList.add('plant-hit');
      setTimeout(()=>plant.el&&plant.el.classList.remove('plant-hit'),150);
      let fill=plant.el.querySelector('.plant-hp-fill');
      if (!fill){
        const bar=document.createElement('div');bar.className='plant-hp-bar';
        fill=document.createElement('div');fill.className='plant-hp-fill';
        bar.appendChild(fill);plant.el.appendChild(bar);
        plant.el.style.position='relative';
      }
      fill.style.width=Math.max(0,plant.hp/plant.maxHp*100)+'%';
      if (plant.hp/plant.maxHp<.3) fill.style.background='#f44336';
    }
    if (plant.hp<=0) this._destroyPlant(plant);
  }

  _destroyPlant(plant) {
    if (plant.dead) return;
    plant.dead=true;
    if (this.board[plant.row]) this.board[plant.row][plant.col]=null;
    this._plants=this._plants.filter(p=>p.id!==plant.id);
    AUDIO.play('plantDie');
    if (plant.el){plant.el.classList.add('plant-die');const el=plant.el;setTimeout(()=>el.remove(),380);plant.el=null;}
    // Actualizar indicadores de sinergia al quitar planta
    setTimeout(()=>this._updateSynergyHints(), 50);
  }

  _activateBomba(plant) {
    if (!plant || plant.dead) return;
    const data = PLANTS[plant.typeId] || {};
    const pr=plant.row, pc=plant.col;
    const cx=pc*this.CELL_W + this.CELL_W/2;
    const cy=pr*this.CELL_H + this.CELL_H/2;

    if (data.waveBlast) {
      const wave=document.createElement('div');
      wave.className='laser-beam sonic-wave';
      wave.style.left='0px';
      wave.style.right='0px';
      wave.style.top=(pr*this.CELL_H + this.CELL_H/2 - 10)+'px';
      this.boardEl.appendChild(wave);
      this._zombies.forEach(z=>{
        if (!z.dead && !z.hypnotized && z.row===pr) this._damageZombie(z, data.damage || 320, 'explosive');
      });
      AUDIO.play('explode');
      setTimeout(()=>wave.remove(),760);
    } else if (data.boardFire) {
      // Tablero COMPLETO en llamas — cada casilla libre recibe fuego
      const fireGrid=document.createElement('div');
      fireGrid.className='board-fire-full';
      const fireEmojis=['🔥','🔥','🔥','💥','🌋','🔥','🔥'];
      for (let rr=0;rr<this.ROWS;rr++) {
        for (let cc=0;cc<this.COLS;cc++) {
          const fc=document.createElement('div');
          fc.className='board-fire-cell';
          fc.style.animationDelay=(Math.random()*0.3)+'s';
          fc.textContent=fireEmojis[Math.floor(Math.random()*fireEmojis.length)];
          fireGrid.appendChild(fc);
        }
      }
      this.boardEl.appendChild(fireGrid);
      this._zombies.forEach(z=>{
        if (!z.dead && !z.hypnotized) {
          const burnDmg = Math.max(60, Math.round(z.hp * (data.boardFirePct || 0.5)));
          this._damageZombie(z, burnDmg, 'boardFire');
        }
      });
      AUDIO.play('bombBoom');
      setTimeout(()=>fireGrid.remove(),900);
    } else {
      this._zombies.forEach(z=>{
        if (!z.dead && !z.hypnotized) {
          const dx=Math.abs(z.x-cx);
          const dy=Math.abs(z.row-pr);
          if (dy <= (data.aoe||1) && dx < this.CELL_W * ((data.aoe||1)+0.85)) {
            this._damageZombie(z, data.damage || 1800, data.boardFire ? 'boardFire' : 'explosive');
            if (data.freezeBlast) z.slowTimer = Math.max(z.slowTimer||0, data.slowDur||4200);
          }
        }
      });
      const el=document.createElement('div');
      el.className='explosion-vfx';
      el.textContent = data.freezeBlast ? '❄️' : (data.explosionEmoji || '💥');
      el.style.left=(pc*this.CELL_W-10)+'px';
      el.style.top=(pr*this.CELL_H-10)+'px';
      this.boardEl.appendChild(el);
      if (data.freezeBlast) AUDIO.play('freeze'); else AUDIO.play('bombBoom');
      setTimeout(()=>el.remove(),720);
    }
    this._destroyPlant(plant);
  }

  // ── Partículas ───────────────────────────────
  _spawnParticles(x,y,emoji,count=3) {
    for (let i=0;i<count;i++){
      const el=document.createElement('div');
      el.className='particle';el.textContent=emoji;
      el.style.left=(x+Math.random()*30-15)+'px';
      el.style.top=(y+Math.random()*20-10)+'px';
      el.style.setProperty('--tx',(Math.random()*60-30)+'px');
      el.style.setProperty('--ty',(-20-Math.random()*40)+'px');
      el.style.setProperty('--rot',(Math.random()*360)+'deg');
      el.style.setProperty('--dur',(.4+Math.random()*.6)+'s');
      this.boardEl.appendChild(el);
      setTimeout(()=>el.remove(),1100);
    }
  }

  _spawnParticlesContextual(x, y, type, count=4) {
    // type: 'zombie','beast','dark','specter','boss','freeze','fire','slow','explosion','double'
    const CONFIGS = {
      zombie:    { emojis:['💀','🦴','🩸'], arc:false, spread:35 },
      beast:     { emojis:['🩸','🔴','💢'], arc:true,  spread:50 },
      dark:      { emojis:['💜','🌑','✨'], arc:false, spread:30 },
      specter:   { emojis:['👻','💨','🌀'], arc:false, spread:28 },
      boss:      { emojis:['💛','⭐','✨','💥','🌟'], arc:true, spread:70 },
      freeze:    { emojis:['❄️','💧','🌀'], arc:false, spread:25 },
      fire:      { emojis:['🔥','✨','💥'], arc:true,  spread:32 },
      slow:      { emojis:['🥦','💚','🌿'], arc:false, spread:22 },
      explosion: { emojis:['💥','🔸','🔶','⚡'], arc:true, spread:60 },
      double:    { emojis:['🟣','💫'],      arc:false, spread:24 },
      normal:    { emojis:['💢','⚡'],      arc:false, spread:20 },
    };
    const cfg = CONFIGS[type] || CONFIGS.normal;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const emoji = cfg.emojis[Math.floor(Math.random()*cfg.emojis.length)];
      el.className = 'particle' + (cfg.arc ? ' particle-arc' : '');
      el.textContent = emoji;
      el.style.fontSize = type==='boss' ? (14+Math.random()*8)+'px' : '13px';
      el.style.left = (x + Math.random()*cfg.spread - cfg.spread/2) + 'px';
      el.style.top  = (y + Math.random()*20 - 10) + 'px';
      el.style.setProperty('--tx', (Math.random()*cfg.spread*2 - cfg.spread) + 'px');
      el.style.setProperty('--ty', (-18 - Math.random()*38) + 'px');
      el.style.setProperty('--rot', (Math.random()*360) + 'deg');
      el.style.setProperty('--dur', (.35 + Math.random()*.55) + 's');
      this.boardEl.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
  }

  // ── Colocar / Quitar planta ──────────────────
  selectPlant(typeId) {
    this.deselectHelper();
    const data = PLANTS[typeId];
    if (!data) return;
    if (typeId==='magnetica') {
      if (this.suns < data.cost) { this._showToast(`Necesitas ${data.cost}☀️`,'warn'); AUDIO.play('error'); return; }
      this.suns -= data.cost;
      this._activateInstantMagnet();
      this._startCardCooldown(typeId);
      this._updateHUD();
      this._updateSeedBankAffordability();
      AUDIO.play('place');
      return;
    }
    this.selectedPlant=typeId;
    this.moveToolSource=null;
    document.querySelectorAll('.seed-card').forEach(c=>c.classList.remove('seed-selected'));
    const card=document.querySelector(`.seed-card[data-type="${typeId}"]`);
    if (card) card.classList.add('seed-selected');
    document.querySelectorAll('.cell').forEach(c=>{c.classList.remove('cell-synergy-target','cell-fusion-target');delete c.dataset.synergyLabel;delete c.dataset.fusionLabel;});
    document.querySelectorAll('.cell').forEach(c=>c.classList.add('cell-target'));

    // Resaltar celdas adyacentes a plantas compatibles
    // Resaltar celdas de fusión (misma celda, planta compatible)
    if (typeof FUSIONS !== 'undefined') {
      this._plants.filter(p=>!p.dead).forEach(p => {
        const key = `${p.typeId}+${typeId}`;
        if (!FUSIONS[key]) return;
        const cell = this.boardEl.querySelector(`.cell[data-row="${p.row}"][data-col="${p.col}"]`);
        if (cell) {
          cell.classList.add('cell-fusion-target');
          cell.dataset.fusionLabel = FUSIONS[key].label;
        }
        // ── Hacer titilar la planta en el tablero ──
        if (p.el) p.el.classList.add('plant-combo-blink');
      });
    }
    if (typeof SYNERGIES !== 'undefined') {
      this._plants.filter(p=>!p.dead).forEach(p => {
        const key2 = `${typeId}+${p.typeId}`;
        if (SYNERGIES[key2] && p.el) p.el.classList.add('plant-combo-blink');
      });
    }

    if (typeof SYNERGIES !== 'undefined') {
      this._plants.filter(p=>!p.dead).forEach(p => {
        const key = `${typeId}+${p.typeId}`;
        if (!SYNERGIES[key]) return;
        const syn = SYNERGIES[key];
        const dirs = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];
        dirs.forEach(d => {
          const nr = p.row+d.r, nc = p.col+d.c;
          if (nr<0||nr>=this.ROWS||nc<0||nc>=this.COLS) return;
          if (this.board[nr]&&this.board[nr][nc]) return;
          const cell = this.boardEl.querySelector(`.cell[data-row="${nr}"][data-col="${nc}"]`);
          if (cell) {
            cell.classList.add('cell-synergy-target');
            cell.style.setProperty('--syn-color', syn.color);
            cell.dataset.synergyLabel = syn.label;
          }
        });
      });
    }
    if (typeId==='moverficha') this._showToast('↔️ Elige la ficha o enemigo que quieres mover.', 'success', 2200);
    if (window._toggleSeedDrawer) window._toggleSeedDrawer(false);
  }

  deselectPlant() {
    this.selectedPlant=null;
    this.moveToolSource=null;
    document.querySelectorAll('.seed-card').forEach(c=>c.classList.remove('seed-selected'));
    document.querySelectorAll('.cell').forEach(c=>{
      c.classList.remove('cell-target','cell-synergy-target','cell-fusion-target');
      delete c.dataset.synergyLabel;
      delete c.dataset.fusionLabel;
    });
    // Remover titilado de plantas en tablero
    this._plants.forEach(p=>{ if(p.el) p.el.classList.remove('plant-combo-blink'); });
  }


  _activateInstantMagnet() {
    const before = this._sunOrbs.filter(o=>!o.collected).length;
    this._sunOrbs.slice().forEach(orb=>this._collectPickup(orb.id));
    this._showToast(before ? '🧲 El imán recogió soles y estrellas al instante.' : '🧲 No había soles ni estrellas para recoger.', before ? 'success' : 'info', 1800);
  }

  _findMoverSource(row,col) {
    const plant=this.board[row]?.[col] || null;
    if (plant) return {kind:'plant', ref:plant, row, col};
    const special=this._specials.find(s=>!s.dead && s.row===row && s.col===col);
    if (special) return {kind:'special', ref:special, row, col};
    const enemy=this._zombies.find(z=>!z.dead && !z.hypnotized && z.row===row && Math.floor(Math.max(0,z.x)/this.CELL_W)===col);
    if (enemy) return {kind:'enemy', ref:enemy, row, col};
    return null;
  }

  _moveSelectedPieceTo(row,col) {
    const src=this.moveToolSource;
    if (!src) return false;
    if (this.suns < (PLANTS.moverficha.cost||120)) { this._showToast('Necesitas 120☀️ para mover una ficha.','warn'); AUDIO.play('error'); return false; }
    if (src.kind==='plant') {
      if (this.board[row][col]) { this._showToast('La casilla destino está ocupada.','warn'); AUDIO.play('error'); return false; }
      const p=src.ref;
      this.board[p.row][p.col]=null;
      p.row=row; p.col=col;
      this.board[row][col]=p;
      const cell=this.boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      if (cell && p.el) cell.appendChild(p.el);
    } else if (src.kind==='special') {
      if (this._specials.find(s=>!s.dead && s.row===row && s.col===col)) { this._showToast('Ya hay un ayudante en esa casilla.','warn'); AUDIO.play('error'); return false; }
      const s=src.ref;
      s.row=row; s.col=col; s.x = col*this.CELL_W + this.CELL_W/2 - 18; s.y = row*this.CELL_H + 8;
      if (s.el) { s.el.style.left=s.x+'px'; s.el.style.top=s.y+'px'; }
    } else if (src.kind==='enemy') {
      const z=src.ref;
      z.row=row; z.x = col*this.CELL_W + this.CELL_W*0.7;
      z.state='walking'; z.eatTarget=null; z.eatTimer=0;
      if (z.el) { z.el.style.left=(z.x-25)+'px'; z.el.style.top=(row*this.CELL_H+8)+'px'; }
    }
    this.suns -= (PLANTS.moverficha.cost||120);
    this._startCardCooldown('moverficha');
    this._updateHUD();
    this._updateSeedBankAffordability();
    this._showToast('↔️ Ficha reubicada.', 'success', 1600);
    AUDIO.play('place');
    return true;
  }

  onCellClick(row,col) {
    // ── Premio seleccionado: activarlo en esta celda ──
    if (this._selectedPrize != null) {
      this._activatePrizeOnCell(row, col);
      return;
    }

    if (this.selectedHelper) {
      const helperId=this.selectedHelper;
      this._activateHelperAt(row,col,helperId);
      this.deselectHelper();
      return;
    }

    if (!this.selectedPlant) return;
    if (this.selectedPlant==='moverficha') {
      if (!this.moveToolSource) {
        const src=this._findMoverSource(row,col);
        if (!src) { this._showToast('Toca una planta, ayudante o enemigo para elegirlo.', 'warn'); AUDIO.play('error'); return; }
        this.moveToolSource=src;
        this._showToast(`↔️ Ahora toca la casilla destino para mover ${src.kind==='enemy'?'al enemigo':'la ficha'}.`, 'success', 2200);
        return;
      }
      if (this._moveSelectedPieceTo(row,col)) this.deselectPlant();
      return;
    }
    if (this.board[row][col]) {
      // ── INTENTO DE FUSIÓN ──────────────────────────────────────────
      if (typeof FUSIONS !== 'undefined') {
        const existing = this.board[row][col];
        const key = `${existing.typeId}+${this.selectedPlant}`;
        const fusion = FUSIONS[key];
        if (fusion) {
          const newData = PLANTS[fusion.result];
          if (!newData) { this._showToast('¡Casilla ocupada!','warn'); AUDIO.play('error'); return; }
          // Verificar coste: la segunda planta sí cuesta soles
          const selectedType = this.selectedPlant;
          const incomingData = PLANTS[selectedType];
          if (this.suns < incomingData.cost) {
            this._showToast(`Necesitas ${incomingData.cost}☀️`,'warn'); AUDIO.play('error'); return;
          }
          this.suns -= incomingData.cost;
          this._startCardCooldown(selectedType);
          this._fuseAtCell(row, col, existing, fusion.result, fusion.label);
          this.deselectPlant();
          this._updateHUD();
          this._updateSeedBankAffordability();
          return;
        }
      }
      this._showToast('¡Casilla ocupada!','warn'); AUDIO.play('error'); return;
    }
    const selectedType=this.selectedPlant;
    const data=PLANTS[selectedType];
    if (!data) return;
    if (this.suns<data.cost){this._showToast(`Necesitas ${data.cost}☀️`,'warn');AUDIO.play('error');return;}
    this.suns-=data.cost;
    const plant=this._placePlant(row,col,selectedType);
    this._startCardCooldown(selectedType);
    this.deselectPlant();
    AUDIO.play('place');
    this._updateHUD();
    this._updateSeedBankAffordability();
    // Bomba: timer
    if (data.explosive) {
      const fuseTime=data.fuseTime||2000;
      setTimeout(()=>{if(!this.gameOver&&!plant.dead)this._activateBomba(plant);},fuseTime);
    }
  }

  _placePlant(row,col,typeId) {
    const data=PLANTS[typeId]; const id=this._id++;
    const el=document.createElement('div');
    el.className=`plant plant-${typeId} ${data.anim||''}`;
    if (data.boardEmojiHTML) el.innerHTML = data.boardEmojiHTML; else el.textContent=data.emoji;
    el.addEventListener('contextmenu',ev=>{ev.preventDefault();if(this.board[row][col])this._destroyPlant(this.board[row][col]);});

    const cell=this.boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.appendChild(el);

    const plant={id,typeId,row,col,el,hp:data.hp,maxHp:data.hp,dead:false,
      fireTimer:data.fireRate||0,
      sunTimer:data.sunProd?data.sunRate:undefined,
      activated:false,eating:false,eatCooldown:0,eatTargetId:null,
    };
    this.board[row][col]=plant;
    this._plants.push(plant);
    // ── Verificar sinergias con plantas adyacentes ──
    this._checkSynergies(plant);
    return plant;
  }

  _fuseAtCell(row, col, existingPlant, fusedTypeId, fuseLabel) {
    const fusedData = PLANTS[fusedTypeId];
    if (!fusedData) return;

    // Animación de fusión: flash neón en la celda
    const cell = this.boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add('cell-fusing');
      setTimeout(() => cell.classList.remove('cell-fusing'), 700);
    }

    // Destruir la planta existente sin sonido (fusión, no muerte)
    existingPlant.dead = true;
    this._plants = this._plants.filter(p => p.id !== existingPlant.id);
    if (existingPlant.el) {
      existingPlant.el.classList.add('plant-fuse-out');
      const oldEl = existingPlant.el;
      setTimeout(() => oldEl.remove(), 300);
      existingPlant.el = null;
    }
    this.board[row][col] = null;

    // Partículas de fusión
    const cx = col * this.CELL_W + this.CELL_W / 2;
    const cy = row * this.CELL_H + this.CELL_H / 2;
    this._spawnParticlesContextual(cx, cy, 'boss', 8);

    // Crear planta fusionada después de la animación
    setTimeout(() => {
      if (this.gameOver) return;
      const plant = this._placePlant(row, col, fusedTypeId);
      // Marcar como fusionada para estilos especiales
      plant.fused = true;
      if (plant.el) {
        plant.el.classList.add('plant-fused');
        plant.el.style.setProperty('--neon-color', fusedData.neonColor || '#ffd740');
        // Emoji compuesto: fuseEmoji en lugar del emoji simple
        if (fusedData.fuseEmoji) plant.el.textContent = fusedData.fuseEmoji;
        // Flash de entrada
        plant.el.classList.add('plant-fuse-in');
        setTimeout(() => plant.el && plant.el.classList.remove('plant-fuse-in'), 500);
      }
    }, 280);

    this._showToast(`⚗️ ¡FUSIÓN! ${fuseLabel}`, 'success', 2800);
    AUDIO.play('bossRage'); // sonido impactante reutilizado
  }

  _checkSynergies(newPlant) {
    if (typeof SYNERGIES === 'undefined') return;
    const dirs = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];
    dirs.forEach(d => {
      const nr = newPlant.row + d.r, nc = newPlant.col + d.c;
      if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) return;
      const neighbor = this.board[nr] && this.board[nr][nc];
      if (!neighbor || neighbor.dead) return;
      const key = `${newPlant.typeId}+${neighbor.typeId}`;
      const syn = SYNERGIES[key];
      if (!syn) return;
      // Activar sinergia en ambas plantas
      [newPlant, neighbor].forEach(p => {
        p.synergy = syn.effect;
        p.synergyColor = syn.color;
        if (p.el) {
          p.el.classList.add('plant-synergy');
          p.el.style.setProperty('--syn-color', syn.color);
        }
        // Efecto inmediato superWall: bonus HP
        if (syn.effect === 'superWall' && !p._wallBoosted) {
          p._wallBoosted = true;
          p.maxHp = Math.round(p.maxHp * 1.4);
          p.hp    = Math.round(p.hp    * 1.4);
        }
        // Efecto sunBoost: acelerar sunTimer
        if (syn.effect === 'sunBoost' && p.sunTimer !== undefined) {
          p.sunTimer = Math.round(p.sunTimer * 0.5);
        }
      });
      this._showToast(`✨ ${syn.label} — ${syn.desc}`, 'success', 2600);
      AUDIO.play('place');
    });
  }

  // ── Especiales ───────────────────────────────
  _checkHelperUnlock() {
    this._updateHelperButtons();
  }

  _updateHelperCooldowns(dt) {
    Object.keys(this.helperCooldowns).forEach(id=>{
      if ((this.helperCooldowns[id]||0) > 0) {
        this.helperCooldowns[id] -= dt;
        if (this.helperCooldowns[id] < 0) this.helperCooldowns[id] = 0;
      }
    });
    this._updateHelperButtons();
  }

  _canAffordHelper(id, cfg) {
    if (!cfg) return false;
    if (id === 'auto') return this.helperStars >= cfg.cost || this.score >= 1000;
    return this.helperStars >= cfg.cost;
  }

  _payHelper(id, cfg) {
    if (id === 'auto') {
      if (this.helperStars >= cfg.cost) { this.helperStars -= cfg.cost; return 'stars'; }
      if (this.score >= 1000) { this.score -= 1000; return 'score'; }
      return null;
    }
    if (this.helperStars >= cfg.cost) { this.helperStars -= cfg.cost; return 'stars'; }
    return null;
  }

  _updateHelperButtons() {
    if (typeof HELPERS === 'undefined') return;
    Object.entries(HELPERS).forEach(([id, cfg])=>{
      const btn=document.getElementById(`btn-helper-${id}`);
      const card=document.querySelector(`.seed-card.helper-card[data-helper="${id}"]`);
      const cd=Math.max(0, this.helperCooldowns[id]||0);
      const affordable=this._canAffordHelper(id, cfg);
      const selected=this.selectedHelper===id;

      if (btn) {
        btn.disabled = cd>0 || !affordable;
        btn.classList.toggle('helper-selected', selected);
        btn.title = `${cfg.desc} · cuesta ${cfg.cost}⭐ · dura ${Math.round(cfg.duration/1000)}s`;
        btn.textContent = cd>0 ? `${cfg.emoji} ${cfg.name} (${Math.ceil(cd/1000)}s)` : `${cfg.emoji} ${cfg.name} ⭐${cfg.cost}`;
      }

      if (card) {
        card.classList.toggle('seed-selected', selected);
        card.classList.toggle('seed-cooling', cd>0);
        card.classList.toggle('seed-unaffordable', !affordable && cd<=0);
        card.title = `${cfg.desc} · cuesta ${cfg.cost}⭐ · dura ${Math.round(cfg.duration/1000)}s`;
        const costEl=card.querySelector('.seed-cost');
        if (costEl) costEl.textContent = cd>0 ? `⏳${Math.ceil(cd/1000)}s` : (id==='auto' ? `⭐${cfg.cost}/🏆1000` : `⭐${cfg.cost}`);
        const bar=card.querySelector('.seed-cooldown-bar');
        const fill=card.querySelector('.seed-cooldown-fill');
        if (bar && fill) {
          if (cd>0) {
            const pct = Math.max(0, Math.min(100, 100 - (cd/(cfg.cooldown||1))*100));
            bar.classList.remove('hidden');
            fill.style.width = pct + '%';
          } else {
            bar.classList.add('hidden');
            fill.style.width = '100%';
          }
        }
      }
    });
  }

  _maybePromptHelpers() {
    const now = performance.now();
    if (now - this._lastHelperHintAt < 12000) return;
    const affordable = Object.entries(HELPERS).filter(([id,cfg]) => (this.helperCooldowns[id]||0)<=0 && this._canAffordHelper(id,cfg));
    if (!affordable.length) return;
    this._lastHelperHintAt = now;
    const names = affordable.slice(0,3).map(([,cfg])=>`${cfg.emoji} ${cfg.name}`).join(', ');
    this._showToast(`⭐ Puedes llamar a ${names}. Elígelo desde la barra de cartas.`, 'success', 2600);
  }

  selectHelper(helperId) {
    const cfg = HELPERS?.[helperId];
    if (!cfg) return;
    if ((this.helperCooldowns[helperId]||0) > 0) { AUDIO.play('error'); return; }
    if (!this._canAffordHelper(helperId, cfg)) {
      const msg = helperId==='auto' ? `Necesitas ${cfg.cost}⭐ o 1000🏆 para llamar a ${cfg.name}.` : `Necesitas ${cfg.cost}⭐ para llamar a ${cfg.name}.`;
      this._showToast(msg,'warn');
      AUDIO.play('error');
      return;
    }
    this.deselectPlant();
    this.selectedHelper = helperId;
    this._updateHelperButtons();
    document.querySelectorAll('.cell').forEach(c=>c.classList.add('cell-target'));
    this._showToast(`Ubica a ${cfg.name} donde quieras y se activará su poder.`,'success',2400);
    if (window._toggleSeedDrawer) window._toggleSeedDrawer(false);
    AUDIO.play('select');
  }

  deselectHelper() {
    this.selectedHelper = null;
    this._updateHelperButtons();
    document.querySelectorAll('.cell').forEach(c=>c.classList.remove('cell-target'));
  }

  summonEmilia() { this.selectHelper('emilia'); }
  summonMartin() { this.selectHelper('martin'); }
  summonSuperPapa() { this.selectHelper('papa'); }
  summonAlien() { this.selectHelper('alien'); }
  summonAuto() { this.selectHelper('auto'); }

  _activateHelperAt(row,col,helperId) {
    const cfg = HELPERS?.[helperId];
    if (!cfg) return;
    const paidWith = this._payHelper(helperId, cfg);
    if (!paidWith) { AUDIO.play('error'); return; }

    this.helperCooldowns[helperId] = cfg.cooldown;

    const id=this._id++;
    let x = col*this.CELL_W + this.CELL_W/2 - 18;
    let y = row*this.CELL_H + 8;
    const el=document.createElement('div');
    el.className = helperId==='auto' ? 'car-rush' : 'special-char';
    el.dataset.helper=helperId;
    el.textContent=cfg.emoji;
    if (helperId==='auto') { x = col*this.CELL_W - 10; y = row*this.CELL_H + this.CELL_H/2 - 18; }
    el.style.left=x+'px';
    el.style.top=y+'px';
    this.boardEl.appendChild(el);

    const spec={
      id, type:helperId, row, col, x, y, el,
      dead:false, duration:cfg.duration, elapsed:0, fireTimer:0, hp:(cfg.hp||180), maxHp:(cfg.hp||180), speed:(helperId==='auto'?280:0) 
    };
    this._specials.push(spec);

    if (helperId==='emilia') { AUDIO.play('emilia'); this._earnLogro('invocador'); }
    else if (helperId==='martin') { AUDIO.play('martin'); }
    else if (helperId==='papa') { AUDIO.play('superpapa'); this._earnLogro('superpoder'); }
    else if (helperId==='alien') { AUDIO.play('alien'); }
    else if (helperId==='auto') { AUDIO.play('rocket'); }
    else if (helperId==='lluviaSolar') { AUDIO.play('sun'); this._showToast('🌤️ ¡Lluvia Solar activada!','success',1800); }
    else if (helperId==='astronauta') { AUDIO.play('rocket'); this._showToast('👨‍🚀 ¡Lluvia de meteoritos!','success',2000); }
    else if (helperId==='unicornio')  { AUDIO.play('sun'); this._showToast('🦄 ¡Chocolates explosivos!','success',2000); }

    const payMsg = helperId==='auto' ? (paidWith==='score' ? 'por 1000🏆' : `por ${cfg.cost}⭐`) : '';
    this._showToast(`${cfg.emoji} ${cfg.name} entra al tablero ${payMsg}.`, 'success', 2400);
    this._spawnParticles(x+14,y+18,cfg.emoji,3);
    this._updateHUD();
  }

  _helperTargetAhead(spec) {
    return this._zombies.find(z=>!z.dead&&!z.hypnotized&&z.row===spec.row&&z.x>spec.x+12);
  }

  _fireHelperProjectile(spec, cfg={}) {
    return this._spawnProjectile({
      row: spec.row,
      x: spec.x + 26,
      y: spec.row*this.CELL_H + this.CELL_H/2 - 10 + (cfg.yOffset||0),
      emoji: cfg.emoji || '🟢',
      speed: cfg.speed || 420,
      damage: cfg.damage || 20,
      slows: !!cfg.slows,
      slowDur: cfg.slowDur || 3000,
      aoe: cfg.aoe || 0,
      owner: 'helper',
      className: cfg.className || '',
      explosionEmoji: cfg.explosionEmoji || '💥',
    });
  }

  _helperLaser(spec) {
    AUDIO.play('laserchip');
    const beam=document.createElement('div');
    beam.className='laser-beam';
    beam.style.left=(spec.x+20)+'px';
    beam.style.width=(this.COLS*this.CELL_W - spec.x - 10)+'px';
    beam.style.top=(spec.row*this.CELL_H + this.CELL_H/2 - 7)+'px';
    this.boardEl.appendChild(beam);
    setTimeout(()=>beam.remove(),680);

    let hits=0;
    this._zombies.forEach(z=>{
      if (!z.dead && !z.hypnotized && z.row===spec.row && z.x >= spec.x-10) {
        this._damageZombie(z, 150, 'explosive');
        hits++;
      }
    });
    if (hits>0) this.score += hits*2;
  }


  _damageSpecial(spec,dmg) {
    if (!spec || spec.dead) return;
    spec.hp -= dmg;
    if (spec.el) {
      spec.el.classList.add('plant-hit');
      setTimeout(()=>spec.el&&spec.el.classList.remove('plant-hit'),150);
    }
    if (spec.hp <= 0) {
      spec.dead = true;
      if (spec.el) { spec.el.classList.add('plant-die'); const el=spec.el; setTimeout(()=>el.remove(),380); spec.el=null; }
      this._showToast('⚠️ Un ayudante fue debilitado hasta desaparecer.','warn',1700);
    }
  }

  _updateSpecials(dt) {
    this._specials=this._specials.filter(s=>{
      if (s.dead){ s.el&&s.el.remove(); return false; }
      s.elapsed += dt;
      s.fireTimer += dt;

      const lifeLeft = Math.max(0, s.duration - s.elapsed);
      if (s.el) {
        if (lifeLeft < 2500) s.el.style.opacity = String(Math.max(.25, lifeLeft/2500));
        s.el.style.transform = `translateY(${Math.sin(s.elapsed/160)*-4}px)`;
      }
      if (s.elapsed >= s.duration) {
        s.el&&s.el.remove();
        return false;
      }

      switch (s.type) {
        case 'emilia':
          if (s.fireTimer >= 950 && this._helperTargetAhead(s)) {
            s.fireTimer = 0;
            this._fireHelperProjectile(s,{emoji:'🧊',damage:24,speed:380,slows:true,slowDur:3600,yOffset:-4});
            this._fireHelperProjectile(s,{emoji:'🧊',damage:24,speed:400,slows:true,slowDur:3600,yOffset:4});
            AUDIO.play('freeze');
          }
          break;
        case 'martin':
          if (s.fireTimer >= 900 && this._helperTargetAhead(s)) {
            s.fireTimer = 0;
            this._fireHelperProjectile(s,{emoji:'🔸',damage:18,speed:430,yOffset:-6});
            this._fireHelperProjectile(s,{emoji:'🔸',damage:18,speed:470,yOffset:0});
            this._fireHelperProjectile(s,{emoji:'🔸',damage:18,speed:510,yOffset:6});
            AUDIO.play('martin');
          }
          break;
        case 'papa':
          if (s.fireTimer >= 1350 && this._helperTargetAhead(s)) {
            s.fireTimer = 0;
            this._helperLaser(s);
          }
          break;
        case 'alien':
          if (s.fireTimer >= 1800 && this._helperTargetAhead(s)) {
            s.fireTimer = 0;
            this._fireHelperProjectile(s,{
              emoji:'🚀', damage:72, speed:300, aoe:1,
              className:'projectile-rocket', explosionEmoji:'💥'
            });
            AUDIO.play('rocket');
          }
          break;
        case 'auto': {
          s.x += (s.speed || 260) * (dt/1000);
          if (s.el) { s.el.style.left = s.x + 'px'; s.el.style.transform = 'none'; }
          this._zombies.forEach(z=>{
            if (!z.dead && !z.hypnotized && z.row===s.row && Math.abs((z.x) - (s.x+18)) < 34) {
              this._damageZombie(z, 140, 'explosive');
            }
          });
          if (s.x > this.COLS*this.CELL_W + 40) { if (s.el) s.el.remove(); return false; }
          break;
        }
        case 'lluviaSolar': {
          s.sunRainTimer = (s.sunRainTimer||0) + dt;
          if (s.sunRainTimer >= 480) {
            s.sunRainTimer = 0;
            const rx = 20 + Math.random() * (this.COLS * this.CELL_W - 40);
            const ry = 20 + Math.random() * (this.ROWS * this.CELL_H - 40);
            this._createSunOrb(rx, -30, rx, ry, 25);
          }
          break;
        }
        case 'astronauta': {
          // Lluvia de meteoritos cada 1800ms — cae sobre un zombie aleatorio
          s.meteorTimer = (s.meteorTimer||0) + dt;
          if (s.meteorTimer >= 1800) {
            s.meteorTimer = 0;
            const targets = this._zombies.filter(z=>!z.dead&&!z.hypnotized);
            if (targets.length>0) {
              const t = targets[Math.floor(Math.random()*targets.length)];
              const mx = t.x + 10;
              const my = t.row*this.CELL_H + this.CELL_H/2;
              // Elemento visual del meteorito
              const met=document.createElement('div');
              met.className='meteor-drop';
              met.textContent='☄️';
              met.style.left=(mx-16)+'px';
              met.style.top=(t.row*this.CELL_H)+'px';
              this.boardEl.appendChild(met);
              setTimeout(()=>{
                met.remove();
                // Explosión en área
                const el2=document.createElement('div');
                el2.className='explosion-vfx';
                el2.textContent='💥';
                el2.style.left=(mx-14)+'px';
                el2.style.top=(my-14)+'px';
                this.boardEl.appendChild(el2);
                setTimeout(()=>el2.remove(),700);
                this._zombies.forEach(z=>{
                  if(!z.dead&&!z.hypnotized){
                    const dx=Math.abs(z.x-mx), dy=Math.abs(z.row-t.row);
                    if(dy<=1 && dx<this.CELL_W*1.8) this._damageZombie(z,280,'explosive');
                  }
                });
                AUDIO.play('bombBoom');
              },360);
            }
          }
          break;
        }
        case 'unicornio': {
          // Chocolates explosivos cada 1100ms
          if (s.fireTimer >= 1100 && this._helperTargetAhead(s)) {
            s.fireTimer = 0;
            this._fireHelperProjectile(s,{
              emoji:'🍫', damage:38, speed:360,
              slows:true, slowDur:2800, burn:true,
              className:'projectile-choco', explosionEmoji:'✨'
            });
            this._fireHelperProjectile(s,{
              emoji:'🍬', damage:38, speed:400,
              slows:true, slowDur:2800, burn:true,
              className:'projectile-choco', explosionEmoji:'✨',
              yOffset: 8
            });
            AUDIO.play('sun');
          }
          break;
        }
      }
      return true;
    });
  }

  // ── Sistema de Premios en Pantalla ─────────────
  _updatePrizeSystem(dt) {
    if (this.gameOver || this.paused) return;
    const SCORE_PRIZE_INTERVAL = 600;
    const KILLS_PRIZE_INTERVAL = 20;
    const SUNS_PRIZE_INTERVAL  = 120;

    const PRIZE_POOL = [
      { emoji:'🧱', label:'Barrera',   type:'barrier_small', desc:'Coloca una barrera resistente' },
      { emoji:'🪨', label:'Roca',      type:'barrier_big',   desc:'Coloca una roca muy resistente' },
      { emoji:'🚧', label:'Barricada', type:'barrier_temp',  desc:'Barricada temporal' },
      { emoji:'🧨', label:'Petardo',   type:'bomb_small',    desc:'Pequeña explosión en área' },
      { emoji:'☄️', label:'Meteorito', type:'bomb_big',      desc:'Gran explosión en área' },
      { emoji:'❤️‍🔥', label:'Corazón', type:'heal_fire',     desc:'Cura una planta o quema enemigos' },
      { emoji:'🌶️', label:'Ají',       type:'bomb_chili',    desc:'Explosión picante en área' },
    ];

    const scoreGap = this.score - this._scoreLastPrize;
    const killsGap = this.zombiesKilledRun - this._killsLastPrize;
    const sunsGap  = this.sunsCollectedRun - this._sunsLastPrize;

    let spawned = false;
    if (scoreGap >= SCORE_PRIZE_INTERVAL && Math.random()<0.65) {
      this._scoreLastPrize = this.score; spawned=true;
    } else if (killsGap >= KILLS_PRIZE_INTERVAL && Math.random()<0.70) {
      this._killsLastPrize = this.zombiesKilledRun; spawned=true;
    } else if (sunsGap >= SUNS_PRIZE_INTERVAL && Math.random()<0.55) {
      this._sunsLastPrize = this.sunsCollectedRun; spawned=true;
    }

    if (spawned && this._prizes.length < 3) {
      // A veces aparecen 2 a la vez
      const count = Math.random() < 0.22 ? 2 : 1;
      for (let i=0; i<count && this._prizes.length<3; i++) {
        const prize = PRIZE_POOL[Math.floor(Math.random()*PRIZE_POOL.length)];
        this._spawnPrize(prize);
      }
    }
  }

  _spawnPrize(prizeData) {
    const id = this._id++;
    const tray = document.getElementById('prize-tray');
    if (!tray) return;

    const chip = document.createElement('div');
    chip.className = 'prize-chip';
    chip.dataset.prizeId = id;
    chip.innerHTML = `<span class="prize-emoji">${prizeData.emoji}</span><span class="prize-label">${prizeData.label}</span>`;
    chip.title = prizeData.desc;
    tray.appendChild(chip);

    const prize = { id, data: prizeData, el: chip, timer: 5000 };
    this._prizes.push(prize);

    chip.addEventListener('click', () => this._selectPrize(id));

    // Auto-desaparece en 5s
    const killTimer = setTimeout(() => this._removePrize(id), 5000);
    prize._killTimer = killTimer;
  }

  _selectPrize(id) {
    const prize = this._prizes.find(p=>p.id===id);
    if (!prize) return;

    // Deselect any other
    this._prizes.forEach(p=>{ if(p.el) p.el.classList.remove('prize-selected'); });

    if (this._selectedPrize === id) {
      // Toggle off
      this._selectedPrize = null;
      this._showToast('🎁 Premio deseleccionado.','info',1200);
    } else {
      this._selectedPrize = id;
      prize.el.classList.add('prize-selected');
      this._showToast(`${prize.data.emoji} Seleccionado — colócalo en el tablero.`,'success',2000);
    }
  }

  _activatePrizeOnCell(row, col) {
    const prize = this._prizes.find(p=>p.id===this._selectedPrize);
    if (!prize) return false;

    const cx = col*this.CELL_W + this.CELL_W/2;
    const cy = row*this.CELL_H + this.CELL_H/2;

    switch(prize.data.type) {
      case 'barrier_small': {
        if (this.board[row]&&this.board[row][col]) { this._showToast('⚠️ Casilla ocupada.','warn',1000); return false; }
        // Crear muro temporal de regalo
        const el=document.createElement('div');
        el.className='plant plant-muro';
        el.textContent='🧱';
        el.style.left=(col*this.CELL_W+this.CELL_W/2-20)+'px';
        el.style.top=(row*this.CELL_H+4)+'px';
        this.boardEl.appendChild(el);
        const p={id:this._id++,typeId:'muro',row,col,el,hp:700,maxHp:700,dead:false,
          data:{...PLANTS.muro,hp:700,maxHp:700},synergy:null,isPrize:true};
        this._plants.push(p); this.board[row][col]=p;
        this._showToast('🧱 ¡Barrera colocada!','success',1500);
        break;
      }
      case 'barrier_big': {
        if (this.board[row]&&this.board[row][col]) { this._showToast('⚠️ Casilla ocupada.','warn',1000); return false; }
        const el=document.createElement('div');
        el.className='plant plant-granmuro';
        el.textContent='🪨';
        el.style.left=(col*this.CELL_W+this.CELL_W/2-20)+'px';
        el.style.top=(row*this.CELL_H+4)+'px';
        this.boardEl.appendChild(el);
        const p={id:this._id++,typeId:'granmuro',row,col,el,hp:1200,maxHp:1200,dead:false,
          data:{...PLANTS.granmuro,hp:1200,maxHp:1200},synergy:null,isPrize:true};
        this._plants.push(p); this.board[row][col]=p;
        this._showToast('🪨 ¡Roca de regalo colocada!','success',1500);
        break;
      }
      case 'barrier_temp': {
        if (this.board[row]&&this.board[row][col]) { this._showToast('⚠️ Casilla ocupada.','warn',1000); return false; }
        const el=document.createElement('div');
        el.className='plant'; el.textContent='🚧';
        el.style.left=(col*this.CELL_W+this.CELL_W/2-20)+'px';
        el.style.top=(row*this.CELL_H+4)+'px';
        this.boardEl.appendChild(el);
        const p={id:this._id++,typeId:'barricada',row,col,el,hp:450,maxHp:450,dead:false,
          data:{...PLANTS.muro,hp:450,maxHp:450,name:'Barricada'},synergy:null,isPrize:true};
        this._plants.push(p); this.board[row][col]=p;
        this._showToast('🚧 ¡Barricada temporal!','success',1500);
        break;
      }
      case 'bomb_small': {
        this._spawnParticles(cx,cy,'🧨',4);
        this._zombies.forEach(z=>{
          if(!z.dead&&!z.hypnotized){
            const dx=Math.abs(z.x-cx),dy=Math.abs(z.row-row);
            if(dy<=1&&dx<this.CELL_W*2) this._damageZombie(z,900,'explosive');
          }
        });
        AUDIO.play('bombBoom');
        const el=document.createElement('div');el.className='explosion-vfx';el.textContent='💥';
        el.style.left=(cx-14)+'px';el.style.top=(cy-14)+'px';
        this.boardEl.appendChild(el);setTimeout(()=>el.remove(),700);
        this._showToast('🧨 ¡BOOM!','warn',1200);
        break;
      }
      case 'bomb_big': {
        this._spawnParticles(cx,cy,'☄️',6);
        this._zombies.forEach(z=>{
          if(!z.dead&&!z.hypnotized){
            const dx=Math.abs(z.x-cx),dy=Math.abs(z.row-row);
            if(dy<=2&&dx<this.CELL_W*3) this._damageZombie(z,2200,'explosive');
          }
        });
        AUDIO.play('bombBoom');
        const el=document.createElement('div');el.className='explosion-vfx';el.textContent='🌋';
        el.style.left=(cx-18)+'px';el.style.top=(cy-18)+'px';el.style.fontSize='2.4rem';
        this.boardEl.appendChild(el);setTimeout(()=>el.remove(),850);
        this._showToast('☄️ ¡IMPACTO MASIVO!','warn',1500);
        break;
      }
      case 'heal_fire': {
        // Cura la planta de esa celda, o quema área si no hay planta
        const cellPlant = this.board[row]&&this.board[row][col];
        if (cellPlant && !cellPlant.dead) {
          const heal = Math.floor(cellPlant.maxHp * 0.40);
          cellPlant.hp = Math.min(cellPlant.maxHp, cellPlant.hp + heal);
          this._showToast(`❤️‍🔥 Planta curada +${heal} HP!`,'success',1800);
          this._spawnParticles(cx,cy,'❤️',5);
        } else {
          this._zombies.forEach(z=>{
            if(!z.dead&&!z.hypnotized&&z.row===row) this._damageZombie(z,600,'boardFire');
          });
          this._showToast('❤️‍🔥 ¡Llama purificadora en el carril!','success',1800);
        }
        break;
      }
      case 'bomb_chili': {
        this._spawnParticles(cx,cy,'🌶️',5);
        this._zombies.forEach(z=>{
          if(!z.dead&&!z.hypnotized){
            const dx=Math.abs(z.x-cx),dy=Math.abs(z.row-row);
            if(dy<=1&&dx<this.CELL_W*2.5) {
              this._damageZombie(z,1400,'explosive');
              z.slowTimer=Math.max(z.slowTimer||0,2000);
            }
          }
        });
        AUDIO.play('bombBoom');
        const el=document.createElement('div');el.className='explosion-vfx';el.textContent='🌶️';
        el.style.left=(cx-14)+'px';el.style.top=(cy-14)+'px';el.style.fontSize='2rem';
        this.boardEl.appendChild(el);setTimeout(()=>el.remove(),720);
        this._showToast('🌶️ ¡Ají explosivo de regalo!','warn',1300);
        break;
      }
    }
    this._removePrize(prize.id);
    this._selectedPrize = null;
    return true;
  }

  _removePrize(id) {
    const idx = this._prizes.findIndex(p=>p.id===id);
    if (idx<0) return;
    const prize = this._prizes[idx];
    clearTimeout(prize._killTimer);
    if (prize.el) prize.el.remove();
    this._prizes.splice(idx,1);
    if (this._selectedPrize===id) this._selectedPrize=null;
  }

  // ── Logros ───────────────────────────────────
  _checkAchievements() {
    if (this.zombiesKilledRun>=50) this._earnLogro('exterminador');
    if (this.maxCombo>=5) this._earnLogro('combo_5');
  }

  _earnLogro(id) {
    if (STORAGE.earnLogro(id)) {
      const def=STORAGE.getLogrosDef().find(l=>l.id===id);
      if (def) this._showToast(`🏅 ¡Logro: ${def.emoji} ${def.title}!`,'success',3500);
      AUDIO.play('badge');
    }
  }

  // ── Construcción del tablero ─────────────────
  _buildBoard() {
    this.boardEl.innerHTML='';
    for (let r=0;r<this.ROWS;r++){
      for (let c=0;c<this.COLS;c++){
        const cell=document.createElement('div');
        cell.className=`cell cell-${(r+c)%2===0?'a':'b'}`;
        cell.dataset.row=r; cell.dataset.col=c;
        cell.style.left=(c*this.CELL_W)+'px';
        cell.style.top=(r*this.CELL_H)+'px';
        cell.addEventListener('click',()=>this.onCellClick(r,c));
        this.boardEl.appendChild(cell);
      }
    }
    // Aplicar escala
    setTimeout(()=>this._computeScale(),50);
  }

  _buildTostadoras() {
    const col=document.getElementById('tostadoras-col');
    if (!col) return;
    col.innerHTML='';
    for (let r=0;r<this.ROWS;r++){
      const t=document.createElement('div');
      t.className='tostadora'; t.dataset.row=r;
      t.innerHTML=`<div class="toast-emoji">🍞</div><div class="toast-name">DEF</div><div class="toast-hp"><div class="toast-hp-fill"></div></div>`;
      col.appendChild(t);
    }
    this._updateDefenderHUD();
  }

  _updateDefenderHUD(){
    document.querySelectorAll('.tostadora').forEach((t,idx)=>{
      const d=this.defenders[idx];
      const fill=t.querySelector('.toast-hp-fill');
      if(!d || !fill) return;
      const pct=d.maxHp?Math.max(0,d.hp/d.maxHp*100):0;
      fill.style.width=pct+'%';
      fill.style.background=pct<30?'#ff5252':pct<60?'#ffca28':'#8bc34a';
      t.classList.toggle('tostadora-used', !!d.spent);
      t.classList.toggle('tostadora-broken', !!d.spent);
      const emoji=t.querySelector('.toast-emoji');
      if(emoji) emoji.textContent=d.spent?'🧯':'🍞';
    });
  }

  _buildSeedBank(allowed) {
    const bank=document.getElementById('seed-bank');
    if (!bank) return;
    bank.innerHTML='';

    const createPlantCard = (typeId) => {
      const data=PLANTS[typeId];
      const card=document.createElement('div');
      card.className='seed-card'; card.dataset.type=typeId; card.title=data.desc;
      card.innerHTML=`
        <div class="seed-emoji">${data.cardEmojiHTML || data.emoji}</div>
        <div class="seed-name">${data.name}</div>
        <div class="seed-cost">☀️${data.cost}</div>
        <div class="seed-cooldown-bar hidden"><div class="seed-cooldown-fill"></div></div>
      `;
      card.addEventListener('click',()=>{
        if (card.classList.contains('seed-cooling')||card.classList.contains('seed-unaffordable')){AUDIO.play('error');return;}
        if (typeId==='magnetica') {
          if (this.suns < data.cost) { AUDIO.play('error'); return; }
          this.suns -= data.cost;
          const total = this._sunOrbs.length;
          this._sunOrbs.slice().forEach(orb=>this._collectPickup(orb.id));
          this._startCardCooldown(typeId);
          this._updateSeedBankAffordability();
          this._updateHUD();
          this.deselectPlant();
          AUDIO.play('star');
          if (total) this._showToast('🧲 El imán recogió de inmediato soles y estrellas.','success',1500);
          else this._showToast('🧲 Activaste el imán, pero ahora no había soles ni estrellas.','warn',1500);
          return;
        }
        if (this.selectedPlant===typeId){this.deselectPlant();AUDIO.play('select');return;}
        this.selectPlant(typeId);AUDIO.play('select');
      });
      return card;
    };

    const createHelperCard = (helperId) => {
      const cfg=HELPERS[helperId];
      const card=document.createElement('div');
      card.className='seed-card helper-card'; card.dataset.helper=helperId; card.title=cfg.desc;
      card.innerHTML=`
        <div class="seed-emoji">${cfg.emoji}</div>
        <div class="seed-name">${cfg.name}</div>
        <div class="seed-cost">${helperId==='auto'?'⭐'+cfg.cost+' / 🏆1000':'⭐'+cfg.cost}</div>
        <div class="seed-cooldown-bar hidden"><div class="seed-cooldown-fill"></div></div>
      `;
      card.addEventListener('click',()=>{
        if (card.classList.contains('seed-cooling')||card.classList.contains('seed-unaffordable')){AUDIO.play('error');return;}
        if (this.selectedHelper===helperId){this.deselectHelper();AUDIO.play('select');return;}
        this.selectHelper(helperId);AUDIO.play('select');
      });
      return card;
    };

    allowed.forEach(typeId=> bank.appendChild(createPlantCard(typeId)));
    Object.keys(HELPERS).forEach(helperId=> bank.appendChild(createHelperCard(helperId)));
    this._updateSeedBankAffordability();
    this._updateHelperButtons();
  }

  _startCardCooldown(typeId) {
    const card=document.querySelector(`.seed-card[data-type="${typeId}"]`);
    if (!card) return;
    const total=PLANTS[typeId].recharge||7500;
    card.classList.add('seed-cooling');
    const bar=card.querySelector('.seed-cooldown-bar');
    const fill=card.querySelector('.seed-cooldown-fill');
    if (bar){bar.classList.remove('hidden');fill.style.width='0%';}
    let elapsed=0;
    const intv=setInterval(()=>{
      elapsed+=100;
      const pct=Math.min(100,elapsed/total*100);
      if (fill) fill.style.width=pct+'%';
      if (elapsed>=total){clearInterval(intv);card.classList.remove('seed-cooling');if(bar)bar.classList.add('hidden');}
    },100);
  }

  _updateSeedBankAffordability() {
    document.querySelectorAll('.seed-card').forEach(card=>{
      const data=PLANTS[card.dataset.type];
      card.classList.toggle('seed-unaffordable',data&&this.suns<data.cost);
    });
    this._updateSynergyHints();
    this._updateFusionHints();
  }

  _updateFusionHints() {
    if (typeof FUSIONS === 'undefined') return;
    const onBoard = new Set(this._plants.filter(p=>!p.dead).map(p=>p.typeId));

    document.querySelectorAll('.seed-card[data-type]').forEach(card => {
      const typeId = card.dataset.type;
      let matchedFusion = null;
      onBoard.forEach(boardType => {
        if (matchedFusion) return;
        const key = `${boardType}+${typeId}`;
        if (FUSIONS[key]) matchedFusion = FUSIONS[key];
      });

      card.classList.toggle('seed-fusion-hint', !!matchedFusion);
      let fbadge = card.querySelector('.fusion-hint-badge');
      if (matchedFusion) {
        card.style.setProperty('--fusion-color', '#ff4081');
        if (!fbadge) {
          fbadge = document.createElement('div');
          fbadge.className = 'fusion-hint-badge';
          fbadge.title = matchedFusion.label;
          card.appendChild(fbadge);
        }
        fbadge.textContent = '⚗️';
      } else if (fbadge) {
        fbadge.remove();
      }
    });
  }

  _updateSynergyHints() {
    if (typeof SYNERGIES === 'undefined') return;
    // Recoger todos los tipos de plantas actualmente en el tablero
    const onBoard = new Set(this._plants.filter(p=>!p.dead).map(p=>p.typeId));

    // Para cada tarjeta de semilla, revisar si alguna planta en el tablero
    // forma sinergia con ella
    document.querySelectorAll('.seed-card[data-type]').forEach(card => {
      const typeId = card.dataset.type;
      let matchedSyn = null;
      let matchedPartner = null;

      onBoard.forEach(boardType => {
        if (matchedSyn) return;
        const key = `${typeId}+${boardType}`;
        if (SYNERGIES[key]) { matchedSyn = SYNERGIES[key]; matchedPartner = boardType; }
      });

      card.classList.toggle('seed-synergy-hint', !!matchedSyn);

      if (matchedSyn) {
        card.style.setProperty('--syn-color', matchedSyn.color);
        // Actualizar o crear el badge de sinergia dentro de la tarjeta
        let badge = card.querySelector('.syn-hint-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'syn-hint-badge';
          card.appendChild(badge);
        }
        const partnerEmoji = PLANTS[matchedPartner]?.emoji || '✨';
        badge.textContent = partnerEmoji;
        badge.title = `${matchedSyn.label}: ${matchedSyn.desc}`;
      } else {
        const badge = card.querySelector('.syn-hint-badge');
        if (badge) badge.remove();
      }
    });
  }

  _buildHelperButtons() {
    const btns=document.getElementById('helper-buttons');
    if (btns) btns.innerHTML='';
    this._updateHelperButtons();
  }

  // ── HUD ──────────────────────────────────────
  _updateHUD() {
    if (this.hudSunsEl) this.hudSunsEl.textContent=this.suns;
    if (this.hudStarsEl) this.hudStarsEl.textContent=this.helperStars.toLocaleString('es-ES');
    if (this.hudScoreEl) this.hudScoreEl.textContent=this.score.toLocaleString('es-ES');
    this._updateHelperButtons();
    const lv=LEVELS[this.currentLevel];
    if (this.hudWaveEl&&lv){
      this.hudWaveEl.textContent=this.waveActive?`${this.waveIndex+1}/${lv.waves.length}`:
        (this.waveIndex>=lv.waves.length?'¡Listo!':'...');
    }
  }

  // ── Wave banner / Toast ──────────────────────
  _showWaveBanner(n,total,isFinal,title='') {
    const el=document.getElementById('wave-banner');
    if (!el) return;
    const txt = title || (isFinal?`🚨 ¡OLEADA FINAL! 🚨`:`🌊 Oleada ${n} de ${total}`);
    el.textContent = txt;
    const isHorde = /HORDA/i.test(txt);
    el.className=`wave-banner${isFinal?' wave-final':''}${isHorde?' wave-horde':''}`;
    el.classList.remove('hidden');
    setTimeout(()=>el.classList.add('hidden'),3500);
  }

  _showToast(msg,type='info',ms=2500) {
    const el=document.getElementById('game-toast');
    if (!el) return;
    el.textContent=msg; el.className=`game-toast toast-${type}`;
    el.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer=setTimeout(()=>el.classList.add('hidden'),ms);
  }

  // ── Victoria / Derrota ───────────────────────
  _victory() {
    if (this.gameOver) return;
    this.gameOver=true; this.running=false;
    AUDIO.music('off');
    // Evaluar estrellas
    const stars=STORAGE.computeStars(this.score,this.currentLevel);
    STORAGE.setStarsForLevel(this.currentLevel,stars);
    STORAGE.addScore(this.playerName,this.score,this.currentLevel+1);
    STORAGE.deleteSave();
    STORAGE.addStat('levelsCompleted');
    // Logros de nivel
    if (this.currentLevel===0) this._earnLogro('primer_paso');
    if (this.currentLevel===LEVELS.length-1) this._earnLogro('maestro_jardin');
    if (stars===3) this._earnLogro('estrella');
    if (this.tostadorasUsedCount===0) this._earnLogro('sin_tostadora');
    // Check all 3 levels 3-star
    const allStars=STORAGE.getTotalStars();
    if (allStars>=LEVELS.length*3) this._earnLogro('completista');
    // Stats
    STORAGE.addStat('zombiesKilled',this.zombiesKilledRun);
    STORAGE.addStat('sunsCollected',this.sunsCollectedRun);

    AUDIO.play('levelClear');
    const hasNext=this.currentLevel<LEVELS.length-1;
    window._carryStars = hasNext ? Math.floor(this.helperStars * 0.7) : 0;
    window._carrySuns  = hasNext ? Math.floor(this.suns * 0.7) : 0;
    if (!hasNext) AUDIO.play('victory');
    setTimeout(()=>{
      const endEl=document.getElementById('screen-level-end');
      if (endEl){
        // Pantalla de fin de nivel
        document.getElementById('level-end-emoji').textContent=hasNext?'🎉':'🏆';
        document.getElementById('level-end-title').textContent=hasNext?'¡Nivel Superado!':'¡¡VICTORIA TOTAL!!';
        document.getElementById('level-end-name').textContent=LEVELS[this.currentLevel].name;
        document.getElementById('level-end-score').textContent=`⭐ ${this.score.toLocaleString('es-ES')} pts`;
        // Stars
        const starsEl=document.getElementById('stars-display');
        if (starsEl){
          starsEl.innerHTML='';
          for (let s=1;s<=3;s++){
            const span=document.createElement('span');
            span.className='star-item'+(s<=stars?' earned':'');
            span.textContent='⭐';
            starsEl.appendChild(span);
            if (s<=stars) setTimeout(()=>span.classList.add('earned'),s*300);
          }
        }
        // Star sounds
        for (let s=0;s<stars;s++){
          setTimeout(()=>AUDIO.play('star'+(s+1)),s*350+200);
        }
        // Badges
        const badgesEl=document.getElementById('level-end-badges');
        if (badgesEl){
          badgesEl.innerHTML='';
          const earned=STORAGE.getLogrosEarned();
          const justEarned=STORAGE.getLogrosDef().filter(l=>earned.includes(l.id));
          justEarned.slice(-4).forEach((l,i)=>{
            const s=document.createElement('span');
            s.className='badge-earned';s.textContent=l.emoji;s.title=l.title;
            s.style.animationDelay=(i*0.15)+'s';
            badgesEl.appendChild(s);
          });
        }
        // Nextbtn
        const nextBtn=document.getElementById('btn-level-next');
        if (nextBtn) nextBtn.style.display=hasNext?'':'none';
        endEl.classList.add('active');
        // Hook para tip post-nivel
        if (typeof window._injectLevelTip === 'function') window._injectLevelTip(this.currentLevel, hasNext);
      }
      if (stars>=2) _launchConfetti();
    },1200);
  }

  _defeat() {
    if (this.gameOver) return;
    this.gameOver=true; this.running=false;
    AUDIO.music('off'); AUDIO.play('defeat');
    STORAGE.addScore(this.playerName,this.score,this.currentLevel+1);
    setTimeout(()=>{
      const el=document.getElementById('screen-defeat');
      if (el){
        document.getElementById('def-score').textContent=this.score.toLocaleString('es-ES');
        el.classList.add('active');
      }
    },800);
  }

  // ── Pausa / Guardar ──────────────────────────
  pause(){this.paused=true;AUDIO.music('off');}
  resume(){
    this.paused=false;
    const lv=LEVELS[this.currentLevel];
    AUDIO.music(lv&&lv.music?lv.music:'eerie');
    this.lastTs=performance.now();
  }

saveGame(){
  const payload={
    version:'2.5',
    level:this.currentLevel,
    suns:this.suns,
    score:this.score,
    helperStars:this.helperStars,
    waveIndex:this.waveIndex,
    waveActive:this.waveActive,
    waveSpawnTimer:this._waveSpawnTimer,
    prepTimer:this.prepTimer,
    prepTotal:this._prepTotal,
    playerName:this.playerName,
    tostadoras:this.tostadoras,
    defenders:this.defenders,
    skyTimer:this._skyTimer,
    helperCooldowns:this.helperCooldowns,
    nextId:this._id,
    queue:this._zombieSpawnQueue,
    plants:this._plants.filter(p=>!p.dead).map(p=>({
      typeId:p.typeId,row:p.row,col:p.col,hp:p.hp,maxHp:p.maxHp,
      fireTimer:p.fireTimer,sunTimer:p.sunTimer,activated:p.activated,
      eating:p.eating,eatCooldown:p.eatCooldown,eatTargetId:p.eatTargetId,
      armed:p.armed,armTimer:p.armTimer
    })),
    zombies:this._zombies.filter(z=>!z.dead).map(z=>({
      typeId:z.typeId,row:z.row,x:z.x,hp:z.hp,maxHp:z.maxHp,
      speed:z.speed,currentSpeed:z.currentSpeed,state:z.state,
      eatTimer:z.eatTimer,slowTimer:z.slowTimer,hasJumped:z.hasJumped,
      minionSpawned:z.minionSpawned,flies:z.flies,popBalloon:z.popBalloon,
      hypnotized:z.hypnotized,
      eatTarget:z.eatTarget?{row:z.eatTarget.row,col:z.eatTarget.col}:null
    })),
    specials:this._specials.filter(s=>!s.dead).map(s=>({
      type:s.type,row:s.row,col:s.col,x:s.x,y:s.y,duration:s.duration,elapsed:s.elapsed,fireTimer:s.fireTimer
    })),
    pickups:this._sunOrbs.filter(o=>!o.collected).map(o=>({id:o.id,kind:o.kind,x:o.x,y:o.y,tx:o.tx,ty:o.ty,amount:o.amount,falling:o.falling,lifetime:o.lifetime}))
  };
  const ok=STORAGE.save(payload);
  this._showToast(ok?'💾 ¡Guardado real del avance!':'⚠️ No se pudo guardar','success');
}

// ── Reset ────────────────────────────────────
  _reset() {
    cancelAnimationFrame(this.raf);
    if (window._gameResizeHandler) window.removeEventListener('resize',window._gameResizeHandler);
    this.board=Array.from({length:5},()=>Array(9).fill(null));
    this._plants.forEach(p=>p.el&&p.el.remove());
    this._zombies.forEach(z=>z.el&&z.el.remove());
    this._projectiles.forEach(p=>p.el&&p.el.remove());
    this._sunOrbs.forEach(o=>o.el&&o.el.remove());
    this._specials.forEach(s=>s.el&&s.el.remove());
    this._plants=[];this._zombies=[];this._projectiles=[];
    this._sunOrbs=[];this._specials=[];this._zombieSpawnQueue=[];
    this.waveActive=false;this._zombieAtBoard=false;
    this.tostadoras=[true,true,true,true,true];this.tostadorasUsedCount=0;
    this.defenders=Array.from({length:this.ROWS},()=>({hp:120,maxHp:120,spent:false}));
    this.selectedHelper=null;
    this.helperCooldowns=Object.fromEntries(Object.keys(HELPERS).map(k=>[k,0]));
    this._skyTimer=7500;

    // ── Prize system ─────────────────────────────────
    this._prizes=[];             // active prizes on tray
    this._prizeTimer=0;
    this._selectedPrize=null;
    this._scoreLastPrize=0;
    this._sunsLastPrize=0;
    this._killsLastPrize=0;this._waveSpawnTimer=0;
    this.gameOver=false;this.paused=false;
    this.helperStars=0;
    this._comboCount=0;this._comboTimer=0;
    this.zombiesKilledRun=0;this.sunsCollectedRun=0;this.maxCombo=0;
    if (this.boardEl) { this.boardEl.innerHTML=''; this.boardEl.dataset.world=''; }
    this._prizes=[]; this._selectedPrize=null;
    this._scoreLastPrize=0; this._sunsLastPrize=0; this._killsLastPrize=0;
    const pt=document.getElementById('prize-tray'); if(pt) pt.innerHTML='';
  }


  _restoreState(s) {
    const lv=LEVELS[this.currentLevel];
    this.suns=s.suns ?? lv.startSuns;
    this.score=s.score ?? 0;
    this.helperStars=s.helperStars ?? 0;
    this.waveIndex=s.waveIndex ?? 0;
    this.waveActive=!!s.waveActive;
    this._waveSpawnTimer=s.waveSpawnTimer ?? 0;
    this.playerName=s.playerName||'Jugador';
    this.prepTimer=(typeof s.prepTimer==='number') ? s.prepTimer : (s.waveIndex===0?lv.prepTime*1000:0);
    this._prepTotal=s.prepTotal || (lv.prepTime*1000);
    this.tostadoras=Array.isArray(s.tostadoras)?s.tostadoras:[true,true,true,true,true];
    this.defenders=Array.isArray(s.defenders)&&s.defenders.length===this.ROWS ? s.defenders : Array.from({length:this.ROWS},(_,i)=>({hp:this.tostadoras[i]?120:0,maxHp:120,spent:!this.tostadoras[i]}));
    this._skyTimer=s.skyTimer ?? 7500;
    this.helperCooldowns = Object.fromEntries(Object.keys(HELPERS).map(k=>[k, s.helperCooldowns?.[k] ?? 0]));
    this.helperCooldowns.emilia = s.helperCooldowns?.emilia ?? s.emiliaCooldown ?? this.helperCooldowns.emilia ?? 0;
    this.helperCooldowns.papa = s.helperCooldowns?.papa ?? s.superpapaCooldown ?? this.helperCooldowns.papa ?? 0;
    this._id=s.nextId || this._id;
    this._zombieSpawnQueue=Array.isArray(s.queue)?s.queue.slice():[];

    if (Array.isArray(s.plants)) {
      s.plants.forEach(p=>{
        if(!PLANTS[p.typeId]) return;
        const plant=this._placePlant(p.row,p.col,p.typeId);
        plant.hp=p.hp ?? plant.hp;
        plant.maxHp=p.maxHp ?? plant.maxHp;
        plant.fireTimer=p.fireTimer ?? plant.fireTimer;
        plant.sunTimer=p.sunTimer ?? plant.sunTimer;
        plant.activated=!!p.activated;
        plant.armed = (typeof p.armed==='boolean') ? p.armed : plant.armed;
        plant.armTimer = p.armTimer ?? plant.armTimer;
        if (plant.armed && plant.el && PLANTS[p.typeId]?.mine) plant.el.classList.add('plant-mine-armed');
        plant.eating=!!p.eating;
        plant.eatCooldown=p.eatCooldown ?? 0;
        plant.eatTargetId=p.eatTargetId ?? null;
        if (plant.hp < plant.maxHp) this._damagePlant(plant,0);
      });
    }

    if (Array.isArray(s.zombies)) {
      s.zombies.forEach(zs=>{
        if(!ZOMBIES[zs.typeId]) return;
        const z=this._spawnZombie(zs.typeId,zs.row);
        if(!z) return;
        z.x=zs.x ?? z.x;
        z.hp=zs.hp ?? z.hp;
        z.maxHp=zs.maxHp ?? z.maxHp;
        z.speed=zs.speed ?? z.speed;
        z.currentSpeed=zs.currentSpeed ?? z.currentSpeed;
        z.state=zs.state || 'walking';
        z.eatTimer=zs.eatTimer ?? 0;
        z.slowTimer=zs.slowTimer ?? 0;
        z.hasJumped=!!zs.hasJumped;
        z.minionSpawned=!!zs.minionSpawned;
        z.flies=!!zs.flies;
        z.popBalloon=!!zs.popBalloon;
        z.hypnotized=!!zs.hypnotized;
        if (z.el) {
          z.el.style.left=(z.x-25)+'px';
          if (z.hypnotized) z.el.classList.add('zombie-ally');
          if (z.flies && !z.popBalloon) z.el.classList.add('zombie-flies');
        }
        if (zs.eatTarget) {
          const p=this.board[zs.eatTarget.row]?.[zs.eatTarget.col] || null;
          if (p) z.eatTarget=p;
        }
        if (z.hp < z.maxHp) this._damageZombie(z,0);
      });
    }

    if (Array.isArray(s.pickups)) {
      s.pickups.forEach(pk=>{
        const orb=this._createPickup(pk.kind||'sun', pk.x, pk.y, pk.tx, pk.ty, pk.amount||25);
        if (!orb) return;
        orb.id = pk.id ?? orb.id;
        orb.falling = !!pk.falling;
        orb.lifetime = pk.lifetime ?? orb.lifetime;
        if (orb.el) {
          orb.el.style.left=orb.x+'px';
          orb.el.style.top=orb.y+'px';
        }
      });
    }


    if (Array.isArray(s.specials)) {
      s.specials.forEach(ss=>{
        const cfg=HELPERS?.[ss.type];
        if (!cfg) return;
        const el=document.createElement('div');
        el.className='special-char';
        el.dataset.helper=ss.type;
        el.textContent=cfg.emoji;
        el.style.left=(ss.x ?? (ss.col*this.CELL_W + this.CELL_W/2 - 18))+'px';
        el.style.top=(ss.y ?? (ss.row*this.CELL_H + 8))+'px';
        this.boardEl.appendChild(el);
        this._specials.push({
          id:this._id++,
          type:ss.type,row:ss.row,col:ss.col,
          x:ss.x ?? (ss.col*this.CELL_W + this.CELL_W/2 - 18),
          y:ss.y ?? (ss.row*this.CELL_H + 8),
          el, dead:false,
          duration:ss.duration ?? cfg.duration,
          elapsed:ss.elapsed ?? 0,
          fireTimer:ss.fireTimer ?? 0
        });
      });
    }

    this._updateDefenderHUD();
    this._updateSeedBankAffordability();
  }
}

