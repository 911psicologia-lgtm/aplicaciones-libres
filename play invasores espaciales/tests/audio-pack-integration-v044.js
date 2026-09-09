const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const audioRoot=path.join(root,'audio','STARFALL_FRONTIER_AUDIO_PACK_v1');
const config=fs.readFileSync(path.join(root,'js','config.js'),'utf8');
const game=fs.readFileSync(path.join(root,'js','game.js'),'utf8');
const audio=fs.readFileSync(path.join(root,'js','audio.js'),'utf8');
if(!config.includes("VERSION: '0.4.5'")) throw new Error('Wrong version');
const oggs=[];
(function walk(dir){for(const f of fs.readdirSync(dir)){const p=path.join(dir,f),st=fs.statSync(p);if(st.isDirectory())walk(p);else if(f.endsWith('.ogg'))oggs.push(p);}})(audioRoot);
if(oggs.length!==449) throw new Error('Expected 449 OGG, got '+oggs.length);
for(let w=1;w<=20;w++){
  const ww=String(w).padStart(2,'0');
  const req=[
    `world_${ww}/ambience/world_${ww}_ambience_loop.ogg`,
    `world_${ww}/boss/world_${ww}_boss_intro.ogg`,
    `world_${ww}/boss/world_${ww}_boss_attack_primary.ogg`,
    `world_${ww}/boss/world_${ww}_boss_attack_secondary.ogg`,
    `world_${ww}/boss/world_${ww}_boss_attack_control.ogg`,
    `world_${ww}/boss/world_${ww}_boss_phase_shift.ogg`,
    `world_${ww}/boss/world_${ww}_boss_death.ogg`,
    `world_${ww}/relic/world_${ww}_relic_release.ogg`
  ];
  for(const m of ['swarmer','stinger','hunter','sentinel','spitter','phantom']) req.push(`world_${ww}/minions/world_${ww}_minion_${m}_attack.ogg`);
  for(const slot of ['a','b']) for(const ev of ['intro','attack','death']) req.push(`world_${ww}/subboss_${slot}/world_${ww}_subboss_${slot}_${ev}.ogg`);
  for(const rel of req) if(!fs.existsSync(path.join(audioRoot,rel))) throw new Error('Missing '+rel);
}
for(const token of ['setSector?.(G.sector)','missileShot?.()','droneShot?.()','minibossDeath?.(','bossDeath?.()','obstacleBreak?.()','shieldHit?.()']) if(!game.includes(token)) throw new Error('Missing audio hook '+token);
for(const token of ['player_shot_basic','player_shot_missile.ogg','boss_death.ogg','relic_release.ogg','MAX_VOICES']) if(!audio.includes(token)) throw new Error('Missing bridge token '+token);
console.log('AUDIO PACK v0.4.5 OK',{oggs:oggs.length,worlds:20});
