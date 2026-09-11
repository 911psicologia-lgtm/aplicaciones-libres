# RIZOMA ZOMBIE STRIKE v3.39.0
## Telemetría local de balance y observabilidad de campaña

### Objetivo
La v3.39.0 no añade mundos, enemigos, HP ni daño. Instrumenta la base v3.38.0 para observar cómo se juega realmente cada mundo y permitir que los próximos ajustes de balance se basen en evidencia de partida.

### Telemetría por intento
Cada intento registra localmente, dentro del perfil activo:

- mundo, dificultad y modo (campaña, repetición o entrenamiento);
- tiempo de juego activo, excluyendo pausas;
- tiempo acumulado de combate contra Guardián;
- nivel/oleada máxima alcanzada;
- bajas y puntaje obtenidos durante el intento;
- daño entrante tras mitigaciones;
- daño absorbido por escudo;
- daño realmente aplicado al casco;
- número de impactos recibidos;
- eventos letales;
- activaciones de Última Oportunidad y rescates;
- poderes obtenidos/activados, duración concedida, activaciones y cola;
- fase máxima del Guardián, rupturas y rupturas limpias;
- pico de enemigos simultáneos;
- pico de proyectiles enemigos y propios;
- pico de partículas, pickups, hazards y aliados;
- pico combinado de amenaza (enemigos + proyectiles enemigos + hazards);
- Nave Rizoma y etapa de arsenal al finalizar;
- vidas restantes y compras de vida.

### Rendimiento
La duración se acumula dentro del update normal. Las métricas de densidad se muestrean cada 0,25 s (4 Hz), no cada frame, para evitar convertir la propia telemetría en una carga relevante de CPU.

### Guardado y continuidad
`telemetrySession` se incluye en el guardado de partida. Al reanudar, continúa el mismo intento y conserva sus acumulados. Reiniciar un mundo cierra el intento anterior con resultado `restart`. Victoria, derrota y repetición completada cierran explícitamente el registro.

El historial se limita a los 80 registros más recientes por perfil para evitar crecimiento indefinido de localStorage.

### Privacidad
La telemetría es local. No se añadió ningún mecanismo de transmisión. El bloque nuevo no utiliza `fetch`, `XMLHttpRequest`, `WebSocket` ni `sendBeacon`.

En Ajustes aparece una sección **TELEMETRÍA LOCAL · BALANCE** con:

- estado de registros disponibles;
- `Exportar JSON`;
- `Reiniciar` con confirmación.

La exportación ocurre solamente por acción explícita del jugador.

### Lectura inmediata
El resultado de cada intento incorpora cuatro indicadores compactos:

- tiempo activo;
- tiempo de Guardián;
- daño de casco;
- pico combinado de amenaza.

### Integración con análisis externo
El botón existente **Copiar prompt para analizar partida con IA** ahora incorpora `telemetria_balance_local`, un resumen agregado por mundo con intentos, victorias, tasa de victoria, duración media, tiempo medio de jefe, daño medio y picos de presión.

### Balance preservado
La v3.39.0 no modifica:

- WORLD_DIFFICULTY_CURVE M1–M20;
- HP de Guardianes;
- ENEMY_TYPES;
- `damageEnemy()`;
- `updateAdvancedEnemyIdentity()`;
- `advancedEnemyAim()`;
- `triggerBossSpecial()`;
- `bossPattern()`;
- `boss2Pattern()`;
- `boss2Special()`;
- `applyBossVolleyAccent()`;
- `addEnemyBullet()`.

`spawnBoss()` conserva su lógica de combate; solamente recibe un marcador telemétrico al iniciar la pelea.

### Próximo uso recomendado
Después de acumular varias partidas, exportar el JSON permitirá localizar mundos con:

- duración excesiva;
- tiempo de Guardián desproporcionado;
- daño al casco anormalmente alto;
- demasiados eventos letales;
- picos de proyectiles/amenazas difíciles de leer;
- poderes excesivamente frecuentes o poco utilizados;
- diferencias acusadas entre Normal y Difícil.

La siguiente etapa de rebalance debería partir de estas observaciones y no de aumentos generales de HP.
