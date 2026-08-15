/**
 * NeuroExplora — brain.js
 * BrainRenderer: genera y gestiona el SVG interactivo del cerebro
 * Vista lateral izquierda del hemisferio cerebral
 */

class BrainRenderer {

  constructor(svgId, tooltipId) {
    this.svg = document.getElementById(svgId);
    this.tooltip = document.getElementById(tooltipId);
    this.activeId = null;
    this.onSelect = null; // callback externo

    // SVG paths — vista lateral izquierda
    // ViewBox: 0 0 560 440
    this.PATHS = {

      // ── LÓBULOS PRINCIPALES ──────────────────────────────────

      frontal: {
        // Lóbulo frontal: del polo frontal al surco central (~x=272)
        main: `M 62,224 C 54,196 52,162 58,130 C 64,98 80,72 100,52
               C 120,32 146,18 176,12 C 208,6 246,8 280,16
               L 274,234 C 244,232 206,228 168,226
               C 138,224 104,224 84,224 Z`
      },
      parietal: {
        // Lóbulo parietal: surco central a surco parieto-occipital (~x=395)
        main: `M 280,16 C 318,24 356,42 388,66
               C 402,80 407,108 404,136 C 401,162 391,184 376,198
               L 352,220 C 330,228 308,232 290,232 L 274,234 Z`
      },
      occipital: {
        // Lóbulo occipital: polo posterior
        main: `M 388,66 C 416,88 436,116 447,150
               C 457,184 456,216 446,246 C 436,274 418,296 396,312
               L 372,326 C 354,312 340,292 334,268 C 330,252 333,232 342,218
               L 352,220 L 376,198 C 391,184 401,162 404,136 C 407,108 402,80 388,66 Z`
      },
      temporal: {
        // Lóbulo temporal: debajo de la cisura de Silvio
        main: `M 84,224 C 104,224 138,224 168,226 C 206,228 244,232 274,234
               L 290,232 L 352,220 L 342,218 L 334,268
               C 314,290 288,308 258,315 C 226,323 192,320 160,310
               C 128,300 100,282 82,260 C 72,244 72,230 84,224 Z`
      },

      // ── CORTEZAS FUNCIONALES (tiras sobre los lóbulos) ───────

      motor: {
        // Corteza motora primaria: tira posterior del lóbulo frontal (~18px)
        main: `M 273,16 C 278,16 282,17 285,18
               L 280,234 L 274,234 Z`
      },
      somatosensory: {
        // Corteza somatosensorial: tira anterior del lóbulo parietal (~18px)
        main: `M 285,18 C 290,20 294,22 296,26
               L 290,234 L 280,234 Z`
      },
      prefrontal: {
        // Corteza prefrontal: franja anterior del lóbulo frontal
        main: `M 58,130 C 64,98 80,72 100,52 C 120,32 146,18 176,12
               C 196,8 220,8 242,10
               L 238,180 C 218,178 195,176 172,178
               C 148,180 126,186 108,196 C 94,204 76,215 66,224
               C 62,224 60,224 60,222 C 58,205 56,168 58,130 Z`
      },

      // ── ÁREAS DE LENGUAJE (óvalos pequeños) ─────────────────

      broca: {
        // Área de Broca: frontal inferior izquierdo
        main: `M 130,194 C 134,182 146,176 160,180
               C 173,184 179,196 175,208
               C 171,220 158,225 145,221
               C 132,217 126,206 130,194 Z`
      },
      wernicke: {
        // Área de Wernicke: temporal superior posterior
        main: `M 308,210 C 313,198 325,193 338,198
               C 351,203 356,216 351,228
               C 346,240 333,244 321,240
               C 308,235 302,222 308,210 Z`
      },

      // ── ESTRUCTURAS INFERIORES ───────────────────────────────

      cerebellum: {
        // Cerebelo: estructura separada, posterior-inferior
        main: `M 344,336 C 364,322 392,318 420,328
               C 447,338 465,360 466,384
               C 467,406 452,422 430,427
               C 406,432 378,424 357,410
               C 334,395 322,372 327,350
               C 331,338 338,334 344,336 Z`
      },
      brainstem: {
        // Tronco encefálico: estructura vertical bajo el temporal
        main: `M 244,318 C 256,312 270,310 283,314
               C 296,319 302,332 302,348
               C 302,366 294,382 282,392
               C 269,402 254,404 244,397
               C 233,390 229,374 231,358
               C 232,342 238,326 244,318 Z`
      },

      // ── ESTRUCTURAS PROFUNDAS (visibles en vista lateral) ────

      amygdala: {
        // Amígdala: elipse en región temporal anterior medial
        // Visible como estructura interna en sección lateral
        main: `M 155,272 C 159,260 171,255 183,259
               C 195,263 200,274 197,285
               C 193,296 181,300 170,296
               C 158,291 152,282 155,272 Z`
      },
      hippocampus: {
        // Hipocampo: forma curvada en temporal medial
        main: `M 180,280 C 188,270 204,267 218,272
               C 232,277 238,290 234,302
               C 228,312 215,315 204,311
               C 192,306 182,295 180,280 Z`
      },
      olfactory_bulb: {
        // Bulbo olfatorio: pequeña elipse en polo frontal anterior inferior
        main: `M 60,262 C 63,252 73,248 83,252
               C 93,256 96,265 93,274
               C 89,282 79,285 70,280
               C 60,276 57,270 60,262 Z`
      },
      cingulate: {
        // Corteza cingulada: arco curvado sobre el cuerpo calloso (medial)
        main: `M 115,80 C 140,65 175,58 210,58
               C 248,58 284,66 312,82
               L 308,98 C 282,84 248,76 212,76
               C 178,76 144,82 120,96 Z`
      },
      corpus_callosum: {
        // Cuerpo calloso: banda horizontal central
        main: `M 128,160 C 162,148 200,144 240,144
               C 280,144 318,148 348,162
               L 344,178 C 314,165 278,160 240,160
               C 202,160 164,164 132,176 Z`
      },
    };

    // Surcos decorativos (gyri/sulci)
    this.SULCI = [
      // Surco central (Rolando) — separador frontal/parietal
      { d: 'M 280,16 C 280,60 280,105 280,150 C 280,185 280,210 280,232', w: 1.6, opacity: 0.35 },
      // Cisura de Silvio (lateral) — separador temporal
      { d: 'M 86,223 C 130,220 185,218 235,218 C 275,218 305,220 335,220 C 355,220 368,218 375,214', w: 1.8, opacity: 0.42 },
      // Surco parieto-occipital
      { d: 'M 396,72 C 398,100 400,128 402,152 C 403,168 402,182 398,196', w: 1.4, opacity: 0.3 },
      // Surcos frontales (2)
      { d: 'M 150,18 C 148,48 146,82 146,118 C 146,148 148,172 152,192', w: 0.9, opacity: 0.18 },
      { d: 'M 215,12 C 212,44 210,80 210,116 C 210,146 212,172 215,196', w: 0.9, opacity: 0.18 },
      // Surcos parietales
      { d: 'M 320,30 C 318,58 316,90 318,122 C 320,148 326,168 332,186', w: 0.9, opacity: 0.16 },
      // Surcos temporales
      { d: 'M 110,246 C 145,244 185,242 220,242 C 255,242 285,244 310,248', w: 0.9, opacity: 0.18 },
      { d: 'M 115,268 C 148,266 182,264 215,264 C 248,264 276,266 298,270', w: 0.9, opacity: 0.14 },
      // Surcos cerebelosos
      { d: 'M 340,358 C 368,352 398,352 425,360', w: 0.8, opacity: 0.2 },
      { d: 'M 337,376 C 362,370 392,370 420,378', w: 0.8, opacity: 0.18 },
      { d: 'M 338,393 C 362,388 390,388 414,396', w: 0.8, opacity: 0.16 },
    ];

    // Outline del hemisferio cerebral
    this.BRAIN_OUTLINE = `M 62,224 C 54,196 52,162 58,130 C 64,98 80,72 100,52
      C 120,32 146,18 176,12 C 208,6 246,8 280,16
      C 318,24 356,42 388,66 C 416,88 436,116 447,150
      C 457,184 456,216 446,246 C 436,274 418,296 396,312
      L 372,326 C 352,316 326,296 310,270 C 300,256 294,240 290,232
      L 274,234 C 266,236 258,237 250,237 C 230,238 210,238 190,236
      C 155,233 118,226 88,224 C 80,222 72,222 68,222 Z`;

    this.CEREBELLUM_OUTLINE = `M 344,336 C 364,322 392,318 420,328
      C 447,338 465,360 466,384 C 467,406 452,422 430,427
      C 406,432 378,424 357,410 C 334,395 322,372 327,350
      C 331,338 338,334 344,336 Z`;

    this.BRAINSTEM_OUTLINE = `M 244,318 C 256,312 270,310 283,314
      C 296,319 302,332 302,348 C 302,366 294,382 282,392
      C 269,402 254,404 244,397 C 233,390 229,374 231,358
      C 232,342 238,326 244,318 Z`;

    // Conexión visual tronco-cerebelo
    this.BRAINSTEM_CEREBELLUM_CONNECTOR = `M 287,336 C 300,335 318,334 332,336`;
  }

