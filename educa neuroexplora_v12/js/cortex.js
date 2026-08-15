/**
 * NeuroExplora — cortex.js  v1.0
 * Motor de animación cortical:
 * - SVG del cerebro con regiones animadas
 * - Animación secuencial por escenario
 * - Modo Rizoma: activación distribuida no-lineal
 * - Panel de información por fase
 */

// ── ESTADO ──────────────────────────────────────
const CortexState = {
  activeScenario: null,
  isPlaying: false,
  isPaused: false,
  currentStep: 0,
  stepTimer: null,
  speed: 1,
  activeRegions: new Set(),
  connectionLines: [],
};

// ── BUILD SVG ────────────────────────────────────
function buildCortexSVG() {
  const container = document.getElementById('cortex-svg-container');

  container.innerHTML = `
<svg id="cortex-svg" viewBox="0 0 560 390"
     xmlns="http://www.w3.org/2000/svg"
     role="img" aria-label="Corteza cerebral interactiva">
  <defs>
    <!-- Filtros de glow por intensidad -->
    <filter id="cf-glow-low"  x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4"  result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cf-glow-med"  x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="8"  result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cf-glow-high" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cf-glow-rhizome" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="18" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Gradiente base del cerebro -->
    <radialGradient id="cg-brain" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#152640"/>
      <stop offset="100%" stop-color="#0a1525"/>
    </radialGradient>
  </defs>

  <!-- ═══ SILUETA DEL CEREBRO (fondo) ═══ -->
  <g id="brain-silhouette">
    <!-- Hemisferio principal -->
    <path d="M 62,215 C 52,188 50,155 58,126 C 66,97 84,72 108,54
             C 132,36 162,24 196,18 C 230,12 266,14 298,24
             C 330,34 360,52 382,76 C 404,100 414,130 414,160
             C 414,190 404,218 386,238 C 368,258 344,270 318,276
             L 290,280 C 262,282 236,278 212,268 C 188,258 166,240 150,218 Z"
          fill="url(#cg-brain)" stroke="rgba(100,150,255,0.15)" stroke-width="1.5"/>
    <!-- Cerebelo -->
    <path d="M 318,276 C 338,268 364,266 390,276 C 416,286 432,308 430,330
             C 428,352 410,366 388,368 C 366,370 344,360 330,344
             C 316,328 314,306 318,290 Z"
          fill="url(#cg-brain)" stroke="rgba(100,150,255,0.12)" stroke-width="1.5"/>
    <!-- Tronco -->
    <path d="M 278,282 C 288,278 300,278 308,284 C 312,292 312,310 308,324
             C 304,336 294,342 284,338 C 274,334 272,316 272,302
             C 272,292 274,284 278,282 Z"
          fill="url(#cg-brain)" stroke="rgba(100,150,255,0.12)" stroke-width="1.5"/>
    <!-- Surcos decorativos -->
    <path d="M 198,20 C 196,54 194,92 194,128 C 194,158 196,182 198,202"
          stroke="rgba(100,150,255,0.08)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M 256,16 C 254,52 252,90 252,126 C 252,156 254,180 256,200"
          stroke="rgba(100,150,255,0.08)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M 312,22 C 310,56 308,92 308,128 C 308,158 310,182 312,200"
          stroke="rgba(100,150,255,0.08)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M 366,44 C 364,76 362,110 362,144 C 362,172 364,196 366,214"
          stroke="rgba(100,150,255,0.06)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <!-- Cisura de Silvio -->
    <path d="M 72,206 C 110,198 158,196 206,198 C 238,200 262,206 282,216"
          stroke="rgba(100,150,255,0.12)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </g>

  <!-- ═══ CAPA DE CONEXIONES (dibujadas por JS) ═══ -->
  <g id="connections-layer"></g>

  <!-- ═══ REGIONES INTERACTIVAS ═══ -->
  <g id="regions-layer">
    ${CORTEX_REGIONS.map(r => `
      <g class="cortex-region" id="cr-${r.id}" data-region="${r.id}"
         style="cursor:pointer" role="button" tabindex="0">
        <!-- Halo de activación (animado) -->
        <circle class="cr-halo" cx="${r.cx}" cy="${r.cy}" r="${r.r * 1.5}"
                fill="none" stroke="${r.color}" stroke-width="2" opacity="0"/>
        <!-- Región base -->
        <circle class="cr-base" cx="${r.cx}" cy="${r.cy}" r="${r.r}"
                fill="${r.color}" fill-opacity="0.12"
                stroke="${r.color}" stroke-width="1.2" stroke-opacity="0.35"/>
        <!-- Núcleo activo -->
        <circle class="cr-core" cx="${r.cx}" cy="${r.cy}" r="${r.r * 0.55}"
                fill="${r.color}" opacity="0.18"/>
        <!-- Partícula central -->
        <circle class="cr-dot" cx="${r.cx}" cy="${r.cy}" r="3"
                fill="${r.color}" opacity="0.5"/>
        <!-- Etiqueta -->
        <text class="cr-label" x="${r.cx}" y="${r.cy + r.r + 12}"
              text-anchor="middle" fill="${r.color}"
              font-size="9" font-weight="600" opacity="0.7"
              font-family="'Outfit',sans-serif">${r.name}</text>
      </g>
    `).join('')}
  </g>

  <!-- ═══ PARTÍCULAS FLOTANTES (rizoma) ═══ -->
  <g id="particles-layer"></g>

</svg>`;

  // Eventos hover
  CORTEX_REGIONS.forEach(r => {
    const el = document.getElementById(`cr-${r.id}`);
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      if (!CortexState.isPlaying) hoverRegion(r.id, true);
      showTooltip(r);
    });
    el.addEventListener('mouseleave', () => {
      if (!CortexState.isPlaying) hoverRegion(r.id, false);
      hideTooltip();
    });
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (!CortexState.isPlaying) pulseRegion(r.id);
    });
  });
}

