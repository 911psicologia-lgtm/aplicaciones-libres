# Balance base v0.2.0

La curva busca más adrenalina sin convertir el campo en ruido visual. Los enemigos crecen por densidad, velocidad y patrones, mientras los obstáculos conservan una frecuencia menor que la formación principal.

| Nivel | Columnas base | Filas | Guardián | Vel. formación base | Fuego enemigo aprox. | Obstáculo aprox. |
|---:|---:|---:|:---:|---:|---:|---:|
| 1 | 9 | 5 | No | 59 px/s | 862 ms | — |
| 2 | 9 | 5 | Sí | 64 px/s | 824 ms | 5180 ms |
| 3 | 10 | 5 | Sí | 70 px/s | 786 ms | 4920 ms |
| 5 | 11 | 6 | Sí + jefe posterior | 80 px/s | 710 ms | 4400 ms |
| 8 | 12 | 7 | Sí | 96 px/s | 596 ms | 3620 ms |
| 10 | 13 | 8 | Sí + jefe posterior | 106 px/s | 520 ms | 3100 ms |

En pantallas verticales se limita la formación a 9 columnas para preservar legibilidad; el crecimiento posterior se expresa principalmente mediante filas, HP, frecuencia de disparo, velocidad y movimiento diagonal. En pantallas horizontales la matriz puede crecer hasta 14 columnas.

La velocidad lateral real usa `max(formationSpeed, anchoPantalla × 0.11)`, de modo que el barrido no se vuelva lento en monitores o tablets anchas.

## Guardián

- Aparece desde nivel 2.
- HP = `10 + nivel × 2.7` redondeado.
- Se ubica detrás de la primera línea.
- Oscila en X/Y y añade una segunda componente diagonal.
- Dispara una ráfaga central de tres proyectiles; desde nivel 6 añade dos proyectiles laterales.

## Poderes y rendimiento

Los seis poderes comparten un presupuesto de render bajo. Beam, Shield, EMP y Chain se dibujan mediante líneas, gradientes y arcos. Spread y Missiles usan proyectiles reales y flashes locales. Ningún poder activo necesita escalar una textura VFX de cientos de píxeles a tamaño de pantalla cada frame.
