# v2.10.9 · Examen final contextual por ruta

## Problema corregido
En ruta A2 seguía apareciendo el bloque fijo “Examen final A1-base”.

## Cambios
- El bloque final de ruta ahora depende de la ruta activa.
- `ruta_1` muestra Examen final A1-base.
- `ruta_2` muestra Examen final A2-base.
- Se agregó scaffold para Examen final B1-base (`final_b1_base`).
- Se añadieron IDs independientes:
  - `final_a1_base`
  - `final_a2_base`
  - `final_b1_base`
- `getAssessmentConfig()` ahora reconoce finales por ruta.
- `getAssessmentCatalog()` ya no mete siempre el final A1 en cualquier ruta.
- A2 final se construye desde los ejercicios de ruta A2 y usa 45 preguntas.
- Al aprobar A2 final se marca B1 como desbloqueado en el estado MCER.

## Validación
- JS validado con node --check.
- JSON validado.
- No se eliminó A1 ni se tocó el avance previo.
