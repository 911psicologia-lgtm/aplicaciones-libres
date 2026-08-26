# Rizoma Zombie Strike v2.8.3 — Sistema frontal global

Base: v2.8.2.

## Objetivo
Cerrar la progresión del sistema de amenazas pseudo-3D originalmente prevista para toda la campaña, sin crear assets nuevos cuando los ya existentes son adecuados.

## Progresión aplicada
- **M1**: conserva la puesta en escena reimaginada y su director propio.
- **M2–M4**: amenazas aisladas, meteoritos, fragmentos y restos; cazas solo en fases tardías. Límites más bajos para evitar saturación.
- **M5–M8**: grupos de fragmentos, cápsulas y cazas frontales; élites raras al cierre.
- **M9–M14**: combinaciones simultáneas, cazas, cápsulas, élites y conversión fondo → plano 2D con mayor presupuesto del director.
- **M15**: conserva amenazas orgánicas exclusivas (tejido, quistes, parásitos, centinelas inmunitarios).

## Integración 2D
Las naves frontales supervivientes ya no se convierten siempre en un enemigo genérico. El sistema utiliza una unidad válida de la familia del **mundo actual**, conservando HP restante y bonus de entrada frontal.

## Rendimiento
- M2–M4: 1 amenaza simultánea en móvil y 2 en escritorio/tablet (M1 conserva su calibración especial).
- M5–M8: 2 en móvil/tablet y 3 en PC.
- M9–M15: 2 en móvil, 3 en tablet y hasta 4 en PC.
- Pooling existente preservado.

## Reglas preservadas
- Colisión física únicamente en primer plano.
- Telegraph, near miss, disparos y premios.
- No se ejecuta durante Guardianes ni cuando el mundo ya terminó.
- M1–M15, música, tienda, guardado y progresión no se reescriben.
