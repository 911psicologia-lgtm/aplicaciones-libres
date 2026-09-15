# 🔍 AUDITORIA-v8 — PequeWorld (metodología DSEBI)

**Fecha:** 2026-09-14 · **Producto:** PequeWorld v7 → v8 · **Modo:** 100% local (localStorage), sin conexión entre dispositivos.

Petición del usuario: auditoría multiagente bajo metodología **DSEBI** (Diagnóstico → Benchmarking → Rediseño → Tabla de mejoras → Aprobación). El usuario aprobó **«Todas (A+B+C)»**. Este documento resume el análisis y la implementación.

---

## 1) Base de evidencia

- **Código real v7** leído en su totalidad (index.html, 12 módulos JS, 4 CSS, worklog v1-v7, auditorías v5/v7).
- **Búsqueda web real** (9 consultas): Duolingo ABC, Lingokids, Khan Academy Kids, Endless Alphabet, Baby First Words, gamificación ética, doble codificación, AAP y repetición espaciada. Resultados en `scripts/bench/*.json`.
- Verificación en código: sin manifest/SW (PWA ausente), fuentes vía CDN, `user-scalable=no`, 12 atributos alt/aria, sin `prefers-reduced-motion`.

## 2) Diagnóstico (resumen de 12 dimensiones)

| Prioridad | Hallazgo |
|---|---|
| Alta | Sin tour ni objetivo visible; sin puerta parental en importar/borrar; repaso sin priorización temporal |
| Media | Sin PWA/offline garantizado; accesibilidad mínima (zoom bloqueado, alt parciales); sin guard de cuota; sin informe imprimible para padres; Say It! sin verificación automática |
| Baja | Sin hitos de dominio (retorno solo monetario); identidad visual sólida — preservativa, sin rediseño |

## 3) Benchmarking (fuentes reales de la búsqueda)

- **Duolingo ABC**: gratis, 700+ lecciones, fonics explícito/sistemático → aprendimos: objetivo visible y lecciones por trozos.
- **Lingokids**: Common Sense Media 3.0; quejas por suscripción y alcance; su dashboard de padres es su punto fuerte elogiado → igualado y superado (informe imprimible + privacidad local).
- **Khan Academy Kids**: 100% gratis sin anuncios, 4.8★ → validación del modelo «gratis y sin nagging» que PequeWorld ya sigue.
- **Endless Alphabet**: vocabulario interactivo con sonido → reforzó el valor de audio + juego.
- **Crítica transversal (r/Parenting)**: suscripciones y nagging → PequeWorld lo convierte en diferencial (100% local, sin cuentas).

**Ideas descartadas** (no encajan con identidad ni requisito): cuentas cloud/sincronización, leaderboards online, anuncios/compras, vidas-energía.

## 4) Evidencia aplicada (con marcas de verificación)

- Doble codificación palabra+imagen (Sadoski 2005; Li 2022, PMC) → ya cumplida con fotos reales; la crítica «los visuales pueden retroceder» justifica el pipeline de validación de assets.
- Repetición espaciada (Saksittanupab 2024) → implementada de forma simple en el repaso priorizado (fallos×2 + días×3, tope 7).
- Rachas y gamificación (Sepúlveda 2026 ACM — diseño no causal; revisión Aalto 2023; Schiele 2025) → mantenemos racha suave y añadimos hitos de dominio (retorno ligado al aprendizaje).
- Uso saludable (AAP, Pediatrics 2016; guía digital 2024/26) → consejos incluidos en el informe de padres y en la Zona de padres.
- **Promesas evitadas**: no se afirma que la app «enseñe a leer» ni «método probado» — es vocabulario/comprensión con evidencia de apoyo.

## 5) Implementación (A+B+C)

### A. Imprescindibles
| # | Mejora | Dónde |
|---|---|---|
| A1 | Tour de bienvenida (3 pasos) + objetivo visible + botón «¿Cómo funciona?» | `games3.js` (startTour), `index.html`, `doEnter` |
| A2 | Puerta parental (multiplicación) en importar y reiniciar | `games3.js` (askAdult), `ui.js` |
| A3 | Accesibilidad: zoom permitido, `prefers-reduced-motion`, alt completos, foco visible | `index.html`, `effects.js`, `utils.js`, `games3.css` |
| A4 | Guard de cuota con aviso + último recurso sin base64 | `ui.js` (saveState) |
| A5 | PWA (manifest + sw.js, registro seguro) + fuentes locales woff2 | `manifest.webmanifest`, `sw.js`, `assets/fonts/`, `css/fonts.css` |

