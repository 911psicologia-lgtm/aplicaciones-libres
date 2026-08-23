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
