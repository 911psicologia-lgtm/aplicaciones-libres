# STARFALL FRONTIER v0.5.1 — Asteroid Director

## Objetivo
Refinar la presencia de rocas espaciales para que funcionen como obstáculos naturales y legibles, sin reutilizar cuerpos, fragmentos o piezas de enemigos.

## Implementado
- Render de obstáculos limitado a `assets/obstacles/meteor_defender_a/b/c.png`.
- Dos escalas: meteoros medianos y grandes.
- Banda vertical más baja del campo de combate.
- Tres comportamientos: estático, cruce lateral y diagonal moderado.
- Los meteoros móviles atraviesan una vez y abandonan la pantalla; no rebotan indefinidamente.
- Rotación axial más lenta y natural.
- Estela visual muy tenue para distinguir rocas en tránsito.
- Tinte ambiental sutil por sector, manteniendo la textura rocosa original.
- En jefe, al menos una roca defensora queda estable.
- Siguen siendo destruibles por jugador y disparos enemigos.

## Validación
Se ejecutaron todos los tests incluidos en la build y pasaron correctamente, incluyendo:
- responsive;
- runtime;
- transición y watchdog de jefe;
- ecología enemiga;
- Boss Fortress;
- audio silencioso salvo armamento del jugador;
- assets W01–05;
- nuevo test `asteroid-director-v051.js`.
