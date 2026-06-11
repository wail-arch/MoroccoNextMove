import { z } from "zod";

/*
 * Domain vocabulary for Morocco Next Move.
 *
 * Everything the engine consumes or produces is defined here. Two rules give
 * the product its character:
 *
 * 1. Confidence is data. Every record that can influence a recommendation
 *    carries a ConfidenceTier and a Provenance with `lastVerifiedAt`.
 * 2. Fares are bands, never points. Morocco's street-level pricing reality
 *    makes a single number a lie; a range with a payment hint is honest.
 */

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

export const LocalizedStringSchema = z.object({
  en: z.string(),
  fr: z.string(),
  ar: z.string(),
});
export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

// ---------------------------------------------------------------------------
// Geography
// ---------------------------------------------------------------------------

export const GeoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;

// ---------------------------------------------------------------------------
// Confidence & provenance
// ---------------------------------------------------------------------------

export const CONFIDENCE_TIERS = [
  "official-live",
  "cached-verified",
  "estimated-flagged",
] as const;
export const ConfidenceTierSchema = z.enum(CONFIDENCE_TIERS);
export type ConfidenceTier = z.infer<typeof ConfidenceTierSchema>;

export const ProvenanceSchema = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().optional(),
  license: z.string().optional(),
  method: z.enum([
    "official-feed",
    "community-feed",
    "manual-transcription",
    "osm-extract",
    "editorial-research",
  ]),
  /** ISO date (YYYY-MM-DD) of the last human or feed verification. */
  lastVerifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

// ---------------------------------------------------------------------------
// Money & payment
// ---------------------------------------------------------------------------

export const PAYMENT_MODES = [
  "card",
  "cash",
  "cash-small-bills",
  "onboard",
  "counter",
  "app",
] as const;
export const PaymentModeSchema = z.enum(PAYMENT_MODES);
export type PaymentMode = z.infer<typeof PaymentModeSchema>;

export const FareBandSchema = z.object({
  currency: z.literal("MAD"),
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  per: z.enum(["person", "trip", "vehicle"]),
});
export type FareBand = z.infer<typeof FareBandSchema>;

// ---------------------------------------------------------------------------
// Places & cities
// ---------------------------------------------------------------------------

export const CITY_IDS = [
  "marrakech",
  "casablanca",
  "rabat",
  "tangier",
  "fes",
  "intercity",
] as const;
export const CityIdSchema = z.enum(CITY_IDS);
export type CityId = z.infer<typeof CityIdSchema>;

export const PLACE_KINDS = [
  "airport",
  "rail-station",
  "coach-station",
  "tram-stop",
  "bus-stop",
  "medina-gate",
  "landmark",
  "square",
  "neighborhood",
  "taxi-stand",
  "port",
  "accommodation-area",
] as const;
export const PlaceKindSchema = z.enum(PLACE_KINDS);
export type PlaceKind = z.infer<typeof PlaceKindSchema>;

export const PlaceSchema = z.object({
  id: z.string(),
  kind: PlaceKindSchema,
  name: LocalizedStringSchema,
  city: CityIdSchema,
  point: GeoPointSchema,
  /** True when the place sits inside a medina: walking estimates get slower
   * and the "final 200m" guidance matters more than GPS. */
  inMedina: z.boolean().default(false),
  /** Extra search terms (other spellings, local names). */
  aliases: z.array(z.string()).default([]),
  provenance: ProvenanceSchema,
});
export type Place = z.infer<typeof PlaceSchema>;

export const VerifiedPinSchema = z.object({
  id: z.string(),
  placeId: z.string().optional(),
  name: LocalizedStringSchema,
  point: GeoPointSchema,
  kind: z.enum(["entrance", "pickup-point", "stop", "gate"]),
  tier: ConfidenceTierSchema,
  /** Landmark-based walking instructions for the final approach —
   * written for humans, because GPS is what fails in medinas. */
  walkingNote: LocalizedStringSchema.optional(),
  provenance: ProvenanceSchema,
});
export type VerifiedPin = z.infer<typeof VerifiedPinSchema>;

// ---------------------------------------------------------------------------
// Transport network
// ---------------------------------------------------------------------------

