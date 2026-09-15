const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}}; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox);
const C=sandbox.window.SF.config;
if(C.VERSION!=='0.6.7') throw new Error('wrong version');
if(!C.difficultyCurve||C.difficultyCurve.worlds.length!==5) throw new Error('missing 5-world curve');
for(let i=1;i<C.difficultyCurve.worlds.length;i++){
  if(C.difficultyCurve.worlds[i].hp<C.difficultyCurve.worlds[i-1].hp) throw new Error('world hp curve not monotonic');
  if(C.difficultyCurve.worlds[i].bossHp<C.difficultyCurve.worlds[i-1].bossHp) throw new Error('boss hp curve not monotonic');
  if(C.difficultyCurve.worlds[i].speed<C.difficultyCurve.worlds[i-1].speed) throw new Error('speed curve not monotonic');
}
if(!(C.difficultyCurve.waves[1].hp<C.difficultyCurve.waves[2].hp && C.difficultyCurve.waves[2].hp<C.difficultyCurve.waves[3].hp)) throw new Error('wave hp curve invalid');
if(C.difficultyCurve.lowHpGraceFireCdMul<=1) throw new Error('low hp grace missing');
console.log('BALANCE v0.4.8 OK',C.difficultyCurve.worlds.map((w,i)=>({world:i+1,hp:w.hp,boss:w.bossHp,fire:w.fireCd})));

if(!C.bossFortress||C.bossFortress.initialShieldRatio<.3) throw new Error('boss fortress missing');
if(C.bossFortress.maxDamagePerHitRatio>.04) throw new Error('boss per-hit cap too loose');
console.log('BOSS FORTRESS CONFIG OK',C.bossFortress);
