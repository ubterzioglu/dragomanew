import type { DragomanEvent } from '../../../schema'

/** "Kekova Zevki" / "Kekova Sound" on the old site: the same tour, one record. */
export const kekovaKorfezi: DragomanEvent = {
  id: "kekova-korfezi",
  category: "seaKayak",
  subgroup: "kano-cok-gunlu",
  order: 1,
  slug: { tr: "kekova-korfezi", en: "kekova-sound-2-days", fr: "baie-de-kekova-2-jours", de: "kekova-bucht-2-tage" },
  title: { tr: "Kekova Körfezi — 2 Gün", en: "Kekova Sound — 2 Days", fr: "Baie de Kekova — 2 jours", de: "Kekova-Bucht — 2 Tage" },
  summary: {
    tr: "Büyüleyici Simena köyünde konaklamalı, Kekova ve Aperlai boyunca iki günlük kayak yolculuğu.",
    en: "A two-day kayak journey through Kekova and Aperlai, with a night in the charming village of Simena.",
    fr: "Deux jours de kayak à travers Kekova et Aperlai, avec une nuit dans le charmant village de Simena.",
    de: "Eine zweitägige Kajakreise durch Kekova und Aperlai mit einer Übernachtung im reizvollen Dorf Simena.",
  },
  body: {
    tr: [
      { type: "p", text: "Kekova ve Aperlai bölgelerinde iki günlük bir deniz kayağı yolculuğu. Batık kalıntılar üzerinde kürek çekin, berrak sularda şnorkel yapın, hava uygunsa kayakla yelken açın ve yaban hayatını doğal ortamında gözlemleyin. Sahil köyünde bir gece konaklamalı bu tur orta-ileri seviye kürekçiler için tasarlandı." },
      { type: "h2", text: "Öne çıkanlar" },
      { type: "ul", items: ["Kekova Batık Şehri üzerinde kürek", "Tersane Koyu'nda yüzme ve şnorkel", "Aperlai antik kenti ve Likya Yolu", "Balıkçı evinde ev yemeği", "Andriake deresinde kaplumbağa gözlemi"] },
    ],
    en: [
      { type: "p", text: "A two-day sea kayaking journey through the Kekova and Aperlai areas. Paddle over sunken ruins, snorkel in clear water, sail your kayak if the weather allows and watch wildlife in its natural setting. With one night in a coastal village, this tour is designed for intermediate to advanced paddlers." },
      { type: "h2", text: "Highlights" },
      { type: "ul", items: ["Paddling over the Kekova Sunken City", "Swimming and snorkelling in Tersane Bay", "The ancient city of Aperlai and the Lycian Way", "Home cooking at a fisherman's house", "Turtle watching on the Andriake stream"] },
    ],
    fr: [
      { type: "p", text: "Deux jours de kayak de mer dans les secteurs de Kekova et d'Aperlai. Pagayez au-dessus de ruines englouties, faites du snorkeling dans une eau limpide, hissez la voile si la météo le permet et observez la faune dans son milieu. Avec une nuit dans un village côtier, ce circuit s'adresse aux pagayeurs de niveau intermédiaire à avancé." },
      { type: "h2", text: "Points forts" },
      { type: "ul", items: ["Pagayer au-dessus de la cité engloutie de Kekova", "Baignade et snorkeling dans la baie de Tersane", "La cité antique d'Aperlai et le chemin lycien", "Cuisine maison chez un pêcheur", "Observation des tortues sur le ruisseau d'Andriake"] },
    ],
    de: [
      { type: "p", text: "Eine zweitägige Seekajakreise durch die Gebiete Kekova und Aperlai. Paddeln Sie über versunkene Ruinen, schnorcheln Sie in klarem Wasser, setzen Sie bei passendem Wetter Segel und beobachten Sie Tiere in ihrem natürlichen Lebensraum. Mit einer Übernachtung in einem Küstendorf richtet sich diese Tour an fortgeschrittene Paddler." },
      { type: "h2", text: "Höhepunkte" },
      { type: "ul", items: ["Paddeln über der versunkenen Stadt Kekova", "Schwimmen und Schnorcheln in der Bucht Tersane", "Die antike Stadt Aperlai und der Lykische Weg", "Hausmannskost in einem Fischerhaus", "Schildkrötenbeobachtung am Bach von Andriake"] },
    ],
  },
  duration: { tr: "2 gün / 1 gece", en: "2 days / 1 night", fr: "2 jours / 1 nuit", de: "2 Tage / 1 Nacht" },
  priceDisplay: "on_request",
  options: [],
  cover: "kayak-kekova-bay-1",
  gallery: ["kayak-kekova-bay-2", "kayak-kekova-bay-3"],
  faq: [
    {
      question: { tr: "Gece nerede konaklıyoruz?", en: "Where do we stay overnight?", fr: "Où passe-t-on la nuit ?", de: "Wo übernachten wir?" },
      answer: {
        tr: "Simena (Kaleköy) köyünde bir otelde. Programda ilk akşam otelde akşam yemeği yer alır.",
        en: "At a hotel in the village of Simena (Kaleköy). Dinner at the hotel on the first evening is part of the programme.",
        fr: "Dans un hôtel du village de Simena (Kaleköy). Le dîner à l'hôtel le premier soir fait partie du programme.",
        de: "In einem Hotel im Dorf Simena (Kaleköy). Das Abendessen im Hotel am ersten Abend gehört zum Programm.",
      },
    },
    {
      question: { tr: "Bu tur hangi seviyeye uygun?", en: "What level is this tour for?", fr: "À quel niveau s'adresse ce circuit ?", de: "Für welches Niveau ist die Tour gedacht?" },
      answer: {
        tr: "Orta ve ileri seviye kürekçiler için tasarlanmıştır.",
        en: "It is designed for intermediate to advanced paddlers.",
        fr: "Il est conçu pour les pagayeurs de niveau intermédiaire à avancé.",
        de: "Sie ist für fortgeschrittene Paddler konzipiert.",
      },
    },
  ],
  itinerary: [
    {
      title: { tr: "Gün 1 — Kekova Batı", en: "Day 1 — Kekova West", fr: "Jour 1 — Kekova Ouest", de: "Tag 1 — Kekova West" },
      description: {
        tr: "07:30'da Kaş Kral Mezarı'nda buluşun, Üçağız'a transfer olun, ardından Simena'ya ve Kekova Batık Şehri üzerine kürek çekin. Tersane Koyu'nda yüzme molası, sonra Aperlai'de balıkçı evinde ev yemeği ve Likya Yolu'nda kısa yürüyüş. Otelde akşam yemeği ve konaklama.",
        en: "Meet at 07:30 at the King's Tomb in Kaş, transfer to Üçağız, then paddle to Simena and over the Kekova Sunken City. Swim break in Tersane Bay, then a home-cooked meal at a fisherman's house in Aperlai and a short hike on the Lycian Way. Dinner and overnight at the hotel.",
        fr: "Rendez-vous à 07h30 au Tombeau du Roi à Kaş, transfert à Üçağız, puis pagayage vers Simena et au-dessus de la cité engloutie de Kekova. Pause baignade dans la baie de Tersane, repas fait maison chez un pêcheur à Aperlai et courte randonnée sur le chemin lycien. Dîner et nuit à l'hôtel.",
        de: "Treffpunkt um 07:30 am Königsgrab in Kaş, Transfer nach Üçağız, dann Paddeln nach Simena und über die versunkene Stadt Kekova. Badepause in der Bucht Tersane, danach Hausmannskost in einem Fischerhaus in Aperlai und eine kurze Wanderung auf dem Lykischen Weg. Abendessen und Übernachtung im Hotel.",
      },
    },
    {
      title: { tr: "Gün 2 — Kekova Doğu", en: "Day 2 — Kekova East", fr: "Jour 2 — Kekova Est", de: "Tag 2 — Kekova Ost" },
      description: {
        tr: "Kahvaltıdan sonra doğrudan Batık Şehir üzerinde kürek çekin, saklı koylarda yüzüp şnorkel yapın ve piknik öğle yemeğinin tadını çıkarın. Bir zamanlar fokların yaşadığı deniz mağarasının yanından geçin, Andriake deresini izleyerek deniz kaplumbağalarını görün ve yakındaki kamp alanında duş almadan önce son bir yüzmeyle bitirin.",
        en: "After breakfast, paddle straight over the Sunken City, swim and snorkel in hidden bays and enjoy a picnic lunch. Pass the sea cave once home to monk seals, follow the Andriake stream to see sea turtles and finish with a last swim before a shower at a nearby campsite.",
        fr: "Après le petit-déjeuner, pagayez directement au-dessus de la cité engloutie, baignez-vous et faites du snorkeling dans des baies cachées, puis pique-niquez. Passez devant la grotte marine autrefois habitée par les phoques moines, remontez le ruisseau d'Andriake pour voir les tortues marines et terminez par une dernière baignade avant une douche dans un camping voisin.",
        de: "Nach dem Frühstück direkt über die versunkene Stadt paddeln, in versteckten Buchten schwimmen und schnorcheln und ein Picknick genießen. Vorbei an der Meereshöhle, in der einst Mönchsrobben lebten, dem Bach von Andriake zu den Meeresschildkröten folgen und mit einem letzten Bad abschließen, bevor man auf einem nahen Campingplatz duschen kann.",
      },
    },
  ],
  healthForm: null,
  featured: false,
  status: "published",
  origin: "kayak-site",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/turlar/kekova-sound/", "https://dragoman-turkey.com/tr/deniz-kanosu/"],
}
