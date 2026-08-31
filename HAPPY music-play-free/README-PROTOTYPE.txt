MUSIC PLAY · HAPPY — r4 UNIVERSAL PROTOTYPE

OBJETIVO
Mantener la interfaz minimalista y añadir una capa híbrida de fuentes.

IMPLEMENTADO EN ESTE PROTOTIPO
- Archivos y carpetas locales.
- Audio y video local aceptado por extensión/tipo.
- Enlace universal con detección automática.
- YouTube: video individual como referencia reproducible con IFrame API.
- YouTube: playlists; intenta leer IDs con IFrame API e importarlos como playlist propia. Si YouTube no expone los elementos, guarda la playlist como fuente enlazada reproducible.
- SoundCloud: referencia y reproducción mediante Widget oficial.
- URLs directas de audio/video: reproducir por enlace y descargar/importar cuando el servidor permita CORS.
- Spotify y Apple Music: detección y guardado como referencia; no extracción ni reproducción integrada en esta fase.
- Cola, Mix y playlists híbridas para fuentes ya reproducibles.
- PWA y caché local de la app.
- WMA/WMV/AVI/MKV/MOV/3GP aceptados en el importador. Si el navegador no los decodifica, se conservan pero el conversor WASM queda para la siguiente fase.

PRUEBAS LOCALES REALIZADAS
- Inicio de app sin errores JS.
- Importación de MP3 con metadatos.
- Reproducción local real y avance de tiempo.
- Creación de playlists.
- Detección de URL directa, YouTube video, YouTube playlist, SoundCloud, Spotify y Apple Music.

NOTA
Las integraciones YouTube/SoundCloud necesitan despliegue HTTPS y conexión a Internet para la prueba end-to-end contra sus reproductores oficiales.
