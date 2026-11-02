import type { SeoFields } from '../../schema'
import { seo } from './build'

const tropicalSummary = {
  tr: "Kaş'ta 2000–2024 arasında gözlemlenen ve Kızıldeniz'den gelen 76 egzotik deniz türü, 200'ü aşkın fotoğrafla. Genişletilmiş 2. baskı,",
  en: "76 exotic marine species from the Red Sea, observed in Kaş between 2000 and 2024, in more than 200 photographs. The expanded second edition,",
  fr: "76 espèces marines exotiques venues de la mer Rouge, observées à Kaş entre 2000 et 2024, en plus de 200 photos. Deuxième édition augmentée,",
  de: "76 exotische Meeresarten aus dem Roten Meer, beobachtet in Kaş zwischen 2000 und 2024, in über 200 Fotos. Die erweiterte zweite Auflage",
}

/** The three Tropical Mediterranean editions share one description; only the language differs. */
const tropical = (titles: readonly [string, string, string, string], language: readonly [string, string, string, string]): SeoFields =>
  seo(
    [titles[0], `${tropicalSummary.tr} ${language[0]}.`],
    [titles[1], `${tropicalSummary.en} ${language[1]}.`],
    [titles[2], `${tropicalSummary.fr} ${language[2]}.`],
    [titles[3], `${tropicalSummary.de} ${language[3]}.`],
  )

/** Search titles and descriptions per product id (tr, en, fr, de). Prices are unverified, so none. */
export const productSeo: Readonly<Record<string, SeoFields>> = {
  "the-diving-guide-kas": seo(
    ["Dalış Rehberi – Kaş: Sualtı Haritaları ve 307 Tür", "Kaş dalış noktalarının ayrıntılı sualtı haritaları, 307 tür ve 715 fotoğraf: Dragoman ekibinin rehberinin genişletilmiş 3. baskısı, 352 sayfa ve 5 dilde."],
    ["The Diving Guide – Kaş: Maps and 307 Species", "Detailed underwater maps of the Kaş dive sites, 307 species and 715 photos: the expanded 3rd edition of the Dragoman team's guide, 352 pages in 5 languages."],
    ["Guide de plongée – Kaş : cartes et 307 espèces", "Cartes sous-marines des sites de plongée de Kaş, 307 espèces et 715 photos : la 3e édition augmentée du guide de l'équipe Dragoman, 352 pages, 5 langues."],
    ["Tauchführer Kaş: Tauchplatzkarten und 307 Arten", "Unterwasserkarten der Tauchplätze von Kaş, 307 Arten und 715 Fotos: die erweiterte 3. Auflage des Dragoman-Tauchführers, 352 Seiten in 5 Sprachen."],
  ),
  "tropical-mediterranean-english": tropical(
    ["Tropical Mediterranean: İngilizce Baskı, 76 Tür", "Tropical Mediterranean – English Edition", "Tropical Mediterranean – édition anglaise", "Tropical Mediterranean – englische Ausgabe"],
    ["İngilizce", "in English", "en anglais", "auf Englisch"],
  ),
  "tropical-mediterranean-turkish": tropical(
    ["Tropikal Akdeniz: Kızıldeniz'den Gelen 76 Tür", "Tropikal Akdeniz: Turkish Edition, 76 Species", "Tropikal Akdeniz : édition turque, 76 espèces", "Tropikal Akdeniz: türkische Ausgabe, 76 Arten"],
    ["Türkçe", "in Turkish", "en turc", "auf Türkisch"],
  ),
  "tropical-mediterranean-french": tropical(
    ["Méditerranée tropicale: Fransızca Baskı, 76 Tür", "Méditerranée tropicale – French Edition", "Méditerranée tropicale : 76 espèces exotiques", "Méditerranée tropicale – französische Ausgabe"],
    ["Fransızca", "in French", "en français", "auf Französisch"],
  ),
}

