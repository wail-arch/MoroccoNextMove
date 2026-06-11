"use client";

import { useSyncExternalStore } from "react";

/*
 * Captures the browser's `beforeinstallprompt` so /packs can offer a
 * one-tap install on Android/Chrome. iOS never fires it — those users get
 * the add-to-home-screen instructions instead.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((cb) => cb());
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return deferredPrompt !== null;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useInstallPrompt(): {
  canInstall: boolean;
  install: () => Promise<void>;
} {
  const canInstall = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    canInstall,
    async install() {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      deferredPrompt = null;
      listeners.forEach((cb) => cb());
    },
  };
}