export const TRANSPORT_MODES = [
  "walk",
  "tram",
  "train",
  "coach",
  "bus",
  "petit-taxi",
  "grand-taxi",
] as const;
export const TransportModeSchema = z.enum(TRANSPORT_MODES);
export type TransportMode = z.infer<typeof TransportModeSchema>;

export const StopSchema = z.object({
  id: z.string(),
  placeId: z.string().optional(),
  name: LocalizedStringSchema,
  city: CityIdSchema,
  point: GeoPointSchema,
});
export type Stop = z.infer<typeof StopSchema>;

/** Seven booleans, Monday-first. */
export const DayMaskSchema = z.tuple([
  z.boolean(),
  z.boolean(),
  z.boolean(),
  z.boolean(),
  z.boolean(),
  z.boolean(),
  z.boolean(),
]);
export type DayMask = z.infer<typeof DayMaskSchema>;

export const TimetableTripSchema = z.object({
  tripId: z.string(),
  days: DayMaskSchema,
  /** Ordered stop times along the line, "HH:MM" local Morocco time. */
  stopTimes: z.array(
    z.object({
      stopId: z.string(),
      time: z.string().regex(/^\d{2}:\d{2}$/),
    }),
  ),
});
export type TimetableTrip = z.infer<typeof TimetableTripSchema>;

export const LineServiceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("timetable"),
    trips: z.array(TimetableTripSchema),
  }),
  z.object({
    kind: z.literal("headway"),
    days: DayMaskSchema,
    firstDeparture: z.string().regex(/^\d{2}:\d{2}$/),
    lastDeparture: z.string().regex(/^\d{2}:\d{2}$/),
    headwayMinutes: z.number().positive(),
    /** Average run time between consecutive stops on the line. */
    minutesBetweenStops: z.number().positive(),
  }),
]);
export type LineService = z.infer<typeof LineServiceSchema>;

export const DeepLinkSchema = z.object({
  /** i18n key for the action label, e.g. "deepLinks.bookOncf". */
  labelKey: z.string(),
  url: z.string(),
});
export type DeepLink = z.infer<typeof DeepLinkSchema>;

export const LineSchema = z.object({
  id: z.string(),
  mode: z.enum(["tram", "train", "coach", "bus"]),
  name: LocalizedStringSchema,
  operator: z.string(),
  /** Ordered stop ids; service is assumed symmetrical (both directions). */
  stopIds: z.array(z.string()).min(2),
  service: LineServiceSchema,
  fare: FareBandSchema,
  paymentModes: z.array(PaymentModeSchema).min(1),
  tier: ConfidenceTierSchema,
  deepLink: DeepLinkSchema.optional(),
  provenance: ProvenanceSchema,
});
export type Line = z.infer<typeof LineSchema>;

export const TaxiRuleSchema = z.object({
  id: z.string(),
  city: CityIdSchema,
  kind: z.enum(["petit-taxi", "grand-taxi"]),
  /** Distance-bucketed fare bands; the first bucket whose maxKm covers the
   * trip applies. */
  bands: z
    .array(
      z.object({
        maxKm: z.number().positive(),
        fare: FareBandSchema,
      }),
    )
    .min(1),
  /** Official night multiplier (typically 1.5 in Morocco, 20:00–06:00). */
  nightMultiplier: z.number().min(1),
  paymentModes: z.array(PaymentModeSchema).min(1),
  /** Pin ids of vetted pickup points, when known. */
  pickupPinIds: z.array(z.string()).default([]),
  tier: ConfidenceTierSchema,
  provenance: ProvenanceSchema,
});
export type TaxiRule = z.infer<typeof TaxiRuleSchema>;

// ---------------------------------------------------------------------------
// Advisories (the trust layer)
// ---------------------------------------------------------------------------

export const AdvisorySeveritySchema = z.enum(["info", "caution", "warning"]);
export type AdvisorySeverity = z.infer<typeof AdvisorySeveritySchema>;

