/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAMES v8 (mejoras DSEBI aprobadas)
   1) 🔒 Puerta parental (acciones de adultos)     [A2]
   2) 🧭 Tour de bienvenida + objetivo visible      [A1]
   3) 🎧 Selector de voz en inglés                  [B5]
   4) ⚡ Sesión Rápida de 5 minutos                 [B1]
   5) 🔁 Prioridad de repaso (falladas + días)      [B2]
   6) 🖨️ Informe de padres imprimible + AAP         [B3]
   7) 🏆 Álbum de hitos de palabras dominadas       [B4]
   8) 🗣️ Dictado por voz en Say It!                 [C1]
   9) 🧩 Sentence Builder (oraciones)               [C3]
   10) 👥 Cambiar de jugador                        [C4]
   11) 🔵 Rimas                                     [C5]
   12) 📶 Registro del service worker (PWA)         [A5]
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 1) 🔒 PUERTA PARENTAL ══════════ */
/* Protege importar/borrar: un adulto debe resolver la multiplicación.
   El niño puede salir con «Volver al juego» sin perder nada. */
window.askAdult = function (title, cb) {
  const a = 3 + ((Math.random() * 6) | 0), b = 4 + ((Math.random() * 5) | 0);
  const ans = a * b;
  const opts = shuffle([ans, ans + 1 + ((Math.random() * 3) | 0), Math.max(2, ans - 1 - ((Math.random() * 3) | 0))]);
  const ov = document.createElement('div');
  ov.className = 'pgate-overlay';
  ov.innerHTML = `<div class="pgate-box" role="dialog" aria-label="Verificación para adultos">
    <div class="pgate-ico">🔒</div>
    <div class="pgate-title">${title || 'Solo para adultos'}</div>
    <div class="pgate-sub">Para proteger tu progreso, un adulto debe responder:</div>
    <div class="pgate-q">¿Cuánto es ${a} × ${b}?</div>
    <div class="pgate-opts">${opts.map(o => `<button class="bigbtn bb-ghost bb-sm" data-v="${o}">${o}</button>`).join('')}</div>
    <button class="bigbtn bb-gold bb-sm" id="pgCancel">↩️ Volver al juego</button>
  </div>`;
  document.body.appendChild(ov);
  beep(true);
  ov.querySelectorAll('.pgate-opts button').forEach(btn => {
    btn.onclick = () => {
      if (+btn.dataset.v === ans) { ov.remove(); beepWin(); if (cb) cb(); }
      else { btn.classList.add('wrong'); beep(false); setTimeout(() => btn.classList.remove('wrong'), 420); }
    };
  });
  ov.querySelector('#pgCancel').onclick = () => { ov.remove(); beep(true); };
};

/* ══════════ 2) 🧭 TOUR DE BIENVENIDA ══════════ */
const TOUR_STEPS = [
  { ico: '🗺️', t: '1 · Explora los Mundos', d: 'En el mapa toca un mundo para aprender sus palabras con <b>fotos de verdad</b>. Cada misión te da estrellas ⭐ y monedas 🪙.' },
  { ico: '🎮', t: '2 · Juega en la Zona de Juegos', d: '⚡ <b>Rápido</b> (5 min) · 🔤 Completa · 🧩 Empareja · 🃏 Memoria · 🎧 Escucha · 🎤 Di la palabra · 🕵️ Intruso · 🧩 Oraciones · 🔵 Rimas · 📚 Diccionario · 🔁 Repaso.' },
  { ico: '👨‍👩‍👧', t: '3 · Familia, premios y cuidado', d: 'Gana insignias, diplomas y hitos 🏆. En <b>⚙️ Ajustes → Zona de padres</b> verás el progreso, el informe imprimible y la copia de seguridad. <b>Todo queda en este dispositivo.</b>' },
];
window.startTour = function (peek) {
  let i = 0;
  const ov = document.createElement('div');
  ov.className = 'tour-overlay';
  const draw = () => {
    const s = TOUR_STEPS[i];
    ov.innerHTML = `<div class="tour-box" role="dialog" aria-label="Tour de bienvenida">
      <span class="tour-ico">${s.ico}</span>
      <div class="tour-title">${s.t}</div>
      <div class="tour-text">${s.d}</div>
      <div class="tour-dots">${TOUR_STEPS.map((_, k) => `<span class="tdot${k === i ? ' on' : ''}"></span>`).join('')}</div>
      <div class="tour-btns">
        ${i > 0 ? '<button class="bigbtn bb-ghost bb-sm" id="tourPrev">⬅ Atrás</button>' : '<span></span>'}
        <button class="bigbtn bb-gold bb-sm" id="tourNext">${i < TOUR_STEPS.length - 1 ? 'Siguiente ➜' : '¡A jugar! 🚀'}</button>
      </div>
      <button class="tour-skip" id="tourSkip">${peek ? 'Cerrar' : 'Saltar el tour'}</button>
    </div>`;
    const nx = ov.querySelector('#tourNext');
    if (nx) nx.onclick = () => { beep(true); if (i < TOUR_STEPS.length - 1) { i++; draw(); } else finish(); };
    const pv = ov.querySelector('#tourPrev');
    if (pv) pv.onclick = () => { beep(true); i = Math.max(0, i - 1); draw(); };
    ov.querySelector('#tourSkip').onclick = () => { beep(true); finish(); };
    // pronuncia el paso para prelectores
    TTS.speak([{ text: 'PequeWorld', lang: 'en-US', rate: .8 }]);
  };
  const finish = () => {
    ov.remove();
    if (!peek) {
      updateProfile(p => { p.tourDone = true; });
      celebrate({ icon: uiTag('mascot_cheer', '🎈', 'cel-img'), title: '¡Todo listo!', sub: 'Tu meta de hoy te espera en el mapa', rewards: ['🎯 Completa 3 misiones hoy', '🎁 Reclama tu premio diario'], confetti: 2, dur: 3000 });
    }
  };
  document.body.appendChild(ov);
  draw();
};

