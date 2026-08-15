/**
 * NeuroExplora — neuron.js  v1.0
 * Motor del módulo de Neurona Interactiva.
 * Gestiona: animación del impulso, selección de partes,
 * panel de información, velocidades y estrellas.
 */

// ── ESTADO ──────────────────────────────────────
const NeuronState = {
  activePart: null,
  impulseRunning: false,
  impulsePaused: false,
  impulsePhase: 0,
  impulseTimer: null,
  speedMultiplier: 1,
  factIndex: 0,
};

// Duraciones base por fase (ms)
const BASE_DURATIONS = [900, 700, 1400, 900];

// ── CONSTRUCCIÓN DEL SVG ────────────────────────
// El SVG se construye en HTML inline para permitir
// manipulación completa con JS y CSS animations.

function buildNeuronSVG() {
  const container = document.getElementById('neuron-svg-container');
  container.innerHTML = `
<svg id="neuron-svg" xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 860 340" role="img"
     aria-label="Diagrama interactivo de una neurona humana">
  <defs>
    <!-- Gradientes -->
    <radialGradient id="ng-soma" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#7ec8f7"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </radialGradient>
    <radialGradient id="ng-nucleus" cx="40%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#93c5fd" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="ng-axon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f8ef7"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
    <linearGradient id="ng-myelin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.72"/>
    </linearGradient>
    <radialGradient id="ng-terminal" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#c4b5fd"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </radialGradient>
    <!-- Filtros de glow -->
    <filter id="nf-glow-blue" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="nf-glow-green" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="nf-glow-purple" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="nf-glow-yellow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="nf-impulse" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Clip path para el axón (impulso viaja dentro) -->
    <clipPath id="axon-clip">
      <rect x="310" y="158" width="390" height="24" rx="6"/>
    </clipPath>
  </defs>

  <!-- ═══════════ DENDRITAS ═══════════ -->
  <g id="part-dendrites" class="neuron-part" data-part="dendrites" style="cursor:pointer">
    <!-- Dendrita superior principal -->
    <path d="M 200,170 C 178,170 158,157 138,142 C 118,127 100,110 82,94"
          class="dendrite-path" stroke="#38bdf8" stroke-width="4.5"
          fill="none" stroke-linecap="round"/>
    <!-- Rama sup-1 -->
    <path d="M 155,157 C 135,148 112,142 88,140"
          class="dendrite-path" stroke="#38bdf8" stroke-width="3"
          fill="none" stroke-linecap="round"/>
    <!-- Sub-rama -->
    <path d="M 82,94 C 68,82 52,76 36,74"    class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 82,94 C 74,78 68,62 66,46"    class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 88,140 C 70,132 54,128 38,128" class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Espinas dendríticas -->
    <circle cx="36"  cy="74"  r="5" class="dendrite-spine" fill="#38bdf8"/>
    <circle cx="66"  cy="46"  r="4.5" class="dendrite-spine" fill="#38bdf8"/>
    <circle cx="38"  cy="128" r="4.5" class="dendrite-spine" fill="#38bdf8"/>
    <!-- Dendrita inferior principal -->
    <path d="M 200,170 C 178,175 158,188 138,205 C 118,222 100,238 82,254"
          class="dendrite-path" stroke="#38bdf8" stroke-width="4.5"
          fill="none" stroke-linecap="round"/>
    <path d="M 155,188 C 135,196 112,202 88,202"
          class="dendrite-path" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 82,254 C 66,268 50,274 34,276"  class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 82,254 C 74,270 70,286 68,300"  class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 88,202 C 70,210 54,216 38,218"  class="dendrite-path" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="34"  cy="276" r="5"   class="dendrite-spine" fill="#38bdf8"/>
    <circle cx="68"  cy="300" r="4.5" class="dendrite-spine" fill="#38bdf8"/>
    <circle cx="38"  cy="218" r="4.5" class="dendrite-spine" fill="#38bdf8"/>
    <!-- Dendrita central -->
    <path d="M 200,170 C 178,170 152,170 128,170"
          class="dendrite-path" stroke="#38bdf8" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M 128,170 C 110,170 92,168 74,166"
          class="dendrite-path" stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="74" cy="166" r="4.5" class="dendrite-spine" fill="#38bdf8"/>
    <!-- Hit area invisible para click más fácil -->
    <rect x="20" y="35" width="190" height="280" fill="transparent"/>
  </g>

  <!-- ═══════════ SOMA ═══════════ -->
  <g id="part-soma" class="neuron-part" data-part="soma" style="cursor:pointer">
    <ellipse cx="245" cy="170" rx="48" ry="46" fill="url(#ng-soma)" opacity="0.88"/>
    <ellipse cx="245" cy="170" rx="48" ry="46" fill="none" stroke="#7ec8f7" stroke-width="1.5" opacity="0.45"/>
    <!-- Núcleo -->
    <circle cx="245" cy="168" r="19" fill="url(#ng-nucleus)" opacity="0.5"/>
    <circle cx="245" cy="168" r="8"  fill="rgba(255,255,255,0.38)"/>
    <!-- Nucléolo -->
    <circle cx="248" cy="165" r="4"  fill="rgba(79,142,247,0.85)"/>
  </g>

  <!-- Etiqueta cono axónico -->
  <g id="part-axon-hillock" class="neuron-part" data-part="axon-hillock" style="cursor:pointer">
    <path d="M 288,160 C 304,160 314,164 320,170 C 314,176 304,180 288,180 Z"
          fill="#4f8ef7" opacity="0.82"/>
  </g>

  <!-- ═══════════ AXÓN (base) ═══════════ -->
  <g id="part-axon-base">
    <rect x="320" y="163" width="380" height="14" rx="7" fill="url(#ng-axon)" opacity="0.78"/>
  </g>

  <!-- ═══════════ VAINA DE MIELINA ═══════════ -->
  <g id="part-myelin" class="neuron-part" data-part="myelin" style="cursor:pointer">
    <!-- Segmento 1 -->
    <rect x="328" y="157" width="66" height="26" rx="13" fill="url(#ng-myelin)" opacity="0.8" class="myelin-seg"/>
    <!-- Nódulo 1 -->
    <rect x="394" y="163" width="9" height="14" rx="4.5" fill="rgba(255,255,255,0.1)"/>
    <!-- Segmento 2 -->
    <rect x="403" y="157" width="66" height="26" rx="13" fill="url(#ng-myelin)" opacity="0.8" class="myelin-seg"/>
    <!-- Nódulo 2 -->
    <rect x="469" y="163" width="9" height="14" rx="4.5" fill="rgba(255,255,255,0.1)"/>
    <!-- Segmento 3 -->
    <rect x="478" y="157" width="66" height="26" rx="13" fill="url(#ng-myelin)" opacity="0.8" class="myelin-seg"/>
    <!-- Nódulo 3 -->
    <rect x="544" y="163" width="9" height="14" rx="4.5" fill="rgba(255,255,255,0.1)"/>
    <!-- Segmento 4 -->
    <rect x="553" y="157" width="66" height="26" rx="13" fill="url(#ng-myelin)" opacity="0.8" class="myelin-seg"/>
    <!-- Nódulo 4 -->
    <rect x="619" y="163" width="9" height="14" rx="4.5" fill="rgba(255,255,255,0.1)"/>
    <!-- Segmento 5 -->
    <rect x="628" y="157" width="54" height="26" rx="13" fill="url(#ng-myelin)" opacity="0.76" class="myelin-seg"/>
    <!-- Área invisible de hit -->
    <rect x="328" y="152" width="360" height="36" fill="transparent"/>
  </g>

  <!-- ═══════════ NÓDULOS (parte separada) ═══════════ -->
  <g id="part-nodes" class="neuron-part" data-part="nodes" style="cursor:pointer">
    <circle cx="398" cy="170" r="6" fill="#e2e8f0" opacity="0.7" class="ranvier-node"/>
    <circle cx="473" cy="170" r="6" fill="#e2e8f0" opacity="0.7" class="ranvier-node"/>
    <circle cx="548" cy="170" r="6" fill="#e2e8f0" opacity="0.7" class="ranvier-node"/>
    <circle cx="623" cy="170" r="6" fill="#e2e8f0" opacity="0.7" class="ranvier-node"/>
  </g>

  <!-- ═══════════ TERMINALES SINÁPTICOS ═══════════ -->
  <g id="part-terminals" class="neuron-part" data-part="terminals" style="cursor:pointer">
    <!-- Rama superior -->
    <path d="M 684,170 C 694,170 700,155 706,140 C 712,124 722,112 736,106"
          stroke="#a78bfa" stroke-width="3" fill="none" stroke-linecap="round" class="terminal-branch"/>
    <!-- Rama inferior -->
    <path d="M 684,170 C 694,170 700,185 706,200 C 712,215 722,228 736,234"
          stroke="#a78bfa" stroke-width="3" fill="none" stroke-linecap="round" class="terminal-branch"/>
    <!-- Rama central -->
    <path d="M 684,170 C 700,170 716,170 720,170"
          stroke="#a78bfa" stroke-width="3" fill="none" stroke-linecap="round" class="terminal-branch"/>
    <!-- Bulbo terminal central -->
    <circle cx="726" cy="170" r="16" fill="url(#ng-terminal)" opacity="0.88" class="terminal-bulb"/>
    <circle cx="726" cy="170" r="7"  fill="rgba(167,139,250,0.45)"/>
    <!-- Bulbo terminal superior -->
    <circle cx="742" cy="100" r="13" fill="url(#ng-terminal)" opacity="0.82" class="terminal-bulb"/>
    <circle cx="742" cy="100" r="6"  fill="rgba(167,139,250,0.4)"/>
    <!-- Bulbo terminal inferior -->
    <circle cx="742" cy="240" r="13" fill="url(#ng-terminal)" opacity="0.82" class="terminal-bulb"/>
    <circle cx="742" cy="240" r="6"  fill="rgba(167,139,250,0.4)"/>
    <!-- Ramas extra -->
    <path d="M 736,106 C 748,96 760,88 774,84" stroke="#a78bfa" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.65"/>
    <circle cx="780" cy="82" r="10" fill="url(#ng-terminal)" opacity="0.72" class="terminal-bulb"/>
    <path d="M 736,234 C 748,244 760,252 774,256" stroke="#a78bfa" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.65"/>
    <circle cx="780" cy="258" r="10" fill="url(#ng-terminal)" opacity="0.72" class="terminal-bulb"/>
  </g>

  <!-- ═══════════ PARTÍCULAS DE IMPULSO (animadas por JS) ═══════════ -->
  <g id="impulse-layer">
    <!-- Partícula del impulso -->
    <circle id="impulse-particle" cx="-100" cy="170" r="9" fill="#fff" filter="url(#nf-impulse)" opacity="0"/>
    <circle id="impulse-core"     cx="-100" cy="170" r="4" fill="#4f8ef7" opacity="0"/>
    <!-- Estela del impulso -->
    <path id="impulse-trail" d="" stroke="rgba(255,255,255,0.28)" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
  </g>

  <!-- ═══════════ VESÍCULAS SINÁPTICAS (animadas) ═══════════ -->
  <g id="vesicles-layer" opacity="0">
    <circle id="ves1" cx="726" cy="155" r="4.5" fill="#c4b5fd"/>
    <circle id="ves2" cx="742" cy="88"  r="3.5" fill="#c4b5fd"/>
    <circle id="ves3" cx="742" cy="253" r="3.5" fill="#c4b5fd"/>
    <circle id="ves4" cx="780" cy="70"  r="3"   fill="#c4b5fd"/>
    <circle id="ves5" cx="780" cy="270" r="3"   fill="#c4b5fd"/>
  </g>

  <!-- ═══════════ ETIQUETAS FIJAS ═══════════ -->
  <g id="labels-layer" pointer-events="none">
    <!-- Dendritas -->
    <text x="54"  y="32"  class="nlabel" fill="#38bdf8">Dendritas</text>
    <line x1="80"  y1="38"  x2="80"  y2="74"  class="nlabel-line" stroke="#38bdf8"/>
    <!-- Soma -->
    <text x="222" y="230" class="nlabel" fill="#7ec8f7">Soma</text>
    <line x1="242" y1="224" x2="242" y2="217" class="nlabel-line" stroke="#7ec8f7"/>
    <!-- Axón -->
    <text x="486" y="136" class="nlabel" fill="#34d399">Axón</text>
    <line x1="500" y1="140" x2="500" y2="157" class="nlabel-line" stroke="#34d399"/>
    <!-- Mielina -->
    <text x="352" y="136" class="nlabel" fill="#fbbf24">Vaina de mielina</text>
    <line x1="395" y1="140" x2="395" y2="157" class="nlabel-line" stroke="#fbbf24"/>
    <!-- Nódulo -->
    <text x="382" y="205" class="nlabel-sm" fill="#cbd5e1">Nódulo de Ranvier</text>
    <line x1="398" y1="200" x2="398" y2="176" class="nlabel-line" stroke="#94a3b8"/>
    <!-- Terminales -->
    <text x="696" y="80"  class="nlabel" fill="#a78bfa">Botones sinápticos</text>
    <line x1="726" y1="84"  x2="726" y2="154" class="nlabel-line" stroke="#a78bfa"/>
    <!-- Cono axónico -->
    <text x="286" y="136" class="nlabel-sm" fill="#93c5fd">Cono axónico</text>
    <line x1="304" y1="140" x2="304" y2="162" class="nlabel-line" stroke="#93c5fd"/>
  </g>
</svg>`;
}

