# Adaptive Hive Boss Director — Tactical Identity Pilot v2.15.21

Esta versión añade una capa de adaptación espacial deliberadamente pequeña sobre el **Predictive Pilot v2.15.20**. El objetivo no es elevar artificialmente la dificultad, sino hacer que la identidad de movimiento y disparo de cada boss responda a la forma concreta en que el jugador ocupa la arena.

## 1. Lectura espacial

Durante una pelea de boss el Director toma muestras locales cada ~0.20 s. Acumula posición vertical, distancia recorrida, cambios de sentido, permanencia en bordes y permanencia central. Con estas señales clasifica el patrón actual del jugador como `EDGE_ANCHOR`, `VERTICAL_WEAVE`, `CENTER_HOLD`, `LANE_ANCHOR`, `EVASIVE`, `MOBILE_MIX` o `READING` mientras aún no existe evidencia suficiente.

La lectura es **session-only** para la pelea. No crea un perfil personal persistente. La telemetría final conserva únicamente el resumen técnico de la pelea dentro del límite local ya existente.

## 2. Activación

El Tactical Identity Pilot puede activarse únicamente cuando coinciden:

- campaign;
- Mundo 11–20;
- Fase II o III;
- estado A2 o A3;
- confianza del Director >= 0.68;
- confianza espacial >= 0.46;
- fingerprint distinto de `BURST_SPIKE`;
- ausencia de fairness hold, telegraph, special, charge o signature en curso.

La adaptación trabaja por segmentos de 4.5–7.0 s. Después de dos segmentos activos debe existir una ventana neutral de 3.0–4.8 s. Esto evita una persecución algorítmica continua.

## 3. Qué puede modificar

Solo puede redistribuir geometría ya existente:

- lead angular acotado a ±0.115 rad;
- sesgo vertical acotado a 7.5% del alto de la arena;
- sesgo horizontal acotado a 3.5% del ancho;
- spread de fan dentro de 0.82–1.22 del spread original;
- fase angular de anillos;
- centro o trayectoria de la locomoción individual del boss.

No cambia daño, HP, cadencia, número de proyectiles, ranks, powers ni recursos del jugador.

## 4. Identidad por boss

| Mundo | Boss | Respuesta táctica |
|---|---|---|
| 11 | SCARAB IMPERATOR | `ORBIT_TILT` |
| 12 | VESPERA LANCER | `VECTOR_INTERCEPT` |
| 13 | REGENT MANDIBLE | `PINCER_TRACK` |
| 14 | PYROLUX BEACON | `FIGURE_EIGHT_PHASE` |
| 15 | CAUSTIC ALCHEMIST | `DISTILLERY_CROSSWIND` |
| 16 | ATLAS VEIL | `VEIL_OFFSET` |
| 17 | MIRAGE PHASMID | `MIRROR_OPPOSITION` |
| 18 | PIT EMPEROR | `AMBUSH_OFFSET` |
| 19 | AURICULUS RAZOR | `TAIL_LEAD` |
| 20 | APIS IMPERIA | `ROYAL_PRESSURE` |

Cada respuesta conserva la trayectoria base del boss y aplica un desplazamiento proporcional, no un reemplazo de su gramática.

## 5. Signatures

Cuando una signature CH2 nace durante un segmento táctico, puede usar una posición Y predicha y suavizada para fijar su geometría inicial. Esa geometría queda **congelada al comienzo de la signature**. El jugador ve el telegraph completo de la geometría que realmente se ejecutará. No existe seguimiento invisible después del wind-up.

## 6. Convivencia con Predictive Pilot

Se mantienen sin cambios:

- DPS 3/8/20 s;
- fingerprints de daño;
- confidence gate;
- memoria local histórica limitada a ±12%;
- Experience Debt;
- planner contrafactual;
- Signature Priority Pilot.

Armadura reactiva, asistencia A0 activa, RIFT DISRUPTION, RIFT REBIRTH y soft gates adicionales continúan en Shadow.

## 7. Debug

`window.__SWARM_HIVE_DIRECTOR_STATUS()` muestra `spatial` y `tacticalIdentityPilot`.

`window.__SWARM_HIVE_DIRECTOR_REPORT()` incluye lectura espacial, segmentos tácticos, eventos, fingerprints, fases, signatures y propuestas Shadow.

`window.__SWARM_V21521_STATUS()` resume el contrato completo de la versión.
