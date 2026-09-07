# Rizoma Zombie Strike v3.21.0 — Adrenalina, Guardianes y Eco de Poder

## 1. Guardianes: resistencia +40%
- `COMBAT_DURABILITY.boss` pasa de 1.10 a 1.54, equivalente a +40% respecto de v3.20.0.
- Afecta HP y escudo base de los Guardianes.
- Los refuerzos de escudo al cambiar de fase reciben además +40% sobre su ganancia previa.

## 2. Guardianes: movilidad y poder visual
- Interpolación de movimiento (`follow`) multiplicada por 1.40.
- Los proyectiles originados en el Guardián se dibujan 1.40x sin modificar su radio de colisión.
- El telegráfico de poderes crece 1.40x y su animación rota/pulsa 40% más rápido.
- Se conserva la legibilidad y no se aumenta el daño automáticamente por esta mejora visual.

## 3. Mayor presión enemiga, pero destruible
Se incorpora un Director de Adrenalina global antes del Guardián:
- ESTAMPIDA: velocidad alta, enemigos algo más frágiles.
- TURBA ENEMIGA: grupos más numerosos y compactos.
- ACOSO: entradas próximas a la ruta del jugador y movilidad alta.
- FRENESÍ ENEMIGO: mayor velocidad y cadencia de hostigamiento.

Cada evento respeta caps diferenciados por dispositivo y se interrumpe antes de la antesala del Guardián para no romper los cierres de nivel. También puede añadir amenazas frontales/destructibles.

## 4. Contrapeso de poderes y recursos
- Más poderes tácticos pueden coexistir visibles: objetivo 4 en móvil y 5 en pantallas mayores.
- Menor intervalo de soporte de poderes.
- Mayor probabilidad de power/shield/life en muertes de enemigos.
- Cada evento de adrenalina entrega capacidad de respuesta al inicio, durante o al finalizar la presión.

## 5. Tamaño visual de nave
- Teléfono: +5%.
- Tablet y PC: +20%.
- La hitbox permanece intacta y separada del tamaño del sprite.

## 6. Guardián Vinculado: Eco Mejorado
Al invocarse:
- copia el poder primario temporal que la nave tenga activo;
- si no existe poder temporal, usa una equivalencia de la habilidad propia de la Nave Rizoma activa;
- ejecuta el poder copiado en versión amplificada mientras conserva su firma propia de Guardián;
- efectos de área, rayos, control, infección, congelación o limpieza de proyectiles varían según el poder copiado.

El Guardián continúa siendo apoyo temporal de 12 segundos y no sustituye el combate normal.
