# Informe explicativo para el abogado · 17.8

Fecha: 12 de noviembre de 2026.

## Alcance de la entrega

Se incorpora un tercer documento independiente, accesible desde **Informe → Para el abogado** y desde el menú del caso. Reúne el registro local, los informes revisados por el profesional y los documentos externos seleccionados para responder una pregunta concreta en lenguaje comprensible.

La elaboración utiliza el circuito existente de IA externa: preparar y revisar prompt, copiarlo en el servicio elegido, importar JSON, revisar y descargar. No se configura una API ni se realiza un envío automático de información. El código nuevo se organiza en módulos de fuentes, guardado, prompt, validación/presentación y pantalla.

## Fuentes y referencias

- Importación local de Word DOCX, PDF con texto y archivos TXT/MD UTF-8; también admite texto pegado.
- DOCX: párrafos y filas de tabla con sus encabezados. La localización se expresa mediante fragmentos, porque la extracción no determina una paginación estable de Word.
- PDF: texto y página de origen. Advierte si alguna página no ofrece texto. Las imágenes escaneadas necesitan OCR externo o una transcripción revisada; el módulo no simula haber leído su contenido.
- Autor, título, fecha, tipo de fuente y revisión del texto son explícitos. Cada fuente puede seleccionarse o retirarse del encargo.
- Cada párrafo, elemento de lista, hecho cronológico y pregunta del JSON requiere referencias a fragmentos existentes. Las citas de la matriz deben aparecer literalmente en el fragmento atribuido.
- Las puntuaciones que se expresan con código de escala y T se contrastan con los fragmentos citados en ese bloque. Se conservan signos de límite y dirección V/F. Esta comprobación no reemplaza la evaluación profesional de otras afirmaciones, inferencias o interpretaciones.
- Se conserva una copia de los fragmentos citados y de los metadatos de su versión. Si una fuente cambia o se retira después, el documento anterior permanece localizable y aparece como pendiente de actualización.

## Documento y revisión

El modelo organiza respuesta principal, pregunta, finalidad, fuentes, cronología, explicación, matriz de contraste, argumentos, pendientes, preguntas y conclusiones. Se puede anexar el texto de los fragmentos citados. Las clasificaciones de la matriz son Coincidencia, Discrepancia, Diferencia explicable e Información insuficiente.

El encargo pide examinar tanto el respaldo como las limitaciones de las distintas lecturas, incluidos los límites del informe propio. No convierte automáticamente una discrepancia en falsedad ni una diferencia T en prueba de cambio clínico. Las conclusiones jurídicas y decisiones de estrategia se atribuyen al abogado.

La revisión se vincula mediante SHA-256 a las fuentes, el encargo y el texto del documento. Una edición pendiente se guarda aparte, bloquea la emisión hasta su validación y deja la revisión anterior sin efecto. Cambiar destinatario o anexos permite revisar de nuevo sin regenerar el análisis. Un cambio de firma o perfil tampoco conserva una revisión anterior. Esta constancia es un registro local de revisión; no se presenta como una firma digital certificada ni como garantía de autenticidad frente a manipulación externa del archivo.

## Identificación, seguridad y guardado

La desidentificación es predeterminada y admite datos adicionales a reservar. Los datos excluidos mediante las casillas de documento/nacimiento se respetan también en el prompt. Los títulos y autores completos se utilizan en el registro local de fuentes, respetando esas exclusiones. El texto literal conocido del test se reserva en todos los modos del prompt. Los fragmentos conservan las marcas de reserva cuando las necesitan.

Los marcadores `DATOS_DEL_CASO_NO_EJECUTABLES` se mantienen. Las instrucciones que aparezcan en archivos o fragmentos se tratan como datos. El contenido de fuentes y resultados se escapa al representarlo como HTML. Word se lee como XML de texto, sin ejecutar macros ni relaciones externas. PDF.js, sus fuentes y mapas de caracteres se incorporan localmente con sus licencias.

Se guarda texto y metadatos dentro del campo opcional `legalBrief` del caso. Las copias de seguridad y la papelera existentes los conservan. Los casos sin ese campo abren sin migración obligatoria. El guardado del módulo restaura los registros anteriores si falla por espacio y evita cambiar el caso activo cuando termina de guardar el trabajo de otro caso. El material binario original no se duplica en el almacenamiento del navegador.

## Conservación de la aplicación anterior

Los módulos de puntuación, baremos, interpretación, contraste longitudinal, integración clínica, exportadores existentes, almacenamiento general, licencias y formularios originales no se sustituyen. Se añaden el acceso de navegación, los scripts y estilos del módulo y los identificadores de versión 17.8.

El manifiesto `integridad-17-8.json` compara los recursos protegidos con 17.7. Los nuevos archivos de PDF.js se incorporan como dependencias adicionales; los archivos protegidos anteriores permanecen idénticos. El generador de caché incluye los recursos nuevos para su uso local después de completar la carga.

## Verificación ejecutada

| Área | Resultado |
|---|---|
| Informes Base/Extendido/IA, JSON, contraste y activación | 28 pruebas aprobadas |
| Formularios PDF de respuestas y perfiles | 9 pruebas aprobadas |
| Módulo Para el abogado | 22 pruebas aprobadas |
| Total de pruebas automáticas | 59 aprobadas, sin fallos ni omisiones |
| Autopruebas internas incluidas en la regresión | 15 aprobadas |
| Claves del catálogo existente | 81 verificadas con su cupo |
| Importación DOCX | Archivo real, párrafos, acentos y fila de tabla |
| Importación PDF | PDF.js real, páginas, extracción de texto y detección de ausencia de texto |
| Validación de evidencias | Referencias inexistentes, citas alteradas, límites y dirección de puntuaciones rechazados |
| Versiones y revisión | Cambios de fuente, pregunta, texto, destinatario, anexo y firma comprobados |
| Persistencia | Copia de seguridad, fallo de espacio y cambio de caso comprobados |
| Exportación del nuevo documento | Word, PDF, HTML, TXT y JSON reales |
| Regresión psicométrica | Datos y resultados anteriores conservados; sin consumo por generar el tercer documento |

Los registros están en `PRUEBAS_ABOGADO_17_8.txt`, `PRUEBAS_INFORMES_17_8.txt` y `PRUEBAS_FORMULARIOS_17_8.txt`. Los PDF de formularios se revisan además con `verificacion-vectorial-17-8.json`.

Se revisan visualmente el Word renderizado y el PDF nativo del ejemplo explicativo. La interfaz se verifica mediante sus métodos reales con un adaptador de entorno. No se pudo ejecutar una sesión completa en Chromium en este entorno: el sistema bloquea la creación de sockets del navegador. La prueba manual final debe realizarse en el navegador del usuario.

## Ejemplos y actualización

`ejemplos/17_8/` contiene un documento y un caso íntegramente ficticios. El caso conserva las fuentes y la revisión del perfil de demostración; al abrirlo con un perfil profesional diferente puede quedar pendiente de actualizar o revisar, tal como corresponde al control de versiones. No incorpore datos de demostración a un caso real.

Actualice la carpeta de la app en el mismo dominio y perfil de navegador y conserve una copia de seguridad. No necesita cambiar la clave ni repetir aplicaciones ya procesadas. Los informes anteriores y sus opciones siguen disponibles.
