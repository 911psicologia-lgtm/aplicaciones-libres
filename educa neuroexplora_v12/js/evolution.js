/**
 * NeuroExplora — evolution.js  v2.0
 * Línea de tiempo con 7 etapas, rama Neanderthal,
 * debate cerebro triúnico, datos globales y navegación mejorada.
 */

const EvoState = {
  activeIndex: 0,
  isAnimating: false,
  showTriune: false,
  showBranch: false,
};

// ── CONSTRUCCIÓN DE LA LÍNEA DE TIEMPO ─────────────────────────

function buildTimeline() {
  const track = document.getElementById('timeline-track');
  track.innerHTML = '';

  EVOLUTION_STAGES.forEach((stage, i) => {
    const item = document.createElement('div');
    item.className = 'tl-item' + (i === 0 ? ' active' : '');
    item.setAttribute('data-index', i);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'tab');
    item.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    item.style.setProperty('--stage-color', stage.color);

    item.innerHTML = `
      <div class="tl-node">
        <div class="tl-dot"></div>
        <div class="tl-pulse"></div>
      </div>
      <div class="tl-card">
        <div class="tl-number">${stage.number}</div>
        <img class="tl-brain-img" src="${stage.svgAsset}" alt="${stage.name}" loading="lazy">
        <div class="tl-card-body">
          <p class="tl-period">${formatPeriod(stage.period)}</p>
          <h3 class="tl-name">${stage.name}</h3>
          <p class="tl-sub">${stage.subtitle}</p>
        </div>
      </div>
      ${i < EVOLUTION_STAGES.length - 1 ? '<div class="tl-arrow-sep">→</div>' : ''}
    `;

    item.addEventListener('click', () => selectStage(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStage(i); }
    });
    track.appendChild(item);
  });

  // Agregar botón de rama Neanderthal al final
  const branchBtn = document.createElement('button');
  branchBtn.className = 'tl-branch-btn';
  branchBtn.id = 'btn-show-branch';
  branchBtn.innerHTML = `<span>🌿</span> Ver rama Neanderthal / <em>H. erectus</em>`;
  branchBtn.addEventListener('click', toggleBranch);
  track.appendChild(branchBtn);
}

function formatPeriod(str) {
  // Acortar para la tarjeta
  return str.replace('Hace ~', '~').replace(' millones de años', ' Ma').replace(' de años', '');
}

// ── RAMA LATERAL NEANDERTHAL ────────────────────────────────────

function toggleBranch() {
  EvoState.showBranch = !EvoState.showBranch;
  const panel = document.getElementById('branch-panel');
  const btn   = document.getElementById('btn-show-branch');

  if (EvoState.showBranch) {
    panel.classList.remove('hidden');
    panel.innerHTML = renderBranchContent();
    btn.innerHTML = `<span>✕</span> Cerrar rama`;
  } else {
    panel.classList.add('hidden');
    btn.innerHTML = `<span>🌿</span> Ver rama Neanderthal / <em>H. erectus</em>`;
  }
}

