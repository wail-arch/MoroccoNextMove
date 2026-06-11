"use client";

import { useTranslations } from "next-intl";
import { MonitorDown } from "lucide-react";
import { useInstallPrompt } from "@/lib/install";
import { Button } from "@/ui/Button";

/** One-tap install where the browser offers it (Android/Chrome);
 * renders nothing elsewhere — iOS users follow the manual steps. */
export function InstallButton() {
  const t = useTranslations("packs");
  const { canInstall, install } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <Button variant="secondary" size="md" className="mt-3" onClick={() => install()}>
      <MonitorDown className="h-4 w-4" aria-hidden />
      {t("installButton")}
    </Button>
  );
}
