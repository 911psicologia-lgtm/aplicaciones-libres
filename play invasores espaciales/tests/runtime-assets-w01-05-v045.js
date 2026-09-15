const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const ctx={window:{SF:{}},console}; ctx.window.window=ctx.window; vm.createContext(ctx);
for(const f of ['config.js','world_content.js']) vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),ctx,{filename:f});
const C=ctx.window.SF.config,W=ctx.window.SF.worldContent;
if(C.VERSION!=='0.6.9') throw new Error('Wrong version');
if(C.progression.wavesPerSector!==4||C.progression.bossWave!==4||C.progression.miniBossWave!==3) throw new Error('Expected 3 waves + boss progression');
if(!W||W.worlds.length!==5) throw new Error('Expected 5 integrated worlds');
let runtimeFiles=0;
for(const w of W.worlds){
  const paths=[];
  for(const m of Object.values(w.minions)) paths.push(m.base,m.elite,m.sheet);
  for(const s of w.subbosses) paths.push(s.base,s.sheet);
  paths.push(w.boss.base,w.boss.phasesSheet,w.boss.openCore,w.boss.deathSheet,w.boss.relicSheet);
  for(const p of w.projectiles) paths.push(p.sheet);
  for(const p of Object.values(w.powerups)) paths.push(p);
  for(const o of w.obstacles) paths.push(o.path);
  for(const b of Object.values(w.backgrounds)) paths.push(b);
  if(paths.length!==48) throw new Error(`World ${w.id}: expected 48 runtime paths, got ${paths.length}`);
  for(const rel of paths){ if(!fs.existsSync(path.join(root,rel))) throw new Error('Missing '+rel); runtimeFiles++; }
}
if(runtimeFiles!==240) throw new Error('Expected 240 runtime assets');
for(const rel of ['assets/ships/vanguard.png','assets/ships/warden.png','assets/ships/specter.png','assets/enemies/sector_boss.png','assets/backgrounds/nebula.webp']) if(!fs.existsSync(path.join(root,rel))) throw new Error('Original trunk asset missing '+rel);
const game=fs.readFileSync(path.join(root,'js','game.js'),'utf8');
for(const token of ['chooseFamilyVisual','renderFamilyMinion','renderWorldSubbossAura','renderWorldBossAura','renderWorldProjectile','getWorldBackground','legacyRatioFloor']) if(!game.includes(token)&&!fs.readFileSync(path.join(root,'js','config.js'),'utf8').includes(token)) throw new Error('Missing hybrid integration token '+token);
console.log('W01-05 HYBRID CONTENT v0.4.5 OK',{worlds:W.worlds.length,runtimeFiles,progression:`${C.progression.wavesPerSector-1}+boss`,firstBoss:W.worlds[0].bossName,lastBoss:W.worlds[4].bossName});
