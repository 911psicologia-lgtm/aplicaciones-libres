const DB_NAME='kbit-protocolo-persist';
const STORE='state';
const KEY='main';

function openDB(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){resolve(null);return;}
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
export async function persistMirror(data){
  const db=await openDB(); if(!db)return false;
  return await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(data,KEY);
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);
  });
}
export async function loadMirror(){
  const db=await openDB(); if(!db)return null;
  return await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).get(KEY);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
}
