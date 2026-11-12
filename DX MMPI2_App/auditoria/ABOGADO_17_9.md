# Informe técnico complementario para el abogado · 17.9

Fecha de la revisión: 12 de noviembre de 2026.

## Corrección solicitada

El acceso Para el abogado se mantiene y abre un cajón dentro del informe clínico. El nuevo flujo utiliza de oficio el material ya registrado, con pregunta e información adicional opcionales. Los documentos externos o las correcciones fuera de la aplicación se cargan únicamente cuando aportan algo nuevo.

Se toma como referencia la estructura analítica del informe aportado por el evaluador. No se incorpora a la aplicación su contenido personal ni se utiliza como plantilla de conclusiones para otros casos. La finalidad es una explicación contextualizada, con argumentos de controversia fundados y una formulación utilizable por el equipo jurídico.

## Información que se incorpora automáticamente

- Datos psicométricos de todos los grupos disponibles, signos de límite y dirección V/F, estado de validez y referencia normativa.
- Motivo, antecedentes, historia y cronología, fuentes clínicas, examen mental, recursos, integración, impresión diagnóstica documentada, recomendaciones y límites presentes en el caso.
- MMPI-2 anterior y diferencias aritméticas ya calculadas, con sus límites de comparabilidad.
- Informe sin IA e integración IA guardada. Se conserva el texto de la integración aunque la sección correspondiente esté oculta en el formato Base.
- Información adicional que el evaluador decida aportar. Se convierte también en una fuente que puede citarse.

No se requiere pregunta escrita ni carga de un informe propio para preparar el encargo. La selección de contenido del informe clínico controla ese informe, sin recortar los antecedentes necesarios para este análisis complementario. Las preferencias de identificación, reserva del test y referencia normativa se respetan.

## Estructura y criterio de redacción

El JSON nuevo utiliza versión 2 y mantiene compatibilidad de lectura con la versión 1. Incluye secciones adaptables, matriz de hallazgos y formulación para el equipo jurídico obligatoria. La cronología tabulada, las preguntas como apartado y los fragmentos anexos se desmarcan por defecto; las fechas se emplean en el razonamiento temporal.

El contraste identifica afirmación, evidencia, objeción defendible y alcance. Puede usar una afirmación ya transcrita en la historia, distinguiéndola del documento completo. Evita atribuir resultados a un informe no disponible o a una evaluación futura. No predetermina una conclusión favorable, no inventa pruebas y no convierte por sí sola una escala en diagnóstico, simulación o causalidad.

Las citas impresas se reducen a números de fuente. Los identificadores de fragmento permanecen en el estado interno para validar atribución y conservar las versiones. La bibliografía debe aparecer en una fuente citada. Los apartados se numeran según los que efectivamente tengan contenido.

## Guardado, versiones y conservación

El trabajo permanece dentro de legalBrief del caso. Las fuentes automáticas se reconstruyen desde el registro; el documento conserva los fragmentos citados de su versión. Se retiraron las fechas generadas al vuelo de las fuentes automáticas para evitar que el simple cambio de día las vuelva obsoletas. La fecha de emisión del documento revisado se conserva.

Los documentos de la edición 17.8 permanecen legibles y no se borran al abrir el cajón. Preparar una nueva versión y registrar la revisión conserva el documento anterior hasta importar el nuevo JSON. El editor guarda los cambios pendientes y permite editar también las filas de hallazgos.

Los módulos de cálculo, baremos, interpretaciones, licencias, almacenamiento general y formularios originales permanecen idénticos. En el exportador se añade una opción de firma compacta usada solo por el documento complementario. Se compararon contra 17.8 el HTML, el XML del cuerpo Word y los flujos de dibujo del PDF de un informe clínico sin esa opción: se conservan exactamente.

El aviso de actualización recupera también un service worker que ya esté esperando; permanece visible hasta activar la actualización. No borra cookies, casos ni licencia. La versión 17.9 queda visible en el panel y en la barra del informe.

## Pruebas

| Área | Resultado |
|---|---|
| Módulo del abogado, compatibilidad anterior y flujo automático | 40 aprobadas |
| Informes Base, Extendido e IA, contraste y activación | 28 aprobadas |
| Formularios de respuestas y perfiles PDF | 9 aprobadas |
| Total | 77 aprobadas, sin fallos ni omisiones |
| Claves existentes | 81 verificadas con su cupo |
| Autopruebas del motor | 15 incluidas en la regresión |
| Exportaciones anteriores | HTML, XML Word y flujos PDF idénticos al desactivar firma compacta |
| Documento complementario | Exportaciones Word, PDF, HTML, TXT y JSON reales |

Los registros son PRUEBAS_ABOGADO_17_9.txt, PRUEBAS_INFORMES_17_9.txt y PRUEBAS_FORMULARIOS_17_9.txt. El ejemplo usa un protocolo sintético y textos claramente ficticios; sirve para comprobar estructura y funcionamiento, no como evidencia psicométrica clínica.

Se revisaron las páginas del Word renderizado y del PDF nativo. Los métodos de interfaz y el cajón se verifican mediante un adaptador; este entorno no permitió una sesión completa de Chromium, por lo que no se afirma haber validado visualmente la interacción en un navegador real. La respuesta y la calidad del análisis de una IA externa siguen dependiendo del material del caso, del servicio elegido y de la revisión del profesional.
