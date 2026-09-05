/* Starfall Frontier v0.2.0 logic smoke test.
   Runs the gameplay core with DOM/canvas stubs; no browser dependencies required. */
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const assert=require('assert');
const root=path.resolve(__dirname,'..');

global.window=global;
global.innerWidth=800;global.innerHeight=1000;global.devicePixelRatio=1;
global.performance={now:()=>Date.now()};
global.requestAnimationFrame=()=>{};
global.addEventListener=()=>{};

const grad={addColorStop(){}};
const ctx=new Proxy({
  createLinearGradient(){return grad;},
  measureText(){return {width:10};}
},{get(t,p){if(p in t)return t[p]; if(typeof p==='string')return ()=>{};},set(t,p,v){t[p]=v;return true;}});
const canvas={style:{},getContext:()=>ctx,width:0,height:0};

let fastDraws=0,containDraws=0;
global.SF={
  Assets:{
    drawFast(){fastDraws++;return true;},drawContain(){containDraws++;return true;},drawCover(){return true;}
  },
  Audio:new Proxy({},{get(){return ()=>{};}}),
  Storage:{
    loadGame(){return null;},saveGame(){},getShip(){return 'vanguard';},addRank(){},deleteGame(){},getRank(){return[];},bestScore(){return 0;},setShip(){},clearRank(){}
  }
};

for(const file of ['js/config.js','js/game.js']){
  vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
}

const input={pointerActive:false,pointerX:.5,axis:()=>0,consumePause:()=>false};
const game=new SF.Game(canvas,input);
game.ship=SF.Config.ships[0];game.shipId=game.ship.id;game.resize();
game.player.maxHp=1;game.player.hp=1;game.player.invulnUntil=Infinity;game.mode='game';

assert.equal(SF.Config.version,'0.2.0');

// Dense opening formation.
game.wave=1;game.spawnWave();
assert.equal(game.enemies.length,45,'wave 1 should open with 9x5 enemies');
assert(!game.enemies.some(e=>e.isGuardian),'guardian begins on wave 2');
const row0=game.enemies.filter(e=>Math.abs(e.baseY-game.enemies[0].baseY)<1);
const gaps=[];
for(let i=1;i<row0.length;i++)gaps.push(row0[i].baseX-(row0[i-1].baseX+row0[i-1].w));
assert(Math.max(...gaps)<8,'enemy columns should be compact');

// Guardian + controlled movement.
game.wave=2;game.spawnWave();
const guardian=game.enemies.find(e=>e.isGuardian);
assert(guardian,'wave 2 should include a rear guardian');
assert(guardian.hp>=15,'guardian must require sustained fire');
const x0=game.enemies[0].x;
const diag=game.enemies.find(e=>e.motion==='diagonal');
let diagMin=diag?diag.y:0,diagMax=diag?diag.y:0;
for(let i=0;i<100;i++){
  game.updateEnemies(16,1000+i*16);
  if(diag){diagMin=Math.min(diagMin,diag.y);diagMax=Math.max(diagMax,diag.y);}
}
assert(Math.abs(game.enemies[0].x-x0)>8,'formation must travel laterally');
if(diag)assert(diagMax-diagMin>2,'diagonal units must move within their row envelope');

// Boss sectors retain a formation and only deploy the large boss after it is cleared.
game.wave=5;game.spawnWave();
assert(game.bossPending && !game.boss && game.enemies.length>0,'boss wave should begin with formation + pending boss');
for(const e of game.enemies)e.alive=false;
game.update(16,5000);
assert(game.boss,'boss should deploy after the formation is destroyed');

// EMP must not create a particle storm when it clears a dense formation.
game.wave=9;game.spawnWave();
for(const e of game.enemies){if(!e.isGuardian)e.hp=1;}
game.particles=[];
const before=game.enemies.filter(e=>e.alive).length;
game.triggerEMP(9000);
const after=game.enemies.filter(e=>e.alive).length;
assert(after<before,'EMP must affect the formation');
assert(game.particles.length<=35,'EMP VFX must be hard-capped to avoid stalls');

// All powers activate safely; gameplay VFX are procedural and do not scale big PNGs per frame.
for(const kind of Object.keys(SF.Config.powers))game.applyPower(kind,10000);
containDraws=0;fastDraws=0;
game.effects.beamUntil=11000;game.effects.shieldUntil=11000;game.effects.empUntil=10540;game.effects.chainUntil=10430;
game.effects.missileFlashUntil=10260;game.effects.spreadFlashUntil=10420;game.effects.powerPulseUntil=10380;game.effects.powerPulseKind='beam';
game.chainPoints=[{x:400,y:900},{x:350,y:300},{x:500,y:220}];
game.drawEffects(10100);
assert.equal(containDraws,0,'active powers should not redraw large VFX PNG sheets');

// Stress logic: dense wave + spread + beam + missiles stays inside object caps.
game.wave=10;game.spawnWave();game.bossPending=false;
game.effects.spreadUntil=999999;game.effects.beamUntil=999999;game.effects.missilesUntil=999999;
let now=12000;
const t0=Date.now();
for(let i=0;i<420;i++){
  now+=16;
  game.update(16,now);
  game.render(16,now);
  if(game.over)break;
}
const elapsed=Date.now()-t0;
assert(game.playerBullets.length<=SF.Config.performance.maxPlayerBullets);
assert(game.enemyBullets.length<=SF.Config.performance.maxEnemyBullets);
assert(game.particles.length<=SF.Config.performance.maxParticles);
assert(fastDraws>0,'render path should use cached fast sprites');

console.log(JSON.stringify({
  ok:true,version:SF.Config.version,wave10Enemies:game.enemies.length,
  guardianHp:SF.Config.waveProfile(10).guardianHp,
  caps:{playerBullets:game.playerBullets.length,enemyBullets:game.enemyBullets.length,particles:game.particles.length},
  simulatedFrames:420,logicMs:elapsed
},null,2));
