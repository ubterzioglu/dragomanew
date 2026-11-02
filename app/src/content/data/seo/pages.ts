import type { SeoFields } from '../../schema'
import { seo } from './build'

/** Search titles and descriptions per fixed page key (tr, en, fr, de). Legal pages say they are placeholders. */
export const richPageSeo: Readonly<Record<string, SeoFields>> = {
  about: seo(
    ["Hakkımızda: 2002'den Beri Kaş'ta Dalış ve Doğa", "Dragoman 2002'den beri Kaş'ta, Kaş-Kekova Özel Deniz Koruma Alanı'nın kalbinde dalış, deniz kanosu ve doğa etkinlikleri düzenliyor. TÜRSAB belge no A4615."],
    ["Dragoman: Diving and Outdoors in Kaş Since 2002", "Since 2002 Dragoman has run diving, sea kayaking and outdoor activities in Kaş, in the heart of the Kaş-Kekova Marine Protected Area. TÜRSAB licence A4615."],
    ["Dragoman : plongée et plein air à Kaş depuis 2002", "Depuis 2002, Dragoman organise plongée, kayak de mer et activités de plein air à Kaş, au cœur de l'Aire Marine Protégée de Kaş-Kekova. Licence TÜRSAB A4615."],
    ["Dragoman: Tauchen und Outdoor in Kaş seit 2002", "Seit 2002 organisiert Dragoman Tauchen, Seekajak und Outdoor-Aktivitäten in Kaş, im Herzen des Meeresschutzgebiets Kaş-Kekova. TÜRSAB-Lizenz A4615."],
  ),
  contact: seo(
    ["Rezervasyon ve İletişim: Kaş'taki Ofisimiz", "Turlar, dalışlar ve kurslar için rezervasyon talebinizi ve sorularınızı bize yazın ya da Kaş'taki ofisimize uğrayın. Dragoman Seyahat Acentası, TÜRSAB A4615."],
    ["Booking and Contact: Visit Our Office in Kaş", "Write to us with booking requests and questions about tours, dives and courses, or drop by our office in Kaş. Dragoman Travel Agency, TÜRSAB licence A4615."],
    ["Réservation et contact : notre bureau à Kaş", "Écrivez-nous pour vos demandes de réservation et vos questions sur les circuits, plongées et cours, ou passez à notre bureau de Kaş. Licence TÜRSAB A4615."],
    ["Buchung und Kontakt: besuchen Sie uns in Kaş", "Schreiben Sie Buchungsanfragen und Fragen zu Touren, Tauchgängen und Kursen oder besuchen Sie unser Büro in Kaş. Reisebüro Dragoman, TÜRSAB-Lizenz A4615."],
  ),
  diveSites: seo(
    ["Kaş Dalış Noktaları: Batıklar ve Kanyonlar", "Kaş'ın dalış noktalarından bir seçki: bankolar, kanyonlar ve batıklar, 55–71 metrede yatan II. Dünya Savaşı'ndan bir İtalyan bombardıman uçağı dahil."],
    ["Kaş Dive Sites: Reefs, Wrecks and Canyons", "A selection of the dive sites of Kaş: rocky reefs, canyons and wrecks, including a WWII Italian bomber lying between 55 and 71 m for very experienced divers."],
    ["Sites de plongée de Kaş : secs, épaves et canyons", "Une sélection de sites de plongée de Kaş : secs rocheux, canyons et épaves, dont un bombardier italien de la Seconde Guerre mondiale posé entre 55 et 71 m."],
    ["Tauchplätze in Kaş: Riffe, Wracks und Canyons", "Eine Auswahl der Tauchplätze von Kaş: Felsriffe, Canyons und Wracks, darunter ein italienischer Bomber aus dem Zweiten Weltkrieg in 55 bis 71 m Tiefe."],
  ),
  lifeguard: seo(
    ["Cankurtaran Eğitimleri: Bronz, Gümüş ve Altın", "TSSF Cankurtarma Yönetmeliği kapsamında Bronz, Gümüş ve Altın kursları ile belge yenileme; Kaş'ta ve diğer bölgelerde yıl boyu, belgeler 2 yıl geçerli."],
    ["Lifeguard Training in Kaş: Bronze, Silver, Gold", "Bronze, Silver and Gold lifeguard courses and certificate renewal under the TSSF regulation, all year round in Kaş and elsewhere; certificates valid 2 years."],
    ["Formation de sauveteur à Kaş : bronze, argent, or", "Cours de sauveteur bronze, argent et or et renouvellement de brevet selon le règlement TSSF, toute l'année à Kaş et ailleurs ; brevets valables 2 ans."],
    ["Rettungsschwimmer-Kurse in Kaş: Bronze bis Gold", "Rettungsschwimmerkurse in Bronze, Silber und Gold sowie Verlängerung nach der TSSF-Verordnung, ganzjährig in Kaş und anderswo; Zertifikate gelten 2 Jahre."],
  ),
  privacy: seo(
    ["Gizlilik Politikası: Kişisel Verilerin İşlenmesi", "Dragoman'ın kişisel verileri nasıl işlediğini açıklayacak gizlilik politikası. Bu sayfadaki metin şimdilik örnektir; onaylı metin yayından önce eklenecek."],
    ["Privacy Policy: How We Process Personal Data", "The privacy policy explaining how Dragoman processes personal data. The text is a placeholder for now; the approved text will be added before launch."],
    ["Politique de confidentialité et vos données", "Politique de confidentialité expliquant comment Dragoman traite les données personnelles. Texte provisoire ; la version approuvée arrivera avant le lancement."],
    ["Datenschutzerklärung und Umgang mit Ihren Daten", "Die Datenschutzerklärung erläutert, wie Dragoman personenbezogene Daten verarbeitet. Vorerst ein Platzhalter; die freigegebene Fassung folgt vor dem Start."],
  ),
  terms: seo(
    ["Şartlar ve Koşullar: Rezervasyon ve Kullanım", "Dragoman rezervasyon ve site kullanım koşulları sayfası. Metin şimdilik örnektir, hukuki geçerliliği yoktur; onaylı metin yayından önce eklenecek."],
    ["Terms and Conditions: Booking and Site Use", "The page for Dragoman's booking and website terms. The text here is a placeholder with no legal effect for now; the approved text will be added before launch."],
    ["Conditions générales : réservation et utilisation", "Conditions de réservation et d'utilisation du site Dragoman. Texte provisoire sans valeur juridique ; la version approuvée sera ajoutée avant le lancement."],
    ["AGB: Bedingungen für Buchung und Websitenutzung", "Hier stehen künftig die Buchungs- und Nutzungsbedingungen von Dragoman. Vorerst ein Platzhalter ohne Rechtswirkung; die Endfassung folgt vor dem Start."],
  ),
}

