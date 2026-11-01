import type { Block, Product } from '../schema'

type Localized<T> = { tr: T; en: T; fr: T; de: T }

const tropicalGallery = ["book-tropical-spread-1", "book-tropical-spread-2", "book-tropical-spread-3", "book-tropical-spread-4"]

/** The same book text is used for all three Tropical Mediterranean editions. */
const tropicalBody: Localized<Block[]> = {
  tr: [
    { type: "p", text: "Akdeniz, bazıları hızla istilacı hale gelen göçmen türlerin etkisini tam anlamıyla yaşamaktadır. Özellikle Doğu Akdeniz, Süveyş Kanalı yoluyla gelen bu türlerden doğrudan etkilenmektedir. Lesepsiyen göçü denen bu olgunun deniz biyolojik çeşitliliği üzerindeki etkilerini hem hayranlık hem de endişeyle yakından gözlemliyoruz." },
    { type: "p", text: "Bu kitap bilimsellik ya da bütünlük iddiasından çok estetik bir yaklaşımla, 2000 ile 2024 yılları arasında Kaş bölgesinde gözlemlenen egzotik deniz türlerini sunuyor. İlk baskısı “Akdeniz'de Kızıldeniz – Red Sea in the Med” adını taşıyan bu ikinci genişletilmiş baskıda 76 tür, 200'den fazla fotoğraf ve kısa yorumlarla anlatılıyor; karekodlarla erişilebilen 31 amatör video da eklendi." },
  ],
  en: [
    { type: "p", text: "The Mediterranean is experiencing the full impact of exotic species, some of which are rapidly becoming invasive. At the forefront, the Eastern Mediterranean is directly affected by species arriving through the Suez Canal, a phenomenon known as Lessepsian migration. We closely observe its effects on marine biodiversity, torn between fascination and concern." },
    { type: "p", text: "This book does not claim to be scientific or exhaustive. It offers an aesthetic approach based on observations of exotic marine species in the Kaş region between 2000 and 2024. In this second expanded edition (the first edition was called “Red Sea in the Med”), 76 species are presented through more than 200 photographs with concise commentary, plus 31 amateur videos accessible via QR codes." },
  ],
  fr: [
    { type: "p", text: "La Méditerranée subit de plein fouet l'impact des espèces exotiques, dont certaines deviennent rapidement invasives. En première ligne, la Méditerranée orientale est directement affectée par les espèces venues par le canal de Suez, un phénomène connu sous le nom de migration lessepsienne. Nous en observons les effets sur la biodiversité marine, partagés entre fascination et inquiétude." },
    { type: "p", text: "Ce livre n'a pas la prétention d'être un ouvrage scientifique ou exhaustif. Il propose une approche esthétique, à travers des observations d'espèces marines exotiques dans la région de Kaş entre 2000 et 2024. Dans cette 2e édition augmentée (la première s'intitulait « Red Sea in the Med »), 76 espèces sont présentées au fil de plus de 200 photos accompagnées de commentaires concis, ainsi que 31 vidéos amateurs accessibles par codes QR." },
  ],
  de: [
    { type: "p", text: "Das Mittelmeer erlebt die volle Wirkung eingewanderter Arten, von denen manche rasch invasiv werden. Besonders das östliche Mittelmeer ist direkt von Arten betroffen, die durch den Suezkanal kommen, ein Phänomen, das als lessepsische Migration bekannt ist. Wir beobachten seine Folgen für die marine Artenvielfalt mit Faszination und Sorge zugleich." },
    { type: "p", text: "Dieses Buch erhebt keinen Anspruch auf Wissenschaftlichkeit oder Vollständigkeit. Es zeigt in ästhetischer Herangehensweise exotische Meeresarten, die zwischen 2000 und 2024 in der Region Kaş beobachtet wurden. In dieser zweiten, erweiterten Auflage (die erste hieß „Red Sea in the Med“) werden 76 Arten mit mehr als 200 Fotos und kurzen Kommentaren vorgestellt, dazu 31 Amateurvideos über QR-Codes." },
  ],
}

const tropicalSummary: Localized<string> = {
  tr: "Kaş'ta 2000–2024 arasında gözlemlenen, Kızıldeniz'den gelen 76 egzotik deniz türü.",
  en: "76 exotic marine species from the Red Sea, observed in Kaş between 2000 and 2024.",
  fr: "76 espèces marines exotiques venues de la mer Rouge, observées à Kaş entre 2000 et 2024.",
  de: "76 exotische Meeresarten aus dem Roten Meer, beobachtet in Kaş zwischen 2000 und 2024.",
}

