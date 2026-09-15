# AUDITORIA-v11.md — "Ajustes geniales" (vía libre del usuario)

**Mandato:** «quiero que implementes ajustes geniales y te doy via libre para
hacerlo sin dañar lo que ya funciona».

**Principio rector:** solo mejoras **aditivas** (nada de lógica existente
reescrita), 100% locales (localStorage), UI en español, compatibles con
`file://` (doble clic) y con degradación limpia donde la API no existe.

---

## 1) Cómo se eligieron las mejoras

Se auditaron los 15 módulos JS + 6 CSS de la v10.1 buscando huecos de valor
alto y riesgo bajo. Criterios de inclusión:

1. **No tocar el motor de juego** (`game.js` solo recibió 3 líneas: 2 ganchos
   de vibración y 1 fanfarria condicionada al jackpot existente).
2. **No tocar la economía** (XP/monedas nuevas acotadas: +5 XP una vez al día).
3. **No tocar la identidad visual** (el fondo nocturno dorado se conserva; las
   estrellas fugaces viven en el contenedor `#starsBg` que ya es
   `pointer-events:none` — imposible que roben un toque).
4. **Coherencia pedagógica** (repetición espaciada ya existía en v8/v9; la
   Palabra del Día añade exposición diaria sin fricción; el descanso amigable
   se alinea con el consejo AAP ya citado en el informe de padres v8 B3).

Descartadas por riesgo (documentadas, no implementadas): cambio de tema
día/noche (rompería la identidad), swipe navigation (gestos conflictivos con
niños de 3 años), sincronización entre dispositivos (prohibida por mandato
histórico: 100% local).

## 2) Las 5 mejoras implementadas

| # | Mejora | Archivos | Riesgo controlado |
|---|--------|----------|-------------------|
| 1 | 📆 Palabra del Día | ui.js, style.css, data_meta.js | Determinista por **fecha local** (lección de v9 C-2: nada de UTC), 1 recompensa/día, foto con `contain` (0% recorte, lección v10) |
| 2 | ⏰ Descanso amigable 30/60 min | ui.js | **Nunca interrumpe una misión** (guard `G.active`), ni aparece sobre otro modal, apagable en Ajustes, pestaña oculta no cuenta minutos |
| 3 | 🌠 Estrellas fugaces | effects.js, style.css | Decorativas en contenedor no-interactivo, auto-eliminación del DOM a los 2s, respetan `prefers-reduced-motion` y `document.hidden` |
| 4 | 🎺 Fanfarria jackpot | audio.js, game.js | Solo en la rama jackpot existente (roll ≥ .92), WebAudio con try/catch como los beeps previos |
| 5 | 📳 Vibración háptica | utils.js, game.js | Guard triple: `try/catch` + `navigator.vibrate` existe + ajuste `haptics` (default activada, apagable) |

## 3) Decisiones de detalle

- **Palabra del día sin UTC:** `seed = año*10000 + mes*100 + día` → la palabra
  cambia a medianoche local del niño (Colombia), no a las 19:00 como pasaba
  con `toISOString()` antes del fix v9. La recompensa usa `todayStr()` (local).
- **Pool de palabras:** solo ítems con foto real (`it.img`), excluye los
  números (que se enseñan con conteo de estrellas) — la tarjeta siempre
  muestra una foto.
- **Descanso:** umbrales 30/60 min, cada aviso se muestra **una sola vez al
  día** (persistido en `p.stats.breakShown` — sobrevive recargas). El contador
  vive en `p.stats.screenTime` con rotación por fecha.
- **Vibración:** `buzz()` definida en `utils.js` para que todos los juegos la
  vean; patrón de fallo `[60,50,60]` (doble pulso suave, no susto).
- **Insignias 90→92:** `wotd1` (primera palabra del día) y `wotd7` (7 días
  distintos). Migración `migrateProfile` ampliada (wotd, wotdDays, screenTime,
  breakShown) — los perfiles v10 siguen intactos.
- **SW:** caché `pequeworld-v11` (convención de cada release) → las
  instalaciones https/localhost reciben el aviso azul de actualización.

## 4) Evidencia de verificación

| Prueba | Resultado |
|--------|-----------|
| `node --check` 15 módulos + sw.js | 15/15 OK |
| **v11_test.cjs** (nuevo, 34 checks ×2 pasadas) | TODO VERDE ×2 — WOTD determinista, +5XP solo 1.ª vez, insignia wotd1, estrella aparece y se limpia, descanso 30/60/59/guard-misión/toggle, jackpot sin error, buzz sin error, toggles, stats padres, 92 insignias, **0 errores JS** |
| v9_test.cjs (regresión E2E completa, 51 checks) | TODO VERDE, 0 errores JS |
| v10_pwa_test.cjs (17 checks) | TODO VERDE — caché `pequeworld-v11`, FABs 40px, controllerchange→FAB |
| v9_resp.cjs (4 viewports) | OK 390/820/1366×705/1920, sin scroll horizontal |
| v8_validate.mjs | 79 mundos · 782 palabras · **92 insignias** · 0 duplicados · 0 imágenes faltantes |

## 5) Conclusión

Cinco mejoras visibles para el niño y útiles para la familia, todas
verificadas con pruebas automatizadas y sin una sola regresión. La app sigue
guardando todo en el dispositivo, sin cuentas ni conexión.
