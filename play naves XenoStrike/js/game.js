(()=>{
'use strict';

const VERSION='2.15.19';
const KEY_META='swarm_rift_meta_v21519';
const KEY_RUN='swarm_rift_run_v21519';
const KEY_HIVE_TELEMETRY='swarm_rift_hive_telemetry_v21519';
const TAU=Math.PI*2;
const cv=document.getElementById('game');
const cx=cv.getContext('2d',{alpha:false});
const shell=document.getElementById('shell');
const topActions=document.getElementById('topActions');
const allyBtn=document.getElementById('allyBtn');
const shopBtn=document.getElementById('shopBtn');
const pauseBtn=document.getElementById('pauseBtn');
const musicBtn=document.getElementById('musicBtn');
const preBossMusic=document.getElementById('preBossMusic');
const bossMusic=document.getElementById('bossMusic');
const playlistAudio=document.getElementById('playlistAudio');
const audioBtn=document.getElementById('audioBtn');
const fullBtn=document.getElementById('fullBtn');
const touchHud=document.getElementById('touchHud');
const safeAreaProbe=document.getElementById('safeAreaProbe');
const stickZone=document.getElementById('stickZone');
const stickBase=document.getElementById('stickBase');
const stickKnob=document.getElementById('stickKnob');

let W=1280,H=720,DPR=1,lastT=performance.now();
let stars=[];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndI=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[(Math.random()*a.length)|0];
const weightedPick=(weights,allowed=null)=>{
  const entries=Array.isArray(weights)?weights.map(v=>Array.isArray(v)?v:[v,1]):Object.entries(weights||{});
  const pool=entries.filter(([k,w])=>(!allowed||allowed.includes(k))&&Number(w)>0);if(!pool.length)return allowed?.length?pick(allowed):null;
  let total=0;for(const [,w] of pool)total+=Number(w)||0;let r=Math.random()*total;for(const [k,w] of pool){r-=Number(w)||0;if(r<=0)return k;}return pool[pool.length-1][0];
};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const hexA=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};
const mixHex=(a,b,t=.5)=>{const pa=parseInt(a.replace('#',''),16),pb=parseInt(b.replace('#',''),16),m=(x,y)=>Math.round(x+(y-x)*t);return '#'+[m((pa>>16)&255,(pb>>16)&255),m((pa>>8)&255,(pb>>8)&255),m(pa&255,pb&255)].map(v=>v.toString(16).padStart(2,'0')).join('');};

// v2.15.6 · DEVICE PROFILER / JANK-AWARE FRAME PACER
// Evoluciona el Performance Governor: detecta la clase aproximada del dispositivo,
// vigila picos de frame-time (no solo el promedio) y ajusta resolución interna antes
// de sacrificar densidad jugable. No altera HP, daño, progreso, drops ni reglas de boss.
const PERF={frameMs:16.67,fps:60,tier:'FULL',badT:0,severeT:0,goodT:0,transitions:0,lastChange:0,samples:0,frameWindow:[],p95Ms:16.67,jank25:0,jank33:0,renderResizes:0,resizeQueued:false};
const PERF_TIERS={
  FULL:{enemy:1,micro:1,ambient:1,vfx:1,particleCap:900,renderScale:1,label:'FULL'},
  BALANCED:{enemy:.96,micro:.82,ambient:.72,vfx:.76,particleCap:700,renderScale:.90,label:'BALANCED'},
  RECOVERY:{enemy:.88,micro:.64,ambient:.48,vfx:.54,particleCap:520,renderScale:.78,label:'RECOVERY'}
};
function detectDeviceProfile(){
  const nav=typeof navigator!=='undefined'?navigator:{},nativeDpr=typeof window!=='undefined'?(window.devicePixelRatio||1):1,hw=Number(nav.hardwareConcurrency||0),memory=Number(nav.deviceMemory||0),coarse=typeof matchMedia==='function'?matchMedia('(pointer:coarse)').matches:false,pixels=(typeof innerWidth==='number'?innerWidth:1280)*(typeof innerHeight==='number'?innerHeight:720)*nativeDpr*nativeDpr;
  let score=0;if(hw>=8)score+=2;else if(hw>=4)score+=1;else if(hw&&hw<=2)score-=2;if(memory>=8)score+=2;else if(memory>=4)score+=1;else if(memory&&memory<=2)score-=2;if(pixels>7000000)score-=2;else if(pixels>3500000)score-=1;if(coarse&&pixels>4500000)score-=1;
  const deviceClass=score>=2?'HIGH':score<=-2?'LITE':'MID',dprCap=deviceClass==='HIGH'?2:deviceClass==='MID'?1.7:1.4;
  return {class:deviceClass,score,hardwareConcurrency:hw||null,deviceMemory:memory||null,coarse,nativeDpr:+nativeDpr.toFixed(2),pixelLoad:Math.round(pixels),dprCap};
}
const DEVICE=detectDeviceProfile();
function performanceTier(){return PERF_TIERS[PERF.tier]||PERF_TIERS.FULL;}
function performanceEnemyFactor(){return performanceTier().enemy;}
function performanceMicroFactor(){return performanceTier().micro;}
function performanceAmbientFactor(){return performanceTier().ambient;}
function performanceVfxFactor(){return performanceTier().vfx;}
function performanceParticleCap(){return performanceTier().particleCap;}
function performanceRenderScale(){return performanceTier().renderScale;}
function effectiveDpr(){const native=typeof window!=='undefined'?(window.devicePixelRatio||1):1;return clamp(Math.min(DEVICE.dprCap,native)*performanceRenderScale(),.85,2);}
function queueRenderResize(){if(PERF.resizeQueued||typeof setTimeout!=='function')return;PERF.resizeQueued=true;setTimeout(()=>{PERF.resizeQueued=false;PERF.renderResizes++;resize();},90);}
function updateJankWindow(ms){
  const w=PERF.frameWindow;w.push(ms);if(w.length>120)w.shift();if(w.length<18)return;
  const sorted=[...w].sort((a,b)=>a-b),idx=Math.min(sorted.length-1,Math.floor(sorted.length*.95));PERF.p95Ms=sorted[idx];let n25=0,n33=0;for(const v of w){if(v>25)n25++;if(v>33)n33++;}PERF.jank25=n25/w.length;PERF.jank33=n33/w.length;
}
function performanceGovernorTick(frameDt){
  const ms=clamp((Number(frameDt)||.01667)*1000,1,80);PERF.samples++;updateJankWindow(ms);
  const a=PERF.samples<20?.16:.055;PERF.frameMs=lerp(PERF.frameMs,ms,a);PERF.fps=1000/Math.max(1,PERF.frameMs);
  const game=!!(G&&G.screen==='GAME');if(!game){PERF.badT=Math.max(0,PERF.badT-frameDt*2);PERF.severeT=Math.max(0,PERF.severeT-frameDt*2);PERF.goodT+=frameDt;return;}
  if(PERF.fps<46||PERF.jank25>.20)PERF.badT+=frameDt;else PERF.badT=Math.max(0,PERF.badT-frameDt*1.4);
  if(PERF.fps<36||PERF.jank33>.16)PERF.severeT+=frameDt;else PERF.severeT=Math.max(0,PERF.severeT-frameDt*1.8);
  if(PERF.fps>54&&PERF.jank25<.08)PERF.goodT+=frameDt;else PERF.goodT=Math.max(0,PERF.goodT-frameDt*.8);
  let next=PERF.tier;
  if(PERF.severeT>1.05||PERF.frameMs>29||PERF.p95Ms>38||PERF.jank33>.22)next='RECOVERY';
  else if(PERF.badT>1.35||PERF.frameMs>22.5||PERF.p95Ms>29||PERF.jank25>.26)next=PERF.tier==='RECOVERY'&&PERF.goodT<3.2?'RECOVERY':'BALANCED';
  else if(PERF.goodT>4.0)next='FULL';
  else if(PERF.tier==='RECOVERY'&&PERF.goodT>2.4)next='BALANCED';
  if(next!==PERF.tier){PERF.tier=next;PERF.transitions++;PERF.lastChange=performance.now();PERF.badT=0;PERF.severeT=0;PERF.goodT=0;queueRenderResize();}
}
function performanceStatus(){const q=performanceTier();return {tier:PERF.tier,fps:+PERF.fps.toFixed(1),frameMs:+PERF.frameMs.toFixed(2),p95Ms:+PERF.p95Ms.toFixed(2),jank25:+PERF.jank25.toFixed(3),jank33:+PERF.jank33.toFixed(3),enemyFactor:q.enemy,microFactor:q.micro,ambientFactor:q.ambient,vfxFactor:q.vfx,particleCap:q.particleCap,renderScale:q.renderScale,effectiveDpr:+effectiveDpr().toFixed(2),renderResizes:PERF.renderResizes,transitions:PERF.transitions};}

const isCoarse=()=>matchMedia('(pointer:coarse)').matches;
const compactUI=()=>isCoarse() || W<980 || H<560;
function uiProfile(){
  if((isCoarse()||W<760)&&W<H)return 'MOBILE_PORTRAIT';
  if(W>=H&&((isCoarse()&&(H<600||W<900))||(!isCoarse()&&W<900&&H<560)))return 'MOBILE_LANDSCAPE';
  if((isCoarse()&&W<1450)||W<1180)return 'TABLET';
  return 'DESKTOP';
}
const mobileUI=()=>uiProfile()==='MOBILE_PORTRAIT'||uiProfile()==='MOBILE_LANDSCAPE';
const portraitUI=()=>uiProfile()==='MOBILE_PORTRAIT';

// v2.15.18 · MOBILE COMBAT ERGONOMICS PASS
// Protege notch/safe-area, amplía objetivos táctiles efectivos y evita que un segundo dedo
// secuestre el control directo. No añade joystick, DASH ni cambia cadencia de combate.
let SAFE_AREA={top:0,right:0,bottom:0,left:0};
const INPUT_ERGO={excludedStarts:0,ignoredSecondary:0,coalescedMoves:0,cancels:0,viewportStabilizations:0,lastCancel:''};
function refreshSafeArea(){
  if(!safeAreaProbe||typeof getComputedStyle!=='function')return SAFE_AREA;
  try{const st=getComputedStyle(safeAreaProbe),n=v=>Math.max(0,Number.parseFloat(v)||0);SAFE_AREA={top:n(st.paddingTop),right:n(st.paddingRight),bottom:n(st.paddingBottom),left:n(st.paddingLeft)};}catch(_){}
  return SAFE_AREA;
}
function playerCombatBounds(){
  if(!isCoarse())return {left:28,right:W-28,top:44,bottom:H-30};
  const l=Math.max(30,SAFE_AREA.left+26),r=Math.max(30,SAFE_AREA.right+26),t=Math.max(44,SAFE_AREA.top+38),b=Math.max(34,SAFE_AREA.bottom+28);
  return {left:l,right:Math.max(l+120,W-r),top:t,bottom:Math.max(t+100,H-b)};
}
function actionRailExclusion(pad=10){
  const fallbackW=Math.min(286,Math.max(210,W*.34)),fallbackH=58;
  let left=W-SAFE_AREA.right-fallbackW-pad,top=Math.max(0,SAFE_AREA.top-pad),right=W-SAFE_AREA.right+pad,bottom=SAFE_AREA.top+fallbackH+pad;
  try{const r=topActions?.getBoundingClientRect?.();if(r&&r.width>0&&r.height>0&&r.width<W*.65&&r.height<H*.35&&r.left>=-2&&r.top>=-2&&r.right<=W+2&&r.bottom<=H+2){left=r.left-pad;top=r.top-pad;right=r.right+pad;bottom=r.bottom+pad;}}catch(_){}
  return {left:clamp(left,0,W),top:clamp(top,0,H),right:clamp(right,0,W),bottom:clamp(bottom,0,H)};
}
function pointInRect(x,y,r){return !!r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
function touchStartExcluded(x,y){return isCoarse()&&pointInRect(x,y,actionRailExclusion(10));}
function sanitizeTouchPoint(x,y){
  const b=playerCombatBounds();let sx=clamp(x,b.left,b.right),sy=clamp(y,b.top,b.bottom);const rail=actionRailExclusion(8);
  if(isCoarse()&&pointInRect(sx,sy,rail)){
    const toLeft=Math.abs(sx-(rail.left-8)),toBottom=Math.abs(sy-(rail.bottom+8));
    if(toLeft<=toBottom)sx=clamp(rail.left-8,b.left,b.right);else sy=clamp(rail.bottom+8,b.top,b.bottom);
  }
  return {x:sx,y:sy};
}
function safeHudCenterX(){const l=SAFE_AREA.left,r=SAFE_AREA.right;return l+Math.max(0,W-l-r)/2;}
function mobileErgonomicsStatus(){return {version:VERSION,profile:uiProfile(),coarse:isCoarse(),safeArea:{...SAFE_AREA},playerBounds:playerCombatBounds(),actionRail:actionRailExclusion(8),effectiveTapTarget:44,directTouch:true,singlePrimaryTouch:true,secondaryTouchIgnored:true,coalescedPointerMoves:true,viewportDebounce:true,stats:{...INPUT_ERGO}};}
function drawMiniChip(x,y,w,h,col,text,fill='rgba(2,7,17,.72)',align='left'){
  cx.fillStyle=fill;cx.strokeStyle=hexA(col,.38);rr(x,y,w,h,10);cx.fill();cx.stroke();
  cx.fillStyle=col;cx.font='800 10px system-ui';cx.textAlign=align;
  if(align==='center')cx.fillText(text,x+w/2,y+h/2+1); else if(align==='right')cx.fillText(text,x+w-8,y+h/2+1); else cx.fillText(text,x+8,y+h/2+1);
}

// v2.15.17 · HUD & MOBILE READABILITY PASS
// El HUD prioriza supervivencia > amenaza de boss > transición > objetivo táctico > economía.
// Solo cambia presentación: no altera input, daño, HP, spawns, timers ni reglas de juego.
let HUD_PRESENTATION={focus:'COMBAT',profile:'DESKTOP',compact:false,lastSync:''};
function hudFocusMode(){
  if(!G||G.screen!=='GAME')return 'MENU';
  if((G.lastChanceT||0)>0)return 'LAST_CHANCE';
  if(G.bossWarningT>0&&G.boss&&!G.boss.dead)return 'BOSS_ALERT';
  if(G.preBossT>0)return 'PRE_BOSS';
  if(G.boss&&!G.boss.dead)return 'BOSS';
  if(G.postBossT>0)return 'REWARDS';
  if(G.familyPlay)return 'TACTICAL';
  if(activeWaveObjective())return 'OBJECTIVE';
  if(G.frenzyT>0)return 'FRENZY';
  return 'COMBAT';
}
function syncHudPresentation(){
  const next={focus:hudFocusMode(),profile:uiProfile(),compact:compactUI()};
  const sig=`${next.focus}|${next.profile}|${next.compact?1:0}`;
  if(sig!==HUD_PRESENTATION.lastSync){
    HUD_PRESENTATION={...next,lastSync:sig};
    if(document?.body?.dataset){document.body.dataset.hudFocus=next.focus;document.body.dataset.hudProfile=next.profile;}
    if(topActions?.dataset){topActions.dataset.hudFocus=next.focus;topActions.dataset.hudProfile=next.profile;}
  }
  return HUD_PRESENTATION;
}
function hudPriorityStatus(){
  const focus=hudFocusMode(),sec=SECTORS[G.sector-1],obj=objectiveHudText();
  if(focus==='LAST_CHANCE')return {text:`⚠ RESCATE · ${(G.lastChanceT||0).toFixed(1)}s`,color:'#ff7188'};
  if(focus==='BOSS_ALERT')return {text:`⚠ ${String(G.bossWarningText||'ATAQUE').slice(0,30)}`,color:BOSS_SKILLS[G.boss?.pattern]?.color||'#ff8a93'};
  if(focus==='PRE_BOSS')return {text:`⚠ ${activePreBossEscalation()?.label||'ANTESALA'} · ${Math.ceil(G.preBossT||0)}s`,color:sec.accent};
  if(focus==='BOSS')return {text:`☠ ${G.boss?.name||sec.boss} · F${G.boss?.phase||1}`,color:sec.accent};
  if(focus==='REWARDS')return {text:`★ PREMIOS · ${Math.ceil(G.postBossT||0)}s`,color:'#a6ff5f'};
  if(focus==='TACTICAL')return {text:`⌁ ${G.familyPlay.label}${G.familyPlay.adapted?' · ADAPT':''}`,color:G.familyPlay.stage==='active'?'#fff09a':sec.accent};
  if(focus==='OBJECTIVE')return {text:String(obj||'OBJETIVO').slice(0,42),color:'#fff09a'};
  if(focus==='FRENZY')return {text:`⚡ FRENESÍ ${G.frenzyKills}/${G.frenzyTarget} · ${Math.ceil(G.frenzyT)}s`,color:'#ffdc82'};
  if(G.riftAlly)return {text:`☣ ${G.riftAlly.name} · ${Math.ceil(G.riftAlly.t)}s`,color:'#9fe6ff'};
  if(G.apexT>0)return {text:`✦ RIFT APEX · ${Math.ceil(G.apexT)}s`,color:'#7cf6ff'};
  if(G.fusionSurgeT>0)return {text:`Σ FUSIÓN · ${Math.ceil(G.fusionSurgeT)}s`,color:'#d9a7ff'};
  return {text:`✕ ${G.kills}/${G.goal}`,color:'#9fe6ff'};
}
function hudPresentationStatus(){
  const p=G?.player,focus=hudFocusMode();return {version:VERSION,profile:uiProfile(),compact:compactUI(),focus,priority:['LAST_CHANCE','BOSS_ALERT','PRE_BOSS','BOSS','REWARDS','TACTICAL','OBJECTIVE','FRENZY','COMBAT'],mobilePowerLimit:mobileUI()?4:6,reservesActionRail:compactUI(),coreAlwaysVisible:!!p,criticalKeepsShopVisible:true,gameplayNeutral:true};
}
function drawCompactHud(){
  const p=G.player,sec=SECTORS[G.sector-1],profile=uiProfile(),focus=hudFocusMode(),mobile=mobileUI();
  const actionReserve=mobile?Math.min(286,W*.35)+SAFE_AREA.right:Math.min(238,W*.25),left=Math.max(6,SAFE_AREA.left+4),top=Math.max(6,SAFE_AREA.top+4),panelW=Math.max(230,Math.min(mobile?530:640,W-left-actionReserve-12)),panelH=42;
  cx.fillStyle='rgba(2,7,17,.76)';cx.strokeStyle=hexA(sec.accent,.28);rr(left,top,panelW,panelH,11);cx.fill();cx.stroke();
  const hp=clamp(p.hp/p.maxHp,0,1),sh=clamp(p.shield/p.maxShield,0,1),hpCol=hp<=.18?'#ff526f':'#ff86a0';
  cx.textAlign='left';cx.font='900 9px system-ui';cx.fillStyle='#e8fbff';cx.fillText(`${G.mode==='bossRush'?'☠':'⚑'} ${G.mode==='bossRush'?(()=>{const q=bossRushPosition();return `${q.index}/${q.total}`;})():`${G.sector}.${G.wave}`}  ·  ${G.runDifficulty==='hard'?'◆ D  ·  ':''}✕ ${G.kills}/${G.goal}`,left+9,top+11);
  const barY=top+24,labelY=barY+5,hpX=left+10,hpW=Math.max(82,Math.min(150,panelW*.28)),shX=hpX+hpW+46,shW=Math.max(72,Math.min(130,panelW*.24));
  cx.fillStyle=hpCol;cx.font='900 9px system-ui';cx.fillText(`❤ ${Math.round(hp*100)}`,hpX,labelY);bar(hpX+36,barY,hpW,7,hp,hpCol);
  cx.fillStyle='#74b9ff';cx.fillText(`⬡ ${Math.round(sh*100)}`,shX,labelY);bar(shX+36,barY,shW,7,sh,'#74b9ff');
  const xpX=shX+shW+45;if(xpX+58<left+panelW){cx.fillStyle='#a6ff5f';cx.fillText(`✦ ${G.level}`,xpX,labelY);bar(xpX+27,barY,Math.max(38,left+panelW-xpX-35),7,G.xp/G.xpNext,'#a6ff5f');}
  const priority=hudPriorityStatus(),critical=focus==='LAST_CHANCE'||focus==='BOSS_ALERT',showFocus=focus!=='COMBAT'||G.riftAlly||G.apexT>0||G.fusionSurgeT>0;
  if(showFocus){const fw=Math.min(W-SAFE_AREA.left-SAFE_AREA.right-24,mobile?430:520),fy=top+panelH+6,fcx=safeHudCenterX();cx.fillStyle=critical?'rgba(45,3,10,.84)':'rgba(2,7,17,.78)';cx.strokeStyle=hexA(priority.color,.55);rr(fcx-fw/2,fy,fw,24,9);cx.fill();cx.stroke();cx.fillStyle=priority.color;cx.font='900 9.5px system-ui';cx.textAlign='center';cx.fillText(fitNoticeText(priority.text,fw-18),fcx,fy+13);}
  // Los poderes se concentran abajo: icono + tiempo. No se apilan colas/textos largos en móvil.
  if(focus!=='LAST_CHANCE'){
    const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);const limit=mobile?4:6,shown=active.slice(0,limit),queue=(G.powerQueue||[]).length;
    if(shown.length||queue||G.combo>=3||G.riftAlly){const chipH=22,gap=4,baseW=mobile?58:68,total=Math.min(W-16,shown.length*(baseW+gap)+(queue?42:0)+(G.combo>=3?40:0)+(G.riftAlly?48:0)),by=H-chipH-Math.max(8,SAFE_AREA.bottom+6);let bx=safeHudCenterX()-total/2;for(const [k,v] of shown){const pd=POWERS[k],w=baseW;cx.fillStyle='rgba(2,7,17,.78)';cx.strokeStyle=hexA(pd.color,.42);rr(bx,by,w,chipH,8);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 8.5px system-ui';cx.textAlign='center';cx.fillText(`${pd.icon}${powerVisualTag(k)} ${Math.ceil(v)}`,bx+w/2,by+12);bx+=w+gap;}if(queue){drawMiniChip(bx,by,38,chipH,'#a9bed0',`⏳${queue}`,'rgba(2,7,17,.74)','center');bx+=42;}if(G.riftAlly){drawMiniChip(bx,by,44,chipH,'#9fe6ff',`☣${Math.ceil(G.riftAlly.t)}`,'rgba(2,20,28,.76)','center');bx+=48;}if(G.combo>=3)drawMiniChip(bx,by,36,chipH,G.combo>=10?'#ff8be2':'#ffd76a',`×${G.combo}`,'rgba(2,7,17,.74)','center');}
  }
  if(G.mode==='training'){cx.textAlign='left';cx.fillStyle='#bdefff';cx.font='800 8px system-ui';cx.fillText('ENTRENAMIENTO',8,H-10);}
}

function resize(){
  const vv=window.visualViewport;
  const w=Math.max(320,Math.floor(vv?vv.width:innerWidth));
  const h=Math.max(220,Math.floor(vv?vv.height:innerHeight));
  DPR=effectiveDpr();
  cv.width=Math.floor(w*DPR); cv.height=Math.floor(h*DPR);
  cv.style.width=w+'px'; cv.style.height=h+'px';
  cx.setTransform(DPR,0,0,DPR,0,0); W=w; H=h;refreshSafeArea();
  seedStars();lastT=performance.now();
}
function seedStars(){const df=DEVICE.class==='LITE'?.68:DEVICE.class==='MID'?.84:1,pf=PERF.tier==='RECOVERY'?.72:PERF.tier==='BALANCED'?.88:1;stars=Array.from({length:Math.round(clamp(W*H/8500*df*pf,32,125))},()=>({x:rnd(0,W),y:rnd(0,H),z:rnd(.2,1.2),r:rnd(.5,2.1)}));}
let viewportStabilizeTimer=0;
function stabilizeViewport(delay=55){if(viewportStabilizeTimer)clearTimeout(viewportStabilizeTimer);viewportStabilizeTimer=setTimeout(()=>{viewportStabilizeTimer=0;INPUT_ERGO.viewportStabilizations++;resize();},delay);}
resize();
addEventListener('resize',()=>stabilizeViewport(48),{passive:true});
addEventListener('orientationchange',()=>{try{resetDirectTouch('orientation');}catch(_){}stabilizeViewport(210);setTimeout(()=>stabilizeViewport(70),420);},{passive:true});
if(window.visualViewport) visualViewport.addEventListener('resize',()=>stabilizeViewport(52),{passive:true});
addEventListener('visibilitychange',()=>{lastT=performance.now();PERF.frameWindow.length=0;PERF.p95Ms=PERF.frameMs;PERF.jank25=0;PERF.jank33=0;try{if(document.visibilityState==='hidden')resetDirectTouch('visibility');}catch(_){}},{passive:true});
addEventListener('blur',()=>{try{resetDirectTouch('blur');}catch(_){}},{passive:true});

async function tryFullscreen(){
  const el=document.documentElement;
  try{
    if(!document.fullscreenElement && el.requestFullscreen){try{await el.requestFullscreen({navigationUI:'hide'});}catch(_){}}
    if(screen.orientation?.lock){try{await screen.orientation.lock('landscape');}catch(_){}}
    setTimeout(resize,120);
  }catch(_){ }
}

const IMG={
  ship:new Image(),
  atlas:new Image(),
  bg:{rust:new Image(),toxic:new Image(),rift:new Image(),nocturne:new Image(),nocturneBoss:new Image(),iron:new Image(),ironBoss:new Image(),emerald:new Image(),emeraldBoss:new Image(),bloodmist:new Image(),bloodmistBoss:new Image(),resin:new Image(),resinBoss:new Image(),odonata:new Image(),odonataBoss:new Image(),resonance:new Image(),resonanceBoss:new Image()},
  obstacles:{rock:new Image(),mine:new Image(),wreck:new Image(),pod:new Image(),gate:new Image(),nest:new Image(),seed:new Image()},
  pickups:{credit:new Image(),heal:new Image(),shield:new Image(),power:new Image()},
  enemyShips:{scout:new Image(),frigate:new Image(),bomber:new Image()},
  tiers:new Image(),
  generatedObstacles:{rust:[],toxic:[],rift:[]},
  generatedShips:[],
  generatedPowers:{},
  support:{scout:new Image(),lancer:new Image(),orbiter:new Image()},
  front:{meteor:new Image(),rammer:new Image(),wreck:new Image(),pod:new Image()},
  objectives:{node:new Image(),capsule:new Image(),core:new Image()},
  transversal:{rift_scout:new Image(),salvage_drone:new Image(),parasite_orb:new Image(),rift_carrier:new Image(),relic_hunter:new Image()},
  bossAnim:{imperatrix:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},atlas:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},cortex:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},vela:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},regina:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},colossus:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},sanguina:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},architect:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},auralis:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()},resonator:{idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()}},
  worldObstacles:{np:[],iron:[],emerald:[],blood:[],resin:[],odonata:[],resonance:[]},
  worldEnemies:{AVISPAS:[],ESCARABAJOS:[],MANTIS:[],POLILLAS:[],HORMIGAS:[],LANGOSTAS:[],MOSQUITOS:[],TERMITAS:[],LIBÉLULAS:[],CIGARRAS:[]},
  enemyCells:Array.from({length:3},()=>Array(6))
};
IMG.ship.src='assets/player_ship.webp';
IMG.atlas.src='assets/enemy_atlas.png';
IMG.bg.rust.src='assets/bg_rust_canyon.webp';
IMG.bg.toxic.src='assets/bg_toxic_ravine.webp';
IMG.bg.rift.src='assets/bg_rift_tunnel.webp';
IMG.bg.nocturne.src='assets/worlds/bg_nocturne.webp';
IMG.bg.nocturneBoss.src='assets/worlds/bg_nocturne_boss.webp';
IMG.bg.iron.src='assets/worlds/bg_iron.webp';
IMG.bg.ironBoss.src='assets/worlds/bg_iron_boss.webp';
IMG.bg.emerald.src='assets/worlds/bg_emerald.webp';
IMG.bg.emeraldBoss.src='assets/worlds/bg_emerald_boss.webp';
IMG.bg.bloodmist.src='assets/worlds7_10/bg_bloodmist.webp';
IMG.bg.bloodmistBoss.src='assets/worlds7_10/bg_bloodmist_boss.webp';
IMG.bg.resin.src='assets/worlds7_10/bg_resin_hive.webp';
IMG.bg.resinBoss.src='assets/worlds7_10/bg_resin_hive_boss.webp';
IMG.bg.odonata.src='assets/worlds7_10/bg_odonata.webp';
IMG.bg.odonataBoss.src='assets/worlds7_10/bg_odonata_boss.webp';
IMG.bg.resonance.src='assets/worlds7_10/bg_resonance.webp';
IMG.bg.resonanceBoss.src='assets/worlds7_10/bg_resonance_boss.webp';
// v2.15.7 · ASSET RESIDENCY STREAMER — Capítulo II se decodifica bajo demanda.
// Mantiene el mundo actual (y, salvo LITE, precarga el siguiente) en lugar de abrir
// simultáneamente ~190 imágenes CH2. La caché PWA sigue siendo independiente.
const CH2_STREAM_REGISTRY={};
const ASSET_STREAM={enabled:true,loads:0,evictions:0,failures:0,currentWorld:0,menuWorld:0,prefetches:0,lastReason:'boot',scheduled:new Set()};
function streamReg(world){return CH2_STREAM_REGISTRY[world]||(CH2_STREAM_REGISTRY[world]={world,ante:null,bossBg:null,enemy:[],boss:[],bossBase:null,coreLoaded:false,bossLoaded:false});}
function streamAssign(im,src,tag=''){if(!im||!src)return false;if(im._streamSrc===src&&im.src)return false;im._streamSrc=src;try{im.decoding='async';}catch(_){}if(im._streamError)im.onerror=im._streamError;else im.onerror=()=>{ASSET_STREAM.failures++;};im.src=src;ASSET_STREAM.loads++;im._streamTag=tag;return true;}
function streamDrop(im){if(!im||!im._streamSrc)return false;im.onerror=null;try{im.removeAttribute('src');}catch(_){try{im.src='';}catch(__){}}im._streamSrc='';ASSET_STREAM.evictions++;return true;}
function streamEntriesLoad(entries){let n=0;for(const e of entries||[])if(e&&streamAssign(e.img,e.src,e.tag))n++;return n;}
function streamEntriesDrop(entries){let n=0;for(const e of entries||[])if(e&&streamDrop(e.img))n++;return n;}
// v2.15.0 · CAPÍTULO II — fondos runtime 11–20 (antesala + arena de jefe)
for(let i=11;i<=20;i++){const w=new Image(),b=new Image(),r=streamReg(i);IMG.bg[`w${i}`]=w;IMG.bg[`w${i}Boss`]=b;r.ante={img:w,src:`assets_ch2/backgrounds/w${i}_antechamber.webp?av=2157`,tag:`w${i}:ante`};r.bossBg={img:b,src:`assets_ch2/backgrounds/w${i}_boss.webp?av=2157`,tag:`w${i}:boss-bg`};}
IMG.obstacles.rock.src='assets/obstacles_real/obs_rock.png';
IMG.obstacles.mine.src='assets/obstacles_real/obs_mine.png';
IMG.obstacles.wreck.src='assets/obstacles_real/obs_drone_wreck.png';
IMG.obstacles.pod.src='assets/obstacles_real/obs_pod_toxic.png';
IMG.obstacles.gate.src='assets/obstacles_real/obs_gate.png';
IMG.obstacles.nest.src='assets/obstacles_real/obs_nest.png';
IMG.obstacles.seed.src='assets/obstacles_real/obs_seed.png';
IMG.pickups.credit.src='assets/pickups/pickup_credit.png';
IMG.pickups.heal.src='assets/pickups/pickup_heal.png';
IMG.pickups.shield.src='assets/pickups/pickup_shield.png';
IMG.pickups.power.src='assets/pickups/pickup_power.png';
IMG.enemyShips.scout.src='assets/generated/ship_01.png';
IMG.enemyShips.frigate.src='assets/generated/ship_08.png';
IMG.enemyShips.bomber.src='assets/generated/ship_12.png';
IMG.support.scout.src='assets/support/support_scout.png';
IMG.support.lancer.src='assets/support/support_lancer.png';
IMG.support.orbiter.src='assets/support/support_orbiter.png';
IMG.front.meteor.src='assets/front/front_meteor.png';
IMG.front.rammer.src='assets/front/front_rammer.png';
IMG.front.wreck.src='assets/front/front_wreck.png';
IMG.front.pod.src='assets/front/front_pod.png';
IMG.objectives.node.src='assets/objectives/objective_node.png';
IMG.objectives.capsule.src='assets/objectives/objective_capsule.png';
IMG.objectives.core.src='assets/objectives/objective_core.png';
IMG.transversal.rift_scout.src='assets/transversal/rift_scout.png';
IMG.transversal.salvage_drone.src='assets/transversal/salvage_drone.png';
IMG.transversal.parasite_orb.src='assets/transversal/parasite_orb.png';
IMG.transversal.rift_carrier.src='assets/transversal/rift_carrier.png';
IMG.transversal.relic_hunter.src='assets/transversal/relic_hunter.png';
const BOSS_ASSET_HEALTH={errors:{},warned:new Set()};
function bossAssetFault(key,state,src=''){const id=`${key}:${state}`;BOSS_ASSET_HEALTH.errors[id]={src,ts:Date.now()};if(!BOSS_ASSET_HEALTH.warned.has(id)){BOSS_ASSET_HEALTH.warned.add(id);console.error(`[SWARM//RIFT] Boss asset fallback ${id}`,src);try{if(G?.screen==='GAME')notify(`⚠ ASSET ${key.toUpperCase()} · ${state.toUpperCase()} · FALLBACK`,'#ff7188',2.4);}catch(_){}}}
for(const [bossKey,pack] of Object.entries(IMG.bossAnim))for(const st of ['idle','attack','hurt','phase','death']){const im=pack[st];im.onerror=()=>bossAssetFault(bossKey,st,im.src||'');im.src=`assets/boss_anim/${bossKey}/${st}.png?av=2137`;}
for(const bgImg of Object.values(IMG.bg)){try{bgImg.decode?.().catch(()=>{});}catch(_){}}
const WORLD_OBSTACLE_FILES={
  np:['assets/worlds_semantic/np_cocoon.png','assets/worlds_semantic/np_pollenpod.png','assets/worlds_semantic/np_spire.png'],
  iron:['assets/worlds_semantic/in_nest.png','assets/worlds_semantic/in_bulwark.png','assets/worlds_semantic/in_mine.png'],
  emerald:['assets/worlds_semantic/el_seed.png','assets/worlds_semantic/el_rock.png','assets/worlds_semantic/el_spore.png'],
  blood:['assets/worlds7_10/obstacles/blood_capsule.png','assets/worlds7_10/obstacles/blood_sac.png','assets/worlds7_10/obstacles/blood_membrane.png','assets/worlds7_10/obstacles/blood_wreck.png'],
  resin:['assets/worlds7_10/obstacles/resin_column.png','assets/worlds7_10/obstacles/resin_panel.png','assets/worlds7_10/obstacles/resin_wall.png','assets/worlds7_10/obstacles/resin_node.png'],
  odonata:['assets/worlds7_10/obstacles/prism_crystal.png','assets/worlds7_10/obstacles/ion_tower.png','assets/worlds7_10/obstacles/suspended_debris.png','assets/worlds7_10/obstacles/electric_node.png'],
  resonance:['assets/worlds7_10/obstacles/sonic_ring.png','assets/worlds7_10/obstacles/sonic_bell.png','assets/worlds7_10/obstacles/sonic_resonator.png','assets/worlds7_10/obstacles/acoustic_fragment.png']
};
for(const [theme,files] of Object.entries(WORLD_OBSTACLE_FILES))for(const f of files){const im=new Image();im.src=f;IMG.worldObstacles[theme].push(im);}
const WORLD_ENEMY_FILES={
  AVISPAS:['assets/enemies_semantic/wasp_minor.png','assets/enemies_semantic/wasp_medium.png','assets/enemies_semantic/wasp_major.png','assets/enemies_semantic/boss_wasp.png'],
  ESCARABAJOS:['assets/enemies_semantic/beetle_minor.png','assets/enemies_semantic/beetle_medium.png','assets/enemies_semantic/beetle_major.png','assets/enemies_semantic/boss_beetle.png'],
  MANTIS:['assets/enemies_semantic/mantis_minor.png','assets/enemies_semantic/mantis_medium.png','assets/enemies_semantic/mantis_major.png','assets/enemies_semantic/boss_mantis.png'],
  POLILLAS:['assets/enemies_semantic/moth_minor.png','assets/enemies_semantic/moth_medium.png','assets/enemies_semantic/moth_major.png','assets/enemies_semantic/boss_moth.png'],
  HORMIGAS:['assets/enemies_semantic/ant_minor.png','assets/enemies_semantic/ant_medium.png','assets/enemies_semantic/ant_major.png','assets/enemies_semantic/boss_ant.png'],
  LANGOSTAS:['assets/enemies_semantic/locust_minor.png','assets/enemies_semantic/locust_medium.png','assets/enemies_semantic/locust_major.png','assets/boss_final_v2137/boss_colossus_hop_final.png?av=2137'],
  MOSQUITOS:['assets/worlds7_10/enemies/mosquito_needler.png','assets/worlds7_10/enemies/mosquito_hemodrone.png','assets/worlds7_10/enemies/mosquito_bloodreaper.png','assets/boss_final_v2137/boss_sanguina_prime_final.png?av=2137'],
  TERMITAS:['assets/worlds7_10/enemies/termite_worker.png','assets/worlds7_10/enemies/termite_mandible_guard.png','assets/worlds7_10/enemies/termite_siegebuilder.png','assets/boss_final_v2137/boss_architect_zero_final.png?av=2137'],
  'LIBÉLULAS':['assets/worlds7_10/enemies/dragonfly_flashwing.png','assets/worlds7_10/enemies/dragonfly_prism_hunter.png','assets/worlds7_10/enemies/dragonfly_lance_predator.png','assets/boss_final_v2137/boss_auralis_final.png?av=2137'],
  CIGARRAS:['assets/worlds7_10/enemies/cicada_nymph_echo.png','assets/worlds7_10/enemies/cicada_sonic_cantor.png','assets/worlds7_10/enemies/cicada_resonance_breaker.png','assets/boss_final_v2137/boss_resonator_omega_final.png?av=2137']
};
for(const [family,files] of Object.entries(WORLD_ENEMY_FILES))for(const f of files){const im=new Image();im.src=f;IMG.worldEnemies[family].push(im);}
// v2.15.0 · familias CH2 — bases + hojas de animación menor/medio/mayor/mini
const CH2_FAMILY_DEFS={
  SCARAB_IMPERATOR:{world:11,bossKey:'scarab_imperator'},VESPERA_LANCERS:{world:12,bossKey:'vespera_lancer'},MANDIBLE_REGENTS:{world:13,bossKey:'regent_mandible'},PYROLUX:{world:14,bossKey:'pyrolux_beacon'},CAUSTIC:{world:15,bossKey:'caustic_alchemist'},
  VEILS:{world:16,bossKey:'atlas_veil'},PHASMIDS:{world:17,bossKey:'mirage_phasmid'},ANTLIONS:{world:18,bossKey:'pit_emperor'},AURICULUS:{world:19,bossKey:'auriculus_razor'},APIARY:{world:20,bossKey:'apis_imperia'}
};
// v2.15.2 · gramáticas de combate coordinado: identidad táctica por familia CH2.
const FAMILY_COMBAT_GRAMMAR={
  11:{id:'ORBITAL_GUARD',label:'GUARDIA ORBITAL',minor:'orbit',medium:'ram',major:'gravity',formation:'arc',bossFormation:'orbit',cadence:6.8},
  12:{id:'VENOM_LANCE',label:'LANZA VENENOSA',minor:'flank',medium:'lance',major:'venom',formation:'wedge',bossFormation:'wedge',cadence:6.0},
  13:{id:'MANDIBLE_WALL',label:'MURO DE MANDÍBULAS',minor:'screen',medium:'clamp',major:'brace',formation:'block',bossFormation:'block',cadence:7.4},
  14:{id:'LUMEN_CONSTELLATION',label:'CONSTELACIÓN LÚMEN',minor:'orbit',medium:'constellation',major:'beacon',formation:'arc',bossFormation:'arc',cadence:7.0},
  15:{id:'CAUSTIC_SCREEN',label:'PANTALLA CÁUSTICA',minor:'screen',medium:'spray',major:'distill',formation:'ribbon',bossFormation:'ribbon',cadence:7.2},
  16:{id:'VEIL_CIRCLE',label:'CÍRCULO DEL VELO',minor:'veil',medium:'weave',major:'eclipse',formation:'double',bossFormation:'double',cadence:7.0},
  17:{id:'MIRAGE_SPLIT',label:'FRACTURA MIMÉTICA',minor:'decoy',medium:'split',major:'refract',formation:'cross',bossFormation:'cross',cadence:6.4},
  18:{id:'PIT_HUNT',label:'CACERÍA DE FOSA',minor:'burrow',medium:'herd',major:'vortex',formation:'wedge',bossFormation:'wedge',cadence:7.6},
  19:{id:'RAZOR_CHAIN',label:'CADENA ELECTROFÁGICA',minor:'chain',medium:'sweep',major:'conduct',formation:'double',bossFormation:'cross',cadence:6.5},
  20:{id:'ROYAL_HIVE',label:'DOMINIO DE COLMENA',minor:'royal',medium:'corridor',major:'command',formation:'block',bossFormation:'arc',cadence:5.9}
};
function familyCombatGrammar(sector=G?.sector||1){return FAMILY_COMBAT_GRAMMAR[Math.max(1,Math.round(sector))]||null;}
// v2.15.3 · JUGADAS COORDINADAS DE FAMILIA.
// Requieren mayor + medio + 2 menores vivos. Son telegráficas, breves y no añaden HP.
const FAMILY_COMBO_PLAYS={
  11:{id:'ORBITAL_PINCER',label:'ÓRBITA DE CERCO',effect:'orbit',telegraph:.95,active:2.00,cool:[13.5,17.0]},
  12:{id:'VENOM_TRIDENT',label:'TRIDENTE VENENOSO',effect:'venom',telegraph:.90,active:2.05,cool:[12.8,16.0]},
  13:{id:'ANVIL_CLAMP',label:'YUNQUE Y TENAZA',effect:'brace',telegraph:1.00,active:2.15,cool:[13.5,17.5]},
  14:{id:'LUMEN_HUNT',label:'CONSTELACIÓN DE CAZA',effect:'lumen',telegraph:.92,active:2.10,cool:[12.5,16.0]},
  15:{id:'CAUSTIC_FUNNEL',label:'EMBUDO CÁUSTICO',effect:'caustic',telegraph:.98,active:2.20,cool:[12.2,15.5]},
  16:{id:'VEIL_PINCER',label:'VELO DE PINZA',effect:'veil',telegraph:.88,active:2.35,cool:[10.2,13.2],advanced:true},
  17:{id:'MIRROR_CROSS',label:'CRUZ ESPEJO',effect:'mirror',telegraph:.84,active:2.35,cool:[9.8,12.8],advanced:true},
  18:{id:'PIT_FUNNEL',label:'EMBUDO DE FOSA',effect:'vortex',telegraph:.92,active:2.45,cool:[10.0,13.0],advanced:true},
  19:{id:'RAZOR_NET',label:'MALLA RAZOR',effect:'conduct',telegraph:.82,active:2.40,cool:[9.4,12.2],advanced:true},
  20:{id:'ROYAL_ENCIRCLEMENT',label:'CERCO IMPERIAL',effect:'command',telegraph:.80,active:2.55,cool:[8.8,11.8],advanced:true}
};
function familyComboPlay(sector=G?.sector||1){return FAMILY_COMBO_PLAYS[Math.max(1,Math.round(sector))]||null;}
IMG.ch2EnemyAnim={};
for(const [family,def] of Object.entries(CH2_FAMILY_DEFS)){
  const root=`assets_ch2/enemies/w${def.world}`,reg=streamReg(def.world);IMG.worldEnemies[family]=[];WORLD_ENEMY_FILES[family]=[];
  for(const tier of ['minor','medium','major']){const im=new Image(),src=`${root}/${tier}.png?av=2157`;IMG.worldEnemies[family].push(im);WORLD_ENEMY_FILES[family].push(src);reg.enemy.push({img:im,src,tag:`w${def.world}:${tier}-base`});}
  const bossBase=new Image(),bossBaseSrc=`assets_ch2/bosses/${def.bossKey}/base.png?av=2157`;IMG.worldEnemies[family].push(bossBase);WORLD_ENEMY_FILES[family].push(bossBaseSrc);reg.bossBase={img:bossBase,src:bossBaseSrc,tag:`w${def.world}:boss-base`};reg.enemy.push(reg.bossBase);
  IMG.ch2EnemyAnim[family]={};
  for(const tier of ['minor','medium','major','mini']){IMG.ch2EnemyAnim[family][tier]={};for(const st of ['idle','attack']){const im=new Image(),src=`${root}/${tier}_${st}.png?av=2157`;IMG.ch2EnemyAnim[family][tier][st]=im;reg.enemy.push({img:im,src,tag:`w${def.world}:${tier}-${st}`});}}
}

IMG.tiers.src='assets/generated/enemy_tiers_atlas.png';
for(let row=0;row<3;row++)for(let col=0;col<6;col++){const im=new Image();im.src=`assets/enemies/enemy_r${row}_c${col}.png`;IMG.enemyCells[row][col]=im;}
for(const pack of ['rust','toxic','rift'])for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/${pack}_${String(i).padStart(2,'0')}.png`;IMG.generatedObstacles[pack].push(im);}
for(let i=1;i<=12;i++){const im=new Image();im.src=`assets/generated/ship_${String(i).padStart(2,'0')}.png`;IMG.generatedShips.push(im);}
const POWER_ASSET_ORDER=['twin','tesla','missile','rail','cryo','acid','shield','magnet','drone','overdrive','gravity','heal','credit'];
POWER_ASSET_ORDER.forEach((key,i)=>{const im=new Image();im.src=`assets/generated/power_${String(i+1).padStart(2,'0')}.png`;IMG.generatedPowers[key]=im;});
const burstAsset=new Image();burstAsset.src='assets/powers2/power_burst.png';IMG.generatedPowers.burst=burstAsset;const bombAsset=new Image();bombAsset.src='assets/powers2/power_bomb.png';IMG.generatedPowers.bomb=bombAsset;
for(const [key,file] of Object.entries({hemadrain:'hemadrain.png',resinwall:'resinwall.png',prismburst:'prismburst.png',resonance:'resonance.png'})){const im=new Image();im.src=`assets/worlds7_10/powers/${file}`;IMG.generatedPowers[key]=im;}
for(const [key,file] of Object.entries({phase:'phase_lance.png',nanites:'nanite_swarm.png',riftmine:'rift_mine.png',echo:'temporal_echo.png',nova:'entomic_nova.png',ionweb:'ion_web.png',orbitblade:'orbit_blades.png'})){const im=new Image();im.src=`assets/powers_hangar/${file}?av=2151`;IMG.generatedPowers[key]=im;}
const imgReady=img=>!!(img&&img.complete&&img.naturalWidth>0);
const BOSS_ANIMATIONS={
  AVISPAS:{key:'imperatrix',frameW:384,frameH:384,motion:'articulated-aerial',visualScale:1.13,states:{idle:{frames:8,cols:4,fps:7,loop:true},attack:{frames:6,cols:4,fps:11,loop:false},hurt:{frames:4,cols:4,fps:13,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}},
  ESCARABAJOS:{key:'atlas',frameW:384,frameH:384,motion:'heavy',visualScale:1.08,states:{idle:{frames:8,cols:4,fps:8,loop:true},attack:{frames:6,cols:4,fps:11,loop:false},hurt:{frames:4,cols:4,fps:14,loop:false},phase:{frames:8,cols:4,fps:9,loop:false},death:{frames:10,cols:4,fps:8,loop:false}}},
  MANTIS:{key:'cortex',frameW:384,frameH:384,motion:'blade-articulated',visualScale:1.10,states:{idle:{frames:8,cols:4,fps:8,loop:true},attack:{frames:6,cols:4,fps:13,loop:false},hurt:{frames:4,cols:4,fps:15,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}},
  POLILLAS:{key:'vela',frameW:384,frameH:384,motion:'flutter-organic',visualScale:1.12,states:{idle:{frames:8,cols:4,fps:9,loop:true},attack:{frames:6,cols:4,fps:12,loop:false},hurt:{frames:4,cols:4,fps:14,loop:false},phase:{frames:8,cols:4,fps:9,loop:false},death:{frames:10,cols:4,fps:8,loop:false}}},
  HORMIGAS:{key:'regina',frameW:384,frameH:384,motion:'fortress-articulated',visualScale:1.10,states:{idle:{frames:8,cols:4,fps:7,loop:true},attack:{frames:6,cols:4,fps:10,loop:false},hurt:{frames:4,cols:4,fps:13,loop:false},phase:{frames:8,cols:4,fps:8,loop:false},death:{frames:10,cols:4,fps:8,loop:false}}},
  LANGOSTAS:{key:'colossus',frameW:384,frameH:384,motion:'kinetic-compression',visualScale:1.18,states:{idle:{frames:8,cols:4,fps:7,loop:true},attack:{frames:6,cols:4,fps:11,loop:false},hurt:{frames:4,cols:4,fps:13,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}},
  MOSQUITOS:{key:'sanguina',frameW:384,frameH:384,motion:'vascular-organic',visualScale:1.21,states:{idle:{frames:8,cols:4,fps:8,loop:true},attack:{frames:6,cols:4,fps:12,loop:false},hurt:{frames:4,cols:4,fps:14,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}},
  TERMITAS:{key:'architect',frameW:384,frameH:384,motion:'modular-siege',visualScale:1.20,states:{idle:{frames:8,cols:4,fps:7,loop:true},attack:{frames:6,cols:4,fps:10,loop:false},hurt:{frames:4,cols:4,fps:13,loop:false},phase:{frames:8,cols:4,fps:9,loop:false},death:{frames:10,cols:4,fps:8,loop:false}}},
  'LIBÉLULAS':{key:'auralis',frameW:384,frameH:384,motion:'prismatic-interceptor',visualScale:1.24,states:{idle:{frames:8,cols:4,fps:9,loop:true},attack:{frames:6,cols:4,fps:13,loop:false},hurt:{frames:4,cols:4,fps:15,loop:false},phase:{frames:8,cols:4,fps:11,loop:false},death:{frames:10,cols:4,fps:10,loop:false}}},
  CIGARRAS:{key:'resonator',frameW:384,frameH:384,motion:'cathedral-resonance',visualScale:1.24,states:{idle:{frames:8,cols:4,fps:8,loop:true},attack:{frames:6,cols:4,fps:11,loop:false},hurt:{frames:4,cols:4,fps:14,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}}
};
// v2.15.0 · bosses CH2 — cinco estados animados compatibles con el motor actual
for(const [family,def] of Object.entries(CH2_FAMILY_DEFS)){
  const motion={11:'cosmic-scarab',12:'venom-lancer',13:'mandible-crusher',14:'luminous-beacon',15:'caustic-pressure',16:'atlas-veil',17:'mirage-phasmid',18:'antlion-vortex',19:'earwig-plasma',20:'royal-apiary'}[def.world],reg=streamReg(def.world);
  BOSS_ANIMATIONS[family]={key:def.bossKey,frameW:384,frameH:384,motion,visualScale:def.world===16?1.27:def.world===20?1.24:1.20,states:{idle:{frames:8,cols:4,fps:8,loop:true},attack:{frames:6,cols:4,fps:12,loop:false},hurt:{frames:4,cols:4,fps:14,loop:false},phase:{frames:8,cols:4,fps:10,loop:false},death:{frames:10,cols:4,fps:9,loop:false}}};
  const pack={idle:new Image(),attack:new Image(),hurt:new Image(),phase:new Image(),death:new Image()};IMG.bossAnim[def.bossKey]=pack;
  for(const st of Object.keys(pack)){const im=pack[st],src=`assets_ch2/bosses/${def.bossKey}/${st}.png?av=2157`;im._streamError=()=>bossAssetFault(def.bossKey,st,im.src||src);reg.boss.push({img:im,src,tag:`w${def.world}:boss-${st}`});}
}

function streamLoadCore(world,reason='sector'){const r=CH2_STREAM_REGISTRY[world];if(!r)return 0;let n=0;n+=streamEntriesLoad([r.ante]);n+=streamEntriesLoad(r.enemy);r.coreLoaded=true;ASSET_STREAM.lastReason=reason;return n;}
function streamLoadBoss(world,reason='boss'){const r=CH2_STREAM_REGISTRY[world];if(!r)return 0;let n=0;n+=streamEntriesLoad([r.bossBg,r.bossBase]);n+=streamEntriesLoad(r.boss);r.bossLoaded=true;ASSET_STREAM.lastReason=reason;return n;}
function streamEvictWorld(world){const r=CH2_STREAM_REGISTRY[world];if(!r)return 0;let n=0;n+=streamEntriesDrop([r.ante,r.bossBg]);n+=streamEntriesDrop(r.enemy);n+=streamEntriesDrop(r.boss);r.coreLoaded=false;r.bossLoaded=false;return n;}
function streamKeepSet(current,includeNext=true){const keep=new Set();if(current>=11&&current<=20)keep.add(current);if(includeNext&&current>=11&&current<20)keep.add(current+1);if(G?.riftAlly?.sector>=11)keep.add(G.riftAlly.sector);return keep;}
function streamTrim(current,includeNext=true){const keep=streamKeepSet(current,includeNext);for(let w=11;w<=20;w++)if(!keep.has(w)&&(CH2_STREAM_REGISTRY[w]?.coreLoaded||CH2_STREAM_REGISTRY[w]?.bossLoaded))streamEvictWorld(w);}
function streamSchedule(fn,key,delay=700){if(ASSET_STREAM.scheduled.has(key))return;ASSET_STREAM.scheduled.add(key);const run=()=>{ASSET_STREAM.scheduled.delete(key);fn();};if(typeof requestIdleCallback==='function')requestIdleCallback(run,{timeout:delay+700});else setTimeout(run,delay);}
function streamPrepareWorld(world,reason='sector'){ASSET_STREAM.currentWorld=world;if(world<11||world>20){for(let w=11;w<=20;w++)if(CH2_STREAM_REGISTRY[w]?.coreLoaded||CH2_STREAM_REGISTRY[w]?.bossLoaded)streamEvictWorld(w);ASSET_STREAM.lastReason='chapter1';return;}ASSET_STREAM.currentWorld=world;const preloadNext=DEVICE.class!=='LITE'&&PERF.tier!=='RECOVERY';streamLoadCore(world,reason);streamTrim(world,preloadNext);if(preloadNext&&world<20){ASSET_STREAM.prefetches++;streamSchedule(()=>{if(ASSET_STREAM.currentWorld===world)streamLoadCore(world+1,'next-prefetch');},`core:${world+1}`,DEVICE.class==='HIGH'?280:780);}}
function streamPrepareBoss(world,reason='boss'){if(world<11||world>20)return;streamLoadCore(world,reason);streamLoadBoss(world,reason);}
function streamPrepareMenu(world){ASSET_STREAM.menuWorld=world;if(world<11||world>20){if(!G||G.screen!=='GAME')for(let w=11;w<=20;w++)if(CH2_STREAM_REGISTRY[w]?.coreLoaded||CH2_STREAM_REGISTRY[w]?.bossLoaded)streamEvictWorld(w);ASSET_STREAM.lastReason='menu-chapter1';return;}ASSET_STREAM.menuWorld=world;const r=CH2_STREAM_REGISTRY[world];streamEntriesLoad([r.ante,r.bossBase]);ASSET_STREAM.lastReason='menu';}
function streamStatus(){const worlds={};for(let w=11;w<=20;w++){const r=CH2_STREAM_REGISTRY[w],core=(r.enemy||[]).filter(e=>e?.img?._streamSrc).length+(r.ante?.img?._streamSrc?1:0),boss=(r.boss||[]).filter(e=>e?.img?._streamSrc).length+(r.bossBg?.img?._streamSrc?1:0);if(core||boss)worlds[w]={core,boss,coreLoaded:!!r.coreLoaded,bossLoaded:!!r.bossLoaded};}return {enabled:ASSET_STREAM.enabled,device:DEVICE.class,currentWorld:ASSET_STREAM.currentWorld,menuWorld:ASSET_STREAM.menuWorld,loads:ASSET_STREAM.loads,evictions:ASSET_STREAM.evictions,failures:ASSET_STREAM.failures,prefetches:ASSET_STREAM.prefetches,lastReason:ASSET_STREAM.lastReason,resident:worlds};}

function bossAnimConfig(e){return e?BOSS_ANIMATIONS[e.family]||null:null;}
function bossAnimated(e){const cfg=bossAnimConfig(e),pack=cfg&&IMG.bossAnim?.[cfg.key];return !!(cfg&&pack&&imgReady(pack.idle));}

// v2.15.10 · ANIMATION ↔ ATTACK SYNC
// Cada ataque de boss dispone de una línea temporal explícita. Los ataques con telegraph
// recorren frames de preparación hasta el frame de liberación; el daño/proyectil nace
// exactamente al alcanzar ese frame y la hoja continúa con follow-through. Los ataques
// instantáneos comienzan directamente en el frame emisor. No cambia daño, cadencia ni HP.
const BOSS_ANIM_SYNC_PROFILES={
  1:{releaseFrame:3,emitter:[-.46,-.04]},2:{releaseFrame:3,emitter:[-.38,.02]},3:{releaseFrame:3,emitter:[-.52,.00]},4:{releaseFrame:3,emitter:[-.18,.04]},5:{releaseFrame:3,emitter:[-.34,.08]},
  6:{releaseFrame:3,emitter:[-.30,.06]},7:{releaseFrame:3,emitter:[-.18,.38]},8:{releaseFrame:3,emitter:[-.34,.12]},9:{releaseFrame:3,emitter:[-.46,.08]},10:{releaseFrame:3,emitter:[-.12,-.28]},
  11:{releaseFrame:3,emitter:[-.12,-.08],label:'orb-reactor'},12:{releaseFrame:3,emitter:[-.62,.06],label:'venom-lance'},13:{releaseFrame:3,emitter:[-.48,.00],label:'mandibles'},14:{releaseFrame:3,emitter:[.18,.18],label:'lantern-abdomen'},15:{releaseFrame:3,emitter:[-.38,.20],label:'caustic-nozzle'},
  16:{releaseFrame:3,emitter:[-.12,.04],label:'veil-core'},17:{releaseFrame:3,emitter:[-.46,-.03],label:'crystal-blade'},18:{releaseFrame:3,emitter:[-.40,.08],label:'vortex-maw'},19:{releaseFrame:3,emitter:[.20,.02],label:'electro-forceps'},20:{releaseFrame:3,emitter:[-.42,.10],label:'royal-stinger'}
};
function bossEntitySector(e){if(!e)return G?.sector||1;if(e===G?.boss)return G?.sector||1;if(e.kind==='riftAlly')return e.sector||G?.sector||1;if(e.kind==='lieutenant')return e.lieutenantSector||G?.sector||1;return e.sector||G?.sector||1;}
function bossAnimSyncProfile(e){const world=clamp(Math.round(bossEntitySector(e)),1,20),cfg=bossAnimConfig(e),attack=cfg?.states?.attack;return BOSS_ANIM_SYNC_PROFILES[world]||{releaseFrame:Math.min(3,Math.max(0,(attack?.frames||6)-1)),emitter:[-.36,0]};}
function bossAttackEmitter(e,kind='primary'){const p=bossAnimSyncProfile(e),r=e?.r||1,xy=p.emitter||[-.36,0];let x=(e?.x||0)+r*xy[0],y=(e?.y||0)+r*xy[1];if(kind==='upper')y-=r*.25;else if(kind==='lower')y+=r*.25;return {x,y,label:p.label||kind};}
function startBossAnimCue(e,state='attack',opts={}){const st=bossAnimConfig(e)?.states?.[state];if(!e||!st)return null;const prof=bossAnimSyncProfile(e),frames=Math.max(1,st.frames||1),releaseFrame=clamp(Math.round(opts.releaseFrame??prof.releaseFrame??Math.floor((frames-1)*.55)),0,frames-1),duration=Math.max(.08,Number(opts.duration??(state==='phase'?.8:.46))),releaseAt=clamp(Number(opts.releaseAt??duration*.45),0,duration),startFrame=clamp(Math.round(opts.startFrame??0),0,releaseFrame),elapsed=clamp(Number(opts.elapsed??0),0,duration);e.animCue={state,elapsed,duration,releaseAt,releaseFrame,startFrame,tag:opts.tag||'',released:!!opts.released,releaseFxDone:false,audioReleaseDone:false};if(state==='attack')e.animAttackT=Math.max(e.animAttackT||0,duration-elapsed);return e.animCue;}
function updateBossAnimCue(e,dt){const q=e?.animCue;if(!q)return;if(e.dying&&q.state!=='death'){e.animCue=null;return;}const before=q.elapsed;q.elapsed=Math.min(q.duration,q.elapsed+Math.max(0,dt||0));if(q.state==='phase'&&!q.audioReleaseDone&&before<q.releaseAt&&q.elapsed>=q.releaseAt){q.audioReleaseDone=true;AudioX.bossAttack(Math.max(0,bossEntitySector(e)-1),true);}if(q.elapsed>=q.duration-.0001)e.animCue=null;}
function bossAnimCueFrame(e,state){const q=e?.animCue,st=bossAnimConfig(e)?.states?.[state];if(!q||q.state!==state||!st)return null;const n=Math.max(1,st.frames),rf=clamp(q.releaseFrame,0,n-1),sf=clamp(q.startFrame,0,rf),pre=q.releaseAt,post=Math.max(.001,q.duration-pre);let f;if(pre>0&&q.elapsed<pre){const t=clamp(q.elapsed/pre,0,1),ease=1-Math.pow(1-t,1.35);f=Math.round(lerp(sf,rf,ease));}else{const t=clamp((q.elapsed-pre)/post,0,1),ease=1-Math.pow(1-t,1.15);f=Math.round(lerp(rf,n-1,ease));}return clamp(f,0,n-1);}
function bossAnimReleaseCue(e,withFx=true){if(!e)return null;let q=e.animCue;if(!q||q.state!=='attack'){const prof=bossAnimSyncProfile(e);q=startBossAnimCue(e,'attack',{duration:.34,releaseAt:0,startFrame:prof.releaseFrame,releaseFrame:prof.releaseFrame,released:true,tag:'impact'});}else{q.elapsed=q.releaseAt;q.released=true;}const o=bossAttackEmitter(e,q?.tag||'attack');if(withFx&&q&&!q.releaseFxDone&&G?.particles){q.releaseFxDone=true;const sec=SECTORS[clamp(bossEntitySector(e)-1,0,SECTORS.length-1)],col=(CH2_BOSS_IDENTITIES?.[bossEntitySector(e)]?.color)||sec?.accent||'#fff';G.particles.push({kind:'orb',x:o.x,y:o.y,r:5,life:.18,max:.18,col});G.particles.push({kind:'ring',x:o.x,y:o.y,r:6,vr:150,life:.20,max:.20,col});}return o;}
function bossAnimImpactCue(e,d=.42,tag='primary'){if(!e||!bossAnimConfig(e))return;const current=e.animCue;if(current?.state==='phase')return;if(current?.state==='attack'&&current.tag==='signature'&&current.elapsed<current.duration)return;const prof=bossAnimSyncProfile(e),dur=Math.max(.24,d);startBossAnimCue(e,'attack',{duration:dur,releaseAt:0,startFrame:prof.releaseFrame,releaseFrame:prof.releaseFrame,released:true,tag});bossAnimReleaseCue(e,true);if(e===G?.boss||e?.kind==='riftAlly')AudioX.bossAttack(Math.max(0,bossEntitySector(e)-1),false);}
function bossAnimStartSignatureCue(e,cfg,label='signature'){if(!e||!cfg)return;const tail=clamp((cfg.active||1)*.16,.24,.42);startBossAnimCue(e,'attack',{duration:(cfg.wind||.8)+tail,releaseAt:cfg.wind||.8,startFrame:0,tag:'signature'});e.animCue.label=label;}
function bossAnimState(e,preview=false){
  if(preview)return 'idle';
  if(e.dying)return 'death';
  if(e.animCue?.state==='phase'||(e.phaseTransitionT||0)>0||(e.phaseFlash||0)>.22)return 'phase';
  if((e.flash||0)>.015||(G?.boss===e&&(G.bossHitT||0)>.08))return 'hurt';
  if(e.animCue?.state==='attack')return 'attack';
  if((e.animAttackT||0)>0||(e.telegraphT||0)>0||(e.specialT||0)>0||(e.chargeT||0)>0)return 'attack';
  return 'idle';
}
function bossAnimFrame(e,state,preview=false){
  const cfg=bossAnimConfig(e)?.states?.[state];if(!cfg)return 0;const n=cfg.frames;if(preview||state==='idle')return Math.floor(((e?.t??G?.elapsed) || performance.now()/1000)*cfg.fps)%n;
  const cueFrame=bossAnimCueFrame(e,state);if(cueFrame!==null)return cueFrame;
  let progress=0;
  if(state==='death')progress=clamp(1-(e.deathT||0)/BOSS_STANDARD.deathDuration,0,1);
  else if(state==='hurt')progress=clamp(1-(G?.boss===e?(G.bossHitT||0)/.32:(e.flash||0)/.08),0,1);
  else if(state==='phase'){const dur=Math.max(.001,bossDefenseProfile(G?.sector||1).phaseLock||BOSS_STANDARD.phaseLock);progress=clamp(1-(e.phaseTransitionT||0)/dur,0,1);if((e.phaseTransitionT||0)<=0)progress=clamp(1-(e.phaseFlash||0),0,1);}
  else if(state==='attack'){const active=Math.max(e.animAttackT||0,e.telegraphT||0,e.specialT||0,e.chargeT||0),span=Math.max(.46,active+0.30);progress=clamp(1-active/span,0,1);}
  return Math.min(n-1,Math.floor(progress*(n-1)));
}
function drawBossAnimated(e,maxW,maxH,preview=false){
  const anim=bossAnimConfig(e);if(!anim||!bossAnimated(e))return false;const state=bossAnimState(e,preview),img=IMG.bossAnim[anim.key][state],cfg=anim.states[state];if(!imgReady(img)){if(img?.complete&&!img?.naturalWidth)bossAssetFault(anim.key,state,img?.src||'');return false;}
  const frame=bossAnimFrame(e,state,preview),col=frame%cfg.cols,row=Math.floor(frame/cfg.cols),fw=anim.frameW,fh=anim.frameH;
  const vs=anim.visualScale||1,sc=Math.min(maxW/fw,maxH/fh)*vs,dw=fw*sc,dh=fh*sc;cx.drawImage(img,col*fw,row*fh,fw,fh,-dw/2,-dh/2,dw,dh);return true;
}
const FAMILY_COL={AVISPAS:0,ESCARABAJOS:1,MANTIS:2,POLILLAS:3,HORMIGAS:4,LANGOSTAS:5};

// ─────────────────────────────────────────────────────────────
// AUDIO — sintetizado, offline, con firma distinta por jefe
// ─────────────────────────────────────────────────────────────
// v2.15.11 · AUDIO EVENT SYNC / BOSS SONIC IDENTITIES
// Cada jefe conserva una huella procedural propia para telegraph, release, impacto, fase, muerte y RIFT ALLY.
// No añade archivos de audio ni memoria residente: usa WebAudio bajo demanda y respeta mute.
function bossSynthBase(index=0){const bases=[52,58,46,42,64,38,55,72,49,34,44,96,41,118,57,67,83,35,126,74];return bases[index]||Math.round(42+((index*7)%31));}
const BOSS_AUDIO_PROFILES=[
  {id:'imperatrix',base:52,accent:420,type:'sawtooth',texture:'sting',grit:1200},
  {id:'atlas',base:58,accent:290,type:'triangle',texture:'armor',grit:620},
  {id:'cortex',base:46,accent:360,type:'square',texture:'click',grit:980},
  {id:'vela',base:42,accent:510,type:'sine',texture:'dust',grit:1500},
  {id:'regina',base:64,accent:620,type:'triangle',texture:'hive',grit:1700},
  {id:'colossus',base:38,accent:170,type:'sawtooth',texture:'impact',grit:430},
  {id:'sanguina',base:55,accent:330,type:'sine',texture:'siphon',grit:860},
  {id:'architect',base:72,accent:240,type:'square',texture:'resin',grit:540},
  {id:'auralis',base:49,accent:880,type:'triangle',texture:'prism',grit:2300},
  {id:'resonator',base:34,accent:190,type:'sine',texture:'resonance',grit:390},
  {id:'scarab_imperator',base:44,accent:520,type:'sine',texture:'orbital',grit:720},
  {id:'vespera_lancer',base:96,accent:760,type:'sawtooth',texture:'venom',grit:2100},
  {id:'regent_mandible',base:41,accent:250,type:'square',texture:'mandible',grit:560},
  {id:'pyrolux_beacon',base:118,accent:940,type:'triangle',texture:'lumen',grit:2600},
  {id:'caustic_alchemist',base:57,accent:310,type:'sawtooth',texture:'caustic',grit:680},
  {id:'atlas_veil',base:67,accent:710,type:'sine',texture:'veil',grit:1850},
  {id:'mirage_phasmid',base:83,accent:1040,type:'triangle',texture:'mirror',grit:2800},
  {id:'pit_emperor',base:35,accent:155,type:'sawtooth',texture:'pit',grit:360},
  {id:'auriculus_razor',base:126,accent:690,type:'square',texture:'electro',grit:2400},
  {id:'apis_imperia',base:74,accent:830,type:'triangle',texture:'hive-royal',grit:1900}
];
function bossAudioProfile(index=0){return BOSS_AUDIO_PROFILES[clamp(Math.round(index),0,BOSS_AUDIO_PROFILES.length-1)]||BOSS_AUDIO_PROFILES[0];}

// v2.15.12 · ENEMY SONIC ECOLOGY / FAMILY AUDIO GRAMMAR
// Firma procedural por familia y tier. El presupuesto acústico limita voces simultáneas para
// conservar claridad, rendimiento y prioridad de bosses/telegraphs/Última Oportunidad.
const FAMILY_AUDIO_PROFILES={
  AVISPAS:{base:142,accent:760,type:'sawtooth',texture:'sting'},
  ESCARABAJOS:{base:72,accent:250,type:'square',texture:'armor'},
  MANTIS:{base:116,accent:560,type:'triangle',texture:'blade'},
  POLILLAS:{base:164,accent:910,type:'sine',texture:'dust'},
  HORMIGAS:{base:88,accent:330,type:'square',texture:'march'},
  LANGOSTAS:{base:96,accent:470,type:'sawtooth',texture:'hop'},
  MOSQUITOS:{base:182,accent:1040,type:'sine',texture:'siphon'},
  TERMITAS:{base:80,accent:300,type:'triangle',texture:'resin'},
  'LIBÉLULAS':{base:210,accent:1280,type:'triangle',texture:'prism'},
  CIGARRAS:{base:68,accent:410,type:'sine',texture:'resonance'},
  SCARAB_IMPERATOR:{base:78,accent:620,type:'sine',texture:'orbital'},
  VESPERA_LANCERS:{base:176,accent:1180,type:'sawtooth',texture:'venom'},
  MANDIBLE_REGENTS:{base:66,accent:340,type:'square',texture:'mandible'},
  PYROLUX:{base:194,accent:1360,type:'triangle',texture:'lumen'},
  CAUSTIC:{base:92,accent:520,type:'sawtooth',texture:'caustic'},
  VEILS:{base:148,accent:990,type:'sine',texture:'veil'},
  PHASMIDS:{base:226,accent:1450,type:'triangle',texture:'mirror'},
  ANTLIONS:{base:58,accent:270,type:'sawtooth',texture:'pit'},
  AURICULUS:{base:214,accent:1120,type:'square',texture:'electro'},
  APIARY:{base:172,accent:1260,type:'triangle',texture:'hive'}
};
function familyAudioProfile(e){return FAMILY_AUDIO_PROFILES[e?.family]||FAMILY_AUDIO_PROFILES[SECTORS?.[Math.max(0,(G?.sector||1)-1)]?.family]||FAMILY_AUDIO_PROFILES.AVISPAS;}
const AudioX={
  ac:null,muted:false,bossNodes:[],lastShot:0,lastBossImpact:0,bossEventCounters:{warn:0,release:0,impact:0,phase:0,death:0,allyIn:0,allyOut:0},lastBossEvent:null,enemyEventCounters:{spawn:0,shot:0,death:0,dropped:0},lastEnemyEvent:null,enemyAudioBudget:{windowStart:0,voices:0},enemyEventAt:{spawn:0,shot:0,death:0},
  unlock(){
    if(!this.ac){try{this.ac=new (window.AudioContext||window.webkitAudioContext)();}catch(_){return;}}
    if(this.ac.state==='suspended') this.ac.resume().catch(()=>{});
  },
  tone(f=440,d=.08,v=.04,type='sine',delay=0,slide=0){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
    g.gain.setValueAtTime(Math.max(.0001,v),t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);
  },
  noise(d=.08,v=.03,filter=1500,delay=0){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const len=Math.max(1,(a.sampleRate*d)|0),buf=a.createBuffer(1,len,a.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<len;i++)data[i]=Math.random()*2-1;
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+delay;
    s.buffer=buf;f.type='lowpass';f.frequency.value=filter;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    s.connect(f);f.connect(g);g.connect(a.destination);s.start(t);
  },
  shot(){const n=performance.now();if(n-this.lastShot<38)return;this.lastShot=n;const lv=G?.level||1,burst=G&&powerOn('burst');this.tone(700+Math.min(310,lv*24),.05,burst?.033:.028,lv>=8?'sawtooth':'square',0,-210-lv*8);if(lv>=4)this.tone(1080+lv*18,.032,.011,'triangle',.008,-260);if(lv>=8&&Math.random()<.42)this.noise(.025,.009,2900,.002);},
  hit(){this.noise(.045,.025,900);},
  impact(level=1,boss=false){if(this.muted)return;const n=performance.now();if(!boss&&n-(this.lastImpact||0)<34)return;this.lastImpact=n;this.noise(boss?.06:.035,boss?.032:.016,boss?1150:1500);if(level>=6)this.tone(980+Math.min(300,level*18),.025,.008,'triangle',0,-250);},
  enemyVoiceAllowed(event='shot',e=null){
    if(this.muted)return false;const now=performance.now(),b=this.enemyAudioBudget;
    if(now-b.windowStart>250){b.windowStart=now;b.voices=0;}
    let cap=PERF?.tier==='RECOVERY'?4:PERF?.tier==='BALANCED'?6:8;
    if(G?.boss&&!G.boss.dead)cap=Math.max(3,cap-2);
    if((G?.lastChanceT||0)>0&&event!=='shot')return false;
    const priority=e?.microSwarm?0:Math.max(1,(typeof combatTier==='function'?combatTier(e):0)+1);
    const cost=priority>=3?1:priority===2?.85:.65;
    if(b.voices+cost>cap){this.enemyEventCounters.dropped++;return false;}
    b.voices+=cost;return true;
  },
  enemyEvent(e,event='shot',intensity=1){
    if(!e||e.dead&&event!=='death'||e===G?.boss||e.kind==='lieutenant'||e.kind==='riftAlly'||e.kind==='ship'||e.kind==='transversal')return;
    const now=performance.now(),micro=!!e.microSwarm,tier=micro?-1:(typeof combatTier==='function'?clamp(combatTier(e),0,2):0);
    const gap=event==='spawn'?(micro?999:95):event==='shot'?(tier>=2?58:72):(micro?105:tier>=2?62:78);
    if(now-(this.enemyEventAt[event]||0)<gap){this.enemyEventCounters.dropped++;return;}
    if(!this.enemyVoiceAllowed(event,e))return;this.enemyEventAt[event]=now;
    const p=familyAudioProfile(e),tierMul=micro?.46:[.72,.91,1.14][tier],perfMul=PERF?.tier==='RECOVERY'?.66:PERF?.tier==='BALANCED'?.82:1,bossMul=G?.boss&&!G.boss.dead?.55:1,k=clamp((Number(intensity)||1)*tierMul*perfMul*bossMul,.22,1.25);
    this.lastEnemyEvent={family:e.family,event,tier:micro?'mini':['minor','medium','major'][tier],at:now};this.enemyEventCounters[event]=(this.enemyEventCounters[event]||0)+1;
    if(event==='spawn'){
      this.tone(p.base*1.35,.075,.010*k,p.type,0,p.accent*.10);
      if(tier>=1)this.tone(p.accent*.58,.055,.006*k,'triangle',.018,p.accent*.08);
    }else if(event==='shot'){
      this.tone(p.accent*(tier===2?.88:tier===1?1:1.12),tier===2?.085:.055,.014*k,p.type,0,(p.texture==='pit'||p.texture==='mandible')?-p.accent*.22:p.accent*.10);
      if(['venom','sting','caustic','blade','mandible','electro'].includes(p.texture))this.noise(.038,.008*k,Math.max(500,p.accent*1.45),.004);
      if(['lumen','prism','mirror','veil','orbital','resonance'].includes(p.texture)&&tier>=1)this.tone(p.accent*1.32,.04,.005*k,'sine',.012,-p.accent*.18);
    }else if(event==='death'){
      this.tone(Math.max(34,p.base*(micro?.95:1.15+tier*.18)),micro?.055:.09,.011*k,tier>=2?'sawtooth':'triangle',0,-Math.max(18,p.base*.42));
      this.noise(micro?.035:.055,.0065*k,Math.max(300,p.accent*(micro?.75:.92)),.002);
      if(tier===2)this.tone(p.accent*.42,.08,.005*k,'sine',.018,-p.accent*.12);
    }
  },
  enemySpawn(e){if(!e?.microSwarm)this.enemyEvent(e,'spawn',1);},
  enemyShot(e){this.enemyEvent(e,'shot',1);},
  enemyDeath(e){this.enemyEvent(e,'death',1);},
  enemyAudioStatus(){return {profiles:Object.keys(FAMILY_AUDIO_PROFILES).length,counters:{...this.enemyEventCounters},lastEvent:this.lastEnemyEvent,budget:{...this.enemyAudioBudget},tier:PERF?.tier||'FULL'};},
  bossEvent(index=0,event='release',intensity=1){
    index=clamp(Math.round(index),0,19);const p=bossAudioProfile(index),k=clamp(Number(intensity)||1,.45,1.65),now=performance.now();
    this.lastBossEvent={index,world:index+1,id:p.id,event,at:now};this.bossEventCounters[event]=(this.bossEventCounters[event]||0)+1;
    if(event==='impact'&&now-this.lastBossImpact<70)return; if(event==='impact')this.lastBossImpact=now;
    if(this.muted)return;
    if(event==='warn'){
      this.tone(p.base*2.0,.18,.025*k,p.type,0,p.base*2.8);this.tone(p.accent*.62,.16,.018*k,'triangle',.075,p.accent*.24);
      if(['venom','mandible','pit','impact','caustic'].includes(p.texture))this.noise(.13,.018*k,p.grit,.035);
      else if(['orbital','veil','mirror','lumen','prism','resonance'].includes(p.texture))this.tone(p.accent*1.22,.12,.012*k,'sine',.12,-p.accent*.18);
    }else if(event==='release'){
      this.tone(p.accent,.085,.034*k,p.type,0,p.texture==='pit'||p.texture==='impact'?-p.accent*.35:p.accent*.22);
      this.tone(Math.max(70,p.base*3.1),.105,.018*k,'triangle',.012,p.accent*.15);
      if(['sting','venom','mandible','caustic','electro','impact','pit'].includes(p.texture))this.noise(.085,.024*k,p.grit,.006);
      if(p.texture==='electro')this.tone(p.accent*1.62,.055,.018*k,'square',.025,-p.accent*.55);
      if(p.texture==='hive-royal'||p.texture==='hive')this.tone(p.accent*1.5,.07,.014*k,'triangle',.035,p.accent*.16);
    }else if(event==='impact'){
      this.noise(.055,.026*k,Math.max(280,p.grit*.62));this.tone(Math.max(36,p.base*1.35),.075,.026*k,'sine',0,-p.base*.38);
      if(['prism','mirror','lumen','electro'].includes(p.texture))this.tone(p.accent*1.28,.038,.010*k,'triangle',.012,-p.accent*.42);
    }else if(event==='phase'){
      [1,1.48,2.05].forEach((m,i)=>this.tone(Math.max(40,p.base*3.2*m),.18,.027*k,i===2?p.type:'triangle',i*.075,p.accent*.18));
      this.noise(.20,.020*k,Math.max(320,p.grit*.75),.035);
      if(['orbital','resonance','hive-royal','veil'].includes(p.texture))this.tone(p.accent,.32,.014*k,'sine',.08,p.accent*.32);
    }else if(event==='death'){
      this.stopBoss();for(let i=0;i<6;i++){this.noise(.17,.033*k,Math.max(260,p.grit-i*95),i*.055);this.tone(Math.max(28,p.accent*.42-i*p.accent*.047),.21,.026*k,i%2?p.type:'sine',i*.06,-Math.max(18,p.base*.8));}
      this.tone(Math.max(24,p.base*.62),.48,.030*k,'sine',.26,-Math.max(12,p.base*.25));
    }else if(event==='allyIn'){
      this.tone(p.base*4.2,.14,.020*k,'sine',0,p.accent*.55);this.tone(p.accent*1.18,.18,.023*k,'triangle',.07,p.accent*.32);this.noise(.14,.012*k,2100,.03);
    }else if(event==='allyOut'){
      this.tone(p.accent*1.12,.14,.019*k,'triangle',0,-p.accent*.48);this.tone(Math.max(45,p.base*2.5),.18,.016*k,'sine',.07,-p.base*.9);this.noise(.10,.010*k,1200,.025);
    }
  },
  bossAttack(index=0,heavy=false){this.bossEvent(index,'release',heavy?1.25:1);},
  bossImpact(index=0,intensity=1){this.bossEvent(index,'impact',intensity);},
  pickup(){[560,760,980].forEach((f,i)=>this.tone(f,.09,.045,'sine',i*.045,80));},
  queue(){this.tone(640,.07,.04,'triangle');this.tone(880,.07,.032,'triangle',.05,80);},
  power(key){
    const map={
      twin:[420,.09,.05,'triangle',120],tesla:[680,.12,.05,'sawtooth',-120],missile:[190,.15,.05,'square',280],rail:[860,.12,.04,'square',-380],
      cryo:[520,.15,.05,'sine',-140],acid:[250,.16,.05,'sawtooth',70],shield:[360,.18,.05,'sine',120],magnet:[430,.14,.04,'triangle',-80],
      drone:[600,.1,.04,'square',0],overdrive:[780,.1,.04,'sawtooth',220],gravity:[180,.18,.055,'sine',-20],bomb:[120,.22,.08,'sawtooth',-35],burst:[705,.12,.05,'triangle',160],hemadrain:[155,.18,.055,'sine',120],resinwall:[310,.2,.05,'triangle',-80],prismburst:[980,.1,.045,'sawtooth',260],resonance:[220,.22,.06,'sine',40],sparklaser:[1180,.09,.042,'sawtooth',-260],bio:[285,.16,.05,'triangle',-90]
    }[key];
    if(!map){this.pickup();return;}
    this.tone(map[0],map[1],map[2],map[3],0,map[4]);
    if(key==='bomb')this.noise(.28,.06,420,.03);
    else if(key==='tesla')this.noise(.08,.035,1600,.02);
    else if(key==='gravity')this.noise(.14,.03,300,.04);
    else if(key==='burst')this.noise(.06,.02,1800,.01);
    else if(key==='hemadrain')this.tone(220,.18,.025,'sine',.04,-60);
    else if(key==='resinwall')this.noise(.12,.025,520,.02);
    else if(key==='prismburst')this.tone(1420,.06,.018,'triangle',.03,-380);
    else if(key==='resonance')this.noise(.16,.025,420,.02);
    else if(key==='sparklaser'){this.noise(.07,.025,2100,.01);this.tone(1460,.06,.018,'triangle',.025,-420);}
    else if(key==='bio'){this.noise(.12,.022,520,.02);this.tone(190,.16,.02,'sine',.03,85);}
  },
  droneShot(powered=false){
    this.tone(powered?880:640,.04,powered?.03:.022,powered?'sawtooth':'triangle',0,powered?180:60);
    if(powered)this.noise(.03,.012,2200,.01);
  },
  sparkLaser(){
    this.tone(1180,.05,.028,'square',0,-320);this.noise(.04,.018,2600,.005);
  },
  incoming(kind='meteor'){
    const cfg={meteor:[250,610,'triangle'],rammer:[390,820,'sawtooth'],wreck:[175,430,'square'],pod:[520,980,'triangle']}[kind]||[310,620,'triangle'];
    this.tone(cfg[0],.15,.038,cfg[2],0,420);this.tone(cfg[1],.1,.027,'square',.08,-180);if(kind==='wreck')this.noise(.12,.022,520,.02);if(kind==='rammer')this.noise(.06,.018,1800,.04);
  },
  hurt(){this.tone(110,.16,.08,'sawtooth',0,-35);this.noise(.1,.04,500);},
  dash(){this.noise(.14,.045,2400);this.tone(260,.15,.05,'sawtooth',0,620);},
  buy(){[320,470,690].forEach((f,i)=>this.tone(f,.12,.05,'triangle',i*.05,80));},
  deny(){this.tone(130,.16,.06,'square');},
  pause(){this.tone(420,.06,.035,'sine');this.tone(300,.09,.03,'sine',.05);},
  bossIntro(index){
    this.stopBoss();const base=bossSynthBase(index);
    for(let i=0;i<5;i++)this.tone(base*(1+i*.5),.5,.045,'sawtooth',i*.12,-base*.1);
    this.noise(.8,.045,260,.15);
    if(!(battleTrackForSector(index+1)?.src&&MusicX.enabled))this.startBoss(base,index);
  },
  startBoss(base,index){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;
    const o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o.type=index%3===0?'sawtooth':index%3===1?'triangle':'square';o.frequency.value=base;
    g.gain.value=.012;lfo.frequency.value=.35+(index*.045);lg.gain.value=base*.08;
    lfo.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(a.destination);o.start();lfo.start();this.bossNodes=[o,g,lfo,lg];
  },
  startPreBoss(index=0){
    if(this.muted)return;this.unlock();const a=this.ac;if(!a)return;this.stopBoss();
    const base=[82,94,106,118,88,102,76,92,126,72][index]||88,o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o.type='sine';o.frequency.value=base;g.gain.value=.010;lfo.frequency.value=.18+(index%4)*.035;lg.gain.value=base*.035;lfo.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(a.destination);o.start();lfo.start();this.bossNodes=[o,g,lfo,lg];
  },
  stopBoss(){for(const n of this.bossNodes){try{if(n.stop)n.stop();}catch(_){}}this.bossNodes=[];},
  bossDie(index=Math.max(0,(G?.sector||1)-1)){this.bossEvent(index,'death',1.18);},
  bossWarn(index=0){this.bossEvent(index,'warn',1);},
  bossPhase(index=0){this.bossEvent(index,'phase',1.12);},
  toggle(){this.muted=!this.muted;if(this.muted)this.stopBoss();audioBtn.textContent=this.muted?'🔇':'🔊';saveMeta();}
};

// ─────────────────────────────────────────────────────────────
// AMBIENTE DE MUNDO — estas piezas suenan durante TODO el recorrido jugable antes del jefe.
// La antesala visual final reutiliza el mismo ambiente y solo prepara el cambio al soundtrack del boss.
// v2.12.1.4 · aproximación final fija de 3 s; conserva audio y transición al soundtrack del jefe.
const PREBOSS_DURATION=3.0;
// v2.13.7 · PLAYLIST AMBIENTAL POR MUNDO (conservada desde v2.13.6)
// Cada mundo rota 3 pasajes compatibles; nunca repite inmediatamente el mismo pasaje.
const WORLD_PLAYLISTS={
  1:[
    {src:'assets/ambient/preboss_01_rust.mp3',start:0,end:44,volume:.42,label:'Rust Canyon · Marcha del corredor'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:0,end:12,volume:.36,label:'Rust Canyon · Variante de tensión'},
    {src:'assets/ambient/preboss_03_rift.mp3',start:8,end:29,volume:.33,label:'Rust Canyon · Deriva de chatarra'}],
  2:[
    {src:'assets/ambient/preboss_02_toxic.mp3',start:0,end:67.8,volume:.31,label:'Toxic Ravine · Pulso tóxico'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:12,end:24,volume:.35,label:'Toxic Ravine · Variante blindada'},
    {src:'assets/ambient/preboss_04_nocturne.mp3',start:24,end:45,volume:.34,label:'Toxic Ravine · Bruma profunda'}],
  3:[
    {src:'assets/ambient/preboss_03_rift.mp3',start:8,end:109.5,volume:.35,label:'Rift Tunnel · Deriva orbital'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:24,end:36,volume:.36,label:'Rift Tunnel · Corte alterno'},
    {src:'assets/ambient/preboss_01_rust.mp3',start:14,end:36,volume:.36,label:'Rift Tunnel · Propulsión roja'}],
  4:[
    {src:'assets/ambient/preboss_04_nocturne.mp3',start:12,end:88.4,volume:.43,label:'Nocturne · Polen nocturno'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:36,end:48,volume:.35,label:'Nocturne · Cámara alterna'},
    {src:'assets/ambient/preboss_10_resonance.mp3',start:18,end:42,volume:.35,label:'Nocturne · Eco astral'}],
  5:[
    {src:'assets/ambient/preboss_block2_05_08.mp3',start:0,end:19,volume:.29,label:'Iron Nest · Colonia ferrum'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:0,end:12,volume:.34,label:'Iron Nest · Marcha alternativa'},
    {src:'assets/ambient/preboss_03_rift.mp3',start:65,end:89,volume:.32,label:'Iron Nest · Corredor industrial'}],
  6:[
    {src:'assets/ambient/preboss_block2_05_08.mp3',start:19,end:38,volume:.29,label:'Emerald Delta · Salto cinético'},
    {src:'assets/ambient/preboss_02_toxic.mp3',start:25,end:49,volume:.30,label:'Emerald Delta · Biomasa profunda'},
    {src:'assets/ambient/preboss_09_odonata.mp3',start:8,end:31,volume:.32,label:'Emerald Delta · Impulso aéreo'}],
  7:[
    {src:'assets/ambient/preboss_block2_05_08.mp3',start:38,end:57,volume:.29,label:'Bloodmist · Pulso hemático'},
    {src:'assets/ambient/preboss_04_nocturne.mp3',start:42,end:66,volume:.35,label:'Bloodmist · Niebla vascular'},
    {src:'assets/ambient/preboss_10_resonance.mp3',start:50,end:73,volume:.34,label:'Bloodmist · Latido profundo'}],
  8:[
    {src:'assets/ambient/preboss_block2_05_08.mp3',start:57,end:80.9,volume:.29,label:'Resin Hive · Asedio de resina'},
    {src:'assets/ambient/preboss_03_rift.mp3',start:48,end:73,volume:.32,label:'Resin Hive · Construcción orbital'},
    {src:'assets/ambient/preboss_04_nocturne.mp3',start:15,end:38,volume:.34,label:'Resin Hive · Cámara orgánica'}],
  9:[
    {src:'assets/ambient/preboss_09_odonata.mp3',start:4,end:64.7,volume:.34,label:'Odonata · Intercepción prismática'},
    {src:'assets/ambient/preboss_03_rift.mp3',start:35,end:61,volume:.33,label:'Odonata · Vector de velocidad'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:12,end:24,volume:.35,label:'Odonata · Variante de vuelo'}],
 10:[
    {src:'assets/ambient/preboss_10_resonance.mp3',start:16,end:89.2,volume:.39,label:'Resonance · Catedral viva'},
    {src:'assets/ambient/preboss_04_nocturne.mp3',start:45,end:71,volume:.36,label:'Resonance · Eco profundo'},
    {src:'assets/ambient/preboss_alt_block1.mp3',start:24,end:36,volume:.35,label:'Resonance · Contrapulso'}]
};
const WORLD_PLAY_STATE={};
function shuffledIndices(n,avoid=-1){const a=Array.from({length:n},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}if(a.length>1&&a[0]===avoid)[a[0],a[1]]=[a[1],a[0]];return a;}
function preBossTrackForSector(sector,advance=false){
  const pool=WORLD_PLAYLISTS[sector]||[];if(!pool.length)return null;let st=WORLD_PLAY_STATE[sector];
  if(!st){st=WORLD_PLAY_STATE[sector]={order:shuffledIndices(pool.length),pos:0,last:-1};}
  if(advance){st.last=st.order[st.pos]??st.last;st.pos++;if(st.pos>=st.order.length){st.order=shuffledIndices(pool.length,st.last);st.pos=0;}}
  return {...pool[st.order[st.pos]??0],playlistIndex:st.pos,playlistSize:pool.length};
}
const AUDIO_HEALTH={worldStarts:0,bossStarts:0,retries:0,failures:0,fallbacks:0,lastWorld:'',lastBoss:'',lastError:''};
const PreBossX={
  active:false,fadeId:0,targetVolume:.34,track:null,preparedSector:0,unlocked:false,lastError:'',fallbackSynth:false,retryPending:false,retryCount:0,lastRetryAt:0,mixTarget:0,playPending:false,stopping:false,switching:false,
  cancelFade(){if(this.fadeId){clearInterval(this.fadeId);this.fadeId=0;}},
  fadeTo(target,ms=650,onDone=null){
    this.cancelFade();const start=preBossMusic.volume||0,t0=performance.now();this.mixTarget=target;
    this.fadeId=setInterval(()=>{const u=Math.min(1,(performance.now()-t0)/ms);preBossMusic.volume=start+(target-start)*u;if(u>=1){this.cancelFade();if(onDone)onDone();}},32);
  },
  playing(){return this.active&&!preBossMusic.paused&&!preBossMusic.ended;},
  preload(sector,advance=false){
    const track=preBossTrackForSector(sector,advance);if(!track?.src)return null;this.track=track;this.preparedSector=sector;
    const next=track.src.split('/').pop(),current=(preBossMusic.currentSrc||preBossMusic.src||'').split('/').pop();
    if(current!==next){preBossMusic.src=track.src;preBossMusic.preload='auto';preBossMusic.playsInline=true;try{preBossMusic.load();}catch(_){}}
    return track;
  },
  seekStart(){const track=this.track;if(!track)return;const dur=Number.isFinite(preBossMusic.duration)?preBossMusic.duration:999;const start=Math.min(track.start||0,Math.max(0,dur-.25));try{if(Math.abs((preBossMusic.currentTime||0)-start)>.75)preBossMusic.currentTime=start;}catch(_){}},
  switchTrack(sector=this.preparedSector){
    if(this.switching||!this.active||!MusicX.enabled)return;this.switching=true;
    this.fadeTo(0,620,()=>{preBossMusic.pause();const track=this.preload(sector,true);this.track=track;this.seekStart();preBossMusic.volume=0;this.playPending=false;this.switching=false;this.attemptPlay(sector,false,true);});
  },
  segmentTick(){
    const t=this.track;if(!t||preBossMusic.paused||this.switching)return;const end=Number.isFinite(t.end)?t.end:(Number.isFinite(preBossMusic.duration)?preBossMusic.duration:null);
    if(end&&preBossMusic.currentTime>=end-.20)this.switchTrack(this.preparedSector);
  },
  prime(sector){
    const track=this.preload(sector);if(!track||!MusicX.enabled)return;this.seekStart();
    const oldMuted=preBossMusic.muted,oldVol=preBossMusic.volume;preBossMusic.muted=true;preBossMusic.volume=0;
    const pp=preBossMusic.play();
    if(pp&&pp.then)pp.then(()=>{preBossMusic.pause();preBossMusic.muted=oldMuted;preBossMusic.volume=oldVol;this.unlocked=true;this.lastError='';this.retryPending=false;}).catch(err=>{preBossMusic.muted=oldMuted;preBossMusic.volume=oldVol;if(err?.name==='AbortError')return;this.lastError=String(err?.name||err||'play blocked');this.retryPending=true;});
  },
  fallback(sector,reason='',quiet=false){
    this.lastError=reason||this.lastError||'audio unavailable';AUDIO_HEALTH.failures++;AUDIO_HEALTH.lastError=this.lastError;this.retryPending=true;
    if(!this.fallbackSynth){this.fallbackSynth=true;AUDIO_HEALTH.fallbacks++;AudioX.stopBoss();AudioX.startPreBoss?.(Math.max(0,sector-1));}
    if(G&&!quiet)notify('♫ AMBIENTE · REINTENTO DE AUDIO',SECTORS[sector-1]?.accent||'#8edbff',1.15);MusicX.updateButton();
  },
  onRealPlay(sector){
    if(this.fallbackSynth){AudioX.stopBoss();this.fallbackSynth=false;}this.unlocked=true;this.lastError='';this.retryPending=false;this.retryCount=0;this.playPending=false;this.stopping=false;AUDIO_HEALTH.worldStarts++;AUDIO_HEALTH.lastWorld=this.track?.label||`Sector ${sector}`;
    const base=(this.track?.volume||this.targetVolume);preBossMusic.muted=false;this.fadeTo(base,650);MusicX.updateButton();
  },
  attemptPlay(sector,fromGesture=false,quiet=false){
    if(!this.active||!MusicX.enabled||this.playPending||this.playing())return false;this.seekStart();preBossMusic.loop=false;preBossMusic.muted=false;if(preBossMusic.volume<=0)preBossMusic.volume=0;this.playPending=true;
    const pp=preBossMusic.play();
    if(pp&&pp.then)pp.then(()=>this.onRealPlay(sector)).catch(err=>{this.playPending=false;if(err?.name==='AbortError')return;this.fallback(sector,String(err?.name||err||'play blocked'),quiet);});
    else this.onRealPlay(sector);
    if(fromGesture){AUDIO_HEALTH.retries++;this.lastRetryAt=performance.now();}
    return true;
  },
  start(sector){
    const track=this.preload(sector);this.track=track;this.active=!!track?.src;this.fallbackSynth=false;this.retryPending=false;this.stopping=false;this.playPending=false;this.switching=false;if(!this.active)return;
    MusicX.cancelFade();bossMusic.pause();try{bossMusic.currentTime=0;}catch(_){}MusicX.activeBoss=false;this.seekStart();
    const begin=()=>{if(!this.active||!MusicX.enabled)return;this.attemptPlay(sector,false,true);};
    if(preBossMusic.readyState>=1)begin();else{preBossMusic.addEventListener('loadedmetadata',begin,{once:true});setTimeout(()=>{if(this.active&&preBossMusic.paused&&!this.fallbackSynth&&preBossMusic.readyState===0)this.fallback(sector,'metadata timeout',true);},2200);}
  },
  retryFromGesture(sector=G?.sector||this.preparedSector,reason='gesture'){
    if(!this.active||!MusicX.enabled||this.playing())return;if(performance.now()-this.lastRetryAt<180)return;this.retryCount++;this.lastRetryAt=performance.now();
    this.attemptPlay(sector,true,true);
  },
  updateMix(){
    if(!this.playing()||!this.track||this.stopping||G?.boss||G?.sectorClear)return;let mul=1;if(G?.frenzyT>0)mul=1.08;if(G?.preBossT>0)mul=1.14;const target=Math.min(.58,(this.track.volume||this.targetVolume)*mul);
    if(Math.abs(target-(this.mixTarget||preBossMusic.volume))>.018)this.fadeTo(target,420);
  },
  pause(){if(this.playing()){preBossMusic.pause();MusicX.updateButton();}if(this.fallbackSynth)AudioX.stopBoss();},
  resume(){if(this.active&&MusicX.enabled&&G?.screen==='GAME'&&!G?.boss&&!G?.sectorClear&&G?.mode!=='bossRush'&&G?.mode!=='training'){if(this.fallbackSynth||this.retryPending){this.retryFromGesture(G.sector,'resume');return;}const pp=preBossMusic.play();if(pp&&pp.catch)pp.catch(err=>this.fallback(G.sector,String(err?.name||err),true));this.fadeTo(this.track?.volume||this.targetVolume,300);MusicX.updateButton();}},
  stop(fade=true){
    this.retryPending=false;this.playPending=false;this.stopping=true;this.switching=false;if(this.fallbackSynth){AudioX.stopBoss();this.fallbackSynth=false;}
    if(!this.active){preBossMusic.pause();return;}
    const done=()=>{preBossMusic.pause();this.active=false;this.track=null;this.mixTarget=0;this.stopping=false;MusicX.updateButton();};
    if(fade&&!preBossMusic.paused)this.fadeTo(0,620,done);else{this.cancelFade();preBossMusic.pause();preBossMusic.volume=0;this.active=false;this.track=null;this.mixTarget=0;this.stopping=false;MusicX.updateButton();}
  }
};
preBossMusic.addEventListener('play',()=>MusicX.updateButton());
preBossMusic.addEventListener('pause',()=>MusicX.updateButton());
preBossMusic.addEventListener('timeupdate',()=>PreBossX.segmentTick());
preBossMusic.addEventListener('ended',()=>{if(PreBossX.active&&MusicX.enabled)PreBossX.switchTrack(PreBossX.preparedSector);});
preBossMusic.addEventListener('error',()=>{if(PreBossX.active)PreBossX.fallback(PreBossX.preparedSector,'media error',true);});

// Música de batalla de jefe; reemplaza el ambiente del mundo al entrar a la arena.
const MusicX={
  enabled:true,activeBoss:false,targetVolume:.38,fadeId:0,lastError:'',retryPending:false,lastRetryAt:0,preparedBossSector:0,playPending:false,uiSnapshot:null,bossPlaylist:[],bossPlaylistPos:0,currentTrack:null,lastBossTrackId:'',phaseMusicSeen:0,switchingBossTrack:false,
  updateButton(){
    if(!musicBtn)return;const playing=this.enabled&&((this.activeBoss&&!bossMusic.paused)||PreBossX.playing()||PreBossX.fallbackSynth);const state=!this.enabled?'OFF':this.activeBoss?(bossMusic.paused?'JEFE · REINTENTO':'JEFE'):(PreBossX.playing()?'AMBIENTE':PreBossX.fallbackSynth?'AMBIENTE · RESPALDO':'LISTO');
    musicBtn.classList.toggle('music-on',playing);musicBtn.classList.toggle('music-ready',this.enabled&&!playing);musicBtn.classList.toggle('music-off',!this.enabled);
    musicBtn.title=`Música ${state} · ${this.activeBoss?(this.currentTrack?.title||'Boss playlist'):(PreBossX.track?.label||'SWARM//RIFT')} · pulsa para ${this.enabled?'desconectar':'conectar'}`;
    musicBtn.setAttribute('aria-pressed',this.enabled?'true':'false');musicBtn.dataset.musicState=state;
  },
  cancelFade(){if(this.fadeId){clearInterval(this.fadeId);this.fadeId=0;}},
  fadeTo(target,ms=700,onDone=null){
    this.cancelFade();const start=bossMusic.volume||0,t0=performance.now();
    this.fadeId=setInterval(()=>{const u=Math.min(1,(performance.now()-t0)/ms);bossMusic.volume=start+(target-start)*u;if(u>=1){this.cancelFade();if(onDone)onDone();}},32);
  },
  loadBossTrack(track){
    if(!track?.src)return null;this.currentTrack=track;const next=track.src.split('/').pop(),current=(bossMusic.currentSrc||bossMusic.src||'').split('/').pop();
    if(current!==next){bossMusic.src=track.src;bossMusic.preload='auto';bossMusic.playsInline=true;try{bossMusic.load();}catch(_){}}return track;
  },
  prepareBossPlaylist(sector){
    let pool=bossPlaylistForSector(sector);if(pool.length>1&&pool[0]?.id===this.lastBossTrackId){pool=[...pool.slice(1),pool[0]];}this.bossPlaylist=pool;this.bossPlaylistPos=0;this.phaseMusicSeen=0;return pool[0]||null;
  },
  rotateBossTrack(reason='rotate'){
    if(this.switchingBossTrack||!this.activeBoss||!this.enabled||this.bossPlaylist.length<2)return false;this.switchingBossTrack=true;const old=this.currentTrack?.id||'';
    this.fadeTo(0,760,()=>{bossMusic.pause();this.bossPlaylistPos=(this.bossPlaylistPos+1)%this.bossPlaylist.length;let next=this.bossPlaylist[this.bossPlaylistPos];if(next?.id===old&&this.bossPlaylist.length>1){this.bossPlaylistPos=(this.bossPlaylistPos+1)%this.bossPlaylist.length;next=this.bossPlaylist[this.bossPlaylistPos];}this.loadBossTrack(next);try{bossMusic.currentTime=0;}catch(_){}bossMusic.volume=0;this.playPending=false;this.switchingBossTrack=false;this.play(false,false);});return true;
  },
  onBossPhase(phase){
    if(!this.activeBoss||phase<=this.phaseMusicSeen)return;this.phaseMusicSeen=phase;const t=Number(bossMusic.currentTime||0);if((phase===2&&t>=16)||(phase>=3&&t>=8))this.rotateBossTrack('phase');
  },
  preloadBoss(sector){
    const track=(this.currentTrack&&this.preparedBossSector===sector)?this.currentTrack:battleTrackForSector(sector);if(!track?.src)return null;this.preparedBossSector=sector;return this.loadBossTrack(track);
  },
  primeBoss(sector){
    const track=this.preloadBoss(sector);if(!track||!this.enabled)return;const oldMuted=bossMusic.muted,oldVol=bossMusic.volume;bossMusic.muted=true;bossMusic.volume=0;
    const pp=bossMusic.play();if(pp&&pp.then)pp.then(()=>{bossMusic.pause();bossMusic.muted=oldMuted;bossMusic.volume=oldVol;this.lastError='';this.retryPending=false;}).catch(err=>{bossMusic.muted=oldMuted;bossMusic.volume=oldVol;if(err?.name==='AbortError')return;this.lastError=String(err?.name||err||'play blocked');this.retryPending=true;});
  },
  onBossRealPlay(){AudioX.stopBoss();this.retryPending=false;this.playPending=false;this.lastError='';AUDIO_HEALTH.bossStarts++;AUDIO_HEALTH.lastBoss=this.currentTrack?.title||battleTrackForSector(G?.sector||1)?.title||SECTORS[G?.sector-1]?.boss||'';this.fadeTo(this.targetVolume,720);this.updateButton();},
  play(reset=true,fromGesture=false){
    if(!this.enabled||!this.activeBoss||this.playPending||!bossMusic.paused)return false;if(reset){try{bossMusic.currentTime=0;}catch(_){}}bossMusic.loop=false;bossMusic.muted=false;if(bossMusic.volume<=0)bossMusic.volume=0;this.playPending=true;
    const pp=bossMusic.play();if(pp&&pp.then)pp.then(()=>this.onBossRealPlay()).catch(err=>{this.playPending=false;if(err?.name==='AbortError')return;this.lastError=String(err?.name||err||'play blocked');this.retryPending=true;AUDIO_HEALTH.failures++;AUDIO_HEALTH.lastError=this.lastError;const idx=(G?.sector||1)-1;AudioX.startBoss(bossSynthBase(idx),idx);this.updateButton();});else this.onBossRealPlay();
    if(fromGesture)AUDIO_HEALTH.retries++;return true;
  },
  retryBossFromGesture(){if(!this.activeBoss||!this.enabled||!bossMusic.paused||!G?.boss||G.boss.dead)return;if(performance.now()-this.lastRetryAt<180)return;this.lastRetryAt=performance.now();this.play(false,true);},
  onBossAppear(sector){
    PreBossX.stop(true);this.preparedBossSector=sector;const track=this.prepareBossPlaylist(sector);this.loadBossTrack(track);this.activeBoss=!!track?.src;this.retryPending=false;this.playPending=false;if(!this.activeBoss){this.stop(false);return;}
    if(this.enabled){AudioX.stopBoss();this.play(true,false);}else this.updateButton();
  },
  onBossEnd(){if(!this.activeBoss)return;this.lastBossTrackId=this.currentTrack?.id||this.lastBossTrackId;this.retryPending=false;this.playPending=false;this.fadeTo(0,850,()=>{bossMusic.pause();try{bossMusic.currentTime=0;}catch(_){}this.activeBoss=false;this.updateButton();});},
  pause(){PreBossX.pause();if(this.activeBoss&&!bossMusic.paused){bossMusic.pause();this.updateButton();}},
  pauseForUI(){
    if(this.uiSnapshot)return;this.cancelFade();PreBossX.cancelFade();
    this.uiSnapshot={sector:G?.sector||0,worldActive:!!PreBossX.active,worldPlaying:PreBossX.playing(),worldTime:Number(preBossMusic.currentTime||0),worldVolume:Number(preBossMusic.volume||0),bossActive:!!this.activeBoss,bossPlaying:!!(this.activeBoss&&!bossMusic.paused),bossTime:Number(bossMusic.currentTime||0),bossVolume:Number(bossMusic.volume||0)};
    if(!preBossMusic.paused)preBossMusic.pause();if(!bossMusic.paused)bossMusic.pause();if(PreBossX.fallbackSynth)AudioX.stopBoss();this.updateButton();
  },
  resumeFromUI(){
    const snap=this.uiSnapshot;this.uiSnapshot=null;if(!snap||!this.enabled||G?.screen!=='GAME')return this.resume();
    if(G?.boss&&!G.boss.dead&&snap.bossActive&&this.activeBoss){try{bossMusic.currentTime=Math.max(0,snap.bossTime||0);bossMusic.volume=Math.max(0,snap.bossVolume||this.targetVolume);}catch(_){}this.play(false,true);return;}
    if(!G?.boss&&!G?.sectorClear&&G?.mode!=='bossRush'&&G?.mode!=='training'&&snap.worldActive){PreBossX.active=true;PreBossX.track=PreBossX.track||preBossTrackForSector(G.sector);PreBossX.preparedSector=G.sector;PreBossX.fallbackSynth=false;PreBossX.retryPending=false;try{preBossMusic.currentTime=Math.max(0,snap.worldTime||0);preBossMusic.volume=Math.max(0,snap.worldVolume||PreBossX.track?.volume||PreBossX.targetVolume);}catch(_){}const pp=preBossMusic.play();if(pp&&pp.then)pp.then(()=>PreBossX.onRealPlay(G.sector)).catch(err=>PreBossX.fallback(G.sector,String(err?.name||err),true));else PreBossX.onRealPlay(G.sector);return;}
    this.resume();
  },
  resume(){if(PreBossX.active&&!G?.boss&&!G?.sectorClear&&G?.mode!=='bossRush'){PreBossX.resume();return;}if(this.activeBoss&&this.enabled&&G?.screen==='GAME'&&G?.boss&&!G.boss.dead){this.play(false,true);}},
  stop(fade=true){
    this.uiSnapshot=null;PreBossX.stop(fade);this.retryPending=false;this.playPending=false;this.switchingBossTrack=false;
    if(fade&&!bossMusic.paused){this.fadeTo(0,420,()=>{bossMusic.pause();try{bossMusic.currentTime=0;}catch(_){}this.updateButton();});}
    else{this.cancelFade();bossMusic.pause();try{bossMusic.currentTime=0;}catch(_){}bossMusic.volume=0;this.updateButton();}
  },
  toggle(){
    this.enabled=!this.enabled;
    if(this.uiSnapshot){if(!this.enabled){this.cancelFade();bossMusic.pause();PreBossX.pause();AudioX.stopBoss();}this.updateButton();saveMeta();return;}
    if(!this.enabled){this.cancelFade();bossMusic.pause();PreBossX.pause();if(this.activeBoss&&G?.boss&&!G.boss.dead){const idx=(G.sector||1)-1,base=bossSynthBase(idx);AudioX.startBoss(base,idx);}}
    else if(G?.screen==='GAME'&&!G?.boss&&!G?.sectorClear&&G?.mode!=='bossRush'&&G?.mode!=='training'){if(!PreBossX.active)PreBossX.start(G.sector);PreBossX.retryFromGesture(G.sector,'toggle');}
    else if(this.activeBoss&&G?.boss&&!G.boss.dead){this.retryBossFromGesture();}
    this.updateButton();saveMeta();
  },
  reconcile(fromGesture=false){
    if(!this.enabled||!G||G.screen!=='GAME')return;
    if(G.boss&&!G.boss.dead){if(this.activeBoss&&bossMusic.paused){if(fromGesture)this.retryBossFromGesture();}return;}
    if(G.mode!=='bossRush'&&G.mode!=='training'&&!G.sectorClear){if(!PreBossX.active){PreBossX.start(G.sector);G.worldAmbientStarted=true;}if(preBossMusic.paused&&!PreBossX.fallbackSynth&&fromGesture)PreBossX.retryFromGesture(G.sector,'reconcile');}
  }
};
bossMusic.addEventListener('play',()=>MusicX.updateButton());
bossMusic.addEventListener('pause',()=>MusicX.updateButton());
bossMusic.addEventListener('ended',()=>{if(MusicX.activeBoss&&MusicX.enabled)MusicX.rotateBossTrack('ended');});
bossMusic.addEventListener('error',()=>{MusicX.lastError='media error';MusicX.retryPending=true;AUDIO_HEALTH.failures++;AUDIO_HEALTH.lastError='boss media error';MusicX.updateButton();});


// Reconciliación de audio móvil: cada gesto real puede recuperar un play() bloqueado por el navegador.
function musicGesturePulse(){
  AudioX.unlock();if(MusicX.uiSnapshot&&['PAUSE','STORE'].includes(G?.screen))return;const sector=(G?.screen==='GAME'?G.sector:menuSector)||1;
  if(G?.screen==='GAME'){
    if(G.boss&&!G.boss.dead)MusicX.retryBossFromGesture();
    else if(G.mode!=='bossRush'&&G.mode!=='training'&&!G.sectorClear){if(!PreBossX.active)PreBossX.start(sector);PreBossX.retryFromGesture(sector,'gesture');}
  }else{PreBossX.prime(sector);MusicX.primeBoss(sector);}
}
window.addEventListener('pointerdown',musicGesturePulse,{capture:true,passive:true});
window.addEventListener('keydown',musicGesturePulse,{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(G?.screen==='GAME')MusicX.pause();}else setTimeout(()=>{if(G?.screen==='GAME'){MusicX.reconcile(true);}},120);});
window.__SWARM_AUDIO_STATUS=()=>({version:VERSION,enabled:MusicX.enabled,screen:G?.screen||'',sector:G?.sector||0,worldExpected:!!(G?.screen==='GAME'&&!G?.boss&&!G?.sectorClear&&G?.mode!=='bossRush'&&G?.mode!=='training'),worldPlaying:PreBossX.playing(),worldFallback:PreBossX.fallbackSynth,worldTrack:PreBossX.track?.label||'',worldTime:Number(preBossMusic.currentTime||0).toFixed(2),bossExpected:!!(G?.screen==='GAME'&&G?.boss&&!G.boss.dead),bossPlaying:!!(MusicX.activeBoss&&!bossMusic.paused),bossTrack:MusicX.currentTrack?.title||battleTrackForSector(G?.sector||1)?.title||'',bossPlaylist:MusicX.bossPlaylist.map(t=>t.title),bossPlaylistPos:MusicX.bossPlaylistPos,worldPlaylist:PreBossX.track?`${PreBossX.track.playlistIndex+1}/${PreBossX.track.playlistSize}`:'',bossTime:Number(bossMusic.currentTime||0).toFixed(2),uiPaused:!!MusicX.uiSnapshot,lastError:MusicX.lastError||PreBossX.lastError||'',health:{...AUDIO_HEALTH}});
window.__SWARM_ASSET_AUDIT=()=>({version:VERSION,primaryGameplayArt:'IMAGE_BACKED',missingReferencedFiles:0,semanticEnemyFamilies:10,objectiveAssets:['node','capsule','core'],worldThemesWithPrimaryAssets:['np','iron','emerald','blood','resin','odonata','resonance'],transversalAssets:Object.keys(IMG.transversal),supportAssets:Object.keys(IMG.support),notes:['SVG remains only for app branding/legacy files; active gameplay art paths use PNG/WEBP/MP3.','Worlds 4-6 themed obstacle packs are now active primary assets.','Wave objective node, capsule and recoverable core now use image assets.']});

// ─────────────────────────────────────────────────────────────
// PLAYLIST / JUKEBOX — 12 pistas nuevas + Iron Legion March legado
// ─────────────────────────────────────────────────────────────
const SOUNDTRACKS=[
  {id:'boss01',sector:'01·ALT',boss:'IMPERATRIX VESPA',title:'Núcleo Meteórico',src:'assets/music/boss_01_nucleo_meteorico.mp3',color:'#fff07b',usage:'Difícil / replay / Boss Rush'},
  {id:'boss02',sector:2,boss:'ATLAS VERDE',title:'Matriz Convergencia',src:'assets/music/boss_02_matriz_convergencia.mp3',color:'#d7ff74',usage:'Arena principal'},
  {id:'boss03',sector:3,boss:'CORTEX RAZOR',title:'Corazón Ígneo',src:'assets/music/boss_03_corazon_igneo.mp3',color:'#ffbe74',usage:'Arena principal'},
  {id:'boss04',sector:4,boss:'VELA NOCTIS',title:'Sello Astral',src:'assets/music/boss_04_sello_astral.mp3',color:'#f4c8ff',usage:'Arena principal'},
  {id:'boss05',sector:5,boss:'REGINA FERRUM',title:'Fragmento Vacío',src:'assets/music/boss_05_fragmento_vacio.mp3',color:'#ff7f75',usage:'Arena principal'},
  {id:'boss06',sector:6,boss:'COLOSSUS HOP',title:'Cyber Assault',src:'assets/music/boss_06_cyber_assault.mp3',color:'#ebff77',usage:'Arena principal'},
  {id:'boss07',sector:7,boss:'SANGUINA PRIME',title:'Deep Current',src:'assets/music/boss_07_deep_current.mp3',color:'#ff6175',usage:'Arena principal'},
  {id:'boss08',sector:8,boss:'ARCHITECT ZERO',title:'Bio Pulse',src:'assets/music/boss_08_bio_pulse.mp3',color:'#ffd56a',usage:'Arena principal'},
  {id:'boss09',sector:9,boss:'AURALIS',title:'Kurai Sekai',src:'assets/music/boss_09_kurai_sekai.mp3',color:'#78ecff',usage:'Arena principal'},
  {id:'boss10',sector:10,boss:'RESONATOR OMEGA',title:'End of Stars',src:'assets/music/boss_10_end_of_stars.mp3',color:'#d9a7ff',usage:'Arena principal'},
  {id:'boss11',sector:'BR-09',boss:'AURALIS · BOSS RUSH',title:'Twin Suns',src:'assets/music/boss_11_twin_suns.mp3',color:'#7af7ff',usage:'Boss Rush especial'},
  {id:'boss12',sector:'BR-10',boss:'RESONATOR OMEGA · BOSS RUSH',title:'Hadal Pulse',src:'assets/music/boss_12_hadal_pulse.mp3',color:'#c68cff',usage:'Final Boss Rush'},
  {id:'legacy01',sector:'01',boss:'IMPERATRIX VESPA',title:'Iron Legion March · Legacy',src:'assets/iron_legion_march.mp3',color:'#ffcf73',usage:'Campaña Normal'}
];
const trackById=id=>SOUNDTRACKS.find(t=>t.id===id)||null;
function battleTrackForSector(sector){
  if(!sector)return null;
  if(G?.mode==='bossRush'){
    if(sector===1)return trackById('boss01');
    if(sector===9)return trackById('boss11');
    if(sector===10)return trackById('boss12');
  }
  if(sector===1){
    if(runDifficultyKey()==='hard'||G?.mode==='replayBoss')return trackById('boss01');
    return trackById('legacy01');
  }
  const direct=trackById(`boss${String(sector).padStart(2,'0')}`);if(direct)return direct;
  if(sector>10)return trackById(['boss06','boss07','boss08','boss09','boss10'][(sector-11)%5]);
  return null;
}
// v2.13.7 · PLAYLIST ADAPTATIVA DE BOSSES (conservada desde v2.13.6)
const BOSS_PLAYLIST_IDS={
  1:['legacy01','boss01','boss06'],2:['boss02','boss08','boss05'],3:['boss03','boss06','boss11'],4:['boss04','boss07','boss10'],5:['boss05','boss02','boss06'],
  6:['boss06','boss03','boss11'],7:['boss07','boss04','boss08'],8:['boss08','boss02','boss05'],9:['boss09','boss11','boss03'],10:['boss10','boss12','boss04']
};
function bossPlaylistForSector(sector){
  let ids=[...(BOSS_PLAYLIST_IDS[sector]||[])];const primary=battleTrackForSector(sector);if(primary?.id)ids=[primary.id,...ids.filter(id=>id!==primary.id)];
  if(G?.mode==='bossRush'){const extras=sector>=9?['boss11','boss12','boss06','boss03']:['boss01','boss06','boss08','boss04'];ids=[...ids,...extras.filter(id=>!ids.includes(id))];}
  return ids.map(trackById).filter(Boolean);
}
const PlaylistX={
  index:0,playing:false,
  init(){this.index=clamp(META?.playlistTrack||0,0,SOUNDTRACKS.length-1);},
  track(){return SOUNDTRACKS[this.index];},
  availableIndices(){return SOUNDTRACKS.map((t,i)=>t.src?i:-1).filter(i=>i>=0);},
  select(i,autoplay=false){
    this.index=clamp(i,0,SOUNDTRACKS.length-1);META.playlistTrack=this.index;const t=this.track();
    if(!t.src){this.stop();notify(`♫ ${t.boss} · BANDA PENDIENTE`,t.color,1.7);saveMeta();return;}
    if(playlistAudio.src.split('/').pop()!==t.src.split('/').pop()){playlistAudio.src=t.src;playlistAudio.load();}
    if(autoplay)this.play();else this.stop(false);saveMeta();
  },
  play(){const t=this.track();if(!t?.src)return;MusicX.stop(false);AudioX.stopBoss();playlistAudio.loop=false;playlistAudio.volume=.58;const pp=playlistAudio.play();this.playing=true;if(pp&&pp.catch)pp.catch(()=>{this.playing=false;});},
  pause(){playlistAudio.pause();this.playing=false;},
  toggle(){this.playing&&!playlistAudio.paused?this.pause():this.play();},
  stop(reset=true){playlistAudio.pause();this.playing=false;if(reset){try{playlistAudio.currentTime=0;}catch(_){}}},
  next(autoplay=true){const avail=this.availableIndices();if(!avail.length)return;let pos=avail.indexOf(this.index);pos=(pos+1)%avail.length;this.select(avail[pos],autoplay);},
  prev(autoplay=true){const avail=this.availableIndices();if(!avail.length)return;let pos=avail.indexOf(this.index);pos=(pos-1+avail.length)%avail.length;this.select(avail[pos],autoplay);}
};
playlistAudio.addEventListener('play',()=>PlaylistX.playing=true);
playlistAudio.addEventListener('pause',()=>PlaylistX.playing=false);
playlistAudio.addEventListener('ended',()=>{PlaylistX.playing=false;const avail=PlaylistX.availableIndices();if(avail.length>1)PlaylistX.next(true);});

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// DATA — sectores activos; la arquitectura soporta 20 mundos en dos capítulos
// ─────────────────────────────────────────────────────────────
const SECTORS=[
 {code:'RC-01',name:'Rust Canyon Corridor',family:'AVISPAS',boss:'IMPERATRIX VESPA',pattern:'storm',base:'#d6a21b',accent:'#fff07b',dark:'#1a1205',bg:'rust',forms:['hornet','lancer','shocker'],hazards:['pasos angostos','minas solares','torres de chatarra'],obstacles:['spire','mine','drone'],stats:{armor:2,speed:4,range:3,threat:3},blurb:'cañón industrial de roca oxidada y puentes de forja.'},
 {code:'TR-02',name:'Toxic Ravine',family:'ESCARABAJOS',boss:'ATLAS VERDE',pattern:'titan',base:'#6e9f2e',accent:'#d7ff74',dark:'#081106',bg:'toxic',forms:['scarab','tank','ram'],hazards:['ácido vivo','pilares tóxicos','vainas corrosivas'],obstacles:['acidpod','spore','pillar'],stats:{armor:5,speed:2,range:2,threat:4},blurb:'garganta química con corrientes ácidas y costras blindadas.'},
 {code:'RT-03',name:'Rift Tunnel / Debris Field',family:'MANTIS',boss:'CORTEX RAZOR',pattern:'blade',base:'#dd7b28',accent:'#ffbe74',dark:'#07121d',bg:'rift',forms:['stalker','blade','jumper'],hazards:['fragmentos cinéticos','drones rotos','cortes frontales'],obstacles:['shard','gate','drone'],stats:{armor:3,speed:5,range:3,threat:4},blurb:'túnel orbital fracturado, veloz y saturado de residuos letales.'},
 {code:'NP-04',name:'Nocturne Pollen Vault',family:'POLILLAS',boss:'VELA NOCTIS',pattern:'moth',base:'#9f68d7',accent:'#f4c8ff',dark:'#11091b',bg:'rift',worldBg:'nocturne',bossBg:'nocturneBoss',obstacleTheme:'np',forms:['flutter','dust','seer'],hazards:['niebla de polen','descargas de alas','mirada seer'],obstacles:['cocoon','dustpod','spike'],stats:{armor:2,speed:3,range:5,threat:4},blurb:'cripta lumínica donde el polen altera trayectoria y visibilidad.'},
 {code:'IN-05',name:'Iron Nest Corridor',family:'HORMIGAS',boss:'REGINA FERRUM',pattern:'queen',base:'#ac3633',accent:'#ff7f75',dark:'#170708',bg:'rust',worldBg:'iron',bossBg:'ironBoss',obstacleTheme:'iron',forms:['worker','soldier','acid'],hazards:['enjambres obreros','ácido lineal','nidos fortificados'],obstacles:['nest','bulwark','mine'],stats:{armor:4,speed:3,range:2,threat:5},blurb:'corredor de colonia roja donde cada barrera parece otro nido vivo.'},
 {code:'EL-06',name:'Emerald Leap Delta',family:'LANGOSTAS',boss:'COLOSSUS HOP',pattern:'leap',base:'#89bb2d',accent:'#ebff77',dark:'#0b1406',bg:'toxic',worldBg:'emerald',bossBg:'emeraldBoss',obstacleTheme:'emerald',forms:['hopper','crusher','slinger'],hazards:['saltos parabólicos','esporas de impulso','bloques semilla'],obstacles:['seed','hopperrock','spore'],stats:{armor:3,speed:5,range:4,threat:5},blurb:'delta radioactivo de saltos violentos y vectores impredecibles.'},
 {code:'BM-07',name:'Bloodmist Expanse',family:'MOSQUITOS',boss:'SANGUINA PRIME',pattern:'blood',base:'#8f1728',accent:'#ff6175',dark:'#100308',bg:'rust',worldBg:'bloodmist',bossBg:'bloodmistBoss',obstacleTheme:'blood',forms:['needler','hemodrone','bloodreaper'],hazards:['drenaje hemático','persecución vectorial','niebla biológica'],obstacles:['bloodcapsule','bloodsac','bloodmembrane','bloodwreck'],stats:{armor:2,speed:5,range:4,threat:5},blurb:'expansión hemática de membranas vivas, persecución y drenaje de energía.'},
 {code:'RH-08',name:'Resin Hive Citadel',family:'TERMITAS',boss:'ARCHITECT ZERO',pattern:'architect',base:'#9b641a',accent:'#ffd56a',dark:'#120a02',bg:'rust',worldBg:'resin',bossBg:'resinBoss',obstacleTheme:'resin',forms:['termite_worker','mandible_guard','siegebuilder'],hazards:['muros de resina','nodos constructores','fortificación viva'],obstacles:['resincolumn','resinpanel','resinwall','resinnode'],stats:{armor:5,speed:2,range:3,threat:5},blurb:'ciudad-colmena de resina donde el enjambre construye y protege el terreno.'},
 {code:'OS-09',name:'Odonata Stormline',family:'LIBÉLULAS',boss:'AURALIS',pattern:'odonata',base:'#0d5679',accent:'#78ecff',dark:'#020d17',bg:'rift',worldBg:'odonata',bossBg:'odonataBoss',obstacleTheme:'odonata',forms:['flashwing','prism_hunter','lance_predator'],hazards:['embestidas diagonales','rayos prismáticos','interceptación aérea'],obstacles:['prismcrystal','iontower','stormdebris','electricnode'],stats:{armor:2,speed:5,range:5,threat:5},blurb:'corredor celeste de velocidad extrema, rayos de precisión y pasadas letales.'},
 {code:'RC-10',name:'Resonance Cathedral',family:'CIGARRAS',boss:'RESONATOR OMEGA',pattern:'resonance',base:'#4e2876',accent:'#e1b5ff',dark:'#080511',bg:'rift',worldBg:'resonance',bossBg:'resonanceBoss',obstacleTheme:'resonance',forms:['nymph_echo','sonic_cantor','resonance_breaker'],hazards:['ondas sónicas','anillos resonantes','ecos de linajes previos'],obstacles:['sonicring','sonicbell','resonator','acousticfragment'],stats:{armor:4,speed:4,range:5,threat:5},blurb:'catedral final de pulsos concéntricos, ecos antiguos y resonancia del enjambre.'},
 {code:'CS-11',name:'Celestial Scarab Nexus',family:'SCARAB_IMPERATOR',boss:'SCARAB IMPERATOR',pattern:'titan',base:'#95751f',accent:'#62dfff',dark:'#050914',bg:'rift',worldBg:'w11',bossBg:'w11Boss',forms:['ch2_11_minor','ch2_11_medium','ch2_11_major'],hazards:['órbitas gravitacionales','arietes celestes','anillos de núcleo'],obstacles:['shard','gate','spire'],stats:{armor:5,speed:3,range:4,threat:6},blurb:'santuario cósmico de lapislázuli, órbitas mecánicas y escarabajos de asedio.'},
 {code:'VL-12',name:'Venom Lancer Aerie',family:'VESPERA_LANCERS',boss:'VESPERA LANCER',pattern:'storm',base:'#b99a20',accent:'#8dff58',dark:'#071006',bg:'toxic',worldBg:'w12',bossBg:'w12Boss',forms:['ch2_12_minor','ch2_12_medium','ch2_12_major'],hazards:['dardos tóxicos','pasadas aéreas','depósitos de veneno'],obstacles:['acidpod','spike','gate'],stats:{armor:3,speed:5,range:5,threat:6},blurb:'colmena aérea de lanzas, membranas y reactores de toxina verde.'},
 {code:'RM-13',name:'Obsidian Mandible Forge',family:'MANDIBLE_REGENTS',boss:'REGENT MANDIBLE',pattern:'blade',base:'#6e261a',accent:'#ff7358',dark:'#0d0302',bg:'rust',worldBg:'w13',bossBg:'w13Boss',forms:['ch2_13_minor','ch2_13_medium','ch2_13_major'],hazards:['pinzas de choque','forja volcánica','cargas de aplastamiento'],obstacles:['rock','gate','wreck'],stats:{armor:5,speed:3,range:3,threat:6},blurb:'forja de obsidiana donde las mandíbulas gobiernan el combate cercano.'},
 {code:'PB-14',name:'Pyrolux Lantern Expanse',family:'PYROLUX',boss:'PYROLUX BEACON',pattern:'moth',base:'#5f8e43',accent:'#ffcc62',dark:'#06110e',bg:'nocturne',worldBg:'w14',bossBg:'w14Boss',forms:['ch2_14_minor','ch2_14_medium','ch2_14_major'],hazards:['minas de luz','balizas orbitales','descargas bioluminiscentes'],obstacles:['pod','seed','spire'],stats:{armor:3,speed:4,range:5,threat:6},blurb:'jardín-linternario de reactores ámbar y vuelos bioluminiscentes.'},
 {code:'CA-15',name:'Caustic Distillation Works',family:'CAUSTIC',boss:'CAUSTIC ALCHEMIST',pattern:'architect',base:'#537a28',accent:'#aaff54',dark:'#071005',bg:'toxic',worldBg:'w15',bossBg:'w15Boss',forms:['ch2_15_minor','ch2_15_medium','ch2_15_major'],hazards:['chorros corrosivos','vats presurizados','niebla química'],obstacles:['acidpod','pod','mine'],stats:{armor:5,speed:2,range:5,threat:6},blurb:'refinería alquímica de presión, ácido vivo y artillería química.'},
 {code:'AV-16',name:'Atlas Veil Cathedral',family:'VEILS',boss:'ATLAS VEIL',pattern:'moth',base:'#8b5b42',accent:'#d9a7ff',dark:'#0c0713',bg:'nocturne',worldBg:'w16',bossBg:'w16Boss',forms:['ch2_16_minor','ch2_16_medium','ch2_16_major'],hazards:['velos de seda','polvo hipnótico','ojos de ala'],obstacles:['cocoon','dustpod','spike'],stats:{armor:4,speed:3,range:5,threat:7},blurb:'catedral nocturna de alas ceremoniales, seda y polvo astral.'},
 {code:'MP-17',name:'Mirage Phasmid Verdure',family:'PHASMIDS',boss:'MIRAGE PHASMID',pattern:'odonata',base:'#4b7b39',accent:'#63f6df',dark:'#03110b',bg:'toxic',worldBg:'w17',bossBg:'w17Boss',forms:['ch2_17_minor','ch2_17_medium','ch2_17_major'],hazards:['camuflaje refractivo','cuchillas foliares','ecos de posición'],obstacles:['seed','shard','spire'],stats:{armor:3,speed:5,range:4,threat:7},blurb:'nexo cristalino vegetal de filos, refracción y depredadores miméticos.'},
 {code:'PE-18',name:'Pit Emperor Dune Maw',family:'ANTLIONS',boss:'PIT EMPEROR',pattern:'leap',base:'#9b6e31',accent:'#ffb94f',dark:'#130a03',bg:'rust',worldBg:'w18',bossBg:'w18Boss',forms:['ch2_18_minor','ch2_18_medium','ch2_18_major'],hazards:['vórtices de arena','emboscadas subterráneas','mandíbulas de pozo'],obstacles:['rock','shard','mine'],stats:{armor:5,speed:3,range:4,threat:7},blurb:'fortaleza de dunas y trampas antlion donde el suelo también caza.'},
 {code:'AR-19',name:'Auriculus Plasma Coil',family:'AURICULUS',boss:'AURICULUS RAZOR',pattern:'blade',base:'#6b1b28',accent:'#ff5c70',dark:'#100307',bg:'rift',worldBg:'w19',bossBg:'w19Boss',forms:['ch2_19_minor','ch2_19_medium','ch2_19_major'],hazards:['pinzas de plasma','barridos de cola','arcos conductivos'],obstacles:['gate','mine','wreck'],stats:{armor:4,speed:4,range:5,threat:7},blurb:'espiras de plasma carmesí y tijeras eléctricas de asalto terrestre.'},
 {code:'AI-20',name:'Solar Apiary Dominion',family:'APIARY',boss:'APIS IMPERIA',pattern:'queen',base:'#b5852b',accent:'#ffd76a',dark:'#100b03',bg:'nocturne',worldBg:'w20',bossBg:'w20Boss',forms:['ch2_20_minor','ch2_20_medium','ch2_20_major'],hazards:['lanzas reales','celdas solares','enjambres de guardia'],obstacles:['nest','pod','gate'],stats:{armor:5,speed:4,range:5,threat:8},blurb:'dominio real de panales solares, reactores de néctar y guardia imperial.'}
];

// ─────────────────────────────────────────────────────────────
// EXPANSION ARCHITECTURE — campaña data-driven preparada para 20 mundos
// ─────────────────────────────────────────────────────────────
const EXPANSION_PLAN={plannedSectors:20,sectorsPerChapter:10};
const CHAPTERS=[
  {id:1,start:1,end:10,title:'CAPÍTULO I',subtitle:'INSECTA SIEGE',accent:'#a6ff5f'},
  {id:2,start:11,end:20,title:'CAPÍTULO II',subtitle:'EXPANSIÓN',accent:'#9fe6ff'}
];
// Capítulo II conserva el Music Director: reutiliza repertorio compatible sin repetición inmediata mientras se producen pistas dedicadas.
for(let i=11;i<=20;i++){const src=WORLD_PLAYLISTS[((i-1)%10)+1]||WORLD_PLAYLISTS[10]||[];WORLD_PLAYLISTS[i]=src.map((t,j)=>({...t,label:`${SECTORS[i-1]?.name||'Capítulo II'} · ${['Deriva','Asedio','Umbral'][j]||'Pasaje'}`}));}
for(let i=11;i<=20;i++){const src=BOSS_PLAYLIST_IDS[((i-1)%10)+1]||BOSS_PLAYLIST_IDS[10]||[];BOSS_PLAYLIST_IDS[i]=[...src];}

function activeSectorCount(){return SECTORS.length;}
function plannedSectorCount(){return EXPANSION_PLAN.plannedSectors;}
function chapterById(id){return CHAPTERS.find(c=>c.id===Number(id))||CHAPTERS[0];}
function chapterForSector(sector=1){return CHAPTERS.find(c=>sector>=c.start&&sector<=c.end)||CHAPTERS[CHAPTERS.length-1];}
function chapterActiveEnd(id){const c=chapterById(id);return Math.min(c.end,activeSectorCount());}
function chapterImplementedCount(id){const c=chapterById(id),end=chapterActiveEnd(id);return Math.max(0,end-c.start+1);}
function chapterFullyImplemented(id){const c=chapterById(id);return activeSectorCount()>=c.end;}
function chapterBossCount(id){const c=chapterById(id);return c.end-c.start+1;}
function chapterBossesDefeated(id){const c=chapterById(id);if(!chapterFullyImplemented(id))return false;for(let i=c.start;i<=c.end;i++)if(!sectorDefeated(i))return false;return true;}
function allActiveBossesDefeated(){for(let i=1;i<=activeSectorCount();i++)if(!sectorDefeated(i))return false;return true;}
function fullExpansionImplemented(){return activeSectorCount()>=plannedSectorCount();}
function fullCampaignDefeated(){return fullExpansionImplemented()&&allActiveBossesDefeated();}
function grandBossRushAvailable(){return fullCampaignDefeated();}
function isChapterEndSector(sector){const c=chapterForSector(sector);return sector===c.end;}
function isActiveCampaignEnd(sector){return sector===activeSectorCount();}
function nextImplementedSector(sector){return sector<activeSectorCount()?sector+1:null;}
function expansionStatusLabel(){return `ACTIVOS ${activeSectorCount()}/${plannedSectorCount()} · CAP I ${chapterImplementedCount(1)}/${chapterBossCount(1)} · CAP II ${chapterImplementedCount(2)}/${chapterBossCount(2)}`;}
function rushSpec(chapterId=1){
  if(chapterId==='grand'||chapterId===0)return {id:'grand',label:'GRAN BOSS RUSH',start:1,end:plannedSectorCount(),count:plannedSectorCount(),implemented:fullExpansionImplemented(),complete:fullCampaignDefeated()};
  const c=chapterById(chapterId);return {id:c.id,label:`BOSS RUSH · CAP ${c.id}`,start:c.start,end:c.end,count:chapterBossCount(c.id),implemented:chapterFullyImplemented(c.id),complete:chapterBossesDefeated(c.id)};
}
function bossRushPosition(){if(!G||G.mode!=='bossRush')return null;const start=G.bossRushStartSector||rushSpec(G.bossRushChapter||1).start,end=G.bossRushEndSector||rushSpec(G.bossRushChapter||1).end;return {index:G.sector-start+1,total:end-start+1,start,end};}

const FORM_STATS={
 worker:{hp:.75,spd:1.15,size:.8,score:80,move:'sine',fire:0},soldier:{hp:1.25,spd:.95,size:1.05,score:130,move:'rush',fire:0},acid:{hp:.9,spd:.85,size:.9,score:150,move:'hover',fire:1.25},
 flutter:{hp:.72,spd:1.3,size:.9,score:95,move:'flutter',fire:1.7},dust:{hp:1.0,spd:.9,size:1,score:140,move:'wave',fire:1.4},seer:{hp:.82,spd:.78,size:.85,score:180,move:'sniper',fire:.9},
 stalker:{hp:.82,spd:1.35,size:.92,score:110,move:'zig',fire:0},blade:{hp:1.15,spd:1.2,size:1.03,score:155,move:'dash',fire:1.7},jumper:{hp:.95,spd:1.1,size:.9,score:170,move:'leap',fire:0},
 scarab:{hp:1.35,spd:.72,size:1.08,score:145,move:'direct',fire:1.9},tank:{hp:2.2,spd:.5,size:1.35,score:245,move:'direct',fire:1.35},ram:{hp:1.45,spd:1.15,size:1.12,score:210,move:'rush',fire:0},
 dart:{hp:.72,spd:1.55,size:.76,score:125,move:'dart',fire:1.55},drain:{hp:1.05,spd:1.2,size:.9,score:175,move:'orbit',fire:1.4},needle:{hp:.82,spd:1.05,size:.82,score:190,move:'sniper',fire:.72},
 builder:{hp:1.1,spd:.75,size:1,score:155,move:'hover',fire:1.55},biter:{hp:1.2,spd:1.15,size:1.0,score:165,move:'rush',fire:0},bomber:{hp:1.0,spd:.72,size:1.12,score:220,move:'wave',fire:1.15},
 hornet:{hp:.72,spd:1.65,size:.78,score:145,move:'dart',fire:1.3},lancer:{hp:1.0,spd:1.35,size:.92,score:190,move:'dash',fire:1.0},shocker:{hp:.9,spd:1.05,size:.88,score:215,move:'orbit',fire:.82},
 glow:{hp:.8,spd:1.25,size:.86,score:155,move:'wave',fire:1.3},orbiter:{hp:1.0,spd:1.0,size:.95,score:200,move:'orbit',fire:1.0},flare:{hp:.9,spd:.86,size:.92,score:230,move:'hover',fire:.75},
 hopper:{hp:.9,spd:1.25,size:.95,score:175,move:'leap',fire:0},crusher:{hp:1.8,spd:.75,size:1.28,score:260,move:'rush',fire:1.8},slinger:{hp:.95,spd:.9,size:.9,score:235,move:'sniper',fire:.78},
 singer:{hp:1.0,spd:1.0,size:1.0,score:190,move:'wave',fire:1.0},sonic:{hp:1.1,spd:.88,size:1.05,score:245,move:'hover',fire:.72},choir:{hp:.82,spd:1.2,size:.88,score:270,move:'orbit',fire:.62},
 needler:{hp:.72,spd:1.62,size:.78,score:210,move:'dart',fire:1.35},hemodrone:{hp:1.08,spd:1.18,size:.94,score:265,move:'orbit',fire:1.0},bloodreaper:{hp:1.5,spd:1.28,size:1.16,score:340,move:'rush',fire:.82},
 termite_worker:{hp:.9,spd:1.0,size:.82,score:220,move:'sine',fire:0},mandible_guard:{hp:1.55,spd:.78,size:1.08,score:310,move:'rush',fire:1.35},siegebuilder:{hp:2.0,spd:.58,size:1.28,score:390,move:'hover',fire:1.08},
 flashwing:{hp:.7,spd:1.85,size:.78,score:245,move:'dart',fire:1.15},prism_hunter:{hp:1.0,spd:1.42,size:.9,score:320,move:'zig',fire:.78},lance_predator:{hp:1.32,spd:1.62,size:1.08,score:405,move:'dash',fire:.88},
 nymph_echo:{hp:.86,spd:1.15,size:.82,score:255,move:'wave',fire:1.1},sonic_cantor:{hp:1.22,spd:.92,size:1.05,score:345,move:'hover',fire:.72},resonance_breaker:{hp:1.68,spd:.82,size:1.2,score:440,move:'orbit',fire:.62},
 ship_scout:{hp:.9,spd:1.28,size:.9,score:165,move:'zig',fire:1.1},ship_frigate:{hp:1.35,spd:.92,size:1.08,score:230,move:'direct',fire:.95},ship_bomber:{hp:1.6,spd:.76,size:1.14,score:285,move:'wave',fire:1.35}
};
// CH2: tres tiers por mundo. La progresión se concentra en tempo/patrón, no en inflar HP.
const CH2_MOVESETS={11:['direct','hover','rush'],12:['dart','zig','dash'],13:['rush','direct','dash'],14:['flutter','wave','orbit'],15:['sine','hover','sniper'],16:['flutter','wave','orbit'],17:['zig','dart','dash'],18:['sine','rush','hover'],19:['rush','zig','dash'],20:['wave','orbit','hover']};
for(let w=11;w<=20;w++){const mv=CH2_MOVESETS[w];FORM_STATS[`ch2_${w}_minor`]={hp:.76,spd:1.22+(w-11)*.008,size:.84,score:250+(w-11)*14,move:mv[0],fire:w%3===0?1.55:0};FORM_STATS[`ch2_${w}_medium`]={hp:1.10,spd:1.02+(w-11)*.006,size:1.02,score:340+(w-11)*18,move:mv[1],fire:1.05};FORM_STATS[`ch2_${w}_major`]={hp:1.48,spd:.86+(w-11)*.005,size:1.20,score:455+(w-11)*24,move:mv[2],fire:.82};}


const POWERS={
 twin:{name:'TRI-AGUJA',icon:'⋔',color:'#ffe06a',duration:22,desc:'abre el disparo en tres vectores'},
 tesla:{name:'TESLA',icon:'ϟ',color:'#8edbff',duration:20,desc:'arcos automáticos entre blancos'},
 missile:{name:'MICROMISILES',icon:'➤',color:'#ff8a53',duration:24,desc:'misiles inteligentes de apoyo'},
 rail:{name:'RAÍL',icon:'━',color:'#73ffd1',duration:18,desc:'perforación automática de línea'},
 cryo:{name:'CRIO',icon:'❄',color:'#b7efff',duration:24,desc:'ralentiza al enjambre'},
 acid:{name:'CORROSIÓN',icon:'☣',color:'#aaff5f',duration:22,desc:'impactos con daño de área'},
 shield:{name:'ESCUDO',icon:'⬡',color:'#73b7ff',duration:25,desc:'escudo regenerativo temporal'},
 magnet:{name:'IMÁN',icon:'∪',color:'#ffb5ff',duration:30,desc:'atrae recursos y poderes'},
 drone:{name:'DRONES',icon:'◆',color:'#e7f4ff',duration:28,desc:'escoltas que disparan solas'},
 overdrive:{name:'OVERDRIVE',icon:'»',color:'#ff667c',duration:18,desc:'más velocidad y cadencia'},
 gravity:{name:'PULSO G',icon:'◎',color:'#b58cff',duration:20,desc:'ondas gravitacionales periódicas'},
 burst:{name:'RÁFAGA',icon:'✶',color:'#ffb38a',duration:18,desc:'cadencia superior y salvas abiertas'},
 hemadrain:{name:'DRENAJE HEMÁTICO',icon:'♦',color:'#ff6175',duration:11,desc:'devuelve una fracción del daño como HP/SH'},
 resinwall:{name:'MURALLA DE RESINA',icon:'⬢',color:'#ffd56a',duration:13,desc:'placas orbitales absorben impactos y detonan'},
 prismburst:{name:'RÁFAGA PRISMÁTICA',icon:'✧',color:'#78ecff',duration:11,desc:'haces perforantes de alta velocidad'},
 resonance:{name:'PULSO RESONANTE Ω',icon:'◎',color:'#d9a7ff',duration:9,desc:'ondas que dañan, empujan y limpian proyectiles'},
 sparklaser:{name:'LÁSER CHISPEANTE',icon:'⌁',color:'#8ffcff',duration:16,desc:'haz continuo que salta entre blancos'},
 bio:{name:'BIOARMA',icon:'☤',color:'#88ff70',duration:19,desc:'infecta y propaga daño al caer el huésped'},
  phase:{name:'LANZA FÁSICA',icon:'⟫',color:'#72f6ff',duration:18,desc:'perfora en línea con descargas fásicas periódicas'},
  nanites:{name:'NUBE NANITA',icon:'⁙',color:'#93ff9b',duration:21,desc:'microenjambre orbital que consume blancos cercanos'},
  riftmine:{name:'MINA RIFT',icon:'⬟',color:'#ffb064',duration:20,desc:'siembra minas de proximidad detrás de la nave'},
  echo:{name:'ECO TEMPORAL',icon:'◫',color:'#b9a6ff',duration:18,desc:'replica salvas automáticas con retardo temporal'},
  nova:{name:'NOVA ENTÓMICA',icon:'✺',color:'#ff8be2',duration:16,desc:'pulso radial que daña y limpia proyectiles'},
  ionweb:{name:'MALLA IÓNICA',icon:'⌘',color:'#77e7ff',duration:18,desc:'red pulsante que frena amenazas y disipa proyectiles'},
  orbitblade:{name:'CUCHILLAS ORBITALES',icon:'✣',color:'#ffcf7a',duration:20,desc:'hojas de rift giratorias que cortan blancos cercanos'},
  bomb:{name:'BOMBA DE RIFT',icon:'✹',color:'#ffb67a',duration:0,desc:'aniquila esbirros y debilita unidades pesadas'}
};
const POWER_KEYS=Object.keys(POWERS);
const INSTANT_POWERS=new Set(['bomb']);
const POWER_SLOT_LIMIT=4;
const POWER_QUEUE_LIMIT=5;
function activePowerSlotLimit(){return POWER_SLOT_LIMIT+Math.min(1,up('powerbay'));}
function queuedPowerSlotLimit(){return POWER_QUEUE_LIMIT+Math.min(2,up('reservebay'));}
const HERITAGE_BY_SECTOR={1:'twin',2:'shield',3:'rail',4:'cryo',5:'drone',6:'gravity',7:'hemadrain',8:'resinwall',9:'prismburst',10:'resonance',11:'phase',12:'acid',13:'orbitblade',14:'nova',15:'nanites',16:'echo',17:'ionweb',18:'riftmine',19:'tesla',20:'overdrive'};
const COMBOS={
  'cryo+tesla':{name:'TORMENTA ÁRTICA',color:'#bfeeff'},
  'gravity+missile':{name:'POZO DE MISILES',color:'#ffb67f'},
  'acid+gravity':{name:'SINGULARIDAD ÁCIDA',color:'#b8ff77'},
  'rail+twin':{name:'TRIDENTE PERFORADOR',color:'#7dffd8'},
  'overdrive+twin':{name:'FRENESÍ BALÍSTICO',color:'#ff8aa3'},
  'burst+drone':{name:'ESCUADRÓN LANCERO',color:'#c8f4ff'},
  'burst+twin':{name:'RÁFAGA QUÍNTUPLE',color:'#ffd77f'},
  'sparklaser+tesla':{name:'TORMENTA DE ARCO',color:'#a9fbff'},
  'acid+bio':{name:'PLAGA NEURAL',color:'#9dff70'},
  'bio+hemadrain':{name:'SIMBIOSIS CARMESÍ',color:'#ff8c91'},
  'drone+sparklaser':{name:'RED DE LÁSERES',color:'#d7ffff'},
  'prismburst+sparklaser':{name:'PRISMA FULGURANTE',color:'#a8f5ff'},
  'resonance+tesla':{name:'CORO VOLTAICO',color:'#d7bdff'},
  'phase+rail':{name:'LANZA HIPERLINEAL',color:'#8affff'},
  'bio+nanites':{name:'PLAGA AUTÓNOMA',color:'#aaff86'},
  'gravity+riftmine':{name:'POZO DE MINAS',color:'#ffbd73'},
  'echo+twin':{name:'ECO TRIDENTE',color:'#c8baff'},
  'nova+resonance':{name:'CATEDRAL NOVA',color:'#f0aaff'},
  'hemadrain+nanites':{name:'SIMBIOSIS REPARADORA',color:'#ff9fab'},
  'ionweb+tesla':{name:'RED DE TORMENTA',color:'#8fefff'},
  'gravity+ionweb':{name:'MALLA SINGULAR',color:'#b6a7ff'},
  'orbitblade+overdrive':{name:'MOLINO RIFT',color:'#ffc66f'},
  'orbitblade+resinwall':{name:'CORONA BASTIÓN',color:'#ffe08a'}
};

// v2.14.5 · DOCTRINAS, FUSIÓN ESCALONADA, CONTRAMEDIDAS, SOBREFLUJO Y MATRICES
const HANGAR_DOCTRINES={
  adaptive:{name:'ADAPTATIVA',icon:'◎',color:'#9fe6ff',desc:'sin penalizaciones · el director prioriza la necesidad inmediata'},
  assault:{name:'ASALTO',icon:'✦',color:'#ffb06f',desc:'+6% daño · -6% duración · prioriza fuego directo'},
  control:{name:'CONTROL',icon:'⌘',color:'#8fefff',desc:'+12% duración · -3% daño · prioriza control de área'},
  sustain:{name:'SOSTÉN',icon:'⬡',color:'#8fffa7',desc:'-7% daño recibido · -4% daño · prioriza defensa y reparación'},
  fusion:{name:'FUSIÓN',icon:'Σ',color:'#d9a7ff',desc:'+2% daño por combo activo · prioriza completar sinergias'}
};
const HANGAR_DOCTRINE_KEYS=Object.keys(HANGAR_DOCTRINES);
const RESERVE_POLICIES={
  smart:{name:'SMART',icon:'★',color:'#fff09a',desc:'despliega reservas cuando hay un espacio libre'},
  conserve:{name:'CONSERVAR',icon:'▤',color:'#9fe6ff',desc:'guarda reservas para oleada 2+, frenesí o integridad baja'},
  boss:{name:'JEFE',icon:'☠',color:'#ff9a73',desc:'reserva poderes para antesala, frenesí y combate de jefe'}
};
const RESERVE_POLICY_KEYS=Object.keys(RESERVE_POLICIES);
function hangarDoctrineKey(){return HANGAR_DOCTRINES[META?.hangarDoctrine]?META.hangarDoctrine:'adaptive';}
function hangarDoctrine(){return HANGAR_DOCTRINES[hangarDoctrineKey()];}
function reservePolicyKey(){return RESERVE_POLICIES[META?.reservePolicy]?META.reservePolicy:'smart';}
function reservePolicy(){return RESERVE_POLICIES[reservePolicyKey()];}
function cycleHangarDoctrine(){const cur=HANGAR_DOCTRINE_KEYS.indexOf(hangarDoctrineKey()),next=HANGAR_DOCTRINE_KEYS[(cur+1)%HANGAR_DOCTRINE_KEYS.length];META.hangarDoctrine=next;saveMeta();AudioX.buy();notify(`${HANGAR_DOCTRINES[next].icon} DOCTRINA · ${HANGAR_DOCTRINES[next].name}`,HANGAR_DOCTRINES[next].color,1.6);}
function cycleReservePolicy(){const cur=RESERVE_POLICY_KEYS.indexOf(reservePolicyKey()),next=RESERVE_POLICY_KEYS[(cur+1)%RESERVE_POLICY_KEYS.length];META.reservePolicy=next;saveMeta();AudioX.buy();notify(`${RESERVE_POLICIES[next].icon} RESERVAS · ${RESERVE_POLICIES[next].name}`,RESERVE_POLICIES[next].color,1.6);}

// v2.14.5 · MATRICES DE CARGA / PRESETS TÁCTICOS
const HANGAR_LOADOUT_SLOTS=[1,2,3];
function hangarLoadoutSlot(){const n=Number(META?.hangarLoadoutSlot||1);return HANGAR_LOADOUT_SLOTS.includes(n)?n:1;}
function hangarLoadoutData(slot=hangarLoadoutSlot()){return META?.hangarLoadouts?.[slot]||null;}
function hangarLoadoutSummary(data=hangarLoadoutData()){
  if(!data)return 'VACÍA';const d=HANGAR_DOCTRINES[data.doctrine]?.name||'ADAPTATIVA',r=RESERVE_POLICIES[data.reservePolicy]?.name||'SMART',b=Object.keys(data.powerBranches||{}).length;return `${d} · ${r} · ${b} RAMAS`;
}
function applyHangarLoadout(slot=hangarLoadoutSlot(),quiet=false){
  const data=hangarLoadoutData(slot);if(!data){if(!quiet)notify(`▣ MATRIZ ${slot} VACÍA · CONFIGURA Y GUARDA`,'#9fb4c5',1.5);return false;}
  META.hangarDoctrine=HANGAR_DOCTRINES[data.doctrine]?data.doctrine:'adaptive';META.reservePolicy=RESERVE_POLICIES[data.reservePolicy]?data.reservePolicy:'smart';
  META.powerBranches=META.powerBranches||{};for(const [k,v] of Object.entries(data.powerBranches||{}))if(POWER_BRANCHES[k]&&(v==='A'||v==='B'))META.powerBranches[k]=v;
  saveMeta();if(!quiet){AudioX.buy();notify(`▣ MATRIZ ${slot} APLICADA · ${hangarLoadoutSummary(data)}`,'#9fe6ff',1.8);}return true;
}
function cycleHangarLoadout(){const cur=HANGAR_LOADOUT_SLOTS.indexOf(hangarLoadoutSlot()),next=HANGAR_LOADOUT_SLOTS[(cur+1)%HANGAR_LOADOUT_SLOTS.length];META.hangarLoadoutSlot=next;saveMeta();applyHangarLoadout(next,false);return next;}
function saveHangarLoadout(){const slot=hangarLoadoutSlot();META.hangarLoadouts=META.hangarLoadouts||{};META.hangarLoadouts[slot]={doctrine:hangarDoctrineKey(),reservePolicy:reservePolicyKey(),powerBranches:{...(META.powerBranches||{})},ts:Date.now()};saveMeta();AudioX.buy();notify(`▣ MATRIZ ${slot} GUARDADA · ${hangarLoadoutSummary(META.hangarLoadouts[slot])}`,'#fff09a',1.9);return true;}

// v2.14.5 · NÚCLEO DE SATURACIÓN / RIFT APEX
function riftApexDamageMult(){if(!(G?.apexT>0))return 1;return 1.08+Math.min(3,up('apexcore'))*.03;}
function riftApexRateMult(){if(!(G?.apexT>0))return 1;return Math.max(.78,.94-Math.min(3,up('apexcore'))*.04);}
function activateRiftApex(){
  if(!G||up('apexcore')<=0)return false;const lvl=up('apexcore'),dur=5.5+lvl*1.35;G.apexCharge=0;G.apexT=dur;G.apexMax=dur;G.apexPulseT=0;G.player.shield=Math.min(G.player.maxShield,G.player.shield+5+lvl*4);G.particles.push({kind:'shock',x:G.player.x,y:G.player.y,r:12,vr:900+lvl*100,life:.62,max:.62,col:'#7cf6ff'});G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:20,vr:1120+lvl*120,life:.52,max:.52,col:'#fff09a'});burst(G.player.x,G.player.y,'#7cf6ff',34+lvl*8,280);AudioX.power('phase');notify(`✦ RIFT APEX · +${Math.round((riftApexDamageMult()-1)*100)}% DAÑO · CADENCIA AUMENTADA · ${Math.ceil(dur)}s`,'#7cf6ff',2.2);return true;
}
function chargeRiftApex(rank=1,key='',scale=1){
  const lvl=up('apexcore');if(!G||lvl<=0||G.mode==='training')return 0;if(G.apexT>0){G.apexT=Math.min(G.apexMax+2.5,G.apexT+.45*scale);return 0;}const gain=Math.round((10+rank*3+lvl*4)*scale),before=G.apexCharge||0;G.apexCharge=Math.min(100,before+gain);if(G.apexCharge>=100)activateRiftApex();else if(Math.floor(before/25)!==Math.floor(G.apexCharge/25))notify(`✦ NÚCLEO APEX · ${Math.round(G.apexCharge)}%${key&&POWERS[key]?` · ${POWERS[key].name}`:''}`,'#9fe6ff',1.15);return gain;
}
function doctrineDamageMult(){return ({assault:1.06,control:.97,sustain:.96,fusion:1.0})[hangarDoctrineKey()]||1;}
function doctrineDurationMult(){return ({assault:.94,control:1.12,sustain:1.04,fusion:1.0})[hangarDoctrineKey()]||1;}
function doctrineIncomingMult(){return hangarDoctrineKey()==='sustain'?.93:1;}
const DOCTRINE_POWER_GROUPS={
  assault:new Set(['twin','missile','rail','burst','overdrive','phase','prismburst','orbitblade']),
  control:new Set(['cryo','tesla','gravity','riftmine','resinwall','resonance','ionweb','nova']),
  sustain:new Set(['shield','magnet','drone','hemadrain','nanites','resinwall']),
  fusion:new Set([])
};
function doctrinePowerScore(key){const d=hangarDoctrineKey();if(d==='adaptive')return 0;if(d==='fusion'){let score=0;for(const id of Object.keys(COMBOS)){const [a,b]=id.split('+');if(a===key&&powerOn(b))score+=22;if(b===key&&powerOn(a))score+=22;}return score;}return DOCTRINE_POWER_GROUPS[d]?.has(key)?26:-3;}
const COMBO_MASTERY_THRESHOLDS=[0,2,6,12,20];
function comboMasteryCount(id){return Math.max(0,META?.comboMastery?.[id]||0);}
function comboMasteryLevel(id){const n=comboMasteryCount(id);let lv=0;for(let i=1;i<COMBO_MASTERY_THRESHOLDS.length;i++)if(n>=COMBO_MASTERY_THRESHOLDS[i])lv=i;return lv;}
function comboMasteryLabel(id){return ['I','II','III','IV'][Math.max(0,comboMasteryLevel(id)-1)]||'—';}
function totalComboMastery(){return Object.keys(COMBOS).reduce((a,id)=>a+comboMasteryLevel(id),0);}
function activeComboMasteryBonus(){if(!G)return 0;let sum=0;for(const id of Object.keys(G.activeCombos||{}))sum+=comboMasteryLevel(id);return Math.min(.08,sum*.005);}
function recordComboMastery(id){if(!G||!COMBOS[id])return 0;G.comboSeenThisRun=G.comboSeenThisRun||{};if(G.comboSeenThisRun[id])return comboMasteryLevel(id);G.comboSeenThisRun[id]=true;META.comboMastery=META.comboMastery||{};const before=comboMasteryLevel(id);META.comboMastery[id]=Math.min(99,comboMasteryCount(id)+1);const after=comboMasteryLevel(id);if(after>before)notify(`Σ MAESTRÍA ${COMBOS[id].name} · ${comboMasteryLabel(id)}`,COMBOS[id].color,2.0);saveMeta();return after;}

function triggerMasteryIVPulse(id){
  if(!G||comboMasteryLevel(id)<4)return false;G.masteryIVSeen=G.masteryIVSeen||{};if(G.masteryIVSeen[id])return false;G.masteryIVSeen[id]=true;const [a,b]=id.split('+');for(const k of [a,b])if(powerOn(k))G.powers[k]+=1.8;let cleared=0;for(const q of G.eBullets||[]){if(q.life>0&&dist(q,G.player)<190){q.life=0;cleared++;if(cleared>=12)break;}}G.player.shield=Math.min(G.player.maxShield,G.player.shield+6);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:14,vr:740,life:.48,max:.48,col:COMBOS[id].color});burst(G.player.x,G.player.y,COMBOS[id].color,18,190);notify(`Σ MAESTRÍA IV · ${COMBOS[id].name} · PULSO APEX`,COMBOS[id].color,1.65);return true;
}
function fusionTierForCombos(n){return n>=5?3:n>=4?2:n>=3?1:0;}
function fusionSurgeLabel(t=G?.fusionSurgeTier||0){return t>=3?'ÁPICE Σ':t===2?'CASCADA Σ':'FUSIÓN Σ';}
function fusionSurgeDamageMult(){if(!(G?.fusionSurgeT>0))return 1;const tier=clamp(G.fusionSurgeTier||1,1,3),base=[0,.10,.14,.18][tier];return 1+base+up('synergy')*.02;}
function combatDamageMult(){return synergyDamageMult()*doctrineDamageMult()*fusionSurgeDamageMult()*riftApexDamageMult();}
function activateFusionSurge(comboCount){if(!G||comboCount<3||(G.fusionSurgeCd||0)>0)return false;const lvl=up('synergy'),tier=fusionTierForCombos(comboCount),dur=5+lvl*1.25+(tier-1)*1.15;G.fusionSurgeTier=tier;G.fusionSurgeT=dur;G.fusionSurgeCd=Math.max(18,29-lvl*2.5-(tier-1)*1.5);G.player.shield=Math.min(G.player.maxShield,G.player.shield+8+comboCount*2+lvl*3+tier*2);G.particles.push({kind:'shock',x:G.player.x,y:G.player.y,r:12,vr:620+tier*90,life:.62,max:.62,col:tier>=3?'#fff09a':'#d9a7ff'});G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:20,vr:760+tier*100,life:.48,max:.48,col:'#fff09a'});burst(G.player.x,G.player.y,tier>=3?'#fff09a':'#d9a7ff',28+tier*7,230+tier*25);AudioX.power('resonance');notify(`${fusionSurgeLabel(tier)} · ${comboCount} COMBOS · +${Math.round((fusionSurgeDamageMult()-1)*100)}%`,tier>=3?'#fff09a':'#d9a7ff',2.1);return true;}
function escalateFusionSurge(comboCount){if(!G||comboCount<3)return false;const tier=fusionTierForCombos(comboCount),cur=G.fusionSurgeTier||0;if(!(G.fusionSurgeT>0))return activateFusionSurge(comboCount);if(tier<=cur)return false;G.fusionSurgeTier=tier;G.fusionSurgeT=Math.max(G.fusionSurgeT,4.2+tier*1.25+up('synergy')*.65);G.player.shield=Math.min(G.player.maxShield,G.player.shield+5+tier*3);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:18,vr:860+tier*110,life:.52,max:.52,col:tier>=3?'#fff09a':'#d9a7ff'});burst(G.player.x,G.player.y,tier>=3?'#fff09a':'#d9a7ff',22+tier*8,250);notify(`${fusionSurgeLabel(tier)} · ESCALADA ${comboCount} COMBOS`,tier>=3?'#fff09a':'#d9a7ff',1.8);return true;}
function reservePolicyAllowsDeploy(){if(!G)return false;const p=reservePolicyKey();if(p==='smart')return true;if(p==='boss')return !!G.boss||G.preBossT>0||G.frenzyT>0;const hp=G.player?.hp/Math.max(1,G.player?.maxHp||1);return G.wave>=2||!!G.boss||G.preBossT>0||G.frenzyT>0||hp<.56;}

const POWER_WORLD_FOCUS={
  1:['twin','shield','magnet','burst'],
  2:['cryo','acid','drone','shield'],
  3:['missile','tesla','rail','twin'],
  4:['cryo','tesla','overdrive','magnet','phase'],
  5:['drone','burst','acid','missile','nanites'],
  6:['gravity','rail','overdrive','tesla','sparklaser','riftmine','orbitblade'],
  7:['hemadrain','missile','overdrive','shield','bio','nanites'],
  8:['resinwall','drone','shield','bomb','bio','echo','orbitblade'],
  9:['prismburst','rail','tesla','burst','sparklaser','phase','echo','ionweb'],
  10:['resonance','gravity','prismburst','hemadrain','sparklaser','bio','nova','phase','ionweb','orbitblade'],
  11:['phase','gravity','rail','shield','riftmine'],12:['acid','ionweb','tesla','missile','shield'],13:['orbitblade','rail','gravity','resinwall','burst'],14:['nova','echo','drone','magnet','sparklaser'],15:['nanites','acid','bio','resinwall','nova'],16:['echo','cryo','ionweb','magnet','shield'],17:['ionweb','prismburst','tesla','phase','orbitblade'],18:['riftmine','gravity','missile','rail','cryo'],19:['tesla','orbitblade','phase','shield','burst'],20:['overdrive','nova','resonance','drone','prismburst','shield']
};

// v2.14.4 · MATRIZ DE CONTRAMEDIDAS DE JEFE
// Bonificación moderada: orienta el Hangar sin convertir ningún poder en requisito obligatorio.
const BOSS_COUNTERS={
  1:{label:'RUPTURA DE ENJAMBRE',keys:['burst','twin','shield']},
  2:{label:'CONTROL DE CAPARAZÓN',keys:['acid','cryo','rail']},
  3:{label:'CORTE DE ALCANCE',keys:['rail','missile','phase']},
  4:{label:'FIJACIÓN NOCTURNA',keys:['tesla','ionweb','magnet']},
  5:{label:'COLAPSO DE FORJA',keys:['bio','nanites','missile']},
  6:{label:'ANCLA CINÉTICA',keys:['gravity','riftmine','phase']},
  7:{label:'ANTI-SIFÓN',keys:['shield','nanites','resinwall']},
  8:{label:'BRECHA COLONIAL',keys:['acid','bio','orbitblade']},
  9:{label:'INTERCEPCIÓN PRISMÁTICA',keys:['ionweb','tesla','rail']},
  10:{label:'DESFASE ARMÓNICO',keys:['phase','nova','shield']},
  11:{label:'RUPTURA GRAVÍTICA',keys:['phase','gravity','rail']},12:{label:'NEUTRALIZACIÓN TÓXICA',keys:['shield','ionweb','cryo']},13:{label:'FRACTURA DE MANDÍBULA',keys:['rail','orbitblade','gravity']},14:{label:'ECLIPSE DE BALIZA',keys:['nova','magnet','tesla']},15:{label:'PURGA ALQUÍMICA',keys:['bio','nanites','resinwall']},16:{label:'ANCLA DEL VELO',keys:['ionweb','cryo','echo']},17:{label:'REVELACIÓN MIRAGE',keys:['ionweb','prismburst','tesla']},18:{label:'COLAPSO DEL POZO',keys:['gravity','riftmine','missile']},19:{label:'DESCARGA DE PINZA',keys:['shield','phase','tesla']},20:{label:'BRECHA REAL',keys:['nova','resonance','prismburst']}
};
function bossCounterSpec(sector=G?.sector||storeContextSector?.()||1){return BOSS_COUNTERS[clamp(sector,1,activeSectorCount())]||BOSS_COUNTERS[1];}
function bossCounterKeys(sector=G?.sector||1){return bossCounterSpec(sector).keys;}
function bossCounterActiveCount(){if(!G)return 0;return bossCounterKeys(G.sector).filter(powerOn).length;}
function bossCounterDamageMult(){return G?.boss?1+Math.min(.09,bossCounterActiveCount()*.03):1;}
function bossCounterLabel(sector=G?.sector||1){const c=bossCounterSpec(sector);return `${c.label} · ${c.keys.map(k=>POWERS[k]?.name||k).join(' · ')}`;}
function powerRankCap(sector=G?.sector||1){const base=sector>=10?5:sector>=8?4:sector>=5?3:sector>=3?2:1;return clamp(base+Math.min(2,up('evolution')),1,7);}
function powerRank(key){return clamp(G?.powerRanks?.[key]||1,1,7);}
function rankRoman(rank){return ['I','II','III','IV','V','VI','VII'][clamp(rank,1,7)-1];}
function powerEvolutionLabel(rank){return rank>=7?'OMEGA':rank>=6?'ASCENDIDO':'';}
function powerEvolutionTrait(key,rank=powerRank(key)){if(rank<6)return '';const omega=rank>=7;const traits={missile:omega?'OCTAMISIL':'HEPTAMISIL',rail:omega?'PENTA-RIEL':'CUADRI-RIEL',tesla:omega?'TORMENTA OMEGA':'CADENA ASCENDIDA',gravity:omega?'HORIZONTE TOTAL':'POZO ASCENDIDO',sparklaser:omega?'RED CUÁDRUPLE':'RED TRIPLE',bio:omega?'PERFORACIÓN IV':'PERFORACIÓN III',twin:omega?'NONA SALVA':'SALVA ASCENDIDA',burst:omega?'NONA RÁFAGA':'RÁFAGA ASCENDIDA',prismburst:omega?'PRISMA NONA':'PRISMA ASCENDIDO',phase:omega?'LANZA OMEGA':'LANZA ASCENDIDA',nanites:omega?'COLMENA OMEGA':'COLMENA ASCENDIDA',riftmine:omega?'CAMPO OMEGA':'CAMPO ASCENDIDO',echo:omega?'ECO OMEGA':'ECO ASCENDIDO',nova:omega?'NOVA OMEGA':'NOVA ASCENDIDA',ionweb:omega?'MALLA OMEGA':'MALLA ASCENDIDA',orbitblade:omega?'CORONA OMEGA':'CORONA ASCENDIDA'};return traits[key]||(omega?'MODO OMEGA':'MODO ASCENDIDO');}
function powerFocusLabel(sector=G?.sector||1){return (POWER_WORLD_FOCUS[sector]||[]).map(k=>POWERS[k]?.name||k).join(' · ');}

// v2.14.1 · RAMIFICACIONES EVOLUTIVAS A/B
// Se desbloquean con Matriz Evolutiva I. Son persistentes y pueden reconfigurarse en Hangar.
const POWER_BRANCHES={
 twin:{A:{name:'AGUJA DE PRECISIÓN',desc:'+18% daño principal · dispersión más cerrada'},B:{name:'ABANICO ENJAMBRE',desc:'+2 vectores secundarios · cobertura superior'}},
 missile:{A:{name:'CAZADOR ALFA',desc:'+1 micromisil · reacquisición agresiva'},B:{name:'OJIVA DE NIDO',desc:'+28% radio explosivo'}},
 rail:{A:{name:'PENETRADOR',desc:'+1 perforación · +16% daño'},B:{name:'CICLO RÁPIDO',desc:'-18% recarga del raíl'}},
 tesla:{A:{name:'CADENA LARGA',desc:'+2 blancos encadenados'},B:{name:'SOBRECARGA',desc:'-17% intervalo de descarga'}},
 gravity:{A:{name:'HORIZONTE',desc:'+22% radio gravitacional'},B:{name:'PULSO DENSO',desc:'-20% intervalo de pulso'}},
 shield:{A:{name:'REGENERADOR',desc:'+35% regeneración temporal'},B:{name:'BASTIÓN',desc:'+25 escudo al activar'}},
 drone:{A:{name:'ALA EXTRA',desc:'+1 escolta mientras DRONES esté activo'},B:{name:'ENJAMBRE RÁPIDO',desc:'-16% intervalo de apoyo'}},
 sparklaser:{A:{name:'RED DE ARCOS',desc:'+1 salto de láser'},B:{name:'FOCO CALIENTE',desc:'+18% daño del láser'}},
 bio:{A:{name:'ESPORA PERFORANTE',desc:'+1 perforación biológica'},B:{name:'PLAGA EXPANSIVA',desc:'+30% radio de propagación'}},
 phase:{A:{name:'NÚCLEO FÁSICO',desc:'+22% daño de lanza'},B:{name:'REPETIDOR FÁSICO',desc:'-18% intervalo de lanza'}},
 nanites:{A:{name:'COLMENA AMPLIA',desc:'+1 blanco por pulso'},B:{name:'NUBE PROFUNDA',desc:'+24% radio operativo'}},
 riftmine:{A:{name:'CAMPO MINADO',desc:'+2 minas simultáneas'},B:{name:'CARGA DE RIFT',desc:'+26% daño y radio de detonación'}},
 echo:{A:{name:'ECO MÚLTIPLE',desc:'+1 proyectil replicado'},B:{name:'BUCLE CORTO',desc:'-18% intervalo de eco'}},
 nova:{A:{name:'NOVA EXPANSIVA',desc:'+22% radio de pulso'},B:{name:'NOVA FRECUENTE',desc:'-18% intervalo de nova'}},
 hemadrain:{A:{name:'SIFÓN VITAL',desc:'+28% conversión a HP'},B:{name:'SIFÓN AEGIS',desc:'+40% conversión excedente a shield'}},
 resinwall:{A:{name:'FORTALEZA',desc:'+2 cargas de resina'},B:{name:'RESINA REACTIVA',desc:'detonación defensiva más intensa'}},
 prismburst:{A:{name:'PRISMA ABIERTO',desc:'+2 haces laterales en rangos altos'},B:{name:'PRISMA PUNZANTE',desc:'+2 perforación'}},
 resonance:{A:{name:'CÁMARA AMPLIA',desc:'+22% radio resonante'},B:{name:'TIMBAL RÁPIDO',desc:'-18% intervalo resonante'}},
 ionweb:{A:{name:'RED AMPLIA',desc:'+24% radio de malla'},B:{name:'TRAMA RÁPIDA',desc:'-18% intervalo de pulso'}},
 orbitblade:{A:{name:'CORONA DENTADA',desc:'+1 cuchilla y +18% daño'},B:{name:'TURBINA RIFT',desc:'-18% intervalo de corte'}}
};
function powerBranchUnlocked(){return up('evolution')>=1;}
function powerBranch(key){return powerBranchUnlocked()?(META?.powerBranches?.[key]||''):'';}
function branchIs(key,id){return powerBranch(key)===id;}
function powerBranchLabel(key){const b=powerBranch(key);return b&&POWER_BRANCHES[key]?.[b]?`${b} · ${POWER_BRANCHES[key][b].name}`:'SIN RAMA';}
function branchCost(key){const sec=POWER_SHOP_WORLD?.[key]||1,chosen=!!META?.powerBranches?.[key];return Math.round((chosen?95:220)+sec*28);}
function buyPowerBranch(key){
  if(!POWER_BRANCHES[key]||!powerBranchUnlocked()){AudioX.deny();notify('REQUIERE MATRIZ EVOLUTIVA I','#ff8a8a',1.4);return false;}
  META.powerBranches=META.powerBranches||{};const next=META.powerBranches[key]==='A'?'B':'A',cost=branchCost(key);
  if(!spendCredits(cost)){AudioX.deny();notify(`RAMA ${next} · REQUIERE ¤ ${cost}`,'#ff768c',1.4);return false;}
  META.powerBranches[key]=next;AudioX.buy();saveMeta();notify(`${POWERS[key].icon} ${POWERS[key].name} · RAMA ${next}: ${POWER_BRANCHES[key][next].name}`,'#d9a7ff',2.0);return true;
}

// v2.14.2 · ADN VISUAL DE EVOLUCIÓN
// La rama y el rango alteran de forma legible proyectiles, auras y pulsos sin sustituir la identidad cromática del poder.
function powerVisual(key,rank=powerRank(key)){
  const pd=POWERS[key]||{color:'#ffffff'},branch=powerBranch(key),base=pd.color;
  const accent=branch==='A'?mixHex(base,'#ffffff',.30):branch==='B'?mixHex(base,'#ff79db',.28):base;
  return {key,rank,branch,base,accent,ascended:rank>=6,omega:rank>=7};
}
function powerVisualTag(key,rank=powerRank(key)){const v=powerVisual(key,rank);return `${rankRoman(rank)}${v.branch||''}${v.omega?'Ω':v.ascended?'↑':''}`;}
function stampPowerProjectile(b,key,rank=powerRank(key)){const v=powerVisual(key,rank);b.powerKey=key;b.powerRank=rank;b.powerBranch=v.branch;b.col=v.accent;b.evoAscended=v.ascended;b.evoOmega=v.omega;return b;}

const BOSS_SKILLS={
  storm:{name:'AGUIJÓN IMPERIAL',warn:'CARGA DE AGUIJÓN',alt:'TEMPESTAD DE AGUIJONES',color:'#ffe66f'},
  titan:{name:'CAPARAZÓN ATLAS',warn:'BLINDAJE ATLAS',alt:'EMBESTIDA ATLAS',color:'#c9ff77'},
  blade:{name:'CRUZ RAZOR',warn:'CORTE RAZOR',alt:'TIJERA RAZOR',color:'#ff9a55'},
  moth:{name:'VELO NOCTURNO',warn:'POLEN NOCTURNO',alt:'ECLIPSE DE POLEN',color:'#e9b7ff'},
  queen:{name:'LLAMADO DE COLONIA',warn:'ENJAMBRE DE REINA',alt:'MAREA FÉRRICA',color:'#ff746b'},
  leap:{name:'SALTO CINÉTICO',warn:'IMPACTO CINÉTICO',alt:'REBOTE COLOSSUS',color:'#dfff6b'},
  blood:{name:'DRENAJE REAL',warn:'PICADURA HEMÁTICA',alt:'NUBE DE SANGRE',color:'#ff6175'},
  architect:{name:'NODO CONSTRUCTOR',warn:'FORTIFICACIÓN DE RESINA',alt:'COLAPSO DE COLMENA',color:'#ffd56a'},
  odonata:{name:'LANZA PRISMÁTICA',warn:'INTERCEPCIÓN ODONATA',alt:'CRUZ DE TORMENTA',color:'#78ecff'},
  resonance:{name:'PULSO OMEGA',warn:'RESONANCIA CRECIENTE',alt:'CATEDRAL SÓNICA',color:'#d9a7ff'}
};

const BOSS_SIGNATURE_ATTACKS={
  storm:{name:'AGUIJÓN SOLAR',color:'#ffe66f',wind:.68,active:.92,first:3.4,cool:[8.4,7.5,6.6]},
  titan:{name:'ONDA ATLAS',color:'#c9ff77',wind:.78,active:1.35,first:3.9,cool:[9.2,8.2,7.2]},
  moth:{name:'ECLIPSE ROTATORIO',color:'#e9b7ff',wind:.78,active:1.42,first:4.0,cool:[9.0,8.0,7.0]},
  queen:{name:'MALLA FÉRRICA',color:'#ff746b',wind:.72,active:1.25,first:4.2,cool:[9.2,8.2,7.1]},
  leap:{name:'IMPACTO COLOSSUS',color:'#dfff6b',wind:.60,active:1.20,first:3.8,cool:[8.5,7.5,6.5]},
  blood:{name:'SIFÓN HEMÁTICO',color:'#ff6175',wind:.70,active:1.28,first:3.8,cool:[8.8,7.8,6.8]},
  architect:{name:'JAULA DE RESINA',color:'#ffd56a',wind:.82,active:1.36,first:4.4,cool:[9.5,8.5,7.5]},
  odonata:{name:'CRUZ PRISMÁTICA',color:'#78ecff',wind:.62,active:1.12,first:3.4,cool:[8.0,7.0,6.1]},
  resonance:{name:'ONDA OMEGA',color:'#d9a7ff',wind:.76,active:1.48,first:4.0,cool:[9.0,8.0,6.9]}
};
const BOSS_PHASE_NAMES={
  storm:['ACECHO IMPERIAL','TEMPESTAD','DOMINIO VESPA'],
  titan:['CAPARAZÓN','ARROLLAMIENTO','ATLAS DESATADO'],
  blade:['CAZA RAZOR','TIJERA','CORTE ABSOLUTO'],
  moth:['VELO','ECLIPSE','NOCHE TOTAL'],
  queen:['COLONIA','MAREA FÉRRICA','REINA TOTAL'],
  leap:['IMPULSO','REBOTE','COLAPSO CINÉTICO'],
  blood:['ACECHO','HEMORRAGIA','HAMBRE ROJA'],
  architect:['TRAZADO','FORTALEZA','COLMENA TOTAL'],
  odonata:['CAZA','INTERCEPCIÓN','SUPREMACÍA AÉREA'],
  resonance:['ECO','CORO','RESONANCIA OMEGA']
};
const BOSS_STANDARD={armor:0.84,core:1.36,coreDuration:2.15,phaseLock:1.05,deathDuration:3.35,hp:1.12};
const HERITAGE_NAMES={1:'AGUIJÓN IMPERIAL',2:'CAPARAZÓN ATLAS',3:'CUCHILLA RAZOR',4:'POLVO NOCTURNO',5:'ENJAMBRE OBRERO',6:'SALTO CINÉTICO',7:'DRENAJE HEMÁTICO',8:'MURALLA DE RESINA',9:'RÁFAGA PRISMÁTICA',10:'PULSO RESONANTE Ω',11:'ORBE IMPERATOR',12:'LANCETA VESPERA',13:'MANDÍBULA REGENTE',14:'BALIZA PYROLUX',15:'CÁMARA CÁUSTICA',16:'VELO ATLAS',17:'MIRAGE FOLIAR',18:'POZO IMPERIAL',19:'TIJERA AURICULUS',20:'CORONA APIARIA'};

const RELICS={
  7:{icon:'♦',name:'NÚCLEO HEMÁTICO',color:'#ff6078',desc:'+8 HP máximo'},
  8:{icon:'⬢',name:'MATRIZ DE RESINA',color:'#ffd56a',desc:'+10 escudo máximo'},
  9:{icon:'✧',name:'LENTE ODONATA',color:'#7eeeff',desc:'+4% velocidad de maniobra'},
  10:{icon:'Ω',name:'RESONADOR OMEGA',color:'#d9a7ff',desc:'+5% daño contra jefes'}
};
const RUSH_GRADE_VALUE={S:4,A:3,B:2,C:1};
function relicUnlocked(sector){return !!META?.relics?.[sector];}
const RELIC_SECTORS=Object.keys(RELICS).map(Number).sort((a,b)=>a-b);
function relicCount(){return RELIC_SECTORS.filter(relicUnlocked).length;}
function bossRushGrade(time,hits,sector){
  const target=38+sector*2.4;
  if(hits===0&&time<=target)return 'S';
  if(hits<=1&&time<=target*1.45)return 'A';
  if(hits<=3&&time<=target*2.05)return 'B';
  return 'C';
}
function bossRushRank(results=[]){
  if(!results.length)return 'C';const avg=results.reduce((a,r)=>a+(RUSH_GRADE_VALUE[r.grade]||1),0)/results.length;
  if(avg>=3.85)return 'Ω';if(avg>=3.35)return 'S';if(avg>=2.6)return 'A';if(avg>=1.8)return 'B';return 'C';
}
function rushRankValue(rank){return ({Ω:5,S:4,A:3,B:2,C:1})[rank]||1;}
function drawRelicStrip(y,scale=1){
  const sectors=RELIC_SECTORS,gap=8,w=Math.min(150*scale,(W-56-gap*Math.max(0,sectors.length-1))/Math.max(1,sectors.length)),total=w*sectors.length+gap*Math.max(0,sectors.length-1),x0=W/2-total/2;cx.textAlign='center';
  sectors.forEach((sec,i)=>{const r=RELICS[sec],on=relicUnlocked(sec),x=x0+i*(w+gap);cx.fillStyle=on?'rgba(6,16,27,.82)':'rgba(5,9,16,.55)';cx.strokeStyle=on?hexA(r.color,.6):'rgba(110,130,145,.20)';rr(x,y,w,32*scale,10);cx.fill();cx.stroke();cx.fillStyle=on?r.color:'#60717d';cx.font=`900 ${Math.max(9,11*scale)}px system-ui`;cx.fillText(`${r.icon} ${on?r.name:'BLOQUEADA'}`,x+w/2,y+11*scale);cx.fillStyle=on?'#aebfca':'#52616b';cx.font=`700 ${Math.max(7,8.5*scale)}px system-ui`;cx.fillText(on?r.desc:`SECTOR ${sec}`,x+w/2,y+24*scale);});
  cx.textAlign='left';
}

const UPGRADES=[
 {id:'hull',name:'Casco compuesto',icon:'♥',base:150,max:8,desc:'+12 vida máxima por nivel'},
 {id:'shield',name:'Malla de escudo',icon:'⬡',base:160,max:8,desc:'+10 escudo máximo por nivel'},
 {id:'damage',name:'Núcleo ofensivo',icon:'✦',base:190,max:8,desc:'+10% daño por nivel'},
 {id:'rate',name:'Cámara rápida',icon:'≋',base:180,max:7,desc:'+7% cadencia por nivel'},
 {id:'engine',name:'Vector de motor',icon:'»',base:145,max:7,desc:'+5% velocidad por nivel'},
 {id:'magnet',name:'Campo recolector',icon:'∪',base:135,max:6,desc:'+18 radio de recolección'},
 {id:'drone',name:'Hangar de drones',icon:'◆',base:230,max:4,desc:'+1 dron permanente cada 2 niveles'},
 {id:'salvage',name:'Reciclaje táctico',icon:'¤',base:170,max:6,desc:'+8% créditos obtenidos'},
 {id:'dash',name:'Estabilizador vectorial',icon:'⌁',base:175,max:5,desc:'+3% respuesta de maniobra por nivel'},
 {id:'powerbay',name:'Bahía de poder XL',icon:'▦',base:760,max:1,desc:'+1 poder activo simultáneo · hasta 5'},
 {id:'reservebay',name:'Bastidor de reserva',icon:'▤',base:420,max:2,desc:'+1 espacio de cola por nivel'},
 {id:'evolution',name:'Matriz evolutiva',icon:'◇',base:680,max:2,desc:'extiende los rangos hasta VI/VII'},
 {id:'reactor',name:'Reactor de duración',icon:'◉',base:390,max:5,desc:'+5% duración de poderes por nivel'},
 {id:'synergy',name:'Núcleo de sinergia',icon:'Σ',base:560,max:3,desc:'+3% daño por combo activo y nivel · máximo 3 combos'},
 {id:'recycler',name:'Reciclador de exceso',icon:'♻',base:330,max:4,desc:'mejora la conversión cuando la reserva está llena'},
 {id:'overclock',name:'Reactor de sobreflujo',icon:'⚡',base:720,max:3,desc:'habilita un poder temporal extra cuando activos y cola están llenos'},
 {id:'apexcore',name:'Núcleo de saturación',icon:'✦',base:640,max:3,desc:'duplicados al límite cargan RIFT APEX · daño y cadencia temporal'}
];
const EVOLUTION_UPGRADE_IDS=new Set(['powerbay','reservebay','evolution','reactor','synergy','overclock','apexcore']);

const defaultMeta=()=>({credits:0,hiScore:0,unlocked:1,upgrades:{},muted:false,musicEnabled:true,selectedDifficulty:'normal',playlistTrack:0,runs:0,bosses:0,bossUnlocks:{},defeated:{},bossMastery:{},bestWaveGrade:{},bestBossRush:0,bossRushWins:0,bestBossRushRank:'',bestBossRushTime:0,campaignWins:0,bestCampaignScore:0,relics:{},chapterWins:{},bestChapterScore:{},bossRushStats:{},fullCampaignWins:0,bestFullCampaignScore:0,grandBossRush:{wins:0,bestScore:0,bestRank:'',bestTime:0},supplies:{},powerStock:{},powerBranches:{},comboMastery:{},hangarDoctrine:'adaptive',reservePolicy:'smart',hangarLoadouts:{},hangarLoadoutSlot:1,chaseBest:0,chaseWins:0,chaseBestRank:''});
let META=loadJSON(KEY_META,null)||loadJSON('swarm_rift_meta_v21518',null)||loadJSON('swarm_rift_meta_v21517',null)||loadJSON('swarm_rift_meta_v21516',null)||loadJSON('swarm_rift_meta_v21515',null)||loadJSON('swarm_rift_meta_v21514',null)||loadJSON('swarm_rift_meta_v21513',null)||loadJSON('swarm_rift_meta_v21512',null)||loadJSON('swarm_rift_meta_v21511',null)||loadJSON('swarm_rift_meta_v21510',null)||loadJSON('swarm_rift_meta_v2159',null)||loadJSON('swarm_rift_meta_v2158',null)||loadJSON('swarm_rift_meta_v2157',null)||loadJSON('swarm_rift_meta_v2156',null)||loadJSON('swarm_rift_meta_v2155',null)||loadJSON('swarm_rift_meta_v2154',null)||loadJSON('swarm_rift_meta_v2153',null)||loadJSON('swarm_rift_meta_v2152',null)||loadJSON('swarm_rift_meta_v2151',null)||loadJSON('swarm_rift_meta_v2150',null)||loadJSON('swarm_rift_meta_v2145',null)||loadJSON('swarm_rift_meta_v2144',null)||loadJSON('swarm_rift_meta_v2143',null)||loadJSON('swarm_rift_meta_v2142',null)||loadJSON('swarm_rift_meta_v2141',null)||loadJSON('swarm_rift_meta_v2140',null)||loadJSON('swarm_rift_meta_v2137',null)||loadJSON('swarm_rift_meta_v2136',null)||loadJSON('swarm_rift_meta_v2135',null)||loadJSON('swarm_rift_meta_v2134',null)||loadJSON('swarm_rift_meta_v2133',null)||loadJSON('swarm_rift_meta_v2132',null)||loadJSON('swarm_rift_meta_v2131',null)||loadJSON('swarm_rift_meta_v2130',null)||loadJSON('swarm_rift_meta_v21241',null)||loadJSON('swarm_rift_meta_v2124',null)||loadJSON('swarm_rift_meta_v2123',null)||loadJSON('swarm_rift_meta_v2122',null)||loadJSON('swarm_rift_meta_v21216',null)||loadJSON('swarm_rift_meta_v21215',null)||loadJSON('swarm_rift_meta_v21214',null)||loadJSON('swarm_rift_meta_v21213',null)||loadJSON('swarm_rift_meta_v21212',null);
if(!META){for(const k of ['swarm_rift_meta_v21211','swarm_rift_meta_v2121','swarm_rift_meta_v2120','swarm_rift_meta_v2119','swarm_rift_meta_v2118','swarm_rift_meta_v2117','swarm_rift_meta_v2116','swarm_rift_meta_v2115','swarm_rift_meta_v2114','swarm_rift_meta_v2113','swarm_rift_meta_v2112','swarm_rift_meta_v2111','swarm_rift_meta_v2110','swarm_rift_meta_v2100','swarm_rift_meta_v290','swarm_rift_meta_v280','swarm_rift_meta_v271','swarm_rift_meta_v270','swarm_rift_meta_v260','swarm_rift_meta_v251','swarm_rift_meta_v250','swarm_rift_meta_v240','swarm_rift_meta_v230','swarm_rift_meta_v220','swarm_rift_meta_v210','swarm_rift_meta_v200','swarm_rift_meta_v199','swarm_rift_meta_v198','swarm_rift_meta_v197','swarm_rift_meta_v196','swarm_rift_meta_v195','swarm_rift_meta_v194','swarm_rift_meta_v18','swarm_rift_meta_v17']){META=loadJSON(k,null);if(META)break;}}
if(!META)META=defaultMeta();
META.upgrades=META.upgrades||{};META.bossUnlocks=META.bossUnlocks||{};META.defeated=META.defeated||{};META.bossMastery=META.bossMastery||{};META.bestWaveGrade=META.bestWaveGrade||{};META.relics=META.relics||{};META.supplies=META.supplies||{};META.powerStock=META.powerStock||{};META.powerBranches=META.powerBranches||{};META.comboMastery=META.comboMastery||{};META.hangarDoctrine=HANGAR_DOCTRINES[META.hangarDoctrine]?META.hangarDoctrine:'adaptive';META.reservePolicy=RESERVE_POLICIES[META.reservePolicy]?META.reservePolicy:'smart';META.hangarLoadouts=META.hangarLoadouts||{};META.hangarLoadoutSlot=HANGAR_LOADOUT_SLOTS.includes(Number(META.hangarLoadoutSlot))?Number(META.hangarLoadoutSlot):1;
META.chapterWins=META.chapterWins||{};META.bestChapterScore=META.bestChapterScore||{};META.bossRushStats=META.bossRushStats||{};META.grandBossRush=META.grandBossRush||{wins:0,bestScore:0,bestRank:'',bestTime:0};META.fullCampaignWins=META.fullCampaignWins||0;META.bestFullCampaignScore=META.bestFullCampaignScore||0;META.bossLossCheckpoint=META.bossLossCheckpoint||null;
// Migra estadísticas históricas v2.10 y anteriores al Capítulo I sin perder compatibilidad.
META.chapterWins[1]=Math.max(META.chapterWins[1]||0,META.campaignWins||0);META.bestChapterScore[1]=Math.max(META.bestChapterScore[1]||0,META.bestCampaignScore||0);
META.bossRushStats[1]=META.bossRushStats[1]||{wins:META.bossRushWins||0,bestScore:META.bestBossRush||0,bestRank:META.bestBossRushRank||'',bestTime:META.bestBossRushTime||0};META.bossRushStats[2]=META.bossRushStats[2]||{wins:0,bestScore:0,bestRank:'',bestTime:0};META.hiveDirector=META.hiveDirector||{mode:'shadow',schema:1,telemetryKey:KEY_HIVE_TELEMETRY};
for(const rs of RELIC_SECTORS)if(META.defeated?.[rs]||META.bossUnlocks?.[rs])META.relics[rs]=true;
META.chaseBest=META.chaseBest||0;META.chaseWins=META.chaseWins||0;META.chaseBestRank=META.chaseBestRank||'';META.bestBossRush=META.bestBossRush||0;META.bossRushWins=META.bossRushWins||0;META.campaignWins=META.campaignWins||0;META.bestCampaignScore=META.bestCampaignScore||0;META.bestBossRushRank=META.bestBossRushRank||'';META.bestBossRushTime=META.bestBossRushTime||0;META.musicEnabled=META.musicEnabled!==false;META.selectedDifficulty=META.selectedDifficulty==='hard'?'hard':'normal';META.playlistTrack=clamp(META.playlistTrack||0,0,SOUNDTRACKS.length-1);
// Cuando el Capítulo II sea incorporado, haber derrotado el final del Capítulo I desbloquea automáticamente su primer sector.
if(activeSectorCount()>=chapterById(2).start&&sectorDefeated(chapterById(1).end))META.unlocked=Math.max(META.unlocked||1,chapterById(2).start);META.unlocked=clamp(META.unlocked||1,1,activeSectorCount());
AudioX.muted=!!META.muted;audioBtn.textContent=AudioX.muted?'🔇':'🔊';MusicX.enabled=META.musicEnabled;MusicX.updateButton();PlaylistX.init();

function loadJSON(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'?v:fallback;}catch(_){return fallback;}}
function saveMeta(){META.credits=G?.credits??META.credits;META.hiScore=Math.max(META.hiScore,G?.hiScore||0);META.muted=AudioX.muted;META.musicEnabled=MusicX.enabled;META.playlistTrack=PlaylistX?.index??META.playlistTrack??0;try{localStorage.setItem(KEY_META,JSON.stringify(META));}catch(_){}}
function up(id){return META.upgrades[id]||0;}
function sectorDefeated(n){return !!META.defeated?.[n]||!!META.bossUnlocks?.[n];}
function bossLossCheckpointFor(sector){const cp=META.bossLossCheckpoint;return cp&&cp.sector===sector?cp:null;}
function bossCheckpointAvailable(sector){return sectorDefeated(sector)||!!bossLossCheckpointFor(sector);}
function saveBossLossCheckpoint(){
  if(!G?.boss||G.boss.dead||G.boss.dying||G.mode==='training'||G.mode==='bossRush')return false;
  const p=G.player;
  META.bossLossCheckpoint={sector:G.sector,runDifficulty:G.runDifficulty||'normal',score:G.score||0,credits:G.credits||0,xp:G.xp||0,level:G.level||1,xpNext:G.xpNext||120,powers:{...(G.powers||{})},queue:[...(G.powerQueue||[])],powerRanks:{...(G.powerRanks||{})},heritageNext:G.heritageNext||null,bonusCredits:G.bonusCredits||0,waveMedals:[...(G.waveMedals||[])],ts:Date.now()};
  G.bossCheckpoint=true;G.bossCheckpointKind='loss';G.lostAtBoss=true;saveMeta();return true;
}
function startBossLossCheckpoint(cp=META.bossLossCheckpoint){
  if(!cp||!cp.sector||cp.sector>activeSectorCount()){notify('NO HAY CHECKPOINT DE JEFE','#ff7f92',1.8);return false;}
  const snap=JSON.parse(JSON.stringify(cp));
  newRun(snap.sector,'campaign',snap.runDifficulty||'normal');
  G.bossCheckpoint=true;G.bossCheckpointKind='loss';G.waveObjective=null;G.objectiveTargets=[];G.objectiveCapsule=null;G.wave=3;G.kills=G.goal=waveGoal(G.sector,3);G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.eBullets.length=0;G.pickups.length=0;G.bossPending=false;
  G.score=snap.score||0;G.credits=Math.max(G.credits,snap.credits||0);G.xp=snap.xp||0;G.level=snap.level||1;G.xpNext=snap.xpNext||120;G.powerRanks=snap.powerRanks||{};G.heritageNext=snap.heritageNext||null;G.bonusCredits=snap.bonusCredits||0;G.waveMedals=snap.waveMedals||[];
  G.powers={};for(const [k,v] of Object.entries(snap.powers||{})){if(POWERS[k]&&v>0)G.powers[k]=Math.min(v,POWERS[k].duration*POWER_DURATION_MULT*1.15);}G.powerQueue=(snap.queue||[]).filter(k=>POWERS[k]).slice(0,queuedPowerSlotLimit());
  G.player.maxHp+=Math.max(0,(G.level-1)*4);G.player.hp=Math.round(G.player.maxHp*.72);G.player.shield=Math.round(G.player.maxShield*.55);G.player.inv=1.2;
  startPreBossSequence(PREBOSS_DURATION);notify('CHECKPOINT DE DERROTA · JEFE AL 50% · RECOMPENSA COMPLETA','#ffd76a',2.8);return true;
}
function allBossesDefeated(){return allActiveBossesDefeated();} // alias legado; los Boss Rush usan chapterBossesDefeated(id)

let G=null;

// v2.15.19 · ADAPTIVE HIVE BOSS DIRECTOR — SHADOW MODE
// Observa el combate, clasifica A0–A3 y persiste telemetría EXCLUSIVAMENTE local.
// En esta versión NO modifica HP, daño, powers, patrones, locomoción, drops ni fases.
const HIVE_DIRECTOR_CONFIG={mode:'SHADOW',schema:1,sampleInterval:1.0,damageWindow:20,hysteresisSamples:3,minStateTime:4.0,stateCooldown:3.0,maxFights:40};
const HIVE_STATE_RANK={A0:0,A1:1,A2:2,A3:3};
const HIVE_DAMAGE={size:30,sec:Array(30).fill(-1),all:Array(30).fill(0),boss:Array(30).fill(0),firstAll:null,firstBoss:null};
let HIVE_TELEMETRY_CACHE=null;
function hiveNowSec(){return Math.max(0,Math.floor(Number(G?.elapsed||0)));}
function hiveResetDamageMeter(){HIVE_DAMAGE.sec.fill(-1);HIVE_DAMAGE.all.fill(0);HIVE_DAMAGE.boss.fill(0);HIVE_DAMAGE.firstAll=null;HIVE_DAMAGE.firstBoss=null;}
function hiveResetBossDamageMeter(){HIVE_DAMAGE.boss.fill(0);HIVE_DAMAGE.firstBoss=null;}
function hiveDamageBucket(){const sec=hiveNowSec(),i=sec%HIVE_DAMAGE.size;if(HIVE_DAMAGE.sec[i]!==sec){HIVE_DAMAGE.sec[i]=sec;HIVE_DAMAGE.all[i]=0;HIVE_DAMAGE.boss[i]=0;}return {sec,i};}
function hiveRecordPlayerDamage(amount,isBoss=false,kind='normal'){
  amount=Number(amount)||0;if(amount<=0||kind==='debug'||!G)return;const q=hiveDamageBucket();HIVE_DAMAGE.all[q.i]+=amount;if(HIVE_DAMAGE.firstAll===null)HIVE_DAMAGE.firstAll=q.sec;
  if(isBoss){HIVE_DAMAGE.boss[q.i]+=amount;if(HIVE_DAMAGE.firstBoss===null)HIVE_DAMAGE.firstBoss=q.sec;const h=G.hiveDirector;if(h&&!h.finished){h.damageReceivedByBoss=(h.damageReceivedByBoss||0)+amount;}}
}
function hiveRollingDps(windowSec=HIVE_DIRECTOR_CONFIG.damageWindow,bossOnly=false){
  const now=hiveNowSec(),first=bossOnly?HIVE_DAMAGE.firstBoss:HIVE_DAMAGE.firstAll;if(first===null)return 0;const start=Math.max(first,now-windowSec+1);let sum=0;for(let i=0;i<HIVE_DAMAGE.size;i++){const sec=HIVE_DAMAGE.sec[i];if(sec>=start&&sec<=now)sum+=(bossOnly?HIVE_DAMAGE.boss[i]:HIVE_DAMAGE.all[i])||0;}const span=Math.max(1,Math.min(windowSec,now-start+1));return sum/span;
}
function hiveTargetWindow(sector=G?.sector||1){sector=clamp(Math.round(sector||1),1,20);if(sector<=5)return {band:'early',low:45,high:75};if(sector<=10)return {band:'mid',low:55,high:90};if(sector<20)return {band:'advanced',low:70,high:110};return {band:'final',low:90,high:130};}
function hiveBuildSnapshot(){
  const powers=Object.keys(G?.powers||{}).filter(k=>G.powers[k]>0),ranks=powers.map(k=>Math.max(1,Number(G?.powerRanks?.[k]||1))),avgRank=ranks.length?ranks.reduce((a,b)=>a+b,0)/ranks.length:0,combos=Object.keys(G?.activeCombos||{}).length;
  const shotDamage=1+up('damage')*.10,cadence=1/Math.max(.45,1-up('rate')*.055),combat=Number(combatDamageMult())||1,weaponBoost=G?.weaponBoostT>0?(G.weaponBoostMult||1):1,signal=shotDamage*cadence*combat*weaponBoost;
  return {activePowers:powers.length,powerKeys:powers.slice(0,12),avgRank:+avgRank.toFixed(2),maxRank:ranks.length?Math.max(...ranks):0,combos,doctrine:hangarDoctrineKey(),damageUpgrade:up('damage'),rateUpgrade:up('rate'),synergyUpgrade:up('synergy'),permanentUpgrades:Object.fromEntries(Object.entries(META?.upgrades||{}).filter(([,v])=>Number(v)>0).map(([k,v])=>[k,Number(v)||0])),powerStockTotal:Object.values(META?.powerStock||{}).reduce((a,v)=>a+(Number(v)||0),0),supportCount:supportCount(),projectiles:G?.bullets?.length||0,riftAlly:!!G?.riftAlly,weaponBoost:weaponBoost>1,apex:!!(G?.apexT>0),fusionSurge:!!(G?.fusionSurgeT>0),hpRatio:+(G?.player?G.player.hp/Math.max(1,G.player.maxHp):1).toFixed(3),shieldRatio:+(G?.player?G.player.shield/Math.max(1,G.player.maxShield):1).toFixed(3),shotDamageSignal:+shotDamage.toFixed(3),cadenceSignal:+cadence.toFixed(3),combatMultiplier:+combat.toFixed(3),weaponBoostMultiplier:+weaponBoost.toFixed(3),signal:+signal.toFixed(3)};
}
function hivePowerIndex(dps,expectedDps,build){const observed=expectedDps>0?Math.max(0,dps)/expectedDps:0,signal=Math.max(.25,Number(build?.signal)||1);return +(observed>0?(observed*.75+signal*.25):signal).toFixed(3);}
function hiveRawAdaptiveState(dps,ttk,powerIndex,age,target,initial=false){
  const expected=Number(target?.expectedDps)||1,ratio=Math.max(0,Number(dps)||0)/expected,t=Number(ttk);
  if(Number.isFinite(t)&&dps>0&&(t<=Math.min(25,target.low*.42)||(ratio>=2.5&&t<target.low*.72)))return 'A3';
  if(Number.isFinite(t)&&dps>0&&t<target.low*.82&&ratio>=1.35)return 'A2';
  if(!initial&&age>=6&&dps>0&&(t>target.high*1.45||ratio<.48))return 'A0';
  if(initial){if(powerIndex>=2.6)return 'A3';if(powerIndex>=1.65)return 'A2';if(powerIndex<.68)return 'A0';}
  if(!initial&&age>=9&&dps<=.01&&powerIndex<.70)return 'A0';return 'A1';
}
function hiveHysteresisStep(ctx,raw,now){
  if(raw===ctx.state){ctx.candidate=null;ctx.candidateSamples=0;return false;}if(ctx.candidate!==raw){ctx.candidate=raw;ctx.candidateSamples=1;}else ctx.candidateSamples++;
  const stateAge=now-ctx.stateSince,sinceChange=now-ctx.lastTransitionAt;if(ctx.candidateSamples<HIVE_DIRECTOR_CONFIG.hysteresisSamples||stateAge<HIVE_DIRECTOR_CONFIG.minStateTime||sinceChange<HIVE_DIRECTOR_CONFIG.stateCooldown)return false;
  const from=ctx.state;ctx.state=raw;ctx.stateSince=now;ctx.lastTransitionAt=now;ctx.candidate=null;ctx.candidateSamples=0;ctx.transitions.push({at:+now.toFixed(2),from,to:raw});if(HIVE_STATE_RANK[raw]>HIVE_STATE_RANK[ctx.maxState])ctx.maxState=raw;return true;
}
function hivePhaseSkipRisk(ttk,phase=1){if(!Number.isFinite(ttk))return 0;if(phase<=1)return ttk<8?2:ttk<16?1:0;if(phase===2)return ttk<8?1:0;return 0;}
function hiveProposedResponse(state,ctx){
  const p=G?.player||{hp:1,maxHp:1,shield:0,maxShield:1},hp=p.hp/Math.max(1,p.maxHp),sh=p.shield/Math.max(1,p.maxShield),sector=G?.sector||1,ttk=ctx.ttk,dpsRatio=ctx.dpsRatio;
  if(state==='A0'){const help=(hp<.42||sh<.20)?'shield_or_repair':dpsRatio<.58?'damage_or_rate':'context_power';return {type:'SYMBIOTIC_ASSIST',wouldApply:false,resource:help,maxConcurrent:1,maxPerBoss:2,cooldownSec:12,reason:'underpowered_or_low_survival'};}
  if(state==='A1')return {type:'NONE',wouldApply:false,reason:'healthy_range'};
  const severe=state==='A3',extreme=severe&&Number.isFinite(ttk)&&ttk<15,receivedDamageMultiplier=extreme?.70:severe?.78:.88,durationSec=severe?5:4,softGateSec=severe?.9:.65;
  return {type:severe?'DOMINATION_RESPONSE':'OVERPOWER_RESPONSE',wouldApply:false,receivedDamageMultiplier,durationSec,estimatedTtkGainSec:Number.isFinite(ttk)?+(ttk*(1/receivedDamageMultiplier-1)).toFixed(2):null,signaturePriority:severe?'high':'moderate',defensiveMobility:true,tacticalSummonsExistingOnly:true,softGateSec,phaseSkipRisk:hivePhaseSkipRisk(ttk,G?.boss?.phase||1),suppression:sector>=11&&severe?{name:'RIFT_DISRUPTION',durationSec:3.5,telegraph:true,dodgeableCandidate:true,preserveIcons:true,restoreExactState:true,mutatesBuild:false}:null,rebirthEligible:sector>=11&&severe&&Number.isFinite(ttk)&&ttk<25};
}
function hiveSessionId(){try{if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(2);crypto.getRandomValues(a);return `h${a[0].toString(36)}${a[1].toString(36)}`;}}catch(_){}return `h${Math.random().toString(36).slice(2,12)}`;}
function hiveResetRuntimeForRun(){hiveResetDamageMeter();if(G){G.hiveSessionId=hiveSessionId();G.hiveDirector=null;}}
function hiveStartBoss(b){
  if(!G||!b||G.mode==='training')return null;const target=hiveTargetWindow(G.sector),preDps=hiveRollingDps(20,false),build=hiveBuildSnapshot(),startHpRatio=clamp(b.hp/Math.max(1,b.maxHp),.35,1);target.low=+(target.low*startHpRatio).toFixed(2);target.high=+(target.high*startHpRatio).toFixed(2);target.expectedDps=b.hp/((target.low+target.high)/2);const initialTtk=preDps>0?b.hp/preDps:null,index=hivePowerIndex(preDps,target.expectedDps,build),state=hiveRawAdaptiveState(preDps,initialTtk,index,0,target,true),now=G.elapsed||0;
  hiveResetBossDamageMeter();G.hiveDirector={mode:'SHADOW',schema:1,world:G.sector,boss:b.name,sessionId:G.hiveSessionId||hiveSessionId(),startedAt:now,sampleT:0,target,state,initialState:state,maxState:state,stateSince:now,lastTransitionAt:now,candidate:null,candidateSamples:0,transitions:[],preDps:+preDps.toFixed(3),effectiveDps:0,dpsRatio:0,powerIndex:index,powerIndexInitial:index,powerIndexMax:index,ttkInitial:Number.isFinite(initialTtk)?+initialTtk.toFixed(2):null,ttk:null,ttkMin:null,buildInitial:build,buildCurrent:build,proposedResponse:hiveProposedResponse(state,{ttk:initialTtk,dpsRatio:target.expectedDps?preDps/target.expectedDps:0}),proposalHistory:[],damageReceivedByBoss:0,damageToPlayer:0,phasesReached:[b.phase||1],signaturesExecuted:0,softGatesProposed:0,suppressionsProposed:0,maxReductionProposed:1,rebirthProposed:null,finished:false};return G.hiveDirector;
}
function hiveRecordPhase(phase){const h=G?.hiveDirector;if(!h||h.finished)return;if(!h.phasesReached.includes(phase))h.phasesReached.push(phase);}
function hiveRecordSignature(){const h=G?.hiveDirector;if(h&&!h.finished)h.signaturesExecuted=(h.signaturesExecuted||0)+1;}
function hiveRecordPlayerTaken(amount){amount=Math.max(0,Number(amount)||0);const h=G?.hiveDirector;if(h&&!h.finished&&amount>0)h.damageToPlayer=(h.damageToPlayer||0)+amount;}
function hiveSampleDirector(){
  const b=G?.boss,h=G?.hiveDirector;if(!b||!h||h.finished||b.dead)return;const now=G.elapsed||0,age=Math.max(0,now-h.startedAt),dps=hiveRollingDps(HIVE_DIRECTOR_CONFIG.damageWindow,true),target=h.target,build=hiveBuildSnapshot(),ttk=dps>0?Math.max(0,b.hp)/dps:null,projected=Number.isFinite(ttk)?age+ttk:null,index=hivePowerIndex(dps,target.expectedDps,build),ratio=target.expectedDps>0?dps/target.expectedDps:0,raw=hiveRawAdaptiveState(dps,projected,index,age,target,false);
  h.effectiveDps=+dps.toFixed(3);h.dpsRatio=+ratio.toFixed(3);h.ttk=Number.isFinite(ttk)?+ttk.toFixed(2):null;h.projectedTtk=Number.isFinite(projected)?+projected.toFixed(2):null;if(Number.isFinite(ttk))h.ttkMin=h.ttkMin===null?h.ttk:Math.min(h.ttkMin,h.ttk);h.powerIndex=index;h.powerIndexMax=Math.max(h.powerIndexMax,index);h.buildCurrent=build;hiveHysteresisStep(h,raw,now);const proposal=hiveProposedResponse(h.state,{ttk,dpsRatio:ratio});h.proposedResponse=proposal;
  const sig=JSON.stringify([h.state,proposal.type,proposal.receivedDamageMultiplier||1,proposal.resource||'',proposal.suppression?.name||'',proposal.phaseSkipRisk||0]);if(h._proposalSig!==sig){h._proposalSig=sig;h.proposalHistory.push({at:+age.toFixed(2),phase:b.phase,state:h.state,proposal:{...proposal}});if(h.proposalHistory.length>18)h.proposalHistory.shift();}
  if((proposal.phaseSkipRisk||0)>0)h.softGatesProposed=Math.max(h.softGatesProposed,proposal.phaseSkipRisk);if(proposal.suppression)h.suppressionsProposed=Math.max(h.suppressionsProposed,1);if(proposal.receivedDamageMultiplier)h.maxReductionProposed=Math.min(h.maxReductionProposed,proposal.receivedDamageMultiplier);
}
function hiveUpdate(dt){const h=G?.hiveDirector;if(!h||h.finished)return;h.sampleT=(h.sampleT||0)+Math.max(0,dt||0);if(h.sampleT<HIVE_DIRECTOR_CONFIG.sampleInterval)return;h.sampleT%=HIVE_DIRECTOR_CONFIG.sampleInterval;hiveSampleDirector();}
function hiveLoadTelemetry(){if(HIVE_TELEMETRY_CACHE)return HIVE_TELEMETRY_CACHE;let data=null;try{data=JSON.parse(localStorage.getItem(KEY_HIVE_TELEMETRY)||'null');}catch(_){}if(!data||typeof data!=='object')data={schema:1,version:VERSION,fights:[]};data.schema=1;data.version=VERSION;data.fights=Array.isArray(data.fights)?data.fights.slice(-HIVE_DIRECTOR_CONFIG.maxFights):[];HIVE_TELEMETRY_CACHE=data;return data;}
function hivePersistFight(record){const data=hiveLoadTelemetry();data.fights.push(record);if(data.fights.length>HIVE_DIRECTOR_CONFIG.maxFights)data.fights.splice(0,data.fights.length-HIVE_DIRECTOR_CONFIG.maxFights);try{localStorage.setItem(KEY_HIVE_TELEMETRY,JSON.stringify(data));}catch(_){}return data;}
function hiveTelemetrySummary(){const f=hiveLoadTelemetry().fights,states={A0:0,A1:0,A2:0,A3:0};let sum=0,n=0;for(const r of f){states[r.maxState]=(states[r.maxState]||0)+1;if(Number.isFinite(r.ttkReal)){sum+=r.ttkReal;n++;}}return {stored:f.length,limit:HIVE_DIRECTOR_CONFIG.maxFights,states,averageTtk:n?+(sum/n).toFixed(2):null,last:f.length?{world:f[f.length-1].world,boss:f[f.length-1].boss,ttk:f[f.length-1].ttkReal,maxState:f[f.length-1].maxState,result:f[f.length-1].result}:null};}
function hiveFinalizeBoss(result='victory'){
  const h=G?.hiveDirector,b=G?.boss;if(!h||h.finished)return null;hiveSampleDirector();const duration=Math.max(.01,(G.elapsed||0)-h.startedAt),extreme=h.maxState==='A3'&&duration<25,rebirth=G.sector>=11&&extreme?{wouldActivate:true,returnHpRatio:G.sector===20?.50:.40,reason:'extreme_fast_kill',behaviorMustChange:true,requiredChanges:['locomotion','pattern','signaturePriority','aggression'],maxPerBoss:1}:null;h.rebirthProposed=rebirth;h.finished=true;
  const rec={schema:1,version:VERSION,mode:'SHADOW',world:h.world,boss:h.boss,timestamp:Date.now(),sessionId:h.sessionId,runMode:G.mode||'campaign',difficulty:G.runDifficulty||'normal',dpsPreBoss:h.preDps,dpsDuringBoss:h.effectiveDps,powerIndexInitial:h.powerIndexInitial,powerIndexMax:h.powerIndexMax,ttkInitial:h.ttkInitial,ttkMinimum:h.ttkMin,ttkProjectedTotal:h.projectedTtk,ttkReal:+duration.toFixed(2),stateInitial:h.initialState,maxState:h.maxState,stateChanges:h.transitions.slice(),helpsProposed:h.proposalHistory.filter(x=>x.state==='A0').map(x=>({at:x.at,phase:x.phase,resource:x.proposal.resource,maxConcurrent:x.proposal.maxConcurrent,maxPerBoss:x.proposal.maxPerBoss,cooldownSec:x.proposal.cooldownSec})),reactiveArmorProposed:h.proposalHistory.filter(x=>x.proposal.receivedDamageMultiplier).map(x=>({at:x.at,phase:x.phase,multiplier:x.proposal.receivedDamageMultiplier,durationSec:x.proposal.durationSec,ttkGain:x.proposal.estimatedTtkGainSec})),maxReductionProposed:h.maxReductionProposed,maxDamageReductionFraction:+(1-h.maxReductionProposed).toFixed(3),suppressionsProposed:h.proposalHistory.filter(x=>x.proposal.suppression).map(x=>({at:x.at,phase:x.phase,...x.proposal.suppression})),softGatesProposed:h.proposalHistory.filter(x=>(x.proposal.phaseSkipRisk||0)>0).map(x=>({at:x.at,phase:x.phase,durationSec:x.proposal.softGateSec,risk:x.proposal.phaseSkipRisk})),softGateRiskMax:h.softGatesProposed,rebirthProposed:rebirth?{phase:b?.phase||null,...rebirth}:null,duration:+duration.toFixed(2),damageToPlayer:+(h.damageToPlayer||0).toFixed(2),damageReceivedByBoss:+(h.damageReceivedByBoss||0).toFixed(2),phasesReached:[...h.phasesReached],signaturesExecuted:h.signaturesExecuted||0,result,buildInitial:h.buildInitial,buildFinal:h.buildCurrent};h.record=rec;hivePersistFight(rec);return rec;
}
function hiveDirectorStatus(){const h=G?.hiveDirector;return {version:VERSION,mode:'SHADOW',gameplayIntervention:false,sampleInterval:HIVE_DIRECTOR_CONFIG.sampleInterval,damageWindow:HIVE_DIRECTOR_CONFIG.damageWindow,powerIndex:h?.powerIndex??null,effectiveDps:h?.effectiveDps??0,ttk:h?.ttk??null,projectedTtk:h?.projectedTtk??null,adaptiveState:h?.state||null,hysteresis:h?{candidate:h.candidate,candidateSamples:h.candidateSamples,required:HIVE_DIRECTOR_CONFIG.hysteresisSamples,minStateTime:HIVE_DIRECTOR_CONFIG.minStateTime,cooldown:HIVE_DIRECTOR_CONFIG.stateCooldown}:null,proposedResponse:h?.proposedResponse||null,currentBoss:h?{world:h.world,name:h.boss,phase:G?.boss?.phase||0}:null,telemetrySummary:hiveTelemetrySummary()};}
function hiveDirectorSelfTest(){
  const target={low:70,high:110,expectedDps:10},cases={A0:hiveRawAdaptiveState(3,180,.5,10,target,false),A1:hiveRawAdaptiveState(10,90,1,10,target,false),A2:hiveRawAdaptiveState(16,50,1.7,10,target,false),A3:hiveRawAdaptiveState(30,20,3,10,target,false)};const ctx={state:'A1',maxState:'A1',stateSince:0,lastTransitionAt:0,candidate:null,candidateSamples:0,transitions:[]};const h1=hiveHysteresisStep(ctx,'A2',5),h2=hiveHysteresisStep(ctx,'A2',6),h3=hiveHysteresisStep(ctx,'A2',7);return {states:cases,statesPass:Object.entries(cases).every(([k,v])=>k===v),hysteresis:{first:h1,second:h2,third:h3,state:ctx.state,pass:!h1&&!h2&&h3&&ctx.state==='A2'},shadowNoIntervention:true,pass:Object.entries(cases).every(([k,v])=>k===v)&&!h1&&!h2&&h3&&ctx.state==='A2'};
}
window.__SWARM_HIVE_DIRECTOR_STATUS=()=>hiveDirectorStatus();
window.__SWARM_HIVE_DIRECTOR_SELFTEST=()=>hiveDirectorSelfTest();
window.__SWARM_HIVE_TELEMETRY_SUMMARY=()=>hiveTelemetrySummary();

let shopReturn='MENU';
let notices=[];
let shake=0,flash=0;
const UI={buttons:[]};

function makePlayer(){
  const hp=100+up('hull')*12+(relicUnlocked(7)?8:0),sh=45+up('shield')*10+(relicUnlocked(8)?10:0);
  return {x:W*.2,y:H*.5,vx:0,vy:0,r:17,hp,maxHp:hp,shield:sh,maxShield:sh,inv:0,fire:0};
}
function newRun(startSector=1,mode='campaign',runDifficultyChoice=null){
  PlaylistX.stop();META.runs=(META.runs||0)+1;const runDiff=mode==='training'?'normal':(runDifficultyChoice||META.selectedDifficulty||'normal');
  G={screen:'GAME',mode,runDifficulty:runDiff,sector:clamp(startSector,1,Math.min(META.unlocked,activeSectorCount())),wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],powerMines:[],boss:null,
    kills:0,goal:waveGoal(startSector,1),spawn:0,obstacleTimer:2.4,frontTimer:mode==='training'?5.5:7.5,powerMeter:0,powerDropsThisSector:0,powers:{},powerQueue:[],sectorClear:false,bossPending:false,
    waveBanner:2.2,sectorBanner:3.2,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:0,level:1,xpNext:120,maxActivePowers:activePowerSlotLimit(),maxQueuePowers:queuedPowerSlotLimit(),
    heritageNext:null,activeCombos:{},comboSeenThisRun:{},powerDropHistory:[],fusionSurgeT:0,fusionSurgeCd:0,fusionSurgeTier:0,overflowPowerKey:null,overflowPowerMax:0,apexCharge:0,apexT:0,apexMax:0,apexPulseT:0,masteryIVSeen:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,frenzyKills:0,frenzyTarget:0,frenzyDone:false,frenzySupportUsed:false,bossWarningT:0,bossWarningText:'',
    bossCheckpoint:false,bossCheckpointKind:'',lostAtBoss:false,trainingBoss:false,preBossT:0,preBossMax:0,postBossT:0,postBossMax:0,frontKills:0,waveFrontKills:0,waveHits:0,waveStartT:0,waveMedals:[],powerRanks:{},bossHits:0,bossMasteryAchieved:false,bonusCredits:0,resinCharges:0,rewardLedger:{credits:{},xp:{}},pendingBossReward:null,bossRewardView:null,campaignComplete:false,chapterComplete:false,completedChapterId:0,finalReward:0,lastRelic:0,bossRushChapter:0,bossRushStartSector:0,bossRushEndSector:0,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0,directorIndex:0,directorCooldown:2.5,directorHistory:[],directorPressureT:0,directorPressure:1,directorPhase:'RECONOCIMIENTO',transversalTimer:rnd(7.5,11.5),lieutenantSpawned:false,lieutenantKilled:false,preBossSetpieces:[],preBossCueStage:0,worldAmbientStarted:false,ambientProps:[],ambientPropTimer:rnd(1.0,2.0),worldEventTimer:rnd(15,22),worldEventHistory:[],worldEventCount:0,pressureReliefWave:0,shieldCriticalWarned:false,shieldHitT:0,bossArrivalStage:0,bossArrivalBanner:null,waveObjective:null,objectiveHistory:[],objectiveTargets:[],objectiveCapsule:null,emergencyHealthDrops:{half:false,quarter:false,critical:false},lieutenantQueue:[],lieutenantExpected:0,lieutenantKills:0,preBossEscalationActive:false,preBossEscalationId:'',commanderReinforceT:0,commanderSupportT:0,commanderSupportBudget:0,weaponBoostT:0,weaponBoostMult:1,weaponBoostStacks:0,microSwarmTimer:rnd(2.8,5.0),microKills:0,microSwarmBursts:0,microStreak:0,microStreakT:0,actionGapT:0,familyCalls:0,familyBossResponses:0,bossFamilySwarmTimer:0,familyPlayTimer:rnd(6.8,10.5),familyPlay:null,familyPlaySerial:0,familyPlayCount:0,familyPlayBreaks:0,behaviorSampleT:0,behaviorZoneT:{upper:0,center:0,lower:0},behaviorLastZone:'center',behaviorSwitches:0,behaviorRead:'UNREAD',behaviorConfidence:0,behaviorCounterPlays:0,recoveryGraceT:0,riftAlly:null,riftAllyUsed:false,lastChanceT:0,lastChanceMax:5,lastChanceRescued:false};
  hiveResetRuntimeForRun();enterSector(startSector,true);if(mode==='campaign')deployHangarLoadout();setScreen('GAME');tryFullscreen();AudioX.unlock();MusicX.reconcile(true);notify(mode==='training'?'ENTRENAMIENTO · DAÑO ENEMIGO REDUCIDO':`MODO ${RUN_DIFFICULTY[runDiff].label} · DIRECTOR DE COMBATE ACTIVO`,mode==='training'?'#8edbff':runDiff==='hard'?'#ff9a73':'#9dffbf',2.8);saveMeta();
}
function startTraining(){
  newRun(1,'training');G.goal=10;G.wave=1;G.player.maxHp=Math.round(G.player.maxHp*1.25);G.player.hp=G.player.maxHp;G.player.maxShield=Math.round(G.player.maxShield*1.2);G.player.shield=G.player.maxShield;G.frontTimer=4.8;notify('MODO ENTRENAMIENTO · 10 OBJETIVOS + JEFE DE PRÁCTICA','#9fe6ff',3);
}
function startBossCheckpoint(sector){
  const loss=bossLossCheckpointFor(sector);if(loss&&!sectorDefeated(sector))return startBossLossCheckpoint(loss);
  if(!sectorDefeated(sector)){notify('DERROTA PRIMERO AL JEFE','#ff7f92',1.8);return;}
  newRun(sector,'replayBoss');G.bossCheckpoint=true;G.bossCheckpointKind='replay';G.waveObjective=null;G.objectiveTargets=[];G.objectiveCapsule=null;G.wave=3;G.kills=G.goal;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.bossPending=false;startPreBossSequence(PREBOSS_DURATION);notify('CHECKPOINT DE ARENA · APROXIMACIÓN 3s · JEFE AL 50%','#ffd76a',2.4);
}
function startBossRush(chapterId=1){
  const spec=rushSpec(chapterId);if(!spec.implemented){notify(`${spec.label} · CONTENIDO AÚN NO IMPLEMENTADO`,'#6f8799',2.2);return;}if(!spec.complete){notify(`${spec.label} · DERROTA SUS ${spec.count} JEFES PRIMERO`,'#ff7f92',2.2);return;}
  newRun(spec.start,'bossRush');G.waveObjective=null;G.objectiveTargets=[];G.objectiveCapsule=null;G.bossRushChapter=spec.id;G.bossRushStartSector=spec.start;G.bossRushEndSector=spec.end;G.bossRushIndex=spec.start;G.bossRushScore=0;G.bossRushResults=[];G.bossRushReward=0;G.bossRushRank='';G.bossRushStart=performance.now();G.wave=3;G.kills=G.goal;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.bossPending=false;G.bossCheckpoint=false;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;spawnBoss();notify(`${spec.label} · ${spec.count} JEFES · SIN HORDAS`,'#fff09a',3);
}
function startGrandBossRush(){startBossRush('grand');}
function advanceBossRush(){
  if(G.mode!=='bossRush')return false;const spec={id:G.bossRushChapter||1,start:G.bossRushStartSector||rushSpec(G.bossRushChapter||1).start,end:G.bossRushEndSector||rushSpec(G.bossRushChapter||1).end};
  const next=G.sector+1;if(next>spec.end){
    G.bossRushTime=(G.bossRushResults||[]).reduce((a,r)=>a+(r.time||0),0);G.bossRushRank=bossRushRank(G.bossRushResults||[]);const rv=rushRankValue(G.bossRushRank),count=spec.end-spec.start+1,reward=grantCredits(Math.round((520+count*28+rv*360+(G.bossRushResults||[]).filter(r=>r.grade==='S').length*90)*runDifficulty().reward),'bossrush_final',true);G.bossRushReward=reward;
    if(spec.id==='grand'){const st=META.grandBossRush;st.wins=(st.wins||0)+1;st.bestScore=Math.max(st.bestScore||0,G.score||0);if(!st.bestTime||G.bossRushTime<st.bestTime)st.bestTime=G.bossRushTime;if(!st.bestRank||rv>rushRankValue(st.bestRank))st.bestRank=G.bossRushRank;}
    else{const st=META.bossRushStats[spec.id]||(META.bossRushStats[spec.id]={wins:0,bestScore:0,bestRank:'',bestTime:0});st.wins=(st.wins||0)+1;st.bestScore=Math.max(st.bestScore||0,G.score||0);if(!st.bestTime||G.bossRushTime<st.bestTime)st.bestTime=G.bossRushTime;if(!st.bestRank||rv>rushRankValue(st.bestRank))st.bestRank=G.bossRushRank;if(spec.id===1){META.bossRushWins=st.wins;META.bestBossRush=st.bestScore;META.bestBossRushTime=st.bestTime;META.bestBossRushRank=st.bestRank;}}
    saveMeta();G.bossRushComplete=true;setScreen('VICTORY');return true;
  }
  G.bossRushIndex=next;G.sector=next;G.wave=3;G.kills=G.goal=waveGoal(next,3);G.sectorClear=false;G.boss=null;G.bossAftermath=null;G.bossPending=false;G.postBossT=0;G.postBossMax=0;G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.pickups.length=0;G.player.hp=Math.min(G.player.maxHp,G.player.hp+G.player.maxHp*.24);G.player.shield=Math.min(G.player.maxShield,G.player.shield+G.player.maxShield*.42);G.player.inv=1.2;G.bossHits=0;G.bossMasteryAchieved=false;G.sectorBanner=1.4;spawnBoss();const pos=bossRushPosition();notify(`BOSS RUSH ${pos.index}/${pos.total} · ${SECTORS[next-1].boss}`,SECTORS[next-1].accent,2.4);return true;
}
function enterSector(n,keepPlayer=false){
  const priorObjectiveHistory=[...(G.objectiveHistory||[])].slice(-2);
  G.sector=clamp(n,1,SECTORS.length);streamPrepareWorld(G.sector,'enter-sector');G.wave=1;G.kills=0;G.goal=waveGoal(G.sector,1);G.powerMeter=0;G.powerDropsThisSector=0;G.spawn=.72;G.obstacleTimer=G.sector===1?2.8:2.2;G.frontTimer=G.mode==='training'?5.5:rnd(6.5,10.5);G.boss=null;G.bossAftermath=null;G.bossPending=false;G.preBossT=0;G.preBossMax=0;PreBossX.stop(false);G.sectorClear=false;G.postBossT=0;G.bossCheckpoint=false;
  G.enemies.length=0;G.bullets.length=0;G.eBullets.length=0;G.pickups.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.particles.length=0;G.activeCombos={};G.fusionSurgeT=0;G.fusionSurgeCd=0;G.powerDropHistory=[];G.masteryIVSeen={};
  if(!keepPlayer)G.player=makePlayer();else{G.player.x=W*.2;G.player.y=H*.5;G.player.hp=G.player.maxHp;G.player.shield=G.player.maxShield;G.player.inv=.8;}
  G.sectorBanner=3;G.waveBanner=2;G.frenzyT=0;G.frenzyWave=0;G.frenzyMult=1;G.frenzyKills=0;G.frenzyTarget=0;G.frenzyDone=false;G.frenzySupportUsed=false;G.waveHits=0;G.waveFrontKills=0;G.waveStartT=G.elapsed;G.bossHits=0;G.bossMasteryAchieved=false;G.bossWarningT=0;G.bossWarningText='';G.transversalTimer=rnd(7.0,11.0);G.lieutenantSpawned=false;G.lieutenantKilled=false;G.lieutenantQueue=[];G.lieutenantExpected=0;G.lieutenantKills=0;G.commanderReinforceT=0;G.commanderSupportT=0;G.commanderSupportBudget=0;G.weaponBoostT=0;G.weaponBoostMult=1;G.weaponBoostStacks=0;G.microSwarmTimer=rnd(2.4,4.8);G.microKills=0;G.microSwarmBursts=0;G.microStreak=0;G.microStreakT=0;G.actionGapT=0;G.familyCalls=0;G.familyBossResponses=0;G.bossFamilySwarmTimer=0;G.familyPlayTimer=rnd(G.sector>=16?5.8:7.2,G.sector>=16?8.6:10.8);G.familyPlay=null;G.familyPlaySerial=0;G.familyPlayCount=0;G.familyPlayBreaks=0;G.behaviorSampleT=0;G.behaviorZoneT={upper:0,center:0,lower:0};G.behaviorLastZone='center';G.behaviorSwitches=0;G.behaviorRead='UNREAD';G.behaviorConfidence=0;G.behaviorCounterPlays=0;G.recoveryGraceT=0;G.riftAlly=null;G.riftAllyUsed=false;G.lastChanceT=0;G.lastChanceRescued=false;G.preBossSetpieces=[];G.preBossCueStage=0;G.worldAmbientStarted=false;G.ambientProps=[];G.ambientPropTimer=rnd(1.0,2.0);G.worldEventTimer=rnd(15,22);G.worldEventHistory=[];G.worldEventCount=0;G.pressureReliefWave=0;G.shieldCriticalWarned=false;G.shieldHitT=0;G.bossArrivalStage=0;G.bossArrivalBanner=null;G.waveObjective=null;G.objectiveHistory=keepPlayer?priorObjectiveHistory:[];G.objectiveTargets=[];G.objectiveCapsule=null;G.emergencyHealthDrops={half:false,quarter:false,critical:false};resetCombatDirector();prepareWaveObjective();PreBossX.preload(G.sector);MusicX.preloadBoss(G.sector);if(G.mode!=='bossRush'&&G.mode!=='training'){PreBossX.start(G.sector);G.worldAmbientStarted=true;}if(G.sector>=4)notify(`${SECTORS[G.sector-1].code} · AMBIENTE ESPECÍFICO ACTIVADO`,SECTORS[G.sector-1].accent,1.8);notify(`DIRECTOR · ${directorProfile().label}`,SECTORS[G.sector-1].accent,1.55);if(G.sector>=11&&G.mode==='campaign'){const fg=familyCombatGrammar();if(fg)notify(`DOCTRINA DE FAMILIA · ${fg.label}`,SECTORS[G.sector-1].accent,1.8);const act=waveActLabel();if(act)notify(`ACTO I · ${act}`,SECTORS[G.sector-1].accent,1.65);}if(G.mode==='campaign'&&isChapterEndSector(G.sector)){const ch=chapterForSector(G.sector);notify(`${ch.title} · SECTOR FINAL`,SECTORS[G.sector-1].accent,2.7);}
  if(G.heritageNext){const hk=G.heritageNext;G.heritageNext=null;activatePower(hk,'heritage',12);notify(`HERENCIA DE JEFE · ${HERITAGE_NAMES[G.sector-1]||POWERS[hk].name}`,'#ffd76a',2.5);}
}
const ENEMY_COUNT_MULT=1.30;
const POWER_DURATION_MULT=1.10;
const BOSS_TOUGHNESS_MULT=1.24;
// v2.11.1 · Resistencia por tramo: primeros 5 recuperan presencia; 6–10 escalan con claridad.
const BOSS_ENDURANCE_CURVE=[null,2.30,1.88,1.95,2.02,2.10,2.19,2.29,2.39,2.49,2.60];
function bossEnduranceMult(sector=G?.sector||1){
  const s=Math.max(1,Math.round(sector));if(BOSS_ENDURANCE_CURVE[s])return BOSS_ENDURANCE_CURVE[s];
  return Math.min(3.00,BOSS_ENDURANCE_CURVE[10]+Math.max(0,s-10)*.035);
}
// v2.11.7 · Ritmo mínimo por fase: evita que el DPS acumulado salte fases y permite que la banda del jefe respire.
function bossPhaseMinDuration(sector=G?.sector||1,phase=1){
  if(G?.mode==='training')return 0;
  const s=Math.max(1,Math.round(sector)),late=s>=6;
  const base=late?[13.5,15.5,17.0]:s>=4?[12.5,14.5,16.0]:[11.5,13.5,15.0];
  let t=base[Math.max(0,Math.min(2,phase-1))]+Math.max(0,s-1)*.16;
  if(runDifficultyKey()==='hard')t+=1.8;
  if(G?.mode==='bossRush')t*=.82;
  return t;
}
function activeLieutenants(){return (G?.enemies||[]).filter(e=>e&&!e.dead&&e.kind==='lieutenant');}
function activeLieutenant(){return activeLieutenants()[0]||null;}
function defeatedCommanderSectors(){if(!G||G.sector<=1||G.mode==='training'||G.mode==='bossRush')return [];const out=[];for(let s=1;s<G.sector;s++)if(sectorDefeated(s))out.push(s);return out;}
function commanderConcurrentCap(total=(G?.lieutenantExpected||defeatedCommanderSectors().length)){if(total<=1)return 1;let cap=total>=5?3:2;if(runDifficultyKey()==='hard'&&total>=7)cap=4;if(compactUI())cap=Math.min(cap,3);return Math.max(1,cap);}
function commanderHpFactor(total){const hard=runDifficultyKey()==='hard';if(total<=1)return hard?.50:.42;if(total===2)return hard?.43:.36;if(total<=4)return hard?.37:.31;if(total<=6)return hard?.33:.27;return hard?.30:.24;}
function commanderSupportDrop(type='auto',x=null,y=null){if(!G?.boss||G.sectorClear||(G.commanderSupportBudget||0)<=0)return null;const p=G.player,sr=p.shield/Math.max(1,p.maxShield);let kind=type;if(kind==='auto')kind=sr<.48?'shield':(G.weaponBoostT||0)<2?'weaponBoost':'shield';const q=spawnPickup(x??clamp(p.x+rnd(70,125),70,W-70),y??clamp(p.y+rnd(-70,70),60,H-60),kind);q.life=22;q.commanderSupport=true;G.commanderSupportBudget=Math.max(0,(G.commanderSupportBudget||0)-1);return q;}
function prepareCommanderConvergence(force=false){if(!G?.boss||G.mode==='training'||G.mode==='bossRush'||G.sector<=1)return 0;if(G.lieutenantSpawned&&!force)return G.lieutenantExpected||0;const list=defeatedCommanderSectors();G.lieutenantSpawned=true;G.lieutenantQueue=[...list].reverse();G.lieutenantExpected=list.length;G.lieutenantKills=0;G.commanderReinforceT=0;G.commanderSupportT=6.5;G.commanderSupportBudget=Math.min(7,2+Math.ceil(list.length/2));return list.length;}
function deployCommanderConvergence(force=false){if(!G?.boss||G.boss.dead||G.mode==='training'||G.mode==='bossRush')return 0;if(!G.lieutenantSpawned)prepareCommanderConvergence();const q=G.lieutenantQueue||[];if(!q.length)return 0;const cap=commanderConcurrentCap(),active=activeLieutenants().length,slots=Math.max(0,cap-active);if(slots<=0)return 0;const n=Math.min(q.length,slots),total=G.lieutenantExpected||q.length;for(let i=0;i<n;i++){const src=q.shift();spawnLieutenant(src,active+i,total,true);}if(n>1)notify(`CONVERGENCIA DE MANDO · ${n} JEFES DERROTADOS REGRESAN`,'#fff09a',1.75);else if(n===1)notify(`REFUERZO DE MANDO · ${SECTORS[(G.enemies.find(e=>!e.dead&&e.kind==='lieutenant'&&e.justSpawned)?.lieutenantSector||1)-1]?.boss||'TENIENTE'}`,'#fff09a',1.15);for(const e of activeLieutenants())e.justSpawned=false;if(activeLieutenants().length>=2&&G.commanderSupportBudget>0){const sr=G.player.shield/Math.max(1,G.player.maxShield);if(sr<.78)commanderSupportDrop('shield');if((G.commanderSupportBudget||0)>0&&(G.weaponBoostT||0)<2)commanderSupportDrop('weaponBoost');}return n;}
function updateCommanderConvergence(dt){if(!G?.boss||G.boss.dead||G.boss.dying||G.boss.phase<2||G.mode==='training'||G.mode==='bossRush')return;const active=activeLieutenants().length,q=G.lieutenantQueue||[],cap=commanderConcurrentCap();G.commanderReinforceT=Math.max(0,(G.commanderReinforceT||0)-dt);G.commanderSupportT=Math.max(0,(G.commanderSupportT||0)-dt);if(q.length&&active<cap&&G.commanderReinforceT<=0){deployCommanderConvergence();G.commanderReinforceT=1.35;}if(active>=2&&(G.commanderSupportBudget||0)>0&&G.commanderSupportT<=0){commanderSupportDrop('auto');G.commanderSupportT=runDifficultyKey()==='hard'?10.5:8.5;}}

function bossPhaseFloorRatio(phase){return phase===1?.681:phase===2?.341:.006;}
function bossSupportFormation(b,sec,phase=b.phase,transition=false){
  if(G.mode==='training')return 0;
  const hard=runDifficultyKey()==='hard',pressure=bossPressureProfile(G.sector),forms=sec.forms||[],modes=['top','bottom','diagTop','diagBottom','right'];
  let n=Math.min(4,Math.max(1,pressure.count+(phase===3?1:0)+(hard&&transition?1:0)));const commanderLoad=activeLieutenants().length;if(commanderLoad>=2)n=Math.min(n,commanderLoad>=3?1:2);
  let patternModes=modes;
  if(b.pattern==='storm')patternModes=['diagTop','diagBottom','top','bottom'];
  else if(b.pattern==='titan')patternModes=['right','right','top','bottom'];
  else if(b.pattern==='blade')patternModes=['diagTop','diagBottom','right','top'];
  else if(b.pattern==='moth')patternModes=['top','diagTop','bottom','diagBottom'];
  else if(b.pattern==='queen')patternModes=['right','top','bottom','right'];
  else if(b.pattern==='leap')patternModes=['top','bottom','diagTop','diagBottom'];
  else if(b.pattern==='blood')patternModes=['diagTop','diagBottom','top','bottom'];
  else if(b.pattern==='architect')patternModes=['right','right','top','bottom'];
  else if(b.pattern==='odonata')patternModes=['diagTop','diagBottom','top','bottom'];
  else if(b.pattern==='resonance')patternModes=['top','bottom','diagTop','diagBottom'];
  for(let i=0;i<n;i++){
    const tier=phase===1?0:(phase===2?(i===n-1?1:0):(i%3===0?2:1));
    spawnEnemy(forms[Math.min(forms.length-1,tier)]||forms[0],null,null,patternModes[i%patternModes.length]);
  }
  if(transition&&phase>=2){G.particles.push({kind:'shock',x:b.x,y:b.y,r:16,vr:300,life:.55,max:.55,col:sec.accent});}
  return n;
}
const BOSS_PRESSURE_CURVE=[null,
  {stamina:100,break:2.35,drain:.060,closed:.80,move:1.00,cool:.98,support:6.4,count:1},
  {stamina:112,break:2.25,drain:.058,closed:.79,move:1.03,cool:.96,support:6.1,count:1},
  {stamina:122,break:2.18,drain:.057,closed:.78,move:1.05,cool:.94,support:5.8,count:1},
  {stamina:132,break:2.10,drain:.056,closed:.77,move:1.07,cool:.92,support:5.5,count:1},
  {stamina:142,break:2.02,drain:.055,closed:.76,move:1.09,cool:.90,support:5.2,count:2},
  {stamina:150,break:1.94,drain:.054,closed:.75,move:1.11,cool:.88,support:4.9,count:2},
  {stamina:158,break:1.86,drain:.053,closed:.74,move:1.13,cool:.86,support:4.6,count:2},
  {stamina:166,break:1.80,drain:.052,closed:.73,move:1.15,cool:.84,support:4.3,count:2},
  {stamina:174,break:1.74,drain:.051,closed:.72,move:1.17,cool:.82,support:4.0,count:2},
  {stamina:184,break:1.68,drain:.050,closed:.71,move:1.19,cool:.80,support:3.8,count:3}
];
function bossPressureProfile(sector=G?.sector||1){const s=Math.max(1,Math.round(sector));if(BOSS_PRESSURE_CURVE[s])return BOSS_PRESSURE_CURVE[s];const b=BOSS_PRESSURE_CURVE[10];return {...b,stamina:Math.min(240,b.stamina+(s-10)*5),move:Math.min(1.30,b.move+(s-10)*.01),support:Math.max(3.1,b.support-(s-10)*.05)};}
function bossDefenseProfile(sector=G?.sector||1){
  if(sector===1)return {armor:.66,core:1.14,coreDuration:1.55,phaseLock:1.32,attack:1.22,support:2};
  const late=sector>=6;
  return late?{armor:.69,core:1.17,coreDuration:1.60,phaseLock:1.34,attack:1.20,support:2}:{armor:.73,core:1.22,coreDuration:1.82,phaseLock:1.18,attack:1.12,support:1};
}
const LIEUTENANT_ENDURANCE={normalHp:.42,hardHp:.50,normalArmor:.82,hardArmor:.78,attack:1.16};
// v2.12.1.2 · +10% de presión efectiva del mando, distribuida entre resistencia, daño y tempo.
// Se evita resolver el aumento únicamente con HP para conservar combates legibles y con decisiones.
const COMMANDER_DIFFICULTY={hp:1.03,stamina:1.03,damage:1.03,tempo:.98,move:1.015,contact:1.03};
const COMMANDER_PROJECTILES={
  storm:{style:'stinger',label:'AGUIJÓN',col:'#ffe66f'},
  titan:{style:'shell',label:'CAPARAZÓN',col:'#c9ff77'},
  blade:{style:'razor',label:'CUCHILLA',col:'#ff9a55'},
  moth:{style:'spore',label:'ESPORA',col:'#e9b7ff'},
  queen:{style:'brood',label:'FERROAGUJA',col:'#ff746b'},
  leap:{style:'kinetic',label:'DISCO CINÉTICO',col:'#dfff6b'},
  blood:{style:'blood',label:'GOTA HEMÁTICA',col:'#ff6175'},
  architect:{style:'resin',label:'NODO DE RESINA',col:'#ffd56a'},
  odonata:{style:'prism',label:'LANZA PRISMÁTICA',col:'#78ecff'},
  resonance:{style:'sonic',label:'ONDA SÓNICA',col:'#d9a7ff'}
};
function commanderProjectileFx(source,role='primary',legacyUnscaled=false){
  if(!source)return null;const d=COMMANDER_PROJECTILES[source.pattern]||{style:'commander',col:'#ff768e'};
  return {commander:true,style:d.style,role,pattern:source.pattern||'',col:d.col,spin:rnd(-3.2,3.2),phase:rnd(0,TAU),age:0,bounces:d.style==='kinetic'&&role!=='primary'?1:0,legacyUnscaled};
}

const BALANCE_CURVE=[null,
 {enemyHp:.92,enemyDmg:.90,bossHp:1.04,pressure:1.00,maxAlive:.94,reward:.96},{enemyHp:.94,enemyDmg:.93,bossHp:1.06,pressure:1.03,maxAlive:.97,reward:.99},{enemyHp:.96,enemyDmg:.96,bossHp:1.07,pressure:1.06,maxAlive:1.00,reward:1.02},{enemyHp:.98,enemyDmg:.99,bossHp:1.08,pressure:1.09,maxAlive:1.02,reward:1.05},{enemyHp:1.00,enemyDmg:1.02,bossHp:1.09,pressure:1.12,maxAlive:1.04,reward:1.08},
 {enemyHp:1.01,enemyDmg:1.05,bossHp:1.10,pressure:1.15,maxAlive:1.06,reward:1.11},{enemyHp:1.02,enemyDmg:1.08,bossHp:1.11,pressure:1.18,maxAlive:1.08,reward:1.14},{enemyHp:1.03,enemyDmg:1.11,bossHp:1.12,pressure:1.21,maxAlive:1.10,reward:1.17},{enemyHp:1.04,enemyDmg:1.14,bossHp:1.13,pressure:1.24,maxAlive:1.12,reward:1.20},{enemyHp:1.05,enemyDmg:1.17,bossHp:1.14,pressure:1.27,maxAlive:1.14,reward:1.23},
 {enemyHp:1.055,enemyDmg:1.20,bossHp:1.15,pressure:1.30,maxAlive:1.15,reward:1.27},{enemyHp:1.06,enemyDmg:1.23,bossHp:1.16,pressure:1.33,maxAlive:1.16,reward:1.31},{enemyHp:1.065,enemyDmg:1.26,bossHp:1.17,pressure:1.36,maxAlive:1.17,reward:1.35},{enemyHp:1.07,enemyDmg:1.29,bossHp:1.18,pressure:1.39,maxAlive:1.18,reward:1.39},{enemyHp:1.075,enemyDmg:1.32,bossHp:1.19,pressure:1.42,maxAlive:1.19,reward:1.43},
 {enemyHp:1.08,enemyDmg:1.35,bossHp:1.20,pressure:1.45,maxAlive:1.20,reward:1.47},{enemyHp:1.085,enemyDmg:1.38,bossHp:1.21,pressure:1.48,maxAlive:1.21,reward:1.51},{enemyHp:1.09,enemyDmg:1.41,bossHp:1.22,pressure:1.51,maxAlive:1.22,reward:1.55},{enemyHp:1.095,enemyDmg:1.44,bossHp:1.23,pressure:1.54,maxAlive:1.23,reward:1.59},{enemyHp:1.10,enemyDmg:1.47,bossHp:1.24,pressure:1.57,maxAlive:1.24,reward:1.64}
];
function sectorBalance(s=G?.sector||1){const n=clamp(Math.max(1,Math.round(s)),1,20);return BALANCE_CURVE[n]||BALANCE_CURVE[20];}
const RUN_DIFFICULTY={
  normal:{label:'NORMAL',enemyCount:1,maxAlive:1,enemySpeed:1,enemyDamage:1,bossHp:1,reward:1,xp:1,pressure:1,eliteBias:0},
  hard:{label:'DIFÍCIL',enemyCount:1.23,maxAlive:1.22,enemySpeed:1.13,enemyDamage:1.20,bossHp:1.32,reward:1.32,xp:1.25,pressure:1.16,eliteBias:.34}
};
function runDifficultyKey(){return G?.runDifficulty==='hard'?'hard':'normal';}
function runDifficulty(){return RUN_DIFFICULTY[runDifficultyKey()];}
function toggleDifficulty(){META.selectedDifficulty=META.selectedDifficulty==='hard'?'normal':'hard';saveMeta();notify(`DIFICULTAD · ${RUN_DIFFICULTY[META.selectedDifficulty].label}`,META.selectedDifficulty==='hard'?'#ff9a73':'#a6ff5f',1.4);}

// ─────────────────────────────────────────────────────────────
// v2.12.2 · COMBAT DIRECTOR PROFILES BY WORLD
// Cada sector modifica preferencias y tempo sin sustituir el Director base.
// La identidad se construye con patrones, composición y entradas; no con HP extra.
// ─────────────────────────────────────────────────────────────
const COMBAT_DIRECTOR_PROFILES=[null,
 {id:'vespa',label:'VELOCIDAD DE ENJAMBRE',events:{swarm:3.2,pincer:3.0,front:2.0,elite:1.8,cross:1.0,transversal:1.1,heavy:.45,debris:.35,siege:.25,powercache:.7,carrier:.65,hunter:.5},objectives:{priority:2.8,carrier:2.1,ambush:1.5,cleanup:1.2,protect:.8,recover:.7,nodes:.5,relic:.6},transversals:{rift_scout:3.2,salvage_drone:1.0,parasite_orb:.7,rift_carrier:.8,relic_hunter:.45},formations:{pincer:3,wedge:1.8,cross:1.0},entries:{right:1.2,top:1.6,bottom:1.6,diagTop:2.2,diagBottom:2.2,leftTop:.45,leftBottom:.45},micro:{distant:1,meteor:1.35,salvage:.8,ghost:.65,shield:.8},frontKinds:{rammer:2.5,pod:1.7,meteor:1.0,wreck:.55},tiers:{grunt:1.18,mid:1.0,heavy:.82},cadence:.92,directorCadence:.96,formationCadence:.93,frontCadence:.94,transversalCadence:1.02,obstacleCadence:1.08,budget:0,maxAlive:1.03,burstBias:.08,obstacleCap:0},
 {id:'atlas',label:'MARCHA BLINDADA',events:{heavy:3.3,siege:2.7,debris:2.4,powercache:1.7,carrier:1.5,swarm:.8,pincer:.8,front:.7,elite:1.2,cross:.8,transversal:1.0,hunter:.55},objectives:{nodes:2.6,protect:2.3,recover:2.1,carrier:1.5,cleanup:1.3,priority:.7,ambush:.8,relic:.7},transversals:{rift_carrier:2.3,salvage_drone:1.8,parasite_orb:1.2,rift_scout:.9,relic_hunter:.55},formations:{wedge:2.4,pincer:1.6,cross:.8},entries:{right:2.4,top:.9,bottom:.9,diagTop:.75,diagBottom:.75,leftTop:.25,leftBottom:.25},micro:{salvage:1.45,meteor:1.45,distant:.8,ghost:.45,shield:1.0},frontKinds:{meteor:2.2,wreck:1.8,pod:1.25,rammer:.65},tiers:{grunt:.88,mid:1.12,heavy:1.42},cadence:1.04,directorCadence:1.02,formationCadence:1.02,frontCadence:1.08,transversalCadence:1.0,obstacleCadence:.84,budget:.7,maxAlive:.96,burstBias:-.03,obstacleCap:1},
 {id:'razor',label:'CORTE VECTORIAL',events:{pincer:2.8,cross:3.1,elite:2.5,front:2.4,hunter:1.8,transversal:1.4,swarm:1.0,heavy:.75,debris:.8,siege:1.0,powercache:.8,carrier:.75},objectives:{priority:2.4,relic:2.1,ambush:2.2,carrier:1.3,cleanup:1.4,recover:1.0,nodes:.8,protect:.55},transversals:{rift_scout:2.5,relic_hunter:2.0,parasite_orb:1.0,salvage_drone:.7,rift_carrier:.8},formations:{cross:2.8,pincer:2.2,wedge:1.2},entries:{right:.85,top:1.25,bottom:1.25,diagTop:2.6,diagBottom:2.6,leftTop:1.35,leftBottom:1.35},micro:{meteor:1.7,ghost:1.15,distant:1.0,salvage:.65,shield:.75},frontKinds:{rammer:2.0,wreck:1.55,meteor:1.15,pod:.7},tiers:{grunt:.92,mid:1.26,heavy:1.06},cadence:.93,directorCadence:.92,formationCadence:.90,frontCadence:.88,transversalCadence:.96,obstacleCadence:.98,budget:.3,maxAlive:1.0,burstBias:.04,obstacleCap:0},
 {id:'noctis',label:'NIEBLA NOCTURNA',events:{transversal:2.5,hunter:2.2,powercache:2.0,cross:1.7,debris:1.4,elite:1.4,pincer:1.1,front:.9,swarm:.8,heavy:.8,siege:.9,carrier:1.0},objectives:{recover:2.6,relic:2.5,protect:1.7,priority:1.35,nodes:1.2,ambush:1.3,carrier:1.0,cleanup:1.1},transversals:{parasite_orb:2.5,relic_hunter:2.1,rift_scout:1.3,salvage_drone:1.0,rift_carrier:.85},formations:{cross:2.0,wedge:1.7,pincer:1.4},entries:{right:1.15,top:1.5,bottom:1.5,diagTop:1.5,diagBottom:1.5,leftTop:.9,leftBottom:.9},micro:{ghost:2.5,distant:1.45,shield:.9,meteor:.8,salvage:.65},frontKinds:{pod:2.0,wreck:1.4,meteor:1.15,rammer:.8},tiers:{grunt:.96,mid:1.05,heavy:1.24},cadence:.98,directorCadence:.98,formationCadence:1.03,frontCadence:1.08,transversalCadence:.84,obstacleCadence:.94,budget:.5,maxAlive:.98,burstBias:.0,obstacleCap:0},
 {id:'ferrum',label:'COLONIA FERRUM',events:{swarm:2.6,heavy:2.5,siege:2.6,pincer:2.1,powercache:1.4,carrier:1.5,cross:1.2,debris:1.2,elite:1.0,front:.8,transversal:.9,hunter:.55},objectives:{protect:2.8,nodes:2.7,cleanup:2.0,carrier:1.6,recover:1.4,ambush:1.0,priority:.7,relic:.6},transversals:{rift_carrier:2.1,salvage_drone:1.6,parasite_orb:1.1,rift_scout:1.0,relic_hunter:.55},formations:{pincer:2.6,wedge:2.1,cross:1.0},entries:{right:1.8,top:1.15,bottom:1.15,diagTop:1.0,diagBottom:1.0,leftTop:.55,leftBottom:.55},micro:{salvage:1.4,distant:1.25,meteor:1.0,shield:1.0,ghost:.65},frontKinds:{wreck:1.9,rammer:1.5,pod:1.15,meteor:.9},tiers:{grunt:1.14,mid:1.05,heavy:1.2},cadence:.96,directorCadence:.94,formationCadence:.87,frontCadence:1.05,transversalCadence:.98,obstacleCadence:.82,budget:.7,maxAlive:1.08,burstBias:.06,obstacleCap:1},
 {id:'hop',label:'SALTO DE SATURACIÓN',events:{front:2.9,cross:2.7,swarm:2.5,pincer:1.9,elite:1.8,transversal:1.2,hunter:1.2,heavy:1.0,siege:1.0,debris:.7,powercache:.8,carrier:.9},objectives:{ambush:2.6,cleanup:2.4,priority:1.9,carrier:1.5,relic:1.2,recover:.9,nodes:.8,protect:.7},transversals:{rift_scout:2.3,relic_hunter:1.5,parasite_orb:1.2,rift_carrier:1.0,salvage_drone:.8},formations:{wedge:2.5,pincer:2.2,cross:1.8},entries:{right:.9,top:1.9,bottom:1.9,diagTop:2.0,diagBottom:2.0,leftTop:.7,leftBottom:.7},micro:{meteor:1.7,distant:1.3,ghost:1.0,salvage:.7,shield:.75},frontKinds:{rammer:2.2,meteor:1.9,pod:.9,wreck:.8},tiers:{grunt:1.08,mid:1.0,heavy:1.08},cadence:.88,directorCadence:.90,formationCadence:.90,frontCadence:.90,transversalCadence:.94,obstacleCadence:1.02,budget:.4,maxAlive:1.07,burstBias:.13,obstacleCap:0},
 {id:'sanguina',label:'CAZA HEMÁTICA',events:{elite:2.8,transversal:2.5,hunter:2.4,pincer:2.0,cross:1.8,front:1.6,swarm:1.2,carrier:1.2,heavy:.9,siege:1.0,debris:.6,powercache:.9},objectives:{priority:2.7,recover:2.5,relic:2.4,ambush:1.7,carrier:1.2,cleanup:1.2,protect:.8,nodes:.7},transversals:{parasite_orb:2.8,relic_hunter:2.2,rift_scout:1.8,rift_carrier:1.0,salvage_drone:.7},formations:{pincer:2.3,cross:2.2,wedge:1.3},entries:{right:1.0,top:1.45,bottom:1.45,diagTop:2.2,diagBottom:2.2,leftTop:1.0,leftBottom:1.0},micro:{ghost:1.55,distant:1.2,shield:1.1,meteor:.9,salvage:.6},frontKinds:{pod:2.2,rammer:1.7,wreck:.9,meteor:.75},tiers:{grunt:.94,mid:1.23,heavy:1.12},cadence:.89,directorCadence:.88,formationCadence:.94,frontCadence:.95,transversalCadence:.82,obstacleCadence:1.05,budget:.5,maxAlive:1.03,burstBias:.06,obstacleCap:0},
 {id:'architect',label:'ASEDIO CONSTRUCTOR',events:{siege:3.7,powercache:2.9,carrier:2.5,heavy:2.4,debris:1.8,pincer:1.2,cross:1.1,transversal:1.1,elite:1.0,front:.8,swarm:.8,hunter:.65},objectives:{nodes:3.2,protect:3.0,recover:2.1,cleanup:1.8,carrier:1.5,ambush:.9,priority:.6,relic:.7},transversals:{rift_carrier:2.4,salvage_drone:1.8,parasite_orb:1.3,rift_scout:.8,relic_hunter:.6},formations:{wedge:2.6,pincer:1.8,cross:.8},entries:{right:2.2,top:1.0,bottom:1.0,diagTop:.8,diagBottom:.8,leftTop:.45,leftBottom:.45},micro:{salvage:1.6,shield:1.15,distant:.85,meteor:1.0,ghost:.55},frontKinds:{wreck:2.4,pod:1.8,meteor:1.0,rammer:.55},tiers:{grunt:.92,mid:1.15,heavy:1.42},cadence:1.02,directorCadence:.98,formationCadence:.96,frontCadence:1.08,transversalCadence:.95,obstacleCadence:.72,budget:1.0,maxAlive:.97,burstBias:-.02,obstacleCap:2},
 {id:'auralis',label:'INTERCEPCIÓN PRISMÁTICA',events:{front:3.4,cross:2.9,pincer:2.4,elite:2.5,hunter:1.8,transversal:1.5,swarm:1.2,siege:1.0,heavy:.8,debris:.8,powercache:.8,carrier:.75},objectives:{priority:2.6,ambush:2.4,relic:1.9,cleanup:1.6,carrier:1.25,recover:.9,nodes:.8,protect:.55},transversals:{rift_scout:2.7,relic_hunter:2.0,parasite_orb:1.0,salvage_drone:.65,rift_carrier:.75},formations:{cross:3.0,pincer:2.0,wedge:1.0},entries:{right:.65,top:1.5,bottom:1.5,diagTop:3.0,diagBottom:3.0,leftTop:1.6,leftBottom:1.6},micro:{ghost:1.75,distant:1.5,meteor:1.25,salvage:.55,shield:.7},frontKinds:{rammer:3.0,meteor:1.2,wreck:.8,pod:.65},tiers:{grunt:.86,mid:1.28,heavy:1.18},cadence:.87,directorCadence:.86,formationCadence:.86,frontCadence:.72,transversalCadence:.88,obstacleCadence:1.12,budget:.4,maxAlive:1.0,burstBias:.09,obstacleCap:-1},
 {id:'omega',label:'RESONANCIA TOTAL',events:{cross:2.6,siege:2.4,heavy:2.0,transversal:2.1,hunter:2.0,swarm:1.8,pincer:1.8,front:1.7,elite:1.7,debris:1.5,powercache:1.5,carrier:1.4},objectives:{nodes:2.1,relic:2.1,cleanup:2.0,ambush:1.9,recover:1.8,priority:1.6,carrier:1.5,protect:1.4},transversals:{relic_hunter:2.0,parasite_orb:1.9,rift_carrier:1.7,rift_scout:1.5,salvage_drone:1.2},formations:{cross:2.5,pincer:1.8,wedge:1.7},entries:{right:1.1,top:1.3,bottom:1.3,diagTop:1.7,diagBottom:1.7,leftTop:1.1,leftBottom:1.1},micro:{ghost:1.7,distant:1.65,meteor:1.2,shield:.9,salvage:.9},frontKinds:{wreck:1.6,rammer:1.5,pod:1.35,meteor:1.25},tiers:{grunt:.92,mid:1.14,heavy:1.28},cadence:.93,directorCadence:.88,formationCadence:.90,frontCadence:.88,transversalCadence:.87,obstacleCadence:.92,budget:1.2,maxAlive:1.05,burstBias:.05,obstacleCap:1,echoChance:.24}
];
// CH2 hereda el lenguaje del Director, pero acelera cadencia/entradas y élites en lugar de multiplicar HP.
const CH2_DIRECTOR_LABELS=['ÓRBITA IMPERIAL','LANCER TOXIN','MANDÍBULA DE FORJA','BALIZAS VIVAS','DESTILACIÓN HOSTIL','VELO CATEDRAL','MIRAGE VECTORIAL','POZO DE CAZA','TIJERA DE PLASMA','DOMINIO APIARIO'];
for(let w=11;w<=20;w++){const src=COMBAT_DIRECTOR_PROFILES[((w-1)%10)+1],step=w-10;COMBAT_DIRECTOR_PROFILES[w]={...src,id:`ch2_${w}`,label:CH2_DIRECTOR_LABELS[step-1],events:{...src.events,swarm:(src.events.swarm||1)*(1+.025*step),elite:(src.events.elite||1)*(1+.035*step),cross:(src.events.cross||1)*(1+.025*step)},tiers:{grunt:(src.tiers.grunt||1)*(.98-step*.004),mid:(src.tiers.mid||1)*(1+.012*step),heavy:(src.tiers.heavy||1)*(1+.018*step)},cadence:Math.max(.76,(src.cadence||1)-step*.010),directorCadence:Math.max(.76,(src.directorCadence||1)-step*.009),formationCadence:Math.max(.76,(src.formationCadence||1)-step*.008),maxAlive:(src.maxAlive||1)+step*.010,burstBias:(src.burstBias||0)+step*.008,budget:(src.budget||0)+step*.06};}

// v2.15.13 · CHAPTER II WAVE CHOREOGRAPHER
// Cada mundo 11–20 tiene tres actos de oleada con composición, entradas, eventos y tempo propios.
const CH2_WAVE_CHOREOGRAPHY={
  11:{waves:[
    {name:'DESPERTAR ORBITAL',tiers:[.66,.29,.05],seq:['swarm','pincer','front'],formation:'wedge',entries:{right:1.45,diagTop:1.25,diagBottom:1.25},objectives:{recover:1.45,priority:1.20},spawn:1.03,micro:.92},
    {name:'ANILLOS DE CERCO',tiers:[.36,.51,.13],seq:['pincer','heavy','cross'],formation:'pincer',entries:{top:1.35,bottom:1.35,diagTop:1.15,diagBottom:1.15},objectives:{nodes:1.50,protect:1.15},spawn:.95,micro:.86},
    {name:'GRAVEDAD IMPERIAL',tiers:[.18,.52,.30],seq:['heavy','siege','cross'],formation:'cross',entries:{right:1.25,diagTop:1.30,diagBottom:1.30},objectives:{cleanup:1.35,nodes:1.25},spawn:.89,micro:.82}]},
  12:{waves:[
    {name:'AGUIJONES DE RECONOCIMIENTO',tiers:[.70,.27,.03],seq:['front','swarm','elite'],formation:'wedge',entries:{diagTop:1.65,diagBottom:1.65,top:1.25,bottom:1.25},objectives:{priority:1.55,ambush:1.20},spawn:.94,micro:.90},
    {name:'CORREDOR VENENOSO',tiers:[.32,.56,.12],seq:['elite','pincer','front'],formation:'pincer',entries:{top:1.55,bottom:1.55,diagTop:1.30,diagBottom:1.30},objectives:{ambush:1.50,carrier:1.15},spawn:.88,micro:.84},
    {name:'TRIDENTE AÉREO',tiers:[.17,.55,.28],seq:['cross','elite','siege'],formation:'cross',entries:{diagTop:1.75,diagBottom:1.75,leftTop:1.15,leftBottom:1.15},objectives:{cleanup:1.25,priority:1.25},spawn:.82,micro:.80}]},
  13:{waves:[
    {name:'ESCORIA VIVA',tiers:[.55,.36,.09],seq:['heavy','debris','pincer'],formation:'wedge',entries:{right:1.70,top:.80,bottom:.80},objectives:{protect:1.35,nodes:1.20},spawn:1.06,micro:.94},
    {name:'MARCHA DE TENAZAS',tiers:[.27,.51,.22],seq:['heavy','pincer','siege'],formation:'pincer',entries:{right:1.50,diagTop:1.10,diagBottom:1.10},objectives:{nodes:1.50,cleanup:1.20},spawn:.97,micro:.88},
    {name:'YUNQUE REGENTE',tiers:[.12,.47,.41],seq:['siege','heavy','cross'],formation:'cross',entries:{right:1.80,top:.75,bottom:.75},objectives:{cleanup:1.45,protect:1.20},spawn:.92,micro:.84}]},
  14:{waves:[
    {name:'LUCIÉRNAGAS EXPLORADORAS',tiers:[.69,.27,.04],seq:['swarm','powercache','transversal'],formation:'wedge',entries:{top:1.35,bottom:1.35,right:1.10},objectives:{recover:1.45,relic:1.20},spawn:1.01,micro:.82},
    {name:'CONSTELACIÓN HOSTIL',tiers:[.35,.53,.12],seq:['cross','powercache','pincer'],formation:'cross',entries:{top:1.35,bottom:1.35,diagTop:1.25,diagBottom:1.25},objectives:{nodes:1.45,recover:1.20},spawn:.94,micro:.78},
    {name:'BALIZA DE CAZA',tiers:[.18,.58,.24],seq:['elite','cross','hunter'],formation:'pincer',entries:{diagTop:1.45,diagBottom:1.45,leftTop:1.05,leftBottom:1.05},objectives:{relic:1.40,cleanup:1.20},spawn:.87,micro:.76}]},
  15:{waves:[
    {name:'FUGA QUÍMICA',tiers:[.60,.33,.07],seq:['debris','swarm','heavy'],formation:'wedge',entries:{right:1.45,top:1.00,bottom:1.00},objectives:{recover:1.50,protect:1.15},spawn:1.05,micro:.92},
    {name:'PRESIÓN DE DESTILACIÓN',tiers:[.30,.52,.18],seq:['heavy','carrier','pincer'],formation:'pincer',entries:{right:1.55,diagTop:1.10,diagBottom:1.10},objectives:{carrier:1.40,nodes:1.25},spawn:.96,micro:.86},
    {name:'REACCIÓN CÁUSTICA',tiers:[.15,.49,.36],seq:['siege','debris','cross'],formation:'cross',entries:{right:1.50,top:1.15,bottom:1.15},objectives:{cleanup:1.45,nodes:1.25},spawn:.90,micro:.82}]},
  16:{waves:[
    {name:'POLVO DEL VELO',tiers:[.67,.29,.04],seq:['transversal','swarm','hunter'],formation:'wedge',entries:{top:1.40,bottom:1.40,diagTop:1.25,diagBottom:1.25},objectives:{recover:1.35,relic:1.35},spawn:1.02,micro:.86},
    {name:'TEJIDO HIPNÓTICO',tiers:[.32,.56,.12],seq:['cross','pincer','transversal'],formation:'cross',entries:{top:1.35,bottom:1.35,leftTop:1.20,leftBottom:1.20},objectives:{ambush:1.45,recover:1.15},spawn:.93,micro:.80},
    {name:'ECLIPSE ATLAS',tiers:[.16,.54,.30],seq:['hunter','cross','siege'],formation:'pincer',entries:{diagTop:1.45,diagBottom:1.45,leftTop:1.15,leftBottom:1.15},objectives:{relic:1.45,cleanup:1.30},spawn:.86,micro:.77}]},
  17:{waves:[
    {name:'BROTES MIMÉTICOS',tiers:[.71,.25,.04],seq:['elite','swarm','pincer'],formation:'wedge',entries:{diagTop:1.50,diagBottom:1.50,top:1.20,bottom:1.20},objectives:{priority:1.40,ambush:1.30},spawn:.97,micro:.88},
    {name:'CORREDORES ESPEJO',tiers:[.31,.58,.11],seq:['cross','elite','pincer'],formation:'cross',entries:{leftTop:1.35,leftBottom:1.35,diagTop:1.35,diagBottom:1.35},objectives:{ambush:1.50,relic:1.20},spawn:.89,micro:.82},
    {name:'FRACTURA VERDURE',tiers:[.15,.57,.28],seq:['cross','hunter','siege'],formation:'pincer',entries:{diagTop:1.60,diagBottom:1.60,leftTop:1.25,leftBottom:1.25},objectives:{cleanup:1.35,relic:1.35},spawn:.83,micro:.78}]},
  18:{waves:[
    {name:'SEÑUELOS DE DUNA',tiers:[.63,.31,.06],seq:['swarm','front','debris'],formation:'wedge',entries:{right:1.30,top:1.25,bottom:1.25},objectives:{recover:1.35,priority:1.20},spawn:1.03,micro:.91},
    {name:'BOCAS DE ARENA',tiers:[.28,.54,.18],seq:['front','pincer','heavy'],formation:'pincer',entries:{top:1.40,bottom:1.40,diagTop:1.20,diagBottom:1.20},objectives:{ambush:1.50,nodes:1.15},spawn:.93,micro:.85},
    {name:'FOSA IMPERIAL',tiers:[.13,.49,.38],seq:['siege','front','heavy'],formation:'cross',entries:{right:1.45,diagTop:1.30,diagBottom:1.30},objectives:{cleanup:1.45,ambush:1.25},spawn:.88,micro:.81}]},
  19:{waves:[
    {name:'ARCOS DE PRUEBA',tiers:[.65,.31,.04],seq:['cross','elite','front'],formation:'cross',entries:{diagTop:1.45,diagBottom:1.45,leftTop:1.15,leftBottom:1.15},objectives:{priority:1.45,relic:1.20},spawn:.98,micro:.88},
    {name:'MALLA CONDUCTIVA',tiers:[.30,.55,.15],seq:['pincer','cross','heavy'],formation:'pincer',entries:{top:1.40,bottom:1.40,diagTop:1.30,diagBottom:1.30},objectives:{nodes:1.45,ambush:1.30},spawn:.89,micro:.82},
    {name:'CIERRE RAZOR',tiers:[.12,.52,.36],seq:['siege','cross','elite'],formation:'cross',entries:{leftTop:1.35,leftBottom:1.35,diagTop:1.45,diagBottom:1.45},objectives:{cleanup:1.50,nodes:1.20},spawn:.82,micro:.78}]},
  20:{waves:[
    {name:'GUARDIA DE NÉCTAR',tiers:[.58,.35,.07],seq:['swarm','carrier','heavy'],formation:'wedge',entries:{right:1.40,top:1.10,bottom:1.10},objectives:{protect:1.45,carrier:1.25},spawn:.98,micro:.86},
    {name:'CORREDOR IMPERIAL',tiers:[.25,.55,.20],seq:['pincer','heavy','cross'],formation:'pincer',entries:{top:1.35,bottom:1.35,diagTop:1.25,diagBottom:1.25},objectives:{nodes:1.45,protect:1.30},spawn:.87,micro:.80},
    {name:'DOMINIO TOTAL',tiers:[.10,.47,.43],seq:['siege','cross','heavy'],formation:'cross',entries:{right:1.35,diagTop:1.40,diagBottom:1.40,leftTop:1.10,leftBottom:1.10},objectives:{cleanup:1.55,nodes:1.25},spawn:.78,micro:.75}]}
};

// v2.15.14 · PRE-BOSS ESCALATION PASS — Mundos 11–20
// El cierre de la Orda 3 ya no salta directamente a una pausa genérica de 3 s.
// Cada mundo CH2 dispone de un umbral audiovisual propio, flyby de minis, silueta élite,
// transición progresiva del fondo de antesala a la arena y entrada de boss más ceremonial.
// Es una secuencia de tensión: NO añade kills, HP, daño ni una cuarta oleada oculta.
const CH2_PREBOSS_ESCALATION={
  11:{id:'KHEPRI_THRESHOLD',label:'UMBRAL KHEPRI',duration:5.35,entry:2.55,motif:'orbit',tint:'#62dfff',swarm:6,elite:'GUARDIÁN ORBITAL',blendFrom:.50,cues:['ANILLOS CELESTES EN ALINEACIÓN','VANGUARDIA ORBITAL EN RETIRADA','GRAVEDAD DEL NÚCLEO EN ASCENSO','SCARAB IMPERATOR DESPIERTA']},
  12:{id:'VENOM_GATE',label:'PUERTA DEL AGUIJÓN',duration:5.20,entry:2.48,motif:'lance',tint:'#8dff5a',swarm:7,elite:'LANCERO TÓXICO',blendFrom:.52,cues:['CORREDOR DE VENENO ABIERTO','ENJAMBRE LANCER CRUZA LA CÁMARA','PRESIÓN TÓXICA AL MÁXIMO','VESPERA LANCER ENTRA EN PICADO']},
  13:{id:'FORGE_CLAMP',label:'TENAZA DE LA FORJA',duration:5.55,entry:2.62,motif:'clamp',tint:'#ff6b35',swarm:5,elite:'YUNQUE REGENTE',blendFrom:.49,cues:['COMPUERTAS DE OBSIDIANA CERRANDO','GUARDIA DE MANDÍBULAS REPLIEGA','CRISOL REGENTE SOBRECARGADO','REGENT MANDIBLE TOMA LA FORJA']},
  14:{id:'LUMEN_ASCENT',label:'ASCENSO LÚMEN',duration:5.25,entry:2.50,motif:'lumen',tint:'#ffc65b',swarm:8,elite:'BALIZA MAYOR',blendFrom:.54,cues:['BALIZAS NOCTURNAS SINCRONIZADAS','CONSTELACIÓN MENOR EN TRÁNSITO','NÚCLEO LÚMEN ALCANZA RESONANCIA','PYROLUX BEACON ENCIENDE LA ARENA']},
  15:{id:'CAUSTIC_LOCK',label:'CÁMARA CÁUSTICA',duration:5.50,entry:2.58,motif:'acid',tint:'#89ff54',swarm:6,elite:'DESTILADOR MAYOR',blendFrom:.50,cues:['VÁLVULAS DE DESTILACIÓN ABIERTAS','MICROHORDA EVACUA EL REACTOR','PRESIÓN QUÍMICA CRÍTICA','CAUSTIC ALCHEMIST LIBERA EL CRISOL']},
  16:{id:'VEIL_CATHEDRAL',label:'CATEDRAL DEL VELO',duration:5.75,entry:2.72,motif:'veil',tint:'#c39cff',swarm:7,elite:'ACÓLITO ATLAS',blendFrom:.47,cues:['POLVO DEL VELO CUBRE EL CORREDOR','SOMBRAS ATLAS CRUZAN LA NAVE','ECLIPSE HIPNÓTICO EN FORMACIÓN','ATLAS VEIL DESPLIEGA SUS ALAS']},
  17:{id:'MIRROR_THRESHOLD',label:'UMBRA ESPEJO',duration:5.60,entry:2.65,motif:'mirror',tint:'#66ffd3',swarm:8,elite:'REFRACTOR MAYOR',blendFrom:.48,cues:['CRISTALES MIMÉTICOS SE FRACTURAN','SEÑUELOS PHASMID ABANDONAN EL EJE','REFRACCIÓN DEL NEXUS INESTABLE','MIRAGE PHASMID REVELA SU FORMA']},
  18:{id:'PIT_EDGE',label:'BORDE DE LA FOSA',duration:5.85,entry:2.76,motif:'vortex',tint:'#ffb24a',swarm:6,elite:'DEPREDADOR DE FOSA',blendFrom:.46,cues:['ARENA DE DUNA CEDIENDO','SEÑUELOS DE FOSA SE DISPERSAN','VÓRTICE SUBTERRÁNEO DETECTADO','PIT EMPEROR EMERGE']},
  19:{id:'RAZOR_GRID',label:'MALLA DE PINZAS',duration:5.65,entry:2.68,motif:'razor',tint:'#ff5577',swarm:7,elite:'CONDUCTOR RAZOR',blendFrom:.47,cues:['ARCOS ELECTROFÁGICOS CONECTADOS','NODOS RAZOR CRUZAN LA CÁMARA','PINZA CENTRAL CARGANDO','AURICULUS RAZOR CIERRA LA RED']},
  20:{id:'ROYAL_ASCENT',label:'ASCENSO IMPERIAL',duration:6.20,entry:2.95,motif:'hive',tint:'#ffe178',swarm:9,elite:'GUARDIA REAL',blendFrom:.44,cues:['DOMINIO APIARIO SELLADO','GUARDIA DE NÉCTAR FORMA EL CORTEJO','TRONO COLMENA ABRE SUS CELDAS','APIS IMPERIA DESCIENDE AL DOMINIO']}
};
function preBossEscalationSpec(sector=G?.sector||0){return CH2_PREBOSS_ESCALATION[Math.round(sector)]||null;}
function activePreBossEscalation(){return G?.preBossEscalationActive?preBossEscalationSpec(G.sector):null;}
function preBossProgress(){const max=Math.max(.1,G?.preBossMax||PREBOSS_DURATION);return clamp((max-(G?.preBossT||0))/max,0,1);}
function preBossStage(){const p=preBossProgress();return p<.10?0:p<.38?1:p<.68?2:p<.88?3:4;}
function preBossStageLabel(){const spec=activePreBossEscalation(),stage=preBossStage();return spec?.cues?.[Math.max(0,stage-1)]||'';}
window.__SWARM_PREBOSS_ESCALATION=(sector=G?.sector||11)=>{const spec=preBossEscalationSpec(Number(sector));return {version:VERSION,sector:Number(sector),enabled:!!spec,spec:spec?{...spec}:null,active:!!(G?.preBossEscalationActive&&G?.sector===Number(sector)),progress:+(G?.preBossT>0?preBossProgress():0).toFixed(3),stage:G?.preBossT>0?preBossStage():0,stageLabel:G?.preBossT>0?preBossStageLabel():''};};

function ch2WaveSpec(sector=G?.sector||1,wave=G?.wave||1){return CH2_WAVE_CHOREOGRAPHY[sector]?.waves?.[clamp((wave||1)-1,0,2)]||null;}
function waveActLabel(sector=G?.sector||1,wave=G?.wave||1){return ch2WaveSpec(sector,wave)?.name||'';}
function weightedMerge(base,boost){const out={...(base||{})};for(const [k,v] of Object.entries(boost||{}))out[k]=(out[k]||1)*v;return out;}
function ch2WaveEventChoice(allowed){const spec=ch2WaveSpec();if(!spec?.seq?.length)return null;const start=(G.directorIndex||0)%spec.seq.length;for(let i=0;i<spec.seq.length;i++){const v=spec.seq[(start+i)%spec.seq.length];if(allowed.includes(v)&&!(G.directorHistory||[]).slice(-2).includes(v))return v;}return null;}
window.__SWARM_WAVE_CHOREOGRAPHY=(sector=G?.sector||11,wave=G?.wave||1)=>{const spec=ch2WaveSpec(Number(sector),Number(wave));return {version:VERSION,sector:Number(sector),wave:Number(wave),enabled:!!spec,name:spec?.name||'',tiers:spec?.tiers||null,eventSequence:spec?.seq||[],formation:spec?.formation||'',entries:spec?.entries||{},objectives:spec?.objectives||{},spawnTempo:spec?.spawn||1,microTempo:spec?.micro||1};};

function directorProfile(sector=G?.sector||1){return COMBAT_DIRECTOR_PROFILES[clamp(Math.round(sector),1,activeSectorCount())]||COMBAT_DIRECTOR_PROFILES[1];}
function directorProfileLabel(sector=G?.sector||1){const p=directorProfile(sector);return `${SECTORS[clamp(Math.round(sector),1,activeSectorCount())-1]?.family||'ENJAMBRE'} · ${p.label}`;}
window.__SWARM_DIRECTOR_PROFILE=(sector=G?.sector||1)=>{const n=clamp(Math.round(sector||1),1,activeSectorCount()),p=directorProfile(n);return {version:VERSION,sector:n,wave:G?.wave||1,id:p.id,label:p.label,phase:G?.directorPhase||directorPhase(),events:{...p.events},objectives:{...p.objectives},transversals:{...p.transversals},frontKinds:{...p.frontKinds},cadence:{spawn:p.cadence,director:p.directorCadence,formation:p.formationCadence,front:p.frontCadence,transversal:p.transversalCadence,obstacle:p.obstacleCadence},budget:{modifier:p.budget,maxAlive:p.maxAlive,obstacleCap:p.obstacleCap},echoChance:p.echoChance||0};};
function directorMarks(wave,hard=false){const base=wave===1?[.15,.48,.80]:wave===2?[.12,.34,.60,.84]:[.09,.27,.49,.70,.89];return hard?[...base.slice(0,-1),(base.at(-2)+base.at(-1))/2,base.at(-1)]:base;}
function directorPhase(){const r=G.goal?G.kills/G.goal:0;if(G.wave===1)return r<.28?'RECONOCIMIENTO':r<.70?'PRESIÓN':'CIERRE';if(G.wave===2)return r<.24?'PRESIÓN':r<.68?'EMBOSCADA':'FRENESÍ';return r<.22?'ASEDIO':r<.66?'SATURACIÓN':'CLÍMAX';}
function resetCombatDirector(){G.directorIndex=0;G.directorCooldown=2.5;G.directorHistory=[];G.directorPressureT=0;G.directorPressure=1;G.directorPhase='RECONOCIMIENTO';}
function directorEventPool(){const phase=directorPhase();let pool=['swarm','pincer','elite','front','transversal'];if(G.wave>=2)pool.push('cross','heavy','debris','carrier');if(G.wave>=3)pool.push('siege','powercache','front','hunter');if(phase==='CLÍMAX'||phase==='FRENESÍ')pool.push('swarm','heavy','cross','front','transversal','hunter');return [...new Set(pool)];}
function chooseDirectorEvent(){const hist=G.directorHistory||[],base=directorEventPool(),pool=base.filter(v=>!hist.slice(-2).includes(v)),allowed=pool.length?pool:base,prof=directorProfile(),spec=ch2WaveSpec();if(spec&&Math.random()<.74){const scripted=ch2WaveEventChoice(allowed);if(scripted)return scripted;}if((prof.echoChance||0)>0&&hist.length>=2&&Math.random()<prof.echoChance){const echo=hist[hist.length-2];if(allowed.includes(echo))return echo;}const weights=spec?weightedMerge(prof.events,Object.fromEntries((spec.seq||[]).map((v,i)=>[v,1.45-i*.10]))):prof.events;return weightedPick(weights,allowed)||pick(allowed);}
function fireDirectorEvent(type){
  if(G.boss||G.bossPending||G.sectorClear)return false;if(!encounterCanSpend(directorEventCost(type)))return false;const sec=SECTORS[G.sector-1],hard=runDifficultyKey()==='hard',rem=Math.max(0,G.goal-G.kills);if(rem<3)return false;
  const modes=['top','bottom','diagTop','diagBottom','right'];
  if(type==='swarm'){const n=Math.min(rem,hard?7:5);for(let i=0;i<n;i++)spawnEnemy(sec.forms[0],null,null,modes[i%modes.length]);notify('EVENTO · OLEADA RELÁMPAGO',sec.accent,1.25);G.directorPressure=1.22;G.directorPressureT=4.8;}
  else if(type==='pincer'){spawnFormation('pincer');if(hard)spawnEnemy(sec.forms[1],null,null,'right');notify('EVENTO · PINZA DOBLE','#ffc66f',1.25);G.directorPressure=1.18;G.directorPressureT=4.2;}
  else if(type==='cross'){spawnFormation('cross');spawnEnemy(sec.forms[0],null,null,'top');notify('EVENTO · FUEGO CRUZADO','#ffb36d',1.25);G.directorPressure=1.22;G.directorPressureT=4.4;}
  else if(type==='elite'){spawnEnemy(sec.forms[1],null,null,'diagTop');spawnEnemy(sec.forms[1],null,null,'diagBottom');if(hard)spawnEnemy(sec.forms[0],null,null,'right');notify('EVENTO · CAZADORES ÉLITE','#ffda77',1.25);G.directorPressure=1.16;G.directorPressureT=4;}
  else if(type==='heavy'){spawnEnemy(sec.forms[2],null,null,'right');spawnEnemy(sec.forms[0],null,null,'top');spawnEnemy(sec.forms[0],null,null,'bottom');notify('EVENTO · ESCOLTA PESADA','#ff9b6e',1.25);G.directorPressure=1.20;G.directorPressureT=5;}
  else if(type==='front'){spawnFrontThreat();if(hard||G.wave>=3)spawnFrontThreat();notify('EVENTO · INTERCEPCIÓN FRONTAL','#9fe6ff',1.25);G.directorPressure=1.12;G.directorPressureT=3.8;}
  else if(type==='debris'){spawnObstacle();spawnObstacle();spawnFrontThreat('wreck');notify('EVENTO · CAMPO DE RESTOS','#b7d6ff',1.25);G.directorPressure=1.10;G.directorPressureT=4.4;}
  else if(type==='siege'){spawnEnemy(sec.forms[2],null,null,'diagTop');spawnEnemy(sec.forms[1],null,null,'right');spawnEnemy(sec.forms[1],null,null,'diagBottom');if(hard)spawnObstacle();notify('EVENTO · ASALTO MAYOR','#ff806b',1.25);G.directorPressure=1.28;G.directorPressureT=5.4;}
  else if(type==='powercache'){const px=rnd(W*.50,W*.72),py=rnd(H*.25,H*.75);spawnPowerReward(px,py);spawnEnemy(sec.forms[1],null,null,'top');spawnEnemy(sec.forms[1],null,null,'bottom');notify('EVENTO · PODER CUSTODIADO','#d9ff7d',1.35);G.directorPressure=1.14;G.directorPressureT=4.2;}
  else if(type==='transversal'){spawnTransversal();notify('EVENTO · CONTACTO TRANSVERSAL','#8eeaff',1.25);G.directorPressure=1.12;G.directorPressureT=4.0;}
  else if(type==='carrier'){spawnTransversal('rift_carrier');notify('EVENTO · PORTAENJAMBRE','#ffb06d',1.3);G.directorPressure=1.18;G.directorPressureT=4.6;}
  else if(type==='hunter'){spawnTransversal('relic_hunter');notify('EVENTO RARO · CAZADOR DE RELIQUIAS','#fff09a',1.5);G.directorPressure=1.08;G.directorPressureT=3.8;}
  if(['swarm','cross','heavy','siege','carrier'].includes(type))maybePressureRelief(type);
  G.directorHistory=(G.directorHistory||[]).concat(type).slice(-4);return true;
}
function updateCombatDirector(dt){
  if(!G||G.mode==='training'||G.mode==='bossRush'||G.boss||G.bossPending||G.sectorClear)return;G.directorCooldown=Math.max(0,(G.directorCooldown||0)-dt);G.directorPressureT=Math.max(0,(G.directorPressureT||0)-dt);if(G.directorPressureT<=0)G.directorPressure=1;
  const phase=directorPhase();if(phase!==G.directorPhase){G.directorPhase=phase;notify(`RITMO · ${phase}`,SECTORS[G.sector-1].accent,.9);}
  const prof=directorProfile(),marks=directorMarks(G.wave,runDifficultyKey()==='hard'),ratio=G.goal?G.kills/G.goal:0,idx=G.directorIndex||0;if(idx<marks.length&&ratio>=marks[idx]&&G.directorCooldown<=0){if(fireDirectorEvent(chooseDirectorEvent())!==false){G.directorIndex=idx+1;G.directorCooldown=(runDifficultyKey()==='hard'?3.8:4.6)*(prof.directorCadence||1);}else G.directorCooldown=.85;}
}

// ─────────────────────────────────────────────────────────────
// v2.12.1 · WAVE OBJECTIVES + SHARED ENCOUNTER BUDGET
// Segunda capa táctica: complementa al Combat Director y respeta densidad móvil.
// ─────────────────────────────────────────────────────────────
const WAVE_OBJECTIVES={
  priority:{label:'OBJETIVO PRIORITARIO',short:'OBJETIVO PRIORITARIO',cost:3.2},
  carrier:{label:'INTERCEPTA EL PORTAENJAMBRE',short:'INTERCEPTA CARRIER',cost:4.2},
  protect:{label:'PROTEGE LA CÁPSULA',short:'PROTEGE CÁPSULA',cost:3.5},
  recover:{label:'RECUPERA EL NÚCLEO',short:'RECUPERA NÚCLEO',cost:4.0},
  nodes:{label:'DESTRUYE LOS NODOS',short:'DESTRUYE NODOS',cost:3.8},
  ambush:{label:'SOBREVIVE A LA EMBOSCADA',short:'SOBREVIVE EMBOSCADA',cost:4.6},
  relic:{label:'CAZA DE RELIQUIA',short:'CAZA RELIQUIA',cost:3.4},
  cleanup:{label:'LIMPIEZA TOTAL',short:'LIMPIEZA TOTAL',cost:4.8}
};
function encounterBudgetCap(){if(!G)return 18;const compact=compactUI(),hard=runDifficultyKey()==='hard',prof=directorProfile();return (compact?14.5:21.5)+(hard?1.5:0)+Math.min(2.2,G.sector*.16)+(prof.budget||0);}
function activeWaveObjective(){const o=G?.waveObjective;return o&&o.status==='active'?o:null;}
function objectivePressureCost(){const o=activeWaveObjective();return o?(WAVE_OBJECTIVES[o.type]?.cost||3.5):0;}
function encounterLoad(){if(!G)return 0;let load=0;for(const e of G.enemies||[]){if(e.dead||e.microSwarm)continue;load+=e.kind==='transversal'?1.35:e.kind==='lieutenant'?3:e.objectiveId?1.15:1;}load+=(G.frontThreats||[]).filter(f=>!f.dead).length*1.65;load+=(G.obstacles||[]).filter(o=>!o.dead).length*.38;load+=(G.ambientProps||[]).filter(a=>!a.dead).length*(compactUI()?.08:.05);load+=objectivePressureCost();if(G.frenzyT>0)load+=3.8;return load;}
function encounterCanSpend(cost=1){return encounterLoad()+cost<=encounterBudgetCap();}
function encounterEnemyFactor(){const o=activeWaveObjective();let f=(o?.type==='ambush'||o?.type==='cleanup') ? .76 : (o?.type ? .84 : 1);if(G.frenzyT>0)f*=.86;return f;}
function directorEventCost(type){return ({swarm:4.5,pincer:3.5,cross:4,elite:3.2,heavy:4.4,front:2.8,debris:2.4,siege:5,powercache:2.6,transversal:2.2,carrier:3.8,hunter:2.8})[type]||3;}
function objectiveActivationCost(type){return ({priority:4.8,carrier:5.8,protect:6.2,recover:5.6,nodes:5.4,ambush:7.4,relic:4.9,cleanup:7.2})[type]||5.4;}
window.__SWARM_ENCOUNTER_STATUS=()=>({version:VERSION,screen:G?.screen||'',profile:uiProfile(),sector:G?.sector||0,wave:G?.wave||0,mode:G?.mode||'',difficulty:G?.runDifficulty||META.selectedDifficulty,kills:G?.kills||0,goal:G?.goal||0,credits:G?.credits||0,rewards:{objectiveCredits:G?.rewardLedger?.credits?.wave_objective||0,objectiveXp:G?.rewardLedger?.xp?.wave_objective||0},objective:G?.waveObjective?{type:G.waveObjective.type,status:G.waveObjective.status,progress:G.waveObjective.progress,total:G.waveObjective.total,t:Number(G.waveObjective.t||0).toFixed(2),maxT:Number(G.waveObjective.maxT||0).toFixed(2)}:null,objectiveEligible:(G&&G.screen==='GAME'&&G.mode==='campaign'&&!G.bossCheckpoint)?objectivePoolForWave():[],budget:{load:Number(encounterLoad().toFixed(2)),cap:Number(encounterBudgetCap().toFixed(2))},performance:performanceStatus(),frenzy:Math.max(0,Number((G?.frenzyT||0).toFixed(2))),director:G?{phase:G.directorPhase||'',index:G.directorIndex||0,profile:directorProfile().id,label:directorProfile().label}:null});
window.__SWARM_COMMANDER_STATUS=()=>({version:VERSION,sector:G?.sector||0,eligible:defeatedCommanderSectors(),expected:G?.lieutenantExpected||0,active:activeLieutenants().map(e=>({sector:e.lieutenantSector,name:SECTORS[(e.lieutenantSector||1)-1]?.boss||'',hp:Number((e.hp/e.maxHp*100).toFixed(1)),phase:e.phase})),queued:[...(G?.lieutenantQueue||[])],kills:G?.lieutenantKills||0,cap:commanderConcurrentCap(),supportBudget:G?.commanderSupportBudget||0,weaponBoost:{t:Number((G?.weaponBoostT||0).toFixed(2)),mult:G?.weaponBoostMult||1},musicUI:!!MusicX.uiSnapshot});
function objectivePoolForWave(){
  let pool=G.wave===1?['priority','carrier','protect','recover']:G.wave===2?['priority','carrier','protect','recover','nodes','ambush','relic']:['nodes','ambush','relic','cleanup','carrier','recover'];
  const sec=SECTORS[G.sector-1];if(sec.pattern==='architect'){pool.push('protect');if(G.wave>=2)pool.push('nodes');}if(sec.pattern==='storm'||sec.pattern==='odonata'){pool.push('priority');if(G.wave>=2)pool.push('ambush');}if(sec.pattern==='blood'){pool.push('recover');if(G.wave>=2)pool.push('relic');}if(sec.pattern==='resonance'&&G.wave>=2)pool.push('nodes','relic');
  const hist=G.objectiveHistory||[];const recent=hist.slice(-2);pool=pool.filter(v=>!recent.includes(v));return pool.length?pool:['priority','recover','nodes'];
}
function prepareWaveObjective(forceType=null){
  if(!G)return null;G.objectiveTargets=[];G.objectiveCapsule=null;G.waveObjective=null;if(G.mode==='training'||G.mode==='bossRush'||G.bossCheckpoint)return null;
  const chance=(G.wave===1?.48:G.wave===2?.74:.66)+(runDifficultyKey()==='hard'?.12:0);if(!forceType&&Math.random()>chance)return null;
  const pool=objectivePoolForWave(),spec=ch2WaveSpec(),objectiveWeights=spec?weightedMerge(directorProfile().objectives,spec.objectives):directorProfile().objectives,type=forceType&&WAVE_OBJECTIVES[forceType]?forceType:(weightedPick(objectiveWeights,pool)||pick(pool)),trigger=type==='cleanup'?.68:(G.wave===1?.18:G.wave===2?.24:.20);
  G.waveObjective={id:`${G.sector}-${G.wave}-${Math.floor(performance.now())}`,type,label:WAVE_OBJECTIVES[type].label,status:'pending',trigger,progress:0,total:1,t:0,maxT:0,entity:null,entities:[],rewarded:false,failedReason:'',coreSpawned:false};return G.waveObjective;
}
function objectiveWorldCue(type){const sec=SECTORS[G.sector-1];const cues={priority:`${sec.family} · unidad marcada`,carrier:`${sec.family} · transporte hostil`,protect:`${sec.name} · cápsula aliada`,recover:`${sec.family} · guardianes del núcleo`,nodes:`${sec.name} · nodos de control`,ambush:`${sec.family} · cerco táctico`,relic:`${sec.name} · firma de reliquia`,cleanup:`${sec.family} · formación de cierre`};return cues[type]||sec.family;}
function objectiveAttachEnemy(e,o,role='target'){if(!e||!o)return e;e.objectiveId=o.id;e.objectiveRole=role;o.entities.push(e);return e;}
function spawnObjectiveEnemy(form,mode,o,role='target'){const e=spawnEnemy(form,null,null,mode);return objectiveAttachEnemy(e,o,role);}
function activateWaveObjective(){
  const o=G.waveObjective;if(!o||o.status!=='pending')return false;if(!encounterCanSpend(objectiveActivationCost(o.type)))return false;if(G.frenzyT>0&&o.type!=='protect')return false;
  const sec=SECTORS[G.sector-1],hard=runDifficultyKey()==='hard';o.status='active';o.t=0;G.objectiveHistory=(G.objectiveHistory||[]).concat(o.type).slice(-5);AudioX.tone(760,.09,.032,'triangle',0,150);notify(`◎ OBJETIVO · ${o.label} · ${objectiveWorldCue(o.type)}`,sec.accent,2.0);
  if(o.type==='priority'){
    o.maxT=hard?10.5:13;const e=objectiveAttachEnemy(spawnTransversal('rift_scout'),o);if(e){e.col=sec.accent;e.name=`MARCA ${sec.family}`;e.spd*=hard?1.18:1.08;e.score+=280;}spawnEnemy(sec.forms[1],null,null,'diagBottom');if(hard)spawnEnemy(sec.forms[1],null,null,'top');
  }else if(o.type==='carrier'){
    o.maxT=hard?15:18;const e=objectiveAttachEnemy(spawnTransversal('rift_carrier'),o);if(e){e.name=`PORTAENJAMBRE ${sec.family}`;e.score+=350;}spawnEnemy(sec.forms[0],null,null,'top');spawnEnemy(sec.forms[0],null,null,'bottom');if(hard)spawnEnemy(sec.forms[1],null,null,'diagTop');
  }else if(o.type==='protect'){
    o.maxT=hard?14:12;o.total=o.maxT;o.objectiveCd=hard?2.6:3.5;const hp=115+G.sector*8;o.capsule={x:W*.36,y:H*.5,r:27,hp,maxHp:hp,t:0,col:sec.accent};G.objectiveCapsule=o.capsule;spawnFormation('pincer');if(hard)spawnEnemy(sec.forms[1],null,null,'right');
  }else if(o.type==='recover'){
    o.maxT=hard?21:23;o.total=hard?3:2;for(let i=0;i<o.total;i++)spawnObjectiveEnemy(sec.forms[1],i%2?'bottom':'top',o,'guardian');if(hard)spawnEnemy(sec.forms[0],null,null,'right');
  }else if(o.type==='nodes'){
    o.maxT=hard?19:21;o.total=hard?4:3;const ys=o.total===4?[.20,.40,.62,.80]:[.25,.50,.75];for(let i=0;i<o.total;i++){const hp=(82+G.sector*13)*(hard?1.04:1),n={objectiveId:o.id,kind:'objectiveNode',x:W*(.58+(i%2)*.16),y:H*ys[i],r:22,hp,maxHp:hp,t:rnd(0,TAU),col:sec.accent,dead:false,pulseCd:rnd(1.2,2.2)};G.objectiveTargets.push(n);}spawnEnemy(sec.forms[0],null,null,'diagTop');if(hard)spawnEnemy(sec.forms[1],null,null,'diagBottom');
  }else if(o.type==='ambush'){
    o.maxT=hard?14:11;o.total=o.maxT;spawnFormation('cross');spawnFormation('pincer');if(hard){spawnEnemy(sec.forms[1],null,null,'top');spawnEnemy(sec.forms[1],null,null,'bottom');}
  }else if(o.type==='relic'){
    o.maxT=hard?9.5:12;const e=objectiveAttachEnemy(spawnTransversal('relic_hunter'),o);if(e){e.name=`RELIQUIA ${sec.family}`;e.spd*=hard?1.12:1;e.score+=520;}spawnEnemy(sec.forms[1],null,null,'diagBottom');if(hard)spawnEnemy(sec.forms[1],null,null,'diagTop');
  }else if(o.type==='cleanup'){
    o.maxT=hard?18:20;o.total=hard?7:5;const modes=['top','bottom','diagTop','diagBottom','right','leftTop','leftBottom'];for(let i=0;i<o.total;i++)spawnObjectiveEnemy(sec.forms[Math.min(2,i%3)],modes[i%modes.length],o,'cleanup');
  }
  return true;
}
function completeWaveObjective(reason='completado'){
  const o=G.waveObjective;if(!o||o.status!=='active')return false;o.status='complete';o.progress=o.total;G.objectiveTargets=[];G.objectiveCapsule=null;
  const reward=Math.round((38+G.sector*11+G.wave*9)*economyMult()),xp=grantRewardXp(42+G.sector*9+G.wave*8,'wave_objective');grantCredits(reward,'wave_objective',true);G.score+=reward*7;
  const px=clamp(G.player.x+78,70,W-70),py=clamp(G.player.y+rnd(-36,36),55,H-55);if(G.player.shield<G.player.maxShield*.68||['protect','ambush'].includes(o.type))spawnPickup(px,py,'shield');if(Math.random()<(runDifficultyKey()==='hard'?.28:.18))spawnPickup(px+26,py+18,'fragment');if(Math.random()<(runDifficultyKey()==='hard'?.10:.055))spawnPowerReward(px+42,py-18);
  AudioX.tone(980,.12,.045,'triangle',0,220);notify(`◎ OBJETIVO CUMPLIDO · +¤${reward} · +${xp} XP`,'#a6ff5f',2.1);return true;
}
function failWaveObjective(reason='objetivo perdido'){
  const o=G.waveObjective;if(!o||!['pending','active'].includes(o.status))return false;o.status='failed';o.failedReason=reason;G.objectiveTargets=[];G.objectiveCapsule=null;for(const q of G.pickups||[])if(q.type==='objectiveCore'&&q.objectiveId===o.id)q.life=0;for(const e of o.entities||[])if(e&&!e.dead&&e.objectiveId===o.id)e.objectiveId=null;AudioX.tone(210,.14,.035,'sawtooth',0,-60);notify(`◎ OBJETIVO FALLIDO · ${reason.toUpperCase()} · RANGO REDUCIDO`,'#ff8a93',2.0);return true;
}
function objectiveEnemyDefeated(e){
  const o=G.waveObjective;if(!o||o.status!=='active'||e.objectiveId!==o.id)return;
  if(['priority','carrier','relic'].includes(o.type)){completeWaveObjective('interceptado');return;}
  if(o.type==='recover'&&e.objectiveRole==='guardian'){o.progress=Math.min(o.total,o.progress+1);if(o.progress>=o.total&&!o.coreSpawned){o.coreSpawned=true;const q=spawnPickup(clamp(e.x,70,W-70),clamp(e.y,55,H-55),'objectiveCore');q.objectiveId=o.id;q.r=15;q.life=Math.max(q.life,18);notify('◎ NÚCLEO LIBERADO · RECÓGELO','#fff09a',1.5);}}
  if(o.type==='cleanup'){o.progress=Math.min(o.total,o.progress+1);if(o.progress>=o.total)completeWaveObjective('zona limpia');}
}
function objectiveEnemyEscaped(e){const o=G.waveObjective;if(!o||o.status!=='active'||e.objectiveId!==o.id)return;if(['priority','carrier','relic','cleanup','recover'].includes(o.type))failWaveObjective('objetivo escapó');}
function destroyObjectiveTarget(n){if(!n||n.dead)return;n.dead=true;const o=G.waveObjective;if(!o||o.status!=='active'||n.objectiveId!==o.id)return;o.progress=Math.min(o.total,o.progress+1);burst(n.x,n.y,n.col||'#fff09a',18,180);AudioX.tone(620,.07,.025,'triangle',0,110);if(o.progress>=o.total)completeWaveObjective('nodos destruidos');}
function updateWaveObjective(dt){
  const o=G?.waveObjective;if(!o||G.boss||G.bossPending||G.sectorClear)return;if(o.status==='pending'){if((G.goal?G.kills/G.goal:0)>=o.trigger)activateWaveObjective();return;}if(o.status!=='active')return;o.t+=dt;
  if(o.type==='protect'&&o.capsule){const c=o.capsule;c.t+=dt;o.progress=Math.min(o.total,o.t);let nearby=0;for(const e of G.enemies){if(!e.dead&&!e.microSwarm&&dist(e,c)<145)nearby++;}if(nearby)c.hp-=dt*nearby*(runDifficultyKey()==='hard'?2.1:1.45);o.objectiveCd-=dt;if(o.objectiveCd<=0){o.objectiveCd=runDifficultyKey()==='hard'?2.45:3.35;const sec=SECTORS[G.sector-1];spawnEnemy(sec.forms[runDifficultyKey()==='hard'?1:0],null,null,pick(['top','bottom','right']));}if(c.hp<=0){failWaveObjective('cápsula destruida');return;}if(o.t>=o.maxT){completeWaveObjective('cápsula asegurada');return;}}
  else if(o.type==='ambush'){o.progress=Math.min(o.total,o.t);if(o.t>=o.maxT){completeWaveObjective('emboscada resistida');return;}}
  else if(o.type==='nodes'){for(const n of G.objectiveTargets){if(n.dead)continue;n.t+=dt;n.pulseCd-=dt;if(runDifficultyKey()==='hard'&&n.pulseCd<=0){n.pulseCd=rnd(2.0,2.8);const a=Math.atan2(G.player.y-n.y,G.player.x-n.x);spawnEnemyBullet(n.x,n.y,a,245+G.sector*5,6.5,4,n.col,null);}}}
  if(o.maxT>0&&o.t>=o.maxT&&!['protect','ambush'].includes(o.type))failWaveObjective('tiempo agotado');
}
function waveObjectiveBlocksClear(){const o=G?.waveObjective;return !!(o&&['pending','active'].includes(o.status));}
function canStartFrenzy(){const o=G?.waveObjective;if(!o)return true;if(o.status==='complete'||o.status==='failed')return true;return o.status==='pending'&&o.type==='cleanup';}
function objectiveHudText(){const o=G?.waveObjective;if(!o||o.status!=='active')return '';let suffix='';if(o.type==='recover'&&o.coreSpawned)suffix=' · RECOGE';else if(['priority','carrier','relic'].includes(o.type))suffix=` ${Math.max(0,Math.ceil(o.maxT-o.t))}s`;else if(['protect','ambush'].includes(o.type))suffix=` ${Math.max(0,Math.ceil(o.maxT-o.t))}s`;else suffix=` ${Math.min(o.progress,o.total)}/${o.total}`;return `◎ OBJETIVO · ${WAVE_OBJECTIVES[o.type].short}${suffix}`;}
function drawWaveObjectiveEntities(){
  const o=G?.waveObjective;if(!o||o.status!=='active')return;
  for(const n of G.objectiveTargets||[]){if(n.dead)continue;const pulse=1+Math.sin(G.elapsed*5+n.t)*.06,img=IMG.objectives.node,d=n.r*3.15;cx.save();cx.translate(n.x,n.y);cx.scale(pulse,pulse);cx.rotate(G.elapsed*.18+n.t*.08);cx.shadowColor=n.col;cx.shadowBlur=16;if(imgReady(img)){const sc=Math.min(d/img.naturalWidth,d/img.naturalHeight);cx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);}else{cx.fillStyle=n.col;cx.beginPath();cx.arc(0,0,n.r,0,TAU);cx.fill();}cx.shadowBlur=0;cx.restore();}
  if(o.capsule){const c=o.capsule,p=clamp(c.hp/c.maxHp,0,1),img=IMG.objectives.capsule,d=c.r*3.35;cx.save();cx.translate(c.x,c.y);cx.shadowColor=c.col;cx.shadowBlur=14;if(imgReady(img)){const sc=Math.min(d/img.naturalWidth,d/img.naturalHeight);cx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);}else{cx.fillStyle=c.col;cx.beginPath();cx.arc(0,0,c.r,0,TAU);cx.fill();}cx.shadowBlur=0;cx.restore();const w=72,x=c.x-w/2,y=c.y+c.r;cx.fillStyle='rgba(0,0,0,.65)';cx.fillRect(x,y,w,5);cx.fillStyle=c.col;cx.fillRect(x,y,w*p,5);}
  cx.textAlign='left';
}

const WORLD_MICRO_EVENTS={
  distant:'BATALLA LEJANA',salvage:'CORREDOR DE SALVAMENTO',shield:'CÁPSULA DE ESCUDO',meteor:'LLUVIA DE RESTOS',ghost:'ESCUADRÓN FANTASMA'
};
function ambientPropAsset(sec,kind){
  const pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift||[],ships=IMG.generatedShips||[];
  if(kind==='ship')return pick(ships.filter(Boolean))||IMG.enemyShips.scout;
  if(kind==='wreck')return pick([pack[2],pack[3],pack[4],pack[10],pack[11]].filter(Boolean))||IMG.obstacles.wreck;
  if(kind==='pod')return pick([pack[4],pack[5],pack[8],pack[9]].filter(Boolean))||IMG.obstacles.pod;
  return pick([pack[0],pack[1],pack[6],pack[7],pack[8]].filter(Boolean))||IMG.obstacles.rock;
}
function spawnAmbientProp(kind=null,depth=false){
  if(!G||G.boss||G.sectorClear)return null;const sec=SECTORS[G.sector-1],k=kind||pick(['rock','wreck','ship','pod']),img=ambientPropAsset(sec,k),prop={kind:k,img,depth,rot:rnd(0,TAU),spin:rnd(-.35,.35),alpha:rnd(.14,.31),life:rnd(10,18),base:rnd(28,66),dead:false};
  if(depth){prop.z=1;prop.startX=rnd(W*.40,W*.92);prop.startY=rnd(H*.15,H*.85);prop.targetX=rnd(W*.12,W*.78);prop.targetY=rnd(H*.12,H*.88);prop.x=prop.startX;prop.y=prop.startY;prop.life=rnd(4.2,6.8);}
  else{prop.x=W+rnd(30,180);prop.y=rnd(54,H-44);prop.vx=-rnd(22,68);prop.vy=rnd(-10,10);prop.parallax=rnd(.55,1.15);}
  G.ambientProps=G.ambientProps||[];const hardCap=compactUI()?10:16;if(G.ambientProps.length>=hardCap)G.ambientProps.shift();G.ambientProps.push(prop);return prop;
}
function updateAmbientProps(dt){
  if(!G)return;G.ambientProps=G.ambientProps||[];for(const a of G.ambientProps){a.life-=dt;a.rot+=a.spin*dt;if(a.depth){a.z=Math.max(0,a.z-dt*(.15+(1-a.z)*.16));const q=1-a.z,ease=q*q*(3-2*q);a.x=lerp(a.startX,a.targetX,ease);a.y=lerp(a.startY,a.targetY,ease);if(a.z<=.02)a.dead=true;}else{a.x+=a.vx*dt*a.parallax;a.y+=a.vy*dt;if(a.x<-160)a.dead=true;}if(a.life<=0)a.dead=true;}G.ambientProps=G.ambientProps.filter(a=>!a.dead);
}
function drawAmbientProps(){
  if(!G?.ambientProps?.length)return;const compact=compactUI();let idx=0;for(const a of G.ambientProps){idx++;if(compact&&idx>6)break;const img=a.img;if(!imgReady(img))continue;let d=a.base,alpha=a.alpha;if(a.depth){const q=1-(a.z??1);d=a.base*(.20+Math.pow(q,2.15)*2.25);alpha=Math.min(.34,a.alpha*(.45+q*1.15));}cx.save();cx.globalAlpha=alpha;cx.translate(a.x,a.y);cx.rotate(a.rot);const sc=Math.min(d/img.naturalWidth,d/img.naturalHeight),iw=img.naturalWidth*sc,ih=img.naturalHeight*sc;cx.drawImage(img,-iw/2,-ih/2,iw,ih);cx.restore();}
}
function distantBattleFx(intensity=1){
  const sec=SECTORS[G.sector-1],n=compactUI()?2:Math.round(3+intensity*2);for(let i=0;i<n;i++){const y=rnd(H*.12,H*.88),x=rnd(W*.42,W*.95);G.particles.push({kind:'slash',x,y,a:Math.PI,len:rnd(60,150),life:rnd(.22,.42),max:.42,col:i%2?sec.accent:'#9fe6ff'});}if(!compactUI()&&Math.random()<.7){const x=rnd(W*.50,W*.90),y=rnd(H*.18,H*.82);G.particles.push({kind:'shock',x,y,r:8,vr:rnd(140,260),life:.45,max:.45,col:sec.accent});}
}
function maybePressureRelief(source='event'){
  if(!G||G.mode==='training'||G.boss||G.bossPending)return false;const ratio=G.player.shield/G.player.maxShield;if(ratio>.30||G.pressureReliefWave===G.wave)return false;const chance=runDifficultyKey()==='hard'?.46:.58;if(Math.random()>chance)return false;G.pressureReliefWave=G.wave;const x=clamp(G.player.x+100,80,W-80),y=clamp(G.player.y+rnd(-55,55),65,H-65);spawnPickup(x,y,'shield');notify(`APOYO TÁCTICO · ESCUDO`, '#7fb7ff',1.35);return true;
}
function chooseWorldMicroEvent(){
  const pool=['distant','salvage','meteor','ghost'];if(G.player.shield/G.player.maxShield<.52)pool.push('shield');const hist=G.worldEventHistory||[],filtered=pool.filter(v=>!hist.slice(-2).includes(v)),allowed=filtered.length?filtered:pool;return weightedPick(directorProfile().micro,allowed)||pick(allowed);
}
function fireWorldMicroEvent(type=chooseWorldMicroEvent()){
  if(!G||G.boss||G.bossPending||G.sectorClear||G.mode==='training'||G.mode==='bossRush')return;const sec=SECTORS[G.sector-1];
  if(type==='distant'){for(let i=0;i<4;i++)spawnAmbientProp(i%2?'ship':'wreck',i>1);distantBattleFx(1.2);notify('SEÑAL · BATALLA LEJANA',sec.accent,1.05);}
  else if(type==='salvage'){for(let i=0;i<5;i++)spawnAmbientProp(i%2?'wreck':'rock',false);for(let i=0;i<2;i++)spawnPickup(rnd(W*.54,W*.76),rnd(H*.28,H*.72),'credit');notify('SEÑAL · CORREDOR DE SALVAMENTO','#ffd98a',1.15);}
  else if(type==='shield'){spawnAmbientProp('pod',true);spawnPickup(rnd(W*.56,W*.72),rnd(H*.30,H*.70),'shield');if(G.wave>=2){spawnEnemy(sec.forms[0],null,null,'top');spawnEnemy(sec.forms[0],null,null,'bottom');}notify('SEÑAL · CÁPSULA DE ESCUDO','#7fb7ff',1.2);}
  else if(type==='meteor'){for(let i=0;i<(compactUI()?3:5);i++)spawnAmbientProp(i%2?'rock':'wreck',true);if(Math.random()<.55)spawnFrontThreat('meteor');notify('SEÑAL · LLUVIA DE RESTOS','#d3e7ff',1.1);}
  else if(type==='ghost'){for(let i=0;i<(compactUI()?2:4);i++)spawnAmbientProp('ship',i%2===0);distantBattleFx(.8);if(G.wave>=2&&Math.random()<.45)spawnTransversal('rift_scout');notify('SEÑAL · ESCUADRÓN FANTASMA','#9fe6ff',1.1);}
  G.worldEventHistory=(G.worldEventHistory||[]).concat(type).slice(-4);G.worldEventCount=(G.worldEventCount||0)+1;
}
// v2.14.0 · HANGAR EVOLUTION ARSENAL
function phaseLance(){
  const p=G.player,t=findTarget();if(!t)return;const r=powerRank('phase'),a=Math.atan2(t.y-p.y,t.x-p.x),spd=980+r*45,dmg=(36+r*13+(G.activeCombos[comboId('phase','rail')]?18:0))*(branchIs('phase','A')?1.22:1);
  G.bullets.push(stampPowerProjectile({x:p.x+Math.cos(a)*26,y:p.y+Math.sin(a)*26,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:4.6,dmg,life:1.15,col:'#72f6ff',type:'phase',pierce:2+Math.floor(r/2),trail:52+r*5},'phase',r));
  G.particles.push({kind:'slash',x:p.x,y:p.y,a,len:110+r*12,life:.14,max:.14,col:'#72f6ff'});AudioX.tone(720+r*34,.055,.018,'sawtooth',0,180);
}
function nanitePulse(){
  const p=G.player,r=powerRank('nanites'),radius=(175+r*18)*(branchIs('nanites','B')?1.24:1),targets=[...G.enemies.filter(e=>!e.dead&&dist(p,e)<radius)].sort((a,b)=>dist(p,a)-dist(p,b)).slice(0,2+Math.floor(r/2)+(branchIs('nanites','A')?1:0));
  let hits=0;for(const e of targets){damageEntity(e,(16+r*6)*(G.activeCombos[comboId('bio','nanites')]?1.28:1),'nanites');G.particles.push({kind:'arc',x:p.x,y:p.y,x2:e.x,y2:e.y,life:.12,max:.12,col:'#93ff9b'});hits++;}
  if(G.boss&&!G.boss.dead&&dist(p,G.boss)<radius+80){damageEntity(G.boss,11+r*4,'nanites');hits++;}
  if(hits&&G.activeCombos[comboId('hemadrain','nanites')])G.player.shield=Math.min(G.player.maxShield,G.player.shield+Math.min(4,1+hits*.55));
  for(let i=0;i<Math.min(10,4+r);i++){const a=G.elapsed*2.7+i*TAU/Math.min(10,4+r);G.particles.push({kind:'spark',x:p.x+Math.cos(a)*(28+r*2),y:p.y+Math.sin(a)*(22+r),vx:Math.cos(a)*45,vy:Math.sin(a)*45,r:1.5,life:.22,max:.22,col:'#93ff9b'});}
}
function deployRiftMine(){
  const p=G.player,r=powerRank('riftmine');G.powerMines=G.powerMines||[];if(G.powerMines.length>=Math.min(8,2+Math.ceil(r/2)+(branchIs('riftmine','A')?2:0)))G.powerMines.shift();
  G.powerMines.push({x:p.x-34-rnd(0,18),y:p.y+rnd(-16,16),r:9+Math.min(5,r),rank:r,arm:.28,life:5.2,col:'#ffb064',pulse:rnd(0,TAU)});
}
function detonateRiftMine(m){
  const combo=G.activeCombos[comboId('gravity','riftmine')],radius=(92+m.rank*13+(combo?32:0))*(branchIs('riftmine','B')?1.26:1),dmg=(34+m.rank*12)*(branchIs('riftmine','B')?1.26:1);G.particles.push({kind:'shock',x:m.x,y:m.y,r:8,vr:420+m.rank*22,life:.42,max:.42,col:m.col});burst(m.x,m.y,m.col,14+m.rank*2,160);
  for(const e of G.enemies)if(!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<radius)damageEntity(e,dmg,'riftmine');if(G.boss&&!G.boss.dead&&Math.hypot(G.boss.x-m.x,G.boss.y-m.y)<radius+G.boss.r)damageEntity(G.boss,dmg*.72,'riftmine');
  if(combo)for(const b of G.eBullets)if(Math.hypot(b.x-m.x,b.y-m.y)<radius*.72)b.life=0;m.dead=true;AudioX.tone(128+m.rank*18,.09,.022,'square',0,-50);
}
function updatePowerMines(dt){
  G.powerMines=G.powerMines||[];for(const m of G.powerMines){m.arm=Math.max(0,m.arm-dt);m.life-=dt;m.pulse+=dt*4;let near=false;if(m.arm<=0){near=G.enemies.some(e=>!e.dead&&Math.hypot(e.x-m.x,e.y-m.y)<62+m.rank*6)||(G.boss&&!G.boss.dead&&Math.hypot(G.boss.x-m.x,G.boss.y-m.y)<G.boss.r+58);}if(near||m.life<=0)detonateRiftMine(m);}G.powerMines=G.powerMines.filter(m=>!m.dead&&m.life>0);
}
function temporalEchoVolley(){
  const p=G.player,t=findTarget();if(!t)return;const r=powerRank('echo'),base=Math.atan2(t.y-p.y,t.x-p.x),n=(G.activeCombos[comboId('echo','twin')]?5:(r>=5?4:r>=3?3:2))+(branchIs('echo','A')?1:0),spread=.075,dmg=15+r*5;
  for(let i=0;i<n;i++){const off=(i-(n-1)/2)*spread,a=base+off;G.bullets.push(stampPowerProjectile({x:p.x-12,y:p.y,vx:Math.cos(a)*(720+r*24),vy:Math.sin(a)*(720+r*24),r:3.5,dmg,life:1.5,col:'#b9a6ff',type:'spark',pierce:r>=6?1:0,trail:26},'echo',r));}
  for(let i=0;i<3;i++)G.particles.push({kind:'halo',x:p.x-i*11,y:p.y,r:8+i*3,vr:115,life:.25,max:.25,col:'#b9a6ff'});
}
function entomicNova(){
  const p=G.player,r=powerRank('nova'),combo=G.activeCombos[comboId('nova','resonance')],radius=(150+r*22+(combo?35:0))*(branchIs('nova','A')?1.22:1),dmg=25+r*9;G.particles.push({kind:'shock',x:p.x,y:p.y,r:12,vr:520+r*35,life:.52,max:.52,col:'#ff8be2'});
  for(let ring=0;ring<2+(r>=5?1:0);ring++)G.particles.push({kind:'ring',x:p.x,y:p.y,r:20+ring*18,vr:300+ring*75,life:.46,max:.46,col:ring%2?'#ffd1f2':'#ff8be2'});
  for(const e of G.enemies)if(!e.dead&&dist(p,e)<radius)damageEntity(e,dmg,'nova');if(G.boss&&!G.boss.dead&&dist(p,G.boss)<radius+G.boss.r)damageEntity(G.boss,dmg*.72,'nova');for(const b of G.eBullets)if(Math.hypot(b.x-p.x,b.y-p.y)<radius*(combo?.95:.72))b.life=0;shake=Math.max(shake,4+r*.5);AudioX.tone(240+r*22,.14,.03,'triangle',0,260);
}
function drawPowerMines(){
  for(const m of G.powerMines||[]){cx.save();const mv=powerVisual('riftmine',m.rank||1);cx.translate(m.x,m.y);cx.rotate(m.pulse*(mv.branch==='A'?.62:.45));cx.globalAlpha=m.arm>0?.45:.82+.15*Math.sin(m.pulse*3);cx.strokeStyle=mv.accent;cx.fillStyle=hexA(mv.accent,.12);cx.lineWidth=mv.ascended?2.8:2;cx.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6,x=Math.cos(a)*m.r,y=Math.sin(a)*m.r;i?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();cx.stroke();cx.beginPath();cx.arc(0,0,m.r*.34,0,TAU);cx.fillStyle=m.col;cx.fill();cx.restore();}
}
function updateWorldDynamics(dt){
  if(!G)return;updateAmbientProps(dt);if(G.boss||G.bossPending||G.sectorClear||G.mode==='training'||G.mode==='bossRush')return;const basePropCap=(activeWaveObjective()||G.frenzyT>0)?(compactUI()?3:5):(compactUI()?5:8),propCap=Math.max(2,Math.round(basePropCap*performanceAmbientFactor()));G.ambientPropTimer=(G.ambientPropTimer??2)-dt;if(G.ambientPropTimer<=0&&G.ambientProps.length<propCap){spawnAmbientProp(null,Math.random()<(G.frenzyT>0?.38:.18));G.ambientPropTimer=rnd(G.frenzyT>0?.7:1.5,G.frenzyT>0?1.5:2.8);}
  G.worldEventTimer=(G.worldEventTimer??22)-dt;const maxEvents=G.wave===1?1:2;if(G.worldEventTimer<=0&&(G.worldEventCount||0)<maxEvents&&encounterCanSpend(1.5)&&!activeWaveObjective()){fireWorldMicroEvent();G.worldEventTimer=rnd(runDifficultyKey()==='hard'?16:19,runDifficultyKey()==='hard'?23:29);}
  if(G.frenzyT>0&&Math.random()<dt*(compactUI()?.45:.8)*performanceAmbientFactor())distantBattleFx(.45);
}
function waveGoal(sector,wave){const base=11.2,chapter=sector>10?5.5:0,late=Math.max(0,sector-4)*.78,d=RUN_DIFFICULTY[(G?.runDifficulty||META.selectedDifficulty)==='hard'?'hard':'normal'];return Math.round((base+sector*1.82+wave*4.15+late+chapter)*ENEMY_COUNT_MULT*d.enemyCount);}
function difficulty(){const s=G.sector,w=G.wave,chapter=s>10?.18:0,late=Math.max(0,s-6)*.014;const base=1+(s-1)*.096+(w-1)*.105+chapter+late+Math.min(.24,G.elapsed/210*.16);return G.mode==='training'?base*.72:base;}
function sectorTempo(sector=G?.sector||1){const s=clamp(sector,1,20);return {speed:1+Math.max(0,s-1)*.012+(s>10?(s-10)*.009:0),formation:Math.max(.74,1-Math.max(0,s-1)*.009),microCadence:clamp(1.05-(s-1)*.017,.68,1.05)};}
// v2.15.1 · presión adaptativa suave: aumenta tempo/composición, nunca HP, y ofrece alivio cuando la nave está dañada.
function adaptivePressure(){if(!G?.player)return {cadence:1,alive:1,label:'NEUTRA'};const p=G.player,hp=p.hp/Math.max(1,p.maxHp),sh=p.shield/Math.max(1,p.maxShield),progress=G.goal?G.kills/Math.max(1,G.goal):0,hits=G.waveHits||0,grace=G.recoveryGraceT||0;if(grace>0||hp<.28)return {cadence:1.14,alive:.90,label:'ALIVIO'};if(hp<.46||sh<.12)return {cadence:1.08,alive:.94,label:'CONTENCIÓN'};if(progress>.34&&hits===0&&(G.combo||0)>=8)return {cadence:.94,alive:1.06,label:'ASCENSO'};if(progress>.60&&hits<=1)return {cadence:.97,alive:1.03,label:'PRESIÓN'};return {cadence:1,alive:1,label:'NEUTRA'};}

function economyMult(sector=G?.sector||1){return sectorBalance(sector).reward*(1+up('salvage')*.08)*runDifficulty().reward;}
function creditPickupBase(sector=G?.sector||1){return Math.round((18+sector*4.4)*sectorBalance(sector).reward);}
function waveTransitionReward(sector,wave){return Math.round((30+sector*9+wave*7)*economyMult(sector));}
function expansionRewardScale(sector=G?.sector||1){return sector<=10?1:1+Math.min(.65,(sector-10)*.045);}
function ensureRewardLedger(){if(!G)return null;G.rewardLedger=G.rewardLedger||{credits:{},xp:{}};return G.rewardLedger;}
function grantCredits(amount,source='misc',bonus=false){if(!G)return 0;const value=Math.max(0,Math.round(amount));G.credits+=value;if(bonus)G.bonusCredits=(G.bonusCredits||0)+value;META.credits=G.credits;const l=ensureRewardLedger();if(l)l.credits[source]=(l.credits[source]||0)+value;return value;}
function grantRewardXp(base,source='misc',applyDifficulty=true){if(!G)return 0;const value=Math.max(0,Math.round(base*(applyDifficulty?runDifficulty().xp:1)*expansionRewardScale()));gainXp(value);const l=ensureRewardLedger();if(l)l.xp[source]=(l.xp[source]||0)+value;return value;}
function collectBossCore(q){
  // Compatibilidad de seguridad con objetos efímeros de versiones previas: nunca abre una pantalla modal.
  const r=q?.payload||null;if(r?.claimed)return;if(r)r.claimed=true;
  const bonus=Math.round((70+G.sector*9)*runDifficulty().reward);
  grantCredits(bonus,'legacy_boss_core',true);AudioX.pickup();
  burst(G.player.x,G.player.y,SECTORS[G.sector-1].accent,18,160);
  notify(`PREMIO DE JEFE INTEGRADO · +¤${bonus}`,'#fff09a',1.35);
}

function setScreen(s){
  if(!G){G={screen:s,credits:META.credits,hiScore:META.hiScore};}else G.screen=s;
  const gameplay=s==='GAME';
  document.body.classList.toggle('require-landscape',gameplay&&isCoarse());
  touchHud.style.display=gameplay && isCoarse() && G?.mode!=='chase'?'block':'none';
  shopBtn.style.display=gameplay&&G?.mode!=='chase'?'block':'none';const allyPool=gameplay&&G?.mode==='campaign'&&(G?.sector||0)>=11?riftAllyPool():[];allyBtn.style.display=allyPool.length?'block':'none';allyBtn.classList.toggle('ally-active',!!G?.riftAlly);allyBtn.classList.toggle('ally-spent',!!G?.riftAllyUsed&&!G?.riftAlly);allyBtn.title=G?.riftAlly?`RIFT ALLY · ${G.riftAlly.name} · ${G.riftAlly.signature||''}`:G?.riftAllyUsed?'RIFT ALLY · carga agotada':`RIFT ALLY · ${allyPool.length} jefes derrotados disponibles · selección aleatoria`;shopBtn.classList.toggle('rescue-alert',!!(G?.lastChanceT>0));pauseBtn.style.display=gameplay?'block':'none';if(topActions)topActions.style.visibility=s==='PLAYLIST'?'hidden':'visible';syncHudPresentation();
  if(gameplay&&isCoarse())setTimeout(tryFullscreen,40);
  if(!gameplay){resetStick();}
}

function noticeIcon(text=''){
  const t=String(text);if(/^[★✦✹⚡⚠☠♥❤⬡⬢◎◆◈▣♫▲¤🎯🚀⚔✕🛒]/u.test(t))return '';
  if(/CHECKPOINT|GUARDAD/i.test(t))return '▣ ';if(/OBJETIVO/i.test(t))return '◎ ';if(/ORDA/i.test(t))return '⚔ ';if(/FRENES[IÍ]/i.test(t))return '⚡ ';if(/DIRECTOR|EVENTO/i.test(t))return '◆ ';if(/JEFE|BOSS|MANDO|SOBERANO/i.test(t))return '☠ ';if(/HERENCIA|PODER|POTENCIADOR|IMPACTO/i.test(t))return '✦ ';if(/ESCUDO|SHIELD/i.test(t))return '⬡ ';if(/VIDA|REPARACI[ÓO]N|HEMOGEL/i.test(t))return '♥ ';if(/NIVEL|FASE/i.test(t))return '▲ ';if(/RACHA|BAJAS/i.test(t))return '✕ ';if(/HANGAR|RESERVA|COMPRA/i.test(t))return '🛒 ';if(/PREMIO|ZONA SEGURA|COMPLETAD|DERROTADO/i.test(t))return '★ ';return '';
}
function notify(text,color='#fff',seconds=2){const decorated=noticeIcon(text)+String(text).replace(/\s+/g,' ').trim(),item={text:decorated,color,t:seconds,max:seconds};notices.unshift(item);const cap=compactUI()?2:3;if(notices.length>cap)notices.length=cap;}
function fitNoticeText(text,maxW){let out=String(text||'');if(cx.measureText(out).width<=maxW)return out;while(out.length>3&&cx.measureText(out+'…').width>maxW)out=out.slice(0,-1);return out+'…';}
function xpForEnemy(e){return Math.round(((FORM_STATS[e.form]?.score||100)*.20 + G.sector*5 + G.wave*3)*runDifficulty().xp);}
function weaponLevelBonus(lv=G?.level||1){const n=Math.max(0,lv-1),a=Math.min(n,9),b=Math.min(Math.max(0,n-9),10),c=Math.max(0,n-19);return a*.06+b*.03+c*.015;}
function weaponSectorBonus(sec=G?.sector||1){const n=Math.max(0,sec-1),a=Math.min(n,5),b=Math.max(0,n-5);return a*.035+b*.022;}
function weaponLevelStep(lv=G?.level||1){return lv<=10?6:lv<=20?3:1.5;}
function gainXp(amount){if(!G||amount<=0)return;G.xp+=amount;while(G.xp>=G.xpNext){G.xp-=G.xpNext;G.level++;G.xpNext=Math.round(G.xpNext*1.22);G.player.maxHp+=4;G.player.hp=Math.min(G.player.maxHp,G.player.hp+10);G.player.shield=Math.min(G.player.maxShield,G.player.shield+8);notify(`NIVEL ${G.level} · ARMA BASE +${weaponLevelStep(G.level)}%`,'#a6ff5f',1.8);burst(G.player.x,G.player.y,'#a6ff5f',24,160);}}
function comboId(a,b){return [a,b].sort().join('+');}
function comboOn(a,b){return powerOn(a)&&powerOn(b);}
function enemyTier(form){for(const sec of SECTORS){const idx=sec.forms.indexOf(form);if(idx>=0)return idx;}return 0;}
function countActivePowers(){return Object.keys(G.powers).length;}
function supportCount(){if(!G)return 0;const lv=G.level||1,base=lv>=18?5:lv>=14?4:lv>=10?3:lv>=6?2:lv>=3?1:0,hangar=Math.min(2,Math.ceil(up('drone')/2)),temp=powerOn('drone')?Math.min(2,powerRank('drone')):0,branch=powerOn('drone')&&branchIs('drone','A')?1:0;return clamp(base+hangar+temp+branch,0,6);}
function supportRole(i,count){const pattern=['scout','scout','lancer','orbiter','lancer'];return pattern[Math.min(i,pattern.length-1)]||'scout';}
function supportRate(){let r=.64-(supportCount()*0.022);if(powerOn('drone')&&branchIs('drone','B'))r*=.84;if(powerOn('overdrive'))r*=.88;if(powerOn('burst'))r*=.84;if(G.activeCombos[comboId('burst','drone')])r*=.84;if(G.activeCombos[comboId('drone','sparklaser')])r*=.9;return Math.max(.31,r);}
function supportOrbit(i,count,lead=0){const role=supportRole(i,count),a=G.elapsed*(role==='orbiter'?1.45:1.85+(count*.02))+i/count*TAU+lead,base=role==='orbiter'?54:38,rx=base+count*3+(i%2?7:0),ry=(role==='orbiter'?39:28)+count*2+((i+1)%2?4:0);return {a,x:G.player.x+Math.cos(a)*rx,y:G.player.y+Math.sin(a)*ry,role};}
function powerDropPool(){
  const sector=G?.sector||1,focus=POWER_WORLD_FOCUS[sector]||POWER_WORLD_FOCUS[1],pool=['twin','shield','magnet'];
  for(const k of focus)for(let i=0;i<3;i++)pool.push(k);
  if(sector>=2)pool.push('cryo','acid','drone');
  if(sector>=3)pool.push('missile','tesla','rail','burst');
  if(sector>=4)pool.push('overdrive','phase');
  if(sector>=5)pool.push('gravity','drone','burst','nanites');
  if(sector>=6)pool.push('sparklaser','riftmine','orbitblade');
  if(sector>=7)pool.push('bio');
  if(sector>=8)pool.push('echo');
  if(sector>=9)pool.push('ionweb');
  if(sector>=10)pool.push('nova');
  for(const k of Object.values(META.bossUnlocks||{})){if(k&&POWERS[k])pool.push(k);}
  return pool.filter(k=>POWERS[k]&&!INSTANT_POWERS.has(k));
}
function smartDropScore(key){
  const focus=POWER_WORLD_FOCUS[G?.sector||1]||[],rank=G?.powerRanks?.[key]||0,cap=powerRankCap(),active=powerOn(key),queued=(G?.powerQueue||[]).includes(key);let score=18;
  if(focus.includes(key))score+=24;if(bossCounterKeys(G?.sector||1).includes(key))score+=(G?.boss||G?.preBossT>0?28:12);if(rank<cap)score+=12;if(!rank)score+=8;if(active)score-=10;if(queued)score-=18;if(G?.lastPowerDrop===key)score-=16;score+=doctrinePowerScore(key);const hist=G?.powerDropHistory||[];if(hist[0]===key)score-=24;else if(hist[1]===key)score-=13;else if(hist[2]===key)score-=7;
  for(const id of Object.keys(COMBOS)){const [a,b]=id.split('+');if(a===key&&powerOn(b))score+=30;if(b===key&&powerOn(a))score+=30;}
  if(key==='shield'&&G?.player&&G.player.shield/G.player.maxShield<.42)score+=22;if(key==='magnet'&&(G?.pickups?.length||0)>5)score+=7;
  return Math.max(2,score);
}
function pickPowerDrop(){
  if((G?.sector||1)>=3&&Math.random()<.050)return 'bomb';const keys=[...new Set(powerDropPool())],weights=keys.map(k=>[k,smartDropScore(k)]),chosen=weightedPick(weights)||pick(keys);if(G){G.lastPowerDrop=chosen;G.powerDropHistory=[chosen,...(G.powerDropHistory||[]).filter(k=>k!==chosen)].slice(0,3);}return chosen;
}
function powerDropBudget(){return runDifficultyKey()==='hard'?8:7;}
function powerDropThreshold(){return 11+Math.floor((G?.sector||1)*.52)+(G?.wave||1)*2;}
function evolvePowerFragment(){const cap=powerRankCap(),candidates=Object.keys(G.powerRanks||{}).filter(k=>POWERS[k]&&!INSTANT_POWERS.has(k)&&(G.powerRanks[k]||0)<cap);if(candidates.length){const weights=candidates.map(k=>[k,12+smartDropScore(k)+(powerOn(k)?18:0)+((G.powerQueue||[]).includes(k)?8:0)]),k=weightedPick(weights)||pick(candidates);G.powerRanks[k]=(G.powerRanks[k]||1)+1;const pd=POWERS[k];notify(`FRAGMENTO · ${pd.icon} ${pd.name} → ${rankRoman(G.powerRanks[k])}${powerEvolutionLabel(G.powerRanks[k])?' · '+powerEvolutionLabel(G.powerRanks[k]):''}`,pd.color,1.8);AudioX.power(k);powerActivationVfx(k);return;}const bonus=grantCredits(Math.round((35+G.sector*6)*runDifficulty().reward),'fragment',true);grantRewardXp(30+G.sector*5,'fragment');notify(`FRAGMENTO CONVERTIDO · +¤${bonus}`,'#d6f6ff',1.5);AudioX.pickup();}
function spawnPowerReward(x,y,key=null,force=false){
  if(force||(G.powerDropsThisSector||0)<powerDropBudget()){if(!force)G.powerDropsThisSector=(G.powerDropsThisSector||0)+1;return spawnPickup(x,y,'power',key||pickPowerDrop());}
  return spawnPickup(x,y,'fragment');
}

function maybeSupportInfusion(){const keys=['cryo','acid','rail','missile','tesla'].filter(k=>powerOn(k));if(!keys.length)return null;return Math.random()<.38?pick(keys):null;}
const SHIP_FORMS=['ship_scout','ship_frigate','ship_bomber'];
const SHIP_LABELS={ship_scout:'SCOUT',ship_frigate:'FRIGATE',ship_bomber:'BOMBER'};
function obstacleSpriteKey(type){
  if(['spire','pillar','bulwark','hopperrock','shard','spike'].includes(type))return 'rock';
  if(type==='mine')return 'mine';
  if(type==='drone')return 'wreck';
  if(type==='gate')return 'gate';
  if(['acidpod','spore','dustpod','cocoon'].includes(type))return 'pod';
  if(type==='nest')return 'nest';
  if(type==='seed')return 'seed';
  return 'rock';
}
function pickupSpriteKey(q){return q.type==='power'?'power':q.type;}
function chooseTieredForm(sec){
  const prof=directorProfile(),tw=prof.tiers||{grunt:1,mid:1,heavy:1},waveSpec=ch2WaveSpec();let base;
  if(waveSpec?.tiers)base=[...waveSpec.tiers];else if(G.wave===1)base=[.74,.23,.03];else if(G.wave===2)base=[.38,.50,.12];else{const late=G.sector>=7;base=[late?.18:.22,(late?.64:.68)-(late?.18:.22),1-(late?.64:.68)];}
  const form=weightedPick({[sec.forms[0]]:base[0]*(tw.grunt||1),[sec.forms[1]]:base[1]*(tw.mid||1),[sec.forms[2]]:base[2]*(tw.heavy||1)});let chosen=form||sec.forms[0];
  if(runDifficultyKey()==='hard'&&Math.random()<runDifficulty().eliteBias){if(chosen===sec.forms[0])chosen=sec.forms[1];else if(chosen===sec.forms[1]&&G.wave>=2&&Math.random()<.46)chosen=sec.forms[2];}
  return chosen;
}
function chooseSpawnEntry(){
  const prof=directorProfile(),spec=ch2WaveSpec(),flank=(G.wave>=2||G.sector>=2),allowed=flank?['right','top','bottom','leftTop','leftBottom','diagTop','diagBottom']:['right','top','bottom','diagTop','diagBottom'],weights=spec?weightedMerge(prof.entries,spec.entries):prof.entries;
  return weightedPick(weights,allowed)||'right';
}
function entryPlacement(mode,r){
  const p=G.player||{x:W*.2,y:H*.5};
  if(mode==='top')return {x:rnd(W*.28,W*.92),y:-r-28,tx:rnd(W*.42,W*.82),ty:rnd(H*.14,H*.28),t:rnd(.72,1.08)};
  if(mode==='bottom')return {x:rnd(W*.28,W*.92),y:H+r+28,tx:rnd(W*.42,W*.82),ty:rnd(H*.72,H*.86),t:rnd(.72,1.08)};
  if(mode==='leftTop')return {x:-r-34,y:rnd(58,H*.28),tx:rnd(W*.30,W*.48),ty:rnd(65,H*.34),t:rnd(.82,1.16)};
  if(mode==='leftBottom')return {x:-r-34,y:rnd(H*.72,H-58),tx:rnd(W*.30,W*.48),ty:rnd(H*.66,H-65),t:rnd(.82,1.16)};
  if(mode==='diagTop')return {x:W+r+40,y:rnd(42,H*.25),tx:rnd(W*.62,W*.82),ty:rnd(H*.30,H*.52),t:rnd(.65,.98)};
  if(mode==='diagBottom')return {x:W+r+40,y:rnd(H*.75,H-42),tx:rnd(W*.62,W*.82),ty:rnd(H*.48,H*.70),t:rnd(.65,.98)};
  return {x:W+r+rnd(36,130),y:rnd(62,H-62),tx:rnd(W*.76,W*.88),ty:rnd(68,H-68),t:rnd(.48,.78)};
}
function updateEnemyEntry(e,dt){
  if(!(e.entryT>0))return false;
  e.entryT-=dt;const dx=e.entryTX-e.x,dy=e.entryTY-e.y,d=Math.hypot(dx,dy)||1,spd=Math.max(250,e.spd*2.45);
  e.x+=dx/d*spd*dt;e.y+=dy/d*spd*dt;e.y=clamp(e.y,-90,H+90);
  if(d<18||e.entryT<=0)e.entryT=0;
  return true;
}
function spawnFormation(forcedType=null){
  if(G.boss||G.bossPending||G.mode==='training')return 0;
  const remaining=G.goal-G.kills;if(remaining<3)return 0;
  const spec=ch2WaveSpec(),allowed=G.wave>=3?['pincer','wedge','cross']:['pincer','wedge'],formationWeights=spec?.formation?weightedMerge(directorProfile().formations,{[spec.formation]:2.25}):directorProfile().formations,type=forcedType||(weightedPick(formationWeights,allowed)||pick(allowed));let n=0;
  if(type==='pincer'){spawnEnemy(null,null,null,'top');spawnEnemy(null,null,null,'bottom');spawnEnemy(null,null,null,'right');n=3;}
  else if(type==='cross'){spawnEnemy(null,null,null,'leftTop');spawnEnemy(null,null,null,'right');spawnEnemy(null,null,null,'leftBottom');n=3;}
  else{for(const mode of ['diagTop','right','diagBottom']){spawnEnemy(null,null,null,mode);n++;}}
  if(n)notify(type==='pincer'?'PINZA DEL ENJAMBRE':type==='cross'?'ATAQUE CRUZADO':'FORMACIÓN DE ASALTO','#ffc66f',1.1);
  return n;
}
function obstacleAssetIndex(sec,type){
  const pools={
    rust:{mine:[5],drone:[4,8,9],gate:[4,8,10],nest:[6,7],cocoon:[6,7],default:[0,1,2,3,8,9,10,11]},
    toxic:{mine:[8],drone:[4,7,10],gate:[4,7],nest:[3,8,10,11],cocoon:[3,8,10,11],acidpod:[0,1,2,5,6,9],spore:[0,2,5,6,9],seed:[1,6,9],default:[0,1,2,3,5,6,8,9,10,11]},
    rift:{mine:[6],drone:[3,6,7,10],gate:[2,6],nest:[7,11],cocoon:[7,11],default:[0,1,2,3,4,5,6,7,8,9,10,11]}
  };
  const pack=pools[sec.bg]||pools.rift,list=pack[type]||pack.default;return pick(list);
}
function worldObstacleAsset(sec,type){
  if(!sec.obstacleTheme)return null;
  const pack=IMG.worldObstacles[sec.obstacleTheme]||[];if(!pack.length)return null;
  const idx=Math.max(0,(sec.obstacles||[]).indexOf(type));return pack[idx%pack.length]||null;
}
function ambientWorldFx(sec,t){
  const key=sec.worldBg;if(!key)return;
  cx.save();
  if(key==='nocturne'){
    for(let i=0;i<42;i++){const st=stars[(i*7+13)%stars.length],x=(st.x+t*(10+st.z*9)+i*31)%(W+30)-15,y=(st.y+t*(4+st.z*3)+Math.sin(t*.7+i)*18)%H,r=1.2+st.z*2.5;cx.globalAlpha=.08+.25*st.z;cx.fillStyle=i%3===0?'#fff0a6':'#e6b6ff';cx.beginPath();cx.arc(x,y,r,0,TAU);cx.fill();}
    const haze=cx.createLinearGradient(0,0,W,H);haze.addColorStop(0,'rgba(110,54,160,.08)');haze.addColorStop(.6,'rgba(215,164,255,.03)');haze.addColorStop(1,'rgba(70,28,112,.12)');cx.fillStyle=haze;cx.fillRect(0,0,W,H);
  }else if(key==='iron'){
    for(let i=0;i<34;i++){const st=stars[(i*11+5)%stars.length],x=(st.x-t*(18+st.z*20)+W+40)%(W+40),y=(st.y+t*(8+st.z*4)+i*13)%H;cx.globalAlpha=.08+.28*st.z;cx.fillStyle=i%4===0?'#ffd0a5':'#ff6b49';cx.fillRect(x,y,1.4+st.z*2.2,1.4+st.z*2.2);}
    cx.globalAlpha=.12+.035*Math.sin(t*3.2);cx.fillStyle='#8c1e16';cx.fillRect(0,H*.72,W,H*.28);
  }else if(key==='emerald'){
    for(let i=0;i<44;i++){const st=stars[(i*5+19)%stars.length],x=(st.x-t*(5+st.z*8)+W+20)%(W+20),y=(st.y-t*(12+st.z*10)+H+30)%(H+30),r=1+st.z*2.8;cx.globalAlpha=.07+.24*st.z;cx.fillStyle=i%4===0?'#e8ff8b':'#8dffb0';cx.beginPath();cx.arc(x,y,r,0,TAU);cx.fill();}
    cx.globalAlpha=.08;cx.strokeStyle='#a7ff88';cx.lineWidth=2;for(let i=0;i<4;i++){const y=H*(.25+i*.16)+Math.sin(t*.6+i)*12;cx.beginPath();cx.moveTo(0,y);cx.bezierCurveTo(W*.3,y-20,W*.65,y+24,W,y-8);cx.stroke();}
  }else if(key==='bloodmist'){
    for(let i=0;i<36;i++){const st=stars[(i*9+7)%stars.length],x=(st.x-t*(8+st.z*9)+W+20)%(W+20),y=(st.y+Math.sin(t*1.7+i)*22+H)%H;cx.globalAlpha=.08+.2*st.z;cx.fillStyle=i%3===0?'#7ee8ff':'#ff405c';cx.beginPath();cx.arc(x,y,1+st.z*2.2,0,TAU);cx.fill();}
    cx.globalAlpha=.08+.025*Math.sin(t*2.2);cx.fillStyle='#8b0b21';cx.fillRect(0,H*.66,W,H*.34);
  }else if(key==='resin'){
    cx.globalAlpha=.08;cx.strokeStyle='#ffd56a';cx.lineWidth=2;for(let i=0;i<5;i++){const y=H*(.18+i*.16)+Math.sin(t*.65+i)*10;cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y+Math.sin(i)*18);cx.stroke();}
    for(let i=0;i<26;i++){const st=stars[(i*13+3)%stars.length];cx.globalAlpha=.08+.2*st.z;cx.fillStyle='#ffb323';cx.fillRect((st.x-t*12)%W,st.y,1.5+st.z*2,1.5+st.z*2);}
  }else if(key==='odonata'){
    for(let i=0;i<32;i++){const st=stars[(i*3+11)%stars.length],x=(st.x-t*(42+st.z*58)+W+40)%(W+40),y=(st.y+Math.sin(i+t*2)*12+H)%H;cx.globalAlpha=.1+.32*st.z;cx.strokeStyle=i%4===0?'#fff':'#79ecff';cx.lineWidth=1+st.z;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-18-st.z*24,y);cx.stroke();}
  }else if(key==='resonance'){
    cx.globalAlpha=.09+.025*Math.sin(t*3);cx.strokeStyle='#d9a7ff';cx.lineWidth=2;for(let i=0;i<4;i++){cx.beginPath();cx.ellipse(W*.5,H*.5,W*(.12+i*.1)+Math.sin(t*1.2+i)*10,H*(.08+i*.075),0,0,TAU);cx.stroke();}
  }
  cx.restore();cx.globalAlpha=1;
}
function powerAsset(key){if(key==='power'||key==='fragment')return IMG.generatedPowers.credit||IMG.generatedPowers.gravity||IMG.pickups.power;return IMG.generatedPowers[key]||IMG.pickups.power;}
function frontAsset(f){return IMG.front[f.kind]||IMG.front.meteor;}
function frontProfile(kind){return {
  meteor:{hp:1.0,dur:[2.35,3.05],end:86,reward:66,damage:29,col:'#ffb477',label:'METEORO FRONTAL'},
  rammer:{hp:.78,dur:[1.85,2.45],end:76,reward:104,damage:24,col:'#83e8ff',label:'ARIETE HOSTIL'},
  wreck:{hp:1.28,dur:[2.7,3.45],end:94,reward:92,damage:31,col:'#c7d7e1',label:'RESTO DE BATALLA'},
  pod:{hp:.92,dur:[2.15,2.85],end:80,reward:82,damage:26,col:'#ffae5d',label:'CÁPSULA DE REENTRADA'}
}[kind]||{hp:1,dur:[2.3,3],end:84,reward:65,damage:28,col:'#ffb477',label:'AMENAZA FRONTAL'};}
function frontPackForSector(sector){return sector<=1?'rust':sector<=2?'toxic':sector<=5?'rift':sector===6?'toxic':sector===8?'rust':'rift';}
function randomFrom(arr){return arr && arr.length?arr[(Math.random()*arr.length)|0]:null;}
function frontGeneratedAsset(kind,sector){
  const pack=frontPackForSector(sector),obs=IMG.generatedObstacles[pack]||[],ships=IMG.generatedShips||[];
  if(kind==='meteor')return randomFrom([obs[0],obs[1],obs[2],obs[6],obs[7],obs[8],obs[9]].filter(Boolean))||IMG.front.meteor;
  if(kind==='wreck')return randomFrom([obs[2],obs[3],obs[4],obs[10],obs[11],IMG.generatedObstacles.rift?.[2],IMG.generatedObstacles.rift?.[3],IMG.generatedObstacles.rift?.[10]].filter(Boolean))||IMG.front.wreck;
  if(kind==='pod')return randomFrom([ships[8],ships[9],ships[10],ships[11],obs[4],obs[5],obs[10],obs[11]].filter(Boolean))||IMG.front.pod;
  if(kind==='rammer')return randomFrom([ships[1],ships[2],ships[4],ships[6],ships[7],ships[11]].filter(Boolean))||IMG.front.rammer;
  return IMG.front[kind]||IMG.front.meteor;
}

function bossSecondarySkill(pattern){return {storm:'needleStorm',titan:'atlasRam',blade:'scissor',moth:'eclipse',queen:'ironTide',leap:'ricochet',blood:'bloodMist',architect:'hiveCollapse',odonata:'stormCross',resonance:'sonicCathedral'}[pattern]||null;}
function bossPrimarySkill(pattern){return {storm:'sting',titan:'armor',blade:'cross',moth:'pollen',queen:'brood',leap:'slam',blood:'bloodSting',architect:'resinFortify',odonata:'prismLance',resonance:'omegaPulse'}[pattern]||null;}
function bossVfx(b,col,count=7){for(let i=0;i<count;i++){const a=rnd(0,TAU),rr=rnd(b.r*.35,b.r*1.05);G.particles.push({kind:'spark',x:b.x+Math.cos(a)*rr,y:b.y+Math.sin(a)*rr,vx:Math.cos(a)*rnd(20,90),vy:Math.sin(a)*rnd(20,90),r:rnd(1.2,3.2),life:rnd(.16,.34),max:.34,col});}}
function bossPhaseBurst(b,sec){G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.55,vr:520,life:.72,max:.72,col:sec.accent});for(let i=0;i<18;i++){const a=i/18*TAU;G.particles.push({kind:'spark',x:b.x+Math.cos(a)*b.r*.55,y:b.y+Math.sin(a)*b.r*.55,vx:Math.cos(a)*rnd(120,260),vy:Math.sin(a)*rnd(120,260),r:rnd(1.5,4),life:rnd(.28,.55),max:.55,col:sec.accent});}}
function spawnFrontThreat(forceKind=null){
  if(G.boss||G.bossPending||G.postBossT>0)return;
  const sec=SECTORS[G.sector-1],prof=directorProfile(),allowed=['meteor','rammer','pod','wreck'],kind=forceKind||(weightedPick(prof.frontKinds,allowed)||pick(allowed)),pf=frontProfile(kind),p=G.player;
  const startX=rnd(W*.43,W*.80),startY=rnd(H*.2,H*.78),aim=Math.random()<(kind==='rammer'?.82:.62);
  const targetX=aim?clamp(p.x+rnd(-78,88),70,W*.68):rnd(W*.08,W*.76),targetY=aim?clamp(p.y+rnd(-62,62),68,H-58):rnd(72,H-68);
  const baseHp=(92+G.sector*34+G.wave*18)*pf.hp,dur=rnd(...pf.dur);
  const img=frontGeneratedAsset(kind,G.sector),angleOffset=(kind==='rammer'||kind==='pod')?-Math.PI/2:0;
  G.frontThreats.push({kind,startX,startY,targetX,targetY,x:startX,y:startY,t:0,duration:dur,r:8,hp:baseHp,maxHp:baseHp,dead:false,aim,reward:pf.reward,damage:pf.damage,rot:rnd(0,TAU),spin:kind==='rammer'?rnd(-.25,.25):rnd(-1.15,1.15),warnT:.72,col:pf.col,endR:pf.end,label:pf.label,img,angleOffset});
  AudioX.incoming(kind);notify(`${pf.label} · INTERCEPTA O ESQUIVA`,pf.col,1.25);
}
function killFrontThreat(f){if(f.dead)return;f.dead=true;G.frontKills=(G.frontKills||0)+1;G.waveFrontKills=(G.waveFrontKills||0)+1;const urgency=clamp(f.t/f.duration,0,1),bonus=1+Math.max(0,.65-urgency)*.8;G.score+=Math.round(f.reward*(G.sector+1)*bonus);grantCredits(Math.round((12+G.sector*3)*bonus*economyMult()),'front',true);grantRewardXp(Math.round((18+G.sector*4)*bonus),'front');burst(f.x,f.y,f.col||'#ffbd78',20,180);G.particles.push({kind:'shock',x:f.x,y:f.y,r:12,vr:360,life:.42,max:.42,col:f.col||'#fff'});if(Math.random()<.5)spawnPickup(f.x,f.y,'credit');if(Math.random()<.14)spawnPowerReward(f.x,f.y);}
function updateFrontThreats(dt){
  const p=G.player;for(const f of G.frontThreats){if(f.dead)continue;f.t+=dt;f.rot+=f.spin*dt;f.warnT=Math.max(0,(f.warnT||0)-dt);const u=clamp(f.t/f.duration,0,1),ease=Math.pow(u,1.62);f.x=lerp(f.startX,f.targetX,ease);f.y=lerp(f.startY,f.targetY,ease);f.r=lerp(8,f.endR||84,Math.pow(u,1.84));if(u>=1){if(Math.hypot(f.x-p.x,f.y-p.y)<f.r+p.r+14)hitPlayer((f.damage||28)+G.sector*1.8);f.dead=true;shake=Math.max(shake,8);}}
  G.frontThreats=G.frontThreats.filter(f=>!f.dead);
}
function drawFrontThreat(f){const img=f.img||frontAsset(f),u=clamp(f.t/f.duration,0,1),d=f.r*2.35,col=f.col||'#ffb477';cx.save();cx.translate(f.x,f.y);cx.rotate((f.kind==='rammer'?Math.atan2(f.targetY-f.startY,f.targetX-f.startX):f.rot)+(f.angleOffset||0));cx.globalAlpha=.5+.5*u;cx.shadowColor=col;cx.shadowBlur=6+u*20;if(imgReady(img)){const scale=Math.max(d/img.naturalWidth,d/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;cx.drawImage(img,-iw/2,-ih/2,iw,ih);}else{cx.fillStyle='#999';cx.beginPath();cx.arc(0,0,f.r,0,TAU);cx.fill();}cx.restore();
  if(u<.62){cx.save();cx.globalAlpha=.24+.34*Math.sin(G.elapsed*12);cx.strokeStyle=col;cx.lineWidth=2;const rr=18+u*32;cx.beginPath();cx.arc(f.targetX,f.targetY,rr,0,TAU);cx.stroke();cx.beginPath();cx.moveTo(f.targetX-rr-8,f.targetY);cx.lineTo(f.targetX-rr+5,f.targetY);cx.moveTo(f.targetX+rr-5,f.targetY);cx.lineTo(f.targetX+rr+8,f.targetY);cx.stroke();cx.restore();}
  if(u>.22){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(f.x-f.r*.72,f.y+f.r*.72,f.r*1.44,5);cx.fillStyle=col;cx.fillRect(f.x-f.r*.72,f.y+f.r*.72,f.r*1.44*clamp(f.hp/f.maxHp,0,1),5);}if(u>.7){cx.save();cx.globalAlpha=(u-.7)*2.5;cx.fillStyle=col;cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText('IMPACTO',f.x,f.y-f.r-12);cx.restore();}
}

function ionWebPulse(){
  const p=G.player,r=powerRank('ionweb'),combo=G.activeCombos[comboId('ionweb','tesla')]||G.activeCombos[comboId('gravity','ionweb')],radius=(135+r*24)*(branchIs('ionweb','A')?1.24:1),dmg=(12+r*5)*(combo?1.25:1),v=powerVisual('ionweb',r);G.particles.push({kind:'shock',x:p.x,y:p.y,r:12,vr:420+r*30,life:.48,max:.48,col:v.accent});
  for(const e of G.enemies){if(!e.dead&&dist(p,e)<radius){damageEntity(e,dmg,'tesla');e.slow=Math.max(e.slow||0,1.0+r*.16);}}
  if(G.boss&&!G.boss.dead&&dist(p,G.boss)<radius+G.boss.r)damageEntity(G.boss,dmg*.62,'tesla');
  let cleared=0;for(const b of G.eBullets){if(Math.hypot(b.x-p.x,b.y-p.y)<radius&&Math.random()<(combo?.82:.46+r*.05)){b.life=0;cleared++;}}if(cleared)AudioX.tone(520+r*30,.055,.018,'sine',0,-80);
}
function orbitBladePulse(){
  const p=G.player,r=powerRank('orbitblade'),combo=G.activeCombos[comboId('orbitblade','overdrive')]||G.activeCombos[comboId('orbitblade','resinwall')],radius=82+r*9,dmg=(20+r*7)*(branchIs('orbitblade','A')?1.18:1)*(combo?1.18:1),targets=[...G.enemies].filter(e=>!e.dead&&dist(p,e)<radius).sort((a,b)=>dist(p,a)-dist(p,b)).slice(0,Math.min(8,2+Math.ceil(r/2)+(branchIs('orbitblade','A')?1:0)));const v=powerVisual('orbitblade',r);
  for(const e of targets){damageEntity(e,dmg,'blade');const a=Math.atan2(e.y-p.y,e.x-p.x);G.particles.push({kind:'arc',x:p.x+Math.cos(a)*36,y:p.y+Math.sin(a)*36,x2:e.x,y2:e.y,life:.10,max:.10,col:v.accent});}
  if(G.boss&&!G.boss.dead&&dist(p,G.boss)<radius+G.boss.r)damageEntity(G.boss,dmg*.48,'blade');if(targets.length)AudioX.tone(330+r*18,.045,.016,'sawtooth',0,90);
}
function triggerBomb(rank=1){
  burst(G.player.x,G.player.y,'#ffb67a',34,220);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:14,vr:780,life:.6,max:.6,col:'#ffb67a'});shake=Math.max(shake,13);flash=Math.max(flash,.9);
  for(const e of G.enemies){if(e.dead)continue;const tier=enemyTier(e.form);const pct=tier===0?1:tier===1?.5+(rank-1)*.1:.3+(rank-1)*.08;damageEntity(e,Math.max(1,e.hp*pct),'bomb');}
  for(const o of G.obstacles){if(o.dead)continue;o.hp-=o.maxHp*.55;if(o.hp<=0)o.dead=true;}
  if(G.boss&&!G.boss.dead)damageEntity(G.boss,G.boss.maxHp*(.08+(rank-1)*.02),'bomb');
  AudioX.power('bomb');notify('✹ BOMBA DE RIFT · DETONACIÓN','#ffb67a',1.6);
}
function updateComboState(){if(!G)return;const prior=G.activeCombos||{},priorN=Object.keys(prior).length,now={};for(const id of Object.keys(COMBOS)){const [a,b]=id.split('+');if(comboOn(a,b)){now[id]=true;if(!prior[id]){const ml=recordComboMastery(id);notify(`${COMBOS[id].name} · COMBO${ml?` · M${comboMasteryLabel(id)}`:''}`,COMBOS[id].color,1.6);triggerMasteryIVPulse(id);}}}G.activeCombos=now;const n=Object.keys(now).length;if(n>=3&&n>priorN)escalateFusionSurge(n);}
function pumpPowerQueue(){while(G.powerQueue.length&&countActivePowers()<G.maxActivePowers){const next=G.powerQueue.shift();activatePower(next,'queue');}}

function completeFrenzy(){
  if(!G||G.frenzyDone)return;G.frenzyDone=true;
  const reward=Math.round((32+G.sector*13+G.wave*9)*economyMult()),xp=grantRewardXp(34+G.sector*11+G.wave*8,'frenzy');grantCredits(reward,'frenzy',true);G.score+=reward*8;
  for(let i=0;i<2;i++)spawnPickup(G.player.x+rnd(55,105),G.player.y+rnd(-48,48),'credit');if(G.player.shield<G.player.maxShield*.82||Math.random()<.62)spawnPickup(G.player.x+82,G.player.y+rnd(-38,38),'shield');if(G.player.hp<G.player.maxHp*.62&&Math.random()<.55)spawnPickup(G.player.x+66,G.player.y+34,'heal');if(Math.random()<.38)spawnPowerReward(G.player.x+110,G.player.y);
  AudioX.tone(920,.12,.05,'triangle',0,260);notify(`FRENESÍ DOMINADO · +¤${reward} · +${xp} XP`,'#ffe08b',2.1);
}
function awardWaveClear(){
  if(!G||G.mode==='training')return;const hits=G.waveHits||0,elapsed=Math.max(1,G.elapsed-(G.waveStartT||0));let grade='C',mult=1;
  if(hits===0&&G.frenzyDone){grade='S';mult=1.65;}else if(hits<=1){grade='A';mult=1.35;}else if(hits<=3){grade='B';mult=1.15;}
  if(G.waveObjective?.status==='failed'){const down={S:'A',A:'B',B:'C',C:'C'};grade=down[grade]||'C';mult*=.82;}
  const base=28+G.sector*10+G.wave*8,reward=Math.round(base*mult*economyMult()),xp=grantRewardXp((34+G.sector*10+G.wave*7)*mult,'wave_grade');
  grantCredits(reward,'wave_grade',true);G.score+=reward*6;G.waveMedals.push({sector:G.sector,wave:G.wave,grade,hits,time:elapsed,objective:G.waveObjective?.type||null,objectiveStatus:G.waveObjective?.status||'none'});
  const key=`${G.sector}-${G.wave}`,order={C:1,B:2,A:3,S:4};if(order[grade]>(order[META.bestWaveGrade[key]]||0))META.bestWaveGrade[key]=grade;
  if(grade==='S'){spawnPowerReward(G.player.x+90,G.player.y);spawnPickup(G.player.x+65,G.player.y-30,'shield');}
  else if(grade==='A')spawnPickup(G.player.x+70,G.player.y,'credit');
  notify(`ORDA ${G.wave} · RANGO ${grade} · +¤${reward}` ,grade==='S'?'#fff09a':grade==='A'?'#a6ff5f':'#9fe6ff',2.1);saveMeta();
}
function activateFrenzy(){
  if(G.frenzyWave===G.wave||G.boss||G.bossPending)return;
  if(G.sector===1&&G.wave<3)return;
  G.frenzyWave=G.wave;G.frenzyT=7+Math.min(5,G.sector*.65+G.wave*.55);G.frenzyMult=1.45+Math.min(.35,G.sector*.04);G.frenzyKills=0;G.frenzyTarget=5+G.wave+Math.ceil(G.sector*.75);G.frenzyDone=false;G.frenzySupportUsed=false;
  AudioX.tone(720,.15,.05,'sawtooth',0,260);AudioX.noise(.16,.035,1400,.04);for(let i=0;i<(compactUI()?2:4);i++)spawnAmbientProp(i%2?'ship':'wreck',i>1);if(G.player.shield/G.player.maxShield<.24&&G.pressureReliefWave!==G.wave)maybePressureRelief('frenzy');notify(`FRENESÍ · ${G.frenzyTarget} BAJAS · x${G.frenzyMult.toFixed(1)}`,'#ffcb63',2.2);shake=5;
}
function startBossWarning(b,skill,duration=1.05){
  if(b.telegraphT>0||b.specialT>0)return false;
  b.telegraph=skill;b.telegraphT=duration;bossAnimStartSignatureCue(b,{wind:duration,active:.78},skill);G.bossWarningT=duration;const def=BOSS_SKILLS[b.pattern];G.bossWarningText=skill===bossSecondarySkill(b.pattern)?(def?.alt||skill):(def?.warn||skill);AudioX.bossWarn(G.sector-1);bossVfx(b,def?.color||'#fff',10);return true;
}
function executeBossSpecial(b,p,sec){
  const skill=b.telegraph;b.telegraph='';b.telegraphT=0;b.specialT=.78;bossAnimReleaseCue(b,true);b.coreOpenT=Math.max(b.coreOpenT||0,1.05+b.phase*.20);AudioX.bossAttack(G.sector-1,true);bossVfx(b,BOSS_SKILLS[b.pattern]?.color||sec.accent,14);
  if(skill==='sting'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.chargeVX=Math.cos(a)*560;b.chargeVY=Math.sin(a)*560;b.chargeT=.52;commanderFan(b,b.x,b.y,a,5,.11,325,9,5,'sting');G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.1,life:.24,max:.24,col:'#fff08a'});
  }else if(skill==='needleStorm'){
    const base=Math.atan2(p.y-b.y,p.x-b.x);for(let fan=0;fan<3;fan++)commanderFan(b,b.x,b.y,base+fan*.12,9,.075,300+fan*32,8,4.5,'needle_storm');for(let i=0;i<2+b.phase;i++)spawnEnemy('hornet',b.x-25,b.y+rnd(-105,105));
  }else if(skill==='armor'){
    b.guardT=2.5;ringBullets(b.x,b.y,10+b.phase*2,175,8,sec.accent,b.t,b,'armor');spawnEnemy('scarab',b.x-30,b.y-65);if(b.phase>1)spawnEnemy('tank',b.x-30,b.y+65);G.particles.push({kind:'shieldwave',x:b.x,y:b.y,r:b.r*.9,vr:120,life:2.4,max:2.4,col:sec.accent});
  }else if(skill==='atlasRam'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.guardT=1.0;b.chargeVX=Math.cos(a)*480;b.chargeVY=Math.sin(a)*480;b.chargeT=.75;ringBullets(b.x,b.y,12,140,8,sec.accent,b.t,b,'atlas_ram');G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.6,vr:420,life:.55,max:.55,col:sec.accent});
  }else if(skill==='cross'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);commanderFan(b,b.x,b.y,a,7,.12,325,9,4,'cross');commanderFan(b,b.x,b.y,a+Math.PI/2,7,.09,250,8,4,'cross_alt');b.chargeVX=Math.cos(a)*450;b.chargeVY=Math.sin(a)*450;b.chargeT=.38;G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.6,life:.28,max:.28,col:'#ffae65'});G.particles.push({kind:'slash',x:b.x,y:b.y,a:a+Math.PI/2,len:b.r*2.3,life:.28,max:.28,col:'#ffd6b4'});
  }else if(skill==='scissor'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);for(let k=-1;k<=1;k++){const off=.32-k*.32;G.particles.push({kind:'slash',x:b.x,y:b.y,a:a+off,len:b.r*3.0,life:.38,max:.38,col:'#ff9a55'});commanderFan(b,b.x,b.y,a+off,5,.045,350,10,4,'scissor');}b.chargeVX=Math.cos(a)*390;b.chargeVY=Math.sin(a)*390;b.chargeT=.46;
  }else if(skill==='pollen'){
    for(let ring=0;ring<2+(b.phase>1?1:0);ring++)ringBullets(b.x,b.y,10+ring*4,135+ring*58,7,'#e9b7ff',b.t+ring*.22,b,'pollen');for(let i=0;i<2;i++)spawnEnemy(pick(['flutter','dust']),b.x-25,b.y+rnd(-100,100));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.75,vr:180,life:1.2,max:1.2,col:'#e9b7ff'});
  }else if(skill==='eclipse'){
    for(let ring=0;ring<4;ring++)ringBullets(b.x,b.y,12+ring*2,115+ring*46,7+ring*.5,'#d98cff',b.t+ring*.17,b,'eclipse');for(let i=0;i<3+b.phase;i++){const a=i/(3+b.phase)*TAU;G.particles.push({kind:'orb',x:b.x+Math.cos(a)*b.r*1.25,y:b.y+Math.sin(a)*b.r*1.25,r:8,life:1.8,max:1.8,col:'#e9b7ff'});} 
  }else if(skill==='brood'){
    const n=2+b.phase;for(let i=0;i<n;i++)spawnEnemy(pick(b.phase>1?['worker','soldier','acid']:['worker','soldier']),b.x-35,b.y+rnd(-120,120));commanderFan(b,b.x,b.y,Math.PI,5,.16,235,9,6,'brood');
  }else if(skill==='ironTide'){
    for(let row=-2;row<=2;row++){for(let k=0;k<3;k++){const fx=commanderProjectileFx(b,'iron_tide',true);spawnEnemyBullet(b.x-k*18,b.y+row*30,Math.PI+rnd(-.025,.025),255+row*5,9,5,'#ff746b',b,fx);}}for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['worker','soldier','acid']),b.x-35,b.y+rnd(-120,120));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.8,vr:350,life:.75,max:.75,col:'#ff746b'});
  }else if(skill==='slam'){
    const targetY=p.y;b.y=lerp(b.y,targetY,.72);b.x=W*.62;ringBullets(b.x,b.y,10+b.phase*3,230+b.phase*25,10,sec.accent,b.t,b,'slam');G.particles.push({kind:'shock',x:b.x,y:b.y,r:12,vr:620,life:.62,max:.62,col:sec.accent});shake=12;
  }else if(skill==='ricochet'){
    for(let hop=0;hop<3;hop++){const yy=hop%2?H*.25:H*.75;const a=Math.atan2(yy-b.y,W*.55-b.x);commanderFan(b,b.x,b.y,a,5,.11,300+hop*35,9,5,'ricochet');}b.chargeVX=-430;b.chargeVY=(p.y>b.y?1:-1)*300;b.chargeT=.58;G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.7,vr:500,life:.58,max:.58,col:sec.accent});
  }else if(skill==='bloodSting'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);b.chargeVX=Math.cos(a)*610;b.chargeVY=Math.sin(a)*610;b.chargeT=.48;commanderFan(b,b.x,b.y,a,5,.08,340,10,5,'blood_sting');G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*2.4,life:.26,max:.26,col:'#ff6175'});
  }else if(skill==='bloodMist'){
    for(let ring=0;ring<3;ring++)ringBullets(b.x,b.y,12+ring*4,120+ring*60,8+ring,'#ff4965',b.t+ring*.18,b,'blood_mist');for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['needler','hemodrone']),b.x-28,b.y+rnd(-120,120));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.6,vr:260,life:1.1,max:1.1,col:'#ff6175'});
  }else if(skill==='resinFortify'){
    b.guardT=2.1;for(let i=0;i<2+b.phase;i++)spawnObstacle();for(let i=0;i<2;i++)spawnEnemy('termite_worker',b.x-35,b.y+rnd(-90,90));G.particles.push({kind:'shieldwave',x:b.x,y:b.y,r:b.r*.85,vr:105,life:2.1,max:2.1,col:'#ffd56a'});
  }else if(skill==='hiveCollapse'){
    ringBullets(b.x,b.y,14+b.phase*3,175+b.phase*24,10,'#ffbf49',b.t,b,'hive_collapse');for(let i=0;i<3+b.phase;i++)spawnEnemy(pick(['termite_worker','mandible_guard']),b.x-30,b.y+rnd(-130,130));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.7,vr:430,life:.72,max:.72,col:'#ffd56a'});
  }else if(skill==='prismLance'){
    const a=Math.atan2(p.y-b.y,p.x-b.x);commanderFan(b,b.x,b.y,a,7,.07,390,10,4.2,'prism_lance');b.chargeVX=Math.cos(a)*560;b.chargeVY=Math.sin(a)*560;b.chargeT=.42;G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*3.0,life:.3,max:.3,col:'#78ecff'});
  }else if(skill==='stormCross'){
    const base=Math.atan2(p.y-b.y,p.x-b.x);for(const off of [0,Math.PI/2])commanderFan(b,b.x,b.y,base+off,9,.07,360,9,4,'storm_cross');for(let i=0;i<2+b.phase;i++)spawnEnemy('flashwing',b.x-20,b.y+rnd(-115,115));G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.65,vr:500,life:.5,max:.5,col:'#78ecff'});
  }else if(skill==='omegaPulse'){
    for(let ring=0;ring<3;ring++)ringBullets(b.x,b.y,14+ring*4,145+ring*55,9+ring,'#d9a7ff',b.t+ring*.2,b,'omega_pulse');G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.6,vr:560,life:.65,max:.65,col:'#d9a7ff'});
  }else if(skill==='sonicCathedral'){
    for(let ring=0;ring<5;ring++)ringBullets(b.x,b.y,12+ring*3,100+ring*52,8+ring*.7,ring%2?'#f4d37a':'#c18cff',b.t+ring*.15,b,'sonic_cathedral');for(let i=0;i<2+b.phase;i++)spawnEnemy(pick(['nymph_echo','sonic_cantor']),b.x-25,b.y+rnd(-120,120));G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.75,vr:300,life:1.3,max:1.3,col:'#d9a7ff'});
  }
}

// ─────────────────────────────────────────────────────────────
// INPUT — control directo por Pointer Events, sin joystick ni DASH
// ─────────────────────────────────────────────────────────────
const input={keys:new Set(),joyX:0,joyY:0,stickId:null,baseX:0,baseY:0,mouseSteer:false,mouseX:0,mouseY:0,touchId:null,touchSteer:false,touchStartedAt:0};
addEventListener('keydown',e=>{input.keys.add(e.key.toLowerCase());if(['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==='Escape'&&G?.screen==='GAME')pauseGame();});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));

function resetDirectTouch(reason='release'){if(input.touchId!==null||input.touchSteer){INPUT_ERGO.cancels++;INPUT_ERGO.lastCancel=reason;}input.touchId=null;input.touchSteer=false;if(isCoarse())input.mouseSteer=false;}
function resetStick(){input.joyX=input.joyY=0;input.stickId=null;resetDirectTouch('stick-reset');stickBase.style.display='none';stickKnob.style.transform='translate(0px,0px)';}
function moveStick(clientX,clientY){
  let dx=clientX-input.baseX,dy=clientY-input.baseY;const max=46,len=Math.hypot(dx,dy)||1;if(len>max){dx=dx/len*max;dy=dy/len*max;}
  input.joyX=clamp(dx/max,-1,1);input.joyY=clamp(dy/max,-1,1);stickKnob.style.transform=`translate(${dx}px,${dy}px)`;
}
stickZone.addEventListener('pointerdown',e=>{
  if(G?.screen!=='GAME')return;e.preventDefault();AudioX.unlock();input.stickId=e.pointerId;try{stickZone.setPointerCapture?.(e.pointerId);}catch(_){}
  const r=stickZone.getBoundingClientRect();input.baseX=e.clientX;input.baseY=e.clientY;
  stickBase.style.left=clamp(e.clientX-r.left-58,8,r.width-124)+'px';stickBase.style.top=clamp(e.clientY-r.top-58,8,r.height-124)+'px';stickBase.style.display='block';moveStick(e.clientX,e.clientY);
},{passive:false});
stickZone.addEventListener('pointermove',e=>{if(e.pointerId===input.stickId){e.preventDefault();moveStick(e.clientX,e.clientY);}},{passive:false});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stickZone.addEventListener(ev,e=>{if(e.pointerId===input.stickId)resetStick();},{passive:false}));

cv.addEventListener('pointerdown',e=>{
  AudioX.unlock();
  if(G?.screen==='GAME'){
    if(e.pointerType==='mouse'){
      input.mouseSteer=true;input.mouseX=e.clientX;input.mouseY=e.clientY;e.preventDefault();return;
    }
    // Un único dedo gobierna la nave. Un segundo contacto nunca reemplaza el puntero activo.
    if(input.touchId!==null&&e.pointerId!==input.touchId){INPUT_ERGO.ignoredSecondary++;e.preventDefault();return;}
    if(touchStartExcluded(e.clientX,e.clientY)){INPUT_ERGO.excludedStarts++;e.preventDefault();return;}
    const p=sanitizeTouchPoint(e.clientX,e.clientY);input.touchId=e.pointerId;input.touchSteer=true;input.mouseSteer=true;input.mouseX=p.x;input.mouseY=p.y;input.touchStartedAt=performance.now();
    try{cv.setPointerCapture?.(e.pointerId);}catch(_){ }
    e.preventDefault();
    return;
  }
  handleTap(e.clientX,e.clientY);
},{passive:false});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'){
    input.mouseX=e.clientX;input.mouseY=e.clientY;input.mouseSteer=G?.screen==='GAME';
  }else if(e.pointerId===input.touchId && G?.screen==='GAME'){
    let pt=e;try{const batch=e.getCoalescedEvents?.();if(batch?.length){pt=batch[batch.length-1];if(batch.length>1)INPUT_ERGO.coalescedMoves+=batch.length-1;}}catch(_){}
    const p=sanitizeTouchPoint(pt.clientX,pt.clientY);input.mouseX=p.x;input.mouseY=p.y;input.mouseSteer=true;input.touchSteer=true;e.preventDefault();
  }
},{passive:false});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>cv.addEventListener(ev,e=>{
  if(e.pointerType==='mouse'){input.mouseSteer=false;return;}
  if(e.pointerId===input.touchId)resetDirectTouch(ev);
},{passive:true}));
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')input.mouseSteer=false;},{passive:true});

allyBtn.addEventListener('click',()=>summonRiftAlly());
shopBtn.addEventListener('click',()=>{if(G?.screen==='GAME'&&G.lastChanceT>0){if(supplyStock('life')>0){rescueLastChance();return;}storeTab='support';storePage=0;openStore('GAME');notify('🛒 RESCATE · COMPRA VIDA EXTRA MANUALMENTE','#ffcfda',2.0);return;}openStore('GAME');});
pauseBtn.addEventListener('click',pauseGame);
musicBtn.addEventListener('click',()=>{AudioX.unlock();MusicX.toggle();});
audioBtn.addEventListener('click',()=>AudioX.toggle());
fullBtn.addEventListener('click',tryFullscreen);

function axes(){
  let x=input.joyX,y=input.joyY;
  if(input.keys.has('a')||input.keys.has('arrowleft'))x-=1;if(input.keys.has('d')||input.keys.has('arrowright'))x+=1;
  if(input.keys.has('w')||input.keys.has('arrowup'))y-=1;if(input.keys.has('s')||input.keys.has('arrowdown'))y+=1;
  if(input.mouseSteer&&G?.player){const dx=input.mouseX-G.player.x,dy=input.mouseY-G.player.y,d=Math.hypot(dx,dy),dead=input.touchSteer?13:18;if(d>dead){x+=dx/Math.max(input.touchSteer?62:70,d);y+=dy/Math.max(input.touchSteer?62:70,d);}}
  const m=Math.hypot(x,y);if(m>1){x/=m;y/=m;}return{x,y};
}
function pauseGame(){if(G?.screen!=='GAME')return;MusicX.pauseForUI();G.screen='PAUSE';setScreen('PAUSE');AudioX.pause();if(G.mode!=='chase')saveRun();}
function resumeGame(){if(G){setScreen('GAME');lastT=performance.now();AudioX.unlock();MusicX.resumeFromUI();}}
function openStore(from){if(!G)return;shopReturn=from||G.screen;if(G.screen==='GAME'){saveRun();MusicX.pauseForUI();}else if(G.screen==='PAUSE')MusicX.pauseForUI();setScreen('STORE');AudioX.pause();}
function closeStore(){if(shopReturn==='GAME')resumeGame();else setScreen(shopReturn||'MENU');}

// ─────────────────────────────────────────────────────────────
// SAVE / LOAD — checkpoint consistente, no serializa basura efímera
// ─────────────────────────────────────────────────────────────
function saveRun(){
  if(!G?.player||['MENU','DEAD'].includes(G.screen)||G.mode==='bossRush')return false;
  const p=G.player;const payload={version:VERSION,mode:G.mode||'campaign',runDifficulty:G.runDifficulty||'normal',sector:G.sector,wave:G.wave,score:G.score,credits:G.credits,hp:p.hp,shield:p.shield,powers:G.powers,queue:G.powerQueue||[],overflowPowerKey:G.overflowPowerKey||null,overflowPowerMax:G.overflowPowerMax||0,apexCharge:G.apexCharge||0,apexT:G.apexT||0,apexMax:G.apexMax||0,xp:G.xp||0,level:G.level||1,xpNext:G.xpNext||120,heritageNext:G.heritageNext||null,bossCheckpoint:!!G.bossCheckpoint,bossCheckpointKind:G.bossCheckpointKind||'',powerRanks:G.powerRanks,powerDropsThisSector:G.powerDropsThisSector||0,comboSeen:G.comboSeenThisRun||{},powerDropHistory:G.powerDropHistory||[],waveHits:G.waveHits||0,waveFrontKills:G.waveFrontKills||0,waveStartT:G.waveStartT||0,waveMedals:G.waveMedals||[],bonusCredits:G.bonusCredits||0,resinCharges:G.resinCharges||0,bossRushIndex:G.bossRushIndex||0,bossRushScore:G.bossRushScore||0,bossRushChapter:G.bossRushChapter||0,bossRushStartSector:G.bossRushStartSector||0,bossRushEndSector:G.bossRushEndSector||0,objectiveHistory:G.objectiveHistory||[],objectivePlannedType:G.waveObjective?.type||null,riftAllyUsed:!!G.riftAllyUsed,ts:Date.now()};
  try{localStorage.setItem(KEY_RUN,JSON.stringify(payload));}catch(_){return false;}saveMeta();notify('CHECKPOINT GUARDADO','#79c9ff',1.8);return true;
}
function hasSave(){try{return !!localStorage.getItem(KEY_RUN)||!!localStorage.getItem('swarm_rift_run_v21518')||!!localStorage.getItem('swarm_rift_run_v21517')||!!localStorage.getItem('swarm_rift_run_v21516')||!!localStorage.getItem('swarm_rift_run_v21515')||!!localStorage.getItem('swarm_rift_run_v21514')||!!localStorage.getItem('swarm_rift_run_v21513')||!!localStorage.getItem('swarm_rift_run_v21512')||!!localStorage.getItem('swarm_rift_run_v21511')||!!localStorage.getItem('swarm_rift_run_v21510')||!!localStorage.getItem('swarm_rift_run_v2159')||!!localStorage.getItem('swarm_rift_run_v2158')||!!localStorage.getItem('swarm_rift_run_v2157')||!!localStorage.getItem('swarm_rift_run_v2156')||!!localStorage.getItem('swarm_rift_run_v2155')||!!localStorage.getItem('swarm_rift_run_v2154')||!!localStorage.getItem('swarm_rift_run_v2153')||!!localStorage.getItem('swarm_rift_run_v2152')||!!localStorage.getItem('swarm_rift_run_v2151')||!!localStorage.getItem('swarm_rift_run_v2150')||!!localStorage.getItem('swarm_rift_run_v2145')||!!localStorage.getItem('swarm_rift_run_v2144')||!!localStorage.getItem('swarm_rift_run_v2143')||!!localStorage.getItem('swarm_rift_run_v2142')||!!localStorage.getItem('swarm_rift_run_v2141')||!!localStorage.getItem('swarm_rift_run_v2140')||!!localStorage.getItem('swarm_rift_run_v2137')||!!localStorage.getItem('swarm_rift_run_v2136')||!!localStorage.getItem('swarm_rift_run_v2135')||!!localStorage.getItem('swarm_rift_run_v2134')||!!localStorage.getItem('swarm_rift_run_v2133')||!!localStorage.getItem('swarm_rift_run_v2132')||!!localStorage.getItem('swarm_rift_run_v2131')||!!localStorage.getItem('swarm_rift_run_v2130')||!!localStorage.getItem('swarm_rift_run_v21241')||!!localStorage.getItem('swarm_rift_run_v2124')||!!localStorage.getItem('swarm_rift_run_v2123')||!!localStorage.getItem('swarm_rift_run_v2122')||!!localStorage.getItem('swarm_rift_run_v21216')||!!localStorage.getItem('swarm_rift_run_v21215')||!!localStorage.getItem('swarm_rift_run_v21214')||!!localStorage.getItem('swarm_rift_run_v21213')||!!localStorage.getItem('swarm_rift_run_v21212')||!!localStorage.getItem('swarm_rift_run_v21211')||!!localStorage.getItem('swarm_rift_run_v2121')||!!localStorage.getItem('swarm_rift_run_v2120')||!!localStorage.getItem('swarm_rift_run_v2119')||!!localStorage.getItem('swarm_rift_run_v2118')||!!localStorage.getItem('swarm_rift_run_v2117')||!!localStorage.getItem('swarm_rift_run_v2116')||!!localStorage.getItem('swarm_rift_run_v2115')||!!localStorage.getItem('swarm_rift_run_v2114')||!!localStorage.getItem('swarm_rift_run_v2113')||!!localStorage.getItem('swarm_rift_run_v2112')||!!localStorage.getItem('swarm_rift_run_v2111')||!!localStorage.getItem('swarm_rift_run_v2110')||!!localStorage.getItem('swarm_rift_run_v2100')||!!localStorage.getItem('swarm_rift_run_v290')||!!localStorage.getItem('swarm_rift_run_v280')||!!localStorage.getItem('swarm_rift_run_v271')||!!localStorage.getItem('swarm_rift_run_v270')||!!localStorage.getItem('swarm_rift_run_v260')||!!localStorage.getItem('swarm_rift_run_v251')||!!localStorage.getItem('swarm_rift_run_v250')||!!localStorage.getItem('swarm_rift_run_v240')||!!localStorage.getItem('swarm_rift_run_v230')||!!localStorage.getItem('swarm_rift_run_v220')||!!localStorage.getItem('swarm_rift_run_v210')||!!localStorage.getItem('swarm_rift_run_v200')||!!localStorage.getItem('swarm_rift_run_v199')||!!localStorage.getItem('swarm_rift_run_v198')||!!localStorage.getItem('swarm_rift_run_v197')||!!localStorage.getItem('swarm_rift_run_v196')||!!localStorage.getItem('swarm_rift_run_v195')||!!localStorage.getItem('swarm_rift_run_v194')||!!localStorage.getItem('swarm_rift_run_v17');}catch(_){return false;}}
function loadRun(){
  const s=loadJSON(KEY_RUN,null)||loadJSON('swarm_rift_run_v21518',null)||loadJSON('swarm_rift_run_v21517',null)||loadJSON('swarm_rift_run_v21516',null)||loadJSON('swarm_rift_run_v21515',null)||loadJSON('swarm_rift_run_v21514',null)||loadJSON('swarm_rift_run_v21513',null)||loadJSON('swarm_rift_run_v21512',null)||loadJSON('swarm_rift_run_v21511',null)||loadJSON('swarm_rift_run_v21510',null)||loadJSON('swarm_rift_run_v2159',null)||loadJSON('swarm_rift_run_v2158',null)||loadJSON('swarm_rift_run_v2157',null)||loadJSON('swarm_rift_run_v2156',null)||loadJSON('swarm_rift_run_v2155',null)||loadJSON('swarm_rift_run_v2154',null)||loadJSON('swarm_rift_run_v2153',null)||loadJSON('swarm_rift_run_v2152',null)||loadJSON('swarm_rift_run_v2151',null)||loadJSON('swarm_rift_run_v2150',null)||loadJSON('swarm_rift_run_v2145',null)||loadJSON('swarm_rift_run_v2144',null)||loadJSON('swarm_rift_run_v2143',null)||loadJSON('swarm_rift_run_v2142',null)||loadJSON('swarm_rift_run_v2141',null)||loadJSON('swarm_rift_run_v2140',null)||loadJSON('swarm_rift_run_v2137',null)||loadJSON('swarm_rift_run_v2136',null)||loadJSON('swarm_rift_run_v2135',null)||loadJSON('swarm_rift_run_v2134',null)||loadJSON('swarm_rift_run_v2133',null)||loadJSON('swarm_rift_run_v2132',null)||loadJSON('swarm_rift_run_v2131',null)||loadJSON('swarm_rift_run_v2130',null)||loadJSON('swarm_rift_run_v21241',null)||loadJSON('swarm_rift_run_v2124',null)||loadJSON('swarm_rift_run_v2123',null)||loadJSON('swarm_rift_run_v2122',null)||loadJSON('swarm_rift_run_v21216',null)||loadJSON('swarm_rift_run_v21215',null)||loadJSON('swarm_rift_run_v21214',null)||loadJSON('swarm_rift_run_v21213',null)||loadJSON('swarm_rift_run_v21212',null)||loadJSON('swarm_rift_run_v21211',null)||loadJSON('swarm_rift_run_v2121',null)||loadJSON('swarm_rift_run_v2120',null)||loadJSON('swarm_rift_run_v2119',null)||loadJSON('swarm_rift_run_v2118',null)||loadJSON('swarm_rift_run_v2117',null)||loadJSON('swarm_rift_run_v2116',null)||loadJSON('swarm_rift_run_v2115',null)||loadJSON('swarm_rift_run_v2114',null)||loadJSON('swarm_rift_run_v2113',null)||loadJSON('swarm_rift_run_v2112',null)||loadJSON('swarm_rift_run_v2111',null)||loadJSON('swarm_rift_run_v2110',null)||loadJSON('swarm_rift_run_v2100',null)||loadJSON('swarm_rift_run_v290',null)||loadJSON('swarm_rift_run_v280',null)||loadJSON('swarm_rift_run_v271',null)||loadJSON('swarm_rift_run_v270',null)||loadJSON('swarm_rift_run_v260',null)||loadJSON('swarm_rift_run_v251',null)||loadJSON('swarm_rift_run_v250',null)||loadJSON('swarm_rift_run_v240',null)||loadJSON('swarm_rift_run_v230',null)||loadJSON('swarm_rift_run_v220',null)||loadJSON('swarm_rift_run_v210',null)||loadJSON('swarm_rift_run_v200',null)||loadJSON('swarm_rift_run_v199',null)||loadJSON('swarm_rift_run_v198',null)||loadJSON('swarm_rift_run_v197',null)||loadJSON('swarm_rift_run_v196',null)||loadJSON('swarm_rift_run_v195',null)||loadJSON('swarm_rift_run_v194',null)||loadJSON('swarm_rift_run_v17',null);if(!s||!s.sector)return false;
  G={screen:'GAME',mode:s.mode||'campaign',runDifficulty:s.runDifficulty||META.selectedDifficulty||'normal',sector:clamp(s.sector,1,activeSectorCount()),wave:clamp(s.wave||1,1,3),score:s.score||0,hiScore:META.hiScore||0,credits:Math.max(META.credits||0,s.credits||0),
    player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],powerMines:[],boss:null,kills:0,goal:waveGoal(s.sector,s.wave||1),spawn:.5,obstacleTimer:2,
    powerMeter:0,powerDropsThisSector:s.powerDropsThisSector||0,powers:s.powers||{},powerQueue:s.queue||[],overflowPowerKey:s.overflowPowerKey||null,overflowPowerMax:s.overflowPowerMax||0,sectorClear:false,bossPending:false,waveBanner:2.4,sectorBanner:2.8,combo:0,comboT:0,lastPowerDrop:0,elapsed:0,xp:s.xp||0,level:s.level||1,xpNext:s.xpNext||120,maxActivePowers:activePowerSlotLimit(),maxQueuePowers:queuedPowerSlotLimit(),heritageNext:s.heritageNext||null,activeCombos:{},comboSeenThisRun:s.comboSeen||{},powerDropHistory:s.powerDropHistory||[],fusionSurgeT:0,fusionSurgeCd:0,fusionSurgeTier:0,apexCharge:s.apexCharge||0,apexT:s.apexT||0,apexMax:s.apexMax||0,apexPulseT:0,masteryIVSeen:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,bossWarningT:0,bossWarningText:'',bossCheckpoint:!!s.bossCheckpoint,bossCheckpointKind:s.bossCheckpointKind||'',lostAtBoss:false,trainingBoss:false,preBossT:0,preBossMax:0,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0,waveFrontKills:s.waveFrontKills||0,waveHits:s.waveHits||0,waveStartT:s.waveStartT||0,waveMedals:s.waveMedals||[],powerRanks:s.powerRanks||{},frenzyKills:0,frenzyTarget:0,frenzyDone:false,bossHits:0,bossMasteryAchieved:false,bonusCredits:s.bonusCredits||0,resinCharges:s.resinCharges||0,rewardLedger:{credits:{},xp:{}},pendingBossReward:null,bossRewardView:null,bossRushIndex:s.bossRushIndex||0,bossRushScore:s.bossRushScore||0,bossRushChapter:s.bossRushChapter||0,bossRushStartSector:s.bossRushStartSector||0,bossRushEndSector:s.bossRushEndSector||0,bossRushComplete:false,campaignComplete:false,chapterComplete:false,completedChapterId:0,finalReward:0,lastRelic:0,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0,directorIndex:0,directorCooldown:2.5,directorHistory:[],directorPressureT:0,directorPressure:1,directorPhase:'RECONOCIMIENTO',transversalTimer:rnd(7.5,11.5),lieutenantSpawned:false,lieutenantKilled:false,preBossSetpieces:[],preBossCueStage:0,worldAmbientStarted:false,ambientProps:[],ambientPropTimer:rnd(1.0,2.0),worldEventTimer:rnd(15,22),worldEventHistory:[],worldEventCount:0,pressureReliefWave:0,shieldCriticalWarned:false,shieldHitT:0,bossArrivalStage:0,bossArrivalBanner:null,waveObjective:null,objectiveHistory:s.objectiveHistory||[],objectiveTargets:[],objectiveCapsule:null,emergencyHealthDrops:{half:false,quarter:false,critical:false},lieutenantQueue:[],lieutenantExpected:0,lieutenantKills:0,preBossEscalationActive:false,preBossEscalationId:'',commanderReinforceT:0,commanderSupportT:0,commanderSupportBudget:0,weaponBoostT:0,weaponBoostMult:1,weaponBoostStacks:0,microSwarmTimer:rnd(2.8,5.0),microKills:0,microSwarmBursts:0,microStreak:0,microStreakT:0,actionGapT:0,familyCalls:0,familyBossResponses:0,bossFamilySwarmTimer:0,familyPlayTimer:rnd(6.8,10.5),familyPlay:null,familyPlaySerial:0,familyPlayCount:0,familyPlayBreaks:0,behaviorSampleT:0,behaviorZoneT:{upper:0,center:0,lower:0},behaviorLastZone:'center',behaviorSwitches:0,behaviorRead:'UNREAD',behaviorConfidence:0,behaviorCounterPlays:0,recoveryGraceT:0,riftAlly:null,riftAllyUsed:!!s.riftAllyUsed,lastChanceT:0,lastChanceMax:5,lastChanceRescued:false};
  hiveResetRuntimeForRun();resetCombatDirector();prepareWaveObjective(s.objectivePlannedType||null);G.player.hp=clamp(s.hp||G.player.maxHp*.75,1,G.player.maxHp);G.player.shield=clamp(s.shield||0,0,G.player.maxShield);
  setScreen('GAME');tryFullscreen();AudioX.unlock();PreBossX.prime(G.sector);MusicX.primeBoss(G.sector);if(G.mode!=='bossRush'&&G.mode!=='training'){PreBossX.start(G.sector);G.worldAmbientStarted=true;}MusicX.reconcile(true);notify('CHECKPOINT CARGADO · OLEADA REINICIADA','#8edbff',2.5);return true;
}

// ─────────────────────────────────────────────────────────────
// v2.15.0 · MICRO-SWARM DIRECTOR + RIFT ALLY + ÚLTIMA OPORTUNIDAD
// ─────────────────────────────────────────────────────────────
function microSwarmBuzz(){if(AudioX.muted||!AudioX.ac)return;const now=AudioX.ac.currentTime,o=AudioX.ac.createOscillator(),g=AudioX.ac.createGain();o.type='triangle';o.frequency.setValueAtTime(118+Math.random()*28,now);o.frequency.exponentialRampToValueAtTime(154+Math.random()*32,now+.16);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.0065,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+.19);o.connect(g);g.connect(AudioX.ac.destination);o.start(now);o.stop(now+.21);}
function meaningfulThreatCount(){if(!G)return 0;return G.enemies.filter(e=>!e.dead&&!e.microSwarm).length+(G.frontThreats?.length||0)+(G.boss&&!G.boss.dead?3:0);}
function microFormationOffset(formation,i,n){
  if(formation==='line')return [i*22,(i%2?1:-1)*7];
  if(formation==='block')return [(i%3)*24,(Math.floor(i/3)-(Math.ceil(n/3)-1)/2)*22];
  if(formation==='wedge'){const row=Math.floor(Math.sqrt(i+1));return [row*24,(i-row*row-row/2)*24];}
  if(formation==='ribbon')return [i*18,Math.sin(i*.9)*34];
  if(formation==='double')return [Math.floor(i/2)*22,(i%2?1:-1)*26];
  if(formation==='arc'){const a=-.9+(n<=1?0:i/(n-1))*1.8;return [(1-Math.cos(a))*54,Math.sin(a)*66];}
  if(formation==='cross'){const arm=i%4,step=Math.floor(i/4)+1;return [arm===0?step*22:arm===1?step*22:arm===2?step*12:step*12,arm===0?-step*21:arm===1?step*21:arm===2?-step*34:step*34];}
  return [rnd(0,90),rnd(-62,62)];
}
function spawnMicroSwarm(forceBurst=false){
  if(!G||G.mode==='training'||G.mode==='bossRush'||G.boss||G.sectorClear)return 0;const sec=SECTORS[G.sector-1],quiet=meaningfulThreatCount()<=1||((G.actionGapT||0)>1.25),baseMin=forceBurst||quiet?6:4,baseMax=forceBurst?10:quiet?9:8,perfMax=Math.max(4,Math.round(baseMax*performanceMicroFactor())),n=rndI(Math.min(baseMin,perfMax),perfMax),formation=pick(['line','block','wedge','ribbon','scatter','double','arc','cross']),baseY=rnd(H*.18,H*.82),baseX=W+rnd(45,120),tempo=sectorTempo();
  for(let i=0;i<n;i++){const [ox,oy]=microFormationOffset(formation,i,n),world=G.sector,form=world>=11?`ch2_${world}_minor`:sec.forms[0],r=clamp(7.2+world*.16,7.5,11.5),hp=clamp(4.8+world*.62+G.wave*.9,5,19),move=formation==='ribbon'||formation==='arc'?'wave':formation==='wedge'||formation==='cross'?'zig':formation==='double'?'dart':'direct',e={x:baseX+ox,y:clamp(baseY+oy,42,H-42),ox:baseY,r,hp,maxHp:hp,spd:(142+world*3.0)*tempo.speed*rnd(.94,1.08),score:9+world*2,form,family:sec.family,kind:'insect',microSwarm:true,microFormation:formation,microIndex:i,microCount:n,col:sec.accent,move,fireCd:999,fireRate:999,specialCd:999,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:Math.max(1,1.8+world*.09),entryT:0};G.enemies.push(e);}
  G.microSwarmBursts=(G.microSwarmBursts||0)+1;G.actionGapT=0;microSwarmBuzz();return n;
}
function updateMicroSwarmDirector(dt){if(!G||G.boss||G.bossPending||G.sectorClear||G.mode==='training'||G.mode==='bossRush')return;const meaningful=meaningfulThreatCount();G.actionGapT=meaningful<=1?(G.actionGapT||0)+dt:Math.max(0,(G.actionGapT||0)-dt*1.8);G.microSwarmTimer=(G.microSwarmTimer??rnd(2.8,5.2))-dt;const main=G.enemies.filter(e=>!e.dead&&!e.microSwarm&&e.kind!=='transversal'&&e.kind!=='lieutenant').length,microAlive=G.enemies.filter(e=>!e.dead&&e.microSwarm).length,adaptive=adaptivePressure(),cap=Math.max(8,Math.round((compactUI()?16:22)*(G.sector>=11?1.08:1)*(runDifficultyKey()==='hard'?1.08:1)*performanceMicroFactor())),forced=(G.actionGapT||0)>1.65&&microAlive<Math.min(10,cap);if(!forced&&G.microSwarmTimer>0)return;const gap=main<=Math.max(2,Math.floor(2+G.wave*.7));if(microAlive<cap&&(forced||gap||Math.random()<.34))spawnMicroSwarm(forced);const waveSpec=ch2WaveSpec(),base=rnd(4.6,7.9)*sectorTempo().microCadence*(waveSpec?.micro||1)*(runDifficultyKey()==='hard'?.94:1)*adaptive.cadence;G.microSwarmTimer=forced?Math.max(3.1,base*.72):base;}

// ─────────────────────────────────────────────────────────────
// v2.15.2 · FAMILY COMBAT GRAMMAR
// Menores escoltan, medios abren corredores y mayores coordinan la familia.
// Los refuerzos micro son ambientales/tácticos y nunca cuentan como bajas de oleada.
// ─────────────────────────────────────────────────────────────
function combatTier(e){
  if(!e||e.microSwarm)return -1;
  if(/^ch2_\d+_major$/.test(e.form||''))return 2;
  if(/^ch2_\d+_medium$/.test(e.form||''))return 1;
  if(/^ch2_\d+_minor$/.test(e.form||''))return 0;
  return enemyTier(e.form);
}
function familyMainEnemies(family){
  return (G?.enemies||[]).filter(q=>!q.dead&&!q.microSwarm&&q.kind==='insect'&&q.family===family);
}
function familyNearestLeader(e){
  let best=null,bd=Infinity;
  for(const q of familyMainEnemies(e.family)){
    if(q===e||combatTier(q)!==2)continue;
    const d=dist(e,q);if(d<bd){bd=d;best=q;}
  }
  return best;
}
function familyNearestUnit(e,maxTier=2){
  let best=null,bd=Infinity;
  for(const q of familyMainEnemies(e.family)){
    if(q===e||combatTier(q)>maxTier)continue;
    const d=dist(e,q);if(d<bd){bd=d;best=q;}
  }
  return best;
}
function familyEscortOffsets(form,i,n){
  if(form==='arc'||form==='orbit'){const a=-1.05+(n<=1?0:i/(n-1))*2.1;return [Math.cos(a)*64,Math.sin(a)*74];}
  if(form==='wedge')return [Math.floor(i/2)*22,(i%2?1:-1)*(24+Math.floor(i/2)*12)];
  if(form==='block')return [(i%2)*26,(Math.floor(i/2)-(n-1)/4)*26];
  if(form==='ribbon')return [i*18,Math.sin(i*1.15)*42];
  if(form==='double')return [Math.floor(i/2)*22,(i%2?1:-1)*34];
  if(form==='cross'){const a=(i%4)*Math.PI/2,step=24+Math.floor(i/4)*18;return [Math.cos(a)*step,Math.sin(a)*step];}
  return [i*18,(i%2?1:-1)*26];
}
function spawnFamilyMicroEscort(source,count=4,formation='arc',bossReactive=false){
  if(!G||G.sector<11||!source)return 0;
  const sec=SECTORS[G.sector-1],tempo=sectorTempo(),cap=compactUI()?16:24;
  const microAlive=G.enemies.filter(q=>!q.dead&&q.microSwarm).length;
  const n=Math.max(0,Math.min(count,cap-microAlive));
  if(!n)return 0;
  for(let i=0;i<n;i++){
    const [ox,oy]=familyEscortOffsets(formation,i,n),world=G.sector;
    const hp=clamp(5.5+world*.48+(bossReactive?2:0),6,18);
    G.enemies.push({
      x:source.x+ox,y:clamp(source.y+oy,42,H-42),ox:source.y,
      r:clamp(8+world*.12,8,11),hp,maxHp:hp,spd:(150+world*2.6)*tempo.speed,
      score:10+world*2,form:`ch2_${world}_minor`,family:sec.family,kind:'insect',
      microSwarm:true,microFormation:formation,microIndex:i,microCount:n,
      familySummoned:true,bossReactive:!!bossReactive,col:sec.accent,
      move:bossReactive?'orbit':(formation==='ribbon'?'wave':formation==='cross'?'zig':'direct'),
      fireCd:999,fireRate:999,specialCd:999,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,
      slow:0,flash:0,contact:Math.max(1,2+world*.07),entryT:0
    });
  }
  G.familyCalls=(G.familyCalls||0)+1;
  microSwarmBuzz();
  return n;
}
function familyMajorCall(e,g){
  if(!e||!g||e.dead)return;
  const sec=SECTORS[G.sector-1],p=G.player,col=sec.accent;
  const count=G.sector>=18?5:G.sector>=14?4:3;
  spawnFamilyMicroEscort(e,count,g.formation,false);
  e.familyPulseT=.75;e.animAttackT=Math.max(e.animAttackT||0,.32);
  const a=Math.atan2(p.y-e.y,p.x-e.x);
  if(g.major==='gravity'){
    ringBullets(e.x,e.y,7,145+G.sector*2,5.2,col,e.t,e);
  }else if(g.major==='venom'){
    for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.095,315,5.5,4,col,e);
  }else if(g.major==='brace'){
    e.familyGuardT=1.75;
    for(const q of familyMainEnemies(e.family))if(dist(e,q)<170)q.familyGuardT=Math.max(q.familyGuardT||0,1.1);
  }else if(g.major==='beacon'){
    for(const q of familyMainEnemies(e.family))if(dist(e,q)<190)q.hp=Math.min(q.maxHp,q.hp+q.maxHp*.045);
    ringBullets(e.x,e.y,6,125,4.8,col,e.t,e);
  }else if(g.major==='distill'){
    for(let k=-2;k<=2;k++)spawnEnemyBullet(e.x,e.y,a+k*.10,245,5.3,5,col,e);
    if(G.obstacles.length<6&&Math.random()<.38)spawnObstacle();
  }else if(g.major==='eclipse'){
    ringBullets(e.x,e.y,8,118,5.0,col,e.t,e);
    for(const q of familyMainEnemies(e.family))if(dist(e,q)<185)q.cloakT=Math.max(q.cloakT||0,1.4);
  }else if(g.major==='refract'){
    for(let k=-2;k<=2;k++)spawnEnemyBullet(e.x,e.y,a+k*.075,330,5.2,4,col,e);
  }else if(g.major==='vortex'){
    ringBullets(e.x,e.y,8,138,5.4,col,e.t,e);
    for(const q of familyMainEnemies(e.family))if(q!==e&&dist(e,q)<190){q.x=lerp(q.x,e.x,.10);q.y=lerp(q.y,e.y,.10);}
  }else if(g.major==='conduct'){
    const peers=familyMainEnemies(e.family).filter(q=>q!==e).sort((x,y)=>dist(e,x)-dist(e,y)).slice(0,3);
    let prev=e;
    for(const q of peers){
      G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:q.x,y2:q.y,life:.22,max:.22,col});
      const qa=Math.atan2(p.y-q.y,p.x-q.x);spawnEnemyBullet(q.x,q.y,qa,285,4.7,4,col,q);prev=q;
    }
  }else if(g.major==='command'){
    e.familyGuardT=1.6;
    for(const q of familyMainEnemies(e.family))if(dist(e,q)<210)q.familyGuardT=Math.max(q.familyGuardT||0,1.0);
    ringBullets(e.x,e.y,7,132,5.2,col,e.t,e);
  }
  AudioX.tone(170+G.sector*11,.055,.012,'triangle');
}
function applyFamilyTacticalMovement(e,p,vx,vy,dt){
  const g=familyCombatGrammar();
  if(!g||!e||e.dead||e.microSwarm||e.kind!=='insect'||e.family!==SECTORS[G.sector-1].family)return {vx,vy};
  const tier=combatTier(e);
  e.familyTacticCd=(e.familyTacticCd??rnd(2.1,4.8))-dt;
  e.familyPulseT=Math.max(0,(e.familyPulseT||0)-dt);
  e.familyGuardT=Math.max(0,(e.familyGuardT||0)-dt);
  e.cloakT=Math.max(0,(e.cloakT||0)-dt);
  e.corridorT=Math.max(0,(e.corridorT||0)-dt);

  const fp=G.familyPlay,playActive=!!(fp&&fp.stage==='active'&&e.familyPlayToken===fp.token&&e.familyPlayRole);
  if(playActive){
    if(e.familyPlayRole==='cover'){
      const mate=fp.medium&&!fp.medium.dead?fp.medium:null;if(mate){const tx=mate.x+82,ty=mate.y;vx+=clamp((tx-e.x)*1.35,-e.spd*.55,e.spd*.55);vy+=clamp((ty-e.y)*1.25,-e.spd*.65,e.spd*.65);}
    }else if(e.familyPlayRole==='breach'){
      vy+=clamp((fp.targetY-e.y)*2.4,-e.spd*1.15,e.spd*1.15);vx-=e.spd*(fp.spec.advanced?.20:.12);
    }else if(e.familyPlayRole==='seal_upper'||e.familyPlayRole==='seal_lower'){
      const idx=fp.minors.indexOf(e),sign=e.familyPlayRole==='seal_upper'?-1:1,tx=e.familyPlayTargetX||clamp(p.x+145+(idx%2)*34,W*.26,W*.62),ty=e.familyPlayTargetY||clamp(p.y+sign*(78+Math.floor(Math.max(0,idx)/2)*24),48,H-48);
      vx+=clamp((tx-e.x)*1.6,-e.spd*.82,e.spd*.82);vy+=clamp((ty-e.y)*2.1,-e.spd*1.05,e.spd*1.05);
      if(fp.spec.effect==='vortex')vx-=e.spd*.12;else if(fp.spec.effect==='conduct')vy+=Math.sin(e.t*7+e.phase)*28;else if(fp.spec.effect==='mirror')vy+=Math.sin(e.t*6+e.phase)*44;
    }
  }

  if(tier===0){
    const leader=familyNearestLeader(e);
    if(leader){
      let tx=leader.x-52,ty=leader.y;
      if(g.minor==='orbit'||g.minor==='royal'){
        const aa=(e.phase||0)+e.t*(g.minor==='royal'?1.25:1.6);
        tx=leader.x-32+Math.cos(aa)*54;ty=leader.y+Math.sin(aa)*72;
      }else if(g.minor==='flank'){
        ty=clamp(p.y+(Math.sin(e.phase)>0?1:-1)*92,48,H-48);tx=leader.x-72;
      }else if(g.minor==='screen'){
        ty=leader.y+(Math.sin(e.phase)>0?1:-1)*42;tx=leader.x-76;
      }else if(g.minor==='veil'){
        ty=leader.y+Math.sin(e.t*2.7+e.phase)*82;e.cloakT=Math.max(e.cloakT,.18);
      }else if(g.minor==='decoy'){
        tx=leader.x-90;ty=leader.y+Math.sin(e.t*4.2+e.phase)*100;
      }else if(g.minor==='chain'){
        const peer=familyNearestUnit(e,1);if(peer){tx=peer.x-34;ty=peer.y+Math.sin(e.phase)*54;}
      }else if(g.minor==='burrow'){
        ty=clamp(p.y+Math.sin(e.phase)*70,48,H-48);
        if(e.familyTacticCd<=0){
          const a=Math.atan2(p.y-e.y,p.x-e.x);e.surgeVX=Math.cos(a)*e.spd*1.75;e.surgeVY=Math.sin(a)*e.spd*1.75;e.surgeT=.30;e.familyTacticCd=rnd(2.6,3.8);
        }
      }
      vx+=clamp((tx-e.x)*1.15,-e.spd*.52,e.spd*.52);
      vy+=clamp((ty-e.y)*1.35,-e.spd*.80,e.spd*.80);
    }
  }else if(tier===1){
    if(e.familyTacticCd<=0){
      e.corridorT=.9+(G.sector>=17?.18:0);
      e.corridorY=clamp(p.y+(Math.sin(e.phase)>0?1:-1)*rnd(70,125),55,H-55);
      e.familyTacticCd=rnd(3.4,5.4);e.familyPulseT=.45;
      if(['lance','split','sweep','ram','clamp','spray'].includes(g.medium)){
        const a=Math.atan2(e.corridorY-e.y,p.x-e.x);
        const mult=g.medium==='lance'?2.2:g.medium==='ram'?2.0:1.75;
        e.surgeVX=Math.cos(a)*e.spd*mult;e.surgeVY=Math.sin(a)*e.spd*1.55;e.surgeT=.34;
      }
    }
    if(e.corridorT>0){
      vy+=clamp((e.corridorY-e.y)*2.1,-e.spd*1.05,e.spd*1.05);
      if(g.medium==='constellation'){
        const leader=familyNearestLeader(e);if(leader){vx+=clamp((leader.x-110-e.x)*.75,-e.spd*.35,e.spd*.35);vy+=Math.sin(e.t*3+e.phase)*32;}
      }else if(g.medium==='weave')vy+=Math.sin(e.t*6+e.phase)*68;
      else if(g.medium==='herd')vx-=e.spd*.18;
      else if(g.medium==='corridor')vx-=e.spd*.25;
    }
  }else if(tier===2){
    if(e.familyTacticCd<=0&&e.x<W*.90){
      familyMajorCall(e,g);
      e.familyTacticCd=rnd(g.cadence*.82,g.cadence*1.14)*(runDifficultyKey()==='hard'?.90:1);
    }
  }
  return {vx,vy};
}
function updateBossFamilyResponse(dt){
  if(!G?.boss||G.boss.dead||G.boss.dying||G.sector<11||G.mode!=='campaign')return;
  const g=familyCombatGrammar();if(!g)return;
  G.bossFamilySwarmTimer=(G.bossFamilySwarmTimer??rnd(g.cadence*.85,g.cadence*1.15))-dt;
  if(G.bossFamilySwarmTimer>0)return;
  const alive=G.enemies.filter(e=>!e.dead&&e.microSwarm&&e.bossReactive).length,cap=compactUI()?7:10;
  if(alive<cap){
    const baseN=G.boss.phase>=3?5:G.boss.phase===2?4:3,commanderLoad=activeLieutenants().length;
    const n=Math.min(cap-alive,Math.max(2,baseN-(commanderLoad>=2?1:0)));
    spawnFamilyMicroEscort(G.boss,n,g.bossFormation,true);
    G.familyBossResponses=(G.familyBossResponses||0)+1;
    G.boss.animAttackT=Math.max(G.boss.animAttackT||0,.24);
    G.particles.push({kind:'ring',x:G.boss.x,y:G.boss.y,r:G.boss.r*.65,vr:250,life:.42,max:.42,col:SECTORS[G.sector-1].accent});
    if((G.familyBossResponses||0)<=2)notify(`ENJAMBRE REACTIVO · ${g.label}`,SECTORS[G.sector-1].accent,1.05);
  }
  G.bossFamilySwarmTimer=rnd(g.cadence*.90,g.cadence*1.25)*(G.boss.phase===3?.82:G.boss.phase===2?.92:1);
}

// ─────────────────────────────────────────────────────────────
// v2.15.4 · ADAPTIVE COUNTERPLAY DIRECTOR
// Aprende hábitos espaciales SOLO durante la partida actual. No guarda perfil personal,
// no modifica HP/daño/cadencia y nunca elimina el telegraph de una maniobra.
function playerBehaviorZone(y=G?.player?.y||H*.5){return y<H*.36?'upper':y>H*.64?'lower':'center';}
function updatePlayerBehavior(dt){
  if(!G?.player||G.mode!=='campaign'||G.screen!=='GAME'||G.sector<11||G.boss||G.preBossT>0||G.postBossT>0||G.lastChanceT>0)return;
  const z=playerBehaviorZone();G.behaviorSampleT=(G.behaviorSampleT||0)+dt;G.behaviorZoneT=G.behaviorZoneT||{upper:0,center:0,lower:0};G.behaviorZoneT[z]=(G.behaviorZoneT[z]||0)+dt;
  if(G.behaviorLastZone&&z!==G.behaviorLastZone){G.behaviorSwitches=(G.behaviorSwitches||0)+1;G.behaviorLastZone=z;}else if(!G.behaviorLastZone)G.behaviorLastZone=z;
  const total=Math.max(.001,(G.behaviorZoneT.upper||0)+(G.behaviorZoneT.center||0)+(G.behaviorZoneT.lower||0));
  const entries=Object.entries(G.behaviorZoneT).sort((a,b)=>b[1]-a[1]),best=entries[0],ratio=best[1]/total,switchRate=(G.behaviorSwitches||0)/Math.max(1,G.behaviorSampleT);
  G.behaviorConfidence=G.behaviorSampleT<4?0:clamp((ratio-.42)/.38,0,1);
  G.behaviorRead=G.behaviorSampleT<4?'LEYENDO':switchRate>.42?'IMPREDECIBLE':G.behaviorConfidence>.42?best[0].toUpperCase():'MIXTA';
}
function behaviorCounterLane(p=G?.player){
  const fallback=clamp((p?.y||H*.5)+(Math.random()<.5?-1:1)*rnd(35,78),72,H-72);
  if(!G||G.sector<16||(G.behaviorConfidence||0)<.42||G.behaviorRead==='IMPREDECIBLE'||G.behaviorRead==='MIXTA'||G.behaviorRead==='LEYENDO')return {y:fallback,adapted:false,read:G?.behaviorRead||'UNREAD'};
  const band=G.behaviorRead==='UPPER'?H*.29:G.behaviorRead==='LOWER'?H*.71:H*.50;
  // Solo sesgo parcial: 68% cerca del hábito, 32% mantiene variedad. Telegraph permanece completo.
  const y=Math.random()<.68?clamp(lerp(fallback,band,.62)+rnd(-34,34),72,H-72):fallback;
  return {y,adapted:true,read:G.behaviorRead};
}
// v2.15.3 · FAMILY COMBO DIRECTOR / JUGADAS ENEMIGAS
// Un mayor cubre, un medio rompe/abre corredor y menores sellan salidas.
// Desde Mundo 16 la frecuencia y coordinación aumentan, con telegraph obligatorio.
// ─────────────────────────────────────────────────────────────
function familyPlayRoster(){
  const family=SECTORS[G.sector-1]?.family,units=familyMainEnemies(family);
  return {
    majors:units.filter(e=>combatTier(e)===2),
    mediums:units.filter(e=>combatTier(e)===1),
    minors:units.filter(e=>combatTier(e)===0)
  };
}
function familyPlayMembersAlive(play=G?.familyPlay){return !!(play&&play.major&&!play.major.dead&&play.medium&&!play.medium.dead&&play.minors?.filter(e=>!e.dead).length>=1);}
function clearFamilyManeuver(reason='complete'){
  const play=G?.familyPlay;if(!play)return;
  for(const e of [play.major,play.medium,...(play.minors||[])])if(e){e.familyPlayToken=0;e.familyPlayRole='';e.familyPlayTargetX=0;e.familyPlayTargetY=0;e.familyPlayT=0;}
  G.familyPlay=null;
  const spec=familyComboPlay();
  if(spec){const [lo,hi]=spec.cool,relief=reason==='broken'?1.16:1;G.familyPlayTimer=rnd(lo,hi)*relief*(runDifficultyKey()==='hard'?.90:1);}
}
function breakFamilyManeuver(e){
  const play=G?.familyPlay;if(!play||!e||e.familyPlayToken!==play.token||play.broken)return false;
  const tier=combatTier(e);if(tier<1)return false;
  play.broken=true;G.familyPlayBreaks=(G.familyPlayBreaks||0)+1;G.score+=70+G.sector*7;
  burst(e.x,e.y,'#fff09a',12,145);notify(`✦ FORMACIÓN ROTA · ${play.label}`,'#fff09a',1.15);clearFamilyManeuver('broken');return true;
}
function familyManeuverEffect(play){
  const sec=SECTORS[G.sector-1],p=G.player,col=sec.accent,major=play.major,medium=play.medium,minors=play.minors.filter(e=>!e.dead);
  if(!major||major.dead||!medium||medium.dead)return;
  major.familyGuardT=Math.max(major.familyGuardT||0,play.spec.advanced?1.45:1.15);major.familyPulseT=.75;
  medium.familyPulseT=.65;medium.corridorT=Math.max(medium.corridorT||0,1.15);medium.corridorY=play.targetY;
  const tx=Math.max(p.x+145,W*.43),a=Math.atan2(play.targetY-medium.y,tx-medium.x);medium.surgeVX=Math.cos(a)*medium.spd*(play.spec.advanced?2.15:1.85);medium.surgeVY=Math.sin(a)*medium.spd*1.55;medium.surgeT=.42;
  minors.forEach((e,i)=>{e.familyPulseT=.5;e.familyPlayTargetX=clamp(p.x+145+(i%2)*34,W*.26,W*.62);e.familyPlayTargetY=clamp(p.y+(i%2?-1:1)*(72+Math.floor(i/2)*28),48,H-48);if(play.spec.effect==='veil'||play.spec.effect==='mirror')e.cloakT=Math.max(e.cloakT||0,1.15);});
  const aim=Math.atan2(p.y-major.y,p.x-major.x);
  switch(play.spec.effect){
    case'orbit': ringBullets(major.x,major.y,6,132,4.4,col,major.t,major);break;
    case'venom': for(let k=-1;k<=1;k++)spawnEnemyBullet(major.x,major.y,aim+k*.105,290,4.4,4,col,major);break;
    case'brace': for(const e of [major,medium,...minors])e.familyGuardT=Math.max(e.familyGuardT||0,.95);break;
    case'lumen': ringBullets(major.x,major.y,5,118,4.1,col,major.t,major);for(const e of [major,medium,...minors])e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.025);break;
    case'caustic': for(let k=-2;k<=2;k++)spawnEnemyBullet(major.x,major.y,aim+k*.09,238,4.2,4,col,major);break;
    case'veil': for(const e of [major,medium,...minors])e.cloakT=Math.max(e.cloakT||0,1.35);ringBullets(major.x,major.y,6,105,4.0,col,major.t,major);break;
    case'mirror': for(let k=-2;k<=2;k++)spawnEnemyBullet(medium.x,medium.y,Math.atan2(p.y-medium.y,p.x-medium.x)+k*.07,305,4.0,4,col,medium);break;
    case'vortex': ringBullets(major.x,major.y,7,126,4.2,col,major.t,major);break;
    case'conduct': {let prev=major;for(const e of [medium,...minors.slice(0,2)]){G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.28,max:.28,col});prev=e;}for(const e of minors.slice(0,2)){const aa=Math.atan2(p.y-e.y,p.x-e.x);spawnEnemyBullet(e.x,e.y,aa,275,3.9,4,col,e);}break;}
    case'command': for(const e of [major,medium,...minors])e.familyGuardT=Math.max(e.familyGuardT||0,1.05);ringBullets(major.x,major.y,6,122,4.0,col,major.t,major);break;
  }
  G.particles.push({kind:'ring',x:medium.x,y:medium.y,r:16,vr:260,life:.45,max:.45,col});
  AudioX.tone(205+G.sector*8,.065,.014,'triangle');
}
function startFamilyManeuver(){
  if(!G||G.screen!=='GAME'||G.mode!=='campaign'||G.sector<11||G.boss||G.bossPending||G.preBossT>0||G.postBossT>0||G.lastChanceT>0||(G.recoveryGraceT||0)>0||G.familyPlay)return false;
  const spec=familyComboPlay();if(!spec)return false;const r=familyPlayRoster();if(r.majors.length<1||r.mediums.length<1||r.minors.length<2)return false;
  const p=G.player,major=[...r.majors].sort((a,b)=>dist(a,p)-dist(b,p))[0],medium=[...r.mediums].sort((a,b)=>dist(a,p)-dist(b,p))[0],minors=[...r.minors].sort((a,b)=>dist(a,p)-dist(b,p)).slice(0,spec.advanced?4:3);
  const token=(G.familyPlaySerial=(G.familyPlaySerial||0)+1),counter=behaviorCounterLane(p),targetY=counter.y;
  const play={token,key:spec.id,label:spec.label,spec,stage:'telegraph',telegraphT:spec.telegraph,activeT:spec.active,targetY,major,medium,minors,broken:false,adapted:counter.adapted,behaviorRead:counter.read};if(counter.adapted)G.behaviorCounterPlays=(G.behaviorCounterPlays||0)+1;G.familyPlay=play;G.familyPlayCount=(G.familyPlayCount||0)+1;
  major.familyPlayToken=token;major.familyPlayRole='cover';major.familyPlayT=spec.telegraph+spec.active;
  medium.familyPlayToken=token;medium.familyPlayRole='breach';medium.familyPlayTargetY=targetY;medium.familyPlayT=spec.telegraph+spec.active;
  minors.forEach((e,i)=>{e.familyPlayToken=token;e.familyPlayRole=i%2?'seal_upper':'seal_lower';e.familyPlayT=spec.telegraph+spec.active;});
  for(const e of [major,medium,...minors]){e.familyPulseT=Math.max(e.familyPulseT||0,.62);G.particles.push({kind:'ring',x:e.x,y:e.y,r:8,vr:150,life:.42,max:.42,col:SECTORS[G.sector-1].accent});}
  notify(`⚠ MANIOBRA COORDINADA · ${spec.label}${play.adapted?' · LECTURA TÁCTICA':''}`,SECTORS[G.sector-1].accent,1.35);return true;
}
function updateFamilyManeuver(dt){
  if(!G||G.mode!=='campaign'||G.sector<11||G.boss||G.bossPending||G.preBossT>0||G.postBossT>0||G.lastChanceT>0){if(G?.familyPlay)clearFamilyManeuver('cancel');return;}
  const play=G.familyPlay;
  if(play){
    for(const e of [play.major,play.medium,...(play.minors||[])])if(e)e.familyPlayT=Math.max(0,(e.familyPlayT||0)-dt);
    if(!familyPlayMembersAlive(play)){clearFamilyManeuver('broken');return;}
    if(play.stage==='telegraph'){
      play.telegraphT-=dt;if(play.telegraphT<=0){play.stage='active';familyManeuverEffect(play);}
    }else{
      play.activeT-=dt;if(play.activeT<=0)clearFamilyManeuver('complete');
    }
    return;
  }
  G.familyPlayTimer=(G.familyPlayTimer??rnd(7,11))-dt;if(G.familyPlayTimer>0)return;
  const roster=familyPlayRoster(),main=roster.majors.length+roster.mediums.length+roster.minors.length,prof=directorProfile(),playerRatio=G.player.hp/Math.max(1,G.player.maxHp);
  if(playerRatio<.30||(G.recoveryGraceT||0)>0||main>Math.max(9,(prof.maxAlive||8)+2)||(PERF.tier==='RECOVERY'&&main>6)){G.familyPlayTimer=rnd(3.5,5.5);return;}
  if(!startFamilyManeuver())G.familyPlayTimer=rnd(2.6,4.4);
}
function drawFamilyManeuverTelegraph(){
  const play=G?.familyPlay;if(!play)return;const sec=SECTORS[G.sector-1],active=play.stage==='active',a=active?.18:clamp(.18+.26*(play.telegraphT/Math.max(.1,play.spec.telegraph)),.18,.44);cx.save();
  cx.globalAlpha=a;cx.strokeStyle=sec.accent;cx.fillStyle=hexA(sec.accent,.10);cx.lineWidth=2;cx.setLineDash?.([8,8]);const y=play.targetY,h=active?54:72;cx.fillRect(W*.12,y-h/2,W*.76,h);cx.beginPath();cx.moveTo(W*.12,y);cx.lineTo(W*.88,y);cx.stroke();cx.setLineDash?.([]);
  for(const e of [play.major,play.medium,...play.minors])if(e&&!e.dead){cx.beginPath();cx.arc(e.x,e.y,e.r*1.5,0,TAU);cx.stroke();}
  cx.globalAlpha=active?.82:1;cx.textAlign='center';cx.fillStyle=active?'#fff09a':sec.accent;cx.font=`900 ${compactUI()?9:11}px system-ui`;cx.fillText(`${active?'▶':'⚠'} ${play.label}`,W/2,H*.145);cx.restore();cx.textAlign='left';
}
function riftAllyPool(){if(!G||(G.sector||0)<11)return [];const max=Math.min(activeSectorCount(),Math.max(1,(G.sector||11)-1));const pool=[];for(let s=1;s<=max;s++)if(sectorDefeated(s))pool.push(s);return pool;}
const RIFT_ALLY_SIGNATURES={
  11:{label:'ÓRBITA KHEPRI'},12:{label:'PICA VECTORIAL'},13:{label:'TENAZA REGICIDA'},14:{label:'CONSTELACIÓN LÚMEN'},15:{label:'DESTILACIÓN CÁUSTICA'},16:{label:'VELO HIPNÓTICO'},17:{label:'FRACTURA MIMÉTICA'},18:{label:'VÓRTICE DE FOSA'},19:{label:'PINZA ELECTROFÁGICA'},20:{label:'DOMINIO DE LA COLMENA'}
};
function summonRiftAlly(){if(!G||G.screen!=='GAME'||G.mode!=='campaign'||G.sector<11||G.bossPending||G.preBossT>0||G.lastChanceT>0)return false;if(G.riftAlly){notify(`☣ ${G.riftAlly.name} · ${Math.ceil(G.riftAlly.t)}s`,'#9fe6ff',1.1);return false;}if(G.riftAllyUsed){AudioX.deny();notify('☣ RIFT ALLY · CARGA DEL SECTOR AGOTADA','#8da4b5',1.5);return false;}const pool=riftAllyPool();if(!pool.length){AudioX.deny();notify('☣ SIN JEFES DERROTADOS DISPONIBLES','#ff8a8a',1.5);return false;}const sector=pick(pool);streamPrepareBoss(sector,'rift-ally');const sec=SECTORS[sector-1],sig=RIFT_ALLY_SIGNATURES[sector]?.label||BOSS_SIGNATURE_ATTACKS?.[sec.pattern]?.name||sec.pattern.toUpperCase();G.riftAlly={sector,name:sec.boss,family:sec.family,pattern:sec.pattern,signature:sig,kind:'riftAlly',x:W*.28,y:H*.28,r:42,hp:1,maxHp:1,t:10,max:10,fire:.18,phase:3,dead:false,flash:0,animAttackT:0};G.riftAllyUsed=true;burst(G.player.x,G.player.y,'#9fe6ff',26,220);G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:18,vr:720,life:.52,max:.52,col:'#9fe6ff'});AudioX.bossEvent(sector-1,'allyIn',1);notify(`☣ RIFT ALLY · ${sec.boss} · ${sig} · 10s`,'#9fe6ff',2.2);setScreen('GAME');return true;}
function riftAllyTargets(){const main=G.enemies.filter(e=>!e.dead&&!e.microSwarm&&e.kind!=='transversal'&&e.kind!=='lieutenant').sort((a,b)=>a.x-b.x);return main.length?main:G.enemies.filter(e=>!e.dead&&e.microSwarm).sort((a,b)=>a.x-b.x);}
function riftAllyCH2Strike(a,b,targets,base,col){if(a.sector<11)return false;const t=b||targets[0];switch(a.sector){
  case 11:{const x=t?.x??W*.68,y=t?.y??H*.5,rad=210;for(const e of targets)if(Math.hypot(e.x-x,e.y-y)<rad)damageEntity(e,base*.82,'rift_ally');if(b)damageEntity(b,base*.92,'rift_ally');for(const q of G.eBullets)if(q.life>0&&Math.hypot(q.x-x,q.y-y)<rad*.92)q.life=0;G.particles.push({kind:'shock',x,y,r:18,vr:510,life:.55,max:.55,col});break;}
  case 12:{const list=b?[b]:targets.slice(0,3);for(const q of list){damageEntity(q,base*1.02,'rift_ally');G.particles.push({kind:'slash',x:a.x,y:a.y,a:Math.atan2(q.y-a.y,q.x-a.x),len:Math.min(460,dist(a,q)),life:.14,max:.14,col});}break;}
  case 13:{if(t){damageEntity(t,base*1.34,'rift_ally');G.particles.push({kind:'shock',x:t.x,y:t.y,r:12,vr:330,life:.38,max:.38,col});}for(const e of targets.slice(1,3))if(t&&dist(t,e)<120)damageEntity(e,base*.52,'rift_ally');break;}
  case 14:{for(const q of (b?[b]:targets.slice(0,4)))damageEntity(q,base*.78,'rift_ally');G.player.shield=Math.min(G.player.maxShield,G.player.shield+2.2);G.particles.push({kind:'halo',x:G.player.x,y:G.player.y,r:18,vr:250,life:.46,max:.46,col});break;}
  case 15:{for(const q of (b?[b]:targets.slice(0,3))){damageEntity(q,base*.92,'rift_ally');q.slow=Math.max(q.slow||0,1.15);G.particles.push({kind:'arc',x:a.x,y:a.y,x2:q.x,y2:q.y,life:.18,max:.18,col});}break;}
  case 16:{for(const q of G.eBullets)if(q.life>0&&dist(G.player,q)<205)q.life=0;G.player.shield=Math.min(G.player.maxShield,G.player.shield+3.2);if(t)damageEntity(t,base*.76,'rift_ally');G.particles.push({kind:'halo',x:G.player.x,y:G.player.y,r:20,vr:360,life:.62,max:.62,col});break;}
  case 17:{for(const q of (b?[b]:targets.slice(0,4))){damageEntity(q,base*.86,'rift_ally');G.particles.push({kind:'slash',x:a.x+rnd(-24,24),y:a.y+rnd(-24,24),a:Math.atan2(q.y-a.y,q.x-a.x)+rnd(-.10,.10),len:Math.min(480,dist(a,q)),life:.16,max:.16,col});}break;}
  case 18:{const x=t?.x??W*.70,y=t?.y??H*.5;for(const q of targets){const d=Math.hypot(q.x-x,q.y-y);if(d<250){q.x=lerp(q.x,x,.16);q.y=lerp(q.y,y,.16);damageEntity(q,base*(d<120?.88:.52),'rift_ally');}}if(b)damageEntity(b,base*.82,'rift_ally');G.particles.push({kind:'ring',x,y,r:24,vr:430,life:.52,max:.52,col});break;}
  case 19:{const list=b?[b]:targets.slice(0,3);for(let i=0;i<list.length;i++){damageEntity(list[i],base*(i? .70:1.18),'rift_ally');if(i<list.length-1)G.particles.push({kind:'arc',x:list[i].x,y:list[i].y,x2:list[i+1].x,y2:list[i+1].y,life:.18,max:.18,col});}break;}
  case 20:{for(const q of (b?[b]:targets.slice(0,5)))damageEntity(q,base*.74,'rift_ally');G.player.shield=Math.min(G.player.maxShield,G.player.shield+4.2);for(const q of G.eBullets)if(q.life>0&&dist(G.player,q)<150)q.life=0;G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:18,vr:390,life:.48,max:.48,col});break;}
}return true;}
function riftAllyStrike(a){const sec=SECTORS[a.sector-1],targets=riftAllyTargets(),b=G.boss&&!G.boss.dead?G.boss:null,base=24+a.sector*2.25,hitCol=sec.accent;a.animAttackT=.32;bossAnimImpactCue(a,.42,'rift-ally');if(riftAllyCH2Strike(a,b,targets,base,hitCol)){return;}
  if(['titan','leap','resonance'].includes(a.pattern)){const rad=a.pattern==='resonance'?245:195;for(const e of targets)if(dist(a,e)<rad)damageEntity(e,base*.72,'rift_ally');if(b)damageEntity(b,base*.80,'rift_ally');for(const q of G.eBullets)if(q.life>0&&dist(a,q)<rad*.78)q.life=0;G.particles.push({kind:'shock',x:a.x,y:a.y,r:18,vr:420,life:.48,max:.48,col:hitCol});}
  else if(['blood','architect','queen'].includes(a.pattern)){const t=b||targets[0];if(t){damageEntity(t,base*1.15,'rift_ally');G.particles.push({kind:'arc',x:a.x,y:a.y,x2:t.x,y2:t.y,life:.17,max:.17,col:hitCol});}if(a.pattern==='blood')G.player.shield=Math.min(G.player.maxShield,G.player.shield+2.5);if(a.pattern==='architect')G.player.shield=Math.min(G.player.maxShield,G.player.shield+4);}
  else{const list=b?[b]:targets.slice(0,a.pattern==='odonata'?3:2);for(const t of list){damageEntity(t,base*(a.pattern==='blade'?1.08:.92),'rift_ally');G.particles.push({kind:'slash',x:a.x,y:a.y,a:Math.atan2(t.y-a.y,t.x-a.x),len:Math.min(420,dist(a,t)),life:.18,max:.18,col:hitCol});}}
}
function updateRiftAlly(dt){const a=G?.riftAlly;if(!a)return;a.t-=dt;a.fire-=dt;a.animAttackT=Math.max(0,(a.animAttackT||0)-dt);updateBossAnimCue(a,dt);const targetY=G.player.y-70+Math.sin(G.elapsed*1.7)*55;a.x=lerp(a.x,G.player.x+105,1-Math.pow(.02,dt));a.y=lerp(a.y,clamp(targetY,80,H-90),1-Math.pow(.03,dt));if(a.fire<=0){a.fire=rnd(.64,.96);riftAllyStrike(a);}if(a.t<=0){burst(a.x,a.y,'#9fe6ff',20,180);G.particles.push({kind:'ring',x:a.x,y:a.y,r:16,vr:620,life:.45,max:.45,col:'#9fe6ff'});notify(`☣ ${a.name} · RETORNO AL RIFT`,'#9fb4c5',1.2);AudioX.bossEvent(a.sector-1,'allyOut',.9);G.riftAlly=null;setScreen('GAME');}}
function drawRiftAlly(){const a=G?.riftAlly;if(!a)return;const old=G.sector,countdown=a.t;G.sector=a.sector;a.t=G.elapsed;drawInsect(a,true,false,.62);a.t=countdown;G.sector=old;const w=134,x=a.x-w/2,y=a.y+a.r*1.15,p=clamp(a.t/a.max,0,1);cx.fillStyle='rgba(0,0,0,.72)';rr(x,y,w,8,4);cx.fill();cx.fillStyle='#9fe6ff';rr(x+1,y+1,(w-2)*p,6,3);cx.fill();cx.textAlign='center';cx.fillStyle='#dffaff';cx.font='800 8px system-ui';cx.fillText(`☣ ${a.name} · ${a.t.toFixed(1)}s`,a.x,y+16);if(a.signature){cx.fillStyle='#9fe6ff';cx.font='700 7px system-ui';cx.fillText(a.signature,a.x,y+27);}cx.textAlign='left';}
function beginLastChance(){if(!G||G.lastChanceT>0||G.screen!=='GAME')return false;G.player.hp=1;G.player.inv=9;G.lastChanceT=5;G.lastChanceMax=5;G.lastChanceRescued=false;G.combo=0;G.comboT=0;G.eBullets.length=0;G.hitStopT=0;shopBtn.classList.add('rescue-alert');notify('⚠ VAS A MORIR · 5s · 🛒 VIDA EXTRA','#ff536f',5);AudioX.tone(150,.18,.05,'sawtooth',0,-40);return true;}
function rescueLastChance(){if(!G||!(G.lastChanceT>0)||supplyStock('life')<=0)return false;META.supplies.life=Math.max(0,supplyStock('life')-1);G.lastChanceT=0;G.lastChanceRescued=true;G.recoveryGraceT=5.5;G.player.hp=Math.max(34,Math.round(G.player.maxHp*.46));G.player.shield=Math.max(G.player.shield,Math.round(G.player.maxShield*.28));G.player.inv=2.4;shopBtn.classList.remove('rescue-alert');burst(G.player.x,G.player.y,'#a6ff5f',34,260);G.particles.push({kind:'shock',x:G.player.x,y:G.player.y,r:16,vr:680,life:.62,max:.62,col:'#a6ff5f'});AudioX.power('shield');saveMeta();notify('❤ RESCATE RIFT · 5s DE ALIVIO TÁCTICO','#a6ff5f',2.0);return true;}
function updateLastChance(dt){if(!G?.lastChanceT)return;G.lastChanceT=Math.max(0,G.lastChanceT-dt);G.player.inv=9;flash=Math.max(flash,.76+.18*Math.sin(G.elapsed*11));if(Math.floor((G.lastChanceT+dt)*2)!==Math.floor(G.lastChanceT*2))AudioX.tone(120+G.lastChanceT*18,.05,.014,'square');if(G.lastChanceT<=0){shopBtn.classList.remove('rescue-alert');gameOver();}}
function drawLastChanceOverlay(){if(!(G?.lastChanceT>0))return;const pulse=.18+.13*(.5+.5*Math.sin(G.elapsed*12));cx.save();cx.fillStyle=`rgba(180,0,20,${pulse})`;cx.fillRect(0,0,W,H);cx.strokeStyle=`rgba(255,70,90,${.55+.35*Math.sin(G.elapsed*16)})`;cx.lineWidth=compactUI()?8:14;cx.strokeRect(3,3,W-6,H-6);cx.textAlign='center';cx.shadowColor='#ff233f';cx.shadowBlur=22;cx.fillStyle='#fff';cx.font=`950 ${Math.min(42,Math.max(22,W*.038))}px system-ui`;cx.fillText('⚠ VAS A MORIR',W/2,H*.34);cx.shadowBlur=0;cx.fillStyle='#ffcfda';cx.font=`900 ${Math.min(28,Math.max(18,W*.026))}px ui-monospace,monospace`;cx.fillText(`${G.lastChanceT.toFixed(1)} s`,W/2,H*.42);const bw=Math.min(420,W*.54),bx=W/2-bw/2,by=H*.47;cx.fillStyle='rgba(0,0,0,.65)';rr(bx,by,bw,12,6);cx.fill();cx.fillStyle='#ff526f';rr(bx+1,by+1,(bw-2)*clamp(G.lastChanceT/G.lastChanceMax,0,1),10,5);cx.fill();cx.fillStyle='#fff5f7';cx.font='800 11px system-ui';cx.fillText(supplyStock('life')>0?`🛒 PULSA EL CARRITO · VIDA EXTRA x${supplyStock('life')}`:'🛒 PULSA EL CARRITO PARA ABRIR RESCATE',W/2,H*.54);if(G.riftAlly){cx.fillStyle='#bdf5ff';cx.font='800 9px system-ui';cx.fillText(`☣ ${G.riftAlly.name} SIGUE COMBATIENDO`,W/2,H*.585);}cx.textAlign='left';cx.restore();}

// ─────────────────────────────────────────────────────────────
// SPAWN / COMBAT ENTITIES
// ─────────────────────────────────────────────────────────────
function enemySpecialDelay(form){
  return ({needler:rnd(2.0,3.1),hemodrone:rnd(2.2,3.2),bloodreaper:rnd(2.5,3.8),mandible_guard:rnd(3.0,4.2),siegebuilder:rnd(2.6,4.0),prism_hunter:rnd(1.7,2.7),lance_predator:rnd(1.9,3.0),nymph_echo:rnd(2.2,3.3),sonic_cantor:rnd(1.8,3.0),resonance_breaker:rnd(1.8,3.0)})[form]??999;
}

const TRANSVERSAL_DEF={
  rift_scout:{label:'RIFT SCOUT',col:'#78dcff',hp:.72,size:.86,spd:1.45,score:230,asset:1},
  salvage_drone:{label:'SALVAGE DRONE',col:'#ffd76a',hp:1.0,size:1.02,spd:1.05,score:280,asset:3},
  parasite_orb:{label:'PARASITE ORB',col:'#bd7dff',hp:.85,size:.82,spd:1.12,score:310,asset:null},
  rift_carrier:{label:'RIFT CARRIER',col:'#ff9a6f',hp:2.1,size:1.35,spd:.68,score:470,asset:9},
  relic_hunter:{label:'RELIC HUNTER',col:'#fff09a',hp:.82,size:.9,spd:1.72,score:620,asset:6}
};
function chooseTransversal(){const pool=G.wave===1?['rift_scout','salvage_drone','parasite_orb']:G.wave===2?['rift_scout','salvage_drone','parasite_orb','rift_carrier']:['rift_scout','parasite_orb','rift_carrier','salvage_drone','relic_hunter'];return weightedPick(directorProfile().transversals,pool)||pick(pool);}
function spawnTransversal(forceType=null){
  if(!G||G.boss||G.bossPending||G.mode==='training'||G.sectorClear)return null;const type=forceType||chooseTransversal(),d=TRANSVERSAL_DEF[type],bal=sectorBalance(),hard=runDifficultyKey()==='hard';
  const r=(18+G.sector*.35)*d.size,hp=(90+G.sector*28+G.wave*14)*d.hp*bal.enemyHp*(hard?1.14:1),entry=type==='relic_hunter'?'diagTop':weightedPick(directorProfile().entries,['right','top','bottom','diagTop','diagBottom']),pos=entryPlacement(entry||'right',r);
  const e={x:pos.x,y:pos.y,ox:pos.y,r,hp,maxHp:hp,spd:(105+G.sector*4)*d.spd,score:d.score+G.sector*24,form:type,family:'TRANSVERSAL',kind:'transversal',transversalType:type,name:d.label,col:d.col,shipVariant:d.asset,move:'hover',fireCd:rnd(.7,1.3),fireRate:1,specialCd:rnd(1.8,3.2),t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:(13+G.sector*1.6)*runDifficulty().enemyDamage,entryMode:'transversal',entryT:pos.t||0,entryTX:pos.tx,entryTY:pos.ty,stolen:0,spawned:0,retreat:false};
  G.enemies.push(e);AudioX.enemySpawn(e);return e;
}
function transversalReward(e){
  const reward=Math.round((28+G.sector*9)*(e.transversalType==='relic_hunter'?2.4:e.transversalType==='rift_carrier'?1.55:1)*economyMult());grantCredits(reward,'transversal',true);G.score+=e.score*2;grantRewardXp(Math.round(35+G.sector*7+(e.transversalType==='relic_hunter'?55:0)),'transversal');
  if(e.transversalType==='salvage_drone')for(let i=0;i<Math.max(1,e.stolen||0);i++)spawnPickup(e.x+rnd(-24,24),e.y+rnd(-20,20),'credit');
  else if(e.transversalType==='rift_carrier'){for(let i=0;i<3;i++)spawnPickup(e.x+rnd(-28,28),e.y+rnd(-22,22),'credit');if(Math.random()<.32)spawnPowerReward(e.x,e.y);}
  else if(e.transversalType==='relic_hunter'){for(let i=0;i<4;i++)spawnPickup(e.x+rnd(-34,34),e.y+rnd(-25,25),'credit');spawnPowerReward(e.x+24,e.y,null,true);spawnPickup(e.x-24,e.y,'shield');notify(`RELIQUIA INTERCEPTADA · +¤${reward}`,'#fff09a',2.0);}
  else if(e.transversalType==='parasite_orb'&&Math.random()<.4)spawnPowerReward(e.x,e.y);
  else if(Math.random()<.55)spawnPickup(e.x,e.y,'credit');
  META.credits=G.credits;AudioX.tone(e.transversalType==='relic_hunter'?1040:620,.1,.035,'triangle',0,160);burst(e.x,e.y,e.col||'#8eeaff',18,180);
}
function killTransversal(e){if(e.dead)return;objectiveEnemyDefeated(e);e.dead=true;transversalReward(e);}
function updateTransversalEnemy(e,dt,p){
  e.specialCd-=dt;e.fireCd-=dt;e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);const sm=e.slow>0?.6:1,t=e.transversalType;
  if(t==='rift_scout'){
    e.x-=e.spd*dt*sm;e.y+=Math.sin(e.t*5.6+e.phase)*115*dt*sm;if(e.fireCd<=0){e.fireCd=.78;const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.09,320,7,4,e.col,e);}
  }else if(t==='salvage_drone'){
    const q=G.pickups.filter(q=>q.life>0).sort((a,b)=>dist(e,a)-dist(e,b))[0];if(q&&!e.retreat){const a=Math.atan2(q.y-e.y,q.x-e.x);e.x+=Math.cos(a)*e.spd*dt*sm;e.y+=Math.sin(a)*e.spd*dt*sm;if(dist(e,q)<e.r+q.r+8){q.life=0;e.stolen=(e.stolen||0)+1;if(e.stolen>=3)e.retreat=true;AudioX.tone(420,.06,.02,'triangle');}}else{e.x-=e.spd*.85*dt*sm;e.y+=Math.sin(e.t*3)*45*dt;}
  }else if(t==='parasite_orb'){
    const ally=G.enemies.filter(a=>!a.dead&&a!==e&&a.kind!=='transversal'&&a.kind!=='lieutenant').sort((a,b)=>dist(e,a)-dist(e,b))[0];if(ally){const a=Math.atan2(ally.y-e.y,ally.x-e.x);e.x+=Math.cos(a)*e.spd*.45*dt;e.y+=Math.sin(a)*e.spd*.45*dt;if(dist(e,ally)<90&&e.specialCd<=0){e.specialCd=1.6;ally.hp=Math.min(ally.maxHp,ally.hp+ally.maxHp*.08);G.particles.push({kind:'arc',x:e.x,y:e.y,x2:ally.x,y2:ally.y,life:.18,max:.18,col:e.col});}}else e.x-=e.spd*.7*dt;if(e.fireCd<=0){e.fireCd=1.35;ringBullets(e.x,e.y,5,145,5,e.col,e.t);}
  }else if(t==='rift_carrier'){
    e.x+=(e.x>W*.73?-e.spd*.48:e.x<W*.63?e.spd*.16:0)*dt;e.y+=Math.sin(e.t*1.5)*42*dt;if(e.specialCd<=0&&e.spawned<2){e.specialCd=3.2;e.spawned++;const sec=SECTORS[G.sector-1];for(let i=0;i<3;i++)spawnEnemy(sec.forms[Math.min(i%2,sec.forms.length-1)],e.x-35,e.y+rnd(-55,55),'summon');notify('PORTAENJAMBRE · DESPLIEGUE','#ff9a6f',1.0);}if(e.fireCd<=0){e.fireCd=1.15;enemyShoot(e,'spread');}
  }else if(t==='relic_hunter'){
    e.x-=e.spd*1.25*dt;e.y+=Math.sin(e.t*7)*88*dt;if(e.specialCd<=0){e.specialCd=1.0;G.particles.push({kind:'slash',x:e.x,y:e.y,a:0,len:70,life:.15,max:.15,col:e.col});}
  }
  e.y=clamp(e.y,35,H-35);if(dist(e,p)<e.r+p.r){hitPlayer(e.contact);e.x+=40;}if(e.x<-100){objectiveEnemyEscaped(e);e.dead=true;}
}
function spawnLieutenant(sourceSector=null,slot=0,total=null,silent=false){
  if(!G||G.sector<=1||G.mode==='training'||G.mode==='bossRush'||!G.boss)return null;const src=clamp(sourceSector||G.sector-1,1,G.sector-1),prev=SECTORS[src-1];if(!prev)return null;const expected=total||G.lieutenantExpected||Math.max(1,defeatedCommanderSectors().length),hard=runDifficultyKey()==='hard',hp=G.boss.maxHp*commanderHpFactor(expected)*(.88+.12*(src/Math.max(1,G.sector-1))),r=Math.max(34,G.boss.r*(expected>=5?.47:.52));
  const lieStamina=(68+G.sector*6+src*2+(hard?16:0))*COMMANDER_DIFFICULTY.stamina*(expected>=5?.92:1),lane=(slot%4),laneY=[.24,.42,.62,.78][lane]||.5,entryX=W+90+slot*28;
  const e={x:entryX,y:H*laneY,r,hp,maxHp:hp,spd:(140+G.sector*4+src*1.5)*COMMANDER_DIFFICULTY.move,score:1450+G.sector*180+src*55,form:prev.forms[2],family:prev.family,kind:'lieutenant',lieutenantSector:src,pattern:prev.pattern,name:`TENIENTE ${prev.boss}`,phase:1,t:rnd(0,TAU),fireCd:.58+slot*.06,fireRate:.78,specialCd:1.85+slot*.22,dead:false,slow:0,flash:0,contact:(22+G.sector*2.1+src*.5)*COMMANDER_DIFFICULTY.contact,entryT:1.0+slot*.08,entryTX:W*(.72-(slot%2)*.08),entryTY:H*laneY,guardT:0,telegraphT:0,chargeT:0,animAttackT:0,animPulse:0,phaseFlash:0,stamina:lieStamina,staminaMax:lieStamina,coreOpenT:0,justSpawned:true};G.enemies.push(e);if(!silent)notify(`MANDO RECUPERADO · ${prev.boss}`,prev.accent,1.35);AudioX.bossWarn(Math.max(0,src-1));return e;
}
function killLieutenant(e){
  if(e.dead)return;e.dead=true;G.lieutenantKilled=true;G.lieutenantKills=(G.lieutenantKills||0)+1;const reward=Math.round((130+G.sector*28+(e.lieutenantSector||1)*12)*economyMult());grantCredits(reward,'lieutenant',true);G.score+=4200+G.sector*620+(e.lieutenantSector||1)*180;grantRewardXp(90+G.sector*18+(e.lieutenantSector||1)*4,'lieutenant');const heritage=HERITAGE_BY_SECTOR[e.lieutenantSector];for(let i=0;i<2;i++)spawnPickup(e.x+rnd(-32,32),e.y+rnd(-24,24),'credit');if(heritage&&Math.random()<.72)spawnPickup(e.x+22,e.y,'power',heritage);spawnPickup(e.x-22,e.y,'shield');
  const remaining=activeLieutenants().length,queued=(G.lieutenantQueue||[]).length;if((remaining>=1||queued>=1)&&(G.commanderSupportBudget||0)>0){if(G.player.shield/G.player.maxShield<.68)commanderSupportDrop('shield',e.x-12,e.y+28);if((G.lieutenantKills%2===1||remaining>=2)&&(G.commanderSupportBudget||0)>0)commanderSupportDrop('weaponBoost',e.x+28,e.y-20);}
  if(G.boss&&!G.boss.dead&&!G.boss.dying){G.boss.guardT=0;G.boss.coreOpenT=Math.max(G.boss.coreOpenT||0,(remaining+queued)>0?2.05:3.15);G.boss.stamina=Math.min(G.boss.stamina||0,(G.boss.staminaMax||100)*((remaining+queued)>0?.42:.30));G.boss.animPulse=Math.max(G.boss.animPulse||0,1.1);notify((remaining+queued)>0?'MANDO CAÍDO · VENTANA DE DAÑO':'ÚLTIMO TENIENTE CAÍDO · NÚCLEO EXPUESTO','#fff09a',1.35);G.particles.push({kind:'shock',x:G.boss.x,y:G.boss.y,r:18,vr:420,life:.6,max:.6,col:'#fff09a'});}G.commanderReinforceT=.75;META.credits=G.credits;notify(`${SECTORS[(e.lieutenantSector||1)-1]?.boss||'TENIENTE'} DESTRUIDO · +¤${reward}`,'#fff09a',1.55);burst(e.x,e.y,'#fff09a',30,235);AudioX.bossDie(Math.max(0,(e.lieutenantSector||G.sector)-1));
}
function updateLieutenantEnemy(e,dt,p){
  e.coreOpenT=Math.max(0,(e.coreOpenT||0)-dt);
  const tempo=1/COMMANDER_DIFFICULTY.tempo,ratio=e.hp/e.maxHp,prevPhase=e.phase;e.phase=ratio>.52?1:2;if(e.phase!==prevPhase)e.phaseFlash=1;e.phaseFlash=Math.max(0,(e.phaseFlash||0)-dt*1.45);e.animAttackT=Math.max(0,(e.animAttackT||0)-dt);e.fireCd-=dt*tempo;e.specialCd-=dt*tempo;e.flash=Math.max(0,e.flash-dt);e.x+=(e.x>W*.78?-e.spd*.58:e.x<W*.56?e.spd*.24:0)*dt;e.y+=Math.sin(e.t*(2.2+e.phase*.25)+e.phase)*(72+e.phase*12)*dt;e.y=clamp(e.y,55,H-55);
  if(e.fireCd<=0){e.fireCd=e.phase===2?.56:.68;const style=['moth','titan','storm','resonance'].includes(e.pattern)?'spread':'aim';enemyShoot(e,style);}
  if(e.specialCd<=0){e.specialCd=e.phase===2?1.85:2.25;const sec=SECTORS[e.lieutenantSector-1]||SECTORS[0];if(['storm','moth','titan','resonance'].includes(e.pattern))ringBullets(e.x,e.y,8+Math.min(6,G.sector)+(e.phase-1)*2,190+G.sector*8,8,sec.accent,e.t,e,'lieutenant_special');else{const a=Math.atan2(p.y-e.y,p.x-e.x);commanderFan(e,e.x,e.y,a,5+e.phase*2,.085,315+e.phase*18,8.5,4,'lieutenant_special',false);}G.particles.push({kind:'shock',x:e.x,y:e.y,r:12,vr:300,life:.42,max:.42,col:sec.accent});}
  if(dist(e,p)<e.r+p.r)hitPlayer(e.contact);
}

function spawnEnemy(forceForm=null,x=null,y=null,entryMode=null){
  let sec=SECTORS[G.sector-1],origin=sec,shipSpawn=false;
  if(!forceForm&&G.sector===10&&Math.random()<.18){origin=SECTORS[rndI(0,8)];}
  else if(!forceForm&&G.sector>1&&Math.random()<(G.sector===2?.08:.12)){origin=SECTORS[G.sector-2];}
  if(!forceForm&&G.sector>=3){const shipChance=G.sector===10?.08:(0.08+Math.max(0,G.sector-3)*0.025);if(Math.random()<shipChance)shipSpawn=true;}
  const form=forceForm||(shipSpawn?pick(SHIP_FORMS.slice(0,Math.min(3,1+Math.floor(G.wave/1.5)))):chooseTieredForm(origin)),fs=FORM_STATS[form]||FORM_STATS.worker,d=difficulty();
  const baseR=15*fs.size+G.sector*.45,manual=x!=null&&y!=null,mode=manual?'summon':(entryMode||chooseSpawnEntry()),pos=manual?{x,y,tx:x,ty:y,t:0}:entryPlacement(mode,baseR);
  const baseHp=(G.sector===1?28:34)+G.sector*12+G.wave*7,bal=sectorBalance();
  const enemyHp=baseHp*fs.hp*d*bal.enemyHp;
  const e={x:pos.x,y:pos.y,ox:pos.y,r:baseR,hp:enemyHp,maxHp:enemyHp,spd:(76+G.sector*4)*fs.spd*(1+(d-1)*.105)*sectorTempo().speed*runDifficulty().enemySpeed,score:fs.score+G.sector*18,
    form,family:shipSpawn?'RECUPERADORES':origin.family,kind:shipSpawn?'ship':'insect',shipClass:shipSpawn?form:null,shipVariant:shipSpawn?(form==='ship_scout'?rndI(0,3):form==='ship_frigate'?rndI(4,7):rndI(8,11)):null,name:shipSpawn?(SHIP_LABELS[form]||'SHIP'):null,move:fs.move,fireCd:fs.fire?rnd(.55,fs.fire*1.1):999,fireRate:fs.fire||999,specialCd:shipSpawn?rnd(1.6,3.2):enemySpecialDelay(form),dashT:0,surgeT:0,surgeVX:0,surgeVY:0,passes:0,t:rnd(0,TAU),phase:rnd(0,TAU),dead:false,slow:0,flash:0,contact:((G.sector===1?11:14)+G.sector*2.0)*bal.enemyDmg*runDifficulty().enemyDamage,
    entryMode:mode,entryT:pos.t||0,entryTX:pos.tx,entryTY:pos.ty,familyTacticCd:rnd(2.0,4.8),familyPulseT:0,familyGuardT:0,cloakT:0,corridorT:0};
  G.enemies.push(e);AudioX.enemySpawn(e);return e;
}
function buildPreBossSetpiece(){
  if(!G)return;const sec=SECTORS[G.sector-1],pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift,ships=IMG.generatedShips||[],spec=activePreBossEscalation();G.preBossSetpieces=[];
  const count=compactUI()?(spec?7:9):(spec?11:14);
  for(let i=0;i<count;i++){
    const useShip=i%4===1||i%7===3,img=useShip?ships[(i*3+G.sector)%Math.max(1,ships.length)]:pack[(i*2+G.sector)%Math.max(1,pack.length)];
    const depth=rnd(.10,.82),lane=i%3;
    G.preBossSetpieces.push({img,x:rnd(W*.42,W*1.08),y:lane===0?rnd(70,H*.34):lane===1?rnd(H*.34,H*.68):rnd(H*.68,H-70),vx:-rnd(18,48),vy:rnd(-7,7),r:rnd(16,40),rot:rnd(0,TAU),spin:rnd(-.38,.38),alpha:rnd(.30,.78),depth,dz:rnd(.075,.13),front:Math.random()<.38,role:'debris',repeat:true,phase:rnd(0,TAU)});
  }
  if(spec){
    // Flyby cinemático: usa el mini animado de la familia actual, sin hitbox ni kills.
    const mini=IMG.ch2EnemyAnim?.[sec.family]?.mini?.idle;
    for(let i=0;i<spec.swarm;i++){
      const lane=(i%3)-1,front=i%4===0;
      G.preBossSetpieces.push({img:mini,sheetFrame:128,x:W+rnd(30,W*.45)+i*22,y:H*.5+lane*H*.17+rnd(-24,24),vx:-rnd(115,185),vy:rnd(-9,9),r:rnd(14,22),rot:rnd(-.10,.10),spin:rnd(-.08,.08),alpha:rnd(.36,.66),depth:rnd(.34,.78),dz:0,front,role:'swarm',repeat:true,phase:rnd(0,TAU)});
    }
    // Una silueta mayor cruza una sola vez como presagio del linaje del boss.
    const elite=IMG.worldEnemies?.[sec.family]?.[2];
    G.preBossSetpieces.push({img:elite,x:W*1.12,y:H*.5+rnd(-H*.13,H*.13),vx:-rnd(68,92),vy:rnd(-4,4),r:compactUI()?42:58,rot:0,spin:0,alpha:.44,depth:.72,dz:0,front:true,role:'elite',repeat:false,phase:rnd(0,TAU),label:spec.elite});
  }
}
function updatePreBossSetpiece(dt){
  for(const o of G.preBossSetpieces||[]){if(o.hidden)continue;o.phase=(o.phase||0)+dt;const role=o.role||'debris';o.depth=Math.min(1.12,o.depth+(o.front?o.dz:0)*dt);const speed=(1+o.depth*1.8);o.x+=o.vx*dt*(role==='swarm'?1:speed);o.y+=o.vy*dt*speed;if(role==='swarm')o.y+=Math.sin(o.phase*5+(o.r||0))*(10+o.depth*8)*dt;else if(role==='elite')o.y+=Math.sin(o.phase*1.8)*6*dt;o.rot+=o.spin*dt*speed;if(o.x<-140||o.depth>1.08){if(o.repeat===false){o.hidden=true;continue;}o.x=W+rnd(40,220);o.y=rnd(70,H-70);o.depth=role==='swarm'?rnd(.28,.72):rnd(.08,.30);}}
}
function drawPreBossSetpiece(){
  if(!(G.preBossT>0))return;const sec=SECTORS[G.sector-1],progress=preBossProgress();cx.save();for(const o of G.preBossSetpieces||[]){if(o.hidden||!imgReady(o.img))continue;cx.save();cx.translate(o.x,o.y);cx.rotate(o.rot);const z=o.front?(.45+Math.pow(o.depth,2.1)*1.65):(.72+o.depth*.35),role=o.role||'debris';cx.globalAlpha=clamp(o.alpha*(.65+o.depth*.55)*(role==='elite'?(.55+.45*Math.sin(Math.min(1,progress)*Math.PI)):1),.12,.92);cx.shadowColor=hexA(sec.accent,role==='elite'?.72:.45);cx.shadowBlur=role==='elite'?18:role==='swarm'?7:(o.front?4+o.depth*14:0);const d=o.r*2.5*z;
    if(o.sheetFrame){const fw=o.sheetFrame,fh=o.sheetFrame,sc=d/fw;cx.drawImage(o.img,0,0,fw,fh,-fw*sc/2,-fh*sc/2,fw*sc,fh*sc);}else{const sc=Math.min(d/o.img.naturalWidth,d/o.img.naturalHeight);cx.drawImage(o.img,-o.img.naturalWidth*sc/2,-o.img.naturalHeight*sc/2,o.img.naturalWidth*sc,o.img.naturalHeight*sc);}cx.restore();}cx.restore();
}
function drawPreBossEscalationFx(){
  const spec=activePreBossEscalation();if(!spec||!(G.preBossT>0)||performanceAmbientFactor()<.42)return;const p=preBossProgress(),a=clamp((p-.12)/.88,0,1),col=spec.tint||SECTORS[G.sector-1].accent,t=G.elapsed||0;cx.save();cx.globalAlpha=.12+.16*a;cx.strokeStyle=col;cx.fillStyle=hexA(col,.08);cx.lineWidth=1.5;
  const motif=spec.motif;
  if(motif==='orbit'){for(let i=0;i<3;i++){cx.beginPath();cx.ellipse(W*.73,H*.5,W*(.10+i*.055)*(1+.03*Math.sin(t*2+i)),H*(.16+i*.045),t*.18*(i%2?1:-1),0,TAU);cx.stroke();}}
  else if(motif==='lance'){for(let i=0;i<5;i++){const y=H*(.18+i*.16);cx.beginPath();cx.moveTo(W*.58,y);cx.lineTo(W*.98,y+Math.sin(t*4+i)*18);cx.stroke();}}
  else if(motif==='clamp'){cx.lineWidth=4;cx.beginPath();cx.arc(W*.72,H*.18,W*.20,0,Math.PI);cx.stroke();cx.beginPath();cx.arc(W*.72,H*.82,W*.20,Math.PI,TAU);cx.stroke();}
  else if(motif==='lumen'){for(let i=0;i<7;i++){const ang=t*.35+i*TAU/7,x=W*.72+Math.cos(ang)*W*.14,y=H*.5+Math.sin(ang)*H*.24;cx.beginPath();cx.arc(x,y,3+i%2*2,0,TAU);cx.fill();if(i){const pa=t*.35+(i-1)*TAU/7;cx.beginPath();cx.moveTo(W*.72+Math.cos(pa)*W*.14,H*.5+Math.sin(pa)*H*.24);cx.lineTo(x,y);cx.stroke();}}}
  else if(motif==='acid'){for(let i=0;i<6;i++){const x=W*(.55+i*.075),y=H*(.18+.62*((i*37)%100)/100);cx.beginPath();cx.arc(x,y+Math.sin(t*2+i)*8,8+i%3*3,0,TAU);cx.fill();}}
  else if(motif==='veil'){for(let i=0;i<4;i++){cx.beginPath();cx.arc(W*.72,H*.5,W*(.10+i*.05),-.8+t*.08+i*.3,2.2+t*.08+i*.3);cx.stroke();}}
  else if(motif==='mirror'){for(let i=0;i<7;i++){const x=W*(.58+i*.055),y=H*(.22+((i*31)%60)/100);cx.save();cx.translate(x,y);cx.rotate(t*.15+i*.7);cx.strokeRect(-10,-22,20,44);cx.restore();}}
  else if(motif==='vortex'){for(let i=0;i<4;i++){cx.beginPath();cx.ellipse(W*.72,H*.58,W*(.08+i*.045),H*(.04+i*.024),t*.12,0,TAU);cx.stroke();}}
  else if(motif==='razor'){for(let i=0;i<4;i++){const y=H*(.26+i*.16);cx.beginPath();for(let x=W*.55,j=0;x<W*.96;x+=W*.045,j++){const yy=y+(j%2?12:-12)+Math.sin(t*6+i)*4;j?cx.lineTo(x,yy):cx.moveTo(x,yy);}cx.stroke();}}
  else if(motif==='hive'){const size=Math.max(24,Math.min(42,W*.034));for(let row=0;row<3;row++)for(let c=0;c<5;c++){const x=W*.60+c*size*1.55+(row%2)*size*.78,y=H*.30+row*size*1.35;cx.beginPath();for(let k=0;k<6;k++){const ang=Math.PI/3*k+Math.PI/6,xx=x+Math.cos(ang)*size*.48,yy=y+Math.sin(ang)*size*.48;k?cx.lineTo(xx,yy):cx.moveTo(xx,yy);}cx.closePath();cx.stroke();}}
  const pulse=.035+.045*a*(.5+.5*Math.sin(t*(4+2*a)));cx.globalAlpha=1;cx.fillStyle=hexA(col,pulse);cx.fillRect(0,0,W,H);cx.restore();
}
function preBossCue(stage){
  const sec=SECTORS[G.sector-1],spec=activePreBossEscalation();if((G.preBossCueStage||0)>=stage)return;G.preBossCueStage=stage;
  if(spec){const text=spec.cues?.[stage-1]||spec.label;if(stage===1){notify(`${spec.label} · ${text}`,sec.accent,.95);microSwarmBuzz();for(let i=0;i<4;i++)G.particles.push({kind:'halo',x:W*(.60+i*.08),y:H*(.28+i*.14),r:10,vr:145,life:.50,max:.50,col:spec.tint});}
    if(stage===2){notify(text,spec.tint,1.0);microSwarmBuzz();shake=Math.max(shake,2.5);}
    if(stage===3){notify(text,'#ffcf73',1.05);AudioX.bossWarn(G.sector-1);shake=Math.max(shake,5);G.particles.push({kind:'shock',x:W*.74,y:H*.5,r:18,vr:410,life:.62,max:.62,col:spec.tint});}
    if(stage===4){notify(text,'#fff09a',.95);AudioX.bossPhase(G.sector-1);shake=Math.max(shake,7);if(G.player.shield/G.player.maxShield<.42)spawnPickup(clamp(G.player.x+92,90,W-90),clamp(G.player.y-44,65,H-65),'shield');}
    return;
  }
  if(stage===1){notify('CORREDOR FINAL · RESTOS DE BATALLA ENTRANTES',sec.accent,.78);for(let i=0;i<3;i++)G.particles.push({kind:'halo',x:W*(.58+i*.10),y:H*(.30+i*.18),r:12,vr:150,life:.55,max:.55,col:sec.accent});}
  if(stage===2){notify(`SEÑAL BIOLÓGICA · ${sec.boss}`,'#ffcf73',.88);shake=Math.max(shake,4);}
  if(stage===3){notify('ARENA FIJADA · PREPÁRATE','#fff09a',.62);if(G.player.shield/G.player.maxShield<.42)spawnPickup(clamp(G.player.x+92,90,W-90),clamp(G.player.y-44,65,H-65),'shield');}
}

function startPreBossSequence(duration=null){
  const spec=preBossEscalationSpec(G?.sector||0),cinematic=duration==null&&!!spec&&G?.mode==='campaign';
  streamPrepareBoss(G?.sector||0,'preboss');
  if(!G||G.boss||G.bossPending||G.sectorClear)return;
  const actual=Math.max(.8,cinematic?spec.duration:(duration??PREBOSS_DURATION));
  G.bossPending=true;G.preBossT=actual;G.preBossMax=actual;G.preBossCueStage=0;G.preBossEscalationActive=cinematic;G.preBossEscalationId=cinematic?spec.id:'';G.worldEventTimer=999;
  G.enemies.length=0;G.eBullets.length=0;G.frontThreats.length=0;G.obstacles.length=0;G.frenzyT=0;
  if(!PreBossX.playing()&&!PreBossX.fallbackSynth&&G.mode!=='bossRush')PreBossX.start(G.sector);
  buildPreBossSetpiece();
  spawnPickup(clamp(G.player.x+92,90,W-90),clamp(G.player.y-32,65,H-65),'shield');
  if(G.player.hp<G.player.maxHp*.72)spawnPickup(clamp(G.player.x+118,90,W-90),clamp(G.player.y+36,65,H-65),'heal');
  for(let i=0;i<2;i++)spawnPickup(clamp(G.player.x+72+i*34,90,W-90),clamp(G.player.y+rnd(-55,55),65,H-65),'credit');
  const sec=SECTORS[G.sector-1];notify(cinematic?`${spec.label} · ${sec.boss} · ${actual.toFixed(1)}s`:`APROXIMACIÓN AL JEFE · ${sec.boss} · ${Math.ceil(actual)}s`,sec.accent,1.20);
}
function spawnBoss(){
  if(G.boss)return;const preEsc=activePreBossEscalation();streamPrepareBoss(G?.sector||0,'spawn-boss');G.preBossT=0;G.preBossMax=0;G.preBossEscalationActive=false;const sec=SECTORS[G.sector-1],d=difficulty();G.bossStartElapsed=G.elapsed||0;G.bossFamilySwarmTimer=G.sector>=11?rnd(3.6,5.2):0;G.familyBossResponses=0;
  const endurance=G.mode==='training'?1:bossEnduranceMult(G.sector);
  const bossGrowth=1.10+Math.min(10,G.sector)*.040+Math.max(0,G.sector-10)*.015,maxHp=((1040+G.sector*610)*d)*bossGrowth*sectorBalance().bossHp*BOSS_TOUGHNESS_MULT*BOSS_STANDARD.hp*runDifficulty().bossHp*endurance*COMMANDER_DIFFICULTY.hp;
  const pressure=bossPressureProfile(G.sector);
  G.boss={x:W+120,y:H*.5,r:58+G.sector*2.6,hp:maxHp,maxHp,pattern:sec.pattern,name:sec.boss,family:sec.family,t:0,fire:.7,phase:1,dead:false,entry:preEsc?.entry||2.2,entryMax:preEsc?.entry||2.2,vx:-90,
    telegraph:'',telegraphT:0,specialT:0,specialCd:G.sector===1?2.55:(G.sector>=6?3.15:3.45),guardT:0,chargeT:0,chargeVX:0,chargeVY:0,animAttackT:0,animPulse:0,wingT:0,phaseFlash:0,altNext:false,arenaCd:G.sector===1?3.55:(G.sector>=6?4.15:4.55),signatureCd:G.sector===1?rnd(1.85,2.85):rnd(G.sector>=6?2.3:2.6,G.sector>=6?3.7:4.1),signatureT:0,imperialEscortCd:G.sector===1?5.8:999,stamina:pressure.stamina*COMMANDER_DIFFICULTY.stamina,staminaMax:pressure.stamina*COMMANDER_DIFFICULTY.stamina,bossSupportCd:pressure.support,signatureSide:Math.random()<.5?-1:1,anchorX:W*.68,anchorY:H*.5,afterimageT:0,phaseTransitionT:0,phaseElapsed:0,phaseGateWarned:false,coreOpenT:0,damageStage:0,dying:false,deathT:0,arrivalStage:0,arrivalPulseT:0};
  if(G.mode==='bossRush'){const mult=.72+(G.sector-1)*.055;G.boss.maxHp=maxHp*mult;G.boss.hp=G.boss.maxHp;G.boss.specialCd=Math.max(1.45,2.8-G.sector*.09);G.boss.arenaCd=Math.max(2.4,4.4-G.sector*.15);}
  if(G.bossCheckpoint){G.boss.hp=maxHp*.5;G.boss.phase=2;G.boss.specialCd=1.35;G.boss.altNext=true;setTimeout(()=>{if(G?.screen==='GAME'&&G?.boss&&!G.boss.dead){prepareCommanderConvergence(true);deployCommanderConvergence(true);}},650);}if(G.mode==='training'){G.trainingBoss=true;G.boss.hp=maxHp*.32;G.boss.maxHp=G.boss.hp;G.boss.r*=.88;}if(G.mode!=='training')hiveStartBoss(G.boss);
  G.enemies.length=0;G.eBullets.length=0;G.frontThreats.length=0;G.ambientProps.length=0;G.bossPending=false;G.frenzyT=0;AudioX.bossIntro(G.sector-1);MusicX.onBossAppear(G.sector);const identity=bossIdentity();if(preEsc)G.bossArrivalBanner={name:sec.boss,family:sec.family,subtitle:identity?.signature||preEsc.label,color:sec.accent,t:Math.max(2.3,preEsc.entry),max:Math.max(2.3,preEsc.entry)};notify(`${G.mode==='training'?'SIMULACIÓN DE JEFE':'ALERTA BIOLÓGICA'} · ${sec.boss}${identity?' · '+identity.signature:''}`,'#ffcf73',3);shake=8;
}

function spawnObstacle(){
  const sec=SECTORS[G.sector-1],type=pick(sec.obstacles||['spire']);
  const baseSize={spire:[38,62],mine:[18,26],drone:[24,34],acidpod:[26,42],spore:[22,34],pillar:[32,54],shard:[20,34],gate:[42,68],cocoon:[28,42],dustpod:[24,36],spike:[18,28],nest:[34,54],bulwark:[42,68],seed:[24,38],hopperrock:[30,50],bloodcapsule:[28,42],bloodsac:[26,40],bloodmembrane:[34,52],bloodwreck:[30,48],resincolumn:[36,58],resinpanel:[32,50],resinwall:[42,66],resinnode:[28,44],prismcrystal:[30,46],iontower:[34,54],stormdebris:[28,46],electricnode:[24,40],sonicring:[28,44],sonicbell:[32,50],resonator:[30,48],acousticfragment:[34,54]}[type]||[26,40],size=rnd(baseSize[0],baseSize[1]);
  const hpScale={mine:.65,spore:.7,dustpod:.8,shard:.75,drone:.9,gate:1.4,pillar:1.8,bulwark:1.9,nest:1.5,hopperrock:1.3,spire:1.4,acidpod:1.1,seed:.9,cocoon:1.0,spike:.75,bloodcapsule:1.0,bloodsac:.9,bloodmembrane:1.2,bloodwreck:1.1,resincolumn:1.6,resinpanel:1.25,resinwall:1.9,resinnode:1.35,prismcrystal:1.1,iontower:1.4,stormdebris:.9,electricnode:1.0,sonicring:1.0,sonicbell:1.4,resonator:1.5,acousticfragment:1.2}[type]||1;
  const speedScale={mine:1.18,shard:1.28,drone:1.1,spore:1.05,gate:.82,pillar:.7,bulwark:.68,nest:.74,hopperrock:.9,seed:1.05,bloodcapsule:1.02,bloodsac:1.08,bloodmembrane:.8,bloodwreck:.95,resincolumn:.68,resinpanel:.78,resinwall:.62,resinnode:.82,prismcrystal:1.15,iontower:.78,stormdebris:1.22,electricnode:1.05,sonicring:1.0,sonicbell:.8,resonator:.76,acousticfragment:.96}[type]||1,hp=(92+G.sector*34)*hpScale;
  const edge=Math.random(),speed=(82+G.sector*4)*speedScale;let x,y,vx,vy,entry='right';
  if(edge<.66){x=W+size+20;y=rnd(72,H-72);vx=-speed;vy=rnd(-10,10);}
  else if(edge<.83){entry='top';x=rnd(W*.28,W*.94);y=-size-18;vx=-speed*.36;vy=speed*.82;}
  else{entry='bottom';x=rnd(W*.28,W*.94);y=H+size+18;vx=-speed*.36;vy=-speed*.82;}
  G.obstacles.push({x,y,r:size,type,hp,maxHp:hp,vx,vy,entry,rot:rnd(0,TAU),t:0,col:sec.base,contact:10+G.sector*2.3,assetIndex:obstacleAssetIndex(sec,type)});
}
function spawnPickup(x,y,type='credit',key=null){
  if(type==='credit'&&G.pickups){
    const near=G.pickups.find(q=>q.type==='credit'&&q.life>0&&dist(q,{x,y})<58&&(q.value||1)<6);
    if(near){near.value=(near.value||1)+1;near.life=Math.max(near.life,12);near.vx+=rnd(-6,6);near.vy+=rnd(-8,8);return near;}
  }
  const q={x,y,vx:rnd(-20,35),vy:rnd(-55,55),r:type==='power'?15:type==='fragment'||type==='weaponBoost'?12:10,type,key,t:0,life:16,value:1};G.pickups.push(q);return q;
}
function resetEmergencyHealthDrops(){if(G)G.emergencyHealthDrops={half:false,quarter:false,critical:false};}
function maybeCriticalHealthDrop(e){
  if(!G?.player||G.mode==='training')return false;const p=G.player,ratio=p.hp/Math.max(1,p.maxHp),st=G.emergencyHealthDrops||(G.emergencyHealthDrops={half:false,quarter:false,critical:false});let key=null,fraction=0;
  if(ratio<=.10&&!st.critical){key='critical';fraction=.52;st.critical=st.quarter=st.half=true;}
  else if(ratio<=.25&&!st.quarter){key='quarter';fraction=.38;st.quarter=st.half=true;}
  else if(ratio<=.50&&!st.half){key='half';fraction=.27;st.half=true;}
  if(!key)return false;const q=spawnPickup(e.x,e.y,'heal');q.healFraction=fraction;q.emergency=true;q.life=22;notify(`✚ BIO-REPARACIÓN ${key==='critical'?'CRÍTICA':key==='quarter'?'ALTA':'TÁCTICA'} · RECOGE EL NÚCLEO`,'#ff7791',1.45);return true;
}
function maybeDrop(e){
  const emergency=maybeCriticalHealthDrop(e),r=Math.random(),ship=e&&e.kind==='ship';if(!emergency){if(r<(ship?.32:.22))spawnPickup(e.x,e.y,'credit');else if(r<(ship?.36:.255))spawnPickup(e.x,e.y,'heal');else if(r<(ship?.40:.29))spawnPickup(e.x,e.y,'shield');}
  G.powerMeter+=1;if(G.powerMeter>=powerDropThreshold()){
    G.powerMeter=0;
    if((G.powerDropsThisSector||0)<powerDropBudget())spawnPowerReward(e.x,e.y);
    else if(Math.random()<.62)spawnPickup(e.x,e.y,'fragment');else spawnPickup(e.x,e.y,Math.random()<.58?'credit':'shield');
  }
}
function recycleOverflowPower(key,rank=1){
  const lvl=up('recycler'),base=18+(G?.sector||1)*4+rank*5,mult=1+lvl*.28,credits=Math.round(base*mult),xp=Math.round((10+rank*4+(G?.sector||1)*2)*(1+lvl*.20));
  grantCredits(credits,'power_overflow',true);grantRewardXp(xp,'power_overflow');chargeRiftApex(rank,key,.72);
  if(lvl>0&&G?.player){G.player.shield=Math.min(G.player.maxShield,G.player.shield+G.player.maxShield*(lvl*.03));G.particles.push({kind:'shieldwave',x:G.player.x,y:G.player.y,r:10,vr:260+lvl*35,life:.42,max:.42,col:'#9fe6ff'});}
  AudioX.queue();notify(`♻ RESERVA LLENA · ${POWERS[key]?.icon||'✦'} RECICLADO +¤${credits} +${xp} XP`,'#9fe6ff',1.8);
}
function overflowPowerActive(){return !!(G?.overflowPowerKey&&powerOn(G.overflowPowerKey));}
function tryActivateOverflowPower(key,rank,duration){
  const lvl=up('overclock');if(!G||lvl<=0||overflowPowerActive()||INSTANT_POWERS.has(key))return false;const frac=.35+lvl*.10,secs=Math.max(4.5,duration*frac);G.powers[key]=secs;G.overflowPowerKey=key;G.overflowPowerMax=secs;const p=POWERS[key],vis=powerVisual(key,rank);AudioX.power(key);G.particles.push({kind:'shock',x:G.player.x,y:G.player.y,r:10,vr:720+lvl*90,life:.55,max:.55,col:'#fff09a'});burst(G.player.x,G.player.y,vis.accent,24+lvl*6,210);notify(`⚡ SOBREFLUJO · PODER EXTRA · ${p.icon} ${p.name} ${powerVisualTag(key,rank)} · ${Math.ceil(secs)}s`,'#fff09a',2.0);updateComboState();return true;
}
function activatePower(key,source='pickup',heritageSeconds=null){
  const p=POWERS[key];if(!p)return;G.powerRanks=G.powerRanks||{};const cap=powerRankCap(),wasRank=G.powerRanks[key]||0;let rank=wasRank;
  if(source==='heritage')rank=Math.max(rank,Math.min(cap,2));
  else if(source==='pickup'||source==='shop'){rank=rank?Math.min(cap,rank+1):1;}
  else if(!rank)rank=1;
  G.powerRanks[key]=rank;const saturatedDuplicate=(source==='pickup'||source==='shop')&&wasRank>=cap;
  if(INSTANT_POWERS.has(key)){triggerBomb(rank);notify(`${p.icon} ${p.name} ${rankRoman(rank)} · DETONACIÓN`,p.color,1.5);return;}
  const durationBase=heritageSeconds!=null?heritageSeconds:p.duration,duration=durationBase*POWER_DURATION_MULT*(1+up('reactor')*.05)*(1+(rank-1)*.09)*doctrineDurationMult();
  if(G.powers[key]){const extension=duration*.45,capSeconds=p.duration*POWER_DURATION_MULT*(1+up('reactor')*.05)*doctrineDurationMult()*(1.70+(rank>=4?.10:0)+(rank>=5?.10:0)+(rank>=6?.12:0)+(rank>=7?.12:0));G.powers[key]=Math.min(capSeconds,(G.powers[key]||0)+extension);if(key==='resinwall')G.resinCharges=Math.min(6,(G.resinCharges||0)+1);AudioX.power(key);notify(`${p.icon} ${p.name} ${rankRoman(rank)} · ${Math.ceil(G.powers[key])}s`,p.color,1.8);burst(G.player.x,G.player.y,p.color,18+rank*2,140);powerActivationVfx(key);if(saturatedDuplicate)chargeRiftApex(rank,key,1);updateComboState();return;}
  if((G.powerQueue||[]).includes(key)){if(saturatedDuplicate)chargeRiftApex(rank,key,.65);AudioX.queue();notify(`COLA MEJORADA · ${p.icon} ${p.name} ${rankRoman(rank)}`,p.color,1.6);return;}
  if(countActivePowers()>=G.maxActivePowers){if((G.powerQueue||[]).length>=G.maxQueuePowers){if(tryActivateOverflowPower(key,rank,duration))return;recycleOverflowPower(key,rank);return;}G.powerQueue.push(key);AudioX.queue();notify(`EN COLA · ${p.icon} ${p.name} ${powerVisualTag(key,rank)}`,powerVisual(key,rank).accent,1.8);return;}
  G.powers[key]=duration;if(key==='shield')G.player.shield=Math.min(G.player.maxShield,G.player.shield+30+rank*8+(branchIs('shield','B')?25:0));if(key==='resinwall')G.resinCharges=1+rank+(branchIs('resinwall','A')?2:0);const vis=powerVisual(key,rank);AudioX.power(key);notify(`${source==='heritage'?'HERENCIA · ':''}${p.icon} ${p.name} ${powerVisualTag(key,rank)}${powerEvolutionLabel(rank)?' · '+powerEvolutionLabel(rank):''} · ${Math.ceil(G.powers[key])}s`,vis.accent,2.1);burst(G.player.x,G.player.y,vis.accent,20+rank*2+(rank>=6?6:0),140+(rank>=6?30:0));powerActivationVfx(key);updateComboState();
}
function powerOn(key){return (G.powers[key]||0)>0;}

function firePlayer(){
  const p=G.player,target=findTarget();if(!target)return;const dx=target.x-p.x,dy=target.y-p.y,ang=Math.atan2(dy,dx),lv=G.level||1,tr=powerOn('twin')?powerRank('twin'):0,br=powerOn('burst')?powerRank('burst'):0,comboBurst=G.activeCombos[comboId('overdrive','twin')]?1.18:1,baseDmg=24*(1+up('damage')*.10)*(1+weaponLevelBonus(lv))*(1+weaponSectorBonus(G.sector))*comboBurst*(1+(tr+br)*.028)*(powerOn('twin')&&branchIs('twin','A')?1.18:1);
  const speed=720+Math.min(220,lv*16);let shots=[0];
  if(powerOn('prismburst')){const pr=powerRank('prismburst');shots=pr>=7?[-.36,-.27,-.18,-.09,0,.09,.18,.27,.36]:pr>=5?[-.32,-.21,-.10,0,.10,.21,.32]:pr>=3?[-.28,-.14,0,.14,.28]:pr>=2?[-.18,-.09,0,.09,.18]:[-.12,0,.12];if(branchIs('prismburst','A')&&pr>=5&&shots.length<9)shots=[-.38,...shots,.38];}else if(G.activeCombos[comboId('rail','twin')]||G.activeCombos[comboId('burst','twin')]||tr>=3||br>=3)shots=(tr>=7||br>=7)?[-.36,-.27,-.18,-.09,0,.09,.18,.27,.36]:(tr>=5||br>=5)?[-.30,-.20,-.10,0,.10,.20,.30]:[-.24,-.12,0,.12,.24];else if(powerOn('twin'))shots=branchIs('twin','B')?[-.24,-.12,0,.12,.24]:branchIs('twin','A')?[-.09,0,.09]:[-.13,0,.13];else if(powerOn('burst'))shots=br>=2?[-.13,0,.13]:[-.09,0,.09];
  const tier=lv>=10?3:lv>=6?2:lv>=3?1:0,baseCol=powerOn('prismburst')?'#78ecff':powerOn('burst')?'#ffbf8d':tier>=3?'#e8fdff':tier===2?'#a8f7ff':'#78f4ff';
  for(const off of shots){const a=ang+off,rr=4+tier*.7;{const visualKey=powerOn('prismburst')?'prismburst':powerOn('twin')?'twin':powerOn('burst')?'burst':null,bullet={x:p.x+Math.cos(a)*25,y:p.y+Math.sin(a)*25,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:rr,dmg:baseDmg*(shots.length>1?(shots.length>=9?.43:shots.length>=5?.52:.76):1),life:1.7,col:baseCol,type:tier>=3?'spark':tier>=2?'pulse':'needle',pierce:(G.activeCombos[comboId('rail','twin')]?1:0)+(tr>=3?1:0)+(powerOn('prismburst')?powerRank('prismburst')+(branchIs('prismburst','B')?2:0):0)+(lv>=10&&Math.random()<.2?1:0),slow:powerOn('cryo')?.34:0,splash:powerOn('acid')?42+powerRank('acid')*8:0,trail:16+tier*10,core:tier};G.bullets.push(visualKey?stampPowerProjectile(bullet,visualKey,powerRank(visualKey)):bullet);}}
  const muzzleX=p.x+Math.cos(ang)*28,muzzleY=p.y+Math.sin(ang)*28;G.particles.push({kind:'muzzle',x:muzzleX,y:muzzleY,a:ang,r:5+tier*2,life:.09,max:.09,col:baseCol});if(tier>=2&&Math.random()<.45)G.particles.push({kind:'spark',x:muzzleX,y:muzzleY,vx:rnd(-40,70),vy:rnd(-60,60),r:1.5,life:.14,max:.14,col:'#d8fbff'});AudioX.shot();
}
function findTarget(){
  let best=null,bd=1e9;const p=G.player;
  if(G.boss&&!G.boss.dead){best=G.boss;bd=dist(p,G.boss);}
  for(const n of G.objectiveTargets||[]){if(n.dead)continue;const d=dist(p,n)*.72;if(d<bd){bd=d;best=n;}}
  for(const f of G.frontThreats||[]){const urgency=1-clamp(f.t/f.duration,0,1),d=dist(p,f)*(.55+urgency*.35);if(d<bd){bd=d;best=f;}}
  for(const e of G.enemies){if(e.dead||e.microSwarm)continue;const d=dist(p,e);if(d<bd){bd=d;best=e;}}
  for(const o of G.obstacles){const d=dist(p,o);if(d<bd*.82){bd=d;best=o;}}
  if(!best)for(const e of G.enemies){if(e.dead||!e.microSwarm)continue;const d=dist(p,e);if(d<bd){bd=d;best=e;}}
  return best;
}
function fireMissile(){
  const t=findTarget();if(!t)return;const p=G.player,rank=powerRank('missile'),shotCap=(rank>=7?8:rank>=6?7:6)+(branchIs('missile','A')?1:0),shots=Math.min(shotCap,Math.max(rank+(rank>=4?1:0)+(branchIs('missile','A')?1:0),G.activeCombos[comboId('gravity','missile')]?2:1));
  for(let i=0;i<shots;i++){const off=(i-(shots-1)/2)*14;G.bullets.push(stampPowerProjectile({x:p.x+14,y:p.y+off,vx:350+rank*22,vy:rnd(-35,35)+off*2,r:6.5+rank*.5,dmg:58*(1+rank*.18)*(1+up('damage')*.08)*(1+(G.level-1)*.05),life:3,col:'#ff8a53',type:'missile',homing:true,target:t,pierce:0,splash:((G.activeCombos[comboId('gravity','missile')]?70:50)+rank*8+(rank>=6?12:0)+(rank>=7?12:0))*(branchIs('missile','B')?1.28:1)},'missile',rank));}
}
function fireRail(){
  const t=findTarget();if(!t)return;const p=G.player,a=Math.atan2(t.y-p.y,t.x-p.x),rank=powerRank('rail'),offs=rank>=7?[-.085,-.042,0,.042,.085]:rank>=6?[-.065,-.022,.022,.065]:rank>=5?[-.055,0,.055]:rank>=4?[-.035,.035]:[0];for(const off of offs){const aa=a+off;G.bullets.push(stampPowerProjectile({x:p.x,y:p.y,vx:Math.cos(aa)*(1080+rank*60),vy:Math.sin(aa)*(1080+rank*60),r:4.5+rank*.6,dmg:92*(1+rank*.20)*(1+up('damage')*.08)*(offs.length>1?.58:1)*(branchIs('rail','A')?1.16:1),life:1.05,col:'#73ffd1',type:'rail',pierce:3+rank+(branchIs('rail','A')?1:0),splash:0},'rail',rank));}shake=Math.max(shake,2.5+rank*.6);AudioX.sparkLaser();
}
function teslaPulse(){
  const rank=powerRank('tesla'),count=(G.activeCombos[comboId('cryo','tesla')]?5:3)+rank+(branchIs('tesla','A')?2:0);const candidates=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(G.player,a)-dist(G.player,b)).slice(0,count);if(!candidates.length)return;
  let prev=G.player,last=null;for(const e of candidates){const dmg=(28+rank*7)*(1+up('damage')*.07);damageEntity(e,dmg,'tesla');if((G.activeCombos[comboId('cryo','tesla')]||rank>=3)&&e!==G.boss)e.slow=Math.max(e.slow,1.3+rank*.26);G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.12,max:.12,col:powerVisual('tesla',rank).accent});prev=e;last=e;}if(rank>=4&&last){const radius=58+rank*10;G.particles.push({kind:'shock',x:last.x,y:last.y,r:8,vr:300,life:.32,max:.32,col:'#a9fbff'});for(const e of G.enemies){if(e!==last&&!e.dead&&dist(last,e)<radius)damageEntity(e,12+rank*4,'tesla');}}
}
function gravityPulse(){
  const p=G.player,rank=powerRank('gravity'),acidCombo=G.activeCombos[comboId('acid','gravity')],radius=((acidCombo?245:205)+rank*35)*(branchIs('gravity','A')?1.22:1);G.particles.push({kind:'ring',x:p.x,y:p.y,r:10,vr:520+rank*45,life:.45,max:.45,col:acidCombo?'#b8ff77':'#b58cff'});
  for(const e of G.enemies){if(dist(p,e)<radius){e.x=lerp(e.x,p.x,.14+rank*.02);e.y=lerp(e.y,p.y,.14+rank*.02);damageEntity(e,(18+rank*8)*(1+up('damage')*.08),acidCombo?'acid':'gravity');}}
  if(G.boss&&dist(p,G.boss)<radius+40)damageEntity(G.boss,(28+rank*9)*(1+up('damage')*.07),acidCombo?'acid':'gravity');if(rank>=4){for(const b of G.eBullets){if(Math.hypot(b.x-p.x,b.y-p.y)<radius*(rank>=7?.96:rank>=6?.90:rank>=5?.82:.58)&&Math.random()<(rank>=7?.96:rank>=6?.86:rank>=5?.72:.42))b.life=0;}}
}
function resonancePulse(){const p=G.player,rank=powerRank('resonance'),radius=(150+rank*35)*(branchIs('resonance','A')?1.22:1);G.particles.push({kind:'shock',x:p.x,y:p.y,r:8,vr:460+rank*45,life:.55,max:.55,col:powerVisual('resonance',rank).accent});for(const e of G.enemies){if(!e.dead&&dist(p,e)<radius){damageEntity(e,22+rank*11,'resonance');e.x+=Math.sign(e.x-p.x||1)*(14+rank*5);}}if(G.boss&&dist(p,G.boss)<radius+60)damageEntity(G.boss,20+rank*9,'resonance');for(const b of G.eBullets){if(Math.hypot(b.x-p.x,b.y-p.y)<radius){b.life=0;}}AudioX.tone(190+rank*35,.12,.025,'sine',0,120);}
function sparkLaserPulse(){
  const rank=powerRank('sparklaser'),p=G.player,t=findTarget();if(!t)return;const combo=G.activeCombos[comboId('sparklaser','tesla')],prism=G.activeCombos[comboId('prismburst','sparklaser')];
  const dmg=(13+rank*4.5)*(1+up('damage')*.055)*(prism?1.12:1)*(branchIs('sparklaser','B')?1.18:1);damageEntity(t,dmg,'laser');G.particles.push({kind:'arc',x:p.x+20,y:p.y,x2:t.x,y2:t.y,life:.10,max:.10,col:prism?'#d9ffff':'#8ffcff'});
  if(rank>=4||combo){const candidates=[...G.enemies].filter(e=>!e.dead&&e!==t).sort((a,b)=>dist(t,a)-dist(t,b)).slice(0,(rank>=7?4:rank>=6?3:rank>=5?2:1)+(branchIs('sparklaser','A')?1:0));let prev=t;for(const e of candidates){damageEntity(e,dmg*(combo?.72:.55),'tesla');G.particles.push({kind:'arc',x:prev.x,y:prev.y,x2:e.x,y2:e.y,life:.10,max:.10,col:'#a9fbff'});prev=e;}}
  AudioX.sparkLaser();
}
function fireBioShot(){
  const rank=powerRank('bio'),p=G.player,t=findTarget();if(!t)return;const a=Math.atan2(t.y-p.y,t.x-p.x),plague=!!G.activeCombos[comboId('acid','bio')];
  G.bullets.push(stampPowerProjectile({x:p.x+18,y:p.y,vx:Math.cos(a)*(520+rank*25),vy:Math.sin(a)*(520+rank*25),r:5+rank*.35,dmg:(30+rank*7)*(1+up('damage')*.055),life:1.8,col:plague?'#baff68':'#88ff70',type:'bio',pierce:(rank>=7?4:rank>=6?3:rank>=5?2:rank>=4?1:0)+(branchIs('bio','A')?1:0),splash:plague?(38+rank*5)*(branchIs('bio','B')?1.30:1):0,bio:2.4+rank*.35,bioRank:rank},'bio',rank));
  AudioX.tone(245+rank*22,.055,.015,'triangle',0,80);
}
function bioBurst(e){
  const rank=e.bioRank||1,radius=(58+rank*12)*(branchIs('bio','B')?1.30:1),dmg=18+rank*7,sym=!!G.activeCombos[comboId('bio','hemadrain')];G.particles.push({kind:'shock',x:e.x,y:e.y,r:8,vr:260+rank*30,life:.36,max:.36,col:'#8dff6c'});for(const other of G.enemies){if(other!==e&&!other.dead&&dist(e,other)<radius){damageEntity(other,dmg,'bio');if(rank>=4){other.bio=Math.max(other.bio||0,1.6);other.bioRank=Math.max(other.bioRank||0,rank-1);}}}if(G.boss&&dist(e,G.boss)<radius+40)damageEntity(G.boss,dmg*.42,'bio');if(sym)G.player.shield=Math.min(G.player.maxShield,G.player.shield+2+rank*.7);
}
function fireSupportVolley(){
  const p=G.player,count=supportCount(),target=findTarget();if(!count||!target)return;
  const boosted=powerOn('burst')||powerOn('overdrive')||G.activeCombos[comboId('burst','drone')],laserNet=!!G.activeCombos[comboId('drone','sparklaser')];
  for(let i=0;i<count;i++){
    const orb=supportOrbit(i,count),role=orb.role,t=findTarget()||target,ang=Math.atan2(t.y-orb.y,t.x-orb.x),inf=maybeSupportInfusion();
    if(role==='orbiter'){
      if(Math.random()<.32){const near=[...(G.boss?[G.boss]:[]),...G.enemies].filter(Boolean).sort((a,b)=>dist(orb,a)-dist(orb,b))[0];if(near){damageEntity(near,13.5*(1+up('damage')*.035),inf==='tesla'?'tesla':'normal');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:near.x,y2:near.y,life:.1,max:.1,col:'#9eeeff'});}else G.player.shield=Math.min(G.player.maxShield,G.player.shield+1.5);}continue;
    }
    if(role==='lancer'){
      if((inf==='missile'||powerOn('missile'))&&Math.random()<.3){G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*320,vy:Math.sin(ang)*320,r:5,dmg:29*(1+up('damage')*.055),life:2.3,col:'#ff985e',type:'missile',homing:true,target:t,pierce:0,splash:38});continue;}
      G.bullets.push({x:orb.x,y:orb.y,vx:Math.cos(ang)*(boosted?1040:920),vy:Math.sin(ang)*(boosted?1040:920),r:3.8,dmg:23.5*(1+up('damage')*.055),life:1.0,col:inf==='cryo'?'#c8f7ff':'#8affdb',type:'rail',pierce:1+(powerOn('rail')?1:0),splash:inf==='acid'?24:0,slow:inf==='cryo'?.5:0});AudioX.sparkLaser();continue;
    }
    let shots=powerOn('twin')||G.level>=6?[-.08,0,.08]:[0];if(G.activeCombos[comboId('burst','drone')]||((powerOn('burst')||G.level>=11)&&i%2===0))shots=[-.15,-.075,0,.075,.15];
    if(inf==='tesla'&&Math.random()<.2){damageEntity(t,16.5*(1+up('damage')*.04),'tesla');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:t.x,y2:t.y,life:.12,max:.12,col:'#8edbff'});continue;}
    if(laserNet&&i%2===0){damageEntity(t,12+powerRank('sparklaser')*2.5,'laser');G.particles.push({kind:'arc',x:orb.x,y:orb.y,x2:t.x,y2:t.y,life:.09,max:.09,col:'#d7ffff'});continue;}
    for(const off of shots){const a=ang+off;G.bullets.push({x:orb.x+Math.cos(a)*9,y:orb.y+Math.sin(a)*9,vx:Math.cos(a)*(boosted?710:640),vy:Math.sin(a)*(boosted?710:640),r:3.1,dmg:11*(1+up('damage')*.045)*(shots.length>=5?.53:shots.length>=3?.72:1),life:1.5,col:inf==='acid'?'#b6ff75':inf==='cryo'?'#c8f7ff':'#e8fbff',type:'wing',pierce:0,slow:inf==='cryo'?.6:0,splash:inf==='acid'?25:0});}
  }
  AudioX.droneShot(boosted);
}

function markCommanderAttack(e,d=.42,tag='primary'){if(!e)return;if(e===G?.boss||e?.kind==='riftAlly'){bossAnimImpactCue(e,d,tag);return;}if(e?.kind==='lieutenant')e.animAttackT=Math.max(e.animAttackT||0,d);}
function enemyShoot(e,style='aim'){const p=G.player,a=Math.atan2(p.y-e.y,p.x-e.x),commander=e===G?.boss||e?.kind==='lieutenant';if(commander)markCommanderAttack(e,style==='spread'?.46:.38,style);else AudioX.enemyShot(e);const fx=commander?commanderProjectileFx(e,style==='spread'?'volley':'primary'):null;const col=commander?(COMMANDER_PROJECTILES[e.pattern]?.col||'#ff6b78'):(e.family==='MOSQUITOS'?'#ff6175':e.family==='LIBÉLULAS'?'#78ecff':e.family==='CIGARRAS'?'#d9a7ff':'#ff6b78');if(style==='spread'){for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.19,235+G.sector*4,8,5,col,e,fx?{...fx,phase:(fx.phase||0)+k*.45}:null);}else spawnEnemyBullet(e.x,e.y,a,260+G.sector*5,9,5,col,e,fx);}
function spawnEnemyBullet(x,y,a,speed=260,dmg=10,r=5,col='#ff6b78',source=null,fx=null){let sourceMult=1;if(source===G?.boss)sourceMult=bossDefenseProfile(G.sector).attack;else if(source?.kind==='lieutenant')sourceMult=LIEUTENANT_ENDURANCE.attack;if(fx?.legacyUnscaled)sourceMult=1;const commanderMult=fx?.commander?COMMANDER_DIFFICULTY.damage:1,bd=G?.mode==='training'?.72:sectorBalance().enemyDmg*runDifficulty().enemyDamage*sourceMult*commanderMult;G.eBullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,dmg:dmg*bd,life:5,col:fx?.col||col,source,style:fx?.style||'',role:fx?.role||'',pattern:fx?.pattern||'',spin:fx?.spin||0,phase:fx?.phase||0,age:fx?.age||0,bounces:fx?.bounces||0});}
function ringBullets(x,y,count,speed,dmg,col='#ff768e',offset=0,source=null,role='ring'){if(source&&(source===G?.boss||source?.kind==='lieutenant'))markCommanderAttack(source,role==='primary'?.42:.50,role);const fx=source?commanderProjectileFx(source,role,true):null;for(let i=0;i<count;i++){const a=offset+i/count*TAU;spawnEnemyBullet(x,y,a,speed,dmg,5,col,source,fx?{...fx,phase:(fx.phase||0)+i/count*TAU}:null);}}
function commanderFan(source,x,y,base,count,spread,speed,dmg,r=5,role='special',legacyUnscaled=true){markCommanderAttack(source,.52,role);const col=COMMANDER_PROJECTILES[source?.pattern]?.col||'#ff768e',fx=commanderProjectileFx(source,role,legacyUnscaled);for(let i=0;i<count;i++){const k=i-(count-1)/2;spawnEnemyBullet(x,y,base+k*spread,speed,dmg,r,col,source,fx?{...fx,phase:(fx.phase||0)+i*.28}:null);}}

function synergyDamageMult(){if(!G)return 1;const lvl=up('synergy'),n=Math.min(3,Object.keys(G.activeCombos||{}).length),doctrine=hangarDoctrineKey()==='fusion'?n*.02:0;return 1+n*lvl*.03+activeComboMasteryBonus()+doctrine;}
function damageEntity(e,dmg,kind='normal'){
  if(!e||e.dead)return;const hiveHpBefore=Math.max(0,Number(e.hp)||0);if(G?.weaponBoostT>0&&kind!=='bomb'&&kind!=='debug')dmg*=G.weaponBoostMult||1.35;if(kind!=='bomb'&&kind!=='debug')dmg*=combatDamageMult();if(e.kind==='objectiveNode'){e.hp-=dmg;hiveRecordPlayerDamage(Math.max(0,hiveHpBefore-Math.max(0,e.hp)),false,kind);e.flash=.07;if(e.hp<=0)destroyObjectiveTarget(e);return;}if(e===G.boss&&e.dying)return;if(e===G.boss&&relicUnlocked(10))dmg*=1.05;if(e===G.boss&&kind!=='debug')dmg*=bossCounterDamageMult();
  if(e===G.boss&&kind!=='bomb'){
    const def=bossDefenseProfile(G.sector);
    if((e.phaseTransitionT||0)>0)dmg*=.06;
    else if((e.coreOpenT||0)>0)dmg*=def.core;
    else {
      const pressure=bossPressureProfile(G.sector),maxSt=e.staminaMax||pressure.stamina;
      e.stamina=Math.max(0,(e.stamina??maxSt)-Math.min(16,dmg*pressure.drain));
      dmg*=def.armor*(e.stamina>0?pressure.closed:1);
      if(e.stamina<=0){e.coreOpenT=Math.max(e.coreOpenT||0,pressure.break);e.stamina=maxSt;notify(`${e.name} · ARMADURA QUEBRADA`,'#fff09a',1.15);G.particles.push({kind:'shock',x:e.x,y:e.y,r:14,vr:420,life:.48,max:.48,col:SECTORS[G.sector-1].accent});AudioX.bossAttack(G.sector-1,true);}
    }
  }
  if(e?.kind==='lieutenant'){
    const arm=runDifficultyKey()==='hard'?LIEUTENANT_ENDURANCE.hardArmor:LIEUTENANT_ENDURANCE.normalArmor;
    if((e.coreOpenT||0)>0)dmg*=1.08;else{const maxSt=e.staminaMax||90;e.stamina=Math.max(0,(e.stamina??maxSt)-Math.min(12,dmg*.06));dmg*=arm*.82;if(e.stamina<=0){e.coreOpenT=1.75;e.stamina=maxSt;notify('TENIENTE · ARMADURA QUEBRADA','#fff09a',.95);G.particles.push({kind:'shock',x:e.x,y:e.y,r:10,vr:330,life:.4,max:.4,col:SECTORS[Math.max(0,(e.lieutenantSector||1)-1)].accent});}}
  }
  if(e?.familyGuardT>0&&e!==G.boss&&e.kind==='insect'&&kind!=='bomb'&&kind!=='debug')dmg*=.78;
  if(e===G.boss&&e.guardT>0)dmg*=.30;
  if(e===G.boss&&activeLieutenant()&&(e.coreOpenT||0)<=0)dmg*=Math.max(.82,.90-(activeLieutenants().length-1)*.02);
  if(e===G.boss&&kind!=='debug'){
    const minT=bossPhaseMinDuration(G.sector,e.phase),elapsed=e.phaseElapsed||0;
    if(e.phase===1||e.phase===2){
      const lockedFloor=e.maxHp*bossPhaseFloorRatio(e.phase),transitionFloor=e.maxHp*(e.phase===1?.679:.339);
      if(elapsed<minT&&e.hp-dmg<lockedFloor){dmg=Math.max(0,e.hp-lockedFloor);if(!e.phaseGateWarned){e.phaseGateWarned=true;notify(`FASE ${e.phase} · RESISTENCIA ADAPTATIVA`,'#ffcf73',1.05);}}
      else if(elapsed>=minT&&e.hp-dmg<transitionFloor)dmg=Math.max(0,e.hp-transitionFloor);
    }else if(elapsed<minT){
      const floor=e.maxHp*bossPhaseFloorRatio(3);if(e.hp-dmg<floor){dmg=Math.max(0,e.hp-floor);if(!e.phaseGateWarned){e.phaseGateWarned=true;notify('FASE 3 · NÚCLEO EN COLAPSO CONTROLADO','#ffcf73',1.05);}}
    }
  }
  e.hp-=dmg;hiveRecordPlayerDamage(Math.max(0,hiveHpBefore-Math.max(0,e.hp)),e===G.boss,kind);e.flash=.08;AudioX.hit();AudioX.impact(G?.level||1,e===G.boss);
  const col=e===G.boss?(BOSS_SKILLS[e.pattern]?.color||SECTORS[G.sector-1].accent):(kind==='cryo'?'#c6f6ff':kind==='acid'?'#b5ff76':'#eefcff');for(let i=0;i<(e===G.boss?5:2);i++)G.particles.push({kind:'spark',x:e.x+rnd(-e.r*.25,e.r*.25),y:e.y+rnd(-e.r*.25,e.r*.25),vx:rnd(-90,90),vy:rnd(-90,90),r:rnd(1,3.5),life:rnd(.12,.28),max:.28,col});
  if(powerOn('hemadrain')&&kind!=='bomb'){const rank=powerRank('hemadrain'),heal=Math.min(1.8+rank*.8,dmg*(.018+rank*.008))*(branchIs('hemadrain','A')?1.28:1);const pp=G.player;if(pp.hp<pp.maxHp)pp.hp=Math.min(pp.maxHp,pp.hp+heal);else pp.shield=Math.min(pp.maxShield,pp.shield+heal*(branchIs('hemadrain','B')?.98:.7));}
  if(e===G.boss)G.bossHitT=.32;
  if(e!==G.boss&&kind==='cryo')e.slow=Math.max(e.slow,1.4);
  if(e.hp<=0){if(e===G.boss)killBoss();else killEnemy(e);}
}
function killEnemy(e){if(e.kind==='transversal')return killTransversal(e);if(e.kind==='lieutenant')return killLieutenant(e);if(e.dead)return;if(e.microSwarm){AudioX.enemyDeath(e);e.dead=true;G.microKills=(G.microKills||0)+1;G.microStreakT=(G.microStreakT||0)>0?G.microStreakT:1.35;G.microStreak=(G.microStreak||0)+1;G.microStreakT=1.35;G.score+=Math.round(e.score||12);if(G.combo<4){G.combo++;G.comboT=1.0;}if(G.microStreak===6){G.score+=60+G.sector*4;notify('✦ MICRO-SWEEP · ENJAMBRE LIMPIO',SECTORS[G.sector-1].accent,.8);}burst(e.x,e.y,SECTORS[G.sector-1].accent,4,75);return;}objectiveEnemyDefeated(e);AudioX.enemyDeath(e);e.dead=true;breakFamilyManeuver(e);if((e.bio||0)>0)bioBurst(e);const fm=G.frenzyT>0?G.frenzyMult:1;G.score+=Math.round(e.score*(1+Math.min(1.5,G.combo*.03))*fm);G.kills++;G.combo++;G.comboT=2.2;gainXp(Math.round(xpForEnemy(e)*fm));if(G.frenzyT>0){G.frenzyKills=(G.frenzyKills||0)+1;if(!G.frenzySupportUsed&&G.frenzyKills>=Math.max(2,Math.ceil(G.frenzyTarget*.45))){const hp=G.player.hp/Math.max(1,G.player.maxHp),sh=G.player.shield/Math.max(1,G.player.maxShield);const support=hp<.52?'heal':sh<.58?'shield':'weaponBoost';spawnPickup(e.x,e.y,support);G.frenzySupportUsed=true;notify(`✦ APOYO DE FRENESÍ · ${support==='heal'?'BIO-REPARACIÓN':support==='shield'?'ESCUDO':'IMPACTO'}`,support==='heal'?'#ff879d':support==='shield'?'#7fb7ff':'#ffcf73',1.25);}if(!G.frenzyDone&&G.frenzyKills>=G.frenzyTarget)completeFrenzy();if(Math.random()<.18)spawnPickup(e.x,e.y,'credit');}maybeDrop(e);burst(e.x,e.y,SECTORS[G.sector-1].accent,10,130);}
function bossDeathProfile(sec){
  const m={AVISPAS:['#ffe66f','#ff9d2e','QUITINA'],ESCARABAJOS:['#b7ff72','#6e9f44','PLACAS'],MANTIS:['#ff9a55','#ff5f37','CUCHILLAS'],POLILLAS:['#e8c5ff','#a66cff','POLEN'],HORMIGAS:['#ff6b5f','#b52e2e','FORJA'],LANGOSTAS:['#d7ff62','#8ac53f','IMPACTO'],MOSQUITOS:['#ff526d','#8e1429','HEMÁTICO'],TERMITAS:['#ffd56a','#9d6c22','RESINA'],LIBÉLULAS:['#78ecff','#387fff','PRISMA'],CIGARRAS:['#d9a7ff','#8a5bd8','RESONANCIA'],
    SCARAB_IMPERATOR:['#62dfff','#ffe08a','KHEPRI'],VESPERA_LANCERS:['#8dff58','#ffe477','VENENO'],MANDIBLE_REGENTS:['#ff7358','#ffb071','TENAZAS'],PYROLUX:['#ffcc62','#fff0a4','LÚMEN'],CAUSTIC:['#aaff54','#d5ff79','CÁUSTICO'],
    VEILS:['#d9a7ff','#f2d8ff','VELO'],PHASMIDS:['#63f6df','#c5fff0','MIMÉTICO'],ANTLIONS:['#ffb94f','#ffd287','FOSA'],AURICULUS:['#ff5c70','#ffb0bf','ELECTRO'],APIARY:['#ffd76a','#fff1ae','COLMENA']};
  const v=m[sec.family]||[sec.accent,'#ffffff','NÚCLEO'];return {primary:v[0],secondary:v[1],label:v[2]};
}
function bossDeathBurst(b,stage){
  const sec=SECTORS[G.sector-1],dp=bossDeathProfile(sec),pts=[[-.46,-.22],[.44,-.18],[-.22,.38],[.28,.32],[0,0]],pt=pts[Math.min(stage,pts.length-1)],x=b.x+b.r*pt[0],y=b.y+b.r*pt[1],col=stage>=3?'#fff7d6':(stage%2?dp.secondary:dp.primary);
  burst(x,y,col,stage>=3?34:14+stage*5,stage>=3?330:190+stage*30);G.particles.push({kind:'shock',x,y,r:10+stage*5,vr:280+stage*90,life:.45+.08*stage,max:.45+.08*stage,col});
  if(stage>=2)for(let i=0;i<7+stage*2;i++){const a=rnd(0,TAU),sp=rnd(110,290);G.particles.push({kind:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(1.4,3.2),life:rnd(.25,.62),max:.62,col:stage===4?'#fff':dp.primary});}
  AudioX.noise(stage>=3?.22:.10,stage>=3?.055:.026,420+stage*180,0);shake=Math.max(shake,stage>=3?17:8+stage*2);flash=Math.max(flash,stage>=3?.95:.28+stage*.10);
}
function spawnBossCelebrationLoot(b,credits,xp,heritage){
  const sec=SECTORS[G.sector-1],chunks=5,xpChunks=3;
  for(let i=0;i<chunks;i++){const q=spawnPickup(b.x+rnd(-70,70),b.y+rnd(-50,50),'bossCredit');q.value=Math.floor(credits/chunks)+(i<credits%chunks?1:0);q.vx=rnd(-145,145);q.vy=rnd(-150,55);q.life=30;}
  for(let i=0;i<xpChunks;i++){const q=spawnPickup(b.x+rnd(-58,58),b.y+rnd(-45,45),'bossXp');q.value=Math.floor(xp/xpChunks)+(i<xp%xpChunks?1:0);q.vx=rnd(-130,130);q.vy=rnd(-145,45);q.life=30;}
  for(let i=0;i<2;i++){const q=spawnPickup(b.x+rnd(-55,55),b.y+rnd(-36,36),i===0?'heal':'shield');q.vx=rnd(-110,110);q.vy=rnd(-125,30);q.life=30;}
  const h=spawnPickup(b.x+rnd(-36,36),b.y-32,'heritageToken',heritage||null);h.vx=rnd(-70,70);h.vy=-130;h.life=30;
  const f=spawnPickup(b.x+rnd(-38,38),b.y+34,'fragment');f.vx=rnd(-80,80);f.vy=rnd(-115,-35);f.life=30;
  G.bossCelebration={text:`✓ ${b.name} DESTRUIDO`,sub:`GANASTE +${xp.toLocaleString()} XP · +¤${credits.toLocaleString()} · HERENCIA + FRAGMENTO`,color:sec.accent,t:2.7,max:2.7};
}
function autoCollectPostBossRewards(){
  for(const q of G.pickups.filter(q=>q.life>0)){collect(q);q.life=0;}G.pickups=G.pickups.filter(q=>q.life>0);return true;
}
function killBoss(){
  const b=G.boss;if(!b||b.dead||b.dying)return;
  hiveFinalizeBoss('victory');
  b.hp=0;b.dying=true;b.deathT=BOSS_STANDARD.deathDuration;b.deathStage=0;G.hitStopT=.13;b.telegraph='';b.telegraphT=0;b.specialT=0;b.chargeT=0;b.guardT=0;b.coreOpenT=0;b.phaseTransitionT=0;b.signatureAttack=null;b.razorBeamT=0;b.razorBeamWind=0;
  startBossArenaAftermath(b);
  G.eBullets.length=0;G.bossWarningT=0;G.bossWarningText='';shake=12;flash=Math.max(flash,.55);AudioX.bossPhase(G.sector-1);
  notify(`IMPACTO FINAL · ${b.name}`,SECTORS[G.sector-1].accent,1.8);
  bossVfx(b,BOSS_SKILLS[b.pattern]?.color||SECTORS[G.sector-1].accent,28);
}

function finalizeBossKill(){
  const b=G.boss;if(!b||b.dead)return;b.dead=true;if(G.bossAftermath)G.bossAftermath.finalized=true;MusicX.onBossEnd();AudioX.bossDie(G.sector-1);burst(b.x,b.y,SECTORS[G.sector-1].accent,72,300);shake=15;flash=1;
  const training=G.mode==='training',replay=G.bossCheckpointKind==='replay',mastery=!training&&(G.bossHits||0)===0,baseReward=training?0:Math.round((540+G.sector*150)*economyMult()*(replay?.58:1)),masteryBonus=mastery?Math.round(baseReward*(replay?.55:.32)):0,bossXp=training?0:Math.round((170+G.sector*65+(mastery?60:0))*runDifficulty().xp);G.score+=training?2200:6000+G.sector*2600+masteryBonus*5;G.bossMasteryAchieved=mastery;if(mastery){META.bossMastery[G.sector]=true;notify(`MAESTRÍA DE JEFE · SIN IMPACTOS · RECOMPENSA MEJORADA`,'#fff09a',2.5);}
if(!training&&G.mode!=='bossRush'&&RELICS[G.sector]&&!relicUnlocked(G.sector)){const r=RELICS[G.sector],bonus=grantCredits(Math.round((180+G.sector*35)*runDifficulty().reward),'relic',true);META.relics[G.sector]=true;G.lastRelic=G.sector;if(G.sector===7){G.player.maxHp+=8;G.player.hp=Math.min(G.player.maxHp,G.player.hp+8);}if(G.sector===8){G.player.maxShield+=10;G.player.shield=Math.min(G.player.maxShield,G.player.shield+10);}notify(`${r.icon} RELIQUIA · ${r.name} · +¤${bonus}`,r.color,3.0);}
  if(G.mode==='bossRush'){const time=Math.max(.1,(G.elapsed||0)-(G.bossStartElapsed||0)),hits=G.bossHits||0,grade=bossRushGrade(time,hits,G.sector),bonus=grantCredits(Math.round((55+G.sector*14)*(RUSH_GRADE_VALUE[grade]||1)*runDifficulty().reward),'bossrush_boss',true);G.bossRushResults=G.bossRushResults||[];G.bossRushResults.push({sector:G.sector,grade,time,hits});notify(`RANGO ${grade} · ${time.toFixed(1)}s · ${hits} IMPACTOS · +¤${bonus}`,grade==='S'?'#fff09a':grade==='A'?'#a6ff5f':grade==='B'?'#8edbff':'#c0a3ff',2.4);}
  if(!training&&G.mode!=='bossRush'){META.bosses=(META.bosses||0)+1;META.defeated=META.defeated||{};META.defeated[G.sector]=true;META.unlocked=Math.max(META.unlocked,Math.min(SECTORS.length,G.sector+1));META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;const heritage=HERITAGE_BY_SECTOR[G.sector];if(heritage){G.heritageNext=heritage;META.bossUnlocks[G.sector]=heritage;G.lastBossDrop=heritage;notify(`HERENCIA ASEGURADA · ${HERITAGE_NAMES[G.sector]||POWERS[heritage].name}`,'#ffd76a',2.6);}}
  if(G.mode==='bossRush'){G.bossRushScore=(G.bossRushScore||0)+1;META.hiScore=Math.max(META.hiScore,G.score);G.hiScore=META.hiScore;}
  if(!training&&G.mode==='campaign'&&isChapterEndSector(G.sector)){
    const ch=chapterForSector(G.sector);G.chapterComplete=true;G.completedChapterId=ch.id;const chapterReward=grantCredits(Math.round((900+ch.id*500)*sectorBalance().reward*runDifficulty().reward),'chapter_final',true);G.finalReward=chapterReward;G.score+=18000+ch.id*6000;META.chapterWins[ch.id]=(META.chapterWins[ch.id]||0)+1;META.bestChapterScore[ch.id]=Math.max(META.bestChapterScore[ch.id]||0,G.score);if(ch.id===1){META.campaignWins=META.chapterWins[1];META.bestCampaignScore=META.bestChapterScore[1];}notify(`${ch.title} COMPLETADO · +¤${chapterReward}`,'#fff09a',3.2);if(chapterBossesDefeated(ch.id))notify(`BOSS RUSH · CAP ${ch.id} DESBLOQUEADO`,ch.accent,3.2);
    if(isActiveCampaignEnd(G.sector)&&fullExpansionImplemented()&&G.sector===plannedSectorCount()){G.campaignComplete=true;const fullBonus=grantCredits(Math.round(2200*sectorBalance().reward*runDifficulty().reward),'campaign_final',true);G.finalReward+=fullBonus;META.fullCampaignWins=(META.fullCampaignWins||0)+1;META.bestFullCampaignScore=Math.max(META.bestFullCampaignScore||0,G.score);notify(`CAMPAÑA COMPLETA · +¤${fullBonus}`,'#d9a7ff',3.2);}
  }
  if(!training&&(G.lieutenantKills||0)>0){const lk=G.lieutenantKills||1,lb=grantCredits(Math.round((80+G.sector*14+lk*34)*economyMult()),'commander_convergence',true);spawnPowerReward(b.x+42,b.y);notify(`BONO CONVERGENCIA · ${lk} MANDOS · +¤${lb}`,'#fff09a',2.0);}
  if(META.bossLossCheckpoint?.sector===G.sector)META.bossLossCheckpoint=null;
  if(training){for(let i=0;i<2;i++)spawnPickup(b.x+rnd(-40,40),b.y+rnd(-32,32),'credit');}
  else if(G.mode==='bossRush'){spawnPickup(b.x+rnd(-30,30),b.y+rnd(-24,24),'shield');}
  else{const heritage=HERITAGE_BY_SECTOR[G.sector]||null;spawnBossCelebrationLoot(b,baseReward+masteryBonus,bossXp,heritage);}
  saveMeta();if(G.mode!=='bossRush')try{localStorage.removeItem(KEY_RUN);}catch(_){}G.sectorClear=true;G.postBossT=G.mode==='bossRush'?3.6:(training?4.2:((G.campaignComplete||G.chapterComplete)?9.5:8.0));G.postBossMax=G.postBossT;G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;notify(G.mode==='bossRush'?(()=>{const p=bossRushPosition();return `BOSS ${p.index}/${p.total} DERROTADO · RECOGE Y AVANZA`;})():training?'PRÁCTICA COMPLETADA · RECOGE LOS RESTOS':'ZONA SEGURA · RECOGE LOS PREMIOS','#a6ff5f',2.4);
}

function hitPlayer(dmg){const p=G.player,hiveIntegrityBefore=(p.hp||0)+(p.shield||0);if(G.lastChanceT>0||p.inv>0)return;const shieldBefore=p.shield;if(powerOn('resinwall')&&(G.resinCharges||0)>0){G.resinCharges--;burst(p.x,p.y,'#ffd56a',18,160);G.particles.push({kind:'shock',x:p.x,y:p.y,r:12,vr:branchIs('resinwall','B')?430:320,life:.45,max:.45,col:'#ffd56a'});if(branchIs('resinwall','B')){for(const e of G.enemies)if(!e.dead&&dist(p,e)<120)damageEntity(e,24+powerRank('resinwall')*7,'resin');}if(G.resinCharges<=0)delete G.powers.resinwall;AudioX.tone(280,.12,.035,'triangle',0,-70);return;}G.waveHits=(G.waveHits||0)+1;if(G.boss)G.bossHits=(G.bossHits||0)+1;if(G.mode==='training')dmg*=.52;dmg*=doctrineIncomingMult();if(p.shield>0){const take=Math.min(p.shield,dmg);p.shield-=take;dmg-=take;if(take>0){G.shieldHitT=.32;G.particles.push({kind:'shieldwave',x:p.x,y:p.y,r:p.r+11,vr:230,life:.30,max:.30,col:'#7fb7ff'});if(Math.random()<.5)AudioX.tone(420,.045,.018,'sine',0,80);const sr=p.shield/p.maxShield;if(sr<.22&&!G.shieldCriticalWarned){G.shieldCriticalWarned=true;notify('⬡ ESCUDO CRÍTICO','#7fb7ff',.95);}else if(sr>.42)G.shieldCriticalWarned=false;}}if(dmg>0)p.hp-=dmg;if(shieldBefore>0&&p.shield<=0){G.particles.push({kind:'shock',x:p.x,y:p.y,r:p.r+12,vr:420,life:.42,max:.42,col:'#7fb7ff'});AudioX.tone(260,.12,.04,'sine',0,-120);notify('ESCUDO AGOTADO','#7fb7ff',1.0);}p.inv=.55;G.heartHitT=.55;AudioX.hurt();shake=Math.max(shake,7);flash=Math.max(flash,.45);burst(p.x,p.y,'#ff5b73',14,160);if(p.hp/p.maxHp<=.10&&!G.critWarned){G.critWarned=true;notify('PELIGRO · INTEGRIDAD CRÍTICA','#ff5b73',2.2);}if(p.hp>p.maxHp*.10)G.critWarned=false;if(p.hp>0)autoUseEmergencySupplies();if(p.hp<=0)beginLastChance();hiveRecordPlayerTaken(Math.max(0,hiveIntegrityBefore-((p.hp||0)+(p.shield||0))));}
function gameOver(){if(G?.boss&&!G.boss.dead)hiveFinalizeBoss('defeat');const bossLoss=saveBossLossCheckpoint();MusicX.stop(false);AudioX.stopBoss();G.hiScore=Math.max(G.hiScore,G.score);META.hiScore=Math.max(META.hiScore,G.hiScore);META.credits=G.credits;saveMeta();setScreen('DEAD');if(bossLoss)notify('CHECKPOINT DE JEFE GUARDADO · 50%','#ffd76a',2.4);}
function vfxBudgetScale(){const n=G?.particles?.length||0,mobile=(W<760||H<460),perf=performanceVfxFactor();if(n>820)return .38*perf;if(n>620)return .52*perf;if(n>430)return .68*perf;return (mobile?.82:1)*perf;}
function burst(x,y,col,count=10,speed=100){count=Math.max(3,Math.round(count*vfxBudgetScale()));for(let i=0;i<count;i++){const a=rnd(0,TAU),s=rnd(speed*.3,speed);G.particles.push({kind:'dot',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rnd(1.5,4.5),life:rnd(.25,.7),max:.7,col});}}

// ─────────────────────────────────────────────────────────────
// UPDATE LOOP
// ─────────────────────────────────────────────────────────────
let timers={missile:0,rail:0,tesla:0,gravity:0,drone:0,resonance:0,sparklaser:0,bio:0,phase:0,nanites:0,riftmine:0,echo:0,nova:0,ionweb:0,orbitblade:0};
// ─────────────────────────────────────────────────────────────
// v2.13.0 · CHASE BONUS — prototipo interno de vista trasera
// Modo separado: no altera campaña, checkpoints ni economía de poderes.
// ─────────────────────────────────────────────────────────────
function startChaseBonus(){
  newRun(1,'chase','normal');G.enemies.length=0;G.bullets.length=0;G.eBullets.length=0;G.pickups.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.particles.length=0;G.boss=null;G.bossPending=false;G.preBossT=0;G.postBossT=0;G.sectorClear=false;
  notices=[];G.chase={time:0,duration:68,reticleX:W*.5,reticleY:H*.35,shipX:W*.5,shipY:H*.76,fire:0,spawn:.62,enemies:[],bolts:[],tracers:[],powerDrops:[],fx:[],floaters:[],kills:0,integrity:100,shield:45,overdriveT:0,burstT:0,combo:0,comboT:0,streak:0,streakT:0,bestStreak:0,streakFlashT:0,lockT:0,lockTarget:null,hitMarkerT:0,invT:0,boss:null,bossSpawned:false,bossDefeated:false,reward:0,success:false,stage:1,nextSupport:6,nextPower:4,rank:'C'};G.score=0;G.credits=META.credits||0;G.sectorBanner=0;G.waveBanner=0;setScreen('GAME');tryFullscreen();notify('🎯 CHASE EXTREMO · MUEVE + APUNTA · DISPARA A LOS PODERES','#7cf6ff',2.7);
}
function chaseStage(c=G?.chase){return !c?1:c.time>=43?3:c.time>=21?2:1;}
function chaseProject(e){const z=Math.max(.11,e.z||1),persp=1/(z+.32),sx=W*.5+(e.nx||0)*W*.34*persp,sy=H*.27+(e.ny||0)*H*.27*persp+(1-z/1.45)*H*.20,size=clamp((e.base||32)*persp,11,e.boss?205:112);return {x:sx,y:sy,size,persp};}
function chaseEnemyAsset(e){if(e.boss)return IMG.worldEnemies['LIBÉLULAS']?.[3]||IMG.worldEnemies.AVISPAS?.[3]||IMG.atlas;if(e.family){const pack=IMG.worldEnemies[e.family];if(pack?.length)return pack[clamp(e.assetTier||0,0,2)]||pack[0];}const pool=IMG.generatedShips||[];return pool[e.assetIndex%Math.max(1,pool.length)]||IMG.enemyShips.scout;}
function spawnChaseEnemy(elite=false){const c=G.chase;if(!c||c.bossSpawned&&Math.random()<.56)return;const stage=chaseStage(c),hp=(elite?3:1)+(stage>=3?1:0),base=elite?48:33;let family=null,assetTier=elite?2:stage>=2?1:0;if(stage===2)family=pick(['MANTIS','LANGOSTAS','MOSQUITOS']);else if(stage>=3)family=pick(['AVISPAS','LIBÉLULAS','CIGARRAS']);c.enemies.push({nx:rnd(-.96,.96),ny:rnd(-.78,.52),z:rnd(1.30,1.56),speed:rnd(.145,.215)+(stage-1)*.022,hp,maxHp:hp,base,assetIndex:rndI(0,11),assetTier,family,fire:rnd(1.5,3.0),spin:rnd(-.5,.5),t:0,elite,dead:false,boss:false});}
function spawnChaseBoss(){const c=G.chase;if(c.bossSpawned)return;c.bossSpawned=true;c.boss={nx:.05,ny:-.12,z:.46,speed:0,hp:118,maxHp:118,base:102,fire:1.0,t:0,boss:true,dead:false};notify('☠ INTERCEPTOR SOBERANO · FIJA MIRA Y ROMPE SU ESCOLTA','#ffe66f',2.1);AudioX.bossWarn(8);}
function chaseFloat(x,y,text,col='#fff',size=13){const c=G.chase;if(!c)return;c.floaters.push({x,y,text,col,size,t:1.05,max:1.05,vy:-30});}
function chaseExplosion(x,y,col='#8eeaff',scale=1){const c=G.chase;if(!c)return;c.fx.push({kind:'ring',x,y,r:5,vr:145*scale,t:.52,max:.52,col});for(let i=0;i<Math.round(18*scale);i++){const a=rnd(0,TAU),sp=rnd(65,220)*scale;c.fx.push({kind:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rnd(1.5,4.5)*scale,t:rnd(.25,.68),max:.68,col});}c.fx.push({kind:'flash',x,y,r:18*scale,t:.16,max:.16,col});}
function chaseSpawnPower(x,y,forced=null){const c=G.chase;if(!c)return;const types=['heal','shield','overdrive','burst','bomb'],type=forced||pick(types);c.powerDrops.push({x:clamp(x,45,W-45),y:clamp(y,55,H-70),type,t:9,max:9,r:23,pulse:0,dead:false});}
function chaseCollectPower(q){const c=G.chase;if(!c||q.dead)return;q.dead=true;AudioX.pickup();let text='';if(q.type==='heal'){c.integrity=Math.min(100,c.integrity+28);text='♥ REPARACIÓN +28%';}else if(q.type==='shield'){c.shield=Math.min(80,c.shield+45);text='⬡ SHIELD +45';AudioX.power('shield');}else if(q.type==='overdrive'){c.overdriveT=Math.min(20,c.overdriveT+10);text='⚡ OVERDRIVE 10s';AudioX.power('overdrive');}else if(q.type==='burst'){c.burstT=Math.min(20,c.burstT+10);text='✦ IMPACTO x1.55 · 10s';AudioX.power('burst');}else if(q.type==='bomb'){let n=0;for(const e of c.enemies){if(e.dead)continue;e.dead=true;n++;c.kills++;const qq=chaseProject(e);chaseExplosion(qq.x,qq.y,'#ffb67a',1.15);G.score+=220;}if(c.boss&&!c.boss.dead)c.boss.hp=Math.max(1,c.boss.hp-18);text=`✹ BOMBA RIFT · ${n} BAJAS`;AudioX.power('bomb');shake=Math.max(shake,11);}notify(`✦ CHASE · ${text}`,'#fff09a',1.4);chaseFloat(q.x,q.y-18,text,'#fff09a',12);}
function chaseSupportPulse(){const c=G.chase;if(!c)return;const x=clamp(c.shipX+rnd(-110,110),55,W-55),y=clamp(c.shipY-rnd(100,170),65,H-90);if(c.integrity<65)chaseSpawnPower(x,y,'heal');else if(c.shield<32)chaseSpawnPower(x,y,'shield');else chaseSpawnPower(x,y,Math.random()<.5?'overdrive':'burst');notify('✦ APOYO ENTRANTE · DISPARA AL POWER','#fff09a',1.15);}
function chaseDamage(amount){const c=G.chase;if(!c||c.integrity<=0||c.invT>0)return;c.invT=.18;let hit=amount;if(c.shield>0){const absorbed=Math.min(c.shield,hit);c.shield-=absorbed;hit-=absorbed;if(absorbed>0)AudioX.power('shield');}if(hit<=0)return;c.integrity=Math.max(0,c.integrity-hit);c.streak=0;c.streakT=0;shake=Math.max(shake,7);flash=Math.max(flash,.38);AudioX.hurt();if(c.integrity<=30&&c.integrity+hit>30)notify('⚠ CHASE · INTEGRIDAD CRÍTICA · BUSCA ♥','#ff6d85',1.3);if(c.integrity<=0)finishChase(false);}
function chaseUpdateLock(dt){const c=G.chase;if(!c)return;let best=null,bd=1e9;const targets=[...c.enemies.filter(e=>!e.dead),...(c.boss&&!c.boss.dead?[c.boss]:[])];for(const e of targets){const q=chaseProject(e),d=Math.hypot(c.reticleX-q.x,c.reticleY-q.y),r=Math.max(24,q.size*(e.boss?.44:.40));if(d<r&&d<bd){best=e;bd=d;}}if(best&&best===c.lockTarget)c.lockT=Math.min(1.2,c.lockT+dt);else{c.lockTarget=best;c.lockT=best?Math.min(.10,dt):0;}if(!best)c.lockT=Math.max(0,c.lockT-dt*3);}
function chaseFire(){const c=G.chase;if(!c)return;const sx=c.shipX,sy=c.shipY-34,tx=c.reticleX,ty=c.reticleY;const tracerCount=c.burstT>0?3:1;for(let i=0;i<tracerCount;i++){const off=(i-(tracerCount-1)/2)*8;c.tracers.push({x1:sx+off*.35,y1:sy,x2:tx+off,y2:ty,t:.10,max:.10});}AudioX.shot();
  let power=null,pd=1e9;for(const q of c.powerDrops){if(q.dead)continue;const d=Math.hypot(tx-q.x,ty-q.y);if(d<q.r+18&&d<pd){power=q;pd=d;}}if(power){chaseCollectPower(power);return;}
  let best=null,bd=1e9;const targets=[...c.enemies.filter(e=>!e.dead),...(c.boss&&!c.boss.dead?[c.boss]:[])];for(const e of targets){const q=chaseProject(e);e.sx=q.x;e.sy=q.y;e.ss=q.size;const d=Math.hypot(tx-q.x,ty-q.y),hitR=Math.max(22,q.size*(e.boss?.42:.38));if(d<hitR&&d<bd){best=e;bd=d;}}if(best){const locked=c.lockTarget===best&&c.lockT>=.34,over=c.overdriveT>0,burstOn=c.burstT>0,dmg=(best.boss?1.18:1)*(1+up('damage')*.06)*(locked?1.34:1)*(over?1.28:1)*(burstOn?1.55:1);best.hp-=dmg;c.hitMarkerT=.10;c.combo++;c.comboT=1.55;const hitValue=Math.round((best.boss?28:12)*(1+Math.min(2,c.combo*.035))*(locked?1.18:1));G.score+=hitValue;if(best.hp<=0){best.dead=true;c.kills++;c.streak++;c.streakT=3.2;c.bestStreak=Math.max(c.bestStreak,c.streak);c.streakFlashT=.85;const streakMult=1+Math.min(1.8,Math.floor(c.streak/3)*.15),base=best.boss?2800:(best.elite?380:155),value=Math.round(base*streakMult);G.score+=value;const ex=best.sx||tx,ey=best.sy||ty;chaseExplosion(ex,ey,best.boss?'#ffe66f':best.elite?'#ffad70':'#76eaff',best.boss?2.2:best.elite?1.35:1);chaseFloat(ex,ey-10,`+${value.toLocaleString()}`,'#fff09a',best.boss?20:14);if(c.streak>=3)chaseFloat(ex,ey+10,`⚡ RACHA x${c.streak}`,'#a6ff5f',12);if(best.boss){c.bossDefeated=true;notify('★ INTERCEPTOR SOBERANO DESTRUIDO','#fff09a',1.6);}else{if(Math.random()<(best.elite?.42:.22))chaseSpawnPower(ex,ey);if(c.kills>=c.nextPower){c.nextPower+=6;chaseSpawnPower(ex+rnd(-35,35),ey+rnd(-25,25));}if(c.kills>=c.nextSupport){c.nextSupport+=7;chaseSupportPulse();}}}}}
function chaseRank(c=G?.chase){if(!c)return 'C';if(c.success&&c.integrity>=72&&G.score>=8500)return 'S';if(c.success&&c.integrity>=48)return 'A';if(c.success)return 'B';return 'C';}
function updateChase(dt){const c=G.chase;if(!c)return;G.elapsed+=dt;PreBossX.segmentTick();PreBossX.updateMix();for(const n of notices)n.t-=dt;notices=notices.filter(n=>n.t>0);if(shake>0)shake=Math.max(0,shake-dt*18);if(flash>0)flash=Math.max(0,flash-dt*1.8);c.time+=dt;c.comboT=Math.max(0,c.comboT-dt);c.overdriveT=Math.max(0,c.overdriveT-dt);c.burstT=Math.max(0,c.burstT-dt);c.hitMarkerT=Math.max(0,c.hitMarkerT-dt);c.invT=Math.max(0,c.invT-dt);c.streakT=Math.max(0,c.streakT-dt);c.streakFlashT=Math.max(0,c.streakFlashT-dt);if(c.comboT<=0)c.combo=0;if(c.streakT<=0)c.streak=0;
  const aimX=Number.isFinite(input.mouseX)&&input.mouseX>0?input.mouseX:W*.5,aimY=Number.isFinite(input.mouseY)&&input.mouseY>0?input.mouseY:H*.35;c.reticleX=lerp(c.reticleX,clamp(aimX,28,W-28),1-Math.pow(.001,dt));c.reticleY=lerp(c.reticleY,clamp(aimY,38,H-38),1-Math.pow(.001,dt));c.shipX=lerp(c.shipX,clamp(c.reticleX,62,W-62),1-Math.pow(.008,dt));c.shipY=lerp(c.shipY,clamp(c.reticleY+H*.16,H*.18,H*.92),1-Math.pow(.012,dt));
  const stage=chaseStage(c);if(stage!==c.stage){c.stage=stage;if(stage===2)notify('⚡ CHASE · FASE 2 · CAZADORES INSECTOIDES','#ffcf73',1.7);else notify('☠ CHASE · FASE 3 · ESCOLTAS SOBERANAS','#ff8e83',1.7);}chaseUpdateLock(dt);c.fire-=dt;if(c.fire<=0){c.fire=Math.max(.048,(.12-up('rate')*.005)*(c.overdriveT>0?.68:1));chaseFire();}c.spawn-=dt;if(c.spawn<=0&&c.time<60){spawnChaseEnemy(Math.random()<(c.time>42?.27:c.time>22?.19:.10));c.spawn=rnd(.46,.82)*(c.time>43?.74:c.time>21?.88:1);}if(c.time>48&&!c.bossSpawned)spawnChaseBoss();
  for(const e of c.enemies){if(e.dead)continue;e.t+=dt;e.z-=e.speed*dt;e.nx+=Math.sin(e.t*1.7+e.assetIndex)*dt*.035;e.fire-=dt;const q=chaseProject(e);e.sx=q.x;e.sy=q.y;e.ss=q.size;if(e.fire<=0&&e.z<.80){e.fire=rnd(1.6,2.9);const dx=c.shipX-q.x,dy=c.shipY-q.y,d=Math.hypot(dx,dy)||1,speed=170+q.persp*68;c.bolts.push({x:q.x,y:q.y,vx:dx/d*speed,vy:dy/d*speed,r:clamp(3*q.persp,3,9),t:3,col:e.elite?'#ffb067':'#ff6d85',dmg:e.elite?8:6});}if(e.z<=.11){e.dead=true;chaseExplosion(q.x,q.y,'#ff6d85',.8);chaseDamage(e.elite?13:8);}}c.enemies=c.enemies.filter(e=>!e.dead);
  if(c.boss&&!c.boss.dead){const b=c.boss;b.t+=dt;b.nx=Math.sin(b.t*.82)*.34;b.ny=-.15+Math.sin(b.t*1.25)*.12;b.fire-=dt;if(b.fire<=0){b.fire=.72;const q=chaseProject(b);for(const off of [-.18,0,.18]){const tx=c.shipX+off*W*.18,ty=c.shipY,dx=tx-q.x,dy=ty-q.y,d=Math.hypot(dx,dy)||1;c.bolts.push({x:q.x,y:q.y,vx:dx/d*245,vy:dy/d*245,r:7,t:3,col:'#ffe66f',dmg:8});}}}
  for(const b of c.bolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.t-=dt;if(b.t>0&&Math.hypot(b.x-c.shipX,b.y-c.shipY)<34+b.r){b.t=0;chaseDamage(b.dmg||7);}}c.bolts=c.bolts.filter(b=>b.t>0&&b.x>-30&&b.x<W+30&&b.y>-30&&b.y<H+30);
  for(const q of c.powerDrops){q.t-=dt;q.pulse+=dt;q.y+=10*dt;if(q.t<=0)q.dead=true;}c.powerDrops=c.powerDrops.filter(q=>!q.dead);
  for(const f of c.fx){f.t-=dt;if(f.kind==='spark'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.985;f.vy*=.985;}else if(f.kind==='ring')f.r+=f.vr*dt;}c.fx=c.fx.filter(f=>f.t>0);
  for(const f of c.floaters){f.t-=dt;f.y+=f.vy*dt;}c.floaters=c.floaters.filter(f=>f.t>0);for(const t of c.tracers)t.t-=dt;c.tracers=c.tracers.filter(t=>t.t>0);if(c.time>=c.duration){if(!c.bossSpawned)spawnChaseBoss();if(c.bossDefeated||c.time>=c.duration+10)finishChase(c.bossDefeated&&c.integrity>0);}}
function finishChase(success){const c=G.chase;if(!c||G.screen!=='GAME')return;c.success=!!success;c.rank=chaseRank(c);const rankBonus={S:220,A:135,B:70,C:0}[c.rank]||0,reward=Math.round((success?220:85)+rankBonus+Math.min(620,G.score*.027)+c.kills*3+c.bestStreak*4);c.reward=reward;G.credits=(META.credits||0)+reward;META.credits=G.credits;META.chaseBest=Math.max(META.chaseBest||0,G.score||0);META.chaseWins=(META.chaseWins||0)+(success?1:0);const order={C:1,B:2,A:3,S:4};if((order[c.rank]||0)>(order[META.chaseBestRank]||0))META.chaseBestRank=c.rank;saveMeta();MusicX.stop(false);setScreen('VICTORY');}
function drawChaseGame(){UI.buttons.length=0;drawBackground();const c=G.chase;if(!c)return;cx.save();if(shake>0)cx.translate(rnd(-shake,shake),rnd(-shake*.5,shake*.5));const horizon=H*.28;cx.strokeStyle='rgba(120,235,255,.14)';cx.lineWidth=1;for(let i=0;i<10;i++){const a=(i/10)*TAU+(G.elapsed*.08);cx.beginPath();cx.moveTo(W*.5,H*.34);cx.lineTo(W*.5+Math.cos(a)*W*.72,H*.34+Math.sin(a)*H*.72);cx.stroke();}for(let i=0;i<7;i++){const rr=((G.elapsed*.33+i/7)%1)*Math.max(W,H)*.62;cx.beginPath();cx.ellipse(W*.5,horizon,rr,rr*.42,0,0,TAU);cx.stroke();}
  const drawTarget=e=>{const q=chaseProject(e),img=chaseEnemyAsset(e);cx.save();cx.translate(q.x,q.y);cx.rotate(e.boss?Math.sin(e.t*.8)*.04:(e.spin||0)*e.t);cx.shadowColor=e.boss?'#ffe66f':e.elite?'#ffae72':'#7eeeff';cx.shadowBlur=e.boss?28:12;if(imgReady(img)){const d=q.size*(e.boss?1.75:1.35),sc=Math.min(d/img.naturalWidth,d/img.naturalHeight);cx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);}else{cx.fillStyle=e.boss?'#ffe66f':'#8eeaff';cx.beginPath();cx.arc(0,0,q.size*.35,0,TAU);cx.fill();}cx.restore();if(e.boss||e.elite){const w=q.size*(e.boss?1.35:.9);cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(q.x-w/2,q.y+q.size*.55,w,5);cx.fillStyle=e.boss?'#ffe66f':'#ffae72';cx.fillRect(q.x-w/2,q.y+q.size*.55,w*clamp(e.hp/e.maxHp,0,1),5);}};for(const e of c.enemies)drawTarget(e);if(c.boss&&!c.boss.dead)drawTarget(c.boss);
  for(const q of c.powerDrops){const img=powerAsset(q.type==='overdrive'?'overdrive':q.type==='burst'?'burst':q.type==='bomb'?'bomb':q.type);const pulse=1+Math.sin(q.pulse*9)*.12;cx.save();cx.translate(q.x,q.y);cx.scale(pulse,pulse);cx.shadowColor='#fff09a';cx.shadowBlur=22;cx.fillStyle='rgba(4,12,24,.78)';cx.strokeStyle='#fff09a';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,q.r,0,TAU);cx.fill();cx.stroke();if(imgReady(img)){const d=q.r*1.55,sc=Math.min(d/img.naturalWidth,d/img.naturalHeight);cx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);}cx.restore();cx.fillStyle='#fff09a';cx.font='900 8px system-ui';cx.textAlign='center';cx.fillText('DISPARA',q.x,q.y+q.r+12);cx.textAlign='left';}
  for(const b of c.bolts){cx.fillStyle=b.col;cx.shadowColor=b.col;cx.shadowBlur=12;cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();}for(const t of c.tracers){cx.save();cx.globalAlpha=clamp(t.t/t.max,0,1);const hot=c.overdriveT>0||c.burstT>0;cx.strokeStyle=hot?'#fff09a':'#9ffcff';cx.shadowColor=hot?'#ff9f46':'#9ffcff';cx.shadowBlur=hot?22:16;cx.lineWidth=c.burstT>0?6:c.overdriveT>0?5:4;cx.beginPath();cx.moveTo(t.x1,t.y1);cx.lineTo(t.x2,t.y2);cx.stroke();cx.restore();}
  for(const f of c.fx){const a=clamp(f.t/f.max,0,1);cx.save();cx.globalAlpha=a;if(f.kind==='spark'){cx.fillStyle=f.col;cx.shadowColor=f.col;cx.shadowBlur=10;cx.beginPath();cx.arc(f.x,f.y,f.r,0,TAU);cx.fill();}else if(f.kind==='ring'){cx.strokeStyle=f.col;cx.lineWidth=3;cx.shadowColor=f.col;cx.shadowBlur=14;cx.beginPath();cx.arc(f.x,f.y,f.r,0,TAU);cx.stroke();}else{cx.fillStyle=f.col;cx.shadowColor=f.col;cx.shadowBlur=28;cx.beginPath();cx.arc(f.x,f.y,f.r*(1+(1-a)*1.8),0,TAU);cx.fill();}cx.restore();}
  cx.save();cx.translate(c.shipX,c.shipY);cx.shadowColor=c.invT>0?'#fff':'#62cfff';cx.shadowBlur=34;if(imgReady(IMG.ship)){const d=Math.min(mobileUI()?178:210,W*.18),sc=Math.min(d/IMG.ship.naturalWidth,d/IMG.ship.naturalHeight);cx.drawImage(IMG.ship,-IMG.ship.naturalWidth*sc/2,-IMG.ship.naturalHeight*sc*.56,IMG.ship.naturalWidth*sc,IMG.ship.naturalHeight*sc);}cx.restore();const locked=c.lockTarget&&c.lockT>=.34,r=17+Math.sin(G.elapsed*8)*2;cx.strokeStyle=locked?'#fff09a':'#7cf6ff';cx.lineWidth=locked?3:2;cx.beginPath();cx.arc(c.reticleX,c.reticleY,r,0,TAU);cx.stroke();for(const [dx,dy] of [[-28,0],[28,0],[0,-28],[0,28]]){cx.beginPath();cx.moveTo(c.reticleX+dx*.58,c.reticleY+dy*.58);cx.lineTo(c.reticleX+dx,c.reticleY+dy);cx.stroke();}if(locked){cx.font='900 8px system-ui';cx.textAlign='center';cx.fillStyle='#fff09a';cx.fillText('LOCK',c.reticleX,c.reticleY-25);}if(c.hitMarkerT>0){cx.strokeStyle='#fff';cx.lineWidth=2;for(const [a,b] of [[-7,-7],[7,-7],[-7,7],[7,7]]){cx.beginPath();cx.moveTo(c.reticleX+a*.45,c.reticleY+b*.45);cx.lineTo(c.reticleX+a,c.reticleY+b);cx.stroke();}}cx.restore();
  for(const f of c.floaters){cx.save();cx.globalAlpha=clamp(f.t/f.max,0,1);cx.fillStyle=f.col;cx.shadowColor=f.col;cx.shadowBlur=8;cx.font=`950 ${f.size}px system-ui`;cx.textAlign='center';cx.fillText(f.text,f.x,f.y);cx.restore();}if(c.streak>=3&&c.streakFlashT>0){cx.save();cx.globalAlpha=clamp(c.streakFlashT/.85,0,1);cx.textAlign='center';cx.fillStyle='#a6ff5f';cx.shadowColor='#a6ff5f';cx.shadowBlur=18;cx.font=`950 ${mobileUI()?17:24}px system-ui`;cx.fillText(`⚡ RACHA x${c.streak}`,W/2,H*.20);cx.restore();}
  const remain=Math.max(0,Math.ceil(c.duration-c.time)),mobile=mobileUI(),hudW=mobile?236:318,hudH=mobile?78:86;cx.fillStyle='rgba(2,7,17,.80)';cx.strokeStyle='rgba(124,246,255,.32)';rr(10,8,hudW,hudH,12);cx.fill();cx.stroke();cx.fillStyle='#7cf6ff';cx.font=`900 ${mobile?9.5:11}px system-ui`;cx.fillText(`🎯 CHASE EXTREMO · F${chaseStage(c)} · ${remain}s`,20,23);cx.fillStyle='#fff';cx.font=`800 ${mobile?8:9.5}px system-ui`;cx.fillText(`BAJAS ${c.kills} · ${G.score.toLocaleString()} · RACHA x${c.streak}`,20,40);cx.fillStyle='#ff7890';cx.fillText(`❤${Math.round(c.integrity)}%`,20,58);cx.fillStyle='#7fb7ff';cx.fillText(`⬡${Math.round(c.shield)}`,mobile?72:78,58);let py=75;if(c.overdriveT>0){cx.fillStyle='#ffcf73';cx.fillText(`⚡OD ${Math.ceil(c.overdriveT)}s`,mobile?118:142,58);}if(c.burstT>0){cx.fillStyle='#fff09a';cx.fillText(`✦DMG ${Math.ceil(c.burstT)}s`,mobile?166:215,58);}if(c.boss&&!c.boss.dead){cx.textAlign='center';cx.fillStyle='#ffe66f';cx.font=`900 ${mobile?9:12}px system-ui`;cx.fillText(`☠ INTERCEPTOR · ${Math.ceil(c.boss.hp)}/${c.boss.maxHp}`,W/2,mobile?49:24);cx.textAlign='left';}if(notices.length){cx.textAlign='center';cx.fillStyle=notices[0].color;cx.font='900 9.5px system-ui';cx.fillText(fitNoticeText(notices[0].text,Math.min(W-30,520)),W/2,H-22);cx.textAlign='left';}if(flash>0){cx.fillStyle=`rgba(255,70,90,${flash*.12})`;cx.fillRect(0,0,W,H);}}
function drawChaseVictory(){UI.buttons.length=0;drawBackground();const c=G.chase||{};cx.fillStyle='rgba(0,0,0,.68)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle=c.success?'#a6ff5f':'#ff8b79';cx.font=`900 ${Math.min(42,W*.055)}px system-ui`;cx.fillText(c.success?'★ CHASE BONUS SUPERADO':'⚠ CHASE BONUS FINALIZADO',W/2,H*.18);cx.fillStyle=c.rank==='S'?'#fff09a':c.rank==='A'?'#a6ff5f':c.rank==='B'?'#9fe6ff':'#ff8b79';cx.font='950 25px system-ui';cx.fillText(`RANGO ${c.rank||'C'}`,W/2,H*.27);cx.fillStyle='#eefaff';cx.font='900 17px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · BAJAS ${c.kills||0} · RACHA ${c.bestStreak||0} · +¤${c.reward||0}`,W/2,H*.34);cx.fillStyle='#9fb4c5';cx.font='700 11px system-ui';cx.fillText(`MEJOR ${Number(META.chaseBest||0).toLocaleString()} · MEJOR RANGO ${META.chaseBestRank||'-'} · VICTORIAS ${META.chaseWins||0}`,W/2,H*.40);const w=Math.min(330,W*.38),x=W/2-w/2;uiButton('victory_chase','🎯 REPETIR CHASE',x,H*.54,w,48,'#7cf6ff');uiButton('victory_menu','← MENÚ PRINCIPAL',x,H*.67,w,48,'#a6ff5f');cx.textAlign='left';}

function update(dt){
  if(!G||G.screen!=='GAME'||W<H)return;
  if(G.mode==='chase'){updateChase(dt);return;}
  G.elapsed+=dt;PreBossX.segmentTick();PreBossX.updateMix();if(G.bossCelebration?.t>0){G.bossCelebration.t=Math.max(0,G.bossCelebration.t-dt);}for(const n of notices)n.t-=dt;notices=notices.filter(n=>n.t>0);if(G.waveBanner>0)G.waveBanner-=dt;if(G.sectorBanner>0)G.sectorBanner-=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}if((G.microStreakT||0)>0){G.microStreakT=Math.max(0,G.microStreakT-dt);if(G.microStreakT<=0)G.microStreak=0;}
  G.bossHitT=Math.max(0,(G.bossHitT||0)-dt);G.heartHitT=Math.max(0,(G.heartHitT||0)-dt);G.shieldHitT=Math.max(0,(G.shieldHitT||0)-dt);G.recoveryGraceT=Math.max(0,(G.recoveryGraceT||0)-dt);G.fusionSurgeT=Math.max(0,(G.fusionSurgeT||0)-dt);if(G.fusionSurgeT<=0)G.fusionSurgeTier=0;G.fusionSurgeCd=Math.max(0,(G.fusionSurgeCd||0)-dt);if((G.apexT||0)>0){const beforeA=G.apexT;G.apexT=Math.max(0,G.apexT-dt);G.apexPulseT=(G.apexPulseT||0)-dt;if(G.apexPulseT<=0){G.apexPulseT=.46;G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:G.player.r+10,vr:300+up('apexcore')*45,life:.38,max:.38,col:'#7cf6ff'});}if(beforeA>0&&G.apexT<=0)notify('✦ RIFT APEX AGOTADO','#9fb4c5',.9);}if((G.weaponBoostT||0)>0){const before=G.weaponBoostT;G.weaponBoostT=Math.max(0,G.weaponBoostT-dt);if(before>0&&G.weaponBoostT<=0){G.weaponBoostStacks=0;G.weaponBoostMult=1;notify('⚡ POTENCIADOR DE IMPACTO AGOTADO','#9fb4c5',.8);}}if(G.bossArrivalBanner?.t>0)G.bossArrivalBanner.t=Math.max(0,G.bossArrivalBanner.t-dt);G.bossWarningT=Math.max(0,(G.bossWarningT||0)-dt);if((G.hitStopT||0)>0){G.hitStopT=Math.max(0,G.hitStopT-dt);return;}updateBossArenaAftermath(dt);if(G.frenzyT>0){G.frenzyT=Math.max(0,G.frenzyT-dt);if(G.frenzyT<=0){G.frenzyMult=1;notify(G.frenzyDone?'FRENESÍ COMPLETADO':'FRENESÍ ESCAPÓ','#9fb4c5',1.3);}}
  updateHangarReserves(dt);
  if(G.lastChanceT>0){updateLastChance(dt);if(G.riftAlly)updateRiftAlly(dt);updateAmbientProps(dt);updateParticles(dt);return;}
  updateRiftAlly(dt);
  if(G.postBossT>0){G.postBossT=Math.max(0,G.postBossT-dt);const postElapsed=(G.postBossMax||0)-G.postBossT;if(postElapsed>4&&Math.floor(postElapsed*2)!==Math.floor((postElapsed-dt)*2)){G.particles.push({kind:'halo',x:G.player.x,y:G.player.y,r:G.player.r+12,vr:260,life:.42,max:.42,col:'#fff09a'});}G.eBullets.length=0;G.enemies.length=0;G.obstacles.length=0;G.frontThreats.length=0;G.powerMines=[];updatePowers(dt);updatePlayer(dt);updatePickups(dt);updateParticles(dt);if(G.postBossT<=0||(G.postBossT<G.postBossMax-2.0&&G.pickups.length===0)){if(G.mode==='bossRush')advanceBossRush();else{if(!autoCollectPostBossRewards())return;setScreen('VICTORY');}}return;}
  if(G.preBossT>0){G.preBossT=Math.max(0,G.preBossT-dt);const p=preBossProgress();if(p>.10)preBossCue(1);if(p>.38)preBossCue(2);if(p>.68)preBossCue(3);if(p>.88)preBossCue(4);updatePowers(dt);updatePlayer(dt);updatePickups(dt);updatePreBossSetpiece(dt);updateAmbientProps(dt);updateParticles(dt);if(G.preBossT<=0&&G.bossPending&&!G.boss)spawnBoss();return;}
  updatePowers(dt);updatePlayer(dt);updatePlayerBehavior(dt);updateWorldDynamics(dt);updateWaveObjective(dt);updateSpawns(dt);updateEnemies(dt);updateFamilyManeuver(dt);updateBoss(dt);updateBossFamilyResponse(dt);updateObstacles(dt);updateFrontThreats(dt);updateBullets(dt);updateEnemyBullets(dt);hiveUpdate(dt);updatePickups(dt);updateParticles(dt);
  if(!G.boss&&!G.bossPending&&!G.sectorClear&&G.kills>=Math.ceil(G.goal*.58)&&G.frenzyWave!==G.wave&&canStartFrenzy())activateFrenzy();
  if(shake>0)shake=Math.max(0,shake-dt*18);if(flash>0)flash=Math.max(0,flash-dt*1.8);
  if(!G.sectorClear&&G.kills>=G.goal&&!G.boss&&G.enemies.filter(e=>!e.dead&&!e.microSwarm).length===0&&!waveObjectiveBlocksClear()){
    if(G.mode==='training'){if(!G.bossPending){G.bossPending=true;G.trainingBoss=true;setTimeout(()=>{if(G?.screen==='GAME'&&G.bossPending&&!G.boss)spawnBoss();},650);}}
    else if(G.wave<3){awardWaveClear();G.wave++;G.kills=0;G.goal=waveGoal(G.sector,G.wave);G.spawn=.9;G.waveBanner=2.2;G.player.shield=Math.min(G.player.maxShield,G.player.shield+15);grantCredits(waveTransitionReward(G.sector,G.wave),'wave_transition',true);grantRewardXp(45+G.sector*12,'wave_transition');G.waveHits=0;G.waveFrontKills=0;G.waveStartT=G.elapsed;G.frenzyKills=0;G.frenzyTarget=0;G.frenzyDone=false;G.frenzySupportUsed=false;G.worldEventCount=0;G.worldEventTimer=rnd(13,20);G.pressureReliefWave=0;G.emergencyHealthDrops={half:false,quarter:false,critical:false};resetCombatDirector();prepareWaveObjective();saveRun();const act=waveActLabel();notify(`ORDA ${G.wave}/3 · ${act|| (G.wave===2?'PRESIÓN TÁCTICA':'ASEDIO TOTAL')}`,'#ffd76a',2.0);}
    else if(!G.bossPending){awardWaveClear();startPreBossSequence();}
  }
}
function updatePowers(dt){
  for(const k of Object.keys(G.powers)){G.powers[k]-=dt;if(G.powers[k]<=0)delete G.powers[k];}
  if(G.overflowPowerKey&&!powerOn(G.overflowPowerKey)){G.overflowPowerKey=null;G.overflowPowerMax=0;}
  pumpPowerQueue();updateComboState();
  timers.missile-=dt;timers.rail-=dt;timers.tesla-=dt;timers.gravity-=dt;timers.drone-=dt;timers.resonance-=dt;timers.sparklaser-=dt;timers.bio-=dt;timers.phase-=dt;timers.nanites-=dt;timers.riftmine-=dt;timers.echo-=dt;timers.nova-=dt;timers.ionweb-=dt;timers.orbitblade-=dt;
  if(powerOn('missile')&&timers.missile<=0){timers.missile=(G.activeCombos[comboId('gravity','missile')]?.56:.82)/(1+(powerRank('missile')-1)*.16);fireMissile();}
  if(powerOn('rail')&&timers.rail<=0){timers.rail=((G.activeCombos[comboId('rail','twin')]?1.12:1.52)/(1+(powerRank('rail')-1)*.13))*(branchIs('rail','B')?.82:1);fireRail();}
  if(powerOn('tesla')&&timers.tesla<=0){timers.tesla=((G.activeCombos[comboId('cryo','tesla')]?.68:.94)/(1+(powerRank('tesla')-1)*.16))*(branchIs('tesla','B')?.83:1);teslaPulse();}
  if(powerOn('gravity')&&timers.gravity<=0){timers.gravity=(1.9-(powerRank('gravity')-1)*.22)*(branchIs('gravity','B')?.80:1);gravityPulse();}
  if(powerOn('shield')&&G.player.shield<G.player.maxShield)G.player.shield=Math.min(G.player.maxShield,G.player.shield+dt*(2.8+powerRank('shield')*1.4)*(branchIs('shield','A')?1.35:1));
  if(powerOn('resonance')&&timers.resonance<=0){timers.resonance=Math.max(.55,1.45-(powerRank('resonance')-1)*.17)*(branchIs('resonance','B')?.82:1);resonancePulse();}
  if(powerOn('sparklaser')&&timers.sparklaser<=0){timers.sparklaser=Math.max(.12,.31-(powerRank('sparklaser')-1)*.032)*(branchIs('sparklaser','B')?.88:1);sparkLaserPulse();}
  if(powerOn('bio')&&timers.bio<=0){timers.bio=Math.max(.48,.88-(powerRank('bio')-1)*.07);fireBioShot();}
  if(powerOn('phase')&&timers.phase<=0){timers.phase=Math.max(.30,1.10-(powerRank('phase')-1)*.085)*(G.activeCombos[comboId('phase','rail')]?.72:1)*(branchIs('phase','B')?.82:1);phaseLance();}
  if(powerOn('nanites')&&timers.nanites<=0){timers.nanites=Math.max(.32,.78-(powerRank('nanites')-1)*.055);nanitePulse();}
  if(powerOn('riftmine')&&timers.riftmine<=0){timers.riftmine=Math.max(.72,1.65-(powerRank('riftmine')-1)*.10);deployRiftMine();}
  if(powerOn('echo')&&timers.echo<=0){timers.echo=Math.max(.36,1.18-(powerRank('echo')-1)*.075)*(branchIs('echo','B')?.82:1);temporalEchoVolley();}
  if(powerOn('nova')&&timers.nova<=0){timers.nova=Math.max(1.0,2.65-(powerRank('nova')-1)*.14)*(G.activeCombos[comboId('nova','resonance')]?.78:1)*(branchIs('nova','B')?.82:1);entomicNova();}
  if(powerOn('ionweb')&&timers.ionweb<=0){timers.ionweb=Math.max(.58,1.55-(powerRank('ionweb')-1)*.075)*(branchIs('ionweb','B')?.82:1);ionWebPulse();}
  if(powerOn('orbitblade')&&timers.orbitblade<=0){timers.orbitblade=Math.max(.36,.92-(powerRank('orbitblade')-1)*.052)*(branchIs('orbitblade','B')?.82:1);orbitBladePulse();}
  updatePowerMines(dt);
}
function updatePlayer(dt){
  const p=G.player,a=axes(),lv=G.level||1;p.inv=Math.max(0,p.inv-dt);
  const lvlSpeed=1+Math.min(.28,(lv-1)*.026),speed=285*(1+up('engine')*.05)*(relicUnlocked(9)?1.04:1)*lvlSpeed*(powerOn('overdrive')?(1.18+powerRank('overdrive')*.08):1),responseBase=Math.max(.00008,.001*Math.pow(.82,lv-1)),responseBoost=1+up('dash')*.03,response=1-Math.pow(responseBase,dt*responseBoost);
  p.vx=lerp(p.vx,a.x*speed,response);p.vy=lerp(p.vy,a.y*speed,response);if(Math.abs(a.x)<.05)p.vx*=Math.pow(.72,dt*60*(1+lv*.025)*responseBoost);if(Math.abs(a.y)<.05)p.vy*=Math.pow(.72,dt*60*(1+lv*.025)*responseBoost);p.x+=p.vx*dt;p.y+=p.vy*dt;
  const bounds=playerCombatBounds();p.x=clamp(p.x,bounds.left,bounds.right);p.y=clamp(p.y,bounds.top,bounds.bottom);
  const rate=Math.max(.052,.19*(1-up('rate')*.055)*(powerOn('overdrive')?(0.82-powerRank('overdrive')*.05):1)*(powerOn('burst')?(0.86-powerRank('burst')*.05):1)*(1-Math.min(.16,(lv-1)*.008))*(G.fusionSurgeT>0?.90:1)*riftApexRateMult());p.fire-=dt;if(p.fire<=0){p.fire=rate;firePlayer();}
  const count=supportCount();if(count>0&&timers.drone<=0){timers.drone=supportRate();fireSupportVolley();}
}
function updateSpawns(dt){
  if(G.boss||G.bossPending||G.sectorClear)return;updateMicroSwarmDirector(dt);G.spawn-=dt;G.obstacleTimer-=dt;G.frontTimer-=dt;G.transversalTimer=(G.transversalTimer??rnd(7,11))-dt;G.formationTimer=(G.formationTimer??rnd(5.5,8.5))-dt;updateCombatDirector(dt);
  const prof=directorProfile(),bal=sectorBalance(),rd=runDifficulty(),adaptive=adaptivePressure(),alive=G.enemies.filter(e=>!e.dead&&!e.microSwarm).length,phase=directorPhase(),phaseAlive=phase==='CLÍMAX'||phase==='FRENESÍ'?1.12:phase==='PRESIÓN'||phase==='SATURACIÓN'?1.06:1;
  const maxAlive=Math.max(4,Math.round((7.2+G.sector*.92+G.wave*2.05)*bal.maxAlive*1.10*rd.maxAlive*phaseAlive*(prof.maxAlive||1)*(G.frenzyT>0?1.18:1)*(G.mode==='training'?.62:1)*encounterEnemyFactor()*adaptive.alive*performanceEnemyFactor()));
  if(G.wave>=2&&G.formationTimer<=0&&G.kills<G.goal-3&&alive<maxAlive-2&&encounterCanSpend(3)){spawnFormation();G.formationTimer=(rnd(G.wave===3?5.4:7.2,G.wave===3?8.0:10.0)/(runDifficultyKey()==='hard'?1.10:1))*(prof.formationCadence||1);}
  if(G.spawn<=0&&G.kills<G.goal&&alive<maxAlive&&encounterCanSpend(1)){
    const chance=clamp((G.wave===3?.46:G.wave===2?.28:.12)+(prof.burstBias||0),.04,.70);let burstCount=1;if(Math.random()<chance)burstCount=(G.wave===3&&Math.random()<.38)?3:2;
    if(runDifficultyKey()==='hard'&&Math.random()<.20)burstCount++;
    for(let i=0;i<burstCount&&G.enemies.filter(e=>!e.dead&&!e.microSwarm).length<maxAlive;i++)spawnEnemy();
    const phasePressure=phase==='CLÍMAX'||phase==='FRENESÍ'?.78:phase==='EMBOSCADA'||phase==='SATURACIÓN'?.86:phase==='PRESIÓN'||phase==='ASEDIO'?.92:1;
    const waveTempo=ch2WaveSpec()?.spawn||1;G.spawn=Math.max(.11,.91-difficulty()*.101-G.wave*.064)*rnd(.66,1.02)*(G.frenzyT>0?.66:1)*(G.mode==='training'?1.15:1)/(bal.pressure*rd.pressure*(G.directorPressure||1))*phasePressure*(prof.cadence||1)*waveTempo*adaptive.cadence;
  }
  const obstacleCap=Math.max(1,(G.mode==='training'?1:(G.sector===1?3:5))+(prof.obstacleCap||0));
  if(G.obstacleTimer<=0&&encounterCanSpend(.8)&&G.obstacles.length<obstacleCap){spawnObstacle();G.obstacleTimer=(rnd(G.sector===1?2.7:2.1,G.sector===1?4.4:3.8)/Math.min(1.58,difficulty())/(runDifficultyKey()==='hard'?1.08:1))*(prof.obstacleCadence||1);}
  if(G.frontTimer<=0&&encounterCanSpend(1.8)&&G.frontThreats.length<(G.mode==='training'?1:(runDifficultyKey()==='hard'?3:2))){spawnFrontThreat();G.frontTimer=((rnd(G.mode==='training'?8:5.8,G.mode==='training'?11:9.8)-Math.min(1.8,G.sector*.18))/(runDifficultyKey()==='hard'?1.10:1))*(prof.frontCadence||1);}
  const transAlive=G.enemies.filter(e=>!e.dead&&e.kind==='transversal').length;if(G.transversalTimer<=0&&G.mode!=='training'&&encounterCanSpend(1.8)&&!activeWaveObjective()&&transAlive<(runDifficultyKey()==='hard'?3:2)){spawnTransversal();G.transversalTimer=(rnd(runDifficultyKey()==='hard'?6.5:8.5,runDifficultyKey()==='hard'?10.5:13.5)-Math.min(2.0,G.sector*.12))*(prof.transversalCadence||1);}
}
function updateEnemyShip(e,dt,p){
  e.specialCd-=dt;e.fireCd-=dt;e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);const sm=e.slow>0?.58:1;
  if(e.shipClass==='ship_scout'){
    if(e.dashT>0){e.dashT-=dt;e.x+=e.dashVX*dt*sm;e.y+=e.dashVY*dt*sm;}
    else{e.x+=((e.x>W*.78?-e.spd*.8:e.x<W*.64?e.spd*.35:-e.spd*.12))*dt*sm;e.y+=Math.sin(e.t*5+e.phase)*105*dt*sm;if(e.specialCd<=0){const a=Math.atan2(p.y-e.y,p.x-e.x);e.dashVX=Math.cos(a)*e.spd*2.6;e.dashVY=Math.sin(a)*e.spd*2.6;e.dashT=.52;e.specialCd=rnd(2.0,3.0);AudioX.tone(520,.08,.025,'triangle');}}
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.82,1.05);const a=Math.atan2(p.y-e.y,p.x-e.x);spawnEnemyBullet(e.x,e.y,a,330+G.sector*7,7,4,'#78dfff');}
  }else if(e.shipClass==='ship_frigate'){
    e.x+=((e.x>W*.80?-e.spd*.55:e.x<W*.68?e.spd*.25:0))*dt*sm;e.y+=clamp((p.y-e.y)*.55,-80,80)*dt*sm;
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.9,1.15);const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.13,270+G.sector*5,8,5,'#ffbd82');}
    if(e.specialCd<=0){e.specialCd=rnd(3.4,4.5);ringBullets(e.x,e.y,6,165+G.sector*5,6,'#ffc98e',e.t);}
  }else{
    e.x+=((e.x>W*.84?-e.spd*.48:e.x<W*.72?e.spd*.18:0))*dt*sm;e.y+=Math.sin(e.t*1.8+e.phase)*48*dt*sm;
    if(e.fireCd<=0){e.fireCd=e.fireRate*rnd(.95,1.2);const a=Math.atan2(p.y-e.y,p.x-e.x);spawnEnemyBullet(e.x,e.y,a,215+G.sector*4,13,8,'#ff795f');}
    if(e.specialCd<=0){e.specialCd=rnd(3.8,5.0);const sec=SECTORS[G.sector-1],size=20,hp=55+G.sector*16;G.obstacles.push({x:e.x-18,y:e.y+rnd(-36,36),r:size,type:'mine',hp,maxHp:hp,vx:-95,rot:rnd(0,TAU),t:0,col:'#ff795f',contact:14+G.sector*1.5,assetIndex:obstacleAssetIndex(sec,'mine')});AudioX.tone(165,.12,.03,'square');}
  }
  e.y=clamp(e.y,35,H-35);if(dist(e,p)<e.r+p.r){hitPlayer(e.contact);e.x+=45;}if(e.x<-80){e.dead=true;hitPlayer(7+G.sector*.8);}
}
function updateEnemies(dt){
  const p=G.player;
  for(const e of G.enemies){
    if(e.dead)continue;e.t+=dt;e.bio=Math.max(0,(e.bio||0)-dt);if(updateEnemyEntry(e,dt))continue;if(e.kind==='transversal'){updateTransversalEnemy(e,dt,p);continue;}if(e.kind==='lieutenant'){updateLieutenantEnemy(e,dt,p);continue;}if(e.kind==='ship'){updateEnemyShip(e,dt,p);continue;}e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);e.surgeT=Math.max(0,(e.surgeT||0)-dt);const sm=e.slow>0?.54:1;let vx=-e.spd,vy=0;
    if(e.surgeT>0){vx=e.surgeVX;vy=e.surgeVY;}else switch(e.move){
      case 'sine':vy=Math.sin(e.t*3+e.phase)*85;break;
      case 'rush':{const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*1.1;vy=Math.sin(a)*e.spd*1.1;break;}
      case 'hover':vx=-e.spd*.55;vy=Math.sin(e.t*2.1+e.phase)*55;break;
      case 'wave':vx=-e.spd*.82;vy=Math.sin(e.t*4+e.phase)*110;break;
      case 'flutter':vx=-e.spd*(.72+.28*Math.sin(e.t*5));vy=Math.sin(e.t*7+e.phase)*105;break;
      case 'sniper':vx=e.x>W*.72?-e.spd*.65:e.x<W*.58?e.spd*.4:0;vy=Math.sin(e.t*1.6)*35;break;
      case 'zig':vx=-e.spd;vy=(Math.sin(e.t*5+e.phase)>0?1:-1)*75;break;
      case 'dash':{const pulse=(Math.sin(e.t*3.5+e.phase)>.55)?1.8:.7;const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*pulse;vy=Math.sin(a)*e.spd*pulse;break;}
      case 'leap':{const pulse=Math.max(.35,(Math.sin(e.t*3.2+e.phase)+1)*.7);vx=-e.spd*pulse;vy=Math.sin(e.t*3.2+e.phase)*130;break;}
      case 'dart':vx=-e.spd*(1.1+.7*Math.max(0,Math.sin(e.t*4)));vy=Math.sin(e.t*6+e.phase)*80;break;
      case 'orbit':{const a=Math.atan2(p.y-e.y,p.x-e.x);vx=Math.cos(a)*e.spd*.75-Math.sin(a)*85;vy=Math.sin(a)*e.spd*.75+Math.cos(a)*85;break;}
      default:break;
    }
    if(e.bossReactive&&G.boss&&!G.boss.dead){
      const a=(e.phase||0)+e.t*1.65,rad=G.boss.r*1.05+38+(e.microIndex||0)*5;
      const tx=G.boss.x+Math.cos(a)*rad,ty=G.boss.y+Math.sin(a)*rad*.72;
      vx=clamp((tx-e.x)*3.2,-e.spd*1.4,e.spd*1.4);vy=clamp((ty-e.y)*3.2,-e.spd*1.4,e.spd*1.4);
    }else{
      const famMove=applyFamilyTacticalMovement(e,p,vx,vy,dt);vx=famMove.vx;vy=famMove.vy;
    }
    e.x+=vx*dt*sm;e.y+=vy*dt*sm;e.y=clamp(e.y,35,H-35);
    e.fireCd-=dt;if(e.fireCd<=0&&e.fireRate<10){e.fireCd=e.fireRate*rnd(.85,1.2);enemyShoot(e,(e.form==='bomber'||e.form==='shocker'||e.form==='sonic'||e.form==='sonic_cantor'||e.form==='resonance_breaker'||e.form==='hemodrone')?'spread':'aim');}
    if(e.specialCd<900){e.specialCd-=dt;if(e.specialCd<=0){
      if(e.form==='needler'){const a=Math.atan2(p.y-e.y,p.x-e.x);e.surgeVX=Math.cos(a)*e.spd*2.65;e.surgeVY=Math.sin(a)*e.spd*2.65;e.surgeT=.34;e.specialCd=rnd(2.0,3.0);AudioX.tone(690,.06,.018,'triangle');}
      else if(e.form==='hemodrone'){ringBullets(e.x,e.y,6,155,6,'#ff6175',e.t);e.specialCd=rnd(2.3,3.3);}
      else if(e.form==='bloodreaper'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-1;k<=1;k++)spawnEnemyBullet(e.x,e.y,a+k*.12,305,9,5,'#ff4965',e);if(G.obstacles.length<8){const hp=105+G.sector*18;G.obstacles.push({x:e.x-15,y:e.y+rnd(-30,30),r:25,type:'bloodcapsule',hp,maxHp:hp,vx:-70,vy:rnd(-15,15),entry:'drop',rot:rnd(0,TAU),t:0,col:'#8f1728',contact:16+G.sector,assetIndex:0});}e.specialCd=rnd(2.8,4.0);}
      else if(e.form==='mandible_guard'){if(G.obstacles.length<8){const hp=140+G.sector*25;G.obstacles.push({x:e.x-18,y:e.y,r:31,type:'resinpanel',hp,maxHp:hp,vx:-35,vy:0,entry:'guard',rot:0,t:0,col:'#9b641a',contact:17+G.sector,assetIndex:1});}e.specialCd=rnd(3.2,4.5);}
      else if(e.form==='siegebuilder'&&G.obstacles.length<8){spawnObstacle();e.specialCd=rnd(3.0,4.4);}
      else if(e.form==='prism_hunter'){const a=Math.atan2(p.y-e.y,p.x-e.x);for(let k=-2;k<=2;k++)spawnEnemyBullet(e.x,e.y,a+k*.085,330,8,4,'#78ecff',e);e.specialCd=rnd(1.7,2.6);}
      else if(e.form==='lance_predator'){const a=Math.atan2(p.y-e.y,p.x-e.x);e.surgeVX=Math.cos(a)*e.spd*2.9;e.surgeVY=Math.sin(a)*e.spd*2.9;e.surgeT=.42;for(let i=0;i<4;i++)G.particles.push({kind:'slash',x:e.x-i*18,y:e.y,a:0,len:30+i*8,life:.18,max:.18,col:'#78ecff'});e.specialCd=rnd(2.0,3.1);AudioX.sparkLaser();}
      else if(e.form==='nymph_echo'){ringBullets(e.x,e.y,5,140,6,'#c18cff',e.t);setTimeout(()=>{if(G?.screen==='GAME'&&!e.dead)ringBullets(e.x,e.y,5,165,6,'#f2d277',e.t+.3);},180);e.specialCd=rnd(2.4,3.5);}
      else if(e.form==='sonic_cantor'||e.form==='resonance_breaker'){ringBullets(e.x,e.y,e.form==='resonance_breaker'?10:7,145+(e.form==='resonance_breaker'?28:0),7+(e.form==='resonance_breaker'?2:0),'#d9a7ff',e.t);e.specialCd=rnd(2.2,3.4);}
    }}
    if(dist(e,p)<e.r+p.r){if(e.microSwarm){hitPlayer(Math.min(3.5,e.contact||2));e.x-=38;e.y+=rnd(-28,28);}else{hitPlayer(e.contact);e.x+=45;}}
    if(e.x<-80){if(e.microSwarm){e.dead=true;}else if(e.form==='flashwing'&&(e.passes||0)<1){e.passes=(e.passes||0)+1;e.x=W+55;e.y=clamp(H-e.y+rnd(-45,45),45,H-45);e.entryT=.18;e.specialCd=Math.min(e.specialCd||2,1.1);}else{objectiveEnemyEscaped(e);e.dead=true;hitPlayer(7+G.sector*.8);}}
  }
  G.enemies=G.enemies.filter(e=>!e.dead&&e.x>-120);
}
function bossArenaHazard(b,p,sec){
  if(G.mode==='training'||G.postBossT>0)return;
  if(b.pattern==='storm'){
    const lanes=[H*.22,H*.43,H*.64,H*.82],safe=rndI(0,lanes.length-1);for(let i=0;i<lanes.length;i++){if(i===safe)continue;for(let k=0;k<6;k++)spawnEnemyBullet(W-k*85,lanes[i],Math.PI,300+b.phase*25,8+b.phase*.6,4,'#ffe66f',b,commanderProjectileFx(b,'arena',true));}
    notify('ARENA · CORREDORES DE AGUIJÓN','#ffe66f',1.1);
  }else if(b.pattern==='titan'){
    for(let i=0;i<2+b.phase;i++){const x=W*.48+i*W*.11,y=i%2?H*.72:H*.28;G.particles.push({kind:'shock',x,y,r:10,vr:300,life:.65,max:.65,col:sec.accent});ringBullets(x,y,6+b.phase,125+b.phase*18,7+b.phase*.5,sec.accent,b.t+i*.25,b,'arena');}b.guardT=Math.max(b.guardT,.55);
    notify('ARENA · IMPACTO ATLAS',sec.accent,1.1);
  }else if(b.pattern==='blade'){
    const ys=[H*.27,H*.52,H*.77];for(let i=0;i<ys.length;i++){const dir=i%2?1:-1;G.particles.push({kind:'slash',x:W*.55,y:ys[i],a:dir>0?0:Math.PI,len:W*.86,life:.42,max:.42,col:'#ff9a55'});for(let k=0;k<5;k++)spawnEnemyBullet(dir>0?0:W,ys[i]+(k-2)*12,dir>0?0:Math.PI,340+b.phase*24,9,4,'#ff9a55',b,commanderProjectileFx(b,'arena',true));}
    notify('ARENA · PASILLO RAZOR','#ff9a55',1.1);
  }else if(b.pattern==='moth'){
    const centers=[[W*.34,H*.28],[W*.56,H*.68],[W*.76,H*.34]];for(const [x,y] of centers){G.particles.push({kind:'halo',x,y,r:16,vr:190,life:1.0,max:1.0,col:'#e9b7ff'});ringBullets(x,y,7+b.phase,110+b.phase*18,7,'#e9b7ff',b.t,b,'arena');}
    notify('ARENA · POLEN DE ECLIPSE','#e9b7ff',1.1);
  }else if(b.pattern==='queen'){
    for(let i=0;i<1+b.phase;i++)spawnEnemy(pick(sec.forms.slice(0,Math.min(3,b.phase+1))),W*.72,rnd(H*.18,H*.82),'summon');for(let row=-1;row<=1;row++)for(let k=0;k<4;k++)spawnEnemyBullet(W-k*70,H*.5+row*78,Math.PI,250+b.phase*18,8,5,'#ff746b',b,commanderProjectileFx(b,'arena',true));
    notify('ARENA · MARCHA DE COLONIA','#ff746b',1.1);
  }else if(b.pattern==='leap'){
    const points=[[W*.38,H*.28],[W*.58,H*.72],[W*.78,H*.34]];for(const [x,y] of points){G.particles.push({kind:'shock',x,y,r:12,vr:430,life:.68,max:.68,col:sec.accent});ringBullets(x,y,7+b.phase*2,155+b.phase*20,8,sec.accent,b.t,b,'arena');}
    notify('ARENA · ZONA DE IMPACTO',sec.accent,1.1);
  }else if(b.pattern==='blood'){
    const ys=[H*.24,H*.5,H*.76];for(const y of ys){for(let k=-1;k<=1;k++)spawnEnemyBullet(W+10,y,Math.PI+k*.035,230+b.phase*22,8+b.phase,'#ff4965',b,commanderProjectileFx(b,'arena',true));}
    if(b.phase>=2&&G.obstacles.length<5){const old=G.sector;spawnObstacle();G.sector=old;}
    G.particles.push({kind:'halo',x:W*.58,y:H*.5,r:18,vr:220,life:.8,max:.8,col:'#ff6175'});notify('ARENA · MAREA HEMÁTICA','#ff6175',1.2);
  }else if(b.pattern==='architect'){
    for(let i=0;i<Math.min(3,b.phase+1);i++){const hp=150+G.sector*28;G.obstacles.push({x:W*.55+i*W*.12,y:i%2?H*.68:H*.32,r:34,type:i===2?'resinnode':'resinwall',hp,maxHp:hp,vx:-28,vy:0,entry:'arena',rot:0,t:0,col:sec.base,contact:18+G.sector,assetIndex:0});}
    b.guardT=Math.max(b.guardT,.8+b.phase*.25);notify('ARENA · FORTIFICACIÓN VIVA','#ffd56a',1.2);
  }else if(b.pattern==='odonata'){
    const lanes=[H*.22,H*.42,H*.62,H*.82],safe=rndI(0,lanes.length-1);for(let i=0;i<lanes.length;i++){if(i===safe)continue;const y=lanes[i];G.particles.push({kind:'slash',x:W*.52,y,a:0,len:W*.92,life:.48,max:.48,col:'#78ecff'});for(let k=0;k<7;k++)spawnEnemyBullet(W-k*95,y+rnd(-5,5),Math.PI,380+b.phase*28,8+b.phase*.6,4,'#9af7ff',b,commanderProjectileFx(b,'arena',true));}
    notify('ARENA · CORREDOR DE TORMENTA','#78ecff',1.15);
  }else if(b.pattern==='resonance'){
    const centers=[[W*.32,H*.28],[W*.48,H*.72],[W*.66,H*.32]];for(const [x,y] of centers){G.particles.push({kind:'shock',x,y,r:10,vr:360,life:.7,max:.7,col:'#d9a7ff'});ringBullets(x,y,8+b.phase*2,125+b.phase*18,7+b.phase*.7,'#d9a7ff',b.t,b,'arena');}
    if(b.phase===3&&G.enemies.length<5){const oldSec=G.sector;const legacy=SECTORS[rndI(0,8)];spawnEnemy(legacy.forms[1],b.x-50,rnd(H*.2,H*.8),'summon');G.enemies[G.enemies.length-1].family=legacy.family;}
    notify('ARENA · ECO CATEDRAL','#d9a7ff',1.15);
  }
}
function bossSignatureMovement(b,p,sec,dt){
  b.signatureCd=(b.signatureCd??3.5)-dt/COMMANDER_DIFFICULTY.tempo;b.signatureT=Math.max(0,(b.signatureT||0)-dt);b.afterimageT=Math.max(0,(b.afterimageT||0)-dt);
  if(b.pattern==='storm'){
    if(b.signatureT>0){const q=1-b.signatureT/(.62+.07*b.phase);b.x=lerp(b.sigX0,b.sigX1,clamp(q,0,1));b.y=lerp(b.sigY0,b.sigY1,clamp(q,0,1));if(Math.random()<dt*22)G.particles.push({kind:'slash',x:b.x,y:b.y,a:Math.PI,len:70,life:.13,max:.13,col:'#ffe66f'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.62+.07*b.phase;b.sigX0=W*.82;b.sigY0=clamp(p.y+b.signatureSide*H*.22,90,H-90);b.sigX1=W*.42;b.sigY1=clamp(p.y-b.signatureSide*H*.12,90,H-90);b.signatureSide*=-1;b.signatureCd=Math.max(2.2,5.0-b.phase*.55);return true;}
  }else if(b.pattern==='titan'){
    if(b.signatureT>0){b.x=lerp(b.x,W*.50,clamp(dt*2.0,0,1));b.y=lerp(b.y,H*.5,clamp(dt*1.8,0,1));b.guardT=Math.max(b.guardT,.18);return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.82;b.signatureCd=Math.max(3.0,6.2-b.phase*.6);b.guardT=Math.max(b.guardT,1.05);ringBullets(b.x,b.y,8+b.phase*2,145,8,sec.accent,b.t,b,'signature');return true;}
  }else if(b.pattern==='blade'){
    if(b.signatureT>0){const q=1-b.signatureT/.52;b.x=lerp(b.sigX0,b.sigX1,clamp(q,0,1));b.y=lerp(b.sigY0,b.sigY1,clamp(q,0,1));if(Math.random()<dt*30)G.particles.push({kind:'slash',x:b.x,y:b.y,a:0,len:rnd(55,115),life:.16,max:.16,col:'#ff9a55'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.52;b.sigX0=W*.82;b.sigY0=b.signatureSide>0?H*.22:H*.78;b.sigX1=W*.40;b.sigY1=b.signatureSide>0?H*.74:H*.26;b.signatureSide*=-1;b.signatureCd=Math.max(1.9,4.4-b.phase*.5);return true;}
  }else if(b.pattern==='moth'){
    if(b.signatureT>0){b.x=lerp(b.x,b.anchorX,clamp(dt*3.0,0,1));b.y=lerp(b.y,b.anchorY,clamp(dt*3.0,0,1));if(Math.random()<dt*12)G.particles.push({kind:'halo',x:b.x,y:b.y,r:12,vr:140,life:.36,max:.36,col:'#e9b7ff'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){const anchors=[[W*.48,H*.24],[W*.72,H*.30],[W*.50,H*.74],[W*.76,H*.68]];const a=pick(anchors);b.anchorX=a[0];b.anchorY=a[1];b.signatureT=.72;b.signatureCd=Math.max(2.5,5.5-b.phase*.55);ringBullets(b.x,b.y,5+b.phase,115,7,'#e9b7ff',b.t,b,'signature');return false;}
  }else if(b.pattern==='queen'){
    if(b.signatureT>0){b.x=lerp(b.x,W*.57,clamp(dt*2.4,0,1));b.y=lerp(b.y,H*.5,clamp(dt*2.4,0,1));return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.78;b.signatureCd=Math.max(3.0,6.4-b.phase*.65);for(let i=0;i<b.phase;i++)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-25,b.y+rnd(-110,110));return true;}
  }else if(b.pattern==='leap'){
    if(b.signatureT>0){const q=1-b.signatureT/.58;b.x=lerp(b.sigX0,b.sigX1,clamp(q,0,1));b.y=lerp(b.sigY0,b.sigY1,clamp(Math.sin(clamp(q,0,1)*Math.PI)*.55+q*.45,0,1));if(Math.random()<dt*18)G.particles.push({kind:'shock',x:b.x,y:b.y,r:8,vr:120,life:.22,max:.22,col:sec.accent});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.58;b.sigX0=b.x;b.sigY0=b.y;b.sigX1=b.signatureSide>0?W*.44:W*.80;b.sigY1=b.signatureSide>0?H*.72:H*.28;b.signatureSide*=-1;b.signatureCd=Math.max(2.1,4.8-b.phase*.5);return true;}
  }else if(b.pattern==='blood'){
    if(b.signatureT>0){const tx=clamp(p.x+W*.23,W*.46,W*.78),ty=clamp(p.y+b.signatureSide*H*.22,90,H-90);b.x=lerp(b.x,tx,clamp(dt*3.8,0,1));b.y=lerp(b.y,ty,clamp(dt*4.2,0,1));if(Math.random()<dt*18)G.particles.push({kind:'spark',x:b.x+rnd(-26,26),y:b.y+rnd(-34,34),vx:rnd(-120,20),vy:rnd(-70,70),r:rnd(1,3),life:.25,max:.25,col:'#ff6175'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.9+.16*b.phase;b.signatureSide*=-1;b.signatureCd=Math.max(2.4,5.0-b.phase*.55);AudioX.tone(185,.14,.035,'sine',0,110);return false;}
  }else if(b.pattern==='architect'){
    if(b.phase>=2&&b.signatureCd<=0){const types=b.phase===3?['resinwall','resinnode','resinwall']:['resinwall','resinnode'];for(let i=0;i<types.length;i++){const hp=170+G.sector*30;G.obstacles.push({x:W*(.52+i*.12),y:(i%2?H*.68:H*.30),r:types[i]==='resinnode'?28:38,type:types[i],hp,maxHp:hp,vx:-16,vy:0,entry:'fortress',rot:0,t:0,col:sec.base,contact:19+G.sector,assetIndex:i});}b.guardT=Math.max(b.guardT,1.15+b.phase*.22);b.signatureCd=Math.max(3.8,7.4-b.phase*.7);bossVfx(b,'#ffd56a',12);return false;}
  }else if(b.pattern==='odonata'){
    if(b.signatureT>0){const q=1-b.signatureT/(.58+.08*b.phase),ease=clamp(q,0,1);b.x=lerp(b.sigX0,b.sigX1,ease);b.y=lerp(b.sigY0,b.sigY1,ease);if(Math.random()<dt*35)G.particles.push({kind:'slash',x:b.x-rnd(15,55),y:b.y,a:0,len:rnd(45,110),life:.16,max:.16,col:'#78ecff'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){b.signatureT=.58+.08*b.phase;b.sigX0=W*.82;b.sigY0=b.signatureSide>0?H*.18:H*.82;b.sigX1=W*.38;b.sigY1=b.signatureSide>0?H*.82:H*.18;b.signatureSide*=-1;b.signatureCd=Math.max(1.8,4.2-b.phase*.55);AudioX.sparkLaser();return true;}
  }else if(b.pattern==='resonance'){
    if(b.signatureT>0){b.x=lerp(b.x,b.anchorX,clamp(dt*3.2,0,1));b.y=lerp(b.y,b.anchorY,clamp(dt*3.2,0,1));if(Math.random()<dt*9)G.particles.push({kind:'halo',x:b.x,y:b.y,r:b.r*.35,vr:180,life:.4,max:.4,col:'#d9a7ff'});return true;}
    if(b.phase>=2&&b.signatureCd<=0){const anchors=[[W*.48,H*.25],[W*.72,H*.28],[W*.52,H*.72],[W*.76,H*.68]];const a=pick(anchors);b.anchorX=a[0];b.anchorY=a[1];b.signatureT=.7;b.signatureCd=Math.max(2.5,5.4-b.phase*.65);ringBullets(b.x,b.y,6+b.phase*2,130+b.phase*18,7,'#c18cff',b.t,b,'signature');return false;}
  }
  return false;
}

// v2.15.9 · BOSS IDENTITY PASS II — los diez bosses 11–20 tienen gramática propia.
// La dificultad nace de espacio, lectura, locomoción y coordinación; no de inflar HP.
const CH2_BOSS_IDENTITIES={
  11:{key:'KHEPRI',name:'SCARAB IMPERATOR',signature:'ÓRBITA KHEPRI',color:'#62dfff',wind:.92,active:2.15,cool:[9.2,8.0,6.9],phases:['ASCENSO KHEPRI','GRAVEDAD CELESTE','SOL NEGRO IMPERATOR'],movement:'orbital-gravity'},
  12:{key:'VESPERA',name:'VESPERA LANCER',signature:'PICA VECTORIAL',color:'#8dff58',wind:.78,active:1.55,cool:[8.4,7.2,6.1],phases:['ACECHO VECTORIAL','LANZA TÓXICA','PREDACIÓN VESPERA'],movement:'lancer-passes'},
  13:{key:'REGENT',name:'REGENT MANDIBLE',signature:'TENAZA REGICIDA',color:'#ff7358',wind:.96,active:1.75,cool:[9.5,8.3,7.1],phases:['CERROJO DE OBSIDIANA','TENAZA DE FORJA','REGICIDIO'],movement:'crusher-clamp'},
  14:{key:'PYROLUX',name:'PYROLUX BEACON',signature:'CONSTELACIÓN LÚMEN',color:'#ffcc62',wind:.88,active:2.35,cool:[9.0,7.8,6.6],phases:['BALIZA ÁMBAR','CONSTELACIÓN DE CAZA','SUPERNOVA LÚMEN'],movement:'figure-eight-beacon'},
  15:{key:'CAUSTIC',name:'CAUSTIC ALCHEMIST',signature:'DESTILACIÓN CÁUSTICA',color:'#aaff54',wind:1.00,active:2.45,cool:[9.8,8.5,7.2],phases:['MEZCLA PRESURIZADA','DESTILACIÓN VIVA','REACCIÓN CÁUSTICA'],movement:'distillery-siege'},
  16:{key:'ATLAS',name:'ATLAS VEIL',signature:'VELO HIPNÓTICO',color:'#d9a7ff',wind:1.02,active:2.55,cool:[9.4,8.1,6.8],phases:['SUSURRO DE SEDA','ECLIPSE HIPNÓTICO','VELO ABSOLUTO'],movement:'veil-weave'},
  17:{key:'MIRAGE',name:'MIRAGE PHASMID',signature:'FRACTURA MIMÉTICA',color:'#63f6df',wind:.88,active:2.05,cool:[8.8,7.5,6.3],phases:['CAMUFLAJE FOLIAR','ESPEJO FRACTAL','JARDÍN DE FANTASMAS'],movement:'refractive-stalk'},
  18:{key:'PIT',name:'PIT EMPEROR',signature:'VÓRTICE DE FOSA',color:'#ffb94f',wind:1.06,active:2.60,cool:[9.8,8.4,7.0],phases:['ACECHO SUBTERRÁNEO','FOSA IMPERIAL','HAMBRE DEL DESIERTO'],movement:'burrow-ambush'},
  19:{key:'AURICULUS',name:'AURICULUS RAZOR',signature:'PINZA ELECTROFÁGICA',color:'#ff5c70',wind:.84,active:1.90,cool:[8.7,7.4,6.1],phases:['CIZALLA DE PLASMA','MALLA CONDUCTIVA','ARCO TERMINAL'],movement:'tail-clamp'},
  20:{key:'APIS',name:'APIS IMPERIA',signature:'DOMINIO DE LA COLMENA',color:'#ffd76a',wind:1.08,active:2.75,cool:[10.0,8.5,7.0],phases:['GUARDIA REAL','PANAL SOLAR','MANDATO IMPERIAL'],movement:'hive-command'}
};
function bossIdentity(sector=G?.sector||0){return CH2_BOSS_IDENTITIES[Math.round(sector)]||null;}
function bossPhaseNameForSector(b,phase){return bossIdentity()?.phases?.[phase-1]||BOSS_PHASE_NAMES[b?.pattern]?.[phase-1]||'';}
const CH2_SIGNATURE_OVERRIDES={
  11:{name:'ÓRBITA KHEPRI',color:'#62dfff',wind:.92,active:2.15,cool:[9.2,8.0,6.9]},12:{name:'PICA VECTORIAL',color:'#8dff58',wind:.78,active:1.55,cool:[8.4,7.2,6.1]},13:{name:'TENAZA REGICIDA',color:'#ff7358',wind:.96,active:1.75,cool:[9.5,8.3,7.1]},14:{name:'CONSTELACIÓN LÚMEN',color:'#ffcc62',wind:.88,active:2.35,cool:[9.0,7.8,6.6]},15:{name:'DESTILACIÓN CÁUSTICA',color:'#aaff54',wind:1.00,active:2.45,cool:[9.8,8.5,7.2]},
  16:{name:'VELO HIPNÓTICO',color:'#d9a7ff',wind:1.02,active:2.55,cool:[9.4,8.1,6.8]},17:{name:'FRACTURA MIMÉTICA',color:'#63f6df',wind:.88,active:2.05,cool:[8.8,7.5,6.3]},18:{name:'VÓRTICE DE FOSA',color:'#ffb94f',wind:1.06,active:2.60,cool:[9.8,8.4,7.0]},19:{name:'PINZA ELECTROFÁGICA',color:'#ff5c70',wind:.84,active:1.90,cool:[8.7,7.4,6.1]},20:{name:'DOMINIO DE LA COLMENA',color:'#ffd76a',wind:1.08,active:2.75,cool:[10.0,8.5,7.0]}
};
function bossSignatureConfig(b){const base=BOSS_SIGNATURE_ATTACKS[b?.pattern]||null,o=CH2_SIGNATURE_OVERRIDES[G?.sector||0]||null;if(o)return {...(base||{first:3.6,wind:.82,active:1.4,cool:[9,8,7],color:'#fff'}),...o};return base;}
function sigPointSegmentDist(px,py,x1,y1,x2,y2){const vx=x2-x1,vy=y2-y1,wx=px-x1,wy=py-y1,c1=vx*wx+vy*wy,c2=vx*vx+vy*vy,t=c2>0?clamp(c1/c2,0,1):0;return Math.hypot(px-(x1+vx*t),py-(y1+vy*t));}
function makeCH2IdentitySignature(b,p,cfg,id){
  const s={pattern:b.pattern,identity:id.key,stage:'wind',t:cfg.wind,max:cfg.wind,activeMax:cfg.active,hit:0,healLock:0,started:false,base:b.t||0};
  if(id.key==='KHEPRI'){s.cx=b.x;s.cy=b.y;s.r0=48;s.maxR=Math.max(W,H)*.78;s.nodes=2+b.phase;s.spin=Math.random()*TAU;}
  else if(id.key==='VESPERA'){const n=b.phase;s.lanes=[];const gap=58;for(let i=0;i<n;i++)s.lanes.push(clamp(p.y+(i-(n-1)/2)*gap,70,H-70));s.startX=W*.88;s.endX=W*.12;s.side=Math.random()<.5?-1:1;}
  else if(id.key==='REGENT'){s.centerY=clamp(p.y,105,H-105);s.startGap=Math.min(H*.72,390);s.endGap=92+b.phase*8;s.jawWidth=16+b.phase*3;}
  else if(id.key==='PYROLUX'){s.cx=clamp(p.x+W*.12,W*.28,W*.68);s.cy=clamp(p.y,110,H-110);s.nodes=4+b.phase;s.radius=78+b.phase*18;s.spin=Math.random()*TAU;}
  else if(id.key==='CAUSTIC'){s.pools=[];const n=b.phase===1?2:3;for(let i=0;i<n;i++){const off=(i-(n-1)/2)*95;s.pools.push({x:clamp(p.x+rnd(-45,80),W*.16,W*.70),y:clamp(p.y+off+rnd(-22,22),78,H-78),r:44+b.phase*8,phase:rnd(0,TAU)});}s.blast=b.phase===3;}
  else if(id.key==='ATLAS'){s.cx=clamp(p.x+W*.16,W*.30,W*.66);s.cy=clamp(p.y,105,H-105);s.rays=5+b.phase*2;s.safe=rndI(0,s.rays-1);s.rot=Math.atan2(p.y-s.cy,p.x-s.cx)-s.safe*TAU/s.rays;s.inner=34;s.outer=Math.max(W,H)*1.18;}
  else if(id.key==='MIRAGE'){s.lines=[];const n=2+b.phase;for(let i=0;i<n;i++){const off=(i-(n-1)/2)*(68-b.phase*5),y1=clamp(p.y+off,66,H-66),y2=clamp(p.y-off+rnd(-34,34),66,H-66);s.lines.push({x1:W*.88,y1,x2:W*.08,y2,phase:rnd(0,TAU)});}s.echoes=Array.from({length:2+b.phase},(_,i)=>({a:i*TAU/(2+b.phase)+rnd(-.2,.2),r:64+i*18}));}
  else if(id.key==='PIT'){s.pits=[];const n=b.phase;for(let i=0;i<n;i++){const off=(i-(n-1)/2)*(112-b.phase*8);s.pits.push({x:clamp(p.x+rnd(40,150),W*.22,W*.72),y:clamp(p.y+off+rnd(-20,20),82,H-82),r:48+b.phase*8,spin:rnd(0,TAU)});}s.emergeX=clamp(p.x+W*.18,W*.46,W*.78);s.emergeY=clamp(H-p.y+rnd(-45,45),90,H-90);s.emerged=false;}
  else if(id.key==='AURICULUS'){s.base=Math.atan2(p.y-b.y,p.x-b.x);s.sep0=.68;s.sep1=.075;s.len=Math.max(W,H)*1.30;s.ox=b.x-b.r*.18;s.oy=b.y;s.chainPulse=false;}
  else if(id.key==='APIS'){s.cx=clamp(p.x+W*.14,W*.30,W*.64);s.cy=clamp(p.y,105,H-105);s.cells=[];const n=6+b.phase*2,rad=92+b.phase*15;s.safe=rndI(0,n-1);for(let i=0;i<n;i++){const a=i*TAU/n+(i%2?0:.08),rr=rad*(i%3===0?.70:1);s.cells.push({x:s.cx+Math.cos(a)*rr,y:s.cy+Math.sin(a)*rr,r:30+b.phase*4,safe:i===s.safe});}s.volleyCd=.28;s.guardSpawned=false;}
  return s;
}
function bossSignaturePlayerHit(b,dmg,intensity=1){AudioX.bossImpact(Math.max(0,bossEntitySector(b)-1),intensity);hitPlayer(dmg);}
function updateCH2IdentitySignature(b,p,sec,dt,cfg,s,id){
  s.hit=Math.max(0,(s.hit||0)-dt);const dmg=(14+G.sector*.75+b.phase*3.2)*COMMANDER_DIFFICULTY.damage;
  if(s.stage==='wind'){s.t=Math.max(0,s.t-dt);G.bossWarningText=id.signature;G.bossWarningT=Math.max(G.bossWarningT,s.t);b.animAttackT=Math.max(b.animAttackT,.30);if(s.t<=0){s.stage='active';s.t=cfg.active;s.max=cfg.active;s.started=true;bossAnimReleaseCue(b,true);AudioX.bossAttack(G.sector-1,true);shake=Math.max(shake,6);}return true;}
  s.t=Math.max(0,s.t-dt);const prog=clamp(1-s.t/Math.max(.01,s.max),0,1);
  if(id.key==='KHEPRI'){
    const pull=(.035+b.phase*.012)*dt;p.x=lerp(p.x,s.cx,pull);p.y=lerp(p.y,s.cy,pull*.72);const d=Math.hypot(p.x-s.cx,p.y-s.cy);
    for(let i=0;i<b.phase;i++){const lp=clamp((prog-i*.16)/Math.max(.12,1-i*.16),0,1),r=s.r0+lp*(s.maxR-s.r0);if(lp>0&&Math.abs(d-r)<14+b.phase*3&&s.hit<=0){s.hit=.28;bossSignaturePlayerHit(b,dmg*.88,.92);}}
    for(let i=0;i<s.nodes;i++){const a=s.spin+G.elapsed*(.8+b.phase*.12)+i*TAU/s.nodes,nr=82+b.phase*14,nx=s.cx+Math.cos(a)*nr,ny=s.cy+Math.sin(a)*nr;if(Math.hypot(p.x-nx,p.y-ny)<18+b.phase*2&&s.hit<=0){s.hit=.30;bossSignaturePlayerHit(b,dmg*.78,.82);}}
  }else if(id.key==='VESPERA'){
    const sweepX=lerp(s.startX,s.endX,prog),width=10+b.phase*3;b.x=lerp(W*.82,W*.48,Math.sin(prog*Math.PI));b.y=lerp(b.y,s.lanes[Math.min(s.lanes.length-1,Math.floor(prog*s.lanes.length))]||H*.5,clamp(dt*5,0,1));
    for(const y of s.lanes){if(Math.abs(p.x-sweepX)<30+b.r*.32&&Math.abs(p.y-y)<width&&s.hit<=0){s.hit=.23;bossSignaturePlayerHit(b,dmg*.98,1.05);}}
    if(Math.random()<dt*(7+b.phase*2)){const y=pick(s.lanes);spawnEnemyBullet(sweepX,y,Math.PI,300+b.phase*35,7,3.5,id.color,b,{role:'vector-trail'});}
  }else if(id.key==='REGENT'){
    const gap=lerp(s.startGap,s.endGap,Math.sin(prog*Math.PI*.5)),top=s.centerY-gap*.5,bottom=s.centerY+gap*.5;if((Math.abs(p.y-top)<s.jawWidth||Math.abs(p.y-bottom)<s.jawWidth)&&s.hit<=0){s.hit=.30;bossSignaturePlayerHit(b,dmg*1.02,1.12);}b.x=lerp(b.x,W*.62,clamp(dt*2.2,0,1));b.y=lerp(b.y,s.centerY,clamp(dt*1.6,0,1));
  }else if(id.key==='PYROLUX'){
    const pts=[];for(let i=0;i<s.nodes;i++){const a=s.spin+prog*TAU*(.42+b.phase*.08)+i*TAU/s.nodes,r=s.radius*(.92+.10*Math.sin(G.elapsed*3+i));pts.push({x:s.cx+Math.cos(a)*r,y:s.cy+Math.sin(a)*r});}for(let i=0;i<pts.length;i++){const a=pts[i],q=pts[(i+1)%pts.length];if(Math.hypot(p.x-a.x,p.y-a.y)<15+b.phase*2||sigPointSegmentDist(p.x,p.y,a.x,a.y,q.x,q.y)<6+b.phase*1.5){if(s.hit<=0){s.hit=.24;bossSignaturePlayerHit(b,dmg*.84,.9);}}}
  }else if(id.key==='CAUSTIC'){
    for(const pool of s.pools){const r=pool.r*(.80+.28*Math.sin(prog*Math.PI)+.07*Math.sin(G.elapsed*7+pool.phase));if(Math.hypot(p.x-pool.x,p.y-pool.y)<r&&s.hit<=0){s.hit=.34;bossSignaturePlayerHit(b,dmg*.76,.82);}}
    if(s.blast&&prog>.70){const r=(prog-.70)/.30*Math.max(W,H)*.44,d=Math.hypot(p.x-b.x,p.y-b.y);if(Math.abs(d-r)<18&&s.hit<=0){s.hit=.28;bossSignaturePlayerHit(b,dmg*.90,.95);}}
  }else if(id.key==='ATLAS'){
    const rot=s.rot+prog*(.62+b.phase*.12),len=s.outer;for(let i=0;i<s.rays;i++){if(i===s.safe)continue;const a=rot+i*TAU/s.rays,x1=s.cx+Math.cos(a)*s.inner,y1=s.cy+Math.sin(a)*s.inner,x2=s.cx+Math.cos(a)*len,y2=s.cy+Math.sin(a)*len;if(sigPointSegmentDist(p.x,p.y,x1,y1,x2,y2)<8+b.phase*2&&s.hit<=0){s.hit=.25;bossSignaturePlayerHit(b,dmg*.82,.88);}}
    if(Math.hypot(p.x-s.cx,p.y-s.cy)<58+b.phase*10){p.vx*=Math.pow(.86,dt*60);p.vy*=Math.pow(.86,dt*60);}b.identityOpacity=.66+.24*Math.sin(G.elapsed*5.4)*.5+.12;
  }else if(id.key==='MIRAGE'){
    for(const ln of s.lines){const wob=Math.sin(G.elapsed*6+ln.phase)*(7+b.phase*2),x1=ln.x1,y1=ln.y1+wob,x2=ln.x2,y2=ln.y2-wob;if(sigPointSegmentDist(p.x,p.y,x1,y1,x2,y2)<7+b.phase*2&&s.hit<=0){s.hit=.23;bossSignaturePlayerHit(b,dmg*.86,.92);}}
    if(Math.random()<dt*(5+b.phase*2)){const ln=pick(s.lines),a=Math.atan2(ln.y2-ln.y1,ln.x2-ln.x1);spawnEnemyBullet(ln.x1,ln.y1,a,330+b.phase*28,7,3.5,id.color,b,{role:'mirage-shard',style:'prism'});}b.identityOpacity=.56+.30*(.5+.5*Math.sin(G.elapsed*8));
  }else if(id.key==='PIT'){
    b.identityOpacity=prog<.42?.20:1;if(prog<.42){b.x=lerp(b.x,s.emergeX,clamp(dt*2.6,0,1));b.y=lerp(b.y,s.emergeY,clamp(dt*2.6,0,1));}else if(!s.emerged){s.emerged=true;shake=Math.max(shake,9);G.particles.push({kind:'shock',x:b.x,y:b.y,r:18,vr:520,life:.62,max:.62,col:id.color});ringBullets(b.x,b.y,7+b.phase*2,190+b.phase*22,8,id.color,b.t,b,'pit-emerge');}
    let nearest=null,nd=1e9;for(const pit of s.pits){const d=Math.hypot(p.x-pit.x,p.y-pit.y);if(d<nd){nd=d;nearest=pit;}if(d<pit.r&&s.hit<=0){s.hit=.30;bossSignaturePlayerHit(b,dmg*.88,.92);}}if(nearest&&nd<250){const pull=(.055+b.phase*.014)*dt;p.x=lerp(p.x,nearest.x,pull);p.y=lerp(p.y,nearest.y,pull);}
  }else if(id.key==='AURICULUS'){
    const sep=lerp(s.sep0,s.sep1,Math.sin(prog*Math.PI*.5)),ox=b.x-b.r*.16,oy=b.y,len=s.len;for(const side of [-1,1]){const a=s.base+side*sep;if(sigRayNearPlayer(p,ox,oy,a,len,10+b.phase*2.5)&&s.hit<=0){s.hit=.22;bossSignaturePlayerHit(b,dmg*.96,1.02);}}
    if(b.phase===3&&sep<.18&&!s.chainPulse){s.chainPulse=true;ringBullets(ox,oy,12,250,9,id.color,b.t,b,'auriculus-terminal');}
  }else if(id.key==='APIS'){
    if(!s.guardSpawned){s.guardSpawned=true;const room=Math.max(0,14-G.enemies.filter(e=>!e.dead&&!e.microSwarm).length),n=Math.min(b.phase,room);for(let i=0;i<n;i++)spawnEnemy(sec.forms[0],b.x-40,b.y+rnd(-105,105),'summon');}
    for(const cell of s.cells){if(cell.safe)continue;const r=cell.r*(.90+.12*Math.sin(G.elapsed*6+cell.x*.01));if(Math.hypot(p.x-cell.x,p.y-cell.y)<r&&s.hit<=0){s.hit=.28;bossSignaturePlayerHit(b,dmg*.80,.86);}}
    s.volleyCd-=dt;if(s.volleyCd<=0){s.volleyCd=Math.max(.34,.66-b.phase*.08);const o=bossAttackEmitter(b,'primary'),a=Math.atan2(p.y-o.y,p.x-o.x);commanderFan(b,o.x,o.y,a,3+b.phase,.075,300+b.phase*25,8,4,'apis-domain');}
  }
  if(s.t<=0){finishBossSignature(b,cfg);return false;}return true;
}
function drawCH2IdentitySignature(b,s,cfg,id){
  const wind=s.stage==='wind',prog=wind?0:clamp(1-s.t/Math.max(.01,s.max),0,1),pulse=.55+.35*Math.sin(G.elapsed*15);cx.save();cx.lineCap='round';cx.lineJoin='round';
  if(id.key==='KHEPRI'){const maxR=s.maxR||Math.max(W,H)*.78;for(let i=0;i<b.phase;i++){const lp=wind?.08+i*.045:clamp((prog-i*.16)/Math.max(.12,1-i*.16),0,1),r=(s.r0||48)+lp*(maxR-(s.r0||48));cx.strokeStyle=hexA(id.color,wind?.36:.78);cx.lineWidth=wind?2:6+b.phase;cx.setLineDash(wind?[9,7]:[]);cx.beginPath();cx.arc(s.cx,s.cy,r,0,TAU);cx.stroke();cx.setLineDash([]);}for(let i=0;i<s.nodes;i++){const a=s.spin+G.elapsed*(.8+b.phase*.12)+i*TAU/s.nodes,nr=82+b.phase*14,x=s.cx+Math.cos(a)*nr,y=s.cy+Math.sin(a)*nr;cx.shadowColor=id.color;cx.shadowBlur=18;cx.fillStyle=wind?hexA(id.color,.38):id.color;cx.beginPath();cx.arc(x,y,8+b.phase*2+pulse*2,0,TAU);cx.fill();}cx.shadowBlur=0;}
  else if(id.key==='VESPERA'){const x=wind?W*.88:lerp(s.startX,s.endX,prog);for(const y of s.lanes){cx.strokeStyle=hexA(id.color,wind?.42:.25);cx.lineWidth=wind?2:8+b.phase*2;cx.setLineDash(wind?[12,8]:[]);cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();cx.setLineDash([]);if(!wind){cx.shadowColor=id.color;cx.shadowBlur=22;cx.fillStyle='#f5ffd9';cx.beginPath();cx.moveTo(x-20,y-9);cx.lineTo(x+30,y);cx.lineTo(x-20,y+9);cx.closePath();cx.fill();cx.shadowBlur=0;}}}
  else if(id.key==='REGENT'){const gap=wind?s.startGap:lerp(s.startGap,s.endGap,Math.sin(prog*Math.PI*.5)),top=s.centerY-gap*.5,bottom=s.centerY+gap*.5;for(const [y,dir] of [[top,1],[bottom,-1]]){cx.strokeStyle=hexA(id.color,wind?.45:.85);cx.lineWidth=wind?3:10+b.phase*2;cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();for(let x=20;x<W;x+=36){cx.fillStyle=hexA('#ffd1bd',wind?.32:.72);cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+14,y+dir*(18+b.phase*2));cx.lineTo(x+26,y);cx.closePath();cx.fill();}}}
  else if(id.key==='PYROLUX'){const pts=[];for(let i=0;i<s.nodes;i++){const a=s.spin+(wind?0:prog*TAU*(.42+b.phase*.08))+i*TAU/s.nodes,r=s.radius*(.92+.10*Math.sin(G.elapsed*3+i));pts.push({x:s.cx+Math.cos(a)*r,y:s.cy+Math.sin(a)*r});}cx.strokeStyle=hexA(id.color,wind?.30:.62);cx.lineWidth=wind?1.5:4;cx.beginPath();pts.forEach((q,i)=>i?cx.lineTo(q.x,q.y):cx.moveTo(q.x,q.y));if(pts.length)cx.lineTo(pts[0].x,pts[0].y);cx.stroke();for(const q of pts){cx.shadowColor=id.color;cx.shadowBlur=18;cx.fillStyle=wind?hexA(id.color,.42):'#fff2b4';cx.beginPath();cx.arc(q.x,q.y,7+b.phase*1.8+pulse*2,0,TAU);cx.fill();}cx.shadowBlur=0;}
  else if(id.key==='CAUSTIC'){for(const pool of s.pools){const r=pool.r*(wind?.70:(.80+.28*Math.sin(prog*Math.PI)+.07*Math.sin(G.elapsed*7+pool.phase)));cx.fillStyle=hexA(id.color,wind?.07:.16);cx.strokeStyle=hexA(id.color,wind?.52:.80);cx.lineWidth=wind?2:5;cx.setLineDash(wind?[8,7]:[]);cx.beginPath();cx.arc(pool.x,pool.y,r,0,TAU);cx.fill();cx.stroke();cx.setLineDash([]);if(!wind){for(let k=0;k<5;k++){const a=G.elapsed*(.8+k*.1)+k*TAU/5,rr=r*(.25+.55*((k+1)/5));cx.fillStyle=hexA(k%2?'#f3ff9f':id.color,.55);cx.beginPath();cx.arc(pool.x+Math.cos(a)*rr,pool.y+Math.sin(a)*rr,2+(k%3)*1.5,0,TAU);cx.fill();}}}if(s.blast&&!wind&&prog>.70){const r=(prog-.70)/.30*Math.max(W,H)*.44;cx.strokeStyle=hexA('#eaff8b',.72);cx.lineWidth=8;cx.beginPath();cx.arc(b.x,b.y,r,0,TAU);cx.stroke();}}
  else if(id.key==='ATLAS'){const rot=s.rot+(wind?0:prog*(.62+b.phase*.12)),len=s.outer;for(let i=0;i<s.rays;i++){const a=rot+i*TAU/s.rays,x1=s.cx+Math.cos(a)*s.inner,y1=s.cy+Math.sin(a)*s.inner,x2=s.cx+Math.cos(a)*len,y2=s.cy+Math.sin(a)*len,safe=i===s.safe;cx.strokeStyle=safe?hexA('#baffef',wind?.36:.24):hexA(id.color,wind?.34:.72);cx.lineWidth=safe?3:(wind?2:7+b.phase);cx.setLineDash(wind?[10,8]:safe?[4,10]:[]);cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);}cx.strokeStyle=hexA('#f2d7ff',wind?.28:.58);cx.lineWidth=2;for(let q=1;q<=2;q++){cx.beginPath();cx.arc(s.cx,s.cy,34+q*(24+b.phase*4)+pulse*4,0,TAU);cx.stroke();}}
  else if(id.key==='MIRAGE'){for(const ln of s.lines){const wob=wind?0:Math.sin(G.elapsed*6+ln.phase)*(7+b.phase*2);cx.strokeStyle=hexA(id.color,wind?.38:.72);cx.lineWidth=wind?2:6+b.phase;cx.setLineDash(wind?[11,8]:[]);cx.beginPath();cx.moveTo(ln.x1,ln.y1+wob);cx.lineTo(ln.x2,ln.y2-wob);cx.stroke();cx.setLineDash([]);}for(const e of s.echoes){const a=e.a+G.elapsed*(wind?.15:.55),x=b.x+Math.cos(a)*e.r,y=b.y+Math.sin(a)*e.r;cx.strokeStyle=hexA('#c9fff6',wind?.22:.48);cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y-12);cx.lineTo(x+9,y);cx.lineTo(x,y+12);cx.lineTo(x-9,y);cx.closePath();cx.stroke();}}
  else if(id.key==='PIT'){for(const pit of s.pits){const r=pit.r*(wind?.82:1);cx.fillStyle=hexA('#3b1f08',wind?.08:.30);cx.strokeStyle=hexA(id.color,wind?.52:.78);cx.lineWidth=wind?2:5;cx.setLineDash(wind?[8,7]:[]);cx.beginPath();cx.arc(pit.x,pit.y,r,0,TAU);cx.fill();cx.stroke();cx.setLineDash([]);for(let q=0;q<3;q++){const a0=pit.spin+G.elapsed*(.7+q*.15),rr=r*(.35+q*.22);cx.strokeStyle=hexA(q%2?'#ffe0a3':id.color,wind?.18:.45);cx.lineWidth=2;cx.beginPath();cx.arc(pit.x,pit.y,rr,a0,a0+Math.PI*1.35);cx.stroke();}}cx.strokeStyle=hexA('#fff0bd',wind?.32:.52);cx.lineWidth=2;cx.beginPath();cx.arc(s.emergeX,s.emergeY,28+pulse*8,0,TAU);cx.stroke();}
  else if(id.key==='AURICULUS'){const sep=wind?s.sep0:lerp(s.sep0,s.sep1,Math.sin(prog*Math.PI*.5)),ox=b.x-b.r*.16,oy=b.y,len=s.len,tips=[];for(const side of [-1,1]){const a=s.base+side*sep,x2=ox+Math.cos(a)*len,y2=oy+Math.sin(a)*len;tips.push([x2,y2]);cx.shadowColor=id.color;cx.shadowBlur=wind?8:20;cx.strokeStyle=hexA(id.color,wind?.42:.82);cx.lineWidth=wind?3:9+b.phase*2;cx.setLineDash(wind?[12,8]:[]);cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);}if(tips.length===2&&!wind){cx.strokeStyle=hexA('#ffd0d7',.38);cx.lineWidth=2;cx.beginPath();cx.moveTo(tips[0][0],tips[0][1]);cx.lineTo(tips[1][0],tips[1][1]);cx.stroke();}cx.shadowBlur=0;}
  else if(id.key==='APIS'){for(const cell of s.cells){const r=cell.r*(wind?.90:(.90+.12*Math.sin(G.elapsed*6+cell.x*.01))),col=cell.safe?'#baffc9':id.color;cx.strokeStyle=hexA(col,cell.safe?(wind?.62:.55):(wind?.36:.78));cx.fillStyle=hexA(col,cell.safe?.035:(wind?.045:.12));cx.lineWidth=cell.safe?2:(wind?2:4);cx.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*TAU/6,x=cell.x+Math.cos(a)*r,y=cell.y+Math.sin(a)*r;k?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();cx.stroke();}cx.strokeStyle=hexA('#fff3b2',wind?.20:.48);cx.lineWidth=2;cx.beginPath();cx.arc(s.cx,s.cy,18+pulse*8,0,TAU);cx.stroke();}
  cx.restore();return true;
}
function updateCH2BossIdentityMovement(b,p,sec,dt,phaseSpeed){
  const id=bossIdentity();if(!id)return false;const a=Math.atan2(p.y-b.y,p.x-b.x),emit=()=>bossAttackEmitter(b,'primary');
  if(id.key==='KHEPRI'){b.x=W*.68+Math.cos(b.t*(.62+b.phase*.07))*W*(.12+.015*b.phase);b.y=H*.5+Math.sin(b.t*(.86+b.phase*.08))*H*(.20+.025*b.phase);if(b.fire<=0){b.fire=Math.max(.32,.62-.055*b.phase);commanderFan(b,emit().x,emit().y,a,3+b.phase,.08,265+25*b.phase,8,4,'khepri');if(b.phase>=2)ringBullets(b.x,b.y,6+b.phase*2,145+b.phase*16,7,id.color,b.t,b,'khepri-orbit');}}
  else if(id.key==='VESPERA'){b.x=W*.63+Math.sin(b.t*(2.15+b.phase*.22))*W*.22;b.y=H*.5+Math.sin(b.t*(3.55+b.phase*.30))*H*.34;if(b.fire<=0){b.fire=Math.max(.20,.46-.05*b.phase);commanderFan(b,emit().x,emit().y,a,2+b.phase,.055,355+b.phase*35,7.5,3.6,'vespera');if(b.phase===3&&Math.random()<.38)spawnEnemy(sec.forms[0],b.x-35,b.y+rnd(-100,100));}}
  else if(id.key==='REGENT'){b.x=W*.69+Math.sin(b.t*.58)*W*.105;b.y=lerp(b.y,clamp(p.y,110,H-110),clamp(dt*(.38+b.phase*.08),0,1));if(b.fire<=0){b.fire=Math.max(.38,.72-.055*b.phase);const sep=.13+b.phase*.018;commanderFan(b,bossAttackEmitter(b,'upper').x,bossAttackEmitter(b,'upper').y,a+sep,3,.05,255+b.phase*22,10,4.8,'regent-upper');commanderFan(b,bossAttackEmitter(b,'lower').x,bossAttackEmitter(b,'lower').y,a-sep,3,.05,255+b.phase*22,10,4.8,'regent-lower');}}
  else if(id.key==='PYROLUX'){b.x=W*.65+Math.sin(b.t*1.22)*W*.17;b.y=H*.5+Math.sin(b.t*2.44)*Math.cos(b.t*.77)*H*.31;if(b.fire<=0){b.fire=Math.max(.30,.60-.055*b.phase);commanderFan(b,emit().x,emit().y,a,3,.10,245+b.phase*18,7,4,'pyrolux');if(b.phase>=2)ringBullets(b.x,b.y,5+b.phase,120+b.phase*14,6,id.color,b.t*.72,b,'lumen');}}
  else if(id.key==='CAUSTIC'){b.x=W*.70+Math.sin(b.t*.52)*W*.10;b.y=H*.5+Math.sin(b.t*.92)*H*.23;if(b.fire<=0){b.fire=Math.max(.34,.69-.05*b.phase);commanderFan(b,emit().x,emit().y,a,5+b.phase,.10,205+b.phase*16,9,5,'caustic');if(b.phase===3&&Math.random()<.26)spawnEnemy(sec.forms[1],b.x-40,b.y+rnd(-110,110));}}
  else if(id.key==='ATLAS'){b.identityOpacity=1;b.x=W*.66+Math.sin(b.t*.74)*W*.14;b.y=H*.5+Math.sin(b.t*1.62)*Math.cos(b.t*.48)*H*.30;if(b.fire<=0){b.fire=Math.max(.31,.64-.055*b.phase);commanderFan(b,emit().x,emit().y,a,3+b.phase,.09,230+b.phase*18,7,4,'atlas-silk');if(b.phase>=2&&Math.random()<.42)ringBullets(b.x,b.y,5+b.phase,112+b.phase*14,6,id.color,b.t*.5,b,'atlas-dust');}}
  else if(id.key==='MIRAGE'){b.identityOpacity=.82+.18*(.5+.5*Math.sin(b.t*7));b.x=W*.64+Math.sin(b.t*(1.85+b.phase*.13))*W*.20;b.y=H*.5+Math.sin(b.t*(3.05+b.phase*.20))*H*.34;if(Math.random()<dt*(4+b.phase))G.particles.push({kind:'slash',x:b.x-rnd(18,65),y:b.y+rnd(-30,30),a:rnd(-.18,.18),len:rnd(40,95),life:.16,max:.16,col:hexA(id.color,.72)});if(b.fire<=0){b.fire=Math.max(.22,.50-.045*b.phase);commanderFan(b,emit().x,emit().y,a,2+b.phase,.065,325+b.phase*24,7.5,3.8,'mirage');}}
  else if(id.key==='PIT'){b.identityOpacity=1;b.x=W*.70+Math.sin(b.t*.58)*W*.11;b.y=lerp(b.y,clamp(p.y,100,H-100),clamp(dt*(.34+b.phase*.07),0,1));if(b.fire<=0){b.fire=Math.max(.34,.70-.055*b.phase);ringBullets(b.x,b.y,6+b.phase*2,160+b.phase*18,8,id.color,b.t,b,'pit-maw');if(b.phase===3&&Math.random()<.28)commanderFan(b,emit().x,emit().y,a,5,.10,245,9,4.5,'pit-shards');}}
  else if(id.key==='AURICULUS'){b.identityOpacity=1;b.x=W*.66+Math.sin(b.t*(1.28+b.phase*.11))*W*.18;b.y=H*.5+Math.sin(b.t*(2.28+b.phase*.16))*H*.29;if(b.fire<=0){b.fire=Math.max(.23,.51-.045*b.phase);commanderFan(b,emit().x,emit().y,a,3+b.phase,.075,315+b.phase*26,8,4,'auriculus');if(b.phase>=2){const t=G.enemies.filter(e=>!e.dead&&!e.microSwarm)[0];if(t)G.particles.push({kind:'arc',x:b.x,y:b.y,x2:t.x,y2:t.y,life:.16,max:.16,col:id.color});}}}
  else if(id.key==='APIS'){b.identityOpacity=1;b.x=W*.66+Math.sin(b.t*.92)*W*.16;b.y=H*.5+Math.sin(b.t*1.72)*H*.28;if(b.fire<=0){b.fire=Math.max(.25,.55-.05*b.phase);commanderFan(b,emit().x,emit().y,a,4+b.phase,.085,285+b.phase*24,8,4,'apis-royal');if(b.phase>=2&&Math.random()<.30&&G.enemies.filter(e=>!e.dead&&!e.microSwarm).length<11)spawnEnemy(sec.forms[0],b.x-35,b.y+rnd(-105,105),'summon');}}
  b.x=clamp(b.x,W*.36,W*.86);b.y=clamp(b.y,70,H-70);if(dist(b,p)<b.r+p.r)bossSignaturePlayerHit(b,(25+G.sector*2.5)*COMMANDER_DIFFICULTY.contact,.92);return true;
}
function bossIdentityPhasePulse(b,sec){const id=bossIdentity();if(!id)return;const c=id.color;
  if(id.key==='KHEPRI')for(let i=0;i<2+b.phase;i++)G.particles.push({kind:'ring',x:b.x,y:b.y,r:18+i*10,vr:300+i*80,life:.65,max:.65,col:c});
  else if(id.key==='VESPERA')for(const off of [-.18,0,.18])G.particles.push({kind:'slash',x:b.x,y:b.y,a:Math.PI+off,len:b.r*(2.2+b.phase*.2),life:.34,max:.34,col:c});
  else if(id.key==='REGENT'){b.guardT=Math.max(b.guardT,.65);G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.72,vr:220,life:.75,max:.75,col:c});}
  else if(id.key==='PYROLUX')for(let i=0;i<4+b.phase;i++){const a=i*TAU/(4+b.phase);G.particles.push({kind:'orb',x:b.x+Math.cos(a)*b.r*1.15,y:b.y+Math.sin(a)*b.r*1.15,r:7,life:1.1,max:1.1,col:c});}
  else if(id.key==='CAUSTIC')for(let i=0;i<7;i++){const a=i*TAU/7;G.particles.push({kind:'spark',x:b.x,y:b.y,vx:Math.cos(a)*rnd(80,190),vy:Math.sin(a)*rnd(80,190),r:rnd(2,4),life:.55,max:.55,col:c});}
  else if(id.key==='ATLAS'){for(let i=0;i<3+b.phase;i++)G.particles.push({kind:'halo',x:b.x,y:b.y,r:18+i*9,vr:210+i*45,life:.72,max:.72,col:i%2?c:'#f2d7ff'});}
  else if(id.key==='MIRAGE'){for(let i=0;i<4+b.phase;i++){const a=i*TAU/(4+b.phase);G.particles.push({kind:'slash',x:b.x+Math.cos(a)*b.r*.55,y:b.y+Math.sin(a)*b.r*.55,a,len:b.r*(1.5+b.phase*.15),life:.32,max:.32,col:c});}}
  else if(id.key==='PIT'){b.identityOpacity=1;G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.48,vr:430,life:.74,max:.74,col:c});for(let i=0;i<5;i++)G.particles.push({kind:'spark',x:b.x,y:b.y,vx:rnd(-180,80),vy:rnd(-150,150),r:rnd(2,4),life:.5,max:.5,col:'#ffd68b'});}
  else if(id.key==='AURICULUS'){for(const off of [-.26,.26])G.particles.push({kind:'slash',x:b.x,y:b.y,a:Math.PI+off,len:b.r*(2.4+b.phase*.22),life:.36,max:.36,col:c});G.particles.push({kind:'ring',x:b.x,y:b.y,r:16,vr:300,life:.48,max:.48,col:c});}
  else if(id.key==='APIS'){b.guardT=Math.max(b.guardT,.45);for(let i=0;i<6;i++){const a=i*TAU/6;G.particles.push({kind:'orb',x:b.x+Math.cos(a)*b.r*1.20,y:b.y+Math.sin(a)*b.r*1.20,r:6+b.phase,life:.9,max:.9,col:i%2?c:'#fff3b2'});}G.particles.push({kind:'ring',x:b.x,y:b.y,r:20,vr:360,life:.62,max:.62,col:c});}}


// Signature attacks v2.13.3 — ataques legibles, únicos y escalados por fase.
function sigRayNearPlayer(p,ox,oy,a,len,width){const dx=p.x-ox,dy=p.y-oy,proj=dx*Math.cos(a)+dy*Math.sin(a),perp=Math.abs(dx*Math.sin(a)-dy*Math.cos(a));return proj>0&&proj<len&&perp<width;}
function sigAngleLerp(a,b,t){const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));return a+d*t;}
function finishBossSignature(b,cfg){b.signatureAttack=null;b.signatureAttackCd=cfg.cool[clamp(b.phase,1,3)-1];b.coreOpenT=Math.max(b.coreOpenT,.85+.15*b.phase);b.animAttackT=Math.max(b.animAttackT,.18);b.identityOpacity=1;}
function makeBossSignature(b,p,cfg){
  const identity=bossIdentity();if(identity)return makeCH2IdentitySignature(b,p,cfg,identity);
  const s={pattern:b.pattern,stage:'wind',t:cfg.wind,max:cfg.wind,activeMax:cfg.active,hit:0,healLock:0,started:false};
  const aim=Math.atan2(p.y-b.y,p.x-b.x);s.aim=aim;s.base=aim;s.targetX=clamp(p.x+72,W*.28,W*.58);s.targetY=clamp(p.y,80,H-80);s.safeY=clamp(p.y+rnd(-55,55),H*.18,H*.82);s.safeX=clamp(p.x+rnd(-60,60),W*.16,W*.62);
  if(b.pattern==='queen'){const total=4+b.phase,safe=rndI(0,total-1);s.lanes=[];for(let i=0;i<total;i++)if(i!==safe)s.lanes.push(H*(i+1)/(total+1));s.safeY=H*(safe+1)/(total+1);}
  if(b.pattern==='architect'){const total=4+b.phase,safe=rndI(0,total-1);s.columns=[];for(let i=0;i<total;i++)if(i!==safe)s.columns.push(W*(.18+i*.58/Math.max(1,total-1)));s.safeX=W*(.18+safe*.58/Math.max(1,total-1));}
  return s;
}
function updateBossSignatureAttack(b,p,sec,dt){
  const cfg=bossSignatureConfig(b);if(!cfg||G.mode==='training')return false;
  b.signatureAttackCd=(b.signatureAttackCd??cfg.first)-dt/COMMANDER_DIFFICULTY.tempo;
  const s=b.signatureAttack;
  const identity=bossIdentity();
  if(!s){
    if(b.entry<=0&&(b.phaseTransitionT||0)<=0&&!b.telegraphT&&!b.chargeT&&!b.specialT&&b.signatureAttackCd<=0&&(b.phaseElapsed||0)>2.0){
      b.signatureAttack=makeBossSignature(b,p,cfg);hiveRecordSignature();bossAnimStartSignatureCue(b,cfg,cfg.name);b.animAttackT=Math.max(b.animAttackT,cfg.wind+.2);b.specialCd=Math.max(b.specialCd,cfg.wind+cfg.active+.35);G.bossWarningText=cfg.name;G.bossWarningT=Math.max(G.bossWarningT,cfg.wind);notify(`⚡ ${cfg.name}`,cfg.color,1.15);AudioX.bossWarn(G.sector-1);return true;
    }return false;
  }
  if(identity)return updateCH2IdentitySignature(b,p,sec,dt,cfg,s,identity);
  s.hit=Math.max(0,(s.hit||0)-dt);s.healLock=Math.max(0,(s.healLock||0)-dt);b.animAttackT=Math.max(b.animAttackT,.28);b.guardT=Math.max(b.guardT,.08);
  if(s.stage==='active'){if(b.pattern==='leap'&&Math.random()<dt*32)G.particles.push({kind:'spark',x:s.targetX+rnd(-42,42),y:s.targetY+rnd(-42,42),vx:rnd(-130,130),vy:rnd(-150,40),r:rnd(1.5,4),life:rnd(.18,.38),max:.38,col:Math.random()<.45?'#fff09a':'#b7ff58'});else if(b.pattern==='blood'&&Math.random()<dt*38){const q=rnd(.12,.78),len=Math.max(W,H)*1.2,px=b.x-b.r*.38+Math.cos(s.aim)*len*q,py=b.y+Math.sin(s.aim)*len*q;G.particles.push({kind:'spark',x:px,y:py,vx:rnd(-45,45),vy:rnd(-45,45),r:rnd(1.5,3.8),life:rnd(.15,.32),max:.32,col:Math.random()<.5?'#ff3658':'#ffd0d8'});}else if(b.pattern==='architect'&&Math.random()<dt*26){const xs=s.columns||[];if(xs.length){const x=pick(xs);G.particles.push({kind:'spark',x:x+rnd(-12,12),y:rnd(H*.12,H*.88),vx:rnd(-35,35),vy:rnd(-85,30),r:rnd(1.4,3.4),life:rnd(.16,.34),max:.34,col:Math.random()<.45?'#fff09a':'#ffbd45'});}}}
  if(s.stage==='wind'){
    s.t=Math.max(0,s.t-dt);G.bossWarningText=cfg.name;G.bossWarningT=Math.max(G.bossWarningT,s.t);if(s.t<=0){s.stage='active';s.t=cfg.active;s.max=cfg.active;s.started=true;bossAnimReleaseCue(b,true);AudioX.bossAttack(G.sector-1,true);shake=Math.max(shake,5);}return true;
  }
  s.t=Math.max(0,s.t-dt);const prog=clamp(1-s.t/Math.max(.01,s.max),0,1),dmg=(14+G.sector*.75+b.phase*3.2)*COMMANDER_DIFFICULTY.damage;
  if(b.pattern==='storm'){
    const count=b.phase,spread=.12,ox=b.x-b.r*.50,oy=b.y-b.r*.05,len=Math.max(W,H)*1.28;for(let i=0;i<count;i++){const k=i-(count-1)/2,a=s.aim+k*spread;if(sigRayNearPlayer(p,ox,oy,a,len,12+b.phase*3)&&s.hit<=0){s.hit=.25;bossSignaturePlayerHit(b,dmg,1);}}
  }else if(b.pattern==='titan'){
    const d=Math.hypot(p.x-b.x,p.y-b.y),maxR=Math.max(W,H)*1.05;for(let i=0;i<b.phase;i++){const lp=clamp((prog-i*.18)/Math.max(.1,1-i*.18),0,1),r=lp*maxR;if(lp>0&&Math.abs(d-r)<18+b.phase*3&&s.hit<=0){s.hit=.28;bossSignaturePlayerHit(b,dmg*.92,.96);}}
  }else if(b.pattern==='moth'){
    const n=3+b.phase*2,rot=s.base+prog*TAU*(.38+b.phase*.12),ox=b.x,oy=b.y,len=Math.max(W,H)*1.22;for(let i=0;i<n;i++){const a=rot+i/n*TAU;if(sigRayNearPlayer(p,ox,oy,a,len,8+b.phase*2)&&s.hit<=0){s.hit=.24;bossSignaturePlayerHit(b,dmg*.88,.92);}}
  }else if(b.pattern==='queen'){
    const width=10+b.phase*3;for(const y of s.lanes||[]){if(Math.abs(p.y-y)<width&&s.hit<=0){s.hit=.28;bossSignaturePlayerHit(b,dmg*.92,.96);}}
  }else if(b.pattern==='leap'){
    if(prog<.24){b.x=lerp(b.x,s.targetX,clamp(dt*8,0,1));b.y=lerp(b.y,s.targetY,clamp(dt*8,0,1));}const rp=clamp((prog-.18)/.82,0,1),r=rp*Math.max(W,H)*.78,d=Math.hypot(p.x-s.targetX,p.y-s.targetY);if(rp>0&&Math.abs(d-r)<20+b.phase*4&&s.hit<=0){s.hit=.30;bossSignaturePlayerHit(b,dmg*1.05,1.10);}
  }else if(b.pattern==='blood'){
    const o=bossSignatureOrigin(b),target=Math.atan2(p.y-o.y,p.x-o.x);s.aim=sigAngleLerp(s.aim,target,clamp(dt*(.9+b.phase*.18),0,1));if(sigRayNearPlayer(p,o.x,o.y,s.aim,Math.max(W,H)*1.2,11+b.phase*3)&&s.hit<=0){s.hit=.22;bossSignaturePlayerHit(b,dmg*.82,.88);if(s.healLock<=0){s.healLock=.32;b.hp=Math.min(b.maxHp,b.hp+b.maxHp*(.0025+.0008*b.phase));}}
  }else if(b.pattern==='architect'){
    const width=13+b.phase*3;for(const x of s.columns||[]){if(Math.abs(p.x-x)<width&&s.hit<=0){s.hit=.30;bossSignaturePlayerHit(b,dmg*.9,.95);}}
  }else if(b.pattern==='odonata'){
    const ox=b.x,oy=b.y,len=Math.max(W,H)*1.28,n=b.phase===1?2:b.phase===2?3:4;for(let i=0;i<n;i++){const dir=i%2?1:-1,a=s.base+(i-(n-1)/2)*.20+dir*prog*(.72+b.phase*.16);if(sigRayNearPlayer(p,ox,oy,a,len,8+b.phase*2)&&s.hit<=0){s.hit=.21;bossSignaturePlayerHit(b,dmg*.94,.98);}}
  }else if(b.pattern==='resonance'){
    const d=Math.hypot(p.x-b.x,p.y-b.y),maxR=Math.max(W,H)*1.03,n=1+b.phase;for(let i=0;i<n;i++){const lp=clamp((prog-i*.16)/Math.max(.1,1-i*.16),0,1),r=lp*maxR;if(lp>0&&Math.abs(d-r)<15+b.phase*3&&s.hit<=0){s.hit=.25;bossSignaturePlayerHit(b,dmg*.86,.90);}}
  }
  if(s.t<=0){finishBossSignature(b,cfg);return false;}return true;
}
function bossSignatureOrigin(b){if(bossEntitySector(b)>=11)return bossAttackEmitter(b,'signature');const r=b?.r||1;switch(b?.pattern){case'blood':return {x:b.x-r*.08,y:b.y+r*.50};case'odonata':return {x:b.x-r*.40,y:b.y+r*.18};case'resonance':return {x:b.x,y:b.y-r*.30};case'architect':return {x:b.x,y:b.y+r*.16};default:return {x:b.x-r*.38,y:b.y-r*.03};}}
function drawBossSignatureAttack(b){
  if(!b||b.dying)return;const s=b?.signatureAttack,cfg=b&&bossSignatureConfig(b);if(!s||!cfg)return;const identity=bossIdentity();if(identity){drawCH2IdentitySignature(b,s,cfg,identity);return;}const wind=s.stage==='wind',prog=wind?0:clamp(1-s.t/Math.max(.01,s.max),0,1),pulse=.55+.35*Math.sin(G.elapsed*18);cx.save();cx.lineCap='round';cx.lineJoin='round';
  const beam=(ox,oy,a,len,width,col=cfg.color)=>{const x2=ox+Math.cos(a)*len,y2=oy+Math.sin(a)*len;cx.strokeStyle=wind?hexA(col,.42):hexA(col,.34);cx.lineWidth=wind?2.5:width*2.2;cx.setLineDash(wind?[10,8]:[]);cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);if(!wind){cx.shadowColor=col;cx.shadowBlur=20;cx.strokeStyle=col;cx.lineWidth=width;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.strokeStyle='#f8ffff';cx.lineWidth=Math.max(2,width*.20);cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.shadowBlur=0;}};
  if(b.pattern==='storm'){const count=b.phase,spread=.12,ox=b.x-b.r*.50,oy=b.y-b.r*.05,len=Math.max(W,H)*1.28;for(let i=0;i<count;i++)beam(ox,oy,s.aim+(i-(count-1)/2)*spread,len,10+b.phase*3);}
  else if(b.pattern==='titan'){const maxR=Math.max(W,H)*1.05,n=b.phase;for(let i=0;i<n;i++){const lp=wind?(.13+i*.07):clamp((prog-i*.18)/Math.max(.1,1-i*.18),0,1),r=Math.max(16,lp*maxR);cx.strokeStyle=hexA(cfg.color,wind?.38:.72);cx.lineWidth=wind?2:7+b.phase*2;cx.shadowColor=cfg.color;cx.shadowBlur=wind?0:16;cx.beginPath();cx.arc(b.x,b.y,r,0,TAU);cx.stroke();}cx.shadowBlur=0;}
  else if(b.pattern==='moth'){const n=3+b.phase*2,rot=s.base+(wind?0:prog*TAU*(.38+b.phase*.12)),len=Math.max(W,H)*1.22;for(let i=0;i<n;i++)beam(b.x,b.y,rot+i/n*TAU,len,7+b.phase*2,'#e9b7ff');}
  else if(b.pattern==='queen'){const width=10+b.phase*3;cx.strokeStyle=wind?hexA(cfg.color,.36):hexA(cfg.color,.80);cx.lineWidth=wind?2:width;for(const y of s.lanes||[]){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}cx.fillStyle=hexA('#a6ff5f',wind?.10:.05);cx.fillRect(0,s.safeY-(34+b.phase*3),W,68+b.phase*6);}
  else if(b.pattern==='leap'){cx.strokeStyle=hexA(cfg.color,wind?.72:.88);cx.lineWidth=wind?3:9+b.phase*2;const r=wind?34+pulse*12:Math.max(18,clamp((prog-.18)/.82,0,1)*Math.max(W,H)*.78);cx.shadowColor=cfg.color;cx.shadowBlur=wind?10:26;cx.beginPath();cx.arc(s.targetX,s.targetY,r,0,TAU);cx.stroke();const impactPulse=wind?0:clamp((prog-.18)/.28,0,1);if(!wind){cx.fillStyle=hexA('#fff6c9',.08+.18*(1-impactPulse));cx.beginPath();cx.arc(s.targetX,s.targetY,18+impactPulse*34,0,TAU);cx.fill();for(let i=0;i<16;i++){const a=i*TAU/16+G.elapsed*.35,ri=r*(.80+.15*Math.sin(G.elapsed*9+i));cx.strokeStyle=i%3===0?'#ffffff':i%2?'#fff09a':'#b7ff58';cx.lineWidth=1.5+((i+b.phase)%4);cx.beginPath();cx.moveTo(s.targetX+Math.cos(a)*ri*.66,s.targetY+Math.sin(a)*ri*.66);cx.lineTo(s.targetX+Math.cos(a)*ri,s.targetY+Math.sin(a)*ri);cx.stroke();const fr=10+5*((i+b.phase)%3),fx=s.targetX+Math.cos(a)*(r*.52),fy=s.targetY+Math.sin(a)*(r*.52);cx.save();cx.translate(fx,fy);cx.rotate(a+G.elapsed*(i%2?.8:-.6));cx.fillStyle=hexA(i%2?'#ffd86b':'#9a6a35',.72);cx.fillRect(-fr*.5,-2,fr,4);cx.restore();}}if(wind){cx.setLineDash([5,5]);for(let q=0;q<3;q++){const rr=28+q*15+pulse*7;cx.beginPath();cx.arc(s.targetX,s.targetY,rr,0,TAU);cx.stroke();}cx.setLineDash([]);cx.beginPath();cx.moveTo(s.targetX-26,s.targetY);cx.lineTo(s.targetX+26,s.targetY);cx.moveTo(s.targetX,s.targetY-26);cx.lineTo(s.targetX,s.targetY+26);cx.stroke();}cx.shadowBlur=0;}
  else if(b.pattern==='blood'){const o=bossSignatureOrigin(b),ox=o.x,oy=o.y,len=Math.max(W,H)*1.2;beam(ox,oy,s.aim,len,10+b.phase*3,'#ff425f');cx.strokeStyle=hexA('#ffb2be',wind?.32:.60);cx.lineWidth=1.4;for(let q=-1;q<=1;q+=2){cx.beginPath();cx.moveTo(ox+q*4,oy);cx.lineTo(ox+Math.cos(s.aim)*len*.36+q*Math.sin(s.aim)*9,oy+Math.sin(s.aim)*len*.36-q*Math.cos(s.aim)*9);cx.stroke();}if(!wind){cx.fillStyle=hexA('#ff425f',.22+pulse*.16);cx.beginPath();cx.ellipse(b.x,b.y-b.r*.24,b.r*(.34+.08*pulse),b.r*(.50+.13*pulse),0,0,TAU);cx.fill();for(let i=1;i<=10;i++){const u=((G.elapsed*.66+i/10)%1),px=ox+Math.cos(s.aim)*len*u,py=oy+Math.sin(s.aim)*len*u;cx.fillStyle=i%3===0?'#fff0f3':i%2?'#ffd5dc':'#ff3658';cx.shadowColor='#ff3658';cx.shadowBlur=12;cx.beginPath();cx.arc(px+Math.sin(G.elapsed*12+i)*4,py+Math.cos(G.elapsed*10+i)*4,1.8+(i%4),0,TAU);cx.fill();}for(let k=0;k<4;k++){cx.strokeStyle=hexA(k%2?'#ff3658':'#ffd0d8',.18);cx.lineWidth=2;cx.beginPath();cx.arc(b.x,b.y-b.r*.22,b.r*(.44+k*.11+pulse*.03),0,TAU);cx.stroke();}cx.shadowBlur=0;}}
  else if(b.pattern==='architect'){const width=13+b.phase*3;for(const x of s.columns||[]){cx.shadowColor='#ffbd45';cx.shadowBlur=wind?6:18;cx.fillStyle=wind?hexA(cfg.color,.16):hexA(cfg.color,.42);cx.strokeStyle=hexA('#fff09a',wind?.32:.76);cx.lineWidth=2.5;cx.fillRect(x-width,0,width*2,H);cx.strokeRect(x-width,0,width*2,H);for(let j=0;j<6;j++){const yy=(j+.5)*H/6,ww=width*(1.55+.18*Math.sin(G.elapsed*4+j));cx.fillStyle=hexA(j%2?'#ffe083':'#b97024',wind?.18:.48);cx.fillRect(x-ww,yy-5,ww*2,10);cx.strokeStyle=hexA('#fff2b5',wind?.22:.55);cx.strokeRect(x-ww,yy-5,ww*2,10);}for(const yy of [24,H-24]){cx.fillStyle=hexA('#ffbd45',wind?.36:.88);cx.shadowBlur=wind?8:22;cx.beginPath();cx.arc(x,yy,8+b.phase*2+pulse*2,0,TAU);cx.fill();cx.strokeStyle='#fff09a';cx.lineWidth=2;cx.beginPath();cx.arc(x,yy,15+b.phase*3,0,TAU);cx.stroke();}if(!wind){for(let j=0;j<7;j++){const yy=((G.elapsed*105+j*113)%H);cx.fillStyle=j%2?'#fff09a':'#ff9f2f';cx.fillRect(x-2+rnd(-2,2),yy,4,10+j%3*4);}}cx.shadowBlur=0;}const safeW=36+b.phase*4;cx.fillStyle=hexA('#a6ff5f',.08);cx.fillRect(s.safeX-safeW,0,safeW*2,H);cx.strokeStyle=hexA('#b9ff85',wind?.28:.52);cx.lineWidth=2;cx.setLineDash([9,7]);cx.beginPath();cx.moveTo(s.safeX-safeW,0);cx.lineTo(s.safeX-safeW,H);cx.moveTo(s.safeX+safeW,0);cx.lineTo(s.safeX+safeW,H);cx.stroke();cx.setLineDash([]);}
  else if(b.pattern==='odonata'){const o=bossSignatureOrigin(b),len=Math.max(W,H)*1.28,n=b.phase===1?2:b.phase===2?3:4;for(let i=0;i<n;i++){const dir=i%2?1:-1,a=s.base+(i-(n-1)/2)*.20+(wind?0:dir*prog*(.72+b.phase*.16));beam(o.x,o.y,a,len,7+b.phase*2,'#78ecff');if(!wind){for(const off of [-.026,.026]){cx.strokeStyle=hexA(off<0?'#c5a4ff':'#8affdf',.25);cx.lineWidth=3;cx.beginPath();cx.moveTo(o.x,o.y);cx.lineTo(o.x+Math.cos(a+off)*len,o.y+Math.sin(a+off)*len);cx.stroke();}for(let k=1;k<=7;k++){const u=((G.elapsed*.82+k/7+i*.11)%1),px=o.x+Math.cos(a)*len*u,py=o.y+Math.sin(a)*len*u;cx.fillStyle=k%3===0?'#e8b9ff':k%2?'#ffffff':'#78ecff';cx.shadowColor='#78ecff';cx.shadowBlur=14;cx.beginPath();cx.arc(px,py,2+(k%3)*1.1,0,TAU);cx.fill();}}}if(!wind){for(let q=1;q<=3;q++){const lag=q*10,aa=-.06*q*Math.sin(G.elapsed*5.3);cx.globalAlpha=.11/q;cx.strokeStyle=q%2?'#78ecff':'#d8b7ff';cx.lineWidth=3;cx.beginPath();cx.arc(b.x-lag,b.y+lag*.22,b.r*(.78+.09*q),aa,Math.PI+aa);cx.stroke();}cx.globalAlpha=1;cx.strokeStyle=hexA('#b8ffff',.72);cx.lineWidth=2;cx.beginPath();cx.arc(o.x,o.y,b.r*(.54+.10*Math.sin(G.elapsed*12)),0,TAU);cx.stroke();cx.shadowBlur=0;}}
  else if(b.pattern==='resonance'){const o=bossSignatureOrigin(b),maxR=Math.max(W,H)*1.06,n=1+b.phase;for(let i=0;i<n;i++){const lp=wind?(.12+i*.065):clamp((prog-i*.16)/Math.max(.1,1-i*.16),0,1),r=Math.max(16,lp*maxR),col=i%2?'#f4d37a':'#d9a7ff';cx.strokeStyle=hexA(col,wind?.40:.78);cx.lineWidth=wind?2:8+b.phase*2;cx.shadowColor=col;cx.shadowBlur=wind?0:20;cx.beginPath();cx.arc(o.x,o.y,r,0,TAU);cx.stroke();cx.strokeStyle=hexA(i%2?'#d9a7ff':'#f4d37a',wind?.16:.24);cx.lineWidth=wind?1:3;cx.beginPath();cx.arc(o.x+Math.sin(G.elapsed*5+i)*6,o.y+Math.cos(G.elapsed*4.2+i)*4,r*(.96+.018*Math.sin(G.elapsed*8+i)),0,TAU);cx.stroke();if(!wind){for(let k=0;k<10;k++){const a=k*TAU/10+G.elapsed*(i%2?.58:-.46);cx.fillStyle=k%2?'#fff09a':'#d9a7ff';cx.beginPath();cx.arc(o.x+Math.cos(a)*r,o.y+Math.sin(a)*r,2.2+(k%4),0,TAU);cx.fill();}}}const tym= b.r*.29,ty=b.y-b.r*.13;for(const sx of [-1,1]){const tx=b.x+sx*b.r*.36;cx.fillStyle=hexA(sx<0?'#d9a7ff':'#f4d37a',wind?.20:.32+pulse*.10);cx.shadowColor=sx<0?'#d9a7ff':'#f4d37a';cx.shadowBlur=wind?8:24;cx.beginPath();cx.arc(tx,ty,tym*(.82+.12*pulse),0,TAU);cx.fill();cx.strokeStyle=hexA('#ffffff',wind?.22:.52);cx.lineWidth=2;for(let q=1;q<=2;q++){cx.beginPath();cx.arc(tx,ty,tym*(.45+q*.32+pulse*.04),0,TAU);cx.stroke();}}if(!wind){cx.fillStyle=hexA('#fff09a',.13+.10*Math.sin(G.elapsed*10));cx.shadowColor='#d9a7ff';cx.shadowBlur=30;cx.beginPath();cx.ellipse(o.x,o.y,b.r*(.43+.10*Math.sin(G.elapsed*8)),b.r*(.58+.12*Math.sin(G.elapsed*8)),0,0,TAU);cx.fill();}cx.shadowBlur=0;}
  cx.restore();
}

// Signature attack v2.13.0: Cortex Razor — beam sweep 180° / 250° / 360° por fase.
function updateRazorBeam(b,p,sec,dt){if(b.pattern!=='blade'||G.mode==='training'||G.sector===13||G.sector===19)return false;b.razorBeamCd=(b.razorBeamCd??5.4)-dt;b.razorBeamHit=Math.max(0,(b.razorBeamHit||0)-dt);if((b.razorBeamWind||0)>0){b.razorBeamWind=Math.max(0,b.razorBeamWind-dt);b.animAttackT=Math.max(b.animAttackT,.35);G.bossWarningText=`RAYO RAZOR · ${b.phase===1?'180°':b.phase===2?'250°':'360°'}`;G.bossWarningT=Math.max(G.bossWarningT,b.razorBeamWind);if(b.razorBeamWind<=0){b.razorBeamT=b.razorBeamDur;bossAnimReleaseCue(b,true);AudioX.bossAttack(G.sector-1,true);}return true;}if((b.razorBeamT||0)>0){b.razorBeamT=Math.max(0,b.razorBeamT-dt);const prog=1-b.razorBeamT/Math.max(.01,b.razorBeamDur),ang=b.razorBeamStart+b.razorBeamArc*prog;b.razorBeamAngle=ang;b.animAttackT=Math.max(b.animAttackT,.25);const ox=b.x-b.r*.55,oy=b.y-b.r*.06,dx=p.x-ox,dy=p.y-oy,proj=dx*Math.cos(ang)+dy*Math.sin(ang),perp=Math.abs(dx*Math.sin(ang)-dy*Math.cos(ang)),width=18+b.phase*5;if(proj>0&&proj<W*1.35&&perp<width&&b.razorBeamHit<=0){b.razorBeamHit=.24;bossSignaturePlayerHit(b,(17+b.phase*4)*COMMANDER_DIFFICULTY.damage,1.05);}if(b.razorBeamT<=0){b.coreOpenT=Math.max(b.coreOpenT,1.35);b.razorBeamCd=b.phase===3?6.8:8.0;}return true;}if(b.entry<=0&&(b.phaseTransitionT||0)<=0&&!b.telegraphT&&!b.chargeT&&!b.specialT&&b.razorBeamCd<=0){const arc=b.phase===1?Math.PI:b.phase===2?250*Math.PI/180:TAU;b.razorBeamArc=arc;b.razorBeamDur=b.phase===3?1.85:1.55;b.razorBeamWind=.82;const ox=b.x-b.r*.55,oy=b.y-b.r*.06;b.razorBeamStart=Math.atan2(p.y-oy,p.x-ox)-arc/2;b.razorBeamAngle=b.razorBeamStart;b.razorBeamHit=0;b.specialCd=Math.max(b.specialCd,1.2);hiveRecordSignature();bossAnimStartSignatureCue(b,{wind:.82,active:b.razorBeamDur},'RAYO RAZOR');notify(`⚡ RAYO RAZOR · ${b.phase===1?'180°':b.phase===2?'250°':'360°'}`,'#ff9a55',1.2);AudioX.bossWarn(G.sector-1);return true;}return false;}
function drawBossBeam(b){if(!b||b.pattern!=='blade'||(!b.razorBeamT&&!b.razorBeamWind))return;const ang=b.razorBeamAngle??b.razorBeamStart??Math.PI,len=Math.max(W,H)*1.35,ox=b.x-b.r*.55,oy=b.y-b.r*.06,x2=ox+Math.cos(ang)*len,y2=oy+Math.sin(ang)*len;cx.save();if(b.razorBeamWind>0){const a=.24+.28*Math.sin(G.elapsed*18);cx.globalAlpha=a;cx.strokeStyle='#ffd3af';cx.lineWidth=3;cx.setLineDash([10,8]);cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);}else{cx.shadowColor='#ff7d32';cx.shadowBlur=28;cx.strokeStyle='rgba(255,92,42,.32)';cx.lineWidth=38+b.phase*6;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.strokeStyle='#ff9a55';cx.lineWidth=20+b.phase*4;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();cx.strokeStyle='#fff3ca';cx.lineWidth=5;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(x2,y2);cx.stroke();for(let i=1;i<=5;i++){const u=i/6,px=lerp(ox,x2,u),py=lerp(oy,y2,u);cx.fillStyle=i%2?'#fff6c9':'#ff6e37';cx.beginPath();cx.arc(px+rnd(-8,8),py+rnd(-8,8),rnd(2,4),0,TAU);cx.fill();}}cx.restore();}

function updateBoss(dt){
  const b=G.boss;if(!b||b.dead)return;const tempo=1/COMMANDER_DIFFICULTY.tempo;b.t+=dt;b.wingT+=dt;b.animAttackT=Math.max(0,(b.animAttackT||0)-dt);updateBossAnimCue(b,dt);b.fire-=dt*tempo;b.specialCd-=dt*tempo;b.arenaCd=(b.arenaCd??5)-dt*tempo;b.specialT=Math.max(0,b.specialT-dt);b.guardT=Math.max(0,b.guardT-dt);b.coreOpenT=Math.max(0,(b.coreOpenT||0)-dt);b.flash=Math.max(0,(b.flash||0)-dt);b.animPulse=Math.max(0,(b.animPulse||0)-dt);b.phaseFlash=Math.max(0,(b.phaseFlash||0)-dt);
  const sec=SECTORS[G.sector-1];
  if(b.entry<=0&&(b.phaseTransitionT||0)<=0)b.phaseElapsed=(b.phaseElapsed||0)+dt;if(b.entry<=0)updateCommanderConvergence(dt);
  if(b.dying){
    b.deathT=Math.max(0,b.deathT-dt);b.vx=(b.vx||0)-18*dt;b.x+=(b.vx||0)*dt*.12;b.y+=Math.sin(b.t*10)*22*dt;
    const elapsed=BOSS_STANDARD.deathDuration-b.deathT,st=elapsed>.35?1:0,st2=elapsed>1.08?2:st,st3=elapsed>2.05?3:st2,st4=elapsed>2.78?4:st3,targetStage=st4;
    while((b.deathStage||0)<targetStage){b.deathStage=(b.deathStage||0)+1;bossDeathBurst(b,b.deathStage);if(b.deathStage===3)notify('⚠ COLAPSO DEL NÚCLEO','#fff09a',.8);}
    if(Math.random()<dt*28){const dp=bossDeathProfile(sec),col=Math.random()<.45?dp.secondary:dp.primary;burst(b.x+rnd(-b.r*.72,b.r*.72),b.y+rnd(-b.r*.72,b.r*.72),col,rndI(2,5),rnd(80,210));}
    if(b.deathT<=0){bossDeathBurst(b,4);finalizeBossKill();}return;
  }
  const ratio=b.hp/b.maxHp,newPhase=ratio>.68?1:ratio>.34?2:3;b.damageStage=ratio>.70?0:ratio>.36?1:ratio>.15?2:3;
  if(newPhase!==b.phase){const def=bossDefenseProfile(G.sector);b.phase=newPhase;hiveRecordPhase(newPhase);b.phaseElapsed=0;b.phaseGateWarned=false;if(newPhase===2){prepareCommanderConvergence(true);deployCommanderConvergence(true);}else if(newPhase===3)deployCommanderConvergence(true);const sr=G.player.shield/G.player.maxShield;if(sr<.30||(sr<.58&&Math.random()<.58))spawnPickup(clamp(G.player.x+85,80,W-80),clamp(G.player.y+rnd(-55,55),70,H-70),'shield');b.phaseTransitionT=def.phaseLock;b.coreOpenT=0;b.specialCd=.65;b.signatureCd=.20;b.signatureAttack=null;b.identityOpacity=1;b.signatureAttackCd=Math.min(b.signatureAttackCd??9,1.15);b.animPulse=1.45;b.phaseFlash=1;startBossAnimCue(b,'phase',{duration:def.phaseLock,releaseAt:def.phaseLock*.52,releaseFrame:4,startFrame:0,tag:'phase-transition'});b.altNext=newPhase>=2;const phaseName=bossPhaseNameForSector(b,newPhase);notify(`FASE ${newPhase}${phaseName?' · '+phaseName:''} · ${b.name}`,'#ffbd6a',2);AudioX.bossPhase(G.sector-1);MusicX.onBossPhase?.(newPhase);shake=11;bossPhaseBurst(b,sec);bossIdentityPhasePulse(b,sec);ringBullets(b.x,b.y,10+newPhase*3,195+newPhase*30,9+newPhase,sec.accent,b.t,b,'phase');bossSupportFormation(b,sec,newPhase,true);}
  if(b.entry>0){
    b.entry=Math.max(0,b.entry-dt);const progress=1-clamp(b.entry/Math.max(.1,b.entryMax||2.2),0,1);b.x=lerp(b.x,W*.68,1-Math.pow(.01,dt));b.y=H*.5+Math.sin(b.t*3)*18;
    if((b.arrivalStage||0)<1&&progress>.20){b.arrivalStage=1;notify(`${sec.boss} · ENTRADA EN ARENA`,sec.accent,1.25);G.particles.push({kind:'shock',x:W*.82,y:H*.5,r:18,vr:260,life:.65,max:.65,col:sec.accent});}
    if((b.arrivalStage||0)<2&&progress>.58){b.arrivalStage=2;ringBullets(b.x,b.y,8,135,7,sec.accent,b.t,b,'arrival');shake=Math.max(shake,7);AudioX.bossPhase(G.sector-1);}
    if((b.arrivalStage||0)<3&&progress>.90){b.arrivalStage=3;G.bossArrivalBanner={name:b.name,family:sec.family,subtitle:bossIdentity()?.signature||'',color:sec.accent,t:2.1,max:2.1};G.particles.push({kind:'shock',x:b.x,y:b.y,r:b.r*.5,vr:330,life:.72,max:.72,col:sec.accent});}
    bossVfx(b,BOSS_SKILLS[b.pattern]?.color||'#fff',Math.random()<.22?2:0);return;
  }
  if((b.phaseTransitionT||0)>0){const def=bossDefenseProfile(G.sector);b.phaseTransitionT=Math.max(0,b.phaseTransitionT-dt);b.animPulse=Math.max(b.animPulse,.75);if(Math.random()<dt*24)bossVfx(b,BOSS_SKILLS[b.pattern]?.color||sec.accent,2);if(b.phaseTransitionT<=0){b.coreOpenT=def.coreDuration+.10*b.phase;notify('NÚCLEO EXPUESTO · VENTANA DE DAÑO','#fff09a',1.25);}return;}
  const p=G.player,pressure=bossPressureProfile(G.sector),phaseSpeed=(1+(b.phase-1)*.2)*(G.bossCheckpoint?1.12:1)*pressure.move*COMMANDER_DIFFICULTY.move;
  if(updateBossSignatureAttack(b,p,sec,dt))return;
  if(updateRazorBeam(b,p,sec,dt))return;
  if(Math.random()<dt*(1.6+b.phase*.45))bossVfx(b,BOSS_SKILLS[b.pattern]?.color||sec.accent,1);
  if(b.phase>=2&&b.pattern!=='storm'&&G.mode!=='training'){
    b.bossSupportCd=(b.bossSupportCd??pressure.support)-dt*tempo;
    if(b.bossSupportCd<=0){const n=bossSupportFormation(b,sec,b.phase,false);b.bossSupportCd=pressure.support*(b.phase===3?.78:1);if(b.phase===3)ringBullets(b.x,b.y,6+G.sector,180+G.sector*6,8+G.sector*.35,sec.accent,b.t,b,'support');notify(`REFUERZOS ${n} · ${sec.family}`,sec.accent,.9);}
  }
  if(b.arenaCd<=0){bossArenaHazard(b,p,sec);b.arenaCd=Math.max(2.15,(6.2-b.phase*.72-G.sector*.12-(G.mode==='bossRush'?.45:0))*pressure.cool);}
  if(b.telegraphT>0){b.telegraphT-=dt;b.animPulse=Math.max(b.animPulse,.42);b.x+=Math.sin(b.t*18)*10*dt;if(b.telegraphT<=0)executeBossSpecial(b,p,sec);return;}
  if(b.chargeT>0){b.chargeT-=dt;b.x+=b.chargeVX*dt;b.y+=b.chargeVY*dt;if(dist(b,p)<b.r+p.r+10)hitPlayer((24+G.sector*2.6)*COMMANDER_DIFFICULTY.contact);if(b.chargeT<=0){b.x=clamp(b.x,W*.38,W*.86);b.specialCd=Math.max(1.9,2.7-b.phase*.16);}return;}
  if(!(G.sector>=11&&G.sector<=20)&&bossSignatureMovement(b,p,sec,dt))return;
  if(b.specialCd<=0){let key=bossPrimarySkill(b.pattern);if(b.phase>=2&&(b.altNext||Math.random()<.5)){key=bossSecondarySkill(b.pattern);b.altNext=false;}else if(b.phase>=2)b.altNext=true;if(key){startBossWarning(b,key,b.phase===3?.72:(b.pattern==='titan'?1.0:.82));b.specialCd=Math.max(G.bossCheckpoint?1.25:1.55,(4.55-b.phase*.62-G.sector*.08-(G.bossCheckpoint?.28:0))*pressure.cool);return;}}
  if(updateCH2BossIdentityMovement(b,p,sec,dt,phaseSpeed))return;
  switch(b.pattern){
    case 'queen':b.x=W*.65+Math.sin(b.t*.82)*W*.17;b.y=H*.5+Math.sin(b.t*1.7)*H*.29;if(b.fire<=0){b.fire=Math.max(.34,.80/phaseSpeed);ringBullets(b.x,b.y,7+b.phase*3,200+b.phase*24,8+b.phase,sec.accent,b.t*.72,b,'primary');if(Math.random()<.66)spawnEnemy(pick(sec.forms.slice(0,b.phase>=3?3:2)),b.x-30,b.y+rnd(-92,92));}break;
    case 'moth':b.y=H*.5+Math.sin(b.t*3.15)*H*.33;b.x=W*.64+Math.sin(b.t*1.28)*W*.18;if(b.fire<=0){b.fire=Math.max(.36,.68-.08*b.phase);enemyShoot(b,'spread');commanderFan(b,b.x,b.y,Math.PI,5,.14,190+25*b.phase,7+b.phase*.6,5,'primary');if(b.phase===3&&Math.random()<.42)spawnEnemy(pick(sec.forms),b.x-30,b.y+rnd(-95,95));}break;
    case 'blade':{const a=Math.atan2(p.y-b.y,p.x-b.x);b.x=W*.65+Math.sin(b.t*1.7)*W*.17;b.y=H*.5+Math.sin(b.t*2.95)*H*.27;if(b.fire<=0){b.fire=Math.max(.31,.58-.065*b.phase);commanderFan(b,b.x,b.y,a,5,.11,295+28*b.phase,8+b.phase*.7,4.5,'primary');if(b.phase>=2)G.particles.push({kind:'slash',x:b.x,y:b.y,a,len:b.r*1.65,life:.16,max:.16,col:'#ff9a55'});}break;}
    case 'titan':b.x=W*.66+Math.sin(b.t*.82)*W*.15;b.y=H*.5+Math.sin(b.t*1.3)*H*.25;if(b.fire<=0){b.fire=Math.max(.35,.62-.055*b.phase);enemyShoot(b,b.phase>1?'spread':'aim');if(b.phase>=2&&Math.random()<.72)ringBullets(b.x,b.y,8+b.phase*2,165+20*b.phase,8,sec.accent,b.t,b,'primary');if(b.phase===3&&Math.random()<.38)spawnEnemy(sec.forms[1],b.x-35,b.y+rnd(-100,100));}break;
    case 'storm':{const amp=b.phase===3?W*.24:W*.20;b.y=H*.5+Math.sin(b.t*(2.9+b.phase*.18))*H*.37;b.x=W*.61+Math.sin(b.t*(1.95+b.phase*.12))*amp;b.imperialEscortCd=(b.imperialEscortCd??5.5)-dt*tempo;if(b.imperialEscortCd<=0){b.imperialEscortCd=b.phase===3?3.8:b.phase===2?4.8:6.3;const n=b.phase===3?3:2;for(let i=0;i<n;i++)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-35,b.y+rnd(-125,125));if(b.phase>=2)ringBullets(b.x,b.y,9+b.phase*3,245+20*b.phase,9.5,'#ffe66f',b.t*2.8,b,'escort');notify(b.phase===3?'ENJAMBRE IMPERIAL · FRENESÍ DE AGUIJÓN':'ESCOLTA IMPERIAL ENTRANTE','#ffe66f',1.1);}if(b.fire<=0){b.fire=Math.max(.24,.48-.055*b.phase);enemyShoot(b,'spread');if(b.phase>1)ringBullets(b.x,b.y,8+b.phase*3,235+22*b.phase,9.5,'#ffe66f',b.t*2.9,b,'primary');if(b.phase===3&&Math.random()<.62)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-30,b.y+rnd(-105,105));}break;}
    case 'leap':{const leap=(Math.sin(b.t*2.9)+1)*.5;b.x=W*.76-leap*W*.32;b.y=H*.5+Math.sin(b.t*2.9)*H*.36;if(b.fire<=0){b.fire=Math.max(.34,.66-.06*b.phase);ringBullets(b.x,b.y,7+b.phase*3,215+20*b.phase,9.5,sec.accent,b.t,b,'primary');if(b.phase>1&&Math.random()<.34)spawnEnemy(pick(sec.forms),b.x-25,b.y+rnd(-88,88));}break;}
    case 'blood':{b.x=W*.62+Math.sin(b.t*1.55)*W*.22;b.y=H*.5+Math.sin(b.t*2.6)*H*.34;if(b.fire<=0){b.fire=Math.max(.25,.49-.05*b.phase);enemyShoot(b,b.phase>=2?'spread':'aim');if(b.phase>=2&&Math.random()<.55)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-25,b.y+rnd(-110,110));}break;}
    case 'architect':{b.x=W*.67+Math.sin(b.t*.58)*W*.13;b.y=H*.5+Math.sin(b.t*1.05)*H*.22;if(b.fire<=0){b.fire=Math.max(.36,.67-.055*b.phase);ringBullets(b.x,b.y,8+b.phase*2,150+18*b.phase,9,'#ffd56a',b.t,b,'primary');if(b.phase>=2&&Math.random()<.34)spawnEnemy('termite_worker',b.x-25,b.y+rnd(-90,90));}break;}
    case 'odonata':{const sweep=(Math.sin(b.t*3.3)+1)*.5;b.x=W*.78-sweep*W*.42;b.y=H*.5+Math.sin(b.t*4.2)*H*.37;if(b.fire<=0){b.fire=Math.max(.22,.46-.045*b.phase);const a=Math.atan2(p.y-b.y,p.x-b.x);commanderFan(b,b.x,b.y,a,3,.08,350+30*b.phase,9,4,'primary');}break;}
    case 'resonance':{b.x=W*.62+Math.sin(b.t*.72)*W*.20;b.y=H*.5+Math.sin(b.t*1.22)*H*.30;if(b.fire<=0){b.fire=Math.max(.3,.58-.05*b.phase);ringBullets(b.x,b.y,10+b.phase*3,165+22*b.phase,9,'#d9a7ff',b.t*.75,b,'primary');if(b.phase===3&&Math.random()<.42)spawnEnemy(pick(sec.forms.slice(0,2)),b.x-25,b.y+rnd(-105,105));}break;}
  }
  b.x=clamp(b.x,W*.36,W*.86);b.y=clamp(b.y,70,H-70);if(dist(b,p)<b.r+p.r)hitPlayer((25+G.sector*2.5)*COMMANDER_DIFFICULTY.contact);
}
function updateObstacles(dt){
  const p=G.player;
  for(const o of G.obstacles){
    o.t+=dt;o.x+=o.vx*dt;o.y+=(o.vy||0)*dt;o.rot+=dt*.4;
    if(o.type==='mine'){o.y+=Math.sin(o.t*4+o.r)*18*dt; if(dist(o,p)<o.r+42){o.hp=0;hitPlayer(16+G.sector);ringBullets(o.x,o.y,6,190,7,'#ffe16b',o.rot);}}
    if(o.type==='acidpod'&&dist(o,p)<o.r+46){o.hp=0;hitPlayer(18+G.sector);ringBullets(o.x,o.y,10,175,8,'#c9ff77',o.rot);}
    if(o.type==='spore'&&dist(o,p)<o.r+48){o.hp=0;hitPlayer(17+G.sector);ringBullets(o.x,o.y,8,180,7,'#c9ff77',o.rot);}
    if(o.type==='dustpod'&&dist(o,p)<o.r+52){o.hp=0;hitPlayer(15+G.sector);for(let k=-2;k<=2;k++)spawnEnemyBullet(o.x,o.y,Math.PI+k*.18,170,7,5,'#e9d5ff');}
    if(o.type==='drone'&&o.t>1.2&&Math.sin(o.t*2.1)>.985){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),255,8,5,'#9ee8ff');}
    if(o.type==='seed'&&o.t>1.4&&Math.sin(o.t*3.1)>.992){spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x),220,8,5,'#ebff77');}
    if(o.type==='bloodcapsule'&&o.t>1.1&&Math.sin(o.t*3.6)>.994){ringBullets(o.x,o.y,6,165,7,'#ff6175',o.rot);}
    if(o.type==='bloodsac'&&dist(o,p)<o.r+46){hitPlayer(14+G.sector);o.hp-=22;}
    if(o.type==='resinnode'&&o.t>1.6&&Math.sin(o.t*2.2)>.995&&G.enemies.length<18){spawnEnemy('termite_worker',o.x-20,o.y+rnd(-38,38));}
    if(o.type==='electricnode'&&o.t>1.0&&Math.sin(o.t*3.8)>.993){for(let k=-1;k<=1;k++)spawnEnemyBullet(o.x,o.y,Math.atan2(p.y-o.y,p.x-o.x)+k*.12,285,9,4,'#78ecff');}
    if(o.type==='sonicring'&&o.t>1.3&&Math.sin(o.t*2.9)>.994){ringBullets(o.x,o.y,8,170,8,'#d9a7ff',o.rot);}
    if(o.type==='resonator'&&o.t>1.5&&Math.sin(o.t*2.4)>.994){ringBullets(o.x,o.y,10,145,8,'#f2d277',o.rot);}
    if(dist(o,p)<o.r+p.r){hitPlayer(o.contact||12);p.x-=18;}
    if(o.hp<=0){o.dead=true;burst(o.x,o.y,o.col,14,150);
      if(['cocoon','nest'].includes(o.type)&&Math.random()<.55)spawnPowerReward(o.x,o.y);
      else if(['mine','dustpod','seed'].includes(o.type)&&Math.random()<.38)spawnPickup(o.x,o.y,'shield');
      else if(Math.random()<.42)spawnPickup(o.x,o.y,'credit');
    }
  }
  G.obstacles=G.obstacles.filter(o=>!o.dead&&o.x>-160&&o.x<W+180&&o.y>-180&&o.y<H+180);
}
function updateBullets(dt){
  for(const b of G.bullets){
    if(b.homing&&b.target&&!b.target.dead){const a=Math.atan2(b.target.y-b.y,b.target.x-b.x),spd=Math.hypot(b.vx,b.vy);b.vx=lerp(b.vx,Math.cos(a)*spd,dt*4.5);b.vy=lerp(b.vy,Math.sin(a)*spd,dt*4.5);}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)continue;
    let hit=null;if(G.boss&&!G.boss.dead&&dist(b,G.boss)<b.r+G.boss.r)hit=G.boss;
    if(!hit){for(const n of G.objectiveTargets||[]){if(!n.dead&&dist(b,n)<b.r+n.r){hit=n;break;}}}
    if(!hit){for(const f of G.frontThreats){if(!f.dead&&dist(b,f)<b.r+f.r){hit=f;break;}}}
    if(!hit){for(const e of G.enemies){if(!e.dead&&dist(b,e)<b.r+e.r){hit=e;break;}}}
    if(!hit){for(const o of G.obstacles){if(!o.dead&&dist(b,o)<b.r+o.r){hit=o;break;}}}
    if(hit){
      if('hp'in hit){if(hit===G.boss)damageEntity(hit,b.dmg,b.bio?'bio':b.slow?'cryo':'normal');else{const hiveDirectDmg=b.dmg*combatDamageMult(),hiveBefore=Math.max(0,Number(hit.hp)||0);hit.hp-=hiveDirectDmg;hiveRecordPlayerDamage(Math.max(0,hiveBefore-Math.max(0,hit.hp)),false,b.bio?'bio':b.slow?'cryo':'normal');hit.flash=.07;if(b.bio&&G.enemies.includes(hit)){hit.bio=Math.max(hit.bio||0,b.bio);hit.bioRank=Math.max(hit.bioRank||0,b.bioRank||1);} if(G.frontThreats.includes(hit)&&hit.hp<=0)killFrontThreat(hit);else if(G.enemies.includes(hit)&&hit.hp<=0)killEnemy(hit);else if((G.objectiveTargets||[]).includes(hit)&&hit.hp<=0)destroyObjectiveTarget(hit);else if(G.obstacles.includes(hit)&&hit.hp<=0)hit.dead=true;}}
      if(b.slow&&G.enemies.includes(hit))hit.slow=Math.max(hit.slow,1.3);
      if(b.splash){for(const e of G.enemies){if(!e.dead&&e!==hit&&Math.hypot(e.x-b.x,e.y-b.y)<b.splash)damageEntity(e,b.dmg*.34,b.slow?'cryo':'acid');}if(G.boss&&hit!==G.boss&&Math.hypot(G.boss.x-b.x,G.boss.y-b.y)<b.splash)damageEntity(G.boss,b.dmg*.22,'acid');burst(b.x,b.y,b.col,7,100);}
      AudioX.hit();if(b.pierce>0){b.pierce--;b.x+=b.vx*dt*2;}else b.life=0;
    }
  }
  G.bullets=G.bullets.filter(b=>b.life>0&&b.x>-80&&b.x<W+120&&b.y>-100&&b.y<H+100);
}
function updateEnemyBullets(dt){
  const p=G.player;for(const b of G.eBullets){
    b.age=(b.age||0)+dt;
    // Las armas de mando comparten daño con el sistema existente, pero su firma cinética también es distinta.
    if(b.style==='stinger'&&b.age<.48){const k=1+dt*.085;b.vx*=k;b.vy*=k;}
    else if(b.style==='spore'){const sp=Math.hypot(b.vx,b.vy)||1;b.x+=(-b.vy/sp)*Math.sin(b.age*5+(b.phase||0))*15*dt;b.y+=(b.vx/sp)*Math.sin(b.age*5+(b.phase||0))*15*dt;}
    else if(b.style==='blood'&&b.age<.70&&b.role!=='ring'&&b.role!=='arena'){const sp=Math.hypot(b.vx,b.vy)||1,ta=Math.atan2(p.y-b.y,p.x-b.x),ca=Math.atan2(b.vy,b.vx),da=Math.atan2(Math.sin(ta-ca),Math.cos(ta-ca)),na=ca+da*clamp(dt*.48,0,.08);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.style==='kinetic'&&(b.bounces||0)>0&&(b.y<b.r+8||b.y>H-b.r-8)){b.vy*=-1;b.y=clamp(b.y,b.r+9,H-b.r-9);b.bounces--;}
    b.life-=dt;const c=activeWaveObjective()?.capsule;if(b.life>0&&c&&dist(b,c)<b.r+c.r){b.life=0;c.hp-=b.dmg*(runDifficultyKey()==='hard'?.72:.58);G.particles.push({kind:'spark',x:b.x,y:b.y,vx:rnd(-45,45),vy:rnd(-45,45),r:2,life:.18,max:.18,col:c.col});}if(b.life>0&&dist(b,p)<b.r+p.r){b.life=0;const src=b.source,wasHp=p.hp,wasSh=p.shield;hitPlayer(b.dmg);if(src&&(src===G?.boss||src?.kind==='lieutenant'))AudioX.bossImpact(Math.max(0,bossEntitySector(src)-1),src===G?.boss?1:.82);if(src&&!src.dead&&src.family==='MOSQUITOS'){const drained=Math.max(0,(wasHp+wasSh)-(p.hp+p.shield));src.hp=Math.min(src.maxHp,src.hp+drained*.42);G.particles.push({kind:'arc',x:p.x,y:p.y,x2:src.x,y2:src.y,life:.16,max:.16,col:'#ff6175'});}}}
  G.eBullets=G.eBullets.filter(b=>b.life>0&&b.x>-100&&b.x<W+100&&b.y>-100&&b.y<H+100);
}
function updatePickups(dt){
  const p=G.player,postElapsed=G.postBossT>0?(G.postBossMax-G.postBossT):0,postMag=G.postBossT>0&&postElapsed>=4?1200:0,mag=70+up('magnet')*18+(powerOn('magnet')?100+powerRank('magnet')*65:0)+postMag;
  for(const q of G.pickups){q.t+=dt;if(G.postBossT<=0)q.life-=dt;else q.life=Math.max(q.life,4);q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.94,dt*60);q.vy*=Math.pow(.94,dt*60);const d=dist(q,p);if(d<mag){const k=clamp(dt*(d<42?12:4.8),0,1);q.x=lerp(q.x,p.x,k);q.y=lerp(q.y,p.y,k);}if(d<p.r+q.r+5){collect(q);q.life=0;}}
  G.pickups=G.pickups.filter(q=>q.life>0);
}
function collect(q){
  if(q.type==='credit'){const frenzy=G.frenzyT>0?G.frenzyMult:1,stacks=Math.max(1,q.value||1),gain=Math.round(creditPickupBase()*economyMult()/sectorBalance().reward*frenzy*stacks);grantCredits(gain,'pickup_credit');G.score+=gain*3;gainXp(Math.round(gain*.62));AudioX.pickup();}
  else if(q.type==='bossCredit'){const gain=Math.max(0,Math.round(q.value||0));grantCredits(gain,'boss_loot_credit',true);G.score+=gain*2;AudioX.pickup();}
  else if(q.type==='bossXp'){const gain=Math.max(0,Math.round(q.value||0));grantRewardXp(gain,'boss_loot_xp',false);AudioX.pickup();}
  else if(q.type==='heritageToken'){AudioX.pickup();notify(`HERENCIA RECOGIDA · ${HERITAGE_NAMES[G.sector]||POWERS[q.key]?.name||'PODER DE JEFE'}`,'#ffd76a',1.6);}
  else if(q.type==='heal'){const gain=Math.max(24,Math.round(G.player.maxHp*(q.healFraction||0)));G.player.hp=Math.min(G.player.maxHp,G.player.hp+gain);AudioX.pickup();notify(`+${gain} BIO-REPARACIÓN`,'#ff7791',1.2);}
  else if(q.type==='shield'){const commander=!!q.commanderSupport,gain=commander?Math.max(32,Math.round(G.player.maxShield*.42)):28;G.player.shield=Math.min(G.player.maxShield,G.player.shield+gain);if(G.player.shield/G.player.maxShield>.42)G.shieldCriticalWarned=false;G.particles.push({kind:'shieldwave',x:G.player.x,y:G.player.y,r:G.player.r+8,vr:180,life:.55,max:.55,col:'#7fb7ff'});AudioX.power('shield');notify(`⬡ ESCUDO +${gain}`,'#7fb7ff',1.2);}
  else if(q.type==='weaponBoost'){const was=G.weaponBoostT>0;G.weaponBoostStacks=Math.min(2,(was?(G.weaponBoostStacks||1)+1:1));G.weaponBoostMult=1.35+(G.weaponBoostStacks-1)*.12;G.weaponBoostT=Math.min(24,(was?G.weaponBoostT:0)+12);AudioX.power('overdrive');powerActivationVfx('overdrive');notify(`⚡ IMPACTO +${Math.round((G.weaponBoostMult-1)*100)}% · ${Math.ceil(G.weaponBoostT)}s`,'#ffcf73',1.55);}
  else if(q.type==='power')activatePower(q.key,'pickup');
  else if(q.type==='fragment')evolvePowerFragment();
  else if(q.type==='objectiveCore'){const o=G.waveObjective;if(o&&o.status==='active'&&q.objectiveId===o.id)completeWaveObjective('núcleo recuperado');AudioX.pickup();}
  else if(q.type==='bossCore')collectBossCore(q);
}
function updateParticles(dt){const cap=performanceParticleCap();if(G.particles.length>cap)G.particles.splice(0,G.particles.length-cap);for(const p of G.particles){p.life-=dt;if(p.kind==='dot'||p.kind==='spark'){p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;(p.vx)&&(p.vx*=Math.pow(.92,dt*60));(p.vy)&&(p.vy*=Math.pow(.92,dt*60));}else if(['ring','shock','halo','shieldwave'].includes(p.kind))p.r+=(p.vr||0)*dt;}G.particles=G.particles.filter(p=>p.life>0);}

// v2.15.15 · BOSS ARENA PRESENTATION PASS — Mundos 11–20
// La arena reacciona a Fase I/II/III con iluminación, geometría ambiental y pulso escénico.
// Es una capa VISUAL de bajo coste: no altera HP, daño, hitboxes, cadencia, drops ni objetivos.
const CH2_ARENA_PRESENTATION={
  11:{id:'KHEPRI_ORRERY',motif:'orbit',secondary:'#ffe08a',label:'ORRERÍA KHEPRI'},
  12:{id:'VESPERA_AERIE',motif:'lance',secondary:'#d8ff84',label:'NIDO DE PICAS'},
  13:{id:'REGENT_CRUCIBLE',motif:'clamp',secondary:'#ffb071',label:'CRISOL REGENTE'},
  14:{id:'PYROLUX_CONSTELLATION',motif:'lumen',secondary:'#fff0a4',label:'CATEDRAL LÚMEN'},
  15:{id:'CAUSTIC_REACTOR',motif:'acid',secondary:'#d5ff79',label:'REACTOR CÁUSTICO'},
  16:{id:'ATLAS_SANCTUM',motif:'veil',secondary:'#f2d8ff',label:'SANTUARIO DEL VELO'},
  17:{id:'MIRAGE_NEXUS',motif:'mirror',secondary:'#c5fff0',label:'NEXUS REFRACTIVO'},
  18:{id:'PIT_COLOSSEUM',motif:'vortex',secondary:'#ffd287',label:'COLISEO DE FOSA'},
  19:{id:'AURICULUS_GRID',motif:'razor',secondary:'#ffb0bf',label:'MALLA ELECTROFÁGICA'},
  20:{id:'IMPERIAL_APIARY',motif:'hive',secondary:'#fff1ae',label:'TRONO APIARIO'}
};
function bossArenaPresentationSpec(sector=G?.sector||0){return CH2_ARENA_PRESENTATION[Math.round(sector)]||null;}
function bossArenaPresentationStatus(){const b=G?.boss,s=b?bossArenaPresentationSpec(G.sector):null;return {enabled:!!s,world:G?.sector||0,id:s?.id||null,label:s?.label||null,motif:s?.motif||null,phase:b?.phase||0,transition:!!(b?.phaseTransitionT>0),critical:!!(b&&b.hp/b.maxHp<=.15),performance:typeof PERF!=='undefined'?PERF.tier:'FULL'};}
function drawBossArenaPresentation(){
  const b=G?.boss,s=b&&bossArenaPresentationSpec(G.sector);if(!s||b.dead||b.dying||G.mode==='training')return;
  const sec=SECTORS[G.sector-1],perf=clamp(performanceAmbientFactor(),.20,1),phase=clamp(b.phase||1,1,3),ratio=clamp(b.hp/Math.max(1,b.maxHp),0,1),t=G.elapsed||0;
  const transition=clamp((b.phaseFlash||0)+((b.phaseTransitionT||0)>0?.28:0),0,1),critical=ratio<=.15?(.5+.5*Math.sin(t*7)):0;
  const intensity=(.045+phase*.024+transition*.09+critical*.025)*(.58+.42*perf),col=sec.accent||'#8eeaff',secCol=s.secondary||'#fff';
  cx.save();
  // Luz ambiental por fase. La geometría de fondo permanece legible y no altera la colisión.
  const glow=cx.createRadialGradient(W*.67,H*.50,12,W*.56,H*.50,Math.max(W,H)*.72);glow.addColorStop(0,hexA(col,intensity*(1.28+phase*.10)));glow.addColorStop(.42,hexA(col,intensity*.48));glow.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=glow;cx.fillRect(0,0,W,H);
  if(transition>0){cx.globalAlpha=.05+.10*transition;cx.fillStyle=secCol;cx.fillRect(0,0,W,H);}
  const q=perf<.45?1:perf<.72?2:3,baseA=(.08+phase*.025)*(perf*.75+.25);cx.globalAlpha=baseA;cx.strokeStyle=col;cx.fillStyle=hexA(col,.08);cx.lineWidth=1.2+phase*.35;cx.shadowColor=col;cx.shadowBlur=perf>.7?8+phase*3:0;
  const cx0=W*.69,cy0=H*.52;
  if(s.motif==='orbit'){
    for(let i=0;i<q+2;i++){const rx=W*(.10+i*.045+phase*.012),ry=H*(.12+i*.035);cx.save();cx.translate(cx0,cy0);cx.rotate(t*(i%2?.055:-.04)+i*.42);cx.beginPath();cx.ellipse(0,0,rx,ry,0,0,TAU);cx.stroke();cx.restore();}
    for(let i=0;i<q+phase;i++){const a=t*(.35+i*.06)+i*TAU/(q+phase),r=W*(.10+i*.018);cx.beginPath();cx.arc(cx0+Math.cos(a)*r,cy0+Math.sin(a)*r*.55,2.2+phase*.7,0,TAU);cx.fill();}
  }else if(s.motif==='lance'){
    const n=q+phase;for(let i=0;i<n;i++){const y=H*(.18+(i+1)/(n+1)*.64),off=Math.sin(t*1.4+i)*18;cx.beginPath();cx.moveTo(W*.96,y-off);cx.lineTo(W*.54,y+off*.35);cx.stroke();if(phase>=2){cx.globalAlpha=baseA*.55;cx.beginPath();cx.moveTo(W*.90,y+18);cx.lineTo(W*.62,y-6);cx.stroke();cx.globalAlpha=baseA;}}
  }else if(s.motif==='clamp'){
    const gap=H*(.32-phase*.035)+Math.sin(t*1.5)*5;cx.lineWidth=3+phase;for(const sy of [-1,1]){cx.beginPath();cx.moveTo(W*.43,cy0+sy*gap);cx.quadraticCurveTo(W*.64,cy0+sy*gap*.72,W*.88,cy0+sy*gap*.44);cx.stroke();for(let j=0;j<q+2;j++){const x=W*(.50+j*.09),yy=cy0+sy*(gap*(.88-j*.09));cx.beginPath();cx.moveTo(x,yy);cx.lineTo(x+22,yy-sy*(14+phase*4));cx.stroke();}}
  }else if(s.motif==='lumen'){
    const n=4+phase+q,pts=[];for(let i=0;i<n;i++){const a=t*.16+i*TAU/n,r=W*(.10+.018*(i%2));pts.push({x:cx0+Math.cos(a)*r,y:cy0+Math.sin(a)*H*.18});}for(let i=0;i<n;i++){const p=pts[i],nxt=pts[(i+1)%n];cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(nxt.x,nxt.y);cx.stroke();cx.beginPath();cx.arc(p.x,p.y,2+phase*.6,0,TAU);cx.fill();}
  }else if(s.motif==='acid'){
    const n=q+phase+1;for(let i=0;i<n;i++){const x=W*(.48+i/(n+1)*.43),y=H*(.66+Math.sin(t*.8+i)*.05),r=12+phase*4+(i%2)*7;cx.beginPath();cx.arc(x,y,r*(.9+.12*Math.sin(t*2+i)),0,TAU);cx.stroke();cx.globalAlpha=baseA*.45;cx.beginPath();cx.arc(x+r*.2,y-r*.2,r*.48,0,TAU);cx.fill();cx.globalAlpha=baseA;}
  }else if(s.motif==='veil'){
    for(let i=0;i<q+phase;i++){const x=W*(.48+i*.09),amp=H*(.18+i*.015);cx.beginPath();cx.moveTo(x,0);cx.bezierCurveTo(x+Math.sin(t*.7+i)*40,H*.28,x-30,H*.66,x+Math.cos(t*.8+i)*26,H);cx.stroke();cx.globalAlpha=baseA*.36;cx.lineWidth=7+phase*2;cx.stroke();cx.globalAlpha=baseA;cx.lineWidth=1.2+phase*.35;}
  }else if(s.motif==='mirror'){
    const n=3+phase+q;for(let i=0;i<n;i++){const a=t*.07+i*TAU/n,r=W*(.09+.028*(i%3)),x=cx0+Math.cos(a)*r,y=cy0+Math.sin(a)*H*.20,sz=10+phase*3;cx.save();cx.translate(x,y);cx.rotate(a+t*.18);cx.beginPath();cx.moveTo(0,-sz);cx.lineTo(sz*.45,0);cx.lineTo(0,sz);cx.lineTo(-sz*.45,0);cx.closePath();cx.stroke();cx.restore();if(i&&perf>.55){const pA=a-.18;cx.globalAlpha=baseA*.32;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-Math.cos(pA)*W*.11,y-Math.sin(pA)*H*.16);cx.stroke();cx.globalAlpha=baseA;}}
  }else if(s.motif==='vortex'){
    for(let i=0;i<q+phase+1;i++){const p=((t*.10+i/(q+phase+1))%1),r=18+p*Math.min(W,H)*(.34+phase*.035);cx.globalAlpha=baseA*(1-p*.72);cx.beginPath();cx.ellipse(cx0,cy0,r,r*.38,0,0,TAU);cx.stroke();}cx.globalAlpha=baseA;
  }else if(s.motif==='razor'){
    const n=2+phase;for(let i=0;i<n;i++){const y=H*(.24+i/(n-1||1)*.52),wig=Math.sin(t*4+i)*8;cx.beginPath();cx.moveTo(W*.48,y);for(let x=W*.52;x<W*.94;x+=W*.055)cx.lineTo(x,y+Math.sin(x*.04+t*5+i)*10+wig);cx.stroke();}for(let i=0;i<q;i++){cx.globalAlpha=baseA*.45;cx.beginPath();cx.moveTo(W*(.55+i*.11),H*.18);cx.lineTo(W*(.68+i*.07),H*.82);cx.stroke();}cx.globalAlpha=baseA;
  }else if(s.motif==='hive'){
    const r=18+phase*3,rows=q+2,cols=4+phase;for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){const x=W*.48+xx*r*1.75+(yy%2?r*.88:0),y=H*.30+yy*r*1.52;cx.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*TAU/6,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;k?cx.lineTo(px,py):cx.moveTo(px,py);}cx.closePath();cx.stroke();}
  }
  // Pulso crítico de arena por debajo de 15%: solo feedback visual, nunca daño adicional.
  if(critical>0){cx.globalAlpha=.05+.05*critical;cx.strokeStyle=secCol;cx.lineWidth=2.5;cx.strokeRect(5,5,W-10,H-10);}
  cx.restore();cx.globalAlpha=1;
}

// v2.15.16 · BOSS DEATH & ARENA AFTERMATH PASS — Mundos 11–20
// Continúa la identidad de cada arena durante la muerte y los segundos de recolección.
// Es puramente audiovisual: no crea hitboxes, daño, enemigos, drops ni cambios de balance.
const CH2_BOSS_AFTERMATH={
  11:{id:'KHEPRI_DEORBIT',motif:'orbit',label:'DESACOPLE KHEPRI',after:'ÓRBITAS SILENCIADAS',secondary:'#ffe08a'},
  12:{id:'VESPERA_DISARM',motif:'lance',label:'DESARME VESPERA',after:'CORREDORES SIN CARGA',secondary:'#ffe477'},
  13:{id:'REGENT_RELEASE',motif:'clamp',label:'LIBERACIÓN REGENTE',after:'TENAZAS EN REPOSO',secondary:'#ffb071'},
  14:{id:'PYROLUX_BLACKOUT',motif:'lumen',label:'APAGÓN LÚMEN',after:'CONSTELACIÓN EXTINGUIDA',secondary:'#fff0a4'},
  15:{id:'CAUSTIC_NEUTRALIZE',motif:'acid',label:'NEUTRALIZACIÓN CÁUSTICA',after:'REACTOR INERTE',secondary:'#d5ff79'},
  16:{id:'ATLAS_DISSOLVE',motif:'veil',label:'DISOLUCIÓN DEL VELO',after:'SANTUARIO DESPEJADO',secondary:'#f2d8ff'},
  17:{id:'MIRAGE_SHATTER',motif:'mirror',label:'QUIEBRE MIMÉTICO',after:'NEXUS ESTABILIZADO',secondary:'#c5fff0'},
  18:{id:'PIT_SETTLE',motif:'vortex',label:'COLAPSO DE FOSA',after:'ARENA ASENTADA',secondary:'#ffd287'},
  19:{id:'RAZOR_GROUND',motif:'razor',label:'DESCARGA A TIERRA',after:'MALLA DESCONECTADA',secondary:'#ffb0bf'},
  20:{id:'HIVE_DORMANCY',motif:'hive',label:'SILENCIO IMPERIAL',after:'COLMENA EN REPOSO',secondary:'#fff1ae'}
};
function bossArenaAftermathSpec(sector=G?.sector||0){return CH2_BOSS_AFTERMATH[Math.round(sector)]||null;}
function startBossArenaAftermath(b){
  const s=b&&bossArenaAftermathSpec(bossEntitySector(b));if(!s||G?.mode==='training')return null;
  G.bossAftermath={world:bossEntitySector(b),id:s.id,label:s.label,after:s.after,motif:s.motif,secondary:s.secondary,x:b.x,y:b.y,t:0,max:BOSS_STANDARD.deathDuration+6.4,stage:0,finalized:false,pulses:0};
  return G.bossAftermath;
}
function bossAftermathPulse(a,stage){
  if(!a||!G?.particles)return;const sec=SECTORS[(a.world||1)-1],col=stage%2?a.secondary:(sec?.accent||'#fff'),perf=clamp(performanceAmbientFactor(),.20,1),n=Math.max(2,Math.round((3+stage*2)*perf));
  for(let i=0;i<n;i++){const ang=rnd(0,TAU),rad=rnd(18,80+stage*14),sp=rnd(22,90+stage*20);G.particles.push({kind:'spark',x:a.x+Math.cos(ang)*rad,y:a.y+Math.sin(ang)*rad,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,r:rnd(1.2,2.8),life:rnd(.25,.62),max:.62,col});}
  if(stage===3)G.particles.push({kind:'shock',x:a.x,y:a.y,r:22,vr:220,life:.56,max:.56,col});
  if(stage===4){G.particles.push({kind:'halo',x:a.x,y:a.y,r:26,vr:170,life:.78,max:.78,col:a.secondary});try{AudioX.tone(150+(a.world||11)*4,.16,.018,'sine',0,-48);}catch(_){}}
  a.pulses=(a.pulses||0)+1;
}
function updateBossArenaAftermath(dt){
  const a=G?.bossAftermath;if(!a)return;
  a.t=Math.min(a.max,(a.t||0)+Math.max(0,dt||0));
  const marks=[.62,1.42,2.42,BOSS_STANDARD.deathDuration+.18,BOSS_STANDARD.deathDuration+4.0];
  while(a.stage<marks.length&&a.t>=marks[a.stage]){a.stage++;bossAftermathPulse(a,a.stage);}
  if(a.finalized&&G?.postBossT>0){const pe=(G.postBossMax||0)-G.postBossT;if(pe>4&&(a.salvagePulseT??0)<=0){a.salvagePulseT=.72;const sec=SECTORS[(a.world||1)-1];G.particles.push({kind:'ring',x:G.player.x,y:G.player.y,r:G.player.r+12,vr:250,life:.40,max:.40,col:sec?.accent||'#fff09a'});}a.salvagePulseT=Math.max(0,(a.salvagePulseT||0)-dt);}
  if(a.t>=a.max&&(!G?.postBossT||G.postBossT<=0))G.bossAftermath=null;
}
function bossArenaAftermathStatus(){const a=G?.bossAftermath,s=a&&bossArenaAftermathSpec(a.world);return {enabled:!!s,active:!!a,world:a?.world||0,id:a?.id||null,label:a?.label||null,after:a?.after||null,motif:a?.motif||null,stage:a?.stage||0,time:+(a?.t||0).toFixed(2),finalized:!!a?.finalized,rewardField:!!(a?.finalized&&G?.postBossT>0),gameplayNeutral:true};}
function drawBossArenaAftermath(){
  const a=G?.bossAftermath,s=a&&bossArenaAftermathSpec(a.world);if(!s||G?.mode==='training')return;
  const sec=SECTORS[(a.world||1)-1],t=G?.elapsed||0,perf=clamp(performanceAmbientFactor(),.20,1),deathP=clamp((a.t||0)/BOSS_STANDARD.deathDuration,0,1),settle=clamp(((a.t||0)-BOSS_STANDARD.deathDuration)/Math.max(.1,a.max-BOSS_STANDARD.deathDuration),0,1),fade=clamp(1-settle*.82,.14,1),col=sec?.accent||'#fff',secCol=s.secondary||'#fff',x=a.x||W*.68,y=a.y||H*.5,q=perf<.45?2:perf<.72?3:5;
  cx.save();cx.globalCompositeOperation='screen';cx.lineCap='round';cx.lineJoin='round';cx.shadowColor=col;cx.shadowBlur=perf>.65?10:0;cx.strokeStyle=hexA(col,(.10+.18*deathP)*fade);cx.fillStyle=hexA(secCol,(.035+.07*deathP)*fade);cx.lineWidth=1.2+deathP*2.2;
  if(s.motif==='orbit'){
    for(let i=0;i<q;i++){const p=clamp(deathP-i*.08,0,1),rx=W*(.12+i*.035)*(1-p*.38),ry=H*(.14+i*.026)*(1-p*.24),arc=TAU*(.72-p*.36);cx.save();cx.translate(x,y);cx.rotate(t*(i%2?.07:-.055)+i*.55+p*1.2);cx.setLineDash([8+stageSafe(a),6+i*2]);cx.beginPath();cx.ellipse(0,0,rx,ry,0,-arc*.5,arc*.5);cx.stroke();cx.restore();}cx.setLineDash([]);
  }else if(s.motif==='lance'){
    for(let i=0;i<q+1;i++){const yy=H*(.18+(i+1)/(q+2)*.64),retract=deathP*W*(.22+i*.015);cx.beginPath();cx.moveTo(W*.96,yy+Math.sin(t*2+i)*5);cx.lineTo(Math.min(W*.94,W*.54+retract),yy);cx.stroke();}
  }else if(s.motif==='clamp'){
    const open=H*(.10+.30*deathP);for(const sy of [-1,1]){cx.beginPath();cx.moveTo(W*.44,y+sy*(H*.18+open));cx.quadraticCurveTo(W*.66,y+sy*(H*.13+open*.72),W*.91,y+sy*(H*.07+open*.45));cx.stroke();}
  }else if(s.motif==='lumen'){
    const n=5+q;for(let i=0;i<n;i++){const off=clamp((deathP*n-i)/2,0,1),ang=i*TAU/n+t*.08,r=W*(.10+.015*(i%2)),px=x+Math.cos(ang)*r,py=y+Math.sin(ang)*H*.16;cx.globalAlpha=fade*(1-off*.82);cx.beginPath();cx.arc(px,py,3+2*(1-off),0,TAU);cx.fill();if(i<n-1){cx.beginPath();cx.moveTo(px,py);const aa=(i+1)*TAU/n+t*.08;cx.lineTo(x+Math.cos(aa)*r,y+Math.sin(aa)*H*.16);cx.stroke();}}cx.globalAlpha=1;
  }else if(s.motif==='acid'){
    for(let i=0;i<q+2;i++){const p=clamp(deathP-i*.06,0,1),rr=(18+(i%3)*9)*(1-p*.74),px=W*(.50+i/(q+3)*.40),py=H*(.66+Math.sin(i+t*.7)*.04);cx.beginPath();cx.arc(px,py,Math.max(2,rr),0,TAU);cx.stroke();if(p>.55){cx.globalAlpha=.10*fade;cx.fillStyle=secCol;cx.fillRect(px-rr*.5,py-2,rr,4);cx.globalAlpha=1;}}
  }else if(s.motif==='veil'){
    for(let i=0;i<q+1;i++){const xx=W*(.48+i*.08),lift=deathP*H*.34;cx.globalAlpha=(.13+(.05*(i%2)))*fade*(1-deathP*.45);cx.beginPath();cx.moveTo(xx,-lift);cx.bezierCurveTo(xx+Math.sin(t*.8+i)*35,H*.22-lift,xx-24,H*.58-lift,xx+Math.cos(t+i)*18,H-lift);cx.stroke();}cx.globalAlpha=1;
  }else if(s.motif==='mirror'){
    const n=q+3;for(let i=0;i<n;i++){const ang=i*TAU/n+t*.05,rad=W*(.08+.024*(i%3)),fall=deathP*H*(.12+.04*(i%2)),px=x+Math.cos(ang)*rad,py=y+Math.sin(ang)*H*.17+fall,sz=9+4*(i%2);cx.save();cx.translate(px,py);cx.rotate(ang+deathP*(i%2?1.5:-1.2));cx.beginPath();cx.moveTo(0,-sz);cx.lineTo(sz*.48,0);cx.lineTo(0,sz);cx.lineTo(-sz*.48,0);cx.closePath();cx.stroke();cx.restore();}
  }else if(s.motif==='vortex'){
    for(let i=0;i<q+2;i++){const p=clamp(deathP-i*.055,0,1),rr=(30+i*34)*(1-p*.64);cx.globalAlpha=(.12+.04*i)*fade*(1-p*.35);cx.beginPath();cx.ellipse(x,y+H*.08,Math.max(8,rr),Math.max(3,rr*(.36-.18*p)),0,0,TAU);cx.stroke();}cx.globalAlpha=1;
  }else if(s.motif==='razor'){
    for(let i=0;i<q;i++){const yy=H*(.22+i/(q-1||1)*.50)+deathP*H*.22;cx.beginPath();cx.moveTo(W*.50,yy);for(let xx=W*.55;xx<W*.94;xx+=W*.06)cx.lineTo(xx,yy+Math.sin(xx*.035+t*4+i)*(9*(1-deathP*.65)));cx.stroke();}if(deathP>.55){cx.strokeStyle=hexA(secCol,.16*fade);cx.beginPath();cx.moveTo(W*.70,H*.74);cx.lineTo(W*.70,H*.96);cx.stroke();}
  }else if(s.motif==='hive'){
    const rr=17,rows=4,cols=6,threshold=deathP*(rows+cols+1);for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){const px=W*.50+xx*rr*1.75+(yy%2?rr*.88:0),py=H*.30+yy*rr*1.52,off=xx+yy;cx.globalAlpha=fade*clamp(1-(threshold-off)*.34,.05,1)*.30;cx.beginPath();for(let k=0;k<6;k++){const ang=Math.PI/6+k*TAU/6,ax=px+Math.cos(ang)*rr,ay=py+Math.sin(ang)*rr;k?cx.lineTo(ax,ay):cx.moveTo(ax,ay);}cx.closePath();cx.stroke();}cx.globalAlpha=1;
  }
  // Campo visual de recuperación: acompaña la recolección sin modificar el magnetismo real.
  if(a.finalized&&G?.postBossT>0){const pe=(G.postBossMax||0)-G.postBossT,salv=clamp((pe-.25)/2.6,0,1),mag=clamp((pe-4)/1.2,0,1);cx.globalCompositeOperation='source-over';cx.shadowBlur=0;cx.globalAlpha=(.12+.10*salv)*(1-settle*.55);cx.strokeStyle=secCol;cx.lineWidth=1.5;cx.beginPath();cx.arc(x,y,26+salv*58+Math.sin(t*2.4)*4,0,TAU);cx.stroke();if(mag>0&&G.player){cx.globalAlpha=.08+.10*mag;cx.setLineDash([6,8]);cx.beginPath();cx.moveTo(x,y);cx.quadraticCurveTo(W*.52,H*.30,G.player.x,G.player.y);cx.stroke();cx.setLineDash([]);}}
  cx.restore();cx.globalAlpha=1;
}
function stageSafe(a){return Math.max(0,Math.min(5,a?.stage||0));}

// ─────────────────────────────────────────────────────────────
// DRAW — fondos planetarios, barreras y arte insectoide procedural
// ─────────────────────────────────────────────────────────────
function rr(x,y,w,h,r=12){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):(cx.rect(x,y,w,h));}
function drawBackground(){
  const sec=SECTORS[(G?.sector||1)-1]||SECTORS[0],t=G?.elapsed||performance.now()/1000,bossArena=!!(G?.boss||G?.bossCheckpoint||(G?.bossPending&&!(G?.preBossT>0))),visualKey=bossArena&&sec.bossBg?sec.bossBg:(sec.worldBg||sec.bg);
  const img=IMG.bg[visualKey]||IMG.bg[sec.bg]||IMG.bg.rust;
  cx.fillStyle=sec.dark||'#050814';cx.fillRect(0,0,W,H);
  if(!imgReady(img)){const fg=cx.createRadialGradient(W*.58,H*.45,10,W*.5,H*.5,Math.max(W,H)*.75);fg.addColorStop(0,hexA(sec.base||sec.accent||'#27445c',.28));fg.addColorStop(.55,hexA(sec.dark||'#06101a',.88));fg.addColorStop(1,'#010307');cx.fillStyle=fg;cx.fillRect(0,0,W,H);}
  if(imgReady(img)){const scale=Math.max(W/img.naturalWidth,H/img.naturalHeight),iw=img.naturalWidth*scale,ih=img.naturalHeight*scale,par=sec.worldBg?4:8,dx=(W-iw)/2+Math.sin(t*.07+(G?.sector||1))*par,dy=(H-ih)/2+Math.cos(t*.05+(G?.sector||1))*par*.6;cx.drawImage(img,dx,dy,iw,ih);}
  const preEsc=activePreBossEscalation();if(preEsc&&G.preBossT>0&&sec.bossBg){const bossImg=IMG.bg[sec.bossBg],p=preBossProgress(),blend=clamp((p-(preEsc.blendFrom??.5))/Math.max(.1,1-(preEsc.blendFrom??.5)),0,1);if(imgReady(bossImg)&&blend>0){const scale=Math.max(W/bossImg.naturalWidth,H/bossImg.naturalHeight),iw=bossImg.naturalWidth*scale,ih=bossImg.naturalHeight*scale,dx=(W-iw)/2+Math.sin(t*.055+G.sector)*2,dy=(H-ih)/2;cx.save();cx.globalAlpha=blend*.92;cx.drawImage(bossImg,dx,dy,iw,ih);cx.restore();}}
  if(sec.worldBg&&performanceAmbientFactor()>.55)ambientWorldFx(sec,t);
  const vg=cx.createLinearGradient(0,0,0,H);vg.addColorStop(0,bossArena?'rgba(3,6,14,.12)':'rgba(3,6,14,.18)');vg.addColorStop(1,bossArena?'rgba(2,3,7,.34)':'rgba(2,3,7,.48)');cx.fillStyle=vg;cx.fillRect(0,0,W,H);
  const vignette=cx.createRadialGradient(W*.5,H*.5,Math.min(W,H)*.15,W*.5,H*.5,Math.max(W,H)*.7);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,bossArena?'rgba(0,0,0,.32)':'rgba(0,0,0,.42)');cx.fillStyle=vignette;cx.fillRect(0,0,W,H);
  if(!sec.worldBg){for(const st of stars){const drift=(sec.bg==='rift'?38:sec.bg==='toxic'?14:20)*st.z;let x=(st.x-t*drift)%(W+24);if(x<0)x+=W+24;cx.globalAlpha=sec.bg==='rift'?.10+.42*st.z:.04+.16*st.z;cx.fillStyle=sec.bg==='toxic'?hexA(sec.accent,.8):sec.bg==='rust'?'#ffd6a2':'#bde6ff';cx.beginPath();cx.arc(x,st.y,st.r*st.z,0,TAU);cx.fill();}}
  if(bossArena&&sec.worldBg){cx.globalAlpha=.10+.04*Math.sin(t*4);cx.strokeStyle=sec.accent;cx.lineWidth=2;cx.beginPath();cx.ellipse(W*.72,H*.5,W*.18,H*.30,0,0,TAU);cx.stroke();}
  cx.globalAlpha=1;
}

function drawShip(){
  const p=G.player,t=G.elapsed,a=axes();cx.save();cx.translate(p.x,p.y);
  const roll=clamp(a.x*.22,-.24,.24),pitch=clamp(a.y*.12,-.14,.14);cx.rotate(roll);
  if(p.inv>0&&Math.floor(p.inv*18)%2===0)cx.globalAlpha=.45;
  if(imgReady(IMG.ship)){
    const size=132;
    cx.drawImage(IMG.ship,-size/2,-size/2+pitch*40,size,size);
  }else{
    cx.fillStyle='#d8f8ff';cx.beginPath();cx.moveTo(0,-24);cx.lineTo(30,18);cx.lineTo(0,8);cx.lineTo(-30,18);cx.closePath();cx.fill();
  }
  cx.restore();
  if(p.shield>0||powerOn('shield')){cx.save();const hitBoost=(G.shieldHitT||0)>0?.28:0,pulse=.2+.1*Math.sin(t*6)+hitBoost,crit=p.shield/p.maxShield<.2,sv=powerOn('shield')?powerVisual('shield'):null;cx.globalAlpha=pulse+.08;cx.strokeStyle=crit?'#ff8fa3':(sv?.accent||'#78bfff');cx.lineWidth=sv?.ascended?2.8:2;if(sv?.branch==='A')cx.setLineDash([7,4]);if(sv?.branch==='B')cx.setLineDash([2,3]);cx.beginPath();cx.arc(p.x,p.y,p.r+21+(sv?.omega?4:0),0,TAU);cx.stroke();cx.setLineDash([]);cx.globalAlpha=.4;cx.strokeStyle=crit?'#ff627b':(sv?.accent||'#aee6ff');cx.lineWidth=3;for(let i=0;i<(sv?.omega?4:3);i++){cx.beginPath();cx.arc(p.x,p.y,p.r+26+i*4,t*1.4+i*.8,t*1.4+i*.8+Math.PI*.62);cx.stroke();}cx.restore();}
  if(powerOn('hemadrain')){cx.save();cx.globalAlpha=.18+.08*Math.sin(t*5);cx.fillStyle='#ff465f';cx.beginPath();cx.arc(p.x,p.y,p.r+18,0,TAU);cx.fill();cx.restore();}
  if(powerOn('resinwall')){cx.save();const rv=powerVisual('resinwall');cx.strokeStyle=rv.accent;cx.lineWidth=rv.ascended?3.6:3;const n=Math.max(1,G.resinCharges||1);for(let i=0;i<n;i++){const a=t*.9+i/n*TAU,x=p.x+Math.cos(a)*(p.r+31),y=p.y+Math.sin(a)*(p.r+31);cx.save();cx.translate(x,y);cx.rotate(a);cx.strokeRect(-5,-9,10,18);cx.restore();}cx.restore();}
  if(powerOn('resonance')){cx.save();const rv=powerVisual('resonance');cx.globalAlpha=.22;cx.strokeStyle=rv.accent;cx.lineWidth=rv.ascended?2.2:1;for(let i=0;i<(rv.omega?4:rv.ascended?3:2);i++){cx.beginPath();cx.arc(p.x,p.y,p.r+28+i*11+Math.sin(t*4+i)*4,0,TAU);cx.stroke();}cx.restore();}
  if(powerOn('nanites')){cx.save();const nv=powerVisual('nanites');cx.fillStyle=nv.accent;cx.globalAlpha=.55;const n=5+Math.min(4,powerRank('nanites'))+(nv.omega?2:nv.ascended?1:0);for(let i=0;i<n;i++){const a=t*2.8+i*TAU/n;cx.beginPath();cx.arc(p.x+Math.cos(a)*(p.r+25),p.y+Math.sin(a)*(p.r+18),1.8+(i%2),0,TAU);cx.fill();}cx.restore();}
  if(powerOn('echo')){cx.save();const ev=powerVisual('echo');cx.globalAlpha=.15;for(let i=1;i<=(ev.omega?4:ev.ascended?3:2);i++){cx.strokeStyle=ev.accent;cx.strokeRect(p.x-36-i*10,p.y-17-i*2,30,34+i*4);}cx.restore();}
  if(powerOn('phase')){cx.save();const fv=powerVisual('phase');cx.globalAlpha=.32+.12*Math.sin(t*9);cx.strokeStyle=fv.accent;cx.lineWidth=fv.omega?3.4:fv.ascended?2.7:2;cx.beginPath();cx.moveTo(p.x+18,p.y-8);cx.lineTo(p.x+46,p.y);cx.lineTo(p.x+18,p.y+8);cx.stroke();cx.restore();}
  if(powerOn('nova')){cx.save();const nv=powerVisual('nova');cx.globalAlpha=.16+.06*Math.sin(t*6);cx.strokeStyle=nv.accent;cx.lineWidth=nv.ascended?2.2:1;for(let i=0;i<(nv.omega?3:nv.ascended?2:1);i++){cx.beginPath();cx.arc(p.x,p.y,p.r+34+i*9+Math.sin(t*4+i)*5,0,TAU);cx.stroke();}cx.restore();}
  if(powerOn('ionweb')){cx.save();const iv=powerVisual('ionweb'),rrr=p.r+38+Math.sin(t*5)*4;cx.globalAlpha=.18;cx.strokeStyle=iv.accent;cx.lineWidth=iv.ascended?2.3:1.4;for(let i=0;i<2+(iv.omega?1:0);i++){cx.beginPath();cx.arc(p.x,p.y,rrr+i*9,t*(i%2?.7:-.55),t*(i%2?.7:-.55)+Math.PI*1.45);cx.stroke();}cx.restore();}
  if(powerOn('orbitblade')){cx.save();const ov=powerVisual('orbitblade'),n=Math.min(7,3+Math.ceil(powerRank('orbitblade')/2)+(branchIs('orbitblade','A')?1:0));cx.strokeStyle=ov.accent;cx.fillStyle=ov.accent;cx.globalAlpha=.68;for(let i=0;i<n;i++){const a=t*(branchIs('orbitblade','B')?3.0:2.35)+i*TAU/n,rad=p.r+35+(i%2)*5,x=p.x+Math.cos(a)*rad,y=p.y+Math.sin(a)*rad;cx.save();cx.translate(x,y);cx.rotate(a);cx.beginPath();cx.moveTo(-7,-2);cx.lineTo(10,0);cx.lineTo(-7,2);cx.closePath();cx.fill();cx.restore();}cx.restore();}
  const vmag=Math.hypot(p.vx,p.vy),speedFx=clamp(vmag/360,0,1),lv=G.level||1;if(speedFx>.12){cx.save();cx.strokeStyle=lv>=7?'rgba(170,246,255,.48)':'rgba(110,210,255,.38)';cx.lineWidth=1.2+speedFx;for(let i=0;i<4;i++){const yy=p.y-17+i*11,len=16+speedFx*28+Math.min(20,lv*1.4);cx.beginPath();cx.moveTo(p.x-28,yy);cx.lineTo(p.x-28-len,yy+rnd(-2,2));cx.stroke();}cx.restore();}
  const dc=supportCount();for(let i=0;i<dc;i++)drawDrone(p,i,dc,t);
}

function drawDrone(p,i,count,t){const orb=supportOrbit(i,count),a=orb.a,role=orb.role,img=IMG.support[role]||IMG.support.scout;cx.save();cx.translate(orb.x,orb.y);const aim=findTarget(),ang=aim?Math.atan2(aim.y-orb.y,aim.x-orb.x):a;cx.rotate(ang);cx.shadowColor=role==='lancer'?'#ffb06f':'#76efff';cx.shadowBlur=role==='orbiter'?16:10;const size=role==='orbiter'?27:role==='lancer'?35:31;if(imgReady(img))cx.drawImage(img,-size*.55,-size*.5,size*1.1,size);else{cx.fillStyle='#dfffff';cx.fillRect(-8,-4,16,8);}if(powerOn('drone')||powerOn('overdrive')){cx.globalAlpha=.55+.25*Math.sin(t*8+i);cx.strokeStyle=role==='lancer'?'#ffb06f':'#9af4ff';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,size*.62,0,TAU);cx.stroke();}cx.restore();
  cx.save();cx.strokeStyle=role==='orbiter'?'rgba(140,230,255,.26)':'rgba(135,232,255,.12)';cx.lineWidth=1;cx.beginPath();cx.arc(p.x,p.y,Math.hypot(orb.x-p.x,orb.y-p.y),a-.17,a+.17);cx.stroke();cx.restore();}

function enemySpriteCell(e,isBoss=false){
  const sec=SECTORS[Math.max(0,(G?.sector||1)-1)]||SECTORS[0];
  const col=FAMILY_COL[e.family||sec.family]??0;
  let row=0;
  if(isBoss) row=2;
  else if(sec.forms[1]===e.form || sec.forms[2]===e.form) row=1;
  return {col,row};
}
function drawBossAnatomy(e,sec){
  const r=e.r,t=G.elapsed,flap=Math.sin(t*(5+e.phase*.9)),col=BOSS_SKILLS[e.pattern]?.color||sec.accent;cx.save();cx.globalAlpha=.52;cx.strokeStyle=col;cx.fillStyle=hexA(col,.16);cx.lineWidth=2.5;
  if(e.pattern==='storm'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.16);cx.beginPath();cx.moveTo(8,-10);cx.lineTo(r*1.25,-r*.72);cx.lineTo(r*.62,2);cx.closePath();cx.fill();cx.stroke();cx.restore();}cx.beginPath();cx.moveTo(-r*.1,r*.48);cx.lineTo(0,r*1.28+flap*8);cx.lineTo(r*.1,r*.48);cx.stroke();}
  else if(e.pattern==='titan'){for(let i=0;i<4;i++){const a=t*.45+i*TAU/4;cx.beginPath();cx.arc(Math.cos(a)*r*.48,Math.sin(a)*r*.34,r*.34,0,TAU);cx.fill();cx.stroke();}if(e.guardT>0){cx.globalAlpha=.6+.2*Math.sin(t*12);cx.beginPath();cx.arc(0,0,r*1.35,0,TAU);cx.stroke();}}
  else if(e.pattern==='blade'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(-.35+flap*.18);cx.beginPath();cx.moveTo(r*.2,-r*.1);cx.lineTo(r*1.45,-r*.78);cx.lineTo(r*.72,r*.05);cx.closePath();cx.fill();cx.stroke();cx.restore();}}
  else if(e.pattern==='moth'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.12);cx.beginPath();cx.ellipse(r*.62,-r*.1,r*.72,r*.48,-.35,0,TAU);cx.fill();cx.stroke();cx.beginPath();cx.arc(r*.78,-r*.12,r*.11,0,TAU);cx.stroke();cx.restore();}}
  else if(e.pattern==='queen'){for(let i=0;i<3;i++){const a=-.55+i*.55+flap*.05;cx.beginPath();cx.moveTo(-r*.1,r*.15);cx.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r*1.0);cx.stroke();cx.beginPath();cx.moveTo(r*.1,r*.15);cx.lineTo(-Math.cos(a)*r*1.25,Math.sin(a)*r*1.0);cx.stroke();}cx.beginPath();cx.ellipse(0,r*.62,r*.52,r*.72,0,0,TAU);cx.fill();cx.stroke();}
  else if(e.pattern==='leap'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.beginPath();cx.moveTo(r*.15,r*.25);cx.lineTo(r*.95,r*.72+flap*9);cx.lineTo(r*1.28,r*.35);cx.stroke();cx.restore();}}
  else if(e.pattern==='blood'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.18);cx.beginPath();cx.moveTo(r*.15,-r*.1);cx.lineTo(r*1.28,-r*.78);cx.lineTo(r*.86,r*.08);cx.closePath();cx.fill();cx.stroke();cx.restore();}cx.beginPath();cx.ellipse(0,r*.58,r*.34,r*.72,0,0,TAU);cx.stroke();cx.globalAlpha=.7+.25*Math.sin(t*8);cx.beginPath();cx.moveTo(0,-r*.2);cx.lineTo(-r*.95,r*.98);cx.stroke();}
  else if(e.pattern==='architect'){for(let i=0;i<4;i++){const a=t*.52+i*TAU/4,rr=r*(.62+(i%2)*.2);cx.beginPath();cx.arc(Math.cos(a)*rr,Math.sin(a)*r*.56,r*.16,0,TAU);cx.stroke();cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(a)*rr,Math.sin(a)*r*.56);cx.stroke();}if(e.guardT>0){cx.globalAlpha=.7+.2*Math.sin(t*10);cx.beginPath();cx.arc(0,0,r*1.46,0,TAU);cx.stroke();}}
  else if(e.pattern==='odonata'){for(const side of [-1,1]){cx.save();cx.scale(side,1);cx.rotate(flap*.24);cx.beginPath();cx.ellipse(r*.64,-r*.2,r*.96,r*.18,-.18,0,TAU);cx.fill();cx.stroke();cx.beginPath();cx.ellipse(r*.52,r*.18,r*.78,r*.14,.18,0,TAU);cx.stroke();cx.restore();}cx.globalAlpha=.45;for(let i=1;i<=3;i++){cx.beginPath();cx.moveTo(-r*(.5+i*.28),-r*.12);cx.lineTo(-r*(.1+i*.18),-r*.12);cx.stroke();}}
  else if(e.pattern==='resonance'){for(let i=0;i<4;i++){cx.globalAlpha=.35+i*.12;cx.beginPath();cx.arc(0,0,r*(.66+i*.20)+Math.sin(t*(2.6+i*.25)+i)*5,t*.45+i,t*.45+i+Math.PI*1.45);cx.stroke();}cx.globalAlpha=.7+.25*Math.sin(t*6);cx.beginPath();cx.arc(0,0,r*.34,0,TAU);cx.stroke();}
  cx.restore();
}
function drawContainedSprite(img,maxW,maxH){
  if(!imgReady(img))return false;const ar=img.naturalWidth/img.naturalHeight;let dw=maxW,dh=dw/ar;if(dh>maxH){dh=maxH;dw=dh*ar;}cx.drawImage(img,-dw/2,-dh/2,dw,dh);return true;
}
function drawBossDamageState(e,sec){
  const stage=e.damageStage||0;if(stage<=0&&!e.dying)return;const r=e.r,t=G.elapsed,col=BOSS_SKILLS[e.pattern]?.color||sec.accent;cx.save();
  const cracks=stage*3+(e.dying?7:0);cx.strokeStyle=stage>=3?'#ff5d72':'rgba(255,225,185,.78)';cx.lineWidth=1.4+stage*.45;for(let i=0;i<cracks;i++){const a=(i/cracks)*TAU+t*.04,rr=r*(.22+(i%3)*.15);cx.beginPath();cx.moveTo(Math.cos(a)*rr*.35,Math.sin(a)*rr*.35);cx.lineTo(Math.cos(a+.18)*rr,Math.sin(a+.18)*rr);cx.lineTo(Math.cos(a+.28)*rr*1.25,Math.sin(a+.28)*rr*1.25);cx.stroke();}
  if(stage>=2){cx.globalAlpha=.22+.12*Math.sin(t*8);cx.fillStyle='#ff6a63';cx.beginPath();cx.arc(0,0,r*(.24+stage*.035),0,TAU);cx.fill();}
  if((e.coreOpenT||0)>0&&!e.dying){cx.globalAlpha=.55+.35*Math.sin(t*14);cx.strokeStyle='#fff09a';cx.lineWidth=4;cx.beginPath();cx.arc(0,0,r*.42,0,TAU);cx.stroke();}
  if(e.dying){const q=1-(e.deathT||0)/BOSS_STANDARD.deathDuration;cx.globalAlpha=.22+.45*q;cx.strokeStyle='#fff';cx.lineWidth=2+q*5;cx.beginPath();cx.arc(0,0,r*(.5+q*.9),0,TAU);cx.stroke();}
  cx.restore();
}

function drawBossWeaponTelegraph(e,sec){
  const d=COMMANDER_PROJECTILES[e.pattern]||{style:'commander',col:sec.accent},col=d.col||sec.accent,r=e.r,alpha=.34+.28*Math.sin(G.elapsed*20),p=G.player||{x:e.x-r*3,y:e.y},dx=p.x-e.x,dy=p.y-e.y,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,tx=ux*Math.min(len,W*.58),ty=uy*Math.min(len,W*.58);
  cx.save();cx.globalAlpha=alpha;cx.strokeStyle=col;cx.fillStyle=col;cx.lineWidth=2.4;cx.setLineDash([8,7]);
  if(['stinger','razor','blood','prism'].includes(d.style)){const width=d.style==='prism'?r*.34:d.style==='razor'?r*.52:r*.24;cx.beginPath();cx.moveTo(ux*r*1.15,uy*r*1.15);cx.lineTo(tx,ty);cx.stroke();cx.setLineDash([]);cx.globalAlpha=alpha*.65;cx.beginPath();cx.moveTo(tx,ty);cx.lineTo(tx-ux*18-uy*width,ty-uy*18+ux*width);cx.lineTo(tx-ux*18+uy*width,ty-uy*18-ux*width);cx.closePath();cx.fill();if(d.style==='razor'){cx.beginPath();cx.moveTo(tx-uy*r*.7,ty+ux*r*.7);cx.lineTo(tx+uy*r*.7,ty-ux*r*.7);cx.stroke();}}
  else if(['shell','kinetic','spore','sonic'].includes(d.style)){cx.setLineDash([]);const n=d.style==='sonic'?3:2;for(let i=0;i<n;i++){cx.globalAlpha=alpha*(1-i*.16);cx.beginPath();cx.arc(0,0,r*(1.38+i*.46)+Math.sin(G.elapsed*8+i)*4,0,TAU);cx.stroke();}if(d.style==='kinetic'){for(let i=0;i<4;i++){const a=i*TAU/4+G.elapsed*.8;cx.beginPath();cx.moveTo(Math.cos(a)*r*1.25,Math.sin(a)*r*1.25);cx.lineTo(Math.cos(a)*r*2.05,Math.sin(a)*r*2.05);cx.stroke();}}}
  else{cx.setLineDash([]);for(let i=-1;i<=1;i++){const a=Math.atan2(dy,dx)+i*.28;cx.beginPath();cx.moveTo(Math.cos(a)*r*1.1,Math.sin(a)*r*1.1);cx.lineTo(Math.cos(a)*r*2.5,Math.sin(a)*r*2.5);cx.stroke();}}
  cx.setLineDash([]);cx.restore();
}

function drawCH2EnemyAnimated(e,box){const pack=IMG.ch2EnemyAnim?.[e.family];if(!pack)return false;const tier=e.microSwarm?'mini':['minor','medium','major'][clamp(enemyTier(e.form),0,2)],state=((e.fireCd||999)<.20||(e.surgeT||0)>0)?'attack':'idle',img=pack[tier]?.[state]||pack[tier]?.idle;if(!imgReady(img))return false;const spec=tier==='mini'?{fw:128,fh:128,frames:4,cols:4,fps:10}:tier==='minor'?{fw:192,fh:192,frames:6,cols:3,fps:9}:tier==='medium'?{fw:256,fh:256,frames:6,cols:3,fps:8}: {fw:320,fh:320,frames:6,cols:3,fps:7};const frame=Math.floor((e.t||G.elapsed)*spec.fps)%spec.frames,col=frame%spec.cols,row=Math.floor(frame/spec.cols),sc=Math.min(box/spec.fw,box/spec.fh);cx.drawImage(img,col*spec.fw,row*spec.fh,spec.fw,spec.fh,-spec.fw*sc/2,-spec.fh*sc/2,spec.fw*sc,spec.fh*sc);return true;}
function drawInsect(e,isBoss=false,preview=false,scaleMul=1){
  const sec=SECTORS[G.sector-1],r=e.r,animBoss=isBoss&&bossAnimated(e);
  const bob=Math.sin((e.t||0)*(isBoss?3.4:6) + e.x*.01)*(isBoss?8:3);
  cx.save();cx.translate(e.x,e.y+bob);if(!isBoss&&(e.cloakT||0)>0)cx.globalAlpha=.58+.14*Math.sin((e.t||0)*9);if(isBoss&&e.dying&&!animBoss){const q=1-(e.deathT||0)/BOSS_STANDARD.deathDuration;cx.rotate(q*.58);cx.scale(1-q*.14,1-q*.14);}if(isBoss){if(animBoss){const ac=bossAnimConfig(e),motion=ac?.motion||'',kinetic=motion==='kinetic-compression',vascular=motion==='vascular-organic',modular=motion==='modular-siege',prismatic=motion==='prismatic-interceptor',sonic=motion==='cathedral-resonance',heavy=motion==='heavy'||motion==='fortress-articulated'||modular,blade=motion==='blade-articulated',flutter=motion==='flutter-organic';const baseFreq=prismatic?2.65:sonic?1.05:vascular?1.9:kinetic?1.18:flutter?2.15:blade?1.75:heavy?.82:1.35,baseTilt=prismatic?.035:sonic?.010:vascular?.014:kinetic?.020:flutter?.026:blade?.022:heavy?.008:.018,chargeTilt=prismatic?.075:sonic?.028:kinetic?.055:blade?.065:heavy?.022:.045;const recoil=e.chargeT>0?Math.atan2(e.chargeVY,e.chargeVX)*chargeTilt:Math.sin(G.elapsed*baseFreq)*baseTilt;cx.rotate(recoil);const pulse=1+(e.animPulse||0)*(prismatic?.055:sonic?.052:vascular?.050:kinetic?.045:blade?.042:flutter?.038:heavy?.02:.035),bio=vascular?Math.sin(G.elapsed*5.1)*.018:0,compress=kinetic?Math.max(0,Math.sin(G.elapsed*2.4))*.015:0,sonicPulse=sonic?Math.sin(G.elapsed*3.1)*.014:0,prismBank=prismatic?Math.sin(G.elapsed*5.4)*.012:0;cx.scale(pulse*(flutter?1+Math.sin(G.elapsed*4.4)*.009:1)+bio-compress+prismBank+sonicPulse,pulse*(blade?1-Math.sin(G.elapsed*3.2)*.006:1)-bio+compress-prismBank+sonicPulse);}else{const flap=Math.sin(G.elapsed*(5.5+e.phase*.8)),pulse=1+(e.animPulse||0)*.12+(e.telegraphT>0?Math.sin(G.elapsed*22)*.065:0);cx.scale(pulse*(1+flap*.035*e.phase),pulse*(1-flap*.018));cx.rotate(e.chargeT>0?Math.atan2(e.chargeVY,e.chargeVX)*.12:Math.sin(G.elapsed*(1.5+e.phase*.12))*(.035+e.phase*.008));}if(e.guardT>0){cx.shadowColor=sec.accent;cx.shadowBlur=28;}}
  if(e.flash>0){cx.shadowColor='#fff';cx.shadowBlur=18;}
  cx.fillStyle='rgba(0,0,0,.24)';cx.beginPath();cx.ellipse(0,r*.7,r*.9,r*.26,0,0,TAU);cx.fill();
  if(e.kind==='ship'){
    const img=IMG.generatedShips[e.shipVariant]||IMG.enemyShips.scout,dw=r*3.15*scaleMul,dh=r*2.4*scaleMul;
    if(imgReady(img)) cx.drawImage(img,-dw/2,-dh/2,dw,dh);
    else {cx.fillStyle='#8fd9ff';cx.fillRect(-r,-r*.4,r*2,r*.8);}
  }else if(isBoss){
    const familyPack=IMG.worldEnemies[e.family],img=familyPack?.[3],col=FAMILY_COL[e.family]??0,fallback=IMG.enemyCells[2]?.[col],box=r*3.2*scaleMul;
    const animPreview=preview&&e.kind!=='lieutenant';if(!(animBoss&&drawBossAnimated(e,box,box,animPreview))&&!drawContainedSprite(img,box,box)&&!drawContainedSprite(fallback,box,box))drawContainedSprite(IMG.atlas,box,box);
  }else{
    const row=clamp(enemyTier(e.form),0,2),tier=row,familyPack=IMG.worldEnemies[e.family],col=FAMILY_COL[e.family]??0,img=familyPack?.[row]||IMG.enemyCells[row]?.[col],box=r*[2.55,2.78,3.0][tier]*scaleMul;
    if(!drawCH2EnemyAnimated(e,e.microSwarm?r*3.0:box)&&!drawContainedSprite(img,box,box)){cx.fillStyle=sec.base;cx.beginPath();cx.arc(0,0,r,0,TAU);cx.fill();}
  }/* isolated silhouettes prevent atlas-cell clipping */
  if(isBoss){if(!animBoss)drawBossAnatomy(e,sec);drawBossDamageState(e,sec);}
  if(isBoss&&e.phaseFlash>0){cx.globalAlpha=e.phaseFlash*.45;cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,r*1.1,0,TAU);cx.fill();cx.globalAlpha=1;}
  if(isBoss&&e.telegraphT>0)drawBossWeaponTelegraph(e,sec);cx.restore();
  if(!isBoss&&(e.familyPulseT||0)>0){cx.save();cx.globalAlpha=clamp((e.familyPulseT||0)/.75,0,.8);cx.strokeStyle=sec.accent;cx.lineWidth=2;cx.beginPath();cx.arc(e.x,e.y,e.r*(1.25+(1-(e.familyPulseT||0)/.75)*.7),0,TAU);cx.stroke();cx.restore();}
  if(!isBoss&&(e.familyGuardT||0)>0){cx.save();cx.globalAlpha=.35+.15*Math.sin((e.t||0)*10);cx.strokeStyle='#fff09a';cx.lineWidth=1.5;cx.beginPath();cx.arc(e.x,e.y,e.r*1.18,0,TAU);cx.stroke();cx.restore();}
  if(!isBoss&&e.kind!=='ship'&&enemyTier(e.form)===2){const w=r*2.0;cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(e.x-w/2,e.y+r*1.45,w,4);cx.fillStyle=sec.accent;cx.fillRect(e.x-w/2,e.y+r*1.45,w*clamp(e.hp/e.maxHp,0,1),4);}
  if(isBoss&&!preview&&e.kind!=='riftAlly'){const compact=compactUI(),focus=hudFocusMode(),w=Math.min(compact?W*.58:W*.46,compact?430:500),hit=G.bossHitT||0,jx=Math.sin(G.elapsed*95)*8*hit,x=W/2-w/2+jx,y=compact?((G.bossArrivalBanner?.t||0)>0?132:(focus==='BOSS_ALERT'?92:74)):112,bh=compact?10:14;cx.fillStyle='rgba(0,0,0,.64)';rr(x,y,w,bh,7);cx.fill();cx.fillStyle=hit>0?`rgba(255,88,104,${.55+hit*.8})`:(e.guardT>0?'#aaff72':sec.accent);rr(x+2,y+2,(w-4)*clamp(e.hp/e.maxHp,0,1),Math.max(4,bh-4),5);cx.fill();cx.textAlign='center';cx.font=`700 ${compact?9:12}px system-ui`;cx.fillStyle=hit>0?'#ffb5bf':'#fff';const phaseMin=bossPhaseMinDuration(G.sector,e.phase),phaseFloor=bossPhaseFloorRatio(e.phase),atGate=(e.phaseElapsed||0)<phaseMin&&(e.hp/e.maxHp)<=phaseFloor+.012;const bossState=e.dying?'COLAPSO':(e.phaseTransitionT>0?'MUTACIÓN':(e.coreOpenT>0?'NÚCLEO ABIERTO':(atGate?`F${e.phase} · ${Math.ceil(phaseMin-(e.phaseElapsed||0))}s`:`F${e.phase}`)));const label=compact?`${e.name} · ${bossState} · ${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%`:`${sec.family} // ${e.name} // ${bossState} // ${Math.max(0,e.hp/e.maxHp*100).toFixed(1)}%`;cx.fillText(label,W/2+jx,y-(compact?6:7));cx.textAlign='left';}
}

function drawObstacle(o){const sec=SECTORS[G.sector-1];cx.save();cx.translate(o.x,o.y);cx.rotate(o.rot);const themed=worldObstacleAsset(sec,o.type),pack=IMG.generatedObstacles[sec.bg]||IMG.generatedObstacles.rift,img=themed||pack[o.assetIndex??0]||IMG.obstacles[obstacleSpriteKey(o.type)];
  cx.globalAlpha=.97;cx.fillStyle='rgba(0,0,0,.26)';cx.beginPath();cx.ellipse(0,o.r*.68,o.r*.95,o.r*.26,0,0,TAU);cx.fill();
  if(imgReady(img)){const scaleMul=(o.type==='gate'||o.type==='bulwark')?2.85:(o.type==='mine'||o.type==='spike'||o.type==='seed')?2.05:2.45;const d=o.r*scaleMul;cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle=hexA(sec.base,.7);cx.beginPath();cx.arc(0,0,o.r,0,TAU);cx.fill();}
  if(o.type==='mine'){cx.globalAlpha=.35+.28*Math.sin(o.t*8);cx.strokeStyle='#ffe177';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,o.r*1.1,0,TAU);cx.stroke();cx.globalAlpha=1;}
  const hp=clamp(o.hp/o.maxHp,0,1);if(hp<.98){cx.fillStyle='rgba(0,0,0,.5)';cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5,4);cx.fillStyle=sec.accent;cx.fillRect(-o.r*.75,o.r*1.08,o.r*1.5*hp,4);}cx.restore();
}
function drawPowerAura(key,col,t,r){cx.save();const v=powerVisual(key,Math.max(1,G?.powerRanks?.[key]||1));col=v.accent;cx.strokeStyle=col;cx.fillStyle=col;cx.globalAlpha=.32+.18*Math.sin(t*7);cx.lineWidth=v.ascended?2.6:2;if(v.branch==='A')cx.setLineDash([5,3]);if(v.branch==='B')cx.setLineDash([2,4]);
  if(key==='twin'||key==='burst'){const n=key==='burst'?5:3;for(let i=0;i<n;i++){const a=-.55+i*(1.1/(n-1||1));cx.save();cx.rotate(a);cx.beginPath();cx.moveTo(r*.7,0);cx.lineTo(r*1.35,0);cx.stroke();cx.restore();}}
  else if(key==='tesla'){for(let i=0;i<3;i++){const a=t*2+i*TAU/3;cx.beginPath();cx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);cx.lineTo(Math.cos(a+.35)*r*1.3,Math.sin(a+.35)*r*1.3);cx.stroke();}}
  else if(key==='rail'){cx.lineWidth=3;cx.beginPath();cx.moveTo(-r*1.3,0);cx.lineTo(r*1.3,0);cx.stroke();}
  else if(key==='cryo'){for(let i=0;i<6;i++){const a=i*TAU/6;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(a)*r*1.2,Math.sin(a)*r*1.2);cx.stroke();}}
  else if(key==='gravity'){for(let i=0;i<3;i++){cx.beginPath();cx.arc(0,0,r*(.8+i*.18),t*.7+i,t*.7+i+Math.PI*.9);cx.stroke();}}
  else if(key==='bomb'){for(let i=0;i<8;i++){const a=i*TAU/8;cx.beginPath();cx.moveTo(Math.cos(a)*r*.8,Math.sin(a)*r*.8);cx.lineTo(Math.cos(a)*r*1.45,Math.sin(a)*r*1.45);cx.stroke();}}
  else if(key==='hemadrain'){cx.beginPath();cx.moveTo(0,-r*1.25);cx.bezierCurveTo(r*.9,-r*.2,r*.65,r*.8,0,r*1.1);cx.bezierCurveTo(-r*.65,r*.8,-r*.9,-r*.2,0,-r*1.25);cx.stroke();}
  else if(key==='resinwall'){for(let i=0;i<4;i++){const a=t+i*TAU/4;cx.strokeRect(Math.cos(a)*r*.95-4,Math.sin(a)*r*.95-7,8,14);}}
  else if(key==='prismburst'){for(let i=-2;i<=2;i++){cx.beginPath();cx.moveTo(-r*.8,i*3);cx.lineTo(r*1.35,i*7);cx.stroke();}}
  else if(key==='resonance'){for(let i=0;i<3;i++){cx.beginPath();cx.arc(0,0,r*(.7+i*.25),t*.4+i,t*.4+i+Math.PI*1.5);cx.stroke();}}
  else if(key==='sparklaser'){for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(-r*1.15,i*4+Math.sin(t*9+i)*3);cx.lineTo(0,i*2);cx.lineTo(r*1.25,i*5+Math.cos(t*8+i)*4);cx.stroke();}}
  else if(key==='bio'){for(let i=0;i<5;i++){const a=t*.7+i*TAU/5;cx.beginPath();cx.arc(Math.cos(a)*r*.75,Math.sin(a)*r*.75,r*.22,0,TAU);cx.stroke();}}
  else if(key==='phase'){for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(-r*.95,i*4);cx.lineTo(r*1.4,i*2);cx.stroke();}}
  else if(key==='nanites'){for(let i=0;i<7;i++){const a=t*2+i*TAU/7;cx.beginPath();cx.arc(Math.cos(a)*r*.9,Math.sin(a)*r*.72,1.5+i%2,0,TAU);cx.fill();}}
  else if(key==='riftmine'){for(let i=0;i<6;i++){const a=i*TAU/6;cx.beginPath();cx.moveTo(Math.cos(a)*r*.65,Math.sin(a)*r*.65);cx.lineTo(Math.cos(a)*r*1.25,Math.sin(a)*r*1.25);cx.stroke();}}
  else if(key==='echo'){for(let i=0;i<3;i++){cx.globalAlpha=.18+i*.10;cx.strokeRect(-r*.8-i*4,-r*.45-i*3,r*1.6,r*.9);}}
  else if(key==='nova'){for(let i=0;i<10;i++){const a=t*.4+i*TAU/10;cx.beginPath();cx.moveTo(Math.cos(a)*r*.45,Math.sin(a)*r*.45);cx.lineTo(Math.cos(a)*r*1.35,Math.sin(a)*r*1.35);cx.stroke();}}
  else if(key==='ionweb'){for(let q=0;q<2;q++){cx.beginPath();cx.arc(0,0,r*(.82+q*.34),t*(q?-.6:.8),t*(q?-.6:.8)+Math.PI*1.55);cx.stroke();}for(let i=0;i<6;i++){const a=i*TAU/6+t*.5;cx.beginPath();cx.moveTo(Math.cos(a)*r*.55,Math.sin(a)*r*.55);cx.lineTo(Math.cos(a)*r*1.22,Math.sin(a)*r*1.22);cx.stroke();}}
  else if(key==='orbitblade'){const n=3+Math.min(3,powerRank('orbitblade'));for(let i=0;i<n;i++){const a=t*1.7+i*TAU/n;cx.save();cx.rotate(a);cx.beginPath();cx.moveTo(r*.72,-3);cx.lineTo(r*1.34,0);cx.lineTo(r*.72,3);cx.stroke();cx.restore();}}
  else {cx.beginPath();cx.arc(0,0,r*1.18,0,TAU);cx.stroke();}
  cx.setLineDash([]);if(v.ascended){cx.globalAlpha=.22+.12*Math.sin(t*5);cx.lineWidth=v.omega?3:2;cx.strokeStyle=v.omega?'#fff09a':v.accent;cx.beginPath();cx.arc(0,0,r*(v.omega?1.48:1.34),0,TAU);cx.stroke();}cx.restore();}
function powerActivationVfx(key){const pd=POWERS[key];if(!pd||!G)return;const p=G.player,rank=powerRank(key),v=powerVisual(key,rank);G.particles.push({kind:key==='gravity'?'shock':'halo',x:p.x,y:p.y,r:12,vr:key==='gravity'?520:330,life:.55,max:.55,col:v.accent});if(v.ascended)G.particles.push({kind:'ring',x:p.x,y:p.y,r:18,vr:v.omega?620:470,life:v.omega?.68:.54,max:v.omega?.68:.54,col:v.omega?'#fff09a':v.accent});if(v.omega)G.particles.push({kind:'shock',x:p.x,y:p.y,r:9,vr:760,life:.42,max:.42,col:'#ffffff'});if(['tesla','rail','burst','twin','bomb','hemadrain','resinwall','prismburst','resonance','sparklaser','bio','phase','nanites','riftmine','echo','nova','missile','ionweb','orbitblade'].includes(key))for(let i=0;i<(v.omega?18:v.ascended?14:10);i++){const a=i/(v.omega?18:v.ascended?14:10)*TAU;G.particles.push({kind:'spark',x:p.x,y:p.y,vx:Math.cos(a)*rnd(70,v.omega?250:190),vy:Math.sin(a)*rnd(70,v.omega?250:190),r:rnd(1.2,v.omega?3.6:2.8),life:rnd(.18,.45),max:.45,col:i%3===0&&v.omega?'#ffffff':v.accent});}}
function drawPickup(q){cx.save();cx.translate(q.x,q.y);const compact=compactUI(),pulse=1+Math.sin(q.t*8)*(compact?.08:.14);cx.scale(pulse,pulse);if(q.type==='objectiveCore'){const sec=SECTORS[G.sector-1],img=IMG.objectives.core,d=compact?34:44;cx.shadowColor='#fff09a';cx.shadowBlur=18;if(imgReady(img)){const sc=Math.min(d/img.naturalWidth,d/img.naturalHeight);cx.drawImage(img,-img.naturalWidth*sc/2,-img.naturalHeight*sc/2,img.naturalWidth*sc,img.naturalHeight*sc);}else{cx.fillStyle=sec.accent;cx.beginPath();cx.arc(0,0,compact?13:16,0,TAU);cx.fill();}cx.restore();cx.textAlign='left';cx.textBaseline='alphabetic';return;}let key=q.type;if(q.type==='power'||q.type==='heritageToken')key=q.key;if(q.type==='fragment'||q.type==='weaponBoost')key='power';if(q.type==='bossXp'||q.type==='bossCredit')key='power';const img=powerAsset(key);
  if(imgReady(img)){const d=(q.type==='power'||q.type==='heritageToken')?(compact?38:48):q.type==='fragment'?(compact?30:38):(compact?28:40);cx.drawImage(img,-d/2,-d/2,d,d);}else{cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,q.r,0,TAU);cx.fill();}
  let col='#ffd76a',icon='¤';if(q.type==='heal'){col='#ff6d89';icon='✚';}if(q.type==='shield'){col='#78bfff';icon='⬡';}if(q.type==='weaponBoost'){col='#ffcf73';icon='⚡';}if(q.type==='fragment'){col='#d6f6ff';icon='✦';}if(q.type==='bossXp'){col='#a6ff5f';icon='XP';}if(q.type==='bossCredit'){col='#ffd76a';icon='¤';}if(q.type==='heritageToken'){const pd=POWERS[q.key];col=pd?.color||'#ffd76a';icon=pd?.icon||'✦';drawPowerAura(q.key,col,q.t,compact?q.r*.85:q.r);}if(q.type==='power'){const pd=POWERS[q.key];col=pd?.color||'#fff';icon=pd?.icon||'✦';drawPowerAura(q.key,col,q.t,compact?q.r*.75:q.r);}
  if(!compact||q.type==='power'||q.type==='fragment'||q.type==='weaponBoost'){cx.strokeStyle=col;cx.globalAlpha=.26+.15*Math.sin(q.t*7);cx.lineWidth=compact?1.3:2;cx.beginPath();cx.arc(0,0,q.r+(compact?5:8),0,TAU);cx.stroke();cx.globalAlpha=1;}
  if((q.type==='credit'||q.type==='bossCredit')&&(q.value||1)>1){cx.fillStyle='#fff3a5';cx.font='900 8px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(`×${q.value}`,0,compact?13:17);}
  if(q.type==='bossXp'){cx.fillStyle='#caff9d';cx.font=`900 ${compact?7:9}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(`XP`,0,-2);cx.font=`800 ${compact?6:7}px system-ui`;cx.fillText(`+${q.value||0}`,0,compact?7:9);}if(q.type==='heritageToken'){const pd=POWERS[q.key];cx.fillStyle=pd?.color||'#ffd76a';cx.font=`900 ${compact?9:11}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(pd?.icon||'✦',0,0);}if(q.type==='fragment'){cx.fillStyle='#d6f6ff';cx.font=`900 ${compact?9:11}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText('✦',0,0);}if(q.type==='weaponBoost'){cx.fillStyle='#ffcf73';cx.font=`950 ${compact?10:13}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText('⚡',0,0);}if(q.type==='power'){const current=G.powerRanks?.[q.key]||0,next=INSTANT_POWERS.has(q.key)?Math.max(1,current):Math.min(powerRankCap(),current?current+1:1);cx.fillStyle=col;cx.font=`900 ${compact?9:11}px system-ui`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(icon,0,-3);cx.font=`900 ${compact?6:7}px system-ui`;cx.fillStyle='#fff';cx.fillText(rankRoman(next),0,compact?6:8);}cx.restore();cx.textAlign='left';cx.textBaseline='alphabetic';}


function drawCommanderProjectile(b){
  const a=Math.atan2(b.vy,b.vx),r=Math.max(3,b.r||5),age=b.age||0,pulse=1+.10*Math.sin(age*12+(b.phase||0));
  cx.save();cx.translate(b.x,b.y);cx.rotate(a);cx.strokeStyle=b.col||'#ff768e';cx.fillStyle=b.col||'#ff768e';cx.shadowColor=b.col||'#ff768e';cx.shadowBlur=12;cx.lineCap='round';cx.lineJoin='round';
  if(b.style==='stinger'){cx.globalAlpha=.34;cx.lineWidth=r*1.25;cx.beginPath();cx.moveTo(-r*5.4,0);cx.lineTo(-r*.5,0);cx.stroke();cx.globalAlpha=1;cx.beginPath();cx.moveTo(r*2.6,0);cx.lineTo(-r*1.1,-r*.78);cx.lineTo(-r*.45,0);cx.lineTo(-r*1.1,r*.78);cx.closePath();cx.fill();cx.fillStyle='#fffbd6';cx.beginPath();cx.moveTo(r*1.7,0);cx.lineTo(-r*.15,-r*.22);cx.lineTo(-r*.15,r*.22);cx.closePath();cx.fill();}
  else if(b.style==='shell'){cx.rotate(age*(b.spin||1.7));cx.lineWidth=2.2;cx.beginPath();for(let i=0;i<6;i++){const q=i*TAU/6,x=Math.cos(q)*r*1.65*pulse,y=Math.sin(q)*r*1.65*pulse;i?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();cx.strokeStyle='#efffdc';cx.stroke();cx.globalAlpha=.45;cx.fillStyle='#233714';cx.beginPath();cx.arc(0,0,r*.7,0,TAU);cx.fill();}
  else if(b.style==='razor'){cx.rotate(age*(b.spin||2.2));cx.beginPath();cx.moveTo(r*2.7,0);cx.lineTo(0,-r*.62);cx.lineTo(-r*2.2,0);cx.lineTo(0,r*.62);cx.closePath();cx.fill();cx.strokeStyle='#fff4e5';cx.lineWidth=1.6;cx.stroke();cx.globalAlpha=.34;cx.lineWidth=5;cx.beginPath();cx.moveTo(-r*3.4,0);cx.lineTo(r*1.5,0);cx.stroke();}
  else if(b.style==='spore'){cx.rotate(-a);cx.globalAlpha=.28;cx.lineWidth=2;for(let i=0;i<2;i++){cx.beginPath();cx.arc(0,0,r*(1.65+i*.75)*pulse,0,TAU);cx.stroke();}cx.globalAlpha=.9;cx.beginPath();cx.arc(0,0,r*1.05*pulse,0,TAU);cx.fill();cx.fillStyle='#fff';cx.globalAlpha=.55;cx.beginPath();cx.arc(-r*.25,-r*.3,r*.28,0,TAU);cx.fill();}
  else if(b.style==='brood'){cx.rotate(age*(b.spin||1.4)*.35);cx.beginPath();cx.moveTo(r*2.35,0);cx.lineTo(-r*.7,-r*1.2);cx.lineTo(-r*.25,0);cx.lineTo(-r*.7,r*1.2);cx.closePath();cx.fill();cx.strokeStyle='#fff0df';cx.lineWidth=1.4;cx.stroke();cx.globalAlpha=.35;for(const oy of [-.8,.8]){cx.beginPath();cx.moveTo(-r*.2,oy*r);cx.lineTo(-r*2.4,oy*r*.7);cx.stroke();}}
  else if(b.style==='kinetic'){cx.rotate(age*(b.spin||2.4));cx.fillStyle='rgba(22,35,11,.42)';cx.strokeStyle=b.col||'#dfff6b';cx.lineWidth=2.5;cx.beginPath();cx.arc(0,0,r*1.65*pulse,0,TAU);cx.fill();cx.stroke();cx.lineWidth=1.4;cx.beginPath();cx.arc(0,0,r*.78,0,TAU);cx.stroke();for(let i=0;i<4;i++){cx.rotate(Math.PI/2);cx.beginPath();cx.moveTo(r*.9,0);cx.lineTo(r*1.75,0);cx.stroke();}}
  else if(b.style==='blood'){cx.beginPath();cx.moveTo(r*2.25,0);cx.bezierCurveTo(r*.4,-r*1.15,-r*1.5,-r*.7,-r*2.25,0);cx.bezierCurveTo(-r*1.5,r*.7,r*.4,r*1.15,r*2.25,0);cx.fill();cx.fillStyle='#fff1f3';cx.globalAlpha=.7;cx.beginPath();cx.ellipse(r*.62,-r*.2,r*.48,r*.2,0,0,TAU);cx.fill();cx.globalAlpha=.28;cx.strokeStyle=b.col;cx.lineWidth=4;cx.beginPath();cx.moveTo(-r*4.4,0);cx.lineTo(-r*1.25,0);cx.stroke();}
  else if(b.style==='resin'){cx.rotate(age*(b.spin||1.2));cx.beginPath();for(let i=0;i<6;i++){const q=i*TAU/6,x=Math.cos(q)*r*1.55,y=Math.sin(q)*r*1.55;i?cx.lineTo(x,y):cx.moveTo(x,y);}cx.closePath();cx.fill();cx.strokeStyle='#fff1ba';cx.lineWidth=1.5;cx.stroke();cx.fillStyle='#4e3710';cx.globalAlpha=.45;cx.fillRect(-r*.52,-r*.52,r*1.04,r*1.04);}
  else if(b.style==='prism'){cx.globalAlpha=.26;cx.lineWidth=r*1.8;cx.beginPath();cx.moveTo(-r*5.8,0);cx.lineTo(r*2.0,0);cx.stroke();cx.globalAlpha=.96;cx.beginPath();cx.moveTo(r*3.2,0);cx.lineTo(-r*1.0,-r*.55);cx.lineTo(-r*1.8,0);cx.lineTo(-r*1.0,r*.55);cx.closePath();cx.fill();cx.fillStyle='#ffffff';cx.globalAlpha=.82;cx.fillRect(-r*.7,-r*.16,r*3.0,r*.32);}
  else if(b.style==='sonic'){cx.rotate(-a);cx.fillStyle='rgba(25,10,38,.25)';cx.strokeStyle=b.col||'#d9a7ff';cx.lineWidth=2.3;for(let i=0;i<3;i++){cx.globalAlpha=.9-i*.22;cx.beginPath();cx.arc(0,0,r*(.85+i*.62)*pulse,age*(1+i*.15),age*(1+i*.15)+Math.PI*1.55);cx.stroke();}cx.globalAlpha=.65;cx.beginPath();cx.arc(0,0,r*.55,0,TAU);cx.fill();}
  else{cx.rotate(age*(b.spin||1.5));cx.beginPath();cx.moveTo(r*1.8,0);cx.lineTo(0,-r);cx.lineTo(-r*1.8,0);cx.lineTo(0,r);cx.closePath();cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1;cx.stroke();}
  cx.restore();
}


function drawProjectile(b,enemy=false){cx.save();cx.strokeStyle=b.col||'#fff';cx.fillStyle=b.col||'#fff';cx.shadowColor=b.col||'#fff';cx.shadowBlur=enemy?5:(b.evoOmega?18:b.evoAscended?14:10);if(enemy&&b.style){drawCommanderProjectile(b);cx.restore();return;}if(!enemy&&b.trail){const sp=Math.hypot(b.vx,b.vy)||1;cx.globalAlpha=.38;cx.lineWidth=Math.max(1,b.r*.9);cx.beginPath();cx.moveTo(b.x-b.vx/sp*b.trail,b.y-b.vy/sp*b.trail);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1;}if(!enemy&&b.powerKey){const sp=Math.hypot(b.vx,b.vy)||1,nx=-b.vy/sp,ny=b.vx/sp,trail=Math.max(16,b.trail||24);cx.save();if(b.powerBranch==='A'){cx.globalAlpha=.60;cx.strokeStyle='#ffffff';cx.lineWidth=Math.max(1,b.r*.34);cx.beginPath();cx.moveTo(b.x-b.vx/sp*trail*.72,b.y-b.vy/sp*trail*.72);cx.lineTo(b.x,b.y);cx.stroke();}else if(b.powerBranch==='B'){cx.globalAlpha=.30;cx.strokeStyle=b.col;cx.lineWidth=Math.max(1,b.r*.42);for(const side of [-1,1]){cx.beginPath();cx.moveTo(b.x-b.vx/sp*trail*.62+nx*b.r*side,b.y-b.vy/sp*trail*.62+ny*b.r*side);cx.lineTo(b.x+nx*b.r*side,b.y+ny*b.r*side);cx.stroke();}}if(b.evoAscended){cx.globalAlpha=b.evoOmega?.72:.48;cx.strokeStyle=b.evoOmega?'#fff09a':b.col;cx.lineWidth=b.evoOmega?2:1.4;cx.beginPath();cx.arc(b.x,b.y,b.r*(b.evoOmega?1.75:1.42),0,TAU);cx.stroke();}cx.restore();}
  if(b.type==='phase'){cx.lineWidth=5;cx.globalAlpha=.42;cx.beginPath();cx.moveTo(b.x-b.vx*.06,b.y-b.vy*.06);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=1;cx.fillStyle='#fff';cx.beginPath();cx.arc(b.x,b.y,2.4,0,TAU);cx.fill();}
  else if(b.type==='rail'){cx.lineWidth=4;cx.beginPath();cx.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);cx.lineTo(b.x,b.y);cx.stroke();cx.globalAlpha=.7;cx.beginPath();cx.arc(b.x,b.y,2.7,0,TAU);cx.fill();}
  else if(b.type==='missile'){cx.translate(b.x,b.y);cx.rotate(Math.atan2(b.vy,b.vx));cx.fillRect(-8,-3,13,6);cx.fillStyle='#fff';cx.fillRect(3,-1,5,2);}
  else if(!enemy&&b.type==='pulse'){cx.beginPath();cx.ellipse(b.x,b.y,b.r*1.75,b.r*.72,Math.atan2(b.vy,b.vx),0,TAU);cx.fill();cx.globalAlpha=.7;cx.fillStyle='#fff';cx.beginPath();cx.arc(b.x,b.y,b.r*.42,0,TAU);cx.fill();}
  else if(!enemy&&b.type==='bio'){cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();cx.globalAlpha=.35;cx.strokeStyle='#d9ffaf';cx.lineWidth=2;cx.beginPath();cx.arc(b.x,b.y,b.r*1.8,0,TAU);cx.stroke();}
  else if(!enemy&&b.type==='spark'){const a=Math.atan2(b.vy,b.vx);cx.translate(b.x,b.y);cx.rotate(a);cx.lineWidth=2.2;cx.beginPath();cx.moveTo(-b.r*2.4,0);cx.lineTo(b.r*1.4,0);cx.stroke();cx.fillStyle='#fff';cx.beginPath();cx.arc(b.r*.65,0,b.r*.5,0,TAU);cx.fill();}
  else{cx.beginPath();cx.arc(b.x,b.y,b.r,0,TAU);cx.fill();}cx.restore();}
function drawParticles(){let pi=0;const compact=compactUI(),dense=(compact&&G.particles.length>90)||PERF.tier==='RECOVERY'||(PERF.tier==='BALANCED'&&G.particles.length>180);for(const p of G.particles){pi++;if(dense&&p.kind==='dot'&&pi%2===0)continue;const a=clamp(p.life/(p.max||.7),0,1);cx.save();cx.globalAlpha=a;if(p.kind==='dot'){cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*a,0,TAU);cx.fill();}
  else if(p.kind==='spark'){cx.strokeStyle=p.col;cx.lineWidth=Math.max(.8,p.r*a);cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-(p.vx||0)*.035,p.y-(p.vy||0)*.035);cx.stroke();}
  else if(p.kind==='ring'||p.kind==='shock'||p.kind==='halo'||p.kind==='shieldwave'){cx.strokeStyle=p.col;cx.lineWidth=(p.kind==='shock'?5:p.kind==='shieldwave'?4:3)*a;cx.beginPath();cx.arc(p.x,p.y,p.r,0,TAU);cx.stroke();if(p.kind==='shock'){cx.globalAlpha=a*.25;cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.r*.76,0,TAU);cx.fill();}}
  else if(p.kind==='arc'){cx.strokeStyle=p.col;cx.lineWidth=2;cx.beginPath();cx.moveTo(p.x,p.y);const mx=(p.x+p.x2)/2+rnd(-15,15),my=(p.y+p.y2)/2+rnd(-15,15);cx.lineTo(mx,my);cx.lineTo(p.x2,p.y2);cx.stroke();}
  else if(p.kind==='slash'){cx.translate(p.x,p.y);cx.rotate(p.a||0);cx.strokeStyle=p.col;cx.lineWidth=6*a;cx.beginPath();cx.moveTo(-p.len*.25,0);cx.lineTo(p.len*.75,0);cx.stroke();cx.globalAlpha=a*.35;cx.lineWidth=16*a;cx.stroke();}
  else if(p.kind==='orb'){cx.fillStyle=p.col;cx.shadowColor=p.col;cx.shadowBlur=16;cx.beginPath();cx.arc(p.x,p.y,p.r*(.7+.3*Math.sin(G.elapsed*12)),0,TAU);cx.fill();}
  else if(p.kind==='muzzle'){cx.translate(p.x,p.y);cx.rotate(p.a||0);cx.fillStyle=p.col;cx.beginPath();cx.moveTo(0,0);cx.lineTo(-p.r*2,-p.r*.65);cx.lineTo(-p.r*1.3,0);cx.lineTo(-p.r*2,p.r*.65);cx.closePath();cx.fill();}
  cx.restore();}}


function drawTransversal(e){
  cx.save();cx.translate(e.x,e.y);const pulse=1+Math.sin(e.t*5)*.04,img=IMG.transversal[e.transversalType]||(e.transversalType==='parasite_orb'?IMG.generatedPowers.gravity:IMG.generatedShips[e.shipVariant])||IMG.enemyShips.scout;cx.scale(pulse,pulse);cx.shadowColor=e.col||'#8eeaff';cx.shadowBlur=12;
  if(imgReady(img)){const d=e.r*(e.transversalType==='rift_carrier'?3.25:e.transversalType==='parasite_orb'?3.0:2.75),scale=Math.min(d/img.naturalWidth,d/img.naturalHeight);if(e.transversalType==='parasite_orb')cx.rotate(e.t*.35);cx.drawImage(img,-img.naturalWidth*scale/2,-img.naturalHeight*scale/2,img.naturalWidth*scale,img.naturalHeight*scale);if(e.transversalType==='parasite_orb'){cx.globalAlpha=.28+.12*Math.sin(e.t*6);cx.strokeStyle=e.col;cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,e.r*1.35,0,TAU);cx.stroke();cx.globalAlpha=1;}}else{cx.fillStyle=e.col;cx.beginPath();cx.arc(0,0,e.r,0,TAU);cx.fill();}
  cx.shadowBlur=0;cx.restore();if(e.transversalType==='rift_carrier'||e.transversalType==='parasite_orb'){const w=e.r*2;cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(e.x-w/2,e.y+e.r*1.35,w,4);cx.fillStyle=e.col;cx.fillRect(e.x-w/2,e.y+e.r*1.35,w*clamp(e.hp/e.maxHp,0,1),4);}
}
function drawLieutenant(e){
  const oldSector=G.sector,sec=SECTORS[e.lieutenantSector-1]||SECTORS[0];G.sector=e.lieutenantSector;drawInsect(e,true,true,.58);G.sector=oldSector;const w=Math.min(150,e.r*3.2),x=e.x-w/2,y=e.y+e.r*1.4;cx.fillStyle='rgba(0,0,0,.58)';rr(x,y,w,7,4);cx.fill();cx.fillStyle=sec.accent;rr(x+1,y+1,(w-2)*clamp(e.hp/e.maxHp,0,1),5,3);cx.fill();if((e.staminaMax||0)>0&&(e.coreOpenT||0)<=0){cx.fillStyle='rgba(0,0,0,.5)';rr(x,y+9,w,4,2);cx.fill();cx.fillStyle='#fff09a';rr(x+1,y+10,(w-2)*clamp((e.stamina||0)/e.staminaMax,0,1),2,1);cx.fill();}
}

function drawGame(){
  if(G?.mode==='chase')return drawChaseGame();
  UI.buttons.length=0;drawBackground();drawBossArenaPresentation();drawBossArenaAftermath();drawAmbientProps();drawPreBossSetpiece();drawPreBossEscalationFx();cx.save();if(shake>0)cx.translate(rnd(-shake,shake),rnd(-shake*.65,shake*.65));
  for(const o of G.obstacles)drawObstacle(o);drawPowerMines();drawWaveObjectiveEntities();for(const f of G.frontThreats)drawFrontThreat(f);for(const q of G.pickups)drawPickup(q);for(const b of G.bullets)drawProjectile(b,false);for(const b of G.eBullets)drawProjectile(b,true);drawFamilyManeuverTelegraph();
  for(const e of G.enemies){if(e.kind==='lieutenant')drawLieutenant(e);else if(e.kind==='transversal')drawTransversal(e);else drawInsect(e,false);}if(G.boss&&!G.boss.dead){drawBossSignatureAttack(G.boss);drawBossBeam(G.boss);cx.save();cx.globalAlpha=clamp(G.boss.identityOpacity??1,.14,1);drawInsect(G.boss,true);cx.restore();}drawRiftAlly();drawShip();drawParticles();cx.restore();drawHUD();drawBanners();drawBossArrivalBanner();drawBossCelebration();drawLastChanceOverlay();if(flash>0){cx.fillStyle=`rgba(255,80,100,${flash*.11})`;cx.fillRect(0,0,W,H);}
}
function drawHUD(){
  const p=G.player,sec=SECTORS[G.sector-1],m=12,compact=compactUI();cx.save();cx.textBaseline='middle';
  syncHudPresentation();
  if(compact){drawCompactHud();cx.restore();return;}
  const leftW=Math.min(356,W*.33),rightW=Math.min(250,W*.23),heartPulse=1+(G.heartHitT||0)*.18+((p.hp/p.maxHp<=.1)?Math.sin(G.elapsed*12)*.08:0),actionPad=(shopBtn.style.display==='block'?40:0),rightY=m+actionPad;
  cx.fillStyle='rgba(2,7,17,.68)';cx.strokeStyle=hexA(sec.accent,.28);rr(m,m,leftW,88,14);cx.fill();cx.stroke();
  cx.fillStyle='#e8fbff';cx.font='800 12px system-ui';cx.fillText(`${sec.code} · SECTOR ${G.sector} · ORDA ${G.wave}/3${G.runDifficulty==='hard'?' · DIFÍCIL':''}`,m+12,m+15);cx.fillStyle=sec.accent;cx.font='700 9px system-ui';cx.fillText(`${sec.family} · ${sec.name}`,m+12,m+70);
  bar(m+96,m+26,130,8,p.hp/p.maxHp,'#ff647e');bar(m+96,m+42,130,7,p.shield/p.maxShield,'#74b9ff');bar(m+96,m+58,130,6,G.xp/G.xpNext,'#a6ff5f');cx.fillStyle='#fff';cx.font='700 9px system-ui';cx.fillText('HP',m+72,m+30);cx.fillText('SH',m+72,m+46);cx.fillText('XP',m+72,m+61);
  cx.save();cx.translate(m+34,m+43);cx.scale(heartPulse,heartPulse);cx.fillStyle=p.hp/p.maxHp<=.1?'#ff5b73':'#ff86a0';cx.font='900 21px system-ui';cx.fillText('❤',0,0);cx.restore();cx.fillStyle='#ffdbe2';cx.font='800 11px system-ui';cx.fillText(`${Math.max(0,p.hp/p.maxHp*100).toFixed(0)}%`,m+26,m+66);if(up('apexcore')>0&&G.mode!=='training'){const ay=m+94,aw=Math.min(leftW,224),activeA=G.apexT>0,val=activeA?G.apexT/Math.max(.1,G.apexMax||G.apexT):(G.apexCharge||0)/100;cx.fillStyle='rgba(2,7,17,.72)';cx.strokeStyle=activeA?'#7cf6ff':'rgba(124,246,255,.34)';rr(m,ay,aw,22,9);cx.fill();cx.stroke();bar(m+8,ay+14,aw-16,4,val,activeA?'#fff09a':'#7cf6ff');cx.fillStyle=activeA?'#fff09a':'#9fe6ff';cx.font='800 8px system-ui';cx.fillText(activeA?`✦ RIFT APEX · ${Math.ceil(G.apexT)}s`:`✦ APEX ${Math.round(G.apexCharge||0)}%`,m+10,ay+8);}

  cx.textAlign='center';cx.fillStyle='rgba(2,7,17,.62)';rr(W*.35,10,W*.30,58,12);cx.fill();cx.strokeStyle=hexA(sec.accent,.18);cx.stroke();cx.fillStyle='#f6fdff';cx.font='900 16px ui-monospace,monospace';cx.fillText(G.score.toLocaleString(),W*.5,24);cx.fillStyle='#ffd76a';cx.font='700 10px system-ui';cx.fillText(`¤ ${G.credits.toLocaleString()} · XP ${G.xp}/${G.xpNext} · NIV ${G.level}`,W*.5,41);cx.fillStyle='#9fe6ff';cx.font='700 9px system-ui';cx.fillText(G.mode==='bossRush'?`BOSS RUSH ${G.sector}/10`:`BAJAS ${G.kills}/${G.goal}`,W*.5,55);

  const rx=W-rightW-12;cx.textAlign='left';cx.fillStyle='rgba(2,7,17,.62)';cx.strokeStyle=hexA(sec.accent,.24);rr(rx,rightY,rightW,84,14);cx.fill();cx.stroke();
  cx.fillStyle=sec.accent;cx.font='800 11px system-ui';cx.fillText('PERFIL DEL SECTOR',rx+12,rightY+14);cx.fillStyle='#eefaff';cx.font='700 9px system-ui';cx.fillText(sec.boss,rx+12,rightY+29);cx.fillStyle=hexA(sec.accent,.92);cx.font='800 7px system-ui';cx.fillText(`DIR · ${directorProfile().label} · ⌖ ${bossCounterActiveCount()}/${bossCounterKeys(G.sector).length}`,rx+12,rightY+40);
  const labels=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]];let bx=rx+12;for(const [lab,val] of labels){cx.fillStyle='#87a0b0';cx.font='700 8px system-ui';cx.fillText(lab,bx,rightY+55);bar(bx+22,rightY+51,26,6,val/5,sec.accent);bx+=53;}
  if(G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='700 8px system-ui';cx.fillText(`HERENCIA: ${POWERS[G.lastBossDrop]?.name||''}`,rx+12,rightY+70);}cx.textAlign='right';cx.fillStyle='#9fe6ff';cx.font='700 8px system-ui';cx.fillText(`ESCOLTAS ${supportCount()}/5`,rx+rightW-12,rightY+70);cx.textAlign='left';

  if((G.weaponBoostT||0)>0){cx.fillStyle='rgba(2,7,17,.74)';cx.strokeStyle='rgba(255,207,115,.60)';rr(W/2-92,H-112,184,24,9);cx.fill();cx.stroke();cx.fillStyle='#ffcf73';cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(`⚡ IMPACTO +${Math.round(((G.weaponBoostMult||1)-1)*100)}% · ${Math.ceil(G.weaponBoostT)}s`,W/2,H-99);}if((G.fusionSurgeT||0)>0){const fy=(G.weaponBoostT||0)>0?H-140:H-112;cx.fillStyle='rgba(18,7,35,.76)';cx.strokeStyle='rgba(217,167,255,.68)';rr(W/2-105,fy,210,24,9);cx.fill();cx.stroke();cx.fillStyle='#d9a7ff';cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(`${fusionSurgeLabel()} +${Math.round((fusionSurgeDamageMult()-1)*100)}% · ${Math.ceil(G.fusionSurgeT)}s`,W/2,fy+13);}const active=Object.entries(G.powers).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,(G.maxActivePowers||activePowerSlotLimit())+(overflowPowerActive()?1:0));const compactP=W<760,gap=compactP?4:7,ww=compactP?62:82,maxPerRow=Math.max(2,Math.floor((W-24+gap)/(ww+gap))),activeRows=Math.max(1,Math.ceil(active.length/maxPerRow)),activeTop=H-44-(activeRows-1)*34;for(let i=0;i<active.length;i++){const [k,v]=active[i],row=(i/maxPerRow)|0,rowItems=Math.min(maxPerRow,active.length-row*maxPerRow),col=i-row*maxPerRow,rowW=rowItems*ww+Math.max(0,rowItems-1)*gap,x=W/2-rowW/2+col*(ww+gap),y=activeTop+row*34,pd=POWERS[k],vis=powerVisual(k),overflow=G.overflowPowerKey===k;cx.fillStyle=overflow?'rgba(53,40,5,.82)':'rgba(2,7,17,.74)';cx.strokeStyle=overflow?'#fff09a':hexA(vis.accent,.62);rr(x,y,ww,30,9);cx.fill();cx.stroke();cx.fillStyle=overflow?'#fff09a':vis.accent;cx.font=`900 ${compactP?8.2:10}px system-ui`;cx.textAlign='center';cx.fillText(`${overflow?'⚡ ':''}${pd.icon} ${powerVisualTag(k)} · ${Math.ceil(v)}s`,x+ww/2,y+16);}
  const q=(G.powerQueue||[]).slice(0,G.maxQueuePowers||queuedPowerSlotLimit());let qx=12,qy=activeTop-30,queueMinY=qy;for(const k of q){const pd=POWERS[k];if(qx+74>W-10){qx=12;qy-=28;}queueMinY=Math.min(queueMinY,qy);cx.fillStyle='rgba(2,7,17,.66)';cx.strokeStyle=hexA(pd.color,.4);rr(qx,qy,74,24,8);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText(`⏳ ${pd.icon}${powerVisualTag(k)} ${pd.name.slice(0,5)}`,qx+37,qy+13);qx+=80;}
  const combos=Object.keys(G.activeCombos||{});if(combos.length){const shown=combos.slice(0,2),cd=COMBOS[shown[0]],syn=Math.round((synergyDamageMult()-1)*100),mLv=Math.max(...combos.map(comboMasteryLevel),0),label=shown.map(id=>COMBOS[id]?.name||id).join(' + ')+(combos.length>2?` +${combos.length-2}`:'')+(syn?` · Σ+${syn}%`:``)+(mLv?` · M${['I','II','III','IV'][mLv-1]}`:'')+(bossCounterActiveCount()?` · ⌖${bossCounterActiveCount()}`:'');const cy=compactP?Math.max(108,(q.length?queueMinY:activeTop)-30):H-78;cx.fillStyle='rgba(2,7,17,.72)';cx.strokeStyle=hexA(cd.color,.48);rr(W/2-150,cy,300,24,9);cx.fill();cx.stroke();cx.fillStyle=cd.color;cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText(label.slice(0,58),W/2,cy+13);} 
  const objectiveText=objectiveHudText();if(objectiveText){const oy=G.frenzyT>0?108:78;cx.fillStyle='rgba(8,22,28,.80)';cx.strokeStyle=hexA(sec.accent,.58);rr(W/2-155,oy,310,26,10);cx.fill();cx.stroke();cx.fillStyle='#fff09a';cx.font='900 10px system-ui';cx.textAlign='center';cx.fillText(objectiveText,W/2,oy+14);}
  if(G.frenzyT>0){cx.fillStyle='rgba(72,31,0,.78)';cx.strokeStyle='#ffcb63';rr(W/2-105,78,210,26,10);cx.fill();cx.stroke();cx.fillStyle='#ffdc82';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`FRENESÍ ${G.frenzyKills}/${G.frenzyTarget} · ${Math.ceil(G.frenzyT)}s · x${G.frenzyMult.toFixed(1)}`,W/2,92);}
  if(G.familyPlay){const py=G.frenzyT>0?140:108,c=G.familyPlay.stage==='active'?'#fff09a':sec.accent;cx.fillStyle='rgba(19,13,4,.76)';cx.strokeStyle=hexA(c,.58);rr(W/2-138,py,276,25,9);cx.fill();cx.stroke();cx.fillStyle=c;cx.font='900 9px system-ui';cx.textAlign='center';cx.fillText(`⌁ ${G.familyPlay.label} · ${G.familyPlay.stage==='active'?'EJECUCIÓN':'TELEGRAPH'}${G.familyPlay.adapted?' · ADAPT':''}`,W/2,py+13);}
  if(G.mode==='training'){cx.fillStyle='rgba(5,42,64,.70)';cx.strokeStyle='#8edbff';rr(14,108,150,24,9);cx.fill();cx.stroke();cx.fillStyle='#bdefff';cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText('ENTRENAMIENTO',89,121);}
  if(G.preBossT>0){const sec=SECTORS[G.sector-1],spec=activePreBossEscalation(),w=spec?Math.min(390,W-28):290,x=W/2-w/2;cx.fillStyle='rgba(2,7,17,.76)';cx.strokeStyle=hexA(spec?.tint||sec.accent,.58);rr(x,78,w,spec?34:26,10);cx.fill();cx.stroke();cx.fillStyle=spec?.tint||sec.accent;cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(spec?`⚠ ${spec.label} · ${Math.ceil(G.preBossT)}s`:`♫ ANTESALA · ${sec.boss} · ${Math.ceil(G.preBossT)}s`,W/2,92);if(spec){cx.fillStyle='#dcecff';cx.font='700 8.5px system-ui';cx.fillText(preBossStageLabel().slice(0,48),W/2,104);bar(x+8,108,w-16,3,preBossProgress(),spec.tint);}}
  if(G.postBossT>0){cx.fillStyle='rgba(10,48,25,.78)';cx.strokeStyle='#a6ff5f';rr(W/2-125,110,250,28,10);cx.fill();cx.stroke();cx.fillStyle='#caff9d';cx.font='900 11px system-ui';cx.textAlign='center';cx.fillText(`RECOGE PREMIOS · ${Math.ceil(G.postBossT)}s`,W/2,125);}
  if(G.bossWarningT>0&&G.boss){const skill=BOSS_SKILLS[G.boss.pattern];cx.fillStyle='rgba(40,4,6,.78)';cx.strokeStyle=skill?.color||'#ff6b78';rr(W/2-160,H*.16,320,38,12);cx.fill();cx.stroke();cx.fillStyle=skill?.color||'#ff8a93';cx.font='900 14px system-ui';cx.textAlign='center';cx.fillText(`⚠ ${G.bossWarningText}`,W/2,H*.16+20);}
  if(G.combo>=3){cx.textAlign='right';cx.fillStyle=G.combo>=10?'#ff8be2':'#ffd76a';cx.font=`900 ${Math.min(22,12+G.combo*.35)}px system-ui`;const mobileLow=W<920&&H<520;cx.fillText(`x${G.combo} ENJAMBRE`,mobileLow?W-112:W-18,mobileLow?H-116:H-25);} 
  cx.restore();
}

function drawBossArrivalBanner(){
  const a=G.bossArrivalBanner;if(!a||a.t<=0)return;const compact=compactUI(),hasSub=!!a.subtitle,fade=clamp(a.t/Math.min(.55,a.max||2.1),0,1),w=Math.min(W-(compact?18:120),compact?470:680),h=compact?(hasSub?56:44):(hasSub?76:62),x=(W-w)/2,y=compact?68:96;cx.save();cx.globalAlpha=.30+.70*fade;cx.fillStyle='rgba(2,5,12,.80)';cx.strokeStyle=hexA(a.color||'#fff09a',.68);rr(x,y,w,h,14);cx.fill();cx.stroke();cx.textAlign='center';cx.fillStyle=a.color||'#fff09a';cx.font=`900 ${compact?10:12}px system-ui`;cx.fillText(a.family||'JEFE',W/2,y+(compact?12:16));cx.fillStyle='#fff';cx.font=`950 ${compact?16:23}px system-ui`;cx.fillText(a.name,W/2,y+(compact?29:39));if(hasSub){cx.fillStyle=a.color||'#fff09a';cx.font=`800 ${compact?8:10}px system-ui`;cx.fillText(a.subtitle,W/2,y+(compact?45:58));}cx.restore();cx.textAlign='left';
}

function drawBossCelebration(){
  const c=G.bossCelebration;if(!c||c.t<=0)return;const a=clamp(c.t/Math.min(.65,c.max||2.7),0,1),compact=compactUI(),w=Math.min(W-(compact?18:80),compact?520:620),h=compact?38:46,x=(W-w)/2,y=compact?42:74;cx.save();cx.globalAlpha=Math.min(1,.25+a);cx.fillStyle='rgba(3,8,17,.82)';cx.strokeStyle=hexA(c.color||'#fff09a',.65);rr(x,y,w,h,12);cx.fill();cx.stroke();cx.textAlign='center';cx.fillStyle='#fff';cx.font=`900 ${compact?11:14}px system-ui`;cx.fillText(c.text,W/2,y+(compact?13:16));cx.fillStyle=c.color||'#fff09a';cx.font=`800 ${compact?8:10}px system-ui`;cx.fillText(c.sub,W/2,y+(compact?27:32));cx.restore();cx.textAlign='left';
}
function bar(x,y,w,h,v,col){cx.fillStyle='rgba(255,255,255,.08)';rr(x,y,w,h,h/2);cx.fill();cx.fillStyle=col;rr(x+1,y+1,(w-2)*clamp(v,0,1),h-2,(h-2)/2);cx.fill();}
function drawBanners(){
  const sec=SECTORS[G.sector-1],compact=compactUI();
  if(compact){if(notices.length){const n=notices[0],a=clamp(n.t/Math.max(.4,n.max),0,1),w=Math.min(W-24,430),y=H-34;cx.save();cx.globalAlpha=.30+.70*a;cx.fillStyle='rgba(0,0,0,.62)';cx.strokeStyle=hexA(n.color,.34);rr(W/2-w/2,y,w,22,9);cx.fill();cx.stroke();cx.textAlign='center';cx.fillStyle=n.color;cx.font='800 9.5px system-ui';cx.fillText(fitNoticeText(n.text,w-18),W/2,y+12);cx.restore();}return;}
  if(G.sectorBanner>0){const a=clamp(Math.min(G.sectorBanner,3-G.sectorBanner)*1.4,0,1);cx.save();cx.globalAlpha=a;cx.textAlign='center';cx.fillStyle='#fff';cx.font=`900 ${Math.min(38,W*.05)}px system-ui`;cx.fillText(`SECTOR ${G.sector} · ${sec.name}`,W/2,H*.35);cx.fillStyle=sec.accent;cx.font=`800 ${Math.min(17,W*.022)}px system-ui`;cx.fillText(`LINAJE ${sec.family} // PODERES FOCO: ${powerFocusLabel(G.sector)}`,W/2,H*.41);cx.restore();}
  if(G.waveBanner>0&&G.sectorBanner<=0){cx.save();cx.globalAlpha=clamp(G.waveBanner,0,1);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 28px system-ui';cx.fillText(`ORDA ${G.wave}/3`,W/2,H*.32);const act=waveActLabel();if(act){cx.fillStyle=SECTORS[G.sector-1].accent;cx.font='800 11px system-ui';cx.fillText(act,W/2,H*.32+20);}cx.restore();}
  if(notices.length){const items=notices.slice(0,3);for(let i=0;i<items.length;i++){const n=items[i],a=clamp(n.t/Math.max(.4,n.max),0,1),w=Math.min(W*.36,460),y=H-120-i*28;cx.save();cx.globalAlpha=.25+.75*a;cx.fillStyle='rgba(0,0,0,.52)';rr(W/2-w/2,y,w,22,9);cx.fill();cx.strokeStyle=hexA(n.color,.24+.2*a);cx.stroke();cx.textAlign='center';cx.fillStyle=n.color;cx.font='800 10.5px system-ui';cx.fillText(fitNoticeText(n.text,w-18),W/2,y+12);cx.restore();}}
}

// ─────────────────────────────────────────────────────────────
// SCREENS / UI
// ─────────────────────────────────────────────────────────────
let menuSector=1,guidePage=0,storePowerOffset=0,storeTab='smart',storePage=0;
function uiButton(id,label,x,y,w,h,col='#66f5ff',sub=''){
  const hover=false;cx.save();cx.fillStyle='rgba(4,10,24,.78)';cx.strokeStyle=hexA(col,.62);cx.lineWidth=1.5;rr(x,y,w,h,12);cx.fill();cx.stroke();
  cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=col;cx.font=`900 ${Math.min(15,h*.32)}px system-ui`;cx.fillText(label,x+w/2,y+h*(sub?.42:.5));if(sub){cx.fillStyle='#9db1c1';cx.font=`600 ${Math.min(10,h*.18)}px system-ui`;cx.fillText(sub,x+w/2,y+h*.72);}cx.restore();UI.buttons.push({id,x,y,w,h});
}
function drawTitle(y=70){cx.textAlign='center';cx.fillStyle='#e9ffff';cx.font=`950 ${Math.min(54,W*.07)}px system-ui`;cx.fillText('SWARM//RIFT',W/2,y);cx.fillStyle='#a6ff5f';cx.font=`800 ${Math.min(13,W*.018)}px system-ui`;cx.fillText('I N S E C T A   S I E G E',W/2,y+25);cx.textAlign='left';}
function drawHazardPill(text,x,y,col){
  const w=Math.max(72,cx.measureText(text).width+18);cx.fillStyle='rgba(6,12,24,.76)';cx.strokeStyle=hexA(col,.34);rr(x,y,w,20,10);cx.fill();cx.stroke();cx.fillStyle=col;cx.font='700 9px system-ui';cx.fillText(text,x+9,y+10);return w;
}

function upgradeEffect(id,lvl){
  switch(id){
    case 'hull': return `+${lvl*12} HP máx`;
    case 'shield': return `+${lvl*10} escudo máx`;
    case 'damage': return `+${lvl*10}% daño base`;
    case 'rate': return `+${lvl*7}% cadencia`;
    case 'engine': return `+${lvl*5}% velocidad`;
    case 'magnet': return `+${lvl*18} radio de recolección`;
    case 'drone': return `+${Math.ceil(lvl/2)} dron${Math.ceil(lvl/2)===1?'':'es'} permanente${Math.ceil(lvl/2)===1?'':'s'}`;
    case 'salvage': return `+${lvl*8}% créditos`;
    case 'dash': return `+${lvl*3}% respuesta de maniobra`;
    case 'powerbay': return `${POWER_SLOT_LIMIT+Math.min(1,lvl)} poderes activos`;
    case 'reservebay': return `${POWER_QUEUE_LIMIT+Math.min(2,lvl)} en cola`;
    case 'evolution': return `rango máximo +${Math.min(2,lvl)} · hasta ${rankRoman(Math.min(7,5+Math.min(2,lvl)))}`;
    case 'reactor': return `+${lvl*5}% duración de poder`;
    case 'synergy': return `+${lvl*3}% daño por combo · hasta 3`;
    case 'recycler': return `+${lvl*28}% valor de reciclaje · +${lvl*3}% shield`;
    case 'overclock': return lvl?`slot temporal extra al ${Math.round((.35+lvl*.10)*100)}% de duración`:'sin sobreflujo';
    case 'apexcore': return lvl?`RIFT APEX · +${8+lvl*3}% daño · +${Math.round((1-(Math.max(.78,.94-lvl*.04)))*100)}% cadencia`:'duplicados al límite sin carga APEX';
    default:return 'sin datos';
  }
}
function nextUpgradeLabel(u,lvl){
  if(lvl>=u.max)return 'sin mejora disponible';
  return upgradeEffect(u.id,lvl+1);
}
function drawGuideThumb(kind,x,y,w,h){
  cx.save();
  rr(x,y,w,h,12);cx.clip();
  const bg = kind==='front'||kind==='progress' || kind==='boss' ? IMG.bg.rift : (kind==='powers'||kind==='hangar' ? IMG.bg.toxic : IMG.bg.rust);
  if(imgReady(bg)){
    const scale=Math.max(w/bg.naturalWidth,h/bg.naturalHeight);const iw=bg.naturalWidth*scale,ih=bg.naturalHeight*scale;
    cx.drawImage(bg,x+(w-iw)/2,y+(h-ih)/2,iw,ih);
  }else{cx.fillStyle='rgba(10,18,32,.9)';cx.fillRect(x,y,w,h);}
  const g=cx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(0,0,0,.12)');g.addColorStop(1,'rgba(0,0,0,.58)');cx.fillStyle=g;cx.fillRect(x,y,w,h);
  const sx=x+w*.24, sy=y+h*.58;
  if(['move','shoot','powers','front','boss','progress'].includes(kind)){
    if(imgReady(IMG.ship))cx.drawImage(IMG.ship,sx-34,sy-20,68,68);
    else{cx.fillStyle='#dff';cx.fillRect(sx-16,sy-8,32,16);} }
  if(kind==='move'){
    cx.strokeStyle='rgba(135,240,255,.9)';cx.lineWidth=3;for(const [dx,dy,ex,ey] of [[-44,0,-12,0],[44,0,12,0],[0,-34,0,-10],[0,34,0,10]]){cx.beginPath();cx.moveTo(sx+dx,sy+dy);cx.lineTo(sx+ex,sy+ey);cx.stroke();}
  }else if(kind==='shoot'){
    cx.strokeStyle='#9ee9ff';cx.lineWidth=5;for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(sx+34,sy-10+i*10);cx.lineTo(x+w-18,sy-18+i*14);cx.stroke();}
  }else if(kind==='powers'){
    const keys=['twin','tesla','shield'];keys.forEach((k,i)=>{const pd=POWERS[k];cx.fillStyle=hexA(pd.color,.18);cx.strokeStyle=pd.color;rr(x+14+i*54,y+h-44,42,30,10);cx.fill();cx.stroke();cx.fillStyle=pd.color;cx.font='900 16px system-ui';cx.fillText(pd.icon,x+35+i*54,y+h-23);});
  }else if(kind==='front'){
    cx.fillStyle='rgba(255,170,95,.88)';cx.beginPath();cx.moveTo(x+w*.76,y+h*.2);cx.lineTo(x+w*.92,y+h*.56);cx.lineTo(x+w*.68,y+h*.64);cx.closePath();cx.fill();cx.fillStyle='#fff4c9';cx.beginPath();cx.arc(x+w*.76,y+h*.46,6,0,TAU);cx.fill();
  }else if(kind==='boss'){
    const fake={x:x+w*.73,y:y+h*.57,r:24,family:SECTORS[0].family,form:'shocker',pattern:'storm',name:'BOSS',t:G.elapsed||0,phase:2,flash:0,guardT:0,telegraphT:0,animPulse:0,phaseFlash:0};
    drawInsect(fake,true,true,.78);const e1={x:x+w*.48,y:y+h*.38,r:10,family:SECTORS[0].family,form:SECTORS[0].forms[0],t:G.elapsed||0,flash:0,maxHp:1,hp:1},e2={...e1,x:x+w*.52,y:y+h*.72,form:SECTORS[0].forms[1]};drawInsect(e1,false,true,.72);drawInsect(e2,false,true,.72);
  }else if(kind==='replay'){
    cx.fillStyle='rgba(255,215,106,.15)';cx.strokeStyle='#ffd76a';rr(x+14,y+h-44,w-28,28,10);cx.fill();cx.stroke();cx.fillStyle='#ffd76a';cx.font='800 13px system-ui';cx.fillText('CHECKPOINT 50%',x+28,y+h-26);
  }else if(kind==='hangar'){
    cx.fillStyle='rgba(255,183,232,.12)';cx.strokeStyle='#ffb7e8';rr(x+12,y+12,w-24,h-24,12);cx.fill();cx.stroke();
    ['♥','⬡','✦','◆'].forEach((ic,i)=>{cx.fillStyle=['#ff8fa3','#8edbff','#ffe27a','#d6f9ff'][i];cx.font='900 18px system-ui';cx.fillText(ic,x+24+i*34,y+30);});
  }else if(kind==='progress'){
    cx.fillStyle='rgba(255,215,106,.12)';cx.strokeStyle='#ffd76a';rr(x+14,y+h-44,w-28,30,10);cx.fill();cx.stroke();cx.fillStyle='#ffd76a';cx.font='800 13px system-ui';cx.fillText('XP · CRÉDITOS · HERENCIAS',x+22,y+h-24);
  }
  cx.restore();
}

function drawMenuPortrait(){
  UI.buttons.length=0;drawBackground();const sec=SECTORS[menuSector-1],m=Math.max(14,W*.045),cw=W-m*2;
  cx.textAlign='left';cx.fillStyle='#e9ffff';cx.font=`950 ${Math.min(30,W*.078)}px system-ui`;cx.fillText('SWARM//RIFT',m,38);cx.fillStyle='#a6ff5f';cx.font=`800 ${Math.min(9,W*.024)}px system-ui`;cx.fillText('I N S E C T A   S I E G E',m,55);
  let y=72;const diff=RUN_DIFFICULTY[META.selectedDifficulty];uiButton('menu_difficulty',`◆ ${diff.label}`,m,y,cw,34,META.selectedDifficulty==='hard'?'#ff9a73':'#a6ff5f',META.selectedDifficulty==='hard'?'+23% hordas · +13% velocidad · +32% jefe':'balance principal');y+=40;
  const bh=42,gap=5;const primary=[
    ['menu_new','▶ CAMPAÑA','#a6ff5f','desde Sector 1'],
    ['menu_load','▣ CONTINUAR',hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint'],
    ['menu_training','ENTRENAMIENTO','#8edbff','práctica sin castigo'],
    ['sector_boss','CHECKPOINT JEFE 50%',bossCheckpointAvailable(menuSector)?'#ffbd6a':'#526575',bossLossCheckpointFor(menuSector)?'checkpoint de derrota · jefe 50%':(sectorDefeated(menuSector)?'arena desbloqueada':'derrota antes al jefe')]
  ];
  for(const b of primary){uiButton(b[0],b[1],m,y,cw,bh,b[2],b[3]);y+=bh+gap;}
  uiButton('menu_chase','🎯 CHASE BONUS · VISTA TRASERA',m,y,cw,40,'#7cf6ff','64 s · lock-on · recompensa separada');y+=46;const sg=4,sw=(cw-sg*2)/3;uiButton('menu_guide','? GUÍA',m,y,sw,34,'#ffd76a');uiButton('menu_store','🛒 HANGAR',m+sw+sg,y,sw,34,'#ffb7e8',`¤ ${META.credits.toLocaleString()}`);uiButton('menu_playlist','♫ LISTA',m+(sw+sg)*2,y,sw,34,'#9fe6ff');y+=44;
  const ch=chapterForSector(menuSector);cx.textAlign='left';cx.fillStyle='#dbe7ef';cx.font=`900 ${Math.max(10,W*.029)}px system-ui`;cx.fillText(`SECTOR · ${ch.title}`,m,y);y+=10;
  const side=44,mid=cw-side*2-10;uiButton('sector_prev','‹',m,y,side,42,'#7dc8ff');uiButton('sector_start',`${menuSector} · ${sec.family}`,m+side+5,y,mid,42,sec.accent,sec.name);uiButton('sector_next','›',W-m-side,y,side,42,'#7dc8ff');y+=50;
  const cardH=Math.max(100,Math.min(142,H-y-12));cx.fillStyle='rgba(3,8,18,.78)';cx.strokeStyle=hexA(sec.accent,.34);rr(m,y,cw,cardH,16);cx.fill();cx.stroke();
  cx.fillStyle=sec.accent;cx.font=`900 ${Math.max(12,W*.035)}px system-ui`;cx.fillText(`${sec.code} · ${sec.name}`,m+14,y+20);cx.fillStyle='#eaf7ff';cx.font=`800 ${Math.max(10,W*.028)}px system-ui`;cx.fillText(`${sec.family} · ${sec.boss}`,m+14,y+40);
  const statY=y+64,stats=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]];let sx=m+14;for(const [lab,val] of stats){cx.fillStyle='#7f96a6';cx.font='700 8px system-ui';cx.fillText(lab,sx,statY);bar(sx,statY+8,Math.max(42,(cw-56)/4),5,val/5,sec.accent);sx+=(cw-28)/4;}
  cx.fillStyle='#ffd76a';cx.font=`800 ${Math.max(8,W*.022)}px system-ui`;cx.fillText(`RANGO ${rankRoman(powerRankCap(menuSector))} · MUNDO ${menuSector}/${plannedSectorCount()} · CAP ${ch.id}`,m+14,y+cardH-16);
  cx.textAlign='left';
}

function drawMenuMobileLandscape(){
  UI.buttons.length=0;drawBackground();const sec=SECTORS[menuSector-1],m=14,top=14;cx.textAlign='left';
  cx.fillStyle='#eaffff';cx.font=`950 ${Math.min(30,H*.08)}px system-ui`;cx.fillText('SWARM//RIFT',m,top+20);cx.fillStyle='#a6ff5f';cx.font='800 8px system-ui';cx.fillText('I N S E C T A   S I E G E',m,top+36);
  const diff=RUN_DIFFICULTY[META.selectedDifficulty];uiButton('menu_difficulty',`◆ ${diff.label}`,W-150,10,136,30,META.selectedDifficulty==='hard'?'#ff9a73':'#a6ff5f');
  const bodyY=54,leftW=Math.min(W*.54,520),gap=7,bw=(leftW-m-gap)/2,bh=Math.max(38,Math.min(48,(H-150)/3));
  uiButton('menu_new','NUEVA CAMPAÑA',m,bodyY,bw,bh,'#a6ff5f','Sector 1');uiButton('menu_load','CARGAR PARTIDA',m+bw+gap,bodyY,bw,bh,hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint':'sin checkpoint');
  uiButton('menu_training','ENTRENAMIENTO',m,bodyY+bh+gap,bw,bh,'#8edbff');uiButton('sector_boss','JEFE 50%',m+bw+gap,bodyY+bh+gap,bw,bh,bossCheckpointAvailable(menuSector)?'#ffbd6a':'#526575');
  const sy=bodyY+(bh+gap)*2;uiButton('menu_chase','🎯 CHASE BONUS · VISTA TRASERA',m,sy,leftW-m,34,'#7cf6ff');const uy=sy+39,sg=5,sw=(leftW-m-sg*2)/3;uiButton('menu_guide','? GUÍA',m,uy,sw,30,'#ffd76a');uiButton('menu_store','🛒 HANGAR',m+sw+sg,uy,sw,30,'#ffb7e8');uiButton('menu_playlist','♫ LISTA',m+(sw+sg)*2,uy,sw,30,'#9fe6ff');
  const selY=H-58,side=40,mid=leftW-m-side*2-10;uiButton('sector_prev','‹',m,selY,side,38,'#7dc8ff');uiButton('sector_start',`${menuSector} · ${sec.family}`,m+side+5,selY,mid,38,sec.accent,sec.name);uiButton('sector_next','›',leftW-side,selY,side,38,'#7dc8ff');
  const cardX=leftW+18,cardY=54,cardW=W-cardX-14,cardH=H-cardY-18;cx.fillStyle='rgba(3,8,18,.72)';cx.strokeStyle=hexA(sec.accent,.30);rr(cardX,cardY,cardW,cardH,16);cx.fill();cx.stroke();
  const imgH=Math.min(108,cardH*.45),img=IMG.bg[sec.worldBg]||IMG.bg[sec.bg]||IMG.bg.rust;cx.save();rr(cardX+8,cardY+8,cardW-16,imgH,12);cx.clip();if(imgReady(img)){const sc=Math.max((cardW-16)/img.naturalWidth,imgH/img.naturalHeight),iw=img.naturalWidth*sc,ih=img.naturalHeight*sc;cx.drawImage(img,cardX+8+(cardW-16-iw)/2,cardY+8+(imgH-ih)/2,iw,ih);}cx.restore();
  cx.fillStyle=sec.accent;cx.font='900 11px system-ui';cx.fillText(`${sec.code} · ${sec.name}`,cardX+14,cardY+imgH+26);cx.fillStyle='#eefaff';cx.font='800 10px system-ui';cx.fillText(`${sec.family} · ${sec.boss}`,cardX+14,cardY+imgH+44);
  const statsY=cardY+cardH-30,stats=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]];let sx=cardX+14;for(const [lab,val] of stats){cx.fillStyle='#8297a6';cx.font='700 7px system-ui';cx.fillText(lab,sx,statsY);bar(sx,statsY+8,Math.max(32,(cardW-58)/4),5,val/5,sec.accent);sx+=(cardW-28)/4;}
}

function drawMenu(){
  const profile=uiProfile();if(profile==='MOBILE_PORTRAIT')return drawMenuPortrait();if(profile==='MOBILE_LANDSCAPE')return drawMenuMobileLandscape();
  UI.buttons.length=0;drawBackground();drawTitle(Math.max(54,H*.12));const sec=SECTORS[menuSector-1],menuChapter=chapterForSector(menuSector),menuRush=rushSpec(menuChapter.id),menuRushStats=META.bossRushStats[menuChapter.id]||{};
  const panelW=Math.min(560,W*.52),x=36,y=Math.max(110,H*.22),rightX=W-panelW*.72-36;
  cx.fillStyle='rgba(3,8,18,.68)';cx.strokeStyle='rgba(99,246,255,.16)';rr(x,y,panelW,H-y-36,20);cx.fill();cx.stroke();
  cx.fillStyle='#dffaff';cx.font=`800 ${Math.min(18,W*.025)}px system-ui`;cx.fillText('AUTO-SHOOTER DE ESQUIVA Y DESTRUCCIÓN',x+22,y+32);cx.fillStyle='#93a9ba';cx.font='600 12px system-ui';cx.fillText('🚀 Mueve · ⚡ esquiva · ✦ captura poderes · ☠ rompe el enjambre.',x+22,y+55);
  const compact=H<560,bw=Math.min(265,panelW*.47),bh=compact?42:54,row1=y+(compact?62:82),row2=y+(compact?110:148),row3=y+(compact?158:212),labelY=y+(compact?214:290),sy=y+(compact?228:304);uiButton('menu_difficulty',`◆ ${RUN_DIFFICULTY[META.selectedDifficulty].label}`,x+panelW-138,y+18,116,30,META.selectedDifficulty==='hard'?'#ff9a73':'#a6ff5f',META.selectedDifficulty==='hard'?'+23% hordas · +13% velocidad · +32% jefe':'balance principal');
  uiButton('menu_new','NUEVA CAMPAÑA',x+22,row1,bw,bh,'#a6ff5f','desde Sector 1');uiButton('menu_load','CARGAR PARTIDA',x+32+bw,row1,bw,bh,hasSave()?'#7dc8ff':'#526575',hasSave()?'checkpoint disponible':'sin checkpoint');
  uiButton('menu_guide','CÓMO JUGAR',x+22,row2,bw,bh,'#ffd76a','controles, poderes y tienda');uiButton('menu_store','HANGAR / TIENDA',x+32+bw,row2,bw,bh,'#ffb7e8',`¤ ${META.credits.toLocaleString()}`);
  uiButton('menu_training',menuRush.complete&&compact?`☠ RUSH CAP ${menuChapter.id}`:'ENTRENAMIENTO',x+22,row3,bw,bh,menuRush.complete&&compact?'#fff09a':'#8edbff',menuRush.complete&&compact?`${menuRush.count} jefes consecutivos`:'práctica sin castigo · mini jefe');uiButton('sector_boss','CHECKPOINT JEFE 50%',x+32+bw,row3,bw,bh,bossCheckpointAvailable(menuSector)?'#ffbd6a':'#526575',bossLossCheckpointFor(menuSector)?'checkpoint de derrota · jefe 50%':(sectorDefeated(menuSector)?(META.bossMastery?.[menuSector]?'arena desbloqueada · ★ maestría':'arena desbloqueada · reto de maestría'):'derrota antes al jefe'));
  uiButton('menu_chase','🎯 CHASE BONUS · VISTA TRASERA',x+22,labelY-6,panelW-44,38,'#7cf6ff','64 s · lock-on · shooter bonus independiente');cx.fillStyle='#dbe7ef';cx.font='800 11px system-ui';cx.fillText('REPETIR SECTOR DESBLOQUEADO',x+22,labelY+48);const sy2=sy+46;uiButton('sector_prev','‹',x+22,sy2,46,44,'#7dc8ff');uiButton('sector_start',`SECTOR ${menuSector} · ${sec.family}`,x+78,sy2,panelW-156,44,sec.accent,sec.name);uiButton('sector_next','›',x+panelW-68,sy2,46,44,'#7dc8ff');
  if(menuRush.complete&&H>=620)uiButton('menu_bossrush',`☠ BOSS RUSH · CAP ${menuChapter.id} · ${menuRush.count} JEFES`,x+22,H-120,panelW-44,34,'#fff09a',menuRushStats.wins?`victorias ${menuRushStats.wins} · rango ${menuRushStats.bestRank||'-'} · reliquias ${relicCount()}/${RELIC_SECTORS.length}`:`capítulo dominado · reliquias ${relicCount()}/${RELIC_SECTORS.length}`);else if(grandBossRushAvailable()&&H>=620)uiButton('menu_grandrush',`☠ GRAN BOSS RUSH · ${plannedSectorCount()} JEFES`,x+22,H-120,panelW-44,34,'#d9a7ff','campaña completa dominada');
  uiButton('menu_playlist','♫ PLAYLIST · BANDAS DE JEFE',x+22,H-78,panelW-44,34,'#9fe6ff',`13 temas disponibles · ${activeSectorCount()} arenas activas + variantes Boss Rush`);

  const cardX=Math.max(x+panelW+28,W*.62),cardW=W-cardX-36,cardY=y,cardH=H-cardY-36;cx.fillStyle='rgba(3,8,18,.60)';cx.strokeStyle=hexA(sec.accent,.28);rr(cardX,cardY,cardW,cardH,20);cx.fill();cx.stroke();
  const topH=Math.min(190,cardH*.34),img=IMG.bg[sec.worldBg]||IMG.bg[sec.bg]||IMG.bg.rust;
  cx.save();rr(cardX+10,cardY+10,cardW-20,topH,16);cx.clip();
  if(imgReady(img)){const scale=Math.max((cardW-20)/img.naturalWidth,topH/img.naturalHeight);const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;cx.drawImage(img,cardX+10+(cardW-20-iw)/2,cardY+10+(topH-ih)/2,iw,ih);}else{cx.fillStyle=sec.dark;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);}
  const g=cx.createLinearGradient(0,cardY+10,0,cardY+10+topH);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.74)');cx.fillStyle=g;cx.fillRect(cardX+10,cardY+10,cardW-20,topH);cx.restore();
  cx.textAlign='left';cx.fillStyle=sec.accent;cx.font='900 12px system-ui';cx.fillText(sec.code,cardX+22,cardY+topH-28);cx.fillStyle='#f2fbff';cx.font=`900 ${Math.min(18,cardW*.05)}px system-ui`;cx.fillText(sec.name,cardX+22,cardY+topH-10);
  cx.fillStyle='#dfefff';cx.font='800 12px system-ui';cx.fillText(`${sec.family} // JEFE ${sec.boss}`,cardX+22,cardY+topH+28);
  cx.fillStyle='#96abbc';cx.font='600 10.5px system-ui';cx.fillText(sec.blurb,cardX+22,cardY+topH+48);cx.fillStyle='#ffd76a';cx.font='800 9px system-ui';cx.fillText(`CAP ${menuChapter.id} · MUNDO ${menuSector}/${plannedSectorCount()} · PODERES HASTA RANGO ${rankRoman(powerRankCap(menuSector))}`,cardX+22,cardY+topH+66);

  let pillX=cardX+22,pillY=cardY+topH+66;for(const hz of sec.hazards){pillX+=drawHazardPill(hz,pillX,pillY,sec.accent)+8; if(pillX>cardX+cardW-130){pillX=cardX+22;pillY+=26;}}

  const hadGame=!!G,oldSector=G?.sector,oldPlayer=G?.player;if(!G)G={sector:menuSector,player:{x:0,y:0},elapsed:0};else{G.sector=menuSector;G.player=G.player||{x:0,y:0};}
  const previewY=Math.min(cardY+cardH-170,pillY+84),gap=14,boxW=(cardW-44-gap*2)/3,boxH=118;const forms=[sec.forms[0],sec.forms[1],sec.forms[2]];const labels=['GRUNT','ELITE','BOSS'];
  for(let i=0;i<3;i++){
    const px=cardX+14+i*(boxW+gap),py=previewY;cx.fillStyle='rgba(6,12,24,.72)';cx.strokeStyle=hexA(i===2?sec.accent:'#85b9d8',.24);rr(px,py,boxW,boxH,14);cx.fill();cx.stroke();
    const fake={x:px+boxW/2,y:py+boxH*.54,r:i===2?32:24,family:sec.family,form:forms[Math.min(i,2)],pattern:sec.pattern,name:sec.boss,t:performance.now()/1000+i,phase:1,flash:0,guardT:0,telegraphT:0,animPulse:0,phaseFlash:0};
    drawInsect(fake,i===2,true,i===2?.84:.9);cx.textAlign='center';cx.fillStyle=i===2?sec.accent:'#b2c6d4';cx.font='800 10px system-ui';cx.fillText(labels[i],px+boxW/2,py+boxH-12);
  }
  if(hadGame){G.sector=oldSector;G.player=oldPlayer;} else G=null;

  const statsY=cardY+cardH-28,stats=[['ARM',sec.stats.armor],['SPD',sec.stats.speed],['RNG',sec.stats.range],['THR',sec.stats.threat]],statGap=8,statW=(cardW-44-statGap*3)/4;cx.textAlign='left';for(let i=0;i<stats.length;i++){const [lab,val]=stats[i],sx=cardX+22+i*(statW+statGap);cx.fillStyle='#8ba3b6';cx.font='700 8px system-ui';cx.fillText(lab,sx,statsY);bar(sx,statsY+7,statW,5,val/5,sec.accent);}
  cx.fillStyle='#6f8799';cx.font='600 10px system-ui';cx.textAlign='center';cx.fillText(`v${VERSION} · ${expansionStatusLabel()} · campaña por capítulos · guardado local · PWA offline`,W/2,H-12);cx.textAlign='left';
}
function wrap(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;cx.textAlign='center';for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);cx.textAlign='left';return yy;}


function drawPlaylist(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.88)';cx.fillRect(0,0,W,H);const profile=uiProfile(),portrait=profile==='MOBILE_PORTRAIT',mobile=mobileUI(),titleY=mobile?28:48;
  cx.textAlign='center';cx.fillStyle='#9fe6ff';cx.font=`900 ${mobile?20:31}px system-ui`;cx.fillText('♫ PLAYLIST // BANDAS DE JEFE',W/2,titleY);if(!mobile){cx.fillStyle='#9ab0c0';cx.font='700 10px system-ui';cx.fillText('13 temas disponibles · reproducción independiente del combate',W/2,titleY+23);}
  const selected=PlaylistX.track(),available=!!selected?.src,top=mobile?44:92,playerH=mobile?(portrait?72:58):92,margin=mobile?12:W*.12,pw=mobile?W-24:W*.76;
  cx.fillStyle='rgba(5,13,27,.76)';cx.strokeStyle=hexA(selected?.color||'#9fe6ff',.35);rr(margin,top,pw,playerH,14);cx.fill();cx.stroke();cx.textAlign='left';cx.fillStyle=selected?.color||'#9fe6ff';cx.font=`900 ${mobile?10:16}px system-ui`;cx.fillText(`${selected.sector} · ${selected.boss}`,margin+12,top+18);cx.fillStyle='#eefaff';cx.font=`800 ${mobile?10:14}px system-ui`;cx.fillText(selected.title,margin+12,top+(mobile?38:48));if(portrait){cx.fillStyle=available?'#a6ff5f':'#ffbd6a';cx.font='700 8px system-ui';cx.fillText(available?(PlaylistX.playing?'REPRODUCIENDO':'DISPONIBLE'):'NO DISPONIBLE',margin+12,top+57);}
  const listTop=top+playerH+8,cols=portrait?1:(mobile?2:2),gap=mobile?4:8,cw=(pw-gap*(cols-1))/cols,ch=mobile?25:38,rows=Math.ceil(SOUNDTRACKS.length/cols);
  SOUNDTRACKS.forEach((t,i)=>{const col=i%cols,row=Math.floor(i/cols),x=margin+col*(cw+gap),y=listTop+row*(ch+(mobile?3:5)),sel=i===PlaylistX.index,enabled=!!t.src;cx.fillStyle=sel?'rgba(25,61,75,.76)':'rgba(4,11,22,.68)';cx.strokeStyle=sel?t.color:'rgba(120,170,190,.16)';rr(x,y,cw,ch,8);cx.fill();cx.stroke();cx.textAlign='left';cx.fillStyle=enabled?t.color:'#6b7d89';cx.font=`800 ${mobile?8:10}px system-ui`;const name=t.boss.length>(portrait?28:18)?t.boss.slice(0,portrait?27:17)+'…':t.boss;cx.fillText(`${String(i+1).padStart(2,'0')} · ${name}`,x+8,y+ch/2);cx.textAlign='right';cx.fillText(enabled?'♪':'…',x+cw-8,y+ch/2);UI.buttons.push({id:`playlist_track_${i}`,x,y,w:cw,h:ch});});
  const controlsY=Math.max(listTop+rows*(ch+(mobile?3:5))+5,H-(mobile?42:52)),bh=mobile?30:34,cx0=W/2,bw=mobile?70:104;uiButton('playlist_back','← MENÚ',12,controlsY,mobile?76:110,bh,'#ffb7e8');uiButton('playlist_prev','◀',cx0-bw*1.4,controlsY,bw,bh,'#8edbff');uiButton('playlist_toggle',PlaylistX.playing?'Ⅱ':'▶ PLAY',cx0-bw/2,controlsY,bw,bh,available?'#a6ff5f':'#526575');uiButton('playlist_next','▶',cx0+bw*.4,controlsY,bw,bh,'#8edbff');cx.textAlign='left';
}

function drawPause(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(0,0,W,H);drawTitle(H*.18);cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 30px system-ui';cx.fillText(G.mode==='chase'?'🎯 CHASE BONUS · PAUSA':'PAUSA TÁCTICA',W/2,H*.31);cx.fillStyle='#9db1c1';cx.font='600 12px system-ui';cx.fillText(G.mode==='chase'?`PUNTOS ${G.score.toLocaleString()} · BAJAS ${G.chase?.kills||0} · INTEGRIDAD ${Math.round(G.chase?.integrity||0)}%`:`PUNTOS ${G.score.toLocaleString()} · ¤ ${G.credits.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.36);const w=Math.min(310,W*.34),h=48,x=W/2-w/2;uiButton('pause_resume','▶ CONTINUAR',x,H*.43,w,h,'#a6ff5f');if(G.mode==='chase'){uiButton('pause_menu','← ABANDONAR CHASE',x,H*.57,w,h,'#ff8b79');}else{uiButton('pause_save','▣ GUARDAR CHECKPOINT',x,H*.53,w,h,'#78caff');uiButton('pause_store','🛒 TIENDA',x,H*.64,w,h,'#ffb9ef','la compra mantiene el combate congelado');uiButton('pause_menu','MENÚ PRINCIPAL',x,H*.75,w,h,'#ff8b79');}cx.textAlign='left';}

function upgradeCost(u){const lvl=up(u.id);return Math.round(u.base*Math.pow(1.39,lvl));}
function buyUpgrade(id){const u=UPGRADES.find(v=>v.id===id);if(!u)return;const lvl=up(id);if(lvl>=u.max){AudioX.deny();return;}const cost=upgradeCost(u);if(G.credits<cost){AudioX.deny();notify('CRÉDITOS INSUFICIENTES','#ff768c',1.5);return;}G.credits-=cost;META.credits=G.credits;META.upgrades[id]=lvl+1;
  if(G.player){if(id==='hull'){G.player.maxHp+=12;G.player.hp=Math.min(G.player.maxHp,G.player.hp+12);}if(id==='shield'){G.player.maxShield+=10;G.player.shield=Math.min(G.player.maxShield,G.player.shield+10);}if(id==='powerbay')G.maxActivePowers=activePowerSlotLimit();if(id==='reservebay')G.maxQueuePowers=queuedPowerSlotLimit();}
  AudioX.buy();saveMeta();if(shopReturn==='GAME')saveRun();notify(`${u.name} · NIVEL ${lvl+1}`,'#a6ff5f',1.5);
}

// v2.12.1.1 · HANGAR COMPACTO + COMPRA INTELIGENTE
const STORE_POWER_DECK=POWER_KEYS.slice();
const POWER_SHOP_WORLD={twin:1,shield:1,magnet:1,cryo:2,acid:2,drone:2,missile:3,tesla:3,rail:3,burst:3,bomb:3,overdrive:4,phase:4,gravity:5,nanites:5,sparklaser:6,riftmine:6,orbitblade:6,bio:7,hemadrain:7,resinwall:8,echo:8,prismburst:9,ionweb:9,resonance:10,nova:10};
const SUPPLY_DEFS={
  repair:{name:'HEMOGEL',icon:'✚',color:'#ff7791',desc:'+45% HP · auto ≤10%',base:118,max:5,kind:'repair'},
  shield1:{name:'SHIELD I',icon:'⬡',color:'#78bfff',desc:'+35% escudo · básico',base:92,max:5,kind:'shield',tier:1,unlock:1},
  shield2:{name:'SHIELD II',icon:'⬢',color:'#8edbff',desc:'+65% escudo · alto',base:158,max:4,kind:'shield',tier:2,unlock:2},
  shield3:{name:'SHIELD III',icon:'◉',color:'#b8f1ff',desc:'escudo completo · máximo',base:245,max:3,kind:'shield',tier:3,unlock:3},
  life:{name:'VIDA EXTRA',icon:'♥',color:'#ff5f79',desc:'revive en el mismo combate',base:420,max:3,kind:'life',unlock:1}
};
function storeInRun(){return ['GAME','PAUSE'].includes(shopReturn)&&G?.mode!=='training';}
function storeContextSector(){return clamp(storeInRun()?(G?.sector||1):(menuSector||META.unlocked||1),1,activeSectorCount());}
function supplyStock(id){return Math.max(0,META.supplies?.[id]||0);}
function supplyUnlocked(id){const d=SUPPLY_DEFS[id];return !!d&&storeContextSector()>=(d.unlock||1);}
function supplyCost(id){const d=SUPPLY_DEFS[id];if(!d)return 999999;const sec=storeContextSector(),stock=supplyStock(id),tier=d.tier||1;return Math.round((d.base+sec*10+tier*12)*Math.pow(1.14,stock));}
function extraLifeCost(){return Math.round((SUPPLY_DEFS.life.base+storeContextSector()*34)*(runDifficultyKey()==='hard'?1.18:1));}
function powerShopAvailableKeys(){
  const progress=Math.max(storeContextSector(),META.unlocked||1),heritages=new Set(Object.values(META.bossUnlocks||{}).filter(Boolean));
  return POWER_KEYS.filter(k=>{const min=POWER_SHOP_WORLD[k]||1;if(progress<min)return false;if(['hemadrain','resinwall','prismburst','resonance'].includes(k)&&!heritages.has(k))return false;return true;});
}
function powerStock(key){return Math.max(0,META.powerStock?.[key]||0);}
function powerStockCap(){return 3+Math.min(2,up('reservebay'));}
function powerCreditCost(key){const sec=POWER_SHOP_WORLD[key]||1,rank=G?.powerRanks?.[key]||0,instant=INSTANT_POWERS.has(key);return Math.round((instant?190:145)+sec*22+rank*48);}
function powerXpCost(key){const sec=POWER_SHOP_WORLD[key]||1,rank=G?.powerRanks?.[key]||0,instant=INSTANT_POWERS.has(key);return Math.round((instant?92:64)+sec*11+rank*26);}
function powerPrice(key){const credits=powerCreditCost(key),xp=powerXpCost(key);return {credits,xp,useXp:storeInRun()&&(G?.xp||0)>=xp};}
function spendCredits(amount){if((G?.credits||0)<amount)return false;G.credits-=amount;META.credits=G.credits;return true;}
function useSupply(id,manual=false){
  const d=SUPPLY_DEFS[id];if(!d||supplyStock(id)<=0||!G?.player)return false;const p=G.player;META.supplies[id]=supplyStock(id)-1;
  if(d.kind==='repair'){const gain=Math.round(p.maxHp*.45);p.hp=Math.min(p.maxHp,p.hp+gain);notify(`✚ HEMOGEL · +${gain} HP`,'#ff7791',1.45);burst(p.x,p.y,'#ff7791',20,145);}
  else if(d.kind==='shield'){const frac=d.tier===3?1:d.tier===2?.65:.35,gain=Math.round(p.maxShield*frac);p.shield=Math.min(p.maxShield,p.shield+gain);G.shieldCriticalWarned=false;notify(`${d.icon} ${d.name} · ESCUDO RECARGADO`,d.color,1.45);G.particles.push({kind:'shieldwave',x:p.x,y:p.y,r:p.r+12,vr:260,life:.42,max:.42,col:d.color});}
  AudioX.pickup();saveMeta();if(manual&&shopReturn==='GAME')saveRun();return true;
}
function autoUseEmergencySupplies(){
  if(!G?.player||G.screen==='DEAD')return false;const p=G.player,hr=p.hp/Math.max(1,p.maxHp),sr=p.shield/Math.max(1,p.maxShield);let used=false;
  if(hr<=.10&&supplyStock('repair')>0)used=useSupply('repair')||used;
  if((sr<=.04&&hr<=.42)||hr<=.16){for(const id of ['shield3','shield2','shield1']){if(supplyStock(id)>0){used=useSupply(id)||used;break;}}}
  if(used)notify('★ SOPORTE INTELIGENTE DESPLEGADO','#fff09a',1.3);return used;
}
function buySupply(id){
  const d=SUPPLY_DEFS[id];if(!d||!supplyUnlocked(id)){AudioX.deny();notify('SUMINISTRO AÚN BLOQUEADO','#ff8a8a',1.2);return false;}const stock=supplyStock(id),max=d.max||5;if(stock>=max){AudioX.deny();notify('RESERVA COMPLETA','#9fb4c5',1.1);return false;}const cost=id==='life'?extraLifeCost():supplyCost(id);if(!spendCredits(cost)){AudioX.deny();notify('CRÉDITOS INSUFICIENTES','#ff768c',1.4);return false;}META.supplies[id]=stock+1;AudioX.buy();saveMeta();
  if(storeInRun()&&d.kind==='repair'&&G.player.hp<G.player.maxHp*.88)useSupply(id,true);else if(storeInRun()&&d.kind==='shield'&&G.player.shield<G.player.maxShield*.84)useSupply(id,true);else notify(`${d.icon} ${d.name} · RESERVA ${supplyStock(id)}/${max}`,d.color,1.35);return true;
}
function smartPowerScore(key,sector=storeContextSector()){
  let score=20,focus=POWER_WORLD_FOCUS[sector]||[];if(focus.includes(key))score+=42;if(bossCounterKeys(sector).includes(key))score+=(G?.boss||G?.preBossT>0?44:24);score+=doctrinePowerScore(key);if(G?.powers?.[key])score-=20;if((G?.powerQueue||[]).includes(key))score-=12;
  if(key==='shield'){const sr=G?.player?G.player.shield/Math.max(1,G.player.maxShield):1;if(sr<.35)score+=55;}
  if(key==='hemadrain'&&G?.player&&G.player.hp/G.player.maxHp<.55)score+=58;if(key==='bomb'&&(G?.frenzyT>0||G?.wave>=3))score+=65;if(key==='magnet'&&G?.wave>=2)score+=12;if(key==='drone'&&sector>=5)score+=16;if(key==='resonance'&&G?.boss)score+=20;if(key==='phase'&&G?.boss)score+=22;if(key==='nanites'&&G?.enemies?.length>=5)score+=24;if(key==='riftmine'&&G?.wave>=2)score+=20;if(key==='echo'&&powerOn('twin'))score+=22;if(key==='nova'&&(G?.eBullets?.length||0)>14)score+=34;return score;
}
function deployHangarLoadout(){
  if(!G||G.mode!=='campaign')return 0;const free=Math.max(0,G.maxActivePowers-countActivePowers());if(!free)return 0;const pool=powerShopAvailableKeys().filter(k=>!INSTANT_POWERS.has(k)&&powerStock(k)>0).sort((a,b)=>smartPowerScore(b,G.sector)-smartPowerScore(a,G.sector));let n=0;
  for(const k of pool.slice(0,free)){META.powerStock[k]=powerStock(k)-1;activatePower(k,'shop');n++;}if(n){saveMeta();notify(`★ HANGAR · ${n} PODER${n===1?'':'ES'} DESPLEGADO${n===1?'':'S'}`,'#fff09a',1.5);}return n;
}
function updateHangarReserves(dt){
  if(!G||G.mode!=='campaign'||G.sectorClear)return;G.hangarReserveT=(G.hangarReserveT??1.5)-dt;if(G.hangarReserveT>0)return;G.hangarReserveT=1.5;
  if(countActivePowers()<G.maxActivePowers&&reservePolicyAllowsDeploy())deployHangarLoadout();
  if(powerStock('bomb')>0&&G.frenzyT>0&&G.enemies.length>=7){META.powerStock.bomb=powerStock('bomb')-1;activatePower('bomb','shop');saveMeta();notify('★ RESERVA INTELIGENTE · BOMBA RIFT','#ffb67a',1.5);}
}
function buyShopPower(key){
  if(!POWERS[key]||!powerShopAvailableKeys().includes(key)){AudioX.deny();notify('PODER AÚN NO DISPONIBLE','#ff8a8a',1.2);return false;}const price=powerPrice(key);
  if(storeInRun()){
    if(price.useXp){G.xp-=price.xp;}else if(!spendCredits(price.credits)){AudioX.deny();notify(`REQUIERE XP ${price.xp} O ¤ ${price.credits}`,'#ff768c',1.5);return false;}
    activatePower(key,'shop');AudioX.buy();saveMeta();if(shopReturn==='GAME')saveRun();return true;
  }
  const stock=powerStock(key),cap=powerStockCap();if(stock>=cap){AudioX.deny();notify('RESERVA DE ESTE PODER COMPLETA','#9fb4c5',1.2);return false;}if(!spendCredits(price.credits)){AudioX.deny();notify('CRÉDITOS INSUFICIENTES','#ff768c',1.4);return false;}META.powerStock[key]=stock+1;AudioX.buy();saveMeta();notify(`${POWERS[key].icon} ${POWERS[key].name} · RESERVA ${powerStock(key)}/${cap}`,POWERS[key].color,1.5);return true;
}
function buyOrUseExtraLife(){
  if(!G||G.screen!=='DEAD')return false;if(supplyStock('life')<=0){const cost=extraLifeCost();if(!spendCredits(cost)){AudioX.deny();notify(`VIDA EXTRA · REQUIERE ¤ ${cost}`,'#ff768c',1.5);return false;}META.supplies.life=1;saveMeta();}
  META.supplies.life=supplyStock('life')-1;const p=G.player;p.hp=Math.max(1,Math.round(p.maxHp*.62));p.shield=Math.round(p.maxShield*.48);p.inv=2.4;p.x=W*.20;p.y=H*.50;G.eBullets.length=0;G.frontThreats.length=0;G.critWarned=false;G.shieldCriticalWarned=false;G.screen='GAME';setScreen('GAME');AudioX.unlock();MusicX.reconcile(true);MusicX.resume();burst(p.x,p.y,'#ff6d89',34,210);notify('♥ VIDA EXTRA · CONTINÚAS EN EL MISMO COMBATE','#ff7f92',2.0);saveMeta();saveRun();return true;
}
function smartItemScore(item){
  const p=G?.player,hr=p?p.hp/Math.max(1,p.maxHp):1,sr=p?p.shield/Math.max(1,p.maxShield):1,sec=storeContextSector();let score=0;
  if(item.kind==='briefing')return 999;if(item.kind==='power')return smartPowerScore(item.key,sec);
  if(item.kind==='supply'){if(item.key==='repair')score=hr<.25?100:hr<.50?74:30;else if(item.key==='life')score=sec>=4?70:52;else if(item.key.startsWith('shield')){const tier=SUPPLY_DEFS[item.key]?.tier||1,target=clamp(sec,1,3);score=sr<.25?95:sr<.55?70:32;score+=tier===target?26:Math.max(0,8-Math.abs(target-tier)*6);}return score;}
  if(item.kind==='branch'){score=powerBranch(item.key)?28:62;score+=(POWER_WORLD_FOCUS[sec]||[]).includes(item.key)?30:0;return score;}
  if(item.kind==='doctrine'||item.kind==='policy'||item.kind==='loadout'||item.kind==='loadoutsave')return 48;
  if(item.kind==='mastery')return comboMasteryLevel(item.key)*12+comboMasteryCount(item.key);
  if(item.kind==='upgrade'){const lvl=up(item.key);score=34-lvl*3;if(item.key==='shield'&&sec<=3)score+=44;if(item.key==='hull'&&hr<.7)score+=34;if(item.key==='damage'||item.key==='rate')score+=sec>=4?24:12;if(item.key==='salvage'&&sec>=3)score+=14;if(item.key==='drone'&&sec>=5)score+=22;if(item.key==='powerbay')score+=sec>=4?52:30;if(item.key==='reservebay')score+=38;if(item.key==='evolution')score+=sec>=7?58:26;if(item.key==='reactor')score+=sec>=5?42:24;if(item.key==='synergy')score+=sec>=5?48:22;if(item.key==='recycler')score+=(G?.maxQueuePowers||queuedPowerSlotLimit())>=6?34:18;if(item.key==='overclock')score+=sec>=6?54:24;if(item.key==='apexcore')score+=sec>=6?58:28;return score;}
  return score;
}
function bossCounterBriefingItem(){const sec=storeContextSector(),c=bossCounterSpec(sec),owned=c.keys.filter(k=>powerStock(k)>0||powerOn(k));return {kind:'briefing',key:'counter',name:`⌖ CONTRAMEDIDAS · ${SECTORS[sec-1]?.boss||'JEFE'}`,icon:'⌖',color:'#fff09a',desc:`${c.label} · ${c.keys.map(k=>POWERS[k]?.name||k).join(' / ')}${owned.length?` · listas ${owned.length}/${c.keys.length}`:''}`,cost:0,stock:`${owned.length}/${c.keys.length}`,maxed:false,smart:999};}
function shopCatalog(tab=storeTab){
  const powers=powerShopAvailableKeys().map(key=>{const p=POWERS[key],pr=powerPrice(key);return {kind:'power',key,name:p.name,icon:p.icon,color:p.color,desc:INSTANT_POWERS.has(key)?'instantáneo · limpia pantalla':`Rango ${rankRoman(G?.powerRanks?.[key]||1)}/${rankRoman(powerRankCap(storeContextSector()))}${powerBranch(key)?' · '+powerBranchLabel(key):''}${powerEvolutionTrait(key,G?.powerRanks?.[key]||1)?' · '+powerEvolutionTrait(key,G?.powerRanks?.[key]||1):''} · ${p.desc}`,cost:pr.credits,xp:pr.xp,useXp:pr.useXp,stock:powerStock(key),maxed:!storeInRun()&&powerStock(key)>=powerStockCap()};});
  const supplies=Object.entries(SUPPLY_DEFS).filter(([k])=>supplyUnlocked(k)).map(([key,d])=>({kind:'supply',key,name:d.name,icon:d.icon,color:d.color,desc:d.desc,cost:key==='life'?extraLifeCost():supplyCost(key),stock:supplyStock(key),max:d.max,maxed:supplyStock(key)>=d.max}));
  const upgrades=UPGRADES.map(u=>({kind:'upgrade',key:u.id,name:u.name,icon:u.icon,color:EVOLUTION_UPGRADE_IDS.has(u.id)?'#d9a7ff':'#8edbff',desc:up(u.id)>=u.max?'MÁXIMO':`${upgradeEffect(u.id,up(u.id))} → ${upgradeEffect(u.id,Math.min(u.max,up(u.id)+1))}`,cost:up(u.id)>=u.max?0:upgradeCost(u),stock:up(u.id),max:u.max,maxed:up(u.id)>=u.max}));
  const branches=powerBranchUnlocked()?Object.keys(POWER_BRANCHES).filter(k=>powerShopAvailableKeys().includes(k)).map(key=>{const p=POWERS[key],cur=powerBranch(key),next=cur==='A'?'B':'A',b=POWER_BRANCHES[key][next];return {kind:'branch',key,name:`${p.name} · RAMA ${next}`,icon:next,color:'#d9a7ff',desc:`${b.name} · ${b.desc}${cur?` · actual ${cur}`:''}`,cost:branchCost(key),stock:cur||'—',maxed:false};}):[];
  const evolution=[...upgrades.filter(i=>EVOLUTION_UPGRADE_IDS.has(i.key)),...branches];const standardUpgrades=upgrades.filter(i=>!EVOLUTION_UPGRADE_IDS.has(i.key));
  const doctrine=hangarDoctrine(),policy=reservePolicy(),ls=hangarLoadoutSlot(),ld=hangarLoadoutData(ls),fusionSettings=[{kind:'doctrine',key:'hangar',name:`DOCTRINA · ${doctrine.name}`,icon:doctrine.icon,color:doctrine.color,desc:`${doctrine.desc} · tocar para cambiar`,cost:0,stock:doctrine.name,maxed:false},{kind:'policy',key:'reserve',name:`RESERVAS · ${policy.name}`,icon:policy.icon,color:policy.color,desc:`${policy.desc} · tocar para cambiar`,cost:0,stock:policy.name,maxed:false},{kind:'loadout',key:'cycle',name:`MATRIZ DE CARGA · ${ls}`,icon:'▣',color:'#9fe6ff',desc:`${hangarLoadoutSummary(ld)} · tocar para cambiar/aplicar slot`,cost:0,stock:`L${ls}`,maxed:false},{kind:'loadoutsave',key:'save',name:`GUARDAR MATRIZ · ${ls}`,icon:'⌑',color:'#fff09a',desc:'guarda doctrina, política de reservas y todas las ramas A/B actuales',cost:0,stock:ld?'ACTUALIZAR':'NUEVA',maxed:false}];
  const mastery=Object.keys(COMBOS).map(key=>{const c=COMBOS[key],lv=comboMasteryLevel(key),n=comboMasteryCount(key),next=COMBO_MASTERY_THRESHOLDS[Math.min(4,lv+1)]||COMBO_MASTERY_THRESHOLDS[4];return {kind:'mastery',key,name:c.name,icon:'Σ',color:c.color,desc:`activaciones ${n} · ${lv>=4?'MIV · pulso Apex 1×/sector':`siguiente nivel en ${Math.max(0,next-n)}`}`,cost:0,stock:lv?`M${comboMasteryLabel(key)}`:'M—',level:lv,maxed:lv>=4};}).sort((a,b)=>(b.level||0)-(a.level||0)||comboMasteryCount(b.key)-comboMasteryCount(a.key));
  const fusion=[...fusionSettings,...mastery];
  let out=tab==='powers'?powers:tab==='support'?supplies:tab==='evolution'?evolution:tab==='fusion'?fusion:tab==='upgrades'?standardUpgrades:[...powers,...supplies,...upgrades,...branches];out.forEach(i=>i.smart=smartItemScore(i));if(tab==='smart'){const briefing=bossCounterBriefingItem(),open=out.filter(i=>!i.maxed).sort((a,b)=>b.smart-a.smart),limit=mobileUI()?7:11;out=[briefing,...(open.length?open:out).slice(0,limit)];}return out;
}
function shopCanAfford(item){if(item.kind==='briefing'||item.kind==='doctrine'||item.kind==='policy'||item.kind==='loadout'||item.kind==='loadoutsave')return true;if(item.kind==='mastery'||item.maxed)return false;if(item.kind==='power'&&storeInRun())return (G.xp||0)>=item.xp||(G.credits||0)>=item.cost;return (G.credits||0)>=item.cost;}
function drawShopIcon(item,x,y,d){
  if(item.kind==='power'){const img=powerAsset(item.key);if(imgReady(img)){cx.save();rr(x,y,d,d,9);cx.clip();cx.drawImage(img,x,y,d,d);cx.restore();return;}}
  if(item.kind==='supply'){const img=item.key==='repair'?IMG.pickups.heal:item.key.startsWith('shield')?IMG.pickups.shield:null;if(imgReady(img)){cx.drawImage(img,x,y,d,d);return;}}
  cx.fillStyle=item.color;cx.font=`950 ${Math.max(18,d*.62)}px system-ui`;cx.textAlign='center';cx.fillText(item.icon,x+d/2,y+d/2+1);cx.textAlign='left';
}
function shopFitText(text,maxW){let out=String(text??'');if(cx.measureText(out).width<=maxW)return out;while(out.length>2&&cx.measureText(out+'…').width>maxW)out=out.slice(0,-1);return out+'…';}
function drawShopCard(item,x,y,w,h,recommended=false){
  const can=shopCanAfford(item),pulse=.45+.35*Math.sin((performance.now()/1000)*5.2),col=item.color||'#8edbff';cx.fillStyle=item.maxed?'rgba(18,58,44,.44)':'rgba(4,12,25,.80)';cx.strokeStyle=recommended?hexA('#fff09a',.62+pulse*.32):item.maxed?'rgba(166,255,95,.36)':can?hexA(col,.42):'rgba(255,100,125,.22)';cx.lineWidth=recommended?2.2:1.2;rr(x,y,w,h,12);cx.fill();cx.stroke();cx.lineWidth=1;
  const d=Math.min(40,h-18);drawShopIcon(item,x+8,y+(h-d)/2,d);const tx=x+d+16,textW=Math.max(32,w-(tx-x)-10);cx.textAlign='left';cx.fillStyle=item.maxed?'#b8ff7d':'#effaff';cx.font=`900 ${mobileUI()?9.5:11}px system-ui`;cx.fillText(shopFitText(`${recommended?'★ ':''}${item.name}`,textW),tx,y+16);cx.fillStyle='#8fa8ba';cx.font=`700 ${mobileUI()?7.3:8.5}px system-ui`;cx.fillText(shopFitText(item.desc||'',textW),tx,y+31);
  let stock='',badge='';if(item.kind==='supply'){stock=`RESERVA ${item.stock}/${item.max}`;badge=`x${item.stock}`;}else if(item.kind==='power'&&!storeInRun()){stock=`RESERVA ${item.stock}/${powerStockCap()}`;badge=`x${item.stock}`;}else if(item.kind==='power'){const r=G?.powerRanks?.[item.key]||0;stock=r?`RANGO ${powerVisualTag(item.key,r)}`:'NUEVO';badge=r?powerVisualTag(item.key,r):'+';}else if(item.kind==='branch'){stock=`CONFIG. ${item.stock}`;badge=item.stock==='—'?'A/B':item.stock;}else if(item.kind==='upgrade'){stock=`NIVEL ${item.stock}/${item.max}`;badge=`N${item.stock}`;}else if(item.kind==='doctrine'||item.kind==='policy'||item.kind==='loadout'||item.kind==='loadoutsave'){stock=item.stock;badge=item.icon;}else if(item.kind==='mastery'){stock=`${item.stock} · ${comboMasteryCount(item.key)} activ.`;badge=item.stock;}else if(item.kind==='briefing'){stock=`SECTOR ${storeContextSector()} · LISTAS ${item.stock}`;badge='⌖';}cx.fillStyle='#6fe7ff';cx.font='800 8px system-ui';cx.fillText(stock,tx,y+h-10);
  if(badge){const bw=Math.max(24,cx.measureText(badge).width+12),bx=x+w-bw-8,by=y+7;cx.fillStyle='rgba(3,13,26,.92)';cx.strokeStyle=hexA(col,.72);rr(bx,by,bw,19,9);cx.fill();cx.stroke();cx.textAlign='center';cx.fillStyle=col;cx.font='900 9px system-ui';cx.fillText(badge,bx+bw/2,by+10);cx.textAlign='left';}
  cx.textAlign='right';cx.fillStyle=item.maxed?'#a6ff5f':can?'#ffd76a':'#ff758b';cx.font=`900 ${mobileUI()?8.5:10}px system-ui`;let price=item.maxed?'MÁXIMO':`¤ ${item.cost}`;if(item.kind==='power'&&storeInRun())price=item.useXp?`XP ${item.xp}`:`¤ ${item.cost} / XP ${item.xp}`;if(item.kind==='doctrine'||item.kind==='policy')price='CAMBIAR';if(item.kind==='loadout')price='APLICAR';if(item.kind==='loadoutsave')price='GUARDAR';if(item.kind==='mastery')price=item.maxed?'DOMINADA':'POR USO';if(item.kind==='briefing')price='LECTURA';cx.fillText(price,x+w-10,y+h-10);cx.textAlign='left';if(item.kind!=='mastery'&&item.kind!=='briefing')UI.buttons.push({id:`shop_${item.kind}_${item.key}`,x,y,w,h});
}
function drawStore(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.91)';cx.fillRect(0,0,W,H);const mobile=mobileUI(),portrait=portraitUI(),m=mobile?10:22;cx.textAlign='left';cx.fillStyle='#ffb7e8';cx.font=`950 ${mobile?18:27}px system-ui`;cx.fillText(portrait?'HANGAR // TÁCTICO':'HANGAR // COMPRA TÁCTICA',m,mobile?22:34);cx.fillStyle='#ffd76a';cx.font=`800 ${mobile?8:11}px system-ui`;const wallet=storeInRun()?`¤ ${G.credits.toLocaleString()} · XP ${Math.round(G.xp||0).toLocaleString()}`:`¤ ${G.credits.toLocaleString()} · RESERVAS PERSISTENTES`;const d=hangarDoctrine(),rp=reservePolicy();cx.fillText(`${wallet} · ACTIVOS ${activePowerSlotLimit()} · COLA ${queuedPowerSlotLimit()} · STOCK ${powerStockCap()} · CAP ${rankRoman(powerRankCap(storeContextSector()))} · ${d.icon}${d.name} · ${rp.icon}${rp.name} · ▣L${hangarLoadoutSlot()}`,m,mobile?39:55);
  const tabs=mobile?[['smart','★SMART'],['powers','✦PWR'],['evolution','◇EVOL'],['fusion','ΣFUS'],['support','♥SUP'],['upgrades','⬢MEJ']]:[['smart','★ SMART'],['powers','✦ PODERES'],['evolution','◇ EVOL.'],['fusion','Σ FUSIONES'],['support','♥ SOPORTE'],['upgrades','⬢ MEJORAS']],tabY=mobile?47:66,gap=mobile?3:7,tw=(W-m*2-gap*5)/6,th=mobile?27:32;tabs.forEach(([id,label],i)=>uiButton(`store_tab_${id}`,label,m+i*(tw+gap),tabY,tw,th,storeTab===id?'#fff09a':id==='evolution'||id==='fusion'?'#d9a7ff':'#8edbff'));
  const all=shopCatalog(storeTab),top=tabY+th+(mobile?7:12),bottom=mobile?41:54,cols=portrait?2:(mobile?3:4),cg=mobile?5:10,rowH=portrait?68:mobile?66:82,cw=(W-m*2-cg*(cols-1))/cols,rowsFit=Math.max(1,Math.floor((H-top-bottom+cg)/(rowH+cg))),pageSize=cols*rowsFit,maxPage=Math.max(0,Math.ceil(all.length/pageSize)-1);storePage=clamp(storePage,0,maxPage);const pageItems=all.slice(storePage*pageSize,storePage*pageSize+pageSize),recommended=new Set(shopCatalog('smart').slice(0,4).map(i=>`${i.kind}:${i.key}`));
  pageItems.forEach((item,i)=>{const col=i%cols,row=(i/cols)|0,x=m+col*(cw+cg),y=top+row*(rowH+cg);drawShopCard(item,x,y,cw,rowH,recommended.has(`${item.kind}:${item.key}`));});
  const navY=H-(mobile?34:43);uiButton('store_close','← VOLVER',m,navY,mobile?86:118,mobile?27:32,'#8edbff');if(maxPage>0){uiButton('store_prev','‹',W/2-72,navY,42,mobile?27:32,'#8edbff');cx.fillStyle='#9fb4c5';cx.font='800 9px system-ui';cx.textAlign='center';cx.fillText(`${storePage+1}/${maxPage+1}`,W/2,navY+(mobile?14:16));uiButton('store_next','›',W/2+30,navY,42,mobile?27:32,'#8edbff');}
  cx.textAlign='right';cx.fillStyle='#8297a6';cx.font=`700 ${mobile?7.5:9}px system-ui`;cx.fillText(portrait?'★ SMART dinámico':'★ = compra inteligente sugerida · el brillo se adapta a vida, shield, mundo y horda',W-m,navY+(mobile?15:18));cx.textAlign='left';
}

function drawVictory(){
  if(G?.mode==='chase')return drawChaseVictory();
  UI.buttons.length=0;drawBackground();const sec=SECTORS[G.sector-1],training=G.mode==='training',rush=G.mode==='bossRush'&&G.bossRushComplete,fullFinale=!!G.campaignComplete&&!rush,chapterFinale=!!G.chapterComplete&&!fullFinale&&!rush,ch=chapterForSector(G.completedChapterId?chapterById(G.completedChapterId).end:G.sector);cx.fillStyle='rgba(0,0,0,.62)';cx.fillRect(0,0,W,H);
  if(rush||fullFinale||chapterFinale){cx.save();cx.globalAlpha=.18;cx.strokeStyle=rush?'#fff09a':fullFinale?'#d9a7ff':ch.accent;cx.lineWidth=2;for(let i=0;i<5;i++){cx.beginPath();cx.arc(W/2,H*.30,80+i*34+Math.sin((G.elapsed||0)*1.3+i)*8,0,TAU);cx.stroke();}cx.restore();}
  cx.textAlign='center';cx.fillStyle=rush?'#fff09a':fullFinale?'#d9a7ff':chapterFinale?ch.accent:training?'#8edbff':sec.accent;cx.font=`900 ${Math.min(40,W*.052)}px system-ui`;cx.fillText(rush?(G.bossRushChapter==='grand'?'GRAN BOSS RUSH COMPLETADO':`BOSS RUSH · CAP ${G.bossRushChapter} COMPLETADO`):fullFinale?'CAMPAÑA COMPLETADA':chapterFinale?`${ch.title} COMPLETADO`:training?'ENTRENAMIENTO COMPLETADO':'SECTOR SUPERADO',W/2,H*.15);
  cx.fillStyle='#fff';cx.font='900 22px system-ui';cx.fillText(rush?`RANGO ${G.bossRushRank||bossRushRank(G.bossRushResults)}`:(fullFinale||chapterFinale)?sec.boss:training?'CONTROL, ESQUIVA Y COMBATE VERIFICADOS':sec.boss,W/2,H*.215);
  cx.fillStyle='#b7c8d4';cx.font='700 11px system-ui';
  if(rush){const st=G.bossRushChapter==='grand'?META.grandBossRush:(META.bossRushStats[G.bossRushChapter]||{});cx.fillText(`PUNTOS ${G.score.toLocaleString()} · ${G.bossRushTime.toFixed(1)}s · PREMIO ¤ ${G.bossRushReward||0}`,W/2,H*.265);const grades=(G.bossRushResults||[]).map(r=>r.grade);cx.fillStyle='#9fe6ff';cx.font='900 11px system-ui';cx.fillText(`JEFES · ${grades.join('  ')}`,W/2,H*.31);cx.fillStyle='#899fac';cx.font='700 9.5px system-ui';cx.fillText(`MEJOR RANGO ${st.bestRank||'-'} · MEJOR TIEMPO ${st.bestTime?st.bestTime.toFixed(1)+'s':'-'} · VICTORIAS ${st.wins||0}`,W/2,H*.345);drawRelicStrip(H*.38,compactUI()?.78:.9);
  }else if(fullFinale){cx.fillText(`PUNTOS ${G.score.toLocaleString()} · BONUS FINAL ¤ ${G.finalReward||0} · CAMPAÑAS ${META.fullCampaignWins||0}`,W/2,H*.27);cx.fillStyle='#d9a7ff';cx.font='900 12px system-ui';cx.fillText(`☠ GRAN BOSS RUSH ${grandBossRushAvailable()?'DESBLOQUEADO':'PENDIENTE'} · ${plannedSectorCount()} LINAJES`,W/2,H*.315);drawRelicStrip(H*.35,compactUI()?.78:.9);cx.fillStyle='#9fe6ff';cx.font='700 10px system-ui';cx.fillText(`MEJOR CAMPAÑA ${META.bestFullCampaignScore.toLocaleString()} · ${expansionStatusLabel()}`,W/2,H*.435);
  }else if(chapterFinale){const next=nextImplementedSector(G.sector),st=META.bossRushStats[ch.id]||{};cx.fillText(`PUNTOS ${G.score.toLocaleString()} · BONUS CAPÍTULO ¤ ${G.finalReward||0} · VICTORIAS CAP ${ch.id} ${META.chapterWins[ch.id]||0}`,W/2,H*.27);cx.fillStyle=ch.accent;cx.font='900 12px system-ui';cx.fillText(`☠ BOSS RUSH · CAP ${ch.id} ${chapterBossesDefeated(ch.id)?'DESBLOQUEADO':'PENDIENTE'}`,W/2,H*.315);drawRelicStrip(H*.35,compactUI()?.78:.9);cx.fillStyle='#9fe6ff';cx.font='700 10px system-ui';cx.fillText(`MEJOR CAPÍTULO ${Number(META.bestChapterScore[ch.id]||0).toLocaleString()} · RUSH ${st.bestRank||'-'} · ${next?`SIGUIENTE: SECTOR ${next}`:'CAPÍTULO II EN PREPARACIÓN'} · ${expansionStatusLabel()}`,W/2,H*.435);
  }else if(training){cx.fillText(`OBJETIVOS ${G.kills} · AMENAZAS FRONTALES ${G.frontKills||0}`,W/2,H*.30);
  }else{cx.fillText(`PUNTOS ${G.score.toLocaleString()} · CRÉDITOS ¤ ${G.credits.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()}`,W/2,H*.30);if(G.lastBossDrop){cx.fillStyle='#ffd76a';cx.font='800 11px system-ui';cx.fillText(`HERENCIA DESBLOQUEADA · ${HERITAGE_NAMES[G.sector]||POWERS[G.lastBossDrop]?.name||''}`,W/2,H*.355);}if(G.lastRelic&&RELICS[G.lastRelic]){const r=RELICS[G.lastRelic];cx.fillStyle=r.color;cx.font='900 11px system-ui';cx.fillText(`${r.icon} RELIQUIA ASEGURADA · ${r.name} · ${r.desc}`,W/2,H*.395);}if(G.bossMasteryAchieved){cx.fillStyle='#fff09a';cx.font='900 11px system-ui';cx.fillText('★ MAESTRÍA DE JEFE · SIN IMPACTOS',W/2,H*.435);}if(G.waveMedals?.length){cx.fillStyle='#9fe6ff';cx.font='800 10px system-ui';cx.fillText(`ORDAS · ${G.waveMedals.slice(-3).map(m=>m.grade).join(' · ')} · BONUS ¤ ${G.bonusCredits||0}`,W/2,H*.47);}}
  const w=Math.min(310,W*.34),h=50,x=W/2-w/2;
  if(rush){const rh=compactUI()?40:46;uiButton('victory_bossrush',G.bossRushChapter==='grand'?'↻ REPETIR GRAN BOSS RUSH':`↻ REPETIR RUSH CAP ${G.bossRushChapter}`,x,H*.50,w,rh,'#fff09a');uiButton('victory_chase','🎯 CHASE BONUS · VISTA TRASERA',x,H*.61,w,rh,'#7cf6ff','modo shooter bonus');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.72,w,rh,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.83,w,rh,'#8edbff');}
  else if(fullFinale){if(grandBossRushAvailable())uiButton('victory_grandrush','☠ GRAN BOSS RUSH',x,H*.52,w,h,'#d9a7ff',`${plannedSectorCount()} soberanos consecutivos`);uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.65,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.78,w,h,'#8edbff');}
  else if(chapterFinale){const next=nextImplementedSector(G.sector);if(next)uiButton('victory_next_chapter',`▶ CONTINUAR AL SECTOR ${next}`,x,H*.50,w,h,'#a6ff5f',chapterForSector(next).title);else if(chapterBossesDefeated(ch.id))uiButton('victory_bossrush',`☠ BOSS RUSH · CAP ${ch.id}`,x,H*.50,w,h,'#fff09a',`${chapterBossCount(ch.id)} soberanos consecutivos`);uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.64,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.78,w,h,'#8edbff');}
  else if(training){uiButton('victory_new','▶ INICIAR CAMPAÑA',x,H*.48,w,h,'#a6ff5f');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.62,w,h,'#8edbff');}
  else{if(G.sector<activeSectorCount())uiButton('victory_next',`▶ ENTRAR AL SECTOR ${G.sector+1}`,x,H*.54,w,h,'#a6ff5f',SECTORS[G.sector].name);else uiButton('victory_new','↻ NUEVA CAMPAÑA',x,H*.54,w,h,'#a6ff5f','reiniciar capítulo activo');uiButton('victory_store','🛒 MEJORAR HANGAR',x,H*.67,w,h,'#ffb7e8');uiButton('victory_menu','MENÚ PRINCIPAL',x,H*.80,w,h,'#8edbff');}cx.textAlign='left';
}
function drawDead(){UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(0,0,0,.68)';cx.fillRect(0,0,W,H);cx.textAlign='center';cx.fillStyle='#ff667d';cx.font=`900 ${Math.min(43,W*.055)}px system-ui`;cx.fillText('NAVE PERDIDA',W/2,H*.19);cx.fillStyle='#fff';cx.font='800 14px system-ui';cx.fillText(`PUNTOS ${G.score.toLocaleString()} · RÉCORD ${META.hiScore.toLocaleString()} · SECTOR ${G.sector}`,W/2,H*.27);const w=Math.min(310,W*.40),x=W/2-w/2,h=44,life=supplyStock('life'),lifeCost=extraLifeCost(),canBuyLife=G.credits>=lifeCost;uiButton('dead_life',life?`♥ USAR VIDA EXTRA · x${life}`:`♥ COMPRAR VIDA · ¤ ${lifeCost}`,x,H*.35,w,h,life||canBuyLife?'#ff6f89':'#5c4250',life?'revive aquí · 62% HP · 48% shield':'compra y revive en el mismo combate');uiButton('dead_retry',bossLossCheckpointFor(G.sector)?'↻ REINTENTAR JEFE 50%':'↻ REINTENTAR SECTOR',x,H*.47,w,h,'#a6ff5f');if(hasSave())uiButton('dead_load','▣ CARGAR CHECKPOINT',x,H*.59,w,h,'#7dc8ff');uiButton('dead_menu','MENÚ PRINCIPAL',x,H*.72,w,h,'#ffb7e8');cx.fillStyle='#92a8b8';cx.font='700 9px system-ui';cx.fillText('La VIDA EXTRA es alternativa al checkpoint: conserva este combate y limpia proyectiles inmediatos.',W/2,H*.84);cx.textAlign='left';}
function drawGuide(){
  UI.buttons.length=0;drawBackground();cx.fillStyle='rgba(2,6,14,.84)';cx.fillRect(0,0,W,H);const profile=uiProfile(),portrait=profile==='MOBILE_PORTRAIT',mobile=mobileUI();cx.textAlign='center';cx.fillStyle='#a6ff5f';cx.font=`900 ${mobile?20:30}px system-ui`;cx.fillText('MANUAL DE SUPERVIVENCIA',W/2,mobile?28:40);
  const pages=[
    {title:'CONTROLES',cards:[['MOVER','Sin clic. En PC la nave sigue mouse/touchpad; en móvil desliza el dedo por una zona libre.','move'],['DISPARO AUTOMÁTICO','No hay botón de fuego. Posiciónate, limpia corredores y mantén la cadencia.','shoot'],['CONTROL DIRECTO','Sin joystick ni DASH. El estabilizador del Hangar mejora la precisión.','move']]},
    {title:'COMBATE',cards:[['PODERES Y COMBOS','Cuatro poderes activos de base; Bahía XL permite cinco, el Bastidor hasta siete en reserva y Sobreflujo habilita un poder extra temporal. Ramas A/B y VI/VII cambian función/VFX; duplicados al límite pueden cargar RIFT APEX.','powers'],['AMENAZAS FRONTALES','Meteoros, arietes, cápsulas y restos llegan hacia cámara. Interceptarlos pronto paga mejor.','front'],['JEFES Y FASES',`Los ${activeSectorCount()} jefes activos mutan en tres fases y abren brevemente el núcleo tras ataques importantes.`,'boss']]},
    {title:'PROGRESIÓN',cards:[['REPETIR Y CHECKPOINTS','Entrena, repite sectores y salta a la arena del jefe con 50% de vida.','replay'],['HANGAR PERMANENTE','Casco, escudo, daño, motor, drones y otras mejoras persisten. Tres Matrices de Carga guardan doctrina, reservas y ramas A/B.','hangar'],['XP, RANGOS Y HERENCIAS','Los poderes evolucionan hasta VII con Matriz; rangos VI/VII se ven distintos y los jefes transmiten herencias al siguiente sector.','progress']]}
  ];guidePage=clamp(guidePage,0,pages.length-1);const page=pages[guidePage];cx.fillStyle='#d9ecf8';cx.font=`800 ${mobile?10:13}px system-ui`;cx.fillText(`${guidePage+1}/${pages.length} · ${page.title}`,W/2,mobile?47:62);
  if(portrait){const m=14,top=60,gap=6,ch=(H-top-52-gap*2)/3;page.cards.forEach((it,i)=>{const x=m,y=top+i*(ch+gap),cw=W-m*2;cx.fillStyle='rgba(4,12,25,.72)';cx.strokeStyle='rgba(99,246,255,.18)';rr(x,y,cw,ch,12);cx.fill();cx.stroke();drawGuideThumb(it[2],x+8,y+8,92,ch-16);cx.textAlign='left';cx.fillStyle='#7ef4ff';cx.font='900 10px system-ui';cx.fillText(it[0],x+110,y+20);cx.fillStyle='#d3e0ea';cx.font='600 8.5px system-ui';drawTextLines(it[1],x+110,y+38,cw-122,12);});}
  else{const margin=mobile?14:Math.max(32,W*.08),top=mobile?62:84,gap=mobile?8:18,cw=(W-margin*2-gap*2)/3,ch=Math.min(mobile?H-top-50:250,H-top-84);page.cards.forEach((it,i)=>{const x=margin+i*(cw+gap),y=top;cx.fillStyle='rgba(4,12,25,.72)';cx.strokeStyle='rgba(99,246,255,.18)';rr(x,y,cw,ch,14);cx.fill();cx.stroke();drawGuideThumb(it[2],x+8,y+8,cw-16,mobile?64:88);cx.textAlign='left';cx.fillStyle='#7ef4ff';cx.font=`900 ${mobile?10:13}px system-ui`;cx.fillText(it[0],x+12,y+(mobile?86:116));cx.fillStyle='#d3e0ea';cx.font=`600 ${mobile?8.5:10.8}px system-ui`;drawTextLines(it[1],x+12,y+(mobile?102:138),cw-24,mobile?12:15);});}
  const by=H-38;uiButton('guide_prev','‹',12,by,72,28,guidePage>0?'#8edbff':'#526575');uiButton('guide_back','MENÚ',W/2-45,by,90,28,'#a6ff5f');uiButton('guide_next','›',W-84,by,72,28,guidePage<pages.length-1?'#8edbff':'#526575');cx.textAlign='left';
}

function drawTextLines(text,x,y,maxW,lineH){const words=text.split(' ');let line='',yy=y;for(const word of words){const test=line+word+' ';if(cx.measureText(test).width>maxW&&line){cx.fillText(line.trim(),x,yy);yy+=lineH;line=word+' ';}else line=test;}if(line)cx.fillText(line.trim(),x,yy);}

function handleTap(x,y){
  if(!G)return;const hit=[...UI.buttons].reverse().find(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);if(!hit)return;AudioX.unlock();const overlayAudioPaused=!!(MusicX.uiSnapshot&&['PAUSE','STORE'].includes(G.screen));if(!overlayAudioPaused){PreBossX.prime((G.screen==='MENU'?menuSector:G.sector)||1);MusicX.primeBoss((G.screen==='MENU'?menuSector:G.sector)||1);}const id=hit.id;
  if(id==='menu_difficulty'){toggleDifficulty();return;}if(id==='menu_playlist'){MusicX.stop(false);PlaylistX.select(META.playlistTrack||0,false);setScreen('PLAYLIST');return;}if(id==='menu_new'){newRun(1,'campaign',META.selectedDifficulty);return;}if(id==='menu_chase'){startChaseBonus();return;}if(id==='menu_bossrush'){startBossRush(chapterForSector(menuSector).id);return;}if(id==='menu_grandrush'){startGrandBossRush();return;}if(id==='menu_training'){if(rushSpec(chapterForSector(menuSector).id).complete&&compactUI())startBossRush(chapterForSector(menuSector).id);else startTraining();return;}if(id==='menu_load'){if(!loadRun())notify('NO HAY CHECKPOINT','#ff7188',1.6);return;}if(id==='menu_guide'){guidePage=0;setScreen('GUIDE');return;}if(id==='menu_store'){G.credits=META.credits;openStore('MENU');return;}
  if(id.startsWith('playlist_track_')){PlaylistX.select(Number(id.split('_').pop()),true);return;}if(id==='playlist_toggle'){PlaylistX.toggle();return;}if(id==='playlist_prev'){PlaylistX.prev(true);return;}if(id==='playlist_next'){PlaylistX.next(true);return;}if(id==='playlist_back'){PlaylistX.stop();setScreen('MENU');return;}
  if(id==='sector_prev'){menuSector=Math.max(1,menuSector-1);streamPrepareMenu(menuSector);return;}if(id==='sector_next'){menuSector=Math.min(activeSectorCount(),META.unlocked,menuSector+1);streamPrepareMenu(menuSector);return;}if(id==='sector_start'){newRun(menuSector,'campaign',META.selectedDifficulty);return;}if(id==='sector_boss'){startBossCheckpoint(menuSector);return;}
  if(id==='pause_resume'){resumeGame();return;}if(id==='pause_save'){if(G.mode==='chase'){return;}if(G.mode==='bossRush')notify('BOSS RUSH · SIN CHECKPOINTS','#fff09a',1.7);else saveRun();return;}if(id==='pause_store'){openStore('PAUSE');return;}if(id==='pause_menu'){MusicX.stop(false);AudioX.stopBoss();META.credits=G.credits;saveMeta();setScreen('MENU');return;}
  if(id.startsWith('store_tab_')){storeTab=id.slice(10);storePage=0;return;}if(id==='shop_doctrine_hangar'){cycleHangarDoctrine();storePage=0;return;}if(id==='shop_policy_reserve'){cycleReservePolicy();storePage=0;return;}if(id==='shop_loadout_cycle'){cycleHangarLoadout();storePage=0;return;}if(id==='shop_loadoutsave_save'){saveHangarLoadout();storePage=0;return;}if(id==='store_prev'){storePage=Math.max(0,storePage-1);return;}if(id==='store_next'){storePage++;return;}if(id.startsWith('shop_upgrade_')){buyUpgrade(id.slice(13));return;}if(id.startsWith('shop_branch_')){buyPowerBranch(id.slice(12));return;}if(id.startsWith('shop_supply_')){buySupply(id.slice(12));return;}if(id.startsWith('shop_power_')){buyShopPower(id.slice(11));return;}if(id==='store_power_prev'){storePowerOffset=Math.max(0,storePowerOffset-1);return;}if(id==='store_power_next'){storePowerOffset=Math.min(Math.max(0,powerShopAvailableKeys().length-1),storePowerOffset+1);return;}if(id.startsWith('buy_')){buyUpgrade(id.slice(4));return;}if(id==='store_close'){closeStore();return;}
  if(id==='victory_chase'){startChaseBonus();return;}if(id==='victory_bossrush'){startBossRush(G.completedChapterId||G.bossRushChapter||chapterForSector(G.sector).id);return;}if(id==='victory_grandrush'){startGrandBossRush();return;}if(id==='victory_next_chapter'){const next=nextImplementedSector(G.sector);if(next){G.chapterComplete=false;enterSector(next,true);PreBossX.prime(next);setScreen('GAME');saveRun();}return;}if(id==='victory_next'){const next=G.sector+1;enterSector(next,true);PreBossX.prime(next);setScreen('GAME');saveRun();return;}if(id==='victory_new'){newRun(1);return;}if(id==='victory_store'){shopReturn='VICTORY';setScreen('STORE');return;}if(id==='victory_menu'){MusicX.stop(false);setScreen('MENU');return;}
  if(id==='dead_life'){buyOrUseExtraLife();return;}if(id==='dead_retry'){if(G.mode==='training')startTraining();else if(bossLossCheckpointFor(G.sector))startBossLossCheckpoint();else if(G.bossCheckpoint)startBossCheckpoint(G.sector);else newRun(G.sector);return;}if(id==='dead_load'){loadRun();return;}if(id==='dead_menu'){MusicX.stop(false);setScreen('MENU');return;}if(id==='guide_prev'){guidePage=Math.max(0,guidePage-1);return;}if(id==='guide_next'){guidePage=Math.min(2,guidePage+1);return;}if(id==='guide_back'){setScreen('MENU');return;}
}

// ─────────────────────────────────────────────────────────────
// MAIN RENDER LOOP
// ─────────────────────────────────────────────────────────────
function render(){
  if(!G)return;switch(G.screen){case'GAME':drawGame();break;case'PAUSE':drawPause();break;case'STORE':drawStore();break;case'VICTORY':drawVictory();break;case'DEAD':drawDead();break;case'GUIDE':drawGuide();break;case'PLAYLIST':drawPlaylist();break;default:drawMenu();}
}
function loop(now){const rawDt=Math.max(.001,(now-lastT)/1000);performanceGovernorTick(rawDt);const dt=Math.min(.033,rawDt);lastT=now;update(dt);render();requestAnimationFrame(loop);}

// Initialize menu state after data and helpers exist.
G={screen:'MENU',mode:'campaign',runDifficulty:META.selectedDifficulty||'normal',sector:1,wave:1,score:0,hiScore:META.hiScore||0,credits:META.credits||0,player:makePlayer(),enemies:[],bullets:[],eBullets:[],pickups:[],particles:[],obstacles:[],frontThreats:[],powerMines:[],boss:null,powerMeter:0,powerDropsThisSector:0,powers:{},powerQueue:[],elapsed:0,kills:0,goal:1,combo:0,comboT:0,waveBanner:0,sectorBanner:0,xp:0,level:1,xpNext:120,maxActivePowers:activePowerSlotLimit(),maxQueuePowers:queuedPowerSlotLimit(),heritageNext:null,activeCombos:{},comboSeenThisRun:{},powerDropHistory:[],fusionSurgeT:0,fusionSurgeCd:0,fusionSurgeTier:0,overflowPowerKey:null,overflowPowerMax:0,apexCharge:0,apexT:0,apexMax:0,apexPulseT:0,masteryIVSeen:{},bossHitT:0,heartHitT:0,critWarned:false,lastBossDrop:null,frenzyT:0,frenzyWave:0,frenzyMult:1,frenzyKills:0,frenzyTarget:0,frenzyDone:false,frenzySupportUsed:false,bossWarningT:0,bossWarningText:'',bossCheckpoint:false,bossCheckpointKind:'',lostAtBoss:false,trainingBoss:false,preBossT:0,preBossMax:0,postBossT:0,postBossMax:0,frontTimer:7,frontKills:0,waveFrontKills:0,waveHits:0,waveStartT:0,waveMedals:[],powerRanks:{},bossHits:0,bossMasteryAchieved:false,bonusCredits:0,rewardLedger:{credits:{},xp:{}},pendingBossReward:null,bossRewardView:null,bossRushIndex:0,bossRushScore:0,bossRushChapter:0,bossRushStartSector:0,bossRushEndSector:0,bossRushComplete:false,bossRushResults:[],bossRushReward:0,bossRushRank:'',bossRushTime:0,bossStartElapsed:0,lastRelic:0,campaignComplete:false,chapterComplete:false,completedChapterId:0,finalReward:0,directorIndex:0,directorCooldown:0,directorHistory:[],directorPressureT:0,directorPressure:1,directorPhase:'RECONOCIMIENTO',transversalTimer:rnd(7.5,11.5),lieutenantSpawned:false,lieutenantKilled:false,preBossSetpieces:[],preBossCueStage:0,worldAmbientStarted:false,ambientProps:[],ambientPropTimer:rnd(1.0,2.0),worldEventTimer:rnd(15,22),worldEventHistory:[],worldEventCount:0,pressureReliefWave:0,shieldCriticalWarned:false,shieldHitT:0,bossArrivalStage:0,bossArrivalBanner:null,waveObjective:null,objectiveHistory:[],objectiveTargets:[],objectiveCapsule:null,emergencyHealthDrops:{half:false,quarter:false,critical:false},lieutenantQueue:[],lieutenantExpected:0,lieutenantKills:0,preBossEscalationActive:false,preBossEscalationId:'',commanderReinforceT:0,commanderSupportT:0,commanderSupportBudget:0,weaponBoostT:0,weaponBoostMult:1,weaponBoostStacks:0,microSwarmTimer:rnd(2.8,5.0),microKills:0,microSwarmBursts:0,microStreak:0,microStreakT:0,actionGapT:0,familyCalls:0,familyBossResponses:0,bossFamilySwarmTimer:0,familyPlayTimer:0,familyPlay:null,familyPlaySerial:0,familyPlayCount:0,familyPlayBreaks:0,behaviorSampleT:0,behaviorZoneT:{upper:0,center:0,lower:0},behaviorLastZone:'center',behaviorSwitches:0,behaviorRead:'UNREAD',behaviorConfidence:0,behaviorCounterPlays:0,recoveryGraceT:0,riftAlly:null,riftAllyUsed:false,lastChanceT:0,lastChanceMax:5,lastChanceRescued:false};
menuSector=clamp(META.unlocked||1,1,activeSectorCount());streamPrepareMenu(menuSector);setScreen('MENU');
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
requestAnimationFrame(loop);


window.__SWARM_BOSS_ANIM_STATUS=()=>({version:VERSION,framework:'boss-animation-complete-1-20',spriteGeneration:'localized-non-rigid-anatomical-warp',currentBoss:G?.boss?{family:G.boss.family,state:bossAnimState(G.boss),frame:bossAnimFrame(G.boss,bossAnimState(G.boss)),attackT:+(G.boss.animAttackT||0).toFixed(3),animated:bossAnimated(G.boss)}:null,finalAssets:{LANGOSTAS:WORLD_ENEMY_FILES.LANGOSTAS[3],MOSQUITOS:WORLD_ENEMY_FILES.MOSQUITOS[3],TERMITAS:WORLD_ENEMY_FILES.TERMITAS[3],'LIBÉLULAS':WORLD_ENEMY_FILES['LIBÉLULAS'][3],CIGARRAS:WORLD_ENEMY_FILES.CIGARRAS[3]},assetErrors:{...BOSS_ASSET_HEALTH.errors},animatedBosses:Object.fromEntries(Object.entries(BOSS_ANIMATIONS).map(([family,cfg])=>[family,{key:cfg.key,motion:cfg.motion,ready:Object.fromEntries(Object.entries(IMG.bossAnim[cfg.key]).map(([k,v])=>[k,{ready:imgReady(v),w:v.naturalWidth||0,h:v.naturalHeight||0,src:v.src||''}])),states:Object.keys(cfg.states),proceduralAnatomyDisabled:true}])),lieutenantAnimation:true,cacheBust:'boss-av=2137/ch2-av=2157 · app=21511'});
window.__SWARM_CHAPTER1_AUDIT=()=>({version:VERSION,bossAssetAnimation:{animated:['IMPERATRIX VESPA','ATLAS VERDE','CORTEX RAZOR','VELA NOCTIS','REGINA FERRUM','COLOSSUS HOP','SANGUINA PRIME','ARCHITECT ZERO','AURALIS','RESONATOR OMEGA'],pending:[]},signatureAttacks:{imperatrix:'AGUIJÓN SOLAR',atlas:'ONDA ATLAS',cortexRazor:'RAYO RAZOR 180°/250°/360°',vela:'ECLIPSE ROTATORIO',regina:'MALLA FÉRRICA',colossus:'IMPACTO COLOSSUS',sanguina:'SIFÓN HEMÁTICO',architect:'JAULA DE RESINA',auralis:'CRUZ PRISMÁTICA',resonator:'ONDA OMEGA'},chaseBonus:{enabled:true,duration:68,view:'rear/chase',aim:'mouse/touch + full-screen ship follow',autofire:true,lockOn:true,shieldSupport:true,overdrive:true,shootablePowers:true,explosions:true,floatingScore:true,killStreak:true,stages:3,rank:true},waveLength:'~6–8% más larga',storeQuantities:'badge visible',compactMessages:'one-line visible',frenzySupport:'1 adaptive drop per frenzy'});
window.__SWARM_SIGNATURE_STATUS=()=>({version:VERSION,configured:Object.fromEntries(Object.entries(BOSS_SIGNATURE_ATTACKS).map(([k,v])=>[k,{name:v.name,wind:v.wind,active:v.active,cool:v.cool}])),razor:{name:'RAYO RAZOR',phases:['180°','250°','360°']},current:G?.boss?{pattern:G.boss.pattern,phase:G.boss.phase,active:G.boss.signatureAttack?.stage||((G.boss.razorBeamT||G.boss.razorBeamWind)?'razor':'none'),cool:+(G.boss.signatureAttackCd||0).toFixed(2)}:null});

window.__SWARM_V2134_STATUS=()=>({version:VERSION,chase:{duration:G?.chase?.duration||68,stage:G?.chase?chaseStage(G.chase):0,lockOn:true,supportEveryKills:7,shield:true,overdrive:true,shootablePowers:true,freeMovement:true},chapter1:{bossesAnimated:Object.keys(BOSS_ANIMATIONS).length,signatureBosses:Object.keys(BOSS_SIGNATURE_ATTACKS).length+1,worlds:SECTORS.length},ui:{compactNoticeLine:true,noticeCap:2},resources:{frenzyAdaptiveSupport:true}});

window.__SWARM_V2137_STATUS=()=>({version:VERSION,baseCompatibility:'v2.13.6 saves + systems',chase:{enabled:true,duration:G?.chase?.duration||68,freeMovement:'X+Y',shipScale:'larger',shieldStart:G?.chase?.shield??45,powerDrops:G?.chase?.powerDrops?.length||0,streak:G?.chase?.streak||0,bestStreak:G?.chase?.bestStreak||0},bossIdentity:{colossus:BOSS_ANIMATIONS.LANGOSTAS.motion,sanguina:BOSS_ANIMATIONS.MOSQUITOS.motion,architect:BOSS_ANIMATIONS.TERMITAS.motion,auralis:BOSS_ANIMATIONS['LIBÉLULAS'].motion,resonator:BOSS_ANIMATIONS.CIGARRAS.motion},bossAssets:{6:WORLD_ENEMY_FILES.LANGOSTAS[3],7:WORLD_ENEMY_FILES.MOSQUITOS[3],8:WORLD_ENEMY_FILES.TERMITAS[3],9:WORLD_ENEMY_FILES['LIBÉLULAS'][3],10:WORLD_ENEMY_FILES.CIGARRAS[3]},music:{worldPool:(WORLD_PLAYLISTS[G?.sector||1]||[]).map(t=>t.label),bossPool:MusicX.bossPlaylist.map(t=>t.title),bossCurrent:MusicX.currentTrack?.title||'',worldCurrent:PreBossX.track?.label||''}});

window.__SWARM_V2142_HANGAR_STATUS=()=>({version:VERSION,powers:{total:POWER_KEYS.length,activeBase:POWER_SLOT_LIMIT,activeMax:activePowerSlotLimit(),queueBase:POWER_QUEUE_LIMIT,queueMax:queuedPowerSlotLimit(),rankCap:powerRankCap(),rankLabel:rankRoman(powerRankCap()),dropBudget:powerDropBudget(),adaptiveDrops:true,overflowRecycle:true},branches:{unlocked:powerBranchUnlocked(),available:Object.keys(POWER_BRANCHES).length,selected:{...(META.powerBranches||{})},visualDNA:true},hangar:{evolutionUpgrades:[...EVOLUTION_UPGRADE_IDS],reactor:up('reactor'),powerbay:up('powerbay'),reservebay:up('reservebay'),evolution:up('evolution'),synergy:up('synergy'),recycler:up('recycler')},hud:{showsAllActive:true,showsQueue:true,branchBadges:true,ascensionBadges:true,comboSynergy:true},chapterIIStarted:activeSectorCount()>=20});
window.__SWARM_V2143_HANGAR_STATUS=()=>({version:VERSION,powers:{total:POWER_KEYS.length,new:['ionweb','orbitblade'],stockCap:powerStockCap(),dropBudget:powerDropBudget(),antiRepeatHistory:[...(G?.powerDropHistory||[])]},doctrine:{key:hangarDoctrineKey(),...hangarDoctrine()},reserves:{key:reservePolicyKey(),...reservePolicy()},fusion:{combos:Object.keys(COMBOS).length,active:Object.keys(G?.activeCombos||{}).length,masteryTotal:totalComboMastery(),surgeT:Number((G?.fusionSurgeT||0).toFixed(2)),surgeCd:Number((G?.fusionSurgeCd||0).toFixed(2))},branches:{available:Object.keys(POWER_BRANCHES).length},chapterIIStarted:activeSectorCount()>=20});
window.__SWARM_V2144_STATUS=()=>({version:VERSION,chapterIIStarted:activeSectorCount()>=20,powers:{total:POWER_KEYS.length,baseActive:POWER_SLOT_LIMIT,maxActive:activePowerSlotLimit(),overflowUpgrade:up('overclock'),overflowActive:overflowPowerActive(),overflowKey:G?.overflowPowerKey||null,queueMax:queuedPowerSlotLimit()},fusion:{combos:Object.keys(COMBOS).length,tier:G?.fusionSurgeTier||0,label:fusionSurgeLabel(),damageMult:fusionSurgeDamageMult()},countermeasures:{sector:G?.sector||storeContextSector(),label:bossCounterSpec(G?.sector||storeContextSector()).label,keys:bossCounterKeys(G?.sector||storeContextSector()),active:bossCounterActiveCount(),damageMult:bossCounterDamageMult()},vfx:{adaptive:true,particles:G?.particles?.length||0,budgetScale:vfxBudgetScale()},hangar:{briefing:true,doctrine:hangarDoctrineKey(),reservePolicy:reservePolicyKey()},preserved:{worlds:activeSectorCount(),bossRush:true,chase:true,pwa:true}});
window.__SWARM_V2145_STATUS=()=>({version:VERSION,chapterIIStarted:activeSectorCount()>=20,hangar:{loadoutSlot:hangarLoadoutSlot(),loadout:hangarLoadoutData(),loadoutSummary:hangarLoadoutSummary(),doctrine:hangarDoctrineKey(),reservePolicy:reservePolicyKey()},apex:{upgrade:up('apexcore'),charge:G?.apexCharge||0,active:(G?.apexT||0)>0,time:Number((G?.apexT||0).toFixed(2)),damageMult:riftApexDamageMult(),rateMult:riftApexRateMult()},fusion:{combos:Object.keys(COMBOS).length,masteryIVPulse:true,masteryIVSeen:Object.keys(G?.masteryIVSeen||{}).length},powers:{total:POWER_KEYS.length,maxActive:activePowerSlotLimit(),overflowActive:overflowPowerActive()},preserved:{worlds:activeSectorCount(),bossRush:true,chase:true,pwa:true}});
window.__SWARM_V2150_STATUS=()=>({version:VERSION,worlds:activeSectorCount(),bosses:Object.keys(BOSS_ANIMATIONS).length,chapterII:{active:activeSectorCount()===20,assets:Object.keys(CH2_FAMILY_DEFS).length,backgroundPairs:10},microSwarm:{enabled:true,fromWorld:1,count:[4,10],kills:G?.microKills||0,timer:Number((G?.microSwarmTimer||0).toFixed(2)),countsForWave:false,buzz:'very-low'},riftAlly:{enabled:(G?.sector||0)>=11,pool:riftAllyPool(),active:G?.riftAlly?{name:G.riftAlly.name,time:Number(G.riftAlly.t.toFixed(2))}:null,used:!!G?.riftAllyUsed,duration:10},lastChance:{active:(G?.lastChanceT||0)>0,time:Number((G?.lastChanceT||0).toFixed(2)),manualLifeRescue:true,autoPurchase:false},difficulty:{hpInflationLimited:true,tempo:sectorTempo(G?.sector||1),balance:sectorBalance(G?.sector||1)},pwa:true});
window.__SWARM_V2151_STATUS=()=>({version:VERSION,worlds:activeSectorCount(),bosses:Object.keys(BOSS_ANIMATIONS).length,chapterII:{active:activeSectorCount()===20,assets:Object.keys(CH2_FAMILY_DEFS).length,backgroundPairs:10},microSwarm:{enabled:true,fromWorld:1,count:[4,10],formations:8,bursts:G?.microSwarmBursts||0,kills:G?.microKills||0,actionGap:+(G?.actionGapT||0).toFixed(2),countsForWave:false,forcedContinuity:true},difficulty:{hpInflationLimited:true,adaptive:adaptivePressure(),balance:sectorBalance(G?.sector||1)},riftAlly:{enabled:(G?.sector||0)>=11,duration:10,signature:G?.riftAlly?.signature||null,ch2Signatures:Object.keys(RIFT_ALLY_SIGNATURES).length},lastChance:{active:(G?.lastChanceT||0)>0,time:+(G?.lastChanceT||0).toFixed(2),manualLifeRescue:true,autoPurchase:false,allyContinues:true,recoveryGrace:+(G?.recoveryGraceT||0).toFixed(2)},pwa:true});
window.__SWARM_V2152_STATUS=()=>({version:VERSION,worlds:activeSectorCount(),bosses:Object.keys(BOSS_ANIMATIONS).length,familyCombat:{enabled:true,fromWorld:11,grammars:Object.keys(FAMILY_COMBAT_GRAMMAR).length,current:familyCombatGrammar()?.id||null,label:familyCombatGrammar()?.label||null,familyCalls:G?.familyCalls||0,bossResponses:G?.familyBossResponses||0,minorEscort:true,mediumCorridors:true,majorCalls:true,bossReactiveSwarm:G?.mode==='campaign'&&(G?.sector||0)>=11},microSwarm:{enabled:true,fromWorld:1,count:[4,10],countsForWave:false},difficulty:{hpInflationLimited:true,adaptive:adaptivePressure()},riftAlly:{enabled:(G?.sector||0)>=11,duration:10},lastChance:{manual:true,seconds:5,autoPurchase:false},pwa:true});
window.__SWARM_V2153_STATUS=()=>({version:VERSION,worlds:activeSectorCount(),bosses:Object.keys(BOSS_ANIMATIONS).length,familyCombat:{enabled:true,grammars:Object.keys(FAMILY_COMBAT_GRAMMAR).length,comboPlays:Object.keys(FAMILY_COMBO_PLAYS).length,fromWorld:11,advancedFromWorld:16,currentGrammar:familyCombatGrammar()?.id||null,currentPlay:G?.familyPlay?{id:G.familyPlay.key,label:G.familyPlay.label,stage:G.familyPlay.stage}:null,plays:G?.familyPlayCount||0,breaks:G?.familyPlayBreaks||0,telegraphed:true,requiresRoles:['major','medium','minor','minor'],hpInflation:false},microSwarm:{enabled:true,fromWorld:1,count:[4,10],countsForWave:false},difficulty:{hpInflationLimited:true,adaptive:adaptivePressure()},riftAlly:{enabled:(G?.sector||0)>=11,duration:10},lastChance:{manual:true,seconds:5,autoPurchase:false},pwa:true});

window.__SWARM_V2154_STATUS=()=>({version:VERSION,worlds:activeSectorCount(),bosses:Object.keys(BOSS_ANIMATIONS).length,adaptiveCounterplay:{enabled:true,fromWorld:16,sessionOnly:true,read:G?.behaviorRead||'UNREAD',confidence:+(G?.behaviorConfidence||0).toFixed(2),switches:G?.behaviorSwitches||0,counterPlays:G?.behaviorCounterPlays||0,telegraphPreserved:true,hpDamageCadenceUnchanged:true},familyCombat:{enabled:true,currentPlay:G?.familyPlay?{id:G.familyPlay.key,label:G.familyPlay.label,stage:G.familyPlay.stage,adapted:!!G.familyPlay.adapted}:null,plays:G?.familyPlayCount||0,breaks:G?.familyPlayBreaks||0},microSwarm:{enabled:true,fromWorld:1,count:[4,10],countsForWave:false},riftAlly:{enabled:(G?.sector||0)>=11,duration:10},lastChance:{manual:true,seconds:5,autoPurchase:false},pwa:true});
window.__SWARM_V2155_STATUS=()=>({version:VERSION,performanceGovernor:{enabled:true,sessionOnly:true,...performanceStatus(),priority:['vfx','ambient','micro-density','simultaneous-enemies'],preserves:{microSwarmMinimum:4,waveKills:true,hp:true,damage:true,bossRules:true,riftAlly:true,lastChance:true}},adaptiveCounterplay:{enabled:true,fromWorld:16},familyCombat:{enabled:true},pwa:true});
window.__SWARM_V2156_STATUS=()=>({version:VERSION,deviceProfiler:{...DEVICE,sessionOnly:true},framePacer:{jankAware:true,dynamicInternalResolution:true,...performanceStatus(),dprFloor:.85},priority:['internal-resolution','vfx','ambient','micro-density','simultaneous-enemies'],preserves:{microSwarmMinimum:4,waveKills:true,hp:true,damage:true,bossRules:true,riftAlly:true,lastChance:true,inputCadence:true},adaptiveCounterplay:{enabled:true,fromWorld:16},pwa:true});
window.__SWARM_V2141_HANGAR_STATUS=window.__SWARM_V2142_HANGAR_STATUS;

window.__SWARM_V2157_STATUS=()=>({version:VERSION,assetStreamer:streamStatus(),performance:performanceStatus(),chapterII:{worlds:10,lazyDecode:true,prefetchNext:DEVICE.class!=='LITE'&&PERF.tier!=='RECOVERY'},microSwarm:{fromWorld:1,min:4,max:10},riftAlly:{fromWorld:11,duration:10,onDemandBossAssets:true},lastChance:{seconds:5,manual:true}});
window.__SWARM_V2158_STATUS=()=>({version:VERSION,bossIdentityPass:{step:1,worlds:[11,12,13,14,15],complete:[11,12,13,14,15].every(w=>!!CH2_BOSS_IDENTITIES[w]),identities:Object.fromEntries([11,12,13,14,15].map(w=>[w,{name:CH2_BOSS_IDENTITIES[w].name,signature:CH2_BOSS_IDENTITIES[w].signature,phases:CH2_BOSS_IDENTITIES[w].phases,movement:CH2_BOSS_IDENTITIES[w].movement}]))},preserved:{worlds:activeSectorCount(),microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V2159_STATUS=()=>({version:VERSION,bossIdentityPass:{step:2,worlds:Object.keys(CH2_BOSS_IDENTITIES).map(Number),complete:Object.keys(CH2_BOSS_IDENTITIES).length===10,passII:[16,17,18,19,20].map(w=>({world:w,name:CH2_BOSS_IDENTITIES[w].name,signature:CH2_BOSS_IDENTITIES[w].signature,phases:CH2_BOSS_IDENTITIES[w].phases,movement:CH2_BOSS_IDENTITIES[w].movement}))},legacySuppression:{razorWorld19:true,genericSignatureMovementCH2:true},preserved:{worlds:activeSectorCount(),microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21510_STATUS=()=>({version:VERSION,animationAttackSync:{enabled:true,worlds:20,profiles:Object.keys(BOSS_ANIM_SYNC_PROFILES).length,signatureAnticipation:true,releaseFrameLock:true,anatomicalEmittersCH2:true,current:G?.boss?{world:G.sector,state:bossAnimState(G.boss),frame:bossAnimFrame(G.boss,bossAnimState(G.boss)),cue:G.boss.animCue?{state:G.boss.animCue.state,tag:G.boss.animCue.tag,elapsed:+G.boss.animCue.elapsed.toFixed(3),releaseAt:+G.boss.animCue.releaseAt.toFixed(3),releaseFrame:G.boss.animCue.releaseFrame}:null,emitter:bossAttackEmitter(G.boss)}:null},preserved:{bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21511_STATUS=()=>({version:VERSION,audioEventSync:{enabled:true,profiles:BOSS_AUDIO_PROFILES.length,events:['warn','release','impact','phase','death','allyIn','allyOut'],frameLockedRelease:true,projectileImpact:true,signatureImpact:true,riftAllyPortal:true,lastEvent:AudioX.lastBossEvent,counters:{...AudioX.bossEventCounters}},preserved:{animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21512_STATUS=()=>({version:VERSION,enemySonicEcology:{enabled:true,profiles:Object.keys(FAMILY_AUDIO_PROFILES).length,tiers:['mini','minor','medium','major'],events:['spawn','shot','death'],audioBudget:true,bossPriority:true,lastChancePriority:true,status:AudioX.enemyAudioStatus()},preserved:{bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21513_STATUS=()=>({version:VERSION,waveChoreographer:{enabled:true,worlds:Object.keys(CH2_WAVE_CHOREOGRAPHY).length,acts:30,current:waveActLabel(),spec:ch2WaveSpec()},preserved:{enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21514_STATUS=()=>({version:VERSION,preBossEscalation:{enabled:true,worlds:Object.keys(CH2_PREBOSS_ESCALATION).length,current:activePreBossEscalation()?.id||null,progress:G?.preBossT>0?+preBossProgress().toFixed(3):0,stage:G?.preBossT>0?preBossStage():0,bossBackgroundCrossfade:true,miniFlyby:true,eliteSilhouette:true,entryDuration:G?.boss?.entryMax||null,noExtraKills:true,noHpInflation:true},preserved:{waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21515_STATUS=()=>({version:VERSION,bossArenaPresentation:{enabled:true,worlds:Object.keys(CH2_ARENA_PRESENTATION).length,current:bossArenaPresentationStatus(),phaseReactive:true,transitionReactive:true,criticalPulseBelow:.15,performanceAware:true,gameplayNeutral:true,motifs:Object.fromEntries(Object.entries(CH2_ARENA_PRESENTATION).map(([w,v])=>[w,v.motif]))},preserved:{preBossEscalation:true,waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21516_STATUS=()=>({version:VERSION,bossDeathAftermath:{enabled:true,worlds:Object.keys(CH2_BOSS_AFTERMATH).length,current:bossArenaAftermathStatus(),deathReactive:true,postBossReactive:true,rewardField:true,performanceAware:true,gameplayNeutral:true,profiles:Object.fromEntries(Object.entries(CH2_BOSS_AFTERMATH).map(([w,v])=>[w,{id:v.id,motif:v.motif,label:v.label,after:v.after}]))},preserved:{bossArenaPresentation:true,preBossEscalation:true,waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21517_STATUS=()=>({version:VERSION,hudMobileReadability:hudPresentationStatus(),focus:hudFocusMode(),presentation:{...HUD_PRESENTATION},preserved:{bossDeathAftermath:true,bossArenaPresentation:true,preBossEscalation:true,waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,directTouch:true,noJoystick:true,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21518_STATUS=()=>({version:VERSION,mobileCombatErgonomics:mobileErgonomicsStatus(),preserved:{hudMobileReadability:true,bossDeathAftermath:true,bossArenaPresentation:true,preBossEscalation:true,waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,directTouch:true,noJoystick:true,noDash:true,assetStreamer:true,performanceGovernor:true,pwa:true}});
window.__SWARM_V21519_STATUS=()=>({version:VERSION,adaptiveHive:hiveDirectorStatus(),mobileCombatErgonomics:mobileErgonomicsStatus(),preserved:{hudMobileReadability:true,bossDeathAftermath:true,bossArenaPresentation:true,preBossEscalation:true,waveChoreographer:true,enemySonicEcology:true,bossAudioEventSync:true,animationAttackSync:true,bossIdentityPass:true,microSwarmFrom:1,riftAllyFrom:11,lastChanceSeconds:5,directTouch:true,noJoystick:true,noDash:true,assetStreamer:true,performanceGovernor:true,pwa:true}});
})();

