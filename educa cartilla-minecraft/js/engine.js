// ═══════════════════════════════════════════════════════
//   SAI QUEST — Motor de Juego (Lógica)
// ═══════════════════════════════════════════════════════
const $ = id => document.getElementById(id);

// ── ESTADO GLOBAL ──
let P = null;
let G = {};
let _nav = 0;
let _bio = null;
let _combo = 0;
let _siv = null;
let _ss = Date.now();
let _comboTimer = null;
let _diffLevel = 'basico';
let _currentCertDiff = 'basico';

// ── PROGRESIÓN PRESERVATIVA v3.8.9 ──
const CORE_WORLD_IDS = ['ingles', 'lenguaje', 'matematicas', 'ciencias', 'sociales'];
const NEW_WORLD_IDS = ['geometria', 'lectura_critica', 'fisica_quimica', 'frances', 'espiritualidad'];

// ── JEFE FINAL — estado global ──
let _currentBossBid = '';
let _currentBossDiff = '';

// ── NIVELES ──
function lvlInfo(xp) {
  let cur = LVS[0];
  for (let i = LVS.length - 1; i >= 0; i--) {
    if (xp >= LVS[i].xp) { cur = LVS[i]; break; }
  }
  const nxt = LVS.find(l => l.xp > xp) || LVS[LVS.length - 1];
  const pct = nxt.xp > cur.xp ? Math.min(100, Math.round((xp - cur.xp) / (nxt.xp - cur.xp) * 100)) : 100;
  return { cur, nxt, pct };
}

// ── STORAGE ──
function saveP() { localStorage.setItem('saiq_v3', JSON.stringify(P)); }
function loadP() {
  try {
    const r = localStorage.getItem('saiq_v3');
    if (r) { P = JSON.parse(r); return true; }
  } catch(e) {}
  return false;
}

// ── BACKUP / RESTAURACIÓN JSON (Perfil) ──
function safeFileName(value) {
  return (value || 'heroe')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'heroe';
}

function escapeHTML(value) {
  return (value == null ? '' : String(value))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeProfileName(value) {
  return (value || 'Héroe')
    .toString()
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40) || 'Héroe';
}

function sanitizeAvatar(value) {
  const v = (value || '🧑‍🦱').toString().replace(/[<>]/g, '').trim();
  return v.slice(0, 12) || '🧑‍🦱';
}

function downloadProgressJSON() {
  if (!P) { toast('⚠️ No hay progreso para descargar'); return; }
  const synced = syncCertificates();
  if (synced.length) saveP();
  const payload = {
    app: 'SAI Quest',
    type: 'saiq_progress_backup',
    backupVersion: '3.9.2',
    storageKey: 'saiq_v3',
    exportedAt: new Date().toISOString(),
    state: P
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sai_quest_avance_' + safeFileName(P.name) + '_' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('⬇️ Copia JSON descargada');
}

function triggerProgressJSONLoad() {
  const input = $('progressJsonInput');
  if (!input) { toast('⚠️ No se encontró el cargador JSON'); return; }
  input.value = '';
  input.click();
}

function normalizeImportedProgress(raw) {
  const candidate = raw && raw.state ? raw.state : raw;
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  if (!candidate.prog || typeof candidate.prog !== 'object') return null;

  const next = JSON.parse(JSON.stringify(candidate));
  next.name = sanitizeProfileName(next.name);
  next.av = sanitizeAvatar(next.av);

  ['xp','coins','streak','tm','tc','pm_min','pm','mc','ed','bc','surv','refM'].forEach(k => {
    next[k] = Number.isFinite(Number(next[k])) ? Number(next[k]) : 0;
  });
  next.level = Number.isFinite(Number(next.level)) ? Number(next.level) : 1;

  if (!Array.isArray(next.badges)) next.badges = [];
  if (!next.best || typeof next.best !== 'object') next.best = {};
  if (!next.prog || typeof next.prog !== 'object') next.prog = {};
  if (!next.bossDefeated || typeof next.bossDefeated !== 'object') next.bossDefeated = {};
  if (!next.certs || typeof next.certs !== 'object') next.certs = {};

  return next;
}

function loadProgressJSON(event) {
  const input = event && event.target ? event.target : $('progressJsonInput');
  const file = input && input.files && input.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.json')) {
    toast('⚠️ Selecciona un archivo .json');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const next = normalizeImportedProgress(parsed);
      if (!next) {
        toast('⚠️ Este JSON no parece ser un avance válido de SAI Quest', 4200);
        return;
      }

      const msg = 'Vas a reemplazar el avance actual de este dispositivo por el archivo de "' + next.name + '".\n\nAntes de cargarlo, conviene haber descargado una copia del avance actual.\n\n¿Continuar?';
      if (!confirm(msg)) {
        toast('Carga cancelada');
        return;
      }

      P = next;
      migrateP();
      saveP();
      startST();
      updTop();
      renderProfile();
      _nav = 1;
      document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === 1));
      show('profileScreen');
      toast('✅ Avance JSON cargado correctamente', 3500);
    } catch(e) {
      toast('⚠️ No se pudo leer el JSON. Revisa el archivo.', 4200);
    } finally {
      if (input) input.value = '';
    }
  };
  reader.onerror = () => {
    toast('⚠️ No se pudo abrir el archivo JSON');
    if (input) input.value = '';
  };
  reader.readAsText(file, 'utf-8');
}


// ── MIGRACIÓN DE GUARDADO (compatibilidad con versiones anteriores) ──
function migrateP() {
  if (!P) return;
  if (!P.prog) P.prog = {};
  if (!P.badges) P.badges = [];
  if (!P.bossDefeated) P.bossDefeated = {};
  if (!P.certs) P.certs = {};
  // Migrate old certificateEarned to new certs.basico
  if (P.certificateEarned && !P.certs.basico) P.certs.basico = true;
  syncCertificates();
}

// ── OBTENER PREGUNTAS SEGÚN DIFICULTAD ──
function getQD(bid, diff) {
  // Mundo de entrenamiento: pool mixto aleatorio
  if (bid === 'entrenamiento') return TRAINING_QS || [];
  // Taller de Aritmética: siempre de QD_TALLER
  if (bid === 'taller_aritmetica') return (typeof QD_TALLER !== 'undefined' && QD_TALLER.taller_aritmetica) || [];
  // IE ahora soporta todos los niveles
  if (bid === 'inteligencia_emocional') {
    if (diff === 'supercomplejo' && typeof QD_SUPERCOMPLEJO !== 'undefined' && QD_SUPERCOMPLEJO.inteligencia_emocional) return QD_SUPERCOMPLEJO.inteligencia_emocional;
    if (diff === 'complejo' && QD_COMPLEJO.inteligencia_emocional) return QD_COMPLEJO.inteligencia_emocional;
    if (diff === 'medio' && QD_MEDIO.inteligencia_emocional) return QD_MEDIO.inteligencia_emocional;
    return QD_COMPLEJO.inteligencia_emocional || []; // basico usa complejo (desafío apropiado)
  }
  if (diff === 'supercomplejo' && typeof QD_SUPERCOMPLEJO !== 'undefined' && QD_SUPERCOMPLEJO[bid]) return QD_SUPERCOMPLEJO[bid];
  if (diff === 'complejo' && QD_COMPLEJO[bid]) return QD_COMPLEJO[bid];
  if (diff === 'medio' && QD_MEDIO[bid]) return QD_MEDIO[bid];
  // Preservativo v3.8.9: algunos mundos nuevos básicos quedaron cargados como propiedades extra de DIFF_MULT.
  // No se mueve el banco de datos para evitar daños; se recupera aquí como fuente básica válida.
  if (QD && QD[bid]) return QD[bid];
  if (typeof DIFF_MULT !== 'undefined' && Array.isArray(DIFF_MULT[bid])) return DIFF_MULT[bid];
  return [];
}

// ── CLAVE DE PROGRESO SEGÚN DIFICULTAD ──
function getProgKey(bid, mIdx, diff, isReinforcement) {
  if (isReinforcement) return bid + '_ref';
  if (bid === 'entrenamiento') return bid + '_train_' + mIdx;
  if (diff === 'basico') return bid + '_' + mIdx;
  return bid + '_' + diff + '_' + mIdx;
}

// ── PROGRESO DE BIOMA (con dificultad) ──
function bioProgress(bid, diff) {
  if (diff === 'supercomplejo') {
    let d = 0;
    for (let i = 0; i < 5; i++) {
      if (P.prog[bid + '_supercomplejo_' + i]?.done) d++;
    }
    return { d, t: 5 };
  }
  if (diff === 'complejo') {
    let d = 0;
    for (let i = 0; i < 5; i++) {
      if (P.prog[bid + '_complejo_' + i]?.done) d++; 
    }
    return { d, t: 5 };
  }
  if (diff === 'medio') {
    let d = 0;
    for (let i = 0; i < 5; i++) {
      if (P.prog[bid + '_medio_' + i]?.done) d++;
    }
    return { d, t: 5 };
  }
  // basico + IE
  if (bid === 'inteligencia_emocional') {
    let d = 0;
    for (let i = 0; i < 5; i++) {
      if (P.prog[bid + '_' + i]?.done) d++;
    }
    return { d, t: 5 };
  }
  let d = 0;
  for (let i = 0; i < 5; i++) {
    if (P.prog[bid + '_' + i]?.done) d++;
  }
  return { d, t: 5 };
}

