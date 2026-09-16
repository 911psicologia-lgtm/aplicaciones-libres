package com.happy.musicplay;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

import java.io.File;
import java.io.IOException;

/**
 * R10.15 · MainActivity — WebView con WebViewAssetLoader (https appassets),
 * importación de archivos sueltos, importación de CARPETAS vía árbol nativo,
 * micrófono, y registro del WebView en el PlaybackBus (reproductor por defecto).
 */
public class MainActivity extends AppCompatActivity {

    public static final String START_URL =
            "https://appassets.androidplatform.net/assets/www/index.html";

    public static final int REQ_MICROPHONE = 4103;
    public static final int REQ_FILE_CHOOSER = 4104;
    public static final int REQ_NOTIFICATIONS = 4102;
    public static final int REQ_TREE_FOLDER = 4105;

    private WebView webView;
    private NativeBridge bridge;
    private ValueCallback<Uri[]> filePathCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .addPathHandler("/local/", new ImportedFilesHandler(this))
                .build();

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        webView.setBackgroundColor(0xFF0E1014);

        bridge = new NativeBridge(this);
        webView.addJavascriptInterface(bridge, "HappyNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String u = uri.toString();
                if (u.startsWith("https://appassets.androidplatform.net")
                        || u.startsWith("http://appassets.androidplatform.net")) {
                    return false; // navegación interna
                }
                try { // enlaces externos → navegador del sistema
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                // R10.15 · El WebView principal ES el reproductor por defecto
                PlaybackBus.setPlayerWebView(view);
                super.onPageFinished(view, url);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    for (String r : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) {
                            if (selfGranted(android.Manifest.permission.RECORD_AUDIO)) {
                                request.grant(request.getResources());
                            } else {
                                request.deny();
                                requestRuntimeMic();
                            }
                            return;
                        }
                    }
                    request.deny();
                });
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    Intent chooser = Intent.createChooser(intent, "Selecciona archivos");
                    startActivityForResult(chooser, REQ_FILE_CHOOSER);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        setContentView(webView);
        if (savedInstanceState == null) {
            webView.loadUrl(START_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }

        PlaybackBus.addListener(commandListener);

        // Permiso de notificaciones (Android 13+)
        if (Build.VERSION.SDK_INT >= 33) {
            if (!selfGranted("android.permission.POST_NOTIFICATIONS")) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"},
                        REQ_NOTIFICATIONS);
            }
        }
        FloatingPlayerService.ensureChannel(this);
    }

    private final PlaybackBus.Listener commandListener = new PlaybackBus.Listener() {
        @Override public void onCommand(String cmd) { /* el web ya lo recibe */ }
        @Override public void onBecomePlayer(String payload) { }
    };

    private boolean selfGranted(String perm) {
        return checkSelfPermission(perm) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestRuntimeMic() {
        requestPermissions(new String[]{android.Manifest.permission.RECORD_AUDIO}, REQ_MICROPHONE);
    }

    /** R10.15 · Abre el selector nativo de CARPETA (árbol) — pedido desde HappyNative. */
    public void startFolderImport() {
        try {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            startActivityForResult(intent, REQ_TREE_FOLDER);
        } catch (Exception e) {
            Toast.makeText(this, "Selector de carpeta no disponible", Toast.LENGTH_SHORT).show();
            notifyFolderError("error");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == REQ_FILE_CHOOSER) {
            Uri[] result = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int n = data.getClipData().getItemCount();
                    result = new Uri[n];
                    for (int i = 0; i < n; i++) result[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    result = new Uri[]{data.getData()};
                }
            }
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(result);
                filePathCallback = null;
            }
            return;
        }
        if (requestCode == REQ_TREE_FOLDER) {
            if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) {
                final Uri treeUri = data.getData();
                final int flags = data.getFlags() & Intent.FLAG_GRANT_READ_URI_PERMISSION;
                try {
                    getContentResolver().takePersistableUriPermission(treeUri, flags);
                } catch (SecurityException ignored) { }
                Toast.makeText(this, "Leyendo carpeta…", Toast.LENGTH_SHORT).show();
                FolderImporter.importTree(this, treeUri);
            } else {
                notifyFolderError("denied");
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    /** Notifica al web el resultado de la importación de carpeta. */
    public void notifyFolderResult(String json) {
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.__HAPPY_BRIDGE__&&window.__HAPPY_BRIDGE__.folderResult(" +
                        org.json.JSONObject.quote(json) + ");", null));
    }

    public void notifyFolderError(String reason) {
        try {
            org.json.JSONObject o = new org.json.JSONObject();
            o.put("ok", false);
            o.put("reason", reason);
            notifyFolderResult(o.toString());
        } catch (Exception ignored) { }
    }

    @Override
    protected void onPause() {
        super.onPause();
        // R10.15 · NO pausar el WebView si hay reproducción: es la causa de que
        // YouTube se detenga/silencie al bloquear la pantalla.
        if (!PlaybackBus.getState().playing) {
            try { webView.onPause(); } catch (Exception ignored) { }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        try { webView.onResume(); } catch (Exception ignored) { }
        // el intervalo del web (happyPushMediaState cada 900 ms) refresca el estado
    }

    @Override
    protected void onDestroy() {
        PlaybackBus.removeListener(commandListener);
        if (webView != null) {
            try {
                webView.loadUrl("about:blank");
                webView.removeAllViews();
                webView.destroy();
            } catch (Exception ignored) { }
        }
        super.onDestroy();
    }

    private void happyPushState() { /* estado mantenido por el web (intervalo 900 ms) */ }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else moveTaskToBack(true); // NO destruir: la música sigue con el servicio
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    /** Servidor local de los archivos importados (carpetas) bajo /local/<token>/<nombre>. */
    public static class ImportedFilesHandler implements WebViewAssetLoader.PathHandler {
        private final File rootDir;

        ImportedFilesHandler(Activity activity) {
            rootDir = new File(activity.getCacheDir(), "happy-imports");
        }

        @Override
        @Nullable
        public WebResourceResponse handle(String path) {
            try {
                if (path == null || path.isEmpty()) return notFound();
                String decoded = java.net.URLDecoder.decode(path.replaceFirst("^/+", ""), "UTF-8");
                File f = new File(rootDir, decoded);
                String canonical = f.getCanonicalPath();
                if (!canonical.startsWith(rootDir.getCanonicalPath())) return notFound();
                if (!f.exists() || !f.isFile()) return notFound();
                String mime = guessMime(f.getName());
                WebResourceResponse resp = new WebResourceResponse(mime, null,
                        new java.io.FileInputStream(f));
                resp.setResponseHeaders(java.util.Collections.singletonMap(
                        "Access-Control-Allow-Origin", "*"));
                return resp;
            } catch (IOException e) {
                return notFound();
            }
        }

        private WebResourceResponse notFound() {
            try {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", null,
                        new java.io.ByteArrayInputStream(new byte[0]));
            } catch (Exception e) {
                return null;
            }
        }

        private static String guessMime(String name) {
            String n = name.toLowerCase();
            if (n.endsWith(".mp3")) return "audio/mpeg";
            if (n.endsWith(".m4a") || n.endsWith(".m4b")) return "audio/mp4";
            if (n.endsWith(".aac")) return "audio/aac";
            if (n.endsWith(".wav")) return "audio/wav";
            if (n.endsWith(".ogg") || n.endsWith(".oga")) return "audio/ogg";
            if (n.endsWith(".opus")) return "audio/opus";
            if (n.endsWith(".flac")) return "audio/flac";
            if (n.endsWith(".wma")) return "audio/x-ms-wma";
            if (n.endsWith(".mp4") || n.endsWith(".m4v")) return "video/mp4";
            if (n.endsWith(".webm")) return "video/webm";
            if (n.endsWith(".mkv")) return "video/x-matroska";
            if (n.endsWith(".avi")) return "video/x-msvideo";
            if (n.endsWith(".mov")) return "video/quicktime";
            if (n.endsWith(".3gp")) return "video/3gpp";
            if (n.endsWith(".wmv")) return "video/x-ms-wmv";
            return "application/octet-stream";
        }
    }
}
