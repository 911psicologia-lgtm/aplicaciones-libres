# RIZOMA ZOMBIE STRIKE v3.49.0 — COMBAT FLOW ORCHESTRATOR

## Objetivo
Coordinar los sistemas de presión ya existentes para evitar dos extremos: saturación simultánea de eventos y pantallas realmente vacías. Esta versión no aumenta HP, daño ni recompensas y no reconstruye enemigos, Guardianes, naves, economía o progresión.

## Implementación

### 1. Combat Flow Orchestrator
Se añade una capa coordinadora que observa:
- enemigos visibles;
- proyectiles enemigos;
- hazards;
- partículas;
- estrés adaptativo del jugador;
- eventos de adrenalina;
- batalla de Guardián y mutación post-resurrección.

Calcula una presión normalizada 0–1 y mantiene cuatro estados internos: equilibrio, presión, respiración y reactivación.

### 2. Respiración anti-saturación
Si la presión se mantiene por encima de ~0,82 durante ~1,85 s, abre una ventana breve de ~2,6–3,4 s. No elimina enemigos ni proyectiles existentes. Solo evita que, durante esa ventana, se lancen simultáneamente nuevas amenazas frontales, eventos raros y nuevos contratos de adrenalina.

El Director de continuidad baja temporalmente su piso a 1–2 enemigos ligeros para que la respiración no equivalga a una pantalla completamente vacía.

### 3. Rescate anti-vacío
Si fuera de boss/antesala/adrenalina la pantalla permanece realmente vacía durante >1,25 s —sin enemigos visibles, casi sin proyectiles y sin hazards relevantes— se inserta una microformación ligera. Las formaciones rotan: abanico, pinza, lanza y dispersión.

Estos microenemigos reutilizan el sistema de continuidad ya existente, con HP, XP, monedas y score reducidos, por lo que no crean una ruta de farming.

### 4. Sincronización de sistemas
El orquestador coordina:
- Front Threat Director;
- Rare Events;
- Adrenaline Director;
- Continuity Enemy Director;
- Tactical Power Support.

No modifica los eventos ya activos: únicamente regula el lanzamiento de presión nueva.

### 5. Soporte táctico durante respiración
Durante una respiración, el soporte táctico prioriza herramientas defensivas/contextuales en lugar de aumentar ofensiva.

### 6. Telemetría
Cada intento puede registrar:
- flow.breathers;
- flow.deadZoneRescues;
- flow.maxPressure.

El informe del Laboratorio de Balance resume esas métricas para detectar mundos sobrecargados o demasiado vacíos con evidencia local.

### 7. Guía táctica
Se añade “↯ FLUJO” a la Guía Táctica para explicar al jugador que el sistema coordina microenjambres, adrenalina y amenazas sin alterar su build.

## Principio de diseño
La dificultad sigue dependiendo de esquiva, lectura, posicionamiento, build y manejo de amenazas. El orquestador no compensa el juego automáticamente ni elimina peligro: solo reduce solapamientos extremos y rescata silencios de combate reales.
