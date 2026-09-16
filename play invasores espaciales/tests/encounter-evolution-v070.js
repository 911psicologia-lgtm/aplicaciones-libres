const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..'), read=f=>fs.readFileSync(path.join(root,f),'utf8');
const sandbox={window:null}; sandbox.window=sandbox; sandbox.window.SF={}; vm.createContext(sandbox); vm.runInContext(read('js/config.js'),sandbox);
const C=sandbox.window.SF.config, game=read('js/game.js');
const ok=(v,m)=>{if(!v)throw new Error(m)};
ok(C.VERSION==='0.7.2','wrong version');
ok(C.encounterEvolution?.enabled,'encounter evolution disabled');
ok((C.encounterEvolution.bossHpMulBySector||[]).length===5,'boss encounter curve missing');
ok((C.encounterEvolution.kamikaze?.diveChanceByWave||[]).length===4,'kamikaze dive curve missing');
ok(C.subbossFortress.finalThreshold>0 && C.subbossFortress.finalThreshold<C.subbossFortress.phaseThreshold,'subboss phase III invalid');
for(let i=1;i<C.difficultyCurve.worlds.length;i++){
  ok(C.difficultyCurve.worlds[i].bossHp>C.difficultyCurve.worlds[i-1].bossHp,'boss hp not strictly escalating');
  ok(C.difficultyCurve.worlds[i].subbossHp>C.difficultyCurve.worlds[i-1].subbossHp,'subboss hp not strictly escalating');
}
ok(/function handleEnemyPlayerContact/.test(game),'role-aware collision handler missing');
ok(/e\.role==='boss'[\s\S]{0,500}damagePlayer/.test(game),'boss contact handling missing');
ok(/function destroyKamikaze/.test(game)&&/AUTOEXPLOSIÓN/.test(game),'kamikaze explosion missing');
ok(/function shootBossBasic/.test(game)&&/attackCycle/.test(game),'boss basic attack cycle missing');
ok(/shootBoss\(e,ph,\{signature:true\}\)/.test(game),'signature path not separated');
ok(/bossSurgeTargetX/.test(game)&&/MANIOBRA DE CAZA/.test(game),'boss surge movement missing');
ok(/function applySpecialEnemyDamage/.test(game),'special damage routing missing');
ok(!/damagePlayer\(2, 'COLISIÓN'\); e\.alive=false/.test(game),'legacy universal collision kill still present');
ok(/FURIA FINAL/.test(game)&&/finalFireCdMul/.test(read('js/config.js')),'subboss final phase missing');
console.log('ENCOUNTER EVOLUTION v0.7.2 PASS');
