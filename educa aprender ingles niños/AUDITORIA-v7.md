# 🔍 AUTOAUDITORÍA v7 — PequeWorld

**Fecha:** 2026-09-12 · **Producto:** PequeWorld v6 → v7 · **Modo:** 100% local (localStorage), sin conexión entre dispositivos.

Petición: *«aplica nuevas mejoras posibles»*. El equipo revisó la v6 completa (11 módulos, 4 CSS, 390 fotos, pantallas y flujos), propuso mejoras y las implementó. Este documento resume el proceso.

---

## 1) Hallazgos de la auditoría sobre v6

| # | Área | Hallazgo | Severidad |
|---|------|----------|-----------|
| 1 | Aprendizaje | No había forma de **practicar la pronunciación**: el niño escucha pero nunca habla | Alta |
| 2 | Aprendizaje | Sin juego de **lógica/categorías** (todos los juegos eran de vocabulario directo) | Media |
| 3 | Estudio | Las 757 palabras no eran explorables: solo se ven dentro de misiones | Media |
| 4 | Motivación | Lograr 3⭐ no tenía reconocimiento «físico» que los padres puedan exhibir | Media |
| 5 | Padres | La Zona de padres no mostraba **cuándo** juega el niño (solo totales) | Media |
| 6 | Contenido | 25 assets seguían siendo ilustraciones planas (deuda v4/v5 pendiente de cuota) | Media |
| 7 | Gamificación | El mapa era idéntico cada día; faltaba un motivo diario para volver a un mundo | Baja |
| 8 | Tienda | Colección de 8 avatares se completa rápido para jugadores frecuentes | Baja |
| 9 | Bug latente | Pantallas nuevas no registradas en `SCREENS` quedaban encendidas detrás al navegar (detectado por el test E2E al integrar v7) | Media |

## 2) Propuestas del equipo (y decisiones)

- **🗣️ Pedagogía:** el paso natural tras reconocer palabras es **producirlas**. → 🎤 *Say It!*: escucha (2 velocidades) → graba tu voz → compárate. Sin vergüenza: la grabación vive solo en memoria y no se guarda. ✅
- **🧠 Cognición:** clasificar es una habilidad previa al pensamiento matemático. → 🕵️ *Odd One Out* (¿Cuál no pertenece?) reutilizando los 76 mundos como categorías, con revelado de palabras al responder para convertir el error en enseñanza. ✅
- **📚 Contenido:** un **Diccionario** visual con audio y estado por palabra (🌱 nueva / ✅ aprendida / 🏆 dominada según aciertos registrados en `mastery`), con filtros por nivel y mundo. ✅
- **🎓 Familia:** **diplomas imprimibles** por mundo 3⭐ y por nivel, con nombre y foto del niño, imprimibles vía `window.print()` con estilos de impresión dedicados. ✅
- **📊 Transparencia para padres:** gráfico de barras (canvas) de misiones por día (14 días) + 4 estadísticas nuevas. ✅
- **🎡 Retención:** **mundo destacado del día** con monedas x2 (determinista por fecha, mismo para todos los mundos del nivel). ✅
- **🛍️ Economía:** 4 avatares nuevos (conejo, koala, búho, dragón) con precios escalados hasta 350 🪙. ✅
- **🖼️ Presentación:** se reanudó el pipeline de fotos reales → **25 sustituciones** completadas (0 fallos). El `bone` verificado en v6 quedó protegido y fuera del pipeline. ✅

## 3) Cambios aplicados en v7

