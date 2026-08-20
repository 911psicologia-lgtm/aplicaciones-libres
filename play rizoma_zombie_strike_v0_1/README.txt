Rizoma Zombie Strike v1.7.5 — HUD vidas visible

Rizoma Zombie Strike v1.7.4 — Flujo, velocidad y soporte táctico

Novedades v1.7.4:
- Vigilancia anti-bloqueo de progreso: si el contador se estanca, se reinsertan objetivos accesibles.
- Enemigos que salen demasiado lejos del lienzo se reciclan dentro del área útil y dejan de bloquear el spawn.
- Velocidad nominal permanente de la nave; reactivación restaura la movilidad real y añade 12 s de impulso de recuperación.
- Recuperación conserva poderes activos, en cola y poderes recientes; mínimo de apoyo útil por mundo.
- Poderes de recuperación, hordas y compras son manuales: ya no convergen/activan todos automáticamente.
- Bomba, Impulsor y Ralentizador de hordas aparecen en posiciones tácticas aleatorias del lienzo.
- Impulsor y Ralentizador garantizados también en Mundos 1 y 2 mediante soporte periódico.
- Aumento moderado de frecuencia de poderes, shield y reparación.
- Refuerzos blandos cuando el avance supera ~78 % y no hay eliminaciones durante varios segundos.

Rizoma Zombie Strike v1.7.1 — 5 vidas + Mundo 2: Colonia Alfa / Nexo biotecnológico

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

Novedades v1.6.2:
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


Novedades v1.6.2:
- Mundo 2 recibe una cadencia mayor pero controlada de premios tácticos.
- Nuevo Impulsor vectorial: +48% movilidad durante 10 segundos.
- Nuevo Ralentizador temporal: reduce movimiento enemigo y proyectiles hostiles durante 10 segundos.
- Nueva Nave auxiliar: dura 12 segundos; pueden coexistir máximo 2. Heredan temporalmente el disparo de la nave principal.
- Los premios tácticos aparecen dentro de círculos luminosos, pulsantes y con icono/etiqueta visible.
- Mayor probabilidad de shield y reparación cuando la nave está dañada.
- Mundo 2 inicia además con un Impulsor visible, junto al Rayo de vacío y el shield.
- Los eventos del Mundo 2 pueden dejar premios adicionales sin saturar la pantalla.


Novedades v1.6.2:
- Indicador permanente 👑 JEFE XX% en el HUD.
- Mundo 2 Nivel 5 deja de generar una horda infinita: tres prefectos secuenciales abren directamente al Patriarca Bacilo Omega.
- Prefectos mucho más visibles, grandes, marcados y acompañados por dos esbirros de su familia.
- Fail-safe para garantizar la aparición del siguiente prefecto y del jefe.
- Nivel 2 alterna cuatro formaciones enemigas y evita repetir continuamente el mismo esbirro.


Novedades v1.6.2:
- Mundo 3 Corredor Viridiano implementado con fondo híbrido y 60-100 estrellas procedurales en 3 planos.
- 3 familias de 5 esbirros verdes, jefe Soberano de la Energía Tóxica y peligros propios.
- Hordas en V de 3, 6 y 9 con aceleración visual y premios adicionales.
- Nuevos poderes: Cadena voltaica, Sobrecarga del reactor, Fase espectral, Nanorreparación e Imán gravitacional.
- Poderes temporales mejoran levemente por cada mundo superado; arma base mantiene el aumento principal.
- Armas principales incompatibles entran en cola automática en vez de desperdiciarse.
- Combos solo se activan cuando los poderes requeridos conviven simultáneamente.
- Al derrotar un jefe, el juego espera a que se recoja todo el botín antes del resumen final.
- Resumen de mundo centrado, sin cuadro invasivo, con botón Continuar.
- Cada jefe derrotado queda registrado como Nave-Jefe; soporte activable desde Mundo 4.


Novedades v1.6.4 — Recuperación táctica:
- Corregido el bug que degradaba permanentemente la velocidad al entrar en zonas de ralentización.
- Al morir se conserva una instantánea de hasta 8 poderes activos/en cola.
- Al reactivar, esos poderes reaparecen alrededor de la nave como premios recuperables.
- Cada reactivación añade un Impulsor vectorial de 10 s y un combo de emergencia de 5 s según mundo/nivel.
- La nave recupera su velocidad base y recibe 5,2 s de protección/reacción para recoger el paquete.
- Todos los poderes temporales ganan +3% de efecto y duración por cada nivel del mundo (L1=base, L2=+3%, L3=+6%, L4=+9%, L5=+12%).
- El arma básica mantiene su progresión propia por mundo, sin ser alterada por esta regla.


