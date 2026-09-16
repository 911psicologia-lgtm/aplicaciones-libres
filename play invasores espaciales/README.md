# STARFALL FRONTIER v0.7.2

Build completa derivada de v0.6.5, con énfasis en libertad de movimiento, Hangar, economía táctica, supervivencia, loot y aliado de jefe.


## v0.7.2 — Hunter Doctrine

Esta iteración añade inteligencia espacial justa y coordinación enemiga. Los bosses pueden detectar permanencia lateral o evasiones repetitivas y preparar contrapatrones telegráficos cuyo objetivo queda bloqueado antes del disparo. Las formaciones incorporan fuego cruzado sincronizado y las escoltas del boss se especializan como hunters, interceptors, orbiters, gunners o rammers. Durante un contrap Patrón se arbitran otras amenazas fuertes para preservar lectura y evitar dificultad basada en saturación. Una evasión limpia puede conceder **LECTURA TÁCTICA**.


## v0.7.1 — Battle Rhythm

Esta iteración profundiza ENCOUNTER EVOLUTION sin reconstruir el juego. Introduce ritmo de combate de amenaza → esquiva → contraataque, recuperación breve del boss tras sus firmas, ventanas de núcleo más amplias si el jugador evita daño durante la firma, mutaciones secundarias de las firmas en fases avanzadas, fuego básico separado de las firmas de los subjefes, última carga de formaciones debilitadas y detonaciones tácticas encadenables al destruir kamikazes antes del impacto.

## v0.7.0 — Encounter Evolution

- Corrige la colisión crítica que podía eliminar bosses/subbosses al tocar la nave del jugador.
- Introduce colisiones por rol: boss embiste y sobrevive; subjefe impacta y retrocede; kamikaze se sacrifica.
- Añade kamikazes con telegraph, homing tardío y autoexplosión de proximidad en dives, micro-swarms, hordas y escoltas.
- Refuerza la resistencia de esbirros de formación y hace más progresiva la curva de HP de subbosses/bosses.
- Separa fuego básico de firma de boss: 3 variantes de ataque por identidad + firmas fuertes por fase.
- Añade maniobras de ruptura/surge en fases avanzadas y tercera fase de furia para subjefes.
- Protege fortaleza/fases frente a daño secundario (chain, fusion arc y shield pulse) para evitar saltos de encuentro.

## Inicio
Abrir `index.html` desde servidor web / GitHub Pages / Cloudflare Pages. La PWA usa `manifest.webmanifest` y `sw.js`.

## Controles
- Flechas / WASD / arrastre: movimiento libre por el campo.
- P: pausa.
- F: pantalla completa.
- B: invocar jefe aliado cuando esté listo.
- 🛒: tienda.

## Sistemas preservados
Assets realistas W01–05, audio quiet, economía y XP, Boss Supply, Boss Fortress, Reactor Reboot, hardpoints, módulos orbitales, Family Tactics, Micro-Swarm, Mission Director, Reactive Matrix Phase 2, streaming de assets, checkpoints y PWA.


## v0.6.9 — Boss Telegraph + Realistic Continuity
- Ventana telegráfica previa para ataques Signature de boss, con geometría visual distinta por identidad.
- Puntos débiles y hardpoints más legibles cuando están vulnerables.
- Corrección de fondos y opacidad de familias realistas en campañas largas (> mundo 10).
- Movimiento de boss/subboss conserva continuidad al entrar en su patrón, sin saltos iniciales.
- Los assets realistas integrados se reutilizan mediante mapeo normalizado en sectores posteriores.

## v0.6.7 — Tactical Belt + Drone Command
- Cinturón táctico 1–6 para usar consumibles sin abrir la tienda.
- Hangar muestra estadísticas efectivas después de mejoras.
- Drones avanzados interceptan proyectiles con bahías superiores.
- Jefe aliado incorpora dos ráfagas signature por invocación y barra de recarga visual.
- Pausar congela correctamente duración y cooldown del jefe aliado.
- Power-ups prioritarios (vida, imán, dron y supplies especiales) tienen baliza visual adicional.
- Assets/audio y economía central permanecen sin cambios.