/** Search titles and descriptions per post id; shortens the long headlines (seo-geo-plan §3). */
export const postSeo: Readonly<Record<string, SeoFields>> = {
  "kekova-klasik-turu": seo(
    ["Kekova Klasik Turu: Tersane Koyu'ndan Simena'ya", "Küçük grupla bir günlük Kekova deniz kayağı turu: Roma ve Likya kalıntılı adalar, Tersane Koyu'nda mola, Batık Şehir kıyısında kürek ve manzaralı öğle yemeği."],
    ["Kekova Classic Tour: From Tersane Bay to Simena", "A small-group day of sea kayaking in Kekova: islands with Roman and Lycian ruins, a break in Tersane Bay, paddling past the Sunken City and lunch with a view."],
    ["Tour classique de Kekova : de Tersane à Simena", "Une journée de kayak de mer en petit groupe à Kekova : îlots aux ruines romaines et lyciennes, pause dans la baie de Tersane, cité engloutie et repas avec vue."],
    ["Kekova Klassik: im Kajak von Tersane nach Simena", "Ein Seekajak-Tag in kleiner Gruppe bei Kekova: Inseln mit römischen und lykischen Ruinen, Pause in Tersane, die versunkene Stadt und ein Essen mit Aussicht."],
  ),
  "kekova-bati-turu": seo(
    ["Kekova Batı Turu: İki Batık Şehir, Tek Gün", "Orta ve ileri seviye için tam gün: Kekova ve Aperlai batık şehirleri, şnorkel, Likya Yolu'nda kısa yürüyüş ve balıkçı evinde öğle yemeği. 15 km kürek."],
    ["Kekova West Tour: Two Sunken Cities in One Day", "A full day for intermediate to advanced paddlers: the sunken cities of Kekova and Aperlai, snorkelling, a Lycian Way hike and lunch at a fisherman's house."],
    ["Kekova Ouest : deux cités englouties en un jour", "Une journée pour pagayeurs intermédiaires et confirmés : cités englouties de Kekova et d'Aperlai, snorkeling, voie lycienne et déjeuner chez un pêcheur."],
    ["Kekova West: zwei versunkene Städte an einem Tag", "Ein ganzer Tag für Fortgeschrittene: die versunkenen Städte Kekova und Aperlai, Schnorcheln, Wandern auf dem Lykischen Weg und Mittagessen beim Fischer."],
  ),
  "kekova-dogu-turu": seo(
    ["Kekova Doğu Turu: Mağara, Koylar ve Kaplumbağalar", "Kekova'da batık kalıntılar, tenha koylar, bir zamanlar fokların yaşadığı deniz mağarası ve Andriake deresinde deniz kaplumbağaları: 17 km'lik deniz kayağı günü."],
    ["Kekova East Tour: Sea Cave, Bays and Sea Turtles", "Sunken ruins, secluded bays, a sea cave once home to monk seals and sea turtles on the Andriake stream: a 17 km sea kayaking day for fit, experienced paddlers."],
    ["Kekova Est : grotte marine, criques et tortues", "Ruines englouties, criques isolées, une grotte marine jadis habitée par des phoques moines et des tortues à Andriake : 17 km de kayak pour pagayeurs en forme."],
    ["Kekova Ost: Meereshöhle, Buchten und Schildkröten", "Versunkene Ruinen, einsame Buchten, eine Meereshöhle, in der einst Mönchsrobben lebten, und Schildkröten bei Andriake: 17 km Seekajak für geübte, fitte Paddler."],
  ),
  "raja-ampat-2027": seo(
    ["Raja Ampat 2027: 18–27 Aralık Dalış Gezisi", "18–27 Aralık 2027'de Raja Ampat'a Dragoman dalış gezisi: Mercan Üçgeni'nde 500'ü aşkın mercan ve 1000'i aşkın balık türü, günde üç tekne dalışı ve ev resifi."],
    ["Raja Ampat Dive Trip, 18–27 December 2027", "Dive Raja Ampat with Dragoman, 18–27 December 2027: over 500 coral and 1,000 fish species, three boat dives a day plus unlimited house-reef dives."],
    ["Voyage plongée à Raja Ampat, 18–27 décembre 2027", "Avec Dragoman à Raja Ampat du 18 au 27 décembre 2027 : plus de 500 coraux et 1 000 espèces de poissons, trois plongées bateau par jour et le récif à volonté."],
    ["Tauchreise Raja Ampat, 18.–27. Dezember 2027", "Mit Dragoman nach Raja Ampat, 18.–27. Dezember 2027: über 500 Korallen- und 1.000 Fischarten im Korallendreieck, drei Bootstauchgänge täglich plus Hausriff."],
  ),
  "sharm-el-sheikh-2026": seo(
    ["Sharm El Sheikh Dalış Turu: 25–31 Ekim 2026", "25–31 Ekim 2026'da 8 gün 7 gece Sharm El Sheikh: Tiran ve Ras Muhammed'de yaklaşık 10 dalış, isteyene Thistlegorm batığı. En az Open Water sertifikası gerekir."],
    ["Sharm El Sheikh Dive Trip, 25–31 October 2026", "Eight days and seven nights in Sharm El Sheikh, 25–31 October 2026: about 10 dives at Tiran and Ras Mohammed, plus the Thistlegorm wreck. Open Water minimum."],
    ["Plongée à Sharm El Sheikh, 25–31 octobre 2026", "8 jours et 7 nuits à Sharm El Sheikh du 25 au 31 octobre 2026 : une dizaine de plongées à Tiran et Ras Mohammed, Thistlegorm en option. Open Water minimum."],
    ["Tauchreise Sharm El Sheikh, 25.–31. Oktober 2026", "8 Tage und 7 Nächte in Sharm El Sheikh, 25.–31. Oktober 2026: rund 10 Tauchgänge bei Tiran und Ras Mohammed, optional die Thistlegorm. Mindestens Open Water."],
  ),
  "web-semineri-kas": seo(
    ["Web Semineri Kaydı: Bu Yaz Kaş'a (Yeniden) Gelin", "2021 yazında yaptığımız web seminerinin kaydı çevrim içi: Likya'nın incisi Kaş, batık antik kent Kekova, çok sporlu bir tatil ve Kaş'ın zengin sualtı mirası."],
    ["Webinar Replay: Come (Back) to Kaş This Summer", "Our summer 2021 webinar recording is online: Kaş, the pearl of Lycia, the sunken city of Kekova, a multi-sport destination and its underwater heritage."],
    ["Replay du webinaire : (re)venir à Kaş cet été", "Le replay du webinaire de l'été 2021 est en ligne : Kaş, perle lycienne, Kekova et sa cité engloutie, destination multisport, riche patrimoine sous-marin."],
    ["Webinar-Aufzeichnung: Diesen Sommer nach Kaş?", "Die Aufzeichnung des Webinars vom Sommer 2021 ist online: Kaş, die Perle Lykiens, die versunkene Stadt Kekova, ein Multisport-Ziel, reiches Unterwassererbe."],
  ),
}
