# v2.10.3 · Hotfix 🎧 Diálogos animados sin fallback a M1

## Problema corregido
El repaso auditivo 🎧 cargaba M1 como reemplazo cuando no detectaba bien el módulo actual.

## Cambios
- `getAnimatedDialogueKey()` ya no devuelve M1 por defecto.
- `getAnimatedDialogue()` ya no usa `animatedDialogues[0]`.
- `getAvailableAnimatedDialogueForModule()` normaliza M1, world_1, lesson_x y números.
- Si no existe diálogo o el mundo está bloqueado, devuelve lista vacía.
- `buildAudioReviewItems()` usa módulo real y soporta scope module/route.
- `startAudioReviewFromPanel()` muestra aviso breve si no hay diálogo contextual.
- Se agregó recolector global `getAvailableAnimatedDialoguesForRoute()` para diálogos desbloqueados.

## Validación
- JS validado con node --check.
- Se verificó que no quede `animatedDialogues[0]`.
- No se modificó el módulo 🎬, progreso, evaluaciones ni frases.
