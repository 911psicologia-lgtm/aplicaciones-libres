package com.happy.musicplay;

import android.graphics.Bitmap;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import java.util.CopyOnWriteArrayList;

/**
 * R10.15 · CAPA B · PlaybackBus
 * ---------------------------------------------------------------
 * UN SOLO ESTADO DE REPRODUCCIÓN: la app web (HAPPY PWA dentro del
 * WebView) es la ÚNICA fuente de verdad. Esta capa nativa solo
 * guarda el último snapshot publicado por el puente para que el
 * overlay y la MediaSession lo reflejen, y devuelve comandos hacia
 * el web vía evaluateJavascript. NUNCA decodifica audio propio.
 */
public final class PlaybackBus {

    /** Snapshot publicado por la web (floatbridge.js → state). */
    public static class State {
        public String title = "", artist = "", album = "", source = "", artworkUrl = "";
        public long duration = 0, currentTime = 0;
        public boolean isPlaying = false, podcast = false, hasTrack = false;
    }

    private static final PlaybackBus INSTANCE = new PlaybackBus();
    public static PlaybackBus get() { return INSTANCE; }

    public final State state = new State();
    private WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
    private Bitmap artworkBitmap;
    private String artworkBitmapUrl;

    public interface Listener { void onStateChanged(State s); }

    private PlaybackBus() {}

    public void attachWebView(WebView wv) { this.webView = wv; }
    public void detachWebView() { this.webView = null; }

    public Bitmap artwork() { return artworkBitmap; }
    public void setArtwork(Bitmap bmp, String url) {
        artworkBitmap = bmp; artworkBitmapUrl = url;
        notifyListeners();
    }
    public String artworkUrl() { return artworkBitmapUrl; }

    public void addListener(Listener l) { if (!listeners.contains(l)) listeners.add(l); }
    public void removeListener(Listener l) { listeners.remove(l); }

    /** Llamado por NativeBridge cuando la web publica {type:'state'}. */
    public void publish(boolean hasTrack, String title, String artist, String album,
                        String source, long duration, long currentTime,
                        boolean isPlaying, boolean podcast, String artworkUrl) {
        state.hasTrack = hasTrack;
        if (hasTrack) {
            state.title = ns(title); state.artist = ns(artist); state.album = ns(album);
            state.source = ns(source);
            state.duration = duration; state.currentTime = currentTime;
            state.isPlaying = isPlaying; state.podcast = podcast;
            if (artworkUrl != null && !artworkUrl.equals(state.artworkUrl)) {
                state.artworkUrl = artworkUrl;
                fetchArtwork(artworkUrl);
            }
        }
        notifyListeners();
    }

    private void notifyListeners() {
        main.post(() -> { for (Listener l : listeners) l.onStateChanged(state); });
    }

    /** Comando web ← nativo (overlay / MediaSession / notificación → HAPPY web). */
    public void evalJs(String js) {
        WebView wv = webView;
        if (wv == null) return;
        main.post(() -> {
            try { wv.evaluateJavascript(js, null); } catch (Exception ignored) {}
        });
    }

    public void mediaCommand(String type, String extraJson) {
        String payload = extraJson == null ? "" : "," + extraJson;
        evalJs("window.MpNativeBridge&&window.MpNativeBridge.fromNative(JSON.stringify({type:'" + type + "'" + payload + "}))");
    }

    /** Igual que mediaCommand pero con argumentos JSON crudos (sin llaves). */
    public void mediaCommandArgs(String type, String rawArgs) {
        mediaCommand(type, rawArgs == null || rawArgs.isEmpty() ? null : rawArgs);
    }

    private void fetchArtwork(String url) {
        new Thread(() -> {
            try {
                java.net.URL u = new java.net.URL(url);
                java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
                c.setConnectTimeout(6000); c.setReadTimeout(8000);
                c.setInstanceFollowRedirects(true);
                Bitmap bmp = android.graphics.BitmapFactory.decodeStream(c.getInputStream());
                c.disconnect();
                if (bmp != null) setArtwork(bmp, url);
            } catch (Exception ignored) {}
        }, "happy-artwork").start();
    }

    private static String ns(String s) { return s == null ? "" : s; }
}
