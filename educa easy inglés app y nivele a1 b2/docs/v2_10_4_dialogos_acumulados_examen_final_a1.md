# v2.10.4 · Diálogos acumulados + Examen final A1-base

## Cambios principales
- 🎧 Diálogos animados ahora funciona como repaso acumulado:
  - reproduce M1 → último mundo desbloqueado/disponible;
  - no se queda solo en el módulo activo;
  - no usa M1 como fallback de error;
  - agrega separador visual y auditivo entre mundos: “Module X... New dialogue”.
- Se activó el 🎓 Examen final A1-base:
  - 45 ítems;
  - aprobación con 38/45;
  - 84% mínimo;
  - 3 intentos;
  - desbloquea A2 al aprobar.
- El examen final queda integrado al sistema existente de evaluaciones y registros.

## Archivos modificados
- app.js
- app.css
- content/content.v1.json
- manifest.json
- sw.js
- index.html

## Validación
- JS validado con node --check.
- JSON validado.
- No se tocaron microlecciones, videos, traducciones, diálogo animado ni progreso base.
