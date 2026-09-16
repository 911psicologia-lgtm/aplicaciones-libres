/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAMES v14 (taller de letras y juegos creativos)
   1) ✏️ Trazado de letras  (canvas, sin fallos, colección A-Z)
   2) 🎯 Ahorcado kid       (foto-pista, 6 ❤️, teclado A-Z)
   3) 🖼️ Rompecabezas       (4 · 9 · 12 piezas con fotos reales)
   4) 🔢 Unir con puntos    (6 figuras, tap en orden)
   5) 🗓️ Retos del fin de semana (3 retos medibles, sáb/domingo)
   Todo 100% local, aditivo, sin tocar el motor de misiones.
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 1) ✏️ TRAZADO DE LETRAS ══════════
   El niño traza la letra con el dedo (o ratón) encima de una
   guía. Se pinta SOLO dentro de la letra (composición canvas),
   la barra muestra cuánta letra cubre y al llegar al umbral
   suena la celebración. Sin vidas y sin errores: como Explora.
   Colección: stats.traceLetters = {A:true, …} alimenta insignias. */
const TRACE_SIZE = 320;
const TRACE_COVER = 0.72;    // % de la letra pintada para completarla
const TRACE_MIN_EVENTS = 40; // anti-trampa: hay que trazAR de verdad (movimientos, no toques secos)
let TR = { on: false, letter: '', target: [], painted: 0, mask: null, strokes: 0, events: 0, done: false, lastPt: null };

function traceWordFor(L) {
  /* «A de Apple» → Apple (palabra para la voz y la pista) */
  for (const w of WORLDS) {
    if (w.kind !== 'letters') continue;
    const it = w.items.find(x => x.en.toUpperCase() === L && x.hint);
    if (it && it.hint) {
      const m = it.hint.split(/\s+de\s+/i);
      if (m[1]) return m[1];
      return it.hint;
    }
  }
  return '';
}

