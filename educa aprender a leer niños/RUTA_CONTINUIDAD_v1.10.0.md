# Ruta de continuidad · Emilia v1.10.0

## Base estable
**v1.10.0 · Cuaderno de Emilia + Escritura Adaptativa**

## Implementado
1. **Cuaderno de Emilia**
   - acceso desde Mis tesoros;
   - conserva producciones reales de palabra y frase como trazos normalizados ligeros;
   - permite tocar cada producción para escucharla y releerla;
   - máximo 18 entradas y máximo 2 muestras por mismo texto para permitir comparación sin saturar almacenamiento;
   - no califica estética, forma ni “bonita/fea” la letra.
2. **Escalera adaptativa de escritura de palabra**
   - `copy`: primera etapa con modelo visible, guía completa y modelado sonoro;
   - `faded`: después de una producción independiente, retira el modelado sonoro automático y usa guía tenue;
   - `scene`: después de dos producciones independientes, presenta primero la imagen y la niña intenta escribir sin modelo; oído y ojo siguen disponibles como ayuda.
3. **Persistencia compatible**
   - estado pasa a 7.6 y añade `notebook` mediante merge compatible;
   - perfiles anteriores migran sin borrar mastery, historial, misiones ni sesiones activas.
4. **Escritura de frases**
   - las producciones de Frases Vivas también pueden guardarse en Cuaderno;
   - en celular se guardan las muestras palabra por palabra; en tablet/PC la frase completa.

## Validación prioritaria en dispositivo real
1. Escribir una palabra nueva y comprobar que aparece en Mi cuaderno.
2. Repetir la misma palabra de forma independiente dos veces y comprobar que la tercera presentación entra en modo “Mira la imagen”.
3. Pedir ayuda con el ojo/oído y confirmar que la actividad sigue siendo completables y queda marcada como apoyada, no fallida.
4. En celular, escribir una frase palabra por palabra y revisar que el Cuaderno muestra los trazos sin desbordamiento.

## Siguientes frentes admisibles
1. Ajustar sensibilidad/tamaño de trazo solo con evidencia real de dedo en celular/tablet.
2. Extender la independencia escrita de frases con mucha prudencia: frase visible → palabras de apoyo → escena/dictado opcional, sin retirar contexto demasiado pronto.
3. Permitir comparar dos producciones de una misma palabra en una vista simple si el uso real muestra valor pedagógico.
4. Mejorar Rescate de palabras usando señales de apoyo de escritura y lectura, sin convertirlas en puntuación diagnóstica.
5. Retos de fin de semana, X/K/W y GUE/GUI permanecen posteriores a la estabilización de escritura y navegación.

## Principio de decisión
**Lo escrito debe permanecer y poder releerse. La ayuda se retira cuando hay evidencia de independencia, no por calendario ni por cantidad de sesiones.**
