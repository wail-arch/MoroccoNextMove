import type {
  AdvisoryNote,
  Line,
  Place,
  Stop,
  TaxiRule,
  VerifiedPin,
} from "@/core/types";
import { DAILY } from "@/core/time";
import { editorial, L, osm, transcribed } from "./util";

/*
 * Rabat-Salé — the richest multimodal stack in Morocco (dossier: tramway,
 * Blassty, ONCF hub) and the calmest medina of the three launch cities.
 * Tram stop lists are curated subsets of the official L1/L2 maps.
 */

export const places: Place[] = [
  {
    id: "rabat-ville-station",
    kind: "rail-station",
    name: L("Rabat-Ville Station", "Gare Rabat-Ville", "محطة الرباط المدينة"),
    city: "rabat",
    point: { lat: 34.0212, lon: -6.8395 },
    inMedina: false,
    aliases: ["gare Rabat Ville"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "rabat-agdal-station",
    kind: "rail-station",
    name: L("Rabat-Agdal Station", "Gare Rabat-Agdal", "محطة الرباط أكدال"),
    city: "rabat",
    point: { lat: 34.0078, lon: -6.8517 },
    inMedina: false,
    aliases: ["Agdal TGV", "Al Boraq station"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "kasbah-oudayas",
    kind: "landmark",
    name: L("Kasbah of the Udayas", "Kasbah des Oudayas", "قصبة الأوداية"),
    city: "rabat",
    point: { lat: 34.0319, lon: -6.8367 },
    inMedina: false,
    aliases: ["Oudaias"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "rabat-medina",
    kind: "accommodation-area",
    name: L("Rabat Medina", "Médina de Rabat", "المدينة العتيقة بالرباط"),
    city: "rabat",
    point: { lat: 34.0253, lon: -6.836 },
    inMedina: true,
    aliases: ["old town"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "hassan-tower",
    kind: "landmark",
    name: L("Hassan Tower", "Tour Hassan", "صومعة حسان"),
    city: "rabat",
    point: { lat: 34.0241, lon: -6.8222 },
    inMedina: false,
    aliases: ["Mausoleum of Mohammed V"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "chellah",
    kind: "landmark",
    name: L("Chellah Necropolis", "Chellah", "شالة"),
    city: "rabat",
    point: { lat: 34.0072, lon: -6.8208 },
    inMedina: false,
    aliases: [],
    provenance: osm("2026-05-15"),
  },
  {
    id: "sale-medina",
    kind: "neighborhood",
    name: L("Salé Medina", "Médina de Salé", "المدينة العتيقة بسلا"),
    city: "rabat",
    point: { lat: 34.0383, lon: -6.813 },
    inMedina: true,
    aliases: ["Sale"],
    provenance: osm("2026-05-15"),
  },
];

export const pins: VerifiedPin[] = [
  {
    id: "pin-rabat-medina-bab-el-had",
    placeId: "rabat-medina",
    name: L(
      "Bab El Had entrance",
      "Entrée Bab El Had",
      "مدخل باب الحد",
    ),
    point: { lat: 34.0205, lon: -6.844 },
    kind: "gate",
    tier: "cached-verified",
    walkingNote: L(
      "Enter at Bab El Had and follow Avenue Mohammed V straight through the medina — it's a near-straight spine, much easier than Marrakech.",
      "Entrez par Bab El Had et suivez l'avenue Mohammed V à travers la médina — un axe quasi rectiligne, bien plus simple qu'à Marrakech.",
      "ادخل من باب الحد واتبع شارع محمد الخامس عبر المدينة العتيقة — محور شبه مستقيم، أسهل بكثير من مراكش.",
    ),
    provenance: editorial("2026-04-18"),
  },
];

export const stops: Stop[] = [
  {
    id: "tram-bab-lamrissa",
    placeId: "sale-medina",
    name: L("Bab Lamrissa (tram)", "Bab Lamrissa (tram)", "باب المريسة (ترام)"),
    city: "rabat",
    point: { lat: 34.0345, lon: -6.8155 },
  },
  {
    id: "tram-rabat-ville",
    placeId: "rabat-ville-station",
    name: L("Gare Rabat-Ville (tram)", "Gare Rabat-Ville (tram)", "محطة الرباط المدينة (ترام)"),
    city: "rabat",
    point: { lat: 34.0206, lon: -6.8413 },
  },
  {
    id: "tram-bab-el-had",
    placeId: "rabat-medina",
    name: L("Bab El Had (tram)", "Bab El Had (tram)", "باب الحد (ترام)"),
    city: "rabat",
    point: { lat: 34.0207, lon: -6.8443 },
  },
  {
    id: "tram-agdal-france",
    placeId: "rabat-agdal-station",
    name: L("Avenue de France, Agdal (tram)", "Avenue de France, Agdal (tram)", "شارع فرنسا، أكدال (ترام)"),
    city: "rabat",
    point: { lat: 34.005, lon: -6.853 },
  },
  {
    id: "tram-tour-hassan",
    placeId: "hassan-tower",
    name: L("Tour Hassan (tram)", "Tour Hassan (tram)", "صومعة حسان (ترام)"),
    city: "rabat",
    point: { lat: 34.0245, lon: -6.8265 },
  },
];

export const lines: Line[] = [
  {
    id: "rabat-tram-l1",
    mode: "tram",
    name: L("Rabat-Salé Tram L1", "Tramway Rabat-Salé L1", "ترامواي الرباط-سلا الخط 1"),
    operator: "Société du Tramway de Rabat-Salé",
    stopIds: ["tram-bab-lamrissa", "tram-rabat-ville", "tram-agdal-france"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:00",
      lastDeparture: "22:30",
      headwayMinutes: 12,
      minutesBetweenStops: 11,
    },
    fare: { currency: "MAD", min: 6, max: 7, per: "person" },
    paymentModes: ["cash", "card"],
    tier: "cached-verified",
    provenance: transcribed(
      "2026-05-10",
      "tram-way.ma official timetable & fares",
      "https://www.tram-way.ma",
    ),
  },
  {
    id: "rabat-tram-l2",
    mode: "tram",
    name: L("Rabat-Salé Tram L2", "Tramway Rabat-Salé L2", "ترامواي الرباط-سلا الخط 2"),
    operator: "Société du Tramway de Rabat-Salé",
    stopIds: ["tram-bab-lamrissa", "tram-tour-hassan", "tram-bab-el-had"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:00",
      lastDeparture: "22:30",
      headwayMinutes: 12,
      minutesBetweenStops: 9,
    },
    fare: { currency: "MAD", min: 6, max: 7, per: "person" },
    paymentModes: ["cash", "card"],
    tier: "cached-verified",
    provenance: transcribed(
      "2026-05-10",
      "tram-way.ma official timetable & fares",
      "https://www.tram-way.ma",
    ),
  },
];

export const taxiRules: TaxiRule[] = [
  {
    id: "rabat-petit-taxi",
    city: "rabat",
    kind: "petit-taxi",
    bands: [
      { maxKm: 3, fare: { currency: "MAD", min: 15, max: 25, per: "vehicle" } },
      { maxKm: 10, fare: { currency: "MAD", min: 25, max: 60, per: "vehicle" } },
    ],
    nightMultiplier: 1.5,
    paymentModes: ["cash-small-bills"],
    pickupPinIds: [],
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];

export const advisories: AdvisoryNote[] = [
  {
    id: "adv-rabat-tram-easy",
    severity: "info",
    appliesTo: { modes: ["tram"], cities: ["rabat"] },
    title: L("The tram is the easy answer here", "Le tram est la solution simple ici", "الترامواي هو الحل السهل هنا"),
    body: L(
      "Rabat-Salé's tram is clean, frequent and crosses the river. Tickets ~6 MAD from platform machines; validate before boarding.",
      "Le tramway de Rabat-Salé est propre, fréquent et traverse le fleuve. Billets ~6 MAD aux bornes des stations ; validez avant de monter.",
      "ترامواي الرباط-سلا نظيف ومتكرر ويعبر النهر. التذاكر حوالي 6 دراهم من آلات المحطة؛ فعِّلها قبل الصعود.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-rabat-blue-taxis",
    severity: "info",
    appliesTo: { modes: ["petit-taxi"], cities: ["rabat"] },
    title: L("Blue taxis usually run the meter", "Les taxis bleus utilisent généralement le compteur", "سيارات الأجرة الزرقاء تستعمل العداد عادة"),
    body: L(
      "Rabat's blue petit taxis are the best-behaved in the country on meters. Short hops around the center rarely exceed 20–30 MAD by day.",
      "Les petits taxis bleus de Rabat sont les plus disciplinés du pays côté compteur. Une course courte dans le centre dépasse rarement 20–30 MAD en journée.",
      "سيارات الأجرة الزرقاء في الرباط هي الأكثر انضباطًا في استعمال العداد. نادرًا ما تتجاوز المشاوير القصيرة وسط المدينة 20–30 درهمًا نهارًا.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-rabat-medina-calm",
    severity: "info",
    appliesTo: { modes: ["walk"], placeIds: ["rabat-medina", "sale-medina"] },
    title: L("A gentler medina", "Une médina plus douce", "مدينة عتيقة ألطف"),
    body: L(
      "Rabat's medina is gridded and low-pressure — a good place to practice medina navigation before Marrakech or Fes. GPS works better here, though alley names still vanish.",
      "La médina de Rabat est quadrillée et tranquille — idéale pour s'entraîner avant Marrakech ou Fès. Le GPS y fonctionne mieux, même si les noms de ruelles restent rares.",
      "المدينة العتيقة بالرباط منظمة وهادئة — مكان جيد للتمرّن على التجول قبل مراكش أو فاس. يعمل GPS هنا بشكل أفضل، وإن ظلت أسماء الأزقة نادرة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];
