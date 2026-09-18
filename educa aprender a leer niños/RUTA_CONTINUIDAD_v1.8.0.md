# Ruta de continuidad · Emilia v1.8.0

## Base estable
**v1.8.0 · Responsive móvil seguro + Guía explícita de progresión**

Esta versión responde a pruebas reales en celular. La prioridad dejó de ser agregar mecánicas y pasó a dos condiciones de calidad: **que ningún contenido se recorte en pantalla pequeña** y **que una niña prelectora nunca quede bloqueada sin saber qué hacer**.

## Implementado en esta versión
1. **Responsive seguro en celular**
   - shells de escritura/trazado pasan de medidas basadas en `vw` a ancho real del contenedor;
   - tarjeta de actividad con zona lateral segura;
   - lienzo de palabra con margen interior y guía tipográfica recalculada;
   - controles inferiores permanecen dentro del ancho útil;
   - cabecera de misión reorganizada en dos filas a <=620 px.
2. **Guía explícita del paso pendiente**
   - se identifica la primera misión no completada y el requisito real que impide abrirla;
   - el mapa muestra origen ↻ → destino;
   - el botón de repaso titila;
   - Lumi lo nombra por voz;
   - tocar un nodo bloqueado ya no queda sin respuesta.
3. **Repaso-puente de 3 actividades**
   - practica exclusivamente la habilidad que está por debajo del umbral;
   - utiliza contenido ya enseñado;
   - intenta alternar mecánicas cuando existen alternativas;
   - no desbloquea artificialmente: el mastery real debe alcanzar el requisito.
4. **Retorno orientado**
   - después del puente, el resultado indica si el siguiente lugar ya se abrió;
   - al volver al bosque se vuelve a señalar/narrar el siguiente paso.
5. **Aviso automático controlado**
   - cada bloqueo nuevo se anuncia una vez por sesión;
   - puede repetirse tocando Lumi o el mundo bloqueado, evitando locución invasiva continua.

## Hallazgo estructural importante
El bloqueo observado no provenía necesariamente de un cuento o reto escondido. La arquitectura ya exigía en varios saltos **misión anterior completada + umbral mínimo de una habilidad** (por ejemplo, abrir P después de M requiere `m_family >= 50`). Ese requisito era correcto como lógica adaptativa, pero estaba invisible para el niño. v1.8.0 conserva el umbral y corrige la invisibilidad mediante guía y repaso focalizado.

## Validación prioritaria en dispositivo real
Repetir exactamente tres escenarios:
1. finalizar M con `m_family` todavía bajo y comprobar que M/repaso titila, Lumi lo nombra y P responde al toque mostrando la guía;
2. escribir “mamá” en el mismo celular de las capturas y confirmar que toda la palabra y el botón Completar permanecen dentro del lienzo;
3. recorrer una actividad de sílabas y verificar que la cabecera no pelee por espacio con progreso, estrellas y contador.

## Siguientes frentes, solo después de esa prueba
1. Ajustar sensibilidad y tamaño de tinta según observación del dedo real de Emilia.
2. Crear una vista infantil muy simple de “lo que falta” dentro de una misión si aparecen nuevos casos de atasco intra-misión.
3. Cuaderno de Emilia: conservar algunas palabras/frases escritas y volver a leerlas.
4. Escalera de independencia: copia visible → guía tenue → palabras de apoyo → escena → escritura sin modelo/dictado opcional.
5. Retos de fin de semana únicamente si no compiten con la progresión principal ni se convierten en requisito oculto.

## Principio de decisión
**Mostrar + señalar + nombrar.** Si una acción es necesaria para avanzar, la interfaz debe hacerla perceptible antes de que el niño tenga que probar al azar.
