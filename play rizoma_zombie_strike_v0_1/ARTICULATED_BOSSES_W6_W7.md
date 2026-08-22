# v1.9.4 · Jefes articulados W6–W7

## Objetivo

Convertir Magnate Omega y Leviatán Abisal en bosses visualmente activos sin alterar la lógica estable de W1–W5 ni introducir librerías externas.

## Assets generados a partir de los sprites canónicos

### Mundo 6 · Magnate Omega
- `assets/future/bosses/articulated/world6_magnate_body.png`
- `assets/future/bosses/articulated/world6_magnate_hatch.png`
- `assets/future/bosses/articulated/world6_magnate_drone.png`

El cuerpo conserva el sprite completo con una cavidad oscura bajo el núcleo frontal. La compuerta reutiliza el núcleo frontal del arte original y el drone emerge desde esa cavidad durante la carga.

### Mundo 7 · Leviatán Abisal
- `assets/future/bosses/articulated/world7_leviatan_body.png`
- `assets/future/bosses/articulated/world7_leviatan_hatch.png`
- `assets/future/bosses/articulated/world7_leviatan_medusa.png`

El cuerpo conserva el sprite canónico con cavidad bioluminiscente. La placa frontal se articula y una medusa del propio arte del Leviatán emerge de manera progresiva.

## Mecánica de apertura

`bossFight.charge` se normaliza de 0–100 a 0–1. La apertura empieza al 20% y llega a 1 alrededor del 85%:

```js
const charge=clamp((this.bossFight?.charge??0)/100,0,1);
const target=clamp((charge-.20)/.65,0,1);
```

La transición usa velocidad fija por segundo, no un lerp exponencial. Cuando `bossFight.charge` se reinicia tras activar Boss Drive, la capa vuelve a cerrarse suavemente.

## Motor reusable

`drawBossHatchLayer(ctx,e,cfg)` queda preparado para futuras mandíbulas, placas, alas, núcleos o portales de W8–W10. Las configuraciones son constantes estáticas y no se crean dentro del loop de render.

## Assets recuperados W8–W10 ya presentes

La inspección confirmó que la v1.9.3 ya contenía:
- `world8_tardigrado_primigenio.png`
- `world9_kaiser_infinito.png`
- `world10_zeros_prime.png`
- `meteoros_6_10.png`
- `basura_espacial_6_10.png`

La imagen `assets/future/reference/bosses_2_0_mundos_6_10.png` queda solo como biblia visual para la siguiente fase.
