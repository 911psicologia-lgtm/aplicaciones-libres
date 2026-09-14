/* ═══════════════════════════════════════════════════════════
   PequeWorld — GAMES v4
   1) Repaso inteligente de ERRORES cometidos
   2) "Completa la palabra" (letra que falta)
   3) "Empareja" (foto + palabra)
   4) Avatar con CÁMARA o GALERÍA
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 1) REGISTRO DE ERRORES ══════════ */
function mistakeCount() {
  const p = activeProfile();
  if (!p || !p.mistakes) return 0;
  return Object.keys(p.mistakes).length;
}

function recordMistake(worldId, item) {
  if (!worldId || !item || !item.en) return;
  updateProfile(p => {
    p.mistakes = p.mistakes || {};
    const k = worldId + '::' + item.en;
    const m = p.mistakes[k] || {worldId, en: item.en, es: item.es || '', count: 0, last: 0};
    m.count++; m.last = now(); m.es = item.es || m.es || '';
    p.mistakes[k] = m;
    // límite de memoria: guarda los 80 errores más recientes
    const ks = Object.keys(p.mistakes);
    if (ks.length > 80) {
      ks.sort((a, b) => (p.mistakes[a].last || 0) - (p.mistakes[b].last || 0));
      ks.slice(0, ks.length - 80).forEach(x => delete p.mistakes[x]);
    }
  });
}

function clearMistake(key) {
  updateProfile(p => { if (p.mistakes) delete p.mistakes[key]; });
}

/* ══════════ UTILIDADES DE JUEGO ══════════ */
function spellableItem(en) {
  return /^[a-zA-Z ]+$/.test(en || '') && (en || '').replace(/ /g, '').length >= 3;
}

function gameWorlds() {
  let ws = WORLDS.filter(w => w.lvl === currentLevel && w.kind !== 'letters' && w.kind !== 'phrases');
  if (!ws.length) ws = WORLDS.filter(w => w.kind !== 'letters' && w.kind !== 'phrases');
  return ws;
}

function renderLivesRow() {
  const lr = $('livesRow');
  lr.innerHTML = `<span class="life-compact">❤️ <b>x${G.lives}</b></span>`;
  const lb = $('listenBtn');
  if (lb) {
    if (lb.parentElement !== lr) {
      lr.appendChild(lb);
      lb.style.margin = '0';
      lb.style.padding = '8px 16px';
      lb.style.fontSize = '.85em';
    }
    lb.style.display = '';
  }
}

function bootGameMission(mtype, worldName, worldEs, worldIcon, questions, renderFn) {
  const pp = activeProfile();
  G = {
    active: true, mtype,
    world: {id: mtype, name: worldName, es: worldEs, icon: worldIcon, kind: mtype},
    questions, qi: 0, ok: 0, lives: 5,
    streak: pp ? (pp.streak || 0) : 0, newBadges: [],
    lockUntil: 0, t0: now(), renderFn, learned: 0
  };
  $('gWorldName').textContent = worldName + ' / ' + worldEs;
  showScreen('gameScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 1));
  renderFn();
  updateTopbar();
}

/* ══════════ 2) COMPLETA LA PALABRA (letra que falta) ══════════ */
function buildSpellQ(w, it) {
  const word = it.en.toUpperCase();
  const letterIdx = [...word].map((ch, i) => /[A-Z]/.test(ch) ? i : -1).filter(i => i >= 0);
  const missIdx = letterIdx[(Math.random() * letterIdx.length) | 0];
  const ans = word[missIdx];
  const others = [...new Set([...word].filter((c, i) => i !== missIdx && /[A-Z]/.test(c)))].filter(c => c !== ans);
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  while (others.length < 3) {
    const c = AZ[(Math.random() * 26) | 0];
    if (c !== ans && !others.includes(c)) others.push(c);
  }
  const options = shuffle([ans, ...shuffle(others).slice(0, 3)]);
  return {item: it, world: w, word, missIdx, ans, options};
}

window.startSpellMission = function () {
  beep(true);
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => {
    if (spellableItem(it.en) && it.img) pool.push({w, it});
  }));
  if (!pool.length) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const picks = shuffle(pool).slice(0, 8);
  const qs = picks.map(({w, it}) => buildSpellQ(w, it));
  bootGameMission('spell', 'Spell It!', 'Completa la palabra', '🔤', qs, renderSpellQuestion);
};

function renderSpellQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Letra ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '🔤 Completa la palabra';
  renderSpellUI(q);
}

function renderSpellUI(q) {
  $('qVisual').innerHTML = imgTag(q.item.img, q.item.em, 'q-big-img', q.item.en);
  $('qInstruction').textContent = '¿Qué letra falta? · Which letter?';
  const wEl = $('qWord');
  wEl.className = 'spell-word';
  wEl.style.display = '';
  let s = '';
  [...q.word].forEach((ch, i) => {
    if (ch === ' ') s += '<span class="slot space"></span>';
    else if (i === q.missIdx) s += '<span class="slot blank" id="spellBlank">?</span>';
    else s += `<span class="slot">${ch}</span>`;
  });
  wEl.innerHTML = s;
  $('qTrans').textContent = q.item.es;

  const og = $('optsGrid');
  og.className = 'opts-grid spell-opts';
  og.innerHTML = '';
  q.options.forEach(L => {
    const b = document.createElement('button');
    b.className = 'opt-btn spell-btn';
    b.textContent = L;
    b.dataset.correct = (L === q.ans) ? '1' : '0';
    b.onclick = (e) => chooseSpellLetter(b, q, e);
    og.appendChild(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';

  // Audio: dice la palabra y luego la deletrea
  setTimeout(() => {
    const spelled = [...q.item.en.toUpperCase()].filter(c => /[A-Z]/.test(c)).join(', ');
    TTS.speak([
      {text: q.item.en, lang: 'en-US', rate: .78, pauseMs: 500},
      {text: spelled, lang: 'en-US', rate: .68}
    ]);
  }, 300);
}

window.chooseSpellLetter = function (el, q, evt) {
  if (Date.now() < G.lockUntil) return;
  G.lockUntil = now() + 900;
  document.querySelectorAll('.spell-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === '1' && b !== el) b.classList.add('correct');
  });
  if (el.dataset.correct === '1') {
    el.classList.add('correct');
    const bl = $('spellBlank');
    if (bl) { bl.textContent = q.ans; bl.classList.remove('blank'); bl.classList.add('filled'); }
    coreReward(q.item, evt);
    if (G.mtype === 'review' && q.key) {
      clearMistake(q.key);
      G.learned++;
      showFeedback(true, `¡Ya la sabes! 🧠 (${G.learned})`, `${q.item.en} = ${q.item.es}`);
    } else {
      showFeedback(true, '¡Correcto! 🎉', `${q.item.en} = ${q.item.es}`);
    }
    TTS.sayWord(q.item.en, q.item.es, 'words');
  } else {
    el.classList.add('wrong');
    const bl = $('spellBlank');
    if (bl) { bl.textContent = q.ans; bl.classList.remove('blank'); bl.classList.add('reveal'); }
    recordMistake(q.world.id, q.item);
    if (coreFail(q) === 'dead') return;
  }
  updateTopbar();
};

/* ══════════ 3) EMPAREJA (foto + palabra) ══════════ */
window.startMatchMission = function () {
  beep(true);
  const pool = gameWorlds().filter(w => w.items.length >= 4);
  if (!pool.length) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const world = pool[(Math.random() * pool.length) | 0];
  const per = Math.min(5, world.items.length);
  const rounds = world.items.length >= 10 ? 2 : 1;
  const picks = shuffle([...world.items]).slice(0, rounds * per);
  const qs = picks.map(it => ({item: it}));

  const pp = activeProfile();
  G = {
    active: true, mtype: 'match',
    world: {id: 'match', name: 'Match It!', es: 'Empareja', icon: '🧩', kind: 'match', srcWorld: world},
    questions: qs, qi: 0, ok: 0, lives: 5,
    streak: pp ? (pp.streak || 0) : 0, newBadges: [],
    lockUntil: 0, t0: now(), renderFn: renderMatchRound, learned: 0,
    match: {round: 0, rounds, per, imgs: [], words: [], selImg: -1, dirty: false, solved: 0, lock: false}
  };
  $('gWorldName').textContent = 'Match It! / Empareja · ' + world.name;
  showScreen('gameScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 1));
  renderMatchRound();
  updateTopbar();
};

function renderMatchRound() {
  if (!G.active) return;
  const m = G.match;
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Pareja ${Math.min(G.qi + 1, tot)}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn');
  if (lb) lb.style.display = 'none'; // sin audio previo: no revela la pareja

  $('qBadge').textContent = '🧩 Empareja';
  $('qInstruction').textContent = 'Toca la foto y luego su palabra 👇';
  $('qVisual').innerHTML = `<div class="match-hint">${m.round + 1} / ${m.rounds} · ${m.per} parejas</div>`;
  const wEl = $('qWord');
  wEl.className = 'q-big-word';
  wEl.style.display = 'none';
  $('qTrans').textContent = '';

  const start = m.round * m.per;
  const batch = G.questions.slice(start, start + m.per);
  m.imgs = shuffle(batch);
  m.words = shuffle(batch);
  m.selImg = -1; m.dirty = false; m.solved = 0; m.lock = false;

  const og = $('optsGrid');
  og.className = 'match-host';
  og.innerHTML = `
    <div class="match-imgs">
      ${m.imgs.map((p, i) => `<button class="match-tile mi" data-i="${i}" data-en="${p.item.en}">
        ${imgTag(p.item.img, p.item.em, 'mt-img', p.item.en)}</button>`).join('')}
    </div>
    <div class="match-words">
      ${m.words.map((p, j) => `<button class="match-tile mw" data-j="${j}" data-en="${p.item.en}">
        <span class="mw-txt">${p.item.en}</span></button>`).join('')}
    </div>`;
  og.querySelectorAll('.mi').forEach(b => b.onclick = () => matchTap('i', parseInt(b.dataset.i, 10), b));
  og.querySelectorAll('.mw').forEach(b => b.onclick = () => matchTap('w', parseInt(b.dataset.j, 10), b));

  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
}

window.matchTap = function (type, idx, el) {
  const m = G.match;
  if (!G.active || m.lock || el.classList.contains('done')) return;

  if (type === 'i') {
    if (m.selImg === idx) { el.classList.remove('sel'); m.selImg = -1; return; }
    ogSel('.mi', el);
    m.selImg = idx; m.dirty = false;
    beep(true);
    return;
  }
  // toque en palabra
  if (m.selImg < 0) {
    el.classList.add('wiggle');
    setTimeout(() => el.classList.remove('wiggle'), 400);
    notif('👆 Primero toca una foto', 'var(--blue)');
    return;
  }
  const imgItem = m.imgs[m.selImg].item;
  const wordItem = m.words[idx].item;
  const imgEl = ogSelEl('.mi', m.selImg);
  const wordEl = el;

  if (imgItem.en === wordItem.en) {
    // ✔ pareja correcta
    m.lock = true;
    imgEl.classList.remove('sel'); imgEl.classList.add('done');
    wordEl.classList.add('done');
    beep(true);
    TTS.sayWord(imgItem.en, imgItem.es, 'words');
    if (!m.dirty) {
      coreReward(imgItem, null);
      G.qi++;
    } else {
      G.qi++; G.streak = 0;
      updateProfile(p => { p.streak = 0; });
    }
    m.solved++;
    showFeedback(true, '¡Pareja! 🎉', `${imgItem.en} = ${imgItem.es}`);
    setTimeout(() => { $('feedbackBar').className = 'feedback-bar'; }, 750);
    updateTopbar();
    setTimeout(() => {
      m.lock = false;
      if (m.solved >= m.per) {
        if (m.round + 1 < m.rounds) {
          m.round++;
          notif('🎯 ¡Ronda completa! Siguiente…', 'var(--green)');
          setTimeout(renderMatchRound, 650);
        } else {
          endMission();
        }
      }
    }, 800);
  } else {
    // ✘ intento fallido
    m.dirty = true;
    G.streak = 0;
    updateProfile(p => { p.streak = 0; });
    recordMistake(G.world.srcWorld.id, imgItem);
    beep(false);
    wordEl.classList.add('wrong');
    setTimeout(() => wordEl.classList.remove('wrong'), 380);
    TTS.sayFeedback(false);
  }
};
function ogSel(sel, el) {
  document.querySelectorAll(sel).forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}
function ogSelEl(sel, idx) {
  return document.querySelectorAll(sel)[idx];
}

/* ══════════ 4) REPASO DE ERRORES ══════════ */
window.startReviewMission = function () {
  beep(true);
  const p = activeProfile();
  // v8 [B2]: priorización con repetición espaciada simple
  // primero las más falladas (×2) y las más antiguas (×3 por día, tope 7)
  const list = (window.prioritizedMistakes ? prioritizedMistakes() : Object.entries(p.mistakes || {}));
  if (!list.length) { notif('🎉 ¡No tienes errores que repasar! ¡Sigue así!', 'var(--green)'); return; }

  const qs = [];
  list.slice(0, 8).forEach(([key, m], i) => {
    const w = WORLDS.find(x => x.id === m.worldId);
    const it = w && w.items.find(x => x.en === m.en);
    if (!w || !it) return;
    const canSpell = spellableItem(it.en) && !!it.img;
    const modo = i % 3;
    if (canSpell && modo === 1) {
      // tipo completar-letra: hereda todos los campos de buildSpellQ
      qs.push({key, world: w, item: it, type: 'spell', ...buildSpellQ(w, it)});
    } else if (it.img && modo === 2) {
      // tipo ESCUCHA (v5): solo audio → elegir entre 4 fotos
      let wrongs = shuffle(w.items.filter(x => x !== it && x.img)).slice(0, 3);
      if (wrongs.length < 3) {
        gameWorlds().forEach(ww => {
          if (ww.id !== w.id && wrongs.length < 3) {
            const cand = ww.items.filter(x => x.img && x.en !== it.en);
            if (cand.length) wrongs.push(cand[(Math.random() * cand.length) | 0]);
          }
        });
      }
      const opts = shuffle([it, ...wrongs.slice(0, 3)]);
      qs.push({key, world: w, item: it, type: 'listen', opts, ans: it});
    } else {
      // tipo elección: foto → palabra en inglés
      let wrongs = shuffle(w.items.filter(x => x !== it)).slice(0, 3);
      if (wrongs.length < 3) {
        gameWorlds().forEach(ww => {
          if (ww.id !== w.id && wrongs.length < 3) wrongs.push(ww.items[(Math.random() * ww.items.length) | 0]);
        });
      }
      const opts = shuffle([it, ...wrongs.slice(0, 3)]);
      qs.push({key, world: w, item: it, type: 'choice', opts, ans: it});
    }
  });
  if (!qs.length) { notif('🎉 ¡Nada que repasar!', 'var(--green)'); return; }
  bootGameMission('review', 'Review Time', 'Repaso de errores', '🔁', qs, renderReviewQuestion);
};

function renderReviewQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Repaso ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  $('qBadge').textContent = '🔁 Repaso de errores';

  if (q.type === 'spell') {
    renderSpellUI(q);
  } else if (q.type === 'listen') {
    renderListenUI(q, (el, qq) => chooseReviewAnswer(el, qq));
  } else {
    $('qVisual').innerHTML = imgTag(q.item.img, q.item.em, 'q-big-img', q.item.en);
    $('qInstruction').textContent = '¿Cómo se dice en inglés?';
    const wEl = $('qWord');
    wEl.className = 'q-big-word';
    wEl.style.display = '';
    wEl.textContent = q.item.es;
    $('qTrans').textContent = 'Toca la palabra correcta 👇';

    const og = $('optsGrid');
    og.className = 'opts-grid';
    og.innerHTML = '';
    q.opts.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'opt-btn';
      b.dataset.correct = (opt === q.ans) ? '1' : '0';
      b.innerHTML = `${imgTag(opt.img, opt.em, 'ob-img sm', opt.en)}<span class="ob-word ob-word-lg">${opt.en}</span>`;
      b.onclick = (e) => chooseReviewAnswer(b, q, e);
      og.appendChild(b);
    });
    const fb = $('feedbackBar');
    fb.className = 'feedback-bar';
    setTimeout(() => {
      TTS.speak([{text: q.item.es + '. In English?', lang: 'es-ES', rate: .8}]);
    }, 300);
  }
}

