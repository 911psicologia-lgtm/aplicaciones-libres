(() => {
'use strict';

const BUILD = '2026.08.31-r4-universal-prototype';
const DB_NAME = 'mpf-minimal-db';
const DB_VERSION = 2;
const PLAYABLE_SOURCES = new Set(['local','direct','youtube','soundcloud','youtube-playlist']);
const MEDIA_EXT = new Set(['mp3','m4a','aac','wav','ogg','oga','opus','flac','webm','mp4','m4v','mov','3gp','wma','wmv','avi','mkv']);
const VIDEO_EXT = new Set(['mp4','m4v','mov','3gp','webm','wmv','avi','mkv']);
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const now = () => Date.now();

const els = {
  intro: $('#intro'), app: $('#app'), audio: $('#audio'),
  homeBtn: $('#homeBtn'), installBtn: $('#installBtn'),
  homeView: $('#homeView'), libraryView: $('#libraryView'), playlistView: $('#playlistView'),
  loadAction: $('#loadAction'), playAction: $('#playAction'), playlistAction: $('#playlistAction'), mixAction: $('#mixAction'),
  loadFilesQuick: $('#loadFilesQuick'), loadFolderQuick: $('#loadFolderQuick'), loadLinkQuick: $('#loadLinkQuick'), openLibraryQuick: $('#openLibraryQuick'), createPlaylistQuick: $('#createPlaylistQuick'),
  countTracks: $('#countTracks'), countMusic: $('#countMusic'), countPlaylists: $('#countPlaylists'),
  libraryAddBtn: $('#libraryAddBtn'), searchInput: $('#searchInput'), genreChips: $('#genreChips'),
  libraryEmpty: $('#libraryEmpty'), libraryList: $('#libraryList'), emptyLoadBtn: $('#emptyLoadBtn'),
  playlistTabs: $('#playlistTabs'), playlistList: $('#playlistList'), playlistEmpty: $('#playlistEmpty'),
  newPlaylistBtn: $('#newPlaylistBtn'), openLibraryFromPlaylists: $('#openLibraryFromPlaylists'), playPlaylistBtn: $('#playPlaylistBtn'), mixPlaylistBtn: $('#mixPlaylistBtn'),
  miniPlayer: $('#miniPlayer'), miniOpen: $('#miniOpen'), miniTitle: $('#miniTitle'), miniArtist: $('#miniArtist'),
  playBtn: $('#playBtn'), prevBtn: $('#prevBtn'), nextBtn: $('#nextBtn'),
  playerDialog: $('#playerDialog'), fullTitle: $('#fullTitle'), fullArtist: $('#fullArtist'), progressRange: $('#progressRange'), timeNow: $('#timeNow'), timeTotal: $('#timeTotal'),
  fullPlayBtn: $('#fullPlayBtn'), fullPrevBtn: $('#fullPrevBtn'), fullNextBtn: $('#fullNextBtn'), shuffleBtn: $('#shuffleBtn'), favoriteBtn: $('#favoriteBtn'), volumeRange: $('#volumeRange'), addCurrentToPlaylist: $('#addCurrentToPlaylist'),
  sheetDialog: $('#sheetDialog'), sheetContent: $('#sheetContent'),
  remoteDock: $('#remoteDock'), remoteStage: $('#remoteStage'), remoteLabel: $('#remoteLabel'), ytProbeHost: $('#ytProbeHost'),
  dropHint: $('#dropHint'), loader: $('#loader'), loaderTitle: $('#loaderTitle'), loaderText: $('#loaderText'), toast: $('#toast'),
  fileInput: $('#fileInput'), folderInput: $('#folderInput')
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
  tracks: [], playlists: [], activeView: 'home', activeGenre: 'all', activePlaylistId: 'pl_main',
  currentId: null, queueIds: [], queueIndex: -1, playing: false, shuffle: false,
  volume: 0.92, search: '', theme: 'dark', objectUrl: null, installPrompt: null, storageReady: false,
  currentEngine: 'none'
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
function normalizeTrack(t){ return {...t,sourceKind:t.sourceKind||'local',favorite:!!t.favorite,playCount:Number(t.playCount)||0,lastPlayed:Number(t.lastPlayed)||0}; }
function playable(track){ return !!track && PLAYABLE_SOURCES.has(track.sourceKind||'local'); }

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

function makeTrack(file,meta={}){return{id:hashId(file),fileName:file.name,title:meta.title||cleanName(file.name)||'Sin título',artist:meta.artist||'Desconocido',album:meta.album||'',genre:meta.genre||'',duration:Number(meta.duration)||0,size:file.size,type:file.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:'local',mediaKind:VIDEO_EXT.has(extOf(file.name))?'video':'audio'};}
function makeRemoteTrack(kind,url,extra={}){const remoteId=extra.remoteId||remoteHash(url);return{id:extra.id||`${kind}_${remoteId}`,fileName:'',title:extra.title||`${kind==='youtube'?'YouTube':kind==='soundcloud'?'SoundCloud':'Enlace'} · ${remoteId.slice(0,8)}`,artist:extra.artist||({youtube:'YouTube',soundcloud:'SoundCloud',direct:'Enlace directo',external:'Fuente externa','youtube-playlist':'YouTube'})[kind]||'Enlace',album:extra.album||'',genre:extra.genre||'',duration:Number(extra.duration)||0,size:0,type:extra.type||'',addedAt:now(),favorite:false,playCount:0,lastPlayed:0,sourceKind:kind,remoteUrl:url,remoteId,thumbnail:extra.thumbnail||'',mediaKind:extra.mediaKind||'audio',...extra};}

async function saveTrackAndSource(track,file=null){
  const idx=state.tracks.findIndex(t=>t.id===track.id);if(idx>=0)state.tracks[idx]={...state.tracks[idx],...track};else state.tracks.push(track);
  if(file)sessionFiles.set(track.id,file);
  if(state.storageReady){await db.put('tracks',track).catch(()=>{});if(file)await db.put('sources',{id:track.id,blob:file,name:file.name,type:file.type,lastModified:file.lastModified}).catch(()=>{});}
}
async function saveRemoteTrack(track){await saveTrackAndSource(track,null);return track;}
async function loadStoredData(){
  if(state.storageReady){state.tracks=(await db.getAll('tracks')).map(normalizeTrack).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));state.playlists=(await db.getAll('playlists')).sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));const p=await db.get('prefs','ui');if(p){state.currentId=p.currentId||null;state.queueIds=p.queueIds||[];state.queueIndex=Number.isInteger(p.queueIndex)?p.queueIndex:-1;state.volume=Number.isFinite(p.volume)?p.volume:.92;state.activePlaylistId=p.activePlaylistId||'pl_main';state.theme=p.theme||'dark';}}
  ensureBasePlaylist();
}
function ensureBasePlaylist(){if(!state.playlists.some(p=>p.id==='pl_main'))state.playlists.unshift({id:'pl_main',name:'Mi playlist',trackIds:[],createdAt:1});if(!state.playlists.some(p=>p.id===state.activePlaylistId))state.activePlaylistId='pl_main';}
async function persistPrefs(){if(!state.storageReady)return;await db.put('prefs',{key:'ui',currentId:state.currentId,queueIds:state.queueIds,queueIndex:state.queueIndex,volume:state.volume,activePlaylistId:state.activePlaylistId,theme:state.theme}).catch(()=>{});}
async function persistPlaylist(pl){if(state.storageReady)await db.put('playlists',pl).catch(()=>{});}

