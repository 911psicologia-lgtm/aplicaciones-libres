const newId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export class SessionStore {
  constructor() {
    this.items = [];
    this.listeners = new Set();
  }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach(fn => fn(this.items)); }
  add(item) { this.items.push(item); this.emit(); }
  addMany(items) { this.items.push(...items); this.emit(); }
  remove(id) {
    const index = this.items.findIndex(i => i.id === id);
    if (index >= 0) {
      const [removed] = this.items.splice(index, 1);
      if (removed?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(removed.previewUrl);
      this.emit();
    }
  }
  move(id, direction) {
    const index = this.items.findIndex(i => i.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= this.items.length) return;
    [this.items[index], this.items[target]] = [this.items[target], this.items[index]];
    this.emit();
  }
  reorder(sourceId, targetId) {
    if (sourceId === targetId) return;
    const from = this.items.findIndex(i => i.id === sourceId);
    const to = this.items.findIndex(i => i.id === targetId);
    if (from < 0 || to < 0) return;
    const [item] = this.items.splice(from, 1);
    this.items.splice(to, 0, item);
    this.emit();
  }
  rotate(id, delta = 90) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.rotation = ((item.rotation || 0) + delta + 360) % 360;
    this.emit();
  }
  duplicate(id) {
    const index = this.items.findIndex(i => i.id === id);
    if (index < 0) return;
    const source = this.items[index];
    const copy = { ...source, id: newId(), name: source.name.replace(/(\.[^.]+)?$/, ' · copia$1') };
    if (source.kind === 'image' && source.file) copy.previewUrl = URL.createObjectURL(source.file);
    if (source.kind === 'pdf-page' && source.previewBlob) copy.previewUrl = URL.createObjectURL(source.previewBlob);
    this.items.splice(index + 1, 0, copy);
    this.emit();
  }
  clear() {
    this.items.forEach(i => { if (i.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(i.previewUrl); });
    this.items = [];
    this.emit();
  }
  get totalBytes() { return this.items.reduce((sum, item) => sum + (item.size || 0), 0); }
}
