import type { RequestKind, SiteLocale } from '../requests/payload.ts'

/** Mail wording per site language. The business mail always uses Turkish. */

export interface MailLabels {
  reference: string
  requestType: string
  fullName: string
  email: string
  phone: string
  event: string
  preferredDate: string
  partySize: string
  options: string
  message: string
  tripType: string
  oneWay: string
  roundTrip: string
  from: string
  to: string
  dateTime: string
  returnDateTime: string
  childSeat: string
  childSeatAges: string
  note: string
  checkIn: string
  checkOut: string
  adults: string
  children: string
  childAges: string
  rooms: string
  preferences: string
  subject: string
  yes: string
  no: string
}

export interface MailStrings {
  receiptSubject: (reference: string) => string
  /** No name: the receipt never repeats what the visitor typed. */
  greeting: string
  intro: string
  notConfirmed: string
  /** The total is always labelled as an estimate: Dragoman confirms the final price. */
  estimate: (amount: string) => string
  priceLater: string
  signOff: string
  kinds: Readonly<Record<RequestKind, string>>
  labels: MailLabels
}

export const MAIL_STRINGS: Readonly<Record<SiteLocale, MailStrings>> = {
  tr: {
    receiptSubject: (reference) => `Talebiniz alındı — ${reference}`,
    greeting: 'Merhaba,',
    intro: 'Talebiniz bize ulaştı. Özeti aşağıda.',
    notConfirmed: 'Bu bir kesin rezervasyon değildir. Dragoman en kısa sürede size dönüş yapacak.',
    estimate: (amount) => `Tahmini toplam: ${amount}. Bu bir tahmindir; kesin fiyatı Dragoman onaylar.`,
    priceLater: 'Fiyatı Dragoman size ayrıca bildirecek.',
    signOff: 'Dragoman',
    kinds: { event: 'Etkinlik talebi', transport: 'Transfer talebi', lodging: 'Konaklama talebi', contact: 'İletişim mesajı' },
    labels: {
      reference: 'Talep numarası',
      requestType: 'Talep türü',
      fullName: 'Ad soyad',
      email: 'E-posta',
      phone: 'Telefon',
      event: 'Etkinlik',
      preferredDate: 'Tercih edilen tarih',
      partySize: 'Kişi sayısı',
      options: 'Seçenekler',
      message: 'Mesaj',
      tripType: 'Yolculuk',
      oneWay: 'Tek yön',
      roundTrip: 'Gidiş-dönüş',
      from: 'Nereden',
      to: 'Nereye',
      dateTime: 'Tarih ve saat',
      returnDateTime: 'Dönüş tarihi ve saati',
      childSeat: 'Çocuk koltuğu',
      childSeatAges: 'Çocuk yaşları',
      note: 'Not',
      checkIn: 'Giriş',
      checkOut: 'Çıkış',
      adults: 'Yetişkin',
      children: 'Çocuk',
      childAges: 'Çocuk yaşları',
      rooms: 'Oda',
      preferences: 'Tercihler',
      subject: 'Konu',
      yes: 'Evet',
      no: 'Hayır',
    },
  },
  en: {
    receiptSubject: (reference) => `We have received your request — ${reference}`,
    greeting: 'Hello,',
    intro: 'Your request has reached us. Here is a summary.',
    notConfirmed: 'This is not a confirmed booking. Dragoman will get back to you soon.',
    estimate: (amount) => `Estimated total: ${amount}. This is an estimate; Dragoman confirms the final price.`,
    priceLater: 'Dragoman will let you know the price.',
    signOff: 'Dragoman',
    kinds: { event: 'Activity request', transport: 'Transfer request', lodging: 'Accommodation request', contact: 'Message' },
    labels: {
      reference: 'Request number',
      requestType: 'Request type',
      fullName: 'Name',
      email: 'Email',
      phone: 'Phone',
      event: 'Activity',
      preferredDate: 'Preferred date',
      partySize: 'Number of people',
      options: 'Options',
      message: 'Message',
      tripType: 'Trip',
      oneWay: 'One way',
      roundTrip: 'Round trip',
      from: 'From',
      to: 'To',
      dateTime: 'Date and time',
      returnDateTime: 'Return date and time',
      childSeat: 'Child seat',
      childSeatAges: 'Children’s ages',
      note: 'Note',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      adults: 'Adults',
      children: 'Children',
      childAges: 'Children’s ages',
      rooms: 'Rooms',
      preferences: 'Preferences',
      subject: 'Subject',
      yes: 'Yes',
      no: 'No',
    },
  },
  fr: {
    receiptSubject: (reference) => `Nous avons bien reçu votre demande — ${reference}`,
    greeting: 'Bonjour,',
    intro: 'Votre demande nous est bien parvenue. En voici le résumé.',
    notConfirmed: 'Ceci n’est pas une réservation confirmée. Dragoman vous répondra rapidement.',
    estimate: (amount) => `Total estimé : ${amount}. Il s’agit d’une estimation ; Dragoman confirme le prix définitif.`,
    priceLater: 'Dragoman vous communiquera le prix.',
    signOff: 'Dragoman',
    kinds: { event: 'Demande d’activité', transport: 'Demande de transfert', lodging: 'Demande d’hébergement', contact: 'Message' },
    labels: {
      reference: 'Numéro de demande',
      requestType: 'Type de demande',
      fullName: 'Nom et prénom',
      email: 'E-mail',
      phone: 'Téléphone',
      event: 'Activité',
      preferredDate: 'Date souhaitée',
      partySize: 'Nombre de personnes',
      options: 'Options',
      message: 'Message',
      tripType: 'Trajet',
      oneWay: 'Aller simple',
      roundTrip: 'Aller-retour',
      from: 'Départ',
      to: 'Arrivée',
      dateTime: 'Date et heure',
      returnDateTime: 'Date et heure du retour',
      childSeat: 'Siège enfant',
      childSeatAges: 'Âges des enfants',
      note: 'Remarque',
      checkIn: 'Arrivée',
      checkOut: 'Départ',
      adults: 'Adultes',
      children: 'Enfants',
      childAges: 'Âges des enfants',
      rooms: 'Chambres',
      preferences: 'Préférences',
      subject: 'Objet',
      yes: 'Oui',
      no: 'Non',
    },
  },
  de: {
    receiptSubject: (reference) => `Wir haben Ihre Anfrage erhalten — ${reference}`,
    greeting: 'Guten Tag,',
    intro: 'Ihre Anfrage ist bei uns angekommen. Hier ist die Zusammenfassung.',
    notConfirmed: 'Dies ist keine bestätigte Buchung. Dragoman meldet sich bald bei Ihnen.',
    estimate: (amount) => `Geschätzter Gesamtpreis: ${amount}. Dies ist eine Schätzung; den endgültigen Preis bestätigt Dragoman.`,
    priceLater: 'Den Preis teilt Ihnen Dragoman mit.',
    signOff: 'Dragoman',
    kinds: { event: 'Aktivitätsanfrage', transport: 'Transferanfrage', lodging: 'Unterkunftsanfrage', contact: 'Nachricht' },
    labels: {
      reference: 'Anfragenummer',
      requestType: 'Art der Anfrage',
      fullName: 'Name',
      email: 'E-Mail',
      phone: 'Telefon',
      event: 'Aktivität',
      preferredDate: 'Wunschtermin',
      partySize: 'Personenzahl',
      options: 'Optionen',
      message: 'Nachricht',
      tripType: 'Fahrt',
      oneWay: 'Einfache Fahrt',
      roundTrip: 'Hin- und Rückfahrt',
      from: 'Von',
      to: 'Nach',
      dateTime: 'Datum und Uhrzeit',
      returnDateTime: 'Rückfahrt: Datum und Uhrzeit',
      childSeat: 'Kindersitz',
      childSeatAges: 'Alter der Kinder',
      note: 'Hinweis',
      checkIn: 'Anreise',
      checkOut: 'Abreise',
      adults: 'Erwachsene',
      children: 'Kinder',
      childAges: 'Alter der Kinder',
      rooms: 'Zimmer',
      preferences: 'Wünsche',
      subject: 'Betreff',
      yes: 'Ja',
      no: 'Nein',
    },
  },
}

/** Turkish-only wording of the mail to the business. */
export const BUSINESS_STRINGS = {
  subject: (reference: string, kind: string) => `Yeni talep — ${reference} (${kind})`,
  intro: 'Siteden yeni bir talep geldi.',
  language: 'Dil',
  openPanel: 'Panelde aç',
} as const
