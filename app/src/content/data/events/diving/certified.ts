import type { DragomanEvent } from '../../../schema'

const sourcePages = ["https://dragoman-turkey.com/tr/diving/", "https://dragoman-turkey.com/diving/", "https://dragoman-turkey.com/fr/plongee/"]

type Option = DragomanEvent['options'][number]

const option = (id: string, name: Option['name'], price: number, basis: Option['basis'] = "person"): Option => ({
  id,
  name,
  price,
  currency: "EUR",
  basis,
})

export const tekneDalislari: DragomanEvent = {
  id: "tekne-dalislari",
  category: "diving",
  subgroup: "dalis-sertifikali",
  order: 1,
  slug: { tr: "tekne-dalislari", en: "boat-dives", fr: "plongees-bateau", de: "bootstauchgaenge" },
  title: { tr: "Rehberli Tekne Dalışları", en: "Guided Boat Dives", fr: "Plongées guidées en bateau", de: "Geführte Bootstauchgänge" },
  summary: {
    tr: "Dalış teknemiz Dragoman ile Kaş'ın 30'u aşkın dalış noktasına, en fazla 6 kişilik gruplarla.",
    en: "Dive the 30-plus sites of Kaş from our boat Dragoman, in groups of no more than 6 divers.",
    fr: "Plongez sur plus de 30 sites de Kaş depuis notre bateau Dragoman, en palanquées de 6 plongeurs maximum.",
    de: "Mit unserem Tauchboot Dragoman zu über 30 Tauchplätzen rund um Kaş, in Gruppen von höchstens 6 Tauchern.",
  },
  body: {
    tr: [
      { type: "p", text: "Tüm dalışlar tekneden, bir rehber (eğitmen veya dalış lideri) refakatinde ve en fazla 6 kişilik gruplar (+ rehber) şeklinde yapılır. Brifingler Türkçe, İngilizce ve Fransızca verilir." },
      { type: "h2", text: "Dalış teknesi Dragoman" },
      { type: "p", text: "21 metrelik Dragoman, kapalı güvertesiyle tüm hava koşullarında ve yıl boyunca rahatınız için tasarlanmıştır. 50 dalıcı için şahsi malzeme kutuları, malzeme askıları, soyunma bölümü, bar, duş, WC, fotoğraf ekipmanı için hazırlık masası ve tatlı su tankı bulunur. Üst güvertedeki şezlonglar ve gölgelik, dinlenmek isteyenlerin ve refakatçilerin hizmetindedir." },
      { type: "h2", text: "Dalış paketleri" },
      { type: "p", text: "Ekipmansız fiyatlara tüp, ağırlık, tekne ve rehber; ekipmanlı fiyatlara tüm ekipman, tekne ve rehber dahildir. Nitrox tüp ek ücreti 5 €'dur." },
    ],
    en: [
      { type: "p", text: "All dives are made from the boat, led by a guide (instructor or divemaster), with a maximum of 6 divers (+ guide) per group. Briefings are given in Turkish, English and French." },
      { type: "h2", text: "Our dive boat Dragoman" },
      { type: "p", text: "Dragoman is a 21-metre boat with a sheltered deck, designed for diving in all seasons. It comfortably serves 50 divers with individual boxes, BC and suit hangers, a changing area, bar, shower, WC, a preparation table and fresh-water tank for cameras. Sun beds and shade on the upper deck are there for those who want to rest and for non-divers." },
      { type: "h2", text: "Dive packages" },
      { type: "p", text: "Prices without equipment include tank, weights, boat and guide; prices with equipment include full equipment, boat and guide. A Nitrox tank costs €5 extra." },
    ],
    fr: [
      { type: "p", text: "Toutes les plongées sont effectuées à partir du bateau, en groupes de 6 plongeurs maximum, en compagnie d'un guide (moniteur ou chef de palanquée). Les briefings sont assurés en turc, en anglais et en français." },
      { type: "h2", text: "Notre bateau Dragoman" },
      { type: "p", text: "Dragoman, notre bateau de 21 m avec un pont couvert, est conçu pour plonger confortablement toute l'année et par tous les temps. Il accueille 50 plongeurs : casiers individuels, cintres pour gilets et combinaisons, espace pour se changer, bar, douche, WC, table de préparation et bac d'eau douce pour les appareils photo. Transats et zone ombragée sur le pont supérieur pour se reposer et pour les accompagnateurs." },
      { type: "h2", text: "Forfaits de plongée" },
      { type: "p", text: "Le tarif sans équipement comprend bouteille, plombs, bateau et guide ; le tarif avec équipement comprend tout l'équipement, le bateau et le guide. Supplément bouteille Nitrox : 5 €." },
    ],
    de: [
      { type: "p", text: "Alle Tauchgänge finden vom Boot aus statt, geführt von einem Guide (Tauchlehrer oder Divemaster), in Gruppen von höchstens 6 Tauchern (+ Guide). Briefings gibt es auf Türkisch, Englisch und Französisch." },
      { type: "h2", text: "Unser Tauchboot Dragoman" },
      { type: "p", text: "Die 21 Meter lange Dragoman mit überdachtem Deck ist für das Tauchen bei jedem Wetter und das ganze Jahr über gebaut. Sie bietet 50 Tauchern persönliche Kisten, Bügel für Jackets und Anzüge, einen Umkleidebereich, Bar, Dusche, WC, einen Vorbereitungstisch und einen Süßwassertank für Kameras. Liegen und Schatten auf dem Oberdeck stehen allen zur Verfügung, die sich ausruhen möchten, und auch Begleitpersonen." },
      { type: "h2", text: "Tauchpakete" },
      { type: "p", text: "Preise ohne Ausrüstung enthalten Flasche, Blei, Boot und Guide; Preise mit Ausrüstung enthalten die komplette Ausrüstung, Boot und Guide. Eine Nitroxflasche kostet 5 € extra." },
    ],
  },
  priceDisplay: "numeric",
  options: [
    option("tek-dalis-ekipmansiz", { tr: "Tek dalış, ekipmansız", en: "One dive, without equipment", fr: "1 plongée, sans équipement", de: "Ein Tauchgang, ohne Ausrüstung" }, 30),
    option("tek-dalis-ekipmanli", { tr: "Tek dalış, ekipmanlı", en: "One dive, with equipment", fr: "1 plongée, avec équipement", de: "Ein Tauchgang, mit Ausrüstung" }, 39),
    option("paket-6-ekipmansiz", { tr: "6'lı dalış paketi, ekipmansız", en: "6-dive pack, without equipment", fr: "Forfait 6 plongées, sans équipement", de: "6er-Paket, ohne Ausrüstung" }, 171, "package"),
    option("paket-6-ekipmanli", { tr: "6'lı dalış paketi, ekipmanlı", en: "6-dive pack, with equipment", fr: "Forfait 6 plongées, avec équipement", de: "6er-Paket, mit Ausrüstung" }, 222, "package"),
    option("paket-10-ekipmansiz", { tr: "10'lu dalış paketi, ekipmansız", en: "10-dive pack, without equipment", fr: "Forfait 10 plongées, sans équipement", de: "10er-Paket, ohne Ausrüstung" }, 270, "package"),
    option("paket-10-ekipmanli", { tr: "10'lu dalış paketi, ekipmanlı", en: "10-dive pack, with equipment", fr: "Forfait 10 plongées, avec équipement", de: "10er-Paket, mit Ausrüstung" }, 351, "package"),
    option("paket-20-ekipmansiz", { tr: "20'li dalış paketi, ekipmansız", en: "20-dive pack, without equipment", fr: "Forfait 20 plongées, sans équipement", de: "20er-Paket, ohne Ausrüstung" }, 480, "package"),
    option("paket-20-ekipmanli", { tr: "20'li dalış paketi, ekipmanlı", en: "20-dive pack, with equipment", fr: "Forfait 20 plongées, avec équipement", de: "20er-Paket, mit Ausrüstung" }, 624, "package"),
  ],
  cover: "diving-fun-dive-fish-1",
  gallery: ["boat-dragoman-1", "diving-turtle-2", "diving-wreck-plane-1", "diving-wreck-boat-1"],
  includes: {
    tr: ["Tekne", "Rehber (eğitmen veya dalış lideri)", "Tüp ve ağırlık", "Ekipmanlı seçeneklerde tüm ekipman"],
    en: ["Boat", "Guide (instructor or divemaster)", "Tank and weights", "Full equipment with the equipment options"],
    fr: ["Bateau", "Guide (moniteur ou chef de palanquée)", "Bouteille et plombs", "Tout l'équipement avec les options équipées"],
    de: ["Boot", "Guide (Tauchlehrer oder Divemaster)", "Flasche und Blei", "Komplette Ausrüstung bei den Optionen mit Ausrüstung"],
  },
  conditions: {
    tr: ["En fazla 6 dalıcı + rehber"],
    en: ["Maximum 6 divers + guide"],
    fr: ["6 plongeurs maximum + guide"],
    de: ["Höchstens 6 Taucher + Guide"],
  },
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: sourcePages,
}

