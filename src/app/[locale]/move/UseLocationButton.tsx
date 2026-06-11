"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, LocateFixed } from "lucide-react";
import { haversineMeters } from "@/core/geo";
import { useRouter } from "@/i18n/navigation";
import { track } from "@/lib/track";

/*
 * "From where you stand" — literally. Snaps to the nearest seeded place
 * when one is close (better labels, pins, advisories); otherwise passes
 * raw coordinates, which the engine handles natively. Far outside the
 * covered cities, it says so instead of fabricating an answer.
 */

const SNAP_RADIUS_M = 250;
const COVERAGE_RADIUS_M = 60_000;

export function UseLocationButton({
  places,
}: {
  places: { id: string; lat: number; lon: number }[];
}) {
  const t = useTranslations("move");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "locating" | "denied" | "far">(
    "idle",
  );

  function locate(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!navigator.geolocation) {
      setState("denied");
      return;
    }
    setState("locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        let nearest: { id: string; distance: number } | null = null;
        for (const place of places) {
          const distance = haversineMeters(here, {
            lat: place.lat,
            lon: place.lon,
          });
          if (!nearest || distance < nearest.distance) {
            nearest = { id: place.id, distance };
          }
        }

        if (!nearest || nearest.distance > COVERAGE_RADIUS_M) {
          setState("far");
          return;
        }

        // Preserve whatever the rest of the form already holds.
        const data = form ? new FormData(form) : new FormData();
        const params = new URLSearchParams();
        for (const key of ["to", "budget", "at"]) {
          const value = data.get(key);
          if (typeof value === "string" && value) params.set(key, value);
        }
        if (nearest.distance <= SNAP_RADIUS_M) {
          params.set("from", nearest.id);
        } else {
          params.set("fromLat", here.lat.toFixed(5));
          params.set("fromLon", here.lon.toFixed(5));
        }

        track("move_search", { method: "geolocation" });
        setState("idle");
        router.push(`/move?${params.toString()}`);
      },
      () => setState("denied"),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        disabled={state === "locating"}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-zellige hover:bg-zellige-soft disabled:opacity-60"
      >
        {state === "locating" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LocateFixed className="h-4 w-4" aria-hidden />
        )}
        {state === "locating" ? t("locating") : t("useMyLocation")}
      </button>
      {state === "denied" && (
        <p className="mt-1 text-[12px] text-terracotta">{t("locationDenied")}</p>
      )}
      {state === "far" && (
        <p className="mt-1 text-[12px] text-terracotta">{t("locationFar")}</p>
      )}
    </div>
  );
}
