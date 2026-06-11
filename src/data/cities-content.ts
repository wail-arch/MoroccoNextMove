import type { CityId, LocalizedString } from "@/core/types";
import { L } from "./seeds/util";

/*
 * Editorial city guides — the discovery layer. Deliberately light: the
 * product is the answer engine; these pages orient a traveler and funnel
 * into /move with prefilled questions they actually have on arrival.
 */

export interface MovePreset {
  label: LocalizedString;
  from: string;
  to: string;
}

export interface CityGuide {
  slug: string;
  cityId: CityId;
  regionId: string;
  name: LocalizedString;
  tagline: LocalizedString;
  intro: LocalizedString;
  movePresets: MovePreset[];
  hasOfflinePack: boolean;
  /** Slot name in public/images/images.manifest.json for generated art. */
  imageSlot: string;
}

export const CITY_GUIDES: CityGuide[] = [
  {
    slug: "marrakech",
    cityId: "marrakech",
    regionId: "MA-07",
    name: L("Marrakech", "Marrakech", "مراكش"),
    tagline: L(
      "Where the last 200 meters matter most",
      "Là où les 200 derniers mètres comptent le plus",
      "حيث تهم آخر 200 متر أكثر من أي شيء",
    ),
    intro: L(
      "The medina is the reason you came — and the reason GPS gives up. Next Move covers the moments that actually go wrong here: the airport taxi negotiation, the bus that may or may not come, and finding a riad door in an unnamed derb after dark.",
      "La médina est la raison de votre venue — et celle pour laquelle le GPS abandonne. Next Move couvre les moments qui dérapent vraiment ici : la négociation du taxi à l'aéroport, le bus incertain, et la porte d'un riad dans un derb sans nom à la nuit tombée.",
      "المدينة العتيقة هي سبب قدومك — وهي أيضًا سبب استسلام GPS. يغطي «الخطوة التالية» اللحظات التي تسوء فعلًا هنا: مفاوضة سيارة الأجرة في المطار، والحافلة التي قد تأتي أو لا تأتي، والعثور على باب رياض في درب بلا اسم بعد حلول الظلام.",
    ),
    movePresets: [
      {
        label: L(
          "Airport → riads in the northern medina",
          "Aéroport → riads de la médina nord",
          "المطار ← رياضات شمال المدينة",
        ),
        from: "rak-airport",
        to: "medina-north-riads",
      },
      {
        label: L(
          "Train station → Jemaa el-Fnaa",
          "Gare → Jemaa el-Fna",
          "محطة القطار ← جامع الفنا",
        ),
        from: "marrakech-rail-station",
        to: "jemaa-el-fnaa",
      },
      {
        label: L(
          "Jemaa el-Fnaa → Majorelle Garden",
          "Jemaa el-Fna → Jardin Majorelle",
          "جامع الفنا ← حديقة ماجوريل",
        ),
        from: "jemaa-el-fnaa",
        to: "majorelle",
      },
    ],
    hasOfflinePack: true,
    imageSlot: "city-marrakech",
  },
  {
    slug: "casablanca",
    cityId: "casablanca",
    regionId: "MA-06",
    name: L("Casablanca", "Casablanca", "الدار البيضاء"),
    tagline: L(
      "Morocco's front door, best crossed by rail",
      "La porte d'entrée du Maroc, à franchir en train",
      "بوابة المغرب الأمامية، وأفضل عبور لها بالقطار",
    ),
    intro: L(
      "Most journeys start at Mohammed V Airport and immediately face the country's biggest taxi markup. The Al Bidaoui train underneath Terminal 1 is the calm answer, and the tram network is the strongest official urban layer in Morocco once you're in town.",
      "La plupart des voyages commencent à l'aéroport Mohammed V — face au plus gros surcoût taxi du pays. Le train Al Bidaoui sous le Terminal 1 est la réponse sereine, et le tramway est la couche urbaine officielle la plus solide du Maroc une fois en ville.",
      "تبدأ معظم الرحلات من مطار محمد الخامس لتواجه فورًا أعلى مغالاة في أسعار سيارات الأجرة بالبلاد. قطار البيضاوي أسفل المحطة 1 هو الجواب الهادئ، والترامواي أقوى شبكة نقل حضري رسمية في المغرب بعد وصولك إلى المدينة.",
    ),
    movePresets: [
      {
        label: L(
          "Airport → Casa-Voyageurs station",
          "Aéroport → gare Casa-Voyageurs",
          "المطار ← محطة الدار البيضاء المسافرين",
        ),
        from: "cmn-airport",
        to: "casa-voyageurs-station",
      },
      {
        label: L(
          "Casa-Voyageurs → Hassan II Mosque",
          "Casa-Voyageurs → mosquée Hassan II",
          "محطة المسافرين ← مسجد الحسن الثاني",
        ),
        from: "casa-voyageurs-station",
        to: "hassan-ii-mosque",
      },
      {
        label: L(
          "Casa-Port → Ain Diab corniche",
          "Casa-Port → corniche d'Aïn Diab",
          "محطة الميناء ← كورنيش عين الذياب",
        ),
        from: "casa-port-station",
        to: "ain-diab",
      },
    ],
    hasOfflinePack: true,
    imageSlot: "city-casablanca",
  },
  {
    slug: "rabat",
    cityId: "rabat",
    regionId: "MA-04",
    name: L("Rabat & Salé", "Rabat et Salé", "الرباط وسلا"),
    tagline: L(
      "The capital that transit actually works in",
      "La capitale où les transports fonctionnent vraiment",
      "العاصمة التي يعمل فيها النقل العمومي فعلًا",
    ),
    intro: L(
      "Rabat is Morocco's easiest big city: a calm, gridded medina, blue taxis that run their meters, and a tram that crosses the river to Salé. It's the right place to learn the country's rhythms before harder medinas.",
      "Rabat est la grande ville la plus simple du Maroc : une médina calme et quadrillée, des taxis bleus qui mettent le compteur, et un tram qui traverse le fleuve vers Salé. L'endroit idéal pour prendre le rythme du pays avant des médinas plus exigeantes.",
      "الرباط أسهل مدن المغرب الكبيرة: مدينة عتيقة هادئة ومنظمة، وسيارات أجرة زرقاء تشغّل العداد، وترامواي يعبر النهر إلى سلا. إنها المكان المناسب لتتعلم إيقاع البلاد قبل المدن العتيقة الأصعب.",
    ),
    movePresets: [
      {
        label: L(
          "Rabat-Ville station → the medina",
          "Gare Rabat-Ville → la médina",
          "محطة الرباط المدينة ← المدينة العتيقة",
        ),
        from: "rabat-ville-station",
        to: "rabat-medina",
      },
      {
        label: L(
          "Medina → Kasbah of the Udayas",
          "Médina → kasbah des Oudayas",
          "المدينة العتيقة ← قصبة الأوداية",
        ),
        from: "rabat-medina",
        to: "kasbah-oudayas",
      },
      {
        label: L(
          "Rabat-Ville → Salé medina (by tram)",
          "Rabat-Ville → médina de Salé (en tram)",
          "الرباط المدينة ← سلا العتيقة (بالترامواي)",
        ),
        from: "rabat-ville-station",
        to: "sale-medina",
      },
    ],
    hasOfflinePack: true,
    imageSlot: "city-rabat",
  },
];

export function getCityGuide(slug: string): CityGuide | undefined {
  return CITY_GUIDES.find((c) => c.slug === slug);
}
