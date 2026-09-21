/* ═══════════════════════════════════════════════════════════
   PequeWorld — JUEGOS DE MESA NUEVOS (v14)
   4 juegos + retos del finde, 100% locales (localStorage).
   Patrones heredados: openModal (v12 Explorar), window.PW_*
   hooks para pruebas (v11/v12/v13), sin tocar el motor G.
   Contenido:
     1) 🌟 Unir Puntos      — números y LETRAS A–J, 6 figuras
     2) 🖍️ Trazo Mágico      — trazar letras A–J con guías
     3) 🖼️ Rompecabezas      — 4 · 9 · 12 piezas (recorte 0%)
     4) 🪁 Adivina la palabra — ahorcado amable (globos, no nubes)
     5) 🏅 Retos del finde    — sáb/dom: traza · une · arma
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   1) 🌟 UNIR PUNTOS — modo 🔢 Números y 🔤 Letras A–J
   Seis figuras dibujadas en una malla 0–100. El niño toca el
   punto siguiente (el que pulsa); si toca otro, solo tiembla:
   cero castigos. Al completar: figura rellena + confeti + premio.
   ═══════════════════════════════════════════════════════════ */
const PW_FIGURES = [
  { id:'estrella', em:'⭐', name:'Estrella', fill:'#FFD54F', line:'#F5A623',
    pts:[[50,6],[60,38],[93,38],[66,58],[76,90],[50,71],[24,90],[34,58],[7,38],[40,38]] },
  { id:'casa', em:'🏠', name:'Casita', fill:'#FFB74D', line:'#E65100',
    pts:[[20,84],[20,46],[50,18],[80,46],[80,84]] },
  { id:'corazon', em:'❤️', name:'Corazón', fill:'#F06292', line:'#C2185B',
    pts:[[50,88],[20,60],[12,34],[30,14],[50,30],[70,14],[88,34],[80,60]] },
  { id:'cohete', em:'🚀', name:'Cohete', fill:'#64B5F6', line:'#1565C0',
    pts:[[50,8],[66,28],[66,62],[82,82],[60,74],[40,74],[18,82],[34,62]] },
  { id:'barco', em:'⛵', name:'Barquito', fill:'#4DB6AC', line:'#00695C',
    pts:[[50,10],[50,62],[84,62],[70,86],[30,86],[16,62]] },
  { id:'gato', em:'🐱', name:'Gatito', fill:'#BA68C8', line:'#6A1B9A',
    pts:[[30,46],[20,16],[44,32],[56,32],[80,16],[70,46],[50,76]] },
];
/* letras A–J para el modo alfabeto (10 = longitud máxima de figuras) */
const PW_AJ = ['A','B','C','D','E','F','G','H','I','J'];

let _dotsMode = 'num';   /* 'num' | 'abc' */
let _dotsFig   = null;   /* figura actual */
let _dotsNext  = 0;      /* siguiente punto por tocar */
let _dotsMoves = 0;      /* toques errados (solo informativo) */

