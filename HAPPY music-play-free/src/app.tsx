import { useState, useEffect, useRef, useCallback, useMemo } from 'preact/hooks';
import { signal } from '@preact/signals';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { playerState, initPlayer, playTrack, togglePlay, playNext, playPrevious, seek, seekForward, seekBackward, setVolume, setPlaybackRate, toggleShuffle, cycleRepeat, addToQueue, clearQueue, toggleFavorite } from './lib/player-controller';
import { db } from './lib/library';
import { audioEngine } from './lib/audio-engine';
import { selectFiles, selectDirectory, selectDirectoryFallback, scanDirectoryHandle, scanFileList, supportsDirectoryPicker, supportsWebkitdirectory } from './lib/scanner';
import { formatDuration, formatFileSize } from './lib/metadata';
import { getConfig, saveConfig, isDarkMode } from './lib/config';
import { Track, Playlist, SortField, SortOrder, ScanProgress } from './types';
import { Play, Pause, SkipForward, SkipBack, Heart, HeartFilled, ShuffleIcon, RepeatIcon, RepeatOneIcon, Music, Folder, List, Search, Settings, Plus, X, ChevronDown, ChevronLeft, MoreVertical, Clock, QueueIcon, Trash, Edit, Share, Info, VolumeHigh, VolumeMute, TimerIcon, RefreshCw, CoverPlaceholder, Download, Upload } from './components/Icons';

type View = 'main' | 'music' | 'folders' | 'playlists' | 'favorites' | 'recent' | 'search' | 'settings' | 'fullplayer' | 'queue' | 'playlist-detail' | 'song-info' | 'add-music' | 'duplicates';