  // ── RENDER ────────────────────────────────────────────────────

  render() {
    const svg = this.svg;
    svg.innerHTML = '';

    this._addDefs(svg);
    this._addSulci(svg);
    this._addRegions(svg);
    this._addOutlines(svg);
    this._addConnector(svg);
  }

  _addDefs(svg) {
    const defs = this._el('defs');

    // Gradientes de iluminación por región
    BRAIN_REGIONS.forEach(r => {
      const g = this._el('radialGradient');
      g.setAttribute('id', `grad-${r.id}`);
      g.setAttribute('cx', '35%'); g.setAttribute('cy', '35%');
      g.setAttribute('r', '65%');

      const s1 = this._el('stop');
      s1.setAttribute('offset', '0%');
      s1.setAttribute('stop-color', this._lighten(r.color, 30));
      s1.setAttribute('stop-opacity', '0.88');

      const s2 = this._el('stop');
      s2.setAttribute('offset', '100%');
      s2.setAttribute('stop-color', r.color);
      s2.setAttribute('stop-opacity', '0.72');

      g.appendChild(s1); g.appendChild(s2);
      defs.appendChild(g);
    });

    // Filtro glow para selección activa
    const filt = this._el('filter');
    filt.setAttribute('id', 'glow');
    filt.setAttribute('x', '-20%'); filt.setAttribute('y', '-20%');
    filt.setAttribute('width', '140%'); filt.setAttribute('height', '140%');

    const blur = this._el('feGaussianBlur');
    blur.setAttribute('stdDeviation', '5'); blur.setAttribute('result', 'blur');
    const merge = this._el('feMerge');
    const mn1 = this._el('feMergeNode'); mn1.setAttribute('in', 'blur');
    const mn2 = this._el('feMergeNode'); mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1); merge.appendChild(mn2);
    filt.appendChild(blur); filt.appendChild(merge);

