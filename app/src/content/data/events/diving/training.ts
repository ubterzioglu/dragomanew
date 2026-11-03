import type { DragomanEvent } from '../../../schema'

const sourcePages = ["https://dragoman-turkey.com/tr/diving/", "https://dragoman-turkey.com/diving/", "https://dragoman-turkey.com/fr/plongee/"]

export const denemeDalisi: DragomanEvent = {
  id: "deneme-dalisi",
  category: "diving",
  subgroup: "dalis-deneme",
  order: 1,
  slug: { tr: "deneme-dalisi", en: "try-dive", fr: "bapteme-de-plongee", de: "schnuppertauchen" },
  title: { tr: "Deneme Dalışı", en: "Try Dive", fr: "Baptême de plongée", de: "Schnuppertauchen" },
  summary: {
    tr: "Hiç dalmamış olanlar için Kaş'ın berrak sularında eğitmenle birebir ilk dalış.",
    en: "A first one-to-one dive with an instructor in the clear waters of Kaş, for absolute beginners.",
    fr: "Une première plongée en tête-à-tête avec un moniteur dans les eaux limpides de Kaş, pour les vrais débutants.",
    de: "Ein erster Tauchgang allein mit einem Tauchlehrer im klaren Wasser von Kaş, für absolute Anfänger.",
  },
  body: {
    tr: [
      { type: "p", text: "Kaş'ın turkuaz derinliklerinde ilk geçiş için en elverişli şartlar bir araya gelmiştir: su sıcak ve berrak, dalış yerleri güvenli ve sakindir. Kısa bir brifingde eğitmen temel güvenlik ve sualtına uyum bilgilerini ve becerilerini özetler, Akdeniz'in fauna ve florasını tanıtır." },
      { type: "p", text: "Ardından uzman bir eğitmen veya dalış lideri eşliğinde en fazla 5 metreye birebir yaklaşık yirmi dakikalık bir dalış yaparsınız. İlk dalışınızı ölümsüzleştirecek bir deneme dalışı sertifikası da verilir. İki deneme dalışı yapanlar iki farklı noktada dalar." },
    ],
    en: [
      { type: "p", text: "A chance to discover the underwater world for absolute beginners: the water in Kaş is warm and clear and the dive spots are safe and calm. You first take a briefing introducing the diving techniques that help you adapt to the underwater world and to SCUBA equipment, and presenting Mediterranean fauna and flora." },
      { type: "p", text: "You are then taken on a dive of about 20 minutes, one-to-one with an instructor, to a maximum of 5 metres. A try-dive certificate from our dive centre immortalises the experience. Those who do a double try dive will dive at two different spots." },
    ],
    fr: [
      { type: "p", text: "Pour le vrai débutant, une petite escapade dans les eaux turquoise qui vous fera découvrir les plaisirs du monde sous-marin : l'eau est chaude et limpide, les sites sûrs et calmes. Un briefing récapitule les techniques d'adaptation au milieu subaquatique, l'équipement de plongée et la faune et la flore méditerranéennes." },
      { type: "p", text: "Vous êtes ensuite accompagné, en tête-à-tête par un moniteur, lors d'une plongée d'une vingtaine de minutes à 5 mètres de profondeur maximum. Un certificat de baptême immortalise cette expérience. Le double baptême se fait sur deux sites différents." },
    ],
    de: [
      { type: "p", text: "Für den allerersten Abstieg bietet Kaş ideale Bedingungen: Das Wasser ist warm und klar, die Tauchplätze sind sicher und ruhig. In einer kurzen Einweisung erklärt der Tauchlehrer die wichtigsten Sicherheits- und Anpassungstechniken unter Wasser und stellt die Tier- und Pflanzenwelt des Mittelmeers vor." },
      { type: "p", text: "Danach tauchen Sie etwa zwanzig Minuten allein mit einem Tauchlehrer oder Divemaster bis maximal 5 Meter Tiefe. Ein Schnuppertauch-Zertifikat hält Ihren ersten Tauchgang fest. Wer zwei Schnuppertauchgänge bucht, taucht an zwei verschiedenen Plätzen." },
    ],
  },
  duration: { tr: "Yaklaşık 20 dakikalık dalış", en: "A dive of about 20 minutes", fr: "Une plongée d'environ 20 minutes", de: "Ein Tauchgang von etwa 20 Minuten" },
  priceDisplay: "numeric",
  options: [
    { id: "tek-deneme", name: { tr: "Deneme dalışı", en: "Try dive", fr: "Baptême", de: "Schnuppertauchgang" }, price: 50, currency: "EUR", basis: "person" },
    { id: "iki-deneme", name: { tr: "İki deneme dalışı", en: "Double try dive", fr: "Double baptême", de: "Zwei Schnuppertauchgänge" }, price: 90, currency: "EUR", basis: "person" },
  ],
  cover: "diving-try-dive-1",
  gallery: ["diving-turtle-2", "cover-diving"],
  includes: {
    tr: ["Eğitmenle birebir dalış", "Brifing", "Deneme dalışı sertifikası"],
    en: ["One-to-one dive with an instructor", "Briefing", "Try-dive certificate"],
    fr: ["Plongée en tête-à-tête avec un moniteur", "Briefing", "Certificat de baptême"],
    de: ["Tauchgang allein mit dem Tauchlehrer", "Einweisung", "Schnuppertauch-Zertifikat"],
  },
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: true,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: sourcePages,
}

