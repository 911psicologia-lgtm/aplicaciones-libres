# Protocolo Cognitivo K-BIT v0.3.0

Aplicación estática multiarchivo preparada para Cloudflare Pages.

## Qué incluye

- Datos reales del evaluado almacenados localmente en el navegador.
- Fecha de aplicación por defecto = fecha actual.
- Cálculo automático de edad cronológica (años, meses, días y meses cumplidos).
- Selección automática del intervalo normativo.
- Baremos del Apéndice C incorporados como JSON: C.1, C.2, C.3, C.4 y C.5.
- Contextualización por tipo de evaluación.
- Aplicación multipantalla por reactivo sin incluir estímulos.
- Registro de respuesta, 0/1, no administrado y nota.
- Créditos/ajustes basales y bruto final manual opcional.
- Resultados automáticos: típicos, percentiles, categorías, eneatipos, IC y discrepancia V–NV.
- Informe técnico local.
- Informe contextualizado local y flujo de IA anonimizado.
- Exportación HTML, TXT, DOC compatible con Word y PDF por impresión.
- Caso M ficticio para probar el circuito.
- Manual del evaluador inicial.

## Privacidad

Cloudflare Pages solo sirve los archivos estáticos. En esta versión, los casos se guardan en `localStorage` del navegador y no se envían al servidor. El respaldo JSON sí contiene información identificable y debe custodiarse.

El paquete para IA excluye nombre, documento, institución específica y fecha exacta de nacimiento. Los campos narrativos dependen de lo que escriba el evaluador, por lo que deben evitarse identificadores directos si se utilizarán con IA.

## Despliegue en Cloudflare Pages

La raíz de publicación es esta carpeta. No requiere compilación ni Node.js.

Opciones habituales:

1. Subir el contenido de la carpeta como proyecto estático en Cloudflare Pages.
2. Guardar la carpeta en un repositorio Git y conectarlo a Pages.
3. Con Wrangler, situarse en esta carpeta y desplegarla como directorio estático.

No abra `index.html` mediante doble clic (`file://`) porque los módulos y el JSON de baremos se cargan por HTTP. Para probar localmente:

```bash
python -m http.server 8080
```

Luego abra `http://localhost:8080/`.

## Estructura

- `index.html`
- `assets/css/app.css`
- `assets/js/config.js`
- `assets/js/utils.js`
- `assets/js/storage.js`
- `assets/js/scoring.js`
- `assets/js/reports.js`
- `assets/js/export.js`
- `assets/js/app.js`
- `data/baremos-kbit.json`
- `docs/manual-evaluador.html`
- `_headers`

## Siguiente fase prevista

1. Revisar el cuadernillo/manual de aplicación.
2. Incorporar consignas, puntos de inicio, retorno, discontinuación y criterios de corrección sin inventar reglas.
3. Convertir el manual del evaluador en ayuda contextual dentro de cada pantalla.
4. Añadir exportación DOCX/PDF nativa si se desea evitar el diálogo de impresión.
5. Opcional: Cloudflare Worker para llamadas a IA desde un backend seguro.
