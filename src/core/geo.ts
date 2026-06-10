import type { GeoPoint } from "./types";

const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h)));
}

/** Straight-line distance inflated to an approximate street-network distance.
 * Medina alleys wind much more than a modern street grid. */
export function walkingDistanceMeters(
  a: GeoPoint,
  b: GeoPoint,
  opts: { medina: boolean },
): number {
  const factor = opts.medina ? 1.55 : 1.3;
  return Math.round(haversineMeters(a, b) * factor);
}

const WALK_SPEED_M_PER_MIN = 70; // ~4.2 km/h

export function walkingMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / WALK_SPEED_M_PER_MIN));
}