// ── ANIMACIÓN DEL IMPULSO ───────────────────────

const IMPULSE_PATH = [
  // Fase 0 — Dendritas: partícula entra desde espinas
  { x: 40, y: 80,  phase: 0 },
  { x: 90, y: 100, phase: 0 },
  { x: 140, y: 140, phase: 0 },
  { x: 180, y: 160, phase: 0 },
  // Fase 1 — Soma
  { x: 210, y: 168, phase: 1 },
  { x: 245, y: 170, phase: 1 },
  // Fase 2 — Cono + Axón (saltos en nódulos)
  { x: 305, y: 170, phase: 2 },
  { x: 360, y: 170, phase: 2 }, // dentro seg 1
  { x: 398, y: 170, phase: 2 }, // nódulo 1
  { x: 436, y: 170, phase: 2 }, // seg 2
  { x: 473, y: 170, phase: 2 }, // nódulo 2
  { x: 511, y: 170, phase: 2 }, // seg 3
  { x: 548, y: 170, phase: 2 }, // nódulo 3
  { x: 586, y: 170, phase: 2 }, // seg 4
  { x: 623, y: 170, phase: 2 }, // nódulo 4
  { x: 660, y: 170, phase: 2 }, // seg 5
  // Fase 3 — Terminales
  { x: 690, y: 170, phase: 3 },
  { x: 726, y: 170, phase: 3 }, // bulbo central
];

