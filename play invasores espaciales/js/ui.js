window.SF = window.SF || {};
(function(NS){
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  const UI = {
    els: {},
    init(){
      const ids = ['hud','hudPilot','hudStage','hudScore','hudLives','hpFill','hudPower','hudCombo','hudEvo','hudCheck','hudObjective','hudFusion','hudMutator','centerMsg','controlsTag','pauseBtn','pauseOverlay','pauseStats','gameOverOverlay','gameOverStats','assetStatus','savePreview','pilotName','splashPilot','menuSaveHint','menuShipLabel','shipGrid','rankingList','loadInfo','hudEconomy','shopOverlay','shopBalance','shopBossPowers','shopGrid','shopBtn','helpBtn','helpOverlay','fullscreenBtn','srLive','hpBar','hangarBalance','hangarUpgrades','hangarLoadout','bossAllyBtn','tacticalBelt'];
      ids.forEach(id => UI.els[id] = document.getElementById(id));
      document.querySelectorAll('[data-back]').forEach(btn => btn.addEventListener('click', ()=>{ NS.audio?.ensure?.(); NS.audio?.ui?.('back'); UI.showScreen(btn.dataset.back); }));
    },
    showScreen(id){
      document.querySelectorAll('.screen').forEach(s=>{ const active=s.id===id; s.classList.toggle('active',active); s.setAttribute('aria-hidden',active?'false':'true'); });
    },
    hideScreens(){ document.querySelectorAll('.screen').forEach(s=>{s.classList.remove('active');s.setAttribute('aria-hidden','true');}); },
    showHud(show){ UI.els.hud.style.display = show ? 'block' : 'none'; UI.els.controlsTag.style.display = show ? 'block' : 'none'; UI.els.pauseBtn.style.display = show ? 'inline-flex' : 'none'; UI.els.tacticalBelt?.classList.toggle('active',!!show); if(show && UI.els.controlsTag) UI.els.controlsTag.textContent = innerWidth<=600 ? 'ARRASTRA · AUTO-FUEGO · 1–6 PODERES' : 'ARRASTRA / WASD · 1–6 PODERES · B JEFE · P PAUSA'; },
    flashMsg(text, ms=900){
      const el = UI.els.centerMsg; el.textContent = text; el.style.display='block';
      if(UI.els.srLive) UI.els.srLive.textContent=text; clearTimeout(UI._msgT); UI._msgT = setTimeout(()=>{ el.style.display='none'; }, ms);
    },
    setStatus(text){ if(UI.els.assetStatus) UI.els.assetStatus.textContent = text; },
    renderSavePreview(data){
      const el = UI.els.savePreview; if(!el) return; if(!data){ el.innerHTML = '<div class="save-row"><span>Sin progreso guardado</span></div>'; return; }
      el.innerHTML = [
        ['Piloto', data.player], ['Sector', data.sector], ['Oleada', data.wave], ['Puntaje', data.score], ['Checkpoint', data.checkpointWave]
      ].map(([a,b])=>`<div class="save-row"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');
    },
    renderMenuSummary(data, ship){
      if(UI.els.menuSaveHint){
        UI.els.menuSaveHint.textContent = data ? `Partida guardada · Sector ${data.sector} · Oleada ${data.wave} · ${data.score} pts` : 'Sin partida guardada';
      }
      if(UI.els.menuShipLabel) UI.els.menuShipLabel.textContent=(ship?.name||'Vanguard').toUpperCase();
      const c=document.getElementById('continueBtn'); if(c) c.disabled=!data;
      if(UI.els.splashPilot && !UI.els.splashPilot.value && data?.player) UI.els.splashPilot.value=data.player;
    },
    renderHangar(ships, selectedId, bestScore=0, profile=null, catalog=[]){
      const p=profile||NS.economy?.state?.()||{};
      if(UI.els.hangarBalance) UI.els.hangarBalance.textContent=`NV ${p.level||1} · ◈ ${p.coins||0} · ↻ ${p.inventory?.revive||0}`;
      UI.els.shipGrid.innerHTML = ships.map(s=>{
        const locked = bestScore < s.unlock;
        return `<div class="ship-card compact ${locked?'locked':''}">
          <div class="ship-illus"><img class="ship-preview-img" src="assets/ships/${esc(s.id)}.png" alt="Nave ${esc(s.name)}" loading="lazy"></div>
          <div class="ship-compact-head"><strong>${esc(s.name)}</strong><span>${selectedId===s.id?'EQUIPADA':locked?'BLOQ.':'LISTA'}</span></div>
          <div class="ship-mini-stats"><b>❤${esc(s.hp)}</b><b>⚡${Math.round(s.speed)}</b><b>✹${esc(s.damage.toFixed(2))}</b></div>
          <button data-ship="${s.id}" ${locked?'disabled':''}>${selectedId===s.id?'✓':locked?`${s.unlock}`:'EQUIPAR'}</button>
        </div>`;
      }).join('');
      const up=p.upgrades||{};
      const equipped=ships.find(x=>x.id===selectedId)||ships[0];
      if(UI.els.hangarLoadout && equipped){
        const effHp=Math.round(equipped.hp+(up.hull||0));
        const effSpeed=Math.round(equipped.speed*(1+(up.thruster||0)*.04));
        const effDamage=(equipped.damage*(1+(up.weapon||0)*.035)).toFixed(2);
        const armor=Math.round((1-(equipped.armor||1)*Math.max(.72,1-(up.armor||0)*.05))*100);
        const cadence=Math.round((1-Math.max(.78,1-(up.firerate||0)*.03))*100);
        const drones=Math.max(1,Math.min(4,1+(up.dronebay||0)));
        UI.els.hangarLoadout.innerHTML=[['❤ '+effHp,'CASCO'],['⚡ '+effSpeed,'VELOCIDAD'],['✹ '+effDamage,'DAÑO'],['⬡ '+Math.max(0,armor)+'%','REDUCCIÓN'],['≋ +'+cadence+'%','CADENCIA'],['◇ '+drones,'DRONES']].map(([a,b])=>`<div class="hl"><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('');
      }
      const upgrades=(catalog||[]).filter(x=>x.type==='upgrade');
      if(UI.els.hangarUpgrades) UI.els.hangarUpgrades.innerHTML=upgrades.map(item=>{
        const cls=item.maxed?'maxed':item.affordable?'affordable':!item.levelOk?'locked':'unaffordable';
        const txt=item.maxed?'MAX':!item.levelOk?`NV${item.level}`:`◈${item.price}`;
        return `<button class="hangar-upgrade ${cls}" data-hangar-buy="${item.id}" ${item.affordable?'':'disabled'} title="${esc(item.desc)}"><span class="hu-icon">${esc(item.icon||'＋')}</span><span class="hu-name">${esc(item.label)}</span><span class="hu-level">${item.owned}/${item.max}</span><span class="hu-price">${txt}</span></button>`;
      }).join('');
    },
    renderRanking(items){
      UI.els.rankingList.innerHTML = items.length ? items.map((r,i)=>`<div class="list-item"><span>#${i+1} ${esc(r.name)}</span><span>${esc(r.score)} · S${esc(r.sector)}-O${esc(r.wave)}</span></div>`).join('') : '<div class="list-item"><span>Sin registros</span></div>';
    },
    renderLoadInfo(data){
      UI.els.loadInfo.innerHTML = data ? [`Piloto: ${data.player}`, `Sector ${data.sector} · Oleada ${data.wave}`, `Puntaje: ${data.score}`, `Vidas: ${data.lives}`, `Checkpoint: oleada ${data.checkpointWave}`].map(v=>`<div class="list-item"><span>${esc(v)}</span></div>`).join('') : '<div class="list-item"><span>No existe partida guardada</span></div>';
    },
    renderEconomy(profile){
      if(!profile) return;
      if(UI.els.hudEconomy) UI.els.hudEconomy.textContent=`NV ${profile.level} · ◈ ${profile.coins} · ↻${profile.inventory?.revive||0}`;
    },
    renderShop(profile,catalog,inGame=false){
      if(!profile) return;
      UI.renderEconomy(profile);
      if(UI.els.shopBalance) UI.els.shopBalance.innerHTML=`<span>NIVEL ${esc(profile.level)}</span><span>XP ${esc(profile.xpIntoLevel)}/${esc(profile.xpToNext)}</span><span>◈ ${esc(profile.coins)} MONEDAS</span><span>MEJOR RACHA x${esc(profile.bestStreak||0)}</span>`;
      const bp=Object.keys(profile.bossPowers||{});
      if(UI.els.shopBossPowers) UI.els.shopBossPowers.textContent=bp.length?`PODERES DE JEFE HEREDADOS: ${bp.map(k=>NS.config.powers[k]?.label||k).join(' · ')}`:'PODERES DE JEFE HEREDADOS: derrota al primer jefe para desbloquearlos.';
      if(UI.els.shopGrid) UI.els.shopGrid.innerHTML=(catalog||[]).map(item=>{
        const cls=item.maxed?'maxed':item.affordable?'affordable':!item.levelOk?'locked':'unaffordable';
        const lock=!item.levelOk?`<span class="shop-lock">NV ${item.level}</span>`:item.maxed?'<span class="shop-lock">MÁX.</span>':'';
        const owned=item.type==='consumable'?`CARGAS ${item.owned}`:`MEJORA ${item.owned}/${item.max}`;
        const buyLabel=item.maxed?'MÁXIMO':!item.levelOk?`NV ${item.level}`:`COMPRAR ◈${item.price}`;
        const use=(item.type==='consumable'&&inGame&&NS.config.powers[item.kind])?`<button class="use-btn" data-use="${item.kind}" ${item.owned>0?'':'disabled'}>USAR ×${item.owned}</button>`:'';
        return `<div class="shop-item ${cls}">${lock}<div class="shop-item-top"><span class="shop-item-icon">${esc(item.icon||'✦')}</span><div><div class="shop-item-title">${esc(item.label)}</div><div class="shop-item-desc">${esc(item.desc)}</div></div></div><div class="shop-meta"><span class="shop-owned">${owned}</span><span class="shop-price">◈ ${item.price}</span></div><div class="shop-actions"><button data-buy="${item.id}" ${item.affordable?'':'disabled'}>${buyLabel}</button>${use}</div></div>`;
      }).join('');
    },
    renderTacticalBelt(profile,activePowers={},now=performance.now(),show=true){
      const belt=UI.els.tacticalBelt; if(!belt) return; belt.classList.toggle('active',!!show);
      const inv=profile?.inventory||{};
      belt.querySelectorAll('[data-quick-power]').forEach(btn=>{
        const kind=btn.dataset.quickPower, count=Math.max(0,Number(inv[kind])||0), badge=btn.querySelector('b');
        if(badge) badge.textContent=String(count);
        btn.disabled=!show||count<=0; btn.classList.toggle('available',count>0); btn.classList.toggle('active-power',(activePowers?.[kind]||0)>now);
        btn.setAttribute('aria-label',`${NS.config.powers[kind]?.label||kind}, ${count} cargas${(activePowers?.[kind]||0)>now?', activo':''}`);
      });
    },
    setFullscreenState(active,supported=true){
      if(!UI.els.fullscreenBtn) return; UI.els.fullscreenBtn.textContent=active?'[■]':'[ ]'; UI.els.fullscreenBtn.disabled=!supported; UI.els.fullscreenBtn.title=active?'Salir de pantalla completa':'Pantalla completa';
    },
    renderHud(state){
      UI.els.hudPilot.textContent = `${state.player} · ${state.ship.name}`;
      UI.els.hudStage.textContent = state.sectorName ? `MUNDO ${state.sector} · ${state.sectorName} · O${state.wave}${state.phaseName?` · ${state.phaseName}`:''}` : `SECTOR ${state.sector} · OLEADA ${state.wave}${state.phaseName?` · ${state.phaseName}`:''}`;
      UI.els.hudScore.textContent = `${state.score} pts`;
      if(state.economyProfile) UI.renderEconomy(state.economyProfile);
      if(UI.els.bossAllyBtn){ UI.els.bossAllyBtn.textContent=state.bossAllyText||'JEFE —'; UI.els.bossAllyBtn.disabled=!state.bossAllyReady; UI.els.bossAllyBtn.classList.toggle('ready',!!state.bossAllyReady); UI.els.bossAllyBtn.classList.toggle('active',!!state.bossAllyActive); UI.els.bossAllyBtn.style.setProperty('--charge',`${Math.round((state.bossAllyProgress||0)*100)}%`); }
      UI.renderTacticalBelt(state.economyProfile,state.activePowers||{},state.now||performance.now(),true);
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
      UI.els.hpFill.style.width = `${hpPct*100}%`; if(UI.els.hpBar) UI.els.hpBar.setAttribute('aria-valuenow',String(Math.round(hpPct*100)));
      UI.els.hudLives.innerHTML = Array.from({length: state.lives}, (_,i)=>`<span class="life-heart ${state.hp<=Math.max(2,Math.ceil(state.maxHp*.25)) && i===state.lives-1?'low':''}">❤</span>`).join('');
    },
    renderPause(state){
      const show = state.paused && !state.gameOver && !state.lifeLost; const was=UI.els.pauseOverlay.style.display==='flex';
      UI.els.pauseOverlay.style.display = show ? 'flex' : 'none'; UI.els.pauseOverlay.setAttribute('aria-hidden',show?'false':'true'); if(show&&!was) setTimeout(()=>document.getElementById('resumeBtn')?.focus(),0);
      UI.els.pauseStats.innerHTML = `Piloto: <strong>${esc(state.player)}</strong><br>Sector ${esc(state.sector)} · Oleada ${esc(state.wave)}<br>Puntaje: ${esc(state.score)}<br>Vidas: ${esc(state.lives)} · Vida: ${esc(Math.max(0,Math.round(state.hp*10)/10))}/${esc(state.maxHp)}<br>Racha: x${esc(state.combo||0)}`;
    },
    renderGameOver(state, show){
      const was=UI.els.gameOverOverlay.style.display==='flex'; UI.els.gameOverOverlay.style.display = show ? 'flex' : 'none'; UI.els.gameOverOverlay.setAttribute('aria-hidden',show?'false':'true'); if(show&&!was) setTimeout(()=>document.getElementById('restartCheckpointBtn')?.focus(),0);
      if(show){
        UI.els.gameOverStats.innerHTML = `Piloto: <strong>${esc(state.player)}</strong><br>Sector ${esc(state.sector)} · Oleada ${esc(state.wave)}<br>Puntaje: ${esc(state.score)}<br>Checkpoint: oleada ${esc(state.checkpointWave)}`;
      }
    }
  };
  NS.ui = UI;
})(window.SF);