export const geceDalisi: DragomanEvent = {
  id: "gece-dalisi",
  category: "diving",
  subgroup: "dalis-sertifikali",
  order: 2,
  slug: { tr: "gece-dalisi", en: "night-dive", fr: "plongee-de-nuit", de: "nachttauchgang" },
  title: { tr: "Gece Dalışı", en: "Night Dive", fr: "Plongée de nuit", de: "Nachttauchgang" },
  summary: {
    tr: "Sertifikalı dalıcılar için rehberli gece dalışı; fener dahil.",
    en: "A guided night dive for certified divers; dive torch included.",
    fr: "Une plongée de nuit guidée pour plongeurs certifiés ; torche incluse.",
    de: "Geführter Nachttauchgang für brevetierte Taucher; Lampe inklusive.",
  },
  body: {
    tr: [
      { type: "p", text: "Sertifikalı dalıcılar için tekneden, rehber eşliğinde ve en fazla 6 kişilik gruplarla yapılan gece dalışı. Dalış feneri fiyata dahildir. Ekipmansız fiyata tüp, ağırlık, tekne ve rehber; ekipmanlı fiyata tüm ekipman, tekne ve rehber dahildir." },
    ],
    en: [
      { type: "p", text: "A night dive for certified divers, made from the boat with a guide and in groups of no more than 6. The dive torch is included. The price without equipment includes tank, weights, boat and guide; the price with equipment includes full equipment, boat and guide." },
    ],
    fr: [
      { type: "p", text: "Une plongée de nuit pour plongeurs certifiés, depuis le bateau, avec un guide et en groupes de 6 plongeurs maximum. La torche de plongée est incluse. Le tarif sans équipement comprend bouteille, plombs, bateau et guide ; le tarif avec équipement comprend tout l'équipement, le bateau et le guide." },
    ],
    de: [
      { type: "p", text: "Ein Nachttauchgang für brevetierte Taucher, vom Boot aus, mit Guide und in Gruppen von höchstens 6 Personen. Die Tauchlampe ist inbegriffen. Der Preis ohne Ausrüstung enthält Flasche, Blei, Boot und Guide; der Preis mit Ausrüstung enthält die komplette Ausrüstung, Boot und Guide." },
    ],
  },
  priceDisplay: "numeric",
  options: [
    option("ekipmansiz", { tr: "Ekipmansız", en: "Without equipment", fr: "Sans équipement", de: "Ohne Ausrüstung" }, 35),
    option("ekipmanli", { tr: "Ekipmanlı", en: "With equipment", fr: "Avec équipement", de: "Mit Ausrüstung" }, 44),
  ],
  cover: "diving-nudibranch-1",
  gallery: ["diving-cornetfish-1"],
  includes: {
    tr: ["Dalış feneri", "Tekne ve rehber", "Tüp ve ağırlık"],
    en: ["Dive torch", "Boat and guide", "Tank and weights"],
    fr: ["Torche de plongée", "Bateau et guide", "Bouteille et plombs"],
    de: ["Tauchlampe", "Boot und Guide", "Flasche und Blei"],
  },
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: sourcePages,
}

