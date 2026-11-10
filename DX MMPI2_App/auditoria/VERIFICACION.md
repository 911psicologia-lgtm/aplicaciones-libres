# Verificación de MMPI-2 Suite clínica 17.2

Base de actualización: paquete completo 17.1 suministrado. Los protocolos de prueba, identificadores y narrativas usados para la verificación son sintéticos.

## Pruebas de aceptación

| Prueba | Resultado observado |
| --- | --- |
| Caso nuevo | 25 casillas con los estados previstos. PSY-5 habilita clústeres. Contexto de la solicitud activa Nota de alcance. El pronóstico requiere registrar entrevista suficiente. |
| Caso guardado en 17.1 | Carga y migración del almacenamiento local con respaldo previo. Se conservaron las 567 respuestas, las puntuaciones, las opciones anteriores, el contexto del caso y de versiones previas, y la integración de IA con huella verificable. |
| Prompt completo y mínimo | 22 y 9 secciones consecutivas, respectivamente. El esquema del prompt y el informe usan los mismos identificadores y el mismo orden. |
| Sin MMPI-2 anterior | Casilla deshabilitada con «Sin datos previos». El prompt, el informe y Excel omiten el contraste. Se verificó que Mf con diferente sexo normativo queda sin diferencia T. |
| Ambas familias de ítems críticos | Un apartado agrupado por tema con números únicos. En el protocolo sintético de exportación se obtuvieron 57 números únicos. Se verificaron la respuesta V/F, la paráfrasis, el control de texto literal en el informe y la exclusión del literal en el prompt. |

## Secciones resultantes

El caso completo tenía historia, puntuaciones previas y registro de entrevista suficiente. El mínimo tenía todas las casillas opcionales desactivadas.

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

## Exportaciones, importación y puntuaciones

- Informe base e informe con IA generados como Word, Excel, HTML y TXT. En el Word con IA, la ficha recuperó documento y nacimiento del registro local aunque el JSON devolviera una ficha distinta. Ambos Word se abrieron y renderizaron con LibreOffice.
- La columna opcional Lectura breve quedó completa en las ocho escalas de validez y en el recuento de omisiones. Con la columna desactivada, la lectura narrativa permanece.
- Los Excel de prueba conservaron los 112 registros de puntuaciones y siete gráficas nativas en la selección habitual de escalas. El Excel mínimo omitió las hojas opcionales correspondientes a su selección. Se conservó la hoja técnica de respuestas.
- El JSON anterior de 15 secciones fue reconocido por el importador. El JSON estructurado con secciones fuera de secuencia o sin interpretación se rechaza con un aviso.
- Es con PD 22 y norma femenina se comprobó en tres fuentes. El manual estadounidense deja la T pendiente y el gráfico omite el punto. La fuente estadounidense anterior conserva «≤30» en tabla y gráfica. El manual mexicano conserva «30» en tabla y gráfica.
- Se comprobaron las reglas de copia del prompt y de exclusión de TEAcorrige en el baremo estadounidense. El prompt omite los términos pericial, perito y dictamen con Contexto de la solicitud desmarcado.
- Las huellas de motor, datos, bancos de preguntas, baremos y documento técnico coinciden con las del ZIP 17.1. Las propuestas editoriales para el banco de descriptores quedan separadas de las lecturas breves de presentación.

Las pruebas incluyen el adaptador DOM de la app, verificación del paquete y caché PWA, comprobaciones directas de los modelos y apertura de archivos OOXML. La prueba con Chromium se intentó y el entorno impidió que el navegador iniciara.

```bash
node --test tests/*.test.mjs
```
