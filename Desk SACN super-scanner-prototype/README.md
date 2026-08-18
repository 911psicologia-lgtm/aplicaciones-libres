# SUPER-SCANNER · v0.3

Aplicación web responsive orientada a **GitHub → Cloudflare Pages**. No guarda proyectos: la sesión vive en memoria del navegador y el flujo es **cargar/capturar → ajustar/organizar → crear → descargar**.

## Novedad principal v0.3: cámara sin pérdida de contenido

La cámara ya **no recorta automáticamente el centro del video**. Cada disparo conserva el encuadre completo y después permite ajustar la hoja mediante **cuatro esquinas móviles**.

Flujo normal:

1. Capturar foto completa.
2. Detección aproximada de bordes.
3. Ajuste manual de las cuatro esquinas mediante táctil o mouse.
4. Lupa de precisión al mover una esquina.
5. Corrección de perspectiva.
6. Filtro: Original / Documento / Grises / B&N.
7. Añadir la página a la sesión multiarchivo.

La guía visible durante la cámara es únicamente una referencia: **no destruye ni descarta las zonas que quedan fuera del rectángulo**.

### Captura rápida

Existe un modo opcional **Captura rápida** para fotografiar varias hojas sin detenerse en cada ajuste. Las páginas se guardan completas y quedan marcadas con **⚠ Revisar bordes**. Después pueden ajustarse individualmente desde la tira de capturas o desde la lista de archivos.

## Funciones operativas

- Carga **multiarchivo** y arrastrar/soltar.
- Cámara multipágina en móvil, tablet y PC.
- Ajuste manual de cuatro esquinas y corrección de perspectiva.
- Detección aproximada de bordes como punto de partida, siempre corregible manualmente.
- Rotación dentro del editor de captura.
- Filtros Original, Documento, Grises y Blanco/Negro.
- Imagen → PDF.
- PDF + imágenes + capturas → PDF mixto.
- Organizador por páginas: al cargar un PDF se muestran sus páginas individualmente.
- Reordenar, rotar, duplicar y eliminar páginas antes de crear el PDF final.
- Dividir / extraer PDF por rango (`1,3,5-8`), todas, pares o impares.
- Quitar contraseña de PDF con clave válida y generar una copia visual sin clave.
- Salida JPG/PNG para imágenes y capturas.
- PWA con manifest y service worker.

## Importante sobre el autoajuste

En v0.3 la detección automática es **una sugerencia**, no una promesa de recorte perfecto. Fondos blancos, sombras, documentos doblados o poco contraste pueden confundir cualquier detector. Por eso el mecanismo fiable es la combinación:

**foto completa → sugerencia automática → corrección manual de cuatro puntos → perspectiva**.

De esta manera, aunque el automático falle, el usuario conserva toda la fotografía y puede corregirla sin repetir la toma.

## Importante sobre “Quitar contraseña”

La función usa la contraseña aportada por el usuario para abrir el documento y reconstruir una copia nueva sin cifrado. No intenta adivinar ni romper contraseñas. La contraseña no se guarda.

La copia actual es visual/flattened: texto seleccionable, formularios, enlaces o firmas digitales pueden no conservarse. Una futura versión con backend `qpdf` permitirá transformación estructural.

## Funciones todavía marcadas como Próximamente

- Word / DOCX → PDF.
- Excel / XLSX → PDF.
- PowerPoint / PPTX → PDF.
- OCR avanzado / PDF buscable.
- PDF → Word.
- Firma y edición avanzada.
- Compresión estructural profunda de PDF existente.

## Publicar en Cloudflare Pages desde GitHub

1. Conserva la carpeta/ruta usada por el catálogo o sube su contenido a la raíz del repositorio correspondiente.
2. En Cloudflare: **Workers & Pages → Create application → Pages → Import an existing Git repository**.
3. Selecciona la rama `main`.
4. Si el repositorio es estático, build command: `exit 0`.
5. Publica el directorio donde se encuentra `index.html`.
6. Cada push nuevo despliega la nueva versión.

## Prueba local

No abras `index.html` con doble clic si quieres probar todas las APIs. Usa un servidor local:

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Estructura

```text
Desk SACN super-scanner-prototype/
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
   ├─ scan-editor.js
   ├─ pdf-engine.js
   ├─ pdf-tools.js
   ├─ store.js
   └─ utils.js
```
