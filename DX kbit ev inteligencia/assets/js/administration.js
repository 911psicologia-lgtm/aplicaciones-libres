function event(caseData, type, subtest, message, extra={}) {
  const p=caseData.application.protocol;
  if(!p) return;
  p.events ||= [];
  p.events.push({ ts:new Date().toISOString(), type, subtest, message, ...extra });
}

export function scoreIsResolved(score){ return score === 0 || score === 1 || score === 'CREDIT'; }
export function scoreIsAdministered(score){ return score === 0 || score === 1; }
export function effectiveScore(item){ return item?.score === 1 || item?.score === 'CREDIT' ? 1 : 0; }

function blankProtocolSubtest(){
  return { prepared:false, completed:false, omitted:false, stage:'preparation', startItem:null, originalStartItem:null,
    initialBlock:null, initialCorrect:null, returning:false, creditPrior:0, examplesPresented:false,
    exampleUsed:null, exampleResult:null, learningItems:[], currentIndex:null, terminationReason:'', terminationBlock:null,
    deviationNotes:'', decisionMessage:'' };
}

export function getStartPlan(rules,key,ageYears,exampleResult=null){
  const cfg=rules?.[key]; if(!cfg) return null;
  if(ageYears < cfg.minAgeYears || ageYears > cfg.maxAgeYears) return { omitted:true };
  if(key==='matrices'){
    const route=cfg.routes.find(r=>ageYears>=r.minYears && ageYears<=r.maxYears);
    if(!route) return null;
    if(route.startByExample){
      if(exampleResult===null || exampleResult===undefined) return { example:route.example, needsExampleDecision:true, startItem:null };
      return { example:route.example, needsExampleDecision:false, startItem:exampleResult?route.startByExample.correct:route.startByExample.incorrect };
    }
    return { example:route.example, needsExampleDecision:false, startItem:route.startItem };
  }
  const row=cfg.startByAge.find(r=>ageYears>=r.minYears && ageYears<=r.maxYears);
  return row ? { startItem:row.startItem, examples:cfg.examples||[] } : null;
}

export function getBlock(rules,key,itemNumber){
  const blocks=rules?.[key]?.blocks || [];
  const pair=blocks.find(([a,b])=>itemNumber>=a && itemNumber<=b);
  return pair ? {start:pair[0],end:pair[1],index:blocks.indexOf(pair)} : null;
}

function markBefore(items,startItem,value){
  for(let i=0;i<startItem-1;i++) if(items[i].score==='' || items[i].score==='PRESTART') items[i].score=value;
}
function markUnadministered(items){
  for(const it of items) if(it.score==='' || it.score==='PRESTART') it.score='SKIP';
}
function clearPrestart(items){ for(const it of items) if(it.score==='PRESTART') it.score=''; }

export function ensureProtocol(caseData, age, rules){
  if(!caseData?.application || !age || !rules) return null;
  const signature=`${age.years}:${age.months}:${age.days}`;
  let p=caseData.application.protocol;
  if(!p || p.rulesVersion!==rules.meta.version){
    const legacyResponses=Object.values(caseData.application.items||{}).some(items=>items.some(it=>it.score===0||it.score===1||it.score==='CREDIT'||String(it.response||'').trim()));
    p={ rulesVersion:rules.meta.version, ageSignature:signature, events:[], legacyResponsesDetected:legacyResponses, subtests:{
      vocabExpresivo:blankProtocolSubtest(), definiciones:blankProtocolSubtest(), matrices:blankProtocolSubtest()
    }};
    caseData.application.protocol=p;
    const defPlan=getStartPlan(rules,'definiciones',age.years);
    if(defPlan?.omitted){
      const s=p.subtests.definiciones; s.prepared=true;s.completed=true;s.omitted=true;s.stage='omitted';s.terminationReason='No corresponde por edad (<8 años).';
      for(const it of caseData.application.items.definiciones) if(it.score==='') it.score='SKIP';
      event(caseData,'omit','definiciones','Definiciones omitida por edad inferior a 8 años.');
    }
  } else if(p.ageSignature!==signature){
    p.ageMismatch=true;
  }
  return p;
}

