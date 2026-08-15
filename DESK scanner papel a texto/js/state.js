import { saveDocument, listDocuments, deleteDocument, saveMeta, loadMeta, clearAllDocuments } from './storage.js';

export const VERSION = '1.1.0';
export const state = {
  projects: [],
  activeProjectId: null,
  activeSessionId: null,
  activePageId: null,
  theme: 'light',
  saving: false
};

export function uid(prefix='id'){
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
}

export async function loadState(){
  const meta = loadMeta();
  state.theme = meta.theme || 'light';
  state.activeProjectId = meta.activeProjectId || null;
  state.activeSessionId = meta.activeSessionId || null;
  state.activePageId = meta.activePageId || null;
  state.projects = await listDocuments();
  state.projects = state.projects.map(migrateProject);
  for(const project of state.projects){ await saveDocument(project); }

  if(!state.projects.length){
    const starter = createProjectObject({title:'Proyecto de recuperación'});
    state.projects = [starter];
    state.activeProjectId = starter.id;
    state.activeSessionId = starter.sessions[0].id;
    await saveDocument(starter);
  }
  ensureActivePointers();
  persistMeta();
}

function migrateProject(project){
  const p = {
    version: VERSION,
    id: project.id || uid('project'),
    title: project.title || 'Proyecto sin título',
    type: project.type || 'Documento',
    pagesEstimate: project.pagesEstimate || '',
    description: project.description || '',
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString(),
    sessions: Array.isArray(project.sessions) && project.sessions.length ? project.sessions : [{id:uid('session'),name:'Parte 1',createdAt:new Date().toISOString(),pages:[],transcript:''}]
  };
  p.sessions = p.sessions.map((s, i)=>({
    id: s.id || uid('session'),
    name: i === 0 ? 'Parte 1' : (s.name || `Parte ${i+1}`),
    createdAt: s.createdAt || new Date().toISOString(),
    transcript: s.transcript || '',
    pages: Array.isArray(s.pages) ? s.pages.map((pg, idx)=>({
      id: pg.id || uid('page'),
      number: idx + 1,
      status: pg.status || 'guardada',
      imageData: pg.imageData || null,
      imageMeta: pg.imageMeta || null,
      text: pg.text || '',
      notes: pg.notes || '',
      sideNotes: pg.sideNotes || '',
      crossed: pg.crossed || '',
      createdAt: pg.createdAt || new Date().toISOString(),
      updatedAt: pg.updatedAt || new Date().toISOString()
    })) : []
  }));
  return p;
}

function persistMeta(){
  saveMeta({theme:state.theme,activeProjectId:state.activeProjectId,activeSessionId:state.activeSessionId,activePageId:state.activePageId});
}

export function createProjectObject({title}){
  const sessionId = uid('session');
  return {
    id: uid('project'),
    version: VERSION,
    title: title?.trim() || 'Proyecto sin título',
    type: 'Documento',
    pagesEstimate: '',
    description: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: [{id:sessionId,name:'Parte 1',createdAt:new Date().toISOString(),transcript:'',pages:[]}]
  };
}

export async function addProject(data){
  const project = createProjectObject(data);
  state.projects.unshift(project);
  state.activeProjectId = project.id;
  state.activeSessionId = project.sessions[0].id;
  state.activePageId = null;
  await saveProject(project);
  persistMeta();
  return project;
}

export async function saveProject(project=getActiveProject()){
  if(!project) return;
  project.updatedAt = new Date().toISOString();
  project.version = VERSION;
  state.saving = true;
  await saveDocument(project);
  state.saving = false;
  persistMeta();
}

export function getActiveProject(){return state.projects.find(p=>p.id===state.activeProjectId) || state.projects[0] || null;}
export function getActiveSession(){
  const p = getActiveProject();
  if(!p) return null;
  if(!p.sessions || !p.sessions.length) p.sessions = [{id:uid('session'),name:'Parte 1',createdAt:new Date().toISOString(),transcript:'',pages:[]}];
  return p.sessions.find(s=>s.id===state.activeSessionId) || p.sessions[0] || null;
}
export function getActivePage(){
  const s = getActiveSession();
  if(!s) return null;
  return s.pages.find(pg=>pg.id===state.activePageId) || s.pages[0] || null;
}