export const AdvisoryNoteSchema = z.object({
  id: z.string(),
  severity: AdvisorySeveritySchema,
  /** "disruption" marks dated service notices (works, strikes, seasonal
   * timetables) — rendered more loudly and filtered by activeBetween. */
  kind: z.enum(["advisory", "disruption"]).optional(),
  /** Only surface between these dates (inclusive, ISO YYYY-MM-DD). */
  activeBetween: z
    .object({
      fromIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      toIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
    .optional(),
  appliesTo: z.object({
    modes: z.array(TransportModeSchema).optional(),
    cities: z.array(CityIdSchema).optional(),
    placeIds: z.array(z.string()).optional(),
    /** Only surface between these hours (e.g. night-walk advisories). */
    hours: z
      .object({ fromMinutes: z.number(), toMinutes: z.number() })
      .optional(),
  }),
  title: LocalizedStringSchema,
  body: LocalizedStringSchema,
  tier: ConfidenceTierSchema,
  provenance: ProvenanceSchema,
});
export type AdvisoryNote = z.infer<typeof AdvisoryNoteSchema>;

// ---------------------------------------------------------------------------
// Engine input/output
// ---------------------------------------------------------------------------

/** Everything the engine can see. Providers assemble it; the engine never
 * fetches. Offline simply means the snapshot came from a city pack. */
export const DataSnapshotSchema = z.object({
  places: z.array(PlaceSchema),
  pins: z.array(VerifiedPinSchema),
  stops: z.array(StopSchema),
  lines: z.array(LineSchema),
  taxiRules: z.array(TaxiRuleSchema),
  advisories: z.array(AdvisoryNoteSchema),
});
export type DataSnapshot = z.infer<typeof DataSnapshotSchema>;

export type Connectivity = "online" | "offline";
export type BudgetPref = "lean" | "mid" | "premium";

export interface RankContext {
  origin: { point: GeoPoint; placeId?: string };
  destination: { point: GeoPoint; placeId?: string };
  /** Local Morocco time, precomputed by the caller (core is timezone-free). */
  when: {
    /** Monday = 0 … Sunday = 6. */
    dayOfWeek: number;
    /** Minutes since local midnight. */
    minutes: number;
    /** ISO date (YYYY-MM-DD), used to degrade stale "cached-verified" data. */
    todayIso: string;
  };
  connectivity: Connectivity;
  prefs: { budget: BudgetPref };
}

export type ReasonCode =
  | "fastest"
  | "cheapest"
  | "fewest-transfers"
  | "departs-soon"
  | "works-offline"
  | "night-safer"
  | "avoids-night-walk"
  | "short-walk"
  | "frequent-service"
  | "direct-route"
  | "verified-entrance";

export interface Leg {
  mode: TransportMode;
  from: { name: LocalizedString; point: GeoPoint; stopId?: string };
  to: { name: LocalizedString; point: GeoPoint; stopId?: string };
  durationMinutes: number;
  distanceMeters?: number;
  lineId?: string;
  lineName?: LocalizedString;
  operator?: string;
  /** "HH:MM" local — only for scheduled legs. */
  departAt?: string;
  arriveAt?: string;
  /** Days after the query day this leg departs (0 = today, 1 = tomorrow).
   * Set when the next usable service is on a later day. */
  dayOffset?: number;
  fare?: FareBand;
  paymentModes?: PaymentMode[];
  tier: ConfidenceTier;
  lastVerifiedAt: string;
  /** Landmark walking note for the final approach (walk legs into medinas). */
  walkingNote?: LocalizedString;
}

export interface NextMove {
  id: string;
  /** Dominant mode, for the card icon and title. */
  headlineMode: TransportMode;
  legs: Leg[];
  totalDurationMinutes: number;
  totalFare: FareBand;
  paymentModes: PaymentMode[];
  /** Weakest tier across legs — a chain is as trustworthy as its weakest link. */
  tier: ConfidenceTier;
  /** Oldest verification date across legs. */
  lastVerifiedAt: string;
  transfers: number;
  advisories: AdvisoryNote[];
  deepLink?: DeepLink;
  reasons: ReasonCode[];
  /** Lower is better; roughly "equivalent minutes of traveler cost". */
  score: number;
}

export type IntercityStrategy = "fastest" | "cheapest" | "balanced";
