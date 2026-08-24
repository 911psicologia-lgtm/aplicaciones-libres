# IMPLEMENTACIÓN v2.4.9 · Vacío, biotecnología y espectros

## Alcance
Continuación ordenada del rediseño del arsenal. Esta pasada trabaja los poderes que aún conservaban una lógica más básica: electricidad directa, infección, microdrones suicidas, arma de vacío y clones espectrales. No se modifican fondos, campaña, Archivo, Entrenamiento ni la pausa obligatoria de la tienda.

### Corona Tesla (`spark`)
- Mantiene 10 s.
- Deja de comportarse como dos láseres genéricos.
- Genera descargas bifurcadas directamente desde RIZOMA hacia varias amenazas simultáneas.
- Prioriza élites y objetivos medios antes de concentrar todo sobre Guardianes.
- El combo Escuadrón Tormenta sincroniza descargas adicionales desde aliados activos.
- Añade lectura eléctrica propia en RIZOMA y formas DOMINIO.

### Infección Rizomática (`virus`)
- Pasa de 8 a 10 s.
- El daño progresivo queda escalado por rango; Guardianes reciben efecto reducido.
- Mientras dura la infección, enemigos normales reducen moderadamente movilidad y frecuencia ofensiva.
- Al morir un huésped, la infección salta a un número limitado de enemigos próximos mediante conexiones visibles.
- Se añade halo orgánico y nodos móviles sobre enemigos infectados.

### Microdrones Mantis (`kamikaze`)
- Pasa de 8 a 10 s.
- Seleccionan amenazas por prioridad en vez de objetivos puramente aleatorios.
- Pueden retargetear si eliminan su presa.
- Si atraviesan fuego hostil cercano, se sacrifican para interceptar un proyectil enemigo.
- Nueva silueta procedural tipo mantis/cazador para diferenciarlos de Misil Voraz.

### Lanza del Vacío (`voidray`)
- Mantiene 12 s.
- Sustituye el rayo genérico por un haz estrecho de alta penetración con núcleo luminoso.
- El daño se atenúa de forma progresiva a través de múltiples objetivos.
- El eje del haz desintegra una cantidad limitada de proyectiles hostiles.
- La fusión Lanza de Nulidad amplía corredor, número de impactos y capacidad de desintegración sin convertirse en limpieza total de pantalla.

### Escuadrón Espectral (`phantom`)
- Mantiene 14 s.
- Las réplicas dejan la órbita genérica y forman detrás de RIZOMA según su dirección de ataque.
- Copian el arma activa desde ángulos diferentes con daño reducido.
- Distribuyen objetivos para no concentrar todo el fuego sobre una sola presa.
- Añaden estela/afterimage espectral y lectura visual propia.

## Corrección de consistencia
`spawnDrone()` ahora conserva correctamente las propiedades `intercept`, `phaseTrail` y `formationSlot`. Esto hace efectiva la intercepción que ya estaba definida para Escuadrón Réquiem y permite las nuevas formaciones espectrales.

## Compatibilidad
No se crean IDs persistentes nuevos. `spark`, `virus`, `kamikaze`, `voidray` y `phantom` mantienen sus IDs históricos, por lo que backups y perfiles anteriores continúan siendo compatibles.

## Sistemas preservados
- Fondos M1–M13 sin cambios.
- Progresión de campaña sin cambios.
- Archivo de mundos y Entrenamiento sin cambios.
- Tienda táctica: el combate continúa pausándose obligatoriamente hasta cerrar la compra.
- Bomba Omega conserva su regla canónica de destrucción/merma por rango.
