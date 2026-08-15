/**
 * NeuroExplora — game.js  v3.0
 * Motor de gamificación: 7 modos, insignias corregidas, rutas neuronales,
 * verdadero/falso, pares craneales, área incorrecta, puzzle neurona.
 */

// ── ESTADO ───────────────────────────────────────────────────
const GameState = {
  mode: null, difficulty: 'easy',
  currentQ: 0, questions: [],
  score: 0, xp: 0,
  correct: 0, wrong: 0,
  streak: 0, bestStreak: 0,
  timeLeft: 0, timerInterval: null,
  unlockedBadges: new Set(),
  modesPlayed: new Set(),
  hardCorrect: 0, oneClueSolves: 0,
  frontalCorrect: 0, languageCorrect: 0,
  myelinCorrect: 0, electrophysCorrect: 0,
  evoHardCorrect: 0, networksCorrect: 0,
  amygdalaCorrect: 0, hippocampusCorrect: 0,
  cranialCorrect: 0, cranialAllCorrect: 0,
  pathwayCorrect: 0, tfCorrect: 0, tfStreak: 0,
  tfFalseCorrect: 0, identifyCorrect: 0,
  puzzleErrors: 0, puzzlePlaced: {}, puzzleComplete: false,
  selectedPiece: null, puzzleType: 'brain',
  guessIndex: 0, guessClueIdx: 0, guessUsedClues: 0, guessChallenges: [],
  // pathways
  currentPathway: null, pathwaySteps: [], pathwayClickOrder: [],
  pathwayPhase: 'showing', pathwayTimer: null, pathwayIndex: 0,
  pathwayErrors: 0, pathwayDone: 0,
  // cranial
  cranialQuestions: [], cranialIndex: 0,
  // T/F
  tfQuestions: [], tfIndex: 0, tfSessionFalseCorrect: 0,
  // identify
  identifyQuestions: [], identifyIndex: 0,
};

// ── PERSISTENCIA ──────────────────────────────────────────────
function loadXP()       { try { return parseInt(localStorage.getItem('nex_xp') || '0'); } catch(e) { return 0; } }
function saveXP(v)      { try { localStorage.setItem('nex_xp', v); } catch(e) {} }
function loadBadges()   { try { return new Set(JSON.parse(localStorage.getItem('nex_badges') || '[]')); } catch(e) { return new Set(); } }
function saveBadges()   { try { localStorage.setItem('nex_badges', JSON.stringify([...GameState.unlockedBadges])); } catch(e) {} }
function loadModesPlayed() { try { return new Set(JSON.parse(localStorage.getItem('nex_modes') || '[]')); } catch(e) { return new Set(); } }
function saveModesPlayed() { try { localStorage.setItem('nex_modes', JSON.stringify([...GameState.modesPlayed])); } catch(e) {} }

// ── NIVEL ─────────────────────────────────────────────────────
function getLevel(xp) { const lvls = GAME_CONFIG.levels; let c = lvls[0]; for (const l of lvls) { if (xp >= l.xpRequired) c = l; } return c; }
function getNextLevel(xp) { for (const l of GAME_CONFIG.levels) { if (xp < l.xpRequired) return l; } return null; }

// ── XP ────────────────────────────────────────────────────────
function addXP(amount, label = '') {
  const prev = GameState.xp, prevLvl = getLevel(prev);
  GameState.xp += amount; saveXP(GameState.xp);
  const newLvl = getLevel(GameState.xp);
  updateXPBar();
  if (amount > 0) showXPGain(amount, label);
  if (newLvl.level > prevLvl.level) setTimeout(() => showLevelUp(newLvl), 600);
}

function showXPGain(amount, label) {
  const el = document.getElementById('xp-gain-float');
  if (!el) return;
  el.textContent = `+${amount} XP${label ? ' · ' + label : ''}`;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 1400);
}

function showLevelUp(level) {
  const o = document.getElementById('levelup-overlay');
  if (!o) return;
  o.innerHTML = `<div class="levelup-card"><div class="levelup-icon">${level.icon}</div><div class="levelup-title">¡Subiste de nivel!</div><div class="levelup-name">${level.name}</div><div class="levelup-sub">Nivel ${level.level}</div><button onclick="document.getElementById('levelup-overlay').classList.remove('visible')" class="levelup-btn">¡Genial! 🎉</button></div>`;
  o.classList.add('visible');
}

// ── NAVEGACIÓN ────────────────────────────────────────────────
function showHome() {
  stopTimer(); stopPathwayTimer();
  GameState.mode = null;
  showScreen('screen-home');
  updateXPBar(); renderBadges(); updateModeBadges();
}

function showScreen(id) {
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function updateXPBar() {
  const xp = GameState.xp, level = getLevel(xp), next = getNextLevel(xp);
  const pct = next ? Math.round(((xp - level.xpRequired) / (next.xpRequired - level.xpRequired)) * 100) : 100;
  document.querySelectorAll('[data-xp]').forEach(el => el.textContent = `${xp} XP`);
  document.querySelectorAll('[data-level]').forEach(el => el.textContent = `${level.icon} ${level.name}`);
  document.querySelectorAll('[data-xp-bar]').forEach(el => el.style.width = `${pct}%`);
  document.querySelectorAll('[data-xp-next]').forEach(el =>
    el.textContent = next ? `${next.xpRequired - xp} XP para ${next.name}` : '¡Nivel máximo!');
}

function updateModeBadges() {
  ['trivia','puzzle','guess','truefalse','pathway','cranial','identify'].forEach(mode => {
    const btn = document.querySelector(`[data-mode-played="${mode}"]`);
    if (btn) btn.classList.toggle('played', GameState.modesPlayed.has(mode));
  });
}

// ── INSIGNIAS ──────────────────────────────────────────────────
// ✅ CORRECCIÓN CRÍTICA: buscar por b.id (no b.condition)
function checkBadge(id) {
  const badge = BADGES.find(b => b.id === id);
  if (!badge || GameState.unlockedBadges.has(badge.id)) return;
  GameState.unlockedBadges.add(badge.id);
  saveBadges();
  showBadgeToast(badge);
}

function checkAllModes() {
  if (GameState.modesPlayed.size >= 3) checkBadge('all_modes');
}

function showBadgeToast(badge) {
  const toast = document.getElementById('badge-toast');
  if (!toast) return;
  const rc = RARITY_COLORS[badge.rarity] || '#4f8ef7';
  toast.innerHTML = `<div class="bt-icon" style="background:${badge.color}22;border:1px solid ${badge.color}44">${badge.icon}</div><div class="bt-body"><div class="bt-title">¡Insignia desbloqueada!</div><div class="bt-name" style="color:${badge.color}">${badge.name}</div><div class="bt-rarity" style="color:${rc}">${badge.rarity.toUpperCase()}</div><div class="bt-msg">${badge.unlockMsg}</div></div>`;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 4500);
}

