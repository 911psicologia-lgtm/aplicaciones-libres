# Rizoma Zombie Strike v1.9.9 · Mundo 9 Anime–Manga Multiversal

## Alcance implementado

La v1.9.9 abre el Mundo 9 como territorio jugable completo sobre la base estable de v1.9.8. Se mantienen sin alterar los sistemas consolidados de los mundos 1–8, incluidos los Ecos añadidos en W7 y W8.

### Escenario y progresión
- Fondo de aproximación manga aprobado: `assets/world9/bg_world9_approach.jpg`.
- Arena de Kaiser aprobada: `assets/world9/bg_world9_boss.jpg`.
- Cinco actos largos con objetivos de 44, 60, 78, 96 y 116 eliminaciones.
- Atmósfera propia con líneas cinéticas, portales y ruptura visual de viñetas.

### Seis enemigos propios
- Shuriken Drone.
- Shuriken Fantasma.
- Fragmento Ronin.
- Ronin de Portal.
- Mecha Ronin.
- Coloso de Tinta.

Las tres familias tienen comportamiento, velocidad, resistencia, proyectiles y representación procedural diferenciada. Shuriken usa proyectil rotatorio; Ronin usa cuchillas; Mecha emplea orbes/portales perseguidores.

### Retorno de Guardianes
W9 exige derrotar cinco Ecos antes de cerrar sus actos:
1. Arconte Carmesí (M4).
2. Coloso del Vacío (M5).
3. Magnate Omega (M6).
4. Leviatán Abisal (M7).
5. Tardígrado Primigenio (M8).

Cada Eco conserva sprite canónico, mayor resistencia y familias de escolta. El avance del acto queda bloqueado hasta derrotar el Eco correspondiente.

### Subjefes
Desde el acto 2 aparece un subjefe propio por acto, derivado de la familia Mecha/Ronin y reforzado en vida, tamaño, disparo, puntuación y botín. Su aparición está integrada al director multiversal y queda persistida en guardado/carga.

### Horda Apocalíptica y Frenesí Asesino
- Horda Apocalíptica: 30 s, presión sostenida, hazards y refuerzos multiversales.
- Frenesí Asesino: 20 s, cadencia de aparición mucho mayor, perseguidores y portales agresivos.
- Mientras un combate especial sigue activo, el acto no puede cerrarse por simple conteo de eliminaciones.
- Ambos modos liberan reservas tácticas, escudo y premios al superarse.

### Hazards y director de eventos
- Meteoros violeta y energéticos.
- Fragmentos de cristal y basura espacial.
- Planetas errantes W9.
- Portales gravitacionales que generan unidades alrededor de su punto de ruptura.
- Hordas regulares propias y presión adaptada a escritorio/móvil.

### Kaiser Infinito
- Asset canónico: `assets/future/bosses/world9_kaiser_infinito.png`.
- Vida ampliada para soportar el arsenal acumulado.
- Escudo base 2600 y regeneración asociada a guardianes.
- Reconstitución de escudo por fase.
- Katana/cuchillas, shuriken, orbes de portal y Ruptura Multiverso.
- Portales y hazards adicionales durante fases superiores.

### Recompensa y persistencia
- Forma DOMINIO `bossShip9`: Hilos del Multiverso.
- Firma: Ruptura Multiverso.
- Reliquia: `world9Threads`.
- Bonificación adicional de finalización W9.
- `worldNineState`, Ecos, subjefes y combate especial se integran en guardar/cargar y reintento.
- Perfiles que ya tenían W8 completado en v1.9.8 desbloquean automáticamente W9 durante la migración.

### HUD
El HUD de W9 informa acto, eliminaciones, Ecos 0/5, aproximación al jefe y, cuando corresponde, el modo especial activo con segundos restantes.
