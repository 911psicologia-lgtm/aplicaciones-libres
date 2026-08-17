(()=> {
  'use strict';
  const APP_VERSION='0.4.8';
  const $=id=>document.getElementById(id),$$=sel=>Array.from(document.querySelectorAll(sel));
  const Storage=window.EasySpeakStorage,Speech=window.EasySpeakSpeech,Scoring=window.EasySpeakScoring,Engine=window.EasySpeakEngine,Pron=window.EasySpeakPronunciation,Spanish=window.EasySpeakSpanish;
  const S={
    profile:null,stats:null,queue:[],conversationIndex:0,turnIndex:0,session:null,listening:false,manualMode:false,
    listenAttempts:0,lastResult:null,wakeLock:null,installPrompt:null,registration:null,waitingWorker:null,refreshing:false,
    activeSheet:null,reinfMode:false,ended:false,audioReady:false,audioDenied:false,turnSerial:0,playbackSerial:0,
    turnAttempts:[],turnCommitted:false,autoTimer:null,promptOverrides:new Map(),lastVoiceUrl:null,reinfTab:'conversation',
    pronActive:false,pronListening:false,pronQueue:[],pronIndex:0,pronAttempts:[],pronCommitted:false,pronTimer:null,pronReturn:'home',pronVoiceUrl:null,pronPoints:0
  };
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const avg=(arr,key)=>arr.length?Math.round(arr.reduce((n,x)=>n+(Number(x[key])||0),0)/arr.length):0;
  const multiplier=streak=>streak>=16?5:streak>=10?4:streak>=6?3:streak>=3?2:1;
  const isFlow=()=>S.profile?.mode==='handsfree';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent||'');
  const VOICE_RATES=[0.5,0.8,1,1.2,1.5];
  const normalizeVoiceRate=value=>VOICE_RATES.reduce((best,x)=>Math.abs(x-Number(value||1))<Math.abs(best-Number(value||1))?x:best,1);
  const voiceRateLabel=value=>`${Number(value).toFixed(1).replace(/\.0$/,'')}×`;
  function setVoiceRate(value,announce=false){S.profile.voiceRate=normalizeVoiceRate(value);Storage.saveProfile(S.profile);const val=String(S.profile.voiceRate);if($('voiceRateSelect'))$('voiceRateSelect').value=val;if($('practiceVoiceRateSelect'))$('practiceVoiceRateSelect').value=val;if($('pronVoiceRateSelect'))$('pronVoiceRateSelect').value=val;if($('voiceRateLabel'))$('voiceRateLabel').textContent=voiceRateLabel(S.profile.voiceRate);if(announce)toast(`Voice speed ${voiceRateLabel(S.profile.voiceRate)}`)}

  const LANGUAGE_MODES=['off','visible','tap'];
  const normalizeLanguageMode=v=>LANGUAGE_MODES.includes(v)?v:'off';
  const languageLabel=v=>v==='visible'?'EN+ES':v==='tap'?'EN·ES':'EN';
  const languageMessage=v=>v==='visible'?'Spanish support visible':v==='tap'?'Tap a phrase to reveal Spanish':'English only';
  function setLanguageSupport(value,announce=false){
    S.profile.languageSupport=normalizeLanguageMode(value);Storage.saveProfile(S.profile);applyLanguageControl();
    if(document.getElementById('practice')?.classList.contains('active')&&currentTurn()){renderPromptTranslation();renderIdeas(!isFlow()||!$('answerIdeas').classList.contains('hidden'))}
    if(S.pronActive)renderPronTranslation();
    if(announce)toast(languageMessage(S.profile.languageSupport));
  }
  function applyLanguageControl(){
    const mode=normalizeLanguageMode(S.profile?.languageSupport);['languageModeBtn','pronLanguageModeBtn'].forEach(id=>{const btn=$(id);if(btn){btn.textContent=languageLabel(mode);btn.classList.toggle('active',mode!=='off');btn.setAttribute('aria-label',`Language support: ${languageMessage(mode)}`)}});if($('languageSupportSelect'))$('languageSupportSelect').value=mode;
  }
  function cycleLanguageSupport(){const mode=normalizeLanguageMode(S.profile.languageSupport),idx=LANGUAGE_MODES.indexOf(mode);setLanguageSupport(LANGUAGE_MODES[(idx+1)%LANGUAGE_MODES.length],true)}
  function currentSpanish(){const t=currentTurn();return t?Spanish?.get?.(t,S.profile):null}
  function renderPromptTranslation(){
    const el=$('promptTranslation'),card=$('promptCard');if(!el||!currentTurn())return;const mode=normalizeLanguageMode(S.profile.languageSupport),text=Spanish?.prompt?.(currentTurn(),S.profile,displayPrompt())||'';el.textContent=text;el.classList.toggle('hidden',mode!=='visible'||!text);el.classList.remove('revealed');card?.classList.toggle('translation-tap',mode==='tap'&&!!text);
  }
  function revealPromptTranslation(){if(normalizeLanguageMode(S.profile.languageSupport)!=='tap'||!currentTurn())return;const el=$('promptTranslation'),text=Spanish?.prompt?.(currentTurn(),S.profile,displayPrompt())||'';if(!text)return;el.textContent=text;el.classList.toggle('hidden');el.classList.toggle('revealed',!el.classList.contains('hidden'))}
  function renderPronTranslation(){
    const el=$('pronunciationTranslation'),item=currentPronunciation?.();if(!el||!item)return;const mode=normalizeLanguageMode(S.profile.languageSupport),text=item.translation||Spanish?.translateFragment?.(item.text,item.sourceTurnId,item.sourceOptionIndex||0,S.profile)||'';el.textContent=text;el.classList.toggle('hidden',mode!=='visible'||!text);el.classList.remove('revealed');$('pronunciationText')?.classList.toggle('translation-tap-target',mode==='tap'&&!!text);
  }
  function revealPronTranslation(){if(normalizeLanguageMode(S.profile.languageSupport)!=='tap')return;const el=$('pronunciationTranslation'),item=currentPronunciation?.();if(!el||!item)return;const text=item.translation||Spanish?.translateFragment?.(item.text,item.sourceTurnId,item.sourceOptionIndex||0,S.profile)||'';if(!text)return;el.textContent=text;el.classList.toggle('hidden');el.classList.toggle('revealed',!el.classList.contains('hidden'))}

  function showScreen(id){$$('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'instant'})}
  function toast(msg,ms=2200){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.add('hidden'),ms)}
  function openSheet(id){closeSheet();S.activeSheet=id;$('sheetBackdrop').classList.remove('hidden');$(id).classList.remove('hidden')}
  function closeSheet(){$('sheetBackdrop').classList.add('hidden');$$('.bottom-sheet').forEach(x=>x.classList.add('hidden'));S.activeSheet=null}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
  function cancelAutoAction(){if(S.autoTimer){clearTimeout(S.autoTimer);S.autoTimer=null}}
  function scheduleAuto(fn,ms){cancelAutoAction();const serial=S.turnSerial;S.autoTimer=setTimeout(()=>{S.autoTimer=null;if(!S.ended&&serial===S.turnSerial)fn()},ms)}
  function revokeVoice(){if(S.lastVoiceUrl){try{URL.revokeObjectURL(S.lastVoiceUrl)}catch{}S.lastVoiceUrl=null}$('myVoiceBtn')?.classList.add('hidden')}
  function setVoice(url){if(S.lastVoiceUrl&&S.lastVoiceUrl!==url)try{URL.revokeObjectURL(S.lastVoiceUrl)}catch{}S.lastVoiceUrl=url||null;$('myVoiceBtn').classList.toggle('hidden',!S.lastVoiceUrl)}
  function revokePronVoice(){if(S.pronVoiceUrl){try{URL.revokeObjectURL(S.pronVoiceUrl)}catch{}S.pronVoiceUrl=null}$('pronMyVoiceBtn')?.classList.add('hidden')}
  function setPronVoice(url){if(S.pronVoiceUrl&&S.pronVoiceUrl!==url)try{URL.revokeObjectURL(S.pronVoiceUrl)}catch{}S.pronVoiceUrl=url||null;$('pronMyVoiceBtn')?.classList.toggle('hidden',!S.pronVoiceUrl)}
  function cancelPronTimer(){if(S.pronTimer){clearTimeout(S.pronTimer);S.pronTimer=null}}
  function schedulePron(fn,ms){cancelPronTimer();S.pronTimer=setTimeout(()=>{S.pronTimer=null;if(S.pronActive)fn()},ms)}

  async function boot(){
    S.profile=Storage.profile();S.stats=Storage.stats();bind();applyProfile();renderHome();await setupSpeechPrivacy();setupPWA();
    setTimeout(()=>{showScreen('home');requestAnimationFrame(updateRouteHints);if(!S.profile.tourSeen)setTimeout(()=>openSheet('tourSheet'),320)},850);
  }
  function bind(){
    $('brandBtn').onclick=()=>{closeSheet();showScreen('home');renderHome()};
    $('settingsBtn').onclick=()=>{applyProfile();setupSpeechPrivacy();openSheet('settingsSheet')};
    $('cefrInfoBtn').onclick=()=>openSheet('cefrSheet');$('scoreStat').onclick=()=>{renderProgress();openSheet('progressSheet')};
    $('reinforcementCard').onclick=()=>{renderReinforcements();openSheet('reinforcementSheet')};
    $('reinforcementTabs').onclick=e=>{const b=e.target.closest('[data-reinf-tab]');if(!b)return;S.reinfTab=b.dataset.reinfTab;renderReinforcements()};
    $$('.sheet-close').forEach(b=>b.onclick=closeSheet);$('sheetBackdrop').onclick=closeSheet;
    $('durationChips').onclick=e=>{const b=e.target.closest('[data-duration]');if(!b)return;S.profile.duration=Number(b.dataset.duration);Storage.saveProfile(S.profile);applyProfile()};
    $('levelRail').onclick=e=>{const b=e.target.closest('[data-level]');if(!b)return;S.profile.level=b.dataset.level;Storage.saveProfile(S.profile);applyProfile()};
    $('levelRail').addEventListener('scroll',updateRouteHints,{passive:true});$('levelNextHint').onclick=()=>scrollRoute(1);$('levelPrevHint').onclick=()=>scrollRoute(-1);window.addEventListener('resize',updateRouteHints);
    $('modeSwitch').onclick=e=>{const b=e.target.closest('[data-mode]');if(!b)return;S.profile.mode=b.dataset.mode;Storage.saveProfile(S.profile);applyProfile()};
    const saveText=(id,key)=>$(id).oninput=e=>{S.profile[key]=e.target.value.trim();Storage.saveProfile(S.profile)};
    saveText('nameInput','name');saveText('cityInput','city');saveText('countryInput','country');saveText('roleInput','role');
    $('voiceRateSelect').onchange=e=>setVoiceRate(e.target.value,true);$('practiceVoiceRateSelect').onchange=e=>setVoiceRate(e.target.value,true);$('pronVoiceRateSelect').onchange=e=>setVoiceRate(e.target.value,true);$('languageSupportSelect').onchange=e=>setLanguageSupport(e.target.value,true);$('languageModeBtn').onclick=cycleLanguageSupport;$('pronLanguageModeBtn').onclick=cycleLanguageSupport;$('promptText').onclick=revealPromptTranslation;$('promptTranslation').onclick=revealPromptTranslation;$('pronunciationText').onclick=revealPronTranslation;$('pronunciationTranslation').onclick=revealPronTranslation;
    $('transcriptToggle').onchange=e=>{S.profile.showTranscript=e.target.checked;Storage.saveProfile(S.profile)};
    $('autoReinforceToggle').onchange=e=>{S.profile.autoReinforce=e.target.checked;Storage.saveProfile(S.profile)};
    $('pronunciationAutoSaveToggle').onchange=e=>{S.profile.pronunciationAutoSave=e.target.checked;Storage.saveProfile(S.profile)};
    $('weeklyGoalInput').onchange=e=>{S.profile.weeklyGoal=clamp(Number(e.target.value)||3,1,7);Storage.saveProfile(S.profile);applyProfile()};
    $('localSpeechToggle').onchange=handleLocalSpeechToggle;$('installLocalSpeechBtn').onclick=prepareLocalSpeech;
    $('backupBtn').onclick=backupProgress;$('restoreBtn').onclick=()=>$('restoreFileInput').click();$('restoreFileInput').onchange=restoreProgress;
    $('resetBtn').onclick=()=>{if(confirm('Delete all Easy Speak progress and settings stored on this device?')){Storage.reset();S.profile=Storage.profile();S.stats=Storage.stats();applyProfile();renderHome();closeSheet();toast('Local Easy Speak data deleted')}};
    $('exportCsvBtn').onclick=exportCsv;$('printProgressBtn').onclick=printProgress;
    $('startBtn').onclick=()=>startPracticeFromGesture(false);$('startReinforcementBtn').onclick=()=>{if(S.reinfTab==='pronunciation'){startPronunciationFromGesture(null,'home');return}closeSheet();startPracticeFromGesture(true)};
    $('clearReinforcementsBtn').onclick=()=>{if(S.reinfTab==='pronunciation'){Storage.clearPronunciation();toast('Pronunciation boosts cleared')}else{Storage.clearReinforcements();toast('Conversation reinforcements cleared')}S.stats=Storage.stats();renderReinforcements();renderHome()};
    $('exitPracticeBtn').onclick=exitPractice;$('repeatPromptBtn').onclick=repeatPrompt;
    $('micRetryBtn').onclick=()=>retryMicAccess(false);$('pronMicRetryBtn').onclick=()=>retryMicAccess(true);
    $('micBtn').onclick=()=>{cancelAutoAction();if(!S.listening)beginListening(true);else Speech.stopListening()};
    $('manualDoneBtn').onclick=enableManualChoice;$('toggleIdeasBtn').onclick=()=>{renderIdeas(true);$('toggleIdeasBtn').classList.add('hidden')};
    $('hearModelBtn').onclick=()=>hearCoachingModel(1);$('slowModelBtn').onclick=()=>hearCoachingModel(.67);$('myVoiceBtn').onclick=playMyVoice;
    $('retryBtn').onclick=()=>{cancelAutoAction();beginListening(true)};$('skipTurnBtn').onclick=()=>{cancelAutoAction();commitTurnAndAdvance()};
    $('summaryCloseBtn').onclick=finishToHome;$('homeBtn').onclick=finishToHome;$('practiceAgainBtn').onclick=()=>startPractice(S.reinfMode);$('saveReinforcementsBtn').onclick=savePendingReinforcements;
    $('startPronunciationSummary').onclick=()=>startPronunciationFromGesture(S.session?.pronunciationItemIds||[],'summary');
    $('exitPronunciationBtn').onclick=exitPronunciation;$('pronModelBtn').onclick=()=>pronPlayModel(1,true);$('pronSlowBtn').onclick=()=>pronPlayModel(.65,true);$('pronShadowBtn').onclick=pronShadow;
    $('pronMicBtn').onclick=()=>{cancelPronTimer();if(!S.pronActive)return;if(S.pronListening){Speech.stopListening();return}beginPronListening(true)};$('pronRepeatBtn').onclick=()=>{cancelPronTimer();beginPronListening(true)};$('pronSkipBtn').onclick=pronSkip;$('pronMyVoiceBtn').onclick=playPronVoice;
    $('tourSkipBtn').onclick=finishTour;$('tourDoneBtn').onclick=finishTour;
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();S.installPrompt=e;refreshInstallState()});
    window.addEventListener('appinstalled',()=>{S.installPrompt=null;refreshInstallState();toast('Easy Speak installed')});
    $('installIcon').onclick=openInstallSheet;$('installBtn').onclick=openInstallSheet;$('updateIcon').onclick=openUpdateSheet;$('pwaPrimaryBtn').onclick=handlePwaPrimary;
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAutoAction();cancelPronTimer();Speech.pause()}});window.addEventListener('pagehide',()=>{revokeVoice();revokePronVoice();Speech.shutdown()});
  }
  function finishTour(){S.profile.tourSeen=true;Storage.saveProfile(S.profile);closeSheet()}
  function applyProfile(){
    $$('[data-duration]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.duration)===Number(S.profile.duration)));
    $$('[data-level]').forEach(b=>b.classList.toggle('selected',b.dataset.level===S.profile.level));$$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===S.profile.mode));
    $('nameInput').value=S.profile.name||'';$('cityInput').value=S.profile.city||'';$('countryInput').value=S.profile.country||'';$('roleInput').value=S.profile.role||'';
    S.profile.voiceRate=normalizeVoiceRate(S.profile.voiceRate);const rate=String(S.profile.voiceRate);$('voiceRateSelect').value=rate;$('practiceVoiceRateSelect').value=rate;$('pronVoiceRateSelect').value=rate;$('voiceRateLabel').textContent=voiceRateLabel(S.profile.voiceRate);
    $('transcriptToggle').checked=S.profile.showTranscript!==false;$('autoReinforceToggle').checked=S.profile.autoReinforce!==false;$('pronunciationAutoSaveToggle').checked=S.profile.pronunciationAutoSave!==false;
    $('weeklyGoalInput').value=S.profile.weeklyGoal||3;$('localSpeechToggle').checked=!!S.profile.preferLocalSpeech;S.profile.languageSupport=normalizeLanguageMode(S.profile.languageSupport);applyLanguageControl();$('appVersionLabel').textContent='v'+APP_VERSION;requestAnimationFrame(updateRouteHints);
  }
  function renderHome(){
    S.stats=Storage.stats();const score=S.stats.scoreCount?Math.round(S.stats.scoreSum/S.stats.scoreCount):null;
    $('homeScore').textContent=score??'—';$('homePoints').textContent=Number(S.stats.points||0).toLocaleString();$('homeStreak').textContent='x'+(S.stats.bestMultiplier||1);
    const conv=Storage.activeReinforcements().length,pron=Storage.activePronunciation().length,n=conv+pron;$('reinforcementCount').textContent=n;$('reinforcementSubtext').textContent=conv&&pron?`${conv} conversation · ${pron} pronunciation`:pron?`${pron} pronunciation boost${pron===1?'':'s'}`:`${conv} conversation reinforcement${conv===1?'':'s'}`;$('reinforcementCard').classList.toggle('hidden',!n);
  }
  function updateRouteHints(){
    const rail=$('levelRail');if(!rail)return;const desktop=window.matchMedia('(min-width:720px)').matches;if(desktop){$('levelPrevHint').classList.add('hidden');$('levelNextHint').classList.add('hidden');$('levelSwipeHint').classList.add('hidden');return}
    const max=Math.max(0,rail.scrollWidth-rail.clientWidth),left=rail.scrollLeft,atStart=left<8,atEnd=max-left<8;$('levelPrevHint').classList.toggle('hidden',atStart);$('levelNextHint').classList.toggle('hidden',atEnd);$('levelSwipeHint').classList.toggle('hidden',atEnd||left>24);
  }
  function scrollRoute(dir){const rail=$('levelRail');if(!rail)return;rail.scrollBy({left:dir*Math.max(130,Math.round(rail.clientWidth*.72)),behavior:'smooth'});setTimeout(updateRouteHints,380)}
  function startPracticeFromGesture(reinforcement=false){Speech.unlockFromGesture?.();startPractice(reinforcement)}

  async function setupSpeechPrivacy(){
    const caps=Speech.supported();$('localSpeechRow').classList.toggle('hidden',!caps.localRecognition);$('localSpeechToggle').checked=!!S.profile.preferLocalSpeech;
    if(!caps.recognition){$('speechPrivacyText').textContent=caps.recordOnlyPossible?'Automatic speech recognition is unavailable in this browser mode. Easy Speak can still capture your voice for guided self-check.':'Speech recognition and microphone capture are not available in this browser mode; manual speaking fallback will be used.';return}
    if(!caps.localRecognition){$('speechPrivacyText').textContent='Progress is local. Speech-to-text may be processed by your browser’s recognition service.';return}
    const info=await Speech.localAvailability();
    const status=String(info.status||'unknown');$('localSpeechStatus').textContent=status==='available'?'On-device English is ready':status==='downloadable'?'On-device English can be prepared':status==='downloading'?'Language pack is downloading':'Availability depends on this browser';
    $('installLocalSpeechBtn').classList.toggle('hidden',status!=='downloadable');
    $('speechPrivacyText').textContent=S.profile.preferLocalSpeech&&status==='available'?'On-device recognition selected. Progress and speech recognition stay on this device for supported sessions.':'Progress is local. If on-device recognition is not selected or available, speech-to-text may use your browser’s recognition service.';
  }
  async function handleLocalSpeechToggle(e){
    if(!e.target.checked){S.profile.preferLocalSpeech=false;Storage.saveProfile(S.profile);Speech.configure({preferLocal:false});setupSpeechPrivacy();return}
    const info=await Speech.localAvailability();
    if(info.status==='available'){S.profile.preferLocalSpeech=true;Storage.saveProfile(S.profile);Speech.configure({preferLocal:true});toast('On-device recognition preferred');setupSpeechPrivacy();return}
    e.target.checked=false;S.profile.preferLocalSpeech=false;Storage.saveProfile(S.profile);toast(info.status==='downloadable'?'Prepare the on-device English model first.':'On-device recognition is not ready in this browser.',2800);setupSpeechPrivacy();
  }
  async function prepareLocalSpeech(){
    $('installLocalSpeechBtn').disabled=true;$('installLocalSpeechBtn').textContent='Preparing…';const res=await Speech.installLocal();$('installLocalSpeechBtn').disabled=false;$('installLocalSpeechBtn').textContent='Prepare on-device English recognition';
    if(res.ok){S.profile.preferLocalSpeech=true;Storage.saveProfile(S.profile);$('localSpeechToggle').checked=true;Speech.configure({preferLocal:true});toast('On-device English recognition is ready');await setupSpeechPrivacy()}else toast('This browser could not prepare on-device recognition.',3000);
  }
  async function configureSpeechForSession(){
    let local=false;
    if(S.profile.preferLocalSpeech){const info=await Speech.localAvailability();local=info.status==='available'}
    Speech.configure({preferLocal:local});return local;
  }

  function backupProgress(){const data=Storage.exportBundle();downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`easy-speak-backup-${new Date().toISOString().slice(0,10)}.json`);toast('Backup created')}
  async function restoreProgress(e){
    const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>2_000_000){toast('Backup file is too large');return}
    try{const bundle=JSON.parse(await file.text());if(!confirm('Restore this Easy Speak backup? Current local progress will be replaced.'))return;const restored=Storage.restoreBundle(bundle);S.profile=restored.profile;S.stats=restored.stats;applyProfile();renderHome();await setupSpeechPrivacy();closeSheet();toast('Backup restored')}
    catch{toast('This is not a valid Easy Speak backup',3000)}
  }
  function renderProgress(){
    const s=Storage.stats(),sessions=s.recentSessions||[],score=s.scoreCount?Math.round(s.scoreSum/s.scoreCount):null,recent=sessions.slice(0,8);
    $('progressScore').textContent=score??'—';$('progressTotalMinutes').textContent=`${s.minutes||0} min`;
    const weekly=Storage.weeklyCount(),goal=S.profile.weeklyGoal||3;$('weeklyGoalText').textContent=`${weekly} of ${goal} sessions`;$('weeklyGoalBar').style.width=Math.min(100,weekly/goal*100)+'%';
    $('trendBars').innerHTML=recent.length?[...recent].reverse().map(x=>`<div class="trend-item" title="${esc(x.level)} · ${x.score}"><i style="height:${Math.max(12,x.score||0)}%"></i><small>${esc(x.level||'')}</small></div>`).join(''):'<p class="empty-note">Complete a session to start your trend.</p>';
    const comm=avg(recent,'communication'),flu=avg(recent,'fluency'),clar=avg(recent,'clarity');
    [['progressComm',comm],['progressFluency',flu],['progressClarity',clar]].forEach(([id,v])=>{$(id).textContent=v||'—';$(id+'Bar').style.width=(v||0)+'%'});
    $('progressSessionCount').textContent=`${sessions.length} stored`;
    $('recentSessionsList').innerHTML=sessions.length?sessions.slice(0,12).map(x=>{const d=new Date(x.date);return `<div class="session-row"><span><b>${esc(x.level||'Mixed')} · ${x.mode==='handsfree'?'Flow':'Learn'}</b><small>${d.toLocaleDateString()} · ${x.minutes||0} min · ${x.turns||0} turns</small></span><strong>${x.score??'—'}</strong></div>`}).join(''):'<p class="empty-note">No sessions yet. Your first practice will appear here.</p>';
  }
  function exportCsv(){
    const rows=[['date','level','mode','training_score','communication','fluency','recognition','voice','points','turns','minutes','repaired_turns','improvement']];
    for(const x of Storage.stats().recentSessions||[])rows.push([x.date,x.level,x.mode,x.score,x.communication,x.fluency,x.clarity,x.voice,x.points,x.turns,x.minutes,x.repairedTurns,x.totalImprovement]);
    const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');downloadBlob(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),'easy-speak-progress.csv');toast('CSV exported')
  }
  function printProgress(){
    const s=Storage.stats(),sessions=s.recentSessions||[],score=s.scoreCount?Math.round(s.scoreSum/s.scoreCount):'—';const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print progress');return}
    const rows=sessions.slice(0,12).map(x=>`<tr><td>${esc(new Date(x.date).toLocaleDateString())}</td><td>${esc(x.level)}</td><td>${x.mode==='handsfree'?'Flow':'Learn'}</td><td>${x.score??'—'}</td><td>${x.minutes||0}</td></tr>`).join('');
    w.document.write(`<!doctype html><title>Easy Speak Progress</title><style>body{font:15px system-ui;padding:32px;color:#111}h1{margin-bottom:4px}small{color:#666}table{border-collapse:collapse;width:100%;margin-top:24px}td,th{border-bottom:1px solid #ddd;padding:9px;text-align:left}.hero{display:flex;gap:30px;margin:24px 0}.hero b{font-size:28px}</style><h1>Easy Speak — Progress</h1><small>Local training record · generated ${new Date().toLocaleString()}</small><div class="hero"><div><b>${score}</b><br>Training score</div><div><b>${s.minutes||0}</b><br>Minutes</div><div><b>${s.turns||0}</b><br>Turns</div></div><table><thead><tr><th>Date</th><th>Level</th><th>Mode</th><th>Score</th><th>Minutes</th></tr></thead><tbody>${rows}</tbody></table><p><small>Training estimates are not official CEFR, EnglishScore or British Council results.</small></p>`);w.document.close();setTimeout(()=>w.print(),250)
  }

  function refreshInstallState(){const show=!isStandalone()&&(!!S.installPrompt||isIOS());$('installIcon').classList.toggle('hidden',!show);$('installBtn').classList.toggle('hidden',!show)}
  async function setupPWA(){
    refreshInstallState();if(!('serviceWorker'in navigator))return;
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js');S.registration=reg;if(reg.waiting)markUpdate(reg.waiting);
      reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)markUpdate(reg.waiting||worker)})});
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(S.refreshing)return;S.refreshing=true;location.reload()});
      reg.update().catch(()=>{});
    }catch{}
  }
  function markUpdate(worker){S.waitingWorker=worker;$('updateIcon').classList.remove('hidden')}
  function openInstallSheet(){
    $('pwaSheetTitle').textContent='Install Easy Speak';$('pwaPrimaryBtn').classList.add('hidden');
    if(isStandalone()){$('pwaSheetBody').innerHTML='<p>Easy Speak is already running as an installed app.</p>'}
    else if(S.installPrompt){$('pwaSheetBody').innerHTML='<p>Installation is optional. It adds Easy Speak to your device like an app and keeps the same local progress.</p><small>No account or cloud synchronization is created.</small>';$('pwaPrimaryBtn').textContent='Install Easy Speak';$('pwaPrimaryBtn').dataset.action='install';$('pwaPrimaryBtn').classList.remove('hidden')}
    else if(isIOS()){$('pwaSheetBody').innerHTML='<p>On iPhone or iPad, use the browser Share menu and choose <b>Add to Home Screen</b>.</p><small>Easy Speak will remain optional and your progress stays in this browser/app storage.</small>'}
    else{$('pwaSheetBody').innerHTML='<p>Your browser is not offering app installation right now. You can keep using Easy Speak normally in the browser.</p>'}
    openSheet('pwaSheet');
  }
  function openUpdateSheet(){
    $('pwaSheetTitle').textContent='New version ready';$('pwaSheetBody').innerHTML=`<p>A newer Easy Speak version has finished downloading and is ready to activate.</p><small>Your local progress is preserved. Update only when you choose.</small>`;$('pwaPrimaryBtn').textContent='Update now';$('pwaPrimaryBtn').dataset.action='update';$('pwaPrimaryBtn').classList.remove('hidden');openSheet('pwaSheet')
  }
  async function handlePwaPrimary(){
    const action=$('pwaPrimaryBtn').dataset.action;
    if(action==='install'&&S.installPrompt){S.installPrompt.prompt();await S.installPrompt.userChoice;S.installPrompt=null;refreshInstallState();closeSheet()}
    if(action==='update'&&S.waitingWorker){S.refreshing=false;S.waitingWorker.postMessage({type:'SKIP_WAITING'});$('pwaPrimaryBtn').disabled=true;$('pwaPrimaryBtn').textContent='Updating…'}
  }

  function renderReinforcements(){
    const convAll=Storage.stats().reinforcements||[],convActive=convAll.filter(x=>!x.mastered),pronAll=Storage.stats().pronunciationItems||[],pronActive=pronAll.filter(x=>!x.mastered);
    $('conversationReinfCount').textContent=convActive.length;$('pronunciationReinfCount').textContent=pronActive.length;
    $$('#reinforcementTabs [data-reinf-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.reinfTab===S.reinfTab));
    const box=$('reinforcementList'),showSpanish=normalizeLanguageMode(S.profile.languageSupport)==='visible';
    if(S.reinfTab==='pronunciation'){
      $('startReinforcementBtn').textContent=pronActive.length?`Pronunciation boost · ~${Math.max(1,Math.ceil(Math.min(8,pronActive.length)*.35))} min`:'No pronunciation boosts';$('startReinforcementBtn').disabled=!pronActive.length;$('clearReinforcementsBtn').textContent='Clear pronunciation boosts';
      if(!pronAll.length){box.innerHTML='<div class="reinforcement-item"><b>NO BOOSTS YET</b><p>Words and short phrases will appear here when recognition or repetition suggests extra practice.</p><small>Easy Speak does not diagnose phonemes; it only turns recurring difficulty into practice.</small></div>';return}
      box.innerHTML=pronAll.slice(0,40).map(x=>{const tr=x.translation||Spanish?.translateFragment?.(x.text,x.sourceTurnId,x.sourceOptionIndex||0,S.profile)||'';return `<div class="reinforcement-item pronunciation-item ${x.mastered?'mastered':''}"><div class="reinforcement-label"><b>${esc(String(x.type||'phrase').toUpperCase())} · ${esc(x.level||'')}</b><span class="stage-badge stage-${String(x.stage||'New').toLowerCase()}">${esc(x.stage||'New')}</span></div><p>${esc(x.text)}</p>${showSpanish&&tr?`<em class="support-translation answer-translation" lang="es">${esc(tr)}</em>`:''}<small>${x.mastered?'Strong after repeated successful reviews':`${esc(x.reason||'Extra practice')} · best ${x.bestScore??x.lastScore??'—'}`}</small></div>`}).join('');return
    }
    $('startReinforcementBtn').textContent=convActive.length?'Practise conversations':'No conversation reinforcements';$('startReinforcementBtn').disabled=!convActive.length;$('clearReinforcementsBtn').textContent='Clear conversation reinforcements';
    if(!convAll.length){box.innerHTML='<div class="reinforcement-item"><b>ALL CLEAR</b><p>No saved conversation reinforcements yet.</p><small>Difficult turns can be saved automatically after a session.</small></div>';return}
    box.innerHTML=convAll.slice(0,30).map(x=>{const tr=Spanish?.get?.({id:x.id},S.profile)?.p||'';return `<div class="reinforcement-item ${x.mastered?'mastered':''}"><div class="reinforcement-label"><b>${esc(x.level||'REVIEW')} · ${esc(x.topic||'Practice')}</b><span class="stage-badge stage-${String(x.stage||'New').toLowerCase()}">${esc(x.stage||'New')}</span></div><p>${esc(x.prompt)}</p>${showSpanish&&tr?`<em class="support-translation answer-translation" lang="es">${esc(tr)}</em>`:''}<small>${x.mastered?'Strong after repeated successful reviews':`Seen ${x.count||1}× · last ${x.lastScore??'—'}`}</small></div>`}).join('');
  }
  async function requestWakeLock(){try{if('wakeLock'in navigator)S.wakeLock=await navigator.wakeLock.request('screen')}catch{}}
  async function releaseWakeLock(){try{await S.wakeLock?.release()}catch{}S.wakeLock=null}
  function newSession(level,mode){return {startedAt:Date.now(),level,mode,points:0,streak:0,bestMultiplier:1,turns:0,conversations:0,scores:[],pendingReinforcements:[],pronunciationItemIds:[],repairedTurns:0,totalImprovement:0,canDos:[],elapsedTarget:Number(S.profile.duration||10)*60000}}

  async function startPractice(reinforcement=false){
    cancelAutoAction();Speech.pause();revokeVoice();closeSheet();S.reinfMode=reinforcement;S.ended=false;S.manualMode=false;S.listening=false;S.listenAttempts=0;S.turnSerial++;S.playbackSerial++;S.promptOverrides.clear();
    if(reinforcement){const items=Storage.activeReinforcements();if(!items.length){toast('No active reinforcements waiting');return}S.queue=[Engine.reinforcementConversation(items.slice(0,20),S.profile)]}
    else S.queue=Engine.queueFor(S.profile.level,S.profile);
    if(!S.queue.length){toast('No conversations available');return}
    await configureSpeechForSession();const caps=Speech.supported(),prep=await Speech.prepare();S.audioReady=!!prep.ok;S.audioDenied=!!prep.permissionDenied;
    if(!prep.ok)toast(prep.permissionDenied?'Microphone not allowed — manual speaking mode will be used.':'Voice input is unavailable — manual speaking mode will be used.',3000);
    else if(prep.recordOnly)toast('Mobile compatibility mode: voice recording is ready; automatic recognition is unavailable here.',3200);
    else if(!prep.reused)toast('Microphone ready for this session · one permission only',2200);
    S.conversationIndex=0;S.turnIndex=0;S.session=newSession(reinforcement?'REVIEW':S.profile.level,S.profile.mode);$('practicePoints').textContent='0';$('practiceMultiplier').textContent='x1';showScreen('practice');requestWakeLock();await runTurn();
  }
  function currentConversation(){return S.queue[S.conversationIndex]}
  function currentTurn(){return currentConversation()?.turns?.[S.turnIndex]}
  function currentLevel(){const c=currentConversation(),t=currentTurn();return t?.originalLevel||c?.level||S.profile.level||'B1'}
  function displayPrompt(){const t=currentTurn();return t?S.promptOverrides.get(t.id)||t.prompt:''}
  function modelOptions(turn=currentTurn()){
    if(!turn)return [];const raw=[...(turn.options||[]).slice(0,3)];if(turn.everyday)raw.push(turn.everyday);else if((turn.options||[])[3])raw.push(turn.options[3]);
    const seen=new Set();return raw.filter(x=>{const key=String(x||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');if(!key||seen.has(key))return false;seen.add(key);return true});
  }
  function scoringTurn(turn=currentTurn()){return turn?{...turn,options:modelOptions(turn)}:turn}
  function totalCompletedTurns(){let n=0;for(let i=0;i<S.conversationIndex;i++)n+=S.queue[i]?.turns?.length||0;return n+S.turnIndex}
  function bestAttempt(){return S.turnAttempts.reduce((best,x)=>!best||x.total>best.total||x.total===best.total&&x.communication>best.communication?x:best,null)}
  function firstAttempt(){return S.turnAttempts[0]||null}
  function improvement(){const a=firstAttempt(),b=bestAttempt();return a&&b?Math.max(0,b.total-a.total):0}

  async function runTurn(){
    if(S.ended)return;const c=currentConversation(),t=currentTurn();if(!c||!t)return endSession();cancelAutoAction();revokeVoice();const serial=++S.turnSerial;S.playbackSerial++;S.listenAttempts=0;S.manualMode=false;S.lastResult=null;S.turnAttempts=[];S.turnCommitted=false;
    $('turnResult').classList.add('hidden');$('learningActions').classList.add('hidden');$('manualDoneBtn').classList.add('hidden');$('micRetryBtn').classList.add('hidden');$('transcript').classList.add('hidden');$('transcript').textContent='';$('voiceCompatNote').classList.add('hidden');$('voiceCompatNote').textContent='';
    $('conversationEmoji').textContent=c.emoji||'💬';$('conversationTitle').textContent=c.title;$('conversationMeta').textContent=`${currentLevel()} · Turn ${S.turnIndex+1} of ${c.turns.length}`;$('conversationCanDo').textContent=c.canDo?`Can-do · ${c.canDo}`:'';$('promptText').textContent=displayPrompt();renderPromptTranslation();
    if(c.canDo&&!S.session.canDos.includes(c.canDo))S.session.canDos.push(c.canDo);
    renderIdeas(!isFlow());$('toggleIdeasBtn').classList.toggle('hidden',!isFlow());updateProgress();setAvatar('speaking','Speaking');$('listenStatus').textContent='Listen first';$('listenHint').textContent=isFlow()?'Answer when the parrot finishes. Flow continues automatically.':'Your turn opens when the parrot finishes.';setListeningUI(false);
    await Speech.speak(displayPrompt(),{rate:S.profile.voiceRate,onstart:()=>setAvatar('speaking','Speaking')});if(S.ended||serial!==S.turnSerial)return;if(S.audioDenied){enableManualFallback('Microphone access was not granted.');return}await beginListening(false,serial);
  }
  function renderIdeas(force=false){
    const t=currentTurn(),box=$('answerIdeas');if(!t)return;if(isFlow()&&!force){box.innerHTML='';box.classList.add('hidden');return}
    const options=modelOptions(t),savedMode=normalizeLanguageMode(S.profile.languageSupport),mode=S.manualMode&&savedMode==='tap'?'visible':savedMode,esOptions=Spanish?.options?.(t,S.profile)||[];box.classList.remove('hidden');box.innerHTML=options.map((o,i)=>{const tr=esOptions[i]||'';return `<div class="answer-idea${i===3?' everyday-answer':''}" data-choice="${i}"><div class="answer-copy${mode==='tap'&&tr?' translation-tap-target':''}">${i===3?'<small class="everyday-tag">EVERYDAY</small>':''}<span>${esc(o)}</span>${tr?`<em class="support-translation answer-translation${mode==='visible'?'':' hidden'}" lang="es">${esc(tr)}</em>`:''}</div><button data-speak-choice="${i}" aria-label="Hear this answer">🔊</button></div>`}).join('');
    box.querySelectorAll('.answer-copy.translation-tap-target').forEach(copy=>copy.onclick=e=>{if(e.target.closest('button'))return;const tr=copy.querySelector('.answer-translation');if(tr){tr.classList.toggle('hidden');tr.classList.toggle('revealed',!tr.classList.contains('hidden'))}});
    box.querySelectorAll('[data-speak-choice]').forEach(b=>b.onclick=async e=>{e.stopPropagation();cancelAutoAction();Speech.stopListening();S.listening=false;setListeningUI(false);const idx=Number(b.dataset.speakChoice),turnSerial=S.turnSerial,playback=++S.playbackSerial;await Speech.speak(options[idx],{rate:(S.profile.voiceRate||1),onstart:()=>setAvatar('speaking',idx===3?'Everyday':'Model')});if(playback!==S.playbackSerial||turnSerial!==S.turnSerial||S.ended)return;if(!S.manualMode)beginListening(true,turnSerial)});
    if(S.manualMode)makeIdeasManual();
  }
  function makeIdeasManual(){$('answerIdeas').classList.remove('hidden');$('answerIdeas').querySelectorAll('.answer-idea').forEach(el=>{el.classList.add('manual-choice');el.onclick=e=>{if(e.target.closest('[data-speak-choice]'))return;handleAttempt(Scoring.manual(scoringTurn(),Number(el.dataset.choice)))}})}
  async function repeatPrompt(){if(S.ended)return;cancelAutoAction();Speech.stopListening();S.listening=false;setListeningUI(false);const turnSerial=S.turnSerial,playback=++S.playbackSerial;setAvatar('speaking','Again');await Speech.speak(displayPrompt(),{rate:S.profile.voiceRate});if(playback!==S.playbackSerial||turnSerial!==S.turnSerial||S.ended)return;if(!S.manualMode)beginListening(true,turnSerial)}
  async function beginListening(userInitiated=false,expectedSerial=S.turnSerial){
    if(S.ended||S.listening||!currentTurn()||expectedSerial!==S.turnSerial)return;cancelAutoAction();S.listening=true;setAvatar('listening','Listening');setListeningUI(true);$('listenStatus').textContent=S.turnAttempts.length?'Try again':'Your turn';$('listenHint').textContent=userInitiated?'Speak now.':'Speak naturally. I’m listening.';
    const voiceCaps=Speech.supported();if(!voiceCaps.recognition&&voiceCaps.recordOnlyPossible){$('listenHint').textContent='Speak, then tap the microphone when you finish.';$('transcript').classList.add('hidden')}
    else if(S.profile.showTranscript!==false){$('transcript').classList.remove('hidden');$('transcript').textContent='…'}
    const res=await Speech.listen({maxMs:12000,onInterim:text=>{if(S.profile.showTranscript!==false)$('transcript').textContent=text||'…'},onVolume:updateVolume});S.listening=false;setListeningUI(false);updateVolume(0);if(S.ended||expectedSerial!==S.turnSerial)return;
    if(res.audioUrl)setVoice(res.audioUrl);
    if(res.recordOnly){S.manualMode=true;setAvatar('idle','Voice captured');$('listenStatus').textContent='Voice captured';$('listenHint').textContent='Listen to My Voice if you want, then tap “I said my answer” to self-check against the models.';$('voiceCompatNote').innerHTML='<b>Mobile compatibility mode.</b> This browser is not exposing automatic speech recognition here, so Easy Speak records your attempt but does not invent an automatic score.';$('voiceCompatNote').classList.remove('hidden');$('manualDoneBtn').classList.remove('hidden');$('learningActions').classList.remove('hidden');renderIdeas(true);return}
    if(res.localUnavailable){toast('On-device recognition was not ready. Use browser recognition or prepare the local model.',3200);enableManualFallback('On-device recognition is unavailable.');return}
    if(res.audioCaptureError){enableManualFallback('The mobile browser could not open its audio input.');return}
    if(res.unsupported||res.permissionDenied){if(res.permissionDenied)S.audioDenied=true;enableManualFallback(res.permissionDenied?'Microphone permission is unavailable.':'Speech recognition is not available in this browser.');return}
    if(!res.transcript?.trim()){S.listenAttempts++;if(S.listenAttempts<2){$('listenStatus').textContent="I didn’t catch that";$('listenHint').textContent='Try once more. Speak a little closer to the phone.';setAvatar('idle','Try again');scheduleAuto(()=>beginListening(true,expectedSerial),650)}else{$('listenStatus').textContent='Ready to try again';$('listenHint').textContent='Tap the microphone or hear a model phrase.';setAvatar('idle','Ready');$('learningActions').classList.remove('hidden')}return}
    S.listenAttempts=0;if(S.profile.showTranscript!==false)$('transcript').textContent=res.transcript;setAvatar('thinking','Checking');setTimeout(()=>{if(expectedSerial===S.turnSerial&&!S.ended)handleAttempt(Scoring.evaluate(scoringTurn(),res,currentLevel()))},240);
  }
  function setAvatar(state,label){const a=$('parrotAvatar');a.classList.remove('idle','speaking','listening','thinking');a.classList.add(state||'idle');$('avatarState').textContent=label||'Ready'}
  function setListeningUI(on){$('micBtn').classList.toggle('active',on);$('micBtn').setAttribute('aria-pressed',on?'true':'false')}
  function updateVolume(rms){const bars=$('volumeBars').querySelectorAll('i'),strength=clamp((rms||0)*1000,0,100);bars.forEach((b,i)=>b.style.height=(5+Math.min(20,strength*(.08+i*.045)))+'px')}
  function enableManualFallback(message){S.manualMode=true;setAvatar('idle','Speak aloud');$('listenStatus').textContent='Speak it aloud';$('listenHint').textContent=message+' Then tap below.';$('manualDoneBtn').classList.remove('hidden');if(S.audioDenied)$('micRetryBtn').classList.remove('hidden');if(S.lastVoiceUrl)$('learningActions').classList.remove('hidden');renderIdeas(true);$('toggleIdeasBtn').classList.add('hidden');toast('Manual speaking fallback is active',2600)}
  // Explicit recovery path for an accidental "Block" on the microphone permission prompt.
  // Must run from a real user gesture (the button tap itself) so the browser is willing to
  // show its permission UI again; if the origin is hard-blocked it will simply fail again.
  async function retryMicAccess(fromPronunciation){
    const btn=$(fromPronunciation?'pronMicRetryBtn':'micRetryBtn');btn.disabled=true;btn.textContent='Requesting…';
    const res=await (Speech.retryPermission?Speech.retryPermission():Speech.prepare());
    btn.disabled=false;btn.textContent='🎙 Try microphone again';
    if(!res.ok){toast(res.permissionDenied?'Still blocked. Check your browser’s site settings to allow the microphone.':'Microphone is still unavailable in this browser.',3400);return}
    btn.classList.add('hidden');S.audioDenied=false;S.audioReady=true;toast('Microphone enabled — you can speak now',2200);
    if(fromPronunciation){if(S.pronActive&&!S.pronListening)beginPronListening(true);return}
    if(!S.ended&&S.session){S.manualMode=false;$('voiceCompatNote').classList.add('hidden');beginListening(true,S.turnSerial)}
  }
  function enableManualChoice(){S.manualMode=true;$('manualDoneBtn').classList.add('hidden');$('listenStatus').textContent='Which model is closest?';$('listenHint').textContent='Tap the phrase closest to what you said.';renderIdeas(true);makeIdeasManual()}
  function coachingModel(score=S.lastResult){const options=modelOptions();if(!options.length)return '';const idx=Number.isInteger(score?.bestOptionIndex)&&options[score.bestOptionIndex]?score.bestOptionIndex:0;return options[idx]||options[0]}
  async function hearCoachingModel(factor=.82){
    if(S.ended)return;cancelAutoAction();Speech.stopListening();S.listening=false;setListeningUI(false);const text=coachingModel(),turnSerial=S.turnSerial,playback=++S.playbackSerial;if(!text)return beginListening(true,turnSerial);
    $('listenStatus').textContent=factor<.75?'Slow model':'Listen to the model';$('listenHint').textContent='Keep the meaning. You do not need to copy every word.';setAvatar('speaking',factor<.75?'Slow model':'Model');await Speech.speak(text,{rate:Math.max(.35,(S.profile.voiceRate||1)*factor)});if(playback!==S.playbackSerial||turnSerial!==S.turnSerial||S.ended)return;beginListening(true,turnSerial);
  }
  async function playMyVoice(){
    if(!S.lastVoiceUrl)return;cancelAutoAction();Speech.stopListening();Speech.stopSpeaking();S.listening=false;setListeningUI(false);setAvatar('idle','Your voice');$('listenStatus').textContent='Listen to yourself';$('listenHint').textContent='Notice rhythm, pauses and whether the message sounds complete.';
    try{const a=new Audio(S.lastVoiceUrl);await a.play();a.onended=()=>{if(!S.ended)setAvatar('idle','Ready')}}catch{toast('Your recording could not be played')}
  }
  async function autoRepair(withModel){if(S.ended)return;cancelAutoAction();if(withModel){await hearCoachingModel(.76);return}$('listenStatus').textContent='One more time';$('listenHint').textContent='Same idea, smoother rhythm.';setAvatar('idle','Again');scheduleAuto(()=>beginListening(true,S.turnSerial),520)}
  function handleAttempt(score){
    if(S.ended||!score||S.turnCommitted)return;cancelAutoAction();Speech.stopListening();S.listening=false;setListeningUI(false);S.turnAttempts.push(score);S.lastResult=score;renderAttemptResult(score);$('learningActions').classList.remove('hidden');
    const attempt=S.turnAttempts.length,needsRepair=Scoring.needsRepair(score);if(S.manualMode){setAvatar('idle','Good');scheduleCommitAndAdvance(1100);return}
    if(isFlow()){if(needsRepair&&attempt<2){setAvatar('idle','Try again');scheduleAuto(()=>autoRepair(true),700)}else{setAvatar('idle',score.total>=80?'Nice!':'Keep going');scheduleCommitAndAdvance(score.total>=80?900:1250)}return}
    if(score.total>=80&&!score.incomplete){setAvatar('idle','Nice!');scheduleCommitAndAdvance(1700);return}
    if(attempt>=3){setAvatar('idle','Best saved');$('listenHint').textContent='Your best attempt will count. This turn can return as reinforcement.';scheduleCommitAndAdvance(2100);return}
    if(needsRepair){setAvatar('idle',score.incomplete?'Complete it':'Repair');scheduleAuto(()=>autoRepair(true),850);return}
    setAvatar('idle','Again');scheduleAuto(()=>autoRepair(false),950);
  }
  function renderAttemptResult(score){const [title,text]=Scoring.feedback(score),attempt=S.turnAttempts.length,imp=improvement();$('turnScoreNumber').textContent=score.total;$('feedbackTitle').textContent=title;$('feedbackText').textContent=`${text}${attempt>1&&imp>0?` Improved +${imp}.`:''}`;$('mComm').textContent=score.communication;$('mFluency').textContent=score.fluency;$('mClarity').textContent=score.clarity;$('mVoice').textContent=score.voice;$('turnResult').classList.remove('hidden');$('listenStatus').textContent=`Attempt ${attempt} · ${score.total}/100`;$('listenHint').textContent=score.transcript?`Heard: “${score.transcript}”`:'Keep the idea and try it again.';updateProgress()}
  function scheduleCommitAndAdvance(ms){scheduleAuto(()=>commitTurnAndAdvance(),ms)}
  function commitTurnAndAdvance(){
    if(S.ended||S.turnCommitted)return;const score=bestAttempt();if(!score){advanceTurn();return}S.turnCommitted=true;cancelAutoAction();const t=currentTurn(),c=currentConversation();
    const oldMult=multiplier(S.session.streak);if(score.total>=70)S.session.streak++;else S.session.streak=0;const mult=multiplier(S.session.streak);S.session.bestMultiplier=Math.max(S.session.bestMultiplier,mult);
    const imp=improvement(),improvementBonus=imp>=8?Math.min(8,Math.floor(imp/4)):0,earned=Math.max(4,Math.round(score.total/10))*mult+improvementBonus;S.session.points+=earned;S.session.turns++;S.session.scores.push({...score,audioUrl:null});S.session.totalImprovement+=imp;if(imp>=8)S.session.repairedTurns++;
    if(S.reinfMode&&t.reinforcement)Storage.reviewReinforcement(t.id,score.total);
    if(!S.reinfMode&&(Scoring.needsRepair(score)||score.total<70))S.session.pendingReinforcements.push({id:t.id,prompt:t.prompt,options:modelOptions(t),everyday:t.everyday,keywords:t.keywords,targetWords:t.targetWords,openAnswer:t.openAnswer,level:currentLevel(),topic:c.topic,title:c.title,lastScore:score.total});
    if(S.profile.pronunciationAutoSave!==false&&!S.manualMode&&score.transcript&&(score.clarity<82||(firstAttempt()?.clarity||100)<80)){const diagnostic=(firstAttempt()?.clarity||100)<80?firstAttempt():score;const items=Pron.deriveItems(t,diagnostic,{models:modelOptions(t),attemptCount:S.turnAttempts.length,level:currentLevel(),topic:c.topic,profile:S.profile});if(items.length){Storage.addPronunciationItems(items);S.session.pronunciationItemIds=[...new Set([...S.session.pronunciationItemIds,...items.map(x=>x.id)])].slice(0,12)}}
    const next=c.turns?.[S.turnIndex+1];if(next){const branched=Engine.branchPrompt(t,score,next);if(branched)S.promptOverrides.set(next.id,branched)}
    $('practicePoints').textContent=S.session.points;$('practiceMultiplier').textContent='x'+mult;if(mult>oldMult)showStreakPop(mult);const [title,text]=Scoring.feedback(score);$('turnScoreNumber').textContent=score.total;$('feedbackTitle').textContent=imp>=8?`Improved +${imp}`:title;$('feedbackText').textContent=`${text} +${earned} points`;$('learningActions').classList.add('hidden');S.lastResult=score;updateProgress();scheduleAuto(()=>advanceTurn(),isFlow()?650:850);
  }
  function showStreakPop(mult){const p=$('streakPop');$('streakPopValue').textContent='x'+mult;p.classList.remove('hidden','show');void p.offsetWidth;p.classList.add('show');clearTimeout(p._timer);p._timer=setTimeout(()=>p.classList.add('hidden'),1300)}
  function advanceTurn(){if(S.ended)return;cancelAutoAction();const c=currentConversation();if(S.turnIndex<c.turns.length-1){S.turnIndex++;runTurn();return}S.session.conversations++;const elapsed=Date.now()-S.session.startedAt;if(elapsed>=S.session.elapsedTarget||S.conversationIndex>=S.queue.length-1){endSession();return}S.conversationIndex++;S.turnIndex=0;runTurn()}
  function updateProgress(){if(!S.session)return;const byTime=(Date.now()-S.session.startedAt)/S.session.elapsedTarget,total=Engine.totalTurns(S.queue)||1,byTurns=(totalCompletedTurns()+(S.turnCommitted?1:0))/total,pct=Math.round(Math.min(.99,Math.max(byTime,byTurns))*100);$('sessionProgress').style.width=pct+'%'}
  function dedupePending(items){const m=new Map();(items||[]).forEach(x=>m.set(x.id,x));return [...m.values()]}
  async function endSession(){
    if(S.ended)return;S.ended=true;cancelAutoAction();Speech.pause();revokeVoice();releaseWakeLock();const scores=S.session.scores,score=avg(scores,'total'),comm=avg(scores,'communication'),flu=avg(scores,'fluency'),clar=avg(scores,'clarity'),voice=avg(scores,'voice'),minutes=Math.max(1,Math.round((Date.now()-S.session.startedAt)/60000));
    const pending=dedupePending(S.session.pendingReinforcements);S.session.pendingReinforcements=pending;
    if(!S.reinfMode&&S.profile.autoReinforce!==false&&pending.length){Storage.addReinforcements(pending);$('autoReinforcementNote').textContent=`↻ ${pending.length} reinforcement${pending.length===1?'':'s'} saved automatically`;$('autoReinforcementNote').classList.remove('hidden');$('saveReinforcementsBtn').classList.add('hidden')}
    else{$('autoReinforcementNote').classList.add('hidden');$('pendingCount').textContent=pending.length;$('saveReinforcementsBtn').classList.toggle('hidden',!pending.length||S.reinfMode)}
    const saved={...S.session,score,communication:comm,fluency:flu,clarity:clar,voice,minutes};S.stats=Storage.addSession(saved);
    $('summaryScore').textContent=score;$('scoreRing').style.setProperty('--score',score);$('summaryPoints').textContent='+'+S.session.points;$('summaryStreak').textContent='x'+S.session.bestMultiplier;$('summaryTurns').textContent=S.session.turns;$('sumComm').textContent=comm;$('sumFluency').textContent=flu;$('sumClarity').textContent=clar;$('sumVoice').textContent=voice;$('barComm').style.width=comm+'%';$('barFluency').style.width=flu+'%';$('barClarity').style.width=clar+'%';$('barVoice').style.width=voice+'%';
    if(S.session.repairedTurns||S.session.totalImprovement){$('improvementCard').classList.remove('hidden');$('improvementTitle').textContent=`Improved ${S.session.repairedTurns} turn${S.session.repairedTurns===1?'':'s'}`;$('improvementText').textContent=`Best attempts gained +${S.session.totalImprovement} points across repeated turns.`}else if(S.session.canDos.length){$('improvementCard').classList.remove('hidden');$('improvementTitle').textContent='Can-do practised';$('improvementText').textContent=S.session.canDos[0]}else $('improvementCard').classList.add('hidden');
    const activePronIds=new Set(Storage.activePronunciation().map(x=>x.id)),sessionPron=[...new Set(S.session.pronunciationItemIds||[])].filter(id=>activePronIds.has(id));S.session.pronunciationItemIds=sessionPron;$('summaryPronCount').textContent=sessionPron.length;$('pronunciationBoostCard').classList.toggle('hidden',!sessionPron.length);
    $('sessionProgress').style.width='100%';showScreen('summary');if(S.session.repairedTurns)toast(`${S.session.repairedTurns} turn${S.session.repairedTurns===1?'':'s'} improved through repetition`,2800);
  }
  function startPronunciationFromGesture(ids=null,returnTo='home'){Speech.unlockFromGesture?.();startPronunciationBoost(ids,returnTo)}
  async function startPronunciationBoost(ids=null,returnTo='home'){
    cancelAutoAction();cancelPronTimer();Speech.pause();revokePronVoice();closeSheet();const all=Storage.activePronunciation();const wanted=Array.isArray(ids)&&ids.length?all.filter(x=>ids.includes(x.id)):all;
    if(!wanted.length){toast('No pronunciation boosts are waiting');return}
    const order={word:0,chunk:1,phrase:2};S.pronQueue=[...wanted].sort((a,b)=>(order[a.type]??2)-(order[b.type]??2)||((a.bestScore||0)-(b.bestScore||0))).slice(0,8);S.pronIndex=0;S.pronAttempts=[];S.pronCommitted=false;S.pronActive=true;S.pronReturn=returnTo;S.pronPoints=0;
    await configureSpeechForSession();const prep=await Speech.prepare();if(!prep.ok){toast(prep.permissionDenied?'Microphone not allowed — listen-and-compare mode is still available.':'Automatic recognition is unavailable — listen-and-compare mode is still available.',3000);if(prep.permissionDenied)$('pronMicRetryBtn').classList.remove('hidden')}
    showScreen('pronunciation');requestWakeLock();runPronunciationItem();
  }
  function currentPronunciation(){return S.pronQueue[S.pronIndex]}
  function pronUpdateVolume(rms){const bars=$('pronVolumeBars').querySelectorAll('i'),strength=clamp((rms||0)*1000,0,100);bars.forEach((b,i)=>b.style.height=(5+Math.min(20,strength*(.08+i*.045)))+'px')}
  function setPronMic(on){$('pronMicBtn').classList.toggle('active',!!on);$('pronMicBtn').setAttribute('aria-pressed',on?'true':'false')}
  async function runPronunciationItem(){
    if(!S.pronActive)return;cancelPronTimer();revokePronVoice();S.pronAttempts=[];S.pronCommitted=false;const item=currentPronunciation();if(!item)return finishPronunciation();
    $('pronunciationCount').textContent=`${S.pronIndex+1} / ${S.pronQueue.length}`;$('pronunciationProgress').style.width=`${Math.round(S.pronIndex/S.pronQueue.length*100)}%`;$('pronunciationType').textContent=String(item.type||'phrase').toUpperCase();$('pronunciationText').textContent=item.text;renderPronTranslation();$('pronunciationReason').textContent=item.reason||'This unit is worth another clear repetition.';$('pronunciationSource').textContent=item.topic?`${item.level||''} · ${item.topic}`:'From your speaking practice';
    $('pronResult').classList.add('hidden');$('pronTranscript').classList.add('hidden');$('pronTranscript').textContent='';$('pronCompatNote').classList.add('hidden');$('pronMicRetryBtn').classList.add('hidden');$('pronMyVoiceBtn').classList.add('hidden');$('pronStatus').textContent='Listen first';$('pronHint').textContent=item.type==='word'?'Hear the whole word, then repeat it naturally.':'Keep the words connected as one speaking unit.';$('pronListenStatus').textContent='Your turn';$('pronListenHint').textContent='Repeat after the model.';setPronMic(false);
    await pronPlayModel(1,false);if(S.pronActive)beginPronListening(false);
  }
  async function pronPlayModel(factor=1,relisten=true){const item=currentPronunciation();if(!S.pronActive||!item)return;cancelPronTimer();Speech.stopListening();setPronMic(false);$('pronStatus').textContent=factor<.8?'Slow model':'Listen to the model';$('pronHint').textContent='Copy the sound shape and rhythm, not just the spelling.';await Speech.speak(item.text,{rate:Math.max(.35,(S.profile.voiceRate||1)*factor)});if(relisten&&S.pronActive)beginPronListening(false)}
  async function pronShadow(){const item=currentPronunciation();if(!S.pronActive||!item)return;cancelPronTimer();Speech.stopListening();setPronMic(false);$('pronStatus').textContent='Shadow';$('pronHint').textContent='Speak along with the model. This rehearsal is not scored.';$('pronListenStatus').textContent='Speak along';$('pronListenHint').textContent='Join after the first word and keep moving.';await Speech.speak(item.text,{rate:Math.max(.55,Math.min(1,S.profile.voiceRate||1))});if(S.pronActive){$('pronStatus').textContent='Now try it alone';schedulePron(()=>beginPronListening(false),600)}}
  async function beginPronListening(userInitiated=false){
    if(!S.pronActive||S.pronListening)return;cancelPronTimer();Speech.stopSpeaking();S.pronListening=true;setPronMic(true);$('pronListenStatus').textContent=S.pronAttempts.length?'One more time':'Your turn';$('pronListenHint').textContent=userInitiated?'Speak now.':'Repeat the whole unit naturally.';const caps=Speech.supported();if(caps.recognition){$('pronTranscript').classList.remove('hidden');$('pronTranscript').textContent='…'}
    const res=await Speech.listen({maxMs:7500,onInterim:t=>{$('pronTranscript').textContent=t||'…'},onVolume:pronUpdateVolume});S.pronListening=false;setPronMic(false);pronUpdateVolume(0);if(!S.pronActive)return;if(res.audioUrl)setPronVoice(res.audioUrl);
    if(res.recordOnly||res.unsupported||res.permissionDenied){$('pronCompatNote').innerHTML='<b>Listen-and-compare mode.</b> This browser is not providing reliable automatic recognition here. Use Model and My Voice, then repeat or move on.';$('pronCompatNote').classList.remove('hidden');if(res.permissionDenied)$('pronMicRetryBtn').classList.remove('hidden');$('pronStatus').textContent='Compare your voice';$('pronHint').textContent='Listen to the model and to yourself. Repeat if you want another try.';return}
    if(!res.transcript?.trim()){$('pronListenStatus').textContent="I didn't catch that";$('pronListenHint').textContent='Try again a little closer to the microphone.';return}
    $('pronTranscript').textContent=`Heard: “${res.transcript}”`;const result=Pron.evaluate(currentPronunciation(),res);S.pronAttempts.push(result);renderPronResult(result);handlePronResult(result)
  }
  function renderPronResult(result){const [title,text]=Pron.feedback(result.score);$('pronScore').textContent=result.score??'—';$('pronFeedbackTitle').textContent=title;$('pronFeedbackText').textContent=text;$('pronResult').classList.remove('hidden');$('pronStatus').textContent=result.score>=82?'Good recognition':'Keep shaping it';$('pronHint').textContent=result.score>=82?'The browser heard this consistently.':'A slower model can help you keep the unit connected.'}
  function handlePronResult(result){const n=result.score??0;if(n>=82){commitPronunciationItem(n);schedulePron(advancePronunciationItem,1050);return}if(S.pronAttempts.length>=3){commitPronunciationItem(n);$('pronStatus').textContent='Saved for later';schedulePron(advancePronunciationItem,1450);return}if(n<65){schedulePron(()=>pronPlayModel(.68,true),800);return}schedulePron(()=>beginPronListening(false),850)}
  function commitPronunciationItem(score){if(S.pronCommitted||!currentPronunciation()||score==null)return;S.pronCommitted=true;Storage.reviewPronunciation(currentPronunciation().id,score);const earned=Math.max(3,Math.round(score/20)),stats=Storage.stats();stats.points=(stats.points||0)+earned;Storage.saveStats(stats);S.pronPoints+=earned}
  function pronSkip(){cancelPronTimer();S.pronListening=false;Speech.stopListening();const best=S.pronAttempts.reduce((m,x)=>!m||x.score>m.score?x:m,null);if(best&&!S.pronCommitted)commitPronunciationItem(best.score);else if(!best&&currentPronunciation())Storage.touchPronunciation(currentPronunciation().id);advancePronunciationItem()}
  function advancePronunciationItem(){if(!S.pronActive)return;cancelPronTimer();S.pronIndex++;if(S.pronIndex>=S.pronQueue.length){finishPronunciation();return}runPronunciationItem()}
  async function playPronVoice(){if(!S.pronVoiceUrl)return;cancelPronTimer();Speech.stopListening();Speech.stopSpeaking();setPronMic(false);$('pronStatus').textContent='Your voice';$('pronHint').textContent='Compare rhythm, continuity and whether the whole unit sounds complete.';try{const a=new Audio(S.pronVoiceUrl);await a.play()}catch{toast('Your recording could not be played')}}
  function finishPronunciation(){cancelPronTimer();Speech.pause();revokePronVoice();releaseWakeLock();S.pronActive=false;S.pronListening=false;S.stats=Storage.stats();renderHome();const back=S.pronReturn==='summary'&&S.session?'summary':'home';showScreen(back);if(back==='summary'){const remaining=new Set(Storage.activePronunciation().map(x=>x.id)),ids=(S.session?.pronunciationItemIds||[]).filter(id=>remaining.has(id));S.session.pronunciationItemIds=ids;$('summaryPronCount').textContent=ids.length;$('pronunciationBoostCard').classList.toggle('hidden',!ids.length)}toast(`Pronunciation boost complete${S.pronPoints?` · +${S.pronPoints} points`:''}`,2600)}
  function exitPronunciation(){if(!S.pronActive)return;cancelPronTimer();Speech.pause();revokePronVoice();releaseWakeLock();S.pronActive=false;S.pronListening=false;showScreen(S.pronReturn==='summary'&&S.session?'summary':'home');renderHome()}

  function savePendingReinforcements(){const items=S.session?.pendingReinforcements||[];if(!items.length)return;Storage.addReinforcements(items);S.stats=Storage.stats();S.session.pendingReinforcements=[];$('saveReinforcementsBtn').classList.add('hidden');toast(`${items.length} reinforcement${items.length===1?'':'s'} saved`)}
  async function exitPractice(){if(S.ended)return;cancelAutoAction();if(S.session?.turns&&!confirm('End this speaking session and keep the progress so far?'))return;if(S.session?.turns){endSession();return}S.ended=true;Speech.pause();revokeVoice();releaseWakeLock();showScreen('home');renderHome()}
  function finishToHome(){cancelAutoAction();Speech.pause();revokeVoice();releaseWakeLock();S.ended=true;showScreen('home');renderHome()}

  window.addEventListener('DOMContentLoaded',boot);
})();
