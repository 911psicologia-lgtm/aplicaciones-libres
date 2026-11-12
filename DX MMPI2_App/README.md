# MMPI-2 · Suite clínica licenciada 17.9

La edición 17.9 simplifica **Para el abogado** y reutiliza automáticamente la información del caso. Conserva los informes Base, Extendido e IA, las interpretaciones clínicas, los cálculos y baremos, el contraste longitudinal, los formularios originales PDF y el sistema de licencias.

## Para el abogado

En un caso con resultados, pulse **Informe → Para el abogado**. El botón abre un cajón dentro de la misma pantalla. También puede acceder desde el menú del caso.

1. Puede dejar **Pregunta específica** e **Información adicional o precisión** vacías. Si escribe algo, agregue únicamente la pregunta o información nueva que quiera destacar.
2. Pulse **Preparar informe con IA**. La app incorpora automáticamente los datos, antecedentes y cronología guardados, las puntuaciones actuales y anteriores disponibles, el informe sin IA y el texto de la integración IA guardada. La cronología y el antecedente MMPI-2 se incluyen en el análisis aunque estén ocultos en el formato Base. No es necesario volver a cargarlos.
3. En **Continuar con la IA y cargar el informe**, copie el encargo en su IA, pegue el JSON que devuelva y pulse **Cargar y ver el informe**. Se utiliza el circuito de IA externa existente; no se configura ni se llama a una API automáticamente.
4. Revise el informe, edítelo si hace falta y pulse **Registrar revisión profesional**. Puede descargar Word, PDF, HTML, TXT y JSON.

El encargo sigue la arquitectura de un **informe técnico complementario**: pregunta técnica, respuesta ejecutiva, matriz de hallazgos, explicación comprensible del MMPI-2, análisis de temporalidad y evolución, contraste de afirmaciones, elementos que pueden invocarse en contrario, conclusiones por párrafos, **formulación para el equipo jurídico**, recomendaciones y límites. Las secciones se adaptan al material disponible. Las referencias impresas son breves; las evidencias precisas se conservan internamente.

Si ya hay afirmaciones de Mutalis u otra entidad transcritas en la historia o en los informes guardados, se analizan desde esas fuentes. Se distingue una transcripción de un informe completo y una evaluación anunciada de una evaluación efectivamente aportada. La finalidad es construir una controversia técnicamente fundada: qué se sostiene, qué dato la apoya o contradice, qué inferencia excede la evidencia y qué objeción puede formularse. Se mantienen los límites y los datos que puedan cuestionar la interpretación propia.

**Agregar o actualizar documentos** es opcional. Úselo para una versión final corregida fuera de la app o para un documento nuevo. Un informe adicional de tipo Base o IA sustituye la incorporación automática de ese mismo tipo mientras esté seleccionado. Admite Word DOCX, PDF con texto, TXT/MD UTF-8 y texto pegado. Revise la extracción antes de incorporarlo. Los PDF escaneados requieren OCR externo. Los archivos originales no se duplican: se guarda texto y metadatos.

En **Destinatario, presentación y privacidad** puede indicar el abogado, reservar identificadores adicionales o añadir una tabla cronológica, preguntas y anexo de fragmentos. La tabla cronológica, las preguntas separadas y los anexos están desmarcados por defecto. La ficha y la firma se completan localmente. Los identificadores conocidos se reservan por defecto en el encargo externo y los enunciados literales del test permanecen protegidos.

El documento se guarda dentro del caso y viaja en las copias de seguridad habituales. Cambiar la historia, los resultados, la integración IA, los documentos seleccionados o la pregunta exige actualizar el análisis. El paso del tiempo, sin cambios del caso, no invalida por sí solo sus fuentes. Cambiar solo destinatario, anexos o firma requiere una nueva revisión. Una edición pendiente se conserva y bloquea la descarga hasta guardarla y validarla. Los documentos anteriores de la 17.8 siguen siendo legibles; no se borran al abrir el cajón.

Los controles validan referencias existentes, citas de contraste y puntuaciones explícitas frente a las fuentes citadas. No sustituyen la revisión del razonamiento. Las referencias bibliográficas nuevas deben estar documentadas en las fuentes; no se inventan bibliografía ni pruebas ausentes del caso.

El detalle y las **77 pruebas aprobadas** están en `auditoria/ABOGADO_17_9.md`. `auditoria/ejemplos/17_9/` contiene un caso y un informe íntegramente ficticios, con el flujo automático y sin documentos adicionales cargados. Los ejemplos y auditorías de ediciones anteriores son históricos.

## Formularios PDF

