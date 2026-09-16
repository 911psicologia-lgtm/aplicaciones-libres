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

    @JavascriptInterface
    public String appVersion() { return "R10.16"; }

    @JavascriptInterface
    public String ping() { return "happy"; }
}
