import type { DragomanEvent } from '../../../schema'

type Day = DragomanEvent['itinerary'][number]

const day = (n: number, tr: string, en: string, fr: string, de: string, text: Day['description']): Day => ({
  title: { tr: `Gün ${n} — ${tr}`, en: `Day ${n} — ${en}`, fr: `Jour ${n} — ${fr}`, de: `Tag ${n} — ${de}` },
  description: text,
})

export const likyaKayakKonfor: DragomanEvent = {
  id: "likya-kayak-konfor",
  category: "seaKayak",
  subgroup: "kano-cok-gunlu",
  order: 4,
  slug: { tr: "likya-kayak-konfor", en: "lycian-kayak-comfort-escape", fr: "kayak-lycien-evasion-confort", de: "lykien-kajak-komfort" },
  title: {
    tr: "Likya Kayak & Konfor Kaçamağı",
    en: "Lycian Kayak & Comfort Escape",
    fr: "Kayak lycien et évasion confort",
    de: "Lykien: Kajak und Komfort",
  },
  summary: {
    tr: "Tarih ve doğa arasında her şey dahil 7 günlük kürek deneyimi.",
    en: "An all-inclusive 7-day paddling experience between history and nature.",
    fr: "Sept jours de pagaie tout compris, entre histoire et nature.",
    de: "Sieben Tage Paddeln all-inclusive zwischen Geschichte und Natur.",
  },
  body: {
    tr: [
      { type: "p", text: "Likya Kıyısı boyunca haftalık deniz kayağı turumuzla zaman ve doğa içinde bir yolculuğa çıkın. Berrak sularda kürek çekerken antik kentleri, saklı koyları ve binlerce yıllık kalıntıları keşfedin. Maceracılar, tarih meraklıları ve otantik bir deneyim arayanlar için." },
      { type: "h2", text: "Öne çıkanlar" },
      { type: "ul", items: ["İki batık antik kent: Kekova ve Aperlai", "Kaş takımadalarında tam gün kürek", "Patara kumsalı", "Andriake Likya Müzesi", "Serbest gün opsiyonel turları", "Her şey dahil konfor konaklama"] },
    ],
    en: [
      { type: "p", text: "Set out on a journey through time and nature with our week-long sea kayaking tour along the Lycian Coast. Paddle through clear water and discover ancient cities, hidden coves and ruins thousands of years old. For adventurers, history lovers and anyone looking for an authentic experience." },
      { type: "h2", text: "Highlights" },
      { type: "ul", items: ["Two sunken ancient cities: Kekova and Aperlai", "A full day of paddling in the Kaş archipelago", "Patara beach", "The Lycian Museum at Andriake", "Optional tours on the free day", "All-inclusive comfortable accommodation"] },
    ],
    fr: [
      { type: "p", text: "Partez pour un voyage dans le temps et la nature avec notre semaine de kayak de mer le long de la côte lycienne. Pagayez dans une eau limpide et découvrez des cités antiques, des criques cachées et des ruines millénaires. Pour les aventuriers, les passionnés d'histoire et tous ceux qui cherchent une expérience authentique." },
      { type: "h2", text: "Points forts" },
      { type: "ul", items: ["Deux cités antiques englouties : Kekova et Aperlai", "Une journée complète de pagaie dans l'archipel de Kaş", "La plage de Patara", "Le musée lycien d'Andriake", "Excursions en option le jour libre", "Hébergement confortable en formule tout compris"] },
    ],
    de: [
      { type: "p", text: "Begeben Sie sich mit unserer einwöchigen Seekajaktour entlang der Lykischen Küste auf eine Reise durch Zeit und Natur. Paddeln Sie durch klares Wasser und entdecken Sie antike Städte, versteckte Buchten und jahrtausendealte Ruinen. Für Abenteurer, Geschichtsinteressierte und alle, die ein authentisches Erlebnis suchen." },
      { type: "h2", text: "Höhepunkte" },
      { type: "ul", items: ["Zwei versunkene antike Städte: Kekova und Aperlai", "Ein ganzer Paddeltag im Archipel von Kaş", "Der Strand von Patara", "Das Lykische Museum in Andriake", "Optionale Ausflüge am freien Tag", "All-inclusive-Unterkunft mit Komfort"] },
    ],
  },
  duration: { tr: "7 gün / 6 gece", en: "7 days / 6 nights", fr: "7 jours / 6 nuits", de: "7 Tage / 6 Nächte" },
  priceDisplay: "on_request",
  options: [],
  cover: "kayak-lycian-comfort-1",
  gallery: ["kayak-lycian-comfort-2", "kayak-sea-turtle-1"],
  includes: {
    tr: ["Tüm grup havalimanı transferleri", "Otel konaklaması (6 gece)", "Atıştırmalıklar dahil tüm öğünler (serbest gün öğle yemeği hariç)", "Tüm otobüs/minibüs ulaşımı", "Sertifikalı kayak rehberi ve ikinci rehber", "Kayak, kürek, can yeleği, su geçirmez çanta, etek, şnorkel ekipmanı", "Gerektiğinde destek tekneleri", "Kürek günlerinde içme suyu", "Otopark ücretleri", "Harici rehber ücretleri", "Müze ve ören yeri giriş ücretleri"],
    en: ["All group airport transfers", "Hotel accommodation (6 nights)", "All meals including snacks (except lunch on the free day)", "All bus/minibus transport", "Certified kayak guide and a second guide", "Kayak, paddle, life jacket, dry bag, spray skirt, snorkelling gear", "Support boats when needed", "Drinking water on paddling days", "Parking fees", "External guide fees", "Museum and site entrance fees"],
    fr: ["Tous les transferts aéroport du groupe", "Hébergement à l'hôtel (6 nuits)", "Tous les repas, collations comprises (sauf le déjeuner du jour libre)", "Tous les transports en bus/minibus", "Guide de kayak certifié et second guide", "Kayak, pagaie, gilet, sac étanche, jupe, matériel de snorkeling", "Bateaux d'assistance si nécessaire", "Eau potable les jours de pagaie", "Frais de parking", "Frais de guides externes", "Entrées des musées et des sites"],
    de: ["Alle Flughafentransfers der Gruppe", "Hotelunterkunft (6 Nächte)", "Alle Mahlzeiten inkl. Snacks (außer Mittagessen am freien Tag)", "Alle Bus-/Minibusfahrten", "Zertifizierter Kajakguide und zweiter Guide", "Kajak, Paddel, Schwimmweste, Packsack, Spritzdecke, Schnorchelausrüstung", "Begleitboote bei Bedarf", "Trinkwasser an Paddeltagen", "Parkgebühren", "Gebühren für externe Führer", "Eintritt in Museen und Ausgrabungsstätten"],
  },
  excludes: {
    tr: ["Türkiye'ye/Türkiye'den ve ülke içi tüm uçak biletleri", "İçecek veya hediyelik gibi kişisel harcamalar", "Tur lideri, kayak rehberi, sürücü vb. için bahşişler", "Tur tarihlerinden önce ve sonra otel konaklaması", "Serbest gün opsiyonel turları", "Seyahat sigortası"],
    en: ["All international and domestic flights", "Personal expenses such as drinks or souvenirs", "Tips for the tour leader, kayak guide, driver etc.", "Hotel nights before and after the tour dates", "Optional tours on the free day", "Travel insurance"],
    fr: ["Tous les vols internationaux et intérieurs", "Dépenses personnelles (boissons, souvenirs)", "Pourboires du chef de groupe, du guide de kayak, du chauffeur, etc.", "Nuits d'hôtel avant et après les dates du circuit", "Excursions en option le jour libre", "Assurance voyage"],
    de: ["Alle internationalen und Inlandsflüge", "Persönliche Ausgaben wie Getränke oder Souvenirs", "Trinkgelder für Reiseleitung, Kajakguide, Fahrer usw.", "Hotelnächte vor und nach den Tourdaten", "Optionale Ausflüge am freien Tag", "Reiseversicherung"],
  },
  conditions: {
    tr: ["En az 6, en fazla 12 kişi"],
    en: ["Minimum 6, maximum 12 participants"],
    fr: ["6 participants minimum, 12 maximum"],
    de: ["Mindestens 6, höchstens 12 Teilnehmende"],
  },
  faq: [
    {
      question: { tr: "Grup kaç kişilik?", en: "How big is the group?", fr: "Quelle est la taille du groupe ?", de: "Wie groß ist die Gruppe?" },
      answer: {
        tr: "Tur en az 6, en fazla 12 kişiyle yapılır.",
        en: "The tour runs with a minimum of 6 and a maximum of 12 participants.",
        fr: "Le circuit se fait avec 6 participants minimum et 12 au maximum.",
        de: "Die Tour findet mit mindestens 6 und höchstens 12 Teilnehmenden statt.",
      },
    },
    {
      question: { tr: "Serbest günde neler yapılabilir?", en: "What can I do on the free day?", fr: "Que faire le jour libre ?", de: "Was kann ich am freien Tag unternehmen?" },
      answer: {
        tr: "Kaş'ta dinlenebilir ya da opsiyonel bir tur seçebilirsiniz: Meis adasına tekne turu, Myra ve Aziz Nikolaos Kilisesi ziyareti veya Kaş'ta dalış. Opsiyonel turlar fiyata dahil değildir.",
        en: "You can rest in Kaş or choose an optional tour: a boat trip to the Greek island of Meis, a visit to Myra and the Church of St Nicholas, or a dive in Kaş. Optional tours are not included in the price.",
        fr: "Vous pouvez vous reposer à Kaş ou choisir une excursion en option : bateau vers l'île grecque de Meis, visite de Myra et de l'église Saint-Nicolas, ou plongée à Kaş. Les excursions en option ne sont pas comprises dans le prix.",
        de: "Sie können sich in Kaş erholen oder einen optionalen Ausflug wählen: Bootsfahrt zur griechischen Insel Meis, Besuch von Myra und der Nikolauskirche oder ein Tauchgang in Kaş. Optionale Ausflüge sind nicht im Preis enthalten.",
      },
    },
    {
      question: { tr: "Havalimanı transferi dahil mi?", en: "Are airport transfers included?", fr: "Les transferts aéroport sont-ils inclus ?", de: "Sind Flughafentransfers inbegriffen?" },
      answer: {
        tr: "Evet, tüm grup havalimanı transferleri dahildir. Uçak biletleri dahil değildir.",
        en: "Yes, all group airport transfers are included. Flights are not included.",
        fr: "Oui, tous les transferts aéroport du groupe sont inclus. Les vols ne le sont pas.",
        de: "Ja, alle Flughafentransfers der Gruppe sind inbegriffen. Flüge sind nicht enthalten.",
      },
    },
  ],
  itinerary: [
    day(1, "Varış ve Kekova'ya giriş", "Arrival and introduction to Kekova", "Arrivée et découverte de Kekova", "Ankunft und erste Eindrücke von Kekova", {
      tr: "3 mil. Havalimanında karşılanıp yol üzerinde ilk Türk öğle yemeğiyle Üçağız'a transfer. Üçağız/Simena'daki otele yerleştikten sonra Kekova Batık Şehri üzerinde kürek ve kale köyü Kaleköy; ardından geleneksel Türk akşam yemeği.",
      en: "3 miles. Airport welcome and transfer to Üçağız with a first Turkish lunch on the way. After checking in at the hotel in Üçağız/Simena, paddle over the Kekova Sunken City and explore the castle village of Kaleköy; traditional Turkish dinner.",
      fr: "3 milles. Accueil à l'aéroport et transfert à Üçağız avec un premier déjeuner turc en route. Après l'installation à l'hôtel à Üçağız/Simena, pagayage au-dessus de la cité engloutie et découverte du village fortifié de Kaleköy ; dîner turc traditionnel.",
      de: "3 Meilen. Empfang am Flughafen und Transfer nach Üçağız mit einem ersten türkischen Mittagessen unterwegs. Nach dem Einchecken im Hotel in Üçağız/Simena Paddeln über die versunkene Stadt und Erkundung des Burgdorfs Kaleköy; traditionelles türkisches Abendessen.",
    }),
    day(2, "Aperlai ve şnorkel", "Aperlai and snorkelling", "Aperlai et snorkeling", "Aperlai und Schnorcheln", {
      tr: "8,5 mil, 1,5 mil yürüyüş. Tersane Koyu üzerinden batı rotasıyla antik Aperlai'ye kürek; kalıntılara kısa yürüyüş ve kraliyet moru boyasının hikâyesi, ardından batık şehrin üzerinde şnorkel. Bir balıkçı evinde deniz ürünleri öğle yemeği, dönüşte opsiyonel kayak yelkeni.",
      en: "8.5 miles, 1.5-mile walk. Western route via Tersane Bay to ancient Aperlai; a short walk to the ruins and the story of royal purple dye, then snorkelling over the sunken city. Seafood lunch at a fisherman's house, optional kayak sailing on the way back.",
      fr: "8,5 milles, 1,5 mille à pied. Route ouest par la baie de Tersane jusqu'à l'antique Aperlai ; courte marche jusqu'aux ruines et histoire de la pourpre royale, puis snorkeling au-dessus de la cité engloutie. Déjeuner de produits de la mer chez un pêcheur, voile en kayak en option au retour.",
      de: "8,5 Meilen, 1,5 Meilen zu Fuß. Westroute über die Bucht Tersane zum antiken Aperlai; kurzer Fußweg zu den Ruinen und die Geschichte des Königspurpurs, danach Schnorcheln über der versunkenen Stadt. Mittagessen mit Meeresfrüchten in einem Fischerhaus, auf dem Rückweg optional Kajaksegeln.",
    }),
    day(3, "Kekova Doğu ve Andriake Likya Müzesi", "Kekova East and the Lycian Museum at Andriake", "Kekova Est et le musée lycien d'Andriake", "Kekova Ost und das Lykische Museum in Andriake", {
      tr: "9 mil. Saklı koylar, korunan fok mağarası ve Andriake deresinde kaplumbağa gözlemiyle doğu rotası. Andriake Likya Müzesi ve antik sarnıç ziyareti, akşam yemeği için Kaş'a transfer.",
      en: "9 miles. The eastern route with hidden coves, the protected seal cave and turtle watching on the Andriake stream. Visit to the Lycian Museum at Andriake and the ancient cistern, then transfer to Kaş for dinner.",
      fr: "9 milles. Route est avec criques cachées, grotte protégée des phoques et observation des tortues sur le ruisseau d'Andriake. Visite du musée lycien d'Andriake et de la citerne antique, puis transfert à Kaş pour le dîner.",
      de: "9 Meilen. Die Ostroute mit versteckten Buchten, der geschützten Robbenhöhle und Schildkrötenbeobachtung am Bach von Andriake. Besuch des Lykischen Museums in Andriake und der antiken Zisterne, danach Transfer nach Kaş zum Abendessen.",
    }),
    day(4, "Serbest gün", "Free day", "Journée libre", "Freier Tag", {
      tr: "Kaş'ta dinlenin veya opsiyonel bir tur seçin: Meis adasına tekne turu, Myra ve Aziz Nikolaos Kilisesi ziyareti ya da Kaş sularında dalış. Akdeniz lezzetleriyle akşam yemeği.",
      en: "Rest in Kaş or choose an optional tour: a boat trip to Meis, a visit to Myra and the Church of St Nicholas, or a dive in the waters of Kaş. Dinner with Mediterranean flavours.",
      fr: "Repos à Kaş ou excursion en option : bateau vers Meis, visite de Myra et de l'église Saint-Nicolas, ou plongée dans les eaux de Kaş. Dîner aux saveurs méditerranéennes.",
      de: "Erholung in Kaş oder ein optionaler Ausflug: Bootsfahrt nach Meis, Besuch von Myra und der Nikolauskirche oder ein Tauchgang vor Kaş. Abendessen mit mediterranen Spezialitäten.",
    }),
    day(5, "Kaş takımadalarında kürek", "Paddling in the Kaş archipelago", "Pagaie dans l'archipel de Kaş", "Paddeln im Archipel von Kaş", {
      tr: "7,5 mil. Kaş çevresinde tam gün kürek: saklı koylar, sakin sular, Kaş ve Meis manzaraları ve deniz kenarında öğle yemeği. Akşam geleneksel Türk yemeği.",
      en: "7.5 miles. A full day of paddling around Kaş: hidden coves, calm water, views of Kaş and Meis and a seaside lunch. Traditional Turkish dinner in the evening.",
      fr: "7,5 milles. Une journée complète de pagaie autour de Kaş : criques cachées, eau calme, vues sur Kaş et Meis et déjeuner en bord de mer. Dîner turc traditionnel le soir.",
      de: "7,5 Meilen. Ein ganzer Paddeltag rund um Kaş: versteckte Buchten, ruhiges Wasser, Blick auf Kaş und Meis und Mittagessen am Meer. Abends traditionelles türkisches Essen.",
    }),
    day(6, "Patara", "Patara", "Patara", "Patara", {
      tr: "9 mil. Kalkan'a transfer ve Patara Plajı'na kürek; dünyanın en eski meclis binalarından birinin kalıntıları. Plaj pikniği ve antik kalıntıları gezme zamanı, ardından Patara'daki otelde veda yemeği.",
      en: "9 miles. Transfer to Kalkan and paddle to Patara Beach, home to the ruins of one of the oldest assembly buildings in the world. Beach picnic and time to explore the ruins, then a farewell dinner at the hotel in Patara.",
      fr: "9 milles. Transfert à Kalkan et pagayage jusqu'à la plage de Patara, où se trouvent les ruines de l'un des plus anciens bâtiments d'assemblée au monde. Pique-nique sur la plage et visite des ruines, puis dîner d'adieu à l'hôtel à Patara.",
      de: "9 Meilen. Transfer nach Kalkan und Paddeln zum Strand von Patara mit den Ruinen eines der ältesten Versammlungsgebäude der Welt. Strandpicknick und Zeit für die Ruinen, danach Abschiedsessen im Hotel in Patara.",
    }),
    day(7, "Ayrılış", "Departure", "Départ", "Abreise", {
      tr: "Çıkıştan önce kahvaltı, ardından havalimanına transfer.",
      en: "Breakfast before check-out, then transfer to the airport.",
      fr: "Petit-déjeuner avant le départ, puis transfert à l'aéroport.",
      de: "Frühstück vor dem Auschecken, danach Transfer zum Flughafen.",
    }),
  ],
  healthForm: null,
  featured: true,
  status: "published",
  origin: "kayak-site",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/turlar/lycian-comfort-escape/", "https://dragoman-turkey.com/tr/dragoman-blog-tr/lycian-kayak-comfort-escape-tour/"],
}
