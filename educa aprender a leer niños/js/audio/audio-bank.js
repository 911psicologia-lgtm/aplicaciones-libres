(function(){
  const catalog={
    a:'assets/audio/a.ogg',e:'assets/audio/e.ogg',i:'assets/audio/i.ogg',o:'assets/audio/o.ogg',u:'assets/audio/u.ogg',
    m:'assets/audio/m.ogg',p:'assets/audio/p.ogg',s:'assets/audio/s.ogg',l:'assets/audio/l.ogg'
  };
  const available={};
  function keyFor(text){const t=String(text||'').toLowerCase().trim();return catalog[t]?t:null;}
  async function probe(k){
    if(k in available)return available[k];
    if(location.protocol==='file:'){available[k]=false;return false;}
    try{const r=await fetch(catalog[k],{method:'HEAD',cache:'no-store'});available[k]=r.ok;}catch(e){available[k]=false;}
    return available[k];
  }
  async function play(text,opts={}){
    const k=keyFor(text);if(!k||!(await probe(k)))return false;
    return new Promise(resolve=>{
      const a=new Audio(catalog[k]);
      a.volume=typeof opts.volume==='number'?opts.volume:1;
      // Los clips pedagógicos se reproducen apenas más despacio, sin exagerar para evitar distorsión.
      a.playbackRate=Math.max(.75,Math.min(1,opts.playbackRate||.9));
      let started=false;
      a.onplay=()=>{started=true;if(opts.onStart)opts.onStart();};
      a.onended=()=>{if(opts.onEnd)opts.onEnd();resolve(true);};
      a.onerror=()=>{if(started&&opts.onEnd)opts.onEnd();resolve(false);};
      a.play().catch(()=>resolve(false));
    });
  }
  function describe(){return {catalog:Object.keys(catalog),localReady:Object.keys(available).filter(k=>available[k])};}
  window.EmiliaAudioBank={play,describe,keyFor};
})();
