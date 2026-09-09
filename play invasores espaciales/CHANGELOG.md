# Changelog — v0.4.3 FULL

## Audio Pack Integration
- Integrados 449 OGG del paquete `STARFALL_FRONTIER_AUDIO_PACK_v1`.
- Añadido `js/audio.js` como gestor central de sonido.
- Ambientes únicos por mundo con loop.
- Sonidos de esbirros por familia y rol.
- Sonidos exclusivos de Subjefe A y B: intro, ataque y muerte.
- Jefes: intro, ataque primario/secundario/control, cambio de fase, muerte y resurrección selectiva.
- Reliquias: liberación del jefe + adhesión a la nave.
- Armas y poderes del jugador conectados a sus SFX reales.
- Escudo con activación, impacto y rotura diferenciados.
- Motor ligero/pesado según nave.
- UI, stingers, checkpoints, Game Over y victoria conectados.
- Obstáculos con sonidos de paso y destrucción.

## Rendimiento y estabilidad
- Carga diferida del audio.
- Precalentamiento únicamente del mundo activo.
- Límite de polifonía y cooldown por sonido.
- Pausa/reanudación sincronizada con ambiente y motor.
- Fallback silencioso en caso de archivo de audio no disponible.
