(function(){
  let session=null,toastTimer=null,storyContext={listened:false};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('on'),2200);}
  function go(screen){
    EmiliaVoice.stop&&EmiliaVoice.stop();
    const map={onboarding:EmiliaScreens.onboarding,home:EmiliaScreens.home,book:EmiliaScreens.book,practice:EmiliaScreens.practice,gate:EmiliaScreens.gate,adult:EmiliaScreens.adult};
    (map[screen]||EmiliaScreens.home)();
  }
  function startMission(id){const m=EmiliaEngine.missionById(id);if(!EmiliaEngine.isUnlocked(m)){toast('Ese lugar todavía está dormido.');return;}session=EmiliaEngine.buildSession(m);EmiliaScreens.activity(session);}
  function startPractice(){session=EmiliaEngine.buildPracticeSession();EmiliaScreens.activity(session);}
  function exitMission(){EmiliaVoice.stop&&EmiliaVoice.stop();if(confirm('¿Volvemos al bosque? Podrás continuar practicando después.')){session=null;go('home');}}
  function feedback(ok,text){const f=document.getElementById('feedback');if(!f)return;f.innerHTML=`<div class="feedback-box ${ok?'ok':'coach'}"><span>${ok?'✓':'↻'}</span><span>${text}</span></div>`;}
  function nextAfter(ms){setTimeout(()=>{if(!session)return;if(EmiliaEngine.shouldEnd(session)){session.endedAdaptively=true;const res=EmiliaEngine.finish(session);session=null;EmiliaScreens.result(res);return;}session.index++;if(session.index>=session.activities.length){const res=EmiliaEngine.finish(session);session=null;EmiliaScreens.result(res);}else EmiliaScreens.activity(session);},ms);}
  function attemptsFor(q){return session.attempts[q.id]||0;}
  function markAttempt(q){session.attempts[q.id]=(session.attempts[q.id]||0)+1;return session.attempts[q.id];}

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
      if(btn.disabled)return;
      document.querySelectorAll(selector).forEach(x=>x.disabled=true);
      const val=btn.dataset.answer,ok=val===q.answer,prior=attemptsFor(q);markAttempt(q);
      if(ok){
        btn.classList.add('ok');EmiliaVoice.tone('ok');feedback(true,prior?'¡Eso es! La pista te ayudó a encontrarlo.':'¡Sí! Lo descubriste.');
        EmiliaMastery.record(q.skill,true,prior>0,{review:q.review});s.hits++;if(prior===0)s.independentHits++;nextAfter(1000);
      }else{
        btn.classList.add('bad');EmiliaVoice.tone('bad');feedback(false,q.coach||'Escucha otra vez.');EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;
        const count=attemptsFor(q);
        setTimeout(async()=>{
          const all=[...document.querySelectorAll(selector)];all.forEach(x=>{x.classList.remove('bad');x.disabled=false;});
          if(count>=2){all.forEach(x=>{if(x.dataset.answer===q.answer)x.classList.add('reveal');else x.disabled=true;});feedback(false,'Te muestro la pista. Primero escucha y después toca la opción iluminada.');}
          await speakQ();
        },1050);
      }
    });
  }

  function bindActivity(q,s){
    const speakBtn=document.getElementById('speakQ');
    const selector=q.type==='picturePick'?'.picture-option':q.type==='build'?'.syllable-chip':(q.type==='listenPick'||q.type==='symbolPick')?'.option':'';
    const rawSay=String(q.say||'').toLowerCase().trim();const shortPhoneme=rawSay.length===1||/^([a-záéíóúñ])\1{2,}$/i.test(rawSay);const kind=q.audioKind||(q.type==='build'||q.type==='wordReveal'?'word':shortPhoneme?'phoneme':rawSay.length<=3?'syllable':'word');
    const speakQ=()=>learningAudio(q.say,{button:speakBtn,lockSelector:selector,kind,repeat:(q.type==='listenPick'||q.type==='symbolPick'||q.type==='picturePick')?undefined:false,pauseMs:680});
    if(speakBtn)speakBtn.onclick=speakQ;

    if(q.type==='listenPick'||q.type==='symbolPick'){speakQ();answerButtons('.option',q,s,speakQ);}
    if(q.type==='picturePick'){speakQ();answerButtons('.picture-option',q,s,speakQ);}
    if(q.type==='build'){
      speakQ();let built=[],buildAttempts=0;
      const render=()=>{const t=document.getElementById('buildTarget');if(!t)return;t.innerHTML=built.length?built.map(x=>`<span class="built-chip">${EmiliaScreens.esc(x).toUpperCase()}</span>`).join(''):'<span class="muted">Aquí aparecerá la palabra</span>';};
      document.querySelectorAll('.syllable-chip').forEach(btn=>btn.onclick=async()=>{
        if(btn.classList.contains('used')||btn.disabled)return;
        built.push(btn.dataset.part);btn.classList.add('used');render();
        await learningAudio(btn.dataset.part,{kind:'syllable',repeat:false,lockSelector:'.syllable-chip',button:null,listeningText:'👂 Escucha esta parte…',readyText:'Elige la siguiente parte'});
        if(built.length===q.answerParts.length){
          const ok=built.join('|')===q.answerParts.join('|');
          if(ok){EmiliaVoice.tone('ok');feedback(true,'¡La palabra apareció! '+q.word.toUpperCase());EmiliaMastery.record(q.skill,true,buildAttempts>0,{review:q.review});s.hits++;if(buildAttempts===0)s.independentHits++;nextAfter(1150);}
          else{feedback(false,q.coach);EmiliaMastery.record(q.skill,false,false,{review:q.review});s.errors++;buildAttempts++;setTimeout(()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();speakQ();},1300);}
        }
      });
      const clear=document.getElementById('clearBuild');if(clear)clear.onclick=()=>{built=[];document.querySelectorAll('.syllable-chip').forEach(x=>x.classList.remove('used'));render();};
    }
    if(q.type==='syllableTrail'){
      const touched=new Set(),next=document.getElementById('trailNext');
      document.querySelectorAll('.trail-stone').forEach(btn=>btn.onclick=async()=>{
        if(btn.disabled)return;
        const v=btn.dataset.sound;btn.classList.add('lit');
        await learningAudio((q.sayPrefix||'')+v,{kind:'syllable',repeat:false,lockSelector:'.trail-stone',button:null,listeningText:'👂 Escucha '+v.toUpperCase()+'…',readyText:'Toca otra piedra'});
        touched.add(v);EmiliaStore.event('exposure',{skill:q.skill,value:v});if(touched.size===q.items.length){next.disabled=false;feedback(true,'¡Las escuchaste todas! Ahora puedes seguir.');const st=document.getElementById('listenStatus');if(st)st.textContent='Sendero completo';}
      });
      next.onclick=()=>nextAfter(160);
    }
    if(q.type==='trace'){
      const canvas=document.getElementById('traceCanvas'),again=document.getElementById('traceAgain');learningAudio(q.say,{kind:'phoneme',repeat:2,pauseMs:680,lockSelector:'#traceNext'});
      let tracer=null;if(canvas)tracer=EmiliaTracing.start(canvas,q.letter,coverage=>{EmiliaStore.event('trace_complete',{skill:q.skill,letter:q.letter,coverage:Math.round(coverage*100)});EmiliaVoice.tone('ok');feedback(true,'¡Tu dedo encontró el camino de la '+q.letter.toUpperCase()+'!');document.getElementById('traceNext').disabled=false;});
      if(again)again.onclick=()=>tracer&&tracer.reset();const tn=document.getElementById('traceNext');if(tn)tn.onclick=()=>nextAfter(120);
    }
    if(q.type==='wordReveal'){
      const tried=document.getElementById('readTried'),model=document.getElementById('speakQ');
      if(model)model.onclick=async()=>{await learningAudio(q.say,{button:model,kind:'word',repeat:false,listeningText:'👂 Escucha la palabra completa…',readyText:'Ahora inténtala tú'});EmiliaStore.event('model_listen',{skill:q.skill,word:q.word});};
      if(tried)tried.onclick=()=>{EmiliaStore.event('reading_practice',{skill:q.skill,word:q.word,selfReported:true});feedback(true,'Bien. Practicar leerla es distinto de escuchar el modelo; por eso no la califico automáticamente.');nextAfter(1200);};
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
    document.querySelectorAll('.comp-opt').forEach(b=>b.onclick=()=>{if(b.dataset.a===st.comprehension.answer){EmiliaVoice.tone('ok');box.innerHTML='<div class="feedback-box ok">✓ ¡Sí! Entendiste lo que decía la frase.</div>';EmiliaMastery.record('comprehension_1',true,storyContext.listened,{story:st.id});EmiliaStore.event('story_complete',{storyId:st.id,listenedFirst:storyContext.listened});}else{EmiliaVoice.tone('bad');EmiliaMastery.record('comprehension_1',false,storyContext.listened,{story:st.id});toast('Mira la frase otra vez y vuelve a intentar.');}});
  }
  function openStory(id){storyContext={listened:false,storyId:id};EmiliaScreens.book(id);}
  function exportProgress(){const blob=new Blob([EmiliaStore.exportJSON()],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='emilia_bosque_v3_audio_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Copia exportada.');}
  function importProgress(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{EmiliaStore.importJSON(r.result);toast('Progreso restaurado.');setTimeout(()=>go('adult'),400);}catch(e){toast('No pude importar ese archivo.');}};r.readAsText(file);}
  function boot(){const s=EmiliaStore.get();if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});if(s.profile.name)go('home');else go('onboarding');}
  window.EmiliaApp={go,startMission,startPractice,exitMission,bindActivity,toast,playStory,askComprehension,openStory,exportProgress,importProgress,learningAudio};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
