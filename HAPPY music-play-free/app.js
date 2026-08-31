(() => {
'use strict';

const BUILD = '2026.08.28-r2';
const DB_NAME = 'music-play-free-db';
const DB_VERSION = 4;
const AUDIO_EXT = new Set(['mp3','m4a','aac','wav','ogg','oga','opus','flac','webm','mp4']);
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => Date.now();

const els = {
  splash: $('#splash'), app: $('#app'), audio: $('#audio'),
  trackList: $('#trackList'), emptyState: $('#emptyState'), hero: $('#hero'),
  searchInput: $('#searchInput'), sortSelect: $('#sortSelect'),
  sectionKicker: $('#sectionKicker'), sectionTitle: $('#sectionTitle'),
  countAll: $('#countAll'), countMusic: $('#countMusic'), countAudio: $('#countAudio'), countFav: $('#countFav'),
  dropZone: $('#dropZone'), fileInput: $('#fileInput'), folderInput: $('#folderInput'),
  addFilesBtn: $('#addFilesBtn'), addFolderBtn: $('#addFolderBtn'), addFilesSide: $('#addFilesSide'), addFolderSide: $('#addFolderSide'), emptyAddBtn: $('#emptyAddBtn'), mobileAddBtn: $('#mobileAddBtn'),
  rescanBtn: $('#rescanBtn'), settingsBtn: $('#settingsBtn'), mobileSettingsBtn: $('#mobileSettingsBtn'), settingsDialog: $('#settingsDialog'),
  playerDialog: $('#playerDialog'), miniPlayer: $('#miniPlayer'), miniOpen: $('#miniOpen'),
  miniCover: $('#miniCover'), miniTitle: $('#miniTitle'), miniArtist: $('#miniArtist'),
  miniProgress: $('#miniProgress'), fullProgress: $('#fullProgress'), timeCurrent: $('#timeCurrent'), timeTotal: $('#timeTotal'),
  playBtn: $('#playBtn'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'), fullPlayBtn: $('#fullPlayBtn'), fullPrevBtn: $('#fullPrevBtn'), fullNextBtn: $('#fullNextBtn'),
  muteBtn: $('#muteBtn'), volumeRange: $('#volumeRange'), shuffleBtn: $('#shuffleBtn'), repeatBtn: $('#repeatBtn'), favoriteNowBtn: $('#favoriteNowBtn'),
  fullTitle: $('#fullTitle'), fullArtist: $('#fullArtist'), bigCover: $('#bigCover'), visualizer: $('#visualizer'),
  speedSelect: $('#speedSelect'), sleepSelect: $('#sleepSelect'), sleepStatus: $('#sleepStatus'),
  eqDialog: $('#eqDialog'), openEqBtn: $('#openEqBtn'), bassRange: $('#bassRange'), midRange: $('#midRange'), trebleRange: $('#trebleRange'), bassValue: $('#bassValue'), midValue: $('#midValue'), trebleValue: $('#trebleValue'),
  rememberPosition: $('#rememberPosition'), autoNext: $('#autoNext'), normalizeToggle: $('#normalizeToggle'),
  settingsAddFiles: $('#settingsAddFiles'), settingsAddFolder: $('#settingsAddFolder'), clearLibraryBtn: $('#clearLibraryBtn'), capabilityList: $('#capabilityList'),
  themeBtn: $('#themeBtn'), installBtn: $('#installBtn'), brandHome: $('#brandHome'),
  scanOverlay: $('#scanOverlay'), scanTitle: $('#scanTitle'), scanFile: $('#scanFile'), scanBar: $('#scanBar'), scanCount: $('#scanCount'), cancelScanBtn: $('#cancelScanBtn'),
  toast: $('#toast'), confirmDialog: $('#confirmDialog'), confirmTitle: $('#confirmTitle'), confirmText: $('#confirmText'), confirmAccept: $('#confirmAccept'),
  buildVersion: $('#buildVersion')
};

const state = {
  tracks: [], view: 'all', search: '', sort: 'smart', currentId: null,
  queueIds: [], queueIndex: -1, shuffle: false, repeat: 'off',
  volume: 0.9, lastVolume: 0.9, speed: 1, theme: 'auto',
  objectUrl: null, coverUrl: null, playing: false, scanCancelled: false,
  sleepUntil: 0, sleepTimer: null, installPrompt: null,
  settings: { rememberPosition: true, autoNext: true, normalize: false, eq: { bass:0, mid:0, treble:0 } }
};

const sessionFiles = new Map();
const artworkCache = new Map();

class LocalDB {
  constructor(){ this.db = null; }
  async init(){
    if (!('indexedDB' in window)) return false;
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('tracks')) db.createObjectStore('tracks', { keyPath:'id' });
        if (!db.objectStoreNames.contains('sources')) db.createObjectStore('sources', { keyPath:'id' });
        if (!db.objectStoreNames.contains('covers')) db.createObjectStore('covers', { keyPath:'id' });
        if (!db.objectStoreNames.contains('state')) db.createObjectStore('state', { keyPath:'key' });
        if (!db.objectStoreNames.contains('dirs')) db.createObjectStore('dirs', { keyPath:'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return true;
  }
  tx(store, mode='readonly'){ return this.db.transaction(store, mode).objectStore(store); }
  req(req){ return new Promise((resolve,reject)=>{ req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); }); }
  async getAll(store){ if(!this.db) return []; return this.req(this.tx(store).getAll()); }
  async get(store,key){ if(!this.db) return null; return this.req(this.tx(store).get(key)); }
  async put(store,value){ if(!this.db) return false; return new Promise((resolve,reject)=>{ const tx=this.db.transaction(store,'readwrite'); tx.objectStore(store).put(value); tx.oncomplete=()=>resolve(true); tx.onerror=()=>reject(tx.error); tx.onabort=()=>reject(tx.error || new Error('IDB aborted')); }); }
  async delete(store,key){ if(!this.db) return; return new Promise((resolve,reject)=>{ const tx=this.db.transaction(store,'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); }); }
  async clear(store){ if(!this.db) return; return new Promise((resolve,reject)=>{ const tx=this.db.transaction(store,'readwrite'); tx.objectStore(store).clear(); tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error); }); }
  async clearAll(){ for(const s of ['tracks','sources','covers','state','dirs']) await this.clear(s); }
}
const db = new LocalDB();

class AudioFX {
  constructor(audio, canvas){
    this.audio=audio; this.canvas=canvas; this.ctx=null; this.source=null; this.bass=null; this.mid=null; this.treble=null; this.gain=null; this.analyser=null; this.ready=false; this.raf=0;
  }
  async ensure(){
    if(this.ready){ if(this.ctx?.state==='suspended') await this.ctx.resume().catch(()=>{}); return true; }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return false;
    try{
      this.ctx = new Ctx();
      this.source = this.ctx.createMediaElementSource(this.audio);
      this.bass = this.ctx.createBiquadFilter(); this.bass.type='lowshelf'; this.bass.frequency.value=180;
      this.mid = this.ctx.createBiquadFilter(); this.mid.type='peaking'; this.mid.frequency.value=1000; this.mid.Q.value=0.8;
      this.treble = this.ctx.createBiquadFilter(); this.treble.type='highshelf'; this.treble.frequency.value=4200;
      this.gain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize=256; this.analyser.smoothingTimeConstant=.82;
      this.source.connect(this.bass).connect(this.mid).connect(this.treble).connect(this.gain).connect(this.analyser).connect(this.ctx.destination);
      this.ready=true; this.apply(); this.draw();
      if(this.ctx.state==='suspended') await this.ctx.resume().catch(()=>{});
      return true;
    }catch(err){ console.warn('WebAudio FX disabled:',err); return false; }
  }
  apply(){
    if(!this.ready) return;
    this.bass.gain.value=Number(state.settings.eq.bass)||0;
    this.mid.gain.value=Number(state.settings.eq.mid)||0;
    this.treble.gain.value=Number(state.settings.eq.treble)||0;
    this.gain.gain.value=state.settings.normalize ? 0.92 : 1;
  }
  draw(){
    if(!this.canvas) return;
    const ctx2d=this.canvas.getContext('2d');
    const frame=()=>{
      this.raf=requestAnimationFrame(frame);
      const w=this.canvas.width,h=this.canvas.height;
      ctx2d.clearRect(0,0,w,h);
      if(!this.ready || !this.analyser) return;
      const data=new Uint8Array(this.analyser.frequencyBinCount); this.analyser.getByteFrequencyData(data);
      const grad=ctx2d.createLinearGradient(0,h,0,0); grad.addColorStop(0,'rgba(255,73,96,.12)'); grad.addColorStop(1,'rgba(255,130,95,.76)');
      ctx2d.fillStyle=grad;
      const bars=52,gap=4,bw=(w-(bars-1)*gap)/bars;
      for(let i=0;i<bars;i++){
        const idx=Math.floor(i*data.length/bars); const v=data[idx]/255; const bh=Math.max(2,v*h*.82);
        ctx2d.fillRect(i*(bw+gap),h-bh,bw,bh);
      }
    };
    frame();
  }
}
const fx = new AudioFX(els.audio, els.visualizer);

function formatTime(sec){
  if(!Number.isFinite(sec)||sec<0) return '0:00';
  sec=Math.floor(sec); const m=Math.floor(sec/60), s=sec%60; return `${m}:${String(s).padStart(2,'0')}`;
}
function formatSize(bytes){ if(!bytes) return ''; const u=['B','KB','MB','GB']; let i=0,n=bytes; while(n>=1024&&i<u.length-1){n/=1024;i++;} return `${n.toFixed(i>1?1:0)} ${u[i]}`; }
function cleanName(name){ return (name||'').replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim(); }
function safeText(s){ return String(s ?? '').replace(/[<>]/g,''); }
function hashId(file, path=''){
  const raw=`${path}|${file.name}|${file.size}|${file.lastModified}`;
  let h1=0x811c9dc5;
  for(let i=0;i<raw.length;i++){ h1^=raw.charCodeAt(i); h1=Math.imul(h1,0x01000193); }
  return `t_${(h1>>>0).toString(16)}_${file.size}`;
}
function extOf(name){ const i=name.lastIndexOf('.'); return i<0?'':name.slice(i+1).toLowerCase(); }
function isAudioFile(file){
  const ext=extOf(file.name||'');
  return (file.type||'').startsWith('audio/') || AUDIO_EXT.has(ext);
}
function folderFromFile(file){
  const rp=file.webkitRelativePath||'';
  if(rp.includes('/')) return rp.split('/').slice(0,-1).join('/');
  return '';
}
function smartClassify(meta, file, path=''){
  const text=`${path} ${file.name} ${meta.artist||''} ${meta.album||''}`.toLowerCase();
  let score=0;
  if(/(^|[\/\s])(music|música|musica|songs|canciones|albums|spotify|deezer|itunes)([\/\s]|$)/i.test(text)) score+=36;
  if(/download|descargas/i.test(text)) score+=8;
  if(meta.artist && meta.artist!=='Desconocido') score+=18;
  if(meta.album) score+=10;
  if(file.size>1_500_000) score+=12;
  if(file.size>4_000_000) score+=6;
  if(/whatsapp voice|voice notes|notas de voz|telegram voice|recordings|grabaciones|ptt[-_]|^aud[-_]/i.test(text)) score-=42;
  if(file.size<350_000) score-=18;
  const category=score>=18?'music':'audio';
  return {score,category};
}
function makeTrack(file, meta={}, path=''){
  const c=smartClassify(meta,file,path);
  return {
    id:hashId(file,path), fileName:file.name, title:meta.title||cleanName(file.name)||'Sin título', artist:meta.artist||'Desconocido', album:meta.album||'',
    folderPath:path||folderFromFile(file)||'Archivos seleccionados', size:file.size, type:file.type||'', ext:extOf(file.name), lastModified:file.lastModified||0,
    duration:Number(meta.duration)||0, category:c.category, smartScore:c.score, favorite:false, addedAt:now(), lastPlayed:0, playCount:0,
    hasCover:!!meta.coverBlob, persistent:false, sourceKind:'session', sourceName:file.name
  };
}

function decodeText(bytes, encoding){
  try{
    if(encoding===0) return new TextDecoder('iso-8859-1').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===3) return new TextDecoder('utf-8').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===2) return new TextDecoder('utf-16be').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===1){
      if(bytes[0]===0xff&&bytes[1]===0xfe) return new TextDecoder('utf-16le').decode(bytes.slice(2)).replace(/\0/g,'').trim();
      if(bytes[0]===0xfe&&bytes[1]===0xff) return new TextDecoder('utf-16be').decode(bytes.slice(2)).replace(/\0/g,'').trim();
      return new TextDecoder('utf-16le').decode(bytes).replace(/\0/g,'').trim();
    }
  }catch{}
  return '';
}
function synchsafe(b0,b1,b2,b3){ return (b0<<21)|(b1<<14)|(b2<<7)|b3; }
function u32(b,o){ return ((b[o]<<24)>>>0)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3]; }
async function parseAudioTags(file){
  const out={};
  try{
    const headBuf=await file.slice(0, Math.min(file.size, 2_000_000)).arrayBuffer();
    const b=new Uint8Array(headBuf);
    if(b.length>=10 && b[0]===73&&b[1]===68&&b[2]===51){
      const ver=b[3], tagSize=synchsafe(b[6],b[7],b[8],b[9]); let pos=10; const end=Math.min(b.length,10+tagSize);
      while(pos+10<=end){
        const id=String.fromCharCode(b[pos],b[pos+1],b[pos+2],b[pos+3]);
        if(!/^[A-Z0-9]{4}$/.test(id)) break;
        const size=ver===4?synchsafe(b[pos+4],b[pos+5],b[pos+6],b[pos+7]):u32(b,pos+4); if(!size||size<0) break;
        const start=pos+10, stop=Math.min(start+size,end); if(start>=stop) break;
        const data=b.slice(start,stop);
        if(['TIT2','TPE1','TALB'].includes(id) && data.length>1){
          const value=decodeText(data.slice(1),data[0]);
          if(id==='TIT2') out.title=value; if(id==='TPE1') out.artist=value; if(id==='TALB') out.album=value;
        } else if(id==='APIC' && data.length>8){
          const enc=data[0]; let i=1; let mimeEnd=i; while(mimeEnd<data.length&&data[mimeEnd]!==0)mimeEnd++;
          const mime=decodeText(data.slice(i,mimeEnd),0)||'image/jpeg'; i=mimeEnd+1; i++; // picture type
          if(enc===0||enc===3){ while(i<data.length&&data[i]!==0)i++; i++; }
          else { while(i+1<data.length && !(data[i]===0&&data[i+1]===0)) i+=2; i+=2; }
          if(i<data.length){ const img=data.slice(i); if(img.length>64) out.coverBlob=new Blob([img],{type:mime}); }
        }
        pos=stop;
      }
    }
    if((!out.title||!out.artist) && file.size>=128){
      const tail=new Uint8Array(await file.slice(file.size-128).arrayBuffer());
      if(tail[0]===84&&tail[1]===65&&tail[2]===71){
        const txt=(a,z)=>decodeText(tail.slice(a,z),0);
        if(!out.title) out.title=txt(3,33); if(!out.artist) out.artist=txt(33,63); if(!out.album) out.album=txt(63,93);
      }
    }
  }catch(err){ console.debug('Metadata parse skipped:',file.name,err); }
  return out;
}

async function getDuration(file, timeout=6000){
  return new Promise(resolve=>{
    const a=document.createElement('audio'); const url=URL.createObjectURL(file); let done=false;
    const finish=v=>{ if(done)return; done=true; URL.revokeObjectURL(url); a.src=''; resolve(Number.isFinite(v)?v:0); };
    const t=setTimeout(()=>finish(0),timeout);
    a.preload='metadata'; a.onloadedmetadata=()=>{clearTimeout(t);finish(a.duration)}; a.onerror=()=>{clearTimeout(t);finish(0)}; a.src=url;
  });
}

function openDialog(d){ if(!d) return; try{ d.showModal(); }catch{ d.setAttribute('open',''); } }
function closeDialog(d){ if(!d) return; try{ d.close(); }catch{ d.removeAttribute('open'); } }
function toast(msg, ms=2600){ els.toast.textContent=msg; els.toast.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.classList.remove('show'),ms); }
function confirmAction(title,text){
  return new Promise(resolve=>{
    els.confirmTitle.textContent=title; els.confirmText.textContent=text; openDialog(els.confirmDialog);
    const accept=()=>{cleanup();closeDialog(els.confirmDialog);resolve(true)};
    const cancel=()=>{cleanup();resolve(false)};
    const cleanup=()=>{els.confirmAccept.removeEventListener('click',accept);els.confirmDialog.removeEventListener('close',cancel)};
    els.confirmAccept.addEventListener('click',accept,{once:true}); els.confirmDialog.addEventListener('close',cancel,{once:true});
  });
}

function showScan(title='Analizando biblioteca…'){ state.scanCancelled=false; els.scanTitle.textContent=title; els.scanFile.textContent='Preparando archivos'; els.scanBar.style.width='0%'; els.scanCount.textContent='0 archivos'; els.scanOverlay.classList.remove('is-hidden'); }
function updateScan(current,total,name){ els.scanFile.textContent=name||'Procesando…'; els.scanCount.textContent=total?`${current} de ${total}`:`${current} archivos`; els.scanBar.style.width=total?`${Math.min(100,current/total*100)}%`:`${Math.min(95,(current%30)/30*100)}%`; }
function hideScan(){ els.scanOverlay.classList.add('is-hidden'); }

async function persistState(){
  const payload={
    currentId:state.currentId, volume:state.volume, speed:state.speed, shuffle:state.shuffle, repeat:state.repeat,
    theme:state.theme, settings:state.settings, position:state.settings.rememberPosition?els.audio.currentTime||0:0, savedAt:now()
  };
  try{ localStorage.setItem('mpf-state',JSON.stringify(payload)); }catch{}
  try{ await db.put('state',{key:'player',...payload}); }catch{}
}
function loadLocalState(){
  try{
    const s=JSON.parse(localStorage.getItem('mpf-state')||'{}');
    if(Number.isFinite(s.volume)) state.volume=s.volume;
    if(Number.isFinite(s.speed)) state.speed=s.speed;
    if(typeof s.shuffle==='boolean') state.shuffle=s.shuffle;
    if(['off','all','one'].includes(s.repeat)) state.repeat=s.repeat;
    if(s.theme) state.theme=s.theme;
    if(s.settings) state.settings={...state.settings,...s.settings,eq:{...state.settings.eq,...(s.settings.eq||{})}};
    state.currentId=s.currentId||null; state.restorePosition=Number(s.position)||0;
  }catch{}
}
function applyTheme(){
  const dark=state.theme==='dark'||(state.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
}
function cycleTheme(){ state.theme=state.theme==='auto'?'dark':state.theme==='dark'?'light':'auto'; applyTheme(); persistState(); toast(`Tema: ${state.theme==='auto'?'automático':state.theme}`); }

async function loadLibrary(){
  try{ state.tracks=(await db.getAll('tracks')).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0)); }
  catch(err){ console.warn('Library load failed',err); state.tracks=[]; }
  render();
}
async function saveTrack(track){
  const idx=state.tracks.findIndex(t=>t.id===track.id); if(idx>=0) state.tracks[idx]=track; else state.tracks.push(track);
  try{ await db.put('tracks',track); }catch(err){ console.warn('Could not save metadata',err); }
}
async function updateTrack(id, patch){
  const t=state.tracks.find(x=>x.id===id); if(!t)return null; Object.assign(t,patch); try{await db.put('tracks',t);}catch{} renderCounts(); return t;
}