let impulseFrameId = null;
let currentPointIndex = 0;
let trailPoints = [];

// ── REFERENCIA AL STEP ACTUAL (permite pausa/reanudación limpia) ──
let _impulseStepFn = null;   // referencia viva a updateImpulseStep

function startImpulse() {
  if (NeuronState.impulseRunning) return;
  NeuronState.impulseRunning = true;
  NeuronState.impulsePaused  = false;
  currentPointIndex = 0;
  trailPoints = [];

  const particle = document.getElementById('impulse-particle');
  const core     = document.getElementById('impulse-core');
  const trail    = document.getElementById('impulse-trail');
  const vesicles = document.getElementById('vesicles-layer');

  particle.setAttribute('opacity', '0.95');
  core.setAttribute('opacity', '1');
  trail.setAttribute('opacity', '1');
  vesicles.setAttribute('opacity', '0');

  function updateImpulseStep() {
    // Guarda referencia global para que resumeImpulse pueda llamarla
    _impulseStepFn = updateImpulseStep;

    if (NeuronState.impulsePaused) return; // parado — reanudar lo llamará
    if (!NeuronState.impulseRunning)  return;
    if (currentPointIndex >= IMPULSE_PATH.length) { finishImpulse(); return; }

    const pt    = IMPULSE_PATH[currentPointIndex];
    const phase = pt.phase;
    const phaseColors = ['#38bdf8', '#7ec8f7', '#34d399', '#a78bfa'];
    const col = phaseColors[phase];

    particle.setAttribute('cx', pt.x); particle.setAttribute('cy', pt.y);
    particle.setAttribute('fill', '#fff');
    core.setAttribute('cx', pt.x); core.setAttribute('cy', pt.y);
    core.setAttribute('fill', col);

    trailPoints.push({ x: pt.x, y: pt.y });
    if (trailPoints.length > 6) trailPoints.shift();
    if (trailPoints.length >= 2) {
      const d = trailPoints.map((p, i) => i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`).join(' ');
      trail.setAttribute('d', d); trail.setAttribute('stroke', col);
    }

    const phasePartMap = ['dendrites', 'soma', 'myelin', 'terminals'];
    highlightPart(phasePartMap[phase], col);
    updateImpulsePhaseUI(phase);
    if ([8, 10, 12, 14].includes(currentPointIndex)) flashNode(currentPointIndex);

    currentPointIndex++;
    NeuronState.impulseTimer = setTimeout(updateImpulseStep,
      Math.round(120 / NeuronState.speedMultiplier));
  }

  _impulseStepFn = updateImpulseStep;
  updateImpulseStep();
}

function flashNode(idx) {
  const nodeMap = { 8: 0, 10: 1, 12: 2, 14: 3 };
  const nodeIndex = nodeMap[idx];
  const nodes = document.querySelectorAll('.ranvier-node');
  if (nodes[nodeIndex]) {
    nodes[nodeIndex].setAttribute('fill', '#fff');
    nodes[nodeIndex].setAttribute('opacity', '1');
    setTimeout(() => {
      nodes[nodeIndex].setAttribute('fill', '#e2e8f0');
      nodes[nodeIndex].setAttribute('opacity', '0.7');
    }, 180);
  }
}

function finishImpulse() {
  animateVesicles();

  setTimeout(() => {
    const particle = document.getElementById('impulse-particle');
    const core     = document.getElementById('impulse-core');
    const trail    = document.getElementById('impulse-trail');

    if (particle) particle.setAttribute('opacity', '0');
    if (core)     core.setAttribute('opacity', '0');
    if (trail)    trail.setAttribute('opacity', '0');
    clearHighlights();
    clearImpulsePhaseUI();
    NeuronState.impulseRunning = false;
    NeuronState.impulsePaused  = false;
    _impulseStepFn = null;

    const playBtn  = document.getElementById('btn-play-impulse');
    const pauseBtn = document.getElementById('btn-pause-impulse');
    if (playBtn)  { playBtn.textContent = '↺ Repetir'; playBtn.disabled = false; }
    if (pauseBtn) { pauseBtn.disabled = true; pauseBtn.textContent = '⏸ Pausar'; pauseBtn.classList.remove('paused'); }
  }, 800);
}

function animateVesicles() {
  const vesicles = document.getElementById('vesicles-layer');
  vesicles.setAttribute('opacity', '1');

  // Animar posición de cada vesícula
  const vesData = [
    { id: 'ves1', startY: 155, endY: 142 },
    { id: 'ves2', startY: 88,  endY: 76  },
    { id: 'ves3', startY: 253, endY: 265 },
    { id: 'ves4', startY: 70,  endY: 58  },
    { id: 'ves5', startY: 270, endY: 282 },
  ];

  let t = 0;
  const duration = 500 / NeuronState.speedMultiplier;

  function animStep() {
    t += 16 / duration;
    if (t > 1) t = 1;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    vesData.forEach(v => {
      const el = document.getElementById(v.id);
      if (el) {
        const y = v.startY + (v.endY - v.startY) * ease;
        el.setAttribute('cy', y);
        el.setAttribute('opacity', (1 - ease).toFixed(2));
      }
    });

    if (t < 1) requestAnimationFrame(animStep);
    else setTimeout(() => {
      vesicles.setAttribute('opacity', '0');
      // Resetear posición
      vesData.forEach(v => {
        const el = document.getElementById(v.id);
        if (el) {
          el.setAttribute('cy', v.startY);
          el.setAttribute('opacity', '1');
        }
      });
    }, 100);
  }
  requestAnimationFrame(animStep);
}

function stopImpulse() {
  if (NeuronState.impulseTimer) clearTimeout(NeuronState.impulseTimer);
  NeuronState.impulseRunning = false;
  currentPointIndex = 0;
  trailPoints = [];

  const particle = document.getElementById('impulse-particle');
  const core     = document.getElementById('impulse-core');
  const trail    = document.getElementById('impulse-trail');

  if (particle) particle.setAttribute('opacity', '0');
  if (core)     core.setAttribute('opacity', '0');
  if (trail)    trail.setAttribute('opacity', '0');
  clearHighlights();
  clearImpulsePhaseUI();
}

// ── HIGHLIGHTS DE PARTES ─────────────────────────

function highlightPart(partId, color) {
  // Quitar highlights anteriores
  document.querySelectorAll('.neuron-part').forEach(el => {
    el.classList.remove('part-highlighted');
    el.style.filter = '';
  });

  const partEl = document.getElementById(`part-${partId}`);
  if (partEl) {
    partEl.classList.add('part-highlighted');
    partEl.style.filter = `drop-shadow(0 0 12px ${color})`;
  }
}

function clearHighlights() {
  document.querySelectorAll('.neuron-part').forEach(el => {
    el.classList.remove('part-highlighted', 'part-dim');
    el.style.filter = '';
  });
}

// ── UI DE FASE DEL IMPULSO ───────────────────────

let lastPhaseShown = -1;

function updateImpulsePhaseUI(phase) {
  if (phase === lastPhaseShown) return;
  lastPhaseShown = phase;

  const stage = IMPULSE_STAGES[phase];
  const el = document.getElementById('impulse-phase-info');
  if (!el || !stage) return;

  el.style.opacity = '0';
  el.style.transform = 'translateY(6px)';

  setTimeout(() => {
    el.innerHTML = `
      <div class="phase-badge" style="background:${stage.color}22;border-color:${stage.color}44;color:${stage.color}">
        Fase ${phase + 1}: ${stage.label}
      </div>
      <p class="phase-desc">${stage.desc}</p>
    `;
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 80);
}

function clearImpulsePhaseUI() {
  lastPhaseShown = -1;
  const el = document.getElementById('impulse-phase-info');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
  }
}

// ── SELECCIÓN DE PARTES ──────────────────────────

function selectPart(partId) {
  NeuronState.activePart = partId;
  NeuronState.factIndex  = 0;

  const part = NEURON_PARTS.find(p => p.id === partId);
  if (!part) return;

  // Highlights
  document.querySelectorAll('.neuron-part').forEach(el => {
    const eid = el.getAttribute('data-part');
    el.classList.remove('part-highlighted', 'part-dim');
    if (eid === partId) {
      el.classList.add('part-highlighted');
      el.style.filter = `drop-shadow(0 0 14px ${part.color})`;
    } else {
      el.classList.add('part-dim');
      el.style.filter = 'saturate(0.25) brightness(0.55)';
    }
  });

  renderPartPanel(part);
  updatePartLegend(partId);
}

function deselectPart() {
  NeuronState.activePart = null;
  clearHighlights();
  updatePartLegend(null);

  const panel = document.getElementById('part-panel');
  const empty = document.getElementById('part-empty');
  if (panel) panel.classList.add('hidden');
  if (empty) empty.style.display = '';
}

// ── PANEL DE INFORMACIÓN ─────────────────────────

// Imágenes reales por parte de la neurona
const PART_REAL_IMAGES = {
  myelin:     { src: 'assets/neuron/myelin-cross-section.webp', caption: 'Corte transversal de axón mielinizado — microscopía electrónica · Wikimedia' },
  terminals:  { src: 'assets/neuron/synapse-electron.webp',     caption: 'Sinapsis — microscopía electrónica de transmisión · Wikimedia Commons' },
  dendrites:  { src: 'assets/neuron/neuron-real.webp',          caption: 'Red dendrítica — microscopía de fluorescencia · Wikimedia Commons' },
  soma:       { src: 'assets/neuron/neuron-real.webp',          caption: 'Cuerpo celular neuronal — microscopía óptica · Wikimedia Commons' },
};

function renderPartPanel(part) {
  const panel   = document.getElementById('part-panel');
  const empty   = document.getElementById('part-empty');
  const content = document.getElementById('part-content');

  const facts = part.funFacts || [];

  content.innerHTML = `
    <div class="pp-header" style="--pc:${part.color}">
      <div class="pp-badge">
        <span>${part.emoji}</span>
        <span>${part.tagline}</span>
      </div>
      <h2 class="pp-title">${part.name}</h2>
      <div class="pp-bar" style="background:${part.color}"></div>
    </div>

    ${PART_REAL_IMAGES[part.id] ? `
    <div class="real-img-wrap part-real-img">
      <span class="real-img-badge">📷 Real</span>
      <img src="${PART_REAL_IMAGES[part.id].src}" alt="${part.name} imagen real" loading="lazy">
      <p class="real-img-caption">${PART_REAL_IMAGES[part.id].caption}</p>
    </div>` : ''}

    <div class="pp-tabs">
      <button class="pp-tab active" data-tab="func">📋 Función</button>
      <button class="pp-tab"        data-tab="kids">🧒 Niños</button>
      <button class="pp-tab"        data-tab="facts">✨ Datos</button>
    </div>

    <div class="pp-body" id="tab-func">
      <p class="pp-desc">${part.description}</p>
    </div>
    <div class="pp-body hidden" id="tab-kids">
      <div class="pp-kids">${part.childExplanation}</div>
    </div>
    <div class="pp-body hidden" id="tab-facts">
      ${renderFactsCarousel(facts, part.color)}
    </div>
  `;

  // Tabs
  content.querySelectorAll('.pp-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.pp-tab').forEach(b => b.classList.remove('active'));
      content.querySelectorAll('.pp-body').forEach(b => b.classList.add('hidden'));
      btn.classList.add('active');
      content.querySelector(`#tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });

  // Navegación de facts
  bindFactsNav(content, part);

  if (empty) empty.style.display = 'none';
  panel.classList.remove('hidden');
}

function renderFactsCarousel(facts, color) {
  const idx = NeuronState.factIndex;
  return `
    <div class="fc-header">
      <span class="fc-label">¿Sabías que?</span>
      <div class="fc-nav">
        <button class="fc-arrow" id="fc-prev" ${idx === 0 ? 'disabled' : ''}>‹</button>
        <span class="fc-counter">${idx + 1}/${facts.length}</span>
        <button class="fc-arrow" id="fc-next" ${idx === facts.length - 1 ? 'disabled' : ''}>›</button>
      </div>
    </div>
    <div class="fc-dots">
      ${facts.map((_, i) => `<button class="fc-dot${i === idx ? ' active' : ''}" data-i="${i}" style="${i === idx ? `background:${color}` : ''}"></button>`).join('')}
    </div>
    <div class="fc-slide">
      <span class="fc-icon">${facts[idx].icon}</span>
      <p class="fc-text">${facts[idx].text}</p>
    </div>
    <div style="margin-top:12px;text-align:center">
      <button class="fc-see-all" id="fc-see-all">Ver los ${facts.length} datos</button>
    </div>
    <div class="fc-all hidden" id="fc-all-list">
      ${facts.map((f, i) => `
        <div class="fc-item" style="border-left-color:${color}">
          <span class="fc-item-icon">${f.icon}</span>
          <p class="fc-item-text">${f.text}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function bindFactsNav(content, part) {
  const facts = part.funFacts || [];

  content.querySelector('#fc-prev')?.addEventListener('click', () => {
    if (NeuronState.factIndex > 0) { NeuronState.factIndex--; renderPartPanel(part); }
  });
  content.querySelector('#fc-next')?.addEventListener('click', () => {
    if (NeuronState.factIndex < facts.length - 1) { NeuronState.factIndex++; renderPartPanel(part); }
  });
  content.querySelectorAll('.fc-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      NeuronState.factIndex = parseInt(dot.dataset.i);
      renderPartPanel(part);
    });
  });
  content.querySelector('#fc-see-all')?.addEventListener('click', () => {
    const list = content.querySelector('#fc-all-list');
    const btn  = content.querySelector('#fc-see-all');
    const hidden = list.classList.toggle('hidden');
    btn.textContent = hidden ? `Ver los ${facts.length} datos` : 'Ocultar';
  });
}

// ── LEYENDA DE PARTES ────────────────────────────

function buildPartLegend() {
  const legend = document.getElementById('part-legend');
  legend.innerHTML = '';

  NEURON_PARTS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pl-item';
    btn.setAttribute('data-part-id', p.id);
    btn.innerHTML = `
      <span class="pl-dot" style="background:${p.color}"></span>
      <span>${p.name}</span>
    `;
    btn.addEventListener('click', () => selectPart(p.id));
    legend.appendChild(btn);
  });
}