window.startTrace = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  TR = { on: true, letter: '', target: [], painted: 0, mask: null, strokes: 0, events: 0, done: false, lastPt: null };
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  openModal('✏️ Trazado de letras', `
    <div class="small" style="margin-bottom:8px">Elige una letra y trázala con el dedo 👆 de arriba a abajo. ¡Sigue el color de la guía!</div>
    <div class="trace-chips" id="traceChips"></div>
    <div class="trace-prog-wrap"><div class="trace-prog" id="traceProg"></div></div>
    <div class="trace-box" id="traceBox">
      <canvas id="traceBase" width="${TRACE_SIZE}" height="${TRACE_SIZE}"></canvas>
      <canvas id="traceInk" width="${TRACE_SIZE}" height="${TRACE_SIZE}"></canvas>
    </div>
    <div class="small" style="text-align:center;margin-top:6px" id="traceHint">👆 Toca una letra de arriba</div>
  `, `<button class="bigbtn bb-ghost bb-sm" onclick="traceClear()">🧽 Borrar trazo</button>
      <button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);

  const chips = $('traceChips');
  letters.forEach(L => {
    const done = !!((activeProfile().stats.traceLetters || {})[L]);
    const chip = document.createElement('button');
    chip.className = 'tr-chip' + (done ? ' ok' : '');
    chip.textContent = L;
    chip.setAttribute('aria-label', 'Trazar letra ' + L + (done ? ' completada' : ''));
    chip.onclick = () => tracePick(L);
    chips.appendChild(chip);
  });
  updateProfile(pp => { pp.stats.traceVisits = (pp.stats.traceVisits || 0) + 1; });
  checkBadges();
  window.PW_TRACE = {
    open: () => TR.on && !!document.getElementById('traceInk'),
    letter: () => TR.letter,
    coverage: () => TR.target.length ? TR.painted / TR.target.length : 0,
    done: () => TR.done,
    picked: () => Object.keys((activeProfile() && activeProfile().stats.traceLetters) || {}).length
  };
};

/* pinta la guía gris de la letra y prepara la máscara de cobertura */
function tracePick(L) {
  if (!TR.on) return;
  beep(true);
  TR.letter = L; TR.strokes = 0; TR.events = 0; TR.done = false; TR.lastPt = null;
  const base = $('traceBase'), ink = $('traceInk');
  if (!base || !ink) return;
  const b = base.getContext('2d'), k = ink.getContext('2d');
  b.clearRect(0, 0, TRACE_SIZE, TRACE_SIZE);
  k.clearRect(0, 0, TRACE_SIZE, TRACE_SIZE);

  /* guía: letra gigante gris claro con borde punteado */
  b.save();
  b.font = '800 230px "Baloo 2", sans-serif';
  b.textAlign = 'center'; b.textBaseline = 'middle';
  b.fillStyle = 'rgba(255,255,255,.10)';
  b.strokeStyle = 'rgba(255,255,255,.34)';
  b.lineWidth = 3; b.setLineDash([7, 7]);
  b.fillText(L, TRACE_SIZE / 2, TRACE_SIZE / 2 + 8);
  b.strokeText(L, TRACE_SIZE / 2, TRACE_SIZE / 2 + 8);
  b.restore();

  /* punto de inicio dibujado (arriba) para orientar el trazo */
  const maskC = document.createElement('canvas');
  maskC.width = TRACE_SIZE; maskC.height = TRACE_SIZE;
  const m = maskC.getContext('2d');
  m.font = '800 230px "Baloo 2", sans-serif';
  m.textAlign = 'center'; m.textBaseline = 'middle';
  m.fillText(L, TRACE_SIZE / 2, TRACE_SIZE / 2 + 8);
  const data = m.getImageData(0, 0, TRACE_SIZE, TRACE_SIZE).data;
  TR.target = [];
  const step = 5;
  for (let y = 0; y < TRACE_SIZE; y += step) {
    for (let x = 0; x < TRACE_SIZE; x += step) {
      if (data[(y * TRACE_SIZE + x) * 4 + 3] > 40) TR.target.push({ x, y });
    }
  }
  TR.mask = maskC;
  TR.painted = 0;
  const word = traceWordFor(L);
  $('traceHint').textContent = word ? `Traza la ${L} · ${L} de ${word}` : `Traza la letra ${L}`;
  traceProgUI();
}

function traceProgUI() {
  const bar = $('traceProg'); if (!bar) return;
  const pct = TR.target.length ? clamp(TR.painted / TR.target.length, 0, 1) : 0;
  bar.style.width = (pct * 100).toFixed(1) + '%';
  bar.classList.toggle('full', TR.done);
}

function traceClear() {
  const ink = $('traceInk'); if (!ink || !TR.letter) return;
  beep(true);
  ink.getContext('2d').clearRect(0, 0, TRACE_SIZE, TRACE_SIZE);
  TR.painted = 0; TR.strokes = 0; TR.events = 0; TR.done = false; TR.lastPt = null;
  traceProgUI();
}

/* conecta el trazo del niño con el canvas de tinta */
(function () {
  let drawing = false;
  function ptOf(ev) {
    const c = $('traceInk'); if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * (TRACE_SIZE / r.width), y: (ev.clientY - r.top) * (TRACE_SIZE / r.height) };
  }
  function paintDot(pt) {
    const k = $('traceInk').getContext('2d');
    k.save();
    k.globalCompositeOperation = 'source-over';
    k.strokeStyle = '#FFD54A'; k.lineWidth = 30;
    k.lineCap = 'round'; k.lineJoin = 'round';
    if (TR.lastPt) { k.beginPath(); k.moveTo(TR.lastPt.x, TR.lastPt.y); k.lineTo(pt.x, pt.y); k.stroke(); }
    else { k.beginPath(); k.arc(pt.x, pt.y, 15, 0, Math.PI * 2); k.fillStyle = '#FFD54A'; k.fill(); }
    k.restore();
    /* recorta la tinta a la silueta de la letra */
    k.save();
    k.globalCompositeOperation = 'destination-in';
    k.drawImage(TR.mask, 0, 0);
    k.restore();
    /* cobertura: marca objetivos tocados (radio 17px) */
    let added = 0;
    for (let i = 0; i < TR.target.length; i++) {
      const t = TR.target[i];
      if (t.p) continue;
      const dx = t.x - pt.x, dy = t.y - pt.y;
      if (dx * dx + dy * dy <= 289) { t.p = 1; added++; }
    }
    if (added) {
      TR.painted += added; TR.events++;
      traceProgUI();
      const cov = TR.painted / TR.target.length;
      if (!TR.done && cov >= TRACE_COVER && TR.events >= TRACE_MIN_EVENTS) traceComplete();
    }
  }
  document.addEventListener('pointerdown', ev => {
    if (!TR.on || TR.done || ev.target.id !== 'traceInk') return;
    drawing = true; TR.lastPt = null; TR.strokes++;
    try { ev.target.setPointerCapture(ev.pointerId); } catch (e) {}
    const pt = ptOf(ev); if (pt) paintDot(pt); TR.lastPt = pt;
  });
  document.addEventListener('pointermove', ev => {
    if (!drawing || TR.done || ev.target.id !== 'traceInk') return;
    const pt = ptOf(ev); if (pt) { paintDot(pt); TR.lastPt = pt; }
  });
  document.addEventListener('pointerup', () => { drawing = false; TR.lastPt = null; });
  document.addEventListener('pointercancel', () => { drawing = false; TR.lastPt = null; });
})();

function traceComplete() {
  TR.done = true;
  const L = TR.letter, first = !((activeProfile().stats.traceLetters || {})[L]);
  const word = traceWordFor(L);
  updateProfile(p => {
    p.stats.traceLetters = p.stats.traceLetters || {};
    p.stats.traceLetters[L] = true;
    p.xp = (p.xp || 0) + (first ? 12 : 5);
    p.coins = (p.coins || 0) + (first ? 8 : 3);
    if (first) p.stars = (p.stars || 0) + 1;
  });
  saveState(); updateTopbar(); checkBadges();
  burst(45); beepWin(); buzz(35);
  const hint = $('traceHint');
  if (hint) hint.textContent = `🎉 ¡Letra ${L} completada! ${first ? '⭐ ¡Primera vez!' : ''}`;
  const chip = [...document.querySelectorAll('.tr-chip')].find(c => c.textContent === L);
  if (chip) chip.classList.add('ok');
  traceProgUI();
  TTS.speak(word
    ? [{ text: L, lang: 'en-US', rate: .68, pauseMs: 480 }, { text: `${L} is for ${word}`, lang: 'en-US', rate: .78 }]
    : [{ text: L, lang: 'en-US', rate: .68 }]);
}

/* ══════════ 2) 🎯 AHORCADO KID (Adivina la palabra) ══════════
   Versión amable sin muñeco: la foto SIEMPRE está visible como
   pista (reconocer letras, no adivinar a ciegas). 6 corazones,
   teclado A-Z grande. Palabra ganada → recompensa; sin vidas →
   se revela con cariño y se sigue. Ronda = 5 palabras. */
let HG = null;

window.startHangman = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => {
    if (it.img && /^[a-zA-Z]{3,9}$/.test(it.en)) pool.push({ w, it });
  }));
  if (pool.length < 5) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  HG = { words: shuffle(pool).slice(0, 5), wi: 0, lives: 6, wins: 0, shown: new Set(), over: false, used: new Set() };
  openModal('🎯 Adivina la palabra', `
    <div class="small" style="margin-bottom:6px" id="hgLabel">Palabra 1/5 · Mira la foto y toca las letras</div>
    <div class="hg-top">
      <div class="hg-photo" id="hgPhoto"></div>
      <div class="hg-side">
        <div class="hg-hearts" id="hgHearts"></div>
        <div class="hg-slots" id="hgSlots"></div>
      </div>
    </div>
    <div class="hg-msg" id="hgMsg">👆 Toca las letras correctas</div>
    <div class="hg-keys" id="hgKeys"></div>
    <button class="bigbtn bb-gold" id="hgNext" style="display:none">Siguiente palabra ➜</button>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="hangFinish(true)">✓ Terminar ronda</button>`);
  hangRender();
  window.PW_HANG = {
    open: () => !!HG && !!document.getElementById('hgKeys'),
    word: () => HG ? HG.words[HG.wi] && HG.words[HG.wi].it.en.toUpperCase() : '',
    lives: () => HG ? HG.lives : 0,
    wins: () => HG ? HG.wins : 0,
    games: () => (activeProfile() && activeProfile().stats.hangGames) || 0
  };
};

function hangRender() {
  const { w, it } = HG.words[HG.wi];
  HG.shown = new Set(); HG.used = new Set(); HG.over = false;
  $('hgLabel').textContent = `Palabra ${HG.wi + 1}/5 · ${w.icon} ${w.name}`;
  $('hgPhoto').innerHTML = imgTag(it.img, it.em || '✨', 'hg-img', it.en);
  $('hgMsg').textContent = '👆 Toca las letras correctas';
  $('hgNext').style.display = 'none';
  const hearts = $('hgHearts');
  hearts.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span');
    s.className = 'hg-heart'; s.textContent = '❤️';
    hearts.appendChild(s);
  }
  const word = it.en.toUpperCase();
  $('hgSlots').innerHTML = [...word].map(ch =>
    `<span class="hg-slot" data-l="${ch}">${/[A-Z]/.test(ch) ? '' : ch}</span>`).join('');
  const keys = $('hgKeys');
  keys.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(L => {
    const b = document.createElement('button');
    b.className = 'hg-key'; b.textContent = L;
    b.setAttribute('aria-label', 'Letra ' + L);
    b.onclick = () => hangGuess(L, b, word);
    keys.appendChild(b);
  });
}

window.hangGuess = function (L, btn, word) {
  if (!HG || HG.over) return;
  if (HG.used.has(L)) return;
  HG.used.add(L);
  if (!word) word = HG.words[HG.wi].it.en.toUpperCase();
  const msg = $('hgMsg');
  if (word.includes(L)) {
    btn.classList.add('hit');
    HG.shown.add(L);
    beep(true);
    document.querySelectorAll(`.hg-slot[data-l="${L}"]`).forEach(s => { s.textContent = L; s.classList.add('on'); });
    TTS.speak([{ text: L, lang: 'en-US', rate: .7 }]);
    const done = [...word].every(ch => !/[A-Z]/.test(ch) || HG.shown.has(ch));
    if (done) hangWin(word);
  } else {
    btn.classList.add('miss');
    HG.lives--;
    beep(false); buzz([50, 40, 50]);
    const hs = document.querySelectorAll('.hg-heart');
    if (hs[HG.lives]) { hs[HG.lives].textContent = '💔'; hs[HG.lives].classList.add('off'); }
    if (msg) msg.textContent = HG.lives <= 2 ? '😌 ¡Casi! Piensa en las letras de la foto…' : '🤔 Esa letra no está — ¡sigue probando!';
    if (HG.lives <= 0) hangLose(word);
  }
};

function hangWin(word) {
  HG.over = true; HG.wins++;
  const it = HG.words[HG.wi].it;
  updateProfile(p => {
    p.xp = (p.xp || 0) + 6; p.coins = (p.coins || 0) + 4;
    p.stats.hangWins = (p.stats.hangWins || 0) + 1;
    p.mastery = p.mastery || {};
    p.mastery[it.en] = (p.mastery[it.en] || 0) + 1;
  });
  saveState(); updateTopbar(); checkBadges();
  burst(40); beepWin(); buzz(35);
  $('hgMsg').innerHTML = `🎉 ¡Era <b>${word}</b>! = ${it.es}`;
  TTS.speak([{ text: it.en, lang: 'en-US', rate: .72, pauseMs: 500 }, { text: it.es, lang: 'es-ES', rate: .8 }]);
  hangNextBtn();
}

function hangLose(word) {
  HG.over = true;
  const it = HG.words[HG.wi].it;
  document.querySelectorAll('.hg-slot').forEach(s => { if (!s.textContent) { s.textContent = s.dataset.l; s.classList.add('miss-slot'); } });
  $('hgMsg').innerHTML = `🌱 ¡Casi! Era <b>${word}</b> = ${it.es}. ¡La próxima la sacas!`;
  TTS.speak([{ text: it.en, lang: 'en-US', rate: .72 }]);
  hangNextBtn();
}

function hangNextBtn() {
  const nb = $('hgNext');
  nb.style.display = '';
  nb.textContent = HG.wi >= HG.words.length - 1 ? '🏁 Ver mi ronda ➜' : 'Siguiente palabra ➜';
  nb.onclick = () => {
    beep(true);
    if (HG.wi >= HG.words.length - 1) hangFinish(false);
    else { HG.wi++; hangRender(); }
  };
}

/* fin de ronda (manual o tras 5 palabras): recompensas + insignias */
window.hangFinish = function (early) {
  if (!HG) return;
  const wins = HG.wins, played = HG.wi + (HG.over ? 1 : 0);
  HG = null;
  updateProfile(p => {
    p.stats.hangGames = (p.stats.hangGames || 0) + 1;
    if (wins === 5) { p.xp = (p.xp || 0) + 20; p.coins = (p.coins || 0) + 10; }
  });
  saveState(); checkBadges();
  closeModal();
  if (wins > 0) {
    celebrate({
      icon: '🎯',
      title: `¡${wins} palabra${wins > 1 ? 's' : ''} adivinada${wins > 1 ? 's' : ''}!`,
      sub: wins === 5 ? '¡RONDA PERFECTA! Eres un detective de letras 🕵️' : 'Cada letra cuenta. ¡Sigue así!',
      rewards: [`🎯 ${wins}/5 palabras`, wins === 5 ? '🪙 +10 de bonus' : '💪 ¡A por la ronda completa!'],
      confetti: 2, dur: 3000
    });
  } else if (!early) {
    notif('🌱 ¡Buen intento! Toca otra vez para intentarlo de nuevo', 'var(--orange)');
  }
};

/* ══════════ 3) 🖼️ ROMPECABEZAS (4 · 9 · 12 piezas) ══════════
   Fotos reales de los mundos del nivel. Toca una pieza y luego
   otra para intercambiarlas (más fácil que arrastrar para manos
   pequeñas). Botón «Ver ejemplo» (2 usos) para mirar la foto.
   Difícil 12 = 3 filas × 4 columnas. */
let PZ = null;
const PZ_LEVELS = { 4: { rows: 2, cols: 2, xp: 8, coins: 5 }, 9: { rows: 3, cols: 3, xp: 15, coins: 8 }, 12: { rows: 3, cols: 4, xp: 25, coins: 12 } };

window.startPuzzle = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  openModal('🖼️ Rompecabezas', `
    <div class="small" style="margin-bottom:8px">Elige el tamaño y toca dos piezas para intercambiarlas. ¡Arma la foto!</div>
    <div class="pz-diffs" id="pzDiffs"></div>
    <div class="pz-stage" id="pzStage">
      <div class="pz-hint">👆 Elige un tamaño</div>
    </div>
    <div class="pz-foot" id="pzFoot"></div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  const diffs = $('pzDiffs');
  [[4, 'Fácil · 4'], [9, 'Medio · 9'], [12, 'Difícil · 12']].forEach(([n, label]) => {
    const b = document.createElement('button');
    b.className = 'pz-diff'; b.textContent = label;
    b.onclick = () => { beep(true); puzzleBuild(n); };
    diffs.appendChild(b);
  });
  window.PW_PUZZLE = {
    open: () => !!PZ && !!document.getElementById('pzBoard'),
    solved: () => PZ ? PZ.solved : false,
    pieces: () => PZ ? PZ.rows * PZ.cols : 0,
    games: () => (activeProfile() && activeProfile().stats.puzzleGames) || 0
  };
};