function renderBadges() {
  const wrap = document.getElementById('badges-grid');
  if (!wrap) return;
  const modules = ['cerebro','evolución','neurona','corteza','craneal','rutas','verdadero','identifica','global'];
  const mNames  = { cerebro:'🧩 Cerebro', 'evolución':'🦎 Evolución', neurona:'⚡ Neurona', corteza:'🌐 Corteza', craneal:'🧠 Pares Craneales', rutas:'🗺️ Rutas Neuronales', verdadero:'⚖️ Verdadero/Falso', identifica:'👁️ Área Incorrecta', global:'🌍 Global' };
  wrap.innerHTML = modules.map(mod => {
    const modBadges = BADGES.filter(b => b.module === mod);
    if (!modBadges.length) return '';
    return `<div class="badge-module-group"><p class="badge-module-title">${mNames[mod] || mod}</p><div class="badge-row">${modBadges.map(b => {
      const u = GameState.unlockedBadges.has(b.id);
      const rc = RARITY_COLORS[b.rarity] || '#4f8ef7';
      return `<div class="badge-card ${u?'unlocked':'locked'}" title="${b.name}: ${b.desc}" style="${u?`--bc:${b.color};border-color:${b.color}44`:''}"><div class="badge-icon-wrap" style="${u?`background:${b.color}18`:''}">${u?b.icon:'🔒'}</div><div class="badge-name">${b.name}</div><div class="badge-rarity" style="color:${u?rc:'var(--text3)'}">${b.rarity}</div>${u?'':`<div class="badge-lock-hint">Completa desafíos</div>`}</div>`;
    }).join('')}</div></div>`;
  }).join('');
}

