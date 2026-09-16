# STARFALL FRONTIER v0.7.3 — TACTICAL ECOSYSTEM

## Objetivo

Profundizar la evolución iniciada con **Encounter Evolution → Battle Rhythm → Hunter Doctrine** sin convertir el combate en una simple inflación de HP, velocidad o densidad de proyectiles. La v0.7.3 conecta consecuencias entre acciones del jugador, fases del boss y estructura de las formaciones enemigas.

## 1. Adaptive Memory / Eco Adaptativo

Los bosses conservan una memoria táctica limitada de esquivas limpias. Dos lecturas exitosas consecutivas pueden armar un **ECO ADAPTATIVO** para la siguiente firma en fases avanzadas.

- El eco no sigue al jugador durante el aviso.
- El objetivo se congela antes del telegraph.
- Posee una ventana visual independiente.
- Durante su resolución se arbitran signatures, summons, fortress pulses y fuego básico del boss.
- El jugador que vuelve a salir limpiamente de la zona recibe **LECTURA EVOLUTIVA** y bonificación de puntuación.
- Reactor Reboot limpia la memoria activa para evitar cadenas injustas después de una resurrección.

La intención es que el boss parezca aprender sin obtener información imposible ni corregir mágicamente el disparo.

## 2. System Break

Las ventanas de núcleo dejan de ser únicamente un multiplicador de daño. Si el jugador concentra suficiente daño real durante una apertura, puede producir un **SYSTEM BREAK**.

Consecuencias:

- extensión breve de la exposición del núcleo;
- stagger/recovery temporal del boss;
- erosión parcial de fortaleza;
- recompensa de puntuación;
- máximo de una ruptura por fase.

Esto crea una secuencia táctica reconocible: **leer → esquivar → abrir → concentrar daño → romper sistemas**. Disparar de manera indiscriminada contra armadura cerrada no llena el umbral.

## 3. Support Network / Red de soporte

Sentinel, Reanimator y Breeder adquieren una función adicional como nodos de organización local. Al destruir uno se produce una **ruptura de red** sobre enemigos cercanos.

- cancela fuego cruzado o fijaciones todavía no resueltas;
- retrasa el siguiente disparo;
- impide temporalmente que esas unidades entren en nuevos ataques coordinados;
- las excluye momentáneamente de nuevas inmersiones;
- muestra una señal visual de descoordinación;
- concede una bonificación proporcional al número de unidades afectadas.

Esto introduce prioridad de blancos: en ocasiones conviene eliminar primero la infraestructura táctica enemiga en lugar de disparar al objetivo más cercano.

## 4. Threat Arbitration ampliado

El Eco Adaptativo participa en el mismo principio de legibilidad introducido por Hunter Doctrine. Mientras se resuelve:

- no aparece una nueva signature;
- no se rellena una escolta fuerte;
- no se ejecuta fortress pulse;
- no se dispara fuego básico del boss;
- no se inicia una nueva maniobra de ruptura/surge.

La dificultad aumenta por decisiones y relaciones, no por superposición impredecible de amenazas mayores.

## 5. Continuidad técnica

- PWA cache: `starfall-shell-v0.7.3`.
- Service Worker registration: `build=0730`.
- Assets y audio: sin modificaciones respecto al trunk estable.
- `economy.js`: sin modificaciones respecto al trunk estable.
- Se conservan Encounter Evolution, Battle Rhythm, Hunter Doctrine, Reactive Matrix, Boss Fortress, Reactor Reboot, módulos, hardpoints, economía, Hangar, Mission Director, familias visuales y progresión.

## Resultado

La v0.7.3 convierte parte del combate en una pequeña ecología de relaciones: el jugador puede alterar la coordinación enemiga, el boss recuerda patrones exitosos sin hacer trampa y las oportunidades de contraataque pueden generar rupturas sistémicas. La dificultad deja de depender exclusivamente de resistencia o volumen de fuego y gana **causalidad, prioridad táctica, memoria y ventanas de decisión**.
