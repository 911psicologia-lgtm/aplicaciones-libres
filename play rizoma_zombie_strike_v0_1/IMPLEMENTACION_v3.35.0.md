# RIZOMA ZOMBIE STRIKE v3.35.0
## Enemy Behavior Evolution · M11–M20

### Base maestra

- Base exclusiva: `Rizoma_Zombie_Strike_v3.34.0_Firma_Impacto_Identidad_Combate.zip`.
- Se conserva la campaña M1–M20; no se crea Mundo 21.
- No se añaden ni sustituyen assets.
- No se altera HP base de enemigos, curva de Guardianes, economía, tienda, tractor, aliados, Última Oportunidad ni especiales de las Naves Rizoma.

### Objetivo

La v3.35 reduce la sensación de repetición conductual en M11–M20. Los arquetipos heredados (`zigzag`, `chase`, `kamikaze`, `toxic`, `blindado`, `buffer`, etc.) siguen funcionando, pero cada familia avanzada recibe una capa de movimiento/posicionamiento propia. La dificultad aumenta por lectura táctica y variedad, no por inflar HP.

### Identidades por mundo

| Mundo | Familia 1 | Familia 2 | Familia 3 |
|---|---|---|---|
| 11 | SUBTERRÁNEO: carreras de arena y ventanas semisumergidas | ACECHO: flanqueo de espejismo | ANCLA: obeliscos que guardan distancia y se afianzan |
| 12 | CORRIENTE: barridos laterales | CAZADOR HADAL: persecución + rush | ARRECIFE: guardianes de posición |
| 13 | SURF MAGMÁTICO: serpenteo térmico | PERFORADOR: alineación + embestida | BASTIÓN ÍGNEO: presión lenta de zona |
| 14 | ÓRBITA CORONAL | PREDICTOR SOLAR | COLAPSO de distancia |
| 15 | ADHESIÓN: rodeo próximo antes de volver a atacar | FAGOCITOSIS: presión interceptora | TEJIDO VIVO: anclaje orgánico |
| 16 | SINAPSIS: oscilación sincronizada | PREDICCIÓN: anticipa vector del jugador | NODO CORTICAL: red de stand-off |
| 17 | MANADA: busca posiciones coordinadas alrededor del jugador | EMBESTIDA: pounce periódico | ACECHO AURORA: órbita espectral |
| 18 | PASO DE VIÑETA: desplazamiento lateral en ráfaga | MECHA TÁCTICO: stand-off/strafe | FASE YOKAI: ventanas semitransparentes de movilidad |
| 19 | FORMACIÓN ZHYR: posiciones orbitales | ANTICIPACIÓN psiónica | MÍMESIS: sigue una posición retardada del jugador |
| 20 | CAZA SAURIA: aproximación coordinada + hunt burst | MUTACIÓN NECRO: alterna fase lenta/frenética | PROTOCOLO BIOTECH: cazador / artillero / controlador |

### Proyectiles M16–M19

Los enemigos comunes de M16–M19 ya tenían sprites de proyectil cargados en el juego, pero el bloque general de minions no los utilizaba. En v3.35 se conectan:

- M16: `world16ShotSynapse`, `world16ShotPsi`, `world16ShotLance`.
- M17: `world17ShotLance`, `world17ShotCryo`, `world17ShotBlizzard`.
- M18: `world18ShotInk`, `world18ShotPage`, `world18ShotSeal`.
- M19: `world19ShotProbe`, `world19ShotPsion`, `world19ShotBeam`.

Para evitar un salto artificial de dificultad, **se conserva el daño genérico previo de estos minions: `8 + familyIndex * 1.4`**. Cambian trayectoria, lectura, sprite y comportamiento, no su daño base.

### Legibilidad y rendimiento

- Las transiciones conductuales usan microanillos ya existentes, con throttle por enemigo.
- Se suprimen en `lowPerformance` y `reducedMotion`.
- Las fases semitransparentes nunca vuelven invisible al enemigo ni conceden invulnerabilidad.
- No se agregan proyectiles extra por la capa conductual; la cadencia heredada permanece.

### Versionado

- `js/game.js`: 3.35.0
- `manifest.json`: 3.35.0
- `index.html`: 3.35.0
- `sw.js`: `rizoma-zombie-strike-v3-35-0`

### Validación

Ver `VALIDACION_v3.35.0.txt`. No se declara prueba física Android/iOS ni smoke test visual real.