window.chooseReviewAnswer = function (el, q, evt) {
  if (Date.now() < G.lockUntil) return;
  G.lockUntil = now() + 900;
  const ok = el.dataset.correct === '1';
  document.querySelectorAll('.opt-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('correct');
  });
  if (ok) {
    clearMistake(q.key);
    G.learned++;
    coreReward(q.item, evt);
    showFeedback(true, `¡Ya la sabes! 🧠 (${G.learned})`, `${q.item.en} = ${q.item.es}`);
    TTS.sayWord(q.item.en, q.item.es, 'words');
  } else {
    el.classList.add('wrong');
    recordMistake(q.world.id, q.item);
    if (coreFail(q) === 'dead') return;
  }
  updateTopbar();
};

/* ══════════ 5) AVATAR: CÁMARA + GALERÍA ══════════ */
let camStream = null;

function squareCrop(source, size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const sw = source.videoWidth || source.naturalWidth || 0;
  const sh = source.videoHeight || source.naturalHeight || 0;
  if (!sw || !sh) return null;
  const s = Math.min(sw, sh);
  ctx.drawImage(source, (sw - s) / 2, (sh - s) / 2, s, s, 0, 0, size, size);
  return c.toDataURL('image/jpeg', .82);
}

function avatarStudioHTML(currentAv, currentData) {
  const previewInner = (currentAv === 'custom' && currentData)
    ? `<img class="avatar-img big" src="${currentData}" alt="foto">`
    : avatarHTML(currentAv || 'avatar_1');
  return `
    <div class="av-studio">
      <div class="av-preview-wrap">
        <div class="av-preview" id="avPreview">${previewInner}</div>
        <div class="av-preview-name" id="avPreviewName">${currentAv === 'custom' && currentData ? '📷 Tu foto' : 'Elige tu avatar'}</div>
      </div>
      <div class="cam-row">
        <button class="bigbtn bb-green bb-sm" id="btnCamOn" onclick="startCamera()">📷 Encender cámara</button>
        <button class="bigbtn bb-ghost bb-sm" onclick="triggerGallery()">🖼️ De la galería</button>
      </div>
      <input type="file" accept="image/*" id="galleryInp" style="display:none" onchange="onGalleryPick(event)">
      <div id="camErr" class="cam-err" style="display:none">⚠️ La cámara no está disponible aquí.<br>Usa «De la galería» para poner tu foto.</div>
      <div id="camPanel" class="cam-panel" style="display:none">
        <video id="camVideo" autoplay playsinline muted></video>
        <div class="cam-actions">
          <button class="bigbtn bb-gold bb-sm" onclick="capturePhoto()">📸 ¡Capturar!</button>
          <button class="bigbtn bb-ghost bb-sm" onclick="stopCamera()">✕ Apagar</button>
        </div>
      </div>
      <div class="av-grid" id="avGrid">
        ${AVATARS.map(a => `<button class="av-btn${a.id === currentAv ? ' sel' : ''}" data-av="${a.id}" onclick="pickAv('${a.id}',this)">${avatarHTML(a.id)}</button>`).join('')}
        ${SHOP_AVATARS.map(a => {
          const pp = activeProfile();
          const owned = !!(pp && (pp.unlockedAvatars || []).includes(a.id));
          const act = owned
            ? `pickAv('${a.id}',this)`
            : (pp ? `buyFromStudio('${a.id}',this)` : `notif('🎁 Gana monedas jugando y consíguelo en la tienda','var(--purple)')`);
          return `<button class="av-btn shop${owned ? '' : ' locked-shop'}${a.id === currentAv ? ' sel' : ''}" data-av="${a.id}" onclick="${act}" title="${a.name}">
            ${avatarHTML(a.id)}${owned ? '' : `<span class="price-tag">🪙${a.price}</span>`}</button>`;
        }).join('')}
      </div>
    </div>`;
}

