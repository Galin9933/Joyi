// Nama cache. Ganti versi ini jika Anda memperbarui file di dalam urlsToCache
const CACHE_NAME = 'joyinovel-cache-v1';

// Daftar file inti yang diperlukan agar aplikasi dapat berjalan offline
const urlsToCache = [
  '/',
  '/index.html',
  // Aset dari CDN (Tailwind, Firebase, Fonts, Icons)
  'https://cdn.tailwindcss.com?plugins=aspect-ratio',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  // Gambar placeholder untuk ikon
  'https://placehold.co/192x192/fecdd3/44403c?text=Joyi'
];

// 1. Event 'install': Menyimpan file inti ke dalam cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Event 'fetch': Menyajikan konten dari cache jika offline
self.addEventListener('fetch', event => {
  // Hanya proses request GET, request lain (POST, dll) biarkan ke network
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika request ditemukan di cache, kembalikan dari cache
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, coba ambil dari network
        return fetch(event.request).then(
          networkResponse => {
            // Jika berhasil, simpan response ke cache untuk penggunaan berikutnya
            // dan kembalikan response tersebut
            return caches.open(CACHE_NAME).then(cache => {
              // Jangan cache request ke firestore API atau chrome-extension
              if (!event.request.url.includes('firestore.googleapis.com') && !event.request.url.startsWith('chrome-extension')) {
                 cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          }
        ).catch(() => {
            // Jika network gagal (offline), bisa berikan halaman fallback
            // Untuk sekarang, biarkan browser menampilkan error offline standarnya
        });
      })
  );
});

// 3. Event 'activate': Membersihkan cache lama
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});