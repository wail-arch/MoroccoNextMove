import type {
  AdvisoryNote,
  Line,
  Place,
  Stop,
  TaxiRule,
  VerifiedPin,
} from "@/core/types";
import { DAILY } from "@/core/time";
import { editorial, L, osm } from "./util";

/*
 * Marrakech — the launch city with the sharpest traveler pain (dossier §
 * "Traveler Pain Points"). Coordinates come from OpenStreetMap; advisory
 * content synthesizes the recurring complaint patterns the dossier
 * documents (meter refusal, "road closed" trick, contradictory airport-bus
 * schedules). Tiers are deliberately honest: the airport bus is
 * estimated-flagged because its published times genuinely contradict.
 */

export const places: Place[] = [
  {
    id: "rak-airport",
    kind: "airport",
    name: L("Marrakech Menara Airport", "Aéroport Marrakech-Ménara", "مطار مراكش المنارة"),
    city: "marrakech",
    point: { lat: 31.6056, lon: -8.0289 },
    inMedina: false,
    aliases: ["RAK", "Menara", "Menara airport"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "jemaa-el-fnaa",
    kind: "square",
    name: L("Jemaa el-Fnaa", "Place Jemaa el-Fna", "ساحة جامع الفنا"),
    city: "marrakech",
    point: { lat: 31.6258, lon: -7.9891 },
    inMedina: true,
    aliases: ["Djemaa el Fna", "the big square"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "koutoubia",
    kind: "landmark",
    name: L("Koutoubia Mosque", "Mosquée Koutoubia", "مسجد الكتبية"),
    city: "marrakech",
    point: { lat: 31.6242, lon: -7.9939 },
    inMedina: false,
    aliases: ["Kutubiyya"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "marrakech-rail-station",
    kind: "rail-station",
    name: L("Marrakech Train Station", "Gare de Marrakech", "محطة قطار مراكش"),
    city: "marrakech",
    point: { lat: 31.6295, lon: -8.0153 },
    inMedina: false,
    aliases: ["gare ONCF", "train station"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "marrakech-ctm-station",
    kind: "coach-station",
    name: L("CTM Coach Station (Gueliz)", "Gare CTM (Guéliz)", "محطة حافلات CTM (جليز)"),
    city: "marrakech",
    point: { lat: 31.628, lon: -8.021 },
    inMedina: false,
    aliases: ["CTM"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "bab-doukkala",
    kind: "medina-gate",
    name: L("Bab Doukkala", "Bab Doukkala", "باب دكالة"),
    city: "marrakech",
    point: { lat: 31.6336, lon: -7.9947 },
    inMedina: true,
    aliases: [],
    provenance: osm("2026-05-15"),
  },
  {
    id: "bab-agnaou",
    kind: "medina-gate",
    name: L("Bab Agnaou", "Bab Agnaou", "باب أكناو"),
    city: "marrakech",
    point: { lat: 31.6177, lon: -7.9897 },
    inMedina: true,
    aliases: ["Kasbah gate"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "medina-north-riads",
    kind: "accommodation-area",
    name: L(
      "Riad area — Medina North",
      "Quartier des riads — Médina Nord",
      "منطقة الرياضات — شمال المدينة العتيقة",
    ),
    city: "marrakech",
    point: { lat: 31.633, lon: -7.986 },
    inMedina: true,
    aliases: ["Dar el Bacha", "Riad Laarous"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "kasbah-marrakech",
    kind: "accommodation-area",
    name: L("Kasbah district", "Quartier Kasbah", "حي القصبة"),
    city: "marrakech",
    point: { lat: 31.616, lon: -7.989 },
    inMedina: true,
    aliases: ["Saadian tombs area"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "gueliz",
    kind: "neighborhood",
    name: L("Gueliz (new town)", "Guéliz (ville nouvelle)", "جليز (المدينة الجديدة)"),
    city: "marrakech",
    point: { lat: 31.6346, lon: -8.0079 },
    inMedina: false,
    aliases: ["ville nouvelle"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "majorelle",
    kind: "landmark",
    name: L("Majorelle Garden", "Jardin Majorelle", "حديقة ماجوريل"),
    city: "marrakech",
    point: { lat: 31.6417, lon: -8.0035 },
    inMedina: false,
    aliases: ["YSL garden"],
    provenance: osm("2026-05-15"),
  },
];

export const pins: VerifiedPin[] = [
  {
    id: "pin-rak-taxi-rank",
    placeId: "rak-airport",
    name: L(
      "Official taxi rank — Arrivals exit",
      "Station de taxis officielle — sortie Arrivées",
      "موقف سيارات الأجرة الرسمي — مخرج الوصول",
    ),
    point: { lat: 31.6052, lon: -8.0283 },
    kind: "pickup-point",
    tier: "cached-verified",
    walkingNote: L(
      "Exit arrivals, walk right past the café terrace; the marshalled rank is 50 m ahead.",
      "À la sortie des arrivées, longez la terrasse du café à droite ; la station organisée est à 50 m.",
      "اخرج من قاعة الوصول واتجه يمينًا بعد مقهى المحطة؛ الموقف المنظَّم على بعد 50 مترًا.",
    ),
    provenance: editorial("2026-04-18"),
  },
  {
    id: "pin-bab-doukkala-gate",
    placeId: "bab-doukkala",
    name: L("Bab Doukkala gate arch", "Arche de Bab Doukkala", "قوس باب دكالة"),
    point: { lat: 31.6336, lon: -7.9947 },
    kind: "gate",
    tier: "cached-verified",
    walkingNote: L(
      "Taxis stop on the boulevard side. Enter through the main arch; the medina lane forks after 80 m — riads north are to the left.",
      "Les taxis s'arrêtent côté boulevard. Passez l'arche principale ; la ruelle bifurque après 80 m — les riads du nord sont à gauche.",
      "تتوقف سيارات الأجرة من جهة الشارع الكبير. ادخل من القوس الرئيسي؛ يتفرع الزقاق بعد 80 مترًا — رياضات الشمال على اليسار.",
    ),
    provenance: editorial("2026-04-18"),
  },
  {
    id: "pin-medina-north-sample",
    placeId: "medina-north-riads",
    name: L(
      "Riad area reference point — Derb Laarous",
      "Point de repère riads — Derb Laarous",
      "نقطة استدلال الرياضات — درب العروس",
    ),
    point: { lat: 31.6331, lon: -7.9858 },
    kind: "entrance",
    tier: "estimated-flagged",
    walkingNote: L(
      "From Bab Doukkala, follow the main lane past the hammam, then the third derb on the left. Ask your riad for its exact door note — alleys here are unnamed.",
      "Depuis Bab Doukkala, suivez la ruelle principale après le hammam, puis le troisième derb à gauche. Demandez à votre riad sa note d'accès exacte — les ruelles n'ont pas de nom ici.",
      "من باب دكالة، اتبع الزقاق الرئيسي بعد الحمّام، ثم ثالث درب على اليسار. اطلب من رياضك وصف الباب الدقيق — الأزقة هنا بلا أسماء.",
    ),
    provenance: editorial("2026-04-18"),
  },
];

export const stops: Stop[] = [
  {
    id: "stop-rak-airport-bus",
    placeId: "rak-airport",
    name: L("Airport bus stop (L19)", "Arrêt navette aéroport (L19)", "محطة حافلة المطار (خط 19)"),
    city: "marrakech",
    point: { lat: 31.6058, lon: -8.0279 },
  },
  {
    id: "stop-arset-el-bilk",
    placeId: "jemaa-el-fnaa",
    name: L(
      "Arset El Bilk (Jemaa el-Fnaa)",
      "Arset El Bilk (Jemaa el-Fna)",
      "أرست البيلك (جامع الفنا)",
    ),
    city: "marrakech",
    point: { lat: 31.6266, lon: -7.9905 },
  },
  {
    id: "stop-marrakech-station-bus",
    placeId: "marrakech-rail-station",
    name: L("Train station (L19)", "Gare ONCF (L19)", "محطة القطار (خط 19)"),
    city: "marrakech",
    point: { lat: 31.6293, lon: -8.0148 },
  },
];

export const lines: Line[] = [
  {
    id: "alsa-l19-airport",
    mode: "bus",
    name: L("Airport Express L19", "Navette aéroport L19", "حافلة المطار السريعة 19"),
    operator: "Alsa Marrakech",
    stopIds: ["stop-rak-airport-bus", "stop-marrakech-station-bus", "stop-arset-el-bilk"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:30",
      lastDeparture: "23:00",
      headwayMinutes: 30,
      minutesBetweenStops: 12,
    },
    fare: { currency: "MAD", min: 30, max: 50, per: "person" },
    paymentModes: ["cash-small-bills", "onboard"],
    tier: "estimated-flagged",
    provenance: editorial("2026-04-18"),
  },
];

export const taxiRules: TaxiRule[] = [
  {
    id: "marrakech-petit-taxi",
    city: "marrakech",
    kind: "petit-taxi",
    bands: [
      { maxKm: 3, fare: { currency: "MAD", min: 20, max: 40, per: "vehicle" } },
      { maxKm: 8, fare: { currency: "MAD", min: 40, max: 80, per: "vehicle" } },
      { maxKm: 15, fare: { currency: "MAD", min: 70, max: 150, per: "vehicle" } },
    ],
    nightMultiplier: 1.5,
    paymentModes: ["cash-small-bills"],
    pickupPinIds: ["pin-rak-taxi-rank"],
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];

export const advisories: AdvisoryNote[] = [
  {
    id: "adv-mkx-airport-taxi-price",
    severity: "warning",
    appliesTo: { modes: ["petit-taxi", "grand-taxi"], placeIds: ["rak-airport"] },
    title: L(
      "Agree the fare before you ride",
      "Convenez du prix avant de monter",
      "اتفق على الأجرة قبل الركوب",
    ),
    body: L(
      "Meters are rarely honored from the airport. Expect 70–100 MAD to the medina by day, 100–150 at night. Use the marshalled rank outside arrivals and confirm the price out loud before luggage goes in.",
      "Le compteur est rarement utilisé depuis l'aéroport. Comptez 70–100 MAD vers la médina de jour, 100–150 la nuit. Utilisez la station organisée à la sortie des arrivées et confirmez le prix à voix haute avant de charger les bagages.",
      "نادرًا ما يُستخدم العداد من المطار. توقَّع 70–100 درهم إلى المدينة العتيقة نهارًا و100–150 ليلًا. استخدم الموقف المنظَّم خارج قاعة الوصول وأكِّد السعر بصوت واضح قبل تحميل الأمتعة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-mkx-bus19-uncertain",
    severity: "caution",
    appliesTo: { modes: ["bus"], placeIds: ["rak-airport"] },
    title: L(
      "Bus 19 times are unreliable",
      "Horaires de la ligne 19 peu fiables",
      "مواعيد الحافلة 19 غير موثوقة",
    ),
    body: L(
      "Published timetables for the airport bus contradict each other, and travelers report missed last departures. If no bus arrives within 20 minutes, switch to the taxi rank — don't wait into the night.",
      "Les horaires publiés de la navette aéroport se contredisent, et des voyageurs signalent des derniers départs manqués. Si aucun bus n'arrive sous 20 minutes, passez à la station de taxis — n'attendez pas la nuit.",
      "جداول حافلة المطار المنشورة متناقضة، ويُبلغ مسافرون عن تفويت آخر الرحلات. إذا لم تصل حافلة خلال 20 دقيقة، انتقل إلى موقف سيارات الأجرة — لا تنتظر حتى يحلّ الليل.",
    ),
    tier: "estimated-flagged",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-mkx-road-closed-trick",
    severity: "caution",
    appliesTo: {
      modes: ["walk"],
      placeIds: ["jemaa-el-fnaa", "bab-doukkala", "bab-agnaou", "medina-north-riads", "kasbah-marrakech"],
    },
    title: L("The “road closed” trick", "L'arnaque « rue fermée »", "خدعة «الطريق مسدود»"),
    body: L(
      "Near the square and the gates, strangers may insist your street is closed or the riad has moved — it almost never has. Keep following your route; unsolicited guiding ends with a demand for money.",
      "Près de la place et des portes, des inconnus peuvent insister que votre rue est fermée ou que le riad a déménagé — c'est presque toujours faux. Suivez votre itinéraire ; un guidage non sollicité se termine par une demande d'argent.",
      "قرب الساحة والأبواب، قد يُصرّ غرباء على أن شارعك مسدود أو أن الرياض انتقل — وهذا غير صحيح في الغالب. واصل طريقك؛ فالإرشاد غير المطلوب ينتهي بطلب نقود.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-mkx-night-medina",
    severity: "caution",
    appliesTo: {
      modes: ["walk"],
      cities: ["marrakech"],
      hours: { fromMinutes: 21 * 60 + 30, toMinutes: 5 * 60 + 30 },
    },
    title: L("Medina alleys empty out late", "Les ruelles se vident tard le soir", "تخلو الأزقة في وقت متأخر"),
    body: L(
      "After ~21:30 the inner derbs go quiet and dark. Stick to the lit main arteries, or take a taxi to the nearest gate and walk the final stretch.",
      "Après 21 h 30 environ, les derbs intérieurs deviennent calmes et sombres. Restez sur les artères éclairées, ou prenez un taxi jusqu'à la porte la plus proche et finissez à pied.",
      "بعد حوالي 21:30 تصبح الدروب الداخلية هادئة ومظلمة. الزم الشوارع الرئيسية المضاءة، أو خذ سيارة أجرة إلى أقرب باب وامشِ المسافة الأخيرة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];
