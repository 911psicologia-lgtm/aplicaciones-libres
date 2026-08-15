Aero · Fase 68.1 · Corrección pantalla blanca

Corrección aplicada:
- Se restauró la constante global floatingTexts, que quedó eliminada al agregar el sistema sceneTitleState.
- El error que aparecía en consola era:
  Uncaught ReferenceError: floatingTexts is not defined at loadLevel.
- Se actualizó también el index.html con JS/CSS embebidos para despliegue en Cloudflare.

Conserva todo lo implementado en Fase 68:
- Mundo 1 Premium.
- Mundo 2 Premium.
- HUD compacto.
- Lanza Aurora.
- Títulos breves de tramo.
- Límite derecho de mundo.
- Bonus Track y mundos 1 a 11.

Validación:
- js/main.js validado con node --check.
