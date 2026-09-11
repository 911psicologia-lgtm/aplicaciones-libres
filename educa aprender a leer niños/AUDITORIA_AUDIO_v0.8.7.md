# Auditoría de audio · v0.8.7

## Problemas corregidos
1. La versión anterior aplicaba tasas base muy bajas (aprox. 0.56–0.84) y además añadía reducción extra en escritorio. Esto podía producir una voz excesivamente lenta y poco natural.
2. `symbolPick` podía llamar “sílaba” a una vocal aislada o incluso a una palabra completa cuando no existía `voicePrompt` específico.
3. Las gemas de vocales enviaban cadenas como “Vocal a” al reproductor con categoría `syllable`.
4. Las selecciones de una sola letra se enviaban como `phoneme`, lo que podía hacer que el TTS pronunciara el nombre de la letra o una salida inestable.
5. El banco local no validaba que el clip solicitado perteneciera a la categoría pedagógica correcta.

## Criterio de v0.8.7
- `vowel`: vocal aislada.
- `phoneme`: sonido consonántico aislado; si no hay clip fiable, no se improvisa para consonantes oclusivas/ambiguas.
- `letterName`: nombre de la letra.
- `syllable`: sílaba explícita.
- `word`: palabra completa.
- `sentence` / `story` / `instruction`: discurso continuo.

## Velocidad
- Suave: 0.90×
- Normal: 1× (predeterminada)
- Ágil: 1.12×

La velocidad seleccionada afecta discurso continuo. Vocales, fonemas, sílabas, nombres de letras y palabras aisladas permanecen estables para preservar la señal fonológica.

## Prueba adulta incorporada
A · MA · MAMÁ permite comprobar de oído que vocal, sílaba y palabra se mantienen como unidades diferentes.
