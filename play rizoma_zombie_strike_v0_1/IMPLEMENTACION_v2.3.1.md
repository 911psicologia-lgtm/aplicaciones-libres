# IMPLEMENTACIÓN v2.3.1 · Hotfix de progresión de campaña

## Problema corregido
Se detectaron rutas de progresión frágiles entre los Mundos 10, 11 y 12. Un perfil podía conservar `unlockedMap`, `completedMaps` y `lastSave` desincronizados entre versiones. Además, el botón principal iniciaba siempre el último mundo desbloqueado, incluso cuando ya estaba completado, y un guardado antiguo podía devolver al jugador a un mundo anterior.

## Correcciones
- Se añadió `reconcileCampaignProgress()` para reconstruir la progresión canónica usando `completedMaps`, `bossShips`, reliquias, Guardianes registrados, `unlockedMap` y `bestMap`.
- Si existe evidencia de haber derrotado al Guardián de un mundo avanzado, se reparan automáticamente los mundos anteriores de la campaña secuencial.
- Un `lastSave` situado en un mundo ya completado se considera obsoleto y se elimina.
- Se añadió `campaignTargetMap()` para iniciar el primer mundo desbloqueado que todavía no esté completado.
- Si los 12 mundos disponibles están completos, el botón de campaña abre el Archivo de Mundos en vez de reiniciar el último mundo.
- La transición del resultado captura explícitamente `completedMapIndex` y `nextMapIndex`; después del epílogo del Mundo 10 arranca M11 y después de M11 arranca M12 sin depender de un índice mutable.
- Cache PWA actualizado a v2.3.1.

## Reparación automática del caso reportado
Si el perfil conserva `bossShip12`, `world12Hadal` o el registro de Thalassar Hadal, al abrir v2.3.1 se reconstruye automáticamente la campaña como M1–M12 completada, se borra cualquier guardado obsoleto de M10 y se abre el Archivo en vez de enviar al jugador hacia atrás.
