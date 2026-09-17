/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAMES v14 «Taller de Juegos»
   1) ✏️ Traza la letra   (canvas + pointer events, tolerante)
   2) 🔤 Adivina la palabra (ahorcado suave: sin dibujos tristes)
   3) 🖼️ Rompecabezas      (4 · 9 · 12 piezas, toca y cambia)
   4) ⭐ Une los puntos    (dibujo punto a punto con palabra)
   5) 🎪 Reto del fin de semana (misión mixta + bono)
   Todo 100% local, sin nuevas dependencias, motor de misiones
   intacto (bootGameMission + coreReward/coreFail/endMission).
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 1) ✏️ TRAZA LA LETRA ══════════ */
/* Letras A-Z con palabra de ejemplo que YA tiene foto real en la app.
   [letra, palabra EN, traducción ES, clave de imagen] */
const TRACE_ABC = [
  ['A','apple','manzana','apple'], ['B','ball','pelota','ball'],
  ['C','cat','gato','cat'],       ['D','dog','perro','dog'],
  ['E','egg','huevo','egg'],      ['F','fish','pez','fish'],
  ['G','grapes','uvas','grapes'], ['H','hat','sombrero','hat'],
  ['I','icecream','helado','icecream'], ['J','jet','avión','jet'],
  ['K','kite','cometa','kite'],   ['L','lion','león','lion'],
  ['M','moon','luna','moon'],     ['N','nose','nariz','nose'],
  ['O','orange','naranja','orange'], ['P','pizza','pizza','pizza'],
  ['Q','queen','reina','queen'],  ['R','rain','lluvia','rain'],
  ['S','sun','sol','sun'],        ['T','tree','árbol','tree'],
  ['U','umbrella','paraguas','umbrella'], ['V','violin','violín','violin'],
  ['W','water','agua','water'],   ['X','xylophone','xilófono','xylophone'],
  ['Y','yoyo','yoyó','yoyo'],     ['Z','zebra','cebra','zebra'],
];
/* Estado del trazado actual (una letra) */
const TR = { marked: [], guide: [], strokes: [], drawing: false, cov: 0, done: false, lastX: 0, lastY: 0 };
window.TR = TR; // accesible para tests/evidencia

window.startTraceMission = function () {
  beep(true);
  const picks = shuffle(TRACE_ABC).slice(0, 6);
  const qs = picks.map(([L, w, es, img]) => ({
    letter: L, item: { en: w, es, img, em: '✏️' }
  }));
  bootGameMission('trace', 'Traza la Letra', 'Trazado de letras', '✏️', qs, renderTraceQuestion);
  G.countPerfect = false; // trazar es práctica creativa: no infla «misiones perfectas»
};

function renderTraceQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Letra ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '✏️ Traza la letra ' + q.letter;
  $('qInstruction').textContent = 'Pinta la letra grande con el dedo · Trace the letter!';
  const wEl = $('qWord'); wEl.className = 'q-big-word'; wEl.style.display = 'none';
  $('qTrans').textContent = q.item.en + ' · ' + q.item.es;
  const og = $('optsGrid'); og.className = 'opts-grid'; og.style.display = 'none'; og.innerHTML = '';
  $('qVisual').innerHTML = `
    <div class="tr-wrap">
      <canvas id="trCanvas" class="tr-canvas" width="340" height="340"></canvas>
      <div class="tr-bar"><div class="tr-fill" id="trFill" style="width:0%"></div></div>
      <div class="tr-foot">
        <button class="bigbtn bb-ghost bb-sm" onclick="traceClear()">🧹 Borrar</button>
        <div class="tr-photo">${imgTag(q.item.img, q.item.em, 'tr-photo-img', q.item.en)}<span>${q.item.en}</span></div>
      </div>
    </div>`;
  traceInit(q);
}

