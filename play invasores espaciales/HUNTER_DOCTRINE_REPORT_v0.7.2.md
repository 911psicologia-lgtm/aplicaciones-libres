# STARFALL FRONTIER v0.7.2 — HUNTER DOCTRINE

## Objetivo
Profundizar la línea **Encounter Evolution → Battle Rhythm** sin reconstruir el proyecto ni convertir la dificultad en simple inflación de HP o densidad de proyectiles. La v0.7.2 introduce inteligencia espacial legible, coordinación enemiga y especialización de escoltas.

## 1. Hunter Doctrine — contrap Patrones del boss
El boss registra muestras recientes de la posición horizontal del jugador durante la batalla. La lectura usa una ventana temporal, no un único frame, y detecta dos comportamientos: permanencia reiterada en un lateral y desplazamientos repetitivos en una misma dirección.

La reacción no usa seguimiento injusto. Cuando la doctrina se activa:

1. se bloquea la posición observada;
2. aparece un telegraph ancho de la futura zona de ataque;
3. el objetivo deja de seguir al jugador;
4. al terminar el aviso se ejecuta un contrap Patrón propio de la identidad del boss.

Esto permite que el jugador lea la amenaza y abandone la zona. Una evasión limpia y suficientemente amplia produce **LECTURA TÁCTICA** y bonificación de puntuación.

### Contrapatrones por identidad
- **Lancer:** pinza de lanzas convergentes.
- **Brood:** cazadores coordinados + proyectiles perseguidores retardados.
- **Gravity:** barrido de guadañas curvas.
- **Phoenix:** corte de pétalos ondulantes.
- **Nova/otros:** barrido solar lateral.

La doctrina comienza desde Fase II para conservar una primera fase pedagógica y escalable.

## 2. Threat Arbitration
Durante el telegraph de Hunter Doctrine se aplazan temporalmente:

- fuego básico del boss;
- pulsos de fortaleza;
- reposición automática de escoltas;
- invocaciones ordinarias de escolta;
- inicio de una nueva Signature.

El objetivo es impedir que varias capas fuertes se acumulen de manera ilegible. La dificultad procede de la decisión y la lectura, no del ruido.

## 3. Coordinated Formation Strike
Desde la oleada 2, una formación suficientemente íntegra puede seleccionar un pequeño grupo de tiradores frontales y preparar una descarga sincronizada.

- Móvil: hasta 2 tiradores.
- Escritorio: hasta 3 tiradores.
- Los blancos quedan bloqueados durante el telegraph.
- Alterna **FUEGO CRUZADO** y **FIJACIÓN DE BLANCO**.
- Las unidades cargando una descarga coordinada no pueden ser elegidas simultáneamente como dives normales.
- Al entrar la formación en su estado de desesperación se mantiene la lógica v0.7.1 de última carga/kamikaze.

## 4. Escort Doctrine
Las escoltas del boss dejan de usar un comportamiento único. Según el boss y su función pueden ser:

- **Rammer:** kamikaze/ariete.
- **Hunter:** corrige parcialmente trayectoria para cazar al jugador y usa seeker retardado.
- **Interceptor:** genera fuego de pinza a ambos lados del jugador.
- **Orbiter:** trayectoria ondulante y pares de proyectiles de anillo.
- **Gunner:** conserva ataque directo y puede realizar un segundo disparo.

Brood puede ordenar Hunter Swarms como parte de su contrap Patrón.

## 5. Equidad y continuidad
- La posición objetivo de Hunter Doctrine se bloquea al comenzar el aviso.
- Cambiar de posición durante el telegraph funciona como evasión real.
- Los nuevos timers se desplazan correctamente al pausar.
- Un cambio de fase cancela un contrap Patrón aún no ejecutado, evitando residuos entre fases.
- Reactor Reboot limpia también el estado Hunter Doctrine.
- Se conserva Battle Rhythm: signatures, ventanas de contraataque, perfect dodge, recuperación y mutaciones.

## 6. Sistemas preservados
Sin cambios en assets/audio, economía, mundos, progresión, Hangar, Boss Supply, Boss Fortress, hardpoints, módulos orbitales, Reactor Reboot, Reactive Matrix, Family Tactics, Micro-Swarm, Mission Director, checkpoints, PWA y responsive.

## 7. Validación
- Sintaxis JS: PASS.
- 37 pruebas JavaScript: PASS.
- `hunter-doctrine-v072.js`: PASS.
- Camping lateral detectado en simulación: PASS.
- Objetivo Hunter Doctrine bloqueado durante telegraph: PASS.
- Generación efectiva de contrap Patrón: PASS.
- Coordinación multi-tirador de formación: PASS.
- PWA cache/build sincronizados: PASS.
- Árbol assets/audio idéntico al trunk estable: PASS.
- `js/economy.js` idéntico al trunk estable: PASS.