function bioStars(bid, diff) {
  if (diff === 'supercomplejo') {
    let t = 0;
    for (let i = 0; i < 5; i++) t += (P.prog[bid + '_supercomplejo_' + i]?.stars || 0);
    return t;
  }
  if (diff === 'complejo') {
    let t = 0;
    for (let i = 0; i < 5; i++) t += (P.prog[bid + '_complejo_' + i]?.stars || 0);
    return t;
  }
  if (diff === 'medio') {
    let t = 0;
    for (let i = 0; i < 5; i++) t += (P.prog[bid + '_medio_' + i]?.stars || 0);
    return t;
  }
  let t = 0;
  for (let i = 0; i < 5; i++) t += (P.prog[bid + '_' + i]?.stars || 0);
  return t;
}

// ── VERIFICAR DESBLOQUEO DE DIFICULTAD ──
function isDiffUnlocked(bid, diff) {
  if (diff === 'basico') return true;
  // Taller de Aritmética: solo nivel básico disponible
  if (bid === 'taller_aritmetica') return diff === 'basico';
  if (diff === 'medio') {
    let done = 0;
    for (let i = 0; i < 4; i++) {
      if (P.prog[bid + '_' + i]?.done) done++;
    }
    return done >= 2;
  }
  if (diff === 'complejo') {
    let done = 0;
    for (let i = 0; i < 4; i++) {
      if (P.prog[bid + '_medio_' + i]?.done) done++;
    }
    return done >= 4;
  }
  if (diff === 'supercomplejo') {
    // Solo mundos que tienen QD_SUPERCOMPLEJO pueden acceder al nivel
    const hasSC = typeof QD_SUPERCOMPLEJO !== 'undefined' && QD_SUPERCOMPLEJO[bid];
    if (!hasSC) return false;
    let done = 0;
    for (let i = 0; i < 4; i++) {
      if (P.prog[bid + '_complejo_' + i]?.done) done++;
    }
    return done >= 4;
  }
  return false;
}

// ── VERIFICAR DESBLOQUEO DEL VALLE DE EMOCIONES ──
function isIEUnlocked() {
  if (!P) return false;
  const worlds = CORE_WORLD_IDS;
  return worlds.every(bid => {
    // Se desbloquea cuando al menos 4 misiones básicas están completas en todos los mundos
    let done = 0;
    for (let i = 0; i < 4; i++) {
      if (P.prog[bid + '_' + i]?.done) done++;
    }
    return done >= 4;
  });
}

// ── DESBLOQUEO DE NUEVOS MUNDOS ──
// v3.9.0: criterio corregido. En esta app, un nivel de mundo se considera
// completo cuando el estudiante termina las 4 misiones principales.
// La misión 5 / MODO EXTRA suma práctica y estrellas, pero no bloquea certificados
// ni el acceso a los nuevos mundos. Esto preserva la lógica histórica usada por P.bc,
// evaluaciones y desbloqueo de dificultad.
function getLevelDoneCount(bid, diff) {
  if (!P || !P.prog) return 0;
  const prefix = diff === 'basico' ? bid + '_' : bid + '_' + diff + '_';
  let done = 0;
  for (let i = 0; i < 5; i++) {
    if (P.prog[prefix + i]?.done) done++;
  }
  return done;
}

function isWorldLevelComplete(bid, diff, requireExtra) {
  if (!P || !P.prog) return false;
  const required = requireExtra ? 5 : 4;
  return getLevelDoneCount(bid, diff) >= required;
}

function areNewWorldsUnlocked() {
  if (!P) return false;
  if (P.certs && P.certs.basico && P.certs.medio) return true;
  return CORE_WORLD_IDS.every(bid =>
    isWorldLevelComplete(bid, 'basico', false) && isWorldLevelComplete(bid, 'medio', false)
  );
}

function hasNewWorldProgress(bid) {
  if (!P || !P.prog) return false;
  return Object.keys(P.prog).some(k => k.startsWith(bid + '_') && P.prog[k]?.done);
}

// ── VERIFICAR CERTIFICADO POR NIVEL ──
function checkCertLevel(diff) {
  if (!P) return false;
  if (!P.certs) P.certs = {};
  if (P.certs[diff]) return false; // ya ganado
  return CORE_WORLD_IDS.every(bid => isWorldLevelComplete(bid, diff));
}

function syncCertificates(newBadges) {
  if (!P) return [];
  if (!P.prog) P.prog = {};
  if (!P.certs) P.certs = {};
  if (!P.badges) P.badges = [];

  const certDiffs = ['basico','medio','complejo','supercomplejo'];
  const certBadgeIds = {
    basico: 'cert_basico',
    medio: 'cert_medio',
    complejo: 'cert_complejo',
    supercomplejo: 'cert_super'
  };
  const unlocked = [];

  certDiffs.forEach(diff => {
    if (!P.certs[diff] && checkCertLevel(diff)) {
      P.certs[diff] = true;
      unlocked.push(diff);
      const badgeId = certBadgeIds[diff];
      if (badgeId && !P.badges.includes(badgeId)) {
        P.badges.push(badgeId);
        if (Array.isArray(newBadges)) {
          const badge = BADGES.find(b => b.id === badgeId);
          if (badge) newBadges.push(badge);
        }
      }
    }
  });

  if (Object.values(P.certs).some(Boolean)) P.certificateEarned = true;
  return unlocked;
}

// Retrocompat: checkCertificate sigue funcionando
function checkCertificate() {
  return checkCertLevel('basico');
}

// ── VERIFICAR DESBLOQUEO DE EVALUACIÓN ──
function checkEvalUnlock(bid, diff) {
  if (!P || bid === 'entrenamiento') return false;
  const maxMissions = diff === 'medio' ? 4 : 5;
  let done = 0;
  for (let i = 0; i < maxMissions; i++) {
    const key = diff === 'basico' ? bid + '_' + i : bid + '_' + diff + '_' + i;
    if (P.prog[key]?.done) done++;
  }
  return done >= maxMissions;
}

// ── INICIAR EVALUACIÓN ──
function startEval(bid, diff) {
  const all = getQD(bid, diff);
  if (!all || all.length < 5) return toast('⚠️ No hay preguntas para la evaluación');
  const qs = shuffleArray([...all]).slice(0, 10);
  _bio = BIOMES.find(b => b.id === bid);
  G = {
    bid, mIdx: -2, qs, cur: 0, ok: 0, start: Date.now(), elapsed: 0,
    ans: false, iv: null, lives: 3, failed: [], isReinforcement: false,
    isBoss: false, isEval: true, evalDiff: diff
  };
  _combo = 0;
  hideCombo();
  closeModal('evalModal');
  showMissionFlash('📝 Evaluación: ' + (_bio ? _bio.n.replace('\n', ' ') : bid));
  renderQ();
  show('gameScreen');
  if (G.iv) clearInterval(G.iv);
  G.iv = setInterval(() => {
    G.elapsed = Math.floor((Date.now() - G.start) / 1000);
    const m = Math.floor(G.elapsed / 60);
    const s = G.elapsed % 60;
    $('gtm').textContent = m + ':' + (s + '').padStart(2, '0');
  }, 1000);
}

// ── TIMER DE SESIÓN ──
function startST() {
  _ss = Date.now();
  if (_siv) clearInterval(_siv);
  _siv = setInterval(() => {
    const s = Math.floor((Date.now() - _ss) / 1000);
    const m = Math.floor(s / 60);
    const sc = s % 60;
    const timerEl = $('tbT');
    if (timerEl) timerEl.textContent = m + ':' + (sc + '').padStart(2, '0');
  }, 1000);
}

// ── AVATAR ──
let _av = '🧑‍🦱';
function selAv(el) {
  document.querySelectorAll('.av').forEach(a => a.classList.remove('sel'));
  el.classList.add('sel');
  _av = el.dataset.a;
  snd('clk');
}

// ── LOGIN ──
function doLogin() {
  const n = sanitizeProfileName($('iName').value || '');
  if (!n) { toast('⚠️ Escribe tu nombre de héroe'); return; }
  if (!P) {
    P = {
      name: n, av: _av, xp: 0, coins: 0, streak: 0, lastDay: '',
      tm: 0, tc: 0, pm_min: 0, badges: [], best: {},
      level: 1, pm: 0, mc: 0, ed: 0, bc: 0, prog: {}, surv: 0, refM: 0
    };
  } else {
    P.name = n;
    P.av = _av;
    if (!P.refM) P.refM = 0;
  }
  migrateP();
  saveP();
  startST();
  nav(0);
}