function renderNewBadges() {
  const el = document.getElementById('results-new-badges');
  if (!el) return;
  const sb = BADGES.filter(b => GameState.unlockedBadges.has(b.id));
  if (!sb.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<p class="new-badges-label">🏅 Insignias desbloqueadas</p><div class="new-badges-row">${sb.slice(-4).map(b=>`<div class="new-badge-mini" style="--bc:${b.color}"><span class="new-badge-icon">${b.icon}</span><span class="new-badge-name">${b.name}</span></div>`).join('')}</div>`;
}

// ── TRIVIA ────────────────────────────────────────────────────
function startTrivia(difficulty) {
  GameState.mode = 'trivia'; GameState.difficulty = difficulty;
  GameState.currentQ = 0; GameState.correct = 0; GameState.wrong = 0;
  GameState.streak = 0; GameState.bestStreak = 0;
  GameState.hardCorrect = 0; GameState.frontalCorrect = 0; GameState.languageCorrect = 0;
  GameState.amygdalaCorrect = 0; GameState.hippocampusCorrect = 0;
  GameState.modesPlayed.add('trivia'); saveModesPlayed();
  const bank = difficulty === 'easy' ? TRIVIA_EASY : difficulty === 'medium' ? TRIVIA_MEDIUM : TRIVIA_HARD;
  GameState.questions = shuffle(bank).slice(0, GAME_CONFIG.questionsPerRound);
  const tag = document.getElementById('trivia-diff-tag');
  if (tag) { const cfg = {easy:['🟢 Fácil','#34d399'],medium:['🟡 Medio','#fbbf24'],hard:['🔴 Difícil','#f43f5e']}; tag.textContent=cfg[difficulty][0]; tag.style.background=cfg[difficulty][1]+'22'; tag.style.color=cfg[difficulty][1]; tag.style.border=`1px solid ${cfg[difficulty][1]}55`; }
  showScreen('screen-trivia'); renderQuestion();
}

function renderQuestion() {
  const q = GameState.questions[GameState.currentQ];
  if (!q) { finishTrivia(); return; }
  const pct = (GameState.currentQ / GameState.questions.length) * 100;
  const pb = document.getElementById('trivia-progress-bar'); if (pb) pb.style.width = `${pct}%`;
  const pc = document.getElementById('trivia-progress'); if (pc) pc.textContent = `${GameState.currentQ + 1} / ${GameState.questions.length}`;
  const se = document.getElementById('streak-display'); if (se) { se.textContent = GameState.streak > 1 ? `🔥 ×${GameState.streak}` : ''; se.style.display = GameState.streak > 1 ? 'block' : 'none'; }
  const qEl = document.getElementById('trivia-question');
  if (qEl) { qEl.style.opacity = '0'; setTimeout(() => { qEl.textContent = q.q; qEl.style.transition = 'opacity 0.28s'; qEl.style.opacity = '1'; }, 90); }
  const ow = document.getElementById('trivia-options');
  if (ow) { ow.innerHTML = q.options.map((opt, i) => `<button class="trivia-opt" data-idx="${i}" onclick="answerTrivia(${i})"><span class="opt-letter">${['A','B','C','D'][i]}</span><span class="opt-text">${opt}</span></button>`).join(''); }
  document.getElementById('trivia-explanation')?.classList.add('hidden');
  document.getElementById('btn-next-q')?.classList.add('hidden');
  GameState.timeLeft = GAME_CONFIG.timeLimits[GameState.difficulty]; updateTimerDisplay(); stopTimer();
  GameState.timerInterval = setInterval(() => { GameState.timeLeft--; updateTimerDisplay(); if (GameState.timeLeft <= 0) { clearInterval(GameState.timerInterval); answerTrivia(-1); } }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('trivia-timer'), arc = document.getElementById('timer-arc');
  if (!el) return;
  el.textContent = GameState.timeLeft;
  const pct = GameState.timeLeft / GAME_CONFIG.timeLimits[GameState.difficulty];
  el.style.color = pct > 0.4 ? 'var(--text)' : pct > 0.2 ? '#fbbf24' : '#f43f5e';
  if (arc) { const circ = 2 * Math.PI * 22; arc.style.strokeDasharray = circ; arc.style.strokeDashoffset = circ * (1 - pct); arc.style.stroke = pct > 0.4 ? 'var(--accent)' : pct > 0.2 ? '#fbbf24' : '#f43f5e'; }
}

function answerTrivia(idx) {
  stopTimer();
  const q = GameState.questions[GameState.currentQ]; if (!q) return;
  const isCorrect = idx === q.correct, timeout = idx === -1;
  document.querySelectorAll('.trivia-opt').forEach((btn, i) => { btn.disabled = true; if (i === q.correct) btn.classList.add('correct'); if (i === idx && !isCorrect) btn.classList.add('wrong'); });
  if (isCorrect) {
    GameState.correct++; GameState.streak++; GameState.bestStreak = Math.max(GameState.bestStreak, GameState.streak);
    const xp = GAME_CONFIG.xpPerCorrect[GameState.difficulty];
    const speedBonus = GameState.timeLeft >= GAME_CONFIG.timeLimits[GameState.difficulty] - 3;
    const streakBonus = GameState.streak >= 3 ? 5 : 0;
    const total = xp + (speedBonus ? 5 : 0) + streakBonus;
    addXP(total, speedBonus ? '⚡ Rápido' : GameState.streak >= 3 ? `🔥×${GameState.streak}` : '');
    trackModuleProgress(q);
    if (speedBonus) checkBadge('speed_demon');
    if (GameState.streak >= 5) checkBadge('streak_fire');
    if (GameState.correct === 1) checkBadge('brain_explorer');
    showFeedback(true, GameState.streak >= 3 ? `¡Racha de ${GameState.streak}! +${total} XP 🔥` : `+${total} XP`);
  } else {
    GameState.wrong++; GameState.streak = 0;
    showFeedback(false, timeout ? '⏱ Tiempo agotado' : null);
  }
  const expEl = document.getElementById('trivia-explanation');
  if (expEl && q.explanation) { expEl.textContent = q.explanation; expEl.classList.remove('hidden'); }
  document.getElementById('btn-next-q')?.classList.remove('hidden');
  updateXPBar();
}

function trackModuleProgress(q) {
  if (['frontal','prefrontal'].includes(q.region)) { GameState.frontalCorrect++; if (GameState.frontalCorrect >= 3) checkBadge('frontal_master'); }
  if (['broca','wernicke'].includes(q.region)) { GameState.languageCorrect++; if (GameState.languageCorrect >= 2) checkBadge('language_pro'); }
  if (q.module === 'evolución' && GameState.difficulty === 'hard') { GameState.evoHardCorrect++; if (GameState.evoHardCorrect >= 5) checkBadge('darwin_award'); checkBadge('evo_starter'); }
  if (q.module === 'neurona') { checkBadge('synapse_starter'); if (q.explanation?.includes('mielina') || q.q?.includes('mielina')) { GameState.myelinCorrect++; if (GameState.myelinCorrect >= 2) checkBadge('myelin_master'); } if (q.explanation?.includes('Hodgkin') || q.q?.includes('Hodgkin')) { GameState.electrophysCorrect++; if (GameState.electrophysCorrect >= 1) checkBadge('hodgkin_huxley'); } }
  if (q.module === 'corteza') { checkBadge('cortex_explorer'); if (q.q?.toLowerCase().includes('red')) { GameState.networksCorrect++; if (GameState.networksCorrect >= 2) checkBadge('default_mode'); } }
  if (q.region === 'temporal' && (q.q?.includes('amígdala') || q.explanation?.includes('amígdala'))) { GameState.amygdalaCorrect++; if (GameState.amygdalaCorrect >= 2) checkBadge('amygdala_finder'); }
  if (q.q?.includes('hipocampo') || q.explanation?.includes('hipocampo')) { GameState.hippocampusCorrect++; if (GameState.hippocampusCorrect >= 3) checkBadge('hippocampus_hero'); }
  if (GameState.difficulty === 'hard') { GameState.hardCorrect++; if (GameState.hardCorrect >= 5) checkBadge('hard_veteran'); }
}

function nextQuestion() { GameState.currentQ++; if (GameState.currentQ >= GameState.questions.length) finishTrivia(); else renderQuestion(); }
function finishTrivia() { stopTimer(); if (GameState.correct === GAME_CONFIG.questionsPerRound) checkBadge('perfect_round'); checkAllModes(); showResults('trivia'); }

// ── PUZZLE CEREBRO ────────────────────────────────────────────
function startPuzzle(type) {
  GameState.mode = 'puzzle'; GameState.puzzleType = type || 'brain';
  GameState.puzzlePlaced = {}; GameState.puzzleComplete = false;
  GameState.puzzleErrors = 0; GameState.selectedPiece = null;
  GameState.modesPlayed.add('puzzle'); saveModesPlayed();
  showScreen('screen-puzzle'); renderPuzzle();
}

function renderPuzzle() {
  const pieces = GameState.puzzleType === 'neuron' ? NEURON_PUZZLE_PIECES : PUZZLE_PIECES;
  const targetWrap = document.getElementById('puzzle-targets');
  const piecesWrap = document.getElementById('puzzle-pieces');
  if (!targetWrap || !piecesWrap) return;

  const title = GameState.puzzleType === 'neuron' ? '⚡ Arma la Neurona' : '🧩 Arma el Cerebro';
  document.querySelector('#screen-puzzle h2') && (document.querySelector('#screen-puzzle h2').textContent = title);

  if (GameState.puzzleType === 'neuron') {
    renderNeuronPuzzle(targetWrap, piecesWrap, pieces);
  } else {
    renderBrainPuzzle(targetWrap, piecesWrap, pieces);
  }
}

function renderBrainPuzzle(targetWrap, piecesWrap, pieces) {
  targetWrap.innerHTML = `<div class="puzzle-brain-wrap"><svg id="puzzle-brain-svg" viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50,168 C 43,148 42,122 48,100 C 54,78 66,58 84,44 C 102,30 126,20 155,15 C 184,10 214,12 240,20 C 266,28 290,44 306,66 C 322,88 326,116 322,142 C 318,168 307,188 290,202 L 268,214 C 248,218 228,220 210,218 C 186,216 162,206 142,192 C 122,178 106,160 96,148 Z" fill="rgba(15,30,55,0.85)" stroke="rgba(100,150,255,0.15)" stroke-width="1.5"/>
    <path d="M 268,214 C 280,208 298,206 314,212 C 330,218 338,232 336,248 C 334,264 322,272 308,270 C 294,268 280,258 276,244 C 272,232 268,220 268,214 Z" fill="rgba(15,30,55,0.85)" stroke="rgba(100,150,255,0.12)" stroke-width="1.5"/>
    <path d="M 228,220 C 234,216 242,215 248,218 C 252,222 252,234 250,244 C 248,252 242,258 236,256 C 230,253 228,242 228,232 Z" fill="rgba(15,30,55,0.85)" stroke="rgba(100,150,255,0.1)" stroke-width="1.5"/>
    ${PUZZLE_PIECES.map(p => `<g class="puzzle-drop-zone ${GameState.puzzlePlaced[p.id] ? 'placed' : ''}" id="pzone-${p.id}" data-target="${p.id}" style="--pz-color:${p.color}">${getPuzzleDropPath(p.id)}</g>`).join('')}
  </svg>
  <div class="puzzle-progress-label" id="puzzle-progress-label">0 / ${pieces.length} regiones colocadas</div>
  <div class="puzzle-error-count" id="puzzle-error-count" style="display:none">❌ <span id="puzzle-errors">0</span> errores</div>
  </div>`;

  const shuffled = shuffle([...PUZZLE_PIECES]);
  piecesWrap.innerHTML = shuffled.map(p => `<div class="puzzle-piece ${GameState.puzzlePlaced[p.id]?'placed':''}" id="piece-${p.id}" data-piece="${p.id}" draggable="${!GameState.puzzlePlaced[p.id]}" ondragstart="onPieceDragStart(event)" onclick="selectPuzzlePiece('${p.id}')" style="--pc:${p.color}"><span class="piece-emoji">${p.emoji}</span><div><span class="piece-name">${p.name}</span><span class="piece-hint">${p.hint}</span></div></div>`).join('');

  document.querySelectorAll('.puzzle-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); dropPiece(e.dataTransfer.getData('pieceId'), zone.getAttribute('data-target')); });
    zone.addEventListener('click', () => { if (GameState.selectedPiece) { dropPiece(GameState.selectedPiece, zone.getAttribute('data-target')); GameState.selectedPiece = null; document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected')); } });
  });
}

function renderNeuronPuzzle(targetWrap, piecesWrap, pieces) {
  targetWrap.innerHTML = `<div class="puzzle-brain-wrap">
    <svg viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg" style="max-width:380px;width:100%">
      <!-- Neurona base (esquemática) -->
      <ellipse cx="100" cy="140" rx="40" ry="35" fill="rgba(15,30,55,0.85)" stroke="rgba(100,150,255,0.2)" stroke-width="1.5"/>
      <line x1="140" y1="140" x2="320" y2="140" stroke="rgba(100,150,255,0.2)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="340" cy="140" r="14" fill="rgba(15,30,55,0.85)" stroke="rgba(100,150,255,0.15)" stroke-width="1.5"/>
      <!-- Dendritas -->
      <line x1="60" y1="140" x2="30" y2="110" stroke="rgba(100,150,255,0.15)" stroke-width="3"/>
      <line x1="60" y1="140" x2="25" y2="140" stroke="rgba(100,150,255,0.15)" stroke-width="3"/>
      <line x1="60" y1="140" x2="30" y2="170" stroke="rgba(100,150,255,0.15)" stroke-width="3"/>
      ${NEURON_PUZZLE_PIECES.map(p => `<g class="puzzle-drop-zone ${GameState.puzzlePlaced[p.id]?'placed':''}" id="pzone-${p.id}" data-target="${p.id}" style="--pz-color:${p.color}">${getNeuronDropPath(p.id)}</g>`).join('')}
    </svg>
    <div class="puzzle-progress-label" id="puzzle-progress-label">0 / ${pieces.length} partes colocadas</div>
    <div class="puzzle-error-count" id="puzzle-error-count" style="display:none">❌ <span id="puzzle-errors">0</span> errores</div>
  </div>`;

  const shuffled = shuffle([...NEURON_PUZZLE_PIECES]);
  piecesWrap.innerHTML = shuffled.map(p => `<div class="puzzle-piece ${GameState.puzzlePlaced[p.id]?'placed':''}" id="piece-${p.id}" data-piece="${p.id}" draggable="${!GameState.puzzlePlaced[p.id]}" ondragstart="onPieceDragStart(event)" onclick="selectPuzzlePiece('${p.id}')" style="--pc:${p.color}"><span class="piece-emoji">${p.emoji}</span><div><span class="piece-name">${p.name}</span><span class="piece-hint">${p.hint}</span></div></div>`).join('');

  document.querySelectorAll('.puzzle-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); dropPiece(e.dataTransfer.getData('pieceId'), zone.getAttribute('data-target')); });
    zone.addEventListener('click', () => { if (GameState.selectedPiece) { dropPiece(GameState.selectedPiece, zone.getAttribute('data-target')); GameState.selectedPiece = null; document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected')); } });
  });
}

function getNeuronDropPath(id) {
  const c = NEURON_PUZZLE_PIECES.find(p=>p.id===id)?.color || '#4f8ef7';
  const paths = {
    dendrita:  `<path d="M 25,100 L 55,125 L 60,140 L 55,155 L 25,180 L 25,170 L 50,155 L 55,140 L 50,125 L 25,110 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    soma:      `<ellipse cx="100" cy="140" rx="38" ry="33" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    nucleo:    `<ellipse cx="100" cy="140" rx="18" ry="16" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    axilon:    `<rect x="142" y="130" width="80" height="20" rx="5" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    mielina:   `<rect x="225" y="128" width="60" height="24" rx="8" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    nodulo:    `<ellipse cx="226" cy="140" rx="7" ry="10" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    boton:     `<circle cx="340" cy="140" r="13" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
  };
  return paths[id] || '';
}

