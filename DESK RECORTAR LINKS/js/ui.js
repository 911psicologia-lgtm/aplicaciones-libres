import { $, $$ } from './helpers.js';
let toastTimer;
export function toast(message){
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 2600);
}
export function setActiveTab(name){
  $$('.tab,.bottom-item').forEach(btn=>btn.classList.toggle('active', btn.dataset.tab === name));
  $$('.tab-panel').forEach(panel=>panel.classList.toggle('active', panel.id === `tab-${name}`));
  if(name === 'library') $('#searchLinks')?.focus({preventScroll:true});
}
export function bindTabs(){
  $$('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>setActiveTab(btn.dataset.tab)));
  $$('[data-tab-jump]').forEach(btn=>btn.addEventListener('click',()=>setActiveTab(btn.dataset.tabJump)));
}
