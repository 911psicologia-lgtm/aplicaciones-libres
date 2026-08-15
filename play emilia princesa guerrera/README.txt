EMILIA PRINCESA GUERRERA · REINOS CELESTIALES v2.0
==================================================

Esta versión reorganiza el juego en estructura multiarchivo y deja una base funcional.

ESTRUCTURA
- index.html                  -> punto de entrada
- css/style.css              -> estilos
- js/game.js                 -> lógica del juego
- assets/heroes              -> avatares principales
- assets/bosses              -> referencias de jefes
- assets/minions             -> biblias visuales de familias de esbirros
- assets/rewards             -> recompensas y premios
- assets/effects             -> portales, emblemas y efectos
- assets/docs                -> manifiesto de niveles y biblia visual

IMPLEMENTADO EN ESTA VERSIÓN
- Avatar principal Emilia enlazado como archivo externo.
- 30 mundos retematizados al universo celeste, nube, cristal, jardín, luna y cosmos.
- 30 jefes por nivel definidos a nivel de datos.
- 30 recompensas de nivel redefinidas en el nuevo estilo.
- Aliados y coleccionables retematizados con iconografía coherente.
- Empaquetado multiarchivo listo para seguir iterando.

NOTA
- El juego sigue siendo plenamente funcional.
- Los sheets PNG incluidos quedan listos como guía visual para una próxima fase de sustitución de sprites emoji por sprites individuales.

V2.1 SPRITES
- Reemplazo visual profundo: jefes y esbirros ahora se dibujan como PNG externos, no como emojis.
- Power-ups y premios cuentan con sprites recortados desde los asset sheets.
- Se agrega assets/docs/sprite_manifest.json para ubicar cada recurso.
