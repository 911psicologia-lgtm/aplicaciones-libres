# v2.10.6 · Hotfix desbloqueo Examen final A1-base / A2

## Problema corregido
La app mezclaba la evaluación final con las evaluaciones por hito. Al agregar `final_a1_base` al catálogo, el cálculo de “evaluaciones superadas” esperaba 7 evaluaciones en vez de 6 hitos. Por eso, aunque M1–M30 y M5–M30 estaban completos, el Examen final A1-base seguía apareciendo bloqueado.

## Cambios
- `buildAssessmentProgressMetrics()` ahora separa:
  - evaluaciones por hito/checkpoint;
  - examen final A1-base.
- `finalUnlocked` ahora exige:
  - 30 mundos completos;
  - 6 evaluaciones por hito superadas.
- El examen final ya no se cuenta dentro de los requisitos para desbloquearse a sí mismo.
- Los registros antiguos `final_a1_base` de backups previos no bloquean la apertura del nuevo examen de 45 preguntas.
- A2 solo se considera desbloqueado cuando existe un resultado válido del examen final:
  - `total = 45`
  - `score >= 38`
  - `passed = true`.
- Se actualizó el texto del botón a “Iniciar Examen final A1-base”.

## Validación
- JS validado con `node --check`.
- Compatible con backups v2.10.2 donde A1 está completo pero no existe `finalExamResults`.
