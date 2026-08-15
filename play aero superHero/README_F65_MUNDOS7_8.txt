Aero · Fase 65 · Mundos 7 y 8 activos

Base: Fase 64.

Implementado:
1. Mundo 7 · Forja Roja y Oscura.
   - Nueva fase jugable.
   - Busca cerrar el arco de la energía oscura y la energía roja.
   - Incluye pickups narrativos:
     - Energía oscura.
     - Energía roja.
     - Lanza despierta.
   - Estos estados se guardan en localStorage como energía de la Lanza Aurora.
   - Jefe: Herrero Carmesí · Guardián de la Forja.
   - Usa assets ya existentes de jefes: diablito_jefe_1 y apoyo visual de diablito_jefe_2.
   - Tramos con fuego, sombra, forja, plataformas, hordas y pasajes de batalla.

2. Mundo 8 · Torre Abisal.
   - Nueva fase jugable.
   - Mundo de ascenso por cámaras: plataformas estáticas, móviles, escaleras activables y enemigos que bajan desde zonas altas.
   - No se implementó aún scroll vertical real de cámara; se construyó como torre por segmentos jugables dentro del motor actual.
   - Jefe: Vigía del Ascenso · Torre Abisal.
   - Usa asset de jefe mecha_boss_core_blast y apoyo visual de geometric_bat_boss.

3. Selector de mundos:
   - Ahora hay 8 mundos activos.
   - Teclas 1 a 8 para seleccionar.
   - Hoja de ruta pendiente reducida a mundos 9 y 10.

4. Lanza Aurora:
   - En mundo 7 se recolectan energía oscura y roja.
   - Si se reúnen ambas, se marca la Lanza como despierta.
   - Esto deja preparado el camino para mundos 9 y 10.

5. Escalamiento de dificultad:
   - Mundo 7: 96 orbes, 128 enemigos.
   - Mundo 8: 118 orbes, 154 enemigos.
   - Más pasajes de batalla, hordas, péndulos, plataformas móviles y pickups.

6. Corrección narrativa:
   - Los mensajes de final de mundos 6+ ya no dicen pieza 6/5, 7/5, etc.
   - Ahora muestran avances de campaña según el mundo.

7. Cloudflare:
   - index.html actualizado con CSS/JS embebidos.
   - ZIP plano con index.html en raíz.
Validación:
- js/main.js validado con node --check.
