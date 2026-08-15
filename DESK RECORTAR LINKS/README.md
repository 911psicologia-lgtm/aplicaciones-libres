# RizoLink

**RizoLink** es una app web multiarchivo para crear rutas breves, memorables y escaneables a partir de enlaces largos. La primera versión funciona en modo local y deja lista la arquitectura para conectarse luego a un backend público.

## Qué incluye

- Interfaz premium con tarjetas tipo vidrio, sombras suaves, fondo con degradados y microinteracciones.
- Creación de enlaces con título, URL larga, alias personalizado, categoría y nota interna.
- Biblioteca local de enlaces usando `localStorage`.
- Enlaces prioritarios con pulso visual elegante y neón controlado.
- Generación de QR descargable.
- Edición de título, destino, alias, categoría, nota, prioridad y vista de confianza.
- Exportación/importación de backup JSON.
- Modo claro/oscuro.
- Carpeta `worker` con backend base para Cloudflare Workers + KV.

## Importante

La app funciona localmente, pero los enlaces tipo `#r/alias` dependen de la biblioteca guardada en el navegador donde se crearon. Para que los enlaces cortos sean públicos y funcionen para cualquier persona, hay que desplegar el backend incluido en `worker/worker.js` o implementar una API equivalente.

## Estructura

```text
rizolink_app/
  index.html
  manifest.webmanifest
  css/
    base.css
    components.css
    layout.css
  js/
    app.js
    helpers.js
    links.js
    qr.js
    storage.js
    ui.js
  worker/
    worker.js
    wrangler.toml.example
```

## Uso local

Abre `index.html` en el navegador. Para mejores resultados, sirve la carpeta con un servidor local:

```bash
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

## Despliegue futuro recomendado

1. Subir el frontend a Cloudflare Pages.
2. Crear un Cloudflare KV namespace.
3. Desplegar `worker/worker.js` como Cloudflare Worker.
4. Configurar `ADMIN_KEY` y el binding `RIZOLINK_KV`.
5. Conectar la app al dominio público del Worker desde Ajustes.

## Nombre conceptual

RizoLink no se limita a acortar enlaces: organiza accesos digitales, crea rutas memorables, genera QR y permite pensar cada enlace como un nodo claro dentro de una red de uso.
