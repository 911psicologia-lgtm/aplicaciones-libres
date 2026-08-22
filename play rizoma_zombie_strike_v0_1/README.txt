Rizoma Zombie Strike v1.9.9 — Mundo 9 · Anime–Manga Multiversal

Novedades v1.9.9:
- Mundo 9 completo con fondos manga aprobados y Kaiser Infinito.
- Seis enemigos propios: dos Shuriken, dos Ronin y dos Mecha/Coloso.
- Cinco Ecos de Guardianes anteriores (M4–M8), cada uno con familias de escolta.
- Horda Apocalíptica y Frenesí Asesino activos dentro del director de eventos de W9.
- Portales multiversales, meteoros, basura espacial y planetas errantes específicos del mundo.
- bossShip9 / Hilos del Multiverso, recompensa final y persistencia save/load.
- HUD ampliado con progreso ECO 0/5 y modo especial activo.

Historial anterior:
Rizoma Zombie Strike v1.9.8 — Ecos W7/W8 + Preparación W9/W10

Ajustes v1.9.8:
- Mundo 7 corregido: la lámina narrativa `bg_surface.jpg` ya no se dibuja dentro del combate; el gameplay inicia directamente en la caverna/meteorito (`bg_reef.jpg`) y profundiza hacia `bg_trench.jpg` y la arena final.
- Mundo 7 ampliado con dos Ecos de jefes previamente derrotados: Coloso del Vacío (M5) y Magnate Omega (M6), acompañados por sus familias y refuerzos durante el duelo.
- Mundo 8 ampliado con tres Ecos: Coloso del Vacío (M5), Magnate Omega (M6) y Leviatán Abisal (M7), también con familias asociadas.
- Los Ecos son encuentros obligatorios de acto: la progresión no abre el siguiente tramo hasta destruir el Eco correspondiente; guardado/carga conserva su estado y puede reponer un Eco pendiente tras recargar.
- Los Ecos tienen daño nuclear/crítico limitado para impedir eliminaciones instantáneas, patrones propios de ráfaga/radial, invocación familiar y recompensas específicas.
- HUD W7/W8 muestra progreso de Ecos (0/2 y 0/3).
- Se prepara el motor aislado para los modos futuros HORDA APOCALÍPTICA y FRENESÍ ASESINO de W9/W10, sin activarlos todavía en campaña.
- Se incorporan, optimizados como JPG de alta calidad, los cuatro fondos aprobados para Mundo 9 (aproximación/arena manga) y Mundo 10 (aproximación/arena apocalíptica). No se precargan aún para no penalizar W1–W8.
- Se mantienen los assets canónicos de jefes W6–W10 y las bibliotecas de meteoros, basura espacial y planetas errantes.

Rizoma Zombie Strike v1.9.6 — Mundo 8 + Mobile Fix

Ajustes v1.9.6:
- Mundo 8 jugable: Entrañas del Huésped Estelar, cinco actos y boss Tardígrado Primigenio.
- Fondos propios de antesala y arena final.
- Seis enemigos orgánicos en tres familias: Glóbulos Ácidos, Lanzadores Orgánicos y Engendros Parásitos.
- Mecánica Gestación Masiva: cápsulas destructibles que eclosionan si se agota su temporizador.
- Proyectiles orgánicos con assets dedicados y firma DOMINIO Génesis Orgánica.
- Hazards W8 con meteoros, basura espacial y planetas de identidad orgánica.
- Corrección móvil/PWA: la orientación horizontal pasa a ser recomendación no bloqueante; el juego puede continuar en vertical si Android/launcher no rota la app instalada.
- Manifest con orientation:any y aviso horizontal compacto sin interceptar toques.
- Hitboxes y barras de vida de hazards ajustadas por asset.

Rizoma Zombie Strike v1.9.4 — Jefes Articulados W6–W7

Ajustes v1.9.4:
- Magnate Omega y Leviatán Abisal dejan de renderizarse como sprites completamente rígidos.
- Nuevo motor reutilizable BOSS_HATCH_CONFIG + drawBossHatchLayer() para capas articuladas.
- Magnate Omega: núcleo/compuerta mecánica, cavidad interior y Drone de Asedio emergente.
- Leviatán Abisal: placa/caparazón frontal, cavidad bioluminiscente y Medusa de Plasma emergente.
- Apertura vinculada a bossFight.charge: comienza cerca del 20%, alcanza máximo alrededor del 85% y se cierra de forma reversible tras descargar la sobrecarga.
- Movimiento frame-rate independent mediante move-towards con velocidad fija por segundo.
- Se conservan sin reescritura las ramas de jefes W1–W5 y continúan Damage Overlay + Telegraph.
- Escala móvil W6/W7 preservada (.60 / .59) y capas relativas al tamaño real del boss.
- Se incorporó la lámina rectora Bosses 2.0 · Mundos 6–10 en assets/future/reference sin usarla como recurso runtime.
- Los bosses W8–W10 y las hojas de meteoritos/basura ya estaban presentes en la v1.9.3; no se duplicaron.


