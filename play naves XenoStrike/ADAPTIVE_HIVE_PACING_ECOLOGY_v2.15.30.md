# SWARM//RIFT v2.15.30 — Adaptive Hive Pacing Ecology

## Objetivo

Esta versión continúa la línea Adaptive Hive sin añadir una nueva capa ofensiva. El objetivo es mejorar **cuándo** se permite una intervención perceptible y cuánto trabajo interno necesita el Orchestrator para sostener esa decisión.

## 1. Duration-aware Phase Headroom

Antes de autorizar una intervención, el Orchestrator compara el tiempo estimado hasta la siguiente fase con la duración reservada de esa intervención más un margen de seguridad de 0,55 s.

Ejemplo: una `MICRO_SEQUENCE` reserva 8,0 s. Si la fase tiene aproximadamente 5 s restantes, ya no se inicia aunque el antiguo `EXIT_RISK` todavía no hubiese entrado en su ventana de 3,2 s.

`SIGNATURE_PRIORITY` conserva una excepción intencional porque una signature pendiente puede ser necesaria precisamente antes de la transición. `FEINT_BRANCH` conserva su excepción cuando está anidado dentro de una `MICRO_SEQUENCE` ya autorizada.

## 2. Predictive Family Fatigue

La v2.15.29 bloqueaba una familia cuando la fatiga actual alcanzaba su umbral. v2.15.30 también calcula la **fatiga proyectada después de la intervención**. Si el commit llevaría una familia por encima de 0,94, la intervención se aplaza antes de saturar esa familia.

Esto no cambia ataques, daño ni estadísticas; solamente evita secuencias perceptivamente redundantes.

## 3. Dynamic Rhythm Spacing

Existe ahora una separación mínima entre intervenciones perceptibles según el ritmo de fase:

- ENTRY: 1,55 s
- BUILD: 1,05 s
- CLIMAX: 0,82 s
- EXIT_RISK: 1,35 s

El intervalo aumenta con la presión adaptativa acumulada y también en `BALANCED` / `RECOVERY`. El objetivo es que los momentos intensos respiren más cuando el sistema o el jugador ya están bajo mayor carga.

## 4. Batched Orchestrator Maintenance

El mantenimiento interno de presión, fatiga, presupuesto, reservas y colas ya no filtra/actualiza estructuras en cada frame. Acumula `dt` y ejecuta mantenimiento aproximadamente cada 0,10 s (10 Hz), conservando la cantidad total de recuperación/decay mediante el tiempo acumulado.

La detección de cambio de fase sigue ocurriendo inmediatamente antes del batching para no retrasar la limpieza de reservas ni la ventana de respiración.

## 5. Telemetría y diagnóstico

Schema de telemetría: **12**.

Nuevas métricas del Orchestrator:

- `headroomDenials`
- `forecastFatigueDenials`
- `rhythmSpacingDenials`
- `maintenancePasses`
- `maintenancePending`
- `sinceLastCommit`
- `headroom`, `fatigueForecast` y `spacing` en eventos de commit

Nuevo hook:

`window.__SWARM_HIVE_PACING_ECOLOGY_SELFTEST()`

Estado de versión:

`window.__SWARM_V21530_STATUS()`

## 6. Garantías de alcance

Esta versión NO activa:

- Reactive Armor
- Symbiotic Assist
- RIFT Disruption
- RIFT Rebirth
- extra soft gates

Y NO introduce aumentos de:

- HP / maxHP del boss
- daño base
- cadencia
- proyectiles
- powers / ranks / upgrades
- mutaciones permanentes de build

La evolución es de **pacing, coordinación y eficiencia**, no de inflación estadística.
