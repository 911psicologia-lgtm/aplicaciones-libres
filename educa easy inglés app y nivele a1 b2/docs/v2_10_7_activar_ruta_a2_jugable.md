# v2.10.7 · Activación real de Ruta A2

## Problema corregido
A2 aparecía como desbloqueado, pero seguía siendo solo una hoja de ruta informativa/modal. No abría una ruta jugable.

## Cambios
- Se agregó ruta `ruta_2` con título `Ruta A2 · Acceso`.
- Se añadieron 150 microlecciones A2 organizadas en 30 mundos.
- Se añadieron 750 ejercicios A2 básicos.
- Se añadieron 30 diálogos integradores A2.
- A2 ahora muestra:
  - 30 mundos
  - Examen final 45 preguntas
  - botón “Abrir ruta A2”
- Al aprobar el Examen final A1-base, la app cambia `currentRouteId` a `ruta_2`.
- Se agregó `A2_WORLD_META` para títulos y subtítulos propios de A2.
- Las conversaciones ahora respetan `routeId` para evitar mezclar diálogos A1 con A2.

## Preservación
- No se eliminó A1.
- No se tocaron datos previos de progreso.
- No se alteró el examen final A1-base.
- A2 queda como base jugable inicial para iteración posterior.
