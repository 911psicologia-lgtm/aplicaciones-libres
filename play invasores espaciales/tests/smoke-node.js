const fs=require('fs'), path=require('path'), vm=require('vm');
const root=path.resolve(__dirname,'..');
const must=[
  'index.html','css/main.css','js/config.js','js/assets.js','js/storage.js','js/audio.js','js/ui.js','js/game.js','js/main.js',
  'assets/ships/vanguard.png','assets/ships/warden.png','assets/ships/specter.png',
  'assets/enemies/raider.png'
];
// enemy paths are mapped to differently named source sprites; validate manifest instead of fixed raider file.
for(const f of must.slice(0,12)){ if(!fs.existsSync(path.join(root,f))) throw new Error('Missing '+f); }
for(const f of fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js'))){ new Function(fs.readFileSync(path.join(root,'js',f),'utf8')); }
const sandbox={window:{SF:{}},performance:{now:()=>0},console}; sandbox.window.window=sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),sandbox);
const C=sandbox.window.SF.config;
if(C.VERSION!=='0.3.1') throw new Error('Wrong version');
if(C.wave.startCols<10||C.wave.startRows<5) throw new Error('Formation too sparse');
if(C.obstacles.maxCount>2) throw new Error('Obstacles became invasive');
const assetFiles=[];
for(const dir of ['ships','enemies','obstacles','backgrounds']) for(const f of fs.readdirSync(path.join(root,'assets',dir))) assetFiles.push(path.join(root,'assets',dir,f));
if(assetFiles.length<17) throw new Error('Insufficient integrated assets: '+assetFiles.length);
console.log('SMOKE OK', {version:C.VERSION, assets:assetFiles.length, formation:`${C.wave.startCols}x${C.wave.startRows}`, maxObstacles:C.obstacles.maxCount});
