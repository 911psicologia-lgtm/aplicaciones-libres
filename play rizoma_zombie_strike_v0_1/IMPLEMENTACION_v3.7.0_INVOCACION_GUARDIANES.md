# Rizoma Zombie Strike v3.7.0 — Pulido de Invocación de Guardianes

## Alcance
Esta versión parte exclusivamente de v3.6.0 y no abre nuevos mundos ni modifica el balance aprobado de M1, DOMINIO, reliquias o la Flota de Conquista.

## Cambios
- Invocaciones dibujadas a una escala objetivo de 39–43 % del referente de combate, dentro del rango aprobado 35–45 %.
- Entrada y retirada visuales con easing. La ventana de ataque empieza después de la entrada y termina antes de la retirada para evitar daño invisible.
- HUD: barra de progreso del cooldown y estado M# cuando está listo.
- Selección rápida: pulsación larga sobre GUARDIÁN cambia al siguiente desbloqueado; flechas izquierda/derecha permiten navegar con teclado.
- El cambio de Guardián está permitido durante cooldown, pero no elimina ni reinicia el cooldown.
- Activación bloqueada durante pausa, resultado, cartas, tienda/preparación táctica, historia, DOMINIO e introducción del Guardián enemigo.
- Se mantienen las 20 firmas de ataque, el pooling existente, el cooldown largo de 42 s y la persistencia previa.

## Compatibilidad
No se cambian las claves de almacenamiento ni la estructura legacy de progreso. Las partidas v3.5/v3.6 continúan reconciliando Guardianes y Flota desde `completedMaps`.