export const beceriTazeleme: DragomanEvent = {
  id: "beceri-tazeleme",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 1,
  slug: { tr: "beceri-tazeleme-dalisi", en: "scuba-skills-update", fr: "plongees-de-rappel", de: "tauchauffrischung" },
  title: { tr: "Beceri Tazeleme Dalışı", en: "Scuba Skills Update", fr: "Plongées de rappel", de: "Tauch-Auffrischung" },
  summary: {
    tr: "Uzun aradan sonra ya da yeni sertifikayla, gruplara katılmadan önce 2 dalışlık tazeleme.",
    en: "Two refresher dives before joining the groups, after a long break or with a brand-new certificate.",
    fr: "Deux plongées de rappel avant de rejoindre les groupes, après une longue pause ou un tout nouveau brevet.",
    de: "Zwei Auffrischungstauchgänge vor dem Einstieg in die Gruppen, nach langer Pause oder mit frischem Brevet.",
  },
  body: {
    tr: [
      { type: "p", text: "Beceri tazeleme dalışı, ilk dalış sertifikasını yeni almış ve/veya uzun zamandır dalmamış olanların dalış gruplarına katılmadan önce eğitmen veya dalış lideri eşliğinde özet bilgi tekrarı yaptığı ve bazı önemli becerileri uyguladığı 2 dalışlık (1 günlük) bir programdır." },
    ],
    en: [
      { type: "p", text: "The scuba skills update is for those who have just got their first diver's certificate and/or want a refresher after a long period without diving. You are given a concise theoretical review and two dives with a dive professional during which essential practical skills are practised, before you join the dive groups. It is a one-day programme." },
    ],
    fr: [
      { type: "p", text: "Pour ceux qui désirent un petit rappel après une longue période sans plongée, ou qui viennent d'obtenir leur premier brevet : une courte révision théorique et 2 plongées avec un dive-master ou un moniteur, pendant lesquelles quelques exercices essentiels sont exécutés, avant de rejoindre les palanquées. Le programme se déroule sur une journée." },
    ],
    de: [
      { type: "p", text: "Die Tauch-Auffrischung richtet sich an alle, die gerade ihr erstes Brevet erhalten haben oder lange nicht getaucht sind. Vor dem Einstieg in die Tauchgruppen wiederholen Sie mit einem Tauchlehrer oder Divemaster kurz die Theorie und üben in zwei Tauchgängen (an einem Tag) wichtige Fertigkeiten." },
    ],
  },
  duration: { tr: "1 gün · 2 dalış", en: "1 day · 2 dives", fr: "1 jour · 2 plongées", de: "1 Tag · 2 Tauchgänge" },
  priceDisplay: "numeric",
  options: [
    { id: "iki-dalis", name: { tr: "2 dalışlık program", en: "2-dive programme", fr: "Programme de 2 plongées", de: "Programm mit 2 Tauchgängen" }, price: 120, currency: "EUR", basis: "person" },
  ],
  cover: "boat-dragoman-1",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner", de: "mockup" },
  sourceRefs: sourcePages,
}

