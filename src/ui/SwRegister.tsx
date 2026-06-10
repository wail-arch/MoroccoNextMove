"use client";

import { useEffect } from "react";
import { syncPackIfStale } from "@/lib/packs";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA features degrade gracefully; the online app is unaffected.
      });
    }
    // Verify-on-open: refresh stale packs while we have connectivity.
    void syncPackIfStale("marrakech");
  }, []);

  return null;
}
