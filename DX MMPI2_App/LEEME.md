# MMPI-2 Suite clínica versión 17.2

Paquete completo y estático, preparado para sustituir el ZIP anterior. No requiere compilación, npm, Worker ni base de datos. Abra `index.html` para uso local o publique todo el contenido de esta carpeta en el mismo proyecto de Cloudflare Pages.

## Cómo actualizar

1. En la app anterior, descargue el respaldo general JSON de sus casos.
2. Extraiga este ZIP. Mantenga juntos `index.html`, los archivos JavaScript, `app.css`, `mmpi-questions.js`, `assets`, `data` y `manifest.webmanifest`.
3. Para Cloudflare Pages, cargue el contenido del ZIP con `index.html` en la raíz. Mantenga el dominio y el perfil del navegador que usaba antes.
4. La app abre `mmpi2-app-storage`, conserva un respaldo previo a la actualización y migra las selecciones y el contexto de los casos. También puede importar los respaldos JSON individuales o generales de la versión anterior.
5. Abra un caso guardado y revise la selección en Informe. La app conserva la integración previa cuando su huella de origen es verificable. El respaldo anterior queda disponible en Evaluador y ajustes.

## Informes en 17.2

- Informe → Secciones controla la vista previa, el prompt y las exportaciones. La numeración es consecutiva. Las referencias y la firma se presentan después de las secciones numeradas.
- La ficha se construye con el caso guardado. Las casillas de documento, fecha de nacimiento y modalidad controlan sus filas. Anonimizar el prompt conserva la ficha local del informe. Institución / centro y Lugar de emisión se configuran en Evaluador y ajustes.
- Validez incluye una lectura narrativa por índice. Al marcar Descriptor breve por escala en las tablas aparece también la columna Lectura breve. Habitual significa T de 40 a 55, con 50 como referencia. Cada índice de validez conserva sus criterios propios.
- El prompt solicita JSON con un arreglo `secciones` de longitud variable y una clave raíz `referencias`. También pueden importarse los formatos anteriores. Los apartados automatizados usan el registro local y las secciones interpretativas seleccionadas admiten aportes de IA.
- PSY-5 está activo en casos nuevos y habilita, de forma independiente, la opción de clústeres DSM-5. Koss-Butcher está activo. Al sumar Lachar-Wrobel se agrupan los temas y se lista una sola vez cada ítem. El texto literal es opcional en el informe local. El prompt usa paráfrasis.
- Contexto de la solicitud comienza desmarcado en casos nuevos. Al activarlo se marca la Nota de alcance. La historia requiere un texto registrado y el contraste requiere puntuaciones previas. El pronóstico se habilita cuando el evaluador registra entrevista suficiente. Sin registro de examen mental se muestra «No consta».
- Es usa la puntuación devuelta por la fuente seleccionada. Para PD 22 en mujeres, el manual estadounidense incluido deja la conversión pendiente, la fuente estadounidense anterior devuelve el límite ≤30 y el manual mexicano devuelve T 30. Los límites se conservan en tabla y gráfica. Cuando hay una T baja documentada, el texto orienta a explorar estrategias y apoyos de afrontamiento.
- La biblioteca original de descriptores, el motor, las claves, las conversiones y el cuestionario se conservan. Las lecturas breves del informe usan un conjunto separado de textos descriptivos.

## Funciones del paquete

- Interfaz adaptable a escritorio y móvil con panel de casos, búsqueda, estados y archivo recuperable.
- Edición de identificación, edad en la fecha de aplicación, motivo, antecedentes, historia, contexto de la solicitud, fuentes, condiciones de aplicación y destinatario.
- Cuestionario integrado de 567 preguntas. En la captura por bloques se lee cada enunciado y se responde en el desplegable situado al frente; se conserva el modo secuencial con guardado automático.
- Reaplicación como un caso nuevo vinculado al anterior, con respuestas vacías y comparación longitudinal. No sobrescribe el protocolo original.
- Motor basado en el documento adjunto, con corrección K, pares VRIN/TRIN, niveles y criterios de validez del manual.
- PSY-5, correspondencia dimensional por áreas, códigos de perfil, configuraciones e ítems críticos transcritos del documento.
- Excel para el evaluado con 567 filas de Ítem / Pregunta / Respuesta. Las respuestas se descargan vacías y tienen lista desplegable Verdadero, Falso u Omitir en C2:C568. Incluye identificación e instrucciones separadas; no incluye resultados ni claves de corrección. Importación de XLSX, CSV, TSV, TXT y JSON con revisión previa; admite el formato de preguntas en tres columnas y la plantilla anterior de seis pares.
- Excel con hojas según la selección y gráficas editables. Conserva PD, K añadida, PD+K, T numérica, T publicada, referencia, respuestas e historial. La hoja de contraste requiere datos previos.
- Informe con título e identificación, tabla titulada, interpretación y gráfica titulada por grupo, relaciones entre resultados, conclusiones y las secciones clínicas activas. Word y HTML incluyen la imagen de firma configurada o el espacio para firmar. Descarga permanente en Word .docx, HTML autónomo, TXT e impresión/PDF, con o sin IA.
- Impulso con IA más profundo: historia, antecedentes, fuentes, puntuaciones, convergencias, contradicciones, hipótesis alternativas, recursos, comparación y síntesis del evaluador. Al reaplicar se conserva también el contexto de la aplicación anterior. El análisis importado se coloca en la sección activa correspondiente, junto a las tablas y gráficas cuando proceda. Puede omitir identificadores directos, revisar/copiar el prompt y descargarlo como TXT. No se realizan llamadas automáticas a proveedores de IA.
- Instalación PWA y funcionamiento del registro y cálculo sin conexión después de la primera carga en HTTPS.

## Fuentes y diferencias

