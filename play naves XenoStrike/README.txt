SWARM//RIFT — Insecta Siege v2.14.0
====================================

ESTADO v2.14.0 — HANGAR EVOLUTION / ARSENAL EXPANSION
- Capítulo I permanece cerrado con 10 mundos activos. Mundos 11–20 NO iniciados.
- Arsenal ampliado de 19 a 24 poderes reales.
- Nuevos: Lanza Fásica, Nube Nanita, Mina Rift, Eco Temporal y Nova Entómica.
- Simultaneidad ampliada: 3 poderes activos de base; Bahía de Poder XL permite 4.
- Cola ampliada: 4 reservas de base; Bastidor de Reserva permite hasta 6.
- Evolución extendida: rangos VI ASCENDIDO y VII OMEGA mediante Matriz Evolutiva.
- Reactor de Duración añade hasta +25% de tiempo a poderes temporales.
- Los rangos VI/VII no son solo etiquetas: añaden cambios visibles/mecánicos en misiles, rail, gravedad, láser, bioarma y salvas/prismas, además del escalado propio de los cinco poderes nuevos.
- Nueva pestaña ◇ EVOL. en el Hangar y recomendaciones SMART adaptadas a los nuevos módulos.
- HUD muestra todos los poderes activos permitidos; la cola desktop muestra hasta seis reservas.
- Frecuencia de drops de poder aumentada de forma controlada para que el arsenal se vea y se use más durante la partida.
- Cinco iconos nuevos incluidos en el precache PWA.
- Guardados v2.13.7 migrables a v2.14.0; cadenas históricas conservadas.
- Bosses 6–10 biofieles, sus cinco estados de animación y sus ataques signature permanecen intactos.
- CHASE BONUS, Boss Rush, Commander Convergence, Tenientes, Combat Director, Wave Objectives, Reward Ledger, audio adaptativo y responsive permanecen activos.

DOCUMENTOS DE ESTA VERSIÓN
- CHANGELOG_v2.14.0.txt
- AUTOAUDIT_v2.14.0.json / AUTOAUDIT_v2.14.0.txt
- VALIDACION_v2.14.0.txt

NOTA DE PROCEDENCIA
v2.14.0 continúa directamente sobre la build integrada v2.13.7 entregada en esta conversación; no reconstruye sistemas cerrados ni abre Capítulo II.

NOVEDAD v2.14.0 — HANGAR EVOLUTION / ARSENAL EXPANSION
- 24 poderes totales, con cinco mecánicas nuevas no reducidas a “más balas”.
- Mina Rift deja objetos persistentes en la arena y detona por proximidad.
- Nube Nanita crea daño orbital de proximidad y puede formar Simbiosis Reparadora.
- Nova Entómica produce daño radial y limpieza de proyectiles.
- Eco Temporal duplica salvas con cadencia independiente.
- Lanza Fásica perfora en línea y forma Lanza Hiperlineal con Rail.
- Seis combos nuevos: Lanza Hiperlineal, Plaga Autónoma, Pozo de Minas, Eco Tridente, Catedral Nova y Simbiosis Reparadora.
- Evolución VI/VII y cuatro módulos nuevos de Hangar.
- Cache/PWA actualizado a swarm-rift-v2.14.0 y cache busting ?v=2140.

NOVEDAD v2.13.4 — FINAL CHAPTER I POLISH + CHASE REFINEMENT
- CHASE BONUS refinado a 64 s, tres fases, lock-on, shield, reparación, sobrecarga y rango S/A/B/C.
- CHASE incorpora enemigos insectoides reales en fases 2–3 y un Interceptor Soberano final.
- HUD y mensajes compactos móviles corregidos: una línea visible con iconografía contextual.
- Frenesí incorpora un único apoyo adaptativo intermedio según HP/shield/presión ofensiva.
- Se conservan 10/10 bosses animados y 10/10 ataques signature.
- Capítulo II sigue sin iniciarse.