async function saveSource(track,file,handle=null){
  sessionFiles.set(track.id,file);
  if(!db.db){ track.persistent=false; track.sourceKind='session'; return 'session'; }
  if(handle){
    try{ await db.put('sources',{id:track.id,kind:'handle',handle}); track.persistent=true; track.sourceKind='handle'; await db.put('tracks',track); return 'handle'; }catch(err){ console.debug('Handle persistence unavailable',err); }
  }
  try{
    await db.put('sources',{id:track.id,kind:'blob',blob:file,name:file.name,type:file.type,lastModified:file.lastModified});
    track.persistent=true; track.sourceKind='blob'; await db.put('tracks',track); return 'blob';
  }catch(err){
    track.persistent=false; track.sourceKind='session'; await db.put('tracks',track).catch(()=>{});
    console.warn('File remains available only in this session:',file.name,err);
    return 'session';
  }
}
async function saveCover(id,blob){ if(!blob)return; try{await db.put('covers',{id,blob});}catch{} }
async function getCoverBlob(id){ try{return (await db.get('covers',id))?.blob||null}catch{return null} }

async function ensureHandlePermission(handle){
  if(!handle) return false;
  try{
    if((await handle.queryPermission({mode:'read'}))==='granted') return true;
    return (await handle.requestPermission({mode:'read'}))==='granted';
  }catch{return false;}
}
async function getTrackFile(track){
  if(sessionFiles.has(track.id)) return sessionFiles.get(track.id);
  let source=null; try{source=await db.get('sources',track.id);}catch{}
  if(source?.kind==='handle'&&source.handle){
    if(await ensureHandlePermission(source.handle)){
      try{ const f=await source.handle.getFile(); sessionFiles.set(track.id,f); return f; }catch{}
    }
  }
  if(source?.kind==='blob'&&source.blob){
    const f=source.blob instanceof File?source.blob:new File([source.blob],source.name||track.fileName,{type:source.type||track.type,lastModified:source.lastModified||track.lastModified});
    sessionFiles.set(track.id,f); return f;
  }
  return null;
}


