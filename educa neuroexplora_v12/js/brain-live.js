/**
 * NeuroExplora — brain-live.js  v1.0
 * Capa de animación viva sobre el módulo del cerebro:
 *  - Actividad neuronal ambiental (partículas flotantes)
 *  - Conexiones animadas al seleccionar una región
 *  - Modo "Cerebro vivo" — escenarios de pensamientos reales
 *  - Ondas de activación entre regiones conectadas
 */

// ── COORDENADAS DE CENTROS POR REGIÓN ──────────────────────────
// (mapeadas sobre el viewBox 0 0 560 440 del brain.js)
const REGION_CENTERS = {
  frontal:       { x: 158, y: 128 },
  parietal:      { x: 338, y: 108 },
  occipital:     { x: 428, y: 188 },
  temporal:      { x: 218, y: 272 },
  motor:         { x: 277, y: 120 },
  somatosensory: { x: 287, y: 120 },
  broca:         { x: 148, y: 218 },
  wernicke:      { x: 316, y: 215 },
  cerebellum:    { x: 396, y: 375 },
  brainstem:     { x: 272, y: 360 },
  prefrontal:    { x: 98,  y: 148 },
};

// ── ESCENARIOS DE PENSAMIENTO ───────────────────────────────────
const LIVE_SCENARIOS = [
  {
    id: 'reading',    name: '📖 Leer',
    color: '#38bdf8',
    waves: [['occipital','parietal'],['parietal','temporal'],['temporal','wernicke'],['wernicke','broca'],['broca','frontal'],['frontal','prefrontal']],
    label: 'Leyendo: occipital → Wernicke → Broca → prefrontal',
  },
  {
    id: 'moving',     name: '🏃 Moverse',
    color: '#fb923c',
    waves: [['prefrontal','frontal'],['frontal','motor'],['motor','brainstem'],['brainstem','cerebellum'],['cerebellum','motor']],
    label: 'Movimiento voluntario: prefrontal → motor → cerebelo',
  },
  {
    id: 'remembering', name: '💭 Recordar',
    color: '#fbbf24',
    waves: [['prefrontal','temporal'],['temporal','occipital'],['occipital','parietal'],['parietal','temporal'],['temporal','frontal']],
    label: 'Memoria episódica: temporal ↔ prefrontal ↔ occipital',
  },
  {
    id: 'speaking',   name: '💬 Hablar',
    color: '#f9a8d4',
    waves: [['prefrontal','broca'],['broca','motor'],['motor','brainstem'],['wernicke','broca'],['frontal','broca']],
    label: 'Producción del habla: Broca → corteza motora → tronco',
  },
  {
    id: 'feeling',    name: '❤️ Sentir',
    color: '#a78bfa',
    waves: [['brainstem','temporal'],['temporal','frontal'],['frontal','prefrontal'],['prefrontal','frontal'],['temporal','prefrontal']],
    label: 'Respuesta emocional: amígdala (temporal) ↔ prefrontal',
  },
];

// ── ESTADO ──────────────────────────────────────────────────────
const LiveState = {
  ambientTimer: null,
  waveTimer: null,
  activeScenario: null,
  isLive: false,
  waveStep: 0,
  particles: [],
};

// ── CAPA SVG EXTRA ───────────────────────────────────────────────
let liveLayer = null;
let connLayer = null;
let particleLayer = null;

function initLiveLayers(svgEl) {
  if (!svgEl) return;

  // Capa de conexiones (debajo de las regiones)
  connLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  connLayer.setAttribute('id', 'live-conn-layer');
  svgEl.insertBefore(connLayer, svgEl.firstChild);

  // Capa de partículas (encima de todo)
  particleLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  particleLayer.setAttribute('id', 'live-particle-layer');
  svgEl.appendChild(particleLayer);
}

// ── ACTIVIDAD AMBIENTAL ──────────────────────────────────────────
// Pequeñas partículas que parpadean en el cerebro

function startAmbient(svgEl) {
  if (!particleLayer) initLiveLayers(svgEl);
  stopAmbient();
  spawnAmbientCycle();
}

function stopAmbient() {
  if (LiveState.ambientTimer) clearTimeout(LiveState.ambientTimer);
  LiveState.ambientTimer = null;
  if (particleLayer) particleLayer.innerHTML = '';
}

function spawnAmbientCycle() {
  spawnAmbientParticle();
  LiveState.ambientTimer = setTimeout(spawnAmbientCycle, 320 + Math.random() * 480);
}

