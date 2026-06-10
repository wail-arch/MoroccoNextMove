"use client";

import { useSyncExternalStore } from "react";
import type { NextMove } from "@/core/types";

/*
 * Local-first saved moves. localStorage keeps them through restarts and —
 * unlike anything server-side — through connectivity loss, which is exactly
 * when a saved move matters. No accounts in v1.
 */

export interface SavedMove {
  id: string;
  savedAt: string; // ISO datetime
  fromLabel: string;
  toLabel: string;
  move: NextMove;
}

const STORAGE_KEY = "next-move:saved-v1";
const CHANGE_EVENT = "next-move:saved-changed";

function read(): SavedMove[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedMove[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedMove[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveMove(entry: Omit<SavedMove, "savedAt">): void {
  const items = read().filter((i) => i.id !== entry.id);
  items.unshift({ ...entry, savedAt: new Date().toISOString() });
  write(items);
}

export function removeMove(id: string): void {
  write(read().filter((i) => i.id !== id));
}

export function clearMoves(): void {
  write([]);
}

let cache: { raw: string | null; value: SavedMove[] } = {
  raw: null,
  value: [],
};

function getSnapshot(): SavedMove[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) {
    cache = { raw, value: raw ? (JSON.parse(raw) as SavedMove[]) : [] };
  }
  return cache.value;
}

const EMPTY: SavedMove[] = [];

function getServerSnapshot(): SavedMove[] {
  return EMPTY;
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useSavedMoves(): SavedMove[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
