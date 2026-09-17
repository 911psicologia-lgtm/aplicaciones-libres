# v0.7.6 — COMBAT DOCTRINE

- Perfiles persistentes de doctrina por boss con secuencias de intención, roles de escolta, movilidad y cadencia signature propias.
- Nuevo Threat Pacing Budget para impedir encadenamientos inmediatos de amenazas mayores sin ventana de lectura.
- Dos interrupciones consecutivas de intención en una fase activan CADENA DE MANDO ROTA y retrasan coordinación de escoltas/summons.
- Objetivos de escolta especializados por rol para pinzas, órbitas, caza y fuego sostenido más legibles.
- Fatiga estructural de subjefes tras interrupciones repetidas: menor recarga de escudo, recuperación más larga y firma posterior retrasada.
- PWA actualizado a cache `starfall-shell-v0.7.6` y registro `build=0760`.

# v0.7.5 — TACTICAL INTENT

- Nuevo Boss Combat Intent con cuatro doctrinas visibles y objetivo congelado.
- Remates de intención interrumpibles mediante escolta, SYSTEM BREAK, módulos o hardpoints.
- Recompensa DOMINIO TÁCTICO: núcleo abierto, stagger y puntuación; la dificultad no se compensa de forma oculta.
- Escoltas de intención enlazadas visualmente al boss y contabilizadas en HUD.
- Nuevo Subboss Interruption: concentración de daño durante recuperación retrasa la firma siguiente.
- Threat Arbitration ampliado para evitar superposición de amenazas mayores.
- PWA actualizado a cache `starfall-shell-v0.7.5` y registro `build=0750`.

# v0.7.4 — PHASE CONSEQUENCE

- Hardpoints convertidos en cicatrices funcionales con consecuencias doctrinales entre fases.
- Armamento principal destruido reduce la cadencia directa existente y activa apoyo auxiliar telegráfico en fases avanzadas.
- Propulsión destruida mantiene la penalización de movilidad y puede activar CAMPO DE ANCLAJE con objetivo congelado.
- Regulador destruido impide recarga de fortaleza y puede activar REACTOR INESTABLE como represalia de fase.
- Destruir todos los hardpoints produce COLAPSO SISTÉMICO: stagger, núcleo abierto y bonificación, sin compensación tramposa.
- Threat arbitration ampliado para que las respuestas de cicatriz no se superpongan con signatures, Hunter Doctrine, Fortress Pulse o summons.
- Support Synergy: Sentinel + Reanimator mejora la reanimación; Sentinel + Breeder blinda crías; Reanimator + Breeder acelera el ciclo de cría.
- Enlaces de soporte visibles y cancelables al destruir un nodo; Support Network sigue generando descoordinación local.
- Nuevos relojes sobreviven pausa/reanudación y Reactor Reboot limpia correctamente estados de cicatriz.
- PWA actualizado a cache `starfall-shell-v0.7.4` y registro `build=0740`.

# v0.7.3 — TACTICAL ECOSYSTEM

- Adaptive Memory: bosses acumulan memoria de esquivas limpias y pueden armar un ECO ADAPTATIVO después de lecturas repetidas.
- El ECO ADAPTATIVO usa objetivo congelado, telegraph independiente y recompensa por una segunda evasión correcta; nunca retargetea durante el aviso.
- SYSTEM BREAK: daño concentrado durante una ventana real de núcleo puede extender la apertura, escalonar temporalmente al boss y erosionar fortaleza.
- El SYSTEM BREAK solo puede activarse una vez por fase para evitar explotación por DPS continuo.
- Support Network: Sentinel, Reanimator y Breeder se convierten en nodos tácticos; al destruirlos descoordinan enemigos cercanos.
- La caída de un nodo cancela fuego cruzado/cargas locales, retrasa el siguiente ataque y crea una ventana de ofensiva legible.
- Unidades descoordinadas quedan temporalmente fuera de nuevos ataques coordinados y de nuevas inmersiones.
- Threat arbitration ampliado: Eco Adaptativo bloquea signatures, summons, fortress pulses y fuego básico mientras se resuelve.
- Los nuevos relojes sobreviven correctamente a pausa/reanudación y se limpian en cambios de fase/Reactor Reboot.
- PWA actualizado a cache `starfall-shell-v0.7.3` y registro `build=0730`.
- 38 pruebas JavaScript + validación Python; assets/audio y economía permanecen byte-identical al trunk estable.

