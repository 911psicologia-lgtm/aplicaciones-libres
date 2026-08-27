SWARM//RIFT — Insecta Siege v2.12.2
====================================

ESTADO ACTUAL
- 10 sectores jugables activos de 20 planificados.
- Capítulo I: Sectores 1–10, completo.
- Capítulo II: Sectores 11–20, arquitectura preparada; contenido aún no incorporado.
- 10 familias insectoides y 10 jefes activos.
- 3 hordas + jefe por sector, Combat Director, Tenientes y enemigos transversales.
- Normal / Difícil.
- 19 poderes, rangos I–V, 13 combos y herencias de jefe.
- Botín físico postboss, herencias, fragmentos, reliquias, Hangar, checkpoints y replay.
- Playlist de bandas de jefe y música contextual de arena.
- PWA offline y controles responsive para PC, tablet y móvil.

CONTROLES
- PC/tablet: mueve mouse o touchpad sin mantener clic. WASD/flechas también funcionan.
- Móvil: desliza el dedo directamente sobre la pantalla. No hay joystick ni botón DASH.
- Disparo y autoapuntado automáticos.
- Pausa, tienda, música, SFX y fullscreen mediante iconos superiores.


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
