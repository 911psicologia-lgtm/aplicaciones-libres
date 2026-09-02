(function(){
  const KEY='emilia.reader.v4';
  const PREV=['emilia.reader.v3','emilia.reader.v2','emilia.reader.v1'];
  const LEGACY='emilia.v3';
  const REGISTRY='emilia.reader.profiles.v1';
  function uid(){return 'kid_'+Math.random().toString(36).slice(2,9)+'_'+Date.now().toString(36);}
  function base(){
    return {
      version:4.0,
      profile:{id:'',name:'',mascot:'lumi',remember:true},
      mastery:{},history:[],completedMissions:[],achievements:[],seeds:0,sessions:0,
      lastMission:'forest_vowels',lastStory:'',activeSession:null,
      settings:{screenLimit:15,voiceRate:.66,listeningPace:'slow',repeatShortAudio:false,sound:true,reducedMotion:false},
      growth:{stage:0,plants:0,fireflies:0},legacy:null,createdAt:Date.now(),updatedAt:Date.now()
    };
  }
  function mergeState(raw){
    const b=base(),s=Object.assign({},b,raw||{}),priorVersion=Number((raw&&raw.version)||0);
    s.version=4.0;s.profile=Object.assign({},b.profile,(raw&&raw.profile)||{});
    s.mastery=(raw&&raw.mastery)||{};s.history=Array.isArray(raw&&raw.history)?raw.history:[];
    s.completedMissions=Array.isArray(raw&&raw.completedMissions)?raw.completedMissions:[];s.achievements=Array.isArray(raw&&raw.achievements)?raw.achievements:[];
    s.settings=Object.assign({},b.settings,(raw&&raw.settings)||{});s.growth=Object.assign({},b.growth,(raw&&raw.growth)||{});
    if(priorVersion<3.2&&s.settings.repeatShortAudio===true)s.settings.repeatShortAudio=false;
    if(!('activeSession' in s))s.activeSession=null;
    s.updatedAt=Date.now();return s;
  }
  function readRegistry(){try{const r=JSON.parse(localStorage.getItem(REGISTRY)||'[]');return Array.isArray(r)?r:[];}catch(e){return [];}}
  function writeRegistry(list){try{localStorage.setItem(REGISTRY,JSON.stringify(list));}catch(e){console.warn('No se pudo guardar perfiles',e);}}
  function profileSummary(s){return {id:s.profile.id,name:s.profile.name,updatedAt:Date.now(),sessions:s.sessions||0,seeds:s.seeds||0,lastMission:s.lastMission||'forest_vowels',hasActiveSession:!!s.activeSession,state:s};}
  function saveToRegistry(s){
    if(!s||!s.profile||!s.profile.name||s.profile.remember===false)return;
    if(!s.profile.id)s.profile.id=uid();
    const list=readRegistry(),entry=profileSummary(JSON.parse(JSON.stringify(s))),idx=list.findIndex(x=>x.id===entry.id||x.name.toLowerCase()===entry.name.toLowerCase());
    if(idx>=0)list[idx]=entry;else list.push(entry);
    list.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));writeRegistry(list.slice(0,12));
  }
  function load(){
    try{
      const raw=localStorage.getItem(KEY);if(raw)return mergeState(JSON.parse(raw));
      for(const k of PREV){const p=localStorage.getItem(k);if(p){const s=mergeState(JSON.parse(p));s.legacy=Object.assign({},s.legacy||{},{from:k,migratedAt:Date.now()});return s;}}
      const legacy=localStorage.getItem(LEGACY);if(legacy){const old=JSON.parse(legacy),s=base();s.profile.name=old.name||'';s.legacy={from:'emilia.v3',xp:old.xp||0,gems:old.gems||0,lessonsCompleted:old.lessonsCompleted||0,migratedAt:Date.now()};return s;}
    }catch(e){console.warn('No se pudo cargar el progreso',e);}return base();
  }
  let state=load();
  function save(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('No se pudo guardar',e);}saveToRegistry(state);}
  function get(){return state;}
  function setState(next){state=mergeState(next);save();return state;}
  function patch(p){state=Object.assign(state,p);save();return state;}
  function reset(){state=base();save();return state;}
  function resetProgress(){const prof=Object.assign({},state.profile),settings=Object.assign({},state.settings);state=base();state.profile=prof;state.settings=settings;save();return state;}
  function event(type,data){state.history.push(Object.assign({t:Date.now(),type},data||{}));if(state.history.length>1200)state.history=state.history.slice(-1200);save();}
  function exportJSON(){return JSON.stringify(state,null,2);}
  function importJSON(raw){const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object')throw new Error('Formato inválido');state=mergeState(parsed);if(!state.profile.id)state.profile.id=uid();save();return state;}
  function listProfiles(){return readRegistry().map(x=>({id:x.id,name:x.name,updatedAt:x.updatedAt,sessions:x.sessions||0,seeds:x.seeds||0,lastMission:x.lastMission,hasActiveSession:!!x.hasActiveSession}));}
  function selectProfile(id){const item=readRegistry().find(x=>x.id===id);if(!item||!item.state)return false;state=mergeState(item.state);state.profile.remember=true;try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}return true;}
  function beginProfile(name,remember){
    name=String(name||'').trim().slice(0,18);if(!name)return false;
    const existing=readRegistry().find(x=>x.name.toLowerCase()===name.toLowerCase());
    if(existing&&existing.state){state=mergeState(existing.state);state.profile.remember=remember!==false;save();return state;}
    state=base();state.profile={id:uid(),name,mascot:'lumi',remember:remember!==false};save();return state;
  }
  function logoutToPicker(){saveToRegistry(state);state=base();state.profile.remember=true;try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}return state;}
  function saveActiveSession(sess){state.activeSession=sess?JSON.parse(JSON.stringify(sess)):null;save();}
  function clearActiveSession(){state.activeSession=null;save();}
  window.EmiliaStore={get,setState,patch,save,reset,resetProgress,event,exportJSON,importJSON,listProfiles,selectProfile,beginProfile,logoutToPicker,saveActiveSession,clearActiveSession,KEY,REGISTRY};
})();
