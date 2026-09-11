const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'); const sandbox={window:null}; sandbox.window=sandbox; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox); const C=sandbox.window.SF.config;
if(!C.subbossFortress?.enabled) throw new Error('subboss fortress missing');
if(C.bossFortress.initialShieldRatio<.5) throw new Error('boss fortress too weak');
if(C.bossFortress.maxDamagePerHitRatio>.02) throw new Error('boss hit cap too permissive');
if(C.bossModules.hpRatio<.10||C.bossHardpoints.hpRatio<.07) throw new Error('boss systems too fragile');
const worlds=C.difficultyCurve.worlds;
if(worlds[0].bossHp<1.3||worlds[4].bossHp<2.1) throw new Error('boss curve insufficient');
if(worlds[0].subbossHp<1.4||worlds[4].subbossHp<2.2) throw new Error('subboss curve insufficient');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
for(const token of ['phaseGatesTriggered','ARMADURA ADAPTATIVA','subShieldMax','FASE II · ESCUDO REACTIVADO','rageFireCdMul']) if(!game.includes(token)) throw new Error('missing endurance mechanic '+token);
function bossRaw(s){ const d=worlds[s-1]; const hp=Math.ceil((390+s*145)*d.bossHp); const fort=Math.round(hp*C.bossFortress.initialShieldRatio); const mods=Math.round(hp*C.bossModules.hpRatio)*C.bossModules.countBySector[s-1]; const hard=Math.round(hp*C.bossHardpoints.hpRatio)*C.bossHardpoints.countBySector[s-1]; return {s,hp,fort,mods,hard,raw:hp+fort+mods+hard}; }
const rows=[1,2,3,4,5].map(bossRaw);
if(rows[4].raw<=rows[0].raw*3) throw new Error('late boss endurance does not scale enough');
console.log('BOSS + SUBBOSS ENDURANCE v0.5.8 OK',rows);
