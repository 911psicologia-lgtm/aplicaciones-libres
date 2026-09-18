# RIZOMA ZOMBIE STRIKE v3.61.0 — GUARDIAN COMBAT PERSONA + INTENT CHAINS

## Propósito
Consolidar los sistemas tácticos v3.52–v3.60 dentro de una lógica de comportamiento reconocible por Guardián, especialmente en M11–M20. No se añaden HP, nuevas barras de vida ni capas simultáneas; se coordina mejor lo existente.

## Implementaciones

### 1. Personalidad de combate M11–M20
Cada Guardián tardío recibe un perfil estratégico: Acechador Dunar, Pastor Abisal, Forjador Magmático, Orbitador Solar, Constrictor Parásito, Predictor Sináptico, Cazador Crio, Editor de Ruptura, Controlador Psiónico y Depredador Ápice.

Cada perfil define:
- preferencia relativa por Firma / Cerco / Enlace;
- ritmo de minions, escoltas, hazards, firmas y arena;
- familias de firmas signature preferidas;
- maniobras de movimiento preferidas para cada intención;
- follow-ups plausibles entre acciones.

### 2. Intent Chains
El Guardián puede formar una intención táctica breve (FIRMA, CERCO o ENLACE). La intención no fuerza la acción: sólo adelanta su cooldown y propone una maniobra compatible. El Árbitro Táctico mantiene prioridad absoluta sobre carga, recuperación, ruptura, Duelo y Último Asalto.

### 3. Movimiento + ataque coherentes
Una intención puede inyectar una sola `personaMotionHint` en el mazo de movimiento. Ejemplos: M17 Cazador Crio tiende a `pounce` antes de Firma; M19 puede entrar en `psionStrafe` para Cerco; M20 usa `charge` para Firma. El hint se consume una vez y luego vuelve el mazo anti-repetición normal.

### 4. Signature bias por personalidad
Las firmas dejan de seleccionarse únicamente por rotación global. Cada personalidad usa un pool propio con anti-repetición; M19/M20 endurecen el pool en fase 4 sin aumentar daño base ni HP.

### 5. HUD y guía
Cuando no existe un estado táctico de mayor prioridad, el HUD puede mostrar `INTENCIÓN FIRMA / CERCO / ENLACE`. La descripción accesible incluye el nombre de la personalidad.

### 6. Telemetría
Se registran:
- `personaIntentChanges`
- `personaIntentFulfilled`
- `personaFollowups`
- `personaSignatureMatches`

## Conservación
Se preservan 20 mundos, curva base de HP, PWA, assets, economía, progreso, Director Adaptativo, Contravector, Flow, Foco, Riposta, Anclas, Cerco, Enlace, Último Asalto y Spawn Gates.
