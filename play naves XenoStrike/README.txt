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
PC: WASD/flechas o arrastre del mouse. Espacio = dash. Escape = pausa.
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
