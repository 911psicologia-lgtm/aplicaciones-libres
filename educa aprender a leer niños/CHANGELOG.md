# CHANGELOG · v0.8.6 · Lectura adaptativa

- Nuevo `js/learning/reading-adapt.js`.
- Estado local `readingSupport` con palabras, páginas, habilidades e historias.
- Los toques de ayuda sobre palabras ya alimentan el repaso, sin penalizar la puntuación.
- El audio-modelo del cuento se registra como apoyo; en cuentos `audioFocus` no se considera dependencia.
- Microinteracciones: registro de intentos, independencia y apoyo.
- Repaso “Semillas que vuelven”: hasta 2 palabras con necesidad real pueden convertirse en actividades auditivas `listenPick`.
- Dos recuperaciones independientes reducen de forma natural la prioridad de una palabra.
- Panel adulto: nueva sección “Apoyos de lectura observados”.
- Migración compatible desde el estado anterior (`readingSupport` se crea al cargar si no existe).
- PWA y contenido actualizados a 0.8.6.
