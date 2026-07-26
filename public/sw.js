const CACHE_PREFIX = "rp-calculator-pwa";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./site.webmanifest",
  "./favicon.ico",
  "./pwa-192.png",
  "./pwa-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheResponse(request, response) {
  if (!response || !response.ok || response.type === "opaque") return response;

  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    return await fetch(request).then((response) => cacheResponse(request, response));
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(request)) || (await cache.match("./"));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => cacheResponse(request, response))
    .catch(() => null);

  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