const tropicalRefs = (...refs: string[]): string[] => ["products.csv", ...refs]

export const products: Product[] = [
  {
    id: "the-diving-guide-kas",
    slug: { tr: "dalis-rehberi-kas", en: "the-diving-guide-kas", fr: "guide-de-plongee-kas", de: "tauchfuehrer-kas" },
    order: 1,
    title: { tr: "Dalış Rehberi – Kaş", en: "The Diving Guide – Kaş", fr: "The Diving Guide – Kaş", de: "The Diving Guide – Kaş" },
    edition: {
      tr: "Genişletilmiş 3. baskı, 5 dilde",
      en: "Expanded 3rd edition, in 5 languages",
      fr: "3e édition augmentée, en 5 langues",
      de: "Erweiterte 3. Auflage, in 5 Sprachen",
    },
    summary: {
      tr: "Kaş dalış noktalarının ayrıntılı sualtı haritaları ve 307 canlı türü, 352 sayfada.",
      en: "Detailed underwater maps of the Kaş dive sites and 307 species, on 352 pages.",
      fr: "Cartes sous-marines détaillées des sites de Kaş et 307 espèces, sur 352 pages.",
      de: "Detaillierte Unterwasserkarten der Tauchplätze von Kaş und 307 Arten auf 352 Seiten.",
    },
    body: {
      tr: [
        { type: "p", text: "Dragoman ekibi olarak yıllardır dalışlarımızda aldığımız topografik notlardan sualtı haritalarını yeniden derledik ve eksikleri tamamladık. Kitabın başındaki bölümler bölgenin özelliklerini ve fauna ile flora üzerindeki baskıları özetliyor; biyolojik çeşitliliği yansıtmak için fotoğraflayabildiğimiz her canlıya yer verdik." },
        { type: "p", text: "Genişletilmiş 3. baskıda 2. baskıdaki 200 sayfadan 352 sayfaya, 429 fotoğraftan 715 fotoğrafa, 200 canlı türünden 307'ye ulaştık. Türkçe, İngilizce, Fransızca ve Almanca'nın ardından 5. dil olarak Rusça eklendi. 2012'den sonra batırılan iki yeni batık, Tank ve Altuğ teknesi de haritalara işlendi." },
        { type: "p", text: "Haritalardan yararlanan dalıcılar lütfen onları tek referans olarak almasın ve dalış rehberlerine güvensin." },
      ],
      en: [
        { type: "p", text: "Accessible only by boat even in the fifties, Kaş has remained one of the unspoilt corners of the Mediterranean. The book brings together underwater maps compiled from the Dragoman team's topographic notes over years of diving, an introduction to the area and the pressures on its fauna and flora, and photographs of the species we have been able to document." },
        { type: "p", text: "The expanded 3rd edition grows from 200 to 352 pages, from 429 to 715 photographs and from 200 to 307 species. After Turkish, English, French and German, Russian has been added as a fifth language. Two new wrecks sunk after 2012, the Tank and the Altuğ boat, are now on the maps." },
        { type: "p", text: "Divers using the maps should not take them as their only reference and should trust their dive guides." },
      ],
      fr: [
        { type: "p", text: "Ce guide réunit les cartes sous-marines établies à partir des notes topographiques prises par l'équipe Dragoman au fil des années de plongée, une présentation de la région et des pressions qui pèsent sur sa faune et sa flore, et les photos des espèces que nous avons pu documenter." },
        { type: "p", text: "La 3e édition augmentée passe de 200 à 352 pages, de 429 à 715 photos et de 200 à 307 espèces. Après le turc, l'anglais, le français et l'allemand, le russe a été ajouté comme cinquième langue. Deux nouvelles épaves coulées après 2012, le Tank et le bateau Altuğ, figurent désormais sur les cartes." },
        { type: "p", text: "Les plongeurs qui utilisent les cartes ne doivent pas en faire leur seule référence et doivent faire confiance à leurs guides." },
      ],
      de: [
        { type: "p", text: "Der Führer vereint Unterwasserkarten, die das Dragoman-Team über Jahre aus topografischen Notizen bei seinen Tauchgängen zusammengestellt hat, eine Einführung in die Region und den Druck auf ihre Tier- und Pflanzenwelt sowie Fotos aller Arten, die wir dokumentieren konnten." },
        { type: "p", text: "Die erweiterte 3. Auflage wächst von 200 auf 352 Seiten, von 429 auf 715 Fotos und von 200 auf 307 Arten. Nach Türkisch, Englisch, Französisch und Deutsch kam Russisch als fünfte Sprache hinzu. Zwei nach 2012 versenkte Wracks, der Panzer und das Boot Altuğ, sind jetzt auf den Karten eingetragen." },
        { type: "p", text: "Wer die Karten nutzt, sollte sie nicht als einzige Grundlage nehmen und sich auf seine Tauchguides verlassen." },
      ],
    },
    price: 30,
    currency: "EUR",
    priceVerified: false,
    cover: "book-diving-guide-kas",
    gallery: ["diving-turtle-2", "diving-sea-urchin-1", "dive-sites-kas-map-1"],
    status: "published",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "mockup", de: "mockup" },
    sourceRefs: ["https://dragoman-turkey.com/tr/urun/dalis-rehberi-kas/", "https://dragoman-turkey.com/product/the-diving-guide-kas/", "165", "15"],
  },
  {
    id: "tropical-mediterranean-english",
    slug: { tr: "tropikal-akdeniz-ingilizce", en: "tropical-mediterranean-english", fr: "mediterranee-tropicale-anglais", de: "tropisches-mittelmeer-englisch" },
    order: 2,
    title: { tr: "Tropical Mediterranean", en: "Tropical Mediterranean", fr: "Tropical Mediterranean", de: "Tropical Mediterranean" },
    edition: { tr: "İngilizce baskı", en: "English edition", fr: "Édition anglaise", de: "Englische Ausgabe" },
    summary: tropicalSummary,
    body: tropicalBody,
    price: 39,
    currency: "EUR",
    priceVerified: false,
    cover: "book-tropical-mediterranean-en",
    gallery: tropicalGallery,
    status: "published",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: tropicalRefs("https://dragoman-turkey.com/tr/urun/tropikal-akdeniz-ingilizce/", "https://dragoman-turkey.com/product/tropical-mediterranean-english/", "162", "41", "995"),
  },
  {
    id: "tropical-mediterranean-turkish",
    slug: { tr: "tropikal-akdeniz-turkce", en: "tropical-mediterranean-turkish", fr: "mediterranee-tropicale-turc", de: "tropisches-mittelmeer-tuerkisch" },
    order: 3,
    title: { tr: "Tropikal Akdeniz", en: "Tropikal Akdeniz", fr: "Tropikal Akdeniz", de: "Tropikal Akdeniz" },
    edition: { tr: "Türkçe baskı", en: "Turkish edition", fr: "Édition turque", de: "Türkische Ausgabe" },
    summary: tropicalSummary,
    body: tropicalBody,
    price: 39,
    currency: "EUR",
    priceVerified: false,
    cover: "book-tropical-mediterranean-tr",
    gallery: tropicalGallery,
    status: "published",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: tropicalRefs("https://dragoman-turkey.com/tr/urun/tropikal-akdeniz-turkce/", "https://dragoman-turkey.com/product/tropical-mediterranean-turkish/", "166", "126", "994"),
  },
  {
    id: "tropical-mediterranean-french",
    slug: { tr: "tropikal-akdeniz-fransizca", en: "tropical-mediterranean-french", fr: "mediterranee-tropicale-francais", de: "tropisches-mittelmeer-franzoesisch" },
    order: 4,
    title: { tr: "Méditerranée tropicale", en: "Méditerranée tropicale", fr: "Méditerranée tropicale", de: "Méditerranée tropicale" },
    edition: { tr: "Fransızca baskı", en: "French edition", fr: "Édition française", de: "Französische Ausgabe" },
    summary: tropicalSummary,
    body: tropicalBody,
    price: 39,
    currency: "EUR",
    priceVerified: false,
    cover: "book-tropical-mediterranean-fr",
    gallery: tropicalGallery,
    status: "published",
    origin: "cloner",
    translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
    sourceRefs: tropicalRefs("https://dragoman-turkey.com/tr/urun/tropikal-akdeniz-fransizca/", "https://dragoman-turkey.com/product/tropical-mediterranean-french/", "164", "158", "993"),
  },
]
