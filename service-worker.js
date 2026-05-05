const CACHE_NAME = "discipline-app-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/app.js",
  "/src/styles/main.css",
  "/src/components/HabitCard.js",
  "/src/components/HabitForm.js",
  "/src/components/Dashboard.js",
  "/src/components/ChartView.js",
  "/src/components/LockScreen.js",
  "/src/services/storage.js",
  "/src/services/analytics.js",
  "/src/services/auth.js",
  "/src/services/notification.js",
  "/src/utils/dateUtils.js",
  "/src/utils/hash.js",
  "/public/icons/icon-192.svg",
  "/public/icons/icon-512.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => caches.match("/index.html"))
  );
});
