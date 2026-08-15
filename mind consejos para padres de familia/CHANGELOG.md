# Puentes v1.11.0

Fecha: 26 de julio de 2026

## Compartir tarjeta

- El uso compartido nativo en dispositivos compatibles envía **únicamente el archivo PNG** mediante `navigator.share({ files: [file] })`.
- El flujo principal ya no agrega `title`, `text` ni `url` cuando comparte la imagen.
- Cancelar el panel nativo no registra la tarjeta como compartida y permite volver a intentarlo inmediatamente.
- Cuando el navegador no admite compartir archivos se ofrecen acciones separadas y explícitas: **Guardar imagen**, **Copiar mensaje** y **Compartir solo texto**.
- Ningún flujo de respaldo copia texto automáticamente.
- En computador, al elegir WhatsApp Web, Telegram, Instagram, Facebook, TikTok o X, Puentes descarga la imagen, abre la plataforma sin texto prellenado y muestra: “La imagen quedó en Descargas. Adjunta la tarjeta en la plataforma elegida.”

## Reproductor continuo

- El reproductor trabaja con una cola ordenada de tarjetas y conserva la voz y la velocidad seleccionadas.
- Las colas se construyen según el origen: resultados, biblioteca visible y filtrada, categoría y etapa, favoritas, tarjetas creadas con IA y compartidas.
- Al terminar una tarjeta, avanza automáticamente a la siguiente; al finalizar la cola se detiene sin volver al inicio.
- **Anterior** y **Siguiente** cancelan la utterance actual, cambian de tarjeta y continúan leyendo cuando el reproductor estaba activo.
- Salir de la vista de resultados cancela la síntesis de voz, restablece reproducción, pausa y fragmento, y conserva la cola para la navegación actual.
- El indicador compacto muestra la posición, por ejemplo `1/3`, `2/3` o `6/20`, sin añadir una segunda barra de controles.

## Lectura por fragmentos

Cada tarjeta se procesa, cuando el contenido existe, en este orden:

1. título;
2. explicación;
3. acción precedida por “Para probar en familia”;
4. pregunta precedida por “Una pregunta para conversar”;
5. cierre.

La lectura funciona con 1×, 1,5×, 1,8× y 2×. Cambiar voz o velocidad durante la reproducción reinicia únicamente el fragmento actual y conserva la posición de la cola.

## Estabilidad

- Se añadieron tokens de control y una finalización única por utterance para evitar dobles avances ante `onend`, `onerror`, cancelaciones o cambios rápidos.
- La ausencia inicial de voces no bloquea la lectura; se usa `es-CO` hasta que el dispositivo publique sus voces.
- Los errores de un fragmento permiten continuar con el siguiente.
- Se controlan tarjetas sin cierre, colas vacías y eliminación de una favorita durante la reproducción.
- El registro del Service Worker tolera entornos que bloqueen o no devuelvan una instancia de registro.
- Se reforzó la prevención de desbordamiento horizontal en 390 × 844.

## Versión y PWA

- Versión visible: **Puentes v1.11**.
- `APP_VERSION`: `1.11.0`.
- `app.js?v=1.11.0`.
- `styles.css?v=1.11.0`.
- `manifest.webmanifest?v=1.11.0`.
- Caché: `puentes-v1.11.0`.
- El Service Worker elimina cachés anteriores durante `activate`.
- Se conservaron los botones **Actualizar** e **Instalar app**.

## Validación ejecutada

- 48 comprobaciones automatizadas aprobadas.
- 0 errores JavaScript registrados en consola durante las suites móvil, escritorio, PWA y resiliencia.
- Perfil móvil: 390 × 844 con agente Android y APIs controladas de Web Share y Speech Synthesis.
- Navegador: Chromium 144.0.7559.96.
- La recepción dentro de la aplicación WhatsApp en un teléfono físico no pudo ejecutarse en este entorno; sí se verificó que el payload entregado al sistema contiene exclusivamente `files` y un PNG, sin `title`, `text` ni `url`.

## No incluido en v1.11

Se mantienen para una versión posterior: edición compleja de tarjetas IA, detección semántica de duplicados, colecciones personalizadas, estadísticas y sincronización remota.

---

# Puentes v1.10.0

## Instalación PWA

- Nuevo botón visible **Instalar app** en la cabecera.
- En navegadores compatibles usa el evento `beforeinstallprompt` y abre el instalador nativo.
- Al completarse la instalación, el botón se oculta mediante `appinstalled` o modo `standalone`.
- En iPhone/iPad, Android o navegadores sin instalador automático muestra pasos breves adaptados al dispositivo.
- El botón **Actualizar** se conserva separado para evitar confundir instalación con cambio de versión.

## Auditoría DSEBI

- Se añadió la auditoría DSEBI correspondiente a la versión 1.10.

## Infraestructura

- `APP_VERSION` y caché PWA actualizados a 1.10.0.
