# Informe técnico — Endurance Director v0.5.9

## Problema abordado
Las reliquias y mejoras permanentes aumentan progresivamente el daño del jugador. Sin una compensación, los bosses de mundos posteriores pueden perder relevancia aunque su HP base sea mayor.

## Solución
Se añadió un escalado específico para jefes y subjefes basado en tres señales: número total de reliquias, etapa visual del chasis y aumento permanente de daño. El multiplicador está limitado a **1.55× para bosses** y **1.32× para subbosses**.

Con 12 reliquias y chasis etapa 4, antes de considerar aumentos adicionales de daño, la compensación aproximada es de **1.48× para bosses** y **1.312× para subbosses**.

La Fortaleza y los escudos secundarios también reciben bonificaciones progresivas con límites independientes. Adicionalmente, un sistema de presión temporal incrementa gradualmente el ritmo de cada fase si el jugador prolonga el combate, sin alterar la dificultad de los enemigos comunes.

## Validación
Se añadió `tests/endurance-director-v059.js` y se ejecutó la suite completa del proyecto. Todas las pruebas pasaron después de actualizar los tests de regresión para reconocer la nueva Fortaleza dinámica.