NOVEDAD v2.12.1.4 — 3S BOSS APPROACH + COMMANDER CONVERGENCE + AUDIO RESUME
- Antesala de jefe fija en 3.0 segundos, también para reintentos/checkpoints de arena.
- Convergencia de Mando: todos los jefes previamente derrotados del capítulo pueden regresar como Tenientes en el nuevo boss.
- Simultaneidad controlada: 2–4 mandos concurrentes según progreso, dificultad y perfil de dispositivo; el resto entra como relevo.
- Cada Teniente conserva patrón, linaje, stamina, segunda fase y firma de proyectil del jefe de origen.
- Apoyo dinámico en arenas de alta presión: drops reforzados de shield y Potenciador de Impacto.
- Potenciador de Impacto: +35% daño ofensivo temporal; segunda carga +47%; hasta 24 s acumulados.
- Pausa/Hangar musical verdadera: la pista conserva currentTime y continúa desde el mismo punto al volver al combate.
- Nueva clave RUN/META v21214 con migración directa desde v21213.
- Caché PWA actualizado a swarm-rift-v2.12.1.4.

NOVEDAD v2.12.1.3 — FAST BOSS APPROACH
- Antesala final previa al jefe reducida exactamente al 50%: 16,5 s → 8,25 s.
- Los tres avisos de aproximación se redistribuyen proporcionalmente dentro del nuevo tiempo para evitar solapamientos.
- Se conserva el ambiente musical del mundo durante la antesala y el cambio ambiente → soundtrack del jefe al aparecer el boss.
- Se mantienen los pickups de rearmado, setpieces visuales, entrada animada del jefe y todos los sistemas de v2.12.1.2.
- Guardados y META de v2.12.1.2 se migran de forma directa a v2.12.1.3.


NOVEDAD v2.12.1.2 — COMMANDER WEAPON IDENTITY
- Eliminados los rótulos de texto bajo los Tenientes; permanecen únicamente barras funcionales de HP/stamina.
- Eliminada la pantalla modal “Núcleo de Jefe”. El cierre postboss continúa directamente con botín físico, herencia y Fragmento de Evolución.
- Diez firmas balísticas de mando diferenciadas por forma y lectura visual: Aguijón, Caparazón, Cuchilla, Espora, Ferroaguja, Disco Cinético, Gota Hemática, Nodo de Resina, Lanza Prismática y Onda Sónica.
- Telegraphs de jefe ahora anticipan la geometría de su arma: línea/cono, anillos, pulsos o abanicos según linaje.
- Conductas ligeras propias: aguijones aceleran, esporas derivan, discos cinéticos rebotan y gotas hemáticas corrigen parcialmente trayectoria.
- Los Tenientes heredan la firma balística del jefe del mundo anterior.
- Jefes y Tenientes reciben aproximadamente +10% de dificultad efectiva distribuida entre HP, stamina, daño, cadencia, movilidad y contacto; no se resuelve solo aumentando vida.
- Se preservan las tres fases obligatorias, ventanas de vulnerabilidad, checkpoint de arena, Boss Rush, audio, Hangar, Wave Objectives y economía.

