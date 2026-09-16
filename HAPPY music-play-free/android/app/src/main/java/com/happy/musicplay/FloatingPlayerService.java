package com.happy.musicplay;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;

/**
 * R10.15 · FloatingPlayerService
 *
 * ① VENTANA FLOTANTE REAL (TYPE_APPLICATION_OVERLAY): panel remoto compacto con
 *    título/artista, progreso y controles ⏮ ▶ ⏭ + botón para abrir la app.
 *    El audio SIEMPRE vive en el WebView principal (una sola fuente de sonido:
 *    imposible de duplicar). El WebView principal no se pausa en background.
 *
 * ② MediaSessionCompat ACTIVA con metadata (título/artista/álbum/duración) y
 *    PlaybackState (⏮ ▶ ⏭) → la pantalla del auto y los auriculares Bluetooth
 *    muestran la canción y controlan la reproducción (AVRCP).
 *
 * ③ NO SE PIDE FOCO DE AUDIO EN NINGÚN MOMETO: pedirlo silenciaba YouTube con
 *    pantalla bloqueada y degradaba el volumen del WebView (ducking).
 */
public class FloatingPlayerService extends Service {

    public static final String CHANNEL_ID = "happy_playback";
    public static final int NOTIF_ID = 1590;

    private static FloatingPlayerService instance;
    private NativeRadioEngine nativeEngine;
    private boolean tickerStarted = false;

    private MediaSessionCompat mediaSession;
    private WindowManager windowManager;
    private View floatView;
    private TextView floatTitle, floatArtist, floatTimeNow, floatTimeTotal;
    private ProgressBar floatProgress;
    private Button floatPlay;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private boolean expanded = false;

    public static boolean isRunning() { return instance != null; }

