# 🔍 AUDITORÍA DSEBI TRIPLE — PequeWorld v8 → v9

**Metodología:** DSEBI (F4 plena) con **3 agentes en secuencia**: A1 Evaluador →
A2 Cuestionador (mandato: no puede concordar; ≥2 puntos ciegos) → A3 Integrador
(dictamen + priorización). **Modo antialucinación activo**: cada hallazgo se
clasifica como `observado` (verificado en el código o con pruebas ejecutadas),
`inferido` (deducción razonada) o `pendiente de verificación`.

**Fecha:** 2026-09-15 · **Base de auditoría:** código v8 real en
`/pequeworld` (15 módulos JS, 5 CSS, 79 mundos / 782 palabras / 90 insignias),
suite E2E v8 ejecutada como línea base (TODO VERDE, 0 errores JS).

---

## AGENTE A1 — EVALUADOR (10 dimensiones)

| # | Dimensión | Nota | Evidencia (observado salvo indicación) |
|---|-----------|------|----------------------------------------|
| 1 | **Funcionalidad real** | **ACEPTABLE** | E2E v8: 46 checks verdes ×2 pasadas, 0 errores JS (tour, ⚡Rápido, Oraciones, Rimas, hitos, puerta parental, informe, voz, dictado, 3 mundos nuevos). **Pero** la auditoría encontró 3 defectos funcionales que los tests no cubrían (ver A2). |
| 2 | **Coherencia con propósito** | **ÓPTIMO** | Primeras palabras en inglés con foto real: 79 mundos/782 palabras; flashcards antes de cada misión; TTS lento (rate 0.82); maestría 🌱→✅→🏆 a los 3 aciertos; repaso de errores priorizado; 0 anuncios/0 compras. |
| 3 | **Fidelidad identitaria** | **ÓPTIMO** | Cielo nocturno + oro + Baloo 2/Nunito **locales** (sin CDN), fotos reales verificadas, mascota búho, tono cálido sin presión de suscripción (lo que la competencia es más criticada por). |
| 4 | **Claridad de UX** | **ÓPTIMO** | Tour de 3 pasos la 1.ª vez + «¿Cómo funciona?»; 11 tarjetas de juego con subtítulos; meta diaria visible; feedback textual + audio; progreso «Pregunta x/10» siempre presente. |
| 5 | **Consistencia visual** | **ÓPTIMO** | 5 CSS con tokens compartidos (var(--gold), --muted…); clases `gz-*`/`ms-*`/`sent-*` homogéneas; riesgo menor de deriva por acumulación (inferido, no defecto actual). |
| 6 | **Accesibilidad básica** | **ACEPTABLE** | v8: zoom permitido, `prefers-reduced-motion`, `:focus-visible`, alt por defecto. **Faltan** (inferido): `aria-live` en la barra de feedback y verificación de contraste del oro sobre fondo oscuro (`pendiente de verificación`). |
| 7 | **Robustez técnica** | **ACEPTABLE** | Funciona en uso normal, pero A2 documentó 4 defectos latentes de borde (estado corrupto, UTC, nombre sin escapar, SW incompleto) → ver A2/A3. |
| 8 | **Calidad formativa** | **ACEPTABLE** | Doble codificación (foto+audio+texto), repetición espaciada simplificada, fonología (rimas/oraciones). **Salvedad grave de A2**: el juego de rimas podía premiar/punir de forma incorrecta (ver A2-1). |
| 9 | **Traducibilidad sin autor** | **ÓPTIMO** | README completo, auditorías v5/v7/v8, comentarios por módulo y por fix (`// v9 [C-1]`…), scripts de prueba reutilizables, estructura de 15 archivos plana y comprensible. |
| 10 | **Pertinencia contextual** | **ÓPTIMO** | 100 % local (localStorage), sin cuentas, privacidad declarada, consejos AAP en el informe, UI en español, funciona con doble clic (file://) y como PWA vía servidor local. |

**Veredicto A1:** producto sano y muy fiel a su propósito; los riesgos están en
casos de borde (robustez) y en un defecto pedagógico puntual que A1 no detectó
solo — pasa el turno a A2.

---

## AGENTE A2 — CUESTIONADOR (mandato cumplido: NO concuerda)

**Desafío global a A1:** tus ÓPTIMOS en dimensiones 1 y 8 se apoyan en tests
que reproducen el *camino feliz*. Los defectos reales viven fuera de ese
camino. Bajo tu propio criterio («funcionalidad real»), esas notas eran
optimistas. Puntos ciegos encontrados (todos `observado` con prueba):

1. **🔵 RIMAS CON DOS RESPUESTAS VÁLIDAS — defecto pedagógico grave.**
   El filtro de distractores comparaba solo las últimas 2 letras. Sondea
   (`v9_rhyme_probe.mjs`) sobre los datos reales: **3 de 9 pares** podían
   mostrar preguntas con otra opción que SÍ rima:
   - `bear–chair` → **Pear, Ear, Square, New Year**
   - `bee–tree` → **Monkey** («key»)
   - `train–rain` → **Airplane** («plane»)
   El niño tocaba una respuesta correcta y recibía ❌ + perdía una vida.
   A1 calificó «Calidad formativa» sin simular distractores.
2. **📅 EL «DÍA» DE LA APP NO ERA EL DÍA DEL NIÑO.** `todayStr()` usaba
   `toISOString()` (UTC). En Colombia (UTC-5): la meta diaria y la ruleta
   **se reiniciaban a las 19:00** (doble ruleta en una misma tarde, meta
   diaria reiniciada tras la cena) y el gráfico de actividad de 14 días
   asignaba las misiones nocturnas al día siguiente. Nadie lo ve probando a
   mediodía; verificado con reloj simulado 21:30 Bogotá → UTC decía día
   siguiente.
3. **🛟 PÉRDIDA TOTAL SILENCIOSA SI EL GUARDADO SE DAÑA.** Un JSON truncado
   (pestaña cerrada al escribir) → `loadState` fallaba en silencio →
   `defaultState()` y el primer `saveState()` **pisaba** el archivo roto:
   los perfiles de toda la familia, irrecuperables. A1 dijo «ACEPTABLE»
   para robustez; A2 la considera INSUFICIENTE para una app cuyo valor es
   el progreso acumulado del niño.
4. **📶 PWA OFFLINE INCOMPLETA.** El Service Worker cacheaba CSS/JS pero
   **no las fuentes woff2 ni los avatares**: el primer arranque sin
   conexión mostraba la app con otra tipografía y avatares emoji —
   contradice la «fidelidad identitaria ÓPTIMO» de A1 en modo offline.
   Además, sin bump de caché la entrega no llegaría limpia a instalaciones
   viejas.
5. **👥 TRANSFERENCIA DE XP ENTRE HERMANOS.** Cambiar de jugador con una
   misión activa dejaba `G.active=true`: al volver a «Jugar», las
   respuestas acreditaban XP/monedas/insignias **al perfil nuevo**.
   Relevante para el propósito (2+ niños por dispositivo).
6. **📚 DICCIONARIO = 4.700 nodos de golpe.** La vista «Todos» renderizaba
   782 fichas en un solo `innerHTML` — riesgo de pausa de 1–2 s en tablets
   modestas (el dispositivo real del público objetivo) `inferido` (no
   medido en hardware real, `pendiente de verificación`).
7. *(Menor)* **🔊 Voces tardías**: el selector de voz no se rellenaba si la
   lista del sistema llegaba después de abrir Ajustes (Chrome/Android).
8. *(Menor)* **🧼 Nombre sin escapar** en 4 sitios de `innerHTML` (login,
   ranking, diploma, informe): un nombre con `<` rompía la interfaz
   (vector teórico de XSS local; aquí es sobre todo robustez).

---

## AGENTE A3 — INTEGRADOR Y DECISOR · DICTAMEN

Integra A1 (visión dimensional) + A2 (casos de borde demostrados). El
producto mantiene su dirección (identidad, propósito y pedagogía intactos,
**preservativos**); se ordena intervenir SOLO donde hay evidencia de daño.

### Lista priorizada

**CRÍTICO** (daña el aprendizaje o el progreso — implementados en v9):
- **C-1** Rimas con doble respuesta válida → filtro fonético `rimeKey()`
  (`games3.js`). Verificado: 0 colisiones en sonda + 15 misiones E2E.
- **C-2** Fecha UTC → `localDayStr()` local para meta diaria, ruleta,
  hitos y gráfico (`data_meta.js`, `games2.js`). Verificado con reloj
  21:30 Bogotá: hoy = 2026-09-15 local (UTC decía 16).
- **C-3** PWA offline incompleta → fuentes + 18 avatares + premios al
  núcleo del SW y caché `pequeworld-v9` (`sw.js`).

**ALTO** (robustez/equidad — implementados en v9):
- **A-a** Copia de seguridad rotativa (`pequeworld_v2_bak`, máx. 1/min) +
  rescate al cargar con aviso. E2E: JSON truncado → perfil «Rescatado»
  recuperado.
- **A-b** `esc()` del nombre en los 4 renders (`utils.js`, `ui.js`,
  `games2.js`, `games3.js`). E2E: `<u>x</u>&Co` se muestra como texto.
- **A-c** `switchPlayer()` aborta la partida activa (`games3.js`).
- **A-d** Hook `voiceschanged` refresca el selector de voz (`games3.js`).
- **A-e** Diccionario por lotes de 350 + «➕ Ver más» (`games2.js`,
  `games2.css`). E2E: 351 → 701 → 782 exactas.

**MEDIO** (documentados, NO implementados en esta entrega — decisión futura):
- M-1 No existe «borrar perfil» (solo reiniciar el activo); las familias
  con perfiles de prueba no pueden limpiarlos.
- M-2 Evaluación automática de pronunciación: exigiría IA externa y
  rompería el principio 100 % local — queda como decisión de la familia.
- M-3 Verificar contraste AA del oro sobre fondo nocturno con medidor real.
- M-4 `aria-live` en la barra de feedback para lectores de pantalla.
- M-5 Ranking con rivales IA de XP fija puede desmotivar a largo plazo
  (rango dinámico según el nivel del niño).
- M-6 Las 25 sustituciones cosméticas de ilustraciones por fotos siguen
  pendientes de cuota de generación (respaldo ilustrado funciona).

### Verificación de la entrega v9
- `node --check` 15/15 módulos + sw.js.
- Sonda anti-colisión `v9_rhyme_probe2.mjs` sobre el código REAL extraído
  de `games3.js`: **9/9 pares, 0 colisiones, 0 pares sin distractores**.
- E2E `v9_test.cjs`: **51 checks TODO VERDE ×2 pasadas, 0 errores JS**,
  incluyendo las 8 verificaciones nuevas de los fixes.
- Regresión v8 completa (`v8_test.cjs`): TODO VERDE.
- Responsive `v9_resp.cjs` en 390/820/1366×705/1920: OK, sin scroll
  horizontal.
- Validación de datos: 79 mundos / 782 palabras / 90 insignias /
  0 duplicados / 0 imágenes faltantes.

### Qué NO se tocó (fidelidad identitaria)
Identidad visual, contenidos, economía de premios, dificultad, UI en
español, guardado 100 % local, sin conexión entre dispositivos: **sin
cambios**. v9 es una entrega de corrección quirúrgica, no de rediseño.
