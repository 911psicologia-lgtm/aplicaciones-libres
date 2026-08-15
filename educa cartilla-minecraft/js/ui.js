// ═══════════════════════════════════════════
//   SAI QUEST — UI, Renderizado y Animaciones
// ═══════════════════════════════════════════

// ── MAPA ──
function renderMap() {
  if (!P) return;
  const synced = syncCertificates();
  if (synced.length) saveP();
  const li = lvlInfo(P.xp);
  $('hav').textContent = P.av;
  $('hn').textContent = P.name;
  $('hs').textContent = 'Nivel ' + li.cur.n + ' · ' + li.cur.name;
  $('xpC').textContent = P.xp;
  $('xpN').textContent = li.nxt.xp;
  $('xpNL').textContent = li.cur.n < LVS.length ? li.cur.n + 1 : li.cur.n;
  $('xpBar').style.width = li.pct + '%';
  $('stX').textContent = P.xp;
  $('stC').textContent = P.coins;
  $('stS').textContent = P.streak;
  $('stM').textContent = P.tm;
  updTop();

  // Verificar si hay certificado disponible y mostrarlo
  checkAndShowCertBtn();

  const g = $('biGrid');
  g.innerHTML = '';

  // Construir lista dinámica de biomas visibles
  const visibleBiomes = [];

  // 5 mundos normales
  for (let i = 0; i < 5; i++) visibleBiomes.push(BIOMES[i]);

  // IE: solo si está desbloqueado
  if (isIEUnlocked()) visibleBiomes.push(BIOMES[5]);

  // Entrenamiento: siempre disponible
  if (BIOMES[6]) visibleBiomes.push(BIOMES[6]);

  // Taller de Aritmética: siempre permanente
  if (BIOMES[7]) visibleBiomes.push(BIOMES[7]);

  // 5 nuevos mundos: visibles, pero con acceso condicionado por progreso núcleo
  for (let i = 8; i < BIOMES.length; i++) visibleBiomes.push(BIOMES[i]);

  const newWorldsUnlocked = areNewWorldsUnlocked();

  visibleBiomes.forEach((b, i) => {
    const isTraining = b.id === 'entrenamiento';
    const isTaller = b.id === 'taller_aritmetica';
    const isIE = b.id === 'inteligencia_emocional';
    const isNewWorld = NEW_WORLD_IDS.includes(b.id);
    const isSpecial = isTraining || isTaller;
    const hasProgress = isNewWorld && hasNewWorldProgress(b.id);
    const canOpenNewWorld = !isNewWorld || newWorldsUnlocked || hasProgress;

    // Para biomas especiales: progreso simple; IE usa _diffLevel
    const pr = isTraining
      ? { d: Object.keys(P.prog).filter(k => k.startsWith('entrenamiento_train')).length, t: 4 }
      : isTaller
        ? { d: Object.keys(P.prog).filter(k => k.startsWith('taller_aritmetica_') && P.prog[k]?.done).length, t: 5 }
        : bioProgress(b.id, _diffLevel);
    const st = isTraining ? 0 : isTaller ? bioStars('taller_aritmetica', 'basico') : bioStars(b.id, _diffLevel);

    const div = document.createElement('div');
    const isWide = i === visibleBiomes.length - 1 && visibleBiomes.length % 2 !== 0;

    let extraCls = '';
    if (isTraining) extraCls = ' bc-training';
    if (isTaller) extraCls = ' bc-taller';
    if (isIE) extraCls = ' bc-ie-unlocked';
    if (isNewWorld) extraCls += ' bc-new-world';
    if (isNewWorld && !canOpenNewWorld) extraCls += ' bc-locked-world';

    div.className = 'bc ' + b.cls + (isWide ? ' bwide' : '') + extraCls;

    const diffLabel = isIE || isTraining || isTaller ? '' :
      _diffLevel === 'medio' ? ' 🌟' :
      _diffLevel === 'complejo' ? ' 💎' :
      _diffLevel === 'supercomplejo' ? ' 🔥' : '';

    let subtitle = isTraining
      ? '<div class="bc-training-tag">🎯 SIEMPRE ABIERTO</div>'
      : isTaller
        ? '<div class="bc-taller-tag">🔢 TALLER PERMANENTE</div>'
        : isIE
          ? '<div class="bc-ie-tag">🌈 ¡DESBLOQUEADO!</div>'
          : isNewWorld && !canOpenNewWorld
            ? '<div class="bc-lock-tag">🔒 COMPLETA BÁSICO + MEDIO</div>'
            : isNewWorld && !hasProgress
              ? '<div class="bc-new-tag">✨ NUEVO MUNDO</div>'
              : '';

    const maxSt = isTraining ? 0 : pr.t * 3;
    const stPct = maxSt > 0 ? Math.round((st / maxSt) * 100) : 0;
    const stBar = isTraining ? '' :
      `<div style="width:100%;height:5px;background:rgba(255,255,255,.15);border-radius:3px;margin-top:4px">
        <div style="height:100%;width:${stPct}%;background:${stPct===100?'#ffd700':stPct>=60?'#69f0ae':'#fff59d'};border-radius:3px;transition:width .4s"></div>
       </div>
       <div style="font-size:.6em;color:rgba(255,255,255,.7);margin-top:2px">⭐ ${st}/${maxSt}</div>`;
    const progressText = isTraining ? 'Práctica libre' : (isNewWorld && !canOpenNewWorld ? 'Bloqueado por progreso' : pr.d + '/' + pr.t + ' misiones');
    div.innerHTML = `<div class="bc-bg">${b.ico}</div><span class="bci">${isNewWorld && !canOpenNewWorld ? '🔒' : b.ico}</span><div class="bcn">${b.n.replace('\n', ' ')}${diffLabel}</div>${subtitle}<div class="bcp">${progressText}</div>${stBar}`;
    div.onclick = () => {
      if (isNewWorld && !canOpenNewWorld) {
        toast('🔒 Completa las 4 misiones principales en Básico y Medio de los 5 biomas iniciales para abrir este nuevo mundo.', 4500);
        return;
      }
      // v3.9.0: los mundos adicionales abren directo en Básico para evitar que
      // el selector parezca una pantalla bloqueada. Desde dentro se puede cambiar nivel.
      if (isNewWorld) {
        _diffLevel = 'basico';
        _bio = BIOMES.find(x => x.id === b.id);
        renderBiomeAfterLevelSelect(b.id);
        return;
      }
      openLevelSelect(b.id);
    };
    g.appendChild(div);
  });
}

