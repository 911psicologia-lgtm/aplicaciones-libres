# Adaptive Hive Boss Director — Tactical Memory + Counter‑Evolution v2.15.23

## Propósito

Counter‑Evolution añade aprendizaje **dentro de una batalla**, no entre usuarios ni entre sesiones. El objetivo no es aumentar estadísticas del boss, sino permitir que detecte una táctica repetida, pruebe una respuesta geométrica coherente con su identidad, mida si esa respuesta produjo un cambio observable y decida conservarla o retirarla.

## Ciclo de aprendizaje

1. **Observación.** El Director utiliza la lectura espacial ya existente y el perfil DPS multiventana.
2. **Repetición.** Una táctica debe permanecer estable durante 4 muestras del Director.
3. **Elegibilidad.** Solo campaña, mundos 11–20, fase 2+, A2/A3, confianza >= 0.74, sin BURST_SPIKE y fuera de fairness holds.
4. **Ensayo.** La respuesta se aplica durante 5.5 s usando únicamente los límites geométricos ya autorizados.
5. **Medición.** Se compara la táctica al final y la presión DPS reciente con la línea base del ensayo.
6. **Aprendizaje.** Si la táctica cambia o la presión baja al menos 10%, la respuesta queda aprendida para esa pelea.
7. **Retiro.** Si no funciona, esa respuesta se marca como retirada para esa táctica y no se vuelve a elegir durante la pelea.
8. **Reuso.** Una respuesta aprendida puede reutilizarse como máximo 2 veces y durante 4.4 s, con cooldown de 6.5 s.

## Límites

- Máximo 2 ensayos nuevos por fase.
- Máximo 2 reutilizaciones por táctica.
- No empieza un ensayo si Tactical Identity está en segmento neutral.
- Al comenzar un ensayo se reserva la ventana táctica completa para que la medición corresponda a una intervención real.
- Una transición de fase, signature/telegraph, charge, Last Chance o recovery aborta el ensayo sin clasificarlo como fracaso.
- No hay aumento de HP, daño, cadencia ni número de proyectiles.
- No se modifica la build, powers, ranks o mejoras permanentes del jugador.
- El aim adaptativo sigue limitado por `tacticalAimMax=.115`, el offset Y por `.075H` y el offset X por `.035W`.
- Arena Morphology conserva un corredor seguro y Counter‑Evolution solo puede sesgarlo como máximo una banda.

## Identidad

Cada boss de Capítulo II dispone de tres respuestas propias, para un total de 30. Ejemplos: Khepri usa `GRAVITY_CROSSCUT`, `PERIAPSIS_SHIFT` y `ORBITAL_FEINT`; Vespera usa `LANCER_CROSSVECTOR`, `NEEDLE_OFFSET` y `RUNWAY_REVERSAL`; Apis usa `ROYAL_CROSSPRESSURE`, `CELL_ROTATION` e `IMPERIAL_FEINT`.

## Telemetría local

Schema 5 registra ensayos, reusos, éxitos, fallos, abortos, respuestas aprendidas/retiradas y eventos. La memoria operativa del boss no se reutiliza en la pelea siguiente; la telemetría persistente solo sirve para inspección y balance posterior.

## Debug

`window.__SWARM_HIVE_DIRECTOR_STATUS()` expone el estado actual del Director y la sección `counterEvolution`.

`window.__SWARM_HIVE_DIRECTOR_REPORT()` incluye snapshot y eventos completos del aprendizaje intra-combate.

`window.__SWARM_V21523_STATUS()` resume contratos y preservaciones de la versión.

## Próximo paso seguro

Antes de activar Reactive Armor, RIFT Disruption o Rebirth, conviene validar Counter‑Evolution con juego humano real. La siguiente expansión segura sería permitir que una respuesta aprendida influya en la **secuencia de patrones** del boss —no en sus estadísticas— mediante un selector de combos tácticos con telegraph preservado y presupuesto limitado por fase.
