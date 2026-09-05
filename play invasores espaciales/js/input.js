
window.SF = window.SF || {};
SF.Input = class {
  constructor(canvas){
    this.canvas=canvas;this.left=false;this.right=false;this.pointerActive=false;this.pointerX=0;
    this.keys=new Set();
    this.bind();
  }
  bind(){
    addEventListener('keydown',e=>{
      this.keys.add(e.key.toLowerCase());
      if(['arrowleft','arrowright','a','d','p','escape',' '].includes(e.key.toLowerCase())) e.preventDefault();
    });
    addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));
    const point=e=>{
      const r=this.canvas.getBoundingClientRect();
      const t=e.touches?e.touches[0]:e;
      this.pointerX=(t.clientX-r.left)/Math.max(1,r.width);
    };
    this.canvas.addEventListener('pointerdown',e=>{this.pointerActive=true;point(e);});
    this.canvas.addEventListener('pointermove',e=>{if(this.pointerActive)point(e);});
    addEventListener('pointerup',()=>this.pointerActive=false);
    this.canvas.addEventListener('touchstart',e=>{this.pointerActive=true;point(e);},{passive:false});
    this.canvas.addEventListener('touchmove',e=>{if(this.pointerActive)point(e);e.preventDefault();},{passive:false});
    addEventListener('touchend',()=>this.pointerActive=false);
  }
  axis(){
    let x=0;
    if(this.keys.has('arrowleft')||this.keys.has('a')) x-=1;
    if(this.keys.has('arrowright')||this.keys.has('d')) x+=1;
    const gps=navigator.getGamepads?.()||[];
    for(const gp of gps){if(gp&&Math.abs(gp.axes?.[0]||0)>.15)x=gp.axes[0];}
    return Math.max(-1,Math.min(1,x));
  }
  consumePause(){
    const pressed=this.keys.has('p')||this.keys.has('escape');
    if(pressed&&!this._pauseLatch){this._pauseLatch=true;return true;}
    if(!pressed)this._pauseLatch=false;
    return false;
  }
};
