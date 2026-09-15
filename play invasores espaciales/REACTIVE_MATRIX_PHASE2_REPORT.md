# STARFALL FRONTIER v0.6.5 — REACTIVE MATRIX PHASE 2

## Base
Derivada exclusivamente de **v0.6.4 — DSEBI F4 FULL**. No se reconstruyó el proyecto y no se modificaron assets, audio ni economía.

## Objetivo
Pasar de observación pura a una primera intervención conservadora de Reactive Matrix, manteniendo la sensación de progresión del jugador.

## M0 · SUPPORT — ACTIVO
Cuando el jugador queda claramente por debajo del rango esperado, la Matrix puede generar hasta **2 suministros físicos** durante el encuentro. Deben recogerse: no se aplican automáticamente.

Prioridad contextual:
- casco comprometido → Repair / Shield;
- sin secundaria útil → Missile / Chain;
- movilidad baja → Overdrive;
- resto → Shield / Overdrive.

No consume monedas, no altera precios y no obliga a usar la tienda.

## M1 · NOMINAL
Sin intervención.

## M2 · OVERDRIVE — ACTIVO CONSERVADOR
Cuando el TTK proyectado cae claramente por debajo del rango objetivo:
- Reactive Armor deja pasar **88% del daño cerrado** (12% de mitigación);
- el núcleo abierto conserva el premio táctico y no recibe esta reducción;
- movilidad del boss +7%;
- la siguiente signature puede adelantarse de manera moderada;
- HUD y VFX anuncian la contramedida.

No aumenta HP máximo y no borra progreso del jugador.

## M3 · DOMINANCE — SIN ESCALADA AGRESIVA
M3 conserva únicamente el piso de M2. En esta fase **NO** se activan todavía:
- System Jam;
- Weapon Suppression;
- Signal Blackout;
- reboot adicional de Reactive Matrix.

El Reactor Reboot previo de STARFALL sigue existiendo como sistema independiente.

## Telemetría
El esquema pasa a `reactive_matrix_assist_v2` y registra:
- acciones reales de la Matrix;
- mitigación máxima aplicada;
- suministros Matrix generados;
- uso de esos suministros;
- transiciones M0–M3, DPS y TTK.

Los datos siguen siendo locales.

## No regresión
- economía sin cambios;
- assets + audio sin cambios;
- PWA actualizado a cache shell v0.6.5;
- Boss Fortress, Endurance, Reboot, Anatomy, Family Tactics, Mission Director, Micro-Swarm y DSEBI F4 preservados.