// ── TOPBAR UPDATE ──
function updTop() {
  if (!P) return;
  $('tbX').textContent = P.xp;
  $('tbC').textContent = P.coins;
  $('tbS').textContent = P.streak;
  const streakChip = $('tbS').parentElement;
  if (P.streak >= 3) {
    streakChip.classList.add('chip-fire');
    $('tbS').innerHTML = '<span class="streak-flame">🔥</span>' + P.streak;
  } else {
    streakChip.classList.remove('chip-fire');
    $('tbS').textContent = P.streak;
  }
}

// ── NAVEGACIÓN ──
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $(id).classList.add('on');
  $(id).scrollTop = 0;
  const inApp = ['mapScreen', 'biomeScreen', 'gameScreen', 'resultScreen', 'profileScreen', 'badgesScreen'];
  $('topbar').style.display = inApp.includes(id) ? 'flex' : 'none';
  $('botnav').style.display = (inApp.includes(id) && id !== 'gameScreen') ? 'flex' : 'none';
}

function nav(t) {
  _nav = t;
  snd('clk');
  document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === t));
  if (t === 0) { renderMap(); show('mapScreen'); }
  else if (t === 1) { renderProfile(); show('profileScreen'); }
  else if (t === 2) { renderBadges(); show('badgesScreen'); }
  updTop();
}

// ── IR A PANTALLA PRINCIPAL ──
function goHome() {
  snd('clk');
  clearInterval(G.iv);
  _combo = 0;
  hideCombo();
  // Close any open modal
  document.querySelectorAll('.mov').forEach(m => m.classList.remove('open'));
  $('levelSelect').classList.remove('open');
  $('reinforcementOverlay').classList.remove('open');
  $('lvlUp').classList.remove('show');
  $('badgeOverlay').classList.remove('show');
  // Si hay sesión activa, volver al mapa (no forzar re-login)
  if (P) {
    nav(0);
  } else {
    show('loginScreen');
    $('topbar').style.display = 'none';
    $('botnav').style.display = 'none';
    document.querySelectorAll('.bnb').forEach(b => b.classList.remove('act'));
  }
}

// ── TRADUCTOR INGLÉS-ESPAÑOL ──
function toggleTranslation(btn) {
  const trBox = btn.nextElementSibling;
  if (!trBox) return;
  const isHidden = trBox.style.display === 'none';
  trBox.style.display = isHidden ? 'block' : 'none';
  btn.classList.toggle('translate-active', isHidden);
  snd('clk');
}

// ── MODALES ──
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }
function openExit() { openModal('mExit'); }

function doExit() {
  closeModal('mExit');
  clearInterval(G.iv);
  _combo = 0;
  hideCombo();
  // Limpiar modo jefe si estaba activo
  if (G && G.isBoss) {
    document.body.classList.remove('boss-mode');
    const bhp = $('bossHPContainer');
    if (bhp) bhp.style.display = 'none';
  }
  nav(0);
}

function doReset() {
  closeModal('mReset');
  localStorage.removeItem('saiq_v3');
  location.reload();
}

// ── TOAST ──
function toast(msg, d = 2500) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), d);
}

// ═══════════════════════════════════════════
//   LÓGICA DE JUEGO
// ═══════════════════════════════════════════

// ── SELECCIÓN DE DIFICULTAD ──
function openLevelSelect(bid) {
  _bio = BIOMES.find(b => b.id === bid);
  if (!_bio) return;
  snd('clk');

  // Entrenamiento y Taller: ir directo sin selector de nivel
  if (bid === 'entrenamiento' || bid === 'taller_aritmetica') {
    _diffLevel = 'basico';
    renderBiomeAfterLevelSelect(bid);
    return;
  }

  // IE ahora soporta 4 niveles — va por el selector como los demás mundos
  // (taller también va por selector, solo básico disponible)

  const overlay = $('levelSelect');
  overlay.dataset.bid = bid;

  // Taller de aritmética: solo básico disponible
  const isTallerBid = bid === 'taller_aritmetica';
  const levels = isTallerBid ? ['basico'] : ['basico', 'medio', 'complejo', 'supercomplejo'];
  const icons  = isTallerBid ? ['⭐'] : ['⭐', '🌟', '💎', '🔥'];
  const labels = isTallerBid ? ['⭐ BÁSICO (Taller)'] : ['⭐ BÁSICO', '🌟 MEDIO', '💎 COMPLEJO', '🔥 SÚPER COMPLEJO'];
  const descs = isTallerBid ? ['Taller de Aritmética — Basado en el taller de Martín.'] : [
    'Contenido original. Siempre disponible.',
    'Desafío medio. Se desbloquea con 2+ misiones en Básico.',
    'Máximo desafío. Se desbloquea con 4 misiones en Medio.',
    '¡Reto extremo de 4.° grado! Se desbloquea con 4 misiones en Complejo.'
  ];

  const container = $('levelContent');
  container.innerHTML = '';

  levels.forEach((lv, i) => {
    const unlocked = isDiffUnlocked(bid, lv);
    const prog = bioProgress(bid, lv);
    const isCurrent = _diffLevel === lv;
    const card = document.createElement('div');
    card.className = 'diff-card' + (unlocked ? '' : ' diff-locked') + (isCurrent ? ' diff-current' : '') + (lv === 'supercomplejo' ? ' diff-super' : '');
    card.innerHTML = `
      <div class="diff-icon">${icons[i]}</div>
      <div class="diff-info">
        <div class="diff-name">${labels[i]}</div>
        <div class="diff-desc">${unlocked ? descs[i] : '🔒 ' + descs[i]}</div>
        <div class="diff-prog">${unlocked ? prog.d + '/' + prog.t + ' misiones completadas' : '🔒 Bloqueado'}</div>
      </div>
      ${isCurrent ? '<div class="diff-active-badge">ACTUAL</div>' : ''}
    `;
    if (unlocked) {
      card.onclick = () => { snd('clk'); selectDiffLevel(lv); };
    }
    container.appendChild(card);
  });

  openModal('levelSelect');
}

function selectDiffLevel(level) {
  _diffLevel = level;
  const levelNames = {basico: '⭐ Básico', medio: '🌟 Medio', complejo: '💎 Complejo', supercomplejo: '🔥 Súper Complejo'};
  toast('Nivel: ' + (levelNames[level] || level));
  closeModal('levelSelect');
  const bid = $('levelSelect').dataset.bid;
  if (bid && _bio) {
    renderBiomeAfterLevelSelect(bid);
  }
}

// ── TOMAR PREGUNTAS DE UNA MISIÓN CON VALIDACIÓN ──
function getMissionQuestions(bid, diff, mIdx) {
  const all = getQD(bid, diff) || [];
  const start = mIdx === 4 ? 20 : mIdx * 5;
  const end = mIdx === 4 ? 25 : (mIdx + 1) * 5;
  return all.slice(start, end);
}

// ── INICIAR MISIÓN ──
function startMis(bid, mIdx, questions, isReinforcement) {
  snd('start');
  let qs, lives;
  if (isReinforcement) {
    qs = questions;
    lives = 4;
  } else if (bid === 'entrenamiento') {
    const pool = shuffleArray([...(TRAINING_QS || [])]);
    qs = pool.slice(0, 5); // siempre 5 aleatorias del pool
    lives = 4;
  } else if (bid === 'inteligencia_emocional') {
    qs = getMissionQuestions(bid, _diffLevel, mIdx);
    lives = 3;
  } else if (bid === 'taller_aritmetica') {
    qs = getMissionQuestions(bid, 'basico', mIdx);
    lives = 3;
  } else {
    qs = getMissionQuestions(bid, _diffLevel, mIdx);
    lives = 3;
  }

  if (!qs || qs.length < 1) {
    toast('⚠️ No hay preguntas disponibles para esta misión');
    return;
  }

  G = {
    bid, mIdx, qs, cur: 0, ok: 0, start: Date.now(), elapsed: 0,
    ans: false, iv: null, lives,
    failed: [],
    isReinforcement: !!isReinforcement,
    isTraining: bid === 'entrenamiento',
    isTaller: bid === 'taller_aritmetica'
  };
  _combo = 0;
  hideCombo();

  const missionName = isReinforcement ? '🔄 Mundo de Refuerzo' :
    bid === 'entrenamiento' ? '🎯 Entrenamiento' :
    (_bio ? _bio.mns[mIdx] || 'MODO EXTRA' : 'Misión');
  showMissionFlash(missionName);
  renderQ();
  show('gameScreen');

  if (G.iv) clearInterval(G.iv);
  G.iv = setInterval(() => {
    G.elapsed = Math.floor((Date.now() - G.start) / 1000);
    const m = Math.floor(G.elapsed / 60);
    const s = G.elapsed % 60;
    $('gtm').textContent = m + ':' + (s + '').padStart(2, '0');
  }, 1000);
}

