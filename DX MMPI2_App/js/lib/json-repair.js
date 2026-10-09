/* ============================================
   JSONRepair — lectura tolerante del JSON devuelto por la IA
   Corrige los defectos habituales al copiar desde un chat:
   · bloques ```json … ``` y texto antes/después
   · barras invertidas inválidas (p. ej. «https\://») que añade el chat
   · comillas tipográficas usadas como delimitadores
   · comas finales antes de } o ]
   · saltos de línea y tabulaciones sin escapar dentro de textos
   · caracteres invisibles (BOM, espacios de ancho cero)
   Devuelve { ok, data, fixes:[…], error:{message,line,col,snippet} }
   ============================================ */
const JSONRepair = {
  extract(text) {
    let s = String(text || '').replace(/^﻿/, '').replace(/[​-‍⁠]/g, '');
    const fence = s.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
    if (fence && fence[1].includes('{')) s = fence[1];
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
    return s.trim();
  },

  _try(s) { try { return { ok: true, data: JSON.parse(s) }; } catch (e) { return { ok: false, e }; } },

  /* Recorre el texto respetando cadenas para aplicar arreglos seguros */
  _walk(s, fixes) {
    let out = '', inStr = false, smart = false, n = { esc: 0, ctrl: 0, q: 0 };
    const SQ = '“”„';
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (!inStr) {
        if (c === '"') { inStr = true; smart = false; out += c; continue; }
        if (SQ.includes(c)) { inStr = true; smart = true; n.q++; out += '"'; continue; }
        out += c; continue;
      }
      if (smart && SQ.includes(c) && /^\s*[,:}\]]/.test(s.slice(i + 1, i + 12))) { inStr = false; n.q++; out += '"'; continue; }
      if (smart && c === '"') { out += '\\"'; continue; }
      if (c === '\\') {
        const nx = s[i + 1];
        if (nx === undefined) { i++; continue; }
        if ('"\\/bfnrt'.includes(nx)) { out += c + nx; i++; continue; }
        if (nx === 'u' && /^[0-9a-fA-F]{4}$/.test(s.substr(i + 2, 4))) { out += s.substr(i, 6); i += 5; continue; }
        // Barra inválida: se elimina (p. ej. «\:», «\_», «\*», «\-» añadidas por el chat)
        n.esc++; continue;
      }
      if (c === '"') { inStr = false; out += c; continue; }
      if (c === '\n') { out += '\\n'; n.ctrl++; continue; }
      if (c === '\r') { n.ctrl++; continue; }
      if (c === '\t') { out += '\\t'; n.ctrl++; continue; }
      out += c;
    }
    if (n.q) fixes.push('se corrigieron comillas tipográficas usadas como delimitadores');
    if (n.esc) fixes.push(`se eliminaron ${n.esc} barra(s) invertida(s) inválida(s)`);
    if (n.ctrl) fixes.push(`se escaparon ${n.ctrl} salto(s) de línea o tabulación(es) dentro de textos`);
    return out;
  },

  parse(text) {
    const fixes = [];
    let s = this.extract(text);
    if (!s) return { ok: false, fixes, error: { message: 'No se encontró ningún objeto JSON (falta la llave inicial «{»).' } };
    let r = this._try(s);
    if (r.ok) return { ok: true, data: r.data, fixes };
    // 1-2. Comillas tipográficas delimitadoras, barras inválidas y controles dentro de cadenas
    s = this._walk(s, fixes);
    // 3. Comas finales
    const s3 = s.replace(/,(\s*[}\]])/g, '$1');
    if (s3 !== s) { fixes.push('se quitaron comas finales sobrantes'); s = s3; }
    r = this._try(s);
    if (r.ok) return { ok: true, data: r.data, fixes };
    return { ok: false, fixes, error: this._locate(s, r.e) };
  },

  _locate(s, e) {
    const msg = (e && e.message) || 'JSON inválido';
    let pos = null;
    const m1 = msg.match(/position (\d+)/i); if (m1) pos = parseInt(m1[1], 10);
    const m2 = msg.match(/line (\d+) column (\d+)/i);
    let line = null, col = null;
    if (pos == null && m2) {
      line = +m2[1]; col = +m2[2];
      const lines = s.split('\n'); pos = lines.slice(0, line - 1).reduce((a, l) => a + l.length + 1, 0) + col - 1;
    }
    if (pos != null && line == null) { const before = s.slice(0, pos); line = before.split('\n').length; col = pos - before.lastIndexOf('\n'); }
    const snippet = pos != null ? s.slice(Math.max(0, pos - 60), pos) + ' ⟦aquí⟧ ' + s.slice(pos, pos + 40) : '';
    let hint = '';
    if (/Unexpected end|Unterminated/i.test(msg) || (pos != null && pos >= s.length - 2)) hint = 'El JSON parece cortado: la IA no terminó de escribirlo. Pídale «continúa exactamente donde quedaste» o que lo genere de nuevo más breve.';
    else if (/Expected ',' or '}'|Expected ',' or ']'/i.test(msg)) hint = 'Falta una coma entre dos elementos o sobra texto en ese punto.';
    return { message: msg, line, col, pos, snippet, hint };
  },
};
window.JSONRepair = JSONRepair;
