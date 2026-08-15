// Task-Now Service Worker v2.1 — Auditado y corregido (DSEBI)
// FIX CRÍTICO 1: Eliminado listener duplicado de 'message'
// FIX ALTO 2: Assets JS/CSS incluidos en caché estático
// FIX ALTO 3: Sistema de notificaciones con recuperación ante reinicio del SW

const CACHE_NAME = 'tasknow-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  // Assets dinámicos — se actualizan en runtime si cambian
];

// Detectar y cachear assets JS/CSS al instalar
async function cacheStaticAssets(cache) {
  await cache.addAll(STATIC_ASSETS);
  // Intentar cachear los assets bundles del HTML (sin fallar si no están)
  try {
    const response = await fetch('/index.html');
    const html = await response.text();
    const assetMatches = [...html.matchAll(/src="([^"]+\.js)"|href="([^"]+\.css)"/g)];
    const assetUrls = assetMatches
      .map(m => m[1] || m[2])
      .filter(Boolean)
      .filter(u => u.startsWith('./') || u.startsWith('/'));
    await Promise.allSettled(assetUrls.map(url => cache.add(url)));
  } catch(e) {
    // No crítico si falla la detección de assets
  }
}

// Store para notificaciones programadas — persiste en IndexedDB para sobrevivir reinicios del SW
const DB_NAME = 'tasknow-notifications';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('scheduled')) {
        db.createObjectStore('scheduled', { keyPath: 'taskId' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveNotification(taskId, data) {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readwrite');
    tx.objectStore('scheduled').put({ taskId, ...data });
  } catch(e) { /* silent */ }
}

async function removeNotification(taskId) {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readwrite');
    tx.objectStore('scheduled').delete(taskId);
  } catch(e) { /* silent */ }
}

async function restoreScheduledNotifications() {
  try {
    const db = await openDB();
    const tx = db.transaction('scheduled', 'readonly');
    const all = await new Promise((res, rej) => {
      const req = tx.objectStore('scheduled').getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    for (const item of all) {
      const delay = new Date(item.scheduledAt).getTime() - Date.now();
      if (delay > 0) {
        scheduleLocalTimeout(item.taskId, item.title, item.body, item.scheduledAt);
      } else {
        // Notificación vencida: mostrarla inmediatamente o eliminarla
        await removeNotification(item.taskId);
      }
    }
  } catch(e) { /* silent */ }
}

// Map en memoria para timeouts activos
const activeTimeouts = new Map();

function scheduleLocalTimeout(taskId, title, body, scheduledAt) {
  const delay = new Date(scheduledAt).getTime() - Date.now();
  if (delay <= 0) return;

  if (activeTimeouts.has(taskId)) {
    clearTimeout(activeTimeouts.get(taskId));
  }

  const timeoutId = setTimeout(async () => {
    await self.registration.showNotification(`Task-Now: ${title}`, {
      body: body || 'Es hora de tu tarea',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      data: { taskId, url: '/' },
      actions: [
        { action: 'complete', title: 'Completar' },
        { action: 'dismiss', title: 'Descartar' },
      ],
      tag: `task-${taskId}`,
      requireInteraction: true,
    });
    activeTimeouts.delete(taskId);
    await removeNotification(taskId);
  }, delay);

  activeTimeouts.set(taskId, timeoutId);
}

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cacheStaticAssets(cache))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      self.clients.claim(),
      restoreScheduledNotifications(),
    ])
  );
});

// ─── Fetch (Network-first, fallback to cache) ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Task-Now', body: 'Tienes una tarea pendiente', taskId: null };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { taskId: data.taskId, url: '/' },
    actions: [
      { action: 'complete', title: 'Completar' },
      { action: 'dismiss', title: 'Descartar' },
    ],
    requireInteraction: false,
    silent: false,
    tag: `task-${data.taskId}`,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'complete') {
    self.clients.matchAll({ type: 'window' }).then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'COMPLETE_TASK',
          taskId: event.notification.data.taskId,
        });
      });
    });
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

// ─── Notification Close ────────────────────────────────────────────────────────
self.addEventListener('notificationclose', (event) => {
  if (event.notification.data?.taskId) {
    const taskId = event.notification.data.taskId;
    if (activeTimeouts.has(taskId)) {
      clearTimeout(activeTimeouts.get(taskId));
      activeTimeouts.delete(taskId);
    }
    removeNotification(taskId);
  }
});

// ─── ÚNICO listener consolidado de messages (FIX CRÍTICO: eliminado duplicado) ─
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SCHEDULE_NOTIFICATION': {
      const { taskId, title, body, scheduledAt } = event.data;
      scheduleLocalTimeout(taskId, title, body, scheduledAt);
      saveNotification(taskId, { title, body, scheduledAt });
      break;
    }

    case 'CANCEL_NOTIFICATION': {
      const { taskId } = event.data;
      if (activeTimeouts.has(taskId)) {
        clearTimeout(activeTimeouts.get(taskId));
        activeTimeouts.delete(taskId);
      }
      removeNotification(taskId);
      break;
    }

    case 'CHECK_NOTIFICATIONS': {
      if (event.ports[0]) {
        event.ports[0].postMessage({
          status: 'ok',
          scheduled: activeTimeouts.size,
        });
      }
      break;
    }

    case 'KEEP_ALIVE': {
      if (event.ports[0]) {
        event.ports[0].postMessage({ status: 'alive' });
      }
      break;
    }

    case 'SYNC_CHECK':
    default:
      break;
  }
});

// ─── Periodic Background Sync ─────────────────────────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-notifications') {
    event.waitUntil(
      restoreScheduledNotifications().then(async () => {
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_CHECK', timestamp: Date.now() });
        });
      })
    );
  }
});
