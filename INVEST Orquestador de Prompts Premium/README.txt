Rizoma PromptLab Premium v0.3.2
Objetivo: construir prompts profesionales premium para IA externa, validar respuestas y generar informes exportables.

Cómo probar:
1. Abre index.html en Chrome, Edge o Firefox.
2. Registra el perfil, formula una pregunta, marca anexos si aplica y genera el prompt.
3. Copia el JSON, úsalo en una IA externa, pega la respuesta en Validación y genera el informe.
4. Exporta el informe (HTML, TXT, Word) o guarda el caso para reutilizarlo.

Notas técnicas:
- La app no usa API ni backend.
- Los casos se guardan en localStorage del navegador.
- El micrófono depende del soporte del navegador para SpeechRecognition (Chrome/Edge recomendados).
- Exporta HTML, TXT, DOC compatible con Word y JSON de respaldo.
- Los exportes HTML reflejan la paleta de color activa del usuario.


Cambios v0.3.2 (Auditoría DSEBI — mejoras CRÍTICAS y ALTAS):

CRÍTICO — C1: Prompt dinámico por naturaleza del informe
  - Nueva función getFormatoByNature() que adapta formato_respuesta_obligatorio
    según la naturaleza declarada (Académico, Clínico, Evaluativo, Jurídico,
    Técnico, Desarrollo app, Formativo, Investigación, Personalizado).
  - Cada naturaleza activa campos específicos: referencias_bibliograficas para
    académico, hallazgos_clinicos para clínico, normas_aplicables para jurídico, etc.
  - instruccion_principal y naturaleza_del_informe ahora incluyen instrucción
    explícita al equipo de agentes sobre cómo adaptar la respuesta.

CRÍTICO — C2: Corrección del bug de micrófono múltiple
  - Al cambiar de campo durante grabación: se limpia la clase .recording del botón
    anterior, stopMic() libera el recognition, se aguardan 180ms y se reinicia
    en el nuevo campo. Eliminados estados visuales huérfanos.
  - Refactorización: startMic() y stopMic() como funciones independientes.
  - stopMic() limpia TODOS los botones .mini-mic.recording como salvaguarda.

CRÍTICO — C3: openCase() restaura campos de formulario
  - Nueva función restoreDraftToForm(d) que rellena: caseTitle, centralQuestion,
    productType, reportNature, customProduct, customNatureDesc, customNatureStructure,
    docTypes, responseStyle, manualLabels, willAttach.
  - Tanto openCase() como los demos llaman a restoreDraftToForm().

ALTO — A1: Validación semántica expandida a 9 naturalezas
  - Campos base verificados en todas las naturalezas: resumen_ejecutivo,
    limites_y_advertencias, recomendaciones, informe_final.
  - Verificaciones específicas para: Académico/Investigación (referencias APA,
    enfoque metodológico), Clínico (límites, aclaración presencial), Evaluativo
    (interpretacion_resultados, instrumentos), Jurídico (normas reales, advertencia
    orientativa), Técnico (especificaciones), Desarrollo app (requerimientos,
    pantallas/flujos), Formativo (objetivos, estructura).

ALTO — A2: loadAcademicDemo() completo
  - Ahora llama a restoreDraftToForm() para rellenar todos los campos del formulario,
    igual que loadDemoCase(). El usuario puede navegar atrás y editar el demo.

ALTO — A3: Detener micrófono al cambiar de pantalla
  - go() verifica isRecording y llama a stopMic() antes de cambiar la pantalla activa.

ALTO — A4: customNatureDesc/Structure inyectados en el prompt
  - Cuando reportNature es "Otro / personalizado", el prompt incluye un bloque
    customNatureInstructions con descripcion, estructura e instrucción explícita
    para que la IA adapte la respuesta.

ALTO — A5: generateCaseAnalysis() adaptado por naturaleza
  - Produce notas contextuales específicas según naturaleza: rigor APA para
    académico, límites presenciales para clínico, instrumentos para evaluativo,
    normas reales para jurídico, etc.

ALTO — A6: Versión correcta en exportAllCases()
  - Exporta como rizoma_promptlab_casos_v0_3_2.json (era v0_2).

MEDIO — M1: font-weight:750 corregido a font-weight:700 en CSS.
MEDIO — M2: tabindex="0" en tooltips .tip + aria-label en botones de micrófono.
MEDIO — M3: exportableHTML() usa variables CSS de la paleta activa (no paleta hardcodeada).
TÉCNICO: saveState() maneja error de cuota de localStorage con toast informativo.
TÉCNICO: URL.revokeObjectURL usa setTimeout(1000) para evitar race condition.
