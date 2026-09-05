window.SF = window.SF || {};
(function(NS){
  const UI = {
    els: {},
    init(){
      const ids = ['hud','hudPilot','hudStage','hudScore','hudLives','hpFill','hudPower','hudCheck','centerMsg','controlsTag','pauseBtn','pauseOverlay','pauseStats','assetStatus','savePreview','pilotName','shipGrid','rankingList','loadInfo'];
      ids.forEach(id => UI.els[id] = document.getElementById(id));
      document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', ()=>UI.showScreen(btn.dataset.back)));
    },
    showScreen(id){
      document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active', s.id===id));
    },
    hideScreens(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); },
    showHud(show){ UI.els.hud.style.display = show ? 'block' : 'none'; UI.els.controlsTag.style.display = show ? 'block' : 'none'; UI.els.pauseBtn.style.display = show ? 'inline-flex' : 'none'; },
    flashMsg(text, ms=900){
      const el = UI.els.centerMsg; el.textContent = text; el.style.display='block';
      clearTimeout(UI._msgT); UI._msgT = setTimeout(()=>{ el.style.display='none'; }, ms);
    },
    setStatus(text){ UI.els.assetStatus.textContent = text; },
    renderSavePreview(data){
      const el = UI.els.savePreview; if(!data){ el.innerHTML = '<div class="save-row"><span>Sin progreso guardado</span></div>'; return; }
      el.innerHTML = [
        ['Piloto', data.player], ['Sector', data.sector], ['Oleada', data.wave], ['Puntaje', data.score], ['Checkpoint', data.checkpointWave]
      ].map(([a,b])=>`<div class="save-row"><span>${a}</span><strong>${b}</strong></div>`).join('');
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
    renderHud(state){
      UI.els.hudPilot.textContent = `${state.player} · ${state.ship.name}`;
      UI.els.hudStage.textContent = `SECTOR ${state.sector} · OLEADA ${state.wave}${state.phaseName?` · ${state.phaseName}`:''}`;
      UI.els.hudScore.textContent = `${state.score} pts`;
      UI.els.hudPower.textContent = state.activePowerText || 'SIN PODER';
      UI.els.hudCheck.textContent = `CP ${state.checkpointWave || state.wave}`;
      const hpPct = Math.max(0, Math.min(1, state.hp / state.maxHp));
      UI.els.hpFill.style.width = `${hpPct*100}%`;
      UI.els.hudLives.innerHTML = Array.from({length: state.lives}, (_,i)=>`<span class="life-heart ${state.hp<=Math.max(2,Math.ceil(state.maxHp*.25)) && i===state.lives-1?'low':''}">❤</span>`).join('');
    },
    renderPause(state){
      UI.els.pauseOverlay.style.display = state.paused ? 'flex' : 'none';
      UI.els.pauseStats.innerHTML = `Piloto: <strong>${state.player}</strong><br>Sector ${state.sector} · Oleada ${state.wave}<br>Puntaje: ${state.score}<br>Vidas: ${state.lives} · Vida: ${state.hp}/${state.maxHp}`;
    }
  };
  NS.ui = UI;
})(window.SF);
