# Migración v2.5

## Problemas corregidos

1. El inicio reunía guía, duración y modos en una misma cuadrícula, generando vacío y sobrecarga visual.
2. Los recursos conservaban referencias de versión 2.1/2.2/2.4, lo que podía servir código antiguo desde la PWA.
3. El reproductor dependía de una transición simple entre eventos `onend`.
4. Conexiones había perdido el mapa visual y se había convertido en una lista de tarjetas.
5. El service worker intentaba cachear solicitudes ajenas al origen, incluyendo `chrome-extension:`.

## Solución

- Flujo progresivo de cuatro pantallas.
- Versionado uniforme 2.5 y activación inmediata del nuevo service worker.
- Cola continua con recuperación, temporizadores y avance guardado.
- Mapa radial con ocho nodos, vínculos visibles, acciones Escuchar/Centrar y reproducción del rizoma.
- Estrategia de caché limitada al mismo origen y protocolos compatibles.
