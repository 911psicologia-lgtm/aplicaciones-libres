# Elichín · cómo publicarla en internet (Cloudflare Pages, gratis)

Esta es una PWA: un sitio web que el móvil puede **instalar como si fuera una app**, y que funciona **sin conexión** una vez abierta. Para que todo eso funcione (instalación, modo sin conexión) necesita servirse por internet con HTTPS. Cloudflare Pages hace eso gratis.

> Importante: **no abras `index.html` haciendo doble clic** (eso usa `file://` y la app no carga bien). Tiene que estar publicada.

## Pasos (arrastrar y soltar, sin escribir código)

1. Descomprime el archivo `elichin.zip`. Te queda una carpeta llamada **`elichin`** con dentro: `index.html`, `manifest.webmanifest`, `service-worker.js` y la carpeta `assets`.
2. Entra a **https://dash.cloudflare.com** y crea una cuenta gratuita (o inicia sesión).
3. En el menú lateral: **Workers & Pages** → botón **Create** → pestaña **Pages** → **Upload assets** (subir archivos directamente).
4. Ponle un nombre al proyecto, por ejemplo **elichin**.
5. **Arrastra la carpeta `elichin`** a la zona de subida (o pulsa para seleccionarla). Cloudflare tomará el contenido de la carpeta como raíz del sitio: `index.html` debe quedar en la raíz.
6. Pulsa **Deploy**. En unos segundos te dará una dirección como **`https://elichin.pages.dev`**.

## Instalarla en el móvil

- Abre esa dirección en el navegador del teléfono.
- **Android (Chrome):** menú ⋮ → *Añadir a la pantalla de inicio* / *Instalar app*.
- **iPhone (Safari):** botón *Compartir* → *Añadir a pantalla de inicio*.

Quedará con su icono (el sello de bronce) y se abrirá a pantalla completa, como una app.

## Actualizar la app más adelante

Cuando tengas una versión nueva (por ejemplo, cuando se incorpore el texto literal de Legge), vuelve al proyecto en Cloudflare → **Create new deployment** → arrastra la carpeta actualizada. La dirección se mantiene.

> Nota técnica menor: el `service-worker.js` cachea la versión `elichin-v1`. Si actualizas archivos y el navegador muestra la versión vieja, basta con cambiar `elichin-v1` por `elichin-v2` en ese archivo antes de volver a subir; así se refresca la caché.

## Alternativa (si prefieres Git)

Si algún día usas un repositorio (GitHub), en Cloudflare Pages elige **Connect to Git** en vez de *Upload assets*. Configuración de compilación: **Framework preset: None**, **Build command: (vacío)**, **Build output directory: `/`** (la raíz). No hay nada que compilar: son archivos estáticos.