El archivo `documentacion/MMPI2_Manual_tecnico_escalas_claves_baremos.docx` es la fuente de esta versión. Se transcribieron sus claves, 67 patrones VRIN, los pares TRIN, las tablas de 84 escalas, los descriptores, las reglas y 17 series de ítems críticos.

Al compararlo con el ZIP anterior se encontraron 17 diferencias de clave por escala/dirección, nueve cambios de patrones VRIN y 958 celdas de conversión distintas. Están documentados en `auditoria/diferencias-fuentes.json`, con la huella del documento utilizado. Aplicar el manual adjunto no equivale a cotejar estas diferencias de manera independiente con los manuales editoriales. La pantalla Fuentes permite revisarlas y cada caso permite seleccionar los datos del ZIP anterior como referencia alternativa.

Los 27 componentes de contenido conservan las claves y tablas del ZIP anterior, porque el documento nuevo no los presenta completos. México utiliza referencias estadounidenses en las subescalas identificadas por fila. No se inventan tablas colombianas.

España mantiene las T suspendidas debido a las inconsistencias descritas en el manual y a la suspensión que ya incorporaba el paquete anterior. Se preservan sus respuestas y PD. En mujeres, la clave Mf española de 55 ítems se aplica para ese recuento; no se habilitan conversiones T españolas inciertas.

La clasificación de validez sigue las reglas del documento, incluyendo ≥30 omisiones y T≥80 en VRIN/TRIN. Una conversión ausente en una escala de validez o clínica codificable suspende la integración; una tabla ausente en una escala complementaria deja pendiente esa escala y exige cautela. Los límites ≥ y el asterisco de tope se conservan. Las correspondencias por áreas de personalidad no son un algoritmo diagnóstico validado y las diferencias longitudinales no demuestran cambio clínico fiable.

## Cuestionario y reaplicaciones

Esta versión incorpora los 567 enunciados de una plantilla de cuestionario previamente aportada por el usuario. Se extrajeron exclusivamente las preguntas: no se incluyen la identificación ni las respuestas de aquel archivo. La cobertura, la procedencia y una limpieza de un dígito suelto antepuesto en el ítem 17 constan en `auditoria/cuestionario.json`. No se generaron preguntas nuevas ni se parafrasearon los reactivos. Esta extracción estructural no constituye un cotejo editorial independiente del cuestionario.

La app y el Excel usan el mismo banco de preguntas. Un banco personal previamente guardado tiene prioridad sobre el incluido. Puede actualizarlo en Evaluador y ajustes mediante JSON (`id` / `text`) o Excel/CSV con columnas Ítem y Pregunta, y restaurar el cuestionario incluido con un botón. Se exigen 567 números únicos y textos no vacíos.

Para enviar el cuestionario al evaluado: abra el caso, entre en Respuestas y pulse Excel para el evaluado. El archivo trae sus datos de identificación y las respuestas vacías. El evaluado lee la pregunta, responde al frente en el desplegable, guarda el .xlsx y devuelve el archivo por el medio acordado. En la app, use Importar respuestas para revisar y aplicar el registro. El archivo no realiza envíos automáticos.

Finalizar una aplicación exige registrar los 567 ítems. Use 3 u O para una omisión deliberada; una celda vacía queda pendiente. Las ediciones de protocolos finalizados conservan la versión previa y retiran la integración de IA hasta revisarla. Cambiar la síntesis o recomendaciones que constituyen contexto del prompt también conserva y retira el texto de IA anterior. El archivo de casos es recuperable.

La comparación conserva baremo, sexo normativo y fuente. Solo calcula diferencias entre T documentadas y comparables. Puede recalcular la referencia previa con los parámetros actuales cuando dispone de las respuestas; los parámetros originales quedan preservados. En Mf, el cambio queda pendiente si difieren las claves o normas.

## Descargas y respaldo

El Excel descargado es un archivo OOXML `.xlsx` real, con números almacenados como números y gráficas nativas. Las respuestas se pueden reimportar. El Word se descarga en `.docx` real, el formato actual de Microsoft Word, con tablas y gráficas. HTML contiene las gráficas; TXT conserva el contenido y las puntuaciones de cada gráfica como texto. La lectura breve por escala puede activarse como opción del informe. La presentación inicial incluye tabla, interpretación narrativa y gráfica. Para PDF, use Imprimir / PDF y seleccione Guardar como PDF.

El respaldo general JSON incluye casos, versiones, evaluador, firma y banco de enunciados cuando exista. Los casos se guardan en el navegador, no en un servidor. Cambiar de equipo, perfil o dominio requiere importar ese respaldo.

Para ejecutar las pruebas, use Node.js 20 o posterior desde la carpeta extraída.

```bash
node --test tests/*.test.mjs
```

El detalle de aceptación, los dos planes de secciones y los resultados de las exportaciones están en `auditoria/VERIFICACION.md`.

## Referencias disponibles

- Documento técnico aportado por el usuario, incluido en el paquete.
- Datos del paquete anterior, conservados en `data/dataset-anterior.json`.
- [Estrategia interpretativa del MMPI-2, material de formación de University of Minnesota Press alojado por Pearson](https://www.pearsonassessments.com/content/dam/school/global/clinical/us/assets/mmpi-2/mmpi-2-interpretive-strategy.pdf).
- [Ficha oficial MMPI-2 de Pearson](https://www.pearsonassessments.com/store/en/usd/p/100000461.html).
- [Extracto oficial del manual de Hogrefe TEA](https://hogrefe-tea.com/recursos/Ejemplos/MMPI-2-Extracto-manual.pdf).

Las páginas públicas fundamentan el contexto del instrumento y la secuencia interpretativa. No se usaron para inventar o completar las claves y tablas del documento adjunto.
