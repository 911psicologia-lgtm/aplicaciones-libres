/* =============================================================
 * R10.15 · MP_FLOATING — REPRODUCTOR FLOTANTE REAL (2 capas)
 * =============================================================
 * CAPA A (web/PWA): este puente.
 *  - Detecta la capa nativa Android (window.HappyNative, inyectada por el
 *    WebView de HAPPY Android). Si existe, HAPPY web sigue siendo el ÚNICO
 *    motor de reproducción y la capa nativa solo refleja/controla:
 *    overlay TYPE_APPLICATION_OVERLAY + MediaSession + notificación.
 *  - Si NO existe capa nativa (navegador / PWA pura): NUNCA simula una
 *    ventana flotante sobre otras apps (un navegador no puede). Ofrece el
 *    fallback honesto: Mini reproductor interno + Media Session + PiP web
 *    cuando la fuente es video compatible.
 *
 * Protocolo (JSON por mensaje):
 *  web → nativo : {type:'web/hello'|'state'|'floating/start'|'floating/stop'|'pip/request', ...}
 *  nativo → web : {type:'native/hello'|'floating/started'|'floating/stopped'|
 *                   'floating/permission'|'media/play'|'media/pause'|'media/toggle'|
 *                   'media/next'|'media/prev'|'media/seek'|'media/stop'|'pip/result'}
 * ============================================================= */