/* ══════════ 3) 🎧 SELECTOR DE VOZ (EN) ══════════ */
window.voiceOptionsEN = function () {
  if (!window.speechSynthesis) return [];
  try { return window.speechSynthesis.getVoices().filter(v => /^en[-_]?/i.test(v.lang)); } catch (e) { return []; }
};
window.populateVoiceSel = function () {
  const sel = $('voiceSel'); if (!sel) return;
  const vs = voiceOptionsEN();
  if (!vs.length) {
    sel.innerHTML = '<option value="">Voz del sistema</option>';
    return;
  }
  sel.innerHTML = '<option value="">⭐ Automática (recomendada)</option>' +
    vs.map(v => `<option value="${(v.voiceURI || '').replace(/"/g, '&quot;')}" ${STATE.settings.voiceURI === v.voiceURI ? 'selected' : ''}>${v.name} (${v.lang})</option>`).join('');
};
window.setVoiceURI = function (v) {
  STATE.settings.voiceURI = v || ''; saveState();
  window.previewVoice();
  notif('🔊 Voz actualizada', 'var(--green)');
};
window.previewVoice = function () {
  beep(true);
  TTS.speak([{ text: 'Hello! Let us learn English!', lang: 'en-US', rate: .85 }]);
};

/* ══════════ 5) 🔁 PRIORIDAD DE REPASO (compartida) ══════════ */
/* Score = veces fallada (peso 2) + días desde el último fallo (peso 3, tope 7).
   Primero lo más difícil y lo más viejo: repaso con repetición espaciada simple. */
window.prioritizedMistakes = function () {
  const p = activeProfile(); if (!p || !p.mistakes) return [];
  const t = now();
  return Object.entries(p.mistakes).sort((x, y) => {
    const score = e => (e[1].count || 1) * 2 + Math.min(7, Math.floor((t - (e[1].last || 0)) / 864e5)) * 3;
    return score(y) - score(x);
  });
};

/* ══════════ 4) ⚡ SESIÓN RÁPIDA (5 minutos) ══════════ */
/* Mezcla automática: hasta 4 errores priorizados + 4 palabras nuevas
   de los mundos con menos estrellas del nivel actual. Cero decisiones
   para el niño: toca ⚡ y a jugar. */
