import { Track } from '../types';
import { audioEngine } from './audio-engine';

export function updateMediaSession(track: Track, artworkUrl?: string): void {
  if (!('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist || 'Desconocido',
    album: track.album || '',
    artwork: artworkUrl
      ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }]
      : [],
  });
}

export function updatePositionState(): void {
  if (!navigator.mediaSession.setPositionState) return;

  try {
    const duration = audioEngine.getDuration();
    const currentTime = audioEngine.getCurrentTime();

    if (duration > 0) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: audioEngine.getPlaybackRate(),
        position: Math.min(currentTime, duration),
      });
    }
  } catch {
    // Ignore position state errors
  }
}

export function setupMediaSessionHandlers(handlers: {
  onPlay?: () => void;
  onPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSeekForward?: (seconds?: number) => void;
  onSeekBackward?: (seconds?: number) => void;
  onStop?: () => void;
  onSeekTo?: (details: any) => void;
}): () => void {
  if (!('mediaSession' in navigator)) {
    return () => {};
  }

  const actions: Array<MediaSessionAction> = [
    'play',
    'pause',
    'previoustrack',
    'nexttrack',
    'seekbackward',
    'seekforward',
    'seekto',
    'stop',
  ];

  navigator.mediaSession.setActionHandler('play', handlers.onPlay ?? null);
  navigator.mediaSession.setActionHandler('pause', handlers.onPause ?? null);
  navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious ?? null);
  navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext ?? null);
  navigator.mediaSession.setActionHandler('seekbackward', (details) =>
    handlers.onSeekBackward?.(details.seekOffset || 10)
  );
  navigator.mediaSession.setActionHandler('seekforward', (details) =>
    handlers.onSeekForward?.(details.seekOffset || 10)
  );
  navigator.mediaSession.setActionHandler('seekto', (details) =>
    handlers.onSeekTo?.(details)
  );
  navigator.mediaSession.setActionHandler('stop', handlers.onStop ?? null);

  return () => {
    for (const action of actions) {
      navigator.mediaSession.setActionHandler(action, null);
    }
  };
}
