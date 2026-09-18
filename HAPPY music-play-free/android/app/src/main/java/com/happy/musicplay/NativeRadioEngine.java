package com.happy.musicplay;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.media.audiofx.BassBoost;
import android.media.audiofx.Equalizer;
import android.media.audiofx.LoudnessEnhancer;
import android.media.audiofx.Virtualizer;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Log;

import androidx.media3.common.AudioAttributes;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.datasource.DefaultHttpDataSource;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory;

import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Reproductor nativo para Radio Live y audio remoto resuelto (YouTube). */
public final class NativeRadioEngine {
    private static final long[] RETRIES = {1000L, 2000L, 4000L, 8000L};
    private final Context app;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final ExoPlayer player;
    private String url = "", title = "MUSIC PLAY", artist = "", album = "", trackId = "", codec = "";
    private boolean active = false, live = false, released = false;
    private int retry = 0;
    private volatile boolean recording = false;
    private volatile HttpURLConnection recordingConnection;
    private volatile InputStream recordingInput;
    private volatile OutputStream recordingOutput;
    private long recordingStartedAt = 0L;

    // R10.18 · HAPPY BOOST nativo — android.media.audiofx sobre el audio session
    // de ExoPlayer. Aplica a Radio Live y a YouTube delegado al servicio nativo.
    private Equalizer equalizer;
    private BassBoost bassBoost;
    private LoudnessEnhancer loudnessEnhancer;
    private Virtualizer virtualizer;
    private int audioSessionId = 0;
    private boolean boostEnabled = false;
    private boolean effectsAttached = false;

    public NativeRadioEngine(Context context) {
        app = context.getApplicationContext();
        DefaultHttpDataSource.Factory http = new DefaultHttpDataSource.Factory()
                .setUserAgent("MUSIC PLAY HAPPY/R10.18")
                .setAllowCrossProtocolRedirects(true)
                .setConnectTimeoutMs(15000).setReadTimeoutMs(20000);
        player = new ExoPlayer.Builder(app)
                .setMediaSourceFactory(new DefaultMediaSourceFactory(http)).build();
        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build();
        player.setAudioAttributes(attrs, true);
        player.setHandleAudioBecomingNoisy(true);
        player.setWakeMode(C.WAKE_MODE_NETWORK);
        player.addListener(new Player.Listener() {
            @Override public void onPlaybackStateChanged(int state) {
                if (!active) return;
                if (state == Player.STATE_BUFFERING) publish("connecting", "");
                else if (state == Player.STATE_READY) { retry = 0; publish(player.getPlayWhenReady() ? "playing" : "paused", ""); }
                else if (state == Player.STATE_ENDED) publish("idle", "");
            }
            @Override public void onIsPlayingChanged(boolean value) { if (active) publish(value ? "playing" : "paused", ""); }
            @Override public void onPlayerError(PlaybackException error) { scheduleRetry(); }
            // R10.18 · cuando ExoPlayer asigna el audio session id, atamos los
            // efectos nativos (EQ, BassBoost, Loudness, Virtualizer).
            @Override public void onAudioSessionIdChanged(int sessionId) {
                audioSessionId = sessionId;
                attachAudioEffects();
            }
        });
        // Algunos dispositivos asignan el session id de inmediato
        try { audioSessionId = player.getAudioSessionId(); } catch (Throwable ignored) {}
        main.post(ticker);
    }

    public boolean isActive() { return active; }
    public boolean isLive() { return active && live; }
    public boolean isPlaying() { return active && player.isPlaying(); }

