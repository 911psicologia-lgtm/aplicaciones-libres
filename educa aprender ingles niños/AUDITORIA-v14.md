# 🔍 AUDITORÍA v14 — «Taller de Juegos»

**Fecha:** 2026-09-16 · **Alcance:** las 6 novedades pedidas explícitamente por
el usuario (trazado de letras, ahorcado, retos de fin de semana, rompecabezas
de 4/9/12 cuadros, unir con puntos, pulir tiempos del límite).

## 1) Criterio de admisión (heredado de v11–v13)

1. **Pedidos por el usuario** — las 6 funciones provienen literalmente del
   mensaje «juego nuevo de trazado de letras, ahorcado, retos de fin de
   semana, rompecabezas de 4 9 y 12 cuadros, unir con puntos, pulir tiempos
   del límite».
2. **Motor intacto** — los 5 juegos nuevos usan `bootGameMission` +
   `coreReward/coreFail/endMission` (mismo flujo de XP, monedas, estrellas,
   cofre, rachas e insignias). Ni una línea del render de misiones normal
   cambió de comportamiento; solo se añadió el reset de `optsGrid`
   (className/display) y el guard `G.countPerfect !== false`.
3. **100% local** — sin red, sin cuentas, sin dependencias nuevas.
4. **Cero regresiones** — 7 suites verdes (ver §5).

## 2) Diseño infantil (3–7 años)

| Juego | Adaptación |
|---|---|
| ✏️ Traza | Cobertura tolerante (50%), guía tenue, punto de inicio verde, 🧹 Borrar, sin vidas en riesgo |
| 🔤 Adivina | **Ahorcado sin ahorcado**: nada de muñecos ni cuerdas; foto-pista siempre visible, 5 corazones, al perder se enseña la palabra (momento de enseñar) |
| 🖼️ Rompecabezas | Sin arrastre (toca-toca), sin tiempo, sin errores, modelo de referencia visible, 3 tamaños elegidos por el niño |
| ⭐ Puntos | Sin penalización: si toca mal, el punto correcto parpadea; pulso suave del objetivo |
| 🎪 Reto finde | Entre semana NO bloquea: cartel que invita a volver el sábado; nunca compite con la meta diaria |
| ⏱️ Límites | Aviso previo en toast (no modal),nunca interrumpe misiones (guard v11 intacto) |

## 3) Economía y anti-inflación

- `coreReward` estándar por letra/palabra/pieza/figura (+12 XP, +2 🪙, maestría
  de la palabra — alimenta Diccionario y hitos).
- Los juegos **creativos** (trace/puzzle/dots) marcan `G.countPerfect=false`:
  completarlos no infla «misiones perfectas» (💎). El ahorcado y el reto del
  finde sí pueden ser perfectos (son quiz reales).
- Bono del finde: +30 🪙 +25 ✨ **por terminar** la misión mixta (una vez por
  intento, no por pregunta).

## 4) Cambios por archivo

| Archivo | Cambio |
|---|---|
| `js/games4.js` | **NUEVO** (628 líneas): TRACE_ABC (26 letras con foto), TR (estado trazado + rasterizado de guía + cobertura), HG (ahorcado), PZ (rompecabezas + geometría 2×2/3×3/4×3), DOTS_SHAPES (6 figuras), DT, reto finde (`isWeekendToday`/`daysToWeekend` + chip) y ganchos `PW_WEEKEND`/`PW_FORCE_WEEKEND` |
| `css/games4.css` | **NUEVO**: estilos de canvas, slots, teclado A-Z, grid de piezas, chip finde, 4 tarjetas gz, reduced-motion y responsive (baja altura) |
| `js/game.js` | endMission: stats de 5 juegos nuevos + bono finde + guard countPerfect; retryMission: 5 ramas; renderQuestion: reset de optsGrid (className/display) |
| `js/data_meta.js` | +10 insignias (106 total): trace1/10, hang1/10, puzzle1/10, dots1/10, weekend1/4; migrateProfile: 5 stats nuevos + `weekendDone` |
| `js/ui.js` | renderGamesZone: +4 tarjetas (Traza/Adivina/Rompecabezas/Puntos); renderMap: renderWeekendChip; límites pulidos (chips 10/90, pre-aviso, limitInfo, modal con minutos reales) |
| `index.html` | título v14 + `css/games4.css` + `js/games4.js` |
| `sw.js` | CACHE `pequeworld-v14` + 2 archivos nuevos en CORE |

## 5) Verificación (evidencia)

- `node --check` **15/15** JS.
- **v14_test.cjs NUEVO — 63 checks TODO VERDE**: trazado real por eventos
  pointer (cobertura 0.5→éxito), ahorcado con fallo y victoria, rompecabezas
  resuelto tocando piezas reales (5 fotos), puntos tocados sobre el canvas
  (fallo amable incluido), reto finde forzado (10 preguntas + bono +
  weekendDone), 7 chips + info restante + pre-aviso + modal con minutos
  reales, migrate, 106 insignias, **0 errores JS**.
- Regresión: **v9_test TODO VERDE** (16 tarjetas, 106 insignias, caché v14),
  **v11 VERDE**, **v12 VERDE**, **v13 VERDE** (7 chips), **v10_pwa 17/17**
  (caché v14 + FABs), **v9_resp OK 390/820/1366/1920**, **v8_validate 0
  imágenes faltantes**.
- Capturas verificadas visualmente en `download/vistas_previas_v14/`
  (trazado, ahorcado, puzzle, puntos, reto, mapa con chips, límites).

## 6) Riesgos y mitigaciones

- **getImageData en canvas** (trazado): solo se dibujan letras (sin imágenes
  externas) → sin taint de canvas; envuelto en try/catch con fallback.
- **Cola de celebraciones**: rachas + misión encolan celebraciones; el arnés
  las descarta y en la app se cierran solas (3,2 s) — comportamiento ya
  existente, sin cambios.
- **strict-mode de tests**: los selectores de chips se acotaron
  (`#continueChip .cont-btn`) al convivir 3 chips en el mapa.
- **Semáforo de teclado en móviles bajos**: grid 7×4 con `aspect-ratio` y
  media queries de altura (<700px reduce canvas).
- Descartado (fuera de pedido y con riesgo de duplicar): galería de dibujos
  guardados (no hay almacenamiento de imágenes nuevas pedido) y editor de
  figuras personalizadas.

## 7) Conclusión

v14 entrega **exactamente las 6 funciones pedidas**, con adaptación infantil
documentada, economía verificada, 106 insignias y **cero regresiones** en las
7 suites. ZIP raíz-plano en `download/PequeWorld-v14.zip`.
