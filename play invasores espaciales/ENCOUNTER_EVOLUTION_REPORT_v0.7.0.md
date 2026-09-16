# STARFALL FRONTIER v0.7.0 — ENCOUNTER EVOLUTION

## Diagnóstico corregido

La auditoría detectó un fallo crítico en `updateEnemies`: la colisión jugador–enemigo aplicaba `e.alive=false` a **cualquier** rol. Por tanto, un `boss`, `miniboss` o `guardian` podía desaparecer al tocar la nave del jugador sin ejecutar su secuencia real de muerte, recompensa ni resistencia. Esto explica el comportamiento observado en el jefe del Mundo 2.

También se detectaron tres rutas de daño secundario (`chain`, `fusion arc`, `shield pulse`) capaces de restar HP sin pasar de forma consistente por fortaleza, escudo y gates de fase. Aunque su daño individual era pequeño, en builds evolucionadas podía acelerar o saltar partes del encuentro.

## Cambios estructurales

### 1. Colisiones por rol
- **Boss:** embiste, causa daño, separa físicamente al jugador y permanece vivo.
- **Subboss/guardian:** impacta, retrocede y permanece vivo.
- **Kamikaze/dive/escort/horde/micro-swarm:** puede autodestruirse al contacto o por proximidad.
- Se elimina la regla universal que destruía cualquier enemigo al tocar al jugador.

### 2. Curva real de resistencia
La curva W01–W05 se recalibró para que el jefe inicial sea vencible pero no descartable, y para que el crecimiento entre mundos sea perceptible. Además se añadió un multiplicador de encuentro independiente para bosses y subbosses, de modo que el escalamiento no dependa de una sola cifra de HP.

Boss HP base aproximado antes de Endurance Director, fortaleza, módulos y hardpoints:
- W01: ~1.140 HP
- W02: ~1.765 HP
- W03: ~2.630 HP
- W04: ~3.760 HP
- W05: ~5.190 HP

La fortaleza, módulos, hardpoints, Reactive Matrix y Endurance Director siguen operando por encima de esos valores.

### 3. Subbosses con tres estados
- Fase I: lectura inicial.
- Fase II: escudo reactivo + firma reforzada.
- Fase III (26% HP): **FURIA FINAL**, nuevo gate, recarga parcial, mayor movilidad, mayor cadencia y patrón adicional.
- El contacto con el jugador ya no puede borrarlos.

### 4. Boss attacks: básicos ≠ signature
Los disparos normales dejaron de reutilizar continuamente la misma rutina de firma. Cada identidad posee ahora un ciclo de tres ataques básicos y mantiene su firma para eventos de fase/telegraph.

Esto reduce la sensación de rutina y hace que el jugador lea dos capas distintas:
1. presión táctica ordinaria;
2. ataque signature anticipado y de mayor peligro.

Se mantienen identidades diferenciadas: predación escarlata/Nova, Yautja/Lancer, Nébula/Gravity, Arachnid/Brood y Leviathan/Phoenix.

### 5. Movimiento evolutivo del boss
Desde fase II aparecen maniobras de **RUPTURA DE EJE** y en fase III **MANIOBRA DE CAZA**. El boss combina su patrón horizontal propio con incursiones diagonales/verticales de profundidad controlada, sin invadir injustamente la zona de respawn del jugador.

### 6. Kamikazes y autoexplosión
Se añade una ecología kamikaze transversal:
- dives de formación con probabilidad creciente por oleada;
- micro-swarms;
- hordas de antesala y post-horda;
- escoltas de boss con probabilidad creciente por fase.

Los kamikazes tienen aviso visual, homing tardío, mayor resistencia puntual y fusible de proximidad. Su autodestrucción causa daño al jugador, pero no concede una muerte gratuita ni score explotable.

### 7. Esbirros de formación
Los minions dejan de ser mayoritariamente unidades de 1 HP. Raiders/strikers parten de una resistencia mínima mayor; gunners y ecología especial escalan por sector; W03–W05 reciben bonus adicional. Se conserva el ritmo arcade, pero ya no desaparecen ante cualquier roce de proyectil.

### 8. Daño secundario coherente
`chain`, `fusion arc` y `shield pulse` pasan por `applySpecialEnemyDamage()`, que respeta:
- fortaleza del boss;
- núcleo expuesto;
- armor por fase;
- Reactive Matrix mitigation;
- phase gates;
- escudo y gates de subboss.

## Resultado de diseño

El encuentro deja de basarse únicamente en “más HP”. La dificultad emerge de la relación entre **durabilidad + movilidad + ataque multidireccional + fases + escoltas + kamikazes + telegraph + adaptación defensiva**. El objetivo es que el usuario perciba siempre progreso sobre el enemigo, pero no pueda resolver el encuentro por contacto accidental, burst de daño secundario o repetición mecánica de disparo frontal.

## Validación

- `node --check`: PASS en todos los JS y service worker.
- `validate-v070.py`: PASS.
- `encounter-evolution-v070.js`: PASS.
- Suite completa `tests/*.js`: PASS.
- Regresión de transición de boss: PASS.
- Watchdog de transición/recompensa: PASS.
- Responsive smoke: PASS.
- Hash de árbol `assets/audio`: **sin cambios respecto del tronco estable**.
- `economy.js`: **sin cambios respecto del tronco estable**.
