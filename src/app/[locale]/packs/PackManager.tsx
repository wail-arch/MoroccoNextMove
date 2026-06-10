"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Check, Download, MapPinned, RefreshCw, Trash2, WifiOff } from "lucide-react";
import { PACK_VERSION, type PackCity } from "@/data/pack-version";
import { Link } from "@/i18n/navigation";
import { deletePack, downloadPack, usePacks } from "@/lib/packs";
import { Button } from "@/ui/Button";

export function PackManager({ city }: { city: PackCity }) {
  const t = useTranslations("packs");
  const tCity = useTranslations("cityNames");
  const format = useFormatter();
  const packs = usePacks();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const pack = packs.find((p) => p.city === city);
  const outdated = pack && pack.version !== PACK_VERSION;

  async function handleDownload() {
    setBusy(true);
    setError(false);
    try {
      await downloadPack(city);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <MapPinned className="h-5 w-5 text-terracotta" aria-hidden />
            {tCity(city)}
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            {pack
              ? t("statusReady", {
                  date: format.dateTime(new Date(pack.downloadedAt), {
                    dateStyle: "medium",
                  }),
                })
              : t("statusNone")}
            {pack && (
              <span className="ms-2 text-ink-faint">
                {t("size", { kb: Math.round(pack.sizeBytes / 1024) })}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!pack && (
            <Button variant="primary" onClick={handleDownload} disabled={busy}>
              <Download className="h-4 w-4" aria-hidden />
              {busy ? t("downloading") : t("download")}
            </Button>
          )}
          {pack && (
            <>
              {outdated ? (
                <Button variant="primary" onClick={handleDownload} disabled={busy}>
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  {busy ? t("downloading") : t("update")}
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tier-live-soft px-3 py-1.5 text-xs font-semibold text-tier-live">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  {PACK_VERSION}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => deletePack(city)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                {t("delete")}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-terracotta-soft p-3 text-sm text-terracotta-strong">
          {t("downloadFailed")}
        </p>
      )}

      {pack && (
        <div className="mt-4 border-t border-line pt-4">
          <Link
            href="/offline"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zellige hover:underline"
          >
            <WifiOff className="h-4 w-4" aria-hidden />
            {t("testOffline")}
          </Link>
        </div>
      )}
    </div>
  );
}