function traceInit(q) {
  TR.guide = []; TR.marked = []; TR.strokes = [];
  TR.cov = 0; TR.done = false; TR.drawing = false;
  const cv = $('trCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const draw = () => traceBuildGuide(cv, ctx, q.letter);
  draw();
  // si la fuente de identidad llega tarde, redibuja la guía con «Baloo 2»
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!TR.done && TR.strokes.length === 0) draw(); }).catch(() => {});
  // soporte puntero unificado (ratón, táctil y lápiz)
  if (cv.dataset.bound) return; // bind una sola vez
  cv.dataset.bound = '1';
  const pos = e => {
    const r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height)];
  };
  cv.addEventListener('pointerdown', e => {
    if (TR.done) return;
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    TR.drawing = true;
    const [x, y] = pos(e);
    TR.lastX = x; TR.lastY = y;
    TR.strokes.push({ pts: [[x, y]] });
    traceMark(x, y);
    tracePaint(ctx);
  });
  cv.addEventListener('pointermove', e => {
    if (!TR.drawing || TR.done) return;
    e.preventDefault();
    const [x, y] = pos(e);
    // interpola para que movimientos rápidos no dejen huecos
    const d = Math.hypot(x - TR.lastX, y - TR.lastY);
    const steps = Math.max(1, Math.floor(d / 4));
    const cur = TR.strokes[TR.strokes.length - 1];
    for (let i = 1; i <= steps; i++) {
      const ix = TR.lastX + (x - TR.lastX) * i / steps;
      const iy = TR.lastY + (y - TR.lastY) * i / steps;
      cur.pts.push([ix, iy]);
      traceMark(ix, iy);
    }
    TR.lastX = x; TR.lastY = y;
    tracePaint(ctx);
  });
  const up = e => { TR.drawing = false; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('pointerleave', up);
}

/* Rasteriza la letra y guarda sus puntos-guía (muestreo cada 5px) */
function traceBuildGuide(cv, ctx, letter) {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save();
  ctx.font = '900 250px "Baloo 2", Nunito, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,.13)';
  ctx.fillText(letter, 170, 182);
  ctx.restore();
  // puntos guía desde un canvas oculto
  const off = document.createElement('canvas');
  off.width = cv.width; off.height = cv.height;
  const octx = off.getContext('2d');
  octx.font = '900 250px "Baloo 2", Nunito, sans-serif';
  octx.textAlign = 'center'; octx.textBaseline = 'middle';
  octx.fillStyle = '#fff';
  octx.fillText(letter, 170, 182);
  try {
    const data = octx.getImageData(0, 0, off.width, off.height).data;
    TR.guide = [];
    for (let y = 0; y < off.height; y += 5) {
      for (let x = 0; x < off.width; x += 5) {
        if (data[(y * off.width + x) * 4 + 3] > 100) TR.guide.push([x, y, false]); // x, y, marcado
      }
    }
  } catch (e) { TR.guide = []; }
  TR.marked = []; TR.cov = 0;
  tracePaint(ctx);
}

/* Marca los puntos-guía cerca del trazo (radio tolerante 30px) */
function traceMark(x, y) {
  const R = 30, R2 = R * R;
  let newly = 0;
  for (const p of TR.guide) {
    if (p[2]) continue;
    const dx = p[0] - x, dy = p[1] - y;
    if (dx * dx + dy * dy <= R2) { p[2] = true; TR.marked.push(p); newly++; }
  }
  if (TR.guide.length) TR.cov = TR.marked.length / TR.guide.length;
  return newly;
}

