MUSIC PLAY R10.11 · HELPER DE PLAYLISTS Y STREAMS NATIVOS DE YOUTUBE

Objetivo
- /api/youtube-playlist: obtener título, canal, miniatura, posición y videoId de playlists públicas. Paginación con YouTube Data API (50 por llamada). La API key vive solo en Cloudflare.
- /api/youtube-streams (NUEVO en R10.11): resolver streams directos de audio/video para que la PWA reproduzca YouTube con la pantalla bloqueada usando elementos <audio>/<video> nativos y Media Session.
- Este helper NO descarga ni re-distribuye archivos: expone las mismas URLs públicas que entrega el reproductor de YouTube.

Configuración recomendada
1. Integra playlist-api-worker.mjs en el Worker que sirve la PWA, o enruta /api/youtube-playlist y /api/youtube-streams hacia él.
2. Crea una API key con YouTube Data API v3 habilitada.
3. Guarda la clave como secreto de Cloudflare:
   wrangler secret put YOUTUBE_API_KEY
4. La aplicación consulta automáticamente (en este orden):
   a) /api/youtube-streams?v=VIDEO_ID  (helper propio, vía más estable)
   b) Instancias Piped/Invidious descubiertas en runtime (registro oficial + lista integrada)
   c) Instancia personalizada configurada en Menú ⋯ → Motor de YouTube
   d) Reproductor visible (iframe) como último recurso

Respuesta de /api/youtube-streams
{
  "ok": true,
  "videoId": "...",
  "source": "innertube-ANDROID | innertube-IOS | invidious",
  "title": "...", "author": "...", "duration": 213,
  "thumbnail": "https://i.ytimg.com/...",
  "audioStreams": [{"url": "...", "mimeType": "audio/mp4", "bitrate": 129000}],
  "videoStreams": [{"url": "...", "mimeType": "video/mp4", "quality": "360p"}]
}

Notas
- Cada URL devuelta se verifica con una petición Range antes de entregarse.
- Las URLs de stream caducan (~6 h); la PWA las resuelve de nuevo por sesión.
- Sin el helper, el motor nativo depende de instancias públicas que pueden variar; el reproductor visible (iframe) cubre ese caso sin romper la cola.

La clave nunca debe escribirse dentro de app.js o del ZIP público.
