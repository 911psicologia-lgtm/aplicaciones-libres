(function(){
  function cloneActivity(a){return Object.assign({},a,{id:'review_'+a.id+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),review:true});}
  function candidates(excludeSkills){
    const s=EmiliaStore.get(),exclude=new Set(excludeSkills||[]),cur=s.sessions||0;
    return EMILIA_CONTENT.reviewActivities.filter(a=>{
      if(exclude.has(a.skill))return false;
      const m=EmiliaMastery.skill(a.skill);
      return m.total>0 && (m.dueSession||0)<=cur;
    }).sort((a,b)=>{
      const ma=EmiliaMastery.skill(a.skill),mb=EmiliaMastery.skill(b.skill);
      if(ma.score!==mb.score)return ma.score-mb.score;
      return (ma.lastSeen||0)-(mb.lastSeen||0);
    });
  }
  function adaptiveReviews(excludeSkills,max=2){return window.EmiliaReadingAdapt?EmiliaReadingAdapt.reviewActivities(max,excludeSkills||[]):[];}
  function dueCount(){const regular=candidates([]).length,reading=window.EmiliaReadingAdapt?EmiliaReadingAdapt.weakCount():0;return regular+reading;}
  function injectReviews(mission,max=2){
    const adaptive=adaptiveReviews(mission.skillIds,Math.min(1,max));
    const blocked=(mission.skillIds||[]).concat(adaptive.map(a=>a.skill));
    const due=candidates(blocked).slice(0,Math.max(0,max-adaptive.length)).map(cloneActivity);
    return adaptive.concat(due);
  }
  function weakestTaught(max=5){
    return EmiliaMastery.summary().filter(r=>r.total>0).sort((a,b)=>a.score-b.score).slice(0,max);
  }
  function practiceActivities(max=5){
    const out=[],seen=new Set();
    for(const a of adaptiveReviews([],Math.min(2,max))){out.push(a);seen.add(a.skill);if(out.length>=max)return out;}
    let pool=candidates([]);
    if(!pool.length){
      const ids=new Set(weakestTaught(max).map(x=>x.id));
      pool=EMILIA_CONTENT.reviewActivities.filter(a=>ids.has(a.skill));
    }
    for(const a of pool){if(seen.has(a.skill))continue;seen.add(a.skill);out.push(cloneActivity(a));if(out.length>=max)break;}
    return out;
  }

  function quickFamily(a){
    const t=String(a&&a.type||'');
    if(['listenPick','soundBubbles','syllableTrail'].includes(t))return 'listen';
    if(['picturePick','symbolPick','imageWordPick'].includes(t))return 'recognize';
    if(['gapFill','missingPart','build'].includes(t))return 'construct';
    return t||'other';
  }
  function learnedQuickPool(){
    const s=EmiliaStore.get(),done=new Set(s.completedMissions||[]),allowed=new Set(['listenPick','symbolPick','picturePick','imageWordPick','soundBubbles','gapFill','missingPart','build']),out=[];
    for(const m of (EMILIA_CONTENT.missions||[])){
      if(!done.has(m.id))continue;
      for(const a of (m.activities||[])){
        if(a.assess===false||!allowed.has(String(a.type||'')))continue;
        out.push(Object.assign({},a,{sourceMission:m.id}));
      }
    }
    return out;
  }
  function quickChallengeCount(){return learnedQuickPool().length;}
  function quickChallengeActivities(max=3){
    const s=EmiliaStore.get(),pool=learnedQuickPool();if(!pool.length)return [];
    const out=[],usedSkills=new Set(),usedFamilies=new Set();
    const push=a=>{if(!a||out.length>=max||usedSkills.has(a.skill))return false;const fam=quickFamily(a);out.push(Object.assign({},a,{id:'flash_'+a.id+'_'+(s.sessions||0)+'_'+out.length,review:true,flashChallenge:true}));usedSkills.add(a.skill);usedFamilies.add(fam);return true;};
    // 1) Primero algo que realmente conviene recuperar, si existe.
    const due=[...adaptiveReviews([],max),...candidates([])].filter(a=>pool.some(p=>p.skill===a.skill)&&['listenPick','symbolPick','picturePick','imageWordPick','soundBubbles','gapFill','missingPart','build'].includes(String(a.type||'')));
    if(due.length)push(due[0]);
    // 2) Luego algo reciente para mantener sensación de avance.
    const recentMission=s.lastMission||((s.completedMissions||[]).slice(-1)[0]);
    const recent=pool.filter(a=>a.sourceMission===recentMission).sort((a,b)=>EmiliaMastery.skill(a.skill).score-EmiliaMastery.skill(b.skill).score);
    for(const a of recent){if(!usedFamilies.has(quickFamily(a))&&push(a))break;}
    // 3) Completa con variedad y rota para que no parezca siempre el mismo reto.
    const rot=pool.length?((s.sessions||0)*3+(s.completedMissions||[]).length)%pool.length:0,ordered=pool.slice(rot).concat(pool.slice(0,rot));
    // Si existe, completa primero una tercera mecánica distinta. El reto debe sentirse como tres juegos, no tres versiones de lo mismo.
    for(const fam of ['listen','recognize','construct']){
      if(out.length>=max||usedFamilies.has(fam))continue;
      const cand=ordered.filter(a=>quickFamily(a)===fam&&!usedSkills.has(a.skill)).sort((a,b)=>EmiliaMastery.skill(a.skill).score-EmiliaMastery.skill(b.skill).score)[0];
      if(cand)push(cand);
    }
    const ranked=ordered.slice().sort((a,b)=>{
      const af=usedFamilies.has(quickFamily(a))?1:0,bf=usedFamilies.has(quickFamily(b))?1:0;if(af!==bf)return af-bf;
      return EmiliaMastery.skill(a.skill).score-EmiliaMastery.skill(b.skill).score;
    });
    for(const a of ranked){push(a);if(out.length>=max)break;}
    return out.slice(0,max);
  }


  function rescuePool(){
    const state=EmiliaStore.get(),done=new Set(state.completedMissions||[]),allowed=new Set(['picturePick','imageWordPick','symbolPick','listenPick','gapFill','missingPart','build']),out=[];
    for(const m of (EMILIA_CONTENT.missions||[])){
      if(!done.has(m.id))continue;
      for(const a of (m.activities||[])){
        if(a.assess===false||!allowed.has(String(a.type||''))||!a.skill)continue;
        const mastery=EmiliaMastery.skill(a.skill),word=String(a.word||a.completeSay||a.say||a.answer||'').trim();
        if(!word||mastery.total===0)continue;
        const status=EmiliaMastery.status(a.skill),due=(mastery.dueSession||0)<=(state.sessions||0);
        if(status==='consolidated'&&!due)continue;
        out.push(Object.assign({},a,{sourceMission:m.id,rescueWord:word,rescueScore:mastery.score,rescueDue:due}));
      }
    }
    return out.sort((a,b)=>{
      if(a.rescueDue!==b.rescueDue)return a.rescueDue?-1:1;
      if(a.rescueScore!==b.rescueScore)return a.rescueScore-b.rescueScore;
      return String(a.rescueWord).localeCompare(String(b.rescueWord),'es');
    });
  }
  function rescueCount(){return rescuePool().length;}
  function rescueWordActivities(max=3){
    const state=EmiliaStore.get(),pool=rescuePool();if(!pool.length)return [];
    const out=[],skills=new Set(),families=new Set(),words=new Set();
    const family=a=>quickFamily(a);
    const push=a=>{if(!a||out.length>=max||skills.has(a.skill))return false;const w=String(a.rescueWord||a.word||a.completeSay||a.say||a.answer||'').toLocaleLowerCase('es');if(words.has(w))return false;out.push(Object.assign({},a,{id:'rescue_'+a.id+'_'+(state.sessions||0)+'_'+out.length,review:true,rescueChallenge:true,sourceWord:w}));skills.add(a.skill);families.add(family(a));words.add(w);return true;};
    // Recupera primero lo más débil y, cuando es posible, cambia de mecánica en cada paso.
    for(const fam of ['recognize','listen','construct']){
      const cand=pool.find(a=>family(a)===fam&&!skills.has(a.skill));if(cand)push(cand);
    }
    for(const a of pool){push(a);if(out.length>=max)break;}
    return out.slice(0,max);
  }

  function learnedGapPool(){
    const done=new Set(EmiliaStore.get().completedMissions||[]),out=[];
    for(const m of (EMILIA_CONTENT.missions||[])){
      if(!done.has(m.id))continue;
      for(const a of (m.activities||[]))if(a.type==='gapFill')out.push(Object.assign({},a,{sourceMission:m.id}));
    }
    return out;
  }
  function gapPracticeCount(){return learnedGapPool().length;}
  function gapPracticeActivities(max=5){
    const pool=learnedGapPool();if(!pool.length)return [];
    const seed=(EmiliaStore.get().sessions||0)+1,rot=seed%pool.length,ordered=pool.slice(rot).concat(pool.slice(0,rot)),out=[],seen=new Set();
    for(const a of ordered){const key=a.skill+'|'+a.mode;if(seen.has(key)&&out.length<Math.min(3,max))continue;seen.add(key);out.push(Object.assign({},a,{id:'gap_practice_'+a.id+'_'+seed,review:true,gapPractice:true}));if(out.length>=max)break;}
    if(out.length<Math.min(max,pool.length))for(const a of ordered){if(out.some(x=>x.id.includes(a.id+'_')))continue;out.push(Object.assign({},a,{id:'gap_practice_'+a.id+'_'+seed+'_b',review:true,gapPractice:true}));if(out.length>=max)break;}
    return out;
  }
  window.EmiliaScheduler={candidates,dueCount,injectReviews,practiceActivities,weakestTaught,adaptiveReviews,quickChallengeCount,quickChallengeActivities,rescueCount,rescueWordActivities,gapPracticeCount,gapPracticeActivities};
})();
