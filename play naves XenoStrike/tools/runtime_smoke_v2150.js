const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
function noop(){}
function makeCtx(){
  const target={measureText:t=>({width:String(t??'').length*7}),createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),createPattern:()=>({}),getImageData:()=>({data:new Uint8ClampedArray(4)}),canvas:null};
  return new Proxy(target,{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
}
const ctx2d=makeCtx();
function makeEl(id){
  const e={id,style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},addEventListener:noop,removeEventListener:noop,appendChild:noop,remove:noop,setAttribute:noop,getAttribute:()=>null,focus:noop,blur:noop,click:noop,play:()=>Promise.resolve(),pause:noop,load:noop,currentTime:0,duration:180,volume:1,muted:false,paused:true,loop:false,src:'',textContent:'',innerHTML:'',value:'',checked:false,disabled:false,clientWidth:1280,clientHeight:720,offsetWidth:1280,offsetHeight:720,getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720,right:1280,bottom:720})};
  if(id==='game'){e.getContext=()=>ctx2d;e.width=1280;e.height=720;ctx2d.canvas=e;e.toDataURL=()=>'';}
  return e;
}
const els=new Map();
const getEl=id=>{if(!els.has(id))els.set(id,makeEl(id));return els.get(id)};
const document={
  getElementById:getEl,querySelector:()=>makeEl('q'),querySelectorAll:()=>[],createElement:t=>makeEl(t),
  documentElement:{style:{},requestFullscreen:()=>Promise.resolve(),clientWidth:1280,clientHeight:720},body:makeEl('body'),
  fullscreenElement:null,addEventListener:noop,removeEventListener:noop,fonts:{ready:Promise.resolve()},visibilityState:'visible'
};
class ImageMock{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=1024;this.width=1024;this.height=1024;this.onload=null;this.onerror=null;this._src='';}set src(v){this._src=v;if(this.onload)setTimeout(()=>this.onload(),0)}get src(){return this._src}addEventListener(){} }
class AudioMock{constructor(src=''){this.src=src;this.currentTime=0;this.duration=180;this.volume=1;this.paused=true;this.loop=false;}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}addEventListener(){}removeEventListener(){}load(){}}
const visualViewport={width:1280,height:720,addEventListener:noop};
const navigator={serviceWorker:{register:()=>Promise.resolve({})},userAgent:'node-smoke',maxTouchPoints:0};
const location={protocol:'file:',href:'file:///game/index.html'};
const screen={orientation:{lock:()=>Promise.resolve()}};
const performance={now:()=>1000};
const windowObj={document,visualViewport,devicePixelRatio:1,innerWidth:1280,innerHeight:720,navigator,location,screen,performance,addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop,removeEventListener:noop}),setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:noop,cancelAnimationFrame:noop,localStorage,Audio:AudioMock,Image:ImageMock};
windowObj.window=windowObj;windowObj.self=windowObj;windowObj.top=windowObj;windowObj.parent=windowObj;
const sandbox={...windowObj,window:windowObj,self:windowObj,globalThis:windowObj,document,navigator,location,screen,performance,visualViewport,localStorage,Audio:AudioMock,Image:ImageMock,console,Math,Date,JSON,Promise,Map,Set,WeakMap,Uint8ClampedArray,Intl};
sandbox.matchMedia=windowObj.matchMedia;sandbox.addEventListener=noop;sandbox.removeEventListener=noop;
vm.createContext(sandbox);
const src=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
try{vm.runInContext(src,sandbox,{filename:'game.js',timeout:5000});}
catch(e){console.error('RUNTIME_EVAL_FAIL',e.stack);process.exit(2)}
const st=windowObj.__SWARM_V2150_STATUS?.();
if(!st){console.error('STATUS_MISSING');process.exit(3)}
const audit=windowObj.__SWARM_CHAPTER1_AUDIT?.();
const boss=windowObj.__SWARM_BOSS_ANIM_STATUS?.();
const checks={
 version:st.version==='2.15.0',worlds:st.worlds===20,bosses:st.bosses===20,chapterII:st.chapterII?.active===true&&st.chapterII.assets===10,
 micro:st.microSwarm?.enabled===true&&st.microSwarm.fromWorld===1&&st.microSwarm.count[0]===4&&st.microSwarm.count[1]===10&&st.microSwarm.countsForWave===false,
 rift:st.riftAlly?.duration===10,lastChance:st.lastChance?.manualLifeRescue===true&&st.lastChance?.autoPurchase===false,
 bossAnim:boss&&Object.keys(boss.animatedBosses||{}).length===20,chase:audit?.chaseBonus?.enabled===true,pwa:st.pwa===true
};
const ok=Object.values(checks).every(Boolean);
console.log(JSON.stringify({ok,checks,status:st,bossAnimated:Object.keys(boss?.animatedBosses||{}).length,status:st},null,2));
process.exit(ok?0:4);
