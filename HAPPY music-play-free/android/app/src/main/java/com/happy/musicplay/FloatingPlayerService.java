package com.happy.musicplay;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

/**
 * R10.15 · CAPA B · FloatingPlayerService
 * ---------------------------------------------------------------
 * Servicio en primer plano (foregroundServiceType=mediaPlayback):
 *  1) Mantiene viva la reproducción del WebView al salir a HOME,
 *     cambiar de app o bloquear la pantalla (wake lock parcial).
 *  2) MediaSession + notificación MediaStyle (portada, título,
 *     artista, ⏮ ▶/⏸ ⏭) sincronizadas con el ÚNICO estado real
 *     (la web, vía PlaybackBus).
 *  3) Overlay real TYPE_APPLICATION_OVERLAY: compacto y expandido,
 *     arrastrable por la barra handle, snap a bordes, posición
 *     persistida (floatingX/floatingY/floatingExpanded).
 *
 * El botón ✕ SOLO cierra la ventana: el audio continúa en segundo
 * plano y el usuario puede detenerlo desde la notificación, la
 * pantalla bloqueada o HAPPY. El servicio se retira solo cuando la
 * web reporta que no hay pista (track:null) estable.
 */
public class FloatingPlayerService extends Service implements PlaybackBus.Listener {

    public static final String CHANNEL_ID = "happy_playback";
    private static final int NOTIF_ID = 1015;
    private static final String PREFS = "happy_floating";
    private static final long NULL_TRACK_GRACE_MS = 4000;

    public static void start(Context ctx) {
        Intent i = new Intent(ctx, FloatingPlayerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(i);
        else ctx.startService(i);
    }

    public static void stop(Context ctx) {
        ctx.stopService(new Intent(ctx, FloatingPlayerService.class));
    }

    private final Handler ui = new Handler(Looper.getMainLooper());
    private WindowManager wm;
    private View overlayView;
    private boolean overlayShown = false;
    private MediaSessionCompat session;
    private PowerManager.WakeLock wakeLock;

    // UI
    private TextView compactTitle, compactArtist, expandedTitle, expandedArtist, timeNow, timeTotal;
    private Button compactPlay, expandedPlay;
    private ImageView compactArt, expandedArt;
    private SeekBar seek;
    private View compactBox, expandedBox;

    private boolean expanded = false;
    private boolean userSeeking = false;
    private long lastNonNull = 0;
    private long currentDurationMs = 0;

    private final Runnable poll = new Runnable() {
        @Override public void run() {
            // Respaldo por sondeo: la web puede congelar timers en segundo plano.
            // snapshotSync() devuelve el último snapshot cacheado (JSON síncrono).
            PlaybackBus.get().evalJs(
                "window.MP_FLOATING&&window.MP_FLOATING.snapshotSync&&window.MpNativeBridge&&window.MpNativeBridge.fromNative('__POLL__'+window.MP_FLOATING.snapshotSync())");
            ui.postDelayed(this, 1000);
        }
    };

    @Override public IBinder onBind(Intent intent) { return null; }

    @Override public void onCreate() {
        super.onCreate();
        createChannel();
        startForeground(NOTIF_ID, buildNotification());
        PlaybackBus.get().addListener(this);
        acquireWakeLock();
        setupMediaSession();
        ui.postDelayed(this::showOverlayIfPermitted, 60);
        ui.postDelayed(poll, 1200);
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) { return START_STICKY; }

    @Override public void onDestroy() {
        ui.removeCallbacks(poll);
        PlaybackBus.get().removeListener(this);
        hideOverlay();
        releaseSession();
        releaseWakeLock();
        super.onDestroy();
    }

    /* ══════════════ OVERLAY REAL ══════════════ */

    private void showOverlayIfPermitted() {
        if (overlayShown || !SettingsCompat.canDrawOverlays(this)) {
            if (!SettingsCompat.canDrawOverlays(this)) {
                PlaybackBus.get().mediaCommand("media/pause", null); // no-op seguro
                stopSelf();
            }
            return;
        }
        wm = (WindowManager) getSystemService(WINDOW_SERVICE);
        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_player, null);
        bindViews();

        SharedPreferences p = getSharedPreferences(PREFS, MODE_PRIVATE);
        expanded = p.getBoolean("floatingExpanded", false);
        applyMode(false);

        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                dp(246), WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        lp.x = p.getInt("floatingX", -1);
        lp.y = p.getInt("floatingY", dp(80));
        wm.addView(overlayView, lp);
        overlayShown = true;
        clampPosition(lp);
        bindDrag(lp);
        bindControls();
        PlaybackBus.get().mediaCommandArgs("native/hello", "\"capabilities\":{\"overlay\":true,\"pip\":true,\"service\":true,\"version\":1}");
        onStateChanged(PlaybackBus.get().state);
    }