// ── INICIAR REFORZAMIENTO ──
function startReinforcement() {
  closeModal('reinforcementOverlay');
  snd('reinforcement');
  if (!G.failed || G.failed.length === 0) return;
  const shuffled = [...G.failed].sort(() => Math.random() - 0.5);
  startMis(G.bid, 0, shuffled, true);
}

// ── SALTAR REFORZAMIENTO ──
function skipReinforcement() {
  closeModal('reinforcementOverlay');
  nav(0);
}

// ── MEZCLAR ARREGLO ──
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── RENDERIZAR PREGUNTA ──
function renderQ() {
  const q = G.qs[G.cur];
  G.ans = false;
  $('gpf').style.width = ((G.cur / G.qs.length) * 100) + '%';
  $('gcnt').textContent = (G.cur + 1) + '/' + G.qs.length;

  // Hearts
  const lvsEl = $('lvs');
  lvsEl.innerHTML = '';
  const maxLives = G.isReinforcement ? 4 : 3;
  for (let i = 0; i < maxLives; i++) {
    const heart = document.createElement('span');
    if (i < G.lives) {
      heart.className = 'heart';
      heart.textContent = '❤️';
    } else {
      heart.className = 'heart-lost';
      heart.textContent = '🖤';
    }
    lvsEl.appendChild(heart);
  }

  // Question image
  const qi = $('qi');
  qi.style.display = 'none';
  qi.classList.remove('visual');
  if (q.img) {
    const svg = getVisualSVG(q.img);
    if (svg) {
      qi.innerHTML = svg;
      qi.style.display = 'flex';
      qi.classList.add('visual');
    }
  }

  // Bird reference panel
  const brp = $('birdRefPanel');
  if (brp) {
    if (q.birdRef) {
      brp.innerHTML = getBirdRefSVG();
      brp.style.display = 'flex';
    } else {
      brp.style.display = 'none';
    }
  }

  // Question text
  let qText = q.q;
  if (q.img) {
    qText = qText.replace(/^[📸📖📊]\s*/, '').replace(/^Imagen:.*?\.\s*/i, '').replace(/^Señal:.*?\.\s*/i, '').replace(/^Libro.*?\.\s*/i, '');
  }

  // Detect English question and add translator icon
  const qtEl = $('qt');
  const isEnglishQ = /^[A-Za-z]/.test(qText.trim()) || /[a-zA-Z]{3,}/.test(qText.trim());
  if (isEnglishQ) {
    // Build translation dictionary for English questions
    const translations = {
      "What is the PAST TENSE of 'go'?": "¿Cuál es el PASADO de 'go'?",
      "She ___ to school yesterday. (past tense of 'walk')": "Ella ___ a la escuela ayer. (pasado de 'walk')",
      "Which is BIGGER: an elephant or a mouse?": "¿Cuál es MÁS GRANDE: un elefante o un ratón?",
      "He ___ his homework last night. (past tense of 'do')": "Él ___ su tarea anoche. (pasado de 'do')",
      "My house is SMALLER than the school. 'Smaller' means:": "Mi casa es MÁS PEQUEÑA que la escuela. 'Smaller' significa:",
      "I ___ wake up at 7 AM. (always/sometimes/never)": "Yo ___ me despierto a las 7 AM. (siempre/a veces/nunca)",
      "The cat is ___ the box. It is inside.": "El gato está ___ la caja. Está adentro.",
      "The ball is ___ the table and the chair. It is between them.": "La pelota está ___ la mesa y la silla. Está entre ellas.",
      "She ___ eats vegetables. She doesn't like them.": "Ella ___ come vegetales. No le gustan.",
      "The park is ___ my house. You can walk there.": "El parque está ___ mi casa. Puedes caminar.",
      "Fill in the blank: 'She ___ to school every day.'": "Completa: 'Ella ___ a la escuela todos los días.'",
      "What does the word 'PUSH' mean in Spanish?": "¿Qué significa la palabra 'PUSH' en español?",
      "'The book is ___ the table.' Choose the correct preposition.": "'El libro está ___ la mesa.' Elige la preposición correcta.",
      "What is the plural of 'child'?": "¿Cuál es el plural de 'child' (niño)?",
      "Which of these words describes a type of WEATHER?": "¿Cuál de estas palabras describe un tipo de CLIMA?",
      "SHE BRINGS LUNCH FROM HOME. In the picture, the girl in yellow dress is:": "ELLA TRAE ALMUERZO DE CASA. En la imagen, la niña de vestido amarillo es:",
      "What fruit can you see in the picture of the lunch story?": "¿Qué fruta puedes ver en la imagen de la historia del almuerzo?",
      "'Her mom is a good chef.' What does Melany's mother do?": "'Su mamá es una buena chef.' ¿A qué se dedica la mamá de Melany?",
      "What does Melanie sometimes prepare for school lunch?": "¿Qué prepara Melanie a veces para el almuerzo escolar?",
      "Melanie's friends are jealous because:": "Los amigos de Melanie están celosos porque:",
      "Harry ___ his grades very important. (Elige el verbo correcto)": "Harry ___ sus calificaciones muy importantes. (Elige el verbo correcto)",
      "Harry thinks his grades ___ very important.": "Harry piensa que sus calificaciones ___ muy importantes.",
      "He studies ___ the library.": "Él estudia ___ la biblioteca.",
      "He studies when he goes ___ to eat.": "Él estudia cuando sale ___ comer.",
      "His friends ___ fun of him.": "Sus amigos se ___ de él.",
      "Harry ___ not care. He gets As all the time.": "Harry ___ no le importa. Siempre saca A."
    };

    // Try to find translation
    let translation = translations[qText] || '';
    if (!translation) {
      // Generic translation hint for unmatched English questions
      const simpleTranslations = {
        'bigger': 'más grande', 'smaller': 'más pequeño', 'went': 'fue/ir',
        'walked': 'caminó', 'did': 'hizo/hacer', 'always': 'siempre',
        'never': 'nunca', 'sometimes': 'a veces', 'thin': 'delgada',
        'fat': 'gorda', 'heavy': 'pesada', 'push': 'empujar', 'pull': 'jalar',
        'children': 'niños', 'rainy': 'lluvioso', 'hungry': 'hambriento',
        'happy': 'feliz', 'in': 'dentro de', 'on': 'sobre', 'under': 'debajo de',
        'between': 'entre', 'next to': 'al lado de', 'behind': 'detrás de',
        'make': 'hacer/se burlan', 'thinks': 'piensa', 'does': 'hace',
        'chef': 'chef/cocinera', 'sandwich': 'sándwich', 'jealous': 'celosos'
      };
      // Try to compose translation from key words
      const words = qText.toLowerCase().split(/\s+/);
      const translatedWords = words.map(w => simpleTranslations[w] || w);
      // Only use generic if enough words translated
      const translatedCount = translatedWords.filter((w, i) => w !== words[i]).length;
      if (translatedCount >= 2) {
        translation = translatedWords.join(' ');
      }
    }

    qtEl.innerHTML = `<span class="q-text-en">${qText}</span>` +
      (translation ? `<button class="translate-btn" onclick="toggleTranslation(this)" data-tr="${translation.replace(/"/g, '&quot;')}" title="Traducir al español">🌐</button><div class="translation-box" style="display:none">${translation}</div>` : '');
  } else {
    qtEl.textContent = qText;
  }

  $('tip').style.display = 'none';
  $('nxtBtn').style.display = 'none';

  // Options
  const og = $('og');
  og.innerHTML = '';
  const L = ['A', 'B', 'C', 'D'];
  q.o.forEach((op, i) => {
    const d = document.createElement('div');
    d.className = 'opt';
    d.innerHTML = `<div class="ol">${L[i]}</div><div>${op}</div>`;
    d.onclick = () => selAns(i);
    og.appendChild(d);
  });
}

