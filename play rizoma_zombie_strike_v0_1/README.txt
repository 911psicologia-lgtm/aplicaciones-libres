Rizoma Zombie Strike v1.3.1 — flujo corregido, progresión por mundos y hangar retirado

Versión SAFE para Cloudflare Pages, sin archivo _headers.


Ajustes v1.1.0:
- Versión unificada en HTML, JavaScript, caché y recursos para evitar mezclas de archivos antiguos.
- Rayo continuo ajustado a 10 segundos de actividad.
- Menos saturación simultánea en el primer mundo, manteniendo aparición rápida y élites peligrosos desde la oleada 1.
- Aviso de jefe compacto con familia temática y mutación.
- Dock de poderes limitado a 6 visibles en escritorio y 4 en pantallas pequeñas; los adicionales se agrupan.
- Limpieza de inicializaciones duplicadas del estado de meteoros/primer mundo.

Cambios principales:
- Enemigos difíciles desde la oleada 1 con tasa alta real: 32% inicial, 42% oleada 2, 52% oleada 3, hasta 78%.
- Nuevos enemigos: Esquivo neural y Cazador kamikaze.
- Los enemigos elite esquivan balas con mayor anticipación, se mueven lateralmente, aceleran y resisten más.
- Cazadores kamikaze persiguen al jugador, hacen dash y explotan al contacto.
- Bombas caen desde arriba y explotan al tocar suelo.
- Planetas/objetos orbitales atraviesan la pantalla y deben esquivarse.
- Meteoritos y lluvia de meteoros aparecen más temprano y escalan por oleada.
- Jefes con más vida, más escudo y límite de daño por golpe más estricto.
- Muerte de jefe con explosión grande, sacudida, flash y anillos expansivos.
- Se reduce la lógica de “mensaje simple” al vencer jefe; la victoria se siente más cinematográfica.

Subida recomendada:
1. Descomprimir el ZIP.
2. Subir a Cloudflare Pages el contenido de la carpeta, no la carpeta contenedora.
3. La raíz debe contener index.html, css/, js/, assets/, manifest.json y sw.js.


Novedades v0.8.0:
- Mundo 1 extendido hasta sector/jefe 7 con escalado progresivo.
- Jefes del Mundo 1 más resistentes y con escudos reforzados.
- Fondos artísticos realistas con transición gradual entre órbita, estación y apocalipsis.
- Sprites integrados para meteoros, nave espejo y jefe biomecánico.
- Arsenal progresivo: se gana una nueva arma táctica en las recompensas del Mundo 1.


Novedades v0.9.0:
- Mundo 2 (Colonia alfa) ahora tiene introducción propia, oleadas más largas y jefe más resistente.
- Fondos del Mundo 2 con continuidad bacteriana: colonia, tubos de laboratorio, esporas y biofilm.
- Recompensas del Mundo 2 otorgan tecnología biológica y nuevas armas/controles.
- Escalado propio para enemigos tóxicos, niebla, divisores y núcleos.


Novedades v1.1.0:
- La campaña visible queda en 5 mundos por ahora.
- Se diferencia Mundo (campaña) de Nivel (progreso interno de cada mundo).
- Mundo 1 ahora avanza por conteo de eliminaciones y no da sensación de oleada eterna.
- Se redujo la saturación visual: menos premios visibles, premios más pequeños y con centro neón.
- Nuevos assets integrados para enemigos del Mundo 1 y fondo apocalíptico del jefe.
- El jefe del Mundo 1 ahora convoca familias de esbirros durante la batalla.


Novedades v1.1.0:
- Pulido del Mundo 1 con tres familias visuales de enemigos realistas.
- Jefe del Mundo 1 más grande, con esbirros desde el inicio de la arena.
- Distinción estable entre Mundo y Nivel.
- Poderes temporales acumulables, con conmutación entre triple y láser desde la barra inferior.
- Recompensa relicaria del jefe del Mundo 1 que persiste en el siguiente mundo.
- Meteoritos, lunas y planetas errantes realistas, destruibles y con puntaje.
- Menos saturación de pickups y obstáculos, con pickups de poder más visibles.


Novedades v1.3.1:
- Hangar evolutivo retirado del flujo jugable.
- Tienda de monedas queda temporalmente fuera de navegación; monedas y puntos siguen acumulándose para una decisión posterior.
- Derrota: Reintentar nivel conserva Mundo/Nivel; Inicio siempre vuelve al portal.
- Escudo temporal animado al iniciar/reintentar un mundo.
- Naves aliadas de entrada en mundos posteriores; heredan temporalmente Triple o Láser activo.
- Cada mundo superado mejora permanentemente potencia, velocidad y asistencia de puntería del disparo base.
- El jefe entrega un poder/reliquia persistente para el mundo siguiente.
