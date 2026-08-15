# TRAS · Cambios v0.16.17 — 4 prompts, Centro de informes despejado

## 1. Solo quedan 4 prompts en toda la app
Se retiró el botón "Generar con IA manual" de la Matriz Cognitivo-
Atencional (paso 12) — era el sexto botón redundante, ya cubierto por
"Generar todo con un solo prompt" desde v0.16.16. Ahora el conjunto
completo y definitivo es:

1. **HC** (paso 3) — organiza la historia clínica.
2. **Entrevista** (paso 5) — transcribe la entrevista TRAS.
3. **Generar todo con un solo prompt** (paso 8) — HC narrativa, TRAS,
   Goldstein, Matriz Cognitivo-Atencional, personalidad e informe
   integrativo, todo en una sola respuesta.
4. **Devolución terapéutica adolescente** (paso 8) — documento aparte
   para el adolescente.

Simple y diáfano, como se pidió.

## 2. Centro de informes despejado
Antes, el paso 8 mostraba simultáneamente 14 cajones de texto (HC, TRAS,
Goldstein, 7 campos del integrativo, personalidad, Matriz, anexos) más
la configuración de la devolución adolescente — demasiada información a
la vez, con riesgo real de confusión o de editar el campo equivocado.

Reorganización (sin quitar ninguna función, solo visibilidad):
- **Siempre visible:** intro, botón del paquete completo, checklist de
  cierre, y la tarjeta de devolución adolescente (es un producto aparte,
  con su propio flujo, por eso se queda a la vista).
- **Colapsado por defecto** en "Edición manual detallada": las tarjetas
  de HC, TRAS, Goldstein e informe integrativo — siguen ahí, completas y
  funcionales, para cuando se quiera ajustar algo a mano, pero no ocupan
  pantalla si no se necesitan.
- **Colapsado por defecto** también "Perfil descriptivo y evaluaciones
  complementarias" (antes estaba abierto de entrada).
- **Siempre visible:** el selector de tipo de informe + destinatario +
  formato, con vista previa y exportación — es lo que se pidió mantener.

## 3. Política a partir de ahora
El usuario pidió que el caso demo se actualice siempre que un cambio lo
amerite. Este cambio (retirar un botón y reorganizar visibilidad) no
modifica ningún dato ni estructura del caso demo, así que no requirió
tocar `demo.js` — se revisó y se confirma que sigue siendo coherente.

## Verificación
- Balance de etiquetas HTML correcto (incluida la corrección de un
  `<article>` que se rompió a mitad de la edición y se detectó por el
  propio chequeo de balance antes de continuar).
- `node --check` sin errores en los 22 `.js`.
- Cero IDs duplicados.
- Búsqueda exhaustiva: cero botones restantes hacia el flujo `matriz_ca`.

## Soporte
- `APP_VERSION` → `v0.16.17`; `sw.js` → caché `tras-v0.16.17`.
