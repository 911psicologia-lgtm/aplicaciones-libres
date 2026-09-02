(function(){
  const shapes={
    m:[[.18,.2],[.18,.8],[.18,.48],[.38,.34],[.5,.5],[.62,.34],[.82,.48],[.82,.8]],
    p:[[.25,.82],[.25,.2],[.25,.34],[.55,.24],[.75,.36],[.58,.5],[.25,.48]],
    s:[[.75,.27],[.58,.18],[.32,.24],[.24,.39],[.42,.49],[.67,.54],[.76,.68],[.61,.82],[.34,.82],[.22,.72]],
    l:[[.38,.18],[.38,.76],[.7,.76]],
    n:[[.2,.8],[.2,.25],[.2,.48],[.42,.32],[.62,.46],[.62,.8]],
    t:[[.5,.18],[.5,.82],[.28,.36],[.72,.36]],
    d:[[.7,.2],[.7,.82],[.7,.48],[.48,.32],[.27,.46],[.27,.68],[.48,.8],[.7,.7]]
  };
  function point(e,canvas){const r=canvas.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top};}
  function start(canvas,letter,onComplete){
    const pts=shapes[String(letter).toLowerCase()]||shapes.m,ctx=canvas.getContext('2d');let drawing=false,samples=[],allSamples=[],done=false;const dpr=Math.max(1,window.devicePixelRatio||1);
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);drawGuide();}
    function drawGuide(){const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(87,167,115,.22)';ctx.lineWidth=26;ctx.beginPath();pts.forEach((p,i)=>{const x=p[0]*r.width,y=p[1]*r.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.strokeStyle='rgba(33,52,74,.22)';ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.stroke();ctx.setLineDash([]);redrawUser();}
    function redrawUser(){if(allSamples.length<2)return;ctx.strokeStyle='#57a773';ctx.lineWidth=16;ctx.lineCap='round';ctx.lineJoin='round';for(const stroke of allSamples){if(stroke.length<2)continue;ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
    function begin(e){if(done)return;drawing=true;samples=[point(e,canvas)];e.preventDefault();}
    function move(e){if(!drawing||done)return;const p=point(e,canvas),prev=samples[samples.length-1];samples.push(p);ctx.strokeStyle='#57a773';ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault();}
    function end(){if(!drawing||done)return;drawing=false;allSamples.push(samples.slice());const flat=allSamples.flat(),r=canvas.getBoundingClientRect();let close=0;for(const gp of pts){const gx=gp[0]*r.width,gy=gp[1]*r.height;let best=Infinity;for(const p of flat)best=Math.min(best,Math.hypot(p.x-gx,p.y-gy));if(best<46)close++;}const coverage=close/pts.length;if(flat.length>10&&coverage>=.58){done=true;onComplete&&onComplete(coverage);} }
    canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);resize();window.addEventListener('resize',resize,{once:true});return{reset(){done=false;samples=[];allSamples=[];drawGuide();}};
  }

  function startWord(canvas,word,onComplete){
    const ctx=canvas.getContext('2d'),dpr=Math.max(1,window.devicePixelRatio||1),clean=String(word||'').toUpperCase();let drawing=false,stroke=[],strokes=[],done=false,guide=[];
    function layout(){const r=canvas.getBoundingClientRect(),size=Math.max(50,Math.min(105,r.width/(Math.max(4,clean.length)*.7)));return{r,size,font:`900 ${size}px system-ui, -apple-system, sans-serif`};}
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);buildGuide();draw();}
    function buildGuide(){const {r,size,font}=layout(),off=document.createElement('canvas'),o=off.getContext('2d');off.width=Math.ceil(r.width);off.height=Math.ceil(r.height);o.font=font;o.textAlign='center';o.textBaseline='middle';o.lineWidth=Math.max(14,size*.18);o.strokeStyle='#000';o.strokeText(clean,r.width/2,r.height/2);const data=o.getImageData(0,0,off.width,off.height).data;guide=[];const step=12;for(let y=4;y<off.height;y+=step)for(let x=4;x<off.width;x+=step)if(data[(y*off.width+x)*4+3]>30)guide.push({x,y});}
    function draw(){const {r,size,font}=layout();ctx.clearRect(0,0,r.width,r.height);ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='rgba(87,167,115,.22)';ctx.lineWidth=Math.max(18,size*.2);ctx.strokeText(clean,r.width/2,r.height/2);ctx.strokeStyle='rgba(33,52,74,.18)';ctx.lineWidth=2;ctx.setLineDash([4,7]);ctx.strokeText(clean,r.width/2,r.height/2);ctx.setLineDash([]);ctx.strokeStyle='#57a773';ctx.lineWidth=14;for(const s of strokes){if(s.length<2)continue;ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
    function begin(e){if(done)return;drawing=true;stroke=[point(e,canvas)];e.preventDefault();}
    function move(e){if(!drawing||done)return;const p=point(e,canvas),prev=stroke[stroke.length-1];stroke.push(p);ctx.strokeStyle='#57a773';ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault();}
    function end(){if(!drawing||done)return;drawing=false;strokes.push(stroke.slice());const flat=strokes.flat();if(flat.length<18)return;let covered=0;for(const g of guide){let near=false;for(let i=0;i<flat.length;i+=2){if(Math.hypot(flat[i].x-g.x,flat[i].y-g.y)<30){near=true;break;}}if(near)covered++;}const ratio=guide.length?covered/guide.length:0;const xs=flat.map(p=>p.x),r=canvas.getBoundingClientRect(),span=(Math.max(...xs)-Math.min(...xs))/Math.max(1,r.width);if(ratio>=.28&&span>=.55){done=true;onComplete&&onComplete(ratio);} }
    canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);resize();window.addEventListener('resize',resize,{once:true});return{reset(){done=false;stroke=[];strokes=[];draw();}};
  }
  window.EmiliaTracing={start,startWord};
})();
