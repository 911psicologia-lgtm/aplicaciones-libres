HAPPY · MUSIC PLAY — R10.16 LIVE RADIO
=====================================

ENTREGABLES
- HAPPY_R10.16_LIVE_RADIO.apk: release firmado para instalar/actualizar R10.15.
- MUSIC-PLAY-FREE-HAPPY_R10.16_SOURCE_2026-09-15.zip: fuente web, Cloudflare y Android.

INSTALACIÓN
1. Instala el APK sobre R10.15. Conserva el mismo applicationId y certificado.
2. Autoriza notificaciones para ver controles multimedia.
3. Para ⧉ flotante, Android puede pedir «Mostrar sobre otras apps».

RADIO
- Abre la quinta pestaña Radio. Colombia carga hasta 20 emisoras verificadas.
- Busca por nombre, ciudad/estado, país o género; guarda favoritas y consulta recientes.
- La barra inferior muestra EN VIVO, sin progreso. ⏮/⏭ recorren la lista visible.
- «Agregar URL» admite streams directos y listas M3U/PLS HTTPS.
- Grabar está disponible para streams progresivos MP3/AAC/Ogg; HLS no se graba.
- Las grabaciones aparecen en Biblioteca > Radio y en Música/HAPPY/Radio (Android 10+).

CARPETAS Y ONBOARDING
- El botón Comenzar abre las opciones de carga.
- Carpeta usa ACTION_OPEN_DOCUMENT_TREE y recorre subcarpetas.
- En el APK no se muestra el instalador PWA.

SEGUNDO PLANO
Radio y audio remoto directo se reproducen en ExoPlayer dentro de un servicio mediaPlayback, con MediaSession y notificación. La app reintenta radio tras 1, 2, 4 y 8 segundos.

PRIVACIDAD Y DERECHOS
Las favoritas/recientes se guardan localmente. Las grabaciones son para uso personal; su redistribución puede requerir autorización de la emisora o titulares.