async function pickFiles(){
  if(!('showOpenFilePicker' in window)){ els.fileInput.click(); return; }
  try{
    const handles=await window.showOpenFilePicker({
      multiple:true,
      types:[{description:'Archivos de audio',accept:{'audio/*':['.mp3','.m4a','.aac','.wav','.ogg','.opus','.flac','.webm']}}],
      excludeAcceptAllOption:false
    });
    if(!handles?.length)return;
    const files=[], handleMap=new Map();
    for(const h of handles){ const f=await h.getFile(); if(isAudioFile(f)){files.push(f);handleMap.set(f,h);} }
    await importFiles(files,{title:'Añadiendo música…',handleFor:f=>handleMap.get(f)||null});
  }catch(err){ if(err?.name!=='AbortError'){ console.warn('Open file picker failed',err); els.fileInput.click(); } }
}

async function importFiles(files, options={}){
  const list=Array.from(files||[]).filter(isAudioFile);
  if(!list.length){toast('No se encontraron archivos de audio compatibles');return;}
  showScan(options.title||'Analizando archivos…');
  let added=0,updated=0,sessionOnly=0;
  for(let i=0;i<list.length;i++){
    if(state.scanCancelled)break;
    const file=list[i], path=options.pathFor?options.pathFor(file):folderFromFile(file);
    updateScan(i+1,list.length,file.name);
    const id=hashId(file,path);
    const existing=state.tracks.find(t=>t.id===id);
    let meta={}; try{meta=await parseAudioTags(file);}catch{}
    let track=existing?{...existing}:{...makeTrack(file,meta,path)};
    if(existing){ track.title=meta.title||track.title; track.artist=meta.artist||track.artist; track.album=meta.album||track.album; track.hasCover=track.hasCover||!!meta.coverBlob; updated++; }
    else added++;
    const sourceKind=await saveSource(track,file,options.handleFor?options.handleFor(file):null);
    if(sourceKind==='session')sessionOnly++;
    if(meta.coverBlob) await saveCover(track.id,meta.coverBlob);
    await saveTrack(track);
    if(i%10===0){ renderCounts(); await sleep(0); }
  }
  hideScan(); render();
  if(state.scanCancelled) toast(`Importación detenida · ${added} nuevas`);
  else toast(`${added} nuevas · ${updated} actualizadas${sessionOnly?` · ${sessionOnly} solo en esta sesión`:''}`,3600);
  resolveDurationsInBackground(state.tracks.filter(t=>!t.duration).slice(0,18));
}

