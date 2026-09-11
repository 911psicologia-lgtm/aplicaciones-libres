# BOSS ANATOMY + STREAMING REPORT — v0.5.5

## Objetivo
Aumentar profundidad de los encuentros con jefes sin convertirlos únicamente en barras de vida más largas, y reducir el coste de memoria de la librería visual de alta resolución.

## Anatomía táctica
Cada jefe recibe puntos críticos con HP independiente. Los disparos pueden golpear primero estos sistemas si intersectan su marcador. Mientras la Fortaleza está activa reciben daño reducido, por lo que pueden atacarse desde el inicio sin trivializar el combate.

### Efectos
- `left_weapon` / `right_weapon`: cada arma destruida aumenta el cooldown de las salvas del jefe.
- `regulator`: desactiva recargas normales de Fortaleza y elimina una parte de la Fortaleza vigente.
- `drive`: reduce movilidad del jefe.
- Sin hardpoints activos: se retira defensa adicional y se abre una ventana de núcleo.

## Streaming
El cache visual puede descargar mundos no necesarios. Se conserva el mundo actual y el anterior para permitir la herencia de enemigos sin mantener los cinco mundos high-DPI residentes simultáneamente.

## QA
Se añadió `tests/boss-anatomy-streaming-v055.js` y se ejecutó la suite completa existente del proyecto.
