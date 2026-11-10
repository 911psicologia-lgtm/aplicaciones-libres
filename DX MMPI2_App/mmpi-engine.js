/* Motor 17.0. Respuestas: 1 verdadero, 2 falso, 3 omisión deliberada. */
(function(root){
  'use strict';
  const D=root.MMPI2_DATA, O=root.MMPI2_ORIGINAL_DATA, VERSION='17.0-motor-2026.10';
  const K={Hs:.5,Pd:.4,Pt:1,Sc:1,Ma:.2};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numeric=v=>typeof v==='number'&&Number.isFinite(v);
  const sourceData=source=>source==='anterior'?O:D;
  const key=(code,sex='F',source,country='US')=>{const k=sourceData(source).keys[code];return k?.by_sex?k.by_sex[country==='ES'&&sex==='F'&&k.by_sex.ES_F?'ES_F':sex]:k;};
  const isAnswered=v=>v===1||v===2;
  function raw(code,responses={},sex='F',source,country='US'){
    if(code==='?')return Array.from({length:567},(_,i)=>i+1).filter(i=>!isAnswered(responses[i])).length;
    const k=key(code,sex,source,country);if(!k)return null;
    if(k.pairs)return k.pairs.reduce((n,[a,ra,b,rb])=>n+(responses[a]===ra&&responses[b]===rb?1:0),0);
    if(k.positive_pairs)return k.offset+k.positive_pairs.filter(([a,b])=>responses[a]===1&&responses[b]===1).length-k.negative_pairs.filter(([a,b])=>responses[a]===2&&responses[b]===2).length;
    if(!Array.isArray(k.T)||!Array.isArray(k.F))return null;
    return k.T.filter(i=>responses[i]===1).length+k.F.filter(i=>responses[i]===2).length;
  }
  function details(code,responses={},sex='F',source,country='US'){
    const k=key(code,sex,source,country);if(!k)return {items:null,omitted:null,matched:[]};
    const pairs=k.pairs||[...(k.positive_pairs||[]).map(([a,b])=>[a,1,b,1]),...(k.negative_pairs||[]).map(([a,b])=>[a,2,b,2])];
    const ids=pairs.length?[...new Set(pairs.flatMap(p=>[p[0],p[2]]))]:[...k.T,...k.F];
    return {items:k.item_count??ids.length,pairs:k.pair_count,omitted:ids.filter(i=>!isAnswered(responses[i])).length,matched:pairs.length?[]:[...k.T.filter(i=>responses[i]===1),...k.F.filter(i=>responses[i]===2)].sort((a,b)=>a-b)};
  }
  function conversion(code,pd,sex='F',country='US',source){
    const ds=sourceData(source), n=ds.norms[country]?.[code], cells=n?.[sex];
    const pending=(reason,status='T no disponible')=>({T:null,t_display:'—',status,reason,norm_label:country==='ES'?'España · tabla pendiente':'Sin tabla documentada'});
    if(!['M','F'].includes(sex))return pending('Falta seleccionar el sexo de la tabla normativa.');
    if(ds.blockedNorms[country])return pending(ds.blockedNorms[country]);
    const k=key(code,sex,source,country);
    if(!k||pd==null)return pending('Clave no disponible o incompleta.','Clave no disponible');
    const max=k.item_count!=null?k.item_count+Math.round(30*(K[code]||0)):code==='TRIN'?23:67;
    if(!Number.isInteger(pd)||pd<0||pd>max)return pending('La PD no es válida para esta clave.','PD inválida');
    if(!cells||!Object.keys(cells).length)return pending('El baremo no contiene una tabla para esta escala.');
    const src=n.sources?.[sex]||n.source;
    const norm_label=(src?.country==='MX'?'México':'EE. UU.')+(n.fallback?' · referencia estadounidense para México':'')+' · '+(src?.table||'Datos del ZIP anterior');
    const indices=Object.keys(cells).map(Number).sort((a,b)=>a-b),lo=indices[0],hi=indices.at(-1);
    let T=cells[String(pd)],bound=null;
    if(T==null&&pd>hi&&cells[hi]>=95){T=cells[hi];bound='≥';}
    if(T==null&&source==='anterior'&&(pd<lo||pd>hi)){T=cells[pd<lo?lo:hi];bound=((pd<lo)!==(code==='Mf'&&sex==='F'))?'≤':'≥';}
    if(!numeric(T))return {T:null,t_display:'—',status:'PD fuera de tabla',reason:'No se interpola ni se inventa una T para una PD ausente.',norm_label,source:src};
    const direction=code==='TRIN'?(pd<9?'F':pd>9?'V':''):'';
    return {T,t_display:(bound||'')+T+direction+(bound&&source!=='anterior'?'*':''),bound,direction,status:bound?'Tope de tabla · verificar':'T documentada',norm_label,source:src,verify:!!bound};
  }
  function level(t,code){
    if(!numeric(t))return null;
    return t>=75?'muy-elevada':t>=70?'muy-alta':t>=65?'elevada':t>=60?'atencion':t>=56?'superior':t<=39?'baja':'normal';
  }
  const levelNames={'muy-elevada':'Muy alto · elevación marcada','muy-alta':'Muy alto',elevada:'Alto',atencion:'Alto · moderado',superior:'Promedio superior',normal:'Medio',baja:'Bajo'};
  function score(responses={},sex='F',country='US',source='manual'){
    const ds=sourceData(source),omitted=raw('?',responses),kRaw=raw('K',responses,sex,source);
    const missing=Array.from({length:567},(_,i)=>i+1).filter(i=>![1,2,3].includes(responses[i])).length;
    const scores=[{code:'?',description:'Omisiones',raw:omitted,rawK:omitted,T:null,t_display:'—',status:'Recuento',norm_label:'No requiere baremo',items:567,omitted,matched:[],provisional:omitted>0}];
    for(const codes of Object.values(D.groups))for(const code of codes){
      if(code==='?')continue;
      const pd=raw(code,responses,sex,source,country),added=K[code]?(numeric(kRaw)?Math.round(kRaw*K[code]):null):0;
      const rawK=pd!=null&&added!=null?pd+added:null;
      const cv=conversion(code,rawK,sex,country,source);
      scores.push({code,description:D.catalog[code]?.description||code,raw:pd,rawK,kAdded:added,hasK:!!K[code],...cv,level:level(cv.T,code),...details(code,responses,sex,source,country),provisional:omitted>0});
    }
    for(const s of scores){const parent=D.catalog[s.code]?.parent||(D.catalog[s.code]?.group==='harris_lingoes'?s.code.replace(/\d+$/,''):null);if(parent){s.parent=parent;s.parentT=scores.find(r=>r.code===parent)?.T;}}
    return {scores,kRaw,fkIndex:raw('F',responses,sex,source)!=null&&kRaw!=null?raw('F',responses,sex,source)-kRaw:null,omitted,missing,answered:567-omitted,country,sex,source,version:VERSION};
  }
  function validity(scores){
    const get=c=>scores.find(s=>s.code===c),t=c=>get(c)?.T;
    const omitted=get('?')?.raw??567,messages=[],fk=(get('F')?.raw??0)-(get('K')?.raw??0);let severity=0;
    const add=(text,s=1)=>{messages.push(text);severity=Math.max(severity,s);};
    if(omitted>=30)add(`${omitted} omisiones: protocolo no interpretable según el manual adjunto.`,2);
    else if(omitted>=10)add(`${omitted} omisiones: interpretar con cautela; las escalas afectadas pueden estar reducidas.`);
    else if(omitted>0)add(`${omitted} omisiones: revisar las escalas afectadas.`,1);
    for(const c of ['VRIN','TRIN'])if(t(c)>=80)add(`${c}: T=${get(c).t_display}. Inconsistencia invalidante según el manual.`,2);else if(t(c)>=70)add(`${c}: T=${get(c).t_display}. Revisar consistencia y condiciones de aplicación.`);
    if(t('F')>90)add(`F: T=${get('F').t_display}. La regla conservadora del manual adjunto suspende la interpretación. El valor aislado no acredita simulación.`,2);
    if(t('Fp')>=100)add(`Fp: T=${get('Fp').t_display}. Revisar sobrerreporte e información clínica antes de interpretar.`,2);
    if(t('L')>=80)add(`L: T=${get('L').t_display}. Defensividad invalidante según el manual.`,2);
    else if(t('L')>=65)add(`L: T=${get('L').t_display}. Explorar presentación favorable.`);
    if(t('K')>=65||t('S')>=70||fk<=-11)add('Posible minimización; las elevaciones podrían estar atenuadas. Contrastar K, S e índice F−K.');
    if((t('F')>=80&&t('F')<=90)||(t('Fp')>=70&&t('Fp')<100)||fk>=11)add('Posible amplificación o malestar intenso. Contrastar entrevista, consistencia, funcionamiento e índice F−K.');
    if(numeric(t('K'))&&t('K')<=40)add('K ≤ 40: explorar actitud autocrítica, malestar y recursos defensivos.',0);
    const missing=scores.filter(s=>s.code!=='?'&&s.T==null);
    if(missing.length){const core=new Set([...D.groups.validez,'Hs','D','Hy','Pd','Pa','Pt','Sc','Ma']);add('Conversiones T no disponibles: '+missing.map(s=>s.code).join(', ')+'. La lectura de esas escalas queda pendiente.',missing.some(s=>core.has(s.code))?2:1);}
    if(scores.some(s=>s.verify))add('Hay topes de tabla señalados con ≥ y *. Verificar en la fuente antes de concluir.');
    return {messages,blocked:severity>=2,caution:severity===1,severity,verdict:severity>=2?'No interpretable':severity===1?'Interpretable con cautela':'Interpretable',fkIndex:fk};
  }
  function orientation(s,blocked=false){
    if(s.code==='?')return `${s.raw} omisiones de 567 ítems.`;
    if(s.T==null)return s.reason||'T no disponible.';
    if(D.groups.validez.includes(s.code))return 'Índice de estilo de respuesta: consulte sus criterios específicos y los avisos del conjunto de validez; el umbral clínico general T=65 no determina su interpretación.';
    if(blocked)return 'Lectura clínica suspendida; revisar primero la validez del protocolo.';
    if(s.parent&&(s.parentT==null||s.parentT<60))return `Lectura orientativa; la escala madre ${s.parent} no alcanza T=60.`;
    if(['Mf','GM','GF'].includes(s.code))return 'Intereses y roles; esta puntuación no representa patología ni identifica orientación sexual.';
    if(s.T<=39){
      const low={Es:'Recursos de afrontamiento percibidos limitados; contrastar funcionamiento y apoyos.',DISC:'Mayor control e inhibición declarados; contextualizar.',INTR:'Mayor sociabilidad y emocionalidad positiva declaradas.',Si:'Menor reserva social declarada.'};
      return low[s.code]||'Puntuación baja; no inferir el rasgo opuesto ni ausencia de dificultades.';
    }
    if(s.T<60)return 'Sin elevación clínica en esta escala; integrar con el perfil y la entrevista.';
    const desc=D.manual.descriptors[s.code]?.high||D.guides[s.code]?.theme||s.description;
    return (s.T>=65?'Explorar: ':'Tendencia moderada; contrastar: ')+desc;
  }
  function synthesis(scores){
    const v=validity(scores),candidates=scores.filter(s=>!D.groups.validez.includes(s.code)&&!['Mf','GM','GF'].includes(s.code)&&numeric(s.T));
    return {general:`${v.verdict}. ${candidates.filter(s=>s.T>=65).length} escalas y subescalas con T≥65. Las facetas no equivalen a diagnósticos independientes.`,elevated:candidates.filter(s=>s.T>=65).sort((a,b)=>b.T-a.T),attention:candidates.filter(s=>s.T>=60&&s.T<65),low:candidates.filter(s=>s.T<=39),contextual:scores.filter(s=>['Mf','GM','GF'].includes(s.code)),validity:scores.filter(s=>D.groups.validez.includes(s.code)),invalidity:v.messages,blocked:v.blocked,verdict:v.verdict,caution:v.caution,sourceNote:D.manual.limitations};
  }
  function clusters(scores,country='US'){
    if(country==='ES')return [];
    const get=c=>scores.find(s=>s.code===c),maps={A:['PSYC'],B:['AGGR','DISC'],C:['NEGE','INTR']};
    if(get('NEGE')?.T>=65&&(get('AGGR')?.T>=60||get('DISC')?.T>=60))maps.B.push('NEGE');
    return Object.entries(maps).map(([cluster,codes])=>{const rows=codes.map(get),values=rows.filter(r=>numeric(r?.T)).map(r=>r.T),T=values.length?Math.max(...values):null;return {cluster,codes,references:rows.map(r=>`${r?.code}: ${r?.t_display||'—'}`).join(', '),T,level:T==null?'Sin datos':T>=65?'Elevado':T>=60?'Moderado':'Sin elevación',traits:{A:'Desconfianza, distancia emocional o experiencias inusuales.',B:'Impulsividad, dominancia o dificultad de control.',C:'Inseguridad, temor, inhibición y emocionalidad negativa.'}[cluster]};});
  }
  function critical(responses={},sex='F'){
    const rows=D.manual.critical.map(g=>{const matches=g.keys.filter(k=>responses[k.item]===(k.responseBySex?.[sex]||k.response));const unknown=g.keys.filter(k=>!isAnswered(responses[k.item])).length,count=matches.length,total=g.keys.length,ratio=count/total;return {name:g.name,series:g.series,count,total,unknown,ratio,concentration:count===0?'Sin reconocimiento':count<2||ratio<.25?'Aislada':ratio<.5?'Moderada':'Marcada',matched:matches.map(k=>k.item),source:g.source};});
    return {rows,suicideItems:[506,520,524].filter(i=>responses[i]===1),note:'Concentración descriptiva, sin baremo ni diagnóstico. Cada respuesta requiere indagación directa; la ausencia de reconocimiento no descarta riesgo.'};
  }
  function profileCode(scores){
    const numbers={Hs:1,D:2,Hy:3,Pd:4,Pa:6,Pt:7,Sc:8,Ma:9};
    const ranks=scores.filter(s=>numbers[s.code]&&numeric(s.T)&&!s.bound).sort((a,b)=>b.T-a.T);
    const high=ranks.filter(s=>s.T>=65),top=high.slice(0,2),code=top.map(s=>numbers[s.code]).join('-');
    const canonical=top.map(s=>numbers[s.code]).sort((a,b)=>a-b).join('-');
    return {code:code||'Sin código elevado',defined:top.length===2&&(!ranks[2]||top[1].T-ranks[2].T>=5),scales:top.map(s=>s.code),descriptor:D.manual.twoPoint[canonical]||top.map(s=>s.description).join(' y '),note:top.length<2?'No hay dos escalas codificables con T≥65.':ranks[2]&&top[1].T-ranks[2].T<5?'Código poco definido: revisar también la tercera escala.':'Segunda escala separada de la tercera por al menos 5 T.'};
  }
  function configurations(scores){
    const t=c=>scores.find(s=>s.code===c)?.T,result=[];
    if(t('Hs')>=65&&t('Hy')>=65&&t('D')<Math.min(t('Hs'),t('Hy'))-5)result.push('V de conversión: explorar expresión somática del malestar.');
    if(t('F')>70&&t('L')<50&&t('K')<50)result.push('Petición de ayuda: reconocimiento abierto de malestar; contrastar posible amplificación.');
    if(t('Pd')>=65&&t('Ma')>=65)result.push('Configuración 4-9: explorar impulsividad y relación con normas.');
    if(t('Pa')>=65&&t('Sc')>=65)result.push('Pa–Sc: explorar suspicacia y experiencias de pensamiento.');
    if(t('Pt')>=65&&t('Sc')>=65)result.push('Pt–Sc: explorar malestar intenso, rumiación e inseguridad.');
    if(t('L')>60&&t('K')>60&&t('F')<50)result.push('Perfil defensivo: elevaciones posiblemente atenuadas.');
    return result;
  }
  function signature(c){const p=c.patient||{};return JSON.stringify([VERSION,p.sex,p.baremo||'US',p.calculationSource||'manual',c.responses||{}]);}
  function snapshot(c,reason){return {recordedAt:new Date().toISOString(),reason,patient:{...c.patient},responses:{...c.responses},scores:c.scores||[],scoringVersion:c.scoringVersion,aiContextualizedReport:c.aiContextualizedReport||'',clinicalSummary:c.clinicalSummary||'',recommendations:c.recommendations||'',completedAt:c.completedAt||null};}
  function freshCase(c){
    if(!c?.patient)return c;
    const sig=signature(c),computed=score(c.responses||{},c.patient.sex??'',c.patient.baremo||'US',c.patient.calculationSource||'manual');
    const changed=c.scores?.length&&c.scoringVersion!==VERSION;
    return {...c,scores:computed.scores,fkIndex:computed.fkIndex,missing:computed.missing,scoringVersion:VERSION,scoringSignature:sig,...(changed&&c.scores?.length?{previousReports:[...(c.previousReports||[]),snapshot(c,'Actualización del motor y fuente de datos')],aiContextualizedReport:'',aiSourceSignature:null,scoringNotice:'Resultados recalculados con la fuente seleccionada. El cálculo anterior está conservado en el historial.'}:{})};
  }
  function updateCase(c,changes){
    let next={...c,...changes,updatedAt:new Date().toISOString()};
    const scoreChanged=signature(c)!==signature(next);
    const narrativeChanged=JSON.stringify(c.patient)!==JSON.stringify(next.patient)||c.modalidad!==next.modalidad||JSON.stringify(c.previousAssessment)!==JSON.stringify(next.previousAssessment);
    if((scoreChanged||narrativeChanged)&&(c.completedAt||c.aiContextualizedReport))next={...next,previousReports:[...(c.previousReports||[]),snapshot(c,scoreChanged?'Modificación de respuestas o parámetros':'Edición de información clínica')],...(scoreChanged?{completedAt:null,status:'captura'}:{}),aiContextualizedReport:'',aiSourceSignature:null,aiReviewedAt:null,scoringNotice:'La versión anterior se conserva en el historial. Revise la integración tras esta edición.'};
    return freshCase(next);
  }
  function compare(current,previous){
    const sameNorm=current.patient.baremo===previous.patient.baremo,sameSex=current.patient.sex===previous.patient.sex,sameSource=(current.patient.calculationSource||'manual')===(previous.patient.calculationSource||'manual');
    const compatible=sameNorm&&sameSex&&sameSource;
    return current.scores.filter(s=>s.code!=='?').map(s=>{const old=previous.scores.find(p=>p.code===s.code),can=compatible&&numeric(s.T)&&numeric(old?.T)&&!s.bound&&!old.bound;
      const delta=can?s.T-old.T:null;return {code:s.code,previous:old?.t_display||'—',current:s.t_display,delta,label:delta==null?'Comparabilidad pendiente':Math.abs(delta)<5?'Estable':Math.abs(delta)<10?'Cambio leve':'Cambio relevante (descriptivo)',compatible};});
  }
  const profile=(responses,sex,country,source)=>{const result=score(responses,sex,country,source);return {...result,synthesis:synthesis(result.scores),configs:configurations(result.scores),code:profileCode(result.scores),critical:critical(responses,sex),clusters:clusters(result.scores,country),recs:[]};};
  const groupSummary=(scores,g)=>`${D.groups[g].length} escalas · ${scores.filter(s=>D.groups[g].includes(s.code)&&s.T>=65).length} con T≥65.`;
  function excelRows(c,evaluator={}){c=freshCase(c);return [['INFORME MMPI-2'],['Paciente',c.patient.fullName],['Aplicación',c.patient.applicationDate],['Baremo',c.patient.baremo],['Fuente',c.patient.calculationSource==='anterior'?'Datos del ZIP anterior':'Manual adjunto octubre 2026'],['Evaluador',evaluator.fullName],[],['Grupo','Escala','Descripción','PD','Corrección K','PD+K','T numérica','T publicada','Nivel / estado','Referencia normativa','Omisiones','Orientación'],...c.scores.map(s=>[D.labels[D.catalog[s.code]?.group||'validez'],s.code,s.description,s.raw??'',s.hasK?s.kAdded:'',s.hasK?s.rawK:'',s.T??'',s.t_display,levelNames[s.level]||s.status,s.norm_label,s.omitted??'',orientation(s,synthesis(c.scores).blocked)])];}
  root.MMPI2Audit={VERSION,data:D,raw,key,score,conversion,details,level,levelNames,validity,synthesis,orientation,clusters,critical,profileCode,configurations,profile,groupSummary,signature,snapshot,freshCase,updateCase,compare,excelRows,escape:esc,numeric,migrateState:state=>({...state,cases:(state.cases||[]).map(freshCase)}),invalidateCase:(c,n)=>updateCase(c,n)};
})(globalThis);