function getFilteredTracks(){let list=[...state.tracks];const q=state.search.trim().toLowerCase();if(q)list=list.filter(t=>[t.title,t.artist,t.album,t.genre,t.fileName,t.remoteUrl,sourceLabel(t)].join(' ').toLowerCase().includes(q));if(state.activeGenre!=='all')list=list.filter(t=>(t.genre||sourceLabel(t))===state.activeGenre);return list.sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));}
function getCurrentTrack(){return state.tracks.find(t=>t.id===state.currentId)||null;}
function getActivePlaylist(){return state.playlists.find(p=>p.id===state.activePlaylistId)||state.playlists[0];}
function getPlaylistTracks(pl){return(pl?.trackIds||[]).map(id=>state.tracks.find(t=>t.id===id)).filter(Boolean);}
function genres(){const c=new Map();for(const t of state.tracks){const g=t.genre||sourceLabel(t);c.set(g,(c.get(g)||0)+1);}return[['all','Todo'],...[...c.entries()].sort((a,b)=>b[1]-a[1]).map(([g])=>[g,g])];}

function showView(name){state.activeView=name;[els.homeView,els.libraryView,els.playlistView].forEach(v=>v.classList.remove('active'));({home:els.homeView,library:els.libraryView,playlist:els.playlistView})[name]?.classList.add('active');render();}
function renderSummary(){els.countTracks.textContent=state.tracks.length;els.countMusic.textContent=state.tracks.filter(playable).length;els.countPlaylists.textContent=state.playlists.length;}
function renderGenres(){els.genreChips.innerHTML='';for(const[value,label]of genres()){const b=document.createElement('button');b.className=`chip${state.activeGenre===value?' active':''}`;b.textContent=label;b.onclick=()=>{state.activeGenre=value;renderLibrary();};els.genreChips.appendChild(b);}}
function makeTrackRow(track,options={fromPlaylist:false}){
  const row=document.createElement('div');row.className=`track-row${track.id===state.currentId?' active':''}`;row.dataset.id=track.id;
  const source=sourceLabel(track),sub=[track.artist,track.album].filter(Boolean).join(' · ')||track.genre||track.remoteUrl||'Audio local';
  row.innerHTML=`<div class="track-backdrop"><span>→ Cola</span><span>${options.fromPlaylist?'Quitar ←':'Eliminar ←'}</span></div><div class="track-front"><div class="track-art">${track.sourceKind==='youtube'?'▶':track.sourceKind==='soundcloud'?'☁':'♪'}</div><div class="track-text"><div class="track-title">${safeText(track.title)}</div><div class="track-sub">${safeText(sub)}</div></div><div class="track-meta"><span class="track-time">${track.duration?formatTime(track.duration):''}</span><div class="badges"><span class="source-badge ${sourceClass(track)}">${source}</span>${track.favorite?'<span class="badge">♥</span>':''}</div></div></div>`;
  const front=$('.track-front',row);bindSwipe(front,track,options);front.addEventListener('click',()=>{if(playable(track))playTrack(track.id,options.fromPlaylist?getActivePlaylist().trackIds:getFilteredTracks().filter(playable).map(t=>t.id));else openTrackSheet(track,options);});front.addEventListener('contextmenu',e=>{e.preventDefault();openTrackSheet(track,options);});let pt=0;front.addEventListener('pointerdown',()=>{pt=setTimeout(()=>openTrackSheet(track,options),520)},{passive:true});['pointerup','pointercancel','pointerleave'].forEach(ev=>front.addEventListener(ev,()=>clearTimeout(pt),{passive:true}));return row;
}
function bindSwipe(front,track,options={}){let sx=0,d=0,active=false;const end=()=>{if(!active)return;active=false;front.style.transition='transform .16s ease';if(d>86)queueTrack(track.id);else if(d<-86){options.fromPlaylist?removeFromPlaylist(track.id,state.activePlaylistId):removeTrack(track.id);}front.style.transform='translateX(0)';setTimeout(()=>front.style.transition='',180);};front.addEventListener('pointerdown',e=>{active=true;d=0;sx=e.clientX},{passive:true});front.addEventListener('pointermove',e=>{if(!active)return;d=Math.max(-120,Math.min(120,e.clientX-sx));if(Math.abs(d)>6)front.style.transform=`translateX(${d}px)`},{passive:true});front.addEventListener('pointerup',end);front.addEventListener('pointercancel',end);}
function renderLibrary(){renderGenres();const list=getFilteredTracks();els.libraryEmpty.classList.toggle('is-hidden',list.length>0);els.libraryList.classList.toggle('is-hidden',list.length===0);els.libraryList.innerHTML='';list.forEach(t=>els.libraryList.appendChild(makeTrackRow(t)));}
function renderPlaylists(){
  els.playlistTabs.innerHTML='';state.playlists.forEach(pl=>{const b=document.createElement('button');b.className=`chip${pl.id===state.activePlaylistId?' active':''}`;b.textContent=pl.name;b.onclick=()=>{state.activePlaylistId=pl.id;persistPrefs();renderPlaylists();};els.playlistTabs.appendChild(b);});
  const pl=getActivePlaylist(),tracks=getPlaylistTracks(pl);els.playlistList.innerHTML='';
  if(pl?.externalRef&&tracks.length===0){const c=document.createElement('div');c.className='external-playlist-card';c.innerHTML=`<strong>${safeText(pl.name)}</strong><span>Playlist enlazada · ${safeText(pl.externalRef.source||'externa')}</span><button class="micro-btn" data-play-external>▶ Reproducir fuente</button>`;$('[data-play-external]',c).onclick=()=>playExternalPlaylist(pl);els.playlistList.appendChild(c);}
  tracks.forEach(t=>els.playlistList.appendChild(makeTrackRow(t,{fromPlaylist:true})));const empty=tracks.length===0&&!pl?.externalRef;els.playlistEmpty.classList.toggle('is-hidden',!empty);els.playlistList.classList.toggle('is-hidden',empty);
}
function renderPlayer(){const t=getCurrentTrack();els.miniPlayer.classList.toggle('is-hidden',!t);if(!t)return;els.miniTitle.textContent=t.title;els.miniArtist.textContent=t.artist||sourceLabel(t);els.fullTitle.textContent=t.title;els.fullArtist.textContent=[t.artist,t.album,sourceLabel(t)].filter(Boolean).join(' · ');els.favoriteBtn.textContent=t.favorite?'♥':'♡';els.favoriteBtn.classList.toggle('active',t.favorite);const g=state.playing?'⏸':'▶';els.playBtn.textContent=g;els.fullPlayBtn.textContent=g;els.shuffleBtn.classList.toggle('active',state.shuffle);els.volumeRange.value=String(state.volume);updateProgress();}
function render(){renderSummary();renderPlayer();if(state.activeView==='library')renderLibrary();if(state.activeView==='playlist')renderPlaylists();}

