package com.happy.musicplay;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * R10.15 · Recibe los toques de la notificación multimedia y los convierte en
 * comandos para el WebView reproductor (vía PlaybackBus).
 */
public class NotificationCommandReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String cmd = intent.getStringExtra("cmd");
        if (cmd == null || cmd.isEmpty()) return;
        if (!FloatingPlayerService.handleCommand(cmd)) PlaybackBus.sendCommand(cmd);
    }
}
