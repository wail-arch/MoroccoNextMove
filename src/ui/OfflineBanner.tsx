"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

// Server (and first client render) assume online to avoid hydration mismatch.
function getServerSnapshot() {
  return true;
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useTranslations("common");

  if (online) return null;

  return (
    <p
      role="status"
      className="flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-[13px] font-medium text-plaster"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-saffron" aria-hidden />
      {t("offlineBanner")}
    </p>
  );
}