function puzzleBuild(n) {
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => { if (it.img) pool.push({ w, it }); }));
  if (!pool.length) { notif('📚 Juega más mundos primero', 'var(--red)'); return; }
  const pick = pool[(Math.random() * pool.length) | 0];
  const img = new Image();
  img.onload = () => puzzleStart(n, pick, img);
  img.onerror = () => { notif('😕 No pude cargar esa foto, prueba otra vez', 'var(--red)'); };
  img.src = IMG(pick.it.img);
}

function puzzleStart(n, pick, img) {
  const { rows, cols } = PZ_LEVELS[n];
  PZ = { img: IMG(pick.it.img), en: pick.it.en, es: pick.it.es, em: pick.it.em || '✨', rows, cols, n,
         tiles: shuffle([...Array(n).keys()]), sel: -1, peeks: 2, moves: 0, solved: false, url: img.src };
  if (PZ.tiles.every((t, i) => t === i)) { const t = PZ.tiles[0]; PZ.tiles[0] = PZ.tiles[1]; PZ.tiles[1] = t; }
  const stage = $('pzStage');
  stage.innerHTML = '<div class="pz-board" id="pzBoard"></div>';
  const board = $('pzBoard');
  board.style.aspectRatio = (cols === 4) ? '4 / 3' : '1 / 1';
  board.dataset.rows = rows; board.dataset.cols = cols;
  for (let pos = 0; pos < n; pos++) {
    const t = document.createElement('div');
    t.className = 'pz-tile'; t.dataset.pos = pos;
    t.onclick = () => puzzleTap(pos);
    board.appendChild(t);
  }
  puzzlePaint();
  puzzleFoot();
}