window.buyFromStudio = function (id, btn) {
  const a = SHOP_AVATARS.find(x => x.id === id);
  const p = activeProfile();
  if (!a || !p) return;
  if ((p.coins || 0) < a.price) {
    notif(`🪙 Te faltan ${a.price - (p.coins || 0)} monedas — ¡sigue jugando!`, 'var(--red)');
    beep(false);
    return;
  }
  updateProfile(pp => {
    pp.coins = (pp.coins || 0) - a.price;
    pp.unlockedAvatars = [...(pp.unlockedAvatars || []), id];
    pp.stats.avatarBought = (pp.stats.avatarBought || 0) + 1;
  });
  window._chosenAv = id;
  window._chosenAvatarData = '';
  document.querySelectorAll('.av-btn').forEach(b => b.classList.remove('sel'));
  if (btn) btn.classList.remove('locked-shop');
  if (btn) {
    const tag = btn.querySelector('.price-tag');
    if (tag) tag.remove();
  }
  const pv = $('avPreview');
  if (pv) pv.innerHTML = avatarHTML(id);
  const nm = $('avPreviewName');
  if (nm) nm.textContent = `🎉 ¡${a.name} desbloqueado!`;
  burst(50); beepWin();
  checkBadges();
};

function applyAvatarPhoto(dataURL) {
  if (!dataURL) return;
  window._chosenAvatarData = dataURL;
  window._chosenAv = 'custom';
  const pv = $('avPreview');
  if (pv) pv.innerHTML = `<img class="avatar-img big" src="${dataURL}" alt="foto">`;
  const nm = $('avPreviewName');
  if (nm) nm.textContent = '📷 ¡Tu foto lista!';
  document.querySelectorAll('.av-btn').forEach(b => b.classList.remove('sel'));
}

