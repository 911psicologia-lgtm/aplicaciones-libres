# Mobile Fix · v1.9.6

La aplicación instalada como PWA ya no depende de que Android o el launcher acepte una orientación forzada.

Cambios:

- `manifest.json` utiliza `orientation: any`.
- El aviso de orientación horizontal es informativo y no bloquea botones ni navegación.
- Se eliminó el estado corporal `orientation-required` como mecanismo de bloqueo.
- La aplicación puede continuar en vertical y reorganizarse cuando el dispositivo cambie físicamente a horizontal.
- Se actualizan viewport y canvas después de `orientationchange` y `resize`.
- Manifest, CSS y JavaScript reciben claves de versión v1.9.6 para reducir el riesgo de recursos antiguos en navegador/PWA.

Resultado esperado: si un teléfono abre la PWA en vertical y el sistema no rota automáticamente, el usuario puede continuar normalmente. Al girar después, el canvas se recalcula sin detener la aplicación.