// ── SELECCIONAR RESPUESTA ──
function selAns(idx) {
  if (G.ans) return;
  G.ans = true;
  const q = G.qs[G.cur];
  const opts = document.querySelectorAll('.opt');
  opts.forEach(o => o.onclick = null);

  const isReinf = G.isReinforcement;
  const xpPerQ = isReinf ? 15 : 10;

  if (idx === q.a) {
    opts[idx].classList.add('ok');
    G.ok++;
    if (G.isBoss) updateBossHP(); // actualizar HP del jefe
    _combo++;
    if (P.mc < _combo) P.mc = _combo;
    snd('ok');

    const qiRect = $('qi').getBoundingClientRect ? $('qi').getBoundingClientRect() : null;
    spawnXPFloat('+' + xpPerQ + ' XP', qiRect);

    if (_combo >= 2) {
      showCombo(_combo);
      if (_combo >= 2 && _combo < 5) snd('combo');
      else if (_combo >= 5) snd('combo_high');
    }
  } else {
    opts[idx].classList.add('no');
    opts[q.a].classList.add('ok');
    G.lives = Math.max(0, G.lives - 1);
    _combo = 0;
    hideCombo();
    snd('no');
    snd('heartbreak');

    // Track failed question (NOT in reinforcement mode)
    if (!isReinf) {
      G.failed.push(q);
    }

    // Animate heart loss
    const hearts = $('lvs').querySelectorAll('.heart');
    if (hearts[G.lives]) {
      hearts[G.lives].classList.remove('heart');
      hearts[G.lives].classList.add('heart-shake');
      setTimeout(() => {
        hearts[G.lives].textContent = '🖤';
        hearts[G.lives].className = 'heart-lost';
      }, 500);
    }

    if (q.tip) {
      $('tip').textContent = '💡 ' + q.tip;
      $('tip').style.display = 'block';
      snd('tip');
    }

    if (G.lives === 0) {
      setTimeout(() => endMis(true), 800);
      return;
    }
  }

  $('nxtBtn').style.display = 'flex';
  if (G.cur >= G.qs.length - 1) {
    $('nxtBtn').textContent = 'Ver resultados 🏆';
  } else {
    $('nxtBtn').textContent = 'Siguiente ▶';
  }
}

// ── SIGUIENTE PREGUNTA ──
function nextQ() {
  snd('clk');
  G.cur++;
  if (G.cur >= G.qs.length) { endMis(false); return; }
  renderQ();
  $('gameScreen').scrollTop = 0;
}

// ── FIN DE MISIÓN ──
function endMis(gameover = false) {
  clearInterval(G.iv);
  // ── JEFE FINAL: interceptar si es batalla de jefe ──
  if (G.isBoss) { endBossMode(gameover); return; }
  // ── EVALUACIÓN: interceptar si es modo evaluación ──
  if (G.isEval) { endEval(gameover); return; }

  const tot = G.qs.length;
  const pct = Math.round((G.ok / tot) * 100);
  const stars = pct === 100 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;

  const isReinf = G.isReinforcement;
  const isTrain = G.isTraining || G.isTaller;
  const mult = (isReinf || isTrain) ? {xp: 1, coins: 1, starBonus: 1} : (DIFF_MULT[_diffLevel] || DIFF_MULT.basico);
  const xpPerQ = (isReinf || isTrain) ? 8 : 10;

  const xpE = Math.round(G.ok * xpPerQ * mult.xp + (stars === 3 ? 20 * mult.starBonus : stars === 2 ? 10 * mult.starBonus : 0));
  const coE = Math.round(G.ok * 2 * mult.coins);

  if (!isReinf) {
    // Save normal progress
    const key = getProgKey(G.bid, G.mIdx, _diffLevel, false);
    const prev = P.prog[key] || {};
    P.prog[key] = { done: true, stars: Math.max(prev.stars || 0, stars) };
    P.xp += xpE;
    P.coins += coE;
    P.tm++;
    P.tc += G.ok;
    P.pm_min += Math.ceil(G.elapsed / 60);
    if (stars === 3) P.pm = (P.pm || 0) + 1;
    if (G.mIdx === 4) P.ed = (P.ed || 0) + 1;
    // Tracking entrenamiento
    if (isTrain) P.trainMissions = (P.trainMissions || 0) + 1;
    // Tracking supercomplejo
    if (_diffLevel === 'supercomplejo') P.scDone = (P.scDone || 0) + 1;

    if (!gameover && G.lives === 1 && stars >= 2) {
      P.surv = (P.surv || 0) + 1;
    }

    // ── VERIFICAR DESBLOQUEO DE EVALUACIÓN ──
    if (!gameover && !isTrain && G.bid !== 'entrenamiento' && pct >= 60) {
      const evalKey = G.bid + '_eval_' + _diffLevel;
      if (checkEvalUnlock(G.bid, _diffLevel) && !P.prog[evalKey]) {
        P.prog[evalKey] = 'available';
        setTimeout(() => {
          toast('📝 ¡Evaluación de ' + (_bio ? _bio.n.replace('\n',' ') : G.bid) + ' desbloqueada!', 3500);
        }, 3000);
      }
    }
  } else {
    // Reinforcement rewards
    P.xp += xpE;
    P.coins += coE;
    if (pct === 100) {
      P.refM = (P.refM || 0) + 1;
    }
  }

  // Streak
  const today = new Date().toDateString();
  if (P.lastDay !== today) {
    const yday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = P.lastDay === yday ? (P.streak || 0) + 1 : 1;
    P.streak = newStreak;
    P.lastDay = today;
    if (newStreak >= 3) snd('streak');
  }

  // Biomas completados (basic only for bc counter)
  if (!isReinf) {
    let bc = 0;
    BIOMES.slice(0, 5).forEach(b => {
      let ok = true;
      for (let i = 0; i < 4; i++) if (!P.prog[b.id + '_' + i]?.done) ok = false;
      if (ok) bc++;
    });
    P.bc = bc;
  }

  // Level
  const prevL = P.level || 1;
  const li = lvlInfo(P.xp);
  P.level = li.cur.n;

  // Badges
  const newB = [];
  BADGES.forEach(b => {
    if (!P.badges.includes(b.id) && b.c(P)) {
      P.badges.push(b.id);
      newB.push(b);
    }
  });

  // ── VERIFICAR CERTIFICADOS (4 niveles) ──
  const certNames = {basico:'⭐ Básico',medio:'🌟 Medio',complejo:'💎 Complejo',supercomplejo:'🔥 Súper Complejo'};
  const certEmojis = {basico:'📜',medio:'🌟',complejo:'💎',supercomplejo:'🔥'};
  const newCerts = syncCertificates(newB);
  const certEarned = newCerts.length > 0;

  saveP();
  updTop();
  hideCombo();

  // Sounds
  if (gameover) {
    snd('gameover');
  } else if (isReinf && pct === 100) {
    snd('ref_perfect');
  } else if (pct === 100) {
    snd('perfect');
  } else if (pct >= 60) {
    snd('win');
  }

  // Result text
  let ti;
  if (isTrain) {
    ti = pct === 100 ? '¡Entrenamiento perfecto! 🎯' :
      pct >= 60 ? '¡Buen entrenamiento! 🌟' :
      '¡Sigue practicando! 💪';
  } else if (isReinf) {
    ti = pct === 100 ? '¡REFUERZO PERFECTO! 🏆' :
      pct >= 60 ? '¡Buen refuerzo! 🌟' :
      '¡Sigue practicando! 💪';
  } else {
    ti = gameover ? '¡Sin vidas! 💀' :
      pct === 100 ? '¡PERFECTO ' + P.name + '! 🏆' :
      pct >= 60 ? '¡Muy bien! 🌟' :
      pct >= 40 ? '¡Buen intento! 💪' : '¡Sigue practicando! 📚';
  }

  $('rTr').textContent = gameover ? '💀' : isTrain ? '🎯' : isReinf && pct === 100 ? '🏆' : pct === 100 ? '🏆' : pct >= 60 ? '🥇' : pct >= 40 ? '🥈' : '🎯';
  $('rTi').textContent = ti;
  $('rSt').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('rOk').textContent = G.ok + '/' + tot;
  $('rXP').textContent = '+' + xpE;
  $('rCo').textContent = '+' + coE;
  $('rTm').textContent = G.elapsed + 's';

  // New badges display
  const rb = $('rBadges');
  rb.innerHTML = '';
  newB.forEach(b => {
    rb.innerHTML += `<div class="bpop"><span class="bpi">${b.ico}</span><div class="bpt"><strong>¡Logro: ${b.n}!</strong><p>${b.d}</p></div></div>`;
  });

  // Certificados ganados (uno o más)
  if (certEarned) {
    newCerts.forEach(d => {
      rb.innerHTML += '<div class=\"bpop cert-pop\" onclick=\"openCertDrawer()\" style=\"cursor:pointer;border:2px solid gold\">' +
        '<span class=\"bpi\">' + certEmojis[d] + '</span>' +
        '<div class=\"bpt\">' +
          '<strong>🏆 ¡CERTIFICADO ' + certNames[d].toUpperCase() + ' DESBLOQUEADO!</strong>' +
          '<p>Toca para ver tu cajón de certificados.</p>' +
        '</div></div>';
    });
  }

  show('resultScreen');
  document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === 0));
  $('botnav').style.display = 'flex';

  if (pct >= 60 && !gameover) conf();
  if (li.cur.n > prevL) setTimeout(() => showLvl(li.cur), 1200);
  if (newB.length > 0) {
    snd('badge');
    setTimeout(() => showBadgeOverlay(newB[0]), 1800);
  }

  // REINFORCEMENT OVERLAY
  if (!gameover && !isReinf && !isTrain && G.failed.length > 0) {
    setTimeout(() => {
      $('reinforcementFailCount').textContent = G.failed.length;
      openModal('reinforcementOverlay');
    }, 2500);
  }
}

