# AUDITORIA v15 — «Mi compañero, favoritas y canto»

Fecha: 2026-09-22 · Alcance autorizado por el usuario: «aplica nuevas mejoras»
(6.ª autorización consecutiva; misma vía admisible de v11–v14).

## 1. Criterio de admisión (mismo de v11–v14)
- 100 % localStorage, cero red, cero cuentas, cero sincronización.
- UI en español envolviendo contenido en inglés (para niños 3–7).
- Aditivo: no se modifica el motor de misiones G, ni el flujo E2E verificado.
- Compatibilidad file:// (doble clic) intacta; SW solo http/localhost.
- Cero regresiones: 92→94→96→106 insignias y todos los juegos previos intactos.

## 2. Exploración previa anti-duplicar (hecha ANTES de diseñar)
| Idea candidata | Veredicto | Motivo |
|---|---|---|
| 🃏 Memorama nuevo de mesa | DESCARTADO | Ya existe (v5, `startMemoryMission`, badges mem1/mem10) |
| 🧩 Emparejar | DESCARTADO | Ya existe (v1, `startMatchMission`) |
| 🔥 Racha de días | DESCARTADO | Ya existe: maxStreak + calendario de estrellas v12 |
| ⏱️ Reto relámpago 60 s | DESCARTADO | Solapa con ⚡ Rápido (v8, `quickGames`, 5 min) |
| 📸 Álbum de fotos | DESCARTADO | v13 ya lo descartó; Diccionario v8 cubre galería |
| 🎓 Diplomas | DESCARTADO | Existen desde v5 |
| 🎤 Grabar voz | DESCARTADO | Existe «Di la palabra» (v7) |
| 🐣 Mascota que crece | **ELEGIDO** | Los mundos «Pets» son vocabulario, NO hay compañero virtual |
| ❤️ Favoritas en Diccionario | **ELEGIDO** | El Diccionario no tiene marcado personal (dictOk/dictTry son de quiz) |
| 🎵 Canta el ABC | **ELEGIDO** | No existe ninguna canción; melodía local por WebAudio |
| 🎯 Cazaletras (discriminación visual) | **ELEGIDO** | Único juego de reconocimiento de letras; complementa Trazo (escritura) |

## 3. Las 4 novedades

### 3.1 🐣 Mi compañero Peque (mascota que crece con XP)
- 5 etapas por XP TOTAL del perfil (derivado, no almacena extra):
  0 → 🥚 Huevo mágico · 200 → 🐣 Recién nacido · 600 → 🐥 Explorador ·
  1500 → 🦅 Campeón · 3000 → 🐲 Leyenda.
- Chip en el mapa (anclado a #dailyGoal, patrón v12/v13) + panel modal:
  nombre editable (p.petName, default «Peque», máx 12, sanitizado),
  barra a la siguiente etapa, frase cariñosa con TTS.
- Insignias: pet1 (nació, etapa ≥ 2), pet2 (campeón, etapa ≥ 4), pet3 (leyenda, etapa 5).
- Sin castigos, sin hambre, sin muertes: solo acompañamiento (3–7 años).

### 3.2 ❤️ Favoritas del Diccionario
- Corazón por ficha (span dentro del botón de la ficha + stopPropagation —
  botón dentro de botón sería HTML inválido).
- Chip «❤️ Favoritas (n)»: muestra SOLO las marcadas (ignora nivel/mundo);
  tocar cualquier chip de nivel o mundo apaga el modo favoritas.
- Persistencia: p.favs = { palabraEn: true } (migrado).
- Insignias: fav1 (1.ª favorita), fav10 (10 favoritas).

### 3.3 🎵 Canta el ABC
- Melodía del abecedario (arreglo basado en Twinkle) sintetizada con
  WebAudio (oscilador triangle + envolvente de ganancia; AudioContext
  perezoso creado en el gesto del usuario). Cero recursos externos.
- 26 fichas A–Z se iluminan en tiempo con la melodía; al terminar:
  celebración + stats.abcGames + 8 XP + 4 🪙 + insignia abc1/abc5.
- Tocar una ficha fuera de la canción = TTS de la letra + ejemplo
  (A de Ant 🐜 … Z de Zoo 🦓) con traducción ES.
- Para el arnés: PW_ABC.play(fast=true) corre la MISMA secuencia a tempo
  acelerado (misma lógica de completado, solo cambia el tempo).
- Insignias: abc1, abc5. Respeta voiceEnabled para TTS; melodía es SFX local.

### 3.4 🎯 Cazaletras (discriminación visual de letras)
- 5 rondas: letra objetivo grande + rejilla de 10 fichas (3 objetivo +
  7 distractores elegidos de PARES DE CONFUSIÓN reales: b/d/p/q, M/W,
  E/F, U/V, I/L, O/Q, C/G, R/N, S/Z, T/F).
- Tocar bien = ficha dorada + beep; tocar mal = solo tiembla (cero castigos).
- Ronda completa → TTS letra + palabra ejemplo; sesión completa →
  +6 XP +3 🪙 + stats.huntGames + insignias hunt1/hunt10.
- Insignias: hunt1 (1.ª sesión), hunt10 (10 sesiones).

## 4. Impacto en código (aditivo, mismo patrón v14)
| Archivo | Cambio |
|---|---|
| js/games5.js | NUEVO: PET (chip+panel), ABC, HUNT + hooks PW_PET/PW_ABC/PW_HUNT |
| css/games5.css | NUEVO: estilos chip mascota, panel, fichas ABC, rejilla Cazaletras |
| js/ui.js | +1 línea guard en renderMap (renderPetChip) + 2 tarjetas gz guardadas por typeof |
| js/games2.js | renderDictionary: corazón por ficha + chip favoritas + filtro DICT.fav |
| js/data_meta.js | +9 insignias (115) + migrate (favs, petName, abcGames, huntGames) |
| index.html | título v15 + link games5.css + script games5.js + fila #dictFavChips |
| sw.js | CACHE pequeworld-v15 + games5.js/games5.css en precache |
| README.md | bloque v15 |

## 5. Riesgos y mitigación
- Botón dentro de botón (ficha diccionario) → corazón como <span> con
  stopPropagation: HTML válido y el toque de la ficha sigue hablando.
- AudioContext bloqueado sin gesto → se crea SOLO dentro del clic de ▶️.
- Melodía colgada si la pestaña pierde foco → guard _abcTimer con stop()
  en closeModal y al reabrir.
- Filtro favoritas vacío → mensaje amable «Aún no tienes favoritas…».
- Regresión en tarjetas gz (16→18) y badges (106→115) → tests viejos
  sincronizados explícitamente (v9, v11, v12, v13, v14, v10_pwa).

## 6. Descarte de riesgos NO asumidos
- Cámara en retos (v14 ya lo descartó: no verificable en local).
- Micrófono adicional: file:// puede bloquearlo; «Di la palabra» ya cubre voz.
- Sincronización entre dispositivos: prohibida por diseño (100 % local).
