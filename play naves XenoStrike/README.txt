SWARM//RIFT — Insecta Siege v1.0.0
===================================

Juego PWA HTML5 reconstruido como auto-shooter horizontal.

ARCHIVOS
- index.html
- css/game.css
- js/game.js
- manifest.json
- sw.js
- assets/icon.svg
- assets/logo.svg

CONTROLES
Móvil: horizontal obligatorio. Arrastra en la mitad izquierda para mover. Botón DASH a la derecha.
PC: mueve el mouse o el touchpad sin hacer clic para desplazar la nave. También puedes usar WASD/flechas. Espacio = dash. Escape = pausa.
El disparo y el autoapuntado son automáticos.

SISTEMAS
- 10 sectores y 10 familias insectoides.
- 3 hordas + jefe por sector.
- Barreras destruibles: capullos, quitina, esporas y resina.
- 11 poderes temporales simultáneos.
- Tienda permanente; abrir el carrito pausa la simulación.
- Guardado/carga de checkpoint con localStorage.
- Score, récord y créditos persistentes.
- Audio Web Audio sintetizado; firma sonora por jefe.
- PWA offline con orientación landscape.

PRUEBA LOCAL
Servir la carpeta mediante HTTP (por ejemplo: python -m http.server 8000) y abrirla en navegador.


ARTE 1.1.0
- Nave principal en vista trasera, separada como asset PNG.
- Atlas nuevo de enemigos biomecánicos: avispas, escarabajos, mantis, polillas, hormigas y langostas.
- Fondos ilustrados integrados: Rust Canyon Corridor, Toxic Ravine y Rift Tunnel / Debris Field.


REWORK 1.2.0
- Campaña reorganizada por 6 sectores con perfiles propios, estadísticas de amenaza y descripciones.
- Menú de selección con panel de vista previa, riesgos por sector y showcase de grunt/elite/boss.
- HUD nuevo con panel táctico derecho y barras ARM/SPD/RNG/THR.
- Obstáculos rediseñados por mundo: minas, torres, drones, vainas ácidas, compuertas, nidos, semillas y más.
- Patrones de jefes ampliados con invocaciones del mismo linaje.


BOSS EVOLUTION 1.4.0
- Cada uno de los 6 jefes tiene un ataque especial propio con anticipación visual/sonora.
- Las fases II y III modifican ritmo y agresividad.
- Frenesí por oleada/sector multiplica temporalmente XP y créditos.
- El Sector 1 conserva una curva de aprendizaje más amable.


Versión 1.5.0
Se añadieron assets dedicados para obstáculos y pickups, además de una facción secundaria de naves hostiles que aparece desde el Sector 3.


Versión 1.6.0
Assets realistas aprobados recortados e integrados. Enemigos insectoides separados en esbirrón/medio/mayor; jefes mantienen atlas propio. Desde Sector 3 aparece la facción Recuperadores con Scout, Frigate y Bomber y tácticas diferenciadas. Poderes y recursos utilizan pickups físicos específicos.


VERSIÓN 1.8.0 — GAMEPLAY REBUILD
Se añadieron entrenamiento, replay de sectores, checkpoint de jefe al 50%, amenazas frontales por perspectiva, mayor densidad, jefes reforzados y móviles, evolución de velocidad/precisión de la nave y una fase segura para recoger recompensas después de derrotar al jefe.


VERSIÓN 1.9.0 — BOSS & WEAPON VFX
- Segunda habilidad avanzada para cada uno de los seis jefes a partir de fases 2–3.
- Jefes con anatomía procedimental animada: alas, cuchillas, placas, patas, abdomen y halos según linaje.
- Transiciones de fase con onda de choque, partículas y sonido dedicado.
- Vida de jefes incrementada y cadencia de especiales más intensa.
- Disparo base evoluciona visualmente por nivel: aguja, pulso y spark-laser, con estela, núcleo y destello de boca.
- Impactos con chispas y sonido dinámico.
- VFX nuevos: shock, halo, slash, muzzle, orb, shieldwave y spark.


Versión 1.9.2
El combate utiliza rutas de entrada multidireccionales y formaciones. Los insectoides se renderizan desde 18 sprites aislados derivados de sus siluetas reales para impedir recortes por celdas de atlas.

Versión 1.9.3
Se incorporaron escoltas Scout/Lancer/Orbiter, amenazas frontales diferenciadas, Ráfaga y Bomba con assets propios y VFX de pickup/activación.

Versión 1.9.4
Los Sectores 4, 5 y 6 ahora tienen identidad visual propia, arenas de jefe separadas, obstáculos específicos y ambientación dinámica. El motor selecciona automáticamente la arena cuando inicia el jefe.


Versión 1.9.5
Añade rangos I–III de poderes por sector, Frenesí con objetivo/recompensa, valoración de oleadas y maestría de jefes en replay.


=== v2.0.0 — CAMPAÑA DE 10 SECTORES ===
- Sectores 7–10 integrados: Bloodmist Expanse, Resin Hive Citadel, Odonata Stormline y Resonance Cathedral.
- Cada sector nuevo posee fondo de recorrido y arena de jefe propios.
- Nuevas familias: Mosquitos, Termitas, Libélulas y Cigarras.
- 12 enemigos nuevos + 4 jefes con assets individuales.
- 16 obstáculos temáticos PNG.
- Poderes heredados: Drenaje Hemático, Muralla de Resina, Ráfaga Prismática y Pulso Resonante Ω.
- Mundo 10 mezcla de forma controlada enemigos de linajes anteriores.


=== v2.1.0 — BOSS ARENAS + ENDGAME ===
- Jefes 7–10 con peligros de arena propios y frecuencia por fase.
- Hordas 7–10 reequilibradas con mayor presencia de élites/mayores.
- Mundo 10 reduce la mezcla de linajes anteriores al 18%.
- Boss Rush desbloqueable tras derrotar los 10 jefes.
- Boss Rush: 10 jefes consecutivos, recuperación parcial entre arenas y dificultad creciente.
- Boss Rush no admite checkpoints.


=== v2.3.0 — BALANCE GLOBAL + ECONOMÍA + HUD MÓVIL ===
- Curva de dificultad recalibrada para 10 sectores: mayor presión y composición, menor dependencia de HP esponja.
- Jefes reforzados progresivamente por sector.
- Economía orientada a desempeño: Frenesí, rangos de oleada, amenazas frontales y maestría.
- Pendiente de costos del Hangar suavizada.
- Créditos cercanos se agrupan visualmente manteniendo su valor.
- HUD móvil reducido a una sola franja superior de iconos/estado.
- Eliminados avisos y colas inferiores redundantes en móvil.
- Partículas decorativas reducidas solo cuando la pantalla móvil está muy cargada; amenazas y proyectiles permanecen visibles.
