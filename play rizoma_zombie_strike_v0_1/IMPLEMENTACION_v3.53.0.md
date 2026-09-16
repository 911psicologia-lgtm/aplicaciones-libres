# RIZOMA ZOMBIE STRIKE v3.53.0 — ARENA CONTROL + ESCORT SYNERGY

## Objetivo
Añadir inteligencia espacial a los Guardianes sin aumentar HP ni convertir el combate en saturación. La nueva capa reacciona al abuso de bordes/sectores repetidos y permite ataques sincronizados con escoltas vivas.

## Implementaciones

### 1. Cerco de Arena
- El boss registra cuánto tiempo permanece el jugador en bordes, esquinas y sectores de la arena.
- Si el patrón se vuelve repetitivo, se activa un telegráfico de 0,86 s.
- Después aparece un barrido móvil `bossPressure` que empuja y causa daño moderado, obligando a reposicionarse.
- M16–M20 pueden desplegar dos bandas paralelas; mundos anteriores usan una.
- El sistema no se activa durante telegráficos signature, Último Asalto ni cuando la pantalla está saturada.

### 2. Enlace de Escolta
- Si hay al menos dos escoltas de boss vivas, pueden enlazarse visualmente con el Guardián.
- Tras 0,72 s de aviso, las escoltas disparan desde ángulos distintos hacia una posición predictiva del jugador mientras el boss ejecuta un disparo central.
- Si el jugador elimina una escolta y quedan menos de dos nodos, la secuencia se cancela.
- Cooldown adaptado a mundos tardíos.

### 3. Zona móvil de presión
- Nuevo tipo de zona `bossPressure` con trayectoria, empuje y lectura direccional.
- Renderizado con anillo discontinuo y eje de movimiento.
- No sustituye hazards de mundo; funciona como capa táctica temporal del Guardián.

### 4. Telemetría
Se añaden:
- `boss.arenaCounters`
- `boss.escortCombos`

## Conservación
- Sin cambios de HP base.
- Sin nuevos assets.
- Sin cambios en economía/progresión.
- Se preservan Adaptive Director, resurrección, Combat Flow, Tactical Memory, Signature Chains y Last Stand.
