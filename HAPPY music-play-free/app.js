(() => {
'use strict';

const BUILD = '2026.09.01-r10-library-first';
const DB_NAME = 'mpf-minimal-db';
const DB_VERSION = 5;
const PLAYABLE_SOURCES = new Set(['local','direct','youtube','soundcloud','youtube-playlist']);
const MEDIA_EXT = new Set(['mp3','m4a','aac','wav','ogg','oga','opus','flac','webm','mp4','m4v','mov','3gp','wma','wmv','avi','mkv']);
const VIDEO_EXT = new Set(['mp4','m4v','mov','3gp','webm','wmv','avi','mkv']);
const SMART_IDS = Object.freeze({favorites:'smart:favorites',most:'smart:most',recent:'smart:recent',repeat:'smart:repeat'});
const PLAY_MODES = Object.freeze({normal:'normal',shuffle:'shuffle',smart:'smart',radio:'radio',rediscover:'rediscover',surprise:'surprise',live:'live'});
const PLAY_MODE_META = Object.freeze({
  normal:{icon:'≋',name:'Normal',desc:'Respeta el orden de la lista'},
  shuffle:{icon:'⇄',name:'Aleatorio',desc:'Mezcla sin repetir hasta completar la vuelta'},
  smart:{icon:'✦',name:'Mix inteligente',desc:'Gusto, escuchas completas, repeticiones y descubrimiento'},
  radio:{icon:'∞',name:'Radio',desc:'Continúa con música relacionada de tu biblioteca'},
  rediscover:{icon:'◷',name:'Redescubrir',desc:'Recupera canciones buenas que llevas tiempo sin oír'},
  surprise:{icon:'🎲',name:'Sorpréndeme',desc:'Combina música familiar con temas poco escuchados'},
  live:{icon:'≈',name:'Cola Viva',desc:'Recalcula lo siguiente según esta sesión'}
});
const DAY = 86400000;
const TEST_PLAYLISTS = [
  {label:'Prueba 1', url:'https://music.youtube.com/playlist?list=PLW4RwQaj-mTI&si=l26Th21Desx8XOty'},
  {label:'Prueba 2', url:'https://music.youtube.com/playlist?list=PLkFMTdwrLz-QR3GTfoYApADfo_u0a6yjc&si=3vT1gyOGPzA-nYZY'},
  {label:'Prueba 3', url:'https://music.youtube.com/playlist?list=PLbeLb9mBGU24&si=c47-iJJYVcKiz94e'}
];
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const idleYield = (timeout=320) => new Promise(r => window.requestIdleCallback ? requestIdleCallback(()=>r(),{timeout}) : setTimeout(r,28));
const now = () => Date.now();

const els = {
  intro: $('#intro'), app: $('#app'), audio: $('#audio'),
  homeBtn: $('#homeBtn'), installBtn: $('#installBtn'), updateBtn: $('#updateBtn'), moreBtn: $('#moreBtn'),
  homeView: $('#homeView'), searchView: $('#searchView'), libraryView: $('#libraryView'),
  onboardingPanel: $('#onboardingPanel'), matureHome: $('#matureHome'), onboardingInstallBtn: $('#onboardingInstallBtn'), onboardingStep1: $('#onboardingStep1'), onboardingStep2: $('#onboardingStep2'), onboardingStep3: $('#onboardingStep3'),
  onboardingFileBtn: $('#onboardingFileBtn'), onboardingFolderBtn: $('#onboardingFolderBtn'), onboardingLinkBtn: $('#onboardingLinkBtn'), onboardingMusicBtn: $('#onboardingMusicBtn'), onboardingPlayBtn: $('#onboardingPlayBtn'),
  resumeCard: $('#resumeCard'), resumeArtwork: $('#resumeArtwork'), resumeTitle: $('#resumeTitle'), resumeArtist: $('#resumeArtist'), resumePlayIcon: $('#resumePlayIcon'),
  homeRecent: $('#homeRecent'), homePlaylists: $('#homePlaylists'), homeSearchBtn: $('#homeSearchBtn'), homeAllPlaylistsBtn: $('#homeAllPlaylistsBtn'),
  countTracks: $('#countTracks'), countPlaylists: $('#countPlaylists'), countFavorites: $('#countFavorites'), countMost: $('#countMost'), listenTimeHome: $('#listenTimeHome'), favoritesShortcut: $('#favoritesShortcut'), mostPlayedShortcut: $('#mostPlayedShortcut'),
  globalSearchInput: $('#globalSearchInput'), searchLinkHint: $('#searchLinkHint'), searchEmpty: $('#searchEmpty'), searchResults: $('#searchResults'), searchNewBtn: $('#searchNewBtn'),
  libraryMainHead: $('#libraryMainHead'), librarySearchBtn: $('#librarySearchBtn'), libraryAddBtn: $('#libraryAddBtn'), libraryTabs: $('#libraryTabs'), libraryTabPlaylists: $('#libraryTabPlaylists'), libraryTabSongs: $('#libraryTabSongs'), libraryTabAlbums: $('#libraryTabAlbums'), librarySortSelect: $('#librarySortSelect'), librarySortRow: $('#librarySortRow'), libraryCountLabel: $('#libraryCountLabel'),
  libraryPlaylistsPanel: $('#libraryPlaylistsPanel'), librarySongsPanel: $('#librarySongsPanel'), libraryAlbumsPanel: $('#libraryAlbumsPanel'), libraryNewPlaylistFab: $('#libraryNewPlaylistFab'), albumList: $('#albumList'), albumEmpty: $('#albumEmpty'),
  searchInput: $('#searchInput'), genreChips: $('#genreChips'), libraryEmpty: $('#libraryEmpty'), libraryList: $('#libraryList'), emptyLoadBtn: $('#emptyLoadBtn'),
  playlistHub: $('#playlistHub'), playlistHubEmpty: $('#playlistHubEmpty'), playlistDetail: $('#playlistDetail'), playlistList: $('#playlistList'), playlistEmpty: $('#playlistEmpty'),
  playlistDetailBack: $('#playlistDetailBack'), playlistDetailTitle: $('#playlistDetailTitle'), playlistDetailMeta: $('#playlistDetailMeta'), playlistMenuBtn: $('#playlistMenuBtn'), playlistSources: $('#playlistSources'), playlistHeroArtwork: $('#playlistHeroArtwork'),
  emptyNewPlaylistBtn: $('#emptyNewPlaylistBtn'), emptyImportPlaylistBtn: $('#emptyImportPlaylistBtn'), openLibraryFromPlaylists: $('#openLibraryFromPlaylists'), addLinkToPlaylistBtn: $('#addLinkToPlaylistBtn'), playPlaylistBtn: $('#playPlaylistBtn'), mixPlaylistBtn: $('#mixPlaylistBtn'),
  navHome: $('#navHome'), navSearch: $('#navSearch'), navLibrary: $('#navLibrary'), bottomNav: $('#bottomNav'),
  miniPlayer: $('#miniPlayer'), miniOpen: $('#miniOpen'), miniTitle: $('#miniTitle'), miniArtist: $('#miniArtist'), miniFavoriteBtn: $('#miniFavoriteBtn'),
  playBtn: $('#playBtn'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'),
  playerDialog: $('#playerDialog'), fullTitle: $('#fullTitle'), fullArtist: $('#fullArtist'), progressRange: $('#progressRange'), timeNow: $('#timeNow'), timeTotal: $('#timeTotal'),
  fullPlayBtn: $('#fullPlayBtn'), fullPrevBtn: $('#fullPrevBtn'), fullNextBtn: $('#fullNextBtn'), shuffleBtn: $('#shuffleBtn'), favoriteBtn: $('#favoriteBtn'), volumeRange: $('#volumeRange'), addCurrentToPlaylist: $('#addCurrentToPlaylist'), miniArtwork: $('#miniArtwork'), playerArtwork: $('#playerArtwork'),
  sheetDialog: $('#sheetDialog'), sheetContent: $('#sheetContent'),
  remoteDock: $('#remoteDock'), remoteStage: $('#remoteStage'), remoteLabel: $('#remoteLabel'), ytProbeHost: $('#ytProbeHost'),
  dropHint: $('#dropHint'), loader: $('#loader'), loaderTitle: $('#loaderTitle'), loaderText: $('#loaderText'), loaderProgress: $('#loaderProgress'), toast: $('#toast'),
  fileInput: $('#fileInput'), folderInput: $('#folderInput'), backupInput: $('#backupInput'), m3uInput: $('#m3uInput')
};

const sessionFiles = new Map();
const artworkCache = new Map();
let ytApiPromise = null;
let ytPlayer = null;
let ytProbePlayer = null;
let ytProgressTimer = null;
let scApiPromise = null;
let scWidget = null;
let scProgressTimer = null;

const state = {
  tracks: [], playlists: [], activeView: 'home', libraryTab: 'playlists', activeGenre: 'all', activePlaylistId: '', playlistDetailOpen: false,
  currentId: null, queueIds: [], baseQueueIds: [], queueIndex: -1, playing: false, shuffle: false, playbackMode: PLAY_MODES.normal,
  modePlayedIds: [], navHistory: [], volume: 0.92, search: '', globalSearch: '', librarySort: 'recent', theme: 'dark', objectUrl: null, installPrompt: null, storageReady: false,
  swRegistration: null, updateAvailable: false, remoteBuild: null, lastUpdateCheck: 0, refreshingForUpdate: false,
  currentEngine: 'none', activeSmartId: '', listenSession: null, history: [], renderChunk: 60,
  lastImportIds: [], lastImportLabel: '', lastImportAt: 0, remoteExpectedPlaying: false, installCoachShown: false,
  importJob: null, enrichmentQueue: [], enrichmentRunning: false, fileHandlesSupported: false, firstRunComplete: false
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
        if(!d.objectStoreNames.contains('covers')) d.createObjectStore('covers',{keyPath:'id'});
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
  async putMany(store,values){ if(!this.instance||!values?.length) return false; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');const os=tx.objectStore(store);for(const value of values)os.put(value);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('IDB batch aborted'));}); },
  async delete(store,key){ if(!this.instance) return; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');tx.objectStore(store).delete(key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);}); },
  async add(store,val){ if(!this.instance) return false; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');tx.objectStore(store).add(val);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);}); },
  async clear(store){ if(!this.instance) return; return new Promise((resolve,reject)=>{const tx=this.instance.transaction(store,'readwrite');tx.objectStore(store).clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);}); }
};

function extOf(name){ const i=(name||'').lastIndexOf('.'); return i<0?'':name.slice(i+1).toLowerCase(); }
function isMediaFile(file){ return (file.type||'').startsWith('audio/') || (file.type||'').startsWith('video/') || MEDIA_EXT.has(extOf(file.name||'')); }
function cleanName(name){ return (name||'').replace(/\.[^.]+$/,'').replace(/[_.]+/g,' ').replace(/\s+/g,' ').trim(); }
function folderFromFile(file){const rp=file?.webkitRelativePath||'';if(rp.includes('/'))return rp.split('/').slice(0,-1).join('/');return '';}
function topFolderFromFile(file){const rp=file?.webkitRelativePath||'';return rp.includes('/')?rp.split('/')[0]:'';}
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
    folder:t.folder||'',enriched:!!t.enriched,enrichError:t.enrichError||'',sourceMissing:!!t.sourceMissing};
}
function normalizePlaylist(pl){
  const sources=Array.isArray(pl.sources)?pl.sources.filter(Boolean):[];
  if(pl.externalRef&&!sources.some(s=>s.playlistId&&s.playlistId===pl.externalRef.playlistId)){
    sources.push({id:`src_${remoteHash(pl.externalRef.url||pl.externalRef.playlistId||String(pl.id))}`,source:pl.externalRef.source||'YouTube',url:pl.externalRef.url||'',originalUrl:pl.externalRef.originalUrl||pl.externalRef.url||'',playlistId:pl.externalRef.playlistId||'',status:pl.importDiagnostic?.status||'linked',count:Number(pl.importDiagnostic?.count)||0,message:pl.importDiagnostic?.message||'',addedAt:pl.createdAt||now()});
  }
  const createdAt=Number(pl.createdAt)||now();return {...pl,trackIds:Array.from(new Set(pl.trackIds||[])),sources,createdAt,updatedAt:Number(pl.updatedAt)||createdAt};
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
    const buf=await file.slice(0,Math.min(file.size,1_500_000)).arrayBuffer();const b=new Uint8Array(buf);
    if(b.length>=10&&b[0]===73&&b[1]===68&&b[2]===51){
      const ver=b[3],tagSize=synchsafe(b[6],b[7],b[8],b[9]);let pos=10,end=Math.min(b.length,10+tagSize);
      while(pos+10<=end){
        const id=String.fromCharCode(b[pos],b[pos+1],b[pos+2],b[pos+3]);if(!/^[A-Z0-9]{4}$/.test(id))break;
        const size=ver===4?synchsafe(b[pos+4],b[pos+5],b[pos+6],b[pos+7]):u32(b,pos+4);if(!size)break;
        const data=b.slice(pos+10,Math.min(pos+10+size,end));
        if(['TIT2','TPE1','TALB','TCON'].includes(id)&&data.length>1){
          const v=decodeText(data.slice(1),data[0]);if(id==='TIT2')out.title=v;if(id==='TPE1')out.artist=v;if(id==='TALB')out.album=v;if(id==='TCON')out.genre=v.replace(/\(\d+\)/g,'').trim();
        }else if(id==='APIC'&&data.length>12&&!out.coverBlob){
          try{
            const enc=data[0];let i=1,mimeEnd=i;while(mimeEnd<data.length&&data[mimeEnd]!==0)mimeEnd++;
            const mime=decodeText(data.slice(i,mimeEnd),0)||'image/jpeg';i=mimeEnd+1;if(i<data.length)i++;
            if(enc===0||enc===3){while(i<data.length&&data[i]!==0)i++;i++;}
            else{while(i+1<data.length&&!(data[i]===0&&data[i+1]===0))i+=2;i+=2;}
            if(i<data.length){const img=data.slice(i);if(img.length>128&&/^image\//i.test(mime))out.coverBlob=new Blob([img],{type:mime});}
          }catch{}
        }
        pos+=10+size;
      }
    }
  }catch{}
  return out;
}
async function captureVideoArtwork(file){
  if(!VIDEO_EXT.has(extOf(file.name||'')))return null;
  return new Promise(resolve=>{
    const v=document.createElement('video'),url=URL.createObjectURL(file);let done=false;
    const finish=blob=>{if(done)return;done=true;try{v.pause();v.removeAttribute('src');v.load();}catch{}URL.revokeObjectURL(url);resolve(blob||null);};
    const timer=setTimeout(()=>finish(null),5500);
    v.muted=true;v.playsInline=true;v.preload='metadata';
    v.onloadedmetadata=()=>{try{v.currentTime=Math.min(Math.max(.15,(v.duration||1)*.08),1.5);}catch{}};
    v.onseeked=()=>{try{const w=v.videoWidth||320,h=v.videoHeight||180;if(!w||!h)return finish(null);const max=420,scale=Math.min(1,max/Math.max(w,h));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));c.getContext('2d').drawImage(v,0,0,c.width,c.height);c.toBlob(blob=>{clearTimeout(timer);finish(blob);},'image/jpeg',.78);}catch{clearTimeout(timer);finish(null);}};
    v.onerror=()=>{clearTimeout(timer);finish(null);};v.src=url;
  });
}
async function saveCover(trackId,blob){if(!blob)return;if(artworkCache.has(trackId)){try{URL.revokeObjectURL(artworkCache.get(trackId));}catch{}artworkCache.delete(trackId);}try{artworkCache.set(trackId,URL.createObjectURL(blob));}catch{}if(!state.storageReady)return;try{await db.put('covers',{id:trackId,blob});}catch{}}
async function getCoverBlob(trackId){if(!state.storageReady)return null;try{return (await db.get('covers',trackId))?.blob||null;}catch{return null;}}
async function artworkUrlFor(track){
  if(!track)return '';
  if(track.thumbnail)return track.thumbnail;
  if(artworkCache.has(track.id))return artworkCache.get(track.id);
  if(track.hasCover){const blob=await getCoverBlob(track.id);if(blob){const url=URL.createObjectURL(blob);artworkCache.set(track.id,url);return url;}}
  return '';
}
function setArtworkNode(node,url,fallback='♪'){
  if(!node)return;node.innerHTML='';
  if(url){const img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';img.decoding='async';img.onerror=()=>{node.textContent=fallback;};node.appendChild(img);}else node.textContent=fallback;
}
async function hydrateArtwork(track,node,fallback='♪'){const url=await artworkUrlFor(track);setArtworkNode(node,url,fallback);}
async function getDuration(file,timeout=5000){return new Promise(resolve=>{const a=document.createElement('audio'),url=URL.createObjectURL(file);let done=false;const finish=v=>{if(done)return;done=true;URL.revokeObjectURL(url);a.src='';resolve(Number.isFinite(v)?v:0);};const t=setTimeout(()=>finish(0),timeout);a.onloadedmetadata=()=>{clearTimeout(t);finish(a.duration)};a.onerror=()=>{clearTimeout(t);finish(0)};a.preload='metadata';a.src=url;});}

function makeTrack(file,meta={}){return normalizeTrack({id:hashId(file),fileName:file.name,title:meta.title||cleanName(file.name)||'Sin título',artist:meta.artist||'Desconocido',album:meta.album||'',genre:meta.genre||'',folder:meta.folder||folderFromFile(file)||'',duration:Number(meta.duration)||0,size:file.size,type:file.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:'local',sourceMissing:false,hasCover:!!meta.coverBlob,enriched:!!meta.enriched,mediaKind:VIDEO_EXT.has(extOf(file.name))?'video':'audio'});}
function makeRemoteTrack(kind,url,extra={}){const remoteId=extra.remoteId||remoteHash(url);return normalizeTrack({id:extra.id||`${kind}_${remoteId}`,fileName:'',title:extra.title||`${kind==='youtube'?'YouTube':kind==='soundcloud'?'SoundCloud':'Enlace'} · ${remoteId.slice(0,8)}`,artist:extra.artist||({youtube:'YouTube',soundcloud:'SoundCloud',direct:'Enlace directo',external:'Fuente externa','youtube-playlist':'YouTube'})[kind]||'Enlace',album:extra.album||'',genre:extra.genre||'',duration:Number(extra.duration)||0,size:0,type:extra.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:kind,remoteUrl:url,remoteId,thumbnail:extra.thumbnail||'',mediaKind:extra.mediaKind||'audio',...extra});}

async function saveTrackAndSource(track,file=null,sourceExtra=null){
  track=normalizeTrack(track);
  if(file||sourceExtra?.handle)track.sourceMissing=false;
  const idx=state.tracks.findIndex(t=>t.id===track.id);
  if(idx>=0){
    const prev=normalizeTrack(state.tracks[idx]);
    track=normalizeTrack({...prev,...track,favorite:!!(prev.favorite||track.favorite),starts:Math.max(prev.starts||0,track.starts||0),validPlays:Math.max(prev.validPlays||0,track.validPlays||0),completedPlays:Math.max(prev.completedPlays||0,track.completedPlays||0),listenedMs:Math.max(prev.listenedMs||0,track.listenedMs||0),skipCount:Math.max(prev.skipCount||0,track.skipCount||0),replayCount:Math.max(prev.replayCount||0,track.replayCount||0),lastStarted:Math.max(prev.lastStarted||0,track.lastStarted||0),lastPlayed:Math.max(prev.lastPlayed||0,track.lastPlayed||0),lastValidAt:Math.max(prev.lastValidAt||0,track.lastValidAt||0),lastCompleted:Math.max(prev.lastCompleted||0,track.lastCompleted||0),addedAt:prev.addedAt||track.addedAt});
    state.tracks[idx]=track;
  }else state.tracks.push(track);
  if(file)sessionFiles.set(track.id,file);
  if(state.storageReady){
    await db.put('tracks',track).catch(()=>{});
    if(sourceExtra?.handle) await db.put('sources',{id:track.id,kind:'handle',handle:sourceExtra.handle,name:file?.name||track.fileName,type:file?.type||track.type,lastModified:file?.lastModified||0}).catch(()=>{});
    else if(file && sourceExtra?.persist!==false) await db.put('sources',{id:track.id,kind:'blob',blob:file,name:file.name,type:file.type,lastModified:file.lastModified}).catch(()=>{});
  }
  return track;
}

async function saveRemoteTrack(track){await saveTrackAndSource(track,null);return track;}
async function loadStoredData(){
  if(state.storageReady){
    state.tracks=(await db.getAll('tracks')).map(normalizeTrack).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
    state.playlists=(await db.getAll('playlists')).map(normalizePlaylist).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    state.history=(await db.getAll('history')).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,2500);
    const p=await db.get('prefs','ui');
    if(p){state.currentId=p.currentId||null;state.queueIds=p.queueIds||[];state.baseQueueIds=p.baseQueueIds||p.queueIds||[];state.queueIndex=Number.isInteger(p.queueIndex)?p.queueIndex:-1;state.volume=Number.isFinite(p.volume)?p.volume:.92;state.activePlaylistId=p.activePlaylistId||'';state.activeSmartId=p.activeSmartId||'';state.theme=p.theme||'dark';state.libraryTab=['playlists','songs','albums'].includes(p.libraryTab)?p.libraryTab:'playlists';state.librarySort=['recent','name','played'].includes(p.librarySort)?p.librarySort:'recent';state.firstRunComplete=!!p.firstRunComplete;state.playbackMode=Object.values(PLAY_MODES).includes(p.playbackMode)?p.playbackMode:(p.shuffle?PLAY_MODES.shuffle:PLAY_MODES.normal);state.shuffle=state.playbackMode===PLAY_MODES.shuffle;}
    if(p&&p.firstRunComplete===undefined&&state.tracks.length)state.firstRunComplete=true;
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
async function persistPrefs(){if(!state.storageReady)return;await db.put('prefs',{key:'ui',currentId:state.currentId,queueIds:state.queueIds,baseQueueIds:state.baseQueueIds,queueIndex:state.queueIndex,volume:state.volume,activePlaylistId:state.activePlaylistId,activeSmartId:state.activeSmartId,theme:state.theme,libraryTab:state.libraryTab,librarySort:state.librarySort,firstRunComplete:state.firstRunComplete,playbackMode:state.playbackMode,shuffle:state.playbackMode===PLAY_MODES.shuffle}).catch(()=>{});}
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

function uniquePlayableIds(ids){return [...new Set(ids||[])].filter(id=>state.tracks.some(t=>t.id===id&&playable(t)));}
function shuffleCopy(ids){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function currentModeContextIds(){
  if(state.baseQueueIds?.length)return uniquePlayableIds(state.baseQueueIds);
  if(state.activeView==='library'&&state.libraryTab==='playlists'&&state.playlistDetailOpen){
    if(state.activeSmartId)return getSmartTracks(state.activeSmartId).map(t=>t.id);
    const pl=getActivePlaylist();if(pl)return uniquePlayableIds(pl.trackIds||[]);
  }
  return getFilteredTracks().filter(playable).map(t=>t.id);
}
function daysSince(ts){return ts?Math.max(0,(now()-ts)/DAY):9999;}
function relatedScore(anchor,t){
  if(!t||!anchor||t.id===anchor.id)return-999;
  let score=0;
  if(anchor.genre&&t.genre&&anchor.genre.toLowerCase()===t.genre.toLowerCase())score+=14;
  if(anchor.artist&&t.artist&&anchor.artist!=='Desconocido'&&anchor.artist.toLowerCase()===t.artist.toLowerCase())score+=10;
  if(anchor.album&&t.album&&anchor.album.toLowerCase()===t.album.toLowerCase())score+=5;
  score+=Math.max(-3,Math.min(10,smartScore(t)*.45));
  if(t.favorite)score+=3;
  score-=Math.min(7,(t.skipCount||0)*1.3);
  if(daysSince(t.lastPlayed)<2)score-=4;
  return score+Math.random()*4;
}
function radioOrder(anchorId,limit=80){
  const anchor=state.tracks.find(t=>t.id===anchorId&&playable(t))||state.tracks.find(playable);if(!anchor)return[];
  const pool=state.tracks.filter(t=>playable(t)&&t.id!==anchor.id).sort((a,b)=>relatedScore(anchor,b)-relatedScore(anchor,a));
  return [anchor.id,...pool.slice(0,limit).map(t=>t.id)];
}
function rediscoverOrder(limit=100){
  let pool=state.tracks.filter(playable).filter(t=>t.favorite||(t.validPlays||0)>0||(t.completedPlays||0)>0);
  if(!pool.length)pool=state.tracks.filter(playable);
  pool.sort((a,b)=>{
    const sa=(a.favorite?12:0)+(a.completedPlays||0)*2+(a.validPlays||0)+Math.min(120,daysSince(a.lastPlayed))*.18-(a.skipCount||0)*1.5;
    const sb=(b.favorite?12:0)+(b.completedPlays||0)*2+(b.validPlays||0)+Math.min(120,daysSince(b.lastPlayed))*.18-(b.skipCount||0)*1.5;
    return sb-sa;
  });
  return pool.slice(0,limit).map(t=>t.id);
}
function surpriseOrder(contextIds){
  const base=uniquePlayableIds(contextIds?.length?contextIds:state.tracks.map(t=>t.id));
  const pool=base.map(id=>state.tracks.find(t=>t.id)).filter(Boolean);
  let familiar=pool.filter(t=>t.favorite||(t.validPlays||0)>0).sort((a,b)=>smartScore(b)-smartScore(a));
  let discovery=pool.filter(t=>(t.validPlays||0)===0||daysSince(t.lastPlayed)>60);
  familiar=shuffleCopy(familiar.map(t=>t.id));discovery=shuffleCopy(discovery.map(t=>t.id));
  if(!familiar.length)familiar=shuffleCopy(base);if(!discovery.length)discovery=shuffleCopy(base.filter(id=>!familiar.slice(0,Math.ceil(base.length*.6)).includes(id)));
  const out=[];let fi=0,di=0;while(out.length<base.length&&(fi<familiar.length||di<discovery.length)){
    for(let n=0;n<3&&fi<familiar.length;n++,fi++)if(!out.includes(familiar[fi]))out.push(familiar[fi]);
    if(di<discovery.length){if(!out.includes(discovery[di]))out.push(discovery[di]);di++;}
  }
  for(const id of base)if(!out.includes(id))out.push(id);return out;
}
function weightedPick(candidates,scoreFn){
  if(!candidates.length)return null;const weighted=candidates.map(t=>({t,w:Math.max(.1,Number(scoreFn(t))||.1)}));const total=weighted.reduce((n,x)=>n+x.w,0);let r=Math.random()*total;for(const x of weighted){r-=x.w;if(r<=0)return x.t;}return weighted[weighted.length-1].t;
}
function pickRadioNext(){
  const anchor=getCurrentTrack();if(!anchor)return null;let pool=state.tracks.filter(t=>playable(t)&&t.id!==anchor.id&&!state.modePlayedIds.includes(t.id));
  if(!pool.length){state.modePlayedIds=state.currentId?[state.currentId]:[];pool=state.tracks.filter(t=>playable(t)&&t.id!==anchor.id);}
  return weightedPick(pool,t=>Math.max(.2,relatedScore(anchor,t)+8));
}
function pickLiveNext(){
  const anchor=getCurrentTrack();let pool=state.tracks.filter(t=>playable(t)&&t.id!==state.currentId&&!state.modePlayedIds.slice(-25).includes(t.id));
  if(!pool.length){state.modePlayedIds=state.currentId?[state.currentId]:[];pool=state.tracks.filter(t=>playable(t)&&t.id!==state.currentId);}
  return weightedPick(pool,t=>{
    const affinity=anchor?Math.max(0,relatedScore(anchor,t)):0;
    const sessionTaste=Math.max(0,smartScore(t))+4;
    const freshness=Math.min(8,daysSince(t.lastPlayed)/10);
    return sessionTaste+affinity*.7+freshness-(t.skipCount||0)*1.4+Math.random()*3;
  });
}
function prepareModeQueue(mode,contextIds,currentId=''){
  const base=uniquePlayableIds(contextIds?.length?contextIds:state.tracks.map(t=>t.id));if(!base.length)return[];
  const current=currentId&&base.includes(currentId)?currentId:(state.currentId&&playable(getCurrentTrack())?state.currentId:'');
  if(mode===PLAY_MODES.normal)return base;
  if(mode===PLAY_MODES.shuffle){const rest=shuffleCopy(base.filter(id=>id!==current));return current?[current,...rest]:rest;}
  if(mode===PLAY_MODES.smart){const order=smartMixOrder(base);return current?[current,...order.filter(id=>id!==current)]:order;}
  if(mode===PLAY_MODES.radio){const order=radioOrder(current||base[0]);return current?order:[...order];}
  if(mode===PLAY_MODES.rediscover){const order=rediscoverOrder();return current?[current,...order.filter(id=>id!==current)]:order;}
  if(mode===PLAY_MODES.surprise){const order=surpriseOrder(base);return current?[current,...order.filter(id=>id!==current)]:order;}
  if(mode===PLAY_MODES.live){const initial=current?[current]:[];let pool=state.tracks.filter(playable).filter(t=>!initial.includes(t.id));for(let i=0;i<Math.min(14,pool.length);i++){const a=state.tracks.find(t=>t.id===(initial[initial.length-1]||current));const pick=weightedPick(pool,t=>Math.max(.2,(a?relatedScore(a,t):0)+smartScore(t)+9));if(!pick)break;initial.push(pick.id);pool=pool.filter(t=>t.id!==pick.id);}return initial.length?initial:base;}
  return base;
}
async function setPlaybackMode(mode,{autoplay=false,contextIds=null}={}){
  if(!Object.values(PLAY_MODES).includes(mode))mode=PLAY_MODES.normal;
  const base=uniquePlayableIds(contextIds?.length?contextIds:currentModeContextIds());if(!base.length)return toast('No hay fuentes reproducibles en esta selección');
  state.playbackMode=mode;state.shuffle=mode===PLAY_MODES.shuffle;state.baseQueueIds=[...base];state.modePlayedIds=state.currentId?[state.currentId]:[];
  const order=prepareModeQueue(mode,base,state.currentId);state.queueIds=order;state.queueIndex=Math.max(0,order.indexOf(state.currentId));
  await persistPrefs();renderPlayer();
  const meta=PLAY_MODE_META[mode];toast(`${meta.icon} ${meta.name} · ${meta.desc}`,3400);
  if(autoplay){const id=state.currentId&&order.includes(state.currentId)?state.currentId:order[0];if(id)await playTrack(id,order,{preserveBase:true});}
}
function openPlaybackModesSheet({contextIds=null}={}){
  const current=state.playbackMode||PLAY_MODES.normal;
  const order=[PLAY_MODES.normal,PLAY_MODES.shuffle,PLAY_MODES.smart,PLAY_MODES.radio,PLAY_MODES.rediscover,PLAY_MODES.surprise,PLAY_MODES.live];
  openSheet(`<h2 class="sheet-title">Modo de reproducción</h2><p class="sheet-copy">Elige cómo debe construir MUSIC PLAY la siguiente canción. El modo queda activo hasta que lo cambies.</p><div class="mode-list">${order.map(mode=>{const m=PLAY_MODE_META[mode];return `<button class="sheet-btn mode-choice${mode===current?' selected':''}" data-mode="${mode}"><span class="mode-choice-icon">${m.icon}</span><span>${m.name}<small>${m.desc}</small></span>${mode===current?'<b>✓</b>':''}</button>`;}).join('')}</div>`,root=>{$$('[data-mode]',root).forEach(b=>b.onclick=async()=>{const mode=b.dataset.mode;closeDialog(els.sheetDialog);await setPlaybackMode(mode,{autoplay:!state.currentId,contextIds});});});
}

function syncBottomNav(){
  const active=state.activeView==='search'?'search':state.activeView==='library'?'library':'home';
  [[els.navHome,'home'],[els.navSearch,'search'],[els.navLibrary,'library']].forEach(([btn,name])=>btn?.classList.toggle('active',name===active));
}
function showView(name){
  if(name==='playlist'){state.libraryTab='playlists';name='library';}
  if(!['home','search','library'].includes(name))name='home';
  state.activeView=name;
  if(name!=='library')state.playlistDetailOpen=false;
  [els.homeView,els.searchView,els.libraryView].forEach(v=>v?.classList.remove('active'));
  ({home:els.homeView,search:els.searchView,library:els.libraryView})[name]?.classList.add('active');
  syncBottomNav();persistPrefs();render();
  if(name==='search')setTimeout(()=>els.globalSearchInput?.focus(),40);
}
function setLibraryTab(tab,{keepDetail=false}={}){
  if(!['playlists','songs','albums'].includes(tab))tab='playlists';
  state.libraryTab=tab;if(!keepDetail){state.playlistDetailOpen=false;state.activeSmartId='';}
  persistPrefs();renderLibraryShell();
}
function renderSummary(){
  const fav=getSmartTracks(SMART_IDS.favorites),most=getSmartTracks(SMART_IDS.most);
  if(els.countTracks)els.countTracks.textContent=state.tracks.length;if(els.countPlaylists)els.countPlaylists.textContent=state.playlists.length;
  if(els.countFavorites)els.countFavorites.textContent=fav.length;if(els.countMost)els.countMost.textContent=most.length;if(els.listenTimeHome)els.listenTimeHome.textContent=formatListenTime(totalListenedMs());
}
function renderGenres(){
  if(!els.genreChips)return;els.genreChips.innerHTML='';for(const[value,label]of genres()){const b=document.createElement('button');b.className=`chip${state.activeGenre===value?' active':''}`;b.textContent=label;b.onclick=()=>{state.activeGenre=value;renderLibrarySongs();};els.genreChips.appendChild(b);}
}
function trackSortValue(t){if(state.librarySort==='played')return (t.validPlays||0)*10+(t.completedPlays||0)*5+(t.lastPlayed||0)/1e12;if(state.librarySort==='name')return 0;return Math.max(t.lastPlayed||0,t.addedAt||0);}
function sortedTracks(list){const out=[...list];if(state.librarySort==='name')return out.sort((a,b)=>(a.title||'').localeCompare(b.title||'','es',{sensitivity:'base'}));return out.sort((a,b)=>trackSortValue(b)-trackSortValue(a));}
function makeTrackRow(track,options={fromPlaylist:false}){
  const row=document.createElement('div');row.className=`track-row${track.id===state.currentId?' active':''}`;row.dataset.id=track.id;
  const source=sourceLabel(track),sub=[track.artist,track.album].filter(Boolean).join(' · ')||track.genre||track.folder||track.remoteUrl||'Audio local';
  const sourceBadge=track.sourceMissing?'<span class="source-badge missing">FALTA ARCHIVO</span>':`<span class="source-badge ${sourceClass(track)}">${source}</span>`;
  const artFallback=track.sourceKind==='youtube'?'▶':track.sourceKind==='soundcloud'?'☁':'♪';
  row.innerHTML=`<div class="track-backdrop"><span>→ Cola</span><span>${options.fromPlaylist?'Quitar ←':'Eliminar ←'}</span></div><div class="track-front"><div class="track-art">${artFallback}</div><div class="track-text"><div class="track-title">${safeText(track.title)}</div><div class="track-sub">${safeText(sub)}</div></div><div class="track-meta"><span class="track-time">${track.duration?formatTime(track.duration):''}</span><div class="badges">${sourceBadge}${track.replayCount?`<span class="badge">↻ ${track.replayCount}</span>`:''}</div></div><div class="row-actions"><button class="row-quick row-heart${track.favorite?' active':''}" title="${track.favorite?'Quitar favorito':'Favorito'}">${track.favorite?'♥':'♡'}</button><button class="row-quick ${options.fromPlaylist?'row-more':'row-add-pl'}" title="${options.fromPlaylist?'Opciones':'Añadir a playlist'}">${options.fromPlaylist?'⋯':'＋'}</button></div></div>`;
  const front=$('.track-front',row),art=$('.track-art',row);hydrateArtwork(track,art,artFallback);bindSwipe(front,track,options);
  front.addEventListener('click',e=>{if(e.target.closest('.row-actions'))return;const ctx=options.contextIds|| (options.fromPlaylist?(state.activeSmartId?getSmartTracks(state.activeSmartId).map(t=>t.id):(getActivePlaylist()?.trackIds||[])):getFilteredTracks().filter(playable).map(t=>t.id));if(playable(track))playTrack(track.id,ctx);else openTrackSheet(track,options);});
  $('.row-heart',row).addEventListener('click',e=>{e.stopPropagation();toggleFavorite(track.id);});
  const q=options.fromPlaylist?$('.row-more',row):$('.row-add-pl',row);if(q)q.addEventListener('click',e=>{e.stopPropagation();options.fromPlaylist?openTrackSheet(track,options):openPlaylistPickerSheet(track.id);});
  front.addEventListener('contextmenu',e=>{e.preventDefault();openTrackSheet(track,options);});let pt=0;front.addEventListener('pointerdown',e=>{if(e.target.closest('.row-actions'))return;pt=setTimeout(()=>openTrackSheet(track,options),520)},{passive:true});['pointerup','pointercancel','pointerleave'].forEach(ev=>front.addEventListener(ev,()=>clearTimeout(pt),{passive:true}));return row;
}
function bindSwipe(front,track,options={}){let sx=0,d=0,active=false;const end=()=>{if(!active)return;active=false;front.style.transition='transform .16s ease';if(d>86)queueTrack(track.id);else if(d<-86){if(options.smart){if(state.activeSmartId===SMART_IDS.favorites&&track.favorite)toggleFavorite(track.id);else toast('Las listas automáticas se actualizan solas');}else options.fromPlaylist?removeFromPlaylist(track.id,state.activePlaylistId):removeTrack(track.id);}front.style.transform='translateX(0)';setTimeout(()=>front.style.transition='',180);};front.addEventListener('pointerdown',e=>{active=true;d=0;sx=e.clientX},{passive:true});front.addEventListener('pointermove',e=>{if(!active)return;d=Math.max(-120,Math.min(120,e.clientX-sx));if(Math.abs(d)>6)front.style.transform=`translateX(${d}px)`},{passive:true});front.addEventListener('pointerup',end);front.addEventListener('pointercancel',end);}
function renderRowsVirtual(container,list,options={}){
  if(!container)return;if(container._observer){try{container._observer.disconnect();}catch{}}
  container.innerHTML='';const chunk=matchMedia('(max-width:800px)').matches?28:44;let shown=0;const contextIds=options.contextIds||list.filter(playable).map(t=>t.id);
  const sentinel=document.createElement('div');sentinel.className='virtual-sentinel';sentinel.textContent=list.length>chunk?'Desliza para ver más':'';
  const append=()=>{const frag=document.createDocumentFragment(),end=Math.min(list.length,shown+chunk);for(let i=shown;i<end;i++)frag.appendChild(makeTrackRow(list[i],{...options,contextIds}));shown=end;if(sentinel.isConnected)container.insertBefore(frag,sentinel);else{container.appendChild(frag);container.appendChild(sentinel);}sentinel.textContent=shown<list.length?`${shown} de ${list.length} · cargando al deslizar`:list.length?`${list.length} canciones`:'';if(shown>=list.length&&container._observer)container._observer.disconnect();};
  container.appendChild(sentinel);append();
  if(shown<list.length&&'IntersectionObserver'in window){const obs=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))requestAnimationFrame(append);},{rootMargin:'650px 0px'});obs.observe(sentinel);container._observer=obs;}else if(shown<list.length){sentinel.onclick=append;sentinel.textContent=`Ver más · ${shown}/${list.length}`;}
}
function getAlbumGroups(){
  const map=new Map();for(const t of state.tracks){const folder=(t.folder||'').split('/').filter(Boolean).pop()||'';const key=(t.album||folder||'').trim();if(!key)continue;const artist=t.artist&&t.artist!=='Desconocido'?t.artist:'';const id=`${key.toLowerCase()}|${artist.toLowerCase()}`;if(!map.has(id))map.set(id,{id,name:key,artist,tracks:[],last:0,plays:0});const g=map.get(id);g.tracks.push(t);g.last=Math.max(g.last,t.lastPlayed||t.addedAt||0);g.plays+=t.validPlays||0;}
  let groups=[...map.values()];if(state.librarySort==='name')groups.sort((a,b)=>a.name.localeCompare(b.name,'es',{sensitivity:'base'}));else if(state.librarySort==='played')groups.sort((a,b)=>b.plays-a.plays);else groups.sort((a,b)=>b.last-a.last);return groups;
}
async function hydratePlaylistArtwork(tracks,node,fallback='≡'){
  if(!node)return;const pool=(tracks||[]).slice(0,4);if(!pool.length){node.textContent=fallback;return;}const urls=(await Promise.all(pool.map(t=>artworkUrlFor(t).catch(()=>'')))).filter(Boolean);if(!urls.length){node.textContent=fallback;return;}node.innerHTML='';node.classList.add('art-collage');for(const url of urls.slice(0,4)){const img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';node.appendChild(img);}
}
function renderLibrarySongs(){renderGenres();const list=sortedTracks(getFilteredTracks());els.libraryEmpty.classList.toggle('is-hidden',list.length>0);els.libraryList.classList.toggle('is-hidden',list.length===0);if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${list.length} ${list.length===1?'canción':'canciones'}`;renderRowsVirtual(els.libraryList,list);}
function renderAlbums(){
  const groups=getAlbumGroups();els.albumEmpty.classList.toggle('is-hidden',groups.length>0);els.albumList.classList.toggle('is-hidden',!groups.length);els.albumList.innerHTML='';if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${groups.length} ${groups.length===1?'álbum':'álbumes'}`;
  for(const g of groups){const card=document.createElement('button');card.className='album-card';card.type='button';card.innerHTML=`<span class="album-art">▣</span><strong>${safeText(g.name)}</strong><small>${safeText(g.artist||'MUSIC PLAY')} · ${g.tracks.length}</small>`;hydratePlaylistArtwork(g.tracks,$('.album-art',card),'▣');card.onclick=()=>openAlbumSheet(g);els.albumList.appendChild(card);}
}
function openAlbumSheet(group){const ids=group.tracks.filter(playable).map(t=>t.id);openSheet(`<h2 class="sheet-title">${safeText(group.name)}</h2><p class="sheet-copy">${safeText(group.artist||'Álbum')} · ${group.tracks.length} canciones</p><div class="sheet-stack"><button class="sheet-btn" data-album-play>▶ Reproducir<small>En orden</small></button><button class="sheet-btn" data-album-mix>⇄ Aleatorio<small>Sin repetir la vuelta</small></button><button class="sheet-btn" data-album-list>♪ Ver canciones<small>Filtrar biblioteca por este álbum</small></button></div>`,root=>{$('[data-album-play]',root).onclick=()=>{closeDialog(els.sheetDialog);if(ids[0])playTrack(ids[0],ids);};$('[data-album-mix]',root).onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:ids});};$('[data-album-list]',root).onclick=()=>{closeDialog(els.sheetDialog);state.libraryTab='songs';state.search=group.name;els.searchInput.value=group.name;renderLibraryShell();};});}
function sortedPlaylists(){const arr=[...state.playlists];arr.sort((a,b)=>{const pin=Number(!!b.pinned)-Number(!!a.pinned);if(pin)return pin;if(state.librarySort==='name')return(a.name||'').localeCompare(b.name||'','es',{sensitivity:'base'});if(state.librarySort==='played'){const ap=getPlaylistTracks(a).reduce((n,t)=>n+(t.validPlays||0),0),bp=getPlaylistTracks(b).reduce((n,t)=>n+(t.validPlays||0),0);return bp-ap;}return Math.max(b.updatedAt||0,b.createdAt||0)-Math.max(a.updatedAt||0,a.createdAt||0);});return arr;}
function renderPlaylists(){
  const hasManual=state.playlists.length>0;els.playlistHub.classList.toggle('is-hidden',state.playlistDetailOpen);els.playlistHubEmpty.classList.add('is-hidden');els.playlistDetail.classList.toggle('is-hidden',!state.playlistDetailOpen);els.libraryNewPlaylistFab.classList.toggle('is-hidden',state.playlistDetailOpen);els.playlistHub.innerHTML='';
  if(!state.playlistDetailOpen){
    if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${state.playlists.length+4} colecciones`;
    const smartTitle=document.createElement('div');smartTitle.className='playlist-section-label';smartTitle.textContent='AUTOMÁTICAS';els.playlistHub.appendChild(smartTitle);
    [SMART_IDS.favorites,SMART_IDS.most,SMART_IDS.recent,SMART_IDS.repeat].forEach(id=>{const meta=smartMeta(id),tracks=getSmartTracks(id),card=document.createElement('button');card.className=`playlist-card smart-playlist-card ${id.split(':')[1]}`;card.type='button';card.innerHTML=`<span class="playlist-card-icon">${meta.icon}</span><span class="playlist-card-copy"><strong>${meta.name}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${meta.subtitle}</small></span><span class="playlist-card-go">›</span>`;card.onclick=()=>openSmartCollection(id);els.playlistHub.appendChild(card);if(tracks.length)hydratePlaylistArtwork(tracks,$('.playlist-card-icon',card),meta.icon);});
    const ownTitle=document.createElement('div');ownTitle.className='playlist-section-label own';ownTitle.textContent='MIS LISTAS';els.playlistHub.appendChild(ownTitle);
    if(!hasManual){const empty=document.createElement('div');empty.className='playlist-inline-empty';empty.innerHTML='<span>≡</span><div><strong>Aún no tienes listas propias</strong><small>Toca + Nueva para crear o importar.</small></div>';els.playlistHub.appendChild(empty);return;}
    for(const pl of sortedPlaylists()){const tracks=getPlaylistTracks(pl),sourceCount=(pl.sources||[]).length,linked=(pl.sources||[]).some(src=>src.status==='linked'),imported=(pl.sources||[]).some(src=>src.status==='imported'),card=document.createElement('button');card.className='playlist-card';card.type='button';const sourceText=sourceCount?`${sourceCount} fuente${sourceCount===1?'':'s'}${linked?' · pendiente':''}`:'Propia';card.innerHTML=`<span class="playlist-card-icon">${imported||linked?'🔗':'≡'}</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${safeText(sourceText)}</small></span><span class="playlist-card-go">›</span>`;card.onclick=()=>openPlaylistDetail(pl.id);els.playlistHub.appendChild(card);if(tracks.length)hydratePlaylistArtwork(tracks,$('.playlist-card-icon',card),imported||linked?'▶':'≡');}
    return;
  }
  if(state.activeSmartId){
    const meta=smartMeta(state.activeSmartId),tracks=getSmartTracks(state.activeSmartId);els.playlistDetailTitle.textContent=meta.name;els.playlistDetailMeta.textContent=`AUTOMÁTICA · ${tracks.length} ${tracks.length===1?'CANCIÓN':'CANCIONES'}`;els.playlistMenuBtn.classList.add('is-hidden');els.openLibraryFromPlaylists.classList.add('is-hidden');els.addLinkToPlaylistBtn.classList.add('is-hidden');els.playlistSources.classList.add('is-hidden');els.playlistSources.innerHTML='';els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0);els.playlistEmpty.querySelector('h3').textContent=`${meta.name} está vacía`;els.playlistEmpty.querySelector('p').textContent=state.activeSmartId===SMART_IDS.favorites?'Toca ♡ en una canción para guardarla aquí.':'MUSIC PLAY irá construyendo esta lista mientras escuchas.';els.playlistList.classList.toggle('is-hidden',tracks.length===0);hydratePlaylistArtwork(tracks,els.playlistHeroArtwork,meta.icon);renderRowsVirtual(els.playlistList,tracks,{fromPlaylist:true,smart:true});return;
  }
  els.playlistMenuBtn.classList.remove('is-hidden');els.openLibraryFromPlaylists.classList.remove('is-hidden');els.addLinkToPlaylistBtn.classList.remove('is-hidden');const pl=getActivePlaylist();if(!pl){state.playlistDetailOpen=false;return renderPlaylists();}const tracks=getPlaylistTracks(pl),sources=pl.sources||[];els.playlistDetailTitle.textContent=pl.name;els.playlistDetailMeta.textContent=`${tracks.length} ${tracks.length===1?'CANCIÓN':'CANCIONES'}${sources.length?` · ${sources.length} FUENTE${sources.length===1?'':'S'}`:''}`;hydratePlaylistArtwork(tracks,els.playlistHeroArtwork,(sources.length?'🔗':'≡'));els.playlistEmpty.querySelector('h3').textContent='Playlist vacía';els.playlistEmpty.querySelector('p').textContent='Añade canciones de tu biblioteca o importa un enlace.';els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0||sources.length>0);els.playlistList.classList.toggle('is-hidden',tracks.length===0);renderRowsVirtual(els.playlistList,tracks,{fromPlaylist:true});
  els.playlistSources.innerHTML='';els.playlistSources.classList.toggle('is-hidden',sources.length===0);sources.forEach((src,index)=>{const c=document.createElement('div');c.className='playlist-source-card';const status=src.status==='imported'?'Importada':src.status==='linked'?'Enlazada':'Fuente';c.innerHTML=`<div class="playlist-source-main"><span class="source-dot">${src.source==='YouTube'?'▶':'🔗'}</span><div><strong>${safeText(src.source||'Enlace')}</strong><small>${status}${src.count?` · ${src.count} elementos`:''}</small></div></div><div class="playlist-source-actions">${src.source==='YouTube'?'<button class="tiny-btn" data-source-play>▶</button>':''}${src.status==='linked'&&src.source==='YouTube'?'<button class="tiny-btn" data-source-retry>↻</button>':''}<button class="tiny-btn" data-source-open>↗</button></div>${src.message?`<p>${safeText(src.message)}</p>`:''}`;$('[data-source-play]',c)?.addEventListener('click',()=>playPlaylistSource(pl,src));$('[data-source-retry]',c)?.addEventListener('click',()=>retryPlaylistSource(pl,index));$('[data-source-open]',c)?.addEventListener('click',()=>window.open(src.originalUrl||src.url,'_blank','noopener'));els.playlistSources.appendChild(c);});
}
function renderLibraryShell(){
  const detail=state.libraryTab==='playlists'&&state.playlistDetailOpen;els.libraryMainHead.classList.toggle('is-hidden',detail);els.libraryTabs.classList.toggle('is-hidden',detail);els.librarySortRow?.classList.toggle('is-hidden',detail);
  [['playlists',els.libraryPlaylistsPanel,els.libraryTabPlaylists],['songs',els.librarySongsPanel,els.libraryTabSongs],['albums',els.libraryAlbumsPanel,els.libraryTabAlbums]].forEach(([tab,panel,btn])=>{panel?.classList.toggle('is-hidden',tab!==state.libraryTab);panel?.classList.toggle('active',tab===state.libraryTab);btn?.classList.toggle('active',tab===state.libraryTab);});
  if(state.libraryTab==='playlists')renderPlaylists();else if(state.libraryTab==='songs')renderLibrarySongs();else renderAlbums();
}
function createMediaCard(track){const b=document.createElement('button');b.className='media-card';b.type='button';b.innerHTML=`<div class="media-card-art">♪</div><strong>${safeText(track.title)}</strong><small>${safeText(track.artist||sourceLabel(track))}</small>`;hydrateArtwork(track,$('.media-card-art',b),track.sourceKind==='youtube'?'▶':'♪');b.onclick=()=>playTrack(track.id,[...state.tracks].filter(playable).map(t=>t.id));return b;}
function renderHome(){
  const onboarding=!state.firstRunComplete;els.onboardingPanel.classList.toggle('is-hidden',!onboarding);els.matureHome.classList.toggle('is-hidden',onboarding);
  if(onboarding){els.onboardingStep1.classList.toggle('done',state.tracks.length>0);els.onboardingStep2.classList.toggle('done',state.playlists.length>0);els.onboardingStep3.classList.toggle('done',!!state.currentId||state.tracks.some(t=>(t.validPlays||0)>0));return;}
  const recent=[...state.tracks].filter(t=>t.lastPlayed||t.addedAt).sort((a,b)=>Math.max(b.lastPlayed||0,b.addedAt||0)-Math.max(a.lastPlayed||0,a.addedAt||0));const resume=getCurrentTrack()||recent.find(t=>t.lastPlayed)||recent[0];
  els.resumeCard.classList.toggle('is-hidden',!resume);if(resume){els.resumeTitle.textContent=resume.title;els.resumeArtist.textContent=resume.artist||sourceLabel(resume);els.resumePlayIcon.textContent=state.currentId===resume.id&&state.playing?'⏸':'▶';hydrateArtwork(resume,els.resumeArtwork,resume.sourceKind==='youtube'?'▶':'♪');els.resumeCard.onclick=()=>state.currentId===resume.id?togglePlay():playTrack(resume.id,recent.filter(playable).map(t=>t.id));}
  els.homeRecent.innerHTML='';recent.slice(0,8).forEach(t=>els.homeRecent.appendChild(createMediaCard(t)));
  els.homePlaylists.innerHTML='';sortedPlaylists().slice(0,7).forEach(pl=>{const tracks=getPlaylistTracks(pl),b=document.createElement('button');b.className='media-card';b.type='button';b.innerHTML=`<div class="media-card-art">≡</div><strong>${safeText(pl.name)}</strong><small>${tracks.length} canciones</small>`;hydratePlaylistArtwork(tracks,$('.media-card-art',b),'≡');b.onclick=()=>openPlaylistDetail(pl.id);els.homePlaylists.appendChild(b);});
}
function renderSearch(){
  const q=(state.globalSearch||'').trim();els.searchResults.innerHTML='';const info=analyzeLink(q);els.searchLinkHint.classList.toggle('is-hidden',!q||info.kind==='invalid'||(!/^https?:/i.test(q)));els.searchEmpty.classList.toggle('is-hidden',!!q);if(!q)return;
  const needle=q.toLowerCase();const tracks=state.tracks.filter(t=>[t.title,t.artist,t.album,t.genre,t.fileName,t.folder].join(' ').toLowerCase().includes(needle)).slice(0,30);const playlists=state.playlists.filter(pl=>(pl.name||'').toLowerCase().includes(needle)).slice(0,12);const albums=getAlbumGroups().filter(g=>[g.name,g.artist].join(' ').toLowerCase().includes(needle)).slice(0,12);
  const addSection=(title,node)=>{if(!node.length)return;const sec=document.createElement('section');sec.className='search-result-section';sec.innerHTML=`<div class="search-result-title">${title}</div>`;for(const el of node)sec.appendChild(el);els.searchResults.appendChild(sec);};
  addSection('Canciones',tracks.map(t=>makeTrackRow(t,{contextIds:tracks.filter(playable).map(x=>x.id)})));addSection('Playlists',playlists.map(pl=>{const tracks2=getPlaylistTracks(pl),b=document.createElement('button');b.className='playlist-card';b.innerHTML=`<span class="playlist-card-icon">≡</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${tracks2.length} canciones</small></span><span class="playlist-card-go">›</span>`;hydratePlaylistArtwork(tracks2,$('.playlist-card-icon',b),'≡');b.onclick=()=>openPlaylistDetail(pl.id);return b;}));addSection('Álbumes',albums.map(g=>{const b=document.createElement('button');b.className='playlist-card';b.innerHTML=`<span class="playlist-card-icon">▣</span><span class="playlist-card-copy"><strong>${safeText(g.name)}</strong><small>${safeText(g.artist||'Álbum')} · ${g.tracks.length}</small></span><span class="playlist-card-go">›</span>`;hydratePlaylistArtwork(g.tracks,$('.playlist-card-icon',b),'▣');b.onclick=()=>openAlbumSheet(g);return b;}));if(!tracks.length&&!playlists.length&&!albums.length){const empty=document.createElement('div');empty.className='search-empty';empty.innerHTML='<span>⌕</span><strong>Sin coincidencias</strong><small>Prueba otro nombre o pega un enlace.</small>';els.searchResults.appendChild(empty);}
}
function renderPlayer(){
  const t=getCurrentTrack();els.miniPlayer.classList.toggle('is-hidden',!t);if(!t)return;els.miniTitle.textContent=t.title;els.miniArtist.textContent=t.artist||sourceLabel(t);els.fullTitle.textContent=t.title;els.fullArtist.textContent=[t.artist,t.album,sourceLabel(t)].filter(Boolean).join(' · ');els.favoriteBtn.textContent=t.favorite?'♥':'♡';els.favoriteBtn.classList.toggle('active',t.favorite);els.miniFavoriteBtn.textContent=t.favorite?'♥':'♡';els.miniFavoriteBtn.classList.toggle('active',t.favorite);const g=state.playing?'⏸':'▶';els.playBtn.textContent=g;els.fullPlayBtn.textContent=g;const modeMeta=PLAY_MODE_META[state.playbackMode]||PLAY_MODE_META.normal;els.shuffleBtn.textContent=modeMeta.icon;els.shuffleBtn.classList.toggle('active',state.playbackMode!==PLAY_MODES.normal);els.shuffleBtn.title=`Modo: ${modeMeta.name}`;els.shuffleBtn.setAttribute('aria-label',`Modo de reproducción: ${modeMeta.name}`);els.volumeRange.value=String(state.volume);updateProgress();const fallback=t.sourceKind==='youtube'?'▶':t.sourceKind==='soundcloud'?'☁':'♪';hydrateArtwork(t,els.miniArtwork,fallback);hydrateArtwork(t,els.playerArtwork,fallback);
}
function render(){renderSummary();renderPlayer();renderHome();if(state.activeView==='library')renderLibraryShell();if(state.activeView==='search')renderSearch();syncBottomNav();}

function updateProgress(){
  let duration=0,current=0;if(state.currentEngine==='youtube'&&ytPlayer){try{duration=ytPlayer.getDuration()||0;current=ytPlayer.getCurrentTime()||0;}catch{}}else if(state.currentEngine==='soundcloud'&&getCurrentTrack()){duration=getCurrentTrack().duration||0;}else{duration=els.audio.duration||0;current=els.audio.currentTime||0;}
  sampleListenSession(current,duration);const pct=duration?(current/duration)*100:0;els.progressRange.value=String(pct);els.timeNow.textContent=formatTime(current);els.timeTotal.textContent=formatTime(duration);syncMediaPosition(current,duration);
}
function syncMediaPlaybackState(){if(!('mediaSession'in navigator))return;try{navigator.mediaSession.playbackState=state.playing?'playing':'paused';}catch{}}
function syncMediaPosition(position,duration){if(!('mediaSession'in navigator)||!navigator.mediaSession.setPositionState||!Number.isFinite(duration)||duration<=0)return;try{navigator.mediaSession.setPositionState({duration,position:Math.min(duration,Math.max(0,Number(position)||0)),playbackRate:state.currentEngine==='local'||state.currentEngine==='direct'?(els.audio.playbackRate||1):1});}catch{}}
function startProgressTimer(){clearInterval(ytProgressTimer);ytProgressTimer=setInterval(()=>{if(state.currentEngine==='youtube')updateProgress();},500);}
function clearRemoteStage(){if(ytPlayer){try{ytPlayer.destroy();}catch{}ytPlayer=null;}if(scWidget){try{scWidget.unbind?.(window.SC?.Widget?.Events?.FINISH);}catch{}scWidget=null;}clearInterval(scProgressTimer);els.remoteStage.innerHTML='';els.remoteDock.classList.add('is-hidden');}
function stopAllEngines(){try{els.audio.pause();}catch{}if(ytPlayer){try{ytPlayer.stopVideo();}catch{}}if(scWidget){try{scWidget.pause();}catch{}}state.playing=false;syncMediaPlaybackState();}

async function getTrackFile(track){
  if(sessionFiles.has(track.id))return sessionFiles.get(track.id);
  if(!state.storageReady)return null;
  const src=await db.get('sources',track.id).catch(()=>null);if(!src)return null;
  if(src.kind==='handle'&&src.handle){
    try{
      let perm='granted';if(src.handle.queryPermission)perm=await src.handle.queryPermission({mode:'read'});
      if(perm!=='granted'&&src.handle.requestPermission)perm=await src.handle.requestPermission({mode:'read'});
      if(perm==='granted'){const f=await src.handle.getFile();sessionFiles.set(track.id,f);return f;}
    }catch(err){console.debug('handle unavailable',err);}
  }
  if(src.blob){const f=src.blob instanceof File?src.blob:new File([src.blob],src.name||track.fileName,{type:src.type||track.type,lastModified:src.lastModified||now()});sessionFiles.set(track.id,f);return f;}
  return null;
}
async function playLocalOrDirect(track){
  clearRemoteStage();state.currentEngine=track.sourceKind==='direct'?'direct':'local';if(state.objectUrl){URL.revokeObjectURL(state.objectUrl);state.objectUrl=null;}
  if(track.sourceKind==='direct'){els.audio.src=track.remoteUrl;}else{const file=await getTrackFile(track);if(!file){toast('No se encontró el archivo local');return false;}state.objectUrl=URL.createObjectURL(file);els.audio.src=state.objectUrl;}
  els.audio.volume=state.volume;els.audio.currentTime=0;try{await els.audio.play();state.playing=true;return true;}catch(err){console.warn(err);toast(/wma|wmv|avi|mkv/i.test(track.fileName||'')?'Este formato necesita conversión; el motor WASM será la siguiente fase':'El navegador no pudo iniciar este archivo',4200);return false;}
}

function loadScript(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id))return resolve();const s=document.createElement('script');if(id)s.id=id;s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
function loadYouTubeApi(){if(window.YT?.Player)return Promise.resolve(window.YT);if(ytApiPromise)return ytApiPromise;ytApiPromise=new Promise((resolve,reject)=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev?.();}catch{}resolve(window.YT);};loadScript('https://www.youtube.com/iframe_api','youtube-iframe-api').catch(reject);setTimeout(()=>{if(window.YT?.Player)resolve(window.YT);},1800);setTimeout(()=>{if(!window.YT?.Player)reject(new Error('YouTube API timeout'));},12000);});return ytApiPromise;}
async function fetchYouTubeMeta(videoId){const fallback=`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;try{const url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const r=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||'',artist:d.author_name||'YouTube',thumbnail:d.thumbnail_url||fallback};}catch{return{title:'',artist:'YouTube',thumbnail:fallback};}}
async function playYouTube(track){
  try{await loadYouTubeApi();}catch{toast('No se pudo cargar el reproductor de YouTube');return false;}
  try{els.audio.pause();}catch{}clearRemoteStage();state.currentEngine='youtube';els.remoteDock.classList.remove('is-hidden');els.remoteLabel.textContent=track.sourceKind==='youtube-playlist'?'YOUTUBE · PLAYLIST':'YOUTUBE';els.remoteStage.innerHTML='<div id="ytMainPlayer"></div>';
  return new Promise(resolve=>{
    ytPlayer=new YT.Player('ytMainPlayer',{width:'100%',height:'100%',videoId:track.sourceKind==='youtube'?track.remoteId:undefined,playerVars:{autoplay:0,playsinline:1,controls:1,rel:0,...(location.origin&&location.origin!=='null'?{origin:location.origin}:{})},events:{onReady:async e=>{try{const frame=e.target.getIframe?.();if(frame){frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');frame.referrerPolicy='strict-origin-when-cross-origin';}e.target.setVolume(Math.round(state.volume*100));if(track.sourceKind==='youtube-playlist')e.target.loadPlaylist({listType:'playlist',list:track.remoteId,index:0,startSeconds:0});else e.target.playVideo();}catch(err){console.debug('youtube play',err);}state.playing=true;startProgressTimer();renderPlayer();if(track.sourceKind==='youtube'&&/^YouTube ·/.test(track.title)){const data=e.target.getVideoData?.()||{};if(data.title){track.title=data.title;track.artist=data.author||'YouTube';await saveRemoteTrack(track);render();}}resolve(true);},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){state.playing=true;syncMediaPlaybackState();renderPlayer();}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED){state.playing=false;syncMediaPlaybackState();renderPlayer();}else if(e.data===YT.PlayerState.ENDED){state.playing=false;syncMediaPlaybackState();renderPlayer();handleNaturalEnd();}},onError:e=>{console.debug('youtube player error',e.data);toast('YouTube no permitió reproducir este elemento');resolve(false);}}});
  });
}
function loadSoundCloudApi(){if(window.SC?.Widget)return Promise.resolve(window.SC);if(scApiPromise)return scApiPromise;scApiPromise=loadScript('https://w.soundcloud.com/player/api.js','soundcloud-widget-api').then(()=>window.SC);return scApiPromise;}
async function fetchSoundCloudMeta(url){try{const r=await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||cleanName(new URL(url).pathname.split('/').pop()),artist:d.author_name||'SoundCloud',thumbnail:d.thumbnail_url||''};}catch{return null;}}
async function playSoundCloud(track){
  try{await loadSoundCloudApi();}catch{toast('No se pudo cargar SoundCloud');return false;}
  try{els.audio.pause();}catch{}clearRemoteStage();state.currentEngine='soundcloud';els.remoteDock.classList.remove('is-hidden');els.remoteLabel.textContent='SOUNDCLOUD';const iframe=document.createElement('iframe');iframe.allow='autoplay';iframe.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.remoteUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;els.remoteStage.appendChild(iframe);
  return new Promise(resolve=>{iframe.onload=()=>{try{scWidget=SC.Widget(iframe);const E=SC.Widget.Events;scWidget.bind(E.READY,()=>{scWidget.setVolume(Math.round(state.volume*100));scWidget.play();scWidget.getCurrentSound(async s=>{if(s){track.title=s.title||track.title;track.artist=s.user?.username||track.artist;track.duration=(s.duration||0)/1000;await saveRemoteTrack(track);render();}});state.playing=true;renderPlayer();resolve(true);});scWidget.bind(E.PLAY,()=>{state.playing=true;syncMediaPlaybackState();renderPlayer();});scWidget.bind(E.PAUSE,()=>{state.playing=false;syncMediaPlaybackState();renderPlayer();});scWidget.bind(E.FINISH,()=>{state.playing=false;syncMediaPlaybackState();handleNaturalEnd();});scProgressTimer=setInterval(()=>{scWidget?.getPosition?.(ms=>{const d=track.duration||0;sampleListenSession(ms/1000,d);els.timeNow.textContent=formatTime(ms/1000);els.timeTotal.textContent=formatTime(d);els.progressRange.value=d?String((ms/1000/d)*100):'0';});},700);}catch{resolve(false);}};});
}

async function playTrack(id,contextIds=null,{skipFinalize=false,preserveBase=false,fromHistory=false}={}){
  const track=state.tracks.find(t=>t.id===id);if(!track)return;if(!playable(track)){toast(track.sourceMissing?'Vuelve a cargar este archivo local para reactivarlo':'Esta fuente está guardada como referencia, pero aún no tiene reproductor integrado');return;}
  if(state.listenSession&&!skipFinalize)await finalizeListenSession('switch');
  stopAllEngines();const clean=uniquePlayableIds(contextIds&&contextIds.length?contextIds:[id]);if(!preserveBase){state.baseQueueIds=[...clean];state.modePlayedIds=[id];state.queueIds=state.playbackMode===PLAY_MODES.normal?clean:prepareModeQueue(state.playbackMode,clean,id);}else state.queueIds=clean;state.currentId=id;state.queueIndex=Math.max(0,state.queueIds.indexOf(id));
  if(!fromHistory){if(state.navHistory[state.navHistory.length-1]!==id)state.navHistory.push(id);if(state.navHistory.length>200)state.navHistory.shift();}
  if(!state.modePlayedIds.includes(id))state.modePlayedIds.push(id);if(state.modePlayedIds.length>500)state.modePlayedIds.shift();
  let ok=false;if(track.sourceKind==='local'||track.sourceKind==='direct')ok=await playLocalOrDirect(track);else if(track.sourceKind==='youtube'||track.sourceKind==='youtube-playlist')ok=await playYouTube(track);else if(track.sourceKind==='soundcloud')ok=await playSoundCloud(track);
  if(ok){state.firstRunComplete=true;await beginListenSession(track);await persistPrefs();setupMediaSession();render();}
}
async function togglePlay(){const t=getCurrentTrack();if(!t){const ids=currentModeContextIds();if(!ids.length)return toast('Primero carga o importa música');const order=prepareModeQueue(state.playbackMode,ids,'');state.baseQueueIds=[...ids];return order[0]?playTrack(order[0],order,{preserveBase:true}):null;}if(state.currentEngine==='none'||(t.sourceKind==='local'&&!els.audio.src)||(t.sourceKind==='youtube'&&!ytPlayer)||(t.sourceKind==='soundcloud'&&!scWidget))return playTrack(t.id,state.queueIds.length?state.queueIds:[t.id],{preserveBase:true});if(state.currentEngine==='youtube'&&ytPlayer){const st=ytPlayer.getPlayerState();st===YT.PlayerState.PLAYING?ytPlayer.pauseVideo():ytPlayer.playVideo();return;}if(state.currentEngine==='soundcloud'&&scWidget){scWidget.toggle();return;}if(els.audio.paused){try{await els.audio.play();}catch{}}else els.audio.pause();}
async function nextTrack({skipFinalize=false}={}){
  const mode=state.playbackMode||PLAY_MODES.normal;let id=null;
  if(mode===PLAY_MODES.shuffle){let pool=uniquePlayableIds(state.baseQueueIds.length?state.baseQueueIds:state.queueIds).filter(x=>!state.modePlayedIds.includes(x));if(!pool.length){state.modePlayedIds=state.currentId?[state.currentId]:[];pool=uniquePlayableIds(state.baseQueueIds.length?state.baseQueueIds:state.queueIds).filter(x=>x!==state.currentId);if(pool.length)toast('⇄ Nueva vuelta aleatoria');}id=pool[Math.floor(Math.random()*pool.length)]||state.currentId;}
  else if(mode===PLAY_MODES.radio){id=pickRadioNext()?.id||null;}
  else if(mode===PLAY_MODES.live){id=pickLiveNext()?.id||null;}
  else{
    if(!state.queueIds.length){const base=currentModeContextIds();state.queueIds=prepareModeQueue(mode,base,state.currentId);state.queueIndex=Math.max(0,state.queueIds.indexOf(state.currentId));}
    let nextIndex=state.queueIndex+1;
    if(nextIndex>=state.queueIds.length){const rebuilt=prepareModeQueue(mode,state.baseQueueIds.length?state.baseQueueIds:currentModeContextIds(),state.currentId);state.queueIds=rebuilt;nextIndex=mode===PLAY_MODES.normal?0:Math.min(1,Math.max(0,rebuilt.length-1));}
    id=state.queueIds[nextIndex]||state.queueIds[0];
  }
  if(!id)return;const nextContext=state.queueIds.includes(id)?state.queueIds:[...state.queueIds,id];await playTrack(id,nextContext.length?nextContext:[id],{skipFinalize,preserveBase:true});
}
async function prevTrack(){if(state.currentEngine==='local'||state.currentEngine==='direct'){if((els.audio.currentTime||0)>4){els.audio.currentTime=0;return;}}if(state.navHistory.length>=2){state.navHistory.pop();const id=state.navHistory[state.navHistory.length-1];return playTrack(id,state.queueIds.length?state.queueIds:[id],{preserveBase:true,fromHistory:true});}if(!state.queueIds.length)return;state.queueIndex=(state.queueIndex-1+state.queueIds.length)%state.queueIds.length;await playTrack(state.queueIds[state.queueIndex],state.queueIds,{preserveBase:true,fromHistory:true});}
function queueTrack(id){if(!state.queueIds.includes(id))state.queueIds.push(id);persistPrefs();toast('Añadido a la cola');}
async function toggleFavorite(id=state.currentId){const t=state.tracks.find(x=>x.id===id);if(!t)return;t.favorite=!t.favorite;await saveRemoteTrack(t);recordHistory(t.favorite?'favorite':'unfavorite',t);render();toast(t.favorite?'Añadida a Favoritos ♥':'Quitada de Favoritos');}
async function removeTrack(id){const t=state.tracks.find(x=>x.id===id);if(!t)return;sessionFiles.delete(id);state.tracks=state.tracks.filter(x=>x.id!==id);for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).filter(x=>x!==id);await persistPlaylist(pl);}if(state.currentId===id){stopAllEngines();clearRemoteStage();els.audio.removeAttribute('src');state.currentId=null;state.currentEngine='none';}state.queueIds=state.queueIds.filter(x=>x!==id);if(state.storageReady){await db.delete('tracks',id).catch(()=>{});await db.delete('sources',id).catch(()=>{});await db.delete('covers',id).catch(()=>{});}if(artworkCache.has(id)){try{URL.revokeObjectURL(artworkCache.get(id));}catch{}artworkCache.delete(id);}render();toast('Audio eliminado de MUSIC PLAY');}
async function removeFromPlaylist(trackId,playlistId){const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;pl.trackIds=pl.trackIds.filter(x=>x!==trackId);pl.updatedAt=now();await persistPlaylist(pl);renderPlaylists();toast('Quitado de la playlist');}
async function createPlaylist(name,extra={}){
  const clean=(name||'').trim();if(!clean)return null;
  const ts=now();const pl=normalizePlaylist({id:`pl_${remoteHash(clean+ts+Math.random())}`,name:clean.slice(0,60),trackIds:[],sources:[],createdAt:ts,updatedAt:ts,...extra});
  state.playlists.unshift(pl);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;
  await persistPlaylist(pl);await persistPrefs();return pl;
}
async function addTrackToPlaylist(trackId,playlistId,{silent=false}={}){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return null;
  if(!pl.trackIds.includes(trackId))pl.trackIds.push(trackId);pl.updatedAt=now();
  await persistPlaylist(pl);if(state.activeView==='library'&&state.libraryTab==='playlists')renderPlaylists();if(!silent)toast('Añadido a playlist');return pl;
}
function openPlaylistDetail(id){
  if(!state.playlists.some(p=>p.id===id))return;state.activeSmartId='';state.activePlaylistId=id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');persistPrefs();renderLibraryShell();
}
function openSmartCollection(id){
  if(!Object.values(SMART_IDS).includes(id))return;state.activeSmartId=id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');persistPrefs();renderLibraryShell();
}
function closePlaylistDetail(){state.playlistDetailOpen=false;state.activeSmartId='';renderLibraryShell();persistPrefs();}
async function deletePlaylist(pl){
  if(!pl)return;
  state.playlists=state.playlists.filter(p=>p.id!==pl.id);
  if(state.storageReady)await db.delete('playlists',pl.id).catch(()=>{});
  state.activePlaylistId=state.playlists[0]?.id||'';state.playlistDetailOpen=false;await persistPrefs();renderLibraryShell();toast('Playlist eliminada');
}
function openPlaylistPickerSheet(trackId){
  const track=state.tracks.find(t=>t.id===trackId);if(!track)return;
  const buttons=state.playlists.map(pl=>`<button class="sheet-btn" data-pick-pl="${pl.id}">≡ ${safeText(pl.name)}<small>${(pl.trackIds||[]).length} canciones</small></button>`).join('');
  openSheet(`<h2 class="sheet-title">Añadir a playlist</h2><p class="sheet-copy">${safeText(track.title)}</p><div class="sheet-stack">${buttons||'<p class="sheet-copy">Aún no tienes playlists.</p>'}<button class="sheet-btn" data-new-pl>＋ Nueva playlist<small>Crear y añadir esta canción</small></button></div>`,root=>{
    $$('[data-pick-pl]',root).forEach(b=>b.onclick=async()=>{await addTrackToPlaylist(trackId,b.dataset.pickPl);closeDialog(els.sheetDialog);});
    $('[data-new-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(trackId);};
  });
}
function importFirstList(list){
  const recent=new Set(state.lastImportIds||[]),fresh=list.filter(t=>recent.has(t.id)),rest=list.filter(t=>!recent.has(t.id));
  return [...fresh,...rest];
}
function openCreateFromLibrarySheet(preselectIds=null){
  const raw=getFilteredTracks();if(!raw.length)return toast('No hay canciones para crear una playlist');
  const last=(preselectIds&&preselectIds.length?preselectIds:state.lastImportIds||[]).filter(id=>raw.some(t=>t.id===id)),selected=new Set(last),list=importFirstList(raw),suggest=state.lastImportLabel||'Nueva playlist';
  openSheet(`<h2 class="sheet-title">Crear desde canciones</h2><p class="sheet-copy">${last.length?`La última carga está preseleccionada: <b>${last.length}</b> canciones.`:'Marca las canciones que quieras incluir.'}</p><input id="bulkPlaylistName" class="sheet-input" maxlength="60" placeholder="Nombre de la playlist" value="${safeText(suggest)}"/><div class="bulk-select-tools"><button class="tiny-btn" data-recent ${last.length?'':'disabled'}>Esta carga</button><button class="tiny-btn" data-all>Todo</button><span id="bulkCount">0 seleccionadas</span></div><div class="bulk-track-list">${list.map(t=>`<label class="bulk-track${selected.has(t.id)?' import-fresh':''}"><input type="checkbox" value="${t.id}" ${selected.has(t.id)?'checked':''}/><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}${selected.has(t.id)?' · recién cargada':''}</small></span></label>`).join('')}</div><button class="sheet-btn" data-create-bulk>Crear playlist<small>Con las canciones seleccionadas</small></button>`,root=>{
    const checks=$$('input[type="checkbox"]',root),count=$('#bulkCount',root),name=$('#bulkPlaylistName',root);const recentIds=new Set(last);
    const update=()=>count.textContent=`${checks.filter(c=>c.checked).length} seleccionadas`;checks.forEach(c=>c.onchange=update);update();
    $('[data-recent]',root).onclick=()=>{checks.forEach(c=>c.checked=recentIds.has(c.value));update();};
    $('[data-all]',root).onclick=()=>{const on=!checks.every(c=>c.checked);checks.forEach(c=>c.checked=on);update();};
    $('[data-create-bulk]',root).onclick=async()=>{const ids=checks.filter(c=>c.checked).map(c=>c.value);if(!ids.length)return toast('Selecciona al menos una canción');const pl=await createPlaylist(name.value||'Nueva playlist');for(const id of ids)await addTrackToPlaylist(id,pl.id,{silent:true});closeDialog(els.sheetDialog);showView('playlist');state.playlistDetailOpen=true;renderPlaylists();toast(`Playlist creada · ${ids.length} canciones`);};
    name.focus();name.select();
  });
}
function openAddSongsToPlaylistSheet(playlistId){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;
  const raw=getFilteredTracks().filter(t=>!pl.trackIds.includes(t.id));if(!raw.length)return toast('Todas tus canciones ya están en esta playlist');
  const recentIds=new Set((state.lastImportIds||[]).filter(id=>raw.some(t=>t.id===id))),list=importFirstList(raw);
  openSheet(`<h2 class="sheet-title">Añadir canciones</h2><p class="sheet-copy">${recentIds.size?`La última carga está lista: <b>${recentIds.size}</b> preseleccionadas.`:`Selecciona varias canciones para <b>${safeText(pl.name)}</b>.`}</p><div class="bulk-select-tools"><button class="tiny-btn" data-recent ${recentIds.size?'':'disabled'}>Esta carga</button><button class="tiny-btn" data-all>Todo</button><span id="bulkCount">0 seleccionadas</span></div><div class="bulk-track-list">${list.map(t=>`<label class="bulk-track${recentIds.has(t.id)?' import-fresh':''}"><input type="checkbox" value="${t.id}" ${recentIds.has(t.id)?'checked':''}/><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}${recentIds.has(t.id)?' · recién cargada':''}</small></span></label>`).join('')}</div><button class="sheet-btn" data-add-selected>＋ Añadir seleccionadas</button>`,root=>{
    const checks=$$('input[type="checkbox"]',root),count=$('#bulkCount',root);const update=()=>count.textContent=`${checks.filter(c=>c.checked).length} seleccionadas`;checks.forEach(c=>c.onchange=update);update();
    $('[data-recent]',root).onclick=()=>{checks.forEach(c=>c.checked=recentIds.has(c.value));update();};$('[data-all]',root).onclick=()=>{const on=!checks.every(c=>c.checked);checks.forEach(c=>c.checked=on);update();};
    $('[data-add-selected]',root).onclick=async()=>{const ids=checks.filter(c=>c.checked).map(c=>c.value);if(!ids.length)return toast('Selecciona al menos una canción');for(const id of ids)await addTrackToPlaylist(id,pl.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;renderPlaylists();toast(`${ids.length} canciones añadidas`);};
  });
}
async function createPlaylistFromBatch(ids,name){
  const cleanIds=[...new Set(ids||[])].filter(id=>state.tracks.some(t=>t.id===id));if(!cleanIds.length)return null;
  const pl=await createPlaylist(name||state.lastImportLabel||'Nueva playlist');for(const id of cleanIds)await addTrackToPlaylist(id,pl.id,{silent:true});return pl;
}
function openPostImportSheet(ids,label='Última carga'){
  const count=(ids||[]).length;if(!count)return;
  state.lastImportIds=[...ids];state.lastImportLabel=(label||'Última carga').slice(0,60);state.lastImportAt=now();
  openSheet(`<h2 class="sheet-title">✓ ${count} ${count===1?'archivo listo':'archivos listos'}</h2><p class="sheet-copy">Esta carga queda identificada para que no tengas que volver a escoger canción por canción.</p><div class="sheet-stack"><button class="sheet-btn" data-batch-create>≡ Crear playlist con ${count}<small>Usa toda esta carga de una vez</small></button><button class="sheet-btn" data-batch-review>☑ Revisar selección<small>${count} aparecen preseleccionadas y primero</small></button><button class="sheet-btn" data-batch-library>♪ Ir a biblioteca<small>Seguir sin crear playlist</small></button></div>`,root=>{
    $('[data-batch-create]',root).onclick=async()=>{const pl=await createPlaylistFromBatch(ids,state.lastImportLabel);closeDialog(els.sheetDialog);if(pl){showView('playlist');state.playlistDetailOpen=true;renderPlaylists();toast(`Playlist creada · ${count} canciones`);}};
    $('[data-batch-review]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');setTimeout(()=>openCreateFromLibrarySheet(ids),80);};
    $('[data-batch-library]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');};
  });
}
function openPlaylistSearchSheet(pl){
  if(!pl)return;const all=getPlaylistTracks(pl);
  openSheet(`<h2 class="sheet-title">Buscar en ${safeText(pl.name)}</h2><p class="sheet-copy">Busca sin salir de esta playlist.</p><input id="playlistSearchInput" class="sheet-input" type="search" placeholder="Canción, artista o álbum" autocomplete="off"/><div id="playlistSearchResults" class="playlist-search-results"></div>`,root=>{
    const input=$('#playlistSearchInput',root),results=$('#playlistSearchResults',root);
    const draw=()=>{const q=input.value.trim().toLowerCase(),matches=(q?all.filter(t=>[t.title,t.artist,t.album,t.genre].join(' ').toLowerCase().includes(q)):all).slice(0,60);results.innerHTML=matches.length?'':'<p class="sheet-copy">Sin coincidencias.</p>';for(const t of matches){const b=document.createElement('button');b.className='playlist-search-row';b.type='button';b.innerHTML=`<span class="playlist-search-art">♪</span><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></span><span>▶</span>`;hydrateArtwork(t,$('.playlist-search-art',b),t.sourceKind==='youtube'?'▶':'♪');b.onclick=()=>{closeDialog(els.sheetDialog);playTrack(t.id,all.filter(playable).map(x=>x.id));};results.appendChild(b);}};
    input.oninput=draw;draw();input.focus();
  });
}
function insertPlaylistNext(pl){
  const ids=getPlaylistTracks(pl).filter(playable).map(t=>t.id);if(!ids.length)return toast('Esta playlist no tiene canciones reproducibles');
  const current=state.currentId,base=(state.queueIds.length?[...state.queueIds]:(current?[current]:[])).filter(id=>!ids.includes(id));let at=current?Math.max(0,base.indexOf(current))+1:0;base.splice(at,0,...ids);state.queueIds=base;state.queueIndex=current?Math.max(0,state.queueIds.indexOf(current)):-1;persistPrefs();toast(`${ids.length} canciones van a continuación`);
}
function addPlaylistToQueue(pl){
  const ids=getPlaylistTracks(pl).filter(playable).map(t=>t.id);if(!ids.length)return toast('Esta playlist no tiene canciones reproducibles');const before=state.queueIds.length;state.queueIds=[...new Set([...state.queueIds,...ids])];persistPrefs();toast(`${state.queueIds.length-before} añadidas a la cola`);
}
async function togglePlaylistPin(pl){pl.pinned=!pl.pinned;await persistPlaylist(pl);renderHome();renderPlaylists();toast(pl.pinned?'Playlist fijada en Inicio':'Playlist quitada de Inicio');}
async function exportPlaylistM3U(pl){
  if(!pl)return;showLoader('Preparando exportación…','Completando títulos y referencias');try{await ensurePlaylistMetadata(pl,{quiet:true});const tracks=getPlaylistTracks(pl);downloadText(`${safeFileName(pl.name)}.m3u8`,m3uForTracks(pl.name,tracks),'audio/x-mpegurl;charset=utf-8');toast(`M3U8 exportada · ${tracks.length} canciones`);}finally{hideLoader();}
}
function openPlaylistMenuSheet(){
  const pl=getActivePlaylist();if(!pl)return;
  openSheet(`<h2 class="sheet-title">${safeText(pl.name)}</h2><p class="sheet-copy">Acciones rápidas para esta playlist.</p><div class="sheet-stack"><button class="sheet-btn" data-random>⇄ Reproducir aleatorio<small>Sin repetir hasta completar la vuelta</small></button><button class="sheet-btn" data-search-pl>⌕ Buscar en la playlist<small>Encuentra canción o artista</small></button><button class="sheet-btn" data-modes>✦ Comenzar Mix / modos<small>Radio, Redescubrir, Sorpréndeme y Cola Viva</small></button><button class="sheet-btn" data-next-pl>→ Reproducir a continuación<small>Inserta la lista después de la canción actual</small></button><button class="sheet-btn" data-queue-pl>≡ Añadir a la cola<small>Conserva lo que ya está sonando</small></button><button class="sheet-btn" data-pin>${pl.pinned?'⌂ Quitar de Inicio':'⌂ Fijar en Inicio'}<small>${pl.pinned?'Dejar de mostrarla entre tus accesos':'Acceso rápido en la portada'}</small></button><button class="sheet-btn" data-export>⇩ Exportar M3U8<small>Completa títulos de YouTube antes de exportar</small></button><button class="sheet-btn" data-rename>✎ Renombrar<small>Cambiar el nombre</small></button><button class="sheet-btn" data-link>🔗 Añadir enlace<small>Sumar otra fuente dentro de esta lista</small></button><button class="sheet-btn" data-delete>🗑 Eliminar playlist<small>No elimina los audios de la biblioteca</small></button></div>`,root=>{
    $('[data-random]',root).onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:pl.trackIds||[]});};
    $('[data-search-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaylistSearchSheet(pl),40);};
    $('[data-modes]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaybackModesSheet({contextIds:pl.trackIds||[]}),40);};
    $('[data-next-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);insertPlaylistNext(pl);};
    $('[data-queue-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);addPlaylistToQueue(pl);};
    $('[data-pin]',root).onclick=async()=>{closeDialog(els.sheetDialog);await togglePlaylistPin(pl);};
    $('[data-export]',root).onclick=async()=>{closeDialog(els.sheetDialog);await exportPlaylistM3U(pl);};
    $('[data-rename]',root).onclick=()=>{root.innerHTML=`<h2 class="sheet-title">Renombrar</h2><input id="renamePlaylist" class="sheet-input" maxlength="60" value="${safeText(pl.name)}"/><button class="sheet-btn" data-save-name>Guardar</button>`;const input=$('#renamePlaylist',root);input.focus();$('[data-save-name]',root).onclick=async()=>{const v=input.value.trim();if(!v)return;pl.name=v.slice(0,60);pl.updatedAt=now();await persistPlaylist(pl);closeDialog(els.sheetDialog);renderPlaylists();renderHome();};};
    $('[data-link]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet('',pl.id);};
    $('[data-delete]',root).onclick=async()=>{closeDialog(els.sheetDialog);await deletePlaylist(pl);};
  });
}
async function startMix(trackIds){const base=uniquePlayableIds(trackIds);if(!base.length)return toast('No hay fuentes reproducibles para mezclar');state.baseQueueIds=[...base];state.playbackMode=PLAY_MODES.smart;state.shuffle=false;state.modePlayedIds=[];const order=prepareModeQueue(PLAY_MODES.smart,base,state.currentId&&base.includes(state.currentId)?state.currentId:'');state.queueIds=order;state.queueIndex=0;await persistPrefs();if(order[0])await playTrack(order[0],order,{preserveBase:true});toast('✦ Mix inteligente · gusto + escucha + descubrimiento');}

function openSheet(html,binder){els.sheetContent.innerHTML=html;$$('button',els.sheetContent).forEach(b=>b.type='button');openDialog(els.sheetDialog);binder?.(els.sheetContent);}
function openLoadSheet(){openSheet(`<h2 class="sheet-title">Cargar música</h2><p class="sheet-copy">Archivos, carpetas o enlaces. MUSIC PLAY decide cómo tratarlos.</p><div class="sheet-stack"><button class="sheet-btn" data-a="files">＋ Archivos<small>Audio o video local</small></button><button class="sheet-btn" data-a="folder">⌂ Carpeta<small>Biblioteca completa</small></button><button class="sheet-btn" data-a="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button><button class="sheet-btn" data-a="library">♪ Tu música<small>Ver biblioteca</small></button></div>`,root=>{$('[data-a="files"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};$('[data-a="folder"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};$('[data-a="link"]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};$('[data-a="library"]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');};});}
function openLibraryNewSheet(){openSheet(`<h2 class="sheet-title">＋ Nueva</h2><p class="sheet-copy">Una sola entrada para crear o añadir contenido.</p><div class="sheet-stack"><button class="sheet-btn" data-new="playlist">≡ Playlist<small>Crear una lista propia</small></button><button class="sheet-btn" data-new="file">♪ Archivo<small>Añadir audio o video</small></button><button class="sheet-btn" data-new="folder">⌂ Carpeta<small>Indexar una colección completa</small></button><button class="sheet-btn" data-new="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button></div>`,root=>{root.querySelector('[data-new="playlist"]').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet();};root.querySelector('[data-new="file"]').onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};root.querySelector('[data-new="folder"]').onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};root.querySelector('[data-new="link"]').onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};});}
function openTrackSheet(track,options={}){const pls=state.playlists.map(pl=>`<button class="sheet-btn" data-pl="${pl.id}">≡ ${safeText(pl.name)}<small>Añadir esta canción</small></button>`).join('');const external=track.remoteUrl?`<button class="sheet-btn" data-a="original">↗ Abrir fuente<small>${safeText(track.remoteUrl)}</small></button>`:'';openSheet(`<h2 class="sheet-title">${safeText(track.title)}</h2><p class="sheet-copy">${safeText(track.artist||sourceLabel(track))} · ${sourceLabel(track)}</p><div class="sheet-stack">${playable(track)?'<button class="sheet-btn" data-a="play">▶ Reproducir<small>Escuchar ahora</small></button>':''}<button class="sheet-btn" data-a="queue">→ Cola<small>Reproducir después</small></button><button class="sheet-btn" data-a="fav">${track.favorite?'♥ Quitar favorito':'♡ Favorito'}<small>Marcar esta canción</small></button>${external}${options.fromPlaylist&&!options.smart?'<button class="sheet-btn" data-a="remove-pl">− Quitar de playlist<small>No elimina la canción</small></button>':''}<button class="sheet-btn" data-a="delete">🗑 Eliminar<small>Quitar de MUSIC PLAY</small></button><div class="sheet-copy">Añadir a playlist</div>${pls}<button class="sheet-btn" data-a="new-pl">＋ Nueva playlist<small>Crear y añadir</small></button></div>`,root=>{const q=s=>$(`[data-a="${s}"]`,root);q('play')&&(q('play').onclick=()=>{closeDialog(els.sheetDialog);playTrack(track.id,getFilteredTracks().filter(playable).map(t=>t.id));});q('queue').onclick=()=>{closeDialog(els.sheetDialog);queueTrack(track.id);};q('fav').onclick=()=>{closeDialog(els.sheetDialog);toggleFavorite(track.id);};q('original')&&(q('original').onclick=()=>window.open(track.remoteUrl,'_blank','noopener'));q('remove-pl')&&(q('remove-pl').onclick=()=>{closeDialog(els.sheetDialog);removeFromPlaylist(track.id,state.activePlaylistId);});q('delete').onclick=()=>{closeDialog(els.sheetDialog);removeTrack(track.id);};$$('[data-pl]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);addTrackToPlaylist(track.id,b.dataset.pl);});q('new-pl').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(track.id);};});}
function openCreatePlaylistSheet(preselect=null){openSheet(`<h2 class="sheet-title">Nueva playlist</h2><p class="sheet-copy">Una lista propia, aunque mezcle archivos y enlaces.</p><input id="playlistNameInput" class="sheet-input" maxlength="60" placeholder="Ej: Rock, Estudio, Viaje"/><div class="sheet-stack"><button class="sheet-btn" data-save>Guardar playlist<small>Se queda en este dispositivo</small></button></div>`,root=>{const input=$('#playlistNameInput',root);input.focus();$('[data-save]',root).onclick=async()=>{const pl=await createPlaylist(input.value);if(!pl)return toast('Escribe un nombre');if(preselect)await addTrackToPlaylist(preselect,pl.id);closeDialog(els.sheetDialog);showView('playlist');};});}

function downloadText(filename,text,type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function safeFileName(name){return String(name||'music-play').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,80)||'music-play';}
async function exportBackup(){
  const payload={schema:'music-play-backup',version:1,build:BUILD,exportedAt:new Date().toISOString(),tracks:state.tracks.map(t=>({...normalizeTrack(t),sourceMissing:t.sourceKind==='local'?true:!!t.sourceMissing})),playlists:state.playlists.map(normalizePlaylist),history:state.history.slice(0,2500),prefs:{volume:state.volume,theme:state.theme,playbackMode:state.playbackMode}};
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
function youtubeTitleLooksPlaceholder(track){return track?.sourceKind==='youtube'&&(!track.title||/^YouTube(?:\s*[·-]|$)/i.test(track.title));}
async function ensurePlaylistMetadata(pl,{quiet=false}={}){
  if(!pl)return{updated:0,checked:0};const sources=(pl.sources||[]).filter(src=>src.source==='YouTube'&&src.playlistId);if(!sources.length)return{updated:0,checked:0};let updated=0,checked=0;const touched=[];
  for(const src of sources){
    const needs=getPlaylistTracks(pl).some(t=>t.sourceKind==='youtube'&&(t.playlistSource===src.playlistId||!t.playlistSource)&&youtubeTitleLooksPlaceholder(t));if(!needs&&src.metadataComplete)continue;
    if(!quiet)updateLoaderProgress(checked,Math.max(1,sources.length),`metadatos · ${src.playlistId.slice(0,8)}`);const result=await getYouTubePlaylistIds(src.playlistId);checked++;
    if(result.title&&(/^YouTube\s*[·-]/i.test(pl.name)||!pl.name))pl.name=result.title;
    const metas=result.meta||{};for(const t of getPlaylistTracks(pl)){if(t.sourceKind!=='youtube'||!t.remoteId)continue;if(t.playlistSource&&t.playlistSource!==src.playlistId)continue;const meta=metas[t.remoteId];if(!meta)continue;let changed=false;if(meta.title&&(youtubeTitleLooksPlaceholder(t)||!t.enriched)){t.title=meta.title;changed=true;}if(meta.artist&&(!t.artist||t.artist==='YouTube'||!t.enriched)){t.artist=meta.artist;changed=true;}if(meta.thumbnail&&t.thumbnail!==meta.thumbnail){t.thumbnail=meta.thumbnail;changed=true;}if(changed){t.enriched=true;touched.push(t);updated++;}}
    src.importSource=result.source||src.importSource;src.metadataComplete=Object.keys(metas).length>=Math.min(Number(src.count)||Infinity,(result.ids||[]).length||Infinity);src.checkedAt=now();if(!result.error)src.message='';
  }
  if(touched.length&&state.storageReady){for(let i=0;i<touched.length;i+=120)await db.putMany('tracks',touched.slice(i,i+120)).catch(()=>{});}pl.updatedAt=now();await persistPlaylist(pl);if(updated)render();return{updated,checked};
}
function m3uForTracks(name,tracks){
  const lines=['#EXTM3U',`#PLAYLIST:${name}`];for(const t of tracks){lines.push(`#EXTINF:${Math.round(t.duration||-1)},${(t.artist&&t.artist!=='Desconocido'?t.artist+' - ':'')}${t.title}`);if(t.remoteUrl)lines.push(t.remoteUrl);else if(t.fileName)lines.push(t.fileName);}
  return lines.join('\n');
}
function openExportM3USheet(){
  const choices=[...[SMART_IDS.favorites,SMART_IDS.most,SMART_IDS.recent,SMART_IDS.repeat].map(id=>({id,name:smartMeta(id).name,smart:true})),...state.playlists.map(pl=>({id:pl.id,name:pl.name,smart:false}))];
  openSheet(`<h2 class="sheet-title">Exportar M3U8</h2><p class="sheet-copy">MUSIC PLAY intentará completar títulos y autores de playlists YouTube antes de crear el archivo.</p><div class="sheet-stack">${choices.map(c=>`<button class="sheet-btn" data-m3u="${c.id}">${c.smart?smartMeta(c.id).icon:'≡'} ${safeText(c.name)}</button>`).join('')||'<p class="sheet-copy">No hay listas disponibles.</p>'}</div>`,root=>{$$('[data-m3u]',root).forEach(b=>b.onclick=async()=>{const id=b.dataset.m3u,smart=Object.values(SMART_IDS).includes(id);closeDialog(els.sheetDialog);if(smart){const tracks=getSmartTracks(id),name=smartMeta(id).name;downloadText(`${safeFileName(name)}.m3u8`,m3uForTracks(name,tracks),'audio/x-mpegurl;charset=utf-8');return toast('M3U8 exportada');}const pl=state.playlists.find(p=>p.id===id);if(pl)await exportPlaylistM3U(pl);});});
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
function openPwaStatusSheet(){
  const mode=isInstalledDisplay()?'app instalada':'navegador',secure=window.isSecureContext?'HTTPS/seguro':'contexto no seguro',sw=navigator.serviceWorker?.controller?'activo':'sin control',prompt=state.installPrompt?'listo':'no disponible aún';
  openSheet(`<h2 class="sheet-title">PWA · estado</h2><p class="sheet-copy">Diagnóstico rápido para instalación y pantalla completa.</p><div class="recap-grid"><div><b>${safeText(mode)}</b><span>modo</span></div><div><b>${safeText(secure)}</b><span>seguridad</span></div><div><b>${safeText(sw)}</b><span>service worker</span></div><div><b>${safeText(prompt)}</b><span>instalador</span></div></div><div class="sheet-stack"><button class="sheet-btn" data-pwa-install>⇩ Instalar / ayuda<small>Abre el flujo correcto para este dispositivo</small></button><button class="sheet-btn" data-pwa-full>⛶ Pantalla completa<small>Solicita modo inmersivo</small></button></div>`,root=>{$('[data-pwa-install]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openInstallSheet(),50);};$('[data-pwa-full]',root).onclick=async()=>{await requestImmersive();closeDialog(els.sheetDialog);};});
}
function openMoreMenu(){openSheet(`<h2 class="sheet-title">MUSIC PLAY</h2><p class="sheet-copy">Herramientas de biblioteca sin llenar la pantalla principal.</p><div class="sheet-stack"><button class="sheet-btn" data-more="modes">▶ Modos de reproducción<small>Aleatorio, Radio, Redescubrir, Sorpréndeme y Cola Viva</small></button><button class="sheet-btn" data-more="pwa">⇩ PWA · instalación<small>Estado, instalación y pantalla completa</small></button><button class="sheet-btn" data-more="recap">◎ Mi resumen<small>Escuchas, tiempo, repeticiones y favoritos</small></button><button class="sheet-btn" data-more="backup">⇩ Copia JSON<small>Playlists, enlaces, favoritos e historial</small></button><button class="sheet-btn" data-more="restore">⇧ Restaurar JSON<small>Combina una copia con tu biblioteca actual</small></button><button class="sheet-btn" data-more="m3u-export">≡ Exportar M3U8<small>Interoperabilidad con otros reproductores</small></button><button class="sheet-btn" data-more="m3u-import">＋ Importar M3U/M3U8<small>Enlaces y referencias locales</small></button><button class="sheet-btn danger" data-more="clear">⌫ Borrar historial<small>No borra música ni favoritos</small></button></div>`,root=>{$('[data-more="modes"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaybackModesSheet(),40);};$('[data-more="pwa"]',root).onclick=()=>{closeDialog(els.sheetDialog);openPwaStatusSheet();};$('[data-more="recap"]',root).onclick=()=>{closeDialog(els.sheetDialog);openRecapSheet();};$('[data-more="backup"]',root).onclick=()=>{closeDialog(els.sheetDialog);exportBackup();};$('[data-more="restore"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.backupInput.click();};$('[data-more="m3u-export"]',root).onclick=()=>{closeDialog(els.sheetDialog);openExportM3USheet();};$('[data-more="m3u-import"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.m3uInput.click();};$('[data-more="clear"]',root).onclick=()=>{closeDialog(els.sheetDialog);openClearHistoryConfirm();};});}

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
  const playlistId=info.playlistId||'';if(!playlistId)return toast('No encontré el ID de la playlist');const target=state.playlists.find(p=>p.id===targetPlaylistId)||null;
  showLoader(target?'Añadiendo playlist…':'Importando playlist…','Leyendo títulos y carátulas');updateLoaderProgress(0,1,'YouTube');
  const result=await getYouTubePlaylistIds(playlistId),ids=result.ids||[],name=result.title||`YouTube · ${playlistId.slice(0,18)}`;let pl=target;if(!pl)pl=await createPlaylist(name);
  const src={id:`src_${remoteHash(playlistId)}`,source:'YouTube',url:info.canonicalUrl||canonicalYouTubePlaylistUrl(playlistId),originalUrl:info.url,playlistId,importSource:result.source||'link',status:ids.length?'imported':'linked',count:ids.length,message:ids.length?'':(result.error||'YouTube no expuso el listado al navegador'),addedAt:now(),checkedAt:now()};upsertPlaylistSource(pl,src);
  let added=0;const importedTrackIds=[],records=[];
  for(let i=0;i<ids.length;i++){
    const videoId=ids[i],meta=result.meta?.[videoId]||null,url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const t=makeRemoteTrack('youtube',url,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(3,'0')}`,artist:meta?.artist||meta?.author||'YouTube',thumbnail:meta?.thumbnail||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,playlistSource:playlistId,playlistPosition:i,enriched:!!meta?.title});const merged=mergeImportedTrack(t);records.push(merged);importedTrackIds.push(merged.id);if(!pl.trackIds.includes(merged.id)){pl.trackIds.push(merged.id);added++;}if(i%50===0){updateLoaderProgress(i+1,Math.max(ids.length,1),'preparando playlist');await sleep(0);}
  }
  pl.updatedAt=now();await persistPlaylist(pl);if(state.storageReady&&records.length){for(let i=0;i<records.length;i+=120)await db.putMany('tracks',records.slice(i,i+120)).catch(()=>{});}hideLoader();if(importedTrackIds.length){state.lastImportIds=[...new Set(importedTrackIds)];state.lastImportLabel=name;state.lastImportAt=now();}state.activePlaylistId=pl.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderPlaylists();await persistPrefs();
  if(ids.length)toast(`${target?'Playlist añadida':'Playlist importada'} · ${added} nuevas · ${ids.length} detectadas`,4200);else toast('Playlist guardada. Queda enlazada y puedes reintentar la lectura.',4800);return pl;
}
async function getYouTubePlaylistIds(playlistId,options={}){
  const out={ids:[],source:'',error:'',title:'',meta:{}};
  if(!playlistId){out.error='ID vacío';return out;}
  // 1) If the deployment exposes our same-origin helper, use it first. It avoids CORS and gives the most stable enumeration.
  if(location.protocol!=='file:'){
    try{
      const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),options.quick?7000:26000);
      const apiUrl=new URL('./api/youtube-playlist',location.href);apiUrl.searchParams.set('list',playlistId);
      const r=await fetch(apiUrl,{headers:{'accept':'application/json'},cache:'no-store',signal:ctrl.signal});clearTimeout(timer);
      const ct=r.headers.get('content-type')||'';
      if(r.ok&&ct.includes('application/json')){
        const d=await r.json();
        if(Array.isArray(d.items)&&d.items.length){
          out.ids=Array.from(new Set(d.items.map(x=>x.videoId||x.id).filter(Boolean)));
          out.source=d.source||'API local';out.title=d.title||'';
          for(const item of d.items){const id=item.videoId||item.id;if(id)out.meta[id]={title:item.title||'',artist:item.author||item.channelTitle||'',thumbnail:item.thumbnail||''};}
          return out;
        }
        if(Array.isArray(d.ids)&&d.ids.length){out.ids=Array.from(new Set(d.ids.filter(Boolean)));out.source=d.source||'API local';out.title=d.title||'';return out;}
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
  const src=pl?.sources?.[sourceIndex];if(!src||src.source!=='YouTube'||!src.playlistId)return toast('Esta fuente no puede reimportarse');showLoader('Reintentando…','Consultando títulos y carátulas');const result=await getYouTubePlaylistIds(src.playlistId),ids=result.ids||[];
  if(!ids.length){hideLoader();src.status='linked';src.message=result.error||'YouTube no entregó el listado';src.checkedAt=now();await persistPlaylist(pl);renderPlaylists();return toast('La fuente sigue enlazada; puedes reproducirla y reintentar luego.',4200);}
  let added=0;const records=[];for(let i=0;i<ids.length;i++){const videoId=ids[i],meta=result.meta?.[videoId]||null,t=makeRemoteTrack('youtube',`https://www.youtube.com/watch?v=${videoId}`,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(3,'0')}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,playlistSource:src.playlistId,playlistPosition:i,enriched:!!meta?.title}),merged=mergeImportedTrack(t);records.push(merged);if(!pl.trackIds.includes(merged.id)){pl.trackIds.push(merged.id);added++;}if(i%60===0){updateLoaderProgress(i+1,ids.length,'recuperando canciones');await sleep(0);}}
  src.status='imported';src.count=ids.length;src.message='';src.importSource=result.source;src.checkedAt=now();if(result.title&&/^YouTube ·/.test(pl.name))pl.name=result.title;pl.updatedAt=now();await persistPlaylist(pl);if(state.storageReady)for(let i=0;i<records.length;i+=120)await db.putMany('tracks',records.slice(i,i+120)).catch(()=>{});hideLoader();render();toast(`Fuente recuperada · ${added} nuevas · ${ids.length} detectadas`,4200);return pl;
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
function updateLoaderProgress(current,total,label=''){
  if(els.loaderText)els.loaderText.textContent=`${current}/${total}${label?` · ${label}`:''}`;
  if(els.loaderProgress){els.loaderProgress.classList.toggle('is-hidden',!total);const bar=$('i',els.loaderProgress);if(bar)bar.style.width=total?`${Math.min(100,current/total*100)}%`:'0%';}
}
async function collectPickerEntries(handles,{basePath=''}={}){
  const entries=[];let i=0;for(const handle of handles){try{const file=await handle.getFile();if(isMediaFile(file))entries.push({file,handle,path:basePath});}catch{}if(++i%40===0)await sleep(0);}return entries;
}
async function pickFiles(){
  if('showOpenFilePicker'in window){try{const handles=await showOpenFilePicker({multiple:true,types:[{description:'Audio y video',accept:{'audio/*':['.mp3','.m4a','.aac','.wav','.ogg','.oga','.opus','.flac','.wma'],'video/*':['.mp4','.m4v','.webm','.mov','.3gp','.wmv','.avi','.mkv']}}]});const entries=await collectPickerEntries(handles);return importMediaEntries(entries,{label:'Archivos importados'});}catch(err){if(err?.name!=='AbortError')console.warn(err);}}
  els.fileInput.click();
}
async function pickFolder(){
  if('showDirectoryPicker'in window){
    try{
      const dir=await showDirectoryPicker(),entries=[];showLoader('Leyendo carpeta…',dir.name||'Carpeta');let count=0;
      async function walk(h,path=''){
        for await(const[,e]of h.entries()){
          if(e.kind==='file'){try{const f=await e.getFile();if(isMediaFile(f))entries.push({file:f,handle:e,path:path||dir.name});}catch{}count++;if(count%35===0){updateLoaderProgress(count,Math.max(count,entries.length+1),'encontrando archivos');await sleep(0);}}
          else if(e.kind==='directory')await walk(e,path?`${path}/${e.name}`:`${dir.name}/${e.name}`);
        }
      }
      await walk(dir,dir.name);hideLoader();return importMediaEntries(entries,{label:dir.name||'Carpeta importada'});
    }catch(err){hideLoader();if(err?.name!=='AbortError')console.warn(err);}
  }
  els.folderInput.click();
}
async function reconcileMissingPlaceholder(track){
  const placeholder=state.tracks.find(t=>t.sourceMissing&&t.sourceKind==='local'&&((t.fileName&&track.fileName&&t.fileName.toLowerCase()===track.fileName.toLowerCase())||(!t.fileName&&t.title?.toLowerCase()===track.title?.toLowerCase())));
  if(!placeholder||placeholder.id===track.id)return track;
  track.favorite=!!(track.favorite||placeholder.favorite);track.validPlays=Math.max(track.validPlays||0,placeholder.validPlays||0);track.playCount=track.validPlays;track.completedPlays=Math.max(track.completedPlays||0,placeholder.completedPlays||0);track.listenedMs=Math.max(track.listenedMs||0,placeholder.listenedMs||0);track.skipCount=Math.max(track.skipCount||0,placeholder.skipCount||0);track.replayCount=Math.max(track.replayCount||0,placeholder.replayCount||0);
  for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).map(id=>id===placeholder.id?track.id:id);pl.trackIds=[...new Set(pl.trackIds)];await persistPlaylist(pl);}state.queueIds=state.queueIds.map(id=>id===placeholder.id?track.id:id);state.tracks=state.tracks.filter(t=>t.id!==placeholder.id);if(state.storageReady)await db.delete('tracks',placeholder.id).catch(()=>{});return track;
}
function mergeImportedTrack(track){
  const idx=state.tracks.findIndex(t=>t.id===track.id);if(idx<0){state.tracks.push(track);return track;}const prev=normalizeTrack(state.tracks[idx]);const merged=normalizeTrack({...prev,...track,favorite:!!(prev.favorite||track.favorite),starts:Math.max(prev.starts||0,track.starts||0),validPlays:Math.max(prev.validPlays||0,track.validPlays||0),completedPlays:Math.max(prev.completedPlays||0,track.completedPlays||0),listenedMs:Math.max(prev.listenedMs||0,track.listenedMs||0),skipCount:Math.max(prev.skipCount||0,track.skipCount||0),replayCount:Math.max(prev.replayCount||0,track.replayCount||0),lastPlayed:Math.max(prev.lastPlayed||0,track.lastPlayed||0),addedAt:prev.addedAt||track.addedAt});state.tracks[idx]=merged;return merged;
}
async function persistImportBatch(tracks,sources){
  if(!state.storageReady)return;const chunk=12;
  for(let i=0;i<tracks.length;i+=chunk){await db.putMany('tracks',tracks.slice(i,i+chunk)).catch(err=>console.debug('track batch',err));await idleYield(180);}
  for(let i=0;i<sources.length;i+=6){await db.putMany('sources',sources.slice(i,i+6)).catch(err=>console.debug('source batch',err));await idleYield(420);}
}
function queueEnrichment(items){state.enrichmentQueue.push(...items);if(!state.enrichmentRunning)setTimeout(()=>runEnrichmentQueue(),420);}
async function runEnrichmentQueue(){
  if(state.enrichmentRunning)return;state.enrichmentRunning=true;let processed=0;
  while(state.enrichmentQueue.length){
    const job=state.enrichmentQueue.shift(),track=state.tracks.find(t=>t.id===job.id);if(!track){continue;}let file=sessionFiles.get(track.id)||job.file;
    if(!file&&job.handle){try{file=await job.handle.getFile();}catch{}}
    if(!file){track.enrichError='archivo no disponible';continue;}
    try{
      const meta=await parseAudioTags(file);if(!track.duration)meta.duration=await getDuration(file,2600).catch(()=>0);meta.folder=track.folder;meta.enriched=true;
      if(!meta.coverBlob&&VIDEO_EXT.has(extOf(file.name||''))&&processed<18)meta.coverBlob=await captureVideoArtwork(file).catch(()=>null);
      const fresh=normalizeTrack({...track,title:meta.title||track.title,artist:meta.artist||track.artist,album:meta.album||track.album,genre:meta.genre||track.genre,duration:Number(meta.duration)||track.duration,hasCover:!!(meta.coverBlob||track.hasCover),enriched:true,enrichError:''});mergeImportedTrack(fresh);if(meta.coverBlob)await saveCover(fresh.id,meta.coverBlob);if(state.storageReady)await db.put('tracks',fresh).catch(()=>{});
    }catch(err){track.enrichError=String(err?.message||'metadata');}
    processed++;if(processed%10===0&&state.activeView==='library'&&state.libraryTab==='songs')renderLibrarySongs();await idleYield(260);
  }
  state.enrichmentRunning=false;render();
}
async function importMediaEntries(rawEntries,options={}){
  const entries=(rawEntries||[]).map(x=>x?.file?x:{file:x,handle:null,path:folderFromFile(x)}).filter(x=>x.file&&isMediaFile(x.file));if(!entries.length)return toast('No se encontraron archivos multimedia');
  const inferred=entries[0]?.path?.split('/')?.[0]||topFolderFromFile(entries[0]?.file)||'';const label=options.label||inferred||'Archivos importados';showLoader('Indexando biblioteca…',`${entries.length} archivos`);updateLoaderProgress(0,entries.length);
  const batchIds=[],trackRecords=[],sourceRecords=[],enrich=[];let i=0;
  for(const entry of entries){
    i++;const file=entry.file;let t=makeTrack(file,{folder:entry.path||folderFromFile(file),enriched:false});t=await reconcileMissingPlaceholder(t);t=mergeImportedTrack(t);sessionFiles.set(t.id,file);batchIds.push(t.id);trackRecords.push(t);sourceRecords.push(entry.handle?{id:t.id,kind:'handle',handle:entry.handle,name:file.name,type:file.type,lastModified:file.lastModified}:{id:t.id,kind:'blob',blob:file,name:file.name,type:file.type,lastModified:file.lastModified});enrich.push({id:t.id,file,handle:entry.handle||null});if(i%20===0){updateLoaderProgress(i,entries.length,file.name);await sleep(0);}
  }
  updateLoaderProgress(entries.length,entries.length,'lista');state.lastImportIds=[...new Set(batchIds)];state.lastImportLabel=label;state.lastImportAt=now();await persistPrefs();hideLoader();state.libraryTab='songs';showView('library');renderLibrarySongs();
  persistImportBatch(trackRecords,sourceRecords).then(()=>toast(`Biblioteca guardada · ${entries.length} archivos`,2200)).catch(()=>{});queueEnrichment(enrich);
  if(options.silentPost)return toast(entries.length===1?'Archivo listo':`${entries.length} archivos indexados`);setTimeout(()=>openPostImportSheet(state.lastImportIds,label),120);
}
async function importFiles(fileLike,options={}){const entries=Array.from(fileLike||[]).filter(isMediaFile).map(file=>({file,handle:null,path:folderFromFile(file)}));return importMediaEntries(entries,options);}

function seekFromRange(){const pct=Number(els.progressRange.value)/100;if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo((ytPlayer.getDuration()||0)*pct,true);}catch{}}else if(state.currentEngine==='soundcloud'&&scWidget){const d=getCurrentTrack()?.duration||0;scWidget.seekTo(d*1000*pct);}else{const d=els.audio.duration||0;if(d)els.audio.currentTime=d*pct;}}
async function setupMediaSession(){
  if(!('mediaSession'in navigator))return;
  const t=getCurrentTrack();if(t){
    const art=await artworkUrlFor(t).catch(()=> '');
    try{navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist||sourceLabel(t),album:t.album||'MUSIC PLAY',artwork:art?[{src:art}]:[{src:new URL('./icons/icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}]});}catch{}
  }
  const safe=(action,fn)=>{try{navigator.mediaSession.setActionHandler(action,fn);}catch{}};
  safe('play',()=>togglePlay());safe('pause',()=>togglePlay());safe('previoustrack',()=>prevTrack());safe('nexttrack',()=>nextTrack());
  safe('seekbackward',details=>{const step=details?.seekOffset||10;if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo(Math.max(0,(ytPlayer.getCurrentTime()||0)-step),true);}catch{}}else if(['local','direct'].includes(state.currentEngine))els.audio.currentTime=Math.max(0,(els.audio.currentTime||0)-step);});
  safe('seekforward',details=>{const step=details?.seekOffset||10;if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo(Math.min(ytPlayer.getDuration()||Infinity,(ytPlayer.getCurrentTime()||0)+step),true);}catch{}}else if(['local','direct'].includes(state.currentEngine))els.audio.currentTime=Math.min(els.audio.duration||Infinity,(els.audio.currentTime||0)+step);});
  safe('seekto',details=>{const pos=Math.max(0,Number(details?.seekTime)||0);if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo(pos,true);}catch{}}else if(['local','direct'].includes(state.currentEngine))els.audio.currentTime=pos;});
  safe('stop',async()=>{stopAllEngines();await finalizeListenSession('manual');renderPlayer();syncMediaPlaybackState();});
  syncMediaPlaybackState();updateProgress();
}

function isInstalledDisplay(){return !!(window.matchMedia?.('(display-mode: fullscreen)').matches||window.matchMedia?.('(display-mode: standalone)').matches||window.matchMedia?.('(display-mode: minimal-ui)').matches||window.navigator.standalone===true);}
function syncShellMode(){document.documentElement.dataset.shell=isInstalledDisplay()?'app':'browser';}
function syncInstallUI(){
  if(!els.installBtn)return;syncShellMode();const installed=isInstalledDisplay();els.installBtn.classList.remove('is-hidden');els.installBtn.classList.toggle('installed',installed);
  els.installBtn.innerHTML=installed?'✓ <span>App</span>':'⇩ <span>Instalar</span>';els.installBtn.title=installed?'MUSIC PLAY instalada · pantalla completa':'Instalar MUSIC PLAY como aplicación';
  if(els.onboardingInstallBtn){els.onboardingInstallBtn.classList.toggle('is-hidden',installed);els.onboardingInstallBtn.setAttribute('aria-hidden',installed?'true':'false');}
}
async function requestImmersive(){
  try{if(document.fullscreenElement)return true;if(document.fullscreenEnabled){await document.documentElement.requestFullscreen({navigationUI:'hide'});return true;}}catch(err){console.debug('Fullscreen',err);}return false;
}
function androidChromeIntent(){
  if(!/android/i.test(navigator.userAgent||''))return '';
  const scheme=location.protocol.replace(':','')||'https',target=`${location.host}${location.pathname}${location.search}`;return `intent://${target}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(location.href)};end`;
}
async function triggerNativeInstall(){
  if(!state.installPrompt)return false;try{state.installPrompt.prompt();const choice=await state.installPrompt.userChoice;if(choice?.outcome==='accepted'){toast('Instalando MUSIC PLAY…');}state.installPrompt=null;syncInstallUI();return choice?.outcome==='accepted';}catch(err){console.warn('Install prompt',err);return false;}
}
async function handleInstallClick(){if(isInstalledDisplay())return openInstallSheet();if(state.installPrompt){const ok=await triggerNativeInstall();if(ok)return;}if(/android/i.test(navigator.userAgent||'')){const intent=androidChromeIntent();if(intent){toast('Abriendo MUSIC PLAY en Chrome…',1800);setTimeout(()=>{location.href=intent;},120);return;}}openInstallSheet();}
function openInstallSheet({automatic=false}={}){
  const installed=isInstalledDisplay(),ua=navigator.userAgent||'',ios=/iphone|ipad|ipod/i.test(ua),android=/android/i.test(ua),hasPrompt=!!state.installPrompt;
  if(installed){openSheet(`<h2 class="sheet-title">✓ MUSIC PLAY instalada</h2><p class="sheet-copy">Se está ejecutando en modo aplicación. Puedes intentar el modo inmersivo para usar toda la pantalla disponible.</p><div class="sheet-stack"><button class="sheet-btn" data-full>⛶ Pantalla completa<small>Oculta la interfaz del navegador si el sistema lo permite</small></button><button class="sheet-btn" data-close>Listo</button></div>`,root=>{$('[data-full]',root).onclick=async()=>{await requestImmersive();closeDialog(els.sheetDialog);};$('[data-close]',root).onclick=()=>closeDialog(els.sheetDialog);});return;
  }
  let copy='Instálala para abrir MUSIC PLAY sin barra de direcciones y con icono propio.';
  if(ios)copy='En iPhone/iPad: usa Compartir → Añadir a pantalla de inicio. Después ábrela desde su icono.';
  else if(android&&!hasPrompt)copy='Este visor no ofrece el instalador nativo. Abre MUSIC PLAY en Chrome y allí instala la PWA.';
  openSheet(`<h2 class="sheet-title">⇩ Instalar MUSIC PLAY</h2><p class="sheet-copy">${copy}</p><div class="install-note"><strong>PWA</strong><span>La versión instalada solicita modo de pantalla completa y conserva biblioteca, playlists y controles multimedia.</span></div><div class="sheet-stack">${hasPrompt?'<button class="sheet-btn" data-native>⇩ Instalar ahora<small>Usar el instalador del navegador</small></button>':''}${android&&!hasPrompt?'<button class="sheet-btn" data-chrome>◎ Abrir en Chrome<small>Luego toca Instalar MUSIC PLAY</small></button>':''}<button class="sheet-btn" data-full>⛶ Usar pantalla completa ahora<small>Funciona desde un toque si el navegador lo permite</small></button><button class="sheet-btn" data-close>${automatic?'Ahora no':'Cerrar'}</button></div>`,root=>{
    $('[data-native]',root)?.addEventListener('click',async()=>{const ok=await triggerNativeInstall();if(ok)closeDialog(els.sheetDialog);});
    $('[data-chrome]',root)?.addEventListener('click',()=>{const intent=androidChromeIntent();if(intent)location.href=intent;});
    $('[data-full]',root).onclick=async()=>{await requestImmersive();closeDialog(els.sheetDialog);};$('[data-close]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}
function maybeShowInstallCoach(){
  syncInstallUI();if(isInstalledDisplay()||state.installCoachShown)return;try{if(sessionStorage.getItem('mpf-install-coach-r10'))return;sessionStorage.setItem('mpf-install-coach-r10','1');}catch{}state.installCoachShown=true;setTimeout(()=>{if(!els.sheetDialog.open)openInstallSheet({automatic:true});},650);
}
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
  els.homeBtn.onclick=()=>showView('home');els.moreBtn.onclick=openMoreMenu;
  els.navHome.onclick=()=>showView('home');els.navSearch.onclick=()=>showView('search');els.navLibrary.onclick=()=>showView('library');
  els.homeSearchBtn.onclick=()=>showView('search');els.homeAllPlaylistsBtn.onclick=()=>{state.libraryTab='playlists';state.playlistDetailOpen=false;showView('library');};
  els.favoritesShortcut.onclick=()=>openSmartCollection(SMART_IDS.favorites);els.mostPlayedShortcut.onclick=()=>openSmartCollection(SMART_IDS.most);
  els.onboardingInstallBtn.onclick=handleInstallClick;els.onboardingFileBtn.onclick=pickFiles;els.onboardingFolderBtn.onclick=pickFolder;els.onboardingLinkBtn.onclick=()=>openLinkSheet();els.onboardingMusicBtn.onclick=()=>{state.libraryTab='songs';showView('library');};els.onboardingPlayBtn.onclick=togglePlay;

  [els.libraryTabPlaylists,els.libraryTabSongs,els.libraryTabAlbums].forEach(b=>b.onclick=()=>setLibraryTab(b.dataset.tab));
  els.librarySortSelect.onchange=()=>{state.librarySort=els.librarySortSelect.value;persistPrefs();renderLibraryShell();};
  els.librarySearchBtn.onclick=()=>showView('search');els.libraryAddBtn.onclick=openLibraryNewSheet;els.libraryNewPlaylistFab.onclick=openLibraryNewSheet;els.searchNewBtn.onclick=openLibraryNewSheet;els.emptyLoadBtn.onclick=openLoadSheet;
  els.emptyNewPlaylistBtn.onclick=()=>openCreatePlaylistSheet();els.emptyImportPlaylistBtn.onclick=()=>openLinkSheet();
  els.playlistDetailBack.onclick=closePlaylistDetail;els.playlistMenuBtn.onclick=openPlaylistMenuSheet;els.openLibraryFromPlaylists.onclick=()=>{const pl=getActivePlaylist();if(pl)openAddSongsToPlaylistSheet(pl.id);};els.addLinkToPlaylistBtn.onclick=()=>{const pl=getActivePlaylist();if(pl)openLinkSheet('',pl.id);};
  els.playPlaylistBtn.onclick=async()=>{state.playbackMode=PLAY_MODES.normal;state.shuffle=false;state.modePlayedIds=[];if(state.activeSmartId){const tracks=getSmartTracks(state.activeSmartId).filter(playable);if(!tracks.length)return toast('Esta lista automática todavía está vacía');state.baseQueueIds=tracks.map(t=>t.id);await persistPrefs();return playTrack(tracks[0].id,tracks.map(t=>t.id),{preserveBase:true});}const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');const tracks=getPlaylistTracks(pl).filter(playable);if(tracks.length){state.baseQueueIds=tracks.map(t=>t.id);await persistPrefs();return playTrack(tracks[0].id,tracks.map(t=>t.id),{preserveBase:true});}if((pl.sources||[]).length||pl.externalRef){await persistPrefs();return playExternalPlaylist(pl);}toast('Esta playlist está vacía');};
  els.mixPlaylistBtn.onclick=()=>{if(state.activeSmartId)return startMix(getSmartTracks(state.activeSmartId).map(t=>t.id));const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');startMix(pl.trackIds||[]);};

  els.searchInput.oninput=()=>{state.search=els.searchInput.value;renderLibrarySongs();};
  els.globalSearchInput.oninput=()=>{state.globalSearch=els.globalSearchInput.value;renderSearch();};
  els.globalSearchInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&/^https?:\/\//i.test(els.globalSearchInput.value.trim())){e.preventDefault();openLinkSheet(els.globalSearchInput.value.trim());}});
  els.searchLinkHint.onclick=()=>openLinkSheet(els.globalSearchInput.value.trim());

  els.fileInput.onchange=()=>{importFiles(els.fileInput.files,{label:'Archivos importados'});els.fileInput.value='';};
  els.folderInput.onchange=()=>{const fs=els.folderInput.files,label=fs?.[0]?.webkitRelativePath?.split('/')?.[0]||'Carpeta importada';importFiles(fs,{label});els.folderInput.value='';};
  els.backupInput.onchange=()=>{const f=els.backupInput.files?.[0];els.backupInput.value='';if(f)restoreBackupFile(f);};els.m3uInput.onchange=()=>{const f=els.m3uInput.files?.[0];els.m3uInput.value='';if(f)importM3UFile(f);};

  els.miniOpen.onclick=()=>openDialog(els.playerDialog);[els.playBtn,els.fullPlayBtn].forEach(b=>b.onclick=togglePlay);[els.prevBtn,els.fullPrevBtn].forEach(b=>b.onclick=prevTrack);[els.nextBtn,els.fullNextBtn].forEach(b=>b.onclick=nextTrack);els.shuffleBtn.onclick=()=>openPlaybackModesSheet();els.favoriteBtn.onclick=()=>toggleFavorite();els.miniFavoriteBtn.onclick=e=>{e.stopPropagation();toggleFavorite();};els.progressRange.oninput=seekFromRange;els.volumeRange.oninput=()=>{state.volume=Number(els.volumeRange.value)||0;els.audio.volume=state.volume;if(ytPlayer)try{ytPlayer.setVolume(Math.round(state.volume*100));}catch{}if(scWidget)try{scWidget.setVolume(Math.round(state.volume*100));}catch{}persistPrefs();};els.addCurrentToPlaylist.onclick=()=>{const t=getCurrentTrack();if(t)openPlaylistPickerSheet(t.id);};

  els.audio.addEventListener('timeupdate',updateProgress);els.audio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(t&&!t.duration&&Number.isFinite(els.audio.duration)){t.duration=els.audio.duration;saveRemoteTrack(t);}updateProgress();});els.audio.addEventListener('play',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=true;syncMediaPlaybackState();renderPlayer();renderHome();}});els.audio.addEventListener('pause',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=false;syncMediaPlaybackState();renderPlayer();renderHome();}});els.audio.addEventListener('ended',handleNaturalEnd);els.audio.addEventListener('error',()=>{if(['local','direct'].includes(state.currentEngine))toast('Este formato o enlace no pudo reproducirse en el navegador',3800);});

  ['dragenter','dragover'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropHint.classList.add('show');}));['dragleave','drop'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();if(ev==='drop'||!e.relatedTarget)els.dropHint.classList.remove('show');}));window.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)importFiles(e.dataTransfer.files);});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;syncInstallUI();});window.addEventListener('appinstalled',()=>{state.installPrompt=null;syncInstallUI();toast('MUSIC PLAY instalada ✓ · ábrela desde su icono');});['fullscreen','standalone','minimal-ui'].forEach(mode=>window.matchMedia?.(`(display-mode: ${mode})`)?.addEventListener?.('change',syncInstallUI));els.installBtn.onclick=handleInstallClick;els.updateBtn.onclick=applyAvailableUpdate;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){state.remoteExpectedPlaying=state.playing&&['youtube','soundcloud'].includes(state.currentEngine);}else{checkForUpdates(false);if(state.remoteExpectedPlaying){state.remoteExpectedPlaying=false;setTimeout(()=>{if(state.currentEngine==='youtube'&&ytPlayer&&!state.playing){try{ytPlayer.playVideo();}catch{}setTimeout(()=>{if(!state.playing)toast('YouTube puede pausar al bloquear la pantalla · toca Play para continuar',4200);},900);}else if(state.currentEngine==='soundcloud'&&scWidget&&!state.playing){try{scWidget.play();}catch{}}},150);}}});window.addEventListener('online',()=>checkForUpdates(true));
  document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.key.toLowerCase()==='m')startMix(getFilteredTracks().map(t=>t.id));else if(e.key.toLowerCase()==='l')showView('library');else if(e.key==='/'){e.preventDefault();showView('search');}});window.addEventListener('pagehide',()=>{finalizeListenSession('pause');persistPrefs();});window.addEventListener('beforeunload',persistPrefs);
}

async function init(){
  document.documentElement.dataset.theme=state.theme;
  try{state.storageReady=await db.init();}catch{state.storageReady=false;}
  await loadStoredData();
  if(els.librarySortSelect)els.librarySortSelect.value=state.librarySort||'recent';
  bindEvents();
  syncInstallUI();
  await registerSW();
  render();
  els.audio.volume=state.volume;
  setupMediaSession();
  try{navigator.storage?.persist?.();}catch{}
  checkForUpdates(true);
  const requestedView=new URLSearchParams(location.search).get('view');if(['home','search','library','playlist'].includes(requestedView))showView(requestedView);
  await sleep(2000);
  els.intro.classList.add('hide');
  els.app.classList.remove('is-hidden');
  setTimeout(()=>els.intro.remove(),450);
  maybeShowInstallCoach();
}
init().catch(err=>{console.error(err);els.intro?.classList.add('hide');els.app?.classList.remove('is-hidden');toast('La app abrió en modo seguro');});

})();
