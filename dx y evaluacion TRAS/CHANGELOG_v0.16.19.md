# TRAS · Cambios v0.16.19 — corregir superposición de íconos

## El problema (confirmado con las capturas)
El disquete de guardado, al ser `position:fixed` arriba a la derecha,
quedaba encima del encabezado "Paso X de Y · [paso]" y de la barra de
progreso dentro de `.topbar` en pantallas angostas — exactamente lo que
mostraba la primera captura.

## La corrección
- **Guardar** ya no flota: ahora es un botón real dentro de `.topbar`,
  justo al lado del menú (☰), en la misma fila que el nav de pasos y el
  progreso. Al ser parte del flujo normal del documento, nunca puede
  superponerse con nada — el bug queda resuelto de raíz, no disimulado.
- **Instalar** y **Actualizar** se movieron al splash, debajo del botón
  "Entrar" (como en la segunda captura), en su propia fila con íconos +
  etiquetas.

## Compromiso que hay que conocer
Instalar/Actualizar solo se ven en la pantalla de bienvenida (que
aparece siempre al abrir la app). Si una nueva versión queda disponible
mientras el profesional ya está trabajando a mitad de un caso, no volverá
a ver el aviso hasta la próxima vez que abra la app — antes sí se veía
de inmediato en cualquier pantalla. Es la contrapartida de sacarlos del
área de trabajo para que no vuelvan a chocar con el contenido. Si
prefieres que Actualizar sí sea visible durante el trabajo (aunque sea
en otra posición que no choque), dímelo y lo ajustamos.

## Verificación
- Balance de etiquetas (incluido `<button>`) correcto.
- Cero referencias huérfanas al contenedor `topFabBar` retirado.
- `node --check` sin errores en los 22 `.js`.

## Soporte
- `APP_VERSION` → `v0.16.19`; `sw.js` → caché `tras-v0.16.19`.
