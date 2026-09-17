const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
let now=0; const noop=()=>{}; const grad={addColorStop:noop};
const ctx=new Proxy({createLinearGradient:()=>({...grad}),createRadialGradient:()=>({...grad}),measureText:t=>({width:String(t).length*7}),setTransform:noop,clearRect:noop,fillRect:noop,strokeRect:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,ellipse:noop,fill:noop,stroke:noop,save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,setLineDash:noop,drawImage:noop,roundRect:noop,fillText:noop},{get:(o,k)=>k in o?o[k]:0,set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:0,height:0,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop};
const sandbox={console,Math,Date,performance:{now:()=>now},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,innerWidth:390,innerHeight:844,devicePixelRatio:2,window:null,document:{hidden:false,addEventListener:noop}};
sandbox.window=sandbox; sandbox.window.SF={}; sandbox.addEventListener=noop; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox,{filename:'config.js'});
const SF=sandbox.window.SF,C=SF.config, nopProxy=new Proxy({}, {get:()=>noop});
SF.ui={...nopProxy,showHud:noop,hideScreens:noop,renderGameOver:noop,flashMsg:noop,renderPause:noop,renderHud:noop};
SF.storage={saveGame:noop,loadRanking:()=>[],saveRanking:noop,loadGame:()=>null,clearGame:noop}; SF.audio=nopProxy; SF.assets={getBackground:()=>null,getShip:()=>null,getEnemy:()=>null,getObstacle:()=>null};
vm.runInContext(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),sandbox,{filename:'game.js'}); SF.game.init(canvas); SF.game.startNew('TEST','vanguard');
const G=SF.game.state, D=SF.game._debug; const ok=(v,m)=>{if(!v)throw new Error(m)};
ok(C.VERSION==='0.7.6','wrong version'); ok(C.encounterEvolution.hunterDoctrine.enabled,'hunter doctrine disabled'); ok(C.encounterEvolution.formationCoordination.enabled,'formation coordination disabled'); ok(C.encounterEvolution.escortDoctrine.enabled,'escort doctrine disabled');
// Simula camping lateral y comprueba que la lectura se basa en historial, no en un frame aislado.
G.px=G.w*.16; for(let i=0;i<11;i++){ now+=310; D.combatPatternSnapshot(now); }
const snap=D.combatPatternSnapshot(now+310); ok(snap.ready&&snap.camped&&snap.side===-1,'left-side camping not detected');
// Arma una respuesta de boss; el objetivo debe quedar bloqueado durante el telegraph.
const boss={alive:true,identity:{id:'lancer',name:'TEST'},x:95,y:70,w:150,h:110,huntNextAt:0,huntPending:false,huntWindupUntil:0,huntSerial:0,signaturePending:false,recoveryUntil:0,coreOpenUntil:0,bossSurgeUntil:0,nextSignatureAt:0,nextShot:0};
D.updateBossHunterDoctrine(boss,1,now+400); ok(boss.huntPending,'boss counter-pattern did not arm'); const locked=boss.huntTargetX; ok(locked<G.w*.4,'counter-pattern did not lock camper lane');
G.px=G.w*.84; D.updateBossHunterDoctrine(boss,1,now+650); ok(boss.huntTargetX===locked,'telegraph target unfairly followed player after lock');
now=boss.huntWindupUntil+1; const bulletsBefore=G.enemyBullets.length; D.updateBossHunterDoctrine(boss,1,now); ok(!boss.huntPending,'counter-pattern did not resolve'); ok(G.enemyBullets.length>bulletsBefore,'counter-pattern emitted no threat');
// Coordinated formation fire should arm multiple front shooters with locked targets.
G.wave=2; G.phase='wave'; G.subphase=0; G.engageAfter=0; G.formation.coordinationNextAt=0; G.formation.desperationTriggered=false; D.coordinateFormationStrike(now+1000);
const armed=G.enemies.filter(e=>e.alive&&e.role==='formation'&&e.coordinatedShotUntil); ok(armed.length>=2,'formation coordination did not arm multiple shooters'); ok(armed.every(e=>Number.isFinite(e.chargeTargetX)&&e.chargeUntil===e.coordinatedShotUntil),'coordinated telegraph targets not locked');
console.log('HUNTER DOCTRINE v0.7.6 PASS',{campSide:snap.side,lockedTarget:Math.round(locked),counterBullets:G.enemyBullets.length,coordinatedShooters:armed.length});
