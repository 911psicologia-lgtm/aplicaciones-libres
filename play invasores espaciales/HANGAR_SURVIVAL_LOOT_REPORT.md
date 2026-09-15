# STARFALL FRONTIER v0.6.6 — Hangar, Survival, Loot & Boss Ally

## Base
Implementación incremental realizada sobre STARFALL FRONTIER v0.6.5 — REACTIVE MATRIX PHASE 2 FULL. No se reconstruyó el proyecto y no se sustituyeron assets visuales ni audio.

## Cambios principales
- Movimiento vertical liberado: la nave puede recorrer prácticamente todo el campo útil, no solo la zona inferior.
- Hangar rediseñado en formato compacto: menos texto, botones pequeños, estadísticas visuales y panel de mejoras permanente.
- Tienda ampliada: reparación, escudo, imán total, drones, misiles, cadena, overdrive, vida, resurrección, EMP y mejoras permanentes de casco, motores, armadura, cadencia, bahía de drones, tractor, duración y armas.
- Bahía de drones: el poder DRON activa 1 dron de base y hasta 4 con mejoras compradas.
- Supervivencia: 4 vidas de reinicio, máximo 9 vidas acumulables, drops de vida y una carga de RESURRECCIÓN automática comprable.
- Gemas: enemigos pueden soltar gemas físicas que se recogen al pasar por encima y se convierten en monedas.
- Power-ups: los drops usan prioritariamente los PNG runtime originales de cada mundo; el icono procedural queda solo como fallback.
- Imán total: recoge inmediatamente pickups/gemas ya presentes y deja una ventana breve de magnetismo global.
- Boss rewards: XP y monedas siguen otorgándose por economía; las reliquias/poderes del boss se heredan como antes.
- Boss Ally: el último jefe derrotado queda invocable durante 10 s, dispara un patrón aliado y entra en cooldown automático visible. Botón superior + tecla B.
- Boss balance: se conserva Fortaleza/Reboot/fases, pero se reduce el castigo al jugador mediante multiplicador de daño recibido, invulnerabilidad algo mayor, más supplies y más opciones defensivas.
- Corrección funcional: los power drops estaban aplicando el desplazamiento dos veces por frame; ahora se actualizan una sola vez.

## Filosofía
La dificultad del boss se mantiene por mecánicas, fases y defensas. La supervivencia del jugador aumenta por recursos, economía y decisiones tácticas, no eliminando la identidad del jefe.
