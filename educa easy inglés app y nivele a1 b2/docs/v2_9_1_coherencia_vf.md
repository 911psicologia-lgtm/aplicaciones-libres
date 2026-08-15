# v2.9.1 · Coherencia robusta de Verdadero/Falso

## Alcance antialucinación
Se corrigió el banco completo de ejercicios V/F usando las frases y traducciones reales de cada microlección como fuente interna de verdad.

## Cambios
- Regeneradas las 150 preguntas V/F desde vocabulario validado en `lessons.blocks`.
- Balance final: 75 verdaderas y 75 falsas controladas.
- Añadido `expectedMeaning` a cada V/F para auditoría futura.
- Corregido el caso: “I don't like noise” significa “No me gusta el ruido” → verdadero.
- Añadida validación técnica para detectar V/F incoherentes cuando exista `expectedMeaning`.

## Validación
- Incoherencias detectadas tras regeneración: 0.
- JS validado con `node --check`.
- JSON validado.
