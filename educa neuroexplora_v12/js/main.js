/**
 * NeuroExplora — main.js  v1.1
 * Gestión del panel (3 funFacts, tabs), zoom, rotación del SVG,
 * leyenda, tour, créditos y fondo de estrellas.
 */

// ── ESTADO GLOBAL ──────────────────────────────────────────────
const State = {
  activeId: null,
  factIndex: 0,        // índice del dato curioso activo (0–2)
  flipped: false,      // hemisferio derecho = espejo
  zoom: 1,             // escala actual del SVG (0.6–2.0)
  dragStartX: null,
  dragCurrentX: null,
  isDragging: false,
};

// Límites de zoom
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.2;
const ZOOM_STEP = 0.18;

// ── INSTANCIA DEL CEREBRO ──────────────────────────────────────
let brain;

// ── ZOOM ────────────────────────────────────────────────────────

function applyZoom(delta) {
  State.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, State.zoom + delta));
  const wrapper = document.getElementById('svg-transform-wrapper');
  if (wrapper) {
    wrapper.style.transform = buildTransform();
  }
  // Actualizar estado de botones
  document.getElementById('btn-zoom-in') .disabled = State.zoom >= ZOOM_MAX;
  document.getElementById('btn-zoom-out').disabled = State.zoom <= ZOOM_MIN;
}

function resetZoom() {
  State.zoom = 1;
  applyZoom(0);
}

function buildTransform() {
  const scaleX = State.flipped ? -State.zoom : State.zoom;
  return `scaleX(${scaleX}) scaleY(${State.zoom})`;
}

// ── ROTACIÓN / FLIP ────────────────────────────────────────────

function flipBrain() {
  State.flipped = !State.flipped;
  const wrapper = document.getElementById('svg-transform-wrapper');
  const btn = document.getElementById('btn-flip');
  if (wrapper) wrapper.style.transform = buildTransform();
  if (btn) {
    btn.title = State.flipped ? 'Ver hemisferio izquierdo' : 'Ver hemisferio derecho';
    btn.querySelector('.btn-flip-label').textContent = State.flipped ? 'Hemis. derecho' : 'Hemis. izquierdo';
  }
}

// Arrastre horizontal para "rotar" la vista (efecto perspectiva)
function initDrag() {
  const container = document.getElementById('brain-container');
  if (!container) return;

  container.addEventListener('mousedown', e => {
    if (e.target.closest('.brain-region')) return; // no interferir con click en región
    State.isDragging = true;
    State.dragStartX = e.clientX;
  });

  document.addEventListener('mousemove', e => {
    if (!State.isDragging) return;
    const dx = e.clientX - State.dragStartX;
    // Perspectiva visual leve — no cambia la selección
    const wrapper = document.getElementById('svg-transform-wrapper');
    if (wrapper) {
      const baseScaleX = State.flipped ? -State.zoom : State.zoom;
      const skew = Math.max(-12, Math.min(12, dx * 0.04));
      wrapper.style.transform = `scaleX(${baseScaleX}) scaleY(${State.zoom}) skewY(${skew}deg)`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (!State.isDragging) return;
    State.isDragging = false;
    // Volver al estado normal con transición
    const wrapper = document.getElementById('svg-transform-wrapper');
    if (wrapper) {
      wrapper.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
      wrapper.style.transform = buildTransform();
      setTimeout(() => { wrapper.style.transition = 'transform 0.22s ease'; }, 420);
    }
  });

  // Rueda del ratón = zoom
  container.addEventListener('wheel', e => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }, { passive: false });

  // Pinch-to-zoom (touch)
  let lastDist = null;
  container.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
    }
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && lastDist !== null) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      const delta = (dist - lastDist) * 0.008;
      applyZoom(delta);
      lastDist = dist;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => { lastDist = null; });
}

// ── PANEL: DATOS CURIOSOS (CARRUSEL) ───────────────────────────

