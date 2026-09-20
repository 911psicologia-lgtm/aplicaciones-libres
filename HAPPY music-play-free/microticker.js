// MP_SMART_MICROTICKER · R10.34 — Decorative: EQ + emoji every 4s across bar
(() => {
'use strict';
const M=Object.freeze({off:'off',discreet:'discreet',dynamic:'dynamic'}),D=M.discreet;
const EMOJIS=['💃','🕺','🎶','🎵','✨','🔥','🥁','🎷','🎸','🎹'];
const R=(()=>{
  let el,eq,ct,dc,timer=null,idx=0,last='idle',rm=false;
  function init(){
    el=document.getElementById('mpMicroTicker');if(!el)return false;
    eq=el.querySelector('.mt-eq');ct=el.querySelector('.mt-cat');dc=el.querySelector('.mt-dance');
    rm=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches||false;return true;
  }
  function setEq(s){
    last=s;if(!eq)return;eq.classList.remove('playing','paused','idle');void eq.offsetWidth;eq.classList.add(s);
    if(!rm)eq.querySelectorAll('i').forEach(b=>{b.style.animation='none';void b.offsetWidth;b.style.animation='';});
    // R10.34 · Emoji every 4s when playing, across the bar
    if(dc){
      if(s==='playing'&&!rm){
        if(timer)clearInterval(timer);show();timer=setInterval(show,4000);
      }else{if(timer){clearInterval(timer);timer=null;}dc.style.opacity='0';dc.classList.remove('dancing');}
    }
  }
  function show(){
    if(last!=='playing')return;
    dc.textContent=EMOJIS[idx%EMOJIS.length];idx++;
    dc.style.opacity='1';dc.classList.add('dancing');
    setTimeout(()=>{dc.style.opacity='0';dc.classList.remove('dancing');},2500);
  }
  function setCat(c){if(!ct)return;ct.textContent=c||'';ct.style.opacity=c?'0.9':'0';}
  return{init,setEq,setCat};
})();
const C=(()=>{
  let ini=false,t=null,mode=D;
  function setMode(m){mode=m;const e=document.getElementById('mpMicroTicker');if(e)e.classList.toggle('mt-off',m===M.off);if(m===M.off){stop();R.setCat('');}else start();}
  function getMode(){return mode;}
  function start(){stop();if(mode===M.off)return;t=setInterval(check,800);}
  function stop(){if(t){clearInterval(t);t=null;}}
  function check(){
    const mp=window.MP;if(!mp?.state)return;const st=mp.state;
    // R10.34 · Check radio state directly, not just MP.state
    const radio=window.MP_LIVE_RADIO;
    const ra=radio?.isActive?.();
    const radioPlaying=ra&&(radio.state?.status==='playing');
    const radioPaused=ra&&(radio.state?.status==='paused'||radio.state?.status==='connecting'||radio.state?.status==='retrying');
    const hc=st.currentId||ra;
    // EQ state: playing if either MP or radio is playing
    const eqState=(st.playing||radioPlaying)?'playing':(hc||radioPaused?'paused':'idle');
    R.setEq(eqState);
    // Category
    let cat='';
    if(ra)cat='RADIO LIVE';else if(st.currentEngine==='youtube')cat='YOUTUBE';else if(st.currentId)cat='AHORA SUENA';else cat='MUSIC PLAY';
    R.setCat(cat);
  }
  function event(cat,txt,ttl){R.setCat(cat);setTimeout(()=>{check();},ttl||2000);}
  function init(){if(ini)return;if(!R.init()){setTimeout(init,500);return;}ini=true;let sm=D;try{sm=localStorage.getItem('mp-ticker-mode')||D;}catch{}setMode(sm);const mp=window.MP;if(mp?.state)R.setEq(mp.state.playing?'playing':'idle');}
  return{init,setMode,getMode,event};
})();
window.MP_SMART_MICROTICKER=Object.freeze({init:C.init,setMode:C.setMode,getMode:C.getMode,event:C.event,modes:M});
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{const t=()=>{if(window.MP?.state)C.init();else setTimeout(t,100);};t();});}
else{const t=()=>{if(window.MP?.state)C.init();else setTimeout(t,100);};t();}
})();
