# RIZOMA ZOMBIE STRIKE v3.55.0 — RIZOMA RIPOSTE + PHASE OBJECTIVES + POWER PATTERN COUNTERS

## Objetivo
Profundizar el counterplay iniciado en v3.54 sin sumar HP artificial, sin neutralizar las builds fuertes y sin aumentar saturación visual.

## Implementaciones

### 1. Riposta Rizoma
- Cada ventana de **NÚCLEO EXPUESTO** arma un medidor interno de contraataque.
- El daño efectivo realizado durante la exposición carga la Riposta.
- Si se supera el umbral antes de cerrar la ventana, la Nave Rizoma activa una descarga signature automática contra el Guardián.
- La Riposta está limitada por daño y por las protecciones ya existentes del boss.
- No genera cadenas infinitas: el daño de Riposta no recarga otra Riposta.

### 2. Anclas de Fase
- En las fases 2–4 pueden aparecer 1–2 objetivos temporales vinculados al Guardián.
- Son frágiles, no entregan monedas/XP ni farming.
- Destruir todas las anclas dentro de la ventana abre **NÚCLEO EXPUESTO**.
- Si expira el tiempo, no se añade HP: simplemente se adelanta la próxima secuencia signature del Guardián.
- Las anclas se limpian al cambiar de fase o durante una resurrección.

### 3. Contramedida por repetición de poderes
- Durante la batalla se registra una memoria corta de activaciones de poderes.
- Si el jugador repite el mismo poder varias veces en ~24 s, el Guardián prepara una respuesta geométrica.
- El poder NO se desactiva, NO pierde nivel y NO recibe nerf de daño.
- La respuesta selecciona una de las coreografías ya existentes: Pinza, Hélice, Caza o Cruz.
- Existe cooldown para evitar castigo constante.

### 4. Telemetría
Se incorporan:
- `playerRipostes`
- `phaseObjectives`
- `phaseObjectiveWins`
- `powerCounters`

## Conservación
- Sin nuevos assets.
- Sin incremento de HP base.
- Sin cambios a economía o progresión.
- Conserva Adaptive Director, resurrección, Counterplay Windows, Phase Ecology, Arena Control y Escort Synergy.
