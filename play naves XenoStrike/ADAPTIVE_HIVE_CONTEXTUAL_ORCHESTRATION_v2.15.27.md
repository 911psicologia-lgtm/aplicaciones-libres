# SWARM//RIFT v2.15.27 — Adaptive Hive Contextual Orchestration

## Objetivo

v2.15.27 evoluciona el Intervention Orchestrator de v2.15.26 sin añadir una nueva capa de daño. El cambio central es pasar de “hay presupuesto, puede intervenir” a “la intervención debe ser pertinente, legible y compatible con la fase, el rendimiento y la atención del jugador”.

## 1. Context Utility Gate

Cada intervención perceptible obtiene una utilidad contextual normalizada 0–1 a partir de señales ya existentes del motor:

- estado A0/A1/A2/A3;
- confianza del Director;
- fase del boss;
- riesgo y cobertura de experiencia;
- deuda de signature;
- confianza espacial;
- repetición táctica observada;
- memoria aprendida de Counter-Evolution;
- existencia de una microsecuencia activa para Feint Branching.

Umbral normal: 0.50. Intervención mayor: 0.58. Si no supera el umbral se aplaza como `low_context_utility` incluso si sobra presupuesto de saliencia.

## 2. Phase Attention Budget

El Orchestrator limita la cantidad de intervenciones perceptibles por fase:

- máximo 5 intervenciones totales por fase;
- máximo 2 intervenciones mayores por fase;
- límites propios por familia: Signature 1, Arena 2, Counter Trial 2, Learned Reuse 2, Micro Sequence 1, Feint Branch 1.

Esto evita acumulación correcta “en papel” pero saturante en percepción.

## 3. Cooldowns por familia

Además del quiet window global y la fatiga histórica, cada familia posee cooldown independiente. Una intervención no puede reaparecer solo porque otra familia consumió el silencio global.

## 4. Graceful Performance Degradation

El Director coopera con Performance Governor:

- FULL: muestreo 1.00 s, coste 1.00x, recuperación 1.00x;
- BALANCED: muestreo 1.18 s, coste 1.08x, recuperación 0.90x;
- RECOVERY: muestreo 1.45 s, coste 1.18x, recuperación 0.72x.

En RECOVERY se aplazan primero `ARENA_MORPHOLOGY` y `FEINT_BRANCH`, las capas perceptibles con mayor componente visual. Tactical Identity y la lógica geométrica esencial continúan activas.

## 5. Recovery Ecology

Cuando el Director está en A1, la recuperación del presupuesto aumenta 25 %. A1 no interviene; el tiempo saludable del combate funciona como recuperación de atención, no como oportunidad para acumular presión.

## 6. Qué permanece sin activar

Continúan en Shadow Mode:

- Reactive Armor;
- Symbiotic Assist;
- RIFT Disruption;
- RIFT Rebirth;
- extra soft gates.

v2.15.27 no aumenta HP, daño, cadencia, densidad de proyectiles ni modifica la build.

## 7. Telemetría local schema 9

El snapshot del Orchestrator registra además:

- utilidad de la última intervención por familia;
- conteo por fase y tipo;
- total de intervenciones por fase;
- total de intervenciones mayores por fase;
- aplazamientos por Performance Recovery;
- denegaciones por baja utilidad contextual;
- tier de rendimiento al comprometer una intervención.

La telemetría continúa exclusivamente en `localStorage` y limitada a las últimas 40 peleas.

## 8. Hooks

- `window.__SWARM_HIVE_ORCHESTRATOR_SELFTEST()`
- `window.__SWARM_HIVE_CONTEXTUAL_ORCHESTRATOR_SELFTEST()`
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_HIVE_DIRECTOR_REPORT()`
- `window.__SWARM_V21527_STATUS()`
