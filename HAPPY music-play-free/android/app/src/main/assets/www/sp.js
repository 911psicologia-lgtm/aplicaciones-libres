/* ============================================================
   R10.14 · SP · ESTUDIO PODCAST
   Módulo ADITIVO de MUSIC PLAY · HAPPY. No reemplaza nada:
   - Se comunica con la app por el puente window.MP (app.js).
   - Audio y proyectos viven en SU PROPIA IndexedDB (mpf-sp-studio),
     sin tocar mpf-minimal-db ni DB_VERSION.
   - Los episodios publicados se integran con el reproductor y los
     podcasts existentes de HAPPY (playlists contentType:'podcast').
   ============================================================ */
(() => {
'use strict';

const MP = window.MP;
if(!MP){ console.error('[SP] puente window.MP no disponible; el módulo podcast no se activa'); return; }
const { state, db, els, toast, openSheet, closeDialog, showLoader, hideLoader, formatTime,
        safeText, now, sleep, remoteHash, safeFileName, normalizeTrack, normalizePlaylist,
        persistPlaylist, persistPrefs, saveTrackAndSource, createPlaylist, addTrackToPlaylist,
        getTrackFile, playTrack, showView, render, renderHome } = MP;

/* ============================================================
   1) BASE DE DATOS PROPIA DE SP  (audio blobs + proyectos)
   ============================================================ */
const SP_DB = 'mpf-sp-studio';
const SP_VER = 1;
let spdb = null, spdbFailed = false;
function openSPDB(){
  if(spdb || spdbFailed) return Promise.resolve(spdb);
  return new Promise(resolve=>{
    if(!('indexedDB' in window)){ spdbFailed=true; return resolve(null); }
    let req;
    try{ req = indexedDB.open(SP_DB, SP_VER); }catch{ spdbFailed=true; return resolve(null); }
    req.onupgradeneeded = () => {
      const d = req.result;
      if(!d.objectStoreNames.contains('projects')) d.createObjectStore('projects',{keyPath:'id'});
      if(!d.objectStoreNames.contains('audio')) d.createObjectStore('audio',{keyPath:'id'});
    };
    req.onsuccess = ()=>{ spdb = req.result; resolve(spdb); };
    req.onerror = ()=>{ spdbFailed=true; resolve(null); };
  });
}
function spReq(req){ return new Promise((res,rej)=>{ req.onsuccess=()=>res(req.result); req.onerror=()=>rej(req.error); }); }
async function spPut(store,val){ const d=await openSPDB(); if(!d) return false; try{ await spReq(d.transaction(store,'readwrite').objectStore(store).put(val)); return true; }catch{ return false; } }
async function spGet(store,key){ const d=await openSPDB(); if(!d) return null; try{ return await spReq(d.transaction(store).objectStore(store).get(key)); }catch{ return null; } }
async function spDelete(store,key){ const d=await openSPDB(); if(!d) return; try{ await spReq(d.transaction(store,'readwrite').objectStore(store).delete(key)); }catch{} }
async function spGetAll(store){ const d=await openSPDB(); if(!d) return []; try{ return await spReq(d.transaction(store).objectStore(store).getAll()); }catch{ return []; } }

/* ============================================================
   2) MODELO DE DATOS  (adaptado a la arquitectura real de HAPPY)
   ============================================================ */
const SP_STATUS = Object.freeze({
  draft:{label:'Borrador',cls:''}, recording:{label:'Grabando',cls:'st-recording'},
  editing:{label:'En edición',cls:'st-editing'}, finished:{label:'Terminado',cls:'st-finished'},
  published:{label:'Publicado',cls:'st-published'}
});
const uid = p => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
function newProject({title, showName='', episodeNumber=0, description='', cover=''}){
  const ts = now();
  return {
    id: uid('sp'), title:(title||'Episodio sin título').trim().slice(0,90),
    description:(description||'').slice(0,600), cover:cover||'', showName:(showName||'').trim().slice(0,60),
    season:1, episodeNumber:Number(episodeNumber)||0,
    status:'draft', script:'',
    createdAt:ts, updatedAt:ts,
    blocks:[],                 // {id,title,type:'voice'|'silence'|'sound',audioId,in,out,duration,volume,fadeIn,fadeOut,versions:[{audioId,at}],note}
    markers:[],                // {id,time,label}
    backgroundMusic:[],        // {id,trackId,title,sourceStart,sourceEnd,timelineStart,duration,volume,fadeIn,fadeOut,ducking}
    originalRecording:'', finalAudio:'',
    publishedTrackId:'', publishedPlaylistId:'',
    publication:{happy:false,externalLinks:{},publishedAt:0},
    rss:{rssEnabled:false,guid:'',episodeUrl:'',publicationDate:'',author:'',category:'',season:1,episodeNumber:1,description:'',cover:''},
    playbackProgress:0, spVersion:1
  };
}
function normalizeProject(p){
  const base=newProject({title:p.title, showName:p.showName, episodeNumber:p.episodeNumber, description:p.description, cover:p.cover});
  const out={...base,...p};
  out.blocks=Array.isArray(p.blocks)?p.blocks.map(b=>({versions:[],volume:1,fadeIn:0,fadeOut:0,in:0,out:Number(b.duration)||0,duration:Number(b.duration)||0,type:'voice',note:'',...b})):[];
  out.markers=Array.isArray(p.markers)?p.markers.slice(0,80):[];
  out.backgroundMusic=Array.isArray(p.backgroundMusic)?p.backgroundMusic.map(m=>({ducking:true,volume:.15,fadeIn:1,fadeOut:2,sourceStart:0,sourceEnd:30,timelineStart:0,duration:30,...m})).map(m=>({...m,duration:Math.max(.5,m.sourceEnd-m.sourceStart)})):[];
  out.publication={happy:false,externalLinks:{},publishedAt:0,...(p.publication||{})};
  out.rss={rssEnabled:false,guid:'',episodeUrl:'',publicationDate:'',author:'',category:'',season:1,episodeNumber:1,description:'',cover:'',...(p.rss||{})};
  if(!SP_STATUS[out.status]) out.status='draft';
  return out;
}
function projectDuration(p){ return p.blocks.reduce((a,b)=>a+blockDuration(b),0); }
function blockDuration(b){ return b.type==='silence' ? (Number(b.duration)||0) : Math.max(0,(Number(b.out)||0)-(Number(b.in)||0)); }
function recomputeStarts(p){ let t=0; for(const b of p.blocks){ b.start=t; t+=blockDuration(b); } return t; }

/* ============================================================
   3) ESTADO DEL MÓDULO
   ============================================================ */
const S = {
  ready:false, projects:[], view:'home', tab:'en-curso', projectId:'',
  scriptSaveTimer:0, saveTimers:new Map(), rendering:false,
  rec:{ state:'idle', stream:null, mr:null, chunks:[], mime:'', startAt:0, accumulated:0, timerRaf:0, meterRaf:0, ctx:null, analyser:null, src:null, targetBlockId:'', targetLabel:'' },
  preview:{ audio:null, url:'', blockId:'', mixId:'' },
  undo:[], redo:[],
  spAudioCache:new Map()   // audioId → AudioBuffer (limitado)
};

/* ============================================================
   4) PERSISTENCIA DE PROYECTOS
   ============================================================ */
async function loadProjects(){
  const rows=await spGetAll('projects');
  S.projects=rows.map(normalizeProject).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  S.ready=true;
}
function scheduleSave(projectId){
  clearTimeout(S.saveTimers.get(projectId));
  S.saveTimers.set(projectId,setTimeout(()=>saveProjectNow(projectId),500));
}
async function saveProjectNow(projectId){
  const p=S.projects.find(x=>x.id===projectId); if(!p) return;
  p.updatedAt=now();
  await spPut('projects',JSON.parse(JSON.stringify(p)));
}
function pushUndo(){
  const p=activeProject(); if(!p) return;
  S.undo.push(JSON.stringify({id:p.id,blocks:p.blocks,markers:p.markers,backgroundMusic:p.backgroundMusic,status:p.status,title:p.title}));
  if(S.undo.length>25)S.undo.shift(); S.redo.length=0;
}
function applySnapshot(snap){
  const p=activeProject(); if(!p) return;
  const d=JSON.parse(snap); if(d.id!==p.id) return;
  p.blocks=d.blocks; p.markers=d.markers; p.backgroundMusic=d.backgroundMusic; p.status=d.status; p.title=d.title;
  scheduleSave(p.id); refresh();
}
function undo(){ const p=activeProject(); if(!p||!S.undo.length)return toast('Nada que deshacer'); S.redo.push(JSON.stringify({id:p.id,blocks:p.blocks,markers:p.markers,backgroundMusic:p.backgroundMusic,status:p.status,title:p.title})); applySnapshot(S.undo.pop()); }
function redo(){ const p=activeProject(); if(!p||!S.redo.length)return toast('Nada que rehacer'); S.undo.push(JSON.stringify({id:p.id,blocks:p.blocks,markers:p.markers,backgroundMusic:p.backgroundMusic,status:p.status,title:p.title})); applySnapshot(S.redo.pop()); }

/* ============================================================
   5) ALMACÉN DE AUDIO DE SP (blobs) + utilidades Web Audio
   ============================================================ */
async function saveAudioBlob(blob,dur,preId=''){
  const id=preId||uid('aud');
  await spPut('audio',{id,blob,mime:blob.type||'audio/webm',dur:Number(dur)||0,createdAt:now()});
  return id;
}
async function getAudioBlob(id){ if(!id)return null; const row=await spGet('audio',id); return row?.blob||null; }
async function deleteAudioBlob(id){ if(!id)return; await spDelete('audio',id); S.spAudioCache.delete(id); }
let AC=null;
function audioCtx(){ if(!AC){ const C=window.AudioContext||window.webkitAudioContext; AC=new C(); } if(AC.state==='suspended')AC.resume().catch(()=>{}); return AC; }
async function decodeBlob(blob){
  const buf=await blob.arrayBuffer();
  return await audioCtx().decodeAudioData(buf);
}
async function getAudioBuffer(id){
  if(S.spAudioCache.has(id))return S.spAudioCache.get(id);
  const blob=await getAudioBlob(id); if(!blob)return null;
  try{
    const buf=await decodeBlob(blob);
    if(S.spAudioCache.size>24)S.spAudioCache.delete(S.spAudioCache.keys().next().value);
    S.spAudioCache.set(id,buf); return buf;
  }catch{ return null; }
}
async function blobDuration(blob){
  try{ const buf=await decodeBlob(blob); return buf.duration; }catch{ return 0; }
}
/* WAV 16-bit PCM desde AudioBuffer (para exportar/publicar/previsualizar) */
function bufferToWav(buffer){
  const numCh=Math.min(2,buffer.numberOfChannels), sr=buffer.sampleRate, len=buffer.length;
  const bytes=44+len*numCh*2, ab=new ArrayBuffer(bytes), view=new DataView(ab);
  const wStr=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));};
  wStr(0,'RIFF'); view.setUint32(4,bytes-8,true); wStr(8,'WAVE'); wStr(12,'fmt ');
  view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,numCh,true);
  view.setUint32(24,sr,true); view.setUint32(28,sr*numCh*2,true); view.setUint16(32,numCh*2,true); view.setUint16(34,16,true);
  wStr(36,'data'); view.setUint32(40,len*numCh*2,true);
  const chans=[]; for(let c=0;c<numCh;c++)chans.push(buffer.getChannelData(c));
  let off=44;
  for(let i=0;i<len;i++)for(let c=0;c<numCh;c++){ let v=Math.max(-1,Math.min(1,chans[c][i])); view.setInt16(off,v<0?v*0x8000:v*0x7FFF,true); off+=2; }
  return new Blob([ab],{type:'audio/wav'});
}
function spDownloadBlob(blob,filename){
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
}

