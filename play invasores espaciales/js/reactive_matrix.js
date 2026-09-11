window.SF = window.SF || {};
(function(NS){
  const C=()=>NS.config?.reactiveMatrix||{};
  const S=()=>NS.storage;
  let encounter=null;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const round=(v,n=2)=>{ const p=Math.pow(10,n); return Math.round((Number(v)||0)*p)/p; };
  function nowMs(){ return (typeof performance!=='undefined'&&performance.now)?performance.now():Date.now(); }
  function targetWindow(sector){
    const cfg=C().targetWindows||{};
    if(sector<=1) return cfg.initial||[45,75];
    if(sector<=3) return cfg.intermediate||[55,90];
    if(sector<=5) return cfg.advanced||[70,110];
    return cfg.final||[90,130];
  }
  function expectedDps(sector){
    const cfg=C();
    const base=cfg.expectedDpsBase||8.4, growth=cfg.expectedDpsGrowth||.12;
    return base*(1+Math.max(0,sector-1)*growth);
  }
  function calcStaticPower(build,sector){
    build=build||{};
    const fire=Math.max(.045,Number(build.fireInterval)||.14);
    const baseDamage=Math.max(.1,Number(build.primaryDamage)||1);
    const projectileFactor=Math.max(1,Number(build.projectileFactor)||1);
    const secondaryFactor=Math.max(1,Number(build.secondaryFactor)||1);
    const theoreticalDps=(baseDamage/fire)*projectileFactor*secondaryFactor;
    const offense=theoreticalDps/Math.max(.1,expectedDps(sector));
    const hull=clamp((Number(build.maxHp)||10)/10,.7,1.75);
    const lives=clamp((Number(build.lives)||3)/3,.67,1.75);
    const shield=build.shieldActive?1.18:1;
    const mobility=clamp((Number(build.speed)||430)/430,.72,1.35);
    const survival=(hull*.38+lives*.26+shield*.18+mobility*.18);
    const skill=clamp(.82+(Number(build.combo)||0)*.012-(Number(build.recentDamageRatio)||0)*.22,.68,1.32);
    const powerIndex=offense*.68+survival*.18+skill*.14;
    return {theoreticalDps,offenseIndex:offense,survivalIndex:survival,skillIndex:skill,powerIndex};
  }
  function classify(ttk,powerIndex,sector,hasSample){
    const [low,high]=targetWindow(sector); const cfg=C();
    if((ttk>high*(cfg.supportTtkMul||1.22) && powerIndex<1.05) || powerIndex<(cfg.supportPowerIndex||.72)) return 'M0';
    if(hasSample && ttk<low*(cfg.dominanceTtkMul||.50)) return 'M3';
    if(ttk<low*(cfg.overdriveTtkMul||.82) || powerIndex>(cfg.overdrivePowerIndex||1.55)) return 'M2';
    return 'M1';
  }
  function supportRecommendation(meta){
    if((meta.hpRatio||1)<.42) return 'SUPPLY: REPAIR / SHIELD CELL';
    if((meta.mobilityIndex||1)<.84) return 'SUPPLY: THRUSTER / SPEED';
    if(!meta.hasUsefulSecondary) return 'SUPPLY: SECONDARY OFFENSE';
    return 'SUPPLY: DAMAGE / FIRE-RATE';
  }
  function responseFor(state,meta){
    if(state==='M0') return supportRecommendation(meta||{});
    if(state==='M2') return 'REACTIVE ARMOR 88% · EVADE · SIGNATURE PRIORITY';
    if(state==='M3') return 'ADAPTIVE SHIELD 78→70% · COUNTER-PATTERN · SHORT PHASE GATE · JAM TELEGRAPH · REBOOT ELIGIBLE';
    return 'NO ACTION';
  }
  function buildSummary(build){
    return {
      shipId:build.shipId||'',shipName:build.shipName||'',primaryDamage:round(build.primaryDamage,3),fireInterval:round(build.fireInterval,4),
      critChance:round(build.critChance||0,3),projectileFactor:round(build.projectileFactor||1,2),secondaryFactor:round(build.secondaryFactor||1,2),
      speed:round(build.speed||0,1),maxHp:round(build.maxHp||0,1),lives:build.lives||0,shieldActive:!!build.shieldActive,
      activePowers:{...(build.activePowers||{})},upgrades:{...(build.upgrades||{})},bossAugments:{...(build.bossAugments||{})},
      relicLevels:{...(build.relicLevels||{})},bossPowers:[...(build.bossPowers||[])],inventory:{...(build.inventory||{})},combo:build.combo||0
    };
  }
  function start(meta={},now=nowMs()){
    const build=buildSummary(meta.build||{}), staticPower=calcStaticPower({...meta.build},meta.sector||1), [targetLow,targetHigh]=targetWindow(meta.sector||1);
    encounter={
      schema:'reactive_matrix_shadow_v1', mode:'shadow', version:NS.config?.VERSION||'', id:`rm_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      startedAtPerf:now,startedAtIso:new Date().toISOString(),sector:meta.sector||1,bossName:meta.bossName||'BOSS',baseBossHp:round(meta.bossHp||0,2),
      targetWindowSec:[targetLow,targetHigh],build,staticPower:{...staticPower},samples:[],state:'M1',candidateState:'M1',candidateSince:now,lastTransitionAt:now,
      latest:{dps:staticPower.theoreticalDps,powerIndex:staticPower.powerIndex,estimatedTtk:(meta.bossHp||0)/Math.max(.1,staticPower.theoreticalDps),structuralTtk:null,response:'NO ACTION'},
      stateTransitions:[{t:0,state:'M1',reason:'SHADOW START'}],maxDps:0,minEstimatedTtk:null,maxPowerIndex:staticPower.powerIndex,
      suppliesOffered:[],suppliesUsed:[],damageReceived:0,nativeResurrection:false,matrixMitigationApplied:0,matrixJamActivated:false,matrixRebootActivated:false,
      recommendationsSeen:[],lastUpdateAt:0,outcome:'active'
    };
    if(C().debugConsole) console.info('[Reactive Matrix] SHADOW start',encounter);
    return status();
  }
  function noteDamage(amount,channel='hull',now=nowMs()){
    if(!encounter||amount<=0) return;
    encounter.samples.push({t:now,a:Number(amount)||0,c:channel});
    if(encounter.samples.length>240) encounter.samples.splice(0,encounter.samples.length-240);
  }
  function notePlayerDamage(amount){ if(encounter) encounter.damageReceived+=Math.max(0,Number(amount)||0); }
  function noteSupplyOffered(kind,source='bossSupply'){ if(encounter) encounter.suppliesOffered.push({t:round((nowMs()-encounter.startedAtPerf)/1000,2),kind,source}); }
  function noteSupplyUsed(kind,source='bossSupply'){ if(encounter) encounter.suppliesUsed.push({t:round((nowMs()-encounter.startedAtPerf)/1000,2),kind,source}); }
  function noteNativeResurrection(){ if(encounter) encounter.nativeResurrection=true; }
  function shift(delta){
    if(!encounter||!delta||delta<1) return;
    encounter.startedAtPerf+=delta; encounter.candidateSince+=delta; encounter.lastTransitionAt+=delta; encounter.lastUpdateAt+=delta;
    for(const s of encounter.samples) s.t+=delta;
  }
  function update(meta={},now=nowMs()){
    if(!encounter) return null;
    const cfg=C();
    if(encounter.lastUpdateAt && now-encounter.lastUpdateAt<(cfg.updateIntervalMs||350)) return status();
    const windowMs=cfg.dpsWindowMs||6000, elapsed=Math.max(1,now-encounter.startedAtPerf);
    encounter.samples=encounter.samples.filter(s=>now-s.t<=windowMs);
    const sampleDamage=encounter.samples.reduce((a,s)=>a+s.a,0);
    const oldest=encounter.samples.length?encounter.samples[0].t:now;
    const sampleSpan=Math.max(1,Math.min(windowMs,now-oldest));
    const recentDps=sampleDamage/(sampleSpan/1000);
    const hasSample=sampleSpan>=(cfg.minDpsSampleMs||1500)&&sampleDamage>0;
    const staticDps=encounter.staticPower.theoreticalDps;
    const effectiveDps=hasSample?Math.max(staticDps*.30,recentDps*.72+staticDps*.28):staticDps;
    const currentHp=Math.max(0,Number(meta.bossHp)||0), defenseHp=Math.max(0,Number(meta.defenseHp)||0);
    const estimatedTtk=currentHp/Math.max(.1,effectiveDps);
    const structuralTtk=(currentHp+defenseHp)/Math.max(.1,effectiveDps);
    const performanceIndex=clamp(.86+(Number(meta.combo)||0)*.010-(Number(meta.damageReceivedRatio)||0)*.18,.70,1.28);
    const livePower=encounter.staticPower.powerIndex*.90+performanceIndex*.10;
    const proposed=classify(estimatedTtk,livePower,encounter.sector,hasSample);
    if(proposed!==encounter.candidateState){ encounter.candidateState=proposed; encounter.candidateSince=now; }
    const stable=now-encounter.candidateSince>=(cfg.hysteresisMs||1800), cooled=now-encounter.lastTransitionAt>=(cfg.stateCooldownMs||3500);
    if(proposed!==encounter.state&&stable&&cooled){
      encounter.state=proposed; encounter.lastTransitionAt=now;
      const response=responseFor(proposed,meta);
      encounter.stateTransitions.push({t:round(elapsed/1000,2),state:proposed,ttk:round(estimatedTtk,2),dps:round(effectiveDps,2),response});
      if(!encounter.recommendationsSeen.includes(response)) encounter.recommendationsSeen.push(response);
      if(C().debugConsole) console.info('[Reactive Matrix] SHADOW state',proposed,{estimatedTtk,effectiveDps,response});
    }
    const response=responseFor(encounter.state,meta);
    encounter.latest={dps:effectiveDps,recentDps,powerIndex:livePower,estimatedTtk,structuralTtk,response,hasSample};
    encounter.maxDps=Math.max(encounter.maxDps,effectiveDps); encounter.maxPowerIndex=Math.max(encounter.maxPowerIndex,livePower);
    encounter.minEstimatedTtk=encounter.minEstimatedTtk==null?estimatedTtk:Math.min(encounter.minEstimatedTtk,estimatedTtk);
    encounter.lastUpdateAt=now;
    return status();
  }
  function status(){
    if(!encounter) return {active:false,mode:C().mode||'shadow',state:'M1',label:'NOMINAL'};
    const names={M0:'SUPPORT',M1:'NOMINAL',M2:'OVERDRIVE',M3:'DOMINANCE'};
    return {active:true,mode:'shadow',state:encounter.state,label:names[encounter.state]||encounter.state,dps:encounter.latest.dps||0,powerIndex:encounter.latest.powerIndex||0,estimatedTtk:encounter.latest.estimatedTtk||0,structuralTtk:encounter.latest.structuralTtk||0,response:encounter.latest.response||'NO ACTION'};
  }
  function finalize(outcome='victory',meta={},now=nowMs()){
    if(!encounter) return null;
    encounter.lastUpdateAt=0; update(meta,now);
    const out={...encounter};
    delete out.samples; delete out.startedAtPerf; delete out.candidateSince; delete out.lastUpdateAt; delete out.lastTransitionAt;
    out.outcome=outcome; out.victory=outcome==='victory'; out.endedAtIso=new Date().toISOString(); out.durationSec=round((now-encounter.startedAtPerf)/1000,2);
    out.realTtkSec=out.durationSec; out.maxDps=round(out.maxDps,2); out.minEstimatedTtk=round(out.minEstimatedTtk,2); out.maxPowerIndex=round(out.maxPowerIndex,3);
    out.damageReceived=round(out.damageReceived,2); out.finalState=encounter.state; out.finalDps=round(encounter.latest.dps,2); out.finalEstimatedTtk=round(encounter.latest.estimatedTtk,2);
    out.matrixMitigationApplied=0; out.matrixJamActivated=false; out.matrixRebootActivated=false;
    S()?.appendMatrixTelemetry?.(out,C().telemetryMaxEntries||60);
    if(C().debugConsole) console.info('[Reactive Matrix] SHADOW finalize',out);
    encounter=null; return out;
  }
  function exportTelemetry(){ return S()?.loadMatrixTelemetry?.()||[]; }
  function clearTelemetry(){ S()?.clearMatrixTelemetry?.(); }
  NS.reactiveMatrix={start,update,noteDamage,notePlayerDamage,noteSupplyOffered,noteSupplyUsed,noteNativeResurrection,shift,finalize,status,exportTelemetry,clearTelemetry,targetWindow,calcStaticPower};
})(window.SF);
