
window.SF = window.SF || {};
SF.UI = class {
  constructor(game){
    this.game=game;this.game.setUI(this);
    this.screens=[...document.querySelectorAll('.screen')];
    this.hud=document.getElementById('hud');
    this.hudLeft=document.getElementById('hudLeft');
    this.hudCenter=document.getElementById('hudCenter');
    this.hudRight=document.getElementById('hudRight');
    this.centerMsg=document.getElementById('centerMsg');
    this.controlsTag=document.getElementById('controlsTag');
    this.pauseBtn=document.getElementById('pauseBtn');
    this.pauseOverlay=document.getElementById('pauseOverlay');
    this.pauseStats=document.getElementById('pauseStats');
    this.msgTimer=null;
    this.bind();
    this.refreshRanking();
    this.refreshHangar();
    this.refreshSavePreview();
    this.refreshLoadInfo();
  }

  bind(){
    document.getElementById('newGameBtn').onclick=()=>{SF.Audio.unlock();this.showScreen('login');};
    document.getElementById('continueBtn').onclick=()=>{
      SF.Audio.unlock();
      if(SF.Storage.loadGame())this.game.start({fromSave:true});
      else this.showScreen('load');
    };
    document.getElementById('hangarBtn').onclick=()=>this.showScreen('hangar');
    document.getElementById('rankingBtn').onclick=()=>this.showScreen('ranking');
    document.getElementById('launchBtn').onclick=()=>{
      const name=document.getElementById('pilotName').value.trim()||'PILOTO';
      this.game.start({player:name,fromSave:false});
    };
    document.getElementById('pilotName').addEventListener('keydown',e=>{
      if(e.key==='Enter')document.getElementById('launchBtn').click();
    });
    document.getElementById('resumeSaveBtn').onclick=()=>{
      if(SF.Storage.loadGame())this.game.start({fromSave:true});
      else this.message('NO HAY GUARDADO',700);
    };
    document.getElementById('deleteSaveBtn').onclick=()=>{SF.Storage.deleteGame();this.refreshSavePreview();this.refreshLoadInfo();};
    document.getElementById('clearRankingBtn').onclick=()=>{SF.Storage.clearRank();this.refreshRanking();this.refreshHangar();};
    document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>this.showScreen(b.dataset.back));
    this.pauseBtn.onclick=()=>this.game.togglePause();
    document.getElementById('resumeBtn').onclick=()=>this.game.togglePause();
    document.getElementById('exitBtn').onclick=()=>{
      this.game.save();this.game.mode='menu';this.game.paused=false;this.setPause(false,this.game);this.showScreen('splash');
    };
    document.getElementById('splash').addEventListener('pointerdown',()=>SF.Audio.unlock(),{once:true});
  }

  showScreen(id){
    this.screens.forEach(s=>s.classList.toggle('active',s.id===id));
    this.hud.style.display='none';
    this.controlsTag.style.display='none';
    this.pauseBtn.style.display='none';
    this.pauseOverlay.classList.remove('on');
    if(id==='ranking')this.refreshRanking();
    if(id==='hangar')this.refreshHangar();
    if(id==='load')this.refreshLoadInfo();
    if(id==='splash')this.refreshSavePreview();
  }

  showGame(){
    this.screens.forEach(s=>s.classList.remove('active'));
    this.hud.style.display='flex';
    this.controlsTag.style.display='block';
    this.pauseBtn.style.display='block';
    this.pauseOverlay.classList.remove('on');
  }

  updateHud(l,c,r){this.hudLeft.textContent=l;this.hudCenter.textContent=c;this.hudRight.textContent=r;}

  message(txt,ms=900){
    clearTimeout(this.msgTimer);
    if(!txt){this.centerMsg.style.display='none';return;}
    this.centerMsg.textContent=txt;this.centerMsg.style.display='block';
    if(ms>0)this.msgTimer=setTimeout(()=>this.centerMsg.style.display='none',ms);
  }

  setPause(on,game){
    this.pauseOverlay.classList.toggle('on',on);
    this.pauseBtn.textContent=on?'REANUDAR':'PAUSA';
    if(on){
      this.pauseStats.innerHTML=`Piloto: ${game.playerName}<br>Nave: ${game.ship?.name||game.shipId}<br>Sector: ${game.wave}<br>Puntos: ${Math.floor(game.score)}<br>Vidas: ${game.lives}`;
    }
  }

  refreshSavePreview(){
    const box=document.getElementById('savePreview'),s=SF.Storage.loadGame();
    const btn=document.getElementById('continueBtn');
    btn.disabled=!s;
    if(!s){box.style.display='none';return;}
    box.style.display='block';
    box.textContent=`GUARDADO · ${s.player} · Sector ${s.wave} · ${s.score} pts · ${s.lives} vidas`;
  }

  refreshLoadInfo(){
    const box=document.getElementById('loadInfo'),s=SF.Storage.loadGame();
    box.innerHTML=s?`
      <div class="rank-row"><span>Piloto</span><strong>${s.player}</strong></div>
      <div class="rank-row"><span>Sector</span><strong>${s.wave}</strong></div>
      <div class="rank-row"><span>Puntos</span><strong>${s.score}</strong></div>
      <div class="rank-row"><span>Vidas</span><strong>${s.lives}</strong></div>
    `:`<div class="rank-row"><span>No hay partida guardada</span><strong>—</strong></div>`;
    document.getElementById('resumeSaveBtn').disabled=!s;
  }

  refreshRanking(){
    const box=document.getElementById('rankingList'),arr=SF.Storage.getRank();
    box.innerHTML=arr.length?arr.map((r,i)=>`<div class="rank-row"><span>${i+1}. ${this.escape(r.name)}</span><strong>${r.score} · N${r.wave}</strong></div>`).join('')
      :'<div class="rank-row"><span>SIN REGISTROS</span><strong>—</strong></div>';
  }

  refreshHangar(){
    const box=document.getElementById('shipGrid'),best=SF.Storage.bestScore(),selected=SF.Storage.getShip();
    box.innerHTML=SF.Config.ships.map(s=>{
      const ok=best>=s.unlock;
      const img=SF.Assets.manifest[s.asset];
      return `<article class="ship-card ${ok?'':'locked'}">
        <img src="${img}" alt="${s.name}">
        <div>
          <h3>${s.name}</h3>
          <p>${s.desc}<br>VEL ${Math.round(s.speed*100)} · CD ${s.fireCd} ms · HP ${s.hp}</p>
        </div>
        <button data-ship="${s.id}" ${ok?'':'disabled'}>${ok?(selected===s.id?'✓ EQUIPADA':'ELEGIR'):`REQ. ${s.unlock} PTS`}</button>
      </article>`;
    }).join('');
    box.querySelectorAll('[data-ship]').forEach(btn=>btn.onclick=()=>{SF.Storage.setShip(btn.dataset.ship);this.refreshHangar();});
  }

  escape(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
};
