(function(){
  let voices=[];
  let ctx=null;
  let seq=0;
  function refresh(){try{voices=speechSynthesis.getVoices()||[];}catch(e){voices=[];}}
  refresh();
  if('speechSynthesis' in window && 'onvoiceschanged' in speechSynthesis)speechSynthesis.onvoiceschanged=refresh;

  function score(v){
    const lang=(v.lang||'').toLowerCase(),name=(v.name||'').toLowerCase();let n=0;
    if(lang==='es-co')n+=110;else if(lang.startsWith('es-co'))n+=100;else if(lang.startsWith('es-mx'))n+=88;else if(lang.startsWith('es-es'))n+=78;else if(lang.startsWith('es-'))n+=72;else if(lang.startsWith('es'))n+=58;
    if(/google|microsoft|paulina|helena|monica|dalia|sabina|luciana|elvira/.test(name))n+=18;
    if(v.localService)n+=12;
    if(v.default)n+=4;
    if(/english|uk|united states|francais|deutsch/.test(name))n-=25;
    return n;
  }
  function choose(){return voices.slice().sort((a,b)=>score(b)-score(a))[0]||null;}
  function describeVoice(){const v=choose();return v?{name:v.name||'voz',lang:v.lang||'es',local:!!v.localService,default:!!v.default}:{name:'sin voz detectada',lang:'es',local:false,default:false};}
  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function settings(){
    const s=(window.EmiliaStore&&EmiliaStore.get)?EmiliaStore.get():null;
    return (s&&s.settings)||{};
  }
  function isDesktop(){
    const ua=navigator.userAgent||'';
    return !/android|iphone|ipad|ipod/i.test(ua);
  }
  function paceMultiplier(){
    const p=settings().listeningPace||'slow';
    const base=(p==='verySlow'?.84:p==='normal'?1:.94);
    return isDesktop()?base*.95:base;
  }
  function kindFor(text,opts){
    if(opts&&opts.kind)return opts.kind;
    const t=String(text||'').trim();
    if(t.length===1||/^([a-záéíóúñ]){2,}$/i.test(t))return 'phoneme';
    if(!/\s/.test(t)&&t.length<=4)return 'syllable';
    if(!/\s/.test(t)&&t.length<=12)return 'word';
    if(/[.!?]$/.test(t)||t.split(/\s+/).length>4)return 'sentence';
    return 'instruction';
  }
  function baseRate(kind){
    return ({phoneme:.56,syllable:.61,word:.70,sentence:.74,instruction:.78,praise:.84})[kind]||.76;
  }
  function rateFor(text,opts){
    if(opts&&typeof opts.rate==='number')return opts.rate;
    const k=kindFor(text,opts||{}),mult=paceMultiplier();
    const custom=settings().voiceRate;
    const fine=(typeof custom==='number'&&custom<.8)?Math.max(.82,Math.min(1.08,custom/.66)):1;
    const desktopSlow=isDesktop()&&(/sentence|instruction/.test(k)?0.90:0.95);
    return Math.max(.32,Math.min(.82,baseRate(k)*mult*fine*desktopSlow));
  }
  function repeatFor(text,opts){
    if(opts&&typeof opts.repeat==='number')return Math.max(1,Math.min(3,opts.repeat));
    if(opts&&opts.repeat===false)return 1;
    const k=kindFor(text,opts||{});
    const auto=settings().repeatShortAudio===true;
    return auto&&(k==='phoneme'||k==='syllable')?2:1;
  }
  function normalizeText(text,opts={}){
    const kind=kindFor(text,opts);
    let t=String(text||'').trim();
    t=t.replace(/[→⇢➜➡]+/g,'. ').replace(/[·•]+/g,'... ').replace(/[|]/g,', ').replace(/:/g,'. ').replace(/\s+/g,' ').trim();
    if(kind==='phoneme'){
      const lower=t.toLowerCase();
      if(lower.length===1){
        if(lower==='m')return 'mmm';
        if(lower==='s')return 'sss';
        if(lower==='f')return 'fff';
        return lower;
      }
    }
    if(kind==='syllable'||kind==='word')return t.toLowerCase();
    return t;
  }
  function chunkText(text,opts={}){
    const kind=kindFor(text,opts);
    const clean=normalizeText(text,opts);
    if(kind==='phoneme'||kind==='syllable'||kind==='word')return [clean];
    let parts=clean.split(/(?<=[.:;!?])\s+|\s+—\s+|\s+-\s+/).map(x=>x.trim()).filter(Boolean);
    if((kind==='instruction'||kind==='sentence') && clean.split(',').length>=3){
      parts=clean.split(/(?<=[.:;!?])\s+|,\s+|\s+—\s+|\s+-\s+/).map(x=>x.trim()).filter(Boolean);
    }
    return parts.length?parts:[clean];
  }
  function singleTTS(text,opts,token){
    if(!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      if(token!==seq)return resolve(false);
      const chunk=normalizeText(text,opts),u=new SpeechSynthesisUtterance(chunk),v=choose();
      u.lang='es-CO';u.rate=rateFor(chunk,opts);u.pitch=opts.pitch||1;u.volume=1;if(v)u.voice=v;
      let started=false,done=false;
      const estimated=Math.max(1800,Math.min(9000,chunk.length*95+(kindFor(chunk,opts)==='sentence'?1400:1000)));
      const timer=setTimeout(()=>{if(done)return;done=true;try{speechSynthesis.cancel();}catch(e){} if(started&&opts.onEnd)opts.onEnd();resolve(started);},estimated);
      u.onstart=()=>{started=true;if(opts.onStart)opts.onStart();};
      u.onend=()=>{if(done)return;done=true;clearTimeout(timer);if(started&&opts.onEnd)opts.onEnd();resolve(true);};
      u.onerror=()=>{if(done)return;done=true;clearTimeout(timer);if(started&&opts.onEnd)opts.onEnd();resolve(false);};
      try{speechSynthesis.speak(u);}catch(e){clearTimeout(timer);resolve(false);}
    });
  }
  async function single(text,opts,token){
    if(window.EmiliaAudioBank&&opts.controlled!==false){
      try{
        const used=await EmiliaAudioBank.play(text,{playbackRate:isDesktop()?.88:.9,onStart:opts.onStart,onEnd:opts.onEnd});
        if(used)return true;
      }catch(e){}
    }
    return singleTTS(text,opts,token);
  }
  async function speak(text,opts){
    opts=Object.assign({},opts||{});const token=++seq;
    try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}
    await wait(isDesktop()?70:30);
    const reps=repeatFor(text,opts),pause=typeof opts.pauseMs==='number'?opts.pauseMs:(isDesktop()?360:320);
    let used=false;
    for(let i=0;i<reps;i++){
      if(token!==seq)break;
      const parts=chunkText(text,opts);
      for(let j=0;j<parts.length;j++){
        if(token!==seq)break;
        const localOpts=Object.assign({},opts,{onStart:i===0&&j===0?opts.onStart:null,onEnd:i===reps-1&&j===parts.length-1?opts.onEnd:null});
        used=await single(parts[j],localOpts,token)||used;
        if(j<parts.length-1&&token===seq)await wait(isDesktop()?230:170);
      }
      if(i<reps-1&&token===seq)await wait(pause);
    }
    return used;
  }
  function stop(){seq++;try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}}
  function tone(kind){
    if(settings().sound===false)return;
    try{
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
      const now=ctx.currentTime,cfg=kind==='ok'?{f:660,f2:880,d:.16}:{f:260,f2:220,d:.14};
      o.frequency.setValueAtTime(cfg.f,now);o.frequency.linearRampToValueAtTime(cfg.f2,now+cfg.d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+cfg.d);o.start(now);o.stop(now+cfg.d+.02);
    }catch(e){}
  }
  async function sequence(items,opts){opts=Object.assign({pauseMs:isDesktop()?300:240,repeat:false},opts||{});for(let i=0;i<items.length;i++){await speak(items[i],opts);if(i<items.length-1)await wait(opts.pauseMs);}}
  window.EmiliaVoice={speak,sequence,stop,tone,refresh,rateFor,kindFor,describeVoice};
})();