// ── FIN DE EVALUACIÓN ──
function endEval(gameover) {
  const tot = G.qs.length;
  const pct = Math.round((G.ok / tot) * 100);
  const stars = pct === 100 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
  const xpE = Math.round(G.ok * 12 + (stars === 3 ? 30 : stars === 2 ? 15 : 0));
  const coE = Math.round(G.ok * 3);

  P.xp += xpE; P.coins += coE;
  P.evalsCompleted = (P.evalsCompleted || 0) + 1;
  const evalKey = G.bid + '_eval_' + (G.evalDiff || 'basico') + '_done';
  P.prog[evalKey] = { done: true, pct, stars };

  const today = new Date().toDateString();
  if (P.lastDay !== today) {
    const yday = new Date(Date.now() - 86400000).toDateString();
    P.streak = P.lastDay === yday ? (P.streak || 0) + 1 : 1;
    P.lastDay = today;
  }
  const li = lvlInfo(P.xp);
  const prevL = P.level || 1;  // capturar ANTES de actualizar
  P.level = li.cur.n;

  const newB = [];
  BADGES.forEach(b => {
    if (!P.badges.includes(b.id) && b.c(P)) { P.badges.push(b.id); newB.push(b); }
  });
  syncCertificates(newB);
  saveP(); updTop(); hideCombo();

  let ti = pct === 100 ? '¡EVALUACIÓN PERFECTA! 🏅' :
    pct >= 60 ? '¡Evaluación aprobada! ✅' :
    '¡Sigue estudiando! 📚';

  $('rTr').textContent = pct >= 60 ? '📝' : '📚';
  $('rTi').textContent = ti;
  $('rSt').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  $('rOk').textContent = G.ok + '/' + tot;
  $('rXP').textContent = '+' + xpE;
  $('rCo').textContent = '+' + coE;
  $('rTm').textContent = G.elapsed + 's';
  const rb = $('rBadges');
  rb.innerHTML = `<div style="text-align:center;padding:8px;color:var(--gold);font-size:.85em">📝 Evaluación ${pct}% — ${pct>=60?'Aprobada ✅':'Repasa y vuelve a intentarlo 💪'}</div>`;
  newB.forEach(b => { rb.innerHTML += `<div class="bpop"><span class="bpi">${b.ico}</span><div class="bpt"><strong>¡Logro: ${b.n}!</strong><p>${b.d}</p></div></div>`; });

  show('resultScreen');
  document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === 0));
  $('botnav').style.display = 'flex';
  if (pct >= 60) conf();
  if (li.cur.n > prevL) setTimeout(() => showLvl(li.cur), 1200);
  if (newB.length > 0) { snd('badge'); setTimeout(() => showBadgeOverlay(newB[0]), 1800); }
}

function retry() {
  snd('clk');
  _combo = 0;
  hideCombo();
  if (G.isReinforcement) {
    startReinforcement();
  } else if (G.isBoss) {
    startBoss(G.bid, G.diff); // revancha del jefe
  } else {
    startMis(G.bid, G.mIdx);
  }
}


// ═══════════════════════════════════════════════════════
//   MODO JEFE FINAL
// ═══════════════════════════════════════════════════════

// ── Verificar si el jefe está desbloqueado ──
function isBossUnlocked(bid, diff) {
  if (typeof BOSS_DATA === 'undefined' || !BOSS_DATA[bid] || !BOSS_DATA[bid].levels[diff]) return false;
  for (let i = 0; i < 4; i++) {
    const key = diff === 'basico' ? bid + '_' + i : bid + '_' + diff + '_' + i;
    if (!P.prog[key]?.done) return false;
  }
  return true;
}

// ── Verificar si el jefe ya fue derrotado ──
function isBossDefeated(bid, diff) {
  return !!(P.bossDefeated && P.bossDefeated[bid + '_' + diff]);
}

// ── Abrir pantalla de introducción del jefe ──
function openBossIntro(bid, diff) {
  const boss = BOSS_DATA && BOSS_DATA[bid];
  if (!boss || !boss.levels[diff]) return;
  _currentBossBid = bid;
  _currentBossDiff = diff;
  const reward = boss.levels[diff].reward;
  const defeated = isBossDefeated(bid, diff);
  $('bossIntroEmoji').textContent = boss.emoji;
  $('bossIntroName').textContent = boss.name;
  $('bossIntroDesc').textContent = boss.intro;
  $('bossRewardPreview').innerHTML =
    '<div class="boss-reward-row"><span class="boss-reward-ico">' + reward.ico + '</span>' +
    '<div><div class="boss-reward-name">' + reward.n + '</div>' +
    '<div class="boss-reward-sub">' + (defeated ? '✅ Tesoro ya obtenido — puedes repetir la batalla' : '⚔️ Derrota al jefe para ganar este tesoro') + '</div></div></div>';
  snd('clk');
  openModal('bossIntro');
}

// ── Confirmar inicio de la batalla desde el modal ──
function confirmStartBoss() {
  closeModal('bossIntro');
  startBoss(_currentBossBid, _currentBossDiff);
}

// ── Iniciar batalla del jefe ──
function startBoss(bid, diff) {
  const boss = BOSS_DATA && BOSS_DATA[bid];
  if (!boss || !boss.levels[diff]) return;
  _bio = BIOMES.find(b => b.id === bid);
  _diffLevel = diff;
  const qs = shuffleArray([...getQD(bid, diff)]).slice(0, 8);
  G = {
    bid, mIdx: -1, qs, cur: 0, ok: 0,
    start: Date.now(), elapsed: 0,
    ans: false, iv: null, lives: 3,
    failed: [],
    isReinforcement: false,
    isBoss: true,
    bossHP: qs.length,
    bossMaxHP: qs.length,
    diff
  };
  _combo = 0;
  hideCombo();
  document.body.classList.add('boss-mode');
  snd('boss_start');
  showMissionFlash('⚔️ ' + boss.name);
  // Mostrar barra de HP
  const bhp = $('bossHPContainer');
  if (bhp) {
    $('bossBannerEmoji').textContent = boss.emoji;
    $('bossBannerName').textContent = boss.name;
    bhp.style.display = 'block';
  }
  renderBossHP();
  renderQ();
  show('gameScreen');
  if (G.iv) clearInterval(G.iv);
  G.iv = setInterval(() => {
    G.elapsed = Math.floor((Date.now() - G.start) / 1000);
    const m = Math.floor(G.elapsed / 60);
    const s = G.elapsed % 60;
    $('gtm').textContent = m + ':' + (s + '').padStart(2, '0');
  }, 1000);
}

// ── Renderizar barra de HP del jefe ──
function renderBossHP() {
  const fill = $('bossBarFill');
  const text = $('bossHPText');
  if (!fill || !text || !G.isBoss) return;
  const pct = Math.max(0, (G.bossHP / G.bossMaxHP) * 100);
  fill.style.width = pct + '%';
  fill.style.background = pct > 50 ? 'var(--boss-hp-high)' : pct > 25 ? 'var(--boss-hp-mid)' : 'var(--boss-hp-low)';
  text.textContent = '❤️ ' + G.bossHP + '/' + G.bossMaxHP;
}

// ── Actualizar HP del jefe al responder correctamente ──
function updateBossHP() {
  if (!G.isBoss) return;
  G.bossHP = Math.max(0, G.bossHP - 1);
  renderBossHP();
}