// ── ACTIVACIÓN DE REGIONES ───────────────────────

function activateRegion(regionId, intensity = 'med', color = null) {
  const el = document.getElementById(`cr-${regionId}`);
  if (!el) return;
  const r = CORTEX_REGIONS.find(x => x.id === regionId);
  const col = color || r?.color || '#4f8ef7';

  const base = el.querySelector('.cr-base');
  const core = el.querySelector('.cr-core');
  const dot  = el.querySelector('.cr-dot');
  const halo = el.querySelector('.cr-halo');

  base.setAttribute('fill-opacity', intensity === 'high' ? '0.55' : intensity === 'rhizome' ? '0.7' : '0.35');
  base.setAttribute('stroke-opacity', '0.8');
  base.setAttribute('stroke', col);
  core.setAttribute('opacity', intensity === 'high' ? '0.7' : intensity === 'rhizome' ? '0.85' : '0.45');
  dot.setAttribute('opacity', '1');
  dot.setAttribute('r', intensity === 'rhizome' ? '5' : '4');

  const filterMap = { low: 'cf-glow-low', med: 'cf-glow-med', high: 'cf-glow-high', rhizome: 'cf-glow-rhizome' };
  el.style.filter = `url(#${filterMap[intensity] || 'cf-glow-med'})`;

  // Animar halo
  halo.setAttribute('stroke', col);
  halo.setAttribute('opacity', '0.6');
  halo.style.animation = `haloExpand 1.2s ease-out infinite`;

  CortexState.activeRegions.add(regionId);
}

function deactivateRegion(regionId) {
  const el = document.getElementById(`cr-${regionId}`);
  if (!el) return;
  const r = CORTEX_REGIONS.find(x => x.id === regionId);

  const base = el.querySelector('.cr-base');
  const core = el.querySelector('.cr-core');
  const dot  = el.querySelector('.cr-dot');
  const halo = el.querySelector('.cr-halo');

  base.setAttribute('fill-opacity', '0.12');
  base.setAttribute('stroke-opacity', '0.35');
  if (r) base.setAttribute('stroke', r.color);
  core.setAttribute('opacity', '0.18');
  dot.setAttribute('opacity', '0.5');
  dot.setAttribute('r', '3');
  el.style.filter = '';
  halo.setAttribute('opacity', '0');
  halo.style.animation = '';

  CortexState.activeRegions.delete(regionId);
}

function deactivateAll() {
  CORTEX_REGIONS.forEach(r => deactivateRegion(r.id));
  clearConnections();
  clearParticles();
}

function hoverRegion(regionId, on) {
  const el = document.getElementById(`cr-${regionId}`);
  if (!el) return;
  const r = CORTEX_REGIONS.find(x => x.id === regionId);
  const base = el.querySelector('.cr-base');
  const core = el.querySelector('.cr-core');

  base.setAttribute('fill-opacity', on ? '0.28' : '0.12');
  core.setAttribute('opacity', on ? '0.35' : '0.18');
  el.style.filter = on ? 'url(#cf-glow-low)' : '';
}

