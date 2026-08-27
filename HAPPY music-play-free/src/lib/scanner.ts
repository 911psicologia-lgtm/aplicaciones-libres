import { Track, MediaFileHandle, ScanProgress } from '../types';
import { db } from './library';
import { parseAudioMetadata, isAudioFile } from './metadata';

export const supportsDirectoryPicker = 'showDirectoryPicker' in window;

export const supportsFileSystemAccess = 'FileSystemFileHandle' in window;

export const supportsWebkitdirectory = (() => {
  try {
    const input = document.createElement('input');
    return 'webkitdirectory' in input;
  } catch {
    return false;
  }
})();

export async function selectFiles(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus,.flac,.webm';

    input.addEventListener('change', () => {
      resolve(input.files);
    });

    input.addEventListener('cancel', () => {
      resolve(null);
    });

    input.click();
  });
}

export async function selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsDirectoryPicker) return null;

  try {
    return await (window as any).showDirectoryPicker();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return null;
    }
    return null;
  }
}

export async function selectDirectoryFallback(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('webkitdirectory', '');

    input.addEventListener('change', () => {
      resolve(input.files);
    });

    input.addEventListener('cancel', () => {
      resolve(null);
    });

    input.click();
  });
}

interface CollectedFile {
  file: File;
  path: string;
  handle?: FileSystemFileHandle;
}

export async function scanDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (p: ScanProgress) => void,
  signal?: AbortSignal
): Promise<Track[]> {
  const collectedFiles: CollectedFile[] = [];

  async function collectFiles(
    handle: FileSystemDirectoryHandle,
    parentPath: string
  ): Promise<void> {
    for await (const entry of handle.values()) {
      if (signal?.aborted) {
        throw new DOMException('Scan aborted', 'AbortError');
      }

      const entryPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

      if (entry.kind === 'file') {
        const fileHandle = entry as FileSystemFileHandle;
        try {
          const file = await fileHandle.getFile();
          if (isAudioFile(file)) {
            const folderPath = parentPath;
            const filePath = entryPath;
            collectedFiles.push({ file, path: filePath, handle: fileHandle });
          }
        } catch {
          // Skip files that can't be read
        }
      } else if (entry.kind === 'directory') {
        await collectFiles(entry as FileSystemDirectoryHandle, entryPath);
      }

      if (onProgress) {
        onProgress({
          current: collectedFiles.length,
          total: 0,
          currentFile: entryPath,
          cancelled: false,
        });
      }
    }
  }

  await collectFiles(dirHandle, '');

  const tracks: Track[] = [];
  const total = collectedFiles.length;

  for (let i = 0; i < collectedFiles.length; i++) {
    if (signal?.aborted) {
      throw new DOMException('Scan aborted', 'AbortError');
    }

    const { file, path: filePath, handle: fileHandle } = collectedFiles[i];
    const folderPath = filePath.substring(0, filePath.lastIndexOf('/')) || '';

    const track = await parseAudioMetadata(file, filePath, folderPath);
    tracks.push(track);

    await db.addTrack(track);

    if (supportsFileSystemAccess && fileHandle) {
      const mediaHandle: MediaFileHandle = {
        id: track.id,
        handle: fileHandle,
        path: filePath,
        lastVerified: Date.now(),
      };
      await db.saveHandle(mediaHandle);
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentFile: filePath,
        cancelled: false,
      });
    }

    // Yield to the event loop every 10 files
    if (i % 10 === 9) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return tracks;
}

export async function scanFileList(
  files: FileList | File[],
  onProgress?: (p: ScanProgress) => void,
  signal?: AbortSignal
): Promise<Track[]> {
  const tracks: Track[] = [];
  const total = files.length;
  let processed = 0;

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) {
      throw new DOMException('Scan aborted', 'AbortError');
    }

    const file = files[i];

    if (!isAudioFile(file)) {
      continue;
    }

    const relativePath = (file as any).webkitRelativePath || file.name;
    const filePath = relativePath;
    const folderPath = relativePath.includes('/')
      ? relativePath.substring(0, relativePath.lastIndexOf('/'))
      : '';

    const track = await parseAudioMetadata(file, filePath, folderPath);
    tracks.push(track);

    await db.addTrack(track);

    processed++;

    if (onProgress) {
      onProgress({
        current: processed,
        total,
        currentFile: filePath,
        cancelled: false,
      });
    }

    if (processed % 10 === 0) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return tracks;
}

export async function resyncDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (p: ScanProgress) => void,
  signal?: AbortSignal
): Promise<{ added: number; removed: number }> {
  // Scan the directory to get current files
  const currentTracks = await scanDirectoryHandle(dirHandle, onProgress, signal);

  // Get all existing tracks from DB
  const existingTracks = await db.getAllTracks();
  const existingIds = new Set(existingTracks.map((t) => t.id));
  const scannedIds = new Set(currentTracks.map((t) => t.id));

  let added = 0;
  let removed = 0;

  // Count new tracks that were added during scan
  for (const track of currentTracks) {
    if (!existingIds.has(track.id)) {
      added++;
    }
  }

  // Remove tracks that no longer exist in the directory
  for (const track of existingTracks) {
    if (!scannedIds.has(track.id)) {
      await db.removeTrack(track.id);
      removed++;
    }
  }

  return { added, removed };
}