function updateProgress(){let duration=0,current=0;if(state.currentEngine==='youtube'&&ytPlayer){try{duration=ytPlayer.getDuration()||0;current=ytPlayer.getCurrentTime()||0;}catch{}}else if(state.currentEngine==='soundcloud'&&getCurrentTrack()){duration=getCurrentTrack().duration||0;}else{duration=els.audio.duration||0;current=els.audio.currentTime||0;}const pct=duration?(current/duration)*100:0;els.progressRange.value=String(pct);els.timeNow.textContent=formatTime(current);els.timeTotal.textContent=formatTime(duration);}
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
    ytPlayer=new YT.Player('ytMainPlayer',{width:'100%',height:'100%',videoId:track.sourceKind==='youtube'?track.remoteId:undefined,playerVars:track.sourceKind==='youtube-playlist'?{autoplay:1,listType:'playlist',list:track.remoteId,playsinline:1}:{autoplay:1,playsinline:1},events:{onReady:async e=>{try{e.target.setVolume(Math.round(state.volume*100));if(track.sourceKind==='youtube')e.target.playVideo();else e.target.playVideo();}catch{}state.playing=true;startProgressTimer();renderPlayer();if(track.sourceKind==='youtube'&&/^YouTube ·/.test(track.title)){const data=e.target.getVideoData?.()||{};if(data.title){track.title=data.title;track.artist=data.author||'YouTube';await saveRemoteTrack(track);render();}}resolve(true);},onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING){state.playing=true;renderPlayer();}else if(e.data===YT.PlayerState.PAUSED){state.playing=false;renderPlayer();}else if(e.data===YT.PlayerState.ENDED){state.playing=false;renderPlayer();nextTrack();}},onError:()=>{toast('YouTube no permitió reproducir este elemento');resolve(false);}}});
  });
}
function loadSoundCloudApi(){if(window.SC?.Widget)return Promise.resolve(window.SC);if(scApiPromise)return scApiPromise;scApiPromise=loadScript('https://w.soundcloud.com/player/api.js','soundcloud-widget-api').then(()=>window.SC);return scApiPromise;}
async function fetchSoundCloudMeta(url){try{const r=await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);if(!r.ok)throw 0;const d=await r.json();return{title:d.title||cleanName(new URL(url).pathname.split('/').pop()),artist:d.author_name||'SoundCloud',thumbnail:d.thumbnail_url||''};}catch{return null;}}
async function playSoundCloud(track){
  try{await loadSoundCloudApi();}catch{toast('No se pudo cargar SoundCloud');return false;}
  try{els.audio.pause();}catch{}clearRemoteStage();state.currentEngine='soundcloud';els.remoteDock.classList.remove('is-hidden');els.remoteLabel.textContent='SOUNDCLOUD';const iframe=document.createElement('iframe');iframe.allow='autoplay';iframe.src=`https://w.soundcloud.com/player/?url=${encodeURIComponent(track.remoteUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;els.remoteStage.appendChild(iframe);
  return new Promise(resolve=>{iframe.onload=()=>{try{scWidget=SC.Widget(iframe);const E=SC.Widget.Events;scWidget.bind(E.READY,()=>{scWidget.setVolume(Math.round(state.volume*100));scWidget.play();scWidget.getCurrentSound(async s=>{if(s){track.title=s.title||track.title;track.artist=s.user?.username||track.artist;track.duration=(s.duration||0)/1000;await saveRemoteTrack(track);render();}});state.playing=true;renderPlayer();resolve(true);});scWidget.bind(E.PLAY,()=>{state.playing=true;renderPlayer();});scWidget.bind(E.PAUSE,()=>{state.playing=false;renderPlayer();});scWidget.bind(E.FINISH,()=>{state.playing=false;nextTrack();});scProgressTimer=setInterval(()=>{scWidget?.getPosition?.(ms=>{const d=track.duration||0;els.timeNow.textContent=formatTime(ms/1000);els.timeTotal.textContent=formatTime(d);els.progressRange.value=d?String((ms/1000/d)*100):'0';});},700);}catch{resolve(false);}};});
}

async function playTrack(id,contextIds=null){
  const track=state.tracks.find(t=>t.id===id);if(!track)return;if(!playable(track)){toast('Esta fuente está guardada como referencia, pero aún no tiene reproductor integrado');return;}
  stopAllEngines();state.currentId=id;state.queueIds=(contextIds&&contextIds.length?[...contextIds]:[id]).filter(x=>state.tracks.some(t=>t.id===x&&playable(t)));state.queueIndex=Math.max(0,state.queueIds.indexOf(id));
  let ok=false;if(track.sourceKind==='local'||track.sourceKind==='direct')ok=await playLocalOrDirect(track);else if(track.sourceKind==='youtube'||track.sourceKind==='youtube-playlist')ok=await playYouTube(track);else if(track.sourceKind==='soundcloud')ok=await playSoundCloud(track);
  if(ok){track.playCount=(track.playCount||0)+1;track.lastPlayed=now();await saveRemoteTrack(track);await persistPrefs();setupMediaSession();render();}
}
async function togglePlay(){const t=getCurrentTrack();if(!t){const first=getFilteredTracks().find(playable);return first?playTrack(first.id,getFilteredTracks().filter(playable).map(x=>x.id)):toast('Primero carga o importa música');}if(state.currentEngine==='youtube'&&ytPlayer){const st=ytPlayer.getPlayerState();st===YT.PlayerState.PLAYING?ytPlayer.pauseVideo():ytPlayer.playVideo();return;}if(state.currentEngine==='soundcloud'&&scWidget){scWidget.toggle();return;}if(els.audio.paused){try{await els.audio.play();}catch{}}else els.audio.pause();}
async function nextTrack(){if(!state.queueIds.length)return;let id;if(state.shuffle){const pool=state.queueIds.filter(x=>x!==state.currentId);id=pool[Math.floor(Math.random()*pool.length)]||state.queueIds[0];}else{state.queueIndex=(state.queueIndex+1)%state.queueIds.length;id=state.queueIds[state.queueIndex];}await playTrack(id,state.queueIds);}
async function prevTrack(){if(state.currentEngine==='local'||state.currentEngine==='direct'){if((els.audio.currentTime||0)>4){els.audio.currentTime=0;return;}}if(!state.queueIds.length)return;state.queueIndex=(state.queueIndex-1+state.queueIds.length)%state.queueIds.length;await playTrack(state.queueIds[state.queueIndex],state.queueIds);}
function queueTrack(id){if(!state.queueIds.includes(id))state.queueIds.push(id);persistPrefs();toast('Añadido a la cola');}
async function toggleFavorite(id=state.currentId){const t=state.tracks.find(x=>x.id===id);if(!t)return;t.favorite=!t.favorite;await saveRemoteTrack(t);render();}
async function removeTrack(id){const t=state.tracks.find(x=>x.id===id);if(!t)return;sessionFiles.delete(id);state.tracks=state.tracks.filter(x=>x.id!==id);for(const pl of state.playlists){pl.trackIds=(pl.trackIds||[]).filter(x=>x!==id);await persistPlaylist(pl);}if(state.currentId===id){stopAllEngines();clearRemoteStage();els.audio.removeAttribute('src');state.currentId=null;state.currentEngine='none';}state.queueIds=state.queueIds.filter(x=>x!==id);if(state.storageReady){await db.delete('tracks',id).catch(()=>{});await db.delete('sources',id).catch(()=>{});}render();toast('Audio eliminado de MUSIC PLAY');}
async function removeFromPlaylist(trackId,playlistId){const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;pl.trackIds=pl.trackIds.filter(x=>x!==trackId);await persistPlaylist(pl);renderPlaylists();toast('Quitado de la playlist');}
async function createPlaylist(name,extra={}){const clean=(name||'').trim();if(!clean)return null;const pl={id:`pl_${remoteHash(clean+now()+Math.random())}`,name:clean.slice(0,60),trackIds:[],createdAt:now(),...extra};state.playlists.push(pl);state.activePlaylistId=pl.id;await persistPlaylist(pl);await persistPrefs();return pl;}
async function addTrackToPlaylist(trackId,playlistId){const pl=state.playlists.find(p=>p.id===playlistId);if(!pl)return;if(!pl.trackIds.includes(trackId))pl.trackIds.push(trackId);await persistPlaylist(pl);renderPlaylists();toast('Añadido a playlist');}
function startMix(trackIds){const pool=[...new Set(trackIds)].filter(id=>playable(state.tracks.find(t=>t.id===id)));if(!pool.length)return toast('No hay fuentes reproducibles para mezclar');state.shuffle=true;const shuffled=pool.sort(()=>Math.random()-.5);playTrack(shuffled[0],shuffled);}

function openSheet(html,binder){els.sheetContent.innerHTML=html;$$('button',els.sheetContent).forEach(b=>b.type='button');openDialog(els.sheetDialog);binder?.(els.sheetContent);}
function openLoadSheet(){openSheet(`<h2 class="sheet-title">Cargar música</h2><p class="sheet-copy">Archivos, carpetas o enlaces. MUSIC PLAY decide cómo tratarlos.</p><div class="sheet-stack"><button class="sheet-btn" data-a="files">＋ Archivos<small>Audio o video local</small></button><button class="sheet-btn" data-a="folder">⌂ Carpeta<small>Biblioteca completa</small></button><button class="sheet-btn" data-a="link">🔗 Enlace<small>YouTube, playlist, SoundCloud o archivo directo</small></button><button class="sheet-btn" data-a="library">♪ Tu música<small>Ver biblioteca</small></button></div>`,root=>{$('[data-a="files"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFiles();};$('[data-a="folder"]',root).onclick=()=>{closeDialog(els.sheetDialog);pickFolder();};$('[data-a="link"]',root).onclick=()=>{closeDialog(els.sheetDialog);openLinkSheet();};$('[data-a="library"]',root).onclick=()=>{closeDialog(els.sheetDialog);showView('library');};});}
function openTrackSheet(track,options={}){const pls=state.playlists.map(pl=>`<button class="sheet-btn" data-pl="${pl.id}">≡ ${safeText(pl.name)}<small>Añadir esta canción</small></button>`).join('');const external=track.remoteUrl?`<button class="sheet-btn" data-a="original">↗ Abrir fuente<small>${safeText(track.remoteUrl)}</small></button>`:'';openSheet(`<h2 class="sheet-title">${safeText(track.title)}</h2><p class="sheet-copy">${safeText(track.artist||sourceLabel(track))} · ${sourceLabel(track)}</p><div class="sheet-stack">${playable(track)?'<button class="sheet-btn" data-a="play">▶ Reproducir<small>Escuchar ahora</small></button>':''}<button class="sheet-btn" data-a="queue">→ Cola<small>Reproducir después</small></button><button class="sheet-btn" data-a="fav">${track.favorite?'♥ Quitar favorito':'♡ Favorito'}<small>Marcar esta canción</small></button>${external}${options.fromPlaylist?'<button class="sheet-btn" data-a="remove-pl">− Quitar de playlist<small>No elimina la canción</small></button>':''}<button class="sheet-btn" data-a="delete">🗑 Eliminar<small>Quitar de MUSIC PLAY</small></button><div class="sheet-copy">Añadir a playlist</div>${pls}<button class="sheet-btn" data-a="new-pl">＋ Nueva playlist<small>Crear y añadir</small></button></div>`,root=>{const q=s=>$(`[data-a="${s}"]`,root);q('play')&&(q('play').onclick=()=>{closeDialog(els.sheetDialog);playTrack(track.id,getFilteredTracks().filter(playable).map(t=>t.id));});q('queue').onclick=()=>{closeDialog(els.sheetDialog);queueTrack(track.id);};q('fav').onclick=()=>{closeDialog(els.sheetDialog);toggleFavorite(track.id);};q('original')&&(q('original').onclick=()=>window.open(track.remoteUrl,'_blank','noopener'));q('remove-pl')&&(q('remove-pl').onclick=()=>{closeDialog(els.sheetDialog);removeFromPlaylist(track.id,state.activePlaylistId);});q('delete').onclick=()=>{closeDialog(els.sheetDialog);removeTrack(track.id);};$$('[data-pl]',root).forEach(b=>b.onclick=()=>{closeDialog(els.sheetDialog);addTrackToPlaylist(track.id,b.dataset.pl);});q('new-pl').onclick=()=>{closeDialog(els.sheetDialog);openCreatePlaylistSheet(track.id);};});}
function openCreatePlaylistSheet(preselect=null){openSheet(`<h2 class="sheet-title">Nueva playlist</h2><p class="sheet-copy">Una lista propia, aunque mezcle archivos y enlaces.</p><input id="playlistNameInput" class="sheet-input" maxlength="60" placeholder="Ej: Rock, Estudio, Viaje"/><div class="sheet-stack"><button class="sheet-btn" data-save>Guardar playlist<small>Se queda en este dispositivo</small></button></div>`,root=>{const input=$('#playlistNameInput',root);input.focus();$('[data-save]',root).onclick=async()=>{const pl=await createPlaylist(input.value);if(!pl)return toast('Escribe un nombre');if(preselect)await addTrackToPlaylist(preselect,pl.id);closeDialog(els.sheetDialog);showView('playlist');};});}
function openInstallSheet(){const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);if(state.installPrompt){state.installPrompt.prompt();state.installPrompt.userChoice.finally(()=>{state.installPrompt=null;els.installBtn.classList.add('is-hidden');});return;}openSheet(`<h2 class="sheet-title">Instalar MUSIC PLAY</h2><p class="sheet-copy">${ios?'En iPhone/iPad: Compartir → Añadir a pantalla de inicio.':'Abre el menú del navegador y elige Instalar aplicación o Añadir a pantalla de inicio.'}</p><button class="sheet-btn" data-close>Entendido</button>`,root=>$('[data-close]',root).onclick=()=>closeDialog(els.sheetDialog));}

function analyzeLink(raw){
  let u;try{u=new URL(raw.trim());}catch{return{kind:'invalid',url:raw};}const host=u.hostname.toLowerCase().replace(/^www\./,'');
  if(host==='youtu.be'){const id=u.pathname.split('/').filter(Boolean)[0];return{kind:u.searchParams.get('list')?'youtube-playlist':'youtube',url:u.href,videoId:id,playlistId:u.searchParams.get('list')};}
  if(host.endsWith('youtube.com')){const list=u.searchParams.get('list');let id=u.searchParams.get('v');const parts=u.pathname.split('/').filter(Boolean);if(!id&&['shorts','embed'].includes(parts[0]))id=parts[1];if(list&&(!id||u.pathname.includes('/playlist')))return{kind:'youtube-playlist',url:u.href,playlistId:list};if(id)return{kind:'youtube',url:u.href,videoId:id,playlistId:list||''};}
  if(host.endsWith('soundcloud.com'))return{kind:'soundcloud',url:u.href};
  if(host.includes('spotify.com'))return{kind:'spotify',url:u.href};
  if(host.includes('music.apple.com'))return{kind:'apple',url:u.href};
  const ext=extOf(u.pathname);if(MEDIA_EXT.has(ext))return{kind:'direct',url:u.href,ext};
  return{kind:'generic',url:u.href,ext};
}
function describeLink(info){return({youtube:['YouTube','Video reproducible dentro de MUSIC PLAY'],'youtube-playlist':['YouTube Playlist','Se puede importar como playlist propia'],soundcloud:['SoundCloud','Enlace reproducible mediante su reproductor oficial'],direct:['Archivo multimedia','Puede reproducirse o guardarse localmente'],spotify:['Spotify','Prototipo: se guarda como referencia; integración autorizada vendrá después'],apple:['Apple Music','Prototipo: se guarda como referencia; integración MusicKit vendrá después'],generic:['Enlace','Intentaremos detectar si entrega audio o video'],invalid:['Enlace inválido','Revisa la dirección']})[info.kind]||['Enlace',''];}
function openLinkSheet(prefill=''){
  openSheet(`<h2 class="sheet-title">Enlace</h2><p class="sheet-copy">Pega un video, playlist o archivo multimedia. La app detecta la fuente.</p><input id="linkInput" class="sheet-input" inputmode="url" autocomplete="off" placeholder="https://…" value="${safeText(prefill)}"/><div class="sheet-stack"><button class="sheet-btn" data-analyze>Analizar enlace<small>Sin llenar la pantalla de opciones</small></button></div><div id="linkResult"></div>`,root=>{const input=$('#linkInput',root),result=$('#linkResult',root);input.focus();const analyze=()=>renderLinkResult(analyzeLink(input.value),result);$('[data-analyze]',root).onclick=analyze;input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();analyze();}});});
}
function renderLinkResult(info,host){const [title,desc]=describeLink(info);host.innerHTML=`<div class="link-result"><strong>${title}</strong><span>${desc}</span><span>${safeText(info.url||'')}</span><div class="link-actions" id="linkActions"></div></div>`;const a=$('#linkActions',host);if(info.kind==='invalid')return;
  const add=(label,fn)=>{const b=document.createElement('button');b.className='sheet-btn';b.textContent=label;b.onclick=fn;a.appendChild(b);};
  if(info.kind==='youtube'){add('▶ Play',async()=>{const t=await importYouTubeVideo(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});add('＋ Guardar enlace',async()=>{await importYouTubeVideo(info,false);closeDialog(els.sheetDialog);showView('library');toast('YouTube guardado');});}
  else if(info.kind==='youtube-playlist'){add('▶ Play',async()=>{const t=makeRemoteTrack('youtube-playlist',info.url,{remoteId:info.playlistId,title:'Playlist de YouTube',artist:'YouTube'});await saveRemoteTrack(t);closeDialog(els.sheetDialog);playTrack(t.id,[t.id]);});add('＋ Importar playlist',async()=>{closeDialog(els.sheetDialog);await importYouTubePlaylist(info);});}
  else if(info.kind==='soundcloud'){add('▶ Play',async()=>{const t=await importSoundCloud(info,true);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});add('＋ Guardar',async()=>{await importSoundCloud(info,false);closeDialog(els.sheetDialog);showView('library');});}
  else if(info.kind==='direct'||info.kind==='generic'){add('▶ Play',async()=>{const t=await importDirectReference(info.url);closeDialog(els.sheetDialog);if(t)playTrack(t.id,[t.id]);});add('↓ Guardar archivo',async()=>{closeDialog(els.sheetDialog);await downloadRemoteMedia(info.url);});}
  else if(info.kind==='spotify'||info.kind==='apple'){add('＋ Guardar referencia',async()=>{const kind='external',name=info.kind==='spotify'?'Spotify':'Apple Music';const t=makeRemoteTrack(kind,info.url,{title:`${name} · enlace`,artist:name,service:info.kind});await saveRemoteTrack(t);closeDialog(els.sheetDialog);showView('library');toast('Referencia guardada');});add('↗ Abrir original',()=>window.open(info.url,'_blank','noopener'));}
}
async function importYouTubeVideo(info,playNow=false){let meta=await fetchYouTubeMeta(info.videoId);const t=makeRemoteTrack('youtube',info.url,{remoteId:info.videoId,title:meta?.title||`YouTube · ${info.videoId}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||''});await saveRemoteTrack(t);render();return t;}
async function importSoundCloud(info){let meta=await fetchSoundCloudMeta(info.url);const t=makeRemoteTrack('soundcloud',info.url,{title:meta?.title||cleanName(new URL(info.url).pathname.split('/').pop())||'SoundCloud',artist:meta?.artist||'SoundCloud',thumbnail:meta?.thumbnail||''});await saveRemoteTrack(t);render();return t;}
async function importDirectReference(url){const path=new URL(url).pathname;const title=cleanName(path.split('/').pop())||'Audio por enlace';const t=makeRemoteTrack('direct',url,{title,artist:new URL(url).hostname,mediaKind:VIDEO_EXT.has(extOf(path))?'video':'audio'});await saveRemoteTrack(t);render();return t;}
async function downloadRemoteMedia(url){showLoader('Descargando…','Conectando con el archivo');try{const r=await fetch(url,{mode:'cors'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const blob=await r.blob();const ct=blob.type||r.headers.get('content-type')||'';if(!ct.startsWith('audio/')&&!ct.startsWith('video/')&&!MEDIA_EXT.has(extOf(new URL(url).pathname)))throw new Error('La URL no devolvió un archivo multimedia reconocible');const name=decodeURIComponent(new URL(url).pathname.split('/').pop()||`audio-${Date.now()}`);const file=new File([blob],name,{type:ct,lastModified:now()});await importFiles([file]);}catch(err){hideLoader();console.warn(err);toast('El servidor no permitió descargar el archivo. Puedes guardarlo como enlace.',4600);}}

async function importYouTubePlaylist(info){
  showLoader('Importando playlist…','Leyendo la lista de YouTube');
  let ids=[];try{ids=await probeYouTubePlaylist(info.playlistId);}catch(err){console.warn(err);}const name=`YouTube · ${info.playlistId.slice(0,12)}`;
  if(!ids.length){const pl=await createPlaylist(name,{externalRef:{source:'YouTube',url:info.url,playlistId:info.playlistId}});hideLoader();showView('playlist');toast('Playlist enlazada. YouTube no expuso sus elementos al navegador.',4200);return pl;}
  const pl=await createPlaylist(name,{externalRef:{source:'YouTube',url:info.url,playlistId:info.playlistId}});let i=0;
  for(const videoId of ids){i++;els.loaderText.textContent=`${i}/${ids.length} · YouTube`;let meta=null;if(i<=30)meta=await fetchYouTubeMeta(videoId);const url=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;const t=makeRemoteTrack('youtube',url,{remoteId:videoId,title:meta?.title||`YouTube · ${String(i).padStart(2,'0')}`,artist:meta?.artist||'YouTube',thumbnail:meta?.thumbnail||'',playlistSource:info.playlistId});await saveRemoteTrack(t);pl.trackIds.push(t.id);await sleep(18);}
  await persistPlaylist(pl);hideLoader();showView('playlist');toast(`Playlist importada · ${ids.length} elementos`);return pl;
}
async function probeYouTubePlaylist(playlistId){
  await loadYouTubeApi();if(ytProbePlayer){try{ytProbePlayer.destroy();}catch{}ytProbePlayer=null;}els.ytProbeHost.innerHTML='<div id="ytProbe"></div>';
  return new Promise((resolve,reject)=>{let settled=false;const finish=v=>{if(settled)return;settled=true;resolve(Array.from(new Set(v||[])).filter(Boolean));};ytProbePlayer=new YT.Player('ytProbe',{width:'260',height:'146',playerVars:{listType:'playlist',list:playlistId,autoplay:0,controls:0},events:{onReady:e=>{try{e.target.cuePlaylist({listType:'playlist',list:playlistId,index:0});}catch{}let tries=0;const poll=setInterval(()=>{tries++;let arr=[];try{arr=e.target.getPlaylist()||[];}catch{}if(arr.length||tries>20){clearInterval(poll);finish(arr);}},400);},onError:()=>finish([])}});setTimeout(()=>finish([]),10000);});
}
async function playExternalPlaylist(pl){if(pl.externalRef?.source==='YouTube'){const t=makeRemoteTrack('youtube-playlist',pl.externalRef.url,{remoteId:pl.externalRef.playlistId,title:pl.name,artist:'YouTube'});await saveRemoteTrack(t);playTrack(t.id,[t.id]);}else toast('Esta fuente externa todavía no tiene reproductor');}

async function pickFiles(){if('showOpenFilePicker'in window){try{const handles=await showOpenFilePicker({multiple:true,types:[{description:'Audio y video',accept:{'audio/*':['.mp3','.m4a','.aac','.wav','.ogg','.oga','.opus','.flac','.wma'],'video/*':['.mp4','.m4v','.webm','.mov','.3gp','.wmv','.avi','.mkv']}}]});return importFiles(await Promise.all(handles.map(h=>h.getFile())));}catch(err){if(err?.name!=='AbortError')console.warn(err);}}els.fileInput.click();}
async function pickFolder(){if('showDirectoryPicker'in window){try{const dir=await showDirectoryPicker(),files=[];async function walk(h){for await(const[,e]of h.entries()){if(e.kind==='file'){const f=await e.getFile();if(isMediaFile(f))files.push(f);}else if(e.kind==='directory')await walk(e);}}await walk(dir);return importFiles(files);}catch(err){if(err?.name!=='AbortError')console.warn(err);}}els.folderInput.click();}
async function importFiles(fileLike){const files=Array.from(fileLike||[]).filter(isMediaFile);if(!files.length)return toast('No se encontraron archivos multimedia');showLoader('Cargando música…',`${files.length} archivo${files.length>1?'s':''}`);let i=0;for(const file of files){i++;els.loaderText.textContent=`${i}/${files.length} · ${file.name}`;const meta=await parseAudioTags(file);meta.duration=await getDuration(file).catch(()=>0);const t=makeTrack(file,meta);await saveTrackAndSource(t,file);await sleep(15);}hideLoader();await persistPrefs();render();showView('library');toast(files.length===1?'Archivo cargado':`Se cargaron ${files.length} archivos`);}

function seekFromRange(){const pct=Number(els.progressRange.value)/100;if(state.currentEngine==='youtube'&&ytPlayer){try{ytPlayer.seekTo((ytPlayer.getDuration()||0)*pct,true);}catch{}}else if(state.currentEngine==='soundcloud'&&scWidget){const d=getCurrentTrack()?.duration||0;scWidget.seekTo(d*1000*pct);}else{const d=els.audio.duration||0;if(d)els.audio.currentTime=d*pct;}}
function setupMediaSession(){if(!('mediaSession'in navigator))return;const t=getCurrentTrack();if(t)navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.artist||sourceLabel(t),album:t.album||'MUSIC PLAY'});try{navigator.mediaSession.setActionHandler('play',togglePlay);navigator.mediaSession.setActionHandler('pause',togglePlay);navigator.mediaSession.setActionHandler('previoustrack',prevTrack);navigator.mediaSession.setActionHandler('nexttrack',nextTrack);}catch{}}
async function registerSW(){if(!('serviceWorker'in navigator)||location.protocol==='file:')return;try{await navigator.serviceWorker.register('./sw.js',{scope:'./'});}catch(err){console.warn('SW',err);}}

