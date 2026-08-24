# IMPLEMENTACIÓN v2.5.8 · MEMORIA DE EXPEDICIONES

Esta pasada continúa directamente la secuencia Códice → Maestría → Doctrinas → Cartografía de Sinergias. No añade daño, vida, rareza, duración, monedas, recompensas ni probabilidad de aparición. La nueva capa conserva una memoria local de las builds con las que realmente termina cada expedición.

## Historial local de expediciones
Cada perfil incorpora `expeditionMemory` con un máximo de 18 registros. Una expedición se archiva únicamente cuando el resultado queda cerrado de forma definitiva:
- victoria de campaña;
- victoria en repetición;
- victoria de Entrenamiento;
- derrota cuando el jugador abandona y se finaliza la misión.

Una derrota provisional no se registra si todavía puede continuar mediante una vida. Así se evita contaminar el historial con resultados intermedios.

Cada registro conserva:
- fecha y versión;
- modo de juego;
- victoria o interrupción;
- mundo y nivel;
- puntaje y bajas;
- dificultad;
- identidad de build;
- doctrina y afinidad;
- cantidad total de poderes;
- firmas de poder utilizadas;
- tres poderes principales;
- fusiones completadas.

## Memoria de expediciones en Colección
La pantalla **Colección** incorpora una nueva sección con:
- total de expediciones archivadas;
- resultados superados;
- identidad de build más frecuente;
- mayor número de fusiones registrado en una sola expedición;
- las ocho expediciones más recientes;
- sus poderes principales, fusiones, puntaje, bajas, doctrina y afinidad.

La información permanece local en el perfil y viaja dentro del backup JSON existente.

## Referencia de build
Cualquier expedición archivada puede fijarse como **referencia**. Esta función es exclusivamente comparativa:
- no cambia la doctrina;
- no cambia el 65% de sesgo doctrinal;
- no modifica las tres cápsulas de subida;
- no aumenta daño, duración, rareza ni recompensas.

Mientras existe una referencia, el menú de pausa informa cuántas firmas de la build actual coinciden con esa expedición guardada.

## Comparación al terminar una misión
El resultado final compara la expedición recién archivada con la inmediatamente anterior y muestra:
- cambio de puntaje;
- cambio en cantidad de poderes;
- cambio en cantidad de fusiones;
- continuidad o cambio de identidad de build;
- continuidad o cambio de doctrina.

Si la misión todavía puede reactivarse, la interfaz avisa que la expedición sigue abierta y no la registra todavía.

## Snapshot para análisis externo
El prompt local de análisis de partida incorpora las cinco expediciones más recientes como resumen, sin enviar información automáticamente a ningún servicio.

## Elementos preservados
- Assets y fondos M1–M13: sin cambios.
- `completeMap()`: idéntico a v2.5.7.
- `generateCards()`: idéntico a v2.5.7; doctrina conserva 65% y máximo 1 de 3 cápsulas.
- `triggerScreenNuke()`: idéntico a v2.5.7; Bomba Omega conserva sus reglas.
- `openTacticalShop()`, `closeTacticalPrep()` y `buyTacticalOffer()`: idénticos a v2.5.7; la tienda continúa pausando la partida.
- Progresión, Archivo, Entrenamiento y repetición: sin cambios de reglas.

La única modificación del cierre de misión está en `finalizeRun()`, que registra la memoria informativa antes de ejecutar la lógica previa de finalización.