async function importDirectoryHandle(){
  if(!('showDirectoryPicker' in window)){ els.folderInput.click(); return; }
  try{
    const root=await window.showDirectoryPicker({mode:'read'});
    const entries=[];
    showScan(`Explorando ${root.name}…`);
    async function walk(dir,path=''){
      for await (const [name,handle] of dir.entries()){
        if(state.scanCancelled)break;
        if(handle.kind==='directory') await walk(handle,path?`${path}/${name}`:name);
        else if(handle.kind==='file'){
          const f=await handle.getFile(); if(isAudioFile(f)) entries.push({file:f,handle,path:path||root.name});
          updateScan(entries.length,0,name);
        }
      }
    }
    await walk(root,root.name);
    if(state.scanCancelled){hideScan();return;}
    try{ await db.put('dirs',{id:`dir_${root.name}_${now()}`,name:root.name,handle:root,addedAt:now()}); }catch{}
    hideScan();
    if(!entries.length){toast('La carpeta no contiene audio compatible');return;}
    showScan(`Añadiendo ${entries.length} pistas…`);
    let added=0;
    for(let i=0;i<entries.length;i++){
      if(state.scanCancelled)break;
      const {file,handle,path}=entries[i]; updateScan(i+1,entries.length,file.name);
      const id=hashId(file,path), existing=state.tracks.find(t=>t.id===id); const meta=await parseAudioTags(file); let track=existing?{...existing}:makeTrack(file,meta,path);
      if(!existing)added++; else {track.title=meta.title||track.title;track.artist=meta.artist||track.artist;track.album=meta.album||track.album;track.hasCover=track.hasCover||!!meta.coverBlob;}
      await saveSource(track,file,handle); if(meta.coverBlob)await saveCover(track.id,meta.coverBlob); await saveTrack(track);
    }
    hideScan(); render(); toast(`${added} pistas nuevas desde ${root.name}`); resolveDurationsInBackground(entries.slice(0,18).map(e=>state.tracks.find(t=>t.id===hashId(e.file,e.path))).filter(Boolean));
  }catch(err){ if(err?.name!=='AbortError')toast('No fue posible abrir la carpeta'); hideScan(); }
}

