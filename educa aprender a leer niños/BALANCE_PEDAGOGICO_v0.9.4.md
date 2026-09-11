# Balance pedagógico · v0.9.4

Esta versión modifica el compositor de sesiones, no el currículo.

## Familias funcionales

- **Escucha:** `listenPick`, `syllableTrail`, `soundBubbles`.
- **Reconocimiento:** `picturePick`, `symbolPick`, `imageWordPick`, `memoryMatch`.
- **Motor:** `trace`, `wordWrite`.
- **Construcción:** `build`, `missingPart`, `gapFill`.
- **Lectura:** `sentenceBuild`, `sentenceSceneRead`.
- **Modelo:** `patternIntro`, `wordReveal`, `wordModel`, `sentenceModel`.

## Reglas de composición

1. Se conserva el orden curricular base de las actividades declaradas en cada mundo.
2. Las variantes seleccionadas permanecen en la zona en la que fueron diseñadas; no se agrupan tras un único pivote.
3. Cuando dos actividades consecutivas pertenecen a la misma familia, se busca localmente una alternativa cercana de otra familia sin adelantar patrones o cierres.
4. Si todavía queda una racha de tres o más tareas de la misma familia, se reutiliza una actividad sensorial previa como separador cuando hacerlo no rompe el orden pedagógico.
5. Los repasos se espacian dentro de la misión: uno al inicio y otro después de tres actividades centrales.
6. Las variantes priorizan contenido menos reciente y, en caso de empate, diversidad de mecánica.

El objetivo no es aleatorizar por completo, sino mantener una progresión reconocible reduciendo monotonía y fatiga.
