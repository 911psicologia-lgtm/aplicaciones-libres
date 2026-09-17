const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
let now=0; const noop=()=>{}; const grad={addColorStop:noop};
const ctx=new Proxy({createLinearGradient:()=>({...grad}),createRadialGradient:()=>({...grad}),measureText:t=>({width:String(t).length*7}),setTransform:noop,clearRect:noop,fillRect:noop,strokeRect:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,ellipse:noop,fill:noop,stroke:noop,save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,setLineDash:noop,drawImage:noop,roundRect:noop,fillText:noop},{get:(o,k)=>k in o?o[k]:0,set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:0,height:0,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop};
const sandbox={console,Math,Date,performance:{now:()=>now},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,innerWidth:390,innerHeight:844,devicePixelRatio:2,window:null,document:{hidden:false,addEventListener:noop}};
sandbox.window=sandbox; sandbox.window.SF={}; sandbox.addEventListener=noop; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox,{filename:'config.js'});
const SF=sandbox.window.SF,C=SF.config,nopProxy=new Proxy({}, {get:()=>noop});
SF.ui={...nopProxy,showHud:noop,hideScreens:noop,renderGameOver:noop,flashMsg:noop,renderPause:noop,renderHud:noop};
SF.storage={saveGame:noop,loadRanking:()=>[],saveRanking:noop,loadGame:()=>null,clearGame:noop}; SF.audio=nopProxy; SF.assets={getBackground:()=>null,getShip:()=>null,getEnemy:()=>null,getObstacle:()=>null};
vm.runInContext(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),sandbox,{filename:'game.js'}); SF.game.init(canvas); SF.game.startNew('TEST','vanguard');
const G=SF.game.state,D=SF.game._debug,ok=(v,m)=>{if(!v)throw new Error(m)};
ok(C.VERSION==='0.7.6','wrong version'); ok(C.encounterEvolution.bossDoctrine.enabled,'boss doctrine disabled'); ok(C.encounterEvolution.subbossFatigue.enabled,'subboss fatigue disabled');
const hp=(id,alive=true)=>({id,alive,hp:alive?10:0,maxHp:10});
const baseBoss=id=>({alive:true,role:'boss',identity:{id,name:id.toUpperCase()},x:90,y:68,w:160,h:112,hp:520,maxHp:1000,hardpoints:[hp('left_weapon'),hp('right_weapon'),hp('regulator'),hp('drive')],intentNextAt:0,intentPending:false,intentActiveUntil:0,intentBreakWindowUntil:0,intentSerial:0,recoveryUntil:0,coreOpenUntil:0,bossSurgeUntil:0,signaturePending:false,huntPending:false,echoPending:false,scarResponsePending:false,nextSignatureAt:0,huntNextAt:0,nextShot:0,fortressPulseAt:0,summonAt:0,nextEscortRefillAt:0,majorThreatCooldownUntil:0,commandDisruptedUntil:0,intentBreakPhase:-1,intentBreakStreak:0,lastIntentType:''});
// Persistent identity: profiles and intent priorities must differ.
const lancer=baseBoss('lancer'), gravity=baseBoss('gravity'); G.enemies=[lancer]; now=1000;
ok(D.bossDoctrineProfile(lancer).label==='DUELO AXIAL','lancer doctrine missing'); ok(D.bossDoctrineProfile(gravity).label==='CERCO GRAVÍTICO','gravity doctrine missing');
ok(D.bossIntentType(lancer,1,now)==='PURSUIT','lancer did not prefer pursuit'); ok(D.bossIntentType(gravity,1,now)==='CONTROL','gravity did not prefer control');
ok(D.bossDoctrineMoveMul(lancer,2)>D.bossDoctrineMoveMul(gravity,2),'doctrine movement identity not differentiated');
// Major-threat pacing must create a real quiet window.
D.setBossMajorThreatCooldown(lancer,1,now); ok(!D.bossMajorThreatReady(lancer,now+100),'major threat reopened too early'); ok(D.bossMajorThreatReady(lancer,lancer.majorThreatCooldownUntil+1),'major threat never reopened');
// Two successful intent breaks in one phase disrupt command and suppress routine escorts.
now=lancer.majorThreatCooldownUntil+100; lancer.intentActiveUntil=now+900; lancer.intentBreakWindowUntil=now+800; lancer.intentEscortQuota=1; lancer.intentBreakPhase=1; lancer.intentBreakStreak=0; G.enemies=[lancer];
ok(D.breakBossCombatIntent(lancer,'TEST I',now),'first intent break failed'); const disrupted0=lancer.commandDisruptedUntil||0;
now+=120; lancer.intentActiveUntil=now+900; lancer.intentBreakWindowUntil=now+800; lancer.intentEscortQuota=1;
ok(D.breakBossCombatIntent(lancer,'TEST II',now),'second intent break failed'); ok((lancer.commandDisruptedUntil||0)>now && (lancer.commandDisruptedUntil||0)>disrupted0,'command disruption not activated');
const escortsBefore=G.enemies.filter(e=>e.role==='escort').length; ok(D.spawnBossEscort(lancer,1,{forcedRole:'interceptor'})===0,'routine escort spawned during command disruption'); ok(G.enemies.filter(e=>e.role==='escort').length===escortsBefore,'command disruption leaked escort');
// Repeated subboss interrupts must create persistent fatigue and weaken shield recharge.
const sub={alive:true,role:'miniboss',identity:{name:'SUB'},x:90,y:90,w:120,h:90,hp:500,maxHp:1000,subShieldMax:500,subShieldHp:0,subRecoveryUntil:0,subExposeUntil:0,subSignatureNextAt:0,subRecoverySerial:0,subInterruptedRecoverySerial:-1,subInterruptPressure:0,subInterruptCount:0,subFatigued:false};
for(let i=0;i<2;i++){ now+=1000; D.scheduleSubbossRecovery(sub,1,now); ok(D.noteSubbossRecoveryDamage(sub,50,now+80),'subboss interrupt failed '+i); }
ok(sub.subFatigued,'subboss did not become fatigued'); sub.subShieldHp=0; D.rechargeSubbossShield(sub,.35,'TEST'); ok(sub.subShieldHp<350,'fatigue did not reduce shield recharge');
console.log('COMBAT DOCTRINE v0.7.6 PASS',{lancer:D.bossDoctrineProfile(lancer).label,gravity:D.bossDoctrineProfile(gravity).label,commandDisruptMs:Math.round(lancer.commandDisruptedUntil-now),fatiguedShield:Math.round(sub.subShieldHp)});
