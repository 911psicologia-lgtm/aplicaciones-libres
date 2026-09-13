package com.happy.musicplay;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.webkit.JavascriptInterface;

import org.json.JSONObject;

/**
 * R10.15 · CAPA B · NativeBridge
 * ---------------------------------------------------------------
 * Puente JS (web → nativo). La web lo encuentra como window.HappyNative.
 * Protocolo floatbridge.js: mensajes JSON {type:...}.
 * Todos los permisos se solicitan SOLO cuando el usuario activa ▣ FLOTANTE.
 */
public class NativeBridge {

    private final MainActivity activity;

    public NativeBridge(MainActivity activity) { this.activity = activity; }

    @JavascriptInterface
    public void postFromWeb(String json) {
        try {
            // Sondeo del servicio: '__POLL__' + JSON del último snapshot cacheado.
            if (json != null && json.startsWith("__POLL__")) {
                JSONObject poll = new JSONObject(json.substring(8));
                publishPoll(poll);
                return;
            }
            JSONObject msg = new JSONObject(json == null ? "{}" : json);
            String type = msg.optString("type", "");
            switch (type) {
                case "web/hello":
                    sendNativeHello();
                    break;
                case "state": {
                    JSONObject t = msg.optJSONObject("track");
                    if (t == null) {
                        PlaybackBus.get().publish(false, "", "", "", "", 0, 0, false, false, null);
                    } else {
                        PlaybackBus.get().publish(true,
                                t.optString("title"), t.optString("artist"), t.optString("album"),
                                t.optString("source"), (long) (t.optDouble("duration", 0) * 1000),
                                (long) (t.optDouble("currentTime", 0) * 1000),
                                t.optBoolean("isPlaying"), t.optBoolean("podcast"),
                                msg.optString("artwork", ""));
                    }
                    break;
                }
                case "floating/start":
                    activity.post(() -> activity.startFloatingFlow());
                    break;
                case "floating/stop":
                    activity.post(() -> FloatingPlayerService.stop(activity));
                    break;
                case "pip/request":
                    activity.post(() -> activity.enterNativePip());
                    break;
                default:
                    break;
            }
        } catch (Exception ignored) {}
    }

    /** Publica el snapshot del sondeo en el bus (mismo formato que 'state'). */
    private void publishPoll(JSONObject msg) {
        JSONObject t = msg.optJSONObject("track");
        if (t == null) {
            PlaybackBus.get().publish(false, "", "", "", "", 0, 0, false, false, null);
        } else {
            PlaybackBus.get().publish(true,
                    t.optString("title"), t.optString("artist"), t.optString("album"),
                    t.optString("source"), (long) (t.optDouble("duration", 0) * 1000),
                    (long) (t.optDouble("currentTime", 0) * 1000),
                    t.optBoolean("isPlaying"), t.optBoolean("podcast"),
                    msg.optString("artwork", ""));
        }
    }

    /** Handshake: capacidades reales de la capa nativa (sin inventar soporte). */
    public void sendNativeHello() {
        boolean canOverlay = Settings.canDrawOverlays(activity);
        JSONObject caps = new JSONObject();
        try {
            caps.put("overlay", canOverlay);
            caps.put("pip", Build.VERSION.SDK_INT >= Build.VERSION_CODES.O);
            caps.put("service", true);
            caps.put("version", 1);
        } catch (Exception ignored) {}
        PlaybackBus.get().mediaCommandArgs("native/hello", "\"capabilities\":" + caps);
    }

    /** Resultado del flujo de permiso overlay → web decide el fallback. */
    public void sendPermissionResult(boolean granted, boolean pending) {
        PlaybackBus.get().mediaCommandArgs("floating/permission",
                "\"granted\":" + granted + ",\"pending\":" + pending);
    }

    public void sendFloatingStarted(boolean started) {
        PlaybackBus.get().mediaCommandArgs(started ? "floating/started" : "floating/stopped", "");
    }

    public static int overlayMaxWidthPx(Activity a) {
        DisplayMetrics dm = a.getResources().getDisplayMetrics();
        return Math.min(dm.widthPixels, dm.heightPixels);
    }

    public static Intent overlaySettingsIntent(Activity a) {
        return new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + a.getPackageName()));
    }
}
