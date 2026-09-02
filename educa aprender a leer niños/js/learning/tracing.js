(function(){
  // Cada letra se define por tramos independientes. El orden de los tramos NO importa.
  // La actividad es práctica grafomotora, no una prueba de caligrafía.
  const shapes={
    m:[
      [[.22,.80],[.22,.22]],
      [[.22,.22],[.50,.54]],
      [[.50,.54],[.78,.22]],
      [[.78,.22],[.78,.80]]
    ],
    p:[
      [[.30,.82],[.30,.20]],
      [[.30,.22],[.56,.22],[.72,.30],[.72,.41],[.58,.50],[.30,.50]]
    ],
    s:[
      [[.74,.27],[.60,.20],[.38,.21],[.26,.31],[.28,.43],[.45,.50],[.64,.53],[.75,.63],[.70,.75],[.54,.82],[.34,.80],[.24,.72]]
    ],
    l:[
      [[.36,.20],[.36,.78]],
      [[.36,.78],[.72,.78]]
    ],
    n:[
      [[.22,.80],[.22,.22]],
      [[.22,.22],[.76,.80]],
      [[.76,.80],[.76,.22]]
    ],
    t:[
      [[.50,.20],[.50,.82]],
      [[.27,.34],[.73,.34]]
    ],
    d:[
      [[.28,.80],[.28,.20]],
      [[.28,.20],[.52,.20],[.70,.30],[.76,.48],[.70,.66],[.52,.80],[.28,.80]]
    ]
  };

  function pointFromClient(clientX,clientY,canvas){
    const r=canvas.getBoundingClientRect();
    return{x:clientX-r.left,y:clientY-r.top};
  }
  function pointsFromEvent(e,canvas){
    const evs=(e.getCoalescedEvents&&e.getCoalescedEvents().length)?e.getCoalescedEvents():[e];
    return evs.map(ev=>pointFromClient(ev.clientX,ev.clientY,canvas));
  }
  function strokeLength(strokes){
    let total=0;
    for(const s of strokes)for(let i=1;i<s.length;i++)total+=Math.hypot(s[i].x-s[i-1].x,s[i].y-s[i-1].y);
    return total;
  }
  function polylineDots(segment,r,spacing=30){
    const px=segment.map(p=>({x:p[0]*r.width,y:p[1]*r.height})),out=[];
    for(let i=1;i<px.length;i++){
      const a=px[i-1],b=px[i],len=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),steps=Math.max(1,Math.ceil(len/spacing));
      for(let j=0;j<steps;j++){
        const t=j/steps;out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
      }
    }
    out.push(px[px.length-1]);
    return out;
  }
  function drawPath(ctx,segment,r){
    ctx.beginPath();segment.forEach((p,i)=>{const x=p[0]*r.width,y=p[1]*r.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
  }

  function start(canvas,letter,onComplete,onProgress){
    const segs=shapes[String(letter).toLowerCase()]||shapes.m,ctx=canvas.getContext('2d');
    let drawing=false,current=[],strokes=[],done=false,dots=[];
    const dpr=Math.max(1,window.devicePixelRatio||1);

    function resize(){
      const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);rebuildDots();draw();
    }
    function rebuildDots(){
      const r=canvas.getBoundingClientRect();dots=segs.map(seg=>polylineDots(seg,r,Math.max(24,Math.min(36,r.width*.085))));
    }
    function draw(){
      const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';ctx.lineJoin='round';
      // Camino muy suave: guía, no “zona para rellenar”.
      ctx.strokeStyle='rgba(87,167,115,.16)';ctx.lineWidth=Math.max(18,Math.min(28,r.width*.075));
      segs.forEach(seg=>drawPath(ctx,seg,r));
      // Puntos para unir. El primero de cada tramo es dorado; el resto, verde suave.
      dots.forEach(ds=>ds.forEach((d,i)=>{
        ctx.beginPath();ctx.arc(d.x,d.y,i===0?7:5,0,Math.PI*2);ctx.fillStyle=i===0?'rgba(239,183,70,.95)':'rgba(87,167,115,.44)';ctx.fill();
        ctx.beginPath();ctx.arc(d.x,d.y,i===0?3.2:2.2,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fill();
      }));
      redrawUser();
    }
    function redrawUser(){
      ctx.strokeStyle='#4fa66d';ctx.lineWidth=18;ctx.lineCap='round';ctx.lineJoin='round';
      for(const s of strokes){if(s.length<2)continue;ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
    }
    function progress(){
      const flat=strokes.flat(),r=canvas.getBoundingClientRect();
      if(!flat.length)return{coverage:0,segmentCoverage:segs.map(()=>0),path:0,strokes:0,canComplete:false,autoComplete:false};
      const tol=Math.max(42,Math.min(66,r.width*.18));
      const segmentCoverage=dots.map(ds=>{
        let hit=0;for(const d of ds){let best=Infinity;for(const p of flat){const dist=Math.hypot(p.x-d.x,p.y-d.y);if(dist<best)best=dist;if(best<=tol)break;}if(best<=tol)hit++;}
        return ds.length?hit/ds.length:0;
      });
      const coverage=segmentCoverage.reduce((a,b)=>a+b,0)/Math.max(1,segmentCoverage.length);
      const path=strokeLength(strokes);
      // “Completar” manual aparece tras cualquier intento real. No deja al niño atrapado.
      const canComplete=path>=18||strokes.length>=2||flat.length>=8;
      // Autocompletar sí exige TODOS los tramos esenciales. Evita que D/P se den por hechas con solo el palito.
      const perSegmentMin=segs.length===1?.48:.42;
      const allSegments=segmentCoverage.every(v=>v>=perSegmentMin);
      const autoComplete=allSegments&&coverage>=.52&&(path>=60||flat.length>=18);
      return{coverage,segmentCoverage,path,strokes:strokes.length,canComplete,autoComplete};
    }
    function finish(coverage,meta={}){if(done)return;done=true;onComplete&&onComplete(coverage,meta);}
    function begin(e){
      if(done)return;drawing=true;current=pointsFromEvent(e,canvas);try{canvas.setPointerCapture(e.pointerId);}catch(_){ }e.preventDefault();
    }
    function move(e){
      if(!drawing||done)return;const pts=pointsFromEvent(e,canvas);if(!pts.length)return;
      const sequence=[...current.slice(-1),...pts];ctx.strokeStyle='#4fa66d';ctx.lineWidth=18;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      sequence.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();current.push(...pts);e.preventDefault();
    }
    function end(e){
      if(!drawing||done)return;drawing=false;
      const tail=pointsFromEvent(e,canvas);if(tail.length)current.push(...tail);
      if(current.length)strokes.push(current.slice());current=[];try{canvas.releasePointerCapture(e.pointerId);}catch(_){ }
      const pr=progress();onProgress&&onProgress(pr);if(pr.autoComplete)finish(pr.coverage,{manual:false,segments:pr.segmentCoverage});e.preventDefault();
    }
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({coverage:0,segmentCoverage:segs.map(()=>0),path:0,strokes:0,canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.coverage,{manual:true,segments:pr.segmentCoverage});return true;}return false;},
      progress
    };
  }

  function startWord(canvas,word,onComplete,onProgress){
    const ctx=canvas.getContext('2d'),dpr=Math.max(1,window.devicePixelRatio||1),clean=String(word||'').toLocaleLowerCase('es');
    let drawing=false,current=[],strokes=[],done=false,letters=[];

    function layout(targetCtx){
      const r=canvas.getBoundingClientRect();
      const chars=[...clean],size=Math.max(50,Math.min(100,r.width/(Math.max(4,chars.length)*.78))),font=`800 ${size}px "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif`;
      targetCtx.font=font;const spacing=size*.075,widths=chars.map(ch=>targetCtx.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0)+spacing*Math.max(0,widths.length-1);
      let x=(r.width-total)/2;const y=r.height/2+size*.02;letters=chars.map((ch,i)=>{const item={ch,x0:x,x1:x+widths[i],cx:x+widths[i]/2,y,size};x+=widths[i]+spacing;return item;});
      return{r,chars,size,font,spacing,widths,total,y};
    }
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function draw(){
      const info=layout(ctx),r=info.r;ctx.clearRect(0,0,r.width,r.height);ctx.font=info.font;ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineCap='round';
      // Guía fina y con pequeños puntos por letra; no se pide rellenar el contorno.
      letters.forEach((lt,i)=>{
        ctx.strokeStyle='rgba(87,167,115,.20)';ctx.lineWidth=Math.max(5,info.size*.065);ctx.strokeText(lt.ch,lt.x0,lt.y);
        const dotY=[lt.y-info.size*.28,lt.y,lt.y+info.size*.28];
        dotY.forEach((yy,j)=>{ctx.beginPath();ctx.arc(lt.cx,yy,3.8,0,Math.PI*2);ctx.fillStyle=j===0?'rgba(239,183,70,.72)':'rgba(87,167,115,.38)';ctx.fill();});
      });
      redrawUser();
    }
    function redrawUser(){ctx.strokeStyle='#4fa66d';ctx.lineWidth=17;ctx.lineCap='round';ctx.lineJoin='round';for(const s of strokes){if(s.length<2)continue;ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
    function progress(){
      const flat=strokes.flat(),r=canvas.getBoundingClientRect();if(!flat.length)return{ratio:0,span:0,path:0,strokes:0,letters:[],canComplete:false,autoComplete:false};
      const path=strokeLength(strokes),xs=flat.map(p=>p.x),span=(Math.max(...xs)-Math.min(...xs))/Math.max(1,r.width),tolX=Math.max(18,r.width*.025);
      const letterEvidence=letters.map(lt=>{
        const pts=flat.filter(p=>p.x>=lt.x0-tolX&&p.x<=lt.x1+tolX),ys=pts.map(p=>p.y);if(!pts.length)return 0;
        const ySpan=ys.length>1?(Math.max(...ys)-Math.min(...ys))/Math.max(1,lt.size):0;
        return Math.min(1,(pts.length>=2?.45:.22)+Math.min(.55,ySpan));
      });
      const ratio=letterEvidence.reduce((a,b)=>a+b,0)/Math.max(1,letterEvidence.length),touched=letterEvidence.filter(v=>v>=.28).length;
      // Manual: tras un intento real, sin obligar a “pintar” la palabra.
      const canComplete=(path>=32&&touched>=Math.min(2,letters.length))||span>=.28||strokes.length>=3;
      // Automático: debe haber evidencia en casi todas las letras y desplazamiento a lo largo de la palabra.
      const required=Math.max(1,letters.length-1),autoComplete=touched>=required&&span>=.48&&path>=Math.max(60,r.width*.18);
      return{ratio,span,path,strokes:strokes.length,letters:letterEvidence,canComplete,autoComplete};
    }
    function finish(ratio,manual){if(done)return;done=true;onComplete&&onComplete(ratio,{manual:!!manual,strokes:strokes.length});}
    function begin(e){if(done)return;drawing=true;current=pointsFromEvent(e,canvas);try{canvas.setPointerCapture(e.pointerId);}catch(_){ }e.preventDefault();}
    function move(e){if(!drawing||done)return;const pts=pointsFromEvent(e,canvas);if(!pts.length)return;const seq=[...current.slice(-1),...pts];ctx.strokeStyle='#4fa66d';ctx.lineWidth=17;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();seq.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();current.push(...pts);e.preventDefault();}
    function end(e){if(!drawing||done)return;drawing=false;const tail=pointsFromEvent(e,canvas);if(tail.length)current.push(...tail);if(current.length)strokes.push(current.slice());current=[];try{canvas.releasePointerCapture(e.pointerId);}catch(_){ }const pr=progress();onProgress&&onProgress(pr);if(pr.autoComplete)finish(pr.ratio,false);e.preventDefault();}
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({ratio:0,span:0,path:0,strokes:0,letters:[],canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.ratio,true);return true;}return false;},
      progress
    };
  }
  window.EmiliaTracing={start,startWord};
})();
