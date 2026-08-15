# TRAS · Cambios v0.16.18

## 1. Botón de guardado manual (ícono de disquete)
Nuevo ícono flotante arriba, junto a Instalar y Actualizar: `#appSaveButton`,
ícono universal de disquete. Llama a `manualSaveNow()`, que sincroniza los
campos visibles, guarda el caso y muestra confirmación (toast + un breve
destello verde en el ícono). Es un guardado explícito y con confirmación
inmediata — el autoguardado cada ~2 minutos sigue funcionando igual,
esto es un complemento para cuando el profesional quiere asegurarse antes
de cerrar la pestaña.

## 2. Etiquetas de texto bajo cada ícono
Los tres íconos (Guardar, Instalar, Actualizar) ahora tienen una pequeña
etiqueta de texto debajo, visible solo cuando el ícono está visible (se
implementó con el combinador de hermano adyacente CSS `+`, sin depender
de `:has()` para máxima compatibilidad). El de Guardar queda siempre
visible sin titilar (no tiene sentido que parpadee un botón de uso
rutinario); Instalar y Actualizar conservan el titileo, porque ese sí
señala una acción disponible puntual.

## 3. Validación automática al pegar o cargar el JSON
Antes había que pegar el JSON y luego pulsar "Validar e insertar" para
enterarse si estaba bien. Ahora:
- Al usar "Pegar del portapapeles", al cargar un archivo `.json`, o al
  pegar directamente con Ctrl+V en el cajón, se valida automáticamente
  y aparece de inmediato: **"JSON válido — puedes insertarlo en el
  caso"**, o el error correspondiente.
- Si el JSON tiene un error de sintaxis, además del mensaje de error se
  instruye explícitamente: *"Vuelve a la IA y pide: 'Corrige la sintaxis
  y devuelve solamente un objeto JSON válido, sin explicaciones ni
  backticks'"*.
- Si el JSON es sintácticamente válido pero le faltan claves obligatorias,
  ahora también instruye qué pedirle a la IA para completarlas (antes
  solo decía qué faltaba, sin indicar qué hacer).
- Todo esto ocurre **antes** de que el contenido se aplique al caso — la
  inserción real sigue revalidando internamente como salvaguarda.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto, cero IDs duplicados.

## Soporte
- `APP_VERSION` → `v0.16.18`; `sw.js` → caché `tras-v0.16.18`.