NOVEDAD v2.12.1.1 — SMART HANGAR & SURVIVAL ECONOMY
- Hangar rediseñado en tarjetas compactas: icono, nombre corto, descripción mínima, reserva/nivel y coste.
- Pestañas SMART / PODERES / SOPORTE / MEJORAS, con paginación responsive y brillo dinámico para las compras más adecuadas.
- Catálogo de poderes derivado de los 19 poderes reales; corrige la referencia obsoleta `laser` y recupera Láser Chispeante.
- Los poderes se incorporan al Hangar según progreso; las herencias exclusivas de jefes aparecen al derrotar su mundo correspondiente.
- Compras de poderes durante una partida aceptan XP cuando alcanza el coste o créditos como alternativa; desde menú se almacenan reservas persistentes.
- Bomba Rift disponible como compra instantánea y reserva inteligente para Frenesí cuando existe suficiente presión enemiga.
- Soporte: HEMOGEL (+45% HP), SHIELD I (+35%), SHIELD II (+65%), SHIELD III (100%) y VIDA EXTRA.
- Compra inteligente prioriza el tier de shield apropiado al progreso, salud/escudo bajos, fase de horda, Frenesí y necesidades ofensivas.
- Umbrales de emergencia de HP 50% / 25% / 10% garantizan una bio-reparación tras una baja, una vez por umbral y por horda, con curación escalada.
- HEMOGEL en reserva puede autodesplegarse a HP crítico; reservas de shield también pueden activarse bajo presión crítica.
- VIDA EXTRA revive en el mismo combate con 62% HP, ~49% shield, invulnerabilidad breve y limpieza de proyectiles/amenazas inmediatas; no reemplaza ni elimina el checkpoint de jefe.
- Guardados v2.12.1 migran a v2.12.1.1 conservando progreso; suministros y reservas de poderes se guardan en META.
- Esta es una subversión del cierre v2.12.1; no inicia la ruta reservada para v2.12.2 ni Mundos 11–20.

NOVEDAD v2.12.1 — WAVE OBJECTIVES & ENCOUNTER VARIETY
- 8 miniobjetivos tácticos que complementan al Combat Director.
- Hordas con identidad Reconocimiento / Presión / Asedio y objetivos acordes a cada tramo.
- Encounter Budget compartido para impedir saturación de enemigos, objetivos, amenazas, Frenesí y densidad visual.
- Recompensas de objetivos registradas por Reward Ledger y penalización de rango al fallar sin game over automático.
- Guardados v2.12.0 compatibles y migrables a v2.12.1.

ARQUITECTURA DE EXPANSIÓN v2.11.0
- 20 sectores planificados mediante EXPANSION_PLAN.
- Capítulos definidos por datos: I (1–10) y II (11–20).
- Selector y HUD muestran progreso activo/planificado sin asumir que el mundo 10 es el final del motor.
- Boss Rush separado por capítulo.
- Gran Boss Rush preparado para desbloquearse cuando los 20 sectores estén implementados y derrotados.
- Récords históricos de Boss Rush y campaña se migran al Capítulo I.
- Guardados anteriores se migran desde v2.10.0 y versiones previas.
- Balance procedural seguro para sectores >10 mientras se diseñan curvas específicas del Capítulo II.
- Al incorporar el Sector 11, un jugador que ya venció el Sector 10 podrá desbloquear automáticamente el inicio del Capítulo II.

IMPORTANTE
El Capítulo II todavía no contiene enemigos, fondos, jefes ni poderes propios. v2.11.0 prepara el motor para incorporarlos sin rehacer campaña, guardados, selector o Boss Rush.


NOVEDAD v2.12.1.6 — ASSET FIDELITY PASS I
- Gameplay art primario sin referencias SVG en game.js.
- Support/front/pickups/Burst/Bomb con PNG concretos.
- Objetivos de horda (nodo/cápsula/núcleo) con assets de imagen.
- Nocturne/Iron/Emerald activan sus paquetes temáticos primarios.
- Enemigos mundos 1–6 usan rutas semánticas por familia/rango.
- Transversales con rutas PNG dedicadas.
- Migración de save/meta reparada desde v2.12.1.5 y v2.12.1.4.
- PWA cache: swarm-rift-v2.12.1.6.


NOVEDAD v2.12.2 — COMBAT DIRECTOR PROFILES BY WORLD
- Diez perfiles tácticos específicos, uno por mundo activo.
- Eventos, objetivos, transversales, formaciones, entradas, amenazas frontales y microeventos ponderados por identidad de linaje.
- Cadencia, presupuesto y densidad ajustados por mundo sin convertir la dificultad en HP adicional.
- Resonance Cathedral incorpora eco no consecutivo de eventos previos.
- HUD desktop muestra el perfil activo del Director.
- Diagnóstico: window.__SWARM_DIRECTOR_PROFILE().
- No se añadieron mundos 11–20.
