/**
 * MUSIC PLAY R10.13 · Helper de playlists + streams nativos de YouTube (v2)
 * -------------------------------------------------------------------------
 * Rutas que consume la PWA:
 *   GET /api/youtube-playlist?list=PLAYLIST_ID
 *   GET /api/youtube-streams?v=VIDEO_ID
 *   GET /api/yt-media?u=URL_GOOGLEVIDEO_CODIFICADA   (NUEVO v2: proxy de bytes)
 *
 * Por qué el proxy (importante en v2): las URLs de stream de YouTube quedan
 * firmadas para la IP que las pidió. Si el Worker pide los streams, solo la IP
 * del Worker puede descargarlos y tu telefono recibia 403. /api/yt-media
 * reenvia los bytes (con soporte de Range para poder adelantar/retroceder)
 * desde TU Worker. Es el mismo mecanismo de proxy que usan Invidious/Piped,
 * pero corriendo en tu propio Worker, sin depender de terceros caidos.
 *
 * Despliegue en 3 pasos (gratis):
 *   1. Abre https://workers.cloudflare.com -> Start building / Create Worker.
 *   2. Borra el codigo de ejemplo, pega este archivo COMPLETO y pulsa Deploy.
 *   3. Copia la URL tipo https://tu-helper.tu-usuario.workers.dev y pegala en
 *      MUSIC PLAY -> Menu ... -> Motor de YouTube -> Helper propio -> Probar.
 *
 * Opcional (playlists con titulos y paginacion estables):
 *   wrangler secret put YOUTUBE_API_KEY
 *
 * El helper NO descarga ni re-distribuye archivos: reenvia los mismos bytes
 * publicos que entrega el reproductor de YouTube, solo mientras alguien
 * escucha. No guarda nada.
 */

var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36";
var MAX_ITEMS = 1000;

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type,range",
    "access-control-expose-headers": "content-type,content-length,content-range,accept-ranges"
  };
}

function json(data, status, cache) {
  var c = cache || 120;
  var h = Object.assign({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=" + Math.min(c, 120) + ", s-maxage=" + c
  }, corsHeaders());
  return new Response(JSON.stringify(data), { status: status || 200, headers: h });
}

function validPlaylistId(value) { return /^[A-Za-z0-9_-]{6,120}$/.test(value || ""); }
function validVideoId(value) { return /^[A-Za-z0-9_-]{6,20}$/.test(value || ""); }
function bestThumb(t) {
  t = t || {};
  return (t.maxres && t.maxres.url) || (t.standard && t.standard.url) || (t.high && t.high.url) || (t.medium && t.medium.url) || (t.default && t.default.url) || "";
}

async function fetchJson(url) {
  var response = await fetch(url, { headers: { accept: "application/json" } });
  var data = null;
  try { data = await response.json(); } catch (e) {}
  if (!response.ok) {
    var message = (data && data.error && data.error.message) || ("HTTP " + response.status);
    var err = new Error(message); err.status = response.status; err.data = data; throw err;
  }
  return data;
}

/* ---------------- metadatos de playlist (igual que R10) ---------------- */

