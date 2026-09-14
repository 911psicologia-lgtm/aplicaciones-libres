/* ═══════════════════════════════════════════════════════════
   PequeWorld — UI: estado, navegación, login, mapa, premios, ajustes
   ═══════════════════════════════════════════════════════════ */

/* ── STORAGE ── */
const LS = 'pequeworld_v2';
let STATE = null;
function loadState() {
  try {
    const r = localStorage.getItem(LS);
    if (r) { STATE = JSON.parse(r); }
  } catch (e) {}
  if (!STATE) {
    STATE = defaultState();
    // migra datos de v1 si existen
    try {
      const old = localStorage.getItem('pequeworld_v1');
      if (old) {
        const o = JSON.parse(old);
        if (o && o.profiles) {
          Object.values(o.profiles).forEach(p => {
            p.avatar = 'avatar_1'; p.stats.chests = p.stats.chests || 0;
            p.stats.dailyGoals = p.stats.dailyGoals || 0;
            p.dailyGoal = {date:'', count:0, claimed:false};
            STATE.profiles[p.id] = p;
          });
          STATE.active = o.active || '';
          STATE.settings = o.settings || STATE.settings;
        }
      }
    } catch (e) {}
  }
  // migra perfiles antiguos a los campos nuevos de v4
  Object.values(STATE.profiles).forEach(p => migrateProfile(p));
  saveState();
}
function saveState() {
  try {
    localStorage.setItem(LS, JSON.stringify(STATE));
  } catch (e) {
    // v8 [A4]: guard de cuota — nunca fallar en silencio
    if (!saveState._warned) {
      saveState._warned = true;
      setTimeout(() => { saveState._warned = false; }, 30000);
      try { notif('⚠️ El guardado se llenó. Ve a Ajustes → Zona de padres y exporta tu progreso', 'var(--red)'); } catch (e2) {}
    }
    // último recurso: guarda el progreso sin las fotos base64 (avisa igualmente)
    try {
      const slim = JSON.parse(JSON.stringify(STATE));
      Object.values(slim.profiles).forEach(pp => { pp.avatarData = ''; });
      localStorage.setItem(LS, JSON.stringify(slim));
    } catch (e2) {}
  }
}
function activeProfile() { return STATE.profiles[STATE.active] || null; }
function updateProfile(fn) { const p = activeProfile(); if (!p) return; fn(p); saveState(); }

/* ── NAVEGACIÓN DE PANTALLAS ── */
let currentScreen = 'login';
const SCREENS = ['loginScreen', 'mapScreen', 'gameScreen', 'resultScreen', 'trophiesScreen', 'studioScreen', 'dictScreen'];
function showScreen(id) {
  SCREENS.forEach(s => $(s).classList.remove('on'));
  $(id).classList.add('on');
  currentScreen = id;
}
function navTo(i) {
  beep(true);
  if (window.sayStopAll) window.sayStopAll(); // v7: apaga el micrófono al salir del estudio
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === i));
  if (i === 0) { renderMap(); showScreen('mapScreen'); }
  else if (i === 1) { if (G.mtype) retryMission(); else navTo(0); }
  else if (i === 2) { renderTrophies(); showScreen('trophiesScreen'); }
}
function showUI(on) {
  $('topbar').classList.toggle('on', on);
  $('botnav').classList.toggle('on', on);
}

/* ── TOPBAR (con assets de moneda/estrella) ── */
function updateTopbar() {
  const p = activeProfile(); if (!p) return;
  $('tbStars').textContent = p.stars || 0;
  $('tbCoins').textContent = p.coins || 0;
  const streakVal = G.active ? G.streak : (p.maxStreak || 0);
  $('tbStreak').textContent = streakVal;
  const streakChip = $('tbStreak').closest('.tchip');
  if (streakChip) {
    streakChip.style.background = G.active && G.streak >= 5 ? 'rgba(255,100,0,.3)' : streakVal >= 10 ? 'rgba(255,150,0,.2)' : 'rgba(255,255,255,.09)';
    streakChip.style.borderColor = G.active && G.streak >= 5 ? 'rgba(255,150,0,.6)' : 'rgba(255,255,255,.1)';
  }
  $('tbLives').textContent = G.active ? G.lives : 5;
}