window.startCamera = async function () {
  const v = $('camVideo'), panel = $('camPanel'), err = $('camErr'), btn = $('btnCamOn');
  try {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) throw new Error('no-api');
    beep(true);
    camStream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 640}},
      audio: false
    });
    v.srcObject = camStream;
    try { await v.play(); } catch (e) {}
    panel.style.display = 'block';
    err.style.display = 'none';
    if (btn) btn.style.display = 'none';
    notif('📷 Cámara encendida ¡Sonríe!', 'var(--green)');
  } catch (e) {
    if (err) err.style.display = 'block';
    notif('📷 No pude encender la cámara — usa la galería 🙂', 'var(--red)');
    beep(false);
  }
};

window.stopCamera = function () {
  if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  const p = $('camPanel');
  if (p) p.style.display = 'none';
  const b = $('btnCamOn');
  if (b) b.style.display = '';
};

window.capturePhoto = function () {
  const v = $('camVideo');
  if (!v || !camStream) return;
  const data = squareCrop(v, 384);
  stopCamera();
  if (data) {
    applyAvatarPhoto(data);
    beep(true); burst(30);
    notif('✅ ¡Foto lista! Tu avatar te acompaña', 'var(--green)');
  }
};

window.triggerGallery = function () {
  beep(true);
  const inp = $('galleryInp');
  if (inp) inp.click();
};

