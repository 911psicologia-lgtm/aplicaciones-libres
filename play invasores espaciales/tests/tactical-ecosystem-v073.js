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
ok(C.VERSION==='0.7.5','wrong version');
ok(C.encounterEvolution.adaptiveMemory.enabled,'adaptive memory disabled');
ok(C.encounterEvolution.systemBreak.enabled,'system break disabled');
ok(C.encounterEvolution.supportNetwork.enabled,'support network disabled');
// Adaptive echo: target is frozen before the player moves and resolves as a separate threat.
G.phase='boss'; G.waveDamageTaken=0; G.px=G.w*.22; G.py=G.h*.76;
const boss={alive:true,role:'boss',identity:{id:'lancer',name:'TEST',accent:'#fff'},x:90,y:70,w:160,h:110,hp:500,maxHp:1000,adaptiveEchoArmed:true,signatureTargetX:G.px,signatureTargetY:G.py,nextShot:0,nextSignatureAt:0,recoveryUntil:0,coreOpenUntil:now+3000,fortressHp:80};
ok(D.armBossAdaptiveEcho(boss,1,1000),'adaptive echo failed to arm'); const locked=boss.echoTargetX; ok(boss.echoPending&&locked!==G.px,'echo target was not offset/frozen');
G.px=G.w*.82; now=boss.echoWindupUntil+1; const bulletsBefore=G.enemyBullets.length; D.updateBossAdaptiveEcho(boss,1,now); ok(!boss.echoPending,'adaptive echo failed to resolve'); ok(G.enemyBullets.length>=bulletsBefore+3,'adaptive echo emitted insufficient threat'); ok(boss.echoTargetX===locked,'adaptive echo unfairly retargeted');
// System break: concentrated core damage creates one phase-specific stagger and extends the opening.
now+=100; boss.hp=500; boss.maxHp=1000; boss.coreOpenUntil=now+250; boss.breakPhase=-1; boss.breakPressure=0; boss.fortressHp=120; boss.recoveryUntil=0;
const beforeCore=boss.coreOpenUntil; D.noteBossSystemBreak(boss,50,now); ok(boss.breakPhase===1,'system break phase not recorded'); ok(boss.coreOpenUntil>beforeCore,'system break did not extend core window'); ok(boss.recoveryUntil>now,'system break did not stagger boss');
// Support-network collapse: killing a support node delays and de-coordinates nearby formation units.
G.wave=3; G.phase='wave'; const support={alive:true,role:'formation',kind:'sentinel',x:100,y:100,w:30,h:30};
const a={alive:true,role:'formation',kind:'gunner',x:125,y:105,w:30,h:30,nextShot:now,coordinatedShotUntil:now+500,chargeUntil:now+500,chargeStart:now,coordinatedStyle:'crossfire'};
const b={alive:true,role:'formation',kind:'striker',x:150,y:115,w:30,h:30,nextShot:now};
const far={alive:true,role:'formation',kind:'raider',x:350,y:700,w:30,h:30,nextShot:now}; G.enemies=[support,a,b,far];
const affected=D.triggerSupportNetworkCollapse(support,now); ok(affected===2,'support collapse affected wrong local count'); ok(a.supportDisruptedUntil>now&&b.supportDisruptedUntil>now,'nearby units were not disrupted'); ok(!a.coordinatedShotUntil&&!a.chargeUntil,'coordinated shot survived support collapse'); ok(!far.supportDisruptedUntil,'far unit was incorrectly disrupted');
console.log('TACTICAL ECOSYSTEM v0.7.5 PASS',{echoTarget:Math.round(locked),echoBullets:G.enemyBullets.length,systemBreakPhase:boss.breakPhase,networkAffected:affected});
