// Service Worker: guarda una copia de la app para que abra aunque
// no haya señal en el momento, y siempre intenta traer la versión
// más nueva de GitHub primero (para que las actualizaciones lleguen solas).

const CACHE_NAME = 'cobranza-cache-v1';
const APP_SHELL = [
  './PlanillaCobranza.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(APP_SHELL).catch(function(){ /* si algún archivo no existe, no rompe la instalación */ });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(function(response){
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
      return response;
    }).catch(function(){
      return caches.match(event.request);
    })
  );
});
