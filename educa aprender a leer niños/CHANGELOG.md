# CHANGELOG · v0.7.3 · Interfaz prelectora

## Fase 1 · Cabecera y densidad visual
- Cabecera convertida a una única fila de iconos.
- Eliminados del home los bloques permanentes “Ruta lectora”, “Tu bosque lector” y contador de semillas.
- `1/3` reducido a indicador compacto.
- Información pedagógica del siguiente paso pasa a un panel `i` bajo demanda.

## Fase 2 · Ruta entre mundos
- Retirada la ruta de rayas/flechas de v0.7.2.
- Nueva ruta de huellitas humanas pequeñas, alternadas y ligeramente curvas.
- Estados: recorrido superado, tramo actual animado y tramo futuro atenuado.
- Siguiente mundo conserva pulso y guía de Lumi.

## Fase 3 · Acciones + PWA
- Continuar, Lumi recomienda y repaso en una sola línea visual.
- Repaso pendiente titila.
- Instalar PWA: icono superior, solo si `beforeinstallprompt` está disponible.
- Actualizar PWA: oculto salvo actualización real; estado de atención y actualización.
- `display: fullscreen` + `display_override` en manifest.
- Solicitud segura de Fullscreen API desde gestos del usuario.

## Fase 4 · Trazado
- Se elimina el cierre automático al alcanzar el umbral de cobertura.
- Check interno indica “suficiente” sin bloquear el canvas.
- El niño puede continuar la palabra/letra y decide cuándo pulsar Completar.
- Se mantiene la salida tolerante para que un reconocimiento imperfecto no atrape al niño.

## Fase 5 · Fin de aventura
- Resultado comprimido y predominantemente icónico.
- Botones circulares en una sola fila: anterior, mapa, libro, repetir.
- El siguiente mundo es un orbe grande independiente con flecha.
- Se elimina el apilamiento vertical de navegación visto en móvil.