    // ════════════════════════════════════════════════════════════════
    // R10.18 · HAPPY BOOST nativo — android.media.audiofx
    // ════════════════════════════════════════════════════════════════
    //
    // Ata Equalizer + BassBoost + LoudnessEnhancer + Virtualizer al audio
    // session id de ExoPlayer. La curva BOOST replica la del JS:
    //   · sub-bass + bass fuertes
    //   · presencia vocal
    //   · aire en agudos
    //   · loudness +6 dB (con limitador interno del LoudnessEnhancer)
    //   · virtualizer ~50% (ensanchador estéreo)
    //
    // Todos los efectos se crean al recibir el audio session id (puede cambiar
    // entre tracks). Si BOOST está activo, se habilitan; si no, se deshabilitan
    // pero se mantienen creados para activarlos al instante cuando el usuario
    // pulse ★.
    private void attachAudioEffects() {
        if (effectsAttached || audioSessionId == 0) return;
        try {
            // R10.18 · Equalizer/BassBoost/Virtualizer no exponen isAvailable()
            // hasta API 21+; simplemente intentamos crearlos y capturamos cualquier
            // RuntimeException ("device not supported" en algunos OEM).
            if (equalizer == null) {
                try {
                    equalizer = new Equalizer(0, audioSessionId);
                    configureEqualizerBoost(equalizer);
                    equalizer.setEnabled(boostEnabled);
                } catch (Throwable t) { Log.w("HappyBoost", "Equalizer", t); }
            }
            if (bassBoost == null) {
                try {
                    bassBoost = new BassBoost(0, audioSessionId);
                    bassBoost.setStrength((short) 800); // 0-1000, fuerte
                    bassBoost.setEnabled(boostEnabled);
                } catch (Throwable t) { Log.w("HappyBoost", "BassBoost", t); }
            }
            if (Build.VERSION.SDK_INT >= 19 && loudnessEnhancer == null) {
                try {
                    loudnessEnhancer = new LoudnessEnhancer(audioSessionId);
                    loudnessEnhancer.setTargetGain(600); // mB = 6 dB
                    loudnessEnhancer.setEnabled(boostEnabled);
                } catch (Throwable t) { Log.w("HappyBoost", "LoudnessEnhancer", t); }
            }
            if (virtualizer == null) {
                try {
                    virtualizer = new Virtualizer(0, audioSessionId);
                    virtualizer.setStrength((short) 550); // 0-1000
                    virtualizer.setEnabled(boostEnabled);
                } catch (Throwable t) { Log.w("HappyBoost", "Virtualizer", t); }
            }
            effectsAttached = true;
        } catch (Throwable t) {
            Log.w("HappyBoost", "attachAudioEffects", t);
        }
    }

    /** Curva BOOST de 5 bandas (la que más dispositivos exponen). Mapea la
     *  curva JS de 8 bandas a las 5 bandas estándar de Android (60/230/910/3600/14000 Hz). */
    private void configureEqualizerBoost(Equalizer eq) {
        try {
            short bands = eq.getNumberOfBands();
            short[] range = eq.getBandLevelRange();
            short minLevel = range[0], maxLevel = range[1];
            //BOOST: +bass fuerte, +low-mid suave, +presence fuerte, +treble fuerte
            // Curva en mB (mili-Bel = décimas de dB). Equalizer usa mB.
            // +12 dB en 60Hz, +8 dB en 230Hz, +3 dB en 910Hz, +6 dB en 3600Hz, +9 dB en 14000Hz
            short[] boostLevels = {1200, 800, 300, 600, 900};
            for (short i = 0; i < bands && i < boostLevels.length; i++) {
                short target = (short) Math.max(minLevel, Math.min(maxLevel, boostLevels[i]));
                eq.setBandLevel(i, target);
            }
        } catch (Throwable t) {
            Log.w("HappyBoost", "configureEqualizerBoost", t);
        }
    }