function renderFacts(region) {
  const container = document.getElementById('facts-carousel');
  if (!container) return;

  const facts = region.funFacts || [];
  const idx = State.factIndex;

  container.innerHTML = `
    <div class="fact-header">
      <span class="fact-header-label">¿Sabías que?</span>
      <div class="fact-nav">
        <button class="fact-arrow" id="fact-prev" ${idx === 0 ? 'disabled' : ''} title="Dato anterior">‹</button>
        <span class="fact-counter">${idx + 1} / ${facts.length}</span>
        <button class="fact-arrow" id="fact-next" ${idx === facts.length - 1 ? 'disabled' : ''} title="Dato siguiente">›</button>
      </div>
    </div>
    <div class="fact-dots">
      ${facts.map((_, i) => `<button class="fact-dot ${i === idx ? 'active' : ''}" data-fact-idx="${i}" title="Dato ${i+1}"></button>`).join('')}
    </div>
    <div class="fact-slide" id="fact-slide">
      <span class="fact-icon">${facts[idx].icon}</span>
      <p class="fact-text">${facts[idx].text}</p>
    </div>
    <div class="fact-all-toggle">
      <button class="fact-see-all" id="fact-see-all-btn">Ver los ${facts.length} datos</button>
    </div>
    <div class="fact-all-list hidden" id="fact-all-list">
      ${facts.map((f, i) => `
        <div class="fact-item-full">
          <span class="fact-num">${i + 1}</span>
          <div>
            <span class="fact-icon-sm">${f.icon}</span>
            <p class="fact-text-sm">${f.text}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Navegación de dots
  container.querySelectorAll('.fact-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      State.factIndex = parseInt(dot.dataset.factIdx);
      renderFacts(region);
    });
  });

  // Flechas
  document.getElementById('fact-prev')?.addEventListener('click', () => {
    if (State.factIndex > 0) { State.factIndex--; renderFacts(region); }
  });
  document.getElementById('fact-next')?.addEventListener('click', () => {
    if (State.factIndex < facts.length - 1) { State.factIndex++; renderFacts(region); }
  });

  // Ver todos
  document.getElementById('fact-see-all-btn')?.addEventListener('click', () => {
    const list = document.getElementById('fact-all-list');
    const btn  = document.getElementById('fact-see-all-btn');
    const isHidden = list.classList.toggle('hidden');
    btn.textContent = isHidden ? `Ver los ${facts.length} datos` : 'Ocultar lista';
  });
}

// ── PANEL DE INFORMACIÓN ───────────────────────────────────────

function showPanel(regionId) {
  const region = BRAIN_REGIONS.find(r => r.id === regionId);
  if (!region) return;

  State.activeId = regionId;
  State.factIndex = 0; // resetear carrusel al cambiar de región

  const panel      = document.getElementById('info-panel');
  const emptyState = document.getElementById('empty-state');
  const content    = document.getElementById('panel-content');

  const skillChips = region.skills.map(s =>
    `<span class="skill-chip" style="--chip-color:${region.color}">${s}</span>`
  ).join('');

  const connectedRegions = region.connections
    .map(cid => BRAIN_REGIONS.find(r => r.id === cid))
    .filter(Boolean);

  const connBadges = connectedRegions.map(cr =>
    `<button class="conn-badge" onclick="selectRegion('${cr.id}')" title="Explorar ${cr.name}">
      ${cr.emoji} ${cr.short}
    </button>`
  ).join('');

  content.innerHTML = `
    <div class="panel-header" style="--region-color:${region.color}">
      <div class="panel-badge">
        <span class="panel-emoji">${region.emoji}</span>
        <span class="panel-tagline">${region.tagline}</span>
      </div>
      <h2 class="panel-title">${region.name}</h2>
      <div class="panel-color-bar" style="background:${region.color}"></div>
    </div>

    <div class="panel-tabs" id="panel-tabs">
      <button class="tab-btn active" data-tab="info">📋 Función</button>
      <button class="tab-btn" data-tab="kids">🧒 Para niños</button>
      <button class="tab-btn" data-tab="facts">✨ Datos</button>
    </div>

    <div class="tab-content" id="tab-info">
      <p class="panel-desc">${region.description}</p>
    </div>

    <div class="tab-content hidden" id="tab-kids">
      <div class="kids-box">
        <p class="kids-text">${region.childExplanation}</p>
      </div>
    </div>

    <div class="tab-content hidden" id="tab-facts">
      <div id="facts-carousel"></div>
    </div>

    <div class="panel-section">
      <p class="section-label">Habilidades asociadas</p>
      <div class="skills-grid">${skillChips}</div>
    </div>

    ${connBadges ? `
    <div class="panel-section">
      <p class="section-label">Regiones conectadas</p>
      <div class="conn-grid">${connBadges}</div>
    </div>` : ''}
  `;

  // Tabs
  content.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      content.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
      btn.classList.add('active');
      const tab = content.querySelector(`#tab-${btn.dataset.tab}`);
      if (tab) tab.classList.remove('hidden');
      // Renderizar facts si se abre esa pestaña
      if (btn.dataset.tab === 'facts') renderFacts(region);
    });
  });

  if (emptyState) emptyState.style.display = 'none';
  panel.classList.remove('hidden');

  if (window.innerWidth <= 768) {
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60);
  }
}

function closePanel() {
  State.activeId = null;
  const panel      = document.getElementById('info-panel');
  const emptyState = document.getElementById('empty-state');

  panel.classList.add('hidden');
  if (emptyState) emptyState.style.display = '';

  if (brain) brain.deselect();
  updateLegend(null);
}

// ── SELECCIÓN GLOBAL ──────────────────────────────────────────

