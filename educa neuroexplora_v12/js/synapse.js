/**
 * NeuroExplora — synapse.js
 * Animación SVG de la sinapsis entre dos neuronas.
 * Fases: impulso → apertura de canales de calcio →
 *        fusión de vesículas → liberación de NT →
 *        unión al receptor → nuevo potencial.
 */

const SYNAPSE_PHASES = [
  { label: 'El impulso nervioso llega al botón presináptico',           duration: 900 },
  { label: 'El calcio (Ca²⁺) entra por canales voltaje-dependientes',  duration: 900 },
  { label: 'Las vesículas sinápticas se fusionan con la membrana',      duration: 1000 },
  { label: 'Los neurotransmisores se liberan a la hendidura sináptica', duration: 1100 },
  { label: 'Los NT se unen a los receptores de la neurona postsináptica', duration: 1000 },
  { label: '¡Nuevo potencial de acción generado! La señal continúa',   duration: 1000 },
];

let synapseRunning = false;
let synapseTimer   = null;
let synapseSpeed   = 1; // se lee de NeuronState si está disponible

function buildSynapseSVG() {
  const svg = document.getElementById('synapse-svg');
  if (!svg) return;

  svg.innerHTML = `
    <defs>
      <radialGradient id="sg-pre"  cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#7ec8f7"/>
        <stop offset="100%" stop-color="#2563eb"/>
      </radialGradient>
      <radialGradient id="sg-post" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </radialGradient>
      <radialGradient id="sg-nt" cx="40%" cy="38%" r="65%">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </radialGradient>
      <filter id="sg-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="sg-glow-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- ═══ NEURONA PRESINÁPTICA (izquierda) ═══ -->
    <g id="pre-neuron">
      <!-- Soma -->
      <ellipse cx="95" cy="130" rx="44" ry="40" fill="url(#sg-pre)" opacity="0.82"/>
      <circle  cx="95" cy="128" r="16" fill="rgba(255,255,255,0.15)"/>
      <circle  cx="95" cy="128" r="7"  fill="rgba(255,255,255,0.25)"/>
      <!-- Núcleo punto -->
      <circle  cx="98" cy="126" r="4"  fill="rgba(79,142,247,0.9)"/>
      <!-- Borde -->
      <ellipse cx="95" cy="130" rx="44" ry="40" fill="none" stroke="#7ec8f7" stroke-width="1.2" opacity="0.4"/>

      <!-- Axón -->
      <rect x="139" y="124" width="130" height="12" rx="6" fill="url(#sg-pre)" opacity="0.75"/>

      <!-- Vaina de mielina segmento 1 -->
      <rect x="148" y="120" width="44" height="20" rx="10" fill="#fbbf24" opacity="0.7"/>
      <!-- Nódulo 1 -->
      <circle cx="196" cy="130" r="4.5" fill="rgba(255,255,255,0.2)"/>
      <!-- Vaina segmento 2 -->
      <rect x="200" y="120" width="44" height="20" rx="10" fill="#fbbf24" opacity="0.7"/>
      <!-- Nódulo 2 -->
      <circle cx="248" cy="130" r="4.5" fill="rgba(255,255,255,0.2)"/>
      <!-- Final del axón hacia el terminal -->
      <rect x="252" y="124" width="18" height="12" rx="5" fill="#4f8ef7" opacity="0.7"/>

      <!-- Etiqueta -->
      <text x="95" y="190" text-anchor="middle" fill="#7ec8f7" font-size="11" font-weight="600"
            font-family="'Outfit',sans-serif">Neurona presináptica</text>
    </g>

    <!-- ═══ BOTÓN PRESINÁPTICO ═══ -->
    <g id="pre-terminal">
      <!-- Bulbo terminal -->
      <circle id="pre-bulb" cx="288" cy="130" r="24" fill="url(#sg-pre)" opacity="0.85"/>
      <circle cx="288" cy="130" r="10" fill="rgba(126,200,247,0.3)"/>
      <!-- Canales de calcio (crucetas) -->
      <g id="ca-channels" opacity="0.4">
        <line x1="278" y1="110" x2="278" y2="118" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="274" y1="114" x2="282" y2="114" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="298" y1="110" x2="298" y2="118" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <line x1="294" y1="114" x2="302" y2="114" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
      </g>
      <!-- Vesículas (puntos dentro del bulbo) -->
      <g id="vesicles-pre">
        <circle id="vp1" cx="280" cy="128" r="5" fill="url(#sg-nt)" opacity="0.85"/>
        <circle id="vp2" cx="292" cy="124" r="5" fill="url(#sg-nt)" opacity="0.85"/>
        <circle id="vp3" cx="288" cy="136" r="5" fill="url(#sg-nt)" opacity="0.85"/>
        <circle id="vp4" cx="298" cy="130" r="4" fill="url(#sg-nt)" opacity="0.75"/>
      </g>
      <text x="288" y="168" text-anchor="middle" fill="#7ec8f7" font-size="9.5" font-weight="600"
            font-family="'Outfit',sans-serif">Botón presináptico</text>
    </g>

    <!-- ═══ HENDIDURA SINÁPTICA ═══ -->
    <g id="synaptic-cleft">
      <!-- Zona de la hendidura -->
      <rect x="314" y="108" width="32" height="44" rx="4"
            fill="rgba(56,189,248,0.04)" stroke="rgba(56,189,248,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="330" y="172" text-anchor="middle" fill="rgba(100,150,200,0.55)"
            font-size="8.5" font-weight="500" font-family="'Outfit',sans-serif">Hendidura</text>
      <text x="330" y="183" text-anchor="middle" fill="rgba(100,150,200,0.55)"
            font-size="8.5" font-weight="500" font-family="'Outfit',sans-serif">sináptica</text>
      <text x="330" y="194" text-anchor="middle" fill="rgba(100,150,200,0.45)"
            font-size="8" font-family="'Outfit',sans-serif">~20 nm</text>

      <!-- Membrana presináptica -->
      <rect x="310" y="106" width="4" height="48" rx="2" fill="#38bdf8" opacity="0.35"/>
      <!-- Membrana postsináptica -->
      <rect x="346" y="106" width="4" height="48" rx="2" fill="#a78bfa" opacity="0.35"/>

      <!-- Neurotransmisores liberados (ocultos inicialmente) -->
      <g id="nt-released" opacity="0">
        <circle id="nt-a" cx="320" cy="118" r="3.5" fill="url(#sg-nt)"/>
        <circle id="nt-b" cx="326" cy="126" r="3.5" fill="url(#sg-nt)"/>
        <circle id="nt-c" cx="322" cy="136" r="3.5" fill="url(#sg-nt)"/>
        <circle id="nt-d" cx="330" cy="142" r="3.5" fill="url(#sg-nt)"/>
        <circle id="nt-e" cx="316" cy="148" r="3"   fill="url(#sg-nt)"/>
        <circle id="nt-f" cx="334" cy="116" r="3"   fill="url(#sg-nt)"/>
      </g>

      <!-- Receptores (ocultos inicialmente, en membrana post) -->
      <g id="receptors" opacity="0.25">
        <rect x="348" y="112" width="8" height="10" rx="3" fill="#a78bfa"/>
        <rect x="348" y="126" width="8" height="10" rx="3" fill="#a78bfa"/>
        <rect x="348" y="140" width="8" height="10" rx="3" fill="#a78bfa"/>
      </g>
    </g>

    <!-- ═══ NEURONA POSTSINÁPTICA (derecha) ═══ -->
    <g id="post-neuron">
      <!-- Dendrita + soma -->
      <rect x="358" y="124" width="40" height="12" rx="6" fill="url(#sg-post)" opacity="0.7"/>
      <!-- Soma -->
      <ellipse id="post-soma" cx="442" cy="130" rx="44" ry="40" fill="url(#sg-post)" opacity="0.55"/>
      <circle  cx="442" cy="128" r="16" fill="rgba(255,255,255,0.08)"/>
      <ellipse cx="442" cy="130" rx="44" ry="40" fill="none" stroke="#a78bfa" stroke-width="1.2" opacity="0.35"/>

      <!-- Axón saliente -->
      <rect x="486" y="124" width="110" height="12" rx="6" fill="url(#sg-post)" opacity="0.5"/>
      <circle cx="600" cy="130" r="5" fill="#a78bfa" opacity="0.4"/>
      <path d="M 600,130 L 614,122 M 600,130 L 614,130 M 600,130 L 614,138"
            stroke="#a78bfa" stroke-width="2" stroke-linecap="round" opacity="0.35"/>

      <!-- Etiqueta -->
      <text x="442" y="190" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600"
            font-family="'Outfit',sans-serif">Neurona postsináptica</text>
    </g>

    <!-- ═══ PARTÍCULA DEL IMPULSO PRESINÁPTICO ═══ -->
    <circle id="syn-impulse" cx="-50" cy="130" r="7" fill="#fff" filter="url(#sg-glow)" opacity="0"/>
    <circle id="syn-impulse-core" cx="-50" cy="130" r="3.5" fill="#4f8ef7" opacity="0"/>

    <!-- ═══ ONDA DE ACTIVACIÓN POSTSINÁPTICA ═══ -->
    <circle id="post-wave" cx="442" cy="130" r="10" fill="none"
            stroke="#a78bfa" stroke-width="2" opacity="0"/>

    <!-- ═══ IONES DE CALCIO ═══ -->
    <g id="calcium-ions" opacity="0">
      <text id="ca1" x="276" y="105" font-size="9" fill="#38bdf8" font-weight="700"
            font-family="'Outfit',sans-serif">Ca²⁺</text>
      <text id="ca2" x="294" y="105" font-size="9" fill="#38bdf8" font-weight="700"
            font-family="'Outfit',sans-serif">Ca²⁺</text>
    </g>

    <!-- ═══ LEYENDA ═══ -->
    <g opacity="0.55">
      <circle cx="36" cy="20" r="5" fill="url(#sg-nt)"/>
      <text x="46" y="24" fill="rgba(200,220,255,0.7)" font-size="9"
            font-family="'Outfit',sans-serif">Neurotransmisor</text>
      <rect x="105" y="15" width="8" height="10" rx="2" fill="#a78bfa"/>
      <text x="118" y="24" fill="rgba(200,220,255,0.7)" font-size="9"
            font-family="'Outfit',sans-serif">Receptor</text>
      <text x="168" y="24" fill="#38bdf8" font-size="9" font-weight="700"
            font-family="'Outfit',sans-serif">Ca²⁺</text>
      <text x="184" y="24" fill="rgba(200,220,255,0.7)" font-size="9"
            font-family="'Outfit',sans-serif">Ion calcio</text>
    </g>
  `;
}

