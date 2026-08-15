# TRAS · Cambios v0.16.23 — el TRAS ya tiene su propia síntesis integrada

## El problema que señalaste
Goldstein trae "Comprensión global del perfil" junto a su detalle; la
Matriz CA trae sus 4 bloques de lectura junto a sus tablas; Personalidad
trae su síntesis. El TRAS no — su síntesis ("patrones transversales")
vivía separada, dentro de la sección genérica "Informe clínico
consolidado de toda la evaluación", muy lejos de su propio desglose por
áreas. Tenías razón: era una inconsistencia real entre instrumentos.

## La corrección
- **"Interpretación integrada por áreas"** ahora abre con un bloque
  "Comprensión global del TRAS" (análisis consolidado propio del TRAS +
  patrones transversales) antes del desglose área por área — mismo
  patrón visual que ya usa Goldstein (`gold-executive`).
- Esa sección sigue exactamente donde ya estaba: **justo antes de
  "Habilidades sociales"**, como pediste.
- En la versión para colegio/docentes (donde el desglose completo por
  área se omite por privacidad), la síntesis global sigue apareciendo
  igual — antes esa versión no tenía ninguna lectura del TRAS, solo una
  nota diciendo "se resume en otro apartado" que en realidad no existía
  ahí. Ahora sí está.
- Se quitó la mención duplicada de "Patrones transversales" que quedaba
  en el informe consolidado general, ya que ahora vive en su lugar
  correcto y repetirla ahí era ruido.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.

## Soporte
- `APP_VERSION` → `v0.16.23`; `sw.js` → caché `tras-v0.16.23`.
