window.SF = window.SF || {};
(function(NS){
  const UI = {
    els: {},
    init(){
      const ids = ['hud','hudPilot','hudStage','hudScore','hudLives','hpFill','hudPower','hudCombo','hudEvo','hudCheck','hudObjective','hudFusion','hudMutator','centerMsg','controlsTag','pauseBtn','pauseOverlay','pauseStats','gameOverOverlay','gameOverStats','assetStatus','savePreview','pilotName','splashPilot','menuSaveHint','menuShipLabel','shipGrid','rankingList','loadInfo','hudEconomy','shopOverlay','shopBalance','shopBossPowers','shopGrid','shopBtn','fullscreenBtn'];
      ids.forEach(id => UI.els[id] = document.getElementById(id));
      document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', ()=>{ NS.audio?.ensure?.(); NS.audio?.ui?.('back'); UI.showScreen(btn.dataset.back); }));
    },
    showScreen(id){
      document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id===id));
    },
    hideScreens(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); },
    showHud(show){ UI.els.hud.style.display = show ? 'block' : 'none'; UI.els.controlsTag.style.display = show ? 'block' : 'none'; UI.els.pauseBtn.style.display = show ? 'inline-flex' : 'none'; if(show && UI.els.controlsTag) UI.els.controlsTag.textContent = innerWidth<=600 ? 'ARRASTRA · AUTO-FUEGO' : 'ARRASTRA / ← → · AUTO-FUEGO · P PAUSA'; },
    flashMsg(text, ms=900){
      const el = UI.els.centerMsg; el.textContent = text; el.style.display='block';
      clearTimeout(UI._msgT); UI._msgT = setTimeout(()=>{ el.style.display='none'; }, ms);
    },
    setStatus(text){ if(UI.els.assetStatus) UI.els.assetStatus.textContent = text; },
    renderSavePreview(data){
      const el = UI.els.savePreview; if(!el) return; if(!data){ el.innerHTML = '<div class="save-row"><span>Sin progreso guardado</span></div>'; return; }
      el.innerHTML = [
        ['Piloto', data.player], ['Sector', data.sector], ['Oleada', data.wave], ['Puntaje', data.score], ['Checkpoint', data.checkpointWave]
      ].map(([a,b])=>`<div class="save-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
    },
    renderMenuSummary(data, ship){
      if(UI.els.menuSaveHint){
        UI.els.menuSaveHint.textContent = data ? `Partida guardada · Sector ${data.sector} · Oleada ${data.wave} · ${data.score} pts` : 'Sin partida guardada';
      }
      if(UI.els.menuShipLabel) UI.els.menuShipLabel.textContent=(ship?.name||'Vanguard').toUpperCase();
      const c=document.getElementById('continueBtn'); if(c) c.disabled=!data;
      if(UI.els.splashPilot && !UI.els.splashPilot.value && data?.player) UI.els.splashPilot.value=data.player;
    },
    renderHangar(ships, selectedId, bestScore=0){
      UI.els.shipGrid.innerHTML = ships.map(s=>{
        const locked = bestScore < s.unlock;
        return `<div class="ship-card ${locked?'locked':''}">
          <div class="ship-illus" style="--ship-color:${s.color};--ship-accent:${s.accent}"></div>
          <h3>${s.name}</h3>
          <div class="ship-stats">${s.desc}<br>Velocidad: ${Math.round(s.speed)} · Cadencia: ${s.fireRate.toFixed(2)}s · Daño: ${s.damage.toFixed(2)}</div>
          <div class="row"><button data-ship="${s.id}" ${locked?'disabled':''}>${selectedId===s.id?'Equipada':locked?`Bloq. ${s.unlock}`:'Equipar'}</button></div>
        </div>`;
      }).join('');
    },
    renderRanking(items){
      UI.els.rankingList.innerHTML = items.length ? items.map((r,i)=>`<div class="list-item"><span>#${i+1} ${r.name}</span><span>${r.score} · S${r.sector}-O${r.wave}</span></div>`).join('') : '<div class="list-item"><span>Sin registros</span></div>';
    },
    renderLoadInfo(data){
      UI.els.loadInfo.innerHTML = data ? [`Piloto: ${data.player}`, `Sector ${data.sector} · Oleada ${data.wave}`, `Puntaje: ${data.score}`, `Vidas: ${data.lives}`, `Checkpoint: oleada ${data.checkpointWave}`].map(v=>`<div class="list-item"><span>${v}</span></div>`).join('') : '<div class="list-item"><span>No existe partida guardada</span></div>';
    },
    renderEconomy(profile){
      if(!profile) return;
      if(UI.els.hudEconomy) UI.els.hudEconomy.textContent=`NV ${profile.level} · XP ${profile.xpIntoLevel}/${profile.xpToNext} · ◈ ${profile.coins}`;
    },
    renderShop(profile,catalog,inGame=false){
      if(!profile) return;
      UI.renderEconomy(profile);
      if(UI.els.shopBalance) UI.els.shopBalance.innerHTML=`<span>NIVEL ${profile.level}</span><span>XP ${profile.xpIntoLevel}/${profile.xpToNext}</span><span>◈ ${profile.coins} MONEDAS</span><span>MEJOR RACHA x${profile.bestStreak||0}</span>`;
      const bp=Object.keys(profile.bossPowers||{});
      if(UI.els.shopBossPowers) UI.els.shopBossPowers.textContent=bp.length?`PODERES DE JEFE HEREDADOS: ${bp.map(k=>NS.config.powers[k]?.label||k).join(' · ')}`:'PODERES DE JEFE HEREDADOS: derrota al primer jefe para desbloquearlos.';
      if(UI.els.shopGrid) UI.els.shopGrid.innerHTML=(catalog||[]).map(item=>{
        const cls=item.maxed?'maxed':item.affordable?'affordable':!item.levelOk?'locked':'unaffordable';
        const lock=!item.levelOk?`<span class="shop-lock">NV ${item.level}</span>`:item.maxed?'<span class="shop-lock">MÁX.</span>':'';
        const owned=item.type==='consumable'?`CARGAS ${item.owned}`:`MEJORA ${item.owned}/${item.max}`;
        const buyLabel=item.maxed?'MÁXIMO':!item.levelOk?`NV ${item.level}`:`COMPRAR ◈${item.price}`;
        const use=(item.type==='consumable'&&inGame)?`<button class="use-btn" data-use="${item.kind}" ${item.owned>0?'':'disabled'}>USAR ×${item.owned}</button>`:'';
        return `<div class="shop-item ${cls}">${lock}<div class="shop-item-title">${item.label}</div><div class="shop-item-desc">${item.desc}</div><div class="shop-meta"><span class="shop-owned">${owned}</span><span class="shop-price">◈ ${item.price}</span></div><div class="shop-actions"><button data-buy="${item.id}" ${item.affordable?'':'disabled'}>${buyLabel}</button>${use}</div></div>`;
      }).join('');
    },
    setFullscreenState(active,supported=true){
      if(!UI.els.fullscreenBtn) return; UI.els.fullscreenBtn.textContent=active?'[■]':'[ ]'; UI.els.fullscreenBtn.disabled=!supported; UI.els.fullscreenBtn.title=active?'Salir de pantalla completa':'Pantalla completa';
    },
    renderHud(state){
      UI.els.hudPilot.textContent = `${state.player} · ${state.ship.name}`;
      UI.els.hudStage.textContent = state.sectorName ? `MUNDO ${state.sector} · ${state.sectorName} · O${state.wave}${state.phaseName?` · ${state.phaseName}`:''}` : `SECTOR ${state.sector} · OLEADA ${state.wave}${state.phaseName?` · ${state.phaseName}`:''}`;
      UI.els.hudScore.textContent = `${state.score} pts`;
      if(state.economyProfile) UI.renderEconomy(state.economyProfile);
      UI.els.hudPower.textContent = state.activePowerText || 'SIN PODER';
      if(UI.els.hudEvo) UI.els.hudEvo.textContent=state.evolutionText||'EVO —';
      if(UI.els.hudCombo){
        UI.els.hudCombo.textContent = state.combo>=2 ? `RACHA x${state.combo}` : '—';
        UI.els.hudCombo.classList.toggle('hot', state.combo>=5 && state.combo<15);
        UI.els.hudCombo.classList.toggle('critical', state.combo>=15);
      }
      UI.els.hudCheck.textContent = `CP ${state.checkpointWave || state.wave}`;
      if(UI.els.hudObjective) UI.els.hudObjective.textContent=state.objectiveText||'OBJ —';
      if(UI.els.hudFusion) UI.els.hudFusion.textContent=state.fusionText||'';
      if(UI.els.hudMutator) UI.els.hudMutator.textContent=state.mutatorName||'';
      const hpPct = Math.max(0, Math.min(1, state.hp / state.maxHp));
      UI.els.hpFill.style.width = `${hpPct*100}%`;
      UI.els.hudLives.innerHTML = Array.from({length: state.lives}, (_,i)=>`<span class="life-heart ${state.hp<=Math.max(2,Math.ceil(state.maxHp*.25)) && i===state.lives-1?'low':''}">❤</span>`).join('');
    },
    renderPause(state){
      const show = state.paused && !state.gameOver && !state.lifeLost;
      UI.els.pauseOverlay.style.display = show ? 'flex' : 'none';
      UI.els.pauseStats.innerHTML = `Piloto: <strong>${state.player}</strong><br>Sector ${state.sector} · Oleada ${state.wave}<br>Puntaje: ${state.score}<br>Vidas: ${state.lives} · Vida: ${Math.max(0,Math.round(state.hp*10)/10)}/${state.maxHp}<br>Racha: x${state.combo||0}`;
    },
    renderGameOver(state, show){
      UI.els.gameOverOverlay.style.display = show ? 'flex' : 'none';
      if(show){
        UI.els.gameOverStats.innerHTML = `Piloto: <strong>${state.player}</strong><br>Sector ${state.sector} · Oleada ${state.wave}<br>Puntaje: ${state.score}<br>Checkpoint: oleada ${state.checkpointWave}`;
      }
    }
  };
  NS.ui = UI;
})(window.SF);
