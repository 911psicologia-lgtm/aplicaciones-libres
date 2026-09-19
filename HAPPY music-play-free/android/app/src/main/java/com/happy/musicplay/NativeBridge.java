package com.happy.musicplay;

import android.webkit.JavascriptInterface;

/**
 * R10.15 · HappyNative — puente JavaScript ↔ Android.
 * Métodos expuestos al WebView como window.HappyNative.
 */
public class NativeBridge {

    private final MainActivity activity;

    public NativeBridge(MainActivity activity) { this.activity = activity; }

    /** Estado de reproducción del web → MediaSession (metadata AVRCP) + notificación. */
    @JavascriptInterface
    public void mediaState(String json) {
        PlaybackBus.updateFromWeb(json == null ? "{}" : json);
        FloatingPlayerService.refreshNotification();
    }

    /**
     * Importar carpeta: abre el selector nativo de árbol (ACTION_OPEN_DOCUMENT_TREE).
     * El resultado llega por window.__HAPPY_BRIDGE__.folderResult(json).
     */
    @JavascriptInterface
    public void importFolder() {
        if (activity != null) activity.runOnUiThread(() -> activity.startFolderImport());
    }

    /** Ventana flotante real (TYPE_APPLICATION_OVERLAY) con la misma app. */
    @JavascriptInterface
    public void openFloat(String payload) {
        FloatingPlayerService.startFloating(activity, payload == null ? "" : payload);
    }

    /** Comandos de Radio Live y medios resueltos hacia el servicio ExoPlayer. */
    @JavascriptInterface
    public void postFromWeb(String message) {
        FloatingPlayerService.handleWebMessage(activity, message == null ? "{}" : message);
    }

    /** R10.25 · HAPPY BOOST nativo — activa/desactiva EQ+BassBoost+Loudness+Virtualizer
     *  en el audio session de ExoPlayer (Radio Live + YouTube delegado al servicio). */
    @JavascriptInterface
    public void setBoost(boolean enabled) {
        FloatingPlayerService.handleBoost(enabled);
    }

    /** R10.25 · Consulta si el BOOST nativo está activo (para sincronizar UI al arrancar). */
    @JavascriptInterface
    public boolean isBoostEnabled() {
        return FloatingPlayerService.isBoostEnabled();
    }

    @JavascriptInterface
    public String appVersion() { return "R10.25"; }

    @JavascriptInterface
    public String ping() { return "happy"; }
}
