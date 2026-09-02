MUSIC PLAY R10 · HELPER DE PLAYLISTS YOUTUBE

Objetivo
- Obtener título, canal, miniatura, posición y videoId de playlists públicas.
- Paginar listas grandes (50 elementos por llamada a YouTube Data API).
- Mantener la API key fuera del navegador.
- NO descarga audio ni video.

Configuración recomendada
1. Integra playlist-api-worker.mjs en el Worker que sirve la PWA, o enruta /api/youtube-playlist hacia él.
2. Crea una API key con YouTube Data API v3 habilitada.
3. Guarda la clave como secreto de Cloudflare:
   wrangler secret put YOUTUBE_API_KEY
4. La aplicación consulta automáticamente:
   /api/youtube-playlist?list=PLAYLIST_ID

Sin YOUTUBE_API_KEY
- El helper conserva un fallback de lectura de página pública.
- Ese fallback puede ser incompleto y no es recomendable para listas de cientos de canciones.

La clave nunca debe escribirse dentro de app.js o del ZIP público.
