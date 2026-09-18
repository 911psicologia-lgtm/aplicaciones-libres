SP · BIBLIOTECA DE SONIDOS DEL PODCAST — estructura para assets propios
=======================================================================

Fase actual (R10.14):
SP incluye una biblioteca de sonidos SINTETIZADOS generados por la propia
aplicación (1-6 s, libres de derechos, sin licencias inventadas). Cada sonido
se genera bajo demanda y queda cacheado en IndexedDB (mpf-sp-studio → store
"audio" con ids snd_*). Metadatos en sp.js → SOUND_LIBRARY:
  { id, name, category, type, seconds, file, seed }

Categorías iniciales (según especificación):
  ACADÉMICO/REFLEXIÓN · EDUCACIÓN · PSICOLOGÍA/BIENESTAR · CONVERSACIÓN ·
  HISTORIA/DOCUMENTAL · CIENCIA/TECNOLOGÍA · CULTURA LATINOAMERICANA ·
  NATURALEZA · MISTERIO · ACTUALIDAD/NOTICIAS

Subtipos: intro · transition · interlude · outro · effect

Fase siguiente (reservado, sin datos ahora):
Coloca aquí tus propios archivos .wav/.mp3 libres de derechos respetando el
patrón de nombres de SOUND_LIBRARY. El módulo está preparado para cargarlos
de estos directorios con prioridad sobre los sintetizados:

  /assets/podcast/intro/sp-intro-<cat><a|b>.wav
  /assets/podcast/transition/sp-trans-<cat><a|b>.wav
  /assets/podcast/outro/sp-outro-<cat><a|b>.wav
  /assets/podcast/effects/sp-fx-<cat><a|b>.wav

donde <cat> es el índice 0-9 de la categoría (orden de la lista anterior).

NO subas material protegido por copyright.
