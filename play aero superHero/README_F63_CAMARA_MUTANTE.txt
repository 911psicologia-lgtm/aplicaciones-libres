Aero · Fase 63 · Mundo 6: Cámara Mutante

Base: Fase 62.

Implementado:
1. Nuevo mundo jugable: Mundo 6 · Cámara Mutante.
2. La dificultad continúa escalando:
   - 66 orbes requeridos.
   - 74 enemigos.
   - más plataformas móviles, caída, trampas, mutágeno y enemigos mixtos.
3. Narrativa del mundo:
   - Doctor Sombra contaminó las primeras manifestaciones de Aero.
   - Aero pelea para liberar esas formas poseídas, no simplemente destruirlas.
   - La Lanza Aurora ya está completa, pero permanece bloqueada.
   - Para activarla se necesitarán energía oscura y energía roja del Mundo 7.
4. Enemigos:
   - clones corrompidos S2 y S3 usando los assets de avatar como enemigos.
   - secuaces de mundos anteriores.
   - enemigos robóticos, mutantes, voladores y tanques.
5. Jefe:
   - Mutante Primario · Eco de Aero.
   - Usa asset de jefe ya existente: demonio_bestia_2_hidra.
   - Se reforzó como jefe de transición a la segunda mitad de campaña.
6. Escenografía:
   - cámaras de clonación;
   - tubos mutantes;
   - Lanza Aurora bloqueada visible en el escenario;
   - laboratorios y bloques narrativos.
7. Selector:
   - ahora hay 6 mundos seleccionables.
   - se agregó tecla 6 para entrar al mundo 6.
   - la memoria de campaña futura queda del mundo 7 al 10.
8. Corrección visual:
   - getEnemyAsset ahora puede usar assets de avatarCatalog para que S2/S3 funcionen como clones enemigos y no caigan en fallback.
9. Cloudflare:
   - index.html se actualizó con CSS/JS embebidos de esta fase.
   - ZIP plano con index.html en raíz.
Validación:
- js/main.js validado con node --check.
