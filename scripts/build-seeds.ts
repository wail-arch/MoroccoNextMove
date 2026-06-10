/*
 * Converts the community ONCF GTFS feed (scripts/sources/oncf-gtfs/) into the
 * validated seed file src/data/seeds/oncf-rail.json.
 *
 * Source: https://github.com/newsbubbles/rail_maroc_oncf (ODbL 1.0), indexed
 * by Transitland as f-oncf~morocco~rail. Schedule patterns were spot-checked
 * against oncf.ma in June 2026; fares are 2nd-class ranges from public ONCF
 * pricing. Everything lands as tier "cached-verified" with the feed's
 * verification date so the staleness rule can degrade it honestly over time.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  DayMaskSchema,
  LineSchema,
  StopSchema,
  type CityId,
  type DayMask,
  type FareBand,
  type Line,
  type Provenance,
  type Stop,
  type TimetableTrip,
} from "../src/core/types";

const SOURCES = path.join(__dirname, "sources", "oncf-gtfs");
const OUT_FILE = path.join(
  __dirname,
  "..",
  "src",
  "data",
  "seeds",
  "oncf-rail.json",
);

const PROVENANCE: Provenance = {
  sourceId: "oncf-community-gtfs",
  sourceName: "Rail Maroc Community GTFS (ONCF)",
  sourceUrl: "https://github.com/newsbubbles/rail_maroc_oncf",
  license: "ODbL-1.0",
  method: "community-feed",
  lastVerifiedAt: "2026-01-24",
};

// ---------------------------------------------------------------------------
// Tiny CSV reader — the feed has no quoted fields.
// ---------------------------------------------------------------------------

function readCsv(file: string): Record<string, string>[] {
  const text = readFileSync(path.join(SOURCES, file), "utf-8").trim();
  const [headerLine, ...rows] = text.split(/\r?\n/);
  if (text.includes('"')) {
    throw new Error(`${file}: quoted CSV fields are not supported`);
  }
  const headers = headerLine.split(",");
  return rows.map((row) => {
    const cells = row.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

// ---------------------------------------------------------------------------
// Localization & city mapping for stations
// ---------------------------------------------------------------------------

const ARABIC_STATIONS: Record<string, string> = {
  TANGER_VILLE: "طنجة المدينة",
  TANGER_BORAQ: "طنجة البراق",
  ASILAH: "أصيلة",
  KENITRA: "القنيطرة",
  KENITRA_MEDINA: "القنيطرة المدينة",
  RABAT_AGDAL: "الرباط أكدال",
  RABAT_VILLE: "الرباط المدينة",
  SALE: "سلا",
  SALE_TABRIQUET: "سلا تابريكت",
  CASA_VOYAGEURS: "الدار البيضاء المسافرين",
  CASA_PORT: "الدار البيضاء الميناء",
  CASA_OASIS: "الدار البيضاء الواحة",
  AIN_SEBAA: "عين السبع",
  MOHAMMEDIA: "المحمدية",
  BOUZNIKA: "بوزنيقة",
  SKHIRAT: "الصخيرات",
  TEMARA: "تمارة",
  SETTAT: "سطات",
  BEN_GUERIR: "بن جرير",
  MARRAKECH: "مراكش",
  MEKNES: "مكناس",
  FES: "فاس",
  TAZA: "تازة",
  TAOURIRT: "تاوريرت",
  OUJDA: "وجدة",
  NADOR: "الناظور",
  BERKANE: "بركان",
  EL_JADIDA: "الجديدة",
  SAFI: "آسفي",
  KHOURIBGA: "خريبكة",
  OUED_ZEM: "وادي زم",
  BENI_MELLAL: "بني ملال",
  SIDI_KACEM: "سيدي قاسم",
};

const STATION_CITY: Record<string, CityId> = {
  CASA_VOYAGEURS: "casablanca",
  CASA_PORT: "casablanca",
  CASA_OASIS: "casablanca",
  AIN_SEBAA: "casablanca",
  MOHAMMEDIA: "casablanca",
  RABAT_AGDAL: "rabat",
  RABAT_VILLE: "rabat",
  SALE: "rabat",
  SALE_TABRIQUET: "rabat",
  TEMARA: "rabat",
  SKHIRAT: "rabat",
  BOUZNIKA: "rabat",
  KENITRA: "rabat",
  KENITRA_MEDINA: "rabat",
  MARRAKECH: "marrakech",
  BEN_GUERIR: "marrakech",
  TANGER_VILLE: "tangier",
  TANGER_BORAQ: "tangier",
  ASILAH: "tangier",
  FES: "fes",
  MEKNES: "fes",
  SIDI_KACEM: "fes",
  TAZA: "fes",
};

/** 2nd-class fare ranges (MAD) from public ONCF pricing, per route. */
const ROUTE_FARES: Record<string, FareBand> = {
  AL_BORAQ_TNG_CASA: { currency: "MAD", min: 150, max: 250, per: "person" },
  AL_ATLAS_CASA_MKC: { currency: "MAD", min: 90, max: 150, per: "person" },
  AL_ATLAS_CASA_FES: { currency: "MAD", min: 110, max: 180, per: "person" },
  AL_ATLAS_TNG_FES: { currency: "MAD", min: 100, max: 170, per: "person" },
  TNR_CASA_KENITRA: { currency: "MAD", min: 15, max: 40, per: "person" },
};

