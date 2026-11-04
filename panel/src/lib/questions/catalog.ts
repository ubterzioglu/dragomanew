/**
 * The open questions for Dragoman, gathered from claudeguides/arsiv/Dragoman_Musteriye_Acik_Sorular.md and
 * tmp/docs/arsiv/Alan_Adi_Oncesi_Acik_Isler.md (§2–3). Answers live in public.client_answer_entries under
 * each question's id, so an id never changes once shipped; retire a question by removing it (its
 * saved answers stay in the table). Technical set-up done by UBT is not asked here.
 */

export interface Question {
  /** Kebab-case, unique, at most 64 characters (the table checks the same). */
  id: string
  title: string
  /** What is asked; one paragraph. */
  text: string
  /** Optional bullet points under the question. */
  points?: readonly string[]
}

export interface QuestionGroup {
  id: string
  title: string
  /** One line saying when the answers are needed. */
  note: string
  questions: readonly Question[]
}

export const QUESTION_GROUPS: readonly QuestionGroup[] = [
  {
    id: 'hizmetler',
    title: 'Hizmetler, fiyatlar ve metinler',
    note: 'Sitenin yayına hazırlanması için gerekli.',
    questions: [
      {
        id: 'guncel-hizmetler',
        title: 'Güncel hizmetler',
        text: 'İlk yayında hangi tur, eğitim ve hizmetler aktif olarak sunulacak? Eski içeriğin tamamı yine aktarılacak; bu soru yalnız şu an verilen hizmetleri belirlemek için.',
        points: [
          'Cankurtarma eğitimleri hâlâ veriliyor mu? Seçenekleri ve katılım koşulları nelerdir?',
          'Sitede şu an geçici bir kapsamla duruyor; İngilizce ve Fransızca metni yok.',
        ],
      },
      {
        id: 'fiyatlar',
        title: 'Fiyatlar ve koşullar',
        text: 'Sitedeki 18 fiyatın hiçbiri henüz teyit edilmedi. Aktif hizmetlerin EUR fiyatları nedir?',
        points: [
          'Kişi / grup, sezon, çocuk ve ek hizmet fiyat kuralları nelerdir?',
          'Hangi hizmetlerde fiyat yerine “Fiyat talep üzerine” yazılmalı?',
        ],
      },
      {
        id: 'icerik-duzeltmeleri',
        title: 'Eski içerikte düzeltmeler ve yayın onayı',
        text: 'Eski içeriklerde düzeltilmesi gereken tarih, program, buluşma noktası veya hizmet bilgisi var mı? Yeni içerik taslaklarının ve genel tasarımın son yayın onayını kim verecek?',
      },
      {
        id: 'ornek-metinler',
        title: 'Örnek duran sayfa metinleri',
        text: 'Aşağıdaki sayfalarda şu an örnek metin var. Kullanılacak metni yazabilir ya da hazırladığımız taslağı onaylayabilir misiniz?',
        points: [
          'Ana sayfa',
          'Özel Turlar sayfası',
          'İletişim sayfası (eski sitedeki metin yalnız taslaktı)',
        ],
      },
      {
        id: 'almanca',
        title: 'Almanca içerik',
        text: 'Eski sitede hiç Almanca metin yok; sitedeki bütün Almanca metinler şu an örnek. Kararlaştırıldığı gibi Almanca da DeepL ile çevrilip onay beklemeden yayınlanacak. Yayından sonra Almanca metinlere göz atıp düzeltebilecek biri var mı?',
      },
      {
        id: 'sss',
        title: 'Sık sorulan sorular',
        text: 'Müşterilerinizin en sık sorduğu sorular ve güncel yanıtlarınız nelerdir? Özellikle hazırlık, buluşma, ekipman, katılım ve iptal koşullarındaki gerçek bilgileri yazabilir misiniz?',
      },
    ],
  },
  {
    id: 'gorseller',
    title: 'Fotoğraflar, ekip ve yorumlar',
    note: 'Sitenin yayına hazırlanması için gerekli.',
    questions: [
      {
        id: 'gorsel-haklari',
        title: 'Fotoğrafların kullanım hakları',
        text: 'Sitede kullanılan 83 fotoğrafın ve metinlerin kullanım hakları sizde mi? Yayınlanmaması gereken kişi görüntüleri ya da fotoğraflar var mı?',
      },
      {
        id: 'eksik-gorseller',
        title: 'Eksik fotoğraflar',
        text: 'Aşağıdakiler için şu an yer tutucu görsel var. Kullanabileceğimiz fotoğrafları gönderebilir misiniz?',
        points: [
          'Bisiklet turları',
          'Transfer aracı',
          'Ekip fotoğrafları',
          'Dalış ana görseli için daha büyük (yüksek çözünürlüklü) bir fotoğraf',
        ],
      },
      {
        id: 'ekip',
        title: 'Ekip',
        text: 'Sitede şu an 4 örnek kişi var. Ekipte gösterilecek kişilerin gerçek adları, görevleri ve fotoğrafları nelerdir?',
      },
      {
        id: 'yorumlar',
        title: 'Müşteri yorumları',
        text: 'Ana sayfadaki örnek yorumların yerine Google’daki yorumlarınıza giden iki düğme konuyor (“yorumları okuyun” ve “yorum yazın”). Bu yeterli mi, yoksa seçtiğiniz birkaç gerçek Google yorumu sitede de gösterilsin mi? Gösterilecekse hangileri?',
      },
    ],
  },
  {
    id: 'isletme',
    title: 'İşletme bilgileri ve ekip erişimi',
    note: 'Sitenin yayına hazırlanması için gerekli.',
    questions: [
      {
        id: 'calisma-saatleri',
        title: 'Çalışma saatleri',
        text: 'Sitede ve Google İşletme Profili’nde gösterilecek güncel çalışma saatleri nelerdir? Sezona göre değişiyor mu? (Adres, telefon ve sosyal medya bağlantıları alındı.)',
      },
      {
        id: 'kitaplar',
        title: 'Kitaplar',
        text: 'Güncel kitaplar hangi dillerde ve baskılarda var; stok ve fiyatları nedir?',
        points: [
          'Hangi ülkelere gönderiliyor? Kargo ücreti ve teslim süresi nedir?',
          'Ofisten teslim alınabiliyor mu, koşulları nelerdir?',
        ],
      },
      {
        id: 'panel-kullanicilari',
        title: 'Panel kullanıcıları',
        text: 'Panele girecek kişilerin adları ve e-posta adresleri nedir? Kim hangi rolde olacak?',
        points: [
          'Roller: Ana yönetici (her şey), İçerik (düzenler, çevirir), Rezervasyon (talepler üzerinde çalışır), Muhasebe (talepleri yalnız görür).',
          'İçerik rolündekilerden kim yayınlayabilsin?',
          'info@dragoman-turkey.com adresini ve site taleplerini kim takip edecek?',
        ],
      },
    ],
  },
  {
    id: 'hukuk',
    title: 'Yasal metinler ve çerezler',
    note: 'Yayından önce gerekli.',
    questions: [
      {
        id: 'yasal-metinler',
        title: 'Yasal metinler',
        text: 'Gizlilik / KVKK, çerez, katılım ve iptal / iade metinlerinin onaylı sürümleri var mı? Şu an sitede hepsi örnek. Bu metinleri işletme adına kim onaylayacak; gerektiğinde hukuk ve mali danışmanınız kim?',
      },
      {
        id: 'analitik-hesaplari',
        title: 'Ziyaretçi ölçümü (Google Analytics)',
        text: 'Ziyaretçi ölçümü için Dragoman adına Google Analytics 4 ve Google Tag Manager hesapları açılsın mı; açılacaksa hangi Google hesabının sahipliğinde? Çerez bandında gösterilecek onaylı çerez metni kimden gelecek?',
      },
      {
        id: 'yapay-zeka-botlari',
        title: 'Yapay zekâ botları',
        text: 'Site yayına açıldığında ChatGPT, Claude, Perplexity ve Bing gibi yapay zekâ arama servislerinin siteyi okuyup yanıtlarında kaynak göstermesine izin verilecek. Ayrıca iki bot (GPTBot ve Google-Extended) siteyi yapay zekâ modellerini eğitmek için tarıyor. Bu iki eğitim botuna da izin verilsin mi? Önerimiz: evet; içerik zaten herkese açık ve yapay zekâ yanıtlarında görünmeyi artırıyor. İstemezseniz yalnız bu iki bot engellenir.',
      },
    ],
  },
  {
    id: 'hesaplar',
    title: 'Hesaplar, masraflar ve destek',
    note: 'Geçiş ve işletim için gerekli. Şifreleri buraya yazmayın.',
    questions: [
      {
        id: 'servis-erisimleri',
        title: 'Servis hesaplarına erişim',
        text: 'Mevcut servis hesaplarına kim erişim sağlayabilir? Şifreleri buraya yazmayın; güvenli erişimi ayrıca ayarlayacağız.',
        points: [
          'Cloudflare hangi hesapla yönetiliyor ve şu an ne için kullanılıyor?',
          'Cobaltapps / CodeCanyon için verilen admin@dagoman-turkey.com adresi doğru mu?',
          'Insync hangi iş için kullanılıyor?',
        ],
      },
      {
        id: 'eposta-ve-google-hesaplari',
        title: 'E-posta, Google İşletme Profili ve arama motoru hesapları',
        text: 'Zoho, Mailchimp, Google İşletme Profili ve Search Console / Bing hesaplarının yetkili sahipleri kimler? Bu hesaplara gerekli erişimi kim verecek?',
      },
      {
        id: 'servis-masraflari',
        title: 'Servis masrafları',
        text: 'DeepL dahil servis hesaplarının sahibi ve ücret / kota yenilemelerini onaylayacak kişi kim olacak? Supabase’in ücretsiz planı 30 günlük yedeklemeyi karşılamayabilir; ücretli plana geçişi kim onaylayacak?',
      },
      {
        id: 'bakim-ve-destek',
        title: 'Bakım ve destek',
        text: 'Bakım kapsamı, ücreti ve destek beklentiniz nedir? Yeni işlerin ticari onayını kim verecek?',
      },
    ],
  },
  {
    id: 'saglik',
    title: 'Sağlık formu',
    note: 'Sağlık formu devreye alınmadan önce gerekli.',
    questions: [
      {
        id: 'saglik-formu-sorumlulari',
        title: 'Sağlık formunu kim inceleyecek?',
        text: 'Sağlık formlarını inceleyecek gerçek yetkili kişiler kimlerdir? Bir katılımcı bir soruya “Evet” derse bildirim kime gitsin?',
      },
      {
        id: 'saglik-formu-kurallari',
        title: 'Sağlık formundaki açık noktalar',
        text: 'Formun soruları değişmeyecek; yalnız aşağıdaki noktaların işletmedeki uygulamasını netleştirmemiz gerekiyor.',
        points: [
          '“45 yaşın üzerinde” sorusunun alt maddeleri (sigara, kolesterol, kalıtsal kalp ve beyin kanaması) herkese mi gösterilsin, yoksa yalnız 45 yaş üzerindekilere mi? Şu an böyle bir yaş koşulu yok; siz onaylamadan eklenmeyecek.',
          'Outdoor (doğa sporları) formunda dalışa özgü maddeler kalsın mı?',
          '“Kapalı veya açık yerlerde bulunmama” maddesi tam olarak neyi soruyor; nasıl yazılsın?',
        ],
      },
      {
        id: 'cocuk-veli-ve-saklama',
        title: 'Çocuk / veli işlemleri ve saklama süresi',
        text: 'Çocuk katılımcılarda veli onayı işletmede nasıl yapılıyor? Hangi izinler gerekli? Sağlık formu yanıtları ne kadar süre saklanmalı?',
      },
      {
        id: 'saglik-formu-cevirileri',
        title: 'Sağlık formu çevirileri',
        text: 'Sitedeki diğer metinler DeepL çevirisiyle onay beklemeden yayınlanıyor. Sağlık formunun çevirileri ise yayından önce bir insan tarafından kontrol edilsin mi? Önerimiz: evet. Kontrol edilecekse hangi dili kim kontrol edecek?',
      },
    ],
  },
  {
    id: 'odeme',
    title: 'Online ödeme',
    note: 'Online ödeme açılmadan önce gerekli; ilk yayını bekletmez.',
    questions: [
      {
        id: 'iyzico-karsilastirma',
        title: 'iyzico ve alternatifleri',
        text: 'Ödeme sağlayıcısı henüz seçilmedi; önce bir karşılaştırma sunacağız. Bunun için:',
        points: [
          'iyzico’dan memnuniyetsizliğinizin somut nedenleri nelerdir?',
          'Mevcut komisyon, vade ve ek ücretler; yaklaşık tahsilat hacmi ve taksit ihtiyacı nedir?',
          'POSNET’in yazılı teklifini kim alacak?',
        ],
      },
      {
        id: 'tahsilat-kosullari',
        title: 'Tahsilat ve rezervasyon koşulları',
        text: 'Ödemeden sonra Dragoman’ın onay vermesi, onaylanamazsa alternatif tarih ya da iade önerilmesi akışı uygun mu?',
        points: [
          'Hizmetlere göre kapora, kalan ödemenin vadesi nedir?',
          'Havale / EFT’de bekleme ve teyit nasıl yapılıyor?',
          'İptal ve iade istisnaları nelerdir?',
        ],
      },
      {
        id: 'kur-ve-muhasebe',
        title: 'Kur ve muhasebe',
        text: 'EUR fiyatların TL karşılığında hangi kur, marj ve yuvarlama kuralı uygulanacak? Mevcut fatura / muhasebe sisteminiz ve süreç sorumlusu kim? e-Fatura / e-Arşiv konusunu mali müşavirinizle kim netleştirecek?',
      },
    ],
  },
]

export const ALL_QUESTIONS: readonly Question[] = QUESTION_GROUPS.flatMap((group) => group.questions)

/** A blank or whitespace-only answer still counts as unanswered. */
export function isAnswered(answer: string | undefined): boolean {
  return (answer ?? '').trim() !== ''
}

/** How many of the given questions have an answer. */
export function answeredCount(questions: readonly Question[], answers: ReadonlyMap<string, string>): number {
  return questions.filter((question) => isAnswered(answers.get(question.id))).length
}
