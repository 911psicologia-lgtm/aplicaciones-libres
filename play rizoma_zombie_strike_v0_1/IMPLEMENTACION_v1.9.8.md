# Rizoma Zombie Strike · Implementación v1.9.8

## Mundo 7 · corrección visual

La lámina narrativa `assets/world7/bg_surface.jpg` queda fuera del renderer de gameplay. El combate inicia desde `assets/world7/bg_reef.jpg`, que corresponde a la caverna/meteorito aprobada. Los actos 1–3 usan esta caverna como base; los actos 4–5 profundizan con `bg_trench.jpg`; la fase final superpone `bg_boss.jpg` únicamente al acercarse al Leviatán o durante el duelo.

## Ecos de jefes

La v1.9.8 añade un sistema reutilizable `ECHO_BOSS_LIBRARY` + `WORLD_ECHO_SCHEDULE`. Los Ecos no son bosses finales y no cierran el mundo: bloquean el avance del acto hasta ser vencidos, conservan una fracción alta de la resistencia original, disparan ráfagas dirigidas y patrones radiales, y vuelven a convocar unidades de sus familias.

### Mundo 7

- Acto 3: Eco del Coloso del Vacío (M5), activación alrededor del 34% del objetivo del acto.
- Acto 4: Eco del Magnate Omega (M6), activación alrededor del 46%.

### Mundo 8

- Acto 2: Eco del Coloso del Vacío (M5), activación alrededor del 36%.
- Acto 3: Eco del Magnate Omega (M6), activación alrededor del 42%.
- Acto 4: Eco del Leviatán Abisal (M7), activación alrededor del 48%.

Los estados `echoSpawned` y `echoDefeated` se integran en los estados ya persistidos de W7/W8. Si se carga una partida con un Eco iniciado pero todavía no vencido, el director puede reconstruir el encuentro y evita un bloqueo de progresión.

## Balance

- Los ataques nucleares ya no borran Ecos de una sola vez.
- Las intervenciones críticas quedan limitadas por un cap específico para Ecos.
- En escritorio aparecen hasta dos miembros por familia al entrar el Eco; en móvil se reduce la densidad inicial para preservar legibilidad.
- El propio Eco vuelve a invocar su familia si la escolta ha caído.
- El recuento de bajas continúa durante el encuentro, pero la salida del acto permanece cerrada mientras el Eco obligatorio siga vivo.

## Preparación W9/W10

Se incorporan sin precarga runtime los fondos aprobados:

- `assets/world9/bg_world9_approach.jpg`
- `assets/world9/bg_world9_boss.jpg`
- `assets/world10/bg_world10_approach.jpg`
- `assets/world10/bg_world10_boss.jpg`

También queda definido `FUTURE_SPECIAL_COMBAT` con dos perfiles aislados: `apocalypse` (Horda Apocalíptica) y `frenzy` (Frenesí Asesino). Su conexión a spawns, seis familias W9, Kaiser Infinito, bossShip9 y la recombinación W10 se reserva para la siguiente implementación para no alterar la campaña W1–W8 en esta versión.
