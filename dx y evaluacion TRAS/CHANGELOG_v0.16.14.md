# TRAS · Cambios v0.16.14 — auditoría y caso demo completamente nuevo

## Auditoría realizada
Busqué en todo el proyecto (`.js`, `.html`, `.md`) cualquier residuo del
caso real original (Eric Samuel Taboada) y no encontré ninguno — ya se
había limpiado correctamente en la sesión donde se creó la Matriz
Cognitivo-Atencional.

**Lo que sí encontré:** dos archivos huérfanos en `ejemplos/` —
`Informe_Goldstein_v0.16.5_demo.html` y
`Devolucion_terapeutica_v0.16.6_demo.html` — eran exportaciones estáticas
de versiones viejas de la app que todavía mostraban los datos del caso
demo anterior ("Mateo R."). Nada del proyecto los referenciaba (ni
`README.md`, ni `index.html`, ni ningún `.js`); eran clutter desactualizado
que no se regenera solo. **Los eliminé.**

## Caso demo reemplazado por completo
`js/demo.js` ya no contiene el caso "Mateo R.". El nuevo personaje
ficticio es **Valentina Ospina (caso ficticio)**, 14 años, con una
narrativa distinta (ansiedad académica y ruptura de un grupo de amigas
por un rumor en redes sociales — no separación parental como antes), para
que quede claro que es un caso nuevo y no una variación del anterior.

Se reescribieron con contenido nuevo y coherente entre sí:
- **HC completa** (motivo, evento, familia, escolar, síntomas, recursos,
  objetivo, resumen).
- **36 respuestas del TRAS** en 8 áreas núcleo (compañeros, colegio/
  profesores, amigos, comportamiento social, comportamiento familiar,
  autoconcepto, madurez percibida, acoso) + la subescala complementaria
  "indicador de conflicto" (`comp_04`).
- **9 interpretaciones por área**, con dos en formato estructurado
  (qué dice / qué sucede / qué se sugiere).
- **Goldstein completo** (50/50 ítems): fuerte en habilidades básicas y
  alternativas a la agresión; débil específicamente en afrontamiento del
  estrés social (responder a una acusación, tolerar el fracaso, resolver
  la vergüenza) — coherente con el rumor que originó el caso.
- **Matriz Cognitivo-Atencional completa** (86/86 ítems): 90 % cognitivo
  global (100 % verbal/lógico/cuantitativo, 67-83 % memoria/atención),
  regulación emocional con la carga más alta del submódulo, fortaleza
  dominante en inteligencia musical (coherente con su participación en
  el coro).
- **Perfil de personalidad** (6 dimensiones + síntesis).
- **Informe integrativo completo** (hallazgos convergentes, recursos,
  vulnerabilidades, límites, síntesis para padres, recomendaciones,
  cierre).
- **Anexo pegado nuevo**: observación escolar breve (reemplaza el anexo
  de Machover del caso anterior).

## Verificación
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- Búsqueda exhaustiva de "Mateo" en todo el proyecto: cero resultados en
  código; solo queda mencionado en changelogs históricos (`CHANGELOG_
  v0.16.12.md` y anteriores), que no se reescriben porque documentan lo
  que era cierto en su momento.
- **Puntajes recalculados y confirmados en Node** contra los datos reales
  del nuevo `DEMO_MATRIZCA` y `DEMO_GOLDSTEIN`: coinciden exactamente con
  lo descrito arriba (90 % cognitivo, perfil atencional, ranking de
  inteligencias, 50/50 en Goldstein).

## Soporte
- `APP_VERSION` → `v0.16.14`; `sw.js` → caché `tras-v0.16.14`.
