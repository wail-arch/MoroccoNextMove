"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { geoMercator } from "d3-geo";
import type { DataSnapshot } from "@/core/types";
import { pickLocale } from "@/lib/locale";

/*
 * Schematic offline map: every place, stop, and verified pin in the pack,
 * projected onto a plain canvas. Deliberately not a navigation map — it's a
 * spatial overview that pairs with the landmark walking notes, which is
 * what actually works in a medina.
 */

const WIDTH = 700;
const HEIGHT = 520;

export function CityPinMap({ snapshot }: { snapshot: DataSnapshot }) {
  const locale = useLocale();

  const projected = useMemo(() => {
    const points = [
      ...snapshot.places.map((p) => ({
        kind: "place" as const,
        name: pickLocale(p.name, locale),
        lon: p.point.lon,
        lat: p.point.lat,
        medina: p.inMedina,
      })),
      ...snapshot.pins.map((p) => ({
        kind: "pin" as const,
        name: pickLocale(p.name, locale),
        lon: p.point.lon,
        lat: p.point.lat,
        medina: false,
      })),
    ];
    if (points.length === 0) return [];

    const projection = geoMercator().fitExtent(
      [
        [40, 30],
        [WIDTH - 40, HEIGHT - 30],
      ],
      {
        type: "FeatureCollection",
        features: points.map((p) => ({
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] },
        })),
      },
    );

    return points.map((p) => {
      const xy = projection([p.lon, p.lat]) ?? [0, 0];
      return { ...p, x: xy[0], y: xy[1] };
    });
  }, [snapshot, locale]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      className="h-auto w-full rounded-2xl border border-line bg-sand/70"
    >
      {projected.map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          {p.kind === "pin" ? (
            <path
              d="M0 -10 C 5 -10 8 -6.5 8 -2.5 C 8 2 0 10 0 10 C 0 10 -8 2 -8 -2.5 C -8 -6.5 -5 -10 0 -10 Z"
              className="fill-terracotta"
              stroke="white"
              strokeWidth={1.5}
            />
          ) : (
            <circle
              r={5}
              className={p.medina ? "fill-saffron" : "fill-zellige"}
              stroke="white"
              strokeWidth={1.5}
            />
          )}
          <text
            y={p.kind === "pin" ? 22 : 18}
            textAnchor="middle"
            className="fill-ink text-[12px] font-medium"
            style={{
              paintOrder: "stroke",
              stroke: "var(--sand)",
              strokeWidth: 3,
            }}
          >
            {p.name.length > 28 ? `${p.name.slice(0, 27)}…` : p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
