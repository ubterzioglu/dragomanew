import type { ServiceOffer } from '../schema'

const transportPages = ["https://dragoman-turkey.com/tr/ulasim-konaklama/", "https://dragoman-turkey.com/transportation-and-accomodation/", "https://dragoman-turkey.com/fr/transport-et-hebergement/"]

export const serviceOffers: ServiceOffer[] = [
  {
    id: "transfer-dalaman-kas",
    kind: "transfer",
    order: 1,
    title: { tr: "Dalaman Havalimanı\u00a0– Kaş transferi", en: "Dalaman Airport\u00a0– Kaş transfer", fr: "Transfert aéroport de Dalaman\u00a0– Kaş", de: "Transfer Flughafen Dalaman\u00a0– Kaş" },
    summary: {
      tr: "Dalaman – Göcek – Fethiye – Kalkan – Kaş, 155 km. Araç başına tek yön: otomobil (1–3 kişi) 105 €, minibüs (4–7 kişi) 115 €, midibüs (8–16 kişi) 185 €, otobüs (16–26 kişi) 330 €. Tüm araçlar klimalıdır.",
      en: "Dalaman – Göcek – Fethiye – Kalkan – Kaş, 155 km. Per vehicle, one way: car (1–3 people) €105, minibus (4–7 people) €115, midibus (8–16 people) €185, bus (17–26 people) €330. All vehicles have air conditioning.",
      fr: "Dalaman – Göcek – Fethiye – Kalkan – Kaş, 155 km. Par véhicule, aller simple : voiture (1–3 personnes) 105 €, minibus (4–7 personnes) 115 €, midibus (8–16 personnes) 185 €, bus (17–26 personnes) 330 €. Tous les véhicules sont climatisés.",
      de: "Dalaman – Göcek – Fethiye – Kalkan – Kaş, 155 km. Pro Fahrzeug, einfache Fahrt: Pkw (1–3 Personen) 105 €, Minibus (4–7 Personen) 115 €, Midibus (8–16 Personen) 185 €, Bus (16–26 Personen) 330 €. Alle Fahrzeuge sind klimatisiert.",
    },
    cover: "transport-vehicle-placeholder",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: transportPages,
  },
  {
    id: "transfer-antalya-kas",
    kind: "transfer",
    order: 2,
    title: { tr: "Antalya Havalimanı\u00a0– Kaş transferi", en: "Antalya Airport\u00a0– Kaş transfer", fr: "Transfert aéroport d'Antalya\u00a0– Kaş", de: "Transfer Flughafen Antalya\u00a0– Kaş" },
    summary: {
      tr: "Antalya – Kemer – Tekirova – Kumluca – Finike – Demre – Kaş, 195 km. Araç başına tek yön: otomobil (1–3 kişi) 120 €, minibüs (4–7 kişi) 135 €, midibüs (8–16 kişi) 220 €, otobüs (17–26 kişi) 380 €. Tüm araçlar klimalıdır.",
      en: "Antalya – Kemer – Tekirova – Kumluca – Finike – Demre – Kaş, 195 km. Per vehicle, one way: car (1–3 people) €120, minibus (4–7 people) €135, midibus (8–16 people) €220, bus (17–26 people) €380. All vehicles have air conditioning.",
      fr: "Antalya – Kemer – Tekirova – Kumluca – Finike – Demre – Kaş, 195 km. Par véhicule, aller simple : voiture (1–3 personnes) 120 €, minibus (4–7 personnes) 135 €, midibus (8–16 personnes) 220 €, bus (17–26 personnes) 380 €. Tous les véhicules sont climatisés.",
      de: "Antalya – Kemer – Tekirova – Kumluca – Finike – Demre – Kaş, 195 km. Pro Fahrzeug, einfache Fahrt: Pkw (1–3 Personen) 120 €, Minibus (4–7 Personen) 135 €, Midibus (8–16 Personen) 220 €, Bus (17–26 Personen) 380 €. Alle Fahrzeuge sind klimatisiert.",
    },
    cover: "transport-vehicle-placeholder",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: transportPages,
  },
  {
    id: "konaklama-uc-yildizli-otel",
    kind: "lodging",
    order: 1,
    title: { tr: "3 yıldızlı otel, Küçükçakıl", en: "3-star hotel, Küçükçakıl", fr: "Hôtel 3 étoiles, Küçükçakıl", de: "3-Sterne-Hotel, Küçükçakıl" },
    summary: {
      tr: "Sahilde, özel plajlı ve havuzlu; şehir merkezine ve limana çok yakın. Balkonlu, deniz manzaralı 2 ve 3 yataklı klimalı odalar, açık büfe kahvaltı, teras, bar ve restoran. Yarım pansiyon ek ücreti 10 €/gün. Güncel fiyat ve müsaitlik için bize yazın.",
      en: "On the waterfront with a private beach and pool, very close to the town centre and the harbour. Sea-view rooms with balcony, 2 or 3 beds and air conditioning, open buffet breakfast, terrace, bar and restaurant. Half-board supplement €10/day. Please contact us for up-to-date prices and availability.",
      fr: "En bord de mer avec plage privée et piscine, tout près du centre-ville et du port. Chambres climatisées avec balcon vue mer, 2 ou 3 lits, petit-déjeuner buffet, terrasse, bar et restaurant. Supplément demi-pension : 10 €/jour. Contactez-nous pour les tarifs et disponibilités à jour.",
      de: "Direkt am Wasser mit eigenem Strand und Pool, ganz in der Nähe von Stadtzentrum und Hafen. Klimatisierte Zimmer mit Balkon und Meerblick, 2 oder 3 Betten, Frühstücksbuffet, Terrasse, Bar und Restaurant. Halbpensionszuschlag 10 €/Tag. Aktuelle Preise und Verfügbarkeit auf Anfrage.",
    },
    cover: "lodging-hotel-pool-1",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: transportPages,
  },
  {
    id: "konaklama-pansiyon-merkez",
    kind: "lodging",
    order: 2,
    title: { tr: "Pansiyon, Kaş merkez", en: "Guesthouse, Kaş centre", fr: "Pension, centre de Kaş", de: "Pension, Zentrum von Kaş" },
    summary: {
      tr: "Şehir merkezine ve dalış teknemize yürüme mesafesinde; tüm odaları özel banyolu, klimalı. Tek, çift ve aile odaları (aile odaları 3 kişiye kadar). Tek kişilik konaklamada oda fiyatından 5 € düşülür.",
      en: "Within walking distance of the town centre and our dive boat; all rooms have a private bathroom and air conditioning. Single, double and family rooms (family rooms for up to 3 people). For single occupancy the room price is reduced by €5.",
      fr: "À quelques pas du centre-ville et de notre bateau de plongée ; toutes les chambres ont salle de bain privée et climatisation. Chambres simples, doubles et familiales (jusqu'à 3 personnes). En occupation simple, le prix de la chambre est réduit de 5 €.",
      de: "Zu Fuß nah am Stadtzentrum und an unserem Tauchboot; alle Zimmer mit eigenem Bad und Klimaanlage. Einzel-, Doppel- und Familienzimmer (Familienzimmer für bis zu 3 Personen). Bei Einzelbelegung reduziert sich der Zimmerpreis um 5 €.",
    },
    cover: "lodging-guesthouse-room-1",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: transportPages,
  },
]
