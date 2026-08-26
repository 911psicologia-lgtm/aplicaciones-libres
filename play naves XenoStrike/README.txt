SWARM//RIFT — Insecta Siege v2.12.1.1
====================================

ESTADO ACTUAL
- 10 sectores jugables activos de 20 planificados.
- Capítulo I: Sectores 1–10, completo.
- Capítulo II: Sectores 11–20, arquitectura preparada; contenido aún no incorporado.
- 10 familias insectoides y 10 jefes activos.
- 3 hordas + jefe por sector, Combat Director, Tenientes y enemigos transversales.
- Normal / Difícil.
- 19 poderes, rangos I–V, 13 combos y herencias de jefe.
- Núcleos de recompensa, reliquias, Hangar, checkpoints y replay.
- Playlist de bandas de jefe y música contextual de arena.
- PWA offline y controles responsive para PC, tablet y móvil.

CONTROLES
- PC/tablet: mueve mouse o touchpad sin mantener clic. WASD/flechas también funcionan.
- Móvil: desliza el dedo directamente sobre la pantalla. No hay joystick ni botón DASH.
- Disparo y autoapuntado automáticos.
- Pausa, tienda, música, SFX y fullscreen mediante iconos superiores.

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
