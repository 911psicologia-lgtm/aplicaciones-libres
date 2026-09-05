# STARFALL FRONTIER — v0.3.1 Visual Combat Pass

Iteración de balance fino y mejora visual construida sobre v0.3.0.

## Qué cambia

- Se integran **assets reales aprobados** para las tres naves, siete clases visuales de enemigos, meteoros defensores y tres fondos verticales.
- Los enemigos normales siguen en formación compacta, pero ahora los disparos salen prioritariamente desde la **línea frontal** de cada columna, evitando el aspecto de “lluvia arcade” desde todas las filas.
- Los disparos enemigos pasan a ser **orbes, pernos de plasma y lanzas energéticas** con estela y trayectoria parcialmente dirigida al jugador.
- Los **buzos en zigzag** se desprenden de las primeras filas, descienden con curva lateral y disparan durante la aproximación.
- Guardianes, mini-jefes y jefes usan patrones distintos y tiempos de ataque controlados por cooldown, no por probabilidad por frame.
- Los **meteoros defensores** permanecen en su posición, giran sobre sí mismos, muestran resistencia y bloquean fuego de ambos bandos. Si reciben suficiente daño se destruyen y pueden liberar premio.
- Se conserva el sistema de **checkpoint por oleada**, barra de vida, corazones, vida crítica y vidas extra.
- Los **pods de premio** estacionarios deben abrirse a tiros; el contenido después baja y parpadea con un icono distintivo.
- Feedback de combate: `BONUS`, `RACHA x5`, `AMAZING`, `DOMINIO`, `CHECKPOINT`, `VIDA CRÍTICA` y `SECTOR LIMPIO`.
- Sonidos diferenciados para poderes, disparos de mini-jefe, disparos de jefe, rachas, vida crítica, vida extra y checkpoint.
- Fondos espaciales reales con desplazamiento lento y capa de estrellas para sensación de profundidad sin recargar el centro de juego.

## Progresión de un sector

1. Oleadas compactas de invasores.
2. Guardianes intermedios desde oleadas tempranas.
3. **Mini-jefe** en la oleada 3.
4. Oleada 5: avanzada + mini-jefe.
5. Tras limpiar la avanzada aparece una **horda final** de atacantes en picado.
6. Finalmente entra el **jefe sectorial**.
7. Al vencerlo: recuperación parcial, vida adicional y siguiente sector.

## Rendimiento

Los assets de gameplay fueron recortados y reducidos antes de integrarse para evitar reescalados de hojas completas. Los efectos de poder siguen siendo procedurales y ligeros; los PNG grandes de concepto no se procesan cada frame.

## Controles

- PC: flechas o WASD.
- Mouse / pantalla táctil: arrastre directo.
- Pausa: tecla `P` o botón en pantalla.

## Estructura

- `index.html`
- `css/main.css`
- `js/config.js`
- `js/assets.js`
- `js/storage.js`
- `js/audio.js`
- `js/ui.js`
- `js/game.js`
- `js/main.js`
- `assets/ships/`
- `assets/enemies/`
- `assets/obstacles/`
- `assets/backgrounds/`
- `tests/smoke-node.js`
