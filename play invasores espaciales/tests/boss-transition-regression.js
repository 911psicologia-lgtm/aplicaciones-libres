const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'); let now=0; const noop=()=>{}; const grad={addColorStop:noop};
const ctx=new Proxy({createLinearGradient:()=>({...grad}),createRadialGradient:()=>({...grad}),measureText:t=>({width:String(t).length*7}),setTransform:noop,clearRect:noop,fillRect:noop,strokeRect:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,ellipse:noop,fill:noop,stroke:noop,save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,setLineDash:noop,drawImage:noop,roundRect:noop,fillText:noop,quadraticCurveTo:noop},{get:(o,k)=>k in o?o[k]:0,set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:0,height:0,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop};
const sandbox={console,Math,Date,performance:{now:()=>now},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,innerWidth:390,innerHeight:844,devicePixelRatio:2,window:null,document:{hidden:false,addEventListener:noop}};
sandbox.window=sandbox;sandbox.window.SF={};sandbox.addEventListener=noop;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox); const SF=sandbox.window.SF; const C=SF.config; const nopProxy=new Proxy({}, {get:()=>noop});
SF.ui={...nopProxy,showHud:noop,hideScreens:noop,renderGameOver:noop,flashMsg:noop,renderPause:noop,renderHud:noop};
SF.storage={saveGame:noop,loadRanking:()=>[],saveRanking:noop,loadGame:()=>null,clearGame:noop}; SF.audio=nopProxy; SF.assets={getBackground:()=>null,getShip:()=>null,getEnemy:()=>null,getObstacle:()=>null};
vm.runInContext(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),sandbox); SF.game.init(canvas); SF.game.startNew('BOSSREG','vanguard'); const G=SF.game.state;

// Put the runtime directly in the final boss encounter and overlap several player bullets.
G.sector=1; G.wave=5; G.phase='boss'; G.phaseName='JEFE'; G.subphase=2; G.rewardPending=false; G.rewardStartedAt=0; G.rewardTransitionAt=0; G.recoveryCount=0;
G.enemies=[]; G.enemyBullets=[]; G.playerBullets=[]; G.rewardPods=[]; G.obstacles=[];
const id=C.bossIdentity.patterns[0];
const boss={kind:'boss',role:'boss',x:150,y:100,w:90,h:80,baseX:150,baseY:100,hp:.35,maxHp:50,alive:true,t:0,score:1000,color:'#f66',nextShot:1e9,phaseIdx:2,phaseAnnounced:2,summonAt:1e9,identity:id,resurrectionsLeft:0,resurrectUntil:0,coreOpenUntil:1e9,nextCoreAt:1e9,phaseGatesTriggered:2,phaseGateUntil:0,fortressHp:0,fortressMax:0,armorNodes:[],hardpoints:[],adaptUntil:0,damageWindowStart:0,damageWindowTaken:0,quickRebootUsed:true,spawnAt:-999999};
G.enemies.push(boss);
for(let i=0;i<6;i++) G.playerBullets.push({x:175,y:125,w:8,h:16,vx:0,vy:0,damage:1,color:'#fff',life:1000});
G.timers.fire=1e9; G.engageAfter=0;
now=16; SF.game.loop(now);
if(!G.rewardPending || G.phase!=='reward') throw new Error('boss death did not enter reward phase');
if(G.recoveryCount!==0) throw new Error('runtime exception occurred while killing boss with multiple bullets');
if(G.bossRewards.length!==3) throw new Error('expected exactly three boss relics');

// The entire transition must complete without setTimeout; this test intentionally stubs setTimeout to noop.
for(let i=0;i<700 && G.sector===1;i++){ now+=16; SF.game.loop(now); }
if(G.sector!==2 || G.wave!==1) throw new Error(`sector transition stuck: sector=${G.sector} wave=${G.wave} phase=${G.phase} rewards=${G.bossRewards.length}`);
if(G.rewardPending) throw new Error('rewardPending remained set after sector transition');
if(G.recoveryCount!==0) throw new Error('unexpected recovery path used during normal transition');
console.log('BOSS TRANSITION REGRESSION OK',{sector:G.sector,wave:G.wave,phase:G.phase,relics:G.relicLevels,recoveryCount:G.recoveryCount});