function renderBranchContent() {
  return `
    <div class="branch-header">
      <h3 class="branch-title">🌿 Ramas evolutivas del género <em>Homo</em></h3>
      <p class="branch-subtitle">El camino a <em>Homo sapiens</em> no fue lineal — hubo parientes que coexistieron</p>
    </div>
    <div class="branch-grid">
      ${BRANCH_STAGES.map(b => `
        <div class="branch-card" style="--bc:${b.color}">
          <div class="branch-card-head">
            <span class="branch-badge" style="background:${b.color}22;border-color:${b.color}44;color:${b.color}">${b.period}</span>
            <h4 class="branch-name" style="color:${b.color}">${b.name}</h4>
            <p class="branch-volume">🧠 ${b.brainVolume}</p>
          </div>
          <p class="branch-desc">${b.description}</p>
          <div class="branch-fact">
            <span class="branch-fact-icon">💡</span>
            <p>${b.funFact}</p>
          </div>
          ${b.interbreedingNote ? `
            <div class="branch-cross">
              <span>🔀</span>
              <p>${b.interbreedingNote}</p>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    <div class="branch-diagram">
      <p class="branch-diagram-label">Diagrama simplificado del árbol <em>Homo</em></p>
      ${renderHominidTree()}
    </div>
  `;
}

function renderHominidTree() {
  return `
    <div class="htree">
      <div class="htree-row">
        <div class="htree-node hn-ancestor">
          <span>🐒</span>
          <strong>Australopithecus</strong>
          <small>~4–2 Ma</small>
        </div>
      </div>
      <div class="htree-connector-v"></div>
      <div class="htree-row">
        <div class="htree-node hn-habilis">
          <span>🪨</span>
          <strong>H. habilis</strong>
          <small>~2.5–1.5 Ma</small>
        </div>
      </div>
      <div class="htree-connector-v"></div>
      <div class="htree-fork">
        <div class="htree-branch-line"></div>
        <div class="htree-fork-nodes">
          <div class="htree-node hn-erectus">
            <span>🔥</span>
            <strong>H. erectus</strong>
            <small>~1.8 Ma–300 Ka</small>
            <small class="hn-extinct">† extinto</small>
          </div>
          <div class="htree-fork-arrow">↓</div>
          <div class="htree-node hn-neanderthal" style="position:relative">
            <span>🏔️</span>
            <strong>H. neanderthalensis</strong>
            <small>~400–40 Ka</small>
            <small class="hn-extinct">† extinto</small>
            <div class="hn-cross-badge">🔀 1-4% ADN compartido</div>
          </div>
        </div>
        <div class="htree-fork-main">
          <div class="htree-node hn-sapiens">
            <span>🧑</span>
            <strong>H. sapiens</strong>
            <small>~300 Ka — hoy</small>
            <small class="hn-us">← nosotros</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── PANEL DE DEBATE TRIÚNICO ────────────────────────────────────

// ── DEBATE CIENTÍFICO — dinámico por etapa ──────────────────────

function renderStageDebate(stage) {
  const section = document.getElementById('triune-section');
  if (!section || !stage.debate) { if (section) section.innerHTML = ''; return; }

  const d = stage.debate;
  section.innerHTML = `
    <div class="triune-header">
      <div class="triune-badge">🔬 Debate científico — Etapa ${stage.number}</div>
      <h3 class="triune-title">${d.title}</h3>
      <button class="triune-toggle-btn" id="btn-triune-toggle">
        Leer el debate ▼
      </button>
    </div>
    <div class="triune-body hidden" id="triune-body">
      <div class="triune-block">
        <p class="triune-text">${d.content}</p>
      </div>
      <div class="triune-verdict">
        <span class="triune-verdict-icon">⚖️</span>
        <strong>${d.verdict}</strong>
      </div>
    </div>
  `;

  document.getElementById('btn-triune-toggle').addEventListener('click', () => {
    const body = document.getElementById('triune-body');
    const btn  = document.getElementById('btn-triune-toggle');
    const hidden = body.classList.toggle('hidden');
    btn.textContent = hidden ? 'Leer el debate ▼' : 'Cerrar ▲';
  });
}

// ── DATOS CURIOSOS — dinámicos por etapa ───────────────────────

function renderStageCuriosities(stage) {
  const wrap = document.getElementById('global-facts');
  if (!wrap || !stage.stageCuriosities) { if (wrap) wrap.innerHTML = ''; return; }

  wrap.innerHTML = `
    <p class="gf-label">Datos curiosos — ${stage.name}</p>
    <div class="gf-grid">
      ${stage.stageCuriosities.map(f => `
        <div class="gf-card">
          <span class="gf-icon">${f.icon}</span>
          <p class="gf-text">${f.text}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ── SELECCIÓN DE ETAPA ──────────────────────────────────────────

function selectStage(index) {
  if (EvoState.isAnimating || index === EvoState.activeIndex) return;
  EvoState.isAnimating = true;

  const prev = EvoState.activeIndex;
  EvoState.activeIndex = index;

  document.querySelectorAll('.tl-item').forEach((item, i) => {
    item.classList.toggle('active',   i === index);
    item.classList.toggle('visited',  i < index);
    item.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });

  updateProgress(index);
  animatePanel(prev, index, () => { EvoState.isAnimating = false; });
  updateNavButtons(index);

  document.querySelector('.tl-item.active')
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function updateProgress(index) {
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = `${(index / (EVOLUTION_STAGES.length - 1)) * 100}%`;
}

function updateNavButtons(index) {
  const prev    = document.getElementById('btn-stage-prev');
  const next    = document.getElementById('btn-stage-next');
  const counter = document.getElementById('stage-counter');
  if (prev)    prev.disabled    = index === 0;
  if (next)    next.disabled    = index === EVOLUTION_STAGES.length - 1;
  if (counter) counter.textContent = `${index + 1} / ${EVOLUTION_STAGES.length}`;
}

// ── ANIMACIÓN DEL PANEL ─────────────────────────────────────────

function animatePanel(prevIdx, nextIdx, onComplete) {
  const panel = document.getElementById('stage-panel');
  const dir   = nextIdx > prevIdx ? 1 : -1;

  panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  panel.style.opacity    = '0';
  panel.style.transform  = `translateX(${-dir * 28}px)`;

  setTimeout(() => {
    const stage = EVOLUTION_STAGES[nextIdx];
    renderPanel(stage);
    renderStageDebate(stage);
    renderStageCuriosities(stage);
    panel.style.transition = 'none';
    panel.style.transform  = `translateX(${dir * 28}px)`;
    panel.style.opacity    = '0';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      panel.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      panel.style.opacity    = '1';
      panel.style.transform  = 'translateX(0)';
      setTimeout(onComplete, 300);
    }));
  }, 220);
}

// ── RENDER DEL PANEL ────────────────────────────────────────────

function renderPanel(stage) {
  const panel = document.getElementById('stage-panel');

  const animals = stage.animals.map(a => `
    <div class="animal-card">
      <span class="animal-emoji">${a.emoji}</span>
      <div>
        <strong class="animal-name">${a.name}</strong>
        <span class="animal-note">${a.note}</span>
      </div>
    </div>`).join('');

  const structs = stage.structures.map(s =>
    `<span class="struct-pill" style="border-color:${stage.color}44;color:${stage.color}">${s}</span>`
  ).join('');

  const caps = stage.capabilities.map(c => `
    <div class="cap-card" style="--cap-color:${stage.color}">
      <span class="cap-icon">${c.icon}</span>
      <div class="cap-body">
        <strong class="cap-label">${c.label}</strong>
        <p class="cap-desc">${c.desc}</p>
      </div>
    </div>`).join('');

  const facts = stage.funFacts.map((f, i) => `
    <div class="fact-row">
      <div class="fact-row-num" style="background:${stage.color}">${i + 1}</div>
      <div class="fact-row-body">
        <span class="fact-row-icon">${f.icon}</span>
        <p class="fact-row-text">${f.text}</p>
      </div>
    </div>`).join('');

  const triuneBlock = stage.triuneNote ? `
    <div class="sp-section">
      <p class="sp-section-label">⚗️ Debate científico relevante</p>
      <div class="sp-triune-note" style="border-left-color:${stage.color}">
        <strong>${stage.triuneNote.title}</strong>
        <p>${stage.triuneNote.content}</p>
      </div>
    </div>` : '';

  panel.innerHTML = `
    <div class="sp-header" style="--sc:${stage.color};--scd:${stage.colorDark}">
      <div class="sp-meta">
        <span class="sp-era">${stage.era}</span>
        <span class="sp-period">${stage.period}</span>
      </div>
      <div class="sp-title-row">
        <div class="sp-num-badge" style="background:${stage.color}">${stage.number}</div>
        <div>
          <h2 class="sp-title">${stage.name}</h2>
          <p class="sp-subtitle">${stage.subtitle}</p>
        </div>
      </div>
      <div class="sp-color-bar" style="background:linear-gradient(90deg,${stage.color},${stage.colorDark})"></div>
    </div>

    <div class="sp-body">
      <div class="sp-col-left">
        <div class="sp-brain-wrap" style="--sc:${stage.color}">
          <img src="${stage.svgAsset}" alt="Cerebro etapa ${stage.number}" class="sp-brain-img">
          <div class="sp-brain-label">
            <span class="sp-volume-badge">Volumen: ${stage.brainVolume}</span>
          </div>
        </div>

        ${(typeof EVO_REAL_IMAGES !== 'undefined' && EVO_REAL_IMAGES[stage.id]) ? `
        <div class="real-img-wrap sp-real-img">
          <span class="real-img-badge">📷 Real</span>
          <img src="${EVO_REAL_IMAGES[stage.id].src}"
               alt="${EVO_REAL_IMAGES[stage.id].alt}" loading="lazy">
          <p class="real-img-caption">${EVO_REAL_IMAGES[stage.id].caption}</p>
        </div>` : ''}
          </div>
        </div>
        <div class="sp-section">
          <p class="sp-section-label">Estructuras presentes</p>
          <div class="sp-structs">${structs}</div>
        </div>
        <div class="sp-kids-box" style="border-left-color:${stage.color}">
          <span class="sp-kids-icon">🧒</span>
          <p class="sp-kids-text">${stage.childExplanation}</p>
        </div>
      </div>

      <div class="sp-col-right">
        <div class="sp-section">
          <p class="sp-section-label">Capacidades que emergen</p>
          <div class="sp-capabilities">${caps}</div>
        </div>
        <div class="sp-section">
          <p class="sp-section-label">Animales representativos</p>
          <div class="sp-animals">${animals}</div>
        </div>
        <div class="sp-section">
          <p class="sp-section-label">¿Sabías que?</p>
          <div class="sp-facts">${facts}</div>
        </div>
        ${triuneBlock}
      </div>
    </div>
  `;
}

// ── ESCALA TEMPORAL ─────────────────────────────────────────────

function buildTimeScale() {
  const scale = document.getElementById('time-scale');
  if (!scale) return;
  const marks = [
    { label: '520 Ma', pos: 0 },
    { label: '310 Ma', pos: 36 },
    { label: '220 Ma', pos: 57 },
    { label: '55 Ma',  pos: 78 },
    { label: 'Hoy',    pos: 100 },
  ];
  marks.forEach(m => {
    const tick = document.createElement('div');
    tick.className = 'ts-tick';
    tick.style.left = `${m.pos}%`;
    tick.innerHTML = `<div class="ts-line"></div><span class="ts-label">${m.label}</span>`;
    scale.appendChild(tick);
  });
}

// ── ESTRELLAS ────────────────────────────────────────────────────

function initStars() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.1 + 0.2,
    a: Math.random() * 0.5 + 0.08,
    da: (Math.random() - 0.5) * 0.0025,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.da;
      if (s.a > 0.65) s.da = -Math.abs(s.da);
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

// ── INICIALIZACIÓN ───────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initStars();
  buildTimeline();
  buildTimeScale();
  const first = EVOLUTION_STAGES[0];
  renderPanel(first);
  renderStageDebate(first);
  renderStageCuriosities(first);
  updateProgress(0);
  updateNavButtons(0);

  document.getElementById('btn-stage-prev').addEventListener('click', () => {
    if (EvoState.activeIndex > 0) selectStage(EvoState.activeIndex - 1);
  });
  document.getElementById('btn-stage-next').addEventListener('click', () => {
    if (EvoState.activeIndex < EVOLUTION_STAGES.length - 1) selectStage(EvoState.activeIndex + 1);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'  && EvoState.activeIndex > 0)                         selectStage(EvoState.activeIndex - 1);
    if (e.key === 'ArrowRight' && EvoState.activeIndex < EVOLUTION_STAGES.length-1) selectStage(EvoState.activeIndex + 1);
  });
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
