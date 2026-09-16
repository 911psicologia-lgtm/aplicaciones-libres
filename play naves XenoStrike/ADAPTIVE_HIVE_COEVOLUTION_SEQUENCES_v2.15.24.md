# Adaptive Hive Coevolution Sequences — v2.15.24

## Objetivo
Transformar una contrarespuesta que ya demostró eficacia en una microsecuencia táctica legible, breve y reversible. La Colmena no recibe más HP, daño, cadencia ni proyectiles; compone temporalmente geometrías ya existentes.

## Flujo
1. Counter-Evolution observa una táctica repetida.
2. Ensaya una respuesta y la mide.
3. Si la respuesta funciona, queda aprendida dentro de esa pelea.
4. En una reutilización posterior, y solo si se cumplen los límites de confianza/fase, puede convertirse en una microsecuencia.
5. La secuencia se organiza en `OPEN → PRESS → CLOSE`.
6. Si el jugador cambia de táctica o recupera presión ofensiva durante dos lecturas consecutivas, se considera que está descifrando la secuencia.
7. Primer descifrado: una sola mutación del cierre con una respuesta alternativa.
8. Segundo descifrado: abandono inmediato y retiro de esa secuencia para la táctica durante la pelea.

## Identidades
- KHEPRI: ORBITAL_TRIAD
- VESPERA: LANCER_CADENCE
- REGENT: MANDIBLE_TRIPTYCH
- PYROLUX: BEACON_PULSE_CHAIN
- CAUSTIC: DISTILLATION_CYCLE
- ATLAS: VEIL_PARALLAX_CHAIN
- MIRAGE: PHASMID_DECEPTION_CHAIN
- PIT: AMBUSH_THREE_BEAT
- AURICULUS: PRISMATIC_TAIL_CHAIN
- APIS: ROYAL_COMMAND_CHAIN

## Límites
- Mundos 11–20.
- Fase 2 o superior.
- Confianza del Director ≥ 0.78.
- Solo sobre una respuesta ya aprendida.
- Máximo 1 microsecuencia por fase.
- 2 lecturas de descifrado para mutar/abandonar.
- 1 mutación máxima por secuencia.
- Cooldown posterior: 8 s.
- No inicia con Arena Morphology pendiente ni signature/telegraph/charge activos.
- Arena Morphology queda bloqueado mientras la microsecuencia está activa.
- Signature Priority Pilot no programa una nueva signature sobre una microsecuencia activa.

## Estadísticas que NO modifica
- boss HP / maxHp;
- daño;
- cadencia;
- número de proyectiles;
- HP/powers/ranks/upgrades del jugador.

## Telemetría local schema 6
Registra secuencias iniciadas, completadas, mutadas, abandonadas, uso por fase, pasos ejecutados y eventos de mutación/abandono. La memoria operativa no se transfiere a la siguiente batalla.

## Debug
- `window.__SWARM_HIVE_DIRECTOR_STATUS()`
- `window.__SWARM_HIVE_DIRECTOR_REPORT()`
- `window.__SWARM_HIVE_DIRECTOR_SELFTEST()`
- `window.__SWARM_V21524_STATUS()`
