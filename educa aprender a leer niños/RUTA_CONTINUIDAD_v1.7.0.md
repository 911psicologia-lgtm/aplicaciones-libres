# Ruta de continuidad · Emilia v1.7.0

## Base estable
**v1.7.0 · Lectura Autónoma + Escritura Responsive de Frases**

La prioridad ya no es sumar mecánicas por cantidad. El criterio de continuidad es aumentar la proporción de acciones en las que la niña **intenta leer, construir o escribir antes de recibir un modelo sonoro**, sin retirar el oído como ayuda voluntaria.

## Implementado en esta versión
1. **Retirada adaptativa del modelo sonoro en Frases Vivas**
   - apoyo/nuevo: conserva modelado inicial;
   - crecimiento: comienza directamente con completar/ordenar/leer;
   - confianza: mantiene lectura primero y audio solo si se solicita;
   - las tareas realmente auditivas siguen conservando audio obligatorio.
2. **Señal infantil de autonomía**: `👀 primero tú → 👂`.
3. **Escritura responsive de frases**
   - tablet/PC: frase completa en un lienzo amplio;
   - celular: frase global visible + escritura palabra por palabra en un lienzo grande;
   - conserva mayúscula inicial y punto final como estructura gráfica.
4. **Seguimiento adulto descriptivo**
   - intentos de lectura de frase sin audio;
   - intentos con ayuda solicitada;
   - frases escritas con el dedo;
   - registro de escritura palabra por palabra en pantalla pequeña.

## Siguientes frentes de mayor valor
1. Probar v1.7.0 en tablet y celular reales y ajustar tamaños, sensibilidad del trazo y altura útil del lienzo.
2. Crear una **escalera de independencia** para escritura de frases: copia visible → frase tenue → apoyo por palabras → escena/pista → dictado opcional, sin convertirla en evaluación.
3. Diseñar un **Cuaderno de Emilia** local que conserve algunas producciones escritas y permita volver a leerlas.
4. Incorporar **Retos del fin de semana** como tres microretos no punitivos de leer/construir/escribir, usando únicamente contenido conquistado.
5. Evolucionar Palabra Secreta hacia pistas semánticas sencillas cuando exista suficiente vocabulario, no solo imagen.
6. Evaluar frases muy breves en Ruta de puntos únicamente si siguen siendo legibles en celular; no forzarlas por cantidad.
7. Integrar audio local real cuando llegue el paquete de sonidos; mantener TTS como fallback.
8. Mantener X/K/W y GUE/GUI fuera hasta consolidar lectura/escritura del recorrido actual.

## Principio de decisión
Una mejora entra solo si hace al menos una de estas cosas: reduce dependencia del modelo, aumenta producción propia, mejora decodificación, mejora escritura funcional o hace visible el progreso lingüístico. Si solo agrega entretenimiento, no tiene prioridad.
