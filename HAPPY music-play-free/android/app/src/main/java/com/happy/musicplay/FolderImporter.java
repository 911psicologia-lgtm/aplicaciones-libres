package com.happy.musicplay;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;
import android.text.TextUtils;

import androidx.documentfile.provider.DocumentFile;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * R10.15 · FolderImporter — recupera la importación de CARPETAS dentro del APK.
 *
 * webkitdirectory no funciona en WebView (el file chooser aplasta la carpeta).
 * Flujo: ACTION_OPEN_DOCUMENT_TREE → recorrido DocumentFile (subcarpetas incluidas)
 * → copia de los audios a cacheDir/happy-imports/<token>/ → el web los descarga
 * por https://appassets.androidplatform.net/local/<token>/<archivo> usando la
 * MISMA tubería de importación de siempre (File + webkitRelativePath).
 */
public final class FolderImporter {

    private static final ExecutorService POOL = Executors.newSingleThreadExecutor();
    private static final Set<String> AUDIO_EXT = new HashSet<>(Arrays.asList(
            "mp3", "m4a", "m4b", "aac", "wav", "ogg", "oga", "opus", "flac", "wma",
            "mp4", "m4v", "webm", "mkv", "avi", "mov", "3gp", "wmv"));
    private static final int MAX_FILES = 10000;
    private static final long MAX_TOTAL_BYTES = 20L * 1024 * 1024 * 1024; // 20 GB

    private FolderImporter() {}

    public static void importTree(MainActivity activity, Uri treeUri) {
        POOL.execute(() -> {
            String token = "f" + System.currentTimeMillis();
            File outDir = new File(activity.getCacheDir(), "happy-imports/" + token);
            if (!outDir.mkdirs() && !outDir.isDirectory()) {
                fail(activity, "error");
                return;
            }
            DocumentFile root = DocumentFile.fromTreeUri(activity, treeUri);
            if (root == null || !root.canRead()) {
                fail(activity, "denied");
                return;
            }
            String rootName = safe(root.getName());
            JSONArray files = new JSONArray();
            long totalBytes = 0L;
            try {
                List<DocumentFile[]> stack = new ArrayList<>();
                stack.add(root.listFiles());
                List<String> prefixes = new ArrayList<>();
                prefixes.add(rootName == null ? "Carpeta" : rootName);
                int copied = 0;
                while (!stack.isEmpty() && copied < MAX_FILES) {
                    DocumentFile[] children = stack.get(0);
                    String prefix = prefixes.remove(0);
                    for (DocumentFile child : children) {
                        if (copied >= MAX_FILES || totalBytes > MAX_TOTAL_BYTES) break;
                        if (child == null) continue;
                        if (child.isDirectory()) {
                            stack.add(child.listFiles());
                            prefixes.add(prefix + "/" + safe(child.getName()));
                            continue;
                        }
                        String name = safe(child.getName());
                        String ext = extOf(name);
                        if (!AUDIO_EXT.contains(ext)) continue;
                        File dest = new File(outDir, copied + "_" + name);
                        long written = copy(activity, child.getUri(), dest);
                        if (written <= 0) continue;
                        totalBytes += written;
                        JSONObject o = new JSONObject();
                        o.put("name", name);
                        o.put("relativePath", prefix + "/" + name);
                        o.put("lastModified", child.lastModified());
                        o.put("url", "https://appassets.androidplatform.net/local/"
                                + token + "/" + java.net.URLEncoder.encode(dest.getName(), "UTF-8"));
                        files.put(o);
                        copied++;
                    }
                    stack.remove(0);
                }
                JSONObject result = new JSONObject();
                if (copied == 0) {
                    result.put("ok", false);
                    result.put("reason", "empty");
                } else {
                    result.put("ok", true);
                    result.put("rootName", rootName == null ? "Carpeta importada" : rootName);
                    result.put("count", copied);
                    result.put("files", files);
                }
                String json = result.toString();
                new Handler(Looper.getMainLooper()).post(() -> activity.notifyFolderResult(json));
            } catch (Exception e) {
                fail(activity, "error");
            }
        });
    }

    private static long copy(Context ctx, Uri uri, File dest) {
        try (InputStream in = ctx.getContentResolver().openInputStream(uri);
             OutputStream out = new FileOutputStream(dest)) {
            if (in == null) return 0;
            byte[] buf = new byte[128 * 1024];
            long total = 0;
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
                total += n;
            }
            return total;
        } catch (Exception e) {
            try { dest.delete(); } catch (Exception ignored) { }
            return 0;
        }
    }

    private static void fail(MainActivity activity, String reason) {
        new Handler(Looper.getMainLooper()).post(() -> activity.notifyFolderError(reason));
    }

    private static String safe(String s) {
        if (TextUtils.isEmpty(s)) return "";
        return s.replace('/', '_').replace('\\', '_');
    }

    private static String extOf(String name) {
        int i = name.lastIndexOf('.');
        return i < 0 ? "" : name.substring(i + 1).toLowerCase();
    }
}