    /** Activa/desactiva HAPPY BOOST en el pipeline nativo. Llamado desde
     *  NativeBridge.setBoost(boolean) → FloatingPlayerService.handleBoost(). */
    public void setBoostEnabled(boolean enabled) {
        boostEnabled = enabled;
        if (!effectsAttached) attachAudioEffects();
        try { if (equalizer != null) equalizer.setEnabled(enabled); } catch (Throwable ignored) {}
        try { if (bassBoost != null) bassBoost.setEnabled(enabled); } catch (Throwable ignored) {}
        try { if (loudnessEnhancer != null) loudnessEnhancer.setEnabled(enabled); } catch (Throwable ignored) {}
        try { if (virtualizer != null) virtualizer.setEnabled(enabled); } catch (Throwable ignored) {}
    }

    public boolean isBoostEnabled() { return boostEnabled; }

    public void handleMessage(String raw) {
        try {
            JSONObject msg = new JSONObject(raw == null ? "{}" : raw);
            String type = msg.optString("type", "");
            JSONObject p = msg.optJSONObject("payload"); if (p == null) p = new JSONObject();
            switch (type) {
                case "radio/play": play(p, true); break;
                case "radio/pause": pause(); break;
                case "radio/resume": resume(); break;
                case "radio/stop": stop(); break;
                case "radio/record/start": startRecording(p); break;
                case "radio/record/stop": stopRecording(); break;
                case "radio/fm/discover": send("native/radio/fm-capabilities", new JSONObject().put("available", false).put("message", "Este equipo no expone un sintonizador FM compatible. Puedes escuchar emisoras por Internet.")); break;
                case "radio/recording/open": openRecording(p); break;
                case "radio/recording/share": shareRecording(p); break;
                case "radio/recording/delete": deleteRecording(p); break;
                case "radio/recording/rename": renameRecording(p); break;
                case "media/play": play(p, false); break;
                case "media/pause": pause(); break;
                case "media/resume": resume(); break;
                case "media/stop": stop(); break;
            }
        } catch (Exception e) { error("No se pudo procesar el comando de audio"); }
    }

    public boolean handleCommand(String cmd) {
        if (!active) return false;
        if ("play".equals(cmd)) resume();
        else if ("pause".equals(cmd)) pause();
        else if ("toggle".equals(cmd)) { if (player.isPlaying()) pause(); else resume(); }
        else if ("stop".equals(cmd)) stop();
        else return false;
        return true;
    }

    private void play(JSONObject p, boolean asLive) {
        String target = p.optString(asLive ? "streamUrl" : "url", "").trim();
        if (!target.startsWith("https://")) { error("Solo se permiten emisiones HTTPS seguras"); return; }
        stopRecording();
        url = target; live = asLive; active = true; retry = 0;
        title = p.optString(asLive ? "name" : "title", asLive ? "Radio" : "MUSIC PLAY");
        artist = p.optString("artist", asLive ? "EN VIVO" : "");
        album = p.optString("album", asLive ? "HAPPY Radio" : "");
        trackId = p.optString(asLive ? "stationuuid" : "trackId", "");
        codec = p.optString("codec", "").toUpperCase(Locale.ROOT);
        player.setMediaItem(MediaItem.fromUri(url), Math.max(0L, p.optLong("startAtMs", 0L)));
        player.prepare(); player.play();
        publish("connecting", "");
    }

    public void pause() { if (!active) return; player.pause(); publish("paused", ""); }
    public void resume() { if (!active) return; player.play(); publish("playing", ""); }
    public void stop() {
        stopRecording(); active = false; player.stop();
        publish("idle", "");
    }

    private void scheduleRetry() {
        if (!active) return;
        if (retry >= RETRIES.length) { publish("error", "La emisora no está respondiendo"); return; }
        long delay = RETRIES[retry++];
        publish("retrying", "Reconectando en " + (delay / 1000) + " s…");
        main.postDelayed(() -> { if (active) { player.setMediaItem(MediaItem.fromUri(url)); player.prepare(); player.play(); } }, delay);
    }

    private final Runnable ticker = new Runnable() {
        @Override public void run() { if (!released) { if (active) updateBus(); main.postDelayed(this, 1000L); } }
    };

