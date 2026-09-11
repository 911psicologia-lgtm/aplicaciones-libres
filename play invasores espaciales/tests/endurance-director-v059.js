const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'); const sandbox={window:null}; sandbox.window=sandbox; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox); const C=sandbox.window.SF.config;
const d=C.enduranceDirector;
if(!d?.enabled) throw new Error('enduranceDirector disabled');
if(d.bossMaxPowerScale<1.45||d.subbossMaxPowerScale<1.25) throw new Error('power scaling caps too low');
if(d.bossPhasePressureAfterMs.length!==3) throw new Error('boss phase pressure thresholds missing');
if(d.bossPressureFireMul[2]>=d.bossPressureFireMul[1]||d.bossPressureFireMul[1]>=1) throw new Error('boss pressure cadence invalid');
if(d.fortressMaxBonus<.12) throw new Error('fortress progression bonus too small');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
for(const token of ['endurancePowerScale','bossFortressRatio','subbossShieldRatio','bossPressureLevel','subbossPressureLevel','SOBRECARGA II']) if(!game.includes(token)) throw new Error('missing mechanic '+token);
// Approximate expected scaling at 12 relics/chassis 4 before augment damage.
const boss=1+12*d.bossRelicHpPer+4*d.bossChassisHpPer;
const sub=1+12*d.subbossRelicHpPer+4*d.subbossChassisHpPer;
if(boss<1.45||sub<1.28) throw new Error('late-game compensation insufficient');
console.log('ENDURANCE DIRECTOR v0.6.0 OK',{bossScale:boss.toFixed(3),subbossScale:sub.toFixed(3)});
