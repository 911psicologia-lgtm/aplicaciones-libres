/* audio.js v2.0 — Música con acordes, efectos mejorados */
'use strict';

const AUDIO = (() => {
  let ctx = null;
  let bgInt = null;
  let enabled = true;
  let musicEnabled = true;
  let currentMusic = null;
  let _musicStep = 0;

  function getCtx() {
    if (!ctx) try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(()=>{});
    return ctx;
  }

  function osc(freq, type, dur, vol=0.09, pan=0) {
    const c = getCtx(); if (!c || !enabled) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      const p = c.createStereoPanner ? c.createStereoPanner() : null;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      if (p) { p.pan.value = pan; o.connect(g); g.connect(p); p.connect(c.destination); }
      else { o.connect(g); g.connect(c.destination); }
      o.start(); o.stop(c.currentTime + dur);
    } catch(e){}
  }

  function toneAt(start, freq, type, dur, vol=0.09, pan=0) {
    const c = getCtx(); if (!c || !enabled || !freq) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      const p = c.createStereoPanner ? c.createStereoPanner() : null;
      const when = c.currentTime + Math.max(0, start);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(Math.max(0.0001, vol), when);
      g.gain.exponentialRampToValueAtTime(0.001, when + dur);
      if (p) { p.pan.value = pan; o.connect(g); g.connect(p); p.connect(c.destination); }
      else { o.connect(g); g.connect(c.destination); }
      o.start(when); o.stop(when + dur);
    } catch(e){}
  }

  function chord(freqs, type, dur, vol=0.06) {
    freqs.forEach((f, i) => {
      setTimeout(() => osc(f, type, dur, vol), i * 18);
    });
  }

  function chordAt(start, freqs, type, dur, vol=0.06) {
    freqs.forEach((f, i) => toneAt(start + (i * 0.012), f, type, dur, vol));
  }

  function noise(dur, vol=0.07) {
    const c = getCtx(); if (!c || !enabled) return;
    try {
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = buf;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      src.connect(g); g.connect(c.destination); src.start();
    } catch(e){}
  }

  // ══════════════════════════════════════════════
  // MOTORES DE MÚSICA — uno por bioma
  // ══════════════════════════════════════════════

  function _eerieStep() {       // Páramos, desierto, cuevas
    if (!musicEnabled) return;
    const patterns = [
      [[110,138,165],[82,103,123],[98,123,147],[73,92,110]],
      [[110,138,165],[92,116,138],[98,123,147],[87,110,130]],
    ];
    const seq = [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3]];
    const idx = _musicStep % seq.length;
    const pat = patterns[seq[idx][0]];
    chord(pat[seq[idx][1]], 'sine', 1.1, 0.045);
    osc(pat[seq[idx][1]][0] / 2, 'triangle', 1.3, 0.055);
    if (_musicStep % 2 === 0) setTimeout(() => noise(.06, .04), 600);
    _musicStep++;
  }

  function _intenseStep() {     // Laboratorio, últimos niveles
    if (!musicEnabled) return;
    const melody = [220,246,261,246,220,196,220,261,246,220,246,261,294,261,246,220];
    const bass   = [110,123,130,123,110, 98,110,130,123,110,123,130,147,130,123,110];
    const idx = _musicStep % melody.length;
    osc(melody[idx], 'square', .25, .05);
    osc(bass[idx],   'triangle', .28, .06);
    if (_musicStep % 4 === 0) noise(.05, .03);
    _musicStep++;
  }

  function _forestStep() {      // Jardín, bosque, primavera
    if (!musicEnabled) return;
    // Melodía suave en Do mayor — fluida y orgánica
    const mel  = [523,587,659,698,659,587,523,494,523,587,659,523,494,440,494,523];
    const bass = [130,147,165,175,165,147,130,123,130,147,165,130,123,110,123,130];
    const idx  = _musicStep % mel.length;
    osc(mel[idx],  'sine',     .55, .048, -.2);
    osc(bass[idx], 'triangle', .60, .038,  .1);
    // Armónico suave
    if (_musicStep % 3 === 0) osc(mel[idx] * 2, 'sine', .3, .018, .3);
    // Percusión orgánica leve
    if (_musicStep % 6 === 0) { setTimeout(() => noise(.04, .022), 400); }
    _musicStep++;
  }

  function _jungleStep() {      // Amazonia, selva, pantano, río
    if (!musicEnabled) return;
    const mel  = [293,329,369,293,261,329,369,440,329,293,261,246,261,293,329,261];
    const bass = [73,  82, 92, 73, 65, 82, 92,110, 82, 73, 65, 61, 65, 73, 82, 65];
    const perc = [0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,1];
    const idx  = _musicStep % mel.length;
    osc(mel[idx],  'triangle', .45, .052, -.15);
    osc(bass[idx], 'sawtooth', .50, .042,  .15);
    if (perc[idx]) { noise(.06, .038); osc(bass[idx]*0.5, 'square', .08, .028); }
    if (_musicStep % 4 === 0) osc(mel[idx] * 1.5, 'sine', .25, .022, .35);
    _musicStep++;
  }

  function _iceStep() {         // Tundra, hielo, cielo
    if (!musicEnabled) return;
    // Cristalino, esparso, etéreo — intervalos de 5ª
    const mel  = [1046,988,880,784,698,784,880,988,1046,1174,1046,988,880,784,698,523];
    const bass = [ 261,247,220,196,175,196,220,247, 261, 293, 261,247,220,196,175,130];
    const idx  = _musicStep % mel.length;
    // Tono principal muy suave
    toneAt(0,   mel[idx],  'sine',     .8, .038, Math.sin(idx)*.4);
    toneAt(.12, mel[idx]*2,'sine',     .5, .018, -.3);
    // Bajo glacial
    if (idx % 3 === 0) toneAt(0, bass[idx], 'triangle', 1.0, .032, 0);
    // Campanita ocasional
    if (idx % 5 === 0) { setTimeout(() => osc(mel[idx]*4, 'sine', .15, .022), 200); }
    _musicStep++;
  }

  function _magmaStep() {       // Magma, volcán
    if (!musicEnabled) return;
    // Pesado, grave, amenazante — escala frigia
    const mel  = [82,87,98,87,82,73,82,87,98,110,98,87,82,73,65,73];
    const bass = [41,43,49,43,41,36,41,43,49, 55,49,43,41,36,32,36];
    const idx  = _musicStep % mel.length;
    osc(mel[idx],  'sawtooth', .40, .065, -.25);
    osc(bass[idx], 'sawtooth', .50, .072,  .25);
    // Pulsación volcánica
    if (_musicStep % 2 === 0) { noise(.08, .048); osc(bass[idx]*.5, 'square', .15, .035); }
    if (_musicStep % 5 === 0) osc(mel[idx]*2, 'sawtooth', .12, .028, .4);
    _musicStep++;
  }

  function _spaceStep() {       // Espacial, mar profundo, cristal
    if (!musicEnabled) return;
    // Ambient cósmico — lento, disonante, desorientador
    const mel  = [440,493,523,554,493,415,440,493,554,587,523,466,440,415,392,440];
    const bass = [110,123,130,138,123,103,110,123,138,146,130,116,110,103, 98,110];
    const idx  = _musicStep % mel.length;
    toneAt(0,   mel[idx],      'sine',     1.2, .035, Math.cos(idx*.8)*.5);
    toneAt(.08, mel[idx]*1.01, 'sine',     1.1, .025, Math.sin(idx*.8)*.5); // chorus
    if (idx % 4 === 0) toneAt(.3, bass[idx], 'triangle', 1.4, .042, 0);
    if (idx % 7 === 0) { setTimeout(() => osc(mel[idx]*3, 'sine', .25, .015, .4), 500); }
    _musicStep++;
  }

  function _stormStep() {       // Tormenta eléctrica
    if (!musicEnabled) return;
    // Caótico, jadeante, eléctrico
    const mel  = [880,988,1046,880,784,880,1174,1046,880,784,659,784,880,988,1046,784];
    const bass = [110,123, 130,110, 98,110, 146, 130,110, 98, 82, 98,110,123, 130, 98];
    const idx  = _musicStep % mel.length;
    osc(mel[idx],  'square',   .20, .055, (Math.random()-.5)*.6);
    osc(bass[idx], 'sawtooth', .22, .062, (Math.random()-.5)*.4);
    if (_musicStep % 3 === 0) { noise(.04, .042); }
    // Destello eléctrico ocasional
    if (idx % 8 === 0) {
      [mel[idx]*1.5, mel[idx]*2, mel[idx]*2.5].forEach((f,i) =>
        setTimeout(() => osc(f, 'square', .06, .04), i*35));
    }
    _musicStep++;
  }

  function _metroStep() {       // Ciudad, fábrica, metro, cemento
    if (!musicEnabled) return;
    // Industrial, mecánico, rítmico — línea de bajo firme
    const mel  = [329,293,261,293,329,369,329,293,261,220,246,261,293,329,246,220];
    const bass = [ 82, 73, 65, 73, 82, 92, 82, 73, 65, 55, 61, 65, 73, 82, 61, 55];
    const perc = [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0];
    const idx  = _musicStep % mel.length;
    osc(mel[idx],  'square',   .30, .050, -.2);
    osc(bass[idx], 'sawtooth', .35, .060,  .2);
    if (perc[idx]) { noise(.07, .055); osc(bass[idx]*.5, 'square', .12, .045); }
    if (_musicStep % 4 === 0) osc(mel[idx]*2, 'square', .10, .020, .35);
    _musicStep++;
  }

  function startMusic(type) {
    stopMusic();
    if (!musicEnabled) return;
    currentMusic = type;
    _musicStep = 0;
    const TRACKS = {
      eerie:   { fn: _eerieStep,  interval: 950  },
      intense: { fn: _intenseStep,interval: 220  },
      forest:  { fn: _forestStep, interval: 700  },
      jungle:  { fn: _jungleStep, interval: 480  },
      ice:     { fn: _iceStep,    interval: 1100 },
      magma:   { fn: _magmaStep,  interval: 520  },
      space:   { fn: _spaceStep,  interval: 1300 },
      storm:   { fn: _stormStep,  interval: 190  },
      metro:   { fn: _metroStep,  interval: 300  },
    };
    const track = TRACKS[type] || TRACKS.eerie;
    bgInt = setInterval(track.fn, track.interval);
  }

  function stopMusic() {
    if (bgInt) { clearInterval(bgInt); bgInt = null; }
    currentMusic = null;
  }

  // ── Efectos de sonido ─────────────────────────
  const SFX = {
    shoot()   { osc(880,'square',.07,.055,-.3); },
    shoot2()  { osc(880,'square',.07,.055,-.3); setTimeout(()=>osc(1040,'square',.07,.05,.3),80); },
    freeze()  { osc(1400,'sine',.12,.06); osc(1000,'sine',.15,.05); },
    hit()     { noise(.07,.055); osc(220,'sawtooth',.07,.045); },
    zombieDie(){ osc(180,'sawtooth',.2,.08); noise(.12,.05); },
    plantDie(){ osc(140,'triangle',.28,.09); },
    explode() { noise(.45,.18); osc(70,'sawtooth',.3,.14); osc(55,'sawtooth',.5,.09); },
    bombBoom(){ noise(.55,.22); osc(48,'sawtooth',.45,.16); osc(72,'square',.22,.08); setTimeout(()=>osc(36,'triangle',.55,.1),60); },
    star(){ osc(1175,'sine',.07,.08); setTimeout(()=>osc(1480,'sine',.08,.06),50); },
    sun()     { osc(880,'sine',.06,.08); setTimeout(()=>osc(1100,'sine',.08,.06),60); },
    place()   { chord([440,554,659],'triangle',.12,.055); },
    tostadora(){ noise(.18,.2); osc(280,'sawtooth',.22,.14); osc(140,'square',.28,.1); },
    zombieGrunt(){
      const fs=[70,90,110]; osc(fs[Math.floor(Math.random()*3)],'sawtooth',.2,.08); noise(.12,.04);
    },
    emilia()  { [784,880,1046,880,784].forEach((f,i)=>setTimeout(()=>osc(f,'sine',.15,.1),i*75)); },
    martin()  { [659,784,988,1175].forEach((f,i)=>setTimeout(()=>osc(f,'square',.08,.08),i*45)); },
    alien()   { [330,494,740,988,1480].forEach((f,i)=>setTimeout(()=>osc(f,'triangle',.09,.08),i*40)); noise(.12,.035); },
    superpapa(){ [220,440,880,1760,880,440].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.12,.08),i*55)); },
    laserchip(){ [1320,1760,1320].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.08,.07),i*45)); },
    rocket()  { osc(180,'square',.16,.08); noise(.14,.045); },
    error()   { osc(220,'square',.12,.08); },
    select()  { osc(660,'sine',.07,.07); },
    wave()    { chord([440,554,659],'sine',.18,.07); },
    boss()    { [100,90,80,70].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.28,.14),i*110)); },
    bossRage(){ 
      noise(.35,.22); 
      [55,48,42,38].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.45,.18),i*90));
      setTimeout(()=>{ noise(.2,.15); osc(62,'square',.35,.12); }, 380);
    },
    bossRoar(){
      [80,70,60,50,60,70].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.3,.13),i*80));
      setTimeout(()=>noise(.25,.12),200);
    },
    // Combo sounds
    combo2()  { chord([880,1100],'sine',.15,.08); },
    combo3()  { chord([880,1100,1320],'sine',.15,.09); },
    combo5()  { [880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>osc(f,'sine',.18,.09),i*50)); },
    // Stars
    star1()   { osc(880,'sine',.2,.1); },
    star2()   { chord([880,1100],'sine',.2,.09); },
    star3()   { [880,1100,1320,1760].forEach((f,i)=>setTimeout(()=>osc(f,'sine',.2,.09),i*80)); },
    // Badge
    badge()   { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>osc(f,'sine',.18,.09),i*90)); },
    // Victory
    victory() {
      const notes=[523,659,784,1047,784,880,1047,1320];
      notes.forEach((f,i)=>setTimeout(()=>chord([f,f*1.25],'sine',.25,.08),i*140));
    },
    defeat()  { [330,277,247,220,196].forEach((f,i)=>setTimeout(()=>osc(f,'sawtooth',.28,.1),i*170)); },
    levelClear(){
      const n=[659,784,880,1047,880];
      n.forEach((f,i)=>setTimeout(()=>osc(f,'sine',.22,.09),i*130));
    },
    // Cumpleaños extendido, polifónico y superpuesto al resto del audio
    bday()    {
      const phrases = [
        [[392,.38],[392,.22],[440,.56],[392,.56],[523,.56],[494,.92]],
        [[392,.38],[392,.22],[440,.56],[392,.56],[587,.56],[523,.92]],
        [[392,.36],[392,.2],[784,.54],[659,.54],[523,.54],[494,.54],[440,.98]],
        [[698,.36],[698,.2],[659,.54],[523,.54],[587,.54],[523,1.08]],
        [[523,.3],[587,.3],[659,.4],[587,.4],[523,.42],[494,.42],[440,.72]],
        [[523,.3],[587,.3],[659,.4],[587,.4],[523,.42],[587,.42],[523,.95]],
      ];
      const bassRoots = [196,196,196,233,262,196];
      let t = 0;
      phrases.forEach((phrase, idx) => {
        const root = bassRoots[idx] || 196;
        chordAt(t, [root, root*1.25, root*1.5], 'triangle', 1.2, 0.038);
        toneAt(t, root/2, 'sawtooth', 1.05, 0.028, -0.1);
        phrase.forEach(([freq, dur], i) => {
          toneAt(t, freq, 'sine', dur, 0.095, 0.12);
          toneAt(t + 0.018, freq * 2, 'triangle', Math.max(0.16, dur * 0.72), 0.03, 0.22);
          if (i === phrase.length - 1) {
            chordAt(t + 0.04, [freq, freq*1.25, freq*1.5], 'sine', Math.max(0.3, dur * 0.9), 0.05);
          }
          t += dur;
        });
        // campanitas de transición
        toneAt(t + 0.02, 1318, 'sine', 0.12, 0.022, 0.3);
        toneAt(t + 0.14, 1568, 'sine', 0.11, 0.018, 0.36);
        t += 0.18;
      });
      // Cierre brillante largo
      chordAt(t, [523,659,784], 'sine', 0.9, 0.08);
      chordAt(t + 0.28, [659,784,1047], 'triangle', 1.1, 0.065);
      toneAt(t + 0.1, 392, 'sawtooth', 1.25, 0.026, -0.2);
      toneAt(t + 0.36, 1047, 'sine', 0.75, 0.05, 0.26);
    },
  };

  return {
    play(name){ if(!enabled) return; try{ SFX[name]&&SFX[name](); }catch(e){} },
    music(type){ if(type==='off'||type===null) stopMusic(); else startMusic(type); },
    stopMusic,
    toggle(){
      enabled=!enabled;
      if(!enabled) stopMusic();
      return enabled;
    },
    toggleMusic(){
      musicEnabled=!musicEnabled;
      if(!musicEnabled) stopMusic();
      else if(currentMusic) startMusic(currentMusic);
      return musicEnabled;
    },
    isEnabled(){ return enabled; },
    isMusicEnabled(){ return musicEnabled; },
    init(){ getCtx(); },
  };
})();
