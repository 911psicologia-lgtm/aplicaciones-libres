# TRAS · Cambios v0.16.20 — TRAS resumido (38 ítems, ciclos C+D)

Implementado tal como se confirmó: dos versiones del TRAS, ambas
narrativas/abiertas (ningún ítem se convirtió en opción cerrada).

## Qué se agregó
- **`c.trasMode`**: `'extenso'` (por defecto, 76 ítems núcleo) o
  `'resumido'` (38 ítems núcleo: ciclos C y D de las 19 áreas — "lo que
  menos agrada" / "lo que más agrada").
- **Elegible al crear el caso**: en el asistente de nuevo caso, junto al
  alcance y la Matriz, ahora hay un selector "Extensa / Resumida".
- **Alternable durante el caso**: nuevo chip en el selector de alcance
  ("TRAS extenso" / "✓ TRAS resumido"). Si ya hay respuestas en ciclos A/B
  y se activa el modo resumido, se advierte antes de continuar — **nada
  se borra**, solo dejan de mostrarse en la entrevista lineal mientras el
  modo esté activo.
- **`flattenedItems()`** (el listado que arma la entrevista, paso 5) filtra
  los ítems núcleo por `TRAS_RESUMIDO_CICLOS = ['C', 'D']` cuando el modo
  es resumido. Las subescalas complementarias no se filtran.
- **La revisión (paso 6) y el informe siguen mostrando todo lo que exista**
  — el filtro solo afecta qué se *pide* en la entrevista, no qué se puede
  *ver* después.
- **Prompts**: el flujo `entrevista` ya usaba `flattenedItems()`, así que
  automáticamente solo transcribe los ítems activos del modo — cero
  cambios adicionales ahí. En el flujo `informe` (integrativo) y en
  `paquete_informes` se agregó `tras.modo_aplicacion` al material y una
  instrucción explícita: si el modo es resumido, la IA debe mantener el
  mismo nivel de profundidad interpretativa que en el modo extenso, sin
  disculparse por la brevedad de los datos.
- **Trazabilidad**: el informe muestra "Núcleo TRAS · modo resumido
  (2 items/área)" en los instrumentos aplicados, para que quede
  registrado qué versión se usó.

## Hallazgo importante que debo señalar (no lo decidí yo, te lo informo)
Verificado con los datos reales del instrumento: de los **dos ítems
marcados `alerta_clinica: true`** en todo el TRAS, uno queda **fuera**
del modo resumido:
- Ítem 20 (área 1 — madre, ciclo **B**, *"Yo creo que mi madre podría
  cambiar en..."*) → **no aparece** en el modo resumido.
- Ítem 49 (área 11 — culpas, ciclo **C**, *"Cuando me pasa algo malo, a
  veces pienso que es culpa de..."*) → sí aparece (ciclo C).

No cambié el par C+D por esto — ya lo confirmaste — pero es un dato que
como autor del instrumento te corresponde valorar: si quieres que el
ítem 20 quede cubierto en el modo resumido, la opción más simple sería
sustituir el ciclo B por el D en el área 1 específicamente, o mantenerlo
así sabiendo que el modo resumido no cubre ese ítem de alerta en
particular.

## Verificación
- **Probado con los datos reales del `DATASET`** (no simulados): modo
  extenso = 76 ítems núcleo, modo resumido = 38, cobertura de las 19
  áreas confirmada en ambos modos, ciclos presentes en resumido = solo
  C y D.
- `node --check` sin errores en los 22 `.js`.
- Balance de etiquetas HTML correcto.
- Se corrigió un texto fijo ("Vista continua 76+ items") que ya no era
  exacto en modo resumido.

## Demo
El caso demo se revisó y se deja en modo `'extenso'` (el valor por
defecto) — no requería cambios para mantenerse coherente.

## Soporte
- `APP_VERSION` → `v0.16.20`; `sw.js` → caché `tras-v0.16.20`.