function getNeuronZoneCenter(id) {
  return {dendrita:{x:40,y:140},soma:{x:100,y:140},nucleo:{x:100,y:140},axilon:{x:182,y:140},mielina:{x:255,y:140},nodulo:{x:226,y:140},boton:{x:340,y:140}}[id] || {x:150,y:140};
}

function selectPuzzlePiece(id) {
  if (GameState.puzzlePlaced[id]) return;
  GameState.selectedPiece = GameState.selectedPiece === id ? null : id;
  document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.toggle('selected', p.dataset.piece === GameState.selectedPiece));
}

function onPieceDragStart(e) { e.dataTransfer.setData('pieceId', e.currentTarget.dataset.piece); }

function dropPiece(pieceId, targetId) {
  if (GameState.puzzlePlaced[pieceId]) return;
  const pieces = GameState.puzzleType === 'neuron' ? NEURON_PUZZLE_PIECES : PUZZLE_PIECES;
  const isCorrect = pieceId === targetId;
  const zone = document.getElementById(`pzone-${targetId}`);
  const piece = document.getElementById(`piece-${pieceId}`);
  if (isCorrect) {
    GameState.puzzlePlaced[pieceId] = true;
    const p = pieces.find(x => x.id === pieceId);
    if (zone) {
      zone.classList.add('placed','correct-anim'); setTimeout(() => zone.classList.remove('correct-anim'), 600);
      const pos = GameState.puzzleType === 'neuron' ? getNeuronZoneCenter(pieceId) : getPuzzleZoneCenter(pieceId);
      const svg = zone.closest('svg');
      if (svg && pos) { const txt = document.createElementNS('http://www.w3.org/2000/svg','text'); txt.setAttribute('x',pos.x); txt.setAttribute('y',pos.y+5); txt.setAttribute('text-anchor','middle'); txt.setAttribute('font-size','16'); txt.setAttribute('fill','rgba(255,255,255,0.95)'); txt.setAttribute('pointer-events','none'); txt.textContent=p.emoji; zone.appendChild(txt); }
    }
    if (piece) { piece.classList.add('placed'); piece.setAttribute('draggable','false'); }
    const placed = Object.keys(GameState.puzzlePlaced).length;
    const lbl = document.getElementById('puzzle-progress-label'); if (lbl) lbl.textContent = `${placed} / ${pieces.length} ${GameState.puzzleType==='neuron'?'partes':'regiones'} colocadas`;
    const xpGain = Math.floor(GAME_CONFIG.xpPerPuzzle / pieces.length);
    addXP(xpGain, p.name); showFeedback(true, `${p.emoji} ${p.name}`);
    if (placed === pieces.length) {
      GameState.puzzleComplete = true;
      if (GameState.puzzleErrors === 0) { addXP(25, '¡Sin errores!'); checkBadge(GameState.puzzleType === 'neuron' ? 'neuron_puzzle_ace' : 'puzzle_master'); }
      else { checkBadge(GameState.puzzleType === 'neuron' ? 'neuron_puzzle_ace' : 'puzzle_master'); addXP(10, 'Puzzle completo'); }
      checkAllModes(); setTimeout(() => showResults('puzzle'), 900);
    }
  } else {
    GameState.puzzleErrors++;
    if (zone) { zone.classList.add('shake'); setTimeout(() => zone.classList.remove('shake'), 450); }
    if (piece) { piece.classList.add('shake'); setTimeout(() => piece.classList.remove('shake'), 450); }
    const errEl = document.getElementById('puzzle-errors'); if (errEl) errEl.textContent = GameState.puzzleErrors;
    const errWrap = document.getElementById('puzzle-error-count'); if (errWrap) errWrap.style.display = 'flex';
    showFeedback(false, '¡Esa posición no es correcta!');
  }
}

function getPuzzleDropPath(id) {
  const c = PUZZLE_PIECES.find(p=>p.id===id)?.color || '#4f8ef7';
  const paths = {
    frontal:   `<path d="M 50,168 C 43,148 42,122 48,100 C 54,78 66,58 84,44 C 102,30 126,20 155,15 C 170,12 186,12 198,16 L 195,180 C 174,178 152,174 130,172 C 106,170 80,169 62,169 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    parietal:  `<path d="M 200,15 C 220,16 238,22 252,32 C 265,42 273,58 274,74 L 272,158 C 254,158 234,158 214,158 L 196,156 L 198,16 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    occipital: `<path d="M 252,32 C 275,46 296,68 308,94 C 320,118 322,144 320,168 L 294,198 C 282,184 272,164 270,148 L 272,74 C 270,58 262,44 252,32 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    temporal:  `<path d="M 62,169 C 80,169 106,170 130,172 C 152,174 174,178 195,180 L 210,218 C 192,220 172,218 152,212 C 130,206 110,194 94,180 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    cerebellum:`<path d="M 268,214 C 280,208 298,206 314,212 C 330,218 338,232 336,248 C 334,264 322,272 308,270 C 294,268 280,258 276,244 Z" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    brainstem: `<path d="M 228,220 C 234,216 242,215 248,218 C 252,222 252,234 250,244 C 248,252 242,258 236,256 C 230,253 228,242 228,232 Z" fill="${c}18" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    broca:     `<ellipse cx="95" cy="162" rx="22" ry="16" fill="${c}14" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
    prefrontal:`<ellipse cx="64" cy="120" rx="26" ry="30" fill="${c}12" stroke="${c}" stroke-width="1.5" stroke-dasharray="5 4"/>`,
  };
  return paths[id] || '';
}

