# TRAS · Cambios v0.16.15 — la Matriz en la exportación y en el informe integrativo

## 1. Exportación individual desde el Centro de informes
- Se agregó **"Matriz Cognitivo-Atencional"** a la lista desplegable "Tipo
  de informe" (`#reportTypeSelect`), junto a HC/TRAS/Goldstein/
  Devolución adolescente.
- Nueva función `buildMatrizCaReportV0164()` (mismo patrón que
  `buildGoldsteinReportV0164`): genera un documento HTML/Word/PDF
  independiente con la identidad del caso + la sección de la Matriz
  (tablas por área/dominio + los cuatro bloques de lectura clínica).
- La opción se **deshabilita automáticamente** si el caso no tiene el
  módulo activo (`c.modules.matrizCA`), igual que ya pasa con TRAS/
  Goldstein según el alcance.
- La exportación en JSON del selector también incluye
  `matriz_cognitivo_atencional` cuando se elige ese tipo, y el JSON del
  informe integrativo ahora incluye `matrizCA` además de `informe` y
  `personalidad`.

## 2. La Matriz ahora entra en el análisis del informe integrativo
Este era el cambio más importante: **antes la Matriz no llegaba al prompt
que redacta el informe integrativo**, aunque los datos ya estuvieran
aplicados en el caso. Corregido en dos lugares:

- **`buildEvaluationMaterialV0164()`** (`v0164.js`, usada por "HC con
  apoyo de IA" y por "Generar todo con un solo prompt"): ahora arma un
  bloque `matriz_cognitivo_atencional` con los resultados calculados
  (`computeMcaCognitivas`, `computeMcaAtencion`, `computeMcaInteligencias`)
  y la interpretación profesional, igual que ya hacía con Goldstein.
- **El flujo `informe` en `aiflow.js`** (el que se dispara desde "Generar
  integrativo con IA", el más usado): se agregó el mismo bloque
  `matriz_cognitivo_atencional` a su propio material, y se actualizaron
  las instrucciones del prompt (`PRINCIPIO CENTRAL` y
  `CÓMO INTEGRAR SIN PERDER INFORMACIÓN`) para decirle explícitamente a
  la IA que la relacione con el TRAS, Goldstein e historia clínica —no
  basta con que el dato viaje en el JSON si la instrucción no lo nombra.
- Se actualizaron también las instrucciones del paquete completo
  (`paquete_informes`) con la misma advertencia.
- Los textos de ayuda visibles para el profesional (`hint` de cada flujo)
  también se actualizaron para mencionar la Matriz.

En los tres casos se repite la misma advertencia: la Matriz **no es una
prueba estandarizada** y sus indicadores de atención/impulsividad **no
equivalen a un diagnóstico de TDAH** — igual que en el resto de la app.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- **Prueba funcional en Node**: simulé un caso con `c.modules.matrizCA =
  true` y respuestas parciales, llamé a `buildEvaluationMaterialV0164()`
  real (extraída del archivo) y confirmé que el material devuelto
  contiene `matriz_cognitivo_atencional` con los resultados calculados
  correctamente (aciertos por área, promedios de atención, porcentaje
  relativo de inteligencias).
- Confirmé que `buildMatrizCaReportV0164`, la opción del selector y
  `matrizCaReportSection()` quedan correctamente enlazados entre
  `v0164.js`, `index.html` y `matrizca.js`.

## Soporte
- `APP_VERSION` → `v0.16.15`; `sw.js` → caché `tras-v0.16.15`.