async function fromDataApi(list, key) {
  var title = "";
  var podcastStatus = "";
  try {
    var p = new URL("https://www.googleapis.com/youtube/v3/playlists");
    p.searchParams.set("part", "snippet,status"); p.searchParams.set("id", list); p.searchParams.set("key", key);
    var d = await fetchJson(p);
    title = (d.items && d.items[0] && d.items[0].snippet && d.items[0].snippet.title) || "";
    podcastStatus = (d.items && d.items[0] && d.items[0].status && d.items[0].status.podcastStatus) || "";
  } catch (err) {
    console.log("playlist title lookup", err.message);
  }

  var items = [];
  var pageToken = "";
  do {
    var u = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    u.searchParams.set("part", "snippet");
    u.searchParams.set("playlistId", list);
    u.searchParams.set("maxResults", "50");
    u.searchParams.set("key", key);
    if (pageToken) u.searchParams.set("pageToken", pageToken);
    var d2 = await fetchJson(u);
    var rows = d2.items || [];
    for (var i = 0; i < rows.length; i++) {
      var s = rows[i].snippet || {};
      var videoId = (s.resourceId && s.resourceId.videoId) || "";
      if (!videoId) continue;
      var unavailable = /^Deleted video$|^Private video$/i.test(s.title || "");
      items.push({
        videoId: videoId,
        title: s.title || "",
        author: s.videoOwnerChannelTitle || s.channelTitle || "YouTube",
        channelTitle: s.videoOwnerChannelTitle || s.channelTitle || "",
        thumbnail: bestThumb(s.thumbnails),
        position: Number.isFinite(s.position) ? s.position : items.length,
        unavailable: unavailable
      });
      if (items.length >= MAX_ITEMS) break;
    }
    pageToken = items.length < MAX_ITEMS ? (d2.nextPageToken || "") : "";
  } while (pageToken);

  return { ok: true, playlistId: list, title: title, podcastStatus: podcastStatus, items: items, count: items.length, source: "youtube-data-api" };
}

function decodeHtml(s) {
  return String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function decodeJsonText(s) {
  try { return JSON.parse("\"" + String(s || "").replace(/"/g, "\\\"") + "\""); }
  catch (e) { return String(s || "").replace(/\\u0026/g, "&").replace(/\\n/g, " ").replace(/\\"/g, "\""); }
}
function extractPublicPage(html) {
  var items = [], seen = new Set();
  var add = function (videoId, title, author) {
    if (!videoId || seen.has(videoId) || items.length >= MAX_ITEMS) return;
    seen.add(videoId);
    items.push({ videoId: videoId, title: decodeJsonText(title), author: decodeJsonText(author), thumbnail: "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg", position: items.length });
  };
  var m;
  var full = /"playlistVideoRenderer":\{"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,2200}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"[\s\S]{0,1800}?(?:"shortBylineText":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)")?/g;
  while ((m = full.exec(html))) add(m[1], m[2] || "", m[3] || "");
  var panel = /"playlistPanelVideoRenderer":\{[\s\S]{0,1500}?"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,1500}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"/g;
  while ((m = panel.exec(html))) add(m[1], m[2] || "");
  return items;
}
async function fromPublicPage(list) {
  var url = "https://www.youtube.com/playlist?list=" + encodeURIComponent(list) + "&hl=es&gl=CO";
  var r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "es-CO,es;q=0.9,en;q=0.7", "accept": "text/html,application/xhtml+xml" }, cf: { cacheTtl: 180, cacheEverything: true } });
  if (!r.ok) throw new Error("YouTube HTTP " + r.status);
  var html = await r.text();
  var meta = html.match(/<meta\s+name="title"\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i);
  var title = meta ? decodeHtml(meta[1]).replace(/\s*-\s*YouTube\s*$/i, "").trim() : "";
  var items = extractPublicPage(html);
  return { ok: true, playlistId: list, title: title, podcastStatus: "", items: items, count: items.length, source: "youtube-public-page" };
}

async function handlePlaylist(request, env) {
  var url = new URL(request.url), list = (url.searchParams.get("list") || "").trim();
  if (!validPlaylistId(list)) return json({ ok: false, error: "playlist id invalido" }, 400, 0);
  try {
    if (env && env.YOUTUBE_API_KEY) return json(await fromDataApi(list, env.YOUTUBE_API_KEY), 200, 300);
    var fallback = await fromPublicPage(list);
    return json(Object.assign({}, fallback, { warning: "Configura YOUTUBE_API_KEY para nombres y paginacion estables." }), 200, 120);
  } catch (err) {
    return json({ ok: false, playlistId: list, error: err.message || "No se pudo leer la playlist" }, 502, 0);
  }
}

/* ---------------- R10.13 · resolucion de streams + proxy ---------------- */

