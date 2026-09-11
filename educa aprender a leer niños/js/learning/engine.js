(function(){
  function missionById(id){return EMILIA_CONTENT.missions.find(m=>m.id===id)||EMILIA_CONTENT.missions[0];}
  function isUnlocked(mission){return EmiliaMastery.prereqsMet(mission.requires||[]);}
  function status(mission){
    const s=EmiliaStore.get();
    if(!isUnlocked(mission))return 'locked';
    if(s.completedMissions.includes(mission.id))return 'done';
    return 'available';
  }
  function worldState(){const rec=recommendedMission();return EMILIA_CONTENT.missions.map(m=>({mission:m,status:status(m),score:EmiliaMastery.missionScore(m),recommended:m.id===rec.id}));}
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
    if(['picturePick','symbolPick','imageWordPick','memoryMatch'].includes(t))return 'recognize';
    if(['trace','wordWrite'].includes(t))return 'motor';
    if(['build','missingPart','gapFill'].includes(t))return 'construct';
    if(['sentenceBuild','sentenceSceneRead'].includes(t))return 'read';
    return t||'other';
  }
  function activityPhase(a){
    const t=String(a&&a.type||'');
    if(t==='patternIntro')return 0;
    if(['picturePick','listenPick','symbolPick'].includes(t))return 1;
    if(['trace','syllableTrail','soundBubbles'].includes(t))return 2;
    if(['build','missingPart','gapFill','imageWordPick','memoryMatch'].includes(t))return 3;
    if(['sentenceBuild','sentenceSceneRead','wordReveal'].includes(t))return 4;
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

  function buildSession(mission){
    const reviews=EmiliaScheduler.injectReviews(mission,2),all=mission.activities.map(a=>Object.assign({},a));
    const fixed=all.filter(a=>!a.variant),variants=all.filter(a=>a.variant);let core=fixed;
    if(variants.length){
      const take=Math.min(variants.length,variants.length>4?3:2),chosen=chooseVariants(variants,take,mission),chosenIds=new Set(chosen.map(a=>a.id));
      // Conserva la posición curricular declarada de cada variante. Antes todas se insertaban
      // juntas tras un pivote y una frase podía aparecer demasiado pronto.
      core=all.filter(a=>!a.variant||chosenIds.has(a.id));
    }
    const acts=weaveReviews(balanceActivities(core),reviews),sequence=sequenceStats(acts);
    // Ritmo infantil: las misiones largas se recorren en microtramos. No se pierde progreso si se guarda en una pausa.
    const pacingBreakpoints=acts.length>=12?[4,8]:(acts.length>=8?[4]:[]);
    return {kind:'mission',missionId:mission.id,title:mission.title,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:reviews.length,minAssessed:mission.minAssessed||5,maxAssessed:mission.maxAssessed||8,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,pacingBreakpoints,pauseSeen:[],sequence};
  }
  function buildPracticeSession(){
    const acts=EmiliaScheduler.practiceActivities(5);
    if(!acts.length)return buildSession(missionById('forest_vowels'));
    const balanced=balanceActivities(acts);
    return {kind:'practice',practiceMode:'review',missionId:null,title:'Semillas que vuelven',activities:balanced,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:balanced.length,minAssessed:3,maxAssessed:5,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,sequence:sequenceStats(balanced)};
  }
  function buildGapPracticeSession(){
    const acts=EmiliaScheduler.gapPracticeActivities(5);
    if(!acts.length)return buildPracticeSession();
    return {kind:'practice',practiceMode:'gaps',missionId:null,title:'Palabras escondidas',activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:Math.min(3,acts.length),maxAssessed:Math.min(5,acts.length),endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0};
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
  function buildSentencePracticeSession(){
    const available=availableSentenceLadders();
    if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),pool=available.slice(-Math.min(4,available.length)),ladder=pool[(s.sessions||0)%pool.length];
    const parts=String(ladder.sentence||'').trim().split(/\s+/).filter(Boolean);
    const scrambled=parts.length>2?[parts[parts.length-1],...parts.slice(1,-1),parts[0]]:parts.slice().reverse();
    const acts=[
      {id:`${ladder.id}_model`,type:'sentenceModel',assess:false,skill:ladder.skill,say:ladder.sentence,parts:parts,prompt:'Mira y escucha la frase',voicePrompt:`Escucha: ${ladder.sentence}. Toca cada palabra de izquierda a derecha.`},
      {id:`${ladder.id}_gap`,type:'gapFill',mode:'word',skill:ladder.skill,prompt:'Completa la frase',introPrompt:'Completa la frase. Si necesitas escucharla, toca el oído.',voicePrompt:`Escucha: ${ladder.sentence}`,autoSpeak:false,trackAudioHelp:true,say:ladder.sentence,display:ladder.gapDisplay.slice(),options:ladder.gapOptions.slice(),answer:ladder.gapAnswer,completeSay:ladder.sentence,completeAudioKind:'sentence',coach:ladder.sentence},
      {id:`${ladder.id}_build`,type:'sentenceBuild',skill:ladder.skill,prompt:'Pon la frase en orden',introPrompt:'Pon las palabras en orden. Si necesitas escuchar la frase, toca el oído.',voicePrompt:`Escucha: ${ladder.sentence}`,autoSpeak:false,trackAudioHelp:true,say:ladder.sentence,parts:scrambled,answerParts:parts,coach:ladder.sentence},
      {id:`${ladder.id}_scene`,type:'sentenceSceneRead',assess:false,skill:ladder.skill,say:ladder.sentence,parts:parts,prompt:'Ahora léela en la escena',voicePrompt:'Lee la frase. Si necesitas ayuda, toca una palabra o el oído.',background:ladder.background,scene:(ladder.scene||[]).slice(),sceneSay:(ladder.sceneSay||[]).slice()}
    ];
    return {kind:'practice',practiceMode:'sentences',forceFullSequence:true,missionId:null,title:`Frases vivas · ${ladder.sentence}`,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:2,maxAssessed:2,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,sentenceLadder:ladder.id};
  }
  function buildWritingPracticeSession(){
    const available=availableWritingLadders();
    if(!available.length)return buildPracticeSession();
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),pool=available.slice(-Math.min(3,available.length)),ladder=pool[(s.sessions||0)%pool.length];
    const parts=ladder.parts.slice(),scrambled=parts.length===2?[parts[1],parts[0]]:[parts[parts.length-1],...parts.slice(0,-1)];
    const gapMode=(ladder.gap&&ladder.gap.mode)||'letter';
    const acts=[
      {id:`${ladder.id}_model`,type:'wordModel',assess:false,skill:ladder.skill,word:ladder.word,parts:parts,prompt:'Mira y escucha la palabra',voicePrompt:`Mira ${ladder.word}. Toca sus partes de izquierda a derecha.`},
      {id:`${ladder.id}_build`,type:'build',skill:ladder.skill,word:ladder.word,say:ladder.word,parts:scrambled,answerParts:parts,prompt:'Ahora arma la palabra',traceAfter:false,coach:`Forma ${ladder.word}.`},
      {id:`${ladder.id}_gap`,type:'gapFill',mode:gapMode,skill:ladder.skill,prompt:'Encuentra lo que falta',voicePrompt:gapMode==='syllable'?`Escucha ${ladder.word}. Toca la sílaba que falta.`:gapMode==='pattern'?`Escucha ${ladder.word}. Toca la parte que falta.`:`Escucha ${ladder.word}. Toca la letra que falta.`,display:ladder.gap.display.slice(),options:ladder.gap.options.slice(),answer:ladder.gap.answer,completeSay:ladder.word,coach:`Así se escribe ${ladder.word}.`},
      {id:`${ladder.id}_write`,type:'wordWrite',skill:ladder.skill,word:ladder.word,prompt:'Ahora escríbela tú',voicePrompt:`Escucha ${ladder.word}. Escríbela con tu dedo. Si necesitas ayuda, toca el ojo.`}
    ];
    if(done.has('forest_mix')&&ladder.sentence){acts.push({id:`${ladder.id}_sentence`,type:'gapFill',mode:'word',skill:ladder.sentenceSkill||'sentence_build',prompt:'Completa la frase',voicePrompt:`Escucha: ${ladder.sentence}. Toca la palabra que falta.`,say:ladder.sentence,display:ladder.sentenceDisplay.slice(),options:ladder.sentenceOptions.slice(),answer:ladder.sentenceAnswer,completeSay:ladder.sentence,completeAudioKind:'sentence',coach:ladder.sentence});}
    return {kind:'practice',practiceMode:'writing',missionId:null,title:`Escalera de escritura · ${ladder.word}`,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:Math.min(3,acts.filter(a=>a.assess!==false).length),maxAssessed:acts.filter(a=>a.assess!==false).length,endedAdaptively:false,streak:0,bestStreak:0,bonusStars:0,writingLadder:ladder.id};
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
      ['enye_done',(s.completedMissions||[]).includes('forest_enye')],['patterns_3',(s.completedMissions||[]).includes('forest_rr')],['secret_forest',(s.completedMissions||[]).includes('forest_secrets')],['stories_10',uniqueStories>=10]
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
    EmiliaStore.event('session_end',{kind:session.kind,practiceMode:session.practiceMode||null,missionId:session.missionId,pct,seeds,errors:session.errors,reviews:session.reviewCount||0,adaptive:!!session.endedAdaptively,bestStreak:session.bestStreak||0,bonusStars:session.bonusStars||0,storyUnlocked:storyUnlocked&&storyUnlocked.id});
    EmiliaStore.save();
    return {kind:session.kind,practiceMode:session.practiceMode||null,missionId:session.missionId,pct,seeds,total:assessed,hits:session.independentHits,elapsed:Math.round((Date.now()-session.startedAt)/1000),reviewCount:session.reviewCount||0,adaptive:!!session.endedAdaptively,next:recommendedMission(),newAchievements,bestStreak:session.bestStreak||0,bonusStars:session.bonusStars||0,storyUnlocked};
  }
  function unlockedStories(){return EMILIA_CONTENT.stories.filter(st=>EmiliaMastery.prereqsMet(st.requires||[]));}
  function recommendedStory(){const arr=unlockedStories();return arr[arr.length-1]||null;}
  window.EmiliaEngine={missionById,isUnlocked,status,worldState,recommendedMission,buildSession,buildPracticeSession,buildGapPracticeSession,buildWritingPracticeSession,buildSentencePracticeSession,writingLadderCount,availableWritingLadders,sentenceLadderCount,availableSentenceLadders,activityFamily,balanceActivities,sequenceStats,assessedSoFar,shouldPause,shouldEnd,finish,unlockedStories,recommendedStory};
})();
