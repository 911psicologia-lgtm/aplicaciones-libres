Aero · Fase 59.1 · Carga inicial corregida

Corrección del problema reportado:
- La página cargaba como HTML sin estilos: HUD en lista, fondo blanco y botones sin diseño.
- Esto suele ocurrir cuando Cloudflare no encuentra css/styles.css o js/main.js, o cuando se sube una estructura de carpeta que deja rutas relativas incompletas.

Solución aplicada:
- index.html ahora incluye CSS embebido.
- index.html ahora incluye los scripts principales embebidos en orden correcto:
  1. character-expansion.js
  2. worlds-2-5-assets.js
  3. world-backgrounds-2-5.js
  4. world1-enemies.js
  5. story-core-assets.js
  6. main.js
- También se entrega como ZIP plano: index.html queda en la raíz del ZIP, no dentro de una carpeta envolvente.

Cómo subir a Cloudflare:
- Sube el contenido de este ZIP directamente.
- Debe quedar index.html en la raíz del deployment.
- No subir solo el HTML; conservar la carpeta assets porque las imágenes siguen cargándose desde assets/.
- Esta versión evita la pantalla blanca sin estilos aunque haya problema con css/js externos.

Validación:
- js/main.js validado con node --check.
- Base premium F59 conservada.
