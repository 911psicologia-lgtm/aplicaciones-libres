const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const audioRoot=path.join(root,'audio','STARFALL_FRONTIER_AUDIO_PACK_v1');
const config=fs.readFileSync(path.join(root,'js','config.js'),'utf8');
const audio=fs.readFileSync(path.join(root,'js','audio.js'),'utf8');
if(!config.includes("VERSION: '0.6.1'")) throw new Error('Wrong version');
const oggs=[];
(function walk(dir){for(const f of fs.readdirSync(dir)){const p=path.join(dir,f),st=fs.statSync(p);if(st.isDirectory())walk(p);else if(f.endsWith('.ogg'))oggs.push(p);}})(audioRoot);
if(oggs.length!==449) throw new Error('Expected 449 OGG archive, got '+oggs.length);
for(const f of ['player_shot_basic.ogg','player_shot_rapid.ogg','player_shot_missile.ogg','player_shot_drone.ogg','player_emp_burst.ogg']){
  if(!fs.existsSync(path.join(audioRoot,'global/player/weapons',f))) throw new Error('Missing player weapon '+f);
}
for(const token of ["master=.34","MAX_VOICES=4","shot(mode='basic')","missileShot()","droneShot()","emp()","ui:silence","enemyShot:silence","bossShot:silence","startAmbience:silence"]){
  if(!audio.includes(token)) throw new Error('Quiet audio mode missing token '+token);
}
console.log('QUIET AUDIO v0.5.1 OK',{archiveOgGs:oggs.length,activeSoundFamily:'player weapons only'});
