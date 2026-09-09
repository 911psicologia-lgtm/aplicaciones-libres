# STARFALL FRONTIER v0.4.3 FULL — AUDIO INTEGRATION BUILD

Versión multiarchivo completa basada en v0.4.2, con los **20 mundos**, familias de enemigos, subjefes, jefes, spritesheets, patrones únicos y el nuevo paquete de **449 audios OGG** integrado.

## Estructura principal
- `index.html`
- `css/styles.css`
- `js/worlds.js`
- `js/audio.js`
- `js/game.js`
- `assets/` — assets visuales de los 20 mundos
- `assets/audio/` — paquete de audio completo
- `AUDIO_INTEGRATION_REPORT.md`
- `BOSS_SUBBOSS_PATTERNS.md`

## Audio integrado
- ambientes por los 20 mundos;
- ataques propios de los 6 roles de esbirros por familia;
- intro/ataque/muerte de 40 subjefes;
- intro, ataques, cambio de fase, muerte y resurrección de jefes;
- poderes, armas, escudos, motor, UI, stingers, obstáculos y explosiones;
- reliquias de jefe: liberación y adhesión a la nave.

## Rendimiento
El audio se carga por demanda y por mundo. Se usa limitación de polifonía y cooldowns de sonido para evitar saturación en formaciones densas y dispositivos móviles.

## Controles
- PC: WASD o flechas.
- Móvil/tablet: arrastre táctil.
- Disparo automático.
- Pausa desde HUD o Escape.
