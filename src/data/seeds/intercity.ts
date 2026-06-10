import type { AdvisoryNote, Line, Stop } from "@/core/types";
import { DAILY } from "@/core/time";
import { editorial, L } from "./util";

/*
 * Intercity coach corridor + network-wide advisories. Rail comes from the
 * converted ONCF GTFS (oncf-rail.json); coaches are seeded for the busiest
 * traveler corridor (Casa ↔ Marrakech) with deep links to operators —
 * we never rebuild ticketing.
 */

export const stops: Stop[] = [
  {
    id: "ctm-casa",
    name: L("CTM Casablanca (city terminal)", "Gare CTM Casablanca", "محطة CTM الدار البيضاء"),
    city: "casablanca",
    point: { lat: 33.59, lon: -7.611 },
  },
  {
    id: "ctm-marrakech",
    placeId: "marrakech-ctm-station",
    name: L("CTM Marrakech (Gueliz)", "Gare CTM Marrakech (Guéliz)", "محطة CTM مراكش (جليز)"),
    city: "marrakech",
    point: { lat: 31.628, lon: -8.021 },
  },
];

export const lines: Line[] = [
  {
    id: "ctm-casa-marrakech",
    mode: "coach",
    name: L(
      "CTM Casablanca – Marrakech",
      "CTM Casablanca – Marrakech",
      "حافلة CTM: الدار البيضاء – مراكش",
    ),
    operator: "CTM",
    stopIds: ["ctm-casa", "ctm-marrakech"],
    service: {
      kind: "timetable",
      trips: [
        // Departures transcribed from ctm.ma search results, April 2026.
        // Times shift seasonally — tier is estimated-flagged on purpose.
        ...["07:00", "10:00", "13:00", "16:30", "19:30"].map((dep) => ({
          tripId: `ctm-cm-${dep.replace(":", "")}`,
          days: DAILY,
          stopTimes: [
            { stopId: "ctm-casa", time: dep },
            { stopId: "ctm-marrakech", time: addHours(dep, 3.75) },
          ],
        })),
        ...["07:30", "10:30", "14:00", "17:00", "20:00"].map((dep) => ({
          tripId: `ctm-mc-${dep.replace(":", "")}`,
          days: DAILY,
          stopTimes: [
            { stopId: "ctm-marrakech", time: dep },
            { stopId: "ctm-casa", time: addHours(dep, 3.75) },
          ],
        })),
      ],
    },
    fare: { currency: "MAD", min: 90, max: 140, per: "person" },
    paymentModes: ["card", "counter", "cash"],
    tier: "estimated-flagged",
    deepLink: { labelKey: "deepLinks.bookCtm", url: "https://ctm.ma" },
    provenance: editorial("2026-04-18"),
  },
];

function addHours(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = Math.round(h * 60 + m + hours * 60);
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export const advisories: AdvisoryNote[] = [
  {
    id: "adv-oncf-delay-comms",
    severity: "info",
    appliesTo: { modes: ["train"] },
    title: L(
      "Delays happen — announcements often don't",
      "Les retards arrivent — les annonces, souvent pas",
      "التأخيرات تحدث — والإعلانات نادرة",
    ),
    body: L(
      "ONCF delays are usually fine but poorly communicated on platforms. Keep 30+ minutes of slack on connections and check the ONCF Trafic app for live status.",
      "Les retards ONCF sont gérables mais mal annoncés en gare. Gardez 30 minutes et plus de marge sur les correspondances et vérifiez l'état en direct sur l'app ONCF Trafic.",
      "تأخيرات ONCF عادية غالبًا لكن الإعلان عنها ضعيف في المحطات. اترك هامش 30 دقيقة أو أكثر للتنقلات وراجع تطبيق ONCF Trafic لمعرفة الحالة المباشرة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-coach-luggage-fee",
    severity: "caution",
    appliesTo: { modes: ["coach"] },
    title: L(
      "Hold luggage costs a small cash fee",
      "Bagages en soute : petit supplément en espèces",
      "أمتعة الصندوق برسم نقدي صغير",
    ),
    body: L(
      "CTM and Supratours charge ~5–10 MAD per hold bag, cash at the luggage desk before boarding. Keep small bills ready or you may miss the departure queue.",
      "CTM et Supratours facturent ~5–10 MAD par bagage en soute, en espèces au comptoir bagages avant l'embarquement. Préparez des petites coupures pour ne pas rater la file de départ.",
      "تفرض CTM وسوبراتور حوالي 5–10 دراهم عن كل حقيبة في الصندوق، نقدًا في شباك الأمتعة قبل الصعود. جهّز أوراقًا نقدية صغيرة حتى لا يفوتك طابور الانطلاق.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-cash-reality",
    severity: "info",
    appliesTo: { modes: ["petit-taxi", "grand-taxi", "bus"] },
    title: L(
      "Morocco's street transport runs on cash",
      "Le transport de rue marche aux espèces",
      "النقل في الشارع يعمل نقدًا",
    ),
    body: L(
      "Taxis and city buses take cash only, and drivers rarely change 200-dirham notes. Break big bills at a café or pharmacy early.",
      "Taxis et bus urbains n'acceptent que les espèces, et les chauffeurs rendent rarement la monnaie sur 200 dirhams. Cassez vos gros billets tôt, dans un café ou une pharmacie.",
      "سيارات الأجرة وحافلات المدينة تقبل النقد فقط، ونادرًا ما يصرف السائقون ورقة 200 درهم. اصرف الأوراق الكبيرة مبكرًا في مقهى أو صيدلية.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];
