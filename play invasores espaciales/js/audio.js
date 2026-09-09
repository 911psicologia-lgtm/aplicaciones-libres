(()=>{
'use strict';
const ROOT='assets/audio';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=n=>String(n+1).padStart(2,'0');

class StarfallAudioManager{
  constructor(){
    this.enabled=true;
    this.unlocked=false;
    this.master=0.82;
    this.volumes={ui:.72,player:.62,enemy:.52,boss:.72,fx:.62,ambience:.30,stinger:.68,relic:.72,obstacle:.50};
    this.cache=new Map();
    this.lastPlay=new Map();
    this.ambience=null;
    this.ambienceWorld=-1;
    this.engine=null;
    this.engineMode=null;
    this.polyphony=0;
    this.maxPolyphony=24;
  }
  path(rel){ return `${ROOT}/${rel}`; }
  global(rel){ return this.path(`global/${rel}`); }
  world(worldIndex, rel){ return this.path(`world_${pad(worldIndex)}/${rel}`); }
  async unlock(){
    this.unlocked=true;
    // Warm a tiny UI clip; muted so mobile browsers authorize subsequent playback.
    try{
      const a=this._template(this.global('ui/ui_hover.ogg')).cloneNode();
      a.muted=true; a.volume=0; await a.play(); a.pause(); a.currentTime=0;
    }catch(e){}
  }
  setEnabled(v){ this.enabled=!!v; if(!this.enabled){ this.stopAmbience(); this.stopEngine(); } }
  setMaster(v){ this.master=clamp(v,0,1); if(this.ambience) this.ambience.volume=this._volume('ambience',1); if(this.engine) this.engine.volume=this._volume('player',.28); }
  _template(src){
    if(this.cache.has(src)) return this.cache.get(src);
    const a=new Audio(src); a.preload='auto';
    this.cache.set(src,a); return a;
  }
  _volume(category,gain=1){ return clamp(this.master*(this.volumes[category]??.6)*gain,0,1); }
  play(src,{category='fx',gain=1,cooldown=0.04,rate=1,loop=false}={}){
    if(!this.enabled || !this.unlocked || !src) return null;
    const now=performance.now()/1000;
    const key=`${src}|${category}`;
    if(now-(this.lastPlay.get(key)||-999)<cooldown) return null;
    if(this.polyphony>=this.maxPolyphony && category!=='boss' && category!=='ui' && category!=='stinger') return null;
    this.lastPlay.set(key,now);
    try{
      const a=this._template(src).cloneNode();
      a.preload='auto'; a.volume=this._volume(category,gain); a.playbackRate=rate; a.loop=loop;
      this.polyphony++;
      const done=()=>{ this.polyphony=Math.max(0,this.polyphony-1); a.removeEventListener('ended',done); a.removeEventListener('error',done); };
      a.addEventListener('ended',done,{once:true}); a.addEventListener('error',done,{once:true});
      const p=a.play(); if(p&&p.catch) p.catch(done);
      return a;
    }catch(e){ return null; }
  }
  ui(name,gain=1){ return this.play(this.global(`ui/${name}.ogg`),{category:'ui',gain,cooldown:.04}); }
  stinger(name,gain=1){ return this.play(this.global(`stingers/${name}.ogg`),{category:'stinger',gain,cooldown:.25}); }
  fx(name,gain=1){ return this.play(this.global(`fx/${name}.ogg`),{category:'fx',gain,cooldown:.035}); }
  obstacle(name,gain=1){ return this.play(this.global(`obstacles/${name}.ogg`),{category:'obstacle',gain,cooldown:.14}); }
  playerWeapon(name,gain=1,cooldown=.05){ return this.play(this.global(`player/weapons/${name}.ogg`),{category:'player',gain,cooldown}); }
  playerPower(name,gain=1){ return this.play(this.global(`player/powers/${name}.ogg`),{category:'player',gain,cooldown:.10}); }
  playerDefense(name,gain=1){ return this.play(this.global(`player/defense/${name}.ogg`),{category:'player',gain,cooldown:.10}); }
  minion(worldIndex,role,gain=.75){
    return this.play(this.world(worldIndex,`minions/world_${pad(worldIndex)}_minion_${role}_attack.ogg`),{category:'enemy',gain,cooldown:.18});
  }
  subboss(worldIndex,id,event,gain=1){
    return this.play(this.world(worldIndex,`subboss_${id}/world_${pad(worldIndex)}_subboss_${id}_${event}.ogg`),{category:'boss',gain,cooldown:event==='attack'?.35:.7});
  }
  boss(worldIndex,event,gain=1){
    return this.play(this.world(worldIndex,`boss/world_${pad(worldIndex)}_boss_${event}.ogg`),{category:'boss',gain,cooldown:event.startsWith('attack')?.30:.75});
  }
  relic(worldIndex,event='release',gain=1){
    const src=event==='release'
      ? this.world(worldIndex,`relic/world_${pad(worldIndex)}_relic_release.ogg`)
      : this.global('player/powers/player_relic_attach.ogg');
    return this.play(src,{category:'relic',gain,cooldown:.25});
  }
  warmWorld(worldIndex){
    const w=pad(worldIndex);
    const rels=[
      `ambience/world_${w}_ambience_loop.ogg`,
      ...['swarmer','stinger','hunter','sentinel','spitter','phantom'].map(r=>`minions/world_${w}_minion_${r}_attack.ogg`),
      ...['a','b'].flatMap(id=>['intro','attack','death'].map(ev=>`subboss_${id}/world_${w}_subboss_${id}_${ev}.ogg`)),
      ...['intro','phase_shift','attack_primary','attack_secondary','attack_control','death'].map(ev=>`boss/world_${w}_boss_${ev}.ogg`),
      `relic/world_${w}_relic_release.ogg`
    ];
    if([5,9,14,17,19].includes(worldIndex)) rels.push(`boss/world_${w}_boss_revive.ogg`);
    rels.forEach(rel=>{ try{ const a=this._template(this.world(worldIndex,rel)); a.preload='auto'; a.load(); }catch(e){} });
  }
  playAmbience(worldIndex){
    if(!this.enabled || !this.unlocked) return;
    if(this.ambienceWorld===worldIndex && this.ambience && !this.ambience.paused) return;
    this.stopAmbience();
    const src=this.world(worldIndex,`ambience/world_${pad(worldIndex)}_ambience_loop.ogg`);
    try{
      const a=this._template(src).cloneNode(); a.loop=true; a.preload='auto'; a.volume=this._volume('ambience',1); this.ambience=a; this.ambienceWorld=worldIndex;
      const p=a.play(); if(p&&p.catch) p.catch(()=>{});
    }catch(e){}
  }
  pauseAmbience(){ if(this.ambience&&!this.ambience.paused) this.ambience.pause(); }
  resumeAmbience(){ if(this.ambience&&this.enabled&&this.unlocked){ const p=this.ambience.play(); if(p&&p.catch) p.catch(()=>{}); } }
  stopAmbience(){ if(this.ambience){ try{ this.ambience.pause(); this.ambience.currentTime=0; }catch(e){} this.ambience=null; this.ambienceWorld=-1; } }
  playEngine(mode='light'){
    if(!this.enabled||!this.unlocked) return;
    if(this.engine && this.engineMode===mode && !this.engine.paused) return;
    this.stopEngine();
    try{
      const src=this.global(`player/movement/player_engine_loop_${mode}.ogg`); const a=this._template(src).cloneNode(); a.loop=true; a.preload='auto'; a.volume=this._volume('player',.22); this.engine=a; this.engineMode=mode; const p=a.play(); if(p&&p.catch)p.catch(()=>{});
    }catch(e){}
  }
  pauseEngine(){ if(this.engine&&!this.engine.paused)this.engine.pause(); }
  resumeEngine(){ if(this.engine&&this.enabled&&this.unlocked){ const p=this.engine.play(); if(p&&p.catch)p.catch(()=>{}); } }
  stopEngine(){ if(this.engine){ try{this.engine.pause();this.engine.currentTime=0;}catch(e){} this.engine=null; this.engineMode=null; } }
  phaseShift(worldIndex){ return this.boss(worldIndex,'phase_shift',1); }
  bossRevive(worldIndex){ return this.boss(worldIndex,'revive',1); }
  bossAttack(worldIndex,kind='primary'){
    const name=kind==='secondary'?'attack_secondary':kind==='control'?'attack_control':'attack_primary';
    return this.boss(worldIndex,name,1);
  }
}

window.SFAudio = new StarfallAudioManager();
})();
