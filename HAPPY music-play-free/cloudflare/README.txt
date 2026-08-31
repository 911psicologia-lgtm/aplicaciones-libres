MUSIC PLAY R5 — helper opcional para Cloudflare Worker

La app funciona sin este helper usando la YouTube IFrame API oficial.
Este helper mejora la importación de playlists cuando el navegador no logra enumerar
los elementos mediante getPlaylist(). No descarga audio ni video: solo consulta
metadatos públicos de la playlist.

Ruta que espera la app:
  ./api/youtube-playlist?list=PLAYLIST_ID

Si el portal principal ya es un Cloudflare Worker, integre la función handlePlaylist
al Worker existente en esa ruta. No hace falta cambiar la interfaz de MUSIC PLAY.
