# Migración v3.0

## Corpus

- Corpus anterior: 700 ideas.
- Corpus actual: 780 ideas.
- Nuevas unidades: 80.
- Cartografía Q: 40 ampliaciones de Grecia y Mediterráneo.
- Cartografía R: 40 ampliaciones de Helenismo, Roma y Antigüedad tardía.
- Grecia y Mediterráneo pasa de 20 a 60 ideas.
- Helenismo e imperios pasa de 20 a 60 ideas.

## Navegación y búsqueda

- `Explorar el corpus` se incorpora como sexto recorrido principal, inmediatamente después de Sorpresa.
- Se añade selector global de periodo junto al buscador.
- Los doce periodos aparecen plegados inicialmente.
- Escuchar periodo y seleccionar/deseleccionar periodo permanecen visibles sin abrir el acordeón.
- Las ideas desplegadas permiten seleccionar, abrir, escuchar desde esa idea o llevarla al mapa de conexiones.
- Una búsqueda crea una cola propia y deja de remitir al inicio del recorrido cronológico.
- Los resultados ofrecen apertura, escucha y rizoma.
- Las búsquedas con varias tarjetas de un autor ofrecen un mapa centrado en ese autor.

## Favoritas

- Tarjetas más compactas.
- Dos columnas en escritorio y una en móvil.
- Acciones por iconos dentro de cada tarjeta, sin desbordamiento.
- Reproducción completa de favoritas e ideas afines mediante los paneles superiores.

## Exportación

- Generación mediante `canvas.toBlob()` con alternativa por `toDataURL()`.
- Espera explícita de fuentes antes del renderizado.
- Descarga con File System Access API cuando está disponible.
- Descarga tradicional como alternativa automática en escritorio.
- Vista previa, abrir imagen, compartir y copiar texto.
- Mensajes visibles ante bloqueo o generación fallida.

## Estilo editorial

- Se eliminaron de los campos activos las repeticiones exactas `Escuchamos a…` y `La cautela histórica es importante…`.
- Los guiones activos y los expedientes se sincronizaron.
- Se diversificaron aperturas, transiciones y formulaciones de precisión histórica.
- Ninguna fórmula inicial de cuatro palabras aparece más de doce veces en las 780 narraciones breves.

## Compatibilidad

Se conservaron los identificadores publicados y el estado local del usuario. La nueva caché `cartografias-v3.0-consolidation-greece-780` elimina las cachés anteriores durante la activación del service worker.
