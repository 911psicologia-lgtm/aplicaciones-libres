# Adaptive Hive — Legible Feint Branching v2.15.25

## Propósito
Extender la coevolución de v2.15.24 sin inflar estadísticas. Una respuesta aprendida puede convertirse en una microsecuencia y, durante su apertura, presentar dos continuaciones plausibles. El jugador recibe información suficiente para reaccionar antes de que se fije una rama.

## Ciclo
`MICRO_SEQUENCE → WAIT → DUAL TELEGRAPH → REACTION SNAPSHOT → COMMIT → FIXED BRANCH → SEQUENCE CONTINUES`

## Reglas de justicia
- Solo mundos 11–20, fase 2+, campaign y confianza alta.
- Solo en respuestas previamente aprendidas.
- Máximo una bifurcación por fase.
- Telegraph dual de 0.90 s.
- Después del telegraph se toma una sola instantánea de reacción.
- La rama seleccionada queda fija; no sigue corrigiéndose según movimientos posteriores.
- Commit delay de 0.34 s antes de que la geometría comprometida tenga efecto.
- Decode grace de 0.42 s: la reacción al telegraph no cuenta inmediatamente como descifrado de la secuencia.
- Arena Morphology y Signature Priority continúan bloqueados mientras la microsecuencia está activa.
- Si posteriormente la secuencia completa es descifrada, siguen vigentes la mutación única y el abandono ya implementados.

## Qué modifica
Únicamente multiplicadores geométricos ya autorizados: anticipación acotada, offset X/Y, apertura y fase angular, sesgo de arena.

## Qué no modifica
HP, max HP, daño, cadencia, número de proyectiles, powers, ranks, upgrades, build, inventario ni guardado del jugador.

## Telemetría local
Schema 7 registra `BRANCH_REVEAL`, candidatos A/B, posiciones visuales, reacción observada, `BRANCH_COMMIT`, rama seleccionada, respuesta comprometida y uso por fase. No existe envío externo desde el Director.

## Debug
`window.__SWARM_HIVE_DIRECTOR_STATUS()` y `window.__SWARM_V21525_STATUS()` exponen estado, contadores y uso de bifurcaciones sin saturar el HUD.
