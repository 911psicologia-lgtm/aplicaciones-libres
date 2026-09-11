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
  window.EmiliaScheduler={candidates,dueCount,injectReviews,practiceActivities,weakestTaught,adaptiveReviews,gapPracticeCount,gapPracticeActivities};
})();
