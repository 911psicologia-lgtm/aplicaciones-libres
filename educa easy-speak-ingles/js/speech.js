(()=> {
  'use strict';
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
  const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||navigator.maxTouchPoints>1;

  let recognition=null,recognitionRunning=false,recognitionStarting=false,sessionActive=false;
  let stream=null,audioCtx=null,analyser=null,speakingUtterance=null,permissionDenied=false;
  let capture=null,restartTimer=null,preferLocal=false,recognitionLocal=false,inputActive=false;

  const voices=()=>window.speechSynthesis?.getVoices?.()||[];
  const preferredVoice=()=>{
    const vs=voices();
    return vs.find(v=>/^en-GB/i.test(v.lang)&&/Google|Siri|Microsoft|Daniel|Serena|British/i.test(v.name))
      ||vs.find(v=>/^en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;
  };
  const liveStream=()=>!!stream?.getTracks?.().some(t=>t.readyState==='live');
  // Important on mobile: do not physically disable/re-enable the microphone track between turns.
  // Safari/WebKit can require a fresh user activation to unmute capture. We gate capture in software instead.
  const setInputActive=on=>{inputActive=!!on};
  const currentRms=()=>{
    if(!inputActive||!analyser)return null;
    const data=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(data);let sum=0;
    for(const x of data){const v=(x-128)/128;sum+=v*v}return Math.sqrt(sum/data.length);
  };
  const localSupported=()=>!!SR&&('processLocally' in SR.prototype||typeof SR.available==='function');
  const configure=opts=>{preferLocal=!!opts?.preferLocal};

  async function localAvailability(lang='en-GB'){
    if(!SR||typeof SR.available!=='function')return {supported:false,status:'unsupported'};
    try{const status=await SR.available({langs:[lang],processLocally:true});return {supported:true,status}}
    catch(error){return {supported:true,status:'unknown',error}}
  }
  async function installLocal(lang='en-GB'){
    if(!SR||typeof SR.install!=='function')return {ok:false,unsupported:true};
    try{const ok=await SR.install({langs:[lang],processLocally:true});return {ok:!!ok}}
    catch(error){return {ok:false,error}}
  }

  function ensureAudioContext(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    if(!audioCtx||audioCtx.state==='closed'){try{audioCtx=new AC()}catch{return null}}
    return audioCtx;
  }

  // Must be called directly from the Start/tap gesture on mobile.
  function unlockFromGesture(){
    try{
      const ac=ensureAudioContext();
      if(ac?.state==='suspended')ac.resume().catch(()=>{});
    }catch{}
    try{
      if('speechSynthesis' in window){
        speechSynthesis.resume();
        // A silent utterance primes iOS audio without producing an audible sound.
        const u=new SpeechSynthesisUtterance(' ');u.lang='en-GB';u.volume=0;u.rate=1;
        speechSynthesis.speak(u);
      }
    }catch{}
    // Starting recognition from the user gesture is more reliable on mobile Safari.
    if(isIOS&&SR&&!permissionDenied){try{startRecognitionSession()}catch{}}
  }

  async function stopRecorder(c){
    if(!c?.recorder)return null;
    const r=c.recorder;if(r.state==='inactive')return null;
    return new Promise(resolve=>{
      const finish=()=>{
        try{const blob=c.audioChunks?.length?new Blob(c.audioChunks,{type:r.mimeType||'audio/webm'}):null;resolve(blob&&blob.size?URL.createObjectURL(blob):null)}catch{resolve(null)}
      };
      r.addEventListener('stop',finish,{once:true});
      try{r.stop()}catch{resolve(null)}
      setTimeout(()=>{if(r.state!=='inactive')try{r.stop()}catch{}},160);
    });
  }
  async function finishCapture(extra={}){
    if(!capture||capture.finishing)return;
    const c=capture;c.finishing=true;capture=null;
    clearTimeout(c.timeout);clearTimeout(c.finalDebounce);clearInterval(c.volumeTimer);
    const durationMs=performance.now()-c.startedAt;
    const rms=c.rmsSamples.length?c.rmsSamples.reduce((a,b)=>a+b,0)/c.rmsSamples.length:null;
    const audioUrl=await stopRecorder(c);
    setInputActive(false);c.onVolume?.(0);
    c.resolve({transcript:(c.finalText||c.interim||'').trim(),confidence:c.confidence,durationMs,rms,audioUrl,recordOnly:!!c.recordOnly,...extra});
  }

  function destroyRecognition(){
    sessionActive=false;clearTimeout(restartTimer);try{recognition?.abort()}catch{}
    recognition=null;recognitionRunning=false;recognitionStarting=false;
  }
  function buildRecognition(){
    if(!SR)return null;
    const wantLocal=preferLocal&&localSupported();
    if(recognition&&recognitionLocal===wantLocal)return recognition;
    if(recognition)destroyRecognition();
    recognition=new SR();recognition.lang='en-GB';recognition.interimResults=true;
    // Continuous is useful on Chromium. iOS recognition is more stable with its native default lifecycle;
    // onend below still re-arms it while the speaking session is active.
    recognition.continuous=!isIOS;recognition.maxAlternatives=3;
    recognitionLocal=false;
    if(wantLocal&&'processLocally' in recognition){try{recognition.processLocally=true;recognitionLocal=true}catch{recognitionLocal=false}}
    recognition.onstart=()=>{recognitionRunning=true;recognitionStarting=false};
    recognition.onresult=e=>{
      if(!capture||capture.recordOnly||performance.now()<capture.acceptAfter)return;
      let interim='',gotFinal=false,bestConfidence=capture.confidence;
      for(let i=e.resultIndex;i<e.results.length;i++){
        const res=e.results[i],alt=res[0];if(!alt)continue;
        if(res.isFinal){const tx=String(alt.transcript||'').trim();if(tx){capture.finalText+=(capture.finalText?' ':'')+tx;gotFinal=true}if(Number.isFinite(alt.confidence))bestConfidence=Math.max(bestConfidence??0,alt.confidence)}
        else{const tx=String(alt.transcript||'').trim();if(tx)interim+=(interim?' ':'')+tx}
      }
      capture.interim=interim;capture.confidence=bestConfidence;capture.onInterim?.((capture.finalText+(interim?' '+interim:'')).trim());
      if(gotFinal&&capture.finalText.trim()){clearTimeout(capture.finalDebounce);capture.finalDebounce=setTimeout(()=>finishCapture(),isIOS?560:420)}
    };
    recognition.onerror=e=>{
      const err=e?.error||'';
      if(['not-allowed','service-not-allowed'].includes(err)){permissionDenied=true;sessionActive=false;recognitionRunning=false;recognitionStarting=false;finishCapture({permissionDenied:true,transcript:'',confidence:null});return}
      if(err==='language-not-supported'&&recognitionLocal){finishCapture({localUnavailable:true,transcript:'',confidence:null});return}
      // no-speech/audio-capture are recoverable; let the turn timeout or fallback handle them.
      if(err==='audio-capture'&&capture&&!liveStream())finishCapture({audioCaptureError:true,transcript:'',confidence:null});
    };
    recognition.onend=()=>{
      recognitionRunning=false;recognitionStarting=false;
      if(sessionActive&&!permissionDenied){clearTimeout(restartTimer);restartTimer=setTimeout(()=>startRecognitionSession(),isIOS?420:250)}
    };
    return recognition;
  }
  function startRecognitionSession(){
    if(!SR||permissionDenied)return false;buildRecognition();sessionActive=true;if(recognitionRunning||recognitionStarting)return true;
    recognitionStarting=true;
    try{recognition.start();return true}catch(e){recognitionStarting=false;if(e?.name==='InvalidStateError'){recognitionRunning=true;return true}return false}
  }

  async function prepare(){
    if(permissionDenied)return {ok:false,permissionDenied:true};
    let micOk=false,micUnsupported=!navigator.mediaDevices?.getUserMedia;
    // iOS Safari has a long-standing interaction issue between SpeechRecognition and a simultaneous getUserMedia capture.
    // Prioritise automatic recognition there; use getUserMedia in iOS only when SpeechRecognition is unavailable.
    const needParallelStream=!isIOS||!SR;
    if(needParallelStream&&!micUnsupported){
      try{
        if(!liveStream()){
          stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
          const ac=ensureAudioContext();
          if(ac){try{const source=ac.createMediaStreamSource(stream);analyser=ac.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.65;source.connect(analyser)}catch{}}
        }
        micOk=liveStream();
      }catch(error){
        if(!SR){permissionDenied=error?.name==='NotAllowedError'||error?.name==='SecurityError';return {ok:false,permissionDenied,unsupported:!permissionDenied,error}}
      }
    }
    const recognitionOk=SR?startRecognitionSession():false;
    if(isIOS&&SR)micOk=true; // SpeechRecognition itself owns the microphone on iOS compatibility path.
    const ok=!!(recognitionOk||micOk);
    return {ok,permissionDenied:false,unsupported:!ok&&micUnsupported&&!SR,local:recognitionLocal,recognition:!!SR,recordOnly:!SR&&micOk,ios:isIOS,standalone};
  }

  const speak=(text,{rate=1,onstart,onend}={})=>new Promise(resolve=>{
    if(capture)finishCapture();setInputActive(false);
    if(!('speechSynthesis'in window)||!text){onend?.();return resolve()}
    try{speechSynthesis.cancel();speechSynthesis.resume()}catch{}
    const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=Number(rate)||1;u.pitch=1;u.volume=1;const v=preferredVoice();if(v)u.voice=v;
    let doneOnce=false;const done=()=>{if(doneOnce)return;doneOnce=true;speakingUtterance=null;onend?.();resolve()};
    u.onstart=()=>onstart?.();u.onend=done;u.onerror=done;speakingUtterance=u;
    try{speechSynthesis.speak(u)}catch{done()}
  });
  const stopSpeaking=()=>{try{speechSynthesis.cancel()}catch{}speakingUtterance=null};

  const listen=({onInterim,onVolume,maxMs=11000}={})=>new Promise(async resolve=>{
    stopSpeaking();
    const ready=await prepare();
    if(!ready.ok)return resolve({unsupported:!!ready.unsupported,permissionDenied:!!ready.permissionDenied,transcript:'',confidence:null,durationMs:0,rms:null,audioUrl:null});
    try{await audioCtx?.resume?.()}catch{}setInputActive(true);
    if(capture)await finishCapture();
    const startedAt=performance.now(),recordOnly=!SR;
    const c={resolve,onInterim,onVolume,startedAt,acceptAfter:startedAt+(isMobile?260:180),finalText:'',interim:'',confidence:null,rmsSamples:[],timeout:null,finalDebounce:null,volumeTimer:null,recorder:null,audioChunks:[],finishing:false,recordOnly};
    capture=c;
    if('MediaRecorder'in window&&stream){
      try{c.recorder=new MediaRecorder(stream);c.recorder.ondataavailable=e=>{if(e.data?.size)c.audioChunks.push(e.data)};c.recorder.start(250)}catch{c.recorder=null}
    }
    c.volumeTimer=setInterval(()=>{if(capture!==c)return;const r=currentRms();if(r!=null){c.rmsSamples.push(r);c.onVolume?.(r)}},90);
    if(SR)startRecognitionSession();
    c.timeout=setTimeout(()=>{if(capture===c)finishCapture()},recordOnly?Math.min(maxMs,8000):maxMs);
  });

  const stopListening=()=>{if(capture)finishCapture();setInputActive(false)};
  const pause=()=>{stopListening();stopSpeaking();setInputActive(false);try{audioCtx?.suspend?.()}catch{}};
  const shutdown=()=>{pause();destroyRecognition();try{stream?.getTracks().forEach(t=>t.stop())}catch{}stream=null;analyser=null;try{audioCtx?.close()}catch{}audioCtx=null};
  const supported=()=>({recognition:!!SR,synthesis:'speechSynthesis'in window,microphone:!!navigator.mediaDevices?.getUserMedia,recording:'MediaRecorder'in window,localRecognition:localSupported(),ios:isIOS,mobile:isMobile,standalone,recordOnlyPossible:!SR&&!!navigator.mediaDevices?.getUserMedia});
  const isPrepared=()=>sessionActive||liveStream();
  const recognitionMode=()=>recognitionLocal?'local':SR?'browser-service':liveStream()?'record-only':'unavailable';
  window.EasySpeakSpeech={speak,listen,stopListening,stopSpeaking,pause,shutdown,supported,prepare,isPrepared,configure,localAvailability,installLocal,recognitionMode,unlockFromGesture};
})();