async function rescanDirectories(){
  if(!('showDirectoryPicker' in window)){toast('En este navegador selecciona nuevamente la carpeta');els.folderInput.click();return;}
  let dirs=[]; try{dirs=await db.getAll('dirs');}catch{}
  if(!dirs.length){toast('Aún no hay carpetas vinculadas');return;}
  let totalNew=0;
  for(const d of dirs){
    if(!(await ensureHandlePermission(d.handle))) continue;
    const before=state.tracks.length;
    showScan(`Resincronizando ${d.name}…`);
    const entries=[];
    async function walk(dir,path=''){
      for await (const [name,h] of dir.entries()){
        if(state.scanCancelled)break;
        if(h.kind==='directory') await walk(h,path?`${path}/${name}`:name);
        else if(h.kind==='file'){ const f=await h.getFile(); if(isAudioFile(f))entries.push({file:f,handle:h,path:path||d.name}); updateScan(entries.length,0,name); }
      }
    }
    await walk(d.handle,d.name);
    for(let i=0;i<entries.length&&!state.scanCancelled;i++){
      const e=entries[i],id=hashId(e.file,e.path); if(state.tracks.some(t=>t.id===id)){await saveSource(state.tracks.find(t=>t.id===id),e.file,e.handle);continue;}
      const meta=await parseAudioTags(e.file),track=makeTrack(e.file,meta,e.path); await saveSource(track,e.file,e.handle); if(meta.coverBlob)await saveCover(track.id,meta.coverBlob); await saveTrack(track);
    }
    totalNew+=Math.max(0,state.tracks.length-before); hideScan();
  }
  render(); toast(totalNew?`${totalNew} pistas nuevas encontradas`:'Biblioteca al día');
}

async function resolveDurationsInBackground(tracks){
  for(const t of tracks){
    if(t.duration)continue;
    const f=await getTrackFile(t); if(!f)continue;
    const d=await getDuration(f,4500); if(d>0){t.duration=d; await db.put('tracks',t).catch(()=>{}); renderRowDuration(t.id,d);} await sleep(40);
  }
}
function renderRowDuration(id,d){ const el=document.querySelector(`[data-track-id="${CSS.escape(id)}"] .track-duration`); if(el)el.textContent=formatTime(d); }

