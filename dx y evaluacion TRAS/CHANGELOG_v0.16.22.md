# TRAS · Cambios v0.16.22 — correcciones a partir del caso real de Eric

Cuatro pedidos, todos analizados con evidencia (los dos HTML exportados
que se subieron) antes de tocar código, tal como se pidió.

## 1. Bug corregido: el perfil de personalidad no se generaba
**Causa raíz confirmada**: el prompt del paquete completo mostraba un
solo ejemplo de ID válido (`"conducta"`) sin listar los otros 8. La IA
inventaba sus propios IDs para el resto y el filtro de la aplicación los
descartaba todos en silencio. Corregido: el prompt ahora enumera
explícitamente los 9 IDs válidos (`conducta, enojo, familia, escolar,
animo, social, autoconcepto, proyecto, cambio`) — verificado que
coinciden exactamente con `PERS_DIMENSIONES` en `personalidad.js`.

## 2. Nueva sección: "Aproximación diagnóstica provisional"
Modelada sobre el documento de referencia que se adjuntó. Estructura
exigida al prompt (250–450 palabras): aproximación clínica general →
un párrafo por dominio con datos suficientes → formulación diagnóstica
provisional (puede nombrar TDA/TDAH u otras condiciones como hipótesis
a explorar, nunca como diagnóstico cerrado) → qué se necesitaría para
confirmar. Se agregó a `informeState`, al `apply()` del paquete
completo, a un textarea manual nuevo en la tarjeta del informe
integrativo, y como sección propia de `buildReportHtml`.

## 3. Diferenciación real por audiencia (antes solo cambiaba una etiqueta)
`buildReportHtml`, `goldsteinReportSection` y `matrizCaReportSection`
ahora reciben `audience` y lo usan de verdad:

| | Padres/cuidadores | Colegio (docentes + psicología escolar) | Profesionales |
|---|---|---|---|
| Tablas numéricas (Goldstein, Matriz CA) | No | Sí | Sí |
| Aproximación diagnóstica | No | Sí | Sí |
| Desglose narrativo completo por las 19 áreas del TRAS | Sí | No (resumen; se reserva el detalle íntimo familiar) | Sí |

La etiqueta "Docentes" se renombró a "Colegio (docentes y psicología
escolar)" para reflejar que, según se explicó, la psicóloga escolar
siempre revisa este documento — de ahí que sea híbrido y no una versión
simplificada.

## 4. Bug corregido: alias desactualizado en la devolución adolescente
Se descartó la hipótesis de caso duplicado (se confirmó que Eric se creó
desde cero). La causa exacta no quedó 100% aislada sin poder reproducir
el flujo completo, así que se aplicó una corrección robusta que la
resuelve sin importar el origen: el alias ahora se resincroniza con
`c.meta.nombre` en cada acceso, salvo que el profesional lo haya editado
a mano (`_aliasManual`). Si se borra el campo a mano, vuelve a
autoderivarse del nombre del caso en vez de quedar congelado en blanco.

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto, cero IDs duplicados.
- **Prueba funcional real** del arreglo del alias (Node): caso recién
  creado con nombre vacío → alias vacío (no se congela); se llena el
  nombre real → el alias se actualiza solo; si se edita a mano, se
  respeta aunque cambie el nombre del caso.
- Confirmado que los 9 IDs del prompt coinciden exactamente con
  `PERS_DIMENSIONES`.
- Confirmada la lógica de audiencia línea por línea: familias sin
  tablas/sin aproximación dx, docentes con ambas pero sin detalle íntimo
  por área, profesionales con todo.

## Soporte
- `APP_VERSION` → `v0.16.22`; `sw.js` → caché `tras-v0.16.22`.