const ROUTE_NAMES_AR: Record<string, string> = {
  AL_BORAQ_TNG_CASA: "البراق: طنجة – الدار البيضاء",
  AL_ATLAS_CASA_MKC: "الأطلس: الدار البيضاء – مراكش",
  AL_ATLAS_CASA_FES: "الأطلس: الدار البيضاء – فاس",
  AL_ATLAS_TNG_FES: "الأطلس: طنجة – فاس",
  TNR_CASA_KENITRA: "القطار السريع: الدار البيضاء – القنيطرة",
};

const SERVICE_DAYS: Record<string, DayMask> = {
  DAILY: [true, true, true, true, true, true, true],
  WEEKDAY: [true, true, true, true, true, false, false],
  WEEKEND: [false, false, false, false, false, true, true],
};

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildStops(): Stop[] {
  return readCsv("stops.txt").map((row) => {
    const name = row.stop_name;
    return StopSchema.parse({
      id: row.stop_id,
      name: {
        en: name,
        fr: name,
        ar: ARABIC_STATIONS[row.stop_id] ?? name,
      },
      city: STATION_CITY[row.stop_id] ?? "intercity",
      point: {
        lat: Number(row.stop_lat),
        lon: Number(row.stop_lon),
      },
    });
  });
}

function buildLines(): Line[] {
  const routes = readCsv("routes.txt");
  const trips = readCsv("trips.txt");
  const stopTimes = readCsv("stop_times.txt");

  const stopTimesByTrip = new Map<string, { stopId: string; time: string }[]>();
  for (const st of stopTimes) {
    const list = stopTimesByTrip.get(st.trip_id) ?? [];
    list.push({
      stopId: st.stop_id,
      // GTFS uses HH:MM:SS; our model uses HH:MM.
      time: st.departure_time.slice(0, 5),
    });
    stopTimesByTrip.set(st.trip_id, list);
  }

  const lines: Line[] = [];
  for (const route of routes) {
    const routeTrips = trips.filter((t) => t.route_id === route.route_id);
    if (routeTrips.length === 0) continue; // routes without service

    const timetableTrips: TimetableTrip[] = routeTrips.map((trip) => {
      const days = SERVICE_DAYS[trip.service_id];
      if (!days) throw new Error(`unknown service_id ${trip.service_id}`);
      const st = stopTimesByTrip.get(trip.trip_id);
      if (!st || st.length < 2) {
        throw new Error(`trip ${trip.trip_id} has no usable stop_times`);
      }
      return { tripId: trip.trip_id, days: DayMaskSchema.parse(days), stopTimes: st };
    });

    // Canonical stop order: the longest direction-0 trip.
    const canonical = routeTrips
      .filter((t) => t.direction_id === "0")
      .map((t) => stopTimesByTrip.get(t.trip_id) ?? [])
      .sort((a, b) => b.length - a.length)[0];
    if (!canonical) throw new Error(`route ${route.route_id} has no direction-0 trip`);

    const fare = ROUTE_FARES[route.route_id];
    if (!fare) throw new Error(`no fare table entry for ${route.route_id}`);

    const longName = route.route_long_name;
    lines.push(
      LineSchema.parse({
        id: route.route_id,
        mode: "train",
        name: {
          en: `${route.route_short_name} · ${longName}`,
          fr: `${route.route_short_name} · ${longName}`,
          ar: ROUTE_NAMES_AR[route.route_id] ?? longName,
        },
        operator: "ONCF",
        stopIds: canonical.map((st) => st.stopId),
        service: { kind: "timetable", trips: timetableTrips },
        fare,
        paymentModes: ["card", "counter"],
        tier: "cached-verified",
        deepLink: {
          labelKey: "deepLinks.bookOncf",
          url: "https://www.oncf-voyages.ma",
        },
        provenance: PROVENANCE,
      }),
    );
  }
  return lines;
}

function main() {
  const stops = buildStops();
  const lines = buildLines();

  // Referential integrity: every stop referenced by a line must exist.
  const stopIds = new Set(stops.map((s) => s.id));
  for (const line of lines) {
    for (const id of line.stopIds) {
      if (!stopIds.has(id)) {
        throw new Error(`line ${line.id} references unknown stop ${id}`);
      }
    }
    for (const trip of line.service.kind === "timetable"
      ? line.service.trips
      : []) {
      for (const st of trip.stopTimes) {
        if (!stopIds.has(st.stopId)) {
          throw new Error(`trip ${trip.tripId} references unknown stop ${st.stopId}`);
        }
      }
    }
  }

  mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify({ stops, lines }, null, 2) + "\n");
  console.log(
    `Wrote ${stops.length} stops, ${lines.length} lines → ${path.relative(process.cwd(), OUT_FILE)}`,
  );
}

main();
