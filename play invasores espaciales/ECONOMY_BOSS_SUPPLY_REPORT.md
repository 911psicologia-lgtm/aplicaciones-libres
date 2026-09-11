# STARFALL FRONTIER v0.6.0 — Informe de economía y apoyo contra bosses

## Problema abordado
Los bosses ya tenían resistencia estructural, Fortaleza y sistemas destructibles, pero el jugador podía llegar a la arena sin recursos temporales suficientes. Esta versión añade apoyo táctico sin rebajar la resistencia del jefe.

## Solución implementada
1. Dos pods de entrada en arena de boss.
2. Hasta tres suministros adicionales durante la pelea.
3. Poderes de bosses derrotados convertidos en herencia persistente y cargas de arsenal.
4. Tienda accesible mediante carrito, con pausa segura durante el combate.
5. XP, monedas, nivel, rachas e inventario persistentes.
6. Mejoras permanentes de casco, magnetismo, duración de poder y daño.
7. Resaltado amarillo neón para compras económicamente y dimensionalmente viables.
8. Fullscreen solicitado al iniciar/cargar y botón `[ ]` como fallback manual.

## Economía base
- Capital inicial: 120 monedas.
- Rachas premiadas: 5, 10, 20 y 30.
- El nivel se calcula con una curva creciente de XP.
- Los precios de upgrades aumentan con cada nivel adquirido.

## Seguridad de balance
Los boosts permanentes de daño siguen entrando en el Endurance Director existente, por lo que mejorar la nave no elimina la dificultad de bosses/subbosses. Los consumibles facilitan supervivencia y táctica, pero no desactivan Fortaleza, módulos, hardpoints ni compuertas de fase.
