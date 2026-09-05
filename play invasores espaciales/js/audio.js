window.SF = window.SF || {};
SF.Audio = (() => {
  let ac=null,master=null,compressor=null;

  function unlock(){
    try{
      if(!ac){
        ac=new (window.AudioContext||window.webkitAudioContext)();
        master=ac.createGain();master.gain.value=.78;
        compressor=ac.createDynamicsCompressor();
        compressor.threshold.value=-18;compressor.knee.value=16;compressor.ratio.value=5;compressor.attack.value=.004;compressor.release.value=.14;
        master.connect(compressor);compressor.connect(ac.destination);
      }
      if(ac.state==='suspended') ac.resume();
    }catch{}
  }

  function tone(freq=300,dur=.06,type='sine',vol=.025,slide=1,delay=0){
    if(!ac) return;
    const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(Math.max(40,freq),t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*slide),t+dur);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);g.connect(master||ac.destination);o.start(t);o.stop(t+dur+.025);
  }

  function noise(dur=.10,vol=.018,cut=1400,delay=0){
    if(!ac) return;
    const len=Math.max(64,Math.floor(ac.sampleRate*dur));
    const buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
    const t=ac.currentTime+delay;
    f.type='lowpass';f.frequency.setValueAtTime(cut,t);
    g.gain.setValueAtTime(Math.max(.0001,vol),t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.buffer=buf;src.connect(f);f.connect(g);g.connect(master||ac.destination);src.start(t);
  }

  function shot(ship){
    if(ship==='warden') tone(145,.045,'square',.022,1.45);
    else if(ship==='specter') tone(560,.024,'triangle',.014,1.72);
    else tone(330,.030,'square',.015,1.58);
  }

  function hit(){tone(155,.045,'sawtooth',.016,.68);}
  function pickup(){tone(780,.065,'triangle',.022,1.24);tone(1060,.045,'sine',.013,1.05,.045);}
  function wave(){tone(460,.07,'square',.022,1.12);tone(650,.08,'square',.022,1.12,.08);tone(850,.08,'triangle',.018,1.05,.16);}
  function boom(){tone(92,.16,'sawtooth',.028,.46);noise(.12,.016,520);}

  function missileLaunch(){
    tone(118,.08,'sawtooth',.018,1.9);
    noise(.085,.010,1800,.01);
  }

  function power(kind){
    if(!ac)return;
    switch(kind){
      case 'spread':
        tone(360,.055,'square',.024,1.55);
        tone(510,.055,'square',.020,1.38,.045);
        tone(690,.065,'triangle',.018,1.25,.09);
        break;
      case 'beam':
        tone(145,.22,'sawtooth',.022,5.1);
        tone(290,.18,'sine',.016,2.4,.025);
        noise(.16,.009,2400,.025);
        break;
      case 'missiles':
        tone(105,.095,'square',.026,.78);
        tone(150,.08,'sawtooth',.021,1.8,.07);
        noise(.15,.014,1100,.02);
        break;
      case 'shield':
        tone(410,.12,'sine',.020,1.8);
        tone(620,.15,'triangle',.018,1.55,.045);
        tone(920,.16,'sine',.012,1.20,.085);
        break;
      case 'chain':
        noise(.13,.020,5200);
        tone(980,.07,'square',.018,.42);
        tone(690,.08,'square',.014,1.45,.055);
        break;
      case 'emp':
        tone(170,.24,'sawtooth',.030,.34);
        tone(76,.30,'sine',.022,.62,.025);
        noise(.20,.018,900,.015);
        break;
      default: pickup();
    }
  }

  return {unlock,tone,noise,shot,hit,pickup,wave,boom,power,missileLaunch};
})();