function getPuzzleZoneCenter(id) {
  return {frontal:{x:120,y:100},parietal:{x:228,y:90},occipital:{x:290,y:120},temporal:{x:140,y:190},cerebellum:{x:302,y:238},brainstem:{x:238,y:236},broca:{x:95,y:162},prefrontal:{x:64,y:120}}[id] || {x:150,y:150};
}

// ── ADIVINANZA ─────────────────────────────────────────────────
function startGuess() {
  GameState.mode = 'guess'; GameState.guessIndex = 0; GameState.correct = 0; GameState.oneClueSolves = 0;
  GameState.modesPlayed.add('guess'); saveModesPlayed();
  GameState.guessChallenges = shuffle([...GUESS_CHALLENGES]).slice(0, 6);
  showScreen('screen-guess'); renderGuessChallenge();
}

function renderGuessChallenge() {
  const ch = GameState.guessChallenges[GameState.guessIndex]; if (!ch) { finishGuess(); return; }
  GameState.guessClueIdx = 0; GameState.guessUsedClues = 1;
  document.getElementById('guess-counter').textContent = `${GameState.guessIndex + 1} / ${GameState.guessChallenges.length}`;
  document.getElementById('guess-clue').textContent = ch.clues[0];
  const ci = document.getElementById('clue-indicators'); if (ci) ci.innerHTML = ch.clues.map((_,i) => `<div class="clue-dot ${i===0?'active':''}" id="clue-dot-${i}"></div>`).join('');
  document.getElementById('btn-more-clue').disabled = ch.clues.length <= 1;
  document.getElementById('guess-result')?.classList.add('hidden');
  document.getElementById('btn-next-guess')?.classList.add('hidden');
  const others = PUZZLE_PIECES.filter(p => p.id !== ch.answer);
  const opts = shuffle([...shuffle(others).slice(0,3), PUZZLE_PIECES.find(p => p.id === ch.answer)]);
  GameState.guessOptions = opts;
  document.getElementById('guess-options').innerHTML = opts.map((p,i) => `<button class="guess-opt" data-idx="${i}" onclick="answerGuess('${p.id}')"><span class="guess-opt-emoji">${p.emoji}</span><span>${p.name}</span></button>`).join('');
  const xpPrev = document.getElementById('xp-preview'); if (xpPrev) { xpPrev.textContent = `Acierto con 1 pista: +${GAME_CONFIG.xpPerGuess} XP`; xpPrev.style.color = '#fbbf24'; }
}

function showMoreClue() {
  const ch = GameState.guessChallenges[GameState.guessIndex]; if (!ch || GameState.guessClueIdx >= ch.clues.length - 1) return;
  GameState.guessClueIdx++; GameState.guessUsedClues++;
  const clueEl = document.getElementById('guess-clue'); if (clueEl) { clueEl.style.opacity='0'; setTimeout(()=>{clueEl.textContent=ch.clues[GameState.guessClueIdx];clueEl.style.transition='opacity 0.3s';clueEl.style.opacity='1';},80); }
  document.querySelectorAll('.clue-dot').forEach((dot,i) => dot.classList.toggle('active', i <= GameState.guessClueIdx));
  document.getElementById('btn-more-clue').disabled = GameState.guessClueIdx >= ch.clues.length - 1;
  const xpGain = Math.max(5, GAME_CONFIG.xpPerGuess - (GameState.guessUsedClues - 1) * 8);
  const xpPrev = document.getElementById('xp-preview'); if (xpPrev) { xpPrev.textContent = `Acierto: +${xpGain} XP`; xpPrev.style.color = xpGain < 15 ? '#94a3b8' : '#fbbf24'; }
}

function answerGuess(selectedId) {
  const ch = GameState.guessChallenges[GameState.guessIndex]; if (!ch) return;
  const isCorrect = selectedId === ch.answer;
  const xpGain = isCorrect ? Math.max(5, GAME_CONFIG.xpPerGuess - (GameState.guessUsedClues - 1) * 8) : 0;
  document.querySelectorAll('.guess-opt').forEach((btn,i) => { btn.disabled=true; const id=GameState.guessOptions[parseInt(btn.dataset.idx)]?.id; if(id===ch.answer)btn.classList.add('correct'); if(id===selectedId&&!isCorrect)btn.classList.add('wrong'); });
  const resultEl = document.getElementById('guess-result');
  if (resultEl) { resultEl.classList.remove('hidden'); resultEl.innerHTML = isCorrect ? `<span class="result-correct">✓ ¡${ch.answerName}! <span style="color:${ch.color}">●</span></span><span class="result-xp">+${xpGain} XP</span>` : `<span class="result-wrong">✗ Era: ${ch.answerName} <span style="color:${ch.color}">●</span></span>`; }
  if (isCorrect) { GameState.correct++; if (GameState.guessUsedClues === 1) { GameState.oneClueSolves++; if (GameState.oneClueSolves >= 3) checkBadge('guess_genius'); } addXP(xpGain, ch.answerName); checkBadge('brain_explorer'); }
  document.getElementById('btn-next-guess')?.classList.remove('hidden');
}

function nextGuess() { GameState.guessIndex++; if (GameState.guessIndex >= GameState.guessChallenges.length) finishGuess(); else renderGuessChallenge(); }
function finishGuess() { checkAllModes(); showResults('guess'); }

// ── VERDADERO / FALSO ─────────────────────────────────────────
function startTrueFalse() {
  GameState.mode = 'truefalse'; GameState.tfIndex = 0; GameState.correct = 0; GameState.wrong = 0;
  GameState.tfStreak = 0; GameState.tfSessionFalseCorrect = 0;
  GameState.modesPlayed.add('truefalse'); saveModesPlayed();
  GameState.tfQuestions = shuffle([...TRUE_FALSE_QUESTIONS]).slice(0, 10);
  showScreen('screen-truefalse'); renderTFQuestion();
}

function renderTFQuestion() {
  const q = GameState.tfQuestions[GameState.tfIndex]; if (!q) { finishTF(); return; }
  const pct = (GameState.tfIndex / GameState.tfQuestions.length) * 100;
  const pb = document.getElementById('tf-progress-bar'); if (pb) pb.style.width = `${pct}%`;
  const pc = document.getElementById('tf-progress'); if (pc) pc.textContent = `${GameState.tfIndex + 1} / ${GameState.tfQuestions.length}`;
  const stEl = document.getElementById('tf-statement'); if (stEl) { stEl.style.opacity='0'; setTimeout(()=>{stEl.textContent=q.statement;stEl.style.transition='opacity 0.3s';stEl.style.opacity='1';},80); }
  const modEl = document.getElementById('tf-module'); if (modEl) modEl.textContent = `📚 ${q.module}`;
  const expEl = document.getElementById('tf-explanation'); if (expEl) expEl.classList.add('hidden');
  const btnWrap = document.getElementById('tf-buttons');
  if (btnWrap) { btnWrap.innerHTML = `<button class="tf-btn tf-true" onclick="answerTF(true)">✓ VERDADERO</button><button class="tf-btn tf-false" onclick="answerTF(false)">✗ FALSO</button>`; }
  document.getElementById('btn-next-tf')?.classList.add('hidden');
  GameState.timeLeft = GAME_CONFIG.timeLimits.tf; updateTFTimer(); stopTimer();
  GameState.timerInterval = setInterval(() => { GameState.timeLeft--; updateTFTimer(); if (GameState.timeLeft <= 0) { clearInterval(GameState.timerInterval); answerTF(null); } }, 1000);
}

