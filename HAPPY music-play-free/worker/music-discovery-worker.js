// ════════════════════════════════════════════════════════════════
// music-discovery-worker.js · R10.32
// Cloudflare Worker para YouTube Data API v3 proxy.
// Guarda YOUTUBE_API_KEY como secret (nunca la expone al cliente).
// ════════════════════════════════════════════════════════════════

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

const DISCOVERY_GENRES = {
  salsa: ['salsa estreno música','salsa nueva canción','salsa new release'],
  reggaeton: ['reggaeton estreno','reggaetón nueva música','reggaeton new release'],
  cumbia: ['cumbia estreno','cumbia nueva música','cumbia colombiana nueva'],
  vallenato: ['vallenato estreno','vallenato nueva canción','vallenato nuevo'],
  bachata: ['bachata estreno','bachata nueva música','bachata new release'],
  electronica: ['electronic music new release','EDM new release','electrónica estreno'],
  rock_es: ['rock en español estreno','rock latino nueva música','rock español new release'],
  reggae: ['reggae new release','reggae estreno','reggae official video new'],
  hiphop: ['hip hop new release','rap latino estreno','hip hop official video new'],
  pop: ['pop new release','pop latino estreno','pop official video new'],
  jazz: ['jazz new release','new jazz music','jazz estreno'],
  protesta: ['canción protesta nueva','música protesta latinoamericana','nueva canción social'],
  tecnocumbia: ['tecnocumbia nueva','tecnocumbia estreno','tecnocumbia 2026'],
};

// Caché en memoria del Worker (por instancia)
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname !== '/api/discovery') {
      return new Response('Not found', { status: 404, headers: corsHeaders });
    }

    const genre = url.searchParams.get('genre') || '';
    const region = url.searchParams.get('region') || 'CO';
    const days = parseInt(url.searchParams.get('days') || '30');

    // Validar género
    if (!DISCOVERY_GENRES[genre]) {
      return new Response(JSON.stringify({ error: 'Genre not allowed' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verificar API key
    if (!env.YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured', results: [] }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verificar caché
    const cacheKey = `${genre}:${region}:${days}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return new Response(JSON.stringify({ results: cached.results, cached: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      // 1. Search
      const publishedAfter = new Date(Date.now() - days * 86400000).toISOString();
      const queries = DISCOVERY_GENRES[genre];
      const queryIndex = Math.floor(Math.random() * queries.length);
      const searchParams = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        maxResults: '20',
        order: 'date',
        publishedAfter,
        regionCode: region,
        relevanceLanguage: 'es',
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        safeSearch: 'moderate',
        q: queries[queryIndex],
        key: env.YOUTUBE_API_KEY,
      });

      const searchRes = await fetch(`${YT_API_BASE}/search?${searchParams}`);
      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error('YouTube search error:', searchRes.status, errText);
        return new Response(JSON.stringify({ error: 'YouTube API error', results: [] }), {
          status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      const searchData = await searchRes.json();
      const videoIds = (searchData.items || []).map(item => item.id?.videoId).filter(Boolean);

      if (!videoIds.length) {
        cache.set(cacheKey, { results: [], timestamp: Date.now() });
        return new Response(JSON.stringify({ results: [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 2. Videos details
      const videosParams = new URLSearchParams({
        part: 'snippet,contentDetails,status,statistics',
        id: videoIds.join(','),
        key: env.YOUTUBE_API_KEY,
      });

      const videosRes = await fetch(`${YT_API_BASE}/videos?${videosParams}`);
      if (!videosRes.ok) {
        return new Response(JSON.stringify({ error: 'YouTube videos error', results: [] }), {
          status: 502, headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      const videosData = await videosRes.json();

      // 3. Filtrar embeddable y formatear
      const results = (videosData.items || [])
        .filter(item => item.status?.embeddable === true && item.status?.privacyStatus === 'public')
        .map(item => ({
          videoId: item.id,
          title: item.snippet?.title || '',
          channel: item.snippet?.channelTitle || '',
          description: item.snippet?.description || '',
          thumbnail: item.snippet?.thumbnails?.high?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          publishedAt: item.snippet?.publishedAt || '',
          duration: item.contentDetails?.duration || '',
          viewCount: item.statistics?.viewCount || '0',
        }));

      // Guardar en caché
      cache.set(cacheKey, { results, timestamp: Date.now() });

      return new Response(JSON.stringify({ results }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error('Discovery worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal error', results: [] }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