function pulseRegion(regionId) {
  activateRegion(regionId, 'high');
  setTimeout(() => deactivateRegion(regionId), 1200);
}

// ── CONEXIONES ───────────────────────────────────

function drawConnections(pairs, color = '#ffffff', opacity = 0.25) {
  const layer = document.getElementById('connections-layer');
  clearConnections();

  pairs.forEach(([id1, id2]) => {
    const r1 = CORTEX_REGIONS.find(r => r.id === id1);
    const r2 = CORTEX_REGIONS.find(r => r.id === id2);
    if (!r1 || !r2) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', r1.cx); line.setAttribute('y1', r1.cy);
    line.setAttribute('x2', r2.cx); line.setAttribute('y2', r2.cy);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', opacity);
    line.setAttribute('stroke-dasharray', '4 3');
    line.style.animation = 'dashFlow 1.5s linear infinite';
    layer.appendChild(line);
    CortexState.connectionLines.push(line);
  });
}

function clearConnections() {
  const layer = document.getElementById('connections-layer');
  if (layer) layer.innerHTML = '';
  CortexState.connectionLines = [];
}

// ── PARTÍCULAS RIZOMA ────────────────────────────

function spawnRhizomeParticles(color) {
  const layer  = document.getElementById('particles-layer');
  clearParticles();

  for (let i = 0; i < 22; i++) {
    const r = CORTEX_REGIONS[Math.floor(Math.random() * CORTEX_REGIONS.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist  = 20 + Math.random() * 50;
    const tx = r.cx + Math.cos(angle) * dist;
    const ty = r.cy + Math.sin(angle) * dist;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', r.cx);
    circle.setAttribute('cy', r.cy);
    circle.setAttribute('r', 3 + Math.random() * 3);
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '0.85');
    circle.style.transition = `cx ${0.5 + Math.random() * 0.5}s ease, cy ${0.5 + Math.random() * 0.5}s ease, opacity 0.8s`;
    layer.appendChild(circle);

    setTimeout(() => {
      circle.setAttribute('cx', tx);
      circle.setAttribute('cy', ty);
    }, 50 + i * 30);

    setTimeout(() => {
      circle.setAttribute('opacity', '0');
      setTimeout(() => circle.remove(), 600);
    }, 900 + i * 40);
  }
}

function clearParticles() {
  const layer = document.getElementById('particles-layer');
  if (layer) layer.innerHTML = '';
}

// ── REPRODUCCIÓN DE ESCENARIOS ───────────────────

function playScenario(scenario) {
  if (CortexState.isPlaying) {
    stopScenario();
    return;
  }

  CortexState.activeScenario = scenario;
  CortexState.isPlaying  = true;
  CortexState.isPaused   = false;
  CortexState.currentStep = 0;

  // Activar botón de pausa
  const pauseBtn = document.getElementById('btn-cortex-pause');
  if (pauseBtn) { pauseBtn.disabled = false; pauseBtn.textContent = '⏸ Pausar'; pauseBtn.classList.remove('paused'); }

  updatePlayBtn(true, scenario);
  drawConnections(scenario.connections, scenario.color, scenario.isRhizome ? 0.18 : 0.22);
  updateStepInfo(scenario, 0);

  runStep(scenario);
}

function runStep(scenario) {
  if (CortexState.isPaused) return; // pausado — espera reanudación
  const step = scenario.sequence[CortexState.currentStep];
  if (!step) { finishScenario(scenario); return; }

  const prevStep = scenario.sequence[CortexState.currentStep - 1];
  if (prevStep && !scenario.isRhizome) {
    prevStep.regions.forEach(id => {
      if (!step.regions.includes(id)) deactivateRegion(id);
    });
  }

  const intensity = scenario.isRhizome
    ? (CortexState.currentStep === scenario.sequence.length - 1 ? 'rhizome' : 'med')
    : (CortexState.currentStep === scenario.sequence.length - 1 ? 'high' : 'med');

  step.regions.forEach((id, i) => {
    setTimeout(() => {
      activateRegion(id, intensity, scenario.isRhizome ? null : scenario.color);
      if (scenario.isRhizome && CortexState.currentStep >= 2) {
        spawnRhizomeParticles(scenario.color);
      }
    }, i * 80);
  });

  updateStepInfo(scenario, CortexState.currentStep);

  const duration = Math.round(step.duration / CortexState.speed);
  CortexState.currentStep++;
  CortexState.stepTimer = setTimeout(() => runStep(scenario), duration);
}

function finishScenario(scenario) {
  CortexState.isPlaying = false;
  CortexState.isPaused  = false;
  updatePlayBtn(false, scenario);
  updateStepInfo(scenario, -1);
  const pauseBtn = document.getElementById('btn-cortex-pause');
  if (pauseBtn) { pauseBtn.disabled = true; pauseBtn.textContent = '⏸ Pausar'; }
}

function stopScenario() {
  if (CortexState.stepTimer) clearTimeout(CortexState.stepTimer);
  CortexState.isPlaying = false;
  CortexState.isPaused  = false;
  deactivateAll();
  const scenario = CortexState.activeScenario;
  updatePlayBtn(false, scenario);
  clearStepInfo();
  const pauseBtn = document.getElementById('btn-cortex-pause');
  if (pauseBtn) { pauseBtn.disabled = true; pauseBtn.textContent = '⏸ Pausar'; }
}

function pauseScenario() {
  if (!CortexState.isPlaying || CortexState.isPaused) return;
  CortexState.isPaused = true;
  if (CortexState.stepTimer) clearTimeout(CortexState.stepTimer);
  _syncCortexPauseBtn();
}

function resumeScenario() {
  if (!CortexState.isPlaying || !CortexState.isPaused) return;
  CortexState.isPaused = false;
  _syncCortexPauseBtn();
  if (CortexState.activeScenario) runStep(CortexState.activeScenario);
}

function _syncCortexPauseBtn() {
  const btn = document.getElementById('btn-cortex-pause');
  if (!btn) return;
  if (CortexState.isPaused) {
    btn.textContent = '▶ Reanudar'; btn.classList.add('paused');
  } else {
    btn.textContent = '⏸ Pausar';  btn.classList.remove('paused');
  }
}

function updatePlayBtn(playing, scenario) {
  const btn = document.getElementById(`btn-scenario-${scenario?.id}`);
  if (!btn) return;
  btn.classList.toggle('playing', playing);
  btn.querySelector('.sc-btn-text').textContent = playing ? '⏹ Detener' : scenario.name;
}

// ── UI DE FASES ──────────────────────────────────

// Imágenes reales por escenario de corteza
const CORTEX_REAL_IMAGES = {
  reading:   { src: 'assets/cortex/fmri-reading.webp',         caption: 'fMRI: activación cerebral durante lectura — áreas del lenguaje · Wikimedia' },
  fear:      { src: 'assets/cortex/fmri-emotion.webp',         caption: 'fMRI: activación de la amígdala ante estímulos emocionales · Wikimedia' },
  music:     { src: 'assets/cortex/fmri-reading.webp',         caption: 'fMRI: múltiples redes activas durante escucha musical · Wikimedia' },
  creative:  { src: 'assets/cortex/default-mode-network.webp', caption: 'Red por Defecto (DMN) — activa durante creatividad y ensimismamiento · Wikimedia' },
  rhizome:   { src: 'assets/cortex/default-mode-network.webp', caption: 'Redes cerebrales distribuidas — el pensamiento no tiene un solo lugar · Wikimedia' },
};

function updateStepInfo(scenario, stepIdx) {
  const panel = document.getElementById('step-info-panel');
  if (!panel) return;

  const step     = scenario.sequence[stepIdx];
  const realImg  = CORTEX_REAL_IMAGES[scenario.id];
  const imgHtml  = realImg ? `
    <div class="real-img-wrap scenario-real-img visible" style="margin-top:10px">
      <span class="real-img-badge">🧲 fMRI</span>
      <img src="${realImg.src}" alt="Imagen fMRI escenario ${scenario.name}" loading="lazy">
      <p class="real-img-caption">${realImg.caption}</p>
    </div>` : '';

  if (stepIdx === -1) {
    panel.innerHTML = `
      <div class="si-badge" style="background:${scenario.color}22;border-color:${scenario.color}44;color:${scenario.color}">
        ✓ Secuencia completa
      </div>
      <p class="si-label">${scenario.name}</p>
      <p class="si-desc">${scenario.description}</p>
      ${scenario.rhizomeNote ? `<div class="si-rhizome-note">"${scenario.rhizomeNote}"</div>` : ''}
      ${imgHtml}
    `;
    return;
  }

  if (!step) return;

  const total = scenario.sequence.length;
  panel.innerHTML = `
    <div class="si-progress">
      <div class="si-progress-bar" style="width:${((stepIdx+1)/total)*100}%;background:${scenario.color}"></div>
    </div>
    <div class="si-badge" style="background:${scenario.color}22;border-color:${scenario.color}44;color:${scenario.color}">
      Fase ${stepIdx + 1} / ${total}
    </div>
    <p class="si-step-label">${step.label}</p>
    <div class="si-regions">
      ${step.regions.map(id => {
        const r = CORTEX_REGIONS.find(x => x.id === id);
        return r ? `<span class="si-region-chip" style="background:${r.color}22;border-color:${r.color}44;color:${r.color}">${r.name}</span>` : '';
      }).join('')}
    </div>
    ${stepIdx === total - 1 ? imgHtml : ''}
  `;
}

function clearStepInfo() {
  const panel = document.getElementById('step-info-panel');
  if (panel) panel.innerHTML = '<p class="si-idle">Selecciona un escenario para ver la activación cerebral</p>';
}

// ── TOOLTIP ──────────────────────────────────────

function showTooltip(region) {
  const tooltip = document.getElementById('cortex-tooltip');
  if (!tooltip) return;
  tooltip.textContent = region.name;
  tooltip.classList.add('visible');
}

function hideTooltip() {
  const tooltip = document.getElementById('cortex-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

// ── BOTONES DE ESCENARIO ─────────────────────────

function buildScenarioButtons() {
  const wrap = document.getElementById('scenario-buttons');
  if (!wrap) return;

  wrap.innerHTML = ACTIVATION_SCENARIOS.map(s => `
    <button class="scenario-btn ${s.isRhizome ? 'rhizome-btn' : ''}"
            id="btn-scenario-${s.id}"
            style="--sc:${s.color}">
      <span class="sc-btn-icon">${s.emoji}</span>
      <span class="sc-btn-text">${s.name}</span>
    </button>
  `).join('');

  ACTIVATION_SCENARIOS.forEach(s => {
    document.getElementById(`btn-scenario-${s.id}`)
      .addEventListener('click', () => {
        // Deseleccionar otros
        ACTIVATION_SCENARIOS.forEach(os => {
          document.getElementById(`btn-scenario-${os.id}`)?.classList.remove('playing');
        });
        if (CortexState.activeScenario?.id === s.id && CortexState.isPlaying) {
          stopScenario();
        } else {
          stopScenario();
          setTimeout(() => playScenario(s), 100);
        }
      });
  });
}

// ── VELOCIDAD ────────────────────────────────────

function initSpeedButtons() {
  document.querySelectorAll('.cx-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cx-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      CortexState.speed = parseFloat(btn.dataset.speed);
    });
  });

  // Botón de pausa de corteza
  document.getElementById('btn-cortex-pause')?.addEventListener('click', () => {
    if (!CortexState.isPlaying) return;
    if (!CortexState.isPaused) pauseScenario();
    else                       resumeScenario();
  });
}

