# STARFALL FRONTIER v0.7.5

Build completa derivada de v0.6.5, con énfasis en libertad de movimiento, Hangar, economía táctica, supervivencia, loot y aliado de jefe.



## v0.7.5 — Tactical Intent

- Boss Combat Intent: CAZA VECTORIAL, CERCO DE FUEGO, CONTROL DE ESPACIO y REORGANIZACIÓN DE ESCOLTA.
- Cada intención se anuncia, fija su objetivo y prepara un remate interrumpible.
- Destruir la escolta vinculada, provocar SYSTEM BREAK o romper módulos/sistemas durante la intención concede DOMINIO TÁCTICO y una microventana de núcleo.
- Subboss Interruption: daño concentrado durante la recuperación de una firma puede desequilibrar al subjefe y retrasar su siguiente firma.
- Arbitraje ampliado para impedir solapamientos injustos entre firmas, Hunter Doctrine, Adaptive Echo, cicatrices e intención.

## v0.7.4 — Phase Consequence

Esta iteración convierte los hardpoints en **cicatrices funcionales**. El boss no solo pierde HP o una bonificación: la destrucción de armamento, propulsión o regulador modifica su doctrina en las fases siguientes mediante respuestas telegráficas y con objetivo congelado. Armamento principal destruido desplaza presión hacia apoyo auxiliar; propulsión dañada cambia movilidad por control de área; regulador roto elimina recarga de fortaleza pero puede detonar una respuesta de reactor inestable; desarticular todos los sistemas produce un **COLAPSO SISTÉMICO** que recompensa al jugador con una apertura real del núcleo. Sentinel, Reanimator y Breeder incorporan además **sinergias locales de soporte** que se rompen al destruir la red. Se preservan Tactical Ecosystem, Hunter Doctrine, Battle Rhythm, Encounter Evolution, Reactive Matrix, economía, assets, audio, PWA y progresión.


## v0.7.3 — Tactical Ecosystem

Esta iteración conecta los sistemas de combate existentes para que las acciones del jugador tengan consecuencias posteriores. Los bosses desarrollan **memoria táctica**: dos esquivas limpias pueden armar un **ECO ADAPTATIVO**, un segundo ataque con objetivo congelado y telegraph propio que nunca persigue al jugador después del aviso. Las ventanas de núcleo incorporan **SYSTEM BREAK**: concentrar suficiente daño durante una apertura extiende brevemente la vulnerabilidad, escalona al boss y erosiona parte de su fortaleza. Las unidades Sentinel, Reanimator y Breeder funcionan además como nodos de una **red de soporte**; destruirlas descoordina temporalmente a los esbirros cercanos, cancela fuego sincronizado y retrasa su siguiente acción. Se preservan Hunter Doctrine, Battle Rhythm, Encounter Evolution, Reactive Matrix, economía, assets, audio, PWA y progresión.

## v0.7.2 — Hunter Doctrine

Introduce lectura espacial justa del comportamiento del jugador, contrapatrones con objetivo fijado durante el telegraph, fuego coordinado de formación y escoltas especializadas como hunters, interceptors, orbiters, gunners y rammers. Durante un contrap Patrón se arbitran otras amenazas fuertes para mantener legibilidad y una evasión limpia puede conceder **LECTURA TÁCTICA**.

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
