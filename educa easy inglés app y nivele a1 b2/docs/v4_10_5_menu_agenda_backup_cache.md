# v4.10.5 · Menú agenda/backup + anti-caché

Corrección:
- La versión v4.10.4 empaquetada no contenía los cambios JS del menú hamburguesa.
- Se agrega correctamente:
  - 🗓️ Agenda tus clases
  - 💾 Exportar backup JSON
  - 📥 Cargar backup
- Se actualiza APP_VERSION a 4.10.5.
- Se agrega cache busting en index.html para app.js/app.css/manifest.
- Se cambia CACHE_NAME del service worker a ingles-dummies-v4-10-5.
- El service worker usa network-first para app.js, app.css, index.html y manifest.json para evitar JS viejo después de desplegar.
