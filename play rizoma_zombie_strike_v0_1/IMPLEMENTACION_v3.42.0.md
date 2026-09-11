# RIZOMA ZOMBIE STRIKE v3.42.0
## Comparador de Playtests + Detección de Variabilidad

Base única: v3.41.0.

### Objetivo
Convertir el Laboratorio de Balance en una herramienta capaz de diferenciar una señal estable de una muestra demasiado variable o heterogénea antes de proponer cambios de balance.

### Cambios
- Coeficiente de variación local para duración total, tiempo de Guardián, daño real al casco y pico de amenaza.
- Clasificación de variabilidad: sin estimar / baja / media / alta.
- Detección de muestras heterogéneas por dificultad, Nave Rizoma y etapa de arsenal.
- Nuevo estado `NORMALIZAR MUESTRA`: evita interpretar automáticamente una muestra dispersa como problema de balance.
- Playtest Guiado puede recomendar `NORMALIZAR MUESTRA` y pedir repetición con dificultad y build comparables.
- Protocolo copiable ampliado con CV y contexto de la muestra.
- CSV ampliado con métricas de variabilidad y composición de muestra.
- Informe textual diferencia explícitamente `REVISAR BALANCE` de `NO REBALANCEAR AÚN`.
- Nueva señal visual del estado de variabilidad dentro del laboratorio.

### No modificado
No se modificaron HP, daño, spawns, cadencias, patrones de Guardianes, economía, poderes, tractor, RIFT, Última Oportunidad ni assets.

### Criterio metodológico
Una diferencia entre partidas puede proceder del mundo, pero también de la nave, dificultad, etapa de arsenal o desempeño puntual. v3.42 no intenta inferir causalidad: identifica cuándo hace falta una muestra más homogénea antes de tocar el balance.
