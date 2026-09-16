(function(){
  let session=null,toastTimer=null,storyContext={listened:false};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function haptic(pattern=18){try{if(navigator.vibrate)navigator.vibrate(pattern);}catch(_){}}
  function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),1800);}
  function go(screen){
    EmiliaVoice.stop&&EmiliaVoice.stop();
    const map={onboarding:EmiliaScreens.onboarding,home:EmiliaScreens.home,book:EmiliaScreens.book,practice:EmiliaScreens.practice,treasures:EmiliaScreens.treasures,gate:EmiliaScreens.gate,adult:EmiliaScreens.adult};
    (map[screen]||EmiliaScreens.home)();
    bindPWABar();syncPWAControls();
  }
  function persistSession(){if(session)EmiliaStore.saveActiveSession(session);}
  function startMission(id){tryFullscreen();const m=EmiliaEngine.missionById(id);if(!EmiliaEngine.isUnlocked(m)){toast('Ese lugar todavía está dormido.');return;}session=EmiliaEngine.buildSession(m);persistSession();EmiliaScreens.activity(session);}
  function startPractice(){tryFullscreen();session=EmiliaEngine.buildPracticeSession();persistSession();EmiliaScreens.activity(session);}
  function startFlashPractice(){tryFullscreen();session=EmiliaEngine.buildFlashPracticeSession();persistSession();EmiliaStore.event('flash_challenge_start',{count:session.activities.length});EmiliaScreens.activity(session);}
  function startRescuePractice(){tryFullscreen();session=EmiliaEngine.buildRescuePracticeSession();persistSession();EmiliaStore.event('rescue_start',{count:session.activities.length,targets:(session.rescueTargets||[]).slice()});EmiliaScreens.activity(session);}
  function startGapPractice(){tryFullscreen();session=EmiliaEngine.buildGapPracticeSession();persistSession();EmiliaScreens.activity(session);}
  function startWritingPractice(){tryFullscreen();session=EmiliaEngine.buildWritingPracticeSession();persistSession();EmiliaScreens.activity(session);}
  function startSentencePractice(){tryFullscreen();session=EmiliaEngine.buildSentencePracticeSession();persistSession();EmiliaScreens.activity(session);}
  function startMagicTracePractice(){tryFullscreen();session=EmiliaEngine.buildMagicTracePracticeSession();persistSession();EmiliaStore.event('magic_trace_start',{count:session.activities.length});EmiliaScreens.activity(session);}
  function startSecretWordPractice(){tryFullscreen();session=EmiliaEngine.buildSecretWordPracticeSession();persistSession();EmiliaStore.event('secret_word_start',{count:session.activities.length});EmiliaScreens.activity(session);}
  function resumeSession(){tryFullscreen();const saved=EmiliaStore.get().activeSession;if(!saved){go('home');return;}session=saved;EmiliaScreens.activity(session);}
  function continueSession(){tryFullscreen();if(!session){resumeSession();return;}persistSession();EmiliaScreens.activity(session);}
  function exitMission(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();go('home');}
  function saveAndExitUser(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();EmiliaStore.logoutToPicker();session=null;go('onboarding');setTimeout(()=>EmiliaVoice.speak('Sesión guardada. Toca tu nombre cuando quieras continuar.',{kind:'instruction',repeat:false}),120);}
  function previousActivity(){if(!session)return go('home');if(session.index<=0){exitMission();return;}session.index--;session.replayIndex=session.index;persistSession();EmiliaScreens.activity(session);}
  function isReplay(){return !!session&&session.replayIndex===session.index;}
  function rewardBurst(kind='star'){
    const layer=document.getElementById('rewardLayer')||document.body,wrap=document.createElement('div'),ui=EMILIA_CONTENT.ui||{};
    const src=kind==='chest'?ui.chest:kind==='seed'?ui.seed:kind==='medal'?ui.medal:ui.star;
    wrap.className='reward-pop';
    wrap.innerHTML=`${src?`<img class="reward-image" src="${src}" alt="">`:`<div class="reward-symbol">★</div>`}${Array.from({length:18},(_,i)=>`<i style="--i:${i};--a:${(i*137)%360}deg"></i>`).join('')}`;
    layer.appendChild(wrap);haptic(kind==='chest'?[18,30,24]:16);setTimeout(()=>wrap.remove(),760);
  }
  function registerSuccess(independent){
    if(!session||!independent)return;
    session.streak=(session.streak||0)+1;session.bestStreak=Math.max(session.bestStreak||0,session.streak);
    if(session.streak%3===0){session.bonusStars=(session.bonusStars||0)+1;rewardBurst('chest');EmiliaVoice.tone('ok');EmiliaStore.event('mini_streak',{missionId:session.missionId,streak:session.streak});}
    persistSession();
  }
  function registerMiss(){if(session){session.streak=0;persistSession();}}
  function feedback(ok,text){const f=document.getElementById('feedback');if(!f)return;if(ok){f.innerHTML='<div class="feedback-visual">✓</div>';EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('cheer',680);rewardBurst('star');return;}EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('thinking',760);f.innerHTML=`<div class="feedback-box coach"><span>↻</span>${text?`<span class="adult-readable">${text}</span>`:''}</div>`;}
  function nextAfter(ms){setTimeout(()=>{
    if(!session)return;
    session.replayIndex=null;
    if(EmiliaEngine.shouldEnd(session)){
      session.endedAdaptively=true;const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);return;
    }
    session.index++;persistSession();
    if(session.index>=session.activities.length){
      const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);return;
    }
    if(EmiliaEngine.shouldPause&&EmiliaEngine.shouldPause(session)){
      persistSession();
      EmiliaStore.event('session_breather',{missionId:session.missionId,after:session.index,total:session.activities.length});
      EmiliaScreens.sessionPause(session);
      return;
    }
    EmiliaScreens.activity(session);
  },ms);}
  function attemptsFor(q){return session.attempts[q.id]||0;}
  function markAttempt(q){session.attempts[q.id]=(session.attempts[q.id]||0)+1;persistSession();return session.attempts[q.id];}
  function audioLabel(value,prefix=''){
    const v=String(value||'').trim().toLocaleLowerCase('es');
    if(!v)return '';
    if(prefix)return `${String(prefix).trim()} ${v}`.trim();
    if(v.length===1 && 'aeiou'.includes(v)) return `vocal ${v}`;
    return v;
  }
  function joinAudioList(items,prefix=''){
    return (items||[]).map(x=>audioLabel(x,prefix)).filter(Boolean).join(', ');
  }
  function isShortToken(v){
    const t=String(v||'').trim();
    return t.length>0 && t.length<=3 && !/\s/.test(t);
  }
  function optionShape(q){
    const opts=Array.isArray(q&&q.options)?q.options.map(x=>String((x&&x.value)!=null?x.value:x||'').trim()).filter(Boolean):[];
    return {
      allLetters:opts.length>0&&opts.every(x=>/^[a-záéíóúñ]$/i.test(x)),
      allShort:opts.length>0&&opts.every(x=>/^[a-záéíóúñ]{2,3}$/i.test(x)),
      allWords:opts.length>0&&opts.every(x=>/^[a-záéíóúñ]{2,}$/i.test(x))
    };
  }
  function centralAudioKind(q){
    if(q&&q.audioKind)return q.audioKind;
    const heard=String((q&&(q.say||q.word||q.answer))||'').trim();
    if(/^[aeiouáéíóú]$/i.test(heard))return 'vowel';
    if(q&&q.type==='soundBubbles')return 'syllable';
    if(q&&q.type==='syllableTrail')return /^[aeiouáéíóú]$/i.test(heard)?'vowel':'syllable';
    if(q&&String(q.skill||'').includes('_family'))return 'syllable';
    if(/^[a-záéíóúñ]{2}$/i.test(heard))return 'syllable';
    if(/^[a-záéíóúñ]$/i.test(heard))return 'letterName';
    if(heard)return /\s/.test(heard)||/[.!?]/.test(heard)?'sentence':'word';
    return 'instruction';
  }
  function selectionAudioKind(q,value,role='selection'){
    if(q&&q.selectionAudioKind)return q.selectionAudioKind;
    const v=String(value||'').trim(),shape=optionShape(q);
    if(/^[aeiouáéíóú]$/i.test(v))return 'vowel';
    if(/^[a-zñ]$/i.test(v))return 'letterName';
    if(q&&q.type==='soundBubbles')return 'syllable';
    if(q&&q.type==='syllableTrail')return 'syllable';
    if(q&&q.type==='build')return 'syllable';
    if(q&&q.type==='missingPart')return 'syllable';
    if(q&&q.type==='gapFill')return q.mode==='letter'?'letterName':(q.mode==='syllable'?'syllable':(q.mode==='pattern'?((/^r{1,2}$/i.test(v))?'instruction':'syllable'):'word'));
    if(q&&q.type==='wordModel')return 'syllable';
    if((q&&String(q.skill||'').includes('_family'))&&shape.allShort)return 'syllable';
    if(role==='trail'&&isShortToken(v))return 'syllable';
    return 'word';
  }

  function selectionAudioText(q,value){
    const v=String(value||'').trim();
    if(q&&q.type==='gapFill'&&q.mode==='pattern'){
      if(v.toLocaleLowerCase('es')==='rr')return 'doble erre';
      if(v.toLocaleLowerCase('es')==='r')return 'erre';
    }
    return v;
  }

  function spokenInstruction(q){
    if(q.voicePrompt)return q.voicePrompt;
    if(q.type==='picturePick')return q.targetLetter?`Busca una palabra que empiece con ${String(q.targetLetter).toUpperCase()}.`:'Toca la nota de un dibujo para escuchar su nombre.';
    if(q.type==='imageWordPick')return `Mira el dibujo. Busca la palabra ${q.word||q.answer}.`;
    if(q.type==='memoryMatch')return 'Une cada dibujo con su palabra.';
    if(q.type==='sentenceBuild')return `Escucha: ${q.say}. Pon las palabras en orden.`;
    if(q.type==='symbolPick'){
      const heard=String(q.say||q.word||q.answer||'').trim(),shape=optionShape(q),kind=centralAudioKind(q);
      if(/_symbol$/.test(q.skill||'')&&!q.say)return `Busca la ${String(q.answer||'').toUpperCase()}.`;
      if(shape.allLetters&&kind==='word'&&heard.length>1)return `¿Con qué letra empieza ${heard.toLocaleUpperCase('es')}? Toca la primera letra.`;
      if(kind==='vowel')return `Escucha y toca la ${heard.toUpperCase()}.`;
      if(kind==='syllable')return `Escucha y toca ${heard.toLocaleUpperCase('es')}.`;
      if(kind==='word')return shape.allLetters?`¿Con qué letra empieza ${heard.toLocaleUpperCase('es')}? Toca la primera letra.`:`Escucha ${heard.toLocaleLowerCase('es')}. Toca esa palabra.`;
      if(kind==='letterName')return `Escucha y toca la ${heard.toUpperCase()}.`;
      return q.prompt||'';
    }
    if(q.type==='listenPick'){
      const heard=String(q.say||'').trim(),kind=centralAudioKind(q);
      if(kind==='vowel')return `Escucha y toca la ${heard.toUpperCase()}.`;
      if(kind==='syllable')return `Escucha y toca ${heard.toLocaleUpperCase('es')}.`;
      if(kind==='word')return `Escucha y toca ${heard.toLocaleLowerCase('es')}.`;
      return `Escucha ${heard}. Toca lo que escuchaste.`;
    }
    if(q.type==='sentenceModel')return q.voicePrompt||`Escucha ${q.say}. Toca las palabras de izquierda a derecha.`;
    if(q.type==='sentenceSceneRead')return q.voicePrompt||'Lee la frase. Si necesitas ayuda, toca el oído.';
    if(q.type==='wordModel')return q.voicePrompt||`Mira ${q.word}. Toca sus partes de izquierda a derecha.`;
    if(q.type==='wordWrite')return q.voicePrompt||`Escucha ${q.word}. Escríbela con tu dedo.`;
    if(q.type==='sentenceWrite')return q.voicePrompt||`Escucha ${q.sentence||q.say}. Escríbela con tu dedo. Empieza con mayúscula y termina con punto.`;
    if(q.type==='magicTrace'){const shown=q.caseMode==='lower'?String(q.letter||'').toLocaleLowerCase('es'):String(q.letter||'').toLocaleUpperCase('es');return q.voicePrompt||`Pinta la ${shown} con tu dedo. La tinta dorada solo queda dentro de la letra.`;}
    if(q.type==='secretWord')return q.voicePrompt||'Mira la pista. Toca las piezas en orden para formar la palabra.';
    if(q.type==='build')return `Escucha ${q.word||q.say}. Forma la palabra.`;
    if(q.type==='missingPart')return `Escucha ${q.word||q.say}. Completa la palabra.`;
    if(q.type==='gapFill'){if(q.mode==='letter')return `Completa la palabra. Toca la letra que falta.`;if(q.mode==='syllable')return `Completa la palabra. Toca la sílaba que falta.`;return `Completa la frase. Toca la palabra que falta.`;}
    if(q.type==='soundBubbles')return `Escucha y toca ${String(q.say||'').toLocaleUpperCase('es')}.`;
    if(q.type==='syllableTrail'){
      const allVowels=(q.items||[]).length>0&&(q.items||[]).every(x=>/^[aeiouáéíóú]$/i.test(String(x)));
      return `Escucha y toca cada ${allVowels?'vocal':'sílaba'}.`;
    }
    if(q.type==='trace')return `Une los puntos de la letra ${String(q.letter||'').toUpperCase()}. Puedes hacer cada parte por separado.`;
    if(q.type==='wordReveal')return `Intenta leer ${q.word}. Si necesitas ayuda, toca la nota.`;
    return q.say||q.prompt||'';
  }
  async function playInstruction(q,opts={}){
    const txt=spokenInstruction(q);if(!txt)return false;
    return learningAudio(txt,Object.assign({kind:'instruction',repeat:false,pauseMs:160,listeningText:'👂',readyText:'●'},opts));
  }
  function audioNodes(selector){return selector?[...document.querySelectorAll(selector)]:[];}
  function lockNodes(nodes){
    nodes.forEach(x=>{if(!x.dataset.audioLocked){x.dataset.audioLocked='1';x.dataset.audioPrevDisabled=x.disabled?'1':'0';}x.disabled=true;});
  }
  function unlockNodes(nodes){
    nodes.forEach(x=>{if(x.dataset.audioLocked==='1'){x.disabled=x.dataset.audioPrevDisabled==='1';delete x.dataset.audioLocked;delete x.dataset.audioPrevDisabled;}});
  }
  async function learningAudio(text,opts={}){
    if(!text)return false;
    const btn=opts.button||document.getElementById('speakQ'),status=document.getElementById('listenStatus'),nodes=audioNodes(opts.lockSelector||'');
    lockNodes(nodes);if(btn){btn.disabled=true;btn.classList.add('speaking');}
    if(status){status.textContent=opts.listeningText||'👂 Escucha…';status.classList.add('listening');status.classList.remove('ready');}
    try{
      return await EmiliaVoice.speak(text,{kind:opts.kind,repeat:opts.repeat,pauseMs:opts.pauseMs,controlled:opts.controlled});
    }finally{
      unlockNodes(nodes);if(btn){btn.disabled=false;btn.classList.remove('speaking');}
      if(status){status.textContent=opts.readyText||'Ahora puedes responder';status.classList.remove('listening');status.classList.add('ready');}
    }
  }

  function bindSpeechSpeed(id='speedQ'){
    const btn=document.getElementById(id);if(!btn||!window.EmiliaVoice||!EmiliaVoice.paceInfo)return;
    const paint=()=>{const p=EmiliaVoice.paceInfo();btn.textContent=p.short;btn.dataset.pace=p.key;btn.setAttribute('aria-label',`Velocidad de narración ${p.name}. Toca para cambiar.`);btn.title=`Velocidad ${p.name}`;};
    paint();
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();const p=EmiliaVoice.cyclePace();paint();toast(`Voz ${p.name}`);EmiliaStore.event('speech_pace',{pace:p.key});};
  }


  function shouldAutoPrompt(q){
    if(!q)return true;
    if(q.autoSpeak===false)return false;
    const auditory=['listenPick','soundBubbles','syllableTrail'].includes(String(q.type||''));
    if(auditory)return true;
    const c=(q.skill&&window.EmiliaMastery&&EmiliaMastery.confidence)?EmiliaMastery.confidence(q.skill):null;
    return !(q.review&&c&&c.key==='confident');
  }

  function answerButtons(selector,q,s,speakQ){
    document.querySelectorAll(selector).forEach(btn=>btn.onclick=async()=>{
      if(btn.disabled)return;const all=[...document.querySelectorAll(selector)];all.forEach(x=>x.disabled=true);
      const val=btn.dataset.answer,prior=attemptsFor(q),replay=isReplay();
      const canSpeak=/[a-záéíóúñ]/i.test(String(val||''))&&q.speakSelection!==false;
      if(canSpeak){
        const kind=selectionAudioKind(q,val);
        await learningAudio(val,{kind,repeat:false,button:null,listeningText:'👂',readyText:'●'});
      }
      const ok=val===q.answer;markAttempt(q);
      if(ok){
        btn.classList.add('ok');EmiliaVoice.tone('ok');feedback(true);
        if(!replay){EmiliaMastery.record(q.skill,true,prior>0,{review:q.review});if(q.adaptiveReading&&window.EmiliaReadingAdapt)EmiliaReadingAdapt.noteReviewResult(q.sourceWord||q.answer,q.skill,true,prior>0);s.hits++;if(prior===0){s.independentHits++;registerSuccess(true);}else registerMiss();}
        nextAfter(260);
      }else{
        btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});if(q.adaptiveReading&&window.EmiliaReadingAdapt)EmiliaReadingAdapt.noteReviewResult(q.sourceWord||q.answer,q.skill,false,false);s.errors++;}
        const count=attemptsFor(q);setTimeout(async()=>{all.forEach(x=>{x.classList.remove('bad');x.disabled=false;});if(count>=2){all.forEach(x=>{if(x.dataset.answer===q.answer)x.classList.add('reveal');else x.disabled=true;});await EmiliaVoice.speak('Mira la pista.',{kind:'instruction',repeat:false});}await speakQ();},300);
      }
    });
  }

  function showWordTrace(q,done){
    const card=document.querySelector('.activity-card');if(!card||!q.word){done();return;}
    const lower=String(q.word).toLocaleLowerCase('es'),art=(EMILIA_CONTENT.wordArt||{})[lower]||'',listen=(EMILIA_CONTENT.ui||{}).listen||'',repeat=(EMILIA_CONTENT.ui||{}).repeat||'';
    card.innerHTML=`<div class="word-trace-stage"><div class="word-trace-heading"><div class="activity-icon"><img src="${EMILIA_CONTENT.mascot.src}" alt=""></div>${art?`<img class="word-reward-art" src="${art}" alt="">`:''}</div><div class="word-visual small lowercase-word">${EmiliaScreens.esc(lower)}</div><button class="listen-orb small attention" id="wordTraceAudio" aria-label="Escuchar instrucción">${listen?`<img class="ui-listen-icon" src="${listen}" alt="">`:'<span>♪</span>'}</button><div class="word-trace-shell"><canvas id="wordTraceCanvas" class="trace-canvas" aria-label="Escribir ${EmiliaScreens.esc(lower)} con el dedo"></canvas><div class="trace-ready-indicator" id="wordTraceReady" hidden>✓</div><button class="trace-float-reset" id="wordTraceAgainMini" aria-label="Rehacer palabra" title="Rehacer">${repeat?`<img class="ui-repeat-icon" src="${repeat}" alt="">`:'↺'}</button></div><div id="feedback"></div><div class="simple-trace-actions"><button class="trace-reset" id="wordTraceAgain" aria-label="Borrar y volver a intentar" title="Rehacer">${repeat?`<img class="ui-repeat-icon" src="${repeat}" alt="">`:'↺'}</button><button class="btn btn-primary trace-main-action" id="wordTraceAction" disabled>✓ Completar</button></div></div>`;
    const say=()=>learningAudio(`Escribe ${lower} con tu dedo. Puedes levantar el dedo entre letras.`,{button:document.getElementById('wordTraceAudio'),kind:'instruction',repeat:false,listeningText:'👂',readyText:'✍'});document.getElementById('wordTraceAudio').onclick=say;say();
    const c=document.getElementById('wordTraceCanvas'),action=document.getElementById('wordTraceAction'),again=document.getElementById('wordTraceAgain'),againMini=document.getElementById('wordTraceAgainMini'),ready=document.getElementById('wordTraceReady');let completed=false,logged=false,tr=null;
    const syncTraceResetButtons=state=>{[again,againMini].forEach(btn=>{if(!btn)return;btn.disabled=!!state.disabled;btn.classList.toggle('armed',!!state.armed);});};
    const resetTraceStage=()=>{completed=false;logged=false;if(ready){ready.hidden=true;ready.classList.remove('on');}action.textContent='✓ Completar';action.setAttribute('aria-label','Completar');action.classList.remove('is-next');action.parentElement&&action.parentElement.classList.remove('next-ready');action.disabled=true;syncTraceResetButtons({disabled:false,armed:false});tr&&tr.reset();};
    const complete=(cov,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('word_trace_complete',{word:q.word,skill:q.skill,coverage:Math.round((cov||0)*100),manual:!!meta.manual});}EmiliaVoice.tone('ok');feedback(true,'');action.disabled=false;action.textContent='➜';action.setAttribute('aria-label','Siguiente');action.classList.add('is-next');action.parentElement&&action.parentElement.classList.add('next-ready');syncTraceResetButtons({disabled:false,armed:true});setTimeout(()=>EmiliaVoice.speak('Muy bien. Si quieres, puedes rehacerla. O toca la flecha para seguir.',{kind:'instruction',repeat:false}),150);};
    const progress=pr=>{if(completed)return;if(action)action.disabled=!pr.canComplete;if(ready){ready.hidden=!pr.autoComplete;ready.classList.toggle('on',!!pr.autoComplete);}};
    tr=EmiliaTracing.startWord(c,q.word,complete,progress);
    [again,againMini].forEach(btn=>{if(btn)btn.onclick=()=>resetTraceStage();});
    action.onclick=()=>{if(completed){done();return;}tr.forceComplete();};
    syncTraceResetButtons({disabled:false,armed:false});
  }


  function bindTouchDragChoice(btn,target,onDrop,ghostClass='choice-drag-ghost'){
    if(!btn||!target||typeof onDrop!=='function')return;
    let drag=null;
    btn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||btn.disabled)return;drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false,ghost:null};try{btn.setPointerCapture(e.pointerId);}catch(_){}});
    btn.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)>9){drag.moved=true;const g=btn.cloneNode(true);g.classList.add(ghostClass);g.removeAttribute('id');document.body.appendChild(g);drag.ghost=g;btn.classList.add('dragging');}if(drag.moved&&drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';const r=target.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;target.classList.toggle('drag-over',inside);}});
    const end=e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;if(drag.ghost)drag.ghost.remove();btn.classList.remove('dragging');target.classList.remove('drag-over');if(moved){const r=target.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;btn.dataset.dragged='1';if(inside)onDrop(btn);setTimeout(()=>{btn.dataset.dragged='0';},140);}drag=null;};
    btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);
  }

  function bindActivity(q,s){
    bindSpeechSpeed('speedQ');
    const speakBtn=document.getElementById('speakQ');
    const selector=q.type==='picturePick'?'.picture-option':q.type==='imageWordPick'?'.word-option':q.type==='build'?'.syllable-chip':q.type==='wordModel'?'.model-part':q.type==='sentenceModel'?'.sentence-model-word':q.type==='sentenceBuild'?'.sentence-chip':q.type==='gapFill'?'.gap-choice':q.type==='memoryMatch'?'.memory-card':q.type==='soundBubbles'?'.sound-bubble':q.type==='caseMatch'?'.case-option':q.type==='secretWord'?'.secret-letter':(q.type==='listenPick'||q.type==='symbolPick'||q.type==='missingPart')?'.option':'';
    let audioHelpUsed=false;const speakQ=()=>{if(q.trackAudioHelp){audioHelpUsed=true;EmiliaStore.event('activity_audio_help',{activity:q.id,skill:q.skill,kind:q.type});}return playInstruction(q,{button:speakBtn,lockSelector:selector});};if(speakBtn)speakBtn.onclick=speakQ;
    if(q.type==='picturePick'){
      document.querySelectorAll('.picture-audio').forEach(btn=>btn.onclick=async e=>{
        e.preventDefault();e.stopPropagation();
        const word=btn.dataset.word||'';if(!word)return;
        document.querySelectorAll('.picture-option').forEach(x=>x.disabled=true);
        await learningAudio(word,{button:btn,kind:'word',repeat:false,listeningText:'👂',readyText:'●'});
        document.querySelectorAll('.picture-option').forEach(x=>x.disabled=false);
      });
    }

    if(q.type==='listenPick'||q.type==='symbolPick'||q.type==='picturePick'||q.type==='imageWordPick'||q.type==='missingPart'||q.type==='soundBubbles'||q.type==='caseMatch'){
      if(shouldAutoPrompt(q))speakQ();answerButtons(q.type==='picturePick'?'.picture-option':q.type==='imageWordPick'?'.word-option':q.type==='soundBubbles'?'.sound-bubble':q.type==='caseMatch'?'.case-option':'.option',q,s,speakQ);
    }
    if(q.type==='patternIntro'){
      const heard=new Set(),next=document.getElementById('patternNext');
      const explain=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.pattern-example'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=explain;explain();
      document.querySelectorAll('.pattern-example').forEach((btn,i)=>btn.onclick=async()=>{if(btn.disabled)return;const word=btn.dataset.say||btn.textContent.trim();await learningAudio(word,{button:btn,kind:'word',repeat:false,lockSelector:'.pattern-example',listeningText:'👂',readyText:'●'});btn.classList.add('heard');heard.add(i);EmiliaStore.event('pattern_exposure',{skill:q.skill,pattern:q.pattern,value:word});if(heard.size>=Math.min(2,document.querySelectorAll('.pattern-example').length)){next.disabled=false;rewardBurst('star');}});
      if(next)next.onclick=()=>nextAfter(100);
    }
    if(q.type==='wordModel'){
      if(shouldAutoPrompt(q))speakQ();let step=0;const buttons=[...document.querySelectorAll('.model-part')],next=document.getElementById('wordModelNext');
      buttons.forEach((btn,i)=>btn.onclick=async()=>{if(btn.disabled)return;await learningAudio(btn.dataset.part,{kind:'syllable',repeat:false,button:btn,lockSelector:'.model-part',listeningText:'👂',readyText:'●'});if(i===step){btn.classList.add('heard');step++;if(step===buttons.length){buttons.forEach(x=>x.disabled=true);feedback(true);rewardBurst('star');await learningAudio(q.word,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});if(next)next.disabled=false;EmiliaStore.event('word_model_complete',{word:q.word,skill:q.skill});}}else{btn.classList.add('hint');setTimeout(()=>btn.classList.remove('hint'),420);const expected=buttons[step];expected&&expected.classList.add('reveal');setTimeout(()=>expected&&expected.classList.remove('reveal'),560);}});
      if(next)next.onclick=()=>nextAfter(80);
    }
    if(q.type==='magicTrace'){
      const canvas=document.getElementById('magicTraceCanvas'),again=document.getElementById('magicTraceAgain'),againMini=document.getElementById('magicTraceAgainMini'),action=document.getElementById('magicTraceAction'),ready=document.getElementById('magicTraceReady');let tracer=null,completed=false,logged=false;const replay=isReplay();
      const say=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'#magicTraceAction'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=say;say();
      const reset=()=>{completed=false;logged=false;if(ready){ready.hidden=true;ready.classList.remove('on');}if(action){action.disabled=true;action.textContent='✓ Completar';action.setAttribute('aria-label','Completar');action.classList.remove('is-next');}tracer&&tracer.reset();};
      const complete=async(cov,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('magic_trace_complete',{skill:q.skill,letter:q.letter,caseMode:q.caseMode,coverage:Math.round((cov||0)*100),manual:!!meta.manual});}EmiliaVoice.tone('ok');feedback(true);if(!replay){if(q.skill)EmiliaMastery.record(q.skill,true,false,{writing:true,magicInk:true,caseMode:q.caseMode});s.hits++;s.independentHits++;registerSuccess(true);}if(action){action.disabled=false;action.textContent='➜';action.setAttribute('aria-label','Siguiente');action.classList.add('is-next');}const shown=q.caseMode==='lower'?String(q.letter||'').toLocaleLowerCase('es'):String(q.letter||'').toLocaleUpperCase('es');await learningAudio(shown,{kind:/^[aeiouáéíóú]$/i.test(shown)?'vowel':'letterName',repeat:false,button:null,listeningText:'👂',readyText:'●'});};
      const progress=pr=>{if(completed)return;if(action)action.disabled=!pr.canComplete;if(ready){ready.hidden=!pr.autoComplete;ready.classList.toggle('on',!!pr.autoComplete);}};
      if(canvas)tracer=EmiliaTracing.startMagic(canvas,q.letter,q.caseMode,complete,progress);
      [again,againMini].forEach(b=>{if(b)b.onclick=reset;});if(action)action.onclick=()=>{if(completed)nextAfter(80);else tracer&&tracer.forceComplete();};
    }
    if(q.type==='secretWord'){
      const units=(q.units&&q.units.length?q.units:[...String(q.word||'').toLocaleLowerCase('es')]),slots=[...document.querySelectorAll('.secret-slot')],buttons=[...document.querySelectorAll('.secret-letter')],hint=document.getElementById('secretHint');let pos=0,misses=0,completed=false;const replay=isReplay();
      const say=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.secret-letter'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=say;say();
      const unitAudio=u=>{const v=String(u||'').toLocaleLowerCase('es');if(/^[aeiouáéíóú]$/i.test(v))return{text:v,kind:'vowel'};if(v==='ch')return{text:'che',kind:'instruction'};if(v==='rr')return{text:'doble erre',kind:'instruction'};if(v==='que'||v==='qui'||v==='ce'||v==='ci'||v==='ge'||v==='gi')return{text:v,kind:'syllable'};return{text:v,kind:'letterName'};};
      const revealExpected=()=>{const next=units[pos];buttons.forEach(b=>b.classList.toggle('reveal',b.dataset.letter===next));setTimeout(()=>buttons.forEach(b=>b.classList.remove('reveal')),750);};
      buttons.forEach(btn=>btn.onclick=async()=>{if(completed||btn.disabled)return;const val=String(btn.dataset.letter||'').toLocaleLowerCase('es'),expected=units[pos];buttons.forEach(b=>b.disabled=true);
        if(val===expected){if(slots[pos]){slots[pos].textContent=expected;slots[pos].classList.add('filled');}btn.classList.add('ok');const ua=unitAudio(expected);await learningAudio(ua.text,{kind:ua.kind,repeat:false,button:null,listeningText:'👂',readyText:'●'});btn.classList.remove('ok');pos++;if(hint)hint.textContent='';if(pos>=units.length){completed=true;buttons.forEach(b=>b.disabled=true);EmiliaVoice.tone('ok');feedback(true);const assisted=misses>0;if(!replay){if(q.skill)EmiliaMastery.record(q.skill,true,assisted,{spelling:true,secretWord:true});s.hits++;if(!assisted){s.independentHits++;registerSuccess(true);}else registerMiss();}EmiliaStore.event('secret_word_complete',{word:q.word,skill:q.skill,misses,independent:!assisted});await learningAudio(q.word,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});nextAfter(420);return;}}
        else{misses++;btn.classList.add('bad');EmiliaVoice.tone('bad');if(misses===1&&!replay){s.errors++;registerMiss();if(q.skill)EmiliaMastery.record(q.skill,false,false,{spelling:true,secretWord:true});}if(hint)hint.textContent=misses>=2?'Lumi te muestra la siguiente letra.':'Prueba otra letra.';if(misses>=2)revealExpected();setTimeout(()=>btn.classList.remove('bad'),360);}
        if(!completed)setTimeout(()=>buttons.forEach(b=>b.disabled=false),180);
      });
    }
    if(q.type==='wordWrite'){
      const canvas=document.getElementById('wordWriteCanvas'),again=document.getElementById('wordWriteAgain'),againMini=document.getElementById('wordWriteAgainMini'),action=document.getElementById('wordWriteAction'),ready=document.getElementById('wordWriteReady'),help=document.getElementById('wordWriteHelp'),hint=document.getElementById('wordWriteHint');let completed=false,assisted=false,logged=false,tracer=null;const replay=isReplay();
      const say=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'#wordWriteAction,#wordWriteHelp'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=say;say();
      const sync=()=>{[again,againMini].forEach(b=>{if(b)b.disabled=false;});};
      const reset=()=>{completed=false;logged=false;if(ready){ready.hidden=true;ready.classList.remove('on');}if(action){action.disabled=true;action.textContent='✓ Completar';action.classList.remove('is-next');}tracer&&tracer.reset();};
      const complete=async(cov,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('word_write_complete',{word:q.word,skill:q.skill,coverage:Math.round((cov||0)*100),manual:!!meta.manual,assisted});}EmiliaVoice.tone('ok');feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,assisted,{writing:true});s.hits++;if(!assisted){s.independentHits++;registerSuccess(true);}else registerMiss();}await learningAudio(q.word,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});if(action){action.disabled=false;action.textContent='➜';action.classList.add('is-next');}};
      const progress=pr=>{if(completed)return;if(action)action.disabled=!pr.canComplete;if(ready){ready.hidden=!pr.autoComplete;ready.classList.toggle('on',!!pr.autoComplete);}};
      if(canvas)tracer=EmiliaTracing.startWord(canvas,q.word,complete,progress,{guide:'minimal'});
      if(help)help.onclick=()=>{assisted=true;if(hint){hint.hidden=false;hint.classList.add('show');}tracer&&tracer.setGuide('faded');EmiliaStore.event('word_write_help',{word:q.word,skill:q.skill});EmiliaVoice.speak(q.word,{kind:'word',repeat:false});};
      [again,againMini].forEach(b=>{if(b)b.onclick=reset;});
      if(action)action.onclick=()=>{if(completed)nextAfter(80);else tracer&&tracer.forceComplete();};sync();
    }
    if(q.type==='sentenceWrite'){
      const canvas=document.getElementById('sentenceWriteCanvas'),again=document.getElementById('sentenceWriteAgain'),againMini=document.getElementById('sentenceWriteAgainMini'),action=document.getElementById('sentenceWriteAction'),ready=document.getElementById('sentenceWriteReady'),help=document.getElementById('sentenceWriteHelp'),hint=document.getElementById('sentenceWriteHint');let completed=false,assisted=false,logged=false,tracer=null;const replay=isReplay(),phrase=String(q.sentence||q.say||'').trim();
      const say=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'#sentenceWriteAction,#sentenceWriteHelp'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=say;say();
      const reset=()=>{completed=false;logged=false;if(ready){ready.hidden=true;ready.classList.remove('on');}if(action){action.disabled=true;action.textContent='✓ Completar';action.classList.remove('is-next');}if(hint){hint.hidden=true;hint.classList.remove('show');}tracer&&tracer.setGuide('minimal');tracer&&tracer.reset();};
      const complete=async(cov,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('sentence_write_complete',{sentence:phrase,skill:q.skill,coverage:Math.round((cov||0)*100),manual:!!meta.manual,assisted});}EmiliaVoice.tone('ok');feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,assisted,{writing:true,sentenceWriting:true});s.hits++;if(!assisted){s.independentHits++;registerSuccess(true);}else registerMiss();}await learningAudio(phrase,{kind:'sentence',repeat:false,button:null,listeningText:'👂',readyText:'●'});if(action){action.disabled=false;action.textContent='➜';action.classList.add('is-next');}};
      const progress=pr=>{if(completed)return;if(action)action.disabled=!pr.canComplete;if(ready){ready.hidden=!pr.autoComplete;ready.classList.toggle('on',!!pr.autoComplete);}};
      if(canvas)tracer=EmiliaTracing.startSentence(canvas,phrase,complete,progress,{guide:'minimal'});
      if(help)help.onclick=()=>{assisted=true;if(hint){hint.hidden=false;hint.classList.add('show');}tracer&&tracer.setGuide('faded');EmiliaStore.event('sentence_write_help',{sentence:phrase,skill:q.skill});EmiliaVoice.speak(phrase,{kind:'sentence',repeat:false});};
      [again,againMini].forEach(b=>{if(b)b.onclick=reset;});
      if(action)action.onclick=()=>{if(completed)nextAfter(80);else tracer&&tracer.forceComplete();};
    }
    if(q.type==='build'){
      if(shouldAutoPrompt(q))speakQ();let built=[],buildAttempts=0;const replay=isReplay(),target=document.getElementById('buildTarget'),chips=[...document.querySelectorAll('.syllable-chip')];
      const render=()=>{if(!target)return;target.innerHTML=built.length?built.map(x=>`<span class="built-chip lowercase-word-part">${EmiliaScreens.esc(String(x).toLocaleLowerCase('es'))}</span>`).join(''):'<span class="build-placeholder">✦</span>';target.classList.toggle('has-content',built.length>0);};
      const resetBuild=()=>{built=[];chips.forEach(x=>{x.classList.remove('used','dragging');x.disabled=false;});target&&target.classList.remove('drag-over','has-content');render();};
      const choose=async btn=>{if(!btn||btn.classList.contains('used')||btn.disabled)return;built.push(btn.dataset.part);btn.classList.add('used');render();await learningAudio(btn.dataset.part,{kind:'syllable',repeat:false,lockSelector:'.syllable-chip',button:null,listeningText:'👂',readyText:'●'});if(built.length===q.answerParts.length){const ok=built.join('|')===q.answerParts.join('|');if(ok){EmiliaVoice.tone('ok');feedback(true);target&&target.classList.add('assembled');if(!replay){EmiliaMastery.record(q.skill,true,buildAttempts>0,{review:q.review});s.hits++;if(buildAttempts===0){s.independentHits++;registerSuccess(true);}else registerMiss();}if(q.traceAfter===false){setTimeout(async()=>{await learningAudio(q.word||q.say,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});nextAfter(80);},180);}else setTimeout(()=>showWordTrace(q,()=>nextAfter(120)),240);}else{feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}buildAttempts++;setTimeout(()=>{target&&target.classList.remove('assembled');resetBuild();speakQ();},360);}}};
      chips.forEach(btn=>{btn.onclick=()=>{if(btn.dataset.dragged==='1'){btn.dataset.dragged='0';return;}choose(btn);};btn.draggable=true;btn.addEventListener('dragstart',e=>{if(btn.disabled||btn.classList.contains('used')){e.preventDefault();return;}e.dataTransfer.setData('text/plain',btn.dataset.part||'');window.__emiliaBuildDrag=btn;btn.classList.add('dragging');});btn.addEventListener('dragend',()=>btn.classList.remove('dragging'));bindTouchDragChoice(btn,target,choose,'build-drag-ghost');});
      if(target){target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('drag-over');});target.addEventListener('dragleave',()=>target.classList.remove('drag-over'));target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('drag-over');const btn=window.__emiliaBuildDrag;window.__emiliaBuildDrag=null;if(btn)choose(btn);});}
      const clear=document.getElementById('clearBuild');if(clear)clear.onclick=()=>resetBuild();render();
    }
    if(q.type==='sentenceModel'){
      if(shouldAutoPrompt(q))speakQ();const heard=new Set(),words=[...document.querySelectorAll('.sentence-model-word')],next=document.getElementById('sentenceModelNext');let expected=0;
      words.forEach((btn,i)=>btn.onclick=async()=>{if(btn.disabled)return;const val=btn.dataset.word||'';await learningAudio(val,{kind:'word',repeat:false,button:btn,lockSelector:'.sentence-model-word',listeningText:'👂',readyText:'●'});if(i===expected){btn.classList.add('heard');heard.add(i);expected++;}else{btn.classList.add('hint');setTimeout(()=>btn.classList.remove('hint'),460);const want=words[expected];want&&want.classList.add('reveal');setTimeout(()=>want&&want.classList.remove('reveal'),720);}if(heard.size===words.length){if(next)next.disabled=false;await wait(110);await learningAudio(q.say,{kind:'sentence',repeat:false,button:null,listeningText:'👂',readyText:'●'});}});
      if(next)next.onclick=()=>{EmiliaStore.event('sentence_model_complete',{sentence:q.say,skill:q.skill});nextAfter(100);};
    }
    if(q.type==='sentenceSceneRead'){
      const done=document.getElementById('sentenceReadDone'),model=document.getElementById('speakQ'),words=[...document.querySelectorAll('.sentence-scene-word')],pieces=[...document.querySelectorAll('.sentence-scene-piece[data-say]')];let assisted=false;
      EmiliaVoice.speak(q.voicePrompt||'Lee la frase. Si necesitas ayuda, toca el oído.',{kind:'instruction',repeat:false});
      if(model)model.onclick=async()=>{assisted=true;await learningAudio(q.say,{kind:'sentence',repeat:false,button:model,lockSelector:'.sentence-scene-word,.sentence-scene-piece',listeningText:'👂',readyText:'●'});};
      words.forEach(btn=>btn.onclick=async()=>{assisted=true;btn.classList.add('heard');await learningAudio(btn.dataset.word||'',{kind:'word',repeat:false,button:btn,listeningText:'👂',readyText:'●'});});
      pieces.forEach(btn=>btn.onclick=async()=>{assisted=true;await learningAudio(btn.dataset.say||'',{kind:'word',repeat:false,button:btn,listeningText:'👂',readyText:'●'});});
      if(done)done.onclick=()=>{EmiliaStore.event('sentence_read_attempt',{sentence:q.say,skill:q.skill,assisted});rewardBurst('star');EmiliaVoice.tone('ok');nextAfter(180);};
    }
    if(q.type==='sentenceBuild'){
      if(q.autoSpeak!==false)speakQ();let built=[],tries=0;const replay=isReplay(),target=document.getElementById('sentenceTarget'),chips=[...document.querySelectorAll('.sentence-chip')];
      const render=()=>{if(!target)return;target.innerHTML=built.length?built.map(x=>`<span>${EmiliaScreens.esc(String(x).toLocaleLowerCase('es'))}</span>`).join(''):'<i>● ● ●</i>';target.classList.toggle('has-content',built.length>0);};
      const resetSentence=()=>{built=[];chips.forEach(x=>{x.classList.remove('used','dragging');x.disabled=false;});target&&target.classList.remove('drag-over','sentence-complete','has-content');render();};
      const choose=async btn=>{if(!btn||btn.classList.contains('used')||btn.disabled)return;built.push(btn.dataset.word);btn.classList.add('used');render();await learningAudio(btn.dataset.word,{kind:'word',repeat:false,lockSelector:'.sentence-chip',button:null,listeningText:'👂',readyText:'●'});if(built.length===q.answerParts.length){const ok=built.join('|')===q.answerParts.join('|');if(ok){target&&target.classList.add('sentence-complete');feedback(true);const assisted=tries>0||audioHelpUsed;if(!replay){EmiliaMastery.record(q.skill,true,assisted,{review:q.review});s.hits++;if(!assisted){s.independentHits++;registerSuccess(true);}else registerMiss();}if(q.say)await learningAudio(q.say,{kind:'sentence',repeat:false,button:null,listeningText:'👂',readyText:'●'});nextAfter(180);}else{feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}tries++;setTimeout(()=>{resetSentence();speakQ();},420);}}};
      chips.forEach(btn=>{btn.onclick=()=>{if(btn.dataset.dragged==='1'){btn.dataset.dragged='0';return;}choose(btn);};btn.draggable=true;btn.addEventListener('dragstart',e=>{if(btn.disabled||btn.classList.contains('used')){e.preventDefault();return;}e.dataTransfer.setData('text/plain',btn.dataset.word||'');window.__emiliaSentenceDrag=btn;btn.classList.add('dragging');});btn.addEventListener('dragend',()=>btn.classList.remove('dragging'));bindTouchDragChoice(btn,target,choose,'sentence-drag-ghost');});
      if(target){target.addEventListener('dragover',e=>{e.preventDefault();target.classList.add('drag-over');});target.addEventListener('dragleave',()=>target.classList.remove('drag-over'));target.addEventListener('drop',e=>{e.preventDefault();target.classList.remove('drag-over');const btn=window.__emiliaSentenceDrag;window.__emiliaSentenceDrag=null;if(btn)choose(btn);});}
      const clear=document.getElementById('clearSentence');if(clear)clear.onclick=()=>resetSentence();render();
    }
    if(q.type==='gapFill'){
      if(q.autoSpeak!==false)speakQ();const slot=document.getElementById('gapSlot'),reset=document.getElementById('gapReset');let locked=false,tries=0;const replay=isReplay();
      const clear=()=>{if(locked)return;if(slot){slot.textContent='?';slot.classList.remove('filled','ok','bad');}document.querySelectorAll('.gap-choice').forEach(x=>{x.classList.remove('used','bad','ok');x.disabled=false;});};
      const completedGapText=()=>{if(q.completeSay)return String(q.completeSay);if(q.say)return String(q.say);const parts=(q.display||[]).map(x=>x==='__'?q.answer:x);return q.mode==='word'?parts.join(' '):parts.join('');};
      const completedGapKind=text=>q.completeAudioKind||(q.mode==='word'||/\s/.test(String(text||''))?'sentence':'word');
      const choose=async btn=>{if(locked||btn.disabled)return;locked=true;document.querySelectorAll('.gap-choice').forEach(x=>x.disabled=true);const val=btn.dataset.answer||'';if(slot){slot.textContent=String(val).toLocaleLowerCase('es');slot.classList.add('filled');}btn.classList.add('used');const kind=selectionAudioKind(q,val),spokenVal=selectionAudioText(q,val);await learningAudio(spokenVal,{kind,repeat:false,button:null,listeningText:'👂',readyText:'●'});const ok=val===q.answer;if(ok){slot&&slot.classList.add('ok');btn.classList.add('ok');document.querySelector('.gap-board')?.classList.add('gap-complete');EmiliaVoice.tone('ok');feedback(true);const assisted=tries>0||audioHelpUsed;if(!replay){EmiliaMastery.record(q.skill,true,assisted,{review:q.review});s.hits++;if(!assisted){s.independentHits++;registerSuccess(true);}else registerMiss();}const whole=completedGapText();if(whole){await new Promise(r=>setTimeout(r,110));await learningAudio(whole,{kind:completedGapKind(whole),repeat:false,button:null,listeningText:'👂',readyText:'●'});}setTimeout(()=>nextAfter(160),220);}else{slot&&slot.classList.add('bad');btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}tries++;setTimeout(()=>{locked=false;clear();document.querySelector('.gap-board')?.classList.remove('gap-complete');speakQ();},480);}};
      document.querySelectorAll('.gap-choice').forEach(btn=>{
        btn.onclick=()=>{if(btn.dataset.dragged==='1'){btn.dataset.dragged='0';return;}choose(btn);};
        btn.draggable=true;btn.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',btn.dataset.answer||'');window.__emiliaGapDrag=btn;});
        let touchDrag=null;
        btn.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||locked||btn.disabled)return;touchDrag={id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false,ghost:null};try{btn.setPointerCapture(e.pointerId);}catch(_){}});
        btn.addEventListener('pointermove',e=>{if(!touchDrag||touchDrag.id!==e.pointerId)return;const dx=e.clientX-touchDrag.sx,dy=e.clientY-touchDrag.sy;if(!touchDrag.moved&&Math.hypot(dx,dy)>8){touchDrag.moved=true;const g=btn.cloneNode(true);g.classList.add('gap-drag-ghost');g.removeAttribute('id');document.body.appendChild(g);touchDrag.ghost=g;}if(touchDrag.moved&&touchDrag.ghost){touchDrag.ghost.style.left=e.clientX+'px';touchDrag.ghost.style.top=e.clientY+'px';if(slot){const r=slot.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;slot.classList.toggle('drag-over',inside);}}});
        const endTouchDrag=e=>{if(!touchDrag||touchDrag.id!==e.pointerId)return;const wasMoved=touchDrag.moved;if(touchDrag.ghost)touchDrag.ghost.remove();if(slot)slot.classList.remove('drag-over');if(wasMoved&&slot){const r=slot.getBoundingClientRect(),inside=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;btn.dataset.dragged='1';if(inside)choose(btn);setTimeout(()=>{btn.dataset.dragged='0';},120);}touchDrag=null;};
        btn.addEventListener('pointerup',endTouchDrag);btn.addEventListener('pointercancel',endTouchDrag);
      });
      if(slot){slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag-over');});slot.addEventListener('dragleave',()=>slot.classList.remove('drag-over'));slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('drag-over');const btn=window.__emiliaGapDrag;if(btn)choose(btn);window.__emiliaGapDrag=null;});}
      if(reset)reset.onclick=()=>{locked=false;clear();};
    }
    if(q.type==='memoryMatch'){
      if(shouldAutoPrompt(q))speakQ();let first=null,matched=0,mistakes=0,done=false;const replay=isReplay(),cards=[...document.querySelectorAll('.memory-card')];
      cards.forEach(btn=>btn.onclick=async()=>{if(done||btn.disabled||btn.classList.contains('matched'))return;if(first===btn)return;btn.classList.add('open');if(btn.dataset.match)await learningAudio(btn.dataset.match,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});if(!first){first=btn;return;}const a=first,b=btn;cards.forEach(x=>x.disabled=true);if(a.dataset.match===b.dataset.match&&a.dataset.kind!==b.dataset.kind){a.classList.add('matched');b.classList.add('matched');matched+=2;EmiliaVoice.tone('ok');rewardBurst('star');first=null;cards.forEach(x=>{if(!x.classList.contains('matched'))x.disabled=false;});if(matched===cards.length){done=true;feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,mistakes>0,{review:q.review});s.hits++;if(mistakes===0){s.independentHits++;registerSuccess(true);}else{s.errors++;registerMiss();}}nextAfter(420);}}else{mistakes++;EmiliaVoice.tone('bad');registerMiss();setTimeout(()=>{a.classList.remove('open');b.classList.remove('open');first=null;cards.forEach(x=>{if(!x.classList.contains('matched'))x.disabled=false;});},520);}});
    }
    if(q.type==='syllableTrail'){
      const touched=new Set(),next=document.getElementById('trailNext'),speakTrail=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.trail-gem'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=speakTrail;speakTrail();
      document.querySelectorAll('.trail-gem').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;const v=btn.dataset.sound;btn.classList.add('lit');const kind=/^[aeiouáéíóú]$/i.test(String(v))?'vowel':'syllable';await learningAudio(v,{kind,repeat:false,lockSelector:'.trail-gem',button:null,listeningText:'👂',readyText:'●'});touched.add(v);EmiliaStore.event('exposure',{skill:q.skill,value:v});if(touched.size===q.items.length){next.disabled=false;rewardBurst('star');EmiliaVoice.tone('ok');}});next.onclick=()=>nextAfter(100);
    }
    if(q.type==='trace'){
      const canvas=document.getElementById('traceCanvas'),again=document.getElementById('traceAgain'),againMini=document.getElementById('traceAgainMini'),action=document.getElementById('traceAction'),ready=document.getElementById('traceReady'),audio=document.getElementById('speakQ'),say=()=>playInstruction(q,{button:audio,lockSelector:'#traceAction'});if(audio)audio.onclick=say;say();let tracer=null,completed=false,logged=false;
      const syncTraceResetButtons=state=>{[again,againMini].forEach(btn=>{if(!btn)return;btn.disabled=!!state.disabled;btn.classList.toggle('armed',!!state.armed);});};
      const resetTraceStage=()=>{completed=false;logged=false;if(ready){ready.hidden=true;ready.classList.remove('on');}action.textContent='✓ Completar';action.setAttribute('aria-label','Completar');action.classList.remove('is-next');action.parentElement&&action.parentElement.classList.remove('next-ready');action.disabled=true;syncTraceResetButtons({disabled:false,armed:false});tracer&&tracer.reset();};
      const complete=(coverage,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('trace_complete',{skill:q.skill,letter:q.letter,coverage:Math.round((coverage||0)*100),manual:!!meta.manual,segments:meta.segments||[]});}EmiliaVoice.tone('ok');feedback(true);action.disabled=false;action.textContent='➜';action.setAttribute('aria-label','Siguiente');action.classList.add('is-next');action.parentElement&&action.parentElement.classList.add('next-ready');syncTraceResetButtons({disabled:false,armed:true});setTimeout(()=>EmiliaVoice.speak('Muy bien. Si quieres, puedes rehacerla. O toca la flecha para seguir.',{kind:'instruction',repeat:false}),150);};
      const progress=pr=>{if(completed)return;if(action)action.disabled=!pr.canComplete;if(ready){ready.hidden=!pr.autoComplete;ready.classList.toggle('on',!!pr.autoComplete);}};
      if(canvas)tracer=EmiliaTracing.start(canvas,q.letter,complete,progress);
      [again,againMini].forEach(btn=>{if(btn)btn.onclick=()=>resetTraceStage();});
      if(action)action.onclick=()=>{if(completed)nextAfter(90);else tracer&&tracer.forceComplete();};
      syncTraceResetButtons({disabled:false,armed:false});
    }
    if(q.type==='wordReveal'){
      const tried=document.getElementById('readTried'),model=document.getElementById('speakQ'),say=()=>learningAudio(q.say,{button:model,kind:'word',repeat:false,listeningText:'👂',readyText:'●'});if(model)model.onclick=say;if(tried)tried.onclick=()=>{EmiliaStore.event('reading_practice',{skill:q.skill,word:q.word,selfReported:true});rewardBurst('star');nextAfter(260);};
    }
  }


  function estimateStoryPulseDelay(pageText,wordCount,fluent){
    const pace=(window.EmiliaVoice&&EmiliaVoice.paceInfo?EmiliaVoice.paceInfo().multiplier:1)||1;
    const chars=Math.max(8,String(pageText||'').length);
    const raw=((chars*52)+520)/Math.max(.88,pace);
    const perWord=Math.round(raw/Math.max(1,wordCount||1));
    return Math.max(fluent?180:160,Math.min(fluent?460:360,perWord));
  }
  async function animateStoryWords(panel,pageText,opts={}){
    if(!panel)return;
    const token=Date.now()+Math.random();
    panel.dataset.highlightToken=String(token);
    const spans=[...panel.querySelectorAll('.story-word')];
    if(!spans.length)return;
    const delay=estimateStoryPulseDelay(pageText,spans.length,!!opts.fluent);
    spans.forEach(x=>x.classList.remove('active','spoken'));
    for(let i=0;i<spans.length;i++){
      if(panel.dataset.highlightToken!==String(token))return;
      spans.forEach(x=>x.classList.remove('active'));
      const current=spans[i];
      if(current){
        current.classList.add('active','spoken');
        current.classList.remove('spoken');
        void current.offsetWidth;
        current.classList.add('spoken');
      }
      await wait(i===spans.length-1?Math.max(170,delay-30):delay);
    }
    if(panel.dataset.highlightToken===String(token))spans.forEach(x=>x.classList.remove('active'));
  }

  async function playStory(st,pageIndex=0,opts={}){
    storyContext={listened:true,storyId:st.id};
    const btn=document.getElementById('storyListen'),status=document.getElementById('storyListenStatus');
    const panel=document.querySelector(`.story-page-panel[data-page="${pageIndex}"]`)||document.querySelector('.story-page-panel.active');
    const pageText=panel?String(panel.dataset.text||'').trim():String(st.text||'').trim();
    if(!opts.magic&&window.EmiliaReadingAdapt)EmiliaReadingAdapt.notePageModel(st.id,pageIndex+1,pageText,st.skill,{audioFocus:st.kind==='audioFocus'});
    if(btn){btn.disabled=true;btn.classList.add('speaking');}
    if(opts.guided){
      const spans=panel?[...panel.querySelectorAll('.story-word')]:[];
      if(status)status.textContent='📖 Lumi lee y marca las palabras';
      for(let i=0;i<spans.length;i++){
        spans.forEach(x=>x.classList.remove('active'));
        const current=spans[i];
        if(current){current.classList.add('active','spoken');current.classList.remove('spoken');void current.offsetWidth;current.classList.add('spoken');}
        const clean=String(current&&current.textContent||'').replace(/[.,!?¡¿]/g,'').trim();
        if(clean)await EmiliaVoice.speak(clean,{kind:'word',repeat:false});
        await wait(80);
      }
      spans.forEach(x=>x.classList.remove('active'));
      if(status)status.textContent='👆 Toca una palabra si quieres escucharla otra vez';
    }else if(st.kind==='audioFocus'||opts.fluent){
      if(status)status.textContent=opts.fluent?'📖 Lumi lee el cuento…':'👂 Escuchando…';
      const pulse=animateStoryWords(panel,pageText,{fluent:true});
      await EmiliaVoice.speak(pageText,{kind:'story',repeat:false});
      await pulse.catch(()=>{});
      if(status)status.textContent=st.kind==='audioFocus'?'👆 Toca una vocal para escucharla':'👆 Puedes tocar una palabra si quieres escucharla otra vez';
    }else{
      const spans=panel?[...panel.querySelectorAll('.story-word')]:[];
      spans.forEach(x=>x.classList.remove('active'));
      if(status)status.textContent='👂 Lumi lee esta frase';
      for(let i=0;i<spans.length;i++){
        spans.forEach(x=>x.classList.remove('active'));
        if(spans[i]){spans[i].classList.add('active','spoken');spans[i].classList.remove('spoken');void spans[i].offsetWidth;spans[i].classList.add('spoken');}
        const clean=String(spans[i].textContent||'').replace(/[.,!?¡¿]/g,'');
        if(clean)await EmiliaVoice.speak(clean,{kind:'word',repeat:false});
        await wait(120);
      }
      spans.forEach(x=>x.classList.remove('active'));
      if(status)status.textContent='👂 Ahora escucha la frase';
      await wait(160);
      const pulse=animateStoryWords(panel,pageText,{fluent:false});
      if(pageText)await EmiliaVoice.speak(pageText,{kind:'story',repeat:false});
      await pulse.catch(()=>{});
      if(status)status.textContent='👆 Toca una palabra si necesitas ayuda';
    }
    if(btn){btn.disabled=false;btn.classList.remove('speaking');}
    EmiliaStore.event('story_model',{storyId:st.id,page:pageIndex+1,fluent:!!opts.fluent});
  }
  function completeStory(st){
    storyContext.storyId=st.id;
    EmiliaVoice.tone('ok');haptic([18,26,22]);rewardBurst('star');
    EmiliaStore.event('story_complete',{storyId:st.id,listenedFirst:storyContext.listened,mode:'magic_story'});
    if(window.EmiliaReadingAdapt)EmiliaReadingAdapt.noteStoryComplete(st.id);
    const ss=EmiliaStore.get(),count=new Set((ss.history||[]).filter(e=>e.type==='story_complete').map(e=>e.storyId)).size;
    if(count>=3&&!(ss.achievements||[]).includes('stories_3')){ss.achievements.push('stories_3');EmiliaStore.save();rewardBurst('medal');}
    setTimeout(()=>EmiliaVoice.speak('¡Qué lindo cuento! Volvamos al bosque.',{kind:'praise',repeat:false}),220);
    return true;
  }
  function openStory(id){storyContext={listened:false,storyId:id};EmiliaScreens.book(id);}
  function exportProgress(){const blob=new Blob([EmiliaStore.exportJSON()],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='emilia_bosque_v1.5.0_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Copia exportada.');}
  function importProgress(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{EmiliaStore.importJSON(r.result);toast('Progreso restaurado.');setTimeout(()=>go('adult'),400);}catch(e){toast('No pude importar ese archivo.');}};r.readAsText(file);}
  let deferredInstall=null,swRegistration=null,reloadingForSW=false,installAvailable=false,updateReady=false;
  function setPWAButton(id,show){const b=document.getElementById(id);if(b)b.hidden=!show;}
  function syncPWAControls(){setPWAButton('pwaInstallBtn',installAvailable);setPWAButton('pwaUpdateBtn',updateReady);const u=document.getElementById('pwaUpdateBtn');if(u){u.classList.toggle('update-ready',updateReady);u.classList.remove('updating');}}
  function bindPWABar(){
    const install=document.getElementById('pwaInstallBtn'),update=document.getElementById('pwaUpdateBtn');
    if(install&&!install.dataset.bound){install.dataset.bound='1';install.onclick=async()=>{if(!deferredInstall)return;try{deferredInstall.prompt();await deferredInstall.userChoice;}catch(_){ }deferredInstall=null;installAvailable=false;syncPWAControls();};}
    if(update&&!update.dataset.bound){update.dataset.bound='1';update.onclick=async()=>{if(!swRegistration||!updateReady)return;update.disabled=true;update.classList.add('updating');try{if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}await swRegistration.update();if(swRegistration.waiting){swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}updateReady=false;syncPWAControls();update.disabled=false;}catch(_){update.disabled=false;update.classList.remove('updating');toast('No pude actualizar ahora.');}};}
  }
  function watchRegistration(reg){
    swRegistration=reg;updateReady=!!reg.waiting;bindPWABar();syncPWAControls();
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){updateReady=true;syncPWAControls();}});});
    reg.update().catch(()=>{});
  }
  async function tryFullscreen(){
    if(window.matchMedia&&window.matchMedia('(display-mode: fullscreen)').matches)return true;
    if(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)return true;
    if(window.navigator.standalone)return true;
    const el=document.documentElement;try{if(!document.fullscreenElement&&el.requestFullscreen){await el.requestFullscreen({navigationUI:'hide'});return true;}if(el.webkitRequestFullscreen){el.webkitRequestFullscreen();return true;}}catch(_){ }return false;
  }
  function setupPWA(){
    bindPWABar();syncPWAControls();
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;installAvailable=true;syncPWAControls();});
    window.addEventListener('appinstalled',()=>{deferredInstall=null;installAvailable=false;syncPWAControls();});
    if('serviceWorker' in navigator&&location.protocol!=='file:'){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadingForSW)return;reloadingForSW=true;location.reload();});
      navigator.serviceWorker.register('sw.js').then(watchRegistration).catch(()=>{});
    }
  }
  function refreshPWAControls(){bindPWABar();syncPWAControls();}
  function boot(){const s=EmiliaStore.get();setupPWA();if(s.profile.name)go('home');else go('onboarding');}
  window.EmiliaApp={go,startMission,startPractice,startFlashPractice,startRescuePractice,startGapPractice,startWritingPractice,startSentencePractice,startMagicTracePractice,startSecretWordPractice,resumeSession,continueSession,exitMission,saveAndExitUser,previousActivity,bindActivity,bindSpeechSpeed,toast,playStory,completeStory,openStory,exportProgress,importProgress,learningAudio,rewardBurst,tryFullscreen,refreshPWAControls};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
