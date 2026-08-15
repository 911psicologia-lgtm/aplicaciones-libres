Aero · Fase 67 · Bonus Track: Venganza del Clon

Base: Fase 66.

Implementado:
1. Mundo extra 11:
   - Nombre: Bonus 11 · Venganza del Clon.
   - Aparece después del cierre principal.
   - El clon residual de Doctor Sombra reclama venganza.
   - Es un módulo extra, no reemplaza el final del mundo 10.

2. Jefe bonus:
   - Clon de Doctor Sombra · Venganza.
   - Usa asset existente diablito_jefe_3.
   - Apoyo visual/cloneAsset: demonio_bestia_2_hidra.
   - HP reforzada y comportamiento de jefe final extra.

3. Módulos de trayecto:
   - Tramo de romper cristales/cápsulas.
   - Tramo de péndulos y timing.
   - Tramo de picos/lanzas mediante flamas inferiores y sombra líquida.
   - Tramos de plataformas móviles y caída.
   - Hordas mixtas con enemigos de la campaña.
   - Premios, stamina, escudos, flow orbs y poderes fuertes antes del jefe.

4. Ajustes móviles:
   - Se conservan los dos controles táctiles.
   - Ambos quedan más pequeños y menos invasivos en celular.
   - El pad izquierdo mantiene salto/bajar.
   - El pad derecho mantiene avance/retroceso.
   - Se actualizó el texto de ayuda móvil.
   - Los títulos de tramo se ocultan en celular para que no persigan a Aero ni tapen la jugabilidad.

5. Selector:
   - Se añade tarjeta Bonus 11.
   - Se mantiene 1-9 y 0 para mundo 10.
   - La tarjeta Bonus 11 se selecciona con clic/tap; en teclado también con Minus (-).
   - El selector se compacta en tres columnas cuando hay muchos mundos y ancho suficiente.

6. Narrativa:
   - Mundo 10 cierra la campaña.
   - Bonus 11 queda como pista adicional: revancha del clon y sellado del archivo residual.

Validación:
- js/main.js validado con node --check.
- index.html actualizado con CSS/JS embebidos.
- ZIP plano con index.html en raíz para Cloudflare.