Novedades v1.6.4 — Recolección espacial y combos:
- Corregido el resultado de mundo que podía persistir sobre el mundo siguiente.
- Eliminada la selección emergente de poderes durante el combate.
- Las mejoras de nivel aparecen ahora como tres cápsulas flotantes; se elige una moviendo la nave.
- Las hordas de Mundos 1, 2 y 3 garantizan un kit flotante: Bomba antihorda + Impulsor + Ralentizador.
- Corregida la cola de armas principales: un poder en cola ya no sustituye accidentalmente al arma activa.
- Las armas principales compatibles con un combo pueden coexistir temporalmente.
- Combos reforzados visualmente y con efectos reales; nuevos combos de Mundo 3: Tempestad del reactor, Hiperfase vectorial y Bastión regenerativo.
- Impulsor, Ralentizador, Fase espectral y Naves auxiliares respetan mejor la mejora de +3% por nivel.


Novedades v1.7.1 — Preparación Táctica Exprés:
- Compra opcional antes de iniciar/reanudar misión, al comenzar cada nivel y tras reactivar una vida.
- Límites por nivel: M1 3, M2 5, M3 7, M4 9, M5 10; preparado hasta M10 con máximo 20.
- Monedas, XP y puntos disponibles se calculan en tiempo real; la compra descuenta el recurso elegido. El score histórico no disminuye.
- Poderes, bomba antihorda, shield, combos y sobrecarga del arsenal aparecen flotando y se recogen con la nave.
- Entregas en lotes de hasta 5 objetos para evitar saturación.
- Asesor táctico resalta opciones según horda, defensa, movilidad y combos posibles.
- Compras realizadas se conservan al morir dentro del mismo nivel y el límite se reinicia al cambiar de nivel.


Novedades v1.7.2 — carrito táctico no invasivo, entrega gradual, combos secuenciales y kits antihorda en Mundos 4–5.

v1.7.6 — Responsive móvil horizontal
- Modo horizontal prioritario en móvil, con intento seguro de pantalla completa/orientation lock.
- HUD superior en una sola línea; vidas, carrito y pausa prioritarios.
- Poster móvil optimizado y precargado.
- Centro de mando compacto en horizontal; ranking previo oculto para liberar espacio.
- Zona segura de combate aplicada a nave, spawns, reciclaje de enemigos y premios tácticos.
- Mensajes y dock inferior compactados para aumentar área útil.


v1.8.0 — Selector Normal/Difícil. Normal conserva balance v1.7.6. Difícil: +12% recorrido, +18% HP enemigos, +7% velocidad, +8% daño recibido, +18% HP jefe, +12% shield jefe, hordas/peligros ~25–30% más frecuentes, +28% score, +24% XP, +22% monedas, +32% probabilidad de premio, +8% duración y +5% efecto de poderes.


v1.8.1 — Boss 2.0: cinco sigilos vectoriales propios sin emojis para jefes/reliquias/HUD; cinco familias de proyectiles de jefe (meteórico, espora biomecánica, voltaico, cuchilla escarlata, vacío); un ataque especial propio por jefe; música procedural original por jefe con capas y cambios por fase; fase crítica del Mundo 5 acelera el pulso musical; presentación de reliquia conquistada al completar el botín; iconografía de jefe reemplazada en mapa, progreso, repetición y resultado.


v1.8.3 · PULIDO EVOLUTIVO / BOSS 2.2
- Ataques especiales de jefes 1–5 ahora tienen telemetría previa visible antes de ejecutarse.
- Daño visual progresivo de jefes: fracturas, pulsos y chispas según HP restante.
- Fases musicales y ofensivas conservadas con mejor señalización.
- Combos activan una Sobrecarga de Combo breve; dos o más combinaciones simultáneas generan SUPERCOMBO.
- Evolución visual de la nave vinculada a la primera derrota de cada jefe mediante módulos de cañón, núcleo, motor y alas.
- Mundos 3–5 usan tres estados visuales de recorrido mediante parallax, tintes y objetos ambientales progresivos.
- Eventos raros controlados: cápsula tecnológica, convoy élite y frente de escombros con apoyo táctico.
- Normal/Difícil, responsive horizontal y biblioteca futura 6–10 se conservan.


v1.8.4 · PRUEBA NARRATIVA MUNDO 1
- Selector CAMPAÑA / ASALTO.
- Microcinemática de 3 mensajes para Mundo 1 con imagen episódica.
- Botón Saltar historia.
- Cierre narrativo tras superar Mundo 1 antes de entrar a Mundo 2.
- Texto reducido para conservar legibilidad sobre fondos complejos.
