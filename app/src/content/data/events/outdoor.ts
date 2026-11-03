import type { DragomanEvent } from '../../schema'

const outdoorPages = ["https://dragoman-turkey.com/tr/doga-etkinlikleri/", "https://dragoman-turkey.com/outdoor-activities/", "https://dragoman-turkey.com/fr/activites-pleine-nature/"]

const perPerson = (price: number): DragomanEvent['options'] => [
  { id: "kisi-basi", name: { tr: "Kişi başı", en: "Per person", fr: "Par personne", de: "Pro Person" }, price, currency: "EUR", basis: "person" },
]

const dogayaDonus: DragomanEvent = {
  id: "dogaya-donus",
  category: "outdoor",
  subgroup: "doga-coklu-aktivite",
  order: 1,
  slug: { tr: "dogaya-donus", en: "back-to-nature", fr: "retour-a-la-nature", de: "zurueck-zur-natur" },
  title: { tr: "Doğaya Dönüş", en: "Back to Nature", fr: "Retour à la nature", de: "Zurück zur Natur" },
  summary: {
    tr: "Yürüyüş, bisiklet ve deniz kanosuyla 4 günlük çok aktiviteli Likya macerası.",
    en: "A 4-day multi-activity Lycian adventure on foot, by bike and by sea kayak.",
    fr: "Une aventure lycienne multi-activités de 4 jours à pied, à vélo et en kayak de mer.",
    de: "Ein viertägiges Multiaktivitätsabenteuer in Lykien zu Fuß, mit dem Rad und im Seekajak.",
  },
  body: {
    tr: [
      { type: "p", text: "Kendi motorun ol: Akdeniz'in bu güzel bölgesinin en etkileyici yerlerinde yürüyerek, bisiklete binerek ve kürek çekerek ilerle. Antik Likya alanlarının yanında kamp kuracağın, günün sıcağında olduğu kadar gecenin en sakin anlarında da berrak denizin tadını çıkaracağın 4 günlük bir açık hava macerası." },
      { type: "p", text: "İkisi batık beş farklı Likya kentini keşfet: Kekova batık kenti boyunca kürek çek ya da güzel bir yürüyüşün ardından Aperlai harabeleri arasında şnorkelle yüz. Şehrin koşuşturmasından uzaklık ve huzur garanti." },
      { type: "ul", items: ["Etkinlikler: bisiklet, deniz kanosu, yürüyüş", "Süre: 3 gece 4 gün"] },
    ],
    en: [
      { type: "p", text: "Be your own engine, hiking, biking and paddling your way through the most stunning parts of this beautiful Mediterranean region. Immerse yourself in history on our 4-day multi-activity outdoor adventure, camping next to ancient Lycian sites and enjoying the crystal-clear sea in the heat of the day as well as at its calmest at night." },
      { type: "p", text: "Explore five different Lycian cities, two of which are sunken: paddle along the ancient sunken city of Kekova or treat yourself to a snorkel along the ruins of Aperlai after a beautiful hike. Seclusion from the hustle and bustle of city life is guaranteed." },
      { type: "ul", items: ["Activities: hiking, biking, sea kayaking", "Duration: 3 nights, 4 days"] },
    ],
    fr: [
      { type: "p", text: "Soyez votre propre moteur en randonnée, à vélo et en kayak à travers les plus beaux endroits de cette magnifique région méditerranéenne. Plongez dans l'histoire lors de notre aventure de 4 jours, où vous camperez près des sites lyciens antiques et profiterez de la mer cristalline pendant les heures chaudes comme au calme de la nuit." },
      { type: "p", text: "Explorez cinq cités lyciennes, dont deux englouties : pagayez le long de la cité engloutie de Kekova ou offrez-vous du snorkeling parmi les ruines d'Aperlai après une belle randonnée. Isolement et refuge loin de l'agitation urbaine garantis." },
      { type: "ul", items: ["Activités : randonnée, VTT, kayak de mer", "Durée : 3 nuits, 4 jours"] },
    ],
    de: [
      { type: "p", text: "Seien Sie Ihr eigener Motor: wandernd, radelnd und paddelnd durch die eindrucksvollsten Ecken dieser schönen Mittelmeerregion. Tauchen Sie ein in die Geschichte bei unserem viertägigen Outdoor-Abenteuer, zelten Sie neben antiken lykischen Stätten und genießen Sie das klare Meer in der Hitze des Tages wie in der Ruhe der Nacht." },
      { type: "p", text: "Entdecken Sie fünf lykische Städte, zwei davon versunken: Paddeln Sie an der versunkenen Stadt Kekova entlang oder schnorcheln Sie nach einer schönen Wanderung zwischen den Ruinen von Aperlai. Abstand vom Trubel der Stadt ist garantiert." },
      { type: "ul", items: ["Aktivitäten: Wandern, Radfahren, Seekajak", "Dauer: 3 Nächte, 4 Tage"] },
    ],
  },
  duration: { tr: "4 gün / 3 gece", en: "4 days / 3 nights", fr: "4 jours / 3 nuits", de: "4 Tage / 3 Nächte" },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-multi-activity-1",
  gallery: ["cover-outdoor", "hero-sea-kayak"],
  conditions: {
    tr: ["Haftalık turlar en az 2 kişiyle yapılır; fiyatlar kişi başıdır."],
    en: ["Weekly tours run with a minimum of 2 participants; prices are per person."],
    fr: ["Les circuits hebdomadaires partent à partir de 2 participants ; prix par personne."],
    de: ["Wochentouren finden ab 2 Teilnehmenden statt; Preise pro Person."],
  },
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

const felenKasYuruyusu: DragomanEvent = {
  id: "felen-kas-yuruyusu",
  category: "outdoor",
  subgroup: "doga-yuruyus",
  order: 1,
  slug: { tr: "felen-kas-yuruyusu", en: "phellos-to-kas-hike", fr: "randonnee-phellos-kas", de: "wanderung-phellos-kas" },
  title: { tr: "Felen (Phellos) – Kaş (Antiphellos) Yürüyüşü", en: "Felen (Phellos) – Kaş (Antiphellos) Hike", fr: "Randonnée Felen (Phellos) – Kaş (Antiphellos)", de: "Wanderung Felen (Phellos) – Kaş (Antiphellos)" },
  summary: {
    tr: "Phellos nekropolünden Kaş'a, Meis manzarasıyla inen günlük yürüyüş.",
    en: "A day hike from the Phellos necropolis down to Kaş, with views of Meis.",
    fr: "Une randonnée à la journée de la nécropole de Phellos jusqu'à Kaş, face à Meis.",
    de: "Eine Tageswanderung von der Nekropole von Phellos hinunter nach Kaş mit Blick auf Meis.",
  },
  body: {
    tr: [
      { type: "p", text: "Yürüyüş, küçük köy yerleşimlerinden geçilerek ulaşılan orman evinden başlar. Birkaç yüz metre sonra, yoğun bitki örtüsüyle kaplı vadi manzarasının tadını çıkarmak için kısa bir mola verilir. Ağaçlar arasından birdenbire karşımıza çıkan, lahit mezarlarla donatılmış Phellos kentidir." },
      { type: "p", text: "Çukurbağ Köyü'ne inerken köyün iyi korunmuş ev mimarisi dikkat çeker. Yürüyüşün son etabı fon manzarası olarak Meis adasını sunar." },
      { type: "ul", items: ["Transfer süresi: 25 dk", "Zorluk: A (kolay, her yaştan herkes için)", "İrtifa: 850–0 m"] },
    ],
    en: [
      { type: "p", text: "The hike starts at a small forest house reached through small village settlements. After a few hundred metres we stop to enjoy the view of the valley, covered with trees. The ancient city of Phellos then presents itself with its impressive necropolis and tombs hidden in the trees and bushes." },
      { type: "p", text: "Going down towards Çukurbağ village, the well-preserved architecture of the old houses is worth seeing. On the final part of the hike the Greek island of Meis forms the backdrop." },
      { type: "ul", items: ["Transfer time: 25 min", "Grade: A (easy, for anyone of any age)", "Altitude: 850–0 m"] },
    ],
    fr: [
      { type: "p", text: "La randonnée commence près d'une petite maison forestière, accessible par de petits villages. Après quelques centaines de mètres, nous faisons une pause pour admirer le panorama de la vallée boisée. La cité antique de Phellos se révèle alors avec son impressionnante nécropole et ses tombes cachées parmi les arbres et les buissons." },
      { type: "p", text: "En descendant vers le village de Çukurbağ, l'architecture bien conservée des vieilles maisons mérite le coup d'œil. Dans la dernière partie, l'île grecque de Meis s'impose à l'horizon." },
      { type: "ul", items: ["Durée du transfert : 25 min", "Niveau : A (facile, pour tous les âges)", "Altitude : 850–0 m"] },
    ],
    de: [
      { type: "p", text: "Die Wanderung beginnt an einem kleinen Waldhaus, das man durch kleine Dörfer erreicht. Nach einigen hundert Metern legen wir eine kurze Pause ein, um den Blick über das bewaldete Tal zu genießen. Dann zeigt sich die antike Stadt Phellos mit ihrer eindrucksvollen Nekropole und den zwischen Bäumen und Büschen versteckten Sarkophagen." },
      { type: "p", text: "Beim Abstieg zum Dorf Çukurbağ fällt die gut erhaltene Architektur der alten Häuser auf. Im letzten Abschnitt bildet die griechische Insel Meis die Kulisse." },
      { type: "ul", items: ["Transferzeit: 25 Min.", "Schwierigkeit: A (leicht, für alle Altersgruppen)", "Höhe: 850–0 m"] },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(50),
  cover: "outdoor-hiking-lycian-way-1",
  gallery: ["cover-outdoor"],
  conditions: {
    tr: ["Günlük turlar en az 4 kişiyle yapılır."],
    en: ["Day tours run with a minimum of 4 participants."],
    fr: ["Les sorties à la journée partent à partir de 4 participants."],
    de: ["Tagestouren finden ab 4 Teilnehmenden statt."],
  },
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

/** Deliberately bare: no FAQ, itinerary, includes or meeting point (empty sections stay hidden). */
const sarilarBelenliBisiklet: DragomanEvent = {
  id: "sarilar-belenli-bisiklet",
  category: "outdoor",
  subgroup: "doga-bisiklet",
  order: 1,
  slug: { tr: "sarilar-belenli-bisiklet-turu", en: "sarilar-belenli-bike-tour", fr: "velo-sarilar-belenli", de: "radtour-sarilar-belenli" },
  title: { tr: "Sarılar – Belenli Bisiklet Turu", en: "Sarılar – Belenli Bike Tour", fr: "Vélo Sarılar – Belenli", de: "Radtour Sarılar – Belenli" },
  summary: {
    tr: "Meşe ağaçları, köy evleri ve antik Korba arasında çoğunlukla düz bir bisiklet günü.",
    en: "A mostly flat cycling day among oak trees, village houses and ancient Korba.",
    fr: "Une journée de vélo, surtout à plat, entre chênes, maisons de village et l'antique Korba.",
    de: "Ein überwiegend flacher Radtag zwischen Eichen, Dorfhäusern und dem antiken Korba.",
  },
  body: {
    tr: [
      { type: "p", text: "Meşe ağaçları, eski köy evleri ve antik Korba kentinin kalıntılarından oluşan bir manzara bu bisiklet gününde sizi karşılıyor. Pedallamaya yaklaşık 450 metre rakımda başlıyoruz; tur boyunca ortalama rakım yaklaşık 355 metre, rota ise çoğunlukla düz. Mevsime bağlı olarak öğle yemeğinizi bir meşe ağacının gölgesinde ya da eski bir okul bahçesinde yiyebilirsiniz." },
      { type: "p", text: "Toplam mesafe: 22 km + isteğe bağlı 12 km." },
    ],
    en: [
      { type: "p", text: "A view of oak trees, old village houses and the ruins of the ancient city of Korba welcomes you on this cycling day. We start pedalling at around 450 metres; the average altitude during the tour is about 355 metres and the route is mostly flat. Depending on the season, you can have lunch in the shade of an oak tree or in an old school yard." },
      { type: "p", text: "Total distance: 22 km + 12 km (optional)." },
    ],
    fr: [
      { type: "p", text: "Une vue sur de nombreux chênes, de vieilles maisons de village et les ruines de l'ancienne cité de Korba vous accueille pour cette journée de vélo. Nous commençons à pédaler vers 450 mètres d'altitude ; l'altitude moyenne du parcours est d'environ 355 mètres, sur un itinéraire principalement plat. Selon la saison, vous déjeunerez à l'ombre d'un chêne ou dans la cour d'une ancienne école." },
      { type: "p", text: "Distance totale : 22 km + 12 km (en option)." },
    ],
    de: [
      { type: "p", text: "Eichen, alte Dorfhäuser und die Ruinen der antiken Stadt Korba begleiten Sie an diesem Radtag. Wir starten auf etwa 450 Metern Höhe; die durchschnittliche Höhe liegt bei rund 355 Metern, und die Strecke ist überwiegend flach. Je nach Jahreszeit essen Sie im Schatten einer Eiche oder im Hof einer alten Schule zu Mittag." },
      { type: "p", text: "Gesamtstrecke: 22 km + 12 km (optional)." },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(50),
  cover: "outdoor-cycling-placeholder",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

const kiyiTirmanisi: DragomanEvent = {
  id: "kiyi-tirmanisi",
  category: "outdoor",
  subgroup: "doga-kiyi-tirmanisi",
  order: 1,
  slug: { tr: "coasteering-buyukcakil-limanagzi", en: "coasteering-buyukcakil-limanagzi", fr: "coasteering-buyukcakil-limanagzi", de: "coasteering-buyukcakil-limanagzi" },
  title: { tr: "Coasteering: Büyükçakıl – Limanağzı", en: "Coasteering: Büyükçakıl – Limanağzı", fr: "Coasteering : Büyükçakıl – Limanağzı", de: "Coasteering: Büyükçakıl – Limanağzı" },
  summary: {
    tr: "Kayalık kıyı boyunca yürü, tırman, atla ve yüz: 3 km'lik kıyı traversi.",
    en: "Walk, climb, jump and swim along the rocky shore: a 3 km coastal traverse.",
    fr: "Marchez, grimpez, sautez et nagez le long de la côte rocheuse : une traversée de 3 km.",
    de: "Gehen, klettern, springen und schwimmen entlang der Felsküste: eine 3 km lange Küstentraverse.",
  },
  body: {
    tr: [
      { type: "p", text: "Coasteering temel olarak kayalık kıyıyı suya çok yakın bir şekilde geçmeyi içerir. Hiçbir teknik tırmanış ekipmanına veya ileri tırmanış tekniğine gerek yoktur: sadece yürüyün, tırmanın, atlayın, yüzün ve tekrar atlayın!" },
      { type: "p", text: "Rotanız boyunca bölgenin jeolojik ve ekolojik oluşumlarını keşfeder; deniz kuşlarını, balıkları, yengeçleri ve deniz kaplumbağalarını gözlemleyebilirsiniz. Çok şanslıysanız nadir bir Akdeniz fokunu bile görebilirsiniz." },
      { type: "ul", items: ["Mesafe: 3 km", "Rota: Büyükçakıl – Limanağzı"] },
    ],
    en: [
      { type: "p", text: "Coasteering basically consists of traversing the rocky coastline very close to the water. No technical climbing equipment or advanced climbing techniques are needed: you just walk, climb, jump, swim and jump again!" },
      { type: "p", text: "Along your path you explore the geological and ecological formations of the area, and you may observe sea birds, fish, crabs and sea turtles. If you are very lucky, perhaps even an elusive Mediterranean monk seal." },
      { type: "ul", items: ["Distance: 3 km", "Route: Büyükçakıl – Limanağzı"] },
    ],
    fr: [
      { type: "p", text: "Le coasteering consiste essentiellement à parcourir la côte rocheuse tout près de l'eau. Aucun équipement technique d'escalade ni technique avancée n'est nécessaire : vous marchez, grimpez, sautez, nagez, et sautez encore !" },
      { type: "p", text: "En chemin, vous découvrez les formations géologiques et écologiques de la région et pouvez observer oiseaux marins, poissons, crabes et tortues de mer. Pourquoi pas un phoque moine furtif, si vous avez beaucoup de chance ?" },
      { type: "ul", items: ["Distance : 3 km", "Itinéraire : Büyükçakıl – Limanağzı"] },
    ],
    de: [
      { type: "p", text: "Beim Coasteering durchquert man die felsige Küste ganz nah am Wasser. Technische Kletterausrüstung oder fortgeschrittene Klettertechnik braucht es nicht: einfach gehen, klettern, springen, schwimmen und wieder springen!" },
      { type: "p", text: "Unterwegs entdecken Sie die geologischen und ökologischen Formationen der Gegend und können Seevögel, Fische, Krabben und Meeresschildkröten beobachten. Mit viel Glück sogar eine scheue Mittelmeer-Mönchsrobbe." },
      { type: "ul", items: ["Strecke: 3 km", "Route: Büyükçakıl – Limanağzı"] },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(70),
  cover: "outdoor-coasteering-1",
  gallery: ["outdoor-coasteering-2", "hero-outdoor"],
  conditions: {
    tr: ["En az 4 katılımcı; fiyatlar kişi başıdır.", "16–55 yaş grubu için uygundur ve iyi bir fiziksel kondisyon gerektirir."],
    en: ["Minimum 4 participants; prices are per person.", "Suitable for ages 16–55 and requires a good level of fitness."],
    fr: ["4 participants minimum ; prix par personne.", "Adapté aux 16–55 ans et nécessite une bonne condition physique."],
    de: ["Mindestens 4 Teilnehmende; Preise pro Person.", "Geeignet für 16- bis 55-Jährige, gute körperliche Fitness erforderlich."],
  },
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: true,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

const kasKekovaTekneTuru: DragomanEvent = {
  id: "kas-kekova-tekne-turu",
  category: "outdoor",
  subgroup: "doga-tekne",
  order: 1,
  slug: { tr: "kas-kekova-kas-tekne-turu", en: "kas-kekova-kas-boat-trip", fr: "excursion-bateau-kas-kekova-kas", de: "bootsausflug-kas-kekova-kas" },
  title: { tr: "Kaş – Kekova – Kaş Tekne Turu", en: "Kaş – Kekova – Kaş Boat Trip", fr: "Excursion en bateau Kaş – Kekova – Kaş", de: "Bootsausflug Kaş – Kekova – Kaş" },
  summary: {
    tr: "Kaş takımadalarından Batık Şehir ve Simena Kalesi'ne yaklaşık 9 saatlik tekne günü.",
    en: "A boat day of about 9 hours from the Kaş archipelago to the Sunken City and Simena Castle.",
    fr: "Une journée en bateau d'environ 9 heures, de l'archipel de Kaş à la cité engloutie et au château de Simena.",
    de: "Ein etwa neunstündiger Bootstag vom Archipel von Kaş zur versunkenen Stadt und zur Burg von Simena.",
  },
  body: {
    tr: [
      { type: "p", text: "Tur toplamda yaklaşık 9 saat sürer. Kaş-Kekova Özel Koruma Alanı'nı keşfeder, Likya'dan Roma dönemine 3000 yıl öncesine uzanan antik yerleşimlerin güzelliklerini görürsünüz." },
      { type: "p", text: "Gün boyunca Kaş takımadalarını, Limanağzı plajını, Kekova adasını, Batık Şehir'i ve Simena Kalesi'ni (Kaleköy) ziyaret edeceksiniz." },
    ],
    en: [
      { type: "p", text: "The tour takes around 9 hours in total. You explore the Specially Protected Area of Kaş-Kekova and see the ruins of ancient settlements going back 3000 years, from Lycian to Roman times." },
      { type: "p", text: "During the day you visit the Kaş archipelago, Limanağzı beach, Kekova island, the Sunken City and Simena Castle (Kaleköy)." },
    ],
    fr: [
      { type: "p", text: "La sortie dure environ 9 heures au total. Vous explorez la zone spécialement protégée de Kaş-Kekova et découvrez les ruines de cités anciennes vieilles de 3000 ans, des villes lyciennes aux villes romaines." },
      { type: "p", text: "Au cours de la journée, vous visitez l'archipel de Kaş, la plage de Limanağzı, l'île de Kekova, la cité engloutie et le château de Simena (Kaleköy)." },
    ],
    de: [
      { type: "p", text: "Der Ausflug dauert insgesamt etwa 9 Stunden. Sie erkunden das Sonderschutzgebiet Kaş-Kekova und sehen die Ruinen antiker Siedlungen, die 3000 Jahre zurückreichen, von lykischer bis römischer Zeit." },
      { type: "p", text: "Im Laufe des Tages besuchen Sie den Archipel von Kaş, den Strand von Limanağzı, die Insel Kekova, die versunkene Stadt und die Burg von Simena (Kaleköy)." },
    ],
  },
  duration: { tr: "Yaklaşık 9 saat", en: "About 9 hours", fr: "Environ 9 heures", de: "Etwa 9 Stunden" },
  priceDisplay: "numeric",
  options: perPerson(55),
  cover: "boat-dragoman-aerial-1",
  gallery: ["kayak-simena-castle-1", "kas-town-view-1"],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

const myraDemreKulturTuru: DragomanEvent = {
  id: "myra-demre-kultur-turu",
  category: "outdoor",
  subgroup: "doga-kultur",
  order: 1,
  slug: { tr: "myra-demre-kultur-turu", en: "myra-demre-culture-tour", fr: "circuit-culturel-myra-demre", de: "kulturtour-myra-demre" },
  title: { tr: "Myra (Demre) Kültür Turu", en: "Myra (Demre) Culture Tour", fr: "Circuit culturel Myra (Demre)", de: "Kulturtour Myra (Demre)" },
  summary: {
    tr: "Kyaenai'den Myra tiyatrosuna, Aya Nikola kilisesinden Andriake ve Hoyran'a.",
    en: "From Kyaenai to the theatre of Myra, from the Church of St Nicholas to Andriake and Hoyran.",
    fr: "De Kyaenai au théâtre de Myra, de l'église Saint-Nicolas à Andriake et Hoyran.",
    de: "Von Kyaenai zum Theater von Myra, von der Nikolauskirche nach Andriake und Hoyran.",
  },
  body: {
    tr: [
      { type: "p", text: "M.Ö. 4. yüzyıldan beri yerleşim yeri olarak kullanılan Kyaenai'den başlayan gezimiz, Aziz Nikolaos'un zamanının çoğunu geçirdiği Myra yakınlarındaki Aya Nikola kilisesini, Likya dönemine ait kaya mezarlarını ve Myra'daki antik tiyatroyu kapsar." },
      { type: "p", text: "Sülüklü Plajı'nda yüzme molası verip öğle yemeğini plajda alırız. Andriake'yi ziyaret ettikten sonra otobüsümüz bizi Frigler dönemine uzanan ana tanrıça kenti Hoyran'a götürür; burada kaya mezarlarını keşfedersiniz." },
    ],
    en: [
      { type: "p", text: "Starting from Kyaenai, a settlement since the 4th century BC, our trip includes the Church of St Nicholas near Myra, where the saint spent most of his time, the rock tombs from Lycian times and the ancient theatre of Myra." },
      { type: "p", text: "We stop for a swim at Sülüklü beach and have lunch on the beach. After visiting Andriake, our bus takes us to Hoyran, the city of the mother goddess dating back to the Phrygians, where you can explore the rock tombs." },
    ],
    fr: [
      { type: "p", text: "Au départ de Kyaenai, habitée depuis le IVe siècle av. J.-C., notre excursion comprend l'église Saint-Nicolas près de Myra, où le saint passa la majeure partie de son temps, les tombes rupestres lyciennes et le théâtre antique de Myra." },
      { type: "p", text: "Nous faisons une pause baignade à la plage de Sülüklü et déjeunons sur la plage. Après Andriake, notre bus nous conduit à Hoyran, la ville de la déesse mère datant des Phrygiens, où vous explorez les tombes rupestres." },
    ],
    de: [
      { type: "p", text: "Ab Kyaenai, besiedelt seit dem 4. Jahrhundert v. Chr., führt unser Ausflug zur Nikolauskirche bei Myra, wo der Heilige die meiste Zeit verbrachte, zu den lykischen Felsgräbern und zum antiken Theater von Myra." },
      { type: "p", text: "Am Strand von Sülüklü legen wir eine Badepause ein und essen dort zu Mittag. Nach dem Besuch von Andriake bringt uns der Bus nach Hoyran, der Stadt der Muttergöttin aus phrygischer Zeit, wo Sie die Felsgräber erkunden." },
    ],
  },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-culture-1",
  gallery: ["outdoor-culture-2", "outdoor-beach-dunes-1"],
  conditions: {
    tr: ["En az 2, en fazla 22 katılımcı"],
    en: ["Minimum 2, maximum 22 participants"],
    fr: ["2 participants minimum, 22 maximum"],
    de: ["Mindestens 2, höchstens 22 Teilnehmende"],
  },
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: outdoorPages,
}

/** Generic private-tour entry point; no programme of its own is invented. */
const ozelTurlar: DragomanEvent = {
  id: "ozel-turlar",
  category: "outdoor",
  subgroup: "doga-ozel-turlar",
  order: 1,
  slug: { tr: "size-ozel-turlar", en: "private-tours", fr: "circuits-prives", de: "private-touren" },
  title: { tr: "Size Özel Turlar", en: "Private Tours", fr: "Circuits privés", de: "Private Touren" },
  summary: {
    tr: "Grubunuza özel program: beklentilerinizi yazın, birlikte hazırlayalım.",
    en: "A programme just for your group: tell us what you have in mind and we plan it together.",
    fr: "Un programme rien que pour votre groupe : dites-nous ce que vous souhaitez, nous le préparons ensemble.",
    de: "Ein Programm nur für Ihre Gruppe: Sagen Sie uns, was Sie sich wünschen, wir planen es gemeinsam.",
  },
  body: {
    tr: [
      { type: "p", text: "Turunuzu grubunuza özel hâle getirmek, dalış veya farklı doğa etkinlikleriyle zenginleştirmek isterseniz beklentilerinizi bize yazın; size özel programınızı birlikte hazırlayalım. Rota, tarih ve süre sizin ihtiyaçlarınıza göre planlanır." },
    ],
    en: [
      { type: "p", text: "If you would like a tour just for your group, or one combined with diving or other outdoor activities, write to us with what you have in mind and we will put your programme together with you. Route, dates and duration are planned around your needs." },
    ],
    fr: [
      { type: "p", text: "Si vous souhaitez une sortie réservée à votre groupe, ou combinée avec de la plongée ou d'autres activités de plein air, écrivez-nous vos attentes et nous préparerons votre programme ensemble. Itinéraire, dates et durée sont adaptés à vos besoins." },
    ],
    de: [
      { type: "p", text: "Wenn Sie eine Tour nur für Ihre Gruppe wünschen oder sie mit Tauchen und anderen Outdoor-Aktivitäten verbinden möchten, schreiben Sie uns Ihre Vorstellungen; wir stellen Ihr Programm gemeinsam mit Ihnen zusammen. Route, Termine und Dauer richten sich nach Ihren Wünschen." },
    ],
  },
  priceDisplay: "on_request",
  options: [],
  cover: "kas-town-view-1",
  gallery: ["outdoor-beach-dunes-1"],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "published",
  origin: "mockup",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/", "https://dragomanseakayak.com/tr/ozel-turlar/"],
}

/**
 * Drafts from the old outdoor page. German is left out on purpose: staff translate these with
 * DeepL in the panel before publishing. Weekly tours ask for 2 participants (the old Turkish page
 * also says 4 for weekly tours, the English and French pages say 2); day tours ask for 4.
 */
const dayTourCondition = {
  tr: ["Günlük turlar en az 4 kişiyle yapılır; fiyatlar kişi başıdır."],
  en: ["Day tours run with a minimum of 4 participants; prices are per person."],
  fr: ["Les sorties à la journée partent à partir de 4 participants ; prix par personne."],
}

const weeklyTourConditions = {
  tr: ["Haftalık turlar en az 2 kişiyle yapılır; fiyatlar kişi başıdır.", "Daha büyük grupların fiyatlandırması ve ayrıntılı program için ofisimizle iletişime geçin."],
  en: ["Weekly tours run with a minimum of 2 participants; prices are per person.", "For pricing of bigger groups and for the detailed programme, please contact our office."],
  fr: ["Les circuits hebdomadaires partent à partir de 2 participants ; prix par personne.", "Pour les tarifs des groupes plus importants et le programme détaillé, veuillez contacter notre bureau."],
}

const ufakdereKas: DragomanEvent = {
  id: "ufakdere-kas-yuruyusu",
  category: "outdoor",
  subgroup: "doga-yuruyus",
  order: 2,
  slug: { tr: "ufakdere-kas-yuruyusu", en: "ufakdere-to-kas-hike", fr: "randonnee-ufakdere-kas", de: "wanderung-ufakdere-kas" },
  title: { tr: "Ufakdere – Kaş Yürüyüşü", en: "Ufakdere – Kaş Hike", fr: "Randonnée Ufakdere – Kaş" },
  summary: {
    tr: "Likya Yolu'nda kıyı boyunca Ufakdere koyundan Sebeda nekropolü üzerinden Kaş'a günlük yürüyüş.",
    en: "A day hike on the Lycian Way from Ufakdere bay along the coast and past the Sebeda necropolis to Kaş.",
    fr: "Une randonnée à la journée sur le chemin lycien, de la baie d'Ufakdere à Kaş en longeant la côte et la nécropole de Sebeda.",
  },
  body: {
    tr: [
      { type: "p", text: "Yürüyüş, Okçuöldüğü mevkiinden yaklaşık 30 dakikalık bir yürüyüşle Ufakdere koyuna inildikten sonra Likya Yolu üzerinde başlar. Göz alıcı kıyı manzaraları ve yol boyunca karşımıza çıkan Likya dönemi kaya mezarları yürüyüşü daha da etkileyici kılar." },
      { type: "p", text: "Limanağzı'nda öğle yemeği molası verilir; isteyenler Kaş'ın turkuaz sularında yüzebilir. Sebeda nekropolüne tırmanışın ardından patika rahat bir tempoda yürüyüşçüleri Kaş'a kadar götürür." },
      { type: "ul", items: ["Transfer süresi: 25 dk", "Zorluk: A–B (kolay ile orta arası; B: düzenli doğa yürüyüşü yapanlar için)"] },
    ],
    en: [
      { type: "p", text: "Starting from the Okçuöldüğü district, we reach Ufakdere bay and start hiking on the Lycian Way. The views of the coastline, the striking beauty of the path and the Lycian rock tombs along it add to the pleasure of the hike." },
      { type: "p", text: "After lunch in Limanağzı bay, anyone who wants to can swim in the crystal-clear water of Kaş. After the climb up to the necropolis of Sebeda, the path continues at a moderate pace all the way down to Kaş." },
      { type: "ul", items: ["Transfer time: 25 min", "Grade: A–B (easy to moderate; B is for anyone who is a regular walker)"] },
    ],
    fr: [
      { type: "p", text: "En partant du quartier d'Okçuöldüğü, nous rejoignons la baie d'Ufakdere et commençons la randonnée sur le chemin lycien. Les vues sur le littoral, la beauté saisissante du sentier et les tombes lyciennes qui le jalonnent rendent la marche encore plus agréable." },
      { type: "p", text: "Après le déjeuner dans la baie de Limanağzı, ceux qui le souhaitent peuvent se baigner dans les eaux cristallines de Kaş. Après la montée vers la nécropole de Sebeda, le sentier continue à un rythme modéré et descend jusqu'à Kaş." },
      { type: "ul", items: ["Durée du transfert : 25 min", "Niveau : A–B (facile à modéré ; B : pour les marcheurs réguliers)"] },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(55),
  cover: "outdoor-hiking-lycian-way-1",
  gallery: [],
  conditions: dayTourCondition,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const kuruovaSusuzDag: DragomanEvent = {
  id: "kuruova-susuz-dag-ucoluk-yuruyusu",
  category: "outdoor",
  subgroup: "doga-yuruyus",
  order: 3,
  slug: { tr: "kuruova-susuz-dag-ucoluk-yaylasi-yuruyusu", en: "kuruova-susuz-dag-ucoluk-plateau-hike", fr: "randonnee-kuruova-susuz-dag-ucoluk", de: "wanderung-kuruova-susuz-dag-ucoluk" },
  title: { tr: "Kuruova – Susuz Dağ – Üçoluk Yaylası Yürüyüşü", en: "Kuruova – Susuz Dağ – Üçoluk Plateau Hike", fr: "Randonnée Kuruova – Susuz Dağ – plateau d'Üçoluk" },
  summary: {
    tr: "Sedir ormanlarından 1850 metreye, Toros zirvelerine bakan yaklaşık 13 km'lik dağ yürüyüşü.",
    en: "A mountain hike of about 13 km from cedar forest up to 1850 metres, with views of the Taurus peaks.",
    fr: "Une randonnée de montagne d'environ 13 km, de la forêt de cèdres jusqu'à 1850 mètres, face aux sommets du Taurus.",
  },
  body: {
    tr: [
      { type: "p", text: "Yaklaşık 13 km'lik yürüyüşümüz, Gömbe yolunun en yüksek noktası olan Kuruova geçidinin (1550 m) hemen yanında, mis kokulu sedir ormanlarının içinden başlar. Bu bölge her zaman Kaş'tan 5–10 derece daha soğuktur; kışın hayatında bir kez olsun karda oynamak isteyen piknikçilerin de gözdesidir." },
      { type: "p", text: "Rota bizi Toroslar'ın zirvelerini göreceğimiz 1850 metreye kadar çıkarır. Ağaç sınırını yavaş yavaş geride bırakırken bambaşka bir bitki örtüsüne gireriz. Tekrar inişe geçtiğimizde, buralarda keçilerini otlatan yörüklerden vahşi atlara kadar pek çok sürpriz bizi bekler." },
      { type: "ul", items: ["Transfer süresi: 60 dk", "Zorluk: A–B (kolay ile orta arası; B: düzenli doğa yürüyüşü yapanlar için)", "İrtifa: 1550–1850–1500 m", "Mesafe: yaklaşık 13 km"] },
    ],
    en: [
      { type: "p", text: "The hike starts from the highest point of the road to Gömbe, right next to the Kuruova pass (1550 m), in fragrant cedar forests. The area is always around 5–10 degrees colder than Kaş and is one of the favourite places for picnickers who want to enjoy the exceptional snowfall in winter." },
      { type: "p", text: "The route takes us up to 1850 metres, from where you can see the peaks of the Taurus Mountains. Leaving the cedar trees behind, a completely different vegetation cover waits for us with lots of different surprises: nomads feeding their goats, wild horses…" },
      { type: "ul", items: ["Transfer time: 60 min", "Grade: A–B (easy to moderate; B is for anyone who is a regular walker)", "Altitude: 1550–1850–1500 m", "Distance: about 13 km"] },
    ],
    fr: [
      { type: "p", text: "La randonnée commence au point le plus élevé de la route menant à Gömbe, juste près du col de Kuruova (1550 m), au cœur des forêts parfumées de cèdres. Cette région, toujours 5 à 10 degrés plus fraîche que Kaş, est l'un des lieux préférés des pique-niqueurs pour admirer les chutes de neige exceptionnelles en hiver." },
      { type: "p", text: "L'itinéraire nous conduit jusqu'à 1850 mètres d'altitude, d'où l'on peut admirer les sommets du Taurus. En laissant derrière nous les cèdres, une végétation totalement différente nous attend, avec son lot de surprises : des nomades faisant paître leurs chèvres, des chevaux sauvages…" },
      { type: "ul", items: ["Durée du transfert : 60 min", "Niveau : A–B (facile à modéré ; B : pour les marcheurs réguliers)", "Altitude : 1550–1850–1500 m", "Distance : environ 13 km"] },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(55),
  cover: "outdoor-hiking-lycian-way-1",
  gallery: [],
  conditions: dayTourCondition,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const likyaKonforu: DragomanEvent = {
  id: "likya-konforu",
  category: "outdoor",
  subgroup: "doga-yuruyus",
  order: 4,
  slug: { tr: "likya-konforu", en: "lycian-comfort", fr: "confort-lycien", de: "lykischer-komfort" },
  title: { tr: "Likya Konforu", en: "Lycian Comfort", fr: "Confort Lycien" },
  summary: {
    tr: "Kaş'ta konaklayarak Phellos'tan Andriake'ye, Likya'nın en güzel yerlerini 7 günde yürüyün.",
    en: "A 7-day hiking tour based in Kaş, from Phellos to Andriake, through the finest sights of Lycia.",
    fr: "Un circuit de randonnée de 7 jours avec hébergement à Kaş, de Phellos à Andriake, à travers les plus beaux sites de Lycie.",
  },
  body: {
    tr: [
      { type: "p", text: "Likya Konforu Turu, Kaş'ta konaklayarak çevreyi keşfetmenin konforunu Likya bölgesinin en güzel enstantaneleriyle bir araya getirir. Tur ilk günden bölgenin en etkileyici nekropolisi ve lahit mezarlarla donatılmış Phellos antik kentinin ziyaretiyle başlar." },
      { type: "p", text: "Turun doruk noktalarını dünyanın bilinen en eski gemisinin battığı Uluburun mevkii, Likya dönemini Bizans'la harmanlayan Aperlai harabeleri, Likya yerleşimleri içinde belki de en çekici ve romantik olan Simena ve son olarak Noel Baba'nın memleketi Demre'nin antik limanı Andriake'nin keşfi oluşturur. Bölgenin mikro iklimi ve kendine özgü ekosistemi de katılımcıları her an şaşırtmaya aday." },
      { type: "ul", items: ["Rota: Phellos – Antiphellos – Ufakdere – Barak – Aperlai – Üçağız – Simena – Gökkaya – Andriake", "Süre: 6 gece 7 gün"] },
    ],
    en: [
      { type: "p", text: "The Lycian Comfort tour combines the comfort of staying in Kaş with some of the finest sights of the Lycian region. The tour starts with a visit to the ancient city of Phellos, home to the region's most impressive necropolis and its sarcophagi." },
      { type: "p", text: "The highlights are Uluburun, where the oldest known shipwreck in the world was found; the ruins of Aperlai, which blend the Lycian and Byzantine periods; Simena, perhaps the most charming and romantic of the Lycian settlements; and finally Andriake, the ancient harbour of Demre, the home town of Saint Nicholas. The region's microclimate and distinctive ecosystem are ready to surprise you at any moment." },
      { type: "ul", items: ["Route: Phellos – Antiphellos – Ufakdere – Barak – Aperlai – Üçağız – Simena – Gökkaya – Andriake", "Duration: 6 nights, 7 days"] },
    ],
    fr: [
      { type: "p", text: "Confort Lycien vous offre l'opportunité de découvrir la région avec ses merveilles archéologiques et naturelles, tout en profitant d'un hébergement confortable à Kaş. Le circuit commence par la visite de la nécropole de Phellos." },
      { type: "p", text: "Il se poursuit par un voyage ponctué de vues spectaculaires sur la mer et les montagnes : Uluburun, où a été retrouvée la plus ancienne épave connue à ce jour, les ruines d'Aperlai, la cité antique et romantique de Simena, ainsi que le port d'Andriake, appartenant à la ville de Saint-Nicolas. Le microclimat et l'écosystème très particuliers de la région sont prêts à vous surprendre à tout moment." },
      { type: "ul", items: ["Itinéraire : Phellos – Antiphellos – Ufakdere – Barak – Aperlai – Üçağız – Simena – Gökkaya – Andriake", "Durée : 6 nuits, 7 jours"] },
    ],
  },
  duration: { tr: "7 gün / 6 gece", en: "7 days / 6 nights", fr: "7 jours / 6 nuits" },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-hiking-lycian-way-1",
  gallery: ["kayak-simena-castle-1"],
  conditions: weeklyTourConditions,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  // The old English page has no Lycian Comfort tour, so English is written from the Turkish and French pages.
  translationOrigin: { en: "mockup", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const kekovaMacerasi: DragomanEvent = {
  id: "kekova-macerasi",
  category: "outdoor",
  subgroup: "doga-yuruyus",
  order: 5,
  slug: { tr: "kekova-macerasi", en: "kekova-adventure", fr: "aventure-kekova", de: "kekova-abenteuer" },
  title: { tr: "Kekova Macerası", en: "Kekova Adventure", fr: "Kekova Adventure" },
  summary: {
    tr: "Üç yürüyüş günüyle Appolonia'dan Andriake'ye, Aperlai'de kamp ve Simena'da konaklama.",
    en: "Three hiking days from Appolonia to Andriake, with camping at Aperlai and a night in Simena.",
    fr: "Trois jours de randonnée d'Appolonia à Andriake, avec camping à Aperlai et une nuit à Simena.",
  },
  body: {
    tr: [
      { type: "p", text: "3 yürüyüş gününü kapsayan Kekova Macerası, antik Likya bölgesinin tarihsel ve coğrafi güzelliklerinin tadına varmak için eşsiz bir fırsat sunar." },
      { type: "p", text: "Turun doruk noktalarını Aperlai harabeleri, Likya yerleşimleri içinde belki de en çekici olan Simena'da konaklama ve Noel Baba'nın memleketi Demre'nin antik limanı Andriake'nin keşfi oluşturur. Batık şehir Aperlai'nin hemen yanı başında kamp keyfi de bu maceraya ayrı bir boyut katar. Bölgenin mikro iklimi ve kendine özgü ekosistemi katılımcıları her an şaşırtmaya aday." },
      { type: "ul", items: ["Rota: Appolonia – Andriake", "Süre: 4 gece 5 gün"] },
    ],
    en: [
      { type: "p", text: "This tour offers you a great chance to discover the historical and geographical beauties of Lycia in three hiking days." },
      { type: "p", text: "The highlights of the tour include the ruins of Aperlai, spending a night in the ancient city of Simena and visiting Andriake, the harbour of Myra that is home to the Saint Nicholas church. Camping just beside the ruins in Aperlai adds even more to the attraction of the tour. The very singular microclimate and ecosystem of the region are ready to surprise you at any moment." },
      { type: "ul", items: ["Route: Appolonia – Andriake", "Duration: 4 nights, 5 days"] },
    ],
    fr: [
      { type: "p", text: "Ce circuit vous offre une excellente occasion de découvrir les beautés historiques et géographiques de la Lycie au cours de trois journées de randonnée." },
      { type: "p", text: "Parmi les temps forts de la visite : les ruines d'Aperlai, une nuit passée dans l'ancienne cité de Simena et la découverte d'Andriake, le port de Myra, qui abrite l'église de Saint-Nicolas. Camper juste à côté des ruines d'Aperlai rend ce voyage encore plus captivant. Le microclimat et l'écosystème très particuliers de la région sont prêts à vous surprendre à tout moment." },
      { type: "ul", items: ["Itinéraire : Appolonia – Andriake", "Durée : 4 nuits, 5 jours"] },
    ],
  },
  duration: { tr: "5 gün / 4 gece", en: "5 days / 4 nights", fr: "5 jours / 4 nuits" },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-hiking-lycian-way-1",
  gallery: ["kayak-simena-castle-1"],
  conditions: weeklyTourConditions,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const isikUlkesi: DragomanEvent = {
  id: "isik-ulkesi",
  category: "outdoor",
  subgroup: "doga-coklu-aktivite",
  order: 2,
  slug: { tr: "isik-ulkesi", en: "land-of-light", fr: "terre-de-lumiere", de: "land-des-lichts" },
  title: { tr: "Işık Ülkesi", en: "Land of Light", fr: "Terre de lumière" },
  summary: {
    tr: "Yürüyüş, bisiklet, deniz kanosu, kıyı traversi ve dalışla 6 günlük Likya haftası: 3 gece kamp, 2 gece Kaş'ta butik otel.",
    en: "A 6-day Lycian week of hiking, biking, sea kayaking, coasteering and diving: 3 nights camping, 2 nights in a boutique hotel in Kaş.",
    fr: "Une semaine lycienne de 6 jours : randonnée, VTT, kayak de mer, coasteering et plongée, avec 3 nuits sous tente et 2 nuits en hôtel boutique à Kaş.",
  },
  body: {
    tr: [
      { type: "p", text: "Medeniyetten ve kalabalıktan uzakta 3 gece kamp, Kaş'ta 2 gece otel konaklamasıyla adrenalin yüklü bir hafta. Yürüyüş, bisiklet, deniz kanosu, kıyı traversi ve dalış deneyimiyle Likya'yı, ışık ülkesini keşfedin. Muhteşem doğası, karada ve denizde zengin tarihi ve kristal mavi sularıyla Likya sizi bekliyor." },
      { type: "p", text: "Kamplar hijyen imkânlarına sahip, şartlara uygun kamp alanlarında kurulur; otel konaklaması ise Kaş'ın hijyen standartlarına uygun butik otellerinde yapılır." },
      { type: "ul", items: ["Etkinlikler: dalış, kıyı traversi, yürüyüş, bisiklet, deniz kanosu", "Konaklama: 3 gece kamp, 2 gece Kaş'ta otel", "Süre: 5 gece 6 gün"] },
    ],
    en: [
      { type: "p", text: "Taste the freedom few are fortunate enough to experience by discovering first-hand the beauties of Lycia, \"the land of light\". Enjoy three fun-filled days of adrenaline-pumping outdoor activities and three nights camping away from civilization and fully immersed in nature, followed by two nights in a charming boutique hotel in Kaş, one of the most attractive holiday destinations in Turkey." },
      { type: "p", text: "Explore the natural wonders of Lycia while hiking, biking, sea kayaking, coasteering and scuba diving. Its stunning views, crystal-clear Mediterranean waters and mighty mountains will welcome you for an unforgettable experience." },
      { type: "ul", items: ["Activities: hiking, biking, sea kayaking, coasteering, diving", "Accommodation: 3 nights camping, 2 nights in a hotel in Kaş", "Duration: 5 nights, 6 days"] },
    ],
    fr: [
      { type: "p", text: "Goûtez à la liberté que peu ont la chance de vivre en découvrant de première main les merveilles de Lycie, « la terre de lumière ». Profitez de trois jours remplis d'activités de plein air pleines d'adrénaline et de trois nuits sous tente, loin de la civilisation et totalement immergé dans la nature, suivis de deux nuits dans un charmant hôtel boutique à Kaş, l'une des destinations de vacances les plus attrayantes de Turquie." },
      { type: "p", text: "Explorez les merveilles naturelles de Lycie en randonnée, à vélo, en kayak de mer, en coasteering et en plongée sous-marine. Les vues splendides de Lycie, ses eaux cristallines de la Méditerranée et ses montagnes majestueuses vous accueilleront pour une expérience inoubliable." },
      { type: "ul", items: ["Activités : randonnée, VTT, kayak de mer, coasteering, plongée", "Hébergement : 3 nuits sous tente, 2 nuits à l'hôtel à Kaş", "Durée : 5 nuits, 6 jours"] },
    ],
  },
  duration: { tr: "6 gün / 5 gece", en: "6 days / 5 nights", fr: "6 jours / 5 nuits" },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-multi-activity-1",
  gallery: [],
  conditions: weeklyTourConditions,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const gursuDirgenlerBisiklet: DragomanEvent = {
  id: "gursu-dirgenler-bisiklet",
  category: "outdoor",
  subgroup: "doga-bisiklet",
  order: 2,
  slug: { tr: "gursu-dirgenler-bisiklet-turu", en: "gursu-dirgenler-bike-tour", fr: "velo-gursu-dirgenler", de: "radtour-gursu-dirgenler" },
  title: { tr: "Gürsu – Dirgenler Bisiklet Turu", en: "Gürsu – Dirgenler Bike Tour", fr: "Vélo Gürsu – Dirgenler" },
  summary: {
    tr: "Susuz Dağı eteklerinde, ilk 20 km'si yokuş aşağı, dere yatağını izleyen 28 km'lik bisiklet günü.",
    en: "A 28 km cycling day at the foot of Susuz Mountain, with a downhill first 20 km and a route along a creek bed.",
    fr: "Une journée de vélo de 28 km au pied du mont Susuz, avec 20 premiers kilomètres en descente puis le lit d'un ruisseau.",
  },
  body: {
    tr: [
      { type: "p", text: "Susuz Dağı eteklerinde, Orta Likya'nın en etkileyici kaya oluşumlarına ve epik manzaralı sedir ormanlarına ev sahipliği yapan Gürsu köyüne, 1200 metreye kadar dağ yolundan minibüsle çıkıyoruz. Turun ilk 20 kilometresi yokuş aşağıdır ve bu ilk bölümden sonra rota bir dere yatağını takip eder." },
      { type: "p", text: "Öğle yemeğinizi bir köy evinde yedikten sonra biraz dinlenip taze köy havasını içinize çekebilirsiniz. Yemeğin ardından minibüse binerek Kaş'a geri döneriz ve tur limanda sona erer." },
      { type: "p", text: "Toplam mesafe: 28 km." },
    ],
    en: [
      { type: "p", text: "We drive in a van up a mountain road to 1200 m, to Gürsu village in the range of Susuz Mountain, home to some of Central Lycia's most stunning rock formations and cedar forest with epic views. The first 20 kilometres of the tour are downhill and after the first part the route follows a creek bed." },
      { type: "p", text: "After having your lunch in a village house you can rest for a bit and breathe in the fresh village air. After lunch we get back in the van and drive to Kaş, and the tour finishes in the harbour." },
      { type: "p", text: "Total distance: 28 km." },
    ],
    fr: [
      { type: "p", text: "Nous montons en van jusqu'à 1200 m sur une route de montagne, jusqu'au village de Gürsu, situé dans le massif du mont Susuz, un lieu abritant certaines des formations rocheuses les plus impressionnantes de la Lycie centrale ainsi qu'une forêt de cèdres avec des vues épiques. Les 20 premiers kilomètres se font en descente, puis le parcours suit le lit d'un ruisseau." },
      { type: "p", text: "Après le déjeuner dans une maison de village, vous pourrez vous reposer un peu et respirer l'air frais du village. Après le repas, nous reprenons le van pour retourner à Kaş et la sortie se termine au port." },
      { type: "p", text: "Distance totale : 28 km." },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(60),
  cover: "outdoor-cycling-placeholder",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const sutlegenKemerkoyBisiklet: DragomanEvent = {
  id: "sutlegen-kemerkoy-bisiklet",
  category: "outdoor",
  subgroup: "doga-bisiklet",
  order: 3,
  slug: { tr: "sutlegen-kemerkoy-bisiklet-turu", en: "sutlegen-kemerkoy-bike-tour", fr: "velo-sutlegen-kemerkoy", de: "radtour-sutlegen-kemerkoy" },
  title: { tr: "Sütleğen – Kemerköy Bisiklet Turu", en: "Sütleğen – Kemerköy Bike Tour", fr: "Vélo Sütleğen – Kemerköy" },
  summary: {
    tr: "Beldibi'nden 1478 metreye, sedir ormanları ve yörük köyleri arasından 36 km'lik bisiklet günü.",
    en: "A 36 km cycling day from Beldibi up to 1478 metres through cedar forests and nomad villages.",
    fr: "Une journée de vélo de 36 km, de Beldibi jusqu'à 1478 mètres, à travers forêts de cèdres et villages nomades.",
  },
  body: {
    tr: [
      { type: "p", text: "Kıbrıs Kanyonu Özel Koruma Alanı'na paralel uzanan yol, yüksekliği sayesinde size göz kamaştırıcı bir manzara sunacak. Rota, Beldibi köyünde 1200 metreden başlar ve sedir ormanları ile yörük köylerinden geçerek Katran dağ ve orman yolunu takip edip 1478 metreye kadar çıkar." },
      { type: "p", text: "Kızılkaya köyüne ulaştıktan sonra, sizi öğle yemeği noktanız olan Kemer vadisine götürecek muhteşem bir iniş bölümü başlar. Öğle yemeğinizin ardından pedal çevirmeye devam etmek isterseniz tur, bağlantı yolları üzerinden uzatılabilir." },
      { type: "p", text: "Toplam mesafe: 36 km." },
    ],
    en: [
      { type: "p", text: "The road parallel to the Specially Protected Area of Cyprus Canyon will offer you a ravishing view with its height. The route starts at 1200 metres in Beldibi village and goes up to 1478 metres, following the Katran mountain and forest road through cedar forests and nomad villages." },
      { type: "p", text: "After reaching Kızılkaya village, a splendid downhill part takes you to your lunch place in Kemer valley. After lunch, if you wish to continue cycling, the tour can be extended following access roads." },
      { type: "p", text: "Total distance: 36 km." },
    ],
    fr: [
      { type: "p", text: "La route longeant la zone spécialement protégée du canyon de Chypre vous offrira une vue époustouflante en altitude. L'itinéraire débute à 1200 mètres dans le village de Beldibi et monte jusqu'à 1478 mètres en suivant la route de la montagne et de la forêt de Katran, à travers les forêts de cèdres et les villages nomades." },
      { type: "p", text: "Après avoir atteint le village de Kızılkaya, une splendide descente vous conduira à votre lieu de déjeuner dans la vallée de Kemer. Après le déjeuner, si vous souhaitez continuer à faire du vélo, le circuit peut être prolongé en suivant des routes d'accès." },
      { type: "p", text: "Distance totale : 36 km." },
    ],
  },
  priceDisplay: "numeric",
  options: perPerson(60),
  cover: "outdoor-cycling-placeholder",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const likyaYollari: DragomanEvent = {
  id: "likya-yollari",
  category: "outdoor",
  subgroup: "doga-bisiklet",
  order: 4,
  slug: { tr: "likya-yollari-bisiklet-turu", en: "lycian-lanes-bike-tour", fr: "voies-lyciennes-velo", de: "lykische-pfade-radtour" },
  title: { tr: "Likya Yolları Bisiklet Turu", en: "Lycian Lanes Bike Tour", fr: "Voies lyciennes à vélo" },
  summary: {
    tr: "Elmalı'dan Kaş'a göller, yaylalar ve sedir ormanları boyunca 8 günlük bisiklet turu.",
    en: "An 8-day bike tour from Elmalı to Kaş past lakes, high plateaus and cedar forests.",
    fr: "Un circuit à vélo de 8 jours d'Elmalı à Kaş, entre lacs, hauts plateaux et forêts de cèdres.",
  },
  body: {
    tr: [
      { type: "p", text: "Likya Yolları, Anadolu Aleviliğinin en önemli merkezlerinden biri olan Elmalı kasabasından başlayan 5 günlük bir bisiklet turu sunar." },
      { type: "p", text: "Birkaç gün boyunca masmavi göllerin yanında, yüksek yaylalarda, arka planda karlı dağlarla pedal çevirip ardından ardıç, çam ve köknar ağaçlarıyla kaplı sedir ormanlarına doğru inişe geçersiniz. Kaş'a yaklaştığınızda ise ufukta Akdeniz'in nefes kesen manzarası belirir." },
      { type: "ul", items: ["Süre: 7 gece 8 gün"] },
    ],
    en: [
      { type: "p", text: "Lycian Lanes offers you 5 days of cycling starting from Elmalı town, one of the most significant centres of Anatolian Alevis." },
      { type: "p", text: "You pedal for a few days next to deep blue lakes and across high plateaus with snowy mountains in the background, then go downhill towards cedar forests with pine and fir trees. When you get close to Kaş, the breathtaking view of the Mediterranean appears on the horizon." },
      { type: "ul", items: ["Duration: 7 nights, 8 days"] },
    ],
    fr: [
      { type: "p", text: "Lycian Lanes vous propose 5 jours de vélo au départ de la ville d'Elmalı, l'un des centres les plus importants des Alévis anatoliens." },
      { type: "p", text: "Vous pédalerez plusieurs jours à côté de lacs d'un bleu profond, sur des hauts plateaux avec des montagnes enneigées en arrière-plan, puis descendrez vers les forêts de cèdres, de pins et de sapins. En approchant de Kaş, la vue à couper le souffle sur la Méditerranée se dévoile à l'horizon." },
      { type: "ul", items: ["Durée : 7 nuits, 8 jours"] },
    ],
  },
  duration: { tr: "8 gün / 7 gece", en: "8 days / 7 nights", fr: "8 jours / 7 nuits" },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-cycling-placeholder",
  gallery: [],
  conditions: weeklyTourConditions,
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

const elmaliArikandaKulturTuru: DragomanEvent = {
  id: "elmali-arikanda-kultur-turu",
  category: "outdoor",
  subgroup: "doga-kultur",
  order: 2,
  slug: { tr: "elmali-arikanda-kultur-turu", en: "elmali-arikanda-culture-tour", fr: "circuit-culturel-elmali-arikanda", de: "kulturtour-elmali-arikanda" },
  title: { tr: "Elmalı ve Arikanda Kültür Turu", en: "Elmalı and Arikanda Culture Tour", fr: "Circuit culturel Elmalı et Arikanda" },
  summary: {
    tr: "Antik Arikanda, Alvan Gölü ve yüzlerce yıllık ardıç ormanları arasında bir Likya turu.",
    en: "A Lycian tour through ancient Arikanda, Lake Alvan and centuries-old juniper forests.",
    fr: "Un circuit lycien à travers l'antique Arikanda, le lac Alvan et des forêts de genévriers centenaires.",
  },
  body: {
    tr: [
      { type: "p", text: "Bu tur, antik Likya'nın güzelliklerini ve yüzlerce yıllık ardıç ağaçları ormanlarının manzaralarını bir araya getirir. Homeros, Likya'yı denizi yedi farklı renge sahip bir ülke olarak tanımlar." },
      { type: "p", text: "Likya'nın dik kayalıkları yanında konumlanmış görkemli Arikanda kenti, diğer Luv yerleşimleri arasında önemli bir yerleşimdir. Sedir ağaçları, zengin bitki örtüsü, kuş çeşitliliği ve Alvan Gölü, bölgenin doğal güzelliklerinden sadece birkaçıdır. Abdal Musa türbesi, Ömer Paşa Camii ve Yıkık Camii ise tarihin nispeten daha yakın tanıklarıdır." },
    ],
    en: [
      { type: "p", text: "This tour combines the beauties of ancient Lycia with panoramas over hundred-year-old juniper forests. Homer describes Lycia as the country whose sea has seven different colours." },
      { type: "p", text: "The glorious city of Arikanda, located by the very steep rocks of Lycia, is a significant settlement among the other Luvian settlements. Cedar trees, rich vegetation, bird diversity and Lake Alvan are just some of the natural beauties of the region. The shrine of Abdal Musa, the Ömer Pasha mosque and the Broken Mosque are some of the relatively recent witnesses of history." },
    ],
    fr: [
      { type: "p", text: "Cette excursion allie les beautés de l'ancienne Lycie aux panoramas sur des forêts de genévriers centenaires. Homère décrit la Lycie comme le pays dont la mer possède sept couleurs différentes." },
      { type: "p", text: "La glorieuse cité d'Arikanda, située au pied des falaises escarpées de Lycie, est un site important parmi les autres établissements luvites. Les cèdres, la végétation riche, la diversité des oiseaux et le lac Alvan comptent parmi les merveilles naturelles de la région. Le sanctuaire d'Abdal Musa, la mosquée Ömer Pacha et la mosquée Brisée sont quelques-uns des témoins historiques relativement récents." },
    ],
  },
  priceDisplay: "on_request",
  options: [],
  cover: "outdoor-culture-1",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "outdoor",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: outdoorPages,
}

export const outdoorEvents: DragomanEvent[] = [
  dogayaDonus,
  isikUlkesi,
  felenKasYuruyusu,
  ufakdereKas,
  kuruovaSusuzDag,
  likyaKonforu,
  kekovaMacerasi,
  sarilarBelenliBisiklet,
  gursuDirgenlerBisiklet,
  sutlegenKemerkoyBisiklet,
  likyaYollari,
  kiyiTirmanisi,
  kasKekovaTekneTuru,
  myraDemreKulturTuru,
  elmaliArikandaKulturTuru,
  ozelTurlar,
]