function puzzlePaint() {
  const board = $('pzBoard'); if (!board || !PZ) return;
  const { rows, cols } = PZ;
  board.querySelectorAll('.pz-tile').forEach(t => {
    const pos = +t.dataset.pos;
    const cell = PZ.tiles[pos];
    const r = Math.floor(cell / cols), c = cell % cols;
    t.style.backgroundImage = `url("${PZ.url}")`;
    t.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    t.style.backgroundPosition = cols > 1 ? `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%` : 'center';
    t.classList.toggle('sel', pos === PZ.sel);
    t.classList.toggle('ok', PZ.tiles[pos] === pos);
  });
}

function puzzleFoot() {
  const f = $('pzFoot'); if (!f || !PZ) return;
  f.innerHTML = `<span class="small">🧩 ${PZ.rows * PZ.cols} piezas · ${PZ.moves} cambios</span>
    <button class="bigbtn bb-ghost bb-sm" ${PZ.peeks <= 0 ? 'disabled' : ''} onclick="puzzlePeek()">👀 Ver ejemplo (${PZ.peeks})</button>`;
}

window.puzzleTap = function (pos) {
  if (!PZ || PZ.solved) return;
  beep(true);
  if (PZ.sel === -1) { PZ.sel = pos; puzzlePaint(); return; }
  if (PZ.sel === pos) { PZ.sel = -1; puzzlePaint(); return; }
  const a = PZ.sel, b = pos;
  [PZ.tiles[a], PZ.tiles[b]] = [PZ.tiles[b], PZ.tiles[a]];
  PZ.sel = -1; PZ.moves++;
  puzzlePaint(); puzzleFoot();
  if (PZ.tiles.every((t, i) => t === i)) puzzleSolved();
};

