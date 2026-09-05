# Arquitectura STARFALL FRONTIER v0.2.0

La aplicación conserva el diseño multiarchivo y añade una capa explícita de rendimiento para sostener más enemigos y mayor velocidad.

## Capas

- **Datos y balance — `js/config.js`**: curva de densidad, velocidad de formación, probabilidad diagonal, guardián, frecuencia de fuego, obstáculos, límites de objetos y estadísticas de nave.
- **Assets — `js/assets.js`**: manifiesto de recursos, precarga y caché LRU de sprites reescalados. Los recursos grandes se escalan una vez por tamaño cuantizado y luego se reutilizan.
- **Persistencia — `js/storage.js`**: localStorage, ranking y compatibilidad con partidas anteriores.
- **Entrada — `js/input.js`**: teclado, touch/pointer y gamepad.
- **Audio — `js/audio.js`**: disparos, impactos, eventos y firmas sonoras independientes para los seis poderes.
- **Motor — `js/game.js`**: simulación, formación, guardián, jefe, balística, colisiones, obstáculos, poderes y render.
- **Interfaz — `js/ui.js`**: splash, hangar, ranking, pausa y HUD.
- **Arranque — `js/main.js`**: carga de recursos e inicialización.

## Formación enemiga

Cada enemigo mantiene una posición base (`baseX`, `baseY`) y la formación mantiene un desplazamiento colectivo (`formation.x`, `formation.drop`, `formation.dir`). Esto separa dos escalas de movimiento:

1. **movimiento colectivo**: barrido lateral y descenso al rebotar;
2. **movimiento local**: oscilación suave o diagonal de cada unidad dentro de un rango limitado.

El Guardián usa el mismo sistema de referencia, pero incorpora una amplitud local mayor y un patrón propio de disparo. Así puede moverse detrás de las filas sin desorganizar toda la matriz.

## Pipeline de rendimiento

1. `drawFast()` usa sprites previamente reescalados y evita `shadowBlur` por cada enemigo.
2. Las colisiones críticas usan `hitScaledPair()` sin crear objetos temporales por comparación.
3. Los poderes activos se renderizan con geometría Canvas ligera; los PNG de concepto quedan disponibles como recursos visuales, pero no se reescalan a pantalla completa cada frame.
4. EMP limita el número de explosiones secundarias aunque destruya una formación completa.
5. `perf.ema` estima el tiempo medio de frame y reduce el presupuesto de partículas de forma gradual.
6. El DPR interno se adapta al área de pantalla.

## Regla para crecer

Un mundo nuevo debe entrar primero por configuración y assets. Si la complejidad aumenta, los próximos candidatos a extraerse de `game.js` son `systems/formation.js`, `systems/powers.js`, `systems/obstacles.js` y `systems/bosses.js`. La persistencia, UI e input no deberían necesitar cambios para añadir esas familias de contenido.
