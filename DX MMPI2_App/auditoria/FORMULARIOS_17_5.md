# Formularios PDF diligenciados en la edición 17.5

Revisión del 11 de noviembre de 2026. Base funcional: Suite clínica licenciada 17.4.

## Resultado

Se añadieron tres descargas directas con vista previa: hoja de respuestas de dos páginas, perfil estadounidense básico y perfil mexicano de contenido. Los PDF originales permanecen como archivos de plantilla; las marcas se añaden en una copia nueva al generar cada documento. La X negra conserva su centro en la coordenada calibrada y utiliza dos trazos finos con extremos redondeados. La alternativa de círculo relleno queda disponible.

La hoja usa las respuestas del registro local. La procedencia Excel o Test interactivo queda documentada en los metadatos del PDF. La hoja no afirma que las marcas fueran manuscritas. Los datos complementarios se guardan con el caso y se conservan en las copias de seguridad existentes.

## Plantillas y alcance

| Plantilla | Referencia y contenido | Páginas de salida |
| --- | --- | --- |
| Hoja de respuestas aportada | Identificación y 567 posiciones V/F. Orden físico irregular de bloques, calibrado por número de ítem. | Dos páginas Carta. |
| Perfil estadounidense adaptado aportado | Referencia US. L, F, K y Hs, D, Hy, Pd, Mf, Pa, Pt, Sc, Ma, Si. | Una página horizontal. |
| Perfil mexicano aportado | Referencia MX. ANX/ANS, FRS/MIE, OBS, DEP, HEA/SAU, BIZ/DEL, ANG/ENJ, CYN/CIN, ASP/PAS, TPA/PTA, LSE/BAE, SOD/ISO, FAM, WRK/DTR, TRT/RTR. | Una página Carta horizontal, elegida por sexo normativo. |

El perfil estadounidense es una adaptación documental suministrada por el evaluador. Se sustituyó la leyenda de cabecera que mezclaba MMPI-2 y MMPI-2-RF por la identificación de la referencia aplicada. Se repararon los rótulos inferiores del eje T: 35, 30 y 25. El trazado sigue los puntos de anclaje de la escala T del escaneo; los valores fuera del intervalo se señalan como tales. Las omisiones se informan como recuento y carecen de punto T. La distinción entre las líneas de validez y de escalas clínicas conserva el separador de la lámina.

En el perfil mexicano, las graduaciones de control y las correspondencias de abreviaturas se cotejaron con los archivos de normas mexicanos de la app. Los valores T se leen de los resultados ya calculados. Una T pendiente deja un espacio e interrumpe la unión de puntos; los valores marcados para verificación conservan el asterisco. Un protocolo no interpretable incorpora la indicación de revisión técnica.

Las figuras y el perfil general anteriores siguen disponibles para otros grupos y referencias. Es y los demás resultados fuera de estas dos láminas conservan su lugar en el informe y en sus figuras.

## Comprobaciones

- Nueve pruebas específicas de formularios: todas aprobadas. Incluyen archivos de plantilla, 1134 posiciones V/F, PDF con todas V y todas F, respuestas parciales y corregidas, círculo alternativo, páginas masculina/femenina, compatibilidad de baremo, datos opcionales, conservación de caso y licencia, y creación y cierre de la vista previa con los métodos reales de la aplicación.
- Dieciséis pruebas anteriores de integración y regresión: todas aprobadas. Incluyen las quince autopruebas internas y la activación de las 81 claves del lote existente.
- Se reabrieron los PDF generados y se verificaron sus trazos vectoriales. Se comprobaron los centros de las 567 X de un documento con todas V y otro con todas F. Las diagonales fueron negras, con grosor de 0,72 puntos, y desviación inferior a 0,1 puntos respecto de los centros calibrados.
- Se verificaron las uniones del perfil contra las coordenadas calculadas. La prueba con una T pendiente confirmó la interrupción de la línea. Las imágenes originales incrustadas en la hoja de respuestas resultaron idénticas a las del archivo de origen.
- Se renderizaron e inspeccionaron las dos páginas de respuestas y los perfiles H/M de ambas referencias. Los ejemplos son ficticios y sus puntuaciones proceden del motor de la app.
- La ejecución de Chromium no estuvo disponible en este entorno. La comprobación automatizada se realizó con los módulos reales de PDF, el adaptador de interfaz y la inspección de los archivos generados; la interacción completa del visor PDF en un navegador real queda fuera de esta verificación.

## Archivos de comprobación

`PRUEBAS_FORMULARIOS.txt` y `PRUEBAS_REGRESION_17_5.txt` contienen las salidas de pruebas. `integridad-17-5.json` documenta los recursos protegidos idénticos a 17.4, incluidas puntuaciones, baremos, biblioteca interpretativa, almacenamiento y licencias. En `ejemplos/` se incluyen una hoja de respuestas y cuatro perfiles de demostración.
