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

export const outdoorEvents: DragomanEvent[] = [
  dogayaDonus,
  felenKasYuruyusu,
  sarilarBelenliBisiklet,
  kiyiTirmanisi,
  kasKekovaTekneTuru,
  myraDemreKulturTuru,
  ozelTurlar,
]