    public static void startFloating(Context context, String payload) {
        Context app = context.getApplicationContext();
        if (!Settings.canDrawOverlays(app)) {
            // pedir permiso de superposición y abrir la ventana al volver
            try {
                Intent i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        android.net.Uri.parse("package:com.happy.musicplay"));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                app.startActivity(i);
            } catch (Exception ignored) { }
            return;
        }
        Intent i = new Intent(app, FloatingPlayerService.class);
        i.putExtra("payload", payload == null ? "" : payload);
        if (Build.VERSION.SDK_INT >= 26) app.startForegroundService(i);
        else app.startService(i);
    }

    public static void refreshNotification() {
        final FloatingPlayerService svc = instance;
        if (svc != null) svc.ui.post(svc::updateNotificationAndSession);
    }

    public static void handleWebMessage(Context context, String message) {
        Context app = context.getApplicationContext();
        Intent i = new Intent(app, FloatingPlayerService.class)
                .putExtra("webMessage", message == null ? "{}" : message);
        if (Build.VERSION.SDK_INT >= 26) app.startForegroundService(i);
        else app.startService(i);
    }

    public static boolean handleCommand(String cmd) {
        FloatingPlayerService svc = instance;
        return svc != null && svc.nativeEngine != null && svc.nativeEngine.handleCommand(cmd);
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        ensureChannel(this);
        nativeEngine = new NativeRadioEngine(this);
        setupMediaSession();
        startForeground(NOTIF_ID, buildNotification());
        if (Settings.canDrawOverlays(this)) addFloatWindow();
        updateNotificationAndSession();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.hasExtra("webMessage") && nativeEngine != null) {
            nativeEngine.handleMessage(intent.getStringExtra("webMessage"));
        }
        if (intent != null && intent.hasExtra("payload")) {
            // el web envía el estado actual; lo reflejamos en panel y sesión
            updateNotificationAndSession();
        }
        if (!tickerStarted) { tickerStarted = true; ui.post(ticker); }
        return START_STICKY;
    }

    // ---------------------------------------------------------
    // MediaSession (AVRCP · pantalla del auto · auriculares)
    // ---------------------------------------------------------
    @SuppressLint("WrongConstant")
    private void setupMediaSession() {
        mediaSession = new MediaSessionCompat(this, "HAPPY");
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPlay() { if (!handleCommand("play")) PlaybackBus.sendCommand("play"); }
            @Override public void onPause() { if (!handleCommand("pause")) PlaybackBus.sendCommand("pause"); }
            @Override public void onSkipToNext() { PlaybackBus.sendCommand("next"); }
            @Override public void onSkipToPrevious() { PlaybackBus.sendCommand("prev"); }
        });
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS
                | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);
        mediaSession.setActive(true);
    }

    private void updateNotificationAndSession() {
        PlaybackBus.MediaState st = PlaybackBus.getState();

        MediaMetadataCompat.Builder md = new MediaMetadataCompat.Builder();
        md.putString(MediaMetadataCompat.METADATA_KEY_TITLE,
                st.title == null || st.title.length() == 0 ? "MUSIC PLAY" : st.title);
        md.putString(MediaMetadataCompat.METADATA_KEY_ARTIST, st.artist == null ? "" : st.artist);
        md.putString(MediaMetadataCompat.METADATA_KEY_ALBUM, st.album == null ? "" : st.album);
        if (st.durationMs > 0) {
            md.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, st.durationMs);
        }
        mediaSession.setMetadata(md.build());

        long actions = PlaybackStateCompat.ACTION_PLAY
                | PlaybackStateCompat.ACTION_PAUSE
                | PlaybackStateCompat.ACTION_PLAY_PAUSE
                | PlaybackStateCompat.ACTION_SKIP_TO_NEXT
                | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
                | PlaybackStateCompat.ACTION_STOP;
        float speed = st.playing ? 1f : 0f;
        @PlaybackStateCompat.State int state = st.playing
                ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(state, st.positionMs, speed)
                .build());

        updateFloatPanel(st);

        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIF_ID, buildNotification());
    }

    // ---------------------------------------------------------
    // Notificación multimedia (MediaStyle)
    // ---------------------------------------------------------
    private Notification buildNotification() {
        PlaybackBus.MediaState st = PlaybackBus.getState();
        PendingIntent piOpen = PendingIntent.getActivity(this, 1,
                new Intent(this, MainActivity.class)
                        .setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Action prev = new NotificationCompat.Action(
                android.R.drawable.ic_media_previous, "Anterior",
                commandPendingIntent("prev"));
        NotificationCompat.Action play = new NotificationCompat.Action(
                st.playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                st.playing ? "Pausa" : "Reproducir", commandPendingIntent("toggle"));
        NotificationCompat.Action next = new NotificationCompat.Action(
                android.R.drawable.ic_media_next, "Siguiente",
                commandPendingIntent("next"));
        Notification n = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentTitle(st.title == null || st.title.length() == 0 ? "MUSIC PLAY" : st.title)
                .setContentText(st.artist == null || st.artist.length() == 0
                        ? "Reproducción HAPPY" : st.artist)
                .setContentIntent(piOpen)
                .setOnlyAlertOnce(true)
                .setOngoing(st.playing)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .addAction(prev).addAction(play).addAction(next)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2))
                .build();
        return n;
    }

    private PendingIntent commandPendingIntent(String cmd) {
        Intent i = new Intent(this, NotificationCommandReceiver.class);
        i.setAction("com.happy.musicplay.CMD");
        i.putExtra("cmd", cmd);
        return PendingIntent.getBroadcast(this, cmd.hashCode(), i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel ch = new NotificationChannel(CHANNEL_ID,
                        "Reproducción HAPPY", NotificationManager.IMPORTANCE_LOW);
                ch.setDescription("Controles de reproducción de MUSIC PLAY");
                ch.setShowBadge(false);
                nm.createNotificationChannel(ch);
            }
        }
    }

    // ---------------------------------------------------------
    // Ventana flotante real (panel remoto)
    // ---------------------------------------------------------
    @SuppressLint("ClickableViewAccessibility")
    private void addFloatWindow() {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        if (floatView != null) return;

        final float density = getResources().getDisplayMetrics().density;
        final int barHeight = (int) (34 * density);
        final int pad = (int) (12 * density);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(Color.parseColor("#F20E1014"));
        bg.setCornerRadius(18 * density);
        bg.setStroke((int) (1 * density), Color.parseColor("#33FFFFFF"));
        root.setBackground(bg);

        // barra de arrastre
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(pad, 0, pad, 0);
        bar.setBackgroundColor(Color.parseColor("#26FFFFFF"));
        TextView handle = new TextView(this);
        handle.setText("⠿  MUSIC PLAY · FLOTANTE");
        handle.setTextColor(Color.parseColor("#CCFFFFFF"));
        handle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        handle.setPadding(0, barHeight / 3, 0, barHeight / 3);
        handle.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        Button close = new Button(this);
        close.setText("×");
        close.setTextColor(Color.WHITE);
        close.setBackgroundColor(Color.TRANSPARENT);
        close.setPadding((int) (10 * density), 0, (int) (10 * density), 0);
        close.setOnClickListener(v -> removeFloatWindow());
        bar.addView(handle);
        bar.addView(close);
        bar.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, barHeight));
        root.addView(bar);

        // metadata
        floatTitle = new TextView(this);
        floatTitle.setTextColor(Color.WHITE);
        floatTitle.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        floatTitle.setSingleLine(true);
        floatTitle.setPadding(pad, (int) (8 * density), pad, 0);
        floatArtist = new TextView(this);
        floatArtist.setTextColor(Color.parseColor("#99FFFFFF"));
        floatArtist.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        floatArtist.setSingleLine(true);
        floatArtist.setPadding(pad, (int) (2 * density), pad, 0);
        root.addView(floatTitle);
        root.addView(floatArtist);

        floatProgress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        floatProgress.setMax(1000);
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        plp.setMargins(pad, (int) (6 * density), pad, 0);
        floatProgress.setLayoutParams(plp);
        root.addView(floatProgress);

        LinearLayout times = new LinearLayout(this);
        times.setOrientation(LinearLayout.HORIZONTAL);
        floatTimeNow = new TextView(this);
        floatTimeNow.setTextColor(Color.parseColor("#88FFFFFF"));
        floatTimeNow.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
        floatTimeTotal = new TextView(this);
        floatTimeTotal.setTextColor(Color.parseColor("#88FFFFFF"));
        floatTimeTotal.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
        floatTimeTotal.setGravity(Gravity.END);
        floatTimeNow.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        floatTimeTotal.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        times.setPadding(pad, 0, pad, 0);
        times.addView(floatTimeNow);
        times.addView(floatTimeTotal);
        root.addView(times);

        // controles
        LinearLayout controls = new LinearLayout(this);
        controls.setOrientation(LinearLayout.HORIZONTAL);
        controls.setGravity(Gravity.CENTER);
        Button prev = new Button(this);
        prev.setText("⏮");
        floatPlay = new Button(this);
        floatPlay.setText("▶");
        Button next = new Button(this);
        next.setText("⏭");
        Button openApp = new Button(this);
        openApp.setText("⤢");
        openApp.setOnClickListener(v -> {
            Intent i = new Intent(this, MainActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            try { startActivity(i); } catch (Exception ignored) { }
        });
        prev.setOnClickListener(v -> PlaybackBus.sendCommand("prev"));
        floatPlay.setOnClickListener(v -> { if (!handleCommand("toggle")) PlaybackBus.sendCommand("toggle"); });
        next.setOnClickListener(v -> PlaybackBus.sendCommand("next"));
        Button[] btns = {prev, floatPlay, next, openApp};
        for (Button b : btns) {
            b.setTextColor(Color.WHITE);
            b.setBackgroundColor(Color.parseColor("#1AFFFFFF"));
            b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
            LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(0,
                    (int) (44 * density), 1f);
            blp.setMargins((int) (4 * density), (int) (8 * density),
                    (int) (4 * density), (int) (10 * density));
            b.setLayoutParams(blp);
            b.setAllCaps(false);
            controls.addView(b);
        }
        root.addView(controls);

        int w = (int) Math.min(
                getResources().getDisplayMetrics().widthPixels * 0.86f, 340 * density);
        int hCollapsed = LinearLayout.LayoutParams.WRAP_CONTENT;

        final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                w, hCollapsed,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT);
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = (int) (16 * density);
        params.y = (int) (120 * density);

        // arrastre por la barra + doble toque expande/colapsa
        bar.setOnTouchListener(new View.OnTouchListener() {
            private float downX, downY;
            private int startX, startY;
            private long downAt = 0;
            private boolean moved = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        downX = event.getRawX();
                        downY = event.getRawY();
                        startX = params.x;
                        startY = params.y;
                        downAt = System.currentTimeMillis();
                        moved = false;
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        float dx = event.getRawX() - downX, dy = event.getRawY() - downY;
                        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
                        params.x = startX + (int) dx;
                        params.y = startY + (int) dy;
                        try { windowManager.updateViewLayout(root, params); } catch (Exception ignored) { }
                        return true;
                    case MotionEvent.ACTION_UP:
                        if (!moved && System.currentTimeMillis() - downAt < 350) {
                            expanded = !expanded;
                            params.width = expanded ? WindowManager.LayoutParams.MATCH_PARENT : w;
                            try { windowManager.updateViewLayout(root, params); } catch (Exception ignored) { }
                        }
                        return true;
                }
                return false;
            }
        });

        try {
            windowManager.addView(root, params);
            floatView = root;
        } catch (Exception ignored) { }
    }

    private void removeFloatWindow() {
        if (floatView != null && windowManager != null) {
            try { windowManager.removeView(floatView); } catch (Exception ignored) { }
            floatView = null;
        }
    }

    private final Runnable ticker = new Runnable() {
        @Override
        public void run() {
            updateNotificationAndSession();
            ui.postDelayed(this, 1000);
        }
    };

    private static String fmt(long ms) {
        if (ms <= 0) return "0:00";
        long s = ms / 1000;
        return (s / 60) + ":" + String.format("%02d", s % 60);
    }

    private void updateFloatPanel(PlaybackBus.MediaState st) {
        if (floatView == null || floatTitle == null) return;
        floatTitle.setText(st.title == null || st.title.length() == 0 ? "Sin reproducción" : st.title);
        floatArtist.setText(st.artist == null || st.artist.length() == 0 ? "MUSIC PLAY · HAPPY" : st.artist);
        long d = Math.max(st.durationMs, 1);
        floatProgress.setProgress((int) Math.min(1000, st.positionMs * 1000 / d));
        floatTimeNow.setText(fmt(st.positionMs));
        floatTimeTotal.setText(fmt(st.durationMs));
        if (floatPlay != null) floatPlay.setText(st.playing ? "⏸" : "▶");
    }

    @Override
    public void onDestroy() {
        ui.removeCallbacksAndMessages(null);
        if (nativeEngine != null) { nativeEngine.release(); nativeEngine = null; }
        removeFloatWindow();
        if (mediaSession != null) {
            try {
                mediaSession.setActive(false);
                mediaSession.release();
            } catch (Exception ignored) { }
            mediaSession = null;
        }
        instance = null;
        super.onDestroy();
    }
}
