# SUPER-SCANNER · v0.2

Aplicación web responsive orientada a **GitHub → Cloudflare Pages**. No guarda proyectos: la sesión vive en memoria del navegador y el flujo es **cargar/capturar → organizar → crear → descargar**.

## Funciones operativas en v0.2

- Carga **multiarchivo** y arrastrar/soltar.
- Cámara multipágina en móvil, tablet y PC.
- Imagen → PDF.
- PDF + imágenes + capturas → PDF mixto.
- **Organizador por páginas:** al cargar un PDF se muestran sus páginas individualmente.
- Reordenar, rotar, duplicar y eliminar páginas antes de crear el PDF final.
- **Dividir / extraer PDF:** selección por rango (`1,3,5-8`), todas, pares o impares.
- **Quitar contraseña de PDF con clave válida:** el usuario carga el PDF, escribe su contraseña y obtiene una copia nueva sin contraseña.
- Salida JPG/PNG para imágenes y capturas.
- PWA con manifest y service worker.

## Importante sobre “Quitar contraseña”

La versión 0.2 funciona completamente en el navegador usando PDF.js para abrir el documento con la contraseña aportada por el usuario y reconstruye cada página dentro de un PDF nuevo sin cifrado. La contraseña **no se guarda**.

Esta estrategia produce una copia visual/flattened de alta calidad. El texto del resultado puede dejar de ser seleccionable y algunos elementos interactivos (formularios, enlaces o firmas digitales) no se conservan. Una futura versión con backend `qpdf` permitirá una transformación estructural preservando el contenido cuando se necesite fidelidad total.

## Funciones que deliberadamente NO se muestran como operativas

- Word / DOCX → PDF.
- Excel / XLSX → PDF.
- PowerPoint / PPTX → PDF.
- OCR avanzado / PDF buscable.
- PDF → Word.
- Firma y edición avanzada.
- Compresión estructural profunda de PDF existente.

Estas opciones aparecen como **Próximamente**, para evitar botones que aparenten funcionar sin tener todavía un motor real. La conversión Office fiel se recomienda mediante un backend (por ejemplo, LibreOffice en un servicio/Container).

## Dependencias de navegador

- `pdf-lib 1.17.1` desde cdnjs para crear y reorganizar PDF.
- `PDF.js 6.2.108` desde jsDelivr para lectura, miniaturas, páginas y PDF con contraseña.

Para producción se puede vendorizar ambas dependencias dentro del repositorio si se desea funcionamiento más independiente de CDN.

## Publicar en Cloudflare Pages desde GitHub

1. Sube **todo el contenido de esta carpeta a la raíz** del repositorio de la app.
2. En Cloudflare: **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Selecciona el repositorio y la rama `main`.
4. Build command: `exit 0`.
5. Publica el directorio raíz (donde está `index.html`).
6. Cada push nuevo en GitHub desplegará la nueva versión.

## Prueba local

No abras `index.html` con doble clic. Usa un servidor local:

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Estructura

```text
super-scanner/
├─ index.html
├─ styles.css
├─ manifest.webmanifest
├─ sw.js
├─ _headers
├─ _redirects
├─ icons/
│  ├─ icon-192.png
│  └─ icon-512.png
└─ js/
   ├─ app.js
   ├─ camera.js
   ├─ pdf-engine.js
   ├─ pdf-tools.js
   ├─ store.js
   └─ utils.js
```