function selectRegion(id) {
  brain.selectById(id);
  showPanel(id);
  updateLegend(id);
  if (window.innerWidth <= 768) {
    document.getElementById('brain-container')
      .scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function selectRandom() {
  const ids = BRAIN_REGIONS.map(r => r.id).filter(id => id !== State.activeId);
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  selectRegion(randomId);
}

// ── LEYENDA ────────────────────────────────────────────────────

function buildLegend() {
  const legend = document.getElementById('region-legend');
  legend.innerHTML = '';
  BRAIN_REGIONS.forEach(r => {
    const item = document.createElement('button');
    item.className = 'legend-item';
    item.setAttribute('data-legend-id', r.id);
    item.title = r.name;
    item.innerHTML = `<span class="legend-dot" style="background:${r.color}"></span><span class="legend-name">${r.short}</span>`;
    item.addEventListener('click', () => selectRegion(r.id));
    legend.appendChild(item);
  });
}

function updateLegend(activeId) {
  document.querySelectorAll('.legend-item').forEach(item => {
    item.classList.toggle('legend-active', item.getAttribute('data-legend-id') === activeId);
  });
}

// ── TOUR ───────────────────────────────────────────────────────

function showTour()  { document.getElementById('tour-overlay').classList.remove('hidden'); }
function closeTour() {
  document.getElementById('tour-overlay').classList.add('hidden');
  try { localStorage.setItem('neuroexplora_toured', '1'); } catch (e) {}
}

// ── CRÉDITOS ───────────────────────────────────────────────────

function showCredits()  { document.getElementById('credits-overlay').classList.remove('hidden'); }
function closeCredits() { document.getElementById('credits-overlay').classList.add('hidden'); }

// ── FONDO ESTRELLAS ────────────────────────────────────────────

function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const stars = Array.from({ length: 160 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.2 + 0.2,
    a: Math.random() * 0.6 + 0.1,
    da: (Math.random() - 0.5) * 0.003,
  }));

  const NEBULAS = [
    { x: 0.14, y: 0.24, c: 'rgba(79,142,247,0.038)' },
    { x: 0.82, y: 0.64, c: 'rgba(167,139,250,0.032)' },
    { x: 0.50, y: 0.88, c: 'rgba(56,189,248,0.028)' },
  ];

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    NEBULAS.forEach(n => {
      const g = ctx.createRadialGradient(n.x * canvas.width, n.y * canvas.height, 0,
        n.x * canvas.width, n.y * canvas.height, canvas.width * 0.38);
      g.addColorStop(0, n.c); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 0.72) s.da = -Math.abs(s.da);
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

// ── INICIALIZACIÓN ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // 1. Estrellas
  initStars();

  // 2. Cerebro
  brain = new BrainRenderer('brain-svg', 'brain-tooltip');
  brain.render();

  brain.onSelect   = (id) => { showPanel(id); updateLegend(id); };
  brain.onDeselect = ()   => { closePanel(); updateLegend(null); };

  // 3. Leyenda
  buildLegend();

  // 4. Controles de zoom
  document.getElementById('btn-zoom-in') .addEventListener('click', () => applyZoom(+ZOOM_STEP));
  document.getElementById('btn-zoom-out').addEventListener('click', () => applyZoom(-ZOOM_STEP));
  document.getElementById('btn-zoom-reset').addEventListener('click', resetZoom);
  document.getElementById('btn-flip')    .addEventListener('click', flipBrain);

  // Wrapper de transformación
  const wrapper = document.getElementById('svg-transform-wrapper');
  if (wrapper) wrapper.style.transition = 'transform 0.22s ease';

  // 5. Drag y pinch
  initDrag();

  // 6. Botones header
  document.getElementById('btn-tour')    .addEventListener('click', showTour);
  document.getElementById('btn-random')  .addEventListener('click', selectRandom);
  document.getElementById('btn-credits') .addEventListener('click', showCredits);
  document.getElementById('btn-random-2')?.addEventListener('click', selectRandom);

  // 7. Panel
  document.getElementById('panel-close').addEventListener('click', closePanel);

  // 8. Tour / créditos
  document.getElementById('tour-start-btn').addEventListener('click', closeTour);
  document.getElementById('credits-close') .addEventListener('click', closeCredits);

  document.getElementById('tour-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeTour();
  });
  document.getElementById('credits-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCredits();
  });

  // 9. Click fuera cierra panel
  document.addEventListener('click', e => {
    if (!State.activeId) return;
    if (
      !e.target.closest('#brain-container') &&
      !e.target.closest('#info-panel') &&
      !e.target.closest('.legend-item') &&
      !e.target.closest('.brain-controls')
    ) closePanel();
  });

  // 10. Teclado
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePanel(); closeTour(); closeCredits(); }
    if (e.key === '+' || e.key === '=') applyZoom(+ZOOM_STEP);
    if (e.key === '-')                   applyZoom(-ZOOM_STEP);
    if (e.key === '0')                   resetZoom();
  });

  // 11. Tour automático primer acceso
  let toured = false;
  try { toured = !!localStorage.getItem('neuroexplora_toured'); } catch (e) {}
  if (!toured) setTimeout(showTour, 700);
});

// ── SCROLL INDICATOR ─────────────────────────────
(function initScrollIndicator() {
  const el = document.getElementById('scroll-indicator');
  if (!el) return;
  function check() { el.classList.toggle('hidden', window.scrollY > 80); }
  window.addEventListener('scroll', check, { passive: true });
  setTimeout(check, 1200);
  el.addEventListener('click', () => window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' }));
})();
