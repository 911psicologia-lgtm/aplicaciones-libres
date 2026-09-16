# 🔍 AUDITORÍA v12 — Ajustes necesarios e innovadores (misma vía admisible)

**Fecha**: 2026-09 · **Alcance**: iteración aditiva sobre v11 (que ya pasó DSEBI
TRIPLE en v9 y regresión completa en v10/v11). Principio rector: **añadir valor
sin tocar el motor** — game engine intacto, economía intacta, identidad
(fondo nocturno + dorado) intacta, privacidad local intacta.

## 1) Criterio de admisión (aplicado antes de escribir código)

Cada candidato debía cumplir las 5 reglas:

| Regla | Por qué |
|---|---|
| Aditivo (archivos nuevos o funciones nuevas, cero reescrituras) | el motor v9-v11 está verificado: tocarlo es el riesgo #1 |
| 100% local (localStorage, sin red) | promesa fundamental de la app |
| Degradación limpia en `file://` (doble clic) | es EL flujo principal de las familias |
| Respeto a `prefers-reduced-motion` y `@media print` | accesibilidad ya conquistada no se negocia |
| Datos nuevos = migración automática (migrateProfile) | los perfiles existentes no pueden perder nada |

**Candidatos descartados** (con motivo): tema día/noche (rompe identidad
nocturna + enorme superficie CSS); gestos swipe (imprecisos en 3-5 años);
grabación de voz persistente (línea de privacidad: las grabaciones no se
guardan); misiones diarias multi-meta (solapaba con la Meta diaria v5 que ya
cuenta misiones — redundancia de estímulos); PIN parental (la puerta matemática
v8 es suficiente para 3-7 años y no añade fricción).

## 2) Lo que se implementó

### 1. 🧸 Modo Explorar (innovador — sin presión)
- `games3.js`: `startExplore()` + `renderExploreChips()` + `renderExploreGrid()`
  + `exploreTap()`. Cero interacción con el motor G (vida/puntos).
- Modal con chips de mundos del nivel actual, cuadrícula de fotos `contain`
  (0% recorte, lección v10), preview grande + `TTS.sayWord` (respeta ENES/EN/ES)
  + confeti suave `burst(10)`.
- Contador `stats.exploreVisits` (migrado); insignias `explore1`/`explore10`.
- CSS en `games3.css` (`.exp-*`), tarjeta `.gz-explore` en Zona de Juegos.

### 2. 🗓️ Calendario de adhesivos (innovador — cero datos nuevos)
- Tab `tTab7` «Calendario» en Premios. Reutiliza `p.stats.daysPlayed`
  (registrado desde v5 para insignias de días): **ningún dato nuevo**.
- Cuadrícula de 8 semanas lunes→domingo, estrella ⭐ por día jugado, hoy
  resaltado, futuro atenuado, racha actual abajo. `localDayStr()` (lección
  v9 C-2: fecha local, nunca UTC).

### 3. 🔠 Tamaño de texto (necesario — accesibilidad)
- Ajustes: Normal / Grande / Muy grande → clases `body.fs-lg` (+7.5%) y
  `body.fs-xl` (+15%). **Funciona de verdad** porque todo el CSS usa `em`;
  verificado con medida: 16px → 17.2px.
- Persistido en `STATE.settings.textSize` y aplicado en `boot()` (main.js)
  + en el cambio. Compensación en móviles estrechos (≤420px).

### 4. ▶ Continuar donde quedaste (necesario — UX de continuidad)
- `game.js startMission()` registra `p.lastWorld` (una línea, try/catch).
- Chip dorado en el mapa (`renderContinueChip`) que reabre la misión.
- Aparece solo tras tocar un mundo; desaparece si el mundo no existe.

### 5. 🔔 Efectos de sonido apagables (necesario — control familiar)
- `audio.js`: `sfxOn()` puerta en `beep/beepWin/beepChest/beepJackpot`.
  Por defecto **activados** (`sfx === false` = apagado): nada cambia para
  quienes ya usan la app. La voz (TTS) conserva su interruptor propio.

### 6. 🫁 Burbuja de respiración (innovador — bienestar)
- Dentro del modal de descanso v11 (misma superficie, cero nuevos flujos):
  burbuja azul animada 8s (crece 4s / se encoge 4s) + hint.
  `prefers-reduced-motion` la congela.

### 7. Migración e insignias
- `migrateProfile`: `exploreVisits` en el array de stats (perfiles antiguos
  → 0, sin pérdida). Insignias v12: `explore1`, `explore10` → **94 total**.

## 3) Verificación (evidencia, no fe)

| Suite | Resultado |
|---|---|
| `v12_test.cjs` (34 checks: UI real del Explorar, chip reabre misión, calendario = días jugados, escala 16→17.2px medida, persistencia tras reload, SFX sin excepción, burbuja, migrate, 0 errores JS) | ✅ TODO VERDE |
| `v9_test.cjs` (E2E histórico completo) | ✅ TODO VERDE, 0 errores JS (aserciones actualizadas: 12 tarjetas, 94 insignias, caché v12) |
| `v11_test.cjs` (WOTD/descanso/estrellas/jackpot/buzz) | ✅ TODO VERDE |
| `v10_pwa_test.cjs` (17 checks file:// + localhost) | ✅ 17/17, caché `pequeworld-v12` |
| `v9_resp.cjs` (390 / 820 / 1366 / 1920) | ✅ OK en 4 vistas |
| `v8_validate.mjs` (assets, manifest, sw, iconos) | ✅ 0 imágenes faltantes |
| `node --check` (15 JS) | ✅ |
| Capturas | `download/vistas_previas_v12/`: mapa con chip, explorar con insignia disparada, calendario, ajustes texto+SFX, respiración |

## 4) Riesgos revisados y mitigados

- **setTextSize con botón huérfano** (detectado por el smoke test en vivo):
  el handler tocaba `btn.parentNode` sin guard → ahora es defensivo
  (`if (btn && btn.parentNode)`).
- **Tour vs tests**: la suite nueva espera `.tour-overlay` y usa `#tourSkip`
  (determinista) en lugar de cliques a ciegas.
- **FABs PWA**: no se tocaron (v10.1 ya cerrado); el chip Continuar vive en el
  flujo del mapa, no compite por la esquina.
- **Economía**: ninguna recompensa nueva se otorga automáticamente; las
  insignias nuevas son visuales (XP/monedas del perfil quedan como estaban).