window.startDots = function (figId) {
  const p = activeProfile(); if (!p) return;
  beep(true);
  _dotsFig = PW_FIGURES.find(f => f.id === (figId || _dotsFig && _dotsFig.id)) || PW_FIGURES[0];
  _dotsNext = 0; _dotsMoves = 0;
  openModal('🌟 Unir Puntos', `
    <div class="small" style="margin-bottom:6px">Toca los puntos <b>en orden</b> y descubre la figura. ¡Sin errores, solo diversión!</div>
    <div class="dot-chips">
      <button class="dot-chip ${_dotsMode === 'num' ? 'on' : ''}" id="dotsModeNum" onclick="dotsSetMode('num')">🔢 1·2·3</button>
      <button class="dot-chip ${_dotsMode === 'abc' ? 'on' : ''}" id="dotsModeAbc" onclick="dotsSetMode('abc')">🔤 A–J</button>
    </div>
    <div class="dot-chips" id="dotsFigChips"></div>
    <div class="dot-stage" id="dotStage"></div>
    <div class="dot-hud" id="dotHud"></div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  renderDotsFigChips();
  renderDots();
  window.PW_DOTS = {
    open: () => !!document.getElementById('dotStage'),
    next: () => _dotsNext,
    total: () => _dotsFig.pts.length,
    mode: () => _dotsMode,
    /* toca el punto i con la MISMA lógica del toque real (para pruebas) */
    tap: i => dotsTapPoint(i, true),
    figuresDone: () => (activeProfile() ? (activeProfile().stats.dotFigs || 0) : 0)
  };
};

window.dotsSetMode = function (m) {
  if (_dotsMode === m) return;
  beep(true);
  _dotsMode = m; _dotsNext = 0;
  const n = document.getElementById('dotsModeNum'), a = document.getElementById('dotsModeAbc');
  if (n) n.classList.toggle('on', m === 'num');
  if (a) a.classList.toggle('on', m === 'abc');
  renderDots();
};

function renderDotsFigChips() {
  const host = document.getElementById('dotsFigChips'); if (!host) return;
  host.innerHTML = '';
  PW_FIGURES.forEach(f => {
    const c = document.createElement('button');
    c.className = 'dot-chip' + (f.id === _dotsFig.id ? ' on' : '');
    c.setAttribute('aria-label', 'Figura ' + f.name);
    c.innerHTML = `${f.em} <span>${f.name}</span>`;
    c.onclick = () => { beep(true); _dotsFig = f; _dotsNext = 0; _dotsMoves = 0; renderDotsFigChips(); renderDots(); };
    host.appendChild(c);
  });
}

/* etiqueta del punto i según el modo activo */
function dotsLabel(i) {
  return _dotsMode === 'num' ? String(i + 1) : PW_AJ[i] || String(i + 1);
}

function renderDots() {
  const host = document.getElementById('dotStage'); if (!host) return;
  const f = _dotsFig, n = f.pts.length;
  const segs = [];
  for (let i = 1; i < _dotsNext; i++) segs.push(`${f.pts[i - 1][0]},${f.pts[i - 1][1]} ${f.pts[i][0]},${f.pts[i][1]}`);
  const closed = _dotsNext >= n;
  const poly = closed
    ? `<polygon points="${f.pts.map(p => p.join(',')).join(' ')}" fill="${f.fill}" opacity=".92" stroke="${f.line}" stroke-width="2" stroke-linejoin="round"/>`
    : (segs.length ? `<polyline points="${segs.join(' ')}" fill="none" stroke="${f.line}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>` : '');
  const dots = f.pts.map((pt, i) => {
    const done = i < _dotsNext;
    const isNext = i === _dotsNext && !closed;
    return `
      <g class="dot-g ${done ? 'done' : ''} ${isNext ? 'is-next' : ''}" data-i="${i}" role="button"
         aria-label="${isNext ? 'Toca el punto ' + dotsLabel(i) : 'punto ' + dotsLabel(i)}"
         transform="translate(${pt[0]},${pt[1]})" onclick="dotsTapPoint(${i})">
        <circle class="dot-hit" r="10" fill="transparent"></circle>
        <circle class="dot-c" r="${isNext ? 4.6 : 3.4}" ${done ? `fill="${f.line}"` : `fill="#fff"`} stroke="${f.line}" stroke-width="1.4"></circle>
        <text class="dot-lbl" y="-6.4" text-anchor="middle">${dotsLabel(i)}</text>
      </g>`;
  }).join('');
  host.innerHTML = `
    <svg class="dot-svg" viewBox="0 0 100 100" aria-label="Figura de puntos ${f.name}">
      <rect x="2" y="2" width="96" height="96" rx="8" fill="rgba(255,255,255,.10)"/>
      ${poly}${dots}
    </svg>`;
  renderDotsHud();
}

function renderDotsHud() {
  const host = document.getElementById('dotHud'); if (!host) return;
  const f = _dotsFig, n = f.pts.length;
  const p = activeProfile();
  host.innerHTML = `<span class="dot-hud-a">${f.em} ${f.name}</span>
    <span class="dot-hud-b">Punto ${Math.min(_dotsNext + ( _dotsNext < n ? 1 : 0), n)} de ${n}</span>
    <span class="dot-hud-c">Constelaciones: <b>${(p && p.stats.dotFigs) || 0}</b></span>`;
}

/* toque de punto: correcto avanza; incorrecto solo tiembla (sin castigo) */
window.dotsTapPoint = function (i, fromTest) {
  const f = _dotsFig; if (!f) return;
  if (i !== _dotsNext) {
    _dotsMoves++;
    beep(false); buzz(20);
    const g = document.querySelector(`.dot-g[data-i="${i}"]`);
    if (g) { g.classList.add('shake'); setTimeout(() => g.classList.remove('shake'), 420); }
    return;
  }
  _dotsNext++;
  beep(true); buzz(14);
  TTS.sayWord(dotsLabel(i), '', _dotsMode === 'abc' ? 'letters' : undefined);
  if (_dotsNext >= f.pts.length) {
    /* figura cerrada: rellena y celebra */
    burst(46);
    beepWin();
    const p = activeProfile();
    if (p) {
      updateProfile(pp => {
        pp.stats.dotFigs = (pp.stats.dotFigs || 0) + 1;
        pp.stats.dotGames = (pp.stats.dotGames || 0) + 1;
        pp.coins = (pp.coins || 0) + 4;
        pp.xp = (pp.xp || 0) + 8;
      });
      window.PW_FINDE && PW_FINDE.bump('une');
      checkBadges();
    }
    notif(`${f.em} ¡${f.name} completa! +8 XP +4 🪙`, 'var(--gold)');
    celebrate({
      icon: f.em, title: '¡' + f.name + '!',
      sub: 'Uniste ' + f.pts.length + ' puntos. ¡Perfecto!',
      rewards: ['+8 XP', '+4 🪙'], confetti: 1, dur: 2600
    });
  }
  renderDots();
};

/* ═══════════════════════════════════════════════════════════
   2) 🖍️ TRAZO MÁGICO — trazar letras A–J
   Cada letra trae sus «pistas doradas» en orden (checkpoints del
   trazo escolar). El dedo/lápiz solo debe pasar cerca de cada una:
   si se sale del camino, NADA pasa (cero castigos). Al completar
   la letra brilla en oro, suena su nombre y cae confeti.
   Cuenta para el reto del finde «Traza 3 letras».
   ═══════════════════════════════════════════════════════════ */
const PW_TRACE_WORDS = {
  A:['Ant','hormiga','🐜'], B:['Ball','pelota','⚽'], C:['Cat','gato','🐱'],
  D:['Dog','perrito','🐶'], E:['Egg','huevo','🥚'], F:['Fish','pez','🐟'],
  G:['Goat','cabra','🐐'], H:['Hat','sombrero','🎩'], I:['Ice','hielo','🧊'],
  J:['Jam','mermelada','🍓']
};
/* esqueleto escolar de cada letra (trazos en orden, malla 0–100) */
const PW_TRACE_STROKES = {
  A:[[[50,12],[28,88]],[[50,12],[72,88]],[[36,58],[64,58]]],
  B:[[[30,10],[30,88]],[[30,10],[56,10],[68,17],[72,27],[68,37],[56,44],[30,46]],
     [[30,46],[60,46],[70,55],[72,66],[66,78],[54,88],[30,88]]],
  C:[[[74,26],[64,14],[50,10],[34,14],[24,26],[20,42],[20,56],[24,72],[34,84],[50,88],[64,84],[74,72]]],
  D:[[[30,10],[30,88]],[[30,10],[52,12],[66,20],[74,34],[76,49],[74,64],[66,78],[52,86],[30,88]]],
  E:[[[30,10],[30,88]],[[30,10],[72,10]],[[30,47],[64,47]],[[30,84],[72,84]]],
  F:[[[30,10],[30,88]],[[30,10],[72,10]],[[30,47],[64,47]]],
  G:[[[74,26],[64,14],[50,10],[34,14],[24,26],[20,42],[20,56],[24,72],[34,84],[50,88],[64,84],[74,72],[74,52],[56,52]]],
  H:[[[30,10],[30,88]],[[70,10],[70,88]],[[30,49],[70,49]]],
  I:[[[50,10],[50,88]],[[34,10],[66,10]],[[34,88],[66,88]]],
  J:[[[62,10],[62,68],[58,80],[50,86],[40,88],[32,82],[30,72]]]
};

let _trLetter = 'A';
let _trChecks = [];     /* checkpoints planos: {x,y,stroke} en orden */
let _trNext   = 0;
let _trDrawn  = [];     /* segmentos ya pintados del niño */
let _trLast   = null;   /* último punto dentro de pista */

/* muestrea los checkpoints de una letra (>=3 por trazo, cada ~14 uds) */
function traceCheckpoints(letter) {
  const strokes = PW_TRACE_STROKES[letter] || [];
  const out = [];
  strokes.forEach((st, si) => {
    /* longitud total del trazo */
    let L = 0;
    for (let i = 1; i < st.length; i++) L += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
    const nPts = Math.max(3, Math.round(L / 14) + 1);
    for (let k = 0; k < nPts; k++) {
      const target = (L * k) / (nPts - 1 || 1);
      let acc = 0;
      for (let i = 1; i < st.length; i++) {
        const seg = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
        if (acc + seg >= target || i === st.length - 1) {
          const t = seg ? clamp((target - acc) / seg, 0, 1) : 0;
          out.push({
            x: st[i - 1][0] + (st[i][0] - st[i - 1][0]) * t,
            y: st[i - 1][1] + (st[i][1] - st[i - 1][1]) * t,
            stroke: si
          });
          break;
        }
        acc += seg;
      }
    }
  });
  return out;
}

window.startTrace = function (letter) {
  const p = activeProfile(); if (!p) return;
  beep(true);
  openModal('🖍️ Trazo Mágico', `
    <div class="small" style="margin-bottom:6px">Sigue las <b>bolitas doradas</b> con el dedo. Si te sales, ¡no pasa nada! Sigue intentando 💛</div>
    <div class="trace-chips" id="traceChips"></div>
    <div class="trace-wrap"><canvas id="traceCv" width="340" height="340" aria-label="Lienzo para trazar la letra"></canvas></div>
    <div class="dot-hud" id="traceHud"></div>
    <div class="trace-actions">
      <button class="bigbtn bb-sm bb-purple" onclick="traceClear()">🧽 Borrar</button>
    </div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  traceSet(letter || _trLetter);
  renderTraceChips();
  const cv = document.getElementById('traceCv');
  if (cv) {
    const pt = e => {
      const r = cv.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100];
    };
    cv.addEventListener('pointerdown', e => { try { cv.setPointerCapture(e.pointerId); } catch (err) {} traceFeed(pt(e)); });
    cv.addEventListener('pointermove', e => { if (e.buttons || e.pressure > 0) traceFeed(pt(e)); });
  }
  window.PW_TRACE = {
    open: () => !!document.getElementById('traceCv'),
    letter: () => _trLetter,
    next: () => _trNext,
    total: () => _trChecks.length,
    checkpoint: i => _trChecks[i] ? { x: _trChecks[i].x, y: _trChecks[i].y } : null,
    /* coordenada de canvas (px) de un checkpoint — para toques reales del arnés */
    px: i => {
      const cv = document.getElementById('traceCv'); if (!cv || !_trChecks[i]) return null;
      const r = cv.getBoundingClientRect();
      return { x: r.left + (_trChecks[i].x / 100) * r.width, y: r.top + (_trChecks[i].y / 100) * r.height };
    },
    feed: pts => (Array.isArray(pts) ? pts : [pts]).forEach(pp => {
      /* acepta [x,y] o {x,y} — el arnés usa checkpoint() que devuelve objeto */
      traceFeed(Array.isArray(pp) ? pp : (pp && typeof pp.x === 'number' ? [pp.x, pp.y] : null));
    }),
    traced: () => (activeProfile() ? (activeProfile().stats.traceLetters || 0) : 0)
  };
};

function renderTraceChips() {
  const host = document.getElementById('traceChips'); if (!host) return;
  host.innerHTML = '';
  PW_AJ.forEach(L => {
    const c = document.createElement('button');
    c.className = 'dot-chip' + (L === _trLetter ? ' on' : '');
    c.textContent = L;
    c.setAttribute('aria-label', 'Trazar la letra ' + L);
    c.onclick = () => { beep(true); traceSet(L); };
    host.appendChild(c);
  });
}

window.traceSet = function (L) {
  if (!PW_TRACE_STROKES[L]) return;
  _trLetter = L; _trNext = 0; _trDrawn = []; _trLast = null;
  _trChecks = traceCheckpoints(L);
  renderTraceChips();
  renderTraceHud();
  drawTrace();
  TTS.sayWord(L, (PW_TRACE_WORDS[L] || [])[1] || '', 'letters');
};

window.traceClear = function () {
  beep(true);
  _trNext = 0; _trDrawn = []; _trLast = null;
  drawTrace(); renderTraceHud();
};

/* recibe un punto (0–100) y avanza pistas si pasa cerca de la siguiente */
function traceFeed(pt) {
  if (!pt || pt.length !== 2) return;
  if (!_trChecks.length || _trNext >= _trChecks.length) return;
  const t = _trChecks[_trNext];
  const d = Math.hypot(pt[0] - t.x, pt[1] - t.y);
  if (d <= 8) {
    if (_trLast) _trDrawn.push([_trLast, [t.x, t.y]]);
    _trLast = [t.x, t.y];
    _trNext++;
    buzz(12);
    if (_trNext >= _trChecks.length) traceComplete();
    else drawTrace();
    renderTraceHud();
  } else if (_trLast && Math.hypot(pt[0] - _trLast[0], pt[1] - _trLast[1]) < 20) {
    /* pinta el garabato libre del niño aunque no haya pista nueva */
    _trDrawn.push([_trLast, [pt[0], pt[1]]]);
    _trLast = [pt[0], pt[1]];
    drawTrace();
  }
}

function traceComplete() {
  drawTrace(true);
  burst(40); beepWin();
  const w = PW_TRACE_WORDS[_trLetter] || ['','','✨'];
  TTS.sayWord(_trLetter + ' de ' + w[0], w[1], 'letters');
  updateProfile(pp => {
    pp.stats.traceLetters = (pp.stats.traceLetters || 0) + 1;
    pp.coins = (pp.coins || 0) + 2;
    pp.xp = (pp.xp || 0) + 4;
  });
  window.PW_FINDE && PW_FINDE.bump('traza');
  checkBadges();
  notif(`🖍️ ¡Letra ${_trLetter} trazada! +4 XP +2 🪙`, 'var(--gold)');
  celebrate({
    icon: '🖍️', title: `¡Letra ${_trLetter}!`,
    sub: `${w[2]} ${w[0]} — ${w[1]}`,
    rewards: ['+4 XP', '+2 🪙'], confetti: 1, dur: 2600
  });
}

function renderTraceHud() {
  const host = document.getElementById('traceHud'); if (!host) return;
  const p = activeProfile();
  host.innerHTML = `<span class="dot-hud-a">Letra ${_trLetter}</span>
    <span class="dot-hud-b">Pista ${Math.min(_trNext + 1, _trChecks.length)} de ${_trChecks.length}</span>
    <span class="dot-hud-c">Letras trazadas: <b>${(p && p.stats.traceLetters) || 0}</b></span>`;
}

/* dibuja guía + pistas + garabatos del niño */
function drawTrace(gold) {
  const cv = document.getElementById('traceCv'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const S = cv.width / 100;
  ctx.clearRect(0, 0, cv.width, cv.height);
  /* lienzo */
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(0, 0, cv.width, cv.height);
  /* guía punteada */
  (PW_TRACE_STROKES[_trLetter] || []).forEach(st => {
    ctx.beginPath();
    ctx.setLineDash([6, 7]);
    ctx.lineWidth = 14 * S * 0.28;
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    st.forEach((pt, i) => i ? ctx.lineTo(pt[0] * S, pt[1] * S) : ctx.moveTo(pt[0] * S, pt[1] * S));
    ctx.stroke();
    ctx.setLineDash([]);
  });
  /* garabato del niño */
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 6 * S * 0.28; ctx.lineCap = 'round';
  _trDrawn.forEach(([a, b]) => {
    ctx.beginPath(); ctx.moveTo(a[0] * S, a[1] * S); ctx.lineTo(b[0] * S, b[1] * S); ctx.stroke();
  });
  /* pistas */
  _trChecks.forEach((c, i) => {
    const isNext = i === _trNext, done = i < _trNext;
    ctx.beginPath();
    ctx.arc(c.x * S, c.y * S, (isNext ? 4.6 : 2.9) * S, 0, 7);
    ctx.fillStyle = done ? 'rgba(255,255,255,.35)' : isNext ? '#FFD54F' : 'rgba(255,213,79,.45)';
    ctx.fill();
  });
  if (gold) {
    /* letra brillante al terminar */
    ctx.save();
    ctx.font = `900 ${52 * S}px Baloo2, Nunito, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3 * S; ctx.strokeStyle = '#FFD54F'; ctx.fillStyle = 'rgba(255,213,79,.35)';
    ctx.strokeText(_trLetter, 50 * S, 50 * S); ctx.fillText(_trLetter, 50 * S, 50 * S);
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════
   3) 🖼️ ROMPECABEZAS — 4 · 9 · 12 piezas
   Fotos de las palabras del nivel actual (assets reales). La foto
   se encuadra «contain» en un lienzo cuadrado ANTES de cortarse:
   así cada pieza encaja perfecta y la imagen se ve al 100% (0%
   de recorte, política v9). Mecánica amable: toca una pieza y
   luego otra para intercambiarlas. Sin tiempo, sin vidas.
   ═══════════════════════════════════════════════════════════ */
const PW_PUZZLE_LEVELS = [
  { id: 4,  cols: 2, rows: 2, name: 'Fácil · 4',   xp: 8,  coins: 4 },
  { id: 9,  cols: 3, rows: 3, name: 'Medio · 9',   xp: 14, coins: 6 },
  { id: 12, cols: 4, rows: 3, name: 'Difícil · 12',xp: 20, coins: 9 },
];

let _pzLvl    = PW_PUZZLE_LEVELS[0];
let _pzOrder  = [];      /* orden actual de piezas: order[pos] = pieza */
let _pzSel    = -1;      /* pieza seleccionada */
let _pzMoves  = 0;
let _pzSrc    = '';      /* dataURL de la foto cuadrada */
let _pzWord   = null;    /* palabra de la foto */
let _pzLock   = false;   /* bloqueo tras resolver */

window.startPuzzle = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  openModal('🖼️ Rompecabezas', `
    <div class="small" style="margin-bottom:6px">Toca una pieza y luego otra para <b>intercambiarlas</b>. ¡Arma la foto!</div>
    <div class="dot-chips" id="pzLvls"></div>
    <div class="pz-grid" id="pzGrid"></div>
    <div class="dot-hud" id="pzHud"></div>
    <div class="trace-actions">
      <button class="bigbtn bb-sm bb-purple" onclick="pzNewPhoto()">🔄 Otra foto</button>
    </div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  renderPzLvls();
  pzNewPhoto(true);
  window.PW_PUZZLE = {
    open: () => !!document.getElementById('pzGrid'),
    order: () => [..._pzOrder],
    moves: () => _pzMoves,
    lvl: () => _pzLvl.id,
    word: () => (_pzWord && _pzWord.it && _pzWord.it.en) || '',
    /* intercambia con la MISMA función del toque real */
    swap: (a, b) => pzSwap(a, b),
    /* resuelve aplicando intercambios reales (para el arnés) */
    solve: () => {
      let guard = 200;
      while (_pzOrder.some((v, i) => v !== i) && guard-- > 0) {
        const from = _pzOrder.findIndex((v, i) => v !== i);
        const to = _pzOrder.indexOf(from);
        pzSwap(from, to);
      }
      return _pzOrder.every((v, i) => v === i);
    },
    done: () => (activeProfile() ? (activeProfile().stats.puzzleGames || 0) : 0)
  };
};

function renderPzLvls() {
  const host = document.getElementById('pzLvls'); if (!host) return;
  host.innerHTML = '';
  PW_PUZZLE_LEVELS.forEach(l => {
    const c = document.createElement('button');
    c.className = 'dot-chip' + (l.id === _pzLvl.id ? ' on' : '');
    c.textContent = l.name;
    c.setAttribute('aria-label', 'Dificultad ' + l.name);
    c.onclick = () => { beep(true); _pzLvl = l; renderPzLvls(); pzBuild(); };
    host.appendChild(c);
  });
}

/* elige una foto del nivel actual y la encuadra en un cuadrado (0% recorte) */
window.pzNewPhoto = function (silent) {
  const p = activeProfile(); if (!p) return;
  const pool = [];
  WORLDS.filter(w => w.lvl === currentLevel).forEach(w => w.items.forEach(it => { if (it.img) pool.push({ it, w }); }));
  if (!pool.length) { notif('🖼️ Aún no hay fotos para armar', 'var(--orange)'); return; }
  _pzWord = pool[Math.floor(Math.random() * pool.length)];
  if (!silent) beep(true);
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = 480; cv.height = 480;
    const ctx = cv.getContext('2d');
    /* fondo suave + foto completa (contain, sin recortar jamás) */
    ctx.fillStyle = '#FFF7E9';
    ctx.fillRect(0, 0, 480, 480);
    const s = Math.min(480 / img.width, 480 / img.height);
    const w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (480 - w) / 2, (480 - h) / 2, w, h);
    _pzSrc = cv.toDataURL('image/jpeg', 0.88);
    pzBuild();
  };
  img.onerror = () => { notif('🖼️ La foto no cargó, prueba otra', 'var(--orange)'); };
  img.src = IMG(_pzWord.it.img);
};

/* construye el tablero mezclado (nunca resuelto de entrada) */
function pzBuild() {
  const grid = document.getElementById('pzGrid'); if (!grid) return;
  const n = _pzLvl.cols * _pzLvl.rows;
  _pzOrder = shuffle([...Array(n).keys()]);
  if (_pzOrder.every((v, i) => v === i)) _pzOrder = [..._pzOrder.slice(1), _pzOrder[0]];
  _pzSel = -1; _pzMoves = 0; _pzLock = false;
  grid.style.setProperty('--pz-cols', _pzLvl.cols);
  grid.innerHTML = '';
  for (let pos = 0; pos < n; pos++) {
    const t = document.createElement('button');
    t.className = 'pz-tile';
    t.dataset.pos = pos;
    t.setAttribute('aria-label', 'Pieza ' + (pos + 1));
    t.onclick = () => pzTap(pos);
    grid.appendChild(t);
  }
  pzPaint();
  renderPzHud();
}

/* pinta cada pieza según _pzOrder usando background-position porcentual */
function pzPaint() {
  const grid = document.getElementById('pzGrid'); if (!grid) return;
  const { cols, rows } = _pzLvl;
  grid.querySelectorAll('.pz-tile').forEach(t => {
    const pos = +t.dataset.pos;
    const piece = _pzOrder[pos];
    const pr = Math.floor(piece / cols), pc = piece % cols;
    t.classList.remove('ok', 'sel', 'swap');
    if (piece === pos && _pzLock) t.classList.add('ok');
    t.style.backgroundImage = `url(${_pzSrc})`;
    t.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    t.style.backgroundPosition = `${(pc / (cols - 1 || 1)) * 100}% ${(pr / (rows - 1 || 1)) * 100}%`;
  });
}

window.pzTap = function (pos) {
  if (_pzLock) return;
  beep(true);
  if (_pzSel === -1) { _pzSel = pos; markSel(); return; }
  if (_pzSel === pos) { _pzSel = -1; markSel(); return; }
  pzSwap(_pzSel, pos);
  _pzSel = -1;
};

function markSel() {
  const grid = document.getElementById('pzGrid'); if (!grid) return;
  grid.querySelectorAll('.pz-tile').forEach(t => t.classList.toggle('sel', +t.dataset.pos === _pzSel));
}

function pzSwap(a, b) {
  if (a === b || a < 0 || b < 0 || a >= _pzOrder.length || b >= _pzOrder.length) return;
  [_pzOrder[a], _pzOrder[b]] = [_pzOrder[b], _pzOrder[a]];
  _pzMoves++;
  const tA = document.querySelector(`.pz-tile[data-pos="${a}"]`), tB = document.querySelector(`.pz-tile[data-pos="${b}"]`);
  [tA, tB].forEach(t => { if (t) { t.classList.add('swap'); setTimeout(() => t.classList.remove('swap'), 260); } });
  buzz(12);
  pzPaint();
  renderPzHud();
  if (_pzOrder.every((v, i) => v === i)) pzSolved();
}

function pzSolved() {
  _pzLock = true;
  pzPaint();
  burst(56); beepWin();
  const it = _pzWord && _pzWord.it, w = _pzWord && _pzWord.w;
  if (it) TTS.sayWord(it.en, it.es, w && w.kind === 'letters' ? 'letters' : undefined);
  updateProfile(pp => {
    pp.stats.puzzleGames = (pp.stats.puzzleGames || 0) + 1;
    pp.coins = (pp.coins || 0) + _pzLvl.coins;
    pp.xp = (pp.xp || 0) + _pzLvl.xp;
  });
  window.PW_FINDE && PW_FINDE.bump('puz');
  checkBadges();
  notif(`🖼️ ¡Rompecabezas completo! +${_pzLvl.xp} XP +${_pzLvl.coins} 🪙`, 'var(--gold)');
  celebrate({
    icon: '🖼️', title: '¡Lo armaste!',
    sub: (it ? `${it.en} — ${it.es || ''}` : '¡Bien hecho!') + ` (${_pzLvl.name})`,
    rewards: [`+${_pzLvl.xp} XP`, `+${_pzLvl.coins} 🪙`], confetti: 1, dur: 2800
  });
}

function renderPzHud() {
  const host = document.getElementById('pzHud'); if (!host) return;
  const p = activeProfile();
  const solved = _pzOrder.filter((v, i) => v === i).length;
  host.innerHTML = `<span class="dot-hud-a">${_pzWord ? (_pzWord.it.em || '🖼️') + ' ' + (_pzWord.it.en || '') : '🖼️'}</span>
    <span class="dot-hud-b">Bien: ${solved}/${_pzOrder.length} · Movs: ${_pzMoves}</span>
    <span class="dot-hud-c">Armados: <b>${(p && p.stats.puzzleGames) || 0}</b></span>`;
}

/* ═══════════════════════════════════════════════════════════
   4) 🪁 ADIVINA LA PALABRA — ahorcado amable (sin nubes tristes)
   Palabra del vocabulario del nivel actual. Teclado A–Z grande,
   5 globos que se sueltan al fallar (nunca monstruos), pista
   🇪🇸 al toque. Al ganar: la palabra se dice en voz alta.
   ═══════════════════════════════════════════════════════════ */
let _hgWord = null;      /* {it, w} */
let _hgHit  = [];        /* letras ya acertadas */
let _hgMiss = 0;         /* globos perdidos */
let _hgHint = false;
let _hgOver = false;
const HG_BALLOONS = 5;

window.startHang = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  /* vocabulario del nivel: una sola palabra, 3–9 letras */
  const pool = [];
  WORLDS.filter(w => w.lvl === currentLevel).forEach(w => w.items.forEach(it => {
    const en = (it.en || '').trim();
    if (en && !en.includes(' ') && en.length >= 3 && en.length <= 9 && /^[a-z]+$/i.test(en)) pool.push({ it, w });
  }));
  if (!pool.length) { notif('🪁 Aún no hay palabras para adivinar', 'var(--orange)'); return; }
  _hgWord = pool[Math.floor(Math.random() * pool.length)];
  _hgHit = []; _hgMiss = 0; _hgHint = false; _hgOver = false;
  const en = _hgWord.it.en.toUpperCase();
  openModal('🪁 Adivina la palabra', `
    <div class="small" style="margin-bottom:6px">Adivina la palabra secreta letra por letra. ¡Tienes ${HG_BALLOONS} globos!</div>
    <div class="hang-emo">${_hgWord.it.em || '✨'}</div>
    <div class="hang-slots" id="hgSlots">${[...en].map(() => '<span class="hang-slot">·</span>').join('')}</div>
    <div class="hang-balloons" id="hgBalloons">${'🎈'.repeat(HG_BALLOONS)}</div>
    <div class="hang-kb" id="hgKb"></div>
    <div class="hang-hint"><button class="bigbtn bb-sm bb-purple" onclick="hangHint()">💡 Pista</button>
      <span class="hang-hint-txt" id="hgHintTxt"></span></div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Listo</button>`);
  renderHgKb();
  renderHgState();
  window.PW_HANG = {
    open: () => !!document.getElementById('hgKb'),
    word: () => _hgWord ? _hgWord.it.en.toUpperCase() : '',
    miss: () => _hgMiss,
    hit: () => [..._hgHit],
    over: () => _hgOver,
    hinted: () => _hgHint,
    /* pulsa una tecla con la MISMA lógica del toque real */
    press: ch => hangGuess(ch),
    wins: () => (activeProfile() ? (activeProfile().stats.hangWins || 0) : 0)
  };
};

function renderHgKb() {
  const host = document.getElementById('hgKb'); if (!host) return;
  host.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch => {
    const b = document.createElement('button');
    b.className = 'hang-key';
    b.textContent = ch;
    b.setAttribute('aria-label', 'Letra ' + ch);
    b.onclick = () => hangGuess(ch, b);
    host.appendChild(b);
  });
}

function renderHgState() {
  const en = _hgWord.it.en.toUpperCase();
  const slots = document.getElementById('hgSlots');
  if (slots) {
    slots.innerHTML = [...en].map(ch => {
      const shown = _hgHit.includes(ch) || _hgOver;
      return `<span class="hang-slot ${shown ? 'fill' : ''}">${shown ? ch : '·'}</span>`;
    }).join('');
  }
  const bal = document.getElementById('hgBalloons');
  if (bal) bal.innerHTML = '🎈'.repeat(Math.max(0, HG_BALLOONS - _hgMiss)) +
                           '<span class="hang-popped">' + '💨'.repeat(Math.min(_hgMiss, HG_BALLOONS)) + '</span>';
  document.querySelectorAll('.hang-key').forEach(b => {
    b.classList.toggle('used-ok', _hgHit.includes(b.textContent));
    b.classList.toggle('used-bad', !_hgHit.includes(b.textContent) && b.classList.contains('tried'));
  });
  const hintTxt = document.getElementById('hgHintTxt');
  if (hintTxt) hintTxt.textContent = _hgHint ? `${_hgWord.it.es || ''} · ${_hgWord.w.name}` : '';
}

window.hangHint = function () {
  beep(true);
  _hgHint = true;
  renderHgState();
};

window.hangGuess = function (ch, btn) {
  if (_hgOver || !_hgWord) return;
  const en = _hgWord.it.en.toUpperCase();
  if (_hgHit.includes(ch) || (btn && btn.classList.contains('tried') && !_hgHit.includes(ch) && btn.dataset.dead === '1')) return;
  if (btn) btn.classList.add('tried');
  if (en.includes(ch)) {
    _hgHit.push(ch);
    beep(true); buzz(14);
    if (btn) btn.classList.add('used-ok');
    renderHgState();
    if ([...en].every(c => _hgHit.includes(c))) hangWin();
  } else {
    _hgMiss++;
    beep(false); buzz([30, 40, 30]);
    if (btn) { btn.dataset.dead = '1'; btn.classList.add('used-bad'); }
    renderHgState();
    if (_hgMiss >= HG_BALLOONS) hangLose();
  }
};

function hangWin() {
  _hgOver = true;
  burst(52); beepWin();
  const it = _hgWord.it;
  TTS.sayWord(it.en, it.es, _hgWord.w.kind === 'letters' ? 'letters' : undefined);
  const xp = _hgHint ? 6 : 10, coins = _hgHint ? 2 : 3;
  updateProfile(pp => {
    pp.stats.hangGames = (pp.stats.hangGames || 0) + 1;
    pp.stats.hangWins = (pp.stats.hangWins || 0) + 1;
    pp.coins = (pp.coins || 0) + coins;
    pp.xp = (pp.xp || 0) + xp;
  });
  checkBadges();
  notif(`🪁 ¡${it.en}! +${xp} XP +${coins} 🪙`, 'var(--gold)');
  celebrate({
    icon: it.em || '🪁', title: '¡' + it.en + '!',
    sub: `${it.es || ''} — ¡adivinaste la palabra!`,
    rewards: [`+${xp} XP`, `+${coins} 🪙`], confetti: 1, dur: 2800
  });
}

function hangLose() {
  _hgOver = true;
  updateProfile(pp => {
    pp.stats.hangGames = (pp.stats.hangGames || 0) + 1;
    pp.xp = (pp.xp || 0) + 2; /* consuelo amable */
  });
  notif('💨 ¡Se volaron los globos! La palabra era ' + _hgWord.it.en.toUpperCase(), 'var(--orange)');
  const ft = document.querySelector('.modal-ft');
  if (ft) ft.innerHTML = `<button class="bigbtn bb-gold bb-sm" onclick="closeModal();startHang()">🔁 Otra palabra</button>
    <button class="bigbtn bb-sm bb-purple" onclick="closeModal()">✓ Listo</button>`;
  renderHgState();
}

/* ═══════════════════════════════════════════════════════════
   5) 🏅 RETOS DEL FINDE — sáb/dom con misiones ilustradas
   «Traza 3 letras» · «Une 2 figuras» · «Arma 1 rompecabezas».
   Los juegos de v14 empujan el progreso con PW_FINDE.bump().
   Todo local: la clave de fin de semana es la fecha del SÁBADO
   (dos días comparten la misma clave). De lunes a viernes el
   banner duerme (PW_FINDE.force lo despierta para el arnés).
   ═══════════════════════════════════════════════════════════ */
const PW_RETO_DEFS = [
  { id: 'traza', em: '🖍️', name: 'Traza 3 letras',      target: 3, cls: 'reto-traza' },
  { id: 'une',   em: '🌟', name: 'Une 2 figuras',       target: 2, cls: 'reto-une' },
  { id: 'puz',   em: '🖼️', name: 'Arma 1 rompecabezas', target: 1, cls: 'reto-puz' },
];
const PW_RETO_REWARD = { coins: 15, xp: 15 };

function findeKey(d) {
  if (window.PW_FINDE && PW_FINDE._forced) return PW_FINDE._forced;
  d = d || new Date();
  const day = d.getDay(); /* 6 = sábado, 0 = domingo */
  if (day === 6) return localDayStr(d);
  if (day === 0) { const s = new Date(d); s.setDate(s.getDate() - 1); return localDayStr(s); }
  const s = new Date(d); s.setDate(s.getDate() + (6 - day));
  return localDayStr(s);
}
function findeIsWeekend() {
  if (window.PW_FINDE && PW_FINDE._forced) return true;
  const day = new Date().getDay();
  return day === 6 || day === 0;
}
function findeEnsure(p) {
  if (!p.stats.finde) p.stats.finde = { key: '', done: {}, claimed: {}, total: 0, perfect: 0 };
  const f = p.stats.finde;
  if (!f.done) f.done = {};
  if (!f.claimed) f.claimed = {};
  if (f.total == null) f.total = 0;
  if (f.perfect == null) f.perfect = 0;
  if (f.key !== findeKey()) {
    f.key = findeKey();
    f.done = {}; f.claimed = {};
  }
  return f;
}

/* banner en el mapa: solo fin de semana */
function renderFindeBanner() {
  const anchor = $('dailyGoal'); if (!anchor) return;
  let host = $('findeZone');
  if (!host) {
    host = document.createElement('div');
    host.id = 'findeZone';
    anchor.parentNode.insertBefore(host, anchor);
  }
  if (!findeIsWeekend()) { host.innerHTML = ''; return; }
  const p = activeProfile(); if (!p) return;
  const f = findeEnsure(p);
  const mini = PW_RETO_DEFS.map(r => {
    const val = Math.min(f.done[r.id] || 0, r.target);
    const full = val >= r.target;
    return `<span class="finde-mini ${full ? 'full' : ''}">${r.em}${full ? '✓' : ' ' + val + '/' + r.target}</span>`;
  }).join('');
  host.innerHTML = `
    <div class="finde-banner">
      <span class="finde-ico">🏅</span>
      <div style="flex:1;min-width:0">
        <div class="finde-title">¡Retos del finde! 🎉</div>
        <div class="finde-minis">${mini}</div>
      </div>
      <button class="bigbtn bb-gold bb-sm" onclick="openFinde()">Ver retos</button>
    </div>`;
  saveState();
}

window.openFinde = function () {
  const p = activeProfile(); if (!p) return;
  beep(true);
  const f = findeEnsure(p);
  const cards = PW_RETO_DEFS.map(r => {
    const val = Math.min(f.done[r.id] || 0, r.target);
    const full = val >= r.target;
    const claimed = !!f.claimed[r.id];
    return `
      <div class="finde-card ${r.cls} ${claimed ? 'claimed' : ''}">
        <span class="reto-ico">${r.em}</span>
        <div class="reto-info">
          <div class="reto-name">${r.name}</div>
          <div class="reto-prog">${claimed ? '✅ Reclamado' : full ? '¡Listo para reclamar!' : 'Progreso: ' + val + ' de ' + r.target}</div>
        </div>
        ${claimed ? '' : full
          ? `<button class="bigbtn bb-gold bb-sm" onclick="findeClaim('${r.id}')">Reclamar 🪙+${PW_RETO_REWARD.coins}</button>`
          : `<span class="reto-pend">${val}/${r.target}</span>`}
      </div>`;
  }).join('');
  const allClaimed = PW_RETO_DEFS.every(r => f.claimed[r.id]);
  openModal('🏅 Retos del Finde', `
    <div class="small" style="margin-bottom:8px">Juega este fin de semana y gana premios extra. ¡Vale trazar, unir y armar! 💪</div>
    ${cards}
    <div class="finde-note">${allClaimed ? '👑 ¡Trío perfecto! Eres leyenda del finde.' : 'Completa los 3 para la corona 👑'}</div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ ¡Vale!</button>`);
  checkBadges();
};

window.findeClaim = function (id) {
  const p = activeProfile(); if (!p) return;
  const r = PW_RETO_DEFS.find(x => x.id === id); if (!r) return;
  const f = findeEnsure(p);
  if (!f.claimed[id] && (f.done[id] || 0) >= r.target) {
    f.claimed[id] = true;
    f.total++;
    const all = PW_RETO_DEFS.every(x => f.claimed[x.id]);
    if (all) f.perfect++;
    updateProfile(pp => {
      pp.coins = (pp.coins || 0) + PW_RETO_REWARD.coins;
      pp.xp = (pp.xp || 0) + PW_RETO_REWARD.xp;
      if (all) pp.coins = (pp.coins || 0) + 10; /* bonus corona */
    });
    burst(40); beepWin();
    notif(`🏅 ¡Reto cumplido! +${PW_RETO_REWARD.coins} 🪙 +${PW_RETO_REWARD.xp} XP`, 'var(--gold)');
    if (all) celebrate({
      icon: '👑', title: '¡Trío del finde!',
      sub: 'Completaste los 3 retos. ¡Eres increíble!',
      rewards: [`+${PW_RETO_REWARD.xp} XP`, `+${PW_RETO_REWARD.coins + 10} 🪙`], confetti: 2, dur: 3000
    });
    checkBadges();
    renderFindeBanner();
    openFinde(); /* refresca el modal con el estado nuevo */
  }
};

window.PW_FINDE = {
  /* empuja progreso: bump('traza'[, n]) — llamado por los juegos v14 */
  bump(id, n) {
    const p = activeProfile(); if (!p || !PW_RETO_DEFS.find(r => r.id === id)) return 0;
    const f = findeEnsure(p);
    f.done[id] = (f.done[id] || 0) + (n || 1);
    saveState();
    if (findeIsWeekend()) renderFindeBanner();
    return f.done[id];
  },
  banner: () => !!document.getElementById('findeZone') && !!document.querySelector('.finde-banner'),
  state: () => { const p = activeProfile(); return p ? findeEnsure(p) : null; },
  weekend: findeIsWeekend,
  /* para el arnés: simular fin de semana (key = fecha del sábado) */
  force(key) { this._forced = key || findeKey(); renderFindeBanner(); },
  unforce() { this._forced = null; renderFindeBanner(); }
};

/* fin del archivo — v14 */
