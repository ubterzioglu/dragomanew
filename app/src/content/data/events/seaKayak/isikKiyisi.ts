import type { DragomanEvent } from '../../../schema'

/** The new site's 4-day programme replaces the old 5-day "Işık Kıyısı" text (owner decision). */
export const isikKiyisi: DragomanEvent = {
  id: "isik-kiyisi",
  category: "seaKayak",
  subgroup: "kano-cok-gunlu",
  order: 2,
  slug: { tr: "isik-kiyisi", en: "coast-of-light", fr: "cote-de-lumiere", de: "kueste-des-lichts" },
  title: {
    tr: "Işık Kıyısı — Kano & Kamp Turu (4 Gün)",
    en: "Coast of Light — Kayak & Camping Tour (4 Days)",
    fr: "Côte de Lumière — Kayak et camping (4 jours)",
    de: "Küste des Lichts — Kajak- und Campingtour (4 Tage)",
  },
  summary: {
    tr: "Antik Likya boyunca kayak ve şnorkel macerası.",
    en: "A kayaking and snorkelling adventure along ancient Lycia.",
    fr: "Une aventure en kayak et en snorkeling le long de l'antique Lycie.",
    de: "Ein Kajak- und Schnorchelabenteuer entlang des antiken Lykien.",
  },
  body: {
    tr: [
      { type: "p", text: "Likya kıyısı boyunca bir deniz kayağı yolculuğu: Kaş'tan Myra'nın tarihi limanı Andriake'ye kürek çekerek iki batık şehri, Akdeniz manzaralarını ve saklı koyları keşfedin. Üzümlü ve Aperlai'de kamp geceleri, Simena'da otel konaklaması." },
      { type: "h2", text: "Öne çıkanlar" },
      { type: "ul", items: ["İki batık şehir: Kekova ve Aperlai", "Sahil ve kamp konaklaması", "Likya Yolu manzaraları", "Batık limanlar üzerinde şnorkel", "Kale köyü Simena"] },
    ],
    en: [
      { type: "p", text: "A sea kayaking journey along the Lycian coast: paddle from Kaş to Andriake, the historic harbour of Myra, discovering two sunken cities, Mediterranean views and hidden coves. Camping nights in Üzümlü and Aperlai, a hotel night in Simena." },
      { type: "h2", text: "Highlights" },
      { type: "ul", items: ["Two sunken cities: Kekova and Aperlai", "Beach and camp accommodation", "Views of the Lycian Way", "Snorkelling over sunken harbours", "Simena, the castle village"] },
    ],
    fr: [
      { type: "p", text: "Un voyage en kayak de mer le long de la côte lycienne : de Kaş jusqu'à Andriake, le port historique de Myra, en découvrant deux cités englouties, des panoramas méditerranéens et des criques cachées. Nuits en camping à Üzümlü et Aperlai, nuit à l'hôtel à Simena." },
      { type: "h2", text: "Points forts" },
      { type: "ul", items: ["Deux cités englouties : Kekova et Aperlai", "Nuits en bord de mer et en camping", "Vues sur le chemin lycien", "Snorkeling au-dessus de ports engloutis", "Simena, le village du château"] },
    ],
    de: [
      { type: "p", text: "Eine Seekajakreise entlang der lykischen Küste: von Kaş bis Andriake, dem historischen Hafen von Myra, vorbei an zwei versunkenen Städten, Mittelmeerpanoramen und versteckten Buchten. Zeltnächte in Üzümlü und Aperlai, eine Hotelnacht in Simena." },
      { type: "h2", text: "Höhepunkte" },
      { type: "ul", items: ["Zwei versunkene Städte: Kekova und Aperlai", "Übernachtung am Strand und im Camp", "Ausblicke auf den Lykischen Weg", "Schnorcheln über versunkenen Häfen", "Simena, das Burgdorf"] },
    ],
  },
  duration: { tr: "4 gün / 3 gece", en: "4 days / 3 nights", fr: "4 jours / 3 nuits", de: "4 Tage / 3 Nächte" },
  priceDisplay: "on_request",
  options: [],
  cover: "kayak-light-coast-1",
  gallery: ["kayak-light-coast-2"],
  faq: [
    {
      question: { tr: "Geceleri nerede kalıyoruz?", en: "Where do we sleep?", fr: "Où dort-on ?", de: "Wo übernachten wir?" },
      answer: {
        tr: "İlk iki gece Üzümlü'de ve Aperlai'de kampta, üçüncü gece kale köyü Simena'da otelde.",
        en: "The first two nights are spent camping in Üzümlü and Aperlai, the third night in a hotel in Simena, the castle village.",
        fr: "Les deux premières nuits en camping à Üzümlü et Aperlai, la troisième à l'hôtel à Simena, le village du château.",
        de: "Die ersten beiden Nächte im Camp in Üzümlü und Aperlai, die dritte Nacht im Hotel im Burgdorf Simena.",
      },
    },
    {
      question: { tr: "Tur nerede başlayıp bitiyor?", en: "Where does the tour start and end?", fr: "Où commence et se termine le circuit ?", de: "Wo beginnt und endet die Tour?" },
      answer: {
        tr: "Kaş'ta Büyükçakıl'dan başlar ve Myra'nın antik limanı Andriake'de biter.",
        en: "It starts from Büyükçakıl in Kaş and ends at Andriake, the ancient harbour of Myra.",
        fr: "Il part de Büyükçakıl à Kaş et se termine à Andriake, le port antique de Myra.",
        de: "Sie beginnt in Büyükçakıl in Kaş und endet in Andriake, dem antiken Hafen von Myra.",
      },
    },
  ],
  itinerary: [
    {
      title: { tr: "Gün 1 — Kaş'tan Üzümlü'ye", en: "Day 1 — Kaş to Üzümlü", fr: "Jour 1 — De Kaş à Üzümlü", de: "Tag 1 — Von Kaş nach Üzümlü" },
      description: {
        tr: "Kaş'ta buluşun ve tura Büyükçakıl'dan başlayıp Üzümlü'ye kürek çekin; kamp burada. Kamp alanında öğle ve akşam yemeği, ertesi sabah kahvaltı.",
        en: "Meet in Kaş, start the tour at Büyükçakıl and paddle to Üzümlü, where we camp. Lunch and dinner at the campsite, breakfast the next morning.",
        fr: "Rendez-vous à Kaş, départ de Büyükçakıl et pagayage jusqu'à Üzümlü, où l'on campe. Déjeuner et dîner au camp, petit-déjeuner le lendemain matin.",
        de: "Treffen in Kaş, Start in Büyükçakıl und Paddeln nach Üzümlü, wo wir zelten. Mittag- und Abendessen im Camp, Frühstück am nächsten Morgen.",
      },
    },
    {
      title: { tr: "Gün 2 — Üzümlü'den Aperlai'ye", en: "Day 2 — Üzümlü to Aperlai", fr: "Jour 2 — D'Üzümlü à Aperlai", de: "Tag 2 — Von Üzümlü nach Aperlai" },
      description: {
        tr: "Üzümlü'den antik Aperlai kentine kürek çekin. Aperlai'de kamp; öğle, akşam yemeği ve kahvaltı.",
        en: "Paddle from Üzümlü to the ancient city of Aperlai. Camp at Aperlai; lunch, dinner and breakfast.",
        fr: "Pagayage d'Üzümlü jusqu'à la cité antique d'Aperlai. Camp à Aperlai ; déjeuner, dîner et petit-déjeuner.",
        de: "Paddeln von Üzümlü zur antiken Stadt Aperlai. Camp in Aperlai; Mittagessen, Abendessen und Frühstück.",
      },
    },
    {
      title: { tr: "Gün 3 — Aperlai'den Simena'ya", en: "Day 3 — Aperlai to Simena", fr: "Jour 3 — D'Aperlai à Simena", de: "Tag 3 — Von Aperlai nach Simena" },
      description: {
        tr: "Yol üzerinde bir balıkçı evinde öğle yemeği molasıyla Simena'ya devam edin. Kale köyü Simena'da akşam yemeği ve konaklama.",
        en: "Continue to Simena with a lunch stop at a fisherman's house on the way. Dinner and overnight in Simena, the castle village.",
        fr: "Poursuite vers Simena avec une pause déjeuner chez un pêcheur en chemin. Dîner et nuit à Simena, le village du château.",
        de: "Weiter nach Simena mit Mittagspause in einem Fischerhaus unterwegs. Abendessen und Übernachtung im Burgdorf Simena.",
      },
    },
    {
      title: { tr: "Gün 4 — Batık Şehir ve doğu rotasıyla Andriake", en: "Day 4 — The Sunken City and the eastern route to Andriake", fr: "Jour 4 — La cité engloutie et la route est jusqu'à Andriake", de: "Tag 4 — Versunkene Stadt und Ostroute nach Andriake" },
      description: {
        tr: "Kahvaltıdan sonra Batık Şehir üzerinde kürek çekin, piknik öğle yemeğinin tadını çıkarın, ardından doğu rotasını izleyerek Andriake'de tamamlayın.",
        en: "After breakfast, paddle over the Sunken City, enjoy a picnic lunch, then follow the eastern route to finish at Andriake.",
        fr: "Après le petit-déjeuner, pagayage au-dessus de la cité engloutie, déjeuner pique-nique, puis la route est jusqu'à l'arrivée à Andriake.",
        de: "Nach dem Frühstück über die versunkene Stadt paddeln, Picknick genießen und dann der Ostroute bis nach Andriake folgen.",
      },
    },
  ],
  healthForm: null,
  featured: false,
  status: "published",
  origin: "kayak-site",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/turlar/coast-of-light/", "https://dragoman-turkey.com/tr/deniz-kanosu/"],
}