// ── BIOMA — Muestra selector de nivel primero ──
function openBio(id) {
  _bio = BIOMES.find(b => b.id === id);
  if (!_bio) return;
  if (_diffLevel === 'complejo' && !QD_COMPLEJO[id]) {
    toast('Este bioma no está disponible en nivel Complejo');
    return;
  }
  openLevelSelect(id);
}

// ── Renderizar bioma después de seleccionar nivel ──
function renderBiomeAfterLevelSelect(bid) {
  if (!_bio) return;
  const diff = _diffLevel;
  const labels = {basico: '⭐ Básico', medio: '🌟 Medio', complejo: '💎 Complejo', supercomplejo: '🔥 Súper Complejo'};

  const isTraining = bid === 'entrenamiento';
  const isTaller = bid === 'taller_aritmetica';
  const isIE = bid === 'inteligencia_emocional';

  snd('clk');

  if (isTraining) {
    $('bHdr').innerHTML = `<span class="bhi">🎯</span><div class="bhn">Zona de Entrenamiento<div class="bhl">¡Practica sin miedo! Siempre abierta</div></div>`;
    const ml = $('mList');
    ml.innerHTML = '';
    const trainLabels = ['Práctica 1','Práctica 2','Práctica 3','Práctica 4'];
    const trainIcons = ['🎯','🏹','⚔️','🛡️'];
    trainLabels.forEach((mn, i) => {
      const card = document.createElement('div');
      card.className = 'mc mc-training';
      card.innerHTML = `<div class="mci">${trainIcons[i]}</div>
        <div class="minfo"><div class="mn">🎯 ${mn}: Preguntas Mixtas</div>
        <div class="ms">5 preguntas aleatorias · ¡Sin bloqueos!</div></div>
        <div class="mst">▶</div>`;
      card.onclick = () => startMis(bid, i);
      ml.appendChild(card);
    });
    show('biomeScreen');
    return;
  }

  if (isTaller) {
    $('bHdr').innerHTML = `<span class="bhi">🔢</span><div class="bhn">Taller de Aritmética<div class="bhl">📐 Preparación para el examen — Basado en el taller del Gimnasio Contemporáneo</div></div>`;
    const ml = $('mList');
    ml.innerHTML = '';
    const tallerMissions = ['Fracciones a Decimales','Decimales a Fracciones','Leer Decimales en Inglés','Valor Posicional'];
    const tallerIcons = ['➗','🔄','🇬🇧','📊'];
    tallerMissions.forEach((mn, i) => {
      const key = 'taller_aritmetica_' + i;
      const pr = P.prog[key] || {};
      const isX = i === 4;
      const prevKey = 'taller_aritmetica_' + (i - 1);
      const isLk = i > 0 && !P.prog[prevKey]?.done;
      const card = document.createElement('div');
      card.className = 'mc mc-taller' + (pr.done ? ' done' : '') + (isLk ? ' locked' : '');
      card.innerHTML = '<div class="mci">' + tallerIcons[i] + '</div>' +
        '<div class="minfo"><div class="mn">Misión ' + (i+1) + ': ' + mn + '</div>' +
        '<div class="ms">' + (pr.done ? '⭐'.repeat(pr.stars||0)+'☆'.repeat(3-(pr.stars||0)) : '5 preguntas · Taller del Gimnasio') + '</div></div>' +
        '<div class="mst">' + (pr.done ? '✅' : '▶') + '</div>';
      if (!isLk) card.onclick = () => startMis(bid, i);
      ml.appendChild(card);
    });
    // Misión extra (índice 4)
    const extraKey = 'taller_aritmetica_4';
    const extraPr = P.prog[extraKey] || {};
    const prev4 = P.prog['taller_aritmetica_3'];
    const isLk4 = !prev4?.done;
    const extraCard = document.createElement('div');
    extraCard.className = 'mc extra mc-taller' + (extraPr.done ? ' done' : '') + (isLk4 ? ' locked' : '');
    extraCard.innerHTML = '<div class="mci">⚡</div>' +
      '<div class="minfo"><div class="mn">Misión Extra: Desafío Mixto</div>' +
      '<div class="ms">' + (extraPr.done ? '⭐'.repeat(extraPr.stars||0)+'☆'.repeat(3-(extraPr.stars||0)) : '5 preguntas · Todos los temas') + '</div></div>' +
      '<div class="mst">' + (extraPr.done ? '✅' : '▶') + '</div>';
    if (!isLk4) extraCard.onclick = () => startMis(bid, 4);
    ml.appendChild(extraCard);


    // Boss
    if (typeof isBossUnlocked === 'function' && isBossUnlocked('taller_aritmetica','basico')) {
      const boss = typeof BOSS_DATA !== 'undefined' && BOSS_DATA.taller_aritmetica;
      if (boss && boss.levels.basico) {
        const defeated = typeof isBossDefeated === 'function' && isBossDefeated('taller_aritmetica','basico');
        const reward = boss.levels.basico.reward;
        const bossCard = document.createElement('div');
        bossCard.className = 'mc boss-mission' + (defeated ? ' boss-done' : ' boss-unlocked');
        bossCard.innerHTML = '<div class="mci boss-icon">' + boss.emoji + '</div>' +
          '<div class="minfo"><div class="mn">⚔️ JEFE FINAL: ' + boss.name + '</div>' +
          '<div class="ms">' + (defeated ? reward.ico + ' ' + reward.n + ' · obtenido' : '¡Demuestra tu dominio del Taller!') + '</div></div>' +
          '<div class="mst">' + (defeated ? '👑' : '⚔️') + '</div>';
        bossCard.onclick = () => openBossIntro('taller_aritmetica','basico');
        ml.appendChild(bossCard);
      }
    }

    const tallerDone = [0,1,2,3,4].filter(i => P.prog['taller_aritmetica_' + i]?.done).length;
    const tallerPct = Math.round((tallerDone / 5) * 100);
    const tallerStars = [0,1,2,3,4].reduce((acc, i) => acc + (P.prog['taller_aritmetica_' + i]?.stars || 0), 0);
    const statusCard = document.createElement('div');
    statusCard.className = 'taller-status-card' + (tallerDone >= 5 ? ' complete' : '');
    statusCard.innerHTML =
      '<div class="taller-status-top">' +
        '<strong>' + (tallerDone >= 5 ? '✅ Taller completado' : '🔢 Avance del Taller') + '</strong>' +
        '<span>' + tallerDone + '/5 misiones</span>' +
      '</div>' +
      '<div class="taller-status-bar"><div style="width:' + tallerPct + '%"></div></div>' +
      '<div class="taller-status-foot">⭐ ' + tallerStars + '/15 estrellas acumuladas</div>';
    ml.appendChild(statusCard);

    show('biomeScreen');
    return;
  }

  const label = labels[diff] || '';
  $('bHdr').innerHTML = '<span class="bhi">' + _bio.ico + '</span><div class="bhn">' + _bio.n.replace('\n', ' ') + '<div class="bhl">' + label + '</div></div>' +
    '<button class="btn bghost bsm" style="margin-top:8px;font-size:.7em;padding:6px 12px" onclick="openLevelSelect(\'' + bid + '\')">🔄 Cambiar nivel</button>';

  const ml = $('mList');
  ml.innerHTML = '';
  const icons = MISSION_ICONS[bid] || ['🔵','🟢','🟡','🔴','⚡'];

  // Siempre 4 misiones base + MODO EXTRA = 5 total para todos los mundos normales e IE
  const missions = [..._bio.mns].slice(0, 4);
  missions.push('⚡ MODO EXTRA');

  missions.forEach((mn, i) => {
    const key = getProgKey(bid, i, diff, false);
    const pr = P.prog[key] || {};
    const isX = i === 4;
    const prevKey = getProgKey(bid, i - 1, diff, false);
    const isLk = i > 0 && !P.prog[prevKey]?.done;
    const card = document.createElement('div');
    card.className = 'mc' + (pr.done ? ' done' : '') + (isLk ? ' locked' : '') + (isX ? ' extra' : '');
    card.innerHTML = `<div class="mci">${icons[i] || '🔵'}</div>
      <div class="minfo"><div class="mn">Misión ${isX ? 'Extra' : i + 1}: ${mn}</div>
      <div class="ms">${pr.done ? '⭐'.repeat(pr.stars || 0) + '☆'.repeat(3 - (pr.stars || 0)) : '5 preguntas · Pendiente'}</div></div>
      <div class="mst">${pr.done ? '✅' : '▶'}</div>`;
    if (!isLk) card.onclick = () => startMis(bid, i);
    ml.appendChild(card);
  });

  // ── TARJETA DE EVALUACIÓN ──
  if (!isTraining && !isTaller) {
    const evalKey = bid + '_eval_' + diff;
    const evalDoneKey = bid + '_eval_' + diff + '_done';
    const evalAvail = P.prog[evalKey] === 'available' || checkEvalUnlock(bid, diff);
    const evalDone = P.prog[evalDoneKey];
    if (evalAvail) {
      const evalCard = document.createElement('div');
      evalCard.className = 'mc eval-mission' + (evalDone ? ' done' : ' eval-ready');
      evalCard.innerHTML =
        '<div class="mci">📝</div>' +
        '<div class="minfo">' +
          '<div class="mn">📝 EVALUACIÓN DEL MUNDO</div>' +
          '<div class="ms">' + (evalDone ? '✅ ' + evalDone.pct + '% · Completada' : '¡10 preguntas · Tu nivel ha sido desbloqueado!') + '</div>' +
        '</div>' +
        '<div class="mst">' + (evalDone ? '🏅' : '▶') + '</div>';
      evalCard.onclick = () => {
        if (evalDone) {
          // Permitir reintentar la evaluación
          const stars = '⭐'.repeat(evalDone.stars || 0) + '☆'.repeat(3 - (evalDone.stars || 0));
          const msg = '📝 ' + evalDone.pct + '% · ' + stars + ' — ¿Intentar de nuevo para mejorar?';
          toast(msg, 3500);
          setTimeout(() => showEvalModal(bid, diff), 1000);
        } else {
          showEvalModal(bid, diff);
        }
      };
      ml.appendChild(evalCard);
    }
  }

  // ── TARJETA DE JEFE FINAL ──
  if (!isTraining && !isTaller && typeof isBossUnlocked === 'function' && isBossUnlocked(bid, diff)) {
    const boss = typeof BOSS_DATA !== 'undefined' && BOSS_DATA[bid];
    if (boss && boss.levels[diff]) {
      const defeated = typeof isBossDefeated === 'function' && isBossDefeated(bid, diff);
      const reward = boss.levels[diff].reward;
      const bossCard = document.createElement('div');
      bossCard.className = 'mc boss-mission' + (defeated ? ' boss-done' : ' boss-unlocked');
      bossCard.innerHTML =
        '<div class="mci boss-icon">' + boss.emoji + '</div>' +
        '<div class="minfo">' +
          '<div class="mn">⚔️ JEFE FINAL: ' + boss.name + '</div>' +
          '<div class="ms">' + (defeated ? reward.ico + ' ' + reward.n + ' · obtenido' : '¡Demuestra tu dominio completo del bioma!') + '</div>' +
        '</div>' +
        '<div class="mst">' + (defeated ? '👑' : '⚔️') + '</div>';
      bossCard.onclick = () => openBossIntro(bid, diff);
      ml.appendChild(bossCard);
    }
  }

  show('biomeScreen');
}

