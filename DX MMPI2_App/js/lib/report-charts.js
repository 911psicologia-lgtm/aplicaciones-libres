/* ============================================
   ReportCharts — gráficos del informe (Chart.js)
   Un mismo "spec" sirve para:
     · dibujar en pantalla (mount en un <canvas>)
     · generar una imagen PNG fuera de pantalla (toImage) para
       Word, PDF y HTML exportado (no depende de lo visible)
   spec = { kind: 'profile'|'barh'|'stacked'|'compare',
            labels: [...], series: [{name, data:[...] }],
            refs: [50, 65], yMin, yMax, title, colorByValue }
   ============================================ */

const ReportCharts = {
  COLORS: {
    ink: '#1F3864', grid: '#E5E7EB', text: '#1F2937', muted: '#6B7280',
    vh: '#B91C1C', h: '#EA580C', ps: '#CA8A04', m: '#15803D', lo: '#1D4ED8',
    prev: '#9CA3AF',
  },

  levelColor(t) {
    const C = this.COLORS;
    if (t == null) return C.muted;
    if (t >= 70) return C.vh;
    if (t >= 60) return C.h;
    if (t >= 56) return C.ps;
    if (t >= 40) return C.m;
    return C.lo;
  },

  /* Plugin: líneas de referencia sobre el eje de valores (T=50, T=65) */
  _refPlugin: {
    id: 'refLines',
    afterDatasetsDraw(chart, args, opts) {
      const refs = (opts && opts.lines) || [];
      if (!refs.length) return;
      const { ctx, chartArea } = chart;
      const horizontal = chart.options.indexAxis === 'y';
      const scale = horizontal ? chart.scales.x : chart.scales.y;
      if (!scale) return;
      ctx.save();
      for (const r of refs) {
        const v = scale.getPixelForValue(r.value);
        if (!isFinite(v)) continue;
        ctx.beginPath();
        ctx.setLineDash(r.dash || [6, 4]);
        ctx.strokeStyle = r.color || '#999';
        ctx.lineWidth = r.width || 1.2;
        if (horizontal) { ctx.moveTo(v, chartArea.top); ctx.lineTo(v, chartArea.bottom); }
        else { ctx.moveTo(chartArea.left, v); ctx.lineTo(chartArea.right, v); }
        ctx.stroke();
        if (r.label) {
          ctx.setLineDash([]);
          ctx.fillStyle = r.color || '#999';
          ctx.font = '600 10px Arial, sans-serif';
          if (horizontal) { ctx.textAlign = 'center'; ctx.fillText(r.label, v, chartArea.top - 4); }
          else { ctx.textAlign = 'right'; ctx.fillText(r.label, chartArea.right - 2, v - 4); }
        }
      }
      ctx.restore();
    },
  },

  /* Plugin: valores escritos junto a puntos/barras (legible en papel) */
  _valuePlugin: {
    id: 'valueLabels',
    afterDatasetsDraw(chart, args, opts) {
      if (!opts || !opts.enabled) return;
      const { ctx } = chart;
      const horizontal = chart.options.indexAxis === 'y';
      ctx.save();
      ctx.font = `600 ${opts.size || 10}px Arial, sans-serif`;
      chart.data.datasets.forEach((ds, di) => {
        if (ds._noLabels) return;
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        meta.data.forEach((el, i) => {
          const v = ds.data[i];
          if (v == null || !isFinite(v)) return;
          if (opts.stacked && v === 0) return;
          ctx.fillStyle = opts.color || '#1F2937';
          if (horizontal) {
            ctx.textAlign = opts.stacked ? 'center' : 'left';
            ctx.textBaseline = 'middle';
            const x = opts.stacked ? (el.x + el.base) / 2 : el.x + 4;
            if (opts.stacked) ctx.fillStyle = '#fff';
            ctx.fillText(String(v), x, el.y);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const off = (opts.offsets && opts.offsets[di]) || 7;
            ctx.fillText(String(v), el.x, el.y - off);
          }
        });
      });
      ctx.restore();
    },
  },

  _yRange(spec) {
    const vals = [];
    (spec.series || []).forEach(s => s.data.forEach(v => { if (v != null && isFinite(v)) vals.push(v); }));
    const maxV = vals.length ? Math.max(...vals) : 90;
    const minV = vals.length ? Math.min(...vals) : 30;
    const yMax = spec.yMax != null ? Math.max(spec.yMax, Math.ceil((maxV + 6) / 10) * 10) : Math.max(100, Math.ceil((maxV + 6) / 10) * 10);
    const yMin = spec.yMin != null ? Math.min(spec.yMin, Math.floor((minV - 5) / 10) * 10) : Math.min(30, Math.floor((minV - 5) / 10) * 10);
    return { yMin: Math.max(0, yMin), yMax: Math.min(130, yMax) };
  },

  toConfig(spec, forImage = false) {
    const C = this.COLORS;
    const fs = forImage ? 13 : 11;
    const refs = (spec.refs || []).map(v => ({
      value: v, color: v >= 65 ? '#B91C1C' : '#6B7280', dash: v >= 65 ? [6, 4] : [3, 3],
      label: v === 50 ? 'T 50' : (v === 65 ? 'T 65' : 'T ' + v),
    }));
    const base = {
      animation: false,
      responsive: !forImage,
      maintainAspectRatio: false,
      devicePixelRatio: forImage ? 2 : undefined,
      layout: { padding: { top: 18, right: 16, left: 4, bottom: 4 } },
      plugins: {
        legend: { display: (spec.series || []).length > 1 || spec.kind === 'stacked', position: 'top', labels: { font: { size: fs }, boxWidth: 12, padding: 10, color: C.text } },
        tooltip: { enabled: !forImage },
        title: { display: false },
        refLines: { lines: refs },
        valueLabels: { enabled: spec.valueLabels !== false, size: forImage ? 11 : 10, stacked: spec.kind === 'stacked', offsets: spec.kind === 'compare' ? [9, -16] : null },
      },
    };
    const plugins = [this._refPlugin, this._valuePlugin];

    if (spec.kind === 'profile' || spec.kind === 'compare') {
      const { yMin, yMax } = this._yRange(spec);
      const datasets = spec.series.map((s, i) => {
        const isPrev = spec.kind === 'compare' && i === 1;
        const color = isPrev ? C.prev : C.ink;
        const pointColors = (!isPrev && spec.colorByValue !== false) ? s.data.map(v => this.levelColor(v)) : color;
        return {
          label: s.name, data: s.data, borderColor: color, backgroundColor: color,
          pointBackgroundColor: pointColors, pointBorderColor: pointColors,
          pointRadius: forImage ? 5 : 5, pointHoverRadius: 7, borderWidth: 2,
          borderDash: isPrev ? [6, 4] : [], pointStyle: isPrev ? 'rectRot' : 'circle',
          fill: false, tension: 0, spanGaps: false,
        };
      });
      return {
        type: 'line', plugins,
        data: { labels: spec.labels, datasets },
        options: Object.assign(base, {
          scales: {
            y: { min: yMin, max: yMax, ticks: { stepSize: 10, font: { size: fs - 1 }, color: C.muted }, grid: { color: C.grid }, title: { display: true, text: 'Puntuación T', font: { size: fs }, color: C.text } },
            x: { ticks: { font: { size: fs - 1, weight: '600' }, color: C.text, autoSkip: false, maxRotation: spec.labels.length > 16 ? 60 : 0, minRotation: spec.labels.length > 16 ? 45 : 0 }, grid: { display: false } },
          },
        }),
      };
    }

    if (spec.kind === 'barh') {
      const s = spec.series[0];
      const { yMin, yMax } = this._yRange(spec);
      return {
        type: 'bar', plugins,
        data: { labels: spec.labels, datasets: [{ label: s.name, data: s.data, backgroundColor: s.data.map(v => this.levelColor(v)), borderWidth: 0, barThickness: forImage ? 18 : 16 }] },
        options: Object.assign(base, {
          indexAxis: 'y',
          scales: {
            x: { min: Math.max(30, yMin), max: yMax, ticks: { stepSize: 10, font: { size: fs - 1 }, color: C.muted }, grid: { color: C.grid }, title: { display: true, text: 'Puntuación T', font: { size: fs }, color: C.text } },
            y: { ticks: { font: { size: fs - 1, weight: '600' }, color: C.text, autoSkip: false }, grid: { display: false } },
          },
        }),
      };
    }

    if (spec.kind === 'stacked') {
      const bandColors = [C.vh, C.h, C.ps, C.m, C.lo];
      return {
        type: 'bar', plugins,
        data: {
          labels: spec.labels,
          datasets: spec.series.map((s, i) => ({ label: s.name, data: s.data, backgroundColor: bandColors[i % bandColors.length], borderWidth: 0, barThickness: forImage ? 26 : 22 })),
        },
        options: Object.assign(base, {
          indexAxis: 'y',
          scales: {
            x: { stacked: true, ticks: { stepSize: 2, font: { size: fs - 1 }, color: C.muted }, grid: { color: C.grid }, title: { display: true, text: 'Número de escalas', font: { size: fs }, color: C.text } },
            y: { stacked: true, ticks: { font: { size: fs, weight: '600' }, color: C.text }, grid: { display: false } },
          },
        }),
      };
    }
    throw new Error('Tipo de gráfico desconocido: ' + spec.kind);
  },

  /* Altura sugerida según tipo y nº de etiquetas */
  height(spec) {
    if (spec.kind === 'barh') return Math.max(200, 60 + spec.labels.length * 30);
    if (spec.kind === 'stacked') return 60 + spec.labels.length * 46;
    return 340;
  },

  mount(canvas, spec) {
    if (!window.Chart) return null;
    return new Chart(canvas.getContext('2d'), this.toConfig(spec, false));
  },

  /* Imagen PNG fuera de pantalla. Devuelve { dataURL, width, height } (px lógicos). */
  toImage(spec, width = 900) {
    if (!window.Chart) throw new Error('Chart no disponible');
    const height = this.height(spec);
    const host = document.createElement('div');
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${height}px;`;
    const cv = document.createElement('canvas');
    cv.width = width * 2; cv.height = height * 2;
    cv.style.width = width + 'px'; cv.style.height = height + 'px';
    host.appendChild(cv);
    document.body.appendChild(host);
    let chart;
    try {
      const cfg = this.toConfig(spec, true);
      // Fondo blanco (las imágenes PNG transparentes se ven mal en Word/PDF)
      cfg.plugins.push({ id: 'whiteBg', beforeDraw(c) { const x = c.ctx; x.save(); x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.restore(); } });
      chart = new Chart(cv.getContext('2d'), cfg);
      chart.resize(width, height);
      chart.update('none');
      const dataURL = cv.toDataURL('image/png');
      return { dataURL, width, height };
    } finally {
      try { chart && chart.destroy(); } catch (e) {}
      host.remove();
    }
  },
};

window.ReportCharts = ReportCharts;
