const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname,'..');
const ctx = {window:{},console}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),ctx);
const C = ctx.window.SF.config;
if(C.VERSION!=='0.7.6') throw new Error('Wrong v0.4.5 version');
const subs=C.subBossIdentity.patterns;
const bosses=C.bossIdentity.patterns;
if(subs.length!==3 || subs.some(x=>!x.signature)) throw new Error('Subboss signatures missing');
if(bosses.length<5 || bosses.some(x=>!x.signature || !x.accent)) throw new Error('Boss signatures missing');
const game=fs.readFileSync(path.join(root,'js/game.js'),'utf8');
for(const token of ['RED DE CAZA','DOBLE SINGULARIDAD','BATERÍA TRIDENTE','CORONA HELIOS','JUICIO AXIAL','SEMILLA DEVORADORA','HORIZONTE ROTO','ALAS DE RENACIMIENTO','signatureCue']){
  if(!game.includes(token)) throw new Error('Missing signature gameplay token: '+token);
}
const assets=[
  'assets/ships/vanguard.png','assets/ships/warden.png','assets/ships/specter.png',
  'assets/enemies/swarm_spider.png','assets/enemies/sector_boss.png',
  'assets/backgrounds/nebula.webp','assets/obstacles/meteor_defender_a.png'
];
for(const rel of assets) if(!fs.existsSync(path.join(root,rel))) throw new Error('Missing preserved asset '+rel);
console.log('BOSS POWER IDENTITY v0.4.5 OK',{subbosses:subs.map(x=>x.signature),bosses:bosses.map(x=>x.signature),assets:assets.length});
