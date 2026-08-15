import { escapeHtml, markdownToHtml, plainClean } from './text-tools.js';

function safeName(name='texto-vivo'){
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'texto-vivo';
}

function download(content, filename, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),500);
}

export function exportBackup(projects){
  const payload = {app:'Texto Vivo',version:'1.1.0',exportedAt:new Date().toISOString(),projects};
  download(JSON.stringify(payload,null,2),`texto-vivo-respaldo-${Date.now()}.json`,'application/json;charset=utf-8');
}

function collectSessions(project, session=null){
  if(session) return [session];
  return project.sessions || [];
}

function sessionText(session){
  const transcript = (session.transcript || '').trim();
  if(transcript) return transcript;
  const pages = session.pages || [];
  return pages.map(page => (page.text || '').trim()).filter(Boolean).join('\n\n').trim();
}

export function buildTxt(project, session=null){
  const chunks = [`${project.title}\n`];
  collectSessions(project, session).forEach((s, index)=>{
    const text = plainClean(sessionText(s)).trim();
    if(collectSessions(project, session).length > 1) chunks.push(`\n\n=== ${s.name || `Parte ${index+1}`} ===\n`);
    chunks.push(text || '[sin transcripción]');
  });
  return chunks.join('\n').trim();
}

export function buildHtml(project, session=null){
  const body = collectSessions(project, session).map((s, index)=>{
    const text = sessionText(s) || '[sin transcripción]';
    const heading = collectSessions(project, session).length > 1 ? `<h2>${escapeHtml(s.name || `Parte ${index+1}`)}</h2>` : '';
    return `${heading}<section class="page"><p>${markdownToHtml(text)}</p></section>`;
  }).join('\n');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(project.title)}</title><style>body{font-family:Georgia,'Times New Roman',serif;max-width:850px;margin:40px auto;line-height:1.65;color:#241b16;padding:0 18px}h1,h2{font-family:system-ui,sans-serif}.page{white-space:normal}p{font-size:1.05rem}em{font-style:italic}del{text-decoration:line-through}</style></head><body><h1>${escapeHtml(project.title)}</h1>${body}</body></html>`;
}

export function downloadTxt(project, session=null){download(buildTxt(project,session), `${safeName(project.title)}${session?'-'+safeName(session.name):''}.txt`, 'text/plain;charset=utf-8');}
export function downloadHtml(project, session=null){download(buildHtml(project,session), `${safeName(project.title)}${session?'-'+safeName(session.name):''}.html`, 'text/html;charset=utf-8');}
export function downloadDoc(project, session=null){download(buildHtml(project,session), `${safeName(project.title)}${session?'-'+safeName(session.name):''}.doc`, 'application/msword;charset=utf-8');}