// Cliente interno de YouTube (InnerTube) desde la red de Cloudflare. Los tres
// clientes son los que historicamente devuelven URLs directas sin poToken.
async function innertubePlayer(videoId, client) {
  var bodies = {
    ANDROID: {
      context: { client: { clientName: "ANDROID", clientVersion: "19.09.37", androidSdkVersion: 30, hl: "es", gl: "CO" } },
      videoId: videoId, params: "8AEB", contentCheckOk: true, racyCheckOk: true
    },
    IOS: {
      context: { client: { clientName: "IOS", clientVersion: "19.09.3", deviceModel: "iPhone14,3", hl: "es", gl: "CO" } },
      videoId: videoId, params: "8AEB", contentCheckOk: true, racyCheckOk: true
    },
    TVEMBEDDED: {
      context: { client: { clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", clientVersion: "2.0", hl: "es", gl: "CO" }, thirdParty: { embedUrl: "https://www.youtube.com" } },
      videoId: videoId, contentCheckOk: true, racyCheckOk: true
    }
  };
  var uas = {
    ANDROID: "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip",
    IOS: "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 17_2 like Mac OS X)",
    TVEMBEDDED: "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15"
  };
  var r = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": uas[client], "accept-language": "es-CO,es;q=0.9", "x-goog-api-format-version": "2" },
    body: JSON.stringify(bodies[client]),
    cf: { cacheTtl: 60, cacheEverything: true }
  });
  if (!r.ok) throw new Error("player " + client + " HTTP " + r.status);
  return r.json();
}

// Verifica contra googlevideo (mismo origen de red que pidio los streams).
async function probeUrl(url) {
  try {
    var r = await fetch(url, { headers: { range: "bytes=0-127", "user-agent": UA, referer: "https://www.youtube.com/" }, cf: { cacheTtl: 0 } });
    if (r.status === 200 || r.status === 206) { try { await r.body.cancel(); } catch (e) {} return true; }
    return false;
  } catch (e) { return false; }
}

function collectStreams(data) {
  var sd = (data && data.streamingData) || {};
  var vd = (data && data.videoDetails) || {};
  var adaptive = Array.isArray(sd.adaptiveFormats) ? sd.adaptiveFormats : [];
  var muxed = Array.isArray(sd.formats) ? sd.formats : [];
  var audioStreams = adaptive
    .filter(function (f) { return String(f.mimeType || "").indexOf("audio/") === 0 && f.url; })
    .map(function (f) { return { url: f.url, mimeType: String(f.mimeType).split(";")[0], bitrate: f.bitrate || 0, contentLength: Number(f.contentLength) || 0 }; })
    .sort(function (a, b) { return b.bitrate - a.bitrate; });
  var videoStreams = muxed
    .filter(function (f) { return String(f.mimeType || "").indexOf("video/") === 0 && f.url; })
    .map(function (f) { return { url: f.url, mimeType: String(f.mimeType).split(";")[0], bitrate: f.bitrate || 0, quality: f.qualityLabel || "", itag: f.itag || 0 }; })
    .sort(function (a, b) { return (b.itag === 22 ? 1 : 0) - (a.itag === 22 ? 1 : 0) || (b.bitrate || 0) - (a.bitrate || 0); });
  var thumbs = vd.thumbnail && vd.thumbnail.thumbnails || [];
  var thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : ("https://i.ytimg.com/vi/" + ((vd && vd.videoId) || "") + "/hqdefault.jpg");
  return {
    audioStreams: audioStreams, videoStreams: videoStreams,
    title: vd.title || "",
    author: vd.author || "YouTube",
    duration: Number(vd.lengthSeconds) || 0,
    thumbnail: thumbnail,
    live: !!(vd.isLiveContent)
  };
}

// Reescribe una URL cruda de googlevideo hacia el proxy de este Worker.
function proxyMedia(request, raw) {
  return new URL(request.url).origin + "/api/yt-media?u=" + encodeURIComponent(raw);
}

