import { downloadBlob, textFromHtml } from './utils.js';

const REPORT_CSS = `
body{font-family:Arial,sans-serif;color:#1f2b29;line-height:1.55;margin:36px;max-width:900px}.report h1,.report h2{font-family:Georgia,serif}.report h1{font-size:24px;margin-bottom:10px}.report h2{font-size:16px;margin-top:24px;border-bottom:1px solid #ccd2ca;padding-bottom:5px}.report p{margin:7px 0}.report-table{width:100%;border-collapse:collapse;margin:12px 0}.report-table th,.report-table td{border:1px solid #ccd2ca;padding:7px;font-size:12px;text-align:left}.report-table th{background:#eef0e9}.signature{margin-top:36px}`;

function fullHtml(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>${REPORT_CSS}</style></head><body>${body}</body></html>`;
}

export function exportHtml(filename, title, body) {
  downloadBlob(filename, fullHtml(title, body), 'text/html;charset=utf-8');
}

export function exportTxt(filename, body) {
  downloadBlob(filename, textFromHtml(body), 'text/plain;charset=utf-8');
}

export function exportDoc(filename, title, body) {
  const content = `\ufeff${fullHtml(title, body)}`;
  downloadBlob(filename, content, 'application/msword');
}

export function printPdf(title, body) {
  const w = window.open('', '_blank');
  if (!w) { alert('El navegador bloqueó la ventana de impresión. Habilita ventanas emergentes para exportar a PDF.'); return; }
  try { w.opener = null; } catch {}
  w.document.open();
  w.document.write(fullHtml(title, body));
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 250);
}
