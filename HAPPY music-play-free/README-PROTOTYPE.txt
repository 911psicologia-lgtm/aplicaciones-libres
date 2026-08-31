MUSIC PLAY · HAPPY — R5 YOUTUBE PLAYLISTS + MOBILE COMPACT

CORRECCIÓN PRINCIPAL
La R4 intentaba obtener los videos de una playlist usando un único sondeo del IFrame.
R5 implementa una estrategia doble:
1) helper same-origin opcional: ./api/youtube-playlist?list=...
2) fallback puro navegador con YouTube IFrame API: cuePlaylist() + getPlaylist(),
   escuchando estado CUED y haciendo varios sondeos antes de declarar fallo.

YOUTUBE MUSIC
Los enlaces music.youtube.com/playlist?... se normalizan a una playlist YouTube estándar
internamente, conservando el enlace original. Esto permite que el usuario pegue directamente
la URL de YouTube Music sin transformarla a mano.

PLAYLISTS DE PRUEBA INCLUIDAS
1) PLW4RwQaj-mTI
2) PLkFMTdwrLz-QR3GTfoYApADfo_u0a6yjc
3) PLbeLb9mBGU24

Dentro de Cargar → Enlace existe un panel mínimo “3 playlists de prueba”.
Los botones 1/2/3 precargan cada URL y “Probar 3” ejecuta diagnóstico secuencial.

SI YOUTUBE NO ENTREGA LOS ELEMENTOS
La playlist no se pierde: MUSIC PLAY la guarda como lista enlazada, permite reproducirla
mediante YouTube y muestra “↻ Importar” para reintentar la enumeración en otro momento.

MÓVIL
- Home comprimido para caber en una pantalla.
- Hero horizontal compacto.
- Cargar / Play / Playlist / Mix en cuadrícula 2×2 incluso en teléfonos estrechos.
- Acciones rápidas en chips pequeños: Archivo, Carpeta, Enlace, Música, + Lista.
- Resumen inferior compacto.
- Biblioteca, búsqueda, reproductor y hojas modales también reducidos.

PRUEBAS INTERNAS REALIZADAS
- Sintaxis app.js: OK.
- Sintaxis helper Cloudflare: OK.
- Viewport de prueba: 390×844.
- Home completo termina en y=463 px; no requiere scroll para las acciones iniciales.
- Cuadrícula móvil verificada: 2 columnas.
- Las 3 URLs suministradas se reconocen como youtube-playlist.
- Simulación controlada de YouTube IFrame: las 3 listas devolvieron IDs correctamente.
- Importación secuencial simulada de las 3 listas: 3 playlists propias creadas.
- Errores JavaScript durante prueba: 0.

LIMITACIÓN DE LA PRUEBA INTERNA
El entorno de construcción no tiene salida directa a youtube.com, por lo que la prueba contra
YouTube real debe hacerse una vez publicada por HTTPS. Para facilitarla, el diagnóstico de las
3 listas quedó integrado dentro de la propia aplicación.
