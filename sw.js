const STATIC_CACHE = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const ASSETS_APP_SHELL = [
  './pwa_practica/',
  './pwa_practica/home.html',
  './pwa_practica/calendario.html',
  './pwa_practica/formulario.html',
  './pwa_practica/main.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  '/pwa_practica/assets/icons/192.png',
  '/pwa_practica/assets/icons/512.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(ASSETS_APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activando y limpiando cachés antiguos...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
      )
    )
  );
});

// ✅ FETCH: Estrategia “Cache First, Network Fallback”
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (ASSETS_APP_SHELL.includes(url.href) || ASSETS_APP_SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request));
    return;
  }

  if (
    url.href.includes('fullcalendar') ||
    url.href.includes('select2')
  ) {
    event.respondWith(
      caches.match(request)
        .then(cacheResponse => {
          if (cacheResponse) {
            console.log(`[SW] Cache hit (lib externa): ${url.href}`);
            return cacheResponse;
          }
          console.log(`[SW] Cache miss (lib externa): ${url.href}`);
          return fetch(request)
            .then(networkResponse => {
              // Guardar en caché dinámico
              return caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
                });
            })
            .catch(err => {
              console.error(`[SW] Error al obtener ${url.href}:`, err);
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => caches.match('./pwa_practica/home.html'))
  );
});
