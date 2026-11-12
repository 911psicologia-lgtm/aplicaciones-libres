/* Estado opcional del tercer informe. No modifica puntuaciones ni consumo de licencia. */
const LegalBriefStore={
  SCHEMA:1,
  empty(){return {schema:1,workflow:'auto-case-v2',request:{question:'',recipient:'',purpose:'',notes:'',additionalIdentifiers:'',includeIdentity:false},
    options:{chronology:false,comparison:true,questions:false,appendix:false},sources:[],document:null,prepared:null,review:null};},
  read(c){
    const raw=c?.legalBrief;
    if(!raw)return this.empty();
    if(typeof raw!=='object'||Array.isArray(raw)||raw.schema!==this.SCHEMA)throw new Error('La versión del documento para el abogado no es compatible. Conserve su copia de seguridad.');
    LegalBriefSources.validateSources(raw.sources||[]);
    const initial=this.empty();
    return {...initial,...JSON.parse(JSON.stringify(raw)),request:{...initial.request,...raw.request},options:{...initial.options,...raw.options}};
  },
  save(caseId,state){
    LegalBriefSources.validateSources(state.sources||[]);
    if(JSON.stringify(state).length>900000)throw new Error('El documento y sus fuentes superan el tamaño admitido. Reduzca los extractos o descargue una copia del trabajo.');
    Storage.flush();
    if(Storage._savePending)throw new Error('Hay cambios del caso pendientes de guardar. Resuelva el aviso de almacenamiento antes de continuar.');
    const list=Storage.getAllCases(),index=list.findIndex(c=>c.id===caseId);
    if(index<0)throw new Error('El caso ya no está guardado. Regrese a la gestión de casos.');
    const next={...list[index],legalBrief:JSON.parse(JSON.stringify({...state,schema:this.SCHEMA})),updatedAt:new Date().toISOString()};
    list[index]=next;
    const keys=Storage.KEYS,beforeCases=localStorage.getItem(keys.CASES),beforeCurrent=localStorage.getItem(keys.CURRENT_CASE);
    const updateCurrent=Storage.getCurrentCase()?.id===caseId;
    const rawCases=JSON.stringify(list),rawCurrent=JSON.stringify(next);
    try{
      if(updateCurrent)localStorage.setItem(keys.CURRENT_CASE,rawCurrent);
      localStorage.setItem(keys.CASES,rawCases);
    }catch(error){
      // Quitar primero la copia nueva libera el espacio necesario para restaurar las anteriores.
      try{if(updateCurrent){localStorage.removeItem(keys.CURRENT_CASE);if(beforeCurrent!=null)localStorage.setItem(keys.CURRENT_CASE,beforeCurrent);}}catch{}
      try{if(localStorage.getItem(keys.CASES)!==beforeCases){localStorage.removeItem(keys.CASES);if(beforeCases!=null)localStorage.setItem(keys.CASES,beforeCases);}}catch{}
      throw error;
    }
    if(updateCurrent)Storage._currentOverride=null;Storage.lastSavedAt=new Date();
    document.dispatchEvent(new CustomEvent('storage:saved',{detail:{id:caseId,at:Storage.lastSavedAt}}));
    return next;
  }
};
window.LegalBriefStore=LegalBriefStore;
