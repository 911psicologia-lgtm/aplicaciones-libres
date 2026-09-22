/* ═══════════════════════════════════════════════════════════
   PequeWorld — COMPAÑERO, CANTO Y CAZA (v15)
   3 novedades 100 % locales (localStorage), patrón v14:
   openModal + hooks window.PW_* para pruebas + cero castigos.
   Contenido:
     1) 🐣 Mi compañero Peque — mascota que crece con XP
     2) 🎵 Canta el ABC      — melodía WebAudio + fichas A–Z
     3) 🎯 Cazaletras        — discriminación visual de letras
   (❤️ Favoritas del Diccionario vive en games2.js — es su casa)
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   1) 🐣 MI COMPAÑERO PEQUE
   Crece con el XP TOTAL del perfil (derivado: no guarda estado
   extra). Sin hambre, sin castigos, sin muertes: solo amor.
   Etapas: Huevo → Recién nacido → Explorador → Campeón → Leyenda
   ═══════════════════════════════════════════════════════════ */
const PET_STAGES = [
  { min: 0,    em: '🥚', name: 'Huevo mágico'  },
  { min: 200,  em: '🐣', name: 'Recién nacido' },
  { min: 600,  em: '🐥', name: 'Explorador'    },
  { min: 1500, em: '🦅', name: 'Campeón'       },
  { min: 3000, em: '🐲', name: 'Leyenda'       },
];
function petStageOf(xp) {
  let s = 0;
  PET_STAGES.forEach((st, i) => { if ((xp || 0) >= st.min) s = i; });
  return s;
}
function petNameOf(p) {
  return (p && p.petName) ? p.petName : 'Peque';
}
const PET_MSGS = [
  '¡Hola! Soy tu compañero. ¡Juega juntos para que nazca!',
  '¡Nací! Gracias por jugar conmigo cada día.',
  '¡Me encanta aprender inglés contigo! ¡Sigamos!',
  '¡Contigo me hice campeón! ¡Tú eres mi héroe!',
  '¡Somos una LEYENDA! ¡El mejor equipo del mundo!',
];

/* Chip en el mapa (patrón v12/v13: anclado antes de #dailyGoal) */
window.renderPetChip = function (p) {
  const anchor = $('dailyGoal'); if (!anchor) return;
  let host = $('petChip');
  if (!host) {
    host = document.createElement('div');
    host.id = 'petChip';
    anchor.parentNode.insertBefore(host, anchor);
  }
  const si = petStageOf(p.xp || 0);
  const st = PET_STAGES[si], nx = PET_STAGES[si + 1];
  const frac = nx ? clamp((p.xp || 0) - st.min, 0, nx.min - st.min) / (nx.min - st.min) : 1;
  host.innerHTML = `<button class="pet-chip" onclick="openPetPanel()" aria-label="Mi compañero ${petNameOf(p)}">
    <span class="pet-chip-em">${st.em}</span>
    <span class="pet-chip-txt">
      <b>${petNameOf(p)}</b>
      <span class="pet-chip-bar"><span style="width:${Math.round(frac * 100)}%"></span></span>
    </span>
  </button>`;
};

window.openPetPanel = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  const si = petStageOf(p.xp || 0);
  const st = PET_STAGES[si], nx = PET_STAGES[si + 1];
  const xp = p.xp || 0;
  const frac = nx ? clamp(xp - st.min, 0, nx.min - st.min) / (nx.min - st.min) : 1;
  const safeName = petNameOf(p).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  openModal('💛 Mi compañero', `
    <div class="pet-panel">
      <div class="pet-big" id="petBig">${st.em}</div>
      <div class="pet-stage">${st.name}</div>
      <div class="pet-name-row">
        <input id="petNameIn" maxlength="12" value="${safeName}" aria-label="Nombre de tu compañero">
        <button class="bigbtn bb-gold bb-sm" onclick="petSaveName()">Guardar</button>
      </div>
      ${nx ? `
        <div class="pet-progress"><div class="pet-fill" style="width:${Math.round(frac * 100)}%"></div></div>
        <div class="small">Faltan <b>${nx.min - xp} XP</b> para que sea <b>${nx.em} ${nx.name}</b></div>`
      : '<div class="small">¡Tu compañero alcanzó la LEYENDA! 🎉 ¡ Increíble !</div>'}
      <div class="pet-msg">${PET_MSGS[si]}</div>
    </div>
  `, `<button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cerrar</button>`);
  TTS.speak([{ text: PET_MSGS[si], lang: 'es-ES', rate: .9 }]);
};