function tracePaint(ctx) {
  const cv = ctx.canvas;
  ctx.clearRect(0, 0, cv.width, cv.height);
  // guía tenue
  ctx.save();
  ctx.font = '900 250px "Baloo 2", Nunito, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,.13)';
  ctx.fillText(G.questions[G.qi].letter, 170, 182);
  ctx.restore();
  // progreso dorado sobre la guía
  ctx.fillStyle = 'rgba(255,215,0,.5)';
  for (const p of TR.marked) { ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill(); }
  // trazos del niño
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = .92;
  for (const s of TR.strokes) {
    if (s.pts.length === 1) { ctx.beginPath(); ctx.arc(s.pts[0][0], s.pts[0][1], 10, 0, Math.PI * 2); ctx.fillStyle = '#FFD700'; ctx.fill(); continue; }
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // punto de inicio verde (primera guía marcada o primera de la lista)
  const st = (TR.marked[0] || TR.guide[0]);
  if (st) { ctx.beginPath(); ctx.arc(st[0], st[1], 9, 0, Math.PI * 2); ctx.fillStyle = '#2ECC71'; ctx.fill(); }
  const fill = $('trFill');
  if (fill) fill.style.width = Math.min(100, Math.round(TR.cov / .5 * 100)) + '%';
  // éxito tolerante: 50% de la letra cubierta basta para celebrar
  if (!TR.done && TR.cov >= .5 && TR.guide.length) {
    TR.done = true;
    traceSuccess();
  }
}

function traceSuccess() {
  const q = G.questions[G.qi];
  const fill = $('trFill'); if (fill) fill.style.width = '100%';
  const cv = $('trCanvas');
  const r = cv ? cv.getBoundingClientRect() : null;
  burst(45);
  beep(true); buzz(35);
  if (r) floatXP('+12 XP', r.left + r.width / 2, r.top + r.height / 2);
  TTS.speak([
    { text: q.letter, lang: 'en-US', rate: .68, pauseMs: 480 },
    { text: q.item.en, lang: 'en-US', rate: .78, pauseMs: 0 }
  ]);
  coreReward(q.item, null);
  showFeedback(true, '¡Letra ' + q.letter + ' trazada! ✏️', q.item.en + ' = ' + q.item.es);
}
window.traceClear = function () {
  if (TR.done) return;
  TR.strokes = []; TR.guide.forEach(p => { p[2] = false; });
  TR.marked = []; TR.cov = 0;
  const cv = $('trCanvas');
  if (cv) tracePaint(cv.getContext('2d'));
  beep(true);
};

/* ══════════ 2) 🔤 ADIVINA LA PALABRA (ahorcado suave) ══════════ */
/* Versión infantil sin dibujos tristes: la foto da la pista y los
   corazones de siempre marcan los intentos. Al ganar se pronuncia
   la palabra; al perder se enseña y se guarda para el Repaso. */
const HG = { used: {}, wrong: 0, won: false, lock: false };
window.HG = HG; // accesible para tests/evidencia

window.startHangMission = function () {
  beep(true);
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => {
    const L = (it.en || '').length;
    if (it.img && spellableItem(it.en) && L >= 3 && L <= 8) pool.push({ w, it });
  }));
  if (pool.length < 5) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const qs = shuffle(pool).slice(0, 5).map(({ w, it }) => ({ item: it, word: it.en.toUpperCase(), w }));
  bootGameMission('hang', 'Adivina la Palabra', 'palabra secreta', '🔤', qs, renderHangQuestion);
};

function renderHangQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Palabra ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn'); if (lb) lb.style.display = 'none'; // el audio diría la respuesta
  $('qBadge').textContent = '🔤 Palabra secreta';
  $('qInstruction').textContent = 'Mira la foto y toca las letras';
  const wEl = $('qWord');
  wEl.className = 'q-big-word hs-slots';
  wEl.style.display = '';
  wEl.innerHTML = [...q.word].map(() => '<span class="hs-slot"></span>').join('');
  $('qTrans').textContent = 'Un intento por letra · 5 corazones ❤️';
  $('qVisual').innerHTML = imgTag(q.item.img, q.item.em, 'q-big-img', q.item.en);
  HG.used = {}; HG.wrong = 0; HG.won = false; HG.lock = false;
  const og = $('optsGrid');
  og.className = 'opts-grid hang-kb';
  og.style.display = '';
  og.innerHTML = '';
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const b = document.createElement('button');
    b.className = 'hang-key';
    b.textContent = ch;
    b.dataset.letter = ch;
    b.onclick = () => hangTap(ch);
    og.appendChild(b);
  }
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
}

