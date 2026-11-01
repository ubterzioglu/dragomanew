import type { Testimonial } from '../schema'

/** SAMPLE reviews for layout only. They are not real guest reviews and carry no real names. */
export const testimonials: Testimonial[] = [
  {
    id: "ornek-yorum-1",
    author: "Örnek Ziyaretçi 1",
    rating: 5,
    sample: true,
    text: {
      tr: "Örnek yorum: Bu alan, misafir yorumlarının sayfada nasıl görüneceğini göstermek için yazılmıştır.",
      en: "Sample review: this text only shows how guest reviews will look on the page.",
      fr: "Avis d'exemple : ce texte montre seulement comment les avis apparaîtront sur la page.",
      de: "Beispielbewertung: Dieser Text zeigt nur, wie Gästebewertungen auf der Seite aussehen werden.",
    },
  },
  {
    id: "ornek-yorum-2",
    author: "Örnek Ziyaretçi 2",
    rating: 4,
    sample: true,
    text: {
      tr: "Örnek yorum: Gerçek yorumlar, Dragoman onay verdikten sonra buraya eklenecektir.",
      en: "Sample review: real reviews will be added here once Dragoman has approved them.",
      fr: "Avis d'exemple : les vrais avis seront ajoutés ici après validation par Dragoman.",
      de: "Beispielbewertung: Echte Bewertungen werden hier ergänzt, sobald Dragoman sie freigegeben hat.",
    },
  },
  {
    id: "ornek-yorum-3",
    author: "Örnek Ziyaretçi 3",
    rating: 5,
    sample: true,
    text: {
      tr: "Örnek yorum: Uzun ve kısa metinlerin kart düzenine sığdığını kontrol etmek için kullanılan, biraz daha uzun bir yer tutucu metin.",
      en: "Sample review: a slightly longer placeholder text, used to check that long and short texts both fit the card layout.",
      fr: "Avis d'exemple : un texte de remplacement un peu plus long, pour vérifier que les textes longs et courts tiennent dans la carte.",
      de: "Beispielbewertung: ein etwas längerer Platzhaltertext, um zu prüfen, dass lange und kurze Texte in das Kartenlayout passen.",
    },
  },
]
