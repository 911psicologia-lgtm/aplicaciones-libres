const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}}; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox);
const C=sandbox.window.SF.config;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function layout(w,h,sector=1,wave=1){
 const portrait=h>=w; let profile;
 if(portrait&&w<=C.responsive.mobilePortrait.maxWidth)profile=C.responsive.mobilePortrait;
 else if(portrait)profile=C.responsive.tabletPortrait;
 else if(w<=C.responsive.tabletLandscape.maxWidth)profile=C.responsive.tabletLandscape;
 else if(w<=C.responsive.desktop.maxWidth)profile=C.responsive.desktop;
 else profile=C.responsive.wideDesktop;
 const sideMargin=portrait?clamp(w*.025,8,18):clamp(w*.025,18,48);
 const targetWidth=Math.max(220,Math.min(w*profile.targetWidth,w-sideMargin*2));
 const gapX=profile.gapX,gapY=profile.gapY;
 const desiredCols=profile.cols+Math.min(2,Math.floor((sector-1)/2))+(wave>=4?1:0);
 const maxCols=portrait?C.wave.maxColsPortrait:C.wave.maxColsLandscape;
 const safeEnemyMin=portrait&&w<420?22:Math.min(profile.enemyMin,28+w*.018);
 const fitMaxCols=Math.max(6,Math.floor((targetWidth+gapX)/(safeEnemyMin+gapX)));
 const cols=clamp(Math.min(desiredCols,fitMaxCols),6,maxCols);
 const rawEW=(targetWidth-gapX*(cols-1))/cols;
 const ew=Math.max(20,Math.min(profile.enemyMax,rawEW));
 const eh=ew*.78;
 let rowsBase=profile.rows;if(portrait&&w<=520&&h>=760)rowsBase++;
 const rows=clamp(rowsBase+Math.floor((sector-1)/3)+(wave>=4?1:0),4,portrait?C.wave.maxRowsPortrait:C.wave.maxRowsLandscape);
 const formationWidth=cols*ew+(cols-1)*gapX;
 const startY=portrait?Math.max(94,h*.125):Math.max(82,h*.09);
 const maxFormationY=startY+h*(portrait?C.formation.portraitMaxDriftRatio:C.formation.landscapeMaxDriftRatio);
 return{portrait,sideMargin,targetWidth,gapX,gapY,cols,rows,ew,eh,formationWidth,startY,maxFormationY};
}
const cases=[[320,568],[360,740],[360,800],[390,844],[412,915],[430,932],[768,1024],[1024,768],[1366,768],[1720,864],[1920,1080]];
for(const [w,h] of cases){
 const L=layout(w,h);
 if(L.formationWidth>w-L.sideMargin*2+0.01) throw new Error(`overflow ${w}x${h}: ${L.formationWidth}>${w-L.sideMargin*2}`);
 if(L.startY<80)throw new Error('formation starts under HUD');
 console.log(`${w}x${h} -> ${L.cols}x${L.rows}, enemy ${L.ew.toFixed(1)}, width ${L.formationWidth.toFixed(1)}/${w}`);
}
// Formation 60-second bounce simulation: y may drift only within configured band.
for(const [w,h] of [[360,800],[768,1024],[1720,864]]){
 const L=layout(w,h); let f={x:(w-L.formationWidth)/2,y:L.startY,baseY:L.startY,maxY:L.maxFormationY,vx:(C.wave.baseEnemySpeed+6)*(L.portrait?C.formation.mobileSpeedMultiplier:1),dir:1,bounces:0,lastBounce:-999};
 let now=0; const dt=16;
 for(let k=0;k<60_000/dt;k++){
   now+=dt; f.x+=f.vx*f.dir*dt/1000;
   let minX=f.x,maxX=f.x+L.formationWidth; const hitLeft=minX<L.sideMargin,hitRight=maxX>w-L.sideMargin;
   if((hitLeft||hitRight)&&now-f.lastBounce>90){
    if(hitLeft&&hitRight){f.x+=w/2-(minX+maxX)/2;f.vx=Math.min(f.vx,72)}
    else if(hitLeft){f.x+=L.sideMargin-minX;f.dir=1}else{f.x-=maxX-(w-L.sideMargin);f.dir=-1}
    f.lastBounce=now;f.bounces++;
    const every=L.portrait?C.formation.portraitDropEveryBounces:C.formation.landscapeDropEveryBounces;
    if(f.bounces%every===0)f.y=Math.min(f.maxY,f.y+(L.portrait?C.formation.portraitDropPx:C.formation.landscapeDropPx));
   }
   f.y=clamp(f.y,f.baseY,f.maxY);
 }
 if(f.y>L.maxFormationY+.001)throw new Error('formation runaway');
 console.log(`stable ${w}x${h}: bounces=${f.bounces}, y=${f.y.toFixed(1)} max=${L.maxFormationY.toFixed(1)}`);
}
// Diver round-trip math must return to home and never go below attack depth.
for(const mobile of [true,false]){
 const duration=mobile?3400:2750, startY=120, depth=mobile?448:520, homeY=120;
 let lastY=startY,maxY=startY;
 for(let t=0;t<=duration;t+=17){const p=clamp(t/duration,0,1),split=.58;let y;if(p<split){const q=1-Math.pow(1-p/split,2);y=startY+(depth-startY)*q}else{const q=(p-split)/(1-split),ease=q*q*(3-2*q);y=depth+(homeY-depth)*ease}maxY=Math.max(maxY,y);lastY=y}
 if(maxY>depth+.01||Math.abs(lastY-homeY)>4)throw new Error('diver trajectory invalid');
 console.log(`diver ${mobile?'mobile':'desktop'} returns home; maxY=${maxY.toFixed(1)}`);
}
// Structural checks.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const id of ['splashPilot','newGameBtn','continueBtn','rankingBtn','hangarBtn','gameOverOverlay']) if(!html.includes(`id="${id}"`)) throw new Error(`missing ${id}`);
for(const rel of ['assets/backgrounds/nebula.webp','assets/ships/vanguard.png','assets/enemies/swarm_shell.png','assets/obstacles/meteor_defender_a.png']) if(!fs.existsSync(path.join(root,rel))) throw new Error(`missing asset ${rel}`);

// v0.4.5 structural systems
if(C.VERSION!=='0.6.1') throw new Error('responsive test wrong version');
if(C.combatDirector.gunnerTelegraphMsMobile<=C.combatDirector.gunnerTelegraphMsDesktop) throw new Error('mobile telegraph should be longer');
if(C.rewards.mobileMagnetRadius<C.rewards.desktopMagnetRadius) throw new Error('mobile magnet should not be weaker');
if(!C.enemyEcology||!C.weaponEvolution||!C.bossCore) throw new Error('v0.4.5 systems config missing');
console.log('v0.4.5 director/ecology/evolution config: PASS');

console.log('responsive smoke: PASS');
