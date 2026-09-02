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
    const missions=EMILIA_CONTENT.missions.slice().sort((a,b)=>a.order-b.order);
    const s=EmiliaStore.get();
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
  function buildSession(mission){
    const reviews=EmiliaScheduler.injectReviews(mission,2);
    const acts=reviews.concat(mission.activities.map(a=>Object.assign({},a)));
    return {kind:'mission',missionId:mission.id,title:mission.title,activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:reviews.length,minAssessed:4,maxAssessed:7,endedAdaptively:false};
  }
  function buildPracticeSession(){
    const acts=EmiliaScheduler.practiceActivities(5);
    if(!acts.length)return buildSession(missionById('forest_vowels'));
    return {kind:'practice',missionId:null,title:'Semillas que vuelven',activities:acts,index:0,hits:0,independentHits:0,errors:0,startedAt:Date.now(),attempts:{},reviewCount:acts.length,minAssessed:3,maxAssessed:5,endedAdaptively:false};
  }

  function assessedSoFar(session){return session.activities.slice(0,session.index+1).filter(a=>a.assess!==false).length;}
  function shouldEnd(session){
    const n=assessedSoFar(session);if(n<(session.minAssessed||4))return false;
    const independence=n?session.independentHits/n:0;
    if(session.kind==='practice')return independence>=.8 && session.errors<=1;
    const m=missionById(session.missionId),score=EmiliaMastery.missionScore(m);
    if(n>=(session.maxAssessed||7))return true;
    return independence>=.8 && score>=(m.masteryTarget||58) && session.errors<=1;
  }

  function finish(session){
    const s=EmiliaStore.get();
    const assessed=session.activities.filter(a=>a.assess!==false).length;
    const pct=assessed?Math.round(100*session.independentHits/assessed):100;
    let seeds=session.kind==='practice'?1:(pct>=90?3:pct>=70?2:1);
    s.seeds=(s.seeds||0)+seeds;s.sessions=(s.sessions||0)+1;
    if(session.kind==='mission'&&session.missionId){
      if(!s.completedMissions.includes(session.missionId))s.completedMissions.push(session.missionId);
      s.lastMission=session.missionId;
    }
    const growth=s.growth||(s.growth={stage:0,plants:0,fireflies:0});growth.plants=Math.max(growth.plants||0,s.seeds||0);growth.fireflies=Math.min(18,Math.floor((s.seeds||0)/2));growth.stage=Math.min(4,Math.floor((s.seeds||0)/5));
    EmiliaStore.event('session_end',{kind:session.kind,missionId:session.missionId,pct,seeds,errors:session.errors,reviews:session.reviewCount||0,adaptive:!!session.endedAdaptively});
    EmiliaStore.save();
    return {kind:session.kind,pct,seeds,total:assessed,hits:session.independentHits,elapsed:Math.round((Date.now()-session.startedAt)/1000),reviewCount:session.reviewCount||0,adaptive:!!session.endedAdaptively,next:recommendedMission()};
  }
  function unlockedStories(){return EMILIA_CONTENT.stories.filter(st=>EmiliaMastery.prereqsMet(st.requires||[]));}
  function recommendedStory(){const arr=unlockedStories();return arr[arr.length-1]||null;}
  window.EmiliaEngine={missionById,isUnlocked,status,worldState,recommendedMission,buildSession,buildPracticeSession,assessedSoFar,shouldEnd,finish,unlockedStories,recommendedStory};
})();
