(()=> {
  'use strict';
  const data=()=>window.EASY_SPEAK_DATA||{};
  const STOP=new Set('the and for with that this from into about your you are was were have has had would could should really just very then than when where what which who how because but not yes yeah well like think know want need make made some more much many good great nice thing things people time today tomorrow yesterday there here'.split(' '));
  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  const fallback={name:'your name',city:'your city',country:'your country',role:'your work or studies'};
  const personalize=(text,profile={})=>String(text??'').replace(/\{\{(name|city|country|role)\}\}/g,(_,key)=>{
    const value=String(profile?.[key]||'').trim();return value||`[${fallback[key]}]`;
  });
  const materializeConversation=(conversation,profile={})=>{
    const c=JSON.parse(JSON.stringify(conversation));
    c.title=personalize(c.title,profile);c.topic=personalize(c.topic,profile);c.canDo=personalize(c.canDo,profile);
    c.turns=(c.turns||[]).map(t=>({
      ...t,prompt:personalize(t.prompt,profile),options:(t.options||[]).map(x=>personalize(x,profile)),
      everyday:personalize(t.everyday,profile),branches:(t.branches||[]).map(b=>({...b,prompt:personalize(b.prompt,profile)}))
    }));
    return c;
  };
  const queueFor=(level,profile={})=>{
    const D=data(),pick=arr=>arr.map(c=>materializeConversation(c,profile));
    if(['A1','A2','B1','B2'].includes(level))return pick(shuffle(D[level]||[]));
    if(level==='SCALAR')return ['A1','A2','B1','B2'].flatMap(l=>pick(shuffle(D[l]||[]).slice(0,2)));
    return pick(shuffle(['A1','A2','B1','B2'].flatMap(l=>D[l]||[])).slice(0,12));
  };
  const reinforcementConversation=(items,profile={})=>{
    const turns=(items||[]).map((x,i)=>({
      id:x.id||`R-T${i+1}`,prompt:personalize(x.prompt,profile),options:(x.options||[]).map(v=>personalize(v,profile)),
      everyday:personalize(x.everyday||x.options?.[3]||'',profile),keywords:x.keywords||[],targetWords:x.targetWords||8,
      reinforcement:true,originalLevel:x.level||'B1',openAnswer:!!x.openAnswer
    }));
    return {id:'REINFORCEMENT',level:'REVIEW',emoji:'↻',title:'Your reinforcements',topic:'Review',
      canDo:'Repair difficult phrases and make them easier to produce',functions:['repair','fluency'],estimatedMinutes:Math.max(2,Math.ceil(turns.length*.45)),turns};
  };
  const totalTurns=q=>(q||[]).reduce((n,c)=>n+(c.turns?.length||0),0);
  const salientMention=text=>{
    const words=String(text||'').toLowerCase().match(/[a-z']+/g)||[];
    const candidates=words.filter(w=>w.length>3&&!STOP.has(w));
    if(!candidates.length)return '';
    const freq=new Map();candidates.forEach(w=>freq.set(w,(freq.get(w)||0)+1));
    return [...freq.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length)[0]?.[0]||'';
  };
  const branchPrompt=(turn,score,nextTurn)=>{
    if(!turn||!nextTurn)return null;const transcript=String(score?.transcript||'').toLowerCase(),wc=score?.wordCount||0;
    for(const rule of turn.branches||[]){
      const wordsOk=!rule.minWords||wc>=rule.minWords;
      const anyOk=!rule.any?.length||rule.any.some(k=>transcript.includes(String(k).toLowerCase()));
      if(wordsOk&&anyOk&&rule.prompt)return rule.prompt;
    }
    if(turn.reactive){const mention=salientMention(transcript);if(mention)return `You mentioned “${mention}”. ${nextTurn.prompt}`}
    return null;
  };
  window.EasySpeakEngine={queueFor,reinforcementConversation,totalTurns,shuffle,personalize,branchPrompt,salientMention};
})();