window.onGalleryPick = function (ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const data = squareCrop(im, 384);
      if (data) {
        applyAvatarPhoto(data);
        beep(true); burst(30);
        notif('✅ ¡Foto de la galería lista!', 'var(--green)');
      }
    };
    im.onerror = () => notif('😕 No pude leer esa imagen', 'var(--red)');
    im.src = rd.result;
  };
  rd.readAsDataURL(f);
  ev.target.value = '';
};

/* ══════════ 6) ESCUCHA Y ELIGE (v5 — entrenamiento del oído) ══════════ */
function renderListenUI(q, chooser) {
  const lb = $('listenBtn');
  if (lb) { lb.style.display = ''; lb.textContent = '🔊 Escuchar otra vez'; }
  $('qBadge').textContent = '🎧 Escucha y elige';
  $('qInstruction').textContent = 'Escucha y toca la foto correcta';
  $('qVisual').innerHTML = `<div class="listen-big" onclick="speakListenWord()">🔊</div>`;
  const wEl = $('qWord');
  wEl.className = 'q-big-word';
  wEl.style.display = 'none';
  wEl.textContent = q.item.en;
  $('qTrans').textContent = '';

  const og = $('optsGrid');
  og.className = 'opts-grid';
  og.innerHTML = '';
  (q.opts || []).forEach(opt => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.dataset.correct = (opt === q.ans) ? '1' : '0';
    b.innerHTML = `${imgTag(opt.img, opt.em, 'ob-img', opt.en)}<span class="ob-word" style="opacity:.55">${opt.en}</span>`;
    b.onclick = (e) => chooser(b, q, e);
    og.appendChild(b);
  });
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
  setTimeout(() => speakListenWord(q), 400);
}
window.speakListenWord = function (q) {
  const item = (q && q.item) || (G.active && G.questions[G.qi] && G.questions[G.qi].item);
  if (!item) return;
  TTS.speak([{text: item.en, lang: 'en-US', rate: .7}, {text: item.en, lang: 'en-US', rate: .78, pauseMs: 0}]);
  beep(true);
};

