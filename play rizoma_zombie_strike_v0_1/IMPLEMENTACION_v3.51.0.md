# RIZOMA ZOMBIE STRIKE v3.51.0 — KINETIC BOSS SIGNATURE + LATE-ASSET REFINEMENT

## Alcance
Nueva pasada incremental sobre v3.50.0 centrada en identidad cinética de Guardianes, orientación real de proyectiles y coherencia visual de assets M11–M20.

## Cambios implementados

### 1. Movimiento de jefes: deriva no acumulativa
La capa de identidad de movimiento de M11–M20 ya no desplaza el target de forma acumulativa cada frame. Ahora se aplica como deriva cinética sobre la posición final, conservando los modos de movimiento existentes y evitando tendencia artificial a bordes.

### 2. Acentos de disparo multidireccionales
Se conserva la ampliación de v3.50 y se estabiliza su comportamiento:
- frente + flancos;
- contraángulos;
- radial con hueco;
- espiral suave;
- homing puntual;
- cambio alternado de sentido.

### 3. Proyectiles homing orientados correctamente
Cuando un proyectil con sprite cambia de dirección por homing/wobble, su rotación visual ahora sigue el vector real de movimiento, salvo cuando tiene spin propio.

### 4. Composición visual de Guardianes tardíos
Para aumentar presencia y evitar imágenes demasiado planas se reutilizan assets existentes como capas estructurales:
- M14: Trono/Nave Nova + núcleo del Guardián.
- M16: Neuroarca + núcleo cerebral/psiónico.
- M17: nave Fenrir + monolito/Guardián glacial.
- M19: nave Zhyr como cuerpo dominante + núcleo/rostro secundario.
- M20: dreadship Necrorex + cuerpo reptiloide.

### 5. Assets M11–M20
Se conserva la normalización de 178 PNGs realizada en v3.50 para reducir márgenes transparentes y mejorar presencia visual.

## Conservación
No se reconstruyeron mundos, progresión, economía, poderes, Flota, DOMINIO, RIFT, Guardián Vinculado, Director Adaptativo, Resurrección, Antesala ni Combat Flow Orchestrator.
