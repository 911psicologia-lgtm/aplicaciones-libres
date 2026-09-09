# STARFALL FRONTIER — AUDIO PACK v1

Paquete completo de audio procedural para el shooter espacial vertical **Starfall Frontier** (sci-fi oscuro / biomecánico).
Todo el material es **100% original**: fue sintetizado desde cero (síntesis sustractiva, FM, modelado de resonadores,
ruido filtrado y procesado espacial) sin samples de librerías, sin melodías reconocibles y sin material derivado de
franquicias existentes.

- **Formato:** OGG Vorbis · 44.1 kHz · mono (SFX centrados) y estéreo (ambientes, loops y momentos grandes)
- **Archivos totales:** 449 (44 globales + 405 de mundos)
- **Peso del paquete:** ~15 MB
- **Sin clipping:** todos los archivos limitados por debajo de 0 dBFS (pico máximo típico −0.6 dB)
- **Metadata:** cada archivo incluye `audio_manifest.json` con función, mundo, loop y duración

---

## 1. Estructura del paquete

```
STARFALL_FRONTIER_AUDIO_PACK_v1/
  README_AUDIO.md            <- este archivo
  audio_manifest.json        <- registro completo (path, categoría, mundo, loop, duración, uso, identidad)
  global/
    ui/                      10 SFX de menú y HUD
    stingers/                 5 stingers emocionales
    player/
      weapons/                6 disparos del jugador
      powers/                 6 power-ups
      defense/                3 escudo
      movement/               2 loops de motor (estéreo)
    fx/                       7 impactos y explosiones
    obstacles/                5 obstáculos (pases, hum, roturas)
  world_01/ ... world_20/     20 archivos por mundo:
    ambience/                 loop de ambiente 27–38 s (estéreo, loop perfecto)
    minions/                  6 esbirros: swarmer, stinger, hunter, sentinel, spitter, phantom
    subboss_a/                subjefe ofensivo: intro / attack / death
    subboss_b/                subjefe táctico: intro / attack / death
    boss/                     jefe: intro / phase_shift / attack_primary / attack_secondary / attack_control / death
                              (+ boss_revive en los mundos 06, 10, 15, 18 y 20)
    relic/                    liberación de reliquia (estéreo)
```

## 2. Criterios de diseño

**ADN sonoro por familia.** Cada mundo tiene una raíz tonal, una escala, un color de ruido, brillo, distorsión y
grado de "organicidad" propios. Los esbirros comparten ese ADN con su jefe (misma paleta tímbrica) pero usan gestos
distintos, para que la familia se reconozca sin confundir jerarquías.

| Mundo | Sector | Jefe | Firma sonora |
|-------|--------|------|--------------|
| 01 | Nebulosa Roja | Xenomorfo Escarlata | Organico acechante: sub-pulsos cardiacos, hiss acido, chirridos carmines |
| 02 | Anillo de Titanio | Yautja Prime | Caza tecnologica: clicks de camuflaje, sonar, trinos de vision termica |
| 03 | Vacio Bioluminiscente | Nebula Sintetica | Coros luminosos: campanas de FM, coro sintetico, destellos planctonicos |
| 04 | Cinturon Abisal | Arachnid Matriarca | Aracnido abisal: clicks de queliceros, tension de telarana, presion violeta |
| 05 | Sector Leviatan | Leviathan Omega | Leviatan abisal: gemidos de ballena espacial, marea, presion oceanica |
| 06 | Fortaleza Carbon | Dreadnought Rex *(renace)* | Asedio industrial: pistones, columnas de haz, acero estresado |
| 07 | Cementerio Orbital | Necro Swarm | Necro orbital: campanas funerarias, viento hueco, zumbido de enjambre |
| 08 | Grieta Cristalina | Prism Warden | Prisma imperial: armónicos de cristal, arpegios refractados, vidrio tenso |
| 09 | Campo Magmatico | Molten Core Tyrant | Magma tirano: burbujeo ardiente, rugidos de fusion, crujido termico |
| 10 | Sombra Cuantica | Phantom Dominion *(renace)* | Cuanto-fantasma: susurros invertidos, glitches, teleportos, silencio tenso |
| 11 | Marea Gravitatoria | Gravity Devourer | Gravedad: pozos que tragan tono, pulsos de marea, presion de masas |
| 12 | Cupula de Ceniza | Ashen Overmind | Ceniza mental: viento de pavesas, drone opresivo, golpes mermados |
| 13 | Jardin Toxico | Spore Empress | Esporas toxicas: burbujeo humedo, estallidos de espora, savia acida |
| 14 | Ruinas del Imperio | Ancient Sentinel King | Imperial ancestral: gongs de bronce, coro de templo, relojeria sagrada |
| 15 | Talleres del Vacio | Mecha Brood Sovereign *(renace)* | Forja del vacio: sierras, servos, nacimiento de maquinaria, neon humedo |
| 16 | Tormenta Ionica | Ion Archon | Tormenta ionica: arcos electricos, zumbido tesla, truenos brillantes |
| 17 | Oceano de Antimateria | Abyssal Rift Queen | Antimateria abisal: cantos invertidos, presion de fosa, energia azulada |
| 18 | Pira Solar | Phoenix Singularity *(renace)* | Pira solar: rugido de corona, campanas de plasma, ala de fuego ascendente |
| 19 | Convergencia de Portales | Multiform Nexus | Portales: barridos dimensionales, espejos de eco, cristal y glitch |
| 20 | Frontera Final | Starfall Overlord *(renace)* | Apoteosis: coro oscuro, meteoros caidos, sub-grave apocaliptico |

