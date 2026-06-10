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
 * Casablanca — Morocco's strongest official urban-mobility layer
 * (Casatramway) and the main international gateway (CMN). Tram stop lists
 * are curated subsets of well-known interchange stops, transcribed from
 * official network maps; the airport rail link is flagged estimated because
 * its off-peak frequency genuinely varies.
 */

export const places: Place[] = [
  {
    id: "cmn-airport",
    kind: "airport",
    name: L(
      "Casablanca Mohammed V Airport",
      "Aéroport Mohammed V de Casablanca",
      "مطار محمد الخامس الدار البيضاء",
    ),
    city: "casablanca",
    point: { lat: 33.3675, lon: -7.5898 },
    inMedina: false,
    aliases: ["CMN", "Mohammed V"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "casa-voyageurs-station",
    kind: "rail-station",
    name: L("Casa-Voyageurs Station", "Gare Casa-Voyageurs", "محطة الدار البيضاء المسافرين"),
    city: "casablanca",
    point: { lat: 33.5979, lon: -7.6191 },
    inMedina: false,
    aliases: ["Casa Voyageurs", "gare"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "casa-port-station",
    kind: "rail-station",
    name: L("Casa-Port Station", "Gare Casa-Port", "محطة الدار البيضاء الميناء"),
    city: "casablanca",
    point: { lat: 33.6065, lon: -7.628 },
    inMedina: false,
    aliases: ["Casa Port"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "hassan-ii-mosque",
    kind: "landmark",
    name: L("Hassan II Mosque", "Mosquée Hassan II", "مسجد الحسن الثاني"),
    city: "casablanca",
    point: { lat: 33.6083, lon: -7.6325 },
    inMedina: false,
    aliases: [],
    provenance: osm("2026-05-15"),
  },
  {
    id: "casa-old-medina",
    kind: "accommodation-area",
    name: L("Old Medina", "Ancienne Médina", "المدينة القديمة"),
    city: "casablanca",
    point: { lat: 33.6022, lon: -7.6184 },
    inMedina: true,
    aliases: ["ancienne medina"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "place-mohammed-v-casa",
    kind: "square",
    name: L("Place Mohammed V", "Place Mohammed V", "ساحة محمد الخامس"),
    city: "casablanca",
    point: { lat: 33.5928, lon: -7.6192 },
    inMedina: false,
    aliases: ["pigeon square"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "habous",
    kind: "neighborhood",
    name: L("Habous Quarter", "Quartier des Habous", "حي الأحباس"),
    city: "casablanca",
    point: { lat: 33.5806, lon: -7.6103 },
    inMedina: false,
    aliases: ["new medina"],
    provenance: osm("2026-05-15"),
  },
  {
    id: "ain-diab",
    kind: "neighborhood",
    name: L("Ain Diab Corniche", "Corniche d'Aïn Diab", "كورنيش عين الذياب"),
    city: "casablanca",
    point: { lat: 33.594, lon: -7.668 },
    inMedina: false,
    aliases: ["corniche", "beach"],
    provenance: osm("2026-05-15"),
  },
];

export const pins: VerifiedPin[] = [
  {
    id: "pin-cmn-train-access",
    placeId: "cmn-airport",
    name: L(
      "Airport train platform — below Terminal 1",
      "Quai du train — sous le Terminal 1",
      "رصيف القطار — أسفل المحطة 1",
    ),
    point: { lat: 33.3678, lon: -7.5891 },
    kind: "entrance",
    tier: "cached-verified",
    walkingNote: L(
      "From arrivals, follow the train pictograms down one level past the car-rental desks. Buy at the counter or machine before the escalator.",
      "Depuis les arrivées, suivez les pictogrammes « train » un niveau plus bas, après les comptoirs de location. Achetez au guichet ou à la borne avant l'escalator.",
      "من قاعة الوصول، اتبع علامات القطار نزولًا طابقًا واحدًا بعد مكاتب تأجير السيارات. اشترِ التذكرة من الشباك أو الآلة قبل السلم الكهربائي.",
    ),
    provenance: editorial("2026-04-18"),
  },
];

export const stops: Stop[] = [
  {
    id: "stop-cmn-airport-rail",
    placeId: "cmn-airport",
    name: L("Aéroport Med V (rail)", "Aéroport Med V (train)", "مطار محمد الخامس (قطار)"),
    city: "casablanca",
    point: { lat: 33.3678, lon: -7.5891 },
  },
  {
    id: "tram-casa-voyageurs",
    placeId: "casa-voyageurs-station",
    name: L("Gare Casa-Voyageurs (tram)", "Gare Casa-Voyageurs (tram)", "محطة المسافرين (ترام)"),
    city: "casablanca",
    point: { lat: 33.5982, lon: -7.6185 },
  },
  {
    id: "tram-place-mohammed-v",
    placeId: "place-mohammed-v-casa",
    name: L("Place Mohammed V (tram)", "Place Mohammed V (tram)", "ساحة محمد الخامس (ترام)"),
    city: "casablanca",
    point: { lat: 33.5926, lon: -7.6189 },
  },
  {
    id: "tram-sidi-moumen",
    name: L("Sidi Moumen (tram)", "Sidi Moumen (tram)", "سيدي مومن (ترام)"),
    city: "casablanca",
    point: { lat: 33.586, lon: -7.527 },
  },
  {
    id: "tram-lissasfa",
    name: L("Lissasfa (tram)", "Lissasfa (tram)", "ليساسفة (ترام)"),
    city: "casablanca",
    point: { lat: 33.538, lon: -7.658 },
  },
  {
    id: "tram-nations-unies",
    name: L("Place des Nations Unies (tram)", "Place des Nations Unies (tram)", "ساحة الأمم المتحدة (ترام)"),
    city: "casablanca",
    point: { lat: 33.5952, lon: -7.6189 },
  },
  {
    id: "tram-sidi-bernoussi",
    name: L("Sidi Bernoussi (tram)", "Sidi Bernoussi (tram)", "سيدي البرنوصي (ترام)"),
    city: "casablanca",
    point: { lat: 33.601, lon: -7.507 },
  },
  {
    id: "tram-ain-diab",
    placeId: "ain-diab",
    name: L("Ain Diab Plage (tram)", "Aïn Diab Plage (tram)", "شاطئ عين الذياب (ترام)"),
    city: "casablanca",
    point: { lat: 33.5945, lon: -7.6665 },
  },
];

export const lines: Line[] = [
  {
    id: "oncf-al-bidaoui-cmn",
    mode: "train",
    name: L(
      "Al Bidaoui airport train",
      "Train Al Bidaoui (aéroport)",
      "قطار البيضاوي (المطار)",
    ),
    operator: "ONCF",
    stopIds: ["stop-cmn-airport-rail", "CASA_VOYAGEURS", "CASA_PORT"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "06:00",
      lastDeparture: "22:00",
      headwayMinutes: 60,
      minutesBetweenStops: 23,
    },
    fare: { currency: "MAD", min: 40, max: 50, per: "person" },
    paymentModes: ["card", "counter"],
    tier: "estimated-flagged",
    deepLink: { labelKey: "deepLinks.bookOncf", url: "https://www.oncf-voyages.ma" },
    provenance: editorial("2026-04-18"),
  },
  {
    id: "casa-tram-t1",
    mode: "tram",
    name: L("Casa Tram T1", "Casa Tram T1", "ترامواي الدار البيضاء T1"),
    operator: "Casatramway (RATP Dev)",
    stopIds: [
      "tram-sidi-moumen",
      "tram-casa-voyageurs",
      "tram-place-mohammed-v",
      "tram-lissasfa",
    ],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "05:30",
      lastDeparture: "22:30",
      headwayMinutes: 8,
      minutesBetweenStops: 12,
    },
    fare: { currency: "MAD", min: 8, max: 8, per: "person" },
    paymentModes: ["cash", "card"],
    tier: "cached-verified",
    provenance: transcribed(
      "2026-05-10",
      "Casatramway official network map & fares",
      "https://www.casatramway.ma",
    ),
  },
  {
    id: "casa-tram-t2",
    mode: "tram",
    name: L("Casa Tram T2", "Casa Tram T2", "ترامواي الدار البيضاء T2"),
    operator: "Casatramway (RATP Dev)",
    stopIds: ["tram-sidi-bernoussi", "tram-nations-unies", "tram-ain-diab"],
    service: {
      kind: "headway",
      days: DAILY,
      firstDeparture: "05:30",
      lastDeparture: "22:30",
      headwayMinutes: 9,
      minutesBetweenStops: 16,
    },
    fare: { currency: "MAD", min: 8, max: 8, per: "person" },
    paymentModes: ["cash", "card"],
    tier: "cached-verified",
    provenance: transcribed(
      "2026-05-10",
      "Casatramway official network map & fares",
      "https://www.casatramway.ma",
    ),
  },
];

export const taxiRules: TaxiRule[] = [
  {
    id: "casablanca-petit-taxi",
    city: "casablanca",
    kind: "petit-taxi",
    bands: [
      { maxKm: 3, fare: { currency: "MAD", min: 15, max: 30, per: "vehicle" } },
      { maxKm: 10, fare: { currency: "MAD", min: 30, max: 70, per: "vehicle" } },
      { maxKm: 20, fare: { currency: "MAD", min: 60, max: 120, per: "vehicle" } },
    ],
    nightMultiplier: 1.5,
    paymentModes: ["cash-small-bills"],
    pickupPinIds: [],
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "casablanca-grand-taxi-cmn",
    city: "casablanca",
    kind: "grand-taxi",
    bands: [
      { maxKm: 45, fare: { currency: "MAD", min: 250, max: 400, per: "vehicle" } },
    ],
    nightMultiplier: 1.2,
    paymentModes: ["cash"],
    pickupPinIds: [],
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];

export const advisories: AdvisoryNote[] = [
  {
    id: "adv-cmn-train-best",
    severity: "info",
    appliesTo: { modes: ["train"], placeIds: ["cmn-airport"] },
    title: L(
      "The airport train beats the taxi queue",
      "Le train de l'aéroport bat la file des taxis",
      "قطار المطار أفضل من طابور سيارات الأجرة",
    ),
    body: L(
      "Al Bidaoui runs from below Terminal 1 to Casa-Voyageurs and Casa-Port (~45 min). Roughly hourly — check the departure board as frequencies shift off-peak.",
      "L'Al Bidaoui relie le sous-sol du Terminal 1 à Casa-Voyageurs et Casa-Port (~45 min). Environ un par heure — vérifiez le tableau des départs, la fréquence varie en heures creuses.",
      "يربط قطار البيضاوي الطابق السفلي للمحطة 1 بمحطتي المسافرين والميناء (~45 دقيقة). تقريبًا كل ساعة — راجع لوحة المغادرات لأن الوتيرة تتغير خارج الذروة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-cmn-taxi-fixed",
    severity: "warning",
    appliesTo: { modes: ["grand-taxi", "petit-taxi"], placeIds: ["cmn-airport"] },
    title: L(
      "Airport taxis charge a fixed-ish rate",
      "Les taxis de l'aéroport pratiquent un tarif quasi fixe",
      "سيارات أجرة المطار بتسعيرة شبه ثابتة",
    ),
    body: L(
      "White grand taxis to the city center run 250–400 MAD depending on hour and bargaining. Agree before loading luggage; small bills help. The train is far cheaper if your timing matches.",
      "Les grands taxis blancs vers le centre coûtent 250–400 MAD selon l'heure et la négociation. Convenez du prix avant de charger les bagages ; gardez des petites coupures. Le train est bien moins cher si l'horaire vous convient.",
      "تتراوح أجرة سيارات الأجرة الكبيرة البيضاء إلى وسط المدينة بين 250 و400 درهم حسب الساعة والمفاوضة. اتفق على السعر قبل تحميل الأمتعة؛ والأوراق النقدية الصغيرة مفيدة. القطار أرخص بكثير إذا ناسبك توقيته.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-casa-tram-card",
    severity: "info",
    appliesTo: { modes: ["tram"], cities: ["casablanca"] },
    title: L("Buy the rechargeable tram card", "Achetez la carte rechargeable", "اشترِ البطاقة القابلة للشحن"),
    body: L(
      "Tickets are 8 MAD on a rechargeable card from platform kiosks. Validate on the platform before boarding — inspections are frequent.",
      "Le trajet coûte 8 MAD sur carte rechargeable, vendue aux kiosques des stations. Validez sur le quai avant de monter — les contrôles sont fréquents.",
      "ثمن الرحلة 8 دراهم ببطاقة قابلة للشحن تُباع في أكشاك المحطات. فعِّل البطاقة على الرصيف قبل الصعود — فالمراقبة متكررة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
  {
    id: "adv-casa-petit-meter",
    severity: "caution",
    appliesTo: { modes: ["petit-taxi"], cities: ["casablanca"] },
    title: L("Red taxis should use the meter", "Les taxis rouges doivent utiliser le compteur", "سيارات الأجرة الحمراء يجب أن تستعمل العداد"),
    body: L(
      "Casablanca's red petit taxis generally run meters — a polite « compteur, s'il vous plaît » works. If refused at a station rank, walk one street over and hail a passing one.",
      "Les petits taxis rouges utilisent généralement le compteur — un poli « compteur, s'il vous plaît » suffit. En cas de refus à une station, éloignez-vous d'une rue et hélez-en un en circulation.",
      "تستعمل سيارات الأجرة الصغيرة الحمراء العداد عادةً — تكفي عبارة مهذبة «العداد من فضلك». إذا رُفض طلبك عند الموقف، ابتعد شارعًا واحدًا وأوقف سيارة مارة.",
    ),
    tier: "cached-verified",
    provenance: editorial("2026-04-18"),
  },
];