/* ── MODAL ── */
function openModal(title, body, footer = '') {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = body;
  $('modalFt').innerHTML = footer;
  $('modalOverlay').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('modalOverlay').classList.remove('on');
  document.body.style.overflow = '';
  if (window.stopCamera) window.stopCamera();
}
$('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });

/* ── CELEBRACIÓN (icono puede ser <img> de asset) ── */
const _celQ = []; let _celRunning = false, _celTimer = null;
function celebrate(evt) { _celQ.push(evt); if (!_celRunning) _celNext(); }
function _celNext() {
  if (!_celQ.length) { _celRunning = false; return; }
  _celRunning = true;
  const e = _celQ.shift();
  const rewards = (e.rewards || []).map(r => `<div class="cel-reward">${r}</div>`).join('');
  $('celebrationOverlay').innerHTML = `
    <div class="cel-box">
      <span class="cel-icon">${e.icon || uiTag('ui_trophy', '🏆')}</span>
      <div class="cel-title">${e.title || '¡Genial!'}</div>
      <div class="cel-sub">${e.sub || ''}</div>
      <div class="cel-rewards">${rewards}</div>
      <button class="bigbtn bb-gold" onclick="_celClose()" style="width:100%;max-width:260px">¡Seguir! 🚀</button>
    </div>
  `;
  $('celebrationOverlay').classList.add('on');
  if (e.confetti) { burst(80); if (e.confetti > 1) { setTimeout(() => burst(60), 300); setTimeout(() => burst(50), 650); } }
  _celTimer = setTimeout(_celClose, e.dur || 3500);
}
function _celClose() {
  clearTimeout(_celTimer);
  $('celebrationOverlay').classList.remove('on');
  setTimeout(_celNext, 200);
}
$('celebrationOverlay').addEventListener('click', _celClose);

/* ═══════════════════════════════════════════
   LOGIN / PERFILES (con fotos de avatares)
   ═══════════════════════════════════════════ */
let selectedProfileId = '';
function avatarHTML(av, data) {
  if (av === 'custom' && data) {
    return `<img class="avatar-img" src="${data}" alt="mi foto">`;
  }
  const found = AVATARS.find(a => a.id === av);
  return `<img class="avatar-img" src="${AV_IMG(av)}" alt="avatar"
    onerror="this.outerHTML='${found ? found.em : '👧'}'">`;
}
function renderLogin() {
  const row = $('profileRow');
  row.innerHTML = '';
  const ids = Object.keys(STATE.profiles);
  ids.forEach(id => {
    const p = STATE.profiles[id];
    const tile = document.createElement('div');
    tile.className = 'profile-tile' + (STATE.active === id ? ' selected' : '');
    const totalStars = p.stars || 0;
    tile.innerHTML = `
      ${avatarHTML(p.avatar || 'avatar_1', p.avatarData)}
      <div class="pt-name">${p.name || 'Niño'}</div>
      <div class="pt-stars">${'⭐'.repeat(Math.min(totalStars, 5)) || '☆☆☆'}</div>
    `;
    tile.onclick = () => {
      STATE.active = id; selectedProfileId = id; saveState();
      document.querySelectorAll('.profile-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      beep(true);
    };
    row.appendChild(tile);
  });
  const addBtn = document.createElement('div');
  addBtn.className = 'btn-add-profile';
  addBtn.innerHTML = '➕';
  addBtn.onclick = openCreateProfile;
  row.appendChild(addBtn);
  if (!STATE.active && ids.length) { STATE.active = ids[0]; saveState(); }
}
function openCreateProfile() {
  let chosenAv = 'avatar_1';
  openModal('👶 Nuevo Perfil', `
    <div style="margin-bottom:10px">
      <label style="font-size:.8em;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:.5px">Nombre</label>
      <input class="nice-input" id="profileNameIn" placeholder="Ej: Martín" maxlength="20" style="margin-top:6px" autofocus>
    </div>
    <div style="font-size:.8em;font-weight:800;color:var(--gold);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Tu avatar · con tu foto 📸</div>
    ${avatarStudioHTML(chosenAv, '')}
  `, `
    <button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cancelar</button>
    <button class="bigbtn bb-gold bb-sm" onclick="doCreateProfile()">Crear ✓</button>
  `);
  window._chosenAv = chosenAv;
  window._chosenAvatarData = '';
}
window.pickAv = (av, btn) => {
  document.querySelectorAll('.av-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  window._chosenAv = av;
  window._chosenAvatarData = '';
  const pv = $('avPreview');
  if (pv) pv.innerHTML = avatarHTML(av);
  const nm = $('avPreviewName');
  if (nm) nm.textContent = 'Elige tu avatar';
};
function doCreateProfile() {
  const name = ($('profileNameIn') || {value: ''}).value.trim() || 'Niño';
  const av = window._chosenAv || 'avatar_1';
  const p = defaultProfile(name, av);
  if (av === 'custom' && window._chosenAvatarData) p.avatarData = window._chosenAvatarData;
  STATE.profiles[p.id] = p;
  STATE.active = p.id;
  saveState();
  closeModal();
  renderLogin();
  notif('✅ ¡Perfil creado! Hola ' + name, 'var(--green)');
  beep(true);
}
/* Editar avatar desde Ajustes */
window.openEditAvatar = function () {
  const p = activeProfile(); if (!p) return;
  openModal('📷 Mi Foto de Avatar', `
    ${avatarStudioHTML(p.avatar === 'custom' ? 'custom' : p.avatar, p.avatarData)}
  `, `
    <button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cancelar</button>
    <button class="bigbtn bb-gold bb-sm" onclick="doSaveAvatar()">Guardar ✓</button>
  `);
  window._chosenAv = p.avatar === 'custom' ? 'custom' : p.avatar;
  window._chosenAvatarData = p.avatarData || '';
};
window.doSaveAvatar = function () {
  const av = window._chosenAv || 'avatar_1';
  updateProfile(p => {
    p.avatar = av;
    if (av === 'custom' && window._chosenAvatarData) p.avatarData = window._chosenAvatarData;
  });
  closeModal(); renderLogin(); updateTopbar();
  notif('✅ ¡Avatar actualizado!', 'var(--green)');
  beep(true);
};
function doEnter() {
  const p = activeProfile();
  if (!p) { notif('👆 Elige o crea un perfil primero', 'var(--red)'); return; }
  showUI(true);
  renderMap();
  showScreen('mapScreen');
  navTo(0);
  updateTopbar();
  beep(true);
  // v8 [A1]: tour de bienvenida la primera vez
  if (!p.tourDone) setTimeout(() => startTour(false), 800);
}

/* ═══════════════════════════════════════════
   MAPA (tarjetas con foto de portada + meta diaria)
   ═══════════════════════════════════════════ */
let currentLevel = 1;
function getPlayerLevel(p) {
  let lv = 1;
  for (let i = LEVEL_XP.length - 1; i >= 1; i--) { if ((p.xp || 0) >= LEVEL_XP[i]) { lv = i; break; } }
  return Math.min(lv, 3);
}
function xpForNextLevel(lv) { return LEVEL_XP[Math.min(lv + 1, 3)] || LEVEL_XP[3]; }
function worldCover(w) {
  if (w.cover) return w.cover; // v5: portada distintiva anti-duplicados
  const it = w.items.find(i => i.img);
  return it ? it.img : null;
}

function renderMap() {
  const p = activeProfile(); if (!p) return;
  const lv = getPlayerLevel(p);
  if (lv > p.level) {
    p.level = lv; saveState();
    if (lv > 1) {
      celebrate({
        icon: uiTag('mascot_cheer', '🎉', 'cel-img'),
        title: '¡Subiste de Nivel!',
        sub: `Ahora eres ${LEVEL_NAMES[lv]}`,
        rewards: ['⭐ +5 Estrellas', '🪙 +20 Monedas'],
        confetti: 2, dur: 4000
      });
      updateProfile(pp => { pp.stars = (pp.stars || 0) + 5; pp.coins = (pp.coins || 0) + 20; });
    }
  }

  // Hero banner con la FOTO del niño (v5) + saludo según la hora (v7)
  const hr = new Date().getHours();
  const saludo = hr < 12 ? '¡Buenos días' : hr < 19 ? '¡Buenas tardes' : '¡Buenas noches';
  $('mapAv').innerHTML = avatarHTML(p.avatar === 'custom' ? 'custom' : p.avatar, p.avatarData);
  $('mapName').textContent = `${saludo}, ${p.name}!`;
  $('mapSub').textContent = `Nivel ${lv} · ${LEVEL_NAMES[lv]}`;
  const xpCur = p.xp || 0; const xpNext = xpForNextLevel(lv); const xpBase = LEVEL_XP[lv] || 0;
  const frac = lv >= 3 ? 1 : clamp((xpCur - xpBase) / (xpNext - xpBase || 1), 0, 1);
  $('mapXpFill').style.width = (frac * 100) + '%';

  // Meta diaria
  renderDailyGoal(p);

  // Ruleta diaria (v5)
  renderSpinBanner(p);

  // Zona de Juegos (v5: Completar · Emparejar · Memoria · Escucha · Repaso)
  renderGamesZone(p);

  // Tabs de nivel
  const lvlTab = $('lvlTabs'); lvlTab.innerHTML = '';
  const TABS = [
    {L: 1, icon: '🌱', name: 'Inicial',   need: 0},
    {L: 2, icon: '🚀', name: 'Intermedio', need: 100},
    {L: 3, icon: '🌟', name: 'Avanzado',  need: 280},
  ];
  TABS.forEach(t => {
    const locked = (p.xp || 0) < t.need;
    const tab = document.createElement('div');
    tab.className = 'lvl-tab' + (t.L === currentLevel ? ' active' : '') + (locked ? ' locked' : '');
    tab.innerHTML = `<span class="lv-icon">${t.icon}</span>${t.name}${locked ? '<br><span style="font-size:.65em">🔒 ' + t.need + ' XP</span>' : ''}`;
    tab.onclick = () => {
      if (locked) { notif('🔒 Necesitas ' + t.need + ' XP para desbloquear', 'var(--red)'); beep(false); return; }
      currentLevel = t.L; renderMap(); beep(true);
    };
    lvlTab.appendChild(tab);
  });

  // Tarjetas de mundos con portada fotográfica
  const sec = $('worldSections'); sec.innerHTML = '';
  const filtered = WORLDS.filter(w => w.lvl === currentLevel);
  filtered.forEach(w => {
    const card = document.createElement('div');
    const best = bestStars(p, w.id);
    const done = best >= 3;
    card.className = `world-card ${w.color || ''} ${done ? 'done' : 'unlocked'}`;
    const cover = worldCover(w);
    const feat = (typeof isFeaturedWorld === 'function') && isFeaturedWorld(w.id);
    const coverHTML = cover
      ? `<img class="wc-img" src="${IMG(cover)}" alt="${w.name}" loading="lazy" onerror="this.outerHTML='<span class=\\'wc-emoji\\'>${w.icon}</span>'">`
      : `<span class="wc-emoji">${w.icon}</span>`;
    card.innerHTML = `
      ${coverHTML}
      ${feat ? '<div class="wc-feat">⭐ Hoy x2 🪙</div>' : ''}
      <div class="wc-name">${w.name}</div>
      <div class="wc-sub">${w.es}</div>
      <div class="wc-stars">${'⭐'.repeat(best)}${'☆'.repeat(3 - best)}</div>
      ${done ? '<div class="wc-done">✓</div>' : ''}
    `;
    if (feat) card.classList.add('featured');
    card.onclick = () => { startMission(w.id); beep(true); };
    sec.appendChild(card);
  });

  const grid = document.createElement('div');
  grid.className = 'world-grid';
  while (sec.firstChild) grid.appendChild(sec.firstChild);
  sec.appendChild(grid);

  updateTopbar();
  checkBadges();
}

/* ── ZONA DE JUEGOS (mapa) ── */
function renderGamesZone(p) {
  const host = $('gamesZone');
  if (!host) return;
  const pend = mistakeCount();
  host.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'gz-title';
  title.textContent = '🧠 Zona de Juegos';
  host.appendChild(title);

  const row = document.createElement('div');
  row.className = 'gz-row';

  const defs = [
    // ★ v8: sesión rápida de 5 minutos — cero decisiones para el niño
    {cls: 'gz-quick', ico: '⚡', name: 'Rápido', sub: 'sesión de 5 min', fn: () => startQuickSession()},
    {cls: 'gz-spell', ico: '🔤', name: 'Completa', sub: 'la palabra', fn: () => startSpellMission()},
    {cls: 'gz-match', ico: '🧩', name: 'Empareja', sub: 'foto + palabra', fn: () => startMatchMission()},
    {cls: 'gz-mem',   ico: '🃏', name: 'Memoria', sub: 'encuentra parejas', fn: () => startMemoryMission()},
    {cls: 'gz-listen',ico: '🎧', name: 'Escucha', sub: 'y elige la foto', fn: () => startListenMission()},
    // ★ v7: tres juegos/estudios nuevos
    {cls: 'gz-say',   ico: '🎤', name: 'Di la palabra', sub: 'graba tu voz', fn: () => startSayMission()},
    {cls: 'gz-odd',   ico: '🕵️', name: 'Intruso', sub: '¿cuál no es?', fn: () => startOddMission()},
    // ★ v8: dos juegos nuevos
    {cls: 'gz-sent',  ico: '🧩', name: 'Oraciones', sub: 'arma la frase', fn: () => startSentenceMission()},
    {cls: 'gz-rhyme', ico: '🔵', name: 'Rimas', sub: '¿qué rima?', fn: () => startRhymeMission()},
    {cls: 'gz-dict',  ico: '📚', name: 'Diccionario', sub: 'todas mis palabras', fn: () => openDictionary()},
    {cls: 'gz-review' + (pend ? '' : ' gz-off'), ico: '🔁', name: 'Repaso',
     sub: pend ? pend + (pend === 1 ? ' error · priorizado' : ' errores · priorizados') : '¡Sin errores!', fn: () => startReviewMission()},
  ];
  defs.forEach(d => {
    const c = document.createElement('div');
    c.className = 'gz-card ' + d.cls;
    c.innerHTML = `<span class="gz-ico">${d.ico}</span><span class="gz-name">${d.name}</span><span class="gz-sub">${d.sub}</span>${d.cls.includes('gz-review') && pend ? `<span class="gz-badge">${Math.min(pend, 99)}</span>` : ''}`;
    c.onclick = () => d.fn();
    row.appendChild(c);
  });
  host.appendChild(row);
}

/* ── META DIARIA ── */
function renderDailyGoal(p) {
  const host = $('dailyGoal');
  if (!host) return;
  const t = todayStr();
  if (p.dailyGoal.date !== t) { p.dailyGoal = {date: t, count: 0, claimed: false}; saveState(); }
  const dg = p.dailyGoal;
  const pct = clamp(dg.count / DAILY_GOAL_MISSIONS, 0, 1) * 100;
  const done = dg.count >= DAILY_GOAL_MISSIONS;
  host.innerHTML = `
    <div class="dg-row">
      <div class="dg-info">
        <div class="dg-title">🎯 Meta diaria ${Math.min(dg.count, DAILY_GOAL_MISSIONS)}/${DAILY_GOAL_MISSIONS} misiones</div>
        <div class="dg-bar"><div class="dg-fill" style="width:${pct}%"></div></div>
      </div>
      ${done && !dg.claimed
        ? `<button class="bigbtn bb-gold bb-sm" onclick="claimDailyGoal()">Reclamar 🪙+${DAILY_GOAL_REWARD.coins}</button>`
        : done ? '<span class="dg-claimed">✅ Reclamado</span>' : `<span class="dg-reward">🪙+${DAILY_GOAL_REWARD.coins} ✨+${DAILY_GOAL_REWARD.xp}</span>`}
    </div>`;
}
function claimDailyGoal() {
  const p = activeProfile(); if (!p) return;
  const t = todayStr();
  if (p.dailyGoal.date !== t || p.dailyGoal.claimed || p.dailyGoal.count < DAILY_GOAL_MISSIONS) return;
  p.dailyGoal.claimed = true;
  p.coins = (p.coins || 0) + DAILY_GOAL_REWARD.coins;
  p.xp = (p.xp || 0) + DAILY_GOAL_REWARD.xp;
  p.stats.dailyGoals = (p.stats.dailyGoals || 0) + 1;
  saveState();
  burst(70); beepWin();
  celebrate({
    icon: uiTag('ui_coin', '🪙', 'cel-img'),
    title: '¡Meta diaria cumplida!',
    sub: '¡Vuelve mañana para seguir ganando!',
    rewards: [`🪙 +${DAILY_GOAL_REWARD.coins} Monedas`, `✨ +${DAILY_GOAL_REWARD.xp} XP`],
    confetti: 2, dur: 3200
  });
  renderMap(); updateTopbar(); checkBadges();
}
function bumpDailyGoal() {
  const p = activeProfile(); if (!p) return;
  const t = todayStr();
  if (p.dailyGoal.date !== t) p.dailyGoal = {date: t, count: 0, claimed: false};
  p.dailyGoal.count = (p.dailyGoal.count || 0) + 1;
  saveState();
}

/* ═══════════════════════════════════════════
   PREMIOS (insignias, medallas, trofeos, ranking)
   ═══════════════════════════════════════════ */
let _trophyTab = 0;
function switchTrophyTab(i) {
  _trophyTab = i;
  [0, 1, 2, 3, 4, 5, 6].forEach(j => $(`tTab${j}`).classList.toggle('on', j === i));
  renderTrophyContent();
}
function renderTrophies() { switchTrophyTab(0); }

function renderTrophyContent() {
  const p = activeProfile();
  const host = $('trophyContent');
  if (!p) { host.innerHTML = '<div class="small">Sin perfil</div>'; return; }

  if (_trophyTab === 0) {
    // Insignias en medallas doradas
    let html = '<div class="badges-grid">';
    BADGES.forEach(b => {
      const earned = (p.badges || []).includes(b.id) || b.c(p);
      if (earned && !(p.badges || []).includes(b.id)) { p.badges.push(b.id); saveState(); }
      html += `<div class="b-tile ${earned ? 'earned' : 'locked'}">
        <div class="medal-frame"><div class="bt-ico">${b.icon}</div></div>
        <div class="bt-name">${b.name}</div>
        <div class="bt-desc">${earned ? b.desc : '???'}</div>
      </div>`;
    });
    html += '</div>';
    host.innerHTML = html;

  } else if (_trophyTab === 1) {
    // Medallas de mundo con foto circular
    let html = '<div class="badges-grid">';
    WORLDS.forEach(w => {
      const best = p.best && p.best[w.id] || 0;
      const earned = best >= 3;
      const cover = worldCover(w);
      const inner = cover
        ? `<img class="medal-photo" src="${IMG(cover)}" alt="${w.name}" loading="lazy" onerror="this.outerHTML='${w.icon}'">`
        : w.icon;
      html += `<div class="b-tile ${earned ? 'earned' : 'locked'}">
        <div class="medal-frame big ${earned ? 'gold' : ''}">${inner}</div>
        <div class="bt-name">${w.name}</div>
        <div class="bt-desc">${'⭐'.repeat(best)}${'☆'.repeat(3 - best)}</div>
      </div>`;
    });
    html += '</div>';
    host.innerHTML = html;

  } else if (_trophyTab === 2) {
    const lv = getPlayerLevel(p);
    const missions = p.stats?.missions || 0;
    const perfect = p.stats?.perfect || 0;
    const chests = p.stats?.chests || 0;
    const trophyDefs = [
      {icon: '🌱', name: 'Nivel 1 — Semilla', desc: 'El viaje comienza aquí', earned: true},
      {icon: '🚀', name: 'Nivel 2 — Explorador', desc: `Necesitas 150 XP · Tienes ${p.xp || 0} XP`, earned: lv >= 2},
      {icon: '🌟', name: 'Nivel 3 — Héroe', desc: `Necesitas 400 XP · Tienes ${p.xp || 0} XP`, earned: lv >= 3},
      {icon: '🎖️', name: '25 Misiones', desc: `Completa 25 misiones · ${missions}/25`, earned: missions >= 25},
      {icon: '👑', name: '50 Misiones', desc: `Completa 50 misiones · ${missions}/50`, earned: missions >= 50},
      {icon: '💎', name: 'Perfecto x1', desc: `10/10 en una misión · ${perfect}/1`, earned: perfect >= 1},
      {icon: '💠', name: 'Triple Perfecto', desc: `3 misiones perfectas · ${perfect}/3`, earned: perfect >= 3},
      {icon: '🎁', name: 'Cazatesoros', desc: `Abre 10 cofres · ${chests}/10`, earned: chests >= 10},
      {icon: '🏆', name: 'Campeón Absoluto', desc: '3⭐ en todos los mundos', earned: WORLDS.every(w => (p.best && p.best[w.id] || 0) >= 3)},
    ];
    let html = '<div class="badges-grid">';
    trophyDefs.forEach(t => {
      html += `<div class="b-tile ${t.earned ? 'earned' : 'locked'}">
        <div class="medal-frame"><div class="bt-ico">${t.icon}</div></div>
        <div class="bt-name">${t.name}</div>
        <div class="bt-desc">${t.desc}</div>
      </div>`;
    });
    html += '</div>';
    host.innerHTML = html;

  } else if (_trophyTab === 4) {
    // 🛍️ TIENDA DE AVATARES (v5)
    host.innerHTML = renderShopHTML();
  } else if (_trophyTab === 5) {
    // 🎓 DIPLOMAS IMPRIMIBLES (v7)
    if (window.renderDiplomasTab) window.renderDiplomasTab();
  } else if (_trophyTab === 6) {
    // 🏆 HITOS DE PALABRAS DOMINADAS (v8)
    if (window.renderMilestonesTab) window.renderMilestonesTab();
  } else {
    // Ranking con medallas de fotos
    const realPlayers = Object.values(STATE.profiles)
      .map(pp => ({name: pp.name, av: pp.avatar || 'avatar_1', avData: pp.avatarData || '', xp: pp.xp || 0, stars: pp.stars || 0, coins: pp.coins || 0, me: pp.id === STATE.active, isAI: false}));
    const all = [...realPlayers, ...AI_RIVALS].sort((a, b) => b.xp - a.xp);
    const medals = ['ui_medal_gold', 'ui_medal_silver', 'ui_medal_bronze'];
    const medalEm = ['🥇', '🥈', '🥉'];
    const myRank = all.findIndex(r => r.me);
    let html = `<div style="font-size:.72em;color:var(--muted);text-align:center;margin-bottom:10px;padding:6px 12px;background:rgba(255,255,255,.05);border-radius:12px">
      🤖 Los jugadores con robot son campeones virtuales que te desafían a superarlos
    </div><div class="rank-list">`;
    all.forEach((r, i) => {
      const pos = i < 3 ? uiTag(medals[i], medalEm[i], 'rank-medal-img') : `<div class="rank-pos">#${i + 1}</div>`;
      const isMe = r.me;
      const bgStyle = r.isAI
        ? 'background:rgba(100,80,200,.12);border-color:rgba(150,120,255,.2)'
        : isMe ? 'background:rgba(255,215,0,.1);border-color:rgba(255,215,0,.3)' : '';
      html += `<div class="rank-row${isMe ? ' me' : ''}" style="${bgStyle}">
        <div class="rank-pos-wrap">${pos}</div>
        <div class="rank-av">${r.isAI ? r.av : avatarHTML(r.av, r.avData)}</div>
        <div style="flex:1;min-width:0">
          <div class="rank-name">${isMe ? '👉 ' : ''}${r.name}${r.isAI ? ` <span style="font-size:.65em;color:var(--purple);background:rgba(155,89,182,.2);padding:1px 6px;border-radius:8px">${r.title}</span>` : ''}</div>
          <div style="font-size:.68em;color:var(--muted);margin-top:1px">⭐ ${r.stars} · 🪙 ${r.coins}</div>
        </div>
        <div class="rank-xp" style="${r.isAI ? 'color:var(--purple)' : isMe ? 'color:var(--gold)' : ''}">${r.xp} XP</div>
      </div>`;
    });
    if (myRank >= 0) {
      html += `<div style="text-align:center;margin-top:10px;font-size:.78em;color:var(--gold);font-weight:800">
        ${myRank === 0 ? '🏆 ¡ERES EL #1!' : myRank <= 2 ? `🥈 ¡Estás en el TOP ${myRank + 1}! ¡Sigue así!` : `💪 Estás en el puesto #${myRank + 1} — ¡A superar a ${all[myRank - 1]?.name}!`}
      </div>`;
    }
    html += '</div>';
    host.innerHTML = html;
  }
}

/* ── AJUSTES ── */
function openSettings() {
  beep(true);
  const p = activeProfile();
  const s = STATE.settings;
  openModal('⚙️ Ajustes', `
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">📷 Mi avatar</div>
      <div style="display:flex;align-items:center;gap:12px">
        ${avatarHTML(p.avatar === 'custom' ? 'custom' : p.avatar, p.avatarData)}
        <button class="bigbtn bb-green bb-sm" onclick="openEditAvatar()">📷 Cambiar mi foto</button>
      </div>
      <div class="small" style="margin-top:6px">Tómale una foto con la cámara o elige una de tu galería.</div>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">🌍 Idioma</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="bigbtn bb-sm ${s.langMode === 'ENES' ? 'bb-gold' : 'bb-ghost'}" onclick="setLang('ENES',this)">EN + ES</button>
        <button class="bigbtn bb-sm ${s.langMode === 'EN' ? 'bb-gold' : 'bb-ghost'}" onclick="setLang('EN',this)">Solo EN</button>
        <button class="bigbtn bb-sm ${s.langMode === 'ES' ? 'bb-gold' : 'bb-ghost'}" onclick="setLang('ES',this)">Solo ES</button>
      </div>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">🔊 Velocidad de voz (para niños)</div>
      <input type="range" min="60" max="100" value="${Math.round((s.voiceRate || .82) * 100)}" step="2" id="voiceRateSlider" oninput="updateVoiceRate(this.value)" style="width:100%">
      <div style="display:flex;justify-content:space-between;font-size:.8em;color:var(--muted);margin-top:4px">
        <span>🐢 Lenta</span><span id="vrLabel">${Math.round((s.voiceRate || .82) * 100)}%</span><span>Rápida 🐇</span>
      </div>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">🔊 Voz activa</div>
      <button class="bigbtn bb-sm ${s.voiceEnabled ? 'bb-green' : 'bb-ghost'}" id="voiceToggleBtn" onclick="toggleVoice(this)">${s.voiceEnabled ? '🔊 Activada' : '🔇 Silenciada'}</button>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">🗣️ Voz en inglés (v8)</div>
      <div class="small">Elige la voz que más le guste a tu peque (las voces dependen de tu dispositivo):</div>
      <div class="voice-row">
        <select id="voiceSel" onchange="setVoiceURI(this.value)" aria-label="Voz en inglés"></select>
        <button class="bigbtn bb-green bb-sm" onclick="previewVoice()">▶️ Probar</button>
      </div>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">📈 Actividad reciente (v7)</div>
      <canvas id="actChart" class="act-chart"></canvas>
      <div class="small" style="margin-top:4px">Cada barra es un día: cuántas misiones completó tu peque.</div>
    </div>
    <div class="divider"></div>
    <div style="margin-bottom:14px">
      <div style="font-weight:900;margin-bottom:6px">👨‍👩‍👧 Zona de padres</div>
      ${parentsStatsHTML(p)}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="bigbtn bb-green bb-sm" onclick="openParentsReport()">🖨️ Informe imprimible (v8)</button>
        <button class="bigbtn bb-ghost bb-sm" onclick="exportProgress()">⬇️ Exportar progreso</button>
        <button class="bigbtn bb-ghost bb-sm" onclick="askAdult('Importar progreso', () => triggerImport())">⬆️ Importar progreso</button>
        <button class="bigbtn bb-ghost bb-sm" onclick="switchPlayer()">👥 Cambiar de jugador</button>
      </div>
      <input type="file" accept="application/json,.json" id="importInp" style="display:none" onchange="onImportPick(event)">
      <div class="small" style="margin-top:6px">La app guarda todo en este dispositivo y nunca envía datos a internet.</div>
      <div class="pr-priv-lock" style="margin-top:10px;background:rgba(46,204,113,.08);border:1.5px solid rgba(46,204,113,.35);border-radius:12px;padding:10px 12px">
        <div style="font-weight:900;margin-bottom:4px">🔒 Privacidad (v8) — qué se guarda y qué no sale de aquí</div>
        <div class="small" style="line-height:1.5">
          • La <b>foto</b>, el <b>nombre</b> y el <b>progreso</b> viven solo en este navegador (localStorage): nunca se envían a internet.<br>
          • Las <b>grabaciones de voz</b> de «Di la palabra» no se guardan: solo suenan en memoria y desaparecen al salir.<br>
          • No hay cuentas, anuncios, compras ni análisis de datos.<br>
          • Puedes <b>exportar</b> una copia, <b>importarla</b> en otro dispositivo o <b>borrar todo</b> abajo. Borrar e importar piden verificación de adulto.
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div>
      <div style="font-weight:900;margin-bottom:8px;color:var(--red)">⚠️ Zona peligrosa</div>
      <button class="bigbtn bb-ghost bb-sm" onclick="askAdult('Reiniciar perfil', () => resetProfile())">🔄 Reiniciar mi perfil</button>
    </div>
  `, `<button class="bigbtn bb-gold bb-sm" onclick="closeModal()">✓ Cerrar</button>`);
  // v7: dibuja el gráfico de actividad cuando el modal ya está en el DOM
  requestAnimationFrame(() => { if (window.renderActivityChart) window.renderActivityChart(); });
  // v8: llena el selector de voz (las voces pueden llegar tarde en algunos navegadores)
  requestAnimationFrame(() => { if (window.populateVoiceSel) populateVoiceSel(); });
  setTimeout(() => { if (window.populateVoiceSel) populateVoiceSel(); }, 400);
}
window.setLang = (m, btn) => {
  STATE.settings.langMode = m; saveState();
  document.querySelectorAll('#modalBody .bigbtn').forEach(b => { b.className = b.className.replace('bb-gold', 'bb-ghost'); });
  btn.className = btn.className.replace('bb-ghost', 'bb-gold');
  notif('🌍 Idioma: ' + m, 'var(--blue)');
};
window.updateVoiceRate = (v) => {
  STATE.settings.voiceRate = v / 100; saveState();
  $('vrLabel').textContent = v + '%';
};
window.toggleVoice = (btn) => {
  STATE.settings.voiceEnabled = !STATE.settings.voiceEnabled; saveState();
  btn.textContent = STATE.settings.voiceEnabled ? '🔊 Activada' : '🔇 Silenciada';
  btn.className = btn.className.replace(STATE.settings.voiceEnabled ? 'bb-ghost' : 'bb-green', STATE.settings.voiceEnabled ? 'bb-green' : 'bb-ghost');
};
window.resetProfile = () => {
  if (!confirm('¿Seguro? Se borrarán todos los premios de este perfil.')) return;
  updateProfile(p => {
    const fresh = defaultProfile(p.name, 'avatar_1');
    fresh.id = p.id;
    Object.keys(fresh).forEach(k => { p[k] = fresh[k]; });
  });
  closeModal(); renderMap(); updateTopbar();
  notif('🔄 Perfil reiniciado', 'var(--red)');
};

/* ── INSIGNIAS NUEVAS ── */
function checkBadges() {
  const p = activeProfile(); if (!p) return;
  BADGES.forEach(b => {
    if (!(p.badges || []).includes(b.id) && b.c(p)) {
      p.badges.push(b.id);
      notif(`🏅 ¡Nueva insignia: ${b.name}!`, 'var(--gold)');
    }
  });
  saveState();
}

/* ═════════════════════════════════════════
   V5 — RULETA DIARIA DE PREMIOS
   ═════════════════════════════════════════ */
function renderSpinBanner(p) {
  let host = $('spinZone');
  if (!host) {
    host = document.createElement('div');
    host.id = 'spinZone';
    host.className = 'spin-banner';
    const gz = $('gamesZone');
    if (gz && gz.parentNode) gz.parentNode.insertBefore(host, gz);
    else if ($('dailyGoal')) $('dailyGoal').parentNode.insertBefore(host, $('dailyGoal').nextSibling);
  }
  const can = p.lastSpin !== todayStr();
  host.innerHTML = `<div class="spin-row">
    <span class="spin-ico">🎡</span>
    <div style="flex:1;min-width:0">
      <div class="spin-title">Ruleta diaria de premios</div>
      <div class="small">Gira 1 vez al día: monedas, XP o estrellas</div>
    </div>
    ${can
      ? '<button class="bigbtn bb-purple bb-sm" onclick="openSpin()">¡Girar! 🎁</button>'
      : '<span class="dg-claimed">✅ ¡Vuelve mañana!</span>'}
  </div>`;
}

window.openSpin = function () {
  const p = activeProfile(); if (!p) return;
  if (p.lastSpin === todayStr()) { notif('🎡 Ya giraste hoy — ¡vuelve mañana!', 'var(--orange)'); return; }
  beep(true);
  const segs = SPIN_PRIZES;
  const seg = 360 / segs.length;
  const grads = segs.map((s, i) => `${s.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(',');
  openModal('🎡 Ruleta Diaria', `
    <div class="wheel-wrap">
      <div class="wheel-pointer">▼</div>
      <div class="wheel" id="wheelEl" style="background:conic-gradient(${grads})">
        ${segs.map((s, i) => `<span class="wheel-label" style="transform:rotate(${i * seg + seg / 2}deg) translate(-50%,-80px)">${s.label}</span>`).join('')}
        <div class="wheel-center">🌟</div>
      </div>
    </div>
    <div class="small" style="text-align:center;margin-top:12px">¡Toca GIRAR y prueba tu suerte!</div>
  `, `<button class="bigbtn bb-gold bb-sm" id="spinGo" onclick="doSpin()">🎯 ¡GIRAR!</button>`);
};

window.doSpin = function () {
  const p = activeProfile(); if (!p) return;
  if (p.lastSpin === todayStr()) return;
  const wheel = $('wheelEl'); const btn = $('spinGo');
  if (!wheel || (btn && btn.disabled)) return;
  if (btn) btn.disabled = true;
  const segs = SPIN_PRIZES;
  const idx = (Math.random() * segs.length) | 0;
  const seg = 360 / segs.length;
  const target = 360 * 5 + (360 - (idx * seg + seg / 2)) - (seg / 2);
  requestAnimationFrame(() => { wheel.style.transform = `rotate(${target}deg)`; });
  updateProfile(pp => { pp.lastSpin = todayStr(); pp.stats.spins = (pp.stats.spins || 0) + 1; });
  setTimeout(() => {
    const prize = segs[idx];
    updateProfile(pp => prize.apply(pp));
    saveState();
    burst(90); beepWin();
    celebrate({
      icon: '🎡',
      title: '¡Premio de la ruleta!',
      sub: 'Vuelve mañana para girar otra vez',
      rewards: [prize.label], confetti: 2, dur: 3200
    });
    closeModal();
    renderMap(); updateTopbar(); checkBadges();
  }, 3600);
};

/* ═════════════════════════════════════════
   V5 — TIENDA DE AVATARES (monedas locales)
   ═════════════════════════════════════════ */
function renderShopHTML() {
  const p = activeProfile();
  let html = `<div class="small" style="text-align:center;margin-bottom:10px">
    💰 Tienes <b style="color:var(--gold)">${p.coins || 0} monedas</b> · Gana más jugando misiones, la ruleta y los cofres
  </div><div class="shop-grid">`;
  SHOP_AVATARS.forEach(a => {
    const owned = (p.unlockedAvatars || []).includes(a.id);
    const equipped = p.avatar === a.id;
    const can = (p.coins || 0) >= a.price;
    html += `<div class="shop-tile ${owned ? 'owned' : can ? 'can' : 'poor'}">
      <div class="shop-av">${avatarHTML(a.id)}</div>
      <div class="shop-name">${a.name}</div>
      ${owned
        ? (equipped
          ? '<span class="shop-tag eq">✓ En uso</span>'
          : `<button class="bigbtn bb-green bb-sm" onclick="equipShopAvatar('${a.id}')">Usar</button>`)
        : `<button class="bigbtn ${can ? 'bb-gold' : 'bb-ghost'} bb-sm" onclick="buyShopAvatar('${a.id}')">🪙 ${a.price}</button>
           <div class="small" style="margin-top:4px;font-size:.62em">${can ? '¡Puedes comprarlo!' : `Te faltan ${a.price - (p.coins || 0)} 🪙`}</div>`}
    </div>`;
  });
  html += '</div>';
  return html;
}

window.buyShopAvatar = function (id) {
  const a = SHOP_AVATARS.find(x => x.id === id);
  const p = activeProfile();
  if (!a || !p) return;
  if ((p.unlockedAvatars || []).includes(id)) return;
  if ((p.coins || 0) < a.price) {
    notif(`🪙 Te faltan ${a.price - (p.coins || 0)} monedas — ¡sigue jugando!`, 'var(--red)');
    beep(false);
    return;
  }
  updateProfile(pp => {
    pp.coins = (pp.coins || 0) - a.price;
    pp.unlockedAvatars = [...(pp.unlockedAvatars || []), id];
    pp.avatar = id;
    pp.stats.avatarBought = (pp.stats.avatarBought || 0) + 1;
  });
  burst(70); beepWin();
  celebrate({
    icon: `<img class="cel-img" src="${AV_IMG(id)}" alt="" onerror="this.outerHTML='🎉'">`,
    title: `¡${a.name} es tuyo!`,
    sub: 'Nuevo avatar desbloqueado y equipado',
    rewards: [`🛍️ Colección: ${(activeProfile().unlockedAvatars || []).length}/${SHOP_AVATARS.length}`],
    confetti: 2, dur: 3000
  });
  renderTrophyContent(); updateTopbar(); checkBadges();
};

window.equipShopAvatar = function (id) {
  updateProfile(p => { p.avatar = id; });
  renderTrophyContent(); updateTopbar();
  notif('✅ Avatar equipado', 'var(--green)');
  beep(true);
};

/* ═════════════════════════════════════════
   V5 — ZONA DE PADRES (estadísticas + respaldo)
   ═════════════════════════════════════════ */
function parentsStatsHTML(p) {
  const s = p.stats || {};
  const days = Object.keys(s.daysPlayed || {}).length;
  const mastered = Object.values(p.mastery || {}).filter(v => v >= 3).length;
  const st = [
    ['✨ XP', (p.xp || 0) + ' · Nivel ' + (p.level || 1)],
    ['✅ Correctas', s.totalCorrect || 0],
    ['🎯 Misiones', s.missions || 0],
    ['💎 Perfectas', s.perfect || 0],
    ['📆 Días jugados', days],
    ['🏅 Insignias', (p.badges || []).length + '/' + BADGES.length],
    ['🧠 Repasos superados', s.learnedWords || 0],
    ['🔁 Errores por repasar', mistakeCount()],
    ['🎮 Juegos v5', `Mem: ${s.memGames || 0} · Esc: ${s.listenGames || 0}`],
    ['🎡 Giros de ruleta', s.spins || 0],
    // v7
    ['🎤 Sesiones de voz', s.sayGames || 0],
    ['🕵️ Intrusos ganados', s.oddGames || 0],
    ['📚 Palabras dominadas', mastered],
    ['🎓 Diplomas', (typeof diplomaList === 'function') ? diplomaList(p).length : 0],
  ];
  return `<div class="parent-grid">${st.map(x => `
    <div class="parent-cell"><span class="pc-k">${x[0]}</span><b class="pc-v">${x[1]}</b></div>`).join('')}</div>`;
}

window.exportProgress = function () {
  try {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pequeworld-progreso-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    notif('⬇️ Progreso exportado', 'var(--green)');
    beep(true);
  } catch (e) { notif('⚠️ No pude exportar', 'var(--red)'); }
};

window.triggerImport = function () {
  const i = $('importInp');
  if (i) i.click();
};

window.onImportPick = function (ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const o = JSON.parse(rd.result);
      if (!o || !o.profiles || typeof o.profiles !== 'object') throw new Error('formato');
      STATE = o;
      Object.values(STATE.profiles).forEach(pp => migrateProfile(pp));
      if (!STATE.settings) STATE.settings = defaultState().settings;
      if (!STATE.active || !STATE.profiles[STATE.active]) STATE.active = Object.keys(STATE.profiles)[0] || '';
      saveState();
      closeModal();
      renderLogin();
      showScreen('loginScreen');
      showUI(false);
      notif('✅ Progreso importado', 'var(--green)');
      beep(true);
    } catch (e) { notif('⚠️ Archivo de respaldo no válido', 'var(--red)'); }
  };
  rd.readAsText(f);
  ev.target.value = '';
};