### Nuevos juegos y estudios (`js/games2.js`, nuevo módulo)
- 🎤 **Say It!** (estudio de pronunciación): 6 palabras por sesión del nivel actual; botones Escuchar / Grabar / Escucharme; `MediaRecorder` con parada automática a 4,5 s; degradación amable si no hay micrófono (mensaje + práctica por imitación); +XP/monedas y `sayGames`.
- 🕵️ **Odd One Out**: 8 rondas, 3 fotos de un mundo + 1 intruso de otro; récord de errores sobre la palabra del intruso; revelado de palabras al responder; estadística `oddGames`.
- 📚 **Mi Diccionario**: 757 fichas con foto (o numeral en Números), TTS al tocar, filtros 🌍/niveles/mundos y contadores globales.
- 🎓 **Diplomas**: pestaña nueva en Premios (6ª), modal-certificado con foto/avatar y **impresión** (`@media print` solo muestra el diploma).
- 📊 **Gráfico de actividad**: canvas con barras de misiones/día (14 días) en Ajustes → Zona de padres.
- ⭐ **Mundo destacado**: cinta «Hoy x2 🪙» en el mapa y monedas duplicadas al terminar esa misión (celebración lo anuncia).

### Integración
- `coreReward` ahora registra **maestría por palabra** (`p.mastery`), que alimenta el Diccionario.
- `endMission` registra **misiones por día** (`missionsByDay`) y aplica el x2 del mundo destacado.
- Zona de Juegos: 5 → **8 tarjetas**; premios: 5 → **6 pestañas**; Ajustes: sección de actividad nueva.
- Saludo por hora en el hero; favicon 🌈; precarga de fotos de la siguiente pregunta.
- `data_meta.js`: +6 insignias (voz ×2, intruso ×2, diccionario, graduado), tienda 8 → 12 avatares, `migrateProfile` ampliado (`mastery`, `sayGames`, `oddGames`, `dictVisits`, `missionsByDay`) — **perfiles antiguos migran sin perder nada**.

### Contenido y assets
- 25 ilustraciones → **fotos reales** (arm, leg, collar, skeleton, trex, guitar, car, storm, lightning, airplane, yoyo, chili, cape, helmet, laser, lobster, octopus, leash, syringe, notes, microphone, thumbsup, finger, desk, speaker).
- 4 avatares IA nuevos (av_bunny, av_koala, av_owl, av_dragon).
- Total: **390 fotos de vocabulario + 18 avatares**, verificadas (0 referencias rotas).

### Correcciones
- 🐛 `SCREENS` incluía las nuevas pantallas… tras detectar con el E2E que quedaban encendidas detrás del mapa (bug real de integración, corregido en `ui.js`).
- 🛡️ Botón «Siguiente» del estudio con `position:sticky`: nunca queda bajo la barra inferior en móviles.

## 4) Qué NO cambió (por decisión)

- **Sin conexión entre dispositivos**: todo sigue en `localStorage`; exportar/importar JSON sigue siendo la vía manual de respaldo.
- Las grabaciones de voz **no se guardan**: solo memoria del navegador.
- Mecánica de misiones, vidas, XP y niveles intactos (ya validados v3–v6).

## 5) Pruebas realizadas

- `node --check` en los 12 módulos JS: sin errores de sintaxis.
- Validación de datos: 76 mundos / 757 palabras / 82 insignias / 12 avatares / **0 imágenes faltantes**.
- **E2E Playwright** (`v7_test.cjs`): zona de juegos con 8 tarjetas → Say It con **micrófono real simulado** (graba, habilita reproducción, suma sesión e insignia) → Intruso completo 8/8 con revelado y resultado → Diccionario (201 fichas N1 · 757 totales · filtros · maestría ✅) → Diplomas (3, modal con nombre, insignia 🎓) → **mundo destacado 10/10 con monedas x2 verificado** → gráfico dibujado → 14 estadísticas de padres → regresión de los 5 juegos v5 → **0 errores JS**.
- **Responsive** (`v7_resp.cjs`) en 390×844, 820×1180, 1366×705 y 1920×1080: sin scroll horizontal en mapa/estudio/intruso/diccionario, botón Siguiente siempre visible, diploma y gráfico caben en los 4 tamaños, **0 errores JS**.
- Capturas en `download/vistas_previas_v7/`.
