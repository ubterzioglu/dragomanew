import type { SeoFields } from '../../schema'
import { seo } from './build'

/**
 * Search titles and descriptions per event id (tr, en, fr, de). Only facts the event page
 * itself shows; no prices, since none are verified yet. The archived trip has none.
 */
export const eventSeo: Readonly<Record<string, SeoFields>> = {
  "deneme-dalisi": seo(
    ["Kaş'ta Deneme Dalışı: Eğitmenle İlk Dalış", "Hiç dalmamış olanlar için Kaş'ta eğitmenle birebir ilk dalış: kısa bir brifing, en fazla 5 metrede yaklaşık 20 dakika ve deneme dalışı sertifikası."],
    ["Try Dive in Kaş: First Dive with an Instructor", "Never dived before? Take your first dive in Kaş one-to-one with an instructor: a short briefing, about 20 minutes at up to 5 metres and a try-dive certificate."],
    ["Baptême de plongée à Kaş avec un moniteur", "Première plongée à Kaş pour les débutants, en tête-à-tête avec un moniteur : briefing, environ 20 minutes jusqu'à 5 mètres et un certificat de baptême."],
    ["Schnuppertauchen in Kaş mit eigenem Tauchlehrer", "Zum ersten Mal abtauchen: in Kaş eins zu eins mit einem Tauchlehrer, nach kurzem Briefing rund 20 Minuten bis 5 Meter Tiefe, mit Schnuppertauch-Zertifikat."],
  ),
  "tekne-dalislari": seo(
    ["Rehberli Tekne Dalışları: Kaş'ın 30+ Noktası", "21 metrelik teknemiz Dragoman ile Kaş'ın 30'u aşkın dalış noktasına rehberli dalış; grupta en fazla 6 dalıcı, brifingler Türkçe, İngilizce ve Fransızca."],
    ["Guided Boat Dives in Kaş: 30+ Dive Sites", "Guided dives at more than 30 Kaş dive sites from our 21-metre boat Dragoman, with no more than 6 divers per guide and briefings in Turkish, English and French."],
    ["Plongées guidées en bateau à Kaş, 30+ sites", "Plongées guidées sur plus de 30 sites de Kaş depuis notre bateau Dragoman de 21 mètres, 6 plongeurs maximum par guide, briefings en turc, anglais et français."],
    ["Geführte Bootstauchgänge in Kaş: 30+ Tauchplätze", "Geführte Tauchgänge an über 30 Plätzen bei Kaş vom 21-Meter-Boot Dragoman aus, höchstens 6 Taucher pro Guide, Briefings auf Türkisch, Englisch und Französisch."],
  ),
  "gece-dalisi": seo(
    ["Kaş'ta Gece Dalışı: Sertifikalı Dalıcılar İçin", "Sertifikalı dalıcılar için Kaş'ta tekneden rehberli gece dalışı. Gruplar en fazla 6 kişi, dalış feneri dahil; ekipmanlı ve ekipmansız seçenekler var."],
    ["Night Diving in Kaş for Certified Divers", "A guided night dive from the boat in Kaş for certified divers, in groups of no more than 6, with the dive torch included. Choose with or without equipment."],
    ["Plongée de nuit à Kaş pour plongeurs certifiés", "Plongée de nuit guidée depuis le bateau à Kaş, réservée aux plongeurs certifiés, en groupes de 6 au plus, lampe fournie. Formule avec ou sans équipement."],
    ["Nachttauchgang in Kaş für zertifizierte Taucher", "Geführter Nachttauchgang vom Boot in Kaş für zertifizierte Taucher, in Gruppen von höchstens 6 Personen, Tauchlampe inklusive, mit oder ohne Ausrüstung."],
  ),
  "ozel-dalis-dragoman-junior": seo(
    ["Dragoman Jr ile Kaş'ta Özel Tekne Dalışları", "5,9 metrelik hız teknemiz Dragoman Jr ile en fazla 4 dalıcıya özel dalış: hava ve deniz uygunsa istediğiniz saatte, istediğiniz dalış noktasına gidiyoruz."],
    ["Private Dives in Kaş with Speedboat Dragoman Jr", "Private dives for up to 4 divers on the 5.9-metre speedboat Dragoman Jr: when the weather and sea allow, we take you to the dive site of your choice, any time."],
    ["Plongées privées à Kaş à bord de Dragoman Jr", "Plongées privées pour 4 plongeurs au plus sur Dragoman Jr, notre vedette de 5,9 mètres : si la météo et la mer le permettent, le site et l'heure de votre choix."],
    ["Private Tauchgänge in Kaş mit Dragoman Jr", "Private Tauchgänge für bis zu 4 Taucher mit dem 5,9-Meter-Schnellboot Dragoman Jr: Wenn Wetter und Meer es erlauben, jederzeit an den Tauchplatz Ihrer Wahl."],
  ),
  "beceri-tazeleme": seo(
    ["Kaş'ta Beceri Tazeleme Dalışı: 1 Gün, 2 Dalış", "Uzun bir aradan sonra ya da yeni sertifikanızla, gruplara katılmadan önce kısa bir teori tekrarı ve bir profesyonelle iki dalış: bir günlük tazeleme."],
    ["Scuba Skills Update in Kaş: 1 Day, 2 Dives", "Back in the water after a long break, or newly certified? A concise theory review and two dives with a dive professional in Kaş before you join the dive groups."],
    ["Remise à niveau plongée à Kaş, 2 plongées", "Après une longue pause ou un tout nouveau brevet : révision théorique et deux plongées avec un professionnel à Kaş, avant de rejoindre les groupes. Une journée."],
    ["Tauch-Auffrischung in Kaş: 1 Tag, 2 Tauchgänge", "Nach längerer Pause oder mit frischem Brevet: kurze Theoriewiederholung und zwei Tauchgänge mit einem Tauchprofi in Kaş, bevor Sie sich den Gruppen anschließen."],
  ),
  "ssi-open-water-diver": seo(
    ["Kaş'ta SSI Open Water Diver: Dalış Sertifikası", "Uluslararası geçerli SSI Open Water Diver sertifikasıyla dünyanın her yerinde 18 metreye kadar dalın. Kaş'ta en az 3 gün; teori, sığ su ve açık su dalışları."],
    ["Learn to Dive in Kaş: SSI Open Water Diver", "Get the internationally recognised SSI Open Water Diver certificate in Kaş and dive to 18 metres anywhere. At least 3 days of theory, confined and open water."],
    ["Apprendre à plonger à Kaş : SSI Open Water Diver", "Obtenez à Kaş le brevet SSI Open Water Diver, reconnu partout, pour plonger jusqu'à 18 mètres. Au moins 3 jours : théorie, eaux abritées et milieu naturel."],
    ["Tauchen lernen in Kaş: SSI Open Water Diver", "Machen Sie in Kaş das weltweit anerkannte SSI Open Water Diver Brevet und tauchen Sie überall bis 18 Meter. Mindestens 3 Tage: Theorie, Flach- und Freiwasser."],
  ),
  "ssi-uzmanlik-kurslari": seo(
    ["Kaş'ta SSI Uzmanlık Kursları: Nitrox ve Batık", "Nitrox, derin dalış, batık ve gece dalışı gibi SSI uzmanlık kurslarıyla brövenizi ilgi alanınıza göre geliştirin. Çoğu 1–2 gün sürer, materyaller dahildir."],
    ["SSI Specialty Courses in Kaş: Nitrox, Deep, Wreck", "Build on your certification with SSI specialty courses in Kaş, from Nitrox and deep diving to wreck and night diving. Most take 1–2 days, materials included."],
    ["Cours de spécialité SSI à Kaş : Nitrox, épave", "Complétez votre brevet avec les spécialités SSI à Kaş : Nitrox, plongée profonde, épave ou de nuit. La plupart durent 1 à 2 jours, supports de cours inclus."],
    ["SSI-Spezialkurse in Kaş: Nitrox, Wrack, Tiefe", "Bauen Sie Ihr Brevet mit SSI-Spezialkursen in Kaş aus: Nitrox, Tieftauchen, Wracktauchen oder Nachttauchen. Die meisten dauern 1–2 Tage, Kursmaterial inklusive."],
  ),
  "kekova-klasik": seo(
    ["Kekova Klasik: Batık Şehir'e Deniz Kayağı Turu", "Yeni başlayanlara uygun günübirlik rota: Üçağız'dan Kekova Adası, Tersane Koyu, Batık Şehir ve Simena'ya yaklaşık 8 km kürek; Kaş'tan sabah 07:30'da hareket."],
    ["Kekova Classic: Sunken City Sea Kayak Day Trip", "A beginner-friendly day of sea kayaking from Üçağız to Kekova Island, Tersane Bay, the Sunken City and Simena: about 8 km of paddling, leaving Kaş at 07:30."],
    ["Kekova Classique : kayak de mer et cité engloutie", "Journée de kayak de mer pour débutants : d'Üçağız à l'île de Kekova, la baie de Tersane, la cité engloutie et Simena, environ 8 km, départ de Kaş à 7 h 30."],
    ["Kekova Klassik: Seekajak zur versunkenen Stadt", "Einsteigerfreundliche Seekajak-Tagestour ab Üçağız zur Insel Kekova, Bucht Tersane, versunkenen Stadt und nach Simena: rund 8 km, Start in Kaş um 7:30 Uhr."],
  ),
  "kekova-bati": seo(
    ["Kekova Batı: Kekova ve Aperlai Deniz Kayağı", "Orta ve ileri seviye için tam gün: Kekova ve Aperlai'nin iki batık şehri, yaklaşık 15 km kürek, Likya Yolu'nda 1,5 km yürüyüş ve batık liman üzerinde şnorkel."],
    ["Kekova West: Full-Day Sea Kayak to Aperlai", "Two sunken cities in one day for intermediate and advanced paddlers: 15 km from Kekova to Aperlai, a 1.5 km Lycian Way hike and snorkelling over the harbour."],
    ["Kekova Ouest : kayak de mer jusqu'à Aperlai", "Deux cités englouties en un jour pour pagayeurs intermédiaires et confirmés : 15 km de Kekova à Aperlai, 1,5 km sur la voie lycienne et snorkeling sur le port."],
    ["Kekova West: Seekajak-Tagestour nach Aperlai", "Zwei versunkene Städte an einem Tag für Fortgeschrittene: rund 15 km von Kekova nach Aperlai, 1,5 km auf dem Lykischen Weg und Schnorcheln am alten Hafen."],
  ),
  "kekova-dogu": seo(
    ["Kekova Doğu: Batık Şehir'den Andriake'ye Kayak", "Orta ve ileri seviye için yaklaşık 17 km'lik tam gün: Simena, Batık Şehir, Hamidiye Koyu, Aşırlı Adası'nda korsan mağarası ve Andriake'de kaplumbağalar."],
    ["Kekova East: Sea Kayak from Kekova to Andriake", "A full day of 17 km for intermediate and advanced paddlers: Simena, the Sunken City, Hamidiye Bay, the pirate cave on Aşırlı Island and turtles at Andriake."],
    ["Kekova Est : kayak de mer de Kekova à Andriake", "Journée de 17 km pour pagayeurs intermédiaires et confirmés : Simena, la cité engloutie, la baie d'Hamidiye, la grotte des pirates et les tortues d'Andriake."],
    ["Kekova Ost: Seekajak von Kekova nach Andriake", "Ein Tag mit rund 17 km für Fortgeschrittene: Simena, die versunkene Stadt, die Bucht Hamidiye, die Piratenhöhle auf Aşırlı und Meeresschildkröten bei Andriake."],
  ),
  "kekova-korfezi": seo(
    ["Kekova Körfezi: Simena Konaklamalı 2 Günlük Tur", "Kekova ve Aperlai boyunca iki günlük deniz kayağı yolculuğu: batık kalıntılar, Tersane Koyu'nda şnorkel ve Simena köyünde bir gece. Orta ve ileri seviye için."],
    ["Kekova Sound: 2-Day Kayak Trip, Night in Simena", "Two days of sea kayaking through Kekova and Aperlai: sunken ruins, snorkelling in Tersane Bay and a night in Simena. For intermediate to advanced paddlers."],
    ["Golfe de Kekova : 2 jours de kayak, nuit à Simena", "Deux jours de kayak de mer entre Kekova et Aperlai : ruines englouties, snorkeling à Tersane et une nuit à Simena. Niveau intermédiaire à confirmé."],
    ["Kekova-Bucht: 2 Tage Seekajak mit Nacht in Simena", "Zwei Tage im Seekajak durch Kekova und Aperlai: versunkene Ruinen, Schnorcheln in der Bucht Tersane und eine Nacht im Dorf Simena. Für Fortgeschrittene."],
  ),
  "isik-kiyisi": seo(
    ["Işık Kıyısı: 4 Günlük Likya Kano ve Kamp Turu", "Kaş'tan Myra'nın limanı Andriake'ye 4 gün deniz kayağı: Kekova ve Aperlai batık şehirleri, Üzümlü ve Aperlai'de kamp, Simena'da otel gecesi ve bol şnorkel."],
    ["Coast of Light: 4-Day Lycian Kayak & Camping Tour", "Four days of sea kayaking from Kaş to Andriake, Myra's harbour: sunken cities of Kekova and Aperlai, camping at Üzümlü and Aperlai, a hotel night in Simena."],
    ["Côte de Lumière : 4 jours de kayak et camping", "Quatre jours de kayak de mer de Kaş à Andriake, port de Myra : cités englouties de Kekova et d'Aperlai, bivouacs à Üzümlü et Aperlai, une nuit d'hôtel à Simena."],
    ["Küste des Lichts: 4 Tage Seekajak und Camping", "Vier Tage im Seekajak von Kaş nach Andriake, dem Hafen von Myra: versunkene Städte Kekova und Aperlai, Camping in Üzümlü und Aperlai, eine Hotelnacht in Simena."],
  ),
  "kekova-kayak-gulet": seo(
    ["Kekova Deniz Kayağı ve Gulet Turu: 7 Gün", "Geleneksel bir Türk guletinin konforunda 7 gün: her gün deniz kayağıyla saklı koylara, Batık Şehir'e, Aperlai ve Simena gibi antik Likya yerleşimlerine kürek."],
    ["Kekova by Sea Kayak and Gulet: a 7-Day Voyage", "Seven days on a traditional Turkish gulet, setting off daily by sea kayak to hidden coves, the Sunken City and Lycian sites such as Aperlai and Simena."],
    ["Kekova en kayak de mer et gulet : 7 jours", "Sept jours sur un gulet turc traditionnel, et chaque jour en kayak de mer vers criques cachées, cité engloutie et sites lyciens comme Aperlai et Simena."],
    ["Kekova mit Seekajak und Gulet: 7-tägige Reise", "Sieben Tage auf einer traditionellen Gulet, täglich im Seekajak zu versteckten Buchten, zur versunkenen Stadt und zu lykischen Stätten wie Aperlai und Simena."],
  ),
  "likya-kayak-konfor": seo(
    ["Likya Kayak ve Konfor Kaçamağı: Her Şey Dahil", "Likya kıyısında her şey dahil 7 günlük deniz kayağı: Kekova ve Aperlai batık şehirleri, Kaş takımadalarında tam gün, Patara plajı ve Andriake'deki Likya Müzesi."],
    ["Lycian Kayak & Comfort Escape, All-Inclusive", "A 7-day all-inclusive sea kayaking trip in Lycia: the sunken cities of Kekova and Aperlai, a day in the Kaş archipelago, Patara beach and the Lycian Museum."],
    ["Escapade lycienne en kayak, tout compris, 7 jours", "Une semaine tout compris en kayak de mer en Lycie : cités englouties de Kekova et d'Aperlai, journée dans l'archipel de Kaş, plage de Patara et musée lycien."],
    ["Lykien im Seekajak mit Komfort, all inclusive", "Eine Woche Seekajak in Lykien, all inclusive: versunkene Städte Kekova und Aperlai, ein Tag im Archipel von Kaş, Strand von Patara und Lykisches Museum."],
  ),
  "karia-kiyisi": seo(
    ["Karia Kıyısı: Knidos ve Datça'da 1 Hafta Kayak", "Antik Karia kıyısında bir hafta deniz kayağı: Knidos antik kenti, saklı koylar ve doğal limanlar, Datça ve Bozburun'da konaklama ve geleneksel Ege mutfağı."],
    ["Carian Shore: A Week of Sea Kayaking to Knidos", "A week of sea kayaking on the ancient Carian coast: the city of Knidos, hidden coves and natural harbours, stays in Datça and Bozburun and Aegean cuisine."],
    ["Côte carienne : une semaine de kayak vers Cnide", "Une semaine de kayak de mer sur l'antique côte carienne : la cité de Cnide, criques cachées et ports naturels, étapes à Datça et Bozburun, cuisine égéenne."],
    ["Karische Küste: eine Woche Seekajak bis Knidos", "Eine Woche Seekajak an der antiken karischen Küste: die Stadt Knidos, versteckte Buchten und Naturhäfen, Nächte in Datça und Bozburun, ägäische Küche."],
  ),
  "trak-signature": seo(
    ["TRAK Signature: Katlanır Kayakla Birebir Seans", "Rehberimizle birebir özel bir gün: TRAK katlanır kayağı adım adım kendiniz kurun, kürek tekniğinizi geliştirin ve Simena kale köyünde öğle yemeği yiyin."],
    ["TRAK Signature: One-to-One Folding Kayak Day", "A private one-to-one day with our guide: assemble a TRAK folding kayak yourself, refine your paddling technique and have lunch in the castle village of Simena."],
    ["TRAK Signature : kayak pliant en tête-à-tête", "Une journée privée en tête-à-tête avec notre guide : montez vous-même un kayak pliant TRAK, affinez votre technique de pagaie et déjeunez au village de Simena."],
    ["TRAK Signature: Faltkajak im Einzelcoaching", "Ein privater Tag eins zu eins mit unserem Guide: Sie bauen ein TRAK-Faltkajak selbst auf, verfeinern Ihre Paddeltechnik und essen im Burgdorf Simena zu Mittag."],
  ),
  "dogaya-donus": seo(
    ["Doğaya Dönüş: 4 Günlük Çok Aktiviteli Likya Turu", "Yürüyüş, bisiklet ve deniz kanosuyla 4 gün: antik Likya kentlerinin yanında kamp, Kekova Batık Şehri boyunca kürek ve Aperlai kalıntılarında şnorkel."],
    ["Back to Nature: 4-Day Lycian Multi-Activity Trip", "Four days of hiking, biking and sea kayaking: camp beside ancient Lycian sites, paddle along the sunken city of Kekova and snorkel over the ruins of Aperlai."],
    ["Retour à la nature : 4 jours actifs en Lycie", "Quatre jours de randonnée, de vélo et de kayak de mer : bivouacs près de sites lyciens antiques, la cité engloutie de Kekova en kayak et snorkeling à Aperlai."],
    ["Zurück zur Natur: 4 Tage Multisport in Lykien", "Vier Tage Wandern, Radfahren und Seekajak: Camping neben antiken lykischen Stätten, im Kajak an der versunkenen Stadt Kekova und Schnorcheln bei Aperlai."],
  ),
  "felen-kas-yuruyusu": seo(
    ["Felen (Phellos) – Kaş Yürüyüşü: Kolay Günlük Rota", "Antik Phellos nekropolünden Çukurbağ köyü üzerinden Kaş'a inen kolay yürüyüş: 850 metreden deniz seviyesine, Meis adası manzarasıyla. Her yaşa uygun."],
    ["Phellos to Kaş Hike: Easy Downhill Day Walk", "An easy day hike from the necropolis of ancient Phellos via Çukurbağ village down to Kaş, from 850 m to sea level with views of Meis. Suitable for all ages."],
    ["Randonnée facile de Phellos à Kaş, vue sur Meis", "Randonnée facile d'une journée, de la nécropole de l'antique Phellos à Kaş par le village de Çukurbağ, de 850 m au niveau de la mer, face à Meis. Tous âges."],
    ["Wanderung von Phellos nach Kaş mit Blick auf Meis", "Leichte Tageswanderung von der Nekropole des antiken Phellos über das Dorf Çukurbağ nach Kaş, von 850 m auf Meereshöhe, mit Blick auf Meis. Für jedes Alter."],
  ),
  "sarilar-belenli-bisiklet": seo(
    ["Sarılar – Belenli Bisiklet Turu ve Antik Korba", "Meşe ağaçları, eski köy evleri ve antik Korba kalıntıları arasında çoğunlukla düz bir bisiklet günü: 22 km ve isteğe bağlı 12 km daha, ortalama rakım 355 metre."],
    ["Sarılar – Belenli Bike Tour past Ancient Korba", "A mostly flat day of cycling among oak trees, old village houses and the ruins of ancient Korba: 22 km plus an optional 12 km, at about 355 m on average."],
    ["Vélo Sarılar – Belenli : chênes et antique Korba", "Une journée de vélo presque plate entre chênes, vieilles maisons de village et ruines de l'antique Korba : 22 km et 12 km en option, vers 355 m d'altitude."],
    ["Radtour Sarılar – Belenli zur antiken Stadt Korba", "Ein überwiegend flacher Radtag zwischen Eichen, alten Dorfhäusern und den Ruinen des antiken Korba: 22 km plus optional 12 km, im Schnitt auf etwa 355 m Höhe."],
  ),
  "kiyi-tirmanisi": seo(
    ["Kaş'ta Coasteering: Büyükçakıl – Limanağzı Kıyısı", "Büyükçakıl'dan Limanağzı'na 3 km kayalık kıyıda yürü, tırman, atla ve yüz. Teknik ekipman gerekmez; deniz kuşları, balıklar ve kaplumbağalar görülebilir."],
    ["Coasteering in Kaş: Büyükçakıl to Limanağzı", "Walk, climb, jump and swim along 3 km of rocky shore from Büyükçakıl to Limanağzı. No technical gear needed; look out for sea birds, fish, crabs and turtles."],
    ["Coasteering à Kaş : de Büyükçakıl à Limanağzı", "Marcher, grimper, sauter et nager sur 3 km de côte rocheuse, de Büyükçakıl à Limanağzı. Sans matériel technique ; oiseaux marins, poissons et tortues en chemin."],
    ["Coasteering in Kaş: von Büyükçakıl nach Limanağzı", "Gehen, klettern, springen und schwimmen auf 3 km Felsküste von Büyükçakıl nach Limanağzı. Ohne Kletterausrüstung; unterwegs Seevögel, Fische und Schildkröten."],
  ),
  "kas-kekova-tekne-turu": seo(
    ["Kaş – Kekova Tekne Turu: Batık Şehir ve Simena", "Yaklaşık 9 saatlik tekne günü: Kaş takımadaları, Limanağzı plajı, Kekova Adası, Batık Şehir ve Simena Kalesi; Likya'dan Roma'ya 3000 yıllık kalıntılar."],
    ["Kaş – Kekova Boat Trip: Sunken City and Simena", "A boat day of about 9 hours: the Kaş archipelago, Limanağzı beach, Kekova Island, the Sunken City and Simena Castle, with ruins from Lycian to Roman times."],
    ["Bateau Kaş – Kekova : cité engloutie et Simena", "Une journée d'environ 9 heures en bateau : archipel de Kaş, plage de Limanağzı, île de Kekova, cité engloutie et château de Simena, des Lyciens aux Romains."],
    ["Bootstour Kaş – Kekova zur versunkenen Stadt", "Ein Bootstag von rund 9 Stunden: Archipel von Kaş, Strand Limanağzı, Insel Kekova, versunkene Stadt und Burg Simena, Ruinen aus lykischer bis römischer Zeit."],
  ),
  "myra-demre-kultur-turu": seo(
    ["Myra (Demre) Kültür Turu: Aya Nikola ve Andriake", "Kyaenai'den Myra'nın kaya mezarları ve tiyatrosuna, Aya Nikola Kilisesi'nden Sülüklü plajında yüzmeye, Andriake ve Hoyran'a uzanan günlük kültür turu."],
    ["Myra Culture Tour: St Nicholas, Andriake, Hoyran", "A day of culture from Kyaenai to the rock tombs and theatre of Myra and the Church of St Nicholas, with a swim at Sülüklü, Andriake and the tombs of Hoyran."],
    ["Circuit culturel Myra : Saint-Nicolas et Andriake", "Une journée culturelle de Kyaenai aux tombes rupestres et au théâtre de Myra, avec l'église Saint-Nicolas, baignade à Sülüklü, Andriake et tombes de Hoyran."],
    ["Kulturtour Myra: Nikolauskirche und Andriake", "Ein Kulturtag von Kyaenai zu den Felsgräbern und dem Theater von Myra und zur Nikolauskirche, mit Badestopp in Sülüklü, Andriake und den Gräbern von Hoyran."],
  ),
  "ozel-turlar": seo(
    ["Size Özel Turlar: Kaş'ta Grubunuza Özel Program", "Yalnızca grubunuz için ya da dalış ve doğa etkinlikleriyle birleşik bir tur mu istiyorsunuz? Beklentinizi yazın, rotayı ve tarihleri birlikte planlayalım."],
    ["Private Tours in Kaş, Planned for Your Group", "Want a tour just for your group, or combined with diving or other outdoor activities? Tell us what you have in mind and we plan the route and dates with you."],
    ["Circuits privés à Kaş, conçus pour votre groupe", "Un circuit pour votre groupe, ou combiné avec la plongée et d'autres activités de plein air ? Dites-nous vos envies, nous préparons l'itinéraire avec vous."],
    ["Private Touren in Kaş, geplant für Ihre Gruppe", "Eine Tour nur für Ihre Gruppe oder kombiniert mit Tauchen und anderen Outdoor-Aktivitäten? Schreiben Sie Ihre Wünsche, wir planen Route und Termine gemeinsam."],
  ),
}
