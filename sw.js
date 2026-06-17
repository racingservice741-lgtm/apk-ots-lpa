const CACHE_NAME = 'ots-lpa-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Install & Paksa versi baru untuk langsung bekerja
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Hapus Cache Lama (Pembersih Otomatis)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache versi lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); 
});

// 3. Strategi "Network First, Fallback to Cache"
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika ada internet, ambil dari Vercel/GitHub dan update cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Jika TIDAK ADA internet, baru ambil dari memori HP (Offline Mode)
        return caches.match(event.request);
      })
  );
});