function updateTFTimer() {
  const el = document.getElementById('tf-timer'); if (!el) return;
  el.textContent = GameState.timeLeft; el.style.color = GameState.timeLeft > 5 ? 'var(--text)' : '#f43f5e';
}

function answerTF(userAnswer) {
  stopTimer();
  const q = GameState.tfQuestions[GameState.tfIndex]; if (!q) return;
  const isCorrect = userAnswer === q.answer;
  const timeout = userAnswer === null;
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.classList.contains('tf-true') && q.answer === true) btn.classList.add('correct');
    if (btn.classList.contains('tf-false') && q.answer === false) btn.classList.add('correct');
    if ((btn.classList.contains('tf-true') && userAnswer === true && !isCorrect) || (btn.classList.contains('tf-false') && userAnswer === false && !isCorrect)) btn.classList.add('wrong');
  });
  if (isCorrect) {
    GameState.correct++; GameState.tfStreak++;
    if (q.answer === false) GameState.tfSessionFalseCorrect++;
    const xp = GAME_CONFIG.xpPerTF.correct + (GameState.tfStreak >= 3 ? GAME_CONFIG.xpPerTF.bonus : 0);
    addXP(xp, GameState.tfStreak >= 3 ? `🔥×${GameState.tfStreak}` : '');
    checkBadge('tf_starter');
    if (GameState.tfStreak >= 8) checkBadge('tf_streak');
    if (GameState.tfSessionFalseCorrect >= 5) checkBadge('myth_buster');
    showFeedback(true, `+${xp} XP`);
  } else {
    GameState.wrong++; GameState.tfStreak = 0;
    showFeedback(false, timeout ? '⏱ Tiempo agotado' : null);
  }
  const expEl = document.getElementById('tf-explanation');
  if (expEl && q.explanation) { expEl.textContent = q.explanation; expEl.classList.remove('hidden'); }
  document.getElementById('btn-next-tf')?.classList.remove('hidden');
  updateXPBar();
}

function nextTF() { GameState.tfIndex++; if (GameState.tfIndex >= GameState.tfQuestions.length) finishTF(); else renderTFQuestion(); }
function finishTF() { stopTimer(); if (GameState.correct >= 9) checkBadge('tf_streak'); checkAllModes(); showResults('truefalse'); }

// ── PARES CRANEALES ──────────────────────────────────────────
function startCranial() {
  GameState.mode = 'cranial'; GameState.cranialIndex = 0; GameState.correct = 0; GameState.wrong = 0;
  GameState.cranialCorrect = 0;
  GameState.modesPlayed.add('cranial'); saveModesPlayed();
  GameState.cranialQuestions = buildCranialQuestions().slice(0, 12);
  showScreen('screen-cranial'); renderCranialQ();
}

function renderCranialQ() {
  const q = GameState.cranialQuestions[GameState.cranialIndex]; if (!q) { finishCranial(); return; }
  const pct = (GameState.cranialIndex / GameState.cranialQuestions.length) * 100;
  const pb = document.getElementById('cranial-progress-bar'); if (pb) pb.style.width = `${pct}%`;
  const pc = document.getElementById('cranial-progress'); if (pc) pc.textContent = `${GameState.cranialIndex + 1} / ${GameState.cranialQuestions.length}`;
  const qEl = document.getElementById('cranial-question'); if (qEl) { qEl.style.opacity='0'; setTimeout(()=>{qEl.textContent=q.q;qEl.style.transition='opacity 0.3s';qEl.style.opacity='1';},80); }
  const emoEl = document.getElementById('cranial-emoji'); if (emoEl) emoEl.textContent = q.emoji || '🦴';
  const expEl = document.getElementById('cranial-explanation'); if (expEl) expEl.classList.add('hidden');
  const ow = document.getElementById('cranial-options');
  if (ow) { ow.innerHTML = q.options.map((opt,i) => `<button class="trivia-opt" data-idx="${i}" onclick="answerCranial(${i})"><span class="opt-letter">${['A','B','C','D'][i]}</span><span class="opt-text">${opt}</span></button>`).join(''); }
  document.getElementById('btn-next-cranial')?.classList.add('hidden');
  GameState.timeLeft = GAME_CONFIG.timeLimits.cranial; updateCranialTimer(); stopTimer();
  GameState.timerInterval = setInterval(() => { GameState.timeLeft--; updateCranialTimer(); if (GameState.timeLeft <= 0) { clearInterval(GameState.timerInterval); answerCranial(-1); } }, 1000);
}

function updateCranialTimer() {
  const el = document.getElementById('cranial-timer'); if (!el) return;
  el.textContent = GameState.timeLeft; el.style.color = GameState.timeLeft > 6 ? 'var(--text)' : '#f43f5e';
}

function answerCranial(idx) {
  stopTimer();
  const q = GameState.cranialQuestions[GameState.cranialIndex]; if (!q) return;
  const isCorrect = idx === q.correct, timeout = idx === -1;
  document.querySelectorAll('#cranial-options .trivia-opt').forEach((btn,i) => { btn.disabled=true; if(i===q.correct)btn.classList.add('correct'); if(i===idx&&!isCorrect)btn.classList.add('wrong'); });
  if (isCorrect) {
    GameState.correct++; GameState.cranialCorrect++;
    const xp = GAME_CONFIG.xpPerCranial + (GameState.timeLeft > 12 ? 5 : 0);
    addXP(xp, '🧠 Par Craneal');
    if (GameState.cranialCorrect === 1) checkBadge('cranial_1st');
    if (GameState.cranialCorrect >= 8) checkBadge('cranial_master');
    if (GameState.correct === 12) checkBadge('cranial_legend');
    showFeedback(true, `+${xp} XP`);
  } else {
    GameState.wrong++; showFeedback(false, timeout ? '⏱ Tiempo agotado' : null);
  }
  const expEl = document.getElementById('cranial-explanation');
  if (expEl && q.explanation) { expEl.textContent = q.explanation; expEl.classList.remove('hidden'); }
  document.getElementById('btn-next-cranial')?.classList.remove('hidden');
  updateXPBar();
}

function nextCranial() { GameState.cranialIndex++; if (GameState.cranialIndex >= GameState.cranialQuestions.length) finishCranial(); else renderCranialQ(); }
function finishCranial() { stopTimer(); checkAllModes(); showResults('cranial'); }

// ── ÁREA INCORRECTA ──────────────────────────────────────────
function startIdentify() {
  GameState.mode = 'identify'; GameState.identifyIndex = 0; GameState.correct = 0; GameState.wrong = 0;
  GameState.identifyCorrect = 0;
  GameState.modesPlayed.add('identify'); saveModesPlayed();
  GameState.identifyQuestions = shuffle([...IDENTIFY_QUESTIONS]).slice(0, 7);
  showScreen('screen-identify'); renderIdentifyQ();
}

