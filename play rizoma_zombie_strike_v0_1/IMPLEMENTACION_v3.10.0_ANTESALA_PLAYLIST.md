# Rizoma Zombie Strike v3.10.0 — Playlist ambiental de antesala

## Objetivo
Eliminar la repetición de una misma música de fondo antes del Guardián y convertir el ambiente de los 20 mundos en una playlist real, sin mezclar ni degradar los temas exclusivos de los Guardianes.

## Implementado
- Playlist ambiental global con 4 pistas existentes del paquete.
- Cada mundo inicia en una pista diferente mediante rotación determinista.
- El orden alterna dirección por bloques de cuatro mundos para evitar una secuencia idéntica a lo largo de la campaña.
- Al terminar una pista avanza automáticamente a la siguiente.
- No hay repetición inmediata dentro de la playlist.
- Si una pista falla, prueba la siguiente; solo después cae al motor procedural.
- Al aparecer el Guardián se invalida la playlist y entra exclusivamente su soundtrack/fallback original.
- Los soundtracks M1–M20 no se usan como música ambiental.

## Pistas ambientales reutilizadas
1. `ambient_block1_worlds1_4.mp3`
2. `ambient_block2_worlds5_8.mp3`
3. `ambient_block3_worlds9_12.mp3`
4. `world1_ambient_nucleo_meteorico.mp3`

## No modificado
- Balance de M1.
- Directores de enemigos/amenazas.
- Flota, DOMINIO, reliquias e Invocaciones.
- Soundtracks exclusivos de Guardianes.
- Cierre de Saga II.
