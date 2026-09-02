(function(){
  let session=null,toastTimer=null,storyContext={listened:false};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),1800);}
  function go(screen){
    EmiliaVoice.stop&&EmiliaVoice.stop();
    const map={onboarding:EmiliaScreens.onboarding,home:EmiliaScreens.home,book:EmiliaScreens.book,practice:EmiliaScreens.practice,gate:EmiliaScreens.gate,adult:EmiliaScreens.adult};
    (map[screen]||EmiliaScreens.home)();
  }
  function persistSession(){if(session)EmiliaStore.saveActiveSession(session);}
  function startMission(id){const m=EmiliaEngine.missionById(id);if(!EmiliaEngine.isUnlocked(m)){toast('Ese lugar todavía está dormido.');return;}session=EmiliaEngine.buildSession(m);persistSession();EmiliaScreens.activity(session);}
  function startPractice(){session=EmiliaEngine.buildPracticeSession();persistSession();EmiliaScreens.activity(session);}
  function resumeSession(){const saved=EmiliaStore.get().activeSession;if(!saved){go('home');return;}session=saved;EmiliaScreens.activity(session);}
  function exitMission(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();go('home');}
  function saveAndExitUser(){EmiliaVoice.stop&&EmiliaVoice.stop();persistSession();EmiliaStore.logoutToPicker();session=null;go('onboarding');setTimeout(()=>EmiliaVoice.speak('Sesión guardada. Toca tu nombre cuando quieras continuar.',{kind:'instruction',repeat:false}),120);}
  function previousActivity(){if(!session)return go('home');if(session.index<=0){exitMission();return;}session.index--;session.replayIndex=session.index;persistSession();EmiliaScreens.activity(session);}
  function isReplay(){return !!session&&session.replayIndex===session.index;}
  function rewardBurst(symbol='★'){
    const layer=document.getElementById('rewardLayer')||document.body,wrap=document.createElement('div');wrap.className='reward-pop';wrap.innerHTML=`<div class="reward-symbol">${symbol}</div>${Array.from({length:18},(_,i)=>`<i style="--i:${i};--a:${(i*137)%360}deg"></i>`).join('')}`;layer.appendChild(wrap);setTimeout(()=>wrap.remove(),760);
  }
  function feedback(ok,text){const f=document.getElementById('feedback');if(!f)return;if(ok){f.innerHTML='<div class="feedback-visual">✓</div>';EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('cheer',680);rewardBurst(Math.random()>.45?'★':'✦');return;}EmiliaScreens.flashMascot&&EmiliaScreens.flashMascot('thinking',760);f.innerHTML=`<div class="feedback-box coach"><span>↻</span>${text?`<span class="adult-readable">${text}</span>`:''}</div>`;}
  function nextAfter(ms){setTimeout(()=>{if(!session)return;session.replayIndex=null;if(EmiliaEngine.shouldEnd(session)){session.endedAdaptively=true;const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);return;}session.index++;persistSession();if(session.index>=session.activities.length){const res=EmiliaEngine.finish(session);session=null;EmiliaStore.clearActiveSession();EmiliaScreens.result(res);}else EmiliaScreens.activity(session);},ms);}
  function attemptsFor(q){return session.attempts[q.id]||0;}
  function markAttempt(q){session.attempts[q.id]=(session.attempts[q.id]||0)+1;persistSession();return session.attempts[q.id];}

  function spokenInstruction(q){
    if(q.voicePrompt)return q.voicePrompt;
    if(q.type==='picturePick')return q.targetLetter?`Busca una palabra que empiece con ${String(q.targetLetter).toUpperCase()}.`:`Toca la nota de un dibujo para escuchar su nombre.`;
    if(q.type==='symbolPick'){
      if(/_symbol$/.test(q.skill||''))return `Busca la ${String(q.answer||'').toUpperCase()}.`;
      if(Array.isArray(q.options)&&q.options.every(x=>String(x).length===1)&&String(q.say||'').length>1)return `Escucha: ${q.say}. Toca la primera letra.`;
      return `Escucha: ${q.say}. Toca la sílaba que escuchaste.`;
    }
    if(q.type==='listenPick')return `Escucha: ${q.say}. Toca lo que escuchaste.`;
    if(q.type==='build')return `Escucha: ${q.word||q.say}. Forma la palabra.`;
    if(q.type==='missingPart')return `Escucha: ${q.word||q.say}. Completa la palabra.`;
    if(q.type==='soundBubbles')return `Escucha: ${q.say}. Atrapa la sílaba que escuchaste.`;
    if(q.type==='syllableTrail')return 'Toca las piedras. Escucha una por una.';
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
    document.querySelectorAll(selector).forEach(btn=>btn.onclick=()=>{
      if(btn.disabled)return;document.querySelectorAll(selector).forEach(x=>x.disabled=true);
      const val=btn.dataset.answer,ok=val===q.answer,prior=attemptsFor(q);markAttempt(q);const replay=isReplay();
      if(ok){
        btn.classList.add('ok');EmiliaVoice.tone('ok');feedback(true);
        if(!replay){EmiliaMastery.record(q.skill,true,prior>0,{review:q.review});s.hits++;if(prior===0)s.independentHits++;}
        nextAfter(280);
      }else{
        btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false);if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}
        const count=attemptsFor(q);setTimeout(async()=>{const all=[...document.querySelectorAll(selector)];all.forEach(x=>{x.classList.remove('bad');x.disabled=false;});if(count>=2){all.forEach(x=>{if(x.dataset.answer===q.answer)x.classList.add('reveal');else x.disabled=true;});await EmiliaVoice.speak('Mira la pista.',{kind:'instruction',repeat:false});}await speakQ();},300);
      }
    });
  }

  function showWordTrace(q,done){
    const card=document.querySelector('.activity-card');if(!card||!q.word){done();return;}
    const lower=String(q.word).toLocaleLowerCase('es'),art=(EMILIA_CONTENT.wordArt||{})[lower]||'',listen=(EMILIA_CONTENT.ui||{}).listen||'';
    card.innerHTML=`<div class="word-trace-stage"><div class="word-trace-heading"><div class="activity-icon"><img src="${EMILIA_CONTENT.mascot.src}" alt=""></div>${art?`<img class="word-reward-art" src="${art}" alt="">`:''}</div><div class="word-visual small lowercase-word">${EmiliaScreens.esc(lower)}</div><button class="listen-orb small attention" id="wordTraceAudio" aria-label="Escuchar instrucción">${listen?`<img class="ui-listen-icon" src="${listen}" alt="">`:'<span>♪</span>'}</button><div class="word-trace-shell"><canvas id="wordTraceCanvas" class="trace-canvas" aria-label="Escribir ${EmiliaScreens.esc(lower)} con el dedo"></canvas></div><div id="feedback"></div><div class="simple-trace-actions"><button class="trace-reset" id="wordTraceAgain" aria-label="Borrar y volver a intentar">↺</button><button class="btn btn-primary trace-main-action" id="wordTraceAction" disabled>✓ Completar</button></div></div>`;
    const say=()=>learningAudio(`Escribe ${lower} con tu dedo. Puedes levantar el dedo entre letras.`,{button:document.getElementById('wordTraceAudio'),kind:'instruction',repeat:false,listeningText:'👂',readyText:'✍'});document.getElementById('wordTraceAudio').onclick=say;say();
    const c=document.getElementById('wordTraceCanvas'),action=document.getElementById('wordTraceAction'),again=document.getElementById('wordTraceAgain');let completed=false,logged=false,tr=null;
    const complete=(cov,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('word_trace_complete',{word:q.word,skill:q.skill,coverage:Math.round((cov||0)*100),manual:!!meta.manual});}EmiliaVoice.tone('ok');feedback(true,'');action.disabled=false;action.textContent='➜';action.setAttribute('aria-label','Siguiente');action.classList.add('is-next');action.parentElement&&action.parentElement.classList.add('next-ready');again.disabled=true;again.style.display='none';setTimeout(()=>EmiliaVoice.speak('Muy bien. Toca la flecha para seguir.',{kind:'instruction',repeat:false}),150);};
    const progress=pr=>{if(!completed&&action)action.disabled=!pr.canComplete;};
    tr=EmiliaTracing.startWord(c,q.word,complete,progress);
    again.onclick=()=>{if(completed)return;completed=false;logged=false;action.textContent='✓ Completar';action.setAttribute('aria-label','Completar');action.classList.remove('is-next');action.parentElement&&action.parentElement.classList.remove('next-ready');action.disabled=true;again.style.display='';tr.reset();};
    action.onclick=()=>{if(completed){done();return;}tr.forceComplete();};
  }

  function bindActivity(q,s){
    const speakBtn=document.getElementById('speakQ');
    const selector=q.type==='picturePick'?'.picture-option':q.type==='build'?'.syllable-chip':q.type==='soundBubbles'?'.sound-bubble':(q.type==='listenPick'||q.type==='symbolPick'||q.type==='missingPart')?'.option':'';
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

    if(q.type==='listenPick'||q.type==='symbolPick'||q.type==='picturePick'||q.type==='missingPart'||q.type==='soundBubbles'){
      speakQ();answerButtons(q.type==='picturePick'?'.picture-option':q.type==='soundBubbles'?'.sound-bubble':'.option',q,s,speakQ);
    }
    if(q.type==='build'){
      speakQ();let built=[],buildAttempts=0;const replay=isReplay();
      const render=()=>{const t=document.getElementById('buildTarget');if(!t)return;t.innerHTML=built.length?built.map(x=>`<span class="built-chip lowercase-word-part">${EmiliaScreens.esc(String(x).toLocaleLowerCase('es'))}</span>`).join(''):'<span class="build-placeholder">✦</span>';};
      document.querySelectorAll('.syllable-chip').forEach(btn=>btn.onclick=async()=>{if(btn.classList.contains('used')||btn.disabled)return;built.push(btn.dataset.part);btn.classList.add('used');render();await learningAudio(btn.dataset.part,{kind:'syllable',repeat:false,lockSelector:'.syllable-chip',button:null,listeningText:'👂',readyText:'●'});if(built.length===q.answerParts.length){const ok=built.join('|')===q.answerParts.join('|');if(ok){EmiliaVoice.tone('ok');feedback(true);if(!replay){EmiliaMastery.record(q.skill,true,buildAttempts>0,{review:q.review});s.hits++;if(buildAttempts===0)s.independentHits++;}setTimeout(()=>showWordTrace(q,()=>nextAfter(120)),240);}else{feedback(false);if(!replay){EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;}buildAttempts++;setTimeout(()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();speakQ();},360);}}});
      const clear=document.getElementById('clearBuild');if(clear)clear.onclick=()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();};
    }
    if(q.type==='syllableTrail'){
      const touched=new Set(),next=document.getElementById('trailNext'),speakTrail=()=>playInstruction(q,{button:document.getElementById('speakQ'),lockSelector:'.trail-stone'});const sb=document.getElementById('speakQ');if(sb)sb.onclick=speakTrail;speakTrail();
      document.querySelectorAll('.trail-stone').forEach(btn=>btn.onclick=async()=>{if(btn.disabled)return;const v=btn.dataset.sound;btn.classList.add('lit');await learningAudio((q.sayPrefix||'')+v,{kind:'syllable',repeat:false,lockSelector:'.trail-stone',button:null,listeningText:'👂',readyText:'●'});touched.add(v);EmiliaStore.event('exposure',{skill:q.skill,value:v});if(touched.size===q.items.length){next.disabled=false;rewardBurst('✦');EmiliaVoice.tone('ok');}});next.onclick=()=>nextAfter(100);
    }
    if(q.type==='trace'){
      const canvas=document.getElementById('traceCanvas'),again=document.getElementById('traceAgain'),action=document.getElementById('traceAction'),audio=document.getElementById('speakQ'),say=()=>playInstruction(q,{button:audio,lockSelector:'#traceAction'});if(audio)audio.onclick=say;say();let tracer=null,completed=false,logged=false;
      const complete=(coverage,meta={})=>{if(completed)return;completed=true;if(!logged){logged=true;EmiliaStore.event('trace_complete',{skill:q.skill,letter:q.letter,coverage:Math.round((coverage||0)*100),manual:!!meta.manual,segments:meta.segments||[]});}EmiliaVoice.tone('ok');feedback(true);action.disabled=false;action.textContent='➜';action.setAttribute('aria-label','Siguiente');action.classList.add('is-next');action.parentElement&&action.parentElement.classList.add('next-ready');again.disabled=true;again.style.display='none';setTimeout(()=>EmiliaVoice.speak('Muy bien. Toca la flecha para seguir.',{kind:'instruction',repeat:false}),150);};
      const progress=pr=>{if(!completed&&action)action.disabled=!pr.canComplete;};
      if(canvas)tracer=EmiliaTracing.start(canvas,q.letter,complete,progress);
      if(again)again.onclick=()=>{if(completed)return;completed=false;logged=false;action.textContent='✓ Completar';action.setAttribute('aria-label','Completar');action.classList.remove('is-next');action.parentElement&&action.parentElement.classList.remove('next-ready');action.disabled=true;again.style.display='';tracer&&tracer.reset();};
      if(action)action.onclick=()=>{if(completed)nextAfter(90);else tracer&&tracer.forceComplete();};
    }
    if(q.type==='wordReveal'){
      const tried=document.getElementById('readTried'),model=document.getElementById('speakQ'),say=()=>learningAudio(q.say,{button:model,kind:'word',repeat:false,listeningText:'👂',readyText:'●'});if(model)model.onclick=say;if(tried)tried.onclick=()=>{EmiliaStore.event('reading_practice',{skill:q.skill,word:q.word,selfReported:true});rewardBurst('★');nextAfter(260);};
    }
  }

  async function playStory(st){
    storyContext={listened:true,storyId:st.id};const spans=[...document.querySelectorAll('.story-word')],btn=document.getElementById('storyListen'),tryBtn=document.getElementById('storyIRead');spans.forEach(x=>x.classList.remove('active'));if(btn){btn.disabled=true;btn.textContent='👂 Escuchando…';}if(tryBtn)tryBtn.disabled=true;
    const status=document.getElementById('storyListenStatus');if(status)status.textContent='Lumi lee despacio, palabra por palabra.';
    for(let i=0;i<st.words.length;i++){
      spans.forEach(x=>x.classList.remove('active'));if(spans[i])spans[i].classList.add('active');
      const clean=String(st.words[i]).replace(/[.,!?¡¿]/g,'');await EmiliaVoice.speak(clean,{kind:'word',repeat:false});await wait(210);
    }
    spans.forEach(x=>x.classList.remove('active'));if(status)status.textContent='Ahora escucha la frase completa.';await wait(380);await EmiliaVoice.speak(st.text,{kind:'sentence',repeat:false});
    if(btn){btn.disabled=false;btn.textContent='♪ Escuchar otra vez';}if(tryBtn)tryBtn.disabled=false;if(status)status.textContent='Puedes volver a escucharla cuando quieras.';EmiliaStore.event('story_model',{storyId:st.id});
  }
  function askComprehension(st){
    const box=document.getElementById('bookFeedback');storyContext.storyId=st.id;box.innerHTML=`<div class="feedback-box coach comp-box"><strong>${st.comprehension.prompt}</strong><div class="activity-actions">${st.comprehension.options.map(o=>`<button class="btn btn-secondary comp-opt" data-a="${EmiliaScreens.esc(o)}">${EmiliaScreens.esc(o)}</button>`).join('')}</div></div>`;
    document.querySelectorAll('.comp-opt').forEach(b=>b.onclick=()=>{if(b.dataset.a===st.comprehension.answer){EmiliaVoice.tone('ok');box.innerHTML='<div class="feedback-visual">✓</div>';EmiliaApp.rewardBurst('★');EmiliaMastery.record('comprehension_1',true,storyContext.listened,{story:st.id});EmiliaStore.event('story_complete',{storyId:st.id,listenedFirst:storyContext.listened});}else{EmiliaVoice.tone('bad');EmiliaMastery.record('comprehension_1',false,storyContext.listened,{story:st.id});toast('Mira la frase otra vez y vuelve a intentar.');}});
  }
  function openStory(id){storyContext={listened:false,storyId:id};EmiliaScreens.book(id);}
  function exportProgress(){const blob=new Blob([EmiliaStore.exportJSON()],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='emilia_bosque_v4_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Copia exportada.');}
  function importProgress(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{EmiliaStore.importJSON(r.result);toast('Progreso restaurado.');setTimeout(()=>go('adult'),400);}catch(e){toast('No pude importar ese archivo.');}};r.readAsText(file);}
  let deferredInstall=null,swRegistration=null,reloadingForSW=false;
  function setPWAButton(id,show){const b=document.getElementById(id);if(b)b.hidden=!show;const bar=document.getElementById('pwaBar');if(bar){const any=[...bar.querySelectorAll('button')].some(x=>!x.hidden);bar.hidden=!any;}}
  function bindPWABar(){
    const install=document.getElementById('pwaInstallBtn'),update=document.getElementById('pwaUpdateBtn');
    if(install&&!install.dataset.bound){install.dataset.bound='1';install.onclick=async()=>{if(!deferredInstall){toast('Abre la app desde un navegador compatible para instalarla.');return;}deferredInstall.prompt();try{await deferredInstall.userChoice;}catch(_){ }deferredInstall=null;setPWAButton('pwaInstallBtn',false);};}
    if(update&&!update.dataset.bound){update.dataset.bound='1';update.onclick=async()=>{if(!swRegistration){toast('La actualización funciona cuando la app está instalada o publicada.');return;}if(swRegistration.waiting){update.disabled=true;update.textContent='Actualizando…';swRegistration.waiting.postMessage({type:'SKIP_WAITING'});return;}update.disabled=true;update.textContent='Buscando…';try{await swRegistration.update();setTimeout(()=>{if(swRegistration.waiting){update.textContent='Actualizar app';update.disabled=false;setPWAButton('pwaUpdateBtn',true);}else{update.textContent='Actualizar app';update.disabled=false;toast('Ya tienes la versión más reciente.');}},700);}catch(_){update.textContent='Actualizar app';update.disabled=false;toast('No pude buscar actualización.');}};}
  }
  function watchRegistration(reg){
    swRegistration=reg;bindPWABar();setPWAButton('pwaUpdateBtn',true);
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)setPWAButton('pwaUpdateBtn',true);});});
    reg.update().catch(()=>{});
  }
  function setupPWA(){
    bindPWABar();
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;setPWAButton('pwaInstallBtn',true);});
    window.addEventListener('appinstalled',()=>{deferredInstall=null;setPWAButton('pwaInstallBtn',false);toast('App instalada.');});
    if('serviceWorker' in navigator&&location.protocol!=='file:'){
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloadingForSW)return;reloadingForSW=true;location.reload();});
      navigator.serviceWorker.register('sw.js').then(watchRegistration).catch(()=>{});
    }
  }
  function boot(){const s=EmiliaStore.get();setupPWA();if(s.profile.name)go('home');else go('onboarding');}
  window.EmiliaApp={go,startMission,startPractice,resumeSession,exitMission,saveAndExitUser,previousActivity,bindActivity,toast,playStory,askComprehension,openStory,exportProgress,importProgress,learningAudio,rewardBurst};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
