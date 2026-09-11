# STARFALL FRONTIER v0.6.1 — REACTIVE MATRIX · SHADOW MODE

## Base
Derivación directa de **v0.6.0 — ECONOMY + BOSS SUPPLY FULL**. No se reconstruyó el proyecto ni se sustituyeron assets.

## Reactive Boss Matrix
- PLAYER COMBAT POWER INDEX a partir de DPS teórico, DPS efectivo reciente, build, upgrades, powers, survivabilidad y desempeño.
- ESTIMATED TTK continuo basado en HP actual del boss / DPS efectivo.
- TTK estructural adicional para observación de Fortaleza, módulos y hardpoints.
- Estados: M0 SUPPORT, M1 NOMINAL, M2 OVERDRIVE y M3 DOMINANCE.
- Hysteresis de 1,8 s y cooldown de 3,5 s entre cambios.
- Ventanas objetivo por etapa: 45–75, 55–90, 70–110 y 90–130 s.

## Shadow Mode
- No modifica HP, daño, cadencia, economía, precios, inventario ni Boss Supply.
- No ejecuta System Jam.
- No ejecuta reboot adaptativo.
- No aplica mitigación adaptativa.
- Solo registra qué respuesta habría propuesto.

## Telemetría local
- Build, upgrades, poderes, DPS, power index, TTK estimado/real.
- Estado M0–M3 y transiciones.
- Boss Supply ofrecido/usado.
- Daño recibido, resurrección nativa, duración y resultado.
- Máximo 60 encuentros bajo `sf3_reactive_matrix_telemetry_v1`.

## HUD
Línea de diagnóstico durante boss: `REACTIVE MATRIX · SHADOW · Mx · DPS · TTK`.

## PWA
- `manifest.webmanifest` fullscreen.
- `sw.js` cachea solo shell ligero; no precarga los assets pesados.
- Registro solo bajo HTTP/HTTPS.

## Validación
- Sintaxis JS + Service Worker.
- Referencias de index, runtime assets y PWA.
- Suite completa histórica + nueva prueba Shadow Matrix.
- Integridad SHA-256 de assets/audio y economía frente a v0.6.0.
