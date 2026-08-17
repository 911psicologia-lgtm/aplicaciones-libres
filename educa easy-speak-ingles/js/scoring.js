(()=> {
  'use strict';
  const STOP=new Set("a an the and or but i you he she it we they my your his her our their to of in on at for from with is are am was were be been being do does did have has had can could would should will just very really about this that these those there here then than into over under after before because so if not".split(' '));
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const words=t=>(t||'').toLowerCase().match(/[a-z']+/g)||[];
  const content=t=>words(t).filter(w=>w.length>2&&!STOP.has(w));
  const optionSimilarity=(spoken,opt)=>{
    const sw=new Set(content(spoken)),ow=new Set(content(opt));if(!sw.size||!ow.size)return 0;
    const inter=[...sw].filter(w=>ow.has(w)).length,union=new Set([...sw,...ow]).size||1;
    return inter/union*.42+inter/(ow.size||1)*.58;
  };
  const similarityDetails=(spoken,options,keywords=[])=>{
    const sw=new Set(content(spoken));if(!sw.size)return {score:0,bestOptionIndex:0,keywordHit:0};
    let best=0,bestOptionIndex=0;
    (options||[]).forEach((opt,i)=>{const s=optionSimilarity(spoken,opt);if(s>best){best=s;bestOptionIndex=i}});
    const clean=[...new Set((keywords||[]).map(k=>String(k).toLowerCase()).filter(Boolean))];
    const kw=clean.length?clean.filter(k=>sw.has(k)).length/Math.min(clean.length,6):0;
    return {score:clamp(best*.78+Math.min(1,kw)*.22,0,1),bestOptionIndex,keywordHit:clamp(kw,0,1)};
  };
  const similarity=(spoken,options,keywords=[])=>similarityDetails(spoken,options,keywords).score;
  const fluencyScore=(wordCount,durationMs,level)=>{
    if(!durationMs||durationMs<500)return 58;
    const wpm=wordCount/(durationMs/60000),bands={A1:[45,115],A2:[55,130],B1:[65,145],B2:[75,160]};
    const [lo,hi]=bands[level]||bands.B1;
    if(wpm>=lo&&wpm<=hi)return clamp(84+Math.min(12,(wpm-lo)/(hi-lo)*12));
    if(wpm<lo)return clamp(84-(lo-wpm)*.8,42,84);
    return clamp(88-(wpm-hi)*.45,48,88);
  };
  const voiceScore=rms=>{
    if(rms==null||!Number.isFinite(rms))return 70;
    if(rms>=.025&&rms<=.18)return 90;
    if(rms<.025)return clamp(45+rms/.025*42,45,87);
    return clamp(88-(rms-.18)*110,55,88);
  };
  const minimumUsefulWords=(target,level)=>{
    const factor={A1:.40,A2:.40,B1:.34,B2:.30}[level]||.38;
    const floor={A1:2,A2:3,B1:4,B2:5}[level]||3;
    return Math.max(floor,Math.round(Math.max(4,target||8)*factor));
  };
  const evaluate=(turn,result,level)=>{
    const transcript=(result?.transcript||'').trim(),wc=words(transcript).length;
    const details=similarityDetails(transcript,turn.options||[],turn.keywords||[]),sim=details.score;
    const target=Math.max(4,turn.targetWords||8),minWords=minimumUsefulWords(target,level);
    const completeness=clamp(wc/target,0,1.25),incomplete=wc<minWords;
    let communication;
    if(turn.openAnswer){
      // Open questions should reward answering with enough connected language rather than copying a model sentence.
      const lengthSignal=clamp(wc/Math.max(minWords,Math.min(target,16)),0,1);
      communication=clamp(48+lengthSignal*28+details.keywordHit*12+sim*10-(incomplete?10:0),32,98);
    }else{
      communication=clamp(36+sim*49+Math.min(15,completeness*15)-(incomplete?8:0),30,100);
    }
    const fluency=fluencyScore(wc,result?.durationMs,level);
    const conf=typeof result?.confidence==='number'?result.confidence:null;
    const clarity=conf==null?clamp(55+sim*28+(wc?8:0),45,90):clamp(48+conf*48,42,98);
    const voice=voiceScore(result?.rms);
    const total=Math.round(communication*.44+fluency*.27+clarity*.21+voice*.08-(incomplete?5:0));
    return {total:clamp(total),communication:Math.round(communication),fluency:Math.round(fluency),clarity:Math.round(clarity),voice:Math.round(voice),wpm:result?.durationMs?Math.round(wc/(result.durationMs/60000)):0,transcript,wordCount:wc,targetWords:target,minWords,incomplete,completeness:Math.round(clamp(completeness*100,0,100)),bestOptionIndex:details.bestOptionIndex,audioUrl:result?.audioUrl||null};
  };
  const manual=(turn,choiceIndex=0)=>({total:76,communication:82,fluency:70,clarity:68,voice:70,wpm:0,transcript:turn.options?.[choiceIndex]||'',wordCount:0,targetWords:turn.targetWords||8,minWords:0,incomplete:false,completeness:100,bestOptionIndex:choiceIndex,audioUrl:null});
  const feedback=input=>{
    const score=typeof input==='number'?{total:input}:input||{total:0};
    if(score.incomplete)return ['Answer incomplete','Good start. Add one more idea so the answer feels complete, then say it again.'];
    const s=score.total||0;
    if(s>=90)return ['Excellent flow','Your message was clear, connected and confident in this turn.'];
    if(s>=80)return ['Strong turn','Your response connected well to the question. Keep the rhythm.'];
    if(s>=65)return ['Good — make it automatic','The message worked. Say it once more with the same idea and a smoother rhythm.'];
    return ['Let’s repair this turn','Listen to a model, keep the meaning and try the answer again in your own voice.'];
  };
  const needsRepair=score=>!!score&&(score.incomplete||score.total<65||score.communication<62);
  window.EasySpeakScoring={evaluate,manual,feedback,similarity,needsRepair,words};
})();
