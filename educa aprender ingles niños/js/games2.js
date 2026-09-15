/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAMES v7 (nuevas mejoras)
   1) 🎤 Say It!      — estudio de pronunciación (graba tu voz)
   2) 🕵️ Odd One Out  — ¿cuál no pertenece?
   3) 📚 Diccionario  — todas las palabras con audio y dominio
   4) 🎓 Diplomas     — imprimibles (mundo 3⭐ y niveles)
   5) 📊 Gráfico de actividad (Zona de padres)
   6) ⭐ Mundo destacado del día (monedas x2)
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 6) ⭐ MUNDO DESTACADO DEL DÍA ══════════ */
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }
/* El mundo destacado es determinista por día y nivel: cambia cada día */
function isFeaturedWorld(id) {
  const w = WORLDS.find(x => x.id === id);
  if (!w) return false;
  const ws = WORLDS.filter(x => x.lvl === w.lvl);
  if (!ws.length) return false;
  return ws[hashStr(todayStr() + '|' + w.lvl) % ws.length].id === id;
}

/* ══════════ 1) 🎤 SAY IT! — ESTUDIO DE PRONUNCIACIÓN ══════════ */
const ST = { items: [], i: 0, active: false, practiced: 0, rec: null, chunks: [], url: '', stream: null, timer: null };
window.ST = ST; // accesible para depuración/tests

window.startSayMission = function () {
  beep(true);
  let pool = [];
  const lvlws = WORLDS.filter(w => w.lvl === (currentLevel || 1) && w.kind !== 'letters' && w.kind !== 'phrases');
  (lvlws.length ? lvlws : gameWorlds()).forEach(w => w.items.forEach(it => { if (it.img) pool.push(it); }));
  if (pool.length < 6) {
    gameWorlds().forEach(w => w.items.forEach(it => { if (it.img && !pool.includes(it)) pool.push(it); }));
  }
  if (pool.length < 6) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  ST.items = shuffle(pool).slice(0, 6);
  ST.i = 0; ST.active = true; ST.practiced = 0;
  showScreen('studioScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 1));
  renderSay();
};

function renderSay() {
  sayCleanupRec();
  const it = ST.items[ST.i];
  $('stFill').style.width = (ST.i / ST.items.length * 100) + '%';
  $('stLabel').textContent = `Palabra ${ST.i + 1}/${ST.items.length}`;
  $('stVisual').innerHTML = imgTag(it.img, it.em, 'say-img', it.en);
  $('stWord').textContent = it.en;
  $('stTrans').textContent = it.es || '';
  const pb = $('stPlay'); pb.disabled = true; pb.innerHTML = '▶️ Escucharme';
  const rb = $('stRec'); rb.disabled = false; rb.innerHTML = '🎙️ Grabar mi voz'; rb.classList.remove('recording');
  const nb = $('stNext'); nb.textContent = 'Siguiente ➜'; nb.onclick = () => window.sayNext();
  $('stTip').style.display = 'none';
  setTimeout(() => sayListen(), 500);
}

window.sayListen = function () {
  const it = ST.items[ST.i]; if (!it) return;
  beep(true);
  // dos veces: lento y natural (ideal para imitar)
  TTS.speak([
    { text: it.en, lang: 'en-US', rate: .64, pauseMs: 560 },
    { text: it.en, lang: 'en-US', rate: .8, pauseMs: 0 }
  ]);
};

window.sayRecToggle = function () {
  if (!ST.active) return;
  if (ST.rec && ST.rec.state === 'recording') return window.sayRecStop();
  const rb = $('stRec'), tip = $('stTip');
  (async () => {
    try {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || typeof MediaRecorder === 'undefined') throw new Error('no-api');
      ST.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ST.chunks = [];
      let rec;
      try {
        const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(m => MediaRecorder.isTypeSupported(m));
        rec = mime ? new MediaRecorder(ST.stream, { mimeType: mime }) : new MediaRecorder(ST.stream);
      } catch (e) { rec = new MediaRecorder(ST.stream); }
      ST.rec = rec;
      rec.ondataavailable = e => { if (e.data && e.data.size) ST.chunks.push(e.data); };
      rec.onstop = () => {
        try {
          if (ST.chunks.length) {
            const type = (ST.chunks[0] && ST.chunks[0].type) || 'audio/webm';
            if (ST.url) { try { URL.revokeObjectURL(ST.url); } catch (e) {} }
            ST.url = URL.createObjectURL(new Blob(ST.chunks, { type }));
            const pb = $('stPlay');
            if (pb) { pb.disabled = false; pb.innerHTML = '▶️ ¡Escucharme!'; }
            burst(25); beep(true);
            notif('✅ ¡Grabado! Toca ▶️ para compararte', 'var(--green)');
          }
        } catch (e) {}
        sayStopStream();
      };
      rec.start();
      rb.innerHTML = '⏹️ Parar'; rb.classList.add('recording');
      notif('🎙️ ¡Di la palabra en inglés!', 'var(--pink)');
      clearTimeout(ST.timer);
      ST.timer = setTimeout(() => { try { if (ST.rec && ST.rec.state === 'recording') ST.rec.stop(); } catch (e) {} }, 4500);
    } catch (e) {
      tip.style.display = 'block';
      tip.innerHTML = '⚠️ El micrófono no está disponible aquí. Practica igual: escucha 🔊 y repite en voz alta.';
      notif('🎙️ Sin micrófono — escucha 🔊 y repite', 'var(--orange)');
      beep(false);
    }
  })();
};

