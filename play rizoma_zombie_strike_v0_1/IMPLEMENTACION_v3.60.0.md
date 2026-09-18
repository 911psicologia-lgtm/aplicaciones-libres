# RIZOMA ZOMBIE STRIKE v3.60.0 — TACTICAL COHESION + SPAWN GATES

## Objetivo
Consolidar los sistemas tácticos introducidos entre v3.52 y v3.59 sin añadir otra mecánica grande. La prioridad es evitar solapamientos, estabilizar el ritmo, limitar recuperaciones acumulativas y controlar nuevos spawns según la carga real de la arena.

## Implementaciones

### 1. Contrato de prioridad táctica
Se formaliza una jerarquía de estados: **Último Asalto > Ruptura > Duelo > Anclas > Firma > Contramedida > Cerco > Enlace**. Un sistema de menor prioridad no puede abrirse encima de otro de mayor prioridad salvo eventos explícitamente forzados, como la firma del Último Asalto.

### 2. Spawn Gates centralizados
Los spawns ecológicos de minions, escoltas y hazards pasan por `bossTacticalSpawnAllowed()`. El gate utiliza la carga cacheada del Árbitro y umbrales algo más conservadores en móvil. Si se bloquea un spawn, solo se retrasa unas décimas; no se borra contenido existente.

### 3. Presupuesto de recuperación
Las ventanas de recuperación posteriores a Riposta, Ruptura, Anclas y Núcleo Expuesto consumen un presupuesto que se regenera lentamente. Esto conserva la recompensa por habilidad, pero evita concatenar pausas demasiado extensas.

### 4. FOCO con histéresis
El momentum se suaviza y FOCO entra/sale con umbrales distintos. Así el HUD y la ecología no oscilan por cambios mínimos. FOCO se mantiene al menos un intervalo corto antes de poder cerrarse.

### 5. Bandas de carga táctica
El Árbitro clasifica la carga en `calm`, `balanced`, `high` y `critical`, y registra segundos de carga alta/crítica. Esto mejora el diagnóstico de mundos demasiado densos sin alterar el combate por sí mismo.

### 6. Telemetría ampliada
Se añaden `focusActivations`, `spawnBlocks`, `recoveryBudgetExhaustions`, `highLoadSeconds` y `criticalLoadSeconds`. La pantalla final resume spawns diferidos, activaciones de Foco y tiempo de carga crítica cuando existen.

## Conservación
- 20 mundos; no se crea Mundo 21.
- Sin cambios deliberados a HP base, economía, poderes, assets o progresión.
- Los patrones de disparo y movimiento de los bosses permanecen como base; esta versión coordina cuándo entran capas ecológicas nuevas.
