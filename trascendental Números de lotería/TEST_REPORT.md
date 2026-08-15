# Informe de pruebas — Fortuna Quantum v4.2

Fecha de revisión: 2026-07-16

## Pruebas estructurales

- Sintaxis válida en todos los archivos JavaScript mediante `node --check`.
- Todos los recursos locales declarados en `index.html` y `sw.js` existen.
- El nuevo módulo `audit-engine.js` carga antes de `prompt-engine.js` y `app.js`.
- Los identificadores HTML son únicos.
- El caché PWA utiliza una clave nueva.

## Pruebas del motor local

- Reconocimiento de estructura `5 estados de un universo de 39, sin repetir`.
- Generación de cinco controles internos con cinco estados diferentes cada uno.
- Cálculo de suma, media, amplitud, desviación estándar, paridad, tercios y consecutivos.
- Generación de huellas de integridad individuales y de ejecución.
- El paquete JSON no expone la propiedad interna `values`.
- El control de contraste histórico queda rotulado como control local, no como historial verificado.
- La capa celeste queda pendiente cuando no existe una fuente de efemérides verificable.

## Pruebas del prompt

El prompt generado:

- contiene `SIMULACIÓN ACADÉMICA Y AUDITORÍA RELACIONAL`;
- incorpora el paquete JSON local;
- exige distinguir dato, descripción, simbolismo y azar;
- prohíbe reconstruir estados individuales;
- prohíbe inventar fuentes, históricos, efemérides, hashes o cálculos;
- prohíbe sustituir los controles por palabras decorativas;
- ya no incluye el bloque `MUESTRAS NUMÉRICAS DEL GEMELO FICTICIO`;
- no afirma que una matriz histórica o celeste fue ejecutada sin evidencia.

## Límite de la prueba

Las pruebas cubren el funcionamiento local de la aplicación y la construcción del prompt. La respuesta final de una IA externa puede variar según sus herramientas, políticas y acceso real a fuentes.
