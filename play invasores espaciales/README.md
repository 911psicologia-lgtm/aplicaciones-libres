# STARFALL FRONTIER — v0.3.6

**Enemy Ecology & Weapon Evolution Build**

Esta iteración continúa la línea jugable de v0.3.5: combate vertical rápido, formaciones densas pero legibles, responsive real para celular/tablet/PC, checkpoints, vidas largas, obstáculos tácticos, guardianes, subjefes, jefes por fases y recompensas de jefe que se adhieren automáticamente a la nave.

## Cambios centrales v0.3.6

### 1. Ecología enemiga: la formación ya no es una masa homogénea

Se incorporaron tres funciones enemigas nuevas dentro de la propia formación:

- **Sentinel**: proyecta un campo defensivo sobre enemigos cercanos. Los disparos del jugador pueden agotar el campo y abrir temporalmente la formación.
- **Reanimator**: puede reconstruir una unidad ordinaria destruida. La unidad reaparece mediante una transición visual desde el reanimador hasta su posición original.
- **Breeder**: genera drones de ataque de manera limitada. Los drones descienden, disparan y abandonan el campo sin convertir la pantalla en saturación permanente.

Los tres emplean assets ya existentes, pero con tratamiento visual, núcleos, auras y microanimaciones diferentes. También poseen sonidos y disparos propios.

### 2. Formaciones con geometría variable

Las oleadas alternan entre patrones **block, chevron, split, wave y stagger**. Esto cambia la forma de leer huecos y blancos sin romper el sistema de columnas ni la estabilidad responsive.

### 3. Jefes con ventanas de vulnerabilidad

Los jefes conservan sus tres fases e identidades de disparo, pero ahora abren periódicamente un **núcleo vulnerable**. Durante esa ventana el daño recibido aumenta y el núcleo se ilumina con una animación específica. Los cambios de fase también fuerzan una apertura prolongada del núcleo para premiar el buen posicionamiento.

### 4. Evolución real de armas mediante reliquias de jefe

Cada reliquia absorbida sigue aplicando su mejora permanente, pero además incrementa un nivel de evolución del sistema correspondiente. Al acumular suficientes reliquias se activan los niveles **II** y **III**.

Ejemplos:

- **Dispersión II / III**: pasa de tres trayectorias a cinco y luego a una configuración de siete proyectiles con un núcleo frontal reforzado.
- **Misiles II / III**: ganan corrección de trayectoria y, en nivel III, mayor frecuencia y daño.
- **Cadena II / III**: aumenta la probabilidad y el daño de los saltos eléctricos.
- **Escudo II / III**: al activarse limpia proyectiles cercanos; en nivel III también genera una descarga defensiva contra enemigos próximos.
- **Overdrive II / III**: reduce progresivamente el intervalo de disparo mientras el poder está activo.

### 5. Recompensa de jefe más cinematográfica

Los tres núcleos liberados por el jefe ya no salen inmediatamente hacia la nave. Primero **orbitan el punto de destrucción**, se separan, trazan una estela y luego aceleran hacia el jugador. Al adherirse, permanecen unos instantes orbitando la nave como confirmación visual antes de integrarse al sistema.

Durante esta secuencia el combate se congela de manera segura: no aparecen nuevos disparos ni ataques mientras se absorben las reliquias.

### 6. Correcciones y mejoras de estabilidad

- La horda previa al jefe tiene ahora una trayectoria propia y ya no depende de datos de incursión que podían quedar sin inicializar.
- Los atacantes especiales de la ecología no son seleccionados como buzos zigzag, evitando que pierdan temporalmente su función táctica.
- El máximo de vidas por sector respeta las ampliaciones obtenidas mediante reliquias.
- Se mantiene el límite de dos meteoros defensores para evitar que el escenario se vuelva invasivo.
- El cargador de assets elimina rutas duplicadas antes de precargar imágenes.
- En la fase de absorción de jefe se eliminan amenazas residuales para proteger la transición audiovisual.

## Arquitectura

- `index.html` — portada mínima, HUD y overlays.
- `css/main.css` — responsive PC/tablet/celular.
- `js/config.js` — balance, perfiles, ecología, evolución y jefes.
- `js/assets.js` — precarga y mapeo de sprites.
- `js/audio.js` — firmas de audio por poder, enemigo y jefe.
- `js/storage.js` — guardado, ranking y nave.
- `js/ui.js` — HUD, menú, pausa y Game Over.
- `js/game.js` — simulación, formaciones, IA, poderes, colisiones y render.
- `tests/` — smoke tests sintácticos, responsive y runtime.

## Pruebas

Desde la raíz del proyecto:

```bash
node tests/smoke-node.js
node tests/responsive-smoke.js
node tests/runtime-smoke.js
node tests/ecology-smoke.js
```

