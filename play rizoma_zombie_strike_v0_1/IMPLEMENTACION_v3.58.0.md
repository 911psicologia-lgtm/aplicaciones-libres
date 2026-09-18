# RIZOMA ZOMBIE STRIKE v3.58.0 — GUARDIAN TACTICAL ARBITER + RECOVERY RHYTHM

## Propósito
Consolidar las mecánicas tácticas acumuladas entre v3.52 y v3.57 sin añadir otra capa de saturación. La versión coordina Firma, Cerco, Enlace, Anclas, Duelo, Contramedida de Poder, Flow, Riposta, Contravector y Último Asalto mediante un árbitro de carga real.

## Implementaciones

### 1. Guardian Tactical Arbiter
Se añadió un árbitro ligero que evalúa:
- proyectiles hostiles visibles;
- hazards activos;
- esbirros presentes;
- cantidad de mecánicas tácticas simultáneas;
- estrés de combate;
- carga diferenciada para móvil y escritorio.

La lectura se cachea aproximadamente cada 120 ms para evitar cálculos redundantes por frame.

### 2. Prevención de solapamientos
El árbitro evita iniciar nuevas capas incompatibles cuando ya están activas otras mecánicas. Coordina:
- Signature Sequence;
- Cerco de Arena;
- Enlace de Escolta;
- Anclas de Fase;
- Duelo Rizoma;
- Contramedida Adaptativa.

No borra enemigos, proyectiles ni hazards existentes: aplaza únicamente nuevas capas.

### 3. Recovery Rhythm
Después de resoluciones favorables como Ruptura de Patrón, Riposta o Núcleo Expuesto, se abre una recuperación muy breve. Durante ella se retrasan nuevos esbirros, escoltas y hazards para que el jugador pueda leer el resultado de su acción.

### 4. Prioridad real de Último Asalto
Último Asalto pasa a tener prioridad sobre estados tácticos secundarios pendientes. Al activarse cancela únicamente Cerco/Enlace/Firma/Duelo pendientes, sin borrar amenazas físicas ya presentes.

### 5. Anclas de Fase diferidas
Las Anclas que correspondan a una nueva fase ya no tienen que aparecer encima de la ruptura de fase. Si la transición está activa, quedan pendientes y el árbitro las libera cuando la arena vuelve a estar legible.

### 6. Protección por carga elevada
Cuando la carga táctica supera el umbral móvil/escritorio, se retrasan brevemente nuevas generaciones de esbirros, escoltas y hazards. No se reduce HP, daño ni dificultad base.

### 7. Telemetría
Se agregaron:
- `tacticalDeferrals`
- `tacticalRecoveries`
- `overlapPreventions`
- `maxBossLoad`

La pantalla final puede mostrar arbitrajes y pico de carga del Guardián.

## Conservación
- 20 mundos intactos.
- Curva base de HP intacta.
- Assets intactos.
- Patrones base, especiales, movimiento cinético, Director Adaptativo y resurrección preservados salvo inicialización/reset del nuevo árbitro.
- No se añade Mundo 21.
