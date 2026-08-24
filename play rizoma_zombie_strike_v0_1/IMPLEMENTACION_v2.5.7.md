# IMPLEMENTACIÓN v2.5.7 · CARTOGRAFÍA DE SINERGIAS

Esta pasada continúa de forma directa la Maestría del Arsenal y las Doctrinas Tácticas. No añade daño, vida, duración, rareza, monedas ni recompensas. La nueva capa sirve para leer la construcción real de cada misión y mostrar cómo se relacionan los poderes ya descubiertos.

## Lectura dinámica de build
Cada misión puede clasificarse de forma informativa como:
- **Rizoma Base**: aún no hay poderes integrados.
- **Rizoma Emergente**: existe una única firma de poder.
- **Vector de Asalto**: predominan armas y amplificadores.
- **Bastión de Contención**: predominan defensa y control.
- **Enjambre de Apoyo**: predominan aliados, utilidad y soporte.
- **Convergencia Crítica**: predominan intervenciones de alto impacto, amplificadores y armas compatibles.
- **Rizoma Híbrido**: ninguna familia domina claramente la construcción.

La identidad se calcula a partir de los poderes obtenidos en la misión. Es descriptiva y no concede bonificaciones.

## Afinidad doctrinal en la misión
La lectura táctica calcula qué porcentaje de la construcción actual coincide con la doctrina elegida:
- coincidencia primaria: peso completo;
- coincidencia secundaria: peso parcial;
- **Rizoma Libre** se muestra como azar puro.

La afinidad es solo informativa. El sesgo doctrinal de v2.5.6 permanece exactamente en 65% y máximo una cápsula doctrinal por oferta.

## Rutas de sinergia en Colección
La pantalla **Colección** incorpora `Cartografía de construcción · Rutas de sinergia`.

Para cada doctrina especializada muestra:
- poderes compatibles ya descubiertos frente al total de esa ruta;
- fusiones registradas frente a las fusiones asociadas a la ruta;
- hasta tres fusiones ya conocidas con mayor uso registrado;
- marca visual de la doctrina activa.

No se revelan los nombres de fusiones que el jugador todavía no ha descubierto.

## Cápsula de fusión reconocible
La prioridad de compañero de fusión ya existente se conserva, pero ahora la cápsula queda marcada explícitamente como:

`✷ FUSIÓN`

Cuando una opción completa una confluencia activa, el mensaje espacial indica la fusión disponible. Esto no altera la selección ni crea una opción adicional; solo hace visible una prioridad que ya existía.

## Lectura en pausa
El menú de pausa incorpora un resumen compacto con:
- identidad de la build;
- doctrina activa;
- afinidad doctrinal o estado de azar puro;
- fusión completada o siguiente confluencia posible y el componente que falta.

La pausa continúa deteniendo completamente la partida.

## Informe táctico al terminar
El resultado de misión incorpora una lectura final con:
- identidad de la construcción;
- doctrina y afinidad;
- número de poderes integrados;
- tres poderes con mayor nivel;
- número y nombres de hasta tres fusiones completadas.

La instantánea se toma antes de soltar poderes por derrota, por lo que el informe conserva la build que realmente llevaba el jugador. También se captura correctamente en victorias, Entrenamiento y repetición de niveles.

## Elementos preservados
- Assets y fondos M1–M13: sin cambios.
- Progresión de campaña: sin cambios funcionales; `completeMap()` solo añade la captura informativa de la build antes de ejecutar la lógica previa.
- Archivo y repetición de mundos: sin cambios de reglas.
- Entrenamiento: sin cambios de recompensas o progreso.
- Botín de Guardianes y recompensas fijas: sin cambios.
- Bomba Omega: sin cambios.
- Tienda táctica: sin cambios; `openTacticalShop()` y `closeTacticalPrep()` mantienen la pausa obligatoria.
