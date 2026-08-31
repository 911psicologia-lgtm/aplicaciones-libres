/**
 * OPTIONAL helper for MUSIC PLAY R5.
 * Mount this handler at the same origin/path used by the PWA so
 * GET ./api/youtube-playlist?list=PLAYLIST_ID returns public playlist metadata.
 * It does NOT download audio/video. It only reads public playlist page metadata.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=120, s-maxage=300',
      'access-control-allow-origin': '*'
    }
  });
}

function decodeHtml(s='') {
  return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function decodeJsonText(s='') {
  try { return JSON.parse('"' + s.replace(/"/g,'\\"') + '"'); } catch { return s.replace(/\\u0026/g,'&').replace(/\\n/g,' ').replace(/\\"/g,'"'); }
}

function extractPlaylistItems(html) {
  const items = [];
  const seen = new Set();
  const add = (videoId, title='', author='') => {
    if(!videoId || seen.has(videoId)) return;
    seen.add(videoId);
    items.push({videoId, title: decodeJsonText(title), author: decodeJsonText(author)});
  };

  // Normal YouTube playlist page.
  const full = /"playlistVideoRenderer":\{"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,2200}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"[\s\S]{0,1800}?(?:"shortBylineText":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)")?/g;
  let m;
  while((m = full.exec(html))) add(m[1], m[2] || '', m[3] || '');

  // Fallback when the title structure differs.
  if(!items.length) {
    const simple = /"playlistVideoRenderer":\{"videoId":"([A-Za-z0-9_-]{6,})"/g;
    while((m = simple.exec(html))) add(m[1]);
  }

  // Playlist panel renderers can appear in some music-oriented layouts.
  const panel = /"playlistPanelVideoRenderer":\{[\s\S]{0,1500}?"videoId":"([A-Za-z0-9_-]{6,})"[\s\S]{0,1500}?"title":\{"runs":\[\{"text":"((?:\\.|[^"\\])*)"/g;
  while((m = panel.exec(html))) add(m[1], m[2] || '');

  return items.slice(0, 500);
}

async function handlePlaylist(request) {
  const url = new URL(request.url);
  const list = (url.searchParams.get('list') || '').trim();
  if(!/^[A-Za-z0-9_-]{6,100}$/.test(list)) return json({ok:false,error:'playlist id inválido'},400);

  const upstreamUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(list)}&hl=es&gl=CO`;
  const upstream = await fetch(upstreamUrl, {
    headers: {
      'user-agent': UA,
      'accept-language': 'es-CO,es;q=0.9,en;q=0.7',
      'accept': 'text/html,application/xhtml+xml'
    },
    cf: { cacheTtl: 180, cacheEverything: true }
  });
  if(!upstream.ok) return json({ok:false,error:`YouTube HTTP ${upstream.status}`},502);

  const html = await upstream.text();
  let title = '';
  const meta = html.match(/<meta\s+name="title"\s+content="([^"]*)"/i) || html.match(/<title>([^<]*)<\/title>/i);
  if(meta) title = decodeHtml(meta[1]).replace(/\s*-\s*YouTube\s*$/i,'').trim();

  const items = extractPlaylistItems(html);
  return json({ok:true,playlistId:list,title,items,count:items.length,source:'youtube-public-page'});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if(url.pathname.endsWith('/api/youtube-playlist')) return handlePlaylist(request);
    // If this Worker is inserted in front of static assets, bind ASSETS and fall through.
    if(env?.ASSETS) return env.ASSETS.fetch(request);
    return new Response('MUSIC PLAY playlist helper', {status:200});
  }
};
