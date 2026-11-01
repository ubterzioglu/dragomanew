import type { Subgroup } from '../schema'

/** Only groups that hold at least one event. Order is the display order inside a category. */
export const subgroups: Subgroup[] = [
  // Diving: try dives · certified dives & trips · courses
  {
    id: "dalis-deneme",
    category: "diving",
    order: 1,
    title: { tr: "Deneme dalışları", en: "Try dives", fr: "Baptêmes de plongée", de: "Schnuppertauchen" },
    intro: {
      tr: "Hiç dalmamış olanlar için eğitmen eşliğinde ilk nefes.",
      en: "A first breath underwater with an instructor, for those who have never dived.",
      fr: "Une première respiration sous l'eau avec un moniteur, pour ceux qui n'ont jamais plongé.",
      de: "Der erste Atemzug unter Wasser mit einem Tauchlehrer, für alle ohne Taucherfahrung.",
    },
  },
  {
    id: "dalis-sertifikali",
    category: "diving",
    order: 2,
    title: {
      tr: "Sertifikalı dalışlar ve geziler",
      en: "Certified dives and trips",
      fr: "Plongées pour plongeurs certifiés et voyages",
      de: "Tauchgänge für Brevetierte und Tauchreisen",
    },
    intro: {
      tr: "Brövesi olan dalıcılar için tekne dalışları, gece dalışları ve özel dalışlar.",
      en: "Boat dives, night dives and private dives for certified divers.",
      fr: "Plongées bateau, plongées de nuit et plongées privées pour plongeurs certifiés.",
      de: "Bootstauchgänge, Nachttauchgänge und private Tauchgänge für brevetierte Taucher.",
    },
  },
  {
    id: "dalis-egitim",
    category: "diving",
    order: 3,
    title: { tr: "Kurslar ve eğitimler", en: "Courses and training", fr: "Stages et formations", de: "Kurse und Ausbildung" },
    intro: {
      tr: "Başlangıçtan uzmanlık kurslarına SSI eğitim programları.",
      en: "SSI training programmes from beginner to specialty courses.",
      fr: "Programmes de formation SSI, du débutant aux spécialités.",
      de: "SSI-Ausbildungsprogramme vom Einsteiger bis zum Spezialkurs.",
    },
  },

  // Sea kayak: daily · multi-day · special experience
  {
    id: "kano-gunluk",
    category: "seaKayak",
    order: 1,
    title: { tr: "Günlük turlar", en: "Day tours", fr: "Sorties à la journée", de: "Tagestouren" },
    intro: {
      tr: "Kaş'tan sabah çıkıp akşamüstü dönülen Kekova rotaları.",
      en: "Kekova routes that leave Kaş in the morning and return in the afternoon.",
      fr: "Des itinéraires à Kekova avec départ de Kaş le matin et retour l'après-midi.",
      de: "Kekova-Routen mit Abfahrt in Kaş am Morgen und Rückkehr am Nachmittag.",
    },
  },
  {
    id: "kano-cok-gunlu",
    category: "seaKayak",
    order: 2,
    title: { tr: "Çok günlü turlar", en: "Multi-day tours", fr: "Circuits de plusieurs jours", de: "Mehrtagestouren" },
    intro: {
      tr: "Likya ve Karia kıyıları boyunca birkaç gün kürek çekin, konaklayın ve keşfedin.",
      en: "Paddle, stay overnight and explore along the Lycian and Carian coasts for several days.",
      fr: "Pagayez, faites étape et explorez les côtes lycienne et carienne pendant plusieurs jours.",
      de: "Mehrere Tage paddeln, übernachten und entdecken entlang der lykischen und karischen Küste.",
    },
  },
  {
    id: "kano-ozel-deneyim",
    category: "seaKayak",
    order: 3,
    title: { tr: "Özel deneyim", en: "Special experience", fr: "Expérience spéciale", de: "Besonderes Erlebnis" },
  },

  // Outdoor: the groups used on the old site
  {
    id: "doga-coklu-aktivite",
    category: "outdoor",
    order: 1,
    title: { tr: "Çoklu aktivite turları", en: "Multi-activity tours", fr: "Circuits multi-activités", de: "Multiaktivitätstouren" },
  },
  {
    id: "doga-yuruyus",
    category: "outdoor",
    order: 2,
    title: { tr: "Yürüyüş", en: "Hiking", fr: "Randonnée", de: "Wandern" },
  },
  {
    id: "doga-bisiklet",
    category: "outdoor",
    order: 3,
    title: { tr: "Bisiklet turları", en: "Cycling tours", fr: "Circuits à vélo", de: "Radtouren" },
  },
  {
    id: "doga-kiyi-tirmanisi",
    category: "outdoor",
    order: 4,
    title: { tr: "Coasteering (kıyı tırmanışı)", en: "Coasteering", fr: "Coasteering", de: "Coasteering" },
  },
  {
    id: "doga-tekne",
    category: "outdoor",
    order: 5,
    title: { tr: "Tekne turları", en: "Boat trips", fr: "Excursions en bateau", de: "Bootsausflüge" },
  },
  {
    id: "doga-kultur",
    category: "outdoor",
    order: 6,
    title: { tr: "Kültür turları", en: "Culture tours", fr: "Circuits culturels", de: "Kulturtouren" },
  },
  {
    id: "doga-ozel-turlar",
    category: "outdoor",
    order: 7,
    title: { tr: "Özel turlar", en: "Private tours", fr: "Circuits privés", de: "Private Touren" },
  },
]