export const ozelDalisDragomanJunior: DragomanEvent = {
  id: "ozel-dalis-dragoman-junior",
  category: "diving",
  subgroup: "dalis-sertifikali",
  order: 3,
  slug: { tr: "dragoman-junior-ozel-dalis", en: "private-dives-dragoman-junior", fr: "plongees-privees-dragoman-junior", de: "private-tauchgaenge-dragoman-junior" },
  title: { tr: "Dragoman Jr ile Özel Dalışlar", en: "Private Dives with Dragoman Jr", fr: "Plongées privées avec Dragoman Jr", de: "Private Tauchgänge mit Dragoman Jr" },
  summary: {
    tr: "İstediğiniz zaman, istediğiniz yere: hız teknemizle özel dalış.",
    en: "Anywhere, any time: a private dive from our speedboat.",
    fr: "Où vous voulez, quand vous voulez : une plongée privée depuis notre semi-rigide.",
    de: "Wohin und wann Sie wollen: ein privater Tauchgang von unserem Schnellboot aus.",
  },
  body: {
    tr: [
      { type: "p", text: "Dragoman Junior, 5,9 metre uzunluğu ve 80 beygir motor gücüyle tüm dalış noktalarına kısa sürede ulaşım sağlar. Tekne kapasitesi 4 dalıcı ile sınırlıdır. Hava ve deniz koşulları elverdiği sürece saat ve dalış noktası gözetmeksizin dalıcılarımızın hizmetindedir. Fiyatlar 1 dalış içindir; bu özel hizmet için lütfen ofisimizle iletişime geçin." },
    ],
    en: [
      { type: "p", text: "Dragoman Junior is 5.9 metres long with an 80 HP engine and reaches every dive site quickly. Its capacity is limited to 4 divers. As long as the weather and sea allow, it is at our divers' disposal whatever the time or dive site. Prices are for one dive; please contact our office for this special service." },
    ],
    fr: [
      { type: "p", text: "Dragoman Junior, long de 5,9 mètres et doté d'un moteur de 80 chevaux, rejoint rapidement tous les sites de plongée. Sa capacité est limitée à 4 plongeurs. Tant que la météo et la mer le permettent, il est à la disposition de nos plongeurs quels que soient l'heure et le site. Les tarifs s'entendent pour une plongée ; contactez notre bureau pour ce service particulier." },
    ],
    de: [
      { type: "p", text: "Dragoman Junior ist 5,9 Meter lang, hat 80 PS und erreicht jeden Tauchplatz in kurzer Zeit. Die Kapazität ist auf 4 Taucher begrenzt. Solange Wetter und Meer es erlauben, steht das Boot unseren Tauchern unabhängig von Uhrzeit und Tauchplatz zur Verfügung. Die Preise gelten für einen Tauchgang; für diesen besonderen Service wenden Sie sich bitte an unser Büro." },
    ],
  },
  priceDisplay: "numeric",
  options: [
    option("bir-dalici", { tr: "1 dalıcı", en: "1 diver", fr: "1 plongeur", de: "1 Taucher" }, 150),
    option("iki-uc-dalici", { tr: "2–3 dalıcı, kişi başı", en: "2–3 divers, per diver", fr: "2–3 plongeurs, par personne", de: "2–3 Taucher, pro Person" }, 95),
    option("dort-bes-dalici", { tr: "4–5 dalıcı, kişi başı", en: "4–5 divers, per diver", fr: "4–5 plongeurs, par personne", de: "4–5 Taucher, pro Person" }, 85),
  ],
  cover: "diving-wreck-boat-1",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  // The old French page states a different capacity, so French follows the Turkish text.
  translationOrigin: { en: "cloner", fr: "mockup", de: "mockup" },
  sourceRefs: sourcePages,
}

