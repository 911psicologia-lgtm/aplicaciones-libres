# HAPPY Android · Reproductor Flotante Real (CAPA B)

Wrapper **mínimo** que reutiliza la PWA HAPPY tal cual. La app web sigue siendo
el núcleo y el **único reproductor**; esta capa solo añade las capacidades del
sistema que un navegador/PWA no puede proporcionar.

## Qué añade esta capa (y nada más)

| Capacidad | Implementación |
|---|---|
| Reproductor sobre otras apps | `FloatingPlayerService` + `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY` (compacto/expandido, arrastrable, snap a bordes, posición recordada) |
| Audio en segundo plano | Foreground Service `mediaPlayback` + WebView con `setMediaPlaybackRequiresUserGesture(false)` + wake lock parcial |
| Notificación multimedia | `MediaSessionCompat` + notificación `MediaStyle` (portada, título, artista, ⏮ ▶/⏸ ⏭) |
| Picture-in-Picture | `MainActivity.enterNativePip()` (Android 8+) cuando la fuente es video |
| Permiso overlay | Flujo exclusivo al pulsar ▣ FLOTANTE: `Settings.canDrawOverlays()` → `ACTION_MANAGE_OVERLAY_PERMISSION`. Si se niega: REINTENTAR / SEGUIR EN HAPPY sin romper nada |
| Un solo estado de reproducción | `PlaybackBus`: la web publica el estado (`floatbridge.js`), el overlay/MediaSession/notificación solo lo **reflejan** y devuelven comandos. Nunca hay dos motores de audio |

## Requisitos

- Android Studio (Hedgehog o superior) o solo SDK + Gradle 8.x
- compileSdk 34 · minSdk 26 (el overlay requiere Android 8+)

## Compilación (3 pasos)

1. Abre la carpeta `android/` en Android Studio (o `cd android && gradle assembleDebug`).
2. Configura la URL de tu despliegue en
   `app/src/main/java/com/happy/musicplay/MainActivity.java` → constante `DEFAULT_URL`.
   (Alternativa: copia la PWA compilada dentro de `app/src/main/assets/www/`
   y la app la cargará localmente sin cambiar nada.)
3. `Run ▸ app` en tu teléfono. El APK queda en `app/build/outputs/apk/debug/`.

## Protocolo del puente (resumen)

```
web → nativo (window.HappyNative.postFromWeb(JSON)):
  {type:'web/hello', version, build}
  {type:'state', track:{title,artist,album,source,duration,currentTime,isPlaying,podcast}, artwork}
  {type:'floating/start'}            ← pulsación de ▣ FLOTANTE
  {type:'floating/stop'}
  {type:'pip/request'}

nativo → web (window.MpNativeBridge.fromNative(JSON)):
  {type:'native/hello', capabilities:{overlay,pip,service}}
  {type:'floating/started'|'floating/stopped'}
  {type:'floating/permission', granted:bool, pending:bool}
  {type:'media/play'|'media/pause'|'media/toggle'|'media/next'|'media/prev'|'media/stop'}
  {type:'media/seek', position:segundos}
  {type:'pip/result', active:bool, error?}
```

Comandos de audio: la capa nativa **nunca** toca archivos ni streams; envía
`media/*` al WebView y la web ejecuta con su motor existente.

## Notas de diseño

- **X (✕) del flotante** cierra SOLO la ventana: el audio continúa y la
  notificación multimedia queda disponible (pantalla bloqueada / sistema).
- El servicio se retira automáticamente si la web reporta `track:null` estable.
- **No se piden** cámara, ubicación ni contactos. `POST_NOTIFICATIONS` solo se
  solicita junto al flujo de flotante (necesaria para la notificación media).
- La rotación no destruye la reproducción (`configChanges` completa en manifest).
