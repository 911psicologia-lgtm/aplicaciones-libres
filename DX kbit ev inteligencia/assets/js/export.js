import { downloadBlob, textFromHtml } from './utils.js';

const REPORT_CSS = `
:root{--ink:#1f2b29;--muted:#5e6966;--line:#cbd1c7;--paper:#f5f7f3;--accent:#2f6459;--accent-soft:#dfeae5;--warm:#f5efe4}
*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:var(--ink);line-height:1.55;margin:36px auto;max-width:980px;padding:0 24px}.report h1,.report h2,.report h3{font-family:Georgia,serif}.report h1{font-size:26px;margin:4px 0 8px}.report h2{font-size:16px;margin-top:25px;border-bottom:1px solid var(--line);padding-bottom:5px}.report h3{font-size:14px;margin:16px 0 5px}.report p{margin:7px 0}.report ul{margin:8px 0;padding-left:22px}.report li{margin:5px 0}.report-kicker{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);font-weight:700}.report-subtitle{color:var(--muted);margin-top:0}.report-cover{padding-bottom:16px;border-bottom:2px solid var(--accent)}.report-meta-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:15px}.report-meta-grid>div{border:1px solid var(--line);padding:8px;border-radius:5px;background:#fff}.report-meta-grid span{display:block;font-size:10px;color:var(--muted);text-transform:uppercase}.report-meta-grid strong{display:block;font-size:12px;margin-top:2px}.report-data-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0 16px}.report-table{width:100%;border-collapse:collapse;margin:12px 0}.report-table th,.report-table td{border:1px solid var(--line);padding:7px;font-size:11px;text-align:left}.report-table th{background:var(--paper)}.report-table .num{text-align:center}.report-table.compact{max-width:640px}.report-note,.rp-note{font-size:10.5px;color:var(--muted)}.report-profile{border:1px solid var(--line);padding:16px;border-radius:7px;background:#fff}.rp-scale{display:flex;justify-content:space-between;margin:0 48px 6px 125px;font-size:9px;color:var(--muted)}.report-profile-row{display:grid;grid-template-columns:115px 1fr 42px;gap:10px;align-items:center;margin:12px 0}.rp-label{font-size:11px}.rp-value{font-weight:700;text-align:center}.rp-track{height:18px;background:linear-gradient(to right,#f5f7f3,#fff);border:1px solid var(--line);position:relative;border-radius:4px;overflow:hidden}.rp-mean{position:absolute;left:50%;top:0;bottom:0;width:1px;background:#6e7b77}.rp-ic{position:absolute;top:5px;height:7px;background:var(--accent-soft);border:1px solid var(--accent);border-radius:4px}.rp-marker{position:absolute;top:1px;bottom:1px;width:3px;background:var(--accent);transform:translateX(-1px)}.signature{margin-top:36px}.signature p{margin:5px 0}
@media(max-width:700px){.report-meta-grid,.report-data-grid{grid-template-columns:1fr}.results-table{font-size:9px}.results-table th,.results-table td{padding:4px}.rp-scale{margin-left:85px}.report-profile-row{grid-template-columns:75px 1fr 34px}}
@media print{body{margin:0;max-width:none;padding:0 12mm}.report h2{break-after:avoid}.report-table,.report-profile{break-inside:avoid}.report-cover{break-inside:avoid}}
`;

function fullHtml(title, body) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${REPORT_CSS}</style></head><body>${body}</body></html>`;
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
  setTimeout(() => w.print(), 350);
}
