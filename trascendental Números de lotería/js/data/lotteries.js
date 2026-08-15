(function () {
  'use strict';

  // Presets deliberadamente sintéticos. Un dataset comercial puede describirse
  // manualmente como referencia documental, pero la aplicación no lo convierte
  // en una selección accionable.
  window.FQ_LOTTERIES = {
    'ESCENARIO FQ-LAB 5/39': {
      country: 'Colombia',
      type: 'Muestreo sin reemplazo',
      config: '5 estados de un universo de 39, sin repetir',
      series: false,
      note: 'Preset sintético para pruebas de estructura, trazabilidad y sesgos.'
    },
    'ESCENARIO FQ-LAB 6/49': {
      country: '',
      type: 'Muestreo sin reemplazo',
      config: '6 estados de un universo de 49, sin repetir',
      series: false,
      note: 'Preset sintético para pruebas combinatorias.'
    },
    'ESCENARIO FQ-LAB 5/50 + 2/12': {
      country: '',
      type: 'Muestreo compuesto',
      config: '5 estados de un universo de 50 + 2 estados de un universo de 12',
      series: false,
      note: 'Preset sintético con dos universos independientes.'
    },
    'ESCENARIO FQ-LAB 4D': {
      country: '',
      type: 'Secuencia de dígitos',
      config: '4 dígitos entre 0000 y 9999',
      series: false,
      note: 'Preset sintético para analizar secuencias, no sorteos comerciales.'
    }
  };
})();