window.startQuickSession = function () {
  beep(true);
  const p = activeProfile(); if (!p) return;
  const qs = [];

  // 1) repasos priorizados (foto → palabra)
  (window.prioritizedMistakes ? prioritizedMistakes() : []).slice(0, 4).forEach(([key, m]) => {
    const w = WORLDS.find(x => x.id === m.worldId);
    const it = w && w.items.find(x => x.en === m.en);
    if (!w || !it || !it.img) return;
    let wrongs = shuffle(w.items.filter(x => x !== it)).slice(0, 3);
    if (wrongs.length < 3) wrongs = wrongs.concat(shuffle(gameWorlds().filter(ww => ww.id !== w.id).flatMap(ww => ww.items.filter(x => x.en !== it.en))).slice(0, 3 - wrongs.length));
    qs.push({ key, world: w, item: it, type: 'choice', opts: shuffle([it, ...wrongs.slice(0, 3)]), ans: it });
  });

  // 2) novedades: mundos con menos estrellas del nivel actual
  const ws = WORLDS.filter(w => w.lvl === currentLevel)
    .sort((a, b) => (bestStars(p, a.id) - bestStars(p, b.id)) || (a.items.length - b.items.length));
  const novelties = [];
  for (const w of ws) {
    if (novelties.length >= 4) break;
    const cands = shuffle(w.items.filter(it => it.img && !qs.some(q => q.item === it) && !novelties.some(n => n.item === it)));
    if (cands.length) novelties.push({ world: w, item: cands[0] });
  }
  if (!novelties.length) {
    gameWorlds().forEach(w => w.items.forEach(it => { if (it.img && novelties.length < 4 && !qs.some(q => q.item === it)) novelties.push({ world: w, item: it }); }));
  }
  novelties.forEach(({ world: w, item: it }) => {
    let wrongs = shuffle(w.items.filter(x => x !== it && x.img)).slice(0, 3);
    if (wrongs.length < 3) wrongs = wrongs.concat(shuffle(gameWorlds().filter(ww => ww.id !== w.id).flatMap(ww => ww.items.filter(x => x.img && x.en !== it.en))).slice(0, 3 - wrongs.length));
    qs.push({ world: w, item: it, type: 'choice', opts: shuffle([it, ...wrongs.slice(0, 3)]), ans: it });
  });

  if (qs.length < 4) { notif('📚 Juega un mundo primero para desbloquear ⚡ Rápido', 'var(--red)'); return; }
  bootGameMission('quick', '⚡ Rápido', 'Sesión de 5 minutos', '⚡', shuffle(qs), renderQuickQuestion);
};

function renderQuickQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Paso ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '⚡ Sesión Rápida';
  $('qVisual').innerHTML = imgTag(q.item.img, q.item.em, 'q-big-img', q.item.en);
  $('qInstruction').textContent = q.key ? '🔄 ¡Otra vez! ¿Cómo se dice?' : '✨ ¿Cómo se dice en inglés?';
  const wEl = $('qWord');
  wEl.className = 'q-big-word'; wEl.style.display = ''; wEl.textContent = q.item.es;
  $('qTrans').textContent = 'Toca la palabra correcta 👇';
  const og = $('optsGrid');
  og.className = 'opts-grid';
  og.innerHTML = '';
  q.opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.dataset.correct = (opt === q.ans) ? '1' : '0';
    b.innerHTML = `${imgTag(opt.img, opt.em, 'ob-img sm', opt.en)}<span class="ob-word ob-word-lg">${opt.en}</span>`;
    b.onclick = (e) => {
      if (Date.now() < G.lockUntil) return;
      G.lockUntil = now() + 900;
      document.querySelectorAll('.opt-btn').forEach(x => { x.disabled = true; if (x.dataset.correct === '1') x.classList.add('correct'); });
      if (b.dataset.correct === '1') {
        if (q.key) { clearMistake(q.key); G.learned = (G.learned || 0) + 1; }
        coreReward(q.item, e);
        showFeedback(true, '¡Genial! 🎉', `${q.item.en} = ${q.item.es}`);
        TTS.sayWord(q.item.en, q.item.es, 'words');
      } else {
        b.classList.add('wrong');
        recordMistake(q.world.id, q.item);
        if (coreFail(q) === 'dead') return;
      }
      updateTopbar();
    };
    og.appendChild(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
  setTimeout(() => TTS.speak([{ text: q.item.es + '. In English?', lang: 'es-ES', rate: .8 }]), 300);
}