(() => {
'use strict';
if (window.MP_FLOATING) return; // idempotente

const mp = () => window.MP || null;

let nativeIface = null;          // window.HappyNative (Android JS bridge)
let nativeReady = false;         // handshake completado
let floatActive = false;         // overlay nativo visible
let pipNative = false;           // PiP nativo activo
let capabilities = { overlay:false, pip:false, service:false, version:0 };
let emitTimer = null;
let lastKey = '';
let lastSnapshotJson = JSON.stringify({ track:null });
const artworkCache = new Map();  // trackId → artwork URL

/* ---------- salida web → nativo ---------- */
function send(msg){
  if(!nativeIface) return false;
  try{ nativeIface.postFromWeb(JSON.stringify(msg)); return true; }
  catch(err){ console.debug('[MP_FLOATING] send', err); return false; }
}

/* ---------- detección de capa nativa ---------- */
function detectNative(){
  const cand = window.HappyNative;
  if(cand && typeof cand.postFromWeb === 'function'){
    if(nativeIface !== cand) nativeIface = cand; // re-vincula si el host cambia
    return true;
  }
  return false;
}
function isNative(){ return !!nativeIface; }

function capabilityLabel(){
  if(isNative() && nativeReady && capabilities.overlay)
    return 'Disponible · capa Android conectada · sobre otras apps ✓';
  if(isNative()) return 'Capa Android detectada · verificando permisos…';
  return 'Sobre otras apps (HOME, WhatsApp, Chrome) · requiere la versión Android de HAPPY';
}

/* ---------- entrada nativo → web ---------- */
function handlePermissionResult(msg){
  const m = mp(); if(!m) return;
  if(msg.granted){
    m.toast('Reproductor flotante activado · se muestra sobre otras apps ✓', 3600);
    return;
  }
  if(msg.pending){
    m.toast('Concede el permiso «Mostrar sobre otras apps» para continuar', 4200);
    return;
  }
  // Permiso negado → NO romper nada. La música sigue en HAPPY con normalidad.
  m.openSheet(
    `<h2 class="sheet-title">▣ Reproductor flotante</h2>
     <p class="sheet-copy">El reproductor flotante necesita permiso para mostrarse sobre otras aplicaciones.</p>
     <p class="sheet-copy">Sin ese permiso puedes seguir escuchando con normalidad desde HAPPY: Mini reproductor interno, segundo plano y controles multimedia del sistema.</p>
     <div class="sheet-stack">
       <button class="sheet-btn" data-fl-retry>↻ Reintentar<small>Abrir de nuevo los ajustes de superposición</small></button>
       <button class="sheet-btn" data-fl-stay>▶ Seguir en HAPPY<small>La música continúa sin interrupciones</small></button>
     </div>`,
    root => {
      const r = root.querySelector('[data-fl-retry]');
      const s = root.querySelector('[data-fl-stay]');
      if(r) r.onclick = () => { m.closeDialog(m.els.sheetDialog); setTimeout(() => request(), 60); };
      if(s) s.onclick = () => { m.closeDialog(m.els.sheetDialog); m.toast('La reproducción continúa normalmente', 2400); };
    });
}

window.MpNativeBridge = {
  fromNative(raw){
    let msg = null;
    try{ msg = typeof raw === 'string' ? JSON.parse(raw) : raw; }catch{ return; }
    if(!msg || !msg.type) return;
    const m = mp(); if(!m) return;
    const snap = () => m.buildPlaybackSnapshot ? m.buildPlaybackSnapshot() : null;
    switch(msg.type){
      case 'native/hello':
        detectNative(); // Android puede inyectar el puente tarde; sincronizamos aquí también
        capabilities = Object.assign(capabilities, msg.capabilities || {});
        nativeReady = !!nativeIface;
        if(nativeIface){
          startEmitter();
          send({ type:'web/hello', version:m.version, build:m.build });
          emitState(true);
        }
        break;
      case 'floating/started': floatActive = true;  break;
      case 'floating/stopped': floatActive = false; break;
      case 'floating/permission': handlePermissionResult(msg); break;
      case 'media/play':  { const s = snap(); if(s && !s.isPlaying) m.togglePlay(); break; }
      case 'media/pause': { const s = snap(); if(s &&  s.isPlaying) m.togglePlay(); break; }
      case 'media/toggle': m.togglePlay(); break;
      case 'media/next': m.nextTrack(); break;
      case 'media/prev': m.prevTrack(); break;
      case 'media/seek': { const s = snap(); const pos = Number(msg.position); if(s && Number.isFinite(pos)) m.seekBy(pos - s.currentTime); break; }
      case 'media/stop': { const s = snap(); if(s && s.isPlaying) m.togglePlay(); break; }
      case 'pip/result':
        pipNative = !!msg.active;
        if(msg.error && m) m.toast('PiP nativo no disponible: ' + msg.error, 3400);
        break;
      case 'native/command-error':
        console.debug('[MP_FLOATING] native error', msg);
        break;
    }
  }
};

/* ---------- emisión de estado (única fuente de verdad: HAPPY web) ---------- */
async function resolveArtwork(track){
  if(!track) return '';
  if(artworkCache.has(track.id)) return artworkCache.get(track.id) || '';
  let url = '';
  try{ url = (await mp().artworkUrlFor(track).catch(() => '')) || ''; }catch{ url = ''; }
  if(!url && (track.sourceKind === 'youtube' || track.sourceKind === 'youtube-playlist') && track.remoteId)
    url = `https://i.ytimg.com/vi/${encodeURIComponent(track.remoteId)}/mqdefault.jpg`;
  artworkCache.set(track.id, url);
  if(artworkCache.size > 60){ const first = artworkCache.keys().next().value; artworkCache.delete(first); }
  return url;
}

async function emitState(force){
  const m = mp(); if(!m || !nativeIface) return;
  const s = m.buildPlaybackSnapshot ? m.buildPlaybackSnapshot() : null;
  if(!s){ send({ type:'state', track:null, floating:floatActive }); lastKey=''; lastSnapshotJson=JSON.stringify({track:null}); return; }
  const key = `${s.id}|${s.isPlaying?'1':'0'}|${Math.round(s.duration||0)}|${Math.round(s.currentTime||0)}`;
  if(!force && key === lastKey) return;
  lastKey = key;
  const artwork = await resolveArtwork(m.getCurrentTrack());
  lastSnapshotJson = JSON.stringify({ track:{ title:s.title, artist:s.artist, album:s.album, source:s.source,
    duration:s.duration, currentTime:s.currentTime, isPlaying:s.isPlaying, podcast:s.podcast }, artwork });
  send({ type:'state', track:{ title:s.title, artist:s.artist, album:s.album, source:s.source,
    duration:s.duration, currentTime:s.currentTime, isPlaying:s.isPlaying, podcast:s.podcast,
    queueIndex:s.queueIndex, queueLength:s.queueLength }, artwork, floating:floatActive, pip:pipNative });
}

function startEmitter(){
  if(emitTimer) return;
  emitTimer = setInterval(() => { if(nativeIface) emitState(false); }, 1000);
}

/* ---------- API pública: request() es el corazón del flujo ▣ ---------- */
function request(){
  const m = mp(); if(!m) return;
  const t = m.getCurrentTrack ? m.getCurrentTrack() : null;
  if(!t) return m.toast('Reproduce algo primero para usar el reproductor flotante', 3000);

  // 1) Capa nativa conectada → pedir overlay real (Android decide permisos).
  if(detectNative()){
    startEmitter();
    send({ type:'floating/start' });
    m.toast('Activando reproductor flotante…', 2200);
    return;
  }

  // 2) Sin capa nativa → FALLBACK HONESTO (nunca simular overlay).
  const videoPip = !!(m.state.currentEngine === 'youtube' && m.state.ytEngine === 'native' && m.state.ytNativeKind === 'video') && !!document.pictureInPictureEnabled;
  m.openSheet(
    `<h2 class="sheet-title">▣ Reproductor flotante real</h2>
     <p class="sheet-copy">Este modo muestra un reproductor pequeño POR ENCIMA de otras aplicaciones (HOME, WhatsApp, Chrome). Un navegador o PWA no puede crear ventanas sobre otras apps: eso requiere la <b>versión Android de HAPPY</b>.</p>
     <p class="sheet-copy">Lo que sí puedes usar ahora mismo, sin perder la reproducción:</p>
     <div class="sheet-stack">
       <button class="sheet-btn" data-fl-mini>◱ Abrir Mini reproductor interno<small>Ventana mínima dentro de HAPPY · ⧉ también arriba</small></button>
       ${videoPip ? '<button class="sheet-btn" data-fl-pip>◱ Picture-in-Picture del video<small>Ventana de video nativa del sistema · solo fuentes compatibles</small></button>' : ''}
       <button class="sheet-btn" data-fl-bg>⇣ Continuar en segundo plano<small>El audio sigue con los controles multimedia del sistema</small></button>
     </div>
     <p class="sheet-copy">El modo flotante sobre otras aplicaciones requiere la versión Android de HAPPY.</p>`,
    root => {
      const mini = root.querySelector('[data-fl-mini]');
      const pip  = root.querySelector('[data-fl-pip]');
      const bg   = root.querySelector('[data-fl-bg]');
      if(mini) mini.onclick = () => { m.closeDialog(m.els.sheetDialog); m.els.miniFloatBtn.click(); };
      if(pip)  pip.onclick  = () => { m.closeDialog(m.els.sheetDialog); m.requestPipWeb(); };
      if(bg)   bg.onclick   = () => { m.closeDialog(m.els.sheetDialog); m.toast('La reproducción continúa en segundo plano · controles del sistema disponibles', 3600); };
    });
}

function stop(){
  if(nativeIface) send({ type:'floating/stop' });
}

/* ---------- pull para la capa nativa (Android sondea con evaluateJavascript) ---------- */
async function snapshot(){
  const m = mp(); if(!m) return JSON.stringify({ track:null });
  const s = m.buildPlaybackSnapshot ? m.buildPlaybackSnapshot() : null;
  if(!s) return JSON.stringify({ track:null });
  const artwork = await resolveArtwork(m.getCurrentTrack());
  return JSON.stringify({ track:{ title:s.title, artist:s.artist, album:s.album, source:s.source,
    duration:s.duration, currentTime:s.currentTime, isPlaying:s.isPlaying, podcast:s.podcast }, artwork });
}

/* Snapshot cacheado y SÍNCRONO: lo usa el sondeo del servicio Android
   (el WebView puede congelar promesas/timers en segundo plano). */
function snapshotSync(){
  const m = mp();
  if(m && m.buildPlaybackSnapshot){
    const s = m.buildPlaybackSnapshot();
    if(!s) lastSnapshotJson = JSON.stringify({ track:null });
    else {
      // Refresca tiempo/isPlaying al instante; artwork del cache si existe.
      const cached = (function(){ try{ return JSON.parse(lastSnapshotJson); }catch{ return {track:null}; } })();
      const art = (m.getCurrentTrack && artworkCache.get(m.getCurrentTrack()?.id)) || cached.artwork || '';
      lastSnapshotJson = JSON.stringify({ track:{ title:s.title, artist:s.artist, album:s.album, source:s.source,
        duration:s.duration, currentTime:s.currentTime, isPlaying:s.isPlaying, podcast:s.podcast }, artwork:art });
    }
  }
  return lastSnapshotJson;
}

window.MP_FLOATING = Object.freeze({
  request, stop, send, emitState, snapshot, snapshotSync,
  get isNative(){ return isNative(); },
  get nativeReady(){ return nativeReady; },
  get floating(){ return floatActive; },
  get capabilities(){ return capabilities; },
  capabilityLabel
});

/* ---------- arranque perezoso: espera a que app.js exponga window.MP ---------- */
function boot(){
  if(!detectNative()) return; // PWA pura → nada que hacer; fallback honesto vive en request()
  startEmitter();
  send({ type:'web/hello', version:(mp()?.version)||'', build:(mp()?.build)||'' });
  emitState(true);
}
if(document.readyState === 'complete' || document.readyState === 'interactive') setTimeout(boot, 900);
else document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 900));
window.addEventListener('mp:app-ready', boot, { once:true });

})();
