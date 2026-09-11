# STARFALL FRONTIER v0.4.9 — Boss Fortress & Quiet Audio

## Audio
La mezcla sonora se simplifica deliberadamente: el motor conserva únicamente la identidad de las armas del jugador (disparo básico, ráfaga, misiles, dron, EMP y reserva de láser). Ambiente, UI, enemigos, explosiones, jefes, subjefes, recompensas y stingers quedan silenciados desde `js/audio.js`. El paquete completo de audio permanece archivado dentro de la build para poder recuperarlo más adelante sin regenerarlo.

## Fortaleza de jefes
- HP base del jefe elevado de una escala aproximada `50 + sector*17` a `220 + sector*85`, antes de aplicar la curva del mundo.
- Curva de HP de jefes elevada progresivamente en W01–05.
- Nueva capa `FORTALEZA` equivalente inicialmente al 34 % del HP máximo.
- La fortaleza se recarga parcialmente en cambios de fase y mediante pulsos adaptativos.
- Mientras la fortaleza está activa, absorbe daño antes del casco del jefe.
- Al romperse abre una ventana temporal de núcleo vulnerable.
- Fuera de la ventana de núcleo, cada fase posee reducción de daño propia.
- Existe un límite de daño por impacto del 3.2 % del HP máximo para impedir aniquilaciones instantáneas mediante picos de poder.
- Fases 2 y 3 regeneran matriz defensiva y aumentan la frecuencia de poderes/acompañantes.
- Los jefes que resucitan recuperan además una parte de su fortaleza.

## Subjefes
La resistencia base de subjefes también fue incrementada de forma importante para que actúen como amenaza intermedia real antes del jefe de zona.
