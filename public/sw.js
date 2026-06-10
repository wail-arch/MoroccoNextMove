/*
 * Next Move service worker.
 *
 * Strategy:
 *  - Hashed build assets (/_next/static, icons): cache-first — immutable.
 *  - Page navigations: network-first; successful responses are cached so
 *    recently visited pages keep working offline; total failure falls back
 *    to the locale's /offline page, where the answer engine runs on the
 *    downloaded city pack.
 */

const VERSION = "v1";
const SHELL_CACHE = `next-move-shell-${VERSION}`;
const RUNTIME_CACHE = `next-move-runtime-${VERSION}`;

const OFFLINE_PAGES = ["/offline", "/fr/offline", "/ar/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(OFFLINE_PAGES))
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
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function offlinePageFor(pathname) {
  if (pathname === "/fr" || pathname.startsWith("/fr/")) return "/fr/offline";
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "/ar/offline";
  return "/offline";
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Immutable build assets and icons: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // Page navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(offlinePageFor(url.pathname));
          return (
            offline ||
            new Response("Offline", { status: 503, statusText: "Offline" })
          );
        }),
    );
  }
});
