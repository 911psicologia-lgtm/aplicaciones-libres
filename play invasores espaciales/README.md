# STARFALL FRONTIER — Combat Acceleration Build v0.2.0

Segunda versión funcional del prototipo multiarchivo. Esta iteración se concentra en **velocidad, densidad de combate, movilidad enemiga y estabilidad de los poderes** sin cambiar el lenguaje visual aprobado.

## Cambios principales de v0.2.0

1. **Combate acelerado**: mayor velocidad de la formación, desplazamiento del jugador, proyectiles, scroll del fondo, disparos enemigos y transición entre sectores.
2. **Formaciones densas**: el nivel 1 pasa a una base de 9×5 invasores; la matriz crece progresivamente hasta 12×8 según nivel y relación de pantalla.
3. **Separación reducida**: las columnas y filas se compactaron y la formación ocupa aproximadamente 82 % del ancho útil en móvil, dejando margen real para desplazarse de lado a lado.
4. **Movimiento colectivo + movimiento local**: toda la formación barre horizontalmente el campo mientras una proporción controlada de unidades ejecuta oscilaciones diagonales sin romper la lectura de la fila.
5. **Guardián de formación**: desde el nivel 2 aparece una entidad élite mediana detrás de la primera línea. Tiene más HP, trayectoria propia y patrón de disparo múltiple.
6. **Jefe sectorial sin vaciar el nivel**: cada quinto nivel comienza con formación + guardián; al destruirla aparece el jefe mayor. El jefe ya no sustituye por completo a los invasores normales.
7. **Poderes optimizados**: plasma, escudo, EMP, cadena, activación de dispersión y lanzamiento de misiles ahora usan VFX procedurales ligeros en Canvas. Se eliminó el reescalado de PNG grandes en cada frame.
8. **EMP seguro**: la destrucción masiva usa un presupuesto limitado de partículas para impedir congelamientos cuando afecta decenas de enemigos simultáneamente.
9. **Audio específico por poder**: dispersión, plasma, misiles, escudo, cadena y EMP tienen firmas sonoras sintetizadas independientes.
10. **Caché de sprites + VFX diferidos**: naves, enemigos y obstáculos reutilizan versiones reescaladas en memoria; los PNG conceptuales de poderes permanecen en el proyecto pero ya no se precargan ni se reescalan durante el combate.
11. **Colisiones sin basura temporal**: las comprobaciones críticas ya no crean rectángulos temporales por cada bala/enemigo, reduciendo presión del recolector de memoria durante dispersión y alta cadencia.
12. **Presupuesto adaptativo de partículas**: si el frame time empeora, el motor reduce automáticamente VFX secundarios antes de afectar la simulación.
13. **DPR adaptativo**: el canvas limita resolución interna según el área de pantalla para equilibrar nitidez y rendimiento en PC, tablet y móvil.

## Estructura

- `index.html`: interfaz y pantallas.
- `css/main.css`: sistema visual responsive.
- `js/config.js`: naves, desbloqueos, densidad, velocidad, guardián, jefes, poderes y obstáculos.
- `js/assets.js`: precarga, caché cuantizada de sprites y render reutilizable.
- `js/storage.js`: guardado, ranking y migración de datos.
- `js/audio.js`: audio sintético y firmas sonoras de cada poder.
- `js/input.js`: teclado, puntero/touch y gamepad.
- `js/game.js`: simulación, formación, colisiones, guardián, jefe, poderes, obstáculos y render.
- `js/ui.js`: pantallas, HUD, hangar, ranking y pausa.
- `js/main.js`: bootstrap.
- `assets/`: recursos visuales separados por dominio.
- `legacy/`: versiones anteriores para trazabilidad y rollback.
- `tests/smoke-node.js`: prueba de lógica, densidad, guardián, jefe, poderes y límites de objetos.

## Balance inicial v0.2

- Nivel 1: **45 invasores (9×5)**.
- Nivel 2: formación densa + **Guardián**.
- Nivel 5: formación + guardián + **jefe sectorial posterior**.
- Nivel 10: hasta **73 entidades de formación** en el perfil de prueba (incluido guardián).
- Límite de balas propias: 54.
- Límite de balas enemigas: 128.
- Límite base de partículas: 230, con reducción adaptativa.

## Prueba incluida

Desde la raíz del proyecto:

```bash
node tests/smoke-node.js
```

La prueba verifica formación compacta, movimiento lateral/diagonal, guardián, jefe pendiente, EMP masivo sin tormenta de partículas, VFX procedurales y límites de objetos bajo 420 frames simulados de combate intenso.

## Escalabilidad siguiente

La arquitectura permite incorporar después, sin volver al HTML monolítico: familias alienígenas por mundo, varios guardianes especializados, jefes únicos, patrones de escuadrón, spritesheets animados, música por sector, economía de hangar, árbol de mejoras y empaquetado Android/PWA.