export function resetProtocol(caseData){
  for(const items of Object.values(caseData.application.items||{})){
    for(const it of items){ Object.assign(it,{score:'',response:'',note:'',firstScore:null,firstResponse:'',responseSeconds:null,timerStart:null,timedOut:false}); }
  }
  caseData.application.protocol=null;
  caseData.application.activeSubtest='vocabExpresivo';
  caseData.application.activeIndex=0;
  if(caseData.application.adjustments){ caseData.application.adjustments.vocabOverride='';caseData.application.adjustments.matricesOverride='';caseData.application.adjustments.overrideReason=''; }
}

export function prepareSubtest(caseData,key,age,rules,exampleResult=null){
  const p=ensureProtocol(caseData,age,rules); const s=p.subtests[key];
  const plan=getStartPlan(rules,key,age.years,exampleResult);
  if(!plan || plan.omitted) return {ok:false,message:'Esta subprueba no corresponde por edad.'};
  if(plan.needsExampleDecision) return {ok:false,needsExampleDecision:true,message:'Registre primero el resultado del ejemplo B.'};
  s.prepared=true;s.completed=false;s.omitted=false;s.stage='initial';s.startItem=plan.startItem;s.originalStartItem=plan.startItem;
  s.exampleUsed=plan.example || null;s.exampleResult=exampleResult;s.examplesPresented=key==='definiciones' || !!plan.example;
  const block=getBlock(rules,key,plan.startItem);s.initialBlock=block;s.initialCorrect=null;s.returning=false;s.creditPrior=0;s.terminationReason='';s.terminationBlock=null;
  s.learningItems=[plan.startItem,plan.startItem+1].filter(n=>n<=caseData.application.items[key].length);
  s.currentIndex=plan.startItem-1;
  const items=caseData.application.items[key];
  markBefore(items,plan.startItem,'PRESTART');
  caseData.application.activeSubtest=key;caseData.application.activeIndex=s.currentIndex;
  event(caseData,'start',key,`Inicio oficial en ítem ${plan.startItem}.`,{startItem:plan.startItem,example:plan.example||null,exampleResult});
  return {ok:true,startItem:plan.startItem,block};
}

function blockStats(items,block){
  const subset=items.slice(block.start-1,block.end);
  const unresolved=subset.filter(it=>it.score!==0 && it.score!==1).length;
  const correct=subset.filter(it=>it.score===1).length;
  const incorrect=subset.filter(it=>it.score===0).length;
  return {unresolved,correct,incorrect,total:subset.length,allZero:unresolved===0 && correct===0};
}

function complete(caseData,key,block,reason){
  const s=caseData.application.protocol.subtests[key];
  s.completed=true;s.stage='complete';s.returning=false;s.terminationReason=reason;s.terminationBlock=block?`${block.start}-${block.end}`:null;
  markUnadministered(caseData.application.items[key]);
  event(caseData,'complete',key,reason,{block:s.terminationBlock});
  return {complete:true,reason,block};
}

