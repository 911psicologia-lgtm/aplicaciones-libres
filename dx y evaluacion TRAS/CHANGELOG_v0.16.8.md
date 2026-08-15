# TRAS · Cambios v0.16.8 — DSEBI APP-360, mejoras aprobadas

Resultado de la auditoría DSEBI APP-360 (diagnóstico, benchmarking contra
SimplePractice/TherapyNotes/BANEDI, y tabla de mejoras). El usuario aprobó
"todas las mejoras"; se implementaron todas salvo la sincronización
multi-dispositivo, que se explica abajo por qué no.

## A. Imprescindibles
1. **Menú reorganizado.** El antiguo "Gestión y respaldo" se separó en
   `configPanelCase` ("Caso actual", abierto por defecto: guardar,
   importar/actualizar caso, exportar JSON/PDF) y `configPanelApp`
   ("Aplicación completa y datos", cerrado por defecto, con estilo visual
   de zona de riesgo) que agrupa el respaldo de toda la app, el cifrado
   local y el borrado total. Objetivo: bajar el riesgo de clic accidental
   en una acción destructiva.
2. **Splash con objetivo/CTA.** Se añadió una frase explícita indicando
   qué hacer primero ("elige Nuevo caso... o abre un caso guardado").

## B. Alto valor
3. **Checklist de cierre** (`reportChecklistItems`, `renderReportChecklist`
   en `export.js`, enganchado dentro de `renderReport()`): muestra en el
   centro de informes cuántos de los productos obligatorios (HC, TRAS,
   Goldstein, integrativo) y opcionales (devolución adolescente) están
   listos. Es informativo, nunca bloquea la exportación de un documento
   parcial.
4. **Cifrado local opcional** (`js/encryption.js`, nuevo módulo, AES-GCM
   256 + PBKDF2 con Web Crypto nativo, sin librerías externas):
   - Se activa/desactiva desde "Aplicación completa y datos" →
     "Activar/Desactivar cifrado local", con frase clave elegida por el
     profesional. Sin esa frase, los datos cifrados no se pueden
     recuperar (se advierte explícitamente antes de activar).
   - Diseño de mínimo riesgo: `persist()` (usado en ~40 lugares del
     código) sigue escribiendo texto plano exactamente igual que antes;
     un temporizador con antirrebote de 400 ms reemplaza esa copia por
     un sobre cifrado poco después. **Limitación real y declarada:**
     existe una ventana breve en texto plano inmediatamente después de
     cada guardado; no es cifrado instantáneo perfecto.
   - Al abrir la app con datos cifrados, se pide la frase clave
     (`unlockLocalEncryption`) antes de cargar el estado (`initApp` en
     `app.js` es ahora `async`). Si la frase falla o se cancela, la app
     arranca con un expediente en blanco de esa sesión, pero **nunca
     borra ni sobrescribe** el sobre cifrado: los datos siguen intactos
     y se puede reintentar recargando.
   - Verificado con Node (`crypto.webcrypto`): cifra, descifra
     correctamente con la frase correcta y rechaza una frase incorrecta.

## C. Opcionales/evolutivas
5. **Exportar informe en PDF** (`exportCasePdf`, `printHtmlAsPdf` en
   `export.js`): usa el diálogo de impresión nativo del navegador sobre
   un iframe oculto (sin dependencias externas, funciona sin conexión).
   El usuario elige "Guardar como PDF" como destino; se comunica así,
   sin prometer un archivo PDF generado automáticamente.
6. **OCR de imágenes para la HC** (`extractImageTextOcr`,
   `ensureScriptLoaded` en `v0164.js`): el cargador de fuentes de la
   historia clínica ahora acepta fotos/escaneos (jpg/png/webp) y usa
   Tesseract.js, cargado desde CDN solo cuando se usa por primera vez
   (no penaliza el arranque de la app).
7. **Sincronización multi-dispositivo: NO implementada.** Requiere una
   decisión de arquitectura (backend, costos, dónde vive el dato) que
   además tensiona el modelo "sin servidor propio" que sostiene hoy la
   privacidad del dato clínico de un menor. No es una decisión que deba
   tomar unilateralmente editando código; queda pendiente de una
   conversación específica si se quiere retomar.

## Soporte
- `APP_VERSION` → `v0.16.8`; `sw.js` → caché `tras-v0.16.8`, incluye
  `js/encryption.js`.
- Verificación final: balance de etiquetas HTML (div/details/section/
  article) correcto, `node --check` sin errores en los 20 archivos `.js`,
  y prueba funcional del cifrado con `crypto.webcrypto` de Node.