window.puzzlePeek = function () {
  if (!PZ || PZ.peeks <= 0 || PZ.solved) return;
  PZ.peeks--;
  beep(true);
  const stage = $('pzStage');
  const ov = document.createElement('div');
  ov.className = 'pz-peek';
  ov.innerHTML = `<img src="${PZ.url}" alt="${PZ.en}">`;
  stage.appendChild(ov);
  setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 350); }, 1300);
  puzzleFoot();
};

function puzzleSolved() {
  PZ.solved = true;
  const { xp, coins } = PZ_LEVELS[PZ.n];
  updateProfile(p => {
    p.xp = (p.xp || 0) + xp; p.coins = (p.coins || 0) + coins;
    p.stats.puzzleGames = (p.stats.puzzleGames || 0) + 1;
    p.stats.puzzles = p.stats.puzzles || {};
    p.stats.puzzles[PZ.n] = (p.stats.puzzles[PZ.n] || 0) + 1;
  });
  saveState(); updateTopbar(); checkBadges();
  burst(60); beepWin(); buzz(35);
  const stage = $('pzStage');
  stage.innerHTML = `<div class="pz-done">
      <img src="${PZ.url}" alt="${PZ.en}">
      <div class="pz-done-word">${PZ.en}</div>
      <div class="pz-done-es">${PZ.es} · 🧩 ${PZ.moves} cambios</div>
      <div class="pz-done-rew">✨ +${xp} XP · 🪙 +${coins}</div>
    </div>
    <div class="pz-foot" id="pzFoot2"><button class="bigbtn bb-gold bb-sm" onclick="puzzleAgain()">🔄 Otro rompecabezas</button></div>`;
  TTS.speak([{ text: PZ.en, lang: 'en-US', rate: .74, pauseMs: 480 }, { text: PZ.es, lang: 'es-ES', rate: .8 }]);
}

