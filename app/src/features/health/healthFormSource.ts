/**
 * Source wording of "Dragoman Dalış ve Outdoor Merkezi Sağlık Belgesi"
 * (claudeguides/sources/forms/try-saglik-formu-tr-21.pdf). Turkish is copied
 * as printed — including unclear items such as SF13 — and must not be
 * reworded here. EN/FR/DE are literal SAMPLE translations, not approved.
 * SF codes are inventory codes (Dragoman_Saglik_Formu_Gereksinimleri.md).
 */

export interface SourceText {
  tr: string
  en: string
  fr: string
  de: string
}

export interface SourceQuestion {
  code: string
  text: SourceText
  /** Sub-items of SF03 keep their link to the parent question. */
  parent?: string
}

export const SOURCE_TITLE: SourceText = {
  tr: 'Dragoman Dalış ve Outdoor Merkezi Sağlık Belgesi',
  en: 'Dragoman Diving and Outdoor Centre Health Document',
  fr: 'Document de santé du centre de plongée et de plein air Dragoman',
  de: 'Gesundheitsdokument des Dragoman Tauch- und Outdoor-Zentrums',
}

export const SOURCE_INTRO: readonly SourceText[] = [
  {
    tr: 'İmzalamadan önce dikkatle okuyunuz.',
    en: 'Read carefully before signing.',
    fr: 'Lisez attentivement avant de signer.',
    de: 'Vor dem Unterschreiben sorgfältig lesen.',
  },
  {
    tr: 'Tüplü dalış eğitimine katılmadan önce tıbbi geçmişinizi içeren bu belgeyi doldurmuş olmalısınız. Eğer reşit değil iseniz bu belge vasiniz tarafından imzalanmalıdır.',
    en: 'You must complete this document about your medical history before taking part in scuba diving training. If you are a minor, this document must be signed by your guardian.',
    fr: 'Vous devez remplir ce document sur vos antécédents médicaux avant de participer à une formation de plongée sous-marine. Si vous êtes mineur, ce document doit être signé par votre tuteur.',
    de: 'Sie müssen dieses Dokument zu Ihrer Krankengeschichte ausfüllen, bevor Sie an einer Gerätetauchausbildung teilnehmen. Wenn Sie minderjährig sind, muss dieses Dokument von Ihrem Vormund unterschrieben werden.',
  },
  {
    tr: 'Emniyetli olarak tüplü dalış yapmak için; aşırı kilolu ve kondisyonsuz olmamalısınız. Dalış bazı koşullar altında zorlayıcı olabilir. Tüm vücut hava boşlukları normal ve sağlıklı olmalıdır. Kalp problemi olan, grip veya nezle olan, epilepsi, astım, ciddi tıbbi problemi olan veya alkol veya uyuşturucu etkisinde olan kişi dalmamalıdır.',
    en: 'To scuba dive safely you must not be extremely overweight or out of condition. Diving can be strenuous under certain conditions. All body air spaces must be normal and healthy. A person with heart problems, a cold or flu, epilepsy, asthma, a serious medical problem, or who is under the influence of alcohol or drugs should not dive.',
    fr: 'Pour plonger en toute sécurité, vous ne devez pas être en fort surpoids ni manquer de condition physique. La plongée peut être éprouvante dans certaines conditions. Toutes les cavités aériennes du corps doivent être normales et saines. Une personne ayant des problèmes cardiaques, un rhume ou une grippe, de l’épilepsie, de l’asthme, un problème médical grave, ou sous l’influence de l’alcool ou de drogues ne doit pas plonger.',
    de: 'Um sicher zu tauchen, dürfen Sie nicht stark übergewichtig oder untrainiert sein. Tauchen kann unter bestimmten Bedingungen anstrengend sein. Alle Lufträume des Körpers müssen normal und gesund sein. Wer Herzprobleme, eine Erkältung oder Grippe, Epilepsie, Asthma, ein ernstes medizinisches Problem hat oder unter dem Einfluss von Alkohol oder Drogen steht, sollte nicht tauchen.',
  },
  {
    tr: 'Eğer ilaç kullanıyorsanız kursa katılmadan önce doktorunuz ve eğitmeninize danışınız. Ayrıca eğitmeninizden tüplü dalış esnasındaki nefes alma ve eşitleme teknikleri ile ilgili önemli kuralları öğreniniz.',
    en: 'If you take medication, consult your doctor and your instructor before joining the course. Also learn from your instructor the important rules on breathing and equalising techniques during scuba diving.',
    fr: 'Si vous prenez des médicaments, consultez votre médecin et votre moniteur avant de suivre le cours. Apprenez aussi de votre moniteur les règles importantes sur les techniques de respiration et d’équilibrage pendant la plongée.',
    de: 'Wenn Sie Medikamente einnehmen, sprechen Sie vor dem Kurs mit Ihrem Arzt und Ihrem Tauchlehrer. Lassen Sie sich außerdem von Ihrem Tauchlehrer die wichtigen Regeln zu Atem- und Druckausgleichstechniken beim Gerätetauchen erklären.',
  },
  {
    tr: 'Sağlık Belgesi veya Tıbbi Geçmiş kısmı ile ilgili sorularınızı bu belgeyi imzalamadan önce mutlaka eğitmeninize sorunuz.',
    en: 'Be sure to ask your instructor any questions about the Health Document or the Medical History section before signing this document.',
    fr: 'Posez impérativement à votre moniteur vos questions sur le document de santé ou la partie antécédents médicaux avant de signer ce document.',
    de: 'Stellen Sie Fragen zum Gesundheitsdokument oder zum Abschnitt Krankengeschichte unbedingt Ihrem Tauchlehrer, bevor Sie dieses Dokument unterschreiben.',
  },
]

