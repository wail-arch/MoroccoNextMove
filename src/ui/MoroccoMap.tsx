import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";
import topology from "@/data/geo/morocco-regions.json";
import { cn } from "@/lib/cn";

/*
 * Server-rendered Morocco region map: the 280 KB topojson stays on the
 * server; only SVG path strings reach the client. Launch-corridor regions
 * are highlighted; city markers are positioned via the same projection.
 */

const WIDTH = 720;
const HEIGHT = 700;

const LAUNCH_REGIONS: Record<string, "live" | "next"> = {
  "MA-07": "live", // Marrakech-Safi
  "MA-06": "live", // Casablanca-Settat
  "MA-04": "live", // Rabat-Salé-Kénitra
  "MA-01": "next", // Tanger (phase 2)
  "MA-03": "next", // Fès-Meknès (phase 3)
};

const CITY_MARKERS: {
  slug: string;
  labelEn: string;
  lon: number;
  lat: number;
  live: boolean;
}[] = [
  { slug: "marrakech", labelEn: "Marrakech", lon: -8.0089, lat: 31.6295, live: true },
  { slug: "casablanca", labelEn: "Casablanca", lon: -7.6191, lat: 33.5979, live: true },
  { slug: "rabat", labelEn: "Rabat", lon: -6.8395, lat: 34.0212, live: true },
  { slug: "tangier", labelEn: "Tangier", lon: -5.834, lat: 35.7643, live: false },
  { slug: "fes", labelEn: "Fes", lon: -4.9935, lat: 33.9789, live: false },
];

interface RegionShape {
  id: string;
  d: string;
  status: "live" | "next" | "rest";
}

function buildMap() {
  const topo = topology as unknown as Topology;
  const collection = feature(
    topo,
    topo.objects.regions,
  ) as unknown as FeatureCollection<Geometry, { name?: string }>;

  const projection = geoMercator().fitExtent(
    [
      [16, 16],
      [WIDTH - 16, HEIGHT - 16],
    ],
    collection,
  );
  const path = geoPath(projection);

  const regions: RegionShape[] = collection.features.map((f) => ({
    id: String(f.id ?? ""),
    d: path(f) ?? "",
    status: LAUNCH_REGIONS[String(f.id ?? "")] ?? "rest",
  }));

  const markers = CITY_MARKERS.map((m) => {
    const projected = projection([m.lon, m.lat]) ?? [0, 0];
    return { ...m, x: projected[0], y: projected[1] };
  });

  return { regions, markers };
}

const { regions, markers } = buildMap();

const REGION_CLASSES: Record<RegionShape["status"], string> = {
  live: "fill-zellige/85",
  next: "fill-saffron/45",
  rest: "fill-sand",
};

export function MoroccoMap({
  className,
  labels,
}: {
  className?: string;
  /** Localized marker labels keyed by slug (defaults to English). */
  labels?: Record<string, string>;
}) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Morocco regions map"
      className={cn("h-auto w-full", className)}
    >
      {regions.map((r) => (
        <path
          key={r.id}
          d={r.d}
          className={cn(
            REGION_CLASSES[r.status],
            "stroke-plaster transition-opacity",
          )}
          strokeWidth={1.6}
        />
      ))}

      {markers.map((m) => (
        <g key={m.slug} transform={`translate(${m.x}, ${m.y})`}>
          <circle
            r={7}
            className={m.live ? "fill-terracotta" : "fill-ink-faint"}
            stroke="white"
            strokeWidth={2.5}
          />
          <text
            y={-13}
            textAnchor="middle"
            className="fill-ink text-[19px] font-semibold"
            style={{ paintOrder: "stroke", stroke: "var(--plaster)", strokeWidth: 4 }}
          >
            {labels?.[m.slug] ?? m.labelEn}
          </text>
        </g>
      ))}
    </svg>
  );
}
