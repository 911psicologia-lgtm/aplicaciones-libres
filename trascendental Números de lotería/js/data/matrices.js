(function () {
  'use strict';

  window.FQ_READING_MODES = [
    {
      id: 'evidencial',
      icon: '📊',
      name: 'Evidencial',
      description: 'Simulación con datos históricos verificables y línea base aleatoria.',
      recommendedMatrices: ['historical', 'random']
    },
    {
      id: 'simbolico',
      icon: '🔮',
      name: 'Simbólico',
      description: 'Números, ciclos, palabras, espacio y símbolos personales.',
      recommendedMatrices: ['numerology', 'celestial', 'temporal', 'spatial', 'textual', 'random']
    },
    {
      id: 'relacional',
      icon: '🕸️',
      name: 'Relacional',
      description: 'Cruza datos, símbolos, gesto y azar para probar la arquitectura del método.',
      recommendedMatrices: ['historical', 'numerology', 'celestial', 'temporal', 'spatial', 'textual', 'gestural', 'random', 'integrative']
    },
    {
      id: 'oraculo',
      icon: '✨',
      name: 'Oráculo libre',
      description: 'Simulación narrativa con símbolos, gesto y azar, sin pretensión predictiva.',
      recommendedMatrices: ['textual', 'gestural', 'random', 'integrative']
    }
  ];

  window.FQ_MATRICES = [
    {
      id: 'historical',
      icon: '📈',
      name: 'Histórico-estadística',
      description: 'Frecuencia, recencia, paridad, sumas, dispersión y coapariciones.',
      status: 'Descriptiva y verificable'
    },
    {
      id: 'numerology',
      icon: '🔢',
      name: 'Numerológica',
      description: 'Fechas, nombres, palabras y ciclos convertidos mediante reglas visibles.',
      status: 'Simbólica'
    },
    {
      id: 'celestial',
      icon: '🪐',
      name: 'Celeste',
      description: 'Fase lunar, día planetario, periodo zodiacal y otras efemérides confiables.',
      status: 'Simbólica-cultural'
    },
    {
      id: 'temporal',
      icon: '⏳',
      name: 'Temporal',
      description: 'Cualidades atribuidas al día, mes, año y ciclos del consultante.',
      status: 'Simbólica'
    },
    {
      id: 'spatial',
      icon: '🧭',
      name: 'Espacial-natural',
      description: 'Lugar, orientación, estación, fase ambiental y territorio.',
      status: 'Simbólica-contextual'
    },
    {
      id: 'textual',
      icon: '📜',
      name: 'Textual-visionaria',
      description: 'Pregunta, palabra, sueño, imagen o símbolo interpretados sin fatalismo.',
      status: 'Narrativa-simbólica'
    },
    {
      id: 'gestural',
      icon: '〰️',
      name: 'Gestual',
      description: 'Un recorrido voluntario crea una semilla sin inferir personalidad ni destino.',
      status: 'Aleatoria-participativa'
    },
    {
      id: 'random',
      icon: '🎲',
      name: 'Azar puro',
      description: 'Línea base imparcial mediante semilla reproducible.',
      status: 'Aleatoria'
    },
    {
      id: 'integrative',
      icon: '🌌',
      name: 'Síntesis relacional',
      description: 'Identifica convergencias, divergencias y procedencia de cada valor experimental.',
      status: 'Integrativa'
    }
  ];
})();