export const SOURCE_HEADINGS = {
  medicalHistory: { tr: 'Tıbbi Geçmiş', en: 'Medical history', fr: 'Antécédents médicaux', de: 'Krankengeschichte' },
  candidate: { tr: 'Adaya', en: 'To the candidate', fr: 'Au candidat', de: 'An den Teilnehmenden' },
  pastOrPresent: { tr: 'Daha önceden veya şimdi', en: 'Previously or now', fr: 'Auparavant ou actuellement', de: 'Früher oder jetzt' },
} satisfies Record<string, SourceText>

const q = (code: string, tr: string, en: string, fr: string, de: string, parent?: string): SourceQuestion => ({
  code,
  text: { tr, en, fr, de },
  ...(parent ? { parent } : {}),
})

export const SOURCE_CANDIDATE_QUESTIONS: readonly SourceQuestion[] = [
  q('SF01', 'Hamile misiniz ya da hamile kalmaya çalışıyor musunuz?', 'Are you pregnant or trying to become pregnant?', 'Êtes-vous enceinte ou essayez-vous de le devenir ?', 'Sind Sie schwanger oder versuchen Sie, schwanger zu werden?'),
  q('SF02', 'Düzenli olarak aldığınız reçeteli veya reçetesiz ilaç var mı? (doğum kontrol hapı hariç)', 'Do you regularly take prescription or non-prescription medication? (excluding the contraceptive pill)', 'Prenez-vous régulièrement des médicaments sur ordonnance ou sans ordonnance ? (hors pilule contraceptive)', 'Nehmen Sie regelmäßig verschreibungspflichtige oder rezeptfreie Medikamente ein? (ausgenommen die Antibabypille)'),
  q('SF03', '45 yaşın üzerinde olup aşağıdakilerden biri ya da birden fazlası mevcut mu?', 'Are you over 45 and do one or more of the following apply?', 'Avez-vous plus de 45 ans et l’un ou plusieurs des points suivants s’appliquent-ils ?', 'Sind Sie über 45 und trifft einer oder mehrere der folgenden Punkte zu?'),
  q('SF04', 'pipo, püro veya sigara içmek', 'smoking a pipe, cigars or cigarettes', 'fumer la pipe, le cigare ou des cigarettes', 'Pfeife, Zigarren oder Zigaretten rauchen', 'SF03'),
  q('SF05', 'yüksek kolestrol', 'high cholesterol', 'cholestérol élevé', 'hoher Cholesterinspiegel', 'SF03'),
  q('SF06', 'irsi kalp ve beyin kanaması problemleri', 'hereditary heart and brain haemorrhage problems', 'problèmes héréditaires cardiaques et d’hémorragie cérébrale', 'erbliche Herz- und Hirnblutungsprobleme', 'SF03'),
]