    svg.appendChild(defs);
  }

  _addSulci(svg) {
    const g = this._el('g');
    g.setAttribute('class', 'sulci-group');

    this.SULCI.forEach(s => {
      const path = this._el('path');
      path.setAttribute('d', s.d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', `rgba(200,225,255,${s.opacity})`);
      path.setAttribute('stroke-width', s.w);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('class', 'sulcus');
      g.appendChild(path);
    });

    svg.appendChild(g);
  }

  _addRegions(svg) {
    const g = this._el('g');
    g.setAttribute('class', 'regions-group');

    BRAIN_REGIONS.forEach((r, i) => {
      const pathData = this.PATHS[r.id];
      if (!pathData) return;

      const regionG = this._el('g');
      regionG.setAttribute('class', 'brain-region');
      regionG.setAttribute('data-region-id', r.id);
      regionG.style.animationDelay = `${i * 0.06}s`;

      const path = this._el('path');
      path.setAttribute('d', pathData.main);
      path.setAttribute('fill', `url(#grad-${r.id})`);
      path.setAttribute('stroke', r.color);
      path.setAttribute('stroke-width', r.layer === 2 ? '1.5' : '1');
      path.setAttribute('stroke-opacity', '0.5');
      path.setAttribute('stroke-linejoin', 'round');
      path.style.cursor = 'pointer';

      regionG.appendChild(path);

      // Etiquetas para regiones grandes
      if (r.layer === 0 && !['motor','somatosensory'].includes(r.id)) {
        const labelPos = this._getLabelPos(r.id);
        if (labelPos) {
          const text = this._el('text');
          text.setAttribute('x', labelPos.x);
          text.setAttribute('y', labelPos.y);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('class', 'region-label');
          text.textContent = r.short;
          regionG.appendChild(text);
        }
      }

      // Eventos
      regionG.addEventListener('click', e => {
        e.stopPropagation();
        this._handleSelect(r.id);
      });
      regionG.addEventListener('mouseenter', e => this._showTooltip(r, e));
      regionG.addEventListener('mouseleave', () => this._hideTooltip());
      regionG.addEventListener('touchstart', e => {
        e.preventDefault();
        this._handleSelect(r.id);
      }, { passive: false });

      g.appendChild(regionG);
    });

    svg.appendChild(g);
  }

  _addOutlines(svg) {
    // Outline del hemisferio principal
    [
      { d: this.BRAIN_OUTLINE, color: 'rgba(180,215,255,0.22)', w: 2 },
      { d: this.CEREBELLUM_OUTLINE, color: 'rgba(251,191,36,0.3)', w: 1.5 },
      { d: this.BRAINSTEM_OUTLINE, color: 'rgba(244,114,182,0.3)', w: 1.5 },
    ].forEach(o => {
      const path = this._el('path');
      path.setAttribute('d', o.d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', o.color);
      path.setAttribute('stroke-width', o.w);
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
    });
  }

  _addConnector(svg) {
    const path = this._el('path');
    path.setAttribute('d', this.BRAINSTEM_CEREBELLUM_CONNECTOR);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(path);
  }

  // ── INTERACCIÓN ───────────────────────────────────────────────

  _handleSelect(id) {
    if (this.activeId === id) {
      this.deselect();
      return;
    }
    this.activeId = id;
    this._updateVisuals();
    if (this.onSelect) this.onSelect(id);
  }

  deselect() {
    this.activeId = null;
    this._updateVisuals();
    if (this.onDeselect) this.onDeselect();
  }

  selectById(id) {
    this.activeId = id;
    this._updateVisuals();
    if (this.onSelect) this.onSelect(id);
  }

  _updateVisuals() {
    const regions = this.svg.querySelectorAll('.brain-region');
    const activeRegion = BRAIN_REGIONS.find(r => r.id === this.activeId);

    regions.forEach(el => {
      const rid = el.getAttribute('data-region-id');
      el.classList.remove('region-active', 'region-dim', 'region-connected');

      if (!this.activeId) return;

      if (rid === this.activeId) {
        el.classList.add('region-active');
        const rData = BRAIN_REGIONS.find(r => r.id === rid);
        if (rData) {
          el.querySelector('path').style.filter =
            `brightness(1.2) drop-shadow(0 0 10px ${rData.color})`;
        }
      } else if (activeRegion && activeRegion.connections.includes(rid)) {
        el.classList.add('region-connected');
        el.querySelector('path').style.filter = 'brightness(0.88)';
      } else {
        el.classList.add('region-dim');
        el.querySelector('path').style.filter = 'saturate(0.3) brightness(0.5)';
      }
    });

    // Si no hay selección, resetear todo
    if (!this.activeId) {
      regions.forEach(el => {
        el.querySelector('path').style.filter = '';
      });
    }
  }

  _showTooltip(region, event) {
    if (!this.tooltip) return;
    this.tooltip.textContent = region.name;
    this.tooltip.classList.add('visible');

    const container = this.svg.closest('.brain-container');
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.tooltip.style.left = `${x + 12}px`;
    this.tooltip.style.top = `${y - 32}px`;
  }

  _hideTooltip() {
    if (this.tooltip) this.tooltip.classList.remove('visible');
  }

  // ── UTILIDADES ────────────────────────────────────────────────

  _getLabelPos(id) {
    const positions = {
      frontal:     { x: 158, y: 95  },
      parietal:    { x: 340, y: 105 },
      occipital:   { x: 430, y: 185 },
      temporal:    { x: 220, y: 275 },
      cerebellum:  { x: 396, y: 375 },
      brainstem:   { x: 272, y: 360 },
      prefrontal:  { x: 100, y: 148 },
    };
    return positions[id] || null;
  }

  _el(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  _lighten(hex, amount) {
    // Aclara un color hex en `amount` puntos (0–255)
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  }
}