/** A dated trip that has already taken place: kept to prove archived events stay hidden. */
export const sharmElSheikh2026: DragomanEvent = {
  id: "sharm-el-sheikh-2026",
  category: "diving",
  subgroup: "dalis-sertifikali",
  order: 4,
  slug: { tr: "sharm-el-sheikh-dalis-turu-2026", en: "sharm-el-sheikh-dive-trip-2026", fr: "voyage-plongee-sharm-el-sheikh-2026", de: "tauchreise-sharm-el-sheikh-2026" },
  title: { tr: "Sharm El Sheikh Dalış Turu 2026", en: "Sharm El Sheikh Dive Trip 2026", fr: "Voyage plongée Sharm El Sheikh 2026", de: "Tauchreise Sharm El Sheikh 2026" },
  summary: {
    tr: "25–31 Ekim 2026: Kızıldeniz'de 4 günde yaklaşık 10 dalış.",
    en: "25–31 October 2026: about 10 dives in 4 days in the Red Sea.",
    fr: "25–31 octobre 2026 : une dizaine de plongées en 4 jours en mer Rouge.",
    de: "25.–31. Oktober 2026: etwa 10 Tauchgänge an 4 Tagen im Roten Meer.",
  },
  body: {
    tr: [
      { type: "p", text: "8 gün / 7 gecelik Sharm El Sheikh gezisinde 26–29 Ekim günlerinde toplam yaklaşık 10 dalış; Tiran ve Ras Muhammed bölgeleri ve isteğe bağlı Thistlegorm. En az Open Water sertifikası gerekir." },
      { type: "ul", items: ["Naama Bay'de 6 gece oda kahvaltı konaklama", "4 günde 10 dalış, teknede öğle yemekleri ve milli park giriş ücretleri", "Tüm transferler"] },
    ],
    en: [
      { type: "p", text: "An 8-day / 7-night trip to Sharm El Sheikh with about 10 dives on 26–29 October: the Tiran and Ras Mohammed areas and the optional Thistlegorm. Minimum Open Water certification required." },
      { type: "ul", items: ["6 nights bed and breakfast in Naama Bay", "10 dives over 4 days, lunches on the boat and national park fees", "All transfers"] },
    ],
    fr: [
      { type: "p", text: "Un voyage de 8 jours / 7 nuits à Sharm El Sheikh avec une dizaine de plongées du 26 au 29 octobre : secteurs de Tiran et de Ras Mohammed et, en option, le Thistlegorm. Niveau Open Water minimum." },
      { type: "ul", items: ["6 nuits en chambre et petit-déjeuner à Naama Bay", "10 plongées sur 4 jours, déjeuners à bord et entrées du parc national", "Tous les transferts"] },
    ],
    de: [
      { type: "p", text: "Eine Reise von 8 Tagen / 7 Nächten nach Sharm El Sheikh mit etwa 10 Tauchgängen vom 26. bis 29. Oktober: Gebiete Tiran und Ras Mohammed sowie optional die Thistlegorm. Mindestens Open-Water-Brevet erforderlich." },
      { type: "ul", items: ["6 Nächte mit Frühstück in Naama Bay", "10 Tauchgänge an 4 Tagen, Mittagessen an Bord und Nationalparkgebühren", "Alle Transfers"] },
    ],
  },
  duration: { tr: "8 gün / 7 gece", en: "8 days / 7 nights", fr: "8 jours / 7 nuits", de: "8 Tage / 7 Nächte" },
  priceDisplay: "on_request",
  options: [],
  cover: "blog-sharm-el-sheikh",
  gallery: ["blog-sharm-napoleon-1", "blog-sharm-moray-1"],
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "archived",
  origin: "cloner",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragoman-turkey.com/tr/dragoman-blog/dragoman-sharm-el-sheikh-dalis-turu-2026/", "1987"],
}