function updatePartLegend(activeId) {
  document.querySelectorAll('.pl-item').forEach(item => {
    item.classList.toggle('pl-active', item.getAttribute('data-part-id') === activeId);
  });
}

// ── CONTROLES ────────────────────────────────────

function initControls() {
  const playBtn  = document.getElementById('btn-play-impulse');
  const pauseBtn = document.getElementById('btn-pause-impulse');

  function syncBtns() {
    const running = NeuronState.impulseRunning;
    const paused  = NeuronState.impulsePaused;
    if (!running) {
      playBtn.textContent  = '▶ Disparar impulso nervioso';
      pauseBtn.disabled    = true;
      pauseBtn.textContent = '⏸ Pausar';
      pauseBtn.classList.remove('paused');
    } else if (paused) {
      playBtn.textContent  = '⏹ Detener';
      pauseBtn.textContent = '▶ Reanudar';
      pauseBtn.classList.add('paused');
      pauseBtn.disabled = false;
    } else {
      playBtn.textContent  = '⏹ Detener';
      pauseBtn.textContent = '⏸ Pausar';
      pauseBtn.classList.remove('paused');
      pauseBtn.disabled = false;
    }
  }

  // Play / Stop
  playBtn.addEventListener('click', () => {
    if (NeuronState.impulseRunning) {
      stopImpulse();
    } else {
      startImpulse();
    }
    syncBtns();
  });

  // Pausa / Reanudar
  pauseBtn.addEventListener('click', () => {
    if (!NeuronState.impulseRunning) return;
    if (!NeuronState.impulsePaused) {
      // → Pausar
      NeuronState.impulsePaused = true;
      if (NeuronState.impulseTimer) clearTimeout(NeuronState.impulseTimer);
    } else {
      // → Reanudar
      resumeImpulse();
    }
    syncBtns();
  });

  // Velocidad
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      NeuronState.speedMultiplier = parseFloat(btn.dataset.speed);
    });
  });
}

