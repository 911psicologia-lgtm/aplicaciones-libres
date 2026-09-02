(function(){
  function empty(){return {correct:0,total:0,assisted:0,score:0,lastSeen:0,streak:0,strength:0,dueSession:0,lastResult:null};}
  function skill(id){const s=EmiliaStore.get();return Object.assign(empty(),s.mastery[id]||{});}
  function calculate(m){
    if(!m.total)return 0;
    const accuracy=m.correct/m.total;
    const independence=Math.max(0,1-(m.assisted/m.total)*.65);
    const evidence=Math.min(1,m.total/4);
    const quality=(accuracy*.72+independence*.28);
    return Math.round(100*quality*(.55+.45*evidence));
  }
  function record(id,ok,assisted,meta){
    if(!id)return empty();
    const s=EmiliaStore.get(),m=skill(id),curSession=s.sessions||0;
    m.total+=1;if(ok)m.correct+=1;if(assisted)m.assisted+=1;
    m.streak=ok?m.streak+1:0;m.lastSeen=Date.now();m.lastResult=ok?'ok':'error';
    if(ok&&!assisted)m.strength=Math.min(5,(m.strength||0)+1);
    else if(!ok)m.strength=Math.max(0,(m.strength||0)-1);
    const intervals=[1,1,2,4,7,12];
    m.dueSession=curSession+(ok&&!assisted?intervals[m.strength]:(ok?1:0));
    m.score=calculate(m);s.mastery[id]=m;
    EmiliaStore.event('answer',{skill:id,ok:!!ok,assisted:!!assisted,score:m.score,review:!!(meta&&meta.review)});
    return m;
  }
  function status(id){const m=skill(id);if(!m.total)return 'new';if(m.score>=80&&m.total>=3)return 'consolidated';if(m.score>=55)return 'developing';return 'practice';}
  function summary(){return EMILIA_CONTENT.skills.map(d=>{const m=skill(d.id);return {id:d.id,label:d.label,group:d.group,score:m.score,total:m.total,status:status(d.id),dueSession:m.dueSession};});}
  function missionScore(mission){const rows=mission.skillIds.map(id=>skill(id)).filter(m=>m.total>0);if(!rows.length)return 0;return Math.round(rows.reduce((a,m)=>a+m.score,0)/rows.length);}
  function prereqsMet(reqs){return (reqs||[]).every(r=>{
    if(r.mission)return EmiliaStore.get().completedMissions.includes(r.mission);
    if(r.skill)return skill(r.skill).score>=(r.score||0);
    return true;
  });}
  function skillDef(id){return EMILIA_CONTENT.skills.find(x=>x.id===id);}
  window.EmiliaMastery={skill,record,status,summary,missionScore,prereqsMet,skillDef};
})();
