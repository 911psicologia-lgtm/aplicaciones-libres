Aero · Fase 62 · Arenas movedizas y lagos que tragan

Base: Fase 61 Arsenal Box + campaña.

Correcciones e implementación:
1. Se corrigió una falla técnica: mudPits y pendulums existían, se dibujaban y se actualizaban, pero no se cargaban desde cada mundo. Ahora loadLevel sí carga:
   - level.mudPits
   - level.pendulums

2. Se activó updateMudAndPendulums dentro del ciclo de juego.

3. Mundo 4: Pantano refinado:
   - arenas movedizas visibles;
   - lodo pesado;
   - lagos que tragan a Aero;
   - orillas/plataformas de salida;
   - remolinos, ondas, burbujas, etiquetas y barra de peligro;
   - péndulos/bolas de pantano;
   - premios y orbes sobre rutas de riesgo.

4. Mundo 5: zonas tóxicas:
   - lagos tóxicos;
   - núcleo tóxico en la nebulosa final;
   - péndulos tóxicos;
   - plataformas de escape.

5. Comportamiento:
   - Si Aero entra en arena movediza o lago, se ralentiza, pierde stamina y comienza a hundirse.
   - Si no salta, usa dash o sale a tiempo, pierde error/vida y es expulsado del peligro.
   - En modo topo el terreno se resiste mejor, como ventaja del bioma.
   - Las zonas tienen marcador visual para que el jugador entienda el peligro.

6. Versión Cloudflare segura:
   - index.html actualizado con CSS y JS embebidos de esta fase.
   - main.js también queda disponible en carpeta js/ para desarrollo.
   - index.html está en la raíz del ZIP.

Validación:
- js/main.js validado con node --check.
