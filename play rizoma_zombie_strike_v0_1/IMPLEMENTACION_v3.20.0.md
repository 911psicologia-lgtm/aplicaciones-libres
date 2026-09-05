# Implementación v3.20.0 — DOMINIO, Guardián y visual Rizoma corregidos

## Cambios aplicados
1. **Corrección de bloqueos de overlays**
   - Se reforzó el cierre de `PROTOCOLO DOMINIO`, `FLOTA DE CONQUISTA` y `Compra Exprés`.
   - Los botones de cierre ahora responden en `pointerdown`, `pointerup` y `click`.
   - También se puede cerrar tocando fuera del panel.

2. **Imagen real de la nave Rizoma en DOMINIO**
   - La tarjeta base de RIZOMA ya no muestra el rombo genérico.
   - Ahora toma la nave Rizoma activa (`rz1`, `rz4`, `rz8`, `rz12`, `rz16`, `rz20`) y renderiza su asset real.
   - El texto también refleja la nave activa: `RIZOMA · [nombre de nave]`.

3. **Guardián aliado más espectacular**
   - Se aumentó el tamaño visual del Guardián invocado.
   - Se incrementó el radio, alcance y presencia de varios poderes.
   - Se redujo el intervalo entre ataques para hacerlo más impactante.
   - Se reforzaron anillos, rayos, emisión y ondas de daño.

4. **Mejoras de UX táctico**
   - Cabeceras de paneles quedan adheridas arriba para que el botón cerrar siempre sea accesible.
   - Se ajustó ancho/alto máximo de paneles para evitar bloqueo visual.

## Resultado esperado
- La pantalla no debe quedar atrapada al abrir DOMINIO ni Compra Exprés.
- La nave Rizoma propia muestra su imagen real en el cuadro de selección.
- El Guardián aliado se siente más grande, poderoso y visible.
