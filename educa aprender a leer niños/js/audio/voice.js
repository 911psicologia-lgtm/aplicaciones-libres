(function(){
  let voices=[];
  let ctx=null;
  let seq=0;
  function refresh(){try{voices=speechSynthesis.getVoices()||[];}catch(e){voices=[];}}
  refresh();
  if('speechSynthesis' in window && 'onvoiceschanged' in speechSynthesis)speechSynthesis.onvoiceschanged=refresh;

  function score(v){
    const lang=(v.lang||'').toLowerCase(),name=(v.name||'').toLowerCase();let n=0;
    if(lang==='es-co')n+=90;else if(lang.startsWith('es-'))n+=65;else if(lang.startsWith('es'))n+=50;
    if(/google|microsoft|paulina|helena|monica|dalia|sabina|luciana|elvira/.test(name))n+=18;
    if(v.localService)n+=4;return n;
  }
  function choose(){return voices.slice().sort((a,b)=>score(b)-score(a))[0]||null;}
  function wait(ms){return new Promise(r=>setTimeout(r,ms));}
  function settings(){
    const s=(window.EmiliaStore&&EmiliaStore.get)?EmiliaStore.get():null;
    return (s&&s.settings)||{};
  }
  function paceMultiplier(){
    const p=settings().listeningPace||'slow';
    return p==='verySlow'?.84:p==='normal'?1:.94;
  }
  function kindFor(text,opts){
    if(opts&&opts.kind)return opts.kind;
    const t=String(text||'').trim();
    if(t.length===1||/^([a-záéíóúñ])\1{2,}$/i.test(t))return 'phoneme';
    if(!/\s/.test(t)&&t.length<=4)return 'syllable';
    if(!/\s/.test(t)&&t.length<=12)return 'word';
    if(/[.!?]$/.test(t)||t.split(/\s+/).length>4)return 'sentence';
    return 'instruction';
  }
  function baseRate(kind){
    // Perfiles pensados para escucha infantil; el dispositivo aún puede variar ligeramente.
    return ({phoneme:.58,syllable:.63,word:.72,sentence:.78,instruction:.82,praise:.86})[kind]||.78;
  }
  function rateFor(text,opts){
    if(opts&&typeof opts.rate==='number')return opts.rate;
    const k=kindFor(text,opts||{}),mult=paceMultiplier();
    const custom=settings().voiceRate;
    // voiceRate funciona como ajuste fino; valores antiguos (.88) no aceleran el nuevo perfil infantil.
    const fine=(typeof custom==='number'&&custom<.8)?Math.max(.82,Math.min(1.08,custom/.66)):1;
    return Math.max(.32,Math.min(.82,baseRate(k)*mult*fine));
  }
  function repeatFor(text,opts){
    if(opts&&typeof opts.repeat==='number')return Math.max(1,Math.min(3,opts.repeat));
    if(opts&&opts.repeat===false)return 1;
    const k=kindFor(text,opts||{});
    const auto=settings().repeatShortAudio===true;
    return auto&&(k==='phoneme'||k==='syllable')?2:1;
  }
  function singleTTS(text,opts,token){
    if(!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      if(token!==seq)return resolve(false);
      const u=new SpeechSynthesisUtterance(text),v=choose();
      u.lang='es-CO';u.rate=rateFor(text,opts);u.pitch=opts.pitch||1;u.volume=1;if(v)u.voice=v;
      let started=false;
      u.onstart=()=>{started=true;if(opts.onStart)opts.onStart();};
      u.onend=()=>{if(started&&opts.onEnd)opts.onEnd();resolve(true);};
      u.onerror=()=>{if(started&&opts.onEnd)opts.onEnd();resolve(false);};
      try{speechSynthesis.speak(u);}catch(e){resolve(false);}
    });
  }
  async function single(text,opts,token){
    if(window.EmiliaAudioBank&&opts.controlled!==false){
      try{
        const used=await EmiliaAudioBank.play(text,{playbackRate:.9,onStart:opts.onStart,onEnd:opts.onEnd});
        if(used)return true;
      }catch(e){}
    }
    return singleTTS(text,opts,token);
  }
  async function speak(text,opts){
    opts=Object.assign({},opts||{});const token=++seq;
    try{if('speechSynthesis' in window)speechSynthesis.cancel();}catch(e){}
    const reps=repeatFor(text,opts),pause=typeof opts.pauseMs==='number'?opts.pauseMs:320;
    let used=false;
    for(let i=0;i<reps;i++){
      if(token!==seq)break;
      const localOpts=Object.assign({},opts,{onStart:i===0?opts.onStart:null,onEnd:i===reps-1?opts.onEnd:null});
      used=await single(text,localOpts,token)||used;
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
  async function sequence(items,opts){opts=Object.assign({pauseMs:240,repeat:false},opts||{});for(let i=0;i<items.length;i++){await speak(items[i],opts);if(i<items.length-1)await wait(opts.pauseMs);}}
  window.EmiliaVoice={speak,sequence,stop,tone,refresh,rateFor,kindFor};
})();
