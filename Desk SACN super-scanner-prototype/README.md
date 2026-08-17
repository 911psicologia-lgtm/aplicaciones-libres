# SUPER-SCANNER · Prototipo 0.1

Prototipo web responsive orientado a **GitHub → Cloudflare Pages**. No guarda proyectos: la sesión vive en memoria del navegador y el flujo es **cargar/capturar → ordenar → crear → descargar**.

## Qué funciona en esta versión

- Inicio responsive con herramientas agrupadas para evitar saturación.
- Carga **multiarchivo** por selector o arrastrar/soltar.
- Cola visual con reordenamiento por drag & drop, subir/bajar y eliminar.
- Cámara en móvil, tablet y PC mediante `getUserMedia`.
- Captura multipágina con recorte central y mejora ligera de contraste.
- Mezcla de **PDF + JPG/PNG/WEBP + capturas de cámara**.
- Generación de un PDF único en el navegador con `pdf-lib`.
- Imagen/captura → PDF.
- Salida JPG/PNG de imágenes y capturas.
- PWA con manifest, iconos y service worker.
- Archivos `_headers` y `_redirects` preparados para Cloudflare Pages.

## Módulos representados pero aún no completos

- OCR avanzado.
- PDF → Word.
- Conversión real DOCX/XLSX/PPTX → PDF.
- Firma y anotaciones sobre PDF.
- Detección geométrica de cuatro esquinas/corrección de perspectiva.
- Compresión avanzada de PDFs ya existentes.
- Vista previa de cada página interna de un PDF.

Estos módulos se dejaron desacoplados del núcleo para no comprometer estabilidad ni saturar la primera versión.

## Dependencia externa actual

El prototipo carga `pdf-lib 1.17.1` desde cdnjs. En una siguiente iteración puede vendorizarse o integrarse en un build si se desea eliminar toda dependencia CDN.

## Publicar en Cloudflare Pages desde GitHub

1. Crea un repositorio y sube **todo el contenido de esta carpeta a la raíz**. Es importante que `index.html` quede en el nivel superior.
2. En Cloudflare: **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Selecciona el repositorio.
4. Rama de producción: `main`.
5. Build command: `exit 0`.
6. Build output directory: el directorio donde están estos archivos; si el repositorio contiene únicamente esta app, usa la raíz del proyecto según la configuración de Pages.
7. Guarda y despliega.

Cloudflare Pages exige HTTPS en producción, por lo que la cámara puede solicitar permiso correctamente. El navegador seguirá requiriendo autorización del usuario.

## Prueba local

No abras `index.html` con doble clic para probar la cámara/PWA. Usa un servidor local, por ejemplo:

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
   ├─ store.js
   └─ utils.js
```
