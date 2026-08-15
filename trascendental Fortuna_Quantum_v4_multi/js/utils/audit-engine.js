(function () {
  'use strict';


  function secureSeed() {
    const buffer = new Uint32Array(1);
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(buffer);
      return buffer[0] >>> 0;
    }
    return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
  }

  function parseFormat(config) {
    const text = String(config || '').toLowerCase();
    const primary = text.match(/(\d+)\s*(?:n[uú]meros?|estados?|valores?)?[^\d]{0,30}(?:del|de un universo de)\s*(\d+)\s*(?:al|-|hasta|,|\sde\s)?\s*(\d+)?/i);
    const compact = text.match(/(\d+)\s*\/\s*(\d+)/);
    const digits = text.match(/(\d+)\s*d[ií]gitos?/i);

    if (compact) {
      return {
        kind: 'set',
        count: Number(compact[1]),
        min: 1,
        max: Number(compact[2]),
        unique: true,
        verifiedByParser: true
      };
    }

    if (primary) {
      const count = Number(primary[1]);
      const first = Number(primary[2]);
      const third = primary[3] ? Number(primary[3]) : null;
      const min = third ? first : 1;
      const max = third || first;
      if (count > 0 && max >= min && max - min + 1 >= count) {
        return { kind: 'set', count, min, max, unique: !/con repetir/i.test(text), verifiedByParser: true };
      }
    }

    if (digits) {
      return { kind: 'digits', digits: Number(digits[1]), verifiedByParser: true };
    }

    return { kind: 'unknown', verifiedByParser: false };
  }

  function drawUnique(format, random) {
    const pool = [];
    for (let value = format.min; value <= format.max; value += 1) pool.push(value);
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }
    return pool.slice(0, format.count).sort((a, b) => a - b);
  }

  function drawDigits(format, random) {
    return Array.from({ length: format.digits }, () => Math.floor(random() * 10));
  }

  function standardDeviation(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  function metrics(values, format) {
    const numericValues = values.map(Number);
    const sum = numericValues.reduce((total, value) => total + value, 0);
    const sorted = [...numericValues].sort((a, b) => a - b);
    const adjacentPairs = sorted.slice(1).reduce((count, value, index) => count + (value - sorted[index] === 1 ? 1 : 0), 0);
    const parity = numericValues.reduce((acc, value) => {
      acc[value % 2 === 0 ? 'even' : 'odd'] += 1;
      return acc;
    }, { even: 0, odd: 0 });

    const result = {
      size: numericValues.length,
      sum,
      mean: Number((sum / numericValues.length).toFixed(2)),
      minimumObserved: Math.min(...numericValues),
      maximumObserved: Math.max(...numericValues),
      span: Math.max(...numericValues) - Math.min(...numericValues),
      standardDeviation: Number(standardDeviation(numericValues).toFixed(2)),
      parity,
      adjacentPairs
    };

    if (format.kind === 'set') {
      const width = format.max - format.min + 1;
      const cut1 = format.min + Math.ceil(width / 3) - 1;
      const cut2 = format.min + Math.ceil((2 * width) / 3) - 1;
      result.tertiles = numericValues.reduce((acc, value) => {
        if (value <= cut1) acc.low += 1;
        else if (value <= cut2) acc.middle += 1;
        else acc.high += 1;
        return acc;
      }, { low: 0, middle: 0, high: 0 });
    }

    return result;
  }

  function labelSet(data) {
    const selected = new Set(data.matrices || []);
    const labels = [];
    if (selected.has('random')) labels.push('Control aleatorio');
    if (selected.has('historical')) labels.push('Control para contraste histórico');
    if (selected.has('numerology')) labels.push('Resonancia numerológica');
    if (selected.has('celestial') || selected.has('temporal')) labels.push('Capa celeste-temporal');
    if (selected.has('spatial') || selected.has('textual') || selected.has('gestural')) labels.push('Capa simbólica-participativa');
    if (selected.has('integrative')) labels.push('Síntesis relacional');
    while (labels.length < Number(data.combinationCount || 5)) labels.push(`Control experimental ${labels.length + 1}`);
    return [...new Set(labels)].slice(0, Number(data.combinationCount || 5));
  }

  function buildAuditPacket(data) {
    const format = parseFormat(data.config);
    const labels = labelSet(data);
    const privateSalt = secureSeed();
    const runSeed = window.FQ_RANDOM.deriveSeed([
      privateSalt,
      data.drawDate,
      data.drawTime,
      data.mode,
      data.gestureSeed,
      data.config
    ]);

    const samples = labels.map((label, index) => {
      const seed = window.FQ_RANDOM.deriveSeed([
        runSeed,
        label,
        index,
        data.userName,
        data.significantWord,
        data.significantDate,
        data.direction,
        data.symbol
      ]);
      const random = window.FQ_RANDOM.mulberry32(seed);
      const values = format.kind === 'set'
        ? drawUnique(format, random)
        : format.kind === 'digits'
          ? drawDigits(format, random)
          : Array.from({ length: 5 }, () => Math.floor(random() * 100));
      const fingerprint = window.FQ_RANDOM.shortSeed(window.FQ_RANDOM.fnv1a(`${label}|${values.join(',')}|${seed}`));
      return {
        id: `FQ-${String(index + 1).padStart(2, '0')}`,
        label,
        fingerprint,
        metrics: metrics(values, format)
      };
    });

    const packetFingerprint = window.FQ_RANDOM.shortSeed(
      window.FQ_RANDOM.fnv1a(samples.map(sample => `${sample.id}:${sample.fingerprint}`).join('|'))
    );

    return {
      schema: 'FQ-LAB-AUDIT/1.0',
      runId: `RUN-${packetFingerprint}`,
      createdAt: new Date().toISOString(),
      format: {
        raw: data.config,
        parsed: format,
        note: format.verifiedByParser
          ? 'Estructura reconocida localmente.'
          : 'Formato no reconocido por el analizador local; requiere revisión manual.'
      },
      samples,
      sourceStatus: {
        historical: (data.matrices || []).includes('historical')
          ? 'Requiere dataset verificable; el control local no se presenta como histórico.'
          : 'No seleccionado.',
        celestial: (data.matrices || []).includes('celestial')
          ? 'Requiere efemérides verificables; el control local no se presenta como astronomía.'
          : 'No seleccionado.'
      },
      disclosure: 'El paquete conserva métricas y huellas de integridad. No revela estados individuales ni reconstruye una selección comercial.'
    };
  }

  function formatAuditPacket(packet) {
    const lines = [
      `Paquete: ${packet.schema}`,
      `Ejecución: ${packet.runId}`,
      `Formato: ${packet.format.raw}`,
      `Lectura local: ${packet.format.note}`,
      ''
    ];
    packet.samples.forEach(sample => {
      const m = sample.metrics;
      lines.push(`${sample.id} · ${sample.label}`);
      lines.push(`Huella: ${sample.fingerprint} · tamaño ${m.size} · suma ${m.sum} · media ${m.mean} · amplitud ${m.span}`);
      lines.push(`Paridad: ${m.parity.even} pares / ${m.parity.odd} impares · consecutivos: ${m.adjacentPairs}`);
      if (m.tertiles) lines.push(`Tercios: ${m.tertiles.low} bajo / ${m.tertiles.middle} medio / ${m.tertiles.high} alto`);
      lines.push('');
    });
    return lines.join('\n').trim();
  }

  window.FQ_AUDIT_ENGINE = { parseFormat, buildAuditPacket, formatAuditPacket };
})();
