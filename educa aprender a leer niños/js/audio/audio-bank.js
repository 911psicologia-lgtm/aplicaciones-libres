(function(){
  const fallbackCatalog={
    a:'assets/audio/a.ogg',e:'assets/audio/e.ogg',i:'assets/audio/i.ogg',o:'assets/audio/o.ogg',u:'assets/audio/u.ogg',
    m:'assets/audio/m.ogg',p:'assets/audio/p.ogg',s:'assets/audio/s.ogg',l:'assets/audio/l.ogg'
  };
  let manifest=null, manifestLoaded=false, loadingManifest=null;
  const available={};
  const norm=t=>String(t||'').toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
  function resolveMap(){
    const clips=Object.assign({},fallbackCatalog,(manifest&&manifest.clips)||{});
    const aliases=Object.assign({},(manifest&&manifest.aliases)||{});
    return {clips,aliases};
  }
  async function loadManifest(){
    if(manifestLoaded)return manifest;
    if(loadingManifest)return loadingManifest;
    loadingManifest=(async()=>{
      try{
        const r=await fetch('assets/audio/manifest.json',{cache:'no-store'});
        if(r.ok)manifest=await r.json();
      }catch(e){manifest=null;}
      manifestLoaded=true;
      return manifest;
    })();
    return loadingManifest;
  }
  async function keyFor(text){
    await loadManifest();
    const {clips,aliases}=resolveMap();
    const t=norm(text);
    if(clips[t])return t;
    if(aliases[t]&&clips[aliases[t]])return aliases[t];
    return null;
  }
  async function probe(k){
    if(k in available)return available[k];
    if(location.protocol==='file:'){available[k]=false;return false;}
    await loadManifest();
    const {clips}=resolveMap();
    if(!clips[k]){available[k]=false;return false;}
    try{const r=await fetch(clips[k],{method:'HEAD',cache:'no-store'});available[k]=r.ok;}catch(e){available[k]=false;}
    return available[k];
  }
  async function play(text,opts={}){
    const k=await keyFor(text); if(!k||!(await probe(k)))return false;
    const {clips}=resolveMap();
    return new Promise(resolve=>{
      const a=new Audio(clips[k]); a.preload='auto'; a.preservesPitch=true; a.mozPreservesPitch=true; a.webkitPreservesPitch=true;
      a.volume=typeof opts.volume==='number'?opts.volume:1;
      a.playbackRate=Math.max(.78,Math.min(1,opts.playbackRate||.92));
      let started=false;
      a.onplay=()=>{started=true;if(opts.onStart)opts.onStart();};
      a.onended=()=>{if(opts.onEnd)opts.onEnd();resolve(true);};
      a.onerror=()=>{if(started&&opts.onEnd)opts.onEnd();resolve(false);};
      a.play().catch(()=>resolve(false));
    });
  }
  async function probeAll(){
    await loadManifest();
    const {clips}=resolveMap();
    const keys=Object.keys(clips);
    const results=[];
    for(const k of keys)results.push([k,await probe(k)]);
    return results;
  }
  function describe(){
    const {clips}=resolveMap();
    const ready=Object.keys(available).filter(k=>available[k]);
    return {catalog:Object.keys(clips),localReady:ready,manifestLoaded,manifestMeta:(manifest&&manifest.meta)||null};
  }
  window.EmiliaAudioBank={play,describe,keyFor,probeAll,loadManifest};
})();
