export const DB_NAME = 'texto_vivo_v1_0_db';
export const STORE = 'documents';
export const META_KEY = 'texto_vivo_v1_0_meta';

let dbPromise = null;

export function openDB(){
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve,reject)=>{
    const request = indexedDB.open(DB_NAME,1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE,{keyPath:'id'});
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function saveDocument(doc){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(doc);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDocument(id){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function listDocuments(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDocument(id){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllDocuments(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export function saveMeta(meta){
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function loadMeta(){
  try{return JSON.parse(localStorage.getItem(META_KEY)) || {};}
  catch{return {};}
}