// ── ANIMACIÓN DE LA SINAPSIS ─────────────────────

function runSynapseAnimation() {
  if (synapseRunning) { stopSynapse(); return; }
  synapseRunning = true;

  const btn = document.getElementById('btn-synapse-play');
  if (btn) { btn.textContent = '⏹ Detener'; btn.classList.add('playing'); }

  // Leer velocidad del estado global de la neurona si existe
  const spd = (typeof NeuronState !== 'undefined') ? NeuronState.speedMultiplier : 1;
  const D = ms => Math.round(ms / spd); // helper de duración ajustada

  resetSynapse();

  const steps = [
    // Fase 0: impulso viaja por el axón
    () => {
      setPhaseLabel(0);
      animateImpulseAlong({ x: 140, y: 130 }, { x: 270, y: 130 }, D(700), () => runStep(1));
    },
    // Fase 1: calcio entra
    () => {
      setPhaseLabel(1);
      flashCalcium(D);
      setTimeout(() => runStep(2), D(900));
    },
    // Fase 2: vesículas se mueven hacia la membrana
    () => {
      setPhaseLabel(2);
      moveVesiclesToMembrane(D);
      setTimeout(() => runStep(3), D(1000));
    },
    // Fase 3: NT liberados en la hendidura
    () => {
      setPhaseLabel(3);
      releaseNT(D);
      setTimeout(() => runStep(4), D(1100));
    },
    // Fase 4: NT se unen a receptores
    () => {
      setPhaseLabel(4);
      activateReceptors(D);
      setTimeout(() => runStep(5), D(1000));
    },
    // Fase 5: nuevo potencial de acción
    () => {
      setPhaseLabel(5);
      triggerPostsynaptic(D);
      setTimeout(() => { finishSynapse(); }, D(1200));
    },
  ];

  let currentStep = 0;
  function runStep(n) {
    if (!synapseRunning) return;
    currentStep = n;
    if (steps[n]) steps[n]();
  }

  runStep(0);
}