window.hangTap = function (ch) {
  const q = G.questions[G.qi];
  if (!G.active || !q || HG.lock || HG.won || HG.used[ch]) return;
  HG.used[ch] = true;
  const key = document.querySelector('.hang-key[data-letter="' + ch + '"]');
  const hits = [...q.word].map((c, i) => c === ch ? i : -1).filter(i => i >= 0);
  if (hits.length) {
    if (key) { key.classList.add('ok'); key.disabled = true; }
    hits.forEach(i => {
      const s = document.querySelectorAll('.hs-slot')[i];
      if (s) { s.textContent = ch; s.classList.add('fill'); }
    });
    beep(true); buzz(20);
    // ¿palabra completa?
    const left = [...q.word].filter(c => !HG.used[c]).length;
    if (left === 0) {
      HG.won = true; HG.lock = true;
      coreReward(q.item, null);
      TTS.sayWord(q.item.en, q.item.es, 'words');
      burst(40);
      showFeedback(true, '¡Adivinaste! 🎉', q.item.en + ' = ' + q.item.es);
    }
  } else {
    if (key) { key.classList.add('miss'); key.disabled = true; }
    HG.wrong++;
    beep(false); buzz([50, 40, 50]);
    if (HG.wrong >= 5) {
      HG.lock = true;
      // revela la palabra completa (momento de enseñar, nunca de castigar)
      document.querySelectorAll('.hs-slot').forEach((s, i) => { s.textContent = q.word[i]; s.classList.add('fill', 'rev'); });
      recordMistake((q.w && q.w.id) || 'hang', q.item);
      const res = coreFail(q);
      if (res === 'dead') return;
    }
  }
  updateTopbar();
};

/* ══════════ 3) 🖼️ ROMPECABEZAS (4 · 9 · 12 piezas) ══════════ */
/* Foto real de la app cortada en piezas con background-position.
   Mecánica amable «toca una, toca otra»: sin arrastrar, sin tiempo,
   sin errores — solo la alegría de armar. El niño elige el tamaño. */
const PZ = { diff: 9, sel: -1, tiles: [], solved: false };
window.PZ = PZ; // accesible para tests/evidencia

window.startPuzzleMission = function (diff) {
  beep(true);
  if (!diff) {
    openModal('🖼️ Rompecabezas', `
      <div style="text-align:center;padding:4px 0">
        <div style="font-weight:900;margin-bottom:10px">¿De cuántas piezas?</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="bigbtn bb-green bb-sm" onclick="closeModal();startPuzzleMission(4)">🟩 4 piezas</button>
          <button class="bigbtn bb-gold bb-sm" onclick="closeModal();startPuzzleMission(9)">🟨 9 piezas</button>
          <button class="bigbtn bb-purple bb-sm" onclick="closeModal();startPuzzleMission(12)">🟪 12 piezas</button>
        </div>
        <div class="small" style="margin-top:10px">Toca una pieza y luego otra para cambiarlas de lugar</div>
      </div>`,
      `<button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cancelar</button>`);
    return;
  }
  PZ.diff = +diff || 9;
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => { if (it.img) pool.push({ w, it }); }));
  if (pool.length < 5) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const qs = shuffle(pool).slice(0, 5).map(({ w, it }) => ({ item: it, w }));
  bootGameMission('puzzle', 'Rompecabezas', 'arma la foto', '🖼️', qs, renderPuzzleQuestion);
  G.countPerfect = false; // armar es creatividad: no infla «perfectas»
};

function pzGeom() {
  const n = PZ.diff;
  const cols = n === 4 ? 2 : n === 9 ? 3 : 4;
  const rows = Math.round(n / cols);
  return { cols, rows };
}

function renderPuzzleQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Puzzle ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn'); if (lb) lb.style.display = 'none';
  $('qBadge').textContent = '🖼️ Rompecabezas';
  $('qInstruction').textContent = 'Toca dos piezas para cambiarlas de lugar';
  const wEl = $('qWord'); wEl.className = 'q-big-word'; wEl.style.display = 'none';
  $('qTrans').textContent = q.item.en + ' · ' + q.item.es;
  const og = $('optsGrid'); og.className = 'opts-grid'; og.style.display = 'none'; og.innerHTML = '';
  const { cols, rows } = pzGeom();
  // baraja hasta que NO esté resuelta de entrada
  PZ.tiles = [...Array(PZ.diff).keys()];
  let guard = 0;
  do { PZ.tiles = shuffle(PZ.tiles); } while (PZ.tiles.every((v, i) => v === i) && guard++ < 50);
  PZ.sel = -1; PZ.solved = false;
  $('qVisual').innerHTML = `
    <div class="pz-wrap">
      <div class="pz-head">${imgTag(q.item.img, q.item.em, 'pz-ref-img', q.item.en)}<span class="small">modelo 👈</span></div>
      <div class="pz-grid" id="pzGrid" style="grid-template-columns:repeat(${cols},1fr);aspect-ratio:${cols}/${rows}"></div>
    </div>`;
  pzPaint();
}

