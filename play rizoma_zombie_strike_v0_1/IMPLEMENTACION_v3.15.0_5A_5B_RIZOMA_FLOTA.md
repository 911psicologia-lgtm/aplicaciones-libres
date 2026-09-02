# Rizoma Zombie Strike v3.15.0 — Paso 5A + 5B

## Objetivo de esta iteración
Se ejecutaron las dos líneas de trabajo propuestas:

- **5A:** afinación fina, nave por nave, de la línea propia de **Naves Rizoma**.
- **5B:** profundización de la **Flota de Conquista**, creando una capa de **resonancia táctica** con la Nave Rizoma preparada.

## 1. Afinación nave por nave de las Naves Rizoma (5A)
La doctrina Rizoma dejó de ser una modificación solamente cosmética o de disparo general. Ahora cada nave expresa mejor un estilo de juego concreto mediante ajustes finos de precisión, crítico, regeneración, recarga y escudo inicial.

### Ajustes por nave
- **Fénix RZ-1**: refuerzo del eje frontal, mejor daño central y apoyo leve de puntería.
- **Mantis RZ-4**: mayor identidad de precisión y castigo a objetivos prioritarios; gana mejor lectura de crítico.
- **Nébula RZ-8**: más soporte, escolta más consistente y mayor guiado.
- **Bastión RZ-12**: regeneración y reserva defensiva reforzadas.
- **Hydra RZ-16**: más presión sostenida y ritmo ofensivo lateral.
- **Rizoma Prime RZ-20**: consolidación híbrida ofensivo-defensiva.

### Cambios complementarios
- Mejora del escudo inicial para doctrinas defensivas.
- Ajustes menores a la frecuencia de pasivas temporizadas:
  - reaparición de escolta,
  - pulso de Bastión,
  - presión de Hydra,
  - pulso adaptativo de Prime.

## 2. Resonancias entre Flota de Conquista y Nave Rizoma (5B)
Cuando el jugador equipa una nave de la **Flota de Conquista**, esta ya no queda aislada de la línea propia Rizoma. La Nave Rizoma preparada pasa a funcionar como **núcleo de resonancia**.

### Qué aporta la resonancia
Según la Nave Rizoma preparada, la firma heredada de la flota puede ganar:
- reducción de cooldown,
- perforación adicional,
- apoyo de escolta,
- aumento de precisión,
- microlimpieza de proyectiles,
- pulso defensivo de escudo,
- ráfagas laterales,
- o combinación híbrida en el caso de **Rizoma Prime**.

### Resonancias implementadas
- **Resonancia Fénix**: refuerza perforación y eje frontal.
- **Resonancia Mantis**: mejora precisión, tempo y castigo crítico.
- **Resonancia Nébula**: añade guiado, escolta y apoyo estable.
- **Resonancia Bastión**: añade limpieza y sostén defensivo.
- **Resonancia Hydra**: suma saturación lateral y presión ofensiva.
- **Resonancia Prime**: mezcla apoyo, daño, limpieza y defensa.

## 3. Cambios de interfaz / legibilidad
Se mejoró la lectura del sistema en dos lugares:

### Selector rápido de flota
Ahora cada tarjeta puede mostrar:
- firma heredada,
- cooldown efectivo,
- y la resonancia activa con la Nave Rizoma preparada.

### Inventario / archivo de flota
Cada nave conquistada ahora comunica mejor:
- la firma heredada,
- su cooldown ajustado,
- y la resonancia concreta con la línea Rizoma preparada.

También la tarjeta base de la línea Rizoma aclara que actúa como **núcleo de resonancia** cuando se usa Flota de Conquista.

## 4. Resultado de diseño
Esta versión hace que las dos capas del sistema ya no compitan entre sí:
- la **línea Rizoma** conserva identidad progresiva y doctrinal,
- la **Flota de Conquista** se vuelve una extensión táctica,
- y ambas dialogan por medio de resonancias que cambian la forma de jugar sin romper el equilibrio general.

## Archivos modificados
- `js/game.js`
- `index.html`
- `manifest.json`
- `sw.js`
- `css/styles.css`