window.petSaveName = function () {
  const v = (($('petNameIn') && $('petNameIn').value) || '')
    .replace(/[<>"'\\/]/g, '').trim().slice(0, 12) || 'Peque';
  updateProfile(p => { p.petName = v; });
  beep(true);
  notif('💛 ¡Tu compañero ahora se llama ' + v + '!', 'var(--gold)');
  renderPetChip(activeProfile());
  openPetPanel();
};

/* Hook para el arnés de pruebas */
window.PW_PET = {
  chip: () => !!document.getElementById('petChip'),
  panel: () => !!document.getElementById('petBig'),
  stage: () => { const p = activeProfile(); return p ? petStageOf(p.xp || 0) : -1; },
  stages: () => PET_STAGES.length,
  name: () => { const p = activeProfile(); return p ? petNameOf(p) : ''; },
  setName: v => updateProfile(p => { p.petName = String(v).replace(/[<>"'\\/]/g, '').slice(0, 12); }),
  renderChip: () => renderPetChip(activeProfile())
};

/* ═══════════════════════════════════════════════════════════
   2) 🎵 CANTA EL ABC
   Melodía del abecedario (arreglo basado en Twinkle) con
   WebAudio: oscilador triangle + envolvente. Cero archivos.
   Las 26 fichas se iluminan en tiempo con la melodía. Al
   completarla: +8 XP +4 🪙 (stats.abcGames). Tocar una ficha
   fuera de la canción dice la letra con TTS + palabra ejemplo.
   ═══════════════════════════════════════════════════════════ */
const ABC_NOTES = [
  ['A','C4',1],['B','C4',1],['C','G4',1],['D','G4',1],['E','A4',1],['F','A4',1],['G','G4',2],
  ['H','F4',1],['I','F4',1],['J','E4',1],['K','E4',1],['L','D4',1],['M','D4',1],['N','C4',2],
  ['O','G4',1],['P','G4',1],['Q','F4',1],['R','F4',1],['S','E4',1],['T','E4',1],['U','D4',2],
  ['V','G4',1],['W','G4',1],['X','F4',1],['Y','F4',1],['Z','E4',2],
];
const ABC_FREQ = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00 };
const ABC_EXAMPLES = [
  ['A','Ant','Hormiga','🐜'], ['B','Ball','Pelota','⚽'], ['C','Cat','Gato','🐱'],
  ['D','Dog','Perro','🐶'],   ['E','Egg','Huevo','🥚'],   ['F','Fish','Pez','🐟'],
  ['G','Grapes','Uvas','🍇'], ['H','House','Casa','🏠'],  ['I','Ice','Hielo','🍦'],
  ['J','Juice','Jugo','🧃'],  ['K','Kite','Cometa','🪁'], ['L','Lion','León','🦁'],
  ['M','Moon','Luna','🌙'],   ['N','Nose','Nariz','👃'],  ['O','Orange','Naranja','🍊'],
  ['P','Pig','Cerdo','🐷'],   ['Q','Queen','Reina','👑'], ['R','Rain','Lluvia','🌧️'],
  ['S','Sun','Sol','☀️'],     ['T','Train','Tren','🚂'],  ['U','Umbrella','Sombrilla','☂️'],
  ['V','Van','Camioneta','🚐'],['W','Water','Agua','💧'],['X','Xylophone','Xilófono','🎼'],
  ['Y','Yoyo','Yo-yo','🪀'],  ['Z','Zoo','Zoológico','🦓'],
];
let _abcAC = null, _abcTimers = [], _abcPlaying = false, _abcFast = false;

window.startAbcSong = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  abcStop(); // si quedaba una melodía colgada, se detiene
  openModal('🎵 Canta el ABC', `
    <div class="small" style="margin-bottom:6px">Toca <b>▶ Cantar</b> y mira cómo se ilumina cada letra. ¡Canta conmigo!</div>
    <div class="abc-grid" id="abcGrid">
      ${ABC_EXAMPLES.map(e => `<button class="abc-tile" data-letter="${e[0]}" onclick="abcTapLetter('${e[0]}')"><b>${e[0]}</b><span>${e[3]}</span></button>`).join('')}
    </div>
    <div class="abc-hud" id="abcHud">🎤 26 letras · ¡las puedes tocar para escucharlas!</div>
  `, `
    <button class="bigbtn bb-ghost bb-sm" id="abcStopBtn" onclick="abcStop()" style="display:none">⏹ Parar</button>
    <button class="bigbtn bb-gold bb-sm" id="abcPlayBtn" onclick="abcPlay()">▶ Cantar</button>
    <button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cerrar</button>
  `);
  window.PW_ABC = {
    open: () => !!document.getElementById('abcGrid'),
    play: fast => abcPlay(!!fast),   /* fast=true: tempo acelerado SOLO para el arnés */
    stop: abcStop,
    playing: () => _abcPlaying,
    tiles: () => document.querySelectorAll('#abcGrid .abc-tile').length,
    sings: () => { const q = activeProfile(); return q ? (q.stats.abcGames || 0) : 0; }
  };
};

function abcHighlight(letter, on) {
  const el = document.querySelector(`#abcGrid .abc-tile[data-letter="${letter}"]`);
  if (el) el.classList.toggle('on', !!on);
}
function abcClearHi() { document.querySelectorAll('#abcGrid .abc-tile.on').forEach(t => t.classList.remove('on')); }
function abcSetBtns(playing) {
  const pb = document.getElementById('abcPlayBtn'), sb = document.getElementById('abcStopBtn');
  if (pb) pb.style.display = playing ? 'none' : '';
  if (sb) sb.style.display = playing ? '' : 'none';
}
function abcNote(freq, durMs) {
  try {
    _abcAC = _abcAC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = _abcAC.currentTime;
    const osc = _abcAC.createOscillator(), g = _abcAC.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
    osc.connect(g); g.connect(_abcAC.destination);
    osc.start(t0); osc.stop(t0 + durMs / 1000 + 0.05);
  } catch (e) { /* sin audio disponible: la visual sigue */ }
}
window.abcPlay = function (fast) {
  if (_abcPlaying) return;
  const p = activeProfile(); if (!p) return;
  if (!document.getElementById('abcGrid')) return; // modal cerrado
  _abcPlaying = true; _abcFast = !!fast;
  abcSetBtns(true);
  const unit = _abcFast ? 45 : 470; // ms por pulso (1 o 2 por nota)
  let t = 0, total = 0;
  ABC_NOTES.forEach(n => { total += n[2] * unit; });
  ABC_NOTES.forEach(n => {
    const dur = n[2] * unit;
    _abcTimers.push(setTimeout(() => {
      if (!document.getElementById('abcGrid')) { abcStop(); return; } // cerraron el modal
      abcClearHi(); abcHighlight(n[0], true);
      abcNote(ABC_FREQ[n[1]], Math.min(dur * 0.92, 900));
    }, t));
    t += dur;
  });
  _abcTimers.push(setTimeout(abcFinish, total + 150));
};
function abcFinish() {
  _abcPlaying = false; abcClearHi(); abcSetBtns(false);
  if (!document.getElementById('abcGrid')) return;
  const p = activeProfile(); if (!p) return;
  updateProfile(pp => {
    pp.stats.abcGames = (pp.stats.abcGames || 0) + 1;
    pp.coins = (pp.coins || 0) + 4;
    pp.xp = (pp.xp || 0) + 8;
  });
  checkBadges();
  notif('🎵 ¡Qué bien cantaste! +8 XP +4 🪙', 'var(--gold)');
  celebrate({
    icon: '🎵', title: '¡ABC cantado!',
    sub: '¡26 letras en una canción! ¡Eres estrella musical!',
    rewards: ['+8 XP', '+4 🪙'], confetti: 1, dur: 2600
  });
}
window.abcStop = function () {
  _abcTimers.forEach(clearTimeout); _abcTimers = []; // v15-fix: limpia TODOS los timeouts agendados
  _abcPlaying = false; abcClearHi(); abcSetBtns(false);
};
window.abcTapLetter = function (letter) {
  const e = ABC_EXAMPLES.find(x => x[0] === letter); if (!e) return;
  beep(true);
  TTS.speak([
    { text: e[0], lang: 'en-US', rate: .72 },
    { text: e[1], lang: 'en-US', rate: .82, pauseMs: 120 },
    { text: e[2], lang: 'es-ES', rate: .9 }
  ]);
  const hud = document.getElementById('abcHud');
  if (hud) hud.innerHTML = `${e[3]} <b>${e[0]}</b> de <b>${e[1]}</b> — ${e[2]} <button class="abc-again" onclick="abcTapLetter('${e[0]}')">🔊 otra vez</button>`;
};

/* ═══════════════════════════════════════════════════════════
   3) 🎯 CAZALETRAS — discriminación visual de letras
   5 rondas: letra objetivo + 10 fichas (3 objetivo + 7 dis-
   tractores de PARES DE CONFUSIÓN reales: b/d/p/q, M/W…).
   Tocar bien = dorado; tocar mal = solo tiembla. Cero castigos.
   ═══════════════════════════════════════════════════════════ */
const HUNT_CONFUSION = {
  A:['H','M','N'], B:['D','P','Q','R'], C:['G','O'], D:['B','P','Q','O'], E:['F','L'],
  F:['E','T'], G:['C','O','Q'], H:['A','N','K'], I:['L','J','T'], J:['L','I','T'],
  K:['X','H','Y'], L:['I','J'], M:['W','N'], N:['R','M','Z'], O:['Q','C','G'],
  P:['B','D','Q','F'], Q:['O','D','B','G'], R:['N','B','P'], S:['Z','X'], T:['F','I','L'],
  U:['V','Y'], V:['U','W'], W:['M','V'], X:['K','Y','Z'], Y:['V','X','U'], Z:['S','N'],
};
const HUNT_ROUNDS = 5;
let _hunt = null;

window.startHunt = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  _hunt = { round: 0, found: 0, target: '', lock: false, done: 0 };
  openModal('🎯 Cazaletras', `
    <div class="small" style="margin-bottom:6px">Encuentra <b>las 3 letras iguales</b> a la grande. Si te equivocas, ¡no pasa nada!</div>
    <div class="hunt-target" id="huntTarget"></div>
    <div class="hunt-grid" id="huntGrid"></div>
    <div class="hunt-hud" id="huntHud"></div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  huntNewRound();
  window.PW_HUNT = {
    open: () => !!document.getElementById('huntGrid'),
    target: () => _hunt ? _hunt.target : '',
    found: () => _hunt ? _hunt.found : 0,
    roundsDone: () => _hunt ? _hunt.round : 0,
    rounds: () => HUNT_ROUNDS,
    /* toca la primera ficha viva con esa letra (misma lógica del toque real) */
    tap: letter => {
      if (!_hunt || _hunt.lock) return;
      const el = document.querySelector(`#huntGrid .hunt-tile[data-letter="${letter}"]:not(.ok)`);
      if (el) huntTap(letter, el, true);
    },
    sessions: () => { const q = activeProfile(); return q ? (q.stats.huntGames || 0) : 0; }
  };
};

function huntNewRound() {
  if (!_hunt) return;
  const keys = Object.keys(HUNT_CONFUSION);
  const target = keys[Math.floor(Math.random() * keys.length)];
  const pool = HUNT_CONFUSION[target].slice();
  while (pool.length < 7) pool.push(keys[Math.floor(Math.random() * keys.length)]);
  const distr = [];
  while (distr.length < 7) {
    const c = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    distr.push(c);
  }
  _hunt.target = target; _hunt.found = 0; _hunt.lock = false;
  const tiles = [target, target, target, ...distr];
  for (let i = tiles.length - 1; i > 0; i--) { // barajado Fisher-Yates
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  const tg = document.getElementById('huntTarget');
  if (tg) tg.innerHTML = `<button class="hunt-say" onclick="huntSay()" aria-label="Escuchar la letra">🔊</button><b>${target}</b>`;
  const grid = document.getElementById('huntGrid');
  if (grid) grid.innerHTML = tiles.map((L, i) =>
    `<button class="hunt-tile" data-letter="${L}" data-i="${i}" onclick="huntTap('${L}',this)"><b>${L}</b></button>`).join('');
  huntHud();
  huntSay();
}
function huntHud() {
  const hud = document.getElementById('huntHud');
  if (!hud || !_hunt) return;
  const dots = '●'.repeat(_hunt.found) + '○'.repeat(3 - _hunt.found);
  hud.innerHTML = `Ronda ${Math.min(_hunt.round + 1, HUNT_ROUNDS)}/${HUNT_ROUNDS} · <b class="hunt-dots">${dots}</b>`;
}
window.huntSay = function () {
  if (!_hunt) return;
  const e = ABC_EXAMPLES.find(x => x[0] === _hunt.target) || null;
  TTS.speak(e
    ? [{ text: _hunt.target, lang: 'en-US', rate: .72 }, { text: e[1], lang: 'en-US', rate: .82 }]
    : [{ text: _hunt.target, lang: 'en-US', rate: .72 }]);
};
window.huntTap = function (letter, el, fromHarness) {
  if (!_hunt || _hunt.lock || !el) return;
  if (el.classList.contains('ok')) return;
  if (letter === _hunt.target) {
    el.classList.add('ok');
    _hunt.found++;
    beep(true); if (!fromHarness && typeof buzz === 'function') buzz(15);
    huntHud();
    if (_hunt.found >= 3) {
      _hunt.lock = true;
      _hunt.round++;
      const e = ABC_EXAMPLES.find(x => x[0] === _hunt.target);
      TTS.speak(e ? [
        { text: _hunt.target + '! ' + e[1], lang: 'en-US', rate: .8 }
      ] : [{ text: _hunt.target + '!', lang: 'en-US', rate: .8 }]);
      if (_hunt.round >= HUNT_ROUNDS) { setTimeout(huntComplete, 700); }
      else setTimeout(huntNewRound, 1100);
    }
  } else {
    el.classList.add('shake'); // solo tiembla: cero castigos (patrón v14)
    setTimeout(() => el.classList.remove('shake'), 420);
  }
};
function huntComplete() {
  if (!_hunt) return;
  const p = activeProfile(); if (!p) return;
  _hunt.done = 1;
  updateProfile(pp => {
    pp.stats.huntGames = (pp.stats.huntGames || 0) + 1;
    pp.coins = (pp.coins || 0) + 3;
    pp.xp = (pp.xp || 0) + 6;
  });
  checkBadges();
  notif('🎯 ¡Todas las letras cazadas! +6 XP +3 🪙', 'var(--gold)');
  celebrate({
    icon: '🎯', title: '¡Cazaletras!',
    sub: HUNT_ROUNDS + ' rondas completadas. ¡Tienes ojos de lince!',
    rewards: ['+6 XP', '+3 🪙'], confetti: 1, dur: 2600
  });
  const hud = document.getElementById('huntHud');
  if (hud) hud.innerHTML = '🎉 ¡Sesión completa! Toca «Listo» para salir.';
}
