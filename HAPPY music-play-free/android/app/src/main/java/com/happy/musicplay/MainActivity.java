package com.happy.musicplay;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.RectF;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Rational;
import android.view.ViewGroup;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

/**
 * R10.15 · CAPA B · MainActivity
 * ---------------------------------------------------------------
 * Anfitrión WebView de la PWA HAPPY (la app web es el núcleo y el
 * ÚNICO reproductor). Añade solo capacidades del sistema:
 *  - carga de la PWA (URL desplegada o bundle local assets/www)
 *  - puente JS window.HappyNative (NativeBridge)
 *  - flujo de permiso overlay SOLO al activar ▣ FLOTANTE
 *  - Picture-in-Picture nativo cuando la fuente es video
 *  - reintento de permiso al volver de Ajustes (sin romper nada)
 */
public class MainActivity extends Activity {

    /** URL de tu despliegue actual (GitHub → Cloudflare). Cámbiala aquí. */
    static final String DEFAULT_URL = "https://TU-DESPLIEGUE-HAPPY.example/index.html";
    static final int REQ_OVERLAY_SETTINGS = 4101;
    static final int REQ_NOTIFICATIONS = 4102;

    WebView webView;
    NativeBridge bridge;
    final Handler ui = new Handler(Looper.getMainLooper());

    private boolean overlayPermissionPending = false;
    private boolean notificationsRequested = false;

    public void post(Runnable r) { ui.post(r); }

    @SuppressLint("SetJavaScriptEnabled")
    @Override protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);              // IndexedDB/localStorage de la PWA
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // audio estable en segundo plano
        s.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setAllowFileAccess(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView v, String url) {
                Uri u = Uri.parse(url);
                String scheme = u.getScheme() == null ? "" : u.getScheme();
                // Esquemas externos (intent:, market:, spotify:, mailto:…) → fuera del WebView.
                return !scheme.equals("http") && !scheme.equals("https") && !scheme.equals("file")
                        && !scheme.equals("about") && !scheme.equals("data");
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(final PermissionRequest request) {
                // SOLO micro si la app web lo pide (Estudio Podcast). Nada más.
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });

        bridge = new NativeBridge(this);
        webView.addJavascriptInterface(bridge, "HappyNative"); // window.HappyNative
        PlaybackBus.get().attachWebView(webView);

        webView.loadUrl(resolveStartUrl());
    }

    private String resolveStartUrl() {
        try {
            // Si se empaquetó una copia local de la PWA en assets/www, usarla.
            getAssets().open("www/index.html").close();
            return "file:///android_asset/www/index.html";
        } catch (Exception e) {
            return DEFAULT_URL;
        }
    }

    /* ══════════════ FLOTANTE: flujo de permiso (solo al activar ▣) ══════════════ */

    void startFloatingFlow() {
        boolean granted = android.provider.Settings.canDrawOverlays(this);
        if (granted) {
            FloatingPlayerService.start(this);
            bridge.sendPermissionResult(true, false);
            return;
        }
        overlayPermissionPending = true;
        // Explicación sencilla + ajustes. Nada se rompe si el usuario niega.
        Toast.makeText(this, R.string.overlay_explanation, Toast.LENGTH_LONG).show();
        requestNotifPermissionIfNeeded();
        try {
            startActivityForResult(NativeBridge.overlaySettingsIntent(this), REQ_OVERLAY_SETTINGS);
        } catch (Exception e) {
            try { startActivityForResult(new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:" + getPackageName())), REQ_OVERLAY_SETTINGS); } catch (Exception ignored) {}
        }
        bridge.sendPermissionResult(false, true); // pending → web espera el resultado
    }

    private void requestNotifPermissionIfNeeded() {
        if (notificationsRequested || Build.VERSION.SDK_INT < 33) return;
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED) return;
        notificationsRequested = true;
        ActivityCompat.requestPermissions(this,
                new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, REQ_NOTIFICATIONS);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_OVERLAY_SETTINGS && overlayPermissionPending) {
            overlayPermissionPending = false;
            boolean granted = android.provider.Settings.canDrawOverlays(this);
            if (granted) {
                FloatingPlayerService.start(this);
                bridge.sendPermissionResult(true, false);
            } else {
                // Negado → la web muestra REINTENTAR / SEGUIR EN HAPPY. La música sigue.
                bridge.sendPermissionResult(false, false);
            }
        }
    }

    /* ══════════════ PICTURE-IN-PICTURE nativo (video) ══════════════ */

    void enterNativePip() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            PlaybackBus.get().mediaCommandArgs("pip/result", "\"active\":false,\"error\":\"requiere Android 8+\"");
            return;
        }
        try {
            Rational ratio = new Rational(16, 9);
            android.app.PictureInPictureParams params =
                    new android.app.PictureInPictureParams.Builder().setAspectRatio(ratio).build();
            enterPictureInPictureMode(params);
            PlaybackBus.get().mediaCommandArgs("pip/result", "\"active\":true");
        } catch (Exception e) {
            PlaybackBus.get().mediaCommandArgs("pip/result",
                    "\"active\":false,\"error\":\"" + String.valueOf(e.getMessage()).replace("\"", "'") + "\"");
        }
    }

    @Override public void onPictureInPictureModeChanged(boolean isInPip, Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPip, newConfig);
        PlaybackBus.get().mediaCommandArgs("pip/state", "\"active\":" + isInPip);
    }

    /* ══════════════ Ciclo de vida ══════════════ */

    @Override public void onResume() {
        super.onResume();
        if (bridge != null) ui.postDelayed(() -> bridge.sendNativeHello(), 350);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else {
            // Ir a HOME sin destruir la Activity: el audio sigue con el servicio.
            try {
                Intent home = new Intent(Intent.ACTION_MAIN);
                home.addCategory(Intent.CATEGORY_HOME);
                startActivity(home);
            } catch (Exception ignored) {}
        }
    }

    @Override protected void onDestroy() {
        PlaybackBus.get().detachWebView();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
