# Rizoma Zombie Strike v3.5.0
## Consolidación de M1, Flota de Conquista e Invocación de Guardianes

### Alcance
La versión parte exclusivamente del ZIP estable v3.4.0 recibido como baseline. Se mantienen exactamente 20 mundos jugables y Saga II cerrada. No se añade Mundo 21.

### Módulo 1 — Historia
`STATIC_STORY_ENABLED` queda en `false`. `showStorySequence`, los datos de escenas, overlays, navegación, assets y hooks se conservan. Las llamadas narrativas continúan existiendo, pero ejecutan inmediatamente su callback y no interrumpen el combate. Esto permite sustituir posteriormente las secuencias estáticas por dos cinemáticas opcionales y saltables sin reconstruir el flujo de campaña.

### Módulo 2 — M1 sin carrito
Se conserva la apertura audiovisual existente y se corrige la economía de progresión. M1 recompensa near-miss, destrucción competente de amenazas frontales, hordas limpias y capitanes. Los tres capitanes entregan un poder asegurado. Antes del Guardián, `ensureWorldOneBossLoadout()` estabiliza tres poderes significativos durante 24 s para impedir que el RNG o la expiración temprana deje una build insuficiente.

La reactivación de M1 deja de añadir `recoveryDefaults`, Impulsor y Combo. Solo reaparecen poderes realmente obtenidos. Las vidas compradas consumen monedas, puntos disponibles o XP y no conceden un poder ofensivo adicional en M1. Se conserva la protección temporal de reentrada para evitar muertes encadenadas.

### Módulo 3 — Recompensa por habilidad y profundidad frontal
`rewardWorldOneNearMiss()` concede score, puntos disponibles, monedas y XP. `rewardWorldOneFrontSkill()` otorga hitos de poder por dominio de amenazas frontales. Las hordas marcadas como desafío de habilidad registran bajas y daño recibido; una resolución limpia genera `CÁPSULA DE MAESTRÍA`. La destrucción temprana de amenazas frontales mantiene bonificación y se incrementa la probabilidad de poder temprano.

La protección del Guardián M1 deja de contar indiscriminadamente cualquier enemigo vivo: para M1 solo cuentan escoltas reales o entidades `mirror`, preservando reto sin introducir resistencia artificial por enemigos incidentales.

### Módulo 4 — Flota de Conquista
Se crea `CONQUEST_FLEET` como registro independiente de `DOMAIN_FORMS`. La Fase I solo integra assets que ya son vehículos reconocibles y existentes:
- M14 · Lanza Nova — `world14Ship`
- M16 · Neuroarca Psiónica — `world16Ship`
- M17 · Fenrir Cryo-Ship — `world17Ship`
- M18 · Akasha Manga-Ship — `world18Ship`
- M19 · Zhyr Disc — `world19Ship`

M15 no se publica como nave porque su asset reutiliza Fénix RZ-1. M20 tampoco se fuerza a entrar en la Flota. La arquitectura permite ampliar el registro cuando existan assets vehiculares de calidad. La nave base Fénix RZ-1 utiliza su asset real en el inventario.

### Módulo 5 — Invocación de Guardianes
Cada mundo completado migra/desbloquea `guardianN`. La invocación reutiliza el sprite cargado del Guardián, se representa a escala auxiliar, no incorpora hitbox contra el jugador, dura 6–7 s y utiliza un cooldown de 42 s. El sistema usa un pool pequeño de objetos y limita objetivos simultáneos en pantallas pequeñas.

Las 20 invocaciones tienen tratamiento ofensivo diferenciado por firma. Se implementan expresamente, entre otras:
- Vulkarion (M13): erupción radial.
- Neurokhan (M16): cadenas sinápticas.
- Skaldr (M17): cacería y congelación.
- Sauryx (M20): embestida e infección.

### Módulo 6 — Persistencia, UI y migración
El perfil añade `conquestFleet`, `activeFleetShip`, `guardianInvocations` y `activeGuardianInvocation`. `reconcileConquestRewards()` reconstruye los desbloqueos desde `completedMaps` sin borrar `bossShips`, DOMINIO, reliquias ni progreso previo. La partida guardada conserva además la nave de Flota activa y el cooldown de Invocación.

El Archivo de Mundos separa visualmente Formas DOMINIO, Flota de Conquista e Invocación de Guardianes. El HUD incorpora control GUARDIÁN con estado LISTO/cooldown/duración activa. Fullscreen, orientación, overlays y controles preexistentes permanecen intactos.
