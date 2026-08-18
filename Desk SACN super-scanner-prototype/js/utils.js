export const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}

export function extOf(name = '') {
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

export function isPdf(file) {
  return file.type === 'application/pdf' || extOf(file.name) === 'pdf';
}

export function isImage(file) {
  return ['image/jpeg','image/png','image/webp'].includes(file.type) || ['jpg','jpeg','png','webp'].includes(extOf(file.name));
}

export async function fileToItem(file, source = 'archivo') {
  const kind = isPdf(file) ? 'pdf' : isImage(file) ? 'image' : 'unsupported';
  return {
    id: uid(), file, kind, source,
    name: file.name || `captura-${Date.now()}.jpg`,
    size: file.size || 0,
    pageCount: null,
    encrypted: false,
    rotation: 0,
    previewUrl: kind === 'image' ? URL.createObjectURL(file) : null
  };
}

export function sanitizeFileName(value = 'super-scanner') {
  return value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').slice(0, 90) || 'super-scanner';
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1800);
}
