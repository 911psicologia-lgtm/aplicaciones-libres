/**
 * MUSIC PLAY R10.11 · YouTube playlist metadata + native stream helper
 * ---------------------------------------------------------------------
 * Routes expected by the PWA:
 *   GET /api/youtube-playlist?list=PLAYLIST_ID
 *   GET /api/youtube-streams?v=VIDEO_ID
 *
 * Recommended setup:
 *   wrangler secret put YOUTUBE_API_KEY
 *
 * The key stays on Cloudflare. The browser never receives it.
 * /api/youtube-streams resolves direct audio/video stream URLs so the PWA can
 * play YouTube with the screen locked (native Media Session playback).
 * It only reads public media, exactly like the YouTube embedded player does.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36';
const MAX_ITEMS = 1000;

function json(data, status = 200, cache = 180) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${Math.min(cache,120)}, s-maxage=${cache}`,
      'access-control-allow-origin': '*'
    }
  });
}

function validPlaylistId(value='') { return /^[A-Za-z0-9_-]{6,120}$/.test(value); }
function validVideoId(value='') { return /^[A-Za-z0-9_-]{6,20}$/.test(value); }
function bestThumb(t={}) { return t.maxres?.url || t.standard?.url || t.high?.url || t.medium?.url || t.default?.url || ''; }

async function fetchJson(url) {
  const response = await fetch(url, {headers:{accept:'application/json'}});
  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`;
    const err = new Error(message); err.status = response.status; err.data = data; throw err;
  }
  return data;
}

/* ---------------- playlist metadata (existing R10 feature) ---------------- */

async function fromDataApi(list, key) {
  let title = '';
  let podcastStatus = '';
  try {
    const p = new URL('https://www.googleapis.com/youtube/v3/playlists');
    p.searchParams.set('part','snippet,status'); p.searchParams.set('id',list); p.searchParams.set('key',key);
    const d = await fetchJson(p);
    title = d.items?.[0]?.snippet?.title || '';
    podcastStatus = d.items?.[0]?.status?.podcastStatus || '';
  } catch (err) {
    // A playlist can still be readable through playlistItems even when title lookup fails.
    console.log('playlist title lookup', err.message);
  }

  const items = [];
  let pageToken = '';
  do {
    const u = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    u.searchParams.set('part','snippet');
    u.searchParams.set('playlistId',list);
    u.searchParams.set('maxResults','50');
    u.searchParams.set('key',key);
    if (pageToken) u.searchParams.set('pageToken',pageToken);
    const d = await fetchJson(u);
    for (const row of d.items || []) {
      const s = row.snippet || {};
      const videoId = s.resourceId?.videoId || '';
      if (!videoId) continue;
      const unavailable = /^Deleted video$|^Private video$/i.test(s.title || '');
      items.push({
        videoId,
        title: s.title || '',
        author: s.videoOwnerChannelTitle || s.channelTitle || 'YouTube',
        channelTitle: s.videoOwnerChannelTitle || s.channelTitle || '',
        thumbnail: bestThumb(s.thumbnails),
        position: Number.isFinite(s.position) ? s.position : items.length,
        unavailable
      });
      if (items.length >= MAX_ITEMS) break;
    }
    pageToken = items.length < MAX_ITEMS ? (d.nextPageToken || '') : '';
  } while (pageToken);

  return {ok:true, playlistId:list, title, podcastStatus, items, count:items.length, source:'youtube-data-api'};
}

