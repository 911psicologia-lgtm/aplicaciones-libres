# SWARM//RIFT v2.15.26 — Adaptive Hive Intervention Orchestrator

## Objetivo

Esta versión no añade una nueva fuente de daño ni una nueva contramedida pesada. Coordina las capas adaptativas ya implementadas para evitar saturación, solapamientos y respuestas redundantes. El principio rector es: **más coordinación, no más inflación**.

## Capas coordinadas

- Signature Priority Pilot.
- Tactical Identity Geometry.
- Arena Morphology.
- Counter-Evolution.
- Coevolution Microsequences.
- Legible Feint Branching.

Tactical Identity permanece como una capa sutil de locomoción/geometría. Las intervenciones perceptibles pasan por el Orchestrator.

## Presupuesto de saliencia

El Orchestrator usa un presupuesto intra-combate de 0–100 puntos.

- Inicio: 82.
- Recuperación: 5.5 puntos/s.
- Signature Priority: 22.
- Arena Morphology: 24.
- Counter Trial: 16.
- Learned Reuse: 13.
- Microsequence: 30.
- Feint Branch: 10.

El presupuesto se reinicia con cada boss. No se persiste como perfil del jugador.

## Ventanas de silencio

- Intervención menor: 0.8 s.
- Intervención mayor: 2.35 s.

Durante una ventana de silencio no puede comenzar otra intervención de alta saliencia. Una rama de Feint Branching puede desarrollarse dentro de la microsecuencia que ya fue autorizada; no se trata como un sistema externo adicional.

## Fatiga por repetición

Dentro de una ventana reciente de 14 s, una misma familia de intervención no puede encadenarse indefinidamente. El límite es 2 ocurrencias recientes antes de aplazar la siguiente. Esto reduce sensación de patrón mecánico y deja espacio para signatures y comportamiento base del boss.

## Focal intervention lock

Mientras Counter-Evolution mantiene una intervención activa:

- Arena Morphology se aplaza.
- Signature Priority se aplaza.

Así, la pelea conserva un foco táctico legible en vez de acumular capas adaptativas simultáneas.

## Sampling adaptativo al rendimiento

El Director ya no evalúa con la misma frecuencia bajo cualquier carga:

- FULL: 1.00 s.
- BALANCED: 1.15 s.
- RECOVERY: 1.35 s.

La frecuencia se deriva del Performance Governor ya existente. No modifica FPS ni velocidad de juego; solo reduce el costo de evaluación adaptativa cuando el dispositivo ya presenta presión de rendimiento.

## Lo que NO cambia

Esta versión no modifica:

- HP o maxHP del boss.
- daño base.
- cadencia.
- número de proyectiles.
- powers, ranks o upgrades.
- build del jugador.
- densidad global de combate.
- assets.

Reactive Armor, Symbiotic Assist, RIFT Disruption, RIFT Rebirth y extra soft gates continúan en Shadow Mode.

## Telemetría local schema 8

Se añade registro local de:

- presupuesto restante;
- intervenciones comprometidas;
- gasto por familia;
- denegaciones por quiet window, presupuesto o fatiga;
- últimas intervenciones;
- tier de rendimiento asociado.

No se envía telemetría a servidores externos.

## Debug

Nuevos/actualizados hooks:

- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_HIVE_DIRECTOR_REPORT()`
- `window.__SWARM_HIVE_DIRECTOR_SELFTEST()`
- `window.__SWARM_HIVE_ORCHESTRATOR_SELFTEST()`
- `window.__SWARM_V21526_STATUS()`

## Migración

- VERSION: 2.15.26.
- Meta y run keys nuevas con fallback explícito desde v2.15.25.
- Telemetría schema 8 con fallback desde `swarm_rift_hive_telemetry_v21525`.
- Cache PWA: `swarm-rift-v2.15.26`.
- Cache bust de `game.js` y `game.css`: `v=21526`.
