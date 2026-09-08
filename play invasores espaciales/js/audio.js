window.SF = window.SF || {};
(function(NS){
  let ctx = null;
  function ensure(){
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    return ctx;
  }
  function tone(freq, dur, type='sine', vol=.03, endMul=1){
    const ac = ensure(); if(!ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq,t); o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*endMul),t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+dur+.02);
  }
  function noise(dur=.08, vol=.02, cutoff=900){
    const ac = ensure(); if(!ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const arr = buf.getChannelData(0);
    for(let i=0;i<len;i++) arr[i] = (Math.random()*2-1) * (1 - i/len);
    const src = ac.createBufferSource();
    const f = ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cutoff;
    const g = ac.createGain(); g.gain.value = vol;
    src.buffer=buf; src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
  }
  function sequence(arr, gap=60){ arr.forEach((fn,i)=>setTimeout(fn, i*gap)); }

  NS.audio = {
    ensure,
    shot(){ tone(280,.032,'square',.015,1.75); },
    enemyShot(){ tone(150,.06,'triangle',.018,.86); },
    enemyDive(){ sequence([()=>tone(260,.06,'sawtooth',.018,.96), ()=>tone(180,.08,'triangle',.018,.7)], 70); },
    hit(){ tone(120,.05,'square',.025,.6); noise(.05,.015,1200); },
    boom(){ sequence([()=>tone(95,.08,'sawtooth',.03,.6), ()=>noise(.12,.03,500)], 40); },
    power(kind){
      const map = {
        spread: ()=>sequence([()=>tone(560,.05,'square',.024,1.1), ()=>tone(740,.06,'square',.022,1.02)], 60),
        shield: ()=>sequence([()=>tone(410,.08,'triangle',.026,1.05), ()=>tone(520,.12,'sine',.022,1.02)], 55),
        chain: ()=>sequence([()=>tone(320,.04,'sawtooth',.02,1.7), ()=>tone(470,.04,'sawtooth',.018,1.9), ()=>noise(.05,.01,2300)], 45),
        emp: ()=>sequence([()=>tone(820,.05,'square',.026,.7), ()=>tone(440,.12,'triangle',.03,.38), ()=>noise(.09,.018,1800)], 55),
        missile: ()=>sequence([()=>tone(210,.07,'square',.024,1.6), ()=>tone(300,.07,'square',.02,1.2)], 48),
        heal: ()=>sequence([()=>tone(460,.06,'sine',.022,1.08), ()=>tone(620,.08,'sine',.022,1.06)], 65),
        overdrive: ()=>sequence([()=>tone(510,.05,'square',.025,1.45), ()=>tone(680,.06,'triangle',.024,1.2), ()=>tone(920,.09,'square',.022,1.01)], 48),
        life: ()=>sequence([()=>tone(700,.05,'sine',.026,1.1), ()=>tone(880,.08,'sine',.024,1.08), ()=>tone(1040,.1,'triangle',.022,1.04)], 60),
        drone: ()=>sequence([()=>tone(540,.05,'triangle',.022,1.18),()=>tone(720,.07,'sine',.022,1.06),()=>tone(860,.05,'triangle',.017,.98)],52)
      };
      (map[kind] || map.heal)();
    },
    checkpoint(){ sequence([()=>tone(490,.07,'triangle',.02,1.05), ()=>tone(620,.09,'triangle',.024,1.02)], 80); },
    wave(){ sequence([()=>tone(390,.06,'square',.02,1),()=>tone(520,.06,'square',.022,1),()=>tone(650,.08,'square',.024,1)],75); },
    miniboss(){ sequence([()=>tone(210,.1,'sawtooth',.032,.8),()=>tone(160,.12,'triangle',.028,.64)],95); },
    minibossShot(style=0){
      if(style===0) sequence([()=>tone(330,.04,'sawtooth',.02,1.28),()=>tone(220,.055,'triangle',.016,.78),()=>noise(.045,.009,1500)],38);
      else if(style===1) sequence([()=>tone(145,.09,'sine',.024,.62),()=>tone(430,.05,'triangle',.018,1.48),()=>tone(610,.05,'square',.014,.78)],48);
      else sequence([()=>tone(190,.06,'square',.021,.72),()=>tone(380,.055,'sawtooth',.018,1.55),()=>noise(.05,.012,980)],46);
    },
    boss(){ sequence([()=>tone(160,.1,'sawtooth',.034,.75),()=>tone(120,.12,'triangle',.03,.62),()=>noise(.08,.025,700)],85); },
    bossShot(pattern='nova',ph=0){
      if(pattern==='nova') sequence([()=>tone(210+ph*18,.045,'square',.021,1.12),()=>tone(315+ph*30,.055,'sawtooth',.018,1.28),()=>noise(.035,.008,1700)],40);
      else if(pattern==='lancer') sequence([()=>tone(250+ph*35,.045,'square',.022,1.72),()=>tone(510+ph*25,.06,'triangle',.018,.68),()=>tone(760,.04,'sine',.012,.9)],42);
      else if(pattern==='brood') sequence([()=>tone(135,.075,'sawtooth',.024,.66),()=>tone(205,.06,'triangle',.016,1.22),()=>noise(.06,.015,900)],45);
      else if(pattern==='gravity') sequence([()=>tone(82,.12,'sine',.032,.54),()=>tone(164,.09,'triangle',.019,.68),()=>tone(328,.05,'sine',.012,.72)],62);
      else sequence([()=>tone(300+ph*25,.045,'sawtooth',.022,1.42),()=>tone(170,.07,'triangle',.02,.74),()=>noise(.05,.012,1300)],44);
    },
    bossResurrect(){ sequence([()=>tone(120,.16,'sawtooth',.03,1.8),()=>tone(260,.15,'triangle',.028,1.5),()=>noise(.12,.02,1200)],90); },
    bossReward(){ sequence([()=>tone(360,.08,'sine',.022,1.15),()=>tone(540,.08,'triangle',.024,1.08),()=>tone(760,.12,'sine',.024,1.02)],72); },
    relicAttach(kind='spread'){ const base={spread:620,shield:480,chain:700,missile:390,overdrive:820,heal:560,life:920,drone:680}[kind]||600; sequence([()=>tone(base,.05,'triangle',.024,1.12),()=>tone(base*1.28,.08,'sine',.025,1.03)],58); },
    sentinelShield(){ sequence([()=>tone(360,.05,'triangle',.016,1.08),()=>tone(500,.08,'sine',.014,1.04)],55); },
    reanimator(){ sequence([()=>tone(170,.08,'sawtooth',.019,1.45),()=>tone(310,.10,'triangle',.018,1.3)],72); },
    breeder(){ sequence([()=>tone(120,.055,'sawtooth',.017,.84),()=>noise(.045,.01,1100)],42); },
    coreExpose(){ sequence([()=>tone(690,.05,'sine',.02,1.18),()=>tone(920,.08,'triangle',.022,1.04)],58); },
    weaponEvolve(tier=2){ const f=tier>=3?980:760; sequence([()=>tone(f,.06,'triangle',.024,1.1),()=>tone(f*1.24,.09,'sine',.025,1.02),()=>noise(.05,.009,1800)],62); },
    sniperCharge(){ sequence([()=>tone(460,.055,'sine',.013,1.4),()=>tone(620,.055,'triangle',.012,1.22)],70); },
    bossPhase(n=2){ const f=n>=3?250:210; sequence([()=>tone(f,.08,'sawtooth',.028,.78),()=>tone(f*1.35,.09,'triangle',.024,1.02),()=>noise(.06,.018,900)],75); },
    waveClear(perfect=false){ const f=perfect?820:640; sequence([()=>tone(f,.055,'triangle',.02,1.08),()=>tone(f*1.18,.075,'sine',.022,1.04)],65); },
    critical(){ sequence([()=>tone(920,.055,'square',.018,.75),()=>tone(760,.055,'square',.018,.75)],90); },
    combo(n=5){ const f=n>=10?980:760; sequence([()=>tone(f,.045,'triangle',.02,1.08),()=>tone(f*1.22,.06,'triangle',.02,1.04)],52); },
    objective(){ sequence([()=>tone(660,.045,'triangle',.019,1.12),()=>tone(830,.055,'sine',.02,1.08),()=>tone(990,.07,'triangle',.018,1.02)],48); },
    fusion(id='nova'){ const f=id==='arc'?520:id==='hunter'?420:720; sequence([()=>tone(f,.055,'sawtooth',.021,1.22),()=>tone(f*1.32,.07,'triangle',.022,1.08),()=>noise(.045,.008,1700)],52); },
    eliteShot(cls='ace'){ const f=cls==='bulwark'?240:cls==='hunter'?390:560; sequence([()=>tone(f,.04,'triangle',.016,1.15),()=>tone(f*1.22,.045,'square',.012,.9)],36); },
    extraLife(){ sequence([()=>tone(760,.06,'sine',.024,1.1),()=>tone(960,.08,'sine',.024,1.05)],75); }
  };
})(window.SF);
