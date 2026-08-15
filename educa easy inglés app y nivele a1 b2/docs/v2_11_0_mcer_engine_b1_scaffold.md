# v2.11.0 · MCER Engine + B1 scaffold preservativo

## Objetivo
Evitar que B1 repita los problemas iniciales de A2: rutas desbloqueadas visualmente pero no jugables, exámenes finales fijos en A1, y contenidos no diferenciados por nivel.

## Cambios principales
- Se agregó `MCER_ENGINE` como mapa central inicial:
  - `ruta_1` → A1 → final A1 → siguiente A2.
  - `ruta_2` → A2 → final A2 → siguiente B1.
  - `ruta_3` → B1 → final B1 → siguiente B2.
- Se creó físicamente `ruta_3`.
- Se agregaron 150 microlecciones B1.
- Se agregaron 750 ejercicios B1.
- Se agregaron 30 diálogos integradores B1.
- Se agregó `B1_WORLD_META`.
- El cajón B1 ahora puede abrir `ruta_3` cuando está desbloqueado.
- Al aprobar examen final A2, la app cambia a `ruta_3`.
- El examen final B1-base queda contextual desde la ruta B1.
- La estructura de videos para A2/B1 queda preparada con metadatos de inyección futura.

## Diferenciación B1
B1 no replica A1/A2:
- lectura breve,
- inferencia,
- reformulación,
- opinión breve,
- escucha por idea principal,
- conversación de 3 turnos,
- conectores de causa, contraste y secuencia.

## Auditoría rápida
- Rutas: A1, A2, B1.
- Lecciones totales: 450.
- Ejercicios totales: 2250.
- Conversaciones totales: 90.
- JS validado con `node --check`.
- JSON validado.
- Auditoría básica de opciones/correctIndex ejecutada.
