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
  function dueCount(){return candidates([]).length;}
  function injectReviews(mission,max=2){
    const due=candidates(mission.skillIds).slice(0,max).map(cloneActivity);
    return due;
  }
  function weakestTaught(max=5){
    return EmiliaMastery.summary().filter(r=>r.total>0).sort((a,b)=>a.score-b.score).slice(0,max);
  }
  function practiceActivities(max=5){
    let pool=candidates([]);
    if(!pool.length){
      const ids=new Set(weakestTaught(max).map(x=>x.id));
      pool=EMILIA_CONTENT.reviewActivities.filter(a=>ids.has(a.skill));
    }
    const seen=new Set(),out=[];
    for(const a of pool){if(seen.has(a.skill))continue;seen.add(a.skill);out.push(cloneActivity(a));if(out.length>=max)break;}
    return out;
  }
  window.EmiliaScheduler={candidates,dueCount,injectReviews,practiceActivities,weakestTaught};
})();
