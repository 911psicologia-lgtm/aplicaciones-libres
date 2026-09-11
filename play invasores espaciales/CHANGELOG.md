# STARFALL FRONTIER v0.5.9 — ENDURANCE DIRECTOR + PHASE PRESSURE

## Objetivo
Evitar que la progresión permanente del jugador vuelva triviales a los jefes y subjefes, sin convertir a los enemigos comunes en esponjas de daño.

## Implementaciones
- **Endurance Director**: jefes y subjefes escalan parcialmente con las reliquias, la evolución del chasis y los aumentos permanentes de daño del jugador.
- El escalado se limita con topes para conservar combates razonables y no producir barras interminables.
- La **Fortaleza del jefe** también aumenta gradualmente con la progresión de la nave, hasta un bono máximo controlado.
- El **escudo de los subjefes** recibe una compensación progresiva menor.
- Cada fase del jefe incorpora un temporizador de **Presión I / Presión II**: si el combate se estanca, aumentan moderadamente movilidad, frecuencia de ataque, escoltas y pulsos defensivos.
- Los subjefes disponen de una presión equivalente, más suave.
- Al cambiar de fase del jefe se reinicia la presión, dejando una nueva ventana táctica y evitando una dificultad acumulativa injusta.
- La resurrección del jefe reinicia la presión y recupera Fortaleza relativa a su estructura real.
- HUD actualizado: muestra el nivel de presión activo del jefe; los subjefes indican P1/P2 junto a su nombre.

## Se conserva
- 3 oleadas + arena de jefe.
- Boss Fortress, módulos orbitales, sistemas destructibles y núcleo expuesto.
- Assets realistas W01–05 como arte principal.
- Family Tactics, Mission Director, Asteroid Director, Micro-Swarm y evolución visual de la nave.
- Quiet Audio: identidad sonora del armamento del jugador sin saturación.
- Responsive, checkpoints, guardado y watchdog de transición.
