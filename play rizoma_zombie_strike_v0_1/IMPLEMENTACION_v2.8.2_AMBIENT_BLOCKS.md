# Rizoma Zombie Strike v2.8.2 — Ambient Blocks 1–12

## Audios recibidos y verificados

- `ambient_block1_worlds1_4.mp3` — 122.41 s, 48 kHz, estéreo, RMS aprox. -13.76 dBFS.
- `ambient_block2_worlds5_8.mp3` — 107.96 s, 48 kHz, estéreo, RMS aprox. -18.82 dBFS.
- `ambient_block3_worlds9_12.mp3` — 72.32 s, 48 kHz, estéreo, RMS aprox. -16.99 dBFS.
- `world1_ambient_nucleo_meteorico.mp3` — 229.20 s, 48 kHz, estéreo, RMS aprox. -12.61 dBFS. El archivo recibido coincide byte por byte con el ya incluido en v2.8.1 y se conserva como fallback específico del Mundo 1.

## Asignación implementada

- Mundos 1–4 → Ambient Block 1.
- Mundos 5–8 → Ambient Block 2.
- Mundos 9–12 → Ambient Block 3.
- Mundo 1 conserva `world1_ambient_nucleo_meteorico.mp3` como fallback si Block 1 no puede reproducirse.
- Mundos 13–15 conservan música procedural de combate/ambiente hasta recibir una pista o bloque específicamente identificado para ellos.

## Mezcla

Los tres archivos tienen niveles RMS distintos. Se calibró el volumen de reproducción para aproximar una presencia homogénea de fondo sin competir con disparos, FX ni música de Guardianes:

- Block 1: 0.13
- Block 2: 0.23
- Block 3: 0.19

## Integración

- La música ambiental se inicia durante el juego normal/antesala.
- Al entrar al Guardián, la pista ambiental se detiene y entra la banda sonora propia del jefe cuando existe.
- Al regresar a combate normal se restablece el bloque correspondiente.
- Se usan IDs compartidos por bloque (`ambient_block1`, `ambient_block2`, `ambient_block3`) para evitar duplicar instancias de audio innecesariamente.
- Se conservan los desbloqueos de audio por interacción añadidos en v2.8.1 para navegadores móviles y escritorio.
