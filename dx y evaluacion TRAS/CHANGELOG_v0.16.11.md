# TRAS · Cambios v0.16.11 — la Matriz se elige al inicio y reorganiza la ruta

Corrección de arquitectura pedida por el usuario: la Matriz Cognitivo-
Atencional deja de vivir escondida dentro de un acordeón en el Centro de
informes. Ahora se elige igual que TRAS/Goldstein, en el momento de crear
o configurar el caso, y aparece como **su propio paso**, después de
Goldstein.

## Qué cambió
1. **Modal de nuevo caso** (`index.html`): se agregó un checkbox
   "Incluir también la Matriz Cognitivo-Atencional" debajo de las 4
   opciones de alcance existentes (TRAS / Habilidades / Ambos / Solo HC).
   Es independiente del alcance elegido: se puede combinar con cualquiera
   de las 4 opciones.
2. **Selector de alcance persistente** (`renderScopeSelectorV0164`): se
   agregó un quinto chip, `+ Matriz Cognitivo-Atencional`, que puede
   activarse o desactivarse en cualquier momento del caso (no solo al
   crearlo) mediante `toggleMatrizCaModule()`.
3. **Nuevo paso 12** (`<section id="step-12">` en `index.html`): la Matriz
   ya no comparte espacio con el perfil de personalidad; tiene su propia
   pantalla, con el mismo estilo que el paso 9 (Goldstein).
4. **Ruta clínica reordenada** (`clinicalStepOrder()` en `v0164.js`): el
   paso 12 se inserta automáticamente después del 9 (Goldstein) y antes
   del 8 (Informe) **solo cuando `c.modules.matrizCA` está activo** —
   verificado con una prueba en Node que reproduce la función completa:
   con la matriz activa, aparece siempre entre Goldstein y el informe, sin
   importar el alcance (TRAS, Habilidades o Ambos); sin ella, la ruta
   vuelve a ser exactamente la de antes.
5. **Navegación e íconos**: `steps` (dataset.js) y `STEP_ICONS` (ui.js)
   incluyen la entrada del paso 12; `renderTopNav`, `goStep` y
   `continueClinical` ya eran genéricos sobre el arreglo de orden, así que
   solo necesitaron el enganche de render (`renderMatrizCA()`) en los
   puntos donde ya se llamaba a `renderGoldstein()`.
6. Se eliminó el bloque duplicado que había quedado dentro del acordeón
   "Perfil descriptivo y evaluaciones complementarias" (tenía un
   `id="matrizCABody"` repetido, lo cual rompía `getElementById` — bug
   real que se corrigió aquí).
7. Limpieza menor: el checkbox interno "Aplicar esta matriz" ahora usa una
   función nombrada (`setMatrizCaApplied`) en vez de una función anónima
   en línea, igual al patrón de `setGoldsteinApplied`.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto (13 `<section>`, antes 12).
- **Cero IDs duplicados** en todo `index.html` (se confirmó con una
  búsqueda exhaustiva).
- `clinicalStepOrder()` probado en Node con y sin la matriz activa, y en
  los tres alcances (tras/habilidades/ambos): el paso 12 aparece siempre
  en la posición correcta o no aparece en absoluto, sin excepciones.

## Soporte
- `APP_VERSION` → `v0.16.11`; `sw.js` → caché `tras-v0.16.11`.