function pzPaint() {
  const q = G.questions[G.qi];
  const { cols, rows } = pzGeom();
  const grid = $('pzGrid'); if (!grid) return;
  grid.innerHTML = '';
  PZ.tiles.forEach((pc, i) => {
    const t = document.createElement('div');
    t.className = 'pz-tile' + (PZ.sel === i ? ' sel' : '') + (PZ.solved ? ' done' : '');
    t.style.backgroundImage = `url(${IMG(q.item.img)})`;
    t.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    t.style.backgroundPosition = `${(pc % cols) * 100 / (cols - 1)}% ${Math.floor(pc / cols) * 100 / (rows - 1)}%`;
    t.onclick = () => pzTap(i);
    grid.appendChild(t);
  });
}

function pzTap(i) {
  if (PZ.solved || !G.active) return;
  if (PZ.sel === -1) {
    PZ.sel = i; beep(true); buzz(15);
  } else if (PZ.sel === i) {
    PZ.sel = -1; beep(true);
  } else {
    [PZ.tiles[PZ.sel], PZ.tiles[i]] = [PZ.tiles[i], PZ.tiles[PZ.sel]];
    PZ.sel = -1;
    pzPaint();
    if (PZ.tiles.every((v, idx) => v === idx)) {
      PZ.solved = true;
      pzWin();
    } else beep(true);
  }
  pzPaint();
}

function pzWin() {
  const q = G.questions[G.qi];
  const grid = $('pzGrid');
  const r = grid ? grid.getBoundingClientRect() : null;
  burst(50); beep(true); buzz(35);
  if (r) floatXP('+12 XP', r.left + r.width / 2, r.top + r.height / 2);
  TTS.sayWord(q.item.en, q.item.es, 'words');
  coreReward(q.item, null);
  showFeedback(true, '¡Rompecabezas listo! 🧩', q.item.en + ' = ' + q.item.es);
  updateTopbar();
}

/* ══════════ 4) ⭐ UNE LOS PUNTOS ══════════ */
/* Dibujo punto a punto con números. Sin penalizaciones: si toca
   mal, el punto correcto parpadea. Al terminar: palabra + foto. */
const DOTS_SHAPES = [
  { en: 'star',  es: 'estrella', img: 'star',  pts: [[.5,.08],[.61,.38],[.93,.38],[.67,.57],[.76,.88],[.5,.69],[.24,.88],[.33,.57],[.07,.38],[.39,.38]] },
  { en: 'house', es: 'casa',     img: 'house', pts: [[.18,.82],[.18,.5],[.5,.2],[.82,.5],[.82,.82],[.66,.82],[.66,.62],[.34,.62],[.34,.82]] },
  { en: 'fish',  es: 'pez',      img: 'fish',  pts: [[.1,.5],[.3,.32],[.55,.3],[.78,.42],[.92,.32],[.86,.5],[.92,.68],[.78,.58],[.55,.7],[.3,.68]] },
  { en: 'heart', es: 'corazón',  img: 'heart', pts: [[.5,.85],[.2,.55],[.1,.35],[.24,.18],[.44,.24],[.5,.36],[.56,.24],[.76,.18],[.9,.35],[.8,.55]] },
  { en: 'tent',  es: 'tienda',   img: 'tent',  pts: [[.5,.18],[.1,.82],[.4,.82],[.5,.55],[.6,.82],[.9,.82]] },
  { en: 'tree',  es: 'árbol',    img: 'tree',  pts: [[.5,.12],[.28,.42],[.4,.42],[.18,.68],[.4,.68],[.4,.86],[.6,.86],[.6,.68],[.82,.68],[.6,.42],[.72,.42]] },
];
const DT = { next: 0, flash: 0, done: false, timer: null };
window.DT = DT; // accesible para tests/evidencia

