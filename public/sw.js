/*
 * Next Move service worker.
 *
 * Deliberately minimal lifecycle: install/activate do no network work, so
 * they can never hang. The offline shell (pages + asset graph) is written
 * into CACHE_NAME by the pack-download flow on the page side
 * (src/lib/packs.ts), which shares Cache API storage with this worker.
 *
 * Fetch strategy:
 *  - Hashed build assets: cache-first (immutable), cached on first use.
 *  - Navigations: network-first; successful responses cached; total failure
 *    falls back to the cached page, then the locale's /offline page.
 */

const VERSION = "v5";
const CACHE_NAME = `next-move-${VERSION}`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
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
    url.pathname.startsWith("/images/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
              }
              return response;
            })
            .catch(
              () => new Response("", { status: 504, statusText: "Offline" }),
            ),
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
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request, { ignoreSearch: true });
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
