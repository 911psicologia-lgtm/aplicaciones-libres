window.SF = window.SF || {};
(function(NS){
  const C = NS.config;
  const UI = ()=>NS.ui;
  const S = ()=>NS.storage;
  const A = ()=>NS.audio;
  const E = ()=>NS.economy;
  const M = ()=>NS.reactiveMatrix;

  const G = {
    canvas:null, ctx:null, w:0, h:0, dpr:1,
    mode:'menu', running:false, paused:false,
    player:'', shipId:null, ship:null,
    sector:1, wave:1, score:0, nextLifeAt:C.progression.extraLifeEvery,
    hp:10, maxHp:10, lives:3, invulnUntil:0,
    px:0, py:0, pw:34, ph:50, vx:0, vy:0,
    keys:{}, pointer:{active:false,x:0,y:0},
    enemies:[], playerBullets:[], enemyBullets:[], particles:[], texts:[], powerDrops:[], gemDrops:[], rewardPods:[], obstacles:[], bossRewards:[], attachedRelics:[], enemyGraveyard:[],
    formation:{x:0,y:0,vx:84,dir:1,width:0,height:0},
    phase:'wave', phaseName:'FORMACIÓN', subphase:0, checkpointWave:1, checkpoint:null,
    timers:{fire:0, enemyFire:0, dive:0, save:0, reward:0, hitFx:0},
    stars:[], shake:0, combo:0, comboUntil:0,
    activePowers:{spread:0, shield:0, chain:0, missile:0, overdrive:0, drone:0, magnet:0},
    backgroundTick:0, lastTs:0, bgOffset:0,
    lowFx:false, threatPulseUntil:0, layout:null, gameOver:false, lifeLost:false, engageAfter:0,
    waveStartAt:0, waveDamageTaken:0, maxComboWave:0, tutorialStep:0, autoPaused:false, pauseStartedAt:0, bossAugments:{damage:0,fireRate:0,speed:0,maxHp:0,magnet:0,maxLives:0}, relicLevels:{spread:0,shield:0,chain:0,missile:0,overdrive:0,heal:0,life:0,drone:0}, rewardPending:false, sectorMutator:null, objective:null, fusion:{id:'',until:0,color:'#fff',label:''}, fusionCooldowns:{}, droneAngle:0, droneLastShot:0, eliteKillsWave:0, meteorKillsWave:0, podsOpenedWave:0, rewardStartedAt:0, rewardTransitionAt:0, sectorTransitionLock:false, lastError:'', recoveryCount:0, microSwarmNextAt:0, microSwarmBursts:0, microSwarmSerial:0, webSlowUntil:0, bossDeathFx:null, bossSupplyNextAt:0, bossSuppliesGiven:0, bossPreludeStartAt:0, bossPreludeEndAt:0, bossPreludeNextBurstAt:0, bossPreludeBurstCount:0, matrixSupportCount:0, matrixSupportNextAt:0, matrixState:'M1', bossAllyWorld:0, bossAllyActiveUntil:0, bossAllyReadyAt:0, bossAllyLastShot:0
  };

  function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function rectHit(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function circleRect(cx,cy,r,rect){ const nx=clamp(cx,rect.x,rect.x+rect.w), ny=clamp(cy,rect.y,rect.y+rect.h); const dx=cx-nx, dy=cy-ny; return dx*dx+dy*dy<=r*r; }

  function directorState(now=performance.now()){
    const hpRatio=G.maxHp?G.hp/G.maxHp:1;
    const elapsed=Math.max(0,now-(G.waveStartAt||now));
    const ramp=clamp(elapsed/22000,0,1);
    let fireMul=1-(ramp*.10), diveMul=1-(ramp*.08), intensity=1+ramp*.12;
    if(hpRatio<=C.combatDirector.lowHpRatio || G.lives<=1){ fireMul*=C.combatDirector.mercyFireMul; diveMul*=C.combatDirector.mercyDiveMul; intensity*=.9; }
    if(G.combo>=C.combatDirector.hotCombo && hpRatio>.5){ fireMul*=C.combatDirector.hotFireMul; intensity*=1.05; }
    return {hpRatio,fireMul:clamp(fireMul,.78,1.45),diveMul:clamp(diveMul,.82,1.5),intensity:clamp(intensity,.82,C.combatDirector.maxIntensity)};
  }

  function difficultyProfile(){
    const worlds=C.difficultyCurve?.worlds||[];
    const w=worlds[Math.min(worlds.length-1,Math.max(0,G.sector-1))]||{hp:1,speed:1,fireCd:1,subbossHp:1,bossHp:1,bossFireCd:1,eliteChance:1};
    const wave=(C.difficultyCurve?.waves||{})[G.wave]||{hp:1,speed:1,fireCd:1,eliteMul:1};
    const mobile=!!G.layout?.portrait && G.w<=520;
    const low=G.maxHp && G.hp/G.maxHp<=C.combatDirector.lowHpRatio;
    return {
      enemyHp:w.hp*wave.hp*(mobile?(C.difficultyCurve?.mobileEnemyHpMul||1):1),
      enemySpeed:w.speed*wave.speed*(low?(C.difficultyCurve?.lowHpGraceSpeedMul||1):1),
      fireCd:w.fireCd*wave.fireCd*(mobile?(C.difficultyCurve?.mobileFireCdMul||1):1)*(low?(C.difficultyCurve?.lowHpGraceFireCdMul||1):1),
      subbossHp:w.subbossHp*(mobile?(C.difficultyCurve?.mobileEnemyHpMul||1):1),
      bossHp:w.bossHp*(mobile?(C.difficultyCurve?.mobileBossHpMul||1):1),
      bossFireCd:w.bossFireCd*(mobile?(C.difficultyCurve?.mobileFireCdMul||1):1)*(low?(C.difficultyCurve?.lowHpGraceFireCdMul||1):1),
      eliteChance:w.eliteChance*(wave.eliteMul||1)
    };
  }

  function playerHitScale(){ return (G.ship?.hitbox || 1) * (G.layout?.playerHitboxScale || 1); }
  function enemyHitRect(e){ const pad=(G.layout?.enemyHitPad||0)*(e.role==='boss'?1.3:e.role==='miniboss'?1.15:1); return {x:e.x-pad,y:e.y-pad,w:e.w+pad*2,h:e.h+pad*2}; }
  function pickupRect(p){ const mul=(G.layout?.pickupMagnetBonus||1); const w=p.w*mul, h=p.h*mul; return {x:p.x-w/2,y:p.y-h/2,w,h}; }
  function profileHullBonus(){ return E()?.upgradeLevel?.('hull')||0; }
  function profileWeaponMul(){ return 1+(E()?.upgradeLevel?.('weapon')||0)*.035; }
  function profileMagnetMul(){ return 1+(E()?.upgradeLevel?.('magnet')||0)*.12; }
  function profilePowerMul(){ return 1+(E()?.upgradeLevel?.('power')||0)*.10; }
  function profileSpeedMul(){ return 1+(E()?.upgradeLevel?.('thruster')||0)*.04; }
  function profileFireRateMul(){ return Math.max(.78,1-(E()?.upgradeLevel?.('firerate')||0)*.03); }
  function profileArmorMul(){ return Math.max(.72,1-(E()?.upgradeLevel?.('armor')||0)*.05); }
  function droneCount(){ return Math.max(1,Math.min(C.allyDrone?.maxPurchased||4,1+(E()?.upgradeLevel?.('dronebay')||0))); }
  function highestDefeatedBoss(){ const d=E()?.state?.().bossesDefeated||{}; return Object.keys(d).filter(k=>d[k]).map(Number).filter(Number.isFinite).sort((a,b)=>b-a)[0]||0; }

  function matrixBuildSnapshot(now=performance.now()){
    const ep=E()?.state?.()||{};
    const over=now<(G.activePowers.overdrive||0), spread=now<(G.activePowers.spread||0), missile=now<(G.activePowers.missile||0), chain=now<(G.activePowers.chain||0), drone=now<(G.activePowers.drone||0), shield=now<(G.activePowers.shield||0);
    const overMul=over ? .75:1;
    const fireInterval=G.ship.fireRate*Math.max(.68,1-(G.bossAugments.fireRate||0))*overMul*profileFireRateMul();
    const primaryDamage=G.ship.damage*(1+(G.bossAugments.damage||0))*profileWeaponMul();
    const projectileFactor=spread?2.30:1;
    const secondaryFactor=1+(missile ? .35:0)+(chain ? .22:0)+(drone ? .28:0);
    return {
      shipId:G.shipId,shipName:G.ship?.name||G.shipId,primaryDamage,fireInterval,critChance:0,projectileFactor,secondaryFactor,
      speed:(G.ship?.speed||0)*profileSpeedMul(),maxHp:G.maxHp,lives:G.lives,shieldActive:shield,combo:G.combo,
      recentDamageRatio:G.maxHp?G.waveDamageTaken/G.maxHp:0,
      activePowers:{spread,shield,chain,missile,overdrive,drone},upgrades:{...(ep.upgrades||{})},inventory:{...(ep.inventory||{})},
      bossPowers:Object.keys(ep.bossPowers||{}),bossAugments:{...G.bossAugments},relicLevels:{...G.relicLevels}
    };
  }
  function matrixBossDefenseHp(e){
    if(!e) return 0;
    const modules=(e.armorNodes||[]).filter(n=>n.alive).reduce((a,n)=>a+Math.max(0,n.hp||0),0);
    const hard=(e.hardpoints||[]).filter(h=>h.alive).reduce((a,h)=>a+Math.max(0,h.hp||0),0);
    return Math.max(0,e.fortressHp||0)+modules+hard;
  }
  function chooseMatrixSupportKind(now=performance.now()){
    const hpRatio=G.maxHp?G.hp/G.maxHp:1;
    const useful=now<(G.activePowers.missile||0)||now<(G.activePowers.chain||0)||now<(G.activePowers.drone||0);
    if(hpRatio<.38) return Math.random()<.62?'heal':'shield';
    if(!useful) return Math.random()<.5?'missile':'chain';
    if((G.ship?.speed||430)<395) return 'overdrive';
    return Math.random()<.45?'overdrive':'shield';
  }
  function maybeMatrixSupport(rm,boss,now){
    if(!rm||rm.state!=='M0'||C.reactiveMatrix?.mode!=='assist') return;
    if((G.matrixSupportCount||0)>=(C.reactiveMatrix.supportSupplyMaxPerFight||2) || now<(G.matrixSupportNextAt||0)) return;
    const kind=chooseMatrixSupportKind(now), x=G.w*(.28+Math.random()*.44), y=Math.max(96,G.h*.22);
    spawnPowerDrop(x,y,kind,'matrixSupport');
    G.matrixSupportCount=(G.matrixSupportCount||0)+1;
    G.matrixSupportNextAt=now+(C.reactiveMatrix.supportSupplyCooldownMs||8500);
    M()?.noteSupplyOffered?.(kind,'matrixSupport'); M()?.noteIntervention?.('support',1,{kind});
    UI().flashMsg(`MATRIX SUPPORT · ${C.powers[kind]?.label||kind}`,760);
    addText(x,y-18,'APOYO TÁCTICO','#9dffb3',900,0,-11,true);
  }
  function applyMatrixBossResponse(rm,boss,now){
    if(!boss) return;
    const active=C.reactiveMatrix?.mode==='assist' && (rm?.state==='M2' || (rm?.state==='M3'&&C.reactiveMatrix.dominanceUsesOverdriveFloor));
    const mitigation=active?(C.reactiveMatrix.overdriveMitigation||.88):1;
    const was=boss.matrixMitigation||1; boss.matrixMitigation=mitigation; boss.matrixMoveMul=active?(C.reactiveMatrix.overdriveMoveMul||1.07):1;
    if(active && was===1){
      boss.nextSignatureAt=Math.min(boss.nextSignatureAt||Infinity,now+(C.reactiveMatrix.overdriveSignatureLeadMs||1250));
      M()?.noteIntervention?.('mitigation',1-mitigation,{state:rm?.state||'M2'});
      UI().flashMsg('REACTIVE ARMOR · CONTRAMEDIDAS',820);
      addText(boss.x+boss.w/2,boss.y+boss.h*.16,'ARMADURA REACTIVA','#ffe27a',900,0,-12,true);
    }
    if(!active && was<1){ UI().flashMsg('REACTIVE MATRIX · NOMINAL',620); }
  }
  function updateReactiveMatrix(now=performance.now()){
    if(!C.reactiveMatrix?.enabled||!['shadow','assist'].includes(C.reactiveMatrix.mode)||G.phase!=='boss') return;
    const boss=G.enemies.find(e=>e.alive&&e.role==='boss'); if(!boss) return;
    const rm=M()?.update?.({bossHp:boss.hp,defenseHp:matrixBossDefenseHp(boss),hpRatio:G.maxHp?G.hp/G.maxHp:1,mobilityIndex:(G.ship?.speed||430)/430,
      hasUsefulSecondary:now<(G.activePowers.missile||0)||now<(G.activePowers.chain||0)||now<(G.activePowers.drone||0),combo:G.combo,
      damageReceivedRatio:G.maxHp?G.waveDamageTaken/G.maxHp:0},now);
    if(!rm) return;
    maybeMatrixSupport(rm,boss,now);
    applyMatrixBossResponse(rm,boss,now);
    G.matrixState=rm.state||'M1';
  }

  function reflowWorldOnResize(){
    const margin=G.layout?.sideMargin||12;
    for(const o of G.obstacles){ if(o.motion==='static') o.x=clamp(o.x,margin+o.r,G.w-margin-o.r); else o.x=clamp(o.x,-o.r*1.6,G.w+o.r*1.6); o.y=clamp(o.y,G.h*.38,G.h*.74); }
    for(const p of G.rewardPods){ p.x=clamp(p.x,margin+p.w,G.w-margin-p.w); p.y=clamp(p.y,G.h*.28,G.h*.78); }
    for(const p of G.powerDrops){ p.x=clamp(p.x,margin+p.w,G.w-margin-p.w); }
    for(const e of G.enemies){ if(e.role!=='formation' && e.role!=='diver'){ e.x=clamp(e.x,8,G.w-e.w-8); e.y=clamp(e.y,44,G.h*.48); } }
  }

  function shiftGameClocks(delta){
    if(!delta||delta<1) return;
    G.waveStartAt+=delta; G.engageAfter+=delta; G.comboUntil+=delta;
    for(const k of Object.keys(G.activePowers)) if(G.activePowers[k]>0) G.activePowers[k]+=delta;
    for(const e of G.enemies){
      if(e.nextShot) e.nextShot+=delta; if(e.specialNextShot) e.specialNextShot+=delta; if(e.chargeStart) e.chargeStart+=delta; if(e.chargeUntil) e.chargeUntil+=delta; if(e.summonAt) e.summonAt+=delta;
      if(e.reviveAt) e.reviveAt+=delta; if(e.breedAt) e.breedAt+=delta; if(e.shieldBrokenUntil) e.shieldBrokenUntil+=delta; if(e.coreOpenUntil) e.coreOpenUntil+=delta; if(e.nextCoreAt) e.nextCoreAt+=delta;
      if(e.reviveStart) e.reviveStart+=delta; if(e.signatureUntil) e.signatureUntil+=delta;
      if(e.signatureWindupStart) e.signatureWindupStart+=delta; if(e.signatureWindupUntil) e.signatureWindupUntil+=delta; if(e.nextSignatureAt) e.nextSignatureAt+=delta;
      if(e.counterOpenAt) e.counterOpenAt+=delta; if(e.recoveryUntil) e.recoveryUntil+=delta; if(e.subSignatureNextAt) e.subSignatureNextAt+=delta; if(e.subRecoveryUntil) e.subRecoveryUntil+=delta; if(e.subOpeningSignatureAt) e.subOpeningSignatureAt+=delta; if(e.subPhaseSignatureAt) e.subPhaseSignatureAt+=delta;
      if(e.huntNextAt) e.huntNextAt+=delta; if(e.huntWindupStart) e.huntWindupStart+=delta; if(e.huntWindupUntil) e.huntWindupUntil+=delta; if(e.huntEscapeCheckAt) e.huntEscapeCheckAt+=delta; if(e.coordinatedShotUntil) e.coordinatedShotUntil+=delta;
    }
    for(const r of G.attachedRelics) if(r.until) r.until+=delta;
    if(G.fusion?.until) G.fusion.until+=delta; for(const k of Object.keys(G.fusionCooldowns||{})) if(G.fusionCooldowns[k]>0) G.fusionCooldowns[k]+=delta;
    if(G.droneLastShot) G.droneLastShot+=delta; if(G.droneLastIntercept) G.droneLastIntercept+=delta;
    if(G.bossAllyActiveUntil) G.bossAllyActiveUntil+=delta; if(G.bossAllyReadyAt) G.bossAllyReadyAt+=delta; if(G.bossAllyStartedAt) G.bossAllyStartedAt+=delta; if(G.bossAllyLastShot) G.bossAllyLastShot+=delta;
    if(G.rewardStartedAt) G.rewardStartedAt+=delta; if(G.rewardTransitionAt) G.rewardTransitionAt+=delta;
    if(G.combatPattern?.lastSampleAt) G.combatPattern.lastSampleAt+=delta; if(G.combatPattern?.createdAt) G.combatPattern.createdAt+=delta; if(G.combatPattern?.samples) for(const q of G.combatPattern.samples) q.t+=delta;
    if(G.formation?.coordinationNextAt) G.formation.coordinationNextAt+=delta;
    if(G.timers.fire) G.timers.fire+=delta; if(G.timers.dive) G.timers.dive+=delta; if(G.timers.save) G.timers.save+=delta; if(G.timers.fusionPulse) G.timers.fusionPulse+=delta; if(G.timers.fusionShot) G.timers.fusionShot+=delta;
    M()?.shift?.(delta);
  }

  function computeLayout(){
    const portrait = G.h >= G.w;
    let profile;
    if(portrait && G.w <= C.responsive.mobilePortrait.maxWidth) profile = C.responsive.mobilePortrait;
    else if(portrait) profile = C.responsive.tabletPortrait;
    else if(G.w <= C.responsive.tabletLandscape.maxWidth) profile = C.responsive.tabletLandscape;
    else if(G.w <= C.responsive.desktop.maxWidth) profile = C.responsive.desktop;
    else profile = C.responsive.wideDesktop;

    const isMobilePortrait = portrait && G.w <= C.responsive.mobilePortrait.maxWidth;
    const sideMargin = portrait ? clamp(G.w*.02, 6, 16) : clamp(G.w*.022, 16, 44);
    const widthBoost = isMobilePortrait ? .02 : (portrait ? .01 : (G.w >= 1200 ? .015 : .01));
    const targetWidth = Math.max(220, Math.min(G.w * Math.min(.94, profile.targetWidth + widthBoost), G.w - sideMargin*2));
    const gapX = Math.max(2, profile.gapX);
    const gapY = Math.max(3, profile.gapY);
    const desiredCols = profile.cols + Math.min(2, Math.floor((G.sector-1)/2)) + (G.wave>=4 ? 1 : 0);
    const maxCols = portrait ? C.wave.maxColsPortrait : C.wave.maxColsLandscape;
    const safeEnemyMin = isMobilePortrait ? 21 : (portrait ? Math.min(profile.enemyMin, 30 + G.w*.018) : profile.enemyMin);
    const fitMaxCols = Math.max(6, Math.floor((targetWidth + gapX) / (safeEnemyMin + gapX)));
    const cols = clamp(Math.min(desiredCols, fitMaxCols), 6, maxCols);

    let rawEW = (targetWidth - gapX*(cols-1)) / cols;
    const ew = Math.max(isMobilePortrait?21:20, Math.min(profile.enemyMax, rawEW));
    const eh = ew * .78;
    let rowsBase = profile.rows;
    if(portrait && G.w<=520 && G.h>=760) rowsBase += 1;
    const rows = clamp(rowsBase + Math.floor((G.sector-1)/3) + (G.wave>=4 ? 1 : 0), 4, portrait ? C.wave.maxRowsPortrait : C.wave.maxRowsLandscape);
    const formationWidth = cols*ew + (cols-1)*gapX;
    const startY = portrait ? Math.max(92, G.h*.118) : Math.max(78, G.h*.086);
    const maxFormationY = startY + G.h*(portrait ? C.formation.portraitMaxDriftRatio : C.formation.landscapeMaxDriftRatio);
    return {
      portrait, cols, rows, gapX, gapY, ew, eh, formationWidth,
      startX:(G.w-formationWidth)/2, startY, maxFormationY, sideMargin,
      playerH:profile.playerH,
      bulletScale: clamp(profile.playerH/68, .92, 1.38),
      obstacleScale: portrait ? .9 : (G.w>=1200 ? 1.24 : 1.08),
      enemyBulletCap: portrait ? (G.w<=520?52:68) : (G.w>=1200 ? 136 : 100),
      enemyRenderScale: isMobilePortrait ? 1.10 : (portrait ? 1.08 : (G.w>=1200 ? 1.12 : 1.06)),
      powerScale: isMobilePortrait ? 1.22 : (portrait ? 1.14 : 1.08),
      pickupMagnetBonus: isMobilePortrait ? 1.16 : 1.08,
      playerHitboxScale: isMobilePortrait ? .92 : .96,
      enemyHitPad: isMobilePortrait ? 6 : 8,
      bossRenderScale: portrait ? 1.06 : 1.12,
      subbossRenderScale: portrait ? 1.05 : 1.10
    };
  }

  function formationPatternOffset(pattern,c,r,cols,eh){
    const center=(cols-1)/2, norm=center?Math.abs(c-center)/center:0;
    const amp=(G.layout?.portrait?C.formationPatterns.amplitudePortrait:C.formationPatterns.amplitudeLandscape)*eh;
    if(pattern==='chevron') return norm*amp;
    if(pattern==='split') return (c<center?-1:1)*(r%2?amp*.18:amp*.42) + (c===Math.floor(center)?amp*.2:0);
    if(pattern==='wave') return (Math.sin((c/Math.max(1,cols-1))*Math.PI*2 + r*.7)+1)*amp*.36;
    if(pattern==='stagger') return (c%2)*amp*.48 + (r%2)*amp*.12;
    return 0;
  }

  function reflowFormation(){
    if(!G.layout || !G.enemies.length) return;
    const form = G.enemies.filter(e=>e.alive && e.role==='formation');
    if(!form.length) return;
    const maxCol = Math.max(...form.map(e=>e.col));
    const cols = maxCol + 1;
    const gapX = G.layout.gapX, gapY = G.layout.gapY;
    const targetWidth = Math.min(G.w * (G.layout.portrait ? .92 : .78), G.w-G.layout.sideMargin*2);
    const ew = clamp((targetWidth-gapX*(cols-1))/cols, G.layout.ew*.82, G.layout.ew*1.08);
    const eh = ew*.78;
    const width = cols*ew+(cols-1)*gapX;
    G.formation.x = (G.w-width)/2;
    G.formation.y = clamp(G.formation.y||G.layout.startY, G.layout.startY, G.layout.maxFormationY);
    G.formation.width = width; G.formation.maxY=G.layout.maxFormationY;
    form.forEach(e=>{ e.w=ew; e.h=eh; e.ox=e.col*(ew+gapX); e.patternOffset=formationPatternOffset(G.formation.pattern||'block',e.col,e.row,cols,eh); e.oy=e.row*(eh+gapY)+e.patternOffset; e.renderH=eh*(G.layout?.enemyRenderScale||1.06)*1.32; });
  }

  function currentSectorCfg(){ return C.sectors[(G.sector-1)%C.sectors.length]; }
  function normalizedFamilyWorldId(sector=G.sector){
    if(!C.worldFamilies?.enabled || sector<1) return 0;
    const list=NS.worldContent?.worlds||[];
    const maxIntegrated=Math.min(C.worldFamilies.maxIntegratedWorld||list.length,list.length||0);
    if(!maxIntegrated) return 0;
    if(sector<=maxIntegrated) return sector;
    if(C.worldFamilies?.cycleBeyondIntegrated===false) return 0;
    return ((sector-1)%maxIntegrated)+1;
  }
  function integratedWorld(sector=G.sector){
    const worldId=normalizedFamilyWorldId(sector);
    if(!worldId) return null;
    return NS.assets?.world?.(worldId)||null;
  }
  function familyTactic(worldId=G.sector){
    if(!C.worldFamilyTactics?.enabled) return null;
    const normalized=normalizedFamilyWorldId(worldId);
    return normalized?C.worldFamilyTactics.worlds?.[normalized]||null:null;
  }
  function enemyFamilyWorld(e){ return e?.familyWorld||0; }
  function familyDamageMultiplier(e,now=performance.now()){
    const t=familyTactic(enemyFamilyWorld(e));
    if(!t) return 1;
    if(t.id==='nebula_phase' && now<(e.phaseShieldUntil||0)) return t.phaseDamageMul||.5;
    return 1;
  }
  function initializeFamilyTactic(e,now=performance.now()){
    const t=familyTactic(enemyFamilyWorld(e)); if(!t) return;
    if(t.id==='yautja_hunt' && ['hunter','stinger'].includes(e.familyRole)) e.cloakNextAt=now+rand(t.cloakEvery[0],t.cloakEvery[1]);
    if(t.id==='nebula_phase' && ['phantom_revenant','sentinel','spitter'].includes(e.familyRole)) e.phaseNextAt=now+rand(t.phaseEvery[0],t.phaseEvery[1]);
    if(t.id==='arachnid_web' && e.kind==='breeder') e.breedAt=now+C.enemyEcology.breederIntervalMs*(t.breederMul||1)*rand(.86,1.12);
  }
  function updateFamilyTactic(e,dt,now){
    const t=familyTactic(enemyFamilyWorld(e)); if(!t) return;
    if(t.id==='yautja_hunt' && e.role==='formation' && ['hunter','stinger'].includes(e.familyRole)){
      if(now>(e.cloakNextAt||Infinity)){
        e.cloakStart=now; e.cloakUntil=now+(t.cloakMs||1050); e.cloakDir=Math.random()<.5?-1:1;
        e.cloakNextAt=e.cloakUntil+rand(t.cloakEvery[0],t.cloakEvery[1]);
      }
    }
    if(t.id==='nebula_phase' && e.role==='formation' && ['phantom_revenant','sentinel','spitter'].includes(e.familyRole)){
      if(now>(e.phaseNextAt||Infinity)){
        e.phaseShieldUntil=now+(t.phaseMs||900); e.phaseNextAt=e.phaseShieldUntil+rand(t.phaseEvery[0],t.phaseEvery[1]);
      }
    }
  }
  function worldRoleForKind(kind){
    return ({raider:'swarmer',striker:'stinger',gunner:'spitter',sentinel:'sentinel',reanimator:'phantom_revenant',breeder:'hunter',diver:'hunter',drone:'swarmer'}[kind]||'swarmer');
  }
  function chooseFamilyVisual(kind,row=0,col=0){
    const current=integratedWorld(G.sector); if(!current) return null;
    const carry=(G.sector>1 && G.wave>=2 && integratedWorld(G.sector-1))?(C.worldFamilies.carryoverRatio||0):0;
    const desired=C.worldFamilies.currentRatioByWave?.[G.wave] ?? .52;
    const currentRatio=Math.min(desired,1-carry-(C.worldFamilies.legacyRatioFloor||.18));
    // La elección se hace una sola vez al crear el enemigo; no cambia durante el render.
    const roll=Math.random();
    const role=worldRoleForKind(kind);
    if(roll<currentRatio && current.minions?.[role]) return {worldId:normalizedFamilyWorldId(G.sector),role};
    if(roll<currentRatio+carry){ const prev=integratedWorld(G.sector-1); if(prev?.minions?.[role]) return {worldId:normalizedFamilyWorldId(G.sector-1),role}; }
    return null; // conserva el asset original detallado como parte de la ecología heredada.
  }
  function familyFrame(sheet,frames,now,seed=0,fps=8){
    if(!sheet||!sheet.width||frames<=1) return 0;
    return Math.floor(now/1000*fps+seed)%frames;
  }
  function drawHorizontalSheet(ctx,sheet,frames,frame,x,y,w,h,alpha=1,rot=0){
    if(!sheet||!sheet.width||!sheet.height||frames<1) return false;
    const fw=sheet.width/frames, fh=sheet.height;
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x,y); if(rot) ctx.rotate(rot);
    ctx.drawImage(sheet,frame*fw,0,fw,fh,-w/2,-h/2,w,h); ctx.restore(); return true;
  }
  function selectSectorMutator(){
    const list=C.sectorMutators?.sequence||[];
    G.sectorMutator=list.length?list[(G.sector-1)%list.length]:null;
    return G.sectorMutator;
  }
  function objectiveText(){
    const o=G.objective; if(!o) return 'OBJ —';
    if(o.done) return `OBJ ✓ ${o.short||o.label.replace('OBJETIVO · ','')}`;
    return `${o.label} ${Math.min(o.progress||0,o.target)}/${o.target}`;
  }
  function initObjective(){
    const pools=C.tacticalObjectives?.pools||{};
    const pool=pools[G.wave]||[];
    const def=pool.length ? pool[(G.sector-1)%pool.length] : null;
    G.objective=def?{...def,progress:0,done:false,short:def.label.replace('OBJETIVO · ','')}:null;
    if(G.objective) setTimeout(()=>{ if(G.running&&!G.gameOver) UI().flashMsg(G.objective.label,900); },520);
  }
  function completeObjective(){
    const o=G.objective; if(!o||o.done) return;
    o.done=true; G.score+=C.tacticalObjectives.bonusScore*G.sector; E()?.add?.(8+G.sector*2,5+G.sector); A().objective?.();
    addText(G.w*.5,G.h*.31,`OBJETIVO +${C.tacticalObjectives.bonusScore*G.sector}`,'#a8ffcf',1250,0,-14,true);
    UI().flashMsg('OBJETIVO COMPLETADO',850);
    const y=Math.max(90,G.h*.18), x=clamp(G.px,40,G.w-40); spawnPowerDrop(x,y,o.reward||'heal');
  }
  function objectiveEvent(type,amount=1){
    const o=G.objective; if(!o||o.done||o.id!==type) return;
    o.progress=Math.min(o.target,(o.progress||0)+amount); if(o.progress>=o.target) completeObjective();
  }
  function updateObjectiveFromState(){
    if(G.objective?.id==='combo'&&!G.objective.done){ G.objective.progress=Math.min(G.objective.target,G.combo); if(G.combo>=G.objective.target) completeObjective(); }
  }
  function mutatorScoreMul(){ return G.sectorMutator?.scoreMul||1; }
  function fusionText(now=performance.now()){ return G.fusion?.until>now ? G.fusion.label : ''; }
  function updateFusion(now){
    const combos=C.fusion?.combos||[];
    let candidate=null;
    for(const c of combos){ if((G.activePowers[c.a]||0)>now && (G.activePowers[c.b]||0)>now){ candidate=c; break; } }
    if(candidate && (!G.fusion||G.fusion.until<=now || G.fusion.id!==candidate.id) && (G.fusionCooldowns[candidate.id]||0)<=now){
      G.fusion={id:candidate.id,until:now+C.fusion.durationMs,color:candidate.color,label:candidate.label};
      G.fusionCooldowns[candidate.id]=now+C.fusion.cooldownMs; A().fusion?.(candidate.id); UI().flashMsg(candidate.label,900); addText(G.px,G.py-58,candidate.label,candidate.color,1200,0,-16,true);
    }
    if(G.fusion?.id==='arc' && G.fusion.until>now && now-(G.timers.fusionPulse||0)>=C.fusion.arcPulseMs){
      G.timers.fusionPulse=now;
      const radius=(G.layout?.portrait?150:210);
      const targets=G.enemies.filter(e=>e.alive&&Math.hypot(e.x+e.w/2-G.px,e.y+e.h/2-G.py)<radius).slice(0,3);
      for(const e of targets){ applySpecialEnemyDamage(e,.52,'fusion-arc',now); explode(e.x+e.w/2,e.y+e.h/2,'#86efff',2,55); }
      G.enemyBullets=G.enemyBullets.filter(b=>Math.hypot(b.x-G.px,b.y-G.py)>radius*.7 || Math.random()>.55);
    }
  }
  function updateAllyDrone(now){
    if((G.activePowers.drone||0)<=now) return;
    const tier=weaponTier('drone'), count=droneCount(), bay=E()?.upgradeLevel?.('dronebay')||0;
    if(bay>=(C.allyDrone?.interceptMinBay||2) && now-(G.droneLastIntercept||0)>=(C.allyDrone?.interceptCooldownMs||1150) && G.enemyBullets.length){
      const radius=(C.allyDrone?.interceptRadius||92)+(count-1)*8, max=bay>=3?(C.allyDrone?.interceptsAtMax||2):1; let removed=0;
      for(let i=G.enemyBullets.length-1;i>=0 && removed<max;i--){ const b=G.enemyBullets[i]; if(Math.hypot(b.x-G.px,b.y-G.py)<=radius){ G.enemyBullets.splice(i,1); removed++; explode(b.x,b.y,'#7fffd4',3,45); } }
      if(removed){ G.droneLastIntercept=now; addText(G.px,G.py-52,`DRON DEFENSA ×${removed}`,'#7fffd4',520,0,-8,true); }
    }
    const interval=Math.max(210,C.allyDrone.shotMs-tier*35-count*12);
    if(now-G.droneLastShot<interval) return;
    G.droneLastShot=now;
    const t=nearestEnemy(G.px,G.py); if(!t) return;
    const rr=(G.layout?.portrait?C.allyDrone.orbitRadiusMobile:C.allyDrone.orbitRadiusDesktop)+(count-1)*3;
    for(let i=0;i<count;i++){
      const a=(G.droneAngle||0)+i*(Math.PI*2/count), dx=Math.cos(a)*rr, dy=Math.sin(a)*rr*.48;
      const sx=G.px+dx, sy=G.py+dy;
      const tx=t.x+t.w/2, ty=t.y+t.h/2, mag=Math.hypot(tx-sx,ty-sy)||1;
      const sp=520;
      firePlayerBullet(sx,sy,(tx-sx)/mag*sp,(ty-sy)/mag*sp,6,14,C.allyDrone.damage*(1+tier*.12)*(1+(G.bossAugments.damage||0)),'#7fffd4');
    }
    A().droneShot?.();
  }

  function bossAllyCanActivate(now=performance.now()){ return !!(C.bossAlly?.enabled && (G.bossAllyWorld||highestDefeatedBoss())>0 && now>=(G.bossAllyReadyAt||0) && now>=(G.bossAllyActiveUntil||0) && G.running && !G.paused && !G.lifeLost && !G.gameOver); }
  function bossAllyProgress(now=performance.now()){
    if(!(G.bossAllyWorld||highestDefeatedBoss())) return 0;
    if(now<(G.bossAllyActiveUntil||0)) return 1;
    if(now>=(G.bossAllyReadyAt||0)) return 1;
    const cd=Math.max(1,C.bossAlly?.cooldownMs||40000); return clamp(1-((G.bossAllyReadyAt-now)/cd),0,1);
  }
  function bossAllyStatus(now=performance.now()){
    const world=G.bossAllyWorld||highestDefeatedBoss(); if(!world) return 'JEFE —';
    if(now<(G.bossAllyActiveUntil||0)) return `JEFE ${Math.max(1,Math.ceil((G.bossAllyActiveUntil-now)/1000))}s`;
    if(now<(G.bossAllyReadyAt||0)) return `JEFE ${Math.ceil((G.bossAllyReadyAt-now)/1000)}s`;
    return 'JEFE LISTO';
  }
  function activateBossAlly(){
    const now=performance.now(); G.bossAllyWorld=G.bossAllyWorld||highestDefeatedBoss();
    if(!bossAllyCanActivate(now)) return false;
    G.bossAllyStartedAt=now; G.bossAllySignatureStage=0; G.bossAllyActiveUntil=now+(C.bossAlly?.durationMs||10000); G.bossAllyReadyAt=now+(C.bossAlly?.cooldownMs||40000); G.bossAllyLastShot=0;
    UI().flashMsg(`ALIADO DE JEFE · MUNDO ${G.bossAllyWorld}`,850); return true;
  }
  function fireBossAllySignature(world,now){
    const target=nearestEnemy(G.px,G.py); if(!target) return;
    const side=((Math.floor(now/1400)%2)?1:-1), sx=G.px+side*(G.layout?.portrait?54:72), sy=G.py+8;
    const tx=target.x+target.w/2,ty=target.y+target.h/2,base=(C.bossAlly?.signatureDamage||1.55)*(1+(G.bossAugments.damage||0));
    const aim=Math.atan2(ty-sy,tx-sx), count=world>=5?9:world>=3?7:5, spread=world===2 ? .055:.085;
    for(let i=0;i<count;i++){ const a=aim+(i-(count-1)/2)*spread; firePlayerBullet(sx,sy,Math.cos(a)*610,Math.sin(a)*610,8,19,base*(world>=4?1.08:1),world===1?'#ff9b72':world===2?'#b9ff8f':world===3?'#8de8ff':world===4?'#d99cff':'#76efff',world>=2&&i%3===0); }
    explode(sx,sy,world===1?'#ff9b72':world===4?'#d99cff':'#8de8ff',14,105); addText(sx,sy-18,'SIGNATURE ALLY','#ffe875',720,0,-10,true);
  }
  function updateBossAlly(now){
    if(now>=(G.bossAllyActiveUntil||0)) return;
    const sig=C.bossAlly?.signatureAtMs||[250,5200], elapsed=now-(G.bossAllyStartedAt||now);
    while((G.bossAllySignatureStage||0)<sig.length && elapsed>=sig[G.bossAllySignatureStage||0]){ fireBossAllySignature(Math.max(1,G.bossAllyWorld||1),now); G.bossAllySignatureStage=(G.bossAllySignatureStage||0)+1; }
    if(now-(G.bossAllyLastShot||0)<(C.bossAlly?.shotMs||480)) return;
    const target=nearestEnemy(G.px,G.py); if(!target) return; G.bossAllyLastShot=now;
    const world=Math.max(1,G.bossAllyWorld||1), side=((Math.floor(now/1400)%2)?1:-1), sx=G.px+side*(G.layout?.portrait?54:72), sy=G.py+10;
    const tx=target.x+target.w/2, ty=target.y+target.h/2, dx=tx-sx,dy=ty-sy,mag=Math.hypot(dx,dy)||1, base=C.bossAlly?.damage||1.15;
    const count=world>=5?5:world>=3?3:2;
    for(let i=0;i<count;i++){ const spread=(i-(count-1)/2)*.10; const ang=Math.atan2(dy,dx)+spread; firePlayerBullet(sx,sy,Math.cos(ang)*560,Math.sin(ang)*560,7,17,base*(1+(G.bossAugments.damage||0)),world===1?'#ff826e':world===2?'#b9ff8f':world===3?'#8de8ff':world===4?'#d99cff':'#76efff',world>=4&&i===Math.floor(count/2)); }
  }
  function weaponTier(kind){
    const n=G.relicLevels?.[kind]||0;
    if(n>=C.weaponEvolution.tier3At) return Math.min(3,C.weaponEvolution.maxTier);
    if(n>=C.weaponEvolution.tier2At) return 2;
    return n>0?1:0;
  }
  function romanTier(t){ return t>=3?'III':t===2?'II':t===1?'I':''; }
  function totalRelics(){ return Object.values(G.relicLevels||{}).reduce((a,b)=>a+(Number(b)||0),0); }
  function chassisStage(){
    const n=totalRelics(), th=C.shipEvolution?.stageThresholds||[0,2,5,8,12];
    let st=0; for(let i=1;i<th.length;i++) if(n>=th[i]) st=i;
    return Math.min(C.shipEvolution?.maxStage||4,st);
  }
  function endurancePowerScale(kind='boss'){
    if(!C.enduranceDirector?.enabled) return 1;
    const relics=totalRelics(), ch=chassisStage(), dmg=Math.max(0,G.bossAugments?.damage||0);
    if(kind==='subboss') return clamp(1 + relics*(C.enduranceDirector.subbossRelicHpPer||0) + ch*(C.enduranceDirector.subbossChassisHpPer||0) + dmg*(C.enduranceDirector.subbossDamageAugmentWeight||0),1,C.enduranceDirector.subbossMaxPowerScale||1.32);
    return clamp(1 + relics*(C.enduranceDirector.bossRelicHpPer||0) + ch*(C.enduranceDirector.bossChassisHpPer||0) + dmg*(C.enduranceDirector.bossDamageAugmentWeight||0),1,C.enduranceDirector.bossMaxPowerScale||1.55);
  }
  function bossFortressRatio(){
    const d=C.enduranceDirector||{}, bonus=Math.min(d.fortressMaxBonus||0,totalRelics()*(d.fortressRelicBonus||0)+chassisStage()*(d.fortressChassisBonus||0));
    return (C.bossFortress?.initialShieldRatio||.52)+bonus;
  }
  function subbossShieldRatio(){
    const d=C.enduranceDirector||{}, bonus=Math.min(d.subShieldMaxBonus||0,totalRelics()*(d.subShieldRelicBonus||0)+chassisStage()*(d.subShieldChassisBonus||0));
    return (C.subbossFortress?.initialShieldRatio||.44)+bonus;
  }
  function pressureLevel(startAt,threshold,secondMul,now){
    if(!startAt||!threshold) return 0;
    const age=Math.max(0,now-startAt); if(age>=threshold*(secondMul||1.72)) return 2; if(age>=threshold) return 1; return 0;
  }
  function bossPressureLevel(e,ph,now){ const arr=C.enduranceDirector?.bossPhasePressureAfterMs||[]; return pressureLevel(e.phaseStartedAt||e.spawnAt,arr[ph]||arr[arr.length-1]||0,C.enduranceDirector?.bossPressureSecondStageMul,now); }
  function subbossPressureLevel(e,now){ return pressureLevel(e.subSpawnAt,C.enduranceDirector?.subbossPressureAfterMs||0,C.enduranceDirector?.subbossPressureSecondStageMul,now); }
  function evolutionSummary(){
    const labels={spread:'DISP',shield:'ESC',chain:'CAD',missile:'MIS',overdrive:'OVR',drone:'DRN'};
    const parts=[]; for(const k of Object.keys(labels)){ const t=weaponTier(k); if(t>=2) parts.push(`${labels[k]} ${romanTier(t)}`); }
    const ch=chassisStage(); if(ch>0) parts.unshift(`CHASIS ${romanTier(Math.min(3,ch))}${ch>=4?'+':''}`);
    return parts.length?`EVO ${parts.slice(0,3).join(' · ')}`:'EVO —';
  }
  function currentPowerText(){
    const now = performance.now();
    const list=[];
    const add=(key,label)=>{ if(G.activePowers[key]>now){ const tier=weaponTier(key); list.push(`${label}${tier?` ${romanTier(tier)}`:''} ${Math.max(1,Math.ceil((G.activePowers[key]-now)/1000))}s`); } };
    add('spread','DISP'); add('shield','ESC'); add('chain','CAD'); add('missile','MIS'); add('overdrive','OVR'); add('drone','DRON'); add('magnet','IMÁN');
    return list.join(' · ');
  }
  function snapshot(){
    return {
      player:G.player, shipId:G.shipId, ship:G.ship, sector:G.sector, wave:G.wave, score:G.score,
      hp:G.maxHp, maxHp:G.maxHp, lives:G.lives, nextLifeAt:G.nextLifeAt, checkpointWave:G.checkpointWave,
      phase:G.phase, phaseName:G.phaseName, bossAugments:{...G.bossAugments}, relicLevels:{...G.relicLevels}
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
    G.dpr = (G.w*G.h > 1_450_000) ? 1 : Math.min(window.devicePixelRatio||1, 2);
    G.canvas.width = Math.floor(G.w*G.dpr); G.canvas.height = Math.floor(G.h*G.dpr);
    G.canvas.style.width = G.w+'px'; G.canvas.style.height = G.h+'px';
    G.ctx.setTransform(G.dpr,0,0,G.dpr,0,0);
    G.layout = computeLayout();
    const margin = Math.max(26, G.layout.playerH*.36);
    G.px = clamp(G.px||G.w*.5, margin, G.w-margin);
    const topFree=Math.max(48,(G.layout?.playerH||64)*.50);
    G.py = clamp(G.py||G.h*.78, topFree, G.h-margin*.72);
    if(G.running){ reflowFormation(); reflowWorldOnResize(); }
    seedStars();
  }

  function seedStars(){
    G.stars = Array.from({length: Math.max(70,Math.floor(G.w*G.h/16000))}, ()=>({x:Math.random()*G.w, y:Math.random()*G.h, z:Math.random()*1+0.2, a:Math.random()*0.8+0.2}));
  }

  function resetArrays(){ G.enemies=[]; G.playerBullets=[]; G.enemyBullets=[]; G.particles=[]; G.texts=[]; G.powerDrops=[]; G.gemDrops=[]; G.rewardPods=[]; G.obstacles=[]; G.bossRewards=[]; G.attachedRelics=[]; G.enemyGraveyard=[]; G.rewardPending=false; G.rewardStartedAt=0; G.rewardTransitionAt=0; G.sectorTransitionLock=false; G.bossDeathFx=null; }

  function startNew(player, shipId){
    const ship = C.ships.find(s=>s.id===shipId) || C.ships[0];
    Object.assign(G, { running:true, paused:false, mode:'game', player, shipId:ship.id, ship,
      sector:1, wave:1, score:0, nextLifeAt:C.progression.extraLifeEvery,
      hp:ship.hp+profileHullBonus(), maxHp:ship.hp+profileHullBonus(), lives:C.progression.restartLives, invulnUntil:0, phase:'wave', phaseName:'FORMACIÓN', subphase:0,
      combo:0, comboUntil:0, activePowers:{spread:0,shield:0,chain:0,missile:0,overdrive:0,drone:0,magnet:0}, bossAugments:{damage:0,fireRate:0,speed:0,maxHp:0,magnet:0,maxLives:0}, relicLevels:{spread:0,shield:0,chain:0,missile:0,overdrive:0,heal:0,life:0,drone:0}, backgroundTick:0, lowFx:false, gameOver:false, lifeLost:false, waveStartAt:performance.now(), waveDamageTaken:0, maxComboWave:0, tutorialStep:0, autoPaused:false, pauseStartedAt:0, rewardStartedAt:0, rewardTransitionAt:0, sectorTransitionLock:false, lastError:'', recoveryCount:0, microSwarmNextAt:0, microSwarmBursts:0, microSwarmSerial:0, webSlowUntil:0, bossDeathFx:null, bossSupplyNextAt:0, bossSuppliesGiven:0, bossPreludeStartAt:0, bossPreludeEndAt:0, bossPreludeNextBurstAt:0, bossPreludeBurstCount:0, matrixSupportCount:0, matrixSupportNextAt:0, matrixState:'M1', fusion:{id:'',until:0,color:'#fff',label:''}, fusionCooldowns:{}, objective:null, sectorMutator:null, droneAngle:0, droneLastShot:0
    });
    G.bossAllyWorld=highestDefeatedBoss(); G.bossAllyActiveUntil=0; G.bossAllyReadyAt=0; G.bossAllyLastShot=0; G.bossAllyStartedAt=0; G.bossAllySignatureStage=0; G.droneLastIntercept=0;
    G.layout = computeLayout(); G.px=G.w*.5; G.py=G.h*(G.layout?.portrait ? .80 : .82); resetArrays(); UI().renderGameOver(G,false); buildStage(); UI().showHud(true); UI().hideScreens();
  }

  function continueFromSave(data){
    const ship = C.ships.find(s=>s.id===data.shipId) || C.ships[0];
    Object.assign(G, { running:true, paused:false, mode:'game', player:data.player||'PILOTO', shipId:ship.id, ship,
      sector:data.sector||1, wave:data.wave||1, score:data.score||0, nextLifeAt:data.nextLifeAt||C.progression.extraLifeEvery,
      hp:data.hp||ship.hp+profileHullBonus(), maxHp:Math.max(data.maxHp||ship.hp,ship.hp+profileHullBonus()+(data.bossAugments?.maxHp||0)), lives:data.lives||C.progression.restartLives, invulnUntil:0,
      checkpointWave:data.checkpointWave||data.wave||1, phase:'wave', phaseName:'FORMACIÓN', subphase:0,
      combo:0, comboUntil:0, activePowers:{spread:0,shield:0,chain:0,missile:0,overdrive:0,drone:0,magnet:0}, bossAugments:{...(data.bossAugments||{damage:0,fireRate:0,speed:0,maxHp:0,magnet:0,maxLives:0})}, relicLevels:{...(data.relicLevels||{spread:0,shield:0,chain:0,missile:0,overdrive:0,heal:0,life:0,drone:0})}, backgroundTick:0, lowFx:false, gameOver:false, lifeLost:false, waveStartAt:performance.now(), waveDamageTaken:0, maxComboWave:0, tutorialStep:0, autoPaused:false, pauseStartedAt:0, rewardStartedAt:0, rewardTransitionAt:0, sectorTransitionLock:false, lastError:'', recoveryCount:0, microSwarmNextAt:0, microSwarmBursts:0, microSwarmSerial:0, webSlowUntil:0, bossDeathFx:null, bossSupplyNextAt:0, bossSuppliesGiven:0, bossPreludeStartAt:0, bossPreludeEndAt:0, bossPreludeNextBurstAt:0, bossPreludeBurstCount:0, matrixSupportCount:0, matrixSupportNextAt:0, matrixState:'M1', fusion:{id:'',until:0,color:'#fff',label:''}, fusionCooldowns:{}, objective:null, sectorMutator:null, droneAngle:0, droneLastShot:0
    });
    G.bossAllyWorld=highestDefeatedBoss(); G.bossAllyActiveUntil=0; G.bossAllyReadyAt=0; G.bossAllyLastShot=0; G.bossAllyStartedAt=0; G.bossAllySignatureStage=0; G.droneLastIntercept=0;
    G.layout = computeLayout(); G.px=G.w*.5; G.py=G.h*(G.layout?.portrait ? .80 : .82); resetArrays(); UI().renderGameOver(G,false); buildStage(); G.checkpoint=snapshot(); UI().showHud(true); UI().hideScreens();
  }

  function buildStage(){
    resetArrays();
    const now=performance.now();
    G.waveStartAt=now; G.waveDamageTaken=0; G.maxComboWave=0; G.eliteKillsWave=0; G.meteorKillsWave=0; G.podsOpenedWave=0; G.microSwarmBursts=0; G.microSwarmSerial=0; G.microSwarmNextAt=now+rand(C.microSwarm?.intervalMs?.[0]||5200,C.microSwarm?.intervalMs?.[1]||7600); G.combatPattern=null;
    selectSectorMutator();
    G.engageAfter = now + C.formation.waveGraceMs;
    G.phase = 'wave';
    G.phaseName = G.wave===C.progression.bossWave ? 'JEFE' : G.wave===C.progression.miniBossWave ? 'MINI-JEFE' : G.wave===2 ? 'PRESIÓN' : 'FORMACIÓN';
    if(!(G.sector===1&&G.wave===1)) G.tutorialStep=C.tutorial.hints.length;
    A().setSector?.(G.sector);
    // Streaming visual: conserva sólo el mundo actual y, si aplica, el anterior para la herencia del 20%.
    if(C.assetStreaming?.enabled){
      const keep=[G.sector];
      if(C.assetStreaming.keepPreviousWorld && G.sector>1) keep.push(G.sector-1);
      if(C.assetStreaming.keepNextWorld) keep.push(G.sector+1);
      NS.assets?.trimWorldCache?.(keep);
    }
    NS.assets?.loadWorld?.(G.sector);
    if(G.sector>1 && C.assetStreaming?.keepPreviousWorld!==false) NS.assets?.loadWorld?.(G.sector-1);
    buildObstacles();
    const bossOnly = C.bossArena?.bossOnlyWave && G.wave===C.progression.bossWave;
    if(bossOnly){
      buildRewardPods(true); initObjective();
      if(C.bossPrelude?.enabled) startBossPrelude(now); else { G.subphase=2; spawnBoss(); }
    } else {
      buildWaveFormation(); buildRewardPods(false); initObjective();
    }
    A().wave();
    const wc=integratedWorld();
    UI().flashMsg(bossOnly ? `${wc?.bossName||'JEFE'} · ARENA FINAL` : (wc?`${wc.label} · ${wc.sectorName} · OLEADA ${G.wave}`:`SECTOR ${G.sector} · OLEADA ${G.wave}`), 1100);
    const ft=familyTactic(G.sector);
    if(G.wave===1 && ft && C.worldFamilyTactics.announceWave1) setTimeout(()=>{ if(G.running&&!G.gameOver) UI().flashMsg(`${ft.label} · ${ft.desc}`,1050); },1180);
    if(G.wave===1 && G.sectorMutator && G.sectorMutator.id!=='clear') setTimeout(()=>{ if(G.running&&!G.gameOver) UI().flashMsg(`${G.sectorMutator.name} · ${G.sectorMutator.desc}`,C.sectorMutators.announceMs); },2380);
    if(C.progression.checkpointEveryWave) setCheckpoint(); else saveProgress();
  }

  function buildObstacles(){
    const count = clamp(C.obstacles.baseCount + ((G.wave>=4||G.sector>=2)?1:0), 1, C.obstacles.maxCount);
    const os = G.layout?.obstacleScale || 1;
    const portrait=!!G.layout?.portrait;
    const band=portrait?C.obstacles.lowerBandPortrait:C.obstacles.lowerBandLandscape;
    for(let i=0;i<count;i++){
      const large = i===0 ? Math.random()<.68 : Math.random()<.42;
      const rr = large ? C.obstacles.largeRadius : C.obstacles.mediumRadius;
      const r = rand(rr[0],rr[1]) * os;
      // El jefe siempre conserva al menos una roca defensora estable; el resto puede cruzar.
      const forceStatic = G.wave===C.progression.bossWave && i===0;
      const canDiagonal = G.wave>=3 && G.sector>=2;
      const moving = !forceStatic && Math.random()<C.obstacles.moverChance;
      const diagonal = moving && canDiagonal && Math.random()<C.obstacles.diagonalChance;
      const dir = Math.random()<.5 ? -1 : 1;
      const motion = moving ? (diagonal?'diagonal':'cross') : 'static';
      const speed=rand(C.obstacles.crossSpeed[0],C.obstacles.crossSpeed[1])*(large ? .86:1.08);
      const vx = moving ? dir*speed : 0;
      const vy = diagonal ? rand(C.obstacles.diagonalSpeedY[0],C.obstacles.diagonalSpeedY[1])*(Math.random()<.5?-1:1) : 0;
      const x = moving ? (dir>0 ? -r*1.2 : G.w+r*1.2) : G.w*(count===1 ? .5:(i===0 ? .31:.69));
      let yRatio = rand(band[0],band[1]);
      if(count>1) yRatio=clamp(yRatio+(i===0?-.035:.035),band[0],band[1]);
      const baseHp=(C.obstacles.hpBase + G.sector*4 + G.wave*2 + r*(large ? .30:.23))*(G.sectorMutator?.meteorHpMul||1);
      G.obstacles.push({
        x,y:G.h*yRatio,r,sizeClass:large?'large':'medium',motion,
        hp:Math.round(baseHp),maxHp:Math.round(baseHp),
        angle:Math.random()*Math.PI*2,
        spin:rand(C.obstacles.spinRange[0],C.obstacles.spinRange[1])*(Math.random()<.5?-1:1),
        vx,vy,assetIndex:Math.floor(Math.random()*3),alive:true,entered:!moving
      });
    }
  }

  function buildWaveFormation(){
    G.layout = computeLayout();
    const L = G.layout;
    const cols = L.cols;
    const rows = L.rows;
    const spacingX = L.gapX;
    const spacingY = L.gapY;
    const ew = L.ew, eh = L.eh;
    const width = cols*ew + (cols-1)*spacingX;
    const startX = (G.w-width)/2;
    const startY = L.startY;
    const diff=difficultyProfile();
    const baseFormSpeed=(C.wave.baseEnemySpeed + (G.sector-1)*C.wave.stepEnemySpeed + G.wave*6 + (G.w>=1200?10:0))*(G.sectorMutator?.enemySpeedMul||1)*diff.enemySpeed;
    const patterns=C.formationPatterns.sequence||['block'];
    const pattern=patterns[(G.wave-1+(G.sector-1))%patterns.length];
    const coordCfg=C.encounterEvolution?.formationCoordination||{};
    G.formation = {x:startX, y:startY, baseY:startY, maxY:L.maxFormationY, vx:baseFormSpeed*(L.portrait?C.formation.mobileSpeedMultiplier:1), dir:1, width, height: rows*eh + (rows-1)*spacingY + eh*.7, bounces:0, lastBounce:0, pattern, initialCount:cols*rows, desperationTriggered:false, coordinationSerial:0, coordinationNextAt:performance.now()+rand(coordCfg.intervalMs?.[0]||5200,coordCfg.intervalMs?.[1]||7600)};

    const sentinelCol=Math.max(1,Math.min(cols-2,Math.floor(cols*.24)));
    const reanimatorCol=Math.max(1,Math.min(cols-2,Math.floor(cols*.73)));
    const breederCol=Math.max(1,Math.min(cols-2,Math.floor(cols*.5)));
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let kind = r===0 ? 'striker' : (r<=2 ? 'raider' : (Math.random()<0.26?'gunner':'raider'));
        if(G.wave>=C.enemyEcology.sentinelFromWave && r===Math.min(1,rows-1) && c===sentinelCol) kind='sentinel';
        if(G.wave>=C.enemyEcology.reanimatorFromWave && r===Math.min(2,rows-1) && c===reanimatorCol) kind='reanimator';
        if(G.wave>=C.enemyEcology.breederFromWave && r===Math.min(2,rows-1) && c===breederCol) kind='breeder';
        const evoBonus=(C.encounterEvolution?.minionHpBonusBySector||[])[Math.min(4,Math.max(0,G.sector-1))]||0;
        let hp = kind==='gunner' ? 3 + Math.floor(G.sector*.36) : kind==='striker' ? 2 + Math.floor(G.sector*.28) : 2 + Math.floor((G.sector-1)*.32);
        if(kind==='sentinel') hp=5+Math.floor(G.sector*.55);
        if(kind==='reanimator') hp=6+Math.floor(G.sector*.68);
        if(kind==='breeder') hp=5+Math.floor(G.sector*.62);
        hp=Math.max(2,Math.ceil((hp+evoBonus)*diff.enemyHp));
        const patternOffset=formationPatternOffset(pattern,c,r,cols,eh);
        const score=kind==='sentinel'?115:kind==='reanimator'?145:kind==='breeder'?125:kind==='gunner'?48:kind==='striker'?38:30;
        const color=kind==='sentinel'?'#71f4e2':kind==='reanimator'?'#ce8dff':kind==='breeder'?'#83f08d':kind==='gunner'?'#ff856f':kind==='striker'?'#b497ff':'#71e8ff';
        const familyVisual=chooseFamilyVisual(kind,r,c);
        G.enemies.push({
          kind, role:'formation', row:r,col:c, ox:c*(ew+spacingX), oy:r*(eh+spacingY)+patternOffset, patternOffset, w:ew,h:eh,
          x:startX+c*(ew+spacingX), y:startY+r*(eh+spacingY)+patternOffset, hp, maxHp:hp, alive:true,
          shootBias: Math.random(), nextShot: performance.now()+rand(900,4200), specialNextShot:performance.now()+rand(1800,3600), zig: Math.random()<C.wave.zigzagRatio, zigSeed: Math.random()*Math.PI*2,
          renderH: eh*(kind==='reanimator'?1.55:kind==='sentinel'?1.48:kind==='breeder'?1.5:1.38), score, color,
          shieldPool:kind==='sentinel'?C.enemyEcology.sentinelShieldHp:0, shieldMax:kind==='sentinel'?C.enemyEcology.sentinelShieldHp:0, shieldBrokenUntil:0,
          revivesLeft:kind==='reanimator'?C.enemyEcology.reanimatorMaxRevives:0, reviveAt:kind==='reanimator'?performance.now()+C.enemyEcology.reanimatorDelayMs:0,
          breedAt:kind==='breeder'?performance.now()+C.enemyEcology.breederIntervalMs:0,
          familyWorld:familyVisual?.worldId||0, familyRole:familyVisual?.role||'', familySeed:Math.random()*12
        });
        initializeFamilyTactic(G.enemies[G.enemies.length-1]);
      }
    }
    if(G.wave>=C.eliteVariants.fromWave){
      const cap=G.layout?.portrait?C.eliteVariants.maxMobile:C.eliteVariants.maxDesktop;
      const bonus=(G.sectorMutator?.eliteBonus||0);
      const eliteGate=Math.random()<Math.min(.95,.58*(diff.eliteChance||1)+bonus*4);
      const baseDesired=eliteGate?Math.max(1,1+Math.floor((G.wave+G.sector-1)/4)+(Math.random()<bonus*8?1:0)):0;
      const desired=Math.min(cap,baseDesired);
      const candidates=G.enemies.filter(e=>e.role==='formation' && ['raider','striker','gunner'].includes(e.kind)).sort(()=>Math.random()-.5);
      for(let i=0;i<Math.min(desired,candidates.length);i++){
        const e=candidates[i], cls=C.eliteVariants.classes[(i+G.wave+G.sector)%C.eliteVariants.classes.length];
        e.eliteClass=cls.id; e.eliteLabel=cls.label; e.eliteColor=cls.color; e.hp=Math.ceil(e.hp*cls.hpMul); e.maxHp=e.hp; e.score=Math.round(e.score*cls.scoreMul); e.renderH*=1.1; e.zig=true;
      }
    }
    if(G.wave>=2){ spawnGuard(false); }
    if(G.wave===C.progression.miniBossWave){ spawnGuard(true); }
    if(G.wave===C.progression.bossWave){ spawnGuard(true); }
  }

  function spawnGuard(mini=false){
    const scale = (G.layout?.subbossRenderScale||1) * (G.layout?.portrait ? 1.02 : (G.w>=1200 ? 1.25 : 1.1));
    const gw = (mini?98:82)*scale, gh=(mini?72:58)*scale;
    const diff=difficultyProfile();
    const wc=integratedWorld();
    const hpBase=mini ? (132 + G.sector*44 + G.wave*16) : (wc ? (96 + G.sector*32 + G.wave*12) : (14 + G.sector*5.5 + G.wave*2));
    const enduranceScale=(mini||wc)?endurancePowerScale('subboss'):1;
    const encounterMul=(C.encounterEvolution?.subbossHpMulBySector||[])[Math.min(4,Math.max(0,G.sector-1))]||1;
    const hp = Math.ceil(hpBase * (mini?diff.subbossHp:(wc?diff.subbossHp*.92:Math.max(.92,diff.enemyHp*.9))) * enduranceScale * encounterMul);
    const baseIdentity=C.subBossIdentity.patterns[(G.sector-1)%C.subBossIdentity.patterns.length];
    const subIdx=mini?1:0;
    const identity=wc&&baseIdentity?{...baseIdentity,name:`${wc.sectorName} · SUBJEFE ${subIdx?'B':'A'}`} : (mini?baseIdentity:null);
    G.enemies.push({
      kind: mini ? 'miniboss' : 'guardian', role: mini ? 'miniboss' : 'guardian', x: G.w*.5-gw/2, y: Math.max(54,G.h*.055), w:gw, h:gh,
      baseX:G.w*.5-gw/2, baseY:Math.max(60,G.h*.065), hp, maxHp:hp, alive:true, t:0, score: mini?420:180, color: mini?(identity?.color||'#ffb969'):'#ffa07a', shootBias:0, nextShot:performance.now()+700,
      renderH: gh*1.26, identity, worldSubbossIndex:subIdx, familyWorld:wc?.id||0, subShieldMax:(mini||wc)?hp*(mini?subbossShieldRatio():(subbossShieldRatio()*.68)):0, subShieldHp:(mini||wc)?hp*(mini?subbossShieldRatio():(subbossShieldRatio()*.68)):0, subExposeUntil:0, subPhaseTriggered:false, subFinalTriggered:false, subPhaseGateUntil:0, subSpawnAt:performance.now(), subPressureLevel:0, contactCooldownUntil:0, subOpeningSignatureAt:performance.now()+(C.combatFlow?.subbossOpeningSignatureDelayMs||950), subPhaseSignatureAt:0, subOpeningSignatureUsed:false, subAttackCycle:0, subSignatureNextAt:performance.now()+5200, subRecoveryUntil:0
    });
    if(mini){ UI().flashMsg(`${identity?.name||'MINI-JEFE'}`,900); A().miniboss(identity?.style ?? 0); } else UI().flashMsg(wc?'SUBJEFE A · PRESIÓN':'GUARDIÁN ENTRANTE', 850);
  }

  function bossPreludeDuration(){
    const arr=C.bossPrelude?.durationMsBySector||[12000];
    return arr[Math.min(arr.length-1,Math.max(0,G.sector-1))]||12000;
  }

  function startBossPrelude(now=performance.now()){
    G.phase='preboss'; G.phaseName='ANTESALA'; G.subphase=1;
    G.bossPreludeStartAt=now; G.bossPreludeEndAt=now+bossPreludeDuration(); G.bossPreludeBurstCount=0; G.bossPreludeSupplyStage=0; G.bossPreludeLastSupplyKind='';
    G.bossPreludeNextBurstAt=now+(C.bossPrelude?.firstBurstDelayMs||450);
    G.enemies=G.enemies.filter(e=>e.role==='microSwarm');
    UI().flashMsg('ALERTA · FIRMA DE JEFE ENTRANTE',1000);
    addText(G.w*.5,G.h*.30,'ANTESALA DE COMBATE','#ffcc78',1000,0,-12,true);
  }

  function spawnBossPreludeBurst(now){
    const cfg=C.bossPrelude||{};
    const mobile=!!G.layout?.portrait&&G.w<=520;
    const alive=G.enemies.filter(e=>e.alive&&e.role==='hordeDiver').length;
    const cap=mobile?(cfg.maxAliveMobile||18):(cfg.maxAliveDesktop||28);
    if(alive>=cap) return;
    const range=mobile?(cfg.mobileCount||[5,8]):(cfg.desktopCount||[8,13]);
    const count=Math.min(cap-alive,Math.round(rand(range[0],range[1])));
    const wc=integratedWorld();
    const size=Math.max(22,(G.layout?.ew||30)*.72);
    const burstType=['rain','pincer','flank'][(G.bossPreludeBurstCount||0)%3];
    for(let i=0;i<count;i++){
      let side='top';
      if(burstType==='pincer') side=i%2===0?'left':'right';
      else if(burstType==='flank') side=(i%3===0)?'top':((G.bossPreludeBurstCount+i)%2===0?'left':'right');
      else side=(i%4===0)?(Math.random()<.5?'left':'right'):'top';
      let x,y;
      if(side==='left'){ x=-size-rand(0,70); y=G.h*rand(.20,.52); }
      else if(side==='right'){ x=G.w+size+rand(0,70); y=G.h*rand(.20,.52); }
      else { x=rand(20,G.w-size-20); y=-45-i*rand(10,20); }
      const hp=Math.max(1,Math.round((cfg.hpBase||1)+(G.sector-1)*(cfg.hpSectorStep||.35)));
      const kc=C.encounterEvolution?.kamikaze||{}, kamikaze=!!kc.enabled && Math.random()<(kc.hordeChance||.58);
      G.enemies.push({ kind:i%4===0?'diver':'raider', role:'hordeDiver', x,y,w:size,h:size*.78,renderH:size*1.38,hp:hp+(kamikaze?1:0),maxHp:hp+(kamikaze?1:0),alive:true,t:rand(0,2),phase:Math.random()*Math.PI*2,score:28+G.sector*4,color:'#ff9c8a',hordeShot:false,hordeShot2:false,prelude:true,preludeSide:side,preludeSpeedMul:cfg.speedMul||1.1,preludeShotChance:cfg.shotChance?? .48,kamikaze,kamikazeArmedAt:kamikaze?now+(kc.telegraphMs||520):0,familyWorld:wc?.id||0,familyRole:i%4===0?'hunter':'swarmer',familySeed:Math.random()*10 });
    }
    G.bossPreludeBurstCount++;
    G.bossPreludeNextBurstAt=now+rand(cfg.burstIntervalMs?.[0]||2200,cfg.burstIntervalMs?.[1]||3000);
    const labels={rain:'LLUVIA DE INTERCEPTORES',pincer:'PINZA DE ESCOLTA',flank:'BRECHA DE FLANCO'};
    addText(G.w*.5,G.h*.24,labels[burstType]||'OLEADA DE INTERCEPCIÓN','#ffb78f',700,0,-10,true);
  }

  function preludeSupplyKind(offensive=false){
    const hpRatio=G.maxHp?G.hp/G.maxHp:1;
    if(!offensive){
      if(hpRatio<(C.combatFlow?.supplyLowHpRatio||.48)) return 'heal';
      if(performance.now()>=(G.activePowers?.shield||0)) return 'shield';
      return Math.random()<.5?'heal':'shield';
    }
    const inherited=E()?.bossPowerPool?.()||[];
    const pool=inherited.length?inherited.filter(k=>['missile','overdrive','drone','chain','spread','emp'].includes(k)):[];
    return pool.length?pick(pool):pick(['missile','overdrive','drone','chain','spread']);
  }
  function spawnPreludeSupply(offensive=false,now=performance.now()){
    if((G.bossPreludeSupplyStage||0)>=(C.bossPrelude?.maxContextSupplies||2)) return;
    const kind=preludeSupplyKind(offensive);
    const stage=G.bossPreludeSupplyStage||0;
    const x=G.w*(stage%2===0 ? .30:.70), y=G.h*(G.layout?.portrait ? .50:.55);
    spawnPowerDrop(x,y,kind,'preludeSupply');
    G.bossPreludeSupplyStage=stage+1; G.bossPreludeLastSupplyKind=kind;
    M()?.noteSupplyOffered?.(kind,'preludeSupply');
    addText(x,y-20,offensive?'SUMINISTRO OFENSIVO':'SUMINISTRO DE APOYO','#ffe38a',900,0,-12,true);
  }

  function updateBossPrelude(now){
    if(G.phase!=='preboss') return;
    if(now>=(G.bossPreludeNextBurstAt||0) && now<(G.bossPreludeEndAt||0)) spawnBossPreludeBurst(now);
    const total=Math.max(1,(G.bossPreludeEndAt||now)-(G.bossPreludeStartAt||now));
    const progress=clamp((now-(G.bossPreludeStartAt||now))/total,0,1);
    const remaining=Math.max(0,(G.bossPreludeEndAt||now)-now);
    if((G.bossPreludeSupplyStage||0)===0 && progress>=(C.bossPrelude?.midpointSupplyRatio||.53)) spawnPreludeSupply(false,now);
    if((G.bossPreludeSupplyStage||0)===1 && remaining<=(C.bossPrelude?.finalSupplyBeforeMs||3200)) spawnPreludeSupply(true,now);
    if(remaining<3200 && !G.bossPreludeFinalWarned){ G.bossPreludeFinalWarned=true; UI().flashMsg('SEÑAL MASIVA · JEFE INMINENTE',900); G.threatPulseUntil=now+900; }
    if(now>=(G.bossPreludeEndAt||0)){
      const alive=G.enemies.some(e=>e.alive&&e.role==='hordeDiver');
      if(!alive){ G.subphase=2; G.bossPreludeStartAt=0; G.bossPreludeEndAt=0; G.bossPreludeNextBurstAt=0; G.bossPreludeFinalWarned=false; spawnBoss(); }
    }
  }

  function spawnBoss(){
    G.phase = 'boss'; G.phaseName='JEFE';
    const scale = (G.layout?.bossRenderScale||1) * (G.layout?.portrait ? .95 : (G.w>=1200 ? 1.28 : 1.1));
    const bw=184*scale, bh=112*scale;
    const diff=difficultyProfile();
    const powerScale=endurancePowerScale('boss');
    const encounterMul=(C.encounterEvolution?.bossHpMulBySector||[])[Math.min(4,Math.max(0,G.sector-1))]||1;
    const hp = Math.ceil((450 + G.sector*165) * diff.bossHp * powerScale * encounterMul);
    const baseIdentity=C.bossIdentity.patterns[(G.sector-1)%C.bossIdentity.patterns.length];
    const wc=integratedWorld();
    const identity=wc?{...baseIdentity,name:wc.bossName,resurrect:wc.boss?.canRevive||baseIdentity.resurrect}:baseIdentity;
    const bossEntity={ kind:'boss', role:'boss', x:G.w*.5-bw/2, y:Math.max(58,G.h*.06), w:bw, h:bh, baseX:G.w*.5-bw/2, baseY:Math.max(58,G.h*.06), hp, maxHp:hp, alive:true, t:0, score:1300+G.sector*240, color:'#ff8466', nextShot:performance.now()+800, burst:0, renderH:bh*1.28, phaseIdx:0, phaseAnnounced:0, summonAt:performance.now()+3200, dashUntil:0, identity, familyWorld:wc?.id||0, resurrectionsLeft:identity.resurrect?1:0, resurrectUntil:0, coreOpenUntil:0, nextCoreAt:performance.now()+C.bossCore.periodicEveryMs, coreReason:'', fortressMax:hp*bossFortressRatio(), fortressHp:hp*bossFortressRatio(), fortressRechargeAt:0, fortressRechargeRatio:0, fortressPulseAt:performance.now()+C.bossFortress.powerCooldownMs[0], armorNodes:buildBossModules(hp), modulesDisabled:false, hardpoints:buildBossHardpoints(hp), regulatorDisabled:false, driveDisabled:false, introUntil:performance.now()+(C.bossArena?.introInvulnerabilityMs||0), phaseGateUntil:0, phaseGatesTriggered:0, adaptUntil:0, damageWindowStart:0, damageWindowTaken:0, spawnAt:performance.now(), phaseStartedAt:performance.now(), pressureLevel:0, powerScale, quickRebootUsed:false, emergencyReboot:false, rebootAggroMul:1, rebootFireCdMul:1, signaturePhase:0, signatureCount:0, attackCycle:0, nextSignatureAt:performance.now()+(C.bossArena?.introInvulnerabilityMs||0)+(C.combatFlow?.bossPhaseSignatureDelayMs?.[0]||1250), nextEscortRefillAt:performance.now()+5200, contactCooldownUntil:0, bossMoveEventAt:performance.now()+rand(4200,6200), bossSurgeUntil:0, bossSurgeStartAt:0, counterOpenAt:0, recoveryUntil:0, signatureDamageBaseline:0, signatureMutationSerial:0, huntNextAt:performance.now()+6800, huntPending:false, huntWindupStart:0, huntWindupUntil:0, huntTargetX:0, huntTargetY:0, huntKind:'', huntSerial:0, huntEscapeCheckAt:0, huntDamageBaseline:0 };
    G.enemies.push(bossEntity);
    if(C.reactiveMatrix?.enabled&&['shadow','assist'].includes(C.reactiveMatrix.mode)){
      M()?.start?.({sector:G.sector,bossName:identity.name,bossHp:bossEntity.hp,build:matrixBuildSnapshot()},performance.now());
      for(const pod of G.rewardPods) if(pod.source==='bossArenaPod') M()?.noteSupplyOffered?.(pod.kind,'bossArenaPod');
      G.matrixSupportCount=0; G.matrixSupportNextAt=performance.now()+5000; G.matrixState='M1';
      UI().flashMsg(C.reactiveMatrix.mode==='assist'?'REACTIVE MATRIX · ACTIVE':'REACTIVE MATRIX · SHADOW MODE',760);
    }
    G.bossSuppliesGiven=0; G.bossSupplyNextAt=performance.now()+(C.economy?.bossSupply?.firstMs||4200);
    UI().flashMsg(`${identity.name} · ${wc?.sectorName||`SECTOR ${G.sector}`}`, 1100); A().boss();
    setTimeout(()=>{ if(G.running&&G.phase==='boss'&&!G.gameOver) UI().flashMsg('OBJETIVOS: ARMAMENTO · REGULADOR · PROPULSIÓN',1050); },1150);
  }

  function buildRewardPods(bossArena=false){
    const kinds = ['spread','shield','chain','missile','heal','overdrive','emp','drone','magnet'];
    const ps = G.w>=1200 ? 30 : (G.w>=700 ? 27 : 24);
    if(bossArena){
      const inherited=E()?.bossPowerPool?.()||[];
      const offensive=inherited.length?pick(inherited):pick(['missile','overdrive','shield']);
      G.rewardPods.push({x:G.w*0.80, y:G.h*0.68, w:ps,h:ps,hp:3,maxHp:3, kind:Math.random()<.58?'shield':'heal', source:'bossArenaPod', bob:Math.random()*Math.PI*2, open:false});
      G.rewardPods.push({x:G.w*0.20, y:G.h*0.58, w:ps,h:ps,hp:3,maxHp:3, kind:offensive, source:'bossArenaPod', bob:Math.random()*Math.PI*2, open:false});
      return;
    }
    const pod1 = {x:G.w*0.25, y: G.h*0.43, w:ps,h:ps,hp:3,maxHp:3, kind:pick(kinds), bob:Math.random()*Math.PI*2, open:false};
    const pod2 = {x:G.w*0.75, y: G.h*0.69, w:ps,h:ps,hp:3,maxHp:3, kind:Math.random()<0.18?'life':'heal', bob:Math.random()*Math.PI*2, open:false};
    G.rewardPods.push(pod1);
    if(G.wave>=2 || Math.random()<0.5) G.rewardPods.push(pod2);
  }

  function spawnPowerDrop(x,y,kind,source='world'){ const mul=G.layout?.powerScale||1; const base=G.w>=1200?31:G.w>=700?28:25; const sz=Math.round(base*mul); G.powerDrops.push({x,y,w:sz,h:sz,kind,source,vx:0,vy:G.layout?.portrait?78:88,life:15000,blink:0,phase:Math.random()*Math.PI*2}); }

  function updateBossSupply(now){
    const cfg=C.economy?.bossSupply; if(!cfg?.enabled || G.phase!=='boss' || G.rewardPending) return;
    const boss=G.enemies.find(e=>e.alive&&e.role==='boss'); if(!boss) return;
    if((G.bossSuppliesGiven||0)>=cfg.maxPerFight || now<(G.bossSupplyNextAt||0)) return;
    const inherited=E()?.bossPowerPool?.()||[];
    let kind;
    const hpRatio=G.maxHp?G.hp/G.maxHp:1;
    if(G.lives<=2) kind=Math.random()<.34?'life':(Math.random()<.58?'heal':'shield');
    else if(hpRatio<.48) kind=Math.random()<.58?'heal':'shield';
    else if(inherited.length) kind=pick([...inherited,'magnet']);
    else kind=pick(['shield','missile','overdrive','heal','drone','magnet']);
    const x=G.w*(.24+Math.random()*.52), y=Math.max(90,G.h*.18);
    spawnPowerDrop(x,y,kind,'bossSupply'); G.bossSuppliesGiven=(G.bossSuppliesGiven||0)+1; M()?.noteSupplyOffered?.(kind,'bossSupply');
    const a=cfg.intervalMs?.[0]||9500,b=cfg.intervalMs?.[1]||12500; G.bossSupplyNextAt=now+rand(a,b);
    addText(x,y-16,'APOYO DE JEFE',C.powers[kind]?.color||'#fff0a5',950,0,-11,true);
    UI().flashMsg(`SUMINISTRO · ${C.powers[kind]?.label||kind}`,650);
  }

  function bindInput(){
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', e=>{
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S','p','P','b','B'].includes(e.key)) e.preventDefault();
      G.keys[e.key]=true;
      if((e.key==='p'||e.key==='P') && G.running) togglePause();
      if((e.key==='b'||e.key==='B') && G.running) activateBossAlly();
    });
    window.addEventListener('keyup', e=>{ G.keys[e.key]=false; });

    const setPointer = e=>{
      const p=getPoint(e);
      const touchLike = e.pointerType==='touch' || e.pointerType==='pen';
      const lift = touchLike ? (G.layout?.playerH||60)*.82 : 0;
      G.pointer.x=p.x;
      G.pointer.y=p.y-lift;
      G.pointer.type=e.pointerType||'mouse';
    };
    const down=e=>{
      if(e.button!==undefined && e.button!==0) return;
      A().ensure(); G.pointer.active=true; setPointer(e);
      try{ G.canvas.setPointerCapture?.(e.pointerId); }catch{}
      e.preventDefault?.();
    };
    const move=e=>{ if(!G.pointer.active) return; setPointer(e); e.preventDefault?.(); };
    const up=e=>{ G.pointer.active=false; try{ G.canvas.releasePointerCapture?.(e.pointerId); }catch{} };
    G.canvas.addEventListener('pointerdown',down,{passive:false});
    G.canvas.addEventListener('pointermove',move,{passive:false});
    G.canvas.addEventListener('pointerup',up,{passive:true});
    G.canvas.addEventListener('pointercancel',up,{passive:true});
    G.canvas.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden && G.running && !G.paused && !G.gameOver && !G.lifeLost){
        G.paused=true; G.autoPaused=true; G.pauseStartedAt=performance.now(); UI().renderPause(G); UI().flashMsg('PAUSA AUTOMÁTICA',700);
      }
    });
  }
  function getPoint(e){ const rect=G.canvas.getBoundingClientRect(); return {x:e.clientX-rect.left, y:e.clientY-rect.top}; }

  function update(dt, now){
    if(!G.running || G.paused) return;
    G.lowFx = dt > 20;
    if(G.rewardPending || G.phase==='reward' || G.phase==='sectorTransition'){
      updatePlayer(dt,now); updateBossRewards(dt,now); updateParticles(dt); updateTexts(dt);
      if(G.phase==='sectorTransition' && G.rewardTransitionAt && now>=G.rewardTransitionAt && !G.sectorTransitionLock){
        G.sectorTransitionLock=true;
        advanceSector();
      }
      return;
    }
    updatePlayer(dt, now);
    G.droneAngle=(G.droneAngle||0)+dt*.0032; updateFusion(now); updateAllyDrone(now); updateBossAlly(now); updateObjectiveFromState();
    autoShoot(now);
    updateFormation(dt, now);
    maybeLaunchDiver(now);
    coordinateFormationStrike(now);
    updateFormationDesperation(now);
    updateEnemies(dt, now);
    updateBossSupply(now);
    updateMicroSwarmDirector(now);
    updateBossPrelude(now);
    if(G.paused) return;
    updateBullets(dt, now);
    updateReactiveMatrix(now);
    if(G.paused) return;
    updateObstacles(dt);
    updatePowerDrops(dt, now);
    updateGemDrops(dt, now);
    updateBossRewards(dt, now);
    updateRewardPods(dt, now);
    updateParticles(dt);
    updateTexts(dt);
    updateTutorial(now);
    updateProgression(now);
    if(G.score >= G.nextLifeAt){ G.lives=Math.min(C.progression.maxLives+(G.bossAugments.maxLives||0),G.lives+1); G.nextLifeAt += C.progression.extraLifeEvery; A().extraLife(); addText(G.px,G.py-30,'VIDA EXTRA','#ffd86b',1300,0,-20,true); }
    if(now > G.comboUntil) G.combo = 0;
    if(now - G.timers.save > 2300){ G.timers.save = now; saveProgress(); }
  }

  function updateTutorial(now){
    if(!C.tutorial.enabled || G.sector!==1 || G.wave!==1 || G.tutorialStep>=C.tutorial.hints.length) return;
    const hint=C.tutorial.hints[G.tutorialStep];
    if(now-(G.waveStartAt||now)>=hint.at){ UI().flashMsg(hint.text,1150); G.tutorialStep++; }
  }

  function updatePlayer(dt, now){
    const k = G.keys; const webMul=now<(G.webSlowUntil||0)?(familyTactic(4)?.webSlow||.68):1; const speed = G.ship.speed * profileSpeedMul() * (1+(G.bossAugments.speed||0)) * (now < G.activePowers.overdrive ? 1.25 : 1) * webMul;
    let mx=0,my=0;
    if(k.ArrowLeft||k.a||k.A) mx -= 1;
    if(k.ArrowRight||k.d||k.D) mx += 1;
    if(k.ArrowUp||k.w||k.W) my -= 1;
    if(k.ArrowDown||k.s||k.S) my += 1;
    if(G.pointer.active){
      G.px += (G.pointer.x - G.px) * Math.min(1, dt/(70/Math.max(.5,webMul)));
      G.py += (G.pointer.y - G.py) * Math.min(1, dt/(70/Math.max(.5,webMul)));
    } else {
      const mag = Math.hypot(mx,my)||1;
      G.px += (mx/mag) * speed * dt/1000;
      G.py += (my/mag) * speed * dt/1000;
    }
    const pm=Math.max(28,(G.layout?.playerH||64)*.34);
    G.px = clamp(G.px, pm, G.w-pm);
    const topFree=Math.max(44,(G.layout?.playerH||64)*.48);
    G.py = clamp(G.py, topFree, G.h-pm*.72);
  }

  function autoShoot(now){
    const overTier=weaponTier('overdrive'); const overMul=now<G.activePowers.overdrive?(overTier>=3 ? .60:overTier>=2 ? .68:.75):1;
    const rate = G.ship.fireRate * Math.max(.68,1-(G.bossAugments.fireRate||0)) * overMul * profileFireRateMul();
    if(now - G.timers.fire < rate*1000) return;
    G.timers.fire = now; A().shot(now<G.activePowers.overdrive?'rapid':'basic');
    const damage = G.ship.damage * (1+(G.bossAugments.damage||0)) * profileWeaponMul();
    const bs=G.layout?.bulletScale||1;
    const muzzle=(G.layout?.playerH||64)*.43;
    let primaryVx=0;
    // Asistencia suave de puntería en teléfono: no es homing, sólo inclina el disparo al salir
    // hacia una amenaza cercana. Mejora la precisión con el dedo sin automatizar el combate.
    if(G.layout?.portrait && G.w<=520){
      let target=null, best=Infinity;
      for(const e of G.enemies){
        if(!e.alive || e.y>=G.py-70) continue;
        const dx=(e.x+e.w/2)-G.px, score=Math.abs(dx)+Math.max(0,(G.py-e.y)*.035);
        if(Math.abs(dx)<G.w*.24 && score<best){best=score;target=e;}
      }
      if(target) primaryVx=clamp(((target.x+target.w/2)-G.px)*1.15,-92,92);
    }
    firePlayerBullet(G.px, G.py-muzzle, primaryVx, -660*bs, 8*bs, 19*bs, damage, '#bfefff');
    const spread = G.activePowers.spread>now;
    if(spread){
      const st=weaponTier('spread');
      firePlayerBullet(G.px-13*bs, G.py-muzzle*.82, -145*bs, -625*bs, 7*bs, 16*bs, damage, '#ffcf89'); firePlayerBullet(G.px+13*bs, G.py-muzzle*.82, 145*bs, -625*bs, 7*bs, 16*bs, damage, '#ffcf89');
      if(st>=2){ firePlayerBullet(G.px-18*bs,G.py-muzzle*.74,-255*bs,-585*bs,6.5*bs,15*bs,damage*.88,'#ffd9a0'); firePlayerBullet(G.px+18*bs,G.py-muzzle*.74,255*bs,-585*bs,6.5*bs,15*bs,damage*.88,'#ffd9a0'); }
      if(st>=3){ firePlayerBullet(G.px-7*bs,G.py-muzzle*.95,-32*bs,-720*bs,7.2*bs,20*bs,damage*1.16,'#fff0bd'); firePlayerBullet(G.px+7*bs,G.py-muzzle*.95,32*bs,-720*bs,7.2*bs,20*bs,damage*1.16,'#fff0bd'); }
    }
    const mt=weaponTier('missile');
    if(G.activePowers.missile>now && Math.random()<(mt>=3 ? .86:mt>=2 ? .76:.68)){ firePlayerBullet(G.px-17*bs,G.py-muzzle*.72,-38*bs,-500*bs,8*bs,19*bs,damage*(mt>=3?2.45:2),'#ffd067',true); firePlayerBullet(G.px+17*bs,G.py-muzzle*.72,38*bs,-500*bs,8*bs,19*bs,damage*(mt>=3?2.45:2),'#ffd067',true); A().missileShot?.(); }
    if(G.fusion?.until>now && G.fusion.id==='nova'){
      firePlayerBullet(G.px-22*bs,G.py-muzzle*.68,-330*bs,-555*bs,6*bs,15*bs,damage*.78,'#ffe3a4');
      firePlayerBullet(G.px+22*bs,G.py-muzzle*.68,330*bs,-555*bs,6*bs,15*bs,damage*.78,'#ffe3a4');
    }
    if(G.fusion?.until>now && G.fusion.id==='hunter' && now-(G.timers.fusionShot||0)>310){
      G.timers.fusionShot=now; firePlayerBullet(G.px,G.py-muzzle*.8,0,-545*bs,9*bs,21*bs,damage*2.35,'#fff0a6',true);
    }
  }
  function firePlayerBullet(x,y,vx,vy,w,h,damage,color,isMissile=false){
    if(G.playerBullets.length >= (G.layout?.portrait?62:86)) return;
    G.playerBullets.push({x:x-w/2,y:y-h/2,w,h,vx,vy,damage,color,isMissile,homing:isMissile&&weaponTier('missile')>=2,life:2200});
  }
  function fireEnemyBullet(x,y,vx,vy,r,color,damage=1,type='orb'){
    if(G.enemyBullets.length >= (G.layout?.enemyBulletCap||96)) return null;
    const rs=r*(G.layout?.bulletScale||1);
    const bullet={x,y,w:rs*2,h:rs*2,vx,vy,r:rs,color,damage,type,life:4200,age:0};
    G.enemyBullets.push(bullet); return bullet;
  }
  function decorateEnemyBullet(b,opts={}){ if(!b) return null; Object.assign(b,opts||{}); return b; }
  function rotateVelocity(vx,vy,rad){ const c=Math.cos(rad), s=Math.sin(rad); return {vx:vx*c-vy*s, vy:vx*s+vy*c}; }
  function resetCombatPattern(now=performance.now()){
    G.combatPattern={samples:[],lastSampleAt:0,lastX:G.px,lastDir:0,sameDir:0,createdAt:now};
    return G.combatPattern;
  }
  function sampleCombatPattern(now=performance.now()){
    const cfg=C.encounterEvolution?.hunterDoctrine||{}; if(!cfg.enabled) return null;
    const p=G.combatPattern||resetCombatPattern(now);
    if(p.lastSampleAt && now-p.lastSampleAt<(cfg.sampleEveryMs||280)) return p;
    const dx=G.px-(p.lastX??G.px), minDx=Math.max(5,G.w*(cfg.directionMinDeltaRatio||.022));
    if(Math.abs(dx)>=minDx){ const dir=Math.sign(dx); p.sameDir=dir===p.lastDir?(p.sameDir||0)+1:1; p.lastDir=dir; }
    else p.sameDir=Math.max(0,(p.sameDir||0)-1);
    p.lastX=G.px; p.lastSampleAt=now; p.samples.push({t:now,x:clamp(G.px/Math.max(1,G.w),0,1),dir:p.lastDir||0});
    const cutoff=now-(cfg.historyMs||3600); p.samples=p.samples.filter(q=>q.t>=cutoff); return p;
  }
  function combatPatternSnapshot(now=performance.now()){
    const cfg=C.encounterEvolution?.hunterDoctrine||{}, p=sampleCombatPattern(now); if(!p||p.samples.length<(cfg.minSamples||8)) return {ready:false,camped:false,repeat:false,mean:.5,span:1,side:0};
    const xs=p.samples.map(q=>q.x), mean=xs.reduce((a,b)=>a+b,0)/xs.length, span=Math.max(...xs)-Math.min(...xs);
    const side=mean<(cfg.edgeLeftRatio||.34)?-1:mean>(cfg.edgeRightRatio||.66)?1:0;
    return {ready:true,camped:!!side&&span<=(cfg.campSpanRatio||.24),repeat:(p.sameDir||0)>=(cfg.repeatDirectionSamples||4),mean,span,side,lastDir:p.lastDir||0};
  }
  function coordinateFormationStrike(now=performance.now()){
    const cfg=C.encounterEvolution?.formationCoordination||{}, f=G.formation;
    if(!cfg.enabled||!f||G.wave<(cfg.fromWave||2)||G.phase==='boss'||G.phase==='preboss'||G.subphase>0||now<G.engageAfter||now<(f.coordinationNextAt||0)||f.desperationTriggered) return;
    const alive=G.enemies.filter(e=>e.alive&&e.role==='formation'), initial=Math.max(1,f.initialCount||alive.length), ratio=alive.length/initial;
    if(ratio<(cfg.minAliveRatio||.30)){ f.coordinationNextAt=now+1200; return; }
    const front=alive.filter(isFrontShooter).sort((a,b)=>Math.abs((a.x+a.w/2)-G.px)-Math.abs((b.x+b.w/2)-G.px));
    if(front.length<2){ f.coordinationNextAt=now+1200; return; }
    const mobile=!!G.layout?.portrait&&G.w<=520, n=Math.min(front.length,mobile?(cfg.mobileShooters||2):(cfg.desktopShooters||3));
    const serial=f.coordinationSerial||0, cross=serial%2===0, tele=cfg.telegraphMs||720, spread=cfg.focusSpreadPx||78;
    for(let i=0;i<n;i++){
      const e=front[i]; e.coordinatedShotUntil=now+tele; e.chargeStart=now; e.chargeUntil=e.coordinatedShotUntil;
      const offset=cross?(i-(n-1)/2)*spread:((i%2?1:-1)*spread*.34);
      e.chargeTargetX=clamp(G.px+offset,16,G.w-16); e.chargeTargetY=G.py; e.coordinatedStyle=cross?'crossfire':'focus'; e.nextShot=Math.max(e.nextShot||0,now+tele+650);
    }
    f.coordinationSerial=serial+1; const iv=cfg.intervalMs||[5200,7600]; f.coordinationNextAt=now+rand(iv[0],iv[1]);
    G.threatPulseUntil=now+Math.min(tele,620); UI().flashMsg(cross?'ESCUADRÓN · FUEGO CRUZADO':'ESCUADRÓN · FIJACIÓN DE BLANCO',620);
  }
  function resolveCoordinatedShot(e,now){
    if(!e.coordinatedShotUntil||now<e.coordinatedShotUntil) return;
    const cfg=C.encounterEvolution?.formationCoordination||{}, cx=e.x+e.w/2,cy=e.y+e.h;
    fireTowardPoint(cx,cy,e.chargeTargetX??G.px,e.chargeTargetY??G.py,(cfg.projectileSpeed||335)+G.sector*9,4.5,e.coordinatedStyle==='crossfire'?'#ffcf86':'#ff987f',cfg.damage||1,'lance');
    e.coordinatedShotUntil=0; e.chargeUntil=0; e.chargeStart=0; e.coordinatedStyle=''; A().enemyShot?.(e.kind||'raider');
  }

  function ensureSubbossMotion(e,now=performance.now()){
    if(e.motionInitialized) return;
    e.motionInitialized=true; e.motionSeed=Math.random()*Math.PI*2; e.motionDir=Math.random()<.5?-1:1;
    e.motionBlendStart=now; e.motionOriginX=e.x; e.motionOriginY=e.y;
    e.subLaneTargetX=e.x; e.subLaneNextAt=now+rand(1200,2100);
  }
  function ensureBossMotion(e,now=performance.now()){
    if(e.motionInitialized) return;
    e.motionInitialized=true; e.motionSeed=Math.random()*Math.PI*2; e.motionDir=Math.random()<.5?-1:1;
    e.motionBlendStart=now; e.motionOriginX=e.x; e.motionOriginY=e.y;
    e.bossLaneTargetX=e.x; e.bossLaneNextAt=now+rand(1400,2400); e.bossDiveUntil=0;
  }
  function updateSubbossMotion(e,now,dt,pressure=0){
    ensureSubbossMotion(e,now);
    const style=e.identity?.style ?? ((G.sector-1)%3);
    const center=G.w*.5-e.w/2, baseY=Math.max(e.role==='guardian'?64:58,G.h*(e.role==='guardian' ? .07:.062));
    const portrait=!!G.layout?.portrait, ampBase=Math.min(G.w*(e.role==='guardian' ? .28:.34), portrait?(e.role==='guardian'?150:180):(e.role==='guardian'?360:420));
    const rhythm=C.encounterEvolution?.subbossRhythm||{};
    const recoveryMul=(rhythm.enabled && now<(e.subRecoveryUntil||0))?(rhythm.recoveryMoveMul||.62):1;
    const moveMul=(e.subRageMul||((pressure===2?1.18:pressure===1?1.08:1)))*recoveryMul;
    let x=center,y=baseY;
    if(style===0){
      const amp=ampBase*moveMul;
      x=center+Math.sin(e.t*1.55*moveMul+e.motionSeed)*amp+Math.sin(e.t*4.2+e.motionSeed)*amp*.12;
      y=baseY+Math.abs(Math.sin(e.t*2.15+e.motionSeed))*Math.min(28,G.h*.03)+Math.cos(e.t*3.2)*4;
    } else if(style===1){
      const amp=ampBase*.88*moveMul;
      x=center+Math.cos(e.t*1.05*moveMul+e.motionSeed)*amp+Math.sin(e.t*2.6)*amp*.08;
      y=baseY+Math.sin(e.t*2.0+e.motionSeed)*Math.min(18,G.h*.022)+Math.cos(e.t*0.9)*9;
    } else {
      if(now>=(e.subLaneNextAt||0)){
        const lanes=[.22,.5,.78];
        if(e.role!=='guardian' && (e.subPhaseTriggered||false)) lanes.splice(1,0,.35,.65);
        const lane=lanes[Math.floor(Math.random()*lanes.length)]||.5;
        e.subLaneTargetX=clamp(G.w*lane-e.w/2,8,G.w-e.w-8);
        e.subLaneNextAt=now+rand(1050,1850);
      }
      e.x = (e.x??center) + ((e.subLaneTargetX??center)-(e.x??center))*Math.min(.18,dt/240);
      x=e.x + Math.sin(e.t*2.8+e.motionSeed)*12*moveMul;
      y=baseY+Math.sin(e.t*1.35)*Math.min(14,G.h*.016)+Math.cos(e.t*2.2+e.motionSeed)*6;
    }
    const blend=clamp((now-(e.motionBlendStart||now))/700,0,1);
    e.x=clamp((e.motionOriginX??x)*(1-blend)+x*blend,8,G.w-e.w-8); e.y=(e.motionOriginY??y)*(1-blend)+y*blend;
  }
  function updateBossMotion(e,ph,now,dt,pressure=0){
    ensureBossMotion(e,now);
    const pattern=e.identity?.id||'nova';
    const rhythm=C.encounterEvolution?.battleRhythm||{};
    const rhythmMoveMul=rhythm.enabled ? (now<(e.recoveryUntil||0)?(rhythm.recoveryMoveMul||.48):(e.signaturePending&&now<(e.signatureWindupUntil||0)?(rhythm.windupMoveMul||.70):1)) : 1;
    const driveMul=(e.driveDisabled?(C.bossHardpoints?.driveMovementMul||.62):1)*(pressure===2?1.18:pressure===1?1.08:1)*(e.rebootAggroMul||1)*(e.matrixMoveMul||1)*rhythmMoveMul;
    const center=G.w*.5-e.w/2, baseY=Math.max(54,G.h*.058);
    const portrait=!!G.layout?.portrait;
    const ampX=Math.min(G.w*(ph===0 ? .34:ph===1 ? .39:.44),(portrait?(ph===2?245:220):(ph===2?560:500))*driveMul);
    const ampY=Math.min((24+ph*6)*driveMul,G.h*.05);
    let x=center,y=baseY;
    if(pattern==='nova'){
      x=center+Math.sin(e.t*(ph===0 ? .86:ph===1?1.02:1.18)+e.motionSeed)*ampX+Math.sin(e.t*2.7+e.motionSeed)*ampX*.14;
      y=baseY+Math.abs(Math.sin(e.t*1.4+e.motionSeed))*ampY+Math.cos(e.t*2.1)*6+(ph===2?Math.sin(e.t*3.4)*8:0);
    } else if(pattern==='lancer'){
      if(now>=(e.bossLaneNextAt||0)){
        const lanes=ph===0?[.24,.5,.76]:ph===1?[.18,.36,.5,.64,.82]:[.12,.28,.44,.56,.72,.88];
        const lane=lanes[Math.floor(Math.random()*lanes.length)]||.5;
        e.bossLaneTargetX=clamp(G.w*lane-e.w/2,8,G.w-e.w-8);
        e.bossLaneNextAt=now+rand(ph===2?900:1150,ph===2?1500:2100);
      }
      e.x=(e.x??center)+((e.bossLaneTargetX??center)-(e.x??center))*Math.min(.22,dt/200);
      x=e.x+Math.sin(e.t*3.4+e.motionSeed)*18*driveMul;
      y=baseY+Math.sin(e.t*2.45)*Math.min(16,G.h*.018)+Math.cos(e.t*0.9+e.motionSeed)*7;
    } else if(pattern==='brood'){
      if(now>=(e.bossLaneNextAt||0)){
        e.bossLaneTargetX=clamp(G.px-e.w/2+rand(-110,110),8,G.w-e.w-8);
        e.bossLaneNextAt=now+rand(1350,2400);
      }
      e.x=(e.x??center)+((e.bossLaneTargetX??center)-(e.x??center))*Math.min(.13,dt/250);
      x=e.x+Math.sin(e.t*2.1+e.motionSeed)*ampX*.18;
      y=baseY+Math.abs(Math.sin(e.t*1.65+e.motionSeed))*Math.min(30,G.h*.034)+Math.cos(e.t*3.1)*5;
    } else if(pattern==='gravity'){
      x=center+Math.cos(e.t*(ph===0 ? .92:ph===1?1.08:1.24)*e.motionDir+e.motionSeed)*ampX*.9+Math.sin(e.t*2.2)*ampX*.08;
      y=baseY+Math.sin(e.t*1.7*e.motionDir+e.motionSeed)*ampY*1.18+Math.abs(Math.sin(e.t*0.95))*10;
    } else {
      if(now>=(e.bossLaneNextAt||0)){
        e.motionDir*=-1;
        const side=e.motionDir>0 ? .78:.22;
        e.bossLaneTargetX=clamp(G.w*side-e.w/2,8,G.w-e.w-8);
        e.bossLaneNextAt=now+rand(ph===2?980:1250,ph===2?1650:2400);
      }
      e.x=(e.x??center)+((e.bossLaneTargetX??center)-(e.x??center))*Math.min(.16,dt/240);
      x=e.x+Math.sin(e.t*2.9+e.motionSeed)*20*driveMul;
      y=baseY+Math.sin(e.t*2.6+e.motionSeed)*ampY+Math.abs(Math.sin(e.t*1.2))*10+(ph===2?Math.cos(e.t*4.0)*6:0);
    }
    const evo=C.encounterEvolution||{};
    if(ph>=(evo.bossSurgeFromPhase??1) && now>=(e.bossMoveEventAt||0) && now>=(e.bossSurgeUntil||0) && now>=(e.recoveryUntil||0) && !e.signaturePending){
      const intv=evo.bossSurgeIntervalMs||[4300,6800], dur=evo.bossSurgeDurationMs||[780,1120];
      e.bossSurgeStartAt=now; e.bossSurgeUntil=now+rand(dur[0],dur[1]);
      e.bossSurgeTargetX=clamp((G.px-e.w/2)*(evo.bossSurgeTrackRatio?.[ph]||.35)+x*(1-(evo.bossSurgeTrackRatio?.[ph]||.35))+rand(-90,90),8,G.w-e.w-8);
      e.bossSurgeBaseY=y; e.bossSurgeDepth=Math.min(G.h*(evo.bossSurgeDepthRatioByPhase?.[ph]||.16),Math.max(48,G.py-y-e.h-110));
      e.bossMoveEventAt=e.bossSurgeUntil+rand(intv[0],intv[1]);
      addText(e.x+e.w/2,e.y+e.h*.18,ph>=2?'MANIOBRA DE CAZA':'RUPTURA DE EJE',e.identity?.accent||'#ffd49a',620,0,-9,true);
    }
    if(now<(e.bossSurgeUntil||0)){
      const p=clamp((now-(e.bossSurgeStartAt||now))/Math.max(1,(e.bossSurgeUntil||now)-(e.bossSurgeStartAt||now)),0,1), arc=Math.sin(p*Math.PI);
      x=x*(1-arc*.72)+(e.bossSurgeTargetX??x)*arc*.72;
      y=y+arc*(e.bossSurgeDepth||0);
    }
    const blend=clamp((now-(e.motionBlendStart||now))/820,0,1);
    e.x=clamp((e.motionOriginX??x)*(1-blend)+x*blend,8,G.w-e.w-8); e.y=(e.motionOriginY??y)*(1-blend)+y*blend;
  }

  function updateFormation(dt, now){
    const f = G.formation;
    if(!f || !G.enemies.some(e=>e.alive && e.role==='formation')) return;
    const margin=G.layout?.sideMargin||12;
    f.x += f.vx * f.dir * dt/1000;
    let minX=Infinity, maxX=-Infinity;
    const bob=Math.sin(now/1050)*1.25;
    G.enemies.forEach(e=>{
      if(!e.alive || e.role!=='formation') return;
      const zax=Math.min(8,e.w*.12), zay=Math.min(5,e.h*.12);
      let familyX=0,familyY=0;
      const ft=familyTactic(enemyFamilyWorld(e));
      if(ft?.id==='yautja_hunt' && now<(e.cloakUntil||0)){
        const p=clamp((now-(e.cloakStart||now))/Math.max(1,(e.cloakUntil||now)-(e.cloakStart||now)),0,1);
        familyX=Math.sin(p*Math.PI)*(e.cloakDir||1)*(ft.cloakShift||32);
      } else if(ft?.id==='leviathan_tide'){
        familyX=Math.sin(now/620+(e.familySeed||0)+e.row*.45)*(ft.waveAmpX||14);
        familyY=Math.cos(now/760+(e.familySeed||0)+e.col*.32)*(ft.waveAmpY||7);
      }
      e.x = f.x + e.ox + familyX + (e.zig ? Math.sin(now/430 + e.zigSeed + e.row*.3)*zax : 0);
      e.y = f.y + e.oy + familyY + bob + (e.zig ? Math.cos(now/610 + e.zigSeed + e.col*.2)*zay : 0);
      minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x+e.w);
    });
    const hitLeft=minX<margin, hitRight=maxX>G.w-margin;
    if((hitLeft||hitRight) && now-(f.lastBounce||0)>90){
      // Corrige posición antes de cambiar dirección para evitar rebote infinito en móviles estrechos.
      if(hitLeft && hitRight){
        const center=(minX+maxX)/2;
        f.x += G.w/2-center;
        f.vx=Math.min(f.vx,72);
      } else if(hitLeft){
        f.x += margin-minX;
        f.dir=1;
      } else {
        f.x -= maxX-(G.w-margin);
        f.dir=-1;
      }
      f.lastBounce=now; f.bounces=(f.bounces||0)+1;
      const every=G.layout?.portrait?C.formation.portraitDropEveryBounces:C.formation.landscapeDropEveryBounces;
      if(f.bounces%every===0){
        const drop=G.layout?.portrait?C.formation.portraitDropPx:C.formation.landscapeDropPx;
        f.y=Math.min(f.maxY||G.layout.maxFormationY, f.y+drop);
      }
    }
    // Última barrera de seguridad: una formación nunca puede invadir la zona del jugador.
    f.y=clamp(f.y, f.baseY||G.layout.startY, f.maxY||G.layout.maxFormationY);
  }

  function maybeLaunchDiver(now){
    if(now < G.engageAfter + C.formation.diverGraceMs) return;
    const currentDivers=G.enemies.filter(e=>e.alive&&e.role==='diver').length;
    const mobile=G.layout?.portrait && G.w<=520;
    const D=directorState(now);
    let maxDivers=mobile ? (G.wave>=4?2:1) : (G.layout?.portrait ? (G.wave>=3?2:1) : (G.w>=1200 ? (G.wave>=3?4:3) : 2));
    if(D.hpRatio<=C.combatDirector.lowHpRatio || G.lives<=1) maxDivers=Math.max(1,maxDivers-1);
    if(currentDivers>=maxDivers) return;
    const baseInterval=mobile ? Math.max(2400,4300-G.sector*120-G.wave*100) : Math.max(900,2200-G.sector*150-G.wave*105);
    const interval=baseInterval*D.diveMul;
    if(now - G.timers.dive < interval) return;
    G.timers.dive = now;
    const pool = G.enemies.filter(e=>e.alive && e.role==='formation' && e.row <= 2 && !e.coordinatedShotUntil && !['sentinel','reanimator','breeder'].includes(e.kind));
    if(!pool.length) return;
    const launches = (!G.layout?.portrait && G.w>=1200 && G.wave>=3 && Math.random()<.45) ? 2 : 1;
    for(let j=0;j<launches;j++){
      if(!pool.length) break;
      const idx=Math.floor(Math.random()*pool.length), e=pool.splice(idx,1)[0];
      e.originalKind=e.kind;
      e.role='diver'; e.kind='diver'; e.t=0; e.diveElapsed=0;
      const kc=C.encounterEvolution?.kamikaze||{}; const waveChance=(kc.diveChanceByWave||[])[Math.min(3,Math.max(0,G.wave-1))]||0;
      e.kamikaze=!!kc.enabled && Math.random()<waveChance; e.kamikazeArmedAt=e.kamikaze?now+(kc.telegraphMs||520):0;
      e.diveStyle=e.kamikaze?'slash':(Math.random()<.45?'swoop':'slash');
      const ft=familyTactic(enemyFamilyWorld(e));
      e.diveDuration=(mobile?3400:(G.layout?.portrait?3100:2750))*(e.diveStyle==='slash' ? .92:1.06)*(ft?.diveMul||1);
      e.diveStartX=e.x; e.diveStartY=e.y;
      const lateral=e.diveStyle==='slash'?(mobile?95:180):(mobile?65:110);
      e.diveTargetX=clamp(G.px+rand(-lateral,lateral),20,G.w-e.w-20);
      const depthRatio=e.diveStyle==='slash'?(mobile ? .50:.56):(mobile ? .56:.63);
      e.diveDepth=e.kamikaze ? Math.max(e.diveStartY+90,Math.min(G.py+(kc.diveDepthOffset||14),G.h*.86)) : Math.max(e.diveStartY+70, Math.min(G.h*depthRatio, G.py-(mobile?135:110)));
      e.diveShots=0; e.phase=Math.random()*Math.PI*2; e.hp += e.kamikaze?2:1; e.maxHp=Math.max(e.maxHp||e.hp,e.hp); e.renderH=(e.renderH||e.h*1.35)*1.06;
      if(e.kamikaze) addText(e.x+e.w/2,e.y-6,'⚠ KAMIKAZE','#ff8a72',kc.telegraphMs||520,0,-8,true);
    }
    A().enemyDive();
  }


  function updateFormationDesperation(now){
    const cfg=C.encounterEvolution?.desperation||{}, f=G.formation;
    if(!cfg.enabled || !f || f.desperationTriggered || G.phase==='boss' || G.phase==='preboss' || G.subphase>0) return;
    const initial=Math.max(1,f.initialCount||0); if(initial<(cfg.minInitialCount||18)) return;
    const alive=G.enemies.filter(e=>e.alive&&e.role==='formation');
    if(!alive.length || alive.length/initial>(cfg.triggerAliveRatio||.20)) return;
    f.desperationTriggered=true;
    const basic=alive.filter(e=>!['sentinel','reanimator','breeder'].includes(e.kind)).sort(()=>Math.random()-.5);
    const maxLaunch=G.layout?.portrait?(cfg.maxLaunchMobile||2):(cfg.maxLaunchDesktop||4);
    const launches=Math.min(maxLaunch,basic.length);
    const kc=C.encounterEvolution?.kamikaze||{};
    for(let i=0;i<launches;i++){
      const e=basic[i]; e.originalKind=e.kind; e.role='diver'; e.kind='diver'; e.t=0; e.diveElapsed=0; e.desperationDive=true;
      e.kamikaze=Math.random()<(cfg.kamikazeChance||.72); e.kamikazeArmedAt=e.kamikaze?now+(kc.telegraphMs||520):0;
      e.diveStyle='slash'; e.diveDuration=(G.layout?.portrait?2650:2250)*(cfg.diveDurationMul||.78); e.diveStartX=e.x; e.diveStartY=e.y;
      e.diveTargetX=clamp(G.px+rand(G.layout?.portrait?-75:-135,G.layout?.portrait?75:135),18,G.w-e.w-18);
      e.diveDepth=Math.max(e.diveStartY+90,Math.min(G.py+(kc.diveDepthOffset||14),G.h*.87)); e.diveShots=0; e.phase=Math.random()*Math.PI*2;
      e.hp+=e.kamikaze?2:1; e.maxHp=Math.max(e.maxHp,e.hp); e.renderH=(e.renderH||e.h*1.35)*1.08;
      if(e.kamikaze) addText(e.x+e.w/2,e.y-6,'⚠ ÚLTIMA CARGA','#ff8a72',kc.telegraphMs||520,0,-8,true);
    }
    for(const e of alive){ if(e.role!=='formation') continue; e.desperate=true; e.zig=true; e.hp+=cfg.survivorHpBonus||1; e.maxHp=Math.max(e.maxHp,e.hp); const lead=cfg.survivorShotLeadMs||[180,620]; e.nextShot=Math.min(e.nextShot||Infinity,now+rand(lead[0],lead[1])); }
    G.threatPulseUntil=now+720; UI().flashMsg('FORMACIÓN ROTA · DESESPERACIÓN ENEMIGA',900); addText(G.w*.5,G.h*.27,'ÚLTIMA CARGA','#ffac82',900,0,-12,true); A().enemyDive();
  }

  function isFrontShooter(e){
    if(e.role!=='formation') return false;
    return !G.enemies.some(o=>o.alive && o.role==='formation' && o.col===e.col && o.row>e.row);
  }

  function fireAimed(x,y,speed,r,color,damage=1,type='orb',spread=0){
    const dx=(G.px-x)+rand(-spread,spread), dy=(G.py-y)+rand(-spread*.25,spread*.25);
    const mag=Math.hypot(dx,dy)||1;
    return fireEnemyBullet(x,y,dx/mag*speed,dy/mag*speed,r,color,damage,type);
  }
  function fireTowardPoint(x,y,tx,ty,speed,r,color,damage=1,type='lance'){
    const dx=tx-x, dy=ty-y, mag=Math.hypot(dx,dy)||1;
    return fireEnemyBullet(x,y,dx/mag*speed,dy/mag*speed,r,color,damage,type);
  }

  function sentinelRadiusPx(sentinel=null){ const base=C.enemyEcology.sentinelRadius*clamp((G.layout?.ew||30)/30,.82,1.45); const t=sentinel?familyTactic(enemyFamilyWorld(sentinel)):familyTactic(G.sector); return base*(t?.sentinelRadiusMul||1); }

  function findSentinelProtector(target,now=performance.now()){
    if(!target || target.kind==='sentinel') return null;
    const tx=target.x+target.w/2, ty=target.y+target.h/2;
    for(const s of G.enemies){
      if(!s.alive || s.kind!=='sentinel' || s.role!=='formation' || now<(s.shieldBrokenUntil||0) || (s.shieldPool||0)<=0) continue;
      const sx=s.x+s.w/2, sy=s.y+s.h/2;
      if(Math.hypot(tx-sx,ty-sy)<=sentinelRadiusPx(s)) return s;
    }
    return null;
  }

  function spawnRevivedEnemy(reanimator,now){
    if(!G.enemyGraveyard.length || (reanimator.revivesLeft||0)<=0) return false;
    const snap=G.enemyGraveyard.pop();
    const homeX=(G.formation?.x||0)+snap.ox, homeY=(G.formation?.y||G.layout.startY)+snap.oy;
    const hp=Math.max(1,Math.ceil((snap.maxHp||1)*C.enemyEcology.reviveHpRatio));
    G.enemies.push({...snap, role:'reviving', kind:snap.kind||'raider', x:reanimator.x+reanimator.w/2-snap.w/2, y:reanimator.y+reanimator.h*.4, hp, maxHp:snap.maxHp||hp, alive:true, reviveStart:now, reviveDuration:900, reviveFromX:reanimator.x+reanimator.w/2-snap.w/2, reviveFromY:reanimator.y+reanimator.h*.4, reviveHomeX:homeX, reviveHomeY:homeY, revivedOnce:true, nextShot:now+2200});
    reanimator.revivesLeft--; reanimator.reviveAt=now+C.enemyEcology.reanimatorDelayMs+1700;
    addText(reanimator.x+reanimator.w/2,reanimator.y,'REANIMACIÓN','#d8a3ff',950,0,-14,true); A().reanimator();
    return true;
  }

  function spawnBreederDrone(breeder,now){
    const cap=G.layout?.portrait?C.enemyEcology.breederDroneCapMobile:C.enemyEcology.breederDroneCapDesktop;
    const existing=G.enemies.filter(e=>e.alive&&e.role==='breedDrone').length;
    if(existing>=cap) return;
    const size=Math.max(20,(G.layout?.ew||28)*.68), sx=breeder.x+breeder.w/2-size/2, sy=breeder.y+breeder.h*.55;
    G.enemies.push({kind:'drone',role:'breedDrone',x:sx,y:sy,w:size,h:size*.78,renderH:size*1.12,hp:1,maxHp:1,alive:true,t:0,startX:sx,startY:sy,targetX:clamp(G.px+rand(-80,80),12,G.w-size-12),score:24,color:'#8cff9b',droneShot:false,droneDuration:G.layout?.portrait?2500:2150,familyWorld:integratedWorld()?.id||0,familyRole:'swarmer',familySeed:Math.random()*10});
    const ft=familyTactic(enemyFamilyWorld(breeder)); breeder.breedAt=now+C.enemyEcology.breederIntervalMs*(ft?.breederMul||1)*rand(.86,1.18); A().breeder();
  }

  function shootEcologyEnemy(e){
    const cx=e.x+e.w/2, cy=e.y+e.h, ft=familyTactic(enemyFamilyWorld(e));
    if(e.kind==='sentinel'){
      const mul=ft?.id==='leviathan_tide'?1.22:1;
      fireEnemyBullet(cx,cy,-72*mul,265,5.2*mul,ft?.id==='leviathan_tide'?'#5ee8ff':'#76f3e8',1,'ring');
      fireEnemyBullet(cx,cy,72*mul,265,5.2*mul,ft?.id==='leviathan_tide'?'#5ee8ff':'#76f3e8',1,'ring'); A().sentinelShield();
    } else if(e.kind==='reanimator'){
      if(ft?.id==='nebula_phase'){
        fireAimed(cx-5,cy,300,5.0,'#7ce8ff',1,'ring',24); fireAimed(cx+5,cy,300,4.6,'#d594ff',1,'seeker',24);
      } else fireAimed(cx,cy,285,4.8,'#d894ff',1,'seeker',34); A().reanimator();
    } else if(e.kind==='breeder'){
      if(ft?.id==='arachnid_web'){
        for(const vx of [-58,0,58]){ const q=fireEnemyBullet(cx,cy,vx,286,4.3,'#a6ff9c',1,'petal'); if(q){q.webSlow=true;q.familyWorld=4;} }
      } else { fireEnemyBullet(cx-7,cy,-35,278,4.1,'#8dff96',1,'petal'); fireEnemyBullet(cx+7,cy,35,278,4.1,'#8dff96',1,'petal'); }
      A().breeder();
    }
  }

  function buildBossModules(bossHp){
    if(!C.bossModules?.enabled) return [];
    const arr=C.bossModules.countBySector||[2];
    const count=arr[Math.min(arr.length-1,Math.max(0,G.sector-1))]||2;
    const hp=Math.max(7,Math.round(bossHp*(C.bossModules.hpRatio||.075)));
    return Array.from({length:count},(_,i)=>({alive:true,hp,maxHp:hp,angle:(Math.PI*2*i)/count,dir:i%2?1:-1,id:i}));
  }
  function bossModulePos(e,node,now=performance.now()){
    const a=(node.angle||0)+now*(C.bossModules?.orbitSpeed||.00115)*(node.dir||1);
    return {x:e.x+e.w/2+Math.cos(a)*e.w*(C.bossModules?.orbitRadiusX||.58),y:e.y+e.h*.48+Math.sin(a)*e.h*(C.bossModules?.orbitRadiusY||.42),a};
  }
  function bossModuleRadius(e){ return clamp(Math.max(e.w,e.h)*(C.bossModules?.radiusRatio||.065),C.bossModules?.minRadius||10,C.bossModules?.maxRadius||18); }
  function destroyBossModule(e,node,now=performance.now()){
    if(!node?.alive) return;
    node.alive=false; node.hp=0; const pos=bossModulePos(e,node,now);
    explode(pos.x,pos.y,'#7fe7ff',12,110); addText(pos.x,pos.y,'MÓDULO ROTO','#9cf2ff',800,0,-12,true); G.score+=90*G.sector; objectiveEvent('bosspart',1);
    const left=(e.armorNodes||[]).filter(n=>n.alive).length;
    if(left===0 && !e.modulesDisabled){
      e.modulesDisabled=true;
      const strip=(e.fortressMax||0)*(C.bossModules?.allBrokenFortressStrip||.46);
      e.fortressHp=Math.max(0,(e.fortressHp||0)-strip);
      UI().flashMsg('GENERADORES DE FORTALEZA DESTRUIDOS',1050);
      addText(e.x+e.w/2,e.y+e.h*.18,'FORTALEZA INESTABLE','#baf5ff',1100,0,-14,true);
      if((e.fortressHp||0)<=0) openBossCore(e,C.bossModules?.allBrokenCoreExposeMs||3200,'MÓDULOS DESTRUIDOS · NÚCLEO ABIERTO');
    }
  }
  function hitBossModule(b,now){
    for(const e of G.enemies){
      if(!e.alive||e.role!=='boss'||!e.armorNodes?.length) continue;
      const rr=bossModuleRadius(e);
      for(const node of e.armorNodes){
        if(!node.alive) continue;
        const pos=bossModulePos(e,node,now);
        if(circleRect(pos.x,pos.y,rr,{x:b.x,y:b.y,w:b.w,h:b.h})){
          if(now<(e.introUntil||0)){ explode(pos.x,pos.y,'#d8f7ff',2,42); return true; }
          const beforeHp=node.hp; const dealt=b.damage*(b.isMissile?1.35:1);
          node.hp-=dealt; M()?.noteDamage?.(Math.min(beforeHp,dealt),'module',now);
          explode(pos.x,pos.y,'#8de9ff',3,58);
          if(node.hp<=0) destroyBossModule(e,node,now);
          return true;
        }
      }
    }
    return false;
  }

  function buildBossHardpoints(bossHp){
    if(!C.bossHardpoints?.enabled) return [];
    const arr=C.bossHardpoints.countBySector||[2];
    const count=arr[Math.min(arr.length-1,Math.max(0,G.sector-1))]||2;
    const defs=[
      {id:'left_weapon',label:'ARMAMENTO IZQ.',rx:-.29,ry:.02},
      {id:'right_weapon',label:'ARMAMENTO DER.',rx:.29,ry:.02},
      {id:'regulator',label:'REGULADOR',rx:0,ry:.20},
      {id:'drive',label:'PROPULSIÓN',rx:0,ry:-.24}
    ];
    const hp=Math.max(8,Math.round(bossHp*(C.bossHardpoints.hpRatio||.052)));
    return defs.slice(0,count).map((d,i)=>({...d,alive:true,hp,maxHp:hp,idNum:i}));
  }
  function bossHardpointPos(e,part){
    return {x:e.x+e.w/2+(part.rx||0)*e.w,y:e.y+e.h/2+(part.ry||0)*e.h};
  }
  function bossHardpointRadius(e){
    return clamp(Math.max(e.w,e.h)*(C.bossHardpoints?.radiusRatio||.072),C.bossHardpoints?.minRadius||11,C.bossHardpoints?.maxRadius||18);
  }
  function hardpointAlive(e,id){ return !!(e.hardpoints||[]).find(p=>p.id===id&&p.alive); }
  function bossWeaponCooldownMul(e){
    if(!e?.hardpoints?.length) return 1;
    let broken=0; if(!hardpointAlive(e,'left_weapon')) broken++; if(!hardpointAlive(e,'right_weapon')) broken++;
    return 1+broken*(C.bossHardpoints?.weaponCooldownPenalty||.24);
  }
  function destroyBossHardpoint(e,part,now=performance.now()){
    if(!part?.alive) return;
    part.alive=false; part.hp=0; const pos=bossHardpointPos(e,part);
    explode(pos.x,pos.y,part.id==='regulator'?'#ffe28a':'#ff9c7d',15,125);
    addText(pos.x,pos.y,`${part.label} FUERA`,'#fff0c2',950,0,-13,true);
    G.score+=110*G.sector; objectiveEvent('bosspart',1);
    if(part.id==='regulator'){
      e.regulatorDisabled=true;
      const strip=(e.fortressMax||0)*(C.bossHardpoints?.regulatorFortressStrip||.24);
      e.fortressHp=Math.max(0,(e.fortressHp||0)-strip);
      e.fortressRechargeAt=0; e.fortressRechargeRatio=0;
      UI().flashMsg('REGULADOR DE FORTALEZA DESTRUIDO',1000);
      if((e.fortressHp||0)<=0) openBossCore(e,2200,'REGULADOR ROTO · NÚCLEO ABIERTO');
    } else if(part.id==='drive'){
      e.driveDisabled=true;
      UI().flashMsg('PROPULSIÓN DEL JEFE DAÑADA',950);
    }
    const left=(e.hardpoints||[]).filter(p=>p.alive).length;
    if(left===0){
      const strip=(e.fortressMax||0)*(C.bossHardpoints?.allBrokenFortressStrip||.20);
      e.fortressHp=Math.max(0,(e.fortressHp||0)-strip);
      openBossCore(e,C.bossHardpoints?.allBrokenCoreExposeMs||2600,'SISTEMAS CRÍTICOS DESTRUIDOS');
      UI().flashMsg('JEFE DESARTICULADO · VENTANA CRÍTICA',1150);
    }
  }
  function hitBossHardpoint(b,now){
    for(const e of G.enemies){
      if(!e.alive||e.role!=='boss'||!e.hardpoints?.length) continue;
      const rr=bossHardpointRadius(e);
      for(const part of e.hardpoints){
        if(!part.alive) continue;
        const pos=bossHardpointPos(e,part);
        if(circleRect(pos.x,pos.y,rr,{x:b.x,y:b.y,w:b.w,h:b.h})){
          if(now<(e.introUntil||0)){ explode(pos.x,pos.y,'#fff0c2',2,42); return true; }
          let dmg=b.damage*(b.isMissile?1.28:1);
          if((e.fortressHp||0)>0 && now>=(e.coreOpenUntil||0)) dmg*=C.bossHardpoints?.shieldedDamageMul||.42;
          const beforeHp=part.hp; part.hp-=dmg; M()?.noteDamage?.(Math.min(beforeHp,dmg),'hardpoint',now);
          explode(pos.x,pos.y,part.id==='regulator'?'#ffe28a':'#ffab83',3,60);
          if(part.hp<=0) destroyBossHardpoint(e,part,now);
          return true;
        }
      }
    }
    return false;
  }

  function openBossCore(e,duration=C.bossCore.exposeMs,reason='NÚCLEO EXPUESTO'){
    if(!e || !e.alive) return;
    const now=performance.now();
    e.coreOpenUntil=Math.max(e.coreOpenUntil||0,now+duration); e.coreReason=reason; e.nextCoreAt=now+C.bossCore.periodicEveryMs;
    addText(e.x+e.w/2,e.y+e.h*.35,reason,'#fff1a6',900,0,-12,true); A().coreExpose();
  }

  function bossPhaseIndex(e){
    const r=e.maxHp?e.hp/e.maxHp:1;
    return r>C.combatDirector.bossPhase2Hp?0:r>C.combatDirector.bossPhase3Hp?1:2;
  }
  function subbossPhaseIndex(e){
    const r=e.maxHp?e.hp/e.maxHp:1;
    if(r <= (C.subbossFortress?.finalThreshold||.26)) return 2;
    return r <= (C.subbossFortress?.phaseThreshold||.58) ? 1 : 0;
  }
  function openSubbossCore(e,duration=C.subbossFortress?.breakExposeMs||1400,reason='SUBJEFE EXPUESTO'){
    if(!e||!e.alive||!['miniboss','guardian'].includes(e.role)) return;
    const now=performance.now(); e.subExposeUntil=Math.max(e.subExposeUntil||0,now+duration);
    addText(e.x+e.w/2,e.y+e.h*.35,reason,'#ffd79a',760,0,-11,true); G.threatPulseUntil=now+320;
  }
  function rechargeSubbossShield(e,ratio,label='ESCUDO DEL SUBJEFE'){
    if(!e||!e.alive||!['miniboss','guardian'].includes(e.role)||!C.subbossFortress?.enabled) return;
    const add=e.maxHp*(ratio||0); e.subShieldMax=Math.max(e.subShieldMax||0,e.maxHp*(C.subbossFortress.initialShieldRatio||.4));
    e.subShieldHp=Math.min(e.subShieldMax,(e.subShieldHp||0)+add);
    if(add>0) addText(e.x+e.w/2,e.y+e.h*.2,label,'#8fe7ff',720,0,-11,true);
  }
  function rechargeBossFortress(e,ratio,label='FORTALEZA REACTIVADA'){
    if(!e || e.role!=='boss' || !e.alive || e.modulesDisabled || e.regulatorDisabled) return;
    const add=Math.max(0,e.maxHp*(ratio||0));
    e.fortressMax=Math.max(e.fortressMax||0,e.maxHp*bossFortressRatio());
    e.fortressHp=Math.min(e.fortressMax,(e.fortressHp||0)+add);
    if(add>0){ addText(e.x+e.w/2,e.y+e.h*.2,label,'#79e7ff',900,0,-14,true); G.threatPulseUntil=performance.now()+420; }
  }
  function bossFortressPower(e,ph,now){
    if(!e || now<(e.coreOpenUntil||0)) return;
    const ratio=C.bossFortress.pulseRechargeRatio[ph]||.04;
    if(!e.modulesDisabled) rechargeBossFortress(e,ratio,'FORTALEZA ADAPTATIVA');
    const cx=e.x+e.w/2, cy=e.y+e.h*.7;
    const count=C.bossFortress.pulseProjectileCount[ph]||6;
    for(let i=0;i<count;i++){
      const a=Math.PI*.18 + i*(Math.PI*.64/Math.max(1,count-1));
      const sp=225+ph*35;
      fireEnemyBullet(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,5.2,'#78ddff',1,'ring');
    }
    if(ph>=1) spawnBossEscort(e,ph);
    signatureCue(e,'FORTALEZA ADAPTATIVA','#7eeaff',true);
  }
  function announceBossPhase(e,ph){
    if((e.phaseAnnounced??-1)>=ph) return;
    e.phaseAnnounced=ph;
    if(ph>0){ const now=performance.now(); e.phaseStartedAt=now; e.pressureLevel=0; e.signaturePhase=ph; e.huntPending=false; e.huntWindupUntil=0; e.huntEscapeCheckAt=0; e.huntNextAt=now+2200; e.nextSignatureAt=now+(C.combatFlow?.bossPhaseSignatureDelayMs?.[ph]||900); UI().flashMsg(`JEFE · FASE ${ph+1}`,900); A().bossPhase(ph+1); G.threatPulseUntil=now+520; openBossCore(e,C.bossCore.phaseExposeMs,`FASE ${ph+1} · NÚCLEO ABIERTO`); e.fortressRechargeAt=now+C.bossCore.phaseExposeMs+180; e.fortressRechargeRatio=C.bossFortress.phaseRechargeRatio[ph]||.18; e.fortressPulseAt=e.fortressRechargeAt+(C.bossFortress.powerCooldownMs[ph]||6000); }
  }
  function spawnBossEscort(e,ph,opts={}){
    const existing=G.enemies.filter(x=>x.alive&&x.role==='escort').length;
    const cap=G.layout?.portrait?2:4; if(existing>=cap) return;
    const count=ph>=2 && !G.layout?.portrait?2:1;
    const size=Math.max(24,(G.layout?.ew||30)*.9);
    for(let i=0;i<count;i++){
      const sx=clamp(e.x+e.w*(count===1 ? .5:(i ? .72:.28)),12,G.w-size-12);
      const kc=C.encounterEvolution?.kamikaze||{}, kamikaze=opts.forceKamikaze??(!!kc.enabled && Math.random()<((kc.escortChanceByPhase||[])[ph]||.45));
      const identity=e.identity?.id||'nova'; let escortRole=opts.forcedRole||'';
      if(!escortRole) escortRole=kamikaze?'rammer':identity==='brood'?'hunter':identity==='lancer'?'interceptor':identity==='gravity'?'orbiter':'gunner';
      const ehp=3+Math.floor(G.sector/2)+(escortRole==='gunner'?1:0);
      const lockedTargetX=clamp(G.px+rand(-90,90),18,G.w-size-18);
      G.enemies.push({kind:'diver',role:'escort',x:sx,y:e.y+e.h*.55,w:size,h:size*.82,renderH:size*1.28,hp:ehp,maxHp:ehp,alive:true,t:0,escortElapsed:0,escortDuration:ph>=2?2700:3200,startX:sx,startY:e.y+e.h*.55,targetX:lockedTargetX,score:65,color:'#ff9f8d',escortShot:false,escortShot2:false,kamikaze,kamikazeArmedAt:kamikaze?performance.now()+(kc.telegraphMs||520):0,escortRole,familyWorld:integratedWorld()?.id||0,familyRole:'hunter',familySeed:Math.random()*10});
    }
    A().enemyDive();
  }


  function bossHuntKind(e){
    const id=e.identity?.id||'nova'; if(id==='lancer') return 'PINCER'; if(id==='brood') return 'HUNTER_SWARM'; if(id==='gravity') return 'GRAVITY_SWEEP'; if(id==='phoenix') return 'PHOENIX_CUT'; return 'SOLAR_SWEEP';
  }
  function fireBossHuntPattern(e,ph,now){
    const cfg=C.encounterEvolution?.hunterDoctrine||{}, cx=e.x+e.w/2,cy=e.y+e.h*.72,tx=e.huntTargetX??G.px,ty=e.huntTargetY??G.py,kind=e.huntKind||bossHuntKind(e);
    const mobile=!!G.layout?.portrait&&G.w<=520, cap=mobile?(cfg.maxExtraProjectilesMobile||4):(cfg.maxExtraProjectilesDesktop||6), sp=330+ph*28+G.sector*6;
    if(kind==='PINCER'){
      const n=Math.min(cap,ph>=2?5:4); for(let i=0;i<n;i++){ const o=(i-(n-1)/2)*44; decorateEnemyBullet(fireTowardPoint(cx+o,cy,tx-o*.9,ty,sp+55,4.6,'#c9e7ff',1,'lance'),{turnRate:(i<(n/2)?-.10:.10),accel:.07}); }
    } else if(kind==='HUNTER_SWARM'){
      spawnBossEscort(e,ph,{forcedRole:'hunter',forceKamikaze:false}); if(ph>=2&&!mobile) spawnBossEscort(e,ph,{forcedRole:'hunter',forceKamikaze:false});
      for(const o of [-.22,.22]) decorateEnemyBullet(fireTowardPoint(cx+e.w*o,cy,tx,ty,sp+20,4.5,'#e8b0ff',1,'seeker'),{homeStrength:.55,homeDelay:520});
    } else if(kind==='GRAVITY_SWEEP'){
      const n=Math.min(cap,ph>=2?6:4); for(let i=0;i<n;i++){ const dir=i%2?-1:1, vx=dir*(110+i*18); decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp-55,5.1,'#95ecff',1,'scythe'),{turnRate:dir*.66,brake:.035,waveAmp:12}); }
    } else if(kind==='PHOENIX_CUT'){
      const n=Math.min(cap,ph>=2?6:4); for(let i=0;i<n;i++){ const off=(i-(n-1)/2)*52; decorateEnemyBullet(fireTowardPoint(cx,cy,tx+off,ty,sp+10,4.6,'#ffd18c',1,'petal'),{waveAmp:18,wavePeriod:420,wavePhase:i*.55}); }
    } else {
      const n=Math.min(cap,ph>=2?6:4); for(let i=0;i<n;i++){ const off=(i-(n-1)/2)*48; decorateEnemyBullet(fireTowardPoint(cx,cy,tx+off,ty,sp,4.6,'#ffad7e',1,'scythe'),{turnRate:off<0?-.32:off>0?.32:0}); }
    }
    e.huntPending=false; e.huntWindupUntil=0; e.huntSerial=(e.huntSerial||0)+1; e.huntDamageBaseline=G.waveDamageTaken||0; e.huntEscapeCheckAt=now+(cfg.escapeCheckMs||720);
    const iv=(cfg.intervalMsByPhase||[])[ph]||[5600,7600]; e.huntNextAt=now+rand(iv[0],iv[1]); e.nextShot=Math.max(e.nextShot||0,now+520); G.threatPulseUntil=now+420;
  }
  function updateBossHunterDoctrine(e,ph,now){
    const cfg=C.encounterEvolution?.hunterDoctrine||{}; if(!cfg.enabled||ph<(cfg.fromPhase??1)) return;
    const snap=combatPatternSnapshot(now);
    if(e.huntEscapeCheckAt&&now>=e.huntEscapeCheckAt){
      const clean=(G.waveDamageTaken||0)<=(e.huntDamageBaseline||0), far=Math.abs(G.px-(e.huntTargetX||G.px))>=G.w*(cfg.escapeDistanceRatio||.18);
      if(clean&&far){ const bonus=(cfg.cleanEscapeScore||85)*(ph+1); G.score+=bonus; addText(G.px,G.py-34,`LECTURA TÁCTICA +${bonus}`,'#b8ffca',760,0,-10,true); }
      e.huntEscapeCheckAt=0;
    }
    if(e.huntPending){ if(now>=(e.huntWindupUntil||0)) fireBossHuntPattern(e,ph,now); return; }
    if(now<(e.huntNextAt||0)||e.signaturePending||now<(e.recoveryUntil||0)||now<(e.coreOpenUntil||0)||now<(e.bossSurgeUntil||0)) return;
    if(!snap.ready||(!snap.camped&&!snap.repeat)){ e.huntNextAt=now+(cfg.idleRecheckMs||950); return; }
    const tele=(cfg.telegraphMsByPhase||[980,860,760])[ph]||860;
    e.huntPending=true; e.huntWindupStart=now; e.huntWindupUntil=now+tele; e.huntTargetX=clamp(snap.mean*G.w,20,G.w-20); e.huntTargetY=G.py; e.huntKind=bossHuntKind(e); e.huntPatternReason=snap.camped?'CAMPING':'REPETICIÓN';
    e.nextSignatureAt=Math.max(e.nextSignatureAt||0,e.huntWindupUntil+900);
    G.threatPulseUntil=now+Math.min(tele,620); addText(e.x+e.w/2,e.y-24,`⚠ CONTRAPATRÓN · ${e.huntPatternReason}`,'#ffcf86',Math.min(tele+160,1100),0,-9,true);
  }

  function mutateBossSignature(e,ph,serial=0){
    const cfg=C.encounterEvolution?.battleRhythm||{}; if(!cfg.enabled || ph<(cfg.mutationFromPhase??1) || ((serial+1)%(cfg.mutationEvery||1))!==0) return;
    const cx=e.x+e.w/2, cy=e.y+e.h*.72, id=e.identity?.id||'nova', flip=(serial%2)?-1:1;
    if(id==='lancer'){
      decorateEnemyBullet(fireTowardPoint(cx-e.w*.38,cy,G.px+110*flip,G.py,390+ph*24,4.7,'#d9ecff',1,'lance'),{turnRate:.14*flip,accel:.07});
      decorateEnemyBullet(fireTowardPoint(cx+e.w*.38,cy,G.px-110*flip,G.py,390+ph*24,4.7,'#d9ecff',1,'lance'),{turnRate:-.14*flip,accel:.07});
    } else if(id==='brood'){
      for(const o of [-.28,.28]) decorateEnemyBullet(fireAimed(cx+e.w*o,cy,340+ph*24,4.6,'#f0b0ff',1,'seeker',26),{homeStrength:.74+ph*.08,homeDelay:360});
    } else if(id==='gravity'){
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-180*flip,300+ph*22,5.2,'#b6f5ff',1,'scythe'),{turnRate:-.72*flip});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,180*flip,300+ph*22,5.2,'#b6f5ff',1,'scythe'),{turnRate:.72*flip});
    } else if(id==='phoenix'){
      for(const vx of [-130,-65,65,130]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx*flip,315+ph*18,4.6,'#ffd18a',1,'petal'),{waveAmp:20,wavePeriod:430,wavePhase:vx*.01});
    } else {
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-165*flip,315+ph*20,4.8,'#ffb080',1,'scythe'),{turnRate:-.70*flip});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,165*flip,315+ph*20,4.8,'#ffb080',1,'scythe'),{turnRate:.70*flip});
    }
    e.signatureMutationSerial=(e.signatureMutationSerial||0)+1;
  }

  function armBossCounterWindow(e,ph,now){
    const cfg=C.encounterEvolution?.battleRhythm||{}; if(!cfg.enabled) return;
    const delays=cfg.signatureCounterDelayMsByPhase||[620,540,460];
    e.counterOpenAt=now+(delays[ph]||540); e.signatureDamageBaseline=G.waveDamageTaken||0; e.counterPhase=ph;
  }

  function updateBossCounterWindow(e,now){
    const cfg=C.encounterEvolution?.battleRhythm||{}; if(!cfg.enabled || !e.counterOpenAt || now<e.counterOpenAt) return;
    const ph=e.counterPhase??bossPhaseIndex(e), clean=(G.waveDamageTaken||0)<=(e.signatureDamageBaseline||0)+(cfg.perfectDodgeTolerance||.001);
    const windows=cfg.counterWindowMsByPhase||[1320,1140,980], normal=cfg.counterCoreExposeMsByPhase||[720,640,560], perfect=cfg.perfectDodgeCoreExposeMsByPhase||[1480,1280,1080];
    e.counterOpenAt=0; e.recoveryUntil=Math.max(e.recoveryUntil||0,now+(windows[ph]||980));
    openBossCore(e,clean?(perfect[ph]||1080):(normal[ph]||560),clean?'ESQUIVA LIMPIA · CONTRAATAQUE':'RECUPERACIÓN · NÚCLEO VISIBLE');
    if(clean){ G.score+=60*(ph+1)*G.sector; addText(e.x+e.w/2,e.y+e.h*.2,'CONTRAATAQUE +BONUS','#b8ffca',780,0,-11,true); A().combo?.(Math.max(5,G.combo)); }
  }

  function triggerBossSignature(e,ph,now){
    if(!e?.alive || now<(e.introUntil||0) || now<(e.phaseGateUntil||0) || now<(e.resurrectUntil||0) || e.huntPending) return false;
    const names=['FIRMA TÁCTICA I','FIRMA TÁCTICA II','FIRMA TÁCTICA III'];
    const label=e.identity?.signature||names[ph]||'ATAQUE SIGNATURE';
    if(!e.signaturePending){
      const telegraph=(C.combatFlow?.bossSignatureTelegraphMs?.[ph]||820)*(e.emergencyReboot?.86:1);
      e.signaturePending=true; e.signatureWindupStart=now; e.signatureWindupUntil=now+telegraph;
      e.signatureTargetX=G.px; e.signatureTargetY=G.py; e.signatureDamageBaseline=G.waveDamageTaken||0;
      e.signatureLabel=label; e.signatureColor=e.identity?.accent||'#fff0a6';
      e.signatureUntil=e.signatureWindupUntil+420;
      G.threatPulseUntil=now+Math.min(telegraph,620);
      addText(e.x+e.w/2,e.y-12,`⚠ ${label}` ,e.signatureColor,Math.min(telegraph+180,1120),0,-10,true);
      e.nextSignatureAt=e.signatureWindupUntil;
      return false;
    }
    if(now<(e.signatureWindupUntil||0)) return false;
    e.signaturePending=false; e.signatureWindupUntil=0;
    signatureCue(e,label,e.identity?.accent||'#fff0a6',true);
    const signatureSerial=e.signatureCount||0;
    shootBoss(e,ph,{signature:true});
    mutateBossSignature(e,ph,signatureSerial);
    armBossCounterWindow(e,ph,now);
    e.signatureCount=signatureSerial+1;
    const cd=(C.combatFlow?.bossPhaseSignatureCooldownMs?.[ph]||5200)*(e.emergencyReboot ? .82:1);
    e.nextSignatureAt=now+cd;
    e.nextShot=Math.max(e.nextShot||0,now+620);
    if(ph>=1 && (e.signatureCount%2===0)) spawnBossEscort(e,ph);
    return true;
  }

  function spawnMicroSwarm(now){
    if(!C.microSwarm?.enabled) return;
    const mobile=!!G.layout?.portrait&&G.w<=520;
    const range=mobile?C.microSwarm.mobileCount:C.microSwarm.desktopCount;
    const count=Math.round(rand(range[0],range[1]));
    const fromLeft=Math.random()<.5;
    const size=Math.max(18,(G.layout?.ew||30)*.66);
    const wc=integratedWorld();
    for(let i=0;i<count;i++){
      const sx=fromLeft?-size-i*14:G.w+size+i*14;
      const sy=G.h*rand(.19,.33)+i*9;
      const kc=C.encounterEvolution?.kamikaze||{}; const kamikaze=!!kc.enabled && Math.random()<(kc.microChance||.42);
      const tx=kamikaze?clamp(G.px+rand(-55,55),8,G.w-size-8):G.w*(fromLeft?rand(.56,.88):rand(.12,.44));
      const ty=kamikaze?Math.min(G.h*.86,G.py+(kc.diveDepthOffset||14)):G.h*rand(.54,.72);
      const dur=rand(C.microSwarm.durationMs[0],C.microSwarm.durationMs[1]);
      G.enemies.push({kind:i%3===0?'diver':'raider',role:'microSwarm',x:sx,y:sy,w:size,h:size*.76,renderH:size*1.30,hp:Math.max(2,C.microSwarm.hpBase+(G.sector>=3?1:0)),maxHp:Math.max(2,C.microSwarm.hpBase+(G.sector>=3?1:0)),alive:true,t:0,microStart:now,microDuration:dur,startX:sx,startY:sy,targetX:tx,targetY:ty,score:24+G.sector*3,color:'#86dfff',microShot:false,kamikaze,kamikazeArmedAt:kamikaze?now+(kc.telegraphMs||520):0,familyWorld:wc?.id||0,familyRole:i%3===0?'hunter':'swarmer',familySeed:Math.random()*10});
    }
    G.microSwarmBursts++; G.microSwarmSerial++; G.microSwarmNextAt=now+rand(C.microSwarm.intervalMs[0],C.microSwarm.intervalMs[1]);
    addText(G.w*(fromLeft ? .24:.76),G.h*.27,'MICRO-ENJAMBRE','#a7e8ff',650,0,-10,true);
  }
  function updateMicroSwarmDirector(now){
    if(!C.microSwarm?.enabled || G.wave<C.microSwarm.fromWave || G.phase==='boss' || G.phase==='reward' || G.subphase>0) return;
    const max=(C.microSwarm.maxBurstsByWave||{})[G.wave]||0;
    if(G.microSwarmBursts>=max || now<(G.microSwarmNextAt||0)) return;
    const core=G.enemies.filter(e=>e.alive&&['formation','guardian','miniboss','diver','reviving'].includes(e.role)).length;
    const expected=Math.max(1,(G.layout?.cols||8)*(G.layout?.rows||5));
    if(core>0 && core<=Math.max(6,Math.floor(expected*(C.microSwarm.triggerAliveRatio||.42)))) spawnMicroSwarm(now);
  }


  function triggerKamikazeChain(e,now=performance.now()){
    const kc=C.encounterEvolution?.kamikaze||{}; if(!e?.kamikaze || e.chainDetonated || !kc.chainRadius) return;
    e.chainDetonated=true; const cx=e.x+e.w/2, cy=e.y+e.h/2, radius=kc.chainRadius||96;
    explode(cx,cy,'#ffd08a',16,radius); addText(cx,cy-14,'DETONACIÓN TÁCTICA','#ffe09a',620,0,-10,true);
    let chained=0;
    for(const other of [...G.enemies]){
      if(!other?.alive || other===e) continue;
      const d=Math.hypot(other.x+other.w/2-cx,other.y+other.h/2-cy); if(d>radius) continue;
      const dmg=other.role==='boss'?(kc.chainBossDamage||.42):(kc.chainDamage||3.2);
      if(applySpecialEnemyDamage(other,dmg,'kamikaze-chain',now)>0) chained++;
    }
    if(chained){ const bonus=(kc.chainScoreBonus||18)*chained*G.sector; G.score+=bonus; addText(cx,cy+10,`CADENA x${chained} +${bonus}`,'#fff0a8',720,0,-8,true); }
  }

  function destroyKamikaze(e,reason='AUTOEXPLOSIÓN'){
    if(!e||!e.alive) return;
    e.alive=false; e.deathHandled=true;
    const cx=e.x+e.w/2, cy=e.y+e.h/2;
    explode(cx,cy,e.eliteColor||e.color||'#ff8c72',e.eliteClass?16:12,C.encounterEvolution?.kamikaze?.explosionRadius||74);
    addText(cx,cy-10,reason,'#ffb08d',520,0,-8,true); A().boom?.();
  }
  function handleEnemyPlayerContact(e,playerRect,now){
    if(!e?.alive) return false;
    const evo=C.encounterEvolution||{}, kc=evo.kamikaze||{};
    const contact=rectHit(enemyHitRect(e),playerRect);
    const ecx=e.x+e.w/2, ecy=e.y+e.h/2, proximity=!!e.kamikaze && now>=(e.kamikazeArmedAt||0) && Math.hypot(ecx-G.px,ecy-G.py)<=((kc.proximityRadius||34)+Math.min(e.w,e.h)*.28);
    if(!contact && !proximity) return false;
    if(now<(e.contactCooldownUntil||0)) return true;
    if(e.role==='boss'){
      const ph=bossPhaseIndex(e); e.contactCooldownUntil=now+(evo.bossContactCooldownMs||780);
      if(now>G.invulnUntil) damagePlayer((evo.bossContactDamageByPhase||[2,2.5,3])[ph]||2.4,'EMBESTIDA DEL JEFE');
      const sep=evo.contactSeparationPx||34; G.py=clamp(G.py+sep,G.layout?.topFree||40,G.h-(G.layout?.playerH||64)*.35); e.y=Math.max(44,e.y-sep*.35);
      G.shake=Math.max(G.shake||0,11); return true;
    }
    if(e.role==='miniboss'||e.role==='guardian'){
      e.contactCooldownUntil=now+(evo.subbossContactCooldownMs||720);
      if(now>G.invulnUntil) damagePlayer((evo.subbossContactDamage||2)*(e.role==='miniboss'?1.18:1),'IMPACTO DEL SUBJEFE');
      e.y=Math.max(48,e.y-(evo.contactSeparationPx||34)*.28); G.py=Math.min(G.h-24,G.py+(evo.contactSeparationPx||34)*.72); G.shake=Math.max(G.shake||0,9); return true;
    }
    const kamikazeRoles=['diver','escort','hordeDiver','microSwarm','breedDrone'];
    if(e.kamikaze || kamikazeRoles.includes(e.role)){
      if(now>G.invulnUntil) damagePlayer(e.eliteClass?(kc.eliteContactDamage||2.9):(kc.contactDamage||2.25),e.kamikaze?'AUTOEXPLOSIÓN':'IMPACTO SUICIDA');
      destroyKamikaze(e,e.kamikaze?'KAMIKAZE':'IMPACTO'); return true;
    }
    if(now>G.invulnUntil) damagePlayer(1.35,'COLISIÓN');
    e.contactCooldownUntil=now+650; return true;
  }

  function updateEnemies(dt, now){
    const hs=playerHitScale();
    const D=directorState(now);
    const hitW=Math.max(26,(G.layout?.playerH||64)*.43*hs), hitH=Math.max(36,(G.layout?.playerH||64)*.66*hs);
    const playerRect = {x:G.px-hitW/2,y:G.py-hitH/2,w:hitW,h:hitH};
    G.enemies.forEach(e=>{
      if(!e.alive) return;
      updateFamilyTactic(e,dt,now);
      if(e.role==='formation' && e.coordinatedShotUntil) resolveCoordinatedShot(e,now);
      if(e.role==='guardian'){
        e.t += dt/1000;
        const sph=e.familyWorld?subbossPhaseIndex(e):0, plev=e.familyWorld?subbossPressureLevel(e,now):0, pMove=(C.enduranceDirector?.subbossPressureMoveMul||[1,1,1])[plev]||1, rageMove=(sph>=2?(C.subbossFortress?.finalMoveMul||1.34):sph===1?(C.subbossFortress?.rageMoveMul||1.18):1)*pMove;
        e.subRageMul=rageMove;
        if(sph>=2 && !e.subFinalTriggered){ e.subFinalTriggered=true; e.subPhaseSignatureAt=now+360; G.threatPulseUntil=now+650; UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · FURIA FINAL`,780); }
        if(plev>(e.subPressureLevel||0)){ e.subPressureLevel=plev; UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · PRESIÓN ${plev===2?'II':'I'}`,700); }
        updateSubbossMotion(e,now,dt,plev);
        if(!e.subOpeningSignatureUsed && now>=(e.subOpeningSignatureAt||0)){ shootGuardian(e); e.subOpeningSignatureUsed=true; scheduleSubbossRecovery(e,sph,now); e.nextShot=Math.max(e.nextShot||0,now+760); }
        if(e.subPhaseSignatureAt && now>=e.subPhaseSignatureAt){ shootGuardian(e); e.subPhaseSignatureAt=0; scheduleSubbossRecovery(e,sph,now); e.nextShot=Math.max(e.nextShot||0,now+720); }
        if(now>e.nextShot && now>=(e.subRecoveryUntil||0)){ if(now>=(e.subSignatureNextAt||Infinity)){ shootGuardian(e); scheduleSubbossRecovery(e,sph,now); } else shootSubbossBasic(e,sph); const rageCd=sph>=2?(C.subbossFortress?.finalFireCdMul||.58):sph===1?(C.subbossFortress?.rageFireCdMul||.74):1, pFire=(C.enduranceDirector?.subbossPressureFireMul||[1,1,1])[plev]||1; e.nextShot=now+(rand(1050,1750)-G.sector*30)*D.fireMul*difficultyProfile().fireCd*rageCd*pFire; }
      } else if(e.role==='miniboss'){
        e.t += dt/1000;
        const sph=subbossPhaseIndex(e), plev=subbossPressureLevel(e,now), pMove=(C.enduranceDirector?.subbossPressureMoveMul||[1,1,1])[plev]||1, rageMove=(sph>=2?(C.subbossFortress?.finalMoveMul||1.34):sph===1?(C.subbossFortress?.rageMoveMul||1.18):1)*pMove;
        e.subRageMul=rageMove;
        if(sph>=2 && !e.subFinalTriggered){ e.subFinalTriggered=true; e.subPhaseSignatureAt=now+320; G.threatPulseUntil=now+700; UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · FURIA FINAL`,820); }
        if(plev>(e.subPressureLevel||0)){ e.subPressureLevel=plev; UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · PRESIÓN ${plev===2?'II':'I'}`,700); }
        updateSubbossMotion(e,now,dt,plev);
        if(!e.subOpeningSignatureUsed && now>=(e.subOpeningSignatureAt||0)){ shootMiniboss(e); e.subOpeningSignatureUsed=true; scheduleSubbossRecovery(e,sph,now); e.nextShot=Math.max(e.nextShot||0,now+760); }
        if(e.subPhaseSignatureAt && now>=e.subPhaseSignatureAt){ shootMiniboss(e); e.subPhaseSignatureAt=0; scheduleSubbossRecovery(e,sph,now); e.nextShot=Math.max(e.nextShot||0,now+720); }
        if(now>e.nextShot && now>=(e.subRecoveryUntil||0)){ if(now>=(e.subSignatureNextAt||Infinity)){ shootMiniboss(e); scheduleSubbossRecovery(e,sph,now); } else shootSubbossBasic(e,sph); const rageCd=sph>=2?(C.subbossFortress?.finalFireCdMul||.58):sph===1?(C.subbossFortress?.rageFireCdMul||.74):1, pFire=(C.enduranceDirector?.subbossPressureFireMul||[1,1,1])[plev]||1; e.nextShot=now+(rand(850,1450)-G.sector*22)*D.fireMul*difficultyProfile().fireCd*rageCd*pFire; }
      } else if(e.role==='boss'){
        e.t += dt/1000;
        if(e.resurrectUntil && now<e.resurrectUntil){ e.y += Math.sin(now/55)*.35; return; }
        const ph=bossPhaseIndex(e); e.phaseIdx=ph; announceBossPhase(e,ph);
        const plev=bossPressureLevel(e,ph,now), pMove=(C.enduranceDirector?.bossPressureMoveMul||[1,1,1])[plev]||1;
        if(plev>(e.pressureLevel||0)){ e.pressureLevel=plev; UI().flashMsg(`${e.identity?.name||'JEFE'} · PRESIÓN ${plev===2?'II':'I'}`,760); addText(e.x+e.w/2,e.y+e.h*.18,plev===2?'SOBRECARGA II':'SOBRECARGA I','#ffcf8e',760,0,-12,true); }
        updateBossMotion(e,ph,now,dt,plev);
        sampleCombatPattern(now); updateBossHunterDoctrine(e,ph,now);
        updateBossCounterWindow(e,now);
        if(now>=(e.nextSignatureAt||Infinity) && now>=(e.recoveryUntil||0)) triggerBossSignature(e,ph,now);
        const escortFloor=(C.combatFlow?.bossEscortFloorByPhase?.[ph]||0), escortAlive=G.enemies.filter(x=>x.alive&&x.role==='escort').length;
        if(ph>=1 && !e.huntPending && !e.signaturePending && escortAlive<escortFloor && now>=(e.nextEscortRefillAt||0)){ spawnBossEscort(e,ph); const refill=(C.combatFlow?.bossEscortRefillCooldownMs?.[ph]||6000); e.nextEscortRefillAt=now+refill; }
        if(ph>=1 && !e.huntPending && !e.signaturePending && now>(e.summonAt||0)){ spawnBossEscort(e,ph); const escortMul=plev===2 ? .78:plev===1 ? .88:1; e.summonAt=now+(ph===2?2400:3500)*escortMul; }
        if(e.fortressRechargeAt && now>=e.fortressRechargeAt){ rechargeBossFortress(e,e.fortressRechargeRatio||.18,'MATRIZ DE FASE'); e.fortressRechargeAt=0; e.fortressRechargeRatio=0; }
        if(now>(e.fortressPulseAt||Infinity) && !e.huntPending && !e.signaturePending){ bossFortressPower(e,ph,now); const pulseMul=plev===2 ? .78:plev===1 ? .88:1; e.fortressPulseAt=now+(C.bossFortress.powerCooldownMs[ph]||6000)*pulseMul; }
        if((e.fortressHp||0)<=0 && now>(e.nextCoreAt||Infinity)){
          if(Math.random()<C.bossCore.periodicChance) openBossCore(e,C.bossCore.exposeMs,'NÚCLEO EXPUESTO');
          else e.nextCoreAt=now+C.bossCore.periodicEveryMs*.55;
        }
        if(now>e.nextShot && now>=(e.recoveryUntil||0) && !e.signaturePending && !e.huntPending){ shootBoss(e,ph,{signature:false}); const pFire=(C.enduranceDirector?.bossPressureFireMul||[1,1,1])[plev]||1; e.nextShot=now+(rand(ph===2?470:610,ph===2?820:1040)-G.sector*20)*D.fireMul*difficultyProfile().bossFireCd*bossWeaponCooldownMul(e)*pFire*(e.rebootFireCdMul||1); }
      } else if(e.role==='microSwarm'){
        e.t+=dt/1000;
        const p=clamp((now-(e.microStart||now))/(e.microDuration||2600),0,1);
        const q=Math.sin(p*Math.PI), ease=1-Math.pow(1-p,2);
        e.x=e.startX+(e.targetX-e.startX)*ease+Math.sin(p*Math.PI*5+(e.familySeed||0))*36*q;
        e.y=e.startY+(e.targetY-e.startY)*ease+Math.sin(p*Math.PI*2)*28;
        if(e.kamikaze && now>=(e.kamikazeArmedAt||0) && p>.45){ const home=(C.encounterEvolution?.kamikaze?.homingPxPerSec||120)*dt/1000; e.x+=clamp(G.px-(e.x+e.w/2),-home,home); e.y+=Math.min(home*.72,Math.max(0,G.py-e.y)); }
        if(!e.microShot && p>.48 && Math.random()<C.microSwarm.shotChance){ fireAimed(e.x+e.w/2,e.y+e.h,270+G.sector*8,3.5,'#9edfff',1,'bolt',28); e.microShot=true; }
        if(p>=1) e.alive=false;
      } else if(e.role==='hordeDiver'){
        e.t+=dt/1000;
        const sm=e.preludeSpeedMul||1;
        if(e.prelude && e.preludeSide==='left'){
          e.x+=(145+G.sector*10)*sm*dt/1000; e.y+=Math.sin(e.t*4.8+e.phase)*52*dt/1000;
        } else if(e.prelude && e.preludeSide==='right'){
          e.x-=(145+G.sector*10)*sm*dt/1000; e.y+=Math.sin(e.t*4.8+e.phase)*52*dt/1000;
        } else {
          e.y+=(G.layout?.portrait?118:155)*sm*dt/1000; e.x+=Math.sin(e.t*5.2+e.phase)*(G.layout?.portrait?48:75)*sm*dt/1000;
        }
        if(!e.hordeShot && (e.y>G.h*.18 || e.preludeSide)){ if(Math.random()<(e.preludeShotChance??1)) fireAimed(e.x+e.w/2,e.y+e.h,285+G.sector*10,3.8,'#ff9f92',1,'bolt',28); e.hordeShot=true; }
        if(e.prelude && !e.hordeShot2 && e.t>1.35 && G.sector>=2){ if(Math.random()<.52) fireAimed(e.x+e.w/2,e.y+e.h,300+G.sector*10,3.9,'#ff8c98',1,'petal',34); e.hordeShot2=true; }
        if(e.y>G.h+60 || e.x<-90 || e.x>G.w+90) e.alive=false;
      } else if(e.role==='reviving'){
        const p=clamp((now-(e.reviveStart||now))/(e.reviveDuration||900),0,1), ease=1-Math.pow(1-p,3);
        e.x=e.reviveFromX+(e.reviveHomeX-e.reviveFromX)*ease; e.y=e.reviveFromY+(e.reviveHomeY-e.reviveFromY)*ease;
        if(p>=1){ e.role='formation'; e.x=(G.formation?.x||0)+e.ox; e.y=(G.formation?.y||G.layout.startY)+e.oy; e.nextShot=now+rand(1400,2600); }
      } else if(e.role==='breedDrone'){
        e.t+=dt/1000; e.droneElapsed=(e.droneElapsed||0)+dt;
        const p=clamp(e.droneElapsed/(e.droneDuration||2300),0,1), arc=Math.sin(p*Math.PI);
        e.y=e.startY+arc*Math.min(G.h*.48,G.py-e.startY-85); e.x=e.startX+(e.targetX-e.startX)*Math.sin(p*Math.PI)+Math.sin(p*Math.PI*6+e.startX)*20;
        e.x=clamp(e.x,6,G.w-e.w-6);
        if(!e.droneShot && p>.42){ fireAimed(e.x+e.w/2,e.y+e.h,300,3.6,'#9cffac',1,'seeker',25); e.droneShot=true; }
        if(p>=1) e.alive=false;
      } else if(e.role==='escort'){
        e.t+=dt/1000; e.escortElapsed=(e.escortElapsed||0)+dt;
        const p=clamp(e.escortElapsed/(e.escortDuration||3200),0,1), arc=Math.sin(p*Math.PI), doctrine=C.encounterEvolution?.escortDoctrine||{}, er=e.escortRole||'gunner';
        const depth=er==='interceptor'?.34:er==='orbiter'?.38:e.kamikaze?.58:.43;
        e.y=e.startY+arc*Math.min(G.h*depth,G.py-e.startY-(e.kamikaze?8:95));
        e.x=e.startX+(e.targetX-e.startX)*Math.sin(p*Math.PI*.92)+Math.sin(p*Math.PI*(er==='orbiter'?6.5:5)+e.startX)*(er==='orbiter'?(doctrine.orbiterWaveAmp||26):24);
        if(er==='hunter' && p>.28){ const tr=(doctrine.hunterTrackPxPerSec||92)*dt/1000; e.x+=clamp(G.px-(e.x+e.w/2),-tr,tr); }
        if(e.kamikaze && now>=(e.kamikazeArmedAt||0) && p>.38){ const home=(C.encounterEvolution?.kamikaze?.homingPxPerSec||120)*dt/1000; e.x+=clamp(G.px-(e.x+e.w/2),-home,home); }
        e.x=clamp(e.x,8,G.w-e.w-8);
        if(!e.escortShot && p>.34){
          const cx=e.x+e.w/2,cy=e.y+e.h;
          if(er==='interceptor'){ const sp=doctrine.interceptorSpreadPx||72; fireTowardPoint(cx,cy,G.px-sp,G.py,330+G.sector*12,4,'#bde6ff',1,'lance'); fireTowardPoint(cx,cy,G.px+sp,G.py,330+G.sector*12,4,'#bde6ff',1,'lance'); }
          else if(er==='orbiter'){ fireEnemyBullet(cx,cy,-80,305+G.sector*10,4.8,'#8cecff',1,'ring'); fireEnemyBullet(cx,cy,80,305+G.sector*10,4.8,'#8cecff',1,'ring'); }
          else if(er==='hunter') decorateEnemyBullet(fireAimed(cx,cy,315+G.sector*12,4,'#e0b2ff',1,'seeker',20),{homeStrength:.45,homeDelay:420});
          else fireAimed(cx,cy,305+G.sector*12,4,'#ffac8c',1,'bolt',28);
          e.escortShot=true;
        }
        if(er==='gunner'&&!e.escortShot2&&p>.61){ fireAimed(e.x+e.w/2,e.y+e.h,330+G.sector*12,4.2,'#ffd19a',1,'bolt',18); e.escortShot2=true; }
        if(p>=1) e.alive=false;
      } else if(e.role==='diver'){
        e.t += dt/1000; e.diveElapsed=(e.diveElapsed||0)+dt;
        const p=clamp(e.diveElapsed/(e.diveDuration||3000),0,1);
        const split=e.diveStyle==='slash' ? .50:.58;
        if(p<split){
          const q=1-Math.pow(1-p/split,2);
          e.y=e.diveStartY+(e.diveDepth-e.diveStartY)*q;
          const sway=e.diveStyle==='slash'?(G.layout?.portrait?34:62):(G.layout?.portrait?22:38);
          e.x=e.diveStartX+(e.diveTargetX-e.diveStartX)*q + Math.sin(p*Math.PI*(e.diveStyle==='slash'?3.5:5)+e.phase)*sway;
        } else {
          const q=(p-split)/(1-split), ease=q*q*(3-2*q);
          const homeX=(G.formation?.x||0)+e.ox, homeY=(G.formation?.y||G.layout.startY)+e.oy;
          e.y=e.diveDepth+(homeY-e.diveDepth)*ease;
          e.x=e.diveTargetX+(homeX-e.diveTargetX)*ease + Math.sin(p*Math.PI*4+e.phase)*(G.layout?.portrait?14:25)*(1-q);
        }
        if(e.kamikaze && now>=(e.kamikazeArmedAt||0) && p>.28){ const home=(C.encounterEvolution?.kamikaze?.homingPxPerSec||120)*dt/1000; e.x+=clamp(G.px-(e.x+e.w/2),-home,home); if(p>.50) e.y+=Math.min(home*.85,Math.max(0,G.py-e.y)); }
        e.x=clamp(e.x,8,G.w-e.w-8);
        if(e.diveShots<1 && p>.25){ const ft=familyTactic(enemyFamilyWorld(e)); if(ft?.id==='crimson_predation'){ fireEnemyBullet(e.x+e.w/2,e.y+e.h,-46,312,4.0,'#ff7a66',1,'petal'); fireEnemyBullet(e.x+e.w/2,e.y+e.h,46,312,4.0,'#ff7a66',1,'petal'); } else fireAimed(e.x+e.w/2,e.y+e.h,285+G.sector*10,4.0,'#ffb18f',1,'bolt',24); e.diveShots=1; }
        if(e.diveShots<2 && p>.48 && G.wave>=3){ fireAimed(e.x+e.w/2,e.y+e.h,300+G.sector*10,4.1,'#ff9f83',1,'bolt',30); e.diveShots=2; }
        if(p>=1){
          e.role='formation'; e.kind=e.originalKind||'raider'; e.originalKind=null; e.diveElapsed=0; e.nextShot=now+rand(1000,2600);
          e.x=(G.formation?.x||0)+e.ox; e.y=(G.formation?.y||G.layout.startY)+e.oy;
        }
      } else if(e.role==='formation' && ['sentinel','reanimator','breeder'].includes(e.kind) && now>=G.engageAfter){
        if(e.kind==='sentinel'){
          if(now>(e.shieldBrokenUntil||0) && (e.shieldPool||0)<(e.shieldMax||0)) e.shieldPool=Math.min(e.shieldMax,e.shieldPool+dt*.00042);
        } else if(e.kind==='reanimator' && (e.revivesLeft||0)>0 && G.enemyGraveyard.length && now>(e.reviveAt||0)){
          spawnRevivedEnemy(e,now);
        } else if(e.kind==='breeder' && now>(e.breedAt||0)){
          spawnBreederDrone(e,now);
        }
        if(now>(e.specialNextShot||0)){ shootEcologyEnemy(e); e.specialNextShot=now+rand(2400,3900)*D.fireMul*difficultyProfile().fireCd; }
      } else if(isFrontShooter(e) && now>=G.engageAfter){
        if(!e.nextShot) e.nextShot=now+rand(900,3600);
        if(e.kind==='gunner' && e.chargeUntil){
          if(now>=e.chargeUntil){
            fireTowardPoint(e.x+e.w/2,e.y+e.h,e.chargeTargetX,e.chargeTargetY,330+G.sector*14,5.0,'#ff8f73',1,'lance');
            e.chargeUntil=0; e.nextShot=now+(rand(2300,3600)-Math.min(500,G.sector*45+G.wave*35))*D.fireMul*difficultyProfile().fireCd; A().enemyShot(e.kind);
          }
        } else if(now>e.nextShot){
          const speed=245+G.sector*15+G.wave*6;
          const ft=familyTactic(enemyFamilyWorld(e));
          if(!e.eliteClass && ft?.id==='crimson_predation' && e.familyRole==='spitter'){
            const cx=e.x+e.w/2,cy=e.y+e.h;
            for(const vx of [-70,0,70]) fireEnemyBullet(cx,cy,vx,speed+22,4.0,'#ff7f6a',1,'petal');
            e.nextShot=now+rand(1900,2850)*D.fireMul*difficultyProfile().fireCd;
          } else if(!e.eliteClass && ft?.id==='yautja_hunt' && ['hunter','stinger'].includes(e.familyRole)){
            fireTowardPoint(e.x+e.w/2,e.y+e.h,G.px,G.py,speed+78,4.4,'#9eff7d',1,'lance');
            e.nextShot=now+rand(2050,2950)*D.fireMul*difficultyProfile().fireCd;
          } else if(!e.eliteClass && ft?.id==='nebula_phase' && e.familyRole==='spitter'){
            const cx=e.x+e.w/2,cy=e.y+e.h;
            fireEnemyBullet(cx,cy,-62,speed+8,5.0,'#75dfff',1,'ring'); fireEnemyBullet(cx,cy,0,speed+34,4.5,'#d58cff',1,'plasma'); fireEnemyBullet(cx,cy,62,speed+8,5.0,'#75dfff',1,'ring');
            e.nextShot=now+rand(2200,3200)*D.fireMul*difficultyProfile().fireCd;
          } else if(!e.eliteClass && ft?.id==='arachnid_web' && ['spitter','hunter'].includes(e.familyRole)){
            const cx=e.x+e.w/2,cy=e.y+e.h;
            for(const vx of [-55,0,55]){ const q=fireEnemyBullet(cx,cy,vx,speed+10,4.3,'#a5ff9d',1,'petal'); if(q){q.webSlow=true;q.familyWorld=4;} }
            e.nextShot=now+rand(2150,3100)*D.fireMul*difficultyProfile().fireCd;
          } else if(!e.eliteClass && ft?.id==='leviathan_tide' && e.familyRole==='sentinel'){
            const cx=e.x+e.w/2,cy=e.y+e.h; fireEnemyBullet(cx,cy,-95,speed,5.4,'#5de8ff',1,'ring'); fireEnemyBullet(cx,cy,95,speed,5.4,'#5de8ff',1,'ring');
            e.nextShot=now+rand(2300,3200)*D.fireMul*difficultyProfile().fireCd;
          } else if(e.eliteClass){

            const cx=e.x+e.w/2, cy=e.y+e.h;
            if(e.eliteClass==='ace'){
              fireAimed(cx-e.w*.16,cy,speed+55,4.2,e.eliteColor||'#ffd66b',1,'bolt',24);
              fireAimed(cx+e.w*.16,cy,speed+55,4.2,e.eliteColor||'#ffd66b',1,'bolt',24);
              e.nextShot=now+rand(1250,1900)*D.fireMul*difficultyProfile().fireCd;
            } else if(e.eliteClass==='bulwark'){
              for(let k=-1;k<=1;k++) fireEnemyBullet(cx,cy,k*58,speed+18,4.5,e.eliteColor||'#9de8ff',1,'ring');
              e.nextShot=now+rand(1800,2500)*D.fireMul*difficultyProfile().fireCd;
            } else {
              fireTowardPoint(cx,cy,G.px,G.py,speed+95,4.8,e.eliteColor||'#ff9ed8',1,'lance');
              e.nextShot=now+rand(1550,2250)*D.fireMul*difficultyProfile().fireCd;
            }
            A().eliteShot?.(e.eliteClass);
          } else if(e.kind==='gunner'){
            const tele=(G.layout?.portrait&&G.w<=520)?C.combatDirector.gunnerTelegraphMsMobile:C.combatDirector.gunnerTelegraphMsDesktop;
            e.chargeTargetX=G.px; e.chargeTargetY=G.py; e.chargeStart=now; e.chargeUntil=now+tele; e.nextShot=e.chargeUntil+20; A().sniperCharge();
          } else {
            const type=e.kind==='striker'?'bolt':'orb';
            fireAimed(e.x+e.w/2,e.y+e.h,speed,3.8,'#ffb997',1,type,36);
            e.nextShot=now+(rand(1800,3500)-Math.min(650,G.sector*65+G.wave*50))*D.fireMul*difficultyProfile().fireCd; A().enemyShot(e.kind);
          }
        }
      }
      handleEnemyPlayerContact(e,playerRect,now);
    });
    G.enemies = G.enemies.filter(e=>e.alive);
  }


  function shootSubbossBasic(e,ph=0){
    const cx=e.x+e.w/2, cy=e.y+e.h, style=e.identity?.style ?? ((G.sector-1)%3), v=(e.subAttackCycle=(e.subAttackCycle||0)+1)%3, sp=286+G.sector*10+ph*22;
    if(style===0){
      if(v===0){ for(const vx of [-72,0,72]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp,4.0,'#ffae7c',1,'petal'),{waveAmp:18,wavePeriod:470,wavePhase:vx*.02}); }
      else if(v===1){ fireAimed(cx,cy,sp+52,4.3,'#ffd0a0',1,'seeker',28); }
      else { decorateEnemyBullet(fireEnemyBullet(cx,cy,-125,sp+10,4.2,'#ff9a77',1,'scythe'),{turnRate:-.52}); decorateEnemyBullet(fireEnemyBullet(cx,cy,125,sp+10,4.2,'#ff9a77',1,'scythe'),{turnRate:.52}); }
    } else if(style===1){
      if(v===0){ fireAimed(cx-e.w*.22,cy,sp+45,4.5,'#9dcfff',1,'lance',24); fireAimed(cx+e.w*.22,cy,sp+45,4.5,'#9dcfff',1,'lance',24); }
      else if(v===1){ for(const vx of [-82,0,82]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp-18,5.2,'#9cc7ff',1,'ring'),{turnRate:vx<0?-.28:vx>0?.28:0}); }
      else { decorateEnemyBullet(fireAimed(cx,cy,sp+70,4.8,'#cbb8ff',1,'plasma',20),{accel:.08}); }
    } else {
      if(v===0){ for(const vx of [-86,0,86]) fireEnemyBullet(cx,cy,vx,sp+10,4.3,'#d7a0ff',1,'bolt'); }
      else if(v===1){ fireAimed(cx-e.w*.25,cy,sp+62,4.6,'#e4b7ff',1,'lance',20); fireAimed(cx+e.w*.25,cy,sp+62,4.6,'#e4b7ff',1,'lance',20); }
      else { decorateEnemyBullet(fireEnemyBullet(cx,cy,-135,sp,4.5,'#c58cff',1,'scythe'),{turnRate:-.62}); decorateEnemyBullet(fireEnemyBullet(cx,cy,135,sp,4.5,'#c58cff',1,'scythe'),{turnRate:.62}); }
    }
    if(e.role==='miniboss') A().minibossShot(style); else A().enemyShot(e.kind||'guardian');
  }

  function scheduleSubbossRecovery(e,ph,now){
    const cfg=C.encounterEvolution?.subbossRhythm||{}; if(!cfg.enabled) return;
    const recovery=cfg.recoveryMsByPhase||[720,620,520], expose=cfg.exposeMsByPhase||[620,560,500], cds=cfg.signatureCooldownMsByPhase||[5200,4400,3600];
    e.subRecoveryUntil=Math.max(e.subRecoveryUntil||0,now+(recovery[ph]||520)); e.subSignatureNextAt=now+(cds[ph]||3600);
    openSubbossCore(e,expose[ph]||500,'FIRMA AGOTADA · CONTRAATAQUE');
  }

  function shootGuardian(e){
    const cx=e.x+e.w/2, cy=e.y+e.h;
    if(e.familyWorld){
      signatureCue(e,e.identity?.secondary||'BARRIDO TÁCTICO',e.identity?.color||'#ffb36e');
      fireAimed(e.x+e.w*.24,cy,325+G.sector*9,4.5,e.identity?.color||'#ff996b',1,'bolt',30);
      fireAimed(e.x+e.w*.76,cy,325+G.sector*9,4.5,e.identity?.color||'#ff996b',1,'bolt',30);
      fireEnemyBullet(cx,cy,-82,285+G.sector*7,4.4,e.identity?.color||'#ffb36e',1,'petal');
      fireEnemyBullet(cx,cy,82,285+G.sector*7,4.4,e.identity?.color||'#ffb36e',1,'petal');
      if(subbossPhaseIndex(e)>0) fireAimed(cx,cy,365+G.sector*10,5.0,'#fff0b0',1,'lance',18);
    } else {
      fireAimed(e.x+e.w*.32,e.y+e.h,305,4.3,'#ff996b',1,'bolt',38);
      fireAimed(e.x+e.w*.68,e.y+e.h,305,4.3,'#ff996b',1,'bolt',38);
    }
    A().enemyShot(e.kind||'guardian');
  }
  function signatureCue(e,label,color='#fff0a6',boss=false){
    const now=performance.now();
    e.signatureLabel=label; e.signatureColor=color; e.signatureUntil=now+(boss?(C.bossIdentity.signatureDisplayMs||780):680);
    G.threatPulseUntil=now+(boss?(C.bossIdentity.signaturePulseMs||520):430);
    addText(e.x+e.w/2,e.y-10,label,color,boss?860:720,0,-13,true);
  }

  function shootMiniboss(e){
    const cx=e.x+e.w/2, cy=e.y+e.h;
    const style=e.identity?.style ?? ((G.sector-1)%3);
    if(style===0){
      signatureCue(e,e.identity?.signature||'RED DE CAZA','#ffb36e');
      // ARACHNID: la red se cierra con pétalos sinuosos y huevos cazadores.
      for(let i=-3;i<=3;i++) decorateEnemyBullet(fireEnemyBullet(cx,cy,i*52,286+Math.abs(i)*10,4.4,i===0?'#ffe0ad':'#ff9c78',1,'petal'),{waveAmp:36+Math.abs(i)*4,wavePeriod:420,wavePhase:i*.5});
      decorateEnemyBullet(fireAimed(cx-e.w*.16,cy,330,4.3,'#ffcf9d',1,'seeker',30),{homeStrength:.95,homeDelay:260});
      decorateEnemyBullet(fireAimed(cx+e.w*.16,cy,330,4.3,'#ffcf9d',1,'seeker',30),{homeStrength:.95,homeDelay:260});
    } else if(style===1){
      signatureCue(e,e.identity?.signature||'DOBLE SINGULARIDAD','#91c8ff');
      // LEVIATHAN: lanzas tensas y singularidades con curvatura orbital.
      decorateEnemyBullet(fireAimed(e.x+e.w*.28,cy,350,5.2,'#9dc4ff',1,'lance',16),{turnRate:-.45,accel:.08});
      decorateEnemyBullet(fireAimed(e.x+e.w*.72,cy,350,5.2,'#9dc4ff',1,'lance',16),{turnRate:.45,accel:.08});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-72,245,6.8,'#a18cff',1,'ring'),{turnRate:-.62,brake:.05});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,72,245,6.8,'#a18cff',1,'ring'),{turnRate:.62,brake:.05});
    } else {
      signatureCue(e,e.identity?.signature||'BATERÍA TRIDENTE','#d596ff');
      // DREADNOUGHT: artillería en ráfaga y guadañas laterales.
      decorateEnemyBullet(fireAimed(cx-e.w*.24,cy,360,5.3,'#d9a4ff',1,'lance',14),{accel:.12});
      decorateEnemyBullet(fireAimed(cx,cy,385,5.7,'#f1c4ff',2,'lance',10),{accel:.16});
      decorateEnemyBullet(fireAimed(cx+e.w*.24,cy,360,5.3,'#d9a4ff',1,'lance',14),{accel:.12});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-145,300,4.8,'#c78cff',1,'scythe'),{turnRate:-.85});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,145,300,4.8,'#c78cff',1,'scythe'),{turnRate:.85});
    }
    const subPhase=subbossPhaseIndex(e);
    if(subPhase>0){
      // Fase de furia: segunda firma más agresiva y legible.
      if(style===0){ decorateEnemyBullet(fireEnemyBullet(cx,cy,-120,330,4.6,'#ffb16f',1,'scythe'),{turnRate:-.72}); decorateEnemyBullet(fireEnemyBullet(cx,cy,120,330,4.6,'#ffb16f',1,'scythe'),{turnRate:.72}); }
      else if(style===1){ for(const vx of [-105,0,105]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,315,4.8,'#88d8ff',1,'ring'),{turnRate:vx<0?-.48:vx>0 ? .48:0,brake:.03}); }
      else { decorateEnemyBullet(fireAimed(cx-e.w*.18,cy,410,4.9,'#e7b2ff',1,'lance',12),{accel:.15}); decorateEnemyBullet(fireAimed(cx+e.w*.18,cy,410,4.9,'#e7b2ff',1,'lance',12),{accel:.15}); }
      if(subPhase>=2){
        for(const vx of [-180,-90,90,180]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,350,4.6,e.identity?.color||'#ffc17c',1,'scythe'),{turnRate:vx<0?-.56:.56,accel:.08});
        decorateEnemyBullet(fireAimed(cx,cy,445,5.6,'#fff0bd',2,'lance',12),{accel:.18});
      }
    }
    A().minibossShot(style);
  }
  function shootBossBasic(e,ph=0){
    const cx=e.x+e.w/2, cy=e.y+e.h*.72, ft=familyTactic(enemyFamilyWorld(e)||G.sector), id=ft?.id||e.identity?.id||'nova';
    const v=(e.attackCycle=(e.attackCycle||0)+1)%3, sp=300+ph*30+G.sector*7;
    if(id==='crimson_predation'||id==='nova'){
      if(v===0){ for(const vx of [-120,-60,0,60,120]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp,4.3,'#ff8069',1,'petal'),{waveAmp:18+ph*5,wavePeriod:470,wavePhase:vx*.01}); }
      else if(v===1){ decorateEnemyBullet(fireAimed(cx-e.w*.28,cy,sp+48,4.7,'#ffd09a',1,'seeker',24),{homeStrength:.72,homeDelay:260}); decorateEnemyBullet(fireAimed(cx+e.w*.28,cy,sp+48,4.7,'#ffd09a',1,'seeker',24),{homeStrength:.72,homeDelay:260}); }
      else { decorateEnemyBullet(fireEnemyBullet(cx,cy,-155,sp+12,4.8,'#ff9a7c',1,'scythe'),{turnRate:-.68}); decorateEnemyBullet(fireEnemyBullet(cx,cy,155,sp+12,4.8,'#ff9a7c',1,'scythe'),{turnRate:.68}); }
    } else if(id==='yautja_hunt'||id==='lancer'){
      if(v===0){ for(const o of [-.32,0,.32]) fireTowardPoint(cx+e.w*o,cy,G.px+o*130,G.py,sp+72,4.7,'#baff86',o===0&&ph>=2?2:1,'lance'); }
      else if(v===1){ for(const vx of [-170,-85,85,170]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp-10,4.3,'#9dff86',1,'scythe'),{turnRate:vx<0?-.48:.48}); }
      else { fireTowardPoint(e.x+e.w*.18,cy,G.px-90,G.py,sp+95,4.8,'#e8ffae',1,'lance'); fireTowardPoint(e.x+e.w*.82,cy,G.px+90,G.py,sp+95,4.8,'#e8ffae',1,'lance'); }
    } else if(id==='nebula_phase'||id==='gravity'){
      if(v===0){ for(const vx of [-110,-55,0,55,110]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp-42,5.2,vx?'#6fe6ff':'#d18cff',1,'ring'),{turnRate:vx<0?-.35:vx>0?.35:0}); }
      else if(v===1){ decorateEnemyBullet(fireEnemyBullet(cx,cy,-175,sp,4.8,'#8fdcff',1,'scythe'),{turnRate:-.88}); decorateEnemyBullet(fireEnemyBullet(cx,cy,175,sp,4.8,'#8fdcff',1,'scythe'),{turnRate:.88}); }
      else { for(const o of [-.25,.25]) decorateEnemyBullet(fireAimed(cx+e.w*o,cy,sp+70,4.8,'#cab0ff',1,'plasma',28),{turnRate:o<0?-.16:.16,accel:.09}); }
    } else if(id==='arachnid_web'||id==='brood'){
      if(v===0){ for(const vx of [-90,-45,0,45,90]){ const q=decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp-20,4.4,'#b6ff9f',1,'petal'),{waveAmp:28,wavePeriod:440,wavePhase:vx*.02}); if(q&&id==='arachnid_web') q.webSlow=true; } }
      else if(v===1){ for(const o of [-.30,0,.30]) decorateEnemyBullet(fireAimed(cx+e.w*o,cy,sp+30,4.5,'#d7a6ff',1,'seeker',34),{homeStrength:.62,homeDelay:320}); }
      else { spawnBossEscort(e,ph); fireAimed(cx,cy,sp+65,5.0,'#ecbbff',1,'lance',18); }
    } else {
      if(v===0){ for(const vx of [-150,-100,-50,0,50,100,150]) decorateEnemyBullet(fireEnemyBullet(cx,cy,vx,sp,4.4,'#ffc273',1,'petal'),{waveAmp:16,wavePeriod:500,wavePhase:vx*.01}); }
      else if(v===1){ decorateEnemyBullet(fireEnemyBullet(cx,cy,-185,sp+10,4.8,'#ff9e73',1,'scythe'),{turnRate:-.76}); decorateEnemyBullet(fireEnemyBullet(cx,cy,185,sp+10,4.8,'#ff9e73',1,'scythe'),{turnRate:.76}); }
      else { fireAimed(cx,cy,sp+95,5.2,'#fff0ac',ph>=2?2:1,'lance',18); }
    }
    A().bossShot(id,ph);
  }
  function shootBoss(e,ph=bossPhaseIndex(e),opts={}){
    const signature=!!opts.signature;
    if(!signature){ shootBossBasic(e,ph); return; }
    const cx=e.x+e.w/2, cy=e.y+e.h*.72;
    const pattern=e.identity?.id||'nova';
    const sig=e.identity?.signature||'ATAQUE DE JEFE';
    signatureCue(e,sig,e.identity?.accent||'#fff0a6',true);
    const ft=familyTactic(enemyFamilyWorld(e)||G.sector);
    if(ft?.id==='crimson_predation'){
      const n=ph===0?7:ph===1?9:11;
      for(let i=0;i<n;i++){ const vx=(i-(n-1)/2)*(ph===2?44:50); fireEnemyBullet(cx,cy,vx,292+Math.abs(vx)*.08,4.8,'#ff705d',1,'petal'); }
      fireAimed(cx,cy,365+ph*25,5.2,'#ffd0a0',ph>=2?2:1,'seeker',18);
      if(ph>=1) spawnBossEscort(e,ph);
      return;
    } else if(ft?.id==='yautja_hunt'){
      const lanes=ph===0?[-.28,.28]:ph===1?[-.34,0,.34]:[-.4,-.2,0,.2,.4];
      for(const o of lanes) fireTowardPoint(cx+e.w*o,cy,G.px+o*120,G.py,390+ph*24,5.0,'#a8ff80',o===0&&ph===2?2:1,'lance');
      if(ph>=1){ fireEnemyBullet(cx,cy,-120,320,4.7,'#ddff9c',1,'scythe'); fireEnemyBullet(cx,cy,120,320,4.7,'#ddff9c',1,'scythe'); }
      return;
    } else if(ft?.id==='nebula_phase'){
      const rings=ph===0?3:ph===1?4:5;
      for(let i=0;i<rings;i++){ const vx=(i-(rings-1)/2)*74; fireEnemyBullet(cx,cy,vx,250+i*22,6.2,i%2?'#d18cff':'#6fe6ff',1,'ring'); }
      for(const o of [-.22,.22]) fireAimed(cx+e.w*o,cy,350+ph*28,4.8,'#b8d8ff',1,'plasma',26);
      return;
    } else if(ft?.id==='arachnid_web'){
      const n=ph===0?7:ph===1?9:11;
      for(let i=0;i<n;i++){ const vx=(i-(n-1)/2)*44; const q=fireEnemyBullet(cx,cy,vx,286+Math.abs(vx)*.06,4.7,'#a6ff9c',1,'petal'); if(q){q.webSlow=true;q.familyWorld=4;} }
      if(ph>=1) spawnBossEscort(e,ph);
      return;
    } else if(ft?.id==='leviathan_tide'){
      const n=ph===0?5:ph===1?7:9;
      for(let i=0;i<n;i++){ const a=Math.PI*.24+i*(Math.PI*.52/Math.max(1,n-1)); const sp=260+ph*32; fireEnemyBullet(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,6.0,i%2?'#5fe8ff':'#9fc8ff',1,'ring'); }
      fireEnemyBullet(cx,cy,-165-ph*20,315+ph*22,5.2,'#76dfff',1,'scythe'); fireEnemyBullet(cx,cy,165+ph*20,315+ph*22,5.2,'#76dfff',1,'scythe');
      if(ph>=2) fireAimed(cx,cy,410,5.7,'#d6fbff',2,'lance',16);
      return;
    }
    if(pattern==='nova'){
      // CORONA HELIOS: abanico solar con pétalos ondulantes, pulso central y lanza terminal.
      const count=ph===0?9:ph===1?12:15;
      for(let i=0;i<count;i++){ const a=Math.PI*.13 + i*(Math.PI*.74/(count-1)); const sp=280+ph*28; decorateEnemyBullet(fireEnemyBullet(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,4.8,i%3===0?'#ffd08f':'#ff826e',1,'petal'),{waveAmp:22+ph*6,wavePeriod:560,wavePhase:i*.35,accel:.03}); }
      decorateEnemyBullet(fireEnemyBullet(cx,cy,0,250+ph*28,7.2,'#ffe7a2',1,'ring'),{brake:.04,turnRate:(ph===2 ? .35:0)});
      if(ph>=2) decorateEnemyBullet(fireAimed(cx,cy,405,5.7,'#fff2ba',2,'lance',10),{accel:.18});
    } else if(pattern==='lancer'){
      // JUICIO AXIAL: columnas convergentes y cizallas laterales.
      const offs=ph===0?[-.28,.28]:ph===1?[-.34,0,.34]:[-.42,-.2,0,.2,.42];
      for(const o of offs) decorateEnemyBullet(fireAimed(cx+e.w*o,cy,365+ph*30,5.4,o===0?'#e8f2ff':'#8bbcff',ph>=2&&o===0?2:1,'lance',14),{turnRate:o<0?-.18:o>0 ? .18:0,accel:.10});
      if(ph>=1){ decorateEnemyBullet(fireEnemyBullet(cx,cy,-150,305,4.6,'#b8d6ff',1,'scythe'),{turnRate:-.72}); decorateEnemyBullet(fireEnemyBullet(cx,cy,150,305,4.6,'#b8d6ff',1,'scythe'),{turnRate:.72}); }
    } else if(pattern==='brood'){
      // SEMILLA DEVORADORA: huevos cazadores, lluvia orgánica y escoltas.
      const n=ph===0?4:ph===1?6:8;
      for(let i=0;i<n;i++) decorateEnemyBullet(fireEnemyBullet(cx+rand(-e.w*.34,e.w*.34),cy,rand(-105,105),260+rand(0,70),4.7,i%2?'#c793ff':'#ff9cc9',1,'seeker'),{homeStrength:1.05,homeDelay:220+rand(0,180),waveAmp:10,wavePeriod:640,wavePhase:i});
      for(let i=-2;i<=2;i++) decorateEnemyBullet(fireEnemyBullet(cx,cy,i*58,292,4.0,'#df9bff',1,'petal'),{waveAmp:18+Math.abs(i)*6,wavePeriod:520,wavePhase:i*.42});
      if(ph>=1) spawnBossEscort(e,ph);
    } else if(pattern==='gravity'){
      // HORIZONTE ROTO: anillos con curvatura y guadañas orbitales.
      const rings=ph===0?2:ph===1?3:4;
      for(let i=0;i<rings;i++) decorateEnemyBullet(fireEnemyBullet(cx,cy,rand(-82,82),240+i*48,7.5+i*1.35,i%2?'#8dbeff':'#78f1ff',1,'ring'),{turnRate:(i%2?-.42:.42),brake:.03});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-145-ph*25,300+ph*18,5.2,'#9cefff',1,'scythe'),{turnRate:-.95});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,145+ph*25,300+ph*18,5.2,'#9cefff',1,'scythe'),{turnRate:.95});
      if(ph>=2) decorateEnemyBullet(fireAimed(cx,cy,365,5.2,'#c8f8ff',2,'lance',22),{accel:.12,turnRate:(Math.random()<.5?-.12:.12)});
    } else {
      // ALAS DE RENACIMIENTO: abanico vivo y cortes curvos.
      const wings=ph===0?7:ph===1?9:13;
      for(let i=-(wings>>1);i<=(wings>>1);i++) decorateEnemyBullet(fireEnemyBullet(cx,cy,i*(ph===2?42:48),292+Math.abs(i)*10,4.9,i===0?'#fff1a9':'#ff7f66',1,'petal'),{waveAmp:24+Math.abs(i)*2,wavePeriod:480,wavePhase:i*.3,accel:ph>=2 ? .05:0});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,-175,322,5.0,'#ffc66f',1,'scythe'),{turnRate:-.82});
      decorateEnemyBullet(fireEnemyBullet(cx,cy,175,322,5.0,'#ffc66f',1,'scythe'),{turnRate:.82});
      if(ph>=1) decorateEnemyBullet(fireAimed(cx,cy,402,5.5,'#ff6d78',2,'lance',14),{accel:.16});
    }
    A().bossShot(pattern,ph);
  }

  function updateBullets(dt, now){
    // player bullets
    for(let i=G.playerBullets.length-1;i>=0;i--){
      const b=G.playerBullets[i];
      if(!b) continue;
      if(b.homing){
        const t=nearestEnemy(b.x,b.y); if(t){ const desired=((t.x+t.w/2)-(b.x+b.w/2))*C.weaponEvolution.missileHoming; b.vx=clamp(b.vx+desired,-250,250); }
      }
      b.x += b.vx*dt/1000; b.y += b.vy*dt/1000; b.life -= dt;
      if(b.isMissile){ b.vx *= 0.995; }
      if(b.life<=0 || b.y<-90 || b.x<-80 || b.x>G.w+80){ G.playerBullets.splice(i,1); continue; }

      let consumed=false;
      for(const ob of G.obstacles){ if(ob.alive && Math.hypot((b.x+b.w/2)-ob.x,(b.y+b.h/2)-ob.y) < ob.r){ ob.hp -= b.damage * (b.isMissile?1.4:1); explode(b.x,b.y,'#ffb76e',3,80); G.playerBullets.splice(i,1); consumed=true; if(ob.hp<=0){ destroyMeteor(ob,'player'); } break; } }
      if(consumed) continue;
      for(const pod of G.rewardPods){ if(!pod.open && rectHit(b,pod)){ pod.hp -= b.damage; G.playerBullets.splice(i,1); explode(pod.x+pod.w/2,pod.y+pod.h/2,C.powers[pod.kind].color,4,70); consumed=true; if(pod.hp<=0){ pod.open=true; G.podsOpenedWave++; objectiveEvent('pod',1); spawnPowerDrop(pod.x+pod.w/2,pod.y+pod.h/2,pod.kind,pod.source||'pod'); addText(pod.x,pod.y-8,'PREMIO','#fff49a',850); } break; } }
      if(consumed) continue;
      if(hitBossModule(b,now)){ G.playerBullets.splice(i,1); continue; }
      if(hitBossHardpoint(b,now)){ G.playerBullets.splice(i,1); continue; }

      // Cadena evoluciona con las reliquias: mayor probabilidad y daño, manteniendo el presupuesto ligero.
      if(now < G.activePowers.chain){
        const ct=weaponTier('chain'), chance=.08+Math.max(0,ct-1)*C.weaponEvolution.chainChanceBonus;
        if(Math.random()<chance){ const target=nearestEnemy(b.x,b.y); if(target){ let chainDmg=.45+(ct>=2 ? .16:0)+(ct>=3 ? .22:0); if(target.role==='boss'){ if((target.fortressHp||0)>0){ const a=Math.min(target.fortressHp,chainDmg); target.fortressHp-=a; chainDmg-=a; M()?.noteDamage?.(a,'fortress-chain',now); if(target.fortressHp<=0){ target.fortressHp=0; openBossCore(target,C.bossFortress.breakExposeMs,'FORTALEZA ROTA · NÚCLEO ABIERTO'); } } if(chainDmg>0 && now>=(target.coreOpenUntil||0)){ chainDmg*=.72; chainDmg*=target.matrixMitigation||1; } } if(chainDmg>0) applySpecialEnemyDamage(target,chainDmg,'hull-chain',now); explode(target.x+target.w/2,target.y+target.h/2,'#9ebeff',2+(ct>=3?1:0),50); if(G.rewardPending || G.phase==='reward') return; } }
      }

      for(const e of G.enemies){
        if(e.alive && rectHit(b,enemyHitRect(e))){
          const protector=findSentinelProtector(e,now);
          if(protector){
            protector.shieldPool=Math.max(0,(protector.shieldPool||0)-b.damage*(b.isMissile?1.35:1)); G.playerBullets.splice(i,1); consumed=true; explode(b.x,b.y,'#79f6eb',4,72);
            if(protector.shieldPool<=0){ protector.shieldBrokenUntil=now+3000; addText(protector.x+protector.w/2,protector.y,'ESCUDO ROTO','#8fffee',850,0,-12,true); A().sentinelShield(); }
            break;
          }
          let hitDamage=b.damage * (b.isMissile?1.6:1);
          hitDamage*=familyDamageMultiplier(e,now);
          if((e.role==='miniboss'||(e.role==='guardian'&&e.familyWorld)) && C.subbossFortress?.enabled){
            if(now<(e.subPhaseGateUntil||0)){ G.playerBullets.splice(i,1); consumed=true; explode(b.x,b.y,'#d9f7ff',3,55); break; }
            const exposed=now<(e.subExposeUntil||0);
            if((e.subShieldHp||0)>0 && !exposed){
              const absorbed=Math.min(e.subShieldHp,hitDamage); e.subShieldHp-=absorbed; hitDamage-=absorbed; explode(b.x,b.y,'#7fdfff',3,64);
              if(e.subShieldHp<=0){ e.subShieldHp=0; openSubbossCore(e,C.subbossFortress.breakExposeMs,'ESCUDO ROTO · SUBJEFE EXPUESTO'); }
            }
            if(hitDamage>0){
              hitDamage*=exposed?(C.subbossFortress.exposedDamageMul||1.35):(C.subbossFortress.armorMul||.72);
              hitDamage=Math.min(hitDamage,e.maxHp*(C.subbossFortress.maxDamagePerHitRatio||.045));
              const threshold=e.maxHp*(C.subbossFortress.phaseThreshold||.58), finalThreshold=e.maxHp*(C.subbossFortress.finalThreshold||.26);
              if(!e.subPhaseTriggered && e.hp-hitDamage<threshold){
                hitDamage=Math.max(0,e.hp-threshold); e.subPhaseTriggered=true; e.subPhaseGateUntil=now+(C.subbossFortress.phaseGateMs||650); e.subPhaseSignatureAt=now+(C.combatFlow?.subbossPhase2SignatureDelayMs||720);
                rechargeSubbossShield(e,C.subbossFortress.phaseRechargeRatio||.35,'FASE II · ESCUDO REACTIVADO');
                UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · FASE II`,760);
              } else if(e.subPhaseTriggered && !e.subFinalTriggered && e.hp-hitDamage<finalThreshold){
                hitDamage=Math.max(0,e.hp-finalThreshold); e.subFinalTriggered=true; e.subPhaseGateUntil=now+(C.subbossFortress.finalGateMs||560); e.subPhaseSignatureAt=now+360;
                rechargeSubbossShield(e,C.subbossFortress.finalRechargeRatio||.20,'FURIA FINAL · BLINDAJE REACTIVO');
                UI().flashMsg(`${e.identity?.name||'SUBJEFE'} · FASE III`,800);
              }
            }
          }
          if(e.role==='boss'){
            if(now<(e.introUntil||0) || now<(e.phaseGateUntil||0)){ G.playerBullets.splice(i,1); consumed=true; explode(b.x,b.y,'#e9fbff',3,55); break; }
            const ph=bossPhaseIndex(e), coreOpen=now<(e.coreOpenUntil||0);
            if((e.fortressHp||0)>0 && !coreOpen){
              const absorbed=Math.min(e.fortressHp,hitDamage);
              e.fortressHp-=absorbed; hitDamage-=absorbed; M()?.noteDamage?.(absorbed,'fortress',now);
              explode(b.x,b.y,'#71e7ff',3,70);
              if(e.fortressHp<=0){ e.fortressHp=0; openBossCore(e,C.bossFortress.breakExposeMs,'FORTALEZA ROTA · NÚCLEO ABIERTO'); }
            }
            if(hitDamage>0){
              if(coreOpen){ hitDamage*=C.bossCore.damageMultiplier; if(Math.random()<.2) explode(e.x+e.w/2,e.y+e.h*.42,'#fff0aa',3,75); }
              else {
                hitDamage*=C.bossFortress.armorByPhase[ph]||.65;
                if(now<(e.adaptUntil||0)) hitDamage*=C.bossFortress.adaptationDamageMul||.55;
                hitDamage*=e.matrixMitigation||1;
              }
              hitDamage=Math.min(hitDamage,e.maxHp*C.bossFortress.maxDamagePerHitRatio);
              if(!coreOpen){
                if(!e.damageWindowStart || now-e.damageWindowStart>(C.bossFortress.adaptationWindowMs||1100)){ e.damageWindowStart=now; e.damageWindowTaken=0; }
                e.damageWindowTaken=(e.damageWindowTaken||0)+hitDamage;
                if(e.damageWindowTaken>=e.maxHp*(C.bossFortress.adaptationThresholdRatio||.065) && now>=(e.adaptUntil||0)){
                  e.adaptUntil=now+(C.bossFortress.adaptationMs||900); e.damageWindowTaken=0; e.damageWindowStart=now;
                  addText(e.x+e.w/2,e.y+e.h*.18,'ARMADURA ADAPTATIVA','#8feaff',650,0,-10,true);
                }
              }
              const gates=[C.combatDirector.bossPhase2Hp,C.combatDirector.bossPhase3Hp];
              const gi=e.phaseGatesTriggered||0;
              if(gi<gates.length){ const threshold=e.maxHp*gates[gi]; if(e.hp-hitDamage<threshold){ hitDamage=Math.max(0,e.hp-threshold); e.phaseGatesTriggered=gi+1; e.phaseGateUntil=now+(C.bossFortress.phaseGateMs||620); } }
            }
          }
          if(e.role==='boss'&&hitDamage>0) M()?.noteDamage?.(Math.min(e.hp,hitDamage),'hull',now);
          e.hp -= hitDamage; G.playerBullets.splice(i,1); consumed=true; explode(b.x,b.y,b.color,4,90);
          if(e.hp<=0){ killEnemy(e); if(G.rewardPending || G.phase==='reward') return; }
          break;
        }
      }
    }

    for(let i=G.enemyBullets.length-1;i>=0;i--){
      const b=G.enemyBullets[i];
      if(!b) continue;
      b.age=(b.age||0)+dt;
      if(b.turnRate){ const rot=rotateVelocity(b.vx,b.vy,b.turnRate*dt/1000); b.vx=rot.vx; b.vy=rot.vy; }
      if(b.homeStrength && b.age>=(b.homeDelay||0)){
        const dx=G.px-b.x, dy=G.py-b.y, mag=Math.hypot(dx,dy)||1;
        b.vx += (dx/mag)*(b.homeStrength*dt/1000)*115;
        b.vy += (dy/mag)*(b.homeStrength*dt/1000)*115;
        const sp=Math.hypot(b.vx,b.vy)||1, cap=(b.homeCap||430);
        if(sp>cap){ b.vx=b.vx/sp*cap; b.vy=b.vy/sp*cap; }
      }
      if(b.accel){ const mul=1+b.accel*dt/1000; b.vx*=mul; b.vy*=mul; }
      if(b.brake){ const mul=Math.max(.86,1-b.brake*dt/1000); b.vx*=mul; b.vy*=mul; }
      if(b.waveAmp){ const sp=Math.hypot(b.vx,b.vy)||1, px=-b.vy/sp, py=b.vx/sp; const swing=Math.sin((b.age/Math.max(180,b.wavePeriod||420))*Math.PI*2+(b.wavePhase||0)); const drift=(b.waveAmp||0)*swing*dt/1000; b.x += px*drift; b.y += py*drift; }
      if(G.sectorMutator?.id==='gravity') b.vx += Math.sin(now/310+b.y*.012)*C.sectorMutators.gravityCurve*dt/1000;
      b.x += b.vx*dt/1000; b.y += b.vy*dt/1000; b.life -= dt;
      if(b.life<=0 || b.y>G.h+80 || b.x<-80 || b.x>G.w+80){ G.enemyBullets.splice(i,1); continue; }
      let eaten=false;
      for(const ob of G.obstacles){ if(ob.alive && Math.hypot(b.x-ob.x,b.y-ob.y) < ob.r){ ob.hp -= 0.35; G.enemyBullets.splice(i,1); eaten=true; if(ob.hp<=0) destroyMeteor(ob,'enemy'); break; } }
      if(eaten) continue;
      const ph=G.layout?.playerH||64, hs=playerHitScale(), pr = {x:G.px-ph*.215*hs,y:G.py-ph*.33*hs,w:ph*.43*hs,h:ph*.66*hs};
      if(rectHit({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2}, pr)){
        G.enemyBullets.splice(i,1);
        if(now < G.activePowers.shield){ explode(G.px,G.py,'#77edff',4,65); A().shieldHit?.(); }
        else if(now > G.invulnUntil){ if(b.webSlow){ G.webSlowUntil=Math.max(G.webSlowUntil||0,now+(familyTactic(4)?.webSlowMs||950)); addText(G.px,G.py-30,'TELARAÑA','#b6ffa8',650,0,-10,true); } damagePlayer(b.damage, 'IMPACTO'); }
      }
    }
  }

  function applySpecialEnemyDamage(e,amount,source='special',now=performance.now()){
    if(!e?.alive || amount<=0) return 0;
    let dmg=amount;
    if(e.role==='boss'){
      if(now<(e.introUntil||0)||now<(e.phaseGateUntil||0)) return 0;
      const ph=bossPhaseIndex(e), coreOpen=now<(e.coreOpenUntil||0);
      if((e.fortressHp||0)>0&&!coreOpen){ const a=Math.min(e.fortressHp,dmg); e.fortressHp-=a; dmg-=a; M()?.noteDamage?.(a,`${source}-fortress`,now); if(e.fortressHp<=0){e.fortressHp=0;openBossCore(e,C.bossFortress.breakExposeMs,'FORTALEZA ROTA · NÚCLEO ABIERTO');} }
      if(dmg>0){
        dmg*=coreOpen?(C.bossCore.damageMultiplier||1.62):((C.bossFortress.armorByPhase?.[ph]||.65)*(e.matrixMitigation||1)); dmg=Math.min(dmg,e.maxHp*(C.bossFortress.maxDamagePerHitRatio||.015));
        const gates=[C.combatDirector.bossPhase2Hp,C.combatDirector.bossPhase3Hp], gi=e.phaseGatesTriggered||0;
        if(gi<gates.length){ const threshold=e.maxHp*gates[gi]; if(e.hp-dmg<threshold){ dmg=Math.max(0,e.hp-threshold); e.phaseGatesTriggered=gi+1; e.phaseGateUntil=now+(C.bossFortress.phaseGateMs||760); } }
      }
    } else if((e.role==='miniboss'||e.role==='guardian')&&C.subbossFortress?.enabled){
      if(now<(e.subPhaseGateUntil||0)) return 0;
      const exposed=now<(e.subExposeUntil||0);
      if((e.subShieldHp||0)>0&&!exposed){ const a=Math.min(e.subShieldHp,dmg); e.subShieldHp-=a; dmg-=a; if(e.subShieldHp<=0){e.subShieldHp=0;openSubbossCore(e,C.subbossFortress.breakExposeMs,'ESCUDO ROTO · SUBJEFE EXPUESTO');} }
      if(dmg>0){
        dmg*=exposed?(C.subbossFortress.exposedDamageMul||1.42):(C.subbossFortress.armorMul||.72); dmg=Math.min(dmg,e.maxHp*(C.subbossFortress.maxDamagePerHitRatio||.035));
        const threshold=e.maxHp*(C.subbossFortress.phaseThreshold||.58), finalThreshold=e.maxHp*(C.subbossFortress.finalThreshold||.26);
        if(!e.subPhaseTriggered && e.hp-dmg<threshold){ dmg=Math.max(0,e.hp-threshold); e.subPhaseTriggered=true; e.subPhaseGateUntil=now+(C.subbossFortress.phaseGateMs||650); e.subPhaseSignatureAt=now+(C.combatFlow?.subbossPhase2SignatureDelayMs||720); rechargeSubbossShield(e,C.subbossFortress.phaseRechargeRatio||.35,'FASE II · ESCUDO REACTIVADO'); }
        else if(e.subPhaseTriggered && !e.subFinalTriggered && e.hp-dmg<finalThreshold){ dmg=Math.max(0,e.hp-finalThreshold); e.subFinalTriggered=true; e.subPhaseGateUntil=now+(C.subbossFortress.finalGateMs||560); e.subPhaseSignatureAt=now+360; rechargeSubbossShield(e,C.subbossFortress.finalRechargeRatio||.20,'FURIA FINAL · BLINDAJE REACTIVO'); }
      }
    }
    if(dmg<=0) return 0; e.hp-=dmg; if(e.role==='boss') M()?.noteDamage?.(Math.min(e.hp+dmg,dmg),source,now); if(e.hp<=0) killEnemy(e); return dmg;
  }

  function nearestEnemy(x,y){ let best=null, bd=Infinity; for(const e of G.enemies){ if(!e.alive) continue; const d=(e.x+e.w/2-x)**2+(e.y+e.h/2-y)**2; if(d<bd){bd=d;best=e;} } return best; }

  function triggerBossResurrection(e,opts={}){
    M()?.noteNativeResurrection?.();
    const quick=!!opts.quick;
    const ratio=opts.ratio ?? C.bossIdentity.resurrectionHpRatio;
    if(quick) e.resurrectionsLeft=0; else e.resurrectionsLeft=Math.max(0,(e.resurrectionsLeft||0)-1); e.hp=e.maxHp*ratio; e.alive=true; e.resurrectUntil=performance.now()+1450; e.phaseAnnounced=-1; e.phaseGatesTriggered=1; e.phaseGateUntil=performance.now()+650; e.adaptUntil=0; e.damageWindowStart=0; e.damageWindowTaken=0; e.phaseStartedAt=performance.now(); e.pressureLevel=0; e.fortressHp=Math.max(e.fortressHp||0,(e.fortressMax||e.maxHp*bossFortressRatio())*(quick?(C.bossFortress.quickRebootFortressRatio||.46):.58)); e.emergencyReboot=quick; e.rebootAggroMul=quick?(C.bossFortress.quickRebootMoveMul||1.16):1; e.rebootFireCdMul=quick?(C.bossFortress.quickRebootFireCdMul||.78):1; e.signaturePending=false; e.signatureWindupUntil=0; e.counterOpenAt=0; e.recoveryUntil=0; e.huntPending=false; e.huntWindupUntil=0; e.huntEscapeCheckAt=0; e.huntNextAt=performance.now()+5200; e.nextSignatureAt=performance.now()+(C.combatFlow?.rebootSignatureDelayMs||1750); e.fortressPulseAt=performance.now()+4200; if(G.sector>=(C.bossModules?.reviveOneNodeFromSector||3)&&e.armorNodes?.length){ const dead=e.armorNodes.find(n=>!n.alive); if(dead){ dead.alive=true; dead.hp=Math.max(1,dead.maxHp*.65); e.modulesDisabled=false; } } if(G.sector>=(C.bossHardpoints?.reviveOneFromSector||4)&&e.hardpoints?.length){ const deadHp=e.hardpoints.find(p=>!p.alive); if(deadHp){ deadHp.alive=true; deadHp.hp=Math.max(1,deadHp.maxHp*.55); if(deadHp.id==='regulator') e.regulatorDisabled=false; if(deadHp.id==='drive') e.driveDisabled=false; } }
    G.enemyBullets=[]; G.threatPulseUntil=performance.now()+900; explode(e.x+e.w/2,e.y+e.h/2,'#a98cff',34,210);
    addText(e.x+e.w/2,e.y,quick?'REACTOR REBOOT · 50%':'RESURRECCIÓN','#d8b0ff',1550,0,-18,true); UI().flashMsg(`${e.identity?.name||'JEFE'} · ${quick?'REACTOR REBOOT · FASE AGRESIVA':'RESURRECCIÓN'}`,1350); A().bossResurrect();
  }

  function startBossReward(e){
    // Idempotencia: un boss puede recibir varios impactos en el mismo frame.
    // No debemos iniciar dos secuencias de recompensa ni mutar colecciones varias veces.
    if(G.rewardPending || G.phase==='reward' || G.phase==='sectorTransition') return;
    G.phase='reward'; G.phaseName='ABSORCIÓN'; G.rewardPending=true; G.rewardStartedAt=performance.now(); G.rewardTransitionAt=0; G.sectorTransitionLock=false;
    // Se vacían los proyectiles, pero updateBullets retorna de inmediato al detectar rewardPending.
    // Esto evita continuar iterando sobre una colección que fue vaciada a mitad del for.
    G.enemyBullets.length=0; G.playerBullets.length=0;
    if(G.gemDrops.length){ const bank=G.gemDrops.reduce((a,g)=>a+(g.value||1),0); G.gemDrops=[]; E()?.addGemCoins?.(bank); if(bank) addText(G.px,G.py-56,`GEMAS +${bank}◈`,'#7fffd4',900,0,-12,true); }
    for(const other of G.enemies){ if(other!==e && other.role!=='boss') other.alive=false; }
    const kinds=(e.identity?.reward||['spread','shield','overdrive']).slice(0,3);
    E()?.grantBossPowers?.(kinds,G.sector);
    G.bossAllyWorld=G.sector; G.bossAllyActiveUntil=0; G.bossAllyReadyAt=performance.now()+3500; G.bossAllyLastShot=0;
    const ox=e.x+e.w/2, oy=e.y+e.h/2;
    for(let i=0;i<kinds.length;i++){
      const kind=kinds[i];
      G.bossRewards.push({kind,x:ox,y:oy,vx:0,vy:0,t:0,delay:i*150,orbitMs:C.weaponEvolution.relicOrbitMs,orbitAngle:i*(Math.PI*2/3),originX:ox,originY:oy,trail:[],arrived:false,relicIndex:i,familyWorld:integratedWorld()?.id||0});
    }
    UI().flashMsg('PODER DEL JEFE · HEREDADO + CARGA AL ARSENAL',1350); A().bossReward();
  }

  function applyBossRelic(kind){
    const prevTier=weaponTier(kind);
    G.relicLevels[kind]=(G.relicLevels[kind]||0)+1;
    const newTier=weaponTier(kind);
    const aug=C.permanentAugments[kind]||{};
    if(aug.damage) G.bossAugments.damage+=aug.damage;
    if(aug.fireRate) G.bossAugments.fireRate+=aug.fireRate;
    if(aug.speed) G.bossAugments.speed+=aug.speed;
    if(aug.maxHp){ G.bossAugments.maxHp+=aug.maxHp; G.maxHp+=aug.maxHp; G.hp=Math.min(G.maxHp,G.hp+aug.maxHp); }
    if(aug.magnet) G.bossAugments.magnet+=aug.magnet;
    if(aug.maxLives){ G.bossAugments.maxLives+=aug.maxLives; G.lives=Math.min(C.progression.maxLives+G.bossAugments.maxLives,G.lives+1); }
    if(['spread','shield','chain','missile','overdrive','drone'].includes(kind)) applyPower(kind);
    addText(G.px,G.py-45,aug.label||C.powers[kind]?.label||'PODER','#fff0a5',1200,0,-15,true); A().relicAttach(kind);
    if(newTier>prevTier && newTier>=2){
      UI().flashMsg(`${C.powers[kind]?.label||kind} · EVOLUCIÓN ${romanTier(newTier)}`,1050); addText(G.px,G.py-68,`EVOLUCIÓN ${romanTier(newTier)}`,'#fff3a8',1450,0,-18,true); A().weaponEvolve(newTier);
    }
  }

  function finishBossRewardTransition(now){
    if(G.phase==='sectorTransition' || G.sectorTransitionLock) return;
    G.rewardPending=false;
    G.phase='sectorTransition'; G.phaseName='SALTO';
    G.rewardTransitionAt=now+C.transitionSafety.sectorAdvanceDelayMs;
    saveProgress();
    UI().flashMsg('COORDENADAS DEL SIGUIENTE SECTOR',700);
  }

  function forceCompleteBossRewards(now,reason='watchdog'){
    if(!G.bossRewards.length){ finishBossRewardTransition(now); return; }
    const pending=[...G.bossRewards];
    G.bossRewards.length=0;
    for(const r of pending){
      if(r.arrived) continue;
      r.arrived=true;
      try{ applyBossRelic(r.kind); }catch(err){ console.error('Relic recovery',r.kind,err); G.lastError=String(err?.message||err); }
      explode(G.px,G.py,C.powers[r.kind]?.color||'#fff',8,80);
      G.attachedRelics.push({kind:r.kind,startedAt:now,until:now+C.weaponEvolution.attachCelebrationMs,angle:Math.random()*Math.PI*2});
    }
    if(reason==='watchdog') UI().flashMsg('ABSORCIÓN ESTABILIZADA',700);
    finishBossRewardTransition(now);
  }

  function updateBossRewards(dt,now){
    G.attachedRelics=G.attachedRelics.filter(r=>now<r.until);

    // La transición ya no depende de setTimeout. Todo se resuelve dentro del reloj del juego.
    if(G.phase==='sectorTransition') return;

    if(!G.bossRewards.length){
      if(G.rewardPending) finishBossRewardTransition(now);
      return;
    }

    const rewardAge=now-(G.rewardStartedAt||now);
    if(rewardAge>C.transitionSafety.rewardWatchdogMs){
      forceCompleteBossRewards(now,'watchdog');
      return;
    }

    for(const r of G.bossRewards){
      if(r.arrived) continue;
      r.t+=dt;
      if(r.t<r.delay) continue;
      const local=r.t-r.delay;
      if(local<r.orbitMs){
        const p=local/Math.max(1,r.orbitMs), radius=22+26*p;
        r.orbitAngle+=dt*.0075;
        r.x=r.originX+Math.cos(r.orbitAngle)*radius;
        r.y=r.originY+Math.sin(r.orbitAngle)*radius*.56;
      } else {
        const dx=G.px-r.x, dy=G.py-r.y, d=Math.hypot(dx,dy)||1;
        const acc=clamp(450+(local-r.orbitMs)*.62,450,1080);
        r.vx += dx/d*acc*dt/1000; r.vy += dy/d*acc*dt/1000;
        r.vx*=.94; r.vy*=.94;
        const sp=Math.hypot(r.vx,r.vy)||1;
        const maxSp=C.transitionSafety.rewardMaxSpeed;
        if(sp>maxSp){ r.vx=r.vx/sp*maxSp; r.vy=r.vy/sp*maxSp; }
        r.x+=r.vx*dt/1000; r.y+=r.vy*dt/1000;

        // Evita NaN/Infinity y evita que un núcleo salga del mundo por una mala integración física.
        if(!Number.isFinite(r.x)||!Number.isFinite(r.y)||!Number.isFinite(r.vx)||!Number.isFinite(r.vy)){
          r.x=G.px; r.y=G.py; r.vx=0; r.vy=0;
        }
        r.x=clamp(r.x,-48,G.w+48); r.y=clamp(r.y,-48,G.h+48);

        const arrivalDistance=Math.max(C.transitionSafety.rewardSnapDistance,(G.layout?.playerH||64)*.42);
        if(!r.arrived && d<=arrivalDistance){
          r.arrived=true;
          applyBossRelic(r.kind);
          explode(G.px,G.py,C.powers[r.kind]?.color||'#fff',14,115);
          G.attachedRelics.push({kind:r.kind,startedAt:now,until:now+C.weaponEvolution.attachCelebrationMs,angle:Math.random()*Math.PI*2});
        }
      }
      if(!r.arrived){
        r.trail.push({x:r.x,y:r.y,life:280});
        if(r.trail.length>16) r.trail.shift();
        for(const q of r.trail) q.life-=dt;
      }
    }
    G.bossRewards=G.bossRewards.filter(r=>!r.arrived);
    if(G.rewardPending && !G.bossRewards.length) finishBossRewardTransition(now);
  }

  function killEnemy(e){
    if(!e || e.deathHandled) return;
    if(e.role==='boss'){
      const elapsedSec=Math.max(0,(performance.now()-(e.spawnAt||performance.now()))/1000);
      const thresholds=C.bossFortress?.quickRebootThresholdSecBySector||[42,48,55,65,75];
      const threshold=thresholds[Math.min(thresholds.length-1,Math.max(0,G.sector-1))]||55;
      if(!e.quickRebootUsed && elapsedSec<threshold){ e.deathHandled=true; e.quickRebootUsed=true; M()?.noteQuickReboot?.(); triggerBossResurrection(e,{quick:true,ratio:C.bossFortress?.quickRebootHpRatio||.50}); e.deathHandled=false; return; }
      if((e.resurrectionsLeft||0)>0){ e.deathHandled=true; triggerBossResurrection(e); e.deathHandled=false; return; }
    }
    e.deathHandled=true;
    if(e.kamikaze && e.role!=='boss' && e.role!=='miniboss' && e.role!=='guardian') triggerKamikazeChain(e,performance.now());
    if(e.role==='formation' && !e.revivedOnce && ['raider','striker','gunner'].includes(e.kind)){
      G.enemyGraveyard.push({kind:e.kind,row:e.row,col:e.col,ox:e.ox,oy:e.oy,patternOffset:e.patternOffset||0,w:e.w,h:e.h,renderH:e.renderH,maxHp:e.maxHp,score:e.score,color:e.color,shootBias:e.shootBias,zig:e.zig,zigSeed:e.zigSeed,familyWorld:e.familyWorld||0,familyRole:e.familyRole||'',familySeed:e.familySeed||0});
      if(G.enemyGraveyard.length>10) G.enemyGraveyard.shift();
    }
    if(e.role==='boss') G.bossDeathFx={worldId:e.familyWorld||G.sector,x:e.x+e.w/2,y:e.y+e.h/2,h:e.renderH||e.h*1.3,color:e.identity?.accent||e.color,startedAt:performance.now(),duration:C.worldFamilies?.bossDeathFxMs||920};
    e.alive=false; G.score += Math.round(e.score * (1 + Math.min(.65,G.combo*.035)) * mutatorScoreMul());
    G.combo++; G.maxComboWave=Math.max(G.maxComboWave,G.combo); G.comboUntil = performance.now() + 2300;
    const eco=E()?.rewardKill?.({role:e.role,sector:G.sector,elite:!!e.eliteClass});
    const streak=E()?.rewardStreak?.(G.combo);
    if(eco?.leveled){ UI().flashMsg(`NIVEL ${eco.level} · TIENDA ACTUALIZADA`,900); addText(G.px,G.py-52,`NIVEL ${eco.level}`,'#ffe875',1200,0,-14,true); }
    if(streak){ addText(e.x+e.w/2,e.y-20,`${streak.label} · +${streak.coins}◈`,'#ffe875',1100,0,-15,true); }
    if(e.role==='boss' && eco) addText(e.x+e.w/2,e.y-34,`+${eco.xp} XP · +${eco.coins}◈`,'#ffe875',1450,0,-15,true);
    if(e.role==='miniboss') spawnGemBurst(e.x+e.w/2,e.y+e.h/2,5,4);
    else if(e.eliteClass) spawnGemBurst(e.x+e.w/2,e.y+e.h/2,3,3);
    else if(e.role!=='boss' && Math.random()<(C.rewards?.gemDropChance||.18)) spawnGemBurst(e.x+e.w/2,e.y+e.h/2,1,1+Math.floor(G.sector/2));
    if(e.eliteClass){ G.eliteKillsWave++; objectiveEvent('elite',1); maybeDrop(Math.random()<(C.rewards?.eliteLifeDropChance||.16)?'life':pick(['drone','overdrive','shield','missile','magnet']),e.x+e.w/2,e.y+e.h/2,1); addText(e.x+e.w/2,e.y-6,`${e.eliteLabel||'ÉLITE'} +BONUS`,e.eliteColor||'#ffd66b',900,0,-14,true); }
    explode(e.x+e.w/2,e.y+e.h/2,e.color, e.role==='boss'?28:e.role==='miniboss'?18:10, e.role==='boss'?200:130);
    if(e.role==='boss') A().bossDeath?.(); else if(e.role==='miniboss') A().minibossDeath?.(e.identity?.style ?? 0); else A().enemyDestroyed?.(e.kind);
    if(e.role==='boss'){
      M()?.finalize?.('victory',{bossHp:0,defenseHp:0,hpRatio:G.maxHp?G.hp/G.maxHp:1,mobilityIndex:(G.ship?.speed||430)/430,hasUsefulSecondary:false,combo:G.combo,damageReceivedRatio:G.maxHp?G.waveDamageTaken/G.maxHp:0},performance.now());
      awardSectorClear();
      addText(e.x+e.w/2,e.y,'SECTOR LIMPIO','#ffe091',1600,0,-24,true);
      UI().flashMsg('SECTOR COMPLETADO', 1100);
      startBossReward(e); return;
    }
    if(e.role==='miniboss'){ objectiveEvent('miniboss',1); addText(e.x+e.w/2,e.y,'AMAZING','#ffc46f',1200,0,-18,true); maybeDrop(Math.random()<.42?'life':'heal', e.x+e.w/2,e.y+e.h/2,.92); }
    else if(e.role==='guardian'){ addText(e.x+e.w/2,e.y,'BONUS','#ffe686',900,0,-16,true); maybeDrop(pick(['spread','shield','missile','chain']), e.x+e.w/2,e.y+e.h/2,.85); }
    else {
      const lowHp=G.hp/G.maxHp<=C.combatDirector.lowHpRatio;
      if(lowHp && Math.random()<C.rewards.healDropLowHpBonus) spawnPowerDrop(e.x+e.w/2,e.y+e.h/2,'heal');
      else if(Math.random()<(C.rewards?.lifeDropChance||.035)) spawnPowerDrop(e.x+e.w/2,e.y+e.h/2,'life');
      else maybeDrop(pick(['spread','shield','heal','missile','chain','overdrive','drone','magnet']), e.x+e.w/2,e.y+e.h/2, .20);
    }
    if(G.combo===5){ addText(e.x,e.y,'RACHA x5','#8df9ff',1100,0,-18,true); A().combo(5); }
    if(G.combo===10){ addText(e.x,e.y,'AMAZING','#ffd067',1200,0,-18,true); A().combo(10); }
    if(G.combo===15){ addText(e.x,e.y,'DOMINIO','#ff9df0',1250,0,-18,true); A().combo(15); }
  }

  function maybeDrop(kind,x,y,p=.15){ if(Math.random()<p) spawnPowerDrop(x,y,kind); }

  function damagePlayer(amount, reason='DAÑO'){
    const encounterMul=G.phase==='boss'?(C.playerSurvival?.bossDamageMul||1):(G.enemies.some(e=>e.alive&&['miniboss','guardian'].includes(e.role))?(C.playerSurvival?.subbossDamageMul||1):1);
    const actual=Math.max(.30,amount*(G.ship?.armor||1)*profileArmorMul()*encounterMul);
    if(G.phase==='boss') M()?.notePlayerDamage?.(actual);
    G.hp = Math.max(0,G.hp-actual); G.waveDamageTaken+=actual; G.invulnUntil = performance.now()+(G.phase==='boss'?(C.playerSurvival?.bossInvulnMs||1100):(C.playerSurvival?.normalInvulnMs||940)); G.shake = 8; A().hit(); addText(G.px,G.py-20,reason,'#ff9e93',700,0,-15,true);
    if(G.hp > 0 && G.hp <= Math.max(2,Math.ceil(G.maxHp*.25))){ addText(G.px,G.py-44,'VIDA CRÍTICA','#ff6e7b',1000,0,-12,true); A().critical(); }
    if(G.hp <= 0) loseLife();
  }

  function loseLife(){
    if(G.lifeLost || G.gameOver) return;
    G.lives -= 1; G.lifeLost=true; G.paused=true; G.pauseStartedAt=performance.now();
    explode(G.px,G.py,'#fff',18,180); A().boom();
    const emergency=G.lives<=0 && (E()?.inventoryCount?.('revive')||0)>0 && E()?.consume?.('revive');
    if(emergency){
      G.lives=1; UI().renderPause(G); UI().flashMsg('RESURRECCIÓN DE EMERGENCIA',950); addText(G.px,G.py-32,'SEGUNDO NÚCLEO ONLINE','#ffe66a',1100,0,-10,true);
      setTimeout(()=>{ if(!G.running||G.gameOver)return; G.hp=G.maxHp;G.invulnUntil=performance.now()+(C.playerSurvival?.reviveInvulnMs||2800);G.px=G.w*.5;G.py=G.h*.76;G.enemyBullets=[];shiftGameClocks(performance.now()-(G.pauseStartedAt||performance.now()));G.pauseStartedAt=0;G.lifeLost=false;G.paused=false;G.lastTs=performance.now();UI().renderPause(G);UI().flashMsg('RESURRECCIÓN COMPLETA',700);saveProgress(); },900);
      return;
    }
    if(G.lives <= 0){ gameOver(); return; }

    UI().renderPause(G);
    UI().flashMsg(`VIDA PERDIDA · ${G.lives} ${G.lives===1?'VIDA RESTANTE':'VIDAS RESTANTES'}`, C.progression.lifeLostPauseMs);
    addText(G.px,G.py-30,'VIDA PERDIDA','#ff9d91',C.progression.lifeLostPauseMs,0,-8,true);
    setTimeout(()=>{
      if(!G.running || G.gameOver) return;
      G.hp = G.maxHp;
      G.invulnUntil = performance.now()+2100;
      G.px = G.w*.5; G.py = G.h*(G.layout?.portrait ? .80 : .82);
      G.enemyBullets = G.enemyBullets.filter(b=>Math.hypot(b.x-G.px,b.y-G.py)>Math.min(250,G.w*.22));
      shiftGameClocks(performance.now()-(G.pauseStartedAt||performance.now())); G.pauseStartedAt=0; G.lifeLost=false; G.paused=false; G.lastTs=performance.now();
      UI().renderPause(G);
      UI().flashMsg('REINCORPORACIÓN', 620);
      saveProgress();
    }, C.progression.lifeLostPauseMs);
  }

  function gameOver(){
    if(G.gameOver) return;
    if(G.phase==='boss'){
      const boss=G.enemies.find(e=>e.alive&&e.role==='boss');
      M()?.finalize?.('defeat',{bossHp:boss?.hp||0,defenseHp:matrixBossDefenseHp(boss),hpRatio:0,mobilityIndex:(G.ship?.speed||430)/430,hasUsefulSecondary:false,combo:G.combo,damageReceivedRatio:G.maxHp?G.waveDamageTaken/G.maxHp:0},performance.now());
    }
    G.gameOver=true; G.lifeLost=false; G.paused=true;
    S().saveRanking(G.player,G.score,G.sector,G.wave);
    const cp=G.checkpoint || snapshot();
    // Mantener un save utilizable: GAME OVER vuelve al checkpoint, no al inicio de la campaña.
    S().saveGame({...cp, lives:C.progression.restartLives, hp:G.maxHp, checkpointWave:cp.wave||G.wave});
    A().pauseAmbience?.(true); A().ui?.('gameover'); UI().renderPause(G); UI().renderGameOver(G,true); UI().flashMsg('GAME OVER', 900);
  }

  function restartCheckpoint(){
    const cp=G.checkpoint || S().loadGame() || snapshot();
    G.sector=cp.sector||G.sector; G.wave=cp.wave||G.wave; G.score=cp.score||0;
    G.nextLifeAt=cp.nextLifeAt||C.progression.extraLifeEvery;
    G.lives=C.progression.restartLives; G.hp=G.maxHp; G.gameOver=false; G.lifeLost=false; G.paused=false; G.pauseStartedAt=0; G.subphase=0;
    G.activePowers={spread:0,shield:0,chain:0,missile:0,overdrive:0,drone:0,magnet:0}; G.fusion={id:'',until:0,color:'#fff',label:''};
    G.px=G.w*.5; G.py=G.h*(G.layout?.portrait ? .80 : .82); G.invulnUntil=performance.now()+2200; G.lastTs=performance.now();
    A().pauseAmbience?.(false); UI().renderGameOver(G,false); buildStage(); UI().flashMsg(`REINICIO · CHECKPOINT ${G.wave}`, 1000);
  }

  function destroyMeteor(ob,source='player'){ ob.alive=false; A().obstacleBreak?.(); const playerMade=source==='player'; const bonus=playerMade?Math.round(90*G.sector*mutatorScoreMul()*(G.sectorMutator?.id==='debris'?1.8:1)):0; if(playerMade){ G.meteorKillsWave++; objectiveEvent('meteor',1); G.score+=bonus; E()?.add?.(2+Math.floor(G.sector/2),2); } explode(ob.x,ob.y,'#ffb45e',22,160); addText(ob.x,ob.y,playerMade?`ROCA +${bonus}`:'ROCA DESTRUIDA','#ffcf7c',900); if(playerMade) maybeDrop(Math.random()<.28?'heal':'spread', ob.x, ob.y, 1); }

  function updateObstacles(dt){ G.obstacles = G.obstacles.filter(o=>o.alive); const margin=G.layout?.sideMargin||12; G.obstacles.forEach(o=>{ o.angle += o.spin * dt/1000; if(o.motion!=='static'){ o.x += (o.vx||0)*dt/1000; o.y += (o.vy||0)*dt/1000; if(o.x>-o.r*.2 && o.x<G.w+o.r*.2) o.entered=true; const top=G.h*.40,bottom=G.h*.73; if(o.motion==='diagonal'){ if(o.y<top){o.y=top;o.vy=Math.abs(o.vy||0);} if(o.y>bottom){o.y=bottom;o.vy=-Math.abs(o.vy||0);} } const goneRight=(o.vx||0)>0 && o.entered && o.x>G.w+o.r*1.5; const goneLeft=(o.vx||0)<0 && o.entered && o.x<-o.r*1.5; if(goneRight||goneLeft) o.alive=false; } else { o.x=clamp(o.x,margin+o.r,G.w-margin-o.r); } }); }

  function spawnGem(x,y,value=1){
    G.gemDrops.push({x,y,vx:rand(-36,36),vy:rand(18,58),value:Math.max(1,Math.round(value)),life:15000,phase:Math.random()*Math.PI*2,size:G.layout?.portrait?10:12});
  }
  function spawnGemBurst(x,y,count=1,baseValue=2){ for(let i=0;i<count;i++) spawnGem(x+rand(-18,18),y+rand(-10,10),baseValue+Math.floor(Math.random()*3)); }
  function updateGemDrops(dt,now){
    for(let i=G.gemDrops.length-1;i>=0;i--){
      const g=G.gemDrops[i]; g.life-=dt; const dx=G.px-g.x,dy=G.py-g.y,dist=Math.hypot(dx,dy)||1;
      const vacuum=now<(G.activePowers.magnet||0), base=(G.layout?.portrait?145:118)*profileMagnetMul();
      const radius=vacuum?Math.max(G.w,G.h)*1.4:base;
      if(dist<radius){ const force=vacuum?950:500; g.vx+=dx/dist*force*dt/1000; g.vy+=dy/dist*force*dt/1000; g.vx*=.90;g.vy*=.90; }
      else { g.vx*=.985;g.vy+=7*dt/1000; }
      g.x+=g.vx*dt/1000;g.y+=g.vy*dt/1000;
      const ph=G.layout?.playerH||64;if(dist<ph*.48){ E()?.addGemCoins?.(g.value); addText(g.x,g.y,`+${g.value}◈`,'#7fffd4',520,0,-9,true);G.gemDrops.splice(i,1);continue; }
      if(g.life<=0||g.y>G.h+40)G.gemDrops.splice(i,1);
    }
  }
  function updatePowerDrops(dt, now){
    for(let i=G.powerDrops.length-1;i>=0;i--){
      const p = G.powerDrops[i]; p.life -= dt; p.phase += dt/200;
      const dx=G.px-p.x, dy=G.py-p.y, dist=Math.hypot(dx,dy)||1;
      const baseMag=G.layout?.portrait?C.rewards.mobileMagnetRadius:C.rewards.desktopMagnetRadius;
      const magnet=(now<(G.activePowers.magnet||0)?Math.max(G.w,G.h)*1.5:baseMag*(G.ship?.magnet||1)*(1+(G.bossAugments.magnet||0))*(G.sectorMutator?.magnetMul||1)*profileMagnetMul());
      if(dist<magnet){
        const pull=clamp(1-dist/magnet,.12,1);
        p.vx += dx/dist*(420*pull)*dt/1000; p.vy += dy/dist*(420*pull)*dt/1000;
        p.vx*=.93; p.vy*=.93;
      } else { p.vx*=.98; p.vy+=(G.layout?.portrait?8:10)*dt/1000; }
      p.x += (p.vx||0)*dt/1000; p.y += p.vy*dt/1000;
      if(p.life<=0 || p.y>G.h+40){ G.powerDrops.splice(i,1); continue; }
      const rect = pickupRect(p);
      const ph=G.layout?.playerH||64, playerRect = {x:G.px-ph*.29,y:G.py-ph*.42,w:ph*.58,h:ph*.84};
      if(rectHit(rect, playerRect)){ applyPower(p.kind); if(['bossSupply','bossArenaPod','preludeSupply','matrixSupport'].includes(p.source)) M()?.noteSupplyUsed?.(p.kind,p.source); G.powerDrops.splice(i,1); }
    }
  }

  function updateRewardPods(dt, now){
    for(const pod of G.rewardPods){ if(pod.open) continue; pod.bob += dt/600; pod.y += Math.sin(pod.bob)*0.12; }
  }

  function applyPower(kind){
    const now = performance.now();
    if(kind==='heal'){ G.hp = Math.min(G.maxHp, G.hp + 5); }
    else if(kind==='life'){ G.lives=Math.min(C.progression.maxLives+(G.bossAugments.maxLives||0),G.lives+1); }
    else if(kind==='magnet'){
      const powers=G.powerDrops.filter(p=>p.kind!=='magnet').splice(0);
      G.powerDrops=G.powerDrops.filter(p=>p.kind==='magnet');
      let gemValue=0; for(const g of G.gemDrops){ gemValue+=g.value||1; } G.gemDrops=[]; if(gemValue) E()?.addGemCoins?.(gemValue);
      for(const p of powers){ if(C.powers[p.kind]) applyPower(p.kind); }
      G.activePowers.magnet=now+5000;
      addText(G.px,G.py-48,`VACÍO MAGNÉTICO · +${gemValue}◈`,'#ffe66a',1050,0,-14,true);
    }
    else if(kind==='emp'){
      for(const e of G.enemies){ if(e.role!=='boss'){ e.hp -= 2.4; if(e.hp<=0) killEnemy(e); } }
      explode(G.px,G.py,'#c8a7ff',22,150);
    } else {
      const durations = {spread:8000, shield:7000, chain:7000, missile:6500, overdrive:7000, drone:C.allyDrone.durationMs};
      const dur=(durations[kind]||6000)*(G.ship?.powerDuration||1)*(G.sectorMutator?.powerDuration||1)*profilePowerMul();
      const base=Math.max(now,G.activePowers[kind]||0);
      G.activePowers[kind]=Math.min(now+C.rewards.powerMaxExtensionMs, base+dur);
      if(kind==='shield' && weaponTier('shield')>=2){
        const radius=C.weaponEvolution.shieldPulseRadius*(G.layout?.portrait ? .82:1), before=G.enemyBullets.length;
        G.enemyBullets=G.enemyBullets.filter(b=>Math.hypot(b.x-G.px,b.y-G.py)>radius);
        if(weaponTier('shield')>=3){ for(const e of G.enemies){ if(e.alive && Math.hypot(e.x+e.w/2-G.px,e.y+e.h/2-G.py)<radius*.92){ applySpecialEnemyDamage(e,.8,'shield-pulse',now); } } }
        if(before!==G.enemyBullets.length) explode(G.px,G.py,'#79efff',12,120);
      }
    }
    A().power(kind); UI().flashMsg(C.powers[kind].label, 700); addText(G.px,G.py-28,C.powers[kind].label,C.powers[kind].color,1000,0,-18,true);
  }

  function useInventoryPower(kind){
    if(!G.running || G.gameOver || G.lifeLost || !C.powers[kind]) return false;
    if(kind==='heal' && G.hp>=G.maxHp-.01){ UI().flashMsg('CASCO COMPLETO',480); return false; }
    if(kind==='life' && G.lives>=C.progression.maxLives+(G.bossAugments.maxLives||0)){ UI().flashMsg('VIDAS AL MÁXIMO',480); return false; }
    if(!E()?.consume?.(kind)) return false;
    applyPower(kind); saveProgress(); return true;
  }
  function applyStoreUpgrade(item){
    if(!item || item.type!=='upgrade' || !G.running) return;
    if(item.upgrade==='hull'){ G.maxHp+=1; G.hp=Math.min(G.maxHp,G.hp+1); addText(G.px,G.py-42,'CASCO +1','#ffe875',900,0,-12,true); }
    else if(item.upgrade==='armor') addText(G.px,G.py-42,'ARMADURA +5%','#9fe8ff',850,0,-12,true);
    else if(item.upgrade==='thruster') addText(G.px,G.py-42,'MOTORES +4%','#9fe8ff',850,0,-12,true);
    else if(item.upgrade==='firerate') addText(G.px,G.py-42,'CADENCIA +3%','#ffe28a',850,0,-12,true);
    else if(item.upgrade==='dronebay') addText(G.px,G.py-42,`BAHÍA · ${droneCount()} DRON${droneCount()>1?'ES':''}`,'#7fffd4',900,0,-12,true);
    saveProgress();
  }

  function updateParticles(dt){
    for(let i=G.particles.length-1;i>=0;i--){ const p=G.particles[i]; p.x+=p.vx*dt/1000; p.y+=p.vy*dt/1000; p.life-=dt; p.vx*=0.992; p.vy*=0.992; if(p.life<=0) G.particles.splice(i,1);} 
    const max = G.lowFx ? 180 : 300; if(G.particles.length > max) G.particles.splice(0, G.particles.length-max);
  }
  function updateTexts(dt){ for(let i=G.texts.length-1;i>=0;i--){ const t=G.texts[i]; t.x += t.vx*dt/1000; t.y += t.vy*dt/1000; t.life -= dt; if(t.life<=0) G.texts.splice(i,1);} }

  function awardWaveClear(){
    const perfect=G.waveDamageTaken<=0.001;
    let bonus=C.combatDirector.waveClearBase*G.wave*G.sector;
    if(perfect) bonus+=C.combatDirector.perfectWaveBonus*G.sector;
    if(G.maxComboWave>=10) bonus+=G.maxComboWave*18;
    bonus*=mutatorScoreMul(); G.score+=Math.round(bonus); E()?.rewardWave?.(G.sector,perfect,G.maxComboWave); A().waveClear(perfect);
    addText(G.w*.5,G.h*.34,perfect?`PERFECT +${Math.round(bonus)}`:`OLEADA +${Math.round(bonus)}`,perfect?'#9dffb3':'#a8e7ff',1200,0,-14,true);
  }
  function awardSectorClear(){
    let bonus=C.combatDirector.sectorClearBase*G.sector + G.lives*140;
    if(G.waveDamageTaken<=0.001) bonus+=C.combatDirector.perfectWaveBonus*2*G.sector;
    bonus*=mutatorScoreMul(); G.score+=Math.round(bonus); E()?.rewardSector?.(G.sector,G.waveDamageTaken<=0.001); A().waveClear(G.waveDamageTaken<=0.001);
    addText(G.w*.5,G.h*.28,`BONUS SECTOR +${Math.round(bonus)}`,'#ffe38a',1450,0,-16,true);
  }

  function advanceSector(){
    if(!G.running || G.gameOver) return;
    const nextSector=G.sector+1;
    G.rewardPending=false; G.rewardStartedAt=0; G.rewardTransitionAt=0; G.phase='sectorTransition'; G.phaseName='SALTO';
    G.sector = nextSector; G.wave = 1;
    G.hp = Math.min(G.maxHp, G.hp + Math.max(3,G.maxHp*.28));
    G.lives = Math.min(C.progression.maxLives+(G.bossAugments.maxLives||0),G.lives+1);
    A().extraLife();
    buildStage();
    G.sectorTransitionLock=false;
  }

  function updateProgression(now){
    if(G.rewardPending || G.phase==='reward' || G.phase==='sectorTransition' || G.phase==='preboss') return;
    const aliveFormation = G.enemies.some(e=>e.alive && (e.role==='formation' || e.role==='guardian' || e.role==='diver' || e.role==='miniboss' || e.role==='reviving' || e.role==='breedDrone' || e.role==='hordeDiver' || e.role==='microSwarm'));
    const aliveBoss = G.enemies.some(e=>e.alive && e.role==='boss');
    if(!aliveFormation && !aliveBoss){
      if(G.wave===C.progression.bossWave && G.phase!=='boss'){
        if(G.subphase===0){ // post horde
          G.subphase=1; G.phaseName='HORDA'; G.score+=220*G.sector; addText(G.w*.5,G.h*.33,'LÍNEA ROTA','#ffc979',900,0,-12,true); spawnPostHorde(); UI().flashMsg('HORDA FINAL', 900);
        } else if(G.subphase===1){
          G.subphase=2; spawnBoss();
        }
      } else {
        awardWaveClear(); nextWave();
      }
    }
  }

  function spawnPostHorde(){
    G.enemies=[];
    const base = G.layout?.portrait ? 12 : (G.w>=1200?22:16);
    const n = base + G.sector*2;
    const ew=Math.max(26,(G.layout?.ew||30)*.82), eh=ew*.8;
    for(let i=0;i<n;i++){
      const kc=C.encounterEvolution?.kamikaze||{}, kamikaze=!!kc.enabled && Math.random()<(kc.hordeChance||.58), hp=3+Math.floor(G.sector/3)+(kamikaze?1:0);
      G.enemies.push({ kind:'diver', role:'hordeDiver', x: rand(24,G.w-ew-24), y: -40-i*(G.layout?.portrait?34:24), w:ew,h:eh, renderH:eh*1.45, hp,maxHp:hp, alive:true, t:rand(0,2), phase:Math.random()*Math.PI*2, score:48, color:'#ff8fa1', hordeShot:false,hordeShot2:false,kamikaze,kamikazeArmedAt:kamikaze?performance.now()+(kc.telegraphMs||520):0, familyWorld:integratedWorld()?.id||0, familyRole:'hunter', familySeed:Math.random()*10 });
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
    const shaken=G.shake>0;
    if(shaken){ const sx=rand(-G.shake,G.shake), sy=rand(-G.shake,G.shake); ctx.save(); ctx.translate(sx,sy); G.shake *= 0.84; if(G.shake<.35) G.shake=0; }
    renderObstacles(ctx);
    renderRewardPods(ctx);
    renderPowerDrops(ctx, now);
    renderGemDrops(ctx, now);
    renderEnemies(ctx, now);
    renderBossDeathFx(ctx, now);
    renderTelegraphs(ctx, now);
    renderBullets(ctx, now);
    renderBossRewards(ctx, now);
    renderPlayer(ctx, now);
    renderAllyDrone(ctx,now);
    renderBossAlly(ctx,now);
    renderAttachedRelics(ctx, now);
    renderParticles(ctx);
    renderTexts(ctx);
    renderBossBars(ctx);
    if(shaken) ctx.restore();
    UI().renderHud({player:G.player, ship:G.ship, sector:G.sector, sectorName:integratedWorld()?.sectorName||currentSectorCfg().name, wave:G.wave, score:G.score, lives:G.lives, hp:G.hp, maxHp:G.maxHp, checkpointWave:G.checkpointWave, activePowerText:currentPowerText(), evolutionText:evolutionSummary(), phaseName:G.phaseName, combo:G.combo, objectiveText:objectiveText(), fusionText:fusionText(now), mutatorName:G.sectorMutator?.name||'', economyProfile:E()?.state?.(), activePowers:{...G.activePowers}, now, bossAllyText:bossAllyStatus(now), bossAllyReady:bossAllyCanActivate(now), bossAllyActive:now<(G.bossAllyActiveUntil||0), bossAllyProgress:bossAllyProgress(now)});
  }

  function renderBg(ctx, sc, now){
    const img=NS.assets?.getBackground(G.sector);
    const worldPhase=G.wave===C.progression.bossWave?'boss':G.wave>=3?'intense':'base';
    const wbg=NS.assets?.getWorldBackground?.(G.sector,worldPhase);
    const primaryRealistic=!!(wbg && C.worldFamilies?.realisticPrimary);
    if(primaryRealistic){
      // El fondo realista mapeado es el lienzo principal, también en ciclos posteriores.
      const s2=Math.max(G.w/wbg.width,G.h/wbg.height)*1.025, dw2=wbg.width*s2, dh2=wbg.height*s2;
      const ex=Math.max(0,dw2-G.w), ey=Math.max(0,dh2-G.h);
      const dx=-ex*(.50+.34*Math.sin(now/15000)), dy=-ey*(.50+.24*Math.sin(now/18500+.6));
      ctx.save(); ctx.globalAlpha=C.worldFamilies.backgroundOverlayAlpha||.78; ctx.drawImage(wbg,dx,dy,dw2,dh2); ctx.restore();
      // El fondo original permanece como textura fantasma/parallax, no como protagonista.
      if(img){
        const scale=Math.max(G.w/img.width,G.h/img.height), dw=img.width*scale, dh=img.height*scale;
        const x=(G.w-dw)/2 + Math.sin(now/12000)*Math.min(12,Math.max(0,dw-G.w)*.18);
        const y=(G.h-dh)/2 + Math.sin(now/15500+.8)*Math.min(10,Math.max(0,dh-G.h)*.14);
        ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=C.worldFamilies.originalBackgroundGhostAlpha||.14;ctx.drawImage(img,x,y,dw,dh);ctx.restore();
      }
      const shade=ctx.createLinearGradient(0,0,0,G.h); shade.addColorStop(0,'rgba(0,0,0,.05)'); shade.addColorStop(.52,'rgba(0,0,0,.13)'); shade.addColorStop(1,'rgba(0,0,0,.30)'); ctx.fillStyle=shade; ctx.fillRect(0,0,G.w,G.h);
    } else if(img){
      const scale=Math.max(G.w/img.width,G.h/img.height);
      const dw=img.width*scale, dh=img.height*scale;
      const excessX=Math.max(0,dw-G.w), excessY=Math.max(0,dh-G.h);
      const driftX=(Math.sin(now/9000)+1)*.5, driftY=(Math.sin(now/12500+.8)+1)*.5;
      const x=-excessX*(.25+.5*driftX), y=-excessY*(.18+.64*driftY);
      ctx.globalAlpha=.82; ctx.drawImage(img,x,y,dw,dh); ctx.globalAlpha=1;
      const shade=ctx.createLinearGradient(0,0,0,G.h); shade.addColorStop(0,'rgba(0,0,0,.06)'); shade.addColorStop(.5,'rgba(0,0,0,.15)'); shade.addColorStop(1,'rgba(0,0,0,.28)'); ctx.fillStyle=shade; ctx.fillRect(0,0,G.w,G.h);
    } else {
      const g=ctx.createLinearGradient(0,0,0,G.h); g.addColorStop(0,sc.bg[0]); g.addColorStop(.56,sc.bg[1]); g.addColorStop(1,sc.bg[2]); ctx.fillStyle=g; ctx.fillRect(0,0,G.w,G.h);
    }
    G.stars.forEach(st=>{ st.y += st.z*0.9; if(st.y>G.h){ st.y=-2; st.x=Math.random()*G.w; } ctx.globalAlpha=st.a*.5; ctx.fillStyle='#fff'; ctx.fillRect(st.x,st.y,st.z*1.7,st.z*1.7); }); ctx.globalAlpha=1;
    if(now<G.threatPulseUntil){ ctx.globalAlpha=.08; ctx.fillStyle='#ff6f55'; ctx.fillRect(0,0,G.w,G.h); ctx.globalAlpha=1; }
    if(G.sectorMutator?.id==='ion'){
      const pulse=(Math.sin(now/260)+1)*.5; ctx.globalAlpha=.035+.035*pulse; ctx.fillStyle='#66a8ff'; ctx.fillRect(0,0,G.w,G.h); ctx.globalAlpha=.12; ctx.strokeStyle='#9cc4ff'; ctx.lineWidth=1; for(let i=0;i<3;i++){const y=(now*.08+i*G.h/3)%G.h;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(G.w,y+Math.sin(now/200+i)*16);ctx.stroke();} ctx.globalAlpha=1;
    } else if(G.sectorMutator?.id==='gravity'){
      ctx.globalAlpha=.08;ctx.strokeStyle='#7fe8ff';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(G.w*.5,G.h*.46,G.w*.18+Math.sin(now/350)*8,G.h*.08,now*.00015,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    } else if(G.sectorMutator?.id==='berserk'){
      ctx.globalAlpha=.035+.02*Math.abs(Math.sin(now/180));ctx.fillStyle='#ff4f5f';ctx.fillRect(0,0,G.w,G.h);ctx.globalAlpha=1;
    }
  }

  function renderChassisEvolution(ctx,now,ph){
    const stage=chassisStage(); if(stage<=0) return;
    const ext=(C.shipEvolution?.wingExtension?.[stage]||.08)*ph;
    const glow=C.shipEvolution?.glowStrength?.[stage]||.12;
    const pulse=.72+.28*Math.sin(now/130);
    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.strokeStyle=G.ship.accent||G.ship.color; ctx.fillStyle=G.ship.color; ctx.lineWidth=Math.max(1.4,ph*.021);
    ctx.shadowColor=G.ship.color; ctx.shadowBlur=ph*(.10+glow);
    // Etapa I: estabilizadores laterales que ensanchan visualmente el chasis.
    ctx.globalAlpha=.52+.16*pulse;
    for(const side of [-1,1]){
      const sx=side*(ph*.29+ext);
      ctx.beginPath(); ctx.moveTo(side*ph*.17,-ph*.05); ctx.lineTo(sx,ph*.08); ctx.lineTo(side*(ph*.22+ext*.45),ph*.24); ctx.stroke();
      ctx.beginPath(); ctx.arc(sx,ph*.09,Math.max(2.2,ph*.034),0,Math.PI*2); ctx.fill();
    }
    // Etapa II: pods de armamento persistentes.
    if(stage>=2){
      ctx.globalAlpha=.68;
      for(const side of [-1,1]){
        const px=side*(ph*.25+ext*.55), py=-ph*.12;
        ctx.fillRect(px-ph*.025,py-ph*.085,ph*.05,ph*.15);
        ctx.globalAlpha=.32+.28*pulse; ctx.beginPath();ctx.arc(px,py-ph*.09,ph*.035,0,Math.PI*2);ctx.fill(); ctx.globalAlpha=.68;
      }
    }
    // Etapa III: emisor dorsal/halo de energía asociado a la evolución de reliquias.
    if(stage>=3){
      ctx.globalAlpha=.18+.11*pulse; ctx.lineWidth=Math.max(1.2,ph*.018);
      ctx.beginPath(); ctx.ellipse(0,-ph*.05,ph*.36+ext,ph*.18,now*.00035,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0,-ph*.05,ph*.25,ph*.11,-now*.0005,0,Math.PI*2); ctx.stroke();
    }
    // Etapa IV: dos nodos auxiliares compactos; permanecen pegados al chasis para no confundirlos con enemigos.
    if(stage>=4){
      ctx.globalAlpha=.54+.18*pulse;
      for(const side of [-1,1]){
        const a=now*.0011+(side<0?Math.PI:0), rr=ph*.39+ext*.35;
        const x=side*rr, y=ph*.02+Math.sin(a)*ph*.035;
        ctx.beginPath(); ctx.arc(x,y,ph*.045,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=.20;ctx.beginPath();ctx.arc(x,y,ph*.08,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.54+.18*pulse;
      }
    }
    ctx.restore();
  }

  function renderPlayer(ctx, now){
    ctx.save(); ctx.translate(G.px,G.py);
    if(G.fusion?.until>now){ const rr=(G.layout?.playerH||64)*.62; ctx.globalAlpha=.18+.1*Math.sin(now/90); ctx.strokeStyle=G.fusion.color||'#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,rr,now*.004,now*.004+Math.PI*1.55);ctx.stroke(); ctx.globalAlpha=1; }
    ctx.globalAlpha = now < G.invulnUntil && Math.floor(now/90)%2===0 ? 0.35 : 1;
    const ph=G.layout?.playerH||64;
    if(now < G.activePowers.shield){
      const sr=ph*.5;
      ctx.strokeStyle='rgba(111,239,255,.92)'; ctx.lineWidth=Math.max(2,ph*.032); ctx.beginPath(); ctx.arc(0,0,sr + Math.sin(now/120)*2,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha*=0.18; ctx.fillStyle='#6fefff'; ctx.beginPath(); ctx.arc(0,0,sr-2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = now < G.invulnUntil && Math.floor(now/90)%2===0 ? 0.35 : 1;
    }
    renderChassisEvolution(ctx,now,ph);
    const img=NS.assets?.getShip(G.shipId);
    if(img){
      const h=ph, w=h*(img.width/img.height); ctx.shadowColor=G.ship.color; ctx.shadowBlur=Math.max(8,ph*.13); ctx.drawImage(img,-w/2,-h/2,w,h); ctx.shadowBlur=0;
    } else {
      ctx.fillStyle=G.ship.color; ctx.beginPath(); ctx.moveTo(0,-ph*.4); ctx.lineTo(ph*.3,ph*.3); ctx.lineTo(0,ph*.23); ctx.lineTo(-ph*.3,ph*.3); ctx.closePath(); ctx.fill();
    }
    const ch=chassisStage(), trailMul=C.shipEvolution?.engineTrailMul?.[ch]||1;
    ctx.globalAlpha=.72; ctx.fillStyle=G.ship.accent; const flame=ph*(.12+Math.sin(now/80)*.035)*trailMul; ctx.fillRect(-ph*.11,ph*.42,ph*.055,flame); ctx.fillRect(ph*.055,ph*.42,ph*.055,flame);
    if(ch>=2){ctx.globalAlpha=.22+.09*Math.sin(now/70);ctx.fillStyle=G.ship.color;ctx.fillRect(-ph*.13,ph*.42,ph*.09,flame*1.18);ctx.fillRect(ph*.04,ph*.42,ph*.09,flame*1.18);} ctx.globalAlpha=1;
    ctx.restore();
  }

  function renderAllyDrone(ctx,now){
    if((G.activePowers.drone||0)<=now) return;
    const count=droneCount(), rr=(G.layout?.portrait?C.allyDrone.orbitRadiusMobile:C.allyDrone.orbitRadiusDesktop)+(count-1)*3;
    for(let i=0;i<count;i++){
      const a=(G.droneAngle||0)+i*(Math.PI*2/count), x=G.px+Math.cos(a)*rr, y=G.py+Math.sin(a)*rr*.48;
      ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI/2);ctx.shadowColor='#7fffd4';ctx.shadowBlur=9;ctx.fillStyle='#baffeb';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(7,5);ctx.lineTo(0,2);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();ctx.fillStyle='#4dd9bf';ctx.beginPath();ctx.arc(0,0,2.6,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }

  function renderBossAlly(ctx,now){
    if(now>=(G.bossAllyActiveUntil||0)) return;
    const wb=NS.assets?.getWorldBoss?.(G.bossAllyWorld||1); const img=wb?.img; const side=((Math.floor(now/1400)%2)?1:-1), x=G.px+side*(G.layout?.portrait?58:78), y=G.py+8+Math.sin(now/240)*5;
    ctx.save();ctx.translate(x,y);ctx.globalAlpha=.82;ctx.shadowColor='#ffe66a';ctx.shadowBlur=14;
    if(img){ const h=G.layout?.portrait?42:54,w=h*(img.width/img.height);ctx.drawImage(img,-w/2,-h/2,w,h); }
    else {ctx.fillStyle='#ffe66a';ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }

  function renderBossIdentityAura(ctx,e,now,h){
    if(e.role!=='boss') return;
    const id=e.identity?.id||'nova', t=now/1000;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineWidth=1.5;
    if(now<(e.signatureUntil||0)){
      const pulse=.45+.35*Math.abs(Math.sin(now/70));
      ctx.globalAlpha=pulse; ctx.strokeStyle=e.signatureColor||e.identity?.accent||'#fff0a6'; ctx.lineWidth=2.2;
      for(let k=0;k<2;k++){ ctx.beginPath(); ctx.ellipse(0,0,h*(.46+k*.13)+Math.sin(now/90+k)*3,h*(.24+k*.07),now*.0006*(k?1:-1),0,Math.PI*2); ctx.stroke(); }
    }

    if(id==='nova'){
      ctx.strokeStyle='#ff796d';ctx.globalAlpha=.22;for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.35;ctx.beginPath();ctx.moveTo(Math.cos(a)*h*.34,Math.sin(a)*h*.23);ctx.lineTo(Math.cos(a)*h*.57,Math.sin(a)*h*.39);ctx.stroke();}
    } else if(id==='lancer'){
      ctx.strokeStyle='#8fc8ff';ctx.globalAlpha=.22;for(const x of [-.34,0,.34]){ctx.beginPath();ctx.moveTo(h*x,-h*.44);ctx.lineTo(h*x*.55,h*.52);ctx.stroke();}
    } else if(id==='brood'){
      ctx.fillStyle='#d193ff';ctx.globalAlpha=.20;for(let i=0;i<5;i++){const a=t*.5+i*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*h*.46,Math.sin(a)*h*.27,3+Math.sin(t*3+i),0,Math.PI*2);ctx.fill();}
    } else if(id==='gravity'){
      ctx.strokeStyle='#7defff';ctx.globalAlpha=.18;for(let i=1;i<=3;i++){ctx.beginPath();ctx.ellipse(0,0,h*(.24+i*.11),h*(.12+i*.06),t*.16+i*.55,0,Math.PI*2);ctx.stroke();}
    } else {
      ctx.strokeStyle='#ffcf74';ctx.globalAlpha=.22;for(let i=0;i<4;i++){const a=t*.65+i*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*h*.18,Math.sin(a)*h*.08,h*.34,a,a+Math.PI*.7);ctx.stroke();}
    }
    ctx.restore();
  }

  function renderFamilyMinion(ctx,e,now,h){
    if(!e.familyWorld || !e.familyRole) return false;
    const fam=NS.assets?.getWorldMinion?.(e.familyWorld,e.familyRole,!!e.eliteClass); if(!fam) return false;
    const alpha=e.familyWorld===normalizedFamilyWorldId(G.sector) ? .98:.90;
    const img=fam.sheet||fam.img; if(!img) return false;
    const frames=fam.sheet?fam.frames:1, frame=familyFrame(img,frames,now,e.familySeed||0,e.role==='diver'?11:8);
    const cellW=img.width/frames, cellH=img.height; const ww=h*(cellW/cellH);
    ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.shadowColor=e.color||'#fff'; ctx.shadowBlur=Math.max(5,h*.10);
    drawHorizontalSheet(ctx,img,frames,frame,0,0,ww,h,alpha,0); ctx.restore(); return true;
  }

  function renderWorldSubbossPrimary(ctx,e,now,h){
    if(!e.familyWorld || !['guardian','miniboss'].includes(e.role)) return false;
    const sub=NS.assets?.getWorldSubboss?.(e.familyWorld,e.worldSubbossIndex||0); if(!sub?.sheet&&!sub?.img) return false;
    const img=sub.sheet||sub.img, frames=sub.sheet?sub.frames:1, frame=familyFrame(img,frames,now,e.t||0,6.5);
    const cellW=img.width/frames, cellH=img.height, hh=h*1.48, ww=hh*(cellW/cellH);
    ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.shadowColor=e.color||'#fff'; ctx.shadowBlur=16;
    drawHorizontalSheet(ctx,img,frames,frame,0,0,ww,hh,C.worldFamilies.subbossOverlayAlpha||.96,Math.sin(now/1050)*.018); ctx.restore();
    return true;
  }

  function renderWorldBossPrimary(ctx,e,now,h){
    if(e.role!=='boss') return false;
    const wb=NS.assets?.getWorldBoss?.(e.familyWorld||G.sector); if(!wb) return false;
    const ph=bossPhaseIndex(e), frames=wb.phaseFrames||6, frame=Math.min(frames-1,Math.round(ph/2*(frames-1)));
    let img=wb.phasesSheet, useFrames=frames, useFrame=frame;
    if(now<(e.coreOpenUntil||0) && wb.openCore){ img=wb.openCore; useFrames=1; useFrame=0; }
    else if(!img && wb.img){ img=wb.img; useFrames=1; useFrame=0; }
    if(!img) return false;
    const cellW=img.width/useFrames, cellH=img.height, hh=h*1.50, ww=hh*(cellW/cellH);
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.shadowColor=e.identity?.accent||e.color;ctx.shadowBlur=22;
    drawHorizontalSheet(ctx,img,useFrames,useFrame,0,0,ww,hh,C.worldFamilies.bossOverlayAlpha||.96,Math.sin(now/1500)*.012);ctx.restore();
    return true;
  }

  // Alias de compatibilidad para pruebas/ramas anteriores del render híbrido.
  function renderWorldSubbossAura(ctx,e,now,h){ return renderWorldSubbossPrimary(ctx,e,now,h); }
  function renderWorldBossAura(ctx,e,now,h){ return renderWorldBossPrimary(ctx,e,now,h); }

  function renderBossDeathFx(ctx,now){
    const fx=G.bossDeathFx; if(!fx) return;
    const elapsed=now-fx.startedAt, duration=fx.duration||920;
    if(elapsed>=duration){ G.bossDeathFx=null; return; }
    const wb=NS.assets?.getWorldBoss?.(fx.worldId||G.sector); if(!wb?.deathSheet) return;
    const frames=wb.deathFrames||8, progress=clamp(elapsed/duration,0,.999), frame=Math.min(frames-1,Math.floor(progress*frames));
    const fw=wb.deathSheet.width/frames, fh=wb.deathSheet.height;
    const hh=(fx.h||150)*(1.45+.10*progress), ww=hh*(fw/fh);
    ctx.save();ctx.translate(fx.x,fx.y);ctx.globalCompositeOperation='screen';ctx.globalAlpha=1-progress*.15;ctx.shadowColor=fx.color||'#ffb36b';ctx.shadowBlur=22+progress*26;
    ctx.drawImage(wb.deathSheet,frame*fw,0,fw,fh,-ww/2,-hh/2,ww,hh);ctx.restore();
  }

  function renderBossModules(ctx,e,now,h){
    if(e.role!=='boss'||!e.armorNodes?.length) return;
    const rr=bossModuleRadius(e), cx=e.x+e.w/2, cy=e.y+e.h/2;
    for(const node of e.armorNodes){
      if(!node.alive) continue;
      const pos=bossModulePos(e,node,now), lx=pos.x-cx, ly=pos.y-cy;
      ctx.save(); ctx.globalCompositeOperation='screen';
      ctx.globalAlpha=.22; ctx.strokeStyle='#78e8ff'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(0,h*.02); ctx.lineTo(lx,ly); ctx.stroke();
      ctx.globalAlpha=.35; ctx.fillStyle='#68dfff'; ctx.beginPath(); ctx.arc(lx,ly,rr*1.45,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=.96; ctx.fillStyle='#d9fbff'; ctx.shadowColor='#7ceeff'; ctx.shadowBlur=16; ctx.beginPath(); ctx.arc(lx,ly,rr*.56,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      const pct=clamp(node.hp/node.maxHp,0,1); ctx.globalAlpha=.9; ctx.strokeStyle='#9af2ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(lx,ly,rr*.95,-Math.PI/2,-Math.PI/2+Math.PI*2*pct); ctx.stroke(); ctx.restore();
    }
  }

  function renderBossHardpoints(ctx,e,now,h){
    if(e.role!=='boss'||!e.hardpoints?.length) return;
    const rr=bossHardpointRadius(e), cx=e.x+e.w/2, cy=e.y+e.h/2;
    for(const part of e.hardpoints){
      const pos=bossHardpointPos(e,part), lx=pos.x-cx, ly=pos.y-cy;
      ctx.save();
      if(!part.alive){
        ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.20; ctx.fillStyle='#ff5b45';
        ctx.beginPath(); ctx.arc(lx,ly,rr*.72,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=.18; ctx.strokeStyle='#ffb29a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(lx-rr*.8,ly-rr*.8); ctx.lineTo(lx+rr*.8,ly+rr*.8); ctx.moveTo(lx+rr*.8,ly-rr*.8); ctx.lineTo(lx-rr*.8,ly+rr*.8); ctx.stroke();
        ctx.restore(); continue;
      }
      const col=part.id==='regulator'?'#ffe27a':part.id==='drive'?'#c8a5ff':'#ff9f76';
      const pct=clamp(part.hp/part.maxHp,0,1), vulnerable=(e.fortressHp||0)<=0 || now<(e.coreOpenUntil||0);
      const pulse=1+(vulnerable?.18:.08)*Math.sin(now/(vulnerable?72:95)+(part.idNum||0));
      ctx.globalCompositeOperation='screen'; ctx.globalAlpha=vulnerable?.28:.16; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(lx,ly,rr*(vulnerable?1.72:1.45)*pulse,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=.92; ctx.strokeStyle=col; ctx.lineWidth=vulnerable?2.4:1.8; ctx.setLineDash(vulnerable?[2,2]:[3,3]); ctx.beginPath(); ctx.arc(lx,ly,rr*pulse,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha=.95; ctx.fillStyle='#fff7e4'; ctx.beginPath(); ctx.arc(lx,ly,Math.max(2.4,rr*.24),0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=.9; ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(lx,ly,rr*.78,-Math.PI/2,-Math.PI/2+Math.PI*2*pct); ctx.stroke();
      if(vulnerable){ ctx.globalAlpha=.82; ctx.fillStyle=col; ctx.font='800 7px Inter,Arial'; ctx.textAlign='center'; ctx.fillText(part.id==='regulator'?'REG':part.id==='drive'?'MOTOR':'ARMA',lx,ly-rr*1.35); }
      ctx.restore();
    }
  }

  function renderEnemies(ctx, now){
    for(const e of G.enemies){
      if(!e.alive) continue;
      ctx.save(); ctx.translate(e.x+e.w/2, e.y+e.h/2);
      if(now<(e.cloakUntil||0)){ const p=clamp(((e.cloakUntil||now)-now)/Math.max(1,(e.cloakUntil||now)-(e.cloakStart||now)),0,1); ctx.globalAlpha=.24+.28*Math.sin(p*Math.PI); }
      if(['diver','escort','breedDrone','hordeDiver','microSwarm'].includes(e.role)) ctx.rotate(Math.sin((e.t||0)*8)*0.38);
      const key=e.role==='boss'?'boss':e.role==='miniboss'?'miniboss':e.role==='guardian'?'guardian':e.role==='diver'?'diver':e.kind;
      const img=NS.assets?.getEnemy(key);
      if(e.eliteClass){
        const er=Math.max(e.w,e.h)*.68; const ga=ctx.globalAlpha; ctx.globalAlpha=ga*(.28+.12*Math.sin(now/110+(e.col||0)));ctx.strokeStyle=e.eliteColor||'#ffd66b';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,er,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=ga;
      }
      if(now<(e.phaseShieldUntil||0)){
        const ga=ctx.globalAlpha; ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=ga*(.22+.12*Math.sin(now/85)); ctx.strokeStyle='#92e8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,Math.max(e.w,e.h)*.66,0,Math.PI*2);ctx.stroke();ctx.restore(); ctx.globalAlpha=ga;
      }
      if(img){
        let h=e.renderH || e.h*1.35;
        if(e.role==='formation') h=Math.max(h, e.h*(G.layout?.enemyRenderScale||1.08)*1.34);
        else if(e.role==='diver' || e.role==='hordeDiver' || e.role==='breedDrone' || e.role==='microSwarm') h=Math.max(h, e.h*(G.layout?.enemyRenderScale||1.08)*1.42);
        else if(e.role==='guardian' || e.role==='miniboss') h=Math.max(h, e.h*(G.layout?.subbossRenderScale||1.08)*1.5);
        if(e.role==='boss') h=Math.max(h, G.layout?.portrait?126:156);
        const w=h*(img.width/img.height);
        const pulse=Math.sin(now/(e.role==='boss'?150:210)+(e.col||0)*.7+(e.row||0)*.25);
        const breathe=1+pulse*(e.role==='boss' ? .035:e.role==='miniboss' ? .028:.018);
        const wing=1+Math.sin(now/115+(e.zigSeed||0))*(e.role==='formation' ? .028:.012);
        ctx.scale(wing,breathe);
        if(e.resurrectUntil&&now<e.resurrectUntil){ ctx.globalAlpha=.55+.35*Math.abs(Math.sin(now/65)); ctx.rotate(Math.sin(now/80)*.035); }
        else if(e.role==='reviving'){ ctx.globalAlpha=.42+.5*Math.abs(Math.sin(now/85)); ctx.rotate(Math.sin(now/75)*.055); ctx.scale(.82+.18*Math.abs(Math.sin(now/110)),.82+.18*Math.abs(Math.sin(now/110))); }
        else if(e.hp<e.maxHp*.35){ ctx.rotate(Math.sin(now/90+(e.t||0))*.018); }
        const bossCol=e.role==='boss'?({nova:'#ff7167',lancer:'#8cc8ff',brood:'#ce8cff',gravity:'#72efff',phoenix:'#ffc96c'}[e.identity?.id]||e.color):e.color;
        ctx.shadowColor=bossCol; ctx.shadowBlur=e.role==='boss'?20+Math.abs(pulse)*10:e.role==='miniboss'?12+Math.abs(pulse)*5:Math.max(5,h*.11);
        let primaryDrawn=false;
        if(e.role==='boss'){ primaryDrawn=renderWorldBossPrimary(ctx,e,now,h); renderBossModules(ctx,e,now,h); }
        else if(['guardian','miniboss'].includes(e.role)) primaryDrawn=renderWorldSubbossPrimary(ctx,e,now,h);
        else primaryDrawn=renderFamilyMinion(ctx,e,now,h);
        if(!primaryDrawn) ctx.drawImage(img,-w/2,-h/2,w,h);
        if(e.role==='boss') renderBossHardpoints(ctx,e,now,h);
        renderBossIdentityAura(ctx,e,now,h);
        if(e.kind==='gunner'||e.role==='guardian'||e.role==='miniboss'||e.role==='boss'){
          ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=.12+.12*Math.max(0,pulse); ctx.fillStyle=e.role==='boss'?'#ff625d':'#ff9a78'; ctx.beginPath(); ctx.arc(0,0,Math.max(5,h*.08)*(1+.15*pulse),0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
        }
        if(e.kind==='sentinel'){
          const active=performance.now()>=(e.shieldBrokenUntil||0) && (e.shieldPool||0)>0, rr=sentinelRadiusPx(e);
          ctx.save(); ctx.globalAlpha=active ? .16:.055; ctx.strokeStyle=active?'#7effee':'#5d7d7a'; ctx.lineWidth=1.5; ctx.setLineDash([5,6]); ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]); ctx.globalAlpha=active ? .10:.03;ctx.fillStyle='#64ffe9';ctx.beginPath();ctx.arc(0,0,rr*.72,0,Math.PI*2);ctx.fill();ctx.restore();
        } else if(e.kind==='reanimator'){
          ctx.save(); ctx.globalCompositeOperation='lighter'; for(let q=0;q<3;q++){const a=now*.003+q*Math.PI*2/3;ctx.fillStyle='#d89cff';ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(Math.cos(a)*h*.22,Math.sin(a)*h*.16,2.2,0,Math.PI*2);ctx.fill();}ctx.restore();
        } else if(e.kind==='breeder'){
          ctx.save();ctx.globalCompositeOperation='lighter';for(let q=0;q<3;q++){const a=q*Math.PI*2/3+now*.0018;ctx.fillStyle='#9dff9e';ctx.globalAlpha=.3+.15*Math.sin(now/120+q);ctx.beginPath();ctx.arc(Math.cos(a)*h*.16,Math.sin(a)*h*.12+5,2.8,0,Math.PI*2);ctx.fill();}ctx.restore();
        }
        if(e.role==='boss'){
          const open=now<(e.coreOpenUntil||0), cr=Math.max(8,h*.105)*(open?1.22:1);
          ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=open ? .9:.22;ctx.fillStyle=open?'#fff2a6':'#ff5b59';ctx.shadowColor=open?'#fff2a6':'#ff5b59';ctx.shadowBlur=open?28:12;ctx.beginPath();ctx.arc(0,h*.04,cr*(1+.08*Math.sin(now/70)),0,Math.PI*2);ctx.fill();
          if(open){ctx.globalAlpha=.55;ctx.strokeStyle='#fff9cc';ctx.lineWidth=2;for(let rr=1;rr<=2;rr++){ctx.beginPath();ctx.arc(0,h*.04,cr*(1.5+rr*.55)+Math.sin(now/90+rr)*2,0,Math.PI*2);ctx.stroke();}for(let q=0;q<6;q++){const a=q*Math.PI/3+now*.001;ctx.beginPath();ctx.moveTo(Math.cos(a)*cr*1.4,h*.04+Math.sin(a)*cr*1.4);ctx.lineTo(Math.cos(a)*cr*2.7,h*.04+Math.sin(a)*cr*2.7);ctx.stroke();}}
          ctx.restore();
        }
        ctx.shadowBlur=0;
      } else {
        ctx.fillStyle=e.color; ctx.beginPath(); ctx.moveTo(0,-e.h/2); ctx.lineTo(e.w/2,0); ctx.lineTo(0,e.h/2); ctx.lineTo(-e.w/2,0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      if(e.role==='formation' && e.kind!=='sentinel' && findSentinelProtector(e,now)){
        ctx.save();ctx.globalAlpha=.28;ctx.strokeStyle='#72f7ea';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x+e.w/2,e.y+e.h/2,Math.max(e.w,e.h)*.58,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      if(e.role==='guardian'||e.role==='miniboss') drawSmallHp(ctx,e);
    }
  }

  function renderTelegraphs(ctx,now){
    for(const e of G.enemies){
      if(!e.alive) continue;
      if(e.chargeUntil && now<e.chargeUntil){
        const total=Math.max(1,e.chargeUntil-(e.chargeStart||now-1));
        const remain=e.chargeUntil-now, progress=1-remain/total;
        const sx=e.x+e.w/2, sy=e.y+e.h, tx=e.chargeTargetX, ty=e.chargeTargetY;
        ctx.save(); ctx.globalAlpha=.18+.45*progress; ctx.strokeStyle='#ff9b7d'; ctx.lineWidth=1.2+progress*1.4; ctx.setLineDash([6,7]);
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(tx,ty); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha=.35+.55*progress; ctx.beginPath(); ctx.arc(tx,ty,7+progress*5,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      }
      if(e.role==='boss' && e.huntPending && now<(e.huntWindupUntil||0)){
        const cfg=C.encounterEvolution?.hunterDoctrine||{}, total=Math.max(1,(e.huntWindupUntil||now)-(e.huntWindupStart||now-1)), progress=clamp((now-(e.huntWindupStart||now))/total,0,1);
        const ph=bossPhaseIndex(e), half=G.w*((cfg.laneHalfWidthRatio||[.11,.12,.135])[ph]||.12), tx=e.huntTargetX??G.px, col='#ffb06f';
        ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.08+.20*progress; ctx.fillStyle=col; ctx.fillRect(tx-half,Math.max(44,G.h*.10),half*2,G.h*.82);
        ctx.globalAlpha=.35+.48*progress; ctx.strokeStyle=col; ctx.lineWidth=1.4+progress*1.4; ctx.setLineDash([7,7]); ctx.beginPath();ctx.moveTo(tx-half,Math.max(44,G.h*.10));ctx.lineTo(tx-half,G.h*.92);ctx.moveTo(tx+half,Math.max(44,G.h*.10));ctx.lineTo(tx+half,G.h*.92);ctx.stroke();ctx.setLineDash([]);
        ctx.font='900 9px Inter,Arial';ctx.textAlign='center';ctx.fillStyle='#ffd59c';ctx.globalAlpha=.82;ctx.fillText(`⚠ CONTRAPATRÓN · ${(e.huntPatternReason||'ADAPTACIÓN').toUpperCase()}`,tx,Math.max(32,G.h*.12));ctx.restore();
      }
      if(e.role!=='boss' || !e.signaturePending || now>=(e.signatureWindupUntil||0)) continue;
      const total=Math.max(1,(e.signatureWindupUntil||now)-(e.signatureWindupStart||now-1));
      const progress=clamp((now-(e.signatureWindupStart||now))/total,0,1);
      const cx=e.x+e.w/2, cy=e.y+e.h*.72, tx=e.signatureTargetX??G.px, ty=e.signatureTargetY??G.py;
      const col=e.identity?.accent||'#fff0a6', id=e.identity?.id||'nova';
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=1.4+progress*1.8; ctx.globalAlpha=.18+.48*progress;
      if(id==='lancer'){
        const offs=bossPhaseIndex(e)===2?[-.34,-.17,0,.17,.34]:[-.26,0,.26];
        for(const o of offs){ ctx.beginPath(); ctx.moveTo(cx+e.w*o,cy); ctx.lineTo(tx+o*G.w*.18,ty); ctx.stroke(); }
        ctx.setLineDash([5,6]); ctx.beginPath(); ctx.arc(tx,ty,18+progress*10,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      } else if(id==='gravity'){
        for(let r=1;r<=3;r++){ ctx.beginPath(); ctx.arc(tx,ty,(24+r*18)*(1-progress*.18),0,Math.PI*2); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(cx,cy,24+progress*20,0,Math.PI*2); ctx.stroke();
      } else if(id==='brood'){
        for(let q=0;q<5;q++){ const a=q*Math.PI*2/5+now*.002; const ox=Math.cos(a)*(38+q*5), oy=Math.sin(a)*(24+q*3); ctx.beginPath();ctx.arc(tx+ox,ty+oy,8+progress*5,0,Math.PI*2);ctx.stroke(); }
        ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);
      } else if(id==='phoenix'){
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(tx-G.w*.22,ty);ctx.moveTo(cx,cy);ctx.lineTo(tx+G.w*.22,ty);ctx.stroke();
        ctx.beginPath();ctx.arc(tx,ty,20+progress*14,Math.PI*.12,Math.PI*.88);ctx.stroke();
      } else {
        const rays=bossPhaseIndex(e)===2?10:8;
        for(let q=0;q<rays;q++){ const a=q*Math.PI*2/rays+now*.001;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*22,cy+Math.sin(a)*15);ctx.lineTo(cx+Math.cos(a)*(48+progress*18),cy+Math.sin(a)*(32+progress*12));ctx.stroke(); }
        ctx.beginPath();ctx.arc(tx,ty,18+progress*10,0,Math.PI*2);ctx.stroke();
      }
      ctx.globalAlpha=.75; ctx.font='900 9px Inter,Arial';ctx.textAlign='center';ctx.fillText(`⚠ ${(e.signatureLabel||e.identity?.signature||'FIRMA').toUpperCase()}`,tx,Math.max(22,ty-24));
      ctx.restore();
    }
  }

  function drawSmallHp(ctx,e){ const w=Math.max(e.w,54), x=e.x+(e.w-w)/2, y=e.y-10; ctx.fillStyle='rgba(0,0,0,.58)'; ctx.fillRect(x-1,y-1,w+2,7); ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x,y,w,5); ctx.fillStyle=e.role==='miniboss'?'#ffc26f':'#ff9269'; ctx.fillRect(x,y,w*(e.hp/e.maxHp),5); if(e.subShieldMax){ctx.fillStyle='rgba(20,65,86,.68)';ctx.fillRect(x,y+7,w,3);ctx.fillStyle='#79e7ff';ctx.fillRect(x,y+7,w*clamp((e.subShieldHp||0)/e.subShieldMax,0,1),3);} if(e.identity?.name){ctx.fillStyle='#e8f3ff';ctx.font='700 10px Inter,Arial';ctx.textAlign='center';ctx.fillText(`${e.identity.name}${e.subPressureLevel?` · P${e.subPressureLevel}`:''}`,e.x+e.w/2,y-5); if(performance.now()<(e.signatureUntil||0)){ctx.fillStyle=e.signatureColor||e.color||'#ffd08a';ctx.font='800 8px Inter,Arial';ctx.fillText(e.signatureLabel||e.identity.signature||'',e.x+e.w/2,y-15);}} }
  function renderBossBars(ctx){
    for(const e of G.enemies){ if(e.role==='boss'){
      const w=Math.min(G.w*(G.layout?.portrait ? .72 : .5),420), x=G.w/2-w/2, y=Math.max(46,G.h*.05);
      const ph=bossPhaseIndex(e);
      const pressure=e.pressureLevel||0; ctx.fillStyle='#eaf3ff';ctx.font='800 10px Inter,Arial';ctx.textAlign='center';ctx.fillText(`${e.identity?.name||'JEFE'} · FASE ${ph+1}${pressure?` · PRESIÓN ${pressure===2?'II':'I'}`:''}`,G.w/2,y-6);
      ctx.fillStyle='rgba(0,0,0,.52)'; ctx.fillRect(x-2,y-2,w+4,24); ctx.fillStyle='#4a1913'; ctx.fillRect(x,y,w,12);
      const cols=['#ffb06f','#ff7b67','#ff536e']; ctx.fillStyle=cols[ph]; ctx.fillRect(x,y,w*(e.hp/e.maxHp),12);
      ctx.strokeStyle='#ffe6b4'; ctx.strokeRect(x,y,w,12);
      const fortressPct=e.fortressMax?clamp((e.fortressHp||0)/e.fortressMax,0,1):0;
      ctx.fillStyle='rgba(25,70,86,.72)';ctx.fillRect(x,y+15,w,5);ctx.fillStyle='#73e6ff';ctx.fillRect(x,y+15,w*fortressPct,5);
      ctx.globalAlpha=.6; ctx.strokeStyle='#fff'; for(const f of [C.combatDirector.bossPhase2Hp,C.combatDirector.bossPhase3Hp]){ const px=x+w*f; ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(px,y+12);ctx.stroke(); } ctx.globalAlpha=1;
      const modulesAlive=(e.armorNodes||[]).filter(n=>n.alive).length, modulesTotal=(e.armorNodes||[]).length;
      const hardAlive=(e.hardpoints||[]).filter(p=>p.alive).length, hardTotal=(e.hardpoints||[]).length;
      if((e.fortressHp||0)>0){ ctx.fillStyle='#8fefff'; ctx.font='800 9px Inter,Arial'; ctx.textAlign='center'; ctx.fillText(`FORTALEZA${modulesTotal?` · MÓDULOS ${modulesAlive}/${modulesTotal}`:''}${hardTotal?` · SISTEMAS ${hardAlive}/${hardTotal}`:''}`,G.w/2,y+31); } else if(performance.now()<(e.coreOpenUntil||0)){ ctx.fillStyle='#fff0a6'; ctx.font='800 10px Inter,Arial'; ctx.textAlign='center'; ctx.fillText(`NÚCLEO ABIERTO · DAÑO x${C.bossCore.damageMultiplier.toFixed(1)}${hardTotal?` · SISTEMAS ${hardAlive}/${hardTotal}`:''}`,G.w/2,y+31); }
      if(e.huntPending&&performance.now()<(e.huntWindupUntil||0)){ ctx.fillStyle='#ffcf86'; ctx.font='900 10px Inter,Arial'; ctx.textAlign='center'; ctx.fillText(`DOCTRINA DE CAZA · ${e.huntPatternReason||'ADAPTACIÓN'}`,G.w/2,y+(performance.now()<(e.coreOpenUntil||0)?46:42)); }
      else if(performance.now()<(e.signatureUntil||0)){ ctx.fillStyle=e.signatureColor||e.identity?.accent||'#fff0a6'; ctx.font='900 10px Inter,Arial'; ctx.textAlign='center'; ctx.fillText('✦ '+(e.signatureLabel||e.identity?.signature||'ATAQUE ESPECIAL')+' ✦',G.w/2,y+(performance.now()<(e.coreOpenUntil||0)?46:42)); }
      else if(performance.now()<(e.recoveryUntil||0)){ ctx.fillStyle='#b8ffca'; ctx.font='900 10px Inter,Arial'; ctx.textAlign='center'; ctx.fillText('VENTANA DE CONTRAATAQUE',G.w/2,y+(performance.now()<(e.coreOpenUntil||0)?46:42)); }
      if(C.reactiveMatrix?.enabled&&C.reactiveMatrix.showHud){
        const rm=M()?.status?.(); if(rm?.active){ const cols={M0:'#8fffb0',M1:'#9deaff',M2:'#ffe27a',M3:'#ff9a78'}; ctx.fillStyle=cols[rm.state]||'#9deaff'; ctx.font='800 9px Inter,Arial'; ctx.textAlign='center'; const ttk=Number.isFinite(rm.estimatedTtk)?Math.round(rm.estimatedTtk):0; const dps=Number.isFinite(rm.dps)?rm.dps.toFixed(1):'0.0'; const compact=G.layout?.portrait&&G.w<=520; const mode=rm.mode==='assist'?'ACTIVE':'SHADOW'; const mit=rm.matrixMitigationApplied?` · ARM ${Math.round((1-rm.matrixMitigationApplied)*100)}%`:''; ctx.fillText(compact?`MATRIX ${mode} · ${rm.state} ${rm.label} · TTK ${ttk}s${mit}`:`REACTIVE MATRIX · ${mode} · ${rm.state} ${rm.label} · DPS ${dps} · TTK ${ttk}s${mit}`,G.w/2,y+58); }
      }
    } }
  }

  function renderObstacles(ctx){
    const fog=currentSectorCfg()?.fog||'#ffb46e';
    G.obstacles.forEach((o,idx)=>{
      if(o.motion!=='static'){
        const dir=Math.sign(o.vx||1);
        ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle=fog;ctx.lineWidth=Math.max(2,o.r*.12);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(o.x-dir*o.r*.6,o.y);ctx.lineTo(o.x-dir*o.r*1.7,o.y-(o.vy||0)*.8);ctx.stroke();ctx.restore();
      }
      ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.angle);
      const img=NS.assets?.getObstacle(o.assetIndex ?? idx);
      if(img){
        const size=o.r*(o.sizeClass==='large'?2.38:2.30); const iw=size, ih=size*(img.height/img.width);
        ctx.shadowColor=fog;ctx.shadowBlur=o.motion==='static'?5:8;ctx.drawImage(img,-iw/2,-ih/2,iw,ih);ctx.shadowBlur=0;
        ctx.globalCompositeOperation='screen';ctx.globalAlpha=.045;ctx.fillStyle=fog;ctx.beginPath();ctx.arc(0,0,o.r*.92,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      } else {
        const lg=ctx.createRadialGradient(-o.r*.2,-o.r*.2,3,0,0,o.r);lg.addColorStop(0,'#858f98');lg.addColorStop(.62,'#444b52');lg.addColorStop(1,'#20262c');ctx.fillStyle=lg;ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
      const bw=o.r*1.75, bx=o.x-bw/2, by=o.y+o.r+6;
      ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(bx,by,bw,4);ctx.fillStyle='#ffb46e';ctx.fillRect(bx,by,bw*(o.hp/o.maxHp),4);
    });
  }

  function renderRewardPods(ctx){
    G.rewardPods.forEach(p=>{ if(p.open) return; ctx.save(); ctx.translate(p.x,p.y); ctx.globalAlpha=.24; ctx.strokeStyle=C.powers[p.kind].color; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,p.w*.72,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1; drawPowerIcon(ctx,p.kind,C.powers[p.kind].color, (p.w/22)*(1 + Math.sin(p.bob)*0.06), true); ctx.restore(); });
  }

  function renderGemDrops(ctx,now){
    for(const g of G.gemDrops){ const p=1+Math.sin(now/150+g.phase)*.08;ctx.save();ctx.translate(g.x,g.y);ctx.rotate(now*.0018+g.phase);ctx.scale(p,p);ctx.shadowColor='#72ffe1';ctx.shadowBlur=12;ctx.fillStyle='#8affdc';ctx.beginPath();ctx.moveTo(0,-g.size);ctx.lineTo(g.size*.72,0);ctx.lineTo(0,g.size);ctx.lineTo(-g.size*.72,0);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1;ctx.stroke();ctx.restore(); }
  }
  function powerAssetKey(kind){ return ({spread:'burst',shield:'shield',missile:'missile',drone:'drone',emp:'emp',magnet:'magnet',heal:'repair',chain:'laser',overdrive:'multiplier',life:'overshield'}[kind]||kind); }
  function renderPowerDrops(ctx, now){
    G.powerDrops.forEach(p=>{ const pulse=1 + Math.sin(now/170 + p.phase)*0.08; const col=C.powers[p.kind]?.color||'#fff';ctx.save();ctx.translate(p.x,p.y);const img=NS.assets?.getWorldPowerup?.(G.sector,powerAssetKey(p.kind));ctx.shadowColor=col;ctx.shadowBlur=12;
      const priority=['life','magnet','drone'].includes(p.kind)||p.source==='bossSupply'||p.source==='matrixSupport';
      if(priority){ ctx.globalAlpha=.42+.16*Math.sin(now/105+p.phase);ctx.strokeStyle=p.kind==='life'?'#ff7588':p.kind==='magnet'?'#ffe66a':'#7fffd4';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,p.w*(.72+.08*Math.sin(now/130)),0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1; }
      if(img){ const sz=p.w*1.18*pulse;ctx.drawImage(img,-sz/2,-sz/2,sz,sz); }
      else drawPowerIcon(ctx,p.kind,col,(p.w/19)*pulse,false);
      ctx.shadowBlur=0;ctx.restore(); });
  }

  function drawPowerIcon(ctx, kind, color, scale=1, frameBox=false){
    ctx.scale(scale,scale); if(frameBox){ ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1.5; ctx.strokeRect(-12,-12,24,24); }
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.18; ctx.fillStyle=color; ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.fillStyle='rgba(0,0,0,.30)'; ctx.beginPath(); ctx.roundRect?.(-11,-11,22,22,6); if(ctx.roundRect) ctx.fill();
    ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=2.2;
    switch(kind){
      case 'shield': ctx.beginPath(); ctx.arc(0,0,7.5,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,3.5,0,Math.PI*2); ctx.fill(); break;
      case 'spread': for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.moveTo(i*5,7); ctx.lineTo(i*6,-5); ctx.lineTo(i*2,-1); ctx.closePath(); ctx.fill(); } break;
      case 'chain': ctx.beginPath(); ctx.moveTo(-7,-6); ctx.lineTo(-1,0); ctx.lineTo(-5,0); ctx.lineTo(0,7); ctx.lineTo(1,1); ctx.lineTo(6,1); ctx.lineTo(3,-6); ctx.stroke(); break;
      case 'emp': ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4); ctx.lineTo(Math.cos(a)*10,Math.sin(a)*10);} ctx.stroke(); break;
      case 'missile': ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(6,1); ctx.lineTo(2,0); ctx.lineTo(2,8); ctx.lineTo(-2,8); ctx.lineTo(-2,0); ctx.lineTo(-6,1); ctx.closePath(); ctx.fill(); break;
      case 'heal': case 'life': ctx.fillRect(-2,-8,4,16); ctx.fillRect(-8,-2,16,4); break;
      case 'overdrive': ctx.beginPath(); ctx.moveTo(-7,6); ctx.lineTo(0,-8); ctx.lineTo(7,6); ctx.lineTo(0,1); ctx.closePath(); ctx.fill(); break;
      case 'drone': ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(8,4);ctx.lineTo(3,3);ctx.lineTo(0,7);ctx.lineTo(-3,3);ctx.lineTo(-8,4);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,2,0,Math.PI*2);ctx.fill();break;
      case 'magnet': ctx.beginPath();ctx.arc(0,0,8,Math.PI*.15,Math.PI*.85,true);ctx.stroke();ctx.fillRect(-8,-7,4,5);ctx.fillRect(4,-7,4,5);break;
      default: ctx.fillRect(-5,-5,10,10);
    }
  }

  function renderAttachedRelics(ctx,now){
    if(!G.attachedRelics.length) return;
    for(const r of G.attachedRelics){
      const life=Math.max(0,(r.until-now)/C.weaponEvolution.attachCelebrationMs), progress=1-life;
      const radius=(G.layout?.playerH||64)*(.82-.48*progress);
      const a=(r.angle||0)+now*.0045;
      const x=G.px+Math.cos(a)*radius, y=G.py+Math.sin(a)*radius*.55;
      const col=C.powers[r.kind]?.color||'#fff';
      ctx.save();ctx.globalAlpha=.18+.7*life;ctx.strokeStyle=col;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(G.px,G.py);ctx.lineTo(x,y);ctx.stroke();ctx.globalAlpha=.75+.25*Math.sin(now/90);ctx.translate(x,y);drawPowerIcon(ctx,r.kind,col,.72,false);ctx.restore();
    }
    ctx.globalAlpha=1;
  }

  function renderBossRewards(ctx,now){
    for(const r of G.bossRewards){
      const col=C.powers[r.kind]?.color||'#fff';
      for(let i=0;i<r.trail.length;i++){ const q=r.trail[i]; ctx.globalAlpha=Math.max(0,q.life/280)*(i/r.trail.length)*.55; ctx.fillStyle=col; ctx.beginPath(); ctx.arc(q.x,q.y,2+i*.14,0,Math.PI*2); ctx.fill(); }
      ctx.globalAlpha=1; ctx.save(); ctx.translate(r.x,r.y); ctx.rotate(now/250); ctx.shadowColor=col; ctx.shadowBlur=18;
      const wb=NS.assets?.getWorldBoss?.(r.familyWorld||G.sector);
      if(wb?.relicSheet){ const frames=wb.relicFrames||3, frame=(r.relicIndex||0)%frames, fw=wb.relicSheet.width/frames, fh=wb.relicSheet.height, sz=28+Math.sin(now/90)*2; ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.72;ctx.drawImage(wb.relicSheet,frame*fw,0,fw,fh,-sz/2,-sz/2,sz,sz);ctx.restore(); }
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,10+Math.sin(now/90)*2,0,Math.PI*2); ctx.stroke(); ctx.rotate(-now/130); ctx.fillStyle=col; ctx.beginPath(); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2, rr=i%2?5:9; const x=Math.cos(a)*rr,y=Math.sin(a)*rr; i?ctx.lineTo(x,y):ctx.moveTo(x,y);} ctx.closePath();ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha=1;
  }

  function projectileAssetIndex(type){
    return ({orb:0,plasma:1,lance:2,ring:3,scythe:4,petal:4,seeker:4,bolt:1}[type] ?? 0);
  }
  function renderWorldProjectile(ctx,b,now){
    const wp=NS.assets?.getWorldProjectile?.(G.sector,projectileAssetIndex(b.type));
    if(!wp?.sheet) return;
    const frame=familyFrame(wp.sheet,wp.frames,now,(b.x+b.y)*.01,10);
    const size=Math.max(22,(b.r||4)*4.9);
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.max(.9,C.worldFamilies.projectileSpriteAlpha||.82);
    drawHorizontalSheet(ctx,wp.sheet,wp.frames,frame,0,0,size,size,1,Math.atan2(b.vy,b.vx)+Math.PI/2);
    ctx.restore();
  }
  function renderBullets(ctx, now){
    G.playerBullets.forEach(b=>{
      ctx.save(); ctx.translate(b.x+b.w/2,b.y+b.h/2); ctx.strokeStyle=b.color; ctx.lineWidth=b.isMissile?3.4:2.6; ctx.globalAlpha=.5; ctx.beginPath(); ctx.moveTo(0,b.h*.8); ctx.lineTo(-b.vx*.028,b.h*2.2); ctx.stroke(); ctx.globalAlpha=.18; ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(0,0,Math.max(3,b.w*.68),0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; ctx.fillStyle=b.color; ctx.beginPath(); ctx.ellipse(0,0,b.w*.54,b.h*.56,0,0,Math.PI*2); ctx.fill(); if(b.isMissile){ctx.fillStyle='#fff2bf';ctx.fillRect(-2,b.h*.35,4,6);} ctx.restore();
    });
    G.enemyBullets.forEach(b=>{
      ctx.save(); ctx.translate(b.x,b.y);
      const threat=b.r||4; ctx.globalAlpha=.10; ctx.strokeStyle=b.color; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(0,0,threat*3.2 + Math.sin(now/90)*1.2,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
      renderWorldProjectile(ctx,b,now);
      if(b.type==='ring'){ ctx.globalAlpha=.78; ctx.strokeStyle=b.color; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,b.r*(1.2+Math.sin(now/80)*.18),0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=.22; ctx.beginPath(); ctx.arc(0,0,b.r*2.1,0,Math.PI*2); ctx.stroke(); ctx.restore(); return; }
      if(b.type==='scythe'){ ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2); ctx.strokeStyle=b.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,2,b.r*2.1,Math.PI*.12,Math.PI*.88);ctx.stroke(); ctx.restore(); return; }
      if(b.type==='petal'){ ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2); ctx.fillStyle=b.color; ctx.beginPath(); ctx.moveTo(0,-b.r*2);ctx.quadraticCurveTo(b.r*1.2,0,0,b.r*2);ctx.quadraticCurveTo(-b.r*1.2,0,0,-b.r*2);ctx.fill(); ctx.restore(); return; }
      if(b.type==='seeker'){ const ang=Math.atan2(b.vy,b.vx)+Math.PI/2; ctx.rotate(ang); ctx.fillStyle=b.color; ctx.beginPath();ctx.moveTo(0,-b.r*2);ctx.lineTo(b.r,b.r*1.5);ctx.lineTo(0,b.r*.6);ctx.lineTo(-b.r,b.r*1.5);ctx.closePath();ctx.fill();ctx.restore();return; }
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

  function togglePause(){
    if(!G.running || G.gameOver || G.lifeLost) return;
    if(!G.paused){ G.paused=true; G.pauseStartedAt=performance.now(); A().pauseAll?.(true); A().ui?.('pause'); }
    else { const now=performance.now(); shiftGameClocks(now-(G.pauseStartedAt||now)); G.pauseStartedAt=0; G.paused=false; G.autoPaused=false; G.lastTs=now; A().pauseAll?.(false); A().ui?.('resume'); }
    UI().renderPause(G);
  }
  function exitToMenu(){ if(G.phase==='boss'){ const boss=G.enemies.find(e=>e.alive&&e.role==='boss'); M()?.finalize?.('aborted',{bossHp:boss?.hp||0,defenseHp:matrixBossDefenseHp(boss),hpRatio:G.maxHp?G.hp/G.maxHp:0,mobilityIndex:(G.ship?.speed||430)/430,hasUsefulSecondary:false,combo:G.combo,damageReceivedRatio:G.maxHp?G.waveDamageTaken/G.maxHp:0},performance.now()); } G.running=false; G.mode='menu'; G.paused=false; G.pauseStartedAt=0; G.gameOver=false; G.lifeLost=false; A().stopAll?.(); UI().showHud(false); UI().renderPause(G); UI().renderGameOver(G,false); UI().showScreen('splash'); NS.main.refreshPanels(); }

  function recoverLoopError(err,ts){
    G.lastError=String(err?.message||err||'Error desconocido'); G.recoveryCount=(G.recoveryCount||0)+1;
    console.error('STARFALL runtime recovery',err);
    // Un error durante la muerte/recompensa del jefe jamás debe detener la campaña.
    if(G.rewardPending || G.phase==='reward'){
      try{ forceCompleteBossRewards(ts,'runtime'); }catch(rewardErr){ console.error('Reward recovery failed',rewardErr); G.rewardPending=false; G.phase='sectorTransition'; G.rewardTransitionAt=ts+250; }
    } else {
      // Recuperación conservadora: elimina proyectiles corruptos sin borrar progreso ni enemigos.
      G.playerBullets=G.playerBullets.filter(Boolean).slice(-80);
      G.enemyBullets=G.enemyBullets.filter(Boolean).slice(-Math.max(40,G.layout?.enemyBulletCap||90));
      G.particles=G.particles.filter(Boolean).slice(-220);
    }
    if(G.recoveryCount<=3) UI().flashMsg('RECUPERANDO SISTEMA',C.transitionSafety.loopRecoveryMessageMs);
  }

  function loop(ts){
    const dt = Math.min(34, Math.max(0,ts-(G.lastTs||ts))); G.lastTs=ts;
    try{ update(dt,ts); render(ts); }
    catch(err){ recoverLoopError(err,ts); try{ render(ts); }catch(renderErr){ console.error('Render recovery failed',renderErr); } }
    finally{ requestAnimationFrame(loop); }
  }

  NS.game = { init, resize, startNew, continueFromSave, loop, togglePause, exitToMenu, restartCheckpoint, state:G, currentPowerText, saveProgress, useInventoryPower, applyStoreUpgrade, activateBossAlly, _debug:{forceCompleteBossRewards,finishBossRewardTransition,combatPatternSnapshot,coordinateFormationStrike,updateBossHunterDoctrine} };
})(window.SF);
