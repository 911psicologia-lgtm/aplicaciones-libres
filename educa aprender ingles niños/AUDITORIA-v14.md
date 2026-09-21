# 🔍 Auditoría interna v14 — «Mesa de Juegos Nuevos»

**Fecha:** 2026-09-19/20 · **Alcance:** 5 novedades (4 juegos + retos del finde) · **Riesgo:** controlado, 100% aditivo

## 1. Origen y criterio de admisión

El usuario aprobó explícitamente: «SÍ AGREGA añadir el modo A–J a "Unir
puntos", más figuras, o retos del finde con fotos (p. ej. "traza 3 letras
el sábado"). Y OTRAS FUNCIONES ADICIONALES DE REFUERZO A TU JUICIO».
Se reactiva así el alcance de juegos pedido originalmente para la ronda
anterior (trazado, ahorcado, rompecabezas, unir puntos, retos de finde),
que las rondas v12/v13 no habían cubierto porque entregaron otras
novedades admisibles (Explorar/calendario y Sorpréndeme/límite/gráfico/MAYÚSCULAS).

**Criterio de admisión (heredado v11–v13):** novedad genuina (no duplica),
aditiva (no toca el motor `G` ni flujos probados), 100% local (localStorage),
UI en español envolviendo contenido en inglés, para edades 3–7 (metas
grandes, fallo sin castigo, sin tiempo), y medible (stats + insignias).

## 2. Descartes documentados (anti-duplicar)

- «Retos del finde con fotos de la cámara» → descartado: la cámara ya es
  identidad de perfil (v3); exigir fotos de actividades reales no es
  verificable 100% en local y añade fricción AAP. Se interpretó «con fotos»
  como tarjetas ilustradas (emoji grande + gradiente), consistente con la app.
- «Pulir tiempos del límite» → ya entregado en v13 (límite diario AAP);
  rehacerlo duplicaría dominio.
- Gamificación de puntos por tiempo en los juegos nuevos → descartada a
  propósito: sin reloj (compatible con el «sin presión» del Modo Explorar
  v12 y el descanso v11).

## 3. Diseño anti-regresión

- **Nuevo archivo `js/games4.js`** (único archivo JS nuevo) + `css/games4.css`
  → cero riesgo de colisión con games/games2/games3. Registrados en
  index.html (antes de main.js) y en el precache del SW (probado).
- **Un solo punto de enganche en ui.js**: las 4 tarjetas nuevas en
  `renderGamesZone` (con guard `typeof` defensivo, patrón v12) y una línea
  `if (typeof renderFindeBanner === 'function') renderFindeBanner();` en
  `renderMap`. El resto de ui.js/game.js intacto.
- **Insignias**: +10 (106 total) vía `BADGES` con condiciones nuevas sobre
  campos nuevos (`dotFigs`, `traceLetters`, `puzzleGames`, `hangWins`,
  `stats.finde`) — las 96 anteriores no cambian.
- **Migrate**: `migrateProfile` añade campos v14 con defaults 0; verificado
  con perfil «antiguo» sin campos.
- **Ceros castigos**: unir puntos solo tiembla; trazo no penaliza salirse;
  adivina usa globos (no muñeco) y derrota amable con consuelo.
- **0% recorte (política v9)**: el rompecabezas encuadra la foto con
  `drawImage` contain en lienzo cuadrado ANTES de trocearla.

## 4. Retos del finde — decisiones de estado

- Clave de fin de semana = **fecha del sábado local** (sáb y dom comparten
  clave; de lunes a viernes se calcula el sábado siguiente). Sin UTC
  (misma lección v9 [C-2]).
- Estado: `stats.finde = {key, done:{traza,une,puz}, claimed:{...}, total, perfect}`.
  Cambio de clave → reset de done/claimed conservando total/perfect.
- Los juegos empujan con `PW_FINDE.bump(id)` (traza/une/puz) — acoplamiento
  mínimo y comprobable.
- Arnés: `PW_FINDE.force(clave)` / `unforce()` simulan el fin de semana
  para pruebas en día laborable (patrón `window.PW_*` de v11–v13).

## 5. Hallazgos y fixes durante la construcción

1. `PW_PUZZLE.word()` apuntaba a `_pzWord.en` en vez de `_pzWord.it.en`
   (fue detectado por el smoke: devolvía «»). Corregido y probado.
2. `PW_TRACE.feed` solo aceptaba pares `[x,y]`; el arnés usa los objetos
   `{x,y}` de `checkpoint()` → normalización añadida en ambos lados.
3. **v12_test ya estaba roto desde v13** (no era culpa de v14): el chip 🎲
   «Sorpréndeme» comparte la clase `.cont-btn`, y el selector genérico de
   v12_test chocó en modo estricto de Playwright. Afinado a
   `#continueChip .cont-btn` (el chip de Sorpréndeme es `#surpriseChip`).
4. El toque «real» del arnés sobre el primer punto SVG avanza next 0→1
   (no 0→2): aserción del arnés corregida, la app siempre estuvo bien.

## 6. Verificación (evidencias)

- `node --check` 15/15 archivos JS.
- **v14_test.cjs (nuevo): 72 checks TODO VERDE** — UI real: tarjetas,
  toques SVG reales, puntero real sobre canvas, teclado A–Z real, claims
  reales de retos, persistencia tras reload, migrate, caché v14, 0 errores JS.
- Regresión completa: v9_test TODO VERDE (0 errores, 16 tarjetas, 106
  insignias, caché v14) · v11_test verde · v12_test verde (selector afinado)
  · v13_test verde · v10_pwa_test 17/17 (caché v14) · v9_resp 4 vistas OK
  · v8_validate completa.
- 8 capturas verificadas visualmente en `download/vistas_previas_v14/`.

## 7. Riesgos residuales (aceptados y monitoreados)

- El banner del finde añade un bloque al mapa en sáb/dom → v9_resp (4
  resoluciones) pasó sin overflow ni solapes; los FABs son fixed y no se ven
  afectados.
- Palabras con mayúsculas/mezcladas o espacios no entran al pool de
  Adivina (filtro estricto) → el pool siempre tiene palabras del nivel
  (verificado en los 3 niveles).
- `stats.finde.done` puede acumular > target (p. ej. trazar 10 letras un
  sábado) → el HUD y el claim usan `Math.min(done, target)`; sin efectos.
