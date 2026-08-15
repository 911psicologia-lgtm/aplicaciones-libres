# v2.10.5 · Hotfix apertura Examen final A1-base

## Problema corregido
El botón “Revisar consolidación” podía no abrir porque la app heredaba una consolidación final previa como aprobada, aunque no existiera resultado válido del nuevo examen de 45 ítems.

## Cambios
- Se agregó `hasValidFinalA1BaseResult()`.
- Se agregó `resetInvalidFinalA1PassIfNeeded()`.
- Solo se considera aprobado el Examen final A1-base si existe resultado con:
  - total = 45
  - passed = true
  - score >= 38
- Si había una aprobación vieja/parcial, se limpia el estado `passed` del registro final y el botón abre el examen.
- El botón muestra “Iniciar Examen final A1-base” cuando no hay resultado válido.
- Si ya existe resultado válido, “Revisar consolidación” abre el resultado.

## Validación
- JS validado con node --check.
- No se tocó banco de preguntas, progreso de mundos, diálogos ni audio.