// ── MODAL DE CONFIRMACIÓN DE EVALUACIÓN ──
function showEvalModal(bid, diff) {
  const bioName = BIOMES.find(b => b.id === bid)?.n?.replace('\n',' ') || bid;
  const diffName = {basico:'⭐ Básico',medio:'🌟 Medio',complejo:'💎 Complejo',supercomplejo:'🔥 Súper Complejo'}[diff] || diff;
  const em = $('evalModal');
  if (!em) {
    // Si no existe el modal, iniciar directamente
    startEval(bid, diff);
    return;
  }
  $('evalModalTitle').textContent = '📝 Evaluación: ' + bioName;
  $('evalModalDesc').textContent = 'Nivel ' + diffName + ' · 10 preguntas aleatorias del banco completo · ¡Demuestra todo lo que sabes!';
  $('evalModalStart').onclick = () => { closeModal('evalModal'); startEval(bid, diff); };
  openModal('evalModal');
}

// ═══════════════════════════════════════════
//   ANIMACIONES
// ═══════════════════════════════════════════

function spawnXPFloat(text, refEl) {
  const popup = document.createElement('div');
  popup.className = 'xp-float';
  popup.textContent = text;
  if (text.includes('🪙') || text.includes('coin')) popup.classList.add('coins');
  if (refEl) {
    popup.style.left = (refEl.left + refEl.width / 2) + 'px';
    popup.style.top = (refEl.top) + 'px';
  } else {
    popup.style.left = '50%';
    popup.style.top = '40%';
    popup.style.transform = 'translateX(-50%)';
  }
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1800);
}

