const CACHE_NAME = "sehyeon-grow-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./sehyeon-mvp.html",
  "./manifest.webmanifest",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/title/title_sehyun_story_bg.webp",
  "./assets/title/title_game_start_button_alpha.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.headers.has("range") || url.pathname.endsWith(".mp3") || url.pathname.endsWith(".zip")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }).catch(() => caches.match("./sehyeon-mvp.html"))
  );
});