// ── Fin de la batalla del jefe ──
function endBossMode(gameover) {
  document.body.classList.remove('boss-mode');
  const bhp = $('bossHPContainer');
  if (bhp) bhp.style.display = 'none';
  hideCombo();
  const boss = BOSS_DATA && BOSS_DATA[G.bid];
  const bossLevel = boss ? boss.levels[G.diff] : null;
  const tot = G.qs.length;
  const won = !gameover;
  if (won) {
    snd('boss_win');
    if (!P.bossDefeated) P.bossDefeated = {};
    const key = G.bid + '_' + G.diff;
    const firstTime = !P.bossDefeated[key];
    P.bossDefeated[key] = true;
    P.xp += 50;
    P.coins += 20;
    P.tm++;
    // Streak
    const today = new Date().toDateString();
    if (P.lastDay !== today) {
      const yday = new Date(Date.now() - 86400000).toDateString();
      P.streak = P.lastDay === yday ? (P.streak || 0) + 1 : 1;
      P.lastDay = today;
      if (P.streak >= 3) snd('streak');
    }
    // Level
    const prevL = P.level || 1;
    const li = lvlInfo(P.xp);
    P.level = li.cur.n;
    // Badges
    const newB = [];
    BADGES.forEach(b => {
      if (!P.badges.includes(b.id) && b.c(P)) { P.badges.push(b.id); newB.push(b); }
    });
    saveP(); updTop();
    // Pantalla de resultado con temática de jefe
    $('rTr').textContent = boss ? boss.emoji : '👑';
    $('rTi').textContent = firstTime ? '¡JEFE DERROTADO! 🏆' : '¡Victoria otra vez! 💪';
    $('rSt').textContent = '⭐⭐⭐';
    $('rOk').textContent = G.ok + '/' + tot;
    $('rXP').textContent = '+50';
    $('rCo').textContent = '+20';
    $('rTm').textContent = G.elapsed + 's';
    const rb = $('rBadges');
    rb.innerHTML = '';
    if (firstTime && bossLevel) {
      rb.innerHTML += '<div class="bpop boss-reward-pop"><span class="bpi">' + bossLevel.reward.ico + '</span><div class="bpt"><strong>🏆 Tesoro: ' + bossLevel.reward.n + '!</strong><p>' + bossLevel.reward.d + '</p></div></div>';
    }
    newB.forEach(b => {
      rb.innerHTML += '<div class="bpop"><span class="bpi">' + b.ico + '</span><div class="bpt"><strong>¡Logro: ' + b.n + '!</strong><p>' + b.d + '</p></div></div>';
    });
    show('resultScreen');
    document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === 0));
    $('botnav').style.display = 'flex';
    conf();
    if (li.cur.n > prevL) setTimeout(() => showLvl(li.cur), 1200);
    if (newB.length > 0) { snd('badge'); setTimeout(() => showBadgeOverlay(newB[0]), 1800); }
  } else {
    // Derrota
    snd('gameover');
    saveP(); updTop();
    $('rTr').textContent = boss ? boss.emoji : '💀';
    $('rTi').textContent = '¡El jefe te venció! Inténtalo de nuevo 💪';
    $('rSt').textContent = '☆☆☆';
    $('rOk').textContent = G.ok + '/' + tot;
    $('rXP').textContent = '+0';
    $('rCo').textContent = '+0';
    $('rTm').textContent = G.elapsed + 's';
    $('rBadges').innerHTML = '<div style="color:var(--muted);font-size:.8em;text-align:center;padding:8px">Tu progreso normal está a salvo. ¡A por la revancha!</div>';
    show('resultScreen');
    document.querySelectorAll('.bnb').forEach((b, i) => b.classList.toggle('act', i === 0));
    $('botnav').style.display = 'flex';
  }
}

// ── PERFIL ──
function renderProfile() {
  if (!P) return;
  const synced = syncCertificates();
  if (synced.length) saveP();
  const li = lvlInfo(P.xp);
  $('pAv').textContent = P.av;
  $('pLvl').textContent = 'Nivel ' + li.cur.n + ' — ' + li.cur.name;
  $('pXPl').textContent = P.xp + '/' + li.nxt.xp + ' XP';
  $('pXPb').style.width = li.pct + '%';
  $('pX').textContent = P.xp;
  $('pC').textContent = P.coins;
  $('pS').textContent = P.streak;
  $('pM').textContent = P.tm;
  $('pCo').textContent = P.tc;
  $('pPr').textContent = (P.pm_min || 0) + 'm';
  // ── PANEL DE TESOROS DE JEFE FINAL ──
  const tp = $('treasurePanel');
  if (tp && typeof BOSS_DATA !== 'undefined') {
    const defeated = P.bossDefeated || {};
    const levels = ['basico', 'medio', 'complejo', 'supercomplejo'];
    const levelLabels = {basico: '⭐ Básico', medio: '🌟 Medio', complejo: '💎 Complejo', supercomplejo: '🔥 SC'};
    let tHtml = '<div class="px" style="font-size:.65em;margin-bottom:10px">🏆 TESOROS DE BIOMA</div><div class="treasure-grid">';
    let hasAny = false;
    BIOMES.forEach(b => {
      levels.forEach(diff => {
        const boss = BOSS_DATA[b.id];
        if (!boss || !boss.levels[diff]) return;
        const key = b.id + '_' + diff;
        const earned = !!defeated[key];
        if (earned) hasAny = true;
        const reward = boss.levels[diff].reward;
        tHtml += '<div class="treasure-item ' + (earned ? 'earned' : 'locked') + '">' +
          '<span class="treasure-ico">' + (earned ? reward.ico : '🔒') + '</span>' +
          '<div class="treasure-name">' + (earned ? reward.n : '???') + '</div>' +
          '<div class="treasure-bio">' + b.n.replace('\n', ' ') + ' · ' + levelLabels[diff] + '</div></div>';
      });
    });
    tHtml += '</div>';
    if (!hasAny) tHtml += '<div class="treasure-empty">Derrota Jefes Finales para ganar tesoros de bioma</div>';
    tp.innerHTML = tHtml;
  }
  // ── Mostrar botón de certificado si aplica ──
  checkAndShowCertBtn();
}

// ── LOGROS ──
function renderBadges() {
  if (!P) return;
  const g = $('bGrid');
  g.innerHTML = '';
  BADGES.forEach(b => {
    const e = P.badges.includes(b.id);
    const d = document.createElement('div');
    d.className = 'bt ' + (e ? 'earned' : 'locked');
    d.innerHTML = `<span class="bi2">${b.ico}</span><div class="bn">${b.n}</div><div class="bd">${e ? b.d : '???'}</div>`;
    g.appendChild(d);
  });
}

// ═══════════════════════════════════════════
//   GENERADOR DE CERTIFICADO MINECRAFT
// ═══════════════════════════════════════════

function openCertificate(diff) {
  if (!P) return;
  // If called from drawer, diff is set; otherwise default to highest earned
  if (!diff) {
    if (!P.certs) P.certs = {};
    const order = ['supercomplejo','complejo','medio','basico'];
    diff = order.find(d => P.certs[d]) || 'basico';
  }
  if (!P.certs || !P.certs[diff]) {
    toast('🔒 Este certificado aún no está disponible');
    return;
  }
  const certEl = $('certOverlay');
  if (!certEl) return;
  _currentCertDiff = diff;
  // Close drawer first if open
  closeCertDrawer();
  renderCertificate(diff);
  certEl.classList.add('show');
}

function closeCertificate() {
  const certEl = $('certOverlay');
  if (certEl) certEl.classList.remove('show');
}

function printCertificate() {
  window.print();
}