export function setActiveProject(id){state.activeProjectId=id; const p=getActiveProject(); state.activeSessionId=p?.sessions[0]?.id||null; state.activePageId=null; persistMeta();}
export function setActiveSession(id){state.activeSessionId=id; const s=getActiveSession(); state.activePageId=s?.pages[0]?.id||null; persistMeta();}
export function setActivePage(id){state.activePageId=id; persistMeta();}
export function setTheme(theme){state.theme=theme; persistMeta();}

export function ensureActivePointers(){
  const p = getActiveProject();
  state.activeProjectId = p?.id || null;
  const s = getActiveSession();
  state.activeSessionId = s?.id || null;
  const pg = getActivePage();
  state.activePageId = pg?.id || null;
}

export async function updateProjectFields(fields){
  const p = getActiveProject(); if(!p) return;
  Object.assign(p, fields);
  await saveProject(p);
}

export async function addSession(name='Parte 1'){
  const p = getActiveProject(); if(!p) return null;
  const session = {id:uid('session'),name,createdAt:new Date().toISOString(),transcript:'',pages:[]};
  p.sessions.push(session);
  state.activeSessionId = session.id;
  state.activePageId = null;
  await saveProject(p);
  return session;
}

export async function updateSessionName(name){
  const p = getActiveProject(); const s = getActiveSession(); if(!p||!s) return;
  s.name = name?.trim() || s.name;
  await saveProject(p);
}

export async function updateSessionTranscript(text){
  const p = getActiveProject(); const s = getActiveSession(); if(!p||!s) return;
  s.transcript = text || '';
  await saveProject(p);
}

export async function addPage({imageData=null,imageMeta=null,text=''}={}){
  const p = getActiveProject(); const s = getActiveSession(); if(!p||!s) return null;
  const page = {id:uid('page'),number:s.pages.length+1,status:'guardada',imageData,imageMeta,text,notes:'',sideNotes:'',crossed:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  s.pages.push(page); state.activePageId = page.id;
  await saveProject(p);
  return page;
}

export async function updatePage(fields){
  const p = getActiveProject(); const pg = getActivePage(); if(!p||!pg) return;
  Object.assign(pg, fields, {updatedAt:new Date().toISOString()});
  await saveProject(p);
}

export async function deleteActivePage(){
  const p = getActiveProject(); const s = getActiveSession(); const pg = getActivePage(); if(!p||!s||!pg) return;
  s.pages = s.pages.filter(x=>x.id!==pg.id).map((x,i)=>({...x,number:i+1}));
  state.activePageId = s.pages[0]?.id || null;
  await saveProject(p);
}

export async function deleteActiveProject(){
  const p = getActiveProject(); if(!p) return;
  await deleteDocument(p.id);
  state.projects = state.projects.filter(x=>x.id!==p.id);
  state.activeProjectId = state.projects[0]?.id || null;
  ensureActivePointers(); persistMeta();
}

export async function importProjects(projects){
  const arr = Array.isArray(projects) ? projects : [projects];
  for(const project of arr){
    if(project && project.id && project.sessions){
      const migrated = migrateProject(project);
      await saveDocument(migrated);
      const idx = state.projects.findIndex(p=>p.id===migrated.id);
      if(idx>=0) state.projects[idx]=migrated; else state.projects.push(migrated);
    }
  }
  ensureActivePointers(); persistMeta();
}

export async function clearLocalData(){
  await clearAllDocuments();
  localStorage.removeItem('texto_vivo_v1_0_meta');
  state.projects=[]; state.activeProjectId=null; state.activeSessionId=null; state.activePageId=null;
}
