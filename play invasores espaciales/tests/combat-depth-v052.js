const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}}; sandbox.window.SF={}; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox);
const C=sandbox.window.SF.config;
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
if(C.VERSION!=='0.7.6') throw new Error('wrong version');
if(!C.microSwarm?.enabled) throw new Error('micro swarm disabled');
if(C.microSwarm.fromWave>2) throw new Error('micro swarm enters too late');
if(!C.bossModules?.enabled) throw new Error('boss modules disabled');
if(Math.max(...C.bossModules.countBySector)<3) throw new Error('boss modules lack progression');
if(C.bossModules.allBrokenCoreExposeMs<2500) throw new Error('module reward window too short');
for(const token of [
  'function spawnMicroSwarm(now)',
  "role:'microSwarm'",
  'function updateMicroSwarmDirector(now)',
  'function buildBossModules(bossHp)',
  'function hitBossModule(b,now)',
  'GENERADORES DE FORTALEZA DESTRUIDOS',
  'MÓDULOS DESTRUIDOS · NÚCLEO ABIERTO',
  'renderBossModules(ctx,e,now,h)',
  'MÓDULOS ${modulesAlive}/${modulesTotal}'
]) if(!game.includes(token)) throw new Error('missing runtime token '+token);
console.log('COMBAT DEPTH v0.5.2 OK');
