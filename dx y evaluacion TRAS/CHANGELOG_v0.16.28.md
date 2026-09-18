# TRAS · Cambios v0.16.28 — Modalidad TRAS persistente e importación segura

## Problema corregido
Los expedientes JSON antiguos podían no contener la modalidad de aplicación del TRAS. Al importarlos, la aplicación reconstruía el caso y asumía de hecho el recorrido extenso porque `trasMode` estaba ausente, sin pedir al profesional que confirmara Extensa (59 ítems) o Resumida (38 ítems).

## Cambios implementados

- La modalidad TRAS pasa a formar parte explícita y validada del expediente mediante `trasMode: "extenso" | "resumido"`.
- Se añade `trasModeConfigured` para diferenciar una modalidad realmente elegida de un valor de compatibilidad aplicado a un caso legado.
- `CASE_SCHEMA` aumenta de 3 a 4.
- Los JSON exportados preservan automáticamente modalidad y estado de confirmación.
- Al importar un JSON antiguo con TRAS y sin modalidad:
  - si existen respuestas A/B o más de 38 respuestas núcleo, se reconoce conservadoramente como Extensa;
  - cuando no es posible inferirla con seguridad, se abre un diálogo obligatorio para elegir Extensa o Resumida;
  - cancelar el diálogo no modifica ningún expediente.
- La fusión de expedientes ya no permite que un JSON legado sin modalidad sobrescriba silenciosamente una modalidad previamente configurada.
- Si un archivo importado y el expediente existente tienen modalidades diferentes, la aplicación advierte antes de resolver el conflicto.
- El selector del menú lateral se reorganiza en tres bloques: instrumentos principales, módulo adicional y modalidad TRAS.
- Extensa y Resumida se muestran simultáneamente como dos opciones explícitas; los casos legados muestran una advertencia visible hasta que el profesional confirme una modalidad.
- En el asistente de Nuevo caso, la elección de modalidad se mueve antes de los botones de alcance para hacerla visible antes de crear el expediente.
- La modalidad queda registrada en el historial interno del caso cuando se confirma, cambia, infiere o resuelve durante una importación.

## Compatibilidad
Los casos actuales siguen siendo compatibles. Los expedientes que ya traen `trasMode` se abren sin pasos adicionales. Los casos antiguos no pierden respuestas ni interpretaciones: únicamente quedan marcados como pendientes de confirmar cuando la modalidad no puede determinarse con seguridad.

## Versión técnica
- `APP_VERSION` → `v0.16.28`
- `CASE_SCHEMA` → `4`
- Caché PWA → `tras-v0.16.28`
