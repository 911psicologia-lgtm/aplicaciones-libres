# STARFALL FRONTIER v0.6.7 — Tactical Belt + Drone Command

## Base
Implementación incremental sobre v0.6.6 FULL. No se reconstruyó el proyecto.

## Implementado
1. Cinturón táctico compacto con Reparación, Escudo, Misiles, Drones, Imán y Vida. Clic/tap y teclas 1–6. Consume el mismo inventario persistente de la tienda.
2. Prevención de desperdicio: Reparación no se consume con casco completo y Vida no se consume al máximo.
3. Hangar efectivo: muestra casco, velocidad, daño, reducción, cadencia y número real de drones después de upgrades.
4. Drone Command: con bahía avanzada los drones interceptan proyectiles cercanos; la bahía máxima puede neutralizar dos por ventana. Duración base ampliada a 15 s.
5. Boss Ally Command: dos ráfagas signature por invocación, recarga visual en el botón y clocks protegidos frente a pausa.
6. Loot Readability: Vida, Imán, Dron y supplies especiales reciben una baliza visual, conservando sus assets originales.

## No modificado
Assets, audio, economía base, precios, perfil persistente, Reactive Matrix, Boss Fortress, Reboot, PWA y campaña W01–05.

## Validación
- 32/32 pruebas JavaScript PASS.
- Validación integral PASS.
- assets+audio SHA-256: 5cb8226fbc528eb670a41d8846a714538076c293c77af2c139cf81b78c189847
- economy.js SHA-256 (idéntico a v0.6.6 real): cbca517e6d3a5ddddad8693fc7920bea6f9083c75c1db7a1fba013f3031e28dd
