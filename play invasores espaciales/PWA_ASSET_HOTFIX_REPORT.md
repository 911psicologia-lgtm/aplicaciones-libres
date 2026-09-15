# STARFALL FRONTIER v0.6.1.1 — PWA / ASSET DELIVERY HOTFIX

## Diagnóstico
Los assets NO se perdieron entre v0.6.0 y v0.6.1.

- v0.6.0: 273 archivos en `assets/`, ~130 MB; 451 archivos en `audio/`, ~17 MB.
- v0.6.1: 273 archivos en `assets/`, ~130 MB; 451 archivos en `audio/`, ~17 MB.
- El hash de árbol `assets/ + audio/` coincide entre ambas builds.

El problema observado en navegador corresponde a la capa PWA/Service Worker: el worker desplegado intenta cachear esquemas `chrome-extension://` y respuestas HTTP 206 (Range), operaciones no válidas para Cache Storage. Esto puede producir shell mezclado/stale y pantallas negras aunque los assets existan físicamente.

## Corrección
- Service Worker nuevo `starfall-shell-v0.6.1.1`.
- Ignora esquemas no HTTP(S), otros orígenes, audio/video y peticiones `Range`.
- Nunca hace `cache.put()` de respuestas 206, opaque o no-200.
- Shell JS/CSS usa network-first para evitar mezclar una build nueva con archivos viejos.
- Registro con `updateViaCache: 'none'` y migración del worker antiguo limitada al scope exacto de esta app.
- Se añadió diagnóstico de carga de assets base + mundo precargado en la pantalla de inicio: `ASSETS OK` o contador de fallos.

## Conservación
No se modifica la economía, Boss Supply, Reactive Matrix SHADOW, bosses, subbosses, assets realistas, audio, tienda, progresión ni balance.
