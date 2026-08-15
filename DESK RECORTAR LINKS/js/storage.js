const LINKS_KEY = 'rizolink.links.v1';
const SETTINGS_KEY = 'rizolink.settings.v1';

export function loadLinks(){
  try { return JSON.parse(localStorage.getItem(LINKS_KEY) || '[]'); }
  catch { return []; }
}
export function saveLinks(links){ localStorage.setItem(LINKS_KEY, JSON.stringify(links)); }
export function loadSettings(){
  try { return { baseDomain:'', apiBase:'', theme:'dark', ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return { baseDomain:'', apiBase:'', theme:'dark' }; }
}
export function saveSettings(settings){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
export function exportState(){ return { exportedAt:new Date().toISOString(), version:'1.0.0', links:loadLinks(), settings:loadSettings() }; }
export function importState(state){
  if(!state || !Array.isArray(state.links)) throw new Error('Archivo no válido para RizoLink.');
  saveLinks(state.links);
  if(state.settings) saveSettings({ ...loadSettings(), ...state.settings });
}
