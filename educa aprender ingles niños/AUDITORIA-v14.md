# 🔍 AUDITORÍA v14 — Taller de letras y juegos creativos (ronda pedida por el usuario)

**Fecha**: 2026-09-16 · **Alcance**: iteración aditiva sobre v13 (que ya pasó la
regresión completa con 7 suites). Principio rector intacto: **añadir valor sin
tocar el motor** — engine de misiones (`game.js`) intacto salvo 1 contador
aditivo en `coreReward`, economía intacta, identidad nocturna + dorada intacta,
privacidad 100% local intacta.

## 0) Pedido del usuario (exacto)

«continua con otra ronda ( juego nuevo de trazado de letras, ahorcado, retos
de fin de semana, rompecabezas de 4 9 y 12 cuadros, unir con puntos, pulir
tiempos del límite)» → los 6 ítems se implementan **todos** en esta versión.

## 1) Criterio de admisión (aplicado antes de escribir código)

Las mismas 5 reglas de v11/v12/v13: aditivo, 100% local, degradación limpia en
`file://`, respeto a `prefers-reduced-motion` y datos nuevos = migración
automática sin pérdida.

**Decisiones de diseño previas (anti-riesgo)**:
- Los 4 juegos nuevos (trazado, ahorcado, rompecabezas, puntos) viven en un
  **archivo nuevo `js/games4.js` + `css/games4.css`** — cero mezcla con el
  motor de misiones. Cada juego es un modal propio al estilo Explora (v12).
- **Trazado**: en la auditoría v13 se descartó «por tocar el motor»; aquí se
  implementa como juego independiente con máscara canvas — sin motor, sin
  vidas, sin fallos. Antitrampa por **eventos de pintado** (≥40 movimientos),
  no por nº de trazos: una «I» real se traza con 1-2 trazos y el guard antiguo
  la habría bloqueado injustamente (bug detectado por el propio test v14).
- **Ahorcado kid**: sin muñeco ni horca (miedo no); la foto del item SIEMPRE
  visible como pista → jugable desde los 3-4 años y enseña reconocimiento de
  letras. Perder = revelar con cariño, nunca castigar.
- **Rompecabezas**: tap-swap (dos toques intercambian) en vez de drag — manos
  pequeñas. Las piezas usan `background-size/position` (recorte de rejilla,
  propio del juego); el **revelado final muestra la foto completa contain
  (0% recorte)** con la palabra hablada.
- **Retos de finde**: solo retos medibles con datos que la app YA registra
  (misiones del día v7, Palabra del Día v11) + 1 contador aditivo nuevo
  (`correctByDay`, en `coreReward`). Recompensa 1×/día de finde, guard
  idempotente.
- **Límite pulido**: pre-aviso a 5 min como **toast** (no modal, no bloquea el
  juego), solo para límites ≥15 min, 1×/día con clave propia `pre+fecha`.

## 2) Lo que se implementó

### 1. ✏️ Trazado de letras (`games4.js`, tarjeta «Trazar»)
- Chips A-Z con ✓ verde por letra completada (`stats.traceLetters`).
- Guía punteada gris de la letra (font Baloo 2 a 230px en canvas 320²);
  máscara `getImageData` muestreada cada 5px → objetivos de cobertura.
- Tinta dorada (`#FFD54A`, ancho 30) recortada con
  `destination-in` contra la máscara → **solo pinta dentro de la letra**.
- Barra de progreso; al ≥72% y ≥40 eventos → `traceComplete()`: confeti,
  fanfarria, +12XP/+8🪙/+1⭐ (primera vez) o +5XP/+3🪙 (repetida), voz
  «A… A is for Apple» (palabra extraída del `hint` de los mundos de letras).
- Botón «🧽 Borrar trazo»; `touch-action:none` en el canvas (sin scroll
  accidental en móvil); `PW_TRACE` como gancho de evidencia.

### 2. 🎯 Ahorcado kid («Adivina la palabra», tarjeta «Ahorcado»)
- Pool = items con foto y palabra de una sola pieza (3-9 letras) de los mundos
  del nivel; ronda de 5 palabras, 6 corazones, teclado A-Z (grid 7 columnas).
- Letra correcta → se revelan TODAS sus posiciones + se oye la letra;
  palabra completa → +6XP/+4🪙, maestría +1, voz EN+ES.
- Sin vidas → revelado amable («🌱 ¡Casi! Era…») y se sigue; ronda perfecta
  (5/5) → bonus +20XP/+10🪙. `stats.hangGames/hangWins` (migrados).

### 3. 🖼️ Rompecabezas (tarjeta «Rompecabezas»)
- Chips Fácil 4 (2×2) / Medio 9 (3×3) / Difícil 12 (3×4); foto al azar de los
  mundos del nivel (precargada con `Image()` antes de armar).
- Barajado garantizando NO resuelto; tap-swap con selección dorada; contador
  de cambios; «👀 Ver ejemplo» (2 usos, overlay 1,3s).
- Resuelto → revelado contain + palabra EN/ES + +8/15/25XP y +5/8/12🪙 según
  tamaño. `stats.puzzleGames` y `stats.puzzles[4|9|12]` (migrado).

### 4. 🔢 Unir con puntos (tarjeta «Puntos»)
- 6 figuras como polilínea cerrada normalizada: Estrella(10), Casa(9),
  Cohete(8), Árbol(9), Pez(6) + Corazón(14) **generado por fórmula
  paramétrica** (puntos perfectos).