En la pantalla **Informe**, debajo de las herramientas de exportación, aparece **Formularios originales PDF**. Cada documento tiene **Descargar PDF** y **Vista previa**. La marca predeterminada es **X negra de trazo tipo lapicero**; también puede elegirse un círculo relleno. La preferencia queda guardada con el caso.

- **Hoja de respuestas diligenciada**: las dos páginas del original, con los datos disponibles del cliente y las respuestas V/F registradas. Acepta respuestas procedentes de Excel y de la aplicación interactiva. Las omisiones permanecen vacías y cada nueva descarga refleja el registro actual. Durante la captura, **Ver hoja de respuestas PDF** permite revisar y descargar un avance parcial.
- **Perfil estadounidense**: la lámina adaptada aportada, con L, F, K y las diez escalas clínicas básicas. Se habilita con baremo estadounidense y resultados calculados. Incluye PD, PD+K cuando corresponde, T y trazado. El eje inferior se corrigió para recuperar la etiqueta 30 y el encabezado identifica la referencia estadounidense y el carácter adaptado de la lámina.
- **Perfil mexicano de contenido**: las quince escalas de contenido sobre la lámina aportada. Se habilita con baremo mexicano y selecciona la página masculina o femenina correspondiente al sexo normativo del caso. Incluye las puntuaciones directas y el trazado de las T.
- Con referencia española, las dos plantillas nuevas de perfil permanecen deshabilitadas. **Más → Perfil general (actual)** y las figuras del informe conservan su funcionamiento.

Los datos complementarios están en **Datos del paciente → Datos para formularios PDF (opcionales)**: escolaridad, años de educación, ocupación, estado civil, dirección, referido por, clave de perfil, iniciales del calificador e identificador documental. Si el identificador es numérico y cabe en las nueve casillas se completan números y círculos; un identificador más largo o alfanumérico se imprime completo en la franja de identificación, sin marcar círculos incompatibles. Los datos faltantes permanecen en blanco. Las casillas de documento y nacimiento del informe se respetan también en la hoja.

Los PDF se diligencian en el navegador y los archivos necesarios están incorporados al paquete. Las plantillas se incluyen en la caché de la aplicación para su uso sin conexión después de una carga completa. Descargar o revisar estos documentos conserva el consumo existente de la licencia. La X es una marca visual; el propio formulario indica círculo relleno con lápiz para el soporte original. La compatibilidad con lectura óptica requiere una verificación específica.

Los ejemplos ficticios de descarga y el detalle de comprobaciones están en `auditoria/FORMULARIOS_17_5.md` y `auditoria/ejemplos/`.

## Abrir o actualizar

1. Extraiga el ZIP. La carpeta `app/` contiene `index.html`, los recursos del sitio y el código.
2. Para actualizar un sitio existente, use esa carpeta como raíz y conserve su dominio y perfil de navegador. La versión visible debe ser **17.9**. Si hay una actualización instalada, aparece un aviso persistente: guarde el trabajo y pulse **Actualizar**. Si aún ve la anterior, cierre todas las pestañas y ventanas de esta app y vuelva a abrir la misma dirección. Conserve cookies y datos del sitio, donde residen casos y licencia.
3. Para una prueba local, desde la carpeta extraída puede ejecutar `python -m http.server 8000 --directory app` y abrir `http://localhost:8000`. Use HTTPS en un sitio publicado. El servidor sirve archivos estáticos y la app valida la activación en el navegador.
4. Para trasladar casos a otro equipo u origen, use la copia de seguridad JSON de los casos. El registro de saldo corresponde al navegador y al origen donde se activó la clave.

## Activación

