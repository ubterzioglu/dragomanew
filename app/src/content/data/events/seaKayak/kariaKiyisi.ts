import type { DragomanEvent } from '../../../schema'

/** The new site's 7d/6n draft replaces the old 8-day "Karia Kıyısı" text (owner decision). */
export const kariaKiyisi: DragomanEvent = {
  id: "karia-kiyisi",
  category: "seaKayak",
  subgroup: "kano-cok-gunlu",
  order: 5,
  slug: { tr: "karia-kiyisi", en: "carian-shore", fr: "cote-carienne", de: "karische-kueste" },
  title: { tr: "Karia Kıyısı — 1 Hafta", en: "Carian Shore — 1 Week", fr: "Côte carienne — 1 semaine", de: "Karische Küste — 1 Woche" },
  summary: {
    tr: "Antik Karia'nın etkileyici kıyılarında bir hafta süren kayak keşfi.",
    en: "A week of kayak exploration along the striking coast of ancient Caria.",
    fr: "Une semaine de découverte en kayak sur la côte saisissante de l'antique Carie.",
    de: "Eine Woche Kajak-Entdeckung an der eindrucksvollen Küste des antiken Karien.",
  },
  body: {
    tr: [
      { type: "p", text: "Tarih, doğa ve maceranın buluştuğu antik Karia kıyılarında bir deniz kayağı yolculuğu. Akdeniz ve Ege'nin el değmemiş sularında saklı koyları, doğal limanları ve Knidos antik kenti gibi tarihi yerleri keşfedin. Datça ve Bozburun'un Ege kasabalarında konaklayın ve geleneksel Ege mutfağının tadını çıkarın." },
      { type: "p", text: "Bu rota taslak aşamasındadır; ayrıntılı günlük program yakında eklenecektir." },
      { type: "h2", text: "Öne çıkanlar" },
      { type: "ul", items: ["Antik Knidos kenti", "Akdeniz ve Ege'nin el değmemiş suları", "Saklı koylar ve doğal limanlar", "Osmanlı kaleleri", "Datça ve Bozburun'da konaklama", "Geleneksel Ege mutfağı"] },
    ],
    en: [
      { type: "p", text: "A sea kayaking journey on the ancient Carian coast, where history, nature and adventure meet. Discover hidden coves, natural harbours and historic sites such as the ancient city of Knidos in the unspoilt waters of the Mediterranean and the Aegean. Stay in the Aegean towns of Datça and Bozburun and enjoy traditional Aegean cuisine." },
      { type: "p", text: "This route is still a draft; the detailed day-by-day programme will be added soon." },
      { type: "h2", text: "Highlights" },
      { type: "ul", items: ["The ancient city of Knidos", "Unspoilt waters of the Mediterranean and the Aegean", "Hidden coves and natural harbours", "Ottoman castles", "Stays in Datça and Bozburun", "Traditional Aegean cuisine"] },
    ],
    fr: [
      { type: "p", text: "Un voyage en kayak de mer sur la côte de l'antique Carie, là où se rencontrent histoire, nature et aventure. Découvrez des criques cachées, des ports naturels et des sites historiques comme la cité antique de Cnide, dans les eaux préservées de la Méditerranée et de l'Égée. Logez dans les bourgs égéens de Datça et de Bozburun et goûtez à la cuisine égéenne traditionnelle." },
      { type: "p", text: "Cet itinéraire est encore à l'état de projet ; le programme détaillé jour par jour sera ajouté prochainement." },
      { type: "h2", text: "Points forts" },
      { type: "ul", items: ["La cité antique de Cnide", "Les eaux préservées de la Méditerranée et de l'Égée", "Criques cachées et ports naturels", "Châteaux ottomans", "Séjours à Datça et Bozburun", "Cuisine égéenne traditionnelle"] },
    ],
    de: [
      { type: "p", text: "Eine Seekajakreise an der antiken karischen Küste, wo Geschichte, Natur und Abenteuer zusammenkommen. Entdecken Sie versteckte Buchten, Naturhäfen und historische Stätten wie die antike Stadt Knidos im unberührten Wasser von Mittelmeer und Ägäis. Übernachten Sie in den Ägäisorten Datça und Bozburun und genießen Sie die traditionelle Küche der Ägäis." },
      { type: "p", text: "Diese Route ist noch ein Entwurf; das ausführliche Tagesprogramm wird in Kürze ergänzt." },
      { type: "h2", text: "Höhepunkte" },
      { type: "ul", items: ["Die antike Stadt Knidos", "Unberührtes Wasser von Mittelmeer und Ägäis", "Versteckte Buchten und Naturhäfen", "Osmanische Burgen", "Übernachtungen in Datça und Bozburun", "Traditionelle ägäische Küche"] },
    ],
  },
  duration: { tr: "7 gün / 6 gece", en: "7 days / 6 nights", fr: "7 jours / 6 nuits", de: "7 Tage / 6 Nächte" },
  priceDisplay: "on_request",
  options: [],
  cover: "kayak-caria-coast-1",
  gallery: [],
  faq: [],
  itinerary: [],
  healthForm: null,
  featured: false,
  status: "published",
  origin: "kayak-site",
  translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
  sourceRefs: ["https://dragomanseakayak.com/tr/turlar/carian-shore/", "https://dragoman-turkey.com/tr/deniz-kanosu/"],
}
