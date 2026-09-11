const fs=require('fs'), path=require('path');
const root=process.argv[2]||path.join(__dirname,'..');
const game=fs.readFileSync(path.join(root,'js','game.js'),'utf8');
const cfg=fs.readFileSync(path.join(root,'js','config.js'),'utf8');
for(const token of ['realisticPrimary: true','renderWorldSubbossPrimary','renderWorldBossPrimary','renderBossDeathFx','bossDeathFxMs','originalBackgroundGhostAlpha']){
  if(!game.includes(token)&&!cfg.includes(token)) throw new Error('Missing v0.5.7 realistic render token '+token);
}
if(!game.includes("primaryRealistic=!!(wbg")) throw new Error('World background is not promoted to primary render');
if(!game.includes("img=wb.openCore")) throw new Error('Open-core art is not promoted during vulnerability');
console.log('realistic-primary-render-v057 PASS');
