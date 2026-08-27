import { openDB } from 'idb';
import {
  Track,
  TrackCategory,
  Playlist,
  QueueItem,
  MediaFileHandle,
  PlaybackState,
  DB_NAME,
  DB_VERSION,
} from '../types';

const STORES = {
  tracks: 'tracks',
  playlists: 'playlists',
  queue: 'queue',
  handles: 'handles',
  config: 'config',
} as const;

export class LibraryDB {
  private db: any = null;

  // ------------------------------------------------------------------
  // Initialization
  // ------------------------------------------------------------------

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tracks store
        if (!db.objectStoreNames.contains(STORES.tracks)) {
          db.createObjectStore(STORES.tracks, { keyPath: 'id' });
        }

        // Playlists store
        if (!db.objectStoreNames.contains(STORES.playlists)) {
          db.createObjectStore(STORES.playlists, { keyPath: 'id' });
        }

        // Queue store
        if (!db.objectStoreNames.contains(STORES.queue)) {
          db.createObjectStore(STORES.queue, { keyPath: 'trackId' });
        }

        // Handles store (File System Access API)
        if (!db.objectStoreNames.contains(STORES.handles)) {
          db.createObjectStore(STORES.handles, { keyPath: 'id' });
        }

        // Config key-value store
        if (!db.objectStoreNames.contains(STORES.config)) {
          db.createObjectStore(STORES.config, { keyPath: 'key' });
        }
      },
      blocked() {
        console.error('[LibraryDB] Database upgrade blocked – close other tabs');
      },
      blocking() {
        console.warn('[LibraryDB] This connection is blocking an upgrade in another tab');
      },
      terminated() {
        console.error('[LibraryDB] Database connection unexpectedly terminated');
        this.db = null;
      },
    });
  }

  private async getDB(): Promise<any> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================================================================
  // TRACKS
  // ==================================================================

  async addTrack(track: Track): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORES.tracks, track);
    } catch (err) {
      console.error('[LibraryDB] addTrack failed', err);
      throw err;
    }
  }

  async addTracks(tracks: Track[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.tracks, 'readwrite');
      const store = tx.objectStore(STORES.tracks);
      await Promise.all([
        ...tracks.map((track) => store.put(track)),
        tx.done,
      ]);
    } catch (err) {
      console.error('[LibraryDB] addTracks failed', err);
      throw err;
    }
  }

  async getTrack(id: string): Promise<Track | undefined> {
    try {
      const db = await this.getDB();
      return db.get(STORES.tracks, id);
    } catch (err) {
      console.error('[LibraryDB] getTrack failed', err);
      throw err;
    }
  }

  async getAllTracks(): Promise<Track[]> {
    try {
      const db = await this.getDB();
      return db.getAll(STORES.tracks);
    } catch (err) {
      console.error('[LibraryDB] getAllTracks failed', err);
      throw err;
    }
  }

  async getTracksByCategory(category: TrackCategory): Promise<Track[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      return all.filter((t) => t.category === category);
    } catch (err) {
      console.error('[LibraryDB] getTracksByCategory failed', err);
      throw err;
    }
  }

  async searchTracks(query: string): Promise<Track[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      const lower = query.toLowerCase();
      return all.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(lower)) ||
          (t.artist && t.artist.toLowerCase().includes(lower)) ||
          (t.album && t.album.toLowerCase().includes(lower)) ||
          (t.fileName && t.fileName.toLowerCase().includes(lower)) ||
          (t.folderPath && t.folderPath.toLowerCase().includes(lower))
      );
    } catch (err) {
      console.error('[LibraryDB] searchTracks failed', err);
      throw err;
    }
  }

  async getRecentTracks(limit: number = 20): Promise<Track[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      return all
        .filter((t) => t.lastPlayed != null)
        .sort((a, b) => (b.lastPlayed ?? 0) - (a.lastPlayed ?? 0))
        .slice(0, limit);
    } catch (err) {
      console.error('[LibraryDB] getRecentTracks failed', err);
      throw err;
    }
  }

  async getMostPlayed(limit: number = 20): Promise<Track[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      return all
        .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
        .slice(0, limit);
    } catch (err) {
      console.error('[LibraryDB] getMostPlayed failed', err);
      throw err;
    }
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<void> {
    try {
      const db = await this.getDB();
      const existing = await db.get(STORES.tracks, id);
      if (!existing) {
        console.warn(`[LibraryDB] updateTrack: track ${id} not found`);
        return;
      }
      const updated = { ...existing, ...updates, id };
      await db.put(STORES.tracks, updated);
    } catch (err) {
      console.error('[LibraryDB] updateTrack failed', err);
      throw err;
    }
  }

  async removeTrack(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(STORES.tracks, id);
    } catch (err) {
      console.error('[LibraryDB] removeTrack failed', err);
      throw err;
    }
  }

  async clearTracks(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.clear(STORES.tracks);
    } catch (err) {
      console.error('[LibraryDB] clearTracks failed', err);
      throw err;
    }
  }

  async getTrackCount(): Promise<number> {
    try {
      const db = await this.getDB();
      return db.count(STORES.tracks);
    } catch (err) {
      console.error('[LibraryDB] getTrackCount failed', err);
      throw err;
    }
  }

  async incrementPlayCount(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const track = await db.get(STORES.tracks, id);
      if (!track) {
        console.warn(`[LibraryDB] incrementPlayCount: track ${id} not found`);
        return;
      }
      track.playCount = (track.playCount ?? 0) + 1;
      track.lastPlayed = Date.now();
      await db.put(STORES.tracks, track);
    } catch (err) {
      console.error('[LibraryDB] incrementPlayCount failed', err);
      throw err;
    }
  }

  async toggleFavorite(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const track = await db.get(STORES.tracks, id);
      if (!track) {
        console.warn(`[LibraryDB] toggleFavorite: track ${id} not found`);
        return;
      }
      track.isFavorite = !track.isFavorite;
      await db.put(STORES.tracks, track);
    } catch (err) {
      console.error('[LibraryDB] toggleFavorite failed', err);
      throw err;
    }
  }

  async getFavorites(): Promise<Track[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      return all.filter((t) => t.isFavorite === true);
    } catch (err) {
      console.error('[LibraryDB] getFavorites failed', err);
      throw err;
    }
  }

  async findDuplicates(): Promise<{ tracks: Track[]; reason: string }[]> {
    try {
      const db = await this.getDB();
      const all = await db.getAll(STORES.tracks);
      const results: { tracks: Track[]; reason: string }[] = [];
      const seenIds = new Set<string>();

      // Group by title+artist+duration (within 1 second tolerance)
      const metaGroups = new Map<string, Track[]>();
      for (const track of all) {
        const key = `${(track.title ?? '').toLowerCase()}|${(track.artist ?? '').toLowerCase()}|${Math.round(
          (track.duration ?? 0) / 1000
        )}`;
        if (!metaGroups.has(key)) {
          metaGroups.set(key, []);
        }
        metaGroups.get(key)!.push(track);
      }

      for (const [, group] of metaGroups) {
        if (group.length > 1) {
          // Verify duration is actually within 1s tolerance
          const durations = group.map((t) => t.duration ?? 0);
          const maxDur = Math.max(...durations);
          const minDur = Math.min(...durations);
          if (maxDur - minDur <= 1000) {
            results.push({ tracks: group, reason: 'Same title, artist, and duration (±1s)' });
            for (const t of group) seenIds.add(t.id);
          }
        }
      }

      // Group by fileName+fileSize
      const fileGroups = new Map<string, Track[]>();
      for (const track of all) {
        if (!track.fileName || !track.fileSize) continue;
        const key = `${track.fileName}|${track.fileSize}`;
        if (!fileGroups.has(key)) {
          fileGroups.set(key, []);
        }
        fileGroups.get(key)!.push(track);
      }

      for (const [, group] of fileGroups) {
        if (group.length > 1) {
          // Avoid reporting groups that were already found by metadata
          const allNew = group.every((t) => !seenIds.has(t.id));
          if (allNew) {
            results.push({ tracks: group, reason: 'Same file name and file size' });
          }
        }
      }

      return results;
    } catch (err) {
      console.error('[LibraryDB] findDuplicates failed', err);
      throw err;
    }
  }

  // ==================================================================
  // PLAYLISTS
  // ==================================================================

  async createPlaylist(name: string): Promise<Playlist> {
    try {
      const db = await this.getDB();
      const playlist: Playlist = {
        id: crypto.randomUUID(),
        name,
        trackIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.put(STORES.playlists, playlist);
      return playlist;
    } catch (err) {
      console.error('[LibraryDB] createPlaylist failed', err);
      throw err;
    }
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    try {
      const db = await this.getDB();
      return db.get(STORES.playlists, id);
    } catch (err) {
      console.error('[LibraryDB] getPlaylist failed', err);
      throw err;
    }
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    try {
      const db = await this.getDB();
      return db.getAll(STORES.playlists);
    } catch (err) {
      console.error('[LibraryDB] getAllPlaylists failed', err);
      throw err;
    }
  }

  async renamePlaylist(id: string, name: string): Promise<void> {
    try {
      const db = await this.getDB();
      const playlist = await db.get(STORES.playlists, id);
      if (!playlist) {
        console.warn(`[LibraryDB] renamePlaylist: playlist ${id} not found`);
        return;
      }
      playlist.name = name;
      playlist.updatedAt = Date.now();
      await db.put(STORES.playlists, playlist);
    } catch (err) {
      console.error('[LibraryDB] renamePlaylist failed', err);
      throw err;
    }
  }

  async deletePlaylist(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(STORES.playlists, id);
    } catch (err) {
      console.error('[LibraryDB] deletePlaylist failed', err);
      throw err;
    }
  }

  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const playlist = await db.get(STORES.playlists, playlistId);
      if (!playlist) {
        console.warn(`[LibraryDB] addTrackToPlaylist: playlist ${playlistId} not found`);
        return;
      }
      if (!playlist.trackIds.includes(trackId)) {
        playlist.trackIds.push(trackId);
        playlist.updatedAt = Date.now();
        await db.put(STORES.playlists, playlist);
      }
    } catch (err) {
      console.error('[LibraryDB] addTrackToPlaylist failed', err);
      throw err;
    }
  }

  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const playlist = await db.get(STORES.playlists, playlistId);
      if (!playlist) {
        console.warn(`[LibraryDB] removeTrackFromPlaylist: playlist ${playlistId} not found`);
        return;
      }
      playlist.trackIds = playlist.trackIds.filter((id) => id !== trackId);
      playlist.updatedAt = Date.now();
      await db.put(STORES.playlists, playlist);
    } catch (err) {
      console.error('[LibraryDB] removeTrackFromPlaylist failed', err);
      throw err;
    }
  }

  async duplicatePlaylist(id: string): Promise<Playlist | undefined> {
    try {
      const db = await this.getDB();
      const original = await db.get(STORES.playlists, id);
      if (!original) {
        console.warn(`[LibraryDB] duplicatePlaylist: playlist ${id} not found`);
        return undefined;
      }
      const copy: Playlist = {
        id: crypto.randomUUID(),
        name: `${original.name} (copy)`,
        trackIds: [...original.trackIds],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.put(STORES.playlists, copy);
      return copy;
    } catch (err) {
      console.error('[LibraryDB] duplicatePlaylist failed', err);
      throw err;
    }
  }

  async reorderPlaylist(playlistId: string, trackIds: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      const playlist = await db.get(STORES.playlists, playlistId);
      if (!playlist) {
        console.warn(`[LibraryDB] reorderPlaylist: playlist ${playlistId} not found`);
        return;
      }
      playlist.trackIds = trackIds;
      playlist.updatedAt = Date.now();
      await db.put(STORES.playlists, playlist);
    } catch (err) {
      console.error('[LibraryDB] reorderPlaylist failed', err);
      throw err;
    }
  }

  async clearPlaylist(playlistId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const playlist = await db.get(STORES.playlists, playlistId);
      if (!playlist) {
        console.warn(`[LibraryDB] clearPlaylist: playlist ${playlistId} not found`);
        return;
      }
      playlist.trackIds = [];
      playlist.updatedAt = Date.now();
      await db.put(STORES.playlists, playlist);
    } catch (err) {
      console.error('[LibraryDB] clearPlaylist failed', err);
      throw err;
    }
  }

  // ==================================================================
  // QUEUE
  // ==================================================================

  async getQueue(): Promise<QueueItem[]> {
    try {
      const db = await this.getDB();
      return db.getAll(STORES.queue);
    } catch (err) {
      console.error('[LibraryDB] getQueue failed', err);
      throw err;
    }
  }

  async setQueue(items: QueueItem[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.queue, 'readwrite');
      const store = tx.objectStore(STORES.queue);
      await store.clear();
      for (const item of items) {
        await store.put(item);
      }
      await tx.done;
    } catch (err) {
      console.error('[LibraryDB] setQueue failed', err);
      throw err;
    }
  }

  async addToQueue(trackId: string, position: 'next' | 'end' = 'end'): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newItem: QueueItem = { trackId, addedAt: Date.now() };
      if (position === 'next') {
        queue.splice(1, 0, newItem);
      } else {
        queue.push(newItem);
      }
      await this.setQueue(queue);
    } catch (err) {
      console.error('[LibraryDB] addToQueue failed', err);
      throw err;
    }
  }

  async removeFromQueue(trackId: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(STORES.queue, trackId);
    } catch (err) {
      console.error('[LibraryDB] removeFromQueue failed', err);
      throw err;
    }
  }

  async clearQueue(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.clear(STORES.queue);
    } catch (err) {
      console.error('[LibraryDB] clearQueue failed', err);
      throw err;
    }
  }

  async reorderQueue(trackIds: string[]): Promise<void> {
    try {
      const queue = await this.getQueue();
      const map = new Map(queue.map(i => [i.trackId, i]));
      const reordered = trackIds.map(id => map.get(id)).filter(Boolean) as QueueItem[];
      await this.setQueue(reordered);
    } catch (err) {
      console.error('[LibraryDB] reorderQueue failed', err);
      throw err;
    }
  }

  // ==================================================================
  // FILE HANDLES (File System Access API)
  // ==================================================================

  async saveHandle(handle: MediaFileHandle): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORES.handles, handle);
    } catch (err) {
      console.error('[LibraryDB] saveHandle failed', err);
      throw err;
    }
  }

  async getHandle(id: string): Promise<MediaFileHandle | undefined> {
    try {
      const db = await this.getDB();
      return db.get(STORES.handles, id);
    } catch (err) {
      console.error('[LibraryDB] getHandle failed', err);
      throw err;
    }
  }

  async getAllHandles(): Promise<MediaFileHandle[]> {
    try {
      const db = await this.getDB();
      return db.getAll(STORES.handles);
    } catch (err) {
      console.error('[LibraryDB] getAllHandles failed', err);
      throw err;
    }
  }

  async removeHandle(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete(STORES.handles, id);
    } catch (err) {
      console.error('[LibraryDB] removeHandle failed', err);
      throw err;
    }
  }

  async clearHandles(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.clear(STORES.handles);
    } catch (err) {
      console.error('[LibraryDB] clearHandles failed', err);
      throw err;
    }
  }

  async verifyHandle(handle: MediaFileHandle): Promise<boolean> {
    try {
      const h = handle.handle as any;
      if (!h || typeof h.queryPermission !== 'function') {
        return false;
      }
      const permission = await h.queryPermission({ mode: 'read' });
      return permission === 'granted';
    } catch (err) {
      console.error('[LibraryDB] verifyHandle failed', err);
      return false;
    }
  }

  // ==================================================================
  // PLAYBACK STATE
  // ==================================================================

  async savePlaybackState(state: PlaybackState): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORES.config, { key: 'playback-state', value: state });
    } catch (err) {
      console.error('[LibraryDB] savePlaybackState failed', err);
      throw err;
    }
  }

  async getPlaybackState(): Promise<PlaybackState | null> {
    try {
      const db = await this.getDB();
      const record = await db.get(STORES.config, 'playback-state');
      return record ? (record.value as PlaybackState) : null;
    } catch (err) {
      console.error('[LibraryDB] getPlaybackState failed', err);
      throw err;
    }
  }

  // ==================================================================
  // CONFIG VALUES
  // ==================================================================

  async setConfigValue(key: string, value: unknown): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORES.config, { key, value });
    } catch (err) {
      console.error('[LibraryDB] setConfigValue failed', err);
      throw err;
    }
  }

  async getConfigValue<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      const record = await db.get(STORES.config, key);
      return record ? (record.value as T) : null;
    } catch (err) {
      console.error('[LibraryDB] getConfigValue failed', err);
      throw err;
    }
  }

  // ==================================================================
  // FULL CLEAR
  // ==================================================================

  async clearAll(): Promise<void> {
    try {
      const db = await this.getDB();
      const storesToClear = [STORES.tracks, STORES.playlists, STORES.queue, STORES.handles];
      const tx = db.transaction(storesToClear, 'readwrite');
      for (const storeName of storesToClear) {
        tx.objectStore(storeName).clear();
      }
      await tx.done;
    } catch (err) {
      console.error('[LibraryDB] clearAll failed', err);
      throw err;
    }
  }

  async clearEverything(): Promise<void> {
    try {
      const db = await this.getDB();
      const allStores = [
        STORES.tracks,
        STORES.playlists,
        STORES.queue,
        STORES.handles,
        STORES.config,
      ];
      const tx = db.transaction(allStores, 'readwrite');
      for (const storeName of allStores) {
        tx.objectStore(storeName).clear();
      }
      await tx.done;
    } catch (err) {
      console.error('[LibraryDB] clearEverything failed', err);
      throw err;
    }
  }
}

// Singleton instance
export const db = new LibraryDB();
