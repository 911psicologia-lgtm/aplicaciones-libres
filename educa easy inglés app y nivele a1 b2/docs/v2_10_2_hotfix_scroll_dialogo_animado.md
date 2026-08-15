# v2.10.2 · Hotfix real del auto-scroll en 🎬 Diálogo animado

## Problema corregido
La versión anterior buscaba clases genéricas y no siempre conectaba con el contenedor real del módulo 🎬 Diálogo animado.

## Corrección real
- El auto-scroll ahora apunta al contenedor correcto: `.adm-chat`.
- La línea activa real se detecta como `.adm-bubble.active`.
- Después de abrir modal, Play, Siguiente, Anterior y Repetir se ejecuta `afterDialogueLineRenderScroll()`.
- Se usa scroll matemático dentro del contenedor, no `window`.
- Se agregó padding inferior real para evitar que la línea quede detrás de `.adm-controls`.
- `.adm-controls` queda sticky y con fondo sólido.

## Validación
- JS validado con node --check.
- CSS preservativo.
- No se tocó audio, EN–ES, progreso, localStorage ni contenido.