// ── INTERACCIONES CON EL SVG ──────────────────────

function initSVGInteractions() {
  document.querySelectorAll('.neuron-part[data-part]').forEach(el => {
    const partId = el.getAttribute('data-part');

    el.addEventListener('click', e => {
      e.stopPropagation();
      if (NeuronState.activePart === partId) deselectPart();
      else selectPart(partId);
    });

    // Tooltip en hover
    el.addEventListener('mouseenter', e => {
      const part = NEURON_PARTS.find(p => p.id === partId);
      if (!part) return;
      const tooltip = document.getElementById('neuron-tooltip');
      if (tooltip) {
        tooltip.textContent = part.name;
        tooltip.classList.add('visible');
      }
      if (!NeuronState.activePart) {
        el.style.filter = `drop-shadow(0 0 10px ${part.color}) brightness(1.08)`;
      }
    });

    el.addEventListener('mousemove', e => {
      const tooltip = document.getElementById('neuron-tooltip');
      if (!tooltip) return;
      const rect = document.getElementById('neuron-svg-container').getBoundingClientRect();
      tooltip.style.left = `${e.clientX - rect.left + 12}px`;
      tooltip.style.top  = `${e.clientY - rect.top  - 32}px`;
    });

    el.addEventListener('mouseleave', () => {
      const tooltip = document.getElementById('neuron-tooltip');
      if (tooltip) tooltip.classList.remove('visible');
      if (!NeuronState.activePart) {
        el.style.filter = '';
      } else if (NeuronState.activePart !== partId) {
        el.style.filter = 'saturate(0.25) brightness(0.55)';
      }
    });
  });

  // Click fuera → deseleccionar
  document.addEventListener('click', e => {
    if (!NeuronState.activePart) return;
    if (!e.target.closest('#neuron-svg-container') &&
        !e.target.closest('#part-panel') &&
        !e.target.closest('.pl-item')) {
      deselectPart();
    }
  });
}