function spawnAmbientParticle() {
  if (!particleLayer) return;

  const regions = Object.keys(REGION_CENTERS);
  const rid = regions[Math.floor(Math.random() * regions.length)];
  const center = REGION_CENTERS[rid];
  const regionData = (typeof BRAIN_REGIONS !== 'undefined')
    ? BRAIN_REGIONS.find(r => r.id === rid)
    : null;
  const color = regionData ? regionData.color : '#4f8ef7';

  const angle = Math.random() * Math.PI * 2;
  const dist  = 10 + Math.random() * 28;
  const x = center.x + Math.cos(angle) * dist;
  const y = center.y + Math.sin(angle) * dist;

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r',  2 + Math.random() * 2);
  circle.setAttribute('fill', color);
  circle.setAttribute('opacity', '0');
  circle.style.transition = 'opacity 0.35s, r 0.35s';
  particleLayer.appendChild(circle);

  // Aparecer
  requestAnimationFrame(() => {
    circle.setAttribute('opacity', '0.7');
    circle.setAttribute('r', 3 + Math.random() * 2.5);
  });

  // Desaparecer y mover ligeramente
  setTimeout(() => {
    circle.setAttribute('opacity', '0');
    circle.setAttribute('cx', x + (Math.random() - 0.5) * 12);
    circle.setAttribute('cy', y + (Math.random() - 0.5) * 12);
    setTimeout(() => { if (circle.parentNode) circle.remove(); }, 400);
  }, 500 + Math.random() * 600);
}

// ── ONDA DE SEÑAL ENTRE DOS REGIONES ────────────────────────────

function fireWave(fromId, toId, color, duration = 600) {
  if (!particleLayer) return;
  const from = REGION_CENTERS[fromId];
  const to   = REGION_CENTERS[toId];
  if (!from || !to) return;

  const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  particle.setAttribute('cx', from.x);
  particle.setAttribute('cy', from.y);
  particle.setAttribute('r',  6);
  particle.setAttribute('fill', '#fff');
  particle.setAttribute('opacity', '0.95');
  particle.style.filter = `drop-shadow(0 0 6px ${color})`;
  particleLayer.appendChild(particle);

  const core = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  core.setAttribute('cx', from.x);
  core.setAttribute('cy', from.y);
  core.setAttribute('r',  3);
  core.setAttribute('fill', color);
  core.setAttribute('opacity', '1');
  particleLayer.appendChild(core);

  // Línea de trayectoria tenue
  const trail = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  trail.setAttribute('x1', from.x); trail.setAttribute('y1', from.y);
  trail.setAttribute('x2', from.x); trail.setAttribute('y2', from.y);
  trail.setAttribute('stroke', color);
  trail.setAttribute('stroke-width', '1.2');
  trail.setAttribute('stroke-opacity', '0.3');
  trail.setAttribute('stroke-dasharray', '3 3');
  connLayer.appendChild(trail);

  const start = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const cx = from.x + (to.x - from.x) * ease;
    const cy = from.y + (to.y - from.y) * ease;

    particle.setAttribute('cx', cx);
    particle.setAttribute('cy', cy);
    core.setAttribute('cx', cx);
    core.setAttribute('cy', cy);
    trail.setAttribute('x2', cx);
    trail.setAttribute('y2', cy);
    particle.setAttribute('opacity', 1 - t * 0.4);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // Pulso de llegada
      pulseArrival(to.x, to.y, color);
      particle.remove();
      core.remove();
      setTimeout(() => { if (trail.parentNode) trail.remove(); }, 300);
    }
  }
  requestAnimationFrame(frame);
}

function pulseArrival(x, y, color) {
  if (!particleLayer) return;
  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', x);
  ring.setAttribute('cy', y);
  ring.setAttribute('r',  8);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', color);
  ring.setAttribute('stroke-width', '2');
  ring.setAttribute('opacity', '0.85');
  ring.style.transition = 'r 0.4s, opacity 0.4s';
  particleLayer.appendChild(ring);

  requestAnimationFrame(() => {
    ring.setAttribute('r', 24);
    ring.setAttribute('opacity', '0');
    setTimeout(() => { if (ring.parentNode) ring.remove(); }, 420);
  });
}

// ── MOSTRAR CONEXIONES AL SELECCIONAR REGIÓN ─────────────────────

function showRegionConnections(regionId, color) {
  clearConnectionLines();
  const regionData = (typeof BRAIN_REGIONS !== 'undefined')
    ? BRAIN_REGIONS.find(r => r.id === regionId)
    : null;
  if (!regionData || !regionData.connections) return;

  const from = REGION_CENTERS[regionId];
  if (!from) return;

  regionData.connections.forEach((toId, i) => {
    const to = REGION_CENTERS[toId];
    if (!to) return;

    // Línea permanente mientras la región esté activa
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);   line.setAttribute('y2', to.y);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-opacity', '0.35');
    line.setAttribute('stroke-dasharray', '5 4');
    line.classList.add('live-conn-line');
    line.style.animation = 'dashFlow 1.5s linear infinite';
    connLayer.appendChild(line);

    // Disparo de partícula con retraso escalonado
    setTimeout(() => {
      fireWave(regionId, toId, color, 700);
    }, i * 180);
  });
}