function getVisibleTracks(){
  let a=[...state.tracks];
  if(state.view==='music')a=a.filter(t=>t.category==='music');
  else if(state.view==='audio')a=a.filter(t=>t.category==='audio');
  else if(state.view==='favorites')a=a.filter(t=>t.favorite);
  else if(state.view==='recent')a=a.filter(t=>t.lastPlayed).sort((x,y)=>(y.lastPlayed||0)-(x.lastPlayed||0));
  if(state.search){ const q=state.search.toLowerCase(); a=a.filter(t=>[t.title,t.artist,t.album,t.folderPath,t.fileName].some(v=>(v||'').toLowerCase().includes(q))); }
  if(state.view!=='recent'){
    if(state.sort==='title')a.sort((x,y)=>x.title.localeCompare(y.title,undefined,{sensitivity:'base'}));
    else if(state.sort==='artist')a.sort((x,y)=>(x.artist||'').localeCompare(y.artist||'',undefined,{sensitivity:'base'}));
    else if(state.sort==='recent')a.sort((x,y)=>(y.addedAt||0)-(x.addedAt||0));
    else if(state.sort==='played')a.sort((x,y)=>(y.playCount||0)-(x.playCount||0));
    else a.sort((x,y)=>(y.smartScore||0)-(x.smartScore||0)||(y.addedAt||0)-(x.addedAt||0));
  }
  return a;
}
function viewLabels(){
  const m={all:['BIBLIOTECA','Todos los audios'],music:['CLASIFICACIÓN INTELIGENTE','Música'],audio:['OTROS AUDIOS','Audios y notas de voz'],favorites:['TU SELECCIÓN','Favoritos'],recent:['HISTORIAL LOCAL','Reproducidos recientemente']}; return m[state.view]||m.all;
}
function renderCounts(){
  els.countAll.textContent=state.tracks.length; els.countMusic.textContent=state.tracks.filter(t=>t.category==='music').length; els.countAudio.textContent=state.tracks.filter(t=>t.category==='audio').length; els.countFav.textContent=state.tracks.filter(t=>t.favorite).length;
}
function render(){
  renderCounts(); const [k,t]=viewLabels(); els.sectionKicker.textContent=k; els.sectionTitle.textContent=t;
  const visible=getVisibleTracks();
  els.trackList.innerHTML=''; els.emptyState.classList.toggle('is-hidden',visible.length>0); els.hero.classList.toggle('is-hidden',state.tracks.length>0);
  els.dropZone.classList.toggle('show',state.tracks.length===0);
  const frag=document.createDocumentFragment();
  visible.forEach((track,i)=>frag.appendChild(trackRow(track,i,visible)));
  els.trackList.appendChild(frag);
  syncNav(); syncPlayerUI();
}
function trackRow(track,index,context){
  const row=document.createElement('div'); row.className=`track-row${track.id===state.currentId?' current':''}`; row.dataset.trackId=track.id; row.tabIndex=0;
  const art=document.createElement('div'); art.className='track-art'; art.textContent='♪';
  if(track.hasCover) loadArtworkInto(track.id,art);
  const main=document.createElement('div'); main.className='track-main'; main.appendChild(art);
  const text=document.createElement('div'); text.className='track-text'; text.innerHTML=`<div class="track-title">${safeText(track.title)}</div><div class="track-artist">${safeText(track.artist||'Desconocido')}</div>`; main.appendChild(text);
  const album=document.createElement('div'); album.className='track-album'; album.title=track.folderPath||''; album.textContent=track.album||track.folderPath||'—';
  const type=document.createElement('span'); type.className=`type-pill ${track.category}`; type.textContent=track.category==='music'?'MÚSICA':'AUDIO';
  const dur=document.createElement('span'); dur.className='track-duration'; dur.textContent=track.duration?formatTime(track.duration):'—';
  const actions=document.createElement('div'); actions.className='track-actions';
  const fav=document.createElement('button'); fav.className=`track-action${track.favorite?' fav':''}`; fav.title='Favorito'; fav.textContent=track.favorite?'♥':'♡'; fav.addEventListener('click',e=>{e.stopPropagation();toggleFavorite(track.id)});
  const more=document.createElement('button'); more.className='track-action more'; more.title=`${formatSize(track.size)} · ${track.folderPath||''}`; more.textContent='⋯'; more.addEventListener('click',e=>{e.stopPropagation();showTrackInfo(track)});
  actions.append(fav,more);
  const num=document.createElement('span'); num.className='track-num'; num.textContent=String(index+1);
  row.append(num,main,album,type,dur,actions);
  row.addEventListener('click',()=>playTrack(track.id,context.map(x=>x.id)));
  row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playTrack(track.id,context.map(x=>x.id));}});
  return row;
}
async function loadArtworkInto(id,container){
  try{
    let url=artworkCache.get(id); if(!url){const blob=await getCoverBlob(id);if(!blob)return;url=URL.createObjectURL(blob);artworkCache.set(id,url);}
    if(!container.isConnected && container!==els.bigCover && container!==els.miniCover)return;
    const img=new Image();img.alt='';img.src=url;container.textContent='';container.appendChild(img);
  }catch{}
}
function showTrackInfo(track){ toast(`${track.title} · ${formatSize(track.size)} · ${track.folderPath||'sin carpeta'}`,4200); }
function syncNav(){
  $$('.nav-item[data-view],.mobile-nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
}
function setView(view){state.view=view;state.search='';els.searchInput.value='';render();}

async function toggleFavorite(id){ const t=state.tracks.find(x=>x.id===id);if(!t)return;t.favorite=!t.favorite;await db.put('tracks',t).catch(()=>{});render(); if(id===state.currentId)syncPlayerUI(); }
function currentTrack(){return state.tracks.find(t=>t.id===state.currentId)||null;}
function buildQueue(contextIds){ state.queueIds=contextIds?.length?contextIds:getVisibleTracks().map(t=>t.id); state.queueIndex=state.queueIds.indexOf(state.currentId); }
async function playTrack(id,contextIds=null,restorePosition=0){
  const track=state.tracks.find(t=>t.id===id); if(!track)return;
  const file=await getTrackFile(track);
  if(!file){toast('Este archivo ya no está accesible. Vuelve a añadirlo para reproducirlo.',4200);return;}
  if(state.objectUrl){URL.revokeObjectURL(state.objectUrl);state.objectUrl=null;}
  state.objectUrl=URL.createObjectURL(file); state.currentId=id; buildQueue(contextIds); els.audio.src=state.objectUrl; els.audio.playbackRate=state.speed; els.audio.volume=state.volume;
  els.audio.load();
  const onMeta=async()=>{
    if(restorePosition>0 && restorePosition<els.audio.duration-3)els.audio.currentTime=restorePosition;
    if(!track.duration&&Number.isFinite(els.audio.duration)){track.duration=els.audio.duration;await db.put('tracks',track).catch(()=>{});}
  };
  els.audio.addEventListener('loadedmetadata',onMeta,{once:true});
  try{await els.audio.play(); state.playing=true; track.lastPlayed=now();track.playCount=(track.playCount||0)+1;await db.put('tracks',track).catch(()=>{}); await updatePlayerArtwork(track); updateMediaSession(track); render(); persistState();}
  catch(err){console.warn('Playback blocked/failed',err);state.playing=false;syncPlayerUI();toast('No se pudo iniciar este audio. Prueba otro archivo.',3500);}
}
async function togglePlay(){
  if(!state.currentId){ const first=getVisibleTracks()[0]; if(first)await playTrack(first.id,getVisibleTracks().map(t=>t.id)); else toast('Añade música primero'); return; }
  if(!els.audio.src){await playTrack(state.currentId,state.queueIds.length?state.queueIds:getVisibleTracks().map(t=>t.id),state.restorePosition||0);state.restorePosition=0;return;}
  try{if(els.audio.paused){await els.audio.play();state.playing=true;}else{els.audio.pause();state.playing=false;}syncPlayerUI();persistState();}catch{toast('El navegador bloqueó la reproducción');}
}
async function nextTrack(manual=false){
  if(!state.queueIds.length){buildQueue();}
  if(!state.queueIds.length)return;
  let idx=state.queueIds.indexOf(state.currentId); if(idx<0)idx=0;
  if(state.repeat==='one'&&!manual){els.audio.currentTime=0;await els.audio.play();return;}
  if(state.shuffle&&state.queueIds.length>1){let choices=state.queueIds.filter(x=>x!==state.currentId);const id=choices[Math.floor(Math.random()*choices.length)];await playTrack(id,state.queueIds);return;}
  idx++;
  if(idx>=state.queueIds.length){if(state.repeat==='all')idx=0;else{state.playing=false;syncPlayerUI();return;}}
  await playTrack(state.queueIds[idx],state.queueIds);
}
async function prevTrack(){
  if(els.audio.currentTime>3){els.audio.currentTime=0;return;}
  if(!state.queueIds.length)buildQueue(); let idx=state.queueIds.indexOf(state.currentId); if(idx<=0){if(state.repeat==='all')idx=state.queueIds.length;else return;} await playTrack(state.queueIds[idx-1],state.queueIds);
}
function cycleRepeat(){state.repeat=state.repeat==='off'?'all':state.repeat==='all'?'one':'off';syncPlayerUI();persistState();toast(state.repeat==='off'?'Repetición apagada':state.repeat==='all'?'Repetir lista':'Repetir una');}
function toggleShuffle(){state.shuffle=!state.shuffle;syncPlayerUI();persistState();toast(state.shuffle?'Aleatorio activado':'Aleatorio apagado');}
function updateProgressUI(){
  const d=els.audio.duration||0,c=els.audio.currentTime||0,p=d?c/d*100:0; els.miniProgress.value=p;els.fullProgress.value=p;els.timeCurrent.textContent=formatTime(c);els.timeTotal.textContent=formatTime(d);
  if(state.sleepUntil){const remain=Math.max(0,state.sleepUntil-now());els.sleepStatus.textContent=remain?`Apagado automático en ${Math.ceil(remain/60000)} min`:'';}
}
function syncPlayerUI(){
  const t=currentTrack(), playing=!els.audio.paused&&!!els.audio.src;
  state.playing=playing; const icon=playing?'❚❚':'▶';els.playBtn.textContent=icon;els.fullPlayBtn.textContent=icon;
  els.volumeRange.value=String(state.volume);els.speedSelect.value=String(state.speed);els.shuffleBtn.classList.toggle('active',state.shuffle);els.repeatBtn.classList.toggle('active',state.repeat!=='off');els.repeatBtn.textContent=state.repeat==='one'?'↻¹':'↻';
  els.rememberPosition.checked=!!state.settings.rememberPosition;els.autoNext.checked=!!state.settings.autoNext;els.normalizeToggle.checked=!!state.settings.normalize;
  els.bassRange.value=state.settings.eq.bass;els.midRange.value=state.settings.eq.mid;els.trebleRange.value=state.settings.eq.treble;updateEqLabels();
  if(!t){els.miniPlayer.classList.add('is-hidden');return;}
  els.miniPlayer.classList.remove('is-hidden');els.miniTitle.textContent=t.title;els.miniArtist.textContent=t.artist||'Desconocido';els.fullTitle.textContent=t.title;els.fullArtist.textContent=[t.artist,t.album].filter(Boolean).join(' · ')||'Desconocido';els.favoriteNowBtn.textContent=t.favorite?'♥':'♡';els.favoriteNowBtn.title=t.favorite?'Quitar de favoritos':'Añadir a favoritos';
}
async function updatePlayerArtwork(track){
  if(state.coverUrl){URL.revokeObjectURL(state.coverUrl);state.coverUrl=null;}
  const blob=await getCoverBlob(track.id); [els.miniCover,els.bigCover].forEach(c=>{c.innerHTML='♪';});
  if(blob){state.coverUrl=URL.createObjectURL(blob);for(const c of [els.miniCover,els.bigCover]){const img=new Image();img.alt='';img.src=state.coverUrl;c.textContent='';c.appendChild(img);}}
}
function updateMediaSession(track){
  if(!('mediaSession' in navigator))return;
  try{
    const art=state.coverUrl?[{src:state.coverUrl,sizes:'512x512'}]:[];
    navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist||'',album:track.album||'',artwork:art});
    navigator.mediaSession.playbackState='playing';
  }catch{}
}
function setupMediaSession(){
  if(!('mediaSession' in navigator))return;
  const handlers={play:()=>togglePlay(),pause:()=>togglePlay(),previoustrack:()=>prevTrack(),nexttrack:()=>nextTrack(true),seekbackward:d=>{els.audio.currentTime=Math.max(0,els.audio.currentTime-(d.seekOffset||10));},seekforward:d=>{els.audio.currentTime=Math.min(els.audio.duration||Infinity,els.audio.currentTime+(d.seekOffset||10));},seekto:d=>{if(Number.isFinite(d.seekTime))els.audio.currentTime=d.seekTime;},stop:()=>{els.audio.pause();els.audio.currentTime=0;}};
  for(const [a,h] of Object.entries(handlers))try{navigator.mediaSession.setActionHandler(a,h);}catch{}
}