- El catálogo incorporado contiene las huellas de las **81 claves suministradas**, 80 en los ocho planes de 5 a 50 aplicaciones y una maestra ilimitada. Los archivos con las claves se entregan por separado para administración.
- Una clave del lote previamente activa en V16 conserva su saldo al actualizar en el mismo navegador y dominio. Cambiar de clave o volver a activarla conserva el consumo anterior.
- La licencia registra una finalización por caso. Volver a exportar o revisar un caso finalizado conserva el saldo. Se abre el informe del último cupo y los informes guardados quedan disponibles con la licencia agotada.
- El validador usa SHA-256 mediante Web Crypto. El control de saldo es local. En navegadores con Web Locks, la finalización y la activación se coordinan entre pestañas del mismo origen. [Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) · [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## Informes

- En **Contenido del informe → Formato del informe sin IA**, **Base** conserva los apartados habituales, las gráficas y PSY-5; resume por tema los ítems críticos de Koss-Butcher. **Extendido** añade historia completa, subescalas Harris-Lingoes, correspondencia con clústeres, Lachar-Wrobel, descriptores y detalle de los ítems. El texto literal sigue requiriendo su casilla explícita. El pronóstico requiere entrevista suficiente y el contraste requiere puntuaciones anteriores.
- Elegir Base o Extendido actualiza inmediatamente las casillas y el informe sin IA. **Personalizado** conserva la selección actual de los casos guardados o la que se ajuste manualmente. La identificación, el contexto, la firma y la autorización de literales conservan sus preferencias.
- El formato sin IA se guarda por separado de las secciones para IA. Elegir Base no recorta el informe con IA. **Usar estas secciones también en IA** aplica expresamente la selección actual a ese informe y al siguiente prompt; los datos de identificación y privacidad se comparten entre ambos.
- El título general y la institución, si se informa, se presentan sin crear un apartado numerado «Encabezado institucional». La numeración comienza en la ficha de identificación y sigue las secciones activas, sin saltos. Un JSON anterior que contenga ese encabezado sigue siendo aceptado.
- La interpretación contextual de IA sustituye al párrafo automático de su sección y conserva las tablas y figuras locales. Las conclusiones se distribuyen en párrafos; se conservan los cuadros cualitativos aportados por la IA, como la cronología y su estado de verificación.
- El contraste muestra **Diferencia T = T actual − T anterior**, con signo positivo o negativo, para las parejas de T exactas disponibles. La resta ya no se bloquea por falta de sexo normativo, clave o fuente anteriores. La equivalencia normativa se verifica por separado y sus limitaciones aparecen una sola vez, fuera de las filas. La diferencia aritmética no demuestra por sí sola mejoría, deterioro ni cambio fiable.
- La gráfica conserva las T publicadas y sus marcas. En TRIN se restan las magnitudes T y se mantienen las letras V/F: un cambio entre Falso y Verdadero puede coexistir con diferencia numérica cero. Los límites, las aproximaciones, las verificaciones pendientes y las T ausentes no se convierten en diferencias exactas.
- Ambos informes sin IA y el informe IA usan la misma tabla de contraste. El prompt distingue `delta` (resta aritmética) de `comparable` (equivalencia normativa confirmada). Las frases mecánicas conocidas del JSON anterior que afirmaban que no se calcularon diferencias se actualizan al presentar el informe, conservando el análisis contextual y el JSON original.
- La tabla y el gráfico usan las puntuaciones del campo estructurado **MMPI-2 anterior**. Las cifras de otros informes citados en la historia no se incorporan automáticamente a esa serie, porque pueden proceder de instrumentos o fechas diferentes.
- En **Contenido del informe** se eligen los datos de identificación, las secciones, las gráficas y las lecturas breves. La ficha se arma con el caso local. Documento, nacimiento y modalidad tienen sus propias casillas.
- **Rango de T** describe la posición normativa. **Habitual** corresponde a T de 40 a 55. Validez incluye lectura narrativa por índice. La columna **Lectura breve** se añade al activarla.
- La historia aparece cuando hay texto, el contraste aparece cuando hay puntuaciones previas y el pronóstico se habilita al documentar entrevista suficiente. La ficha de edición incluye aportes clínicos, procedencia del MMPI-2 anterior y la comprobación de clave y fuente comparables.
- Koss-Butcher y Lachar-Wrobel se pueden combinar en un apartado temático sin duplicados. El informe local puede mostrar enunciados solo con autorización explícita mediante la casilla correspondiente. El prompt usa paráfrasis.
- El prompt solicita un JSON con secciones consecutivas y referencias como clave raíz. Las tablas, figuras, firma e identificación se generan con los datos locales. Word, PDF, HTML, TXT y el Excel del informe comparten ese contenido. **Datos técnicos en Excel** sigue siendo una descarga separada.
- Los archivos de baremos y claves de corrección V16 se conservan íntegros. Es añade el límite inferior de reporte estadounidense: en mujeres con PD 22 se muestra **T ≤30**, **Bajo** y «Recursos de afrontamiento percibidos reducidos y sensación de vulnerabilidad ante el estrés actual». La figura sitúa el resultado en 30 con la etiqueta ≤30. El signo se conserva en el prompt y las exportaciones. Las celdas numéricas originales de los baremos permanecen iguales.
- Los casos guardados con Es pendiente en ese tramo se actualizan al abrirlos. Este ajuste de presentación conserva las respuestas y las demás puntuaciones, y no consume una aplicación de la licencia.

El flujo simplificado se documenta en `auditoria/ABOGADO_17_9.md`. El diseño anterior se conserva como antecedente en `auditoria/ABOGADO_17_8.md`. La corrección longitudinal se conserva en `auditoria/CONTRASTE_17_7.md`; los formatos se describen en `auditoria/INFORMES_17_6.md`. Los demás documentos históricos se mantienen como referencia de sus ediciones.
