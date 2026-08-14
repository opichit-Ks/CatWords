/* CatWords service worker — offline cache + FCM background notifications.
   Bump CACHE version whenever core assets change so stale caches clear. */
const CACHE = 'catwords-v4';

const CORE = [
  './index.html',
  './daily-lesson.html',
  './reading.html',
  './progress.html',
  './collection.html',
  './settings.html',
  './welcome.html',
  './data/catwords.css',
  './data/settings-store.js',
  './data/progress-store.js',
  './data/content-loader.js',
  './data/content-library.json',
  './data/characters.js',
  './data/app-shell.js',
  './data/theme-toggle.js',
  './data/more-menu.js',
  './data/notifications.js',
  './data/dashboard.js',
  './data/reading.js',
  './data/progress.js',
  './data/family-hub.js',
  './data/daily-lesson.js',
  './data/audio.js',
  './data/mochi-size.css',
  './data/back-to-top.js',
  './data/back-to-top.css',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  // HTML navigation: network first, fall back to the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // JavaScript เปลี่ยนบ่อย (dev/deploy) — network ก่อนเสมอ, cache เป็น fallback offline
  if (request.destination === 'script') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache first, then network + cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

// ---- FCM background notifications (optional; only active with a real config) ----
try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
  importScripts('./data/firebase-config.js');
  const config = self.CatWordsFirebaseConfig;
  if (config && config.apiKey && !config.apiKey.startsWith('YOUR_')) {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const data = payload.data || {};
      const title = data.title || '🐱 คำศัพท์วันนี้พร้อมแล้ว';
      const body = data.body || 'มาเรียนภาษาอังกฤษ 5 คำไปกับน้องแมวกัน';
      const url = data.url || './index.html';
      self.registration.showNotification(title, {
        body,
        icon: './public/assets/characters/mochi/poses/mochi-wave.png',
        badge: './public/assets/characters/mochi/poses/mochi-wave.png',
        data: { url }
      });
    });
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      const url = (event.notification.data && event.notification.data.url) || './index.html';
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
          for (const client of list) {
            if ('focus' in client) {
              client.navigate(url);
              return client.focus();
            }
          }
          return clients.openWindow(url);
        })
      );
    });
  }
} catch (error) {
  // Firebase messaging unavailable — offline caching still works.
}