export function advanceProtocol(caseData,key,rules){
  const s=caseData.application.protocol?.subtests?.[key];
  if(!s?.prepared) return {blocked:true,message:'Prepare primero la subprueba.'};
  if(s.completed) return {complete:true,reason:s.terminationReason};
  const items=caseData.application.items[key]; const itemNo=caseData.application.activeIndex+1; const item=items[itemNo-1];
  if(item.score!==0 && item.score!==1) return {blocked:true,message:'Registre una puntuación 0 o 1 antes de continuar. Si hubo una incidencia, documéntela en la observación.'};
  const block=getBlock(rules,key,itemNo); if(!block) return {blocked:true,message:'No se encontró el bloque normativo del ítem actual.'};
  if(itemNo<block.end){ s.currentIndex=itemNo; return {nextItem:itemNo+1}; }
  const bs=blockStats(items,block);
  if(bs.unresolved>0) return {blocked:true,message:`Complete todos los ítems del bloque ${block.start}-${block.end} antes de decidir la ruta.`};

  if(s.stage==='initial'){
    s.initialCorrect=bs.correct;
    if(s.originalStartItem===1){
      if(bs.correct===0) return complete(caseData,key,block,`Discontinuación: todos los ítems del bloque ${block.start}-${block.end} obtuvieron 0.`);
      s.stage='forward';s.decisionMessage=`Primer bloque: ${bs.correct} aciertos. Continuar hacia adelante.`;
      event(caseData,'initial-decision',key,s.decisionMessage,{correct:bs.correct});
    } else if(bs.correct>=2){
      s.creditPrior=s.originalStartItem-1; markBefore(items,s.originalStartItem,'CREDIT'); s.stage='forward';
      s.decisionMessage=`Primer bloque: ${bs.correct} aciertos. Continuar y acreditar ${s.creditPrior} ítems previos no administrados.`;
      event(caseData,'credit',key,s.decisionMessage,{credit:s.creditPrior,correct:bs.correct});
    } else {
      clearPrestart(items);s.stage='return';s.returning=true;s.creditPrior=0;
      s.decisionMessage=`Primer bloque: ${bs.correct} aciertos (<2). Retorno al ítem 1.`;
      event(caseData,'return',key,s.decisionMessage,{correct:bs.correct,originalStart:s.originalStartItem});
      s.currentIndex=0;return {nextItem:1,returned:true,message:s.decisionMessage};
    }
  } else if(s.stage==='return'){
    if(bs.allZero) return complete(caseData,key,block,`Discontinuación durante retorno: bloque ${block.start}-${block.end} completamente fallado.`);
    const next=block.end+1;
    if(next===s.originalStartItem){
      if(s.initialCorrect===0) return complete(caseData,key,s.initialBlock,`Discontinuación: al alcanzar el bloque inicial ${s.initialBlock.start}-${s.initialBlock.end}, ya constaba completamente fallado.`);
      if(s.initialCorrect===1){
        s.stage='forward';s.returning=false;
        const after=s.initialBlock.end+1;
        s.decisionMessage=`Retorno alcanzó el bloque inicial. Se conserva su acierto previo y se continúa en el ítem ${after}.`;
        event(caseData,'return-resume',key,s.decisionMessage,{nextItem:after});
        if(after>items.length) return complete(caseData,key,s.initialBlock,'Fin de la subprueba.');
        s.currentIndex=after-1;return {nextItem:after,message:s.decisionMessage};
      }
    }
  } else if(s.stage==='forward'){
    if(bs.allZero) return complete(caseData,key,block,`Discontinuación: bloque ${block.start}-${block.end} completamente fallado.`);
  }

  if(block.end>=items.length) return complete(caseData,key,block,'Fin de la subprueba: se completó el último bloque.');
  const next=block.end+1;s.currentIndex=next-1;return {nextItem:next,message:s.decisionMessage||''};
}

export function isLearningItem(caseData,key,itemNumber){
  return !!caseData.application.protocol?.subtests?.[key]?.learningItems?.includes(itemNumber);
}

export function administrationSummary(caseData,key){
  const s=caseData.application.protocol?.subtests?.[key]; if(!s) return null;
  const items=caseData.application.items[key]||[];
  return {
    prepared:s.prepared,completed:s.completed,omitted:s.omitted,startItem:s.originalStartItem,example:s.exampleUsed,exampleResult:s.exampleResult,
    initialCorrect:s.initialCorrect,returned:!!s.returning || (caseData.application.protocol.events||[]).some(e=>e.subtest===key&&e.type==='return'),
    creditPrior:items.filter(it=>it.score==='CREDIT').length,actualCorrect:items.filter(it=>it.score===1).length,
    direct:items.reduce((a,it)=>a+effectiveScore(it),0),terminationReason:s.terminationReason,terminationBlock:s.terminationBlock,
    timedOut:items.filter(it=>it.timedOut).length,learningItems:s.learningItems||[]
  };
}

export function canJumpTo(caseData,key,index){
  const s=caseData.application.protocol?.subtests?.[key]; const it=caseData.application.items[key][index];
  if(!s?.prepared) return false;
  if(index===caseData.application.activeIndex) return true;
  return it.score===0 || it.score===1;
}

export function recordDeviation(caseData,key,message,type='deviation'){
  const s=caseData.application.protocol?.subtests?.[key]; if(s) s.deviationNotes=(s.deviationNotes?`${s.deviationNotes}\n`:'')+message;
  event(caseData,type,key,message);
}