Ajustes v1.9.3 — Mundos 6 y 7:
- Mundo 6: Ciudadela de la Necrored, 5 actos, tres familias nuevas, ecos W1–W5, Red de Defensa y Magnate Omega.
- Mundo 7: Mar Alienígena, 5 actos, tres familias nuevas, corrientes abisales, burbujas de presión, ecos previos y Leviatán Abisal.
- DOMINIO: formas 6 y 7 capturables, con Firma heredada Pulso Necrored / Marea Viva y recarga propia.
- Nuevos fondos, meteoros, basura espacial y sprites transparentes para W6/W7.
- Audio procedural propio para minions y bosses futuros; boss music procedural por fase.
- Escalado táctico móvil conservado y aplicado a los nuevos enemigos/jefes.

Rizoma Zombie Strike v1.9.3 — Mundos 6 y 7

Novedades v1.9.0:
- PROTOCOLO DOMINIO desbloqueable desde Mundo 4: RIZOMA y Guardianes derrotados pueden seleccionarse como nave pilotable sin alterar vida, shield ni poderes activos.
- Selector DOMINIO compacto y no invasivo en el HUD, con pulso persistente y señal +1 al capturar una nueva forma.
- Formas DOMINIO reducidas y normalizadas: conservan la silueta visual de los jefes, con hitbox del jugador y pasivas moderadas.
- Porcentaje del jefe reacciona visualmente a cada descenso de daño y enfatiza impactos fuertes.
- Nueva familia de Intervenciones Críticas: Rayo Fractal, Plaga Hemófaga, Enjambre Cazador, Bombardeo Meteórico y Escuadrón Réquiem.
- Las Intervenciones Críticas aparecen de forma puntual en hordas y fases del jefe, como pickups manuales independientes del dock de poderes.
- Regla de daño crítica: simples eliminados, medios ~50%, élites daño importante y jefes con daño limitado.
- Nuevos poderes normales: Sobrecarga Omega, Furia Balística y Láseres Solar, Hemático y Abisal.
- Nuevos combos: Saturación Total, Lanzas Omega elementales y combos críticos Tormenta Congelada, Plaga Neural, Cacería Omega, Extinción Orbital y Último Escuadrón.
- Motor procedural Web Audio: cada poder obtiene firma sonora propia y cada combo/combinación posee activación sonora diferenciada.
- Rendimiento móvil protegido mediante límites de ramificaciones, misiles, meteoritos y naves Réquiem.
- Se conserva la arquitectura horizontal estable, sin Fullscreen API ni bloqueo programático de orientación.

Rizoma Zombie Strike v1.8.8 — Historia activa Mundo 1

Novedades v1.8.8:
- La narrativa del Mundo 1 se presenta como una transmisión Z-STRIKE, con caja más visible y pulso tecnológico sutil.
- Las frases se revelan con entrada progresiva y se dirigen al jugador mediante su nickname.
- Texto del prólogo reescrito para invitar a actuar: Asterion, Aurora, RIZOMA y el primer fragmento.
- Control SALIR con icono CSS/vectorial junto a CONTINUAR; se elimina la salida flotante superior.
- CONTINUAR / ENTRAR EN MISIÓN palpita cuando la frase ya está visible.
- Indicador de transmisión, progreso narrativo y movimiento cinematográfico suave de la imagen.
- Diseño compacto específico para móvil/tablet horizontal y respeto a reduced-motion.
- No se modifica combate, dificultad, orientación, HUD, poderes, jefes, vidas ni progresión.

Rizoma Zombie Strike v1.8.7 — Horizontal estable

Novedades v1.8.7:
- Se elimina por completo la dependencia del Fullscreen API y del bloqueo programático de orientación.
- Se retiran los botones de pantalla completa de Historia y HUD.
- El aviso de giro aparece únicamente cuando un móvil/tablet táctil está realmente en vertical.
- Ranking, Cargar, Menú, Historia y Combate conservan la misma lógica horizontal sin reinicios de orientación.
- Viewport oscuro y estable con 100dvh/100svh y safe-area; no se expone fondo blanco perteneciente a la página.
- HUD horizontal recupera el espacio del antiguo botón fullscreen.
- El manifest declara orientación landscape para instalaciones PWA compatibles, sin afectar la versión web normal.
- No se modifica combate, dificultad, jefes, poderes, vidas, progresión ni narrativa.

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


Correcciones v1.9.1:
- DOMINIO se mueve a un rail compacto de acciones junto al carrito y pausa; el texto permanente desaparece visualmente y queda sigilo + contador.
- Toque/pointer de DOMINIO se intercepta para que nunca alcance el canvas ni mueva la nave.
- En PWA/standalone el aviso de orientación es informativo y no bloqueante.


Ajustes v1.9.2 — Escalado táctico móvil:
- Jefes: ~25% menos presencia visual respecto a v1.9.1 en celular horizontal, con tope de 20% del ancho y 28% del alto del lienzo.
- Hitbox de jefe compactada ~12% en móvil para que extremidades decorativas no castiguen injustamente.
- Enemigos medios: -20% de escala adicional en móvil horizontal; élites -18%; simples -8%.
- Hordas W3–W5: máximo práctico de 5–6 unidades en móvil y hasta 2 pesadas en las formaciones avanzadas.
- Entrada escalonada por mayor separación entre filas y origen más externo al viewport.
- Séquitos de jefe W3–W5 reducidos en móvil (una unidad por familia) sin cambiar HP, daño ni dificultad en escritorio.
- PC mantiene el tamaño y densidad anteriores.
