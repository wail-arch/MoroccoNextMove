import { DataSnapshotSchema, type CityId, type DataSnapshot } from "@/core/types";
import oncfRail from "./seeds/oncf-rail.json";
import * as casablanca from "./seeds/casablanca";
import * as intercity from "./seeds/intercity";
import * as marrakech from "./seeds/marrakech";
import * as rabat from "./seeds/rabat";

/*
 * Snapshot assembly. The engine never fetches: it receives one validated
 * DataSnapshot. Today every source is a seed; when an operator partnership
 * lands, its adapter slots in here and its records arrive as
 * "official-live" without touching the engine or the UI.
 */

let cached: DataSnapshot | null = null;

export function getBaseSnapshot(): DataSnapshot {
  if (cached) return cached;

  cached = DataSnapshotSchema.parse({
    places: [...marrakech.places, ...casablanca.places, ...rabat.places],
    pins: [...marrakech.pins, ...casablanca.pins, ...rabat.pins],
    stops: [
      ...oncfRail.stops,
      ...marrakech.stops,
      ...casablanca.stops,
      ...rabat.stops,
      ...intercity.stops,
    ],
    lines: [
      ...oncfRail.lines,
      ...marrakech.lines,
      ...casablanca.lines,
      ...rabat.lines,
      ...intercity.lines,
    ],
    taxiRules: [
      ...marrakech.taxiRules,
      ...casablanca.taxiRules,
      ...rabat.taxiRules,
    ],
    advisories: [
      ...marrakech.advisories,
      ...casablanca.advisories,
      ...rabat.advisories,
      ...intercity.advisories,
    ],
  });
  return cached;
}

/** City-pack subset: everything needed to answer "best next move" inside one
 * city while offline, plus the intercity lines that touch it. */
export function getCitySnapshot(city: CityId): DataSnapshot {
  const base = getBaseSnapshot();
  const cityStopIds = new Set(
    base.stops.filter((s) => s.city === city).map((s) => s.id),
  );

  const lines = base.lines.filter((line) =>
    line.stopIds.some((id) => cityStopIds.has(id)),
  );
  const usedStopIds = new Set(lines.flatMap((l) => l.stopIds));
  for (const id of cityStopIds) usedStopIds.add(id);

  return {
    places: base.places.filter((p) => p.city === city),
    pins: base.pins.filter((pin) => {
      const place = base.places.find((p) => p.id === pin.placeId);
      return place ? place.city === city : false;
    }),
    stops: base.stops.filter((s) => usedStopIds.has(s.id)),
    lines,
    taxiRules: base.taxiRules.filter((t) => t.city === city),
    advisories: base.advisories.filter((a) => {
      if (a.appliesTo.cities && !a.appliesTo.cities.includes(city)) {
        return false;
      }
      return true;
    }),
  };
}

/** Rail + coach network for the intercity planner. */
export function getIntercityStops(): DataSnapshot["stops"] {
  const base = getBaseSnapshot();
  const intercityLineStops = new Set(
    base.lines
      .filter((l) => l.mode === "train" || l.mode === "coach")
      .flatMap((l) => l.stopIds),
  );
  return base.stops.filter((s) => intercityLineStops.has(s.id));
}
