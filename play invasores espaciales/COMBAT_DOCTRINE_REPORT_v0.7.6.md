# STARFALL FRONTIER v0.7.6 — COMBAT DOCTRINE

## Objetivo

Continuar Tactical Intent sin añadir dificultad plana ni saturación. La iteración introduce identidad combativa persistente, ritmo mínimo entre amenazas mayores y consecuencias acumulativas cuando el jugador domina las ventanas de interrupción.

## 1. Doctrinas persistentes por boss

Cada identidad conserva ahora una doctrina propia que modifica preferencias de intención, rol de escolta, movilidad y cadencia de signature sin alterar las reglas de telegraph ni el objetivo congelado:

- **NÚCLEO NOVA — ASALTO SOLAR:** presión frontal, fuego sostenido y persecución.
- **ARCONTE LANZA — DUELO AXIAL:** movilidad más alta, pinzas/interceptores y signatures algo más frecuentes.
- **MADRE ENJAMBRE — MANDO DE ENJAMBRE:** reorganización, cazadores y presión por escoltas.
- **DEVORADOR GRAVÍTICO — CERCO GRAVÍTICO:** control territorial, órbitas y cerco.
- **FÉNIX SINTÉTICO — RENACIMIENTO AGRESIVO:** alternancia entre cerco, persecución y control con escalamiento ofensivo.

Las preferencias son persistentes durante el encuentro, pero cicatrices, hábitos del jugador y estado de fase pueden modificar la selección contextual.

## 2. Threat Pacing Budget

Se incorpora un presupuesto temporal mínimo entre amenazas mayores. Después de resolver signature, Hunter Doctrine, Adaptive Echo, Phase Consequence, Fortress Pulse o Tactical Intent, el boss debe respetar una microventana antes de armar otra amenaza mayor. El fuego básico se retrasa también hasta el final de esa ventana, evitando cadenas ilegibles sin volver pasivo el encuentro.

## 3. Ruptura de mando

Dos interrupciones consecutivas de Tactical Intent dentro de una misma fase activan **CADENA DE MANDO ROTA**:

- se descoordina temporalmente la capacidad de invocar escoltas rutinarias;
- se retrasan `summonAt` y `nextEscortRefillAt`;
- se retrasa el siguiente Fortress Pulse;
- se concede puntuación adicional;
- se crea una ventana de dominio real antes de que el boss reorganice su ofensiva.

Si una intención llega a ejecutar su remate, la racha de interrupciones se reinicia. Esto premia dominio consecutivo, no acumulación automática.

## 4. Escoltas coherentes con doctrina

Las escoltas vinculadas a Tactical Intent utilizan ahora roles definidos por identidad e intención. Interceptors fijan carriles de pinza, Orbiters ocupan posiciones laterales, Hunters persiguen de forma limitada y Gunners sostienen presión. La coordinación sigue siendo interrumpible y respeta el objetivo fijado.

## 5. Fatiga estructural de subjefes

Las interrupciones ofensivas de subjefe dejan ahora memoria. Tras dos desequilibrios exitosos aparece **FATIGA ESTRUCTURAL**:

- la recarga posterior de escudo se reduce;
- la recuperación tras signature se prolonga;
- la siguiente signature se retrasa adicionalmente;
- el estado se comunica visualmente como `FATIGA · RECARGA REDUCIDA`.

La mejora recompensa precisión temporal y evita convertir al subjefe en una simple esponja de HP.

## 6. Continuidad y equidad

Se preservan íntegramente Tactical Intent, Phase Consequence, Tactical Ecosystem, Hunter Doctrine, Battle Rhythm y Encounter Evolution. Los nuevos estados respetan pausa/reanudación y se limpian en Reactor Reboot y cambios de fase. La doctrina modifica preferencias y tiempos; no retargetea durante telegraphs ni introduce seguimiento imposible.

## 7. Preservación

Comparado con v0.7.5:

- `assets/`: **273/273 archivos idénticos byte a byte**.
- `audio/`: **451/451 archivos idénticos byte a byte**.
- `js/economy.js`: **idéntico byte a byte**.

## 8. Versión/PWA

- App: `0.7.6`
- Etiqueta: `v0.7.6 · COMBAT DOCTRINE`
- Cache: `starfall-shell-v0.7.6`
- Service Worker build: `0760`

## 9. Validación

- **41/41 pruebas JavaScript PASS**.
- **11/11 validadores Python PASS**.
- `node --check js/game.js`: PASS.
- `node --check js/config.js`: PASS.
- Prueba específica `combat-doctrine-v076.js`: PASS.
- Validador específico `validate-v076.py`: PASS.
- Se verificaron doctrinas diferenciadas, cooldown de amenaza mayor, ruptura de mando, supresión de escoltas durante descoordinación y fatiga funcional del subjefe.

## Resultado de diseño

v0.7.6 no añade dificultad por volumen. Introduce personalidad persistente, secuenciación legible y consecuencias por dominio del jugador. El boss ya no solo reacciona: mantiene una forma característica de combatir; y el jugador puede desorganizarla temporalmente mediante ejecución táctica consistente.
