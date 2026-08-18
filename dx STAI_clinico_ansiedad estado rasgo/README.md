# STAI Clínico

Aplicación estática multiarchivo para aplicar y corregir el Inventario de Ansiedad Estado-Rasgo (STAI), añadir contextualización clínica opcional mediante una IA externa y generar un informe HTML autónomo.

## Flujo

1. Datos del protocolo.
2. Ansiedad-Estado en 4 bloques de 5 ítems.
3. Ansiedad-Rasgo en 4 bloques de 5 ítems.
4. Resultados base + contextualización IA opcional.
5. Generación y descarga del informe HTML.

La aplicación no necesita servidor, base de datos ni API key. El cálculo se realiza en el navegador. La historia clínica solo entra en el prompt cuando el usuario pulsa **Generar y copiar prompt clínico**; el contenido se pega manualmente en la IA externa elegida y la respuesta JSON se devuelve a la aplicación.

## Publicar con GitHub + Cloudflare Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta**, conservando la estructura de `assets/`.
3. En Cloudflare entra a **Workers & Pages → Create → Pages → Connect to Git**.
4. Selecciona el repositorio.
5. Framework preset: **None**.
6. Build command: dejar vacío.
7. Build output directory: `/` o dejar el valor raíz que proponga Cloudflare para un sitio estático sin build.
8. Despliega.

El archivo `_headers` añade cabeceras de seguridad compatibles con Cloudflare Pages.

## Estructura

- `index.html` — interfaz principal.
- `assets/css/styles.css` — diseño responsive.
- `assets/js/stai-data.js` — ítems, opciones y claves.
- `assets/js/scoring.js` — corrección y perfil base.
- `assets/js/app.js` — wizard, prompt, validación JSON y navegación.
- `assets/js/report.js` — generador del informe HTML, gráfico radial y red contextual.
- `manifest.webmanifest` + `sw.js` — modo instalable/offline básico.
- `_headers` — seguridad para Cloudflare Pages.

## Nota clínica

Las etiquetas descriptivas del rango directo no sustituyen los baremos normativos. Si se introducen decatipos, estos deben proceder del manual autorizado y del grupo normativo pertinente. El STAI y la contextualización IA no constituyen por sí solos un diagnóstico clínico.
