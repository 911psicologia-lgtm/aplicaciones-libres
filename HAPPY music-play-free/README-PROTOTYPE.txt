MUSIC PLAY · HAPPY — R6 PLAYLIST HUB

OBJETIVO
La playlist deja de ser una pestaña precaria y pasa a ser una entidad central de la aplicación.

R6 IMPLEMENTA
- Repositorio visible “Tus listas”: todas las playlists quedan guardadas como tarjetas persistentes.
- Detalle compacto de cada playlist con Play, Mix, + Canciones y + Enlace.
- Creación de playlist directamente desde la lista de canciones mediante selección múltiple.
- Botón + en cada canción para añadirla rápidamente a una playlist existente o crear una nueva.
- Importar una playlist de YouTube como nueva playlist propia.
- Desde una playlist existente, pegar otro link de playlist de YouTube y sumar sus canciones a la misma lista.
- Una playlist puede conservar varias fuentes externas (sources), no una sola referencia.
- Si YouTube no entrega aún los elementos, la fuente queda enlazada dentro de la playlist y permite Play, abrir original y reintentar.
- Migración compatible con playlists R5 que usaban externalRef/importDiagnostic.
- Menú de playlist: renombrar, añadir enlace, eliminar playlist.
- UI móvil más compacta: al entrar a una playlist se oculta el encabezado duplicado de “Tus listas”.

CORRECCIÓN YOUTUBE IMPORTANTE
R5 creaba el probe de YouTube sobre un iframe de 2x2 px. R6 crea un contenedor real para YT.Player de 240x200 px fuera de pantalla y luego usa cuePlaylist/getPlaylist. Esto corrige una causa probable de fallos en la enumeración de playlists en móviles.

PRUEBAS INTERNAS
- Creación desde biblioteca con 2 MP3: OK.
- Añadir canción desde botón + de fila: OK.
- Repositorio y detalle de playlist en viewport 390x844: OK.
- Añadir una playlist de YouTube a una playlist existente con motor YT simulado: OK.
- Las tres URLs de prueba suministradas son detectadas correctamente como YouTube Music playlists y, con respuesta simulada de YT.Player, generan tres playlists persistentes sin errores JS.

NOTA
La enumeración real de YouTube sigue dependiendo de que YouTube permita la respuesta al reproductor IFrame en el dispositivo/red. El helper Cloudflare incluido sigue siendo la vía complementaria más estable cuando se integra en el despliegue.