    private void bindViews() {
        compactTitle = overlayView.findViewById(R.id.compactTitle);
        compactArtist = overlayView.findViewById(R.id.compactArtist);
        compactPlay = overlayView.findViewById(R.id.btnCompactPlay);
        compactArt = overlayView.findViewById(R.id.compactArt);
        expandedTitle = overlayView.findViewById(R.id.expandedTitle);
        expandedArtist = overlayView.findViewById(R.id.expandedArtist);
        expandedPlay = overlayView.findViewById(R.id.btnExpandedPlay);
        expandedArt = overlayView.findViewById(R.id.expandedArt);
        timeNow = overlayView.findViewById(R.id.timeNow);
        timeTotal = overlayView.findViewById(R.id.timeTotal);
        seek = overlayView.findViewById(R.id.expandedSeek);
        compactBox = overlayView.findViewById(R.id.compactBox);
        expandedBox = overlayView.findViewById(R.id.expandedBox);
    }

    private void applyMode(boolean persist) {
        if (overlayView == null) return;
        compactBox.setVisibility(expanded ? View.GONE : View.VISIBLE);
        expandedBox.setVisibility(expanded ? View.VISIBLE : View.GONE);
        if (persist) getSharedPreferences(PREFS, MODE_PRIVATE)
                .edit().putBoolean("floatingExpanded", expanded).apply();
        if (wm != null && overlayShown) {
            WindowManager.LayoutParams lp = (WindowManager.LayoutParams) overlayView.getLayoutParams();
            lp.width = expanded ? dp(300) : dp(246);
            try { wm.updateViewLayout(overlayView, lp); clampPosition(lp); } catch (Exception ignored) {}
        }
    }

    private void bindDrag(WindowManager.LayoutParams lp) {
        View handle = overlayView.findViewById(R.id.overlayHandle);
        handle.setOnTouchListener(new View.OnTouchListener() {
            float downX, downY; int startX, startY; boolean moved = false;
            @Override public boolean onTouch(View v, MotionEvent e) {
                switch (e.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        downX = e.getRawX(); downY = e.getRawY();
                        startX = lp.x; startY = lp.y; moved = false; return true;
                    case MotionEvent.ACTION_MOVE:
                        float ddx = e.getRawX() - downX, ddy = e.getRawY() - downY;
                        if (Math.abs(ddx) > 4 || Math.abs(ddy) > 4) moved = true;
                        lp.x = startX + (int) ddx; lp.y = startY + (int) ddy;
                        try { wm.updateViewLayout(overlayView, lp); } catch (Exception ignored) {}
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (moved) snapToEdge(lp);
                        return true;
                }
                return false;
            }
        });
        // Toque en la carátula compacta ⇄ expandir/contraer.
        View.OnClickListener toggle = v -> { expanded = !expanded; applyMode(true); };
        compactArt.setOnClickListener(toggle);
        expandedArt.setOnClickListener(toggle);
    }

    /** SNAP TO EDGE: al soltar cerca de un borde, imán horizontal suave. */
    private void snapToEdge(WindowManager.LayoutParams lp) {
        int w = overlayView.getWidth();
        int vw = Resources.getSystem().getDisplayMetrics().widthPixels;
        int targetX = (lp.x + w / 2) < vw / 2 ? dp(8) : vw - w - dp(8);
        int fromX = lp.x;
        long dur = 180;
        long t0 = android.os.SystemClock.uptimeMillis();
        ui.post(new Runnable() {
            @Override public void run() {
                float f = Math.min(1f, (android.os.SystemClock.uptimeMillis() - t0) / (float) dur);
                float ease = 1 - (1 - f) * (1 - f);
                lp.x = (int) (fromX + (targetX - fromX) * ease);
                try { wm.updateViewLayout(overlayView, lp); } catch (Exception ignored) {}
                if (f < 1f) ui.postDelayed(this, 16);
                else getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                        .putInt("floatingX", lp.x).putInt("floatingY", lp.y).apply();
            }
        });
    }