export default function App() {
  const [phase, setPhase] = useState<'splash' | 'welcome' | 'app'>('splash');
  const [view, setView] = useState<View>('main');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; track: Track } | null>(null);
  const [addToPlaylistModal, setAddToPlaylistModal] = useState<Track | null>(null);
  const [renameModal, setRenameModal] = useState<{ id: string; current: string } | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [createPlaylistModal, setCreatePlaylistModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0, currentFile: '', cancelled: false });
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showTimer, setShowTimer] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const scanAbortRef = useRef<AbortController | null>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Dark mode
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const checkDark = () => setDark(isDarkMode());
    checkDark();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', checkDark);
    const interval = setInterval(checkDark, 1000);
    return () => { mq.removeEventListener('change', checkDark); clearInterval(interval); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Splash -> Welcome/App
  useEffect(() => {
    if (phase === 'splash') return;
    const config = getConfig();
    if (config.firstRun) {
      setPhase('welcome');
    } else {
      setPhase('app');
    }
  }, [phase]);

  // Init player and load data
  useEffect(() => {
    if (phase !== 'app') return;
    initPlayer().then(async () => {
      const allTracks = await db.getAllTracks();
      setTracks(allTracks);
      const pls = await db.getAllPlaylists();
      setPlaylists(pls);

      // Restore playback if track exists
      const savedState = await db.getPlaybackState();
      if (savedState?.currentTrackId) {
        const track = await db.getTrack(savedState.currentTrackId);
        if (track) {
          playerState.currentTrack.value = track;
          playerState.duration.value = savedState.duration || 0;
          playerState.currentTime.value = savedState.position || 0;
        }
      }
    });
  }, [phase]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    window.addEventListener('contextmenu', handler);
    return () => { window.removeEventListener('click', handler); window.removeEventListener('contextmenu', handler); };
  }, []);

  const showToast = (msg: string) => setToast(msg);

  const loadTracks = useCallback(async () => {
    const allTracks = await db.getAllTracks();
    setTracks(allTracks);
  }, []);

  const loadPlaylists = useCallback(async () => {
    const pls = await db.getAllPlaylists();
    setPlaylists(pls);
  }, []);

  // Sorting
  const sortedTracks = useMemo(() => {
    const arr = [...tracks];
    arr.sort((a, b) => {
      let va: string | number = a[sortField];
      let vb: string | number = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tracks, sortField, sortOrder]);

  // Music tracks (category = 'music')
  const musicTracks = useMemo(() => sortedTracks.filter(t => t.category === 'music'), [sortedTracks]);

  // Folder groups
  const folderGroups = useMemo(() => {
    const map = new Map<string, Track[]>();
    sortedTracks.forEach(t => {
      const folder = t.folderPath || 'Sin carpeta';
      if (!map.has(folder)) map.set(folder, []);
      map.get(folder)!.push(t);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sortedTracks]);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = tracks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.fileName.toLowerCase().includes(q) ||
      (t.folderPath || '').toLowerCase().includes(q)
    );
    setSearchResults(results);
  }, [searchQuery, tracks]);

  // Scan handlers
  const handleSelectFiles = async () => {
    const files = await selectFiles();
    if (!files || files.length === 0) return;
    await doScan(
      () => scanFileList(files, (p) => setScanProgress(p), scanAbortRef.current?.signal),
      files.length
    );
  };

  const handleSelectDirectory = async () => {
    if (supportsDirectoryPicker) {
      const handle = await selectDirectory();
      if (!handle) return;
      await doScan(
        () => scanDirectoryHandle(handle, (p) => setScanProgress(p), scanAbortRef.current?.signal)
      );
    } else if (supportsWebkitdirectory) {
      const files = await selectDirectoryFallback();
      if (!files || files.length === 0) return;
      await doScan(
        () => scanFileList(files, (p) => setScanProgress(p), scanAbortRef.current?.signal),
        files.length
      );
    } else {
      await handleSelectFiles();
    }
  };

  const doScan = async (scanFn: () => Promise<Track[]>, estimatedTotal?: number) => {
    scanAbortRef.current = new AbortController();
    setScanning(true);
    setScanProgress({ current: 0, total: estimatedTotal || 0, currentFile: '', cancelled: false });
    try {
      const newTracks = await scanFn();
      await loadTracks();
      showToast(`${newTracks.length} pistas añadidas`);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('Scan error:', e);
        showToast('Error al escanear archivos');
      }
    } finally {
      setScanning(false);
      scanAbortRef.current = null;
      setView('music');
    }
  };

  const handleCancelScan = () => {
    scanAbortRef.current?.abort();
    setScanProgress(p => ({ ...p, cancelled: true }));
  };

  const handleResync = async () => {
    const handles = await db.getAllHandles();
    if (handles.length === 0) {
      showToast('No hay carpetas sincronizadas');
      return;
    }
    // Try to use the first handle's parent directory
    showToast('Selecciona la carpeta para resincronizar');
    // For simplicity, just rescan
    await handleSelectDirectory();
  };

  // Track actions
  const handlePlayTrack = (track: Track, context?: Track[], contextId?: string) => {
    playTrack(track, context, contextId);
  };

  const handleContextMenu = (e: MouseEvent, track: Track) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, track });
  };

  const handleAddToQueue = async (track: Track, position: 'next' | 'end' = 'end') => {
    await addToQueue(track.id, position);
    showToast(position === 'next' ? 'Se reproducirá después' : 'Añadida a la cola');
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await db.createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setCreatePlaylistModal(false);
    await loadPlaylists();
    showToast('Playlist creada');
  };

  const handleAddTrackToPlaylist = async (playlistId: string, trackId: string) => {
    await db.addTrackToPlaylist(playlistId, trackId);
    setAddToPlaylistModal(null);
    showToast('Añadida a la playlist');
    await loadPlaylists();
  };

  const handleDeletePlaylist = async (id: string) => {
    setConfirmDialog({
      message: '¿Eliminar esta playlist?',
      onConfirm: async () => {
        await db.deletePlaylist(id);
        await loadPlaylists();
        setView('playlists');
        setConfirmDialog(null);
      },
    });
  };

  const handleRenamePlaylist = async () => {
    if (!renameModal || !renameModal.current.trim()) return;
    await db.renamePlaylist(renameModal.id, renameModal.current.trim());
    setRenameModal(null);
    await loadPlaylists();
    showToast('Playlist renombrada');
  };

  const handleRemoveFromLibrary = async (trackId: string) => {
    await db.removeTrack(trackId);
    await loadTracks();
    showToast('Eliminada de la biblioteca');
  };

  const handleClearLibrary = () => {
    setConfirmDialog({
      message: '¿Eliminar toda la biblioteca? No se borrarán archivos del dispositivo.',
      onConfirm: async () => {
        await db.clearAll();
        await loadTracks();
        await loadPlaylists();
        setConfirmDialog(null);
        showToast('Biblioteca limpiada');
      },
    });
  };

  const handleShare = async (track: Track) => {
    if (!navigator.share) { showToast('No disponible en este navegador'); return; }
    try {
      // Try to get the file
      const handle = await db.getHandle(track.id);
      let file: File | null = null;
      if (handle && 'FileSystemFileHandle' in window) {
        try {
          const h = handle.handle as any;
          const perm = await h.queryPermission({ mode: 'read' });
          if (perm === 'granted') file = await h.getFile();
          else {
            const req = await h.requestPermission({ mode: 'read' });
            if (req === 'granted') file = await h.getFile();
          }
        } catch {}
      }
      if (file) {
        await navigator.share({ files: [file], title: track.title });
      } else {
        await navigator.share({ title: track.title, text: `${track.artist} - ${track.title}` });
      }
    } catch {}
  };

  const handleExportPlaylists = async () => {
    const pls = await db.getAllPlaylists();
    const data = JSON.stringify({ version: 1, playlists: pls, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'music-play-free-playlists.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('Playlists exportadas');
  };

  const handleImportPlaylists = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.playlists && Array.isArray(data.playlists)) {
          for (const pl of data.playlists) {
            if (pl.name && pl.trackIds) {
              await db.createPlaylist(pl.name).then(async (newPl) => {
                for (const tid of pl.trackIds) {
                  const track = await db.getTrack(tid);
                  if (track) await db.addTrackToPlaylist(newPl.id, tid);
                }
              });
            }
          }
          await loadPlaylists();
          showToast('Playlists importadas');
        }
      } catch { showToast('Error al importar'); }
    };
    input.click();
  };

  // Progress bar interaction
  const handleProgressClick = (e: MouseEvent | TouchEvent) => {
    if (!progressRef.current || !playerState.duration.value) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seek(pct * playerState.duration.value);
  };

  const handleProgressTouch = (e: TouchEvent) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: TouchEvent) => handleProgressClick(e);
    const up = () => setIsDragging(false);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up, { once: true });
    return () => { window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); };
  }, [isDragging]);

  // Timer
  const [timerMinutes, setTimerMinutes] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSetTimer = (minutes: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (minutes === 0) { setTimerMinutes(0); setShowTimer(false); showToast('Temporizador cancelado'); return; }
    setTimerMinutes(minutes);
    setShowTimer(false);
    showToast(`Se detendrá en ${minutes} minutos`);
    let remaining = minutes * 60;
    timerRef.current = setInterval(() => {
      remaining--;
      setTimerMinutes(Math.ceil(remaining / 60));
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        audioEngine.pause();
        setTimerMinutes(0);
        showToast('Temporizador completado');
      }
    }, 1000);
  };

  // PWA install
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  // Theme change
  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    saveConfig({ theme });
    setDark(isDarkMode());
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': e.preventDefault(); seekForward(); break;
        case 'ArrowLeft': e.preventDefault(); seekBackward(); break;
        case 'ArrowUp': e.preventDefault(); setVolume(Math.min(1, playerState.volume.value + 0.1)); break;
        case 'ArrowDown': e.preventDefault(); setVolume(Math.max(0, playerState.volume.value - 0.1)); break;
        case 'KeyN': playNext(); break;
        case 'KeyP': playPrevious(); break;
        case 'KeyM': audioEngine.toggleMute(); break;
        case 'KeyS': toggleShuffle(); break;
        case 'KeyR': cycleRepeat(); break;
        case 'Escape':
          if (view === 'fullplayer' || view === 'queue') setView('main');
          else if (view !== 'main') setView('main');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view]);

  const currentTrack = playerState.currentTrack.value;
  const isPlaying = playerState.isPlaying.value;
  const currentTime = playerState.currentTime.value;
  const duration = playerState.duration.value;
  const shuffle = playerState.shuffle.value;
  const repeat = playerState.repeat.value;
  const volume = playerState.volume.value;
  const playbackRate = playerState.playbackRate.value;
  const queue = playerState.queue.value;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ===== RENDER =====

  if (phase === 'splash') return <SplashScreen onComplete={() => setPhase('welcome')} />;
  if (phase === 'welcome') return <WelcomeScreen onClose={() => { saveConfig({ firstRun: false }); setPhase('app'); }} />;

  // Track list item
  const TrackItem = ({ track, index, context, showIndex = false }: { track: Track; index: number; context: Track[]; showIndex?: boolean }) => (
    <div
      class={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${currentTrack?.id === track.id ? '' : ''}`}
      style={{
        backgroundColor: currentTrack?.id === track.id ? 'var(--color-accent)' : 'transparent',
        color: currentTrack?.id === track.id ? '#fff' : 'var(--color-text)',
      }}
      onClick={() => handlePlayTrack(track, context)}
      onContextMenu={(e) => handleContextMenu(e as any, track)}
      role="button"
      tabIndex={0}
      aria-label={`Reproducir ${track.title} de ${track.artist || 'artista desconocido'}`}
    >
      {showIndex && <span class="w-6 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{index + 1}</span>}
      <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-cover-placeholder)' }}>
        {track.coverUrl
          ? <img src={track.coverUrl} alt="" class="w-full h-full object-cover" loading="lazy" />
          : <Music size={18} style={{ color: 'var(--color-text-tertiary)' }} />
        }
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">{track.title}</div>
        <div class="text-xs truncate" style={{ color: currentTrack?.id === track.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}>
          {track.artist || track.album || track.fileName}
        </div>
      </div>
      <span class="text-xs flex-shrink-0" style={{ color: currentTrack?.id === track.id ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary)' }}>
        {formatDuration(track.duration)}
      </span>
      <button
        class="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: currentTrack?.id === track.id ? '#fff' : 'var(--color-text-secondary)' }}
        onClick={(e) => { e.stopPropagation(); setContextMenu({ x: (e as any).clientX, y: (e as any).clientY, track }); }}
        aria-label="Más opciones"
      >
        <MoreVertical size={18} />
      </button>
    </div>
  );

  // Header
  const Header = ({ title, onBack, rightAction }: { title: string; onBack?: () => void; rightAction?: any }) => (
    <div class="flex items-center gap-3 px-4 py-3 safe-top" style={{ minHeight: '56px', borderBottom: '1px solid var(--color-border)' }}>
      {onBack && (
        <button onClick={onBack} class="p-1 rounded-full" style={{ color: 'var(--color-text)' }} aria-label="Volver">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 class="flex-1 text-base font-semibold truncate">{title}</h1>
      {rightAction}
    </div>
  );

  // Empty state
  const EmptyState = ({ title, subtitle, actions }: { title: string; subtitle: string; actions: any[] }) => (
    <div class="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <Music size={48} style={{ color: 'var(--color-text-tertiary)' }} />
      <p class="mt-4 text-sm font-medium" style={{ color: 'var(--color-text)' }}>{title}</p>
      <p class="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{subtitle}</p>
      <div class="flex gap-3 mt-4">
        {actions}
      </div>
    </div>
  );

  // Mini Player
  const MiniPlayer = () => {
    if (!currentTrack) return null;
    return (
      <div
        class="fixed bottom-0 left-0 right-0 z-30 safe-bottom cursor-pointer"
        style={{
          backgroundColor: 'var(--color-mini-player)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -2px 12px var(--color-shadow)',
          minHeight: '64px',
        }}
        onClick={() => setView('fullplayer')}
        role="button"
        aria-label={`Reproduciendo: ${currentTrack.title}. Pulse para abrir el reproductor`}
      >
        <div class="flex items-center gap-3 px-4 py-2">
          <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-cover-placeholder)' }}>
            {currentTrack.coverUrl
              ? <img src={currentTrack.coverUrl} alt="" class="w-full h-full object-cover" />
              : <Music size={16} style={{ color: 'var(--color-text-tertiary)' }} />
            }
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{currentTrack.title}</div>
            <div class="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{currentTrack.artist || ''}</div>
          </div>
          <button
            class="p-2 rounded-full"
            style={{ color: 'var(--color-text)' }}
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button
            class="p-2 rounded-full"
            style={{ color: 'var(--color-text)' }}
            onClick={(e) => { e.stopPropagation(); playNext(); }}
            aria-label="Siguiente"
          >
            <SkipForward size={22} />
          </button>
        </div>
      </div>
    );
  };

  // Full Player
  const FullPlayer = () => {
    const t = currentTrack;
    if (!t) return null;
    return (
      <div class="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Top bar */}
        <div class="flex items-center justify-between px-4 py-3 safe-top">
        <button onClick={() => setView('main')} class="p-1" style={{ color: 'var(--color-text)' }} aria-label="Cerrar reproductor">
            <ChevronDown size={28} />
          </button>
          <div class="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Reproduciendo</div>
          <button onClick={() => { setView('queue'); }} class="p-1" style={{ color: 'var(--color-text-secondary)' }} aria-label="Cola de reproducción">
            <QueueIcon size={22} />
          </button>
        </div>

        {/* Cover art */}
        <div class="flex-1 flex items-center justify-center px-8 py-4">
          <div class="w-full max-w-xs aspect-square rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--color-cover-placeholder)' }}>
            {t.coverUrl
              ? <img src={t.coverUrl} alt="" class="w-full h-full object-cover" />
              : <div class="w-full h-full flex items-center justify-center"><CoverPlaceholder size={200} /></div>
            }
          </div>
        </div>

        {/* Info */}
        <div class="px-6 mb-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h2 class="text-lg font-bold truncate" style={{ color: 'var(--color-text)' }}>{t.title}</h2>
              <p class="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{t.artist}{t.album ? ` · ${t.album}` : ''}</p>
            </div>
            <button
              class="p-2 flex-shrink-0"
              style={{ color: t.isFavorite ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              onClick={async () => { await toggleFavorite(t.id); await loadTracks(); }}
              aria-label={t.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              {t.isFavorite ? <HeartFilled size={22} /> : <Heart size={22} />}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div class="px-6 mb-2">
          <div
            ref={progressRef}
            class="w-full h-1.5 rounded-full cursor-pointer"
            style={{ backgroundColor: 'var(--color-border)' }}
            onClick={handleProgressClick}
            onTouchStart={handleProgressTouch}
            role="slider"
            aria-label="Progreso de reproducción"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemax={Math.round(duration)}
            tabIndex={0}
          >
            <div class="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }} />
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{formatDuration(currentTime)}</span>
            <span class="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div class="flex items-center justify-center gap-6 px-6 pb-4">
          <button
            class={`p-2 rounded-full transition-colors ${shuffle ? '' : 'opacity-40'}`}
            style={{ color: shuffle ? 'var(--color-accent)' : 'var(--color-text)' }}
            onClick={toggleShuffle}
            aria-label={`Aleatorio ${shuffle ? 'activado' : 'desactivado'}`}
          >
            <ShuffleIcon size={22} />
          </button>
          <button class="p-2" style={{ color: 'var(--color-text)' }} onClick={playPrevious} aria-label="Anterior">
            <SkipBack size={28} />
          </button>
          <button
            class="p-4 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button class="p-2" style={{ color: 'var(--color-text)' }} onClick={playNext} aria-label="Siguiente">
            <SkipForward size={28} />
          </button>
          <button
            class={`p-2 rounded-full transition-colors ${repeat !== 'off' ? '' : 'opacity-40'}`}
            style={{ color: repeat !== 'off' ? 'var(--color-accent)' : 'var(--color-text)' }}
            onClick={cycleRepeat}
            aria-label={`Repetir: ${repeat === 'off' ? 'desactivado' : repeat === 'one' ? 'una vez' : 'todo'}`}
          >
            {repeat === 'one' ? <RepeatOneIcon size={22} /> : <RepeatIcon size={22} />}
          </button>
        </div>

        {/* Extra controls */}
        <div class="flex items-center justify-between px-6 pb-6 safe-bottom">
          <button class="p-2" style={{ color: timerMinutes > 0 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }} onClick={() => setShowTimer(true)} aria-label="Temporizador">
            <TimerIcon size={20} />
          </button>
          <button class="p-2" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setShowSpeed(true)} aria-label="Velocidad">
            <span class="text-xs font-medium">{playbackRate}x</span>
          </button>
          <button class="p-2" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setShowVolume(!showVolume)} aria-label="Volumen">
            {volume === 0 ? <VolumeMute size={20} /> : <VolumeHigh size={20} />}
          </button>
        </div>

        {showVolume && (
          <div class="px-6 pb-4">
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onInput={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
              class="w-full"
              aria-label="Volumen"
            />
          </div>
        )}

        {showTimer && (
          <div class="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setShowTimer(false)}>
            <div class="w-full max-w-md rounded-t-2xl p-4 safe-bottom" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
              <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Temporizador de apagado</h3>
              <div class="grid grid-cols-3 gap-2">
                {[15, 30, 45, 60, 90, 0].map(m => (
                  <button
                    key={m}
                    class={`py-2.5 rounded-xl text-sm font-medium ${timerMinutes > 0 && m === 0 ? '' : ''}`}
                    style={{
                      backgroundColor: m === 0 && timerMinutes > 0 ? 'var(--color-danger)' : m === 0 ? 'var(--color-surface-hover)' : 'var(--color-surface-hover)',
                      color: m === 0 && timerMinutes > 0 ? '#fff' : 'var(--color-text)',
                    }}
                    onClick={() => handleSetTimer(m)}
                  >{m === 0 ? 'Cancelar' : `${m} min`}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSpeed && (
          <div class="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setShowSpeed(false)}>
            <div class="w-full max-w-md rounded-t-2xl p-4 safe-bottom" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
              <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Velocidad de reproducción</h3>
              <div class="grid grid-cols-4 gap-2">
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3].map(r => (
                  <button
                    key={r}
                    class="py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      backgroundColor: playbackRate === r ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                      color: playbackRate === r ? '#fff' : 'var(--color-text)',
                    }}
                    onClick={() => { setPlaybackRate(r); setShowSpeed(false); }}
                  >{r}x</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Queue view
  const QueueView = () => {
    const [queueTracks, setQueueTracks] = useState<Track[]>([]);
    useEffect(() => {
      (async () => {
        const q = playerState.queue.value;
        const t = await Promise.all(q.map(i => db.getTrack(i.trackId)));
        setQueueTracks(t.filter(Boolean) as Track[]);
      })();
    }, [queue]);

    return (
      <div class="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header title={`Cola (${queueTracks.length})`} onBack={() => setView('fullplayer')} rightAction={
          queueTracks.length > 0 ? (
            <button class="p-1" style={{ color: 'var(--color-danger)' }} onClick={() => { clearQueue(); showToast('Cola limpiada'); }} aria-label="Limpiar cola">
              <Trash size={20} />
            </button>
          ) : null
        } />
        <div class="flex-1 overflow-y-auto pb-20">
          {queueTracks.length === 0
            ? <EmptyState title="Cola vacía" subtitle="Añade canciones desde el menú contextual" actions={[]} />
            : queueTracks.map((t, i) => (
              <TrackItem key={t.id} track={t} index={i} context={queueTracks} showIndex />
            ))
          }
        </div>
        {currentTrack && <MiniPlayer />}
      </div>
    );
  };

  // Context menu overlay
  const ContextMenuOverlay = () => {
    if (!contextMenu) return null;
    const t = contextMenu.track;
    const menuItems = [
      { label: 'Reproducir', icon: <Play size={16} />, action: () => handlePlayTrack(t, tracks) },
      { label: 'Reproducir después', icon: <SkipForward size={16} />, action: () => handleAddToQueue(t, 'next') },
      { label: 'Añadir a cola', icon: <QueueIcon size={16} />, action: () => handleAddToQueue(t, 'end') },
      { label: 'Añadir a playlist', icon: <List size={16} />, action: () => setAddToPlaylistModal(t) },
      { label: t.isFavorite ? 'Quitar de favoritos' : 'Favorito', icon: t.isFavorite ? <HeartFilled size={16} /> : <Heart size={16} />, action: async () => { await toggleFavorite(t.id); await loadTracks(); } },
      { label: 'Compartir', icon: <Share size={16} />, action: () => handleShare(t) },
      { label: 'Información', icon: <Info size={16} />, action: () => { setSelectedTrack(t); setView('song-info'); } },
      { label: 'Quitar de biblioteca', icon: <Trash size={16} />, action: () => handleRemoveFromLibrary(t.id), danger: true },
    ];

    // Adjust position to fit screen
    const menuH = menuItems.length * 44 + 16;
    const menuW = 220;
    let x = Math.min(contextMenu.x, window.innerWidth - menuW - 8);
    let y = Math.min(contextMenu.y, window.innerHeight - menuH - 8);
    if (x < 8) x = 8;
    if (y < 8) y = 8;

    return (
      <div class="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
        <div
          class="absolute rounded-xl py-2 shadow-xl"
          style={{
            left: x, top: y, width: menuW,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
          onClick={e => e.stopPropagation()}
          role="menu"
        >
          {menuItems.map((item, i) => (
            <button
              key={i}
              class={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors`}
              style={{ color: (item as any).danger ? 'var(--color-danger)' : 'var(--color-text)' }}
              onClick={() => { setContextMenu(null); item.action(); }}
              role="menuitem"
            >
              <span style={{ color: (item as any).danger ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ===== VIEWS =====

  const renderView = () => {
    switch (view) {
      case 'fullplayer': return <FullPlayer />;
      case 'queue': return <QueueView />;
      case 'song-info':
        if (!selectedTrack) return null;
        const st = selectedTrack;
        return (
          <div class="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title="Información" onBack={() => setView('main')} />
            <div class="flex-1 overflow-y-auto p-4">
              <div class="flex justify-center mb-6">
                <div class="w-48 h-48 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-cover-placeholder)' }}>
                  {st.coverUrl ? <img src={st.coverUrl} alt="" class="w-full h-full object-cover" /> : <CoverPlaceholder size={192} />}
                </div>
              </div>
              <div class="space-y-3">
                {[
                  ['Título', st.title],
                  ['Artista', st.artist],
                  ['Álbum', st.album],
                  ['Género', st.genre],
                  ['Año', st.year],
                  ['Duración', formatDuration(st.duration)],
                  ['Formato', st.format.toUpperCase()],
                  ['Tamaño', formatFileSize(st.fileSize)],
                  ['Bitrate', st.bitrate ? `${Math.round(st.bitrate / 1000)} kbps` : ''],
                  ['Archivo', st.fileName],
                  ['Carpeta', st.folderPath],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string}>
                    <div class="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{label}</div>
                    <div class="text-sm mt-0.5" style={{ color: 'var(--color-text)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'music':
      case 'favorites':
      case 'recent': {
        let viewTracks: Track[];
        let viewTitle: string;

        if (view === 'music') {
          viewTracks = musicTracks;
          viewTitle = `Música (${musicTracks.length})`;
        } else if (view === 'favorites') {
          viewTracks = sortedTracks.filter(t => t.isFavorite);
          viewTitle = `Favoritos (${viewTracks.length})`;
        } else {
          viewTracks = [...sortedTracks].sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 100);
          viewTitle = 'Recientes';
        }

        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title={viewTitle} onBack={() => setView('main')} rightAction={
              <button class="p-1" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setShowSort(true)} aria-label="Ordenar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h12M3 18h6" /></svg>
              </button>
            } />
            <div class="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '80px' : '16px' }}>
              {viewTracks.length === 0
                ? <EmptyState
                    title={view === 'favorites' ? 'Sin favoritos' : view === 'recent' ? 'Sin reproducciones recientes' : 'Sin música'}
                    subtitle={view === 'music' ? 'Selecciona archivos o una carpeta para comenzar' : ''}
                    actions={view === 'music' ? [
                      <button key="files" class="px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }} onClick={handleSelectFiles}>Elegir archivos</button>,
                      <button key="folder" class="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} onClick={handleSelectDirectory}>Elegir carpeta</button>,
                    ] : []}
                  />
                : viewTracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} context={viewTracks} showIndex={view === 'music'} />)
              }
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );
      }

      case 'folders':
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title={`Carpetas (${folderGroups.length})`} onBack={() => setView('main')} />
            <div class="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '80px' : '16px' }}>
              {folderGroups.length === 0
                ? <EmptyState title="Sin carpetas" subtitle="Selecciona una carpeta para ver su contenido aquí" actions={[
                  <button key="folder" class="px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }} onClick={handleSelectDirectory}>Elegir carpeta</button>,
                ]} />
                : folderGroups.map(([folder, folderTracks]) => (
                  <div
                    key={folder}
                    class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onClick={() => { /* could expand folder */ handlePlayTrack(folderTracks[0], folderTracks); }}
                  >
                    <Folder size={22} style={{ color: 'var(--color-accent)' }} />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{folder.split('/').pop() || folder}</div>
                      <div class="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{folderTracks.length} pistas</div>
                    </div>
                    <ChevronLeft size={18} class="rotate-180" style={{ color: 'var(--color-text-tertiary)' }} />
                  </div>
                ))
              }
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );

      case 'playlists':
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title="Playlists" onBack={() => setView('main')} rightAction={
              <button class="p-1" style={{ color: 'var(--color-accent)' }} onClick={() => setCreatePlaylistModal(true)} aria-label="Crear playlist">
                <Plus size={22} />
              </button>
            } />
            <div class="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '80px' : '16px' }}>
              {playlists.length === 0
                ? <EmptyState title="Sin playlists" subtitle="Crea tu primera playlist" actions={[
                  <button key="create" class="px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }} onClick={() => setCreatePlaylistModal(true)}>Crear playlist</button>,
                ]} />
                : playlists.map(pl => (
                  <div
                    key={pl.id}
                    class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onClick={async () => {
                      const allT = await db.getAllTracks();
                      const plTracks = pl.trackIds.map(id => allT.find(t => t.id === id)).filter(Boolean) as Track[];
                      setSelectedPlaylist({ ...pl, tracks: plTracks } as any);
                      setView('playlist-detail');
                    }}
                  >
                    <List size={22} style={{ color: 'var(--color-accent)' }} />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{pl.name}</div>
                      <div class="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{pl.trackIds.length} pistas</div>
                    </div>
                    <button class="p-1" style={{ color: 'var(--color-text-tertiary)' }} onClick={(e) => { e.stopPropagation(); setRenameModal({ id: pl.id, current: pl.name }); }} aria-label="Renombrar">
                      <Edit size={18} />
                    </button>
                    <button class="p-1" style={{ color: 'var(--color-text-tertiary)' }} onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(pl.id); }} aria-label="Eliminar">
                      <Trash size={18} />
                    </button>
                  </div>
                ))
              }
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );

      case 'playlist-detail': {
        if (!selectedPlaylist) return null;
        const plTracks = (selectedPlaylist as any).tracks as Track[] || [];
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title={selectedPlaylist.name} onBack={() => setView('playlists')} rightAction={
              plTracks.length > 0 ? (
                <button class="p-1" style={{ color: 'var(--color-text)' }} onClick={() => { if (plTracks.length > 0) handlePlayTrack(plTracks[0], plTracks, selectedPlaylist.id); }} aria-label="Reproducir todo">
                  <Play size={22} />
                </button>
              ) : null
            } />
            <div class="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '80px' : '16px' }}>
              {plTracks.length === 0
                ? <EmptyState title="Playlist vacía" subtitle="Añade canciones desde el menú contextual" actions={[]} />
                : plTracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} context={plTracks} showIndex />)
              }
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );
      }

      case 'search':
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div class="px-4 py-3 safe-top" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div class="flex items-center gap-3">
                <div class="flex-1 flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <Search size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                    placeholder="Buscar por título, artista, álbum..."
                    class="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color: 'var(--color-text)' }}
                    autoFocus
                    aria-label="Buscar música"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ color: 'var(--color-text-tertiary)' }} aria-label="Limpiar búsqueda">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button style={{ color: 'var(--color-text)' }} onClick={() => { setSearchQuery(''); setView('main'); }} aria-label="Cerrar búsqueda">
                  <X size={22} />
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '80px' : '16px' }}>
              {searchQuery && searchResults.length === 0 && (
                <div class="flex flex-col items-center justify-center p-8 text-center">
                  <Search size={36} style={{ color: 'var(--color-text-tertiary)' }} />
                  <p class="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sin resultados para &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
              {searchResults.map((t, i) => <TrackItem key={t.id} track={t} index={i} context={searchResults} />)}
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );

      case 'settings': {
        const config = getConfig();
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title="Configuración" onBack={() => setView('main')} />
            <div class="flex-1 overflow-y-auto pb-8">
              {/* Appearance */}
              <div class="px-4 py-3">
                <div class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Apariencia</div>
                <div class="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  {(['system', 'light', 'dark'] as const).map(t => (
                    <button
                      key={t}
                      class="w-full flex items-center justify-between px-4 py-3 text-left text-sm"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
                      onClick={() => handleThemeChange(t)}
                    >
                      <span>{t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Oscuro'}</span>
                      {config.theme === t && <span class="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Library */}
              <div class="px-4 py-3">
                <div class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Biblioteca</div>
                <div class="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
                    onClick={handleResync}
                  >
                    <RefreshCw size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    Actualizar biblioteca
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
                    onClick={handleExportPlaylists}
                  >
                    <Upload size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    Exportar playlists
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
                    onClick={handleImportPlaylists}
                  >
                    <Download size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    Importar playlists
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-danger)' }}
                    onClick={handleClearLibrary}
                  >
                    <Trash size={18} />
                    Limpiar biblioteca
                  </button>
                </div>
              </div>

              {/* App */}
              <div class="px-4 py-3">
                <div class="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>Aplicación</div>
                <div class="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                  {installPrompt && (
                    <button
                      class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)', borderBottom: '1px solid var(--color-border)' }}
                      onClick={handleInstall}
                    >
                      <Download size={18} />
                      Instalar MUSIC-PLAY-FREE
                    </button>
                  )}
                  <div class="flex items-center justify-between px-4 py-3 text-sm" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
                    <span>Acerca de</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>v1.0.0</span>
                  </div>
                  <div class="px-4 py-3 text-xs leading-relaxed" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                    MUSIC-PLAY-FREE reproduce audio localmente. No envía datos a servidores externos. Tu música permanece en tu dispositivo.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'add-music':
        return (
          <div class="fixed inset-0 z-20 flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Header title="Añadir música" onBack={() => setView('main')} />
            <div class="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              {scanning ? (
                <div class="text-center">
                  <div class="w-48 h-1.5 rounded-full mx-auto mb-3" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div class="h-full rounded-full transition-all duration-300" style={{
                      width: scanProgress.total > 0 ? `${(scanProgress.current / scanProgress.total) * 100}%` : '0%',
                      backgroundColor: 'var(--color-scan-bar)',
                    }} />
                  </div>
                  <p class="text-sm" style={{ color: 'var(--color-text)' }}>
                    Analizando música {scanProgress.current}{scanProgress.total > 0 ? ` / ${scanProgress.total}` : ''}
                  </p>
                  <p class="text-xs mt-1 truncate max-w-xs mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>{scanProgress.currentFile}</p>
                  <button
                    class="mt-4 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
                    onClick={handleCancelScan}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div class="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent)' }}>
                    <Music size={36} color="#fff" />
                  </div>
                  <p class="text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                    Selecciona archivos de audio o una carpeta completa de tu dispositivo
                  </p>
                  <button
                    class="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-white font-medium"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    onClick={handleSelectFiles}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                    Seleccionar archivos
                  </button>
                  <button
                    class="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-medium"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                    onClick={handleSelectDirectory}
                  >
                    <Folder size={22} />
                    Seleccionar carpeta
                  </button>
                  {supportsWebkitdirectory && !supportsDirectoryPicker && (
                    <p class="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                      Se usará el selector de carpetas del sistema
                    </p>
                  )}
                </>
              )}
            </div>
            {currentTrack && <MiniPlayer />}
          </div>
        );

      case 'main':
      default:
        return (
          <div class="flex-1 overflow-y-auto" ref={mainScrollRef} style={{ paddingBottom: currentTrack ? '80px' : '0' }}>
            {/* Add music button */}
            <div class="p-4">
              <button
                class="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onClick={() => setView('add-music')}
                aria-label="Añadir música"
              >
                <Plus size={20} />
                Añadir música
              </button>
            </div>

            {/* Main grid */}
            <div class="grid grid-cols-3 gap-3 px-4 pb-4">
              {[
                { label: 'Música', icon: <Music size={24} />, count: musicTracks.length, view: 'music' as View },
                { label: 'Carpetas', icon: <Folder size={24} />, count: folderGroups.length, view: 'folders' as View },
                { label: 'Playlists', icon: <List size={24} />, count: playlists.length, view: 'playlists' as View },
                { label: 'Favoritos', icon: <Heart size={24} />, count: sortedTracks.filter(t => t.isFavorite).length, view: 'favorites' as View },
                { label: 'Recientes', icon: <Clock size={24} />, count: Math.min(sortedTracks.filter(t => t.lastPlayed > 0).length, 100), view: 'recent' as View },
                { label: 'Buscar', icon: <Search size={24} />, count: null, view: 'search' as View },
              ].map(item => (
                <button
                  key={item.view}
                  class="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onClick={() => setView(item.view)}
                  aria-label={item.label}
                >
                  <span style={{ color: 'var(--color-accent)' }}>{item.icon}</span>
                  <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</span>
                  {item.count !== null && <span class="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.count}</span>}
                </button>
              ))}

              {/* Settings */}
              <button
                class="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-colors"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                onClick={() => setView('settings')}
                aria-label="Configuración"
              >
                <span style={{ color: 'var(--color-text-secondary)' }}><Settings size={24} /></span>
                <span class="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Ajustes</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div class="h-full flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {renderView()}
      {view === 'main' && currentTrack && <MiniPlayer />}

      {/* Modals */}
      <ContextMenuOverlay />

      {/* Add to playlist modal */}
      {addToPlaylistModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setAddToPlaylistModal(null)}>
          <div class="w-full max-w-sm rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Añadir a playlist</h3>
            {playlists.length === 0
              ? <p class="text-xs" style={{ color: 'var(--color-text-secondary)' }}>No hay playlists. Crea una primero.</p>
              : playlists.map(pl => (
                <button
                  key={pl.id}
                  class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ color: 'var(--color-text)' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-hover)'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  onClick={() => handleAddTrackToPlaylist(pl.id, addToPlaylistModal.id)}
                >{pl.name}</button>
              ))
            }
          </div>
        </div>
      )}

      {/* Create playlist modal */}
      {createPlaylistModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setCreatePlaylistModal(false)}>
          <div class="w-full max-w-sm rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Nueva playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onInput={e => setNewPlaylistName((e.target as HTMLInputElement).value)}
              placeholder="Nombre de la playlist"
              class="w-full px-3 py-2.5 rounded-xl text-sm border-none outline-none mb-3"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleCreatePlaylist(); }}
              aria-label="Nombre de la playlist"
            />
            <div class="flex gap-2 justify-end">
              <button class="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setCreatePlaylistModal(false)}>Cancelar</button>
              <button class="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }} onClick={() => handleCreatePlaylist()}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename modal */}
      {renameModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setRenameModal(null)}>
          <div class="w-full max-w-sm rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Renombrar playlist</h3>
            <input
              type="text"
              value={renameModal.current}
              onInput={e => setRenameModal({ ...renameModal, current: (e.target as HTMLInputElement).value })}
              class="w-full px-3 py-2.5 rounded-xl text-sm border-none outline-none mb-3"
              style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)' }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleRenamePlaylist(); }}
              aria-label="Nuevo nombre"
            />
            <div class="flex gap-2 justify-end">
              <button class="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setRenameModal(null)}>Cancelar</button>
              <button class="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-accent)' }} onClick={() => handleRenamePlaylist()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDialog && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setConfirmDialog(null)}>
          <div class="w-full max-w-sm rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <p class="text-sm mb-4" style={{ color: 'var(--color-text)' }}>{confirmDialog.message}</p>
            <div class="flex gap-2 justify-end">
              <button class="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--color-text-secondary)' }} onClick={() => setConfirmDialog(null)}>Cancelar</button>
              <button class="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: 'var(--color-danger)' }} onClick={confirmDialog.onConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Sort modal */}
      {showSort && (
        <div class="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setShowSort(false)}>
          <div class="w-full max-w-md rounded-t-2xl p-4 safe-bottom" style={{ backgroundColor: 'var(--color-surface)' }} onClick={e => e.stopPropagation()}>
            <h3 class="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Ordenar por</h3>
            {([['title', 'Título'], ['artist', 'Artista'], ['album', 'Álbum'], ['duration', 'Duración'], ['dateAdded', 'Agregado'], ['playCount', 'Reproducciones'], ['fileName', 'Archivo']] as [SortField, string][]).map(([field, label]) => (
              <button
                key={field}
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                style={{ color: sortField === field ? 'var(--color-accent)' : 'var(--color-text)' }}
                onClick={() => { setSortField(field); if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); setShowSort(false); }}
              >
                {label}
                {sortField === field && <span class="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm text-white shadow-lg" style={{ backgroundColor: 'var(--color-text)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}