import { SUBTESTS } from './config.js';
import { ageLabel, esc } from './utils.js';
import { administrationSummary } from './administration.js';

function scoreLabel(score){
  if(score===1) return '1'; if(score===0) return '0'; if(score==='CREDIT') return 'Crédito'; if(score==='SKIP') return 'No administrado'; if(score==='NA') return 'Incidencia/NA'; if(score==='PRESTART') return 'Pendiente decisión'; return '';
}

export function buildProtocolHtml(caseData,result){
  const sections=Object.entries(SUBTESTS).map(([key,cfg])=>{
    if(key==='definiciones' && !result.definitionsActive) return '';
    const s=administrationSummary(caseData,key);
    const rows=(caseData.application.items[key]||[]).map(it=>{const reap=(it.reapplications||[]).map(x=>`Motivo: ${x.reason}; repetida: ${x.repeatedResponse} (${x.repeatedScore})`).join(' | ');return `<tr><td>${it.item}</td><td>${esc(it.response||'')}</td><td>${esc(scoreLabel(it.score))}</td><td>${esc(it.responseSeconds??'')}</td><td>${esc(it.note||'')}</td><td>${esc(reap)}</td></tr>`}).join('');
    return `<section><h2>${esc(cfg.label)}</h2><p><strong>Inicio:</strong> ${esc(s?.startItem??'—')} · <strong>Crédito previo:</strong> ${esc(s?.creditPrior??0)} · <strong>Retorno:</strong> ${s?.returned?'Sí':'No'} · <strong>Cierre:</strong> ${esc(s?.terminationReason||'—')}</p><table><thead><tr><th>Ítem</th><th>Respuesta</th><th>Puntaje/estado</th><th>Seg.</th><th>Observación</th><th>Reaplicación excepcional</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  }).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Protocolo digital K-BIT</title><style>body{font-family:Arial,sans-serif;color:#222;max-width:1000px;margin:30px auto;padding:0 18px}h1,h2{font-family:Georgia,serif}table{width:100%;border-collapse:collapse;margin:12px 0 28px}th,td{border:1px solid #bbb;padding:6px;font-size:12px;text-align:left}th{background:#eef0e9}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}.note{font-size:12px;color:#555}</style></head><body><h1>Protocolo digital K-BIT</h1><div class="meta"><div><strong>Evaluado:</strong> ${esc(caseData.patient.fullName||'')}</div><div><strong>Edad:</strong> ${esc(ageLabel(result.age))}</div><div><strong>Fecha:</strong> ${esc(caseData.evaluation.applicationDate||'')}</div><div><strong>Evaluador:</strong> ${esc(caseData.professional?.fullName||'')}</div></div><p class="note">Documento de registro. Los estados “Crédito” corresponden a ítems previos no administrados acreditados por suficiencia del primer bloque según la ruta automatizada.</p>${sections}</body></html>`;
}

export function buildProtocolCsv(caseData,result){
  const q=v=>`"${String(v??'').replaceAll('"','""')}"`;
  const rows=[['Subtest','Ítem','Respuesta','Puntaje/estado','Tiempo_s','Observación','Reaplicacion_excepcional']];
  for(const [key,cfg] of Object.entries(SUBTESTS)){
    if(key==='definiciones' && !result.definitionsActive) continue;
    for(const it of caseData.application.items[key]||[]){const reap=(it.reapplications||[]).map(x=>`Motivo: ${x.reason}; repetida: ${x.repeatedResponse} (${x.repeatedScore})`).join(' | ');rows.push([cfg.label,it.item,it.response||'',scoreLabel(it.score),it.responseSeconds??'',it.note||'',reap]);}
  }
  return rows.map(r=>r.map(q).join(',')).join('\n');
}

export function protocolSummaryText(caseData,result){
  const keys=['vocabExpresivo',...(result.definitionsActive?['definiciones']:[]),'matrices'];
  return keys.map(k=>{const s=administrationSummary(caseData,k);return `${SUBTESTS[k].label}: inicio ${s?.startItem??'—'}, crédito ${s?.creditPrior??0}, retorno ${s?.returned?'sí':'no'}, cierre ${s?.terminationReason||'pendiente'}.`;}).join(' ');
}
