/**
 * ============================================
 * HISTORIA CLÍNICA PSICOLÓGICA INTEGRAL
 * Service Worker - PWA Offline
 * ============================================
 */

const CACHE_NAME = 'hcp-cache-v7-modular-fields';
const STATIC_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './patient.html',
    './session.html',
    './assessments.html',
    './diagnosis.html',
    './referral.html',
    './export.html',
    './settings.html',
    './assets/css/main.css',
    './assets/js/db.js',
    './assets/js/utils.js',
    './assets/data/dsm5.js',
    './assets/data/cie11.js',
    './manifest.json'
];

// Instalación: Cachear recursos estáticos
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Recursos cacheados correctamente');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[SW] Error cacheando recursos:', error);
            })
    );
});

// Activación: Limpiar caches antiguas
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Eliminando cache antigua:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim();
            })
    );
});

// Fetch: Estrategia Network First para HTML, Cache First para estáticos
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // No interceptar peticiones a APIs externas o datos
    if (url.origin !== self.location.origin) {
        return;
    }
    
    // Para archivos HTML: Network First
    if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Actualizar cache con la versión más reciente
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar cache
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Si no hay cache, devolver index.html
                        return caches.match('./index.html');
                    });
                })
        );
        return;
    }
    
    // Para recursos estáticos: Cache First
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                // Actualizar en segundo plano
                fetch(request).then(networkResponse => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Si no está en cache, hacer fetch
            return fetch(request).then(networkResponse => {
                if (!networkResponse || !networkResponse.ok) {
                    return networkResponse;
                }
                
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });
                
                return networkResponse;
            });
        })
    );
});

// Mensajes desde la aplicación
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
