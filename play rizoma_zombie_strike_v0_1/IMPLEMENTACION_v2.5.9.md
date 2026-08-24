# Rizoma Zombie Strike v2.5.9 · Banda sonora de Magnate Omega

## Objetivo
Integrar `Iron Legion March.mp3`, suministrada para Magnate Omega (Mundo 6), como música exclusiva de su combate sin alterar fondos, balance, progresión, tienda, poderes ni reglas del mundo.

## Análisis del archivo suministrado
- Título embebido: `Iron Legion March`.
- Duración: 94.752 s.
- Formato: MP3 estéreo, 48 kHz.
- Metadatos de composición: 120 BPM, instrumental, sin voces y concebida como pieza loopable.
- La pista se conserva byte a byte dentro del juego como `assets/audio/boss_world6_magnate_omega.mp3`; no se recomprimió ni se alteró el máster.

## Implementación
1. Se añadió `soundtrack` a la ficha de Magnate Omega, separado del patrón sintetizado `Cyber Assault`. De este modo, la música procedural previa sigue funcionando durante el recorrido del Mundo 6 y como fallback técnico.
2. La pista se precarga durante el recorrido del Mundo 6 para reducir el retraso cuando aparece el jefe.
3. Al iniciar el duelo con Magnate Omega:
   - se detiene la secuencia procedural del recorrido;
   - comienza `Iron Legion March` desde el inicio;
   - entra con un fade progresivo de 850 ms;
   - se reproduce en loop durante todo el combate.
4. Las fases 2, 3 y 4 NO reinician la canción. Se conserva la continuidad musical y únicamente se eleva de forma gradual el volumen de fondo: 0.27 → 0.29 → 0.31 → 0.34.
5. Al morir el jefe, abandonar la partida o desactivar Música, la pista sale mediante fade y se detiene.
6. Si el navegador bloquea o no puede cargar el MP3, el juego vuelve automáticamente al sistema procedural anterior de Magnate Omega; el combate no queda sin música.
7. Si Música se vuelve a activar durante una partida, el motor reconstruye la música correspondiente al estado actual; en el duelo de Mundo 6 recupera `Iron Legion March`.
8. La entrada cinematográfica de Magnate Omega muestra `♫ Iron Legion March` para identificar la pieza asociada al Guardián.

## Alcance protegido
No se modificaron:
- fondos ni imágenes de Mundos 1–13;
- estadísticas, HP, escudos, ataques o cadencias del jefe;
- generación de cápsulas, poderes, fusiones o doctrinas;
- progresión, Archivo, Entrenamiento o Memoria de Expediciones;
- economía y recompensas;
- Bomba Omega;
- pausa obligatoria de la tienda táctica.

## Versión
- `VERSION`: 2.5.9
- `manifest.json`: 2.5.9
- Service Worker: `rizoma-zombie-strike-v2-5-9`