function decodeHtml(s='') { return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }
function decodeJsonText(s='') { try { return JSON.parse('"' + s.replace(/"/g,'\\"') + '"'); } catch { return s.replace(/\\u0026/g,'&').replace(/\\n/g,' ').replace(/\\"/g,'"'); } }
function extractPublicPage(html) {
  const items=[], seen=new Set();
  const add=(videoId,title='',author='')=>{if(!videoId||seen.has(videoId)||items.length>=MAX_ITEMS)return;seen.add(videoId);items.push({videoId,title:decodeJsonText(title),author:decodeJsonText(author),thumbnail:`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,position:items.length});};
  let m;
  const full= /"playlistVideoRenderer":\{"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,2200}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"[\s\S]{0,1800}?(?:"shortBylineText":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)")?/g;
  while((m=full.exec(html))) add(m[1],m[2]||'',m[3]||'');
  const panel=/"playlistPanelVideoRenderer":\{[\s\S]{0,1500}?"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,1500}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"/g;
  while((m=panel.exec(html))) add(m[1],m[2]||'');
  return items;
}
async function fromPublicPage(list) {
  const url=`https://www.youtube.com/playlist?list=${encodeURIComponent(list)}&hl=es&gl=CO`;
  const r=await fetch(url,{headers:{'user-agent':UA,'accept-language':'es-CO,es;q=0.9,en;q=0.7','accept':'text/html,application/xhtml+xml'},cf:{cacheTtl:180,cacheEverything:true}});
  if(!r.ok) throw new Error(`YouTube HTTP ${r.status}`);
  const html=await r.text();
  const meta=html.match(/<meta\s+name="title"\s+content="([^"]*)"/i)||html.match(/<title>([^<]*)<\/title>/i);
  const title=meta?decodeHtml(meta[1]).replace(/\s*-\s*YouTube\s*$/i,'').trim():'';
  const items=extractPublicPage(html);
  return {ok:true,playlistId:list,title,podcastStatus:'',items,count:items.length,source:'youtube-public-page'};
}

async function handlePlaylist(request, env) {
  const url=new URL(request.url), list=(url.searchParams.get('list')||'').trim();
  if(!validPlaylistId(list)) return json({ok:false,error:'playlist id inválido'},400,0);
  try {
    if(env?.YOUTUBE_API_KEY) return json(await fromDataApi(list, env.YOUTUBE_API_KEY),200,300);
    const fallback=await fromPublicPage(list);
    return json({...fallback,warning:'Configura YOUTUBE_API_KEY para nombres y paginación estables.'},200,120);
  } catch(err) {
    return json({ok:false,playlistId:list,error:err.message||'No se pudo leer la playlist',source:env?.YOUTUBE_API_KEY?'youtube-data-api':'youtube-public-page'},502,0);
  }
}

/* ---------------- R10.11 · native stream resolution ---------------- */

// The player endpoint returns stream URLs for known inner clients. We probe one
// URL with a Range request to make sure it actually serves bytes (some client
// configurations answer with URLs that later 403).
async function innertubePlayer(videoId, client) {
  const bodies = {
    ANDROID: {
      context:{client:{clientName:'ANDROID',clientVersion:'19.09.37',androidSdkVersion:30,hl:'es',gl:'CO'}},
      videoId, params:'8AEB', contentCheckOk:true, racyCheckOk:true
    },
    IOS: {
      context:{client:{clientName:'IOS',clientVersion:'19.09.3',deviceModel:'iPhone14,3',hl:'es',gl:'CO'}},
      videoId, params:'8AEB', contentCheckOk:true, racyCheckOk:true
    }
  };
  const uas = {
    ANDROID:'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
    IOS:'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 17_2 like Mac OS X)'
  };
  const r = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method:'POST',
    headers:{'content-type':'application/json','user-agent':uas[client],'accept-language':'es-CO,es;q=0.9','x-goog-api-format-version':'2'},
    body: JSON.stringify(bodies[client]),
    cf:{cacheTtl:60,cacheEverything:true}
  });
  if(!r.ok) throw new Error(`player ${client} HTTP ${r.status}`);
  return r.json();
}

async function probeUrl(url) {
  try{
    const r = await fetch(url, {headers:{range:'bytes=0-127','user-agent':UA}, cf:{cacheTtl:0}});
    if(r.status===200||r.status===206){ try{await r.body?.cancel?.();}catch{} return true; }
    return false;
  }catch{ return false; }
}

function collectStreams(data) {
  const sd = data?.streamingData || {};
  const vd = data?.videoDetails || {};
  const adaptive = Array.isArray(sd.adaptiveFormats) ? sd.adaptiveFormats : [];
  const muxed = Array.isArray(sd.formats) ? sd.formats : [];
  const audioStreams = adaptive
    .filter(f=>String(f.mimeType||'').startsWith('audio/')&&f.url)
    .map(f=>({url:f.url, mimeType:String(f.mimeType).split(';')[0], bitrate:f.bitrate||0, contentLength:Number(f.contentLength)||0}))
    .sort((a,b)=>b.bitrate-a.bitrate);
  const videoStreams = muxed
    .filter(f=>String(f.mimeType||'').startsWith('video/')&&f.url)
    .map(f=>({url:f.url, mimeType:String(f.mimeType).split(';')[0], bitrate:f.bitrate||0, quality:f.qualityLabel||'', itag:f.itag||0}))
    .sort((a,b)=>(b.bitrate||0)-(a.bitrate||0));
  const thumbs = vd.thumbnail?.thumbnails || [];
  const thumbnail = thumbs.length ? thumbs[thumbs.length-1].url : `https://i.ytimg.com/vi/${videoIdOf(data)}/hqdefault.jpg`;
  return {
    audioStreams, videoStreams,
    title: vd.title||'',
    author: vd.author||'YouTube',
    duration: Number(vd.lengthSeconds)||0,
    thumbnail,
    live: !!(vd.isLiveContent)
  };
}
function videoIdOf(data){ return data?.videoDetails?.videoId||''; }

const INV_INSTANCES = ['https://inv.nadeko.net','https://invidious.nerdvpn.de','https://invidious.f5.si','https://yt.chocolatemoo53.com','https://invidious.tiekoetter.com'];

async function fromInvidious(videoId) {
  for(const base of INV_INSTANCES){
    try{
      const d = await fetchJson(`${base}/api/v1/videos/${encodeURIComponent(videoId)}?local=true`);
      if(d?.liveNow) break;
      const adaptive = Array.isArray(d.adaptiveFormats)?d.adaptiveFormats:[];
      const muxed = Array.isArray(d.formatStreams)?d.formatStreams:[];
      const audioStreams = adaptive.filter(f=>String(f.type||'').startsWith('audio/')&&f.url)
        .map(f=>({url:f.url,mimeType:String(f.type).split(';')[0],bitrate:Number(f.bitrate)||0}))
        .sort((a,b)=>b.bitrate-a.bitrate);
      const videoStreams = muxed.filter(f=>String(f.type||'').startsWith('video/')&&f.url)
        .map(f=>({url:f.url,mimeType:String(f.type).split(';')[0],bitrate:Number(f.bitrate)||0,quality:f.resolution||'',itag:Number(f.itag)||0}));
      if(audioStreams.length){
        const thumbs=d.videoThumbnails||[];
        return {audioStreams,videoStreams,title:d.title||'',author:d.author||'YouTube',duration:Number(d.lengthSeconds)||0,thumbnail:d.thumbnailUrl||thumbs.find(t=>t.quality==='hqdefault')?.url||'',live:false,source:'invidious'};
      }
    }catch(err){ console.log('invidious', base, err.message); }
  }
  return null;
}

async function handleStreams(request) {
  const url=new URL(request.url), videoId=(url.searchParams.get('v')||'').trim();
  if(!validVideoId(videoId)) return json({ok:false,error:'video id inválido'},400,0);

  // 1) InnerTube direct clients with URL probing.
  for(const client of ['ANDROID','IOS']){
    try{
      const data = await innertubePlayer(videoId, client);
      const status = data?.playabilityStatus?.status || '';
      if(!['OK','LIVE_STREAM_OFFLINE'].includes(status)) continue;
      const streams = collectStreams(data);
      if(streams.live) return json({ok:false,error:'Es una transmisión en vivo',live:true},200,30);
      if(streams.audioStreams.length && await probeUrl(streams.audioStreams[0].url)){
        return json({ok:true, videoId, source:`innertube-${client}`, ...streams},200,240);
      }
    }catch(err){ console.log('innertube', client, err.message); }
  }

  // 2) Public mirror instances, fetched from Cloudflare (different network path).
  const inv = await fromInvidious(videoId);
  if(inv && inv.audioStreams.length && await probeUrl(inv.audioStreams[0].url)){
    return json({ok:true, videoId, source:inv.source, ...inv},200,180);
  }

  return json({ok:false,error:'Sin streams disponibles ahora mismo'},502,30);
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS'}});
    if(url.pathname.endsWith('/api/youtube-playlist')) return handlePlaylist(request,env);
    if(url.pathname.endsWith('/api/youtube-streams')) return handleStreams(request);
    if(env?.ASSETS) return env.ASSETS.fetch(request);
    return new Response('MUSIC PLAY R10.11 helper · playlist + streams',{status:200});
  }
};
