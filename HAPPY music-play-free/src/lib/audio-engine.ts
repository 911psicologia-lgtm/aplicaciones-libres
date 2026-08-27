export class AudioEngine {
  private audio: HTMLAudioElement;
  private currentObjectUrl: string | null = null;
  private _listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.audio = new Audio();

    this.audio.addEventListener('play', () => this.emit('play'));
    this.audio.addEventListener('pause', () => this.emit('pause'));
    this.audio.addEventListener('ended', () => this.emit('ended'));
    this.audio.addEventListener('timeupdate', () =>
      this.emit('timeupdate', { currentTime: this.audio.currentTime, duration: this.audio.duration }),
    );
    this.audio.addEventListener('loadedmetadata', () =>
      this.emit('loadedmetadata', { duration: this.audio.duration }),
    );
    this.audio.addEventListener('durationchange', () =>
      this.emit('durationchange', { duration: this.audio.duration }),
    );
    this.audio.addEventListener('error', () =>
      this.emit('error', { error: this.audio.error }),
    );
    this.audio.addEventListener('stalled', () =>
      console.warn('AudioEngine: playback stalled'),
    );
    this.audio.addEventListener('waiting', () => this.emit('statechange'));
    this.audio.addEventListener('playing', () => this.emit('statechange'));
  }

  async loadFromFile(file: File | Blob, position?: number): Promise<void> {
    // Revoke previous object URL
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    const objectUrl = URL.createObjectURL(file);
    this.currentObjectUrl = objectUrl;

    this.audio.src = objectUrl;
    this.audio.load();

    if (position !== undefined && position > 0) {
      this.audio.currentTime = position;
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('AudioEngine: loadFromFile timed out after 30s'));
      }, 30_000);

      const onCanPlay = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error('AudioEngine: failed to load audio file'));
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.audio.removeEventListener('canplay', onCanPlay);
        this.audio.removeEventListener('error', onError);
      };

      this.audio.addEventListener('canplay', onCanPlay, { once: true });
      this.audio.addEventListener('error', onError, { once: true });
    });
  }

  play(): Promise<void> {
    return this.audio.play().catch((err: DOMException) => {
      console.warn('AudioEngine: play() failed', err.message);
    });
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seek(time: number): void {
    const duration = this.audio.duration || 0;
    this.audio.currentTime = Math.max(0, Math.min(time, duration));
  }

  seekForward(seconds: number): void {
    this.seek(this.audio.currentTime + seconds);
  }

  seekBackward(seconds: number): void {
    this.seek(this.audio.currentTime - seconds);
  }

  setVolume(vol: number): void {
    this.audio.volume = Math.max(0, Math.min(vol, 1));
  }

  getVolume(): number {
    return this.audio.volume;
  }

  toggleMute(): boolean {
    this.audio.muted = !this.audio.muted;
    return this.audio.muted;
  }

  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.5, Math.min(rate, 3));
  }

  getPlaybackRate(): number {
    return this.audio.playbackRate;
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  getBuffered(): number {
    if (this.audio.buffered.length === 0) return 0;
    return this.audio.buffered.end(this.audio.buffered.length - 1);
  }

  on(event: string, fn: Function): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: Function): void {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(fn);
      if (set.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  emit(event: string, data?: any): void {
    const set = this._listeners.get(event);
    if (set) {
      for (const fn of set) {
        fn(data);
      }
    }
  }

  destroy(): void {
    this.audio.pause();
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
    this.audio.src = '';
    this._listeners.clear();
  }
}

export const audioEngine = new AudioEngine();
