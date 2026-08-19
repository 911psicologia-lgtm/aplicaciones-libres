Rizoma Zombie Strike v1.6.1 — 5 vidas + Mundo 2: Colonia Alfa / Nexo biotecnológico

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


Novedades v1.4.1:
- Hangar evolutivo retirado del flujo jugable.
- Tienda de monedas queda temporalmente fuera de navegación; monedas y puntos siguen acumulándose para una decisión posterior.
- Derrota: Reintentar nivel conserva Mundo/Nivel; Inicio siempre vuelve al portal.
- Escudo temporal animado al iniciar/reintentar un mundo.
- Naves aliadas de entrada en mundos posteriores; heredan temporalmente Triple o Láser activo.
- Cada mundo superado mejora permanentemente potencia, velocidad y asistencia de puntería del disparo base.
- El jefe entrega un poder/reliquia persistente para el mundo siguiente.


Novedades v1.4.1 — Mundo 1 Director's Cut:
- Assets visuales optimizados a resolución de uso real; reducción fuerte de peso y memoria.
- Movimiento inicial más responsivo y movilidad progresiva al completar mundos.
- Mundo 1 dividido en cinco actos diferenciados.
- Acto V se supera derrotando tres capitanes familiares, no por bajas genéricas.
- Transición cinematográfica de 4,8 s hacia la arena apocalíptica del jefe.
- Presagio visual del jefe desde el Acto II.
- Microeventos ambientales: patrullas, corredor meteórico, emboscada y frontera rota.
- Poder principal único por nivel con núcleo luminoso; drops aleatorios reducidos.
- Experiencia del Mundo 1 mejora silenciosamente la nave base en lugar de mostrar cartas constantemente.
- Familias enemigas usan assets realistas de forma más consistente.


Novedades v1.4.1 — Boss Swarm:
- El Acto I ofrece inmediatamente un núcleo Triple garantizado durante 16 segundos y un dron de apoyo de entrada.
- Al alcanzar 12 eliminaciones aparece Perforación cinética durante 14 segundos.
- La secuencia de recompensas posteriores queda: Dron → Láser → Torpedos → Spark.
- El primer jefe aumenta su vida aproximadamente un 38% respecto a Director's Cut y su escudo pasa a 680.
- El jefe entra acompañado por seis esbirros: dos representantes de cada una de sus tres familias.
- Mientras existen esbirros, el jefe recibe protección dinámica y regenera gradualmente su escudo.
- Las oleadas de séquito aparecen con mayor frecuencia y pueden mantener hasta más unidades alrededor del jefe.
- Eliminar esbirros reduce directamente el escudo del jefe, carga la sobrecarga anti-jefe y, si se limpia el séquito, abre una ventana vulnerable ampliada.
- El HUD del jefe muestra la cantidad de protección activa para reforzar la lectura táctica.

Novedades v1.6.1:
- 5 vidas al iniciar cada mundo (1 activa + 4 reservas).
- Al perder las 5 vidas se puede comprar 1 vida con monedas, puntos o experiencia.
- Escudo temporal de entrada reforzado y visible; se recarga al comenzar cada nivel.
- Poder heredado del jefe del Mundo 1: Núcleo Meteórico, activo en Mundo 2 con impactos automáticos cada 18 s.
- Mundo 2 reconstruido en 5 actos: Cuarentena exterior, Nebulosa tóxica, Anillos fragmentados, Estación abisal y Nexo de convergencia.
- Tres familias nuevas de 5 esbirros cada una: Vorácidos, Errantes del Vacío y Devoradores de Metal.
- Nuevo jefe del Mundo 2 con asset realista, escudo y protección basada en esbirros.
- Nuevos poderes del Mundo 2: Rayo de vacío, Minas gravíticas, Pulso disruptor, Escuadrón fantasma y Tornado de plasma.
- Nuevos fondos y atmósfera visual del Mundo 2, con arena final diferenciada.
- Sonidos procedurales propios para disparos, pulsos y entrada del jefe del Mundo 2.
- Guardado ampliado para estado del Mundo 2, vidas y temporizadores heredados.


Novedades v1.5.4:
- Esbirros del Mundo 2 recortados y reescalados para igualar la presencia visual del Mundo 1.
- Chatarra espacial y meteoritos visibles desde los primeros actos del Mundo 2.
- Planetas errantes y tormentas orbitales aumentan hacia la antesala y el jefe.
- Nuevo Archivo de misiones: permite repetir niveles ya superados sin reemplazar la partida principal.
- Las repeticiones conservan score, monedas y experiencia, pero no duplican el poder único del jefe.


Novedades v1.6.1:
- Mundo 2 recibe una cadencia mayor pero controlada de premios tácticos.
- Nuevo Impulsor vectorial: +48% movilidad durante 10 segundos.
- Nuevo Ralentizador temporal: reduce movimiento enemigo y proyectiles hostiles durante 10 segundos.
- Nueva Nave auxiliar: dura 12 segundos; pueden coexistir máximo 2. Heredan temporalmente el disparo de la nave principal.
- Los premios tácticos aparecen dentro de círculos luminosos, pulsantes y con icono/etiqueta visible.
- Mayor probabilidad de shield y reparación cuando la nave está dañada.
- Mundo 2 inicia además con un Impulsor visible, junto al Rayo de vacío y el shield.
- Los eventos del Mundo 2 pueden dejar premios adicionales sin saturar la pantalla.


Novedades v1.6.1:
- Indicador permanente 👑 JEFE XX% en el HUD.
- Mundo 2 Nivel 5 deja de generar una horda infinita: tres prefectos secuenciales abren directamente al Patriarca Bacilo Omega.
- Prefectos mucho más visibles, grandes, marcados y acompañados por dos esbirros de su familia.
- Fail-safe para garantizar la aparición del siguiente prefecto y del jefe.
- Nivel 2 alterna cuatro formaciones enemigas y evita repetir continuamente el mismo esbirro.