window.sayRecStop = function () {
  clearTimeout(ST.timer);
  try { if (ST.rec && ST.rec.state !== 'inactive') ST.rec.stop(); } catch (e) {}
};

function sayStopStream() {
  if (ST.stream) { ST.stream.getTracks().forEach(t => t.stop()); ST.stream = null; }
  const rb = $('stRec');
  if (rb && ST.active) { rb.classList.remove('recording'); rb.innerHTML = '🎙️ Grabar otra vez'; rb.disabled = false; }
}
function sayCleanupRec() {
  clearTimeout(ST.timer);
  try { if (ST.rec && ST.rec.state !== 'inactive') ST.rec.stop(); } catch (e) {}
  ST.rec = null;
  sayStopStream();
}
window.sayStopAll = function () {
  try { sayCleanupRec(); } catch (e) {}
  if (ST.url) { try { URL.revokeObjectURL(ST.url); } catch (e) {} ST.url = ''; }
  ST.active = false;
};

window.sayPlayMine = function () {
  if (!ST.url) return;
  beep(true);
  try { const a = new Audio(ST.url); a.play(); } catch (e) { notif('😕 No pude reproducir tu grabación', 'var(--red)'); }
};

window.sayNext = function () {
  ST.practiced++;
  ST.i++;
  if (ST.i >= ST.items.length) finishSay();
  else renderSay();
};

function finishSay() {
  const n = ST.practiced;
  sayCleanupRec();
  ST.active = false;
  updateProfile(p => {
    p.stats.sayGames = (p.stats.sayGames || 0) + 1;
    p.stats.daysPlayed[todayStr()] = true;
    p.xp = (p.xp || 0) + n * 8 + 20;
    p.coins = (p.coins || 0) + n * 4 + 10;
  });
  bumpDailyGoal();
  $('stFill').style.width = '100%';
  $('stLabel').textContent = '¡Ronda completa! 🎉';
  $('stVisual').innerHTML = uiTag('mascot_cheer', '🎤', 'say-img say-done');
  $('stWord').textContent = '¡Gran trabajo!';
  $('stTrans').textContent = `${n} palabras practicadas`;
  const pb = $('stPlay'); pb.disabled = true; pb.innerHTML = '▶️ Escucharme';
  const rb = $('stRec'); rb.disabled = true; rb.innerHTML = '🎙️ Grabar mi voz';
  const nb = $('stNext'); nb.textContent = '🔁 Otra ronda'; nb.onclick = () => window.startSayMission();
  $('stTip').style.display = 'none';
  burst(80); beepWin();
  celebrate({
    icon: '🎤',
    title: '¡Sesión de voz completa!',
    sub: 'Escuchar, repetir y comparar: así se aprende a pronunciar',
    rewards: [`🎤 ${n} palabras`, `✨ +${n * 8 + 20} XP`, `🪙 +${n * 4 + 10}`],
    confetti: 2, dur: 3200
  });
  checkBadges();
}

window.closeStudio = function () {
  ST.active = false;
  sayCleanupRec();
  if (ST.url) { try { URL.revokeObjectURL(ST.url); } catch (e) {} ST.url = ''; }
  navTo(0);
};