function showCombo(count) {
  const cd = $('comboDisplay');
  const cc = $('comboCount');
  const cl = $('comboLabel');
  cc.textContent = count;
  cl.textContent = count >= 5 ? 'MEGA COMBO' : 'COMBO';
  cd.classList.toggle('combo-mega', count >= 5);
  if (count >= 3) {
    cc.innerHTML = `<span class="combo-fire">🔥</span> x${count}`;
  } else {
    cc.textContent = 'x' + count;
  }
  cd.classList.add('show');
  clearTimeout(_comboTimer);
  _comboTimer = setTimeout(() => { cd.classList.remove('show'); cd.classList.remove('combo-mega'); }, 3000);
}

function hideCombo() {
  const cd = $('comboDisplay');
  if (cd) { cd.classList.remove('show'); cd.classList.remove('combo-mega'); }
  clearTimeout(_comboTimer);
}

function showMissionFlash(name) {
  const flash = document.createElement('div');
  flash.className = 'mission-flash';
  flash.innerHTML = `<div class="mission-flash-text">⚔️ ${name}</div>`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1300);
}

function showLvl(lv) {
  $('luTxt').textContent = 'Nivel ' + lv.n + ': ' + lv.name;
  $('lvlUp').classList.add('show');
  snd('lvl');
  conf();
}

