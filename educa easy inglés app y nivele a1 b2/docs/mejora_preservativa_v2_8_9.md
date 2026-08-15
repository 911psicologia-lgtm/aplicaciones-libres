# Mejora preservativa v2.8.9

## Alcance
Intervención mínima sobre banco de ejercicios, sin rediseñar navegación ni lógica principal.

## Cambios
- Corregidos 5 ordenamientos de una sola palabra:
  - lesson_51_ct2 → “I like this post”
  - lesson_55_ct2 → “Open the settings”
  - lesson_59_ct2 → “Submit the assignment”
  - lesson_80_ct2 → “Practice mindfulness today”
  - lesson_86_ct2 → “Check the ingredients”
- Añadido `acceptedAnswers` a 139 ejercicios de completar.
- Validación de completar actualizada para aceptar variantes controladas.
- Evaluaciones actualizadas para respetar `acceptedAnswers`.
- Etiqueta discreta `Refuerzo ampliado` en ejercicios ampliados.

## Validación
- Ordenamientos de una palabra restantes: 0.
- JS: validado con `node --check`.
- JSON: validado.
