import { readPublishedStimulus, subscribeToStimulus } from './stimuli.js';

const stage = document.getElementById('stage');
const meta = document.getElementById('meta');
const note = document.getElementById('note');
const fitBtn = document.getElementById('fit-btn');
const fsBtn = document.getElementById('fs-btn');
let fitMode = 'contain';

function renderStimulus(data) {
  if (!data) return;
  meta.textContent = `${data.subtestLabel || 'Subtest'} · ${data.label || ''}`;
  note.className = 'note' + (data.status === 'missing' ? ' warn' : '');
  note.textContent = data.note || (data.status === 'available' ? 'Estímulo sincronizado desde la aplicación principal.' : 'Sin nota adicional.');
  if (data.status === 'available' && data.path) {
    stage.innerHTML = '';
    const img = document.createElement('img');
    img.src = data.path;
    img.alt = data.label || 'Estímulo K-BIT';
    img.style.objectFit = fitMode;
    stage.appendChild(img);
  } else {
    stage.innerHTML = `<div class="empty"><strong>${data.label || 'Estímulo no disponible'}</strong><br><br>${data.note || 'No existe imagen para este reactivo dentro del paquete actual.'}</div>`;
  }
}

fitBtn.addEventListener('click', () => {
  fitMode = fitMode === 'contain' ? 'scale-down' : 'contain';
  const img = stage.querySelector('img');
  if (img) img.style.objectFit = fitMode;
});
fsBtn.addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch {}
});

subscribeToStimulus(renderStimulus);
renderStimulus(readPublishedStimulus());
