# Ruta de continuidad · Emilia v1.9.0

## Base estable
**v1.9.0 · Cierre seguro de misión + reanudación visible**

Esta iteración profundiza el ajuste iniciado en v1.8.0. La prioridad no es incorporar otra mecánica, sino asegurar que la progresión que ve la niña sea coherente con la lógica interna: una letra no debe parecer terminada demasiado pronto si todavía falta una habilidad propia de esa misión para abrir la siguiente.

## Implementado
1. **Cierre adaptativo seguro**
   - el motor identifica los requisitos del mundo inmediato que pertenecen a la misión actual;
   - una sesión no termina adaptativamente mientras uno de esos requisitos siga pendiente;
   - se auditaron 26 transiciones de este tipo;
   - el repaso-puente permanece como red de seguridad cuando, aun agotando la misión, la ejecución no alcanza el umbral.
2. **Reanudación visible**
   - una misión guardada aparece con ▶ en el mapa;
   - Lumi muestra una guía breve para continuar;
   - se indica cuántos pasos quedan sin exponer porcentajes al niño;
   - tocar el mismo mundo reanuda exactamente el índice guardado y no reinicia la sesión.
3. **Pausas orientadas**
   - cuando falta una habilidad necesaria para el siguiente mundo, la pausa muestra actual → siguiente y Lumi invita a seguir.
4. **Resultado coherente**
   - si se terminaron las actividades pero aún hace falta refuerzo, el resultado lo dice antes de volver al bosque y el repaso-puente queda señalado.

## Prueba prioritaria en dispositivo real
Repetir cuatro escenarios:
1. salir a mitad de M y comprobar que el bosque muestra M con ▶, Lumi la señala y al tocar M continúa en la actividad exacta;
2. realizar M con ayuda/errores suficientes para mantener `m_family < 50` y comprobar que la misión no se cierre adaptativamente demasiado pronto;
3. completar una misión con el requisito ya satisfecho y comprobar que el cierre adaptativo sigue funcionando normalmente;
4. agotar una misión sin alcanzar el umbral y comprobar que el resultado anuncia el repaso y el bosque no deja a la niña adivinando.

## Siguientes frentes admisibles
1. **Sensibilidad del trazo** basada en observación real de dedo en celular/tablet.
2. **Cuaderno de Emilia**: conservar algunas palabras y frases escritas para releerlas y comparar producciones, sin evaluación estética de la letra.
3. **Escalera de independencia escrita**: copia visible → guía tenue → palabras de apoyo → escena → escritura sin modelo / dictado opcional.
4. **Vista infantil de misión** solo si las pruebas muestran todavía confusión dentro de un recorrido: no añadir paneles por anticipación.
5. Retos de fin de semana, X/K/W y GUE/GUI permanecen posteriores a la estabilización de navegación, lectura y escritura móvil.

## Principio de decisión
**Mostrar + señalar + nombrar + cerrar con criterio.** La niña no debe interpretar estados internos del sistema ni recibir un “terminado” que contradiga el siguiente paso.
