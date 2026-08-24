# IMPLEMENTACIÓN v2.5.6 · DOCTRINAS TÁCTICAS DEL ARSENAL

Esta pasada continúa la Maestría del Arsenal con una capa de preferencia de construcción. No añade daño, vida, duración, rareza, monedas ni recompensas gratuitas. La doctrina solo orienta de forma limitada la selección de cápsulas de poder que aparece al subir de nivel.

## Cinco doctrinas persistentes por perfil
- **Rizoma Libre**: selección neutral; no introduce ningún sesgo.
- **Filo Vectorial**: afinidad principal con Armas y secundaria con Amplificadores.
- **Bastión Abisal**: afinidad principal con Defensa y secundaria con Control.
- **Enjambre Espectral**: afinidad principal con Apoyo y secundaria con Utilidad/Control.
- **Convergencia Omega**: afinidad principal con Críticos y secundaria con Amplificadores/Armas.

La doctrina activa se guarda en `arsenalDoctrine` dentro del perfil. Los perfiles antiguos migran automáticamente a **Rizoma Libre**.

## Regla de sesgo blando
La doctrina no sustituye el azar del roguelite:
- Solo puede orientar **como máximo 1 de las 3 cápsulas** de una subida de nivel.
- La posibilidad de que exista una cápsula doctrinal es del **65%**.
- Las otras cápsulas continúan usando la selección normal.
- La cápsula sugerida se identifica visualmente con `⌁ DOCTRINA`.
- La selección doctrinal conserva ponderación por rareza; no convierte épicos o legendarios en resultados garantizados.
- Las prioridades previas del juego se respetan: compañero de fusión y arma temprana conservan precedencia.
- Entrenamiento queda excluido del sesgo doctrinal.

## Afinidad y recomendación desde Maestría
La telemetría local de v2.5.5 se reutiliza para calcular una afinidad informativa de cada doctrina según los poderes realmente utilizados por el perfil.
- Se toman los usos registrados de poderes compatibles.
- Los tipos principales pesan más que los secundarios.
- Se consideran las tres firmas de uso más fuertes para reducir sesgos por cantidad de poderes dentro de cada categoría.
- La interfaz marca una doctrina como recomendada, pero el jugador puede escoger cualquiera o mantener Rizoma Libre.

La afinidad no concede bonificaciones de combate.

## Interfaz
La pantalla **Colección** incorpora una sección `Doctrinas tácticas` con:
- doctrina activa;
- explicación de la regla 65% / máximo 1 de 3;
- recomendación basada en historial;
- afinidad de cada doctrina;
- selector persistente por perfil.

## Elementos preservados
- Assets y fondos M1–M13: sin cambios.
- Progresión de campaña y `completeMap()`: sin cambios.
- Archivo y repetición de mundos: sin cambios.
- Entrenamiento y recompensas fijas de entrenamiento: sin cambios.
- Recompensas fijas de mundos y hordas: sin cambios.
- Botín de Guardianes: sin cambios.
- Bomba Omega: sin cambios.
- `openTacticalShop()` y `closeTacticalPrep()`: sin cambios; la tienda mantiene su pausa obligatoria.