**Armas del jugador siempre claras.** Los disparos básicos/rápidos/láser se cortaron por debajo de 200–350 Hz y
se normalizaron por encima del resto de la mezcla, para mantenerse legibles sobre ambientes y explosiones en
parlantes de celular.

**Jerarquía auditiva.** Los jefes usan un instrumento "lead" propio (corno FM húmedo en mundos orgánicos, pila de
sierras en industriales, campanas-FM en brillantes) y tocan un motivo de su escala en la intro. Subjefe A suena
agresivo/attack; subjefe B suena táctico (clusters, anillos, invocación).

**Sin clonar sonidos.** Los gestos (aleteo, aguja, zancada, escudo, escupitajo, fase) se generan con parámetros
aleatorios por semilla determinista: cada mundo y cada archivo tienen variaciones propias de tono, ritmo y textura.

## 3. Notas sobre loops

Estos archivos están diseñados como **loops perfectos** (crossfade interno, sin click en la unión):

- `global/obstacles/obstacle_alien_wreck_hum.ogg` — 4.5s loop · zumbido de naufragio alienígena
- `global/player/movement/player_engine_loop_heavy.ogg` — 4.0s loop · propulsión pesada en loop
- `global/player/movement/player_engine_loop_light.ogg` — 4.0s loop · propulsión ligera en loop
- `world_01/ambience/world_01_ambience_loop.ogg` — 33s loop · atmósfera continua del sector
- `world_02/ambience/world_02_ambience_loop.ogg` — 30s loop · atmósfera continua del sector
- `world_03/ambience/world_03_ambience_loop.ogg` — 34s loop · atmósfera continua del sector
- `world_04/ambience/world_04_ambience_loop.ogg` — 35s loop · atmósfera continua del sector
- `world_05/ambience/world_05_ambience_loop.ogg` — 34s loop · atmósfera continua del sector
- `world_06/ambience/world_06_ambience_loop.ogg` — 37s loop · atmósfera continua del sector
- `world_07/ambience/world_07_ambience_loop.ogg` — 31s loop · atmósfera continua del sector
- `world_08/ambience/world_08_ambience_loop.ogg` — 32s loop · atmósfera continua del sector
- `world_09/ambience/world_09_ambience_loop.ogg` — 35s loop · atmósfera continua del sector
- `world_10/ambience/world_10_ambience_loop.ogg` — 36s loop · atmósfera continua del sector
- `world_11/ambience/world_11_ambience_loop.ogg` — 37s loop · atmósfera continua del sector
- `world_12/ambience/world_12_ambience_loop.ogg` — 29s loop · atmósfera continua del sector
- `world_13/ambience/world_13_ambience_loop.ogg` — 37s loop · atmósfera continua del sector
- `world_14/ambience/world_14_ambience_loop.ogg` — 36s loop · atmósfera continua del sector
- `world_15/ambience/world_15_ambience_loop.ogg` — 30s loop · atmósfera continua del sector
- `world_16/ambience/world_16_ambience_loop.ogg` — 37s loop · atmósfera continua del sector
- `world_17/ambience/world_17_ambience_loop.ogg` — 27s loop · atmósfera continua del sector
- `world_18/ambience/world_18_ambience_loop.ogg` — 33s loop · atmósfera continua del sector
- `world_19/ambience/world_19_ambience_loop.ogg` — 37s loop · atmósfera continua del sector
- `world_20/ambience/world_20_ambience_loop.ogg` — 32s loop · atmósfera continua del sector

Reproduce con `loop = true` desde el motor; no necesitan tratamiento adicional.

## 4. Notas de integración

- **Carga:** cualquier motor moderno (Web Audio API, Unity, Godot, Phaser) decodifica OGG Vorbis directamente.
- **Volumen sugerido (mezcla base):**
  - Ambientes: −10 a −14 dB respecto del bus de SFX.
  - Disparos del jugador: 0 dB (bus principal de armas).
  - UI: −4 a −6 dB.
  - Stingers y jefes: −2 dB.
- **Ambientes:** empezar el loop al entrar al sector y hacer crossfade de 1–2 s entre mundos.
- **Jefes:** usar `boss_intro` al entrar a la pantalla del jefe; `phase_shift` al cambiar de fase;
  `boss_revive` (mundos 06/10/15/18/20) al resucitar; `relic_release` al soltar la reliquia y transferirla.
- **Movimiento del jugador:** los dos loops de motor están pensados para crossfade continuo entre estado
  ligero y pesado (misma duración y tonalidad relacionada).
- **Manifest:** `audio_manifest.json` incluye `category`, `world`, `loop`, `duration_target`, `duration_real`,
  `usage` y `sonic_identity` por archivo — útil para auto-registrar los audios en el gestor de recursos del juego.

## 5. Resumen de conteo

| Bloque | Archivos |
|--------|----------|
| global/ui | 10 |
| global/stingers | 5 |
| global/player (weapons+powers+defense+movement) | 17 |
| global/fx | 7 |
| global/obstacles | 5 |
| mundos (20 × 20) | 400 |
| revives extra (06, 10, 15, 18, 20) | 5 |
| **Total** | **449** |

Generado de forma procedural y determinista (semillas fijas por archivo): cualquier regeneración produce
exactamente el mismo paquete.
