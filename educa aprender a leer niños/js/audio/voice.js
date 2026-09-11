(function(){
  let voices=[];
  let ctx=null;
  let seq=0;
  const FIXED_CLARITY_KINDS=new Set(['phoneme','vowel','letterName','syllable','word']);
  const PACE_ORDER=['gentle','normal','quick'];
  const PACE_MULT={gentle:.90,normal:1,quick:1.12};
  const PACE_META={
    gentle:{key:'gentle',short:'0.90×',name:'suave'},
    normal:{key:'normal',short:'1×',name:'normal'},
    quick:{key:'quick',short:'1.12×',name:'ágil'}
  };
  const LETTER_NAMES={a:'a',b:'be',c:'ce',d:'de',e:'e',f:'efe',g:'ge',h:'hache',i:'i',j:'jota',k:'ka',l:'ele',m:'eme',n:'ene','ñ':'eñe',o:'o',p:'pe',q:'cu',r:'erre',s:'ese',t:'te',u:'u',v:'uve',w:'doble uve',x:'equis',y:'ye',z:'zeta'};
  const CONTINUOUS_PHONEMES={m:'mmm',s:'sss',f:'fff',n:'nnn',l:'lll'};

  function refresh(){try{voices=speechSynthesis.getVoices()||[];}catch(e){voices=[];}}
  refresh();
  if('speechSynthesis' in window && 'onvoiceschanged' in speechSynthesis)speechSynthesis.onvoiceschanged=refresh;

  function score(v){
    const lang=(v.lang||'').toLowerCase(),name=(v.name||'').toLowerCase();let n=0;
    if(lang==='es-co')n+=110;else if(lang.startsWith('es-co'))n+=100;else if(lang.startsWith('es-mx'))n+=88;else if(lang.startsWith('es-es'))n+=78;else if(lang.startsWith('es-'))n+=72;else if(lang.startsWith('es'))n+=58;
    if(/google|microsoft|paulina|helena|monica|dalia|sabina|luciana|elvira/.test(name))n+=18;
    if(v.localService)n+=12;if(v.default)n+=4;
    if(/english|uk|united states|francais|deutsch/.test(name))n-=25;
    return n;
  }
  function choose(){return voices.slice().sort((a,b)=>score(b)-score(a))[0]||null;}
  function describeVoice(){const v=choose();return v?{name:v.name||'voz',lang:v.lang||'es',local:!!v.localService,default:!!v.default}:{name:'sin voz detectada',lang:'es',local:false,default:false};}
  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function settings(){const s=(window.EmiliaStore&&EmiliaStore.get)?EmiliaStore.get():null;return (s&&s.settings)||{};}
  function normalizePace(value){
    const p=String(value||'normal');
    if(p==='verySlow'||p==='slow')return 'gentle';
    if(p==='fast')return 'quick';
    return PACE_ORDER.includes(p)?p:'normal';
  }
  function paceInfo(){const key=normalizePace(settings().listeningPace);return Object.assign({multiplier:PACE_MULT[key]},PACE_META[key]);}
  function setPace(value){
    const key=normalizePace(value),s=(window.EmiliaStore&&EmiliaStore.get)?EmiliaStore.get():null;
    if(s&&s.settings){s.settings.listeningPace=key;s.settings.voiceRate=1;if(EmiliaStore.save)EmiliaStore.save();}
    return Object.assign({multiplier:PACE_MULT[key]},PACE_META[key]);
  }
  function cyclePace(){const cur=paceInfo().key,i=PACE_ORDER.indexOf(cur),next=PACE_ORDER[(i+1)%PACE_ORDER.length];return setPace(next);}
  function paceMultiplier(kind){return FIXED_CLARITY_KINDS.has(kind)?1:(PACE_MULT[paceInfo().key]||1);}

  function kindFor(text,opts){
    if(opts&&opts.kind)return opts.kind;
    const t=String(text||'').trim(),lower=t.toLocaleLowerCase('es');
    if(/^[aeiouáéíóú]$/i.test(lower))return 'vowel';
    if(/^[a-zñ]$/i.test(lower))return 'letterName';
    if(!/\s/.test(t)&&t.length<=15)return 'word';
    if(/[.!?]$/.test(t)||t.split(/\s+/).length>4)return 'sentence';
    return 'instruction';
  }
  function baseRate(kind){return ({phoneme:.90,vowel:.96,letterName:.98,syllable:.96,word:.98,sentence:1,story:1,instruction:1,praise:1.03})[kind]||1;}
  function rateFor(text,opts){
    if(opts&&typeof opts.rate==='number')return Math.max(.72,Math.min(1.25,opts.rate));
    const k=kindFor(text,opts||{}),rate=baseRate(k)*paceMultiplier(k);
    return Math.max(.78,Math.min(1.18,rate));
  }
  function repeatFor(text,opts){
    if(opts&&typeof opts.repeat==='number')return Math.max(1,Math.min(3,opts.repeat));
    if(opts&&opts.repeat===false)return 1;
    const k=kindFor(text,opts||{}),auto=settings().repeatShortAudio===true;
    return auto&&(k==='phoneme'||k==='vowel'||k==='syllable')?2:1;
  }
  function normalizeText(text,opts={}){
    const kind=kindFor(text,opts);let t=String(text||'').trim();
    t=t.replace(/[→⇢➜➡]+/g,'. ').replace(/[·•]+/g,'... ').replace(/[|]/g,', ').replace(/:/g,'. ').replace(/\s+/g,' ').trim();
    const lower=t.toLocaleLowerCase('es');
    if(kind==='letterName'&&/^[a-zñ]$/i.test(lower))return LETTER_NAMES[lower]||lower;
    if(kind==='phoneme'&&/^[a-zñ]$/i.test(lower)){
      if(/^[aeiou]$/i.test(lower))return lower;
      return CONTINUOUS_PHONEMES[lower]||'';
    }
    if(kind==='vowel'||kind==='syllable'||kind==='word')return lower;
    return t;
  }
  function chunkText(text,opts={}){
    const kind=kindFor(text,opts),clean=normalizeText(text,opts);
    if(!clean)return [];
    if(FIXED_CLARITY_KINDS.has(kind))return [clean];
    let parts=clean.split(/(?<=[.:;!?])\s+|\s+—\s+|\s+-\s+/).map(x=>x.trim()).filter(Boolean);
    if((kind==='instruction'||kind==='sentence'||kind==='story')&&clean.split(',').length>=3){parts=clean.split(/(?<=[.:;!?])\s+|,\s+|\s+—\s+|\s+-\s+/).map(x=>x.trim()).filter(Boolean);}
    return parts.length?parts:[clean];
  }
  function unsafeTTSPhoneme(text,opts){
    const kind=kindFor(text,opts||{}),t=String(text||'').trim().toLocaleLowerCase('es');
    return kind==='phoneme'&&/^[a-zñ]$/i.test(t)&&!/^[aeioumnsfl]$/i.test(t);
  }
  function singleTTS(text,opts,token){
    if(!('speechSynthesis' in window)||unsafeTTSPhoneme(text,opts))return Promise.resolve(false);
    const chunk=normalizeText(text,opts);if(!chunk)return Promise.resolve(false);
    return new Promise(resolve=>{
      if(token!==seq)return resolve(false);
      const u=new SpeechSynthesisUtterance(chunk),v=choose();
      u.lang='es-CO';u.rate=rateFor(chunk,opts);u.pitch=typeof opts.pitch==='number'?opts.pitch:1;u.volume=1;if(v)u.voice=v;
      let started=false,done=false;
      const r=Math.max(.78,rateFor(chunk,opts)),estimated=Math.max(1300,Math.min(8500,(chunk.length*82+900)/r));
      const timer=setTimeout(()=>{if(done)return;done=true;try{speechSynthesis.cancel();}catch(e){}if(started&&opts.onEnd)opts.onEnd();resolve(started);},estimated);
      u.onstart=()=>{started=true;if(opts.onStart)opts.onStart();};
      u.onend=()=>{if(done)return;done=true;clearTimeout(timer);if(started&&opts.onEnd)opts.onEnd();resolve(true);};
      u.onerror=()=>{if(done)return;done=true;clearTimeout(timer);if(started&&opts.onEnd)opts.onEnd();resolve(false);};
      try{speechSynthesis.speak(u);}catch(e){clearTimeout(timer);resolve(false);}
    });
  }
  async function single(text,opts,token){
    const kind=kindFor(text,opts||{});
    if(window.EmiliaAudioBank&&opts.controlled!==false){
      try{
        const localRate=FIXED_CLARITY_KINDS.has(kind)?1:Math.max(.90,Math.min(1.12,paceMultiplier(kind)));
        const used=await EmiliaAudioBank.play(text,{kind,playbackRate:localRate,onStart:opts.onStart,onEnd:opts.onEnd});
        if(used)return true;
      }catch(e){}
    }
    return singleTTS(text,opts,token);
  }
  async function speak(text,opts){
    opts=Object.assign({},opts||{});const token=++seq;
    try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}
    await wait(25);
    const reps=repeatFor(text,opts),pause=typeof opts.pauseMs==='number'?opts.pauseMs:260;let used=false;
    for(let i=0;i<reps;i++){
      if(token!==seq)break;const parts=chunkText(text,opts);
      for(let j=0;j<parts.length;j++){
        if(token!==seq)break;
        const localOpts=Object.assign({},opts,{onStart:i===0&&j===0?opts.onStart:null,onEnd:i===reps-1&&j===parts.length-1?opts.onEnd:null});
        used=await single(parts[j],localOpts,token)||used;
        if(j<parts.length-1&&token===seq)await wait(kindFor(text,opts)==='story'?190:150);
      }
      if(i<reps-1&&token===seq)await wait(pause);
    }
    return used;
  }
  function stop(){seq++;try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}}
  function tone(kind){
    if(settings().sound===false)return;
    try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);const now=ctx.currentTime,cfg=kind==='ok'?{f:660,f2:880,d:.16}:{f:260,f2:220,d:.14};o.frequency.setValueAtTime(cfg.f,now);o.frequency.linearRampToValueAtTime(cfg.f2,now+cfg.d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+cfg.d);o.start(now);o.stop(now+cfg.d+.02);}catch(e){}
  }
  async function sequence(items,opts){opts=Object.assign({pauseMs:240,repeat:false},opts||{});for(let i=0;i<items.length;i++){await speak(items[i],opts);if(i<items.length-1)await wait(opts.pauseMs);}}
  window.EmiliaVoice={speak,sequence,stop,tone,refresh,rateFor,kindFor,describeVoice,paceInfo,setPace,cyclePace,normalizePace};
})();
