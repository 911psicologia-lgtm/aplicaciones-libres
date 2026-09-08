# STARFALL FRONTIER — v0.3.9.1

Versión correctiva y evolutiva construida **directamente sobre la arquitectura multiarchivo completa de v0.3.8**. No reemplaza el proyecto por un HTML mínimo: conserva módulos JS, CSS, assets, pruebas, guardado, responsive, ecología enemiga, fusiones, dron, mutadores, checkpoints y la transición segura entre sectores.

## Corrección de arquitectura

La versión anterior v0.3.9 redujo accidentalmente el proyecto a tres archivos y perdió buena parte de la arquitectura y de los assets. v0.3.9.1 revierte esa degradación: vuelve a partir de la build v0.3.8 completa y añade las mejoras de identidad de jefes/subjefes sobre esa base.

## Identidad renovada de subjefes

- **ARACHNID — RED DE CAZA**: abanico de filamentos energéticos y dos proyectiles cazadores que cierran la zona de escape.
- **LEVIATHAN — DOBLE SINGULARIDAD**: dos disparos axiales acompañados por ondas de vacío.
- **DREADNOUGHT — BATERÍA TRIDENTE**: tres lances de artillería y guadañas laterales.

Los nombres de los ataques aparecen brevemente sobre el subjefe y su halo aumenta durante el poder principal.

## Identidad renovada de jefes

- **NÚCLEO NOVA — CORONA HELIOS**: pétalos solares, onda central y lanza final.
- **ARCONTE LANZA — JUICIO AXIAL**: varias columnas convergentes que aumentan por fase.
- **MADRE ENJAMBRE — SEMILLA DEVORADORA**: proyectiles buscadores, lluvia orgánica y escoltas.
- **DEVORADOR GRAVÍTICO — HORIZONTE ROTO**: ondas gravitatorias, guadañas laterales y lance central en fase 3.
- **FÉNIX SINTÉTICO — ALAS DE RENACIMIENTO**: abanico simétrico, guadañas y ataque axial; conserva su resurrección.

Cada poder principal tiene ahora nombre propio, color asociado, audio más diferenciado y una ventana visual de activación en la barra de jefe.

## Sistemas conservados

- Multiarchivo completo (`js/`, `css/`, `assets/`, `tests/`).
- 3 naves jugables con identidad distinta.
- 8 assets enemigos + boss asset.
- Fondos, meteoros y naves en assets separados.
- Ecología enemiga: Sentinel, Reanimator y Breeder.
- Formación adaptable y responsive móvil/tablet/PC.
- Atacantes en zigzag con retorno a formación.
- Guardianes, subjefes, horda previa y jefe sectorial.
- Checkpoint por oleada y Game Over con reinicio desde checkpoint.
- Mutadores de sector, objetivos tácticos y fusiones de poderes.
- Dron aliado y evolución de poderes por reliquias.
- Transición segura de jefe -> reliquias -> nuevo sector con watchdog.

## Pruebas

La carpeta `tests/` conserva las pruebas de runtime, responsive, ecología, sistemas y transición de jefe. Se añadió una validación de identidades de poder de v0.3.9.1.
