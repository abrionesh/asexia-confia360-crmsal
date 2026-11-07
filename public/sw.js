const CACHE = "asexia-shell-v1";
const PRECACHE = ["/", "/favicon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/__grok")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkThenCache(request, "/"));
    return;
  }

  const isAsset =
    url.pathname.startsWith("/assets/") ||
    /\.(?:js|css|svg|png|jpg|jpeg|woff2?)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(cacheThenNetwork(request));
  }
});

async function networkThenCache(request, fallback) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const copy = response.clone();
      const cache = await caches.open(CACHE);
      await cache.put(request, copy);
    }
    return response;
  } catch {
    return (await caches.match(request)) ?? (await caches.match(fallback)) ?? Response.error();
  }
}

async function cacheThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const copy = response.clone();
    const cache = await caches.open(CACHE);
    await cache.put(request, copy);
  }
  return response;
}