/* ══════════ 4) 🔢 UNIR CON PUNTOS ══════════
   Figuras simples definidas como polilínea cerrada (coordenadas
   normalizadas 0–1). El niño toca los puntos EN ORDEN: cada acierto
   dibuja un tramo; el siguiente punto brilla pulsando. Sin fallos:
   tocar el punto equivocado solo mueve un temblor amable. Al cerrar
   la figura se rellena, habla su nombre y cae confeti.
   Corazón y Sol se generan por fórmula (puntos perfectos). */
const DOTS_SIZE = 320;
const DOTS_SHAPES = [
  { id: 'star', en: 'Star', es: 'Estrella', em: '⭐', pts: [
    [.500, .030], [.613, .356], [.951, .362], [.681, .572], [.780, .905],
    [.500, .702], [.220, .905], [.319, .572], [.049, .362], [.387, .356]] },
  { id: 'house', en: 'House', es: 'Casa', em: '🏠', pts: [
    [.150, .950], [.150, .500], [.500, .130], [.850, .500], [.850, .950],
    [.620, .950], [.620, .720], [.380, .720], [.380, .950]] },
  { id: 'rocket', en: 'Rocket', es: 'Cohete', em: '🚀', pts: [
    [.500, .050], [.680, .300], [.820, .750], [.660, .700], [.500, .900],
    [.340, .700], [.180, .750], [.320, .300]] },
  { id: 'tree', en: 'Tree', es: 'Árbol', em: '🌳', pts: [
    [.500, .040], [.860, .430], [.600, .500], [.600, .720], [.680, .950],
    [.320, .950], [.400, .720], [.400, .500], [.140, .430]] },
  { id: 'fish', en: 'Fish', es: 'Pez', em: '🐟', pts: [
    [.070, .500], [.300, .300], [.620, .230], [.930, .500], [.620, .770], [.300, .700]] },
  { id: 'heart', en: 'Heart', es: 'Corazón', em: '❤️', pts: heartPts(14) },
];
function heartPts(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    out.push([clamp(.5 + x / 40, .04, .96), clamp(.52 - y / 36, .04, .96)]);
  }
  return out;
}
let DN = null;

