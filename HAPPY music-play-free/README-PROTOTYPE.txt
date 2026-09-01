MUSIC PLAY · HAPPY — R9 IMMERSIVE

CAMBIOS R9
- Instalación PWA visible desde la apertura: icono ⇩ permanente en modo web + asistente inicial.
- En Android sin prompt nativo, ofrece abrir directamente en Chrome mediante intent.
- Manifest actualizado a fullscreen con fallback standalone.
- Acción manual ⛶ Pantalla completa y diagnóstico PWA oculto en ⋯.
- Interfaz móvil desduplicada: en navegador se oculta el segundo rótulo MUSIC PLAY y se elimina el icono repetido del hero.
- Media Session ampliada: play, pausa, anterior, siguiente, seek ±10 s, seekto, stop, metadata y artwork.
- Archivos locales/directos preparados para continuar con pantalla bloqueada cuando el navegador/SO mantiene el audio activo.
- YouTube: reproductor visible mínimo 200 px, origin/referrer y recuperación al volver a primer plano. La reproducción con pantalla bloqueada sigue dependiendo de las restricciones de YouTube/Chrome y no puede garantizarse desde un iframe.
- Lotes de importación: lo recién subido queda registrado y preseleccionado automáticamente.
- Al cargar una carpeta/selección aparece “Crear playlist con N” sin seleccionar una por una.
- En “Crear desde canciones” y “Añadir canciones” la última carga aparece primero y marcada.
- Importaciones de playlists YouTube registran también el último lote importado.
- Carátulas: ID3 APIC en MP3, thumbnail de YouTube/SoundCloud y captura de fotograma para videos locales (primeros 24 por lote para no bloquear móviles).
- Las playlists propias usan la portada de su primera canción cuando está disponible.
- Carátulas persistidas en IndexedDB store `covers`.

PRIVACIDAD
Todo el historial local, archivos persistidos, favoritos, playlists y carátulas locales permanecen en el navegador/dispositivo salvo fuentes externas que requieren su servicio original.


R9B: se renovaron los assets de icono PWA (192, 512, 512 maskable y Apple touch).


R10 PLAY MODES: se añaden Aleatorio sin repetición por vuelta, Mix inteligente, Radio de biblioteca, Redescubrir, Sorpréndeme y Cola Viva. El botón ⇄ del reproductor abre el selector de modos.
