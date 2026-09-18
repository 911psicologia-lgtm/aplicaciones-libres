HAPPY · MUSIC PLAY — R10.15 (APK con los 8 pedidos corregidos)
==============================================================
Fecha: 2026-09-15

CONTENIDO DEL PAQUETE
---------------------
1. HAPPY_R10.15_FLOTANTE.apk          ← INSTALA ESTE (release, firmado)
2. HAPPY_R10.15_FLOTANTE_debug.apk    ← alternativo de prueba (debug)
3. happy-release.keystore             ← llave de firma (guárdala: firmará TODAS
                                        las versiones futuras)
4. R10.15-IMPLEMENTACION.txt          ← detalle técnico de cada arreglo
5. README-R10.15.txt                  ← este archivo

INSTALACIÓN (IMPORTANTE — LEER)
-------------------------------
· El entorno de compilación anterior se perdió y la llave fue regenerada:
  esta versión está firmada con una firma NUEVA.
· Por eso Android NO permite actualizar sobre la versión anterior:
  1) Abre tu MUSIC PLAY actual → ⋯ → 🛡 Recovery JSON → ⇩ Exportar Recovery
     (guarda el archivo si quieres conservar playlists/favoritos).
  2) Desinstala la versión vieja de MUSIC PLAY.
  3) Instala HAPPY_R10.15_FLOTANTE.apk (permite "fuentes desconocidas" si
     Android lo pide).
  4) Abre la app → ⋯ → ⇧ Restaurar Recovery → elige el JSON del paso 1.
· Es un único paso extra SOLO esta vez: las próximas versiones volverán a
  actualizar directo porque ya usaremos esta misma llave.

LOS 8 PEDIDOS — QUÉ CAMBIÓ
--------------------------
1. El aviso «Instalar PWA» ya NO aparece dentro del APK (botón ⇩ y coach
   ocultos; el evento de instalación se ignora en el entorno nativo).
2. Importar CARPETA vuelve a funcionar: ⌂ Carpeta abre el selector nativo de
   carpetas de Android (árbol, con subcarpetas) y MUSIC PLAY indexa todos
   los audios. En navegador funciona como siempre.
3. Cada playlist tiene su fila única: ▶ (icono) + ✦ Mix + ✦≋ Modos (abre los
   modos que ya existían) + ＋ Canciones + 🔗 Enlace.
4. YouTube en pantalla bloqueada ya no se silencia: el servicio nativo ya no
   pide el foco de audio que apagaba el sonido a los pocos segundos.
5. Biblioteca tiene la pestaña nueva «🎙 Podcast» junto a Playlists /
   Canciones / Álbumes (abre el hub de podcasts).
6. El mini reproductor interno ⧉ está desactivado/retirado. El ⋯ →
   «◱ Pantalla reducida flotante» abre la VENTANA FLOTANTE REAL de Android
   (arrastrable, con ⏮ ▶ ⏭, progreso y botón ⤢ para volver a la app).
7. La calidad de audio vuelve a la normalidad (sin ducking/deriva de volumen
   del servicio nativo sobre el reproductor).
8. Bluetooth/auto: la sesión multimedia nativa envía título, artista, álbum y
   duración a la pantalla del auto (AVRCP) y acepta ⏮ ▶ ⏭ del volante,
   auriculares y la notificación.

CÓMO PROBAR LO IMPORTANTE (30 segundos)
---------------------------------------
· Carpetas: ⋯ → Cargar música → ⌂ Carpeta → elige tu carpeta de música.
· Flotante real: ⋯ → «◱ Pantalla reducida flotante» (la 1ª vez Android pide
  permiso de superposición: actívalo y vuelve a intentar).
· Auto: reproduce algo, con Bluetooth conectado mira la pantalla del auto y
  prueba el botón «siguiente» del volante.
· Playlist: abre cualquier playlist → los 5 controles en una sola línea.
