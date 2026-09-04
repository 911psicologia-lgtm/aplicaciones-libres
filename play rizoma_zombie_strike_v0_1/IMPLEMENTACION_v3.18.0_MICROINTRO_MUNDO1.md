# Rizoma Zombie Strike v3.18.0 — Microintro cinematográfica Mundo 1

## Objetivo
Integrar el video `2026-09-03_20-30-31_Lumina.mp4` como una segunda capa cinematográfica específica del Mundo 1, sin reactivar las antiguas secuencias estáticas del Modo Historia.

## Video integrado
Ruta runtime:
`assets/video/world_01_intro.mp4`

Propiedades del archivo original auditado:
- H.264
- 1248 × 704
- 24 fps
- 5.041667 s
- ~1.8 MB

## Flujo de campaña
En modo Historia/Campaña, al iniciar M1:
1. Intro general del juego, solo si el perfil no la ha visto.
2. Microintro específica del Mundo 1, solo si el perfil no la ha visto.
3. Inicio normal del gameplay de M1.

Ambas cinemáticas usan el mismo overlay de video y botón SALTAR.

## Persistencia
Se conserva el flag legacy:
- `introVideoSeen`

Se añade:
- `worldIntroVideosSeen: {}`

Para M1 se guarda:
- `worldIntroVideosSeen[1] = true`

Esto permite añadir posteriormente videos de otros mundos sin modificar la arquitectura.

## Compatibilidad
- Historia estática continúa desactivada.
- M1 no se reconstruye.
- Balance, Hangar, DOMINIO, Flota y Naves Rizoma permanecen intactos.
- Partidas existentes migran automáticamente con `worldIntroVideosSeen = {}`.