/* ══════════ 2) 🕵️ ODD ONE OUT — ¿CUÁL NO PERTENECE? ══════════ */
window.startOddMission = function () {
  beep(true);
  const ws = gameWorlds().filter(w => w.items.filter(i => i.img).length >= 3);
  const qs = [];
  let guard = 0;
  while (qs.length < 8 && guard++ < 300) {
    const w = ws[(Math.random() * ws.length) | 0];
    const same = shuffle(w.items.filter(i => i.img)).slice(0, 3);
    if (same.length < 3) continue;
    let intr = null;
    for (let t = 0; t < 40 && !intr; t++) {
      const w2 = ws[(Math.random() * ws.length) | 0];
      if (w2.id === w.id) continue;
      const cand = w2.items.filter(i => i.img && !same.some(s => s.en === i.en));
      if (cand.length) intr = cand[(Math.random() * cand.length) | 0];
    }
    if (!intr) continue;
    const itemWorld = WORLDS.find(x => x.items.includes(intr)) || w;
    qs.push({ world: w, itemWorld, item: intr, opts: shuffle([same[0], same[1], same[2], intr]), ans: intr });
  }
  if (qs.length < 4) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  bootGameMission('odd', 'Odd One Out', '¿Cuál no pertenece?', '🕵️', qs, renderOddQuestion);
};

function renderOddQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Intruso ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn'); if (lb) lb.style.display = 'none'; // el audio revelaría al intruso
  $('qBadge').textContent = '🕵️ ¿Cuál no pertenece?';
  $('qInstruction').textContent = '3 fotos son de «' + q.world.es + '» · toca al intruso';
  const wEl = $('qWord'); wEl.className = 'q-big-word'; wEl.style.display = 'none';
  $('qTrans').textContent = '';
  $('qVisual').innerHTML = `<div class="match-hint">🕵️ Uno de los 4 NO es de ${q.world.es}</div>`;

  const og = $('optsGrid');
  og.className = 'opts-grid odd-opts';
  og.classList.remove('revealed');
  og.innerHTML = '';
  q.opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'opt-btn odd-btn';
    b.dataset.correct = (opt === q.ans) ? '1' : '0';
    b.innerHTML = `${imgTag(opt.img, opt.em, 'ob-odd-img', opt.en)}<span class="ob-odd-word">${opt.en}</span>`;
    b.onclick = (e) => chooseOddAnswer(b, q, e);
    og.appendChild(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
}

window.chooseOddAnswer = function (el, q, evt) {
  if (Date.now() < G.lockUntil) return;
  G.lockUntil = now() + 900;
  const ok = el.dataset.correct === '1';
  const og = $('optsGrid');
  og.classList.add('revealed'); // revela las palabras tras responder (momento de enseñar)
  document.querySelectorAll('.odd-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('correct');
  });
  if (ok) {
    coreReward(q.item, evt);
    showFeedback(true, '¡Exacto! 🕵️', `${q.item.en} (${q.item.es}) no es de ${q.world.es}`);
    TTS.sayWord(q.item.en, q.item.es, 'words');
  } else {
    el.classList.add('wrong');
    recordMistake(q.itemWorld.id, q.item);
    if (coreFail(q) === 'dead') return;
  }
  updateTopbar();
};

/* ══════════ 3) 📚 MI DICCIONARIO ══════════ */
/* v9 [A-e]: en tablets modestas renderizar las 782 fichas de golpe provoca
   una pausa de 1-2 s. Se muestran por lotes con botón «Ver más». */
const DICT = { lvl: 0, world: '', shown: 350 };
const DICT_CHUNK = 350;

function dictMastery(en) {
  const p = activeProfile();
  return ((p && p.mastery && p.mastery[en]) || 0);
}

