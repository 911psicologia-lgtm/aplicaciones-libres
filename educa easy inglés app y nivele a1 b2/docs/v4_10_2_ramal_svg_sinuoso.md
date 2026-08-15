# v4.10.2 · Ramal interno SVG sinuoso real

Cambios:
- Se conserva la carretera principal sin tocarla.
- En el panel de mundo seleccionado, las estaciones internas se organizan en dos columnas reales.
- `branch-left` queda en columna izquierda y `branch-right` en columna derecha.
- `branch-center` ocupa el ancho completo para hito conversacional y evaluaciones.
- Se añade `drawBranchRoad()` para trazar un SVG sinuoso detrás de las estaciones según su posición real.
- Se desactivan las carreteras antiguas hechas con `::before`/`::after` para evitar conflictos.
- El trazado se recalcula tras el render y al redimensionar la ventana.
