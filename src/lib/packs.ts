"use client";

import { openDB, type IDBPDatabase } from "idb";
import { useSyncExternalStore } from "react";
import type { DataSnapshot } from "@/core/types";
import { PACK_VERSION, type PackCity } from "@/data/pack-version";
import { track } from "./track";

/*
 * City packs live in IndexedDB so the answer engine can run entirely in the
 * browser with zero connectivity. The service worker keeps the /offline
 * page's shell available; this module keeps its data available.
 */

export interface StoredPack {
  city: PackCity;
  version: string;
  downloadedAt: string;
  sizeBytes: number;
  snapshot: DataSnapshot;
}

const DB_NAME = "next-move";
const STORE = "packs";
const CHANGE_EVENT = "next-move:packs-changed";

function db(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "city" });
      }
    },
  });
}

function notifyChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export async function getPack(city: PackCity): Promise<StoredPack | undefined> {
  return (await db()).get(STORE, city) as Promise<StoredPack | undefined>;
}

export async function downloadPack(city: PackCity): Promise<StoredPack> {
  track("pack_download_started", { city });
  const response = await fetch(`/api/packs/${city}`);
  if (!response.ok) throw new Error(`pack download failed: ${response.status}`);
  const body = (await response.json()) as {
    version: string;
    snapshot: DataSnapshot;
  };

  const pack: StoredPack = {
    city,
    version: body.version,
    downloadedAt: new Date().toISOString(),
    sizeBytes: JSON.stringify(body.snapshot).length,
    snapshot: body.snapshot,
  };
  await (await db()).put(STORE, pack);

  // Warm the offline shell + its full asset graph while we still have
  // connectivity, so the /offline page hydrates with zero network.
  try {
    await warmOfflineAssets();
  } catch {
    // Connectivity already gone — the data pack still made it.
  }

  track("pack_download_completed", { city, bytes: pack.sizeBytes });
  notifyChange();
  return pack;
}

/** Must match CACHE_NAME in public/sw.js — the page and the service worker
 * share Cache API storage. */
const SHELL_CACHE = "next-move-v5";

const OFFLINE_PAGES = ["/offline", "/fr/offline", "/ar/offline"];
const SHELL_EXTRAS = [
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
];

async function putInShellCache(
  cache: Cache,
  url: string,
  init?: RequestInit,
): Promise<void> {
  try {
    const response = await fetch(url, init);
    if (response.ok) {
      await cache.put(url, response.clone());
      // A redirected response (e.g. locale cookie redirect) should also be
      // retrievable under its final URL.
      if (response.redirected && new URL(response.url).pathname !== url) {
        await cache.put(new URL(response.url).pathname, response);
      }
    }
  } catch {
    // One missing asset must not fail the warm-up.
  }
}

/**
 * Writes the offline shell into the shared Cache API from the page side:
 * the offline pages' HTML, the PWA extras, and — crucially — every asset
 * the /offline page actually loads. Asset URLs come from loading the page
 * in a hidden iframe and reading its Performance entries, because parsing
 * HTML for chunk URLs is unreliable (RSC payloads split strings) and
 * requests served from the browser's memory cache never reach the service
 * worker.
 */
async function warmOfflineAssets(): Promise<void> {
  const cache = await caches.open(SHELL_CACHE);

  // Offline page HTML (credentials omitted so the locale cookie can't turn
  // "/offline" into a redirect we'd cache under the wrong key) + extras.
  await Promise.all([
    ...OFFLINE_PAGES.map((page) =>
      putInShellCache(cache, page, { credentials: "omit" }),
    ),
    ...SHELL_EXTRAS.map((url) => putInShellCache(cache, url)),
  ]);

  // Observe the real asset graph of /offline via a hidden iframe.
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
  iframe.src = "/offline";

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("warm timeout")), 20_000);
      iframe.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      iframe.onerror = () => {
        clearTimeout(timer);
        reject(new Error("warm failed"));
      };
      document.body.appendChild(iframe);
    });

    // Let hydration finish so lazily-loaded chunks are requested too.
    await new Promise((r) => setTimeout(r, 2_500));

    const innerWindow = iframe.contentWindow;
    if (!innerWindow) return;
    const urls = innerWindow.performance
      .getEntriesByType("resource")
      .map((entry) => (entry as PerformanceResourceTiming).name)
      .filter((name) => name.includes("/_next/"));

    await Promise.all(
      urls.map((url) => putInShellCache(cache, url, { cache: "no-cache" })),
    );
  } finally {
    iframe.remove();
  }
}

export async function deletePack(city: PackCity): Promise<void> {
  await (await db()).delete(STORE, city);
  track("pack_deleted", { city });
  notifyChange();
}

/** Verify-on-open: silently refresh an outdated pack while online. */
export async function syncPackIfStale(city: PackCity): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  const existing = await getPack(city);
  if (!existing) return;
  const ageDays =
    (Date.now() - Date.parse(existing.downloadedAt)) / 86_400_000;
  if (existing.version !== PACK_VERSION || ageDays > 7) {
    try {
      await downloadPack(city);
    } catch {
      // Keep the old pack; better stale than gone.
    }
  }
}

// ---------------------------------------------------------------------------
// React subscription
// ---------------------------------------------------------------------------

let snapshotCache: { key: string; value: StoredPack[] } = { key: "", value: [] };
let latest: StoredPack[] = [];
let loaded = false;

async function refresh() {
  latest = (await (await db()).getAll(STORE)) as StoredPack[];
  loaded = true;
  const key = latest.map((p) => `${p.city}:${p.version}:${p.downloadedAt}`).join("|");
  if (key !== snapshotCache.key) {
    snapshotCache = { key, value: latest };
  }
}

function subscribe(callback: () => void) {
  const handler = () => {
    void refresh().then(callback);
  };
  window.addEventListener(CHANGE_EVENT, handler);
  if (!loaded) {
    void refresh().then(callback);
  }
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

function getSnapshot(): StoredPack[] {
  return snapshotCache.value;
}

const EMPTY: StoredPack[] = [];

function getServerSnapshot(): StoredPack[] {
  return EMPTY;
}

export function usePacks(): StoredPack[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
