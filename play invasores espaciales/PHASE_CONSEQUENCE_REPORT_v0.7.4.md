# STARFALL FRONTIER v0.7.4 — PHASE CONSEQUENCE

## Objetivo

Profundizar la línea **Encounter Evolution → Battle Rhythm → Hunter Doctrine → Tactical Ecosystem** sin recurrir a inflación indiscriminada de HP, velocidad o densidad de proyectiles. La v0.7.4 convierte el daño estructural sobre el boss y la ecología de soporte de las formaciones en decisiones con consecuencias posteriores y legibles.

## 1. Hardpoints como cicatrices funcionales

Los hardpoints dejan de ser únicamente objetivos que reducen fortaleza o movilidad. El estado de armamento, propulsión y regulador se evalúa al entrar en nuevas fases y puede activar una **respuesta de cicatriz** diferente.

- **Armamento principal destruido → DOCTRINA AUXILIAR.** El boss conserva la penalización de cadencia directa ya existente y desplaza parte de su presión hacia una escolta especializada coherente con su identidad.
- **Propulsión destruida → CAMPO DE ANCLAJE.** La movilidad sigue reducida y la respuesta cambia hacia control de área mediante un patrón telegráfico con objetivo congelado.
- **Regulador destruido → REACTOR INESTABLE.** La fortaleza ya no puede recargarse, pero el boss puede emitir una única represalia de fase, anunciada y separada de otros ataques mayores.
- **Todos los hardpoints destruidos → COLAPSO SISTÉMICO.** No existe compensación oculta: el jugador obtiene stagger, apertura real del núcleo y bonificación de puntuación.

La prioridad del sistema evita respuestas contradictorias: `CRITICAL_COLLAPSE > REACTOR_FLARE > ANCHOR_FIELD > AUXILIARY_HUNT`.

## 2. Equidad y Threat Arbitration

La respuesta de cicatriz nunca retargetea después del aviso. `scarResponseTargetX/Y` se fija al armar el evento. Además, durante la ventana peligrosa se bloquean temporalmente:

- nuevas signatures;
- Hunter Doctrine;
- summons/refill de escoltas;
- Fortress Pulse;
- fuego básico del boss;
- nuevas maniobras surge.

La respuesta se programa después de la apertura gratuita de núcleo que acompaña al cambio de fase. Así no se castiga al jugador por aprovechar la ventana que el propio sistema le concede.

## 3. Sinergias locales de soporte

Sentinel, Reanimator y Breeder ya formaban nodos tácticos mediante `Support Network`. La v0.7.4 agrega **Support Synergy**, dependiente de proximidad y anulable al romper la red.

- **Sentinel + Reanimator:** la reanimación recupera más HP y se anuncia como `REANIMACIÓN PROTEGIDA`.
- **Sentinel + Breeder:** las crías nacen con HP adicional (`CRÍA BLINDADA`).
- **Reanimator + Breeder:** el siguiente ciclo de cría se acelera (`CRÍA ACELERADA`).
- Si Breeder está conectado simultáneamente a ambos nodos, aparece `CRÍA EN RED`.

Los enlaces se representan visualmente mediante líneas pulsantes discretas. Al destruir un nodo, `Support Network` descoordina a las unidades cercanas y las sinergias dejan de estar disponibles de forma natural.

## 4. Continuidad de sistemas previos

Se preservan:

- Encounter Evolution y colisiones diferenciadas;
- kamikazes, autoexplosión y detonación táctica;
- Battle Rhythm y ventanas de contraataque;
- System Break;
- Hunter Doctrine y objetivo congelado;
- Adaptive Memory / Eco Adaptativo;
- Formation Coordination y Escort Doctrine;
- Boss Fortress, hardpoints, módulos y Reactor Reboot;
- Reactive Matrix;
- economía, Hangar, loot, Boss Supply y progresión;
- responsive, PWA, worlds, assets y audio.

Reactor Reboot limpia estados pendientes de cicatriz y permite que el estado físico real de los hardpoints vuelva a determinar respuestas posteriores. Los relojes de `scarResponseWindupStart/Until` se desplazan correctamente durante pausa/reanudación.

## 5. Validación

- **39 pruebas JavaScript:** PASS.
- **9 validaciones Python:** PASS.
- Nueva simulación `phase-consequence-v074.js`: PASS.
- Sintaxis `js/config.js`, `js/game.js` y runtime: PASS.
- PWA cache: `starfall-shell-v0.7.4`.
- Service Worker registration: `build=0740`.
- `assets/audio` SHA-256 tree: `5cb8226fbc528eb670a41d8846a714538076c293c77af2c139cf81b78c189847` — idéntico a v0.7.3.
- `js/economy.js` SHA-256: `cbca517e6d3a5ddddad8693fc7920bea6f9083c75c1db7a1fba013f3031e28dd` — idéntico a v0.7.3.

## Resultado de diseño

La v0.7.4 introduce una relación más fuerte entre **lo que el jugador destruye y lo que el enemigo puede hacer después**. Atacar un hardpoint ya no es un gesto lateral: modifica el espacio de posibilidades del boss. Del mismo modo, priorizar nodos de soporte altera la calidad de reanimaciones y crías. El combate gana causalidad, lectura y decisiones de prioridad sin abandonar la regla central de esta línea de desarrollo: **la amenaza puede crecer, pero debe seguir siendo anticipable, evitable y explicable por el estado del sistema**.
