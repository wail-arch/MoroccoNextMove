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

  // Warm the offline shell + assets while we still have connectivity.
  try {
    await fetch("/offline", { method: "GET" });
  } catch {
    // Connectivity already gone — the data pack still made it.
  }

  track("pack_download_completed", { city, bytes: pack.sizeBytes });
  notifyChange();
  return pack;
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