/* ============================================================
   6) BIBLIOTECA DE SONIDOS DE SP (generados, libres de copyright)
   Metadatos según especificación; los WAV se sintetizan bajo
   demanda y quedan cacheados en la IndexedDB de SP.
   Estructura preparada para assets propios: /assets/podcast/
   (intro · transition · outro · effects) en una fase siguiente.
   ============================================================ */
const SOUND_CATEGORIES = ['ACADÉMICO / REFLEXIÓN','EDUCACIÓN','PSICOLOGÍA / BIENESTAR','CONVERSACIÓN','HISTORIA / DOCUMENTAL','CIENCIA / TECNOLOGÍA','CULTURA LATINOAMERICANA','NATURALEZA','MISTERIO','ACTUALIDAD / NOTICIAS'];
const SOUND_TYPES = {intro:'INTRO',transition:'TRANSICIÓN',interlude:'INTERMEDIO',outro:'CIERRE',effect:'EFECTO'};
function buildSoundDefs(){
  const defs=[]; const catIdx=c=>SOUND_CATEGORIES.indexOf(c);
  // Dos paletas base por categoría (A/B) × tipos estándar → ids deterministas snd_<cat>_<ab>_<tipo>
  for(const cat of SOUND_CATEGORIES){
    for(const ab of ['a','b']){
      const seed=catIdx(cat)*2+(ab==='b'?1:0);
      defs.push({id:`snd_${catIdx(cat)}_${ab}_intro`,name:`Intro ${cat.split(' / ')[0]} ${ab.toUpperCase()}`,category:cat,type:'intro',seconds:3,file:`/assets/podcast/intro/sp-intro-${catIdx(cat)}${ab}.wav`,seed});
      defs.push({id:`snd_${catIdx(cat)}_${ab}_transition`,name:`Transición ${cat.split(' / ')[0]} ${ab.toUpperCase()}`,category:cat,type:'transition',seconds:1.6,file:`/assets/podcast/transition/sp-trans-${catIdx(cat)}${ab}.wav`,seed});
      defs.push({id:`snd_${catIdx(cat)}_${ab}_outro`,name:`Cierre ${cat.split(' / ')[0]} ${ab.toUpperCase()}`,category:cat,type:'outro',seconds:4,file:`/assets/podcast/outro/sp-outro-${catIdx(cat)}${ab}.wav`,seed});
      defs.push({id:`snd_${catIdx(cat)}_${ab}_effect`,name:`Efecto ${cat.split(' / ')[0]} ${ab.toUpperCase()}`,category:cat,type:'effect',seconds:.9,file:`/assets/podcast/effects/sp-fx-${catIdx(cat)}${ab}.wav`,seed});
    }
  }
  return defs;
}
const SOUND_LIBRARY = buildSoundDefs();
async function synthSoundWav(def){
  // Sonido sintetizado breve (1-6 s): suave, utilitario y 100% libre.
  const sr=44100, C=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const ctx=new C(2,Math.ceil(sr*def.seconds),sr);
  const base=196*Math.pow(2,(def.seed%7)/12);
  const g=ctx.createGain(); g.gain.value=.5; g.connect(ctx.destination);
  const tone=(freq,t0,dur,type='sine',vol=.4)=>{
    const o=ctx.createOscillator(),gg=ctx.createGain();
    o.type=type;o.frequency.value=freq;
    gg.gain.setValueAtTime(0,t0);gg.gain.linearRampToValueAtTime(vol,t0+.04);
    gg.gain.setValueAtTime(vol,t0+dur-.12);gg.gain.linearRampToValueAtTime(0,t0+dur);
    o.connect(gg).connect(g);o.start(t0);o.stop(t0+dur+.02);
  };
  if(def.type==='intro'){
    const o=ctx.createOscillator(),gg=ctx.createGain();o.type='sine';
    o.frequency.setValueAtTime(base*.6,0);o.frequency.exponentialRampToValueAtTime(base*2.2,def.seconds*.7);
    gg.gain.setValueAtTime(0,0);gg.gain.linearRampToValueAtTime(.22,def.seconds*.35);gg.gain.linearRampToValueAtTime(0,def.seconds);
    o.connect(gg).connect(g);o.start(0);o.stop(def.seconds);
    tone(base*2,def.seconds*.4,def.seconds*.55,'triangle',.3);tone(base*2.5,def.seconds*.55,def.seconds*.4,'sine',.22);
  }else if(def.type==='transition'){
    const len=ctx.sampleRate*def.seconds,buf=ctx.createBuffer(1,len,ctx.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/len,1.6);
    const src=ctx.createBufferSource();src.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(base*6,0);f.frequency.exponentialRampToValueAtTime(base*1.2,def.seconds);f.Q.value=1.4;
    src.connect(f).connect(g);src.start(0);
    tone(base*1.5,def.seconds*.55,def.seconds*.4,'sine',.18);
  }else if(def.type==='outro'){
    [1,5/4,3/2].forEach((r,i)=>tone(base*r,def.seconds*.15*i,def.seconds-(def.seconds*.15*i),'sine',.26-.06*i));
    tone(base/2,0,def.seconds,'sine',.14);
  }else{ // interlude / effect
    tone(base*2,0,.12,'square',.16);tone(base*2.66,.14,.14,'square',.14);
    if(def.type==='interlude')tone(base*3,.3,.5,'sine',.2);
  }
  const rendered=await ctx.startRendering();
  return bufferToWav(rendered);
}
async function getSoundBlob(def){
  const existing=await spGet('audio',def.id);
  if(existing?.blob)return existing.blob;
  const blob=await synthSoundWav(def);
  await spPut('audio',{id:def.id,blob,mime:'audio/wav',dur:def.seconds,createdAt:now()});
  return blob;
}

/* ============================================================
   7) PROYECTO ACTIVO
   ============================================================ */
function activeProject(){ return S.projects.find(p=>p.id===S.projectId)||null; }
function statusLabel(p){ return SP_STATUS[p.status]?.label||'Borrador'; }
/* ============================================================
   8) GRABADOR PRINCIPAL (MediaRecorder + nivel de micrófono)
   El permiso del micrófono se pide SOLO al pulsar GRABAR.
   ============================================================ */