/* ══════════ 9) 🧩 SENTENCE BUILDER (C3) ══════════ */
const SENT_TPL = [
  { parts: ['I', 'see'], art: true, es: 'Yo veo…' },
  { parts: ['It', 'is'], art: true, es: 'Esto es…' },
  { parts: ['Look', 'at', 'the'], art: false, es: 'Mira el/la…' },
  { parts: ['This', 'is', 'a'], art: false, es: 'Este es…' },
];
function sentenceFor(tpl, it) {
  const art = tpl.art ? (/^[aeiou]/i.test(it.en) ? 'an' : 'a') : null;
  const words = [...tpl.parts, ...(art ? [art] : []), it.en];
  return words.map((w, i) => ({ w, i }));
}
window.startSentenceMission = function () {
  beep(true);
  const pool = [];
  WORLDS.forEach(w => { if (w.kind === 'words') w.items.forEach(it => { if (it.img && /^[a-z]+$/i.test(it.en)) pool.push({ w, it }); }); });
  if (pool.length < 6) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const picks = shuffle(pool).slice(0, 6);
  const qs = picks.map(({ w, it }) => {
    const tpl = SENT_TPL[(Math.random() * SENT_TPL.length) | 0];
    const words = sentenceFor(tpl, it);
    return { world: w, item: it, tpl, words, opts: shuffle(words) };
  });
  bootGameMission('sentence', 'Sentence Builder', 'Mis primeras oraciones', '🧩', qs, renderSentenceQuestion);
};

function renderSentenceQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  if (!G.sent) G.sent = { placed: [] };
  $('gProgLabel').textContent = `Oración ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '🧩 Arma la oración';
  $('qVisual').innerHTML = imgTag(q.item.img, q.item.em, 'q-big-img', q.item.en);
  $('qInstruction').textContent = `Toca las palabras en orden: «${q.tpl.es} …»`;
  const wEl = $('qWord'); wEl.className = 'q-big-word'; wEl.style.display = 'none';
  $('qTrans').textContent = '';

  const og = $('optsGrid');
  og.className = 'sent-host';
  og.innerHTML = `
    <div class="sent-slots" id="sentSlots">${q.words.map((_, k) => `<span class="sent-slot${k < G.sent.placed.length ? ' filled' : ''}">${k < G.sent.placed.length ? G.sent.placed[k].w : k === G.sent.placed.length ? '?' : ''}</span>`).join('')}</div>
    <div class="sent-tokens">${q.opts.map((t, i) => `<button class="sent-token${G.sent.placed.some(p => p.i === t.i) ? ' used' : ''}" data-i="${i}" data-w="${t.w}">${t.w}</button>`).join('')}</div>`;
  og.querySelectorAll('.sent-token').forEach(b => {
    b.onclick = () => sentenceTap(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
}

window.sentenceTap = function (btn) {
  if (!G.active) return;
  const q = G.questions[G.qi];
  const idx = +btn.dataset.i;
  const tok = q.opts[idx];
  if (G.sent.placed.some(p => p.i === tok.i)) return; // ya usada
  const expected = q.words[G.sent.placed.length];
  if (tok.i === expected.i) {
    G.sent.placed.push(tok);
    btn.classList.add('used');
    beep(true);
    TTS.speak([{ text: tok.w, lang: 'en-US', rate: .78 }]);
    const slots = $('sentSlots');
    if (slots) {
      const k = G.sent.placed.length - 1;
      const spans = slots.querySelectorAll('.sent-slot');
      spans[k].textContent = tok.w;
      spans[k].classList.add('filled', 'pop');
    }
    if (G.sent.placed.length >= q.words.length) {
      // oración completa: premio + leerla en voz alta
      const full = q.words.map(x => x.w).join(' ');
      setTimeout(() => TTS.speak([{ text: full, lang: 'en-US', rate: .72 }]), 450);
      coreReward(q.item, null);
      showFeedback(true, '¡Oración perfecta! 🧩', `“${full}”`);
      burst(40);
      updateTopbar();
      setTimeout(() => {
        $('feedbackBar').className = 'feedback-bar';
        G.sent = { placed: [] };
        G.qi++;
        if (G.qi >= G.questions.length) endMission();
        else renderSentenceQuestion();
      }, 1100);
    }
  } else {
    // suave: solo avisa (sin perder vida) — construir oraciones es difícil
    btn.classList.add('wiggle');
    setTimeout(() => btn.classList.remove('wiggle'), 420);
    beep(false);
    recordMistake(q.world.id, q.item);
    notif('🤔 Esa no va aquí todavía — ¡mira el orden!', 'var(--orange)');
  }
};

/* ══════════ 11) 🔵 RIMAS (C5) ══════════ */
const RHYME_PAIRS = [
  ['cat', 'hat'], ['dog', 'frog'], ['bear', 'chair'], ['star', 'car'],
  ['bee', 'tree'], ['goat', 'boat'], ['king', 'ring'], ['train', 'rain'], ['whale', 'snail'],
];
function itemByEn(en) {
  for (const w of WORLDS) { const it = w.items.find(x => x.en.toLowerCase() === en.toLowerCase() && x.img); if (it) return { w, it }; }
  return null;
}
window.startRhymeMission = function () {
  beep(true);
  const qs = [];
  const pairs = shuffle(RHYME_PAIRS).slice(0, 8);
  pairs.forEach(([a, b]) => {
    const A = itemByEn(a), B = itemByEn(b);
    if (!A || !B) return;
    // distractores: palabras que NO riman con a/b
    const dis = [];
    let guard = 0;
    while (dis.length < 2 && guard++ < 200) {
      const w = gameWorlds()[(Math.random() * gameWorlds().length) | 0];
      const it = w && w.items[(Math.random() * w.items.length) | 0];
      if (!it || !it.img) continue;
      const en = it.en.toLowerCase();
      if (en === a || en === b) continue;
      if (RHYME_PAIRS.some(p => p.includes(en))) continue;
      if (dis.some(d => d.it.en === it.en)) continue;
      if (en.slice(-2) === b.toLowerCase().slice(-2)) continue;
      dis.push({ w, it });
    }
    if (dis.length < 2) return;
    qs.push({ prompt: A, item: B.it, world: B.w, opts: shuffle([B.it, dis[0].it, dis[1].it]), ans: B.it });
  });
  if (qs.length < 4) { notif('📚 Faltan fotos para jugar rimas', 'var(--red)'); return; }
  bootGameMission('rhyme', 'Rhyme Time', '¿Qué rima?', '🔵', qs, renderRhymeQuestion);
};

function renderRhymeQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Rima ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '🔵 Rhyme Time';
  $('qVisual').innerHTML = imgTag(q.prompt.it.img, q.prompt.it.em, 'q-big-img', q.prompt.it.en);
  $('qInstruction').textContent = '¿Cuál de estas RIMA con…?';
  const wEl = $('qWord');
  wEl.className = 'q-big-word'; wEl.style.display = ''; wEl.textContent = q.prompt.it.en;
  $('qTrans').textContent = 'Toca la foto que suena parecido 👇';
  const og = $('optsGrid');
  og.className = 'opts-grid';
  og.innerHTML = '';
  q.opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.dataset.correct = (opt === q.ans) ? '1' : '0';
    b.innerHTML = `${imgTag(opt.img, opt.em, 'ob-img', opt.en)}<span class="ob-word">${opt.en}</span>`;
    b.onclick = (e) => {
      if (Date.now() < G.lockUntil) return;
      G.lockUntil = now() + 900;
      document.querySelectorAll('.opt-btn').forEach(x => { x.disabled = true; if (x.dataset.correct === '1') x.classList.add('correct'); });
      if (b.dataset.correct === '1') {
        coreReward(q.item, e);
        showFeedback(true, '¡Rima perfecta! 🔵', `${q.prompt.it.en} — ${q.item.en} ¡suena igual al final!`);
        TTS.speak([{ text: q.prompt.it.en, lang: 'en-US', rate: .72, pauseMs: 420 }, { text: q.item.en, lang: 'en-US', rate: .72 }]);
      } else {
        b.classList.add('wrong');
        recordMistake(q.world.id, q.item);
        if (coreFail(q) === 'dead') return;
      }
      updateTopbar();
    };
    og.appendChild(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
  setTimeout(() => TTS.speak([{ text: q.prompt.it.en, lang: 'en-US', rate: .7 }, { text: 'What rhymes with ' + q.prompt.it.en + '?', lang: 'en-US', rate: .8, pauseMs: 0 }]), 350);
}

/* ══════════ 7) 🏆 HITOS DE PALABRAS DOMINADAS ══════════ */
window.masteredCount = function () {
  const p = activeProfile(); if (!p || !p.mastery) return 0;
  return Object.values(p.mastery).filter(v => v >= 3).length;
};
window.checkMilestones = function () {
  const p = activeProfile(); if (!p) return;
  p.milestones = p.milestones || {};
  const n = masteredCount();
  MILESTONES.forEach(m => {
    if (n >= m && !p.milestones[m]) {
      p.milestones[m] = todayStr();
      updateProfile(pp => { pp.stars = (pp.stars || 0) + 3; pp.coins = (pp.coins || 0) + 15; });
      celebrate({
        icon: uiTag('ui_trophy', '🏆', 'cel-img'),
        title: `¡${m} palabras dominadas!`,
        sub: 'Página nueva en tu álbum de hitos 🏆',
        rewards: [`📚 ${m} palabras con 🏆`, '⭐ +3 Estrellas', '🪙 +15 Monedas'],
        confetti: 3, dur: 3600
      });
    }
  });
  saveState();
};
window.renderMilestonesTab = function () {
  const p = activeProfile();
  const host = $('trophyContent');
  const n = masteredCount();
  const next = MILESTONES.find(m => n < m);
  let html = `<div class="small" style="text-align:center;margin-bottom:8px">
    📚 Tienes <b style="color:var(--gold)">${n}</b> palabras dominadas (🏆). ¡Sigue así!
  </div>
  <div class="ms-progress"><div class="ms-fill" style="width:${next ? clamp((n / next) * 100, 0, 100) : 100}%"></div></div>
  <div class="small" style="text-align:center;margin:4px 0 12px">${next ? `Próximo hito: <b>${next} palabras</b> (${next - n} para lograrlo)` : '¡Todos los hitos logrados! 🎉'}</div>
  <div class="ms-grid">`;
  MILESTONES.forEach(m => {
    const done = !!((p.milestones || {})[m]);
    const pct = clamp((n / m) * 100, 0, 100);
    html += `<div class="ms-card ${done ? 'earned' : 'locked'}">
      <div class="ms-ico">${done ? '🏆' : '🔒'}</div>
      <div class="ms-n">${m} palabras</div>
      ${done ? `<div class="ms-date">✅ ${p.milestones[m]}</div>` : `<div class="ms-bar"><span style="width:${pct}%"></span></div><div class="ms-date">${n}/${m}</div>`}
    </div>`;
  });
  html += '</div>';
  host.innerHTML = html;
};

/* ══════════ 6) 🖨️ INFORME PARA LA FAMILIA (imprimible + AAP) ══════════ */
window.openParentsReport = function () {
  const p = activeProfile(); if (!p) return;
  const s = p.stats || {};
  const lv = p.level || 1;
  const row = (k, v) => `<tr><td>${k}</td><td><b>${v}</b></td></tr>`;
  openModal('🖨️ Informe para la familia', `
    <div class="pw-report" id="parentsReport">
      <div class="pr-head"><span class="pr-logo">🌈 PequeWorld</span><span class="pr-date">${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <div class="pr-child">
        ${avatarHTML(p.avatar === 'custom' ? 'custom' : p.avatar, p.avatarData)}
        <div><div class="pr-name">${p.name}</div><div class="pr-lv">Nivel ${lv} · ${LEVEL_NAMES[lv]}</div></div>
      </div>
      <table class="pr-table">
        ${row('✨ XP', p.xp || 0)}
        ${row('✅ Respuestas correctas', s.totalCorrect || 0)}
        ${row('🎯 Misiones completadas', s.missions || 0)}
        ${row('💎 Misiones perfectas', s.perfect || 0)}
        ${row('📆 Días de juego', Object.keys(s.daysPlayed || {}).length)}
        ${row('📚 Palabras aprendidas', Object.values(p.mastery || {}).filter(v => v >= 1).length)}
        ${row('🏆 Palabras dominadas', masteredCount())}
        ${row('🏅 Insignias', (p.badges || []).length + ' de ' + BADGES.length)}
        ${row('🎓 Diplomas', (typeof diplomaList === 'function') ? diplomaList(p).length : 0)}
        ${row('🔁 Errores por repasar', mistakeCount())}
        ${row('🎤 Sesiones de voz', s.sayGames || 0)}
        ${row('🔥 Mejor racha', p.maxStreak || 0)}
      </table>
      <div class="pr-tips">
        <div class="pr-tips-t">💡 Consejos de uso saludable — basados en las recomendaciones públicas de la American Academy of Pediatrics (Pediatrics, 2016):</div>
        <ul>
          <li>De 2 a 5 años: alrededor de <b>1 hora al día</b> de contenido de calidad, idealmente <b>acompañando</b> a tu peque.</li>
          <li>La app enseña palabras: <b>repítanlas juntos</b> y úsenlas en casa (la conversación multiplica el aprendizaje).</li>
          <li>Apaguen las pantallas al menos <b>1 hora antes de dormir</b>.</li>
          <li>PequeWorld <b>acompaña</b>, no reemplaza el juego libre, los libros ni el tiempo en familia.</li>
        </ul>
      </div>
      <div class="pr-priv">🔒 Privacidad: el progreso, la foto y el nombre viven <b>solo en este dispositivo</b> (localStorage). Nada se envía a internet y las grabaciones de voz no se guardan.</div>
    </div>`, `
    <button class="bigbtn bb-green bb-sm" onclick="printParentsReport()">🖨️ Imprimir / Guardar PDF</button>
    <button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">✕ Cerrar</button>
  `);
  beep(true);
};
window.printParentsReport = function () {
  beep(true);
  document.body.classList.add('print-report');
  const done = () => { document.body.classList.remove('print-report'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 60);
  setTimeout(done, 60000);
};

/* ══════════ 8) 🗣️ DICTADO POR VOZ (Say It!) ══════════ */
window.sayDictate = function () {
  const it = window.ST && ST.items && ST.items[ST.i];
  if (!it) return;
  const tip = $('stTip');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    if (tip) { tip.style.display = 'block'; tip.innerHTML = '⚠️ Este navegador aún no entiende tu voz (prueba Chrome o Edge). ¡Pero puedes escuchar 🔊 y repetir en voz alta!'; }
    beep(false);
    return;
  }
  try { if (window._stSR) window._stSR.abort(); } catch (e) {}
  beep(true);
  if (tip) { tip.style.display = 'block'; tip.innerHTML = `👂 Escuchando… di «<b>${it.en}</b>» en inglés`; }
  try {
    const r = new SR();
    window._stSR = r;
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 6;
    r.onresult = (e) => {
      const heard = [];
      for (let k = 0; k < e.results[0].length; k++) heard.push((e.results[0][k].transcript || '').toLowerCase().replace(/[^a-z ]/g, '').trim());
      const target = it.en.toLowerCase();
      const ok = heard.some(h => h === target || h.split(/\s+/).includes(target));
      if (ok) {
        if (tip) tip.innerHTML = `🎉 ¡Escuché «${target}»! ¡Excelente pronunciación!`;
        burst(50); beepWin();
        floatXP('+8 XP', innerWidth / 2 - 20, innerHeight / 2);
        updateProfile(p => { p.xp = (p.xp || 0) + 8; p.coins = (p.coins || 0) + 4; p.stats.dictOk = (p.stats.dictOk || 0) + 1; p.mastery = p.mastery || {}; p.mastery[it.en] = (p.mastery[it.en] || 0) + 1; });
        saveState(); updateTopbar();
      } else {
        if (tip) tip.innerHTML = `🤔 Escuché «${heard[0] || '…'}» — ¡inténtalo otra vez, tú puedes!`;
        beep(false);
        updateProfile(p => { p.stats.dictTry = (p.stats.dictTry || 0) + 1; });
      }
    };
    r.onerror = (ev) => {
      if (tip) tip.innerHTML = ev.error === 'not-allowed'
        ? '⚠️ El micrófono no tiene permiso aquí. Usa «Grabar mi voz» 🎙️ o practica escuchando 🔊.'
        : '😕 No te escuché bien. ¡Otra vez!';
      beep(false);
    };
    r.start();
  } catch (err) {
    if (tip) tip.innerHTML = '⚠️ No pude usar el micrófono aquí.';
  }
};
/* apaga el reconocedor al navegar el estudio */
(() => {
  const stop = () => { try { if (window._stSR) window._stSR.abort(); } catch (e) {} };
  const wrap = (fn) => { const old = window[fn]; if (typeof old === 'function') window[fn] = function () { stop(); return old.apply(this, arguments); }; };
  ['sayNext', 'closeStudio', 'startSayMission', 'sayRecToggle'].forEach(wrap);
})();

/* ══════════ 10) 👥 CAMBIAR DE JUGADOR ══════════ */
window.switchPlayer = function () {
  beep(true);
  closeModal();
  renderLogin();
  showScreen('loginScreen');
  showUI(false);
  notif('👥 Elige tu perfil y toca «¡Entrar!»', 'var(--blue)');
};

/* ══════════ 12) 📶 PWA: registrar service worker si hay contexto seguro ══════════ */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
