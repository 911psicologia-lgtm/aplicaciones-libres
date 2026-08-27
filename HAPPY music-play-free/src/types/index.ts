export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  duration: number;
  trackNumber: string;
  coverUrl: string | null;
  coverBlob?: Blob | null;
  fileName: string;
  filePath: string;
  folderPath: string;
  fileSize: number;
  fileType: string;
  bitrate?: number;
  category: TrackCategory;
  dateAdded: number;
  playCount: number;
  lastPlayed: number;
  isFavorite: boolean;
  format: string;
  // For File System Access API
  fileHandle?: FileSystemFileHandle;
}

export type TrackCategory = 'music' | 'audio' | 'recordings' | 'whatsapp' | 'podcasts' | 'other';

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface QueueItem {
  trackId: string;
  addedAt: number;
}

export type RepeatMode = 'off' | 'one' | 'all';
export type ThemeMode = 'system' | 'light' | 'dark';
export type SortField = 'title' | 'artist' | 'album' | 'duration' | 'dateAdded' | 'playCount' | 'fileName' | 'folderPath';
export type SortOrder = 'asc' | 'desc';

export interface AppConfig {
  theme: ThemeMode;
  rememberPosition: boolean;
  continuousPlayback: boolean;
  seekInterval: number;
  firstRun: boolean;
  version: string;
}

export interface PlaybackState {
  currentTrackId: string | null;
  position: number;
  duration: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  playbackRate: number;
}

export interface ScanProgress {
  current: number;
  total: number;
  currentFile: string;
  cancelled: boolean;
}

export interface DuplicateGroup {
  tracks: Track[];
 reason: string;
}

export interface MediaFileHandle {
  id: string;
  handle: FileSystemFileHandle;
  path: string;
  lastVerified: number;
}

export const APP_VERSION = '1.0.0';
export const DB_NAME = 'music-play-free';
export const DB_VERSION = 1;

export const AUDIO_EXTENSIONS = new Set([
  'mp3', 'm4a', 'aac', 'wav', 'ogg', 'opus', 'flac', 'webm',
  'wma', 'aiff', 'ape', 'alac', 'mp4', 'm4b', 'm4p',
]);

export const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/wav', 'audio/ogg',
  'audio/opus', 'audio/flac', 'audio/webm', 'audio/x-m4a',
  'audio/x-mpeg-3', 'audio/x-wav', 'audio/x-flac',
  'audio/mp3', 'audio/x-mp3',
]);

export const DEFAULT_CONFIG: AppConfig = {
  theme: 'system',
  rememberPosition: true,
  continuousPlayback: true,
  seekInterval: 10,
  firstRun: true,
  version: APP_VERSION,
};
