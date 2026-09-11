# 🔍 AUTOAUDITORÍA v5 — PequeWorld

**Fecha:** 2026-09-11 · **Producto:** PequeWorld v4 → v5 · **Modo:** 100% local (localStorage), sin conexión entre dispositivos.

Tras la petición de nueva mejora integral, el equipo revisó toda la app (código, 393 assets, pantallas y flujos) y ejecutó las mejoras. Este documento resume el proceso completo.

---

## 1) Hallazgos de la auditoría

| # | Área | Hallazgo | Severidad |
|---|------|----------|-----------|
| 1 | Contenido | Faltaban temas básicos de primeras palabras: **granja**, **verduras** y **lugares del pueblo** | Alta |
| 2 | Contenido | Mundos cortos: Weather (6 ítems) y Body (8 ítems) | Media |
| 3 | Presentación | ~70 assets seguían siendo ilustraciones planas (deuda de la v4: la API de imágenes estaba sin cuota) | Alta |
| 4 | Presentación | Portadas duplicadas en el mapa: Vowels/Colors/Fruits usaban la misma manzana; Animals/Pets el mismo perro; fotos B/N en Hello! | Media |
| 5 | Gamificación | Las monedas se acumulaban sin poder gastarse: **no había tienda ni motivo para ahorrar** | Alta |
| 6 | Gamificación | Falta un gancho diario fuerte más allá de la meta diaria (recompensa sorpresa) | Media |
| 7 | Repaso | El repaso de errores solo tenía 2 tipos de pregunta (foto→palabra y completar letra) | Media |
| 8 | Juegos | Sin juego de memoria clásico ni entrenamiento de **comprensión auditiva** pura | Media |
| 9 | UX | El hero del mapa mostraba siempre la mascota, ignorando la foto del niño | Baja |
| 10 | UX | Los padres no tenían forma de ver el progreso ni de hacer copia de seguridad | Media |
| 11 | Bug | «Reiniciar perfil» borraba claves nuevas de estadísticas (v4) dejando el objeto incompleto | Media |
| 12 | Bug | pickAv no limpiaba la foto personalizada al elegir un avatar fijo (estado residual) | Baja |

## 2) Propuestas del equipo (y decisiones)

- **👩‍🏫 Pedagogía:** añadir mundos de granja/verduras/pueblo (palabras concretas y cotidianas) + ampliar Clima y Cuerpo. ✅ Hecho.
- **🎨 UX/UI:** foto del niño en el hero, portadas únicas por mundo, reemplazar ilustraciones por fotos reales IA. ✅ Hecho (las que la cuota permitió; el script `v5_gen_assets.mjs` es reanudable).
- **🎮 Game Design:** economía cerrada → **Tienda de Avatares** (8 coleccionables con precios) + **Ruleta diaria**. ✅ Hecho.
- **🧠 Aprendizaje:** juego **Memorama** (memoria visual), juego **Escucha y Elige** (oído sin apoyo de texto) y tipo «escucha» añadido al repaso de errores. ✅ Hecho.
- **🛠️ Backend local:** Zona de padres con estadísticas + exportar/importar progreso (JSON), sin servidores: todo sigue en `localStorage`. ✅ Hecho.

## 3) Cambios aplicados en v5

### Contenido
- 🐮 Mundo nuevo **Farm Animals** (Nivel 1, 8 palabras: cow, pig, horse, sheep, duck, chicken, goat, barn).
- 🥦 Mundo nuevo **Vegetables** (Nivel 2, 10 palabras).
- 🏘️ Mundo nuevo **My Town** (Nivel 2, 10 palabras: school, park, store, hospital, library, zoo, bakery, bridge, street, city).
- ⛅ Weather ampliado 6→10 (fog, storm, lightning, umbrella).
- 🧍 Body ampliado 8→14 (arm, leg, finger, teeth, knee, shoulder).
- **Vocabulario total: 757 palabras en 76 mundos** (antes 719/73).
- 31 fotos nuevas generadas con IA para el contenido nuevo + 4 portadas exclusivas.

### Juegos y repaso
- 🃏 **Memorama**: 12 cartas (6 parejas foto+palabra) de un mundo aleatorio; las parejas «de primera» dan recompensa extra.
- 🎧 **Escucha y Elige**: solo audio (sin texto) → 4 fotos; entrena la comprensión auditiva.
- 🔁 Repaso de errores mejorado: ahora mezcla **3 tipos** (foto→palabra, completar letra y escucha).
- La Zona de Juegos pasa de 3 a 5 juegos.

### Gamificación y premios
- 🛍️ **Tienda de Avatares**: 8 personajes coleccionables (león, panda, rana, zorro, pingüino, dino, robot, unicornio) de 100 a 300 monedas. Se compran desde la pestaña «Tienda» de Premios o desde el propio estudio de avatar. Todo queda guardado en el perfil local.
- 🎡 **Ruleta diaria**: 1 giro gratis al día con 8 premios (monedas, XP, estrellas y jackpot); banner en el mapa con animación de giro.
- 🏅 11 insignias nuevas: ruleta (×1, ×7), tienda (primer avatar, colección completa), memoria (×1, ×10), escucha (×1, ×10) y maestros de los 3 mundos nuevos.
- 🎁 Los perfiles antiguos se migran automáticamente (campos `unlockedAvatars`, `lastSpin`, estadísticas v5) sin perder progreso.

### Presentación
- 🧑 El hero del mapa muestra **la foto del niño** (cámara/galería) en lugar de la mascota.
- 🖼️ Portadas distintivas anti-duplicado para 29 mundos (bloques ABC, pinturas, cesta de frutas, números…).
- 📷 ~50 ilustraciones reemplazadas por **fotos reales generadas con IA** (gestos, emociones, profesiones, familia, objetos); las que quedan pendientes por cuota de API conservan su ilustración v4 y el script incluido las actualizará al re-ejecutarse.

### Correcciones
- 🐛 «Reiniciar perfil» ahora restaura el estado completo (incluye estadísticas v5 y vacía el saco de errores).
- 🐛 Al elegir un avatar fijo se limpia la foto personalizada residual.
- 🛡️ Falta de un asset nunca rompe la app: cada `<img>` tiene respaldo con emoji.

## 4) Qué NO cambió (por decisión)

- **Sin conexión entre dispositivos**: el progreso sigue guardándose solo en `localStorage` del navegador/dispositivo. La nueva función de exportar/importar permite mover el progreso *manualmente* entre dispositivos (archivo JSON), manteniendo el principio local.
- Voz, niveles, XP, vidas y mecánica de misiones se mantienen como estaban (ya validados en v3/v4).

## 5) Pruebas realizadas

- `node --check` en los 11 módulos JS: sin errores de sintaxis.
- E2E con Playwright: crear perfil → mapa con 5 juegos → ruleta → compra de avatar → memoria → escucha → repaso → resultados (ver `scripts/v5_test.cjs`).
- Responsive en 4 viewports (390×844 móvil, 820×1180 tablet, 1366×705 laptop-bajo, 1920×1080 PC): sin scroll horizontal ni elementos tapados.
