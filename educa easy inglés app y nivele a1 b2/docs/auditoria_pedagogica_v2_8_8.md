# Auditoría pedagógica v2.8.8
## Alcance
Banco de ejercicios, verdadero/falso, selección, ordenar palabras, completar, conversaciones, traducción y evaluación.
## Hallazgos principales
- Ejercicios revisados: 750.
- Conversaciones revisadas: 30.
- V/F balanceado: Counter({True: 102, False: 48}).
- Ordenamientos con traducción añadida/verificada: 147.
- Correcciones aplicadas: 178.

## Cambios destacados
- Corrección de equivalencias V/F cuando el valor lógico no coincidía con el contenido.
- Protección contra índices correctos fuera de rango.
- Validación de duplicidades de opciones.
- Adición/verificación de traducción en ejercicios de ordenamiento cuando era posible desde el vocabulario interno.
- Revisión de turnos conversacionales e índices correctos.

## Validación técnica
- `node --check app.js`: OK.
- `manifest.json`: OK.
- `content.v1.json`: OK.
- Reglas auditadas: índices de selección, booleanos V/F, respuestas de completar, palabras de ordenamiento, una única respuesta correcta por turno conversacional.

## Balance final
- Total ejercicios: 750.
- V/F: {True: 102, False: 48}.
- Conversaciones con turnos válidos: 30.
