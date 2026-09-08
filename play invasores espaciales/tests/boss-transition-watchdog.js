const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'); let now=10000; const noop=()=>{}; const grad={addColorStop:noop};
const ctx=new Proxy({createLinearGradient:()=>({...grad}),createRadialGradient:()=>({...grad}),measureText:t=>({width:String(t).length*7}),setTransform:noop,clearRect:noop,fillRect:noop,strokeRect:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,arc:noop,ellipse:noop,fill:noop,stroke:noop,save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,setLineDash:noop,drawImage:noop,roundRect:noop,fillText:noop,quadraticCurveTo:noop},{get:(o,k)=>k in o?o[k]:0,set:(o,k,v)=>(o[k]=v,true)});
const canvas={width:0,height:0,style:{},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0}),addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop};
const sandbox={console,Math,Date,performance:{now:()=>now},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,innerWidth:390,innerHeight:844,devicePixelRatio:2,window:null,document:{hidden:false,addEventListener:noop}};
sandbox.window=sandbox;sandbox.window.SF={};sandbox.addEventListener=noop;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox); const SF=sandbox.window.SF; const C=SF.config; const nopProxy=new Proxy({}, {get:()=>noop});
SF.ui={...nopProxy,showHud:noop,hideScreens:noop,renderGameOver:noop,flashMsg:noop,renderPause:noop,renderHud:noop}; SF.storage={saveGame:noop,loadRanking:()=>[],saveRanking:noop,loadGame:()=>null,clearGame:noop}; SF.audio=nopProxy; SF.assets={getBackground:()=>null,getShip:()=>null,getEnemy:()=>null,getObstacle:()=>null};
vm.runInContext(fs.readFileSync(path.join(root,'js/game.js'),'utf8'),sandbox); SF.game.init(canvas); SF.game.startNew('WATCH','vanguard'); const G=SF.game.state;
G.sector=3;G.wave=5;G.phase='reward';G.phaseName='ABSORCIÓN';G.rewardPending=true;G.rewardStartedAt=now-C.transitionSafety.rewardWatchdogMs-100;G.rewardTransitionAt=0;G.sectorTransitionLock=false;G.bossRewards=[{kind:'shield',x:NaN,y:Infinity,vx:NaN,vy:0,t:9999,delay:0,orbitMs:0,orbitAngle:0,originX:0,originY:0,trail:[],arrived:false}];
SF.game.loop(now+=16);
if(G.bossRewards.length) throw new Error('watchdog failed to consume stuck relic');
if(G.phase!=='sectorTransition') throw new Error('watchdog did not arm sector transition');
for(let i=0;i<80&&G.sector===3;i++){now+=16;SF.game.loop(now);}
if(G.sector!==4||G.wave!==1) throw new Error(`watchdog transition failed: ${G.sector}/${G.wave}/${G.phase}`);
console.log('BOSS WATCHDOG OK',{sector:G.sector,wave:G.wave,rewardPending:G.rewardPending});
