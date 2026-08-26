# Rizoma Zombie Strike v2.8.1

## Ajustes aplicados

1. **Música de batalla reforzada**
   - Se activó una capa de ambientación musical externa para Mundos 2–12 reutilizando sus pistas ya presentes en `assets/audio/` con volumen de fondo calibrado.
   - El Mundo 7 ya no queda silencioso en combate normal: usa `boss_world7_deep_current.mp3` como ambiente de batalla si no hay pista exclusiva de antesala.
   - Se añadió fallback para Mundo 6 (`boss_world6_cyber_assault.mp3`) también en ambiente.
   - Se agregó reintento de desbloqueo de audio ante `pointerdown`, `touchstart`, `keydown` y regreso de pestaña para reducir fallos por autoplay en navegador.

2. **Visibilidad de la nave del jugador**
   - Fénix RZ-1 aumentó su tamaño visual en escritorio, tablet y celular sin alterar hitbox ni balance.
   - Wingman RZ-1 y RZ-2 también crecieron para que el escuadrón sea más legible.

3. **Estado sobre música subida previamente**
   - En el paquete actual sí están las pistas de jefes 1–12 y el ambiente dedicado del Mundo 1.
   - Si deseas **la pista exacta de antesala/jugable** de otros mundos, solo habría que volver a subirlas si eran archivos distintos a los ya presentes en `assets/audio/`.
