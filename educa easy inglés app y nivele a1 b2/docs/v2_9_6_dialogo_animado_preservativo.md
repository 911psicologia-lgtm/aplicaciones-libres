# v2.9.6 · Diálogo animado preservativo

## Cambios
- Se agregó el botón `🎬 Diálogo animado` en cada tarjeta de Diálogo integrador.
- Se incorporaron 30 diálogos animados originales, uno por mundo M1–M30.
- El modal es interno, responsive y tipo chat.
- Controles: Play, Pausa, Inglés, EN–ES, Sin voz, Lento/Normal, Repetir frase, Anterior, Siguiente y Cerrar.
- Se usa Web Speech API / speechSynthesis del navegador, sin audios externos.
- Se guardan preferencias en localStorage: `dialogueVoiceMode`, `dialogueVoiceSpeed`.
- Se guarda avance independiente en `animatedDialogueProgress`.
- Cerrar o pausar cancela voz y temporizadores.
- El avance de microlecciones, video, traducción y diálogo integrador existente no fue modificado.

## Validación
- JS validado con `node --check`.
- JSON y manifest validados.
- Módulo namespaced con clases `adm-*` para no afectar estilos previos.
