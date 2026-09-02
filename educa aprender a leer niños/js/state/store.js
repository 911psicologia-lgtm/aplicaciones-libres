(function(){
  const KEY='emilia.reader.v3';
  const PREV='emilia.reader.v2';
  const PREV2='emilia.reader.v1';
  const LEGACY='emilia.v3';
  function base(){
    return {
      version:3,
      profile:{name:'',mascot:'lumi'},
      mastery:{},
      history:[],
      completedMissions:[],
      seeds:0,
      sessions:0,
      lastMission:'forest_vowels',
      lastStory:'',
      settings:{screenLimit:15,voiceRate:.66,listeningPace:'slow',repeatShortAudio:true,sound:true,reducedMotion:false},
      growth:{stage:0,plants:0,fireflies:0},
      legacy:null,
      createdAt:Date.now(),
      updatedAt:Date.now()
    };
  }
  function mergeState(raw){
    const b=base();
    const s=Object.assign(b,raw||{});
    s.version=3;
    s.profile=Object.assign(b.profile,(raw&&raw.profile)||{});
    s.mastery=(raw&&raw.mastery)||{};
    s.history=Array.isArray(raw&&raw.history)?raw.history:[];
    s.completedMissions=Array.isArray(raw&&raw.completedMissions)?raw.completedMissions:[];
    s.settings=Object.assign(b.settings,(raw&&raw.settings)||{});
    s.growth=Object.assign(b.growth,(raw&&raw.growth)||{});
    s.updatedAt=Date.now();
    return s;
  }
  function load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw)return mergeState(JSON.parse(raw));
      const prev=localStorage.getItem(PREV)||localStorage.getItem(PREV2);
      if(prev){
        const migrated=mergeState(JSON.parse(prev));
        migrated.legacy=Object.assign({},migrated.legacy||{},{from:localStorage.getItem(PREV)?'emilia.reader.v2':'emilia.reader.v1',migratedAt:Date.now()});
        return migrated;
      }
      const legacy=localStorage.getItem(LEGACY);
      if(legacy){
        const old=JSON.parse(legacy),s=base();
        s.profile.name=old.name||'';
        s.legacy={from:'emilia.v3',xp:old.xp||0,gems:old.gems||0,lessonsCompleted:old.lessonsCompleted||0,migratedAt:Date.now()};
        return s;
      }
    }catch(e){console.warn('No se pudo cargar el progreso',e);}
    return base();
  }
  let state=load();
  function save(){state.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('No se pudo guardar',e);}}
  function get(){return state;}
  function setState(next){state=mergeState(next);save();return state;}
  function patch(p){state=Object.assign(state,p);save();return state;}
  function reset(){state=base();save();return state;}
  function event(type,data){state.history.push(Object.assign({t:Date.now(),type},data||{}));if(state.history.length>900)state.history=state.history.slice(-900);save();}
  function exportJSON(){return JSON.stringify(state,null,2);}
  function importJSON(raw){const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object')throw new Error('Formato inválido');state=mergeState(parsed);save();return state;}
  window.EmiliaStore={get,setState,patch,save,reset,event,exportJSON,importJSON,KEY};
})();
