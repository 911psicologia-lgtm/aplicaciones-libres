import { Signal, signal } from '@preact/signals';
import { Track, Playlist, QueueItem, RepeatMode, PlaybackState } from '../types';
import { db } from './library';
import { audioEngine } from './audio-engine';
import { updateMediaSession, updatePositionState, setupMediaSessionHandlers } from './media-session';

export interface PlayerState {
  currentTrack: Signal<Track | null>;
  isPlaying: Signal<boolean>;
  currentTime: Signal<number>;
  duration: Signal<number>;
  shuffle: Signal<boolean>;
  repeat: Signal<RepeatMode>;
  volume: Signal<number>;
  playbackRate: Signal<number>;
  queue: Signal<QueueItem[]>;
  playlistContext: Signal<string | null>; // playlist id or 'library', 'recent', 'favorites', 'search'
  contextTracks: Signal<Track[]>;
}

const playerState: PlayerState = {
  currentTrack: signal(null),
  isPlaying: signal(false),
  currentTime: signal(0),
  duration: signal(0),
  shuffle: signal(false),
  repeat: signal<RepeatMode>('off'),
  volume: signal(1),
  playbackRate: signal(1),
  queue: signal([]),
  playlistContext: signal(null),
  contextTracks: signal([]),
};

let shuffleHistory: string[] = [];
let shuffleIndex = -1;
let cleanupMediaSession: (() => void) | null = null;
let positionUpdateInterval: ReturnType<typeof setInterval> | null = null;
let currentFileRef: File | Blob | null = null;
let wakeLockSentinel: WakeLockSentinel | null = null;

function requestWakeLock() {
  if ('wakeLock' in navigator) {
    (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => {
      wakeLockSentinel = lock;
    }).catch(() => {});
  }
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    wakeLockSentinel.release();
    wakeLockSentinel = null;
  }
}

function startPositionUpdates() {
  if (positionUpdateInterval) return;
  positionUpdateInterval = setInterval(() => {
    if (audioEngine.isPlaying()) {
      playerState.currentTime.value = audioEngine.getCurrentTime();
      updatePositionState();
    }
  }, 250);
}

function stopPositionUpdates() {
  if (positionUpdateInterval) {
    clearInterval(positionUpdateInterval);
    positionUpdateInterval = null;
  }
}

export async function initPlayer() {
  await db.init();

  // Restore state
  const savedState = await db.getPlaybackState();
  if (savedState) {
    playerState.shuffle.value = savedState.shuffle;
    playerState.repeat.value = savedState.repeat;
    playerState.volume.value = savedState.volume;
    playerState.playbackRate.value = savedState.playbackRate;
    audioEngine.setVolume(savedState.volume);
    audioEngine.setPlaybackRate(savedState.playbackRate);
  }

  const savedQueue = await db.getQueue();
  playerState.queue.value = savedQueue;

  // Audio engine events
  audioEngine.on('play', () => {
    playerState.isPlaying.value = true;
    requestWakeLock();
    startPositionUpdates();
  });

  audioEngine.on('pause', () => {
    playerState.isPlaying.value = false;
    releaseWakeLock();
  });

  audioEngine.on('timeupdate', (data: any) => {
    playerState.currentTime.value = data.currentTime;
  });

  audioEngine.on('loadedmetadata', (data: any) => {
    playerState.duration.value = data.duration;
  });

  audioEngine.on('durationchange', (data: any) => {
    playerState.duration.value = data.duration;
  });

  audioEngine.on('error', (data: any) => {
    console.error('Audio error:', data.error);
    playerState.isPlaying.value = false;
    releaseWakeLock();
  });

  audioEngine.on('ended', () => {
    handleTrackEnded();
  });

  // Media Session
  cleanupMediaSession = setupMediaSessionHandlers({
    onPlay: () => play(),
    onPause: () => pause(),
    onPrevious: () => playPrevious(),
    onNext: () => playNext(),
    onSeekForward: (s) => audioEngine.seekForward(s || 10),
    onSeekBackward: (s) => audioEngine.seekBackward(s || 10),
    onStop: () => { pause(); audioEngine.seek(0); },
    onSeekTo: (details) => audioEngine.seek(details.seekTime),
  });
}

