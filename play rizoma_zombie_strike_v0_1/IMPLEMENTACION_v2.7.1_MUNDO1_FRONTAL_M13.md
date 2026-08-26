# Implementación v2.7.1 — Mundo 1 Reimaginado + Sistema Frontal + Restauración M13

Base: v2.7.0 — Mundo 14 · Estrella Moribunda.

## Cambios principales
- Avatar básico `explorador` conserva su ID y estadísticas, pero usa el caza mecánico Fénix RZ-1.
- `wingman` y apoyo inicial del Mundo 1 usan mini naves RZ-1/RZ-2.
- Mundo 1 incorpora director de amenazas frontales pseudo-3D con z, curva no lineal de escala, deriva, telegraph, near miss, disparos, premios, pooling y límites por dispositivo.
- Tipos iniciales: meteorito, fragmento, restos de nave, cápsula/módulo, caza frontal y élite frontal.
- Los cazas frontales supervivientes pueden entrar al plano 2D sin aplicar colisión de meteorito antes de la conversión.
- Mundo 1 recibe microfrenesí y apoyo/poderes más tempranos sin alterar el movimiento libre.
- Mundo 13 reemplaza los fondos degradados por dos fondos limpios de la misma familia visual necro-cósmica; se retiran los sprites planetarios del pool de hazards sobredimensionados.
- Mundo 14 y su progresión permanecen preservados.

## Compatibilidad
- Se conserva `id: explorador`, las claves de guardado y la progresión previa.
- Se preservan tienda, pausa, archivo de mundos, entrenamiento y audio existentes.
