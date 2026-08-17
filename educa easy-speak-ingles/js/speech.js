(()=> {
  'use strict';
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
  const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||navigator.maxTouchPoints>1;

  let stream=null,audioCtx=null,analyser=null,speakingUtterance=null;
  let capture=null,recognition=null,recognitionRunning=false,recognitionStarting=false;
  let prepared=false,preparePromise=null,permissionDenied=false,inputActive=false;
  let preferLocal=false,recognitionLocal=false,recognitionTrackMode=false,trackRecognitionUnsupported=false;

  const voices=()=>window.speechSynthesis?.getVoices?.()||[];
  const preferredVoice=()=>{
    const vs=voices();
    return vs.find(v=>/^en-GB/i.test(v.lang)&&/Google|Siri|Microsoft|Daniel|Serena|British/i.test(v.name))
      ||vs.find(v=>/^en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;
  };
  const liveStream=()=>!!stream?.getAudioTracks?.().some(t=>t.readyState==='live');
  const audioTrack=()=>stream?.getAudioTracks?.().find(t=>t.readyState==='live')||null;
  const setInputActive=on=>{inputActive=!!on};
  const currentRms=()=>{
    if(!inputActive||!analyser)return null;
    const data=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(data);let sum=0;
    for(const x of data){const v=(x-128)/128;sum+=v*v}
    return Math.sqrt(sum/data.length);
  };

  const localSupported=()=>!!SR&&('processLocally' in SR.prototype||typeof SR.available==='function');
  const configure=opts=>{preferLocal=!!opts?.preferLocal};
  async function localAvailability(lang='en-GB'){
    if(!SR||typeof SR.available!=='function')return {supported:false,status:'unsupported'};
    try{return {supported:true,status:await SR.available({langs:[lang],processLocally:true})}}
    catch(error){return {supported:true,status:'unknown',error}}
  }
  async function installLocal(lang='en-GB'){
    if(!SR||typeof SR.install!=='function')return {ok:false,unsupported:true};
    try{return {ok:!!(await SR.install({langs:[lang],processLocally:true}))}}
    catch(error){return {ok:false,error}}
  }

  function ensureAudioContext(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    if(!audioCtx||audioCtx.state==='closed'){try{audioCtx=new AC()}catch{return null}}
    return audioCtx;
  }

  // Only unlock output from the direct user gesture. Microphone acquisition happens once
  // in prepare(); SpeechRecognition is never started here, avoiding a second permission path.
  function unlockFromGesture(){
    try{const ac=ensureAudioContext();if(ac?.state==='suspended')ac.resume().catch(()=>{})}catch{}
    try{
      if('speechSynthesis'in window){
        speechSynthesis.resume();
        const u=new SpeechSynthesisUtterance(' ');u.lang='en-GB';u.volume=0;u.rate=1;speechSynthesis.speak(u);
      }
    }catch{}
  }

  async function prepare(){
    if(permissionDenied)return {ok:false,permissionDenied:true};
    if(prepared&&liveStream())return {ok:true,reused:true,recognition:!!SR&&!trackRecognitionUnsupported,recordOnly:!SR||trackRecognitionUnsupported,ios:isIOS,standalone};
    if(preparePromise)return preparePromise;
    preparePromise=(async()=>{
      if(!navigator.mediaDevices?.getUserMedia){
        // Desktop can still use classic Web Speech as a last resort; mobile intentionally
        // avoids it because it can reopen microphone UI on every recognition.start().
        const classicOk=!!SR&&!isMobile;
        prepared=classicOk;
        return {ok:classicOk,unsupported:!classicOk,recognition:classicOk,recordOnly:false,ios:isIOS,standalone};
      }
      try{
        if(!liveStream()){
          stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
          const ac=ensureAudioContext();
          if(ac){
            try{
              const source=ac.createMediaStreamSource(stream);analyser=ac.createAnalyser();
              analyser.fftSize=512;analyser.smoothingTimeConstant=.65;source.connect(analyser);
            }catch{}
          }
        }
        prepared=liveStream();
        return {ok:prepared,permissionDenied:false,recognition:!!SR&&!trackRecognitionUnsupported,recordOnly:!SR||trackRecognitionUnsupported,ios:isIOS,standalone,reused:false};
      }catch(error){
        permissionDenied=error?.name==='NotAllowedError'||error?.name==='SecurityError';
        return {ok:false,permissionDenied,unsupported:!permissionDenied,error};
      }
    })();
    try{return await preparePromise}finally{preparePromise=null}
  }

  function destroyRecognition(){
    if(recognition){
      try{recognition.onend=null;recognition.onerror=null;recognition.onresult=null;recognition.onstart=null}catch{}
      try{recognition.abort()}catch{}
    }
    recognition=null;recognitionRunning=false;recognitionStarting=false;recognitionLocal=false;recognitionTrackMode=false;
  }
  function buildRecognition(){
    if(!SR)return null;
    destroyRecognition();
    recognition=new SR();recognition.lang='en-GB';recognition.interimResults=true;recognition.continuous=false;recognition.maxAlternatives=3;
    recognitionLocal=false;
    if(preferLocal&&localSupported()&&'processLocally'in recognition){try{recognition.processLocally=true;recognitionLocal=true}catch{}}
    recognition.onstart=()=>{recognitionRunning=true;recognitionStarting=false};
    recognition.onresult=e=>{
      if(!capture||capture.recordOnly||performance.now()<capture.acceptAfter)return;
      let interim='',gotFinal=false,bestConfidence=capture.confidence;
      for(let i=e.resultIndex;i<e.results.length;i++){
        const res=e.results[i],alt=res[0];if(!alt)continue;
        const tx=String(alt.transcript||'').trim();
        if(res.isFinal){if(tx){capture.finalText+=(capture.finalText?' ':'')+tx;gotFinal=true}if(Number.isFinite(alt.confidence))bestConfidence=Math.max(bestConfidence??0,alt.confidence)}
        else if(tx)interim+=(interim?' ':'')+tx;
      }
      capture.interim=interim;capture.confidence=bestConfidence;
      capture.onInterim?.((capture.finalText+(interim?' '+interim:'')).trim());
      if(gotFinal&&capture.finalText.trim()){
        clearTimeout(capture.finalDebounce);
        capture.finalDebounce=setTimeout(()=>finishCapture(),isIOS?520:380);
      }
    };
    recognition.onerror=e=>{
      const err=e?.error||'';
      recognitionRunning=false;recognitionStarting=false;
      if(!capture)return;
      if(['not-allowed','service-not-allowed'].includes(err)){
        // Do not ask again. Keep the already-acquired stream and switch this session to
        // record/self-check mode.
        trackRecognitionUnsupported=true;capture.recordOnly=true;capture.onRecognitionFallback?.();return;
      }
      if(err==='language-not-supported'&&recognitionLocal){capture.localUnavailable=true;capture.recordOnly=true;return}
      if(['audio-capture','network'].includes(err)){capture.recordOnly=true;capture.onRecognitionFallback?.()}
    };
    recognition.onend=()=>{
      recognitionRunning=false;recognitionStarting=false;
      if(capture&&!capture.finishing&&!capture.finalText.trim()){
        // Recognition window ended without useful text. Do not restart it automatically;
        // the same microphone stream keeps recording for My Voice/self-check.
        capture.recordOnly=true;capture.onRecognitionFallback?.();
      }
    };
    return recognition;
  }

  function startRecognitionWindow(){
    if(!SR||trackRecognitionUnsupported)return false;
    const r=buildRecognition();if(!r)return false;
    recognitionStarting=true;
    const track=audioTrack();
    try{
      if(track){
        // Preferred path: recognition consumes the already-authorized microphone track.
        // No second getUserMedia call and no recognition-owned microphone acquisition.
        r.start(track);recognitionTrackMode=true;return true;
      }
      if(!isMobile){r.start();recognitionTrackMode=false;return true}
      trackRecognitionUnsupported=true;recognitionStarting=false;return false;
    }catch(error){
      recognitionStarting=false;
      // If start(audioTrack) is unsupported, never fall back to repeated classic start()
      // on mobile. That fallback is the source of repeated permission prompts in some UAs.
      if(isMobile){trackRecognitionUnsupported=true;recognitionTrackMode=false;destroyRecognition();return false}
      try{r.start();recognitionTrackMode=false;return true}catch{destroyRecognition();return false}
    }
  }

  async function stopRecorder(c){
    if(!c?.recorder)return null;
    const r=c.recorder;if(r.state==='inactive')return null;
    return new Promise(resolve=>{
      const finish=()=>{try{const blob=c.audioChunks?.length?new Blob(c.audioChunks,{type:r.mimeType||'audio/webm'}):null;resolve(blob&&blob.size?URL.createObjectURL(blob):null)}catch{resolve(null)}};
      r.addEventListener('stop',finish,{once:true});
      try{r.stop()}catch{resolve(null)}
      setTimeout(()=>{if(r.state!=='inactive')try{r.stop()}catch{}},160);
    });
  }
  async function finishCapture(extra={}){
    if(!capture||capture.finishing)return;
    const c=capture;c.finishing=true;capture=null;
    clearTimeout(c.timeout);clearTimeout(c.finalDebounce);clearInterval(c.volumeTimer);
    try{if(recognitionRunning||recognitionStarting)recognition?.stop()}catch{}
    recognitionRunning=false;recognitionStarting=false;
    const durationMs=performance.now()-c.startedAt;
    const rms=c.rmsSamples.length?c.rmsSamples.reduce((a,b)=>a+b,0)/c.rmsSamples.length:null;
    const audioUrl=await stopRecorder(c);setInputActive(false);c.onVolume?.(0);
    c.resolve({transcript:(c.finalText||c.interim||'').trim(),confidence:c.confidence,durationMs,rms,audioUrl,recordOnly:!!c.recordOnly,localUnavailable:!!c.localUnavailable,...extra});
  }

  const speak=(text,{rate=1,onstart,onend}={})=>new Promise(resolve=>{
    if(capture)finishCapture();setInputActive(false);
    try{if(recognitionRunning||recognitionStarting)recognition?.abort()}catch{}
    recognitionRunning=false;recognitionStarting=false;
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
    try{await audioCtx?.resume?.()}catch{}
    setInputActive(true);if(capture)await finishCapture();
    const startedAt=performance.now();
    const c={resolve,onInterim,onVolume,startedAt,acceptAfter:startedAt+(isMobile?320:180),finalText:'',interim:'',confidence:null,rmsSamples:[],timeout:null,finalDebounce:null,volumeTimer:null,recorder:null,audioChunks:[],finishing:false,recordOnly:false,localUnavailable:false,onRecognitionFallback:null};
    capture=c;
    if('MediaRecorder'in window&&stream){try{c.recorder=new MediaRecorder(stream);c.recorder.ondataavailable=e=>{if(e.data?.size)c.audioChunks.push(e.data)};c.recorder.start(250)}catch{c.recorder=null}}
    c.volumeTimer=setInterval(()=>{if(capture!==c)return;const r=currentRms();if(r!=null){c.rmsSamples.push(r);c.onVolume?.(r)}},90);
    const recognitionOk=startRecognitionWindow();
    if(!recognitionOk)c.recordOnly=true;
    c.timeout=setTimeout(()=>{if(capture===c)finishCapture()},c.recordOnly?Math.min(maxMs,8000):maxMs);
  });

  const stopListening=()=>{if(capture)finishCapture();setInputActive(false)};
  // pause() deliberately keeps the granted MediaStream alive. It stops processing/recording,
  // but does not release the microphone permission between screens or exercises.
  const pause=()=>{stopListening();stopSpeaking();setInputActive(false);try{if(recognitionRunning||recognitionStarting)recognition?.abort()}catch{}recognitionRunning=false;recognitionStarting=false};
  const shutdown=()=>{pause();destroyRecognition();try{stream?.getTracks().forEach(t=>t.stop())}catch{}stream=null;analyser=null;prepared=false;preparePromise=null;try{audioCtx?.close()}catch{}audioCtx=null};
  const supported=()=>({recognition:!!SR&&!trackRecognitionUnsupported,synthesis:'speechSynthesis'in window,microphone:!!navigator.mediaDevices?.getUserMedia,recording:'MediaRecorder'in window,localRecognition:localSupported(),ios:isIOS,mobile:isMobile,standalone,recordOnlyPossible:!!navigator.mediaDevices?.getUserMedia});
  const isPrepared=()=>prepared&&liveStream();
  const recognitionMode=()=>recognitionLocal?'local-track':recognitionTrackMode?'browser-service-shared-track':trackRecognitionUnsupported&&liveStream()?'record-only':SR?'browser-service':liveStream()?'record-only':'unavailable';
  window.EasySpeakSpeech={speak,listen,stopListening,stopSpeaking,pause,shutdown,supported,prepare,isPrepared,configure,localAvailability,installLocal,recognitionMode,unlockFromGesture};
})();
