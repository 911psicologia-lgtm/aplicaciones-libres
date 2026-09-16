# 🔍 AUDITORÍA v13 — Ajustes necesarios e innovadores (continuación de la vía admisible)

**Fecha**: 2026-09 · **Alcance**: iteración aditiva sobre v12 (que ya pasó la
regresión completa v9–v12 con 7 suites). Principio rector intacto: **añadir
valor sin tocar el motor** — engine de misiones intacto, economía intacta,
identidad nocturna + dorada intacta, privacidad 100% local intacta.

## 1) Criterio de admisión (aplicado antes de escribir código)

Las mismas 5 reglas de v11/v12: aditivo (nada de reescrituras), 100% local,
degradación limpia en `file://`, respeto a `prefers-reduced-motion` y
`@media print`, y datos nuevos = migración automática sin pérdida.

**Candidatos descartados** (con motivo, lección anti-duplicar):
- Galería «Mis palabras» → el **Diccionario v8 ya lo hace mejor** (782 palabras
  con audio, dominio y filtros). Redundancia de estímulos.
- Diplomas de mundo → el tab 🎓 Diplomas existe desde v5.
- Insignias de dominio extra → mile50/100/200 ya cubren el arco (10→500).
- Trazado de letras (canvas) → toquearía el motor de ejercicios; riesgo
  innecesario para esta iteración.

## 2) Lo que se implementó

### 1. 🎲 Sorpréndeme (innovador — la sorpresa como motivación)
- `ui.js`: `renderSurpriseChip()` + `window.surpriseMe()`. Chip violeta en el
  mapa (mismo lenguaje visual que «Continuar» v12, anclado en `#dailyGoal`).
- Elige un mundo al azar de `WORLDS.filter(w => w.lvl === currentLevel)` y
  abre su intro normal vía `startMission()` — **cero lógica nueva de juego**.
- `stats.surpriseGames` (migrado) + insignias `surprise1`/`surprise10`.
- CSS `.surp-btn` en `style.css` (gradiente violeta, respeta reduced-motion).

### 2. ⏱️ Límite de tiempo diario (necesario — control familiar AAP)
- Control en **Zona de padres** (no en Ajustes del niño): chips
  Apagado/15/30/45/60 → `STATE.settings.dailyLimit` (0 = off, default).
- `maybeLimit()` dentro de la IIFE v11 del contador de minutos: mismo guard
  triple que el descanso (nunca en misión `G.active`, no sobre otro modal,
  1 aviso/día vía `stats.limitShown.date`).
- El aviso **celebra** lo jugado y sugiere cerrar («Un poco más» / «Hasta
  mañana») — nunca fuerza ni penaliza.
- Gancho de evidencia `window.PW_LIMIT` (patrón `PW_BREAK` de v11).

### 3. 📊 Gráfico semanal de minutos (necesario — visibilidad para padres)
- `addMinute()` v11 ahora también registra `stats.screenHist[fecha]`
  (migrado `{}`; poda automática a 14 días al abrir la Zona de padres).
- `weekMinutesHTML()`: barras CSS puras (cero dependencias), hoy resaltado,
  total + promedio bajo el gráfico.
- **Continuidad v11→v13**: si el perfil ya tenía «Minutos hoy» pero aún no
  historial, el gráfico muestra su minuto real de hoy (detectado por el test
  y corregido — el resto de días se quedan honestamente vacíos).

### 4. 🔠 Palabras en MAYÚSCULAS (necesario — lectores tempranos)
- Ajustes: toggle → `STATE.settings.capsMode` → `body.caps` → `text-transform:
  uppercase` en clases de palabra (`.q-big-word`, `.ob-word`, `.ob-letter`,
  `.word-card-txt`, `.wotd-word`, `.slot`, `.dt-en`).
- **Verificado que es inofensivo en Letras**: los ítems de vocales/consonantes
  ya son mayúsculas en los datos (`'A'…'Z'`), así que no hay colisión visual
  de opciones. Es opt-in (default off) y solo visual: TTS, fotos y motor
  quedan idénticos.
- Aplicado en `boot()` (main.js) + en el cambio; persiste tras recarga.

### 5. Migración e insignias
- `migrateProfile`: `surpriseGames` (número), `screenHist` ({}),
  `limitShown` ({date}). Settings globales con patrón v11/v12 (leer con
  fallback: undefined = apagado). Insignias v13: `surprise1`, `surprise10`
  → **96 total**.

## 3) Verificación (evidencia, no fe)

| Suite | Resultado |
|---|---|
| `v13_test.cjs` (44 checks: chip dice→intro real, contador+insignias, límite con 4 guards, gráfico 7 barras+poda+continuidad, caps medido+persistente, migrate, 96 insignias, 0 errores JS) | ✅ TODO VERDE |
| `v9_test.cjs` (E2E histórico, aserciones 96 badges + caché v13) | ✅ TODO VERDE, 0 errores JS |
| `v11_test.cjs` (WOTD/descanso/estrellas/jackpot/buzz) | ✅ TODO VERDE |
| `v10_pwa_test.cjs` (17 checks file:// + localhost) | ✅ 17/17, caché `pequeworld-v13` |
| `v9_resp.cjs` (390 / 820 / 1366 / 1920) | ✅ OK en 4 vistas |
| `v8_validate.mjs` (assets, manifest, sw, iconos) | ✅ VALIDACIÓN COMPLETA |
| `node --check` (18 JS) | ✅ |
| Capturas | `download/vistas_previas_v13/`: mapa con dado, aviso de límite, gráfico semanal + chips, MAYÚSCULAS en Ajustes y Diccionario |

## 4) Riesgos revisados y mitigados

- **Test PWA vs chip nuevo** (hallado en esta iteración): el toque de
  «despertar FABs» del test era un click a ciegas en (400,600) — ahora cae
  en el chip 🎲 (comportamiento correcto de la app) y abría un modal que
  bloqueaba el siguiente paso. Corregido en el ARNÉS (pointerdown sintético
  sobre `<body>`), no en la app: los tests no deben depender del layout.
- **Continuidad del gráfico** (hallado por el test v13): perfiles v11 sin
  `screenHist` mostraban 0 hoy → `weekMinutesHTML` siembra hoy desde
  `screenTime.mins` cuando es mayor.
- **MAYÚSCULAS vs juego de letras**: auditado el dato (`en:'A'…` ya
  mayúsculas) → sin colisión de opciones; y es opt-in.
- **Economía**: Sorpréndeme no regala nada — usa la economía normal de la
  misión elegida. El aviso de límite no toca XP/monedas.
- **FABs PWA**: intactos (el chip vive en el flujo del mapa, no en la
  esquina); `@media print` oculta chip, límites y gráfico.