export const ssiOpenWaterDiver: DragomanEvent = {
  id: "ssi-open-water-diver",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 2,
  slug: { tr: "ssi-open-water-diver-kursu", en: "ssi-open-water-diver-course", fr: "cours-ssi-open-water-diver", de: "ssi-open-water-diver-kurs" },
  title: { tr: "SSI Open Water Diver", en: "SSI Open Water Diver", fr: "SSI Open Water Diver", de: "SSI Open Water Diver" },
  summary: {
    tr: "Dünyanın her yerinde 18 metreye kadar dalmanızı sağlayan uluslararası sertifika.",
    en: "The internationally recognised certification that lets you dive to 18 metres anywhere in the world.",
    fr: "La certification internationale qui vous permet de plonger jusqu'à 18 mètres partout dans le monde.",
    de: "Das international anerkannte Brevet für Tauchgänge bis 18 Meter weltweit.",
  },
  body: {
    tr: [
      { type: "p", text: "SSI Open Water Diver, dünya üzerindeki en popüler dalış sertifikasıdır. Uzman eğitmenler eşliğinde gerçekleştirilen teorik eğitim, sığ su eğitimleri ve deniz dalışları sonucunda güvenlik kuralları, dalış malzemeleri, temel dalış becerileri ve teknikleri konusunda bilgi ve tecrübe kazanırsınız." },
      { type: "p", text: "Uluslararası geçerliliği olan sertifikanızla 18 metre derinliğe kadar dalabilirsiniz. Eğitimler Türkçe, İngilizce, Fransızca ve Almanca olarak verilebilir." },
      { type: "h2", text: "Kurs bilgileri" },
      { type: "ul", items: ["Seviye: Başlangıç", "En kısa süre: 3 gün", "Kurs ücreti: 395 €"] },
    ],
    en: [
      { type: "p", text: "The SSI Open Water Diver certification is the most popular diving certification in the world. Through theoretical training, confined (shallow) water sessions and open water dives with expert instructors, you gain knowledge and experience in safety rules, diving equipment, basic diving skills and techniques." },
      { type: "p", text: "With your internationally recognised certification you can dive to a depth of 18 metres. Training is available in Turkish, English, French and German." },
      { type: "h2", text: "Course details" },
      { type: "ul", items: ["Level: Beginner", "Minimum duration: 3 days", "Course price: €395"] },
    ],
    fr: [
      { type: "p", text: "Le SSI Open Water Diver est la certification de plongée la plus répandue au monde. Grâce à la théorie, aux séances en eau peu profonde et aux plongées en mer encadrées par des moniteurs expérimentés, vous acquérez connaissances et expérience sur les règles de sécurité, l'équipement, les techniques et compétences de base." },
      { type: "p", text: "Avec cette certification reconnue internationalement, vous pouvez plonger jusqu'à 18 mètres. La formation est proposée en turc, anglais, français et allemand." },
      { type: "h2", text: "Informations sur le cours" },
      { type: "ul", items: ["Niveau : débutant", "Durée minimale : 3 jours", "Prix du cours : 395 €"] },
    ],
    de: [
      { type: "p", text: "Das SSI Open Water Diver ist das weltweit beliebteste Tauchbrevet. Durch Theorie, Übungen im flachen Wasser und Freiwassertauchgänge mit erfahrenen Tauchlehrern erwerben Sie Wissen und Erfahrung zu Sicherheitsregeln, Ausrüstung sowie grundlegenden Tauchfertigkeiten und -techniken." },
      { type: "p", text: "Mit dem international anerkannten Brevet dürfen Sie bis 18 Meter tief tauchen. Die Ausbildung ist auf Türkisch, Englisch, Französisch und Deutsch möglich." },
      { type: "h2", text: "Kursdaten" },
      { type: "ul", items: ["Niveau: Einsteiger", "Mindestdauer: 3 Tage", "Kurspreis: 395 €"] },
    ],
  },
  duration: { tr: "En az 3 gün", en: "At least 3 days", fr: "3 jours minimum", de: "Mindestens 3 Tage" },
  priceDisplay: "numeric",
  options: [
    { id: "kurs-ucreti", name: { tr: "Kurs ücreti", en: "Course fee", fr: "Prix du cours", de: "Kursgebühr" }, price: 395, currency: "EUR", basis: "person" },
  ],
  cover: "diving-course-training-1",
  gallery: ["diving-try-dive-1"],
  includes: {
    tr: ["Teorik eğitim", "Sığ su eğitimleri", "Deniz dalışları", "Materyal ücreti"],
    en: ["Theory training", "Confined water sessions", "Open water dives", "Course materials"],
    fr: ["Formation théorique", "Séances en eau peu profonde", "Plongées en mer", "Matériel pédagogique"],
    de: ["Theorieunterricht", "Übungen im flachen Wasser", "Freiwassertauchgänge", "Kursmaterial"],
  },
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  // The old French page repeats the Scuba Diver text here, so French is written anew.
  translationOrigin: { en: "cloner", fr: "mockup", de: "mockup" },
  sourceRefs: sourcePages,
}

