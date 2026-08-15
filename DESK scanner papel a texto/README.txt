Texto Vivo v1.4

Flujo: crear proyecto → tomar/cargar fotos → transcribir OCR → guardar avance → exportar.

Cambios v1.4:
- Carga dinámica del motor OCR: la app abre aunque el CDN tarde o falle.
- OCR por bloques con estimación de tiempo restante y guardado después de cada página.
- Preprocesamiento más ligero para acelerar: imagen reducida, fondo blanco y contraste suave.
- Mensajes de error más claros si no hay internet o el OCR no carga.
- Exportaciones UTF-8 con BOM para tildes y ñ.

Uso en Cloudflare:
Subir la carpeta completa texto-vivo-v1 dentro del proyecto principal.
Ruta esperada: /texto-vivo-v1/index.html

Nota: el OCR usa Tesseract.js desde CDN, por lo que requiere internet al menos para cargar el motor.
