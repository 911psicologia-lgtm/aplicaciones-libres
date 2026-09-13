MUSIC PLAY R10.13 · HELPER DE PLAYLISTS Y STREAMS NATIVOS DE YOUTUBE (v2, con proxy)

Objetivo
- /api/youtube-playlist: título, canal, miniatura, posición y videoId de playlists públicas.
- /api/youtube-streams: resolver streams directos (InnerTube ANDROID → IOS → TVEMBEDDED)
  y devolverlos REESCRITOS hacia el proxy del propio Worker.
- /api/yt-media (NUEVO v2): proxy de bytes de googlevideo con soporte de Range.

Por qué el proxy es imprescindible
- Las URLs de googlevideo quedan firmadas para la IP que pidió los streams. Si el
  Worker las pide, solo la IP del Worker puede descargarlas: tu teléfono recibiría 403.
- /api/yt-media reenvía los bytes (con Range) desde tu Worker: el teléfono reproduce,
  adelanta y retrocede sin errores. Es el mismo mecanismo que usan Invidious/Piped,
  pero corriendo en TU Worker sin terceros caídos.

Despliegue en 3 pasos (gratis)
1. Abre https://workers.cloudflare.com → Start building / Create Worker.
2. Borra el código de ejemplo, pega playlist-api-worker.mjs COMPLETO y pulsa Deploy.
3. Copia la URL https://tu-helper.tu-usuario.workers.dev y pégala en
   MUSIC PLAY → Menú ⋯ → Motor de YouTube → «Helper propio» → Probar motor nativo.

Alternativa same-origin
- Si publicas la PWA en Cloudflare Pages, añade este archivo como función
  (Pages Functions) para que /api/youtube-streams responda desde tu dominio;
  la app lo detecta sola sin configurar nada.

Opcional (playlists con títulos y paginación estables)
- wrangler secret put YOUTUBE_API_KEY (YouTube Data API v3 habilitada).

Respuesta de /api/youtube-streams (v2)
{
  "ok": true,
  "videoId": "...",
  "helperVersion": 2,
  "source": "innertube-ANDROID | innertube-IOS | innertube-TVEMBEDDED",
  "title": "...", "author": "...", "duration": 213,
  "thumbnail": "https://i.ytimg.com/...",
  "audioStreams": [{"url": "https://TU-WORKER/api/yt-media?u=...", "mimeType": "audio/mp4", "bitrate": 129000, "verified": true}],
  "videoStreams": [{"url": "https://TU-WORKER/api/yt-media?u=...", "mimeType": "video/mp4", "quality": "360p", "itag": 18}]
}

Notas
- El audio devuelto ya viene verificado con una petición Range contra googlevideo.
- Las URLs caducan (~6 h); la PWA las resuelve de nuevo por sesión (caché 90 min).
- La clave de API nunca vive en app.js ni en el ZIP público; solo como secreto del Worker.
- El proxy no almacena nada: reenvía bytes públicos solo mientras alguien escucha.