window.openDictionary = function () {
  beep(true);
  DICT.lvl = currentLevel || 0;
  DICT.world = '';
  DICT.shown = DICT_CHUNK; // v9: reinicia el lote al abrir
  renderDictionary();
  showScreen('dictScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 0));
  updateProfile(p => { p.stats.dictVisits = (p.stats.dictVisits || 0) + 1; });
  checkBadges();
};

window.closeDictionary = function () { navTo(0); };
window.dictSetLevel = function (l) { DICT.lvl = l; DICT.world = ''; DICT.shown = DICT_CHUNK; renderDictionary(); beep(true); };
window.dictSetWorld = function (id) { DICT.world = id; DICT.shown = DICT_CHUNK; renderDictionary(); beep(true); };
window.dictMore = function () { DICT.shown += DICT_CHUNK; renderDictionary(); beep(true); }; // v9

window.speakDictItem = function (en, es, el) {
  TTS.sayWord(en, es, 'words');
  beep(true);
  if (el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
};

function renderDictionary() {
  const p = activeProfile(); if (!p) return;
  // contadores globales de dominio
  let nN = 0, nA = 0, nM = 0, tot = 0;
  WORLDS.forEach(w => w.items.forEach(it => {
    tot++;
    const m = dictMastery(it.en);
    if (m >= 3) nM++; else if (m >= 1) nA++; else nN++;
  }));
  $('dictStats').innerHTML =
    `<span class="dict-pill new">🌱 ${nN} nuevas</span>
     <span class="dict-pill learned">✅ ${nA} aprendidas</span>
     <span class="dict-pill mastered">🏆 ${nM} dominadas</span>
     <span class="dict-pill tot">📚 ${tot}</span>`;

  const lc = $('dictLevelChips');
  lc.innerHTML = [0, 1, 2, 3].map(l =>
    `<button class="dict-chip${DICT.lvl === l ? ' on' : ''}" onclick="dictSetLevel(${l})">${l === 0 ? '🌍 Todos' : l === 1 ? '🌱 Nivel 1' : l === 2 ? '🚀 Nivel 2' : '🌟 Nivel 3'}</button>`
  ).join('');

  const worlds = WORLDS.filter(w => !DICT.lvl || w.lvl === DICT.lvl);
  const wc = $('dictWorldChips');
  wc.innerHTML = `<button class="dict-chip${DICT.world === '' ? ' on' : ''}" onclick="dictSetWorld('')">Todos los mundos</button>` +
    worlds.map(w => `<button class="dict-chip${DICT.world === w.id ? ' on' : ''}" onclick="dictSetWorld('${w.id}')">${w.icon} ${w.name}</button>`).join('');

  const wsrc = DICT.world ? WORLDS.filter(w => w.id === DICT.world) : worlds;
  const list = [];
  wsrc.forEach(w => w.items.forEach(it => list.push({ w, it })));
  const shown = list.slice(0, DICT.shown); // v9 [A-e]: render por lotes
  $('dictGrid').innerHTML = shown.map(({ w, it }) => {
    const m = dictMastery(it.en);
    const cls = m >= 3 ? 'mastered' : m >= 1 ? 'learned' : 'new';
    const tag = m >= 3 ? '🏆' : m >= 1 ? '✅' : '🌱';
    const en = (it.en || '').replace(/'/g, "\\'");
    const es = (it.es || '').replace(/'/g, "\\'");
    const vis = it.img
      ? imgTag(it.img, it.em, 'dt-img', it.en)
      : (w.kind === 'numbers'
        ? `<span class="dt-num">${it.num != null ? it.num : '★'}</span>`
        : `<span class="dt-em">${it.em || '✨'}</span>`);
    return `<button class="dict-tile ${cls}" onclick="speakDictItem('${en}','${es}',this)">
      ${vis}<span class="dt-en">${it.en}</span><span class="dt-es">${it.es || ''}</span><span class="dt-tag">${tag}</span>
    </button>`;
  }).join('') +
  (list.length > shown.length
    ? `<button class="dict-tile dict-more" onclick="dictMore()" aria-label="Mostrar más palabras"><span class="dt-em">➕</span><span class="dt-en">Ver más</span><span class="dt-es">quedan ${list.length - shown.length}</span></button>`
    : '');
}

/* ══════════ 4) 🎓 DIPLOMAS IMPRIMIBLES ══════════ */
function diplomaList(p) {
  const out = [];
  WORLDS.forEach(w => { if (((p.best && p.best[w.id]) || 0) >= 3) out.push({ kind: 'world', w }); });
  const lv = getPlayerLevel(p);
  if (lv >= 2) out.push({ kind: 'level', lv: 2 });
  if (lv >= 3) out.push({ kind: 'level', lv: 3 });
  return out;
}

window.renderDiplomasTab = function () {
  const p = activeProfile();
  const host = $('trophyContent');
  const list = diplomaList(p);
  window._diplomas = list;
  let html = `<div class="small" style="text-align:center;margin-bottom:10px">
    🎓 Completa un mundo con 3⭐ o sube de nivel para ganar diplomas. ¡Puedes <b>imprimirlos</b> y colgarlos!
  </div>`;
  if (!list.length) {
    html += `<div class="empty-diploma">🎓 Aún no tienes diplomas.<br>¡Completa un mundo con 3 estrellas y vuelve!</div>`;
  } else {
    html += '<div class="diploma-grid">';
    list.forEach((d, i) => {
      const name = d.kind === 'world' ? d.w.name : LEVEL_NAMES[d.lv];
      const es = d.kind === 'world' ? d.w.es : 'Diploma de nivel';
      html += `<div class="b-tile earned diploma-tile">
        <div class="medal-frame"><div class="bt-ico">🎓</div></div>
        <div class="bt-name">${name}</div>
        <div class="bt-desc">${es}</div>
        <button class="bigbtn bb-gold bb-sm dp-btn" onclick="openDiploma(${i})">Ver 🎓</button>
      </div>`;
    });
    html += '</div>';
  }
  host.innerHTML = html;
};

window.openDiploma = function (i) {
  const p = activeProfile();
  const d = (window._diplomas || [])[i];
  if (!d || !p) return;
  const isW = d.kind === 'world';
  const tName = isW ? d.w.name : LEVEL_NAMES[d.lv];
  const tEs = isW ? d.w.es : '¡Todo tu esfuerzo te llevó al siguiente nivel!';
  const starsTxt = isW ? '⭐ ⭐ ⭐' : '🏆';
  openModal('🎓 Mi Diploma', `
    <div class="diploma" id="diplomaCard">
      <div class="dp-inner">
        <div class="dp-ribbon">🌈 PequeWorld</div>
        <div class="dp-kicker">certifica que</div>
        <div class="dp-name">${esc(p.name)}</div>
        <div class="dp-av">${avatarHTML(p.avatar === 'custom' ? 'custom' : p.avatar, p.avatarData)}</div>
        <div class="dp-body">ha dominado ${isW ? 'el mundo de' : 'el nivel'}</div>
        <div class="dp-world">${tName}</div>
        <div class="dp-es">${tEs}</div>
        <div class="dp-stars">${starsTxt}</div>
        <div class="dp-date">${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>`, `
    <button class="bigbtn bb-green bb-sm" onclick="printDiploma()">🖨️ Imprimir</button>
    <button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">✕ Cerrar</button>
  `);
  burst(50); beepWin();
};

window.printDiploma = function () {
  beep(true);
  document.body.classList.add('print-diploma');
  const done = () => { document.body.classList.remove('print-diploma'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 60);
  setTimeout(done, 60000);
};

/* ══════════ 5) 📊 GRÁFICO DE ACTIVIDAD (Zona de padres) ══════════ */
window.renderActivityChart = function () {
  const cv = $('actChart'); if (!cv) return;
  const p = activeProfile(); if (!p) return;
  const mbd = (p.stats && p.stats.missionsByDay) || {};
  const days = [];
  for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 864e5));
  const vals = days.map(d => mbd[localDayStr(d)] || 0); // v9 [C-2]: día local
  const W = 672, H = 210;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const max = Math.max(3, ...vals);
  const padX = 30, baseY = H - 34, bw = (W - padX * 2) / 14;
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(padX - 6, baseY); ctx.lineTo(W - padX + 6, baseY); ctx.stroke();
  const dls = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  ctx.textAlign = 'center';
  days.forEach((d, i) => {
    const v = vals[i];
    const h = Math.round((baseY - 52) * (v / max));
    const x = padX + i * bw + 3;
    ctx.fillStyle = v ? '#FFD700' : 'rgba(255,255,255,.09)';
    ctx.fillRect(x, baseY - Math.max(h, v ? 7 : 4), bw - 6, Math.max(h, v ? 7 : 4));
    ctx.fillStyle = 'rgba(158,143,187,.95)';
    ctx.font = '700 19px Nunito, sans-serif';
    ctx.fillText(dls[d.getDay()], x + (bw - 6) / 2, H - 10);
    if (v) {
      ctx.fillStyle = '#F8F4FF';
      ctx.font = '900 19px Nunito, sans-serif';
      ctx.fillText(String(v), x + (bw - 6) / 2, baseY - h - 8);
    }
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(248,244,255,.9)';
  ctx.font = '800 21px Nunito, sans-serif';
  ctx.fillText('Misiones por día · últimos 14 días', padX - 6, 24);
};
