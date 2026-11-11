# Recuperación de las interpretaciones V16 y corrección de Es

Revisión del 11 de noviembre de 2026. Fuente original: `MMPI2_App_V16_Licensed(1).zip`. Base funcional: edición licenciada 17.3.

## Interpretaciones recuperadas

La biblioteca `js/lib/interpret.js` es idéntica a V16. Se recuperó su uso en las lecturas breves y en los párrafos de cada grupo. También se recuperaron la distribución de elevaciones, las áreas de funcionamiento, la configuración del perfil, la síntesis integradora y las recomendaciones específicas. La interpretación permanece suspendida cuando los indicadores de validez lo requieren. Las escalas desactivadas se excluyen de la integración.

La excepción de contenido corresponde a validez y Es. Es describe los recursos percibidos frente al estrés actual; el informe no deriva automáticamente un pronóstico psicoterapéutico de esa puntuación. Las propuestas de revisión editorial de textos históricos siguen pendientes de aprobación y los archivos originales se conservan íntegros.

## Ejemplos de validez

| Escala | T | Lectura breve |
| --- | --- | --- |
| VRIN | 46 | Respuestas coherentes entre afirmaciones de contenido similar u opuesto, sin inconsistencia relevante. |
| TRIN | 65V | Leve predominio de respuestas «Verdadero», sin alcanzar el umbral de inconsistencia relevante. |
| F | 72 | Reconocimiento elevado de experiencias poco frecuentes, compatible con malestar emocional importante. |
| Fb | 85 | Respuestas poco frecuentes muy elevadas en la parte final del cuestionario, compatibles con malestar intenso o cambios en la forma de responder. |
| Fp | 57 | Sin elevación relevante de experiencias que son raras incluso en población clínica. |
| L | 66 | Posible presentación favorable de sí misma, con menor reconocimiento de faltas o dificultades cotidianas. |
| K | 52 | Presentación de las dificultades dentro de límites habituales, sin elevación defensiva marcada. |
| S | 49 | Autodescripción positiva dentro de límites habituales, sin idealización marcada de la propia imagen. |

## Es con PD 22 en mujeres y referencia estadounidense

| Escala | Nombre | PD | PD+K | T | Rango de T | Lectura breve |
| --- | --- | ---: | --- | --- | --- | --- |
| Es | Fuerza del yo | 22 | — | ≤30 | Bajo | Recursos de afrontamiento percibidos reducidos y sensación de vulnerabilidad ante el estrés actual. |

La tabla estadounidense incluida comienza en PD 24 y T 30 para mujeres, y PD 28 y T 30 para hombres. Los informes públicos oficiales de Pearson muestran T 30 también por debajo de esos tramos: una mujer con PD 19 y otra con PD 23. Estos resultados apoyan usar 30 como límite inferior de reporte para el tramo inferior de Es. La extensión al resto de ese tramo es una regla de reporte aplicada a partir de esos ejemplos oficiales y del extremo de la tabla incluida. Se explicita con el signo ≤.

La corrección es específica de Es y de la referencia estadounidense diferenciada por sexo. Las conversiones tabuladas permanecen iguales. Las referencias mexicana y española conservan su tratamiento previo. En la comparación longitudinal, las puntuaciones con límite conservan el signo y quedan sin una diferencia T exacta.

Fuentes oficiales consultadas:

- Pearson. *MMPI-2 Adult Clinical Inpatient Mental Health Interpretive Report*, muestra Karen Z: Es PD 19 y T 30. https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/mmpi-2/mmpi-2-adult-clinical-inpatient-mental-health-interpretive-report.pdf
- Pearson. *MMPI-2 General Corrections Interpretive Report*, muestra Margaret L: Es PD 23 y T 30. https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/mmpi-2/mmpi-2-forensic-general-corrections-interpretive-report.pdf
- Pearson. *MMPI-2 Competency/Commitment Interpretive Report*, muestra Mark D: Es PD 21 y T 30 en un hombre. https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/mmpi-2/mmpi-2-forensic-competency-commitment-interpretive-report.pdf

## Actualización y licencias

Se conservan el catálogo y el verificador de licencias de 17.3. Las 81 claves del lote anterior continúan siendo las mismas. La corrección de Es de los casos guardados se aplica al leer el registro y conserva el consumo existente. Para conservar casos y saldo, actualice la carpeta publicada manteniendo el mismo dominio y perfil del navegador. El archivo `README.md` contiene los pasos de apertura y actualización.
