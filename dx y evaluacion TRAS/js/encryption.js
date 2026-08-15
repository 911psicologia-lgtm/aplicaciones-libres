/* ============================================================
   TRAS · encryption.js
   Cifrado local OPCIONAL (AES-GCM 256 + PBKDF2) para los datos que
   quedan en reposo en localStorage. Diseño de minimo riesgo:

   - El flujo normal de guardado (persist(), usado en decenas de
     lugares de la app) NO cambia: siempre escribe primero el estado
     en texto plano, exactamente como antes de este modulo existir.
   - Si el cifrado esta activo, un temporizador con antirrebote
     (debounce, 400 ms) reemplaza esa copia en texto plano por un
     sobre cifrado, usando el estado mas reciente en ese momento.
   - Esto significa que, con el cifrado activo, lo que queda en el
     disco del usuario esta cifrado casi todo el tiempo, con una
     ventana breve en texto plano inmediatamente despues de cada
     guardado. Es una limitacion real y se comunica asi al usuario;
     no se presenta como un cifrado instantaneo o infalible.
   - La clave de cifrado (CryptoKey) vive solo en memoria durante la
     pestaña abierta; nunca se guarda en localStorage ni se envia a
     ningun servidor. Si se cierra la pestaña sin haber desbloqueado
     de nuevo, hay que volver a ingresar la frase clave.
   - Sin la frase clave correcta, los datos cifrados NO se pueden
     recuperar. Esto se advierte explicitamente antes de activar.
   ============================================================ */

const ENC_ITERATIONS = 150000;
let _encKey = null;      // CryptoKey en memoria; dura solo la sesion de pestaña
let _encSaltB64 = null;  // sal en base64 (no es secreta)
let _encTimer = null;

function _b64FromBytes(bytes) {
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function _bytesFromB64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function _deriveKey(passphrase, saltBytes) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: ENC_ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

function isEncryptedEnvelope(raw) {
  try { const p = JSON.parse(raw); return !!(p && p.__trasEncrypted); }
  catch (_) { return false; }
}

async function _encryptString(plain) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, _encKey, enc.encode(plain));
  return { __trasEncrypted: true, v: 1, salt: _encSaltB64, iv: _b64FromBytes(iv), data: _b64FromBytes(new Uint8Array(cipher)) };
}

async function _decryptEnvelope(envelope, key) {
  const iv = _bytesFromB64(envelope.iv);
  const data = _bytesFromB64(envelope.data);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plainBuf);
}

/* Se llama despues de cada persist() en texto plano. Si el cifrado esta
   activo, reemplaza el contenido de localStorage por la version cifrada,
   con antirrebote para no cifrar en cada tecla. */
function scheduleEncryptedRewrite() {
  if (!_encKey) return;
  clearTimeout(_encTimer);
  _encTimer = setTimeout(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || isEncryptedEnvelope(raw)) return;
      const envelope = await _encryptString(raw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch (e) { console.error('No se pudo cifrar el guardado local:', e); }
  }, 400);
}

/* Pide la frase clave y desbloquea un caso ya cifrado. Devuelve el JSON en
   texto plano si tuvo exito, o null si el usuario cancelo o la frase fue
   incorrecta. Nunca borra ni sobrescribe el sobre cifrado ante un fallo. */
async function unlockLocalEncryption(envelope) {
  const pass = window.prompt('Los casos de TRAS en este navegador estan protegidos con una frase clave. Ingresala para continuar:');
  if (pass === null) return null;
  try {
    const salt = _bytesFromB64(envelope.salt);
    const key = await _deriveKey(pass, salt);
    const plain = await _decryptEnvelope(envelope, key);
    _encKey = key; _encSaltB64 = envelope.salt;
    return plain;
  } catch (e) {
    alert('La frase clave no es correcta o el dato esta dañado. Tus casos siguen cifrados y a salvo; recarga la app para reintentar.');
    return null;
  }
}

/* Activa o desactiva el cifrado local. Se llama desde el boton del menu
   "Aplicación completa y datos". */
async function toggleLocalEncryption() {
  const btn = document.getElementById('encryptionToggleBtn');
  if (_encKey) {
    if (!confirm('Esto quitara el cifrado local: los casos quedaran guardados en texto plano en este navegador. ¿Continuar?')) return;
    _encKey = null; _encSaltB64 = null;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.error(e); }
    if (btn) btn.textContent = 'Activar cifrado local';
    toast('Cifrado local desactivado. Los casos quedan en texto plano en este navegador.', 'info', 5000);
    return;
  }
  const pass1 = window.prompt('Crea una frase clave para cifrar los casos guardados en este navegador.\nSi la olvidas, los datos NO se pueden recuperar.');
  if (pass1 === null || !pass1.trim()) return;
  const pass2 = window.prompt('Repite la frase clave para confirmarla:');
  if (pass2 !== pass1) { toast('Las frases clave no coinciden. El cifrado no se activo.', 'warn', 4500); return; }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  _encSaltB64 = _b64FromBytes(salt);
  _encKey = await _deriveKey(pass1, salt);
  scheduleEncryptedRewrite();
  if (btn) btn.textContent = 'Desactivar cifrado local';
  toast('Cifrado local activado. Guarda tu frase clave en un lugar seguro: sin ella no hay forma de recuperar los casos.', 'ok', 7000);
}

/* Deja el modulo en su estado inicial (usado por "Borrar todos los datos"). */
function resetLocalEncryptionSession() {
  _encKey = null; _encSaltB64 = null; clearTimeout(_encTimer);
  const btn = document.getElementById('encryptionToggleBtn');
  if (btn) btn.textContent = 'Activar cifrado local';
}
