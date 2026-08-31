import { calculateChronologicalAge, monthRangeLabel } from './utils.js';
import { administrationSummary, effectiveScore } from './administration.js';

export async function loadNorms() {
  const res = await fetch('./data/baremos-kbit.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`No se pudieron cargar los baremos (${res.status}).`);
  return res.json();
}

function findRange(rows, ageMonths, raw) { return rows.find(r => ageMonths >= r[0] && ageMonths <= r[1] && raw >= r[2] && raw <= r[3]) || null; }
function findComposite(rows, sum) { return rows.find(r => sum >= r[0] && sum <= r[1]) || null; }
function findBand(rows, ageMonths, confidence) { return rows.find(r => ageMonths >= r[0] && ageMonths <= r[1] && Number(r[2]) === Number(confidence)) || null; }
function findInterpretation(rows, pt) { return rows.find(r => Number(r[0]) === Number(pt)) || null; }
function findDifference(rows, ageMonths) { return rows.find(r => ageMonths >= r[0] && ageMonths <= r[1]) || null; }
function directScore(items) { return items.reduce((acc,item)=>acc+effectiveScore(item),0); }

function itemStats(items) {
  return items.reduce((s,item)=>{
    if(item.score === '' || item.score === null || item.score === undefined || item.score === 'PRESTART') s.pending += 1;
    else if(item.score === 'CREDIT') s.credit += 1;
    else if(item.score === 'SKIP' || item.score === 'NA') s.skipped += 1;
    else if(Number(item.score) === 1) s.correct += 1;
    else if(Number(item.score) === 0) s.incorrect += 1;
    return s;
  },{correct:0,incorrect:0,credit:0,skipped:0,pending:0});
}

export function calculateCase(caseData,norms){
  const age=calculateChronologicalAge(caseData.patient.birthDate,caseData.evaluation.applicationDate);
  const ageMonths=age?.totalMonths ?? null;
  const definitionsActive=ageMonths!==null && ageMonths>=96;
  const exp=directScore(caseData.application.items.vocabExpresivo);
  const def=definitionsActive?directScore(caseData.application.items.definiciones):0;
  const mat=directScore(caseData.application.items.matrices);
  const a=caseData.application.adjustments||{};
  const vocabRawCalculated=exp+def;
  const matricesRawCalculated=mat;
  const vocabRaw=a.vocabOverride!==''&&a.vocabOverride!==null?Number(a.vocabOverride):vocabRawCalculated;
  const matricesRaw=a.matricesOverride!==''&&a.matricesOverride!==null?Number(a.matricesOverride):matricesRawCalculated;

  const protocol={
    vocabExpresivo:administrationSummary(caseData,'vocabExpresivo'),
    definiciones:administrationSummary(caseData,'definiciones'),
    matrices:administrationSummary(caseData,'matrices'),
    ageMismatch:!!caseData.application.protocol?.ageMismatch,
    events:caseData.application.protocol?.events||[]
  };

  const result={
    age,ageMonths,definitionsActive,
    raw:{exp,def,vocabCalculated:vocabRawCalculated,matricesCalculated:matricesRawCalculated,vocab:vocabRaw,matrices:matricesRaw},
    stats:{vocabExpresivo:itemStats(caseData.application.items.vocabExpresivo),definiciones:itemStats(caseData.application.items.definiciones),matrices:itemStats(caseData.application.items.matrices)},
    protocol,validAge:false,normBand:null,verbal:null,nonverbal:null,composite:null,difference:null,warnings:[]
  };

  if(ageMonths===null){result.warnings.push('Falta una fecha de nacimiento y/o una fecha de aplicación válida.');return result;}
  const ageProbe=norms.verbal.find(r=>ageMonths>=r[0]&&ageMonths<=r[1]);
  if(!ageProbe){result.warnings.push('La edad calculada no está cubierta por los baremos C.1 incorporados.');return result;}
  result.validAge=true;result.normBand={min:ageProbe[0],max:ageProbe[1],label:monthRangeLabel(ageProbe[0],ageProbe[1])};

  const ps=caseData.application.protocol?.subtests;
  if(ps){
    if(!ps.vocabExpresivo?.completed) result.warnings.push('Vocabulario expresivo aún no ha cerrado su ruta de administración.');
    if(definitionsActive&&!ps.definiciones?.completed) result.warnings.push('Definiciones aún no ha cerrado su ruta de administración.');
    if(!ps.matrices?.completed) result.warnings.push('Matrices aún no ha cerrado su ruta de administración.');
    if(caseData.application.protocol?.ageMismatch) result.warnings.push('La edad cambió después de iniciar la administración. Reinicie el protocolo para recalcular los puntos de inicio.');
  }
  if(a.vocabOverride!==''||a.matricesOverride!=='') result.warnings.push(`Existe una anulación manual de puntuación directa${a.overrideReason?`: ${a.overrideReason}`:'.'}`);

  const vr=findRange(norms.verbal,ageMonths,vocabRaw);
  const nr=findRange(norms.nonverbal,ageMonths,matricesRaw);
  if(!vr) result.warnings.push(`No se encontró conversión verbal para bruto ${vocabRaw} en el tramo ${result.normBand.label}.`);
  if(!nr) result.warnings.push(`No se encontró conversión no verbal para bruto ${matricesRaw} en el tramo ${result.normBand.label}.`);

  if(vr){
    const interp=findInterpretation(norms.interpretation,vr[4]);const band=findBand(norms.bands,ageMonths,caseData.scoring.confidence);
    result.verbal={raw:vocabRaw,pt:vr[4],percentile:vr[5],category:interp?.[2]||'',normalEquivalent:interp?.[3]||'',stanine:interp?.[4]??'',band:band?.[3]??null};
    if(result.verbal.band!==null) result.verbal.ic=[result.verbal.pt-result.verbal.band,result.verbal.pt+result.verbal.band];
  }
  if(nr){
    const interp=findInterpretation(norms.interpretation,nr[4]);const band=findBand(norms.bands,ageMonths,caseData.scoring.confidence);
    result.nonverbal={raw:matricesRaw,pt:nr[4],percentile:nr[5],category:interp?.[2]||'',normalEquivalent:interp?.[3]||'',stanine:interp?.[4]??'',band:band?.[4]??null};
    if(result.nonverbal.band!==null) result.nonverbal.ic=[result.nonverbal.pt-result.nonverbal.band,result.nonverbal.pt+result.nonverbal.band];
  }
  if(result.verbal&&result.nonverbal){
    const sum=result.verbal.pt+result.nonverbal.pt;const cr=findComposite(norms.composite,sum);
    if(cr){const interp=findInterpretation(norms.interpretation,cr[2]);const band=findBand(norms.bands,ageMonths,caseData.scoring.confidence);result.composite={sum,ci:cr[2],percentile:cr[3],category:interp?.[2]||'',normalEquivalent:interp?.[3]||'',stanine:interp?.[4]??'',band:band?.[5]??null};if(result.composite.band!==null) result.composite.ic=[result.composite.ci-result.composite.band,result.composite.ci+result.composite.band];}
    else result.warnings.push(`No se encontró conversión compuesta para suma de típicos ${sum}.`);
    const dr=findDifference(norms.differences,ageMonths);if(dr){const signed=result.verbal.pt-result.nonverbal.pt;const absolute=Math.abs(signed);result.difference={signed,absolute,p05Threshold:dr[2],p01Threshold:dr[3],significant05:absolute>=dr[2],significant01:absolute>=dr[3],direction:signed>0?'Verbal > No verbal':signed<0?'No verbal > Verbal':'Sin diferencia'};}
  }
  return result;
}

export function isAdministrationComplete(caseData,result){
  const ps=caseData.application.protocol?.subtests;
  if(ps) return !!ps.vocabExpresivo?.completed && (!!ps.definiciones?.completed || !result.definitionsActive) && !!ps.matrices?.completed;
  return false;
}