function bindEvents(){
  els.homeBtn.onclick=()=>showView('home');$$('[data-go]').forEach(b=>b.onclick=()=>showView(b.dataset.go));els.loadAction.onclick=openLoadSheet;els.loadFilesQuick.onclick=pickFiles;els.loadFolderQuick.onclick=pickFolder;els.loadLinkQuick.onclick=()=>openLinkSheet();els.playAction.onclick=togglePlay;els.playlistAction.onclick=()=>showView('playlist');els.mixAction.onclick=()=>startMix(getFilteredTracks().map(t=>t.id));els.openLibraryQuick.onclick=()=>showView('library');els.createPlaylistQuick.onclick=()=>openCreatePlaylistSheet();els.libraryAddBtn.onclick=openLoadSheet;els.emptyLoadBtn.onclick=openLoadSheet;els.newPlaylistBtn.onclick=()=>openCreatePlaylistSheet();els.openLibraryFromPlaylists.onclick=()=>showView('library');els.playPlaylistBtn.onclick=()=>{const pl=getActivePlaylist(),tracks=getPlaylistTracks(pl).filter(playable);if(tracks.length)return playTrack(tracks[0].id,tracks.map(t=>t.id));if(pl?.externalRef)return playExternalPlaylist(pl);toast('Esta playlist está vacía');};els.mixPlaylistBtn.onclick=()=>startMix(getActivePlaylist().trackIds||[]);els.searchInput.oninput=()=>{state.search=els.searchInput.value;renderLibrary();};els.fileInput.onchange=()=>{importFiles(els.fileInput.files);els.fileInput.value='';};els.folderInput.onchange=()=>{importFiles(els.folderInput.files);els.folderInput.value='';};
  els.miniOpen.onclick=()=>openDialog(els.playerDialog);[els.playBtn,els.fullPlayBtn].forEach(b=>b.onclick=togglePlay);[els.prevBtn,els.fullPrevBtn].forEach(b=>b.onclick=prevTrack);[els.nextBtn,els.fullNextBtn].forEach(b=>b.onclick=nextTrack);els.shuffleBtn.onclick=()=>{state.shuffle=!state.shuffle;persistPrefs();renderPlayer();toast(state.shuffle?'Mix activado':'Mix desactivado');};els.favoriteBtn.onclick=()=>toggleFavorite();els.progressRange.oninput=seekFromRange;els.volumeRange.oninput=()=>{state.volume=Number(els.volumeRange.value)||0;els.audio.volume=state.volume;if(ytPlayer)try{ytPlayer.setVolume(Math.round(state.volume*100));}catch{}if(scWidget)try{scWidget.setVolume(Math.round(state.volume*100));}catch{}persistPrefs();};els.addCurrentToPlaylist.onclick=()=>{const t=getCurrentTrack();if(t)openTrackSheet(t);};
  els.audio.addEventListener('timeupdate',updateProgress);els.audio.addEventListener('loadedmetadata',()=>{const t=getCurrentTrack();if(t&&!t.duration&&Number.isFinite(els.audio.duration)){t.duration=els.audio.duration;saveRemoteTrack(t);}updateProgress();});els.audio.addEventListener('play',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=true;renderPlayer();}});els.audio.addEventListener('pause',()=>{if(['local','direct'].includes(state.currentEngine)){state.playing=false;renderPlayer();}});els.audio.addEventListener('ended',nextTrack);els.audio.addEventListener('error',()=>{if(['local','direct'].includes(state.currentEngine))toast('Este formato o enlace no pudo reproducirse en el navegador',3800);});
  ['dragenter','dragover'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();els.dropHint.classList.add('show');}));['dragleave','drop'].forEach(ev=>window.addEventListener(ev,e=>{e.preventDefault();if(ev==='drop'||!e.relatedTarget)els.dropHint.classList.remove('show');}));window.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length)importFiles(e.dataTransfer.files);});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;els.installBtn.classList.remove('is-hidden');});els.installBtn.onclick=openInstallSheet;document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;if(e.code==='Space'){e.preventDefault();togglePlay();}else if(e.key.toLowerCase()==='m')startMix(getFilteredTracks().map(t=>t.id));else if(e.key.toLowerCase()==='l')showView('library');else if(e.key.toLowerCase()==='p')showView('playlist');});window.addEventListener('beforeunload',persistPrefs);
}

async function init(){document.documentElement.dataset.theme=state.theme;try{state.storageReady=await db.init();}catch{state.storageReady=false;}await loadStoredData();bindEvents();await registerSW();render();els.audio.volume=state.volume;setupMediaSession();await sleep(2000);els.intro.classList.add('hide');els.app.classList.remove('is-hidden');setTimeout(()=>els.intro.remove(),450);}
init().catch(err=>{console.error(err);els.intro?.classList.add('hide');els.app?.classList.remove('is-hidden');toast('La app abrió en modo seguro');});

})();
