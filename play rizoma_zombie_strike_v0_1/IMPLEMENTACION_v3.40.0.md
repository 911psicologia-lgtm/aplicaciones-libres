# RIZOMA ZOMBIE STRIKE v3.40.0
## Laboratorio de Balance Local

Base maestra: v3.39.0 — Telemetría Local de Balance.

## Objetivo
Convertir la telemetría local ya existente en una herramienta de lectura prudente por mundo, sin aplicar rebalance automático ni modificar HP, daño, cadencias, spawns, patrones, economía o assets.

## Implementación
- Nuevo panel `LABORATORIO DE BALANCE LOCAL` dentro de Ajustes.
- Renderiza siempre M1–M20, incluso cuando un mundo todavía no posee datos.
- Estados de lectura: `SIN DATOS`, `MUESTRA INSUFICIENTE`, `ESTABLE · PROVISIONAL`, `REVISAR`.
- Confianza de muestra:
  - sin muestra: 0 intentos;
  - baja: 1–2 intentos;
  - media: 3–6 intentos;
  - alta: 7 o más intentos.
- Una señal diagnóstica fuerte exige al menos 3 intentos del mismo mundo.
- Señales disponibles: letalidad alta, presión posiblemente baja, duración alta, jefe prolongado, densidad alta, daño de casco alto por minuto, eventos letales frecuentes y rescates frecuentes.
- Las comparaciones relativas usan medianas de la telemetría local del propio perfil; no se transmiten datos.
- Se conserva la advertencia de que estas señales son heurísticas y no prueban causalidad.

## Salidas nuevas
- `Exportar CSV`: una fila por cada uno de los 20 mundos, con intentos, victorias, tasa de victoria, tiempos, daño, densidad, poderes, confianza y señales.
- `Copiar informe`: resumen textual listo para revisión posterior, incluyendo solo señales con muestra suficiente.
- La exportación JSON de v3.39.0 se conserva intacta.

## Principio de balance
v3.40.0 NO realiza cambios automáticos de dificultad. Su función es observar, comparar y ayudar a decidir. Cualquier modificación posterior de HP, daño, spawns o duración debe basarse en repetición suficiente y revisión contextual.

## Rendimiento y privacidad
- El laboratorio procesa exclusivamente registros ya almacenados en `localStorage`.
- No añade `fetch`, `XMLHttpRequest`, `WebSocket` ni `sendBeacon`.
- No modifica el muestreo 4 Hz de telemetría de v3.39.0.
- No añade trabajo por frame al combate: el análisis se genera al abrir Ajustes/exportar/copiar.
