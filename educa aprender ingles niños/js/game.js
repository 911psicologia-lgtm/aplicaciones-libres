/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAME ENGINE (con fotos reales + cofre sorpresa)
   ═══════════════════════════════════════════════════════════ */
const QUESTIONS_PER_MISSION = 10;

let G = {
  active: false, mtype: '', world: null,
  questions: [], qi: 0, ok: 0,
  lives: 5, streak: 0, newBadges: [],
  lockUntil: 0, t0: 0
};

function buildQuestions(world) {
  const items = shuffle([...world.items]);
  const pool = world.items;
  const qs = [];
  const picks = items.slice(0, Math.min(QUESTIONS_PER_MISSION, items.length));
  picks.forEach(item => {
    const wrongs = shuffle(pool.filter(x => x !== item)).slice(0, 3);
    const opts = shuffle([item, ...wrongs]);
    qs.push({item, opts, ans: item});
  });
  return qs;
}

function startMission(worldId, skipIntro = false) {
  const world = WORLDS.find(w => w.id === worldId);
  if (!world) return;

  // v12: recordar el último mundo tocado para «▶ Continuar donde quedaste»
  // (se guarda aunque el niño cancele la intro: la intención de jugar cuenta)
  try { const pu = activeProfile(); if (pu) { pu.lastWorld = worldId; saveState(); } } catch (e) {}

  // Intro: tarjetas-foto para repasar antes de jugar
  if (!skipIntro && world.story) {
    const cards = world.items.map(it => {
      const label = (world.kind === 'numbers') ? (it.num != null ? it.num : it.en) : it.en;
      const visual = it.img
        ? imgTag(it.img, it.em, 'intro-img', it.en)
        : (world.kind === 'numbers'
          ? `<div class="intro-img num-preview">${it.num}</div>`
          : `<div class="intro-img img-fallback" style="background:${it.tint || 'rgba(255,255,255,.08)'}">${it.em || '✨'}</div>`);
      return `<div class="intro-card" onclick="speakIntro('${it.en.replace(/'/g, "\\'")}','${(it.es || '').replace(/'/g, "\\'")}')">
        ${visual}<div class="intro-en">${label}</div><div class="intro-es">${it.es || ''}</div>
      </div>`;
    }).join('');
    openModal(
      world.icon + ' ' + world.name + ' / ' + world.es,
      `<div class="small" style="font-size:.9em;color:var(--muted);line-height:1.4;margin-bottom:10px">${world.story}</div>
       <div class="intro-grid">${cards}</div>
       <div class="small" style="text-align:center;margin-top:10px;font-size:.75em">👆 Toca cada tarjeta para escuchar</div>`,
      `<button class="bigbtn bb-ghost bb-sm" onclick="closeModal()">Cancelar</button>
       <button class="bigbtn bb-gold bb-sm" onclick="closeModal();startMission('${worldId}',true)">¡Jugar! 🎮</button>`
    );
    return;
  }

  const pp = activeProfile();
  const prevStreak = pp ? (pp.streak || 0) : 0;
  G = {
    active: true, mtype: worldId, world,
    questions: buildQuestions(world),
    qi: 0, ok: 0, lives: 5, streak: prevStreak, newBadges: [],
    lockUntil: 0, t0: now()
  };

  $('gWorldName').textContent = world.name + ' / ' + world.es;
  showScreen('gameScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 1));
  renderQuestion();
  updateTopbar();
}
window.speakIntro = (en, es) => { TTS.speak([{text: en, lang: 'en-US', rate: .78}, {text: es, lang: 'es-ES', rate: .8, pauseMs: 0}]); beep(true); };

/* ── Visual de conteo para números (estrellas reales) ── */
function numStarsHTML(n, small) {
  const cls = small ? 'count-star sm' : 'count-star';
  let out = '';
  for (let i = 0; i < Math.min(n, 30); i++) {
    out += uiTag('ui_star', '⭐', cls, '');
  }
  return `<div class="count-grid">${out}</div>`;
}

/* ── Tarjeta de palabra tipográfica (días de la semana) ── */
function wordCardHTML(item, big) {
  const tint = item.tint || '#9B59B6';
  return `<div class="word-card ${big ? 'big' : ''}" style="background:linear-gradient(135deg,${tint}33,${tint}18);border-color:${tint}66">
    <span class="wc-emoji-sm">${item.em || '📅'}</span>
    <span class="word-card-txt">${item.en}</span>
  </div>`;
}

function renderQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  const item = q.item;
  const w = G.world;

  $('gProgLabel').textContent = `Pregunta ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';

  // Vidas + botón escuchar
  renderLivesRow();

  // Tarjeta pregunta
  $('qBadge').textContent = w.icon + ' ' + w.name;
  $('qWord').className = 'q-big-word';
  $('qWord').style.display = '';

  if (w.kind === 'letters') {
    $('qInstruction').textContent = '¿Cuál es esta letra?';
    $('qWord').textContent = item.en;
    $('qTrans').textContent = item.hint || '';
    $('qVisual').innerHTML = imgTag(item.img, item.em, 'q-big-img', item.en);
  } else if (w.kind === 'numbers') {
    $('qInstruction').textContent = '¿Cuántas estrellas hay?';
    $('qWord').textContent = item.num != null ? String(item.num) : item.en;
    $('qTrans').textContent = item.es;
    $('qVisual').innerHTML = `<div class="q-big-num">${item.num != null ? item.num : '✨'}</div>${numStarsHTML(item.num || 1)}`;
  } else if (w.kind === 'colors') {
    $('qInstruction').textContent = '¿Cómo se llama este color?';
    $('qWord').textContent = '';
    $('qWord').style.display = 'none';
    $('qTrans').textContent = 'Toca la respuesta correcta 👇';
    $('qVisual').innerHTML = `<div class="color-ring" style="--c:${item.color || '#fff'}">${imgTag(item.img, item.em, 'q-big-img', item.en)}</div>`;
  } else if (w.kind === 'phrases') {
    $('qInstruction').textContent = '¿Cuál es esta frase en inglés?';
    $('qWord').textContent = item.es;
    $('qTrans').textContent = '';
    $('qVisual').innerHTML = item.img ? imgTag(item.img, item.em, 'q-big-img wide', item.en) : wordCardHTML(item, true);
  } else {
    // days sin img → tarjeta tipográfica; resto → foto
    $('qInstruction').textContent = item.img ? 'Toca la foto correcta 👆' : 'Toca la palabra correcta 👆';
    $('qWord').textContent = item.en;
    $('qTrans').textContent = item.es;
    $('qVisual').innerHTML = item.img ? imgTag(item.img, item.em, 'q-big-img', item.en) : wordCardHTML(item, true);
  }

  // Opciones
  const og = $('optsGrid');
  og.innerHTML = '';
  q.opts.forEach(opt => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.dataset.correct = opt === q.ans ? '1' : '0';

    let inner = '';
    if (w.kind === 'letters') {
      inner = `${imgTag(opt.img, opt.em, 'ob-img', opt.en)}<span class="ob-letter">${opt.en}</span><span class="ob-trans">${opt.hint || ''}</span>`;
    } else if (w.kind === 'numbers') {
      inner = `<span class="ob-letter">${opt.en}</span><span class="ob-trans">${opt.es}</span>`;
    } else if (w.kind === 'colors') {
      b.style.background = `linear-gradient(135deg, ${opt.color || '#888'}44, ${opt.color || '#888'}22)`;
      b.style.borderColor = (opt === q.ans) ? '' : (opt.color || '#888') + '88';
      inner = `${imgTag(opt.img, opt.em, 'ob-img', opt.en)}<span class="ob-word">${opt.en}</span><span class="ob-trans">${opt.es}</span>`;
    } else if (w.kind === 'phrases') {
      inner = opt.img
        ? `${imgTag(opt.img, opt.em, 'ob-img wide', opt.en)}<span class="ob-word">${opt.en}</span>`
        : `${wordCardHTML(opt, false)}`;
    } else {
      inner = opt.img
        ? `${imgTag(opt.img, opt.em, 'ob-img', opt.en)}<span class="ob-word">${opt.en}</span>`
        : `${wordCardHTML(opt, false)}`;
    }
    b.innerHTML = inner;
    b.onclick = (e) => chooseAnswer(b, q, e);
    og.appendChild(b);
  });

  // Ocultar feedback
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';

  // Pronunciar (en Colores NO se dice la respuesta: solo la pista)
  setTimeout(() => {
    if (w.kind === 'colors') TTS.speak([{ text: 'What color is this?', lang: 'en-US', rate: .82 }]);
    else TTS.sayWord(item.en, item.es, w.kind);
  }, 300);

  // v7: precarga las fotos de la siguiente pregunta (todo fluye sin esperas)
  const nq = G.questions[G.qi + 1];
  if (nq && nq.opts) nq.opts.forEach(o => { if (o.img) { const im = new Image(); im.src = IMG(o.img); } });
}

function speakCurrent() {
  if (!G.active || G.qi >= G.questions.length) return;
  const q = G.questions[G.qi];
  if (G.world.kind === 'colors') {
    TTS.speak([{ text: 'What color is this?', lang: 'en-US', rate: .82 }]);
    beep(true);
    return;
  }
  TTS.sayWord(q.item.en, q.item.es, G.world.kind);
  beep(true);
}

/* ── Núcleo de recompensa/fallo compartido por todos los juegos ── */
function coreReward(item, evt) {
  G.ok++; G.streak++;
  updateProfile(p => {
    p.stats.totalCorrect = (p.stats.totalCorrect || 0) + 1;
    // v14: aciertos por día (alimentan el reto de fin de semana)
    if (!p.stats.correctByDay) p.stats.correctByDay = {};
    p.stats.correctByDay[todayStr()] = (p.stats.correctByDay[todayStr()] || 0) + 1;
    p.coins = (p.coins || 0) + 2;
    p.xp = (p.xp || 0) + 12;
    // v7: maestría por palabra (alimenta el Diccionario: 🌱 nueva → ✅ aprendida → 🏆 dominada)
    p.mastery = p.mastery || {};
    if (item && item.en) p.mastery[item.en] = (p.mastery[item.en] || 0) + 1;
  });
  beep(true);
  buzz(35); // v11: vibración suave de acierto (móviles)
  TTS.sayFeedback(true);
  if (evt) floatXP('+12 XP', evt.clientX, evt.clientY);
  updateProfile(pp => { pp.streak = G.streak; if (G.streak > (pp.maxStreak || 0)) pp.maxStreak = G.streak; });
  if ([3, 5, 7, 10, 15, 20, 25, 30].includes(G.streak)) {
    const bonus = G.streak >= 20 ? 5 : G.streak >= 10 ? 3 : G.streak >= 5 ? 2 : 1;
    const coinsBonus = G.streak * 3;
    notif(`🔥 ¡RACHA x${G.streak}! ¡Imparable!`, 'var(--gold)');
    celebrate({
      icon: G.streak >= 20 ? '⚡' : G.streak >= 10 ? '💥' : '🔥',
      title: `🔥 ¡RACHA x${G.streak}!`,
      sub: G.streak >= 20 ? '¡ERES UN GENIO ABSOLUTO! 🧠' : G.streak >= 10 ? '¡Vas imparable! 🚀' : '¡Increíble ritmo! 💪',
      rewards: [`🪙 +${coinsBonus} Monedas`, `⭐ +${bonus} Estrellas`, `✨ +${G.streak * 5} XP BONUS`],
      confetti: Math.min(G.streak >= 10 ? 3 : 2, 3), dur: 3000
    });
    updateProfile(pp => { pp.coins = (pp.coins || 0) + coinsBonus; pp.stars = (pp.stars || 0) + bonus; pp.xp = (pp.xp || 0) + G.streak * 5; });
  }
}

function coreFail(q) {
  G.streak = 0; G.lives--;
  updateProfile(pp => { pp.streak = 0; });
  beep(false);
  buzz([60, 50, 60]); // v11: patrón de «inténtalo otra vez» (móviles)
  TTS.sayFeedback(false);
  if (G.lives <= 0) {
    showFeedback(false, '💔 Sin vidas', `Era: ${q.item.en} = ${q.item.es}`);
    setTimeout(() => endMission(), 2000);
    updateTopbar(); return 'dead';
  }
  showFeedback(false, '¡Intenta otra vez! 💪', `Era: ${q.item.en} = ${q.item.es}`);
  updateTopbar();
  return 'alive';
}

function chooseAnswer(el, q, evt) {
  if (Date.now() < G.lockUntil) return;
  G.lockUntil = Date.now() + 900;

  const ok = el.dataset.correct === '1';
  document.querySelectorAll('.opt-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('correct');
  });

  if (ok) {
    coreReward(q.item, evt);
    showFeedback(true, '¡Correcto! 🎉', `${q.item.en} = ${q.item.es}`);
    // En Colores, tras acertar se refuerza la palabra (EN + ES)
    if (G.world.kind === 'colors') {
      setTimeout(() => TTS.speak([
        { text: q.item.en, lang: 'en-US', rate: .72, pauseMs: 550 },
        { text: q.item.es, lang: 'es-ES', rate: .8 }
      ]), 1100);
    }
  } else {
    el.classList.add('wrong');
    recordMistake((G.world && G.world.id) || G.mtype, q.item);
    if (coreFail(q) === 'dead') return;
    // En Colores, tras fallar se enseña la palabra correcta
    if (G.world.kind === 'colors') {
      setTimeout(() => TTS.speak([
        { text: q.item.en, lang: 'en-US', rate: .72, pauseMs: 550 },
        { text: q.item.es, lang: 'es-ES', rate: .8 }
      ]), 1300);
    }
  }
  updateTopbar();
}

function showFeedback(ok, title, msg) {
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar on ' + (ok ? 'ok' : 'bad');
  $('fbIcon').textContent = ok ? '✅' : '❌';
  $('fbTitle').textContent = title;
  $('fbMsg').textContent = msg;
}

function nextQuestion() {
  G.qi++;
  G.lockUntil = 0;
  if (G.qi >= G.questions.length) endMission();
  else (G.renderFn || renderQuestion)();
}

/* ── FIN DE MISIÓN + COFRE SORPRESA ── */
function endMission() {
  if (!G.active) return;
  G.active = false;
  const tot = G.questions.length;
  const pct = Math.round((G.ok / tot) * 100);
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const xpGained = G.ok * 12 + (stars * 30) + (pct === 100 ? 50 : 0);
  // ⭐ v7: mundo destacado del día → monedas x2
  const feat = (typeof isFeaturedWorld === 'function') && isFeaturedWorld(G.mtype);
  const coinsGained = Math.round((G.ok * 2 + (stars * 10) + (pct === 100 ? 25 : 0)) * (feat ? 2 : 1));

  updateProfile(p => {
    p.xp = (p.xp || 0) + xpGained;
    p.coins = (p.coins || 0) + coinsGained;
    if (pct === 100) p.stats.perfect = (p.stats.perfect || 0) + 1;
    p.stats.missions = (p.stats.missions || 0) + 1;
    p.stats.daysPlayed[todayStr()] = true;
    // v7: misiones por día (gráfico de actividad de la Zona de padres)
    p.stats.missionsByDay[todayStr()] = (p.stats.missionsByDay[todayStr()] || 0) + 1;
    if (G.mtype === 'spell') p.stats.spellGames = (p.stats.spellGames || 0) + 1;
    if (G.mtype === 'match') p.stats.matchGames = (p.stats.matchGames || 0) + 1;
    if (G.mtype === 'memory') p.stats.memGames = (p.stats.memGames || 0) + 1;
    if (G.mtype === 'listen') p.stats.listenGames = (p.stats.listenGames || 0) + 1;
    if (G.mtype === 'odd') p.stats.oddGames = (p.stats.oddGames || 0) + 1; // v7
    if (G.mtype === 'quick') p.stats.quickGames = (p.stats.quickGames || 0) + 1; // v8
    if (G.mtype === 'sentence') p.stats.sentGames = (p.stats.sentGames || 0) + 1; // v8
    if (G.mtype === 'rhyme') p.stats.rhymeGames = (p.stats.rhymeGames || 0) + 1; // v8
    if (G.mtype === 'review') {
      p.stats.reviews = (p.stats.reviews || 0) + 1;
      p.stats.learnedWords = (p.stats.learnedWords || 0) + (G.learned || 0);
    }
    p.best = p.best || {};
    p.best[G.mtype] = Math.max(p.best[G.mtype] || 0, stars);
    p.stars = (p.stars || 0) + stars;
    if (G.streak > (p.maxStreak || 0)) p.maxStreak = G.streak;
    p.streak = G.streak;
  });
  bumpDailyGoal();

  const trophy = pct === 100 ? uiTag('ui_trophy', '🏆', 'result-img') : pct >= 70 ? uiTag('ui_medal_gold', '🥇', 'result-img') : pct >= 40 ? uiTag('ui_medal_silver', '🥈', 'result-img') : uiTag('ui_star', '🎯', 'result-img');
  $('rTrophy').innerHTML = trophy;
  $('rTitle').textContent = pct === 100 ? '¡Perfecto! 🌟' : pct >= 70 ? '¡Muy bien! 🎉' : pct >= 40 ? '¡Buen intento! 💪' : '¡Sigue practicando! 📚';

  // Estrellas con asset real
  const sd = $('starsDisplay');
  sd.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.className = 'star-anim';
    s.innerHTML = i < stars ? uiTag('ui_star', '⭐', 'star-img') : '<span class="star-off">☆</span>';
    sd.appendChild(s);
  }

  $('rOk').textContent = `${G.ok}/${tot}`;
  $('rXP').textContent = `+${xpGained}`;
  $('rCoins').textContent = `+${coinsGained}`;
  $('rStars').textContent = `+${stars}`;

  // Insignias nuevas
  const p = activeProfile();
  const newBadges = [];
  BADGES.forEach(b => {
    if (!(p.badges || []).includes(b.id) && b.c(p)) {
      p.badges.push(b.id); newBadges.push(b);
    }
  });
  saveState();

  const ba = $('rBadgesArea');
  ba.innerHTML = '';
  newBadges.forEach((b, i) => {
    ba.innerHTML += `<div class="new-badge-pop" style="animation-delay:${i * .15}s">
      <span class="nbp-icon">${b.icon}</span>
      <div class="nbp-text"><strong>¡Nueva insignia: ${b.name}!</strong><p>${b.desc}</p></div>
    </div>`;
  });

  // Cofre sorpresa (2+ estrellas)
  const chestZone = $('chestZone');
  if (stars >= 2) {
    chestZone.style.display = 'flex';
    chestZone.innerHTML = `
      <div class="chest-wrap" id="chestWrap" onclick="openChest(${stars})">
        ${uiTag('ui_chest_closed', '🎁', 'chest-img')}
        <div class="chest-hint">¡Toca el cofre sorpresa! ✨</div>
      </div>`;
  } else {
    chestZone.style.display = 'none';
    chestZone.innerHTML = '';
  }

  if (pct >= 60) { beepWin(); burst(80); if (pct === 100) setTimeout(() => burst(60), 400); }
  else beep(false);

  // Celebración especial de repaso: palabras superadas
  if (G.mtype === 'review' && G.learned > 0) {
    celebrate({
      icon: uiTag('mascot_cheer', '🧠', 'cel-img'),
      title: `¡${G.learned} superada${G.learned > 1 ? 's' : ''}!`,
      sub: 'Palabras que ya dominas ✅',
      rewards: ['🧠 ¡Cerebro más fuerte!', `📚 ${mistakeCount()} palabras por repasar`],
      confetti: 2, dur: 3200
    });
  }

  if (stars > 0) {
    const streakBonus = G.streak >= 10 ? ` 🔥 RACHA x${G.streak}!` : (G.streak >= 3 ? ` 🔥 Racha x${G.streak}` : '');
    celebrate({
      icon: pct === 100 ? uiTag('ui_trophy', '🏆', 'cel-img') : uiTag('ui_medal_gold', '🥇', 'cel-img'),
      title: pct === 100 ? '¡PERFECTO!' : '¡Misión completada!',
      sub: `${G.ok}/${tot} correctas · ${stars} ⭐${streakBonus}${feat ? ' · ⭐ Destacado x2🪙' : ''}`,
      rewards: [`⭐ +${stars}`, `🪙 +${coinsGained}`, `✨ +${xpGained} XP`, ...(feat ? ['🌟 ¡Mundo destacado: monedas x2!'] : []), ...(G.streak >= 5 ? [`🔥 Racha x${G.streak} activa!`] : [])],
      confetti: stars, dur: 3200
    });
  }

  // Título especial para repaso
  if (G.mtype === 'review') $('rTitle').textContent = '¡Repaso completado! 🧠';

  // Acceso rápido: repasar errores desde resultados
  const rbs = document.querySelector('.result-btns');
  const oldBtn = $('rReviewBtn');
  if (oldBtn) oldBtn.remove();
  const pending = mistakeCount();
  if (pending > 0 && rbs) {
    const rb = document.createElement('button');
    rb.id = 'rReviewBtn';
    rb.className = 'bigbtn bb-purple bb-sm';
    rb.innerHTML = `🔁 Repasar mis errores (${pending})`;
    rb.onclick = () => startReviewMission();
    rbs.appendChild(rb);
  }

  showScreen('resultScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 0));
  updateTopbar();
  checkBadges();
  if (window.checkMilestones) checkMilestones(); // v8: hitos de palabras dominadas
}

/* ── COFRE SORPRESA ── */
window.openChest = function (stars) {
  const wrap = $('chestWrap');
  if (!wrap || wrap.dataset.opened) return;
  wrap.dataset.opened = '1';
  beepChest();

  const roll = Math.random();
  let reward, icon;
  if (roll < .5) {
    const coins = 5 + ((Math.random() * (stars * 8)) | 0);
    updateProfile(p => { p.coins = (p.coins || 0) + coins; });
    reward = `🪙 +${coins} Monedas`;
    icon = uiTag('ui_coin', '🪙', 'chest-open-img');
  } else if (roll < .8) {
    const xp = 15 + ((Math.random() * (stars * 15)) | 0);
    updateProfile(p => { p.xp = (p.xp || 0) + xp; });
    reward = `✨ +${xp} XP`;
    icon = uiTag('ui_star', '⭐', 'chest-open-img');
  } else if (roll < .92) {
    updateProfile(p => { p.stars = (p.stars || 0) + 1; });
    reward = '⭐ +1 Estrella';
    icon = uiTag('ui_star', '⭐', 'chest-open-img');
  } else {
    updateProfile(p => { p.coins = (p.coins || 0) + 30; p.stars = (p.stars || 0) + 1; });
    reward = '🎉 ¡JACKPOT! +30 Monedas +1 Estrella';
    icon = uiTag('ui_chest_open', '🎁', 'chest-open-img');
    setTimeout(beepJackpot, 260); // v11: fanfarria extra del premio gordo
  }
  updateProfile(p => { p.stats.chests = (p.stats.chests || 0) + 1; });
  saveState();

  wrap.innerHTML = `${icon}<div class="chest-hint gold">${reward}</div>`;
  const rect = wrap.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);
  burst(40);
  updateTopbar();
  checkBadges();
};

function retryMission() {
  if (G.mtype === 'spell') return startSpellMission();
  if (G.mtype === 'match') return startMatchMission();
  if (G.mtype === 'memory') return startMemoryMission();
  if (G.mtype === 'listen') return startListenMission();
  if (G.mtype === 'review') return startReviewMission();
  if (G.mtype === 'quick') return startQuickSession(); // v8
  if (G.mtype === 'sentence') return startSentenceMission(); // v8
  if (G.mtype === 'rhyme') return startRhymeMission(); // v8
  if (G.mtype) startMission(G.mtype);
}