    private void clampPosition(WindowManager.LayoutParams lp) {
        int w = overlayView.getWidth(), h = overlayView.getHeight();
        int vw = Resources.getSystem().getDisplayMetrics().widthPixels;
        int vh = Resources.getSystem().getDisplayMetrics().heightPixels;
        if (w == 0) w = dp(246); if (h == 0) h = dp(150);
        lp.x = Math.max(dp(4), Math.min(vw - w - dp(4), lp.x));
        lp.y = Math.max(dp(4), Math.min(vh - h - dp(40), lp.y));
        try { wm.updateViewLayout(overlayView, lp); } catch (Exception ignored) {}
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                .putInt("floatingX", lp.x).putInt("floatingY", lp.y).apply();
    }

    private void bindControls() {
        PlaybackBus bus = PlaybackBus.get();
        compactPlay.setOnClickListener(v -> bus.mediaCommand("media/toggle", null));
        expandedPlay.setOnClickListener(v -> bus.mediaCommand("media/toggle", null));
        overlayView.findViewById(R.id.btnCompactPrev).setOnClickListener(v -> bus.mediaCommand("media/prev", null));
        overlayView.findViewById(R.id.btnCompactNext).setOnClickListener(v -> bus.mediaCommand("media/next", null));
        overlayView.findViewById(R.id.btnExpandedPrev).setOnClickListener(v -> bus.mediaCommand("media/prev", null));
        overlayView.findViewById(R.id.btnExpandedNext).setOnClickListener(v -> bus.mediaCommand("media/next", null));

        // ✕ = cerrar SOLO la ventana; el audio continúa en segundo plano.
        overlayView.findViewById(R.id.btnClose).setOnClickListener(v -> hideOverlay());
        // ↗ = volver a HAPPY exactamente donde estaba (misma reproducción).
        overlayView.findViewById(R.id.btnReturnApp).setOnClickListener(v -> {
            Intent i = new Intent(this, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(i);
            hideOverlay();
        });

        seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override public void onProgressChanged(SeekBar sb, int progress, boolean fromUser) {}
            @Override public void onStartTrackingTouch(SeekBar sb) { userSeeking = true; }
            @Override public void onStopTrackingTouch(SeekBar sb) {
                userSeeking = false;
                double seconds = sb.getProgress() / 1000.0 * (currentDurationMs / 1000.0);
                bus.mediaCommand("media/seek", "\"position\":" + seconds);
            }
        });
    }

    private void hideOverlay() {
        if (overlayShown && wm != null && overlayView != null) {
            try { wm.removeView(overlayView); } catch (Exception ignored) {}
        }
        overlayShown = false;
        PlaybackBus.get().mediaCommandArgs("floating/stopped", "");
        // La ventana se cierra pero la música sigue: mantener notificación
        // mientras haya pista; si la web no reporta pista, retirar el servicio.
        ui.postDelayed(() -> {
            if (!PlaybackBus.get().state.hasTrack && !overlayShown) stopSelf();
        }, 1200);
    }

    /* ══════════════ MEDIA SESSION + NOTIFICACIÓN ══════════════ */

    private void setupMediaSession() {
        session = new MediaSessionCompat(this, "HAPPY", null, null);
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS
                | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);
        session.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPlay() { PlaybackBus.get().mediaCommand("media/play", null); }
            @Override public void onPause() { PlaybackBus.get().mediaCommand("media/pause", null); }
            @Override public void onSkipToNext() { PlaybackBus.get().mediaCommand("media/next", null); }
            @Override public void onSkipToPrevious() { PlaybackBus.get().mediaCommand("media/prev", null); }
            @Override public void onSeekTo(long pos) {
                PlaybackBus.get().mediaCommand("media/seek", "\"position\":" + (pos / 1000.0));
            }
            @Override public void onStop() { PlaybackBus.get().mediaCommand("media/stop", null); }
        });
        session.setActive(true);
    }

    private void releaseSession() {
        if (session != null) { try { session.release(); } catch (Exception ignored) {} session = null; }
    }

    @Override public void onStateChanged(PlaybackBus.State s) {
        // 1) Overlay
        if (overlayShown && overlayView != null) {
            compactTitle.setText(s.hasTrack ? s.title : "Sin reproducción");
            compactArtist.setText(s.hasTrack ? s.artist : "HAPPY");
            expandedTitle.setText(s.hasTrack ? s.title : "Sin reproducción");
            expandedArtist.setText(s.hasTrack ? s.artist : "HAPPY");
            String pp = s.isPlaying ? "⏸" : "▶";
            compactPlay.setText(pp); expandedPlay.setText(pp);
            Bitmap art = PlaybackBus.get().artwork();
            if (art != null) { compactArt.setImageBitmap(art); expandedArt.setImageBitmap(art); }
            else { compactArt.setImageResource(android.R.drawable.ic_media_play); expandedArt.setImageResource(android.R.drawable.ic_media_play); }
            currentDurationMs = s.duration;
            if (!userSeeking && s.duration > 0) {
                int pct = (int) (s.currentTime * 100 / s.duration);
                seek.setProgress(Math.max(0, Math.min(1000, pct * 10)));
            }
            timeNow.setText(fmt(s.currentTime));
            timeTotal.setText(fmt(s.duration));
        }
        // 2) MediaSession
        if (session != null) {
            MediaMetadataCompat.Builder mb = new MediaMetadataCompat.Builder()
                    .putString(MediaMetadataCompat.METADATA_KEY_TITLE, s.hasTrack ? s.title : "HAPPY")
                    .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, s.hasTrack ? s.artist : "")
                    .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, s.hasTrack ? s.album : "MUSIC PLAY");
            if (s.duration > 0) mb.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, s.duration);
            Bitmap art = PlaybackBus.get().artwork();
            if (art != null) { mb.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, art); mb.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, art); }
            session.setMetadata(mb.build());

            PlaybackStateCompat.Builder pb = new PlaybackStateCompat.Builder()
                    .setActions(PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PAUSE
                            | PlaybackStateCompat.ACTION_PLAY_PAUSE | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
                            | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS | PlaybackStateCompat.ACTION_SEEK_TO
                            | PlaybackStateCompat.ACTION_STOP)
                    .setState(s.isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                            s.currentTime, 1f);
            session.setPlaybackState(pb.build());
        }
        // 3) Notificación
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.notify(NOTIF_ID, buildNotification());
        // 4) Auto-retiro cuando la web ya no tiene pista
        if (s.hasTrack) lastNonNull = android.os.SystemClock.uptimeMillis();
        else if (android.os.SystemClock.uptimeMillis() - lastNonNull > NULL_TRACK_GRACE_MS) stopSelf();
    }

    private Notification buildNotification() {
        PlaybackBus.State s = PlaybackBus.get().state;
        Intent open = new Intent(this, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pOpen = PendingIntent.getActivity(this, 1, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(s.hasTrack ? s.title : "HAPPY · MUSIC PLAY")
                .setContentText(s.hasTrack ? s.artist : "Reproducción en segundo plano")
                .setLargeIcon(PlaybackBus.get().artwork())
                .setContentIntent(pOpen)
                .setOngoing(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setShowWhen(false)
                .addAction(new NotificationCompat.Action(android.R.drawable.ic_media_previous, "Anterior",
                        mediaPending("media/prev", 2)))
                .addAction(new NotificationCompat.Action(s.isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                        s.isPlaying ? "Pausa" : "Play", mediaPending(s.isPlaying ? "media/pause" : "media/play", 3)))
                .addAction(new NotificationCompat.Action(android.R.drawable.ic_media_next, "Siguiente",
                        mediaPending("media/next", 4)))
                .setStyle(new MediaStyle()
                        .setMediaSession(session == null ? null : session.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2));
        return b.build();
    }

    private PendingIntent mediaPending(String type, int rc) {
        // Acciones de la notificación → receptor propio → puente JS → HAPPY web.
        Intent i = new Intent(this, NotificationCommandReceiver.class);
        i.setAction(type); // p.ej. "media/prev"
        return PendingIntent.getBroadcast(this, rc, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private void createChannel() {
        NotificationChannel ch = new NotificationChannel(CHANNEL_ID,
                getString(R.string.notif_channel), NotificationManager.IMPORTANCE_LOW);
        ch.setDescription(getString(R.string.notif_channel_desc));
        ch.setShowBadge(false);
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.createNotificationChannel(ch);
    }

    /* ══════════════ WAKE LOCK (audio estable en segundo plano) ══════════════ */

    private void acquireWakeLock() {
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "HAPPY::floating-playback");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(4 * 60 * 60 * 1000L);
    }

    private void releaseWakeLock() {
        if (wakeLock != null) { try { wakeLock.release(); } catch (Exception ignored) {} wakeLock = null; }
    }

    private static int dp(int v) {
        return Math.round(v * Resources.getSystem().getDisplayMetrics().density);
    }

    private static String fmt(long ms) {
        long total = Math.max(0, ms / 1000);
        return String.format(java.util.Locale.US, "%d:%02d", total / 60, total % 60);
    }

    /** Compat mínimo (evita dependencia extra). */
    static final class SettingsCompat {
        static boolean canDrawOverlays(Context c) {
            return Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(c);
        }
    }
}
