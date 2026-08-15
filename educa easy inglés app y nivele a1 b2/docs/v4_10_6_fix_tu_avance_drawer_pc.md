# v4.10.6 · Fix Tu avance en menú hamburguesa PC

Corrección:
- En PC, el panel lateral usaba `display:flex; flex-direction:column` y algunos bloques podían encogerse.
- La tarjeta "Tu avance" quedaba recortada o visualmente aplastada.
- Se fuerza `flex-shrink:0` para los hijos del drawer.
- Se compacta y estabiliza `.drawer-progress-mini`.
- Se mantiene el comportamiento que ya se veía bien en celular y tablet.
- Se actualiza versión/cache a 4.10.6.
