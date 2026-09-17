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
ok(C.VERSION==='0.7.6','wrong version'); ok(C.encounterEvolution.phaseConsequences.enabled,'phase consequences disabled'); ok(C.encounterEvolution.supportSynergy.enabled,'support synergy disabled');
const hp=(id,alive)=>({id,alive,hp:alive?10:0,maxHp:10});
// Weapon scars: frozen target and auxiliary doctrine instead of restoring magically lost weapons.
G.phase='boss'; G.px=G.w*.22; G.py=G.h*.76; G.enemies=[];
const aux={alive:true,role:'boss',identity:{id:'lancer',name:'TEST'},x:90,y:70,w:160,h:110,hp:520,maxHp:1000,hardpoints:[hp('left_weapon',false),hp('right_weapon',false),hp('regulator',true),hp('drive',true)],scarResponsePhase:-1,nextSignatureAt:0,nextShot:0,coreOpenUntil:0,recoveryUntil:0};
ok(D.bossScarResponseKind(aux)==='AUXILIARY_HUNT','weapon scar doctrine wrong'); now=1000; ok(D.armBossScarResponse(aux,1,now),'aux scar failed to arm'); const locked=aux.scarResponseTargetX; G.px=G.w*.84; now=aux.scarResponseWindupUntil+1; G.enemies=[aux]; D.updateBossScarResponse(aux,1,now); ok(!aux.scarResponsePending,'aux scar did not resolve'); ok(aux.scarResponseTargetX===locked,'scar target unfairly retargeted'); ok(G.enemies.some(e=>e.role==='escort'),'auxiliary doctrine spawned no escort');
// Drive scar: a telegraphed area-control response emits a bounded pattern.
const drive={alive:true,role:'boss',identity:{id:'gravity'},x:90,y:70,w:160,h:110,hp:500,maxHp:1000,hardpoints:[hp('left_weapon',true),hp('right_weapon',true),hp('regulator',true),hp('drive',false)],scarResponsePhase:-1,nextSignatureAt:0,nextShot:0,coreOpenUntil:0,recoveryUntil:0};
ok(D.bossScarResponseKind(drive)==='ANCHOR_FIELD','drive scar doctrine wrong'); now+=100; D.armBossScarResponse(drive,1,now); const bb=G.enemyBullets.length; now=drive.scarResponseWindupUntil+1; D.updateBossScarResponse(drive,1,now); ok(G.enemyBullets.length>=bb+4,'anchor field emitted insufficient pattern');
// Regulator scar: fortress loss is compensated only by a readable, one-shot reactor flare.
const reg={alive:true,role:'boss',identity:{id:'nova'},x:90,y:70,w:160,h:110,hp:500,maxHp:1000,hardpoints:[hp('left_weapon',true),hp('right_weapon',true),hp('regulator',false),hp('drive',true)],scarResponsePhase:-1,nextSignatureAt:0,nextShot:0,coreOpenUntil:0,recoveryUntil:0};
ok(D.bossScarResponseKind(reg)==='REACTOR_FLARE','regulator scar doctrine wrong'); now+=100; D.armBossScarResponse(reg,2,now); const br=G.enemyBullets.length; now=reg.scarResponseWindupUntil+1; D.updateBossScarResponse(reg,2,now); ok(G.enemyBullets.length>=br+7,'reactor flare emitted insufficient pattern');
// Full disarticulation rewards precision instead of spawning a hidden compensation.
const crit={alive:true,role:'boss',identity:{id:'phoenix'},x:90,y:70,w:160,h:110,hp:260,maxHp:1000,hardpoints:[hp('left_weapon',false),hp('right_weapon',false),hp('regulator',false),hp('drive',false)],scarResponsePhase:-1,nextSignatureAt:0,nextShot:0,coreOpenUntil:0,recoveryUntil:0};
ok(D.bossScarResponseKind(crit)==='CRITICAL_COLLAPSE','critical scar doctrine wrong'); now+=100; const score0=G.score; D.armBossScarResponse(crit,2,now); now=crit.scarResponseWindupUntil+1; D.updateBossScarResponse(crit,2,now); ok(crit.coreOpenUntil>now&&crit.recoveryUntil>now,'critical collapse gave no real opening'); ok(G.score>score0,'critical collapse gave no score reward');
// Support synergy: nearby nodes materially alter revive/breeder output and remain spatially bounded.
G.phase='wave'; G.wave=3; const sentinel={alive:true,role:'formation',kind:'sentinel',x:90,y:120,w:30,h:30,shieldPool:2,shieldBrokenUntil:0};
const reanimator={alive:true,role:'formation',kind:'reanimator',x:125,y:125,w:30,h:30,revivesLeft:1,reviveAt:0};
const breeder={alive:true,role:'formation',kind:'breeder',x:155,y:125,w:30,h:30,breedAt:0};
G.enemies=[sentinel,reanimator,breeder]; G.enemyGraveyard=[{kind:'raider',row:0,col:0,ox:0,oy:0,w:30,h:24,renderH:36,maxHp:10,score:20,color:'#fff'}];
now+=100; ok(D.findSupportPartner(reanimator,['sentinel'],now)===sentinel,'support link not found'); D.spawnRevivedEnemy(reanimator,now); const revived=G.enemies.find(e=>e.role==='reviving'); ok(revived&&revived.hp>=8,'sentinel-linked revive was not reinforced');
D.spawnBreederDrone(breeder,now); const drone=G.enemies.find(e=>e.role==='breedDrone'); ok(drone&&drone.hp>=2,'sentinel-linked breeder drone was not armored'); ok(breeder.breedAt-now<C.enemyEcology.breederIntervalMs,'reanimator-linked breeder did not accelerate');
console.log('PHASE CONSEQUENCE v0.7.6 PASS',{lockedTarget:Math.round(locked),anchorBullets:G.enemyBullets.length-bb,criticalOpen:Math.round(crit.coreOpenUntil-now),revivedHp:revived.hp,droneHp:drone.hp});
