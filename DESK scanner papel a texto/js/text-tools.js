export function cleanRecoveredText(raw=''){
  const normalized = raw.replace(/\r/g,'').replace(/[ \t]+\n/g,'\n');
  const blocks = normalized.split(/\n{2,}/).map(block => {
    const lines = block.split('\n').map(x=>x.trim()).filter(Boolean);
    let out = '';
    lines.forEach((line, index)=>{
      if(index === 0){ out = line; return; }
      const prev = out.slice(-1);
      const isDialogue = /^[-—–]/.test(line);
      const prevEndsSentence = /[.!?:;»)”]$/.test(prev);
      const prevHyphen = /-$/.test(out);
      if(prevHyphen){ out = out.slice(0,-1) + line; }
      else if(isDialogue || prevEndsSentence){ out += '\n' + line; }
      else { out += ' ' + line; }
    });
    return out;
  });
  return blocks.join('\n\n').replace(/[ \t]{2,}/g,' ').trim();
}

export function wrapSelection(textarea, before='*', after='*'){
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  if(start === end){
    textarea.value = value.slice(0,start) + before + after + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + before.length;
  } else {
    textarea.value = value.slice(0,start) + before + value.slice(start,end) + after + value.slice(end);
    textarea.selectionStart = start;
    textarea.selectionEnd = end + before.length + after.length;
  }
  textarea.focus();
}

export function escapeHtml(str=''){
  return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

export function markdownToHtml(str=''){
  const escaped = escapeHtml(str);
  return escaped
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/~~([^~]+)~~/g,'<del>$1</del>')
    .replace(/\n{2,}/g,'</p><p>')
    .replace(/\n/g,'<br>');
}

export function plainClean(str=''){
  return str.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\*([^*]+)\*/g,'$1').replace(/~~([^~]+)~~/g,'$1');
}