window.startDotsMission = function () {
  beep(true);
  const qs = shuffle(DOTS_SHAPES).slice(0, 3).map(s => ({
    shape: s, item: { en: s.en, es: s.es, img: s.img, em: '⭐' }
  }));
  bootGameMission('dots', 'Une los Puntos', 'punto a punto', '⭐', qs, renderDotsQuestion);
  G.countPerfect = false; // dibujar es creatividad: no infla «perfectas»
};

function dtXY(p) { return [30 + p[0] * 280, 30 + p[1] * 280]; }

function renderDotsQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Dibujo ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn'); if (lb) lb.style.display = 'none';
  $('qBadge').textContent = '⭐ Une los puntos';
  $('qInstruction').textContent = 'Toca los números en orden: 1, 2, 3…';
  const wEl = $('qWord'); wEl.className = 'q-big-word'; wEl.style.display = 'none';
  $('qTrans').textContent = '¿Qué será? Descúbrelo uniendo los puntos';
  const og = $('optsGrid'); og.className = 'opts-grid'; og.style.display = 'none'; og.innerHTML = '';
  $('qVisual').innerHTML = `
    <div class="dt-wrap">
      <canvas id="dtCanvas" class="dt-canvas" width="340" height="340"></canvas>
      <div class="dt-foot"><span class="dt-tip">1 → 2 → 3 … hasta el último punto</span></div>
    </div>`;
  DT.next = 0; DT.flash = 0; DT.done = false;
  dtPaint();
  const cv = $('dtCanvas');
  if (cv && !cv.dataset.bound) {
    cv.dataset.bound = '1';
    cv.addEventListener('pointerdown', e => {
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      dtTap((e.clientX - r.left) * (cv.width / r.width), (e.clientY - r.top) * (cv.height / r.height));
    });
  }
  if (DT.timer) clearInterval(DT.timer);
  DT.timer = setInterval(() => { // pulso suave del punto objetivo
    if (!$('dtCanvas')) { clearInterval(DT.timer); DT.timer = null; return; } // limpiezas al salir del juego
    if (DT.next < q.shape.pts.length && !DT.done) dtPaint();
  }, 450);
}

function dtPaint() {
  const q = G.questions[G.qi];
  const cv = $('dtCanvas'); if (!cv || !q) return;
  const ctx = cv.getContext('2d');
  const pts = q.shape.pts.map(dtXY);
  ctx.clearRect(0, 0, cv.width, cv.height);
  // líneas ya unidas
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (DT.next > 1) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < DT.next; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (DT.done) ctx.closePath();
    ctx.stroke();
  }
  // relleno de la figura al completar
  if (DT.done) {
    ctx.fillStyle = 'rgba(255,215,0,.28)';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fill();
  }
  // puntos numerados
  pts.forEach((p, i) => {
    const isTarget = i === DT.next && !DT.done;
    const pulse = isTarget && Math.floor(Date.now() / 450) % 2 === 0;
    const flash = isTarget && DT.flash > 0;
    ctx.beginPath();
    ctx.arc(p[0], p[1], isTarget ? (pulse ? 17 : 13) : 11, 0, Math.PI * 2);
    ctx.fillStyle = i < DT.next ? '#2ECC71' : isTarget ? (flash ? '#FF8C42' : '#FFD700') : 'rgba(255,255,255,.85)';
    ctx.fill();
    if (isTarget) {
      ctx.beginPath(); ctx.arc(p[0], p[1], flash ? 24 : 21, 0, Math.PI * 2);
      ctx.strokeStyle = flash ? 'rgba(255,140,66,.8)' : 'rgba(255,215,0,.6)';
      ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.fillStyle = '#1d1433';
    ctx.font = '900 15px Nunito, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), p[0], p[1] + .5);
  });
  if (DT.flash > 0) DT.flash--;
}

window.dtTap = function (x, y) {
  const q = G.questions[G.qi];
  if (!q || DT.done) return;
  const [tx, ty] = dtXY(q.shape.pts[DT.next]);
  if (Math.hypot(x - tx, y - ty) <= 36) {
    DT.next++;
    beep(true); buzz(15);
    if (DT.next >= q.shape.pts.length) {
      DT.done = true;
      dtWin();
    }
    dtPaint();
  } else {
    DT.flash = 4; // el punto correcto parpadea en naranja: sin castigos
    buzz(10);
    dtPaint();
  }
};

