export const STIMULUS_STATE_KEY = 'kbit-current-stimulus-v1';
const CHANNEL_NAME = 'kbit-stimulus';
let channel = null;
try { channel = new BroadcastChannel(CHANNEL_NAME); } catch {}

export async function loadStimuli() {
  const res = await fetch('./data/stimuli-manifest.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`No se pudo cargar el manifiesto de estímulos (${res.status}).`);
  return await res.json();
}

export function getItemStimulus(manifest, subtestKey, itemNumber) {
  return manifest?.subtests?.[subtestKey]?.items?.[String(itemNumber)] || null;
}

export function getSubtestExamples(manifest, subtestKey) {
  return manifest?.subtests?.[subtestKey]?.examples || [];
}

export function publishStimulus(state) {
  const payload = { ...state, _ts: Date.now() };
  try { localStorage.setItem(STIMULUS_STATE_KEY, JSON.stringify(payload)); } catch {}
  try { channel?.postMessage(payload); } catch {}
}

export function readPublishedStimulus() {
  try { return JSON.parse(localStorage.getItem(STIMULUS_STATE_KEY) || 'null'); }
  catch { return null; }
}

export function subscribeToStimulus(callback) {
  if (channel) channel.onmessage = (event) => callback(event.data);
  window.addEventListener('storage', (event) => {
    if (event.key !== STIMULUS_STATE_KEY || !event.newValue) return;
    try { callback(JSON.parse(event.newValue)); } catch {}
  });
}
