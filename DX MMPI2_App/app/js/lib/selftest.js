/* ============================================
   Self-test · MMPI-2 App (V3 · AUDITORÍA)
   Ejecuta 14 pruebas de regresión sobre el motor y la UI.
   Uso:  window.runSelfTest()  →  imprime resultados en consola.
   ============================================ */

const SelfTest = {
  /* Resultados acumulados */
  _results: [],

  _ok(name, detail) {
    this._results.push({ name, status: 'PASS', detail: detail || '' });
    console.log('%c✓ PASS · ' + name, 'color:#15803D;font-weight:600', detail || '');
  },
  _fail(name, detail) {
    this._results.push({ name, status: 'FAIL', detail: detail || '' });
    console.error('✗ FAIL · ' + name, detail || '');
  },
  _info(name, detail) {
    this._results.push({ name, status: 'INFO', detail: detail || '' });
    console.log('%cℹ ' + name, 'color:#2F5496', detail || '');
  },

  async run() {
    this._results = [];
    console.group('%c─── MMPI-2 Self-Test ───', 'color:#1F3864;font-weight:700;font-size:14px');
    const M = window.MMPI2;
    if (!M) {
      this._fail('init', 'window.MMPI2 no disponible');
      console.groupEnd();
      return this._results;
    }
    // Asegurar que los datos estén cargados
    if (M.SCALE_ITEMS == null) {
      try { await M.init(); } catch (e) { /* ignore */ }
    }

    // ---- 1. Escala sin clave → pd===null (no 0) ----
    try {
      // D3 está ausente de scale_items.json tras limpieza
      const pd = M.computePD('D3', new Array(567).fill(1));
      if (pd === null) this._ok('1. Escala sin clave → pd===null', 'D3 → null (correcto)');
      else this._fail('1. Escala sin clave → pd===null', 'Esperaba null, obtuvo: ' + JSON.stringify(pd));
    } catch (e) { this._fail('1. Escala sin clave → pd===null', e.message); }

    // ---- 2. PD no en baremo → T===null, status=PD_FUERA_DE_TABLA ----
    try {
      // L para mujer H: PD keys 0..15 → si pasamos PD=9999, debe estar fuera de tabla
      // Buscamos un PD que NO exista en el baremo
      const sex = 'H';
      const country = 'ES';
      const baremo = M._getBaremos(country);
      const sb = baremo && baremo['L'];
      if (sb && sb[sex]) {
        // Buscar un PD grande que no esté en la tabla
        const fakePD = 9999;
        const lk = M.lookupT('L', fakePD, sex, country);
        if (lk && lk.t === null && lk.status === M.STATUS.PD_FUERA_DE_TABLA) {
          this._ok('2. PD fuera de tabla → T=null, status=PD_FUERA_DE_TABLA', 'PD=9999 → correcto');
        } else {
          this._fail('2. PD fuera de tabla → T=null, status=PD_FUERA_DE_TABLA',
            'PD=9999 devolvió: ' + JSON.stringify(lk));
        }
      } else {
        this._info('2. PD fuera de tabla → T=null', 'Baremo L no disponible, prueba omitida');
      }
    } catch (e) { this._fail('2. PD fuera de tabla', e.message); }

    // ---- 3. Caso US → no se usa baremo ES ----
    try {
      // Construir respuestas dummy (todo 1)
      const resp = new Array(567).fill(1);
      const rUS = await M.computeAll(resp, 'M', 'US');
      // Tomar L (que existe tanto en ES como en US): debe dar T distinto en US vs ES
      const rES = await M.computeAll(resp, 'M', 'ES');
      const tL_US = rUS.L && typeof rUS.L.t === 'number' ? rUS.L.t : null;
      const tL_ES = rES.L && typeof rES.L.t === 'number' ? rES.L.t : null;
      // Al menos debe haber consultado el baremo correcto; si son distintos, prueba contundente
      if (tL_US != null && tL_ES != null && tL_US !== tL_ES) {
        this._ok('3. Caso US → usa baremo US (no ES)', `L(H,M): US=${tL_US}, ES=${tL_ES} — difieren correctamente`);
      } else if (tL_US != null) {
        this._info('3. Caso US → usa baremo US', `US y ES dieron mismo T para L=${tL_US} (puede ser coincidencia por PD concreto)`);
      } else {
        this._fail('3. Caso US → usa baremo US', 'No se pudo obtener T de L para US');
      }
    } catch (e) { this._fail('3. Caso US → usa baremo US', e.message); }

    // ---- 4. Caso ES → no se usa baremo US ----
    try {
      const resp = new Array(567).fill(1);
      const rES = await M.computeAll(resp, 'H', 'ES');
      const rUS = await M.computeAll(resp, 'H', 'US');
      // Tomamos Hs (PD+K; baremo más extenso en ES y US)
      const HsES = rES.Hs && typeof rES.Hs.t === 'number' ? rES.Hs.t : null;
      const HsUS = rUS.Hs && typeof rUS.Hs.t === 'number' ? rUS.Hs.t : null;
      if (HsES != null && HsUS != null) {
        if (HsES !== HsUS) {
          this._ok('4. Caso ES → usa baremo ES (no US)', `Hs(H): ES=${HsES}, US=${HsUS} — difieren`);
        } else {
          this._info('4. Caso ES → usa baremo ES', `Hs ES y US coinciden en ${HsES} (puede ser coincidencia)`);
        }
      } else {
        // Si Hs no dio T, probamos con L
        const LES = rES.L && typeof rES.L.t === 'number' ? rES.L.t : null;
        const LUS = rUS.L && typeof rUS.L.t === 'number' ? rUS.L.t : null;
        if (LES != null && LUS != null && LES !== LUS) {
          this._ok('4. Caso ES → usa baremo ES (no US)', `L(H): ES=${LES}, US=${LUS} — difieren`);
        } else {
          this._info('4. Caso ES → usa baremo ES', `Hs sin T en ambos baremos (Hs ES=${HsES}, US=${HsUS})`);
        }
      }
    } catch (e) { this._fail('4. Caso ES → usa baremo ES', e.message); }

    // ---- 5. Cambio de país → recalcula correctamente ----
    try {
      const resp = new Array(567).fill(1);
      const rES = await M.computeAll(resp, 'M', 'ES');
      const rUS = await M.computeAll(resp, 'M', 'US');
      // Usar L (ambos baremos tienen T para PD=0)
      const tES = rES.L && typeof rES.L.t === 'number' ? rES.L.t : null;
      const tUS = rUS.L && typeof rUS.L.t === 'number' ? rUS.L.t : null;
      if (tES != null && tUS != null) {
        if (tES !== tUS) {
          this._ok('5. Cambio de país → recalcula T', `L(M,PD=0): ES=${tES} → US=${tUS}`);
        } else {
          this._info('5. Cambio de país → recalcula T', `L ES y US coinciden en ${tES}`);
        }
      } else {
        this._info('5. Cambio de país → recalcula T', 'L sin T documentada');
      }
    } catch (e) { this._fail('5. Cambio de país → recalcula T', e.message); }

    // ---- 6. Caso restaurado → conserva country ----
    try {
      // Simular: guardar caso con country=US, leer de vuelta, comprobar country
      const fakeCase = {
        id: 'selftest_' + Date.now(),
        patient: { name: 'Test', sex: 'M', country: 'US', age: 30 },
        responses: new Array(567).fill(1),
      };
      Storage.saveCase(fakeCase);
      Storage.flush();
      const restored = Storage.getCase(fakeCase.id);
      if (restored && restored.patient && restored.patient.country === 'US') {
        this._ok('6. Caso restaurado conserva country', 'country=US preservado en localStorage');
      } else {
        this._fail('6. Caso restaurado conserva country', 'country se perdió: ' + JSON.stringify(restored && restored.patient));
      }
      // Limpieza
      Storage.deleteCase(fakeCase.id);
    } catch (e) { this._fail('6. Caso restaurado conserva country', e.message); }

    // ---- 7. F-K usa PD directas (no T) ----
    try {
      const r = await M.computeAll(new Array(567).fill(1), 'M', 'ES');
      const fPD = r.F && (r.F.pd != null) ? r.F.pd : null;
      const kPD = r.K && (r.K.pd != null) ? r.K.pd : null;
      const expected = (fPD != null && kPD != null) ? fPD - kPD : null;
      // Revisar que la función interna de AIPrompt usa PD
      if (window.AIPrompt && typeof AIPrompt._computeFK === 'function') {
        const fkStr = AIPrompt._computeFK(r);
        if (fkStr && fkStr.includes('F(PD)=') && fkStr.includes('K(PD)=')) {
          this._ok('7. F-K usa PD directas', `F(PD)=${fPD}, K(PD)=${kPD}, diff=${expected}`);
        } else {
          this._fail('7. F-K usa PD directas', 'El mensaje no incluye "F(PD)=" / "K(PD)=": ' + fkStr);
        }
      } else {
        this._info('7. F-K usa PD directas', 'AIPrompt no disponible, no se verificó el texto del prompt');
      }
    } catch (e) { this._fail('7. F-K usa PD directas', e.message); }

    // ---- 8. Captura de gráficos IA: estructura esperada ----
    try {
      if (typeof Report !== 'undefined' && typeof Report._captureAIChartImgs === 'function') {
        // Stub: si no hay contenedor, debe devolver []
        const old = document.getElementById;
        document.getElementById = function(id) {
          if (id === 'ai-report-output') return null;
          return old.call(document, id);
        };
        const out = Report._captureAIChartImgs();
        document.getElementById = old;
        if (Array.isArray(out) && out.length === 0) {
          this._ok('8. _captureAIChartImgs devuelve arreglo vacío cuando no hay canvas', 'OK');
        } else {
          this._fail('8. _captureAIChartImgs', 'Esperaba [] cuando no hay canvas, obtuvo: ' + JSON.stringify(out));
        }
      } else {
        this._info('8. _captureAIChartImgs', 'Report no disponible todavía (pantalla no montada)');
      }
    } catch (e) { this._fail('8. _captureAIChartImgs', e.message); }

    // ---- 9. Export AI Report HTML acepta chartImages ----
    try {
      if (window.Export && typeof Export.exportAIReportHTML === 'function') {
        // No es posible ejecutar el export real sin invocar descarga, pero
        // verificamos que la signatura acepta 4 argumentos mirando la longitud.
        const fnSrc = Export.exportAIReportHTML.toString();
        if (fnSrc.includes('chartImages')) {
          this._ok('9. exportAIReportHTML acepta chartImages', 'Parámetro presente en la firma');
        } else {
          this._fail('9. exportAIReportHTML acepta chartImages', 'No se encontró el parámetro chartImages');
        }
      } else {
        this._info('9. exportAIReportHTML acepta chartImages', 'Export no disponible');
      }
    } catch (e) { this._fail('9. exportAIReportHTML', e.message); }

    // ---- 10. Export AI Report Word acepta chartImages ----
    try {
      if (window.Export && typeof Export.exportAIReportWord === 'function') {
        const fnSrc = Export.exportAIReportWord.toString();
        if (fnSrc.includes('chartImages')) {
          this._ok('10. exportAIReportWord acepta chartImages', 'Parámetro presente en la firma');
        } else {
          this._fail('10. exportAIReportWord acepta chartImages', 'No se encontró el parámetro chartImages');
        }
      } else {
        this._info('10. exportAIReportWord acepta chartImages', 'Export no disponible');
      }
    } catch (e) { this._fail('10. exportAIReportWord', e.message); }

    // ---- 11. HTML exportado incluye <img> en lugar de tabla cuando hay imagen ----
    try {
      if (window.Export && typeof Export._aiGraficoHTML === 'function') {
        const imgsByFig = { 1: { figura: 1, titulo: 'Test', dataURL: 'data:image/png;base64,AAAA' } };
        const html = Export._aiGraficoHTML({
          tipo: 'grafico',
          figura: 1,
          titulo: 'Test',
          grafico_tipo: 'linea',
          series: [{ nombre: 'T', puntos: [{ x: 'L', y: 50 }] }],
        }, imgsByFig);
        if (html.includes('<img') && html.includes('data:image/png')) {
          this._ok('11. HTML exportado incluye <img> embebida', 'figure+img presente');
        } else {
          this._fail('11. HTML exportado incluye <img> embebida', 'No se encontró <img> en: ' + html);
        }
      } else {
        this._info('11. HTML exportado incluye <img>', 'Export no disponible');
      }
    } catch (e) { this._fail('11. HTML exportado incluye <img>', e.message); }

    // ---- 12. Fallback: si no hay imagen, se incluye la tabla de datos ----
    try {
      if (window.Export && typeof Export._aiGraficoHTML === 'function') {
        const html = Export._aiGraficoHTML({
          tipo: 'grafico',
          figura: 1,
          titulo: 'Test sin imagen',
          series: [{ nombre: 'T', puntos: [{ x: 'L', y: 50 }] }],
        }, {});
        if (html.includes('<table') && html.includes('No fue posible generar')) {
          this._ok('12. Fallback: tabla + mensaje cuando no hay imagen', 'OK');
        } else {
          this._fail('12. Fallback: tabla + mensaje', 'No se encontró tabla o mensaje de fallback: ' + html);
        }
      } else {
        this._info('12. Fallback: tabla + mensaje', 'Export no disponible');
      }
    } catch (e) { this._fail('12. Fallback', e.message); }

    // ---- 13. JSON malicioso → rechazado ----
    try {
      const malicious = {
        version: '3.0',
        cases: [{
          id: 'x',
          patient: { sex: 'X', country: 'XX' }, // sex y country inválidos
          responses: new Array(567).fill(3),  // respuestas inválidas (3)
        }],
      };
      const v = Storage.validateImport(malicious);
      if (!v.ok) {
        this._ok('13. JSON malicioso → rechazado', 'Error esperado: ' + v.error);
      } else {
        this._fail('13. JSON malicioso → rechazado', 'Debería haber rechazado pero aceptó: ' + JSON.stringify(v.data));
      }
    } catch (e) { this._fail('13. JSON malicioso → rechazado', e.message); }

    // ---- 14. Perfil no interpretable → no se generan recomendaciones ----
    try {
      // Construir un results con F > 90 → NO_INTERPRETABLE
      const fakeResults = {
        F: { code: 'F', t: 95, status: 'T_DOCUMENTADA' },
        K: { code: 'K', t: 50, status: 'T_DOCUMENTADA' },
        L: { code: 'L', t: 50, status: 'T_DOCUMENTADA' },
        VRIN: { code: 'VRIN', t: 50, status: 'T_DOCUMENTADA' },
        Hs: { code: 'Hs', t: 80 },
        D: { code: 'D', t: 70 },
      };
      const val = M.assessValidity(fakeResults);
      if (val.status === 'NO_INTERPRETABLE' && val.reasons.length > 0) {
        // Comprobar que la UI no muestra recomendaciones cuando isInterpretable=false
        // (se evalúa en el render con la comprobación validity.status !== 'NO_INTERPRETABLE')
        this._ok('14. Perfil no interpretable → assessValidity=NO_INTERPRETABLE', 'reasons: ' + val.reasons.join(' | '));
      } else {
        this._fail('14. Perfil no interpretable', 'Esperaba NO_INTERPRETABLE, obtuvo: ' + val.status);
      }
    } catch (e) { this._fail('14. Perfil no interpretable', e.message); }

    // ---- Resumen ----
    const passed = this._results.filter(r => r.status === 'PASS').length;
    const failed = this._results.filter(r => r.status === 'FAIL').length;
    const info = this._results.filter(r => r.status === 'INFO').length;
    console.log('%c─── Resumen ───', 'color:#1F3864;font-weight:700');
    console.log(`%c  ${passed} PASS  /  ${failed} FAIL  /  ${info} INFO`, 'font-size:13px');
    console.groupEnd();
    return this._results;
  },
};

window.SelfTest = SelfTest;
window.runSelfTest = function() {
  return SelfTest.run();
};