# v0.7.2 — HUNTER DOCTRINE

- Boss Hunter Doctrine: lectura temporal de camping lateral y hábitos de evasión repetitivos.
- Los contrapatrones bloquean el objetivo durante el telegraph: el boss no persigue injustamente al jugador después de anunciar el ataque.
- Cinco respuestas por identidad: pincer, hunter swarm, gravity sweep, phoenix cut y solar sweep.
- Recompensa LECTURA TÁCTICA por escapar limpiamente de una zona adaptativa.
- Threat Arbitration: durante el telegraph adaptativo se aplazan fuego básico, pulsos de fortaleza, summons y nuevas signatures.
- Coordinated Formation Strike desde wave 2: fuego cruzado/fijación de blanco con objetivos bloqueados.
- Escort Doctrine: rammer, hunter, interceptor, orbiter y gunner.
- Timers nuevos preservados en pausa, transición de fase y Reactor Reboot.
- Assets/audio y economía conservados byte-identical respecto al trunk estable.

# v0.7.1 — BATTLE RHYTHM

- Boss signatures now create readable recovery/counterattack windows instead of uninterrupted pressure.
- Clean dodges during a signature grant a longer boss-core exposure and score bonus.
- Bosses receive phase-aware secondary signature mutations for directional variety.
- Subboss basic fire is separated from signature attacks; signatures now have cooldowns, recovery, and short vulnerability windows.
- Broken formations enter a one-time desperation state: survivors accelerate pressure and selected units launch an aggressive final charge.
- Kamikazes destroyed by the player can chain-detonate nearby enemies, turning a threat into a tactical resource.
- Pause clock shifting now preserves the new encounter timers.
- Runtime assets, audio, economy, worlds, progression, PWA structure, and existing systems remain intact.

# v0.7.0 — ENCOUNTER EVOLUTION

- FIX CRÍTICO: los bosses y subjefes ya no desaparecen ni mueren por contacto con la nave.
- Nueva semántica de colisión por rol y sistema kamikaze con explosión de proximidad.
- Curva de resistencia escalable para minions, subbosses y bosses.
- Boss basic attacks desacoplados de signatures, con ciclos multidireccionales por identidad.
- Boss surge maneuvers en fases II–III y subjefes con fase III de furia final.
- Daños secundarios respetan fortaleza, escudos y gates de fase.

## v0.6.9 — BOSS TELEGRAPH + REALISTIC CONTINUITY
- Telegraph visual antes de ataques Signature con formas propias por boss.
- Lectura mejorada de hardpoints vulnerables.
- Fondos realistas y opacidad correcta para familias recicladas en sectores posteriores al rango integrado.
- Entrada suave a las nuevas trayectorias de boss/subboss para evitar teletransporte inicial.
- QA de alfa/recorte sobre 225 sprites runtime: sin sprites opacos rectangulares.

## v0.6.8 — BOSS IDENTITY + REALISTIC ASSET LOOP
- Diferenciación fuerte del movimiento de bosses y subbosses por identidad.
- Proyectiles enemigos con nuevas propiedades: curvatura, homing retardado, aceleración, frenado y deriva ondulada.
- Corrección del acceso a familias visuales realistas para sectores posteriores al máximo integrado, evitando incoherencias visuales en campañas largas.

# STARFALL FRONTIER v0.6.7

## Tactical Belt + Drone Command
- Barra rápida de consumibles con teclado 1–6 y soporte táctil.
- Estadísticas efectivas del Hangar.
- Intercepción defensiva para drones de bahía avanzada.
- Signature bursts y progreso de recarga para el jefe aliado.
- Fix de reloj de pausa para aliado de jefe.
- Balizas visuales de loot prioritario.


## HANGAR + SURVIVAL + LOOT + BOSS ALLY
- Nave con libertad vertical casi completa.
- Hangar compacto y panel de mejoras.
- Tienda ampliada y más opciones de mejora de nave.
- 1–4 drones según Bahía Dron.
- Gemas físicas convertibles en monedas.
- Drops de vida y máximo de 9 vidas.
- Resurrección de emergencia comprable (1 carga almacenada).
- Power-ups renderizados con arte runtime original cuando existe.
- Poder IMÁN TOTAL.
- Jefe derrotado invocable como aliado 10 s, cooldown visible.
- Más Boss Supply y mejor supervivencia durante jefes.
- Fortaleza/Reboot/Reactive Matrix conservados.