/** Search titles and descriptions per category page key (tr, en, fr, de). */
export const categoryPageSeo: Readonly<Record<string, SeoFields>> = {
  diving: seo(
    ["Kaş'ta Dalış: 30'u Aşkın Nokta, Kurs ve Turlar", "Kaş'ta her seviyeye uygun 30'u aşkın dalış noktası: batıklar, amforalar, mağaralar ve deniz çayırları. 19–29 °C suda 12 ay dalış, kurslar ve tekne dalışları."],
    ["Diving in Kaş: 30+ Dive Sites, Courses and Trips", "Over 30 dive sites for all levels in Kaş: wrecks, amphorae, caves and seagrass. Water at 19–29 °C means diving all year, with courses and boat dives."],
    ["Plongée à Kaş : 30+ sites, cours et sorties", "Plus de 30 sites de plongée pour tous niveaux à Kaş : épaves, amphores, grottes et herbiers. Eau de 19 à 29 °C toute l'année, cours et sorties en bateau."],
    ["Tauchen in Kaş: über 30 Tauchplätze und Kurse", "Über 30 Tauchplätze für alle Stufen in Kaş: Wracks, Amphoren, Höhlen und Seegraswiesen. Bei 19 bis 29 °C ganzjährig tauchen, mit Kursen und Bootstouren."],
  ),
  seaKayak: seo(
    ["Kekova'da Deniz Kanosu: Günübirlik ve Uzun Turlar", "Batık şehrin üzerinde kürek çekin, saklı koylarda yüzün: Likya kıyısında her seviyeye uygun deniz kanosu turları, Türkiye Kano Federasyonu lisanslı rehberlerle."],
    ["Sea Kayaking in Kekova: Day and Multi-Day Tours", "Paddle over the sunken city and swim in hidden coves: sea kayak tours for all levels on the Lycian coast, with guides licensed by the Turkish Canoe Federation."],
    ["Kayak de mer à Kekova : journées et circuits", "Pagayez sur la cité engloutie, baignez-vous dans des criques cachées : kayak de mer pour tous niveaux sur la côte lycienne, avec des guides agréés."],
    ["Seekajak bei Kekova: Tages- und Mehrtagestouren", "Über die versunkene Stadt paddeln, in versteckten Buchten baden: Touren für jedes Niveau an der lykischen Küste, mit vom Kanuverband lizenzierten Guides."],
  ),
  outdoor: seo(
    ["Kaş'ta Doğa Aktiviteleri: Yürüyüş ve Bisiklet", "Yürüyüşten kıyı tırmanışına, bisikletten tekne turlarına: Likya'nın sırlarına bir adım daha yaklaştıran doğa aktiviteleri. 7'den 70'e herkes için bir rota var."],
    ["Outdoor Activities in Kaş: Hiking, Biking, Boats", "From hiking to coasteering, from cycling to boat trips: outdoor activities that bring you closer to the secrets of Lycia. Something for everyone from 7 to 70."],
    ["Plein air à Kaş : randonnée, vélo et bateau", "De la randonnée au coasteering, du vélo aux sorties en bateau : des activités de plein air pour percer les secrets de la Lycie. Pour tous, de 7 à 70 ans."],
    ["Outdoor in Kaş: Wandern, Radfahren, Bootstouren", "Vom Wandern bis zum Coasteering, vom Radfahren bis zur Bootstour: Outdoor-Aktivitäten, die Sie Lykiens Geheimnissen näherbringen. Für alle von 7 bis 70 Jahren."],
  ),
  transport: seo(
    ["Kaş Transfer ve Konaklama: Dalaman ve Antalya", "Dalaman ve Antalya havalimanlarından Kaş'a transferinizi ayarlıyor, önerdiğimiz otel ve pansiyonlarda konaklamanızı planlıyoruz. Güncel fiyat için bize yazın."],
    ["Kaş Transfers and Stays from Dalaman and Antalya", "We arrange your transfer to Kaş from Dalaman and Antalya airports and plan your stay at hotels and guesthouses we recommend. Write to us for current prices."],
    ["Transferts et hébergement à Kaş depuis Dalaman", "Nous organisons votre transfert vers Kaş depuis Dalaman et Antalya et votre séjour dans les hôtels et pensions que nous recommandons. Prix sur demande."],
    ["Transfer und Unterkunft in Kaş ab Dalaman", "Wir organisieren Ihren Transfer nach Kaş ab den Flughäfen Dalaman und Antalya und Ihren Aufenthalt in empfohlenen Hotels und Pensionen. Preise auf Anfrage."],
  ),
  shop: seo(
    ["Mağaza: Kaş Dalış Rehberi ve Tropikal Akdeniz", "Kaş'ın sualtı dünyasını belgeleyen kitaplarımız: haritalı Dalış Rehberi – Kaş ve Kızıldeniz türleri üzerine Tropikal Akdeniz. WhatsApp ile sipariş."],
    ["Shop: Books on the Underwater World of Kaş", "Our books on the underwater world of Kaş: The Diving Guide – Kaş with dive site maps, and Tropical Mediterranean on Red Sea species. Order by WhatsApp or email."],
    ["Boutique : livres sur le monde sous-marin de Kaş", "Livres sur le monde sous-marin de Kaş : le guide de plongée et ses cartes, et Méditerranée tropicale sur les espèces de la mer Rouge. Commande par WhatsApp."],
    ["Shop: Bücher über die Unterwasserwelt von Kaş", "Bücher über die Unterwasserwelt von Kaş: der Tauchführer mit Karten und Tropical Mediterranean über Arten aus dem Roten Meer. Bestellung per WhatsApp."],
  ),
}

/** Home page (tr, en, fr, de). */
export const homeSeo: SeoFields = seo(
  ["Kaş'ta Dalış, Deniz Kanosu ve Doğa Etkinlikleri", "2002'den beri Kaş'ta: Kaş ve Kekova'da dalış, deniz kanosu, yürüyüş ve bisiklet; Likya kıyısında denizin altında ve üstünde, küçük gruplarla etkinlikler."],
  ["Diving, Sea Kayaking and Outdoors in Kaş & Kekova", "In Kaş since 2002: diving, sea kayaking, hiking and cycling in Kaş and Kekova, under and on the sea along the Lycian coast, always in small groups."],
  ["Plongée, kayak de mer, plein air à Kaş et Kekova", "À Kaş depuis 2002 : plongée, kayak de mer, randonnée et vélo à Kaş et Kekova, sous la mer et sur l'eau le long de la côte lycienne, en petits groupes."],
  ["Tauchen, Seekajak und Outdoor in Kaş und Kekova", "Seit 2002 in Kaş: Tauchen, Seekajak, Wandern und Radfahren in Kaş und Kekova, unter und auf dem Meer an der lykischen Küste, in kleinen Gruppen."],
)
