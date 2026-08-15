# Auditoría clínica y editorial de prompts · TRAS v0.16.3

## Propósito

La revisión se concentró en evitar dos riesgos: **reducir información clínicamente importante** y **producir textos mecánicos o excesivamente teóricos**. Los prompts conservan la prudencia epistemológica y la contextualización clínica, pero el informe final debe sonar como una explicación profesional, natural y comprensible para cuidadores, docentes y otros profesionales.

## Hallazgos y correcciones

### 1. Historia clínica

**Problema detectado:** el rango obligatorio de 100–120 palabras obligaba a comprimir casos complejos y podía eliminar cronología, cambios, respuestas del entorno, discrepancias entre informantes o hechos delicados.

**Corrección:** el resumen clínico contextual usa una extensión flexible, normalmente de 160–280 palabras, en uno o dos párrafos. La prioridad es la suficiencia contextual. Debe conservar motivo, trayectoria temporal, familia, escuela, manifestaciones, impacto, recursos, situación actual, propósito de la evaluación y datos por confirmar.

### 2. Entrevista TRAS

**Problema detectado:** la instrucción de “limpiar” la transcripción podía interpretarse como autorización para resumir o parafrasear.

**Corrección:** se exige conservar negaciones, dudas, contradicciones, referencias temporales, cambios de idea y palabras emocionalmente relevantes. Si una respuesta contiene varios componentes, ninguno puede desaparecer. Las ambigüedades se conservan y se marcan para profundizar.

### 3. Interpretación por áreas del TRAS

**Problema detectado:** el prompt producía tres campos separados —qué dice, qué sucede y qué se sugiere—, mientras el informe combinaba solo parte de ellos y mantenía la orientación aparte. Esto no correspondía plenamente con la solicitud de un solo párrafo integrado y favorecía simplificaciones.

**Corrección:** se conservan los tres componentes como trazabilidad interna, pero se genera además `parrafo_integrado`, que reúne descripción, comprensión contextual y orientación en un único texto visible. La extensión es orientativa: 45–75 palabras, hasta 100 en áreas complejas. Ninguna área puede desaparecer. Cuando no hay datos, se usa una declaración explícita de área no explorada.

### 4. Marco clínico

**Problema detectado:** el prompt pedía que el análisis consolidado se redactara “desde el marco humanista-existencial con lectura psicodinámica”, lo cual llevaba a que la IA nombrara el enfoque en el informe.

**Corrección:** la orientación humanista-existencial, psicodinámica integrativa y de diálogo de saberes se mantiene como **andamiaje interno de razonamiento**. Se prohíbe nombrar escuelas o introducir fórmulas como “desde una perspectiva…”. La integración debe apreciarse en la comprensión del caso, no en etiquetas teóricas.

### 5. Habilidades sociales de Goldstein

**Problema detectado:** el código calculaba el detalle de las 50 habilidades, pero no lo insertaba en el prompt. La IA interpretaba principalmente porcentajes por grupo y una contextualización demasiado abreviada.

**Corrección:** el prompt recibe las respuestas individuales, los porcentajes, la clasificación, la historia clínica completa y las áreas relevantes del TRAS. Se le pide sintetizar sin enumerar mecánicamente. La antigua “hipótesis causal” se reemplaza por `lectura_contextual`, evitando explicaciones lineales o únicas.

### 6. Perfil descriptivo de personalidad

**Problema detectado:** una o dos frases por dimensión y una síntesis de 60–90 palabras podían producir etiquetas rápidas y perder condiciones de variación, tensiones o recursos.

**Corrección:** cada dimensión sustentada dispone de 45–80 palabras y la síntesis de 120–180. Debe explicar tendencia, contexto, datos que la sostienen, condiciones de intensificación o disminución, recursos y límites. Continúa la prohibición de simular MMPI-A o cualquier perfil psicométrico.

### 7. Informe clínico consolidado

**Problema detectado:** estaba dirigido explícitamente “a otro profesional”, pese a que sus lectores incluyen familias y docentes. También podía repetir el análisis por áreas o adoptar un tono académico.

**Corrección:** el prompt se dirige a una audiencia mixta. El informe consolidado integra historia, TRAS, Goldstein, personalidad y anexos sin sustituir el análisis por áreas. La extensión orientativa es de 550–850 palabras, con lenguaje clínico accesible, explicación del contexto, condiciones de variación, convergencias, discrepancias, recursos y límites.

### 8. Lenguaje mecánico

Se prohíben en los prompts expresiones como:

- “El material sugiere…”
- “Desde una perspectiva…”
- “Se evidencia…”
- repetición de “Se observa una tendencia…”

Además, el exportador aplica una limpieza editorial no destructiva a informes antiguos para retirar aperturas teóricas o formularias sin modificar los datos guardados.

## Criterios de aceptación

1. El resumen clínico permite comprender globalmente el caso sin consultar toda la HC.
2. Ningún hecho relevante se elimina para cumplir una extensión rígida.
3. Todas las áreas activas del TRAS aparecen en el informe.
4. Cada área con datos muestra un único párrafo integrado; los tres componentes permanecen auditables en la app.
5. Las áreas sin datos se identifican como no exploradas y no se completan con inferencias.
6. El informe no nombra escuelas psicológicas ni explica el marco teórico al destinatario.
7. Goldstein utiliza porcentajes y respuestas individuales, sin reducir el perfil a una clasificación global.
8. El perfil de personalidad conserva matices, contexto, recursos y límites.
9. La salida es comprensible para cuidadores y docentes, pero mantiene precisión profesional.
10. Todos los textos siguen siendo editables y requieren revisión clínica antes de exportar.
