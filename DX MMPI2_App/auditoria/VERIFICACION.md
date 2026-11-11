# Verificación de la Suite clínica licenciada 17.4

Fecha de revisión · 11 de noviembre de 2026. Base · ZIP MMPI-2 V16 licenciada. Los casos, identificadores y narrativas usados en las pruebas son sintéticos.

## Aceptación

| Prueba | Resultado |
| --- | --- |
| Caso nuevo | Se verificaron las casillas por defecto, la dependencia entre PSY-5 y clústeres, y la activación de Nota de alcance. |
| Caso guardado antes del cambio | Migración de las opciones y de Contexto de la solicitud. Se conservaron respuestas, puntuaciones, caso actual, borrador y papelera. |
| Prompt completo y mínimo | 22 y 9 secciones consecutivas con el mismo plan en las exportaciones. |
| Ausencia de MMPI-2 anterior | Casilla deshabilitada con «Sin datos previos» y contraste omitido. Mf quedó pendiente cuando la clave anterior correspondía a otro sexo normativo. |
| Dos familias críticas activas | Apartado único con 57 ítems distintos en el caso sintético. V/F y paráfrasis visibles. La casilla de literal controla únicamente la salida local. |

### Orden de las secciones

| N.º | Completo | Mínimo |
| --- | --- | --- |
| 1 | Encabezado institucional | Encabezado institucional |
| 2 | Ficha de identificación | Ficha de identificación |
| 3 | Motivo y objetivo de la evaluación | Técnica, fuentes y control de calidad |
| 4 | Antecedentes e historia del caso | Validez y estilo de respuesta |
| 5 | Contexto de la solicitud | Escalas clínicas básicas |
| 6 | Técnica, fuentes y control de calidad | Escalas de contenido |
| 7 | Examen mental y observación conductual | Escalas suplementarias |
| 8 | Validez y estilo de respuesta | Integración clínica |
| 9 | Escalas clínicas básicas | Conclusiones |
| 10 | Escalas de contenido | |
| 11 | Escalas suplementarias y PSY-5 | |
| 12 | Subescalas Harris-Lingoes | |
| 13 | Ítems críticos | |
| 14 | Integración clínica | |
| 15 | Recursos y fortalezas | |
| 16 | Contraste longitudinal | |
| 17 | Impresión diagnóstica (tentativa) | |
| 18 | Pronóstico | |
| 19 | Limitaciones de la evaluación | |
| 20 | Conclusiones | |
| 21 | Recomendaciones | |
| 22 | Nota de alcance | |

### Activación

| Plan | Cupo por clave | Claves verificadas |
| --- | ---: | ---: |
| A1 | 5 | 10 |
| A2 | 10 | 10 |
| A3 | 15 | 10 |
| A4 | 20 | 10 |
| A5 | 25 | 10 |
| A6 | 30 | 10 |
| A7 | 40 | 10 |
| A8 | 50 | 10 |
| M0 | Ilimitado | 1 |

CSV y JSON coincidieron en sus 81 códigos únicos, planes y cupos. Cada clave aprobó el verificador de V16 y la activación en la 17.4. Se rechazó una clave alterada. Se comprobó la preservación de saldo al actualizar y al reactivar, el último cupo, la reversión ante un error de guardado y dos finalizaciones concurrentes del mismo caso. La app contiene el catálogo de huellas. Los archivos con códigos legibles se entregan como documentos de administración separados.

### Informes y puntuaciones

- Se probaron la importación de JSON variable, la reconstrucción de la ficha con documento y nacimiento, y las exportaciones Word, PDF, Excel, HTML y TXT. La ficha generada por IA cedió a la ficha local.
- Se comprobó Es con PD 22 y T ≤30, rango Bajo y punto rotulado ≤30 en la referencia estadounidense; la mexicana conserva T 30. Se verificó la reparación de Es pendiente en casos guardados, sin consumir licencia, y la dirección de TRIN. Los ocho índices de validez tienen lecturas descriptivas completas sin órdenes al evaluador.
- El prompt conservó sus marcadores de datos. Cuando se desactivó el contexto de la solicitud, se excluyeron los términos solicitados. Con baremo estadounidense se excluyó TEAcorrige.
- Los 25 archivos de datos y biblioteca interpretativa protegidos coinciden byte a byte con V16. El motor añade únicamente el tratamiento del límite inferior de reporte US de Es y su metadato. Las celdas de conversión Es originales se verificaron una por una. El catálogo y el verificador de licencias son idénticos a la edición 17.3.
- Las pruebas de flujos usan un adaptador de navegador. El arranque de Chromium no estuvo disponible en el entorno de pruebas.

## Recuperación de interpretaciones 17.4

- Se ejecutaron 16 pruebas automatizadas de integración y regresión: 16 aprobadas y ninguna omitida. Incluyen las 15 autopruebas del motor, todas aprobadas.
- Se cotejaron las lecturas de todas las escalas sustantivas con la regla V16 en nueve puntuaciones T y ambos sexos normativos, con las excepciones documentadas de Es y de lectura suspendida. Más de 1000 combinaciones verificadas.
- Los párrafos de grupo coinciden con la biblioteca original; se recuperaron la distribución, la configuración del perfil, la síntesis y las recomendaciones específicas.
- Se generaron informes sintéticos base e IA en Word, PDF, HTML, TXT y Excel. Se renderizó Word para inspección visual; Es y sus signos se comprobaron también en el PDF nativo. El PDF representa ≤ como <= para conservar su lectura con las fuentes estándar. El Excel técnico y la hoja de perfil imprimible conservan también el límite de Es y su rango.
- La representación de Es se verificó con Chart.js real y un adaptador de lienzo: punto en 30 con etiqueta ≤30. La interacción completa en un navegador real no fue verificada en esta revisión.
- Las fuentes, la distinción entre conversión tabulada y límite de reporte, y los ejemplos revisados figuran en `RESTAURACION_17_4.md`. Las huellas de los 25 archivos idénticos a V16 están en `restauracion-v16.json`.

## Propuestas editoriales para la biblioteca de textos

Los extractos corresponden a `data/criterios.json`. Las propuestas quedan para revisión del evaluador. La biblioteca V16 se recuperó en el informe; las propuestas siguientes permanecen pendientes de aprobación.

| Escala y rango | Fragmento actual | Propuesta descriptiva |
| --- | --- | --- |
| Mf · Muy alto | «Pasivo y afeminado. Inseguro en asertividad. Tendencias homoeróticas.» | La puntuación refleja intereses y preferencias evaluados por el instrumento frente a un grupo normativo histórico. Interprete su significado junto con la entrevista y el contexto sociocultural. |
| Hs · Muy alto | «Esquizoide; comportamiento bizarro o alucinaciones somáticas.» | Se informan preocupaciones o molestias físicas de intensidad elevada. Explore su curso, impacto cotidiano y antecedentes médicos y psicológicos. |
| Sc6 · Muy alto | «Posible trastorno psicótico.» | Se reconocen experiencias perceptivas o de pensamiento inusuales. Explore sus características, frecuencia, contexto y repercusión clínica en entrevista. |
| Pd · Muy alto | «Juicio pobre. Inestable. Irresponsable. […] Agresivo o atacante.» | El resultado orienta a explorar conflictos con normas, dificultades de regulación y sus efectos en las relaciones. Contraste frecuencia, contexto y consecuencias con información clínica. |

## Repetir la verificación

Desde `app/`, con Node.js 20 o posterior, ejecute `node --test tests/verificacion.cjs`. Para verificar también la activación, defina `MMPI2_LICENCIAS` con la ruta del JSON de administración entregado aparte.
