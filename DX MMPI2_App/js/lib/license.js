/* Activación y registro local de aplicaciones. */
const License = {
  STORAGE_KEY: 'mmpi2_license_v1',
  TIER_CODES: Object.freeze({A1:5,A2:10,A3:15,A4:20,A5:25,A6:30,A7:40,A8:50,M0:Infinity}),
  _verified: new Map(),
  _queue: Promise.resolve(),

  _normalize(key) {
    return typeof key==='string' ? key.replace(/[^A-Za-z0-9]/g,'').toUpperCase() : '';
  },

  async verify(key) {
    const clean=this._normalize(key);
    if(!clean)return {valid:false,error:'Ingrese una clave de activación.'};
    if(!/^M2(?:A[1-8]|M0)[A-HJ-NP-Z2-9]{5}[A-F0-9]{5}$/.test(clean)){
      return {valid:false,error:'Revise el formato de la clave: M2-XX-XXXXX-XXXXX.'};
    }
    if(this._verified.has(clean))return this._verified.get(clean);
    if(!window.crypto?.subtle){
      return {valid:false,error:'Abra la aplicación en HTTPS o localhost para verificar la clave.'};
    }
    try{
      const hash=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(clean));
      const digest=Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
      const tier=clean.slice(2,4);
      if(window.MMPI2LicenseCatalog?.[digest]!==tier){
        return {valid:false,error:'La clave no pertenece al lote de activación de esta versión.'};
      }
      const maxUses=this.TIER_CODES[tier];
      const result={valid:true,key:clean,digest,tier,maxUses,isMaster:tier==='M0'};
      this._verified.set(clean,result);
      return result;
    }catch(error){
      return {valid:false,error:'No se pudo verificar la clave en este navegador.'};
    }
  },

  _read(){
    const raw=localStorage.getItem(this.STORAGE_KEY);
    if(!raw)return {version:2,key:null,usage:{}};
    const value=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('El registro de licencias no es válido.');
    return value;
  },

  _write(state){localStorage.setItem(this.STORAGE_KEY,JSON.stringify(state));},

  _withLock(operation){
    const locks=window.navigator?.locks;
    if(locks?.request)return locks.request('mmpi2-licencia',operation);
    const next=this._queue.then(operation);
    this._queue=next.catch(()=>{});
    return next;
  },

  _asV2(state){
    if(state.version===2){
      if(!state.usage||typeof state.usage!=='object'||Array.isArray(state.usage))throw new Error('El historial de aplicaciones no es válido.');
      return state;
    }
    const verified=this._verified.get(this._normalize(state.key));
    const usage={};
    if(verified){
      const previous=Number.isInteger(state.used)&&state.used>=0?Math.min(state.used,verified.maxUses):0;
      usage[verified.digest]={previous:verified.isMaster?0:previous,cases:[],activatedAt:state.activatedAt||null};
    }
    return {version:2,key:verified?.key||null,usage};
  },

  async initialize(){
    return this._withLock(async()=>{
      const state=this._read();
      if(state.key){
        const checked=await this.verify(state.key);
        if(!checked.valid)return {active:false,error:checked.error};
      }
      const current=this._asV2(state);
      if(state.version!==2)this._write(current);
      return this._status(current);
    });
  },

  _status(state){
    const verified=this._verified.get(this._normalize(state.key));
    if(!verified)return {active:false};
    const usage=state.usage[verified.digest];
    if(!usage||!Array.isArray(usage.cases))return {active:false,error:'No se pudo leer el saldo de la clave.'};
    const prior=Number.isInteger(usage.previous)&&usage.previous>=0?usage.previous:0;
    const cases=Array.isArray(usage.cases)?new Set(usage.cases.filter(id=>typeof id==='string'&&id)) : new Set();
    const used=verified.isMaster?0:Math.min(verified.maxUses,prior+cases.size);
    const remaining=verified.isMaster?Infinity:verified.maxUses-used;
    return {active:true,key:verified.key,tier:verified.tier,maxUses:verified.maxUses,used,remaining,
      isMaster:verified.isMaster,exhausted:remaining===0,activatedAt:usage.activatedAt||null};
  },

  getStatus(){
    try{return this._status(this._asV2(this._read()));}
    catch(error){return {active:false,error:'No se pudo leer la licencia local.'};}
  },

  async activate(key){
    const verified=await this.verify(key);
    if(!verified.valid)return {ok:false,error:verified.error};
    try{
      return await this._withLock(async()=>{
        const stored=this._read();
        if(stored.version!==2&&stored.key)await this.verify(stored.key);
        const state=this._asV2(stored);
        const prior=state.usage[verified.digest];
        state.key=verified.key;
        state.usage[verified.digest]=prior||{previous:0,cases:[],activatedAt:new Date().toISOString()};
        this._write(state);
        return {ok:true,license:this._status(state)};
      });
    }catch(error){return {ok:false,error:'No se pudo guardar la licencia en este navegador.'};}
  },

  hasReceipt(caseId,state){
    const current=state||this._asV2(this._read());
    return Object.values(current.usage).some(usage=>Array.isArray(usage?.cases)&&usage.cases.includes(caseId));
  },

  async complete(caseData,storage){
    return this._withLock(async()=>{
      const raw=this._read();
      if(raw.key)await this.verify(raw.key);
      const state=this._asV2(raw);
      const license=this._status(state);
      if(!license.active)return {ok:false,error:'Active la aplicación con una clave válida.'};
      const existing=storage.getCase(caseData.id);
      const alreadyCompleted=Boolean(existing?.results&&existing.completedAt);
      if(license.isMaster||alreadyCompleted||this.hasReceipt(caseData.id,state)){
        storage.saveCaseNow(caseData);
        return {ok:true,...license};
      }
      if(license.exhausted)return {ok:false,error:'Aplicaciones agotadas. Ingrese otra clave para procesar este caso.'};

      const digest=this._verified.get(license.key).digest;
      const usage=state.usage[digest];
      const next={...state,usage:{...state.usage,[digest]:{...usage,cases:[...usage.cases,caseData.id]}}};
      this._write(next);
      try{storage.saveCaseNow(caseData);}
      catch(error){
        try{this._write(state);}catch(rollbackError){/* El mismo caso conserva su reserva si falla la reversión. */}
        throw error;
      }
      return {ok:true,...this._status(next)};
    });
  },

  isBlocked(screen,caseData){
    const lic=this.getStatus();
    if(!lic.active)return {blocked:true,reason:'no-license'};
    if(lic.exhausted&&(screen==='case'||screen==='capture')){
      const revising=caseData?.results&&caseData.completedAt;
      let reserved=false;
      try{reserved=Boolean(caseData?.id&&this.hasReceipt(caseData.id));}catch(error){}
      if(!revising&&!reserved)return {blocked:true,reason:'exhausted'};
    }
    return {blocked:false,remaining:lic.remaining,isMaster:lic.isMaster};
  },

  async deactivate(){
    return this._withLock(()=>{
      const state=this._asV2(this._read());
      this._write({...state,key:null});
    });
  },

  tierLabel(tier){
    const quota=this.TIER_CODES[tier];
    return tier==='M0'?'Plan Master (ilimitado)':quota?'Plan '+quota+' aplicaciones':'Plan desconocido';
  },

  format(key){
    const clean=this._normalize(key);
    return clean.length===14?[clean.slice(0,2),clean.slice(2,4),clean.slice(4,9),clean.slice(9)].join('-'):key;
  }
};
window.License=License;
