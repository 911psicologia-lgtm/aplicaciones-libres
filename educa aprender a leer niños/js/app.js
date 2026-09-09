(function(){
  let session=null,toastTimer=null,storyContext={listened:false};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
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
  function resumeSession(){tryFullscreen();const saved=EmiliaStore.get().activeSession;if(!saved){go('home');return;}session=saved;EmiliaScreens.activity(session);}
  function exitMission(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();go('home');}
  function saveAndExitUser(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();EmiliaStore.logoutToPicker();session=null;go('onboarding');setTimeout(()=>EmiliaVoice.speak('Sesión guardada. Toca tu nombre cuando quieras continuar.',{kind:'instruction',repeat:false}),120);}
  function previousActivity(){if(!session)return go('home');if(session.index<=0){exitMission();return;}session.index--;session.replayIndex=session.index;persistSession();EmiliaScreens.activity(session);}
  function isReplay(){return !!session&&session.replayIndex===session.index;}
  function rewardBurst(kind='star'){
    const layer=document.getElementById('rewardLayer')||document.body,wrap=document.createElement('div'),ui=EMILIA_CONTENT.ui||{};
    const src=kind==='chest'?ui.chest:kind==='seed'?ui.seed:kind==='medal'?ui.medal:ui.star;
    wrap.className='reward-pop';
    wrap.innerHTML=`${src?`<img class="reward-image" src="${src}" alt="">`:`<div class="reward-symbol">★</div>`}${Array.from({length:18},(_,i)=>`<i style="--i:${i};--a:${(i*137)%360}deg"></i>`).join('')}`;
    layer.appendChild(wrap);setTimeout(()=>wrap.remove(),760);
  }
  function registerSuccess(independent){
    if(!session||!independent)return;
    session.streak=(session.streak||0)+1;session.bestStreak=Math.max(session.bestStreak||0,session.streak);
    if(session.streak%3===0){session.bonusStars=(session.bonusStars||0)+1;rewardBurst('chest');EmiliaVoice.tone('ok');EmiliaStore.event('mini_streak',{missionId:session.missionId,streak:session.streak});}
    persistSession();
  }
  function registerMiss(){if(session){session.streak=0;persistSession();}}
  function feedback(ok,text){const f=document.getElementById('feedback');if(!f)return;if(ok){f.innerHTML='<div class="feedback-visual">✓</div>';EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('cheer',680);rewardBurst('star');return;}EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('thinking',760);f.innerHTML=`<div class="feedback-box coach"><span>↻</span>${text?`<span class="adult-readable">${text}</span>`:''}</div>`;}
  function nextAfter(ms){setTimeout(()=>{if(!session)return;session.replayIndex=null;if(EmiliaEngine.shouldEnd(session)){session.endedAdaptively=true;const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);return;}session.index++;persistSession();if(session.index>=session.activities.length){const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);}else EmiliaScreens.activity(session);},ms);}
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

  function spokenInstruction(q){
    if(q.voicePrompt)return q.voicePrompt;
    if(q.type==='picturePick')return q.targetLetter?`Busca una palabra que empiece con ${String(q.targetLetter).toUpperCase()}.`:`Toca la nota de un dibujo para escuchar su nombre.`;
    if(q.type==='imageWordPick')return q.voicePrompt||`Mira el dibujo. Busca la palabra ${q.word||q.answer}.`;
    if(q.type==='memoryMatch')return q.voicePrompt||'Une cada dibujo con su palabra.';
    if(q.type==='sentenceBuild')return q.voicePrompt||`Escucha: ${q.say}. Pon las palabras en orden.`;
    if(q.type==='symbolPick'){
      if(/_symbol$/.test(q.skill||''))return `Busca la ${String(q.answer||'').toUpperCase()}.`;
      if(Array.isArray(q.options)&&q.options.every(x=>String(x).length===1)&&String(q.say||'').length>1)return `Escucha: ${q.say}. Toca la primera letra.`;
      return `Escucha: ${q.say}. Toca la sílaba que escuchaste.`;
    }
    if(q.type==='listenPick'){const heard=String(q.say||'').toLocaleLowerCase('es');if(isShortToken(heard))return heard.length===1?`Escucha ${heard.toUpperCase()}. Tócala.`:`Escucha ${heard}. Toca esa sílaba.`;return `Escucha ${heard}. Toca lo que escuchaste.`;}
    if(q.type==='build')return `Escucha ${q.word||q.say}. Forma la palabra.`;
    if(q.type==='missingPart')return `Escucha ${q.word||q.say}. Completa la palabra.`;
    if(q.type==='gapFill')return q.voicePrompt||`Completa el espacio. Escucha cada opción y elige la que falta.`;
    if(q.type==='soundBubbles')return `Escucha ${q.say}. Atrapa la sílaba que escuchaste.`;
    if(q.type==='syllableTrail'){const list=joinAudioList(q.items,q.sayPrefix||'');if(q.sayPrefix)return `Toca las gemas. Escucha una por una: ${list}.`;const family=(q.items&&q.items[0])?String(q.items[0]).charAt(0).toUpperCase():'';return family?`Toca las gemas de la ${family}: ${list}.`:`Toca las gemas. Escucha una por una: ${list}.`;}
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

  function answerButtons(selector,q,s,speakQ){
    document.querySelectorAll(selector).forEach(btn=>btn.onclick=async()=>{
      if(btn.disabled)return;const all=[...document.querySelectorAll(selector)];all.forEach(x=>x.disabled=true);
      const val=btn.dataset.answer,prior=attemptsFor(q),replay=isReplay();
      const canSpeak=/[a-záéíóúñ]/i.test(String(val||''))&&q.speakSelection!==false;
      if(canSpeak){
        const kind=/^[a-záéíóúñ]$/i.test(String(val))?'phoneme':(String(val).length<=3&&!/\s/.test(String(val))?'syllable':'word');
        await learningAudio(val,{kind,repeat:false,button:null,listeningText:'👂',readyText:'●'});
      }
      const ok=val===q.answer;markAttempt(q);
      if(ok){
        btn.classList.add('ok');EmiliaVoice.tone('ok');feedback(true);
        if(!replay){EmiliaMastery.record(q.skill,true,prior>0,{review:q.review});s.hits++;if(prior===0){s.independentHits++;registerSuccess(true);}else registerMiss();}
        nextAfter(260);
      }else{
        btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}
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

  function bindActivity(q,s){
    const speakBtn=document.getElementById('speakQ');
    const selector=q.type==='picturePick'?'.picture-option':q.type==='imageWordPick'?'.word-option':q.type==='build'?'.syllable-chip':q.type==='sentenceBuild'?'.sentence-chip':q.type==='gapFill'?'.gap-choice':q.type==='memoryMatch'?'.memory-card':q.type==='soundBubbles'?'.sound-bubble':(q.type==='listenPick'||q.type==='symbolPick'||q.type==='missingPart')?'.option':'';
    const speakQ=()=>playInstruction(q,{button:speakBtn,lockSelector:selector});if(speakBtn)speakBtn.onclick=speakQ;
    if(q.type==='picturePick'){
      document.querySelectorAll('.picture-audio').forEach(btn=>btn.onclick=async e=>{
        e.preventDefault();e.stopPropagation();
        const word=btn.dataset.word||'';if(!word)return;
        document.querySelectorAll('.picture-option').forEach(x=>x.disabled=true);
        await learningAudio(word,{button:btn,kind:'word',repeat:false,listeningText:'👂',readyText:'●'});
        document.querySelectorAll('.picture-option').forEach(x=>x.disabled=false);
      });
    }

    if(q.type==='listenPick'||q.type==='symbolPick'||q.type==='picturePick'||q.type==='imageWordPick'||q.type==='missingPart'||q.type==='soundBubbles'){
      speakQ();answerButtons(q.type==='picturePick'?'.picture-option':q.type==='imageWordPick'?'.word-option':q.type==='soundBubbles'?'.sound-bubble':'.option',q,s,speakQ);
    }
    if(q.type==='patternIntro'){
      const heard=new Set(),next=document.getElementById('patternNext');
      const explain=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.pattern-example'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=explain;explain();
      document.querySelectorAll('.pattern-example').forEach((btn,i)=>btn.onclick=async()=>{if(btn.disabled)return;const word=btn.dataset.say||btn.textContent.trim();await learningAudio(word,{button:btn,kind:'word',repeat:false,lockSelector:'.pattern-example',listeningText:'👂',readyText:'●'});btn.classList.add('heard');heard.add(i);EmiliaStore.event('pattern_exposure',{skill:q.skill,pattern:q.pattern,value:word});if(heard.size>=Math.min(2,document.querySelectorAll('.pattern-example').length)){next.disabled=false;rewardBurst('star');}});
      if(next)next.onclick=()=>nextAfter(100);
    }
    if(q.type==='build'){
      speakQ();let built=[],buildAttempts=0;const replay=isReplay();
      const render=()=>{const t=document.getElementById('buildTarget');if(!t)return;t.innerHTML=built.length?built.map(x=>`<span class="built-chip lowercase-word-part">${EmiliaScreens.esc(String(x).toLocaleLowerCase('es'))}</span>`).join(''):'<span class="build-placeholder">✦</span>';};
      document.querySelectorAll('.syllable-chip').forEach(btn=>btn.onclick=async()=>{if(btn.classList.contains('used')||btn.disabled)return;built.push(btn.dataset.part);btn.classList.add('used');render();await learningAudio(btn.dataset.part,{kind:'syllable',repeat:false,lockSelector:'.syllable-chip',button:null,listeningText:'👂',readyText:'●'});if(built.length===q.answerParts.length){const ok=built.join('|')===q.answerParts.join('|');if(ok){EmiliaVoice.tone('ok');feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,buildAttempts>0,{review:q.review});s.hits++;if(buildAttempts===0){s.independentHits++;registerSuccess(true);}else registerMiss();}setTimeout(()=>showWordTrace(q,()=>nextAfter(120)),240);}else{feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}buildAttempts++;setTimeout(()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();speakQ();},360);}}});
      const clear=document.getElementById('clearBuild');if(clear)clear.onclick=()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();};
    }
    if(q.type==='sentenceBuild'){
      speakQ();let built=[],tries=0;const replay=isReplay();
      const render=()=>{const t=document.getElementById('sentenceTarget');if(!t)return;t.innerHTML=built.length?built.map(x=>`<span>${EmiliaScreens.esc(String(x).toLocaleLowerCase('es'))}</span>`).join(''):'<i>● ● ●</i>';};
      document.querySelectorAll('.sentence-chip').forEach(btn=>btn.onclick=async()=>{if(btn.classList.contains('used')||btn.disabled)return;built.push(btn.dataset.word);btn.classList.add('used');render();await learningAudio(btn.dataset.word,{kind:'word',repeat:false,lockSelector:'.sentence-chip',button:null,listeningText:'👂',readyText:'●'});if(built.length===q.answerParts.length){const ok=built.join('|')===q.answerParts.join('|');if(ok){feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,tries>0,{review:q.review});s.hits++;if(tries===0){s.independentHits++;registerSuccess(true);}else registerMiss();}nextAfter(360);}else{feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}tries++;setTimeout(()=>{built=[];document.querySelectorAll('.sentence-chip').forEach(x=>x.classList.remove('used'));render();speakQ();},420);}}});
      const clear=document.getElementById('clearSentence');if(clear)clear.onclick=()=>{built=[];document.querySelectorAll('.sentence-chip').forEach(x=>x.classList.remove('used'));render();};
    }
    if(q.type==='gapFill'){
      speakQ();const slot=document.getElementById('gapSlot'),reset=document.getElementById('gapReset');let locked=false,tries=0;const replay=isReplay();
      const clear=()=>{if(locked)return;if(slot){slot.textContent='?';slot.classList.remove('filled','ok','bad');}document.querySelectorAll('.gap-choice').forEach(x=>{x.classList.remove('used','bad','ok');x.disabled=false;});};
      const choose=async btn=>{if(locked||btn.disabled)return;locked=true;document.querySelectorAll('.gap-choice').forEach(x=>x.disabled=true);const val=btn.dataset.answer||'';if(slot){slot.textContent=String(val).toLocaleLowerCase('es');slot.classList.add('filled');}btn.classList.add('used');const kind=/^[a-záéíóúñ]$/i.test(String(val))?'phoneme':(String(val).length<=3&&!/\s/.test(String(val))?'syllable':'word');await learningAudio(val,{kind,repeat:false,button:null,listeningText:'👂',readyText:'●'});const ok=val===q.answer;if(ok){slot&&slot.classList.add('ok');btn.classList.add('ok');EmiliaVoice.tone('ok');feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,tries>0,{review:q.review});s.hits++;if(tries===0){s.independentHits++;registerSuccess(true);}else registerMiss();}setTimeout(()=>nextAfter(160),320);}else{slot&&slot.classList.add('bad');btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false);registerMiss();if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}tries++;setTimeout(()=>{locked=false;clear();speakQ();},480);}};
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
      speakQ();let first=null,matched=0,mistakes=0,done=false;const replay=isReplay(),cards=[...document.querySelectorAll('.memory-card')];
      cards.forEach(btn=>btn.onclick=async()=>{if(done||btn.disabled||btn.classList.contains('matched'))return;if(first===btn)return;btn.classList.add('open');if(btn.dataset.match)await learningAudio(btn.dataset.match,{kind:'word',repeat:false,button:null,listeningText:'👂',readyText:'●'});if(!first){first=btn;return;}const a=first,b=btn;cards.forEach(x=>x.disabled=true);if(a.dataset.match===b.dataset.match&&a.dataset.kind!==b.dataset.kind){a.classList.add('matched');b.classList.add('matched');matched+=2;EmiliaVoice.tone('ok');rewardBurst('star');first=null;cards.forEach(x=>{if(!x.classList.contains('matched'))x.disabled=false;});if(matched===cards.length){done=true;feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,mistakes>0,{review:q.review});s.hits++;if(mistakes===0){s.independentHits++;registerSuccess(true);}else{s.errors++;registerMiss();}}nextAfter(420);}}else{mistakes++;EmiliaVoice.tone('bad');registerMiss();setTimeout(()=>{a.classList.remove('open');b.classList.remove('open');first=null;cards.forEach(x=>{if(!x.classList.contains('matched'))x.disabled=false;});},520);}});
    }
    if(q.type==='syllableTrail'){
      const touched=new Set(),next=document.getElementById('trailNext'),speakTrail=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.trail-gem'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=speakTrail;speakTrail();
      document.querySelectorAll('.trail-gem').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;const v=btn.dataset.sound;btn.classList.add('lit');await learningAudio((q.sayPrefix||'')+v,{kind:'syllable',repeat:false,lockSelector:'.trail-gem',button:null,listeningText:'👂',readyText:'●'});touched.add(v);EmiliaStore.event('exposure',{skill:q.skill,value:v});if(touched.size===q.items.length){next.disabled=false;rewardBurst('star');EmiliaVoice.tone('ok');}});next.onclick=()=>nextAfter(100);
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

  async function playStory(st){
    storyContext={listened:true,storyId:st.id};const btn=document.getElementById('storyListen'),tryBtn=document.getElementById('storyIRead');if(btn){btn.disabled=true;btn.textContent='👂 Escuchando…';}if(tryBtn)tryBtn.disabled=true;const status=document.getElementById('storyListenStatus');
    if(st.kind==='audioFocus'){
      if(status)status.textContent='Escucha el cuento y mira las vocales.';
      const parts=st.sentences||[st.text];
      document.querySelectorAll('.story-focus-token').forEach(x=>x.classList.remove('active'));
      for(let i=0;i<parts.length;i++){await EmiliaVoice.speak(parts[i],{kind:'sentence',repeat:false});await wait(320);}
      if(status)status.textContent='Ahora puedes tocar cada vocal para escucharla.';
    }else{
      const spans=[...document.querySelectorAll('.story-word')];spans.forEach(x=>x.classList.remove('active'));
      if(status)status.textContent='Lumi lee despacio, palabra por palabra.';
      for(let i=0;i<st.words.length;i++){
        spans.forEach(x=>x.classList.remove('active'));if(spans[i])spans[i].classList.add('active');
        const clean=String(st.words[i]).replace(/[.,!?¡¿]/g,'');await EmiliaVoice.speak(clean,{kind:'word',repeat:false});await wait(210);
      }
      spans.forEach(x=>x.classList.remove('active'));if(status)status.textContent='Ahora escucha la frase completa.';await wait(360);await EmiliaVoice.speak(st.text,{kind:'sentence',repeat:false});
    }
    if(btn){btn.disabled=false;btn.textContent='♪ Escuchar otra vez';}if(tryBtn)tryBtn.disabled=false;EmiliaStore.event('story_model',{storyId:st.id});
  }
  function askComprehension(st){
    const box=document.getElementById('bookFeedback');storyContext.storyId=st.id;box.innerHTML=`<div class="feedback-box coach comp-box"><button class="listen-orb tiny" id="compListen" aria-label="Escuchar pregunta">♪</button><strong>${st.comprehension.prompt}</strong><div class="activity-actions">${st.comprehension.options.map(o=>`<button class="btn btn-secondary comp-opt" data-a="${EmiliaScreens.esc(o)}">${EmiliaScreens.esc(o)}</button>`).join('')}</div></div>`;
    const sayPrompt=()=>EmiliaVoice.speak(st.comprehension.prompt,{kind:'instruction',repeat:false});const lb=document.getElementById('compListen');if(lb)lb.onclick=sayPrompt;sayPrompt();
    document.querySelectorAll('.comp-opt').forEach(b=>b.onclick=async()=>{document.querySelectorAll('.comp-opt').forEach(x=>x.disabled=true);await EmiliaVoice.speak(b.dataset.a,{kind:/^[a-záéíóúñ]$/i.test(String(b.dataset.a))?'phoneme':'word',repeat:false});if(b.dataset.a===st.comprehension.answer){EmiliaVoice.tone('ok');box.innerHTML='<div class="feedback-visual">✓</div>';EmiliaApp.rewardBurst('star');EmiliaMastery.record(st.comprehensionSkill||'comprehension_1',true,storyContext.listened,{story:st.id});EmiliaStore.event('story_complete',{storyId:st.id,listenedFirst:storyContext.listened});const ss=EmiliaStore.get(),count=new Set((ss.history||[]).filter(e=>e.type==='story_complete').map(e=>e.storyId)).size;if(count>=3&&!(ss.achievements||[]).includes('stories_3')){ss.achievements.push('stories_3');EmiliaStore.save();rewardBurst('medal');}}else{EmiliaVoice.tone('bad');EmiliaMastery.record(st.comprehensionSkill||'comprehension_1',false,storyContext.listened,{story:st.id});EmiliaApp.toast('Escucha otra vez y vuelve a intentar.');setTimeout(()=>askComprehension(st),420);}});
  }
  function openStory(id){storyContext={listened:false,storyId:id};EmiliaScreens.book(id);}
  function exportProgress(){const blob=new Blob([EmiliaStore.exportJSON()],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='emilia_bosque_v7_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Copia exportada.');}
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
  window.EmiliaApp={go,startMission,startPractice,resumeSession,exitMission,saveAndExitUser,previousActivity,bindActivity,toast,playStory,askComprehension,openStory,exportProgress,importProgress,learningAudio,rewardBurst,tryFullscreen,refreshPWAControls};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