    private void updateBus() {
        try {
            JSONObject o = new JSONObject();
            o.put("title", title).put("artist", live ? "EN VIVO" : artist).put("album", album)
                    .put("playing", player.isPlaying()).put("positionMs", live ? 0L : Math.max(0L, player.getCurrentPosition()))
                    .put("durationMs", live ? 0L : Math.max(0L, player.getDuration())).put("canNext", true).put("canPrev", true).put("trackId", trackId);
            PlaybackBus.updateFromWeb(o.toString());
        } catch (Exception ignored) { }
    }

    private void publish(String state, String message) {
        updateBus();
        try {
            JSONObject p = new JSONObject().put("state", state).put("kind", live ? "radio" : "media")
                    .put("positionMs", live ? 0L : Math.max(0L, player.getCurrentPosition()))
                    .put("durationMs", live ? 0L : Math.max(0L, player.getDuration()));
            if (!message.isEmpty()) p.put("userMessage", message);
            send(live ? "native/radio/state" : "native/media/state", p);
        } catch (Exception ignored) { }
        FloatingPlayerService.refreshNotification();
    }

    private void startRecording(JSONObject p) {
        if (!active || !live || recording) return;
        String requested = p.optString("codec", codec).toUpperCase(Locale.ROOT);
        if (!(requested.matches("MP3|AAC\\+?|OGG|VORBIS|OPUS")) || p.optBoolean("hls", false)) {
            error("Esta emisión puede escucharse, pero no admite grabación progresiva segura"); return;
        }
        recording = true; recordingStartedAt = System.currentTimeMillis(); codec = requested;
        try { send("native/radio/recording", new JSONObject().put("active", true).put("elapsedMs", 0)); } catch (Exception ignored) { }
        io.execute(this::recordLoop);
    }

    private void recordLoop() {
        Uri uri = null; String name = ""; String mime = "audio/mpeg";
        try {
            String ext = "mp3";
            if (codec.contains("AAC")) { ext = "aac"; mime = "audio/aac"; }
            else if (codec.contains("OGG") || codec.contains("VORBIS") || codec.contains("OPUS")) { ext = "ogg"; mime = "audio/ogg"; }
            String safe = title.replaceAll("[^\\p{L}\\p{N}._-]+", "_"); if (safe.length() > 48) safe = safe.substring(0, 48);
            name = safe + "_" + new SimpleDateFormat("yyyy-MM-dd_HH-mm", Locale.US).format(new Date()) + "." + ext;
            ContentValues values = new ContentValues(); values.put(MediaStore.Audio.Media.DISPLAY_NAME, name); values.put(MediaStore.Audio.Media.MIME_TYPE, mime);
            if (Build.VERSION.SDK_INT >= 29) { values.put(MediaStore.Audio.Media.RELATIVE_PATH, Environment.DIRECTORY_MUSIC + "/HAPPY/Radio"); values.put(MediaStore.Audio.Media.IS_PENDING, 1); }
            ContentResolver cr = app.getContentResolver(); uri = cr.insert(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, values); if (uri == null) throw new Exception("MediaStore");
            recordingConnection = (HttpURLConnection) new URL(url).openConnection(); recordingConnection.setRequestProperty("User-Agent", "MUSIC PLAY HAPPY/R10.16"); recordingConnection.setConnectTimeout(15000); recordingConnection.setReadTimeout(3000); recordingConnection.setInstanceFollowRedirects(true);
            recordingInput = recordingConnection.getInputStream(); recordingOutput = cr.openOutputStream(uri, "w"); if (recordingOutput == null) throw new Exception("output");
            byte[] buf = new byte[64 * 1024]; int n;
            while (recording && (n = recordingInput.read(buf)) >= 0) if (n > 0) recordingOutput.write(buf, 0, n);
            recordingOutput.flush();
            if (Build.VERSION.SDK_INT >= 29) { ContentValues done = new ContentValues(); done.put(MediaStore.Audio.Media.IS_PENDING, 0); cr.update(uri, done, null, null); }
            long duration = Math.max(0L, System.currentTimeMillis() - recordingStartedAt);
            JSONObject p = new JSONObject().put("id", "radio-rec-" + System.currentTimeMillis()).put("outputName", name).put("stationName", title).put("createdAt", System.currentTimeMillis()).put("durationMs", duration).put("outputUri", uri.toString()).put("mime", mime);
            send("native/radio/recording-complete", p);
        } catch (Exception e) {
            if (uri != null) try { app.getContentResolver().delete(uri, null, null); } catch (Exception ignored) { }
            if (recording) error("No se pudo guardar la grabación");
        } finally { closeRecording(); recording = false; }
    }