/** Drafts from the old diving page. German is left out on purpose: staff translate these with DeepL in the panel. */
const materialsCondition = {
  tr: ["Kurs materyali ücreti için güncel fiyatları bize sorun."],
  en: ["Please ask us for current prices for the course materials."],
  fr: ["Pour le prix du matériel pédagogique, demandez-nous les tarifs actuels."],
}

export const ssiAdvancedOpenWaterDiver: DragomanEvent = {
  id: "ssi-advanced-open-water-diver",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 4,
  slug: { tr: "ssi-advanced-open-water-diver-kursu", en: "ssi-advanced-open-water-diver-course", fr: "cours-ssi-advanced-open-water-diver", de: "ssi-advanced-open-water-diver-kurs" },
  title: { tr: "SSI Advanced Open Water Diver", en: "SSI Advanced Open Water Diver", fr: "SSI Advanced Open Water Diver" },
  summary: {
    tr: "Open Water sonrası sıradaki adım: beş uzmanlık dalışıyla daha bağımsız ve deneyimli bir dalıcı olun.",
    en: "The step after Open Water: five specialty dives to become a more independent, experienced diver.",
    fr: "L'étape qui suit l'Open Water : cinq plongées de spécialité pour devenir un plongeur plus autonome et expérimenté.",
  },
  body: {
    tr: [
      { type: "p", text: "Dalış konusundaki teorik bilgilerinizi ve dalış tecrübenizi geliştirerek su altında daha bağımsız hareket etmek istiyorsanız ve SSI Open Water Diver veya dengi bir sertifikaya sahipseniz, SSI Advanced Open Water Diver kursuna başlayabilirsiniz." },
      { type: "p", text: "SSI sisteminde teorik bilgilerinizi geliştiren eğitimden sonra, sunulan seçenekler arasından beş uzmanlık dalışını tamamlamanız gerekir. Bu sertifika için Derin Dalış zorunludur; diğer dalışlar sizin seçiminize bırakılır ve batık dalışı, gece dalışı, mükemmel yüzerlik, arama ve kurtarma, sualtı doğacılığı, tekne dalışı, zenginleştirilmiş hava (Nitrox) dalışı, balık tanımlama, sualtı fotoğrafçılığı, sualtı videoculuğu ve daha fazlasını içerebilir." },
      { type: "h2", text: "Kurs bilgileri" },
      { type: "ul", items: ["Seviye: İleri eğitim", "En kısa süre: 2,5 gün", "Kurs ücreti: 395 €"] },
    ],
    en: [
      { type: "p", text: "If you want to improve your theoretical knowledge and diving experience, become more independent underwater, and already hold an SSI Open Water Diver or equivalent certification, you can begin the SSI Advanced Open Water Diver course." },
      { type: "p", text: "In the SSI system, after completing the theory training that enhances your knowledge, you complete five specialty dives from a list of offered options. Deep Diving is mandatory for this certification; the other dives are your choice and may include Wreck Diving, Night Diving, Perfect Buoyancy, Search & Recovery, Underwater Naturalist, Boat Diving, Enriched Air (Nitrox) Diving, Fish Identification, Underwater Photography, Underwater Videography and more." },
      { type: "h2", text: "Course details" },
      { type: "ul", items: ["Level: Advanced", "Minimum duration: 2.5 days", "Course price: €395"] },
    ],
    fr: [
      { type: "p", text: "Si vous souhaitez approfondir vos connaissances théoriques, enrichir votre expérience de plongée et devenir plus autonome sous l'eau, et que vous êtes déjà titulaire de la certification SSI Open Water Diver ou d'un niveau équivalent, vous pouvez commencer le cours SSI Advanced Open Water Diver." },
      { type: "p", text: "Dans le système SSI, après la formation théorique qui renforce vos connaissances, vous effectuez cinq plongées de spécialité choisies dans une liste d'options. La plongée profonde est obligatoire pour cette certification ; les autres plongées sont de votre choix et peuvent comprendre la plongée sur épave, la plongée de nuit, la flottabilité parfaite, la recherche et la récupération, le naturaliste sous-marin, la plongée en bateau, la plongée Nitrox (air enrichi), l'identification des poissons, la photographie et la vidéographie sous-marines, et plus encore." },
      { type: "h2", text: "Informations sur le cours" },
      { type: "ul", items: ["Niveau : avancé", "Durée minimale : 2,5 jours", "Prix du cours : 395 €"] },
    ],
  },
  duration: { tr: "En az 2,5 gün", en: "At least 2.5 days", fr: "2,5 jours minimum" },
  priceDisplay: "numeric",
  options: [
    { id: "kurs-ucreti", name: { tr: "Kurs ücreti", en: "Course fee", fr: "Prix du cours" }, price: 395, currency: "EUR", basis: "person" },
  ],
  cover: "diving-course-training-1",
  gallery: [],
  conditions: materialsCondition,
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "draft",
  origin: "cloner",
  // The second paragraph of the old French page is in Turkish; that part is translated.
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: sourcePages,
}

