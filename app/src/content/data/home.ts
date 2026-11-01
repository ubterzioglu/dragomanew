import type { HomeContent } from '../schema'

export const homeContent: HomeContent = {
  hero: {
    heading: {
      tr: "Kaş ve Kekova'da dalış, deniz kanosu ve doğa",
      en: "Diving, sea kayaking and outdoors in Kaş and Kekova",
      fr: "Plongée, kayak de mer et plein air à Kaş et Kekova",
      de: "Tauchen, Seekajak und Outdoor in Kaş und Kekova",
    },
    subheading: {
      tr: "2002'den beri Kaş'ta: Likya kıyısında denizin altında ve üstünde, küçük gruplarla.",
      en: "In Kaş since 2002: under and on the sea along the Lycian coast, in small groups.",
      fr: "À Kaş depuis 2002 : sous la mer et sur l'eau le long de la côte lycienne, en petits groupes.",
      de: "Seit 2002 in Kaş: unter und auf dem Meer an der lykischen Küste, in kleinen Gruppen.",
    },
    tiles: [
      {
        category: "diving",
        media: "hero-diving",
        tagline: { tr: "30'u aşkın dalış noktası", en: "More than 30 dive sites", fr: "Plus de 30 sites de plongée", de: "Mehr als 30 Tauchplätze" },
      },
      {
        category: "seaKayak",
        media: "hero-sea-kayak",
        tagline: { tr: "Batık şehir üzerinde kürek", en: "Paddle over the sunken city", fr: "Pagayer au-dessus de la cité engloutie", de: "Paddeln über der versunkenen Stadt" },
      },
      {
        category: "outdoor",
        media: "hero-outdoor",
        tagline: { tr: "Yürüyüş, bisiklet, coasteering", en: "Hiking, cycling, coasteering", fr: "Randonnée, vélo, coasteering", de: "Wandern, Radfahren, Coasteering" },
      },
    ],
  },
  quickLinks: [
    {
      page: "transport",
      media: "kas-town-view-1",
      text: { tr: "Havalimanı transferleri ve konaklama", en: "Airport transfers and accommodation", fr: "Transferts aéroport et hébergement", de: "Flughafentransfers und Unterkunft" },
    },
    {
      page: "shop",
      media: "book-tropical-spread-1",
      text: { tr: "Kaş sualtı kitaplarımız", en: "Our books on underwater Kaş", fr: "Nos livres sur le Kaş sous-marin", de: "Unsere Bücher über das Unterwasser-Kaş" },
    },
  ],
  featured: [
    { kind: "event", id: "kekova-klasik" },
    { kind: "event", id: "deneme-dalisi" },
    { kind: "event", id: "kiyi-tirmanisi" },
    { kind: "event", id: "likya-kayak-konfor" },
    { kind: "post", id: "raja-ampat-2027" },
  ],
  why: [
    {
      title: { tr: "25 yılı aşan yerel deneyim", en: "More than 25 years of local experience", fr: "Plus de 25 ans d'expérience locale", de: "Mehr als 25 Jahre Erfahrung vor Ort" },
      text: {
        tr: "Kaş ve Kekova'nın denizini, kıyılarını, hava koşullarını ve rotalarını yakından tanıyan bir ekip.",
        en: "A team that knows the sea, coastline, weather and routes of Kaş and Kekova closely.",
        fr: "Une équipe qui connaît de près la mer, la côte, la météo et les itinéraires de Kaş et Kekova.",
        de: "Ein Team, das Meer, Küste, Wetter und Routen von Kaş und Kekova genau kennt.",
      },
    },
    {
      title: { tr: "Önce güvenlik", en: "Safety first", fr: "La sécurité d'abord", de: "Sicherheit zuerst" },
      text: {
        tr: "Rota, hava ve deniz koşulları her etkinlik öncesinde değerlendirilir; ekipman ve uygulamalar standartlara uygun hazırlanır.",
        en: "Route, weather and sea conditions are assessed before every activity; equipment and procedures follow set standards.",
        fr: "L'itinéraire, la météo et l'état de la mer sont évalués avant chaque activité ; équipement et pratiques suivent des standards établis.",
        de: "Route, Wetter und Seegang werden vor jeder Aktivität geprüft; Ausrüstung und Abläufe folgen festen Standards.",
      },
    },
    {
      title: { tr: "Uzun soluklu uzman ekip", en: "A long-standing expert team", fr: "Une équipe d'experts fidèle", de: "Ein langjähriges Expertenteam" },
      text: {
        tr: "Eğitmenlerimiz ve rehberlerimiz uzun yıllardır bu sularda ve patikalarda çalışıyor.",
        en: "Our instructors and guides have worked in these waters and on these trails for many years.",
        fr: "Nos moniteurs et guides travaillent depuis de nombreuses années sur ces eaux et ces sentiers.",
        de: "Unsere Tauchlehrer und Guides sind seit vielen Jahren in diesen Gewässern und auf diesen Pfaden unterwegs.",
      },
    },
    {
      title: { tr: "Doğaya saygı", en: "Respect for nature", fr: "Le respect de la nature", de: "Respekt vor der Natur" },
      text: {
        tr: "Küçük gruplar ve doğaya saygılı yolculuklarla Kaş-Kekova Özel Deniz Koruma Alanı'nı koruyarak keşfediyoruz.",
        en: "Small groups and nature-friendly trips let us explore the Kaş-Kekova Marine Protected Area while protecting it.",
        fr: "Petits groupes et voyages respectueux de la nature : nous explorons l'Aire Marine Protégée de Kaş-Kekova tout en la préservant.",
        de: "Mit kleinen Gruppen und naturverträglichen Touren erkunden wir das Meeresschutzgebiet Kaş-Kekova und schützen es zugleich.",
      },
    },
  ],
  origin: "mockup",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/", "https://dragoman-turkey.com/tr/dragoman/", "https://dragoman-turkey.com/tr/diving/"],
}
