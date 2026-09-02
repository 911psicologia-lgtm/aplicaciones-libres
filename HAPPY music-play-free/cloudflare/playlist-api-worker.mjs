/**
 * MUSIC PLAY R10 · YouTube playlist metadata helper
 * --------------------------------------------------
 * Route expected by the PWA:
 *   GET /api/youtube-playlist?list=PLAYLIST_ID
 *
 * Recommended setup:
 *   wrangler secret put YOUTUBE_API_KEY
 *
 * The key stays on Cloudflare. The browser never receives it.
 * This helper only reads public metadata. It does not download media.
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

async function fromDataApi(list, key) {
  let title = '';
  try {
    const p = new URL('https://www.googleapis.com/youtube/v3/playlists');
    p.searchParams.set('part','snippet'); p.searchParams.set('id',list); p.searchParams.set('key',key);
    const d = await fetchJson(p);
    title = d.items?.[0]?.snippet?.title || '';
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

  return {ok:true, playlistId:list, title, items, count:items.length, source:'youtube-data-api'};
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
  return {ok:true,playlistId:list,title,items,count:items.length,source:'youtube-public-page'};
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

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS'}});
    if(url.pathname.endsWith('/api/youtube-playlist')) return handlePlaylist(request,env);
    if(env?.ASSETS) return env.ASSETS.fetch(request);
    return new Response('MUSIC PLAY R10 playlist helper',{status:200});
  }
};
