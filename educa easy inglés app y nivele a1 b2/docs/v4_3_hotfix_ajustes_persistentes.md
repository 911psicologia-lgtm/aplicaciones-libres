# Inglés para Dummies · v4.3 hotfix ajustes persistentes

## Cambios aplicados

1. Saludo del loro reequilibrado: burbuja más amplia, loro más grande y botones visibles sin sensación de pantalla apeñuscada.
2. Error persistente de conversaciones corregido: se normalizan conversaciones A2, B1 y B2 que venían con esquema `prompt/translation` hacia el esquema interno `left/leftEs/es`.
3. Se actualizó también `content/content.v1.json` para dejar las conversaciones bilingües completas en origen.
4. La casita del dock inferior ahora lleva al login/perfil inicial, conservando datos locales.
5. Se agregó botón de salida directa al dock inferior.

## Nota técnica

El error no correspondía a contenido ausente, sino a doble nomenclatura en el modelo de conversaciones. El motor auditaba `left` y `leftEs`, mientras algunas rutas nuevas guardaban `prompt` y `translation`. Se implementó normalización en memoria y en archivo fuente.