function dtWin() {
  const q = G.questions[G.qi];
  const cv = $('dtCanvas');
  const r = cv ? cv.getBoundingClientRect() : null;
  burst(50); beepWin(); buzz(35);
  if (r) floatXP('+12 XP', r.left + r.width / 2, r.top + r.height / 2);
  TTS.sayWord(q.item.en, q.item.es, 'words');
  coreReward(q.item, null);
  showFeedback(true, '¡Dibujo completo! ⭐', q.item.en + ' = ' + q.item.es);
  if (DT.timer) { clearInterval(DT.timer); DT.timer = null; }
  updateTopbar();
}

/* ══════════ 5) 🎪 RETO DEL FIN DE SEMANA ══════════
   Sábados y domingos aparece el reto: una misión mixta de 10
   preguntas con fotos de muchos mundos + bono de monedas/XP.
   Entre semana el chip muestra cuántos días faltan. */
window.PW_FORCE_WEEKEND = false; // gancho de pruebas (no altera la UI normal)
function isWeekendToday() {
  if (window.PW_FORCE_WEEKEND) return true;
  const d = new Date().getDay();
  return d === 6 || d === 0;
}
function daysToWeekend() {
  const d = new Date().getDay();
  return (d === 6 || d === 0) ? 0 : (6 - d + 7) % 7;
}

window.startWeekendMission = function () {
  beep(true); buzz(30);
  const pool = [];
  const lvlws = WORLDS.filter(w => w.lvl === (currentLevel || 1));
  (lvlws.length ? lvlws : WORLDS).forEach(w => w.items.forEach(it => { if (it.img) pool.push(it); }));
  if (pool.length < 10) { notif('📚 Vuelve cuando hayas jugado más mundos', 'var(--red)'); return; }
  const picks = shuffle(pool).slice(0, 10);
  const qs = picks.map(item => {
    const wrongs = shuffle(pool.filter(x => x !== item && x.en !== item.en)).slice(0, 3);
    return { item, opts: shuffle([item, ...wrongs]), ans: item };
  });
  bootGameMission('weekend', 'Reto del Finde', 'misión mixta', '🎪', qs, renderQuestion);
};

/* chip del mapa (junto a Sorpréndeme) */
function renderWeekendChip(p) {
  const anchor = $('dailyGoal'); if (!anchor) return;
  let host = $('weekendChip');
  if (!host) {
    host = document.createElement('div');
    host.id = 'weekendChip';
    anchor.parentNode.insertBefore(host, anchor);
  }
  const done = p.stats && p.stats.weekendDone && p.stats.weekendDone[todayStr()];
  if (isWeekendToday()) {
    host.innerHTML = `<button class="cont-btn wk-btn" onclick="weekendTap()" aria-label="Reto del fin de semana">🎪 ${done ? '¡Reto hecho hoy! Repite' : '¡Reto del finde!'}</button>`;
  } else {
    const d = daysToWeekend();
    host.innerHTML = `<button class="cont-btn wk-btn off" onclick="weekendTap()" aria-label="Reto del fin de semana: vuelve el sábado">🎪 Reto del finde · en ${d === 1 ? '1 día' : d + ' días'}</button>`;
  }
}
window.weekendTap = function () {
  if (isWeekendToday()) return startWeekendMission();
  const d = daysToWeekend();
  openModal('🎪 Reto del fin de semana', `
    <div style="text-align:center;padding:6px 4px">
      <div style="font-size:2.4em">🎪</div>
      <div style="font-weight:900;font-size:1.12em;margin:8px 0 6px">¡Vuelve el ${d === 1 ? 'mañana (¡sábado!)' : 'sábado'}!</div>
      <div class="small">Los sábados y domingos hay un <b>reto especial</b>: 10 preguntas
      de muchos mundos con <b>bono de monedas y XP</b>. ¡Es el partido grande de la semana! ⭐</div>
    </div>`,
    `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">¡OK! 🎪</button>`);
  beep(true);
};

/* ganchos de prueba/evidencia (no alteran la UI normal) */
window.PW_WEEKEND = {
  is: isWeekendToday,
  days: daysToWeekend,
  start: () => startWeekendMission()
};

