MUSIC PLAY · HAPPY — R10 LIBRARY FIRST

FASE 1 — SHELL MÓVIL
- Barra inferior permanente: Inicio · Buscar · Biblioteca.
- Mini-player persistente inmediatamente encima de la barra.
- Buscar disponible desde cualquier sección.
- Inicio adaptativo: onboarding únicamente para una biblioteca nueva; después muestra Continuar, Favoritos, + Escuchadas, Recientes y Playlists.
- Biblioteca como centro: Playlists · Canciones · Álbumes.

FASE 2 — IMPORTACIÓN ESCALABLE
- Importación “index-first”: la biblioteca aparece antes de terminar metadata/duración/carátulas.
- Metadata se procesa en segundo plano por porciones o tiempos ociosos.
- Carpetas elegidas mediante File System Access guardan referencias FileSystemHandle cuando el navegador lo permite, reduciendo copias masivas de blobs.
- Fallback a IndexedDB para navegadores sin FileSystemHandle.
- Renderizado virtual/lazy: una lista de cientos de pistas no genera cientos de filas de golpe.
- Último lote continúa identificado y preseleccionado para crear playlists de una sola acción.

FASE 3 — YOUTUBE
- Importador de playlists preparado para helper same-origin /api/youtube-playlist.
- Worker Cloudflare incluido.
- Con YOUTUBE_API_KEY usa YouTube Data API paginada, 50 elementos por solicitud, hasta 1000 elementos.
- Recupera título de playlist, título de canción, autor/canal, orden, thumbnail e indisponibilidad.
- Sin API key conserva fallback de página pública/IFrame, menos estable.
- Antes de exportar una playlist M3U8, R10 intenta completar los metadatos YouTube faltantes.

FASE 4 — PLAYLISTS
- Playlist visual con carátula/collage.
- Menú contextual: Aleatorio, Buscar dentro de lista, Mix/modos, Reproducir a continuación, Añadir a cola, Fijar en Inicio, Exportar M3U8, Renombrar, Añadir enlace y Eliminar.
- Favoritos, + Escuchadas, Recientes y En repetición siguen siendo colecciones automáticas.
- Modos de reproducción preservados: Normal, Aleatorio sin repetición, Mix inteligente, Radio, Redescubrir, Sorpréndeme y Cola Viva.

FASE 5 — PWA / AUDIO
- Botón de instalación visible y tarjeta de instalación durante el primer uso.
- Service Worker R10, manifest standalone + fullscreen override, iconos 192/512/maskable.
- Media Session preservada para audio local/directo: metadata, Play/Pausa, Anterior/Siguiente, seek y pantalla bloqueada cuando el SO/navegador mantenga el audio.
- YouTube continúa sujeto a las restricciones del IFrame/navegador al bloquear pantalla; MUSIC PLAY no simula una garantía que la plataforma no ofrece.

PRIVACIDAD
Biblioteca, favoritos, playlists, historial y estadísticas de escucha siguen siendo local-first. Las fuentes externas solo contactan sus servicios cuando se reproducen/importan o cuando se solicitan metadatos.


R10.4 — PERMISOS LOCALES
- Archivos individuales nuevos se guardan como Blob para no pedir permiso al reproducir.
- Carpetas nuevas usan un único FileSystemDirectoryHandle y rutas relativas.
- Tras reiniciar, como máximo se solicita permiso una vez por carpeta si el navegador lo exige.
- Bibliotecas legacy con un handle por canción ofrecen “Conectar carpeta una sola vez” para migrar todas las coincidencias sin perder playlists, favoritos ni estadísticas.

R10.5 — BIBLIOTECA LOCAL Y REPRODUCCIÓN RESILIENTE
- OPFS: los archivos nuevos se copian progresivamente al almacenamiento privado de MUSIC PLAY para evitar permisos repetidos de Android al reproducirlos después.
- Migración de bibliotecas antiguas: seleccionar la carpeta una vez permite copiar coincidencias a OPFS sin perder playlists/favoritos/historial.
- Fuentes externas: si YouTube/SoundCloud/enlace directo falla, se registra el error y la cola continúa con la siguiente pista disponible.
- Reordenamiento: pulsación larga + arrastre vertical en playlists manuales cambia el orden persistente.
