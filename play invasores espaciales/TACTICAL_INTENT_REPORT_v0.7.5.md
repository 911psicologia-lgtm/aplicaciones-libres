# STARFALL FRONTIER v0.7.5 — TACTICAL INTENT

## Objetivo de esta iteración

Esta versión continúa la línea abierta por Encounter Evolution, Battle Rhythm, Hunter Doctrine, Tactical Ecosystem y Phase Consequence. El propósito no es elevar de forma plana HP, velocidad o densidad de proyectiles, sino ampliar la **causalidad táctica** del combate: el boss puede anunciar una intención, movilizar recursos para sostenerla y preparar un remate; el jugador puede leer esa intención, interrumpirla y transformar el estado posterior del encuentro.

## 1. Boss Combat Intent

Se incorpora un director de intención táctica independiente del fuego básico y de los ataques signature. Desde las fases habilitadas, el boss puede seleccionar una intención contextual y comunicarla antes de ejecutarla.

Intenciones implementadas:

- **CAZA VECTORIAL (PURSUIT):** maniobra orientada a presionar una posición prevista del jugador.
- **CERCO DE FUEGO (SIEGE):** busca reducir rutas cómodas de evasión mediante presión convergente.
- **CONTROL DE ESPACIO (CONTROL):** prioriza dominio territorial y desplazamiento obligado.
- **REORGANIZACIÓN DE ESCOLTA (REORGANIZE):** utiliza unidades vinculadas para preparar una acción posterior del boss.

La selección depende de fase, estado del boss y disponibilidad del sistema; no convierte cada ciclo en una repetición fija.

## 2. Telegraph y objetivo congelado

La intención se anuncia antes del remate. El objetivo espacial se fija durante el telegraph y no se actualiza para perseguir al jugador hasta el último instante. Esta regla preserva la equidad: la adaptación enemiga exige lectura y movimiento, pero no utiliza seguimiento imposible de esquivar.

## 3. Escoltas vinculadas a la intención

Una intención puede generar escoltas específicas marcadas con un serial propio. Estas unidades forman parte funcional de la maniobra y no son simples enemigos adicionales. El HUD informa el progreso de interrupción y las escoltas vinculadas poseen una conexión visual discreta con el boss.

La cuota se adapta a fase y dispositivo; en móvil se mantiene más contenida para preservar legibilidad y espacio de maniobra.

## 4. Interrupción y DOMINIO TÁCTICO

La intención no es inevitable. Puede romperse por acciones ofensivas bien ejecutadas:

1. destruir la cuota requerida de escoltas vinculadas;
2. provocar un **SYSTEM BREAK** mientras la intención está activa;
3. destruir un módulo o hardpoint del boss durante la maniobra.

Cuando el jugador interrumpe correctamente la intención se activa **DOMINIO TÁCTICO**: el boss recibe stagger, el núcleo se abre temporalmente y se concede puntuación. No existe una compensación oculta que haga al jefe más fuerte por haber sido superado tácticamente.

## 5. Remate de intención

Si la intención no es interrumpida dentro de su ventana, el boss ejecuta un follow-up propio del estado táctico seleccionado. El remate utiliza el objetivo fijado durante el telegraph y respeta los límites del sistema de arbitraje de amenazas.

## 6. Threat Arbitration ampliado

Mientras existe una intención mayor activa o pendiente se bloquea la superposición injusta de sistemas de alta presión. En esa ventana se contienen, según estado, nuevas signatures, Hunter Doctrine, summons rutinarios, Fortress Pulse y fuego básico del boss. El objetivo es incrementar complejidad **sin sacrificar legibilidad**.

## 7. Interrupción ofensiva del subjefe

Los subjefes reciben una nueva relación riesgo–oportunidad. Tras una signature entran en recuperación; si el jugador concentra suficiente daño precisamente durante esa ventana puede provocar **SUBJEFE DESEQUILIBRADO**.

Efectos del desequilibrio:

- retrasa efectivamente la siguiente signature;
- extiende brevemente la exposición/vulnerabilidad;
- aplica stagger;
- recompensa puntuación;
- solo puede activarse una vez por recuperación, evitando abuso.

Esto convierte la recuperación del subjefe en una oportunidad de timing ofensivo y no en una espera pasiva.

## 8. Persistencia, pausa y limpieza de estado

Los nuevos relojes de intención se ajustan durante pausa/reanudación. Cambios de fase, resurrección y reinicios relevantes limpian o reprograman estados para impedir que queden telegraphs, escoltas vinculadas o follow-ups obsoletos entre estados del encuentro.

## 9. Preservación de la base estable

La implementación se concentra en lógica de combate y presentación táctica. Se verificó contra v0.7.4:

- `assets/`: idéntico byte a byte.
- `audio/`: idéntico byte a byte.
- `js/economy.js`: sin modificaciones.
- Se mantienen los sistemas previos: Encounter Evolution, Battle Rhythm, Hunter Doctrine, Tactical Ecosystem y Phase Consequence.

## 10. Identidad de versión y PWA

- Versión: **0.7.5**
- Etiqueta de inicio: **v0.7.5 · TACTICAL INTENT**
- Cache PWA: `starfall-shell-v0.7.5`
- Service Worker build: `build=0750`

## 11. Validación

La regresión final incluye:

- **40/40 pruebas JavaScript aprobadas**.
- **10/10 validadores Python aprobados**.
- `node --check js/game.js`: PASS.
- `node --check js/config.js`: PASS.
- Prueba específica `tactical-intent-v075.js`: PASS.
- Validador específico `validate-v075.py`: PASS.
- Se confirmó objetivo congelado, despliegue de escolta vinculada, interrupción por escolta, ejecución de follow-up si no se interrumpe y desequilibrio funcional del subjefe.

## Resultado de diseño

STARFALL FRONTIER incorpora ahora una capa de intención que vincula anticipación, escoltas, interrupción, consecuencias y oportunidad ofensiva. El boss deja de ser únicamente un emisor de patrones: puede **proponer una maniobra**, mientras el jugador puede **leerla, desmontarla o sufrir su remate**. La innovación se mantiene dentro de una regla de diseño central: más relaciones y decisiones, no simplemente más saturación.
