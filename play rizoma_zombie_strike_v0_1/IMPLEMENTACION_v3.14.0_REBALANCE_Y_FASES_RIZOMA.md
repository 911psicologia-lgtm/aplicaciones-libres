# Rizoma Zombie Strike v3.14.0 — Rebalance + Fases propias de Naves Rizoma

## Alcance del Paso 4
En esta iteración se ejecutaron **ambas rutas solicitadas**:
1. **Rebalance fino** del arsenal introducido en v3.13.0.
2. **Profundización de las Naves Rizoma** como línea propia del jugador, con identidad más marcada, fases por bloques de mundos y poderes exclusivos más legibles.

## 1) Rebalance fino del arsenal Rizoma
Se ajustó la lógica de disparo para que el arsenal de las Naves Rizoma no sea solamente vistoso, sino también más consistente y legible en partida.

### Ajustes realizados
- Integración de una capa de doctrina Rizoma dentro de `handleShooting()`.
- Modificación contextual de:
  - daño focal,
  - velocidad de proyectiles,
  - perforación,
  - asistencia de puntería,
  - cadencia,
  - y comportamiento contra jefes.
- Ajuste del `fireDelay` cuando una nave Rizoma aporta identidad ofensiva propia.
- Revisión ligera de especiales automáticos para que algunos escalen mejor con el stage de arsenal.

## 2) Fases propias de Naves Rizoma cada 4 mundos
Se consolidó la lógica de que la línea Rizoma evolucione por **bloques de mundos**:
- **Fase I · M1–M3** → Fénix RZ-1
- **Fase II · M4–M7** → Mantis RZ-4
- **Fase III · M8–M11** → Nébula RZ-8
- **Fase IV · M12–M15** → Bastión RZ-12
- **Fase V · M16–M19** → Hydra RZ-16
- **Fase VI · M20+** → Rizoma Prime RZ-20

Esto no reemplaza la selección libre del jugador, pero sí vuelve más clara la progresión conceptual y táctica de la línea propia de naves.

## 3) Pasivas por nave
Cada nave ahora posee una **pasiva explícita** además de su habilidad especial:
- **Fénix RZ-1**: perforación base adicional, centro reforzado y recarga ligeramente mejor.
- **Mantis RZ-4**: menor dispersión y mejor castigo a blancos prioritarios.
- **Nébula RZ-8**: escolta latente, puntería asistida y control lateral sostenido.
- **Bastión RZ-12**: regeneración extra y limpieza periódica de proyectiles cercanos.
- **Hydra RZ-16**: microdescargas ofensivas periódicas y presión de abanico.
- **Rizoma Prime RZ-20**: pulsos adaptativos mixtos ofensivos/defensivos.

## 4) Cooldowns adaptativos
La habilidad propia de la nave ya no depende solo del valor fijo del meta, sino también de una función de ajuste:
- se considera la doctrina activa,
- el stage de arsenal,
- y el tipo de nave.

Así, el HUD y el control rápido leen de forma más fiel la recarga real de la línea Rizoma.

## 5) Inventario y lectura de UX
El inventario de Naves Rizoma ahora muestra, en cada tarjeta:
- **habilidad propia**,
- **CD base**,
- **fase de campaña**,
- **pasiva**,
- y modificadores estadísticos.

Con esto, el jugador entiende mejor qué nave le conviene preparar y por qué.

## Archivos modificados
- `js/game.js`
- `index.html`
- `manifest.json`
- `sw.js`
- `css/styles.css`

## Resultado
La v3.14.0 deja a las Naves Rizoma como una capa más madura del juego: no solo se desbloquean por hitos, sino que cada una expresa una **doctrina de combate**, una **fase de progresión** y una **pasiva real** con impacto directo en la partida.
