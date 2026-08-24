# IMPLEMENTACIÓN v2.5.1 · FUSIONES EVOLUTIVAS II

Esta pasada desarrolla el segundo bloque de fusiones sin modificar fondos, progresión de campaña, Archivo de mundos, Entrenamiento, formas DOMINIO ni la pausa obligatoria de la tienda.

## 1. Rayo criotemporal
- El haz ya no se limita a aplicar lentitud.
- Cada impacto acumula dilatación temporal.
- Al completar tres acumulaciones, los enemigos normales sufren una congelación breve y los élites una fijación reducida.
- Los Guardianes reciben solo una inhibición corta y ralentización moderada.
- Los proyectiles enemigos que cruzan el corredor del haz pierden velocidad temporalmente.

## 2. Enjambre infeccioso
- Los Misiles Voraces y Microdrones Mantis reciben la propiedad de infección de enjambre cuando la fusión está activa.
- El impacto infecta al huésped y contagia inmediatamente hasta dos objetivos cercanos.
- Los proyectiles obtienen una oportunidad adicional de retarget después de una baja.
- Se conserva la propagación secundaria de la Infección Rizomática cuando muere un huésped.

## 3. Escuadrón tormenta
- Los drones forman una red Tesla funcional.
- Ejecutan salvas sincronizadas periódicas hacia amenazas diferentes.
- Los enlaces entre drones tienen lectura visual eléctrica.
- Se mantiene el fuego individual de cada dron, pero la descarga sincronizada tiene daño reducido contra Guardianes.

## 4. Bastión orbital
- Se elimina la lógica de borrado ilimitado de proyectiles dentro del anillo.
- El Bastión usa segmentos/cargas de intercepción que se regeneran con el tiempo.
- Cada carga elimina un proyectil que penetre el perímetro.
- El sistema recupera escudo progresivamente y genera un pulso visible al interceptar.

## 5. Pozo de plasma
- Minas de Singularidad y Vórtices de Plasma quedan marcados como nodos enlazables.
- Cuando sus áreas se superponen, generan un colapso sincronizado.
- El colapso atrae enemigos, ralentiza, causa daño de área moderado y elimina una cantidad limitada de proyectiles.
- Los Guardianes reciben una versión muy reducida de atracción y daño.

## 6. Lanza de nulidad
- Mantiene la penetración y desintegración de proyectiles.
- Los enemigos atravesados sufren inhibición temporal de sistemas mediante `empLock`.
- En hordas, la inhibición dura más; en élites y Guardianes se aplica una versión controlada.
- El corredor conserva el límite de proyectiles desintegrados para evitar una defensa absoluta permanente.

## 7. Nova blackout
- La Nova ya no es solo daño + limpieza de balas.
- Inhibe temporalmente los sistemas ofensivos de los enemigos dentro de su radio.
- Recicla parte de los proyectiles apagados en escudo.
- Activa una protección breve adicional, moderada, tras la descarga.
- La inhibición contra Guardianes es corta para conservar la dificultad del combate.

## Compatibilidad
Los identificadores internos de las fusiones se conservan, por lo que perfiles y backups anteriores continúan siendo compatibles.
