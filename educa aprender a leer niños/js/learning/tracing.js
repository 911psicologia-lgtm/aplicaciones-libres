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
    ñ:[
      [[.22,.80],[.22,.22]],
      [[.22,.22],[.76,.80]],
      [[.76,.80],[.76,.22]],
      [[.34,.14],[.43,.09],[.53,.14],[.64,.09]]
    ],
    t:[
      [[.50,.20],[.50,.82]],
      [[.27,.34],[.73,.34]]
    ],
    d:[
      [[.28,.80],[.28,.20]],
      [[.28,.20],[.52,.20],[.70,.30],[.76,.48],[.70,.66],[.52,.80],[.28,.80]]
    ],
    r:[
      [[.28,.82],[.28,.20]],
      [[.28,.22],[.55,.22],[.72,.30],[.72,.42],[.56,.50],[.28,.50]],
      [[.50,.50],[.76,.82]]
    ],
    c:[
      [[.76,.30],[.64,.21],[.44,.19],[.29,.27],[.22,.43],[.22,.60],[.31,.74],[.48,.81],[.66,.78],[.76,.70]]
    ],
    b:[
      [[.28,.82],[.28,.20]],
      [[.28,.22],[.53,.22],[.69,.30],[.69,.39],[.55,.48],[.28,.48]],
      [[.28,.48],[.56,.48],[.72,.58],[.70,.70],[.54,.80],[.28,.80]]
    ],
    f:[
      [[.30,.82],[.30,.20]],
      [[.30,.22],[.75,.22]],
      [[.30,.50],[.63,.50]]
    ],
    g:[
      [[.75,.30],[.63,.21],[.44,.19],[.29,.28],[.22,.43],[.23,.61],[.33,.74],[.49,.81],[.67,.77],[.76,.65]],
      [[.76,.65],[.58,.65],[.58,.55]]
    ],
    j:[
      [[.25,.22],[.75,.22]],
      [[.62,.22],[.62,.66],[.57,.77],[.47,.82],[.35,.80],[.26,.72]]
    ],
    h:[
      [[.25,.20],[.25,.82]],
      [[.75,.20],[.75,.82]],
      [[.25,.50],[.75,.50]]
    ],
    v:[
      [[.23,.22],[.50,.82]],
      [[.50,.82],[.77,.22]]
    ],
    y:[
      [[.23,.22],[.50,.50]],
      [[.77,.22],[.50,.50]],
      [[.50,.50],[.50,.82]]
    ],
    z:[
      [[.22,.22],[.78,.22]],
      [[.78,.22],[.22,.80]],
      [[.22,.80],[.78,.80]]
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
  function normalizedInk(strokes,canvas){
    const r=canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);
    return (strokes||[]).filter(s=>s&&s.length).map(st=>st.map(p=>({x:Math.max(0,Math.min(1,p.x/w)),y:Math.max(0,Math.min(1,p.y/h))})));
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
      // Umbral fuerte: indica visualmente que el recorrido ya es suficiente, pero NO cierra la actividad.
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
      const pr=progress();onProgress&&onProgress(pr);e.preventDefault();
    }
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({coverage:0,segmentCoverage:segs.map(()=>0),path:0,strokes:0,canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.coverage,{manual:true,segments:pr.segmentCoverage});return true;}return false;},
      progress
    };
  }

  function startWord(canvas,word,onComplete,onProgress,opts={}){
    const ctx=canvas.getContext('2d'),dpr=Math.max(1,window.devicePixelRatio||1),source=String(word||'').trim(),clean=opts.preserveCase?source:source.toLocaleLowerCase('es');
    let drawing=false,current=[],strokes=[],done=false,letters=[],guide=opts.guide||'full';

    function layout(targetCtx){
      const r=canvas.getBoundingClientRect();
      const chars=[...clean],safePad=Math.max(22,Math.min(42,r.width*.075)),usable=Math.max(150,r.width-safePad*2),mobile=r.width<560,maxSize=mobile?86:100,size=Math.max(44,Math.min(maxSize,usable/(Math.max(4,chars.length)*.82))),font=`800 ${size}px "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif`;
      targetCtx.font=font;const spacing=size*.075,widths=chars.map(ch=>targetCtx.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0)+spacing*Math.max(0,widths.length-1);
      let x=Math.max(safePad,(r.width-total)/2);const y=r.height/2+size*.02;letters=chars.map((ch,i)=>{const item={ch,x0:x,x1:x+widths[i],cx:x+widths[i]/2,y,size};x+=widths[i]+spacing;return item;});
      return{r,chars,size,font,spacing,widths,total,y};
    }
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function draw(){
      const info=layout(ctx),r=info.r;ctx.clearRect(0,0,r.width,r.height);ctx.font=info.font;ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineCap='round';
      // La guía puede disminuir progresivamente: completa, tenue o mínima.
      if(guide==='minimal'){
        ctx.strokeStyle='rgba(87,167,115,.16)';ctx.lineWidth=2;ctx.setLineDash([7,8]);ctx.beginPath();ctx.moveTo(Math.max(16,(r.width-info.total)/2),info.y+info.size*.45);ctx.lineTo(Math.min(r.width-16,(r.width+info.total)/2),info.y+info.size*.45);ctx.stroke();ctx.setLineDash([]);
        letters.forEach((lt,i)=>{ctx.beginPath();ctx.arc(lt.cx,lt.y+info.size*.38,3.5,0,Math.PI*2);ctx.fillStyle=i===0?'rgba(239,183,70,.78)':'rgba(87,167,115,.28)';ctx.fill();});
      }else{
        const strokeAlpha=guide==='faded'?.10:.20,dotAlpha=guide==='faded'?.25:.38;
        letters.forEach((lt,i)=>{
          ctx.strokeStyle=`rgba(87,167,115,${strokeAlpha})`;ctx.lineWidth=Math.max(5,info.size*.065);ctx.strokeText(lt.ch,lt.x0,lt.y);
          const dotY=[lt.y-info.size*.28,lt.y,lt.y+info.size*.28];
          dotY.forEach((yy,j)=>{ctx.beginPath();ctx.arc(lt.cx,yy,3.8,0,Math.PI*2);ctx.fillStyle=j===0?`rgba(239,183,70,${guide==='faded'?.48:.72})`:`rgba(87,167,115,${dotAlpha})`;ctx.fill();});
        });
      }
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
      // Umbral fuerte: evidencia suficiente en casi todas las letras. Solo enciende el check; el niño puede seguir escribiendo.
      const required=Math.max(1,Math.ceil(letters.length*.75)),autoComplete=touched>=required&&span>=.56&&path>=Math.max(70,r.width*.22);
      return{ratio,span,path,strokes:strokes.length,letters:letterEvidence,canComplete,autoComplete};
    }
    function finish(ratio,manual){if(done)return;done=true;onComplete&&onComplete(ratio,{manual:!!manual,strokes:strokes.length});}
    function begin(e){if(done)return;drawing=true;current=pointsFromEvent(e,canvas);try{canvas.setPointerCapture(e.pointerId);}catch(_){ }e.preventDefault();}
    function move(e){if(!drawing||done)return;const pts=pointsFromEvent(e,canvas);if(!pts.length)return;const seq=[...current.slice(-1),...pts];ctx.strokeStyle='#4fa66d';ctx.lineWidth=17;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();seq.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();current.push(...pts);e.preventDefault();}
    function end(e){if(!drawing||done)return;drawing=false;const tail=pointsFromEvent(e,canvas);if(tail.length)current.push(...tail);if(current.length)strokes.push(current.slice());current=[];try{canvas.releasePointerCapture(e.pointerId);}catch(_){ }const pr=progress();onProgress&&onProgress(pr);e.preventDefault();}
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({ratio:0,span:0,path:0,strokes:0,letters:[],canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.ratio,true);return true;}return false;},
      progress,
      exportInk(){return normalizedInk(strokes,canvas);},
      setGuide(next){guide=next||'full';draw();}
    };
  }

  function startSentence(canvas,sentence,onComplete,onProgress,opts={}){
    const ctx=canvas.getContext('2d'),dpr=Math.max(1,window.devicePixelRatio||1);
    const raw=String(sentence||'').trim();
    const clean=raw ? raw.charAt(0).toLocaleUpperCase('es')+raw.slice(1) : '';
    const display=/[.!?]$/.test(clean)?clean:`${clean}.`;
    const words=display.split(/\s+/).filter(Boolean);
    let drawing=false,current=[],strokes=[],done=false,bounds=[],guide=opts.guide||'minimal';

    function layout(){
      const r=canvas.getBoundingClientRect(),maxW=Math.max(120,r.width-34),maxH=Math.max(120,r.height-28);
      let size=Math.max(34,Math.min(74,r.width/Math.max(7,display.length*.67)));
      let font=`800 ${size}px "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif`;
      ctx.font=font;
      let total=ctx.measureText(display).width;
      while(total>maxW&&size>32){size-=2;font=`800 ${size}px "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif`;ctx.font=font;total=ctx.measureText(display).width;}
      const space=ctx.measureText(' ').width,x0=Math.max(16,(r.width-total)/2),y=Math.min(maxH*.62,r.height*.58);
      let x=x0;
      bounds=words.map((w,i)=>{const width=ctx.measureText(w).width,item={word:w,x0:x,x1:x+width,cx:x+width/2,y,size,index:i};x+=width+space;return item;});
      return{r,size,font,total,x0,y};
    }
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,r.width*dpr);canvas.height=Math.max(1,r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function draw(){
      const info=layout(),r=info.r;ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';ctx.lineJoin='round';
      const baseY=info.y+info.size*.48;
      ctx.strokeStyle='rgba(87,167,115,.18)';ctx.lineWidth=2;ctx.setLineDash([8,9]);ctx.beginPath();ctx.moveTo(Math.max(14,info.x0-5),baseY);ctx.lineTo(Math.min(r.width-14,info.x0+info.total+5),baseY);ctx.stroke();ctx.setLineDash([]);
      bounds.forEach((b,i)=>{ctx.beginPath();ctx.arc(b.x0+Math.min(8,b.size*.12),baseY-3,3.8,0,Math.PI*2);ctx.fillStyle=i===0?'rgba(239,183,70,.82)':'rgba(87,167,115,.28)';ctx.fill();});
      if(guide!=='minimal'){
        ctx.font=info.font;ctx.textAlign='left';ctx.textBaseline='middle';
        ctx.strokeStyle=guide==='faded'?'rgba(87,167,115,.14)':'rgba(87,167,115,.22)';
        ctx.lineWidth=Math.max(4,info.size*.055);ctx.strokeText(display,info.x0,info.y);
      }
      redrawUser();
    }
    function redrawUser(){ctx.strokeStyle='#4fa66d';ctx.lineWidth=15;ctx.lineCap='round';ctx.lineJoin='round';for(const s of strokes){if(s.length<2)continue;ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}}
    function progress(){
      const flat=strokes.flat(),r=canvas.getBoundingClientRect();
      if(!flat.length)return{ratio:0,span:0,path:0,strokes:0,words:[],canComplete:false,autoComplete:false};
      const path=strokeLength(strokes),xs=flat.map(p=>p.x),span=(Math.max(...xs)-Math.min(...xs))/Math.max(1,r.width),tolX=Math.max(18,r.width*.018);
      const evidence=bounds.map(b=>{const pts=flat.filter(p=>p.x>=b.x0-tolX&&p.x<=b.x1+tolX),ys=pts.map(p=>p.y);if(!pts.length)return 0;const ySpan=ys.length>1?(Math.max(...ys)-Math.min(...ys))/Math.max(1,b.size):0;return Math.min(1,(pts.length>=3?.5:.24)+Math.min(.5,ySpan));});
      const ratio=evidence.reduce((a,b)=>a+b,0)/Math.max(1,evidence.length),touched=evidence.filter(v=>v>=.3).length,required=Math.max(1,Math.ceil(words.length*.67));
      const canComplete=(path>=80&&touched>=Math.min(2,words.length))||span>=.48||strokes.length>=5;
      const autoComplete=touched>=required&&span>=.62&&path>=Math.max(140,r.width*.32);
      return{ratio,span,path,strokes:strokes.length,words:evidence,canComplete,autoComplete};
    }
    function finish(ratio,manual){if(done)return;done=true;onComplete&&onComplete(ratio,{manual:!!manual,strokes:strokes.length});}
    function begin(e){if(done)return;drawing=true;current=pointsFromEvent(e,canvas);try{canvas.setPointerCapture(e.pointerId);}catch(_){ }e.preventDefault();}
    function move(e){if(!drawing||done)return;const pts=pointsFromEvent(e,canvas);if(!pts.length)return;const seq=[...current.slice(-1),...pts];ctx.strokeStyle='#4fa66d';ctx.lineWidth=15;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();seq.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();current.push(...pts);e.preventDefault();}
    function end(e){if(!drawing||done)return;drawing=false;const tail=pointsFromEvent(e,canvas);if(tail.length)current.push(...tail);if(current.length)strokes.push(current.slice());current=[];try{canvas.releasePointerCapture(e.pointerId);}catch(_){ }const pr=progress();onProgress&&onProgress(pr);e.preventDefault();}
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({ratio:0,span:0,path:0,strokes:0,words:[],canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.ratio,true);return true;}return false;},
      progress,
      exportInk(){return normalizedInk(strokes,canvas);},
      setGuide(next){guide=next||'minimal';draw();}
    };
  }


  // v1.5.0 · Tinta Mágica de Lumi
  // La tinta dorada se recorta con una máscara del glifo: los trazos hechos fuera de la letra
  // no quedan pintados. Es práctica grafomotora, no una prueba de caligrafía.
  function startMagic(canvas,letter,caseMode,onComplete,onProgress){
    const ctx=canvas.getContext('2d'),dpr=Math.max(1,window.devicePixelRatio||1);
    const low=String(letter||'m').toLocaleLowerCase('es');
    const glyph=caseMode==='lower'?low:low.toLocaleUpperCase('es');
    let drawing=false,current=[],strokes=[],done=false,maskCanvas=null,maskCtx=null,maskData=null,layoutInfo=null;

    function makeLayout(targetCtx,r){
      const size=Math.max(150,Math.min(r.height*.78,r.width*.62,300));
      const font=`1000 ${size}px "Trebuchet MS", "Arial Rounded MT Bold", system-ui, sans-serif`;
      targetCtx.font=font;targetCtx.textAlign='center';targetCtx.textBaseline='middle';
      return{r,size,font,x:r.width/2,y:r.height/2+size*.025};
    }
    function buildMask(){
      const r=canvas.getBoundingClientRect();
      maskCanvas=document.createElement('canvas');maskCanvas.width=Math.max(1,Math.round(r.width));maskCanvas.height=Math.max(1,Math.round(r.height));maskCtx=maskCanvas.getContext('2d');
      layoutInfo=makeLayout(maskCtx,r);maskCtx.clearRect(0,0,r.width,r.height);maskCtx.font=layoutInfo.font;maskCtx.textAlign='center';maskCtx.textBaseline='middle';maskCtx.fillStyle='#fff';maskCtx.strokeStyle='#fff';maskCtx.lineJoin='round';maskCtx.lineWidth=Math.max(8,layoutInfo.size*.045);maskCtx.strokeText(glyph,layoutInfo.x,layoutInfo.y);maskCtx.fillText(glyph,layoutInfo.x,layoutInfo.y);
      maskData=maskCtx.getImageData(0,0,maskCanvas.width,maskCanvas.height).data;
    }
    function inside(p){
      if(!maskData||!maskCanvas)return false;const x=Math.max(0,Math.min(maskCanvas.width-1,Math.round(p.x))),y=Math.max(0,Math.min(maskCanvas.height-1,Math.round(p.y)));return maskData[(y*maskCanvas.width+x)*4+3]>32;
    }
    function paintInk(r){
      const ink=document.createElement('canvas');ink.width=Math.max(1,Math.round(r.width));ink.height=Math.max(1,Math.round(r.height));const ic=ink.getContext('2d');
      ic.strokeStyle='#e5b93f';ic.lineWidth=Math.max(24,(layoutInfo&&layoutInfo.size||180)*.10);ic.lineCap='round';ic.lineJoin='round';
      for(const stroke of strokes){if(stroke.length<2)continue;ic.beginPath();stroke.forEach((pt,i)=>i?ic.lineTo(pt.x,pt.y):ic.moveTo(pt.x,pt.y));ic.stroke();}
      if(current.length>1){ic.beginPath();current.forEach((pt,i)=>i?ic.lineTo(pt.x,pt.y):ic.moveTo(pt.x,pt.y));ic.stroke();}
      ic.globalCompositeOperation='destination-in';ic.drawImage(maskCanvas,0,0);ic.globalCompositeOperation='source-over';
      ctx.drawImage(ink,0,0,r.width,r.height);
    }
    function draw(){
      const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);layoutInfo=makeLayout(ctx,r);ctx.font=layoutInfo.font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
      const grad=ctx.createLinearGradient(0,0,r.width,r.height);grad.addColorStop(0,'rgba(255,252,236,.94)');grad.addColorStop(1,'rgba(235,246,239,.94)');ctx.fillStyle=grad;ctx.fillRect(0,0,r.width,r.height);
      ctx.fillStyle='rgba(74,111,88,.10)';ctx.strokeStyle='rgba(87,167,115,.18)';ctx.lineWidth=Math.max(5,layoutInfo.size*.03);ctx.strokeText(glyph,layoutInfo.x,layoutInfo.y);ctx.fillText(glyph,layoutInfo.x,layoutInfo.y);
      paintInk(r);
      ctx.font=`800 ${Math.max(15,layoutInfo.size*.075)}px system-ui, sans-serif`;ctx.fillStyle='rgba(71,91,78,.56)';ctx.textAlign='center';ctx.fillText(caseMode==='lower'?'minúscula':'MAYÚSCULA',r.width/2,r.height-18);
    }
    function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);buildMask();draw();}
    function progress(){
      const flat=strokes.flat(),r=canvas.getBoundingClientRect();if(!flat.length)return{coverage:0,insideRatio:0,path:0,canComplete:false,autoComplete:false};
      const valid=flat.filter(inside),insideRatio=valid.length/Math.max(1,flat.length);let path=0;for(const st of strokes)for(let i=1;i<st.length;i++)if(inside(st[i-1])&&inside(st[i]))path+=Math.hypot(st[i].x-st[i-1].x,st[i].y-st[i-1].y);
      const cols=10,rows=10,occupied=new Set(),available=new Set();
      for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const p={x:(gx+.5)*r.width/cols,y:(gy+.5)*r.height/rows};if(inside(p))available.add(`${gx}:${gy}`);}
      valid.forEach(pt=>{const gx=Math.max(0,Math.min(cols-1,Math.floor(pt.x/r.width*cols))),gy=Math.max(0,Math.min(rows-1,Math.floor(pt.y/r.height*rows)));for(let yy=Math.max(0,gy-1);yy<=Math.min(rows-1,gy+1);yy++)for(let xx=Math.max(0,gx-1);xx<=Math.min(cols-1,gx+1);xx++){const k=`${xx}:${yy}`;if(available.has(k))occupied.add(k);}});
      const coverage=occupied.size/Math.max(1,available.size),canComplete=(path>=55&&coverage>=.12)||(valid.length>=16&&coverage>=.18),autoComplete=path>=95&&coverage>=.28&&insideRatio>=.42;
      return{coverage,insideRatio,path,canComplete,autoComplete};
    }
    function finish(cov,manual){if(done)return;done=true;onComplete&&onComplete(cov,{manual:!!manual,caseMode,glyph});}
    function begin(e){if(done)return;drawing=true;current=pointsFromEvent(e,canvas);try{canvas.setPointerCapture(e.pointerId);}catch(_){}draw();e.preventDefault();}
    function move(e){if(!drawing||done)return;const pts=pointsFromEvent(e,canvas);if(!pts.length)return;current.push(...pts);draw();e.preventDefault();}
    function end(e){if(!drawing||done)return;drawing=false;const tail=pointsFromEvent(e,canvas);if(tail.length)current.push(...tail);if(current.length)strokes.push(current.slice());current=[];try{canvas.releasePointerCapture(e.pointerId);}catch(_){}draw();const pr=progress();onProgress&&onProgress(pr);e.preventDefault();}
    canvas.addEventListener('pointerdown',begin,{passive:false});canvas.addEventListener('pointermove',move,{passive:false});canvas.addEventListener('pointerup',end,{passive:false});canvas.addEventListener('pointercancel',end,{passive:false});
    resize();window.addEventListener('resize',resize,{once:true});
    return{
      reset(){done=false;drawing=false;current=[];strokes=[];draw();onProgress&&onProgress({coverage:0,insideRatio:0,path:0,canComplete:false,autoComplete:false});},
      forceComplete(){const pr=progress();if(pr.canComplete){finish(pr.coverage,true);return true;}return false;},
      progress
    };
  }

  window.EmiliaTracing={start,startWord,startSentence,startMagic};
})();
