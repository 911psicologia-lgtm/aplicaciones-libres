package com.happy.musicplay;

import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import java.lang.ref.WeakReference;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * R10.15 · PlaybackBus — única fuente de verdad entre la Activity (WebView principal),
 * el servicio de ventana flotante y la sesión multimedia.
 *
 * La reproducción SIEMPRE vive en un WebView (web es el reproductor). El servicio
 * nunca toca el audio: solo espeja estado (metadata AVRCP) y reenvía comandos.
 * IMPORTANTE: aquí no se pide foco de audio jamás (causaba el silenciado de
 * YouTube en pantalla bloqueada y la degradación de volumen).
 */
public final class PlaybackBus {

    public static class MediaState {
        public String title = "MUSIC PLAY";
        public String artist = "";
        public String album = "";
        public boolean playing = false;
        public long positionMs = 0L;
        public long durationMs = 0L;
        public boolean canNext = true;
        public boolean canPrev = true;
        public String trackId = "";
    }

    public interface Listener {
        void onCommand(String cmd);            // play / pause / toggle / next / prev
        void onBecomePlayer(String payload);   // JSON {trackId,posMs,playing}
    }

    private static volatile MediaState state = new MediaState();
    private static volatile WeakReference<WebView> playerWebView = new WeakReference<>(null);
    private static volatile WeakReference<WebView> floatWebView = new WeakReference<>(null);
    private static final CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
    private static final Handler main = new Handler(Looper.getMainLooper());

    private PlaybackBus() {}

    public static MediaState getState() { return state; }

    /** JSON del estado actual (para traspasos entre WebViews). */
    public static String playingStateJson() {
        MediaState s = state;
        try {
            org.json.JSONObject o = new org.json.JSONObject();
            o.put("title", s.title);
            o.put("artist", s.artist);
            o.put("album", s.album);
            o.put("playing", s.playing);
            o.put("positionMs", s.positionMs);
            o.put("durationMs", s.durationMs);
            o.put("trackId", s.trackId);
            return o.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    /** El WebView que ACTIVAMENTE reproduce (principal por defecto). */
    public static WebView getPlayerWebView() {
        WebView p = playerWebView.get();
        if (p != null) return p;
        return floatWebView.get();
    }

    public static void setPlayerWebView(WebView w) { playerWebView = new WeakReference<>(w); }
    public static void setFloatWebView(WebView w) { floatWebView = new WeakReference<>(w); }

    public static void addListener(Listener l) { if (l != null) listeners.add(l); }
    public static void removeListener(Listener l) { listeners.remove(l); }

    /** Estado entrante desde el web (HappyNative.mediaState). */
    public static void updateFromWeb(final String json) {
        try {
            org.json.JSONObject o = new org.json.JSONObject(json);
            MediaState s = new MediaState();
            s.title = o.optString("title", "MUSIC PLAY");
            s.artist = o.optString("artist", "");
            s.album = o.optString("album", "");
            s.playing = o.optBoolean("playing", false);
            s.positionMs = o.optLong("positionMs", 0L);
            s.durationMs = o.optLong("durationMs", 0L);
            s.canNext = o.optBoolean("canNext", true);
            s.canPrev = o.optBoolean("canPrev", true);
            s.trackId = o.optString("trackId", "");
            state = s;
        } catch (Exception ignored) { }
    }

    /** Comando desde notificación / MediaSession / ventana flotante → al WebView reproductor. */
    public static void sendCommand(final String cmd) {
        main.post(() -> {
            WebView w = getPlayerWebView();
            if (w != null) {
                w.evaluateJavascript(
                    "window.__HAPPY_BRIDGE__&&window.__HAPPY_BRIDGE__.cmd(" +
                    org.json.JSONObject.quote(cmd) + ");", null);
            }
            for (Listener l : listeners) {
                try { l.onCommand(cmd); } catch (Exception ignored) { }
            }
        });
    }

    /** Evento JSON nativo → módulo web (radio.js/app.js). */
    public static void sendNativeEvent(final String json) {
        main.post(() -> {
            WebView w = getPlayerWebView();
            if (w != null) w.evaluateJavascript(
                    "window.__HAPPY_BRIDGE__&&window.__HAPPY_BRIDGE__.nativeEvent(" +
                            org.json.JSONObject.quote(json == null ? "{}" : json) + ");", null);
        });
    }

    /** Traspaso de reproducción (ventana flotante toma el control). */
    public static void sendBecomePlayer(final WebView target, final String payload) {
        main.post(() -> {
            if (target != null) {
                target.evaluateJavascript(
                    "window.__HAPPY_BRIDGE__&&window.__HAPPY_BRIDGE__.becomePlayer(" +
                    org.json.JSONObject.quote(payload) + ");", null);
            }
            for (Listener l : listeners) {
                try { l.onBecomePlayer(payload); } catch (Exception ignored) { }
            }
        });
    }
}
