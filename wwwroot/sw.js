// Service worker de Agroservicio La Cosecha.
const CACHE = 'la-cosecha-v2';
const ARCHIVOS_ESTATICOS = [
  '/',
  '/index.html',
  '/css/estilos.css',
  '/js/app.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ARCHIVOS_ESTATICOS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(nombres => Promise.all(
      nombres.filter(nombre => nombre !== CACHE).map(nombre => caches.delete(nombre))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Las respuestas de la API siempre se solicitan a la red y nunca se guardan en caché.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.method !== 'GET') return;

  // Los archivos estáticos usan caché primero, con respaldo de red.
  event.respondWith(
    caches.match(event.request).then(respuesta => respuesta || fetch(event.request))
  );
});