    private void stopRecording() { if (!recording) return; recording = false; }
    private void closeRecording() {
        try { if (recordingInput != null) recordingInput.close(); } catch (Exception ignored) { }
        try { if (recordingOutput != null) recordingOutput.close(); } catch (Exception ignored) { }
        try { if (recordingConnection != null) recordingConnection.disconnect(); } catch (Exception ignored) { }
        recordingInput = null; recordingOutput = null; recordingConnection = null;
        try { send("native/radio/recording", new JSONObject().put("active", false)); } catch (Exception ignored) { }
    }

    private void openRecording(JSONObject p) { try { Intent i = new Intent(Intent.ACTION_VIEW).setDataAndType(Uri.parse(p.optString("uri")), p.optString("mime", "audio/*")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION); app.startActivity(i); } catch (Exception e) { error("No hay una app disponible para abrir la grabación"); } }
    private void shareRecording(JSONObject p) { try { Intent i = new Intent(Intent.ACTION_SEND).setType(p.optString("mime", "audio/*")).putExtra(Intent.EXTRA_STREAM, Uri.parse(p.optString("uri"))).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_GRANT_READ_URI_PERMISSION); app.startActivity(Intent.createChooser(i, "Compartir grabación").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); } catch (Exception e) { error("No se pudo compartir la grabación"); } }
    private void deleteRecording(JSONObject p) { try { app.getContentResolver().delete(Uri.parse(p.optString("uri")), null, null); } catch (Exception e) { error("No se pudo eliminar la grabación"); } }
    private void renameRecording(JSONObject p) { try { ContentValues v = new ContentValues(); v.put(MediaStore.Audio.Media.DISPLAY_NAME, p.optString("name", "Grabación")); app.getContentResolver().update(Uri.parse(p.optString("uri")), v, null, null); } catch (Exception e) { error("No se pudo renombrar la grabación"); } }

    private void error(String text) { try { send(live ? "native/radio/error" : "native/media/state", new JSONObject().put("state", "error").put("kind", live ? "radio" : "media").put("userMessage", text)); } catch (Exception ignored) { } }
    private static void send(String type, JSONObject payload) { try { PlaybackBus.sendNativeEvent(new JSONObject().put("type", type).put("payload", payload).toString()); } catch (Exception ignored) { } }

    public void release() {
        released = true; main.removeCallbacksAndMessages(null); stopRecording();
        // R10.18 · liberar efectos nativos antes que el player
        try { if (equalizer != null) { equalizer.setEnabled(false); equalizer.release(); equalizer = null; } } catch (Throwable ignored) {}
        try { if (bassBoost != null) { bassBoost.setEnabled(false); bassBoost.release(); bassBoost = null; } } catch (Throwable ignored) {}
        try { if (loudnessEnhancer != null) { loudnessEnhancer.setEnabled(false); loudnessEnhancer.release(); loudnessEnhancer = null; } } catch (Throwable ignored) {}
        try { if (virtualizer != null) { virtualizer.setEnabled(false); virtualizer.release(); virtualizer = null; } } catch (Throwable ignored) {}
        effectsAttached = false;
        player.release(); io.shutdownNow();
    }
}
