# v2.9.0 · Escucha y elige

## Alcance preservativo
Se agregó un reto auditivo suplementario por microlección sin crear pantallas nuevas ni alterar la ruta principal.

## Implementación
- Nuevo tipo de ejercicio: `listen_choice`.
- Se genera como refuerzo adicional desde `buildSupplementalExercisesForLesson()`.
- Usa `audioText` como frase a escuchar.
- El usuario escucha con 🔊 y elige la frase correcta entre opciones.
- En evaluación puede aparecer como pregunta auditiva.
- Mantiene lógica de `correctIndex`, mezcla de opciones y retroalimentación.

## Riesgo controlado
- No modifica los 750 ejercicios base.
- No altera progreso, conversación, videos, diccionario ni traducción.
- Funciona como extra integrado al flujo de práctica.