export const ssiDiverStressAndRescue: DragomanEvent = {
  id: "ssi-diver-stress-and-rescue",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 5,
  slug: { tr: "ssi-diver-stress-and-rescue-kursu", en: "ssi-diver-stress-and-rescue-course", fr: "cours-ssi-diver-stress-and-rescue", de: "ssi-diver-stress-and-rescue-kurs" },
  title: { tr: "SSI Diver Stress and Rescue", en: "SSI Diver Stress and Rescue", fr: "SSI Diver Stress and Rescue" },
  summary: {
    tr: "Dalış kazalarını önlemeyi ve acil durumlarla başa çıkmayı öğreten SSI kurtarma dalgıcı programı.",
    en: "An SSI programme that teaches how to prevent diving accidents and handle emergency situations.",
    fr: "Un programme SSI qui apprend à prévenir les accidents de plongée et à gérer les situations d'urgence.",
  },
  body: {
    tr: [
      { type: "p", text: "SSI Rescue Diver kursu, dalış kazalarını önlemeyi ve acil durumlarla başa çıkmayı öğreten, hem ilgi çekici hem keyifli bir programdır. Kurs teorik eğitim, sığ su egzersizleri, açık suda beceri uygulamaları ve acil durum senaryosu tatbikatlarını içerir." },
      { type: "h2", text: "Kurs bilgileri" },
      { type: "ul", items: ["Seviye: İleri eğitim", "En kısa süre: 3 gün", "Kurs ücreti: 395 €"] },
    ],
    en: [
      { type: "p", text: "The SSI Rescue Diver Course is a highly engaging and enjoyable program that teaches how to prevent diving accidents and handle emergency situations. The course includes theoretical training, confined water exercises, open water skill applications and emergency scenario drills." },
      { type: "h2", text: "Course details" },
      { type: "ul", items: ["Level: Advanced", "Minimum duration: 3 days", "Course price: €395"] },
    ],
    fr: [
      { type: "p", text: "Le cours SSI Rescue Diver est un programme à la fois passionnant et enrichissant, qui enseigne comment prévenir les accidents de plongée et gérer les situations d'urgence. Le cours comprend une formation théorique, des exercices en milieu protégé, des applications pratiques en eau libre et des simulations de scénarios d'urgence." },
      { type: "h2", text: "Informations sur le cours" },
      { type: "ul", items: ["Niveau : avancé", "Durée minimale : 3 jours", "Prix du cours : 395 €"] },
    ],
  },
  duration: { tr: "En az 3 gün", en: "At least 3 days", fr: "3 jours minimum" },
  priceDisplay: "numeric",
  options: [
    { id: "kurs-ucreti", name: { tr: "Kurs ücreti", en: "Course fee", fr: "Prix du cours" }, price: 395, currency: "EUR", basis: "person" },
  ],
  cover: "diving-course-training-1",
  gallery: [],
  conditions: materialsCondition,
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "draft",
  origin: "cloner",
  // The old Turkish page repeats the English text here, so Turkish is written anew.
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: sourcePages,
}

