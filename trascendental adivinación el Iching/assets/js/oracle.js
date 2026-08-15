// oracle.js — mecánica del I Ching: monedas, hexagramas, mutación y reglas de lectura.
import { HEX, TRIGRAMS } from "./data.js";

// índice líneas(base→cima) -> número de hexagrama
const BY_LINES = {};
for (const n in HEX) BY_LINES[HEX[n].lines.join("")] = +n;

export function rndBit(){
  if (window.crypto && crypto.getRandomValues){ const a=new Uint8Array(1); crypto.getRandomValues(a); return a[0]&1; }
  return Math.random()<0.5 ? 0 : 1;
}

// Una línea = tres monedas. cara=yin=2, cruz=yang=3. Suma 6..9.
export function tossLine(){
  const c=[rndBit(),rndBit(),rndBit()];
  const value=c.reduce((s,t)=>s+(t?3:2),0);
  return { coins:c, value };
}

export function lineInfo(value){
  return {
    yang: value===7 || value===9,
    moving: value===6 || value===9,
    kind: value===9?"viejo-yang" : value===6?"viejo-yin" : value===7?"joven-yang":"joven-yin",
    mark: value===9?"○" : value===6?"✕" : ""
  };
}

export function hexFromLines(linesB2T){ return BY_LINES[linesB2T.join("")] ?? null; }

// Resuelve una tirada de 6 valores (base→cima) en hexagrama principal, derivado y mutantes.
export function resolve(values){
  const lines = values.map(v => (v===7||v===9)?1:0);          // base→cima
  const moving = values.map((v,i)=> (v===6||v===9)?i:-1).filter(i=>i>=0);
  const primary = hexFromLines(lines);
  let derived = null, derivedLines = null;
  if (moving.length){
    derivedLines = lines.slice();
    moving.forEach(i => derivedLines[i] = derivedLines[i]?0:1);
    const d = hexFromLines(derivedLines);
    if (d && d!==primary) derived = d;
  }
  return { values, lines, moving, primary, derived, derivedLines };
}

// Reglas clásicas (Zhu Xi) para decidir qué leer según el nº de líneas mutantes.
// Devuelve {focus:'tuan'|'lines', lines:[idx...], note} con la(s) línea(s) regente(s).
export function readingRule(r){
  const m = r.moving;
  const n = m.length;
  if (n===0) return { focus:"tuan", lines:[], regent:null, note:"Sin líneas mutantes: se lee el Dictamen del hexagrama principal." };
  if (n===1) return { focus:"lines", lines:[m[0]], regent:m[0], note:"Una línea mutante: ella rige la lectura." };
  if (n===2){ const reg=m[1]; return { focus:"lines", lines:m, regent:reg, note:"Dos líneas mutantes: rige la superior (línea "+(reg+1)+")." }; }
  if (n===3){ const reg=m[1]; return { focus:"lines", lines:m, regent:reg, note:"Tres líneas mutantes: rige la del medio (línea "+(reg+1)+"); se consideran ambos hexagramas." }; }
  if (n===4){
    const fixed=[0,1,2,3,4,5].filter(i=>!m.includes(i));
    return { focus:"derived-lines", lines:fixed, regent:fixed[0], note:"Cuatro líneas mutantes: se leen las dos quietas del derivado; rige la inferior (línea "+(fixed[0]+1)+")." };
  }
  if (n===5){
    const fixed=[0,1,2,3,4,5].filter(i=>!m.includes(i));
    return { focus:"derived-lines", lines:fixed, regent:fixed[0], note:"Cinco líneas mutantes: rige la única línea quieta del derivado (línea "+(fixed[0]+1)+")." };
  }
  return { focus:"derived-tuan", lines:[], regent:null, note:"Seis líneas mutantes: el asunto se transforma por completo; se lee el Dictamen del hexagrama derivado." };
}

export function trigram(n){ return TRIGRAMS.find(t=>t.n===n); }
export function hex(n){ return HEX[n]; }
