# MMPI-2 · Aplicación clínica · versión auditada 1.1-safe

Aplicación web cliente para **captura, integración, visualización y elaboración de informes MMPI-2**. Esta versión fue reconstruida tras una auditoría del motor psicométrico, datos normativos, módulo de IA, exportaciones, seguridad, accesibilidad y rendimiento.

> **Uso responsable:** las claves heredadas del proyecto no se consideran automáticamente oficiales. Las escalas con clave ausente/incompleta quedan bloqueadas y nunca se sustituyen por PD=0. Para uso clínico o pericial se recomienda importar las puntuaciones T obtenidas mediante un sistema de corrección autorizado (Pearson, TEA u otro sistema licenciado aplicable).

## Cambios esenciales de esta versión

- Motor **fail-closed**: clave ausente/incompleta → `t=null`, nunca PD=0 ficticia.
- Registro estructural `data/scale_registry.json` con tamaños/componentes documentados.
- `scale_items.json` activo depurado: solo contiene los 79 códigos reconocidos; el archivo heredado se conserva en `audit/legacy_scale_items_raw.json`.
- VRIN y TRIN quedan identificadas como algoritmos especiales (49 y 20 pares respectivamente) y bloqueadas localmente mientras no exista implementación autorizada.
- El baremo/país se pasa explícitamente al motor; se elimina la dependencia operativa del estado global para decidir la norma.
- Lookup PD→T por coincidencia exacta: no usa silenciosamente el PD inferior más cercano.
- Dataset español heredado bloqueado para cálculo local de T tras detectar anomalías de integridad.
- Importación manual de T oficiales (`Hs=68, D=58, TRIN=57F...`) con trazabilidad de fuente.
- Decisión explícita de validez global antes de configuraciones/recomendaciones automáticas.
- Índice F−K corregido para trabajar con puntuaciones directas.
- Prompt IA desidentificado por defecto, aviso real de transferencia a terceros y defensa contra prompt injection.
- Gráficos del informe IA se exportan realmente a **HTML y Word** como imágenes PNG; la tabla se conserva como alternativa accesible/fallback.
- Firma limitada a PNG/JPEG, validación de importaciones JSON, CSP, mejoras de teclado/ARIA, guardado diferido y límites de tamaño para Excel/JSON.

## Flujo recomendado

1. Crear el caso y capturar las 567 respuestas o cargar el Excel.
2. Seleccionar explícitamente la referencia normativa pertinente.
3. Si dispone de corrección oficial, pegar las T en el campo **Puntuaciones T oficiales** e identificar la fuente.
4. Establecer la decisión de validez del protocolo.
5. Revisar el informe y el estado/origen de cada puntuación.
6. Usar el análisis con IA preferentemente mediante **prompt desidentificado**.
7. Exportar HTML/Word/Excel/JSON.

## Estados psicométricos principales

- `T_OFICIAL_IMPORTADA`: T aportada por el profesional desde una corrección oficial/profesional declarada.
- `T_LOCAL_NO_VALIDADA`: cálculo local heredado con estructura controlada, pendiente de cotejo oficial.
- `CLAVE_INCOMPLETA`, `CLAVE_NO_DISPONIBLE`, `ALGORITMO_ESPECIAL_NO_DISPONIBLE`: cálculo local bloqueado.
- `BAREMO_ES_NO_VALIDADO_LOCALMENTE`: la PD puede existir, pero no se produce T con el dataset español heredado.
- `PD_FUERA_DE_TABLA`: no existe coincidencia exacta; no se extrapola ni aproxima.

## Estructura relevante

```text
app/
├── index.html
├── css/styles.css
├── js/
│   ├── app.js
│   ├── lib/
│   │   ├── data-loader.js
│   │   ├── storage.js
│   │   ├── mmpi2.js
│   │   ├── export.js
│   │   ├── signature.js
│   │   └── ai-prompt.js
│   └── screens/...
├── data/
│   ├── items.json
│   ├── baremo_us.json
│   ├── baremos.json
│   ├── criterios.json
│   ├── scale_items.json
│   └── scale_registry.json
├── audit/legacy_scale_items_raw.json
├── tests/audit-tests.js
├── tests/export-tests.js
├── CHANGELOG_AUDITORIA.md
├── VALIDACION_MMPI2_App.md
└── FUENTES_PSICOMETRICAS.md
```

## Persistencia y seguridad

La versión actual sigue usando `localStorage`. Los datos quedan en el navegador pero **no están cifrados en reposo**. Use un dispositivo/perfil protegido y copias seguras. Migrar a IndexedDB con cifrado y bloqueo de sesión sigue siendo una mejora arquitectónica futura, documentada en el changelog.

## Pruebas locales

Con Node instalado:

```bash
node tests/audit-tests.js
node tests/export-tests.js
```

También se valida sintaxis con `node --check` para todos los JavaScript y parseo JSON para los datasets.

## Despliegue

No requiere build. Puede desplegarse como sitio estático en Cloudflare Pages/GitHub Pages. La política CSP está definida en `index.html` y los scripts de bootstrap se cargan desde archivos externos.

## Propiedad intelectual

El MMPI-2 y sus materiales de corrección están protegidos. University of Minnesota Press indica que no autoriza la creación de algoritmos o sistemas independientes derivados de claves protegidas. Por ese motivo esta reconstrucción **no incorpora claves obtenidas de copias no autorizadas** para completar artificialmente el corrector. Consulte `FUENTES_PSICOMETRICAS.md`.
