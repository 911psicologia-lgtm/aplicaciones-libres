(()=> {
  'use strict';
  const PROFILE_KEY='easySpeak.profile.v1';
  const STATS_KEY='easySpeak.stats.v1';
  const SCHEMA_VERSION=4;
  const defaultProfile={
    name:'',city:'',country:'',role:'',duration:10,level:'B1',mode:'guided',voiceRate:1,
    showTranscript:true,autoReinforce:true,weeklyGoal:3,preferLocalSpeech:false,tourSeen:false,pronunciationAutoSave:true,languageSupport:'off'
  };
  const defaultStats={
    points:0,scoreSum:0,scoreCount:0,bestMultiplier:1,conversations:0,turns:0,minutes:0,
    reinforcements:[],pronunciationItems:[],recentSessions:[],masteredReinforcements:0,pronunciationPractised:0,pronunciationStrong:0
  };
  let memoryProfile={...defaultProfile},memoryStats={...defaultStats};

  const safeGet=key=>{try{return localStorage.getItem(key)}catch{return null}};
  const safeSet=(key,value)=>{try{localStorage.setItem(key,value);return true}catch{return false}};
  const safeRemove=key=>{try{localStorage.removeItem(key)}catch{}};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const parse=(key,fallback,memory)=>{
    try{const raw=safeGet(key);return raw?{...fallback,...JSON.parse(raw)}:{...fallback,...memory}}
    catch{return {...fallback,...memory}}
  };
  const profile=()=>parse(PROFILE_KEY,defaultProfile,memoryProfile);
  const stats=()=>{
    const s=parse(STATS_KEY,defaultStats,memoryStats);
    if(!Array.isArray(s.reinforcements))s.reinforcements=[];
    if(!Array.isArray(s.pronunciationItems))s.pronunciationItems=[];
    if(!Array.isArray(s.recentSessions))s.recentSessions=[];
    return s;
  };
  const saveProfile=p=>{memoryProfile={...profile(),...p};safeSet(PROFILE_KEY,JSON.stringify(memoryProfile));return memoryProfile};
  const saveStats=s=>{memoryStats={...defaultStats,...s};safeSet(STATS_KEY,JSON.stringify(memoryStats));return memoryStats};

  const stageFor=(score=0,successes=0)=>{
    if(successes>=2&&score>=85)return 'Strong';
    if(score>=80)return 'Improving';
    if(score>=65)return 'Practising';
    return 'New';
  };
  const addSession=session=>{
    const s=stats();
    s.points+=(session.points||0);s.scoreSum+=(session.score||0);s.scoreCount+=session.turns?1:0;
    s.bestMultiplier=Math.max(s.bestMultiplier||1,session.bestMultiplier||1);
    s.conversations+=(session.conversations||0);s.turns+=(session.turns||0);s.minutes+=session.minutes||0;
    const compact={
      date:new Date().toISOString(),level:session.level,mode:session.mode,score:session.score,points:session.points,
      turns:session.turns,minutes:session.minutes,communication:session.communication,fluency:session.fluency,
      clarity:session.clarity,voice:session.voice,repairedTurns:session.repairedTurns||0,totalImprovement:session.totalImprovement||0,
      canDos:Array.isArray(session.canDos)?session.canDos.slice(0,8):[]
    };
    s.recentSessions=[compact,...s.recentSessions].slice(0,24);
    saveStats(s);return s;
  };
  const addReinforcements=items=>{
    const s=stats(),map=new Map((s.reinforcements||[]).map(x=>[x.id,x]));
    for(const item of items||[]){
      const old=map.get(item.id),lastScore=Number(item.lastScore??old?.lastScore??0);
      if(old){
        const successes=lastScore>=85?(old.successfulReviews||0):Math.max(0,(old.successfulReviews||0)-1);
        map.set(item.id,{...old,...item,count:(old.count||1)+1,lastSeen:new Date().toISOString(),lastScore,
          successfulReviews:successes,mastered:false,stage:stageFor(lastScore,successes)});
      }else map.set(item.id,{...item,count:1,lastSeen:new Date().toISOString(),lastScore,successfulReviews:0,mastered:false,stage:stageFor(lastScore,0)});
    }
    s.reinforcements=Array.from(map.values()).sort((a,b)=>(a.mastered-b.mastered)||((b.count||1)-(a.count||1))).slice(0,60);
    s.masteredReinforcements=s.reinforcements.filter(x=>x.mastered).length;saveStats(s);return s.reinforcements;
  };
  const reviewReinforcement=(id,score)=>{
    const s=stats(),item=(s.reinforcements||[]).find(x=>x.id===id);if(!item)return s;
    item.lastScore=score;item.lastSeen=new Date().toISOString();
    item.successfulReviews=score>=85?(item.successfulReviews||0)+1:0;
    item.stage=stageFor(score,item.successfulReviews);item.mastered=item.stage==='Strong';
    s.masteredReinforcements=s.reinforcements.filter(x=>x.mastered).length;saveStats(s);return s;
  };

  const pronunciationStageFor=(score=0,successes=0)=>{
    if(successes>=2&&score>=88)return 'Strong';
    if(score>=82)return 'Improving';
    if(score>=65)return 'Practising';
    return 'New';
  };
  const addPronunciationItems=items=>{
    const s=stats(),map=new Map((s.pronunciationItems||[]).map(x=>[x.id,x]));
    for(const item of items||[]){
      if(!item?.id||!item?.text)continue;
      const old=map.get(item.id),lastScore=Number(item.lastScore??old?.lastScore??0);
      if(old)map.set(item.id,{...old,...item,count:(old.count||1)+1,lastSeen:new Date().toISOString(),
        lastScore,bestScore:Math.max(old.bestScore||0,lastScore),mastered:old.mastered||false,
        stage:old.mastered?'Strong':pronunciationStageFor(Math.max(lastScore,old.bestScore||0),old.successfulReviews||0)});
      else map.set(item.id,{...item,count:1,lastSeen:new Date().toISOString(),lastScore,bestScore:lastScore,
        practiceCount:0,successfulReviews:0,mastered:false,stage:pronunciationStageFor(lastScore,0)});
    }
    s.pronunciationItems=Array.from(map.values()).sort((a,b)=>(a.mastered-b.mastered)||((b.count||1)-(a.count||1))||((a.bestScore||0)-(b.bestScore||0))).slice(0,90);
    s.pronunciationStrong=s.pronunciationItems.filter(x=>x.mastered).length;saveStats(s);return s.pronunciationItems;
  };
  const reviewPronunciation=(id,score)=>{
    const s=stats(),item=(s.pronunciationItems||[]).find(x=>x.id===id);if(!item)return s;
    const n=Number(score)||0;item.lastScore=n;item.bestScore=Math.max(item.bestScore||0,n);item.lastSeen=new Date().toISOString();
    item.practiceCount=(item.practiceCount||0)+1;item.successfulReviews=n>=88?(item.successfulReviews||0)+1:Math.max(0,(item.successfulReviews||0)-1);
    item.stage=pronunciationStageFor(item.bestScore,item.successfulReviews);item.mastered=item.stage==='Strong';
    s.pronunciationPractised=(s.pronunciationPractised||0)+1;s.pronunciationStrong=s.pronunciationItems.filter(x=>x.mastered).length;
    saveStats(s);return s;
  };
  const touchPronunciation=id=>{
    const s=stats(),item=(s.pronunciationItems||[]).find(x=>x.id===id);if(!item)return s;
    item.practiceCount=(item.practiceCount||0)+1;item.lastSeen=new Date().toISOString();if(item.stage==='New')item.stage='Practising';s.pronunciationPractised=(s.pronunciationPractised||0)+1;saveStats(s);return s;
  };
  const activePronunciation=()=>stats().pronunciationItems.filter(x=>!x.mastered);
  const clearPronunciation=()=>{const s=stats();s.pronunciationItems=[];s.pronunciationStrong=0;saveStats(s)};

  const activeReinforcements=()=>stats().reinforcements.filter(x=>!x.mastered);
  const clearReinforcements=()=>{const s=stats();s.reinforcements=[];s.masteredReinforcements=0;saveStats(s)};
  const weeklyCount=(days=7)=>{const cutoff=Date.now()-days*86400000;return stats().recentSessions.filter(x=>new Date(x.date).getTime()>=cutoff).length};
  const exportBundle=()=>({schemaVersion:SCHEMA_VERSION,app:'Easy Speak',exportedAt:new Date().toISOString(),profile:clone(profile()),stats:clone(stats())});
  const restoreBundle=bundle=>{
    if(!bundle||typeof bundle!=='object'||!bundle.profile||!bundle.stats)throw new Error('Invalid Easy Speak backup');
    const p={...defaultProfile,...bundle.profile},s={...defaultStats,...bundle.stats};
    if(!Array.isArray(s.reinforcements))s.reinforcements=[];if(!Array.isArray(s.pronunciationItems))s.pronunciationItems=[];if(!Array.isArray(s.recentSessions))s.recentSessions=[];
    memoryProfile=p;memoryStats=s;safeSet(PROFILE_KEY,JSON.stringify(p));safeSet(STATS_KEY,JSON.stringify(s));return {profile:p,stats:s};
  };
  const reset=()=>{safeRemove(PROFILE_KEY);safeRemove(STATS_KEY);memoryProfile={...defaultProfile};memoryStats={...defaultStats}};

  window.EasySpeakStorage={
    profile,stats,saveProfile,saveStats,addSession,addReinforcements,reviewReinforcement,activeReinforcements,
    clearReinforcements,addPronunciationItems,reviewPronunciation,touchPronunciation,activePronunciation,clearPronunciation,
    weeklyCount,exportBundle,restoreBundle,reset,stageFor,pronunciationStageFor,SCHEMA_VERSION
  };
})();
