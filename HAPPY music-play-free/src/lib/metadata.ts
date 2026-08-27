import { parseBuffer } from 'music-metadata-browser';
import type { Track, TrackCategory } from '../types';
import { AUDIO_EXTENSIONS, AUDIO_MIME_TYPES } from '../types';

function generateId(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  const hex = (hash >>> 0).toString(16);
  return hex || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export function getFormatFromName(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === name.length - 1) return 'unknown';
  return name.slice(dotIndex + 1).toLowerCase();
}

export function classifyTrack(track: Track, folderPath: string, fileName: string): TrackCategory {
  const lowerPath = folderPath.toLowerCase();

  if (lowerPath.includes('whatsapp')) return 'whatsapp';
  if (lowerPath.includes('podcast')) return 'podcasts';
  if (track.artist && track.album && (track.genre || track.trackNumber)) return 'music';
  if (track.duration < 5) return 'recordings';
  if (track.duration > 600) return 'podcasts';
  if (track.artist || track.album) return 'music';

  return 'audio';
}

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  const ext = getFormatFromName(file.name);
  return (AUDIO_EXTENSIONS as Set<string>).has(ext);
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || Number.isNaN(seconds)) return '0:00';
  const totalSeconds = Math.floor(seconds);
  if (totalSeconds >= 3600) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(1) + ' GB';
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB';
  return (bytes / 1_024).toFixed(1) + ' KB';
}

export function cleanupCoverUrl(url: string | null): void {
  if (url !== null) {
    URL.revokeObjectURL(url);
  }
}

export async function parseAudioMetadata(file: File, filePath: string, folderPath: string): Promise<Track> {
  const rawId = `${folderPath}::${file.name}::${file.size}`;
  const id = generateId(rawId);
  const format = getFormatFromName(file.name);
  const defaultTitle = file.name.replace(/\.[^.]+$/, '');

  const track: Track = {
    id,
    title: defaultTitle,
    artist: '',
    album: '',
    genre: '',
    year: '',
    trackNumber: '',
    duration: 0,
    bitrate: undefined,
    format,
    coverUrl: null,
    coverBlob: null,
    filePath,
    folderPath,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'audio/unknown',
    category: 'audio',
    dateAdded: Date.now(),
    playCount: 0,
    lastPlayed: 0,
    isFavorite: false,
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const metadata = await parseBuffer(uint8, {
      mimeType: file.type || undefined,
    });

    track.title = metadata.common.title || defaultTitle;
    track.artist = metadata.common.artist || '';
    track.album = metadata.common.album || '';
    track.genre = metadata.common.genre?.[0] || '';
    track.year = metadata.common.year?.toString() || '';
    track.trackNumber = metadata.common.track?.no?.toString() || '';
    track.duration = metadata.format.duration || 0;
    track.bitrate = metadata.format.bitrate;

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const data = picture.data as any;
      const blob = new Blob([data], { type: picture.format });
      track.coverBlob = blob;
      track.coverUrl = URL.createObjectURL(blob);
    }
  } catch {
    // Return default track on parse failure
  }

  track.category = classifyTrack(track, folderPath, file.name);

  return track;
}
