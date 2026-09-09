STARFALL FRONTIER — LIBRERÍA DE ASSETS (20 MUNDOS)
====================================================

QUÉ ES ESTE PAQUETE
-------------------
Librería completa de assets visuales para el shooter espacial vertical
sci-fi/biomecánico "Starfall Frontier", lista para integrarse en una app
multiarchivo HTML/CSS/JS. Todos los sprites son PNG con transparencia real
(alpha recto, sin fondo pegado) y todas las animaciones son spritesheets
PNG horizontales con frames de igual tamaño.

ESTRUCTURA
----------
world_01/ ... world_20/
  minions/        6 esbirros por mundo: sprite base + variante (élite o dañada)
                  + hoja de animación (6-8 frames)
  subbosses/      2 subjefes (ofensivo de abanico + táctico de escudo) con hojas
  boss/           jefe con fases 1..N, núcleo abierto, (renacido si aplica),
                  hoja de animación (12f), hoja de muerte (8f), reliquia +
                  hojas de flotación y adherencia
  projectiles/    5 proyectiles del jefe + 2 de subjefes + spitter (con hojas)
  powerups/       3 cápsulas teñidas del sector (el set global en _global/)
  obstacles/      3 obstáculos temáticos del plan + restos de nave humana +
                  nave alienígena + cobertura defensiva de energía
  backgrounds/    fondo base + variante intensa + variante de jefe
                  (JPEG 1440x810, opacos) + capa_lejos y capa_cerca para
                  parallax (PNG RGBA 800x450; escalar a 1600x900 en runtime)
  world_XX_manifest.json   función y uso recomendado de cada archivo
_global/
  powerups/  11 power-ups globales (ráfaga, láser, misiles, escudo, dron aliado,
             EMP, imán, vida, reparación, sobrescudo, multiplicador)
  fx/        explosión (10f), chispa de impacto (4f), motores x3 colores (4f)
  ships/     3 naves del jugador (Vanguard/Warden/Specter)
catalog/     catálogos HTML por fase y catálogo maestro (ábrelos en el navegador)

INTEGRACIÓN RÁPIDA
------------------
- Spritesheets horizontales: frameWidth = image.width / frames (ver manifest).
- Reproducción recomendada: esbirros 8 fps, sentinel 6, subjefes 7, jefe 10,
  muerte 8, reliquia 8, proyectiles 8.
- Los jefes cambian de sprite de fase al cruzar 66% / 33% / 15% de vida
  (mundos con 4 fases); usa 'nucleo_abierto' en el ataque cargado final y
  'renacido' como segunda barra en mundos 6, 10, 15, 18 y 20.
- Parallax: dibuja capa_lejos (scroll 0.25x), luego capa_cerca (0.6x), ambas
  escaladas a 1600x900; para variante intensa/jefe usa el JPEG completo.
- Mezcla entre mundos: los esbirros son modulares (mismo sistema de roles),
  así el mundo N puede combinar esbirros del mundo N-1 según el manifest
  (campo 'heredado_del_anterior' y 'progresion').

LÓGICA DE PROGRESIÓN POR MUNDO (resumen del plan)
-------------------------------------------------
Pantalla 1: esbirros base del nuevo mundo.
Pantalla 2: mezcla con esbirros heredados del mundo anterior.
Pantalla 3: más densidad + 1 subjefe + heredados.
Pantalla 4: jefe (con renacimiento/mutación en mundos 6/10/15/18/20).

PESO Y RENDIMIENTO
------------------
- PNG optimizados; nebulosas suaves para comprimir bien.
- Los esbirros están diseñados para leerse claro a 48-72 px (móvil).
- Cada familia tiene paleta y anatomía propias (ADN visual por mundo).

GENERADO PROCEDURALMENTE (semillas reproducibles) — listo para producción.
