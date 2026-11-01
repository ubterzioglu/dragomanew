import type { CategoryPage } from '../schema'

export const categoryPages: CategoryPage[] = [
  {
    key: "diving",
    cover: "cover-diving",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: ["https://dragoman-turkey.com/tr/diving/", "https://dragoman-turkey.com/diving/", "https://dragoman-turkey.com/fr/plongee/"],
    intro: {
      tr: [
        { type: "p", text: "Kaş'ta her seviyeye uygun 30'un üzerinde dalış noktası; modern batıklar, antik amforalar ve çapalar, geniş sualtı mağaraları, kayalık bankolar, duvarlar ve deniz çayırları sunuyor. Kaş-Kekova Özel Deniz Koruma Alanı'nın zengin sualtı yaşamı, Kızıldeniz'den gelen lesepsiyen türlerle daha da zenginleşiyor." },
        { type: "p", text: "Mükemmel görüş mesafesi ve 19 °C (Ocak) ile 29 °C (Ağustos) arasındaki su sıcaklıklarıyla burada 12 ay dalış yapılabiliyor." },
      ],
      en: [
        { type: "p", text: "Kaş offers over 30 dive spots that suit all levels, with modern wrecks, amphorae and anchors from ancient civilizations, rocky reefs, canyons, large caves and sea-grass meadows. The Mediterranean life of the Kaş-Kekova Marine Protected Area is further enriched by lessepsian species migrating from the Red Sea." },
        { type: "p", text: "Excellent underwater visibility and water temperatures between 19 °C (January) and 29 °C (August) make diving possible all year round." },
      ],
      fr: [
        { type: "p", text: "Kaş compte plus de 30 sites de plongée convenant à tous les niveaux : épaves anciennes et modernes, amphores, ancres, secs rocheux, canyons, grandes grottes et herbiers. La faune et la flore de l'Aire Marine Protégée de Kaş-Kekova s'enrichissent d'espèces lessepsiennes venues de la mer Rouge." },
        { type: "p", text: "Une excellente visibilité et une eau entre 19 °C (janvier) et 29 °C (août) permettent de plonger toute l'année." },
      ],
      de: [
        { type: "p", text: "Kaş bietet über 30 Tauchplätze für alle Erfahrungsstufen: moderne Wracks, antike Amphoren und Anker, felsige Riffe, Canyons, große Höhlen und Seegraswiesen. Das Unterwasserleben des Meeresschutzgebiets Kaş-Kekova wird durch lessepsische Arten aus dem Roten Meer zusätzlich bereichert." },
        { type: "p", text: "Dank ausgezeichneter Sicht und Wassertemperaturen zwischen 19 °C (Januar) und 29 °C (August) kann hier das ganze Jahr über getaucht werden." },
      ],
    },
  },
  {
    key: "seaKayak",
    cover: "cover-sea-kayak",
    origin: "kayak-site",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: ["https://dragomanseakayak.com/tr/"],
    intro: {
      tr: [
        { type: "p", text: "Batık şehir üzerinde kürek çekin, saklı koylarda yüzün, Likya kıyısının güzelliğini deniz kayağıyla keşfedin. Sakin koylardan açık deniz rotalarına kadar her seviyeye uygun seçenekler var." },
        { type: "p", text: "Turlarımızı Türkiye Kano Federasyonu lisanslı rehberler yönetir; rota, hava ve deniz koşulları her tur öncesinde değerlendirilir." },
      ],
      en: [
        { type: "p", text: "Paddle over the sunken city, swim in hidden coves and discover the beauty of the Lycian coast by sea kayak. There are options for every level, from calm bays to open-water routes." },
        { type: "p", text: "Our tours are led by guides licensed by the Turkish Canoe Federation; the route, weather and sea conditions are assessed before every tour." },
      ],
      fr: [
        { type: "p", text: "Pagayez au-dessus de la cité engloutie, baignez-vous dans des criques cachées et découvrez la côte lycienne en kayak de mer. Des baies calmes aux itinéraires en pleine mer, il y a une option pour chaque niveau." },
        { type: "p", text: "Nos sorties sont encadrées par des guides diplômés de la Fédération turque de canoë-kayak ; l'itinéraire, la météo et l'état de la mer sont évalués avant chaque sortie." },
      ],
      de: [
        { type: "p", text: "Paddeln Sie über die versunkene Stadt, schwimmen Sie in versteckten Buchten und entdecken Sie die lykische Küste im Seekajak. Von ruhigen Buchten bis zu Routen auf offenem Wasser gibt es Angebote für jedes Niveau." },
        { type: "p", text: "Unsere Touren werden von Guides mit Lizenz des Türkischen Kanuverbands geführt; Route, Wetter und Seegang werden vor jeder Tour geprüft." },
      ],
    },
  },
  {
    key: "outdoor",
    cover: "cover-outdoor",
    origin: "cloner",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: ["https://dragoman-turkey.com/tr/doga-etkinlikleri/"],
    intro: {
      tr: [
        { type: "p", text: "Yürüyüşten kıyı traversine, bisikletten tekne turlarına tüm doğa etkinliklerimiz sizi ışık ülkesi Likya'nın sırlarını keşfetmeye bir adım yaklaştırıyor. Denizin turkuazı, dağların sedir ormanları ya da kıyıda unutulmuş kadim Likya yerleşimleri; 7'den 70'e herkes için keşfedecek bir şey var." },
      ],
      en: [
        { type: "p", text: "From hiking to coasteering, from cycling to boat trips, all of our outdoor activities bring you one step closer to the secrets of Lycia, the land of light. The turquoise sea, the cedar forests of the mountains or forgotten Lycian settlements on the coast: there is something to discover for everyone from 7 to 70." },
      ],
      fr: [
        { type: "p", text: "De la randonnée au coasteering, du vélo aux sorties en bateau, toutes nos activités de plein air vous rapprochent des secrets de la Lycie, la terre de lumière. Le turquoise de la mer, les forêts de cèdres des montagnes ou les cités lyciennes oubliées sur la côte : il y a de quoi découvrir pour tous, de 7 à 70 ans." },
      ],
      de: [
        { type: "p", text: "Vom Wandern bis zum Coasteering, vom Radfahren bis zu Bootsausflügen: Alle unsere Outdoor-Aktivitäten bringen Sie den Geheimnissen Lykiens, des Landes des Lichts, ein Stück näher. Das Türkis des Meeres, die Zedernwälder der Berge oder vergessene lykische Siedlungen an der Küste: Für alle von 7 bis 70 gibt es etwas zu entdecken." },
      ],
    },
  },
  {
    key: "transport",
    cover: "kas-town-view-1",
    origin: "cloner",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: ["https://dragoman-turkey.com/tr/ulasim-konaklama/"],
    intro: {
      tr: [
        { type: "p", text: "Dalaman ve Antalya havalimanlarından Kaş'a transferlerinizi ayarlıyor, önerdiğimiz otel ve pansiyonlarda konaklamanızı planlıyoruz. Güncel fiyat ve müsaitlik için lütfen bize yazın." },
      ],
      en: [
        { type: "p", text: "We arrange your transfers to Kaş from Dalaman and Antalya airports and plan your stay at the hotels and guesthouses we recommend. Please write to us for current prices and availability." },
      ],
      fr: [
        { type: "p", text: "Nous organisons vos transferts vers Kaş depuis les aéroports de Dalaman et d'Antalya, et votre séjour dans les hôtels et pensions que nous recommandons. Écrivez-nous pour les tarifs et disponibilités à jour." },
      ],
      de: [
        { type: "p", text: "Wir organisieren Ihre Transfers nach Kaş von den Flughäfen Dalaman und Antalya und planen Ihren Aufenthalt in den Hotels und Pensionen, die wir empfehlen. Schreiben Sie uns für aktuelle Preise und Verfügbarkeit." },
      ],
    },
  },
  {
    key: "shop",
    cover: "book-tropical-spread-1",
    origin: "mockup",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: ["https://dragoman-turkey.com/tr/dukkan/"],
    intro: {
      tr: [
        { type: "p", text: "Kaş sualtını belgeleyen kitaplarımız: Kaş dalış noktalarının haritalarıyla Dalış Rehberi – Kaş ve Kızıldeniz'den gelen türleri anlatan Tropikal Akdeniz." },
      ],
      en: [
        { type: "p", text: "Our books documenting the underwater world of Kaş: The Diving Guide – Kaş with maps of the local dive sites, and Tropical Mediterranean on the species arriving from the Red Sea." },
      ],
      fr: [
        { type: "p", text: "Nos livres consacrés au monde sous-marin de Kaş : The Diving Guide – Kaş, avec les cartes des sites de plongée, et Méditerranée tropicale, sur les espèces venues de la mer Rouge." },
      ],
      de: [
        { type: "p", text: "Unsere Bücher über die Unterwasserwelt von Kaş: The Diving Guide – Kaş mit Karten der Tauchplätze und Tropical Mediterranean über die Arten, die aus dem Roten Meer einwandern." },
      ],
    },
  },
]