function renderIdentifyQ() {
  const q = GameState.identifyQuestions[GameState.identifyIndex]; if (!q) { finishIdentify(); return; }
  const pct = (GameState.identifyIndex / GameState.identifyQuestions.length) * 100;
  const pb = document.getElementById('identify-progress-bar'); if (pb) pb.style.width = `${pct}%`;
  const pc = document.getElementById('identify-progress'); if (pc) pc.textContent = `${GameState.identifyIndex + 1} / ${GameState.identifyQuestions.length}`;
  const tEl = document.getElementById('identify-title'); if (tEl) tEl.textContent = q.title;
  const expEl = document.getElementById('identify-explanation'); if (expEl) expEl.classList.add('hidden');
  const ow = document.getElementById('identify-options');
  if (ow) { ow.innerHTML = q.areas.map((area,i) => `<button class="identify-opt" data-id="${area.id}" onclick="answerIdentify('${area.id}', ${area.correct})"><div class="identify-area-name">${area.name}</div><div class="identify-area-func">${area.function}</div></button>`).join(''); }
  document.getElementById('btn-next-identify')?.classList.add('hidden');
  GameState.timeLeft = GAME_CONFIG.timeLimits.identify; updateIdentifyTimer(); stopTimer();
  GameState.timerInterval = setInterval(() => { GameState.timeLeft--; updateIdentifyTimer(); if (GameState.timeLeft <= 0) { clearInterval(GameState.timerInterval); answerIdentify(null, null); } }, 1000);
}

function updateIdentifyTimer() {
  const el = document.getElementById('identify-timer'); if (!el) return;
  el.textContent = GameState.timeLeft; el.style.color = GameState.timeLeft > 8 ? 'var(--text)' : '#f43f5e';
}

function answerIdentify(selectedId, isAreaCorrect) {
  stopTimer();
  const q = GameState.identifyQuestions[GameState.identifyIndex]; if (!q) return;
  const timeout = selectedId === null;
  const isCorrect = !timeout && !isAreaCorrect && selectedId === q.wrongId;
  document.querySelectorAll('.identify-opt').forEach(btn => {
    btn.disabled = true;
    const aid = btn.getAttribute('data-id');
    if (aid === q.wrongId) btn.classList.add('correct'); // highlight the WRONG area in green (correct answer)
    if (aid === selectedId && isAreaCorrect) btn.classList.add('wrong'); // highlight what player clicked if wrong
  });
  if (isCorrect) {
    GameState.correct++; GameState.identifyCorrect++;
    const xp = GAME_CONFIG.xpPerIdentify + (GameState.timeLeft > 15 ? 8 : 0);
    addXP(xp, '👁️ Detectado');
    if (GameState.identifyCorrect === 1) checkBadge('identify_1st');
    if (GameState.identifyCorrect >= 5) checkBadge('identify_master');
    showFeedback(true, `¡Correcto! +${xp} XP`);
  } else {
    GameState.wrong++;
    showFeedback(false, timeout ? '⏱ Tiempo agotado' : '¡Esa no era la incorrecta!');
  }
  const expEl = document.getElementById('identify-explanation');
  if (expEl && q.explanation) { expEl.textContent = q.explanation; expEl.classList.remove('hidden'); }
  document.getElementById('btn-next-identify')?.classList.remove('hidden');
  updateXPBar();
}

function nextIdentify() { GameState.identifyIndex++; if (GameState.identifyIndex >= GameState.identifyQuestions.length) finishIdentify(); else renderIdentifyQ(); }
function finishIdentify() { stopTimer(); checkAllModes(); showResults('identify'); }

// ── RUTAS NEURONALES ─────────────────────────────────────────
function startPathway() {
  GameState.mode = 'pathway'; GameState.pathwayDone = 0; GameState.correct = 0; GameState.pathwayErrors = 0;
  GameState.modesPlayed.add('pathway'); saveModesPlayed();
  GameState.pathwayScenarios = shuffle([...PATHWAY_SCENARIOS]).slice(0, 5);
  GameState.pathwayIndex = 0;
  showScreen('screen-pathway'); renderPathwayChallenge();
}

function renderPathwayChallenge() {
  const sc = GameState.pathwayScenarios?.[GameState.pathwayIndex]; if (!sc) { finishPathway(); return; }
  GameState.currentPathway = sc; GameState.pathwaySteps = [...sc.steps]; GameState.pathwayClickOrder = [];
  GameState.pathwayPhase = 'showing';

  const pcEl = document.getElementById('pathway-counter'); if (pcEl) pcEl.textContent = `${GameState.pathwayIndex + 1} / ${GameState.pathwayScenarios.length}`;
  const emEl = document.getElementById('pathway-emoji'); if (emEl) emEl.textContent = sc.emoji;
  const naEl = document.getElementById('pathway-name'); if (naEl) naEl.textContent = sc.name;
  const inEl = document.getElementById('pathway-intro'); if (inEl) inEl.textContent = sc.intro;
  const stEl = document.getElementById('pathway-status'); if (stEl) stEl.textContent = 'Observa la ruta...';

  renderPathwayNodes(false);
  showPathwaySequence();
}

function renderPathwayNodes(interactive) {
  const sc = GameState.currentPathway; if (!sc) return;
  const wrap = document.getElementById('pathway-nodes'); if (!wrap) return;
  const allRegions = [...new Set(sc.steps.map(s => s.regionId))];

  wrap.innerHTML = allRegions.map(rId => {
    const step = sc.steps.find(s => s.regionId === rId);
    const pos = PATHWAY_REGION_POS[rId] || { x:50, y:50 };
    const clickable = interactive ? 'onclick="pathwayNodeClick(\'' + rId + '\')"' : '';
    return `<div class="pathway-node" id="pnode-${rId}" data-region="${rId}" style="left:${pos.x}%;top:${pos.y}%;--nc:${step?.color || '#4f8ef7'}" ${clickable}><span class="pnode-label">${step?.label || rId}</span></div>`;
  }).join('');
}

function showPathwaySequence() {
  const sc = GameState.currentPathway; if (!sc) return;
  document.querySelectorAll('.pathway-node').forEach(n => n.classList.remove('active','done','error','highlight'));
  let delay = 0;
  sc.steps.forEach((step, i) => {
    setTimeout(() => {
      const node = document.getElementById(`pnode-${step.regionId}`);
      if (node) {
        node.classList.add('highlight');
        node.innerHTML = `<span class="pnode-num">${i+1}</span><span class="pnode-label">${step.label}</span>`;
      }
    }, delay);
    delay += 900;
    setTimeout(() => {
      const node = document.getElementById(`pnode-${step.regionId}`);
      if (node && i < sc.steps.length - 1) node.classList.remove('highlight');
    }, delay + 100);
  });
  setTimeout(() => {
    // After showing, enter interactive phase
    GameState.pathwayPhase = 'interactive';
    const stEl = document.getElementById('pathway-status'); if (stEl) stEl.textContent = '¡Ahora toca las regiones en el mismo orden!';
    document.querySelectorAll('.pathway-node').forEach(n => {
      n.classList.remove('highlight');
      const rId = n.getAttribute('data-region');
      const step = sc.steps.find(s => s.regionId === rId);
      n.onclick = () => pathwayNodeClick(rId);
      n.innerHTML = `<span class="pnode-label">${step?.label || rId}</span>`;
    });
  }, delay + 400);
}

