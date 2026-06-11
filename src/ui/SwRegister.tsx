"use client";

import { useEffect } from "react";
import { syncAllPacksIfStale } from "@/lib/packs";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA features degrade gracefully; the online app is unaffected.
      });
    }
    // Verify-on-open: refresh stale packs while we have connectivity.
    void syncAllPacksIfStale();
  }, []);

  return null;
}
