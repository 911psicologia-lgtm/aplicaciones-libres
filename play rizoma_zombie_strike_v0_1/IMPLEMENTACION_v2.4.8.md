# IMPLEMENTACIÓN v2.4.8 · Armas y apoyo táctico

## Alcance
Continuación ordenada del rediseño del arsenal. Esta pasada eleva armas base, movilidad y aliados sin modificar fondos, progresión de campaña ni la pausa obligatoria de la tienda.

### Tridente Adaptativo (`triple`)
- Conserva el ID histórico para backups.
- Escala visual y funcionalmente según nivel: 3 corredores al inicio, 5 desde nivel 3 y hasta 7 en nivel 5 en escritorio.
- En móvil se limita la densidad para mantener lectura y rendimiento.
- Los disparos laterales pierden una fracción moderada de daño; el corredor central conserva la potencia.
- Furia Balística sigue teniendo su patrón propio y no se duplica con este escalado.

### Rayo Vectorial (`laser`)
- Mantiene 10 s.
- Haz de corredor con alcance y grosor dependientes del nivel.
- Puede atravesar más objetivos conforme mejora.
- El daño se atenúa levemente con cada objetivo atravesado para evitar barridos gratuitos.
- Añade núcleo blanco y halo energético para mejorar lectura visual.

### Penetración Cinética (`pierce`)
- Pasa a 10 s.
- Los proyectiles conservan momento después de perforar y ganan hasta 24% de daño en impactos sucesivos.
- La ganancia se reduce fuertemente contra Guardianes.

### Ricochet Neural (`bounce`)
- Pasa a 10 s.
- Sustituye el rebote puramente aleatorio por búsqueda táctica del siguiente objetivo cercano.
- Número de rebotes limitado por nivel.
- Añade trazo energético entre el impacto y el nuevo objetivo.

### Nova Radial (`pulse`)
- Mantiene 8 s.
- Cada onda daña y aparta enemigos menores/medios; el desplazamiento sobre élites es reducido y los Guardianes no son desplazados.
- Neutraliza una cantidad limitada de proyectiles hostiles por pulso.
- La fusión Blackout conserva la limpieza total de proyectiles como beneficio superior.

### Vórtice de Plasma (`plasma`)
- Mantiene 10 s.
- Sustituye impactos instantáneos por vórtices persistentes de corta duración.
- Atraen, ralentizan y erosionan grupos.
- El efecto de atracción y daño está reducido contra élites y Guardianes.
- Se limita el número simultáneo de vórtices para móvil y escritorio.

### Dron Adaptativo (`drone`)
- Mantiene 12 s.
- Desde nivel 3 pasa a soporte avanzado y hereda el arma activa.
- Conserva compatibilidad con Dron Resonante y Escuadrón Tormenta.

### Escolta Gemela (`wingman`)
- Mantiene 12 s y máximo dos unidades.
- Abandona la órbita genérica y usa posiciones laterales de escolta.
- La escolta izquierda prioriza Guardianes/élites/amenazas; la derecha cubre el objetivo más cercano y la horda.
- Ambas heredan el arma activa.

### Cadena Voltaica (`voltaic`)
- Mantiene 11 s.
- Los saltos ahora se calculan de objetivo en objetivo por proximidad real.
- El daño pierde energía progresivamente en la cadena normal.
- Tempestad del Reactor aumenta saltos y alcance y elimina gran parte de esa pérdida.

### Reactor Pulsante (`overdrive`)
- Mantiene 10 s.
- Se diferencia de Sobrecarga Omega: ofrece una mejora base moderada y picos rítmicos breves de daño/cadencia.
- Cada pulso se representa con una onda alrededor de RIZOMA o la forma DOMINIO.
- Con Tempestad del Reactor fuerza una descarga voltaica rápida.

### Impulsor Vectorial (`afterburner`)
- Mantiene 10 s.
- Conserva la mejora fuerte de movilidad.
- Añade estela visible en RIZOMA y formas DOMINIO.
- Reduce modestamente el daño recibido durante la maniobra; Hiperfase mejora esa reducción sin sustituir a Fase Espectral.

## Compatibilidad
No se añadieron IDs persistentes nuevos. Los IDs existentes siguen funcionando con partidas y backups anteriores.

## Sistemas preservados
- Fondos M1–M13 sin cambios.
- Progresión de campaña sin cambios.
- Archivo de mundos y Entrenamiento sin cambios.
- La tienda continúa pausando obligatoriamente el combate hasta cerrarse.
