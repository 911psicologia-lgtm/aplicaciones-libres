(function(){
  const shapes={
    m:[[.18,.2],[.18,.8],[.18,.48],[.38,.34],[.5,.5],[.62,.34],[.82,.48],[.82,.8]],
    p:[[.25,.82],[.25,.2],[.25,.34],[.55,.24],[.75,.36],[.58,.5],[.25,.48]],
    s:[[.75,.27],[.58,.18],[.32,.24],[.24,.39],[.42,.49],[.67,.54],[.76,.68],[.61,.82],[.34,.82],[.22,.72]],
    l:[[.38,.18],[.38,.76],[.7,.76]]
  };
  function start(canvas,letter,onComplete){const pts=shapes[letter]||shapes.m,ctx=canvas.getContext('2d');let drawing=false,samples=[],done=false;const dpr=Math.max(1,window.devicePixelRatio||1);function resize(){const r=canvas.getBoundingClientRect();canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);drawGuide();}function drawGuide(){const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(87,167,115,.22)';ctx.lineWidth=26;ctx.beginPath();pts.forEach((p,i)=>{const x=p[0]*r.width,y=p[1]*r.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.strokeStyle='rgba(33,52,74,.22)';ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.stroke();ctx.setLineDash([]);}function pos(e){const r=canvas.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}}function begin(e){if(done)return;drawing=true;samples=[pos(e)];e.preventDefault()}function move(e){if(!drawing||done)return;const p=pos(e),prev=samples[samples.length-1];samples.push(p);ctx.strokeStyle='#57a773';ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}function end(){if(!drawing||done)return;drawing=false;const r=canvas.getBoundingClientRect();let close=0;for(const gp of pts){const gx=gp[0]*r.width,gy=gp[1]*r.height;let best=Infinity;for(const p of samples){best=Math.min(best,Math.hypot(p.x-gx,p.y-gy));}if(best<42)close++;}const coverage=close/pts.length;if(samples.length>8&&coverage>=.62){done=true;onComplete&&onComplete(coverage);}else{setTimeout(drawGuide,450);}}
    canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);resize();window.addEventListener('resize',resize,{once:true});return{reset(){done=false;samples=[];drawGuide();}};
  }
  window.EmiliaTracing={start};
})();