async function getFileForTrack(track: Track): Promise<File | Blob | null> {
  // Try File System Access API handle first
  if ('FileSystemFileHandle' in window) {
    const handle = await db.getHandle(track.id);
    if (handle) {
      const h = handle.handle as any;
    try {
      const perm = await h.queryPermission({ mode: 'read' });
      if (perm === 'granted') {
        return await h.getFile();
      }
      const req = await h.requestPermission({ mode: 'read' });
      if (req === 'granted') {
        return await h.getFile();
      }
      } catch (e) {
        console.warn('Handle access failed:', e);
      }
    }
  }
  return null;
}

export async function playTrack(track: Track, contextTracks?: Track[], contextId?: string) {
  // Stop current
  audioEngine.pause();

  // Set context
  if (contextTracks) {
    playerState.contextTracks.value = contextTracks;
  }
  if (contextId) {
    playerState.playlistContext.value = contextId;
  }

  const file = await getFileForTrack(track);
  if (!file) {
    console.error('Cannot get file for track:', track.title);
    return;
  }

  currentFileRef = file;
  playerState.currentTrack.value = track;

  try {
    await audioEngine.loadFromFile(file);
    await audioEngine.play();

    // Update media session
    const artworkUrl = track.coverUrl || undefined;
    updateMediaSession(track, artworkUrl);

    // Update play count
    await db.incrementPlayCount(track.id);
    await db.updateTrack(track.id, { lastPlayed: Date.now() });

    // Save state
    savePlaybackState();
  } catch (e) {
    console.error('Playback failed:', e);
  }
}

export function play() {
  audioEngine.play();
}

export function pause() {
  audioEngine.pause();
}

export function togglePlay() {
  if (audioEngine.isPlaying()) {
    pause();
  } else {
    play();
  }
}

async function handleTrackEnded() {
  playerState.isPlaying.value = false;
  releaseWakeLock();
  stopPositionUpdates();

  const repeat = playerState.repeat.value;

  if (repeat === 'one') {
    audioEngine.seek(0);
    await audioEngine.play();
    return;
  }

  // Check queue first
  const queue = [...playerState.queue.value];
  if (queue.length > 0) {
    const nextItem = queue.shift()!;
    playerState.queue.value = queue;
    await db.setQueue(queue);

    const nextTrack = await db.getTrack(nextItem.trackId);
    if (nextTrack) {
      await playTrack(nextTrack);
    }
    return;
  }

  // Play next in context
  const next = getNextContextTrack();
  if (next) {
    await playTrack(next);
  } else if (repeat === 'all') {
    const tracks = playerState.contextTracks.value;
    if (tracks.length > 0) {
      shuffleHistory = [];
      shuffleIndex = -1;
      await playTrack(tracks[0]);
    }
  } else {
    playerState.isPlaying.value = false;
  }
}

function getNextContextTrack(): Track | null {
  const tracks = playerState.contextTracks.value;
  const current = playerState.currentTrack.value;
  if (!current || tracks.length === 0) return null;

  if (playerState.shuffle.value) {
    // Move to next in shuffle history or pick new
    if (shuffleIndex < shuffleHistory.length - 1) {
      shuffleIndex++;
      const nextId = shuffleHistory[shuffleIndex];
      return tracks.find(t => t.id === nextId) || null;
    }
    // Pick random, excluding current
    const others = tracks.filter(t => t.id !== current.id && !shuffleHistory.includes(t.id));
    if (others.length === 0) return null;
    const random = others[Math.floor(Math.random() * others.length)];
    shuffleHistory.push(random.id);
    shuffleIndex = shuffleHistory.length - 1;
    return random;
  }

  const idx = tracks.findIndex(t => t.id === current.id);
  if (idx < 0 || idx >= tracks.length - 1) return null;
  return tracks[idx + 1];
}

function getPreviousContextTrack(): Track | null {
  const tracks = playerState.contextTracks.value;
  const current = playerState.currentTrack.value;
  if (!current || tracks.length === 0) return null;

  if (playerState.shuffle.value) {
    if (shuffleIndex > 0) {
      shuffleIndex--;
      const prevId = shuffleHistory[shuffleIndex];
      return tracks.find(t => t.id === prevId) || null;
    }
    return current;
  }

  // If more than 3 seconds in, restart current track
  if (audioEngine.getCurrentTime() > 3) {
    audioEngine.seek(0);
    return null;
  }

  const idx = tracks.findIndex(t => t.id === current.id);
  if (idx <= 0) return null;
  return tracks[idx - 1];
}