async function handleStreams(request) {
  var url = new URL(request.url), videoId = (url.searchParams.get("v") || "").trim();
  if (!validVideoId(videoId)) return json({ ok: false, error: "video id invalido" }, 400, 0);

  var clients = ["ANDROID", "IOS", "TVEMBEDDED"];
  for (var ci = 0; ci < clients.length; ci++) {
    try {
      var data = await innertubePlayer(videoId, clients[ci]);
      var status = (data && data.playabilityStatus && data.playabilityStatus.status) || "";
      if (["OK", "LIVE_STREAM_OFFLINE"].indexOf(status) < 0) continue;
      var streams = collectStreams(data);
      if (streams.live) return json({ ok: false, error: "Es una transmision en vivo", live: true }, 200, 30);
      // Verifica el mejor audio (y hasta 3 candidatos); si la URL caduco, prueba la siguiente.
      var audioIdx = -1;
      var limitA = Math.min(3, streams.audioStreams.length);
      for (var i = 0; i < limitA; i++) {
        if (await probeUrl(streams.audioStreams[i].url)) { audioIdx = i; break; }
      }
      if (audioIdx >= 0) {
        var out = {
          ok: true, videoId: videoId, helperVersion: 2, source: "innertube-" + clients[ci],
          title: streams.title, author: streams.author, duration: streams.duration,
          thumbnail: streams.thumbnail, live: false, audioStreams: [], videoStreams: []
        };
        for (var a = 0; a < streams.audioStreams.length; a++) {
          var f = streams.audioStreams[a];
          out.audioStreams.push({ url: proxyMedia(request, f.url), mimeType: f.mimeType, bitrate: f.bitrate, contentLength: f.contentLength, verified: a === audioIdx });
        }
        for (var b = 0; b < streams.videoStreams.length; b++) {
          var g = streams.videoStreams[b];
          out.videoStreams.push({ url: proxyMedia(request, g.url), mimeType: g.mimeType, bitrate: g.bitrate, quality: g.quality, itag: g.itag });
        }
        if (audioIdx > 0) { var best = out.audioStreams.splice(audioIdx, 1)[0]; out.audioStreams.unshift(best); }
        return json(out, 200, 240);
      }
    } catch (err) { console.log("innertube", clients[ci], err && err.message); }
  }
  return json({ ok: false, error: "Sin streams disponibles ahora mismo" }, 502, 30);
}

// Proxy de bytes: reenvia el stream con soporte de Range (adelantar/retroceder).
async function handleMedia(request) {
  var url = new URL(request.url);
  var raw = url.searchParams.get("u") || "";
  var target = null;
  try { target = new URL(raw); } catch (e) {}
  if (!target || !/(^|\.)googlevideo\.com$/.test(target.hostname)) {
    return new Response("url no permitida", { status: 400, headers: corsHeaders() });
  }
  var headers = { "user-agent": UA, "referer": "https://www.youtube.com/" };
  var range = request.headers.get("range");
  if (range) headers["range"] = range;
  var r;
  try {
    r = await fetch(target.toString(), { headers: headers, cf: { cacheTtl: 0, cacheEverything: false } });
  } catch (err) {
    return new Response("upstream error", { status: 502, headers: corsHeaders() });
  }
  var h = new Headers();
  var copy = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];
  for (var i = 0; i < copy.length; i++) { var v = r.headers.get(copy[i]); if (v) h.set(copy[i], v); }
  if (!h.has("content-type")) h.set("content-type", "application/octet-stream");
  if (!h.has("accept-ranges")) h.set("accept-ranges", "bytes");
  h.set("access-control-allow-origin", "*");
  h.set("access-control-expose-headers", "content-type,content-length,content-range,accept-ranges");
  h.set("cache-control", "no-store");
  return new Response(r.body, { status: r.status, headers: h });
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    if (url.pathname.endsWith("/api/youtube-playlist")) return handlePlaylist(request, env);
    if (url.pathname.endsWith("/api/youtube-streams")) return handleStreams(request);
    if (url.pathname.endsWith("/api/yt-media")) return handleMedia(request);
    if (env && env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("MUSIC PLAY R10.13 helper v2 · playlist + streams + proxy de media", { status: 200, headers: corsHeaders() });
  }
};
