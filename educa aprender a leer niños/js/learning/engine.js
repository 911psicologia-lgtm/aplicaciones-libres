(function(){
  function missionById(id){return EMILIA_CONTENT.missions.find(m=>m.id===id)||EMILIA_CONTENT.missions[0];}
  function isUnlocked(mission){return EmiliaMastery.prereqsMet(mission.requires||[]);}
  function status(mission){
    const s=EmiliaStore.get();
    if(!isUnlocked(mission))return 'locked';
    if(s.completedMissions.includes(mission.id))return 'done';
    return 'available';
  }
  function requirementMet(r){
    if(r&&r.mission)return EmiliaStore.get().completedMissions.includes(r.mission);
    if(r&&r.skill)return EmiliaMastery.skill(r.skill).score>=(r.score||0);
    return true;
  }
  function progressionGuide(){
    const missions=EMILIA_CONTENT.missions.slice().sort((a,b)=>a.order-b.order),s=EmiliaStore.get();
    const target=missions.find(m=>!s.completedMissions.includes(m.id))||null;
    if(!target)return {state:'complete',targetMission:null,sourceMission:missions[missions.length-1]||null,missing:[]};
    if(isUnlocked(target))return {state:'ready',targetMission:target,sourceMission:null,missing:[]};
    const missing=(target.requires||[]).filter(r=>!requirementMet(r));
    const skillReq=missing.find(r=>r.skill)||null,missionReq=missing.find(r=>r.mission)||null;
    let source=null;
    if(skillReq){
      source=missions.filter(m=>Number(m.order||0)<Number(target.order||0)&&s.completedMissions.includes(m.id)&&((m.skillIds||[]).includes(skillReq.skill)||(m.activities||[]).some(a=>a.skill===skillReq.skill))).pop()||null;
    }
    if(!source&&missionReq)source=missionById(missionReq.mission);
    if(!source)source=missions.filter(m=>Number(m.order||0)<Number(target.order||0)&&s.completedMissions.includes(m.id)).pop()||null;
    const current=skillReq?EmiliaMastery.skill(skillReq.skill).score:0;
    return {state:'blocked',targetMission:target,sourceMission:source,missing,skill:skillReq&&skillReq.skill||'',targetScore:skillReq&&Number(skillReq.score||0)||0,currentScore:current};
  }
  function nextMissionAfter(mission){
    if(!mission)return null;
    const missions=EMILIA_CONTENT.missions.slice().sort((a,b)=>Number(a.order||0)-Number(b.order||0));
    return missions.find(m=>Number(m.order||0)>Number(mission.order||0))||null;
  }
  function missionOwnedSkills(mission){
    const out=new Set((mission&&mission.skillIds)||[]);
    for(const a of ((mission&&mission.activities)||[]))if(a&&a.skill)out.add(a.skill);
    return out;
  }
  function missionUnlockObligations(mission){
    const next=nextMissionAfter(mission);if(!mission||!next)return [];
    const owned=missionOwnedSkills(mission);
    return (next.requires||[]).filter(r=>r&&r.skill&&owned.has(r.skill)).map(r=>{const row=EmiliaMastery.skill(r.skill),target=Number(r.score||0);return {skill:r.skill,target,current:Number(row.score||0),met:Number(row.score||0)>=target,nextMission:next};});
  }
  function missionClosureGuide(mission){
    const next=nextMissionAfter(mission),obligations=missionUnlockObligations(mission),pending=obligations.filter(x=>!x.met);
    return {mission,nextMission:next,obligations,pending,ready:pending.length===0};
  }
  function worldState(){const guide=progressionGuide(),rec=guide.state==='ready'?guide.targetMission:(guide.state==='blocked'?guide.sourceMission:recommendedMission());return EMILIA_CONTENT.missions.map(m=>({mission:m,status:status(m),score:EmiliaMastery.missionScore(m),recommended:!!rec&&m.id===rec.id,blockedTarget:guide.state==='blocked'&&guide.targetMission&&m.id===guide.targetMission.id,needsPractice:guide.state==='blocked'&&guide.sourceMission&&m.id===guide.sourceMission.id}));}
  function recommendedMission(){
    const missions=EMILIA_CONTENT.missions.slice().sort((a,b)=>a.order-b.order),s=EmiliaStore.get();
    const unfinished=missions.find(m=>isUnlocked(m)&&!s.completedMissions.includes(m.id));
    if(unfinished)return unfinished;
    for(let i=0;i<missions.length;i++){
      const m=missions[i],next=missions[i+1];
      if(!isUnlocked(m))continue;
      if(next&&!isUnlocked(next))return m;
      if(EmiliaMastery.missionScore(m)<(m.masteryTarget||60))return m;
    }
    return missions.filter(isUnlocked).pop()||missions[0];
  }

  function activityFamily(a){
    const t=String(a&&a.type||'');
    if(['patternIntro','wordReveal','wordModel','sentenceModel'].includes(t))return 'model';
    if(['listenPick','syllableTrail','soundBubbles'].includes(t))return 'listen';
    if(['picturePick','symbolPick','imageWordPick','memoryMatch','caseMatch'].includes(t))return 'recognize';
    if(['trace','magicTrace','wordWrite','sentenceWrite'].includes(t))return 'motor';
    if(['build','missingPart','gapFill','secretWord'].includes(t))return 'construct';
    if(['sentenceBuild','sentenceSceneRead'].includes(t))return 'read';
    return t||'other';
  }
  function activityPhase(a){
    const t=String(a&&a.type||'');
    if(t==='patternIntro')return 0;
    if(['picturePick','listenPick','symbolPick','caseMatch'].includes(t))return 1;
    if(['trace','magicTrace','syllableTrail','soundBubbles'].includes(t))return 2;
    if(['build','missingPart','gapFill','imageWordPick','memoryMatch','secretWord'].includes(t))return 3;
    if(['sentenceBuild','sentenceSceneRead','wordReveal','sentenceWrite'].includes(t))return 4;
    return 3;
  }
  function weaveReviews(core,reviews){
    const c=(core||[]).slice(),r=(reviews||[]).slice();
    if(!r.length)return c;
    const out=[];
    // Una recuperación al comenzar; una segunda después de entrar en el mundo.
    out.push(r.shift());
    let pivot=Math.min(3,c.length);
    if(r.length&&c.length>2){
      const rev=r[0],rf=activityFamily(rev);let best=pivot,bestPenalty=Infinity;
      for(let p=2;p<=Math.min(5,c.length);p++){
        const left=c[p-1],right=c[p],pen=(left&&activityFamily(left)===rf?3:0)+(right&&activityFamily(right)===rf?3:0)+(left&&left.type===rev.type?2:0)+(right&&right.type===rev.type?2:0)+Math.abs(p-3)*.25;
        if(pen<bestPenalty){best=p;bestPenalty=pen;}
      }
      pivot=best;
    }
    out.push(...c.slice(0,pivot));
    if(r.length)out.push(r.shift());
    out.push(...c.slice(pivot));
    if(r.length)out.push(...r);
    return out;
  }
  function balanceActivities(input){
    const a=(input||[]).slice();
    if(a.length<3)return a;
    // Conserva la intención curricular y solo hace intercambios locales (máximo 4 puestos).
    // Se evita repetir la misma mecánica/familia cuando existe una alternativa cercana.
    for(let i=1;i<a.length-1;i++){
      const prev=a[i-1],cur=a[i],pf=activityFamily(prev),cf=activityFamily(cur);
      if(cur&&cur.type==='patternIntro')continue;
      if(pf!==cf && String(prev.type)!==String(cur.type))continue;
      let best=-1,bestScore=-Infinity;
      for(let j=i+1;j<Math.min(a.length,i+5);j++){
        const cand=a[j],fam=activityFamily(cand),phase=activityPhase(cand);
        if(!cand||cand.type==='patternIntro')continue;
        if(cand.type==='trace'&&(i<2||String(cur&&cur.type)==='picturePick'||!a.slice(0,i).some(x=>x.type==='symbolPick')))continue;
        if(fam===pf||String(cand.type)===String(prev.type))continue;
        if(cand.type==='wordReveal'&&i<a.length-3)continue;
        if(cand.type==='sentenceBuild'&&i<Math.floor(a.length*.55))continue;
        const phaseJump=Math.max(0,phase-activityPhase(cur));
        const score=12-(j-i)*1.7-phaseJump*1.2+(fam!==cf?2:0);
        if(score>bestScore){best=j;bestScore=score;}
      }
      if(best>i){const [cand]=a.splice(best,1);a.splice(i,0,cand);}
    }
    // Segunda pasada: si quedan 3+ tareas de la misma familia, reutiliza una tarea sensorial
    // anterior como separador. No duplica contenido; solo mejora el ritmo de la sesión.
    for(let guard=0;guard<8;guard++){
      let runStart=-1,runLen=0;
      for(let i=0;i<a.length;){let j=i+1;while(j<a.length&&activityFamily(a[j])===activityFamily(a[i]))j++;if(j-i>=3){runStart=i;runLen=j-i;break;}i=j;}
      if(runStart<0)break;
      let donor=-1;
      for(let k=runStart-1;k>=Math.max(1,runStart-6);k--){
        const x=a[k],fam=activityFamily(x);
        if(['patternIntro','trace','wordReveal'].includes(String(x&&x.type||'')))continue;
        if(fam===activityFamily(a[runStart]))continue;
        const before=k>0?activityFamily(a[k-1]):'',after=k+1<a.length?activityFamily(a[k+1]):'';
        if(before&&before===after)continue;
        donor=k;break;
      }
      if(donor<0)break;
      const [spacer]=a.splice(donor,1);const adjusted=donor<runStart?runStart-1:runStart;a.splice(adjusted+Math.min(2,runLen-1),0,spacer);
    }
    return a;
  }
  function sequenceStats(acts){
    const fam=(acts||[]).map(activityFamily),types=(acts||[]).map(x=>x.type),runs=[];let run=1,maxFamilyRun=fam.length?1:0,maxTypeRun=types.length?1:0,typeRun=1;
    for(let i=1;i<fam.length;i++){
      if(fam[i]===fam[i-1])run++;else{runs.push(run);run=1;}maxFamilyRun=Math.max(maxFamilyRun,run);
      if(types[i]===types[i-1])typeRun++;else typeRun=1;maxTypeRun=Math.max(maxTypeRun,typeRun);
    }
    if(fam.length)runs.push(run);
    return {families:fam,maxFamilyRun,maxTypeRun,mix:[...new Set(fam)].length};
  }


  function tuneByConfidence(activity){
    const a=Object.assign({},activity),c=(a.skill&&EmiliaMastery.confidence)?EmiliaMastery.confidence(a.skill):{key:'new',score:0,total:0};
    a.confidenceMode=c.key;a.confidenceScore=c.score;
    // En repasos ya dominados se retira una capa de ayuda: la consigna sigue disponible en el oído,
    // pero no se reproduce sola. Las tareas puramente auditivas conservan siempre su modelo sonoro.
    const needsSound=['listenPick','soundBubbles','syllableTrail'].includes(String(a.type||''));
    if(a.review&&c.key==='confident'&&!needsSound)a.autoSpeak=false;
    if(c.key==='support')a.supportMode=true;
    return a;
  }

  function recentWordRank(){
    const h=(EmiliaStore.get().history||[]),rank=new Map();let n=0;
    for(let i=h.length-1;i>=0&&n<30;i--){
      const e=h[i],w=e&&(e.word||e.value);
      if(!w||rank.has(w))continue;
      if(e.type==='word_trace_complete'||e.type==='reading_practice'||e.type==='answer'){rank.set(String(w).toLowerCase(),n++);}
    }
    return rank;
  }
  function chooseVariants(variants,take,mission){
    if(!variants.length||take<=0)return [];
    const s=EmiliaStore.get(),rank=recentWordRank(),left=variants.map((a,i)=>({a,i})),chosen=[],families=new Set();
    while(left.length&&chosen.length<take){
      let best=0,bestScore=-Infinity;
      for(let k=0;k<left.length;k++){
        const {a,i}=left[k],w=String(a.word||a.say||'').toLowerCase(),seen=rank.has(w)?rank.get(w):999;
        const rotation=((s.sessions||0)+(mission.order||0)+i)%Math.max(1,variants.length),fam=activityFamily(a);
        // Mantiene la preferencia por contenido nuevo/menos reciente, pero desempata a favor de otra mecánica.
        const diversity=families.has(fam)?0:28;
        const score=seen*100-rotation+diversity;
        if(score>bestScore){best=k;bestScore=score;}
      }
      const [{a}]=left.splice(best,1);chosen.push(Object.assign({},a));families.add(activityFamily(a));
    }
    return chosen;
  }

  function caseMatchActivity(mission){
    if(!mission)return null;
    const raw=String(mission.letter||'').trim();
    let target='';
    if(mission.id==='forest_vowels')target='a';
    else if(/^[a-zñ]$/i.test(raw))target=raw.toLocaleLowerCase('es');
    else return null;
    const missions=EMILIA_CONTENT.missions.slice().sort((a,b)=>a.order-b.order);
    const known=['a','e','i','o','u'];
    for(const m of missions){
      if(Number(m.order||0)>Number(mission.order||0))break;
      const l=String(m.letter||'').trim();
      if(/^[a-zñ]$/i.test(l)){const low=l.toLocaleLowerCase('es');if(!known.includes(low))known.push(low);}
    }
    const distractors=known.filter(x=>x!==target);
    const offset=Math.max(0,Number(mission.order||1)-1)%Math.max(1,distractors.length);
    const picked=[target];
    for(let i=0;i<distractors.length&&picked.length<3;i++){
      const d=distractors[(offset+i)%distractors.length];if(!picked.includes(d))picked.push(d);
    }
    const options=picked.sort((a,b)=>((a.charCodeAt(0)+mission.order*7)%11)-((b.charCodeAt(0)+mission.order*7)%11));
    const symbolSkill=(mission.skillIds||[]).find(id=>/_symbol$/.test(id))||(mission.id==='forest_vowels'?'vowel_symbols':(mission.skillIds||[])[0]);
    return {id:`${mission.id}_case_match`,type:'caseMatch',skill:symbolSkill,prompt:'Une mayúscula y minúscula',voicePrompt:`Esta es la ${target.toLocaleUpperCase('es')} mayúscula. Toca la ${target} minúscula.`,target:target.toLocaleUpperCase('es'),options,answer:target,coach:`${target.toLocaleUpperCase('es')} y ${target} son la misma letra.`};
  }
  function injectCaseAwareness(core,mission){
    const q=caseMatchActivity(mission);if(!q)return core;
    const a=(core||[]).slice(),traceIndex=a.findIndex(x=>x.type==='trace');
    const symbolIndex=a.findIndex(x=>x.type==='symbolPick'&&/_symbol$/.test(String(x.skill||'')));
    const at=traceIndex>=0?traceIndex+1:(symbolIndex>=0?symbolIndex+1:Math.min(2,a.length));
    a.splice(at,0,q);return a;
  }

  function buildSession(mission){
    const reviews=EmiliaScheduler.injectReviews(mission,2),all=mission.activities.map(a=>Object.assign({},a));
    const fixed=all.filter(a=>!a.variant),variants=all.filter(a=>a.variant);let core=fixed;
    if(variants.length){
      const take=Math.min(variants.length,variants.length>4?3:2),chosen=chooseVariants(variants,take,mission),chosenIds=new Set(chosen.map(a=>a.id));
      // Conserva la posición curricular declarada de cada variante. Antes todas se insertaban
      // juntas tras un pivote y una frase podía aparecer demasiado pronto.
      core=all.filter(a=>!a.variant||chosenIds.has(a.id));
    }
    core=injectCaseAwareness(core,mission);
    const acts=weaveReviews(balanceActivities(core),reviews).map(tuneByConfidence),sequence=sequenceStats(acts);
    // Ritmo infantil: las misiones largas se recorren en microtramos. No se pierde progreso si se guarda en una pausa.
    const pacingBreakpoints=acts.length>=12?[4,8]:(acts.length>=8?[4]:[]);
    return {kind:'mission',missionId:mission.id,title:mission.title,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:reviews.length,minAssessed:mission.minAssessed||5,maxAssessed:mission.maxAssessed||8,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,pacingBreakpoints,pauseSeen:[],sequence};
  }
  function buildUnlockBridgeSession(){
    const guide=progressionGuide();
    if(guide.state!=='blocked'||!guide.skill)return buildPracticeSession();
    const source=guide.sourceMission||EMILIA_CONTENT.missions.filter(m=>Number(m.order||0)<Number((guide.targetMission||{}).order||999)).pop();
    const assessable=new Set(['listenPick','symbolPick','picturePick','imageWordPick','missingPart','soundBubbles','caseMatch','build','gapFill','wordWrite','sentenceBuild','sentenceWrite','secretWord','lingPuzzle','lingDots']);
    let pool=[];
    if(source){
      const trail=(source.activities||[]).find(a=>a.skill===guide.skill&&a.type==='syllableTrail'&&Array.isArray(a.items)&&a.items.length);
      if(trail){
        const items=trail.items.slice(),rot=(Number(EmiliaStore.get().sessions||0)+Number(source.order||0))%items.length;
        for(let i=0;i<Math.min(3,items.length);i++){
          const answer=items[(rot+i)%items.length],opts=[answer,...items.filter(x=>x!==answer).slice(i,i+2)];
          while(opts.length<3)opts.push(items[(i+opts.length)%items.length]);
          pool.push({id:`bridge_${guide.skill}_${i}`,type:'symbolPick',skill:guide.skill,say:answer,audioKind:'syllable',prompt:'Escucha y toca la sílaba',voicePrompt:`Escucha ${answer}. Toca esa sílaba.`,options:[...new Set(opts)].slice(0,3),answer,coach:`Busca ${answer}.`});
        }
      }
      const direct=(source.activities||[]).filter(a=>a.skill===guide.skill&&assessable.has(a.type));
      pool.push(...direct.map(a=>Object.assign({},a)));
    }
    if(!pool.length){
      pool=EMILIA_CONTENT.missions.flatMap(m=>(m.activities||[]).filter(a=>a.skill===guide.skill&&assessable.has(a.type)).map(a=>Object.assign({},a)));
    }
    const unique=[];const seen=new Set();
    for(const a of pool){const key=`${a.type}|${a.answer||a.word||a.say||a.id}`;if(seen.has(key))continue;seen.add(key);unique.push(a);}
    if(!unique.length)return buildPracticeSession();
    const seed=Number(EmiliaStore.get().sessions||0),activities=[],rot=unique.slice(seed%unique.length).concat(unique.slice(0,seed%unique.length)),remaining=rot.slice(),usedTypes=new Set();
    while(activities.length<3&&remaining.length){
      let pick=remaining.findIndex(a=>!usedTypes.has(a.type));if(pick<0)pick=0;
      const base=Object.assign({},remaining.splice(pick,1)[0]);usedTypes.add(base.type);
      base.id=`unlock_${guide.skill}_${activities.length}_${base.id||base.type}`;base.review=true;base.unlockBridge=true;base.autoSpeak=true;activities.push(tuneByConfidence(base));
    }
    while(activities.length<3){const base=Object.assign({},unique[(seed+activities.length)%unique.length]);base.id=`unlock_${guide.skill}_${activities.length}_${base.id||base.type}`;base.review=true;base.unlockBridge=true;base.autoSpeak=true;activities.push(tuneByConfidence(base));}
    return {kind:'practice',practiceMode:'unlockBridge',forceFullSequence:true,missionId:source&&source.id||null,title:'Paso que falta',activities,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:activities.length,minAssessed:activities.length,maxAssessed:activities.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,bridgeSkill:guide.skill,bridgeTargetMission:guide.targetMission&&guide.targetMission.id,bridgeSourceMission:source&&source.id,targetScore:guide.targetScore};
  }

  function buildPracticeSession(){
    const acts=EmiliaScheduler.practiceActivities(5);
    if(!acts.length)return buildSession(missionById('forest_vowels'));
    const balanced=balanceActivities(acts).map(tuneByConfidence);
    return {kind:'practice',practiceMode:'review',missionId:null,title:'Semillas que vuelven',activities:balanced,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:balanced.length,minAssessed:3,maxAssessed:5,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,sequence:sequenceStats(balanced)};
  }

  function buildFlashPracticeSession(){
    const acts=EmiliaScheduler.quickChallengeActivities(3);
    if(!acts.length)return buildPracticeSession();
    const balanced=balanceActivities(acts).map(tuneByConfidence);
    return {kind:'practice',practiceMode:'flash',flashChallenge:true,forceFullSequence:true,missionId:null,title:'Reto sorpresa de Lumi',activities:balanced,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:balanced.length,minAssessed:balanced.length,maxAssessed:balanced.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,sequence:sequenceStats(balanced)};
  }


  function buildRescuePracticeSession(){
    const acts=EmiliaScheduler.rescueWordActivities?EmiliaScheduler.rescueWordActivities(3):[];
    if(!acts.length)return buildPracticeSession();
    const balanced=balanceActivities(acts).map(tuneByConfidence),targets=[...new Set(balanced.map(a=>a.sourceWord||a.rescueWord||a.word||a.say||a.answer).filter(Boolean))];
    return {kind:'practice',practiceMode:'rescue',rescueChallenge:true,forceFullSequence:true,missionId:null,title:'Rescate de palabras',activities:balanced,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:balanced.length,minAssessed:balanced.length,maxAssessed:balanced.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,rescueTargets:targets,sequence:sequenceStats(balanced)};
  }

  function buildGapPracticeSession(){
    const acts=EmiliaScheduler.gapPracticeActivities(5);
    if(!acts.length)return buildPracticeSession();
    return {kind:'practice',practiceMode:'gaps',missionId:null,title:'Palabras escondidas',activities:acts.map(tuneByConfidence),index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:Math.min(3,acts.length),maxAssessed:Math.min(5,acts.length),endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
  }


  function availableWritingLadders(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]);
    return (EMILIA_CONTENT.writingLadders||[]).filter(x=>done.has(x.mission));
  }
  function writingLadderCount(){return availableWritingLadders().length;}
  function availableSentenceLadders(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]);
    return (EMILIA_CONTENT.sentenceLadders||[]).filter(x=>done.has(x.mission));
  }
  function sentenceLadderCount(){return availableSentenceLadders().length;}
  function availableSentenceWritingTargets(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]);
    return (EMILIA_CONTENT.sentenceWritingTargets||[]).filter(x=>done.has(x.mission));
  }
  function sentenceWritingTargetCount(){return availableSentenceWritingTargets().length;}
  function sentenceCase(text){
    const raw=String(text||'').trim();if(!raw)return '';
    const out=raw.charAt(0).toLocaleUpperCase('es')+raw.slice(1);
    return /[.!?]$/.test(out)?out:`${out}.`;
  }
  function sentenceReadingMode(skill){
    const c=(skill&&window.EmiliaMastery&&EmiliaMastery.confidence)?EmiliaMastery.confidence(skill):{key:'new',score:0,total:0};
    if(c.key==='confident')return 'independent';
    if(c.key==='growing')return 'guided';
    return 'supported';
  }
  function wordWritingStage(word){
    const target=String(word||'').toLocaleLowerCase('es'),events=(EmiliaStore.get().history||[]).filter(e=>e.type==='word_write_complete'&&String(e.word||'').toLocaleLowerCase('es')===target).slice(-4);
    const independent=events.filter(e=>!e.assisted).length;
    if(independent>=2)return{key:'scene',guide:'minimal',showModel:false,autoSpeak:false,label:'Desde la imagen'};
    if(independent>=1)return{key:'faded',guide:'faded',showModel:true,autoSpeak:false,label:'Con una pista suave'};
    return{key:'copy',guide:'full',showModel:true,autoSpeak:true,label:'Primero con modelo'};
  }

  function buildSentencePracticeSession(){
    const available=availableSentenceLadders();
    if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),pool=available.slice(-Math.min(4,available.length)),ladder=pool[(s.sessions||0)%pool.length];
    const parts=String(ladder.sentence||'').trim().split(/\s+/).filter(Boolean);
    const scrambled=parts.length>2?[parts[parts.length-1],...parts.slice(1,-1),parts[0]]:parts.slice().reverse();
    const writingPool=availableSentenceWritingTargets(),writingTarget=writingPool.length?writingPool[(s.sessions||0)%writingPool.length]:null;
    const displaySentence=sentenceCase(ladder.sentence),readingMode=sentenceReadingMode(ladder.skill),readerFirst=readingMode!=='supported';
    const acts=[];
    // El modelo sonoro completo solo se mantiene cuando todavía hace falta apoyo.
    // En crecimiento/confianza la sesión empieza directamente con lectura-construcción y el oído queda como ayuda voluntaria.
    if(readingMode==='supported')acts.push({id:`${ladder.id}_model`,type:'sentenceModel',assess:false,skill:ladder.skill,say:displaySentence,parts:parts,prompt:'Mira y escucha la frase',voicePrompt:`Escucha: ${displaySentence} Toca cada palabra de izquierda a derecha.`,autoSpeak:true,readingMode});
    acts.push(
      {id:`${ladder.id}_gap`,type:'gapFill',mode:'word',skill:ladder.skill,prompt:'Completa la frase',introPrompt:'Completa la frase. Si necesitas escucharla, toca el oído.',voicePrompt:`Escucha: ${displaySentence}`,autoSpeak:false,trackAudioHelp:true,readerFirst,readingMode,say:displaySentence,display:ladder.gapDisplay.slice(),options:ladder.gapOptions.slice(),answer:ladder.gapAnswer,completeSay:displaySentence,completeAudioKind:'sentence',coach:displaySentence},
      {id:`${ladder.id}_build`,type:'sentenceBuild',skill:ladder.skill,prompt:'Pon la frase en orden',introPrompt:'Pon las palabras en orden. Si necesitas escuchar la frase, toca el oído.',voicePrompt:`Escucha: ${displaySentence}`,autoSpeak:false,trackAudioHelp:true,readerFirst,readingMode,say:displaySentence,parts:scrambled,answerParts:parts,coach:displaySentence},
      {id:`${ladder.id}_scene`,type:'sentenceSceneRead',assess:false,skill:ladder.skill,say:displaySentence,parts:parts,prompt:readerFirst?'Primero intenta leerla tú':'Ahora léela en la escena',voicePrompt:'Lee la frase. Si necesitas ayuda, toca una palabra o el oído.',readerFirst:true,readingMode,background:ladder.background,scene:(ladder.scene||[]).slice(),sceneSay:(ladder.sceneSay||[]).slice()}
    );
    if(writingTarget){
      const phrase=sentenceCase(writingTarget.sentence),writingMode=sentenceReadingMode(writingTarget.skill),writingReaderFirst=writingMode!=='supported';
      acts.push({id:`${writingTarget.id}_finger`,type:'sentenceWrite',skill:writingTarget.skill,sentence:phrase,say:phrase,prompt:'Ahora escribe una frase corta',voicePrompt:`${writingReaderFirst?'Intenta escribirla. Si necesitas ayuda, toca el oído o el ojo.':`Escucha: ${phrase} Escríbela con tu dedo. Empieza con mayúscula.`}`,autoSpeak:!writingReaderFirst,trackAudioHelp:true,readerFirst:writingReaderFirst,readingMode:writingMode,responsiveWords:true});
    }
    const assessed=acts.filter(a=>a.assess!==false).length;
    return {kind:'practice',practiceMode:'sentences',forceFullSequence:true,missionId:null,title:'Frases vivas · leer y escribir',activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:Math.min(3,assessed),maxAssessed:assessed,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,sentenceLadder:ladder.id,sentenceWritingTarget:writingTarget&&writingTarget.id,readingMode};
  }
  function buildWritingPracticeSession(){
    const available=availableWritingLadders();
    if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),pool=available.slice(-Math.min(3,available.length)),ladder=pool[(s.sessions||0)%pool.length],stage=wordWritingStage(ladder.word);
    const parts=ladder.parts.slice(),scrambled=parts.length===2?[parts[1],parts[0]]:[parts[parts.length-1],...parts.slice(0,-1)];
    const gapMode=(ladder.gap&&ladder.gap.mode)||'letter';
    const model={id:`${ladder.id}_model`,type:'wordModel',assess:false,skill:ladder.skill,word:ladder.word,parts:parts,prompt:'Mira y escucha la palabra',voicePrompt:`Mira ${ladder.word}. Toca sus partes de izquierda a derecha.`};
    const build={id:`${ladder.id}_build`,type:'build',skill:ladder.skill,word:ladder.word,say:ladder.word,parts:scrambled,answerParts:parts,prompt:'Ahora arma la palabra',traceAfter:false,coach:`Forma ${ladder.word}.`};
    const gap={id:`${ladder.id}_gap`,type:'gapFill',mode:gapMode,skill:ladder.skill,prompt:'Encuentra lo que falta',voicePrompt:gapMode==='syllable'?`Escucha ${ladder.word}. Toca la sílaba que falta.`:gapMode==='pattern'?`Escucha ${ladder.word}. Toca la parte que falta.`:`Escucha ${ladder.word}. Toca la letra que falta.`,display:ladder.gap.display.slice(),options:ladder.gap.options.slice(),answer:ladder.gap.answer,completeSay:ladder.word,coach:`Así se escribe ${ladder.word}.`};
    const write={id:`${ladder.id}_write`,type:'wordWrite',skill:ladder.skill,word:ladder.word,prompt:stage.key==='scene'?'Mira la imagen y escríbela':'Ahora escríbela tú',voicePrompt:stage.autoSpeak?`Escucha ${ladder.word}. Escríbela con tu dedo.`:`Intenta escribirla. Si necesitas ayuda, toca el oído o el ojo.`,writeStage:stage.key,guide:stage.guide,showModel:stage.showModel,autoSpeak:stage.autoSpeak,readerFirst:!stage.autoSpeak};
    let acts=stage.key==='copy'?[model,build,gap,write]:(stage.key==='faded'?[build,gap,write]:[write,gap]);
    if(done.has('forest_mix')&&ladder.sentence){acts.push({id:`${ladder.id}_sentence`,type:'gapFill',mode:'word',skill:ladder.sentenceSkill||'sentence_build',prompt:'Completa la frase',voicePrompt:`Escucha: ${ladder.sentence}. Toca la palabra que falta.`,say:ladder.sentence,display:ladder.sentenceDisplay.slice(),options:ladder.sentenceOptions.slice(),answer:ladder.sentenceAnswer,completeSay:ladder.sentence,completeAudioKind:'sentence',coach:ladder.sentence});}
    return {kind:'practice',practiceMode:'writing',forceFullSequence:true,missionId:null,title:`Escalera de escritura · ${ladder.word}`,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:Math.min(2,acts.filter(a=>a.assess!==false).length),maxAssessed:acts.filter(a=>a.assess!==false).length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,writingLadder:ladder.id,writingStage:stage.key,writingStageLabel:stage.label};
  }


  function availableMagicLetters(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),out=[];
    if(done.has('forest_vowels'))for(const v of ['a','e','i','o','u'])out.push({letter:v,mission:'forest_vowels',skill:'vowel_symbols',chapter:1});
    const worlds=(EMILIA_CONTENT.worlds||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));
    for(const w of worlds){
      if(!done.has(w.id))continue;const raw=String(w.letter||'').trim();if(!/^[a-zñ]$/i.test(raw))continue;
      const m=missionById(w.id),skill=(m.skillIds||[]).find(x=>/_symbol$/.test(x))||(m.skillIds||[]).find(x=>/_pattern$/.test(x))||(m.skillIds||[])[0]||'';
      out.push({letter:raw.toLocaleLowerCase('es'),mission:w.id,skill,chapter:Number(w.chapter||1)});
    }
    return out.filter((x,i,a)=>a.findIndex(y=>y.letter===x.letter)===i);
  }
  function magicTraceCount(){return availableMagicLetters().length;}
  function buildMagicTracePracticeSession(){
    const available=availableMagicLetters();if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),latest=available.slice(-3),seed=Number(s.sessions||0),acts=[];
    if(latest.length===1){for(const c of ['upper','lower','upper'])acts.push({item:latest[0],caseMode:c});}
    else{
      latest.forEach((item,i)=>acts.push({item,caseMode:(seed+i)%2?'lower':'upper'}));
      if(acts.length<3)acts.push({item:latest[latest.length-1],caseMode:acts[0].caseMode==='upper'?'lower':'upper'});
    }
    const activities=acts.slice(0,3).map((x,i)=>{const shown=x.caseMode==='lower'?x.item.letter:x.item.letter.toLocaleUpperCase('es');return{id:`magic_${x.item.letter}_${x.caseMode}_${i}`,type:'magicTrace',skill:x.item.skill,letter:x.item.letter,caseMode:x.caseMode,chapter:x.item.chapter,prompt:`Pinta la ${shown} con tinta mágica`,voicePrompt:`Pinta la ${shown} con tu dedo. La tinta dorada solo queda dentro de la letra.`};});
    return{kind:'practice',practiceMode:'magicTrace',forceFullSequence:true,missionId:null,title:'Tinta Mágica de Lumi',activities,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:activities.length,minAssessed:activities.length,maxAssessed:activities.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
  }
  function availableSecretWords(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),art=EMILIA_CONTENT.wordArt||{};
    return (EMILIA_CONTENT.writingLadders||[]).filter(x=>done.has(x.mission)&&art[x.word]&&/^[a-záéíóúñ]{3,8}$/i.test(String(x.word||'')));
  }
  function secretWordCount(){return availableSecretWords().length;}
  function knownLetters(){return availableMagicLetters().map(x=>x.letter);}
  function secretUnits(word){
    const src=String(word||'').toLocaleLowerCase('es'),out=[];let i=0;
    while(i<src.length){
      const rest=src.slice(i);
      const m=rest.match(/^(que|qui|ch|rr|ce|ci|ge|gi)/);
      if(m){out.push(m[1]);i+=m[1].length;}else{out.push(src[i]);i++;}
    }
    return out;
  }
  function knownSecretUnits(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),out=knownLetters().slice();
    if(done.has('forest_ch'))out.push('ch');
    if(done.has('forest_qu'))out.push('que','qui');
    if(done.has('forest_rr'))out.push('rr');
    if(done.has('forest_ceci'))out.push('ce','ci');
    if(done.has('forest_gegi'))out.push('ge','gi');
    return [...new Set(out)];
  }
  function rotate(arr,n){if(!arr.length)return arr;const k=((n%arr.length)+arr.length)%arr.length;return arr.slice(k).concat(arr.slice(0,k));}
  function buildSecretWordPracticeSession(){
    const available=availableSecretWords();if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),count=Math.min(3,available.length),pool=rotate(available.slice(),Number(s.sessions||0)%available.length).slice(0,count),known=knownSecretUnits();
    const activities=pool.map((item,i)=>{
      const units=secretUnits(item.word),unique=[...new Set(units)],distractors=known.filter(x=>!unique.includes(x));
      const options=[...unique,...rotate(distractors,i+Number(s.sessions||0)).slice(0,Math.max(2,Math.min(4,7-unique.length)))];
      const mixed=rotate(options,(i*2+Number(s.sessions||0))%Math.max(1,options.length));
      return{id:`secret_${item.id}_${i}`,type:'secretWord',skill:item.skill,word:item.word,units,src:(EMILIA_CONTENT.wordArt||{})[item.word],options:mixed,prompt:'Mira la pista. Forma la palabra.',voicePrompt:'Mira la pista. Toca las piezas en orden para formar la palabra.',coach:'Mira la imagen y busca la siguiente pieza.'};
    });
    return{kind:'practice',practiceMode:'secretWord',forceFullSequence:true,missionId:null,title:'Palabra secreta de Lumi',activities,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:activities.length,minAssessed:activities.length,maxAssessed:activities.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
  }


  // v1.6.0 · Rompecabezas lingüísticos + Ruta de puntos
  function availablePuzzleWords(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),art=EMILIA_CONTENT.wordArt||{};
    return (EMILIA_CONTENT.writingLadders||[]).filter(x=>done.has(x.mission)&&art[x.word]&&String(x.word||'').length>=3);
  }
  function puzzleCount(){return availablePuzzleWords().length;}
  function puzzleSize(){const n=(EmiliaStore.get().completedMissions||[]).length;return n>=18?12:n>=8?9:4;}
  function buildPuzzlePracticeSession(){
    const available=availablePuzzleWords();if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),size=puzzleSize(),pool=rotate(available.slice(),Number(s.sessions||0)%available.length).slice(0,3);
    const activities=pool.map((item,i)=>({id:`puzzle_${item.id}_${size}_${i}`,type:'lingPuzzle',skill:item.skill,word:item.word,src:(EMILIA_CONTENT.wordArt||{})[item.word],pieces:size,prompt:`Arma la imagen y descubre la palabra`,voicePrompt:'Arma la imagen. Cuando termines, descubre y lee la palabra.'}));
    return{kind:'practice',practiceMode:'lingPuzzle',forceFullSequence:true,missionId:null,title:`Rompecabezas de palabras · ${size} piezas`,activities,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:activities.length,minAssessed:activities.length,maxAssessed:activities.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
  }
  function availableDotWords(){return availablePuzzleWords().filter(x=>secretUnits(x.word).length<=7);}
  function dotCount(){return availableDotWords().length;}
  function buildDotPracticeSession(){
    const available=availableDotWords();if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),pool=rotate(available.slice(),(Number(s.sessions||0)+2)%available.length).slice(0,3);
    const activities=pool.map((item,i)=>({id:`dots_${item.id}_${i}`,type:'lingDots',skill:item.skill,word:item.word,units:secretUnits(item.word),src:(EMILIA_CONTENT.wordArt||{})[item.word],prompt:'Une los puntos en orden y descubre la palabra',voicePrompt:'Toca los puntos en orden. Cada punto guarda una parte de la palabra.'}));
    return{kind:'practice',practiceMode:'lingDots',forceFullSequence:true,missionId:null,title:'Ruta de puntos de Lumi',activities,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:activities.length,minAssessed:activities.length,maxAssessed:activities.length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
  }

  function assessedSoFar(session){return session.activities.slice(0,session.index+1).filter(a=>a.assess!==false).length;}
  function shouldPause(session){
    if(!session||session.kind!=='mission'||session.forceFullSequence)return false;
    const points=Array.isArray(session.pacingBreakpoints)?session.pacingBreakpoints:(session.pacingBreakpoints=(session.activities.length>=12?[4,8]:(session.activities.length>=8?[4]:[])));
    const seen=Array.isArray(session.pauseSeen)?session.pauseSeen:(session.pauseSeen=[]);
    const completed=Math.max(0,Number(session.index)||0);
    if(!points.includes(completed)||seen.includes(completed))return false;
    // No interrumpimos cuando ya solo queda una actividad.
    if(completed>=session.activities.length-1)return false;
    seen.push(completed);
    return true;
  }
  function shouldEnd(session){
    if(session&&session.forceFullSequence)return false;
    const n=assessedSoFar(session);if(n<(session.minAssessed||4))return false;
    const independence=n?session.independentHits/n:0;
    if(session.kind==='practice')return independence>=.8&&session.errors<=1;
    const m=missionById(session.missionId),score=EmiliaMastery.missionScore(m);
    // v1.9.0: no cerrar una misión de forma adaptativa mientras una habilidad de ESTA misión
    // siga siendo requisito pendiente para abrir el mundo inmediato. Así evitamos un check verde
    // seguido de un bloqueo invisible que obligue a un repaso-puente por cierre prematuro.
    const closure=missionClosureGuide(m);
    if(closure.pending.length)return false;
    if(n>=(session.maxAssessed||7))return true;
    return independence>=.8&&score>=(m.masteryTarget||58)&&session.errors<=1;
  }

  function checkAchievements(s,session){
    s.achievements=s.achievements||[];
    const events=s.history||[],built=events.filter(e=>e.type==='word_trace_complete').length,read=events.filter(e=>e.type==='reading_practice').length,done=(s.completedMissions||[]).length;
    const uniqueStories=new Set(events.filter(e=>e.type==='story_complete').map(e=>e.storyId)).size;
    const oldBest=Math.max(0,...events.filter(e=>e.type==='session_end').map(e=>Number(e.bestStreak||0))),best=Math.max(oldBest,Number(session&&session.bestStreak||0));
    const tests=[
      ['first_path',done>=1],['vowels_done',(s.completedMissions||[]).includes('forest_vowels')],['builder_5',built>=5],['reader_5',read>=5],['forest_5',done>=5],['forest_8',done>=8],
      ['streak_3',best>=3],['forest_mix',(s.completedMissions||[]).includes('forest_mix')],['stories_3',uniqueStories>=3],
      ['new_letters_5',(s.completedMissions||[]).includes('forest_g')],['forest_expand',(s.completedMissions||[]).includes('forest_expand')],['stories_6',uniqueStories>=6],
      ['enye_done',(s.completedMissions||[]).includes('forest_enye')],['patterns_3',(s.completedMissions||[]).includes('forest_rr')],['secret_forest',(s.completedMissions||[]).includes('forest_secrets')],['stories_10',uniqueStories>=10],['new_forest_5',(s.completedMissions||[]).includes('forest_new_letters')]
    ],out=[];
    for(const [id,ok] of tests){if(ok&&!s.achievements.includes(id)){s.achievements.push(id);const def=(EMILIA_CONTENT.achievements||[]).find(x=>x.id===id);if(def)out.push(def);}}
    return out;
  }
  function finish(session){
    const s=EmiliaStore.get(),assessed=session.activities.filter(a=>a.assess!==false).length,pct=assessed?Math.round(100*session.independentHits/assessed):100;
    let seeds=session.kind==='practice'?1:(pct>=90?3:pct>=70?2:1);
    s.seeds=(s.seeds||0)+seeds;s.sessions=(s.sessions||0)+1;s.treasureStars=(s.treasureStars||0)+(session.bonusStars||0);
    if(session.kind==='mission'&&session.missionId){if(!s.completedMissions.includes(session.missionId))s.completedMissions.push(session.missionId);s.lastMission=session.missionId;}
    const growth=s.growth||(s.growth={stage:0,plants:0,fireflies:0});growth.plants=Math.max(growth.plants||0,s.seeds||0);growth.fireflies=Math.min(18,Math.floor((s.seeds||0)/2));growth.stage=Math.min(4,Math.floor((s.seeds||0)/5));
    const newAchievements=checkAchievements(s,session);
    const storyUnlocked=session.kind==='mission'&&session.missionId?(EMILIA_CONTENT.stories||[]).find(st=>(st.requires||[]).some(r=>r.mission===session.missionId)&&EmiliaMastery.prereqsMet(st.requires||[]))||null:null;
    const rescueSuccess=session.practiceMode==='rescue'&&assessed>0&&session.independentHits>=assessed&&session.errors===0;
    if(session.practiceMode==='rescue')EmiliaStore.event('rescue_words',{success:rescueSuccess,targets:(session.rescueTargets||[]).slice(),hits:session.independentHits,total:assessed});
    EmiliaStore.event('session_end',{kind:session.kind,practiceMode:session.practiceMode||null,missionId:session.missionId,pct,seeds,errors:session.errors,reviews:session.reviewCount||0,adaptive:!!session.endedAdaptively,bestStreak:session.bestStreak||0,bonusStars:session.bonusStars||0,storyUnlocked:storyUnlocked&&storyUnlocked.id});
    EmiliaStore.save();
    return {kind:session.kind,practiceMode:session.practiceMode||null,missionId:session.missionId,pct,seeds,total:assessed,hits:session.independentHits,elapsed:Math.round((Date.now()-session.startedAt)/1000),reviewCount:session.reviewCount||0,adaptive:!!session.endedAdaptively,next:recommendedMission(),newAchievements,bestStreak:session.bestStreak||0,bonusStars:session.bonusStars||0,storyUnlocked,rescueSuccess:!!rescueSuccess,rescueTargets:(session.rescueTargets||[]).slice()};
  }
  function unlockedStories(){return EMILIA_CONTENT.stories.filter(st=>EmiliaMastery.prereqsMet(st.requires||[]));}
  function recommendedStory(){const arr=unlockedStories();return arr[arr.length-1]||null;}
  window.EmiliaEngine={missionById,isUnlocked,status,worldState,recommendedMission,progressionGuide,nextMissionAfter,missionUnlockObligations,missionClosureGuide,buildSession,buildPracticeSession,buildUnlockBridgeSession,buildFlashPracticeSession,buildRescuePracticeSession,buildGapPracticeSession,buildWritingPracticeSession,buildSentencePracticeSession,buildMagicTracePracticeSession,buildSecretWordPracticeSession,buildPuzzlePracticeSession,buildDotPracticeSession,magicTraceCount,secretWordCount,puzzleCount,dotCount,availableMagicLetters,availableSecretWords,availablePuzzleWords,availableDotWords,writingLadderCount,availableWritingLadders,sentenceLadderCount,availableSentenceLadders,sentenceWritingTargetCount,availableSentenceWritingTargets,activityFamily,balanceActivities,sequenceStats,assessedSoFar,shouldPause,shouldEnd,finish,unlockedStories,recommendedStory};
})();