### B. Alto valor
| # | Mejora | Dónde |
|---|---|---|
| B1 | ⚡ Sesión Rápida de 5 min (repasos + novedades, 8 preguntas) | `games3.js` |
| B2 | Repaso priorizado (espaciado simple) | `games3.js` (prioritizedMistakes), `games.js` |
| B3 | Informe de padres imprimible + consejos AAP | `games3.js`, `games3.css` (@media print) |
| B4 | 🏆 Hitos de dominio (álbum 10→500) con celebraciones y 4 insignias | `games3.js`, `data_meta.js` |
| B5 | Selector de voz EN + previsualización | `audio.js`, `games3.js`, `ui.js` |
| B6 | Declaración de privacidad en Zona de padres | `ui.js` |

### C. Evolutivas
| # | Mejora | Dónde |
|---|---|---|
| C1 | 🗣️ Dictado (SpeechRecognition con degradación amable) | `games3.js` (sayDictate) |
| C2 | 3 mundos nuevos: Tech World, Sweet Shop, Bedtime (+25 palabras) | `data_worlds4.js` |
| C3 | 🧩 Sentence Builder (oraciones guiadas, fallo suave) | `games3.js` |
| C4 | 👥 Cambiar de jugador | `games3.js` (switchPlayer) |
| C5 | 🔵 Rhyme Time (9 pares verificados con assets existentes) | `games3.js` |

**Qué NO cambió (decisión preservativa):** mecánica de misiones/vidas/XP, cofre, ruleta, tienda, ranking, diplomas, avatar cámara/galería, repaso de errores (solo reordenado), todo el contenido v7 y el guardado 100% local con migración automática.

## 6) Datos nuevos

- **79 mundos / 782 palabras** (antes 76/757) · **90 insignias** (antes 82) · 6 hitos.
- 0 imágenes faltantes, 0 duplicados (validador `scripts/v8_validate.mjs`).
- Los 3 mundos nuevos reutilizan fotos verificadas: **cero assets nuevos, cero riesgo**.

## 7) Pruebas realizadas

- `node --check` en los 14 módulos JS + sw.js: sin errores de sintaxis.
- Validación de datos: 79/782/90/12/6, 0 duplicados, 0 imágenes faltantes.
- **E2E Playwright** (`scripts/v8_test.cjs`) — **TODO VERDE ×2 pasadas, 0 errores JS**: fuentes locales cargadas (sin CDN), tour 1ª vez + no vuelve, 11 tarjetas de juegos, ⚡Rápido completo, Oraciones ×2, Rimas completa, álbum de hitos + cruce del hito 10 con celebración, 90 insignias, selector de voz, informe con nombre y consejos AAP, puerta parental (bloquea mal respuesta, continúa con la correcta), cambio de jugador, dictado con fallback, mundos v8 en mapa y misión Tech World.
- **Responsive** (`scripts/v8_resp.cjs`) en 390×844 / 820×1180 / 1366×705 / 1920×1080: sin scroll horizontal, todo alcanzable y visible, **0 errores JS**.
- **Regresión v5-v7**: memoria (pareja destapada), ruleta, compra en tienda (500→400🪙), diccionario (201 fichas N1), exportación — **OK, 0 errores JS**.
- Capturas en `download/vistas_previas_v8/` (7 escenas × 4 dispositivos).

## 8) Pendiente de verificación / decisiones futuras

1. Citas científicas: respaldadas en snippets reales de búsqueda hoy; verificar papers completos antes de publicar afirmaciones externas.
2. Evaluación automática de pronunciación (scoring): requiere IA externa → rompería el 100% local; queda como decisión futura del dueño.
3. Contraste AA de textos sobre dorado: por verificar con herramienta dedicada (el foco visible ya mejora la navegación por teclado).
4. Sincronización multi-dispositivo: excluida por requisito del dueño (todo local).