function recElapsed(){
  const r=S.rec;
  if(r.state==='idle')return 0;
  return r.accumulated+(r.state==='recording'?(now()-r.startAt):0);
}
function pickRecMime(){
  const list=['audio/webm;codecs=opus','audio/webm','audio/mp4;codecs=mp4a.40.2','audio/mp4','audio/ogg;codecs=opus'];
  for(const m of list){ if(window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))return m; }
  return '';
}
async function recStart(targetBlockId='',targetLabel=''){
  const r=S.rec;
  if(r.state!=='idle')return;
  if(!window.MediaRecorder||!navigator.mediaDevices?.getUserMedia)return toast('Este navegador no permite grabar audio',4200);
  try{
    r.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  }catch(err){
    const name=err?.name||'';
    if(name==='NotAllowedError'||name==='SecurityError')toast('Permiso de micrófono rechazado. Actívalo en los ajustes del navegador para grabar.',5200);
    else if(name==='NotFoundError'||name==='OverconstrainedError')toast('No detectamos un micrófono conectado. Revisa tus dispositivos.',5200);
    else toast('El micrófono no está disponible en este momento',4200);
    return;
  }
  try{
    r.mime=pickRecMime();
    r.chunks=[];
    r.mr=new MediaRecorder(r.stream,r.mime?{mimeType:r.mime}:undefined);
    r.mr.ondataavailable=e=>{ if(e.data&&e.data.size)r.chunks.push(e.data); };
    r.mr.onstop=()=>onRecStopped();
    r.mr.start(1000);
  }catch{ toast('No se pudo iniciar la grabación',4200); r.stream?.getTracks().forEach(t=>t.stop()); r.stream=null; return; }
  // medidor de nivel
  try{
    r.ctx=audioCtx(); const src=r.ctx.createMediaStreamSource(r.stream);
    r.analyser=r.ctx.createAnalyser(); r.analyser.fftSize=512; src.connect(r.analyser); r.src=src;
  }catch{}
  r.accumulated=0; r.startAt=now(); r.state='recording'; r.targetBlockId=targetBlockId; r.targetLabel=targetLabel;
  const p=activeProject(); if(p&&p.status==='draft'){ p.status='recording'; scheduleSave(p.id); }
  startMeterLoop(); startTimerLoop(); refresh();
}
function recPause(){
  const r=S.rec; if(r.state!=='recording')return;
  try{ r.mr.pause(); }catch{}
  r.accumulated+=now()-r.startAt; r.state='paused'; stopMeterLoop(); refresh();
}
function recResume(){
  const r=S.rec; if(r.state!=='paused')return;
  try{ r.mr.resume(); }catch{}
  r.startAt=now(); r.state='recording'; startMeterLoop(); refresh();
}
function recStop(){
  const r=S.rec; if(r.state==='idle')return;
  if(r.state==='recording')r.accumulated+=now()-r.startAt;
  r.state='idle'; stopTimerLoop(); stopMeterLoop();
  try{ if(r.mr&&r.mr.state!=='inactive')r.mr.stop(); }catch{}
}
function recCancel(){
  const r=S.rec; if(r.state==='idle')return;
  r.state='idle'; stopTimerLoop(); stopMeterLoop();
  try{ if(r.mr&&r.mr.state!=='inactive'){ r.mr.onstop=null; r.mr.stop(); } }catch{}
  r.chunks=[]; r.stream?.getTracks().forEach(t=>t.stop()); r.stream=null; r.targetBlockId='';
  refresh();
}
async function onRecStopped(){
  const r=S.rec; r.stream?.getTracks().forEach(t=>t.stop()); r.stream=null;
  try{ r.src?.disconnect(); }catch{}
  const elapsed=r.accumulated/1000, chunks=r.chunks, mime=r.mime, target=r.targetBlockId, label=r.targetLabel;
  r.chunks=[]; r.targetBlockId=''; r.targetLabel='';
  if(!chunks.length){ refresh(); return; }
  const blob=new Blob(chunks,{type:mime||'audio/webm'});
  showLoader('Procesando tu voz…','Guardando la toma con seguridad');
  let dur=await blobDuration(blob);
  if(!dur)dur=elapsed;
  const audioId=await saveAudioBlob(blob,dur);
  const p=activeProject();
  if(p){
    pushUndo();
    if(target&&p.blocks.some(b=>b.id===target)){
      const b=p.blocks.find(x=>x.id===target);
      if(b.audioId)b.versions.push({audioId:b.audioId,at:now()});
      b.audioId=audioId; b.in=0; b.out=dur; b.duration=dur; b.type='voice';
    }else{
      const n=p.blocks.filter(b=>b.type==='voice').length;
      const title=label||(n===0?'INTRO':`BLOQUE ${n}`);
      p.blocks.push({id:uid('blk'),title,type:'voice',audioId,in:0,out:dur,duration:dur,volume:1,fadeIn:0,fadeOut:0,versions:[],note:'',start:0});
    }
    if(p.status==='recording')p.status='editing';
    recomputeStarts(p);
    await saveProjectNow(p.id);
  }
  hideLoader(); refresh();
  toast('Toma guardada ✓',2200);
}
function startTimerLoop(){
  cancelAnimationFrame(S.rec.timerRaf);
  const tick=()=>{
    const el=$('#spTimer'); if(el)el.textContent=spFmtClock(recElapsed());
    S.rec.timerRaf=requestAnimationFrame(tick);
  };
  S.rec.timerRaf=requestAnimationFrame(tick);
}
function stopTimerLoop(){ cancelAnimationFrame(S.rec.timerRaf); }
function startMeterLoop(){
  const r=S.rec;
  const tick=()=>{
    if(!r.analyser)return;
    const data=new Uint8Array(r.analyser.frequencyBinCount);
    r.analyser.getByteTimeDomainData(data);
    let peak=0; for(let i=0;i<data.length;i++){ const v=Math.abs(data[i]-128)/128; if(v>peak)peak=v; }
    const bar=$('#spMeterFill'); if(bar)bar.style.width=`${Math.min(100,Math.round(peak*160))}%`;
    r.meterRaf=requestAnimationFrame(tick);
  };
  r.meterRaf=requestAnimationFrame(tick);
}
function stopMeterLoop(){ cancelAnimationFrame(S.rec.meterRaf); const bar=$('#spMeterFill'); if(bar)bar.style.width='0%'; }
function spFmtClock(ms){
  const s=Math.floor(ms/1000);
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

/* ============================================================
   9) BLOQUES: marcadores, silencios, edición no destructiva
   ============================================================ */
function openMarkerSheet(){
  const p=activeProject(); if(!p)return;
  const t=recElapsed();
  openSheet(`<h2 class="sheet-title">＋ Marca</h2><p class="sheet-copy">Se guardará en el segundo ${spFmtClock(t)} de la grabación actual.</p>
  <label class="search-box" style="margin-bottom:10px"><span>✎</span><input id="spMarkInput" type="text" placeholder="Nombre de la marca (opcional)" maxlength="40"/></label>
  <div class="chips" style="margin-bottom:10px">${['Introducción','Tema 1','Ejemplo','Revisar','Error','Cierre'].map(l=>`<button class="chip" data-mark-suggest="${l}">${l}</button>`).join('')}</div>
  <div class="sheet-stack"><button class="sheet-btn" data-mark-save>✓ Guardar marca<small>${spFmtClock(t)} · aparecerá en la edición</small></button></div>`,root=>{
    const input=$('#spMarkInput',root);
    $$('[data-mark-suggest]',root).forEach(b=>b.onclick=()=>{input.value=b.dataset.markSuggest;});
    $('[data-mark-save]',root).onclick=()=>{
      p.markers.push({id:uid('mk'),time:t,label:(input.value||'Marca').slice(0,40)});
      scheduleSave(p.id); closeDialog(els.sheetDialog); toast('Marca guardada ✓'); refresh();
    };
    setTimeout(()=>input?.focus(),80);
  });
}
function openSilenceSheet(){
  const p=activeProject(); if(!p)return;
  openSheet(`<h2 class="sheet-title">＋ Espacio / silencio</h2><p class="sheet-copy">Se insertará al final de la línea de tiempo actual (puedes moverlo reordenando bloques en una fase siguiente).</p>
  <div class="sheet-stack">${[0.5,1,2,3].map(d=>`<button class="sheet-btn" data-sil="${d}">␣ ${d} segundo${d===1?'':'s'}</button>`).join('')}
  <button class="sheet-btn" data-sil-custom>⌨ Personalizado<small>Escribe los segundos exactos</small></button></div>`,root=>{
    $$('[data-sil]',root).forEach(b=>b.onclick=()=>{ addSilence(Number(b.dataset.sil)); closeDialog(els.sheetDialog); });
    $('[data-sil-custom]',root).onclick=()=>{
      openSheet(`<h2 class="sheet-title">Silencio personalizado</h2><label class="search-box"><span>␣</span><input id="spSilInput" type="number" min="0.1" max="60" step="0.1" placeholder="Segundos (ej. 4.5)"/></label><div class="sheet-stack"><button class="sheet-btn" data-sil-go>Insertar silencio</button></div>`,root2=>{
        $('[data-sil-go]',root2).onclick=()=>{ const v=Number($('#spSilInput',root2).value); if(v>0&&v<=60){ addSilence(Math.round(v*10)/10); closeDialog(els.sheetDialog); } else toast('Escribe un valor entre 0.1 y 60 segundos'); };
      });
    };
  });
}
function addSilence(dur){
  const p=activeProject(); if(!p)return;
  pushUndo();
  p.blocks.push({id:uid('blk'),title:`Espacio ${dur}s`,type:'silence',audioId:'',in:0,out:0,duration:dur,volume:1,fadeIn:0,fadeOut:0,versions:[],note:'',start:0});
  recomputeStarts(p); scheduleSave(p.id); refresh(); toast(`Espacio de ${dur}s añadido`);
}
function addSoundBlock(def){
  const p=activeProject(); if(!p)return;
  showLoader('Preparando sonido…','Un momento');
  getSoundBlob(def).then(async blob=>{
    const dur=def.seconds;
    const audioId=await saveAudioBlob(blob,dur,def.id); // reutiliza el mismo id (cache estable)
    pushUndo();
    p.blocks.push({id:uid('blk'),title:def.name,type:'sound',audioId:def.id,in:0,out:dur,duration:dur,volume:.9,fadeIn:def.type==='intro'?0:0.05,fadeOut:def.type==='outro'?1:0.15,versions:[],note:def.category,category:def.category,soundType:def.type,start:0});
    recomputeStarts(p); await saveProjectNow(p.id); hideLoader(); refresh(); toast('Sonido insertado ✓');
  }).catch(()=>{ hideLoader(); toast('No se pudo generar el sonido'); });
}
function splitBlockAt(blockId){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  const cur=S.preview.blockId===blockId?previewPos():0;
  const len=blockDuration(b), at=Math.max(.3,Math.min(len-.3,cur||len/2));
  pushUndo();
  const second={...b,id:uid('blk'),title:`${b.title} · B`,in:(Number(b.in)||0)+at,out:Number(b.out),duration:len-at,start:0,versions:[...b.versions]};
  b.out=(Number(b.in)||0)+at; b.duration=at; b.title=`${b.title.replace(/ · B$/,'')} · A`;
  p.blocks.splice(p.blocks.indexOf(b)+1,0,second);
  recomputeStarts(p); scheduleSave(p.id); refresh(); toast('Bloque dividido en dos ✓');
}
function trimBlockSheet(blockId){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  const len=blockDuration(b);
  openSheet(`<h2 class="sheet-title">✂ Cortar «${safeText(b.title)}»</h2>
  <p class="sheet-copy">El audio original nunca se destruye: ajustamos qué parte suena (podrás deshacer con ↶).</p>
  <div class="sheet-stack">
    <button class="sheet-btn" data-trim="start">✂ Recortar el inicio<small>Suelta ${spFmtClock((S.preview.blockId===blockId?previewPos():0)*1000)} del principio según la escucha actual</small></button>
    <button class="sheet-btn" data-trim="end">✂ Recortar el final<small>Corta justo donde está la escucha actual</small></button>
    <button class="sheet-btn" data-trim="reset">↺ Restaurar bloque completo</button>
  </div>
  <p class="sp-note">Duración actual: <b>${spFmtClock(len*1000)}</b> · Usa ▶ en el bloque y corta en el punto exacto.</p>`,root=>{
    $$('[data-trim]',root).forEach(btn=>btn.onclick=async()=>{
      const mode=btn.dataset.trim; const pos=S.preview.blockId===blockId?previewPos():0;
      pushUndo();
      if(mode==='reset'){ const buf=await getAudioBuffer(b.audioId); b.in=0; b.out=buf?buf.duration:(Number(b.duration)||blockDuration(b)); }
      else if(mode==='start'){ const ni=(Number(b.in)||0)+Math.max(.05,pos); if(ni>=b.out-.2){toast('La escucha está demasiado avanzada');return;} b.in=ni; }
      else { const no=(Number(b.in)||0)+Math.max(.2,pos); if(no<=b.in+.2){toast('Reproduce un poco antes de cortar');return;} b.out=no; }
      b.duration=blockDuration(b); recomputeStarts(p); scheduleSave(p.id); closeDialog(els.sheetDialog); refresh(); toast('Bloque recortado ✓ (no destructivo)');
    });
  });
}
function setBlockVolume(blockId,vol){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  b.volume=vol; scheduleSave(p.id); refresh();
}
function setBlockFade(blockId,which,val){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  if(which==='in')b.fadeIn=val; else b.fadeOut=val;
  scheduleSave(p.id); refresh();
}
function deleteBlock(blockId){
  const p=activeProject(); if(!p)return;
  pushUndo();
  p.blocks=p.blocks.filter(b=>b.id!==blockId);
  recomputeStarts(p); scheduleSave(p.id); refresh(); toast('Bloque eliminado · ↶ para deshacer');
}
function rerecordBlock(blockId){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  if(S.rec.state!=='idle')return toast('Ya hay una grabación en curso');
  openSheet(`<h2 class="sheet-title">⏺ Regrabar bloque</h2>
  <p class="sheet-copy">Volverás a grabar <b>«${safeText(b.title)}»</b>. La versión actual se conserva y puedes deshacerla con ↶ en cualquier momento.</p>
  <div class="sheet-stack"><button class="sheet-btn" data-go-rec>⏺ Empezar a regrabar este bloque</button><button class="sheet-btn" data-cancel>Cancelar</button></div>`,root=>{
    $('[data-go-rec]',root).onclick=()=>{ closeDialog(els.sheetDialog); recStart(b.id,b.title); toast('Grabando sobre el bloque · TERMINAR al acabar',3600); };
    $('[data-cancel]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}
function rerecordFrom(blockId){
  const p=activeProject(); const idx=p?.blocks.findIndex(x=>x.id===blockId); if(!p||idx<0)return;
  const b=p.blocks[idx], removed=p.blocks.slice(idx+1), removedDur=removed.reduce((a,x)=>a+blockDuration(x),0);
  openSheet(`<h2 class="sheet-title">⏺ Regrabar desde aquí</h2>
  <p class="sheet-copy">Se conserva <b>todo lo anterior</b> a «${safeText(b.title)}». Grabarás una toma nueva que continúa desde ese punto${removed.length?`; los ${removed.length} bloque(s) posteriores (${spFmtClock(removedDur*1000)}) salen de la línea (↶ para deshacer)`:''}.</p>
  <div class="sheet-stack"><button class="sheet-btn" data-go>⏺ Regrabar desde «${safeText(b.title)}»</button><button class="sheet-btn" data-cancel>Volver</button></div>`,root=>{
    $('[data-go]',root).onclick=()=>{ closeDialog(els.sheetDialog); pushUndo(); p.blocks=p.blocks.slice(0,idx+1); recomputeStarts(p); scheduleSave(p.id); refresh(); recStart('',b.title); toast('Graba la continuación · TERMINAR al acabar',3800); };
    $('[data-cancel]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}

/* ============================================================
   10) ESCUCHA (bloques sueltos + previsualización completa)
   ============================================================ */
let previewSrc=null;
function stopPreview(){
  try{ previewSrc?.stop(); }catch{}
  previewSrc=null; S.preview.blockId='';
}
function previewPos(){ return previewPosVal; }
let previewPosVal=0;
async function playBlock(blockId){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  if(S.preview.blockId===blockId&&previewSrc){ stopPreview(); refresh(); return; }
  stopPreview();
  if(b.type==='silence'){ toast(`Espacio de ${b.duration}s (sin audio)`); return; }
  const buf=await getAudioBuffer(b.audioId);
  if(!buf)return toast('Este audio no está disponible en este dispositivo');
  const ctx=audioCtx(), src=ctx.createBufferSource(), g=ctx.createGain();
  src.buffer=buf;
  const vol=Math.max(0,Math.min(2,Number(b.volume)||1)), d=blockDuration(b);
  const t=ctx.currentTime;
  if(b.fadeIn>0){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+b.fadeIn); } else g.gain.setValueAtTime(vol,t);
  if(b.fadeOut>0){ g.gain.setValueAtTime(vol,t+d-b.fadeOut); g.gain.linearRampToValueAtTime(0,t+d); }
  src.connect(g).connect(ctx.destination);
  const off=Math.max(0,Number(b.in)||0);
  previewPosVal=0; let t0=ctx.currentTime;
  const tick=()=>{ if(!previewSrc)return; previewPosVal=Math.max(0,ctx.currentTime-t0); requestAnimationFrame(tick); };
  src.onended=()=>{ if(previewSrc===src){previewSrc=null;S.preview.blockId='';previewPosVal=0;refresh();} };
  src.start(0,off,Math.min(d,buf.duration-off));
  previewSrc=src; S.preview.blockId=blockId; requestAnimationFrame(tick);
  refresh();
}
/* ============================================================
   11) MÚSICA DE FONDO desde la biblioteca de HAPPY
   Reutiliza state.tracks + getTrackFile (NO duplica biblioteca).
   ============================================================ */
async function openMusicPicker(){
  const p=activeProject(); if(!p)return;
  const tracks=state.tracks.filter(t=>t.sourceKind==='local'&&!t.sourceMissing);
  if(!tracks.length)return openSheet(`<h2 class="sheet-title">🎵 Música de fondo</h2><p class="sheet-copy">No hay canciones locales disponibles. La música de fondo se toma de <b>tu biblioteca local</b> de HAPPY (los enlaces de YouTube no pueden mezclarse por derechos técnicos del navegador). Importa un archivo de música desde Biblioteca y vuelve.</p>`,()=>{});
  const rows=tracks.slice(0,120).map(t=>`<button class="sheet-btn" data-pick-track="${safeText(t.id)}">♪ ${safeText(t.title)}<small>${safeText(t.artist||'')} ${t.duration?`· ${formatTime(t.duration)}`:''}</small></button>`).join('');
  openSheet(`<h2 class="sheet-title">🎵 Música de fondo</h2><p class="sheet-copy">Elige una pista de tu biblioteca de HAPPY. Después defines el fragmento, el volumen y si baja sola cuando hablas.</p><div class="sheet-stack">${rows||'<p class="sheet-copy">Sin canciones locales.</p>'}</div>`,root=>{
    $$('[data-pick-track]',root).forEach(b=>b.onclick=async()=>{
      const track=state.tracks.find(t=>t.id===b.dataset.pickTrack); closeDialog(els.sheetDialog);
      if(!track)return;
      const file=await getTrackFile(track);
      if(!file)return toast('Esta pista no está disponible en el dispositivo');
      openMusicConfig(track);
    });
  });
}
function openMusicConfig(track,{existing=null}={}){
  const p=activeProject(); if(!p)return;
  const dur=Math.max(1,Number(track.duration)||0);
  const cur=existing||{sourceStart:0,sourceEnd:Math.min(30,dur||30),volume:.15,fadeIn:1,fadeOut:2,ducking:true,anchor:''};
  const blockOpts=p.blocks.map((b,i)=>`<option value="${b.id}" ${String(cur.anchor||'')===String(b.id)?'selected':''}>${safeText(b.title)} · ${spFmtClock((b.start||0)*1000)}</option>`).join('');
  openSheet(`<h2 class="sheet-title">🎵 ${safeText(track.title)}</h2>
  <p class="sheet-copy">Fragmento de la canción · volumen bajo recomendado para que la voz destaque.</p>
  <div class="sp-sheet-grid">
    <label class="sp-note">Desde (s)<input id="spMusFrom" type="number" min="0" step="1" value="${Math.round(cur.sourceStart)}"/></label>
    <label class="sp-note">Hasta (s)<input id="spMusTo" type="number" min="1" step="1" value="${Math.round(cur.sourceEnd)}"/></label>
  </div>
  <div class="chips" style="margin:8px 0">${[.05,.1,.15,.2,.25,.3].map(v=>`<button class="chip ${Math.abs(cur.volume-v)<.001?'active':''}" data-mus-vol="${v}">${Math.round(v*100)}%</button>`).join('')}</div>
  <label class="sp-note" style="display:grid;gap:4px;margin:6px 0">Colocar al inicio de:
    <select id="spMusAnchor" style="padding:10px;border-radius:12px;background:var(--surface-2);border:1px solid var(--line);color:var(--text)">
      <option value="">El comienzo del episodio</option>${blockOpts}
    </select>
  </label>
  <label class="sp-note" style="display:flex;gap:8px;align-items:center;margin:10px 0"><input id="spMusDuck" type="checkbox" ${cur.ducking?'checked':''}/> <b>Bajar música cuando hablo</b> <span class="sp-kbd">ducking automático</span></label>
  <div class="sheet-stack"><button class="sheet-btn" data-mus-save>${existing?'✓ Guardar cambios':'＋ Añadir música al episodio'}</button>${existing?'<button class="sheet-btn" data-mus-del style="color:var(--accent)">🗑 Quitar música del episodio</button>':''}</div>`,root=>{
    let vol=cur.volume;
    $$('[data-mus-vol]',root).forEach(c=>c.onclick=()=>{ vol=Number(c.dataset.musVol); $$('[data-mus-vol]',root).forEach(x=>x.classList.remove('active')); c.classList.add('active'); });
    $('[data-mus-save]',root).onclick=()=>{
      const from=Math.max(0,Number($('#spMusFrom',root).value)||0), to=Math.max(from+2,Number($('#spMusTo',root).value)||from+30);
      const anchor=$('#spMusAnchor',root).value, duck=$('#spMusDuck',root).checked;
      const anchorBlock=p.blocks.find(b=>b.id===anchor);
      const timelineStart=anchorBlock?(anchorBlock.start||0):0;
      pushUndo();
      if(existing){
        Object.assign(existing,{sourceStart:from,sourceEnd:to,duration:to-from,volume:vol,fadeIn:cur.fadeIn,fadeOut:cur.fadeOut,ducking:duck,timelineStart});
      }else{
        p.backgroundMusic.push({id:uid('mus'),trackId:track.id,title:track.title,artist:track.artist||'',sourceStart:from,sourceEnd:to,duration:to-from,timelineStart,volume:vol,fadeIn:1,fadeOut:2,ducking:duck});
      }
      recomputeStarts(p); scheduleSave(p.id); closeDialog(els.sheetDialog); refresh(); toast(existing?'Música actualizada ✓':'Música añadida ✓');
    };
    const del=$('[data-mus-del]',root); if(del)del.onclick=()=>{ pushUndo(); p.backgroundMusic=p.backgroundMusic.filter(m=>m!==existing); scheduleSave(p.id); closeDialog(els.sheetDialog); refresh(); toast('Música quitada'); };
  });
}

/* ============================================================
   12) MEZCLA FINAL (OfflineAudioContext) con fades + ducking
   ============================================================ */
async function renderProjectMix(p,{onProgress=null}={}){
  const total=recomputeStarts(p);
  const musicEnd=p.backgroundMusic.reduce((a,m)=>Math.max(a,(m.timelineStart||0)+(m.duration||0)),0);
  const grand=Math.max(total,musicEnd);
  if(grand<=0)throw new Error('empty');
  const sr=44100;
  const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const ctx=new C(2,Math.ceil((grand+.3)*sr),sr);
  const decodeCache=new Map();
  const dec=async blob=>{ const k=blob; if(!decodeCache.has(k))decodeCache.set(k,await decodeBlob(blob)); return decodeCache.get(k); };
  // voz / silencios / sonidos — línea secuencial
  let t=0, done=0;
  for(const b of p.blocks){
    const d=blockDuration(b);
    if(onProgress&&done%2===0)onProgress(done/Math.max(1,p.blocks.length));
    done++;
    if(b.type==='silence'||d<=0){ t+=d; continue; }
    const buf=await getAudioBuffer(b.audioId);
    if(buf){
      const src=ctx.createBufferSource(); src.buffer=buf;
      const g=ctx.createGain(); const vol=Math.max(0,Math.min(2,Number(b.volume)||1));
      if(b.fadeIn>0){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+Math.min(b.fadeIn,d)); }
      else g.gain.setValueAtTime(vol,t);
      if(b.fadeOut>0){ const fs=Math.min(b.fadeOut,d); g.gain.setValueAtTime(vol,t+d-fs); g.gain.linearRampToValueAtTime(0,t+d); }
      src.connect(g).connect(ctx.destination);
      src.start(t,Math.max(0,Number(b.in)||0),Math.min(d,Math.max(.05,buf.duration-(Number(b.in)||0))));
    }
    t+=d;
  }
  // música de fondo con fades + ducking (envelope desde bloques de voz)
  for(const m of p.backgroundMusic){
    const track=state.tracks.find(x=>x.id===m.trackId);
    if(!track)continue;
    const file=await getTrackFile(track); if(!file)continue;
    let buf; try{ buf=await dec(file); }catch{ continue; }
    const src=ctx.createBufferSource(); src.buffer=buf;
    const g=ctx.createGain(); const base=Math.max(.02,Math.min(.5,Number(m.volume)||.15));
    const start=Math.max(0,Number(m.timelineStart)||0), len=Math.min(Number(m.duration)||0,buf.duration-(Number(m.sourceStart)||0));
    if(len<=0)continue;
    const end=start+len;
    if(m.fadeIn>0){ g.gain.setValueAtTime(0,start); g.gain.linearRampToValueAtTime(base,start+Math.min(m.fadeIn,len)); }
    else g.gain.setValueAtTime(base,start);
    if(m.fadeOut>0){ const fo=Math.min(m.fadeOut,len); g.gain.setValueAtTime(base,end-fo); g.gain.linearRampToValueAtTime(0,end); }
    else g.gain.setValueAtTime(base,end);
    if(m.ducking){
      // Envelope simple y robusto: en cada tramo con voz, baja a ~22% del nivel configurado.
      const DUCK=.22, EDGE=.35;
      const voiceSpans=p.blocks.filter(b=>b.type==='voice').map(b=>[b.start||0,blockDuration(b)]).filter(([a,b2])=>b2>0&&b2> a-0);
      let cursor=start;
      const spans=voiceSpans.map(([a,b2])=>[a,a+b2]).sort((x,y)=>x[0]-y[0]);
      const merged=[]; for(const sp of spans){ const last=merged[merged.length-1]; if(last&&sp[0]<=last[1]+EDGE)last[1]=Math.max(last[1],sp[1]); else merged.push([...sp]); }
      for(const [vs,ve] of merged){
        const ds=Math.max(cursor,vs-EDGE), de=Math.min(end,ve+EDGE);
        if(de<=ds)continue;
        if(ds>cursor)g.gain.setValueAtTime(base,cursor);
        g.gain.setValueAtTime(base,Math.max(start,ds-.2));
        g.gain.linearRampToValueAtTime(base*DUCK,Math.max(start+.05,ds));
        g.gain.setValueAtTime(base*DUCK,de);
        g.gain.linearRampToValueAtTime(base,Math.min(end,de+.6));
        cursor=Math.min(end,de+.6);
      }
    }
    src.connect(g).connect(ctx.destination);
    src.start(start,Math.max(0,Number(m.sourceStart)||0),len);
  }
  onProgress?.(1);
  return await ctx.startRendering();
}

/* ============================================================
   13) PREVISUALIZACIÓN COMPLETA
   ============================================================ */
let mixBusy=false;
async function openFullPreview(){
  const p=activeProject(); if(!p)return;
  if(mixBusy)return toast('Ya se está generando una escucha');
  if(!p.blocks.length)return toast('Graba o añade algo primero');
  stopPreview();
  mixBusy=true; showLoader('Generando la escucha completa…','Voz + espacios + sonidos + música'); 
  try{
    const mix=await renderProjectMix(p);
    const wav=bufferToWav(mix);
    const url=URL.createObjectURL(wav);
    hideLoader();
    openSheet(`<h2 class="sheet-title">▶ Escucha del episodio</h2>
    <p class="sheet-copy">«${safeText(p.title)}» · ${spFmtClock(mix.duration*1000)} min · voz + espacios + sonidos + música${p.backgroundMusic.length?' con ducking':''}. Las pistas fuente no se tocan.</p>
    <audio id="spPrevAudio" controls autoplay style="width:100%;margin:10px 0" src="${url}"></audio>
    <p class="sp-note">Esta previsualización es exactamente lo que exportarás. Cierra y edita lo que quieras: nada se guarda como definitivo hasta PUBLICAR o EXPORTAR.</p>`,root=>{
      const a=$('#spPrevAudio',root);
      const stop=()=>{ try{a.pause();}catch{} URL.revokeObjectURL(url); };
      $('.close-btn',els.sheetDialog)?.addEventListener('click',stop,{once:true});
    });
  }catch(err){
    hideLoader();
    toast(err.message==='empty'?'El episodio todavía está vacío':'No se pudo generar la escucha ahora',3600);
  }finally{ mixBusy=false; }
}

/* ============================================================
   14) TERMINAR EPISODIO (resumen → finished; nunca destruye)
   ============================================================ */
function openFinishSheet(){
  const p=activeProject(); if(!p)return;
  if(!p.blocks.length)return toast('Graba algo primero');
  const dur=projectDuration(p);
  openSheet(`<h2 class="sheet-title">Terminar episodio</h2>
  <div class="sp-note" style="display:grid;gap:4px;margin-bottom:10px">
    <span><b>Título:</b> ${safeText(p.title)}</span>
    <span><b>Duración:</b> ${formatTime(dur)}</span>
    <span><b>Serie:</b> ${safeText(p.showName||'—')}${p.episodeNumber?` · <b>Número:</b> ${p.episodeNumber}`:''}</span>
    <span><b>Descripción:</b> ${safeText(p.description||'—')}</span>
    <span><b>Bloques:</b> ${p.blocks.length} · <b>Marca(s):</b> ${p.markers.length} · <b>Música:</b> ${p.backgroundMusic.length}</span>
  </div>
  <p class="sheet-copy">Al terminar, el proyecto se guarda como <b>Terminado</b> y sigue editable. El proyecto original nunca se elimina.</p>
  <div class="sheet-stack">
    <button class="sheet-btn" data-fin-ok>✓ GUARDAR COMO TERMINADO</button>
    <button class="sheet-btn" data-fin-edit>↩ VOLVER A EDITAR</button>
  </div>`,root=>{
    $('[data-fin-ok]',root).onclick=async()=>{ p.status='finished'; await saveProjectNow(p.id); closeDialog(els.sheetDialog); S.view='home'; refresh(); toast('Episodio terminado ✓',3000); };
    $('[data-fin-edit]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}

/* ============================================================
   15) PUBLICAR EN HAPPY (reutiliza reproductor + podcasts reales)
   ============================================================ */
async function publishToHappy(p,{silent=false}={}){
  if(!p.blocks.length){ toast('El episodio está vacío'); return false; }
  showLoader('Preparando episodio final…','Mezclando voz, sonidos y música');
  try{
    const mix=await renderProjectMix(p);
    const wav=bufferToWav(mix);
    const fileName=safeFileName(`${p.showName? p.showName+' - ':''}${p.title}`)+'.wav';
    const file=new File([wav],fileName,{type:'audio/wav',lastModified:now()});
    const trackId=p.publishedTrackId||`sp_${p.id}`;
    let track=normalizeTrack({
      id:trackId, fileName, title:`${p.episodeNumber?`EP${String(p.episodeNumber).padStart(2,'0')} · `:''}${p.title}`,
      artist:p.showName||'SP · Estudio Podcast', album:p.showName||'SP · Estudio Podcast',
      genre:'Podcast', duration:mix.duration, size:file.size, type:'audio/wav',
      addedAt:now(), sourceKind:'local', mediaKind:'audio', spProjectId:p.id, spEpisode:true
    });
    track=await saveTrackAndSource(track,file);
    // portada opcional
    if(p.cover){ try{ const blob=await (await fetch(p.cover)).blob(); await db.put('covers',{id:trackId,blob}); track.hasCover=true; await db.put('tracks',track).catch(()=>{}); }catch{} }
    // playlist de podcast (una por serie) — contentType 'podcast' = integración completa
    const plName=p.showName||'Mi podcast';
    let pl=state.playlists.find(x=>x.contentType==='podcast'&&x.name===plName&&(!p.publishedPlaylistId||x.id===p.publishedPlaylistId));
    if(!pl&&p.publishedPlaylistId)pl=state.playlists.find(x=>x.id===p.publishedPlaylistId);
    if(!pl){
      const wasOpen=state.playlistDetailOpen;
      pl=await createPlaylist(plName,{contentType:'podcast',sources:[{id:`src_${remoteHash('sp:'+p.id)}`,source:'SP · Estudio Podcast',status:'imported',url:'',originalUrl:'',count:0,message:'Creado en el estudio',addedAt:now()}]});
      state.playlistDetailOpen=wasOpen; // no secuestrar la navegación actual
    }
    if(pl&&!pl.trackIds.includes(trackId))pl.trackIds.push(trackId);
    if(pl){ pl.updatedAt=now(); await persistPlaylist(pl); }
    p.publishedTrackId=trackId; p.publishedPlaylistId=pl?.id||'';
    p.status='published'; p.finalAudio=trackId;
    p.publication={...p.publication,happy:true,publishedAt:now()};
    p.rss={...p.rss,guid:p.rss.guid||trackId,publicationDate:p.rss.publicationDate||new Date().toISOString(),episodeNumber:p.rss.episodeNumber||p.episodeNumber||1,description:p.rss.description||p.description,cover:p.rss.cover||p.cover};
    await saveProjectNow(p.id);
    await persistPrefs(); render(); renderSPHome();
    hideLoader();
    if(!silent)toast('Publicado en HAPPY ✓ · mira la sección Podcasts',4200);
    return true;
  }catch(err){
    hideLoader();
    toast(err.message==='empty'?'El episodio está vacío':'No se pudo publicar ahora',3600);
    return false;
  }
}
function openPublishSheet(){
  const p=activeProject(); if(!p)return;
  const done=p.status==='finished'||p.status==='published';
  openSheet(`<h2 class="sheet-title">Publicar / Compartir</h2>
  <p class="sheet-copy">${done?'Tu episodio está listo para salir al mundo.':'Primero se genera la mezcla final (automático); después eliges destino.'}</p>
  <div class="sheet-stack">
    <button class="sheet-btn" data-pub-happy>🎙 PUBLICAR EN HAPPY<small>Aparece en Podcasts · Seguir escuchando · con progreso guardado</small></button>
    <button class="sheet-btn" data-exp-wav>⇩ EXPORTAR WAV<small>Calidad completa · para cualquier plataforma</small></button>
    <button class="sheet-btn" data-exp-mp3>⇩ EXPORTAR MP3<small>Compatible y ligero</small></button>
    <button class="sheet-btn" data-share-file>↗ COMPARTIR ARCHIVO<small>Enviar por apps del teléfono</small></button>
    <button class="sheet-btn" data-copy-link>🔗 COPIAR ENLACE DEL EPISODIO<small>Abre este episodio en tu HAPPY</small></button>
    <button class="sheet-btn" data-ext-open>🌐 Spotify for Creators · YouTube · Apple · iVoox · Spreaker<small>Abre cada plataforma para subir tu archivo</small></button>
  </div>`,root=>{
    $('[data-pub-happy]',root).onclick=async()=>{ closeDialog(els.sheetDialog); const ok=await publishToHappy(p); if(ok){ S.view='home'; refresh(); } };
    $('[data-exp-wav]',root).onclick=()=>{ closeDialog(els.sheetDialog); exportWav(p); };
    $('[data-exp-mp3]',root).onclick=()=>{ closeDialog(els.sheetDialog); exportMp3(p); };
    $('[data-share-file]',root).onclick=()=>{ closeDialog(els.sheetDialog); shareEpisodeFile(p); };
    $('[data-copy-link]',root).onclick=async()=>{ closeDialog(els.sheetDialog); const link=buildEpisodeLink(p); try{ await navigator.clipboard.writeText(link); toast('Enlace copiado ✓',2600); }catch{ openSheet(`<h2 class="sheet-title">Enlace del episodio</h2><p class="sp-note" style="word-break:break-all">${link}</p>`,()=>{}); } };
    $('[data-ext-open]',root).onclick=()=>{ closeDialog(els.sheetDialog); openExternalPlatforms(p); };
  });
}
function buildEpisodeLink(p){ const base=location.href.split('?')[0].split('#')[0]; return `${base}?view=studio#sp-${p.id}`; }
async function getFinalWavFile(p){
  const mix=await renderProjectMix(p);
  const wav=bufferToWav(mix);
  return new File([wav],safeFileName(`${p.showName?p.showName+' - ':''}${p.title}`)+'.wav',{type:'audio/wav',lastModified:now()});
}
async function exportWav(p){
  if(!p)return; if(!p.blocks.length)return toast('El episodio está vacío');
  showLoader('Exportando WAV…','Mezcla completa en calidad original');
  try{ const file=await getFinalWavFile(p); hideLoader(); spDownloadBlob(file,file.name); toast('WAV exportado ✓',3000); }
  catch{ hideLoader(); toast('No se pudo exportar ahora',3200); }
}
async function exportMp3(p){
  if(!p)return; if(!p.blocks.length)return toast('El episodio está vacío');
  showLoader('Exportando MP3…','Codificando con calidad 128 kbps');
  try{
    const mix=await renderProjectMix(p);
    await loadLameJs();
    if(!window.lamejs)throw new Error('nolame');
    const enc=new window.lamejs.Mp3Encoder(2,mix.sampleRate,128);
    const l=to16(mix.getChannelData(0)), r=mix.numberOfChannels>1?to16(mix.getChannelData(1)):l;
    const chunk=1152*10, data=[];
    for(let i=0;i<l.length;i+=chunk){
      const sub=enc.encodeBuffer(l.subarray(i,i+chunk),r.subarray(i,i+chunk));
      if(sub.length)data.push(new Int8Array(sub));
    }
    const end=enc.flush(); if(end.length)data.push(new Int8Array(end));
    const blob=new Blob(data,{type:'audio/mpeg'});
    const name=safeFileName(`${p.showName?p.showName+' - ':''}${p.title}`)+'.mp3';
    hideLoader(); spDownloadBlob(blob,name); toast('MP3 exportado ✓',3000);
  }catch(err){
    hideLoader();
    toast('MP3 no disponible sin conexión · exporté WAV (misma mezcla)',4200);
    exportWav(p);
  }
}
function to16(f32){
  const out=new Int16Array(f32.length);
  for(let i=0;i<f32.length;i++){ const v=Math.max(-1,Math.min(1,f32[i])); out[i]=v<0?v*0x8000:v*0x7FFF; }
  return out;
}
let lamePromise=null;
function loadLameJs(){
  if(window.lamejs)return Promise.resolve(true);
  if(lamePromise)return lamePromise;
  lamePromise=new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
    s.onload=()=>resolve(true); s.onerror=()=>reject(new Error('cdn'));
    document.head.appendChild(s); setTimeout(()=>reject(new Error('timeout')),12000);
  }).catch(()=>{ lamePromise=null; return false; });
  return lamePromise;
}
async function shareEpisodeFile(p){
  if(!p.blocks.length)return toast('El episodio está vacío');
  showLoader('Preparando archivo…','Un momento');
  try{
    const file=await getFinalWavFile(p); hideLoader();
    if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:p.title,text:`Episodio de podcast: ${p.title}`});
    else{ spDownloadBlob(file,file.name); toast('Tu navegador no comparte archivos · descargado ✓',3600); }
  }catch(err){ hideLoader(); if(err?.name!=='AbortError')toast('No se pudo compartir ahora',3000); }
}
function openExternalPlatforms(p){
  const links=[
    ['Spotify for Creators','https://creators.spotify.com/'],
    ['YouTube (Studio)','https://studio.youtube.com/'],
    ['Apple Podcasts Connect','https://podcastsconnect.apple.com/'],
    ['iVoox','https://www.ivoox.com/'],
    ['Spreaker','https://www.spreaker.com/create']
  ];
  openSheet(`<h2 class="sheet-title">🌐 Plataformas externas</h2>
  <p class="sheet-copy">SP no publica automáticamente en estas plataformas (requieren tu cuenta). Exporta tu MP3/WAV y súbelo; cada botón abre la plataforma oficial. La arquitectura RSS de tu episodio ya está preparada para una fase futura.</p>
  <div class="sheet-stack">${links.map(([n,u])=>`<button class="sheet-btn" data-ext="${u}">↗ ${n}<small>${u.replace('https://','')}</small></button>`).join('')}</div>`,root=>{
    $$('[data-ext]',root).forEach(b=>b.onclick=()=>{ window.open(b.dataset.ext,'_blank','noopener'); });
  });
}
/* ============================================================
   16) INTERFAZ · PANTALLA PRINCIPAL DE SP
   ============================================================ */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const rootEl = () => $('#spRoot');
function refresh(){ if(state.activeView!=='studio')return; if(S.view==='studio'&&activeProject())renderStudio(); else renderSPHome(); }

function renderSPHome(){
  const root=rootEl(); if(!root)return;
  S.view='home';
  const enCurso=S.projects.filter(p=>['draft','recording','editing'].includes(p.status));
  const terminados=S.projects.filter(p=>p.status==='finished');
  const publicados=S.projects.filter(p=>p.status==='published');
  const seriesMap=new Map();
  for(const p of S.projects){ const k=p.showName||'Sin serie'; if(!seriesMap.has(k))seriesMap.set(k,[]); seriesMap.get(k).push(p); }
  const tabs=[
    ['en-curso','EN CURSO',enCurso.length],['terminados','TERMINADOS',terminados.length],
    ['publicados','PUBLICADOS',publicados.length],['series','MIS SERIES',seriesMap.size]
  ];
  let list='';
  const card=p=>{
    const dur=projectDuration(p), st=SP_STATUS[p.status]||SP_STATUS.draft;
    return `<div class="sp-card" data-card="${p.id}">
      <div class="sp-card-art">${p.cover?`<img src="${p.cover}" alt=""/>`:'🎙'}</div>
      <div class="sp-card-copy"><strong>Ep${p.episodeNumber?` ${String(p.episodeNumber).padStart(2,'0')} · `:''}${safeText(p.title)}</strong>
      <small>${safeText(p.showName||'Sin serie')} · ${formatTime(dur)} · ${new Date(p.updatedAt||p.createdAt).toLocaleDateString('es')}</small>
      <span class="sp-status ${st.cls}">${st.label}</span></div>
      <div class="sp-card-side"><button class="sp-mini" data-open="${p.id}">${['finished','published'].includes(p.status)?'Ver':'Continuar'}</button><button class="sp-kebab" data-menu="${p.id}" title="Opciones">⋮</button></div>
    </div>`;
  };
  if(S.tab==='en-curso')list=enCurso.length?enCurso.map(card).join(''):`<div class="sp-empty"><strong>Aún no hay episodios en curso</strong><span>Pulsa «+ Nuevo podcast», graba tu voz y aquí aparecerá.</span></div>`;
  if(S.tab==='terminados')list=terminados.length?terminados.map(card).join(''):`<div class="sp-empty"><strong>Sin episodios terminados</strong><span>Cuando acabes uno con «Terminar episodio», lo verás aquí.</span></div>`;
  if(S.tab==='publicados')list=publicados.length?publicados.map(card).join(''):`<div class="sp-empty"><strong>Nada publicado todavía</strong><span>Termina un episodio y pulsa Publicar para escucharlo en HAPPY.</span></div>`;
  if(S.tab==='series'){
    const rows=[...seriesMap.entries()];
    list=rows.length?rows.map(([name,eps])=>`<button class="sp-card" data-series="${safeText(name)}">
      <div class="sp-card-art">📻</div>
      <div class="sp-card-copy"><strong>${safeText(name)}</strong><small>${eps.length} episodio${eps.length===1?'':'s'} · última actividad ${new Date(Math.max(...eps.map(e=>e.updatedAt||0))).toLocaleDateString('es')}</small></div>
      <div class="sp-card-side"><span class="sp-kebab">›</span></div></button>`).join(''):`<div class="sp-empty"><strong>Sin series todavía</strong><span>Al crear un episodio, ponle «Serie/programa» para agruparlos aquí.</span></div>`;
  }
  root.innerHTML=`
  <div class="sp-head">
    <button class="sp-head-mark sp-hero-mark" aria-hidden="true">🎙</button>
    <div class="sp-head-copy"><small>SP · STUDIO PODCAST</small><h2>Estudio Podcast</h2><p>Graba con guion, divide en bloques y publica dentro de HAPPY.</p></div>
  </div>
  <div class="sp-hero">
    <div class="sp-hero-top"><div><h1>Crea tu podcast</h1><p>Tres pasos: escribe el guion, pulsa grabar y termina el episodio. SP se encarga del resto.</p></div><span class="sp-hero-mark">✨</span></div>
    <button class="sp-new-btn" id="spNewBtn">＋ NUEVO PODCAST</button>
    <div class="sp-steps"><span class="sp-step">1 · Nuevo</span><span class="sp-step">2 · Grabar con guion</span><span class="sp-step">3 · Sonidos y música</span><span class="sp-step">4 · Terminar</span><span class="sp-step">5 · Publicar</span></div>
  </div>
  <div class="sp-tabs">${tabs.map(([k,l,n])=>`<button class="sp-tab ${S.tab===k?'active':''}" data-tab="${k}"><b>${n}</b>${l}</button>`).join('')}</div>
  <div class="sp-cards">${list}</div>`;
  $('#spNewBtn',root).onclick=openNewPodcastSheet;
  $$('[data-tab]',root).forEach(b=>b.onclick=()=>{ S.tab=b.dataset.tab; renderSPHome(); });
  $$('[data-open]',root).forEach(b=>b.onclick=()=>{ S.projectId=b.dataset.open; S.undo=[];S.redo=[]; renderStudio(); });
  $$('[data-menu]',root).forEach(b=>b.onclick=e=>{ e.stopPropagation(); openCardMenu(b.dataset.menu); });
  $$('[data-series]',root).forEach(b=>b.onclick=()=>openSeriesSheet(b.dataset.series,seriesMap));
  $$('[data-card]',root).forEach(c=>c.onclick=e=>{ if(e.target.closest('button'))return; const id=c.dataset.card; S.projectId=id; S.undo=[];S.redo=[]; renderStudio(); });
}
function openNewPodcastSheet(){
  openSheet(`<h2 class="sheet-title">＋ Nuevo podcast</h2>
  <p class="sheet-copy">Solo lo esencial. Lo demás se ajusta después, mientras grabas.</p>
  <div style="display:grid;gap:8px">
    <label class="search-box"><span>✎</span><input id="spNpTitle" type="text" placeholder="Título del episodio *"/></label>
    <label class="search-box"><span>📻</span><input id="spNpSeries" type="text" placeholder="Serie / programa (opcional)"/></label>
    <label class="search-box"><span>#</span><input id="spNpNum" type="number" min="0" placeholder="Número del episodio (opcional)"/></label>
    <label class="search-box"><span>≡</span><input id="spNpDesc" type="text" placeholder="Descripción (opcional)"/></label>
    <div class="micro-panel compact"><button class="micro-btn" id="spNpCoverBtn">🖼 Portada (opcional)</button><span id="spNpCoverName" class="sp-note" style="align-self:center">Sin portada</span></div>
  </div>
  <div class="sheet-stack"><button class="sheet-btn" data-np-go>🎙 Crear y abrir el estudio</button></div>`,root=>{
    let coverData='';
    $('#spNpCoverBtn',root).onclick=()=>{
      const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
      inp.onchange=async()=>{
        const f=inp.files?.[0]; if(!f)return;
        try{ coverData=await shrinkImage(f,512); $('#spNpCoverName',root).textContent=f.name.slice(0,30); }
        catch{ toast('No se pudo usar esa imagen'); }
      };
      inp.click();
    };
    $('[data-np-go]',root).onclick=()=>{
      const title=$('#spNpTitle',root).value.trim();
      if(!title){ toast('Escribe al menos el título del episodio'); $('#spNpTitle',root).focus(); return; }
      const p=newProject({title, showName:$('#spNpSeries',root).value.trim(), episodeNumber:Number($('#spNpNum',root).value)||0, description:$('#spNpDesc',root).value.trim(), cover:coverData});
      S.projects.unshift(p); saveProjectNow(p.id); S.projectId=p.id; S.tab='en-curso'; S.undo=[];S.redo=[];
      closeDialog(els.sheetDialog); renderStudio(); toast('Estudio abierto · pulsa ● GRABAR cuando quieras',3600);
    };
    setTimeout(()=>$('#spNpTitle',root)?.focus(),80);
  });
}
function shrinkImage(file,max){
  return new Promise((resolve,reject)=>{
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      try{
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        resolve(c.toDataURL('image/jpeg',.82));
      }catch(e){ reject(e); } finally{ URL.revokeObjectURL(url); }
    };
    img.onerror=()=>{ URL.revokeObjectURL(url); reject(new Error('img')); };
    img.src=url;
  });
}
function openCardMenu(id){
  const p=S.projects.find(x=>x.id===id); if(!p)return;
  openSheet(`<h2 class="sheet-title">${safeText(p.title)}</h2><p class="sheet-copy">${statusLabel(p)} · ${p.showName?safeText(p.showName)+' · ':''}${formatTime(projectDuration(p))}</p>
  <div class="sheet-stack">
    <button class="sheet-btn" data-act="open">${['finished','published'].includes(p.status)?'▶ Abrir en el estudio':'⏺ Continuar grabando'}</button>
    <button class="sheet-btn" data-act="rename">✎ Renombrar episodio</button>
    <button class="sheet-btn" data-act="finish">✓ Marcar como terminado</button>
    ${p.status==='published'&&p.publishedTrackId?'<button class="sheet-btn" data-act="playpub">▶ Escuchar el episodio publicado</button>':''}
    <button class="sheet-btn" data-act="dup">⧉ Duplicar proyecto</button>
    <button class="sheet-btn" data-act="del" style="color:var(--accent)">🗑 Eliminar proyecto</button>
  </div>
  <p class="sp-note">Creado ${new Date(p.createdAt).toLocaleString('es')} · modificado ${new Date(p.updatedAt||p.createdAt).toLocaleString('es')}</p>`,root=>{
    $('[data-act="open"]',root).onclick=()=>{ closeDialog(els.sheetDialog); S.projectId=p.id; S.undo=[];S.redo=[]; renderStudio(); };
    $('[data-act="rename"]',root).onclick=()=>{
      closeDialog(els.sheetDialog);
      openSheet(`<h2 class="sheet-title">Renombrar</h2><label class="search-box"><span>✎</span><input id="spRn" type="text" value="${safeText(p.title)}" maxlength="90"/></label><div class="sheet-stack"><button class="sheet-btn" data-rn>Guardar</button></div>`,root2=>{
        $('[data-rn]',root2).onclick=()=>{ const v=$('#spRn',root2).value.trim(); if(v){p.title=v;saveProjectNow(p.id);} closeDialog(els.sheetDialog); renderSPHome(); };
      });
    };
    $('[data-act="finish"]',root).onclick=async()=>{ p.status='finished'; await saveProjectNow(p.id); closeDialog(els.sheetDialog); renderSPHome(); toast('Marcado como terminado'); };
    const pp=$('[data-act="playpub"]',root);
    if(pp)pp.onclick=()=>{ closeDialog(els.sheetDialog); if(playTrack)playTrack(p.publishedTrackId); };
    $('[data-act="dup"]',root).onclick=async()=>{
      closeDialog(els.sheetDialog);
      const copy=normalizeProject(JSON.parse(JSON.stringify(p)));
      copy.id=uid('sp'); copy.title=`${p.title} (copia)`; copy.status='editing'; copy.publishedTrackId=''; copy.publishedPlaylistId='';
      copy.publication={happy:false,externalLinks:{},publishedAt:0}; copy.createdAt=now(); copy.updatedAt=now();
      copy.blocks=copy.blocks.map(b=>({...b,id:uid('blk')}));
      S.projects.unshift(copy); await saveProjectNow(copy.id); renderSPHome(); toast('Proyecto duplicado ✓');
    };
    $('[data-act="del"]',root).onclick=()=>{
      openSheet(`<h2 class="sheet-title">¿Eliminar «${safeText(p.title)}»?</h2><p class="sheet-copy">Se borran el proyecto y sus grabaciones de este dispositivo. Esta acción no se puede deshacer${p.publishedTrackId?' (el episodio ya publicado en HAPPY se conserva)':'.'}</p><div class="sheet-stack"><button class="sheet-btn" data-del-yes style="color:var(--accent)">🗑 Sí, eliminar</button><button class="sheet-btn" data-del-no>Conservar</button></div>`,root2=>{
        $('[data-del-yes]',root2).onclick=async()=>{
          for(const b of p.blocks)if(b.audioId&&!b.audioId.startsWith('snd_'))await deleteAudioBlob(b.audioId);
          await spDelete('projects',p.id);
          S.projects=S.projects.filter(x=>x.id!==p.id);
          closeDialog(els.sheetDialog); renderSPHome(); toast('Proyecto eliminado');
        };
        $('[data-del-no]',root2).onclick=()=>closeDialog(els.sheetDialog);
      });
    };
  });
}
function openSeriesSheet(name,seriesMap){
  const eps=(seriesMap.get(name)||[]).slice().sort((a,b)=>(a.episodeNumber||0)-(b.episodeNumber||0));
  openSheet(`<h2 class="sheet-title">📻 ${safeText(name)}</h2><p class="sheet-copy">${eps.length} episodio${eps.length===1?'':'s'} de esta serie o programa.</p>
  <div class="sheet-stack">${eps.map(p=>`<button class="sheet-btn" data-ser="${p.id}">${p.episodeNumber?`EP${String(p.episodeNumber).padStart(2,'0')} · `:''}${safeText(p.title)}<small>${statusLabel(p)} · ${formatTime(projectDuration(p))}</small></button>`).join('')}</div>`,root=>{
    $$('[data-ser]',root).forEach(b=>b.onclick=()=>{ closeDialog(els.sheetDialog); S.projectId=b.dataset.ser; S.undo=[];S.redo=[]; renderStudio(); });
  });
}
/* ============================================================
   17) INTERFAZ · ESTUDIO (grabador + guion + bloques + cajones)
   ============================================================ */
function renderStudio(){
  const root=rootEl(); if(!root)return;
  const p=activeProject();
  if(!p){ S.view='home'; return renderSPHome(); }
  S.view='studio';
  recomputeStarts(p);
  const total=projectDuration(p), rec=S.rec, st=SP_STATUS[p.status]||SP_STATUS.draft;
  const recording=rec.state!=='idle';
  const blockIcon=b=>b.type==='voice'?'🎙':b.type==='silence'?'␣':'🎵';
  const blocksHtml=p.blocks.length?p.blocks.map((b,i)=>{
    const d=blockDuration(b), isCur=S.preview.blockId===b.id, isRecTarget=rec.targetBlockId===b.id;
    const fx=(b.type!=='silence')?`<div class="sp-block-fx">
      <span class="lbl">Vol</span>${[[.5,'50%'],[1,'100%'],[1.5,'150%']].map(([v,l])=>`<button class="sp-fade ${Math.abs((b.volume??1)-v)<.001?'active':''}" data-bvol="${b.id}|${v}">${l}</button>`).join('')}
      <span class="lbl">Fade in</span>${[[0,'—'],[1,'1s'],[2,'2s'],[3,'3s']].map(([v,l])=>`<button class="sp-fade ${(b.fadeIn||0)===v?'active':''}" data-bfade="${b.id}|in|${v}">${l}</button>`).join('')}
      <span class="lbl">Fade out</span>${[[0,'—'],[1,'1s'],[2,'2s'],[3,'3s']].map(([v,l])=>`<button class="sp-fade ${(b.fadeOut||0)===v?'active':''}" data-bfade="${b.id}|out|${v}">${l}</button>`).join('')}
      ${b.versions?.length?`<span class="sp-kbd">↺ ${b.versions.length} versión(es) anteriores</span>`:''}
    </div>`:'';
    return `<div class="sp-block b-${b.type} ${(isCur||isRecTarget)?'current':''}" data-blk="${b.id}">
      <div class="sp-block-icon">${blockIcon(b)}</div>
      <div class="sp-block-copy"><strong>${safeText(b.title)}${b.type==='silence'?' · silencio':''}</strong>
      <small>${spFmtClock((b.start||0)*1000)} – ${spFmtClock(((b.start||0)+d)*1000)}${b.note?` · ${safeText(b.note)}`:''}</small></div>
      <div class="sp-block-actions">
        ${b.type!=='silence'?`<button class="sp-mini" data-bplay="${b.id}">${isCur?'■':'▶'}</button>`:''}
        ${b.type!=='silence'?`<button class="sp-mini" data-btrim="${b.id}" title="Cortar">✂</button><button class="sp-mini" data-bsplit="${b.id}" title="Dividir">⎇</button>`:''}
        <button class="sp-mini" data-brere="${b.id}" title="Regrabar bloque">⏺</button>
        <button class="sp-mini" data-bmore="${b.id}" title="Más">⋯</button>
      </div>${fx}</div>`;
  }).join(''):`<div class="sp-empty"><strong>El episodio empieza aquí</strong><span>Pulsa <b>● GRABAR</b> para tu primera toma. Cada toma crea un bloque: INTRO, BLOQUE 1, BLOQUE 2…</span></div>`;
  const marksHtml=p.markers.length?`<div class="sp-marks">${p.markers.map(m=>`<span class="sp-mark">🏁 ${safeText(m.label)}<small>${spFmtClock(m.time*1000)}</small></span>`).join('')}</div>`:'';
  const musHtml=p.backgroundMusic.length?p.backgroundMusic.map(m=>`<div class="sp-music-item"><strong>♪ ${safeText(m.title)}</strong>
    <div class="sp-music-meta"><span>${spFmtClock(m.sourceStart*1000)}→${spFmtClock(m.sourceEnd*1000)} de la canción</span><span>· ${Math.round(m.volume*100)}%</span><span>· en ${spFmtClock((m.timelineStart||0)*1000)}</span>${m.ducking?'<span>· 🎚 baja al hablar</span>':''}</div>
    <div class="sp-block-actions"><button class="sp-mini" data-mus-edit="${m.id}">✎ Ajustar</button><button class="sp-mini danger" data-mus-del="${m.id}">🗑</button></div></div>`).join(''):'';
  const voiceTotal=p.blocks.filter(b=>b.type==='voice').reduce((a,b)=>a+blockDuration(b),0);
  const soundTotal=p.blocks.filter(b=>b.type==='sound').reduce((a,b)=>a+blockDuration(b),0);
  const lane=(cls,label,segs,totalDur)=>`<div class="sp-lane ${cls}"><small>${label}</small><div class="bar">${segs.map(([s,d])=>`<i style="left:${totalDur?Math.min(99,(s/totalDur)*100):0}%;width:${totalDur?Math.max(1,(d/totalDur)*100):0}%"></i>`).join('')}</div></div>`;
  const voiceSegs=p.blocks.filter(b=>b.type==='voice').map(b=>[b.start||0,blockDuration(b)]);
  const soundSegs=p.blocks.filter(b=>b.type==='sound').map(b=>[b.start||0,blockDuration(b)]);
  const musSegs=p.backgroundMusic.map(m=>[m.timelineStart||0,m.duration||0]);
  const isDesktop=window.innerWidth>=880;
  root.innerHTML=`
  <div class="sp-head">
    <button class="sp-back" id="spBack" title="Volver a SP">←</button>
    <div class="sp-head-copy"><small>SP · ${safeText(p.showName||'SIN SERIE')}${p.episodeNumber?` · EP ${p.episodeNumber}`:''}</small><h2>${safeText(p.title)}</h2><p>Estado: ${st.label} · ${formatTime(total)} · guardado automático</p></div>
    <div class="sp-head-actions"><button class="sp-mini" id="spUndoBtn" title="Deshacer">↶</button><button class="sp-mini" id="spRedoBtn" title="Rehacer">↷</button></div>
  </div>
  <div class="sp-studio">
    <div class="sp-studio-grid ${isDesktop?'with-script':''}">
      <div class="sp-recorder">
        <div class="sp-rec-title"><small>EPISODIO</small>${safeText(p.title)}</div>
        <div class="sp-timer ${rec.state==='recording'?'rec':''}" id="spTimer">${spFmtClock(recElapsed())}</div>
        <div class="sp-meter ${rec.state==='idle'?'idle':''}"><i id="spMeterFill"></i></div>
        <div class="sp-rec-status">${rec.state==='recording'?'● Grabando…':rec.state==='paused'?'⏸ En pausa · el tiempo no corre':rec.targetBlockId?`⏺ Recrear «${safeText(rec.targetLabel)}»`:'Listo para grabar'}</div>
        <div class="sp-rec-main">
          ${rec.state==='idle'?`<button class="sp-rec-btn" id="spRecBtn"><span><span class="dot"></span>GRABAR</span></button>`:''}
          ${rec.state==='recording'?`<button class="sp-rec-btn recording" id="spPauseBtn">⏸ PAUSA</button><button class="sp-rec-btn stop" id="spStopBtn">■ TERMINAR</button>`:''}
          ${rec.state==='paused'?`<button class="sp-rec-btn" id="spResumeBtn">▶ CONTINUAR</button><button class="sp-rec-btn stop" id="spStopBtn">■ TERMINAR</button><button class="sp-mini" id="spCancelBtn" style="align-self:center">Descartar toma</button>`:''}
        </div>
        <div class="sp-rec-tools">
          <button class="sp-chip" id="spMarkBtn" ${rec.state==='idle'?'disabled':''}>＋ MARCA</button>
          <button class="sp-chip" id="spSilBtn">＋ ESPACIO</button>
          <button class="sp-chip" id="spSoundBtn">🎵 SONIDO</button>
          <button class="sp-chip" id="spScriptToggle">📄 GUION</button>
        </div>
      </div>
      <div class="sp-script" id="spScriptPanel" ${isDesktop?'':'data-collapsed="1"'}>
        <div class="sp-script-head"><small>📄 GUION · ${isDesktop?'se lee mientras grabas':'toca para leer mientras grabas'}</small><span class="sp-kbd">se guarda solo</span></div>
        <textarea id="spScriptArea" placeholder="Pega o escribe aquí tu guion. Puedes leerlo y desplazarte mientras grabas: la grabación no se detiene.">${safeText(p.script)}</textarea>
        <span class="sp-script-hint">Consejo: en escritorio el guion queda a un lado y el grabador al otro; en móvil despliega este panel sin detener la grabación.</span>
      </div>
    </div>
    <div class="sp-blocks">
      <div class="sp-blocks-head"><small>BLOQUES DEL EPISODIO</small><span class="sp-blocks-total">${p.blocks.length} bloque(s) · ${formatTime(total)}</span></div>
      ${blocksHtml}${marksHtml}
    </div>
    <div class="sp-drawers">
      <div class="sp-drawer" id="spDrawerIntro">
        <div class="sp-drawer-head"><strong>🔊 INTRO / TRANSICIÓN</strong><button data-drawer="spDrawerIntro">Abrir ▸</button></div>
        <div class="sp-drawer-list"></div>
      </div>
      <div class="sp-drawer" id="spDrawerOutro">
        <div class="sp-drawer-head"><strong>🔉 CIERRE</strong><button data-drawer="spDrawerOutro">Abrir ▸</button></div>
        <div class="sp-drawer-list"></div>
      </div>
    </div>
    <div class="sp-music">
      <div class="sp-music-head"><small>🎵 MÚSICA DE FONDO · DE TU BIBLIOTECA HAPPY</small><button class="sp-chip" id="spMusAdd">＋ Añadir música</button></div>
      ${musHtml||'<p class="sp-note">Opcional: elige una canción de tu biblioteca, un fragmento y el volumen. Con «bajar cuando hablo» la música se atenúa sola.</p>'}
      <div class="sp-lanes">
        ${lane('voice','VOZ',voiceSegs,Math.max(total,.001))}
        ${lane('sounds','SONIDOS',soundSegs,Math.max(total,.001))}
        ${lane('music','MÚSICA',musSegs,Math.max(total,.001))}
      </div>
    </div>
    <div class="sp-episode-actions">
      <button class="sp-action primary" id="spPreviewBtn">▶ ESCUCHAR<br/><small>episodio completo</small></button>
      <button class="sp-action good" id="spFinishBtn">✓ TERMINAR<br/><small>guardar como terminado</small></button>
      <button class="sp-action" id="spPublishBtn">🎙 PUBLICAR / COMPARTIR<br/><small>HAPPY · WAV · MP3 · enlaces</small></button>
    </div>
  </div>`;
  // --- acciones del estudio ---
  $('#spBack',root).onclick=()=>renderSPHome();
  $('#spUndoBtn',root).onclick=undo; $('#spRedoBtn',root).onclick=redo;
  if(rec.state==='idle'){
    $('#spRecBtn',root).onclick=()=>recStart('','');
  }else{
    if($('#spPauseBtn',root))$('#spPauseBtn',root).onclick=recPause;
    if($('#spResumeBtn',root))$('#spResumeBtn',root).onclick=recResume;
    $('#spStopBtn',root).onclick=recStop;
    if($('#spCancelBtn',root))$('#spCancelBtn',root).onclick=()=>{ recCancel(); toast('Toma descartada'); };
  }
  $('#spMarkBtn',root)?.addEventListener('click',openMarkerSheet);
  $('#spSilBtn',root).onclick=openSilenceSheet;
  $('#spSoundBtn',root).onclick=()=>openSoundLibrarySheet();
  $('#spMusAdd',root).onclick=openMusicPicker;
  $('#spPreviewBtn',root).onclick=openFullPreview;
  $('#spFinishBtn',root).onclick=openFinishSheet;
  $('#spPublishBtn',root).onclick=openPublishSheet;
  // guion
  const scriptPanel=$('#spScriptPanel',root), scriptArea=$('#spScriptArea',root);
  if(!isDesktop){
    const apply=()=>{ const c=scriptPanel.dataset.collapsed==='1'; scriptArea.style.display=c?'none':'block'; $('#spScriptToggle',root).classList.toggle('active',!c); };
    apply();
    $('#spScriptToggle',root).onclick=()=>{ scriptPanel.dataset.collapsed=scriptPanel.dataset.collapsed==='1'?'0':'1'; apply(); };
  }else{
    $('#spScriptToggle',root).onclick=()=>{ const c=$('#spScriptPanel',root); c.style.display=c.style.display==='none'?'grid':'none'; };
    $('#spScriptToggle',root).title='Mostrar/ocultar guion';
  }
  scriptArea.oninput=()=>{
    p.script=scriptArea.value;
    clearTimeout(S.scriptSaveTimer);
    S.scriptSaveTimer=setTimeout(()=>saveProjectNow(p.id),600);
  };
  // bloques
  $$('[data-bplay]',root).forEach(b=>b.onclick=()=>playBlock(b.dataset.bplay));
  $$('[data-btrim]',root).forEach(b=>b.onclick=()=>trimBlockSheet(b.dataset.btrim));
  $$('[data-bsplit]',root).forEach(b=>b.onclick=()=>splitBlockAt(b.dataset.bsplit));
  $$('[data-brere]',root).forEach(b=>b.onclick=()=>rerecordBlock(b.dataset.brere));
  $$('[data-bmore]',root).forEach(b=>b.onclick=()=>openBlockMoreSheet(b.dataset.bmore));
  $$('[data-bvol]',root).forEach(b=>b.onclick=()=>{ const [id,v]=b.dataset.bvol.split('|'); setBlockVolume(id,Number(v)); });
  $$('[data-bfade]',root).forEach(b=>b.onclick=()=>{ const [id,which,v]=b.dataset.bfade.split('|'); setBlockFade(id,which,Number(v)); });
  // cajones
  fillDrawer('spDrawerIntro',['intro','transition','effect']);
  fillDrawer('spDrawerOutro',['outro']);
  $$('[data-drawer]',root).forEach(b=>b.onclick=()=>{ const d=$('#'+b.dataset.drawer,root); d.classList.toggle('open'); b.textContent=d.classList.contains('open')?'Cerrar ▴':'Abrir ▸'; });
  // música existente
  $$('[data-mus-edit]',root).forEach(b=>b.onclick=()=>{ const m=p.backgroundMusic.find(x=>x.id===b.dataset.musEdit); const t=state.tracks.find(x=>x.id===m.trackId); if(t)openMusicConfig(t,{existing:m}); else toast('La pista original ya no está en tu biblioteca'); });
  $$('[data-mus-del]',root).forEach(b=>b.onclick=()=>{ pushUndo(); p.backgroundMusic=p.backgroundMusic.filter(x=>x.id!==b.dataset.musDel); scheduleSave(p.id); refresh(); toast('Música quitada'); });
  if(rec.state!=='idle'){ const el=$('#spTimer',root); if(el)el.textContent=spFmtClock(recElapsed()); }
}
function openBlockMoreSheet(blockId){
  const p=activeProject(); const b=p?.blocks.find(x=>x.id===blockId); if(!b)return;
  openSheet(`<h2 class="sheet-title">Bloque · ${safeText(b.title)}</h2>
  <div class="sheet-stack">
    <button class="sheet-btn" data-m="play">▶ Reproducir</button>
    <button class="sheet-btn" data-m="from">⏺ REGRABAR DESDE AQUÍ<small>Conserva todo lo anterior · graba la continuación</small></button>
    <button class="sheet-btn" data-m="del" style="color:var(--accent)">🗑 Eliminar bloque<small>↶ para deshacer · el audio original se conserva en versiones</small></button>
  </div>`,root=>{
    $$('[data-m]',root).forEach(btn=>btn.onclick=()=>{
      const m=btn.dataset.m; closeDialog(els.sheetDialog);
      if(m==='play')playBlock(b.id);
      if(m==='from')rerecordFrom(b.id);
      if(m==='del')deleteBlock(b.id);
    });
  });
}
async function fillDrawer(drawerId,types){
  const drawer=$('#'+drawerId); if(!drawer)return;
  const list=$('.sp-drawer-list',drawer);
  const defs=SOUND_LIBRARY.filter(d=>types.includes(d.type)).slice(0,14);
  list.innerHTML=defs.map(d=>`<div class="sp-sound" data-snd="${d.id}"><strong>${safeText(d.name.replace(/ A$| B$/,''))}</strong><small>${SOUND_TYPES[d.type]} · ${d.seconds}s</small><div class="sp-sound-actions"><button data-snd-play="${d.id}">▶</button><button data-snd-add="${d.id}">＋</button></div></div>`).join('');
  const find=id=>SOUND_LIBRARY.find(d=>d.id===id);
  $$('[data-snd-play]',list).forEach(b=>b.onclick=async()=>{
    const def=find(b.dataset.sndPlay); if(!def)return;
    try{ const blob=await getSoundBlob(def); const buf=await decodeBlob(blob);
      const ctx=audioCtx(), src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination); src.start();
    }catch{ toast('No se pudo preescuchar'); }
  });
  $$('[data-snd-add]',list).forEach(b=>b.onclick=()=>{ const def=find(b.dataset.sndAdd); if(def)addSoundBlock(def); });
}
function openSoundLibrarySheet(){
  const cats=SOUND_CATEGORIES;
  openSheet(`<h2 class="sheet-title">🎵 Biblioteca de sonidos del podcast</h2>
  <p class="sheet-copy">Sonidos breves (1-6 s) incluidos, sintetizados por SP y libres de derechos. Elige una categoría:</p>
  <div class="chips" style="margin-bottom:10px">${cats.map((c,i)=>`<button class="chip" data-cat="${i}">${safeText(c)}</button>`).join('')}</div>
  <div id="spSoundCatList" class="sheet-stack"><p class="sp-note">Toca una categoría para ver sus INTRO · TRANSICIÓN · INTERMEDIO · CIERRE · EFECTO.</p></div>`,root=>{
    $$('[data-cat]',root).forEach(b=>b.onclick=()=>{
      const cat=cats[Number(b.dataset.cat)];
      const defs=SOUND_LIBRARY.filter(d=>d.category===cat);
      $$('#spSoundCatList .sheet-btn',root).forEach(x=>x.remove());
      $('#spSoundCatList',root).innerHTML=defs.map(d=>`<button class="sheet-btn" data-snd-sheet="${d.id}">${SOUND_TYPES[d.type]} · ${safeText(d.name)}<small>${d.seconds}s · preescuchar e insertar</small></button>`).join('');
      $$('[data-snd-sheet]',root).forEach(btn=>btn.onclick=()=>{
        const def=SOUND_LIBRARY.find(d=>d.id===btn.dataset.sndSheet); if(!def)return;
        closeDialog(els.sheetDialog);
        openSheet(`<h2 class="sheet-title">${safeText(def.name)}</h2><p class="sheet-copy">${SOUND_TYPES[def.type]} · ${def.category} · ${def.seconds}s</p><div class="sheet-stack"><button class="sheet-btn" data-do="play">▶ PREESCUCHAR</button><button class="sheet-btn" data-do="add">＋ INSERTAR en el episodio</button></div>`,root2=>{
          $('[data-do="play"]',root2).onclick=async()=>{ try{ const blob=await getSoundBlob(def); const buf=await decodeBlob(blob); const ctx=audioCtx(),src=ctx.createBufferSource(); src.buffer=buf; src.connect(ctx.destination); src.start(); }catch{ toast('No se pudo preescuchar'); } };
          $('[data-do="add"]',root2).onclick=()=>{ closeDialog(els.sheetDialog); addSoundBlock(def); };
        });
      });
    });
  });
}

/* ============================================================
   18) INIT DEL MÓDULO + PUENTE MP_SP
   ============================================================ */
let booted=false;
async function ensureLoaded(){ if(S.ready)return; await loadProjects(); }
async function boot(){
  if(booted)return; booted=true;
  await openSPDB();
  try{ await ensureLoaded(); }catch{ toast('SP: no se pudo abrir el almacen del estudio',4000); }
  // Enlace profundo #sp-<id>
  const m=(location.hash||'').match(/^#sp-([a-z0-9_]+)/i);
  if(m&&S.projects.some(p=>p.id===m[1])){ S.projectId=m[1]; }
  if(state.activeView==='studio')refresh();
}
function exportProjects(){
  // metadata lista para el Recovery JSON (los blobs viven en IndexedDB SP)
  if(!S.ready)return[];
  try{ return JSON.parse(JSON.stringify(S.projects)); }catch{ return []; }
}
async function importProjects(list){
  if(!Array.isArray(list))return;
  await openSPDB();
  let added=0, updated=0;
  for(const raw of list){
    if(!raw?.id)continue;
    const inc=normalizeProject(raw);
    const cur=S.projects.find(p=>p.id===inc.id);
    if(!cur){ S.projects.push(inc); await spPut('projects',JSON.parse(JSON.stringify(inc))); added++; }
    else if((inc.updatedAt||0)>(cur.updatedAt||0)){ const idx=S.projects.indexOf(cur); S.projects[idx]=inc; await spPut('projects',JSON.parse(JSON.stringify(inc))); updated++; }
  }
  if(added+updated>0)S.projects.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  if(added+updated>0&&state.activeView==='studio')refresh();
  if(added+updated>0)toast(`SP · proyectos recuperados: ${added} nuevos · ${updated} actualizados`,3600);
}
window.MP_SP={ refresh, exportProjects, importProjects };

function bindSP(){
  const nav=$('#navStudio');
  if(nav)nav.onclick=()=>showView('studio');
  window.addEventListener('mp:viewchange',e=>{ if(e.detail==='studio')boot(); });
  window.addEventListener('resize',()=>{ if(state.activeView==='studio'&&S.view==='studio'&&!S.rec.timerRaf){ /* re-layout suave del guion en giro de pantalla */ clearTimeout(window.__spRsz); window.__spRsz=setTimeout(()=>refresh(),240); } });
  window.addEventListener('beforeunload',()=>{ const p=activeProject(); if(p)scheduleSave(p.id); });
}
bindSP();

})();
