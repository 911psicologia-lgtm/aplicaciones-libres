# CHANGELOG DE AUDITORÍA · MMPI-2 App 1.1-safe

Fecha: 2 de octubre de 2026

## Resumen

La versión original permitía que claves inexistentes/incompletas generaran resultados numéricos, mezclaba potencialmente referencias normativas por estado global, aproximaba PD ausentes, calculaba F−K con T y degradaba los gráficos del informe IA a tablas en HTML/Word. La versión 1.1-safe prioriza trazabilidad y fallo seguro.

| Problema | Archivo(s) | Solución aplicada | Estado |
|---|---|---|---|
| Clave ausente → PD=0 | `js/lib/mmpi2.js` | `computePD()` devuelve `pd:null` y estado explícito | CORREGIDO |
| Claves incompletas no bloqueadas | `mmpi2.js`, `scale_registry.json` | validación por tamaño/tipo antes de puntuar | CORREGIDO |
| Fórmulas Excel convertidas en códigos de escala | `scale_items.json` | archivo activo depurado a 79 códigos; original guardado en `audit/` | CORREGIDO |
| Conteos erróneos en auditoría previa | `scale_registry.json` | actualizados F60, D57, Mf56, Hs32, Si69, Fb40, Fp27, S50, Ho50, etc. | CORREGIDO |
| VRIN/TRIN tratados como escalas ordinarias | `scale_registry.json`, `mmpi2.js` | clasificados como algoritmos de pares; 49/20 pares; cálculo local bloqueado | CORREGIDO/REQUiere material autorizado |
| Lookup por PD inferior más cercano | `mmpi2.js` | coincidencia exacta; si no existe → `PD_FUERA_DE_TABLA` | CORREGIDO |
| Posible mezcla ES/US | `capture.js`, `report.js`, `mmpi2.js` | `country` es argumento explícito del cálculo/recalculo | CORREGIDO |
| Dataset ES estructuralmente dudoso | `mmpi2.js` | T españolas locales bloqueadas | BLOQUEADO POR VALIDACIÓN |
| T locales indistinguibles de oficiales | `mmpi2.js`, `report.js` | estados y fuente visibles; importación de T oficiales | CORREGIDO |
| TRIN oficial pierde sufijo F/T | `mmpi2.js` | importador admite `TRIN=57F/62T` y conserva dirección | CORREGIDO |
| Omisiones reducían silenciosamente PD | `mmpi2.js` | si una escala tiene componentes sin respuesta → PD nula | CORREGIDO |
| Interpretación antes de validez | `case.js`, `report.js`, `ai-prompt.js` | decisión global de interpretabilidad; configura/recomienda solo si procede | CORREGIDO |
| F−K calculado con T | `report.js`, `ai-prompt.js` | usa puntuaciones directas F(PD)−K(PD) | CORREGIDO |
| Criterios contradictorios/bandas | `mmpi2.js`, `criterios.json` | banda e interpretación se obtienen del mismo registro; limpieza de textos de alto riesgo | PARCIALMENTE CORREGIDO |
| Mf con lenguaje obsoleto | `criterios.json` | eliminadas inferencias de orientación sexual/expresiones estigmatizantes detectadas | CORREGIDO EN PUNTOS CRÍTICOS |
| Fp descrita como 21 ítems | `criterios.json` | corregida a 27 y lenguaje no determinista | CORREGIDO |
| VRIN/TRIN con conteos erróneos | `criterios.json` | corregidos a 49/20 pares | CORREGIDO |
| Aviso IA decía que no se transmitían datos | `report.js` | aviso real de transferencia al proveedor externo | CORREGIDO |
| Prompt IA enviaba identificadores por defecto | `report.js` | prompt desidentificado por defecto; versión identificada exige confirmación | CORREGIDO |
| Prompt pedía ocultar el uso de IA | `ai-prompt.js` | eliminada instrucción; se exige revisión profesional | CORREGIDO |
| Prompt injection desde historia/contexto | `ai-prompt.js` | datos clínicos delimitados como contenido no ejecutable | CORREGIDO |
| HTML IA no exportaba gráficos | `report.js`, `export.js` | canvas → PNG/base64 incrustado + tabla accesible | CORREGIDO |
| Word IA no exportaba gráficos | `report.js`, `export.js` | PNG → `ImageRun` + fallback tabular | CORREGIDO |
| Firma importada podía introducir `src` arbitrario | `storage.js`, `export.js` | solo Data URL PNG/JPEG validada | CORREGIDO |
| Upload de firma aceptaba cualquier `image/*` | `setup.js` | whitelist PNG/JPEG + 2 MB | CORREGIDO |
| JSON import sin límite de tamaño | `app.js`, `storage.js` | máximo 5 MB y saneamiento de estructuras principales | CORREGIDO |
| Sin CSP | `index.html`, `data-loader.js` | bootstrap externo + CSP restrictiva para scripts | CORREGIDO |
| Guardado completo en cada respuesta | `storage.js`, `capture.js` | debounce de 700 ms + flush al finalizar/cambiar estado | CORREGIDO |
| Excel potencialmente muy grande | `capture.js` | límite 5 MB y ~650 filas útiles | CORREGIDO PARCIAL |
| Gráficos recreados | `report.js` | se mantiene destrucción/recreación; captura IA usa Chart actual | CORRECTO |
| Modal/toasts/progreso con ARIA insuficiente | `index.html`, `app.js`, `capture.js`, `report.js`, CSS | roles, aria-hidden/live/progress, teclado, focus-visible, reduced-motion | MEJORADO |
| localStorage con PII sin cifrar | arquitectura | advertencia explícita; no se implementó cifrado/IndexedDB en esta versión | PENDIENTE ARQUITECTÓNICO |
| Ciclo `unmount()` integral en todas las pantallas | arquitectura | no se refactorizó completamente | PENDIENTE |
| Parser Excel en Web Worker | arquitectura | se añadieron límites pero no Worker | PENDIENTE |

## Restricción deliberada sobre claves protegidas

Se localizaron productos oficiales y también copias públicas no oficiales de manuales/materiales. No se incorporaron al corrector listas protegidas de ítems/direcciones obtenidas de reproducciones no autorizadas. University of Minnesota Press indica que no autoriza el desarrollo de algoritmos/sistemas independientes derivados de claves protegidas, incluido mediante IA. Por eso la versión segura permite **importar puntuaciones oficiales** y bloquea las escalas sin implementación autorizada.

## Estado actual de corrección local

El hecho de que una clave tenga el tamaño esperado solo produce `CLAVE_ESTRUCTURAL_OK_NO_VALIDADA`; no se la declara oficial. Las escalas incompletas/ausentes/especiales quedan sin PD/T local. Consulte `FUENTES_PSICOMETRICAS.md` para el inventario completo.

## Gráficos IA: criterio de aceptación

La exportación HTML y Word utiliza las imágenes capturadas desde `.ai-grafico-canvas`. El HTML es standalone y contiene PNG base64. Word usa `ImageRun`. Si una imagen falla, el documento no aborta: muestra un aviso y conserva la tabla de datos.
