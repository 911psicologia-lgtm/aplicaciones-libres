# v4.10.3 · Carretera principal SVG sinuosa

Corrección:
- El ajuste del ramal interno funcionó, pero la carretera principal quedó visualmente lineal por los pseudo-elementos antiguos.
- Se añadió `drawMainRoad()` para que la carretera principal también se dibuje con SVG, midiendo las paradas reales.
- Se desactivaron `::before` y `::after` de `.bus-road-command-list` para evitar la carretera vertical heredada.
- La carretera principal se recalcula tras render y al redimensionar pantalla.
- No se tocó la lógica de mundos, lecciones ni progreso.
