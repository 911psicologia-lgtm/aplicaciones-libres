/**
 * ============================================
 * CIE-11 - Códigos de Diagnóstico
 * Base de datos simplificada
 * ============================================
 */

const CIE11_DIAGNOSES = [
    // Trastornos mentales, del comportamiento o del neurodesarrollo
    { code: '6A00', name: 'Trastornos del espectro autista', category: 'Neurodesarrollo' },
    { code: '6A01.0', name: 'Trastorno por déficit de atención e hiperactividad, presentación predominantemente de falta de atención', category: 'Neurodesarrollo' },
    { code: '6A01.1', name: 'Trastorno por déficit de atención e hiperactividad, presentación predominantemente hiperactiva-impulsiva', category: 'Neurodesarrollo' },
    { code: '6A01.2', name: 'Trastorno por déficit de atención e hiperactividad, presentación combinada', category: 'Neurodesarrollo' },
    { code: '6A01.3', name: 'Otros trastornos por déficit de atención e hiperactividad', category: 'Neurodesarrollo' },
    { code: '6A02', name: 'Trastorno del desarrollo de la coordinación', category: 'Neurodesarrollo' },
    { code: '6A03', name: 'Trastornos específicos del desarrollo del habla y el lenguaje', category: 'Neurodesarrollo' },
    { code: '6A04', name: 'Trastorno del desarrollo de las habilidades escolares', category: 'Neurodesarrollo' },
    { code: '6A05', name: 'Trastorno del desarrollo de las funciones ejecutivas', category: 'Neurodesarrollo' },
    
    // Esquizofrenia y otros trastornos psicóticos primarios
    { code: '6A20', name: 'Esquizofrenia', category: 'Psicóticos' },
    { code: '6A20.0', name: 'Esquizofrenia de inicio en la adolescencia', category: 'Psicóticos' },
    { code: '6A20.1', name: 'Esquizofrenia de inicio en la adultez temprana', category: 'Psicóticos' },
    { code: '6A20.2', name: 'Esquizofrenia de inicio en la adultez tardía', category: 'Psicóticos' },
    { code: '6A21', name: 'Trastorno esquizotípico', category: 'Psicóticos' },
    { code: '6A22', name: 'Trastorno delirante', category: 'Psicóticos' },
    { code: '6A23', name: 'Trastorno psicótico breve', category: 'Psicóticos' },
    { code: '6A24', name: 'Trastorno esquizoafectivo', category: 'Psicóticos' },
    { code: '6A25', name: 'Trastorno psicótico inducido por sustancias o medicamentos', category: 'Psicóticos' },
    { code: '6A26', name: 'Trastorno psicótico debido a otra condición médica', category: 'Psicóticos' },
    { code: '6A28', name: 'Otros trastornos psicóticos especificados', category: 'Psicóticos' },
    { code: '6A29', name: 'Trastornos psicóticos, no especificados', category: 'Psicóticos' },
    
    // Trastornos del estado de ánimo
    { code: '6A60', name: 'Episodio maníaco', category: 'Estado de ánimo' },
    { code: '6A60.0', name: 'Episodio maníaco sin síntomas psicóticos', category: 'Estado de ánimo' },
    { code: '6A60.1', name: 'Episodio maníaco con síntomas psicóticos', category: 'Estado de ánimo' },
    { code: '6A61', name: 'Episodio hipomaníaco', category: 'Estado de ánimo' },
    { code: '6A62', name: 'Episodio depresivo', category: 'Estado de ánimo' },
    { code: '6A62.0', name: 'Episodio depresivo, leve', category: 'Estado de ánimo' },
    { code: '6A62.1', name: 'Episodio depresivo, moderado', category: 'Estado de ánimo' },
    { code: '6A62.2', name: 'Episodio depresivo, severo sin síntomas psicóticos', category: 'Estado de ánimo' },
    { code: '6A62.3', name: 'Episodio depresivo, severo con síntomas psicóticos', category: 'Estado de ánimo' },
    { code: '6A62.4', name: 'Episodio depresivo con síntomas catatónicos', category: 'Estado de ánimo' },
    { code: '6A62.5', name: 'Episodio depresivo con síntomas melancólicos', category: 'Estado de ánimo' },
    { code: '6A62.6', name: 'Episodio depresivo con síntomas atípicos', category: 'Estado de ánimo' },
    { code: '6A63', name: 'Trastorno bipolar tipo I', category: 'Estado de ánimo' },
    { code: '6A63.0', name: 'Trastorno bipolar tipo I, episodio maníaco actual', category: 'Estado de ánimo' },
    { code: '6A63.1', name: 'Trastorno bipolar tipo I, episodio hipomaníaco actual', category: 'Estado de ánimo' },
    { code: '6A63.2', name: 'Trastorno bipolar tipo I, episodio depresivo actual', category: 'Estado de ánimo' },
    { code: '6A63.3', name: 'Trastorno bipolar tipo I, episodio mixto actual', category: 'Estado de ánimo' },
    { code: '6A63.4', name: 'Trastorno bipolar tipo I, actualmente en remisión', category: 'Estado de ánimo' },
    { code: '6A64', name: 'Trastorno bipolar tipo II', category: 'Estado de ánimo' },
    { code: '6A65', name: 'Trastorno ciclotímico', category: 'Estado de ánimo' },
    { code: '6A70', name: 'Trastorno depresivo recurrente', category: 'Estado de ánimo' },
    { code: '6A70.0', name: 'Trastorno depresivo recurrente, episodio leve actual', category: 'Estado de ánimo' },
    { code: '6A70.1', name: 'Trastorno depresivo recurrente, episodio moderado actual', category: 'Estado de ánimo' },
    { code: '6A70.2', name: 'Trastorno depresivo recurrente, episodio severo actual', category: 'Estado de ánimo' },
    { code: '6A70.3', name: 'Trastorno depresivo recurrente, actualmente en remisión', category: 'Estado de ánimo' },
    { code: '6A71', name: 'Trastorno disfórico premenstrual', category: 'Estado de ánimo' },
    { code: '6A72', name: 'Trastorno depresivo persistente', category: 'Estado de ánimo' },
    { code: '6A73', name: 'Trastorno disruptivo de la regulación del estado de ánimo', category: 'Estado de ánimo' },
    { code: '6A78', name: 'Otros trastornos del estado de ánimo especificados', category: 'Estado de ánimo' },
    { code: '6A79', name: 'Trastornos del estado de ánimo, no especificados', category: 'Estado de ánimo' },
    
    // Trastornos de ansiedad y del miedo
    { code: '6B00', name: 'Trastorno de ansiedad generalizada', category: 'Ansiedad' },
    { code: '6B01', name: 'Trastorno de pánico', category: 'Ansiedad' },
    { code: '6B02', name: 'Agorafobia', category: 'Ansiedad' },
    { code: '6B03', name: 'Fobia específica', category: 'Ansiedad' },
    { code: '6B03.0', name: 'Fobia específica, tipo animal', category: 'Ansiedad' },
    { code: '6B03.1', name: 'Fobia específica, tipo ambiente natural', category: 'Ansiedad' },
    { code: '6B03.2', name: 'Fobia específica, tipo sangre-inyección-herida', category: 'Ansiedad' },
    { code: '6B03.3', name: 'Fobia específica, tipo situacional', category: 'Ansiedad' },
    { code: '6B03.4', name: 'Fobia específica, otro tipo', category: 'Ansiedad' },
    { code: '6B04', name: 'Trastorno de ansiedad social', category: 'Ansiedad' },
    { code: '6B05', name: 'Trastorno de ansiedad por separación', category: 'Ansiedad' },
    { code: '6B06', name: 'Fobia mutista selectiva', category: 'Ansiedad' },
    { code: '6B07', name: 'Trastorno de ansiedad inducido por sustancias o medicamentos', category: 'Ansiedad' },
    { code: '6B08', name: 'Trastorno de ansiedad debido a otra condición médica', category: 'Ansiedad' },
    { code: '6B0Y', name: 'Otros trastornos de ansiedad especificados', category: 'Ansiedad' },
    { code: '6B0Z', name: 'Trastornos de ansiedad, no especificados', category: 'Ansiedad' },
    
    // Trastornos obsesivo-compulsivos y relacionados
    { code: '6B20', name: 'Trastorno obsesivo-compulsivo', category: 'TOC' },
    { code: '6B20.0', name: 'Trastorno obsesivo-compulsivo con insight bueno', category: 'TOC' },
    { code: '6B20.1', name: 'Trastorno obsesivo-compulsivo con insight pobre', category: 'TOC' },
    { code: '6B20.2', name: 'Trastorno obsesivo-compulsivo con ausencia de insight', category: 'TOC' },
    { code: '6B20.3', name: 'Trastorno obsesivo-compulsivo con tics', category: 'TOC' },
    { code: '6B21', name: 'Trastorno de acumulación (hoarding)', category: 'TOC' },
    { code: '6B22', name: 'Trastorno dismórfico corporal', category: 'TOC' },
    { code: '6B22.0', name: 'Trastorno dismórfico corporal con comportamientos repetitivos', category: 'TOC' },
    { code: '6B22.1', name: 'Trastorno dismórfico corporal con ideas de referencia', category: 'TOC' },
    { code: '6B23', name: 'Trastorno de excoriación', category: 'TOC' },
    { code: '6B24', name: 'Trastorno de tricotilomanía', category: 'TOC' },
    { code: '6B25', name: 'Trastorno obsesivo-compulsivo inducido por sustancias o medicamentos', category: 'TOC' },
    { code: '6B26', name: 'Trastorno obsesivo-compulsivo debido a otra condición médica', category: 'TOC' },
    { code: '6B2Y', name: 'Otros trastornos obsesivo-compulsivos y relacionados especificados', category: 'TOC' },
    { code: '6B2Z', name: 'Trastornos obsesivo-compulsivos y relacionados, no especificados', category: 'TOC' },
    
    // Trastornos relacionados con el trauma y el estrés
    { code: '6B40', name: 'Trastorno de estrés postraumático', category: 'Trauma' },
    { code: '6B40.0', name: 'Trastorno de estrés postraumático, complejo', category: 'Trauma' },
    { code: '6B40.1', name: 'Trastorno de estrés postraumático, con disociación', category: 'Trauma' },
    { code: '6B41', name: 'Trastorno de estrés agudo', category: 'Trauma' },
    { code: '6B42', name: 'Trastorno de adaptación', category: 'Trauma' },
    { code: '6B42.0', name: 'Trastorno de adaptación con estado de ánimo deprimido', category: 'Trauma' },
    { code: '6B42.1', name: 'Trastorno de adaptación con ansiedad', category: 'Trauma' },
    { code: '6B42.2', name: 'Trastorno de adaptación con ansiedad mixta y estado de ánimo deprimido', category: 'Trauma' },
    { code: '6B42.3', name: 'Trastorno de adaptación con alteración de la conducta', category: 'Trauma' },
    { code: '6B42.4', name: 'Trastorno de adaptación con alteración mixta de las emociones y la conducta', category: 'Trauma' },
    { code: '6B43', name: 'Trastorno de apego reactivo', category: 'Trauma' },
    { code: '6B44', name: 'Trastorno de interacción social desinhibida', category: 'Trauma' },
    { code: '6B45', name: 'Trastorno de estrés postraumático prolongado', category: 'Trauma' },
    { code: '6B46', name: 'Trastorno de duelo prolongado', category: 'Trauma' },
    { code: '6B4Y', name: 'Otros trastornos relacionados con el trauma y el estrés especificados', category: 'Trauma' },
    { code: '6B4Z', name: 'Trastornos relacionados con el trauma y el estrés, no especificados', category: 'Trauma' },
    
    // Trastornos disociativos
    { code: '6B60', name: 'Trastorno de identidad disociativo', category: 'Disociativos' },
    { code: '6B61', name: 'Trastorno de amnesia disociativa', category: 'Disociativos' },
    { code: '6B62', name: 'Trastorno de despersonalización-desrealización', category: 'Disociativos' },
    { code: '6B63', name: 'Trastorno de trance disociativo', category: 'Disociativos' },
    { code: '6B64', name: 'Trastorno de posesión disociativa', category: 'Disociativos' },
    { code: '6B6Y', name: 'Otros trastornos disociativos especificados', category: 'Disociativos' },
    { code: '6B6Z', name: 'Trastornos disociativos, no especificados', category: 'Disociativos' },
    
    // Trastornos de la personalidad
    { code: '6D10', name: 'Trastorno de la personalidad borderline', category: 'Personalidad' },
    { code: '6D10.0', name: 'Trastorno de la personalidad borderline, tipo impulsivo', category: 'Personalidad' },
    { code: '6D10.1', name: 'Trastorno de la personalidad borderline, tipo inhibido', category: 'Personalidad' },
    { code: '6D11', name: 'Trastorno de la personalidad antisocial', category: 'Personalidad' },
    { code: '6D11.0', name: 'Trastorno de la personalidad antisocial, tipo agresivo', category: 'Personalidad' },
    { code: '6D11.1', name: 'Trastorno de la personalidad antisocial, tipo no agresivo', category: 'Personalidad' },
    { code: '6D12', name: 'Trastorno de la personalidad histriónica', category: 'Personalidad' },
    { code: '6D13', name: 'Trastorno de la personalidad narcisista', category: 'Personalidad' },
    { code: '6D14', name: 'Trastorno de la personalidad por evitación', category: 'Personalidad' },
    { code: '6D15', name: 'Trastorno de la personalidad dependiente', category: 'Personalidad' },
    { code: '6D16', name: 'Trastorno de la personalidad obsesivo-compulsiva', category: 'Personalidad' },
    { code: '6D17', name: 'Trastorno de la personalidad paranoide', category: 'Personalidad' },
    { code: '6D18', name: 'Trastorno de la personalidad esquizoide', category: 'Personalidad' },
    { code: '6D19', name: 'Trastorno de la personalidad esquizotípica', category: 'Personalidad' },
    { code: '6D1A', name: 'Trastorno de la personalidad negativista (pasivo-agresivo)', category: 'Personalidad' },
    { code: '6D1Y', name: 'Otros trastornos de la personalidad especificados', category: 'Personalidad' },
    { code: '6D1Z', name: 'Trastornos de la personalidad, no especificados', category: 'Personalidad' },
    
    // Trastornos de la conducta alimentaria
    { code: '6B80', name: 'Anorexia nerviosa', category: 'Alimentarios' },
    { code: '6B80.0', name: 'Anorexia nerviosa, tipo restrictivo', category: 'Alimentarios' },
    { code: '6B80.1', name: 'Anorexia nerviosa, tipo atracón-purgativo', category: 'Alimentarios' },
    { code: '6B81', name: 'Bulimia nerviosa', category: 'Alimentarios' },
    { code: '6B82', name: 'Trastorno por atracón', category: 'Alimentarios' },
    { code: '6B82.0', name: 'Trastorno por atracón, leve', category: 'Alimentarios' },
    { code: '6B82.1', name: 'Trastorno por atracón, moderado', category: 'Alimentarios' },
    { code: '6B82.2', name: 'Trastorno por atracón, severo', category: 'Alimentarios' },
    { code: '6B83', name: 'Trastorno de evitación/restricción de la ingesta de alimentos', category: 'Alimentarios' },
    { code: '6B84', name: 'Trastorno de la ingesta nocturna', category: 'Alimentarios' },
    { code: '6B85', name: 'Trastorno de la imagen corporal', category: 'Alimentarios' },
    { code: '6B8Y', name: 'Otros trastornos de la conducta alimentaria especificados', category: 'Alimentarios' },
    { code: '6B8Z', name: 'Trastornos de la conducta alimentaria, no especificados', category: 'Alimentarios' },
    
    // Trastornos del sueño-vigilia
    { code: '7A00', name: 'Insomnio', category: 'Sueño' },
    { code: '7A00.0', name: 'Insomnio crónico', category: 'Sueño' },
    { code: '7A00.1', name: 'Insomnio a corto plazo', category: 'Sueño' },
    { code: '7A01', name: 'Hipersomnia', category: 'Sueño' },
    { code: '7A02', name: 'Síndrome de Kleine-Levin', category: 'Sueño' },
    { code: '7A03', name: 'Narcolepsia tipo 1', category: 'Sueño' },
    { code: '7A04', name: 'Narcolepsia tipo 2', category: 'Sueño' },
    { code: '7A05', name: 'Trastorno del ritmo sueño-vigilia', category: 'Sueño' },
    { code: '7A06', name: 'Trastorno de respiración relacionado con el sueño', category: 'Sueño' },
    { code: '7A07', name: 'Trastorno de movimientos relacionados con el sueño', category: 'Sueño' },
    { code: '7A08', name: 'Trastorno de conducta del sueño REM', category: 'Sueño' },
    { code: '7A09', name: 'Pesadillas', category: 'Sueño' },
    { code: '7A0A', name: 'Terrores nocturnos', category: 'Sueño' },
    { code: '7A0B', name: 'Sonambulismo', category: 'Sueño' },
    { code: '7A0Y', name: 'Otros trastornos del sueño-vigilia especificados', category: 'Sueño' },
    { code: '7A0Z', name: 'Trastornos del sueño-vigilia, no especificados', category: 'Sueño' },
    
    // Trastornos relacionados con sustancias
    { code: '6C40', name: 'Trastorno por uso de alcohol', category: 'Sustancias' },
    { code: '6C40.0', name: 'Trastorno por uso de alcohol, episodio de intoxicación', category: 'Sustancias' },
    { code: '6C40.1', name: 'Trastorno por uso de alcohol, uso nocivo', category: 'Sustancias' },
    { code: '6C40.2', name: 'Trastorno por uso de alcohol, dependencia', category: 'Sustancias' },
    { code: '6C41', name: 'Trastorno por uso de cannabis', category: 'Sustancias' },
    { code: '6C42', name: 'Trastorno por uso de opioides', category: 'Sustancias' },
    { code: '6C43', name: 'Trastorno por uso de sedantes, hipnóticos o anxiolíticos', category: 'Sustancias' },
    { code: '6C44', name: 'Trastorno por uso de cocaína', category: 'Sustancias' },
    { code: '6C45', name: 'Trastorno por uso de estimulantes', category: 'Sustancias' },
    { code: '6C46', name: 'Trastorno por uso de alucinógenos', category: 'Sustancias' },
    { code: '6C47', name: 'Trastorno por uso de nicotina', category: 'Sustancias' },
    { code: '6C48', name: 'Trastorno por uso de inhalantes', category: 'Sustancias' },
    { code: '6C49', name: 'Trastorno por uso de disociativos', category: 'Sustancias' },
    { code: '6C4A', name: 'Trastorno por uso de sustancias múltiples', category: 'Sustancias' },
    { code: '6C4Y', name: 'Otros trastornos por uso de sustancias especificados', category: 'Sustancias' },
    { code: '6C4Z', name: 'Trastornos por uso de sustancias, no especificados', category: 'Sustancias' },
    
    // Trastornos del control de los impulsos
    { code: '6C50', name: 'Trastorno explosivo intermitente', category: 'Impulsos' },
    { code: '6C51', name: 'Trastorno de juego (ludopatía)', category: 'Impulsos' },
    { code: '6C52', name: 'Trastorno de cleptomanía', category: 'Impulsos' },
    { code: '6C53', name: 'Trastorno de piromanía', category: 'Impulsos' },
    { code: '6C54', name: 'Trastorno de compras compulsivas', category: 'Impulsos' },
    { code: '6C55', name: 'Trastorno de uso compulsivo de internet', category: 'Impulsos' },
    { code: '6C5Y', name: 'Otros trastornos del control de los impulsos especificados', category: 'Impulsos' },
    { code: '6C5Z', name: 'Trastornos del control de los impulsos, no especificados', category: 'Impulsos' },
    
    // Trastornos sexuales
    { code: '6B90', name: 'Trastorno del deseo sexual hipoactivo', category: 'Sexuales' },
    { code: '6B91', name: 'Trastorno de la excitación sexual', category: 'Sexuales' },
    { code: '6B92', name: 'Trastorno orgásmico', category: 'Sexuales' },
    { code: '6B93', name: 'Eyaculación precoz', category: 'Sexuales' },
    { code: '6B94', name: 'Disfunción eréctil', category: 'Sexuales' },
    { code: '6B95', name: 'Disforia de género', category: 'Sexuales' },
    { code: '6B95.0', name: 'Disforia de género en la niñez', category: 'Sexuales' },
    { code: '6B95.1', name: 'Disforia de género en la adolescencia y adultez', category: 'Sexuales' },
    { code: '6B96', name: 'Parafilia', category: 'Sexuales' },
    { code: '6B98', name: 'Dolor genitopélvico/penetración', category: 'Sexuales' },
    { code: '6B9Y', name: 'Otros trastornos sexuales especificados', category: 'Sexuales' },
    { code: '6B9Z', name: 'Trastornos sexuales, no especificados', category: 'Sexuales' },
    
    // Síndromes somáticos
    { code: '6C00', name: 'Trastorno de síntomas somáticos', category: 'Somáticos' },
    { code: '6C00.0', name: 'Trastorno de síntomas somáticos, leve', category: 'Somáticos' },
    { code: '6C00.1', name: 'Trastorno de síntomas somáticos, moderado', category: 'Somáticos' },
    { code: '6C00.2', name: 'Trastorno de síntomas somáticos, severo', category: 'Somáticos' },
    { code: '6C01', name: 'Trastorno de ansiedad por la salud', category: 'Somáticos' },
    { code: '6C02', name: 'Trastorno de conversión (síntomas neurológicos funcionales)', category: 'Somáticos' },
    { code: '6C03', name: 'Factores psicológicos que afectan otras condiciones médicas', category: 'Somáticos' },
    { code: '6C0Y', name: 'Otros síndromes somáticos especificados', category: 'Somáticos' },
    { code: '6C0Z', name: 'Síndromes somáticos, no especificados', category: 'Somáticos' },
    
    // Trastornos facticios
    { code: '6D30', name: 'Trastorno facticio', category: 'Facticios' },
    { code: '6D30.0', name: 'Trastorno facticio, predominantemente psicológicos', category: 'Facticios' },
    { code: '6D30.1', name: 'Trastorno facticio, predominantemente físicos', category: 'Facticios' },
    { code: '6D30.2', name: 'Trastorno facticio, mixto', category: 'Facticios' },
    { code: '6D31', name: 'Trastorno facticio impuesto a otro', category: 'Facticios' },
    
    // Trastornos neurocognitivos
    { code: '6D80', name: 'Demencia', category: 'Neurocognitivos' },
    { code: '6D80.0', name: 'Demencia leve', category: 'Neurocognitivos' },
    { code: '6D80.1', name: 'Demencia moderada', category: 'Neurocognitivos' },
    { code: '6D80.2', name: 'Demencia severa', category: 'Neurocognitivos' },
    { code: '6D81', name: 'Demencia debida a enfermedad de Alzheimer', category: 'Neurocognitivos' },
    { code: '6D82', name: 'Demencia vascular', category: 'Neurocognitivos' },
    { code: '6D83', name: 'Demencia debida a enfermedad de Lewy', category: 'Neurocognitivos' },
    { code: '6D84', name: 'Demencia debida a enfermedad de Parkinson', category: 'Neurocognitivos' },
    { code: '6D85', name: 'Demencia debida a traumatismo craneoencefálico', category: 'Neurocognitivos' },
    { code: '6D86', name: 'Demencia debida a infección por VIH', category: 'Neurocognitivos' },
    { code: '6D87', name: 'Trastorno amnésico', category: 'Neurocognitivos' },
    { code: '6D88', name: 'Trastorno cognitivo leve', category: 'Neurocognitivos' },
    { code: '6D8Y', name: 'Otros trastornos neurocognitivos especificados', category: 'Neurocognitivos' },
    { code: '6D8Z', name: 'Trastornos neurocognitivos, no especificados', category: 'Neurocognitivos' },
    
    // Trastornos de los tics
    { code: '8A00', name: 'Trastorno de tics motor o vocal crónico', category: 'Tics' },
    { code: '8A01', name: 'Síndrome de Tourette', category: 'Tics' },
    { code: '8A02', name: 'Trastorno de tics transitorio', category: 'Tics' },
    { code: '8A0Y', name: 'Otros trastornos de los tics especificados', category: 'Tics' },
    { code: '8A0Z', name: 'Trastornos de los tics, no especificados', category: 'Tics' },
    
    // Eliminación
    { code: '6C90', name: 'Enuresis', category: 'Eliminación' },
    { code: '6C91', name: 'Encopresis', category: 'Eliminación' },
    
    // Síndromes del lactante
    { code: '6C92', name: 'Llanto excesivo del lactante', category: 'Lactante' },
    { code: '6C93', name: 'Trastorno de la regulación del lactante', category: 'Lactante' },
    
    // Factores que influyen en la salud
    { code: 'QE50', name: 'Problemas en la relación de pareja', category: 'Factores' },
    { code: 'QE51', name: 'Problemas parentales', category: 'Factores' },
    { code: 'QE52', name: 'Problemas familiares', category: 'Factores' },
    { code: 'QE53', name: 'Problemas sociales', category: 'Factores' },
    { code: 'QE54', name: 'Problemas laborales', category: 'Factores' },
    { code: 'QE55', name: 'Problemas económicos', category: 'Factores' },
    { code: 'QE56', name: 'Problemas de vivienda', category: 'Factores' },
    { code: 'QE57', name: 'Problemas legales', category: 'Factores' },
    { code: 'QE58', name: 'Problemas relacionados con el sistema de salud', category: 'Factores' },
    { code: 'QE59', name: 'Problemas relacionados con el aislamiento social', category: 'Factores' },
    { code: 'QE60', name: 'Riesgo de suicidio', category: 'Factores' },
    { code: 'QE61', name: 'Riesgo de violencia', category: 'Factores' },
    { code: 'QE62', name: 'Experiencia de maltrato', category: 'Factores' },
    { code: 'QE63', name: 'Experiencia de abuso', category: 'Factores' },
    { code: 'QE64', name: 'Experiencia de negligencia', category: 'Factores' },
    
    // Códigos suplementarios
    { code: 'QA00.0', name: 'Estado de ánimo ansioso', category: 'Suplementarios' },
    { code: 'QA00.1', name: 'Estado de ánimo deprimido', category: 'Suplementarios' },
    { code: 'QA00.2', name: 'Estado de ánimo eufórico', category: 'Suplementarios' },
    { code: 'QA00.3', name: 'Estado de ánimo irritable', category: 'Suplementarios' },
    { code: 'QA00.4', name: 'Estado de ánimo fluctuante', category: 'Suplementarios' },
    { code: 'QA00.5', name: 'Estado de ánimo apático', category: 'Suplementarios' },
    { code: 'QA01.0', name: 'Ideación suicida', category: 'Suplementarios' },
    { code: 'QA01.1', name: 'Planificación suicida', category: 'Suplementarios' },
    { code: 'QA01.2', name: 'Intento de suicidio', category: 'Suplementarios' },
    { code: 'QA02.0', name: 'Agresión hacia otros', category: 'Suplementarios' },
    { code: 'QA02.1', name: 'Autolesiones', category: 'Suplementarios' },
    { code: 'QA03.0', name: 'Insight bueno', category: 'Suplementarios' },
    { code: 'QA03.1', name: 'Insight parcial', category: 'Suplementarios' },
    { code: 'QA03.2', name: 'Insight ausente', category: 'Suplementarios' }
];

// Función de búsqueda
function searchCIE11(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return CIE11_DIAGNOSES.filter(d => 
        d.code.toLowerCase().includes(lowerQuery) ||
        d.name.toLowerCase().includes(lowerQuery) ||
        d.category.toLowerCase().includes(lowerQuery)
    ).slice(0, 20);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CIE11_DIAGNOSES, searchCIE11 };
}
