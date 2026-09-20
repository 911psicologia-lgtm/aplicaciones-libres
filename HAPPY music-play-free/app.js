(() => {
'use strict';

const BUILD = '2026.09.20-r10.34-track-visible';
const APP_VERSION = 'R10.34';
// R10.15 · Detección del APK (WebView + HappyNative). En el APK se suprime la
// instalación PWA, el mini ⧉ interno se sustituye por la ventana flotante real
// y la importación de carpetas usa el selector nativo de árbol.
const IS_NATIVE_APK = (typeof window !== 'undefined' && typeof window.HappyNative !== 'undefined' && !!window.HappyNative) || (typeof location !== 'undefined' && location.hostname === 'appassets.androidplatform.net');
const DB_NAME = 'mpf-minimal-db';
const DB_VERSION = 7;
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
// R10.17 · HAPPY BOOST — algoritmo de mejora de audio multibanda + ensanchador
// estereo + limitador de loudness. Aplica a TODAS las fuentes (local, YouTube,
// enlaces directos) y no solo a la biblioteca local. Compatible con medios
// cross-origin cuando el servidor entrega CORS (YouTube CDN sí lo hace).
const SOUND_MODES = Object.freeze({auto:'auto',original:'original',warm:'warm',punch:'punch',clear:'clear',boost:'boost'});
const PODCAST_RATES = Object.freeze([1,1.25,1.5,1.75,2]);
const SOUND_MODE_META = Object.freeze({
  auto:{icon:'◉',name:'Auto',desc:'Ajusta sutilmente graves, presencia y dinámica según el ritmo detectado'},
  original:{icon:'○',name:'Original',desc:'Sin ecualización adicional'},
  warm:{icon:'≈',name:'Cálido',desc:'Más cuerpo y suavidad'},
  punch:{icon:'◆',name:'Potente',desc:'Más pegada en graves y percusión'},
  clear:{icon:'✧',name:'Claro',desc:'Más definición en voces y detalles'},
  boost:{icon:'★',name:'HAPPY BOOST',desc:'Mejora multibanda + ensanchador estéreo + loudness · todas las fuentes'}
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
  intro: $('#intro'), app: $('#app'), audio: $('#audio'), directAudio: $('#directAudio'), ytAudio: $('#ytAudio'), ytVideo: $('#ytVideo'),
  remoteIframeSlot: $('#remoteIframeSlot'), remoteNativeSlot: $('#remoteNativeSlot'), remoteAudioSlot: $('#remoteAudioSlot'),
  ytAudioCard: $('#ytAudioCard'), ytAudioArt: $('#ytAudioArt'), ytAudioTitle: $('#ytAudioTitle'), ytAudioArtist: $('#ytAudioArtist'),
  homeBtn: $('#homeBtn'), installBtn: $('#installBtn'), updateBtn: $('#updateBtn'), moreBtn: $('#moreBtn'), floatMiniBtn: $('#floatMiniBtn'), boostBtn: $('#boostBtn'),
  homeView: $('#homeView'), searchView: $('#searchView'), libraryView: $('#libraryView'), studioView: $('#studioView'), radioView: $('#radioView'),
  onboardingPanel: $('#onboardingPanel'), matureHome: $('#matureHome'), onboardingInstallBtn: $('#onboardingInstallBtn'), onboardingStep1: $('#onboardingStep1'), onboardingStep2: $('#onboardingStep2'), onboardingStep3: $('#onboardingStep3'),
  onboardingFileBtn: $('#onboardingFileBtn'), onboardingFolderBtn: $('#onboardingFolderBtn'), onboardingLinkBtn: $('#onboardingLinkBtn'), onboardingMusicBtn: $('#onboardingMusicBtn'), onboardingPlayBtn: $('#onboardingPlayBtn'), onboardingStartBtn: $('#onboardingStartBtn'),
  resumeCard: $('#resumeCard'), resumeArtwork: $('#resumeArtwork'), resumeTitle: $('#resumeTitle'), resumeArtist: $('#resumeArtist'), resumePlayIcon: $('#resumePlayIcon'),
  homeRecent: $('#homeRecent'), homePlaylists: $('#homePlaylists'), homeAlbums: $('#homeAlbums'), homeAlbumsSection: $('#homeAlbumsSection'), homeRhythms: $('#homeRhythms'), homeRhythmsSection: $('#homeRhythmsSection'), homeArtists: $('#homeArtists'), homeArtistsSection: $('#homeArtistsSection'), homePodcasts: $('#homePodcasts'), homePodcastsSection: $('#homePodcastsSection'), homeAllPodcastsBtn: $('#homeAllPodcastsBtn'), homePending: $('#homePending'), homePendingSection: $('#homePendingSection'), homeDaily: $('#homeDaily'), homeDailySection: $('#homeDailySection'), homeDailyHint: $('#homeDailyHint'), homeMusicVideo: $('#homeMusicVideo'), homeMusicVideoSection: $('#homeMusicVideoSection'), homeSearchBtn: $('#homeSearchBtn'), homeAllPlaylistsBtn: $('#homeAllPlaylistsBtn'), homeAllAlbumsBtn: $('#homeAllAlbumsBtn'),
  homeDecades: $('#homeDecades'), homeDecadesSection: $('#homeDecadesSection'), homeDecadesHint: $('#homeDecadesHint'),
  countTracks: $('#countTracks'), countPlaylists: $('#countPlaylists'), countFavorites: $('#countFavorites'), countMost: $('#countMost'), listenTimeHome: $('#listenTimeHome'), favoritesShortcut: $('#favoritesShortcut'), mostPlayedShortcut: $('#mostPlayedShortcut'), recentShortcut: $('#recentShortcut'), repeatShortcut: $('#repeatShortcut'), rediscoverShortcut: $('#rediscoverShortcut'), radioShortcut: $('#radioShortcut'), surpriseShortcut: $('#surpriseShortcut'), mixShortcut: $('#mixShortcut'),
  globalSearchInput: $('#globalSearchInput'), searchLinkHint: $('#searchLinkHint'), searchEmpty: $('#searchEmpty'), searchResults: $('#searchResults'), searchNewBtn: $('#searchNewBtn'),
  libraryMainHead: $('#libraryMainHead'), librarySearchBtn: $('#librarySearchBtn'), libraryAddBtn: $('#libraryAddBtn'), libraryTabs: $('#libraryTabs'), libraryTabPlaylists: $('#libraryTabPlaylists'), libraryTabSongs: $('#libraryTabSongs'), libraryTabAlbums: $('#libraryTabAlbums'), librarySortSelect: $('#librarySortSelect'), librarySortRow: $('#librarySortRow'), libraryCountLabel: $('#libraryCountLabel'),
  libraryPlaylistsPanel: $('#libraryPlaylistsPanel'), librarySongsPanel: $('#librarySongsPanel'), libraryAlbumsPanel: $('#libraryAlbumsPanel'), libraryRadioPanel: $('#libraryRadioPanel'), libraryTabRadio: $('#libraryTabRadio'), libraryNewPlaylistFab: $('#libraryNewPlaylistFab'), albumList: $('#albumList'), albumEmpty: $('#albumEmpty'),
  searchInput: $('#searchInput'), genreChips: $('#genreChips'), songScopeBar: $('#songScopeBar'), songScopeCount: $('#songScopeCount'), songScopeLabel: $('#songScopeLabel'), playSongScopeBtn: $('#playSongScopeBtn'), songScopeModeBtn: $('#songScopeModeBtn'), favoriteSongScopeBtn: $('#favoriteSongScopeBtn'), playlistSongScopeBtn: $('#playlistSongScopeBtn'), libraryEmpty: $('#libraryEmpty'), libraryList: $('#libraryList'), emptyLoadBtn: $('#emptyLoadBtn'),
  playlistHub: $('#playlistHub'), playlistHubEmpty: $('#playlistHubEmpty'), playlistDetail: $('#playlistDetail'), playlistList: $('#playlistList'), playlistEmpty: $('#playlistEmpty'),
  playlistDetailBack: $('#playlistDetailBack'), playlistDetailTitle: $('#playlistDetailTitle'), playlistDetailMeta: $('#playlistDetailMeta'), playlistMenuBtn: $('#playlistMenuBtn'), playlistSources: $('#playlistSources'), playlistHeroArtwork: $('#playlistHeroArtwork'),
  emptyNewPlaylistBtn: $('#emptyNewPlaylistBtn'), emptyImportPlaylistBtn: $('#emptyImportPlaylistBtn'), openLibraryFromPlaylists: $('#openLibraryFromPlaylists'), addLinkToPlaylistBtn: $('#addLinkToPlaylistBtn'), playPlaylistBtn: $('#playPlaylistBtn'), mixPlaylistBtn: $('#mixPlaylistBtn'), playlistModeBtn: $('#playlistModeBtn'), libraryTabPodcast: $('#libraryTabPodcast'),
  navHome: $('#navHome'), navSearch: $('#navSearch'), navLibrary: $('#navLibrary'), navStudio: $('#navStudio'), navRadio: $('#navRadio'), bottomNav: $('#bottomNav'),
  miniPlayer: $('#miniPlayer'), miniOpen: $('#miniOpen'), miniTitle: $('#miniTitle'), miniArtist: $('#miniArtist'), miniFavoriteBtn: $('#miniFavoriteBtn'), miniAddPlaylistBtn: $('#miniAddPlaylistBtn'), miniQueueBtn: $('#miniQueueBtn'), miniQueueCount: $('#miniQueueCount'),
  playBtn: $('#playBtn'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'),
  playerDialog: $('#playerDialog'), fullTitle: $('#fullTitle'), fullArtist: $('#fullArtist'), progressRange: $('#progressRange'), timeNow: $('#timeNow'), timeTotal: $('#timeTotal'),
  fullPlayBtn: $('#fullPlayBtn'), fullPrevBtn: $('#fullPrevBtn'), fullNextBtn: $('#fullNextBtn'), shuffleBtn: $('#shuffleBtn'), favoriteBtn: $('#favoriteBtn'), volumeRange: $('#volumeRange'), addCurrentToPlaylist: $('#addCurrentToPlaylist'), queueManagerBtn: $('#queueManagerBtn'), queueManagerCount: $('#queueManagerCount'), repeatCurrentBtn: $('#repeatCurrentBtn'), soundModeBtn: $('#soundModeBtn'), shareCurrentBtn: $('#shareCurrentBtn'), podcastControls: $('#podcastControls'), podcastBackBtn: $('#podcastBackBtn'), podcastRateBtn: $('#podcastRateBtn'), podcastForwardBtn: $('#podcastForwardBtn'), miniArtwork: $('#miniArtwork'), playerArtwork: $('#playerArtwork'),
  sheetDialog: $('#sheetDialog'), sheetContent: $('#sheetContent'),
  remoteDock: $('#remoteDock'), remoteDockBar: $('#remoteDockBar'), remoteDragHandle: $('#remoteDragHandle'), remoteResizeBtn: $('#remoteResizeBtn'), remoteShareBtn: $('#remoteShareBtn'), remoteCloseBtn: $('#remoteCloseBtn'), remoteStage: $('#remoteStage'), remoteLabel: $('#remoteLabel'), ytProbeHost: $('#ytProbeHost'),
  miniFloatBtn: $('#miniFloatBtn'), floatMini: $('#floatMini'), fmDrag: $('#fmDrag'), fmLabel: $('#fmLabel'), fmPos: $('#fmPos'), fmExpand: $('#fmExpand'), fmClose: $('#fmClose'), fmStage: $('#fmStage'), fmTitle: $('#fmTitle'), fmArtist: $('#fmArtist'), fmProgress: $('#fmProgress'), fmTimeNow: $('#fmTimeNow'), fmTimeTotal: $('#fmTimeTotal'), fmPrev: $('#fmPrev'), fmPlay: $('#fmPlay'), fmNext: $('#fmNext'),
  dropHint: $('#dropHint'), loader: $('#loader'), loaderTitle: $('#loaderTitle'), loaderText: $('#loaderText'), loaderProgress: $('#loaderProgress'), toast: $('#toast'),
  fileInput: $('#fileInput'), folderInput: $('#folderInput'), backupInput: $('#backupInput'), m3uInput: $('#m3uInput')
};

const sessionFiles = new Map();
const artworkCache = new Map();
const grantedHandleRoots = new Set();
const deniedHandleRoots = new Set();
let ytApiPromise = null;
let ytPlayer = null;
let ytProbePlayer = null;
let ytProgressTimer = null;
let scApiPromise = null;
let scWidget = null;
let scProgressTimer = null;
let opfsAudioDirPromise = null;
let searchInputRaf = 0;
let globalSearchRaf = 0;
const playbackFailureChain = new Set();
// R10.17 · Motor de mejora de audio HAPPY BOOST
// Grafo: sources -> input -> subBass -> bass -> lowMid -> body -> presence
//        -> highMid -> treble -> air -> midSide -> compressor -> limiter -> output -> destination
const audioFx = {
  ctx:null, sources:new Map(), input:null,
  subBass:null, bass:null, lowMid:null, body:null, presence:null, highMid:null, treble:null, air:null,
  midGain:null, sideGain:null, stereoWiden:0,
  compressor:null, limiter:null, output:null,
  connected:false, profile:'original', boostActive:false, attachedElements:new Set()
};

const state = {
  tracks: [], playlists: [], activeView: 'home', libraryTab: 'playlists', activeGenre: 'all', activePlaylistId: '', playlistDetailOpen: false,
  currentId: null, queueIds: [], baseQueueIds: [], manualQueueIds: [], queueIndex: -1, repeatOneId: '', playing: false, shuffle: false, playbackMode: PLAY_MODES.normal,
  modePlayedIds: [], navHistory: [], volume: 0.92, search: '', globalSearch: '', librarySort: 'recent', theme: 'dark', objectUrl: null, installPrompt: null, storageReady: false,
  swRegistration: null, updateAvailable: false, remoteBuild: null, lastUpdateCheck: 0, refreshingForUpdate: false,
  currentEngine: 'none', activeSmartId: '', listenSession: null, history: [], renderChunk: 60,
  ytEngine: 'none', ytNativeKind: 'audio', ytMedia: null, ytHandoverPos: 0, ytResumeVideo: false, ytRetryDone: false, ytNativeMode: 'auto', ytCustomApi: '', ytHelperUrl: '', ytDiag: null, ytDiagRes: false, ytIframeHintShown: false, ytInstCache: null, ytInstAt: 0,
  ytDelegatedSourceId: '', autoFailStreak: 0, ytDelegated: false, ytPlaylistSourceId: '', autoAdvanceDepth: 0, autoFullscreen: true, floatMini: false, autoFsWasOn: false, ytService: false, nativePositionMs: 0, nativeDurationMs: 0,
  lastImportIds: [], lastImportLabel: '', lastImportAt: 0, remoteExpectedPlaying: false, installCoachShown: false,
  importJob: null, enrichmentQueue: [], enrichmentRunning: false, fileHandlesSupported: false, firstRunComplete: false,
  pendingImportTargetId: '', pendingImportLabel: '', installPromptSeenAt: 0,
  pendingReconnectTrackId: '', reconnectSheetOpen: false,
  localPersistQueue: [], localPersistRunning: false, localPersistDone: 0, localPersistFailed: 0,
  songCategories: [], songSource: 'all', soundMode: SOUND_MODES.auto, soundProfile: 'original', searchOriginPlaylistId: '', podcastRate: 1, dailyRecommendationDate: '', dailyRecommendationBand: '', dailyRecommendationIds: []
};


// Capture the install prompt as soon as this script is evaluated. In previous builds
// the listener was attached only after IndexedDB/library initialization, which could
// miss Chrome's one-time beforeinstallprompt event on fast loads.
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  if(IS_NATIVE_APK){state.installPrompt=null;return;} // R10.15: en el APK nunca se ofrece instalar la PWA
  state.installPrompt=e;
  state.installPromptSeenAt=now();
  try{syncInstallUI();}catch{}
});


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
        if(!d.objectStoreNames.contains('backups')) d.createObjectStore('backups',{keyPath:'id'});
        for(const name of ['radioFavorites','radioRecent','radioCache','radioRecordings'])if(!d.objectStoreNames.contains(name))d.createObjectStore(name,{keyPath:'id'});
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
    resumePosition:Math.max(0,Number(t.resumePosition)||0),resumeDuration:Math.max(0,Number(t.resumeDuration)||0),resumeUpdatedAt:Number(t.resumeUpdatedAt)||0,
    lastListenPosition:Math.max(0,Number(t.lastListenPosition)||0),lastListenDuration:Math.max(0,Number(t.lastListenDuration)||0),lastListenRatio:Math.max(0,Math.min(1,Number(t.lastListenRatio)||0)),lastListenUpdatedAt:Number(t.lastListenUpdatedAt)||0,
    folder:t.folder||'',enriched:!!t.enriched,enrichError:t.enrichError||'',sourceMissing:!!t.sourceMissing};
}
function normalizePlaylist(pl){
  const sources=Array.isArray(pl.sources)?pl.sources.filter(Boolean):[];
  if(pl.externalRef&&!sources.some(s=>s.playlistId&&s.playlistId===pl.externalRef.playlistId)){
    sources.push({id:`src_${remoteHash(pl.externalRef.url||pl.externalRef.playlistId||String(pl.id))}`,source:pl.externalRef.source||'YouTube',url:pl.externalRef.url||'',originalUrl:pl.externalRef.originalUrl||pl.externalRef.url||'',playlistId:pl.externalRef.playlistId||'',status:pl.importDiagnostic?.status||'linked',count:Number(pl.importDiagnostic?.count)||0,message:pl.importDiagnostic?.message||'',addedAt:pl.createdAt||now()});
  }
  const createdAt=Number(pl.createdAt)||now();const contentType=['music','podcast','musicVideo'].includes(pl.contentType)?pl.contentType:'music';return {...pl,contentType,trackIds:Array.from(new Set(pl.trackIds||[])),sources,createdAt,updatedAt:Number(pl.updatedAt)||createdAt};
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
    const newerListen=(track.lastListenUpdatedAt||0)>=(prev.lastListenUpdatedAt||0)?track:prev;track=normalizeTrack({...prev,...track,favorite:!!(prev.favorite||track.favorite),starts:Math.max(prev.starts||0,track.starts||0),validPlays:Math.max(prev.validPlays||0,track.validPlays||0),completedPlays:Math.max(prev.completedPlays||0,track.completedPlays||0),listenedMs:Math.max(prev.listenedMs||0,track.listenedMs||0),skipCount:Math.max(prev.skipCount||0,track.skipCount||0),replayCount:Math.max(prev.replayCount||0,track.replayCount||0),lastStarted:Math.max(prev.lastStarted||0,track.lastStarted||0),lastPlayed:Math.max(prev.lastPlayed||0,track.lastPlayed||0),lastValidAt:Math.max(prev.lastValidAt||0,track.lastValidAt||0),lastCompleted:Math.max(prev.lastCompleted||0,track.lastCompleted||0),lastListenPosition:newerListen.lastListenPosition||0,lastListenDuration:newerListen.lastListenDuration||0,lastListenRatio:newerListen.lastListenRatio||0,lastListenUpdatedAt:newerListen.lastListenUpdatedAt||0,addedAt:prev.addedAt||track.addedAt});
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
    if(p){state.currentId=p.currentId||null;state.queueIds=p.queueIds||[];state.baseQueueIds=p.baseQueueIds||p.queueIds||[];state.manualQueueIds=Array.isArray(p.manualQueueIds)?p.manualQueueIds:[];state.repeatOneId=p.repeatOneId||'';state.queueIndex=Number.isInteger(p.queueIndex)?p.queueIndex:-1;state.volume=Number.isFinite(p.volume)?p.volume:.92;state.activePlaylistId=p.activePlaylistId||'';state.activeSmartId=p.activeSmartId||'';state.theme=p.theme||'dark';state.activeView=['home','search','library','studio','radio'].includes(p.activeView)?p.activeView:'home';state.libraryTab=['playlists','songs','albums','radio'].includes(p.libraryTab)?p.libraryTab:'playlists';state.librarySort=['recent','name','played'].includes(p.librarySort)?p.librarySort:'recent';state.firstRunComplete=!!p.firstRunComplete;state.playbackMode=Object.values(PLAY_MODES).includes(p.playbackMode)?p.playbackMode:(p.shuffle?PLAY_MODES.shuffle:PLAY_MODES.normal);state.shuffle=state.playbackMode===PLAY_MODES.shuffle;state.songCategories=Array.isArray(p.songCategories)?p.songCategories.filter(Boolean).slice(0,24):[];state.songSource=['all','local','youtube','linked'].includes(p.songSource)?p.songSource:'all';state.soundMode=Object.values(SOUND_MODES).includes(p.soundMode)?p.soundMode:SOUND_MODES.auto;state.podcastRate=PODCAST_RATES.includes(Number(p.podcastRate))?Number(p.podcastRate):1;state.dailyRecommendationDate=p.dailyRecommendationDate||'';state.dailyRecommendationBand=p.dailyRecommendationBand||'';state.dailyRecommendationIds=Array.isArray(p.dailyRecommendationIds)?p.dailyRecommendationIds:[];state.ytNativeMode=p.ytNativeMode==='iframe'?'iframe':'auto';state.ytCustomApi=typeof p.ytCustomApi==='string'?p.ytCustomApi:'';state.ytHelperUrl=typeof p.ytHelperUrl==='string'?p.ytHelperUrl:'';state.autoFullscreen=p.autoFullscreen!==false;}
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
async function persistPrefs(){if(!state.storageReady)return;await db.put('prefs',{key:'ui',currentId:state.currentId,queueIds:state.queueIds,baseQueueIds:state.baseQueueIds,manualQueueIds:state.manualQueueIds,repeatOneId:state.repeatOneId,queueIndex:state.queueIndex,volume:state.volume,activeView:state.activeView,activePlaylistId:state.activePlaylistId,activeSmartId:state.activeSmartId,theme:state.theme,libraryTab:state.libraryTab,librarySort:state.librarySort,firstRunComplete:state.firstRunComplete,playbackMode:state.playbackMode,shuffle:state.playbackMode===PLAY_MODES.shuffle,songCategories:state.songCategories,songSource:state.songSource,soundMode:state.soundMode,podcastRate:state.podcastRate,dailyRecommendationDate:state.dailyRecommendationDate,dailyRecommendationBand:state.dailyRecommendationBand,dailyRecommendationIds:state.dailyRecommendationIds,ytNativeMode:state.ytNativeMode,ytCustomApi:state.ytCustomApi,ytHelperUrl:state.ytHelperUrl,autoFullscreen:state.autoFullscreen!==false}).catch(()=>{});}
async function persistPlaylist(pl){if(state.storageReady)await db.put('playlists',pl).catch(()=>{});}

function songTrackText(t){
  const playlistNames=state.playlists.filter(pl=>(pl.trackIds||[]).includes(t.id)).map(pl=>pl.name).slice(0,6);
  return [t.title,t.artist,t.album,t.genre,t.folder,t.fileName,...playlistNames].filter(Boolean).join(' ');
}
function rhythmKeysForTrack(t){return rhythmMatchesText(songTrackText(t)).map(r=>`rhythm:${r.id}`);}
function rawGenreKey(t){const g=(t.genre||'').trim();return g?`genre:${g.toLowerCase()}`:'';}
function matchesSongSource(t){
  if(state.songSource==='local')return t.sourceKind==='local';
  if(state.songSource==='youtube')return t.sourceKind==='youtube'||t.sourceKind==='youtube-playlist';
  if(state.songSource==='linked')return !['local','youtube','youtube-playlist'].includes(t.sourceKind||'local');
  return true;
}
function matchesSongCategories(t){
  const selected=state.songCategories||[];if(!selected.length)return true;
  const rhythm=new Set(rhythmKeysForTrack(t)),raw=rawGenreKey(t);
  return selected.some(key=>key===raw||rhythm.has(key));
}
function getFilteredTracks(){
  let list=[...state.tracks];const q=state.search.trim().toLowerCase();
  if(q)list=list.filter(t=>[t.title,t.artist,t.album,t.genre,t.fileName,t.remoteUrl,t.folder,sourceLabel(t)].join(' ').toLowerCase().includes(q));
  list=list.filter(matchesSongSource).filter(matchesSongCategories);
  return list.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
}
function getCurrentTrack(){return state.tracks.find(t=>t.id===state.currentId)||null;}
function getActivePlaylist(){return state.playlists.find(p=>p.id===state.activePlaylistId)||null;}
function getPlaylistTracks(pl){return(pl?.trackIds||[]).map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);}
function songCategoryOptions(){
  const out=[],seen=new Set();
  try{
    const groups=getRhythmGroups();for(const g of groups){if(g.tracks.length&& !seen.has(`rhythm:${g.id}`)){seen.add(`rhythm:${g.id}`);out.push({key:`rhythm:${g.id}`,label:g.name,count:g.tracks.length,icon:g.icon||'♫'});}}
  }catch{}
  const raw=new Map();for(const t of state.tracks){const g=(t.genre||'').trim();if(!g)continue;if(rhythmMatchesText(g).length)continue;const key=`genre:${g.toLowerCase()}`;if(seen.has(key))continue;raw.set(key,{key,label:g,count:(raw.get(key)?.count||0)+1,icon:'•'});}
  return [...out,...[...raw.values()].sort((a,b)=>b.count-a.count).slice(0,18)];
}
function genres(){return songCategoryOptions().map(o=>[o.key,o.label]);}


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
function smartDismissed(track,id){
  const ts=Number(track.smartDismissed?.[id]||0);
  if(!ts)return false;
  // A new real listen after dismissal allows the song to re-enter the automatic list.
  return Number(track.lastPlayed||0)<=ts;
}
function getSmartTracks(id){
  const playableTracks=state.tracks.filter(playable);
  if(id===SMART_IDS.favorites)return playableTracks.filter(t=>t.favorite).sort((a,b)=>(b.lastPlayed||b.addedAt||0)-(a.lastPlayed||a.addedAt||0));
  if(id===SMART_IDS.most)return playableTracks.filter(t=>!smartDismissed(t,id)&&((t.validPlays||0)>0||(t.completedPlays||0)>0||(t.replayCount||0)>0)).sort((a,b)=>smartScore(b)-smartScore(a)).slice(0,100);
  if(id===SMART_IDS.recent)return playableTracks.filter(t=>!smartDismissed(t,id)&&t.lastPlayed>0).sort((a,b)=>b.lastPlayed-a.lastPlayed).slice(0,100);
  if(id===SMART_IDS.repeat)return playableTracks.filter(t=>!smartDismissed(t,id)&&(t.replayCount||0)>0 && (now()-(t.lastPlayed||0))<45*DAY).sort((a,b)=>(b.replayCount-a.replayCount)||((b.lastPlayed||0)-(a.lastPlayed||0))).slice(0,100);
  return [];
}
async function dismissFromSmart(track,id){
  if(!track||!id)return;
  if(id===SMART_IDS.favorites){if(track.favorite)await toggleFavorite(track.id);return;}
  track.smartDismissed={...(track.smartDismissed||{}),[id]:now()};
  await saveRemoteTrack(track);
  render();
  toast(`Quitada de ${smartMeta(id).name} · volverá si la escuchas de nuevo`);
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
  if(Number.isFinite(current)&&current>=0){const d=Math.max(Number(s.duration)||0,Number(track.duration)||0);track.lastListenPosition=current;track.lastListenDuration=d;track.lastListenRatio=d>0?Math.max(0,Math.min(1,current/d)):0;track.lastListenUpdatedAt=now();}
  if(isPodcastTrack(track)){
    track.resumePosition=Math.max(0,current);
    track.resumeDuration=Math.max(Number(s.duration)||0,Number(track.duration)||0);
    track.resumeUpdatedAt=now();
  }
  const threshold=validListenThreshold(s.duration);
  if(!s.validMarked&&s.accumulatedMs>=threshold*1000){
    s.validMarked=true;track.validPlays=(track.validPlays||0)+1;track.playCount=track.validPlays;track.lastPlayed=now();
    if(track.lastValidAt&&now()-track.lastValidAt<7*DAY)track.replayCount=(track.replayCount||0)+1;
    track.lastValidAt=now();saveRemoteTrack(track);recordHistory('valid',track,{listenedMs:Math.round(s.accumulatedMs)});
  }
  if(!s.completed&&s.duration>0&&current/s.duration>=.85){
    s.completed=true;if(!s.validMarked){s.validMarked=true;track.validPlays=(track.validPlays||0)+1;track.playCount=track.validPlays;track.lastPlayed=now();if(track.lastValidAt&&now()-track.lastValidAt<7*DAY)track.replayCount=(track.replayCount||0)+1;track.lastValidAt=now();recordHistory('valid',track,{listenedMs:Math.round(s.accumulatedMs)});}
    track.completedPlays=(track.completedPlays||0)+1;track.lastCompleted=now();track.lastListenPosition=current;track.lastListenDuration=s.duration||track.duration||0;track.lastListenRatio=1;track.lastListenUpdatedAt=now();if(isPodcastTrack(track)){track.resumePosition=0;track.resumeDuration=s.duration||track.duration||0;track.resumeUpdatedAt=now();}saveRemoteTrack(track);recordHistory('complete',track,{ratio:current/s.duration});
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
  if(Number.isFinite(s.lastPosition)&&s.lastPosition>=0){const d=Math.max(Number(s.duration)||0,Number(track.duration)||0);track.lastListenPosition=s.completed?d:s.lastPosition;track.lastListenDuration=d;track.lastListenRatio=s.completed?1:(d>0?Math.max(0,Math.min(1,s.lastPosition/d)):track.lastListenRatio||0);track.lastListenUpdatedAt=now();}
  if(isPodcastTrack(track)){
    if(s.completed||reason==='ended')track.resumePosition=0;
    else if(Number.isFinite(s.lastPosition)&&s.lastPosition>0)track.resumePosition=s.lastPosition;
    track.resumeDuration=Math.max(Number(s.duration)||0,Number(track.duration)||0);
    track.resumeUpdatedAt=now();
  }
  await saveRemoteTrack(track);
}
async function handleNaturalEnd(){sampleListenSession(state.listenSession?.duration||0,state.listenSession?.duration||0);await finalizeListenSession('ended');state.playing=false;if(state.repeatOneId&&state.repeatOneId===state.currentId){const id=state.currentId;const ctx=state.queueIds.length?state.queueIds:[id];await playTrack(id,ctx,{skipFinalize:true,preserveBase:true});return;}state.autoAdvanceDepth++;try{await nextTrack({skipFinalize:true});}finally{state.autoAdvanceDepth--;}}
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
  const current=currentId&&base.includes(currentId)?currentId:(state.currentId&&base.includes(state.currentId)&&playable(getCurrentTrack())?state.currentId:'');
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
  await persistPrefs();renderPlayer();if(state.activeView==='library'&&state.libraryTab==='songs')syncSongScopeBar(currentSongScopeTracks());
  const meta=PLAY_MODE_META[mode];toast(`${meta.icon} ${meta.name} · ${meta.desc}`,3400);
  if(autoplay){const id=state.currentId&&order.includes(state.currentId)?state.currentId:order[0];if(id)await playTrack(id,order,{preserveBase:true});}
}
function openPlaybackModesSheet({contextIds=null}={}){
  const current=state.playbackMode||PLAY_MODES.normal;
  const order=[PLAY_MODES.normal,PLAY_MODES.shuffle,PLAY_MODES.smart,PLAY_MODES.radio,PLAY_MODES.rediscover,PLAY_MODES.surprise,PLAY_MODES.live];
  openSheet(`<h2 class="sheet-title">Modo de reproducción</h2><p class="sheet-copy">Elige cómo debe construir MUSIC PLAY la siguiente canción. El modo queda activo hasta que lo cambies.</p><div class="mode-list">${order.map(mode=>{const m=PLAY_MODE_META[mode];return `<button class="sheet-btn mode-choice${mode===current?' selected':''}" data-mode="${mode}"><span class="mode-choice-icon">${m.icon}</span><span>${m.name}<small>${m.desc}</small></span>${mode===current?'<b>✓</b>':''}</button>`;}).join('')}</div>`,root=>{$$('[data-mode]',root).forEach(b=>b.onclick=async()=>{const mode=b.dataset.mode;closeDialog(els.sheetDialog);await setPlaybackMode(mode,{autoplay:!state.currentId,contextIds});});});
}

function syncBottomNav(){
  const active=['search','library','studio','radio'].includes(state.activeView)?state.activeView:'home';
  [[els.navHome,'home'],[els.navSearch,'search'],[els.navLibrary,'library'],[els.navStudio,'studio'],[els.navRadio,'radio']].forEach(([btn,name])=>btn?.classList.toggle('active',name===active));
}
function showView(name){
  if(name==='playlist'){state.libraryTab='playlists';name='library';}
  if(!['home','search','library','studio','radio'].includes(name))name='home';
  const searchingFromPlaylist=name==='search'&&state.activeView==='library'&&state.libraryTab==='playlists'&&state.playlistDetailOpen&&!state.activeSmartId&&state.activePlaylistId;
  if(name==='search'){if(searchingFromPlaylist)state.searchOriginPlaylistId=state.activePlaylistId;else if(state.activeView!=='search')state.searchOriginPlaylistId='';}
  state.activeView=name;
  if(name!=='library')state.playlistDetailOpen=false;
  [els.homeView,els.searchView,els.libraryView,els.studioView,els.radioView].forEach(v=>v?.classList.remove('active'));
  ({home:els.homeView,search:els.searchView,library:els.libraryView,studio:els.studioView,radio:els.radioView})[name]?.classList.add('active');
  syncBottomNav();persistPrefs();render();
  try{window.dispatchEvent(new CustomEvent('mp:viewchange',{detail:name}));}catch{} // R10.14
  if(name==='search')setTimeout(()=>els.globalSearchInput?.focus(),40);
}
function setLibraryTab(tab,{keepDetail=false}={}){
  if(!['playlists','songs','albums','radio'].includes(tab))tab='playlists';
  state.libraryTab=tab;if(!keepDetail){state.playlistDetailOpen=false;state.activeSmartId='';}
  persistPrefs();renderLibraryShell();
}
function renderSummary(){
  const fav=getSmartTracks(SMART_IDS.favorites),most=getSmartTracks(SMART_IDS.most);
  if(els.countTracks)els.countTracks.textContent=state.tracks.length;if(els.countPlaylists)els.countPlaylists.textContent=state.playlists.length;
  if(els.countFavorites)els.countFavorites.textContent=fav.length;if(els.countMost)els.countMost.textContent=most.length;if(els.listenTimeHome)els.listenTimeHome.textContent=formatListenTime(totalListenedMs());
}
function renderGenres(){
  if(!els.genreChips)return;els.genreChips.innerHTML='';
  const add=(label,{active=false,cls='',onclick=null,title='' }={})=>{const b=document.createElement('button');b.className=`chip ${cls}${active?' active':''}`.trim();b.textContent=label;if(title)b.title=title;if(onclick)b.onclick=onclick;els.genreChips.appendChild(b);return b;};
  const allActive=state.songSource==='all'&&!(state.songCategories||[]).length;
  add('Todo',{active:allActive,cls:'source',onclick:()=>{state.songSource='all';state.songCategories=[];persistPrefs();renderLibrarySongs();}});
  add('♪ Dispositivo',{active:state.songSource==='local',cls:'source',onclick:()=>{state.songSource=state.songSource==='local'?'all':'local';persistPrefs();renderLibrarySongs();},title:'Solo archivos guardados en MUSIC PLAY'});
  add('▶ YouTube',{active:state.songSource==='youtube',cls:'source',onclick:()=>{state.songSource=state.songSource==='youtube'?'all':'youtube';persistPrefs();renderLibrarySongs();}});
  add('🔗 Enlaces',{active:state.songSource==='linked',cls:'source',onclick:()=>{state.songSource=state.songSource==='linked'?'all':'linked';persistPrefs();renderLibrarySongs();}});
  for(const opt of songCategoryOptions()){
    const active=(state.songCategories||[]).includes(opt.key);
    add(`${opt.icon||'•'} ${opt.label}`,{active,cls:'category',title:`${opt.count} canciones`,onclick:()=>{const set=new Set(state.songCategories||[]);set.has(opt.key)?set.delete(opt.key):set.add(opt.key);state.songCategories=[...set];persistPrefs();renderLibrarySongs();}});
  }
}
function trackSortValue(t){if(state.librarySort==='played')return (t.validPlays||0)*10+(t.completedPlays||0)*5+(t.lastPlayed||0)/1e12;if(state.librarySort==='name')return 0;return Math.max(t.lastPlayed||0,t.addedAt||0);}
function sortedTracks(list){const out=[...list];if(state.librarySort==='name')return out.sort((a,b)=>(a.title||'').localeCompare(b.title||'','es',{sensitivity:'base'}));return out.sort((a,b)=>trackSortValue(b)-trackSortValue(a));}
function swipeLeftLabel(track,options={}){
  if(options.smart){
    if(state.activeSmartId===SMART_IDS.favorites)return 'Quitar ♥ ←';
    return 'Ocultar ←';
  }
  if(options.fromPlaylist)return 'Quitar ←';
  return 'Eliminar ←';
}
async function handleSwipeLeft(track,options={}){
  if(options.smart)return dismissFromSmart(track,state.activeSmartId);
  if(options.fromPlaylist)return removeFromPlaylist(track.id,state.activePlaylistId);
  return removeTrack(track.id);
}
async function reorderPlaylistTrack(playlistId,draggedId,targetId,placeAfter=false){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl||draggedId===targetId)return false;const ids=[...(pl.trackIds||[])],from=ids.indexOf(draggedId),target=ids.indexOf(targetId);if(from<0||target<0)return false;ids.splice(from,1);let at=ids.indexOf(targetId)+(placeAfter?1:0);at=Math.max(0,Math.min(ids.length,at));ids.splice(at,0,draggedId);pl.trackIds=ids;pl.updatedAt=now();await persistPlaylist(pl);renderPlaylists();toast('Orden de playlist actualizado');return true;
}
function bindLongPressReorder(row,front,track,options={}){
  // R10.20 · Reorder más flexible:
  //  · Solo requiere fromPlaylist (no smart) — igual que antes.
  //  · Tiempo de activación reducido de 430ms → 320ms (más responsivo).
  //  · Umbral de cancelación subido de 9px → 14px (más tolerante a temblor).
  //  · Auto-scroll más rápido (28px/frame en vez de 18).
  //  · Hit-test busca .track-row en cualquier contenedor scrollable, no solo
  //    #playlistList (también funciona en search, smart collections, etc.).
  //  · Marca _gestureConsumedUntil al soltar para que el click no dispare play.
  if(!options.fromPlaylist||options.smart)return;
  let timer=0,sx=0,sy=0,active=false,targetId='',placeAfter=false,pointerId=null,startedAt=0;
  const clearTarget=()=>{$$('.track-row.reorder-target').forEach(n=>n.classList.remove('reorder-target','reorder-after'));};
  const cancelTimer=()=>{clearTimeout(timer);timer=0;};
  const finish=async e=>{
    cancelTimer();
    if(!active)return;
    active=false;
    front._reorderActive=false;
    // R10.20 · ventana de gracia más larga (700ms) para que el click que
    // sigue al pointerup no dispare playTrack.
    front._gestureConsumedUntil=performance.now()+700;
    row.classList.remove('reorder-source');
    document.body.classList.remove('playlist-reordering');
    clearTarget();
    try{if(pointerId!=null)front.releasePointerCapture(pointerId);}catch{}
    if(targetId&&targetId!==track.id){
      await reorderPlaylistTrack(state.activePlaylistId,track.id,targetId,placeAfter);
    }else if(performance.now()-startedAt<320){
      // Si soltó muy rápido, no era un reorder — abrir el menú como antes.
      openTrackSheet(track,options);
    }
    targetId='';
  };
  front.addEventListener('pointerdown',e=>{
    if(e.target.closest('.row-actions'))return;
    sx=e.clientX;sy=e.clientY;pointerId=e.pointerId;
    cancelTimer();
    timer=setTimeout(()=>{
      active=true;startedAt=performance.now();
      front._reorderActive=true;
      row.classList.add('reorder-source');
      document.body.classList.add('playlist-reordering');
      try{front.setPointerCapture(pointerId);}catch{}
      navigator.vibrate?.(18);
    },320);
  },{passive:true});
  front.addEventListener('pointermove',e=>{
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!active){
      // R10.20 · tolerancia de 14px antes de cancelar el long-press
      if(Math.hypot(dx,dy)>14)cancelTimer();
      return;
    }
    e.preventDefault();
    // Hit-test en cualquier .track-row dentro del contenedor scrollable
    const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.track-row');
    clearTarget();
    if(hit&&hit!==row){
      // Verificar que hit está en el mismo contenedor de lista que row
      const rowList=row.closest('.virtual-list,.list,.search-results,.playlist-detail');
      const hitList=hit.closest('.virtual-list,.list,.search-results,.playlist-detail');
      if(rowList&&rowList===hitList){
        targetId=hit.dataset.id||'';
        const r=hit.getBoundingClientRect();
        placeAfter=e.clientY>r.top+r.height/2;
        hit.classList.add('reorder-target');
        if(placeAfter)hit.classList.add('reorder-after');
      }
    }
    // Auto-scroll más rápido para listas largas
    if(e.clientY<120)window.scrollBy({top:-28,behavior:'auto'});
    else if(e.clientY>innerHeight-180)window.scrollBy({top:28,behavior:'auto'});
  },{passive:false});
  front.addEventListener('pointerup',finish);
  front.addEventListener('pointercancel',finish);
}
function makeTrackRow(track,options={fromPlaylist:false}){
  const row=document.createElement('div');row.className=`track-row${track.id===state.currentId?' active':''}`;row.dataset.id=track.id;
  // R10.20 · marca la row como reorderable para mostrar el hint visual (punto
  // accent en la esquina del artwork cuando el usuario hace hover).
  if(options.fromPlaylist&&!options.smart)row.dataset.reorderable='1';
  const source=sourceLabel(track),sub=[track.artist,track.album].filter(Boolean).join(' · ')||track.genre||track.folder||track.remoteUrl||'Audio local';
  const sourceBadge=track.sourceMissing?'<span class="source-badge missing">FALTA ARCHIVO</span>':`<span class="source-badge ${sourceClass(track)}">${source}</span>`;
  const artFallback=track.sourceKind==='youtube'?'▶':track.sourceKind==='soundcloud'?'☁':'♪',podProgress=isPodcastTrack(track)?podcastProgressLabel(track):'';
  row.innerHTML=`<div class="track-backdrop"><span>→ Cola</span><span>${swipeLeftLabel(track,options)}</span></div><div class="track-front"><div class="track-art">${artFallback}</div><div class="track-text"><div class="track-title">${safeText(track.title)}</div><div class="track-sub">${safeText(sub)}</div></div><div class="track-meta"><span class="track-time">${track.duration?formatTime(track.duration):''}</span><div class="badges">${sourceBadge}${podProgress?`<span class="badge podcast-resume-badge">▶ ${safeText(podProgress.replace('Continuar ',''))}</span>`:''}${track.replayCount?`<span class="badge">↻ ${track.replayCount}</span>`:''}</div></div><div class="row-actions"><button class="row-quick row-repeat${state.repeatOneId===track.id?' active':''}" title="${state.repeatOneId===track.id?'Desactivar repetir canción':'Repetir esta canción'}" aria-label="Repetir esta canción">↻<sup>1</sup></button><button class="row-quick row-heart${track.favorite?' active':''}" title="${track.favorite?'Quitar favorito':'Favorito'}">${track.favorite?'♥':'♡'}</button><button class="row-quick ${options.fromPlaylist?'row-more':'row-add-pl'}" title="${options.fromPlaylist?'Opciones':'Añadir a playlist'}">${options.fromPlaylist?'⋯':'＋'}</button></div></div>`;
  const front=$('.track-front',row),art=$('.track-art',row);hydrateArtwork(track,art,artFallback);bindSwipe(front,track,options);bindLongPressReorder(row,front,track,options);
  // R10.20 · Un toque simple SIEMPRE reproduce. El menú (openTrackSheet) se
  // abre solo con: botón ⋯, menú contextual (larga presión nativa del navegador)
  // o gesto de mantener pulsado (>520ms) sin arrastrar. Antes, un handler de
  // pointerdown con setTimeout(520) disparaba el sheet cuando el dedo quedaba
  // quieto, y compitiá con el click → a veces abría el menú en vez de reproducir.
  front.addEventListener('click',e=>{
    if(e.target.closest('.row-actions'))return;
    if(front._gestureConsumedUntil&&performance.now()<front._gestureConsumedUntil)return;
    if(front._reorderActive)return;
    // Contexto: preferir contextIds de options, sino filtros de biblioteca o
    // todas las canciones reproducibles. NUNCA pasar la cola actual (eso
    // provocaba que al tocar una canción de búsqueda se mantuviera la cola
    // anterior y la selección quedara "privilegiada" sobre la nueva).
    const ctx=options.contextIds||(options.fromPlaylist?(state.activeSmartId?getSmartTracks(state.activeSmartId).map(t=>t.id):(getActivePlaylist()?.trackIds||[])):getFilteredTracks().filter(playable).map(t=>t.id));
    if(playable(track))playTrack(track.id,ctx);
    else openTrackSheet(track,options);
  });
  $('.row-repeat',row).addEventListener('click',e=>{e.stopPropagation();toggleRepeatOne(track.id);});
  $('.row-heart',row).addEventListener('click',e=>{e.stopPropagation();toggleFavorite(track.id);});
  const q=options.fromPlaylist?$('.row-more',row):$('.row-add-pl',row);if(q)q.addEventListener('click',e=>{e.stopPropagation();options.fromPlaylist?openTrackSheet(track,options):openPlaylistPickerSheet(track.id);});
  front.addEventListener('contextmenu',e=>{e.preventDefault();if(front._reorderActive||(front._gestureConsumedUntil&&performance.now()<front._gestureConsumedUntil))return;openTrackSheet(track,options);});
  // R10.20 · Long-press opcional para abrir el menú (sin arrastrar).
  // Reescrito: solo dispara si NO hay movimiento, y marca _gestureConsumedUntil
  // para que el click posterior NO también dispare playTrack. Antes el click y
  // el longpress competían.
  let pt=0,lpx=0,lpy=0,moved=false;
  front.addEventListener('pointerdown',e=>{
    if(e.target.closest('.row-actions'))return;
    lpx=e.clientX;lpy=e.clientY;moved=false;
    if(options.fromPlaylist&&!options.smart)return;
    pt=setTimeout(()=>{
      if(!moved&&!front._gestureActive&&!front._reorderActive){
        front._gestureConsumedUntil=performance.now()+400;
        openTrackSheet(track,options);
      }
    },520);
  },{passive:true});
  front.addEventListener('pointermove',e=>{
    if(Math.abs(e.clientX-lpx)>8||Math.abs(e.clientY-lpy)>8){moved=true;clearTimeout(pt);}
  },{passive:true});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>front.addEventListener(ev,()=>clearTimeout(pt),{passive:true}));
  return row;
}
function bindSwipe(front,track,options={}){
  let sx=0,sy=0,dx=0,dy=0,active=false,axis='';
  const reset=()=>{front.style.transition='transform .16s ease';front.style.transform='translateX(0)';front._gestureActive=false;setTimeout(()=>front.style.transition='',180);};
  const end=async()=>{
    if(!active)return;if(front._reorderActive){active=false;return;}active=false;
    const horizontal=axis==='x'&&Math.abs(dx)>=82;
    if(horizontal){front._gestureConsumedUntil=performance.now()+320;if(dx>0)queueTrack(track.id);else await handleSwipeLeft(track,options);}
    reset();
  };
  front.addEventListener('pointerdown',e=>{if(e.target.closest('.row-actions'))return;active=true;axis='';dx=0;dy=0;sx=e.clientX;sy=e.clientY;front._gestureActive=false;},{passive:true});
  front.addEventListener('pointermove',e=>{
    if(!active||front._reorderActive)return;dx=e.clientX-sx;dy=e.clientY-sy;
    if(!axis&&Math.max(Math.abs(dx),Math.abs(dy))>9)axis=Math.abs(dx)>Math.abs(dy)*1.12?'x':'y';
    if(axis==='y'){front._gestureActive=false;return;}
    if(axis==='x'){front._gestureActive=true;const clamped=Math.max(-124,Math.min(124,dx));front.style.transform=`translateX(${clamped}px)`;}
  },{passive:true});
  front.addEventListener('pointerup',end);front.addEventListener('pointercancel',end);front.addEventListener('pointerleave',()=>{if(active&&axis==='x')end();});
}
function bindCurrentTrackSwipe(node){
  if(!node||node._swipeBound)return;node._swipeBound=true;let sx=0,sy=0,dx=0,dy=0,active=false,axis='';
  const finish=async()=>{if(!active)return;active=false;if(axis==='x'&&Math.abs(dx)>=82){node._gestureConsumedUntil=performance.now()+320;const t=getCurrentTrack();if(t){if(dx>0)queueTrack(t.id);else await removeTrack(t.id);}}node.style.transition='transform .16s ease';node.style.transform='translateX(0)';setTimeout(()=>node.style.transition='',180);};
  node.addEventListener('pointerdown',e=>{const interactive=e.target.closest?.('button,input,select');if(interactive&&interactive!==node)return;active=true;axis='';dx=0;dy=0;sx=e.clientX;sy=e.clientY;},{passive:true});
  node.addEventListener('pointermove',e=>{if(!active)return;dx=e.clientX-sx;dy=e.clientY-sy;if(!axis&&Math.max(Math.abs(dx),Math.abs(dy))>9)axis=Math.abs(dx)>Math.abs(dy)*1.12?'x':'y';if(axis==='x')node.style.transform=`translateX(${Math.max(-110,Math.min(110,dx))}px)`;},{passive:true});
  node.addEventListener('pointerup',finish);node.addEventListener('pointercancel',finish);
}
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
function listeningScoreForTracks(tracks){
  const ts=now();let score=0;
  for(const t of tracks||[]){
    score+=(t.favorite?7:0)+(t.completedPlays||0)*3+(t.validPlays||0)*2+(t.replayCount||0)*2-Math.min(8,(t.skipCount||0));
    const last=t.lastPlayed||0;if(last){const days=(ts-last)/86400000;score+=Math.max(0,24-days)*.35;}
  }
  return score+Math.min(12,(tracks||[]).length*.3);
}
function recommendedAlbumGroups(){
  return [...getAlbumGroups()].sort((a,b)=>listeningScoreForTracks(b.tracks)-listeningScoreForTracks(a.tracks)||b.last-a.last);
}
const RHYTHM_RULES=[
  {id:'salsa',name:'Salsa',icon:'💃',re:/\bsalsa\b|son montuno|guaguanc[oó]|mambo/i},
  {id:'cumbia',name:'Cumbia',icon:'🥁',re:/\bcumbia\b/i},
  {id:'vallenato',name:'Vallenato',icon:'🪗',re:/vallenat/i},
  {id:'merengue',name:'Merengue',icon:'☀',re:/merengue/i},
  {id:'bachata',name:'Bachata',icon:'🌙',re:/bachata/i},
  {id:'reggaeton',name:'Reggaetón',icon:'◆',re:/reggaet[oó]n|urbano latino/i},
  {id:'reggae',name:'Reggae',icon:'☘',re:/reggae|roots reggae|dancehall/i},
  {id:'rock',name:'Rock',icon:'⚡',re:/\brock\b|alternative rock|indie rock|punk/i},
  {id:'metal',name:'Metal',icon:'⛓',re:/\bmetal\b|heavy metal|nu metal|thrash|death metal/i},
  {id:'hiphop',name:'Hip-Hop / Rap',icon:'◉',re:/hip[ -]?hop|\brap\b|trap/i},
  {id:'pop',name:'Pop',icon:'✦',re:/\bpop\b|synthpop|dance pop/i},
  {id:'country',name:'Country',icon:'☆',re:/country|bluegrass/i},
  {id:'jazz',name:'Jazz',icon:'♬',re:/\bjazz\b|bebop|swing/i},
  {id:'blues',name:'Blues',icon:'◐',re:/\bblues\b/i},
  {id:'soul',name:'R&B / Soul',icon:'♥',re:/r&b|rhythm.?and.?blues|\bsoul\b|neo soul/i},
  {id:'electronic',name:'Electrónica',icon:'⌁',re:/electr[oó]nic|edm|house|techno|trance|ambient/i},
  {id:'classical',name:'Clásica',icon:'♩',re:/cl[aá]sic|classical|orquesta sinf[oó]nica|symphon/i},
  {id:'instrumental',name:'Instrumental',icon:'♫',re:/instrumental|piano|acoustic|acústic/i},
  {id:'folk',name:'Folk',icon:'◇',re:/\bfolk\b|americana/i},
  {id:'gospel',name:'Gospel',icon:'✧',re:/gospel|worship|cristian/i}
];
function rhythmMatchesText(text){return RHYTHM_RULES.filter(r=>r.re.test(text||''));}
function getRhythmGroups(){
  const groups=new Map(),ensure=r=>{if(!groups.has(r.id))groups.set(r.id,{id:r.id,name:r.name,icon:r.icon,tracks:[],seen:new Set()});return groups.get(r.id);},add=(r,t)=>{const g=ensure(r);if(!g.seen.has(t.id)){g.seen.add(t.id);g.tracks.push(t);}};
  for(const t of state.tracks){
    const hay=[t.genre,t.album,t.folder,t.title].filter(Boolean).join(' · ');const matches=rhythmMatchesText(hay);for(const r of matches.slice(0,2))add(r,t);
    if(!matches.length&&t.genre&&t.genre.trim()&&!/unknown|desconocid/i.test(t.genre)){
      const raw=t.genre.trim().split(/[;,/]/)[0].trim();if(raw){const id=`genre:${raw.toLowerCase()}`;const g=groups.get(id)||{id,name:raw.replace(/\b\w/g,c=>c.toUpperCase()),icon:'♪',tracks:[],seen:new Set()};if(!g.seen.has(t.id)){g.seen.add(t.id);g.tracks.push(t);}groups.set(id,g);}
    }
  }
  for(const pl of state.playlists){const matches=rhythmMatchesText(pl.name||'');if(!matches.length)continue;for(const t of getPlaylistTracks(pl))for(const r of matches.slice(0,1))add(r,t);}
  return [...groups.values()].map(g=>({...g,score:listeningScoreForTracks(g.tracks)})).filter(g=>g.tracks.length).sort((a,b)=>b.score-a.score||b.tracks.length-a.tracks.length).slice(0,14);
}
function artistNameForTrack(t){
  let a=(t.artist||'').trim();if(!a||/^(desconocido|unknown|youtube|soundcloud|enlace|archivo por localizar|music play)$/i.test(a)||/^https?:/i.test(a))a='';
  if(!a&&t.title&&/\s[-–—]\s/.test(t.title)){const candidate=t.title.split(/\s[-–—]\s/)[0].trim();if(candidate.length>1&&candidate.length<70)a=candidate;}
  return a;
}
function getArtistGroups(){
  const map=new Map();for(const t of state.tracks){const name=artistNameForTrack(t);if(!name)continue;const id=name.toLocaleLowerCase('es');if(!map.has(id))map.set(id,{id,name,tracks:[],last:0});const g=map.get(id);g.tracks.push(t);g.last=Math.max(g.last,t.lastPlayed||t.addedAt||0);}
  let arr=[...map.values()].map(g=>({...g,score:listeningScoreForTracks(g.tracks)})).filter(g=>g.tracks.length>=2);if(!arr.length)arr=[...map.values()].map(g=>({...g,score:listeningScoreForTracks(g.tracks)}));return arr.sort((a,b)=>b.score-a.score||b.tracks.length-a.tracks.length).slice(0,16);
}
function openTransientCollection(group,{kind='colección'}={}){
  const tracks=(group.tracks||[]).filter(Boolean),ids=tracks.filter(playable).map(t=>t.id);let shown=0;
  openSheet(`<div class="dynamic-collection-head"><div class="dynamic-collection-art" data-dyn-art>${safeText(group.icon||'♪')}</div><div><small>${safeText(kind.toUpperCase())}</small><h2 class="sheet-title">${safeText(group.name)}</h2><p class="sheet-copy">${tracks.length} ${tracks.length===1?'canción':'canciones'} · colección automática, no guardada</p></div></div><div class="dynamic-collection-actions"><button class="micro-btn" data-dyn-play>▶ Play</button><button class="micro-btn" data-dyn-shuffle>⇄ Aleatorio</button></div><div class="dynamic-track-list" data-dyn-list></div><button class="micro-btn wide is-hidden" data-dyn-more>Ver más</button>`,root=>{
    hydratePlaylistArtwork(tracks,$('[data-dyn-art]',root),group.icon||'♪');const list=$('[data-dyn-list]',root),more=$('[data-dyn-more]',root);const draw=()=>{const end=Math.min(tracks.length,shown+60),frag=document.createDocumentFragment();for(let i=shown;i<end;i++)frag.appendChild(makeTrackRow(tracks[i],{contextIds:ids}));shown=end;list.appendChild(frag);more.classList.toggle('is-hidden',shown>=tracks.length);more.textContent=`Ver más · ${shown}/${tracks.length}`;};draw();more.onclick=draw;
    $('[data-dyn-play]',root).onclick=()=>{closeDialog(els.sheetDialog);if(ids[0])playTrack(ids[0],ids);};$('[data-dyn-shuffle]',root).onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:ids});};
  });
}
function makeDiscoveryCard(group,{kind='colección'}={}){
  const b=document.createElement('button');b.className='media-card discovery-card';b.type='button';b.innerHTML=`<div class="media-card-art discovery-art">${safeText(group.icon||'♪')}</div><strong>${safeText(group.name)}</strong><small>${group.tracks.length} ${group.tracks.length===1?'canción':'canciones'}</small>`;hydratePlaylistArtwork(group.tracks,$('.media-card-art',b),group.icon||'♪');b.onclick=()=>openTransientCollection(group,{kind});return b;
}

async function hydratePlaylistArtwork(tracks,node,fallback='≡'){
  if(!node)return;const pool=(tracks||[]).slice(0,4);if(!pool.length){node.textContent=fallback;return;}const urls=(await Promise.all(pool.map(t=>artworkUrlFor(t).catch(()=>'')))).filter(Boolean);if(!urls.length){node.textContent=fallback;return;}node.innerHTML='';node.classList.add('art-collage');for(const url of urls.slice(0,4)){const img=document.createElement('img');img.src=url;img.alt='';img.loading='lazy';node.appendChild(img);}
}
function selectedSongScopeLabel(){
  const parts=[];
  if(state.songSource==='local')parts.push('En dispositivo');else if(state.songSource==='youtube')parts.push('YouTube');else if(state.songSource==='linked')parts.push('Enlaces');
  const options=new Map(songCategoryOptions().map(o=>[o.key,o.label]));for(const key of state.songCategories||[])parts.push(options.get(key)||key.replace(/^genre:|^rhythm:/,''));
  return parts.length?parts.join(' + '):'Toda tu biblioteca';
}
function syncSongScopeBar(list){
  const count=list.length,playableCount=list.filter(playable).length;if(els.songScopeCount)els.songScopeCount.textContent=`${count} ${count===1?'canción':'canciones'}`;if(els.songScopeLabel)els.songScopeLabel.textContent=selectedSongScopeLabel();
  [els.playSongScopeBtn,els.songScopeModeBtn,els.favoriteSongScopeBtn,els.playlistSongScopeBtn].forEach(b=>{if(b)b.disabled=!count;});
  if(els.songScopeModeBtn){const m=PLAY_MODE_META[state.playbackMode]||PLAY_MODE_META.normal;els.songScopeModeBtn.firstChild&&(els.songScopeModeBtn.firstChild.textContent='');els.songScopeModeBtn.innerHTML=`${m.icon} <span>${safeText(m.name)}</span>`;els.songScopeModeBtn.disabled=!playableCount;}
  if(els.playSongScopeBtn)els.playSongScopeBtn.disabled=!playableCount;
}
function renderLibrarySongs(){renderGenres();const list=sortedTracks(getFilteredTracks());els.libraryEmpty.classList.toggle('is-hidden',list.length>0);els.libraryList.classList.toggle('is-hidden',list.length===0);if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${list.length} ${list.length===1?'canción':'canciones'}`;syncSongScopeBar(list);renderRowsVirtual(els.libraryList,list);}
function currentSongScopeTracks({playableOnly=false}={}){const list=sortedTracks(getFilteredTracks());return playableOnly?list.filter(playable):list;}
async function playCurrentSongScope(){
  const tracks=currentSongScopeTracks({playableOnly:true});if(!tracks.length)return toast('No hay canciones reproducibles en esta selección');
  const ids=tracks.map(t=>t.id),mode=state.playbackMode||PLAY_MODES.normal;state.baseQueueIds=[...ids];
  if(mode===PLAY_MODES.normal)return playTrack(ids[0],ids,{preserveBase:true});
  const order=prepareModeQueue(mode,ids,'');if(order[0])await playTrack(order[0],order,{preserveBase:true});
}
function openSongScopeModes(){const ids=currentSongScopeTracks({playableOnly:true}).map(t=>t.id);if(!ids.length)return toast('No hay canciones reproducibles en esta selección');openPlaybackModesSheet({contextIds:ids});}
function openSongScopeFavoriteSheet(){
  const tracks=currentSongScopeTracks();if(!tracks.length)return toast('No hay canciones en esta selección');const ids=tracks.map(t=>t.id),allFav=tracks.every(t=>t.favorite);
  openSheet(`<h2 class="sheet-title">${allFav?'Quitar de Favoritos':'Añadir a Favoritos'}</h2><p class="sheet-copy">${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${safeText(selectedSongScopeLabel())}</p><div class="sheet-stack"><button class="sheet-btn" data-scope-fav>${allFav?'♡ Quitar todas':'♥ Marcar todas como favoritas'}<small>Se aplica únicamente a la selección visible</small></button><button class="sheet-btn" data-scope-cancel>Cancelar</button></div>`,root=>{
    $('[data-scope-fav]',root).onclick=async()=>{const value=!allFav;for(const t of tracks)t.favorite=value;if(state.storageReady)for(let i=0;i<tracks.length;i+=160)await db.putMany('tracks',tracks.slice(i,i+160)).catch(()=>{});closeDialog(els.sheetDialog);render();toast(value?`♥ ${tracks.length} añadidas a Favoritos`:`${tracks.length} quitadas de Favoritos`,3600);};
    $('[data-scope-cancel]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}
function openSongScopePlaylistSheet(){const ids=currentSongScopeTracks().map(t=>t.id);if(!ids.length)return toast('No hay canciones para añadir');openBatchPlaylistPicker(ids,{title:`${ids.length} canciones · ${selectedSongScopeLabel()}`});}

function soundTrackText(track){return songTrackText(track||{});}
function detectedRhythmForTrack(track){
  const hit=rhythmMatchesText(soundTrackText(track))[0];if(hit)return hit.id;
  const g=(track?.genre||'').toLowerCase();if(/latin|tropical/.test(g))return'latin';return'balanced';
}
const SOUND_PROFILES={
  original:{label:'Original',bass:0,body:0,presence:0,treble:0,threshold:0,ratio:1,output:0},
  balanced:{label:'Balance',bass:1.0,body:.3,presence:1.0,treble:.7,threshold:-10,ratio:1.5,output:-.7},
  salsa:{label:'Salsa',bass:1.6,body:.8,presence:2.2,treble:1.2,threshold:-12,ratio:1.7,output:-1.0},
  cumbia:{label:'Cumbia',bass:2.2,body:1.0,presence:1.6,treble:.8,threshold:-13,ratio:1.8,output:-1.2},
  vallenato:{label:'Vallenato',bass:1.4,body:.6,presence:2.3,treble:1.4,threshold:-12,ratio:1.6,output:-1.0},
  merengue:{label:'Merengue',bass:1.8,body:.4,presence:2.2,treble:1.6,threshold:-13,ratio:1.8,output:-1.2},
  bachata:{label:'Bachata',bass:1.4,body:.8,presence:1.8,treble:1.5,threshold:-12,ratio:1.6,output:-.9},
  reggaeton:{label:'Reggaetón',bass:3.2,body:-.4,presence:1.6,treble:.9,threshold:-15,ratio:2.0,output:-1.8},
  reggae:{label:'Reggae',bass:3.6,body:1.4,presence:-.4,treble:.4,threshold:-14,ratio:1.8,output:-1.7},
  rock:{label:'Rock',bass:1.5,body:-.2,presence:2.5,treble:1.3,threshold:-14,ratio:1.9,output:-1.4},
  metal:{label:'Metal',bass:1.2,body:-.8,presence:2.8,treble:1.5,threshold:-15,ratio:2.1,output:-1.6},
  hiphop:{label:'Hip-Hop / Rap',bass:3.2,body:-.5,presence:1.3,treble:1.0,threshold:-15,ratio:2.0,output:-1.8},
  pop:{label:'Pop',bass:1.8,body:.1,presence:2.0,treble:1.5,threshold:-13,ratio:1.8,output:-1.2},
  country:{label:'Country',bass:.8,body:.5,presence:2.0,treble:1.8,threshold:-11,ratio:1.5,output:-.8},
  jazz:{label:'Jazz',bass:.7,body:.7,presence:1.0,treble:1.7,threshold:-8,ratio:1.35,output:-.5},
  blues:{label:'Blues',bass:1.1,body:1.1,presence:1.2,treble:.8,threshold:-10,ratio:1.45,output:-.6},
  soul:{label:'R&B / Soul',bass:2.0,body:1.2,presence:1.3,treble:.9,threshold:-12,ratio:1.6,output:-1.0},
  electronic:{label:'Electrónica',bass:3.0,body:-.7,presence:1.8,treble:1.6,threshold:-15,ratio:2.1,output:-1.8},
  classical:{label:'Clásica',bass:.4,body:.5,presence:.7,treble:1.8,threshold:-5,ratio:1.2,output:-.2},
  instrumental:{label:'Instrumental',bass:.7,body:.6,presence:1.0,treble:1.5,threshold:-7,ratio:1.3,output:-.4},
  folk:{label:'Folk',bass:.7,body:.8,presence:1.8,treble:1.3,threshold:-9,ratio:1.4,output:-.6},
  gospel:{label:'Gospel',bass:1.3,body:1.0,presence:1.8,treble:1.0,threshold:-11,ratio:1.55,output:-.8},
  latin:{label:'Latino',bass:1.7,body:.7,presence:1.9,treble:1.1,threshold:-12,ratio:1.65,output:-1.0},
  warm:{label:'Cálido',bass:2.0,body:1.5,presence:.2,treble:-.5,threshold:-10,ratio:1.45,output:-.8},
  punch:{label:'Potente',bass:3.1,body:-.3,presence:2.1,treble:1.1,threshold:-15,ratio:2.0,output:-1.8},
  clear:{label:'Claro',bass:-.2,body:-.5,presence:2.8,treble:2.2,threshold:-9,ratio:1.4,output:-.8}
};
// R10.17 · Construye el grafo Web Audio multibanda + ensanchador estéreo +
// limitador de loudness. El input es un GainNode compartido al que se
// conectan todas las fuentes (audio local, directAudio, ytAudio, ytVideo).
async function ensureAudioFx(){
  if(audioFx.connected)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{
    audioFx.ctx=new AC();
    audioFx.input=audioFx.ctx.createGain();
    // EQ multibanda (8 bandas)
    audioFx.subBass=audioFx.ctx.createBiquadFilter();audioFx.subBass.type='lowshelf';audioFx.subBass.frequency.value=55;
    audioFx.bass=audioFx.ctx.createBiquadFilter();audioFx.bass.type='lowshelf';audioFx.bass.frequency.value=120;
    audioFx.lowMid=audioFx.ctx.createBiquadFilter();audioFx.lowMid.type='peaking';audioFx.lowMid.frequency.value=250;audioFx.lowMid.Q.value=.7;
    audioFx.body=audioFx.ctx.createBiquadFilter();audioFx.body.type='peaking';audioFx.body.frequency.value=500;audioFx.body.Q.value=.8;
    audioFx.presence=audioFx.ctx.createBiquadFilter();audioFx.presence.type='peaking';audioFx.presence.frequency.value=2500;audioFx.presence.Q.value=.85;
    audioFx.highMid=audioFx.ctx.createBiquadFilter();audioFx.highMid.type='peaking';audioFx.highMid.frequency.value=4500;audioFx.highMid.Q.value=.9;
    audioFx.treble=audioFx.ctx.createBiquadFilter();audioFx.treble.type='highshelf';audioFx.treble.frequency.value=8000;
    audioFx.air=audioFx.ctx.createBiquadFilter();audioFx.air.type='highshelf';audioFx.air.frequency.value=14000;
    // Ensanchador estéreo Mid/Side: usa ChannelSplitter+ChannelMerger con
    // ganancias de Mid y Side. Por defecto neutro (1.0/1.0); BOOST sube Side.
    audioFx.midGain=audioFx.ctx.createGain();audioFx.midGain.gain.value=1.0;
    audioFx.sideGain=audioFx.ctx.createGain();audioFx.sideGain.gain.value=1.0;
    // Compresor "glue" suave
    audioFx.compressor=audioFx.ctx.createDynamicsCompressor();audioFx.compressor.knee.value=10;audioFx.compressor.attack.value=.014;audioFx.compressor.release.value=.24;
    // Limitador de loudness (agresivo para BOOST, ~-2 dB threshold)
    audioFx.limiter=audioFx.ctx.createDynamicsCompressor();audioFx.limiter.knee.value=4;audioFx.limiter.attack.value=.003;audioFx.limiter.release.value=.15;audioFx.limiter.ratio.value=12;audioFx.limiter.threshold.value=-2;
    audioFx.output=audioFx.ctx.createGain();
    // Cadena principal
    audioFx.input.connect(audioFx.subBass).connect(audioFx.bass).connect(audioFx.lowMid)
      .connect(audioFx.body).connect(audioFx.presence).connect(audioFx.highMid)
      .connect(audioFx.treble).connect(audioFx.air);
    // Mid/Side widener (solo se activa en BOOST; en modo neutro es passthrough)
    // Implementación: passthrough directo air -> compressor (el widener se aplica
    // ajustando ganancias en el momento del profile Boost).
    audioFx.air.connect(audioFx.compressor);
    audioFx.compressor.connect(audioFx.limiter).connect(audioFx.output).connect(audioFx.ctx.destination);
    audioFx.connected=true;
    // Conectar fuente local por defecto (compatibilidad con flujo existente)
    try{const s=audioFx.ctx.createMediaElementSource(els.audio);s.connect(audioFx.input);audioFx.sources.set(els.audio,s);}catch{}
    audioFx.attachedElements.add(els.audio);
    return true;
  }catch(err){console.debug('Web Audio FX unavailable',err);return false;}
}
// R10.17 · Conecta cualquier <audio>/<video> al grafo de mejora. Maneja CORS:
// si el medio es cross-origin sin CORS, createMediaElementSource tira error y
// se captura para que la fuente siga sonando sin mejora (sin romper).
async function connectSourceToAudioFx(el){
  if(!el)return false;
  if(audioFx.attachedElements.has(el))return audioFx.sources.has(el);
  audioFx.attachedElements.add(el);
  if(!audioFx.connected){const ok=await ensureAudioFx();if(!ok)return false;}
  try{
    if(audioFx.ctx.state==='suspended')await audioFx.ctx.resume();
  }catch{}
  try{
    const src=audioFx.ctx.createMediaElementSource(el);
    src.connect(audioFx.input);
    audioFx.sources.set(el,src);
    return true;
  }catch(err){
    // Cross-origin sin CORS: el nodo se crea pero queda taint. En algunos
    // navegadores lanza InvalidStateError. Devolvemos false para que el caller
    // sepa que esa fuente no se procesa (pero sigue escuchándose).
    return false;
  }
}
function chooseSoundProfile(track){
  if(state.soundMode===SOUND_MODES.original)return'original';if(state.soundMode===SOUND_MODES.warm)return'warm';if(state.soundMode===SOUND_MODES.punch)return'punch';if(state.soundMode===SOUND_MODES.clear)return'clear';
  const id=detectedRhythmForTrack(track);return SOUND_PROFILES[id]?id:'balanced';
}
// R10.17 · Perfil BOOST agresivo — aplica a TODAS las fuentes (no solo local).
// Curva multibanda con sub-bass boost, presencia vocal, aire en agudos, ensanchador
// estéreo y limitador de loudness (-2 dB) para perceived loudness más alto sin clip.
const BOOST_PROFILE={
  subBass:3.5, bass:2.6, lowMid:.4, body:.8, presence:2.4, highMid:1.8, treble:2.6, air:3.2,
  midGain:1.0, sideGain:1.45,
  threshold:-13, ratio:2.4, limiterThreshold:-2.2, output:-.4
};
function applySoundProfile(profileKey){
  if(!audioFx.connected)return;
  const t=audioFx.ctx.currentTime;
  const slide=(param,v)=>{try{param.cancelScheduledValues(t);param.setTargetAtTime(v,t,.04);}catch{param.value=v;}};
  if(profileKey==='boost'||state.soundMode===SOUND_MODES.boost){
    const p=BOOST_PROFILE;
    slide(audioFx.subBass.gain,p.subBass);
    slide(audioFx.bass.gain,p.bass);
    slide(audioFx.lowMid.gain,p.lowMid);
    slide(audioFx.body.gain,p.body);
    slide(audioFx.presence.gain,p.presence);
    slide(audioFx.highMid.gain,p.highMid);
    slide(audioFx.treble.gain,p.treble);
    slide(audioFx.air.gain,p.air);
    slide(audioFx.midGain.gain,p.midGain);
    slide(audioFx.sideGain.gain,p.sideGain);
    slide(audioFx.compressor.threshold,p.threshold);
    slide(audioFx.compressor.ratio,p.ratio);
    slide(audioFx.limiter.threshold,p.limiterThreshold);
    slide(audioFx.output.gain,Math.pow(10,p.output/20));
    audioFx.profile='boost';state.soundProfile='boost';audioFx.boostActive=true;
    return;
  }
  // Perfiles clásicos (compatibilidad R10.16): solo usan bass/body/presence/treble.
  const p=SOUND_PROFILES[profileKey]||SOUND_PROFILES.balanced;
  slide(audioFx.subBass.gain,0);
  slide(audioFx.lowMid.gain,0);
  slide(audioFx.highMid.gain,0);
  slide(audioFx.air.gain,0);
  slide(audioFx.midGain.gain,1.0);
  slide(audioFx.sideGain.gain,1.0);
  slide(audioFx.limiter.threshold,-2);
  slide(audioFx.bass.gain,p.bass);
  slide(audioFx.body.gain,p.body);
  slide(audioFx.presence.gain,p.presence);
  slide(audioFx.treble.gain,p.treble);
  slide(audioFx.compressor.threshold,p.threshold);
  slide(audioFx.compressor.ratio,p.ratio);
  slide(audioFx.output.gain,Math.pow(10,p.output/20));
  audioFx.profile=profileKey;state.soundProfile=profileKey;audioFx.boostActive=false;
}
// R10.17 · La mejora ahora aplica a TODAS las fuentes:
//  · Local: usa el perfil por ritmo (Auto) o el modo manual (Warm/Punch/Clear/Boost)
//  · YouTube/SoundCloud/Directo: en modo BOOST siempre se aplica; en otros modos
//    se deja la señal original para no duplicar EQ con la que ya hace YouTube.
// La conexión al grafo se intenta con connectSourceToAudioFx; si el medio es
// cross-origin sin CORS, se ignora silenciosamente.
async function prepareAdaptiveSound(track){
  const isLocal=track?.sourceKind==='local';
  const wantBoost=state.soundMode===SOUND_MODES.boost;
  if(!isLocal&&!wantBoost){state.soundProfile='external';return false;}
  if(state.soundMode===SOUND_MODES.original&&!audioFx.connected&&!wantBoost){state.soundProfile='original';return true;}
  const ok=await ensureAudioFx();if(!ok){state.soundProfile='unavailable';return false;}
  try{if(audioFx.ctx.state==='suspended')await audioFx.ctx.resume();}catch{}
  // Asegurar que la fuente activa está conectada al grafo
  if(wantBoost){
    // Conectar el elemento activo correspondiente
    const el=activeNativeAudio?.()||null;
    if(el)await connectSourceToAudioFx(el);
    if(state.currentEngine==='youtube'&&state.ytEngine==='native'){await connectSourceToAudioFx(ytNativeElement());}
    applySoundProfile('boost');
    return true;
  }
  applySoundProfile(chooseSoundProfile(track));
  return true;
}
// R10.17 · soundModeLabel ahora anuncia BOOST cuando está activo (todas las fuentes)
function soundModeLabel(){
  const m=SOUND_MODE_META[state.soundMode]||SOUND_MODE_META.auto;
  if(state.soundMode===SOUND_MODES.boost)return `${m.icon} ${m.name}`;
  if(state.soundMode===SOUND_MODES.auto&&state.soundProfile&&SOUND_PROFILES[state.soundProfile])return `${m.icon} Auto · ${SOUND_PROFILES[state.soundProfile].label}`;
  return `${m.icon} Sonido ${m.name}`;
}
async function setSoundMode(mode){
  if(!Object.values(SOUND_MODES).includes(mode))mode=SOUND_MODES.auto;
  state.soundMode=mode;
  const t=getCurrentTrack();
  // R10.17 · BOOST aplica a todas las fuentes; los demás modos solo a local
  if(t){
    if(t.sourceKind==='local'||mode===SOUND_MODES.boost){
      await prepareAdaptiveSound(t);
    }
  }
  // R10.20 · Activar también el BOOST nativo en ExoPlayer (Radio Live + YouTube BG)
  if(IS_NATIVE_APK&&window.HappyNative&&window.HappyNative.setBoost){
    try{window.HappyNative.setBoost(mode===SOUND_MODES.boost);}catch(e){}
  }
  await persistPrefs();
  renderPlayer();
  const m=SOUND_MODE_META[mode]||SOUND_MODE_META.auto;
  toast(mode===SOUND_MODES.boost?`★ HAPPY BOOST · mejora multibanda + loudness`:mode===SOUND_MODES.auto?`◉ Sonido Auto · ${SOUND_PROFILES[state.soundProfile]?.label||'adaptativo'}`:`${m.icon} Sonido ${m.name}`,3200);
}
function openSoundModeSheet(){
  const t=getCurrentTrack(),external=t&&t.sourceKind!=='local';
  const order=[SOUND_MODES.auto,SOUND_MODES.original,SOUND_MODES.warm,SOUND_MODES.punch,SOUND_MODES.clear,SOUND_MODES.boost];
  openSheet(`<h2 class="sheet-title">Sonido</h2><p class="sheet-copy">MUSIC PLAY puede ajustar el audio local según el ritmo. <b>HAPPY BOOST</b> aplica mejora multibanda + ensanchador estéreo + limitador de loudness a <b>todas las fuentes</b>, incluido YouTube.</p>${external?'<div class="sound-status-note"><b>Fuente externa</b><span>Los modos Auto/Cálido/Potente/Claro solo aplican a tu biblioteca local. <b>HAPPY BOOST</b> sí procesa YouTube, enlaces y radio.</span></div>':''}<div class="sheet-stack">${order.map(mode=>{const m=SOUND_MODE_META[mode];const sel=mode===state.soundMode;return `<button class="sheet-btn sound-choice${sel?' selected':''}${mode===SOUND_MODES.boost?' boost-choice':''}" data-sound="${mode}">${m.icon} ${m.name}<small>${m.desc}</small></button>`;}).join('')}</div>`,root=>{$$('[data-sound]',root).forEach(b=>b.onclick=async()=>{closeDialog(els.sheetDialog);await setSoundMode(b.dataset.sound);});});
}

function renderAlbums(){
  const groups=getAlbumGroups();els.albumEmpty.classList.toggle('is-hidden',groups.length>0);els.albumList.classList.toggle('is-hidden',!groups.length);els.albumList.innerHTML='';if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${groups.length} ${groups.length===1?'álbum':'álbumes'}`;
  for(const g of groups){const card=document.createElement('button');card.className='album-card';card.type='button';card.innerHTML=`<span class="album-art">▣</span><strong>${safeText(g.name)}</strong><small>${safeText(g.artist||'MUSIC PLAY')} · ${g.tracks.length}</small>`;hydratePlaylistArtwork(g.tracks,$('.album-art',card),'▣');card.onclick=()=>openAlbumSheet(g);els.albumList.appendChild(card);}
}
function openAlbumSheet(group){const ids=group.tracks.filter(playable).map(t=>t.id);openSheet(`<h2 class="sheet-title">${safeText(group.name)}</h2><p class="sheet-copy">${safeText(group.artist||'Álbum')} · ${group.tracks.length} canciones</p><div class="sheet-stack"><button class="sheet-btn" data-album-play>▶ Reproducir<small>En orden</small></button><button class="sheet-btn" data-album-mix>⇄ Aleatorio<small>Sin repetir la vuelta</small></button><button class="sheet-btn" data-album-list>♪ Ver canciones<small>Filtrar biblioteca por este álbum</small></button></div>`,root=>{$('[data-album-play]',root).onclick=()=>{closeDialog(els.sheetDialog);if(ids[0])playTrack(ids[0],ids);};$('[data-album-mix]',root).onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:ids});};$('[data-album-list]',root).onclick=()=>{closeDialog(els.sheetDialog);state.libraryTab='songs';state.search=group.name;els.searchInput.value=group.name;renderLibraryShell();};});}
function playlistContentType(pl){return ['music','podcast','musicVideo'].includes(pl?.contentType)?pl.contentType:'music';}
function isPodcastTrack(trackOrId){
  const id=typeof trackOrId==='string'?trackOrId:trackOrId?.id;
  return !!id&&state.playlists.some(pl=>playlistContentType(pl)==='podcast'&&(pl.trackIds||[]).includes(id));
}
function podcastResumePosition(track){
  if(!track||!isPodcastTrack(track))return 0;
  const pos=Math.max(0,Number(track.resumePosition)||0),dur=Math.max(Number(track.resumeDuration)||0,Number(track.duration)||0);
  if(pos<20)return 0;
  if(dur>0&&(pos/dur>=.92||dur-pos<45))return 0;
  return pos;
}
function podcastResumeCandidate(pl){
  const tracks=getPlaylistTracks(pl).filter(t=>podcastResumePosition(t)>0);
  return tracks.sort((a,b)=>(b.resumeUpdatedAt||0)-(a.resumeUpdatedAt||0))[0]||null;
}
function podcastProgressLabel(track){
  const pos=podcastResumePosition(track),dur=Math.max(Number(track?.resumeDuration)||0,Number(track?.duration)||0);
  if(!pos)return '';
  const pct=dur>0?Math.max(1,Math.min(99,Math.round(pos/dur*100))):0;
  return `Continuar ${formatTime(pos)}${pct?` · ${pct}%`:''}`;
}
function listenMilestone(track){
  const ratio=Math.max(0,Math.min(1,Number(track?.lastListenRatio)||0));
  if(ratio<.20||ratio>=.85)return 0;
  if(ratio<.38)return 25;if(ratio<.63)return 50;return 75;
}
function pendingListenTracks(){
  return state.tracks.filter(t=>playable(t)&&!isPodcastTrack(t)&&listenMilestone(t)>0&&Number(t.lastListenUpdatedAt)>0).sort((a,b)=>(b.lastListenUpdatedAt||0)-(a.lastListenUpdatedAt||0)).slice(0,12);
}
function pendingListenLabel(track){
  const mark=listenMilestone(track),pos=Math.max(0,Number(track?.lastListenPosition)||0);return `${mark}% escuchada${pos?` · seguir ${formatTime(pos)}`:''}`;
}
function playPendingTrack(track){
  if(!track)return;const ids=state.tracks.filter(t=>playable(t)&&!isPodcastTrack(t)).map(t=>t.id);playTrack(track.id,ids.length?ids:[track.id],{resumeAt:Math.max(0,Number(track.lastListenPosition)||0)});
}
function createPendingCard(track){
  const b=document.createElement('button');b.className='media-card pending-media-card';b.type='button';b.innerHTML=`<div class="media-card-art" data-progress="${listenMilestone(track)}%">♪</div><strong>${safeText(track.title)}</strong><small>${safeText(pendingListenLabel(track))}</small>`;hydrateArtwork(track,$('.media-card-art',b),track.sourceKind==='youtube'?'▶':'♪');b.onclick=()=>playPendingTrack(track);return b;
}
function localDateKey(ts=now()){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function listenBand(hour=new Date().getHours()){return hour<6?'madrugada':hour<12?'mañana':hour<18?'tarde':'noche';}
function cyclicHourDistance(a,b){const d=Math.abs(a-b);return Math.min(d,24-d);}
function trackSimilarityScore(a,b){
  if(!a||!b||a.id===b.id)return 0;let score=0;
  const av=v=>String(v||'').trim().toLowerCase(),genericArtists=new Set(['desconocido','youtube','soundcloud','enlace directo','fuente externa','archivo por localizar']);
  if(av(a.artist)&&!genericArtists.has(av(a.artist))&&av(a.artist)===av(b.artist))score+=12;
  if(av(a.album)&&av(a.album)===av(b.album))score+=8;
  if(av(a.genre)&&av(a.genre)===av(b.genre))score+=7;
  const ar=new Set(rhythmKeysForTrack(a)),br=rhythmKeysForTrack(b);for(const k of br)if(ar.has(k)){score+=5;break;}
  return score;
}
function dailyRecommendationTracks(){
  const songs=state.tracks.filter(t=>playable(t)&&!isPodcastTrack(t)),date=localDateKey(),hour=new Date().getHours(),band=listenBand(hour);
  const cached=state.dailyRecommendationDate===date&&state.dailyRecommendationBand===band?(state.dailyRecommendationIds||[]).map(id=>songs.find(t=>t.id===id)).filter(Boolean):[];
  if(cached.length)return cached.slice(0,10);
  const byId=new Map(songs.map(t=>[t.id,t])),eventScores=new Map();
  for(const e of state.history){if(e.type!=='valid'||!byId.has(e.trackId)||!e.ts)continue;const d=new Date(e.ts),hd=cyclicHourDistance(hour,d.getHours());if(hd>5)continue;let w=hd<=1?10:hd<=2?7:hd<=3?4:2;if(d.getDay()===new Date().getDay())w+=2;const age=Math.max(0,(now()-e.ts)/DAY);w*=age<14?1.25:age<60?1:.72;eventScores.set(e.trackId,(eventScores.get(e.trackId)||0)+w);}
  let anchors=[...eventScores.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([id])=>byId.get(id)).filter(Boolean);
  if(!anchors.length)anchors=[...songs].filter(t=>t.lastPlayed||t.favorite).sort((a,b)=>smartScore(b)-smartScore(a)).slice(0,4);
  const scored=songs.map(t=>{let score=(eventScores.get(t.id)||0)+Math.max(0,smartScore(t))*.18+(t.favorite?3:0);for(const a of anchors)score+=trackSimilarityScore(t,a);if(anchors.some(a=>a.id===t.id))score+=9;const recentDays=t.lastPlayed?(now()-t.lastPlayed)/DAY:999;if(recentDays<1)score-=2;else if(recentDays>10)score+=1.5;const jitter=(parseInt(remoteHash(`${date}|${band}|${t.id}`),16)%1000)/1000;return{t,score:score+jitter};}).sort((a,b)=>b.score-a.score);
  const picked=scored.slice(0,10).map(x=>x.t);state.dailyRecommendationDate=date;state.dailyRecommendationBand=band;state.dailyRecommendationIds=picked.map(t=>t.id);persistPrefs();return picked;
}
function dailyRecommendationHint(){const b=listenBand();return `Según tus escuchas de la ${b}`;}
function musicPlaylists(){return state.playlists.filter(pl=>playlistContentType(pl)==='music');}
function podcastPlaylists(){return state.playlists.filter(pl=>playlistContentType(pl)==='podcast');}
function musicVideoPlaylists(){return state.playlists.filter(pl=>playlistContentType(pl)==='musicVideo');}
function playlistSortScore(pl){if(state.librarySort==='played')return getPlaylistTracks(pl).reduce((n,t)=>n+(t.validPlays||0),0);return Math.max(pl.updatedAt||0,pl.createdAt||0);}
function sortedPlaylists(list=state.playlists){const arr=[...list];arr.sort((a,b)=>{const pin=Number(!!b.pinned)-Number(!!a.pinned);if(pin)return pin;if(state.librarySort==='name')return(a.name||'').localeCompare(b.name||'','es',{sensitivity:'base'});return playlistSortScore(b)-playlistSortScore(a);});return arr;}
function podcastCollectionCard(pl,{compact=false}={}){
  const tracks=getPlaylistTracks(pl),resume=podcastResumeCandidate(pl),b=document.createElement('button');b.className=compact?'media-card podcast-media-card':'playlist-card podcast-card';b.type='button';
  const resumeLabel=resume?podcastProgressLabel(resume):'',dur=Math.max(Number(resume?.resumeDuration)||0,Number(resume?.duration)||0),pos=podcastResumePosition(resume),pct=dur>0&&pos?Math.max(1,Math.min(99,Math.round(pos/dur*100))):0;
  if(compact){
    b.innerHTML=`<div class="media-card-art">🎙</div><strong>${safeText(pl.name)}</strong><small>${resumeLabel?safeText(resumeLabel):`${tracks.length} ${tracks.length===1?'episodio':'episodios'}`}</small>${pct?`<i class="podcast-progress"><span style="width:${pct}%"></span></i>`:''}`;
    hydratePlaylistArtwork(tracks,$('.media-card-art',b),'🎙');
  }else{
    const source=(pl.sources||[])[0]?.source||'Podcast',detail=resumeLabel?resumeLabel:`${tracks.length} ${tracks.length===1?'episodio':'episodios'} · ${source}`;
    b.innerHTML=`<span class="playlist-card-icon">🎙</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${safeText(detail)}</small></span><span class="playlist-card-go">›</span>`;
    hydratePlaylistArtwork(tracks,$('.playlist-card-icon',b),'🎙');
  }
  b.onclick=()=>openPlaylistDetail(pl.id);return b;
}
function openPodcastHub(){
  const pods=sortedPlaylists(podcastPlaylists()),continueRows=pods.map(pl=>({pl,t:podcastResumeCandidate(pl)})).filter(x=>x.t).sort((a,b)=>(b.t.resumeUpdatedAt||0)-(a.t.resumeUpdatedAt||0));
  openSheet(`<h2 class="sheet-title">Podcasts</h2><p class="sheet-copy">Tus programas y episodios, con punto de escucha guardado en este dispositivo.</p>${continueRows.length?`<div class="queue-section-title">CONTINUAR ESCUCHANDO</div><div class="sheet-stack">${continueRows.slice(0,4).map(({pl,t})=>`<button class="sheet-btn" data-podcast-continue="${t.id}" data-podcast-pl="${pl.id}">▶ ${safeText(t.title)}<small>${safeText(pl.name)} · ${safeText(podcastProgressLabel(t))}</small></button>`).join('')}</div>`:''}<div class="queue-section-title">PROGRAMAS</div><div class="sheet-stack" data-podcast-list>${pods.map(pl=>{const r=podcastResumeCandidate(pl);return `<button class="sheet-btn" data-podcast-id="${pl.id}">🎙 ${safeText(pl.name)}<small>${r?safeText(podcastProgressLabel(r)):`${getPlaylistTracks(pl).length} episodios · ${(pl.sources||[])[0]?.source||'MUSIC PLAY'}`}</small></button>`;}).join('')||'<p class="sheet-copy">Aún no tienes podcasts guardados.</p>'}<button class="sheet-btn" data-add-podcast>＋ Añadir podcast<small>YouTube o Spotify</small></button></div>`,root=>{
    $$('[data-podcast-continue]',root).forEach(b=>b.onclick=()=>{const pl=state.playlists.find(x=>x.id===b.dataset.podcastPl),ids=(pl?.trackIds||[]).filter(id=>state.tracks.some(t=>t.id===id&&playable(t)));closeDialog(els.sheetDialog);playTrack(b.dataset.podcastContinue,ids.length?ids:[b.dataset.podcastContinue]);});
    $$('[data-podcast-id]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);openPlaylistDetail(b.dataset.podcastId);});
    $('[data-add-podcast]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openLinkSheet('', '', {preferPodcast:true}),50);};
  });
}
function renderPlaylists(){
  const manual=musicPlaylists(),pods=podcastPlaylists();els.playlistHub.classList.toggle('is-hidden',state.playlistDetailOpen);els.playlistHubEmpty.classList.add('is-hidden');els.playlistDetail.classList.toggle('is-hidden',!state.playlistDetailOpen);els.libraryNewPlaylistFab.classList.toggle('is-hidden',state.playlistDetailOpen);els.playlistHub.innerHTML='';
  if(!state.playlistDetailOpen){
    if(els.libraryCountLabel)els.libraryCountLabel.textContent=`${manual.length+pods.length+4} colecciones`;
    const smartTitle=document.createElement('div');smartTitle.className='playlist-section-label';smartTitle.textContent='AUTOMÁTICAS';els.playlistHub.appendChild(smartTitle);
    [SMART_IDS.favorites,SMART_IDS.most,SMART_IDS.recent,SMART_IDS.repeat].forEach(id=>{const meta=smartMeta(id),tracks=getSmartTracks(id),card=document.createElement('button');card.className=`playlist-card smart-playlist-card ${id.split(':')[1]}`;card.type='button';card.innerHTML=`<span class="playlist-card-icon">${meta.icon}</span><span class="playlist-card-copy"><strong>${meta.name}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${meta.subtitle}</small></span><span class="playlist-card-go">›</span>`;card.onclick=()=>openSmartCollection(id);els.playlistHub.appendChild(card);if(tracks.length)hydratePlaylistArtwork(tracks,$('.playlist-card-icon',card),meta.icon);});
    const ownTitle=document.createElement('div');ownTitle.className='playlist-section-label own';ownTitle.textContent='MIS LISTAS';els.playlistHub.appendChild(ownTitle);
    if(!manual.length){const empty=document.createElement('div');empty.className='playlist-inline-empty';empty.innerHTML='<span>≡</span><div><strong>Aún no tienes listas propias</strong><small>Toca + Nueva para crear o importar.</small></div>';els.playlistHub.appendChild(empty);}else{
      for(const pl of sortedPlaylists(manual)){const tracks=getPlaylistTracks(pl),sourceCount=(pl.sources||[]).length,linked=(pl.sources||[]).some(src=>src.status==='linked'),imported=(pl.sources||[]).some(src=>src.status==='imported'),card=document.createElement('button');card.className='playlist-card';card.type='button';const sourceText=sourceCount?`${sourceCount} fuente${sourceCount===1?'':'s'}${linked?' · pendiente':''}`:'Propia';card.innerHTML=`<span class="playlist-card-icon">${imported||linked?'🔗':'≡'}</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${tracks.length} ${tracks.length===1?'canción':'canciones'} · ${safeText(sourceText)}</small></span><span class="playlist-card-go">›</span>`;card.onclick=()=>openPlaylistDetail(pl.id);els.playlistHub.appendChild(card);if(tracks.length)hydratePlaylistArtwork(tracks,$('.playlist-card-icon',card),imported||linked?'▶':'≡');}
    }
    const podTitle=document.createElement('div');podTitle.className='playlist-section-label own';podTitle.textContent='PODCASTS';els.playlistHub.appendChild(podTitle);
    const podHub=document.createElement('button');podHub.className='playlist-card podcast-hub-card';podHub.type='button';podHub.innerHTML=`<span class="playlist-card-icon">🎙</span><span class="playlist-card-copy"><strong>Podcasts</strong><small>${pods.length?`${pods.length} ${pods.length===1?'programa':'programas'} guardados`:'YouTube y Spotify · añade el primero'}</small></span><span class="playlist-card-go">›</span>`;podHub.onclick=openPodcastHub;els.playlistHub.appendChild(podHub);
    return;
  }
  if(state.activeSmartId){
    const meta=smartMeta(state.activeSmartId),tracks=getSmartTracks(state.activeSmartId);els.playlistDetailTitle.textContent=meta.name;els.playlistDetailMeta.textContent=`AUTOMÁTICA · ${tracks.length} ${tracks.length===1?'CANCIÓN':'CANCIONES'}`;els.playlistMenuBtn.classList.add('is-hidden');els.openLibraryFromPlaylists.classList.add('is-hidden');els.addLinkToPlaylistBtn.classList.add('is-hidden');els.mixPlaylistBtn.classList.remove('is-hidden');els.playlistModeBtn?.classList.remove('is-hidden');els.playPlaylistBtn.textContent='▶ Reproducir';els.playlistSources.classList.add('is-hidden');els.playlistSources.innerHTML='';els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0);els.playlistEmpty.querySelector('h3').textContent=`${meta.name} está vacía`;els.playlistEmpty.querySelector('p').textContent=state.activeSmartId===SMART_IDS.favorites?'Toca ♡ en una canción para guardarla aquí.':'MUSIC PLAY irá construyendo esta lista mientras escuchas.';els.playlistList.classList.toggle('is-hidden',tracks.length===0);hydratePlaylistArtwork(tracks,els.playlistHeroArtwork,meta.icon);renderRowsVirtual(els.playlistList,tracks,{fromPlaylist:true,smart:true});return;
  }
  els.playlistMenuBtn.classList.remove('is-hidden');els.openLibraryFromPlaylists.classList.remove('is-hidden');els.addLinkToPlaylistBtn.classList.remove('is-hidden');const pl=getActivePlaylist();if(!pl){state.playlistDetailOpen=false;return renderPlaylists();}const isPodcast=playlistContentType(pl)==='podcast',tracks=getPlaylistTracks(pl),sources=pl.sources||[],podResume=isPodcast?podcastResumeCandidate(pl):null;els.playlistDetailTitle.textContent=pl.name;els.playlistDetailMeta.textContent=`${isPodcast?'PODCAST · ':''}${tracks.length} ${tracks.length===1?(isPodcast?'EPISODIO':'CANCIÓN'):(isPodcast?'EPISODIOS':'CANCIONES')}${sources.length?` · ${sources.length} FUENTE${sources.length===1?'':'S'}`:''}`;const spotifyOnly=isPodcast&&!tracks.length&&((sources||[]).some(x=>x.source==='Spotify')||pl.externalRef?.source==='Spotify');els.playPlaylistBtn.textContent=spotifyOnly?'↗':(isPodcast?(podResume?'▶':'▶'):'▶');els.playPlaylistBtn.dataset.resumeId=podResume?.id||'';els.mixPlaylistBtn.classList.toggle('is-hidden',isPodcast);els.playlistModeBtn?.classList.toggle('is-hidden',isPodcast);els.openLibraryFromPlaylists.textContent=isPodcast?'＋ Episodios':'＋ Canciones';hydratePlaylistArtwork(tracks,els.playlistHeroArtwork,isPodcast?'🎙':(sources.length?'🔗':'≡'));els.playlistEmpty.querySelector('h3').textContent=isPodcast?'Podcast sin episodios':'Playlist vacía';els.playlistEmpty.querySelector('p').textContent=isPodcast?'Añade episodios o conserva aquí la fuente original del programa.':'Añade canciones de tu biblioteca o importa un enlace.';els.playlistEmpty.classList.toggle('is-hidden',tracks.length>0||sources.length>0);els.playlistList.classList.toggle('is-hidden',tracks.length===0);renderRowsVirtual(els.playlistList,tracks,{fromPlaylist:true,podcast:isPodcast});
  els.playlistSources.innerHTML='';els.playlistSources.classList.toggle('is-hidden',sources.length===0);sources.forEach((src,index)=>{const c=document.createElement('div');c.className='playlist-source-card';const status=src.status==='imported'?'Importada':src.status==='linked'?'Enlazada':'Fuente';c.innerHTML=`<div class="playlist-source-main"><span class="source-dot">${isPodcast?'🎙':src.source==='YouTube'?'▶':'🔗'}</span><div><strong>${safeText(src.source||'Enlace')}</strong><small>${status}${src.count?` · ${src.count} elementos`:''}</small></div></div><div class="playlist-source-actions">${src.source==='YouTube'?'<button class="tiny-btn" data-source-play>▶</button>':''}${src.status==='linked'&&src.source==='YouTube'?'<button class="tiny-btn" data-source-retry>↻</button>':''}<button class="tiny-btn" data-source-open>↗</button></div>${src.message?`<p>${safeText(src.message)}</p>`:''}`;$('[data-source-play]',c)?.addEventListener('click',()=>playPlaylistSource(pl,src));$('[data-source-retry]',c)?.addEventListener('click',()=>retryPlaylistSource(pl,index));$('[data-source-open]',c)?.addEventListener('click',()=>window.open(src.originalUrl||src.url,'_blank','noopener'));els.playlistSources.appendChild(c);});
}
function renderLibraryShell(){
  const detail=state.libraryTab==='playlists'&&state.playlistDetailOpen;els.libraryMainHead.classList.toggle('is-hidden',detail);els.libraryTabs.classList.toggle('is-hidden',detail);els.librarySortRow?.classList.toggle('is-hidden',detail);
  [['playlists',els.libraryPlaylistsPanel,els.libraryTabPlaylists],['songs',els.librarySongsPanel,els.libraryTabSongs],['albums',els.libraryAlbumsPanel,els.libraryTabAlbums],['radio',els.libraryRadioPanel,els.libraryTabRadio]].forEach(([tab,panel,btn])=>{panel?.classList.toggle('is-hidden',tab!==state.libraryTab);panel?.classList.toggle('active',tab===state.libraryTab);btn?.classList.toggle('active',tab===state.libraryTab);});
  if(state.libraryTab==='playlists')renderPlaylists();else if(state.libraryTab==='songs')renderLibrarySongs();else if(state.libraryTab==='albums')renderAlbums();else window.MP_LIVE_RADIO?.renderRecordings?.();
}
function createMediaCard(track){const b=document.createElement('button');b.className='media-card';b.type='button';b.innerHTML=`<div class="media-card-art">♪</div><strong>${safeText(track.title)}</strong><small>${safeText(track.artist||sourceLabel(track))}</small>`;hydrateArtwork(track,$('.media-card-art',b),track.sourceKind==='youtube'?'▶':'♪');b.onclick=()=>playTrack(track.id,[...state.tracks].filter(playable).map(t=>t.id));return b;}
function podcastTrackIdSet(){return new Set(podcastPlaylists().flatMap(pl=>pl.trackIds||[]));}
function homeMusicVideoTracks(){const podIds=podcastTrackIdSet();return [...state.tracks].filter(t=>t.sourceKind==='youtube'&&!podIds.has(t.id)).sort((a,b)=>listeningScoreForTracks([b])-listeningScoreForTracks([a])||Math.max(b.lastPlayed||0,b.addedAt||0)-Math.max(a.lastPlayed||0,a.addedAt||0));}
function renderHome(){
  const onboarding=!state.firstRunComplete;els.onboardingPanel.classList.toggle('is-hidden',!onboarding);els.matureHome.classList.toggle('is-hidden',onboarding);
  if(onboarding){els.onboardingStep1.classList.toggle('done',state.tracks.length>0);els.onboardingStep2.classList.toggle('done',state.playlists.length>0);els.onboardingStep3.classList.toggle('done',!!state.currentId||state.tracks.some(t=>(t.validPlays||0)>0));return;}
  const recent=[...state.tracks].filter(t=>t.lastPlayed||t.addedAt).sort((a,b)=>Math.max(b.lastPlayed||0,b.addedAt||0)-Math.max(a.lastPlayed||0,a.addedAt||0));const resume=getCurrentTrack()||recent.find(t=>t.lastPlayed)||recent[0];
  if(els.resumeCard)els.resumeCard.classList.add('is-hidden');if(false){els.resumeTitle.textContent=resume.title;els.resumeArtist.textContent=resume.artist||sourceLabel(resume);els.resumePlayIcon.textContent=state.currentId===resume.id&&state.playing?'⏸':'▶';hydrateArtwork(resume,els.resumeArtwork,resume.sourceKind==='youtube'?'▶':'♪');els.resumeCard.onclick=()=>{if(els.resumeCard._gestureConsumedUntil&&performance.now()<els.resumeCard._gestureConsumedUntil)return;state.currentId===resume.id?togglePlay():playTrack(resume.id,recent.filter(playable).map(t=>t.id),listenMilestone(resume)>0?{resumeAt:Math.max(0,Number(resume.lastListenPosition)||0)}:{});};}
  els.homeRecent.innerHTML='';recent.slice(0,8).forEach(t=>els.homeRecent.appendChild(createMediaCard(t)));
  els.homePlaylists.innerHTML='';sortedPlaylists(musicPlaylists()).slice(0,7).forEach(pl=>{const tracks=getPlaylistTracks(pl),b=document.createElement('button');b.className='media-card';b.type='button';b.innerHTML=`<div class="media-card-art">≡</div><strong>${safeText(pl.name)}</strong><small>${tracks.length} canciones</small>`;hydratePlaylistArtwork(tracks,$('.media-card-art',b),'≡');b.onclick=()=>openPlaylistDetail(pl.id);els.homePlaylists.appendChild(b);});
  const albums=recommendedAlbumGroups().slice(0,8);if(els.homeAlbumsSection)els.homeAlbumsSection.classList.toggle('is-hidden',!albums.length);if(els.homeAlbums){els.homeAlbums.innerHTML='';for(const g of albums){const b=document.createElement('button');b.className='media-card';b.type='button';b.innerHTML=`<div class="media-card-art">▣</div><strong>${safeText(g.name)}</strong><small>${safeText(g.artist||'Álbum')} · ${g.tracks.length}</small>`;hydratePlaylistArtwork(g.tracks,$('.media-card-art',b),'▣');b.onclick=()=>openAlbumSheet(g);els.homeAlbums.appendChild(b);}}
  const rhythms=getRhythmGroups();if(els.homeRhythmsSection)els.homeRhythmsSection.classList.toggle('is-hidden',!rhythms.length);if(els.homeRhythms){els.homeRhythms.innerHTML='';for(const g of rhythms.slice(0,10))els.homeRhythms.appendChild(makeDiscoveryCard(g,{kind:'ritmo'}));}
  const artists=getArtistGroups();if(els.homeArtistsSection)els.homeArtistsSection.classList.toggle('is-hidden',!artists.length);if(els.homeArtists){els.homeArtists.innerHTML='';for(const g of artists.slice(0,10))els.homeArtists.appendChild(makeDiscoveryCard({...g,icon:'♫'},{kind:'artista'}));}
  const pods=sortedPlaylists(podcastPlaylists()).slice(0,8);if(els.homePodcastsSection)els.homePodcastsSection.classList.toggle('is-hidden',!pods.length);if(els.homePodcasts){els.homePodcasts.innerHTML='';for(const pl of pods)els.homePodcasts.appendChild(podcastCollectionCard(pl,{compact:true}));}
  const pending=pendingListenTracks();if(els.homePendingSection)els.homePendingSection.classList.toggle('is-hidden',!pending.length);if(els.homePending){els.homePending.innerHTML='';for(const t of pending.slice(0,8))els.homePending.appendChild(createPendingCard(t));}
  const daily=dailyRecommendationTracks();if(els.homeDailySection)els.homeDailySection.classList.toggle('is-hidden',!daily.length);if(els.homeDailyHint)els.homeDailyHint.textContent=dailyRecommendationHint();if(els.homeDaily){els.homeDaily.innerHTML='';for(const t of daily.slice(0,8)){const b=createMediaCard(t);b.onclick=()=>playTrack(t.id,daily.map(x=>x.id));els.homeDaily.appendChild(b);}}
  const videos=homeMusicVideoTracks().slice(0,8);if(els.homeMusicVideoSection)els.homeMusicVideoSection.classList.toggle('is-hidden',!videos.length);if(els.homeMusicVideo){els.homeMusicVideo.innerHTML='';for(const t of videos){const b=createMediaCard(t);b.classList.add('video-media-card');els.homeMusicVideo.appendChild(b);}}
  renderHomeDecades();
  window.MP_DISCOVERY?.renderDiscoveryHome?.();
}
function renderHomeDecades(){
  if(!els.homeDecades)return;const dec=window.MP_DECADES;if(!dec){els.homeDecadesSection?.classList.add('is-hidden');return;}
  const counts=dec.getDecadeCounts();const active=dec.getActiveDecades();els.homeDecadesSection.classList.toggle('is-hidden',active.length===0);
  if(els.homeDecadesHint){const total=Object.values(counts).reduce((a,b)=>a+b,0);const identified=total-(counts[dec.UNIDENTIFIED]||0);els.homeDecadesHint.textContent=dec.isScanning()?'Analizando años…':(identified>0?identified+' de '+total+' clasificadas':'Redescubre tu biblioteca por época');}
  els.homeDecades.innerHTML='';for(const d of active){const count=counts[d]||0;if(count===0&&d!==dec.UNIDENTIFIED)continue;
    const card=document.createElement('button');card.className='media-card decade-card';card.type='button';const label=dec.decadeLabel(d);const emoji=d==='unknown'?'◌':(d.startsWith('20')?'💿':'📼');const grad=d==='unknown'?'linear-gradient(135deg,var(--surface-3),var(--surface-2))':'linear-gradient(135deg,var(--accent),var(--accent-2))';
    card.innerHTML='<div class="media-card-art decade-art" style="background:'+grad+'">'+emoji+'</div><strong>'+safeText(label)+'</strong><small>'+count+' '+(count===1?'canción':'canciones')+'</small>';card.onclick=()=>openDecadeSheet(d);els.homeDecades.appendChild(card);}
}
function openDecadeSheet(decade){const dec=window.MP_DECADES;if(!dec)return;const tracks=dec.getTracksByDecade(decade);if(!tracks.length){toast('No hay canciones en esta década');return;}const label=dec.decadeLabel(decade);const sorted=[...tracks].sort((a,b)=>{const ya=(dec.getTrackDecade(a.id)?.year)||0,yb=(dec.getTrackDecade(b.id)?.year)||0;return ya-yb;});
  const items=sorted.slice(0,40).map(t=>{const ti=dec.getTrackDecade(t.id);const year=ti?.year||'—';const origin=t.sourceKind==='local'||t.sourceKind==='direct'?'LOCAL':'YOUTUBE';return '<button class="sheet-btn" data-decade-play="'+safeText(t.id)+'"><span class="decade-row"><span class="decade-row-info"><strong>'+safeText(t.title)+'</strong><small>'+safeText(t.artist||sourceLabel(t))+' · '+year+' · '+origin+(t.duration?' · '+formatTime(t.duration):'')+'</small></span><span class="decade-row-go">▶</span></span></button>';}).join('');
  openSheet('<h2 class="sheet-title">'+safeText(label)+'</h2><p class="sheet-copy">'+tracks.length+' '+(tracks.length===1?'canción':'canciones')+'</p><div class="sheet-stack"><button class="sheet-btn" data-decade-action="play">▶ Reproducir</button><button class="sheet-btn" data-decade-action="shuffle">🔀 Aleatorio</button><button class="sheet-btn" data-decade-action="journey">🎬 Viaje por '+safeText(label)+'</button></div><div class="sheet-copy" style="margin-top:8px">Canciones</div><div class="sheet-stack">'+items+'</div>',root=>{
    const ids=sorted.map(t=>t.id);$('[data-decade-action="play"]',root).onclick=()=>{closeDialog(els.sheetDialog);if(ids[0])playTrack(ids[0],ids);};$('[data-decade-action="shuffle"]',root).onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:ids});};$('[data-decade-action="journey"]',root).onclick=()=>{closeDialog(els.sheetDialog);dec.playDecadeJourney(decade);};
    $$('[data-decade-play]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);const id=b.dataset.decadePlay;if(ids.includes(id))playTrack(id,ids);});});}
function openTickerModeSheet(){const cur=window.MP_SMART_MICROTICKER?.getMode?.()||'discreet';const modes=[['off','·','Apagado','No mostrar'],['discreet','·','Discreto','Solo animación'],['dynamic','★','Dinámico','Con eventos']];
  openSheet('<h2 class="sheet-title">▤ MicroTicker</h2><p class="sheet-copy">Animación decorativa de cabecera</p><div class="sheet-stack">'+modes.map(m=>'<button class="sheet-btn'+(m[0]===cur?' selected':'')+'" data-ticker-mode="'+m[0]+'">'+m[1]+' '+m[2]+'<small>'+m[3]+'</small></button>').join('')+'</div>',root=>{$$('[data-ticker-mode]',root).forEach(b=>b.onclick=()=>{const mode=b.dataset.tickerMode;closeDialog(els.sheetDialog);window.MP_SMART_MICROTICKER?.setMode?.(mode);try{localStorage.setItem('mp-ticker-mode',mode);}catch{}toast('MicroTicker · '+(modes.find(m=>m[0]===mode)?.[2]||mode));});});}
function openDiscoveryConfigSheet(){const cur=window.MP_DISCOVERY?.getWorkerUrl?.()||'';
  openSheet('<h2 class="sheet-title">📡 Novedades · Configurar</h2><p class="sheet-copy">Pega la URL de tu Cloudflare Worker para activar Novedades.</p><input id="discoveryUrlInput" class="sheet-input" value="'+safeText(cur)+'" placeholder="https://music-discovery.tu-subdominio.workers.dev"/><div class="sheet-stack"><button class="sheet-btn" data-save-url>Guardar URL</button></div>',root=>{
    $('[data-save-url]',root).onclick=()=>{const url=$('#discoveryUrlInput',root).value.trim();window.MP_DISCOVERY?.setWorkerUrl?.(url);closeDialog(els.sheetDialog);toast(url?'Worker configurado ✓':'Worker desactivado');};});}
function renderSearch(){
  const q=(state.globalSearch||'').trim();els.searchResults.innerHTML='';const info=analyzeLink(q);els.searchLinkHint.classList.toggle('is-hidden',!q||info.kind==='invalid'||(!/^https?:/i.test(q)));els.searchEmpty.classList.toggle('is-hidden',!!q);if(!q)return;
  const needle=q.toLowerCase();
  // R10.20 · Búsqueda más flexible: acentos insensibles (normaliza NFD y
  // quita diacríticos) + token matching (cada palabra del query debe aparecer
  // en algún campo, no la cadena completa) → "juan luis" encuentra "Juanes /
  // Luis Miguel" aunque no estén en ese orden exacto.
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const needleNorm=norm(q);
  const tokens=needleNorm.split(/\s+/).filter(Boolean);
  const matchNorm=s=>{const n=norm(s);return tokens.length?tokens.every(tk=>n.includes(tk)):n.includes(needleNorm);};
  const tracks=state.tracks.filter(t=>{
    if(tokens.length){
      const hay=norm([t.title,t.artist,t.album,t.genre,t.fileName,t.folder].join(' '));
      return tokens.every(tk=>hay.includes(tk));
    }
    return norm([t.title,t.artist,t.album,t.genre,t.fileName,t.folder].join(' ')).includes(needleNorm);
  }).slice(0,60);
  const matchingTrackIds=new Set(tracks.map(t=>t.id));
  const playlistHits=state.playlists.map(pl=>{
    const name=norm(pl.name||''),hayPl=norm((pl.trackIds||[]).map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean).map(t=>`${t.title} ${t.artist} ${t.album}`).join(' '));
    const nameMatch=tokens.length?tokens.every(tk=>name.includes(tk)):name.includes(needleNorm);
    const contained=(pl.trackIds||[]).filter(id=>matchingTrackIds.has(id));
    const plContentMatch=tokens.length?tokens.every(tk=>hayPl.includes(tk)):false;
    return{pl,nameMatch,contained,plContentMatch,origin:pl.id===state.searchOriginPlaylistId};
  }).filter(x=>x.nameMatch||x.contained.length||x.plContentMatch)
    .sort((a,b)=>Number(b.origin)-Number(a.origin)||Number(b.nameMatch)-Number(a.nameMatch)||b.contained.length-a.contained.length)
    .slice(0,18);
  const albums=getAlbumGroups().filter(g=>{
    const hay=norm([g.name,g.artist].join(' '));
    return tokens.length?tokens.every(tk=>hay.includes(tk)):hay.includes(needleNorm);
  }).slice(0,12);
  const addSection=(title,node)=>{if(!node.length)return;const sec=document.createElement('section');sec.className='search-result-section';sec.innerHTML=`<div class="search-result-title">${title}</div>`;for(const el of node)sec.appendChild(el);els.searchResults.appendChild(sec);};
  if(state.searchOriginPlaylistId){const origin=state.playlists.find(pl=>pl.id===state.searchOriginPlaylistId);if(origin){const banner=document.createElement('div');banner.className='search-context-banner';banner.innerHTML=`<span>≡</span><div><small>BÚSQUEDA DESDE PLAYLIST</small><strong>${safeText(origin.name)}</strong></div><button type="button">×</button>`;$('button',banner).onclick=()=>{state.searchOriginPlaylistId='';renderSearch();};els.searchResults.appendChild(banner);}}
  addSection('Playlists',playlistHits.map(({pl,nameMatch,contained,origin})=>{const tracks2=getPlaylistTracks(pl),b=document.createElement('button');b.className=`playlist-card search-playlist-hit${origin?' search-origin-hit':''}`;const icon=playlistContentType(pl)==='podcast'?'🎙':'≡';const reason=origin&&contained.length?`Lista actual · ${contained.length} coincidencia${contained.length===1?'':'s'}`:nameMatch&&contained.length?`Nombre + ${contained.length} coincidencia${contained.length===1?'':'s'}`:nameMatch?'Coincide por nombre':`${contained.length} ${contained.length===1?'canción coincide':'canciones coinciden'}`;b.innerHTML=`<span class="playlist-card-icon">${icon}</span><span class="playlist-card-copy"><strong>${safeText(pl.name)}</strong><small>${safeText(reason)}</small></span><span class="playlist-card-go">›</span>`;hydratePlaylistArtwork(tracks2,$('.playlist-card-icon',b),icon);b.onclick=()=>openPlaylistDetail(pl.id);return b;}));
  // R10.20 · El contexto de reproducción es la lista de resultados de búsqueda,
  // no la cola anterior. Antes se pasaba undefined y makeTrackRow caía a
  // getFilteredTracks() (biblioteca filtrada) → al tocar una canción de
  // búsqueda, la cola se mantenía en la canción anterior.
  const searchCtx=tracks.filter(playable).map(x=>x.id);
  addSection('Canciones',tracks.slice(0,30).map(t=>makeTrackRow(t,{contextIds:searchCtx})));
  addSection('Álbumes',albums.map(g=>{const b=document.createElement('button');b.className='playlist-card';b.innerHTML=`<span class="playlist-card-icon">▣</span><span class="playlist-card-copy"><strong>${safeText(g.name)}</strong><small>${safeText(g.artist||'Álbum')} · ${g.tracks.length}</small></span><span class="playlist-card-go">›</span>`;hydratePlaylistArtwork(g.tracks,$('.playlist-card-icon',b),'▣');b.onclick=()=>openAlbumSheet(g);return b;}));
  if(!tracks.length&&!playlistHits.length&&!albums.length){const empty=document.createElement('div');empty.className='search-empty';empty.innerHTML='<span>⌕</span><strong>Sin coincidencias</strong><small>Prueba otro nombre o pega un enlace. La búsqueda ignora acentos y busca por palabras.</small>';els.searchResults.appendChild(empty);}
}
function renderPlayer(){
  if(window.MP_LIVE_RADIO?.renderPlayer?.())return;
  const t=getCurrentTrack();els.miniPlayer.classList.toggle('is-hidden',!t);if(!t)return;
  els.miniTitle.textContent=t.title;els.miniArtist.textContent=t.artist||sourceLabel(t);els.fullTitle.textContent=t.title;els.fullArtist.textContent=[t.artist,t.album,sourceLabel(t)].filter(Boolean).join(' · ');
  els.favoriteBtn.textContent=t.favorite?'♥':'♡';els.favoriteBtn.classList.toggle('active',t.favorite);els.miniFavoriteBtn.textContent=t.favorite?'♥':'♡';els.miniFavoriteBtn.classList.toggle('active',t.favorite);
  if(els.repeatCurrentBtn){const active=state.repeatOneId===t.id;els.repeatCurrentBtn.classList.toggle('active',active);els.repeatCurrentBtn.textContent=active?'↻1 Activo':'↻1 Repetir';els.repeatCurrentBtn.title=active?'Desactivar repetición de esta canción':'Repetir esta canción continuamente';}
  const pending=cleanManualQueue().length;
  if(els.queueManagerCount)els.queueManagerCount.textContent=pending?`· ${pending}`:'';
  if(els.miniQueueCount){els.miniQueueCount.textContent=String(pending);els.miniQueueCount.classList.toggle('is-hidden',pending===0);}
  if(els.miniQueueBtn){els.miniQueueBtn.classList.toggle('active',pending>0);els.miniQueueBtn.title=pending?`Ver cola · ${pending} pendiente${pending===1?'':'s'}`:'Ver cola de reproducción';}
  const podcast=isPodcastTrack(t);
  if(els.podcastControls)els.podcastControls.classList.toggle('is-hidden',!podcast);
  if(els.podcastRateBtn){els.podcastRateBtn.textContent=`${state.podcastRate}×`;els.podcastRateBtn.title=state.currentEngine==='soundcloud'?'SoundCloud controla su velocidad':`Velocidad del podcast · ${state.podcastRate}×`;}
  const g=state.playing?'⏸':'▶';els.playBtn.textContent=g;els.fullPlayBtn.textContent=g;
  const modeMeta=PLAY_MODE_META[state.playbackMode]||PLAY_MODE_META.normal;els.shuffleBtn.textContent=modeMeta.icon;els.shuffleBtn.classList.toggle('active',state.playbackMode!==PLAY_MODES.normal);els.shuffleBtn.title=`Modo: ${modeMeta.name}`;els.shuffleBtn.setAttribute('aria-label',`Modo de reproducción: ${modeMeta.name}`);
  if(els.soundModeBtn){els.soundModeBtn.textContent=t.sourceKind==='local'||state.soundMode===SOUND_MODES.boost?soundModeLabel():'○ Sonido fuente';els.soundModeBtn.title=t.sourceKind==='local'||state.soundMode===SOUND_MODES.boost?'Ajuste de sonido':'La fuente externa controla su propio sonido';}
  if(els.boostBtn){const on=state.soundMode===SOUND_MODES.boost;els.boostBtn.classList.toggle('on',on);els.boostBtn.title=on?'HAPPY BOOST activo · toca para volver a Auto':'Activar HAPPY BOOST';}
  els.volumeRange.value=String(state.volume);updateProgress();const fallback=t.sourceKind==='youtube'?'▶':t.sourceKind==='soundcloud'?'☁':'♪';hydrateArtwork(t,els.miniArtwork,fallback);hydrateArtwork(t,els.playerArtwork,fallback);
  if(state.floatMini)syncFloatMiniMeta();
}
function render(){renderSummary();renderPlayer();renderHome();if(state.activeView==='library')renderLibraryShell();if(state.activeView==='search')renderSearch();if(state.activeView==='studio')window.MP_SP?.refresh?.();if(state.activeView==='radio')window.MP_LIVE_RADIO?.renderResults?.();syncBottomNav();}
function activeNativeAudio(){return state.currentEngine==='direct'?(els.directAudio||els.audio):els.audio;}


async function shareTrack(track=getCurrentTrack()){
  if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.share();
  if(!track)return toast('No hay una canción activa');
  const title=track.title||'MUSIC PLAY';const artist=track.artist&&track.artist!=='Desconocido'?track.artist:'';const text=[title,artist].filter(Boolean).join(' — ');
  const url=track.remoteUrl||((track.sourceKind==='youtube'&&track.remoteId)?`https://www.youtube.com/watch?v=${encodeURIComponent(track.remoteId)}`:'');
  try{
    if(track.sourceKind==='local'){
      const file=await getTrackFile(track).catch(()=>null);
      if(file&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title,text,files:[file]});return;}
    }
    if(navigator.share){const data={title,text};if(url)data.url=url;await navigator.share(data);return;}
  }catch(err){if(err?.name==='AbortError')return;console.debug('share failed',err);}
  try{await navigator.clipboard.writeText(url||text);toast(url?'Enlace copiado':'Información de la canción copiada');}catch{toast('No se pudo compartir desde este navegador');}
}
function remoteDockExpanded(){try{return localStorage.getItem('mpf-remote-dock-size')==='large';}catch{return false;}}
function syncRemoteDockSize(){if(!els.remoteDock)return;const expanded=remoteDockExpanded();els.remoteDock.classList.toggle('expanded',expanded);if(els.remoteResizeBtn){els.remoteResizeBtn.textContent=expanded?'⤡':'⤢';els.remoteResizeBtn.title=expanded?'Reducir video':'Ampliar video';els.remoteResizeBtn.setAttribute('aria-label',expanded?'Reducir reproductor flotante':'Ampliar reproductor flotante');}}
function toggleRemoteDockSize(){try{localStorage.setItem('mpf-remote-dock-size',remoteDockExpanded()?'normal':'large');}catch{}syncRemoteDockSize();requestAnimationFrame(()=>restoreRemoteDockPosition());}
function closeRemoteDockByUser(){
  const wasYoutube=state.currentEngine==='youtube';if(wasYoutube&&state.ytEngine==='native'){try{ytNativeElement()?.pause();}catch{}}else if(wasYoutube&&ytPlayer)try{ytPlayer.pauseVideo();}catch{}else if(state.currentEngine==='soundcloud'&&scWidget)try{scWidget.pause();}catch{}
  clearRemoteStage();state.playing=false;syncMediaPlaybackState();renderPlayer();toast(wasYoutube?'Reproductor cerrado · toca Play para abrirlo de nuevo':'Reproductor flotante cerrado');
}
function defaultRemoteDockPosition(){
  if(!els.remoteDock)return;els.remoteDock.style.left='';els.remoteDock.style.top='';els.remoteDock.style.right='max(18px, env(safe-area-inset-right))';els.remoteDock.style.bottom='calc(var(--bottom-nav-h) + var(--mini-player-h) + 24px + env(safe-area-inset-bottom))';
}
function clampRemoteDockPosition(left,top){
  const w=els.remoteDock?.offsetWidth||220,h=els.remoteDock?.offsetHeight||180;const navH=els.bottomNav?.offsetHeight||72;const miniH=els.miniPlayer&&!els.miniPlayer.classList.contains('is-hidden')?(els.miniPlayer.offsetHeight||76):0;const bottomReserve=Math.max(18,navH+miniH+20);return{left:Math.max(8,Math.min(window.innerWidth-w-8,left)),top:Math.max(8,Math.min(window.innerHeight-h-bottomReserve,top))};
}
function saveRemoteDockPosition(){
  if(!els.remoteDock||!els.remoteDock.style.left)return;try{localStorage.setItem('mpf-remote-dock-pos',JSON.stringify({left:parseFloat(els.remoteDock.style.left)||0,top:parseFloat(els.remoteDock.style.top)||0}));}catch{}
}
function restoreRemoteDockPosition(){
  if(!els.remoteDock||els.remoteDock.classList.contains('is-hidden'))return;syncRemoteDockSize();let pos=null;try{pos=JSON.parse(localStorage.getItem('mpf-remote-dock-pos')||'null');}catch{}if(!pos||!Number.isFinite(pos.left)||!Number.isFinite(pos.top)){defaultRemoteDockPosition();return;}const c=clampRemoteDockPosition(pos.left,pos.top);els.remoteDock.style.right='auto';els.remoteDock.style.bottom='auto';els.remoteDock.style.left=`${c.left}px`;els.remoteDock.style.top=`${c.top}px`;
}
function bindRemoteDockDrag(){
  if(!els.remoteDockBar||els.remoteDockBar._dragBound)return;els.remoteDockBar._dragBound=true;let active=false,dx=0,dy=0;
  const move=e=>{if(!active)return;const c=clampRemoteDockPosition(e.clientX-dx,e.clientY-dy);els.remoteDock.style.right='auto';els.remoteDock.style.bottom='auto';els.remoteDock.style.left=`${c.left}px`;els.remoteDock.style.top=`${c.top}px`;};
  const end=()=>{if(!active)return;active=false;els.remoteDock.classList.remove('dragging');saveRemoteDockPosition();};
  els.remoteDockBar.addEventListener('pointerdown',e=>{if(e.target.closest('button')&&!e.target.closest('#remoteDragHandle'))return;const r=els.remoteDock.getBoundingClientRect();active=true;dx=e.clientX-r.left;dy=e.clientY-r.top;els.remoteDock.classList.add('dragging');try{els.remoteDockBar.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  els.remoteDockBar.addEventListener('pointermove',move);els.remoteDockBar.addEventListener('pointerup',end);els.remoteDockBar.addEventListener('pointercancel',end);
  els.remoteDragHandle?.addEventListener('dblclick',()=>{try{localStorage.removeItem('mpf-remote-dock-pos');}catch{}defaultRemoteDockPosition();});
  window.addEventListener('resize',()=>{if(!els.remoteDock.classList.contains('is-hidden'))restoreRemoteDockPosition();});
}
// ════════ R10.12 · MODO "PANTALLA REDUCIDA FLOTANTE" ════════
// Una versión mínima de la app en una micro ventana flotante (~30% del ancho).
// Se abre con el botón discreto ⧉ de la barra superior. Con video muestra el
// video pequeño; con audio muestra la carátula con animación. Controles:
// anterior / play-pausa / siguiente, barra de progreso con tiempos, posición en
// la cola, arrastrable por su barra, ⤢ vuelve a la app completa y × cierra.
let fmReturnNode=null,fmReturnParent=null;
function floatMiniStageKind(){
  if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video'&&els.ytVideo?.src)return 'video';
  return 'art';
}
function restoreFloatMiniMedia(){
  if(fmReturnNode&&fmReturnParent){fmReturnParent.appendChild(fmReturnNode);fmReturnNode=null;fmReturnParent=null;}
  if(els.fmStage){els.fmStage.innerHTML='';els.fmStage.classList.remove('has-video');els.fmStage._want='';}
}
async function renderFloatMiniStage(){
  if(!els.fmStage||!state.floatMini)return;
  const t=getCurrentTrack();
  const want=`${floatMiniStageKind()}:${t?.id||''}:${state.currentEngine}:${state.ytEngine}:${state.ytNativeKind}:${state.playing?1:0}`;
  if(els.fmStage._want===want)return;
  els.fmStage._want=want;
  if(floatMiniStageKind()==='video'&&els.ytVideo){
    if(els.ytVideo.parentElement!==els.fmStage){fmReturnNode=els.ytVideo;fmReturnParent=els.remoteNativeSlot;els.fmStage.innerHTML='';els.fmStage.appendChild(els.ytVideo);els.fmStage.classList.add('has-video');}
    if(state.playing&&els.ytVideo.paused){try{els.ytVideo.play();}catch{}}
    return;
  }
  restoreFloatMiniMedia();
  els.fmStage.classList.remove('has-video');
  const ytThumb=(t&&(t.sourceKind==='youtube'||t.sourceKind==='youtube-playlist')&&t.remoteId)?`https://i.ytimg.com/vi/${encodeURIComponent(t.remoteId)}/hqdefault.jpg`:'';
  els.fmStage.innerHTML=`<div class="fm-artcard"><div class="fm-art${state.playing?' is-playing':''}" id="fmArt">${ytThumb?'':'♪'}</div><div class="fm-eq${state.playing?' on':''}" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>`;
  const artNode=$('#fmArt',els.fmStage);
  let url='';try{url=t?await artworkUrlFor(t):'';}catch{}
  if(!url&&ytThumb)url=ytThumb;
  if(artNode){if(url){artNode.style.backgroundImage=`url("${url}")`;artNode.textContent='';}else{artNode.style.backgroundImage='';artNode.textContent='♪';}}
}
function syncFloatMiniProgress(){
  if(!els.fmProgress)return;
  els.fmProgress.value=els.progressRange.value;
  els.fmTimeNow.textContent=els.timeNow.textContent;
  els.fmTimeTotal.textContent=els.timeTotal.textContent;
}
function syncFloatMiniMeta(){
  if(!els.floatMini||!state.floatMini)return;
  renderFloatMiniStage();
  const t=getCurrentTrack();
  els.fmTitle.textContent=t?t.title:'Sin reproducción';
  els.fmArtist.textContent=t?(t.artist||sourceLabel(t)):'—';
  els.fmLabel.textContent=state.currentEngine==='youtube'?(state.ytEngine==='native'?(state.ytNativeKind==='video'?'YOUTUBE · VIDEO':'YOUTUBE · AUDIO'):(state.ytDelegated?'YOUTUBE · LISTA':'YOUTUBE')):(state.currentEngine==='soundcloud'?'SOUNDCLOUD':state.currentEngine==='direct'?'ENLACE':state.currentEngine==='local'?'LOCAL':'MINI');
  const ctx=state.queueIds.length?state.queueIds:[];
  const i=state.currentId?ctx.indexOf(state.currentId):-1;
  els.fmPos.textContent=(i>=0&&ctx.length>1)?`${i+1}/${ctx.length}`:'';
  els.fmPlay.textContent=state.playing?'⏸':'▶';
  syncFloatMiniProgress();
}
function restoreFloatMiniPosition(reset=false){
  if(!els.floatMini)return;
  let pos=null;if(!reset){try{pos=JSON.parse(localStorage.getItem('mpf-float-mini-pos')||'null');}catch{}}
  const w=els.floatMini.offsetWidth||300,h=els.floatMini.offsetHeight||260;
  if(!pos||!Number.isFinite(pos.left)||!Number.isFinite(pos.top)){
    els.floatMini.style.right='auto';els.floatMini.style.bottom='auto';
    els.floatMini.style.left=`${Math.max(6,window.innerWidth-w-12)}px`;
    els.floatMini.style.top='12px';return;
  }
  els.floatMini.style.right='auto';els.floatMini.style.bottom='auto';
  els.floatMini.style.left=`${Math.max(6,Math.min(window.innerWidth-w-6,pos.left))}px`;
  els.floatMini.style.top=`${Math.max(6,Math.min(window.innerHeight-h-6,pos.top))}px`;
}
function bindFloatMiniDrag(){
  if(!els.fmDrag||els.fmDrag._fmDragBound)return;els.fmDrag._fmDragBound=true;
  let active=false,dx=0,dy=0;
  const move=e=>{if(!active)return;const w=els.floatMini.offsetWidth||300,h=els.floatMini.offsetHeight||260;const left=Math.max(6,Math.min(window.innerWidth-w-6,e.clientX-dx)),top=Math.max(6,Math.min(window.innerHeight-h-6,e.clientY-dy));els.floatMini.style.left=`${left}px`;els.floatMini.style.top=`${top}px`;};
  const end=()=>{if(!active)return;active=false;try{localStorage.setItem('mpf-float-mini-pos',JSON.stringify({left:parseFloat(els.floatMini.style.left)||0,top:parseFloat(els.floatMini.style.top)||0}));}catch{}};
  els.fmDrag.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=els.floatMini.getBoundingClientRect();active=true;dx=e.clientX-r.left;dy=e.clientY-r.top;try{els.fmDrag.setPointerCapture(e.pointerId);}catch{}e.preventDefault();});
  els.fmDrag.addEventListener('pointermove',move);
  els.fmDrag.addEventListener('pointerup',end);els.fmDrag.addEventListener('pointercancel',end);
  els.fmDrag.addEventListener('dblclick',()=>{try{localStorage.removeItem('mpf-float-mini-pos');}catch{}restoreFloatMiniPosition(true);});
  window.addEventListener('resize',()=>{if(state.floatMini)restoreFloatMiniPosition();});
}
function enterFloatMini(){
  if(state.floatMini)return;state.floatMini=true;
  document.documentElement.classList.add('mini-float-on');
  els.fmStage._want='';
  requestAnimationFrame(()=>{restoreFloatMiniPosition();renderFloatMiniStage();syncFloatMiniMeta();});
  toast('Pantalla reducida · arrastra la barra para moverla · ⤢ vuelve a la app',4200);
}
function exitFloatMini(){
  if(!state.floatMini)return;state.floatMini=false;
  document.documentElement.classList.remove('mini-float-on');
  restoreFloatMiniMedia();
  if(state.currentEngine==='youtube')ytShowSlot(state.ytEngine==='native'?(state.ytNativeKind==='video'?'video':'audio'):'iframe');
  requestAnimationFrame(()=>restoreRemoteDockPosition());
  renderPlayer();
}
// R10.20 · Pantalla reducida flotante — DEFINITIVO:
// En APK: ⧉ abre la VENTANA FLOTANTE NATIVA (TYPE_APPLICATION_OVERLAY) que se
//   superpone a TODAS las apps, no solo al WebView. Sobrevive al bloqueo de
//   pantalla y a salir de la app. Es el "mini-cuadro de reproducción que queda
//   flotante siempre" que pide el usuario.
// En PWA/navegador: ⧉ abre el overlay HTML (float-mini) que funciona dentro de
//   la pestaña del navegador.
let _happyNativeServiceStarted = false;
function toggleFloatMini(){
  if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.openFloat();
  if(IS_NATIVE_APK&&window.HappyNative?.openFloat){
    // R10.20 · En APK, abrir SOLO la ventana flotante nativa (system overlay).
    // Ya NO mostramos el overlay HTML porque duplica y causa la deformación.
    try{const t=getCurrentTrack(),s=happyEngineSnapshot();window.HappyNative.openFloat(JSON.stringify({trackId:t?.id||'',posMs:Math.round((s.pos||0)*1000),playing:!!s.playing}));}catch{window.HappyNative.openFloat('');}
    _happyNativeServiceStarted=true;
    toast('Pantalla reducida flotante · se queda sobre otras apps',3000);
    return;
  }
  // PWA/navegador: overlay HTML dentro de la pestaña
  state.floatMini?exitFloatMini():enterFloatMini();
}

function updateProgress(){
  let duration=0,current=0;if(state.currentEngine==='youtube'&&state.ytEngine==='native'){const el=ytNativeElement();duration=el?.duration||0;current=el?.currentTime||0;}
  else if(state.currentEngine==='youtube'&&ytPlayer){try{duration=ytPlayer.getDuration()||0;current=ytPlayer.getCurrentTime()||0;}catch{}}else if(state.currentEngine==='soundcloud'&&getCurrentTrack()){duration=getCurrentTrack().duration||0;}else{const a=activeNativeAudio();duration=a?.duration||0;current=a?.currentTime||0;}
  sampleListenSession(current,duration);const pct=duration?(current/duration)*100:0;els.progressRange.value=String(pct);els.timeNow.textContent=formatTime(current);els.timeTotal.textContent=formatTime(duration);syncMediaPosition(current,duration);if(state.floatMini)syncFloatMiniProgress();
}
function syncMediaPlaybackState(){if(!('mediaSession'in navigator))return;try{navigator.mediaSession.playbackState=state.playing?'playing':'paused';}catch{}}
function syncMediaPosition(position,duration){if(!('mediaSession'in navigator)||!navigator.mediaSession.setPositionState||!Number.isFinite(duration)||duration<=0)return;let rate=1;if(state.currentEngine==='local'||state.currentEngine==='direct')rate=activeNativeAudio()?.playbackRate||1;else if(state.currentEngine==='youtube'&&state.ytEngine==='native')rate=ytNativeElement()?.playbackRate||1;try{navigator.mediaSession.setPositionState({duration,position:Math.min(duration,Math.max(0,Number(position)||0)),playbackRate:rate});}catch{}}
function startProgressTimer(){clearInterval(ytProgressTimer);ytProgressTimer=setInterval(()=>{if(state.currentEngine==='youtube')updateProgress();},500);}
function clearRemoteStage(){clearInterval(ytProgressTimer);ytProgressTimer=null;stopYtUrlRefresh();if(ytPlayer){try{ytPlayer.destroy();}catch{}ytPlayer=null;}if(scWidget){try{scWidget.unbind?.(window.SC?.Widget?.Events?.FINISH);}catch{}scWidget=null;}clearInterval(scProgressTimer);scProgressTimer=null;if(els.remoteIframeSlot)els.remoteIframeSlot.innerHTML='';if(els.ytAudio){try{els.ytAudio.pause();}catch{}try{els.ytAudio.removeAttribute('src');els.ytAudio.load();}catch{}}if(els.ytVideo){try{els.ytVideo.pause();}catch{}try{els.ytVideo.removeAttribute('src');els.ytVideo.load();}catch{}}ytShowSlot('iframe');state.ytMedia=null;state.ytResumeVideo=false;state.ytRetryDone=false;state.ytNativeKind='audio';els.remoteDock.classList.add('is-hidden');}
function stopAllEngines({preserveLiveRadio=false}={}){try{els.audio.pause();}catch{}try{els.directAudio?.pause();}catch{}stopYtUrlRefresh();if(ytPlayer){try{ytPlayer.stopVideo();}catch{}}if(scWidget){try{scWidget.pause();}catch{}}try{els.ytAudio?.pause();}catch{}try{els.ytVideo?.pause();}catch{}if(state.ytService){try{window.HappyNative?.postFromWeb?.(JSON.stringify({type:'media/stop'}));}catch{}state.ytService=false;}if(!preserveLiveRadio)window.MP_LIVE_RADIO?.forceStop?.();state.playing=false;syncMediaPlaybackState();}

async function ensureHandlePermissionOnce(handle,key,{allowPrompt=true}={}){
  if(!handle)return false;
  const cacheKey=String(key||handle.name||'handle');
  if(grantedHandleRoots.has(cacheKey))return true;
  if(deniedHandleRoots.has(cacheKey)&&!allowPrompt)return false;
  try{
    let perm='granted';
    if(handle.queryPermission)perm=await handle.queryPermission({mode:'read'});
    if(perm==='granted'){grantedHandleRoots.add(cacheKey);deniedHandleRoots.delete(cacheKey);return true;}
    if(!allowPrompt){deniedHandleRoots.add(cacheKey);return false;}
    if(handle.requestPermission)perm=await handle.requestPermission({mode:'read'});
    if(perm==='granted'){grantedHandleRoots.add(cacheKey);deniedHandleRoots.delete(cacheKey);return true;}
    deniedHandleRoots.add(cacheKey);
  }catch(err){console.debug('permission unavailable',err);deniedHandleRoots.add(cacheKey);}
  return false;
}
async function fileFromRootHandle(rootHandle,relativePath=[]){
  let current=rootHandle;
  const parts=Array.isArray(relativePath)?relativePath:String(relativePath||'').split('/').filter(Boolean);
  if(!parts.length)return null;
  for(let i=0;i<parts.length-1;i++)current=await current.getDirectoryHandle(parts[i]);
  const fh=await current.getFileHandle(parts[parts.length-1]);
  return fh.getFile();
}

function opfsSupported(){return !!navigator.storage?.getDirectory;}
async function getOpfsAudioDir(){
  if(!opfsSupported())return null;
  if(!opfsAudioDirPromise)opfsAudioDirPromise=(async()=>{const root=await navigator.storage.getDirectory();return root.getDirectoryHandle('music-play-audio',{create:true});})();
  try{return await opfsAudioDirPromise;}catch(err){opfsAudioDirPromise=null;console.debug('OPFS unavailable',err);return null;}
}
function opfsNameFor(track,file){const ext=extOf(file?.name||track?.fileName||'')||'bin';return `${String(track.id).replace(/[^a-zA-Z0-9_-]/g,'_')}.${ext}`;}
async function writeFileToOPFS(track,file){
  const dir=await getOpfsAudioDir();if(!dir)throw new Error('OPFS unavailable');
  try{const est=await navigator.storage?.estimate?.();if(est?.quota&&Number.isFinite(file?.size)&&file.size>0){const free=Math.max(0,est.quota-(est.usage||0));if(free<file.size*1.08)throw new Error('Sin espacio suficiente');}}catch(err){if(/Sin espacio/.test(String(err?.message||err)))throw err;}
  const name=opfsNameFor(track,file),fh=await dir.getFileHandle(name,{create:true}),w=await fh.createWritable();
  try{await w.write(file);await w.close();}catch(err){try{await w.abort?.();}catch{}throw err;}
  return {id:track.id,kind:'opfs',opfsName:name,name:file.name,type:file.type||track.type||'',lastModified:file.lastModified||track.lastModified||0,size:file.size||track.size||0};
}
async function readFileFromOPFS(src,track){
  const dir=await getOpfsAudioDir();if(!dir||!src?.opfsName)return null;
  try{const fh=await dir.getFileHandle(src.opfsName);const f=await fh.getFile();return new File([f],src.name||track?.fileName||f.name,{type:src.type||track?.type||f.type,lastModified:src.lastModified||track?.lastModified||f.lastModified});}catch{return null;}
}
async function deleteOpfsSource(src){if(!src?.opfsName)return;const dir=await getOpfsAudioDir();if(!dir)return;try{await dir.removeEntry(src.opfsName);}catch{}}
function queueLocalPersistence(items=[]){
  const valid=items.filter(j=>j?.track&&j?.file);if(!valid.length)return;
  state.localPersistQueue.push(...valid);if(!state.localPersistRunning)setTimeout(runLocalPersistenceQueue,40);
}
async function runLocalPersistenceQueue(){
  if(state.localPersistRunning)return;state.localPersistRunning=true;let completed=0,failed=0;
  while(state.localPersistQueue.length){
    const job=state.localPersistQueue.shift(),track=state.tracks.find(t=>t.id===job.track.id)||job.track,file=job.file;
    try{
      const src=await writeFileToOPFS(track,file);if(state.storageReady)await db.put('sources',src);track.localStored=true;track.storageKind='opfs';track.sourceMissing=false;if(state.storageReady)await db.put('tracks',track).catch(()=>{});completed++;state.localPersistDone++;
    }catch(err){
      failed++;state.localPersistFailed++;track.localStored=false;track.storageKind='external';track.storageError=String(err?.message||err||'OPFS');
      const fallback=job.fallback||null;
      if(state.storageReady&&fallback)await db.put('sources',{id:track.id,...fallback}).catch(()=>{});
      else if(state.storageReady&&file.size<=24*1024*1024)await db.put('sources',{id:track.id,kind:'blob',blob:file,name:file.name,type:file.type,lastModified:file.lastModified}).catch(()=>{});
      else if(state.storageReady)await db.put('sources',{id:track.id,kind:'session-only',name:file.name,type:file.type,lastModified:file.lastModified}).catch(()=>{});
    }
    if((completed+failed)%4===0)await idleYield(220);
  }
  state.localPersistRunning=false;
  if(completed)toast(`✓ ${completed} ${completed===1?'pista guardada':'pistas guardadas'} en MUSIC PLAY · sin permisos posteriores`,3600);
  if(failed)toast(`${failed} ${failed===1?'archivo quedó':'archivos quedaron'} vinculados por falta de espacio`,4200);
}
function openLegacyReconnectSheet(track){
  if(state.reconnectSheetOpen)return;
  state.pendingReconnectTrackId=track?.id||'';state.reconnectSheetOpen=true;
  openSheet(`
    <h2 class="sheet-title">Guarda tu música dentro de MUSIC PLAY</h2>
    <p class="sheet-copy">Android limita el permiso de carpetas externas a la sesión. Elige la carpeta una vez y MUSIC PLAY copiará progresivamente las canciones encontradas a su almacenamiento privado para reproducirlas después sin volver a pedir permiso.</p>
    <div class="sheet-stack">
      <button class="sheet-btn" data-reconnect-folder="1">⌂ Importar carpeta a MUSIC PLAY<small>Recomendado · un permiso ahora, reproducción posterior sin permisos</small></button>
      <button class="sheet-btn" data-reconnect-file="1">♪ Permitir solo esta canción<small>Alternativa temporal · Android puede volver a preguntar</small></button>
      <button class="sheet-btn" data-reconnect-cancel="1">Ahora no</button>
    </div>
  `,root=>{
    $('[data-reconnect-folder]',root)?.addEventListener('click',async()=>{closeDialog(els.sheetDialog);state.reconnectSheetOpen=false;await reconnectLegacyLibraryFolder(state.pendingReconnectTrackId);});
    $('[data-reconnect-file]',root)?.addEventListener('click',async()=>{closeDialog(els.sheetDialog);state.reconnectSheetOpen=false;await allowLegacySingleTrack(state.pendingReconnectTrackId);});
    $('[data-reconnect-cancel]',root)?.addEventListener('click',()=>{state.reconnectSheetOpen=false;state.pendingReconnectTrackId='';});
  });
}
async function allowLegacySingleTrack(trackId){
  const track=state.tracks.find(t=>t.id===trackId);if(!track||!state.storageReady)return;
  const src=await db.get('sources',track.id).catch(()=>null);if(!src?.handle)return;
  const ok=await ensureHandlePermissionOnce(src.handle,`legacy:${track.id}`,{allowPrompt:true});
  if(!ok)return toast('No se concedió acceso a este archivo');
  try{const f=await src.handle.getFile();sessionFiles.set(track.id,f);toast('Acceso concedido a esta canción');await playTrack(track.id,state.queueIds?.length?state.queueIds:null);}catch{toast('No fue posible abrir este archivo');}
}
async function reconnectLegacyLibraryFolder(resumeTrackId=''){
  if(!('showDirectoryPicker'in window))return toast('Este navegador no permite seleccionar una carpeta completa');
  try{
    const root=await showDirectoryPicker();
    showLoader('Preparando biblioteca local…',root.name||'Carpeta');
    let matched=0,scanned=0;const jobs=[],pending=[];
    async function walk(dir,parts=[]){
      for await(const[,entry]of dir.entries()){
        if(entry.kind==='directory'){await walk(entry,[...parts,entry.name]);continue;}
        scanned++;if(scanned%45===0){updateLoaderProgress(scanned,Math.max(scanned,matched+1),'revisando');await sleep(0);}
        try{
          const file=await entry.getFile();if(!isMediaFile(file))continue;const id=hashId(file),track=state.tracks.find(t=>t.id===id);if(!track)continue;
          matched++;sessionFiles.set(id,file);const fallback={kind:'dir-handle',rootHandle:root,rootId:`migration:${root.name}`,relativePath:[...parts,entry.name],name:file.name,type:file.type,lastModified:file.lastModified};
          jobs.push({track,file,fallback});pending.push({id,kind:'opfs-pending',name:file.name,type:file.type,lastModified:file.lastModified});
        }catch{}
      }
    }
    await walk(root,[]);
    if(state.storageReady&&pending.length)for(let i=0;i<pending.length;i+=80){await db.putMany('sources',pending.slice(i,i+80)).catch(()=>{});await idleYield(120);}
    hideLoader();if(jobs.length)queueLocalPersistence(jobs);
    toast(matched?`✓ ${matched} pistas encontradas · guardándose dentro de MUSIC PLAY`:'No encontré coincidencias en esa carpeta',4200);
    const resume=resumeTrackId&&sessionFiles.has(resumeTrackId)?resumeTrackId:'';state.pendingReconnectTrackId='';if(resume)await playTrack(resume,state.queueIds?.length?state.queueIds:null);
  }catch(err){hideLoader();if(err?.name!=='AbortError')console.warn(err);state.pendingReconnectTrackId='';}
}
async function getTrackFile(track){
  if(sessionFiles.has(track.id))return sessionFiles.get(track.id);
  if(!state.storageReady)return null;
  const src=await db.get('sources',track.id).catch(()=>null);if(!src)return null;
  if(src.kind==='opfs'){
    const f=await readFileFromOPFS(src,track);if(f){sessionFiles.set(track.id,f);return f;}track.sourceMissing=true;track.storageError='OPFS missing';await db.put('tracks',track).catch(()=>{});return null;
  }
  if(src.kind==='blob'&&src.blob){const f=src.blob instanceof File?src.blob:new File([src.blob],src.name||track.fileName,{type:src.type||track.type,lastModified:src.lastModified||now()});sessionFiles.set(track.id,f);return f;}
  if(src.kind==='opfs-pending'){state.pendingReconnectTrackId=track.id;setTimeout(()=>openLegacyReconnectSheet(track),0);return null;}
  if(src.kind==='dir-handle'&&src.rootHandle){
    try{const perm=src.rootHandle.queryPermission?await src.rootHandle.queryPermission({mode:'read'}):'prompt';if(perm==='granted'){const f=await fileFromRootHandle(src.rootHandle,src.relativePath);if(f){sessionFiles.set(track.id,f);queueLocalPersistence([{track,file:f,fallback:src}]);return f;}}}catch{}
    state.pendingReconnectTrackId=track.id;setTimeout(()=>openLegacyReconnectSheet(track),0);return null;
  }
  if(src.kind==='handle'&&src.handle){
    try{const perm=src.handle.queryPermission?await src.handle.queryPermission({mode:'read'}):'prompt';if(perm==='granted'){const f=await src.handle.getFile();sessionFiles.set(track.id,f);queueLocalPersistence([{track,file:f,fallback:src}]);return f;}}catch{}
    state.pendingReconnectTrackId=track.id;setTimeout(()=>openLegacyReconnectSheet(track),0);return null;
  }
  if(src.kind==='session-only'){state.pendingReconnectTrackId=track.id;setTimeout(()=>openLegacyReconnectSheet(track),0);return null;}
  return null;
}
async function prepareNativePodcastStart(player,track,startAt=0){
  const isPod=isPodcastTrack(track),resumeAt=Math.max(Number(startAt)||0,podcastResumePosition(track));
  try{player.playbackRate=isPod?state.podcastRate:1;}catch{}
  if(!resumeAt)return;
  const apply=()=>{try{const d=Number(player.duration)||Number(track.duration)||0;if(!d||resumeAt<d-2)player.currentTime=resumeAt;}catch{}};
  if(player.readyState>=1)apply();
  else await Promise.race([new Promise(resolve=>player.addEventListener('loadedmetadata',()=>{apply();resolve();},{once:true})),sleep(2200)]);
}
function seekBy(seconds){
  const delta=Number(seconds)||0;if(!delta)return;
  if(state.currentEngine==='youtube'&&state.ytEngine==='native'){const el=ytNativeElement();try{const d=el?.duration||0;el.currentTime=Math.max(0,Math.min(d||Infinity,el.currentTime+delta));}catch{}return;}
  if(state.currentEngine==='youtube'&&ytPlayer){try{const d=ytPlayer.getDuration()||0,c=ytPlayer.getCurrentTime()||0;ytPlayer.seekTo(Math.max(0,Math.min(d||Infinity,c+delta)),true);}catch{}return;}
  if(state.currentEngine==='soundcloud'&&scWidget){try{scWidget.getPosition(ms=>scWidget.seekTo(Math.max(0,ms+delta*1000)));}catch{}return;}
  const a=activeNativeAudio();if(a){try{a.currentTime=Math.max(0,Math.min(a.duration||Infinity,(a.currentTime||0)+delta));}catch{}}
}
async function cyclePodcastRate(){
  const t=getCurrentTrack();if(!t||!isPodcastTrack(t))return toast('La velocidad especial aparece al reproducir un podcast');
  const idx=PODCAST_RATES.indexOf(Number(state.podcastRate)),next=PODCAST_RATES[(idx+1)%PODCAST_RATES.length];state.podcastRate=next;
  if(state.currentEngine==='soundcloud')toast(`Velocidad ${next}× guardada · SoundCloud controla su propia velocidad`,3200);
  if(state.currentEngine==='youtube'&&state.ytEngine==='native'){try{ytNativeElement().playbackRate=next;}catch{}return;}
  else if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.setPlaybackRate(next);}catch{}}
  else{const a=activeNativeAudio();if(a)try{a.playbackRate=next;}catch{}}
  await persistPrefs();renderPlayer();
  if(state.currentEngine!=='soundcloud')toast(`Podcast · ${next}×`);
}
async function playLocalOrDirect(track,startAt=0){
  clearRemoteStage();state.currentEngine=track.sourceKind==='direct'?'direct':'local';if(state.objectUrl){URL.revokeObjectURL(state.objectUrl);state.objectUrl=null;}
  try{els.audio.pause();}catch{}try{els.directAudio?.pause();}catch{}
  let player=els.audio;
  if(track.sourceKind==='direct'){
    player=els.directAudio||els.audio;player.src=track.remoteUrl;state.soundProfile='external';
    // R10.17 · HAPPY BOOST también aplica a enlaces directos (si CORS lo permite)
    if(state.soundMode===SOUND_MODES.boost)await prepareAdaptiveSound(track).catch(()=>{});
  }else{
    const file=await getTrackFile(track);if(!file){if(!state.pendingReconnectTrackId)toast('No se encontró el archivo local');return false;}state.objectUrl=URL.createObjectURL(file);els.audio.src=state.objectUrl;player=els.audio;await prepareAdaptiveSound(track);
  }
  player.volume=state.volume;try{player.currentTime=0;}catch{}await prepareNativePodcastStart(player,track,startAt);try{await player.play();state.playing=true;renderPlayer();return true;}catch(err){console.warn(err);toast(/wma|wmv|avi|mkv/i.test(track.fileName||'')?'Este formato necesita conversión; el motor WASM será la siguiente fase':'El navegador no pudo iniciar este archivo',4200);return false;}
}

// ════════ R10.11 · MOTOR NATIVO DE YOUTUBE ════════
// Reproduce streams directos de YouTube en elementos <audio>/<video> reales.
// Esto permite: audio con la pantalla bloqueada, controles del sistema
// (Media Session), consumo reducido de datos (solo audio) y ausencia del
// bloqueo de reproducción de los iframes. Fallback automático al reproductor
// visible (iframe) si ninguna instancia responde.
const YT_STREAM_TTL = 90 * 60 * 1000;
const YT_INSTANCES_TTL = 6 * 60 * 60 * 1000; // R10.13: 24h→6h, la salud de las instancias cambia rápido
const YT_REGISTRY_URL = 'https://api.invidious.io/instances.json?sort_by=health';
const YT_PIPED_LIST_URL = 'https://piped-instances.kavin.rocks/';
const YT_PIPED_STATIC = ['https://pipedapi.kavin.rocks','https://pipedapi.adminforge.de','https://api.piped.private.coffee','https://pipedapi.darkness.services','https://pipedapi.reallyaweso.me','https://pipedapi.leptons.xyz'];
const YT_INVIDIOUS_STATIC = ['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://invidious.f5.si','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com','https://invidious.materialio.us'];
const ytStreamCache = new Map();
const ytInstanceStatus = new Map();
const YT_WORKER_CODE = [
  '/**',
  ' * MUSIC PLAY R10.13 · Helper de playlists + streams nativos de YouTube (v2)',
  ' * -------------------------------------------------------------------------',
  ' * Rutas que consume la PWA:',
  ' *   GET /api/youtube-playlist?list=PLAYLIST_ID',
  ' *   GET /api/youtube-streams?v=VIDEO_ID',
  ' *   GET /api/yt-media?u=URL_GOOGLEVIDEO_CODIFICADA   (NUEVO v2: proxy de bytes)',
  ' *',
  ' * Por qué el proxy (importante en v2): las URLs de stream de YouTube quedan',
  ' * firmadas para la IP que las pidió. Si el Worker pide los streams, solo la IP',
  ' * del Worker puede descargarlos y tu telefono recibia 403. /api/yt-media',
  ' * reenvia los bytes (con soporte de Range para poder adelantar/retroceder)',
  ' * desde TU Worker. Es el mismo mecanismo de proxy que usan Invidious/Piped,',
  ' * pero corriendo en tu propio Worker, sin depender de terceros caidos.',
  ' *',
  ' * Despliegue en 3 pasos (gratis):',
  ' *   1. Abre https://workers.cloudflare.com -> Start building / Create Worker.',
  ' *   2. Borra el codigo de ejemplo, pega este archivo COMPLETO y pulsa Deploy.',
  ' *   3. Copia la URL tipo https://tu-helper.tu-usuario.workers.dev y pegala en',
  ' *      MUSIC PLAY -> Menu ... -> Motor de YouTube -> Helper propio -> Probar.',
  ' *',
  ' * Opcional (playlists con titulos y paginacion estables):',
  ' *   wrangler secret put YOUTUBE_API_KEY',
  ' *',
  ' * El helper NO descarga ni re-distribuye archivos: reenvia los mismos bytes',
  ' * publicos que entrega el reproductor de YouTube, solo mientras alguien',
  ' * escucha. No guarda nada.',
  ' */',
  '',
  'var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36";',
  'var MAX_ITEMS = 1000;',
  '',
  'function corsHeaders() {',
  '  return {',
  '    "access-control-allow-origin": "*",',
  '    "access-control-allow-methods": "GET,OPTIONS",',
  '    "access-control-allow-headers": "content-type,range",',
  '    "access-control-expose-headers": "content-type,content-length,content-range,accept-ranges"',
  '  };',
  '}',
  '',
  'function json(data, status, cache) {',
  '  var c = cache || 120;',
  '  var h = Object.assign({',
  '    "content-type": "application/json; charset=utf-8",',
  '    "cache-control": "public, max-age=" + Math.min(c, 120) + ", s-maxage=" + c',
  '  }, corsHeaders());',
  '  return new Response(JSON.stringify(data), { status: status || 200, headers: h });',
  '}',
  '',
  'function validPlaylistId(value) { return /^[A-Za-z0-9_-]{6,120}$/.test(value || ""); }',
  'function validVideoId(value) { return /^[A-Za-z0-9_-]{6,20}$/.test(value || ""); }',
  'function bestThumb(t) {',
  '  t = t || {};',
  '  return (t.maxres && t.maxres.url) || (t.standard && t.standard.url) || (t.high && t.high.url) || (t.medium && t.medium.url) || (t.default && t.default.url) || "";',
  '}',
  '',
  'async function fetchJson(url) {',
  '  var response = await fetch(url, { headers: { accept: "application/json" } });',
  '  var data = null;',
  '  try { data = await response.json(); } catch (e) {}',
  '  if (!response.ok) {',
  '    var message = (data && data.error && data.error.message) || ("HTTP " + response.status);',
  '    var err = new Error(message); err.status = response.status; err.data = data; throw err;',
  '  }',
  '  return data;',
  '}',
  '',
  '/* ---------------- metadatos de playlist (igual que R10) ---------------- */',
  '',
  'async function fromDataApi(list, key) {',
  '  var title = "";',
  '  var podcastStatus = "";',
  '  try {',
  '    var p = new URL("https://www.googleapis.com/youtube/v3/playlists");',
  '    p.searchParams.set("part", "snippet,status"); p.searchParams.set("id", list); p.searchParams.set("key", key);',
  '    var d = await fetchJson(p);',
  '    title = (d.items && d.items[0] && d.items[0].snippet && d.items[0].snippet.title) || "";',
  '    podcastStatus = (d.items && d.items[0] && d.items[0].status && d.items[0].status.podcastStatus) || "";',
  '  } catch (err) {',
  '    console.log("playlist title lookup", err.message);',
  '  }',
  '',
  '  var items = [];',
  '  var pageToken = "";',
  '  do {',
  '    var u = new URL("https://www.googleapis.com/youtube/v3/playlistItems");',
  '    u.searchParams.set("part", "snippet");',
  '    u.searchParams.set("playlistId", list);',
  '    u.searchParams.set("maxResults", "50");',
  '    u.searchParams.set("key", key);',
  '    if (pageToken) u.searchParams.set("pageToken", pageToken);',
  '    var d2 = await fetchJson(u);',
  '    var rows = d2.items || [];',
  '    for (var i = 0; i < rows.length; i++) {',
  '      var s = rows[i].snippet || {};',
  '      var videoId = (s.resourceId && s.resourceId.videoId) || "";',
  '      if (!videoId) continue;',
  '      var unavailable = /^Deleted video$|^Private video$/i.test(s.title || "");',
  '      items.push({',
  '        videoId: videoId,',
  '        title: s.title || "",',
  '        author: s.videoOwnerChannelTitle || s.channelTitle || "YouTube",',
  '        channelTitle: s.videoOwnerChannelTitle || s.channelTitle || "",',
  '        thumbnail: bestThumb(s.thumbnails),',
  '        position: Number.isFinite(s.position) ? s.position : items.length,',
  '        unavailable: unavailable',
  '      });',
  '      if (items.length >= MAX_ITEMS) break;',
  '    }',
  '    pageToken = items.length < MAX_ITEMS ? (d2.nextPageToken || "") : "";',
  '  } while (pageToken);',
  '',
  '  return { ok: true, playlistId: list, title: title, podcastStatus: podcastStatus, items: items, count: items.length, source: "youtube-data-api" };',
  '}',
  '',
  'function decodeHtml(s) {',
  '  return String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, "\\"").replace(/&#39;/g, "\'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");',
  '}',
  'function decodeJsonText(s) {',
  '  try { return JSON.parse("\\"" + String(s || "").replace(/"/g, "\\\\\\"") + "\\""); }',
  '  catch (e) { return String(s || "").replace(/\\\\u0026/g, "&").replace(/\\\\n/g, " ").replace(/\\\\"/g, "\\""); }',
  '}',
  'function extractPublicPage(html) {',
  '  var items = [], seen = new Set();',
  '  var add = function (videoId, title, author) {',
  '    if (!videoId || seen.has(videoId) || items.length >= MAX_ITEMS) return;',
  '    seen.add(videoId);',
  '    items.push({ videoId: videoId, title: decodeJsonText(title), author: decodeJsonText(author), thumbnail: "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg", position: items.length });',
  '  };',
  '  var m;',
  '  var full = /"playlistVideoRenderer":\\{"videoId":"([A-Za-z0-9_-]{6,})"[\\s\\S]{0,2200}?"title":\\{"runs":\\[\\{"text":"((?:\\\\.|[^"\\\\])*)"[\\s\\S]{0,1800}?(?:"shortBylineText":\\{"runs":\\[\\{"text":"((?:\\\\.|[^"\\\\])*)")?/g;',
  '  while ((m = full.exec(html))) add(m[1], m[2] || "", m[3] || "");',
  '  var panel = /"playlistPanelVideoRenderer":\\{[\\s\\S]{0,1500}?"videoId":"([A-Za-z0-9_-]{6,})"[\\s\\S]{0,1500}?"title":\\{"runs":\\[\\{"text":"((?:\\\\.|[^"\\\\])*)"/g;',
  '  while ((m = panel.exec(html))) add(m[1], m[2] || "");',
  '  return items;',
  '}',
  'async function fromPublicPage(list) {',
  '  var url = "https://www.youtube.com/playlist?list=" + encodeURIComponent(list) + "&hl=es&gl=CO";',
  '  var r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "es-CO,es;q=0.9,en;q=0.7", "accept": "text/html,application/xhtml+xml" }, cf: { cacheTtl: 180, cacheEverything: true } });',
  '  if (!r.ok) throw new Error("YouTube HTTP " + r.status);',
  '  var html = await r.text();',
  '  var meta = html.match(/<meta\\s+name="title"\\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\\/title>/i);',
  '  var title = meta ? decodeHtml(meta[1]).replace(/\\s*-\\s*YouTube\\s*$/i, "").trim() : "";',
  '  var items = extractPublicPage(html);',
  '  return { ok: true, playlistId: list, title: title, podcastStatus: "", items: items, count: items.length, source: "youtube-public-page" };',
  '}',
  '',
  'async function handlePlaylist(request, env) {',
  '  var url = new URL(request.url), list = (url.searchParams.get("list") || "").trim();',
  '  if (!validPlaylistId(list)) return json({ ok: false, error: "playlist id invalido" }, 400, 0);',
  '  try {',
  '    if (env && env.YOUTUBE_API_KEY) return json(await fromDataApi(list, env.YOUTUBE_API_KEY), 200, 300);',
  '    var fallback = await fromPublicPage(list);',
  '    return json(Object.assign({}, fallback, { warning: "Configura YOUTUBE_API_KEY para nombres y paginacion estables." }), 200, 120);',
  '  } catch (err) {',
  '    return json({ ok: false, playlistId: list, error: err.message || "No se pudo leer la playlist" }, 502, 0);',
  '  }',
  '}',
  '',
  '/* ---------------- R10.13 · resolucion de streams + proxy ---------------- */',
  '',
  '// Cliente interno de YouTube (InnerTube) desde la red de Cloudflare. Los tres',
  '// clientes son los que historicamente devuelven URLs directas sin poToken.',
  'async function innertubePlayer(videoId, client) {',
  '  var bodies = {',
  '    ANDROID: {',
  '      context: { client: { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30, hl: "es", gl: "CO" } },',
  '      videoId: videoId, params: "8AEB", contentCheckOk: true, racyCheckOk: true',
  '    },',
  '    IOS: {',
  '      context: { client: { clientName: "IOS", clientVersion: "19.09.3", deviceModel: "iPhone14,3", hl: "es", gl: "CO" } },',
  '      videoId: videoId, params: "8AEB", contentCheckOk: true, racyCheckOk: true',
  '    },',
  '    TVEMBEDDED: {',
  '      context: { client: { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0", hl: "es", gl: "CO" }, thirdParty: { embedUrl: "https://www.youtube.com" } },',
  '      videoId: videoId, contentCheckOk: true, racyCheckOk: true',
  '    }',
  '  };',
  '  var uas = {',
  '    ANDROID: "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",',
  '    IOS: "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 17_2 like Mac OS X)",',
  '    TVEMBEDDED: "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15"',
  '  };',
  '  var r = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {',
  '    method: "POST",',
  '    headers: { "content-type": "application/json", "user-agent": uas[client], "accept-language": "es-CO,es;q=0.9", "x-goog-api-format-version": "2" },',
  '    body: JSON.stringify(bodies[client]),',
  '    cf: { cacheTtl: 60, cacheEverything: true }',
  '  });',
  '  if (!r.ok) throw new Error("player " + client + " HTTP " + r.status);',
  '  return r.json();',
  '}',
  '',
  '// Verifica contra googlevideo (mismo origen de red que pidio los streams).',
  'async function probeUrl(url) {',
  '  try {',
  '    var r = await fetch(url, { headers: { range: "bytes=0-127", "user-agent": UA, referer: "https://www.youtube.com/" }, cf: { cacheTtl: 0 } });',
  '    if (r.status === 200 || r.status === 206) { try { await r.body.cancel(); } catch (e) {} return true; }',
  '    return false;',
  '  } catch (e) { return false; }',
  '}',
  '',
  'function collectStreams(data) {',
  '  var sd = (data && data.streamingData) || {};',
  '  var vd = (data && data.videoDetails) || {};',
  '  var adaptive = Array.isArray(sd.adaptiveFormats) ? sd.adaptiveFormats : [];',
  '  var muxed = Array.isArray(sd.formats) ? sd.formats : [];',
  '  var audioStreams = adaptive',
  '    .filter(function (f) { return String(f.mimeType || "").indexOf("audio/") === 0 && f.url; })',
  '    .map(function (f) { return { url: f.url, mimeType: String(f.mimeType).split(";")[0], bitrate: f.bitrate || 0, contentLength: Number(f.contentLength) || 0 }; })',
  '    .sort(function (a, b) { return b.bitrate - a.bitrate; });',
  '  var videoStreams = muxed',
  '    .filter(function (f) { return String(f.mimeType || "").indexOf("video/") === 0 && f.url; })',
  '    .map(function (f) { return { url: f.url, mimeType: String(f.mimeType).split(";")[0], bitrate: f.bitrate || 0, quality: f.qualityLabel || "", itag: f.itag || 0 }; })',
  '    .sort(function (a, b) { return (b.itag === 22 ? 1 : 0) - (a.itag === 22 ? 1 : 0) || (b.bitrate || 0) - (a.bitrate || 0); });',
  '  var thumbs = vd.thumbnail && vd.thumbnail.thumbnails || [];',
  '  var thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : ("https://i.ytimg.com/vi/" + ((vd && vd.videoId) || "") + "/hqdefault.jpg");',
  '  return {',
  '    audioStreams: audioStreams, videoStreams: videoStreams,',
  '    title: vd.title || "",',
  '    author: vd.author || "YouTube",',
  '    duration: Number(vd.lengthSeconds) || 0,',
  '    thumbnail: thumbnail,',
  '    live: !!(vd.isLiveContent)',
  '  };',
  '}',
  '',
  '// Reescribe una URL cruda de googlevideo hacia el proxy de este Worker.',
  'function proxyMedia(request, raw) {',
  '  return new URL(request.url).origin + "/api/yt-media?u=" + encodeURIComponent(raw);',
  '}',
  '',
  'async function handleStreams(request) {',
  '  var url = new URL(request.url), videoId = (url.searchParams.get("v") || "").trim();',
  '  if (!validVideoId(videoId)) return json({ ok: false, error: "video id invalido" }, 400, 0);',
  '',
  '  var clients = ["ANDROID", "IOS", "TVEMBEDDED"];',
  '  for (var ci = 0; ci < clients.length; ci++) {',
  '    try {',
  '      var data = await innertubePlayer(videoId, clients[ci]);',
  '      var status = (data && data.playabilityStatus && data.playabilityStatus.status) || "";',
  '      if (["OK", "LIVE_STREAM_OFFLINE"].indexOf(status) < 0) continue;',
  '      var streams = collectStreams(data);',
  '      if (streams.live) return json({ ok: false, error: "Es una transmision en vivo", live: true }, 200, 30);',
  '      // Verifica el mejor audio (y hasta 3 candidatos); si la URL caduco, prueba la siguiente.',
  '      var audioIdx = -1;',
  '      var limitA = Math.min(3, streams.audioStreams.length);',
  '      for (var i = 0; i < limitA; i++) {',
  '        if (await probeUrl(streams.audioStreams[i].url)) { audioIdx = i; break; }',
  '      }',
  '      if (audioIdx >= 0) {',
  '        var out = {',
  '          ok: true, videoId: videoId, helperVersion: 2, source: "innertube-" + clients[ci],',
  '          title: streams.title, author: streams.author, duration: streams.duration,',
  '          thumbnail: streams.thumbnail, live: false, audioStreams: [], videoStreams: []',
  '        };',
  '        for (var a = 0; a < streams.audioStreams.length; a++) {',
  '          var f = streams.audioStreams[a];',
  '          out.audioStreams.push({ url: proxyMedia(request, f.url), mimeType: f.mimeType, bitrate: f.bitrate, contentLength: f.contentLength, verified: a === audioIdx });',
  '        }',
  '        for (var b = 0; b < streams.videoStreams.length; b++) {',
  '          var g = streams.videoStreams[b];',
  '          out.videoStreams.push({ url: proxyMedia(request, g.url), mimeType: g.mimeType, bitrate: g.bitrate, quality: g.quality, itag: g.itag });',
  '        }',
  '        if (audioIdx > 0) { var best = out.audioStreams.splice(audioIdx, 1)[0]; out.audioStreams.unshift(best); }',
  '        return json(out, 200, 240);',
  '      }',
  '    } catch (err) { console.log("innertube", clients[ci], err && err.message); }',
  '  }',
  '  return json({ ok: false, error: "Sin streams disponibles ahora mismo" }, 502, 30);',
  '}',
  '',
  '// Proxy de bytes: reenvia el stream con soporte de Range (adelantar/retroceder).',
  'async function handleMedia(request) {',
  '  var url = new URL(request.url);',
  '  var raw = url.searchParams.get("u") || "";',
  '  var target = null;',
  '  try { target = new URL(raw); } catch (e) {}',
  '  if (!target || !/(^|\\.)googlevideo\\.com$/.test(target.hostname)) {',
  '    return new Response("url no permitida", { status: 400, headers: corsHeaders() });',
  '  }',
  '  var headers = { "user-agent": UA, "referer": "https://www.youtube.com/" };',
  '  var range = request.headers.get("range");',
  '  if (range) headers["range"] = range;',
  '  var r;',
  '  try {',
  '    r = await fetch(target.toString(), { headers: headers, cf: { cacheTtl: 0, cacheEverything: false } });',
  '  } catch (err) {',
  '    return new Response("upstream error", { status: 502, headers: corsHeaders() });',
  '  }',
  '  var h = new Headers();',
  '  var copy = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];',
  '  for (var i = 0; i < copy.length; i++) { var v = r.headers.get(copy[i]); if (v) h.set(copy[i], v); }',
  '  if (!h.has("content-type")) h.set("content-type", "application/octet-stream");',
  '  if (!h.has("accept-ranges")) h.set("accept-ranges", "bytes");',
  '  h.set("access-control-allow-origin", "*");',
  '  h.set("access-control-expose-headers", "content-type,content-length,content-range,accept-ranges");',
  '  h.set("cache-control", "no-store");',
  '  return new Response(r.body, { status: r.status, headers: h });',
  '}',
  '',
  'export default {',
  '  async fetch(request, env) {',
  '    var url = new URL(request.url);',
  '    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });',
  '    if (url.pathname.endsWith("/api/youtube-playlist")) return handlePlaylist(request, env);',
  '    if (url.pathname.endsWith("/api/youtube-streams")) return handleStreams(request);',
  '    if (url.pathname.endsWith("/api/yt-media")) return handleMedia(request);',
  '    if (env && env.ASSETS) return env.ASSETS.fetch(request);',
  '    return new Response("MUSIC PLAY R10.13 helper v2 · playlist + streams + proxy de media", { status: 200, headers: corsHeaders() });',
  '  }',
  '};',
  ''
].join(String.fromCharCode(10));

function ytNormalizeBase(base=''){
  let s=String(base||'').trim().replace(/\/+$/,'');
  if(s&&!/^https?:\/\//i.test(s))s=`https://${s}`;
  return s;
}
async function ytFetchJson(url,timeout=7500){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const r=await fetch(url,{signal:ctrl.signal,headers:{accept:'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const ct=r.headers.get('content-type')||'';
    if(!ct.includes('json'))throw new Error('respuesta no JSON');
    return await r.json();
  }finally{clearTimeout(timer);}
}
async function ytDiscoverInstances(){
  const t=now();
  if(state.ytInstCache&&t-state.ytInstAt<YT_INSTANCES_TTL)return state.ytInstCache;
  // R10.13: registro Invidious + lista dinámica de Piped EN PARALELO.
  const reg=ytFetchJson(YT_REGISTRY_URL,6000).catch(()=>null);
  const piped=ytFetchJson(YT_PIPED_LIST_URL,5000).catch(()=>null);
  const [rd,pd]=await Promise.all([reg,piped]);
  let invGood=[],invBad=[],pipedDyn=[];
  if(Array.isArray(rd)){
    const rows=rd.filter(x=>Array.isArray(x)&&x[1]?.type==='https'&&x[0]&&!/ygg/i.test(x[0]));
    // En 2026 casi todas publican api:false (endpoint deshabilitado): se ordenan
    // al final y se conservan como último recurso por si alguna la reactiva.
    invGood=rows.filter(x=>x[1].api!==false).map(x=>`https://${x[0]}`);
    invBad=rows.filter(x=>x[1].api===false).map(x=>`https://${x[0]}`);
  }
  if(Array.isArray(pd))pipedDyn=pd.filter(x=>x&&typeof x.api_url==='string'&&/^https:/.test(x.api_url)).map(x=>x.api_url).slice(0,8);
  const seen=new Set();const list=[];
  const push=(base,kind)=>{const b=ytNormalizeBase(base);if(!b||seen.has(b))return;seen.add(b);list.push({base:b,kind});};
  for(const base of [...invGood,...YT_INVIDIOUS_STATIC,...invBad])push(base,'invidious');
  for(const base of [...pipedDyn,...YT_PIPED_STATIC])push(base,'piped');
  state.ytInstCache=list;state.ytInstAt=t;return list;
}
async function ytEngineInstances(){
  const base=ytNormalizeBase(state.ytCustomApi);
  const list=await ytDiscoverInstances();
  if(base){
    const custom=[{base,kind:'invidious'},{base,kind:'piped'}];
    return [...custom,...list.filter(x=>x.base!==base)];
  }
  return list;
}
function ytParseQuality(q=''){const m=String(q).match(/(\d{3,4})p/i);return m?parseInt(m[1],10):0;}
function ytPickInvidious(d){
  if(!d||d.liveNow||d.premiere)return null;
  const adaptive=Array.isArray(d.adaptiveFormats)?d.adaptiveFormats:[];
  const muxed=Array.isArray(d.formatStreams)?d.formatStreams:[];
  const audios=adaptive.filter(f=>String(f.type||'').startsWith('audio/')&&f.url);
  const mp4a=audios.filter(f=>String(f.type).startsWith('audio/mp4')).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
  const opus=audios.filter(f=>String(f.type).startsWith('audio/webm')).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
  const audio=(mp4a[0]||opus[0]||audios[0]||null);
  const muxedMp4=muxed.filter(f=>String(f.type||'').startsWith('video/mp4')&&f.url).sort((a,b)=>{const ia=Number(a.itag)||0,ib=Number(b.itag)||0;return (ib===22?1:0)-(ia===22?1:0)||(ia===18?1:0)-(ib===18?1:0);});
  const video=muxedMp4[0]||null;
  const thumbs=d.videoThumbnails||[];
  const thumb=d.thumbnailUrl||thumbs.find(t=>t.quality==='hqdefault')?.url||thumbs[0]?.url||'';
  return {audioUrl:audio?.url||'',muxedUrl:video?.url||'',title:d.title||'',author:d.author||'',duration:Number(d.lengthSeconds)||0,thumbnail:thumb,source:'invidious'};
}
function ytPickPiped(d){
  if(!d||d.livestream||d.error)return null;
  const audios=Array.isArray(d.audioStreams)?d.audioStreams.filter(f=>f.url):[];
  const mp4a=audios.filter(f=>String(f.mimeType||'').startsWith('audio/mp4')).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
  const opus=audios.filter(f=>String(f.mimeType||'').startsWith('audio/webm')).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
  const audio=mp4a[0]||opus[0]||audios[0]||null;
  const videos=Array.isArray(d.videoStreams)?d.videoStreams.filter(f=>f.url&&!f.videoOnly&&String(f.mimeType||'').startsWith('video/mp4')):[];
  const good=videos.filter(f=>{const q=ytParseQuality(f.quality);return q>0&&q<=720;}).sort((a,b)=>ytParseQuality(b.quality)-ytParseQuality(a.quality));
  const video=good[0]||videos.sort((a,b)=>ytParseQuality(a.quality)-ytParseQuality(b.quality))[0]||null;
  return {audioUrl:audio?.url||'',muxedUrl:video?.url||'',title:d.title||'',author:d.uploader||'',duration:Number(d.duration)||0,thumbnail:d.thumbnailUrl||`https://i.ytimg.com/vi/${d.id||''}/hqdefault.jpg`,source:'piped'};
}
async function ytResolveFromInstance(inst,videoId){
  try{
    if(inst.kind==='invidious'){
      const d=await ytFetchJson(`${inst.base}/api/v1/videos/${encodeURIComponent(videoId)}?local=true`,8000);
      const pick=ytPickInvidious(d);
      if(pick&&(pick.audioUrl||pick.muxedUrl)){ytInstanceStatus.set(inst.base,{ok:true,at:now()});return pick;}
    }else{
      const d=await ytFetchJson(`${inst.base}/streams/${encodeURIComponent(videoId)}`,8000);
      const pick=ytPickPiped(d);
      if(pick&&(pick.audioUrl||pick.muxedUrl)){ytInstanceStatus.set(inst.base,{ok:true,at:now()});return pick;}
    }
    ytInstanceStatus.set(inst.base,{ok:false,at:now()});
  }catch(err){ytInstanceStatus.set(inst.base,{ok:false,at:now(),error:err?.message||''});}
  return null;
}
function ytHelperBases(){
  const bases=[];
  const custom=ytNormalizeBase(state.ytHelperUrl||'');
  if(custom)bases.push(custom);
  if(location.protocol!=='file:')bases.push('');
  return bases;
}
async function ytResolveFromHelper(videoId,{diag=null}={}){
  // R10.13: helper propio del usuario (Worker en workers.dev) y/o same-origin.
  // El worker v2 devuelve URLs YA proxeadas por /api/yt-media → sin 403 por IP.
  if(location.protocol==='file:'&&!ytNormalizeBase(state.ytHelperUrl||''))return null;
  for(const base of ytHelperBases()){
    const t0=Date.now();
    try{
      const apiUrl=base?`${base}/api/youtube-streams?v=${encodeURIComponent(videoId)}`:`${new URL('./api/youtube-streams',location.href).href}?v=${encodeURIComponent(videoId)}`;
      const d=await ytFetchJson(apiUrl,6500);
      if(d&&d.ok){
        const audio=(d.audioStreams||[]).filter(f=>f&&f.url).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0))[0]||null;
        const video=(d.videoStreams||[]).filter(f=>f&&f.url).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0))[0]||null;
        if(audio||video){
          ytInstanceStatus.set('__helper__',{ok:true,at:now()});
          if(diag)diag.helper={ok:true,ms:Date.now()-t0,base:base||'mismo origen'};
          return {audioUrl:audio?.url||'',muxedUrl:video?.url||'',title:d.title||'',author:d.author||'YouTube',duration:Number(d.duration)||0,thumbnail:d.thumbnail||'',source:base?'helper':'helper-local'};
        }
      }
      if(diag)diag.helper={ok:false,ms:Date.now()-t0,base:base||'mismo origen',error:(d&&d.error)||'respuesta sin streams'};
    }catch(err){
      if(diag)diag.helper={ok:false,ms:Date.now()-t0,base:base||'mismo origen',error:err?.message||'sin respuesta'};
    }
  }
  return null;
}
async function ytResolveInnertubeDirect(videoId,{diag=null}={}){
  // R10.13: intento directo desde el navegador con la API interna de YouTube.
  // Si el navegador la bloquea (CORS) o la red la corta, falla en silencio y el
  // motor sigue con las demás vías. Si funciona, no hace falta ni helper.
  if(location.protocol==='file:')return null;
  const t0=Date.now();
  const clients=[
    {name:'ANDROID',body:{context:{client:{clientName:'ANDROID',clientVersion:'19.09.37',androidSdkVersion:30,hl:'es',gl:'CO'}},videoId,contentCheckOk:true,racyCheckOk:true}},
    {name:'IOS',body:{context:{client:{clientName:'IOS',clientVersion:'19.09.3',deviceModel:'iPhone14,3',hl:'es',gl:'CO'}},videoId,contentCheckOk:true,racyCheckOk:true}}
  ];
  for(const c of clients){
    try{
      const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),3000);
      let r;
      try{r=await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false',{method:'POST',signal:ctrl.signal,headers:{'content-type':'application/json','x-goog-api-format-version':'2'},body:JSON.stringify(c.body)});}finally{clearTimeout(timer);}
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const d=await r.json();
      if((d?.playabilityStatus?.status||'')!=='OK')continue;
      const sd=d.streamingData||{},vd=d.videoDetails||{};
      const audios=(sd.adaptiveFormats||[]).filter(f=>String(f.mimeType||'').startsWith('audio/')&&f.url).sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
      const muxed=(sd.formats||[]).filter(f=>String(f.mimeType||'').startsWith('video/mp4')&&f.url).sort((a,b)=>(b.itag===22?1:0)-(a.itag===22?1:0)||(b.bitrate||0)-(a.bitrate||0));
      const audio=audios[0],video=muxed[0];
      if(audio||video){
        const thumbs=vd.thumbnail?.thumbnails||[];
        if(diag)diag.innertube={ok:true,ms:Date.now()-t0};
        return {audioUrl:audio?.url||'',muxedUrl:video?.url||'',title:vd.title||'',author:vd.author||'YouTube',duration:Number(vd.lengthSeconds)||0,thumbnail:thumbs.length?thumbs[thumbs.length-1].url:'',source:'innertube-direct'};
      }
    }catch(err){/* CORS o bloqueo: siguiente cliente */}
  }
  if(diag)diag.innertube={ok:false,ms:Date.now()-t0,error:'bloqueada por el navegador o la red'};
  return null;
}
function ytProbeLatestVersion(base,videoId,timeout=6500){
  // R10.13: último recurso SIN CORS — los elementos <audio> cargan medios
  // cross-origin sin cabeceras CORS. Si la instancia responde latest_version
  // con audio real, esa URL sirve de src directo.
  return new Promise(resolve=>{
    let settled=false;const a=new Audio();a.preload='metadata';a.muted=true;
    const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);try{a.removeAttribute('src');a.load();}catch{}resolve(ok?`${base}/latest_version?id=${encodeURIComponent(videoId)}&itag=140&local=true`:null);};
    const timer=setTimeout(()=>finish(false),timeout);
    a.addEventListener('canplay',()=>finish(true),{once:true});
    a.addEventListener('loadedmetadata',()=>{if(Number.isFinite(a.duration)&&a.duration>0)finish(true);},{once:true});
    a.addEventListener('error',()=>finish(false),{once:true});
    a.src=`${base}/latest_version?id=${encodeURIComponent(videoId)}&itag=140&local=true`;
    a.load();
  });
}
async function raceDeadline(probes,ms){
  const list=probes.filter(Boolean);
  if(!list.length)return null;
  return Promise.race([firstSuccessfulResult(list),new Promise(resolve=>setTimeout(()=>resolve(null),ms))]);
}
const ytNegCache = new Map(); // R10.12: videoId -> {at} · evita re-sondear 20s por cada pista cuando la red bloquea las instancias
const ytPrefetching = new Set();
function firstSuccessfulResult(probes){
  // R10.12: resuelve con la PRIMERA sonda que devuelva streams (todas en paralelo).
  return new Promise(resolve=>{
    let pending=probes.length;if(!pending)return resolve(null);
    let done=false;const finish=v=>{if(done)return;done=true;resolve(v);};
    probes.forEach(p=>Promise.resolve(p).then(v=>{if(v)finish(v);else if(--pending===0)finish(null);}).catch(()=>{if(--pending===0)finish(null);}));
  });
}
async function resolveYouTubeMedia(videoId,{force=false,diag=null}={}){
  if(!videoId)return null;
  const cached=ytStreamCache.get(videoId);
  if(!force&&cached&&now()-cached.at<YT_STREAM_TTL)return cached.data;
  // R10.12: caché negativa corta — si hace 60s ninguna vía respondió para
  // este video, no repetir el sondeo completo en cada avance automático de cola.
  const neg=ytNegCache.get(videoId);
  if(!force&&neg&&now()-neg.at<60000)return null;
  const customBase=ytNormalizeBase(state.ytCustomApi);
  // R10.13 · OLA 1 (vías fiables en paralelo, tope 6.5s): helper propio +
  // InnerTube directo desde el navegador + instancia personalizada.
  const t1=Date.now();
  const wave1=await raceDeadline([
    ytResolveFromHelper(videoId,{diag}),
    ytResolveInnertubeDirect(videoId,{diag}),
    customBase?ytResolveFromInstance({base:customBase,kind:'invidious'},videoId):null,
    customBase?ytResolveFromInstance({base:customBase,kind:'piped'},videoId):null
  ],6500);
  if(diag)diag.ola1ms=Date.now()-t1;
  if(wave1&&(wave1.audioUrl||wave1.muxedUrl)){ytNegCache.delete(videoId);const data={...wave1};ytStreamCache.set(videoId,{data,at:now()});return data;}
  // R10.13 · OLA 2 (instancias públicas, tope 8s): registro + Piped dinámico + estáticas.
  const instances=(await ytEngineInstances()).sort((a,b)=>{const sa=ytInstanceStatus.get(a.base)?.ok?1:0,sb=ytInstanceStatus.get(b.base)?.ok?1:0;return sb-sa;}).filter(x=>x.base!==customBase);
  const t2=Date.now();
  const wave2=await raceDeadline(instances.slice(0,7).map(inst=>ytResolveFromInstance(inst,videoId)),8000);
  if(diag)diag.instances={ok:!!wave2,ms:Date.now()-t2,error:wave2?'':'ninguna responde (API deshabilitada o caídas)'};
  if(wave2&&(wave2.audioUrl||wave2.muxedUrl)){ytNegCache.delete(videoId);const data={...wave2};ytStreamCache.set(videoId,{data,at:now()});return data;}
  // R10.13 · OLA 3 (último recurso, ~6s): latest_version con <audio> (sin CORS).
  const invBases=instances.filter(x=>x.kind==='invidious').slice(0,3);
  const t3=Date.now();
  const lvUrl=await raceDeadline(invBases.map(b=>ytProbeLatestVersion(b.base,videoId)),6000);
  if(diag)diag.latest={ok:!!lvUrl,ms:Date.now()-t3,error:lvUrl?'':'ninguna sirve audio directo'};
  if(lvUrl){ytNegCache.delete(videoId);const data={audioUrl:lvUrl,muxedUrl:'',title:'',author:'YouTube',duration:0,thumbnail:'',source:'latest-version'};ytStreamCache.set(videoId,{data,at:now()});return data;}
  const rest=instances.slice(7);
  if(rest.length){
    const wave4=await raceDeadline(rest.slice(0,6).map(inst=>ytResolveFromInstance(inst,videoId)),4000);
    if(wave4&&(wave4.audioUrl||wave4.muxedUrl)){ytNegCache.delete(videoId);const data={...wave4};ytStreamCache.set(videoId,{data,at:now()});return data;}
  }
  ytNegCache.set(videoId,{at:now()});
  return null;
}
// R10.12: precarga en reposo los streams de la SIGUIENTE pista de la cola para que
// el avance automático sea instantáneo (sin esperar resolución al terminar la actual).
function schedulePrefetchNextYouTube(){
  try{
    const mode=state.playbackMode||PLAY_MODES.normal;
    if(mode!==PLAY_MODES.normal&&mode!==PLAY_MODES.shuffle)return;
    let upcoming=[];
    if(state.manualQueueIds.length)upcoming=[state.manualQueueIds[0]];
    else{
      const ctx=state.queueIds.length?state.queueIds:state.baseQueueIds;
      const idx=Math.max(-1,state.currentId?ctx.indexOf(state.currentId):state.queueIndex);
      upcoming=ctx.slice(idx+1,idx+3);
    }
    const next=upcoming.map(id=>state.tracks.find(t=>t.id===id)).find(t=>t&&playable(t)&&t.sourceKind==='youtube'&&t.remoteId&&!ytStreamCache.has(t.remoteId)&&!ytNegCache.has(t.remoteId));
    if(!next||ytPrefetching.has(next.id))return;
    ytPrefetching.add(next.id);
    setTimeout(()=>{idleYield(1500).then(()=>resolveYouTubeMedia(next.remoteId).catch(()=>null)).finally(()=>ytPrefetching.delete(next.id));},2500);
  }catch{}
}
// R10.20 · Refresh periódico de la URL del YouTube track actual para evitar
// que caduque mientras suena (las URLs firmadas de YouTube duran ~6h, pero
// algunas instancias devuelven URLs más cortas). Cada 25 min, re-resuelve
// y actualiza state.ytMedia en silencio — si la pista sigue sonando, el
// swap a background usará una URL fresca.
let ytUrlRefreshTimer=null;
function startYtUrlRefresh(){
  stopYtUrlRefresh();
  ytUrlRefreshTimer=setInterval(async()=>{
    try{
      const t=getCurrentTrack();
      if(!t||t.sourceKind!=='youtube'||!t.remoteId)return;
      if(state.currentEngine!=='youtube')return;
      // Solo refresh si la caché tiene >25 min
      const cached=ytStreamCache.get(t.remoteId);
      if(cached&&now()-cached.at<25*60*1000)return;
      const res=await resolveYouTubeMedia(t.remoteId,{force:true}).catch(()=>null);
      if(res&&(res.audioUrl||res.muxedUrl)){
        ytStreamCache.set(t.remoteId,{data:res,at:now()});
        // Si estamos en modo nativo, actualizar ytMedia pero NO interrumpir
        // la reproducción actual — solo se usará si hay swap a background.
        if(state.ytEngine==='native'){
          state.ytMedia={...state.ytMedia,...res};
        }
        console.debug('R10.20 · URL de YouTube refrescada en background');
      }
    }catch(e){console.debug('R10.20 · yt url refresh error',e);}
  },5*60*1000); // cada 5 min revisa si necesita refresh
}
function stopYtUrlRefresh(){if(ytUrlRefreshTimer){clearInterval(ytUrlRefreshTimer);ytUrlRefreshTimer=null;}}
function ytNativeElement(){return state.ytNativeKind==='video'?els.ytVideo:els.ytAudio;}
function ytShowSlot(which){
  if(els.remoteIframeSlot)els.remoteIframeSlot.classList.toggle('is-hidden',which!=='iframe');
  if(els.remoteNativeSlot)els.remoteNativeSlot.classList.toggle('is-hidden',which!=='video');
  if(els.remoteAudioSlot)els.remoteAudioSlot.classList.toggle('is-hidden',which!=='audio');
}
function ytApplyNativeVolume(){if(els.ytAudio)els.ytAudio.volume=state.volume;if(els.ytVideo)els.ytVideo.volume=state.volume;}
function ytPrepareStart(el,track,startAt=0){
  const resumeAt=Math.max(Number(startAt)||0,podcastResumePosition(track));
  if(!resumeAt)return;
  const apply=()=>{try{const d=Number(el.duration)||Number(track.duration)||0;if(!d||resumeAt<d-2)el.currentTime=resumeAt;}catch{}};
  if(Number.isFinite(el.duration)&&el.duration>0)apply();
  else el.addEventListener('loadedmetadata',apply,{once:true});
}
function ytNativeArtworkFor(track,res){
  return track.thumbnail||(res?.thumbnail)||(track.remoteId?`https://i.ytimg.com/vi/${encodeURIComponent(track.remoteId)}/hqdefault.jpg`:'');
}
function renderYtNativeAudioCard(track){
  if(!els.ytAudioCard)return;
  if(els.ytAudioTitle)els.ytAudioTitle.textContent=track.title||'—';
  if(els.ytAudioArtist)els.ytAudioArtist.textContent=track.artist||'YouTube';
  const art=ytNativeArtworkFor(track,state.ytMedia);
  if(els.ytAudioArt){
    els.ytAudioArt.textContent=art?'':'▶';
    els.ytAudioArt.style.backgroundImage=art?`url("${art}")`:'';
    els.ytAudioArt.classList.toggle('with-image',!!art);
  }
}
// R10.12: reintento con gesto — si el navegador bloquea el play() nativo por
// falta de activación del usuario (NotAllowedError), se espera UN toque real
// del usuario y se reintenta en la misma posición, en vez de rendirse al iframe.
async function ytGesturePlay(el){
  try{await el.play();return true;}catch(err){
    if(!err||err.name!=='NotAllowedError')return false;
    toast('Toca la pantalla una vez para iniciar el audio',4200);
    return new Promise(resolve=>{
      let done=false;
      const cleanup=()=>{document.removeEventListener('pointerdown',retry,true);clearTimeout(timer);};
      const retry=async()=>{try{await el.play();if(!done){done=true;cleanup();resolve(true);}}catch{}};
      const timer=setTimeout(()=>{if(!done){done=true;cleanup();resolve(false);}},30000);
      document.addEventListener('pointerdown',retry,true);
    });
  }
}
async function playYouTubeNative(track,startAt=0){
  if(!track?.remoteId)return false;
  const res=await resolveYouTubeMedia(track.remoteId);
  if(!res||(!res.audioUrl&&!res.muxedUrl))return false;
  state.ytMedia=res;state.ytRetryDone=false;state.ytResumeVideo=false;state.ytHandoverPos=0;
  state.currentEngine='youtube';state.ytEngine='native';state.ytDelegated=false;state.ytDelegatedSourceId='';
  const wantVideo=(track.mediaKind==='video')&&!!res.muxedUrl;
  if(IS_NATIVE_APK&&!wantVideo&&res.audioUrl&&window.HappyNative?.postFromWeb){
    window.HappyNative.postFromWeb(JSON.stringify({type:'media/play',payload:{url:res.audioUrl,title:res.title||track.title,artist:res.author||track.artist||'YouTube',album:track.album||'YouTube',trackId:track.id,startAtMs:Math.max(0,Number(startAt)||0)*1000}}));
    state.ytService=true;state.currentEngine='youtube';state.ytEngine='service';state.playing=true;state.ytDelegated=false;state.ytDelegatedSourceId='';
    return true;
  }
  state.ytNativeKind=wantVideo?'video':'audio';
  els.remoteDock.classList.remove('is-hidden');syncRemoteDockSize();
  els.remoteLabel.textContent=wantVideo?'YOUTUBE · VIDEO':'YOUTUBE · AUDIO';
  if(wantVideo){ytShowSlot('video');}else{renderYtNativeAudioCard(track);ytShowSlot('audio');}
  requestAnimationFrame(restoreRemoteDockPosition);
  const el=ytNativeElement();
  el.volume=state.volume;
  el.playbackRate=isPodcastTrack(track)?state.podcastRate:1;
  el.src=wantVideo?res.muxedUrl:res.audioUrl;
  ytPrepareStart(el,track,startAt);
  try{
    const played=await ytGesturePlay(el);
    if(!played){
      // R10.12: el navegador exige un toque (autoplay bloqueado). NO caer al iframe
      // ni saltar de pista: la canción queda cargada y pausa, lista para Play.
      console.debug('native yt play sin gesto disponible');
      state.playing=false;renderPlayer();syncMediaPlaybackState();
      toast('Toca Play para reproducir esta canción',4200);
      return true;
    }
  }catch(err){console.debug('native yt play',err);return false;}
  state.playing=true;
  if(track.sourceKind==='youtube'&&(/^YouTube ·/.test(track.title)||!track.artist||track.artist==='YouTube')&&(res.title||res.author)){
    track.title=res.title||track.title;track.artist=res.author||track.artist;
    if(res.duration)track.duration=res.duration;
    await saveRemoteTrack(track).catch(()=>{});
    renderYtNativeAudioCard(track);render();
  }
  // R10.17 · Si HAPPY BOOST está activo, conectar el medio al grafo Web Audio
  if(state.soundMode===SOUND_MODES.boost){await prepareAdaptiveSound(track).catch(()=>{});}
  renderPlayer();startProgressTimer();setupMediaSession();syncMediaPlaybackState();
  toast(wantVideo?'Video en reproducción nativa · el audio sigue con pantalla bloqueada':'Audio nativo · sigue sonando con la pantalla bloqueada',3400);
  schedulePrefetchNextYouTube();
  startYtUrlRefresh(); // R10.20 · refresh periódico de URL para evitar caducidad
  return true;
}
async function ytHandleNativeError(){
  if(state.currentEngine!=='youtube'||state.ytEngine!=='native')return;
  const track=getCurrentTrack();if(!track)return;
  const el=ytNativeElement();const pos=Number(el?.currentTime)||0;
  if(!state.ytRetryDone){
    state.ytRetryDone=true;
    const res=await resolveYouTubeMedia(track.remoteId,{force:true});
    if(res&&(res.audioUrl||res.muxedUrl)){
      state.ytMedia=res;
      const wantVideo=(track.mediaKind==='video')&&!!res.muxedUrl&&state.ytNativeKind==='video';
      el.src=wantVideo?res.muxedUrl:res.audioUrl;
      ytPrepareStart(el,track,pos);
      try{await el.play();return;}catch{}
    }
  }
  toast('Stream no disponible · probando el reproductor visible…',3000);
  state.ytEngine='iframe';
  const ok=await playYouTubeIframe(track,pos).catch(()=>false);
  if(!ok)handleRuntimePlaybackFailure(track,track.lastPlaybackError||'YouTube sin streams disponibles');
}
async function ytSwapToAudioForBackground(){
  if(state.currentEngine!=='youtube'||state.ytEngine!=='native'||state.ytNativeKind!=='video')return;
  const media=state.ytMedia;if(!media?.audioUrl)return;
  const pos=Number(els.ytVideo.currentTime)||0;state.ytHandoverPos=pos;
  const wasPlaying=state.playing||!els.ytVideo.paused;
  try{els.ytVideo.pause();}catch{}
  state.ytNativeKind='audio';
  els.ytAudio.volume=state.volume;els.ytAudio.src=media.audioUrl;
  ytPrepareStart(els.ytAudio,getCurrentTrack(),pos);
  try{await els.ytAudio.play();}catch{state.ytResumeVideo=false;return;}
  state.ytResumeVideo=wasPlaying;
  els.remoteLabel.textContent='YOUTUBE · AUDIO';
  renderYtNativeAudioCard(getCurrentTrack());ytShowSlot('audio');
}
async function ytRestoreVideoIfPossible(){
  if(state.currentEngine!=='youtube'||state.ytEngine!=='native')return;
  if(!state.ytResumeVideo)return;
  const media=state.ytMedia;if(!media?.muxedUrl){state.ytResumeVideo=false;return;}
  const track=getCurrentTrack();
  const pos=Number(els.ytAudio.currentTime)||state.ytHandoverPos||0;
  try{els.ytAudio.pause();}catch{}
  state.ytNativeKind='video';
  els.ytVideo.src=media.muxedUrl;
  ytPrepareStart(els.ytVideo,track,pos);
  try{await els.ytVideo.play();}catch{await ytSwapToAudioForBackground();return;}
  state.ytResumeVideo=false;
  els.remoteLabel.textContent='YOUTUBE · VIDEO';
  ytShowSlot('video');
}
// R10.17 · YouTube en bloqueo de pantalla: delega el audio al servicio nativo
// (ExoPlayer en FloatingPlayerService) que SOBREVIVE al lock screen. Se llama
// cuando el documento se oculta (pantalla bloqueada o app a fondo) mientras
// suena un video nativo de YouTube. El video se pausa para liberar el decoder.
async function ytSwapToAudioServiceForBackground(){
  if(!IS_NATIVE_APK||!window.HappyNative?.postFromWeb)return ytSwapToAudioForBackground();
  if(state.currentEngine!=='youtube'||state.ytEngine!=='native'||state.ytNativeKind!=='video')return;
  const track=getCurrentTrack();if(!track)return;
  let media=state.ytMedia;
  const pos=Number(els.ytVideo.currentTime)||0;
  const wasPlaying=state.playing||!els.ytVideo.paused;
  // R10.20 · DEFINITIVE FIX: si no hay audioUrl, re-resolver AHORA antes de
  // delegar. Antes, si la resolución inicial solo devolvió muxedUrl (video),
  // al bloquear la pantalla no había audioUrl para delegar -> fallo silencioso.
  if(!media?.audioUrl&&track.remoteId){
    console.debug('R10.20 · re-resolviendo audioUrl para background YouTube...');
    try{
      const res=await resolveYouTubeMedia(track.remoteId,{force:true});
      if(res?.audioUrl){
        media={...media,...res};
        state.ytMedia=media;
        ytStreamCache.set(track.remoteId,{data:res,at:now()});
      }
    }catch(e){console.debug('R10.20 · re-resolución falló',e);}
  }
  // Si seguimos sin audioUrl, caer al ytAudio del WebView (audio-only nativo)
  // que al menos no necesita decoder de video y sobrevive mejor al lock screen.
  if(!media?.audioUrl){
    console.debug('R10.20 · sin audioUrl — cayendo a ytAudio WebView');
    return ytSwapToAudioForBackground();
  }
  try{els.ytVideo.pause();}catch{}
  try{els.ytAudio.pause();}catch{}
  state.ytHandoverPos=pos;
  state.ytResumeVideo=wasPlaying;
  state.ytService=true;
  state.currentEngine='youtube';
  state.ytEngine='service';
  state.playing=true;
  state.nativePositionMs=Math.round(pos*1000);
  state.nativeDurationMs=Math.round((Number(els.ytVideo.duration)||media.duration||0)*1000);
  window.HappyNative.postFromWeb(JSON.stringify({
    type:'media/play',
    payload:{
      url:media.audioUrl,
      title:track.title||'YouTube',
      artist:track.artist||'YouTube',
      album:track.album||'YouTube',
      trackId:track.id,
      startAtMs:Math.max(0,Math.round(pos*1000))
    }
  }));
  els.remoteLabel.textContent='YOUTUBE · AUDIO (BG)';
  renderYtNativeAudioCard(track);
  ytShowSlot('audio');
  renderPlayer();
  syncMediaPlaybackState();
  toast('Audio delegado al servicio nativo · sigue con pantalla bloqueada',2600);
}
// R10.17 · Vuelve del servicio nativo al video en WebView cuando la app recupera
// el frente. Detiene el ExoPlayer y rearranca el <video> en la misma posición.
async function ytReclaimVideoFromService(){
  if(!state.ytService||!state.ytResumeVideo)return;
  const track=getCurrentTrack();if(!track)return;
  const media=state.ytMedia;if(!media?.muxedUrl){state.ytResumeVideo=false;state.ytService=false;return;}
  // Posición actual tomada del estado nativo (refrescada por happyPushMediaState)
  const pos=(state.nativePositionMs||0)/1000;
  try{window.HappyNative?.postFromWeb?.(JSON.stringify({type:'media/stop'}));}catch{}
  state.ytService=false;
  state.ytEngine='native';
  state.ytNativeKind='video';
  els.ytVideo.src=media.muxedUrl;
  ytPrepareStart(els.ytVideo,track,pos);
  try{await els.ytVideo.play();}catch{await ytSwapToAudioForBackground();return;}
  state.ytResumeVideo=false;
  state.playing=true;
  els.remoteLabel.textContent='YOUTUBE · VIDEO';
  ytShowSlot('video');
  renderPlayer();
  syncMediaPlaybackState();
}

function loadScript(src,id){return new Promise((resolve,reject)=>{if(id&&document.getElementById(id))return resolve();const s=document.createElement('script');if(id)s.id=id;s.src=src;s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
function loadYouTubeApi(){if(window.YT?.Player)return Promise.resolve(window.YT);if(ytApiPromise)return ytApiPromise;ytApiPromise=new Promise((resolve,reject)=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev?.();}catch{}resolve(window.YT);};loadScript('https://www.youtube.com/iframe_api','youtube-iframe-api').catch(reject);setTimeout(()=>{if(window.YT?.Player)resolve(window.YT);},1800);setTimeout(()=>{if(!window.YT?.Player)reject(new Error('YouTube API timeout'));},12000);});return ytApiPromise;}
async function fetchYouTubeMeta(videoId){const fallback=`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;try{const url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const r=await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||'',artist:d.author_name||'YouTube',thumbnail:d.thumbnail_url||fallback};}catch{return{title:'',artist:'YouTube',thumbnail:fallback};}}
async function playYouTube(track,startAt=0){
  // R10.32 · IFrame FIRST, native as fallback.
  const mode=state.ytNativeMode||'auto';
  if(mode==='iframe')return playYouTubeIframe(track,startAt);
  const okIframe=await playYouTubeIframe(track,startAt);
  if(okIframe)return true;
  if(track?.remoteId&&track.sourceKind!=='youtube-playlist'){
    return playYouTubeNative(track,startAt);
  }
  return false;
}
async function playYouTubeIframe(track,startAt=0){
  try{await loadYouTubeApi();}catch{toast('No se pudo cargar el reproductor de YouTube');return false;}
  try{els.audio.pause();}catch{}try{els.directAudio?.pause();}catch{}try{els.ytAudio?.pause();}catch{}try{els.ytVideo?.pause();}catch{}clearRemoteStage();state.currentEngine='youtube';state.ytEngine='iframe';state.ytDelegated=track.sourceKind==='youtube-playlist';if(state.ytDelegated)state.ytDelegatedSourceId=track.id;els.remoteDock.classList.remove('is-hidden');syncRemoteDockSize();els.remoteLabel.textContent=track.sourceKind==='youtube-playlist'?'YOUTUBE · PLAYLIST':'YOUTUBE';els.remoteIframeSlot.innerHTML='<div id="ytMainPlayer"></div>';ytShowSlot('iframe');requestAnimationFrame(restoreRemoteDockPosition);
  return new Promise(resolve=>{
    let settled=false,timer=null,retryTimer=null,everStarted=false;const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);clearInterval(retryTimer);resolve(ok);};
    // R10.12: 15s de gracia (antes 12s) y NO marcar fallo si el reproductor está
    // cargando/buffering — un fallo prematuro quemaba la cola entera.
    timer=setTimeout(()=>{if(settled)return;if(everStarted){finish(true);return;}try{const st=ytPlayer?.getPlayerState?.();if(st===YT.PlayerState.BUFFERING||st===YT.PlayerState.PLAYING){finish(true);return;}}catch{}console.debug('youtube start timeout',track.remoteId);finish(false);},15000);
    ytPlayer=new YT.Player('ytMainPlayer',{width:'100%',height:'100%',videoId:track.sourceKind==='youtube'?track.remoteId:undefined,playerVars:{autoplay:0,playsinline:1,controls:1,rel:0,...(location.origin&&location.origin!=='null'?{origin:location.origin}:{})},events:{
      onReady:async e=>{try{const frame=e.target.getIframe?.();if(frame){frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');frame.referrerPolicy='strict-origin-when-cross-origin';}e.target.setVolume(Math.round(state.volume*100));const resumeAt=Math.max(Number(startAt)||0,podcastResumePosition(track));if(isPodcastTrack(track))try{e.target.setPlaybackRate(state.podcastRate);}catch{}if(track.sourceKind==='youtube-playlist')e.target.loadPlaylist({listType:'playlist',list:track.remoteId,index:0,startSeconds:0});else{if(resumeAt)try{e.target.seekTo(resumeAt,true);}catch{}e.target.playVideo();}if(track.sourceKind==='youtube'&&/^YouTube ·/.test(track.title)){const data=e.target.getVideoData?.()||{};if(data.title){track.title=data.title;track.artist=data.author||'YouTube';await saveRemoteTrack(track);render();}}
      // R10.12: reintentos de playVideo() — Chrome a veces ignora el primer
      // playVideo() sin gesto reciente; reintentar cada 1.3s hasta 6 veces.
      let tries=0;retryTimer=setInterval(()=>{if(settled)return clearInterval(retryTimer);try{const st=e.target.getPlayerState();if(st===YT.PlayerState.PLAYING||st===YT.PlayerState.BUFFERING)return clearInterval(retryTimer);if(tries++<6)e.target.playVideo();else clearInterval(retryTimer);}catch{clearInterval(retryTimer);}},1300);}
      catch(err){console.debug('youtube play',err);finish(false);}},
      onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){everStarted=true;state.playing=true;startProgressTimer();syncMediaPlaybackState();renderPlayer();finish(true);if(state.ytDelegated)syncDelegatedPlaylistIndex();}else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.CUED){state.playing=false;syncMediaPlaybackState();renderPlayer();}else if(e.data===YT.PlayerState.ENDED){state.playing=false;syncMediaPlaybackState();renderPlayer();if(state.ytDelegated){advanceDelegatedPlaylist();}else{handleNaturalEnd();}}},
      onError:e=>{console.debug('youtube player error',e.data);track.lastPlaybackError=`YouTube ${e.data}`;track.lastPlaybackErrorAt=now();saveRemoteTrack(track);if(settled){handleRuntimePlaybackFailure(track,`YouTube ${e.data}`);}else finish(false);}
    }});
  });
}
function loadSoundCloudApi(){if(window.SC?.Widget)return Promise.resolve(window.SC);if(scApiPromise)return scApiPromise;scApiPromise=loadScript('https://w.soundcloud.com/player/api.js','soundcloud-widget-api').then(()=>window.SC);return scApiPromise;}
async function fetchSoundCloudMeta(url){try{const r=await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||cleanName(new URL(url).pathname.split('/').pop()),artist:d.author_name||'SoundCloud',thumbnail:d.thumbnail_url||''};}catch{return null;}}
async function playSoundCloud(track,startAt=0){
  try{await loadSoundCloudApi();}catch{toast('No se pudo cargar SoundCloud');return false;}
  try{els.audio.pause();}catch{}try{els.directAudio?.pause();}catch{}try{els.ytAudio?.pause();}catch{}try{els.ytVideo?.pause();}catch{}clearRemoteStage();state.currentEngine='soundcloud';els.remoteDock.classList.remove('is-hidden');syncRemoteDockSize();els.remoteLabel.textContent='SOUNDCLOUD';els.remoteIframeSlot.innerHTML='';ytShowSlot('iframe');requestAnimationFrame(restoreRemoteDockPosition);const iframe=document.createElement('iframe');iframe.allow='autoplay';iframe.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.remoteUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;els.remoteIframeSlot.appendChild(iframe);
  return new Promise(resolve=>{let settled=false,timer=setTimeout(()=>{if(!settled){settled=true;resolve(false);}},9500);const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok);};iframe.onload=()=>{try{scWidget=SC.Widget(iframe);const E=SC.Widget.Events;scWidget.bind(E.READY,()=>{scWidget.setVolume(Math.round(state.volume*100));const resumeAt=Math.max(Number(startAt)||0,podcastResumePosition(track));if(resumeAt)try{scWidget.seekTo(resumeAt*1000);}catch{}scWidget.play();scWidget.getCurrentSound(async s=>{if(s){track.title=s.title||track.title;track.artist=s.user?.username||track.artist;track.duration=(s.duration||0)/1000;await saveRemoteTrack(track);render();}});});scWidget.bind(E.PLAY,()=>{state.playing=true;syncMediaPlaybackState();renderPlayer();finish(true);});scWidget.bind(E.PAUSE,()=>{state.playing=false;syncMediaPlaybackState();renderPlayer();});scWidget.bind(E.FINISH,()=>{state.playing=false;syncMediaPlaybackState();handleNaturalEnd();});if(E.ERROR)scWidget.bind(E.ERROR,()=>{track.lastPlaybackError='SoundCloud no disponible';if(settled)handleRuntimePlaybackFailure(track,'SoundCloud no disponible');else finish(false);});scProgressTimer=setInterval(()=>{scWidget?.getPosition?.(ms=>{const d=track.duration||0;sampleListenSession(ms/1000,d);els.timeNow.textContent=formatTime(ms/1000);els.timeTotal.textContent=formatTime(d);els.progressRange.value=d?String((ms/1000/d)*100):'0';});},700);}catch{finish(false);}};});
}

async function handleRuntimePlaybackFailure(track,reason='No disponible'){
  if(!track||playbackFailureChain.has(track.id))return;if(state.listenSession?.trackId===track.id)await finalizeListenSession('error');playbackFailureChain.add(track.id);track.lastPlaybackError=reason;track.lastPlaybackErrorAt=now();track.playbackFailureCount=(track.playbackFailureCount||0)+1;await saveRemoteTrack(track).catch(()=>{});recordHistory('playback_error',track,{reason});
  // R10.12 · PARADA SUAVE en avances automáticos: si la pista anterior TAMBIÉN
  // acabó de fallar encadenada, no quemar la cola completa saltando pista tras
  // pista (era la causa de "suena la primera y se detiene"). Detener y pedir un toque.
  const auto=state.autoAdvanceDepth>0;
  if(auto){state.autoFailStreak++;if(state.autoFailStreak>=2){state.playing=false;renderPlayer();syncMediaPlaybackState();toast('La lista no pudo continuar automáticamente · toca Play para reintentar',5200);return;}}
  // R10.12 · ÚLTIMO RECURSO para playlists de YouTube: si la cola propia falla
  // dos veces seguidas, delegar al reproductor visible de YouTube (loadPlaylist),
  // que es el modo que funcionaba antes. Con índice explícito y startSeconds:0
  // la canción SIEMPRE empieza completa.
  if(auto&&state.ytPlaylistSourceId){const plTrack=state.tracks.find(t=>t.id===state.ytPlaylistSourceId);const ctx=uniquePlayableIds(state.queueIds.length?state.queueIds:(state.baseQueueIds.length?state.baseQueueIds:[]));if(plTrack&&plTrack.remoteId&&ctx.length>1){state.ytPlaylistSourceId='';toast('Usando el reproductor de YouTube para la lista…',3200);const ok=await playYouTubeIframe(plTrack,0).catch(()=>false);if(ok)return;}}
  if(!state.queueIds.includes(track.id)&&state.manualQueueIds.length){toast('Pista en cola no disponible · probando la siguiente…',2200);return nextTrack({skipFinalize:true});}
  const context=uniquePlayableIds(state.queueIds.length?state.queueIds:(state.baseQueueIds.length?state.baseQueueIds:currentModeContextIds()));
  if(context.length<=1||playbackFailureChain.size>=context.length){state.playing=false;renderPlayer();return toast('No encontré otra pista disponible en esta cola',4200);}
  let idx=Math.max(-1,context.indexOf(track.id)),next='';for(let step=1;step<=context.length;step++){const candidate=context[(idx+step+context.length)%context.length];if(candidate&&!playbackFailureChain.has(candidate)){next=candidate;break;}}
  if(!next){state.playing=false;renderPlayer();return toast('No quedan pistas reproducibles en esta cola',4200);}
  toast('Pista no disponible · saltando a la siguiente…',2200);await playTrack(next,context,{skipFinalize:true,preserveBase:true});
}

// R10.12 · Modo delegado (último recurso): YouTube gestiona el avance de SU lista
// dentro del iframe. La app se sincroniza con el índice real y NO duplica el avance.
function syncDelegatedPlaylistIndex(){
  try{
    if(!state.ytDelegated||!state.ytDelegatedSourceId)return;
    const i=ytPlayer?.getPlaylistIndex?.();if(!Number.isInteger(i)||i<0)return;
    const src=state.tracks.find(t=>t.id===state.ytDelegatedSourceId);if(!src)return;
    const ids=youTubePlaylistQueueIds(src);if(!ids.length)return;
    const id=ids[Math.min(i,ids.length-1)];
    if(id&&id!==state.currentId){state.currentId=id;state.queueIndex=state.queueIds.indexOf(id);render();}
  }catch{}
}
function advanceDelegatedPlaylist(){
  // YouTube ya pasó a la siguiente dentro de su lista: sincronizar cuando el
  // índice interno se actualice (varios intentos por si el ENDED llega antes).
  [500,1500,3000,5000].forEach(ms=>setTimeout(()=>syncDelegatedPlaylistIndex(),ms));
}

function youTubePlaylistQueueIds(virtualTrack){
  // R10.11: convierte una pista virtual youtube-playlist en la cola real de
  // canciones individuales importadas, para que la app controle el avance.
  const pid=virtualTrack?.remoteId||(virtualTrack?.externalRef?.playlistId)||'';
  if(!pid)return [];
  const pl=state.playlists.find(p=>(p.sources||[]).some(s=>s.playlistId===pid)||p.externalRef?.playlistId===pid);
  const ids=(pl?.trackIds||[]).map(cid=>state.tracks.find(t=>t.id===cid)).filter(t=>t&&playable(t)&&t.sourceKind==='youtube').map(t=>t.id);
  return [...new Set(ids)];
}
async function playTrack(id,contextIds=null,{skipFinalize=false,preserveBase=false,fromHistory=false,resumeAt=0,_ytExpanded=false}={}){
  const entryTrack=state.tracks.find(t=>t.id===id);
  // R10.11 FIX: las playlists de YouTube se reproducen como cola propia de la app.
  // Antes se delegaba al reproductor interno de YouTube (loadPlaylist), que avanzaba
  // canciones por su cuenta y retomaba "por donde iba" en videos ya vistos: doble
  // avance, metadatos atascados en el nombre de la lista y canciones a medias.
  if(entryTrack?.sourceKind==='youtube-playlist'&&!_ytExpanded){
    const ids=youTubePlaylistQueueIds(entryTrack);
    state.ytPlaylistSourceId=entryTrack.id;state.ytDelegated=false;state.ytDelegatedSourceId='';
    if(ids.length){const first=ids[0];return playTrack(first,ids,{skipFinalize,preserveBase,fromHistory,resumeAt:0,_ytExpanded:true});}
  }else if(entryTrack?.sourceKind!=='youtube'&&entryTrack?.sourceKind!=='youtube-playlist')state.ytPlaylistSourceId='';
  // R10.12: un toque del usuario SIEMPRE reintenta la resolución completa —
  // la caché negativa solo evita re-sondeos durante los avances automáticos.
  if(state.autoAdvanceDepth===0){const t0=state.tracks.find(t=>t.id===id);if(t0?.remoteId)ytNegCache.delete(t0.remoteId);}
  const track=state.tracks.find(t=>t.id===id);if(!track)return;if(!playable(track)){toast(track.sourceMissing?'Vuelve a cargar este archivo local para reactivarlo':'Esta fuente está guardada como referencia, pero aún no tiene reproductor integrado');return;}
  if(window.MP_LIVE_RADIO?.isActive?.()){const liveOk=await window.MP_LIVE_RADIO.prepareExternalSwitch();if(!liveOk)return;}
  if(state.listenSession&&!skipFinalize)await finalizeListenSession('switch');
  stopAllEngines();const clean=uniquePlayableIds(contextIds&&contextIds.length?contextIds:[id]);if(!preserveBase){state.baseQueueIds=[...clean];state.modePlayedIds=[id];state.queueIds=state.playbackMode===PLAY_MODES.normal?clean:prepareModeQueue(state.playbackMode,clean,id);state.queueIndex=Math.max(0,state.queueIds.indexOf(id));}else if(clean.includes(id)){state.queueIds=clean;state.queueIndex=Math.max(0,state.queueIds.indexOf(id));}else if(!state.queueIds.length){state.queueIds=clean;state.queueIndex=Math.max(-1,state.queueIds.indexOf(id));}state.currentId=id;
  if(!fromHistory){if(state.navHistory[state.navHistory.length-1]!==id)state.navHistory.push(id);if(state.navHistory.length>200)state.navHistory.shift();}
  if(!state.modePlayedIds.includes(id))state.modePlayedIds.push(id);if(state.modePlayedIds.length>500)state.modePlayedIds.shift();
  let ok=false;if(track.sourceKind==='local'||track.sourceKind==='direct')ok=await playLocalOrDirect(track,resumeAt);else if(track.sourceKind==='youtube'||track.sourceKind==='youtube-playlist')ok=await playYouTube(track,resumeAt);else if(track.sourceKind==='soundcloud')ok=await playSoundCloud(track,resumeAt);
  if(ok){playbackFailureChain.clear();track.lastPlaybackError='';state.firstRunComplete=true;state.autoFailStreak=0;if(!state.ytDelegated)state.ytDelegatedSourceId='';await beginListenSession(track);await persistPrefs();setupMediaSession();render();}
  else if(['youtube','youtube-playlist','soundcloud','direct'].includes(track.sourceKind)){await handleRuntimePlaybackFailure(track,track.lastPlaybackError||'La fuente no respondió');}
}
async function togglePlay(){if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.togglePlay();const t=getCurrentTrack();if(!t){const ids=currentModeContextIds();if(!ids.length)return toast('Primero carga o importa música');const order=prepareModeQueue(state.playbackMode,ids,'');state.baseQueueIds=[...ids];return order[0]?playTrack(order[0],order,{preserveBase:true}):null;}if(state.ytService){window.HappyNative?.postFromWeb?.(JSON.stringify({type:state.playing?'media/pause':'media/resume'}));return;}if(state.currentEngine==='none'||(t.sourceKind==='local'&&!els.audio.src)||(t.sourceKind==='direct'&&!els.directAudio?.src)||(t.sourceKind==='youtube'&&state.ytEngine==='native'&&!ytNativeElement()?.src)||(t.sourceKind==='youtube'&&!ytPlayer&&!['native','service'].includes(state.ytEngine))||(t.sourceKind==='soundcloud'&&!scWidget))return playTrack(t.id,state.queueIds.length?state.queueIds:[t.id],{preserveBase:true});if(state.currentEngine==='youtube'&&state.ytEngine==='native'){const el=ytNativeElement();if(el?.paused){try{await el.play();}catch{}}else el?.pause();return;}if(state.currentEngine==='youtube'&&ytPlayer){const st=ytPlayer.getPlayerState();st===YT.PlayerState.PLAYING?ytPlayer.pauseVideo():ytPlayer.playVideo();return;}if(state.currentEngine==='soundcloud'&&scWidget){scWidget.toggle();return;}const a=activeNativeAudio();if(a?.paused){try{await a.play();}catch{}}else a?.pause();}
async function nextTrack({skipFinalize=false}={}){
  if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.next();
  while(state.manualQueueIds.length){const manualId=state.manualQueueIds.shift();if(!state.tracks.some(t=>t.id===manualId&&playable(t)))continue;await persistPrefs();const ctx=state.queueIds.length?state.queueIds:currentModeContextIds();await playTrack(manualId,ctx.length?ctx:[manualId],{skipFinalize,preserveBase:true});return;}
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
async function prevTrack(){if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.previous();if(state.currentEngine==='local'||state.currentEngine==='direct'){const a=activeNativeAudio();if((a?.currentTime||0)>4){a.currentTime=0;return;}}if(state.navHistory.length>=2){state.navHistory.pop();const id=state.navHistory[state.navHistory.length-1];return playTrack(id,state.queueIds.length?state.queueIds:[id],{preserveBase:true,fromHistory:true});}if(!state.queueIds.length)return;state.queueIndex=(state.queueIndex-1+state.queueIds.length)%state.queueIds.length;await playTrack(state.queueIds[state.queueIndex],state.queueIds,{preserveBase:true,fromHistory:true});}
function queueTrack(id,{next=false}={}){if(!id||!state.tracks.some(t=>t.id===id&&playable(t)))return;const existing=state.manualQueueIds.indexOf(id);if(existing>=0)state.manualQueueIds.splice(existing,1);next?state.manualQueueIds.unshift(id):state.manualQueueIds.push(id);persistPrefs();renderPlayer();toast(next?'Va a continuación':`Añadido a la cola · ${state.manualQueueIds.length} pendiente${state.manualQueueIds.length===1?'':'s'}`);}
function cleanManualQueue(){
  state.manualQueueIds=state.manualQueueIds.filter((id,i,a)=>a.indexOf(id)===i&&state.tracks.some(t=>t.id===id&&playable(t)));
  return state.manualQueueIds;
}
function automaticUpcomingIds(limit=18){
  const context=uniquePlayableIds(state.queueIds.length?state.queueIds:(state.baseQueueIds.length?state.baseQueueIds:currentModeContextIds()));
  if(!context.length)return[];
  let idx=state.currentId?context.indexOf(state.currentId):-1;
  if(idx<0&&Number.isInteger(state.queueIndex))idx=Math.max(-1,Math.min(state.queueIndex,context.length-1));
  let ids=context.slice(idx+1);
  if(!ids.length&&state.playbackMode!==PLAY_MODES.normal&&context.length>1)ids=context.filter(id=>id!==state.currentId);
  const manual=new Set(cleanManualQueue());
  return ids.filter(id=>!manual.has(id)&&id!==state.currentId).slice(0,limit);
}
function renderQueueSheet(root){
  cleanManualQueue();
  const current=getCurrentTrack(),manual=state.manualQueueIds.map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean),auto=automaticUpcomingIds();
  const manualHtml=manual.length?manual.map((t,i)=>`<div class="queue-item" data-qid="${t.id}"><button class="queue-main" data-q-play="${t.id}"><span>${i+1}</span><div><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></div></button><div class="queue-tools"><button data-q-up="${i}" ${i===0?'disabled':''} title="Subir">↑</button><button data-q-down="${i}" ${i===manual.length-1?'disabled':''} title="Bajar">↓</button><button data-q-remove="${t.id}" title="Quitar">×</button></div></div>`).join(''):'<div class="queue-empty">No has añadido canciones manualmente.</div>';
  const autoHtml=auto.length?auto.map((id,i)=>{const t=state.tracks.find(x=>x.id===id);return t?`<button class="queue-auto-item" data-q-auto="${t.id}"><span>${i+1}</span><div><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}</small></div></button>`:'';}).join(''):'<div class="queue-empty">No hay continuación automática.</div>';
  root.innerHTML=`<h2 class="sheet-title">≡ Cola de reproducción</h2><p class="sheet-copy">La cola manual tiene prioridad. Debajo puedes ver qué seguirá según el modo o playlist activa.</p>${current?`<div class="queue-now"><small>SONANDO AHORA</small><strong>${safeText(current.title)}</strong><span>${safeText(current.artist||sourceLabel(current))}</span></div>`:''}<div class="queue-section-title"><span>COLA MANUAL · ${manual.length}</span>${manual.length?'<button data-q-clear>Vaciar</button>':''}</div><div class="queue-list">${manualHtml}</div><div class="queue-section-title"><span>DESPUÉS · ${auto.length}</span></div><div class="queue-list queue-auto-list">${autoHtml}</div>`;
  $$('[data-q-play]',root).forEach(b=>b.onclick=async()=>{const id=b.dataset.qPlay;state.manualQueueIds=state.manualQueueIds.filter(x=>x!==id);await persistPrefs();closeDialog(els.sheetDialog);const ctx=state.queueIds.length?state.queueIds:currentModeContextIds();await playTrack(id,ctx.length?ctx:[id],{preserveBase:true});});
  $$('[data-q-auto]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);const id=b.dataset.qAuto,ctx=state.queueIds.length?state.queueIds:currentModeContextIds();playTrack(id,ctx.length?ctx:[id],{preserveBase:true});});
  $$('[data-q-up]',root).forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.qUp);if(i>0)[state.manualQueueIds[i-1],state.manualQueueIds[i]]=[state.manualQueueIds[i],state.manualQueueIds[i-1]];await persistPrefs();renderPlayer();renderQueueSheet(root);});
  $$('[data-q-down]',root).forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.qDown);if(i>=0&&i<state.manualQueueIds.length-1)[state.manualQueueIds[i+1],state.manualQueueIds[i]]=[state.manualQueueIds[i],state.manualQueueIds[i+1]];await persistPrefs();renderPlayer();renderQueueSheet(root);});
  $$('[data-q-remove]',root).forEach(b=>b.onclick=async()=>{state.manualQueueIds=state.manualQueueIds.filter(id=>id!==b.dataset.qRemove);await persistPrefs();renderPlayer();renderQueueSheet(root);});
  $('[data-q-clear]',root)?.addEventListener('click',async()=>{state.manualQueueIds=[];await persistPrefs();renderPlayer();renderQueueSheet(root);toast('Cola manual vaciada');});
}
function openQueueSheet(){openSheet('<div></div>',root=>renderQueueSheet(root));}
async function toggleRepeatOne(id=state.currentId){if(!id||!state.tracks.some(t=>t.id===id))return;state.repeatOneId=state.repeatOneId===id?'':id;await persistPrefs();render();toast(state.repeatOneId===id?'↻1 Repetir canción activado':'Repetición desactivada');}
async function toggleFavorite(id=state.currentId){if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.toggleFavorite();const t=state.tracks.find(x=>x.id===id);if(!t)return;t.favorite=!t.favorite;await saveRemoteTrack(t);recordHistory(t.favorite?'favorite':'unfavorite',t);render();toast(t.favorite?'Añadida a Favoritos ♥':'Quitada de Favoritos');}
async function removeTrack(id){const t=state.tracks.find(x=>x.id===id);if(!t)return;const storedSrc=state.storageReady?await db.get('sources',id).catch(()=>null):null;if(storedSrc?.kind==='opfs')await deleteOpfsSource(storedSrc);sessionFiles.delete(id);state.tracks=state.tracks.filter(x=>x.id!==id);for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).filter(x=>x!==id);await persistPlaylist(pl);}if(state.currentId===id){stopAllEngines();clearRemoteStage();els.audio.removeAttribute('src');els.directAudio?.removeAttribute('src');state.currentId=null;state.currentEngine='none';}state.queueIds=state.queueIds.filter(x=>x!==id);state.baseQueueIds=state.baseQueueIds.filter(x=>x!==id);state.manualQueueIds=state.manualQueueIds.filter(x=>x!==id);if(state.repeatOneId===id)state.repeatOneId='';if(state.storageReady){await db.delete('tracks',id).catch(()=>{});await db.delete('sources',id).catch(()=>{});await db.delete('covers',id).catch(()=>{});}if(artworkCache.has(id)){try{URL.revokeObjectURL(artworkCache.get(id));}catch{}artworkCache.delete(id);}render();toast('Audio eliminado de MUSIC PLAY');}
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

async function addManyToPlaylist(trackIds,playlistId,{silent=false}={}){
  const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return null;
  const valid=[...new Set(trackIds||[])].filter(id=>state.tracks.some(t=>t.id===id));
  const before=pl.trackIds.length;pl.trackIds=[...new Set([...(pl.trackIds||[]),...valid])];pl.updatedAt=now();
  await persistPlaylist(pl);const added=pl.trackIds.length-before;
  if(state.activeView==='library'&&state.libraryTab==='playlists')renderPlaylists();
  if(!silent)toast(added?`${added} ${added===1?'canción añadida':'canciones añadidas'} a ${pl.name}`:'Esas canciones ya estaban en la playlist');
  return {playlist:pl,added};
}
function sortedPlaylistsForPicker(){return [...state.playlists].sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));}
function openBatchPlaylistPicker(ids,{title='Añadir a playlist',afterAdd=null}={}){
  const clean=[...new Set(ids||[])].filter(id=>state.tracks.some(t=>t.id===id));if(!clean.length)return toast('No hay canciones para añadir');
  const buttons=sortedPlaylistsForPicker().map(pl=>`<button class="sheet-btn" data-batch-pl="${pl.id}">≡ ${safeText(pl.name)}<small>${(pl.trackIds||[]).length} canciones · añadir ${clean.length}</small></button>`).join('');
  openSheet(`<h2 class="sheet-title">${safeText(title)}</h2><p class="sheet-copy">Elige el destino. MUSIC PLAY añade todo el lote de una sola vez.</p><div class="sheet-stack">${buttons||'<p class="sheet-copy">Aún no tienes playlists.</p>'}<button class="sheet-btn" data-batch-new>＋ Nueva playlist<small>Crear una lista con esta carga</small></button></div>`,root=>{
    $$('[data-batch-pl]',root).forEach(b=>b.onclick=async()=>{const targetId=b.dataset.batchPl;const res=await addManyToPlaylist(clean,targetId,{silent:true});closeDialog(els.sheetDialog);if(res){state.activePlaylistId=targetId;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();toast(`✓ ${res.added||clean.length} añadidas a ${res.playlist.name}`);afterAdd?.(res.playlist);}});
    $('[data-batch-new]',root).onclick=async()=>{closeDialog(els.sheetDialog);setTimeout(()=>openCreateFromLibrarySheet(clean),40);};
  });
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
  const allAvailable=[...state.tracks].filter(t=>!pl.trackIds.includes(t.id)).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
  const recentIds=new Set((state.lastImportIds||[]).filter(id=>allAvailable.some(t=>t.id===id)));
  const selected=new Set(recentIds);let limit=80,query='';
  openSheet(`<h2 class="sheet-title">Añadir canciones</h2><p class="sheet-copy">Busca en tu biblioteca o añade algo nuevo directamente a <b>${safeText(pl.name)}</b>.</p>
  <div class="add-source-grid"><button class="tiny-btn" data-src-lib>♪ Biblioteca</button><button class="tiny-btn" data-src-file>＋ Archivo</button><button class="tiny-btn" data-src-folder>⌂ Carpeta</button><button class="tiny-btn" data-src-link>🔗 Enlace</button></div>
  <label class="bulk-search"><span>⌕</span><input id="addSongsSearch" type="search" placeholder="Buscar canción, artista, álbum o género" autocomplete="off"/></label>
  <div class="bulk-select-tools"><button class="tiny-btn" data-recent ${recentIds.size?'':'disabled'}>Esta carga</button><button class="tiny-btn" data-all>Todo visible</button><span id="bulkCount">0 seleccionadas</span></div>
  <div id="bulkTrackList" class="bulk-track-list"></div><button id="bulkMore" class="tiny-btn is-hidden" type="button">Mostrar más</button><button class="sheet-btn" data-add-selected>＋ Añadir seleccionadas</button>`,root=>{
    const listEl=$('#bulkTrackList',root),more=$('#bulkMore',root),count=$('#bulkCount',root),search=$('#addSongsSearch',root);
    const filtered=()=>{const q=query.trim().toLowerCase();const list=importFirstList(allAvailable);return q?list.filter(t=>[t.title,t.artist,t.album,t.genre].join(' ').toLowerCase().includes(q)):list;};
    const updateCount=()=>{count.textContent=`${selected.size} seleccionadas`;};
    const draw=()=>{const list=filtered(),shown=list.slice(0,limit);listEl.innerHTML=shown.length?'':'<p class="sheet-copy">Sin canciones disponibles con ese filtro.</p>';for(const t of shown){const lab=document.createElement('label');lab.className=`bulk-track${recentIds.has(t.id)?' import-fresh':''}`;lab.innerHTML=`<input type="checkbox" value="${t.id}" ${selected.has(t.id)?'checked':''}/><span><strong>${safeText(t.title)}</strong><small>${safeText(t.artist||sourceLabel(t))}${recentIds.has(t.id)?' · recién cargada':''}</small></span>`;const c=$('input',lab);c.onchange=()=>{c.checked?selected.add(t.id):selected.delete(t.id);updateCount();};listEl.appendChild(lab);}more.classList.toggle('is-hidden',list.length<=limit);more.textContent=`Mostrar más · ${Math.min(limit,list.length)}/${list.length}`;updateCount();};
    search.oninput=()=>{query=search.value;limit=80;draw();};
    $('[data-recent]',root).onclick=()=>{selected.clear();for(const id of recentIds)selected.add(id);draw();};
    $('[data-all]',root).onclick=()=>{for(const t of filtered().slice(0,limit))selected.add(t.id);draw();};
    more.onclick=()=>{limit+=80;draw();};
    $('[data-src-lib]',root).onclick=()=>{search.focus();};
    $('[data-src-file]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles({targetPlaylistId:pl.id,label:`Archivos para ${pl.name}`});};
    $('[data-src-folder]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder({targetPlaylistId:pl.id,label:`Carpeta para ${pl.name}`});};
    $('[data-src-link]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet('',pl.id);};
    $('[data-add-selected]',root).onclick=async()=>{const ids=[...selected];if(!ids.length)return toast('Selecciona al menos una canción');const res=await addManyToPlaylist(ids,pl.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();toast(`${res?.added||ids.length} canciones añadidas`);};
    draw();setTimeout(()=>search.focus(),80);
  });
}

async function createPlaylistFromBatch(ids,name){
  const cleanIds=[...new Set(ids||[])].filter(id=>state.tracks.some(t=>t.id===id));if(!cleanIds.length)return null;
  const pl=await createPlaylist(name||state.lastImportLabel||'Nueva playlist');await addManyToPlaylist(cleanIds,pl.id,{silent:true});return pl;
}
function openPostImportSheet(ids,label='Última carga',targetPlaylistId=''){
  const count=(ids||[]).length;if(!count)return;
  state.lastImportIds=[...ids];state.lastImportLabel=(label||'Última carga').slice(0,60);state.lastImportAt=now();
  const target=targetPlaylistId?state.playlists.find(p=>p.id===targetPlaylistId):null;
  if(target){
    openSheet(`<h2 class="sheet-title">✓ ${count} ${count===1?'archivo listo':'archivos listos'}</h2><p class="sheet-copy">Vienes de <b>${safeText(target.name)}</b>. Puedes añadir toda esta carga con un toque.</p><div class="sheet-stack"><button class="sheet-btn" data-target-add>＋ Añadir ${count} a ${safeText(target.name)}<small>Una sola operación, sin seleccionar canción por canción</small></button><button class="sheet-btn" data-target-review>☑ Revisar antes<small>La nueva carga queda preseleccionada</small></button><button class="sheet-btn" data-target-other>≡ Otra playlist<small>Elegir otro destino</small></button><button class="sheet-btn" data-target-library>♪ Biblioteca<small>Guardar sin añadir todavía</small></button></div>`,root=>{
      $('[data-target-add]',root).onclick=async()=>{const res=await addManyToPlaylist(ids,target.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=target.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();toast(`✓ ${res?.added||count} añadidas a ${target.name}`);};
      $('[data-target-review]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openAddSongsToPlaylistSheet(target.id),60);};
      $('[data-target-other]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openBatchPlaylistPicker(ids,{title:`Añadir ${count} a…`}),40);};
      $('[data-target-library]',root).onclick=()=>{closeDialog(els.sheetDialog);state.libraryTab='songs';showView('library');};
    });return;
  }
  openSheet(`<h2 class="sheet-title">✓ ${count} ${count===1?'archivo listo':'archivos listos'}</h2><p class="sheet-copy">Esta carga queda identificada para que no tengas que volver a escoger canción por canción.</p><div class="sheet-stack"><button class="sheet-btn" data-batch-existing>＋ Añadir a playlist existente<small>Elige una lista y añade los ${count} de una vez</small></button><button class="sheet-btn" data-batch-create>≡ Crear playlist con ${count}<small>Usa toda esta carga de una vez</small></button><button class="sheet-btn" data-batch-review>☑ Revisar selección<small>${count} aparecen preseleccionadas y primero</small></button><button class="sheet-btn" data-batch-library>♪ Ir a biblioteca<small>Seguir sin crear playlist</small></button></div>`,root=>{
    $('[data-batch-existing]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openBatchPlaylistPicker(ids,{title:`Añadir ${count} a playlist`}),40);};
    $('[data-batch-create]',root).onclick=async()=>{const pl=await createPlaylistFromBatch(ids,state.lastImportLabel);closeDialog(els.sheetDialog);if(pl){state.activePlaylistId=pl.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();toast(`Playlist creada · ${count} canciones`);}};
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
  const ids=getPlaylistTracks(pl).filter(playable).map(t=>t.id);if(!ids.length)return toast('Esta playlist no tiene canciones reproducibles');const pending=state.manualQueueIds.filter(id=>!ids.includes(id));state.manualQueueIds=[...ids,...pending];persistPrefs();toast(`${ids.length} ${playlistContentType(pl)==='podcast'?'episodios':'canciones'} van a continuación`);
}
function addPlaylistToQueue(pl){
  const ids=getPlaylistTracks(pl).filter(playable).map(t=>t.id);if(!ids.length)return toast('Esta playlist no tiene canciones reproducibles');let added=0;for(const id of ids){if(!state.manualQueueIds.includes(id)){state.manualQueueIds.push(id);added++;}}persistPrefs();toast(`${added} añadidas a la cola · ${state.manualQueueIds.length} pendientes`);
}
async function togglePlaylistPin(pl){pl.pinned=!pl.pinned;await persistPlaylist(pl);renderHome();renderPlaylists();toast(pl.pinned?'Playlist fijada en Inicio':'Playlist quitada de Inicio');}
async function exportPlaylistM3U(pl){
  if(!pl)return;showLoader('Preparando exportación…','Completando títulos y referencias');try{await ensurePlaylistMetadata(pl,{quiet:true});const tracks=getPlaylistTracks(pl);downloadText(`${safeFileName(pl.name)}.m3u8`,m3uForTracks(pl.name,tracks),'audio/x-mpegurl;charset=utf-8');toast(`M3U8 exportada · ${tracks.length} canciones`);}finally{hideLoader();}
}
function openPlaylistMenuSheet(){
  const pl=getActivePlaylist();if(!pl)return;const isPodcast=playlistContentType(pl)==='podcast',unit=isPodcast?'episodios':'canciones';
  openSheet(`<h2 class="sheet-title">${safeText(pl.name)}</h2><p class="sheet-copy">Acciones rápidas para ${isPodcast?'este podcast':'esta playlist'}.</p><div class="sheet-stack"><button class="sheet-btn" data-add-library>＋ Añadir ${unit}<small>Buscar dentro de tu biblioteca</small></button><button class="sheet-btn" data-add-file>♪ Añadir archivo<small>Importar y dejarlo listo para esta colección</small></button><button class="sheet-btn" data-add-folder>⌂ Añadir carpeta<small>Importar una colección directamente aquí</small></button>${isPodcast?'':`<button class="sheet-btn" data-random>⇄ Reproducir aleatorio<small>Sin repetir hasta completar la vuelta</small></button>`}<button class="sheet-btn" data-search-pl>⌕ Buscar en ${isPodcast?'el podcast':'la playlist'}<small>Encuentra ${isPodcast?'episodio o autor':'canción o artista'}</small></button>${isPodcast?'':`<button class="sheet-btn" data-modes>✦ Comenzar Mix / modos<small>Radio, Redescubrir, Sorpréndeme y Cola Viva</small></button>`}<button class="sheet-btn" data-next-pl>→ Reproducir a continuación<small>Inserta la colección después de lo actual</small></button><button class="sheet-btn" data-queue-pl>≡ Añadir a la cola<small>Conserva lo que ya está sonando</small></button><button class="sheet-btn" data-content-type>${isPodcast?'♪ Tratar como playlist musical':'🎙 Marcar como podcast'}<small>${isPodcast?'Vuelve a mostrarla entre tus playlists musicales':'La separa de música y la muestra en Podcasts'}</small></button><button class="sheet-btn" data-pin>${pl.pinned?'⌂ Quitar de Inicio':'⌂ Fijar en Inicio'}<small>${pl.pinned?'Dejar de mostrarla entre tus accesos':'Acceso rápido en la portada'}</small></button><button class="sheet-btn" data-export>⇩ Exportar M3U8<small>Completa títulos de YouTube antes de exportar</small></button><button class="sheet-btn" data-rename>✎ Renombrar<small>Cambiar el nombre</small></button><button class="sheet-btn" data-link>🔗 Añadir enlace<small>Sumar otra fuente dentro de esta colección</small></button><button class="sheet-btn" data-delete>🗑 Eliminar ${isPodcast?'podcast':'playlist'}<small>No elimina los audios de la biblioteca</small></button></div>`,root=>{
    $('[data-add-library]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openAddSongsToPlaylistSheet(pl.id),40);};
    $('[data-add-file]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles({targetPlaylistId:pl.id,label:`Archivos para ${pl.name}`});};
    $('[data-add-folder]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder({targetPlaylistId:pl.id,label:`Carpeta para ${pl.name}`});};
    const random=$('[data-random]',root);if(random)random.onclick=async()=>{closeDialog(els.sheetDialog);await setPlaybackMode(PLAY_MODES.shuffle,{autoplay:true,contextIds:pl.trackIds||[]});};
    $('[data-search-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaylistSearchSheet(pl),40);};
    const modes=$('[data-modes]',root);if(modes)modes.onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaybackModesSheet({contextIds:pl.trackIds||[]}),40);};
    $('[data-next-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);insertPlaylistNext(pl);};
    $('[data-queue-pl]',root).onclick=()=>{closeDialog(els.sheetDialog);addPlaylistToQueue(pl);};
    $('[data-content-type]',root).onclick=async()=>{pl.contentType=isPodcast?'music':'podcast';pl.updatedAt=now();await persistPlaylist(pl);closeDialog(els.sheetDialog);renderPlaylists();renderHome();toast(isPodcast?'Movido a playlists musicales':'Marcado como podcast');};
    $('[data-pin]',root).onclick=async()=>{closeDialog(els.sheetDialog);await togglePlaylistPin(pl);};
    $('[data-export]',root).onclick=async()=>{closeDialog(els.sheetDialog);await exportPlaylistM3U(pl);};
    $('[data-rename]',root).onclick=()=>{root.innerHTML=`<h2 class="sheet-title">Renombrar</h2><input id="renamePlaylist" class="sheet-input" maxlength="60" value="${safeText(pl.name)}"/><button class="sheet-btn" data-save-name>Guardar</button>`;const input=$('#renamePlaylist',root);input.focus();$('[data-save-name]',root).onclick=async()=>{const v=input.value.trim();if(!v)return;pl.name=v.slice(0,60);pl.updatedAt=now();await persistPlaylist(pl);closeDialog(els.sheetDialog);renderPlaylists();renderHome();};};
    $('[data-link]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet('',pl.id,{preferPodcast:isPodcast});};
    $('[data-delete]',root).onclick=async()=>{closeDialog(els.sheetDialog);await deletePlaylist(pl);};
  });
}
async function startMix(trackIds){const base=uniquePlayableIds(trackIds);if(!base.length)return toast('No hay fuentes reproducibles para mezclar');state.baseQueueIds=[...base];state.playbackMode=PLAY_MODES.smart;state.shuffle=false;state.modePlayedIds=[];const order=prepareModeQueue(PLAY_MODES.smart,base,state.currentId&&base.includes(state.currentId)?state.currentId:'');state.queueIds=order;state.queueIndex=0;await persistPrefs();if(order[0])await playTrack(order[0],order,{preserveBase:true});toast('✦ Mix inteligente · gusto + escucha + descubrimiento');}

function openSheet(html,binder){els.sheetContent.innerHTML=html;$$('button',els.sheetContent).forEach(b=>b.type='button');openDialog(els.sheetDialog);binder?.(els.sheetContent);}
function openLoadSheet(){openSheet(`<h2 class="sheet-title">Cargar música</h2><p class="sheet-copy">Archivos, carpetas o enlaces. MUSIC PLAY decide cómo tratarlos.</p><div class="sheet-stack"><button class="sheet-btn" data-a="files">＋ Archivos<small>Audio o video local</small></button><button class="sheet-btn" data-a="folder">⌂ Carpeta<small>Biblioteca completa</small></button><button class="sheet-btn" data-a="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button><button class="sheet-btn" data-a="library">♪ Tu música<small>Ver biblioteca</small></button></div>`,root=>{$('[data-a="files"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};$('[data-a="folder"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};$('[data-a="link"]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};$('[data-a="library"]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');};});}
function openLibraryNewSheet(){openSheet(`<h2 class="sheet-title">＋ Nueva</h2><p class="sheet-copy">Una sola entrada para crear o añadir contenido.</p><div class="sheet-stack"><button class="sheet-btn" data-new="playlist">≡ Playlist<small>Crear una lista propia</small></button><button class="sheet-btn" data-new="podcast">🎙 Podcast<small>Añadir desde YouTube o Spotify</small></button><button class="sheet-btn" data-new="file">♪ Archivo<small>Añadir audio o video</small></button><button class="sheet-btn" data-new="folder">⌂ Carpeta<small>Indexar una colección completa</small></button><button class="sheet-btn" data-new="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button></div>`,root=>{root.querySelector('[data-new="playlist"]').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet();};root.querySelector('[data-new="podcast"]').onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet('','',{preferPodcast:true});};root.querySelector('[data-new="file"]').onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};root.querySelector('[data-new="folder"]').onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};root.querySelector('[data-new="link"]').onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};});}
function openTrackSheet(track,options={}){
  const pls=state.playlists.map(pl=>`<button class="sheet-btn" data-pl="${pl.id}">${playlistContentType(pl)==='podcast'?'🎙':'≡'} ${safeText(pl.name)}<small>Añadir esta ${playlistContentType(pl)==='podcast'?'pieza':'canción'}</small></button>`).join('');
  const external=track.remoteUrl?`<button class="sheet-btn" data-a="original">↗ Abrir fuente<small>${safeText(track.remoteUrl)}</small></button>`:'';
  const repeatActive=state.repeatOneId===track.id;
  const decW=window.MP_DECADES;const decInfo=decW?.getTrackDecade?.(track.id);const decLabel=decInfo?(decInfo.year?decInfo.year+' · '+decW.decadeLabel(decInfo.decade):(decInfo.source==='MANUAL'?'Manual':'Sin identificar')):'Sin identificar';
  const yearBtn='<button class="sheet-btn" data-a="year">📅 Editar año<small>Actual: '+safeText(decLabel)+'</small></button>';
  openSheet(`<h2 class="sheet-title">${safeText(track.title)}</h2><p class="sheet-copy">${safeText(track.artist||sourceLabel(track))} · ${sourceLabel(track)}</p><div class="sheet-stack">${playable(track)?'<button class="sheet-btn" data-a="play">▶ Reproducir<small>Escuchar ahora</small></button>':''}<button class="sheet-btn" data-a="next">→ Reproducir a continuación<small>Tendrá prioridad sobre Mix, Radio o Aleatorio</small></button><button class="sheet-btn" data-a="queue">≡ Añadir a la cola<small>Se reproducirá respetando el orden manual</small></button><button class="sheet-btn${repeatActive?' selected':''}" data-a="repeat">↻1 ${repeatActive?'Desactivar repetición':'Repetir esta canción'}<small>${repeatActive?'Volver a la secuencia normal':'Repetir hasta que lo desactives'}</small></button><button class="sheet-btn" data-a="fav">${track.favorite?'♥ Quitar favorito':'♡ Favorito'}<small>Marcar esta canción</small></button>${yearBtn}${external}${options.fromPlaylist&&!options.smart?'<button class="sheet-btn" data-a="remove-pl">− Quitar de playlist<small>No elimina la canción</small></button>':''}<button class="sheet-btn" data-a="delete">🗑 Eliminar<small>Quitar de MUSIC PLAY</small></button><div class="sheet-copy">Añadir a playlist</div>${pls}<button class="sheet-btn" data-a="new-pl">＋ Nueva playlist<small>Crear y añadir</small></button></div>`,root=>{
    const q=s=>$(`[data-a="${s}"]`,root);q('play')&&(q('play').onclick=()=>{closeDialog(els.sheetDialog);playTrack(track.id,getFilteredTracks().filter(playable).map(t=>t.id));});q('next').onclick=()=>{closeDialog(els.sheetDialog);queueTrack(track.id,{next:true});};q('queue').onclick=()=>{closeDialog(els.sheetDialog);queueTrack(track.id);};q('repeat').onclick=()=>{closeDialog(els.sheetDialog);toggleRepeatOne(track.id);};q('fav').onclick=()=>{closeDialog(els.sheetDialog);toggleFavorite(track.id);};q('year')&&(q('year').onclick=()=>{closeDialog(els.sheetDialog);const input=prompt('Año (ej: 1986)',decInfo?.year||'');if(input===null)return;const tr=input.trim();if(tr===''){decW?.clearManualYear?.(track.id);toast('Borrado');}else{const y=parseInt(tr,10);if(!Number.isFinite(y)||y<1900||y>2100){toast('No válido');return;}decW?.setManualYear?.(track.id,y);toast(y+' → '+decW.yearToDecade(y));}render();});
    q('original')&&(q('original').onclick=()=>window.open(track.remoteUrl,'_blank','noopener'));q('remove-pl')&&(q('remove-pl').onclick=()=>{closeDialog(els.sheetDialog);removeFromPlaylist(track.id,state.activePlaylistId);});q('delete').onclick=()=>{closeDialog(els.sheetDialog);removeTrack(track.id);};$$('[data-pl]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);addTrackToPlaylist(track.id,b.dataset.pl);});q('new-pl').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(track.id);};
  });
}
function openCreatePlaylistSheet(preselect=null){openSheet(`<h2 class="sheet-title">Nueva playlist</h2><p class="sheet-copy">Una lista propia, aunque mezcle archivos y enlaces.</p><input id="playlistNameInput" class="sheet-input" maxlength="60" placeholder="Ej: Rock, Estudio, Viaje"/><div class="sheet-stack"><button class="sheet-btn" data-save>Guardar playlist<small>Se queda en este dispositivo</small></button></div>`,root=>{const input=$('#playlistNameInput',root);input.focus();$('[data-save]',root).onclick=async()=>{const pl=await createPlaylist(input.value);if(!pl)return toast('Escribe un nombre');if(preselect)await addTrackToPlaylist(preselect,pl.id);closeDialog(els.sheetDialog);showView('playlist');};});}

function downloadText(filename,text,type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function safeFileName(name){return String(name||'music-play').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,80)||'music-play';}
function hasRecoveryData(){return !!(state.tracks.length||state.playlists.length||state.history.length||state.currentId||state.queueIds.length||state.baseQueueIds.length||state.manualQueueIds.length||state.repeatOneId||window.MP_LIVE_RADIO?.hasData?.());}
function recoveryPrefs(){return {currentId:state.currentId,queueIds:[...state.queueIds],baseQueueIds:[...state.baseQueueIds],manualQueueIds:[...state.manualQueueIds],repeatOneId:state.repeatOneId,queueIndex:state.queueIndex,volume:state.volume,activeView:state.activeView,activePlaylistId:state.activePlaylistId,activeSmartId:state.activeSmartId,theme:state.theme,libraryTab:state.libraryTab,librarySort:state.librarySort,firstRunComplete:state.firstRunComplete,playbackMode:state.playbackMode,shuffle:state.playbackMode===PLAY_MODES.shuffle,songCategories:[...state.songCategories],songSource:state.songSource,soundMode:state.soundMode,podcastRate:state.podcastRate,dailyRecommendationDate:state.dailyRecommendationDate,dailyRecommendationBand:state.dailyRecommendationBand,dailyRecommendationIds:[...state.dailyRecommendationIds]};}
async function buildRecoveryPayload(reason='manual'){
  let sourceManifest=[];
  if(state.storageReady){
    const raw=await db.getAll('sources').catch(()=>[]);
    sourceManifest=raw.map(src=>({id:src.id,kind:src.kind||'',opfsName:src.opfsName||'',name:src.name||'',type:src.type||'',lastModified:Number(src.lastModified)||0,size:Number(src.size)||0,portable:false}));
  }
  return {schema:'music-play-backup',version:6,app:'MUSIC PLAY FREE HAPPY',recovery:'Recovery Vault',build:BUILD,exportedAt:new Date().toISOString(),reason,summary:{tracks:state.tracks.length,playlists:state.playlists.length,history:state.history.length,favorites:state.tracks.filter(t=>t.favorite).length,localTracks:state.tracks.filter(t=>(t.sourceKind||'local')==='local').length},tracks:state.tracks.map(t=>({...normalizeTrack(t),sourceMissing:t.sourceKind==='local'?true:!!t.sourceMissing})),playlists:state.playlists.map(normalizePlaylist),history:state.history.slice(0,2500),prefs:recoveryPrefs(),sourceManifest,spProjects:window.MP_SP?.exportProjects?.()||[],radioData:window.MP_LIVE_RADIO?.exportData?.()||null};
}
function recoveryFileName(payload){
  const stamp=(payload?.exportedAt||new Date().toISOString()).replace(/[:.]/g,'-');
  const build=String(payload?.build||BUILD).replace(/^.*?(r\d[^-]*)-/i,'$1-').replace(/[^a-z0-9._-]+/gi,'-').slice(0,52);
  return `MUSIC-PLAY-FREE-HAPPY_RECOVERY_${build}_${stamp}.json`;
}
async function saveInternalRecovery(payload){
  if(!state.storageReady||!payload)return null;
  const row={id:`recovery:${Date.now()}:${remoteHash(payload.exportedAt||String(Date.now()))}`,createdAt:Date.now(),build:payload.build,reason:payload.reason,summary:payload.summary,payload};
  await db.put('backups',row).catch(()=>{});
  const rows=(await db.getAll('backups').catch(()=>[])).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  for(const old of rows.slice(8))await db.delete('backups',old.id).catch(()=>{});
  return row;
}
async function createRecoveryBackup({reason='manual',download=true,quiet=false}={}){
  if(!hasRecoveryData()){if(!quiet)toast('Todavía no hay biblioteca para respaldar');return null;}
  const payload=await buildRecoveryPayload(reason);
  await saveInternalRecovery(payload);
  if(download)downloadText(recoveryFileName(payload),JSON.stringify(payload,null,2),'application/json');
  if(!quiet)toast(download?'Recovery JSON creado · guárdalo con tus versiones':'Recovery interno creado');
  return payload;
}
async function exportBackup(){return createRecoveryBackup({reason:'manual',download:true});}
async function ensureVersionRecovery(){
  if(!state.storageReady)return;
  const meta=await db.get('prefs','recovery-meta').catch(()=>null);
  const hasData=hasRecoveryData();
  const firstGuard=!meta?.lastBuild;
  const buildChanged=!!(meta?.lastBuild&&meta.lastBuild!==BUILD);
  let payload=null;
  if(hasData&&(firstGuard||buildChanged))payload=await createRecoveryBackup({reason:buildChanged?'version-migration':'baseline-protection',download:true,quiet:true});
  await db.put('prefs',{key:'recovery-meta',lastBuild:BUILD,previousBuild:buildChanged?meta.lastBuild:(meta?.previousBuild||''),lastBackupAt:payload?Date.now():(meta?.lastBackupAt||0),lastBackupFile:payload?recoveryFileName(payload):(meta?.lastBackupFile||'')}).catch(()=>{});
  if(payload)setTimeout(()=>toast(buildChanged?'🛡 Respaldo automático creado antes de migrar':'🛡 Recovery Guard activado · respaldo automático creado',4200),700);
}
async function latestInternalRecovery(){
  if(!state.storageReady)return null;
  const rows=(await db.getAll('backups').catch(()=>[])).filter(x=>x?.payload?.schema==='music-play-backup').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  return rows[0]||null;
}
async function maybeOfferInternalRecovery(){
  if(hasRecoveryData())return;
  const latest=await latestInternalRecovery();
  if(!latest?.payload?.summary||(latest.payload.summary.tracks||0)+(latest.payload.summary.playlists||0)===0)return;
  openSheet(`<h2 class="sheet-title">🛡 Recuperación disponible</h2><p class="sheet-copy">MUSIC PLAY encontró un respaldo interno previo con <b>${latest.payload.summary.tracks||0}</b> canciones y <b>${latest.payload.summary.playlists||0}</b> playlists. La biblioteca activa está vacía; no se sobrescribirá el respaldo.</p><div class="sheet-stack"><button class="sheet-btn" data-recover-internal>⇧ Recuperar ahora<small>${safeText(new Date(latest.createdAt).toLocaleString())}</small></button><button class="sheet-btn" data-recover-json>Elegir Recovery JSON<small>Usar una copia guardada en tu carpeta</small></button><button class="sheet-btn" data-cancel-recovery>Ahora no</button></div>`,root=>{$('[data-recover-internal]',root).onclick=async()=>{closeDialog(els.sheetDialog);await restoreBackupData(latest.payload);};$('[data-recover-json]',root).onclick=()=>{closeDialog(els.sheetDialog);els.backupInput.click();};$('[data-cancel-recovery]',root).onclick=()=>closeDialog(els.sheetDialog);});
}
async function restoreBackupData(data){
  if(data?.schema!=='music-play-backup'||!Array.isArray(data.tracks))return toast('Esta copia no corresponde a MUSIC PLAY');
  showLoader('Restaurando biblioteca…','Combinando datos sin borrar lo actual');
  const existing=new Map(state.tracks.map(t=>[t.id,t]));
  for(const raw of data.tracks){const incoming=normalizeTrack(raw),current=existing.get(incoming.id);let merged;if(current){const newerResume=(incoming.resumeUpdatedAt||0)>(current.resumeUpdatedAt||0)?incoming:current,newerListen=(incoming.lastListenUpdatedAt||0)>(current.lastListenUpdatedAt||0)?incoming:current;merged=normalizeTrack({...incoming,...current,favorite:!!(incoming.favorite||current.favorite),validPlays:Math.max(incoming.validPlays||0,current.validPlays||0),completedPlays:Math.max(incoming.completedPlays||0,current.completedPlays||0),listenedMs:Math.max(incoming.listenedMs||0,current.listenedMs||0),skipCount:Math.max(incoming.skipCount||0,current.skipCount||0),replayCount:Math.max(incoming.replayCount||0,current.replayCount||0),resumePosition:newerResume.resumePosition||0,resumeDuration:newerResume.resumeDuration||0,resumeUpdatedAt:newerResume.resumeUpdatedAt||0,lastListenPosition:newerListen.lastListenPosition||0,lastListenDuration:newerListen.lastListenDuration||0,lastListenRatio:newerListen.lastListenRatio||0,lastListenUpdatedAt:newerListen.lastListenUpdatedAt||0});}else merged=normalizeTrack({...incoming,sourceMissing:incoming.sourceKind==='local'?true:incoming.sourceMissing});existing.set(merged.id,merged);if(state.storageReady)await db.put('tracks',merged).catch(()=>{});}
  state.tracks=[...existing.values()];
  const pmap=new Map(state.playlists.map(p=>[p.id,normalizePlaylist(p)]));
  for(const raw of (data.playlists||[])){const incoming=normalizePlaylist(raw),current=pmap.get(incoming.id);pmap.set(incoming.id,current?normalizePlaylist({...incoming,...current,trackIds:[...new Set([...(incoming.trackIds||[]),...(current.trackIds||[])])],sources:[...(incoming.sources||[]),...(current.sources||[])]}):incoming);}
  state.playlists=[...pmap.values()];for(const pl of state.playlists)await persistPlaylist(pl);
  const seenHistory=new Set(state.history.map(e=>`${e.ts||0}|${e.type||''}|${e.trackId||''}|${e.position||''}`));
  for(const evt of (data.history||[]).slice(0,2500)){const clean={...evt};delete clean.id;const hk=`${clean.ts||0}|${clean.type||''}|${clean.trackId||''}|${clean.position||''}`;if(seenHistory.has(hk))continue;seenHistory.add(hk);state.history.push(clean);if(state.storageReady)db.add('history',clean).catch(()=>{});}state.history.sort((a,b)=>(b.ts||0)-(a.ts||0));if(state.history.length>2500)state.history.length=2500;
  if(data.prefs){const p=data.prefs;if(Object.values(PLAY_MODES).includes(p.playbackMode))state.playbackMode=p.playbackMode;if(Object.values(SOUND_MODES).includes(p.soundMode))state.soundMode=p.soundMode;if(PODCAST_RATES.includes(Number(p.podcastRate)))state.podcastRate=Number(p.podcastRate);if(['all','local','youtube','linked'].includes(p.songSource))state.songSource=p.songSource;if(Array.isArray(p.songCategories))state.songCategories=p.songCategories.slice(0,24);if(Number.isFinite(p.volume))state.volume=Math.max(0,Math.min(1,p.volume));if(['dark','light'].includes(p.theme))state.theme=p.theme;if(['playlists','songs','albums'].includes(p.libraryTab))state.libraryTab=p.libraryTab;if(['recent','name','played'].includes(p.librarySort))state.librarySort=p.librarySort;state.firstRunComplete=!!p.firstRunComplete;if(p.activePlaylistId&&state.playlists.some(pl=>pl.id===p.activePlaylistId))state.activePlaylistId=p.activePlaylistId;if(p.activeSmartId)state.activeSmartId=p.activeSmartId;if(Array.isArray(p.queueIds))state.queueIds=p.queueIds.filter(id=>existing.has(id));if(Array.isArray(p.baseQueueIds))state.baseQueueIds=p.baseQueueIds.filter(id=>existing.has(id));if(Array.isArray(p.manualQueueIds))state.manualQueueIds=p.manualQueueIds.filter(id=>existing.has(id));if(p.repeatOneId&&existing.has(p.repeatOneId))state.repeatOneId=p.repeatOneId;if(Number.isInteger(p.queueIndex))state.queueIndex=Math.max(-1,Math.min(p.queueIndex,state.queueIds.length-1));if(p.currentId&&existing.has(p.currentId))state.currentId=p.currentId;if(p.dailyRecommendationDate)state.dailyRecommendationDate=p.dailyRecommendationDate;if(p.dailyRecommendationBand)state.dailyRecommendationBand=p.dailyRecommendationBand;if(Array.isArray(p.dailyRecommendationIds))state.dailyRecommendationIds=p.dailyRecommendationIds.filter(id=>existing.has(id));}
  document.documentElement.dataset.theme=state.theme;els.audio.volume=state.volume;if(els.directAudio)els.directAudio.volume=state.volume;
  if(Array.isArray(data.spProjects)&&data.spProjects.length&&window.MP_SP?.importProjects){try{await window.MP_SP.importProjects(data.spProjects);}catch{}} // R10.14: restaurar metadata de proyectos SP
  if(data.radioData&&window.MP_LIVE_RADIO?.importData){try{await window.MP_LIVE_RADIO.importData(data.radioData);}catch{}}
  await persistPrefs();hideLoader();render();toast('Recovery restaurado · playlists, favoritos, historial y preferencias recuperados',4200);
}
async function restoreBackupFile(file){
  if(!file)return;let data;try{data=JSON.parse(await file.text());}catch{return toast('El archivo JSON no es válido');}
  return restoreBackupData(data);
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
function openClearHistoryConfirm(){openSheet(`<h2 class="sheet-title">Borrar historial</h2><p class="sheet-copy">Se conservarán canciones, playlists y favoritos. Se eliminarán estadísticas de escucha, repeticiones y saltos.</p><div class="sheet-stack"><button class="sheet-btn danger" data-clear-history>Eliminar historial</button><button class="sheet-btn" data-cancel>Cancelar</button></div>`,root=>{$('[data-cancel]',root).onclick=()=>closeDialog(els.sheetDialog);$('[data-clear-history]',root).onclick=async()=>{for(const t of state.tracks){Object.assign(t,{playCount:0,starts:0,validPlays:0,completedPlays:0,listenedMs:0,skipCount:0,replayCount:0,lastStarted:0,lastPlayed:0,lastValidAt:0,lastCompleted:0,lastListenPosition:0,lastListenDuration:0,lastListenRatio:0,lastListenUpdatedAt:0});await saveRemoteTrack(t);}state.dailyRecommendationDate='';state.dailyRecommendationBand='';state.dailyRecommendationIds=[];state.history=[];if(state.storageReady)await db.clear('history').catch(()=>{});closeDialog(els.sheetDialog);render();toast('Historial eliminado');};});}
function openPwaStatusSheet(){
  const mode=isInstalledDisplay()?'app instalada':'navegador',secure=window.isSecureContext?'HTTPS/seguro':'contexto no seguro',sw=navigator.serviceWorker?.controller?'activo':'sin control',prompt=state.installPrompt?'listo':'no disponible aún';
  openSheet(`<h2 class="sheet-title">PWA · estado</h2><p class="sheet-copy">Diagnóstico rápido para instalación y pantalla completa.</p><div class="recap-grid"><div><b>${safeText(mode)}</b><span>modo</span></div><div><b>${safeText(secure)}</b><span>seguridad</span></div><div><b>${safeText(sw)}</b><span>service worker</span></div><div><b>${safeText(prompt)}</b><span>instalador</span></div></div><div class="sheet-stack"><button class="sheet-btn" data-pwa-install>⇩ Instalar / ayuda<small>Abre el flujo correcto para este dispositivo</small></button><button class="sheet-btn" data-pwa-full>⛶ Pantalla completa<small>Solicita modo inmersivo</small></button></div>`,root=>{$('[data-pwa-install]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openInstallSheet(),50);};$('[data-pwa-full]',root).onclick=async()=>{await requestImmersive();closeDialog(els.sheetDialog);};});
}
function ytDiagLineHtml(label,st){
  if(!st)return `<div class="yt-diag-line"><b>${label}</b><span class="muted">no probado</span></div>`;
  if(st.ok)return `<div class="yt-diag-line"><b>${label}</b><span class="ok">✓ respondió en ${(st.ms/1000).toFixed(1)}s${st.base?` · ${safeText(st.base)}`:''}</span></div>`;
  return `<div class="yt-diag-line"><b>${label}</b><span class="bad">✗ ${safeText(st.error||'sin respuesta')}</span></div>`;
}
function ytDiagHtml(diag,res){
  let h='';
  h+=ytDiagLineHtml('Helper propio (Worker)',diag.helper);
  h+=ytDiagLineHtml('API interna de YouTube',diag.innertube);
  h+=ytDiagLineHtml('Instancias públicas',diag.instances);
  h+=ytDiagLineHtml('latest_version (audio)',diag.latest);
  if(res)h+=`<div class="yt-diag-line total"><b>Resultado</b><span class="ok">✓ Motor nativo disponible vía ${safeText(res.source)}</span></div>`;
  else h+=`<div class="yt-diag-line total"><b>Resultado</b><span class="bad">✗ Sin respuesta · se usará el reproductor visible</span></div><div class="yt-diag-hint">Comprobado hoy: las instancias públicas de Invidious/Piped tienen la API deshabilitada o están caídas. Para conseguir la pantalla bloqueada de verdad, despliega tu Helper propio (gratis, 3 pasos ↓): es la vía que sí funciona siempre.</div>`;
  return h;
}
function openYouTubeEngineSheet(){
  const mode=state.ytNativeMode||'auto';
  const diag=state.ytDiag;
  openSheet(`<h2 class="sheet-title">Motor de YouTube</h2><p class="sheet-copy">El motor nativo reproduce streams directos: el audio sigue con la pantalla bloqueada, usa menos datos y muestra los controles del sistema, como YouTube Premium. Si una canción no está disponible, MUSIC PLAY usa el reproductor visible automáticamente.</p>
    <div class="sheet-stack">
      <button class="sheet-btn sound-choice${mode==='auto'?' selected':''}" data-ytmode="auto">✦ Nativo (recomendado)<small>Pantalla bloqueada · Media Session · menos datos</small></button>
      <button class="sheet-btn sound-choice${mode==='iframe'?' selected':''}" data-ytmode="iframe">◉ Reproductor visible<small>Compatibilidad total, pero se pausa al bloquear la pantalla</small></button>
      <div class="sheet-field"><label>Helper propio · URL de tu Worker (vía recomendada)</label><input id="ytHelperUrlInput" type="url" inputmode="url" autocomplete="off" placeholder="https://tu-helper.tu-usuario.workers.dev" value="${safeText(state.ytHelperUrl||'')}" /><small>Es la vía que garantiza el motor nativo. Créalo gratis en 3 pasos ↓ y pega aquí su URL.</small></div>
      <button class="sheet-btn" data-yt-test>↻ Probar motor nativo<small>Comprueba todas las vías ahora</small></button>
      <div id="ytDiagBox" class="yt-diag">${diag?ytDiagHtml(diag,state.ytDiagRes):'<div class="yt-diag-line muted-center">Pulsa «Probar motor nativo» para ver el estado de cada vía</div>'}</div>
      <details class="yt-guide"${(!state.ytDiagRes)?' open':''}><summary>⚡ Activar el Helper propio · 3 pasos</summary>
        <ol><li>Toca «⧉ Copiar código del Worker».</li><li>Abre <a href="https://workers.cloudflare.com/" target="_blank" rel="noopener">workers.cloudflare.com</a> → Create → borra el ejemplo → pega el código → Deploy.</li><li>Copia la URL (…workers.dev), pégala arriba en «Helper propio» y pulsa Probar.</li></ol>
        <button class="sheet-btn" data-yt-copy-worker>⧉ Copiar código del Worker<small>Archivo completo · también está en cloudflare/playlist-api-worker.mjs del ZIP</small></button>
      </details>
      <div class="sheet-field"><label>Instancia preferida (opcional)</label><input id="ytCustomApiInput" type="url" placeholder="https://pipedapi.ejemplo.com" value="${safeText(state.ytCustomApi||'')}" /><small>Servidor Piped/Invidious propio para el motor nativo.</small></div>
    </div>`,root=>{
    $$('[data-ytmode]',root).forEach(b=>b.onclick=async()=>{state.ytNativeMode=b.dataset.ytmode;await persistPrefs();closeDialog(els.sheetDialog);toast(b.dataset.ytmode==='auto'?'Motor nativo activado':'Reproductor visible activado',2400);});
    $('[data-yt-copy-worker]',root)?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(YT_WORKER_CODE);toast('Código del Worker copiado · pégalo en workers.cloudflare.com',3600);}catch(err){try{const ta=document.createElement('textarea');ta.value=YT_WORKER_CODE;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Código del Worker copiado',3600);}catch(e2){toast('No se pudo copiar · usa cloudflare/playlist-api-worker.mjs del ZIP',4200);}}});
    $('[data-yt-test]',root).onclick=async()=>{const btn=$('[data-yt-test]',root);btn.disabled=true;const label=$('small',btn);if(label)label.textContent='Consultando todas las vías…';const box=$('#ytDiagBox',root);if(box)box.innerHTML='<div class="yt-diag-line"><b>Sondeando…</b><span class="muted">hasta 25s</span></div>';state.ytInstCache=null;state.ytInstAt=0;ytStreamCache.clear();ytNegCache.clear();const t=Date.now();const diag={};state.ytDiag=diag;const res=await resolveYouTubeMedia('jNQXAC9IVRw',{force:true,diag}).catch(()=>null);state.ytDiagRes=!!res;const secs=((Date.now()-t)/1000).toFixed(1);if(label)label.textContent=res?`Disponible · vía ${res.source} en ${secs}s`:`Sin respuesta en ${secs}s · se usará el reproductor visible`;if(box)box.innerHTML=ytDiagHtml(diag,res);btn.disabled=false;};
    const helperInput=$('#ytHelperUrlInput',root);helperInput?.addEventListener('change',async()=>{state.ytHelperUrl=ytNormalizeBase(helperInput.value.trim());ytStreamCache.clear();ytNegCache.clear();ytInstanceStatus.clear();state.ytInstCache=null;state.ytInstAt=0;await persistPrefs();toast(state.ytHelperUrl?'Helper guardado · pulsa «Probar motor nativo»':'Helper borrado',2800);});
    const input=$('#ytCustomApiInput',root);input?.addEventListener('change',async()=>{state.ytCustomApi=ytNormalizeBase(input.value.trim());ytStreamCache.clear();ytNegCache.clear();state.ytInstCache=null;state.ytInstAt=0;await persistPrefs();toast(state.ytCustomApi?'Instancia guardada · reintentando el motor nativo':'Instancia personalizada borrada',2200);});
  });
}
function openMoreMenu(){openSheet(`<h2 class="sheet-title">MUSIC PLAY <small class="ver-chip">${safeText(APP_VERSION)}</small></h2><p class="sheet-copy">Herramientas de biblioteca sin llenar la pantalla principal.</p><div class="sheet-stack"><button class="sheet-btn" data-more="minifloat">◱ Pantalla reducida flotante<small>Ventana mínima con video o carátula + controles · también con ⧉ arriba</small></button><button class="sheet-btn" data-more="modes">▶ Modos de reproducción<small>Aleatorio, Radio, Redescubrir, Sorpréndeme y Cola Viva</small></button><button class="sheet-btn" data-more="yt">▶ Motor de YouTube<small>Segundo plano, pantalla bloqueada e instancia preferida</small></button><button class="sheet-btn" data-more="sound">◉ Sonido adaptativo<small>Auto por ritmo, Original, Cálido, Potente o Claro</small></button><button class="sheet-btn" data-more="ticker">▤ MicroTicker<small>Animación de cabecera</small></button><button class="sheet-btn" data-more="discovery">📡 Novedades<small>Descubre música reciente por género</small></button><button class="sheet-btn" data-more="fullscreen">⛶ Pantalla completa<small>Oculta la barra del sistema durante esta sesión</small></button><button class="sheet-btn" data-more="fsauto">⛶${state.autoFullscreen!==false?' ✓':' ✗'} Completa automática<small>${state.autoFullscreen!==false?'Se activa sola al abrir y al volver de segundo plano':'Solo cuando la pidas manualmente'}</small></button><button class="sheet-btn" data-more="pwa">⇩ PWA · instalación<small>Estado, instalación y pantalla completa</small></button><button class="sheet-btn" data-more="recap">◎ Mi resumen<small>Escuchas, tiempo, repeticiones y favoritos</small></button><button class="sheet-btn" data-more="backup">🛡 Recovery JSON<small>Respaldo portable de playlists, favoritos, historial, cola y preferencias</small></button><button class="sheet-btn" data-more="restore">⇧ Restaurar Recovery<small>Combina una copia con tu biblioteca actual sin borrar lo existente</small></button><button class="sheet-btn" data-more="m3u-export">≡ Exportar M3U8<small>Interoperabilidad con otros reproductores</small></button><button class="sheet-btn" data-more="m3u-import">＋ Importar M3U/M3U8<small>Enlaces y referencias locales</small></button><button class="sheet-btn danger" data-more="clear">⌫ Borrar historial<small>No borra música ni favoritos</small></button></div>`,root=>{$('[data-more="modes"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openPlaybackModesSheet(),40);};$('[data-more="yt"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openYouTubeEngineSheet(),40);};$('[data-more="minifloat"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(toggleFloatMini,60);};$('[data-more="fsauto"]',root).onclick=async()=>{state.autoFullscreen=!(state.autoFullscreen!==false);await persistPrefs();closeDialog(els.sheetDialog);toast(state.autoFullscreen?'Pantalla completa automática activada':'Pantalla completa automática desactivada',2600);};$('[data-more="fullscreen"]',root).onclick=async()=>{closeDialog(els.sheetDialog);await requestImmersive();};$('[data-more="sound"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openSoundModeSheet(),40);};$('[data-more="ticker"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openTickerModeSheet(),40);};$('[data-more="discovery"]',root).onclick=()=>{closeDialog(els.sheetDialog);setTimeout(()=>openDiscoveryConfigSheet(),40);};$('[data-more="pwa"]',root).onclick=()=>{closeDialog(els.sheetDialog);openPwaStatusSheet();};$('[data-more="recap"]',root).onclick=()=>{closeDialog(els.sheetDialog);openRecapSheet();};$('[data-more="backup"]',root).onclick=()=>{closeDialog(els.sheetDialog);exportBackup();};$('[data-more="restore"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.backupInput.click();};$('[data-more="m3u-export"]',root).onclick=()=>{closeDialog(els.sheetDialog);openExportM3USheet();};$('[data-more="m3u-import"]',root).onclick=()=>{closeDialog(els.sheetDialog);els.m3uInput.click();};$('[data-more="clear"]',root).onclick=()=>{closeDialog(els.sheetDialog);openClearHistoryConfirm();};});}

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
    if(res.ok){const info=await res.json();state.remoteBuild=info.build||'';if(state.remoteBuild&&state.remoteBuild===BUILD){setUpdateAvailable(false);}else if(state.remoteBuild&&state.remoteBuild!==BUILD){setUpdateAvailable(true);}}
  }catch(err){console.debug('Version check skipped',err);}
  try{await state.swRegistration?.update();}catch{}
  // R10.12: si hay versión nueva y NADA está sonando, aplicar la actualización
  // automáticamente (una vez por sesión). Así el usuario SIEMPRE percibe los cambios.
  if(state.updateAvailable&&state.remoteBuild&&state.remoteBuild!==BUILD&&!state.playing&&!state.floatMini&&!els.sheetDialog?.open&&!els.playerDialog?.open){
    try{if(sessionStorage.getItem('mpf-auto-update-applied')!==BUILD){sessionStorage.setItem('mpf-auto-update-applied',BUILD);setTimeout(()=>{if(!state.playing&&!els.sheetDialog?.open&&!els.playerDialog?.open)applyAvailableUpdate({auto:true}).catch(()=>{});},1500);}}catch{}
  }
  return state.updateAvailable;
}
async function applyAvailableUpdate(opts={}){
  const auto=opts&&opts.auto===true;
  if(!navigator.onLine)return toast('Necesitas conexión para actualizar');
  if(hasRecoveryData()){await createRecoveryBackup({reason:'before-app-update',download:!auto,quiet:true});}
  toast(auto?'Actualizando MUSIC PLAY en segundo plano…':'Actualizando MUSIC PLAY…',3200);
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
  if(host.includes('spotify.com')){const parts=u.pathname.split('/').filter(Boolean),spotifyType=['show','episode','playlist','track','album'].includes(parts[0])?parts[0]:'link';return{kind:'spotify',url:u.href,spotifyType,spotifyId:parts[1]||''};}
  if(host.includes('music.apple.com'))return{kind:'apple',url:u.href};
  const ext=extOf(u.pathname);if(MEDIA_EXT.has(ext))return{kind:'direct',url:u.href,ext};
  return{kind:'generic',url:u.href,ext};
}
function describeLink(info){if(info.kind==='spotify'&&info.spotifyType==='show')return['Spotify · Podcast','Guarda el programa como referencia externa dentro de Podcasts'];if(info.kind==='spotify'&&info.spotifyType==='episode')return['Spotify · Episodio','Guarda el episodio como referencia; la reproducción protegida permanece en Spotify'];return({youtube:['YouTube','Video reproducible dentro de MUSIC PLAY'],'youtube-playlist':['YouTube Music / Playlist','Importa la lista y conserva el orden dentro de MUSIC PLAY'],soundcloud:['SoundCloud','Enlace reproducible mediante su reproductor oficial'],direct:['Archivo multimedia','Puede reproducirse o guardarse localmente'],spotify:['Spotify','Se guarda como referencia; no se descarga audio protegido'],apple:['Apple Music','Se guarda como referencia; integración autorizada posterior'],generic:['Enlace','Intentaremos detectar si entrega audio o video'],invalid:['Enlace inválido','Revisa la dirección']})[info.kind]||['Enlace',''];}
function openLinkSheet(prefill='',targetPlaylistId='',options={}){
  const target=state.playlists.find(p=>p.id===targetPlaylistId)||null,preferPodcast=!!options.preferPodcast;
  openSheet(`<h2 class="sheet-title">${target?'Añadir enlace':preferPodcast?'Añadir podcast':'Enlace'}</h2><p class="sheet-copy">${target?`Todo lo que importes se añadirá a <b>${safeText(target.name)}</b>.`:preferPodcast?'Pega una playlist/podcast de YouTube o un programa de Spotify.':'Pega un video, playlist de YouTube Music o archivo multimedia.'}</p><input id="linkInput" class="sheet-input" inputmode="url" autocomplete="off" placeholder="https://…" value="${safeText(prefill)}"/><div class="sheet-stack"><button class="sheet-btn" data-analyze>Analizar<small>Detecta la fuente automáticamente</small></button></div><div id="linkResult"></div>`,root=>{
    const input=$('#linkInput',root),result=$('#linkResult',root);input.focus();
    const analyze=()=>renderLinkResult(analyzeLink(input.value),result,target?.id||'',{preferPodcast});
    $('[data-analyze]',root).onclick=analyze;input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();analyze();}});
  });
}
function renderLinkResult(info,host,targetPlaylistId='',options={}){
  const [title,desc]=describeLink(info),target=state.playlists.find(p=>p.id===targetPlaylistId)||null,preferPodcast=!!options.preferPodcast;
  const playlistInfo=info.kind==='youtube-playlist'?`<span>ID: ${safeText(info.playlistId||'')}</span>`:'';
  host.innerHTML=`<div class="link-result"><strong>${title}</strong><span>${desc}</span>${playlistInfo}<span>${safeText(info.url||'')}</span><div class="link-actions" id="linkActions"></div></div>`;
  const a=$('#linkActions',host);if(info.kind==='invalid')return;
  const add=(label,fn)=>{const b=document.createElement('button');b.className='sheet-btn';b.textContent=label;b.onclick=fn;a.appendChild(b);};
  const finishTarget=async track=>{if(!track||!target)return;await addTrackToPlaylist(track.id,target.id,{silent:true});closeDialog(els.sheetDialog);state.activePlaylistId=target.id;state.playlistDetailOpen=true;showView('playlist');toast('Añadido a playlist');};
  if(info.kind==='youtube'){
    add('▶ Play',async()=>{const t=await importYouTubeVideo(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    add(target?`＋ Añadir a ${target.name}`:'＋ Guardar',async()=>{const t=await importYouTubeVideo(info,false);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');toast('YouTube guardado');});
  }else if(info.kind==='youtube-playlist'){
    add('▶ Play',async()=>{const t=makeRemoteTrack('youtube-playlist',info.canonicalUrl||info.url,{remoteId:info.playlistId,title:preferPodcast?'Podcast de YouTube':'Playlist de YouTube',artist:'YouTube'});await saveRemoteTrack(t);closeDialog(els.sheetDialog);playTrack(t.id,[t.id]);});
    if(!target&&(preferPodcast||options.allowPodcast!==false))add('🎙 Guardar como podcast',async()=>{closeDialog(els.sheetDialog);await importYouTubePlaylist(info,'',{contentType:'podcast'});});
    add(target?`＋ Sumar a ${target.name}`:'＋ Importar playlist',async()=>{closeDialog(els.sheetDialog);await importYouTubePlaylist(info,target?.id||'',{contentType:target?playlistContentType(target):'music'});});
  }else if(info.kind==='soundcloud'){
    add('▶ Play',async()=>{const t=await importSoundCloud(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    add(target?`＋ Añadir a ${target.name}`:'＋ Guardar',async()=>{const t=await importSoundCloud(info,false);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');});
  }else if(info.kind==='direct'||info.kind==='generic'){
    add('▶ Play',async()=>{const t=await importDirectReference(info.url);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});
    if(target)add(`＋ Añadir enlace a ${target.name}`,async()=>{const t=await importDirectReference(info.url);return finishTarget(t);});
    else add('↓ Guardar',async()=>{closeDialog(els.sheetDialog);await downloadRemoteMedia(info.url);});
  }else if(info.kind==='spotify'||info.kind==='apple'){
    if(info.kind==='spotify'&&info.spotifyType==='show'&&!target)add('🎙 Guardar podcast',async()=>{closeDialog(els.sheetDialog);await createExternalPodcast(info);});
    else add(target?`＋ Añadir referencia a ${target.name}`:'＋ Guardar referencia',async()=>{const kind='external',name=info.kind==='spotify'?'Spotify':'Apple Music';const t=makeRemoteTrack(kind,info.url,{title:`${name} · ${info.spotifyType==='episode'?'episodio':'enlace'}`,artist:name,service:info.kind,mediaKind:info.spotifyType==='episode'?'podcast':'external'});await saveRemoteTrack(t);if(target)return finishTarget(t);closeDialog(els.sheetDialog);showView('library');toast('Referencia guardada');});
    add('↗ Abrir original',()=>window.open(info.url,'_blank','noopener'));
  }
}
async function createExternalPodcast(info){
  const idPart=(info.spotifyId||remoteHash(info.url)).slice(0,10),name=`Podcast de Spotify · ${idPart}`;
  const pl=await createPlaylist(name);pl.contentType='podcast';pl.sources=[{id:`src_${remoteHash(info.url)}`,source:'Spotify',url:info.url,serviceType:'show',status:'linked',message:'Referencia externa. El audio protegido se abre en Spotify.',addedAt:now(),checkedAt:now()}];pl.externalRef={source:'Spotify',url:info.url,serviceType:'show'};pl.updatedAt=now();await persistPlaylist(pl);state.activePlaylistId=pl.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();renderHome();toast('Podcast guardado · referencia de Spotify');return pl;
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
async function importYouTubePlaylist(info,targetPlaylistId='',options={}){
  const playlistId=info.playlistId||'';if(!playlistId)return toast('No encontré el ID de la playlist');const target=state.playlists.find(p=>p.id===targetPlaylistId)||null;
  showLoader(target?'Añadiendo playlist…':options.contentType==='podcast'?'Importando podcast…':'Importando playlist…','Leyendo títulos y carátulas');updateLoaderProgress(0,1,'YouTube');
  const result=await getYouTubePlaylistIds(playlistId),ids=result.ids||[],name=result.title||`YouTube · ${playlistId.slice(0,18)}`;let pl=target;if(!pl)pl=await createPlaylist(name);
  const detectedPodcast=result.podcastStatus==='enabled';pl.contentType=target?playlistContentType(target):(detectedPodcast?'podcast':(options.contentType||'music'));
  const src={id:`src_${remoteHash(playlistId)}`,source:'YouTube',url:info.canonicalUrl||canonicalYouTubePlaylistUrl(playlistId),originalUrl:info.url,playlistId,importSource:result.source||'link',podcastStatus:result.podcastStatus||'',status:ids.length?'imported':'linked',count:ids.length,message:ids.length?'':(result.error||'YouTube no expuso el listado al navegador'),addedAt:now(),checkedAt:now()};upsertPlaylistSource(pl,src);
  let added=0;const importedTrackIds=[],records=[];
  for(let i=0;i<ids.length;i++){
    const videoId=ids[i],meta=result.meta?.[videoId]||null,url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const t=makeRemoteTrack('youtube',url,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(3,'0')}`,artist:meta?.artist||meta?.author||'YouTube',thumbnail:meta?.thumbnail||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,playlistSource:playlistId,playlistPosition:i,enriched:!!meta?.title,mediaKind:pl.contentType==='podcast'?'podcast':'audio'});const merged=mergeImportedTrack(t);records.push(merged);importedTrackIds.push(merged.id);if(!pl.trackIds.includes(merged.id)){pl.trackIds.push(merged.id);added++;}if(i%50===0){updateLoaderProgress(i+1,Math.max(ids.length,1),pl.contentType==='podcast'?'preparando episodios':'preparando playlist');await sleep(0);}
  }
  pl.updatedAt=now();await persistPlaylist(pl);if(state.storageReady&&records.length){for(let i=0;i<records.length;i+=120)await db.putMany('tracks',records.slice(i,i+120)).catch(()=>{});}hideLoader();if(importedTrackIds.length){state.lastImportIds=[...new Set(importedTrackIds)];state.lastImportLabel=name;state.lastImportAt=now();}state.activePlaylistId=pl.id;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderPlaylists();renderHome();await persistPrefs();
  const unit=pl.contentType==='podcast'?'episodios':'elementos';if(ids.length)toast(`${pl.contentType==='podcast'?'Podcast':'Playlist'} ${target?'actualizado':'importado'} · ${added} nuevos · ${ids.length} ${unit}`,4200);else toast(`${pl.contentType==='podcast'?'Podcast':'Playlist'} guardado. Queda enlazado y puedes reintentar la lectura.`,4800);return pl;
}
async function getYouTubePlaylistIds(playlistId,options={}){
  const out={ids:[],source:'',error:'',title:'',podcastStatus:'',meta:{}};
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
          out.source=d.source||'API local';out.title=d.title||'';out.podcastStatus=d.podcastStatus||'';
          for(const item of d.items){const id=item.videoId||item.id;if(id)out.meta[id]={title:item.title||'',artist:item.author||item.channelTitle||'',thumbnail:item.thumbnail||''};}
          return out;
        }
        if(Array.isArray(d.ids)&&d.ids.length){out.ids=Array.from(new Set(d.ids.filter(Boolean)));out.source=d.source||'API local';out.title=d.title||'';out.podcastStatus=d.podcastStatus||'';return out;}
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
  const src=pl?.sources?.[sourceIndex];if(!src||src.source!=='YouTube'||!src.playlistId)return toast('Esta fuente no puede reimportarse');showLoader('Reintentando…',playlistContentType(pl)==='podcast'?'Consultando episodios y carátulas':'Consultando títulos y carátulas');const result=await getYouTubePlaylistIds(src.playlistId),ids=result.ids||[];
  if(result.podcastStatus==='enabled')pl.contentType='podcast';src.podcastStatus=result.podcastStatus||src.podcastStatus||'';
  if(!ids.length){hideLoader();src.status='linked';src.message=result.error||'YouTube no entregó el listado';src.checkedAt=now();await persistPlaylist(pl);renderPlaylists();renderHome();return toast('La fuente sigue enlazada; puedes reproducirla y reintentar luego.',4200);}
  let added=0;const records=[],isPodcast=playlistContentType(pl)==='podcast';for(let i=0;i<ids.length;i++){const videoId=ids[i],meta=result.meta?.[videoId]||null,t=makeRemoteTrack('youtube',`https://www.youtube.com/watch?v=${videoId}`,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i+1).padStart(3,'0')}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,playlistSource:src.playlistId,playlistPosition:i,enriched:!!meta?.title,mediaKind:isPodcast?'podcast':'audio'}),merged=mergeImportedTrack(t);records.push(merged);if(!pl.trackIds.includes(merged.id)){pl.trackIds.push(merged.id);added++;}if(i%60===0){updateLoaderProgress(i+1,ids.length,isPodcast?'recuperando episodios':'recuperando canciones');await sleep(0);}}
  src.status='imported';src.count=ids.length;src.message='';src.importSource=result.source;src.checkedAt=now();if(result.title&&/^YouTube ·/.test(pl.name))pl.name=result.title;pl.updatedAt=now();await persistPlaylist(pl);if(state.storageReady)for(let i=0;i<records.length;i+=120)await db.putMany('tracks',records.slice(i,i+120)).catch(()=>{});hideLoader();render();toast(`Fuente recuperada · ${added} nuevos · ${ids.length} ${isPodcast?'episodios':'elementos'} detectados`,4200);return pl;
}
async function retryPlaylistImport(pl){
  const index=(pl?.sources||[]).findIndex(s=>s.source==='YouTube');if(index<0)return toast('Esta lista no tiene una fuente de YouTube');return retryPlaylistSource(pl,index);
}
async function playPlaylistSource(pl,src){
  if(src?.source==='YouTube'&&src.playlistId){
    // R10.11: si la lista ya tiene canciones importadas, se reproduce la cola
    // gestionada por MUSIC PLAY (orden propio, avance y metadata por canción).
    const virtual=makeRemoteTrack('youtube-playlist',src.url||canonicalYouTubePlaylistUrl(src.playlistId),{remoteId:src.playlistId,title:pl.name,artist:'YouTube'});
    const ids=youTubePlaylistQueueIds(virtual);
    if(ids.length)return playTrack(ids[0],ids);
    await saveRemoteTrack(virtual);return playTrack(virtual.id,[virtual.id]);
  }
  if((src?.source==='Spotify'||src?.serviceType==='show')&&src?.url){openSpotifyPodcast(src.url);return true;}
  toast('Esta fuente todavía no tiene reproductor integrado');return false;
}
function openSpotifyPodcast(url){
  if(!url)return toast('Este podcast de Spotify no conserva un enlace válido');try{const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.appendChild(a);a.click();a.remove();toast('Abriendo podcast en Spotify…');return true;}catch{try{window.location.assign(url);return true;}catch{return false;}}
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
async function pickFiles(options={}){
  if('showOpenFilePicker'in window){try{
    const handles=await showOpenFilePicker({multiple:true,types:[{description:'Audio y video',accept:{'audio/*':['.mp3','.m4a','.aac','.wav','.ogg','.oga','.opus','.flac','.wma'],'video/*':['.mp4','.m4v','.webm','.mov','.3gp','.wmv','.avi','.mkv']}}]});
    const raw=await collectPickerEntries(handles);
    // Individual files are copied progressively to OPFS, MUSIC PLAY's private file area.
    // This avoids repeated Android file-permission prompts after reopening the PWA.
    const entries=raw.map(e=>({file:e.file,handle:null,path:e.path||''}));
    return importMediaEntries(entries,{label:options.label||'Archivos importados',targetPlaylistId:options.targetPlaylistId||''});
  }catch(err){if(err?.name==='AbortError')return;if(err?.name!=='AbortError')console.warn(err);}}
  state.pendingImportTargetId=options.targetPlaylistId||'';state.pendingImportLabel=options.label||'Archivos importados';els.fileInput.click();
}
async function pickFolder(options={}){
  // R10.15 · APK: webkitdirectory no funciona en WebView (aplasta la carpeta).
  // Se usa el puente nativo ACTION_OPEN_DOCUMENT_TREE + copia local servida por el AssetLoader.
  if(IS_NATIVE_APK&&window.HappyNative?.importFolder){const handled=await importFolderViaNative(options);if(handled)return;}
  if('showDirectoryPicker'in window){
    try{
      const dir=await showDirectoryPicker(),entries=[];
      const rootId=`root_${remoteHash(`${dir.name}|${now()}|${Math.random()}`)}`;
      grantedHandleRoots.add(rootId);
      showLoader('Leyendo carpeta…',dir.name||'Carpeta');let count=0;
      async function walk(h,parts=[]){
        for await(const[,e]of h.entries()){
          if(e.kind==='file'){
            try{const f=await e.getFile();if(isMediaFile(f))entries.push({file:f,handle:null,rootHandle:dir,rootId,relativePath:[...parts,e.name],path:[dir.name,...parts].join('/')});}catch{}
            count++;if(count%35===0){updateLoaderProgress(count,Math.max(count,entries.length+1),'encontrando archivos');await sleep(0);}
          }else if(e.kind==='directory')await walk(e,[...parts,e.name]);
        }
      }
      await walk(dir,[]);hideLoader();return importMediaEntries(entries,{label:options.label||dir.name||'Carpeta importada',targetPlaylistId:options.targetPlaylistId||''});
    }catch(err){hideLoader();if(err?.name==='AbortError')return;if(err?.name!=='AbortError')console.warn(err);}
  }
  state.pendingImportTargetId=options.targetPlaylistId||'';state.pendingImportLabel=options.label||'Carpeta importada';els.folderInput.click();
}
async function reconcileMissingPlaceholder(track){
  const placeholder=state.tracks.find(t=>t.sourceMissing&&t.sourceKind==='local'&&((t.fileName&&track.fileName&&t.fileName.toLowerCase()===track.fileName.toLowerCase())||(!t.fileName&&t.title?.toLowerCase()===track.title?.toLowerCase())));
  if(!placeholder||placeholder.id===track.id)return track;
  track.favorite=!!(track.favorite||placeholder.favorite);track.validPlays=Math.max(track.validPlays||0,placeholder.validPlays||0);track.playCount=track.validPlays;track.completedPlays=Math.max(track.completedPlays||0,placeholder.completedPlays||0);track.listenedMs=Math.max(track.listenedMs||0,placeholder.listenedMs||0);track.skipCount=Math.max(track.skipCount||0,placeholder.skipCount||0);track.replayCount=Math.max(track.replayCount||0,placeholder.replayCount||0);
  for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).map(id=>id===placeholder.id?track.id:id);pl.trackIds=[...new Set(pl.trackIds)];await persistPlaylist(pl);}state.queueIds=state.queueIds.map(id=>id===placeholder.id?track.id:id);state.tracks=state.tracks.filter(t=>t.id!==placeholder.id);if(state.storageReady)await db.delete('tracks',placeholder.id).catch(()=>{});return track;
}
function mergeImportedTrack(track){
  const idx=state.tracks.findIndex(t=>t.id===track.id);if(idx<0){state.tracks.push(track);return track;}const prev=normalizeTrack(state.tracks[idx]),newerListen=(track.lastListenUpdatedAt||0)>=(prev.lastListenUpdatedAt||0)?track:prev;const merged=normalizeTrack({...prev,...track,favorite:!!(prev.favorite||track.favorite),starts:Math.max(prev.starts||0,track.starts||0),validPlays:Math.max(prev.validPlays||0,track.validPlays||0),completedPlays:Math.max(prev.completedPlays||0,track.completedPlays||0),listenedMs:Math.max(prev.listenedMs||0,track.listenedMs||0),skipCount:Math.max(prev.skipCount||0,track.skipCount||0),replayCount:Math.max(prev.replayCount||0,track.replayCount||0),lastPlayed:Math.max(prev.lastPlayed||0,track.lastPlayed||0),lastListenPosition:newerListen.lastListenPosition||0,lastListenDuration:newerListen.lastListenDuration||0,lastListenRatio:newerListen.lastListenRatio||0,lastListenUpdatedAt:newerListen.lastListenUpdatedAt||0,addedAt:prev.addedAt||track.addedAt});state.tracks[idx]=merged;return merged;
}
async function persistImportBatch(tracks,sources){
  if(!state.storageReady)return;const chunk=120;
  for(let i=0;i<tracks.length;i+=chunk){await db.putMany('tracks',tracks.slice(i,i+chunk)).catch(err=>console.debug('track batch',err));await idleYield(70);}
  for(let i=0;i<sources.length;i+=chunk){await db.putMany('sources',sources.slice(i,i+chunk)).catch(err=>console.debug('source batch',err));await idleYield(70);}
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
  const batchIds=[],trackRecords=[],sourceRecords=[],enrich=[],persistJobs=[];let i=0;
  for(const entry of entries){
    i++;const file=entry.file;let t=makeTrack(file,{folder:entry.path||folderFromFile(file),enriched:false});t=await reconcileMissingPlaceholder(t);t=mergeImportedTrack(t);sessionFiles.set(t.id,file);batchIds.push(t.id);trackRecords.push(t);
    const fallback=entry.rootHandle?{kind:'dir-handle',rootHandle:entry.rootHandle,rootId:entry.rootId||'',relativePath:entry.relativePath||[file.name],name:file.name,type:file.type,lastModified:file.lastModified}:entry.handle?{kind:'handle',handle:entry.handle,name:file.name,type:file.type,lastModified:file.lastModified}:null;
    sourceRecords.push({id:t.id,kind:'opfs-pending',name:file.name,type:file.type,lastModified:file.lastModified,size:file.size||0});persistJobs.push({track:t,file,fallback});enrich.push({id:t.id,file,handle:entry.handle||null});if(i%20===0){updateLoaderProgress(i,entries.length,file.name);await sleep(0);}
  }
  updateLoaderProgress(entries.length,entries.length,'lista');state.lastImportIds=[...new Set(batchIds)];state.lastImportLabel=label;state.lastImportAt=now();await persistPrefs();hideLoader();
  const targetId=options.targetPlaylistId&&state.playlists.some(p=>p.id===options.targetPlaylistId)?options.targetPlaylistId:'';
  if(targetId){state.activePlaylistId=targetId;state.playlistDetailOpen=true;state.libraryTab='playlists';showView('library');renderLibraryShell();}else{state.libraryTab='songs';showView('library');renderLibrarySongs();}
  persistImportBatch(trackRecords,sourceRecords).then(()=>{queueLocalPersistence(persistJobs);toast(`Biblioteca indexada · ${entries.length} archivos · guardado local en segundo plano`,2800);}).catch(()=>{queueLocalPersistence(persistJobs);});queueEnrichment(enrich);
  if(options.silentPost)return toast(entries.length===1?'Archivo listo':`${entries.length} archivos indexados`);setTimeout(()=>openPostImportSheet(state.lastImportIds,label,targetId),120);
}
async function importFiles(fileLike,options={}){const entries=Array.from(fileLike||[]).filter(isMediaFile).map(file=>({file,handle:null,path:folderFromFile(file)}));return importMediaEntries(entries,options);}

function seekFromRange(){const pct=Number(els.progressRange.value)/100;if(state.currentEngine==='youtube'&&state.ytEngine==='native'){const el=ytNativeElement();try{el.currentTime=(el.duration||0)*pct;}catch{}}else if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo((ytPlayer.getDuration()||0)*pct,true);}catch{}}else if(state.currentEngine==='soundcloud'&&scWidget){const d=getCurrentTrack()?.duration||0;scWidget.seekTo(d*1000*pct);}else{const a=activeNativeAudio(),d=a?.duration||0;if(d)a.currentTime=d*pct;}}
async function setupMediaSession(){
  if(window.MP_LIVE_RADIO?.isActive?.())return window.MP_LIVE_RADIO.setupWebMediaSession?.();
  if(!('mediaSession'in navigator))return;
  const t=getCurrentTrack();if(t){
    const art=await artworkUrlFor(t).catch(()=> '');
    let artwork=[];
    if(art)artwork=[{src:art}];
    else if((t.sourceKind==='youtube'||t.sourceKind==='youtube-playlist')&&t.remoteId){
      const base=`https://i.ytimg.com/vi/${encodeURIComponent(t.remoteId)}`;
      artwork=[{src:`${base}/mqdefault.jpg`,sizes:'320x180',type:'image/jpeg'},{src:`${base}/hqdefault.jpg`,sizes:'480x360',type:'image/jpeg'},{src:`${base}/sddefault.jpg`,sizes:'640x480',type:'image/jpeg'}];
    }
    if(!artwork.length)artwork=[{src:new URL('./icons/icon-512.png',location.href).href,sizes:'512x512',type:'image/png'}];
    try{navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist||sourceLabel(t),album:t.album||'MUSIC PLAY',artwork});}catch{}
  }
  const safe=(action,fn)=>{try{navigator.mediaSession.setActionHandler(action,fn);}catch{}};
  safe('play',()=>togglePlay());safe('pause',()=>togglePlay());safe('previoustrack',()=>prevTrack());safe('nexttrack',()=>nextTrack());
  safe('seekbackward',details=>seekBy(-(details?.seekOffset||(isPodcastTrack(t)?15:10))));
  safe('seekforward',details=>seekBy(details?.seekOffset||(isPodcastTrack(t)?30:10)));
  safe('seekto',details=>{const pos=Math.max(0,Number(details?.seekTime)||0);if(state.currentEngine==='youtube'&&state.ytEngine==='native'){try{ytNativeElement().currentTime=pos;}catch{}}else if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo(pos,true);}catch{}}else if(state.currentEngine==='soundcloud'&&scWidget){try{scWidget.seekTo(pos*1000);}catch{}}else if(['local','direct'].includes(state.currentEngine)){const a=activeNativeAudio();a.currentTime=pos;}});
  safe('stop',async()=>{stopAllEngines();await finalizeListenSession('manual');renderPlayer();syncMediaPlaybackState();});
  syncMediaPlaybackState();updateProgress();
}

function isInstalledDisplay(){return !!(window.matchMedia?.('(display-mode: fullscreen)').matches||window.matchMedia?.('(display-mode: standalone)').matches||window.matchMedia?.('(display-mode: minimal-ui)').matches||window.navigator.standalone===true);}
function syncShellMode(){document.documentElement.dataset.shell=isInstalledDisplay()?'app':'browser';}
// R10.12: pantalla completa REAL también en el navegador, no solo instalada.
// En Android Chrome requestFullscreen() oculta la franja del sistema (cuadrado,
// círculo, atrás). Se activa en el primer gesto si la preferencia lo permite,
// se reafirma al volver de segundo plano y se puede apagar desde ⋯.
let immersiveAutoTried=false,immersiveToastShown=false;
function bindAutoImmersive(){
  document.addEventListener('pointerdown',async()=>{
    if(immersiveAutoTried)return;immersiveAutoTried=true;
    if(!state.autoFullscreen||document.fullscreenElement||!document.fullscreenEnabled)return;
    try{await document.documentElement.requestFullscreen({navigationUI:'hide'});state.autoFsWasOn=true;syncInstallUI();if(!immersiveToastShown){immersiveToastShown=true;toast('Pantalla completa activa · botón ⛶ o ⋯ para salir',3600);}}catch(err){console.debug('auto fullscreen',err);}
  },{once:true,capture:true});
  document.addEventListener('fullscreenchange',()=>{try{if(document.fullscreenElement)state.autoFsWasOn=true;syncInstallUI();}catch{}});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible')return;
    if(!state.autoFullscreen||!state.autoFsWasOn||document.fullscreenElement||!document.fullscreenEnabled)return;
    setTimeout(async()=>{if(document.visibilityState==='visible'&&!document.fullscreenElement&&state.autoFullscreen&&document.fullscreenEnabled){try{await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch{}}},350);
  });
}
async function requestImmersive(){
  try{if(document.fullscreenElement){await document.exitFullscreen?.();syncInstallUI();return true;}if(document.fullscreenEnabled){await document.documentElement.requestFullscreen({navigationUI:'hide'});syncInstallUI();return true;}}catch(err){console.debug('Fullscreen',err);}return false;
}
function syncInstallUI(){
  // R10.15 · APK: la instalación PWA no aplica dentro de la app nativa → UI oculta siempre.
  if(IS_NATIVE_APK){document.documentElement.classList.add('native-apk');try{syncShellMode();}catch{}if(els.installBtn)els.installBtn.classList.add('is-hidden');if(els.onboardingInstallBtn){els.onboardingInstallBtn.classList.add('is-hidden');els.onboardingInstallBtn.setAttribute('aria-hidden','true');}return;}
  if(!els.installBtn)return;syncShellMode();const installed=isInstalledDisplay();els.installBtn.classList.remove('is-hidden');els.installBtn.classList.toggle('installed',installed);
  els.installBtn.classList.toggle('fullscreen-action',installed);els.installBtn.innerHTML=installed?'⛶':'⇩ <span>Instalar</span>';els.installBtn.title=installed?'Pantalla completa':'Instalar MUSIC PLAY como aplicación';els.installBtn.setAttribute('aria-label',installed?'Alternar pantalla completa':'Instalar MUSIC PLAY');
  if(els.onboardingInstallBtn){els.onboardingInstallBtn.classList.toggle('is-hidden',installed);els.onboardingInstallBtn.setAttribute('aria-hidden',installed?'true':'false');}
}
function androidChromeIntent(){
  if(!/android/i.test(navigator.userAgent||''))return '';
  const scheme=location.protocol.replace(':','')||'https',target=`${location.host}${location.pathname}${location.search}`;return `intent://${target}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(location.href)};end`;
}
async function triggerNativeInstall(){
  if(!state.installPrompt)return false;try{state.installPrompt.prompt();const choice=await state.installPrompt.userChoice;if(choice?.outcome==='accepted'){toast('Instalando MUSIC PLAY…');}state.installPrompt=null;syncInstallUI();return choice?.outcome==='accepted';}catch(err){console.warn('Install prompt',err);return false;}
}
async function handleInstallClick(){if(isInstalledDisplay()){await requestImmersive();return;}if(state.installPrompt){const ok=await triggerNativeInstall();if(ok)return;}const ua=navigator.userAgent||'',android=/android/i.test(ua),embedded=/;\s*wv\)|FBAN|FBAV|Instagram|Line\//i.test(ua);if(android&&embedded){const intent=androidChromeIntent();if(intent){toast('Abriendo MUSIC PLAY en Chrome…',1800);setTimeout(()=>{location.href=intent;},120);return;}}openInstallSheet();}

async function collectPwaDiagnostics(){
  const secure=location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname);let manifest=false,swReg=false,controlled=!!navigator.serviceWorker?.controller;
  try{const m=await fetch('./manifest.webmanifest',{cache:'no-store'});manifest=m.ok;}catch{}
  try{swReg=!!(await navigator.serviceWorker?.getRegistration?.('./'));}catch{}
  return {secure,manifest,swReg,controlled,prompt:!!state.installPrompt,installed:isInstalledDisplay(),chrome:/Chrome|CriOS/i.test(navigator.userAgent||''),android:/android/i.test(navigator.userAgent||''),ios:/iphone|ipad|ipod/i.test(navigator.userAgent||'')};
}
function pwaDiagnosticMarkup(d){const row=(label,ok,detail='')=>`<div class="pwa-diag-row"><span>${safeText(label)}</span><b class="${ok?'ok':'no'}">${ok?'✓':'✕'}</b>${detail?`<small>${safeText(detail)}</small>`:''}</div>`;return `<div class="pwa-diagnostics">${row('HTTPS',d.secure)}${row('Manifest',d.manifest)}${row('Service Worker registrado',d.swReg)}${row('Página controlada',d.controlled)}${row('Prompt de instalación',d.prompt,d.prompt?'Listo para instalar':'Chrome aún no lo entregó')}</div>`;}
function openInstallSheet({automatic=false}={}){
  const installed=isInstalledDisplay(),ua=navigator.userAgent||'',ios=/iphone|ipad|ipod/i.test(ua),android=/android/i.test(ua),hasPrompt=!!state.installPrompt;
  let title=installed?'✓ MUSIC PLAY instalada':hasPrompt?'⇩ Instalar MUSIC PLAY':'PWA · instalación';
  let copy=installed?'Ya estás usando MUSIC PLAY como aplicación.':hasPrompt?'Chrome confirmó que esta versión es instalable.':'El navegador todavía no entregó el instalador nativo. MUSIC PLAY puede revisar exactamente qué requisito falta.';
  if(ios&&!installed)copy='En iPhone/iPad la instalación se hace desde Compartir → Añadir a pantalla de inicio.';
  else if(android&&!hasPrompt&&!installed)copy='Este visor no ofrece el instalador. Abre MUSIC PLAY en Chrome; allí el botón de instalación se activará cuando Chrome confirme la PWA.';
  openSheet(`<h2 class="sheet-title">${title}</h2><p class="sheet-copy">${copy}</p><div id="pwaDiagHost"><div class="install-note"><strong>PWA</strong><span>Comprobando HTTPS, manifest, Service Worker y prompt del navegador…</span></div></div><div class="sheet-stack">${hasPrompt?'<button class="sheet-btn" data-native>⇩ Instalar ahora<small>Usar el instalador nativo de Chrome</small></button>':''}${android&&!hasPrompt&&!installed?'<button class="sheet-btn" data-chrome>◎ Abrir en Chrome<small>Continuar la instalación en el navegador compatible</small></button>':''}${!hasPrompt&&!installed?'<button class="sheet-btn" data-recheck>↻ Revisar instalación<small>Volver a comprobar el estado real</small></button>':''}<button class="sheet-btn" data-full>⛶ Pantalla completa<small>Oculta la interfaz del navegador durante esta sesión si está permitido</small></button><button class="sheet-btn" data-close>${automatic?'Ahora no':'Cerrar'}</button></div>`,root=>{
    const diagHost=$('#pwaDiagHost',root);const refresh=async()=>{const d=await collectPwaDiagnostics();diagHost.innerHTML=pwaDiagnosticMarkup(d);if(d.prompt&&!state.installPrompt){/* state may update on next event */}syncInstallUI();};refresh();
    $('[data-native]',root)&&( $('[data-native]',root).onclick=async()=>{const ok=await triggerNativeInstall();if(ok)closeDialog(els.sheetDialog);else refresh();});
    $('[data-chrome]',root)&&( $('[data-chrome]',root).onclick=()=>{const intent=androidChromeIntent();if(intent){location.href=intent;}else toast('Abre esta misma dirección en Chrome');});
    $('[data-recheck]',root)&&( $('[data-recheck]',root).onclick=async()=>{await registerSW();await refresh();toast(state.installPrompt?'Instalador listo ✓':'Diagnóstico actualizado');});
    $('[data-full]',root).onclick=async()=>{await requestImmersive();};$('[data-close]',root).onclick=()=>closeDialog(els.sheetDialog);
  });
}

function maybeShowInstallCoach(){
  syncInstallUI();if(IS_NATIVE_APK)return;if(isInstalledDisplay()||state.installCoachShown)return;try{if(sessionStorage.getItem('mpf-install-coach-r10.1'))return;sessionStorage.setItem('mpf-install-coach-r10.1','1');}catch{}state.installCoachShown=true;setTimeout(()=>{if(!els.sheetDialog.open)openInstallSheet({automatic:true});},650);
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
  els.homeBtn.onclick=()=>showView('home');els.moreBtn.onclick=openMoreMenu;if(els.boostBtn)els.boostBtn.onclick=()=>{const next=state.soundMode===SOUND_MODES.boost?SOUND_MODES.auto:SOUND_MODES.boost;setSoundMode(next);};
  els.navHome.onclick=()=>showView('home');els.navSearch.onclick=()=>showView('search');els.navLibrary.onclick=()=>{if(state.activeView==='library'&&state.libraryTab==='playlists'&&state.playlistDetailOpen){closePlaylistDetail();return;}showView('library');};if(els.navRadio)els.navRadio.onclick=()=>showView('radio');if(els.floatMiniBtn)els.floatMiniBtn.onclick=toggleFloatMini;
  els.homeSearchBtn.onclick=()=>showView('search');els.homeAllPlaylistsBtn.onclick=()=>{state.libraryTab='playlists';state.playlistDetailOpen=false;showView('library');};els.homeAllAlbumsBtn.onclick=()=>{state.libraryTab='albums';state.playlistDetailOpen=false;showView('library');};if(els.homeAllPodcastsBtn)els.homeAllPodcastsBtn.onclick=openPodcastHub;
  window.addEventListener('mp:decades-updated',()=>{if(state.activeView==='home')renderHomeDecades();});
  els.favoritesShortcut.onclick=()=>openSmartCollection(SMART_IDS.favorites);els.mostPlayedShortcut.onclick=()=>openSmartCollection(SMART_IDS.most);els.recentShortcut.onclick=()=>openSmartCollection(SMART_IDS.recent);els.repeatShortcut.onclick=()=>openSmartCollection(SMART_IDS.repeat);els.rediscoverShortcut.onclick=()=>setPlaybackMode(PLAY_MODES.rediscover,{autoplay:true});els.radioShortcut.onclick=()=>setPlaybackMode(PLAY_MODES.radio,{autoplay:true});els.surpriseShortcut.onclick=()=>setPlaybackMode(PLAY_MODES.surprise,{autoplay:true});els.mixShortcut.onclick=()=>setPlaybackMode(PLAY_MODES.smart,{autoplay:true});
  els.onboardingInstallBtn.onclick=handleInstallClick;els.onboardingFileBtn.onclick=pickFiles;els.onboardingFolderBtn.onclick=pickFolder;els.onboardingLinkBtn.onclick=()=>openLinkSheet();els.onboardingMusicBtn.onclick=()=>{state.libraryTab='songs';showView('library');};els.onboardingPlayBtn.onclick=togglePlay;if(els.onboardingStartBtn)els.onboardingStartBtn.onclick=async()=>{state.firstRunComplete=true;await persistPrefs();renderHome();openLoadSheet();};

  [els.libraryTabPlaylists,els.libraryTabSongs,els.libraryTabAlbums,els.libraryTabRadio].filter(Boolean).forEach(b=>b.onclick=()=>{if(b.dataset.tab==='playlists'&&state.libraryTab==='playlists'&&state.playlistDetailOpen)return closePlaylistDetail();setLibraryTab(b.dataset.tab);});
  if(els.libraryTabPodcast)els.libraryTabPodcast.onclick=()=>openPodcastHub(); // R10.15: pestaña Podcast en Biblioteca (abre el hub existente)
  els.librarySortSelect.onchange=()=>{state.librarySort=els.librarySortSelect.value;persistPrefs();renderLibraryShell();};
  els.librarySearchBtn.onclick=()=>showView('search');els.libraryAddBtn.onclick=openLibraryNewSheet;els.libraryNewPlaylistFab.onclick=openLibraryNewSheet;els.searchNewBtn.onclick=openLibraryNewSheet;els.emptyLoadBtn.onclick=openLoadSheet;
  els.emptyNewPlaylistBtn.onclick=()=>openCreatePlaylistSheet();els.emptyImportPlaylistBtn.onclick=()=>openLinkSheet();
  els.playlistDetailBack.onclick=closePlaylistDetail;els.playlistMenuBtn.onclick=openPlaylistMenuSheet;els.openLibraryFromPlaylists.onclick=()=>{const pl=getActivePlaylist();if(pl)openAddSongsToPlaylistSheet(pl.id);};els.addLinkToPlaylistBtn.onclick=()=>{const pl=getActivePlaylist();if(pl)openLinkSheet('',pl.id);};
  els.playPlaylistBtn.onclick=async()=>{state.playbackMode=PLAY_MODES.normal;state.shuffle=false;state.modePlayedIds=[];if(state.activeSmartId){const tracks=getSmartTracks(state.activeSmartId).filter(playable);if(!tracks.length)return toast('Esta lista automática todavía está vacía');state.baseQueueIds=tracks.map(t=>t.id);await persistPrefs();return playTrack(tracks[0].id,tracks.map(t=>t.id),{preserveBase:true});}const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');const tracks=getPlaylistTracks(pl).filter(playable);if(tracks.length){state.baseQueueIds=tracks.map(t=>t.id);await persistPrefs();const resumeId=playlistContentType(pl)==='podcast'&&els.playPlaylistBtn.dataset.resumeId&&tracks.some(t=>t.id===els.playPlaylistBtn.dataset.resumeId)?els.playPlaylistBtn.dataset.resumeId:tracks[0].id;return playTrack(resumeId,tracks.map(t=>t.id),{preserveBase:true});}const spotifySrc=(pl.sources||[]).find(x=>x.source==='Spotify')||(pl.externalRef?.source==='Spotify'?pl.externalRef:null);if(spotifySrc?.url){openSpotifyPodcast(spotifySrc.url);persistPrefs();return;}if((pl.sources||[]).length||pl.externalRef){await persistPrefs();return playExternalPlaylist(pl);}toast('Esta playlist está vacía');};
  els.mixPlaylistBtn.onclick=()=>{if(state.activeSmartId)return startMix(getSmartTracks(state.activeSmartId).map(t=>t.id));const pl=getActivePlaylist();if(!pl)return toast('Elige una playlist');startMix(pl.trackIds||[]);};

  els.searchInput.oninput=()=>{if(searchInputRaf)cancelAnimationFrame(searchInputRaf);searchInputRaf=requestAnimationFrame(()=>{state.search=els.searchInput.value;renderLibrarySongs();});};
  els.playSongScopeBtn.onclick=playCurrentSongScope;els.songScopeModeBtn.onclick=openSongScopeModes;els.favoriteSongScopeBtn.onclick=openSongScopeFavoriteSheet;els.playlistSongScopeBtn.onclick=openSongScopePlaylistSheet;
  els.globalSearchInput.oninput=()=>{if(globalSearchRaf)cancelAnimationFrame(globalSearchRaf);globalSearchRaf=requestAnimationFrame(()=>{state.globalSearch=els.globalSearchInput.value;renderSearch();});};
  els.globalSearchInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&/^https?:\/\//i.test(els.globalSearchInput.value.trim())){e.preventDefault();openLinkSheet(els.globalSearchInput.value.trim());}});
  els.searchLinkHint.onclick=()=>openLinkSheet(els.globalSearchInput.value.trim());

  els.fileInput.onchange=()=>{const target=state.pendingImportTargetId,label=state.pendingImportLabel||'Archivos importados';state.pendingImportTargetId='';state.pendingImportLabel='';importFiles(els.fileInput.files,{label,targetPlaylistId:target});els.fileInput.value='';};
  els.folderInput.onchange=()=>{const fs=els.folderInput.files,target=state.pendingImportTargetId,label=state.pendingImportLabel||fs?.[0]?.webkitRelativePath?.split('/')?.[0]||'Carpeta importada';state.pendingImportTargetId='';state.pendingImportLabel='';importFiles(fs,{label,targetPlaylistId:target});els.folderInput.value='';};
  els.backupInput.onchange=()=>{const f=els.backupInput.files?.[0];els.backupInput.value='';if(f)restoreBackupFile(f);};els.m3uInput.onchange=()=>{const f=els.m3uInput.files?.[0];els.m3uInput.value='';if(f)importM3UFile(f);};

  els.miniOpen.onclick=()=>{if(els.miniOpen._gestureConsumedUntil&&performance.now()<els.miniOpen._gestureConsumedUntil)return;openDialog(els.playerDialog);};[els.playBtn,els.fullPlayBtn].forEach(b=>b.onclick=togglePlay);[els.prevBtn,els.fullPrevBtn].forEach(b=>b.onclick=prevTrack);[els.nextBtn,els.fullNextBtn].forEach(b=>b.onclick=nextTrack);els.shuffleBtn.onclick=()=>openPlaybackModesSheet();els.favoriteBtn.onclick=()=>toggleFavorite();els.miniFavoriteBtn.onclick=e=>{e.stopPropagation();toggleFavorite();};els.miniAddPlaylistBtn.onclick=e=>{e.stopPropagation();const t=getCurrentTrack();if(t)openPlaylistPickerSheet(t.id);};els.miniQueueBtn.onclick=e=>{e.stopPropagation();openQueueSheet();};els.queueManagerBtn.onclick=()=>openQueueSheet();els.podcastBackBtn.onclick=()=>seekBy(-15);els.podcastForwardBtn.onclick=()=>seekBy(30);els.podcastRateBtn.onclick=cyclePodcastRate;els.remoteResizeBtn.onclick=e=>{e.stopPropagation();toggleRemoteDockSize();};els.remoteShareBtn.onclick=e=>{e.stopPropagation();shareTrack();};els.remoteCloseBtn.onclick=e=>{e.stopPropagation();closeRemoteDockByUser();};if(els.playlistModeBtn)els.playlistModeBtn.onclick=()=>{const pl=getActivePlaylist();openPlaybackModesSheet({contextIds:pl?(pl.trackIds||[]):null});};els.fmExpand.onclick=exitFloatMini;els.fmClose.onclick=exitFloatMini;els.fmPlay.onclick=togglePlay;els.fmPrev.onclick=prevTrack;els.fmNext.onclick=nextTrack;els.fmProgress.oninput=()=>{els.progressRange.value=els.fmProgress.value;seekFromRange();syncFloatMiniProgress();};bindFloatMiniDrag();els.shareCurrentBtn.onclick=()=>shareTrack();els.soundModeBtn.onclick=()=>openSoundModeSheet();bindRemoteDockDrag();syncRemoteDockSize();els.progressRange.oninput=seekFromRange;els.volumeRange.oninput=()=>{state.volume=Number(els.volumeRange.value)||0;els.audio.volume=state.volume;if(els.directAudio)els.directAudio.volume=state.volume;ytApplyNativeVolume();if(ytPlayer)try{ytPlayer.setVolume(Math.round(state.volume*100));}catch{}if(scWidget)try{scWidget.setVolume(Math.round(state.volume*100));}catch{}persistPrefs();};els.addCurrentToPlaylist.onclick=()=>{const t=getCurrentTrack();if(t)openPlaylistPickerSheet(t.id);};if(els.repeatCurrentBtn)els.repeatCurrentBtn.onclick=()=>{const t=getCurrentTrack();if(t)toggleRepeatOne(t.id);};bindCurrentTrackSwipe(els.miniOpen);bindCurrentTrackSwipe(els.playerArtwork);

  els.audio.addEventListener('timeupdate',updateProgress);els.audio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(state.currentEngine==='local'&&t&&!t.duration&&Number.isFinite(els.audio.duration)){t.duration=els.audio.duration;saveRemoteTrack(t);}updateProgress();});els.audio.addEventListener('play',()=>{if(state.currentEngine==='local'){state.playing=true;syncMediaPlaybackState();renderPlayer();renderHome();}});els.audio.addEventListener('pause',()=>{if(state.currentEngine==='local'){state.playing=false;syncMediaPlaybackState();renderPlayer();renderHome();}});els.audio.addEventListener('ended',()=>{if(state.currentEngine==='local')handleNaturalEnd();});els.audio.addEventListener('error',()=>{if(state.currentEngine==='local')toast('Este formato no pudo reproducirse en el navegador',3800);});
  if(els.directAudio){els.directAudio.addEventListener('timeupdate',updateProgress);els.directAudio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(state.currentEngine==='direct'&&t&&!t.duration&&Number.isFinite(els.directAudio.duration)){t.duration=els.directAudio.duration;saveRemoteTrack(t);}updateProgress();});els.directAudio.addEventListener('play',()=>{if(state.currentEngine==='direct'){state.playing=true;syncMediaPlaybackState();renderPlayer();renderHome();}});els.directAudio.addEventListener('pause',()=>{if(state.currentEngine==='direct'){state.playing=false;syncMediaPlaybackState();renderPlayer();renderHome();}});els.directAudio.addEventListener('ended',()=>{if(state.currentEngine==='direct')handleNaturalEnd();});els.directAudio.addEventListener('error',()=>{if(state.currentEngine==='direct'){const t=getCurrentTrack();if(t)handleRuntimePlaybackFailure(t,'Enlace multimedia no disponible');}});}

  // R10.11 · eventos del motor nativo de YouTube (audio y video directos)
  if(els.ytAudio){
    els.ytAudio.addEventListener('timeupdate',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native')updateProgress();});
    els.ytAudio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&t&&!t.duration&&Number.isFinite(els.ytAudio.duration)){t.duration=els.ytAudio.duration;saveRemoteTrack(t);}updateProgress();});
    els.ytAudio.addEventListener('play',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'){state.playing=true;syncMediaPlaybackState();renderPlayer();}});
    els.ytAudio.addEventListener('playing',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'){state.playing=true;syncMediaPlaybackState();renderPlayer();}});
    els.ytAudio.addEventListener('pause',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&!state.ytResumeVideo){state.playing=false;syncMediaPlaybackState();renderPlayer();}});
    els.ytAudio.addEventListener('ended',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'){if(state.ytResumeVideo)state.ytResumeVideo=false;handleNaturalEnd();}});
    els.ytAudio.addEventListener('error',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&!state.ytResumeVideo)ytHandleNativeError();});
  }
  if(els.ytVideo){
    els.ytVideo.addEventListener('timeupdate',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video')updateProgress();});
    els.ytVideo.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&t&&!t.duration&&Number.isFinite(els.ytVideo.duration)){t.duration=els.ytVideo.duration;saveRemoteTrack(t);}updateProgress();});
    els.ytVideo.addEventListener('play',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video'){state.playing=true;syncMediaPlaybackState();renderPlayer();}});
    els.ytVideo.addEventListener('pause',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video'){
      // R10.12: si el navegador pausa el video al bloquearse la pantalla, traspasar
      // a la pista de audio en la misma posición para que la música SIGA sonando.
      if(document.hidden&&!state.ytResumeVideo&&!els.ytVideo.ended){ytSwapToAudioForBackground();return;}
      if(!state.ytResumeVideo){state.playing=false;syncMediaPlaybackState();renderPlayer();}}});
    els.ytVideo.addEventListener('ended',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video')handleNaturalEnd();});
    els.ytVideo.addEventListener('error',()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video')ytHandleNativeError();});
  }

  ['dragenter','dragover'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropHint.classList.add('show');}));['dragleave','drop'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();if(ev==='drop'||!e.relatedTarget)els.dropHint.classList.remove('show');}));window.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)importFiles(e.dataTransfer.files);});
  window.addEventListener('appinstalled',()=>{state.installPrompt=null;syncInstallUI();toast('MUSIC PLAY instalada ✓ · ábrela desde su icono');});['fullscreen','standalone','minimal-ui'].forEach(mode=>window.matchMedia?.(`(display-mode: ${mode})`)?.addEventListener?.('change',syncInstallUI));els.installBtn.onclick=handleInstallClick;els.updateBtn.onclick=applyAvailableUpdate;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){
    // R10.17: si suena un video nativo de YouTube, delegar al servicio nativo
    // (ExoPlayer en FloatingPlayerService) que sobrevive al lock screen.
    if(IS_NATIVE_APK&&state.currentEngine==='youtube'&&state.ytEngine==='native'&&state.ytNativeKind==='video'){ytSwapToAudioServiceForBackground();return;}
    // R10.11: con el motor nativo el audio sigue sonando con la pantalla bloqueada.
    // Si era video, se transfiere a la pista de audio en la misma posición.
    if(state.currentEngine==='youtube'&&state.ytEngine==='native'){ytSwapToAudioForBackground();return;}
    state.remoteExpectedPlaying=state.playing&&['youtube','soundcloud'].includes(state.currentEngine);
  }else{
    checkForUpdates(false);
    // R10.17: si el servicio nativo tenía el audio (BG), reclamar el video.
    if(IS_NATIVE_APK&&state.ytService&&state.ytResumeVideo){ytReclaimVideoFromService();}
    ytRestoreVideoIfPossible();
    if(state.remoteExpectedPlaying){state.remoteExpectedPlaying=false;setTimeout(()=>{if(state.currentEngine==='youtube'&&state.ytEngine==='iframe'&&ytPlayer&&!state.playing){try{ytPlayer.playVideo();}catch{}setTimeout(()=>{if(!state.playing)toast('YouTube puede pausar al bloquear la pantalla · toca Play para continuar',4200);},900);}else if(state.currentEngine==='soundcloud'&&scWidget&&!state.playing){try{scWidget.play();}catch{}}},150);}
  }});window.addEventListener('online',()=>checkForUpdates(true));
  document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.key==='Escape'&&state.floatMini&&!els.sheetDialog.open&&!els.playerDialog.open){exitFloatMini();return;}if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.key.toLowerCase()==='m')startMix(getFilteredTracks().map(t=>t.id));else if(e.key.toLowerCase()==='l')showView('library');else if(e.key==='/'){e.preventDefault();showView('search');}});window.addEventListener('pagehide',()=>{finalizeListenSession('pause');persistPrefs();});window.addEventListener('beforeunload',persistPrefs);
}

async function init(){
  document.documentElement.dataset.theme=state.theme;
  try{state.storageReady=await db.init();}catch{state.storageReady=false;}
  await loadStoredData();
  await ensureVersionRecovery();
  if(els.librarySortSelect)els.librarySortSelect.value=state.librarySort||'recent';
  bindEvents();
  syncInstallUI();bindAutoImmersive();
  await registerSW();
  render();
  els.audio.volume=state.volume;if(els.directAudio)els.directAudio.volume=state.volume;
  setupMediaSession();
  // R10.20 · Sincronizar el estado BOOST nativo con el preferido al iniciar
  if(IS_NATIVE_APK&&window.HappyNative?.setBoost){
    try{window.HappyNative.setBoost(state.soundMode===SOUND_MODES.boost);}catch{}
  }
  try{navigator.storage?.persist?.();}catch{}
  checkForUpdates(true);
  const requestedView=new URLSearchParams(location.search).get('view');showView(['home','search','library','playlist','studio','radio'].includes(requestedView)?requestedView:state.activeView);
  await sleep(2000);
  els.intro.classList.add('hide');
  els.app.classList.remove('is-hidden');
  setTimeout(()=>els.intro.remove(),450);
  if(hasRecoveryData())maybeShowInstallCoach();
  else setTimeout(async()=>{if(!els.sheetDialog.open)await maybeOfferInternalRecovery();if(!els.sheetDialog.open)maybeShowInstallCoach();},450);
}
// =============================================================
// R10.14 · PUENTE PARA MÓDULOS ADITIVOS (SP · Estudio Podcast)
// Expone referencias de solo-lectura/uso controlado a sp.js sin
// exponer el IIFE. No altera ningún flujo existente.
// =============================================================
// =============================================================
// R10.15 · PUENTE NATIVO APK (HappyNative · WebView + Servicio)
// - Comandos remotos del servicio (notificación/MediaSession/Bluetooth/ventana flotante).
// - Estado de reproducción → MediaSessionCompat nativa (metadata AVRCP + PlaybackState).
// - Importación de carpetas: ACTION_OPEN_DOCUMENT_TREE nativo → copia local
//   servida por el AssetLoader → misma tubería de importación de siempre.
// Todo es ADITIVO: sin HappyNative (navegador/PWA) nada de esto se activa.
// =============================================================
const HAPPY_BRIDGE = (() => {
  if (!IS_NATIVE_APK) return null;
  const api = {
    cmd(cmd) {
      try {
        if (cmd === 'next') nextTrack();
        else if (cmd === 'prev') prevTrack();
        else if (cmd === 'play') happySetPlaying(true);
        else if (cmd === 'pause') happySetPlaying(false);
        else if (cmd === 'toggle') togglePlay();
      } catch (err) { console.warn('bridge cmd', err); }
    },
    folderResult(json) {
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const resolver = api._resolveFolder;
        if (resolver) { api._resolveFolder = null; resolver(data); }
      } catch {}
    },
    becomePlayer(payload) {
      try { happyBecomePlayer(typeof payload === 'string' ? JSON.parse(payload) : payload); } catch {}
    },
    nativeEvent(payload) {
      let event=payload;try{if(typeof event==='string')event=JSON.parse(event);}catch{return;}
      if(String(event?.type||'').startsWith('native/radio/'))return window.MP_LIVE_RADIO?.handleNativeEvent?.(event);
      if(event?.type==='native/media/state'){
        const p=event.payload||{};state.ytService=p.state!=='idle'&&p.kind==='media';state.playing=p.state==='playing';state.nativePositionMs=Number(p.positionMs)||0;state.nativeDurationMs=Number(p.durationMs)||0;renderPlayer();syncMediaPlaybackState();
      }
    }
  };
  window.__HAPPY_BRIDGE__ = api;
  return api;
})();

function happyEngineSnapshot() {
  try {
    if(state.ytService)return {playing:!!state.playing,pos:(state.nativePositionMs||0)/1000,dur:(state.nativeDurationMs||0)/1000};
    if (state.currentEngine === 'youtube' && state.ytEngine === 'native') { const el = ytNativeElement(); return { playing: !!(el && !el.paused && !el.ended), pos: el?.currentTime || 0, dur: el?.duration || 0 }; }
    if (state.currentEngine === 'youtube' && ytPlayer) { let st = -1, pos = 0, dur = 0; try { st = ytPlayer.getPlayerState(); pos = ytPlayer.getCurrentTime() || 0; dur = ytPlayer.getDuration() || 0; } catch {} return { playing: st === 1, pos, dur }; }
    if (state.currentEngine === 'soundcloud' && scWidget) return { playing: !!state.playing, pos: 0, dur: getCurrentTrack()?.duration || 0 };
    const a = activeNativeAudio();
    return { playing: !!(a && !a.paused && !a.ended), pos: a?.currentTime || 0, dur: a?.duration || 0 };
  } catch { return { playing: false, pos: 0, dur: 0 }; }
}

async function happySetPlaying(playing) {
  if(window.MP_LIVE_RADIO?.isActive?.())return playing?window.MP_LIVE_RADIO.resume():window.MP_LIVE_RADIO.pause();
  const t = getCurrentTrack();
  if (!t) { if (playing) togglePlay(); return; }
  if (!playing) {
    if (state.currentEngine === 'youtube' && state.ytEngine === 'native') { try { ytNativeElement()?.pause?.(); } catch {} return; }
    if (state.currentEngine === 'youtube' && ytPlayer) { try { ytPlayer.pauseVideo(); } catch {} return; }
    if (state.currentEngine === 'soundcloud' && scWidget) { try { scWidget.pause(); } catch {} return; }
    try { activeNativeAudio()?.pause?.(); } catch {}
    return;
  }
  if (state.currentEngine === 'youtube' && state.ytEngine === 'native') { const el = ytNativeElement(); if (el && el.src) { try { await el.play(); } catch {} } else playTrack(t.id, state.queueIds.length ? state.queueIds : [t.id], { preserveBase: true }); return; }
  if (state.currentEngine === 'youtube' && ytPlayer) { try { ytPlayer.playVideo(); } catch {} return; }
  if (state.currentEngine === 'soundcloud' && scWidget) { try { scWidget.play(); } catch {} return; }
  const a = activeNativeAudio();
  if (a && a.src) { try { await a.play(); } catch {} } else playTrack(t.id, state.queueIds.length ? state.queueIds : [t.id], { preserveBase: true });
}

async function happyBecomePlayer(payload) {
  try {
    const trackId = payload?.trackId || '', posMs = Number(payload?.posMs) || 0;
    const t = trackId ? state.tracks.find(x => x.id === trackId) : getCurrentTrack();
    if (t) await playTrack(t.id, state.queueIds.length ? state.queueIds : [t.id], { preserveBase: true });
    if (posMs > 800) setTimeout(() => {
      try {
        const sec = posMs / 1000;
        if (state.currentEngine === 'youtube' && state.ytEngine === 'native') { const el = ytNativeElement(); if (el) el.currentTime = sec; }
        else if (state.currentEngine === 'youtube' && ytPlayer) { try { ytPlayer.seekTo(sec, true); } catch {} }
        else { const a = activeNativeAudio(); if (a) a.currentTime = sec; }
      } catch {}
    }, 900);
  } catch (err) { console.warn('bridge becomePlayer', err); }
}

// Empuja el estado al servicio nativo → MediaSessionCompat (metadata en el auto/Bluetooth) + notificación
function happyPushMediaState() {
  if (!IS_NATIVE_APK || !window.HappyNative?.mediaState) return;
  if(window.MP_LIVE_RADIO?.isActive?.()||state.ytService)return;
  try {
    const t = getCurrentTrack(), snap = happyEngineSnapshot();
    window.HappyNative.mediaState(JSON.stringify({
      title: t?.title || 'MUSIC PLAY', artist: t?.artist || '', album: t?.album || '',
      playing: !!snap.playing, positionMs: Math.round((snap.pos || 0) * 1000), durationMs: Math.round((snap.dur || 0) * 1000),
      canNext: true, canPrev: true, trackId: t?.id || ''
    }));
  } catch {}
}

// Importación de carpeta en APK: el nativo copia los audios y los sirve por el AssetLoader;
// aquí se reconstruyen como File (con webkitRelativePath) y se reusa importFiles intacto.
async function importFolderViaNative(options = {}) {
  if (!IS_NATIVE_APK || !window.HappyNative?.importFolder) return false;
  const result = await new Promise(resolve => {
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 180000);
    HAPPY_BRIDGE._resolveFolder = data => { if (!done) { done = true; clearTimeout(timer); resolve(data); } };
    try { window.HappyNative.importFolder(); } catch (err) { clearTimeout(timer); resolve(null); }
  });
  if (!result || result.ok === false) {
    if (result?.reason === 'denied') toast('Permiso de carpeta denegado');
    else if (result) toast('No se pudo abrir la carpeta');
    return true;
  }
  const files = result.files || [];
  if (!files.length) { toast('La carpeta no contiene archivos de audio o video'); return true; }
  showLoader('Preparando biblioteca local…', `Leyendo ${files.length} archivos`);
  const out = []; let i = 0;
  for (const f of files) {
    try {
      const res = await fetch(f.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], f.name, { type: blob.type || '', lastModified: Number(f.lastModified) || Date.now() });
      try { Object.defineProperty(file, 'webkitRelativePath', { value: f.relativePath || f.name, configurable: true }); } catch {}
      out.push(file);
    } catch {}
    i++; if (i % 6 === 0 || i === files.length) updateLoaderProgress(i, files.length, 'leyendo archivos');
    if (i % 10 === 0) await sleep(0);
  }
  hideLoader();
  if (!out.length) { toast('No se pudieron leer los archivos de la carpeta'); return true; }
  await importFiles(out, { label: result.rootName || options.label || 'Carpeta importada', targetPlaylistId: options.targetPlaylistId || '' });
  return true;
}

// Difusión periódica del estado (metadata AVRCP siempre fresca para la pantalla del auto)
if (IS_NATIVE_APK) {
  setInterval(happyPushMediaState, 900);
  window.addEventListener('mp:playstate', happyPushMediaState);
}

window.MP = Object.freeze({
  version: APP_VERSION, build: BUILD, state, db, els,
  toast, openSheet, closeDialog, showLoader, hideLoader, updateLoaderProgress,
  formatTime, safeText, now, sleep, remoteHash, hashId, safeFileName, downloadText,
  normalizeTrack, normalizePlaylist, persistPlaylist, persistPrefs,
  saveTrackAndSource, createPlaylist, addTrackToPlaylist, getTrackFile,
  playTrack, showView, render, renderHome, stopAllEngines, toggleFloatMini,
  queueTrack, saveRemoteTrack, isPodcastTrack
});
window.getYouTubePlaylistIds = getYouTubePlaylistIds;

init().catch(err=>{console.error(err);els.intro?.classList.add('hide');els.app?.classList.remove('is-hidden');toast('La app abrió en modo seguro');});

})();
