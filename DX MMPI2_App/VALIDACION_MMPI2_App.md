# VALIDACIÓN TÉCNICA · MMPI-2 App 1.1-safe

Fecha: 2 de octubre de 2026

## Pruebas ejecutadas

### Motor psicométrico (`tests/audit-tests.js`)

- PASS: escala sin clave falla de forma cerrada (`pd=null`).
- PASS: F 58/60 se reconoce como `CLAVE_INCOMPLETA` y no produce PD.
- PASS: Hs 32/32 supera el control estructural.
- PASS: VRIN y TRIN quedan bloqueadas como algoritmo especial y conservan 49/20 pares esperados.
- PASS: el baremo español heredado no genera T local.
- PASS: lookup US requiere PD exacta; no usa vecino inferior.
- PASS: T oficiales sustituyen una T local y quedan como `T_OFICIAL_IMPORTADA`.
- PASS: `TRIN=57F` conserva el sufijo/dirección F.
- PASS: el archivo activo de claves no contiene identificadores espurios de fórmulas Excel.

### Exportación de gráficos IA (`tests/export-tests.js`)

- PASS: `_aiGraficoHTML()` incrusta PNG base64 real y conserva tabla accesible.
- PASS: `_aiBlockToDocx()` incorpora `ImageRun` para el gráfico y conserva la tabla/fallback.

### Integridad sintáctica

- PASS: `node --check` en todos los JavaScript del proyecto.
- PASS: parseo JSON de `scale_registry.json`, `scale_items.json`, `criterios.json`, `baremo_us.json` y `baremos.json`.

## Controles manuales/estáticos realizados

- `country` se pasa explícitamente en captura y recálculo.
- F−K en `report.js` usa PD de F y K.
- el prompt IA no instruye a ocultar participación de IA ni a reconstruir claves/T ausentes.
- la interfaz ofrece copia desidentificada por defecto.
- el aviso IA explica que pegar el prompt en un servicio externo transmite los datos al proveedor.
- firmas exportadas pasan por `sanitizeSignatureDataURL`.
- importación de JSON tiene límite de tamaño y saneamiento de casos/evaluador.
- `index.html` no mantiene script inline de bootstrap y contiene CSP.

## Lo que esta validación NO certifica

Esta validación técnica **no certifica equivalencia psicométrica con Pearson/TEA**. Las claves heredadas que tienen el tamaño esperado siguen marcadas como no validadas hasta cotejo con un sistema/material autorizado. `baremo_us.json` tampoco se declara normativamente certificado solo por pasar controles de estructura. El dataset español heredado queda expresamente bloqueado para generación local de T.

Tampoco se ha realizado una prueba E2E en navegador real con un DOCX descargado y abierto en Microsoft Word dentro de este entorno; sí se verificó programáticamente que la ruta de exportación Word genera `ImageRun` a partir del PNG del canvas. Se recomienda hacer una comprobación visual final en el navegador objetivo tras desplegar.

## Criterios de aceptación cumplidos

- A. escala sin clave no produce PD=0: CUMPLIDO.
- B. escala sin baremo no produce T: CUMPLIDO.
- C. country explícito: CUMPLIDO.
- D. F−K con PD: CUMPLIDO.
- E. puerta de validez antes de reglas automáticas: CUMPLIDO.
- F. aviso IA correcto: CUMPLIDO.
- G. HTML IA contiene imagen de gráfico: CUMPLIDO EN PRUEBA PROGRAMÁTICA.
- H. Word IA crea imagen de gráfico: CUMPLIDO EN PRUEBA PROGRAMÁTICA.
- I. gráfico no se sustituye solo por tabla: CUMPLIDO.
- J. HTML usa PNG base64 y no necesita Chart.js para mostrar la figura: CUMPLIDO.
- K. Word incorpora `ImageRun`: CUMPLIDO.
- L. no se inventaron claves/baremos: CUMPLIDO.

## Auditoría estructural de datasets normativos (`tests/data-integrity.py`)

Resultado reproducible guardado en `audit/DATA_INTEGRITY_OUTPUT.txt`.

- `baremos.json` (ES heredado): 156 tablas sexo×escala; 152 contienen algún PD >100/sentinela; 139 presentan al menos una disminución T al aumentar PD. La prueba es estructural y no reemplaza una revisión normativa escala por escala, pero la cantidad/patrón de anomalías justificó **bloquear su uso local**.
- `baremo_us.json`: 64 tablas; se conservó como dataset heredado con lookup exacto y etiqueta `T_LOCAL_NO_VALIDADA`. Las disminuciones detectadas no se interpretan automáticamente como error porque algunas escalas (por ejemplo Mf por sexo) pueden tener dirección normativa particular. Este dataset requiere cotejo externo antes de declararse oficial.