export const ssiDivemaster: DragomanEvent = {
  id: "ssi-divemaster",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 6,
  slug: { tr: "ssi-divemaster-kursu", en: "ssi-divemaster-course", fr: "cours-ssi-divemaster", de: "ssi-divemaster-kurs" },
  title: { tr: "SSI Divemaster", en: "SSI Divemaster", fr: "SSI Divemaster" },
  summary: {
    tr: "SSI'daki liderlik eğitiminin ilk basamağı: profesyonel SSI üyeliğine giden yoğun program.",
    en: "The first level of SSI leadership training and the way into professional SSI membership.",
    fr: "Le premier niveau de la formation au leadership SSI et la porte d'entrée de l'adhésion professionnelle SSI.",
  },
  body: {
    tr: [
      { type: "p", text: "SSI Dive Guide kursu, teorik ve pratik eğitiminizin profesyonel düzeye ulaşmasını sağlayan, yoğun bir eğitim programıdır. Bu süreçte katılımcılar fizik, fizyoloji, dalış ekipmanları, dalış ortamı ve çevre, dekompresyon teorisi ve dalış tabloları, dalış sağlığı, SSI standartları, SSI Dive Guide'ın yürütebileceği eğitimler, dalış endüstrisi ve SSI profesyoneli olmakla ilgili teorik çalışmalar yapar." },
      { type: "p", text: "Belirli bir fiziksel kondisyon gerektiren pratik kısımda ise dalış liderliği, tekne ve dalış organizasyonu, temel denizcilik, eğitmen asistanlığı, haritalama, acil durumlara müdahale ve eğitim verme gibi konularda çalışılır. Süreci başarıyla tamamlayan katılımcılar dalış endüstrisinde yerlerini alır ve SSI'nin profesyonel üyeliğine adım atar." },
      { type: "h2", text: "Kurs bilgileri" },
      { type: "ul", items: ["Seviye: Profesyonel", "En kısa süre: 10–14 gün", "Kurs ücreti: 600 €"] },
    ],
    en: [
      { type: "p", text: "This is the first level of leadership training and professional SSI membership. The SSI Dive Guide course gives you a chance to be an SSI Pro, with intensive academic and training sessions. Throughout the course the participants learn the theory of physics, physiology, diving equipment, the diving environment and surroundings, decompression theory and dive tables, diving health, SSI standards, courses run by SSI, the diving industry and being an SSI Pro." },
      { type: "p", text: "The practical sessions require physical fitness. Participants learn about diving leadership, boat and diving organization, basic navigation (seamanship), instructor assistantship, mapping, emergency first response and training skills. Participants who complete the course successfully can start working in the diving industry and become professional members of SSI." },
      { type: "h2", text: "Course details" },
      { type: "ul", items: ["Level: Professional", "Minimum duration: 10–14 days", "Course price: €600"] },
    ],
    fr: [
      { type: "p", text: "Il s'agit de la première étape de la formation en leadership et de l'adhésion professionnelle au sein de SSI. Le cours SSI Dive Guide vous offre l'opportunité de devenir un professionnel SSI, avec des sessions académiques et pratiques intensives. Tout au long du cours, les participants acquièrent des connaissances théoriques sur la physique, la physiologie, les équipements de plongée, l'environnement marin, la théorie de la décompression et les tables de plongée, la santé du plongeur, les standards SSI, les formations proposées par SSI, l'industrie de la plongée, ainsi que le rôle et les responsabilités d'un professionnel SSI." },
      { type: "p", text: "Lors des sessions pratiques exigeant une bonne condition physique, les participants se forment au leadership en plongée, à l'organisation des plongées depuis la terre et les bateaux, à la navigation de base (maritime), à l'assistance à l'enseignement, à la cartographie, à la réponse d'urgence et aux compétences pédagogiques. Les participants qui réussissent ce cours peuvent commencer leur carrière dans l'industrie de la plongée et devenir membres professionnels de SSI." },
      { type: "h2", text: "Informations sur le cours" },
      { type: "ul", items: ["Niveau : professionnel", "Durée minimale : 10–14 jours", "Prix du cours : 600 €"] },
    ],
  },
  duration: { tr: "10–14 gün", en: "10–14 days", fr: "10–14 jours" },
  priceDisplay: "numeric",
  options: [
    { id: "kurs-ucreti", name: { tr: "Kurs ücreti", en: "Course fee", fr: "Prix du cours" }, price: 600, currency: "EUR", basis: "person" },
  ],
  cover: "diving-course-training-1",
  gallery: [],
  conditions: materialsCondition,
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "draft",
  origin: "cloner",
  translationOrigin: { en: "cloner", fr: "cloner" },
  sourceRefs: sourcePages,
}

