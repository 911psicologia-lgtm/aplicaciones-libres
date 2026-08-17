(()=> {
  'use strict';
  const Scoring=window.EasySpeakScoring;
  const STOP=new Set("a an the and or but i you he she it we they my your his her our their to of in on at for from with is are am was were be been being do does did have has had can could would should will just very really about this that these those there here then than into over under after before because so if not yeah yes well okay ok".split(' '));
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const clean=t=>String(t||'').trim().replace(/\s+/g,' ');
  const words=t=>(clean(t).toLowerCase().match(/[a-z']+/g)||[]);
  const contentWords=t=>words(t).filter(w=>w.length>2&&!STOP.has(w));
  const keyText=t=>clean(t).toLowerCase().replace(/[^a-z0-9']+/g,' ').trim();
  const idFor=(sourceId,type,text)=>`P-${String(sourceId||'turn').replace(/[^a-z0-9-]/gi,'')}-${type}-${keyText(text).replace(/\s+/g,'-').slice(0,54)}`;
  const phraseWords=text=>clean(text).replace(/[.!?]+$/,'').split(/\s+/).filter(Boolean);
  const chunkAround=(text,target)=>{
    const arr=phraseWords(text),low=arr.map(x=>x.toLowerCase().replace(/[^a-z']/g,'')),idx=low.indexOf(target);
    if(idx<0)return arr.slice(0,Math.min(5,arr.length)).join(' ');
    const start=Math.max(0,idx-1),end=Math.min(arr.length,start+4);return arr.slice(Math.max(0,end-4),end).join(' ');
  };
  const shortPhrase=(text,target)=>{
    const arr=phraseWords(text);if(arr.length<=9)return arr.join(' ');
    const low=arr.map(x=>x.toLowerCase().replace(/[^a-z']/g,'')),idx=low.indexOf(target);
    if(idx<0)return arr.slice(0,9).join(' ');
    let start=Math.max(0,idx-3);if(start+9>arr.length)start=Math.max(0,arr.length-9);return arr.slice(start,start+9).join(' ');
  };
  const deriveItems=(turn,score,meta={})=>{
    if(!turn||!score?.transcript)return [];
    const models=(meta.models||turn.options||[]).filter(Boolean),idx=Number.isInteger(score.bestOptionIndex)?score.bestOptionIndex:0,target=clean(models[idx]||models[0]||'');
    if(!target)return [];
    const spoken=new Set(contentWords(score.transcript)),tWords=contentWords(target);
    let focus=tWords.filter(w=>!spoken.has(w));
    if(!focus.length&&(score.clarity<80||meta.attemptCount>1))focus=[...new Set(tWords)].sort((a,b)=>b.length-a.length).slice(0,2);
    focus=[...new Set(focus)].filter(w=>w.length>=4).slice(0,2);
    if(!focus.length)return [];
    const primary=focus[0],base={sourceTurnId:turn.id,sourcePrompt:turn.prompt,level:meta.level||'B1',topic:meta.topic||'Practice',lastScore:score.clarity||score.total||0,reason:meta.attemptCount>1?'Needed extra repetition':'Needed extra recognition'};
    const out=[];
    out.push({...base,id:idFor(turn.id,'word',primary),type:'word',text:primary,focus:primary});
    const chunk=chunkAround(target,primary);if(words(chunk).length>=2)out.push({...base,id:idFor(turn.id,'chunk',chunk),type:'chunk',text:chunk,focus:primary});
    const phrase=shortPhrase(target,primary);if(words(phrase).length>=5&&keyText(phrase)!==keyText(chunk))out.push({...base,id:idFor(turn.id,'phrase',phrase),type:'phrase',text:phrase,focus:primary});
    if(focus[1]&&out.length<3)out.push({...base,id:idFor(turn.id,'word',focus[1]),type:'word',text:focus[1],focus:focus[1]});
    return out.slice(0,3);
  };
  const evaluate=(item,result)=>{
    const transcript=clean(result?.transcript),target=clean(item?.text);if(!transcript)return {score:null,transcript:'',confidence:result?.confidence??null,manual:true};
    const sim=Scoring?.similarity?Scoring.similarity(transcript,[target],contentWords(target)):0;
    const tw=words(target),sw=words(transcript),lengthMatch=Math.min(1,sw.length/Math.max(1,tw.length));
    const exact=keyText(transcript)===keyText(target),confidence=typeof result?.confidence==='number'?result.confidence:null;
    let score=exact?96:Math.round(sim*72+lengthMatch*13+(confidence==null?8:confidence*15));
    if(item?.type==='word'&&sw.includes(keyText(target)))score=Math.max(score,92);
    return {score:clamp(score,35,99),transcript,confidence,similarity:sim,durationMs:result?.durationMs||0,audioUrl:result?.audioUrl||null,manual:false};
  };
  const feedback=score=>{
    if(score==null)return ['Listen and compare','Use My Voice to compare your attempt with the model.'];
    if(score>=90)return ['Strong','The browser recognised this very consistently.'];
    if(score>=80)return ['Much clearer','Good recognition. One more natural repetition can make it easier to retrieve.'];
    if(score>=65)return ['Getting closer','Keep the same chunk and smooth the rhythm once more.'];
    return ['Try the shape again','Listen slowly, repeat the whole chunk and avoid separating every word.'];
  };
  const stage=(score=0,successes=0)=>successes>=2&&score>=88?'Strong':score>=82?'Improving':score>=65?'Practising':'New';
  window.EasySpeakPronunciation={deriveItems,evaluate,feedback,stage,words,keyText};
})();
