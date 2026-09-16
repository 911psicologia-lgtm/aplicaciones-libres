# RIZOMA ZOMBIE STRIKE v3.54.0 — COUNTERPLAY WINDOWS + PHASE ECOLOGY

## Objetivo
Profundizar la vía táctica de v3.52–v3.53: que el Guardián no solo presione mejor, sino que el jugador reciba oportunidades ofensivas por leer, esquivar e interrumpir correctamente sus mecánicas.

## Implementaciones

### 1. NÚCLEO EXPUESTO · contraataque por habilidad
- Una secuencia signature completada sin recibir daño puede abrir una ventana breve de contraataque.
- Superar un Cerco de Arena sin recibir daño puede abrir una ventana menor.
- Interrumpir un Enlace de Escolta destruyendo uno de sus nodos antes de la descarga abre una ventana reforzada.
- Esquivar completamente el Enlace de Escolta también puede otorgar una ventana breve.
- Durante la ventana, el daño llega directamente al núcleo del Guardián con factor controlado; no aumenta HP ni regala la victoria.
- Se aplica cooldown para evitar cadenas de exposición abusables.

### 2. ECOLOGÍA DE FASE
Cada fase tiene una prioridad táctica:
- F1 · DUELO: lectura base y menor interferencia periférica.
- F2 · CAZA: mayor prioridad de escoltas, enlaces y firmas.
- F3 · CERCO: aumenta la presión de hazards y control de arena.
- F4 · DEPREDADOR: reduce parte del relleno de minions y concentra la pelea en el Guardián, firmas y control espacial.

La ecología modifica ritmos, no HP base ni recompensas.

### 3. Integración con sistemas existentes
- Compatible con Memoria Táctica, Último Asalto, Cerco de Arena y Enlace de Escolta.
- La resurrección limpia cualquier exposición pendiente para evitar abuso.
- Rupturas de fase mantienen el reinicio táctico existente.

### 4. Telemetría
- `boss.counterplayWindows` registra ventanas de contraataque obtenidas.
- `boss.phaseEcologyTransitions` registra cambios de ecología/fase.

## Filosofía
La dificultad deja de ser solo “sobrevivir a más cosas”: el jugador puede convertir una buena lectura defensiva en una oportunidad ofensiva medible.
