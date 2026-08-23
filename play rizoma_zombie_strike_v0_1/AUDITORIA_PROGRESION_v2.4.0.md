# Auditoría de progresión v2.4.0 · Mundo 10 → 11 → 12 → 13

## Problema confirmado
El bloqueo reportado después del Mundo 10 no era únicamente un error de interfaz. La base acumulaba varias fuentes de desincronización capaces de dejar Mundo 11 visualmente inactivo o reabrir una partida antigua de Mundo 10.

### 1. Recursos web con versión antigua
`index.html` de builds anteriores seguía solicitando `game.js`, CSS y manifest con query de versión `v2.2.0`. En navegador/PWA esto podía conservar recursos previos aunque el ZIP contuviera lógica nueva.

**Corrección v2.4.0**
- `js/game.js?v=2.4.0`
- `css/styles.css?v=2.4.0`
- `manifest.json?v=2.4.0`
- Service Worker `rizoma-zombie-strike-v2-4-0` elimina caches anteriores y toma la red como fuente principal.

### 2. Evidencia histórica de mundos vencidos
Algunos perfiles conservaban `bestMap`, reliquias, naves de jefe o Guardianes registrados, pero no `completedMaps` actualizado.

**Corrección v2.4.0**
`reconcileCampaignProgress()` reconstruye el progreso a partir de:
- `completedMaps`
- `unlockedMap`
- `stats.bestMap`
- `bossShips`
- reliquias de finalización
- Guardianes registrados en colección
- `pendingCampaignMap`

Si se demuestra que M10 fue superado, se reconstruye M1–M10 y se habilita M11.

### 3. Guardado antiguo arrastrando al jugador hacia atrás
Un `lastSave` localizado en un mundo ya superado podía volver a abrir ese mundo.

**Corrección v2.4.0**
Todo guardado situado dentro del rango de mundos ya completados se considera obsoleto y se elimina de forma automática.

### 4. El desbloqueo ocurría demasiado tarde
Si la historia, overlay o navegación se interrumpía después de vencer al jefe, el desbloqueo siguiente podía no persistir a tiempo.

**Corrección v2.4.0**
`completeMap()` guarda inmediatamente:
- mundo completado,
- siguiente mundo desbloqueado,
- `pendingCampaignMap`,
- eliminación de `lastSave` obsoleto,
antes de mostrar epílogos o transiciones.

### 5. Saga II mostraba estado fijo
La pantalla de Saga II estuvo originalmente orientada a presentar solo M11 como jugable, por lo cual mundos posteriores podían aparecer como señales inactivas aun estando implementados.

**Corrección v2.4.0**
El estado se calcula dinámicamente para todos los mundos realmente incluidos en `MAPS`:
- `SUPERADO · REPETIBLE`
- `SEÑAL ABIERTA · JUGABLE`
- `BLOQUEADO · SUPERA MUNDO X`
- `PRÓXIMAMENTE`

M11, M12 y M13 se muestran como jugables cuando corresponde.

## Pruebas de reparación de perfil
Se probaron escenarios equivalentes a perfiles históricos:

| Escenario | Resultado esperado | Resultado v2.4.0 |
|---|---|---|
| M1–M10 en `completedMaps`, `unlockedMap=10` | abrir M11 | OK |
| solo `bestMap=10` + victorias de jefe | reconstruir M1–M10 y abrir M11 | OK |
| solo reliquia `world10Zero` | reconstruir hasta M10 y abrir M11 | OK |
| solo `bossShip10` | reconstruir hasta M10 y abrir M11 | OK |
| transición M10 con `pendingCampaignMap=10` | persistir M11 | OK |
| completado hasta M12 | abrir M13 | OK |
| completado hasta M13 | campaña actual completa / Archivo | OK |

## Regla de campaña consolidada
La campaña intenta abrir siempre el **primer mundo todavía no superado** entre los mundos desbloqueados. Repetir un mundo completado queda reservado al Archivo de Mundos y no reemplaza el avance de campaña.