export const SOURCE_HISTORY_QUESTIONS: readonly SourceQuestion[] = [
  q('SF07', 'Astım veya hırıltılı nefes alma', 'Asthma or wheezing', 'Asthme ou respiration sifflante', 'Asthma oder pfeifende Atmung'),
  q('SF08', 'Sık veya şiddetli yüksek ateş', 'Frequent or severe high fever', 'Fièvre forte fréquente ou sévère', 'Häufiges oder starkes hohes Fieber'),
  q('SF09', 'Sık grip, sinüzit veya bronşit', 'Frequent flu, sinusitis or bronchitis', 'Grippe, sinusite ou bronchite fréquentes', 'Häufige Grippe, Nebenhöhlenentzündung oder Bronchitis'),
  q('SF10', 'Herhangi bir ciğer hastalığı', 'Any lung disease', 'Toute maladie pulmonaire', 'Jegliche Lungenerkrankung'),
  q('SF11', 'Pneumothorax (ciğer çökmesi)', 'Pneumothorax (collapsed lung)', 'Pneumothorax (affaissement du poumon)', 'Pneumothorax (Lungenkollaps)'),
  q('SF12', 'Göğüs ameliyatı', 'Chest surgery', 'Chirurgie thoracique', 'Brustkorboperation'),
  q('SF13', 'Kapalı veya açık yerlerde bulunmama', 'Not being in enclosed or open places', 'Ne pas se trouver dans des lieux clos ou ouverts', 'Sich nicht an geschlossenen oder offenen Orten aufhalten'),
  q('SF14', 'Ruhsal davranış problemleri', 'Mental or behavioural problems', 'Troubles psychiques ou du comportement', 'Psychische oder Verhaltensprobleme'),
  q('SF15', 'Sara, kasılmalar veya bunları önlemek için ilaç kullanımı', 'Epilepsy, seizures or taking medication to prevent them', 'Épilepsie, convulsions ou prise de médicaments pour les prévenir', 'Epilepsie, Krampfanfälle oder Einnahme von Medikamenten dagegen'),
  q('SF16', 'Migren ağrıları ve bunları önlemek için ilaç kullanımı', 'Migraine headaches and taking medication to prevent them', 'Migraines et prise de médicaments pour les prévenir', 'Migräne und Einnahme von Medikamenten dagegen'),
  q('SF17', 'Bayılmalar (tam / kısmi şuur kaybı)', 'Fainting (full / partial loss of consciousness)', 'Évanouissements (perte de conscience totale / partielle)', 'Ohnmachten (vollständiger / teilweiser Bewusstseinsverlust)'),
  q('SF18', 'Sık sık deniz, araba, uçak tutması vb.', 'Frequent sea, car or air sickness, etc.', 'Mal de mer, des transports ou de l’air fréquent, etc.', 'Häufige See-, Auto- oder Luftkrankheit usw.'),
  q('SF19', 'Dalış kazaları veya dekompresyon hastalığı', 'Diving accidents or decompression sickness', 'Accidents de plongée ou maladie de décompression', 'Tauchunfälle oder Dekompressionskrankheit'),
  q('SF20', 'Tekrarlayan sırt problemleri', 'Recurring back problems', 'Problèmes de dos récurrents', 'Wiederkehrende Rückenprobleme'),
  q('SF21', 'Sırt ameliyatı', 'Back surgery', 'Chirurgie du dos', 'Rückenoperation'),
  q('SF22', 'Şeker hastalığı', 'Diabetes', 'Diabète', 'Diabetes'),
  q('SF23', 'Yaralanma, kırık veya ameliyat sonrası sırt, bacak veya kol problemleri', 'Back, leg or arm problems after an injury, fracture or surgery', 'Problèmes de dos, de jambe ou de bras après une blessure, une fracture ou une opération', 'Rücken-, Bein- oder Armprobleme nach Verletzung, Bruch oder Operation'),
  q('SF24', 'Hareket etme zorluğu (1.5 km. yi 10 dk. da yürüyememek)', 'Difficulty moving (unable to walk 1.5 km in 10 min.)', 'Difficulté à se déplacer (incapacité à marcher 1,5 km en 10 min)', 'Bewegungsschwierigkeiten (1,5 km nicht in 10 Min. gehen können)'),
  q('SF25', 'Yüksek tansiyon veya tansiyonu kontrol etmek için ilaç kullanımı', 'High blood pressure or taking medication to control blood pressure', 'Hypertension ou prise de médicaments pour contrôler la tension', 'Bluthochdruck oder Einnahme von Medikamenten zur Blutdruckkontrolle'),
  q('SF26', 'Kalp problemleri', 'Heart problems', 'Problèmes cardiaques', 'Herzprobleme'),
  q('SF27', 'Kalp kırizi', 'Heart attack', 'Crise cardiaque', 'Herzinfarkt'),
  q('SF28', 'Kalp veya damar ameliyatı', 'Heart or blood vessel surgery', 'Chirurgie cardiaque ou vasculaire', 'Herz- oder Gefäßoperation'),
  q('SF29', 'Kulak veya sinüs ameliyatı', 'Ear or sinus surgery', 'Chirurgie de l’oreille ou des sinus', 'Ohren- oder Nebenhöhlenoperation'),
  q('SF30', 'Kulak hastalığı, işitme ve denge bozukluğu', 'Ear disease, hearing or balance disorder', 'Maladie de l’oreille, troubles de l’audition et de l’équilibre', 'Ohrenerkrankung, Hör- und Gleichgewichtsstörung'),
  q('SF31', 'Uçakta veya dağlık arazide seyahat ederken kulak eşitleme problemi', 'Problems equalising the ears when flying or travelling in mountainous terrain', 'Problème d’équilibrage des oreilles en avion ou en montagne', 'Probleme mit dem Druckausgleich der Ohren beim Fliegen oder in den Bergen'),
  q('SF32', 'Şiddetli kanama veya kan bozukluğu', 'Severe bleeding or blood disorder', 'Saignement grave ou trouble sanguin', 'Starke Blutungen oder Blutstörung'),
  q('SF33', 'Ülser veya ülser ameliyatı', 'Ulcer or ulcer surgery', 'Ulcère ou chirurgie d’un ulcère', 'Geschwür oder Geschwüroperation'),
  q('SF34', 'Kuyruk sokumu iltihaplanması', 'Tailbone (coccyx) inflammation', 'Inflammation du coccyx', 'Steißbeinentzündung'),
  q('SF35', 'Alkol veya uyuşturucu alışkanlığı', 'Alcohol or drug habit', 'Habitude d’alcool ou de drogue', 'Alkohol- oder Drogengewohnheit'),
]