- El siguiente punto **pulsa en verde**; tap correcto → tramo dorado + voz no;
  tap incorrecto → temblor amable + pista («Busca el punto N»), sin castigo.
- Completada → relleno degradado + emoji + nombre EN/ES + +10XP/+6🪙 primera
  vez. `stats.dotsShapes` (migrado) + insignias de colección.

### 5. 🗓️ Retos del fin de semana (`renderWeekendCard` en el mapa)
- Sáb/dom: tarjeta con 3 retos y barras; entre semana: insinuación púrpura.
- Retos: 2 misiones (`missionsByDay`), 10 aciertos (`correctByDay` nuevo),
  Palabra del Día (`wotdDays`). Todo computado en vivo, cero duplicación.
- Los 3 → botón reclamar → +30🪙/+50XP/+1⭐; guard `weekendClaimed[fecha]`
  (1×/día) y `weekendDays[fecha]` para las insignias. `PW_WEEKEND` gancho.

### 6. ⏱️ Límite diario pulido (pedido «pulir tiempos del límite»)
- Chip **90 min** añadido (Apagado/15/30/45/60/90).
- **Estado en vivo** en Zona de padres: «Hoy: X min · te quedan Y» con mini
  barra (`limitNowHTML`, se refresca al cambiar de chip).
- **Pre-aviso a los 5 min**: toast no bloqueante 1×/día (solo límites ≥15),
  mismas tutelas de guard que el aviso final (nunca en misión, no sobre
  modales). El aviso final v13 queda intacto.
- `PW_LIMIT.state()` ampliado con `left` y `preShown` para evidencias.

### 7. Robustez hallada y corregida (beneficio colateral)
- **`defaultProfile` incompleto desde v11**: los perfiles recién creados no
  tenían `wotdDays/screenHist/screenTime/breakShown/limitShown` hasta pasar
  por `migrateProfile` — ahora nacen completos (detectado por el test v14
  al sembrar el reto de finde).
- Test v12 con selector ambiguo `.cont-btn` (desde v13 el chip Sorpréndeme
  reutiliza esa clase) → tests actualizados a `.cont-btn:not(.surp-btn)`.

### 8. Insignias y datos (100% aditivo)
- **+12 insignias** (96→108): trace1/trace10/trace26, hang1/hang10,
  weekend1/weekend8, puzzle1/puzzle9/puzzle12, dots1/dots6.
- `migrateProfile` repone: `traceLetters, dotsShapes, puzzles, weekendDays,
  weekendClaimed, correctByDay` + contadores `hangGames, hangWins,
  puzzleGames, traceVisits`. Perfiles antiguos no pierden nada.
- `sw.js`: `CACHE = 'pequeworld-v14'` + `js/games4.js` y `css/games4.css` en
  CORE (offline completo).

## 3) Verificación (evidencias, no promesas)

| Suite | Resultado |
|---|---|
| `node --check` (16 archivos) | ✅ 16/16 |
| **v14_test.cjs (nuevo)** | ✅ **77 checks TODO VERDE** (trazado con trazo real de ratón cobertura 1.00→done, ahorcado perder+ganar palabra, rompecabezas 4 y 12 resueltos por toques reales, estrella+corazón por PointerEvents, retos con claim único, pre-aviso, persistencia tras reload, 0 errores JS) |
| v9_test.cjs (E2E) | ✅ TODO VERDE, 0 errores JS |
| v11_test.cjs | ✅ TODO VERDE |
| v12_test.cjs | ✅ TODO VERDE (selector `.cont-btn` desambiguado) |
| v12_smoke.cjs | ✅ TODO VERDE |
| v13_test.cjs | ✅ TODO VERDE, 0 errores JS (chips límite 5→6) |
| v10_pwa_test.cjs | ✅ 17/17 con `caché v14 activa` |
| v9_resp.cjs | ✅ OK 390/820/1366/1920 |
| v8_validate.mjs | ✅ 0 imágenes faltantes |

- Capturas verificadas visualmente en `download/vistas_previas_v14/`:
  mapa con 16 tarjetas + insinuación finde, trazado con letra A y guía,
  ahorcado con foto-pista/corazones/teclado, rompecabezas 9 con peek,
  puntos con estrella a medio unir, chips de límite con estado.

## 4) Riesgos y mitigaciones

- **Rendimiento del trazado**: cada movimiento repinta con `destination-in`
  sobre canvas 320² — imperceptible en móviles modernos; la máscara se
  calcula UNA vez por letra (no por movimiento).
- **Fuentes en canvas**: si Baloo 2 aún no cargó al abrir el modal, la guía
  usa la fuente de respaldo — misma para máscara y visual, así que la
  cobertura sigue siendo coherente; los tests esperan `document.fonts.ready`.
- **Retos de finde en semana**: el claim solo es alcanzable por UI los días de
  finde (la tarjeta es la única entrada); el gancho `PW_WEEKEND.claim()` es
  de prueba.
- **Rompecabezas con fotos grandes**: se precarga la imagen antes de armar y
  el error de carga avisa sin romper el modal.

## 5) Veredicto

v14 entregada: **4 juegos nuevos + retos de finde + límite pulido**, 108
insignias, 7 suites verdes, 0 regresiones. 100% local, en español, con
`file://` operativo y evidencia reproducible.
