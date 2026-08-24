# IMPLEMENTACIÓN v2.5.5 · MAESTRÍA DEL ARSENAL

Esta pasada continúa el Códice del Arsenal sin añadir daño, alterar fondos ni cambiar la progresión de campaña. El objetivo es convertir la colección en una memoria real de uso y facilitar futuras decisiones de balance.

## Telemetría local del arsenal
- Cada perfil registra de forma local las activaciones de poderes, fusiones, Intervenciones Críticas y Combos Críticos.
- Para cada poder se conserva además el nivel máximo alcanzado, primer/último mundo registrado y duración total concedida por activaciones.
- La información permanece dentro del estado local del juego. No se añade ninguna conexión externa ni envío de datos.

## Rangos de maestría
Los poderes descubiertos muestran un rango puramente informativo, sin bonificaciones de combate:
- Registrado: 1 activación.
- Sintonizado: 3 activaciones.
- Dominado: 10 activaciones.
- Maestro: 25 activaciones.
- Ápice: 50 activaciones.

El rango incluye una barra de avance hacia el siguiente umbral. La maestría no modifica daño, cadencia, defensa, rareza ni probabilidad de aparición.

## Colección y Códice
- Nueva sección “Maestría del arsenal” con resumen de activaciones de poderes, fusiones, críticos y combos críticos.
- Se muestran los cinco poderes más utilizados del perfil.
- Cada tarjeta desbloqueada del Códice indica rango de maestría, número de activaciones y nivel máximo alcanzado.
- Fusiones, críticos y combos críticos muestran sus activaciones acumuladas.

## Compatibilidad con perfiles anteriores
- Los descubrimientos históricos se migran con un uso mínimo inferido de 1, porque su presencia en la colección demuestra que fueron activados al menos una vez.
- A partir de v2.5.5 los usos nuevos se contabilizan exactamente desde cada activación.
- Se añade `arsenalTelemetry` al perfil sin reemplazar ni borrar los campos existentes.

## Corrección de versión interna
- `VERSION` en `game.js` se sincroniza finalmente con la versión real del paquete: `2.5.5`.
- Backups/exportaciones y registro del service worker dejan de identificarse internamente como 2.4.0.

## Elementos preservados
- Assets y fondos M1–M13: sin cambios.
- `completeMap()`: sin cambios.
- Archivo y Entrenamiento: sin cambios.
- Formas DOMINIO: sin cambios.
- Lógica de Bomba Omega: sin cambios.
- `openTacticalShop()` y `closeTacticalPrep()`: sin cambios; la tienda mantiene su pausa obligatoria.