function setVolume(v){v=Math.min(1,Math.max(0,Number(v)));state.volume=v;if(v>0)state.lastVolume=v;els.audio.volume=v;syncPlayerUI();persistState();}
function toggleMute(){setVolume(state.volume>0?0:(state.lastVolume||.8));els.muteBtn.textContent=state.volume===0?'🔇':'🔊';}
function seekFromRange(el){const d=els.audio.duration||0;if(d)els.audio.currentTime=(Number(el.value)/100)*d;}
function setSpeed(v){state.speed=Number(v)||1;els.audio.playbackRate=state.speed;persistState();}
function setSleep(minutes){
  if(state.sleepTimer)clearTimeout(state.sleepTimer);state.sleepTimer=null;state.sleepUntil=0;
  const m=Number(minutes)||0;if(!m){els.sleepStatus.textContent='';return;}
  state.sleepUntil=now()+m*60000;state.sleepTimer=setTimeout(()=>{els.audio.pause();state.playing=false;state.sleepUntil=0;els.sleepStatus.textContent='Temporizador finalizado';syncPlayerUI();toast('Reproducción detenida por temporizador');},m*60000);updateProgressUI();
}
function updateEqLabels(){els.bassValue.textContent=`${state.settings.eq.bass} dB`;els.midValue.textContent=`${state.settings.eq.mid} dB`;els.trebleValue.textContent=`${state.settings.eq.treble} dB`;}
function applyEqFromInputs(){state.settings.eq={bass:Number(els.bassRange.value),mid:Number(els.midRange.value),treble:Number(els.trebleRange.value)};updateEqLabels();fx.apply();persistState();}

function capabilities(){
  const list=[['Reproducción local','HTMLAudioElement' in window||!!els.audio],['Carpetas con permiso persistente','showDirectoryPicker' in window],['Carpetas compatibles','webkitdirectory' in document.createElement('input')],['Biblioteca local','indexedDB' in window],['Controles en pantalla bloqueada','mediaSession' in navigator],['Procesamiento Web Audio',!!(window.AudioContext||window.webkitAudioContext)],['Instalable como PWA','serviceWorker' in navigator],['Almacenamiento privado','storage' in navigator]];
  els.capabilityList.innerHTML=list.map(([n,ok])=>`<div class="capability"><span>${n}</span><i class="${ok?'':'no'}">${ok?'Disponible':'Limitado'}</i></div>`).join('');
}

async function clearLibrary(){
  if(!(await confirmAction('Vaciar biblioteca','Se eliminarán metadatos, favoritos y copias locales guardadas por esta app. Tus archivos originales no se tocarán.')))return;
  els.audio.pause();els.audio.removeAttribute('src');els.audio.load();if(state.objectUrl)URL.revokeObjectURL(state.objectUrl);state.objectUrl=null;sessionFiles.clear();for(const url of artworkCache.values())URL.revokeObjectURL(url);artworkCache.clear();
  await db.clearAll().catch(()=>{});state.tracks=[];state.currentId=null;state.queueIds=[];state.queueIndex=-1;try{localStorage.removeItem('mpf-state')}catch{}render();closeDialog(els.settingsDialog);toast('Biblioteca local vaciada');
}

