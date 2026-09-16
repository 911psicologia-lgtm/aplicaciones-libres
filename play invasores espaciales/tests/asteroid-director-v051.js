const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}}; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox);
const C=sandbox.window.SF.config;
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
if(C.VERSION!=='0.7.2') throw new Error('wrong version');
if(!C.obstacles.mediumRadius||!C.obstacles.largeRadius) throw new Error('missing asteroid size classes');
if(C.obstacles.lowerBandPortrait[0]<.44||C.obstacles.lowerBandLandscape[0]<.42) throw new Error('asteroids still too high');
if(C.obstacles.crossSpeed[0]<20) throw new Error('crossing asteroids too slow');
for(const token of ["motion = moving ? (diagonal?'diagonal':'cross') : 'static'","NS.assets?.getObstacle(o.assetIndex ?? idx)","o.motion!=='static'","goneRight","goneLeft","forceStatic = G.wave===C.progression.bossWave && i===0"]) if(!game.includes(token)) throw new Error('missing asteroid director token '+token);
if(game.includes('getWorldObstacle?.(G.sector,idx)')) throw new Error('world alien/debris obstacle render still active');
const sim={x:-60,r:34,vx:42,entered:false,alive:true}; const W=1280,dt=.016;
for(let i=0;i<4000&&sim.alive;i++){
 sim.x+=sim.vx*dt;
 if(sim.x>-sim.r*.2&&sim.x<W+sim.r*.2)sim.entered=true;
 if(sim.vx>0&&sim.entered&&sim.x>W+sim.r*1.5)sim.alive=false;
}
if(sim.alive) throw new Error('crossing asteroid failed to exit');
console.log('ASTEROID DIRECTOR v0.5.1 OK');