export async function playNext() {
  // Check queue
  const queue = [...playerState.queue.value];
  if (queue.length > 0) {
    const nextItem = queue.shift()!;
    playerState.queue.value = queue;
    await db.setQueue(queue);
    const nextTrack = await db.getTrack(nextItem.trackId);
    if (nextTrack) await playTrack(nextTrack);
    return;
  }
  const next = getNextContextTrack();
  if (next) await playTrack(next);
}

export async function playPrevious() {
  const prev = getPreviousContextTrack();
  if (prev) await playTrack(prev);
}

export function seek(time: number) {
  audioEngine.seek(time);
}

export function seekForward() {
  const interval = 10; // Could be from config
  audioEngine.seekForward(interval);
}

export function seekBackward() {
  const interval = 10;
  audioEngine.seekBackward(interval);
}

export function setVolume(vol: number) {
  playerState.volume.value = vol;
  audioEngine.setVolume(vol);
  savePlaybackState();
}

export function toggleMute(): boolean {
  return audioEngine.toggleMute();
}

export function setPlaybackRate(rate: number) {
  playerState.playbackRate.value = rate;
  audioEngine.setPlaybackRate(rate);
  savePlaybackState();
}

export function toggleShuffle() {
  playerState.shuffle.value = !playerState.shuffle.value;
  if (playerState.shuffle.value) {
    shuffleHistory = [];
    shuffleIndex = -1;
  }
  savePlaybackState();
}

export function cycleRepeat() {
  const modes: RepeatMode[] = ['off', 'all', 'one'];
  const current = playerState.repeat.value;
  const idx = modes.indexOf(current);
  playerState.repeat.value = modes[(idx + 1) % modes.length];
  savePlaybackState();
}

export async function addToQueue(trackId: string, position: 'next' | 'end' = 'end') {
  const item: QueueItem = { trackId, addedAt: Date.now() };
  const queue = [...playerState.queue.value];

  if (position === 'next') {
    // Add after current if playing
    queue.splice(1, 0, item);
  } else {
    queue.push(item);
  }

  playerState.queue.value = queue;
  await db.setQueue(queue);
}

export async function removeFromQueue(trackId: string) {
  const queue = playerState.queue.value.filter(i => i.trackId !== trackId);
  playerState.queue.value = queue;
  await db.setQueue(queue);
}

export async function clearQueue() {
  playerState.queue.value = [];
  await db.clearQueue();
}

export async function reorderQueue(trackIds: string[]) {
  const existingMap = new Map(playerState.queue.value.map(i => [i.trackId, i]));
  const reordered: QueueItem[] = trackIds.map(id => existingMap.get(id)).filter(Boolean) as QueueItem[];
  playerState.queue.value = reordered;
  await db.reorderQueue(trackIds);
}

async function savePlaybackState() {
  const track = playerState.currentTrack.value;
  await db.savePlaybackState({
    currentTrackId: track?.id || null,
    position: audioEngine.getCurrentTime(),
    duration: playerState.duration.value,
    isPlaying: audioEngine.isPlaying(),
    shuffle: playerState.shuffle.value,
    repeat: playerState.repeat.value,
    volume: playerState.volume.value,
    playbackRate: playerState.playbackRate.value,
  });
}

export async function toggleFavorite(trackId: string) {
  await db.toggleFavorite(trackId);
  const current = playerState.currentTrack.value;
  if (current && current.id === trackId) {
    const updated = await db.getTrack(trackId);
    if (updated) playerState.currentTrack.value = { ...updated };
  }
}

export { playerState };

// Auto-save position periodically
setInterval(() => {
  if (playerState.currentTrack.value) {
    savePlaybackState();
  }
}, 5000);

// Save on page hide
document.addEventListener('visibilitychange', () => {
  if (document.hidden) savePlaybackState();
});

window.addEventListener('beforeunload', () => {
  savePlaybackState();
  stopPositionUpdates();
  releaseWakeLock();
  cleanupMediaSession?.();
});