function bindEvents(){
  [els.addFilesBtn,els.addFilesSide,els.emptyAddBtn,els.settingsAddFiles].forEach(b=>b?.addEventListener('click',pickFiles));
  [els.addFolderBtn,els.addFolderSide,els.settingsAddFolder].forEach(b=>b?.addEventListener('click',()=>importDirectoryHandle()));
  els.mobileAddBtn.addEventListener('click',pickFiles);
  els.fileInput.addEventListener('change',async()=>{await importFiles(els.fileInput.files);els.fileInput.value='';});
  els.folderInput.addEventListener('change',async()=>{await importFiles(els.folderInput.files,{title:'Importando carpeta…',pathFor:f=>folderFromFile(f)});els.folderInput.value='';});
  $$('.nav-item[data-view],.mobile-nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  els.searchInput.addEventListener('input',()=>{state.search=els.searchInput.value.trim();render();});
  els.sortSelect.addEventListener('change',()=>{state.sort=els.sortSelect.value;render();});
  els.rescanBtn.addEventListener('click',rescanDirectories);
  els.settingsBtn.addEventListener('click',()=>{capabilities();openDialog(els.settingsDialog)});els.mobileSettingsBtn.addEventListener('click',()=>{capabilities();openDialog(els.settingsDialog)});
  els.brandHome.addEventListener('click',()=>setView('all'));els.themeBtn.addEventListener('click',cycleTheme);
  els.miniOpen.addEventListener('click',async()=>{openDialog(els.playerDialog);await fx.ensure().catch(()=>{});});
  [els.playBtn,els.fullPlayBtn].forEach(b=>b.addEventListener('click',togglePlay));[els.prevBtn,els.fullPrevBtn].forEach(b=>b.addEventListener('click',prevTrack));[els.nextBtn,els.fullNextBtn].forEach(b=>b.addEventListener('click',()=>nextTrack(true)));
  els.miniProgress.addEventListener('input',()=>seekFromRange(els.miniProgress));els.fullProgress.addEventListener('input',()=>seekFromRange(els.fullProgress));
  els.volumeRange.addEventListener('input',()=>setVolume(els.volumeRange.value));els.muteBtn.addEventListener('click',toggleMute);
  els.shuffleBtn.addEventListener('click',toggleShuffle);els.repeatBtn.addEventListener('click',cycleRepeat);els.favoriteNowBtn.addEventListener('click',()=>state.currentId&&toggleFavorite(state.currentId));
  els.speedSelect.addEventListener('change',()=>setSpeed(els.speedSelect.value));els.sleepSelect.addEventListener('change',()=>setSleep(els.sleepSelect.value));els.openEqBtn.addEventListener('click',async()=>{await fx.ensure().catch(()=>{});openDialog(els.eqDialog);});
  [els.bassRange,els.midRange,els.trebleRange].forEach(r=>r.addEventListener('input',applyEqFromInputs));
  $$('[data-eq]').forEach(b=>b.addEventListener('click',()=>{const p={flat:[0,0,0],warm:[5,1,-2],bright:[-1,1,5],voice:[-3,5,2]}[b.dataset.eq]||[0,0,0];[els.bassRange.value,els.midRange.value,els.trebleRange.value]=p;state.settings.eq={bass:p[0],mid:p[1],treble:p[2]};updateEqLabels();fx.apply();persistState();}));
  els.rememberPosition.addEventListener('change',()=>{state.settings.rememberPosition=els.rememberPosition.checked;persistState()});els.autoNext.addEventListener('change',()=>{state.settings.autoNext=els.autoNext.checked;persistState()});els.normalizeToggle.addEventListener('change',async()=>{state.settings.normalize=els.normalizeToggle.checked;if(state.settings.normalize)await fx.ensure().catch(()=>{});fx.apply();persistState()});
  els.clearLibraryBtn.addEventListener('click',clearLibrary);els.cancelScanBtn.addEventListener('click',()=>{state.scanCancelled=true;toast('Deteniendo análisis…')});
  els.audio.addEventListener('timeupdate',()=>{updateProgressUI(); if(state.settings.rememberPosition && Math.floor(els.audio.currentTime)%10===0)persistState();});
  els.audio.addEventListener('play',()=>{state.playing=true;syncPlayerUI();if('mediaSession'in navigator)navigator.mediaSession.playbackState='playing';});
  els.audio.addEventListener('pause',()=>{state.playing=false;syncPlayerUI();persistState();if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';});
  els.audio.addEventListener('ended',()=>{state.playing=false;if(state.settings.autoNext)nextTrack(false);else syncPlayerUI();});
  els.audio.addEventListener('error',()=>{if(els.audio.src)toast('El formato de este audio no pudo reproducirse en este navegador',3800);});
  els.audio.addEventListener('loadedmetadata',updateProgressUI);els.audio.addEventListener('durationchange',updateProgressUI);
  ['dragenter','dragover'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropZone.classList.add('show','drag')}));
  ['dragleave','drop'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropZone.classList.remove('drag');if(state.tracks.length)els.dropZone.classList.remove('show')}));
  window.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)importFiles(e.dataTransfer.files,{title:'Importando archivos…'});});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;els.installBtn.classList.remove('is-hidden')});
  els.installBtn.addEventListener('click',async()=>{if(!state.installPrompt)return;state.installPrompt.prompt();await state.installPrompt.userChoice.catch(()=>{});state.installPrompt=null;els.installBtn.classList.add('is-hidden')});
  window.addEventListener('keydown',e=>{
    const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.code==='ArrowRight'){els.audio.currentTime=Math.min(els.audio.duration||Infinity,els.audio.currentTime+5)}else if(e.code==='ArrowLeft'){els.audio.currentTime=Math.max(0,els.audio.currentTime-5)}else if(e.key.toLowerCase()==='n')nextTrack(true);else if(e.key.toLowerCase()==='p')prevTrack();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if(state.theme==='auto')applyTheme()});
  window.addEventListener('beforeunload',()=>{persistState();});
}

async function restoreCurrent(){
  if(!state.currentId)return; const t=state.tracks.find(x=>x.id===state.currentId); if(!t){state.currentId=null;return;} syncPlayerUI(); updatePlayerArtwork(t); // no autoplay
}
async function registerSW(){
  if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
  try{await navigator.serviceWorker.register('./sw.js',{scope:'./'});}catch(err){console.warn('SW registration skipped',err);}
}
async function requestPersistence(){try{if(navigator.storage?.persist)await navigator.storage.persist();}catch{}}

async function init(){
  els.buildVersion.textContent=BUILD; loadLocalState(); applyTheme(); bindEvents(); setupMediaSession();
  try{await db.init();}catch(err){console.warn('IndexedDB unavailable',err);toast('Biblioteca persistente no disponible; la sesión seguirá funcionando',4200);}
  await loadLibrary(); els.audio.volume=state.volume;els.audio.playbackRate=state.speed; syncPlayerUI(); await restoreCurrent();
  registerSW(); requestPersistence(); capabilities();
  setTimeout(()=>{els.splash.classList.add('hide');els.app.classList.remove('is-hidden');setTimeout(()=>els.splash.remove(),500);},1500);
}

init().catch(err=>{
  console.error('Fatal init error',err);
  els.splash?.classList.add('hide'); els.app?.classList.remove('is-hidden');
  setTimeout(()=>toast('La app inició en modo seguro. Revisa permisos del navegador.',5000),300);
});

})();