// ── ESTRELLAS ────────────────────────────────────

function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const stars = Array.from({ length: 110 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    a: Math.random() * 0.55 + 0.07,
    da: (Math.random() - 0.5) * 0.0024,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 0.62) s.da = -Math.abs(s.da);
      if (s.a < 0.04) s.da =  Math.abs(s.da);
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── INICIALIZACIÓN ───────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  buildNeuronSVG();
  buildPartLegend();
  initSVGInteractions();
  initControls();

  // Teclado Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { deselectPart(); stopImpulse(); }
  });
});

// ── TIPOS DE NEURONAS ─────────────────────────────────────────

function buildNeuronTypes() {
  const section = document.getElementById('neuron-types');
  if (!section) return;

  section.innerHTML = `
    <div class="nt-header">
      <h2 class="nt-title">Tipos de Neuronas</h2>
      <p class="nt-subtitle">
        No todas las neuronas son iguales. Existen diferentes tipos según su estructura, su función y sus características especiales.
      </p>
    </div>
    <div class="nt-tabs">
      <button class="nt-tab active" data-nt="structural">Clasificación estructural</button>
      <button class="nt-tab" data-nt="functional">Clasificación funcional</button>
      <button class="nt-tab" data-nt="specialized">Neuronas especializadas</button>
    </div>
    <div id="nt-structural" class="nt-category visible">
      ${renderNTGrid(NEURON_TYPES.structural, 'structural')}
    </div>
    <div id="nt-functional" class="nt-category">
      ${renderNTGrid(NEURON_TYPES.functional, 'functional')}
    </div>
    <div id="nt-specialized" class="nt-category">
      ${renderNTGrid(NEURON_TYPES.specialized, 'specialized')}
    </div>

    <!-- Galería de imágenes reales de neuronas -->
    <div class="nt-real-gallery">
      <p class="nt-gallery-label">📷 Neuronas reales al microscopio</p>
      <div class="nt-gallery-grid">
        <div class="real-img-wrap">
          <span class="real-img-badge">🌳 Purkinje</span>
          <img src="assets/neuron/purkinje-cell.webp" alt="Célula de Purkinje al microscopio" loading="lazy">
          <p class="real-img-caption">Célula de Purkinje del cerebelo — árbol dendrítico extraordinario · Wikimedia Commons</p>
        </div>
        <div class="real-img-wrap">
          <span class="real-img-badge">🔬 Tipos</span>
          <img src="assets/neuron/neuron-types-diagram.jpg" alt="Tipos de neuronas diagrama" loading="lazy">
          <p class="real-img-caption">Comparativa de tipos estructurales de neuronas · Wikimedia Commons</p>
        </div>
        <div class="real-img-wrap">
          <span class="real-img-badge">🛡️ Mielina</span>
          <img src="assets/neuron/myelin-cross-section.webp" alt="Corte transversal de mielina" loading="lazy">
          <p class="real-img-caption">Corte transversal de axón mielinizado — microscopía electrónica · Wikimedia</p>
        </div>
      </div>
    </div>
  `;

  section.querySelectorAll('.nt-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.nt-tab').forEach(b => b.classList.remove('active'));
      section.querySelectorAll('.nt-category').forEach(c => c.classList.remove('visible'));
      btn.classList.add('active');
      section.querySelector(`#nt-${btn.dataset.nt}`).classList.add('visible');
    });
  });
}

