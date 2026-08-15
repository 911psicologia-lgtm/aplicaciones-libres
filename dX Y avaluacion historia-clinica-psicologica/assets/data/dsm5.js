/**
 * ============================================
 * DSM-5-TR - Códigos de Diagnóstico
 * Base de datos simplificada
 * ============================================
 */

const DSM5_DIAGNOSES = [
    // Trastornos del neurodesarrollo
    { code: 'F84.0', name: 'Trastorno autista', category: 'Neurodesarrollo' },
    { code: 'F84.5', name: 'Síndrome de Asperger', category: 'Neurodesarrollo' },
    { code: 'F84.9', name: 'Trastorno del espectro autista', category: 'Neurodesarrollo' },
    { code: 'F90.0', name: 'Trastorno por déficit de atención e hiperactividad, presentación combinada', category: 'Neurodesarrollo' },
    { code: 'F90.1', name: 'Trastorno por déficit de atención e hiperactividad, presentación predominantemente inatenta', category: 'Neurodesarrollo' },
    { code: 'F90.2', name: 'Trastorno por déficit de atención e hiperactividad, presentación predominantemente hiperactiva-impulsiva', category: 'Neurodesarrollo' },
    { code: 'F81.0', name: 'Trastorno específico de la lectura (dislexia)', category: 'Neurodesarrollo' },
    { code: 'F81.2', name: 'Trastorno específico del cálculo (discalculia)', category: 'Neurodesarrollo' },
    { code: 'F82', name: 'Trastorno específico del desarrollo de la coordinación motora', category: 'Neurodesarrollo' },
    { code: 'F80.1', name: 'Trastorno del lenguaje expresivo', category: 'Neurodesarrollo' },
    { code: 'F80.2', name: 'Trastorno del lenguaje mixto receptivo-expresivo', category: 'Neurodesarrollo' },
    
    // Trastornos de la esquizofrenia y otros trastornos psicóticos
    { code: 'F20.9', name: 'Esquizofrenia', category: 'Psicóticos' },
    { code: 'F20.0', name: 'Esquizofrenia paranoide', category: 'Psicóticos' },
    { code: 'F20.1', name: 'Esquizofrenia hebefrénica', category: 'Psicóticos' },
    { code: 'F20.2', name: 'Esquizofrenia catatónica', category: 'Psicóticos' },
    { code: 'F20.3', name: 'Esquizofrenia indiferenciada', category: 'Psicóticos' },
    { code: 'F20.5', name: 'Esquizofrenia residual', category: 'Psicóticos' },
    { code: 'F25.0', name: 'Trastorno esquizoafectivo, tipo bipolar', category: 'Psicóticos' },
    { code: 'F25.1', name: 'Trastorno esquizoafectivo, tipo depresivo', category: 'Psicóticos' },
    { code: 'F22', name: 'Trastorno delirante', category: 'Psicóticos' },
    { code: 'F23', name: 'Trastorno psicótico breve', category: 'Psicóticos' },
    { code: 'F24', name: 'Trastorno psicótico compartido', category: 'Psicóticos' },
    { code: 'F29', name: 'Trastorno psicótico no especificado', category: 'Psicóticos' },
    
    // Trastornos bipolares y relacionados
    { code: 'F31.0', name: 'Trastorno bipolar I, episodio hipomaníaco', category: 'Bipolares' },
    { code: 'F31.1', name: 'Trastorno bipolar I, episodio maníaco sin síntomas psicóticos', category: 'Bipolares' },
    { code: 'F31.2', name: 'Trastorno bipolar I, episodio maníaco con síntomas psicóticos', category: 'Bipolares' },
    { code: 'F31.3', name: 'Trastorno bipolar I, episodio depresivo leve o moderado', category: 'Bipolares' },
    { code: 'F31.4', name: 'Trastorno bipolar I, episodio depresivo severo sin síntomas psicóticos', category: 'Bipolares' },
    { code: 'F31.5', name: 'Trastorno bipolar I, episodio depresivo severo con síntomas psicóticos', category: 'Bipolares' },
    { code: 'F31.6', name: 'Trastorno bipolar I, episodio mixto', category: 'Bipolares' },
    { code: 'F31.7', name: 'Trastorno bipolar I, en remisión', category: 'Bipolares' },
    { code: 'F31.9', name: 'Trastorno bipolar I, no especificado', category: 'Bipolares' },
    { code: 'F31.81', name: 'Trastorno bipolar II', category: 'Bipolares' },
    { code: 'F34.0', name: 'Trastorno ciclotímico', category: 'Bipolares' },
    
    // Trastornos depresivos
    { code: 'F32.0', name: 'Episodio depresivo leve', category: 'Depresivos' },
    { code: 'F32.1', name: 'Episodio depresivo moderado', category: 'Depresivos' },
    { code: 'F32.2', name: 'Episodio depresivo severo sin síntomas psicóticos', category: 'Depresivos' },
    { code: 'F32.3', name: 'Episodio depresivo severo con síntomas psicóticos', category: 'Depresivos' },
    { code: 'F32.9', name: 'Episodio depresivo, no especificado', category: 'Depresivos' },
    { code: 'F33.0', name: 'Trastorno depresivo mayor, episodio leve recurrente', category: 'Depresivos' },
    { code: 'F33.1', name: 'Trastorno depresivo mayor, episodio moderado recurrente', category: 'Depresivos' },
    { code: 'F33.2', name: 'Trastorno depresivo mayor, episodio severo recurrente sin síntomas psicóticos', category: 'Depresivos' },
    { code: 'F33.3', name: 'Trastorno depresivo mayor, episodio severo recurrente con síntomas psicóticos', category: 'Depresivos' },
    { code: 'F33.4', name: 'Trastorno depresivo mayor, en remisión', category: 'Depresivos' },
    { code: 'F33.9', name: 'Trastorno depresivo mayor recurrente, no especificado', category: 'Depresivos' },
    { code: 'F34.1', name: 'Distimia', category: 'Depresivos' },
    { code: 'F34.8', name: 'Trastorno depresivo persistente (distimia)', category: 'Depresivos' },
    { code: 'F06.31', name: 'Trastorno depresivo con síntomas catatónicos', category: 'Depresivos' },
    
    // Trastornos de ansiedad
    { code: 'F41.0', name: 'Trastorno de pánico', category: 'Ansiedad' },
    { code: 'F41.1', name: 'Trastorno de ansiedad generalizada', category: 'Ansiedad' },
    { code: 'F40.00', name: 'Agorafobia', category: 'Ansiedad' },
    { code: 'F40.01', name: 'Agorafobia sin historia de trastorno de pánico', category: 'Ansiedad' },
    { code: 'F40.10', name: 'Fobia social (trastorno de ansiedad social)', category: 'Ansiedad' },
    { code: 'F40.2', name: 'Fobia específica', category: 'Ansiedad' },
    { code: 'F40.21', name: 'Fobia específica, tipo sangre-inyección-herida', category: 'Ansiedad' },
    { code: 'F40.22', name: 'Fobia específica, tipo situacional', category: 'Ansiedad' },
    { code: 'F40.23', name: 'Fobia específica, tipo animal', category: 'Ansiedad' },
    { code: 'F40.24', name: 'Fobia específica, tipo ambiente natural', category: 'Ansiedad' },
    { code: 'F40.29', name: 'Fobia específica, otro tipo', category: 'Ansiedad' },
    { code: 'F41.9', name: 'Trastorno de ansiedad, no especificado', category: 'Ansiedad' },
    { code: 'F06.4', name: 'Trastorno de ansiedad debido a otra condición médica', category: 'Ansiedad' },
    
    // Trastornos obsesivo-compulsivos y relacionados
    { code: 'F42.2', name: 'Trastorno obsesivo-compulsivo', category: 'TOC' },
    { code: 'F42.3', name: 'Trastorno obsesivo-compulsivo, con poca o ninguna insight', category: 'TOC' },
    { code: 'F42.4', name: 'Trastorno obsesivo-compulsivo, con ausencia de insight', category: 'TOC' },
    { code: 'F45.22', name: 'Trastorno dismórfico corporal', category: 'TOC' },
    { code: 'F63.3', name: 'Trastorno de acumulación (hoarding)', category: 'TOC' },
    { code: 'F42.8', name: 'Trastorno de excoriación (pellizcamiento de la piel)', category: 'TOC' },
    { code: 'F42.9', name: 'Trastorno obsesivo-compulsivo y relacionado, no especificado', category: 'TOC' },
    
    // Trastornos relacionados con el trauma y el estrés
    { code: 'F43.10', name: 'Trastorno de estrés postraumático', category: 'Trauma' },
    { code: 'F43.11', name: 'Trastorno de estrés postraumático, agudo', category: 'Trauma' },
    { code: 'F43.12', name: 'Trastorno de estrés postraumático, crónico', category: 'Trauma' },
    { code: 'F43.0', name: 'Trastorno de estrés agudo', category: 'Trauma' },
    { code: 'F43.20', name: 'Trastorno de adaptación', category: 'Trauma' },
    { code: 'F43.21', name: 'Trastorno de adaptación con estado de ánimo deprimido', category: 'Trauma' },
    { code: 'F43.22', name: 'Trastorno de adaptación con ansiedad', category: 'Trauma' },
    { code: 'F43.23', name: 'Trastorno de adaptación con ansiedad mixta y estado de ánimo deprimido', category: 'Trauma' },
    { code: 'F43.24', name: 'Trastorno de adaptación con alteración de la conducta', category: 'Trauma' },
    { code: 'F43.25', name: 'Trastorno de adaptación con alteración mixta de las emociones y la conducta', category: 'Trauma' },
    { code: 'F43.29', name: 'Trastorno de adaptación, no especificado', category: 'Trauma' },
    { code: 'F94.1', name: 'Trastorno de apego reactivo', category: 'Trauma' },
    { code: 'F94.2', name: 'Trastorno de interacción social desinhibida', category: 'Trauma' },
    
    // Trastornos disociativos
    { code: 'F44.0', name: 'Amnesia disociativa', category: 'Disociativos' },
    { code: 'F44.1', name: 'Fuga disociativa', category: 'Disociativos' },
    { code: 'F44.81', name: 'Trastorno de identidad disociativo', category: 'Disociativos' },
    { code: 'F44.9', name: 'Trastorno disociativo, no especificado', category: 'Disociativos' },
    { code: 'F48.1', name: 'Trastorno de despersonalización-desrealización', category: 'Disociativos' },
    
    // Trastornos de la personalidad
    { code: 'F60.0', name: 'Trastorno de la personalidad paranoide', category: 'Personalidad' },
    { code: 'F60.1', name: 'Trastorno de la personalidad esquizoide', category: 'Personalidad' },
    { code: 'F60.2', name: 'Trastorno de la personalidad esquizotípica', category: 'Personalidad' },
    { code: 'F60.3', name: 'Trastorno de la personalidad antisocial', category: 'Personalidad' },
    { code: 'F60.4', name: 'Trastorno de la personalidad límite (borderline)', category: 'Personalidad' },
    { code: 'F60.5', name: 'Trastorno de la personalidad histriónica', category: 'Personalidad' },
    { code: 'F60.6', name: 'Trastorno de la personalidad narcisista', category: 'Personalidad' },
    { code: 'F60.7', name: 'Trastorno de la personalidad por evitación', category: 'Personalidad' },
    { code: 'F60.8', name: 'Trastorno de la personalidad dependiente', category: 'Personalidad' },
    { code: 'F60.81', name: 'Trastorno de la personalidad obsesivo-compulsiva', category: 'Personalidad' },
    { code: 'F60.9', name: 'Trastorno de la personalidad, no especificado', category: 'Personalidad' },
    
    // Trastornos de la conducta alimentaria
    { code: 'F50.00', name: 'Anorexia nerviosa, tipo restrictivo', category: 'Alimentarios' },
    { code: 'F50.01', name: 'Anorexia nerviosa, tipo atracón-purgativo', category: 'Alimentarios' },
    { code: 'F50.2', name: 'Bulimia nerviosa', category: 'Alimentarios' },
    { code: 'F50.8', name: 'Trastorno por atracón', category: 'Alimentarios' },
    { code: 'F50.9', name: 'Trastorno de la conducta alimentaria, no especificado', category: 'Alimentarios' },
    
    // Trastornos del sueño-vigilia
    { code: 'G47.00', name: 'Insomnio', category: 'Sueño' },
    { code: 'G47.10', name: 'Hipersomnia', category: 'Sueño' },
    { code: 'G47.41', name: 'Narcolepsia', category: 'Sueño' },
    { code: 'F51.5', name: 'Pesadillas', category: 'Sueño' },
    { code: 'F51.3', name: 'Trastorno de conducta del sueño REM', category: 'Sueño' },
    { code: 'F51.4', name: 'Trastorno de pánico nocturno', category: 'Sueño' },
    
    // Trastornos relacionados con sustancias
    { code: 'F10.20', name: 'Trastorno por uso de alcohol, moderado o severo', category: 'Sustancias' },
    { code: 'F11.20', name: 'Trastorno por uso de opioides, moderado o severo', category: 'Sustancias' },
    { code: 'F12.20', name: 'Trastorno por uso de cannabis, moderado o severo', category: 'Sustancias' },
    { code: 'F13.20', name: 'Trastorno por uso de sedantes, hipnóticos o anxiolíticos, moderado o severo', category: 'Sustancias' },
    { code: 'F14.20', name: 'Trastorno por uso de cocaína, moderado o severo', category: 'Sustancias' },
    { code: 'F15.20', name: 'Trastorno por uso de estimulantes, moderado o severo', category: 'Sustancias' },
    { code: 'F16.20', name: 'Trastorno por uso de alucinógenos, moderado o severo', category: 'Sustancias' },
    { code: 'F17.200', name: 'Trastorno por uso de tabaco, moderado o severo', category: 'Sustancias' },
    { code: 'F18.20', name: 'Trastorno por uso de inhalantes, moderado o severo', category: 'Sustancias' },
    { code: 'F19.20', name: 'Trastorno por uso de sustancias múltiples, moderado o severo', category: 'Sustancias' },
    
    // Trastornos del control de los impulsos
    { code: 'F63.0', name: 'Trastorno explosivo intermitente', category: 'Impulsos' },
    { code: 'F63.1', name: 'Juego patológico (trastorno de juego)', category: 'Impulsos' },
    { code: 'F63.2', name: 'Trastorno de cleptomanía', category: 'Impulsos' },
    { code: 'F63.81', name: 'Trastorno de piromanía', category: 'Impulsos' },
    
    // Trastornos sexuales
    { code: 'F52.0', name: 'Trastorno del deseo sexual hipoactivo', category: 'Sexuales' },
    { code: 'F52.21', name: 'Trastorno de la excitación sexual femenina', category: 'Sexuales' },
    { code: 'F52.22', name: 'Trastorno eréctil', category: 'Sexuales' },
    { code: 'F52.31', name: 'Trastorno orgásmico femenino', category: 'Sexuales' },
    { code: 'F52.32', name: 'Eyaculación precoz', category: 'Sexuales' },
    { code: 'F52.4', name: 'Trastorno orgásmico masculino', category: 'Sexuales' },
    { code: 'F52.6', name: 'Disforia de género no transsexual', category: 'Sexuales' },
    
    // Síndromes somáticos
    { code: 'F45.0', name: 'Trastorno de somatización', category: 'Somáticos' },
    { code: 'F45.1', name: 'Trastorno somatomorfo indiferenciado', category: 'Somáticos' },
    { code: 'F45.21', name: 'Trastorno de hipocondría', category: 'Somáticos' },
    { code: 'F54', name: 'Factores psicológicos que afectan la condición médica', category: 'Somáticos' },
    
    // Trastornos facticios
    { code: 'F68.10', name: 'Trastorno facticio', category: 'Facticios' },
    { code: 'F68.11', name: 'Trastorno facticio impuesto a otro', category: 'Facticios' },
    
    // Trastornos cognitivos
    { code: 'F03.90', name: 'Demencia mayor, no especificada', category: 'Cognitivos' },
    { code: 'G30.9', name: 'Enfermedad de Alzheimer', category: 'Cognitivos' },
    { code: 'F01.50', name: 'Demencia vascular', category: 'Cognitivos' },
    { code: 'F02.80', name: 'Demencia debida a otra condición médica', category: 'Cognitivos' },
    { code: 'F06.7', name: 'Trastorno cognitivo leve', category: 'Cognitivos' },
    { code: 'R41.81', name: 'Deterioro cognitivo leve', category: 'Cognitivos' },
    
    // Otros trastornos
    { code: 'F98.0', name: 'Enuresis', category: 'Otros' },
    { code: 'F98.1', name: 'Encopresis', category: 'Otros' },
    { code: 'F95.0', name: 'Trastorno de tics transitorio', category: 'Otros' },
    { code: 'F95.1', name: 'Trastorno de tics motor o vocal crónico', category: 'Otros' },
    { code: 'F95.2', name: 'Síndrome de Tourette', category: 'Otros' },
    { code: 'F44.4', name: 'Trastorno de conversión (síntomas neurológicos funcionales)', category: 'Otros' },
    { code: 'F48.8', name: 'Síndrome de burnout', category: 'Otros' },
    { code: 'Z63.0', name: 'Problemas en la relación de pareja', category: 'Otros' },
    { code: 'Z62.820', name: 'Estrés parental', category: 'Otros' },
    { code: 'Z60.2', name: 'Problemas de adaptación social', category: 'Otros' },
    { code: 'Z73.0', name: 'Agotamiento (burnout)', category: 'Otros' },
    { code: 'Z73.3', name: 'Estrés', category: 'Otros' },
    { code: 'Z91.5', name: 'Riesgo de suicidio', category: 'Otros' },
    { code: 'R45.851', name: 'Ideación suicida', category: 'Otros' }
];

// Función de búsqueda
function searchDSM5(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return DSM5_DIAGNOSES.filter(d => 
        d.code.toLowerCase().includes(lowerQuery) ||
        d.name.toLowerCase().includes(lowerQuery) ||
        d.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 20);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DSM5_DIAGNOSES, searchDSM5 };
}