const specialty = (id: string, tr: string, en: string, fr: string, de: string, price: number | null): DragomanEvent['options'][number] => ({
  id,
  name: { tr, en, fr, de },
  price,
  currency: "EUR",
  basis: "person",
})

export const ssiUzmanlikKurslari: DragomanEvent = {
  id: "ssi-uzmanlik-kurslari",
  category: "diving",
  subgroup: "dalis-egitim",
  order: 3,
  slug: { tr: "ssi-uzmanlik-kurslari", en: "ssi-specialty-courses", fr: "specialites-ssi", de: "ssi-spezialkurse" },
  title: { tr: "SSI Uzmanlık Kursları", en: "SSI Specialty Courses", fr: "Spécialités SSI", de: "SSI-Spezialkurse" },
  summary: {
    tr: "Nitrox'tan batık ve gece dalışına, brövenizi ilgi alanınıza göre geliştirin.",
    en: "From Nitrox to wreck and night diving, build on your certification in the field that interests you.",
    fr: "Du Nitrox à l'épave et à la plongée de nuit, approfondissez votre brevet selon vos centres d'intérêt.",
    de: "Von Nitrox bis Wrack- und Nachttauchen: Bauen Sie Ihr Brevet in Ihrem Interessengebiet aus.",
  },
  body: {
    tr: [
      { type: "p", text: "SSI uzmanlık programları, belirli bir dalış alanında bilgi ve beceri kazandırır. Çoğu 1–2 gün sürer ve materyal ücreti fiyata dahildir. Örneğin Nitrox kursu dip sürelerinizi ve güvenlik marjlarınızı artırmayı, Derin Dalış 18 ile 40 metre arasına güvenle dalmayı, Batık Dalışı 30 metreye kadar penetrasyonsuz batık dalışını öğretir." },
      { type: "p", text: "SSI Speciality Diver sertifikası için güncel fiyatları bize sorun." },
    ],
    en: [
      { type: "p", text: "SSI specialty programmes give you knowledge and skills in a particular field of diving. Most take 1–2 days and course materials are included. The Nitrox course, for example, teaches you to extend bottom times and safety margins, Deep Diving to dive safely between 18 and 40 metres, and Wreck Diving to dive wrecks without penetration down to 30 metres." },
      { type: "p", text: "Please ask us for current prices for the SSI Specialty Diver rating." },
    ],
    fr: [
      { type: "p", text: "Les programmes de spécialité SSI vous apportent connaissances et compétences dans un domaine précis de la plongée. La plupart durent 1 à 2 jours, matériel pédagogique compris. Le cours Nitrox vous apprend par exemple à allonger vos temps au fond et vos marges de sécurité, la plongée profonde à évoluer en sécurité entre 18 et 40 mètres, et la plongée sur épave à visiter des épaves sans pénétration jusqu'à 30 mètres." },
      { type: "p", text: "Pour la certification SSI Specialty Diver, demandez-nous les tarifs actuels." },
    ],
    de: [
      { type: "p", text: "SSI-Spezialkurse vermitteln Wissen und Fertigkeiten in einem bestimmten Bereich des Tauchens. Die meisten dauern 1–2 Tage, das Kursmaterial ist inbegriffen. Im Nitrox-Kurs lernen Sie zum Beispiel, Grundzeiten und Sicherheitsreserven zu verlängern, im Tieftauchkurs sicher zwischen 18 und 40 Metern zu tauchen und im Wracktauchkurs Wracks ohne Penetration bis 30 Meter zu betauchen." },
      { type: "p", text: "Für das Brevet SSI Specialty Diver fragen Sie uns bitte nach den aktuellen Preisen." },
    ],
  },
  priceDisplay: "numeric",
  options: [
    specialty("nitrox", "SSI EANx (Nitrox) · 1 gün", "SSI EANx (Nitrox) · 1 day", "SSI EANx (Nitrox) · 1 jour", "SSI EANx (Nitrox) · 1 Tag", 170),
    specialty("derin-dalis", "SSI Deep Diver · 2 gün", "SSI Deep Diver · 2 days", "SSI Deep Diver · 2 jours", "SSI Deep Diver · 2 Tage", 285),
    specialty("batik-dalisi", "SSI Wreck Diver · 2 gün", "SSI Wreck Diver · 2 days", "SSI Wreck Diver · 2 jours", "SSI Wreck Diver · 2 Tage", 205),
    specialty("gece-dalisi-uzmanlik", "SSI Night Diving · 1 gün", "SSI Night Diving · 1 day", "SSI Night Diving · 1 jour", "SSI Night Diving · 1 Tag", 275),
    specialty("mukemmel-yuzerlik", "SSI Perfect Buoyancy · 1 gün", "SSI Perfect Buoyancy · 1 day", "SSI Perfect Buoyancy · 1 jour", "SSI Perfect Buoyancy · 1 Tag", 205),
    specialty("sidemount", "SSI Sidemount · 2 gün", "SSI Sidemount · 2 days", "SSI Sidemount · 2 jours", "SSI Sidemount · 2 Tage", 290),
    specialty("sualti-fotografciligi", "SSI Sualtı Fotoğrafçılığı · 1 gün", "SSI Underwater Photography · 1 day", "SSI Photographie sous-marine · 1 jour", "SSI Unterwasserfotografie · 1 Tag", 220),
    specialty("speciality-diver", "SSI Speciality Diver · 2–2,5 gün", "SSI Specialty Diver · 2–2.5 days", "SSI Specialty Diver · 2–2,5 jours", "SSI Specialty Diver · 2–2,5 Tage", null),
  ],
  cover: "diving-seahorse-1",
  gallery: ["diving-sea-urchin-1", "diving-wreck-plane-1"],
  faq: [],
  itinerary: [],
  healthForm: "diving",
  featured: false,
  status: "published",
  origin: "cloner",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: sourcePages,
}