window.startListenMission = function () {
  beep(true);
  const pool = [];
  gameWorlds().forEach(w => w.items.forEach(it => { if (it.img) pool.push({w, it}); }));
  if (pool.length < 8) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const picks = shuffle(pool).slice(0, 8);
  const qs = picks.map(({w, it}) => {
    let wrongs = shuffle(pool.filter(x => x.it !== it)).slice(0, 12).map(x => x.it);
    wrongs = shuffle([...new Set(wrongs)]).slice(0, 3);
    const opts = shuffle([it, ...wrongs]);
    return {item: it, world: w, opts, ans: it};
  });
  bootGameMission('listen', 'Listen & Pick', 'Escucha y elige', '🎧', qs, renderListenQuestion);
};

function renderListenQuestion() {
  if (!G.active || G.qi >= G.questions.length) { endMission(); return; }
  const q = G.questions[G.qi];
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Escucha ${G.qi + 1}/${tot}`;
  $('gProgFill').style.width = ((G.qi / tot) * 100) + '%';
  renderLivesRow();
  renderListenUI(q, (el, qq, e) => chooseListenAnswer(el, qq, e));
}

window.chooseListenAnswer = function (el, q, evt) {
  if (Date.now() < G.lockUntil) return;
  G.lockUntil = now() + 900;
  const ok = el.dataset.correct === '1';
  document.querySelectorAll('.opt-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === '1') b.classList.add('correct');
  });
  // revelar la palabra tras responder
  const wEl = $('qWord');
  wEl.style.display = '';
  wEl.classList.add('reveal-word');
  if (ok) {
    coreReward(q.item, evt);
    showFeedback(true, '¡Escucha perfecta! 👂', `${q.item.en} = ${q.item.es}`);
    TTS.sayWord(q.item.en, q.item.es, 'words');
  } else {
    el.classList.add('wrong');
    recordMistake(q.world.id, q.item);
    if (coreFail(q) === 'dead') return;
  }
  updateTopbar();
};

/* ══════════ 7) MEMORAMA (v5 — parejas foto+palabra) ══════════ */
window.startMemoryMission = function () {
  beep(true);
  const pool = gameWorlds().filter(w => w.items.filter(i => i.img).length >= 6);
  if (!pool.length) { notif('📚 Juega más mundos para desbloquear este juego', 'var(--red)'); return; }
  const world = pool[(Math.random() * pool.length) | 0];
  const picks = shuffle(world.items.filter(i => i.img)).slice(0, 6);
  const qs = picks.map(it => ({item: it}));
  const pp = activeProfile();
  G = {
    active: true, mtype: 'memory',
    world: {id: 'memory', name: 'Memory', es: 'Memorama', icon: '🃏', kind: 'memory', srcWorld: world},
    questions: qs, qi: 0, ok: 0, lives: 5,
    streak: pp ? (pp.streak || 0) : 0, newBadges: [],
    lockUntil: 0, t0: now(), renderFn: renderMemoryBoard, learned: 0,
    mem: {open: [], matched: 0, attempts: 0, lock: false, cards: []}
  };
  const cards = [];
  picks.forEach((it, id) => {
    cards.push({id, kind: 'img', it});
    cards.push({id, kind: 'word', it});
  });
  G.mem.cards = shuffle(cards);
  $('gWorldName').textContent = 'Memory / Memorama · ' + world.name;
  showScreen('gameScreen');
  document.querySelectorAll('.bnbtn').forEach((b, j) => b.classList.toggle('act', j === 1));
  renderMemoryBoard();
  updateTopbar();
};

function memCardFace(c) {
  return c.kind === 'img'
    ? imgTag(c.it.img, c.it.em, 'mem-face', c.it.en)
    : `<span class="mem-word">${c.it.en}</span>`;
}

function renderMemoryBoard() {
  if (!G.active) return;
  const m = G.mem;
  const tot = G.questions.length;
  $('gProgLabel').textContent = `Pareja ${Math.min(m.matched + 1, tot)}/${tot}`;
  $('gProgFill').style.width = ((m.matched / tot) * 100) + '%';
  renderLivesRow();
  const lb = $('listenBtn');
  if (lb) lb.style.display = 'none';
  $('qBadge').textContent = '🃏 Memorama';
  $('qInstruction').textContent = 'Encuentra cada foto con su palabra';
  $('qVisual').innerHTML = `<div class="match-hint">🎯 Intentos: ${m.attempts} · Encuentra las ${tot} parejas</div>`;
  const wEl = $('qWord');
  wEl.className = 'q-big-word';
  wEl.style.display = 'none';
  $('qTrans').textContent = '';

  const og = $('optsGrid');
  og.className = 'memory-host';
  og.innerHTML = m.cards.map((c, i) => `
    <button class="mem-card" data-i="${i}" data-id="${c.id}" onclick="memFlip(this)">
      <span class="mem-back">❓</span>
      <span class="mem-front">${memCardFace(c)}</span>
    </button>`).join('');
  const fb = $('feedbackBar');
  fb.className = 'feedback-bar';
}

window.memFlip = function (el) {
  const m = G.mem;
  if (!G.active || m.lock || el.classList.contains('done')) return;
  // Ya abierta: si es la única boca arriba, se puede cerrar tocándola otra vez
  if (el.classList.contains('open')) {
    if (m.open.length === 1 && m.open[0] === el) {
      el.classList.remove('open');
      m.open = [];
      beep(false);
    }
    return;
  }
  el.classList.add('open');
  m.open.push(el);
  beep(true);
  if (m.open.length < 2) return;

  m.lock = true;
  m.attempts++;
  const [a, b] = m.open;
  if (a.dataset.id === b.dataset.id && a !== b) {
    // ¡pareja!
    const it = G.questions[+a.dataset.id].item;
    const firstTry = (m.attempts - m.matched) === 1;
    setTimeout(() => {
      // ★ Fix v6: la pareja queda DESTAPADA para siempre (open + done)
      a.classList.add('done', 'open'); b.classList.add('done', 'open');
      a.classList.remove('wrong'); b.classList.remove('wrong');
      TTS.sayWord(it.en, it.es, 'words');
      G.qi = m.matched;
      if (firstTry) {
        coreReward(it, null); // ya suma G.ok (evita doble conteo 12/6)
        showFeedback(true, '¡De primera! 🌟', `${it.en} = ${it.es}`);
      } else {
        G.streak = 0;
        updateProfile(p => { p.streak = 0; });
        showFeedback(true, '¡Pareja! 🎉', `${it.en} = ${it.es}`);
      }
      m.matched++;
      m.open = []; m.lock = false;
      $('gProgLabel').textContent = `Pareja ${Math.min(m.matched + 1, G.questions.length)}/${G.questions.length}`;
      $('gProgFill').style.width = ((m.matched / G.questions.length) * 100) + '%';
      updateTopbar();
      setTimeout(() => {
        $('feedbackBar').className = 'feedback-bar';
        if (m.matched >= G.questions.length) endMission();
      }, 850);
    }, 350);
  } else {
    // no coinciden
    beep(false);
    TTS.sayFeedback(false);
    a.classList.add('wrong'); b.classList.add('wrong');
    setTimeout(() => {
      a.classList.remove('open', 'wrong');
      b.classList.remove('open', 'wrong');
      m.open = []; m.lock = false;
    }, 750);
  }
};
