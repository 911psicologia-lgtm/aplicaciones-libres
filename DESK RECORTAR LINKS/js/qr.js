export function makeQr(target, text, size=240){
  target.innerHTML = '';
  if(!text) return;
  if(window.QRCode){
    new QRCode(target, { text, width:Number(size), height:Number(size), correctLevel: QRCode.CorrectLevel.H });
  } else {
    const fallback = document.createElement('div');
    fallback.style.cssText = `width:${size}px;height:${size}px;display:grid;place-items:center;text-align:center;border:1px dashed currentColor;padding:1rem;border-radius:18px`;
    fallback.textContent = 'No se pudo cargar el generador QR. Revisa tu conexión.';
    target.appendChild(fallback);
  }
}
export function downloadQr(container, filename='rizolink-qr.png'){
  const canvas = container.querySelector('canvas');
  const img = container.querySelector('img');
  let dataUrl = '';
  if(canvas) dataUrl = canvas.toDataURL('image/png');
  else if(img) dataUrl = img.src;
  if(!dataUrl) throw new Error('Primero genera un QR.');
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
}
