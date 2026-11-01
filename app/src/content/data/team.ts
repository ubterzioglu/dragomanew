import type { TeamMember } from '../schema'

/**
 * SAMPLE team members only. Real names and portraits from the archive are not used
 * until Dragoman supplies the team list and photo consent.
 */
export const team: TeamMember[] = [
  {
    id: "ornek-egitmen",
    order: 1,
    name: "Örnek Eğitmen",
    role: { tr: "Dalış eğitmeni (örnek)", en: "Diving instructor (sample)", fr: "Moniteur de plongée (exemple)", de: "Tauchlehrer (Beispiel)" },
    bio: {
      tr: "Bu alan gerçek ekip bilgisi gelene kadar örnek olarak doldurulmuştur.",
      en: "This entry is a placeholder until the real team details are provided.",
      fr: "Cette fiche est un exemple en attendant les informations réelles sur l'équipe.",
      de: "Dieser Eintrag ist ein Platzhalter, bis die echten Teamangaben vorliegen.",
    },
    photo: "about-team-placeholder",
    origin: "mockup",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: [],
  },
  {
    id: "ornek-kano-rehberi",
    order: 2,
    name: "Örnek Rehber",
    role: { tr: "Deniz kanosu rehberi (örnek)", en: "Sea kayak guide (sample)", fr: "Guide de kayak de mer (exemple)", de: "Seekajak-Guide (Beispiel)" },
    bio: {
      tr: "Bu alan gerçek ekip bilgisi gelene kadar örnek olarak doldurulmuştur.",
      en: "This entry is a placeholder until the real team details are provided.",
      fr: "Cette fiche est un exemple en attendant les informations réelles sur l'équipe.",
      de: "Dieser Eintrag ist ein Platzhalter, bis die echten Teamangaben vorliegen.",
    },
    origin: "mockup",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: [],
  },
  {
    id: "ornek-doga-rehberi",
    order: 3,
    name: "Örnek Doğa Rehberi",
    role: { tr: "Doğa etkinlikleri rehberi (örnek)", en: "Outdoor guide (sample)", fr: "Guide d'activités de plein air (exemple)", de: "Outdoor-Guide (Beispiel)" },
    origin: "mockup",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: [],
  },
  {
    id: "ornek-ofis-sorumlusu",
    order: 4,
    name: "Örnek Ofis Sorumlusu",
    role: { tr: "Rezervasyon ve ofis (örnek)", en: "Bookings and office (sample)", fr: "Réservations et bureau (exemple)", de: "Buchungen und Büro (Beispiel)" },
    origin: "mockup",
    translationOrigin: { en: "mockup", fr: "mockup", de: "mockup" },
    sourceRefs: [],
  },
]
