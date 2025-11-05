const STATIC_CACHE = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const ASSETS_APP_SHELL = [
  './', // o './home.html' como fallback
  './home.html',
  './calendario.html',
  './formulario.html',
  './main.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  './assets/icons/192.png',
  './assets/icons/512.png'
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

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (ASSETS_APP_SHELL.includes(url.pathname) || ASSETS_APP_SHELL.includes(url.href)) {
    event.respondWith(caches.match(request));
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => caches.match('./home.html'))
  );
});
