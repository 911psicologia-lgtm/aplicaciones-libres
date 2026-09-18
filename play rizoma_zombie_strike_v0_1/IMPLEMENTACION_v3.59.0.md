# RIZOMA ZOMBIE STRIKE v3.59.0 — TACTICAL STATE WATCHDOG + RIZOMA FOCUS

## Objetivo
Consolidar las mecánicas tácticas ya implementadas sin añadir otra capa pesada de contenido. La versión se concentra en estabilidad de estados, recuperación adaptativa, continuidad entre fases y legibilidad móvil.

## Implementaciones

### 1. Tactical State Watchdog
- Nuevo saneamiento periódico de estados del combate contra Guardianes.
- Detecta y corrige temporizadores no finitos.
- Cancela secuencias residuales durante Ruptura de Fase.
- Evita que Cerco, Enlace, Duelo, Anclas o contramedidas queden activos durante Último Asalto.
- Retira objetivos huérfanos cuando su estado activo ya no tiene nodos válidos.
- Registra `stateSanitizations` en telemetría local.

### 2. Recuperación adaptativa
- `grantBossTacticalRecovery()` ahora considera carga real de pantalla y estado del casco.
- La recuperación sigue siendo corta y no elimina amenazas existentes.
- Una situación más cargada o un jugador muy debilitado recibe unos décimos adicionales de separación antes de nuevas capas tácticas.

### 3. Rizoma Focus
- Las resoluciones limpias acumulan momentum táctico temporal.
- El momentum reduce parcialmente el ritmo de relleno (esbirros/escoltas/hazards) y aumenta ligeramente la prioridad de firmas directas del Guardián.
- El resultado buscado es un duelo más limpio y exigente, no menor dificultad.
- El efecto decae automáticamente si el jugador deja de encadenar buenas resoluciones.
- Telemetría: `momentumPeak` y `focusSeconds`.

### 4. HUD Rizoma contextual
El badge existente muestra, por prioridad:
- NÚCLEO
- ÚLTIMO
- DUELO
- FLOW
- VENTANA
- FOCO
- estado normal del especial

No se añadió un HUD adicional, evitando saturar móvil.

### 5. Continuidad
- No se modifica HP base de Guardianes.
- No se alteran economía, progresión, mundos ni assets.
- Se preservan Adaptive Director, resurrección, Arena Control, Escort Synergy, Núcleo Expuesto, Riposta, Flow, Contravector y Ruptura de Patrón.