function renderNTGrid(types, category) {
  return `<div class="nt-grid">${types.map(t => `
    <div class="nt-card">
      ${getNeuronTypeAnim(t.id, t.badgeColor)}
      <div class="nt-card-head">
        <span class="nt-emoji">${t.emoji}</span>
        <div class="nt-card-meta">
          <h3 class="nt-card-name">${t.name}</h3>
          <span class="nt-card-badge" style="background:${t.badgeColor}18;border-color:${t.badgeColor}40;color:${t.badgeColor}">${t.badge}</span>
        </div>
      </div>
      <p class="nt-card-desc">${t.description}</p>
      ${t.where   ? `<p class="nt-card-where"><strong>Dónde:</strong> ${t.where}</p>` : ''}
      ${t.example ? `<p class="nt-card-example"><strong>Ejemplo:</strong> ${t.example}</p>` : ''}
      ${t.funFact ? `<div class="nt-card-fact">${t.funFact}</div>` : ''}
    </div>
  `).join('')}</div>`;
}

function getNeuronTypeAnim(id, color) {
  const c = color || '#4f8ef7';
  const svgs = {
    multipolar: `<svg class="nt-anim nt-anim-multipolar" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <circle class="nt-soma-dot" cx="50" cy="26" r="9" fill="${c}" opacity="0.85"/>
      <circle cx="50" cy="26" r="4" fill="rgba(255,255,255,0.4)"/>
      ${[0,60,120,180,240,300].map((deg,i) => {
        const rad = deg * Math.PI / 180;
        const x2 = 50 + Math.cos(rad)*28, y2 = 26 + Math.sin(rad)*20;
        return `<line class="nt-branch" x1="50" y1="26" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="3" fill="${c}" opacity="0.7"/>`;
      }).join('')}
    </svg>`,

    bipolar: `<svg class="nt-anim nt-anim-bipolar" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="26" x2="92" y2="26" stroke="${c}" stroke-width="2" stroke-opacity="0.3"/>
      <circle class="nt-body" cx="50" cy="26" r="9" fill="${c}" opacity="0.7"/>
      <circle cx="50" cy="26" r="4" fill="rgba(255,255,255,0.35)"/>
      <circle cx="8" cy="26" r="5" fill="${c}" opacity="0.5"/>
      <circle cx="92" cy="26" r="5" fill="${c}" opacity="0.5"/>
      <circle class="nt-signal" cx="8" cy="26" r="4" fill="#fff" opacity="0.9">
        <animateMotion dur="2s" repeatCount="indefinite" path="M 0,0 L 84,0"/>
      </circle>
    </svg>`,

    pseudounipolar: `<svg class="nt-anim nt-anim-pseudo" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="26" r="9" fill="${c}" opacity="0.75"/>
      <circle cx="50" cy="26" r="4" fill="rgba(255,255,255,0.35)"/>
      <line x1="50" y1="26" x2="50" y2="5" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="5" x2="18" y2="5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line x1="50" y1="5" x2="82" y2="5" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="5" r="4" fill="${c}" opacity="0.65"/>
      <circle cx="82" cy="5" r="4" fill="${c}" opacity="0.65"/>
      <line x1="50" y1="26" x2="50" y2="47" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <circle cx="50" cy="47" r="3.5" fill="${c}" opacity="0.4"/>
      <circle cx="50" cy="26" r="16" fill="none" stroke="${c}" stroke-width="1.5" class="nt-wave">
        <animate attributeName="r" values="9;20;9" dur="1.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.6s" repeatCount="indefinite"/>
      </circle>
    </svg>`,

    sensory: `<svg class="nt-anim nt-anim-sensory" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <line x1="15" y1="26" x2="72" y2="26" stroke="${c}" stroke-width="2" stroke-opacity="0.4"/>
      <circle cx="72" cy="26" r="9" fill="${c}" opacity="0.78"/>
      <circle cx="72" cy="26" r="4" fill="rgba(255,255,255,0.35)"/>
      <line x1="72" y1="26" x2="96" y2="26" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="15" cy="26" r="5" fill="${c}" opacity="0.5"/>
      ${[0,1,2].map(i=>`<circle cx="15" cy="26" r="${14+i*10}" fill="none" stroke="${c}" stroke-width="1.2" class="nt-wave${i+1}">
        <animate attributeName="r" values="${8+i*8};${20+i*10}" dur="1.4s" begin="${i*0.3}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0" dur="1.4s" begin="${i*0.3}s" repeatCount="indefinite"/>
      </circle>`).join('')}
    </svg>`,

    motor: `<svg class="nt-anim nt-anim-motor" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="10" r="9" fill="${c}" opacity="0.82"/>
      <circle cx="50" cy="10" r="4" fill="rgba(255,255,255,0.35)"/>
      <line x1="50" y1="19" x2="50" y2="42" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line x1="50" y1="42" x2="32" y2="50" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-opacity="0.6"/>
      <line x1="50" y1="42" x2="68" y2="50" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-opacity="0.6"/>
      <polygon class="nt-bolt" points="50,19 46,30 49,30 45,42 54,28 51,28" fill="${c}" opacity="0.85"/>
    </svg>`,

    interneurons: `<svg class="nt-anim nt-anim-inter" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="26" r="7" fill="${c}" opacity="0.65"/>
      <circle cx="82" cy="26" r="7" fill="#4f8ef7" opacity="0.65"/>
      <line x1="25" y1="26" x2="75" y2="26" stroke="rgba(167,139,250,0.4)" stroke-width="2" stroke-dasharray="4 3"/>
      <line x1="18" y1="26" x2="28" y2="14" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <line x1="18" y1="26" x2="28" y2="38" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <line x1="82" y1="26" x2="72" y2="14" stroke="#4f8ef7" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <line x1="82" y1="26" x2="72" y2="38" stroke="#4f8ef7" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <circle class="nt-ball" cx="18" cy="26" r="5" fill="${c}">
        <animateMotion dur="1.4s" repeatCount="indefinite" keyTimes="0;0.5;1" keySplines=".4 0 .2 1;.4 0 .2 1"
          calcMode="spline" path="M 0,0 L 64,0 L 0,0"/>
      </circle>
    </svg>`,

    purkinje: `<svg class="nt-anim nt-anim-purkinje" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <line class="nt-trunk" x1="50" y1="48" x2="50" y2="34" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line class="nt-brnch" x1="50" y1="34" x2="30" y2="22" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line class="nt-brnch" x1="50" y1="34" x2="70" y2="22" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line class="nt-brnch2" x1="30" y1="22" x2="18" y2="10" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
      <line class="nt-brnch2" x1="30" y1="22" x2="36" y2="8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
      <line class="nt-brnch2" x1="70" y1="22" x2="64" y2="8" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
      <line class="nt-brnch2" x1="70" y1="22" x2="82" y2="10" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
      ${[18,36,64,82].map(x=>`<circle class="nt-leaf" cx="${x}" cy="${x<50?10:10}" r="3" fill="${c}" opacity="0.8"/>`).join('')}
      <circle cx="50" cy="48" r="5" fill="${c}" opacity="0.7"/>
    </svg>`,

    pyramidal: `<svg class="nt-anim nt-anim-pyramidal" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,4 38,28 62,28" fill="none" stroke="${c}" stroke-width="2" stroke-opacity="0.7"/>
      <line x1="50" y1="28" x2="50" y2="48" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="48" x2="36" y2="52" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <line x1="50" y1="48" x2="64" y2="52" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.5"/>
      <line x1="50" y1="4" x2="50" y2="0" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
      <polygon class="nt-signal-up" points="50,4 44,18 56,18" fill="${c}" opacity="0.8"/>
    </svg>`,

    mirror: `<svg class="nt-anim nt-anim-mirror" viewBox="0 0 100 52" xmlns="http://www.w3.org/2000/svg">
      <line x1="50" y1="4" x2="50" y2="48" stroke="rgba(200,220,255,0.2)" stroke-width="1" stroke-dasharray="3 3"/>
      <circle class="nt-left" cx="22" cy="26" r="8" fill="${c}" opacity="0.7"/>
      <line class="nt-left" x1="22" y1="26" x2="46" y2="26" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line class="nt-left" x1="14" y1="16" x2="22" y2="26" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
      <line class="nt-left" x1="14" y1="36" x2="22" y2="26" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
      <circle class="nt-right" cx="78" cy="26" r="8" fill="${c}" opacity="0.7"/>
      <line class="nt-right" x1="54" y1="26" x2="78" y2="26" stroke="${c}" stroke-width="2" stroke-linecap="round"/>
      <line class="nt-right" x1="86" y1="16" x2="78" y2="26" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
      <line class="nt-right" x1="86" y1="36" x2="78" y2="26" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
    </svg>`,
  };
  return svgs[id] || '';
}

// Sobrescribir DOMContentLoaded para incluir buildNeuronTypes
const _origLoad = document.addEventListener.bind(document);
document.addEventListener('DOMContentLoaded', () => {
  buildNeuronTypes();
}, { once: true });

// ── SCROLL INDICATOR ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('scroll-indicator');
  if (!el) return;
  function check() { el.classList.toggle('hidden', window.scrollY > 80); }
  window.addEventListener('scroll', check, { passive: true });
  setTimeout(check, 1200);
  el.addEventListener('click', () => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' }));
}, { once: true });

// ── REANUDAR IMPULSO ────────────────────────────────────────────
function resumeImpulse() {
  if (!NeuronState.impulseRunning) return;
  NeuronState.impulsePaused = false;
  if (_impulseStepFn) _impulseStepFn(); // retoma exactamente donde se pausó
}
