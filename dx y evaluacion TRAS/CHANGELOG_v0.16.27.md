# TRAS · Cambios v0.16.27 — Informe de lectura rápida

## Qué se agregó
Nueva opción "Lectura rápida (resumen)" en el selector de tipo de
informe, junto al integrativo. Convive con el informe completo, no lo
reemplaza — es exactamente el criterio acordado:

- **Comprensión del caso en dos minutos** (la síntesis integradora, no un
  recorte proporcional de todo).
- **Hallazgos convergentes.**
- **Recomendaciones prioritarias.**

Deliberadamente **no** incluye: desglose por las 19 áreas del TRAS,
tablas de Goldstein/Matriz, ni la aproximación diagnóstica completa —
cierra con una nota explícita remitiendo al "Informe integrativo" para
ese detalle.

`buildResumenReportV0164()` reutiliza toda la infraestructura ya
construida (`reportDocumentShellV0164`, audiencia, exportación a
HTML/Word/PDF con el arreglo de contraste de la versión anterior).

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- **Prueba funcional real** con datos simulados: confirmé que incluye
  síntesis, hallazgos y recomendaciones, que NO incluye el desglose por
  áreas, y que sí incluye la nota de remisión al informe completo.

## Soporte
- `APP_VERSION` → `v0.16.27`; `sw.js` → caché `tras-v0.16.27`.
