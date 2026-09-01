(() => {
'use strict';

const BUILD = '2026.08.31-r8-smart-library';
const DB_NAME = 'mpf-minimal-db';
const DB_VERSION = 3;
const PLAYABLE_SOURCES = new Set(['local','direct','youtube','soundcloud','youtube-playlist']);
const MEDIA_EXT = new Set(['mp3','m4a','aac','wav','ogg','oga','opus','flac','webm','mp4','m4v','mov','3gp','wma','wmv','avi','mkv']);
const VIDEO_EXT = new Set(['mp4','m4v','mov','3gp','webm','wmv','avi','mkv']);
const SMART_IDS = Object.freeze({favorites:'smart:favorites',most:'smart:most',recent:'smart:recent',repeat:'smart:repeat'});
const DAY = 86400000;
const TEST_PLAYLISTS = [
  {label:'Prueba 1', url:'https://music.youtube.com/playlist?list=PLW4RwQaj-mTI&si=l26Th21Desx8XOty'},
  {label:'Prueba 2', url:'https://music.youtube.com/playlist?list=PLkFMTdwrLz-QR3GTfoYApADfo_u0a6yjc&si=3vT1gyOGPzA-nYZY'},
  {label:'Prueba 3', url:'https://music.youtube.com/playlist?list=PLbeLb9mBGU24&si=c47-iJJYVcKiz94e'}
];
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => Date.now();

const els = {
  intro: $('#intro'), app: $('#app'), audio: $('#audio'),
  homeBtn: $('#homeBtn'), installBtn: $('#installBtn'), updateBtn: $('#updateBtn'), moreBtn: $('#moreBtn'),
  homeView: $('#homeView'), libraryView: $('#libraryView'), playlistView: $('#playlistView'),
  loadAction: $('#loadAction'), playAction: $('#playAction'), playlistAction: $('#playlistAction'), mixAction: $('#mixAction'),
  loadFilesQuick: $('#loadFilesQuick'), loadFolderQuick: $('#loadFolderQuick'), loadLinkQuick: $('#loadLinkQuick'), openLibraryQuick: $('#openLibraryQuick'), createPlaylistQuick: $('#createPlaylistQuick'),
  countTracks: $('#countTracks'), countPlaylists: $('#countPlaylists'), countFavorites: $('#countFavorites'), countMost: $('#countMost'), listenTimeHome: $('#listenTimeHome'), favoritesShortcut: $('#favoritesShortcut'), mostPlayedShortcut: $('#mostPlayedShortcut'),
  libraryAddBtn: $('#libraryAddBtn'), libraryFavoritesBtn: $('#libraryFavoritesBtn'), createFromLibraryBtn: $('#createFromLibraryBtn'), searchInput: $('#searchInput'), genreChips: $('#genreChips'),
  libraryEmpty: $('#libraryEmpty'), libraryList: $('#libraryList'), emptyLoadBtn: $('#emptyLoadBtn'),
  playlistHubHead: $('#playlistHubHead'), playlistHub: $('#playlistHub'), playlistHubEmpty: $('#playlistHubEmpty'), playlistDetail: $('#playlistDetail'), playlistList: $('#playlistList'), playlistEmpty: $('#playlistEmpty'),
  playlistDetailBack: $('#playlistDetailBack'), playlistDetailTitle: $('#playlistDetailTitle'), playlistDetailMeta: $('#playlistDetailMeta'), playlistMenuBtn: $('#playlistMenuBtn'), playlistSources: $('#playlistSources'),
  newPlaylistBtn: $('#newPlaylistBtn'), importPlaylistBtn: $('#importPlaylistBtn'), emptyNewPlaylistBtn: $('#emptyNewPlaylistBtn'), emptyImportPlaylistBtn: $('#emptyImportPlaylistBtn'), openLibraryFromPlaylists: $('#openLibraryFromPlaylists'), addLinkToPlaylistBtn: $('#addLinkToPlaylistBtn'), playPlaylistBtn: $('#playPlaylistBtn'), mixPlaylistBtn: $('#mixPlaylistBtn'),
  miniPlayer: $('#miniPlayer'), miniOpen: $('#miniOpen'), miniTitle: $('#miniTitle'), miniArtist: $('#miniArtist'), miniFavoriteBtn: $('#miniFavoriteBtn'),
  playBtn: $('#playBtn'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'),
  playerDialog: $('#playerDialog'), fullTitle: $('#fullTitle'), fullArtist: $('#fullArtist'), progressRange: $('#progressRange'), timeNow: $('#timeNow'), timeTotal: $('#timeTotal'),
  fullPlayBtn: $('#fullPlayBtn'), fullPrevBtn: $('#fullPrevBtn'), fullNextBtn: $('#fullNextBtn'), shuffleBtn: $('#shuffleBtn'), favoriteBtn: $('#favoriteBtn'), volumeRange: $('#volumeRange'), addCurrentToPlaylist: $('#addCurrentToPlaylist'),
  sheetDialog: $('#sheetDialog'), sheetContent: $('#sheetContent'),
  remoteDock: $('#remoteDock'), remoteStage: $('#remoteStage'), remoteLabel: $('#remoteLabel'), ytProbeHost: $('#ytProbeHost'),
  dropHint: $('#dropHint'), loader: $('#loader'), loaderTitle: $('#loaderTitle'), loaderText: $('#loaderText'), toast: $('#toast'),
  fileInput: $('#fileInput'), folderInput: $('#folderInput'), backupInput: $('#backupInput'), m3uInput: $('#m3uInput')
};

const sessionFiles = new Map();
let ytApiPromise = null;
let ytPlayer = null;
let ytProbePlayer = null;
let ytProgressTimer = null;
let scApiPromise = null;
let scWidget = null;
let scProgressTimer = null;

const state = {
  tracks: [], playlists: [], activeView: 'home', activeGenre: 'all', activePlaylistId: '', playlistDetailOpen: false,
  currentId: null, queueIds: [], queueIndex: -1, playing: false, shuffle: false,
  volume: 0.92, search: '', theme: 'dark', objectUrl: null, installPrompt: null, storageReady: false,
  swRegistration: null, updateAvailable: false, remoteBuild: null, lastUpdateCheck: 0, refreshingForUpdate: false,
  currentEngine: 'none', activeSmartId: '', listenSession: null, history: [], renderChunk: 70
};

const db = {
  instance: null,
  async init(){
    if(!('indexedDB' in window)) return false;
    this.instance = await new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if(!d.objectStoreNames.contains('tracks')) d.createObjectStore('tracks',{keyPath:'id'});
        if(!d.objectStoreNames.contains('sources')) d.createObjectStore('sources',{keyPath:'id'});
        if(!d.objectStoreNames.contains('playlists')) d.createObjectStore('playlists',{keyPath:'id'});
        if(!d.objectStoreNames.contains('prefs')) d.createObjectStore('prefs',{keyPath:'key'});
        if(!d.objectStoreNames.contains('history')) d.createObjectStore('history',{keyPath:'id',autoIncrement:true});
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error);
    });
    return true;
  },
  tx(store, mode='readonly'){ return this.instance.transaction(store,mode).objectStore(store); },
  req(req){ return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);}); },
  async getAll(store){ if(!this.instance) return []; return this.req(this.tx(store).getAll()); },
  async get(store,key){ if(!this.instance) return null; return this.req(this.tx(store).get(key)); },
  async put(store,val){ if(!this.instance) return false; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');tx.objectStore(store).put(val);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);}); },
  async delete(store,key){ if(!this.instance) return; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);}); }
};

