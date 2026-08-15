# TRAS · Cambios v0.16.21 — TRAS extenso ajustado (59 ítems)

## Corrección honesta antes que nada
En el mensaje anterior dije "60 ítems". Al contar exacto con los datos
reales del `DATASET` (17 áreas con 3 ítems + 2 áreas con 4 ítems), el
número correcto es **59**, no 60. Ya quedó implementado con el número
correcto en todas partes (interfaz, prompts, changelog).

## Qué cambió
El modo `'extenso'` (el que ya existía por defecto) deja de significar
"los 76 ítems núcleo sin filtrar" y pasa a significar **59 ítems**,
resultado de un análisis área por área del contenido real de cada ítem
(no de su posición de ciclo) buscando redundancia semántica genuina:

- **`TRAS_EXTENSO_EXCLUIDOS`** (nuevo, en `dataset.js`): lista de 17
  ítems que se retiran, uno por área, en 17 de las 19 áreas núcleo.
- **"Compañeros de colegio" (área 4) y "Agresión/Acoso escolar" (área 19)
  conservan los 4 ítems** — no se encontró redundancia real entre ellos.
- **Ambos ítems marcados `alerta_clinica: true`** (ítem 20 y 49) quedan
  cubiertos en este modo — a diferencia del resumido (C+D), que solo
  cubre uno.
- `flattenedItems()` (paso 5, entrevista) ahora filtra también el modo
  extenso, con el mismo mecanismo ya usado para el resumido: no borra
  nada, solo cambia qué se *presenta* en la entrevista lineal.
- El chip de alternar modo, el asistente de nuevo caso, la etiqueta de
  "instrumentos aplicados" del informe y el material que reciben los
  prompts (`informe`, `paquete_informes`) quedaron con los conteos
  correctos (59 / 38).
- **`toggleTrasMode()` se generalizó**: como ningún modo es superconjunto
  exacto del otro área por área (por ejemplo, el resumido incluye
  `area_01_C`, que el extenso ajustado excluye), la advertencia al
  cambiar de modo ahora calcula de verdad qué respuestas ya registradas
  dejarían de mostrarse en la entrevista, en cualquiera de las dos
  direcciones — antes solo se advertía yendo hacia resumido.

## Caso demo
Se fijó `c.trasMode = 'extenso'` explícitamente (ya era el valor por
defecto, pero ahora queda documentado) y se dejó una nota en el código:
algunas respuestas demo existentes (en áreas 6, 8, 9, 13, 16) están en
ciclos que el nuevo extenso ajustado ya no presenta en la entrevista
lineal. No se pierde nada — siguen visibles en Revisión e Informe — y de
hecho sirve para mostrar ese mismo comportamiento (ya usado en el modo
resumido) dentro del propio demo.

## Verificación
- **Probado con los datos reales del `DATASET`**: modo extenso ajustado
  = 59 ítems núcleo (confirmado, no simulado), cobertura de las 19 áreas
  completa, ambos ítems de alerta clínica presentes. Modo resumido = 38,
  como ya estaba.
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.

## Soporte
- `APP_VERSION` → `v0.16.21`; `sw.js` → caché `tras-v0.16.21`.