function clearConnectionLines() {
  if (connLayer) connLayer.innerHTML = '';
}

// ── MODO CEREBRO VIVO ────────────────────────────────────────────

function startLiveMode(scenarioId) {
  const scenario = LIVE_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  stopLiveMode();
  LiveState.activeScenario = scenario;
  LiveState.isLive = true;
  LiveState.waveStep = 0;

  updateLiveModeUI(scenario);
  runLiveWave(scenario);
}

function runLiveWave(scenario) {
  if (!LiveState.isLive) return;

  const step = scenario.waves[LiveState.waveStep];
  if (step) {
    fireWave(step[0], step[1], scenario.color, 650);

    // Highlight tenue de las dos regiones
    highlightRegionTmp(step[0], scenario.color);
    highlightRegionTmp(step[1], scenario.color);
  }

  LiveState.waveStep = (LiveState.waveStep + 1) % scenario.waves.length;
  LiveState.waveTimer = setTimeout(() => runLiveWave(scenario), 750);
}

function stopLiveMode() {
  if (LiveState.waveTimer) clearTimeout(LiveState.waveTimer);
  LiveState.isLive = false;
  LiveState.activeScenario = null;
  clearConnectionLines();
  clearRegionHighlights();
}

function highlightRegionTmp(regionId, color) {
  const el = document.querySelector(`[data-region-id="${regionId}"] path, .brain-region[data-id="${regionId}"] path`);
  if (!el) return;
  const orig = el.style.filter;
  el.style.filter = `brightness(1.18) drop-shadow(0 0 10px ${color})`;
  setTimeout(() => { el.style.filter = orig; }, 500);
}

function clearRegionHighlights() {
  document.querySelectorAll('.brain-region, .neuron-part').forEach(el => {
    el.style.filter = '';
  });
}

function updateLiveModeUI(scenario) {
  const label = document.getElementById('live-mode-label');
  if (label) {
    label.textContent = scenario.label;
    label.style.color = scenario.color;
  }
  // Marcar botón activo
  document.querySelectorAll('.live-scenario-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scenario === scenario.id);
    btn.style.setProperty('--ls-color', btn.dataset.scenario === scenario.id ? scenario.color : 'var(--border2)');
  });
}

// ── CONSTRUIR CONTROLES LIVE MODE ────────────────────────────────

function buildLiveControls() {
  const wrap = document.getElementById('live-controls');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="live-header">
      <span class="live-title">🧠 Cerebro en acción</span>
      <span class="live-subtitle">Activa un escenario para ver cómo se coordinan las redes cerebrales en tiempo real</span>
    </div>
    <div class="live-btns">
      ${LIVE_SCENARIOS.map(s => `
        <button class="live-scenario-btn" data-scenario="${s.id}"
                style="--ls-color:var(--border2)">
          <span>${s.name}</span>
        </button>
      `).join('')}
      <button class="live-stop-btn" id="btn-live-stop">⏹ Detener</button>
    </div>
    <div class="live-label" id="live-mode-label">Selecciona un pensamiento para ver su red neuronal</div>
  `;

  wrap.querySelectorAll('.live-scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sid = btn.dataset.scenario;
      if (LiveState.activeScenario?.id === sid && LiveState.isLive) {
        stopLiveMode();
        btn.classList.remove('active');
        const lbl = document.getElementById('live-mode-label');
        if (lbl) { lbl.textContent = 'Selecciona un pensamiento para ver su red neuronal'; lbl.style.color = ''; }
      } else {
        startLiveMode(sid);
      }
    });
  });

  document.getElementById('btn-live-stop')?.addEventListener('click', () => {
    stopLiveMode();
    document.querySelectorAll('.live-scenario-btn').forEach(b => b.classList.remove('active'));
    const lbl = document.getElementById('live-mode-label');
    if (lbl) { lbl.textContent = 'Selecciona un pensamiento para ver su red neuronal'; lbl.style.color = ''; }
  });
}

// ── INIT ─────────────────────────────────────────────────────────

function initBrainLive(svgElement) {
  initLiveLayers(svgElement);
  startAmbient(svgElement);
  buildLiveControls();

  // Integrar con BrainRenderer: cuando se selecciona región,
  // mostrar sus conexiones animadas
  if (typeof brain !== 'undefined') {
    const origOnSelect = brain.onSelect;
    brain.onSelect = (id) => {
      if (origOnSelect) origOnSelect(id);
      const r = (typeof BRAIN_REGIONS !== 'undefined')
        ? BRAIN_REGIONS.find(x => x.id === id)
        : null;
      if (r) showRegionConnections(id, r.color);
      stopLiveMode();
      document.querySelectorAll('.live-scenario-btn').forEach(b => b.classList.remove('active'));
    };
    const origOnDeselect = brain.onDeselect;
    brain.onDeselect = () => {
      if (origOnDeselect) origOnDeselect();
      clearConnectionLines();
    };
  }
}