function downloadCertificateHTML(diff) {
  if (!P) return;
  if (!P.certs) P.certs = {};
  const synced = syncCertificates();
  if (synced.length) saveP();
  if (!diff) diff = _currentCertDiff || ['supercomplejo','complejo','medio','basico'].find(d => P.certs[d]) || 'basico';
  if (!P.certs[diff]) {
    toast('🔒 Este certificado aún no está disponible');
    return;
  }
  _currentCertDiff = diff;
  renderCertificate(diff);
  const cert = $('certContent');
  if (!cert || !cert.innerHTML.trim()) {
    toast('📜 No se pudo preparar el certificado');
    return;
  }
  let css = '';
  try {
    Array.from(document.styleSheets || []).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => { css += rule.cssText + '\n'; });
      } catch(e) {}
    });
  } catch(e) {}
  const safeName = (P && P.name ? P.name : 'estudiante').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'') || 'estudiante';
  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Certificado SAI Quest</title><style>' + css + '\nbody{margin:0;background:#102030;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:18px;box-sizing:border-box}.cert-page{transform:none!important}</style></head><body>' + cert.innerHTML + '</body></html>';
  const blob = new Blob([html], {type:'text/html;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certificado_sai_' + diff + '_' + safeName + '.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('⬇️ Certificado descargado en HTML');
}

function renderCertificate(diff) {
  const el = $('certContent');
  if (!el || !P) return;
  if (!diff) diff = 'basico';
  if (!P.certs) P.certs = {};

  const diffConfig = {
    basico:        {label:'⭐ BÁSICO',        color:'#69f0ae', borderColor:'#1b5e20', bg:'#1a2e0a', badgeIco:'📜'},
    medio:         {label:'🌟 MEDIO',          color:'#ffd700', borderColor:'#7f6000', bg:'#2e2600', badgeIco:'🌟'},
    complejo:      {label:'💎 COMPLEJO',       color:'#4fc3f7', borderColor:'#01579b', bg:'#0a1e2e', badgeIco:'💎'},
    supercomplejo: {label:'🔥 SÚPER COMPLEJO', color:'#ff7043', borderColor:'#7f0000', bg:'#2e0a0a', badgeIco:'🔥'}
  };
  const cfg = diffConfig[diff] || diffConfig.basico;
  const prefix = d => diff === 'basico' ? d + '_' : d + '_' + diff + '_';

  const worlds = ['ingles','lenguaje','matematicas','ciencias','sociales'];
  const worldNames = {
    ingles: '🌊 Océano del Saber',
    lenguaje: '🌲 Bosque de Letras',
    matematicas: '⛏️ Mina de Diamantes',
    ciencias: '🌿 Selva Viva',
    sociales: '🏔️ Aldea del Tiempo'
  };

  // Calcular estrellas del criterio real de certificado:
  // 4 misiones principales por mundo. El MODO EXTRA suma práctica,
  // pero no bloquea el certificado ni debe hacer ver incompleto un logro ya ganado.
  const requiredMissionsForCert = 4;
  let totalStars = 0, maxStars = 0;
  const worldData = worlds.map(bid => {
    let stars = 0, missions = 0;
    for (let i = 0; i < requiredMissionsForCert; i++) {
      const pr = P.prog[prefix(bid) + i];
      if (pr?.done) { stars += (pr.stars || 0); missions++; }
    }
    const extraDone = !!P.prog[prefix(bid) + 4]?.done;
    totalStars += stars;
    maxStars += requiredMissionsForCert * 3;
    return { bid, name: worldNames[bid], stars, missions, extraDone };
  });

  const pct = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;
  const safeStudentName = escapeHTML((P.name || 'HÉROE').toString().toUpperCase());
  const safeAvatar = escapeHTML(P.av || '🧑‍🦱');
  const now = new Date();
  const fecha = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const li = lvlInfo(P.xp);

  el.innerHTML = `
    <div class="cert-page cert-${diff}" style="background:${cfg.bg};border-color:${cfg.borderColor};box-shadow:0 0 0 4px ${cfg.borderColor}, 0 0 0 8px #4a3728, 0 0 40px rgba(0,0,0,0.8)">
      <!-- Borde tipo bloques Minecraft -->
      <div class="cert-border-top" style="background:${cfg.borderColor}">
        ${Array.from({length:22}, (_,i) => '<span class="cert-block" style="filter:hue-rotate('+(i*16)+'deg)">' + ['⬛','🟩','🟦','🟧'][i%4] + '</span>').join('')}
      </div>

      <!-- Encabezado -->
      <div class="cert-header">
        <div class="cert-badge-row">
          <span class="cert-diamond">${cfg.badgeIco}</span>
          <span class="cert-diamond">⛏️</span>
          <span class="cert-diamond">${cfg.badgeIco}</span>
        </div>
        <div class="cert-title-main" style="color:${cfg.color};text-shadow:3px 3px 0 ${cfg.borderColor}">⛏️ SAI QUEST</div>
        <div class="cert-title-sub">CERTIFICADO ${cfg.label}</div>
        <div class="cert-deco-line" style="background:linear-gradient(90deg,transparent,${cfg.color} 20%,${cfg.color} 80%,transparent)"></div>
      </div>

      <!-- Cuerpo -->
      <div class="cert-body">
        <div class="cert-present">Este certificado acredita que</div>

        <div class="cert-name" style="color:${cfg.color};text-shadow:2px 2px 0 ${cfg.borderColor}, 0 0 24px ${cfg.color}66">
          ${safeAvatar} ${safeStudentName}
        </div>

        <div class="cert-desc">
          completó exitosamente las <strong>4 misiones principales</strong> de <strong>${cfg.label}</strong><br>
          en los cinco mundos iniciales del universo SAI Quest,<br>
          demostrando valentía, perseverancia y conocimiento en Lenguaje, Matemáticas, Ciencias, Sociales e Inglés.
        </div>

        <!-- Mundos completados -->
        <div class="cert-worlds">
          ${worldData.map(w => `
            <div class="cert-world-item" style="border-color:${cfg.borderColor}">
              <div class="cert-world-name">${escapeHTML(w.name)}</div>
              <div class="cert-world-stars" style="color:${cfg.color}">${'⭐'.repeat(Math.min(w.stars,4))} (${w.stars}/12)</div>
              <div class="cert-world-missions">${w.missions}/4 principales${w.extraDone ? ' · Extra ✓' : ''}</div>
            </div>
          `).join('')}
        </div>

        <!-- Stats -->
        <div class="cert-stats" style="border-color:${cfg.borderColor}">
          <div class="cert-stat">
            <div class="cert-stat-val" style="color:${cfg.color}">⭐ ${totalStars}/${maxStars}</div>
            <div class="cert-stat-lbl">Estrellas</div>
          </div>
          <div class="cert-stat">
            <div class="cert-stat-val" style="color:${cfg.color}">⚡ ${P.xp}</div>
            <div class="cert-stat-lbl">XP total</div>
          </div>
          <div class="cert-stat">
            <div class="cert-stat-val" style="color:${cfg.color}">🏅 Nv.${li.cur.n}</div>
            <div class="cert-stat-lbl">${li.cur.name}</div>
          </div>
          <div class="cert-stat">
            <div class="cert-stat-val" style="color:${cfg.color}">🎯 ${pct}%</div>
            <div class="cert-stat-lbl">Rendimiento</div>
          </div>
        </div>
      </div>

      <!-- Pie -->
      <div class="cert-footer">
        <div class="cert-footer-left">
          <div class="cert-seal">${cfg.badgeIco}</div>
          <div class="cert-seal-txt" style="color:${cfg.color}">NIVEL<br>${cfg.label.replace(/[⭐🌟💎🔥]\s*/,'')}</div>
        </div>
        <div class="cert-footer-center">
          <div class="cert-date">Expedido el ${fecha}</div>
          <div class="cert-sig-line" style="border-color:${cfg.color}">________________________________</div>
          <div class="cert-sig-name">Sistema SAI Quest — Colombia</div>
        </div>
        <div class="cert-footer-right">
          <div class="cert-seal">⛏️</div>
          <div class="cert-seal-txt" style="color:${cfg.color}">MAESTRO<br>AVENTURERO</div>
        </div>
      </div>

      <!-- Borde inferior -->
      <div class="cert-border-bot" style="background:${cfg.borderColor}">
        ${Array.from({length:22}, (_,i) => '<span class="cert-block" style="filter:hue-rotate('+((22-i)*16)+'deg)">' + ['⬛','🟩','🟦','🟧'][i%4] + '</span>').join('')}
      </div>
    </div>
  `;
}

// ── Mostrar certificado desde perfil ──
function checkAndShowCertBtn() {
  if (!P) return;
  if (!P.certs) P.certs = {};
  const synced = syncCertificates();
  if (synced.length) saveP();
  const hasCert = P.certificateEarned || Object.values(P.certs).some(v => v);
  // Botón simple del perfil
  const btn = $('certBtn');
  if (btn) btn.style.display = hasCert ? 'block' : 'none';
}

// ── CAJÓN DE CERTIFICADOS ──
function openCertDrawer() {
  if (!P) return;
  if (!P.certs) P.certs = {};
  const synced = syncCertificates();
  if (synced.length) saveP();
  const overlay = $('certDrawerOverlay');
  if (!overlay) return;
  renderCertDrawer();
  overlay.classList.add('show');
}

function closeCertDrawer() {
  const overlay = $('certDrawerOverlay');
  if (overlay) overlay.classList.remove('show');
}

function renderCertDrawer() {
  const grid = $('certDrawerGrid');
  if (!grid || !P) return;
  if (!P.certs) P.certs = {};
  const diffs = [
    {id:'basico',     label:'Nivel Básico',        ico:'📜', color:'#69f0ae', desc:'Completaste las 4 misiones principales de los 5 mundos iniciales en nivel Básico'},
    {id:'medio',      label:'Nivel Medio',          ico:'🌟', color:'#ffd700', desc:'Completaste las 4 misiones principales de los 5 mundos iniciales en nivel Medio'},
    {id:'complejo',   label:'Nivel Complejo',       ico:'💎', color:'#4fc3f7', desc:'Completaste las 4 misiones principales de los 5 mundos iniciales en nivel Complejo'},
    {id:'supercomplejo',label:'Nivel Súper Complejo',ico:'🔥',color:'#ff7043', desc:'Leyenda SAI Quest: completaste las 4 misiones principales en Súper Complejo'}
  ];
  grid.innerHTML = diffs.map(d => {
    const earned = !!P.certs[d.id];
    const cardClick = earned ? "openCertificate('" + d.id + "')" : '';
    const actions = earned
      ? "<div class='cdc-actions'>" +
          "<button class='cdc-btn' onclick=\"event.stopPropagation();openCertificate('" + d.id + "')\">👁️ Ver</button>" +
          "<button class='cdc-btn cdc-download' onclick=\"event.stopPropagation();downloadCertificateHTML('" + d.id + "')\">⬇️ HTML</button>" +
        "</div>"
      : "<div class='cdc-lock'>Aún no disponible</div>";
    return "<div class='cert-drawer-card " + (earned ? 'earned' : 'locked') + "' onclick=\"" + cardClick + "\">" +
      "<div class='cdc-ico'>" + (earned ? d.ico : '🔒') + "</div>" +
      "<div class='cdc-label'>" + d.label + "</div>" +
      "<div class='cdc-desc'>" + (earned ? d.desc : 'Completa las 4 misiones principales en todos los mundos de este nivel') + "</div>" +
      actions +
    "</div>";
  }).join('');
}