function extOf(name){ const i=(name||'').lastIndexOf('.'); return i<0?'':name.slice(i+1).toLowerCase(); }
function isMediaFile(file){ return (file.type||'').startsWith('audio/') || (file.type||'').startsWith('video/') || MEDIA_EXT.has(extOf(file.name||'')); }
function cleanName(name){ return (name||'').replace(/\.[^.]+$/,'').replace(/[_.]+/g,' ').replace(/\s+/g,' ').trim(); }
function formatTime(sec){ if(!Number.isFinite(sec)||sec<0) return '0:00'; sec=Math.floor(sec); return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`; }
function safeText(s){ return String(s??'').replace(/[<>]/g,''); }
function remoteHash(raw){ let h=0x811c9dc5; for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,0x01000193);} return (h>>>0).toString(16); }
function hashId(file){ return `t_${remoteHash(`${file.name}|${file.size}|${file.lastModified}`)}_${file.size}`; }
function toast(msg,ms=2600){ els.toast.textContent=msg;els.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('show'),ms); }
function openDialog(d){ try{d.showModal();}catch{d.setAttribute('open','');} }
function closeDialog(d){ try{d.close();}catch{d.removeAttribute('open');} }
function showLoader(title='Procesando…',text='Un momento'){els.loaderTitle.textContent=title;els.loaderText.textContent=text;els.loader.classList.remove('is-hidden');}
function hideLoader(){els.loader.classList.add('is-hidden');}
function sourceLabel(track){ return ({local:'LOCAL',direct:'LINK',youtube:'YOUTUBE',soundcloud:'SOUNDCLOUD','youtube-playlist':'YOUTUBE',external:'ENLACE'})[track.sourceKind||'local']||'LOCAL'; }
function sourceClass(track){ return (track.sourceKind||'local').replace('-playlist',''); }
function normalizeTrack(t){
  const legacyPlays=Number(t.playCount)||0;
  return {...t,sourceKind:t.sourceKind||'local',favorite:!!t.favorite,playCount:legacyPlays,
    starts:Number(t.starts ?? legacyPlays)||0,validPlays:Number(t.validPlays ?? 0)||0,completedPlays:Number(t.completedPlays)||0,legacyPlayCount:Number(t.legacyPlayCount ?? legacyPlays)||0,
    listenedMs:Number(t.listenedMs)||0,skipCount:Number(t.skipCount)||0,replayCount:Number(t.replayCount)||0,
    lastStarted:Number(t.lastStarted)||0,lastPlayed:Number(t.lastPlayed)||0,lastValidAt:Number(t.lastValidAt)||0,lastCompleted:Number(t.lastCompleted)||0,
    sourceMissing:!!t.sourceMissing};
}
function normalizePlaylist(pl){
  const sources=Array.isArray(pl.sources)?pl.sources.filter(Boolean):[];
  if(pl.externalRef&&!sources.some(s=>s.playlistId&&s.playlistId===pl.externalRef.playlistId)){
    sources.push({id:`src_${remoteHash(pl.externalRef.url||pl.externalRef.playlistId||String(pl.id))}`,source:pl.externalRef.source||'YouTube',url:pl.externalRef.url||'',originalUrl:pl.externalRef.originalUrl||pl.externalRef.url||'',playlistId:pl.externalRef.playlistId||'',status:pl.importDiagnostic?.status||'linked',count:Number(pl.importDiagnostic?.count)||0,message:pl.importDiagnostic?.message||'',addedAt:pl.createdAt||now()});
  }
  return {...pl,trackIds:Array.from(new Set(pl.trackIds||[])),sources,createdAt:Number(pl.createdAt)||now()};
}
function playable(track){ return !!track && PLAYABLE_SOURCES.has(track.sourceKind||'local') && !(track.sourceKind==='local'&&track.sourceMissing); }

function decodeText(bytes,encoding){
  try{
    if(encoding===0)return new TextDecoder('iso-8859-1').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===3)return new TextDecoder('utf-8').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===2)return new TextDecoder('utf-16be').decode(bytes).replace(/\0/g,'').trim();
    if(encoding===1){if(bytes[0]===0xff&&bytes[1]===0xfe)return new TextDecoder('utf-16le').decode(bytes.slice(2)).replace(/\0/g,'').trim();return new TextDecoder('utf-16le').decode(bytes).replace(/\0/g,'').trim();}
  }catch{}
  return '';
}
function synchsafe(a,b,c,d){return(a<<21)|(b<<14)|(c<<7)|d;}
function u32(b,o){return((b[o]<<24)>>>0)|(b[o+1]<<16)|(b[o+2]<<8)|b[o+3];}
async function parseAudioTags(file){
  const out={};
  try{
    const buf=await file.slice(0,Math.min(file.size,2_000_000)).arrayBuffer();const b=new Uint8Array(buf);
    if(b.length>=10&&b[0]===73&&b[1]===68&&b[2]===51){
      const ver=b[3],tagSize=synchsafe(b[6],b[7],b[8],b[9]);let pos=10,end=Math.min(b.length,10+tagSize);
      while(pos+10<=end){const id=String.fromCharCode(b[pos],b[pos+1],b[pos+2],b[pos+3]);if(!/^[A-Z0-9]{4}$/.test(id))break;const size=ver===4?synchsafe(b[pos+4],b[pos+5],b[pos+6],b[pos+7]):u32(b,pos+4);if(!size)break;const data=b.slice(pos+10,Math.min(pos+10+size,end));if(['TIT2','TPE1','TALB','TCON'].includes(id)&&data.length>1){const v=decodeText(data.slice(1),data[0]);if(id==='TIT2')out.title=v;if(id==='TPE1')out.artist=v;if(id==='TALB')out.album=v;if(id==='TCON')out.genre=v.replace(/\(\d+\)/g,'').trim();}pos+=10+size;}
    }
  }catch{}
  return out;
}
async function getDuration(file,timeout=5000){return new Promise(resolve=>{const a=document.createElement('audio'),url=URL.createObjectURL(file);let done=false;const finish=v=>{if(done)return;done=true;URL.revokeObjectURL(url);a.src='';resolve(Number.isFinite(v)?v:0);};const t=setTimeout(()=>finish(0),timeout);a.onloadedmetadata=()=>{clearTimeout(t);finish(a.duration)};a.onerror=()=>{clearTimeout(t);finish(0)};a.preload='metadata';a.src=url;});}

function makeTrack(file,meta={}){return normalizeTrack({id:hashId(file),fileName:file.name,title:meta.title||cleanName(file.name)||'Sin título',artist:meta.artist||'Desconocido',album:meta.album||'',genre:meta.genre||'',duration:Number(meta.duration)||0,size:file.size,type:file.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:'local',sourceMissing:false,mediaKind:VIDEO_EXT.has(extOf(file.name))?'video':'audio'});}
function makeRemoteTrack(kind,url,extra={}){const remoteId=extra.remoteId||remoteHash(url);return normalizeTrack({id:extra.id||`${kind}_${remoteId}`,fileName:'',title:extra.title||`${kind==='youtube'?'YouTube':kind==='soundcloud'?'SoundCloud':'Enlace'} · ${remoteId.slice(0,8)}`,artist:extra.artist||({youtube:'YouTube',soundcloud:'SoundCloud',direct:'Enlace directo',external:'Fuente externa','youtube-playlist':'YouTube'})[kind]||'Enlace',album:extra.album||'',genre:extra.genre||'',duration:Number(extra.duration)||0,size:0,type:extra.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:kind,remoteUrl:url,remoteId,thumbnail:extra.thumbnail||'',mediaKind:extra.mediaKind||'audio',...extra});}

async function saveTrackAndSource(track,file=null){
  track=normalizeTrack(track);
  if(file)track.sourceMissing=false;
  const idx=state.tracks.findIndex(t=>t.id===track.id);
  if(idx>=0){
    const prev=normalizeTrack(state.tracks[idx]);
    track=normalizeTrack({...prev,...track,favorite:!!(prev.favorite||track.favorite),starts:Math.max(prev.starts||0,track.starts||0),validPlays:Math.max(prev.validPlays||0,track.validPlays||0),completedPlays:Math.max(prev.completedPlays||0,track.completedPlays||0),listenedMs:Math.max(prev.listenedMs||0,track.listenedMs||0),skipCount:Math.max(prev.skipCount||0,track.skipCount||0),replayCount:Math.max(prev.replayCount||0,track.replayCount||0),lastStarted:Math.max(prev.lastStarted||0,track.lastStarted||0),lastPlayed:Math.max(prev.lastPlayed||0,track.lastPlayed||0),lastValidAt:Math.max(prev.lastValidAt||0,track.lastValidAt||0),lastCompleted:Math.max(prev.lastCompleted||0,track.lastCompleted||0),addedAt:prev.addedAt||track.addedAt});
    state.tracks[idx]=track;
  }else state.tracks.push(track);
  if(file)sessionFiles.set(track.id,file);
  if(state.storageReady){await db.put('tracks',track).catch(()=>{});if(file)await db.put('sources',{id:track.id,blob:file,name:file.name,type:file.type,lastModified:file.lastModified}).catch(()=>{});}
}
async function saveRemoteTrack(track){await saveTrackAndSource(track,null);return track;}
async function loadStoredData(){
  if(state.storageReady){
    state.tracks=(await db.getAll('tracks')).map(normalizeTrack).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    state.playlists=(await db.getAll('playlists')).map(normalizePlaylist).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    state.history=(await db.getAll('history')).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,2500);
    const p=await db.get('prefs','ui');
    if(p){state.currentId=p.currentId||null;state.queueIds=p.queueIds||[];state.queueIndex=Number.isInteger(p.queueIndex)?p.queueIndex:-1;state.volume=Number.isFinite(p.volume)?p.volume:.92;state.activePlaylistId=p.activePlaylistId||'';state.activeSmartId=p.activeSmartId||'';state.theme=p.theme||'dark';}
    // R8 preserves R7 playCount as legacy starts; it does not pretend those starts were complete/valid listens.
    for(const t of state.tracks){await db.put('tracks',normalizeTrack(t)).catch(()=>{});}
  }
  ensureBasePlaylist();
}
function ensureBasePlaylist(){
  // R6: las playlists son un repositorio real. No se crea una lista vacía automática en instalaciones nuevas.
  if(state.playlists.length && !state.playlists.some(p=>p.id===state.activePlaylistId)) state.activePlaylistId=state.playlists[0].id;
  if(!state.playlists.length) state.activePlaylistId='';
}
async function persistPrefs(){if(!state.storageReady)return;await db.put('prefs',{key:'ui',currentId:state.currentId,queueIds:state.queueIds,queueIndex:state.queueIndex,volume:state.volume,activePlaylistId:state.activePlaylistId,activeSmartId:state.activeSmartId,theme:state.theme}).catch(()=>{});}
async function persistPlaylist(pl){if(state.storageReady)await db.put('playlists',pl).catch(()=>{});}

function getFilteredTracks(){let list=[...state.tracks];const q=state.search.trim().toLowerCase();if(q)list=list.filter(t=>[t.title,t.artist,t.album,t.genre,t.fileName,t.remoteUrl,sourceLabel(t)].join(' ').toLowerCase().includes(q));if(state.activeGenre!=='all')list=list.filter(t=>(t.genre||sourceLabel(t))===state.activeGenre);return list.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));}
function getCurrentTrack(){return state.tracks.find(t=>t.id===state.currentId)||null;}
function getActivePlaylist(){return state.playlists.find(p=>p.id===state.activePlaylistId)||null;}
function getPlaylistTracks(pl){return(pl?.trackIds||[]).map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);}
function genres(){const c=new Map();for(const t of state.tracks){const g=t.genre||sourceLabel(t);c.set(g,(c.get(g)||0)+1);}return[['all','Todo'],...[...c.entries()].sort((a,b)=>b[1]-a[1]).map(([g])=>[g,g])];}


function formatListenTime(ms){
  const mins=Math.floor((Number(ms)||0)/60000);
  if(mins<60)return `${mins}m`;
  const h=Math.floor(mins/60),m=mins%60;return m?`${h}h ${m}m`:`${h}h`;
}
function smartScore(t){
  const ageDays=t.lastPlayed?Math.max(0,(now()-t.lastPlayed)/DAY):365;
  const recency=Math.max(0,10-Math.min(10,ageDays/3));
  return (t.completedPlays||0)*5+(t.validPlays||0)*3+(t.replayCount||0)*4+(t.favorite?8:0)+recency-(t.skipCount||0)*2;
}
function getSmartTracks(id){
  const playableTracks=state.tracks.filter(playable);
  if(id===SMART_IDS.favorites)return playableTracks.filter(t=>t.favorite).sort((a,b)=>(b.lastPlayed||b.addedAt||0)-(a.lastPlayed||a.addedAt||0));
  if(id===SMART_IDS.most)return playableTracks.filter(t=>(t.validPlays||0)>0||(t.completedPlays||0)>0||(t.replayCount||0)>0).sort((a,b)=>smartScore(b)-smartScore(a)).slice(0,100);
  if(id===SMART_IDS.recent)return playableTracks.filter(t=>t.lastPlayed>0).sort((a,b)=>b.lastPlayed-a.lastPlayed).slice(0,100);
  if(id===SMART_IDS.repeat)return playableTracks.filter(t=>(t.replayCount||0)>0 && (now()-(t.lastPlayed||0))<45*DAY).sort((a,b)=>(b.replayCount-a.replayCount)||((b.lastPlayed||0)-(a.lastPlayed||0))).slice(0,100);
  return [];
}
function smartMeta(id){
  const map={
    [SMART_IDS.favorites]:{name:'Favoritos',icon:'♥',subtitle:'Marcadas por ti'},
    [SMART_IDS.most]:{name:'+ Escuchadas',icon:'🔥',subtitle:'Lo que realmente escuchas'},
    [SMART_IDS.recent]:{name:'Recientes',icon:'◷',subtitle:'Últimas reproducciones'},
    [SMART_IDS.repeat]:{name:'En repetición',icon:'↻',subtitle:'A las que vuelves'}
  };return map[id]||{name:'Lista automática',icon:'✦',subtitle:'MUSIC PLAY'};
}
async function recordHistory(type,track,extra={}){
  if(!track)return;
  const evt={ts:now(),type,trackId:track.id,title:track.title,artist:track.artist||'',sourceKind:track.sourceKind||'local',...extra};
  state.history.unshift(evt);if(state.history.length>2500)state.history.length=2500;
  if(state.storageReady)db.add('history',evt).catch(()=>{});
}
function validListenThreshold(duration){return duration>0?Math.min(30,Math.max(8,duration*.25)):20;}
async function beginListenSession(track){
  if(!track)return;
  track.starts=(track.starts||0)+1;track.lastStarted=now();
  state.listenSession={trackId:track.id,startTs:now(),lastPosition:0,duration:track.duration||0,accumulatedMs:0,committedMs:0,validMarked:false,completed:false};
  await saveRemoteTrack(track);recordHistory('start',track);
}
function sampleListenSession(current,duration){
  const s=state.listenSession;if(!s||s.trackId!==state.currentId||!Number.isFinite(current))return;
  if(Number.isFinite(duration)&&duration>0)s.duration=duration;
  const delta=current-(s.lastPosition||0);if(delta>=0&&delta<=8)s.accumulatedMs+=delta*1000;s.lastPosition=current;
  const track=getCurrentTrack();if(!track)return;
  const threshold=validListenThreshold(s.duration);
  if(!s.validMarked&&s.accumulatedMs>=threshold*1000){
    s.validMarked=true;track.validPlays=(track.validPlays||0)+1;track.playCount=track.validPlays;track.lastPlayed=now();
    if(track.lastValidAt&&now()-track.lastValidAt<7*DAY)track.replayCount=(track.replayCount||0)+1;
    track.lastValidAt=now();saveRemoteTrack(track);recordHistory('valid',track,{listenedMs:Math.round(s.accumulatedMs)});
  }
  if(!s.completed&&s.duration>0&&current/s.duration>=.85){
    s.completed=true;if(!s.validMarked){s.validMarked=true;track.validPlays=(track.validPlays||0)+1;track.playCount=track.validPlays;track.lastPlayed=now();if(track.lastValidAt&&now()-track.lastValidAt<7*DAY)track.replayCount=(track.replayCount||0)+1;track.lastValidAt=now();recordHistory('valid',track,{listenedMs:Math.round(s.accumulatedMs)});}
    track.completedPlays=(track.completedPlays||0)+1;track.lastCompleted=now();saveRemoteTrack(track);recordHistory('complete',track,{ratio:current/s.duration});
  }
  if(s.accumulatedMs-s.committedMs>=15000){const diff=s.accumulatedMs-s.committedMs;track.listenedMs=(track.listenedMs||0)+diff;s.committedMs=s.accumulatedMs;saveRemoteTrack(track);}
}
async function finalizeListenSession(reason='switch'){
  const s=state.listenSession;if(!s)return;const track=state.tracks.find(t=>t.id===s.trackId);state.listenSession=null;if(!track)return;
  const remain=Math.max(0,s.accumulatedMs-s.committedMs);track.listenedMs=(track.listenedMs||0)+remain;
  const threshold=validListenThreshold(s.duration);
  if(!s.completed&&['switch','manual','previous'].includes(reason)&&s.accumulatedMs<Math.min(15000,threshold*1000*.65)){
    track.skipCount=(track.skipCount||0)+1;recordHistory('skip',track,{listenedMs:Math.round(s.accumulatedMs),reason});
  }
  await saveRemoteTrack(track);
}
async function handleNaturalEnd(){sampleListenSession(state.listenSession?.duration||0,state.listenSession?.duration||0);await finalizeListenSession('ended');state.playing=false;await nextTrack({skipFinalize:true});}
function totalListenedMs(){return state.tracks.reduce((sum,t)=>sum+(Number(t.listenedMs)||0),0);}
function smartMixOrder(trackIds){
  const pool=[...new Set(trackIds)].map(id=>state.tracks.find(t=>t.id===id)).filter(playable);if(!pool.length)return[];
  const weighted=pool.map(t=>({t,score:Math.max(.25,smartScore(t)+4)*(.72+Math.random()*.65)})).sort((a,b)=>b.score-a.score).map(x=>x.t.id);
  const discovery=pool.filter(t=>(t.validPlays||0)===0&&!t.favorite).sort(()=>Math.random()-.5).slice(0,Math.max(1,Math.floor(pool.length*.15))).map(t=>t.id);
  return [...new Set([...weighted.slice(0,Math.max(1,weighted.length-discovery.length)),...discovery])];
}

function showView(name){
  state.activeView=name;
  if(name!=='playlist') state.playlistDetailOpen=false;
  [els.homeView,els.libraryView,els.playlistView].forEach(v=>v.classList.remove('active'));
  ({home:els.homeView,library:els.libraryView,playlist:els.playlistView})[name]?.classList.add('active');
  render();
}
function renderSummary(){const fav=getSmartTracks(SMART_IDS.favorites),most=getSmartTracks(SMART_IDS.most);els.countTracks.textContent=state.tracks.length;els.countPlaylists.textContent=state.playlists.length;els.countFavorites.textContent=fav.length;els.countMost.textContent=most.length;els.listenTimeHome.textContent=formatListenTime(totalListenedMs());}
function renderGenres(){els.genreChips.innerHTML='';for(const[value,label]of genres()){const b=document.createElement('button');b.className=`chip${state.activeGenre===value?' active':''}`;b.textContent=label;b.onclick=()=>{state.activeGenre=value;renderLibrary();};els.genreChips.appendChild(b);}}
function makeTrackRow(track,options={fromPlaylist:false}){
  const row=document.createElement('div');row.className=`track-row${track.id===state.currentId?' active':''}`;row.dataset.id=track.id;
  const source=sourceLabel(track),sub=[track.artist,track.album].filter(Boolean).join(' · ')||track.genre||track.remoteUrl||'Audio local';
  const sourceBadge=track.sourceMissing?'<span class="source-badge missing">FALTA ARCHIVO</span>':`<span class="source-badge ${sourceClass(track)}">${source}</span>`;
  row.innerHTML=`<div class="track-backdrop"><span>→ Cola</span><span>${options.fromPlaylist?'Quitar ←':'Eliminar ←'}</span></div><div class="track-front"><div class="track-art">${track.sourceKind==='youtube'?'▶':track.sourceKind==='soundcloud'?'☁':'♪'}</div><div class="track-text"><div class="track-title">${safeText(track.title)}</div><div class="track-sub">${safeText(sub)}</div></div><div class="track-meta"><span class="track-time">${track.duration?formatTime(track.duration):''}</span><div class="badges">${sourceBadge}${track.replayCount?`<span class="badge">↻ ${track.replayCount}</span>`:''}</div></div><div class="row-actions"><button class="row-quick row-heart${track.favorite?' active':''}" title="${track.favorite?'Quitar favorito':'Favorito'}">${track.favorite?'♥':'♡'}</button><button class="row-quick ${options.fromPlaylist?'row-more':'row-add-pl'}" title="${options.fromPlaylist?'Opciones':'Añadir a playlist'}">${options.fromPlaylist?'⋯':'＋'}</button></div></div>`;
  const front=$('.track-front',row);bindSwipe(front,track,options);
  front.addEventListener('click',e=>{if(e.target.closest('.row-actions'))return;if(playable(track))playTrack(track.id,options.fromPlaylist?(state.activeSmartId?getSmartTracks(state.activeSmartId).map(t=>t.id):(getActivePlaylist()?.trackIds||[])):getFilteredTracks().filter(playable).map(t=>t.id));else openTrackSheet(track,options);});
  $('.row-heart',row).addEventListener('click',e=>{e.stopPropagation();toggleFavorite(track.id);});
  const q=options.fromPlaylist?$('.row-more',row):$('.row-add-pl',row);if(q)q.addEventListener('click',e=>{e.stopPropagation();options.fromPlaylist?openTrackSheet(track,options):openPlaylistPickerSheet(track.id);});
  front.addEventListener('contextmenu',e=>{e.preventDefault();openTrackSheet(track,options);});let pt=0;front.addEventListener('pointerdown',e=>{if(e.target.closest('.row-actions'))return;pt=setTimeout(()=>openTrackSheet(track,options),520)},{passive:true});['pointerup','pointercancel','pointerleave'].forEach(ev=>front.addEventListener(ev,()=>clearTimeout(pt),{passive:true}));return row;
}
function bindSwipe(front,track,options={}){let sx=0,d=0,active=false;const end=()=>{if(!active)return;active=false;front.style.transition='transform .16s ease';if(d>86)queueTrack(track.id);else if(d<-86){if(options.smart){if(state.activeSmartId===SMART_IDS.favorites&&track.favorite)toggleFavorite(track.id);else toast('Las listas automáticas se actualizan solas');}else options.fromPlaylist?removeFromPlaylist(track.id,state.activePlaylistId):removeTrack(track.id);}front.style.transform='translateX(0)';setTimeout(()=>front.style.transition='',180);};front.addEventListener('pointerdown',e=>{active=true;d=0;sx=e.clientX},{passive:true});front.addEventListener('pointermove',e=>{if(!active)return;d=Math.max(-120,Math.min(120,e.clientX-sx));if(Math.abs(d)>6)front.style.transform=`translateX(${d}px)`},{passive:true});front.addEventListener('pointerup',end);front.addEventListener('pointercancel',end);}
function renderRowsChunked(container,list,options={}){container.innerHTML='';let shown=0;const add=()=>{const end=Math.min(list.length,shown+state.renderChunk);for(let i=shown;i<end;i++)container.appendChild(makeTrackRow(list[i],options));shown=end;more?.remove();if(shown<list.length){more=document.createElement('button');more.className='load-more';more.textContent=`Ver ${Math.min(state.renderChunk,list.length-shown)} más`;more.onclick=add;container.appendChild(more);}};let more=null;add();}
function renderLibrary(){renderGenres();const list=getFilteredTracks();els.libraryEmpty.classList.toggle('is-hidden',list.length>0);els.libraryList.classList.toggle('is-hidden',list.length===0);renderRowsChunked(els.libraryList,list);}
function renderPlaylists(){
  const hasManual=state.playlists.length>0;
  els.playlistHubHead.classList.toggle('is-hidden',state.playlistDetailOpen);
  els.playlistHub.classList.toggle('is-hidden',state.playlistDetailOpen);
  els.playlistHubEmpty.classList.add('is-hidden');
  els.playlistDetail.classList.toggle('is-hidden',!state.playlistDetailOpen);
  els.playlistHub.innerHTML='';

  if(!state.playlistDetailOpen){
    const smartTitle=document.createElement('div');smartTitle.className='playlist-section-label';smartTitle.textContent='AUTOMÁTICAS';els.playlistHub.appendChild(smartTitle);
    [SMART_IDS.favorites,SMART_IDS.most,SMART_IDS.recent,SMART_IDS.repeat].forEach(id=>{
      const meta=smartMeta(id),tracks=getSmartTracks(id),card=document.createElement('button');card.className=`playlist-card smart-playlist-card ${id.split(':')[1]}`;card.type='button';
      card.innerHTML=`<span class="playlist-card-icon">${meta.icon}</span><span class="playlist-card-copy"><strong>${meta.name}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${meta.subtitle}</small></span><span class="playlist-card-go">›</span>`;
      card.onclick=()=>openSmartCollection(id);els.playlistHub.appendChild(card);
    });
    const ownTitle=document.createElement('div');ownTitle.className='playlist-section-label own';ownTitle.textContent='MIS LISTAS';els.playlistHub.appendChild(ownTitle);
    if(!hasManual){const empty=document.createElement('div');empty.className='playlist-inline-empty';empty.innerHTML='<span>≡</span><div><strong>Aún no tienes listas propias</strong><small>Crea una o importa una playlist por enlace.</small></div>';els.playlistHub.appendChild(empty);return;}
    state.playlists.forEach(pl=>{
      const tracks=getPlaylistTracks(pl),sourceCount=(pl.sources||[]).length,linked=(pl.sources||[]).some(src=>src.status==='linked'),imported=(pl.sources||[]).some(src=>src.status==='imported');
      const card=document.createElement('button');card.className='playlist-card';card.type='button';const sourceText=sourceCount?`${sourceCount} fuente${sourceCount===1?'':'s'}${linked?' · pendiente':''}`:'Propia';
      card.innerHTML=`<span class="playlist-card-icon">${imported||linked?'🔗':'≡'}</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${safeText(sourceText)}</small></span><span class="playlist-card-go">›</span>`;card.onclick=()=>openPlaylistDetail(pl.id);els.playlistHub.appendChild(card);
    });return;
  }

  if(state.activeSmartId){
    const meta=smartMeta(state.activeSmartId),tracks=getSmartTracks(state.activeSmartId);els.playlistDetailTitle.textContent=meta.name;els.playlistDetailMeta.textContent=`AUTOMÁTICA · ${tracks.length} ${tracks.length===1?'CANCIÓN':'CANCIONES'}`;
    els.playlistMenuBtn.classList.add('is-hidden');els.openLibraryFromPlaylists.classList.add('is-hidden');els.addLinkToPlaylistBtn.classList.add('is-hidden');els.playlistSources.classList.add('is-hidden');els.playlistSources.innerHTML='';
    els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0);els.playlistEmpty.querySelector('h3').textContent=`${meta.name} está vacía`;els.playlistEmpty.querySelector('p').textContent=state.activeSmartId===SMART_IDS.favorites?'Toca ♡ en una canción para guardarla aquí.':'MUSIC PLAY irá construyendo esta lista mientras escuchas.';
    els.playlistList.classList.toggle('is-hidden',tracks.length===0);renderRowsChunked(els.playlistList,tracks,{fromPlaylist:true,smart:true});return;
  }

  els.playlistMenuBtn.classList.remove('is-hidden');els.openLibraryFromPlaylists.classList.remove('is-hidden');els.addLinkToPlaylistBtn.classList.remove('is-hidden');
  const pl=getActivePlaylist();if(!pl){state.playlistDetailOpen=false;return renderPlaylists();}
  const tracks=getPlaylistTracks(pl),sources=pl.sources||[];els.playlistDetailTitle.textContent=pl.name;els.playlistDetailMeta.textContent=`${tracks.length} ${tracks.length===1?'CANCIÓN':'CANCIONES'}${sources.length?` · ${sources.length} FUENTE${sources.length===1?'':'S'}`:''}`;
  els.playlistEmpty.querySelector('h3').textContent='Playlist vacía';els.playlistEmpty.querySelector('p').textContent='Añade canciones de tu biblioteca o importa un enlace.';
  els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0||sources.length>0);els.playlistList.classList.toggle('is-hidden',tracks.length===0);renderRowsChunked(els.playlistList,tracks,{fromPlaylist:true});
  els.playlistSources.innerHTML='';els.playlistSources.classList.toggle('is-hidden',sources.length===0);sources.forEach((src,index)=>{const c=document.createElement('div');c.className='playlist-source-card';const status=src.status==='imported'?'Importada':src.status==='linked'?'Enlazada':'Fuente';c.innerHTML=`<div class="playlist-source-main"><span class="source-dot">${src.source==='YouTube'?'▶':'🔗'}</span><div><strong>${safeText(src.source||'Enlace')}</strong><small>${status}${src.count?` · ${src.count} elementos`:''}</small></div></div><div class="playlist-source-actions">${src.source==='YouTube'?'<button class="tiny-btn" data-source-play>▶</button>':''}${src.status==='linked'&&src.source==='YouTube'?'<button class="tiny-btn" data-source-retry>↻</button>':''}<button class="tiny-btn" data-source-open>↗</button></div>${src.message?`<p>${safeText(src.message)}</p>`:''}`;$('[data-source-play]',c)?.addEventListener('click',()=>playPlaylistSource(pl,src));$('[data-source-retry]',c)?.addEventListener('click',()=>retryPlaylistSource(pl,index));$('[data-source-open]',c)?.addEventListener('click',()=>window.open(src.originalUrl||src.url,'_blank','noopener'));els.playlistSources.appendChild(c);});
}
function renderPlayer(){const t=getCurrentTrack();els.miniPlayer.classList.toggle('is-hidden',!t);if(!t)return;els.miniTitle.textContent=t.title;els.miniArtist.textContent=t.artist||sourceLabel(t);els.fullTitle.textContent=t.title;els.fullArtist.textContent=[t.artist,t.album,sourceLabel(t)].filter(Boolean).join(' · ');els.favoriteBtn.textContent=t.favorite?'♥':'♡';els.favoriteBtn.classList.toggle('active',t.favorite);els.miniFavoriteBtn.textContent=t.favorite?'♥':'♡';els.miniFavoriteBtn.classList.toggle('active',t.favorite);const g=state.playing?'⏸':'▶';els.playBtn.textContent=g;els.fullPlayBtn.textContent=g;els.shuffleBtn.classList.toggle('active',state.shuffle);els.volumeRange.value=String(state.volume);updateProgress();}
function render(){renderSummary();renderPlayer();if(state.activeView==='library')renderLibrary();if(state.activeView==='playlist')renderPlaylists();}

function updateProgress(){let duration=0,current=0;if(state.currentEngine==='youtube'&&ytPlayer){try{duration=ytPlayer.getDuration()||0;current=ytPlayer.getCurrentTime()||0;}catch{}}else if(state.currentEngine==='soundcloud'&&getCurrentTrack()){duration=getCurrentTrack().duration||0;}else{duration=els.audio.duration||0;current=els.audio.currentTime||0;}sampleListenSession(current,duration);const pct=duration?(current/duration)*100:0;els.progressRange.value=String(pct);els.timeNow.textContent=formatTime(current);els.timeTotal.textContent=formatTime(duration);}
function startProgressTimer(){clearInterval(ytProgressTimer);ytProgressTimer=setInterval(()=>{if(state.currentEngine==='youtube')updateProgress();},500);}
function clearRemoteStage(){if(ytPlayer){try{ytPlayer.destroy();}catch{}ytPlayer=null;}if(scWidget){try{scWidget.unbind?.(window.SC?.Widget?.Events?.FINISH);}catch{}scWidget=null;}clearInterval(scProgressTimer);els.remoteStage.innerHTML='';els.remoteDock.classList.add('is-hidden');}
function stopAllEngines(){try{els.audio.pause();}catch{}if(ytPlayer){try{ytPlayer.stopVideo();}catch{}}if(scWidget){try{scWidget.pause();}catch{}}state.playing=false;}

async function getTrackFile(track){if(sessionFiles.has(track.id))return sessionFiles.get(track.id);if(!state.storageReady)return null;const src=await db.get('sources',track.id).catch(()=>null);if(!src?.blob)return null;return src.blob instanceof File?src.blob:new File([src.blob],src.name||track.fileName,{type:src.type||track.type,lastModified:src.lastModified||now()});}
async function playLocalOrDirect(track){
  clearRemoteStage();state.currentEngine=track.sourceKind==='direct'?'direct':'local';if(state.objectUrl){URL.revokeObjectURL(state.objectUrl);state.objectUrl=null;}
  if(track.sourceKind==='direct'){els.audio.src=track.remoteUrl;}else{const file=await getTrackFile(track);if(!file){toast('No se encontró el archivo local');return false;}state.objectUrl=URL.createObjectURL(file);els.audio.src=state.objectUrl;}
  els.audio.volume=state.volume;els.audio.currentTime=0;try{await els.audio.play();state.playing=true;return true;}catch(err){console.warn(err);toast(/wma|wmv|avi|mkv/i.test(track.fileName||'')?'Este formato necesita conversión; el motor WASM será la siguiente fase':'El navegador no pudo iniciar este archivo',4200);return false;}
}

function loadScript(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id))return resolve();const s=document.createElement('script');if(id)s.id=id;s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
function loadYouTubeApi(){if(window.YT?.Player)return Promise.resolve(window.YT);if(ytApiPromise)return ytApiPromise;ytApiPromise=new Promise((resolve,reject)=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev?.();}catch{}resolve(window.YT);};loadScript('https://www.youtube.com/iframe_api','youtube-iframe-api').catch(reject);setTimeout(()=>{if(window.YT?.Player)resolve(window.YT);},1800);setTimeout(()=>{if(!window.YT?.Player)reject(new Error('YouTube API timeout'));},12000);});return ytApiPromise;}
async function fetchYouTubeMeta(videoId){try{const url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const r=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||'',artist:d.author_name||'YouTube',thumbnail:d.thumbnail_url||''};}catch{return null;}}
async function playYouTube(track){
  try{await loadYouTubeApi();}catch{toast('No se pudo cargar el reproductor de YouTube');return false;}
  try{els.audio.pause();}catch{}clearRemoteStage();state.currentEngine='youtube';els.remoteDock.classList.remove('is-hidden');els.remoteLabel.textContent=track.sourceKind==='youtube-playlist'?'YOUTUBE · PLAYLIST':'YOUTUBE';els.remoteStage.innerHTML='<div id="ytMainPlayer"></div>';
  return new Promise(resolve=>{
    ytPlayer=new YT.Player('ytMainPlayer',{width:'100%',height:'100%',videoId:track.sourceKind==='youtube'?track.remoteId:undefined,playerVars:{autoplay:0,playsinline:1,controls:1,rel:0},events:{onReady:async e=>{try{e.target.setVolume(Math.round(state.volume*100));if(track.sourceKind==='youtube-playlist')e.target.loadPlaylist({listType:'playlist',list:track.remoteId,index:0,startSeconds:0});else e.target.playVideo();}catch(err){console.debug('youtube play',err);}state.playing=true;startProgressTimer();renderPlayer();if(track.sourceKind==='youtube'&&/^YouTube ·/.test(track.title)){const data=e.target.getVideoData?.()||{};if(data.title){track.title=data.title;track.artist=data.author||'YouTube';await saveRemoteTrack(track);render();}}resolve(true);},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){state.playing=true;renderPlayer();}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED){state.playing=false;renderPlayer();}else if(e.data===YT.PlayerState.ENDED){state.playing=false;renderPlayer();handleNaturalEnd();}},onError:e=>{console.debug('youtube player error',e.data);toast('YouTube no permitió reproducir este elemento');resolve(false);}}});
  });
}
function loadSoundCloudApi(){if(window.SC?.Widget)return Promise.resolve(window.SC);if(scApiPromise)return scApiPromise;scApiPromise=loadScript('https://w.soundcloud.com/player/api.js','soundcloud-widget-api').then(()=>window.SC);return scApiPromise;}
async function fetchSoundCloudMeta(url){try{const r=await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||cleanName(new URL(url).pathname.split('/').pop()),artist:d.author_name||'SoundCloud',thumbnail:d.thumbnail_url||''};}catch{return null;}}
async function playSoundCloud(track){
  try{await loadSoundCloudApi();}catch{toast('No se pudo cargar SoundCloud');return false;}
  try{els.audio.pause();}catch{}clearRemoteStage();state.currentEngine='soundcloud';els.remoteDock.classList.remove('is-hidden');els.remoteLabel.textContent='SOUNDCLOUD';const iframe=document.createElement('iframe');iframe.allow='autoplay';iframe.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.remoteUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;els.remoteStage.appendChild(iframe);
  return new Promise(resolve=>{iframe.onload=()=>{try{scWidget=SC.Widget(iframe);const E=SC.Widget.Events;scWidget.bind(E.READY,()=>{scWidget.setVolume(Math.round(state.volume*100));scWidget.play();scWidget.getCurrentSound(async s=>{if(s){track.title=s.title||track.title;track.artist=s.user?.username||track.artist;track.duration=(s.duration||0)/1000;await saveRemoteTrack(track);render();}});state.playing=true;renderPlayer();resolve(true);});scWidget.bind(E.PLAY,()=>{state.playing=true;renderPlayer();});scWidget.bind(E.PAUSE,()=>{state.playing=false;renderPlayer();});scWidget.bind(E.FINISH,()=>{state.playing=false;handleNaturalEnd();});scProgressTimer=setInterval(()=>{scWidget?.getPosition?.(ms=>{const d=track.duration||0;sampleListenSession(ms/1000,d);els.timeNow.textContent=formatTime(ms/1000);els.timeTotal.textContent=formatTime(d);els.progressRange.value=d?String((ms/1000/d)*100):'0';});},700);}catch{resolve(false);}};});
}

async function playTrack(id,contextIds=null,{skipFinalize=false}={}){
  const track=state.tracks.find(t=>t.id===id);if(!track)return;if(!playable(track)){toast(track.sourceMissing?'Vuelve a cargar este archivo local para reactivarlo':'Esta fuente está guardada como referencia, pero aún no tiene reproductor integrado');return;}
  if(state.listenSession&&!skipFinalize)await finalizeListenSession('switch');
  stopAllEngines();state.currentId=id;state.queueIds=(contextIds&&contextIds.length?[...contextIds]:[id]).filter(x=>state.tracks.some(t=>t.id===x&&playable(t)));state.queueIndex=Math.max(0,state.queueIds.indexOf(id));
  let ok=false;if(track.sourceKind==='local'||track.sourceKind==='direct')ok=await playLocalOrDirect(track);else if(track.sourceKind==='youtube'||track.sourceKind==='youtube-playlist')ok=await playYouTube(track);else if(track.sourceKind==='soundcloud')ok=await playSoundCloud(track);
  if(ok){await beginListenSession(track);await persistPrefs();setupMediaSession();render();}
}
async function togglePlay(){const t=getCurrentTrack();if(!t){const first=getFilteredTracks().find(playable);return first?playTrack(first.id,getFilteredTracks().filter(playable).map(x=>x.id)):toast('Primero carga o importa música');}if(state.currentEngine==='youtube'&&ytPlayer){const st=ytPlayer.getPlayerState();st===YT.PlayerState.PLAYING?ytPlayer.pauseVideo():ytPlayer.playVideo();return;}if(state.currentEngine==='soundcloud'&&scWidget){scWidget.toggle();return;}if(els.audio.paused){try{await els.audio.play();}catch{}}else els.audio.pause();}
async function nextTrack({skipFinalize=false}={}){if(!state.queueIds.length)return;let id;if(state.shuffle){const pool=state.queueIds.filter(x=>x!==state.currentId);id=pool[Math.floor(Math.random()*pool.length)]||state.queueIds[0];}else{state.queueIndex=(state.queueIndex+1)%state.queueIds.length;id=state.queueIds[state.queueIndex];}await playTrack(id,state.queueIds,{skipFinalize});}
async function prevTrack(){if(state.currentEngine==='local'||state.currentEngine==='direct'){if((els.audio.currentTime||0)>4){els.audio.currentTime=0;return;}}if(!state.queueIds.length)return;state.queueIndex=(state.queueIndex-1+state.queueIds.length)%state.queueIds.length;await playTrack(state.queueIds[state.queueIndex],state.queueIds);}
function queueTrack(id){if(!state.queueIds.includes(id))state.queueIds.push(id);persistPrefs();toast('Añadido a la cola');}
async function toggleFavorite(id=state.currentId){const t=state.tracks.find(x=>x.id===id);if(!t)return;t.favorite=!t.favorite;await saveRemoteTrack(t);recordHistory(t.favorite?'favorite':'unfavorite',t);render();toast(t.favorite?'Añadida a Favoritos ♥':'Quitada de Favoritos');}
async function removeTrack(id){const t=state.tracks.find(x=>x.id===id);if(!t)return;sessionFiles.delete(id);state.tracks=state.tracks.filter(x=>x.id!==id);for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).filter(x=>x!==id);await persistPlaylist(pl);}if(state.currentId===id){stopAllEngines();clearRemoteStage();els.audio.removeAttribute('src');state.currentId=null;state.currentEngine='none';}state.queueIds=state.queueIds.filter(x=>x!==id);if(state.storageReady){await db.delete('tracks',id).catch(()=>{});await db.delete('sources',id).catch(()=>{});}render();toast('Audio eliminado de MUSIC PLAY');}
async function removeFromPlaylist(trackId,playlistId){const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;pl.trackIds=pl.trackIds.filter(x=>x!==trackId);await persistPlaylist(pl);renderPlaylists();toast('Quitado de la playlist');}
async function createPlaylist(name,extra={}){
  const clean=(name||'').trim();if(!clean)return null;
  const pl=normalizePlaylist({id:`pl_${remoteHash(clean+now()+Math.random())}`,name:clean.slice(0,60),trackIds:[],sources:[],createdAt:now(),...extra});
  state.playlists.unshift(pl);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;
  await persistPlaylist(pl);await persistPrefs();return pl;
}
async function addTrackToPlaylist(trackId,playlistId,{silent=false}={}){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return null;
  if(!pl.trackIds.includes(trackId))pl.trackIds.push(trackId);
  await persistPlaylist(pl);if(state.activeView==='playlist')renderPlaylists();if(!silent)toast('Añadido a playlist');return pl;
}
function openPlaylistDetail(id){
  if(!state.playlists.some(p=>p.id===id))return;
  state.activeSmartId='';state.activePlaylistId=id;state.playlistDetailOpen=true;persistPrefs();renderPlaylists();
}
function openSmartCollection(id){if(!Object.values(SMART_IDS).includes(id))return;state.activeSmartId=id;state.playlistDetailOpen=true;state.activeView='playlist';[els.homeView,els.libraryView,els.playlistView].forEach(v=>v.classList.remove('active'));els.playlistView.classList.add('active');persistPrefs();renderPlaylists();}
function closePlaylistDetail(){state.playlistDetailOpen=false;state.activeSmartId='';renderPlaylists();persistPrefs();}
async function deletePlaylist(pl){
  if(!pl)return;
  state.playlists=state.playlists.filter(p=>p.id!==pl.id);
  if(state.storageReady)await db.delete('playlists',pl.id).catch(()=>{});
  state.activePlaylistId=state.playlists[0]?.id||'';state.playlistDetailOpen=false;await persistPrefs();renderPlaylists();toast('Playlist eliminada');
}
function openPlaylistPickerSheet(trackId){
  const track=state.tracks.find(t=>t.id===trackId);if(!track)return;
  const buttons=state.playlists.map(pl=>`<button class="sheet-btn" data-pick-pl="${pl.id}">≡ ${safeText(pl.name)}<small>${(pl.trackIds||[]).length} canciones</small></button>`).join('');
  openSheet(`<h2 class="sheet-title">Añadir a playlist</h2><p class="sheet-copy">${safeText(track.title)}</p><div class="sheet-stack">${buttons||'<p class="sheet-copy">Aún no tienes playlists.</p>'}<button class="sheet-btn" data-new-pl>＋ Nueva playlist<small>Crear y añadir esta canción</small></button></div>`,root=>{
    $$('[data-pick-pl]',root).forEach(b=>b.onclick=async()=>{await addTrackToPlaylist(trackId,b.dataset.pickPl);closeDialog(els.sheetDialog);});
    $('[data-new-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(trackId);};
  });
}
function openCreateFromLibrarySheet(){
  const list=getFilteredTracks();if(!list.length)return toast('No hay canciones para crear una playlist');
  openSheet(`<h2 class="sheet-title">Crear desde canciones</h2><p class="sheet-copy">Marca las canciones y crea una playlist desde esta misma biblioteca.</p><input id="bulkPlaylistName" class="sheet-input" maxlength="60" placeholder="Nombre de la playlist"/><div class="bulk-select-tools"><button class="tiny-btn" data-all>Todo</button><span id="bulkCount">0 seleccionadas</span></div><div class="bulk-track-list">${list.map(t=>`<label class="bulk-track"><input type="checkbox" value="${t.id}"/><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></span></label>`).join('')}</div><button class="sheet-btn" data-create-bulk>Crear playlist<small>Con las canciones seleccionadas</small></button>`,root=>{
    const checks=$$('input[type="checkbox"]',root),count=$('#bulkCount',root),name=$('#bulkPlaylistName',root);
    const update=()=>count.textContent=`${checks.filter(c=>c.checked).length} seleccionadas`;checks.forEach(c=>c.onchange=update);
    $('[data-all]',root).onclick=()=>{const on=!checks.every(c=>c.checked);checks.forEach(c=>c.checked=on);update();};
    $('[data-create-bulk]',root).onclick=async()=>{const ids=checks.filter(c=>c.checked).map(c=>c.value);if(!ids.length)return toast('Selecciona al menos una canción');const pl=await createPlaylist(name.value||'Nueva playlist');for(const id of ids)await addTrackToPlaylist(id,pl.id,{silent:true});closeDialog(els.sheetDialog);showView('playlist');state.playlistDetailOpen=true;renderPlaylists();toast(`Playlist creada · ${ids.length} canciones`);};
    name.focus();
  });
}
function openAddSongsToPlaylistSheet(playlistId){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;
  const list=getFilteredTracks().filter(t=>!pl.trackIds.includes(t.id));
  if(!list.length)return toast('Todas tus canciones ya están en esta playlist');
  openSheet(`<h2 class="sheet-title">Añadir canciones</h2><p class="sheet-copy">Selecciona varias canciones para <b>${safeText(pl.name)}</b>.</p><div class="bulk-select-tools"><button class="tiny-btn" data-all>Todo</button><span id="bulkCount">0 seleccionadas</span></div><div class="bulk-track-list">${list.map(t=>`<label class="bulk-track"><input type="checkbox" value="${t.id}"/><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></span></label>`).join('')}</div><button class="sheet-btn" data-add-selected>＋ Añadir seleccionadas</button>`,root=>{
    const checks=$$('input[type="checkbox"]',root),count=$('#bulkCount',root);const update=()=>count.textContent=`${checks.filter(c=>c.checked).length} seleccionadas`;checks.forEach(c=>c.onchange=update);$('[data-all]',root).onclick=()=>{const on=!checks.every(c=>c.checked);checks.forEach(c=>c.checked=on);update();};$('[data-add-selected]',root).onclick=async()=>{const ids=checks.filter(c=>c.checked).map(c=>c.value);if(!ids.length)return toast('Selecciona al menos una canción');for(const id of ids)await addTrackToPlaylist(id,pl.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;renderPlaylists();toast(`${ids.length} canciones añadidas`);};
  });
}
function openPlaylistMenuSheet(){
  const pl=getActivePlaylist();if(!pl)return;
  openSheet(`<h2 class="sheet-title">${safeText(pl.name)}</h2><p class="sheet-copy">Gestiona esta playlist sin salir de MUSIC PLAY.</p><div class="sheet-stack"><button class="sheet-btn" data-rename>✎ Renombrar<small>Cambiar el nombre</small></button><button class="sheet-btn" data-link>🔗 Añadir enlace<small>Importar otra fuente dentro de esta lista</small></button><button class="sheet-btn" data-delete>🗑 Eliminar playlist<small>No elimina los audios de la biblioteca</small></button></div>`,root=>{
    $('[data-rename]',root).onclick=()=>{root.innerHTML=`<h2 class="sheet-title">Renombrar</h2><input id="renamePlaylist" class="sheet-input" maxlength="60" value="${safeText(pl.name)}"/><button class="sheet-btn" data-save-name>Guardar</button>`;const input=$('#renamePlaylist',root);input.focus();$('[data-save-name]',root).onclick=async()=>{const v=input.value.trim();if(!v)return;pl.name=v.slice(0,60);await persistPlaylist(pl);closeDialog(els.sheetDialog);renderPlaylists();};};
    $('[data-link]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet('',pl.id);};
    $('[data-delete]',root).onclick=async()=>{closeDialog(els.sheetDialog);await deletePlaylist(pl);};
  });
}
function startMix(trackIds){const order=smartMixOrder(trackIds);if(!order.length)return toast('No hay fuentes reproducibles para mezclar');state.shuffle=false;playTrack(order[0],order);toast('Mix inteligente · gusto + escucha + descubrimiento');}

function openSheet(html,binder){els.sheetContent.innerHTML=html;$$('button',els.sheetContent).forEach(b=>b.type='button');openDialog(els.sheetDialog);binder?.(els.sheetContent);}
function openLoadSheet(){openSheet(`<h2 class="sheet-title">Cargar música</h2><p class="sheet-copy">Archivos, carpetas o enlaces. MUSIC PLAY decide cómo tratarlos.</p><div class="sheet-stack"><button class="sheet-btn" data-a="files">＋ Archivos<small>Audio o video local</small></button><button class="sheet-btn" data-a="folder">⌂ Carpeta<small>Biblioteca completa</small></button><button class="sheet-btn" data-a="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button><button class="sheet-btn" data-a="library">♪ Tu música<small>Ver biblioteca</small></button></div>`,root=>{$('[data-a="files"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};$('[data-a="folder"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};$('[data-a="link"]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};$('[data-a="library"]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');};});}
function openTrackSheet(track,options={}){const pls=state.playlists.map(pl=>`<button class="sheet-btn" data-pl="${pl.id}">≡ ${safeText(pl.name)}<small>Añadir esta canción</small></button>`).join('');const external=track.remoteUrl?`<button class="sheet-btn" data-a="original">↗ Abrir fuente<small>${safeText(track.remoteUrl)}</small></button>`:'';openSheet(`<h2 class="sheet-title">${safeText(track.title)}</h2><p class="sheet-copy">${safeText(track.artist||sourceLabel(track))} · ${sourceLabel(track)}</p><div class="sheet-stack">${playable(track)?'<button class="sheet-btn" data-a="play">▶ Reproducir<small>Escuchar ahora</small></button>':''}<button class="sheet-btn" data-a="queue">→ Cola<small>Reproducir después</small></button><button class="sheet-btn" data-a="fav">${track.favorite?'♥ Quitar favorito':'♡ Favorito'}<small>Marcar esta canción</small></button>${external}${options.fromPlaylist&&!options.smart?'<button class="sheet-btn" data-a="remove-pl">− Quitar de playlist<small>No elimina la canción</small></button>':''}<button class="sheet-btn" data-a="delete">🗑 Eliminar<small>Quitar de MUSIC PLAY</small></button><div class="sheet-copy">Añadir a playlist</div>${pls}<button class="sheet-btn" data-a="new-pl">＋ Nueva playlist<small>Crear y añadir</small></button></div>`,root=>{const q=s=>$(`[data-a="${s}"]`,root);q('play')&&(q('play').onclick=()=>{closeDialog(els.sheetDialog);playTrack(track.id,getFilteredTracks().filter(playable).map(t=>t.id));});q('queue').onclick=()=>{closeDialog(els.sheetDialog);queueTrack(track.id);};q('fav').onclick=()=>{closeDialog(els.sheetDialog);toggleFavorite(track.id);};q('original')&&(q('original').onclick=()=>window.open(track.remoteUrl,'_blank','noopener'));q('remove-pl')&&(q('remove-pl').onclick=()=>{closeDialog(els.sheetDialog);removeFromPlaylist(track.id,state.activePlaylistId);});q('delete').onclick=()=>{closeDialog(els.sheetDialog);removeTrack(track.id);};$$('[data-pl]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);addTrackToPlaylist(track.id,b.dataset.pl);});q('new-pl').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(track.id);};});}
function openCreatePlaylistSheet(preselect=null){openSheet(`<h2 class="sheet-title">Nueva playlist</h2><p class="sheet-copy">Una lista propia, aunque mezcle archivos y enlaces.</p><input id="playlistNameInput" class="sheet-input" maxlength="60" placeholder="Ej: Rock, Estudio, Viaje"/><div class="sheet-stack"><button class="sheet-btn" data-save>Guardar playlist<small>Se queda en este dispositivo</small></button></div>`,root=>{const input=$('#playlistNameInput',root);input.focus();$('[data-save]',root).onclick=async()=>{const pl=await createPlaylist(input.value);if(!pl)return toast('Escribe un nombre');if(preselect)await addTrackToPlaylist(preselect,pl.id);closeDialog(els.sheetDialog);showView('playlist');};});}

function downloadText(filename,text,type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function safeFileName(name){return String(name||'music-play').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,80)||'music-play';}
async function exportBackup(){
  const payload={schema:'music-play-backup',version:1,build:BUILD,exportedAt:new Date().toISOString(),tracks:state.tracks.map(t=>({...normalizeTrack(t),sourceMissing:t.sourceKind==='local'?true:!!t.sourceMissing})),playlists:state.playlists.map(normalizePlaylist),history:state.history.slice(0,2500),prefs:{volume:state.volume,theme:state.theme}};
  downloadText(`MUSIC-PLAY-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(payload,null,2),'application/json');toast('Copia JSON creada');
}
async function restoreBackupFile(file){
  if(!file)return;let data;try{data=JSON.parse(await file.text());}catch{return toast('El archivo JSON no es válido');}
  if(data?.schema!=='music-play-backup'||!Array.isArray(data.tracks))return toast('Esta copia no corresponde a MUSIC PLAY');
  showLoader('Restaurando biblioteca…','Combinando datos sin borrar lo actual');
  const existing=new Map(state.tracks.map(t=>[t.id,t]));
  for(const raw of data.tracks){const incoming=normalizeTrack(raw),current=existing.get(incoming.id);const merged=current?normalizeTrack({...incoming,...current,favorite:!!(incoming.favorite||current.favorite),validPlays:Math.max(incoming.validPlays||0,current.validPlays||0),completedPlays:Math.max(incoming.completedPlays||0,current.completedPlays||0),listenedMs:Math.max(incoming.listenedMs||0,current.listenedMs||0),skipCount:Math.max(incoming.skipCount||0,current.skipCount||0),replayCount:Math.max(incoming.replayCount||0,current.replayCount||0)}):normalizeTrack({...incoming,sourceMissing:incoming.sourceKind==='local'?true:incoming.sourceMissing});existing.set(merged.id,merged);if(state.storageReady)await db.put('tracks',merged).catch(()=>{});}
  state.tracks=[...existing.values()];
  const pmap=new Map(state.playlists.map(p=>[p.id,normalizePlaylist(p)]));
  for(const raw of (data.playlists||[])){const incoming=normalizePlaylist(raw),current=pmap.get(incoming.id);pmap.set(incoming.id,current?normalizePlaylist({...incoming,...current,trackIds:[...(incoming.trackIds||[]),...(current.trackIds||[])],sources:[...(incoming.sources||[]),...(current.sources||[])]}):incoming);}
  state.playlists=[...pmap.values()];for(const pl of state.playlists)await persistPlaylist(pl);
  for(const evt of (data.history||[]).slice(0,2500)){const clean={...evt};delete clean.id;state.history.push(clean);if(state.storageReady)db.add('history',clean).catch(()=>{});}state.history.sort((a,b)=>(b.ts||0)-(a.ts||0));if(state.history.length>2500)state.history.length=2500;
  hideLoader();render();toast('Copia restaurada · los archivos locales deben volver a cargarse si faltan');
}
function m3uForTracks(name,tracks){
  const lines=['#EXTM3U',`#PLAYLIST:${name}`];for(const t of tracks){lines.push(`#EXTINF:${Math.round(t.duration||-1)},${(t.artist&&t.artist!=='Desconocido'?t.artist+' - ':'')}${t.title}`);if(t.remoteUrl)lines.push(t.remoteUrl);else if(t.fileName)lines.push(t.fileName);}
  return lines.join('\n');
}
function openExportM3USheet(){
  const choices=[...[SMART_IDS.favorites,SMART_IDS.most,SMART_IDS.recent,SMART_IDS.repeat].map(id=>({id,name:smartMeta(id).name,smart:true})),...state.playlists.map(pl=>({id:pl.id,name:pl.name,smart:false}))];
  openSheet(`<h2 class="sheet-title">Exportar M3U8</h2><p class="sheet-copy">Elige una lista. Los archivos locales se exportan por nombre; los enlaces externos conservan su URL.</p><div class="sheet-stack">${choices.map(c=>`<button class="sheet-btn" data-m3u="${c.id}">${c.smart?smartMeta(c.id).icon:'≡'} ${safeText(c.name)}</button>`).join('')||'<p class="sheet-copy">No hay listas disponibles.</p>'}</div>`,root=>{$$('[data-m3u]',root).forEach(b=>b.onclick=()=>{const id=b.dataset.m3u,smart=Object.values(SMART_IDS).includes(id),tracks=smart?getSmartTracks(id):getPlaylistTracks(state.playlists.find(p=>p.id===id)),name=smart?smartMeta(id).name:state.playlists.find(p=>p.id===id)?.name||'Playlist';downloadText(`${safeFileName(name)}.m3u8`,m3uForTracks(name,tracks),'audio/x-mpegurl;charset=utf-8');closeDialog(els.sheetDialog);toast('M3U8 exportada');});});
}
async function importM3UFile(file){
  if(!file)return;const text=await file.text(),lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),name=cleanName(file.name)||'Playlist importada',pl=await createPlaylist(name);let pendingTitle='',added=0,localPlaceholders=0;
  for(const line of lines){if(line.startsWith('#EXTINF:')){pendingTitle=(line.split(',').slice(1).join(',')||'').trim();continue;}if(line.startsWith('#'))continue;
    let t=null;if(/^https?:\/\//i.test(line)){const info=analyzeLink(line);if(info.kind==='youtube')t=makeRemoteTrack('youtube',line,{remoteId:info.videoId,title:pendingTitle||'YouTube',artist:'YouTube'});else if(info.kind==='soundcloud')t=makeRemoteTrack('soundcloud',line,{title:pendingTitle||'SoundCloud',artist:'SoundCloud'});else if(info.kind==='direct'||info.kind==='generic')t=makeRemoteTrack('direct',line,{title:pendingTitle||cleanName(new URL(line).pathname.split('/').pop()),artist:'Enlace'});else t=makeRemoteTrack('external',line,{title:pendingTitle||'Enlace',artist:'Fuente externa'});}else{const fname=line.split(/[\\/]/).pop()||line;t=normalizeTrack({id:`m3u_local_${remoteHash(line)}`,fileName:fname,title:pendingTitle||cleanName(fname),artist:'Archivo por localizar',album:'M3U8',genre:'',duration:0,size:0,type:'',addedAt:now(),favorite:false,sourceKind:'local',sourceMissing:true});localPlaceholders++;}
    pendingTitle='';if(t){await saveRemoteTrack(t);await addTrackToPlaylist(t.id,pl.id,{silent:true});added++;}
  }
  closeDialog(els.sheetDialog);state.activePlaylistId=pl.id;state.activeSmartId='';state.playlistDetailOpen=true;showView('playlist');toast(`M3U8 importada · ${added} elementos${localPlaceholders?` · ${localPlaceholders} archivos por localizar`:''}`,4200);
}
function openRecapSheet(){
  const top=getSmartTracks(SMART_IDS.most).slice(0,5),fav=getSmartTracks(SMART_IDS.favorites).length,valid=state.tracks.reduce((n,t)=>n+(t.validPlays||0),0),complete=state.tracks.reduce((n,t)=>n+(t.completedPlays||0),0),replays=state.tracks.reduce((n,t)=>n+(t.replayCount||0),0),recent30=state.history.filter(e=>e.type==='valid'&&now()-(e.ts||0)<30*DAY).length;
  const artistMap=new Map();for(const t of state.tracks){if(!t.artist||t.artist==='Desconocido')continue;artistMap.set(t.artist,(artistMap.get(t.artist)||0)+smartScore(t));}const topArtist=[...artistMap.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
  openSheet(`<h2 class="sheet-title">◎ Tu resumen</h2><p class="sheet-copy">Estadísticas locales. MUSIC PLAY no necesita enviar tu historial a ningún servidor.</p><div class="recap-grid"><div><b>${formatListenTime(totalListenedMs())}</b><span>tiempo escuchado</span></div><div><b>${valid}</b><span>escuchas válidas</span></div><div><b>${complete}</b><span>completadas</span></div><div><b>${replays}</b><span>repeticiones</span></div><div><b>${fav}</b><span>favoritos</span></div><div><b>${recent30}</b><span>actividad 30 días</span></div></div><div class="recap-highlight"><small>ARTISTA MÁS PRESENTE</small><strong>${safeText(topArtist)}</strong></div><div class="sheet-copy">Tus más escuchadas</div><div class="recap-top">${top.length?top.map((t,i)=>`<div><span>${i+1}</span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></div>`).join(''):'<p class="sheet-copy">Escucha música y este resumen empezará a tomar forma.</p>'}</div><div class="install-note"><strong>✦ Smart DJ local</strong><span>Mix usa favoritos, escuchas completas, repeticiones, saltos y un pequeño porcentaje de descubrimiento.</span></div>`);
}
function openClearHistoryConfirm(){openSheet(`<h2 class="sheet-title">Borrar historial</h2><p class="sheet-copy">Se conservarán canciones, playlists y favoritos. Se eliminarán estadísticas de escucha, repeticiones y saltos.</p><div class="sheet-stack"><button class="sheet-btn danger" data-clear-history>Eliminar historial</button><button class="sheet-btn" data-cancel>Cancelar</button></div>`,root=>{$('[data-cancel]',root).onclick=()=>closeDialog(els.sheetDialog);$('[data-clear-history]',root).onclick=async()=>{for(const t of state.tracks){Object.assign(t,{playCount:0,starts:0,validPlays:0,completedPlays:0,listenedMs:0,skipCount:0,replayCount:0,lastStarted:0,lastPlayed:0,lastValidAt:0,lastCompleted:0});await saveRemoteTrack(t);}state.history=[];if(state.storageReady)await db.clear('history').catch(()=>{});closeDialog(els.sheetDialog);render();toast('Historial eliminado');};});}
function openMoreMenu(){openSheet(`<h2 class="sheet-title">MUSIC PLAY</h2><p class="sheet-copy">Herramientas de biblioteca sin llenar la pantalla principal.</p><div class="sheet-stack"><button class="sheet-btn" data-more="recap">◎ Mi resumen<small>Escuchas, tiempo, repeticiones y favoritos</small></button><button class="sheet-btn" data-more="backup">⇩ Copia JSON<small>Playlists, enlaces, favoritos e historial</small></button><button class="sheet-btn" data-more="restore">⇧ Restaurar JSON<small>Combina una copia con tu biblioteca actual</small></button><button class="sheet-btn" data-more="m3u-export">≡ Exportar M3U8<small>Interoperabilidad con otros reproductores</small></button><button class="sheet-btn" data-more="m3u-import">＋ Importar M3U/M3U8<small>Enlaces y referencias locales</small></button><button class="sheet-btn danger" data-more="clear">⌫ Borrar historial<small>No borra música ni favoritos</small></button></div>`,root=>{$('[data-more="recap"]',root).onclick=()=>{closeDialog(els.sheetDialog);openRecapSheet();};$('[data-more="backup"]',root).onclick=()=>{closeDialog(els.sheetDialog);exportBackup();};$('[data-more="restore"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.backupInput.click();};$('[data-more="m3u-export"]',root).onclick=()=>{closeDialog(els.sheetDialog);openExportM3USheet();};$('[data-more="m3u-import"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.m3uInput.click();};$('[data-more="clear"]',root).onclick=()=>{closeDialog(els.sheetDialog);openClearHistoryConfirm();};});}

function isStandalone(){return !!(window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true);}
function syncInstallUI(){if(!els.installBtn)return;els.installBtn.classList.toggle('is-hidden',isStandalone());}
async function openInstallSheet(){
  if(isStandalone()){toast('MUSIC PLAY ya está instalada');syncInstallUI();return;}
  if(state.installPrompt){
    try{
      state.installPrompt.prompt();
      const choice=await state.installPrompt.userChoice;
      if(choice?.outcome==='accepted'){toast('Instalando MUSIC PLAY…');els.installBtn.classList.add('is-hidden');}
      state.installPrompt=null;
      return;
    }catch(err){console.warn('Install prompt',err);}
  }
  const ua=navigator.userAgent||'';
  const ios=/iphone|ipad|ipod/i.test(ua);
  const android=/android/i.test(ua);
  let copy='Abre el menú del navegador y elige <b>Instalar aplicación</b> o <b>Añadir a pantalla principal</b>.';
  if(ios) copy='En iPhone o iPad: toca <b>Compartir</b> y luego <b>Añadir a pantalla de inicio</b>.';
  else if(android) copy='En Android: toca <b>⋮</b> y elige <b>Instalar aplicación</b> o <b>Añadir a pantalla principal</b>. Si abriste MUSIC PLAY en una ventana con una <b>X arriba</b>, primero usa <b>⋮ → Abrir en Chrome</b>.';
  openSheet(`<h2 class="sheet-title">⇩ Instalar MUSIC PLAY</h2><p class="sheet-copy">${copy}</p><div class="install-note"><strong>PWA</strong><span>Quedará con icono propio y abrirá como aplicación, sin depender de esta pestaña.</span></div><button class="sheet-btn" data-close>Entendido</button>`,root=>$('[data-close]',root).onclick=()=>closeDialog(els.sheetDialog));
}
function setUpdateAvailable(on=true){state.updateAvailable=!!on;if(!els.updateBtn)return;els.updateBtn.classList.toggle('is-hidden',!state.updateAvailable);if(on)els.updateBtn.setAttribute('aria-label','Actualizar MUSIC PLAY: nueva versión disponible');}
function wireServiceWorker(reg){
  state.swRegistration=reg;
  if(reg.waiting && navigator.serviceWorker.controller)setUpdateAvailable(true);
  reg.addEventListener('updatefound',()=>{
    const worker=reg.installing;if(!worker)return;
    worker.addEventListener('statechange',()=>{
      if(worker.state==='installed' && navigator.serviceWorker.controller){setUpdateAvailable(true);toast('Nueva versión disponible · toca ↻');}
    });
  });
}
async function checkForUpdates(force=false){
  if(!navigator.onLine)return false;
  const t=Date.now();if(!force && t-state.lastUpdateCheck<120000)return state.updateAvailable;state.lastUpdateCheck=t;
  try{
    const res=await fetch(`./version.json?check=${t}`,{cache:'no-store'});
    if(res.ok){const info=await res.json();state.remoteBuild=info.build||'';if(state.remoteBuild && state.remoteBuild!==BUILD)setUpdateAvailable(true);}
  }catch(err){console.debug('Version check skipped',err);}
  try{await state.swRegistration?.update();}catch{}
  return state.updateAvailable;
}
async function applyAvailableUpdate(){
  if(!navigator.onLine)return toast('Necesitas conexión para actualizar');
  toast('Actualizando MUSIC PLAY…',3200);
  state.refreshingForUpdate=true;
  let reg=state.swRegistration;
  try{if(reg)await reg.update();}catch{}
  if(reg?.installing){
    await Promise.race([new Promise(resolve=>{const w=reg.installing;const done=()=>{if(['installed','redundant'].includes(w.state)){w.removeEventListener('statechange',done);resolve();}};w.addEventListener('statechange',done);done();}),sleep(4500)]);
  }
  if(reg?.waiting){reg.waiting.postMessage({type:'SKIP_WAITING'});setTimeout(()=>location.reload(),3500);return;}
  const u=new URL(location.href);u.searchParams.set('_mpf_update',Date.now());location.replace(u.href);
}


function canonicalYouTubePlaylistUrl(playlistId){return `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId||'')}`;}
function analyzeLink(raw){
  let u;try{u=new URL(String(raw||'').trim());}catch{return{kind:'invalid',url:raw};}
  const host=u.hostname.toLowerCase().replace(/^www\./,'');
  if(host==='youtu.be'){
    const id=u.pathname.split('/').filter(Boolean)[0]||'';
    const list=u.searchParams.get('list')||'';
    if(list&&!id)return{kind:'youtube-playlist',url:u.href,playlistId:list,canonicalUrl:canonicalYouTubePlaylistUrl(list)};
    return{kind:id?'youtube':'invalid',url:u.href,videoId:id,playlistId:list,canonicalUrl:list?canonicalYouTubePlaylistUrl(list):''};
  }
  if(host.endsWith('youtube.com')){
    const list=u.searchParams.get('list')||'';
    let id=u.searchParams.get('v')||'';
    const parts=u.pathname.split('/').filter(Boolean);
    if(!id&&['shorts','embed','live'].includes(parts[0]))id=parts[1]||'';
    const isPlaylistPath=u.pathname.includes('/playlist')||host.startsWith('music.youtube.com');
    if(list&&(isPlaylistPath||!id))return{kind:'youtube-playlist',url:u.href,playlistId:list,canonicalUrl:canonicalYouTubePlaylistUrl(list),fromMusic:host.startsWith('music.youtube.com')};
    if(id)return{kind:'youtube',url:u.href,videoId:id,playlistId:list,canonicalUrl:list?canonicalYouTubePlaylistUrl(list):''};
  }
  if(host.endsWith('soundcloud.com'))return{kind:'soundcloud',url:u.href};
  if(host.includes('spotify.com'))return{kind:'spotify',url:u.href};
  if(host.includes('music.apple.com'))return{kind:'apple',url:u.href};
  const ext=extOf(u.pathname);if(MEDIA_EXT.has(ext))return{kind:'direct',url:u.href,ext};
  return{kind:'generic',url:u.href,ext};
}
function describeLink(info){return({youtube:['YouTube','Video reproducible dentro de MUSIC PLAY'],'youtube-playlist':['YouTube Music / Playlist','Importa la lista y conserva el orden dentro de MUSIC PLAY'],soundcloud:['SoundCloud','Enlace reproducible mediante su reproductor oficial'],direct:['Archivo multimedia','Puede reproducirse o guardarse localmente'],spotify:['Spotify','Se guarda como referencia; no se descarga audio protegido'],apple:['Apple Music','Se guarda como referencia; integración autorizada posterior'],generic:['Enlace','Intentaremos detectar si entrega audio o video'],invalid:['Enlace inválido','Revisa la dirección']})[info.kind]||['Enlace',''];}
function openLinkSheet(prefill='',targetPlaylistId=''){
  const target=state.playlists.find(p=>p.id===targetPlaylistId)||null;
  openSheet(`<h2 class="sheet-title">${target?'Añadir enlace':'Enlace'}</h2><p class="sheet-copy">${target?`Todo lo que importes se añadirá a <b>${safeText(target.name)}</b>.`:'Pega un video, playlist de YouTube Music o archivo multimedia.'}</p><input id="linkInput" class="sheet-input" inputmode="url" autocomplete="off" placeholder="https://…" value="${safeText(prefill)}"/><div class="sheet-stack"><button class="sheet-btn" data-analyze>Analizar<small>Detecta la fuente automáticamente</small></button></div><div id="linkResult"></div>`,root=>{
    const input=$('#linkInput',root),result=$('#linkResult',root);input.focus();
    const analyze=()=>renderLinkResult(analyzeLink(input.value),result,target?.id||'');
    $('[data-analyze]',root).onclick=analyze;input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();analyze();}});
  });
}
function renderLinkResult(info,host,targetPlaylistId=''){
  const [title,desc]=describeLink(info),target=state.playlists.find(p=>p.id===targetPlaylistId)||null;
  const playlistInfo=info.kind==='youtube-playlist'?`<span>ID: ${safeText(info.playlistId||'')}</span>`:'';
  host.innerHTML=`<div class="link-result"><strong>${title}</strong><span>${desc}</span>${playlistInfo}<span>${safeText(info.url||'')}</span><div class="link-actions" id="linkActions"></div></div>`;
  const a=$('#linkActions',host);if(info.kind==='invalid')return;
  const add=(label,fn)=>{const b=document.createElement('button');b.className='sheet-btn';b.textContent=label;b.onclick=fn;a.appendChild(b);};
  const finishTarget=async track=>{if(!track||!target)return;await addTrackToPlaylist(track.id,target.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=target.id;state.playlistDetailOpen=true;showView('playlist');toast('Añadido a playlist');};
  if(info.kind==='youtube'){
    add('▶ Play',async()=>{const t=await importYouTubeVideo(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    add(target?`＋ Añadir a ${target.name}`:'＋ Guardar',async()=>{const t=await importYouTubeVideo(info,false);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');toast('YouTube guardado');});
  }else if(info.kind==='youtube-playlist'){
    add('▶ Play',async()=>{const t=makeRemoteTrack('youtube-playlist',info.canonicalUrl||info.url,{remoteId:info.playlistId,title:'Playlist de YouTube',artist:'YouTube'});await saveRemoteTrack(t);closeDialog(els.sheetDialog);playTrack(t.id,[t.id]);});
    add(target?`＋ Sumar a ${target.name}`:'＋ Importar playlist',async()=>{closeDialog(els.sheetDialog);await importYouTubePlaylist(info,target?.id||'');});
  }else if(info.kind==='soundcloud'){
    add('▶ Play',async()=>{const t=await importSoundCloud(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    add(target?`＋ Añadir a ${target.name}`:'＋ Guardar',async()=>{const t=await importSoundCloud(info,false);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');});
  }else if(info.kind==='direct'||info.kind==='generic'){
    add('▶ Play',async()=>{const t=await importDirectReference(info.url);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    if(target)add(`＋ Añadir enlace a ${target.name}`,async()=>{const t=await importDirectReference(info.url);return finishTarget(t);});
    else add('↓ Guardar',async()=>{closeDialog(els.sheetDialog);await downloadRemoteMedia(info.url);});
  }else if(info.kind==='spotify'||info.kind==='apple'){
    add(target?`＋ Añadir referencia a ${target.name}`:'＋ Guardar referencia',async()=>{const kind='external',name=info.kind==='spotify'?'Spotify':'Apple Music';const t=makeRemoteTrack(kind,info.url,{title:`${name} · enlace`,artist:name,service:info.kind});await saveRemoteTrack(t);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');toast('Referencia guardada');});
    add('↗ Abrir original',()=>window.open(info.url,'_blank','noopener'));
  }
}
async function importYouTubeVideo(info,playNow=false){let meta=await fetchYouTubeMeta(info.videoId);const t=makeRemoteTrack('youtube',info.url,{remoteId:info.videoId,title:meta?.title||`YouTube · ${info.videoId}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||''});await saveRemoteTrack(t);render();return t;}
async function importSoundCloud(info){let meta=await fetchSoundCloudMeta(info.url);const t=makeRemoteTrack('soundcloud',info.url,{title:meta?.title||cleanName(new URL(info.url).pathname.split('/').pop())||'SoundCloud',artist:meta?.artist||'SoundCloud',thumbnail:meta?.thumbnail||''});await saveRemoteTrack(t);render();return t;}
async function importDirectReference(url){const path=new URL(url).pathname;const title=cleanName(path.split('/').pop())||'Audio por enlace';const t=makeRemoteTrack('direct',url,{title,artist:new URL(url).hostname,mediaKind:VIDEO_EXT.has(extOf(path))?'video':'audio'});await saveRemoteTrack(t);render();return t;}
async function downloadRemoteMedia(url){showLoader('Descargando…','Conectando con el archivo');try{const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const blob=await r.blob();const ct=blob.type||r.headers.get('content-type')||'';if(!ct.startsWith('audio/')&&!ct.startsWith('video/')&&!MEDIA_EXT.has(extOf(new URL(url).pathname)))throw new Error('La URL no devolvió un archivo multimedia reconocible');const name=decodeURIComponent(new URL(url).pathname.split('/').pop()||`audio-${Date.now()}`);const file=new File([blob],name,{type:ct,lastModified:now()});await importFiles([file]);}catch(err){hideLoader();console.warn(err);toast('El servidor no permitió descargar el archivo. Puedes guardarlo como enlace.',4600);}}

function upsertPlaylistSource(pl,source){
  pl.sources=Array.isArray(pl.sources)?pl.sources:[];
  const idx=pl.sources.findIndex(s=>(source.playlistId&&s.playlistId===source.playlistId)||(source.url&&s.url===source.url));
  if(idx>=0)pl.sources[idx]={...pl.sources[idx],...source};else pl.sources.push(source);
  if(!pl.externalRef&&source.source==='YouTube')pl.externalRef={source:'YouTube',url:source.url,originalUrl:source.originalUrl,playlistId:source.playlistId,importSource:source.importSource};
  return idx>=0?idx:pl.sources.length-1;
}
async function importYouTubePlaylist(info,targetPlaylistId=''){
  const playlistId=info.playlistId||'';if(!playlistId)return toast('No encontré el ID de la playlist');
  const target=state.playlists.find(p=>p.id===targetPlaylistId)||null;
  showLoader(target?'Añadiendo playlist…':'Importando playlist…','Conectando con YouTube');
  const result=await getYouTubePlaylistIds(playlistId),ids=result.ids||[];
  const name=result.title||`YouTube · ${playlistId.slice(0,18)}`;
  let pl=target;
  if(!pl)pl=await createPlaylist(name);
  const src={id:`src_${remoteHash(playlistId)}`,source:'YouTube',url:info.canonicalUrl||canonicalYouTubePlaylistUrl(playlistId),originalUrl:info.url,playlistId,importSource:result.source||'link',status:ids.length?'imported':'linked',count:ids.length,message:ids.length?'':(result.error||'YouTube no expuso el listado al navegador'),addedAt:now(),checkedAt:now()};
  upsertPlaylistSource(pl,src);
  let added=0;
  for(let i=0;i<ids.length;i++){
    const videoId=ids[i];els.loaderText.textContent=`${i+1}/${ids.length} · preparando lista`;
    let meta=result.meta?.[videoId]||null;if(!meta&&i<24)meta=await fetchYouTubeMeta(videoId);
    const url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const t=makeRemoteTrack('youtube',url,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(2,'0')}`,artist:meta?.artist||meta?.author||'YouTube',thumbnail:meta?.thumbnail||'',playlistSource:playlistId,playlistPosition:i});
    await saveRemoteTrack(t);if(!pl.trackIds.includes(t.id)){pl.trackIds.push(t.id);added++;}await sleep(10);
  }
  await persistPlaylist(pl);hideLoader();state.activePlaylistId=pl.id;state.playlistDetailOpen=true;showView('playlist');renderPlaylists();
  if(ids.length)toast(`${target?'Playlist añadida':'Playlist importada'} · ${added} nuevas · ${ids.length} detectadas`,4200);
  else toast('Playlist guardada en Tus listas. Queda enlazada y puedes reintentar la lectura.',4800);
  return pl;
}
async function getYouTubePlaylistIds(playlistId,options={}){
  const out={ids:[],source:'',error:'',title:'',meta:{}};
  if(!playlistId){out.error='ID vacío';return out;}
  // 1) If the deployment exposes our same-origin helper, use it first. It avoids CORS and gives the most stable enumeration.
  if(location.protocol!=='file:'){
    try{
      const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),options.quick?3500:6500);
      const apiUrl=new URL('./api/youtube-playlist',location.href);apiUrl.searchParams.set('list',playlistId);
      const r=await fetch(apiUrl,{headers:{'accept':'application/json'},cache:'no-store',signal:ctrl.signal});clearTimeout(timer);
      const ct=r.headers.get('content-type')||'';
      if(r.ok&&ct.includes('application/json')){
        const d=await r.json();
        if(Array.isArray(d.items)&&d.items.length){
          out.ids=Array.from(new Set(d.items.map(x=>x.videoId||x.id).filter(Boolean)));
          out.source='API local';out.title=d.title||'';
          for(const item of d.items){const id=item.videoId||item.id;if(id)out.meta[id]={title:item.title||'',artist:item.author||item.channelTitle||'',thumbnail:item.thumbnail||''};}
          return out;
        }
        if(Array.isArray(d.ids)&&d.ids.length){out.ids=Array.from(new Set(d.ids.filter(Boolean)));out.source='API local';out.title=d.title||'';return out;}
      }
    }catch(err){if(err?.name!=='AbortError')console.debug('Playlist helper unavailable',err);}
  }
  // 2) Pure-browser fallback using the official YouTube IFrame API and getPlaylist().
  try{
    const ids=await probeYouTubePlaylistIFrame(playlistId,{timeout:options.quick?9000:18000});
    if(ids.length){out.ids=ids;out.source='YouTube IFrame';return out;}
  }catch(err){console.debug('YouTube iframe probe',err);out.error=err?.message||'sin listado';}
  if(!out.error)out.error='YouTube permitió enlazar la playlist, pero no devolvió sus elementos';
  return out;
}
async function probeYouTubePlaylistIFrame(playlistId,{timeout=18000}={}){
  await loadYouTubeApi();
  if(ytProbePlayer){try{ytProbePlayer.destroy();}catch{}ytProbePlayer=null;}
  els.ytProbeHost.innerHTML='';
  const host=document.createElement('div');host.id=`ytProbe_${Date.now()}`;els.ytProbeHost.appendChild(host);
  return new Promise(resolve=>{
    let settled=false,poll=null;
    const finish=value=>{if(settled)return;settled=true;if(poll)clearInterval(poll);const ids=Array.from(new Set((value||[]).filter(v=>typeof v==='string'&&v.length>=6)));resolve(ids);};
    const sample=player=>{let arr=[];try{arr=player.getPlaylist?.()||[];}catch{}if(arr.length)finish(arr);};
    try{
      ytProbePlayer=new YT.Player(host.id,{width:'240',height:'200',playerVars:{playsinline:1,controls:0,rel:0,listType:'playlist',list:playlistId},events:{
        onReady:e=>{try{e.target.cuePlaylist({listType:'playlist',list:playlistId,index:0,startSeconds:0});}catch(err){console.debug('cuePlaylist',err);}sample(e.target);let tries=0;poll=setInterval(()=>{tries++;sample(e.target);if(tries>Math.ceil(timeout/450))finish([]);},450);},
        onStateChange:e=>{if([YT.PlayerState.CUED,YT.PlayerState.PLAYING,YT.PlayerState.PAUSED].includes(e.data))sample(e.target);},
        onError:e=>{console.debug('playlist iframe error',e.data);finish([]);}
      }});
    }catch(err){console.debug('probe init',err);finish([]);}
    setTimeout(()=>finish([]),timeout+800);
  });
}
async function retryPlaylistSource(pl,sourceIndex=0){
  const src=pl?.sources?.[sourceIndex];if(!src||src.source!=='YouTube'||!src.playlistId)return toast('Esta fuente no puede reimportarse');
  showLoader('Reintentando…','Consultando YouTube');const result=await getYouTubePlaylistIds(src.playlistId);const ids=result.ids||[];
  if(!ids.length){hideLoader();src.status='linked';src.message=result.error||'YouTube no entregó el listado';src.checkedAt=now();await persistPlaylist(pl);renderPlaylists();return toast('La fuente sigue enlazada; puedes reproducirla y reintentar luego.',4200);}
  let added=0;
  for(let i=0;i<ids.length;i++){
    const videoId=ids[i];els.loaderText.textContent=`${i+1}/${ids.length} · recuperando canciones`;let meta=result.meta?.[videoId]||null;if(!meta&&i<18)meta=await fetchYouTubeMeta(videoId);
    const t=makeRemoteTrack('youtube',`https://www.youtube.com/watch?v=${videoId}`,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(2,'0')}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||'',playlistSource:src.playlistId,playlistPosition:i});
    await saveRemoteTrack(t);if(!pl.trackIds.includes(t.id)){pl.trackIds.push(t.id);added++;}
  }
  src.status='imported';src.count=ids.length;src.message='';src.importSource=result.source;src.checkedAt=now();if(result.title&&/^YouTube ·/.test(pl.name))pl.name=result.title;
  await persistPlaylist(pl);hideLoader();render();toast(`Fuente recuperada · ${added} nuevas · ${ids.length} detectadas`,4200);return pl;
}
async function retryPlaylistImport(pl){
  const index=(pl?.sources||[]).findIndex(s=>s.source==='YouTube');if(index<0)return toast('Esta lista no tiene una fuente de YouTube');return retryPlaylistSource(pl,index);
}
async function playPlaylistSource(pl,src){
  if(src?.source==='YouTube'&&src.playlistId){const t=makeRemoteTrack('youtube-playlist',src.url||canonicalYouTubePlaylistUrl(src.playlistId),{remoteId:src.playlistId,title:pl.name,artist:'YouTube'});await saveRemoteTrack(t);return playTrack(t.id,[t.id]);}
  toast('Esta fuente todavía no tiene reproductor integrado');
}
async function playExternalPlaylist(pl){
  const src=(pl?.sources||[]).find(s=>s.source==='YouTube')|| (pl?.externalRef?{...pl.externalRef,status:'linked'}:null);
  if(src)return playPlaylistSource(pl,src);toast('Esta playlist no tiene una fuente externa reproducible');
}
async function pickFiles(){if('showOpenFilePicker'in window){try{const handles=await showOpenFilePicker({multiple:true,types:[{description:'Audio y video',accept:{'audio/*':['.mp3','.m4a','.aac','.wav','.ogg','.oga','.opus','.flac','.wma'],'video/*':['.mp4','.m4v','.webm','.mov','.3gp','.wmv','.avi','.mkv']}}]});return importFiles(await Promise.all(handles.map(h=>h.getFile())));}catch(err){if(err?.name!=='AbortError')console.warn(err);}}els.fileInput.click();}
async function pickFolder(){if('showDirectoryPicker'in window){try{const dir=await showDirectoryPicker(),files=[];async function walk(h){for await(const[,e]of h.entries()){if(e.kind==='file'){const f=await e.getFile();if(isMediaFile(f))files.push(f);}else if(e.kind==='directory')await walk(e);}}await walk(dir);return importFiles(files);}catch(err){if(err?.name!=='AbortError')console.warn(err);}}els.folderInput.click();}
async function reconcileMissingPlaceholder(track){
  const placeholder=state.tracks.find(t=>t.sourceMissing&&t.sourceKind==='local'&&((t.fileName&&track.fileName&&t.fileName.toLowerCase()===track.fileName.toLowerCase())||(!t.fileName&&t.title?.toLowerCase()===track.title?.toLowerCase())));
  if(!placeholder||placeholder.id===track.id)return track;
  track.favorite=!!(track.favorite||placeholder.favorite);track.validPlays=Math.max(track.validPlays||0,placeholder.validPlays||0);track.playCount=track.validPlays;track.completedPlays=Math.max(track.completedPlays||0,placeholder.completedPlays||0);track.listenedMs=Math.max(track.listenedMs||0,placeholder.listenedMs||0);track.skipCount=Math.max(track.skipCount||0,placeholder.skipCount||0);track.replayCount=Math.max(track.replayCount||0,placeholder.replayCount||0);
  for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).map(id=>id===placeholder.id?track.id:id);pl.trackIds=[...new Set(pl.trackIds)];await persistPlaylist(pl);}
  state.queueIds=state.queueIds.map(id=>id===placeholder.id?track.id:id);state.tracks=state.tracks.filter(t=>t.id!==placeholder.id);if(state.storageReady)await db.delete('tracks',placeholder.id).catch(()=>{});return track;
}
async function importFiles(fileLike){
  const files=Array.from(fileLike||[]).filter(isMediaFile);if(!files.length)return toast('No se encontraron archivos multimedia');showLoader('Cargando música…',`${files.length} archivo${files.length>1?'s':''}`);let i=0;
  for(const file of files){i++;els.loaderText.textContent=`${i}/${files.length} · ${file.name}`;const meta=await parseAudioTags(file);meta.duration=await getDuration(file).catch(()=>0);let t=makeTrack(file,meta);t=await reconcileMissingPlaceholder(t);await saveTrackAndSource(t,file);await sleep(15);}
  hideLoader();await persistPrefs();render();showView('library');toast(files.length===1?'Archivo cargado':`Se cargaron ${files.length} archivos`);
}

function seekFromRange(){const pct=Number(els.progressRange.value)/100;if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo((ytPlayer.getDuration()||0)*pct,true);}catch{}}else if(state.currentEngine==='soundcloud'&&scWidget){const d=getCurrentTrack()?.duration||0;scWidget.seekTo(d*1000*pct);}else{const d=els.audio.duration||0;if(d)els.audio.currentTime=d*pct;}}
function setupMediaSession(){if(!('mediaSession'in navigator))return;const t=getCurrentTrack();if(t)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist||sourceLabel(t),album:t.album||'MUSIC PLAY'});try{navigator.mediaSession.setActionHandler('play',togglePlay);navigator.mediaSession.setActionHandler('pause',togglePlay);navigator.mediaSession.setActionHandler('previoustrack',prevTrack);navigator.mediaSession.setActionHandler('nexttrack',nextTrack);}catch{}}
async function registerSW(){
  if(!('serviceWorker'in navigator)||location.protocol==='file:')return null;
  try{
    const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    wireServiceWorker(reg);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(state.refreshingForUpdate)location.reload();});
    return reg;
  }catch(err){console.warn('SW',err);return null;}
}

function bindEvents(){
  els.homeBtn.onclick=()=>showView('home');
  els.moreBtn.onclick=openMoreMenu;
  els.favoritesShortcut.onclick=()=>openSmartCollection(SMART_IDS.favorites);
  els.mostPlayedShortcut.onclick=()=>openSmartCollection(SMART_IDS.most);
  $$('[data-go]').forEach(b=>b.onclick=()=>showView(b.dataset.go));
  els.loadAction.onclick=openLoadSheet;
  els.loadFilesQuick.onclick=pickFiles;
  els.loadFolderQuick.onclick=pickFolder;
  els.loadLinkQuick.onclick=()=>openLinkSheet();
  els.playAction.onclick=togglePlay;
  els.playlistAction.onclick=()=>{state.playlistDetailOpen=false;showView('playlist');};
  els.mixAction.onclick=()=>startMix(getFilteredTracks().map(t=>t.id));
  els.openLibraryQuick.onclick=()=>showView('library');
  els.createPlaylistQuick.onclick=()=>openCreatePlaylistSheet();
  els.libraryAddBtn.onclick=openLoadSheet;
  els.libraryFavoritesBtn.onclick=()=>openSmartCollection(SMART_IDS.favorites);
  els.createFromLibraryBtn.onclick=openCreateFromLibrarySheet;
  els.emptyLoadBtn.onclick=openLoadSheet;

  els.newPlaylistBtn.onclick=()=>openCreatePlaylistSheet();
  els.importPlaylistBtn.onclick=()=>openLinkSheet();
  els.emptyNewPlaylistBtn.onclick=()=>openCreatePlaylistSheet();
  els.emptyImportPlaylistBtn.onclick=()=>openLinkSheet();
  els.playlistDetailBack.onclick=closePlaylistDetail;
  els.playlistMenuBtn.onclick=openPlaylistMenuSheet;
  els.openLibraryFromPlaylists.onclick=()=>{const pl=getActivePlaylist();if(pl)openAddSongsToPlaylistSheet(pl.id);};
  els.addLinkToPlaylistBtn.onclick=()=>{const pl=getActivePlaylist();if(pl)openLinkSheet('',pl.id);};
  els.playPlaylistBtn.onclick=()=>{
    if(state.activeSmartId){const tracks=getSmartTracks(state.activeSmartId).filter(playable);return tracks.length?playTrack(tracks[0].id,tracks.map(t=>t.id)):toast('Esta lista automática todavía está vacía');}
    const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');
    const tracks=getPlaylistTracks(pl).filter(playable);
    if(tracks.length)return playTrack(tracks[0].id,tracks.map(t=>t.id));
    if((pl.sources||[]).length||pl.externalRef)return playExternalPlaylist(pl);
    toast('Esta playlist está vacía');
  };
  els.mixPlaylistBtn.onclick=()=>{if(state.activeSmartId)return startMix(getSmartTracks(state.activeSmartId).map(t=>t.id));const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');startMix(pl.trackIds||[]);};

  els.searchInput.oninput=()=>{state.search=els.searchInput.value;renderLibrary();};
  els.fileInput.onchange=()=>{importFiles(els.fileInput.files);els.fileInput.value='';};
  els.folderInput.onchange=()=>{importFiles(els.folderInput.files);els.folderInput.value='';};
  els.backupInput.onchange=()=>{const f=els.backupInput.files?.[0];els.backupInput.value='';if(f)restoreBackupFile(f);};
  els.m3uInput.onchange=()=>{const f=els.m3uInput.files?.[0];els.m3uInput.value='';if(f)importM3UFile(f);};

  els.miniOpen.onclick=()=>openDialog(els.playerDialog);
  [els.playBtn,els.fullPlayBtn].forEach(b=>b.onclick=togglePlay);
  [els.prevBtn,els.fullPrevBtn].forEach(b=>b.onclick=prevTrack);
  [els.nextBtn,els.fullNextBtn].forEach(b=>b.onclick=nextTrack);
  els.shuffleBtn.onclick=()=>{state.shuffle=!state.shuffle;persistPrefs();renderPlayer();toast(state.shuffle?'Mix activado':'Mix desactivado');};
  els.favoriteBtn.onclick=()=>toggleFavorite();
  els.miniFavoriteBtn.onclick=e=>{e.stopPropagation();toggleFavorite();};
  els.progressRange.oninput=seekFromRange;
  els.volumeRange.oninput=()=>{state.volume=Number(els.volumeRange.value)||0;els.audio.volume=state.volume;if(ytPlayer)try{ytPlayer.setVolume(Math.round(state.volume*100));}catch{}if(scWidget)try{scWidget.setVolume(Math.round(state.volume*100));}catch{}persistPrefs();};
  els.addCurrentToPlaylist.onclick=()=>{const t=getCurrentTrack();if(t)openPlaylistPickerSheet(t.id);};

  els.audio.addEventListener('timeupdate',updateProgress);
  els.audio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(t&&!t.duration&&Number.isFinite(els.audio.duration)){t.duration=els.audio.duration;saveRemoteTrack(t);}updateProgress();});
  els.audio.addEventListener('play',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=true;renderPlayer();}});
  els.audio.addEventListener('pause',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=false;renderPlayer();}});
  els.audio.addEventListener('ended',handleNaturalEnd);
  els.audio.addEventListener('error',()=>{if(['local','direct'].includes(state.currentEngine))toast('Este formato o enlace no pudo reproducirse en el navegador',3800);});

  ['dragenter','dragover'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropHint.classList.add('show');}));
  ['dragleave','drop'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();if(ev==='drop'||!e.relatedTarget)els.dropHint.classList.remove('show');}));
  window.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)importFiles(e.dataTransfer.files);});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;syncInstallUI();});
  window.addEventListener('appinstalled',()=>{state.installPrompt=null;syncInstallUI();toast('MUSIC PLAY instalada ✓');});
  els.installBtn.onclick=openInstallSheet;
  els.updateBtn.onclick=applyAvailableUpdate;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdates(false);});
  window.addEventListener('online',()=>checkForUpdates(true));
  document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.key.toLowerCase()==='m')startMix(getFilteredTracks().map(t=>t.id));else if(e.key.toLowerCase()==='l')showView('library');else if(e.key.toLowerCase()==='p'){state.playlistDetailOpen=false;showView('playlist');}});
  window.addEventListener('pagehide',()=>{finalizeListenSession('pause');persistPrefs();});
  window.addEventListener('beforeunload',persistPrefs);
}

async function init(){
  document.documentElement.dataset.theme=state.theme;
  try{state.storageReady=await db.init();}catch{state.storageReady=false;}
  await loadStoredData();
  bindEvents();
  syncInstallUI();
  await registerSW();
  render();
  els.audio.volume=state.volume;
  setupMediaSession();
  checkForUpdates(true);
  await sleep(2000);
  els.intro.classList.add('hide');
  els.app.classList.remove('is-hidden');
  setTimeout(()=>els.intro.remove(),450);
}
init().catch(err=>{console.error(err);els.intro?.classList.add('hide');els.app?.classList.remove('is-hidden');toast('La app abrió en modo seguro');});

})();
