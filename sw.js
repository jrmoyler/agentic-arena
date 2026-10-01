const CACHE_PREFIX = "agentic-arena-duel-";
const CACHE = `${CACHE_PREFIX}v3`;
const PRECACHE = [
  "/",
  "/play.js",
  "/play.css",
  "/assets/card-art-engine.js",
  "/assets/card-art-engine.css",
  "/assets/card-illustration-core.js",
  "/favicon.svg",
  "/icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
  "/card-back.jpg",
  "/table.jpg",
  "/manifest.webmanifest",
  "/data/card-art-catalog.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Keep cache writes alive for the fetch event without delaying its response.
  let finishCacheWrite;
  event.waitUntil(new Promise((resolve) => { finishCacheWrite = resolve; }));
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE)
          .then((cache) => cache.put(request, copy))
          .catch(() => undefined)
          .finally(finishCacheWrite);
      } else {
        finishCacheWrite();
      }
      return response;
    } catch {
      finishCacheWrite();
      try {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        // HTML is only a fallback for document navigation, never JS/CSS/data.
        if (request.mode === "navigate") {
          const shell = await cache.match("/");
          if (shell) return shell;
        }
      } catch {
        // Storage may be unavailable or evicted; report a real network error.
      }
      return Response.error();
    }
  })());
});