window.startDots = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  openModal('🔢 Unir con puntos', `
    <div class="small" style="margin-bottom:8px">Toca los puntos <b>en orden 1, 2, 3…</b> y descubre la figura secreta.</div>
    <div class="dots-chips" id="dotsChips"></div>
    <div class="dots-box"><canvas id="dotsCv" width="${DOTS_SIZE}" height="${DOTS_SIZE}"></canvas></div>
    <div class="small" style="text-align:center;margin-top:6px" id="dotsMsg">👆 Elige una figura</div>
  `, `<button class="bigbtn bb-ghost bb-sm" onclick="dotsRestart()">🔄 Empezar de nuevo</button>
      <button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  const chips = $('dotsChips');
  DOTS_SHAPES.forEach(s => {
    const done = !!((activeProfile().stats.dotsShapes || {})[s.id]);
    const chip = document.createElement('button');
    chip.className = 'dot-chip' + (done ? ' ok' : '');
    chip.innerHTML = `${s.em} ${s.es}`;
    chip.onclick = () => dotsPick(s.id);
    chips.appendChild(chip);
  });
  window.PW_DOTS = {
    open: () => !!DN && !!document.getElementById('dotsCv'),
    shape: () => DN ? DN.shape.id : '',
    next: () => DN ? DN.next : 0,
    done: () => DN ? DN.done : false,
    total: () => Object.keys((activeProfile() && activeProfile().stats.dotsShapes) || {}).length
  };
};

window.dotsPick = function (id) {
  const s = DOTS_SHAPES.find(x => x.id === id); if (!s) return;
  beep(true);
  DN = { shape: s, next: 0, done: false };
  const msg = $('dotsMsg');
  if (msg) msg.textContent = `Toca el punto 1 para empezar ${s.em}`;
  document.querySelectorAll('.dot-chip').forEach(c => c.classList.remove('on'));
  [...document.querySelectorAll('.dot-chip')].find(c => c.textContent.includes(s.es)).classList.add('on');
  dotsDraw();
};

function dotsRestart() {
  if (DN) { DN.next = 0; DN.done = false; dotsDraw(); const msg = $('dotsMsg'); if (msg) msg.textContent = `Toca el punto 1 ${DN.shape.em}`; }
}

function dotsDraw() {
  const cv = $('dotsCv'); if (!cv || !DN) return;
  const ctx = cv.getContext('2d');
  const S = DOTS_SIZE, s = DN.shape;
  const P = s.pts.map(([x, y]) => [x * S, y * S]);
  ctx.clearRect(0, 0, S, S);
  /* tramos ya unidos */
  if (DN.next > 0) {
    ctx.strokeStyle = '#FFD54A'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(P[0][0], P[0][1]);
    for (let i = 1; i < DN.next; i++) ctx.lineTo(P[i][0], P[i][1]);
    if (DN.done) ctx.closePath();
    ctx.stroke();
  }
  /* relleno al completar */
  if (DN.done) {
    ctx.save();
    const gr = ctx.createLinearGradient(0, 0, S, S);
    gr.addColorStop(0, 'rgba(255,213,74,.55)'); gr.addColorStop(1, 'rgba(255,140,66,.45)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(P[0][0], P[0][1]);
    P.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath(); ctx.fill();
    ctx.font = '56px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.em, S / 2, S / 2);
    ctx.restore();
  }
  /* puntos */
  P.forEach(([x, y], i) => {
    const isNext = !DN.done && i === DN.next;
    const done = i < DN.next;
    ctx.beginPath(); ctx.arc(x, y, isNext ? 15 : 12, 0, Math.PI * 2);
    ctx.fillStyle = done ? '#FFD54A' : isNext ? '#7CFCB0' : 'rgba(255,255,255,.85)';
    ctx.fill();
    if (isNext) {
      ctx.beginPath(); ctx.arc(x, y, 21 + Math.sin(Date.now() / 220) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124,252,176,.8)'; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.fillStyle = '#141026';
    ctx.font = '800 14px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x, y + 1);
  });
  if (!DN.done) requestAnimationFrame(dotsDraw); /* pulso del punto siguiente */
}

/* tap en el canvas: hit-test del punto siguiente (radio generoso 30px) */
(function () {
  document.addEventListener('pointerdown', ev => {
    if (!DN || DN.done || ev.target.id !== 'dotsCv') return;
    const cv = $('dotsCv'), r = cv.getBoundingClientRect();
    const x = (ev.clientX - r.left) * (DOTS_SIZE / r.width);
    const y = (ev.clientY - r.top) * (DOTS_SIZE / r.height);
    const s = DN.shape, S = DOTS_SIZE;
    const P = s.pts.map(([px, py]) => [px * S, py * S]);
    const [tx, ty] = P[DN.next];
    const d = Math.hypot(tx - x, ty - y);
    if (d <= 30) {
      DN.next++;
      beep(true);
      if (DN.next >= P.length) dotsComplete();
      else { const m = $('dotsMsg'); if (m) m.textContent = `¡Bien! Ahora el punto ${DN.next + 1}`; }
      dotsDraw();
    } else {
      /* amable: temblor del canvas + pista del número buscado */
      beep(false);
      const box = cv.closest('.dots-box');
      if (box) { box.classList.remove('wiggle'); void box.offsetWidth; box.classList.add('wiggle'); }
      const m = $('dotsMsg');
      if (m) m.textContent = `👀 Busca el punto ${DN.next + 1} (el que brilla en verde)`;
    }
  });
})();

function dotsComplete() {
  DN.done = true;
  const s = DN.shape;
  const first = !((activeProfile().stats.dotsShapes || {})[s.id]);
  updateProfile(p => {
    p.stats.dotsShapes = p.stats.dotsShapes || {};
    p.stats.dotsShapes[s.id] = true;
    p.xp = (p.xp || 0) + (first ? 10 : 5);
    p.coins = (p.coins || 0) + (first ? 6 : 3);
  });
  saveState(); updateTopbar(); checkBadges();
  burst(50); beepWin(); buzz(35);
  const msg = $('dotsMsg');
  if (msg) msg.textContent = `🎉 ¡Es una ${s.es}! ${s.en} ${first ? '· ⭐ ¡Primera vez!' : ''}`;
  const chip = [...document.querySelectorAll('.dot-chip')].find(c => c.textContent.includes(s.es));
  if (chip) chip.classList.add('ok');
  dotsDraw();
  TTS.speak([{ text: s.en, lang: 'en-US', rate: .74, pauseMs: 480 }, { text: s.es, lang: 'es-ES', rate: .8 }]);
}

/* ══════════ 5) 🗓️ RETOS DEL FIN DE SEMANA ══════════
   Tarjeta en el mapa SOLO sábados y domingos (entre semana, una
   insinuación para generar expectativa). 3 retos medibles con
   datos que la app YA registra: misiones de hoy (v7), aciertos de
   hoy (v14, contador aditivo en coreReward) y Palabra del Día
   (v11). Recompensa al completar los 3: 1 vez por día de finde. */
function weekKey(d) {
  d = d || new Date();
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (dt.getDay() + 6) % 7;                 // lunes=0 … domingo=6
  dt.setDate(dt.getDate() - day + 3);                // jueves de la semana (norma ISO)
  const y = dt.getFullYear();
  const jan1 = new Date(y, 0, 1);
  const wk = Math.ceil(((dt - jan1) / 864e5 + jan1.getDay() + 1) / 7);
  return y + '-S' + String(wk).padStart(2, '0');
}
function weekendRetos(p) {
  const t = todayStr();
  const miss = ((p.stats.missionsByDay || {})[t]) || 0;
  const corr = ((p.stats.correctByDay || {})[t]) || 0;
  const wotd = !!((p.stats.wotdDays || {})[t]);
  return [
    { icon: '🎯', txt: 'Completa 2 misiones', have: Math.min(miss, 2), goal: 2 },
    { icon: '✅', txt: 'Acierta 10 respuestas', have: Math.min(corr, 10), goal: 10 },
    { icon: '📆', txt: 'Escucha la Palabra del Día', have: wotd ? 1 : 0, goal: 1 },
  ];
}
window.renderWeekendCard = function (p) {
  const isWknd = [0, 6].includes(new Date().getDay());
  let host = $('weekendZone');
  if (!host) {
    host = document.createElement('div');
    host.id = 'weekendZone';
    const spin = $('spinZone');
    const gz = $('gamesZone');
    if (spin && spin.parentNode) spin.parentNode.insertBefore(host, spin);
    else if (gz && gz.parentNode) gz.parentNode.insertBefore(host, gz);
  }
  if (!isWknd) {
    host.innerHTML = `<div class="wknd-teaser">🗓️ Los <b>retos del fin de semana</b> se abren el sábado 🎉</div>`;
    return;
  }
  const t = todayStr();
  const retos = weekendRetos(p);
  const claimed = !!((p.stats.weekendClaimed || {})[t]);
  const allDone = retos.every(r => r.have >= r.goal);
  host.innerHTML = `<div class="wknd-card${allDone ? ' done' : ''}">
    <div class="wknd-head">🗓️ Retos del fin de semana <span class="wknd-day">${new Date().toLocaleDateString('es-ES', { weekday: 'long' })}</span></div>
    ${retos.map(r => `
      <div class="wknd-row${r.have >= r.goal ? ' ok' : ''}">
        <span class="wr-ico">${r.icon}</span>
        <div class="wr-mid">
          <div class="wr-txt">${r.txt}</div>
          <div class="wr-bar"><span style="width:${(r.have / r.goal) * 100}%"></span></div>
        </div>
        <b class="wr-n">${r.have}/${r.goal}</b>
      </div>`).join('')}
    ${claimed
      ? '<div class="wknd-claimed">✅ ¡Retos de hoy completados! Vuelve mañana 🌟</div>'
      : allDone
        ? '<button class="bigbtn bb-gold bb-sm" onclick="claimWeekend()">🎁 Reclamar 🪙+30 ✨+50</button>'
        : '<div class="small" style="opacity:.75">Completa los 3 y gana el premio del finde 🎁</div>'}
  </div>`;
};

window.claimWeekend = function () {
  const p = activeProfile(); if (!p) return;
  const t = todayStr();
  if (!weekendRetos(p).every(r => r.have >= r.goal)) return;
  if ((p.stats.weekendClaimed || {})[t]) return;
  updateProfile(pp => {
    pp.stats.weekendClaimed = pp.stats.weekendClaimed || {};
    pp.stats.weekendClaimed[t] = true;
    pp.stats.weekendDays = pp.stats.weekendDays || {};
    pp.stats.weekendDays[t] = true;
    pp.coins = (pp.coins || 0) + 30; pp.xp = (pp.xp || 0) + 50; pp.stars = (pp.stars || 0) + 1;
  });
  saveState(); updateTopbar(); checkBadges();
  burst(70); beepWin();
  celebrate({
    icon: '🗓️',
    title: '¡Retos del fin de semana completados!',
    sub: 'Misiones, aciertos y Palabra del Día: ¡todo hoy!',
    rewards: ['🪙 +30 Monedas', '✨ +50 XP', '⭐ +1 Estrella'],
    confetti: 3, dur: 3200
  });
  renderWeekendCard(activeProfile());
};

/* ganchos de prueba/evidencia (no alteran la UI normal) */
window.PW_WEEKEND = {
  info: () => ({ weekend: [0, 6].includes(new Date().getDay()), week: weekKey() }),
  retos: () => activeProfile() ? weekendRetos(activeProfile()) : null,
  state: () => {
    const p = activeProfile(); if (!p) return null;
    return {
      claimedDays: Object.keys(p.stats.weekendDays || {}).length,
      claimedToday: !!((p.stats.weekendClaimed || {})[todayStr()]),
      allDone: weekendRetos(p).every(r => r.have >= r.goal)
    };
  },
  claim: claimWeekend
};
