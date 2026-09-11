# STARFALL FRONTIER v0.5.3 — SHIP EVOLUTION REPORT

## Implementación
La nave del jugador ahora cambia visualmente conforme acumula reliquias de jefes. La transformación se superpone al sprite original y no reemplaza Vanguard, Warden ni Specter.

## Umbrales
- 2 reliquias: estabilizadores laterales.
- 5 reliquias: pods de armamento y propulsión reforzada.
- 8 reliquias: emisor dorsal con halo energético.
- 12 reliquias: nodos auxiliares compactos adheridos al chasis.

## Integración
- `evolutionSummary()` muestra también el nivel de chasis.
- La longitud/energía visual de los motores escala con la evolución.
- No se añadieron sonidos nuevos.
- No se modificó el balance de daño: la evolución visual refleja los bonus permanentes ya existentes.

## Regresión
Se ejecutó la suite completa existente más `ship-evolution-v053.js`; todas las pruebas terminaron en PASS.