function closeLvl() { $('lvlUp').classList.remove('show'); }

function showBadgeOverlay(badge) {
  const overlay = $('badgeOverlay');
  const content = $('badgeContent');
  content.innerHTML = `
    <div class="badge-sparkles">
      ${Array.from({length: 8}, (_, i) =>
        `<div class="badge-sparkle" style="left:${10+Math.random()*80}%;top:${10+Math.random()*80}%;animation-delay:${Math.random()*2}s"></div>`
      ).join('')}
    </div>
    <span class="badge-icon-big">${badge.ico}</span>
    <div class="px" style="font-size:.65em;margin:8px 0">¡NUEVO LOGRO!</div>
    <div style="font-size:1.2em;font-weight:900;color:var(--gold);margin-bottom:6px">${badge.n}</div>
    <div style="font-size:.78em;color:var(--muted);margin-bottom:14px">${badge.d}</div>
    <button class="btn bgold bsm" onclick="closeBadgeOverlay()">¡Genial! 🎉</button>
  `;
  overlay.classList.add('show');
}

function closeBadgeOverlay() { $('badgeOverlay').classList.remove('show'); }

function conf() {
  const box = $('cbox');
  box.innerHTML = '';
  const cols = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9FF3', '#54A0FF'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'cp';
    const sz = 5 + Math.random() * 10;
    const shapes = Math.random() > 0.5 ? '50%' : '2px';
    p.style.cssText = `left:${Math.random()*100}%;width:${sz}px;height:${sz}px;
      background:${cols[Math.floor(Math.random()*cols.length)]};
      --dur:${1.5+Math.random()*2.5}s;animation-delay:${Math.random()*1}s;
      border-radius:${shapes}`;
    box.appendChild(p);
  }
  setTimeout(() => box.innerHTML = '', 5000);
}

function initStars() {
  const c = $('stars');
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'st';
    const sz = 1 + Math.random() * 2.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:${Math.random()*6}s`;
    c.appendChild(s);
  }
}

function initXPGlow() {
  setInterval(() => {
    const bars = document.querySelectorAll('.xpf');
    bars.forEach(bar => {
      const w = parseInt(bar.style.width);
      if (w > 0 && w < 100) bar.classList.add('xpf-glow');
      else bar.classList.remove('xpf-glow');
    });
  }, 2000);
}

// ── INIT ──
function init() {
  initStars();
  iAC();
  initXPGlow();

  if (loadP()) {
    migrateP();
    saveP();
    $('iName').value = P.name;
    document.querySelectorAll('.av').forEach(a => {
      if (a.dataset.a === P.av) { a.classList.add('sel'); _av = P.av; }
      else a.classList.remove('sel');
    });
  }
}

init();