function animateImpulseAlong(start, end, duration, onDone) {
  const particle = document.getElementById('syn-impulse');
  const core     = document.getElementById('syn-impulse-core');
  if (!particle) return;

  particle.setAttribute('cx', start.x); particle.setAttribute('cy', start.y);
  core.setAttribute('cx', start.x);     core.setAttribute('cy', start.y);
  particle.setAttribute('opacity', '0.95');
  core.setAttribute('opacity', '1');

  const startTime = performance.now();

  function frame(now) {
    if (!synapseRunning) return;
    const t = Math.min(1, (now - startTime) / duration);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const cx = start.x + (end.x - start.x) * ease;
    const cy = start.y + (end.y - start.y) * ease;
    particle.setAttribute('cx', cx); particle.setAttribute('cy', cy);
    core.setAttribute('cx', cx);     core.setAttribute('cy', cy);
    if (t < 1) requestAnimationFrame(frame);
    else {
      particle.setAttribute('opacity', '0');
      core.setAttribute('opacity', '0');
      // Pulso en el bulbo presináptico
      const bulb = document.getElementById('pre-bulb');
      if (bulb) {
        bulb.setAttribute('opacity', '1');
        bulb.style.filter = 'url(#sg-glow)';
        setTimeout(() => { bulb.style.filter = ''; }, 300);
      }
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(frame);
}

function flashCalcium(D) {
  const ca = document.getElementById('calcium-ions');
  const channels = document.getElementById('ca-channels');
  if (!ca || !channels) return;
  channels.setAttribute('opacity', '1');
  ca.setAttribute('opacity', '1');
  // Animar Ca2+ hacia abajo
  let t = 0;
  const dur = D(500);
  const start = performance.now();
  function frame(now) {
    if (!synapseRunning) return;
    const p = Math.min(1, (now - start) / dur);
    const y = 105 + p * 20;
    document.querySelectorAll('#calcium-ions text').forEach(el => {
      el.setAttribute('y', y);
      el.setAttribute('opacity', 1 - p * 0.5);
    });
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function moveVesiclesToMembrane(D) {
  const vps = ['vp1','vp2','vp3','vp4'];
  const targets = [
    {x: 278, y: 118}, {x: 290, y: 114}, {x: 285, y: 125}, {x: 296, y: 120}
  ];
  vps.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const origX = parseFloat(el.getAttribute('cx'));
    const origY = parseFloat(el.getAttribute('cy'));
    const tx = targets[i].x, ty = targets[i].y;
    const start = performance.now();
    const dur = D(500) + i * D(80);
    function frame(now) {
      if (!synapseRunning) return;
      const p = Math.min(1, (now - start) / dur);
      const e = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      el.setAttribute('cx', origX + (tx - origX) * e);
      el.setAttribute('cy', origY + (ty - origY) * e);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

function releaseNT(D) {
  const ntGroup = document.getElementById('nt-released');
  if (!ntGroup) return;
  ntGroup.setAttribute('opacity', '1');
  // Animar NT hacia la derecha
  const nts = ['nt-a','nt-b','nt-c','nt-d','nt-e','nt-f'];
  nts.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const origX = parseFloat(el.getAttribute('cx'));
    const dur = D(600);
    const delay = i * D(60);
    setTimeout(() => {
      const start = performance.now();
      function frame(now) {
        if (!synapseRunning) return;
        const p = Math.min(1, (now - start) / dur);
        el.setAttribute('cx', origX + p * 22);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }, delay);
  });
}

function activateReceptors(D) {
  const receptors = document.getElementById('receptors');
  if (receptors) {
    receptors.setAttribute('opacity', '1');
    receptors.querySelectorAll('rect').forEach((r, i) => {
      setTimeout(() => {
        r.setAttribute('fill', '#fbbf24');
        r.style.filter = 'url(#sg-glow-soft)';
      }, i * D(150));
    });
  }
}

function triggerPostsynaptic(D) {
  const soma  = document.getElementById('post-soma');
  const wave  = document.getElementById('post-wave');
  if (!soma || !wave) return;

  soma.setAttribute('opacity', '0.88');
  soma.style.filter = 'url(#sg-glow)';
  wave.setAttribute('opacity', '0.8');

  // Expandir la onda
  const start = performance.now();
  const dur = D(800);
  function frame(now) {
    if (!synapseRunning) return;
    const p = Math.min(1, (now - start) / dur);
    wave.setAttribute('r', 10 + p * 55);
    wave.setAttribute('opacity', 0.8 * (1 - p));
    if (p < 1) requestAnimationFrame(frame);
    else wave.setAttribute('opacity', '0');
  }
  requestAnimationFrame(frame);
}

function setPhaseLabel(index) {
  const el = document.getElementById('synapse-phase-label');
  if (!el || !SYNAPSE_PHASES[index]) return;
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = `Fase ${index + 1}: ${SYNAPSE_PHASES[index].label}`;
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '1';
  }, 80);
}

function resetSynapse() {
  // Ocultar NT
  const ntg = document.getElementById('nt-released');
  if (ntg) ntg.setAttribute('opacity', '0');
  // Restaurar vesículas
  const vData = [{id:'vp1',cx:280,cy:128},{id:'vp2',cx:292,cy:124},{id:'vp3',cx:288,cy:136},{id:'vp4',cx:298,cy:130}];
  vData.forEach(v => {
    const el = document.getElementById(v.id);
    if (el) { el.setAttribute('cx', v.cx); el.setAttribute('cy', v.cy); }
  });
  // Receptores
  const recs = document.getElementById('receptors');
  if (recs) {
    recs.setAttribute('opacity', '0.25');
    recs.querySelectorAll('rect').forEach(r => { r.setAttribute('fill', '#a78bfa'); r.style.filter = ''; });
  }
  // Calcio
  const cag = document.getElementById('calcium-ions');
  if (cag) {
    cag.setAttribute('opacity', '0');
    cag.querySelectorAll('text').forEach(t => { t.setAttribute('y', '105'); t.setAttribute('opacity', '1'); });
  }
  const ch = document.getElementById('ca-channels');
  if (ch) ch.setAttribute('opacity', '0.4');
  // Post-soma
  const soma = document.getElementById('post-soma');
  if (soma) { soma.setAttribute('opacity', '0.55'); soma.style.filter = ''; }
  // Partícula
  const p1 = document.getElementById('syn-impulse');
  const p2 = document.getElementById('syn-impulse-core');
  if (p1) p1.setAttribute('opacity', '0');
  if (p2) p2.setAttribute('opacity', '0');
  // NT coords reset
  const ntCoords = [{id:'nt-a',cx:320,cy:118},{id:'nt-b',cx:326,cy:126},{id:'nt-c',cx:322,cy:136},{id:'nt-d',cx:330,cy:142},{id:'nt-e',cx:316,cy:148},{id:'nt-f',cx:334,cy:116}];
  ntCoords.forEach(n => {
    const el = document.getElementById(n.id);
    if (el) { el.setAttribute('cx', n.cx); el.setAttribute('cy', n.cy); }
  });
}

function stopSynapse() {
  if (synapseTimer) clearTimeout(synapseTimer);
  synapseRunning = false;
  const btn = document.getElementById('btn-synapse-play');
  if (btn) { btn.textContent = '▶ Ver la sinapsis'; btn.classList.remove('playing'); }
  const lbl = document.getElementById('synapse-phase-label');
  if (lbl) lbl.textContent = 'Pulsa el botón para iniciar la animación';
}

function finishSynapse() {
  synapseRunning = false;
  const btn = document.getElementById('btn-synapse-play');
  if (btn) { btn.textContent = '↺ Repetir'; btn.classList.remove('playing'); }
  const lbl = document.getElementById('synapse-phase-label');
  if (lbl) lbl.textContent = '✓ Sinapsis completa — la señal continuará por la siguiente neurona';
}

// ── INICIALIZACIÓN ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildSynapseSVG();

  document.getElementById('btn-synapse-play')?.addEventListener('click', () => {
    if (synapseRunning) { stopSynapse(); }
    else { resetSynapse(); runSynapseAnimation(); }
  });
}, { once: true });
