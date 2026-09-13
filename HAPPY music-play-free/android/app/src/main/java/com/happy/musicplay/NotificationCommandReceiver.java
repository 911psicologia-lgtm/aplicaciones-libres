package com.happy.musicplay;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * R10.15 · Receptor de las acciones de la notificación multimedia.
 * Traduce cada acción a un comando del puente hacia la web
 * (única fuente de reproducción).
 */
public class NotificationCommandReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (action == null) return;
        switch (action) {
            case "media/prev":
            case "media/play":
            case "media/pause":
            case "media/toggle":
            case "media/next":
            case "media/stop":
                PlaybackBus.get().mediaCommand(action, null);
                break;
            default:
                break;
        }
    }
}
