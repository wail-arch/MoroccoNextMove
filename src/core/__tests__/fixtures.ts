import { DAILY } from "../time";
import type {
  AdvisoryNote,
  DataSnapshot,
  Line,
  Place,
  Provenance,
  RankContext,
  Stop,
  TaxiRule,
  VerifiedPin,
} from "../types";

/*
 * Synthetic but geographically realistic fixture data. Coordinates are
 * approximate real-world locations so distance math behaves like production.
 */

export const TODAY = "2026-06-11";

function prov(
  lastVerifiedAt: string,
  method: Provenance["method"] = "manual-transcription",
): Provenance {
  return {
    sourceId: "fixture",
    sourceName: "Test fixture",
    method,
    lastVerifiedAt,
  };
}

const name = (en: string) => ({ en, fr: en, ar: en });

export const places: Place[] = [
  {
    id: "rak-airport",
    kind: "airport",
    name: name("Marrakech Menara Airport"),
    city: "marrakech",
    point: { lat: 31.6069, lon: -8.0263 },
    inMedina: false,
    aliases: ["RAK"],
    provenance: prov("2026-05-01"),
  },
  {
    id: "jemaa-el-fnaa",
    kind: "square",
    name: name("Jemaa el-Fnaa"),
    city: "marrakech",
    point: { lat: 31.6258, lon: -7.9891 },
    inMedina: true,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
  {
    id: "riad-area-north",
    kind: "accommodation-area",
    name: name("Riad area — Medina North"),
    city: "marrakech",
    point: { lat: 31.628, lon: -7.988 },
    inMedina: true,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
  {
    id: "marrakech-station",
    kind: "rail-station",
    name: name("Marrakech Station"),
    city: "marrakech",
    point: { lat: 31.6469, lon: -8.0146 },
    inMedina: false,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
  {
    id: "bab-doukkala-gate",
    kind: "medina-gate",
    name: name("Bab Doukkala"),
    city: "marrakech",
    point: { lat: 31.6336, lon: -7.9947 },
    inMedina: true,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
  {
    id: "casa-voyageurs",
    kind: "rail-station",
    name: name("Casa-Voyageurs"),
    city: "casablanca",
    point: { lat: 33.5979, lon: -7.6191 },
    inMedina: false,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
  {
    id: "casa-port",
    kind: "rail-station",
    name: name("Casa-Port"),
    city: "casablanca",
    point: { lat: 33.6065, lon: -7.628 },
    inMedina: false,
    aliases: [],
    provenance: prov("2026-05-01"),
  },
];

export const pins: VerifiedPin[] = [
  {
    id: "pin-riad-north",
    placeId: "riad-area-north",
    name: name("Riad entrance — Derb Dekkak"),
    point: { lat: 31.6281, lon: -7.9879 },
    kind: "entrance",
    tier: "cached-verified",
    walkingNote: {
      en: "From the square, take the alley left of the mosque; second arch on the right.",
      fr: "Depuis la place, prenez la ruelle à gauche de la mosquée ; deuxième arche à droite.",
      ar: "من الساحة، اسلك الزقاق على يسار المسجد؛ القوس الثاني على اليمين.",
    },
    provenance: prov("2026-05-20"),
  },
];

export const stops: Stop[] = [
  {
    id: "stop-rak-airport",
    placeId: "rak-airport",
    name: name("Airport (Bus 19)"),
    city: "marrakech",
    point: { lat: 31.6069, lon: -8.0263 },
  },
  {
    id: "stop-jemaa",
    placeId: "jemaa-el-fnaa",
    name: name("Jemaa el-Fnaa (Bus 19)"),
    city: "marrakech",
    point: { lat: 31.6258, lon: -7.9891 },
  },
  {
    id: "tram-casa-voyageurs",
    name: name("Gare Casa-Voyageurs (T1)"),
    city: "casablanca",
    point: { lat: 33.5982, lon: -7.6185 },
  },
  {
    id: "tram-marche-central",
    name: name("Marché Central (T1)"),
    city: "casablanca",
    point: { lat: 33.6021, lon: -7.6231 },
  },
  {
    id: "tram-casa-port",
    name: name("Casa-Port (T1)"),
    city: "casablanca",
    point: { lat: 33.606, lon: -7.6275 },
  },
  {
    id: "CASA_VOYAGEURS",
    placeId: "casa-voyageurs",
    name: name("Casa-Voyageurs"),
    city: "casablanca",
    point: { lat: 33.5979, lon: -7.6191 },
  },
  {
    id: "MARRAKECH",
    placeId: "marrakech-station",
    name: name("Marrakech"),
    city: "marrakech",
    point: { lat: 31.6469, lon: -8.0146 },
  },
  {
    id: "TANGER_VILLE",
    name: name("Tanger-Ville"),
    city: "tangier",
    point: { lat: 35.7643, lon: -5.834 },
  },
  {
    id: "KENITRA",
    name: name("Kénitra"),
    city: "rabat",
    point: { lat: 34.261, lon: -6.5802 },
  },
];

export const lines: Line[] = [
  {
    id: "bus-19-airport",
    mode: "bus",
    name: name("Airport Bus 19"),
    operator: "Alsa Marrakech",
    stopIds: ["stop-rak-airport", "stop-jemaa"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:30",
      lastDeparture: "21:30",
      headwayMinutes: 30,
      minutesBetweenStops: 25,
    },
    fare: { currency: "MAD", min: 30, max: 50, per: "person" },
    paymentModes: ["cash-small-bills", "onboard"],
    tier: "estimated-flagged",
    provenance: prov("2026-04-15", "editorial-research"),
  },
  {
    id: "casa-tram-t1",
    mode: "tram",
    name: name("Casa Tram T1"),
    operator: "Casatramway",
    stopIds: ["tram-casa-voyageurs", "tram-marche-central", "tram-casa-port"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:00",
      lastDeparture: "23:00",
      headwayMinutes: 10,
      minutesBetweenStops: 4,
    },
    fare: { currency: "MAD", min: 8, max: 8, per: "person" },
    paymentModes: ["cash", "card"],
    tier: "cached-verified",
    provenance: prov("2026-05-10"),
  },
  {
    id: "al-atlas-casa-marrakech",
    mode: "train",
    name: name("Al Atlas Casablanca – Marrakech"),
    operator: "ONCF",
    stopIds: ["CASA_VOYAGEURS", "MARRAKECH"],
    service: {
      kind: "timetable",
      trips: [
        {
          tripId: "atlas-0850",
          days: DAILY,
          stopTimes: [
            { stopId: "CASA_VOYAGEURS", time: "08:50" },
            { stopId: "MARRAKECH", time: "11:50" },
          ],
        },
        {
          tripId: "atlas-1250",
          days: DAILY,
          stopTimes: [
            { stopId: "CASA_VOYAGEURS", time: "12:50" },
            { stopId: "MARRAKECH", time: "15:50" },
          ],
        },
        {
          tripId: "atlas-1650",
          days: DAILY,
          stopTimes: [
            { stopId: "CASA_VOYAGEURS", time: "16:50" },
            { stopId: "MARRAKECH", time: "19:50" },
          ],
        },
      ],
    },
    fare: { currency: "MAD", min: 90, max: 150, per: "person" },
    paymentModes: ["card", "counter"],
    tier: "cached-verified",
    deepLink: { labelKey: "deepLinks.bookOncf", url: "https://www.oncf-voyages.ma" },
    provenance: prov("2026-05-15", "community-feed"),
  },
  {
    id: "ctm-casa-marrakech",
    mode: "coach",
    name: name("CTM Casablanca – Marrakech"),
    operator: "CTM",
    stopIds: ["CASA_VOYAGEURS", "MARRAKECH"],
    service: {
      kind: "timetable",
      trips: [
        {
          tripId: "ctm-0930",
          days: DAILY,
          stopTimes: [
            { stopId: "CASA_VOYAGEURS", time: "09:30" },
            { stopId: "MARRAKECH", time: "13:30" },
          ],
        },
      ],
    },
    fare: { currency: "MAD", min: 60, max: 90, per: "person" },
    paymentModes: ["card", "counter", "cash"],
    tier: "cached-verified",
    deepLink: { labelKey: "deepLinks.bookCtm", url: "https://ctm.ma" },
    provenance: prov("2026-05-15"),
  },
  {
    id: "al-boraq-tanger-casa",
    mode: "train",
    name: name("Al Boraq Tanger – Casablanca"),
    operator: "ONCF",
    stopIds: ["TANGER_VILLE", "KENITRA", "CASA_VOYAGEURS"],
    service: {
      kind: "timetable",
      trips: [
        {
          tripId: "boraq-0800",
          days: DAILY,
          stopTimes: [
            { stopId: "TANGER_VILLE", time: "08:00" },
            { stopId: "KENITRA", time: "09:10" },
            { stopId: "CASA_VOYAGEURS", time: "10:10" },
          ],
        },
      ],
    },
    fare: { currency: "MAD", min: 150, max: 250, per: "person" },
    paymentModes: ["card", "counter"],
    tier: "cached-verified",
    deepLink: { labelKey: "deepLinks.bookOncf", url: "https://www.oncf-voyages.ma" },
    provenance: prov("2026-05-15", "community-feed"),
  },
];

export const taxiRules: TaxiRule[] = [
  {
    id: "marrakech-petit",
    city: "marrakech",
    kind: "petit-taxi",
    bands: [
      { maxKm: 3, fare: { currency: "MAD", min: 15, max: 25, per: "vehicle" } },
      { maxKm: 8, fare: { currency: "MAD", min: 25, max: 50, per: "vehicle" } },
      { maxKm: 15, fare: { currency: "MAD", min: 50, max: 100, per: "vehicle" } },
    ],
    nightMultiplier: 1.5,
    paymentModes: ["cash-small-bills"],
    pickupPinIds: [],
    tier: "cached-verified",
    provenance: prov("2026-05-01", "editorial-research"),
  },
  {
    id: "casablanca-petit",
    city: "casablanca",
    kind: "petit-taxi",
    bands: [
      { maxKm: 3, fare: { currency: "MAD", min: 15, max: 25, per: "vehicle" } },
      { maxKm: 10, fare: { currency: "MAD", min: 25, max: 60, per: "vehicle" } },
    ],
    nightMultiplier: 1.5,
    paymentModes: ["cash-small-bills"],
    pickupPinIds: [],
    tier: "cached-verified",
    provenance: prov("2026-05-01", "editorial-research"),
  },
];

export const advisories: AdvisoryNote[] = [
  {
    id: "adv-taxi-meter-marrakech",
    severity: "caution",
    appliesTo: { modes: ["petit-taxi"], cities: ["marrakech"] },
    title: name("Ask for the meter"),
    body: name(
      "Meters start at 2.50 MAD. If the driver refuses the meter, agree on a price before getting in.",
    ),
    tier: "cached-verified",
    provenance: prov("2026-04-20", "editorial-research"),
  },
  {
    id: "adv-night-walk",
    severity: "warning",
    appliesTo: {
      modes: ["walk"],
      hours: { fromMinutes: 21 * 60, toMinutes: 6 * 60 },
    },
    title: name("Late-night walk"),
    body: name("Streets empty out late. Prefer a taxi for longer distances."),
    tier: "cached-verified",
    provenance: prov("2026-04-20", "editorial-research"),
  },
  {
    id: "adv-jemaa-fake-guides",
    severity: "caution",
    appliesTo: { modes: ["walk"], placeIds: ["jemaa-el-fnaa"] },
    title: name("“Road closed” trick"),
    body: name(
      "Around the square, ignore claims that a street is closed — it almost never is. Follow your route.",
    ),
    tier: "cached-verified",
    provenance: prov("2026-04-20", "editorial-research"),
  },
];

export const snapshot: DataSnapshot = {
  places,
  pins,
  stops,
  lines,
  taxiRules,
  advisories,
};

export function makeContext(overrides: {
  originPlaceId: string;
  destinationPlaceId: string;
  minutes: number;
  dayOfWeek?: number;
  budget?: RankContext["prefs"]["budget"];
  connectivity?: RankContext["connectivity"];
}): RankContext {
  const origin = places.find((p) => p.id === overrides.originPlaceId);
  const destination = places.find((p) => p.id === overrides.destinationPlaceId);
  if (!origin || !destination) {
    throw new Error("fixture place not found");
  }
  return {
    origin: { point: origin.point, placeId: origin.id },
    destination: { point: destination.point, placeId: destination.id },
    when: {
      dayOfWeek: overrides.dayOfWeek ?? 0,
      minutes: overrides.minutes,
      todayIso: TODAY,
    },
    connectivity: overrides.connectivity ?? "online",
    prefs: { budget: overrides.budget ?? "mid" },
  };
}