function pathwayNodeClick(regionId) {
  if (GameState.pathwayPhase !== 'interactive') return;
  const sc = GameState.currentPathway; if (!sc) return;
  const expectedIdx = GameState.pathwayClickOrder.length;
  const expected = sc.steps[expectedIdx];
  const node = document.getElementById(`pnode-${regionId}`);

  if (expected && regionId === expected.regionId) {
    GameState.pathwayClickOrder.push(regionId);
    if (node) { node.classList.add('done'); node.innerHTML = `<span class="pnode-num">${expectedIdx+1}</span><span class="pnode-label">${expected.label}</span>`; }
    showFeedback(true, expected.desc);
    if (GameState.pathwayClickOrder.length === sc.steps.length) {
      // Completed!
      GameState.correct++;
      const xp = GAME_CONFIG.xpPerPathway[sc.difficulty === 1 ? 'easy' : sc.difficulty === 2 ? 'medium' : 'hard'];
      addXP(xp, sc.name);
      checkBadge('pathway_starter');
      if (GameState.correct >= 5 && GameState.pathwayErrors === 0) checkBadge('pathway_master');
      const stEl = document.getElementById('pathway-status'); if (stEl) stEl.textContent = `✓ ¡Ruta correcta! +${xp} XP`;
      setTimeout(() => { GameState.pathwayIndex++; renderPathwayChallenge(); }, 1500);
    }
  } else {
    GameState.pathwayErrors++;
    if (node) { node.classList.add('error'); setTimeout(() => node.classList.remove('error'), 500); }
    showFeedback(false, `El orden no es correcto. Empieza por: ${sc.steps[0].label}`);
    // Reset
    setTimeout(() => {
      GameState.pathwayClickOrder = [];
      document.querySelectorAll('.pathway-node').forEach(n => { n.classList.remove('done','error','highlight'); const rId=n.getAttribute('data-region'); const step=sc.steps.find(s=>s.regionId===rId); n.innerHTML=`<span class="pnode-label">${step?.label||rId}</span>`; });
      const stEl = document.getElementById('pathway-status'); if (stEl) stEl.textContent = '¡Inténtalo de nuevo! Toca en el orden correcto.';
    }, 600);
  }
}

function stopPathwayTimer() { if (GameState.pathwayTimer) { clearInterval(GameState.pathwayTimer); GameState.pathwayTimer = null; } }
function finishPathway() { checkAllModes(); showResults('pathway'); }

// ── RESULTADOS ─────────────────────────────────────────────────
function showResults(mode) {
  showScreen('screen-results');
  const modeMap = {
    trivia: GameState.questions.length, puzzle: (GameState.puzzleType === 'neuron' ? NEURON_PUZZLE_PIECES.length : PUZZLE_PIECES.length),
    guess: GameState.guessChallenges.length, truefalse: GameState.tfQuestions.length,
    cranial: GameState.cranialQuestions.length, identify: GameState.identifyQuestions.length,
    pathway: GameState.pathwayScenarios?.length || 5,
  };
  const total = modeMap[mode] || 8;
  const correct = mode === 'puzzle' ? Object.keys(GameState.puzzlePlaced).length : GameState.correct;
  const pct = Math.round((correct / total) * 100);
  const stars = pct >= 90 ? 3 : pct >= 65 ? 2 : pct >= 40 ? 1 : 0;
  const msgs = {100:'¡Impecable! Eres un maestro de la neurociencia 🧬', 75:'¡Excelente! Tu cerebro está en plena forma 🧠', 50:'¡Buen trabajo! Sigue explorando 🔬', 0:'¡Sigue practicando! Cada intento suma 🌱'};
  const msgKey = pct === 100 ? 100 : pct >= 75 ? 75 : pct >= 50 ? 50 : 0;
  const modeNames = {trivia:'Trivia',puzzle:'Puzzle',guess:'¿Qué región soy?',truefalse:'Verdadero / Falso',cranial:'Pares Craneales',identify:'Área Incorrecta',pathway:'Rutas Neuronales'};
  document.getElementById('results-content').innerHTML = `
    <div class="results-mode-badge">${modeNames[mode] || mode}</div>
    <div class="results-stars" id="results-stars-anim">${Array.from({length:3},(_,i)=>`<span class="result-star ${i<stars?'filled':'empty'}" style="animation-delay:${i*0.18}s">${i<stars?'★':'☆'}</span>`).join('')}</div>
    <div class="results-score"><span class="results-correct">${correct}</span><span class="results-divider">/</span><span class="results-total">${total}</span></div>
    <div class="results-pct">${pct}% de aciertos</div>
    <p class="results-msg">${msgs[msgKey]}</p>
    ${mode==='trivia'&&GameState.bestStreak>1?`<div class="results-streak">🔥 Mejor racha: ${GameState.bestStreak}</div>`:''}
    ${mode==='puzzle'&&GameState.puzzleErrors===0?`<div class="results-streak">🏆 ¡Sin errores!</div>`:''}
    ${mode==='truefalse'&&GameState.tfStreak>0?`<div class="results-streak">✓ Racha máxima: ${GameState.tfStreak}</div>`:''}
    ${mode==='pathway'&&GameState.pathwayErrors===0?`<div class="results-streak">🗺️ ¡Rutas perfectas!</div>`:''}
  `;
  renderNewBadges();
}

// ── FEEDBACK ───────────────────────────────────────────────────
function showFeedback(correct, text) {
  const el = document.getElementById('feedback-toast'); if (!el) return;
  const msgs = correct ? FEEDBACK.correct : FEEDBACK.wrong;
  const label = text || msgs[Math.floor(Math.random() * msgs.length)];
  el.textContent = (correct ? '✓ ' : '✗ ') + label;
  el.className = `feedback-toast ${correct ? 'fb-correct' : 'fb-wrong'} visible`;
  setTimeout(() => el.classList.remove('visible'), 1700);
}

function stopTimer() { if (GameState.timerInterval) { clearInterval(GameState.timerInterval); GameState.timerInterval = null; } }

// ── INICIALIZACIÓN ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  GameState.xp = loadXP(); GameState.unlockedBadges = loadBadges(); GameState.modesPlayed = loadModesPlayed();
  updateXPBar(); renderBadges(); updateModeBadges();

  document.getElementById('btn-home-back')?.addEventListener('click', showHome);
  document.getElementById('btn-results-home')?.addEventListener('click', showHome);
  document.getElementById('btn-results-retry')?.addEventListener('click', () => {
    if (GameState.mode === 'trivia') startTrivia(GameState.difficulty);
    else if (GameState.mode === 'puzzle') startPuzzle(GameState.puzzleType);
    else if (GameState.mode === 'guess') startGuess();
    else if (GameState.mode === 'truefalse') startTrueFalse();
    else if (GameState.mode === 'cranial') startCranial();
    else if (GameState.mode === 'identify') startIdentify();
    else if (GameState.mode === 'pathway') startPathway();
  });
  document.getElementById('btn-next-q')?.addEventListener('click', nextQuestion);
  document.getElementById('btn-more-clue')?.addEventListener('click', showMoreClue);
  document.getElementById('btn-next-guess')?.addEventListener('click', nextGuess);
  document.getElementById('btn-next-tf')?.addEventListener('click', nextTF);
  document.getElementById('btn-next-cranial')?.addEventListener('click', nextCranial);
  document.getElementById('btn-next-identify')?.addEventListener('click', nextIdentify);

  document.addEventListener('keydown', e => {
    if (GameState.mode !== 'trivia' && GameState.mode !== 'cranial') return;
    const idx = {a:0,b:1,c:2,d:3}[e.key.toLowerCase()];
    if (idx !== undefined) {
      if (GameState.mode === 'trivia') document.querySelector(`.trivia-opt[data-idx="${idx}"]`)?.click();
      if (GameState.mode === 'cranial') document.querySelectorAll('#cranial-options .trivia-opt')[idx]?.click();
    }
  });
});