// ── SCROLL INDICATOR ─────────────────────────────

function initScrollIndicator() {
  const indicator = document.getElementById('scroll-indicator');
  if (!indicator) return;

  function check() {
    const scrolled = window.scrollY > 80;
    indicator.classList.toggle('hidden', scrolled);
  }

  window.addEventListener('scroll', check, { passive: true });
  setTimeout(check, 1000);

  indicator.addEventListener('click', () => {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
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
  const stars = Array.from({ length: 100 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    a: Math.random() * 0.5 + 0.08,
    da: (Math.random() - 0.5) * 0.0022,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 0.6) s.da = -Math.abs(s.da);
      if (s.a < 0.04) s.da = Math.abs(s.da);
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
  buildCortexSVG();
  buildScenarioButtons();
  initSpeedButtons();
  initScrollIndicator();
  clearStepInfo();

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') stopScenario();
  });

  // Hover tooltip position
  document.getElementById('cortex-svg-container')?.addEventListener('mousemove', e => {
    const tooltip = document.getElementById('cortex-tooltip');
    if (!tooltip || !tooltip.classList.contains('visible')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    tooltip.style.left = `${e.clientX - rect.left + 12}px`;
    tooltip.style.top  = `${e.clientY - rect.top  - 32}px`;
  });
});
