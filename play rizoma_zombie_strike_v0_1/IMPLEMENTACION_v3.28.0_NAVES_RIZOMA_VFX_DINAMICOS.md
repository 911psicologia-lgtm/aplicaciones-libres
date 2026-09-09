# Rizoma Zombie Strike v3.28.0 — Naves Rizoma VFX Dinámicos

## Cambios
- Se conectan `ship_bank_left.png` y `ship_bank_right.png` a la movilidad lateral real del jugador.
- La inclinación visual se interpola suavemente y no modifica la hitbox.
- Se conectan las 4 animaciones `hit_01..04` de cada una de las seis Naves Rizoma.
- Cada especial propio usa ahora su VFX real del paquete:
  - Fénix RZ-1: Trident Beam.
  - Mantis RZ-4: Vector Cut.
  - Nébula RZ-8: Nebula Pulse.
  - Bastión RZ-12: Aegis Field.
  - Hydra RZ-16: Poly Volley.
  - Rizoma Prime RZ-20: Hyperlaser / Synaptic Chain / Defensive Nova según el ciclo.
- Los drones de Nébula usan sus sprites reales izquierdo/derecho y animación de motor.
- Se mantienen engine/fire/shield/special overlays previamente integrados.
- Se conserva el tamaño visual ampliado del jugador y la hitbox separada.
- No se alteran los 20 mundos ni la progresión.

## Objetivo
Que las Naves Rizoma tengan identidad cinética y visual en gameplay, no solo en Hangar.
