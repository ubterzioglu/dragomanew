# Dragoman web sitesi yenileme projesi — Brief V6

**Tarih:** 26 Ekim 2026  
**Son güncelleme ve tutarlılık kontrolü:** 31 Ekim 2026  
**Hedef MVP yayını:** 1 Aralık 2026  
**Geliştirici ve teknik işletim:** UBT (Umut Barış Terzioğlu)  
**İşletme ve nihai yayın kararı:** Dragoman; müşteri ve Murat Draman  
**Belge durumu:** Güncel çalışma briefi ve karar kaydı; dokümantasyon devam ediyor. Bir özelliğin burada yer alması, geliştirildiği, testten geçtiği veya müşteri tarafından yayına onaylandığı anlamına gelmez. V5 ve V4 önceki sürümler olarak korunmuştur.


## Güncel uygulama özeti — 31 Ekim 2026 son derleme

Bu bölüm güncel kararların uygulama özetidir. Önceki tarihli karar listeleri ve müşteri alıntıları tarihsel izdir; ayrı çeviri onayı gibi değiştirilen kuralları geri getirmez. V5 ve eski briefler değiştirilmez.

### İçerik ve çeviri

Eski sitedeki tüm içerik, blog ve ilişkili görseller dahil aktarılır; seçimle kapsam daraltılmaz. Tam aktarım ile yayın ayrı işlemlerdir; alınan kayıtlar taslaktır. İlk şablon tesliminde her eski kaydın aktarılmış olması şart değildir; nihai aktarımda envanterle eksiksizlik doğrulanır.

Kaynak dil Türkçedir; EN/FR/DE metinler DeepL API ile hazırlanır. Ana içerik yayınlandığında mevcut DeepL çevirileri ayrıca dil onayı beklemeden yayınlanır. Müşteri panelden düzeltme yapabilir; UBT çeviri kontrolü üstlenmez. Türkçe kaynak değişince mevcut çeviri ve elle düzeltmeler korunur, panelde “Çeviri güncellenmeli” uyarısı gösterilir; yeniden çeviriyi müşteri başlatır. DeepL hata/kota durumunda panel uyarısı gösterilir; gerekirse kota/paket yenilenir. Otomatik ücretli yükseltme yapılmaz. Eksik çeviri tamamlanmış sayılmaz. Kota %80 erken ve %100 kritik uyarıları korunur. Ayrı dil onaylayıcısı, onay bekleme özeti ve üç günlük onay gecikmesi süreci kaldırılmıştır. Tekil/toplu çeviri işleri kota gözetilerek yürütülür; e-posta, ALT ve SEO metinleri de mevcut çeviri kapsamındadır.

### Ayrı hizmet formları

Ulaşım ve konaklama ayrı form ve ayrı talep kayıtlarıdır. Ulaşım: tek yön/gidiş-dönüş, nereden/nereye, tarih-saat, kişi sayısı, ad-soyad, e-posta; telefon/not isteğe bağlı. Gidiş-dönüşte dönüş tarihi-saati alınır. Gerektiğinde çocuk koltuğu talebi ve ilgili çocuk yaşları belirtilir; uygunluğu ekip teyit eder. Konaklama: giriş-çıkış tarihleri, yetişkin/çocuk sayısı, ad-soyad/e-posta zorunlu; oda sayısı alanı bulunur; çocuk varsa her çocuğun yaşı sorulur. Telefon ve tercih notu isteğe bağlıdır. Her iki hizmette kalıcı kayıt sonrası Zoho üzerinden müşteriye alındı e-postası ve mevcut işletme bildirimi gönderilir; kesin rezervasyon vaadi verilmez.

### Panel ve devir

Panel Google ile giriş ve Supabase kullanır. Ana Yönetici personel erişimi ekleyip kaldırabilir; Google girişi tek başına yetki vermez. Mevcut rol/yetki ve 2FA kuralları korunur. Revizyon erişimi olan müşteri ekibi ortak kayıtları görüp yorumlayabilir; istek ve yorumlara ekran görüntüsü eklenebilir. Durumlar Açık/Devam Ediyor/Tamamlandı; müşteri tamamlanan isteği aynı kayıt ve yazışmalarla yeniden açabilir. Yeni istek, yorum ve tamamlanma e-postaları revizyon yetkisi olan aktif müşteri ekibi ve UBT’ye gider; yorum yazana kendi yorumu için gönderilmez. Kaldırılan hesap sonraki bildirimlere alınmaz. Müşteri kullanım kılavuzu ve teknik geliştirici cookbook’u panelde ayrı bölümlerdir. Referans dmseakayak reposundaki RevisionsPanel.tsx ve GuidePanel.tsx yapıları yeni projenin yetkilerine uyarlanır.

### Geçiş ve ödeme

[Servis envanteri](./Dragoman_Servis_Envanteri_Gecis.md) üzerinden hosting/DNS/SSL/e-posta bağlantıları incelenir; değişiklik planı ve geri dönüş hazırlanır. [Ödeme karşılaştırma özeti](./iyzico-posnet-gorusme-ozeti.md) işletmeye karar öncesi sunulacak kaynaktır; POSNET geçiş kararı yoktur.

### Açık kalan iki karar

- Çeviri beklerken Türkçe yayının durup durmayacağı ayrıca yanıtlanmadı; hata/kota uyarısı kabul edildi. İlk şablon teslimini engellemez.
- Ulaşım/konaklamada etkinliklerle aynı Bekliyor/İşleme Alındı ve sorumlu personel akışının kullanılması sorusu yanıtsızdır; kabul edilmiş karar diye uygulanmaz. Form görünümünü engellemez.


## 1. Amaç, kaynaklar ve karar dili

Dragoman'ın mevcut WordPress sitesi yeniden hazırlanacak. Site Kaş ve Kekova çevresindeki dalış, deniz kanosu, doğa ve kültür etkinliklerini açık biçimde tanıtacak; ziyaretçilerin doğru ürüne ulaşmasını, iletişim kurmasını ve uygun ürünlerde rezervasyon talebi veya satın alma başlatmasını sağlayacak. İçerik kısa bir özetle başlayacak, ayrıntı isteyenler ilerleyebilecek. Telefon, tablet ve masaüstü kullanımı birlikte tasarlanacak.

Bu belge, müşterinin ilk 50 yanıtını içeren [önceki brief](./Dragoman_Proje_Brief.md), yüklenen `Dragoman_Proje_Brief_V2(1).md` temelinin bu çalışma alanına aktarılmış V3 taslağı ve [paylaşılan BRIEF EXTENTIONS görüşmesindeki](https://chatgpt.com/share/6adf227e-9bb4-83eb-a1fb-50be0e08fe31) kararlar birleştirilerek hazırlanmıştır. Paylaşılan kayıtta **25/25 detaylandırma yanıtının tamamı** ve bunlardan önceki ayrıntılı geliştirici kararları görülmüştür. Bu görüşmedeki UBT yanıtları geliştirici kararıdır; müşteri adına ticari/hukuki onay olarak yazılmaz.

**Durum terimleri:** **Karar** müşteri briefinde veya UBT review'unda açıkça kabul edilen kuraldır. **MVP** 1 Aralık'ta hedeflenen kapsamdır. **Sonraki faz** ilk yayından sonra ayrıca hazırlanıp etkinleştirilecek iştir. **Açık** müşteri, UBT veya hizmet sağlayıcısından bilgi/onay bekleyen konudur. Teknik tercih ve hukuki uygunluk, ticari kararın yerini almaz.

### 1.1 V6 kaynakları ve çalışma yöntemi

**Yeni sohbet bağlamı:** [31 Ekim handover](./Dragoman_Handover_2026-10-31.md), güncel kararları ve sonraki devam noktasını özetler; [29 Ekim handover](./Dragoman_Handover_2026-10-29.md) önceki ayrıntılı kayıttır. Kapsam ve iş kuralları için V6, sağlık ayrıntıları için ilgili gereksinim belgesi esas alınır.

V6, [V5 çalışma belgesinin](./Dragoman_Proje_Brief_V5.md) son durumu temel alınarak oluşturulmuş ve 29 Ekim kararlarıyla güncellenmiştir. [V4 kapsam kaydı](./Dragoman_Proje_Brief_V4.md), sonraki [layout kararları](./Dragoman_Layout_Kararlari.md), [ödeme karar notu](./Dragoman_Odeme_Kararlari.md), [WordPress içerik analizi](../cloner/analysis/Dragoman_WordPress_Analizi.md) ve [26 Ekim 2026 SEO/GEO araştırması](./Dragoman_SEO_GEO_Arastirma_2026-10-26.md) bu belgenin kaynaklarıdır. Önceki işlevsel gereksinimler, 25/25 geliştirici kararı ve Ek A'daki ilk 50 müşteri yanıtı korunur. Eski sürümle çelişen konularda sonraki açık UBT yanıtı ve V6'nın güncel kuralı esas alınır. Tarihsel müşteri yanıtları güncel kuralın yerine geçirilmez.

- **GitHub deposu:** [ubterzioglu/dragomanew](https://github.com/ubterzioglu/dragomanew)
- **Yerel çalışma klasörü:** `C:\temp_private\dragomanew`
- **Çalışma yöntemi:** UBT dokümantasyonu tamamladığında uygulama belgesini Claude Code'a verecek. Bu görüşmenin işi gereksinimleri ve kararları belgelemektir. Görsel taslak veya uygulama geliştirmeye geçiş kararı alınmadı; V6'nın kaydedilmesi de dokümantasyonun tamamlandığı anlamına gelmez.
- **Geliştirme sırası — 29 Ekim 2026 kabulü:** Claude Code önce ziyaretçinin göreceği bütün kapsam içi sayfa şablonlarını hazırlayacak; `cloner` kaynaklarından uygun içerikler ve eksikleri tamamlayan mockup verilerle dolu olarak sunacak. UBT genel görünümü değerlendirip tasarım düzeltmelerini topluca ele aldıktan sonra yönetim paneli, form kayıtları ve bildirim bağlantıları tamamlanacak. İlk şablon aşamasındaki form ve düğmeler, bağlantıları tamamlanmadan gerçek işlem yapıyormuş gibi sunulmaz. Nihai içerikler daha sonra UBT tarafından, gerektiğinde müşterinin tercihlerine göre güncellenecek. Kesin tur/eğitim/yazı listesi şablon geliştirmeye başlama ön koşulu değildir; içerik, test ve yayın onayları yayına hazırlık aşamasında tamamlanır. Bu sıra önceki MVP/sonraki faz ayrımını değiştirmez ve bu dokümantasyon oturumunda geliştirmeyi başlatmaz.
- **Uygulayıcının sorumluluğu:** Kabul edilmiş kapsam ve yerleşimleri koruyarak görsel/teknik ayrıntıları önerip uygulamak; açık müşteri kararlarını, fiyatları, yasal metinleri veya sağlayıcı seçimini uydurmamak. Geliştirme ve teknik işletim sorumlusu UBT; nihai işletme/yayın kararı Dragoman'dadır.
- **Doğrulanmış başlangıç:** Yeni klasörde WordPress kaynak arşivi ve dokümantasyon incelendi. Yeni site uygulaması, entegrasyon veya canlı geçiş bu çalışmada oluşturulmadı. Eski WordPress içerik kaydındaki `publish` durumu yeni sitede otomatik yayın yetkisi değildir.

### 1.2 Claude Code için ilk teslim sınırı ve kaynaklar

**Sade kapsam ve veri ilişkileri — 31 Ekim 2026:** Etkinlik kopyalama özelliği UBT tarafından gereksiz bulunarak kapsam dışında bırakıldı. Kabul edilen layout/veri ilişkilerinin özeti [Layout ve veri ilişkileri taslağında](./Dragoman_Layout_Veri_Iliskileri.md) toplandı. Bu belge V6 kapsamını değiştirmez; kesin tablo/alan adlarını uygulayıcı belirler. Dalış ve Outdoor ayrı etkinliklerdir; ortak kayıtla iki kategoriye bağlama önerisi kabul edilmedi. Sağlık formunun ayrıntı sorularına geri dönmeden, sade layout/veri yapısıyla ilerlenir.

**Uygulama rehberi:** [Claude Code için uçtan uca uygulama rehberi](./Dragoman_Claude_Code_Uygulama_Rehberi.md), bu briefin çalışma sırasını somutlaştırır: tekrar sorulmayacak kararlar, eksik bilgiyle ilerleme kuralları, kaynak yolları, aşamalı teslim ve E01–E17 test senaryoları. İş kuralları ve kapsam için güncel V6 esas alınır; rehber yeni özellik veya geliştirmeye başlama emri değildir. UBT'nin amacı, uygulayıcının aynı konularda tekrar tekrar soru sormadan somut teslim hazırlayabilmesidir.

İlk teslimin amacı bütün kapsam içi **sayfa türlerini dolu örneklerle** değerlendirebilmektir. Bölüm 4.8'deki her şablon grubu hazırlanır; bütün eski sayfa, tur ve yazıların tek tek aktarılması ilk görünüm değerlendirmesinin ön koşulu değildir. Menü, kart ve detay geçişleri incelenebilir olmalı; uzun/kısa metin ve farklı ekran boyutlarında yerleşim kontrol edilmelidir. İlk teslimin ardından UBT toplu tasarım düzeltmelerini değerlendirir; panel, gerçek form kayıtları ve bildirimler sonraki geliştirme adımında tamamlanır.

| Kaynak | Kullanım |
| --- | --- |
| `C:\temp_private\dragomanew\cloner\extracted` | Eski siteden çıkarılmış içerikler; şablonları doldurmak için uygun metin kaynakları |
| `C:\temp_private\dragomanew\cloner\analysis` | İçerik, etkinlik, dil ve eski URL envanterleri |
| `C:\temp_private\dragoman\cloner\images` | İndirilmiş 323 gerçek görsel; konu ve kalite bakımından incelenerek uygun olanlar seçilir |
| `C:\temp_private\dragoman\cloner\media-download-manifest.json` | Eski görsel adresleri ile indirilen dosya adlarının eşleştirmesi |
| `C:\temp_private\dragomanew\Dragoman_Proje_Brief_assets` | Önceki briefin görsel eki; ek kaynak |

`dragoman` ve `dragomanew` farklı klasörlerdir. İçerik envanteri yeni çalışma klasöründe, indirilen gerçek görseller yukarıdaki `dragoman` yolundadır. Kaynakta uygun metin veya görsel bulunamazsa mockup içerikle tamamlanır; nihai müşteri bilgileri beklenmez. Kaynak dosyalar korunur; site için seçilen görsellerin optimize edilmiş kullanım kopyaları hazırlanır.

Formların düzenlenebilirliği, başlangıç alanlarını ve metinlerini sonradan değiştirme ihtiyacını karşılayan sade bir yönetim olarak ele alınır; ayrı bir gelişmiş form tasarım ürünü kapsamı varsayılmaz. Google yorumları alanı ilk şablonda temsili içerikle gösterilebilir; gerçek veri bağlantısı ve olası servis maliyeti sonraki bağlantı aşamasında doğrulanır. Örnek yorumlar gerçek müşteri yorumu olarak yayınlanmaz. Ödeme araştırmasının ertelenmesi ve mevcut faz sınırları korunur.

## 2. Marka, hedef kitle ve tasarım

**Marka sloganı — 29 Ekim 2026, UBT kararı:** “Once a Dragoman, always a Dragoman.” Sloganın özgün İngilizce metni bu şekilde korunur. Sayfadaki kesin konumu ve diğer dillerdeki kullanımı henüz belirlenmedi.

Dragoman, Kaş ve Kekova'da 25 yılı aşan bölge deneyimi, güvenlik, doğaya saygı, uzman ve uzun süredir birlikte çalışan ekip, dürüstlük ve güvenilirlik üzerinden anlatılacak. A sınıfı seyahat acentesi olarak uygun paketlerde havalimanından havalimanına organizasyon yeteneği gösterilecek. Dalış ve eğitim, deniz kanosu, coasteering, yürüyüş, bisiklet, kültür ve kamplı turlar, kişiye özel haftalık programlar ve dalış bağlantılı yurtdışı turları hizmet envanteridir. Ulaşım ve konaklamanın bağımsız satış ürünü olup olmayacağı açık kalır. “Türkiye'de ilk ve tek” gibi üstünlük ifadeleri yayından önce Dragoman tarafından doğrulanır.

Hedefler Türkiye'deki seyahat acenteleri, dalış ve üniversite kulüpleri, bireysel müşteriler ve Kaş ziyaretçileridir. Türkiye ilk pazar; Fransa ve İngiltere sonraki öncelikler, Almanya ve ABD daha sınırlı pazarlardır. Google, tavsiyeler, Instagram, acenteler ve oteller mevcut erişim kanallarıdır. Mevcut logo korunur. Tasarım sade, dinamik, samimi, kurumsal ve premium olur; SeaKayak sitesinin kullanım kolaylığı ve marka renkleri referanstır. Nihai ana tasarım Dragoman'a gösterilip onaylanır.

### 2.1 Temel arayüz ilkesi — Modern, neat ve lean

UBT'nin açık yönlendirmesi: modern ve özenli görünen; Dragoman'ın müşterilerinin aradığını kolayca bulduğu **temiz, yalın ve anlaşılır** bir arayüz hazırlanacak. Başlıca kullanıcı işleri etkinlik keşfetmek, uygun etkinliğin bilgisini bulmak, rezervasyon talebi göndermek ve WhatsApp/e-posta ile iletişime geçmektir.

Görsel kalite güçlü gerçek fotoğraflar, marka renkleri, okunabilir tipografi, dengeli boşluklar ve tutarlı bileşenlerle sağlanır. Önce özet, ardından gerektiğinde ayrıntı sunulur. Her sayfada amaca uygun ana işlem belirgindir. Menü, bağlantılar ve dokunma alanları rahat kullanılır; hareket ve görsel efektler okumayı veya işlemi zorlaştırmaz. Yeni ürün eklenmesi görünüm standardını bozmamalıdır.

**Uygulayıcıya bırakılan tasarım ayrıntıları:** Kesin renk tonları, yazı tipleri, kart ölçüleri, boşluklar, kırpımlar, duyarlı ekran eşikleri, küçük etkileşimler ve mobil açılışın kesin sunumu bu ilkeye ve kabul edilmiş layout kararlarına göre tasarlanır. Her küçük ayrıntı ayrı bir iş kararı olarak UBT'ye sorulmaz; tasarım bütün olarak değerlendirilip Dragoman'a sunulur. Kesin renk/font veya nihai görsel seçimleri henüz yapılmadı. Mobil açılış için önerilmiş üç kısa yatay kartın alt alta dizilimi açıkça kabul edilmedi; zorunlu bir şablon gibi uygulanmaz.

## 3. Faz ve yayın kapsamı

| Alan | 1 Aralık 2026 MVP | Sonraki faz / etkinleştirme koşulu |
| --- | --- | --- |
| Kurumsal site | Temel sayfalar, hizmet/ürün tanıtımları, blog/haberler, iletişim, çalışan kalıcı bağlantılar | Yeni içerik türleri ve genişletilmiş kampanya işlevleri ayrı talep |
| Dil | Türkçe, İngilizce, Fransızca, Almanca; yayınlanan metinler yetkili onayından geçmiş | Ek dil ancak ayrı karar; Rusça arama terimi çalışması Rusça site sürümü demek değildir |
| SEO, GEO ve ölçüm | Teknik temel, indekslenebilir sayfalar, dil ilişkileri, yönlendirmeler, site haritası, QR hedefleri; GA4, Search Console ve GTM'nin izinlere uygun kurulumu | İçerik büyütme, kampanyalar ve ileri analiz sürekli iş |
| İletişim | Her sayfada kolay erişilen WhatsApp ve e-posta, çalışan iletişim formları; mobilde sabit işlem alanı | Gelişmiş CRM/otomasyon ayrıca değerlendirilir |
| Ürün ve rezervasyon | Ürünler ve satış yöntemi görünür; tarih tercihli rezervasyon **talebi** alınır ve Dragoman tarafından teyit edilir | POS açıldığında uygun ürünlerde çevrimiçi tahsilat; otomatik rezervasyon/kapora yalnızca kuralları onaylanınca |
| Ödeme | POS hazır değilse yayında ödeme alınıyormuş izlenimi verilmeyecek; onaylı iletişim veya talep akışı kullanılır | Sağlayıcı seçimi açık. POSNET entegrasyonu kolaysa aday; iyzico dışı alternatif araştırması sonraya bırakıldı. Güvenli canlı test ve ticari onayla açılır |
| Fatura | Sipariş/rezervasyon verileri faturaya elverişli biçimde tutulur; zorunlu bilgiler netleştirilir | e-Fatura entegrasyonu sağlayıcı, mali süreç ve testler hazır oldukça açılır |
| Yönetim ve medya | İlk yayına gerekli içerik, talep ve temel medya yönetimi; tüm panel kullanıcılarında 2FA ve onaylı rol/yetki sınırları | Detaylı audit log, gelişmiş medya kütüphanesi, finansal raporlama, gelişmiş rezervasyon, üyelik/indirim ve otomasyonlar hazır oldukça açılır |

MVP, doğrudan ödeme alınmadan da ürün ve rezervasyon talebinin çalışabildiği **aşamalı yayın** olarak kararlaştırılmıştır (23/25). Önceki taslakta “iletişim/rezervasyonla sınırlı yayın ayrıca onaylanmalı” kaydı vardı; 23/25 yanıtı bu faz ayrımını günceller. Bununla birlikte MVP'de hangi ürünün hangi işlem düğmesiyle açılacağı ve müşteriye hangi ödeme vaadinin gösterileceği ürün listesinde onaylanmalıdır. Yasal metinler, veri izinleri ve güvenli talep toplama olmadan ilgili akış yayına alınmaz.

## 4. Sayfalar ve içerik göçü

MVP sayfa grupları: ana sayfa; Dragoman/hakkımızda ve ekip; dalış ve eğitimler; deniz kanosu/Kekova; diğer doğa ve kültür etkinlikleri; yurtdışı dalış turları; ulaşım ve konaklama; kitaplar ve diğer ürünler; blog/haberler; iletişim; gerekli yasal metinler. Beş ana kategori ve temel sayfa şablonları aşağıda kabul edilmiş kararlardır. Kesin alt gruplar, yayına girecek etkinlik listesi ve nihai URL haritası içerik envanterinde tamamlanır. Haberler/öne çıkanlar alanında tur, teklif, duyuru veya blog yazısı panelden seçilebilir. **SSS kesin gereksinimdir**; etkinlik detaylarında ilgili onaylı soru-cevaplar sunulur.

**19/25 kararı:** UBT mevcut WordPress'teki sayfa, blog, ürün ve görselleri topluca aktarır; aktarılan içerikler **taslak** kalır. Dragoman içeriği inceleyip düzeltir ve onayladıklarını yayınlar. EN/FR/DE çeviriler DeepL API ile hazırlanır; ana içerik yayındaysa ayrı dil onayı beklenmez. Mümkün olan görsel ve açıklamalar korunur. Eski adresler korunur veya yeni karşılıklarına 301 yönlendirilir. İlk müşteri briefinin 17–18. sorularındaki içerik seçimi ve metin uzunluğu **müşteriden sonradan gelecek karardır**; UBT'ye devredilmiş sayılmaz. QR kodlu materyaller için yayınlanan hedef URL'ler kararlı tutulur. Google yorumları gösterilecektir; veri kaynağı, kullanım koşulu ve teknik yöntem UBT tarafından doğrulanır.

### 4.1 Ana kategoriler ve menü — kabul edildi

| Ana kategori | Mevcut kaynak adresi |
| --- | --- |
| Dalış / Diving | https://dragoman-turkey.com/diving/ |
| Deniz Kanosu / Sea Kayak | https://dragoman-turkey.com/sea-kayak/ |
| Doğa Aktiviteleri / Outdoor Activities | https://dragoman-turkey.com/outdoor-activities/ |
| Ulaşım ve Konaklama / Transportation and Accommodation | https://dragoman-turkey.com/transportation-and-accomodation/ |
| Mağaza / Shop | https://dragoman-turkey.com/shop/ |

Bu beş kategori ve aşağıdaki menü yapısı UBT tarafından kabul edildi. Tablo mevcut kaynak adreslerini gösterir; yeni URL'lerin kesin seçimi değildir. İngilizce başlıkta doğru yazım `Accommodation` kullanılması önerilir; eski URL sırf yazım düzeltmesi nedeniyle kendiliğinden değiştirilmez. TR/EN/FR/DE etiketler içerik/çeviri onayından geçer.

- **Masaüstü:** İki satırlı üst menü. İnce yardımcı satırda Hakkımızda, Blog, İletişim ve dil seçimi; ana satırda logo ve beş ana kategori bulunur.
- **Mobil:** Üstte logo, dil seçimi ve menü düğmesi; bağlantılar açılır menüde yer alır.
- **Mobil işlem alanı:** Altta sabit WhatsApp ve sayfaya/etkin satış yöntemine uygun Rezervasyon/İletişim alanı bulunur. İçerik ve formlar kapanmaz. Masaüstü menüsünün kaydırma davranışı Bölüm 2.1'deki tasarım ilkesiyle uygulayıcı tarafından belirlenir.
- **Ulaşım ve Konaklama:** Ayrı ana kategori ve iki bölüm korunur. 29 Ekim 2026 kararıyla teklif/bilgi talep formu eklenecek; form ilk aşamada mockup alanlarla hazırlanacak, nihai bilgiler UBT tarafından müşteriden alınacaktır. Bu karar doğrudan satış veya ödeme entegrasyonu eklemez.

### 4.2 Ana sayfa açılışı ve bölüm sırası — kabul edildi

**Öncelik tüm etkinliklerdir.** Kısa ana başlık ve tek cümlelik açıklama ile birlikte Dalış, Deniz Kanosu ve Doğa Aktiviteleri için üç güçlü gerçek fotoğraf kullanılır. Masaüstünde üç etkinlik alanı yan yana yer alır; kategori adı görünür ve ilgili kategoriye doğrudan geçilir. Fotoğrafların renk/kırpımları uyumlu tutulur. Mobilde üç kategorinin de kolay keşfedilmesi sağlanır; kesin sunum biçimi Bölüm 2.1'deki tasarım ilkesine göre uygulayıcı tarafından hazırlanır.

Kabul edilen bölüm sırası:

1. Üç fotoğraflı etkinlik açılışı: Dalış, Deniz Kanosu, Doğa Aktiviteleri.
2. Ulaşım/Konaklama ve Mağaza için kolay erişilen alanlar.
3. Öne çıkan turlar, etkinlikler ve duyurular; içerikler panelden seçilebilir.
4. Neden Dragoman? — deneyim, ekip, güvenlik ve doğaya yaklaşım.
5. Google yorumları.
6. Son blog yazıları.
7. İletişim bilgileri ve alt menü.

Açılış **fotoğraf temellidir**. Video kullanımı kabul edilmedi; eldeki çekimler görülürse ayrıca değerlendirilebilir. Fotoğraf dosyaları, başlık/açıklama metni, bölüm ölçüleri ve nihai görsel tasarım seçilmiş değildir. Bu yerleşim kabulü, eski içeriklerin veya tüm etkinliklerin yayın onayı anlamına gelmez.

### 4.3 Kategori sayfaları — kabul edildi

**Kategori içi elle sıralama — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı kategori sayfasındaki alt grupların sırasını ve her alt grup içindeki etkinlik kartlarının sırasını panelden elle değiştirebilir. Sıralama veritabanında ilgili kategori/alt grup ilişkisiyle kalıcı tutulur ve ziyaretçi sayfasında uygulanır; alfabetik veya eklenme tarihi sırası zorunlu değildir. Aynı sıralama mevcut dört dilde ilgili yayınlanmış içeriklere uygulanır; ayrı dil sıralama ürünü eklenmez. Bir kategori veya alt gruptaki sıralama değişikliği diğerlerini etkilemez. Arşivli veya yayın onayı olmayan içerik sıralama nedeniyle görünür hale gelmez. Panelde sıralama işleminin kesin kontrol biçimini uygulayıcı sade yönetim ilkesiyle belirler.

**Fiyat talep üzerine — 31 Ekim 2026, UBT kabulü:** Panelde etkinlik için “Fiyat talep üzerine” fiyat gösterim biçimi seçilebilir. Bu durumda kategori kartında ve detay sayfasında sayısal tutar yerine ilgili dilde bu ifade gösterilir; boş fiyat sıfır veya ücretsiz olarak yorumlanmaz. Ziyaretçi aynı etkinlik talep formundan tarih ve kişi sayısını, varsa seçeneklere göre kişi dağılımını iletir. Talep ilgili etkinlik ve seçeneklerle kaydolur; yeni bir teklif formu veya ayrı iş akışı gerekmez. Bu fiyat biçimi seçiliyken kartta “başlayan” tutarı hesaplanmaz ve kesin toplam uydurulmaz. Veri modelinde bu fiyat biçimi sayısal fiyat gösteriminden ayırt edilir. Sayısal fiyat veya “başlayan” gösterimi kullanılan etkinlikler için önceki kurallar korunur; talep gönderimi kesin fiyat, müsaitlik veya rezervasyon onayı değildir.

**Seçenekli etkinlikte kart fiyatı — 31 Ekim 2026, UBT kabulü:** Bir etkinlikte birden fazla fiyat seçeneği varsa kategori kartında sunulan seçeneklerin en düşük geçerli fiyatı, kişi/paket gibi fiyat temelini koruyarak, ilgili dilde “45 €’dan başlayan” biçiminde gösterilir. Detay sayfasında bütün sunulan seçenekler kendi fiyat ve açıklamalarıyla gösterilir. Kart tutarı ilgili seçeneklerden türetilir; seçeneklerden kopuk ayrı bir tutar girilmez. Farklı para birimleri veya kişi/paket temelleri doğrudan sayısal olarak karşılaştırılmaz; mevcut onaylı fiyat/kur kuralları korunur. Fiyatı bilinmeyen seçenek sıfır tutar sayılmaz. Bu gösterim kesin rezervasyon veya ödeme onayı değildir.

**Deniz kanosu içerik kaynağı — 31 Ekim 2026, UBT kararı:** Deniz kanosu etkinliklerinin başlangıç envanteri ve içeriklerinde https://dragomanseakayak.com/tr/ ve ilgili tur/deneyim detay sayfaları esas alınır. Eski dragoman-turkey.com/sea-kayak/ sayfasıyla ad, süre, rota veya program çelişirse bu kaynak önceliklidir; aynı turun eski ve yeni anlatımı iki ayrı etkinlik olarak çoğaltılmaz. Kaynak seçimi bütün metin/fiyatların otomatik yayın onayı değildir; mevcut taslak, güncel çeviri ve yayın kabulü kuralları korunur. Deniz Kanosu başlangıç listesi: günlük Kekova Klasik, Kekova Batı, Kekova Doğu; çok günlük Kekova Körfezi (2 gün/1 gece), Işık Kıyısı (4 gün/3 gece), Kekova Deniz Kayağı & Gulet Turu (7 gün/6 gece), Likya Kayak & Konfor Kaçamağı (7 gün/6 gece), Karia Kıyısı (7 gün/6 gece); ayrıca TRAK Signature Deneyimi ayrı deneyim kaydıdır. Özel/kişiye özel tur sayfası programı müşteriye göre hazırlanan teklif hizmeti için kaynak olur; buradaki genel ifadelerden yeni adlandırılmış Outdoor ürünleri uydurulmaz. Outdoor için mevcut ayrı etkinlik envanteri korunur; yeni kaynakta karşılığı bulunmaması silme gerekçesi değildir.

**Filtre kararı — 29 Ekim 2026:** İlk sürümde etkinlik keşfi kategori, anlaşılır alt başlıklar ve kartlarla sağlanır. Süre veya deneyim seviyesi gibi ek filtreler ilk sürüm kapsamına alınmaz; ihtiyaç doğarsa ayrıca değerlendirilir.

Üstte kategori başlığı, kısa tanıtım ve bir kapak fotoğrafı yer alır. Ardından etkinlikler anlaşılır alt başlıklarla gruplanır ve fotoğraflı kartlarla sunulur. Kartta ad, kısa açıklama, süre, varsa onaylı fiyat ve **İncele** düğmesi bulunur; ayrı etkinlik detay sayfasına geçilir. Masaüstünde kartlar yan yana, mobilde tek sütundur. Kesin masaüstü sütun sayısı tasarım bütünlüğüne göre uygulayıcıya bırakılır.

Dalış için deneme dalışı/sertifikalı dalışlar/eğitimler; Deniz Kanosu için günlük/çok günlük turlar örnek gruplardır. Doğa Aktiviteleri arşivinde çok aktiviteli turlar, yürüyüş, bisiklet, coasteering, tekne, kültür ve özel turlar bulunuyor. Bunlar kesin yayın/alt menü listesi değildir; güncel ürün envanteriyle doğrulanır. Mağazada kitap kartları; Ulaşım ve Konaklama'da transfer ve konaklama için iki ayrı bölüm kullanılır.

### 4.4 Etkinlik detay sayfası — kabul edildi

**E2E sadelik sınırı — 31 Ekim 2026, UBT yönlendirmesi:** Form doldurulurken fiyat değişmesi için özel “Fiyat güncellendi” uyarısı ve yeniden onay adımı istenmiyor; bu öneri kapsam dışıdır. Mevcut sunucu fiyat doğrulaması ve Dragoman fiyat teyidi kuralı korunur. E2E kapsamı normal müşteri akışı, kayıt korunması, bildirim ve yetki sınırlarına odaklanır; varsayımsal hassas uç durumlar için yeni ürün özelliği eklenmez.

**Talep formunda fiyat özeti — 31 Ekim 2026, UBT kabulü:** Sayısal fiyatı bulunan etkinlik seçeneklerinde talep formu seçilen seçeneklerin kişi sayısı ve birim fiyatını satır satır, hesaplanan toplamla birlikte gösterir. Örnek: 2 yemekli × 60 EUR + 2 yemeksiz × 45 EUR = 210 EUR. Özet, talep anındaki hesap olarak etiketlenir; kesin fiyatın Dragoman tarafından teyit edileceği belirtilir. Seçenek adetleri değişince özet güncellenir. Kişi başına fiyatın geçerli olduğu örnekte adet × birim fiyat kullanılır; farklı kişi/paket fiyat temelleri veya para birimleri doğrudan toplanmaz, mevcut onaylı fiyat/kur kuralları uygulanır. “Fiyat talep üzerine” etkinliklerde toplam gösterilmez; eksik fiyat sıfır sayılmaz ve hesaplanamayan toplam uydurulmaz. Sayısal fiyatlar ve hesaplanan özet sunucuda doğrulanır; istemciden gelen tutar doğru kabul edilmez. Talep anındaki seçenek, adet, birim fiyat/para birimi ve hesaplanmış özet korunur; sonraki fiyat değişiklikleri eski talebi değiştirmez. Bu özet tahsilat, kesin fiyat veya rezervasyon onayı değildir.

**Etkinlik arşivleme — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı panelden artık sunulmayan etkinliği arşivleyebilir. Arşivlenen etkinlik ziyaretçi kategori listeleri, kartları ve öne çıkan seçimlerinin yayındaki çıktılarından kaldırılır. İçerik, seçenekler ve mevcut taleplerle ilişkiler veritabanında korunur; arşivleme silme değildir. Arşivlenmiş etkinlik için yeni talep kabul edilmez; eski talepler yetkili panelde kendi kayıtlarıyla okunabilir. Etkinlik tekrar yayına alınabilir; mevcut yetki, güncel çeviri ve yayın koşulları yeniden uygulanır. Eski detay URL adresinin karşılığı, mevcut SEO-02 ve yönlendirme kurallarına göre belirlenir; arşivleme alakasız ana sayfa yönlendirmesi veya mevcut talep verilerinin silinmesi anlamına gelmez.

**Gün gün tur programı — 31 Ekim 2026, UBT kabulü:** Çok günlük etkinliklerde panelden sıralı program maddeleri eklenebilir; her madde gün başlığı ve açıklama içerir (örneğin 1. Gün, 2. Gün). Maddeler ilgili etkinliğe bağlı ayrı kayıtlar olarak tutulur; sıraları korunur ve güncel dört dil ve çeviri kuralları uygulanır. Etkinlik detayındaki ortak şablon bu programı gün sırasıyla gösterir. Günlük turda veya program girilmeyen etkinlikte boş program bölümü ve başlığı gösterilmez. Program düzenlemek yeni sayfa tasarımı veya kod değişikliği gerektirmez; serbest sayfa kurucu kapsamı oluşturmaz.

**Grup talebinde seçenek dağılımı — 31 Ekim 2026, UBT kabulü:** Bir etkinlik için birden fazla seçenek sunuluyorsa grup talebinde her seçeneğe kişi sayısı atanabilir; örneğin dört kişiden ikisi yemekli, ikisi yemeksiz olabilir. Seçenek adetleri sıfır veya pozitif tam sayı olmalı ve toplamları talebin kişi sayısına eşit olmalıdır. Sıfır adet seçilmeyen seçenek anlamındadır; negatif/kesirli adet veya toplam uyumsuzluğu geçerli talep olarak kaydedilmez. İlk kısa talepte bu dağılım için katılımcı adları istenmez. Talep, etkinliğe bağlı seçenekler ve her birinin kişi sayısını korur; önceki seçenek kimliği ve talep anındaki ad/fiyat/para birimi bilgilerini koruma kuralı her seçenek satırında geçerlidir. Seçeneksiz etkinlikte seçenek dağılımı istenmez. Bu dağılım kesin rezervasyon, müsaitlik veya tahsilat onayı değildir.

**Etkinlik seçenekleri — 31 Ekim 2026, UBT kabulü:** Aynı etkinliğin yemekli/yemeksiz veya ekipmanlı/ekipmansız gibi seçenekleri ayrı etkinlik sayfaları oluşturmaz. Seçenekler ilgili etkinlik kaydına bağlı, ayrı kimlikli kayıtlar olarak yönetilir; tek detay sayfasında kendi açıklama ve fiyatlarıyla gösterilir. Seçenek sunulan etkinlikte müşteri talep gönderirken tercihini seçer ve seçim ilgili talebe kaydedilir. Seçenek kimliği ile talep anındaki ad/açıklama ve gösterilen fiyat/para birimi bilgisi korunur; sonraki seçenek veya fiyat düzenlemesi eski talebin anlamını değiştirmez. Bu seçim kesin müsaitlik, rezervasyon veya ödeme onayı oluşturmaz; mevcut fiyat ve faz kuralları geçerlidir. İlk talebin kabul edilmiş alanlarına yalnızca ilgili etkinliğin seçenek seçimi eklenir; sağlık bilgisi bu aşamaya taşınmaz. Yeni bir gelişmiş ürün yapılandırma aracı kapsamı oluşturulmaz.

**Ortak etkinlik yapısı — 30 Ekim 2026, UBT kabulü:** Dalış, Deniz Kanosu ve Outdoor etkinlikleri veritabanında ortak Etkinlik yapısını kullanır; her etkinlik ayrı kimliği olan bağımsız bir kayıttır. Kategori, başlık, açıklama, fotoğraflar, süre, fiyat, SSS ve kullanılacak form ilgili etkinlik kaydıyla ilişkilendirilir. Mevcut dil, taslak/yayın, fiyat ve form kuralları korunur. Ziyaretçi tarafında ortak etkinlik detay şablonu kullanılır; boş bırakılan isteğe bağlı bölümler gösterilmez. Yeni etkinlik panelden eklenerek aynı şablonda sunulur; her etkinlik için yeniden sayfa tasarımı veya kod değişikliği gerekmez. Ortak etkinlik yapısı, ayrı Dalış ve Outdoor sağlık formu kayıtlarını birleştirmez. Mağaza ile Ulaşım/Konaklama bu kararla etkinlik yapısına zorunlu olarak dahil edilmez. Kesin tablo adları ve teknik ilişki düzeni uygulayıcıya bırakılır.

Üstte etkinlik adı ve kısa özet bulunur. Masaüstünde sol tarafta fotoğraf galerisi, deneyimin anlatımı, program, dahil/hariç hizmetler, katılım koşulları ve buluşma bilgileri yer alır. Sağda sayfa kaydırılırken görünür kalan bilgi kutusunda varsa onaylı fiyat, süre, temel bilgiler ve **Rezervasyon Talebi** düğmesi bulunur. Düğme ilgili etkinliğin talep formuna götürür.

Mobilde tek sütun ve altta kararlaştırılan sabit WhatsApp ile sayfaya uygun Rezervasyon/İletişim alanı kullanılır. Formu başlatmak, tarih müsaitliğinin onaylanması veya ödeme yapılması anlamına gelmez. Bölüm 5'teki ürün yöntemi ve faz ayrımı korunur; farklı işlem yöntemindeki ürünlere yanlış satın alma/talep vaadi gösterilmez.

### 4.5 Cankurtarma Eğitimleri — yerleşim kabul edildi, hizmet kapsamı geçici

UBT hizmetin devamı için **“Devam ediyor diyelim şimdilik.”** yanıtını verdi. Daha sonra **Dalış menüsünün altında Cankurtarma Eğitimleri adlı ayrı sayfa** olmasını kabul etti. Beş ana kategori korunur; altıncı ana kategori eklenmez.

Eski Türkçe sayfada Bronz, Gümüş, Altın ve belge yenileme bölümleri var; bunlar sayfada gruplanabilir. Hangi eğitimlerin halen sunulduğu, fiyatlar, koşullar ve diğer dillerdeki metinler müşteriyle doğrulanır. Menü konumu kararı, eski eğitim/koşulların yayına kabulü veya nihai ürün listesi değildir.

### 4.6 WordPress export incelemesi ve kaynak dosyalar

**Medya indirme güncellemesi — 29 Ekim 2026:** UBT'nin işaret ettiği `C:\temp_private\dragoman\cloner` klasöründeki `dragomandivingandoutdoors.WordPress.2026-10-29.xml` yalnızca medya kayıtlarını içeriyor: 958 kayıt, önceki exportla aynı 323 farklı görsel adresi. UBT'nin talimatıyla 323 görselin tamamı `C:\temp_private\dragoman\cloner\images` klasörüne indirildi; başarısız indirme yok. Dosya boyutları ve SHA-256 değerleri doğrulandı; adres/dosya eşleştirmesi `C:\temp_private\dragoman\cloner\media-download-manifest.json` dosyasında tutuluyor. Toplam boyut 87.003.713 bayt. Bu klasör, dokümantasyon reposu olan `C:\temp_private\dragomanew` klasöründen farklıdır; uygulayıcı gerçek görsel kaynağı olarak bu yolu kullanabilir. Aşağıdaki medya dosyalarının eksikliğine ilişkin bulgular 26 Ekim'deki export incelemesinin tarihsel durumudur. Görseller henüz görsel kalite, yerleşim veya nihai yayın seçimi açısından incelenmedi.

25 Ekim 2026 tarihli yerel WordPress exportu 26 Ekim'de analiz edildi. Bulgular export anına aittir; canlı sitede güncel hizmet/fiyat doğrulaması yapılmış sayılmaz.

| Alan | Bulgu |
| --- | --- |
| İçerik | 49 sayfa, 25 yazı, 11 ürün, 3 tekrar kullanılabilir blok: toplam 88 içerik kaydı |
| Dil | URL'ye göre TR/EN/FR mevcut, DE yok. URL dili çeviri kalitesi veya yetkili onayı değildir |
| Ürünler | 11 ürün kaydı dört kitap/baskının dil sayfalarına karşılık geliyor; 11 farklı fiziksel ürün değildir |
| Stok | Ürün kayıtlarında stok yönetimi kapalı ve miktarlar boş; gerçek başlangıç stoğu çıkarılamıyor |
| Medya | 958 kayıt, 323 farklı dosya adresi; gerçek fotoğraf/video dosyaları yerel arşivde yok |
| Form | Dört Contact Form 7 tanımı var. Mevcut rezervasyon formları V4/V5'in tarih, kişi sayısı ve ayrı katılımcı akışını tek başına karşılamıyor |
| Bağlantı | Eski Flywheel adresleri ve hedefi exportta bulunmayan site içi bağlantılar var. Canlı HTTP kontrolü yapılmadığından bunlar doğrulanmış 404 değildir |

Kekova Classic/West/East ile Lycian Kayak & Comfort Escape'ın EN/TR/FR ayrıntıları WordPress yazısı olarak bulunuyor. Yeni sistemde bu kaynaklar yalnızca blog sayılmaz; kategori sayfasındaki aynı turla eşleştirilerek etkinlik detayı için değerlendirilir, çift içerik üretilmez. Dalış ve Doğa Aktiviteleri sayfalarında gömülü uzun eğitim/tur açıklamaları vardır.

ID **2, 335 ve 936** boş başlıklı veya `sample-page` adresli olsa da ana sayfa içeriği taşır; otomatik elenmez. ID **1**, “Hello world!” örnek yazısıdır; yayına taşınmaması önerilir. Sharm El Sheikh'in 25–31 Ekim 2026 turu hedef 1 Aralık yayını için geçmiş tarihli olacaktır; aktif teklif olarak otomatik taşınmaz.

Yerel düzen: `cloner/source/` özgün XML; `cloner/extracted/` tek çıkarılmış çalışma kopyası; `cloner/archive/` aynı içeriğin diğer kopyaları ve ek dosyalar; `cloner/analysis/` rapor/CSV/JSON envanterleri. 200 kaynak dosya silinmeden taşındı ve SHA-256 ile doğrulandı; iki klasör ve ZIP aynı, 88 çıkarılmış HTML kaynak XML ile eşleşiyor. Ham kaynaklarda yazar, form ve kupon bilgileri de bulunduğundan `source/`, `extracted/`, `archive/` kök `.gitignore` ile yerelde tutulur; kamuya açık depoya otomatik eklenmez.

[Analiz raporu](../cloner/analysis/Dragoman_WordPress_Analizi.md), [içerik envanteri](../cloner/analysis/content-inventory.csv), [çeviri matrisi](../cloner/analysis/translation-matrix.csv), [etkinlik adayları](../cloner/analysis/activity-candidates.csv), [medya envanteri](../cloner/analysis/media-inventory.csv) ve [yönlendirme adayları](../cloner/analysis/redirect-candidates.csv) uygulamayı destekler. Aday listeleri güncel aktif ürün onayı değildir. Medya ayrıca edinilip görsel kalite/kırpım/kullanım hakkı bakımından incelenmelidir. Yönlendirme listesindeki yeni URL alanları nihai adres kararı bekler.

### 4.7 Sık Sorulan Sorular — kesin gereksinim

UBT, **“SSS olacak kesinlikle, Google ve SEO için önemli.”** yanıtıyla soru-cevap alanını kesinleştirdi. Etkinlik detaylarında ürüne özel kısa soru-cevaplar açılıp kapanabilir alanlarda sunulur. Sorular gerçek ziyaretçi ihtiyaçlarını yanıtlar; deneyim gereksinimi, hazırlık/ekipman, buluşma, süre ve ürüne uygun diğer bilgiler kullanılabilir. Fiyat, sağlık/katılım, çocuklar veya iptal gibi konularda yanıtlar onaylı ürün koşullarıyla tutarlı olmalıdır; kural uydurulmaz.

SSS desteği ilk yayın şablonunda yer alır; onaylı içeriği olmayan boş bloklar gösterilmez. Sorular panelden düzenlenebilir ve mevcut TR/EN/FR/DE çeviri/onay akışına tabidir. Açılıp kapanma klavye ve dokunmayla kullanılabilir olmalı; yanıtlar taranabilir sayfa içeriği olarak sunulmalıdır. Ayrı genel SSS sayfası veya yeni ana menü öğesi kararı alınmadı. Ana sayfanın kabul edilmiş bölüm sırası değişmez.

**SEO uygulama notu — 26 Ekim 2026 kontrolü:** Google'ın resmî değişiklik kaydı, FAQ zengin sonuçlarının 7 Mayıs 2026'dan itibaren gösterilmediğini ve ilgili dokümantasyonun Haziran 2026'da kaldırıldığını belirtiyor. Bu nedenle SSS gereksinimi, Google'da özel FAQ görünümü elde etme veya sıralama garantisi olarak yazılmaz; yararlı, konuya uygun ve erişilebilir içerik olarak uygulanır. Genel Schema.org gereksinimleri uygun içerik türleri için korunur; FAQPage işaretlemesi özel Google görünümü sağlayacakmış gibi zorunlu tutulmaz. [Google Search Central değişiklik kaydı](https://developers.google.com/search/updates#may-2026).

### 4.8 Önce şablon, sonra içerik — UBT kararı

Önce bütün kapsam içi sayfa türlerinin **dolu şablonları** hazırlanır: uygun `cloner` kaynakları kullanılır, eksikler mockup içerikle tamamlanır. UBT gerçek içerikleri daha sonra müşterinin tercihlerine göre günceller. Her etkinliğin adını, aktif/arşiv durumunu veya kesin metnini tek tek belirlemek şablon geliştirmeyi bekletmez. UBT'nin genel görünüm değerlendirmesinden sonra panel, form kayıtları ve bildirim bağlantıları tamamlanır; Bölüm 1.1'deki geliştirme sırası esas alınır.

| Şablon grubu | Hazırlanacak yapı |
| --- | --- |
| Ana sayfa | Kabul edilen açılış ve bölüm sırası; panelden seçilecek fotoğraf, başlık, öne çıkan içerik ve diğer alanlar |
| Kategori / liste | Kısa tanıtım, kapak, yönetilebilir alt gruplar ve ilgili içerikten üretilen kartlar |
| Etkinlik / tur / eğitim detayı | Kabul edilen galeri, özet, program, dahil/hariç, koşullar, buluşma, SSS ve uygun talep/iletişim alanları; aynı yapı farklı içeriklerle yeniden kullanılabilir |
| Kitap / ürün | Liste kartı ve ürün detayı; baskı dili, açıklama, görseller, fiyat/stok/teslim alanları ve faza uygun işlem |
| Blog / haber / duyuru | İçerik listesi ve yazı detayı; metin, medya, tarih, ilgili içerik ve SEO alanları |
| Hakkımızda / ekip | Marka anlatısı ve yönetilebilir ekip içerikleri; kesin kişi ve metinler sonradan girilir |
| İletişim / yasal içerik | İletişim bilgileri ve ilgili form/bağlantı yapısı; düzenlenebilir yasal metin sayfaları |
| Ulaşım ve Konaklama | Kabul edilmiş iki bölüm ve teklif/bilgi talep formu; başlangıçta mockup alanlar, müşteriden alınan bilgilerle UBT tarafından sonradan düzenleme |

**İçerik yönetimi:** Başlık, kısa özet, metin, fotoğraf/galeri, kategori, sıralama ve şablona özgü alanlar yetkili kullanıcı tarafından doldurulur. İsteğe bağlı alan veya bölüm boşsa temiz biçimde gizlenir; zorunlu alanlar yayın öncesinde doğrulanır. Uzun/kısa metin ve dört dilde farklı uzunluklar kartları ve sayfa düzenini bozmamalıdır. Bu karar serbest sayfa tasarım editörü veya kapsam dışı yeni içerik türleri talebi değildir; onaylanmış düzeni koruyan tekrar kullanılabilir şablonlar esastır.

**Sade editör — 29 Ekim 2026 kabulü:** UBT içerik girişini blog mantığında başlık, metin ve altta fotoğraflarla tarif etti. İçerik editörü bu basit akışı izler; sayfa yerleşimini kullanıcıdan tek tek kurması beklenmez. Daha önce kararlaştırılmış fiyat, süre, kategori veya form gibi işlevsel alanlar ilgili yerde korunur. Genel tasarım düzenlemelerini UBT topluca ele alacaktır. Ek iş yükü yaratacak ayrı masaüstü/mobil önizleme özelliği kapsamda değildir. Belgede geliştirme/önizleme ortamı denilen yerler, ayrı bir panel önizleme aracı taahhüdü anlamına gelmez. Mevcut taslak ve ana içerik yayın kararı ve güncel otomatik çeviri akışı korunur.

**Dolu şablonlarla çalışma — 29 Ekim 2026 netleştirmesi:** Şablonlar boş teslim edilmez; sayfa düzeni ve akışlar değerlendirilebilsin diye temsili içerikle doldurulur. Öncelikle UBT'nin verdiği proje klasörlerindeki uygun kaynaklar, özellikle `cloner/extracted/` içindeki eski site içerikleri ve `Dragoman_Proje_Brief_assets/` içindeki uygun dosyalar kullanılır. Kaynakta bulunmayan alanlar açıkça örnek olarak tanımlanan mockup içeriklerle tamamlanır. Mevcut gerçek bilgilerden yararlanılır; her alan için müşteriden yeni içerik beklenmez. Exportta medya adresi bulunması, gerçek görsel dosyasının yerelde bulunduğu anlamına gelmez; uygun yerel görsel yoksa temsili görsel kullanılır. Bu karar şu anda görsel taslak veya uygulama üretme talimatı değil, Claude Code'a verilecek geliştirme gereksinimidir.

**Geliştirme / yayın ayrımı:** Doldurulmuş şablonlar geliştirme/önizleme ortamında kontrol edilir. Kaynaktan alınan eski içerik güncel müşteri onayı sayılmaz; örnek metin, görsel, fiyat, stok, personel veya hesap bilgileri de gerçek onaylı içerik olarak yayınlanmaz ve indekslenmez. Hukuki, sağlık ve katılım koşulları örnek kullanılıyorsa açıkça yer tutucu olarak belirtilir; gerçek politika yerine geçmez. Gerçek hesap ve erişim bilgileri mockup içine yazılmaz. Nihai başlık, ürün listesi, görsel, fiyat ve koşullar için UBT/Dragoman'ın içerik girişi ve mevcut onay akışları geçerlidir. Şablonun hazır olması gerçek ödeme, e-Fatura veya rezervasyon entegrasyonunun tamamlandığı anlamına gelmez.

**Önceki aktarım kararı korunur:** WordPress envanteri şablon alanlarını anlamak ve sonraki taslak içerik aktarımı için kaynaktır; eski içerikler canlıya otomatik alınmaz. Nihai içerik/URL/yönlendirme matrisi yayın öncesinde tamamlanır. Dört dilde onaylı içerik ve MVP yayın ölçütleri değişmez; kullanıcı, içerikleri geliştirme bittikten sonra dolduracağını söyledi diye boş şablonlarla canlı yayın onayı verilmiş sayılmaz.

## 5. Ürün, fiyat ve stok

### 5.1 Ürün bazında işlem yöntemi

Yönetim panelinde her ürün/hizmet için yöntem seçilip sonradan değiştirilebilir: **Doğrudan satın al**, **Form doldurarak satın al**, **İletişime geç**. Kitap doğrudan satın alma için örnektir. Deneme dalışı, Kekova Klasik Kano Turu ve Kekova Tekne Turu müşterinin ilk çevrimiçi satış için önerdiği adaylardır; “olabilir” ifadesi nedeniyle kesin ürün listesi değildir. 1 Aralık'ta POS henüz etkin değilse “satın al” düğmesi çalışmayan ödeme adımına bağlanmaz; o ürün için açıkça rezervasyon/sipariş talebi veya iletişim seçeneği gösterilir. Panelin satış yöntemi kararı ile faza göre etkin işlem birbirinden ayrı izlenir.

**6–10/25 ürün kararları:** Panelden etkinliğe ücretli veya ücretsiz ek hizmet tanımlanır; hizmet kişi başına veya rezervasyon başına ücretlendirilebilir ve müşteri rezervasyon sırasında seçer. Etkinlikte kişi başı, grup başı ve katılımcı sayısına göre kademeli fiyat desteklenir. Sezonluk tarih aralıkları ve belirli günlere özel fiyat tanımlanır. Ürün/etkinlik taslak hazırlanır; yalnızca ana yönetici veya yayın yetkilisi onayından sonra görünür. Bu seçeneklerin somut değerleri Dragoman ürün cetvelinden alınır.

### 5.2 Fiyat ve para birimi

Panelde ürünün **EUR ana fiyatı** tutulur; sitede EUR ve otomatik güncellenen kurla hesaplanan TL karşılığı birlikte görünür. TL bağımsız ikinci fiyat olarak girilmez ve **iki ondalık basamakla** gösterilir. Müşteri ödeme sırasında EUR veya TL seçebilir; sağlayıcının iki para birimini destekleme koşulu UBT tarafından doğrulanır. Kur ödeme ekranına girildiğinde sabitlenir; ödeme oturumu ve sabit kur **30 dakika** geçerlidir. Başarısız ödeme sonrası aynı oturumda kur değişmez. Kur sağlayıcısı, uygulanacak marj/masraf ve yuvarlama ayrıntıları ayrıca doğrulanır. Ürün başına kişi/grup fiyatı, sezonsallık, çocuk indirimi, ekipman, transfer ve ekstralar müşteri ürün cetvelinde tanımlanır. Ödeme açıldığında toplam tutar ve tahsilat para birimi açık gösterilir.

Kitaplar bir sepette birlikte satın alınabilir. Etkinlikler kitap sepetinden ve birbirinden **ayrı** satın alınır. Bir etkinliğin birden fazla katılımcısı ise **tek rezervasyon ve tek ödeme** altında yer alabilir; her katılımcının formu ayrıdır. Önceki “kitaplar ve etkinlikler aynı sepette” yanıtı, daha sonra verilen bu ayrıştırma kararıyla güncellenmiştir.

### 5.3 Kitap teslimatı ve stok

Kitaplarda Kaş ofisinden teslim, Türkiye içine kargo ve yurtdışına kargo seçenekleri bulunur. Kargo ücreti ödeme/talep öncesinde görünür; ülke veya bölge bazındaki ücret panelden tanımlanıp değiştirilebilir. Gönderilecek ülkeler, somut ücretler ve teslim süreleri müşteri envanterinde netleşir. Kitap stoku izlenir ve sıfıra indiğinde satın alma otomatik kapanır. Baskı/dil varyantlarının ayrı stoklanması ve başlangıç miktarları ayrıca doğrulanır. Eşzamanlı son stok siparişinde çift satış yapılmaması kabul testine dahildir.

## 6. Rezervasyon ve katılımcı iş akışı

**Talep başına tek etkinlik — 31 Ekim 2026, UBT kabulü:** Her etkinlik talebi veritabanında tek bir etkinlik kaydıyla ilişkilendirilir. Aynı etkinliğin seçeneklerine göre kişi dağılımı tek talepte tutulabilir; başka bir etkinliğin seçenekleri bu talebe eklenmez. Ayrı dalış ve deniz kanosu etkinlikleri isteyen ziyaretçi iki ayrı talep gönderir. Önceden tanımlanmış çok aktiviteli hazır paket, kendi bağımsız etkinlik kaydı üzerinden tek talep olarak alınır; paketin içerdiği aktiviteler kendiliğinden ayrı talepler oluşturmaz. İlk etkinlik talebi aşamasına çok etkinlikli sepet veya birleşik rezervasyon akışı eklenmez. Bu karar Mağaza veya sonraki ödeme fazının mevcut kapsamını değiştirmez.

**Grup katılımcılarının e-postaları — 29 Ekim 2026, UBT kabulü:** Dragoman ekibi etkinlik ve tarihi müşteriyle teyit ederken diğer katılımcıların da ad-soyad ve e-posta bilgilerini alıp ilgili talebe ekler. Sistem her katılımcının kendi güvenli sağlık formu bağlantısını doğrudan o katılımcının e-postasına gönderir. İlk kısa talep formuna diğer katılımcıların bilgileri eklenmez. Grup gizliliği kuralları korunur; çocuk/veli temsil süreci ayrıca netleştirilecektir.

**İlk talep formu — 29 Ekim 2026 kabulü:** Başlangıç şablonunda etkinlik ilgili sayfadan otomatik seçilir; ad-soyad, e-posta, tercih edilen tarih ve kişi sayısı zorunlu, telefon ve mesaj isteğe bağlıdır. Tarih kesin müsaitlik onayı değildir. Ayrıntılı katılımcı ve sağlık bilgileri bu ilk talepte istenmez; gereken etkinliklerde sonraki katılımcı formu aşamasında alınır. UBT bu yapıyı başlangıç olarak kabul etmiş, formların içeriğinin daha sonra değiştirileceğini belirtmiştir. Form başlıkları, açıklamaları, alanları, sıraları ve zorunlulukları yetkili kullanıcı tarafından panelden düzenlenebilir olmalıdır; bu başlangıç alanları değişmez nihai form olarak kodlanmaz. Talebin ilgili etkinlikle eşleşmesi ve takip için gerekli bilgiler korunur; alan değişiklikleri önceki taleplerin yanıtlarını kaybettirmez. Nihai sağlık/katılım soruları ve onay metinleri ayrıca doğrulanır.

1. Ziyaretçi ürünü, açıklamasını, fiyatını ve varsa koşullarını görür; tercih ettiği tarihi ve kişi sayısını girer.
2. Ürünün satış yöntemi ve fazdaki etkin işlemine göre doğrudan işlem, koşullu form veya iletişim yolu açılır.
3. Katılım formu gereken grup rezervasyonunda **her katılımcı için ayrı** bilgi ve yanıt alınır. Rezervasyonu yapan kişinin formu diğerlerinin yerine geçmez. Her katılımcıya kendi formu için özel güvenli bağlantı, Dragoman etkinlik ve tarihi müşteriyle teyit ettikten sonra gönderilir (Bölüm 6.1); ilk talepte otomatik gönderilmez. Ödeme, formlar tamamlanmadan alınabilir; gerekli form ve onaylar **etkinlik öncesinde** tamamlanır.
4. Ürüne özel sağlık/katılım yanıtlarından insan değerlendirmesi gerektirenler otomatik “uygun” sayılmaz. Çocuk ve veli onayı, formların tamamlanma son tarihi ve formu kimin doldurabileceği ayrıca belirlenir.
5. Tarih seçimi kesin müsaitlik veya onay vaadi değildir. Dragoman tarihi ve gerekiyorsa katılım koşullarını teyit eder; personelin ayrıca müsaitlik takvimi tutması zorunlu değildir.
6. Talep, iletişim bilgileri ve ürün/tarih/katılımcı sayısıyla yetkili ekibe ulaşır; kayıt ve durum işletme tarafından görülebilir.
7. **1/25 geliştirici kararı, ödeme fazı açıldığında:** Ödeme alındığında rezervasyon **Onay Bekliyor** durumunda kalır. Dragoman tarih ve katılım uygunluğunu kontrol edip onayladığında **Onaylandı** olur. Ödeme, tek başına kesin rezervasyon anlamına gelmez. Durum değişiklikleri müşteriye e-postayla bildirilir. Bu ödeme öncesi/sonrası işleyişin ticari ve hukuki koşulları Dragoman tarafından yayın öncesi teyit edilir.

**2/25 geliştirici kararı, ödeme fazı açıldığında:** Dragoman rezervasyonu onaylayamazsa alternatif tarih önerebilir. Müşteri yeni tarihi kabul ederse rezervasyon o tarihe taşınır ve Dragoman onayıyla kesinleşir. Müşteri reddederse iade süreci başlatılır; iade, ödemenin yapıldığı para biriminde yürütülür ve müşteri seçtiği dilde bilgilendirilir. Karma iadenin güncel teknik yaklaşımı Bölüm 7'dedir: sağlayıcı desteklerse panelden, desteklemezse işletmenin manuel iade yapıp kaydetmesi. Ticari iptal/iade koşulları ilgili ödeme fazı öncesinde Dragoman tarafından doğrulanır.

Eksik form için katılımcıya etkinlikten **72 ve 24 saat önce** otomatik e-posta gider; Dragoman panelde eksikleri görür. Etkinlik günündeki eksikler işaretlenir ve ekip gerekli form/onayları kontrol ederek katılım durumunu belirler. Katılımcı gönderdiği formu düzenleyebilir; değişiklik Dragoman'a bildirilir ve gerektiğinde yeniden değerlendirilir. Katılımcı değişikliğini rezervasyon sahibi talep eder; Dragoman onayından sonra yeni kişiye form bağlantısı gönderilir. Kişi sayısı veya tarih değişikliği müşteri talebi ve Dragoman onayıyla yapılır; gerekirse ek ödeme/iade veya alternatif tarih uygulanır. Tarih değişikliğinde eski fiyatı koruma veya fark uygulama kararını Dragoman verir.

Üye olmadan satın alma desteklenir. Müşteri e-postasındaki güvenli kişisel bağlantıyla rezervasyonunu yönetir; bağlantı etkinlik tamamlanana kadar geçerlidir. İptal/iade, katılımcı veya iletişim bilgisi değişikliği gibi hassas işlemlerde ek e-posta doğrulaması istenir. Müşteri rezervasyon numarası ve e-postasıyla yeni güvenli bağlantı talep edebilir. Talebin alınması, ödeme, tarih teyidi, uygunluk onayı ve kesin rezervasyon ayrı durumlardır. 1 Aralık MVP'sinde POS hazır değilse ödeme durumları canlı tahsilat akışı olarak sunulmaz; yalnızca rezervasyon talebi alınır.

### 6.1 Dalış ve Outdoor sağlık formu — kaynak alındı, 29 Ekim 2026

**Ayrı Dalış ve Outdoor formları — 29 Ekim 2026, UBT kabulü:** Yönetimde etkinlik için kullanılacak sağlık formu seçilebilir. Dalış ve Outdoor başlangıçta aynı kaynak metin, soru ve alanları içerir; veritabanında ayrı kimlikleri olan iki bağımsız form tanımı olarak tutulur. Yalnızca farklı adla gösterilen tek ortak form kaydı kullanılmaz. Ayrı tablo zorunlu değildir; ayrı form kayıtları yeterlidir. Her formun içerik düzenlemeleri ve sürümleri bağımsızdır; birindeki değişiklik diğerine yansımaz. Katılımcı yanıtı kullanılan form kimliği ve gönderim anındaki sürümle ilişkilendirilir; sonraki değişiklikler eski yanıtları bozmaz. Outdoor içeriği daha sonra ayrıca farklılaştırılabilir; mevcut aynı içerikle başlama kararı geliştirmeyi bekletmez. Bu karar kaynak metnin tıbbi anlamını değiştirmez veya otomatik uygunluk onayı oluşturmaz.

**Sağlık formu bağlantısının gönderim zamanı — UBT kabulü:** İlk rezervasyon talebi alındığında sağlık formu bağlantısı hemen gönderilmez. Dragoman ekibi etkinliği ve tarihi müşteriyle teyit ettikten sonra gereken katılımcılara ayrı güvenli form bağlantıları gönderilir. Bu teyit sağlık/katılım uygunluğu veya kesin rezervasyon onayı değildir; sağlık yanıtlarının değerlendirilmesi ve merkezde kâğıt imza adımları ayrıca korunur. İlk talep kaydı veya yalnızca İşleme Alındı durumuna geçiş, tek başına sağlık bağlantısı gönderim tetikleyicisi sayılmaz. Sonraki ödeme fazında ödeme yapılmış olması da bu teyidin yerine geçmez.

**Gönderim sonrası yanıt değişikliği — UBT kabulü:** Katılımcı gönderdiği yanıtları değiştirdiğinde yetkili Dragoman ekibine yeniden bildirim gider. Önceki yanıtlar, gönderim sürümü ve değişiklik zamanı korumalı sağlık formu geçmişinde saklanır; yeni yanıtlar eski kaydı kaybettirmez. Sağlık ayrıntıları genel audit log'a veya e-postaya yazılmaz. Geçmiş sürümlere erişim de sağlık verisi yetkileriyle sınırlıdır. Evet yanıtında inceleme kuralı korunur; önceki inceleme kararı yeni yanıtlara otomatik onay olarak aktarılmaz.

**Grup rezervasyonunda sağlık verisi erişimi — UBT kabulü:** Rezervasyon sahibi diğer katılımcıların yalnızca form tamamlama durumunu görür; sağlık yanıtları, İnceleme gerekiyor işareti ve inceleme ayrıntıları rezervasyon sahibine açılmaz. Bunlara ilgili katılımcı ve sağlık verisine erişim yetkisi bulunan Dragoman ekibi erişir. Rezervasyon sahibi katılımcıysa kendi formunu görebilir; rezervasyon sahipliği diğer kişilerin sağlık verisine erişim yetkisi vermez. Sınır veri/API ve güvenli bağlantı düzeyinde de uygulanır. Veli/vasi temsil erişimi ayrıca belirlenir; grup rezervasyonu sahipliğinden türetilmez.

**Evet yanıtında inceleme — UBT kabulü:** Sağlık sorularından herhangi birine Evet yanıtı verilirse form gönderilebilir; ilgili katılımcı formu **İnceleme gerekiyor** olarak işaretlenir ve yetkili Dragoman ekibine bildirim gider. Sağlık yanıtları e-posta gövdesine taşınmaz; yetkili kişi güvenli panelden inceler. Sistem otomatik kabul/ret vermez; katılım kararı ekibin değerlendirmesinden sonra alınır. İnceleme işareti talebin Bekliyor/İşleme Alındı takibinden ve ödeme/rezervasyon durumlarından ayrı tutulur. Tüm yanıtların Hayır olması da otomatik tıbbi uygunluk onayı değildir.

UBT'nin verdiği [Dragoman Dalış ve Outdoor Merkezi Sağlık Belgesi](./sources/forms/try-saglik-formu-tr-21.pdf), Dalış ve Outdoor için **katılımcı sağlık formunun kaynak belgesi** olarak kaydedildi. Tek sayfalık boş formun bütün açıklama, soru ve imza alanları [sağlık formu gereksinimleri](./Dragoman_Saglik_Formu_Gereksinimleri.md) belgesinde çıkarıldı: üç ana soru, 45 yaş üzeri sorusuna bağlı üç alt madde ve 29 geçmiş/mevcut sağlık durumu maddesi; ayrıca katılımcı ile veli/vasi için ayrı ad-soyad, tarih ve imza alanları.

Bu kaynak, ilk kısa rezervasyon formunun yerine geçmez; sağlık soruları ilk talebe eklenmez. Gereken her katılımcı ayrı güvenli bağlantıyla kendi formunu doldurur. Açıklamalar, alanlar ve sorular sonradan düzenlenebilir; önceki yanıtlar ve cevaplanan form sürümü korunur. **İmza kararı — 29 Ekim 2026:** Katılımcı sağlık sorularını sitede yanıtlar; etkinlik öncesinde merkezde kâğıt formu imzalar. Gerekiyorsa veli/vasi de kâğıt formu imzalar. Siteye imza çizme veya elektronik imza hizmeti eklenmez. Dijital gönderim ekranında merkezde imza gerekliliği belirtilir; formun çevrimiçi tamamlanması fiziksel imzanın alındığı anlamına gelmez. İmza, işletmenin mevcut etkinlik öncesi form/onay kontrolünde ele alınır. Türkçe kaynak ve mevcut EN/FR/DE taslak/insan onayı akışı korunur.

Başlık iki kategoriyi kapsasa da metin tüplü dalışa yöneliktir. UBT'nin Dalış ve Outdoor kapsam kararı geçerlidir; Dalış ve Outdoor ayrı form kayıtlarında başlangıçta aynı kaynak içerikle hazırlanır; Outdoor içeriğinin farklılaştırılması sonradan yapılabilir. Belirsiz kaynak ifadeleri ve yaşla ilişkili alt maddelerin koşullu gösterimi gerçek kullanımdan önce netleştirilir. **Dijital yanıt kararı:** Evet/Hayır seçenekleri yeni formda boş başlar; hiçbir yanıt önceden seçili gelmez. Katılımcı yanıtını kendisi seçer. Yanıtsız durum ayrı tutulur; geçerli zorunlu sorular yanıtlanmadan form tamamlanmış sayılmaz. İmza yöntemi merkezde kâğıt form olarak kesinleşmiştir. Kaynak PDF'de basılı Evet/Hayır kutuları yoktur; dijital seçenekler sonraki UBT kararıdır. Kaynakta otomatik uygunluk puanı veya otomatik ret eşiği bulunmaz; uygulayıcı bunları uydurmaz. Form doldurulması tıbbi uygunluk veya kesin rezervasyon onayı değildir. İnsan incelemesi, sağlık verisine sınırlı erişim ve saklama/silme kuralları korunur. Doktor raporu yükleme, elektronik imza servisi veya otomatik PDF üretimi bu dosyayla kendiliğinden kapsam haline gelmez.

## 7. Ödeme, iptal/iade ve fatura

Dragoman kredi kartı ve IBAN havalesi ister; mümkünse bazı ürünlerde kapora da düşünülür. **Güncel ödeme kararı:** Sağlayıcı seçimi açık. Yapı Kredi Sanal POS/POSNET **entegrasyonu kolaysa kullanılabilecek adaydır**; kolaylığı henüz doğrulanmadı. UBT iyzico dışındaki alternatiflerin de araştırılmasını istedi, ardından **“Bunu şimdi yapma ama not al”** diyerek araştırmayı sonraya bıraktı. Araştırma şu anda sürdürülmez; seçilmiş sağlayıcı varmış gibi entegrasyon başlatılmaz. iyzico otomatik yedek kabul edilmez; tamamen elendiği de varsayılmaz. V4'ün “POSNET uygun değilse iyzico” yaklaşımı bu güncel notla değiştirilmiştir. Ayrıntılı kayıt: [Ödeme kararları](./Dragoman_Odeme_Kararlari.md).

Araştırma yeniden açıldığında entegrasyon belgeleri, test ortamı, geliştirme/bakım eforu, komisyon, EUR/TL tahsilat ve hesaba aktarım koşulları, yabancı kartlar, 3D Secure, iade ve mutabakat değerlendirilir. POS sağlayıcısı ve canlı açılış tarihi henüz kesin değildir. Banka/sağlayıcı hesabı Dragoman adına açılır. Kart bilgileri uygulamada saklanmaz; sağlayıcının güvenli akışı kullanılır. Başarı, başarısızlık ve tekrarlanan sağlayıcı bildirimi siparişte tutarlı tek sonuç üretmelidir. EUR/TL hedefi sağlayıcı/işyeri yetkileri doğrulanmadan her kart için koşulsuz destek sözüne dönüştürülmez.

Havale bildirimi tek başına “ödendi” durumu yaratmaz; Dragoman'ın banka teyidi gerekir. Havale bekleme süresi, IBAN gösterimi ve teyit yetkisi müşteri kararıdır. **3–5/25 kararları:** Her etkinlikte tam ödeme, yüzde kapora veya sabit kapora seçilebilir; kalan ödeme zamanı panelden belirlenir. Son tarihten **7 ve 2 gün önce** ödeme bağlantılı e-posta gönderilir, gecikme panelde görünür. Gecikmede Dragoman süreyi uzatır, yeni bağlantı gönderir veya iptal sürecini başlatır. Somut oran/tutar ve uygulanacak ürünler Dragoman ürün cetvelinden gelir.

Müşteri rezervasyon üzerinden iptal talebi açabilir; Dragoman koşulları değerlendirip varsa iade tutarını belirler. İade karma yürür: POS desteklerse panelden başlatılır, desteklemezse Dragoman manuel iadeyi yapıp panelde kaydeder. İade **orijinal ödeme para birimindedir**; tam veya kısmi iadelerin toplamı ödenen tutarı aşamaz. Ana yönetici iade yetkisi ve personel başına EUR limiti verir. Limit rezervasyon başına **toplam iade** üzerinde uygulanır; parçalı iadeyle aşılamaz. TL iadesi yetki limitinde siparişin ödeme anında sabitlenen orijinal kuruyla EUR'ya çevrilir. Hizmet ve kitap için nihai iptal/iade metinleri Dragoman tarafından onaylanır.

Fatura için fatura türü, işletmenin mali süreçleri, gerekli alıcı bilgileri, vergi/para birimi işleyişi, sağlayıcı ve e-Fatura yetkisi Dragoman/mali müşavir tarafından netleştirilir. e-Fatura **sonraki fazdır**; POS ile aynı tarihte hazır olacağı varsayılmaz. Fatura kesimi ve iade/iptal belgeleri için mali/hukuki kararlar UBT'nin tek başına belirleyeceği kurallar değildir. MVP'de kullanıcıya otomatik e-Fatura kesildiği söylenmez.

**Fiyat/KDV ve e-Fatura fazı kararları:** Ürün fiyatı KDV dahil girilir; sistem KDV hariç tutar ve KDV tutarını hesaplar. KDV oranı hazır seçenekten veya gerektiğinde özel oranla ürün bazında tanımlanır. Finansal raporda KDV dahil/hariç/tutar ayrı gösterilir. Uygun e-Fatura/e-Arşiv sağlayıcısı mevcut muhasebe sistemi öğrenildikten sonra seçilir. Ödeme tamamlandığında fatura **yetkili Dragoman personelinin kontrol/onayıyla** oluşturulur; ana yönetici fatura yetkisi verebilir. Satın almada bireysel/kurumsal seçim ve ülkeye göre gerekli alanlar gösterilir. Müşteri fatura oluşmadan bilgileri düzenleyebilir; sonrasında düzeltme talebi açar. Fatura müşteriye e-postayla gönderilir, güvenli rezervasyon sayfasından görüntülenip indirilir. Resmî fatura dili mevzuata uygun, bildirim e-postası müşterinin seçtiği dildedir. E-posta başarısızsa **5, 15 ve 60 dakika** sonra üç deneme yapılır; Bekliyor, Yeniden Deneniyor, Gönderildi, Teslim Edildi, Teslim Edilemedi durumları izlenir ve kalıcı hata Dragoman'a bildirilir. Bu işlevler 23/25 uyarınca sonraki fazda açılır.

## 8. Yönetim paneli, çeviri ve bildirim

**Müşteri talep alındı e-postası ve Zoho — 31 Ekim 2026, UBT kabulü:** Etkinlik talebi başarıyla kalıcı kayda alındığında rezervasyon sahibinin e-posta adresine talep alındı bildirimi gönderilir. Bu gönderim için Zoho kullanılacaktır. E-postada etkinlik, tercih edilen tarih, kişi sayısı, varsa seçenek/kişi dağılımı ve talep anındaki fiyat özeti bulunur; fiyat talep üzerine ise toplam uydurulmaz. Mesaj talebin alındığını ve kesin rezervasyon için ekibin iletişime geçeceğini açıkça belirtir; rezervasyon, müsaitlik veya ödeme onayı değildir. Bildirim mevcut müşteri dili ve onaylı e-posta şablonu kurallarına uyar; sağlık yanıtları veya diğer katılımcıların özel bağlantıları eklenmez. İşletmenin info@dragoman-turkey.com bildirimi ayrıca korunur. Kaydedilmeyen talep için başarı/alındı e-postası gönderilmez. E-posta gönderim hatası kalıcı talep kaydını silmez ve yeniden talep yaratma nedeni değildir. Zoho hesabı, kullanılacak ürün/gönderim yöntemi ve gerçek servis erişimleri bağlantı aşamasında doğrulanır; bu karar Zoho CRM, yeni müşteri takip sistemi veya ücretli abonelik onayı eklemez.

Yetkili ekip teknik yardım almadan ürün ekler/düzenler/yayından kaldırır; işlem yöntemi, EUR fiyatı, kitap stoku, kargo bölgesi/ücreti, blog ve öne çıkan içeriği yönetir. Fotoğraf oranları ve yerleşimler panel kullanımıyla bozulmamalıdır. Kısa, pratik yönetim kılavuzu teslim edilir. SeaKayak panelindekine benzer revizyon talebi oluşturma istenir.

**15/25 kararı — roller ve yetkiler:** Ana Yönetici, Rezervasyon Sorumlusu, Muhasebe ve İçerik Editörü gibi hazır roller bulunur; bir personele birden fazla rol atanabilir. Ana yönetici kişiye özel yetkileri ayrıca açıp kapatabilir. Rezervasyon, iade, fatura, rapor, içerik ve çeviri düzenleme yetkileri ayrıdır. Sınırlar hem arayüzde hem sunucu/veri katmanında uygulanır. Yetki değişikliği ve işlemi yapan kişi kaydedilir. Hangi gerçek personele hangi rolün verileceği Dragoman tarafından listelenir.

**16/25 kararı — panel güvenliği:** Yönetim paneline erişen **tüm personel** için iki aşamalı doğrulama zorunludur. İlk kullanımdan önce TOTP uyumlu doğrulama uygulaması kurulumu tamamlanır; güvenli kurtarma kodları sağlanır. Başarısız girişlerde hız sınırlaması, güvenli oturum yönetimi ve erişim kayıtları uygulanır. 2FA, rol/yetki kontrolünün yerine geçmez. Panel canlıya açılmadan bu güvenlik şartı karşılanır.

Yayın dilleri TR, EN, FR, DE’dir. Kaynak dil Türkçedir; EN/FR/DE metinler DeepL API ile hazırlanır. Ana içerik yayınlandığında mevcut DeepL çevirileri ayrıca dil onayı beklemeden yayınlanır. Müşteri panelden düzeltme yapabilir; UBT çeviri kontrolü üstlenmez. Türkçe kaynak değişince mevcut çeviri ve elle düzeltmeler korunur, panelde “Çeviri güncellenmeli” uyarısı gösterilir; yeniden çeviriyi müşteri başlatır. DeepL hata/kota durumunda panel uyarısı gösterilir; gerekirse kota/paket yenilenir. Otomatik ücretli yükseltme yapılmaz. Eksik çeviri tamamlanmış sayılmaz. Kota %80 erken ve %100 kritik uyarıları korunur. Ayrı dil onaylayıcısı, onay bekleme özeti ve üç günlük onay gecikmesi süreci kaldırılmıştır. Tekil/toplu çeviri işleri kota gözetilerek yürütülür; e-posta, ALT ve SEO metinleri de mevcut çeviri kapsamındadır.

**Çeviri iş akışı:** Kaynak dil Türkçedir; EN/FR/DE metinler DeepL API ile hazırlanır. Ana içerik yayınlandığında mevcut DeepL çevirileri ayrıca dil onayı beklemeden yayınlanır. Müşteri panelden düzeltme yapabilir; UBT çeviri kontrolü üstlenmez. Türkçe kaynak değişince mevcut çeviri ve elle düzeltmeler korunur, panelde “Çeviri güncellenmeli” uyarısı gösterilir; yeniden çeviriyi müşteri başlatır. DeepL hata/kota durumunda panel uyarısı gösterilir; gerekirse kota/paket yenilenir. Otomatik ücretli yükseltme yapılmaz. Eksik çeviri tamamlanmış sayılmaz. Kota %80 erken ve %100 kritik uyarıları korunur. Ayrı dil onaylayıcısı, onay bekleme özeti ve üç günlük onay gecikmesi süreci kaldırılmıştır. Tekil/toplu çeviri işleri kota gözetilerek yürütülür; e-posta, ALT ve SEO metinleri de mevcut çeviri kapsamındadır.

**17/25 kararı — detaylı audit log:** Rezervasyon, ödeme, iade, fiyat, ürün, içerik, yetki ve çeviri onayı gibi önemli panel işlemleri; işlemi yapan kullanıcı, tarih/saat, işlem türü ve uygun alanlarda önceki/yeni değerle kaydedilir. Ana yönetici kayıtları kullanıcı, tarih aralığı ve işlem türüne göre filtreler; audit log'a yalnızca ana yönetici erişir. Şifreler, kart verileri ve sağlık beyanlarının tam içeriği log'a yazılmaz. 23/25 aşamalı yayın kararı gereği detaylı arayüz ve geçmiş filtreleri sonraki fazda etkinleştirilebilir; MVP'de canlı işlemler için gerekli güvenlik/operasyon kayıtları tutulur.

Her sayfada, her cihazda WhatsApp ve e-posta kolay bulunur. Satış ve rezervasyon bildirimleri `info@dragoman-turkey.com` adresine gider; mevcut kurumsal e-postalar korunur. “İşleme Aldım” işlemi kimin talebi üstlendiğini diğer yetkililere göstermelidir. E-postadan tek tıklamayla işlem yapılacaksa bağlantı yetkilendirmesi ve süresi güvenli biçimde tasarlanır; yetkisiz erişimle kayıt sahiplenilemez. Ayrı “Tamamlandı” düğmesi işletmeye zorunlu iş yükü olarak eklenmez. E-posta teslim edilemezse talep panelde kaybolmamalı; yetkili kişi kayıtları görüntüleyebilmelidir. Gerçek personel/rol atamaları Dragoman tarafından sağlanır.

**Talep ve bildirim kararları:** Rezervasyon, ödeme ve değişiklik bildirimleri `info@dragoman-turkey.com` adresine gider ve panelden izlenir. İlk işleme alan çalışan sorumlu olur; ana yönetici sorumluyu değiştirebilir. Sorumlu, talebi başka yetkiliye doğrudan devredebilir; yeni kişiye e-posta ve panel bildirimi gider, ayrıca kabul adımı gerekmez. Personel yetkisi kapsamındaki tüm talepleri ve **Bana Atananlar** filtresini görür. Talep takibinde yalnızca **Bekliyor** ve **İşleme Alındı** durumları vardır. İşleme alınmayan talep için haftanın her günü 7/24, **iki saatte bir** hatırlatma yapılır; aynı zamandaki talepler tek özet e-postada toplanır. Ana yönetici aralığı değiştirir veya sistemi kapatır. İşlem/etkinlik tamamlandıktan **30 gün** sonra talep aranabilir arşive taşınır; yalnızca ana yönetici yeniden aktifleştirir veya aktif/arşiv kayıtlarını Excel/CSV dışa aktarır. Veri silme/saklama süresi kayıt türü ve yasal yükümlülüğe göre ayrıca belirlenir. Otomatik müşteri bildirimleri seçilen TR/EN/FR/DE dilinde gönderilir.

**14/25 kararı — mobil işlem alanı:** Mobil ekranın altında sabit WhatsApp ve Rezervasyon/İletişim alanı yer alır. Gösterilen ikinci işlem sayfa türüne ve ürünün satış yöntemine göre değişir; ödeme hazır değilse satın alma vaadi gösterilmez. Sabit alan formları, içerikleri veya ödeme düğmelerini kapatmaz. Tablet ve masaüstünde de iletişim ve rezervasyon yolları kolay erişilir.

## 9. SEO, ölçüm ve medya

**Rezervasyon ve iletişim bilgileri — 31 Ekim 2026, kullanıcı tarafından sağlandı:**

| Alan | Kullanılacak bilgi |
| --- | --- |
| İşletme | Dragoman Travel Agency |
| TÜRSAB | A4615 |
| Adres | Uzunçarşı Cad. No: 15 KAŞ 07580 Antalya TÜRKİYE |
| Telefon | +90 242 836 3614 |
| Mobil | +90 533 290 1463 |
| WhatsApp | https://wa.me/905332901463 |
| E-posta | info@dragoman-turkey.com |

İletişim sayfası, footer ve uygun iletişim alanları bu ortak iletişim bilgisini kullanır; içerik içinde birbirinden kopuk kopyalar oluşturulmaz. Telefon bağlantıları tel:+902428363614 ve tel:+905332901463, e-posta bağlantısı mailto:info@dragoman-turkey.com olur; mobil sabit WhatsApp işlemi verilen WhatsApp adresini açar. Bunlar kullanıcı tarafından sağlanan yayın içeriğidir; hesap erişimi veya bağımsız sicil doğrulaması yapılmış sayılmaz.

**Kullanıcının paylaştığı işletme bağlantıları — 31 Ekim 2026:** Instagram: https://www.instagram.com/dragomandivingandoutdoors/ . Facebook: https://www.facebook.com/dragomandivingandoutdoor . LinkedIn: https://www.linkedin.com/company/dragoman-diving-outdoor/home/ . YouTube: https://www.youtube.com/@dragomanturkey669 . Google Maps: https://maps.app.goo.gl/8CHPeMSWYjqhSYJe6 . Maps kısa bağlantısının yönlendirmesi Dragoman Diving and Outdoor işletme kaydını gösterir. Bunlar kullanıcı tarafından verilen kaynak bağlantılarıdır; hesap yönetim erişimi veya API yetkisi sağlandığı anlamına gelmez. Instagram sayfa içeriği bu incelemede alınamadı. Instagram akışı/gönderi aktarımı veya ek entegrasyon kapsamı oluşturulmaz. Maps bağlantısının iletişim konumu ve Google yorum bağlantısında kesin kullanımına ilişkin önceki soru henüz ayrıca yanıtlanmadı; yorum veri bağlantısı kurulmuş sayılmaz.

MVP SEO temeli: eski URL envanteri ve 301 yönlendirme haritası; anlamlı dil bazlı URL; her dil için başlık/açıklama; canonical ve `hreflang` ilişkileri; XML site haritası; tarama/indeks ayarları; mobil performans ve temel erişilebilirlik. Canlı alanda geçici siteye ait `noindex` veya yanlış canonical kalmamalıdır. QR hedefleri ve önemli eski bağlantılar tek tek kontrol edilir. Kaş dalış, deneme dalışı, Open Water, Kekova deniz kanosu ve tekne turu, Kaş yürüyüş gibi hizmet/lokasyon aramaları içerik planına alınır. EN/FR/DE terimler doğrudan kelime çevirisi yerine doğal arama diliyle kontrol edilir. Rusça anahtar kelime araştırması Rusça site yayını kararı değildir.

**11/25 SEO/GEO kararı — güncel uygulama ayrıntısı:** Uygun Schema.org yapısal verileri, sosyal paylaşım önizlemeleri, içerik kalite uyarıları ve teknik SEO kontrolleri desteklenir. DeepL SEO başlığı/açıklamasına ilk taslağı verir; yetkili kişi her dilin başlık, açıklama ve arama niyeti notlarını ayrı düzenleyip onaylar. Arama niyeti notları panelde editoryal amaçlıdır; Google'ın kullanmadığı `meta keywords` alanı SEO gereği olarak uygulanmaz. Her dilin yerelleştirilmiş URL'si panelden düzeltilebilir; yayındaki URL değişikliği yönlendirme kaydıyla birlikte yönetilir.

**Dil davranışının SEO açısından netleştirilmesi:** Tarayıcı dili dil önerisi/başlangıç tercihi için kullanılabilir; kullanıcının elle seçtiği dil korunur, destek dışı dilde İngilizce varsayılan önerilir. Açık bir TR/EN/FR/DE URL'sine gelen ziyaretçi tarayıcı/IP gerekçesiyle başka dile zorla yönlendirilmez; aynı URL'nin dili çereze göre değiştirilmez. Dil seçici ilgili içeriğin mevcut onaylı dil sürümüne bağlanır. Bu, önceki tarayıcı dili algılama kuralının taranabilir dil adreslerini koruyan uygulama açıklamasıdır. [Google çok dilli site rehberi](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [desteklenen meta etiketler](https://developers.google.com/search/docs/crawling-indexing/special-tags).

**Raporlama (sonraki faz):** Satış, rezervasyon, iade, ürün performansı, aylık gelir, katılımcı ve en çok satılan etkinlikler raporlanır. Tarih filtreleri, özel aralık ve önceki dönem karşılaştırması bulunur. Genel finans toplamı EUR bazında, EUR/TL işlem toplamları ayrıca gösterilir. Finansal ve operasyonel rapor görüntüleme yetkileri ayrı verilir.

Google İşletme Profili, Instagram, Facebook ve YouTube bağlantıları doğru hesaplara yönlenir. Google yorumlarının gösterimi veri doğruluğu ve sağlayıcı koşullarına uygun yöntemle yapılır. Form gönderimi, rezervasyon talebi, sipariş ve ödeme gibi olayların ölçümü izin/çerez kararlarıyla uyumlu kurulur; sayısal dönüşüm hedefleri müşteri tarafından henüz verilmedi. Ücretli reklam veya SEO performans garantisi MVP kapsamındaki teknik temel ile karıştırılmaz.

**12/25 kararı — analitik ve dönüşüm:** GA4 ziyaretçi davranışı, trafik ve dönüşümleri; Google Search Console organik arama/indeksleme durumunu; GTM etiketlerin merkezî yönetimini sağlar. İletişim/rezervasyon form gönderimi, WhatsApp iletişim tıklaması, rezervasyon oluşturma/onay ve ödeme fazı açıldığında ürün/satın alma/gelir olayları ölçülür. Analitik ve reklam etiketleri gerekli izin alınmadan çalışmaz. Sağlık beyanları ve kişisel form yanıtları bu servislere gönderilmez. Ölçüm hesabı/erişimi Dragoman adına tutulur.

**13/25 kararı — ayrıntılı çerez tercihleri:** TR/EN/FR/DE arayüzünde **Kabul Et**, **Reddet** ve **Tercihleri Yönet** seçenekleri bulunur. Zorunlu, analitik ve pazarlama kategorileri ayrı gösterilir; zorunlu olmayanlar izin verilene kadar kapalıdır. Ziyaretçi tercihlerini sonradan değiştirebilir. Tercih ve ilgili izin metni sürümü kaydedilir. UBT teknik çözümü kurar; hukuki metinleri Dragoman onaylar.

**20/25 kararı — gelişmiş medya kütüphanesi:** Panelde fotoğraf ve videolar merkezî olarak yönetilir; dalış, deniz kanosu, eğitimler, turlar ve ekip gibi kategoriler oluşturulabilir. Görseller uygun format ve boyutlara otomatik optimize edilir; ALT metni girilir, çok dilli ALT metinleri DeepL ile çevrilip onaylanır. Aynı medya birden çok içerikte kullanılabilir. Kullanımdaki görsel yanlışlıkla silinemez; ekleme, düzenleme ve silme yetkileri ayrıdır. Aşamalı yayında temel medya yükleme/kullanımı MVP'yi destekler; gelişmiş kütüphane işlevleri hazır oldukça etkinleştirilir. UBT mevcut arşivi değerlendirip eksik fotoğraf/video listesini çıkarır; Dragoman materyal ve kullanım hakkını sağlar.

### 9.1 Güncel araştırma, kapsam ve öncelik

**Araştırma tarihi: 26 Ekim 2026.** Kaynak bulguları ve sınırlamalar [SEO/GEO araştırma notunda](./Dragoman_SEO_GEO_Arastirma_2026-10-26.md) kayıtlıdır. Bu bölüm Claude Code için uygulanacak gereksinimleri somutlaştırır; canlı sitede SEO denetimi veya ölçüm yapıldığı anlamına gelmez.

Buradaki **GEO**, üretken yapay zekâ yanıtlarında keşfedilebilirliktir; yerel/harita SEO'su ayrıca ele alınır. Google'ın güncel rehberi özel bir GEO şeması veya `llms.txt` zorunluluğu getirmiyor. Arama için değerli içerik ve teknik erişilebilirlik temel alınır. Bu nedenle bir “AI puanı” veya aramada kaynak gösterilme garantisi teslim ölçütü yapılmaz. [Google'ın güncel AI optimizasyon rehberi](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

**MVP:** Aşağıdaki taranabilirlik, dil/URL, görünür içerik, doğru yapısal veri, yerel işletme bilgisi, görsel/performance kontrolleri ve ölçüm kurulumu teknik teslim kapsamıdır. **Yayın sonrası:** Gerçek trafikle içerik geliştirme, saha performansı takibi, varsa AI görünürlük verisi ve isteğe bağlı IndexNow otomasyonu izlenir. POS/e-Fatura araştırmasının ertelenmesi değişmez; Merchant Center veya AI üzerinden otomatik rezervasyon yeni MVP taahhüdü değildir.

### 9.2 Tarama, indeksleme ve WordPress geçişi

**SEO değerini koruyarak geçiş — 31 Ekim 2026, UBT kabulü:** Mevcut SEO-01–SEO-06 ve yayın kurallarına ek uygulama sırası:

1. Yeni site dragoman-turkey.com alan adında yayınlanır. dragomanseakayak.com içerik kaynağıdır; bu karar ikinci alan adının kapatılması, birleştirilmesi veya yönlendirilmesi talimatı değildir.
2. /diving/, /sea-kayak/ ve /outdoor-activities/ mevcut kategori adresleri korunur; kategori açıklamaları ve ilgili iç bağlantılar muhafaza edilerek yeni etkinlik detaylarına geçiş sağlanır. Mevcut değerli içerik yalnızca yeni kart düzeni nedeniyle kaldırılmaz. Kesin yeni detay adresleri mevcut dil/SEO kurallarıyla seçilir.
3. Canlı geçişten önce erişim varsa Search Console sayfa/sorgu performansı, indeks durumu ve bağlantı raporları; analitik, mevcut sitemap, eski URL envanteri ve QR hedefleri birlikte incelenir. Kullanılabilen tarih aralığı ve erişim eksikleri kaydedilir. Trafik ve dış bağlantı alan sayfalar geçiş testlerinde önceliklendirilir; mevcut verilerin başlangıç kaydı alınır. Veri gelmemesi şablon geliştirmeyi durdurmaz, ilgili yayın kontrolünde eksik olarak raporlanır.
4. Korunan adresler doğru içerikle çalışır; değişen adresler tek adımda en ilgili yeni karşılığına kalıcı 301/308 yönlendirilir. Toplu ilgisiz ana sayfa yönlendirmesi yapılmaz. Karşılığı olmayan kaldırılmış içerik mevcut SEO-02 kuralına uyar. Yönlendirmeler en az bir yıl, kalıcı QR hedefleri mümkün olduğunca sürekli korunur.
5. Yayından önce öncelikli eski sayfa, blog, dil, görsel ve QR adresleri ile yeni hedefleri kontrol edilir. Canonical, hreflang, sitemap, ilk HTML içeriği ve canlı indeksleme engelleri mevcut kabul ölçütleriyle doğrulanır.
6. Yeni altyapının sayfa, görsel ve form erişimi doğrulanmadan eski hosting kapatılmaz; mevcut geri dönüş planı korunur. Yayın sonrasında Search Console indeksleme/hatalar ve organik performans, eldeki geçiş öncesi başlangıç verileriyle karşılaştırılarak izlenir. Veri ve mevsimsellik sınırları belirtilir; anlık farklar tek başına kesin SEO kaybı sayılmaz. Sıralama veya kayıpsız geçiş garantisi verilmez.

Kaynaklar: [Google URL değişimi rehberi](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [Google hosting geçiş rehberi](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes).

| Kimlik | Uygulanacak gereksinim |
| --- | --- |
| SEO-01 | Yayınlanan ana sayfa/kategori/etkinlik/kitap/blog sayfalarında esas başlık, özet, metin, SSS ve iç bağlantılar ilk HTML yanıtında bulunur; SSR/SSG veya eşdeğer ön işleme tercih edilir. Tarayıcı etkileşimi, çerez kabulü veya sadece istemci API çağrısı içeriği görmenin şartı olmaz. Google JavaScript işleyebilir; ilk HTML tercihi farklı botlarla erişim ve yalınlık için proje kararıdır. |
| SEO-02 | Geçerli kamusal içerik 200 döner. Kalıcı taşınan URL en yakın ilgili yeni adrese 301/308 ile tek adımda gider; silinmiş ve karşılığı olmayan içerik 404/410 döner. Alakasız eski adresler topluca ana sayfaya bağlanmaz. |
| SEO-03 | HTTPS, www/non-www ve eğik çizgi tercihleri tutarlıdır. Her indekslenebilir dil sayfasında aynı dilde doğru canonical bulunur; tüm diller Türkçe tek adrese canonical yapılmaz. İç bağlantılar ve sitemap aynı nihai adresleri kullanır. |
| SEO-04 | XML sitemap yalnızca yayında, onaylı, 200 dönen canonical kamusal sayfaları içerir. Taslaklar, yönlendirmeler, hata sayfaları ve özel işlem adresleri dışarıda kalır. `lastmod` gerçek anlamlı güncellemeyi yansıtır. Yayın/kaldırma işleminde liste yenilenir. |
| SEO-05 | Geçici ortam erişimle korunur ve indekslemeye kapatılır; canlıya geçişte kamusal sayfalarda kalmış `noindex`, robots veya CDN/WAF engeli kontrol edilir. `robots.txt` yetkilendirme veya indeks dışı tutma yerine geçmez. Kişisel rezervasyon/katılımcı bağlantıları, panel ve ödeme sonuçları erişim kontrolüyle korunur; sitemap'e girmez, gerekli `noindex` başlığı taşır. |
| SEO-06 | Eski URL listesi XML'den bulunan 85 adresle sınırlanmaz: erişim varsa Search Console, analitik, mevcut sitemap ve QR hedefleriyle tamamlanır. Dil kökleri, `?page_id=` biçimleri ve `sample-page` ana sayfaları özellikle eşleştirilir. Yönlendirmeler en az bir yıl; kalıcı QR hedefleri mümkün olduğunca sürekli korunur. Alan adı aynı kaldığı için yalnızca CMS/URL değişimi adına domain Change of Address işlemi yapılmaz. |

Kaynaklar: [JavaScript ve ilk HTML](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [geçiş rehberi](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes), [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots.txt'nin sınırları](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

### 9.3 Dört dilde keşfedilebilirlik

**SEO-07:** TR/EN/FR/DE için ayrı, kalıcı adresler kullanılır. Kesin kök/prefix seçimi nihai URL haritasında yapılır; mevcut bağlantılar korunur/yönlendirilir. Sayfa başlığı, açıklama, ana metin, SSS, görsel açıklamaları ve gezinme aynı dilde olmalıdır. DeepL taslağı onaysız indekslenebilir içerik olarak açılmaz.

**SEO-08:** Eşdeğer yayınlanmış dil sayfaları kendisini ve karşılıklı diğer sürümleri tam URL'li `hreflang` ile tanımlar. `tr`, `en`, `fr`, `de` dil kodları temel alınır; kanıtlanmamış bölgesel sürümler üretilmez. `x-default` uygun varsayılan/selektör sayfası için tanımlanabilir. Eksik/onaysız Almanca sayfaya etiket verilmez; olmayan karşılık ana sayfaya eşdeğermiş gibi bağlanmaz. `html lang` erişilebilirlik için doğru yazılır; tek başına dil SEO'sunun yerine geçmez. [Google dil sürümleri](https://developers.google.com/search/docs/specialty/international/localized-versions).

### 9.4 İçerik, arama niyeti ve SSS

**SEO-09:** Her yayınlanmış dil sayfasında benzersiz, açıklayıcı `<title>`, kısa meta açıklaması, görünür ana başlık ve anlamlı alt başlıklar bulunur. Panelde bunlar ayrı düzenlenebilir; açıklama/başlık önizlemesi yaklaşık gösterimdir, Google'ın aynısını kullanma taahhüdü değildir. Sabit “60/160 karakter” sınırları yayın engeli yapılmaz. Konu/konum doğal biçimde ifade edilir. [Başlık rehberi](https://developers.google.com/search/docs/appearance/title-link), [snippet rehberi](https://developers.google.com/search/docs/appearance/snippet).

**SEO-10 — Dragoman içerik şablonu:** Etkinlikte ne yapıldığı, Kaş/Kekova'daki gerçek konum/rota, süre, deneyim düzeyi, onaylı katılım koşulları, dahil/hariç, buluşma/transfer, hazırlık, fiyatın kişi/grup temeli, geçerli para birimi ve talebin teyit gerektirdiği açık yazılır. Bilinmeyen alanlar içerik tesliminde işaretlenir; uydurma bilgiyle tamamlanmaz. Konuyu bilen gerçek ekip üyesi kaynak/review sahibi olabilir; gerçek inceleme tarihi tutulur. Kitapta baskı dili, yazar, varsa doğrulanmış ISBN, teslim/kargo ve onaylı stok bilgisi ayrıştırılır. Güvenlik veya tıbbi uygunluk hakkında pazarlama amacıyla kanıtsız iddia oluşturulmaz.

**SEO-11:** Bölüm 4.7'deki SSS, ürüne özgü gerçek soruları yanıtlar; aynı genel metin her sayfaya kopyalanmaz. Yanıt HTML'de hazırdır; açma düğmesi okunabilirliği düzenler. Blog/tur çiftleri içerik niyetine göre birleştirilir veya birbirine bağlanır. Anahtar kelime başına ince sayfa, yapay şehir/konum sayfaları ve yalnızca sıralama/AI yanıtı manipülasyonu için toplu içerik üretilmez. [Google spam politikaları](https://developers.google.com/search/docs/essentials/spam-policies).

**Editoryal başlangıç haritası — arama hacmi araştırması değildir:** Kaş'ta dalış/deneme dalışı/SSI eğitimleri; Kekova günlük ve çok günlük deniz kanosu; Kaş çevresinde doğa etkinlikleri; havaalanı transferi ve konaklama; kitaplar. Örnek karşılıklar `scuba diving in Kaş`, `plongée à Kaş`, `Tauchen in Kaş`; `sea kayaking in Kekova`, `kayak de mer à Kekova`, `Seekajak in Kekova` olabilir. Bunlar yerel dil ve gerçek talep verisiyle gözden geçirilecek başlangıç örnekleridir; arama hacmi, rekabet veya sıralama ölçülmüş sayılmaz. Rusça site sürümü eklenmez. Nihai sayfa matrisi konu, kullanıcı amacı, kaynak içerik ve dil durumunu kaydeder.

### 9.5 Yapısal veri ve doğru temsil

**SEO-12:** JSON-LD yalnızca sayfada görünen, güncel ve onaylı veriden üretilir; dil ve canonical ile tutarlı kalır. Görünmeyen fiyat, sahte stok, doğrulanmamış puan veya kesin olmayan rezervasyon tarihi eklenmez. Teknik doğrulama, Google'da özel görünüm kazanma garantisi değildir.

| Sayfa / varlık | Uygulama kuralı | Resmî dayanak |
| --- | --- | --- |
| Dragoman işletmesi | Doğru isim, logo, URL, iletişim ve gerçek resmî profiller aynı kalıcı `@id` ile ilişkilendirilir. Gerçek işletme yapısına uygunsa LocalBusiness alt türü TravelAgency kullanılır; çelişen birden çok işletme varlığı üretilmez. | [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business), [TravelAgency](https://schema.org/TravelAgency) |
| Kategori / detay gezinmesi | Kullanıcının sayfadaki yoluyla tutarlı BreadcrumbList; kitap/blog/etkinlik bağlantıları gerçek adreslere gider. | [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) |
| Kitap detayı | İçeriğe uygun Product/Book tanımı değerlendirilir. Offer ancak gerçek, onaylı fiyat/para birimi ve sunulan yöntemle tutarlıysa eklenir. Eksik Offer koşulları puan/fiyat uydurularak doldurulmaz; ödeme kapalıyken doğrudan satın alınabilir Merchant listing varsayılmaz. | [Product snippet](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) |
| Tarihli özel tur | Gerçek, teyitli tarih ve konumu olan ayrı etkinlikte Event uygunluğu değerlendirilir. Her gün talep edilen genel dalış/kano sayfasına sahte başlangıç tarihleri verilmez. | [Event](https://developers.google.com/search/docs/appearance/structured-data/event) |
| Rota / tur bilgisi | TouristTrip gibi anlamsal türler uygun veri varsa kullanılabilir. Bu, Google'ın aynı adla desteklediği özel sonuç türü olduğu anlamına gelmez; MVP yayın engeli değildir. | [TouristTrip](https://schema.org/TouristTrip) |
| Google yorumları | Yorum gösterimi sürer; Dragoman'ın kendi işletmesine ait yorumlar, üçüncü taraf widget'tan gelse bile kendi LocalBusiness/Organization sayfasına yıldız sonucu kazandırmak amacıyla işaretlenmez. İşletme puanı kitap/etkinlik puanı gibi yeniden sunulmaz. | [Öz değerlendirme/yorum kuralları](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) |
| SSS | Yararlı görünür içerik zorunludur. FAQ zengin sonuçları kaldırıldığı için FAQPage özel Google görünümü gereksinimi değildir; önceki Bölüm 4.7 geçerlidir. | [Google değişiklik kaydı](https://developers.google.com/search/updates#may-2026) |

### 9.6 Yerel işletme, görsel ve performans

**SEO-13:** Site ile Google İşletme Profili'nde işletme adı, gerçek adres, telefon, çalışma saatleri, site bağlantısı ve sunulan hizmetler tutarlı ve güncel tutulur. Tur buluşma yeri ile işletme ofisi ayrıştırılır; sahte ofis/konum oluşturulmaz. Doğrulanmış ekip, yetki/sertifika ve resmî sosyal profil bilgileri kullanılır. Yerel görünürlük için uzaklık dahil işletmenin kontrol etmediği etkenler bulunduğundan “Kaş'ta birinci sıra” sözü verilmez. Profil düzenlemeleri Dragoman hesabı/yetkisiyle yapılır. [Google yerel görünürlük rehberi](https://support.google.com/business/answer/7091?hl=en).

**SEO-14:** Açılıştaki üç fotoğraf ve içerik görselleri taranabilir `img/picture`, gerçek `src` ve duyarlı boyutlarla sunulur; kritik fotoğraf yalnızca CSS arka planına bırakılmaz. Açıklayıcı ALT ilgili dilde onaylanır, dekoratif görselde boş ALT kullanılabilir. Görsellerin boyut alanı ayrılır; ekran dışındakiler gerektiğinde gecikmeli yüklenir, ilk büyük görsel gereksiz yere bekletilmez. Kaynak arşivdeki eksik medya edinilir ve hakları doğrulanır. Sosyal önizleme başlığı, açıklaması ve görseli dil bazında düzenlenebilir. [Google görsel SEO rehberi](https://developers.google.com/search/docs/appearance/google-images).

**SEO-15 — performans hedefi:** LCP ≤ 2,5 saniye, INP ≤ 200 ms, CLS ≤ 0,1 hedeflenir; yeterli saha verisi olduğunda mobil/masaüstü ayrı, 75. yüzdelik esas alınır. Yayın öncesi ana sayfa, kategori ve detaylarda belgelenmiş cihaz/ağ koşullarıyla ölçüm yapılır. Yeni sitede saha verisinin yokluğu “geçti” veya “kaldı” diye uydurulmaz; laboratuvar sonuçları ve yayın sonrası izleme planı ayrılır. Lighthouse puanı veya TBT tek başına gerçek kullanıcı INP'si sayılmaz; 100 puan ya da sıralama garantisi şart koşulmaz. Sabit mobil işlem alanı, galeri, yorum ve SSS düzeni kayma/etkileşim gecikmesi yaratmamalıdır. [Google Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals), [saha ölçüm eşikleri](https://web.dev/articles/vitals).

### 9.7 GEO erişimi, yayın izinleri ve sınırlar

**GEO-01:** Kamusal onaylı içerik için Googlebot/Bingbot ve arama amacıyla OAI-SearchBot erişimi CDN/WAF dahil kontrol edilir. Botun adını taklit etmek yetkilendirme sağlamaz; gerekli istisnalar resmî doğrulama/IP rehberine göre dar kapsamlı yapılır. Özel müşteri verileri hiçbir bot için açılmaz. OpenAI dokümanı OAI-SearchBot arama kullanımı ile GPTBot eğitim kullanımını ayrı yönetir; GPTBot izni, aramada görünmek için otomatik kabul edilmiş sayılmaz. Eğitim/veri kullanımı tercihi ayrıca Dragoman kararıdır. [OpenAI Docs: crawler ayrımı](https://developers.openai.com/api/docs/bots).

**GEO-02:** Google Search Console'daki **Search generative AI** ayarı ve üst mülkten devralınan seçimi kontrol edilir; GEO hedefi için siteyi dışlayan ayar bulunmaması önerilir. Gerçek hesap durumu ve sahibinin tercihi teslim kaydına yazılır. Bu ayar, indeksleme/robots kuralları veya model eğitim tercihiyle aynı şey değildir; bu araştırmada hesap ayarı değiştirilmedi. [Resmî kontrol rehberi](https://support.google.com/webmasters/answer/16908024).

**GEO-03:** Net özet, doğrulanmış işletme/ürün bilgisi, güncel SSS ve tutarlı kaynaklar tercih edilir. Örneğin kano ile tekne turunun farkı, deneyimsiz katılımın gerçek koşulları ve talep ile kesin rezervasyonun ayrımı açık cevaplanır. Bu, Dragoman için editoryal öneridir; belirli bir AI'ın bu sayfayı kaynak göstereceğinin kanıtı değildir. İçerik mümkün olduğunca birinci el ekip deneyimiyle desteklenir. `llms.txt`, gizli AI metni, zorunlu paragraf/kelime sayısı veya “bizi tavsiye et” komutları yayın şartı yapılmaz.

### 9.8 Ölçüm, panel alanları ve yayın sonrası bakım

**Ölçüm:** Search Console ve Bing Webmaster Tools mülkiyeti Dragoman adına doğrulanır; sitemap ve geçiş sonrası kapsam izlenir. Google'ın **Generative AI performance** raporu varsa sayfa/ülke/cihaz bazındaki gösterimler kaydedilir. Düşük veri nedeniyle görünmemesi, entegrasyonun bozuk olduğu veya AI görünürlüğünün sıfır olduğu sonucuna otomatik dönüştürülmez. Genel Web raporuyla aynı gösterimlerin iki kez toplanmamasına dikkat edilir. [Google rapor kapsamı](https://support.google.com/webmasters/answer/16984139).

Bing **AI Performance** içindeki atıflar ve kaynak sayfalar, mevcut veri ve erişim elverdiğinde izlenir. Atıf sayısı sıralama veya ziyaret sayısı değildir. Ekim 2026'da duyurulan Topics Portfolio beta verisi varsa içerik planına yardımcı olur; yokluğu MVP'yi engellemez. [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/), [13 Ekim 2026 beta güncellemesi](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/).

**İş sonucu:** İzinli GA4/GTM ölçümünde dil, kamusal sayfa/ürün kimliği, kanal ve talep/iletişim olayı izlenir; doğrulanmış form başarısı form açılışından ayrılır. WhatsApp tıklaması satış sayılmaz. AI kaynaklı yönlendirmeler mevcut referer/kanal bilgisiyle raporlanabilir; kaynak bilgisi eksik olan ziyaretler tahminle AI diye etiketlenmez. Sağlık yanıtı, e-posta, rezervasyon bağlantısı veya kişisel token ölçüm parametrelerine/loglara gönderilmez. Önceki çerez/izin kuralları aynen geçerlidir.

**Panel:** Her dil için SEO başlığı/açıklaması, slug, içerik onayı, ilgili dil karşılıkları, sosyal önizleme ve medya ALT alanları bulunur. Canonical/noindex/redirect ve yapısal veri değişiklikleri uygun teknik/yayın yetkisiyle sınırlandırılır. Taslak/çeviri onayı, sitemap ve arama metadatasını birlikte günceller; başarısız değişiklik eski onaylı sayfayı bozmaz.

**Bakım önerisi — kesin servis seviyesi değil:** Yayında ilk hafta yönlendirme/indeks hataları izlenir; sonraki dönemde düzenli SEO/GEO raporu hazırlanır. Rapor dili/sıklığı bakım anlaşmasında kesinleşir. IndexNow ile yalnızca kamusal yayınlanmış URL'lerin ekleme/güncelleme/silme bildirimleri isteğe bağlı sonraki iyileştirmedir; kabul yanıtı indeksleme garantisi sayılmaz. [IndexNow protokolü](https://www.indexnow.org/documentation).

**Dragoman'dan gerekenler:** Güncel ofis/iletişim/saat bilgileri ve resmî profil adresleri; doğrulanmış yetki/ekip bilgileri; ürün koşulları ve SSS onayları; Search Console/Bing/İşletme Profili erişimleri; eğitim amaçlı bot kullanımı tercihi. Ücretli SEO aracı, reklam bütçesi, dış bağlantı kampanyası veya ek AI protokolü bu bölümle otomatik satın alma/kapsam taahhüdü oluşturmaz.

## 10. Güvenlik, gizlilik, barındırma ve servis sahipliği

**21/25 kararı:** Yeni hosting ve veritabanı altyapısını UBT, proje teknolojileriyle uyum, performans, güvenlik, bakım kolaylığı ve maliyeti değerlendirerek belirler. Hosting, veritabanı, depolama ve diğer servis giderleri ayrı belgelenir. Alan adı `dragoman-turkey.com` kullanılır; mevcut WordPress/Flywheel sitesi geçiş tamamlanana kadar korunur. DNS değişiminde mevcut kurumsal posta kutuları ve kayıtlar korunur. Geçici ve canlı yapılandırmalar ayrılır; SSL/TLS, erişim kontrolü, ortam değişkenleri ve güvenli API bağlantıları sağlanır. Geçiş ve geri dönüş planı UBT tarafından hazırlanıp Dragoman'a bildirilir.

**18/25 kararı — yedekleme:** Veritabanı her gün otomatik yedeklenir, yedekler **30 gün** saklanır, şifrelenir ve yetkisiz erişime karşı korunur. Düzenli geri yükleme testleri yapılır. Yedekleme başarısızlığı yöneticiye bildirilir; yedekleme ve geri yükleme işlemleri kaydedilir. Fotoğraf, belge ve diğer yüklenen dosyalar da kurtarılabilecek şekilde yedek kapsamı belirlenir. Yayın öncesi ayrıca geri dönüş için kullanılabilir yedek alınır.

**22/25 kararı:** Alan adı, hosting, ödeme, DeepL, e-posta, analitik ve diğer harici servis hesapları/abonelikleri Dragoman adına açılır veya Dragoman sahipliğinde kalır. UBT, işi yürütmek için gerekli teknik yönetim yetkisiyle çalışır. Yönetici erişimleri kişi bazlı ve asgari yetkiyle verilir; gizli anahtarlar kod deposuna veya belgeye yazılmaz. Sözleşme/abonelik ve faturalandırma sahipliği ile teknik yönetici rolü ayrı kaydedilir.

Form ve panel girişleri doğrulanır; yetki kontrolü yalnızca ekranda değil veri erişiminde de uygulanır. Tüm panel kullanıcılarında 2FA zorunludur. Yönetici oturumları ve “İşleme Aldım” bağlantıları yetkisiz kullanıma karşı korunur. Ödeme sağlayıcı bildirimleri doğrulanır ve tekrar işleme dayanıklıdır. Sağlık bilgisi yalnızca gerekli ürün ve gerekli alanlarda toplanır; erişim, saklama süresi ve silme yöntemi müşteri/hukuki değerlendirmeyle belirlenir. Gizlilik/KVKK aydınlatması, gerektiğinde GDPR, çerez tercihleri, mesafeli satış ve hizmete özgü katılım/iptal koşulları işletme adına onaylanır. Çerez/izin sisteminin teknik çözümü UBT'ye bırakılmıştır; hukuki metinlerin doğruluğu kendiliğinden UBT'ye devredilmiş değildir.

### 10.1 Önceden paylaşılan teknoloji referansı

UBT, teknoloji bilgisinin daha önce verildiğini hatırlattı. Önceki **“Teknolojileri söyle”** sohbeti kontrol edildi: UBT [ubterzioglu/dragoman](https://github.com/ubterzioglu/dragoman) reposunda kullanılan teknolojileri sormuş; yanıtta aşağıdaki yapı listelenmişti. Bu referans önceki brief sürümlerine aktarılmamıştı; V5'e eklendi. Teknoloji bilgisi yokmuş gibi sıfırdan seçim sorusu açılmaz.

| Alan | Önceki sohbette kayıtlı referans |
| --- | --- |
| Ön yüz ve dil | React, TypeScript |
| Derleme ve tasarım | Vite, Tailwind CSS, PostCSS/Autoprefixer |
| Bileşenler | Radix UI / shadcn tarzı bileşenler; Lucide React, Framer Motion, Embla Carousel |
| Yönlendirme / yerelleştirme | React Router, i18next / react-i18next |
| Form / veri | React Hook Form, Zod, TanStack React Query |
| Veritabanı / kimlik / dosya | Supabase, PostgreSQL, Supabase Auth ve Storage |
| Sunucu işlemleri | Supabase Edge Functions / Deno |
| İçerik editörü | Quill, DOMPurify |
| SEO / test | React Helmet Async, JSON-LD, sitemap/robots; Vitest; eski repoda Playwright tabanlı yardımcı işlem |
| Dağıtım | Docker, Nginx, Coolify yapılandırması; Node.js ile derleme |

**Kaynağın sınırı:** Bu liste eski repo hakkındaki tarihsel sohbet bilgisidir; yeni `dragomanew` reposunda çalışan uygulama veya güncel bağımlılık sürümleri incelenmiş değildir. Önceki yanıtta tarif edilen mimari tarayıcıda çalışan bir SPA idi. Eski sürüm numaraları yeni projeye zorunlu pin olarak aktarılmaz. Gereksiz yeni stack seçimi veya otomatik Next.js geçişi varsayılmaz; uygulayıcı bu referansı dikkate alıp güncel gereksinimlerle uyumunu açıklar.

**Yeni gereksinimlerle birlikte uygulanması:** Vite/React referansının SEO-01'deki esas içeriği ilk HTML'de sunma yaklaşımını nasıl karşılayacağı ön işleme veya uygun render çözümüyle gösterilmelidir; yalnızca istemci metadatası eklemek bu içerik gereksiniminin yerine geçmez. Supabase kullanımı zorunlu 2FA, sunucu/veri katmanı yetkileri ve güvenli dosya erişimi şartlarını kaldırmaz. Eski sohbette geçen MyMemory yorum çevirisi, Rusça yorum desteği veya yorum toplama otomasyonu yeni kapsam tercihi değildir: mevcut DeepL Free API ve TR/EN/FR/DE onay kararları esas alınır; Google yorum yöntemi ayrıca doğrulanır. Hosting/servis sahipliği ve mali onaylar Bölüm 10'a göre UBT/Dragoman tarafından yönetilir.

## 11. Kabul ölçütleri ve yayın kararı

**Aşamaların ayrımı:** İlk teslim, kaynak ve mockup içeriklerle doldurulmuş bütün kapsam içi sayfa şablonlarıdır; UBT genel görünümü ve toplu düzeltmeleri değerlendirir. Bu aşamada panel, kalıcı form kaydı, e-posta veya ödeme entegrasyonunun tamamlanması beklenmez. Sonraki aşamada yönetim paneli, form kayıtları ve bildirim bağlantıları tamamlanır. Aşağıdaki MVP ölçütleri çalışan sitenin yayın kabulü içindir; ilk şablon tesliminin tamamına uygulanacak bir ön koşul listesi değildir. Örnek içeriklerin yerini onaylı içeriklerin alması ve gerçek servis erişimleri ilgili yayın aşamasında tamamlanır.

**24/25 kararı:** UBT otomatik ve manuel uçtan uca testleri yapar. Dragoman gerçek kullanım senaryolarıyla kullanıcı kabul testini yapar ve **yayın onayını verir**. UBT'nin teknik test başarısı, Dragoman'ın işletme kabulünün yerine geçmez. Aşağıdaki liste MVP kabulünü somutlaştırır; ödeme ve e-Fatura sonraki fazda ayrıca kabul edilir.

| No | MVP kabul senaryosu | Geçme ölçütü |
| --- | --- | --- |
| K1 | Dört dil ve temel sayfalar | Onaylı TR/EN/FR/DE içerik açılır; menü, iç bağlantı, logo ve temel sayfalar telefon/tablet/masaüstünde çalışır; mobil sabit işlem alanı içerik ve formları kapatmaz |
| K1a | Kabul edilen layout | İki satırlı masaüstü menü, mobil açılır menü, üç fotoğraflı açılış ve yedi bölümlük ana sayfa sırası uygulanır; kategori kartları ilgili detaylara, etkinlik talep düğmesi doğru forma gider |
| K1b | Temiz ve yalın kullanım | Ziyaretçi etkinlikleri, temel bilgileri ve talep/iletişim yollarını kolay bulur; farklı metin/dil ve ekran boyutları okunabilirliği bozmaz; görünür kalan bilgi/işlem alanları içeriği kapatmaz |
| K1c | SSS | İlgili etkinliğin onaylı soru-cevapları doğru dilde görünür; açılıp kapanma klavye/dokunmayla kullanılabilir; yanıtlar taranabilir içeriktir; boş veya onaysız içerik yayınlanmaz |
| K1d | Tekrar kullanılabilir şablonlar | Yetkili kullanıcı aynı kategori/etkinlik/yazı/ürün şablonundan farklı içerikler oluşturur; boş isteğe bağlı bölümler gizlenir, zorunlu alanlar yayın öncesi doğrulanır; uzun/kısa ve farklı dilde metinler düzeni bozmaz; örnek veriler canlıya çıkmaz |
| K1e | Son sadelik kararları | İçerik girişi başlık, metin ve fotoğraflarla blog mantığındadır; ayrı panel önizlemesi ve süre/deneyim filtreleri yoktur; slogan özgün İngilizce metniyle korunur |
| K2 | İletişim | Her sayfadan WhatsApp/e-posta açılır; form gönderimi kayda ve `info@dragoman-turkey.com` bildirimine ulaşır |
| K3 | Ürün ve rezervasyon talebi | İlk etkinlik formunda etkinlik otomatik seçilir; ad-soyad, e-posta, tarih tercihi ve kişi sayısı zorunlu, telefon ve mesaj isteğe bağlıdır; ayrıntılı sağlık bilgisi ilk talepte istenmez. Ulaşım/Konaklama talep formu da çalışır. Alanlar daha sonra panelden düzenlenebilir, önceki yanıtlar korunur; ziyaretçi kesin rezervasyon/ödeme yapıldığına dair yanlış mesaj almaz |
| K4 | Katılımcı formları | Form gereken üründe her katılımcının ayrı kaydı alınır; Dalış/Outdoor kaynak PDF'sinin soru, açıklama ve katılımcı/veli-vasi alanları eşlenir; sağlık formu ilk kısa talebe karıştırılmaz. Çevrimiçi yanıt ve merkezde kâğıt imza ayrımı açıkça belirtilir; sitede imza çizme yoktur. Önceki yanıtlar/form sürümü korunur; yeni formda Evet/Hayır önceden seçili değildir; yanıtsız zorunlu soru tamamlanmış sayılmaz ve boş yanıt Hayır sayılmaz, herhangi bir Evet form gönderimini engellemeden ilgili katılımcıda İnceleme gerekiyor işareti ve yetkili bildirimi oluşturur; sistem otomatik kabul/ret vermez; form tamamlanması otomatik uygunluk kararı üretmez; eksik ve inceleme gerektiren yanıtlar uygunluk onayı olmadan geçmez |
| K5 | İçerik yönetimi ve erişim | Yetkili kişi ürünü ve işlem yöntemini düzenler; değişiklik doğru sayfada görünür; çoklu rol/özel yetki sunucu tarafında uygulanır; tüm panel kullanıcıları 2FA ile girer |
| K6 | Çeviri yayını ve güncelleme | Ana içerikle birlikte üretilmiş çeviri ayrı dil onayı beklemeden yayınlanır; müşteri düzenleyebilir; kaynak değişince mevcut metin korunur ve güncelleme uyarısı çıkar; DeepL hata/kota uyarısı gösterilir |
| K7 | SEO, URL ve ölçüm | Önemli eski URL'ler yeni sayfalara gider; QR hedefleri, sitemap, canonical, dil ilişkileri ve canlı indeks ayarları kontrol edilir; GA4/GTM olayları izin öncesi çalışmaz, izin sonrası hassas veri içermez; Search Console doğrulanır |
| K7a | HTML ve erişim | Temsilî her şablonda başlık, esas metin/SSS ve gerçek iç bağlantılar ilk HTML'de bulunur; içerik için çerez kabulü/tıklama gerekmez; canlı kamusal sayfa ve kaynakları botlara açıktır |
| K7b | Diller | Onaylı sürümlerde aynı dilde canonical, karşılıklı/kendisini içeren hreflang ve doğru dil seçici bulunur; eksik çeviri yayınlanmaz; açık dil URL'si tarayıcı/IP ile başka dile zorlanmaz |
| K7c | Geçiş | 85 kaynak adayı, eldeki gerçek trafik/QR listeleriyle tamamlanıp eşlenir; kritik eski/QR adresleri tek adımda ilgili 200 hedefe gider; karşılıksız silinen sayfa 404/410 döner |
| K7d | Sitemap ve özel veri | Sitemap yalnızca onaylı canonical kamusal URL içerir; taslak/özel işlem sayfaları yoktur; geçici ortam ve özel bağlantılar erişimle korunur; noindex kontrolü güvenliğin yerine sayılmaz |
| K7e | Yapısal veri | Temsilî JSON-LD örnekleri uygun doğrulayıcıyla kontrol edilir; kritik şema hatası, sahte fiyat/stok/tarih veya işletmenin kendi yorumlarına yıldız işaretlemesi yoktur; koşullu türler uydurma alanla doldurulmaz |
| K7f | Görsel ve hız | Açılış görselleri img/picture ile bulunabilir; ölçü/ALT ve responsive sunum doğrulanır. Temsilî mobil/masaüstü ölçüm raporu, saha hedefleri ve veri yoksa takip planı teslim edilir |
| K7g | GEO ayarları | Kamusal arama botu erişimi ve Google Search generative AI mülk seçimi kontrol kaydına alınır; eğitim izni ayrı karar olarak tutulur; gizli müşteri sayfaları açılmaz |
| K7h | Ölçüm | Search Console/Bing erişimi ve veri durumu kaydedilir; varsa Google AI gösterimi ve Bing atıf raporu doğrulanır; izinli form başarısı/WhatsApp olayları ayrılır, kişisel/token verisi analitiğe gitmez |
| K8 | Operasyon | Talep panelde bulunur; güvenli işleme alma varsa üstlenen kişi görünür; e-posta hatası kayıt kaybı yaratmaz |
| K9 | Güvenlik ve hukuk | Yetki sınırları, gerekli izin/metinler ve hassas veri akışı onaylanır; günlük şifreli yedek, 30 gün saklama, hata bildirimi ve geri yükleme testi doğrulanır |
| K9a | WordPress aktarımı | İçerikler topluca taslağa alınır; Dragoman onayı olmadan yayınlanmaz; eski URL karşılıkları çalışır |
| K9b | Medya ve işlem kayıtları | MVP'de medya güvenle yüklenir/kullanılır ve canlı işlemlerin temel kayıtları tutulur; gelişmiş kütüphane/audit log sonraki faz kabul listesine alınır |
| K10 | İşletme kabulü | Dragoman örnek müşteri, grup katılımcısı, içerik düzenleme ve talep takip senaryolarını dener; açık kritik hata kalmadan yazılı yayın onayı verir |

**POS fazı kabulü:** başarılı/başarısız/iptal ödeme, tekrarlanan sağlayıcı bildirimi, havale teyidi, stok ve uygunluk sınırları test edilir. EUR/TL seçimi, otomatik kurun ödeme ekranında 30 dakika kilitlenmesi ve aynı oturumdaki tekrar denemede korunması; kitap sepetiyle etkinliğin ayrılması; etkinlikte çoklu katılımcı/tek ödeme; kapora, kalan ödeme hatırlatmaları ve gecikme işlemleri doğrulanır. Onay Bekliyor → Onaylandı veya alternatif tarih/iade akışı; tam/kısmi iade, orijinal para birimi ve personel limitinin parçalı iadeyle aşılamaması sınanır. Güvenli müşteri bağlantısı, hassas işlem doğrulaması, ayrı katılımcı formu, 72/24 saat hatırlatmaları ve değişiklik akışları gerçek senaryoyla denenir. **e-Fatura fazı kabulü:** doğru alıcı/KDV/sipariş verisi, personel onayı, fatura üretimi, düzeltme talebi, güvenli görüntüleme, 5/15/60 dakika e-posta denemeleri ve hata bildirimi mali süreç sahibi tarafından doğrulanır. Hata ve eksikler önceliklendirilir; kritik güvenlik, veri kaybı veya yanlış ödeme durumu açıkken ilgili özellik yayınlanmaz.

## 12. Bakım ve değişiklik yönetimi

**25/25 kararı:** UBT düzenli teknik bakımı üstlenir. Bakım; barındırma/sertifika/alan adı sağlığı, güvenlik ve bağımlılık güncellemeleri, yedekler, hata izleme, erişim ve entegrasyonların çalışmasının kontrolü ile gerekli teknik düzeltmeleri kapsar. Hatalar etkisine göre önceliklendirilip giderilir; bildirim, müdahale süresi, bakım sıklığı ve raporlama biçimi ayrıca yazılı anlaşmada netleştirilir. Yeni özellikler ve kapsam genişlemeleri ayrı talep olarak değerlendirilir, efor/masrafı belirtilir ve Dragoman onayıyla planlanır. Hata düzeltme ile yeni özellik aynı kaleme karıştırılmaz.

İlk geliştirme için önceki müşteri kaydı **250 € + masraflar**; yayın sonrası bakım/ek hizmet için **25 €/saat önerisi** vardır, ancak müşteri bu saat ücretinin yeniden görüşülebileceğini belirtmiştir. Nihai bakım bedeli, dahil saat, harici abonelikler, masraf onay süreci ve ödeme koşulları henüz kesin değildir. Bu brief tek başına yeni mali taahhüt oluşturmaz.

## 13. Yayın ve sonraki fazlar için açık bilgiler

Aşağıdaki liste, nihai içerik, gerçek servis bağlantıları ve ticari koşullar için gereken **açık bilgileri** toplar. Şablon geliştirmeye başlama ön koşulu değildir: içerik ve form örnekleri mevcut klasörden ve mockup verilerden hazırlanır; UBT gerekli gerçek bilgileri müşteriden daha sonra alır. Alanlar ve içerikler değiştirilebilir hazırlanır. P0/P1/P2 etiketleri tüm geliştirmeyi bekleten bir sıralama değildir; her satır ilgili özellik veya faz yayına alınmadan tamamlanır. Ödeme onayı, iptal/iade, kur, kapora ve fatura bilgileri ilgili sonraki faza aittir; ilk tanıtım/talep şablonlarını bekletmez. 1–2/25 geliştirici yanıtları ödeme sonrası akışı tarif eder; müşteri adına ticari koşul onayı sayılmaz. Yanıtlar geldikçe karar tarihi ve sahibi kaydedilir.

**Ulaşım/Konaklama kararı — 29 Ekim 2026:** Görüşmenin sonuna bırakılan konu ele alındı. UBT, yalnızca WhatsApp/e-posta yerine form da eklenmesini istedi: iki bölüme uygun teklif/bilgi talep formu başlangıçta mockup alanlarla hazırlanacak. Temsili alanlar hizmet türü (ulaşım/konaklama), ad-soyad, e-posta, ilgili tarih/tarih aralığı, kişi sayısı ve mesaj olabilir; kesin alanlar müşteri tarafından henüz onaylanmış değildir. UBT gerekli bilgileri müşteriden alıp form içeriğini daha sonra düzenleyecek; önceki düzenlenebilir form kararı burada da uygulanır. Form gönderimi kesin rezervasyon, müsaitlik veya fiyat onayı değildir. Bağımsız doğrudan satış/ödeme kapsamı bu kararla açılmaz. Ödeme sağlayıcısı araştırması ertelenmiş kalır.

| Öncelik | Soru / beklenen veri | Karar sahibi |
| --- | --- | --- |
| Ödeme fazı öncesi | UBT'nin ödeme → Onay Bekliyor → Dragoman onayı ve onaylanamazsa alternatif tarih/iade akışını Dragoman ticari koşul olarak kabul ediyor mu? İptal/iade süreleri ve istisnaları nedir? | Dragoman / Draman |
| P0 | 1 Aralık ürün listesi, her ürünün görünür işlem yöntemi ve rezervasyon talebi metni nedir? | Dragoman / Draman |
| P0 | Ürün başına EUR fiyat, kişi/grup/sezon/çocuk/ekstra kuralları ve kitap stokları nedir? | Dragoman |
| İlgili formun yayını öncesi | İlk talep alanları kabul edildi; Ulaşım/Konaklama formu mockup alanlarla hazırlanacak. Dalış/Outdoor sağlık PDF'si alındı ve soruları çıkarıldı (Bölüm 6.1). Kalanlar: belirsiz kaynak ifadeleri, yaşla ilişkili alt maddelerin gösterimi, gerçek inceleme sorumluları/değerlendirme ölçütleri, çocuk/veli süreci (herhangi bir Evet için inceleme işareti ve bildirim akışı kabul edildi) ve sağlık verisi saklama/izin kuralları. | UBT müşteriden alacak; gerektiğinde ilgili uzman görüşü |
| P0 | Taşınacak/çıkarılacak/güncellenecek içerikler, onaylı çeviriler, eksik fotoğraf/video ve kullanım hakları nedir? | Dragoman |
| P0 | Cankurtarma Eğitimleri'nin halen sunulan seçenekleri ve güncel koşulları nedir? Dalış altındaki sayfa yeri kabul edildi; hizmetin devamı şimdilik çalışma varsayımıdır. | Dragoman; UBT içerik eşleştirme |
| P0 | Onaylı gizlilik, çerez, satış, katılım, iptal/iade metinleri ve yayın onaylayıcıları kimlerdir? | Dragoman; gerektiğinde hukuk/mali müşavir |
| P1 | Otomatik kurun somut kaynağı, masraf/marj ve yuvarlama yöntemi nedir? POS sağlayıcısı hem EUR hem TL tahsilatı destekliyor mu? | Dragoman; banka/UBT teknik inceleme |
| P1 — ertelendi | Araştırma yeniden açıldığında: POSNET'in entegrasyonu ve ticari koşulları uygun mu; iyzico dışındaki hangi alternatifler gereksinimleri karşılıyor? Şu anda araştırma veya sağlayıcı seçimi yapılmayacak. | Dragoman / banka/sağlayıcı; UBT teknik inceleme |
| P1 | Havale bekleme/teyit kuralı ve her ürünün somut kapora oranı/tutarı, kalan ödeme vadesi nedir? | Dragoman |
| P1 | Kitap gönderim ülkeleri, bölge ücretleri, süreleri, baskı/dil varyantları ve ofis teslim talimatı nedir? | Dragoman |
| P1 | Mevcut muhasebe/fatura sistemi nedir; uygun e-Fatura/e-Arşiv sağlayıcısı, ülkeye göre zorunlu alıcı bilgisi ve mali süreç sahibi kimdir? | Dragoman / mali müşavir |
| P1 | `info@` bildirimlerini hangi gerçek personel görecek, kimlere talep sorumluluğu ve devir yetkisi verilecek? | Dragoman |
| P1 | Dragoman adına DeepL Free API hesabını kim açacak; EN/FR/DE onay yetkilileri kimlerdir ve ücretsiz kotanın yetmediği durumda mali onay süreci nedir? | Dragoman; UBT teknik inceleme |
| P1 | Hosting ve diğer servislerin Dragoman hesabı, teknik erişimleri ve masraf onay yetkisi nasıl düzenlenecek? | Dragoman / UBT |
| P1 | Google İşletme Profili/site için güncel adres, telefon, saatler ve resmî profil bağlantıları; Search Console/Bing erişimleri ve ayrı model eğitimi bot tercihi nedir? | Dragoman; UBT teknik kontrol |
| P2 | Üyelik/özel indirim ve ileri otomasyonlardan hangileri sonraki talep olacak? Ulaşım/Konaklama için talep formu kabul edildi; nihai form alanlarını UBT müşteriden alacak. Bağımsız doğrudan satış ayrıca değerlendirilir. SSS'nin varlığı kesinleşti; soru-cevap içerikleri onaylanacak. | Dragoman / Draman |
| P2 | Bakım ücreti, servis seviyesi, masraf kalemleri ve yeni özellik onay yolu nasıl kesinleşecek? | Dragoman / UBT |

## 14. Teslim ve karar kayıtları

**Güncel çalışma belgesi V6'dır.** V5, V4 ve daha eski sürümler karar izi için korunur. Bu sürüm, dokümantasyon devam ederken kaydedilmiş birleştirilmiş durumdur; Claude Code'a nihai uygulama devri verildiği veya geliştirme emri başlatıldığı anlamına gelmez. Sonraki açık yanıtlar ayrıca kaydedilerek ilerlenir.

UBT teslimleri: içerik ve eski URL envanteri; sayfa/ürün matrisi; tasarım gösterimi; MVP uygulaması; dört dilin çeviri/onay akışı; yönetim kılavuzu; teknik test sonuçları; yönlendirme ve DNS geçiş planı; yedek/geri dönüş planı; açık hata listesi. Dragoman teslimleri: içerik ve medya kararları; ürün/fiyat/stok/koşul cetveli; gerekli hukuki ve mali onaylar; servis hesapları; gerçek senaryolarla kullanıcı kabul testi ve yazılı yayın onayı.

**Karar izi:** İlk briefin 50 müşteri yanıtı aşağıdaki Ek A'da ve [kaynak belgede](./Dragoman_Proje_Brief.md#16-müşterinin-verdiği-ham-cevaplar-numaralı-ek) bulunur. Önceki geliştirici kararları ve **25 sorunun tüm yanıtları** [paylaşılan görüşmede](https://chatgpt.com/share/6adf227e-9bb4-83eb-a1fb-50be0e08fe31) görülmüştür. Aşağıdaki özet numaraları karıştırmadan izleme içindir; uygulama ayrıntıları üst bölümlerdedir.

| Soru | Onaylanan geliştirici kararı |
| --- | --- |
| 1 | Ödeme sonrası Onay Bekliyor; Dragoman tarih/uygunluk onayıyla kesinleşme |
| 2 | Onaylanamazsa alternatif tarih; müşteri reddederse orijinal para biriminde iade süreci |
| 3 | Etkinlik bazında tam ödeme, yüzde veya sabit kapora; kalan vade panelden |
| 4 | Kalan ödeme için vade öncesi 7 ve 2 gün hatırlatma/ödeme bağlantısı |
| 5 | Gecikmede süre uzatma, yeni bağlantı veya iptal süreci |
| 6 | Etkinlik bazında ücretli/ücretsiz ek hizmet |
| 7 | Ek hizmette kişi veya rezervasyon bazlı ücretlendirme |
| 8 | Kişi, grup ve katılımcı sayısı basamaklarına göre fiyat |
| 9 | Sezonluk tarih aralığı ve özel gün fiyatı |
| 10 | Ürün/etkinlik taslağı ve yetkili yayın onayı |
| 11 | Gelişmiş SEO/GEO, Schema.org, sosyal önizleme ve kalite/teknik kontrol |
| 12 | GA4, Search Console, GTM ve izinli dönüşüm takibi |
| 13 | Dört dilde kategorili çerez kabul/ret/tercih yönetimi |
| 14 | Mobilde sabit, sayfaya göre değişen WhatsApp ve Rezervasyon/İletişim alanı |
| 15 | Hazır personel rolleri ile ana yöneticinin kişiye özel yetki düzenlemesi |
| 16 | Tüm panel kullanıcılarında zorunlu 2FA |
| 17 | Önemli işlemlerde ayrıntılı ve filtrelenebilir audit log |
| 18 | Günlük şifreli yedek, 30 gün saklama, geri yükleme testi |
| 19 | WordPress içeriğini taslağa toplu aktarma ve müşteri onayıyla yayın |
| 20 | Kategorili, optimize, çok dilli ALT destekli gelişmiş medya kütüphanesi |
| 21 | Hosting/veritabanı seçimini performans, güvenlik, bakım ve maliyetle UBT'nin yapması |
| 22 | Harici servis hesapları Dragoman adına; UBT teknik yönetici |
| 23 | 1 Aralık MVP ve POS/e-Fatura/gelişmiş işlevlerin sonraki fazı |
| 24 | UBT otomatik/manuel E2E, Dragoman gerçek senaryo UAT ve yayın onayı |
| 25 | UBT düzenli bakım; öncelikli hata düzeltme; yeni özellik için ayrı onay |

### 14.1 V5 değişiklik kaydı — 26 Ekim 2026

| Konu | Güncel karar / durum |
| --- | --- |
| Teslim yöntemi | Dokümantasyon bitince belge Claude Code'a verilecek; bu oturum belgeleme işi |
| Önce şablon | Bütün kapsam içi sayfa türlerinin tekrar kullanılabilir şablonları hazırlanacak; UBT gerçek içerikleri daha sonra müşterinin tercihlerine göre dolduracak. Kesin içerik listesi geliştirmeye başlama ön koşulu değil |
| Teknoloji referansı | Önceki “Teknolojileri söyle” sohbetindeki eski dragoman reposu listesi Bölüm 10.1'e geri kazanıldı: React/TypeScript/Vite/Tailwind/Supabase; yeni repo uygulaması veya eski sürüm pinleri olarak sunulmaz |
| Çalışma yeri | `C:\temp_private\dragomanew`; GitHub `ubterzioglu/dragomanew` |
| Tasarım | Modern, temiz, yalın, kolay erişilebilir; görsel ayrıntılar tasarım ilkelerine göre uygulayıcıya bırakılır |
| Ana sayfa | Tüm etkinlikler öncelikli; üç fotoğraflı açılış ve yedi bölümlük sıra kabul edildi |
| Üst menü | İki satırlı masaüstü, açılır mobil menü kabul edildi |
| Kategori | Kısa tanıtım, kapak, gruplar ve fotoğraflı kartlar kabul edildi |
| Etkinlik detayı | Solda içerik/galeri, sağda görünür bilgi/talep kutusu; mobil tek sütun ve sabit işlem alanı kabul edildi |
| Cankurtarma | Dalış altında ayrı sayfa kabul edildi; güncel hizmet/eğitim kapsamı doğrulanacak |
| SSS | Kesin gereksinim; etkinlik detaylarında ilgili onaylı soru-cevaplar, açılıp kapanabilir ve taranabilir içerik olarak sunulur |
| SEO/GEO güncellemesi | 26 Ekim 2026 resmî kaynak araştırması Bölüm 9.1–9.8'e ve K7a–K7h kabul ölçütlerine işlendi; bot/eğitim, dil davranışı, doğru şema ve AI ölçümü netleştirildi |
| WordPress | Export ve tekrarlar incelendi; 88 içerik, 958 medya kaydı/323 adres; gerçek medya dosyaları eksik |
| Ödeme | Sağlayıcı açık; POSNET entegrasyonu kolaysa aday; alternatif araştırması ertelendi; iyzico otomatik yedek değil |
| Önceki kararlar | 25/25 geliştirici kararı ile ilk 50 müşteri yanıtı korundu; MVP/sonraki faz ve müşteri onayı ayrımı geçerli |

### 14.2 V6 sürüm kaydı — 26 Ekim 2026

UBT'nin **“V6 olarak kaydet”** talimatıyla V5'in son durumu yeni sürüm olarak kaydedildi. Bu sürümleme yeni özellik veya uygulama/yayın onayı eklemez; V5 dosyası değiştirilmeden korunur. Bölüm 14.1, V5 döneminde biriken kararların tarihsel kaydıdır.

V6'nın içerdiği son durum:

- Önce bütün kapsam içi sayfa türlerinin tekrar kullanılabilir, `cloner` kaynakları ve mockup içeriklerle doldurulmuş şablonları; UBT'nin genel görünüm değerlendirmesinden sonra panel, form kayıtları ve bildirim bağlantıları. Nihai içerikleri UBT daha sonra günceller.
- Modern, temiz ve yalın arayüz; kabul edilmiş ana sayfa, menü, kategori ve etkinlik detay yerleşimleri.
- Dalış altında Cankurtarma Eğitimleri sayfası; güncel eğitim kapsamı ayrıca doğrulanacak.
- Kesin SSS gereksinimi, güncel SEO/GEO araştırması ve kabul ölçütleri.
- Eski repo hakkındaki önceki React/TypeScript/Vite/Tailwind/Supabase teknoloji referansı; yeni uygulama veya sürüm pinleri varmış gibi sunulmaz.
- Ulaşım/Konaklama için mockup alanlarla başlanacak düzenlenebilir talep formu 29 Ekim'de kabul edildi; nihai bilgiler müşteriden alınacak. Ödeme araştırması ertelenmiş, POSNET entegrasyonu kolaysa aday.
- Önceki kapsam/fazlar, taslak içerik aktarımı, dört dil/onay, güvenlik, test, bakım ve müşteri yayın onayı ayrımı korunur.

### 14.3 V6 son kararlar ve tutarlılık kontrolü — 29 Ekim 2026

- Marka sloganı: **Once a Dragoman, always a Dragoman.**
- Şablonlar boş bırakılmaz; uygun eski site içerikleri `C:\temp_private\dragomanew\cloner` kaynağından alınır, eksikler temsili içerikle tamamlanır.
- İçerik girişi blog tarzında sade tutulur; ayrı masaüstü/mobil panel önizlemesi eklenmez. Önceden kabul edilen şablon yerleşimleri ve işlevsel alanlar korunur.
- İlk sürümde ek süre/deneyim filtresi yoktur; kategori, alt başlıklar ve kartlar kullanılır.
- İlk etkinlik talep formunun başlangıç alanları kabul edildi; form içeriği ve alanları daha sonra değiştirilebilir.
- Ulaşım/Konaklama talep formu kabul edildi; nihai alanları UBT müşteriden alır. Bu konu artık form mu/yalnız iletişim mi şeklinde açık değildir.
- Geliştirme sırası ve ilk şablon teslimi, çalışan MVP ve yayın kabulünden ayrıldı. Eksik müşteri içerikleri veya ertelenmiş ödeme araştırması şablonları bekletmez.
- Önceki sürümler, 25 geliştirici kararının izi ve Ek A'daki 50 müşteri yanıtı korunur. Bu kontrol yeni özellik, ödeme araştırması, uygulama geliştirme veya yayın işlemi başlatmaz.
- Sonradan verilen Dalış/Outdoor sağlık PDF'si Bölüm 6.1'e ve ayrı soru/alan envanterine işlendi; kaynak dosya `sources/forms/` altında korundu. İlk rezervasyon talebi ile ayrı katılımcı sağlık formu ayrımı devam eder.
- Claude Code'un tekrar soru ihtiyacını azaltmak için ayrı uygulama rehberi eklendi: karar sınırları, eksik bilgiyle ilerleme, şablon/çalışan akış/yayın/ödeme fazları ve bunlara bağlı E01–E17 senaryoları. Gerçek dış bilgi ihtiyacı, kozmetik seçimlerden ve mockup ile ilerlenebilen içerik eksiklerinden ayrıldı.

## Ek A — Müşterinin ilk görüşmedeki 50 yanıtı

Aşağıdaki kayıtlar önceki briefteki müşteri yanıtlarının izlenebilirlik ekidir. Üstteki karar ve faz tabloları uygulama kapsamı için esas alınır.


Aşağıda cevapların özlü ham kayıtları bulunur: mümkün olan yerlerde müşterinin kendi sözleri korunmuştur; birden fazla mesajla tamamlanan cevaplar birleştirilmiştir. Soru 3 bir görselle yanıtlandığı için kabul edilen görüşme özetinden aktarılmıştır. Bu bölüm tasarım kararlarının yerine değil, kararların izlenebilirliği için eklenmiştir.

- Soru 1: “Dragoman; yaklaşık 25 yıldır, bireysel birikimlerini alternatif turizm alanına taşımayı amaçlayan; emek verdiğimiz Kaş-Kekova Deniz Koruma Alanı'nda, su altında veya Likya patikalarında, Akdeniz'in kucağında sizlere tecrübelerini ve doğa sevgilerini sunarak en yüksek ve emniyetli standartlarda hizmet vermeyi bir yaşam şekli olarak seçenlerden oluşuyor… Dalış, Deniz Kanosu, türkiyede tek ve ilk Coasteering, bisiklet ve yürüyüs turları, kültür turları ve kamplı turlar, haftalık tailor made turlar, yurtdısı dalıs turları hepsini yapıyor.”

- Soru 2: “dalıs seakayak, doga sporları, yurtdısı turlar ama dalısa baglı, belki transport ve konaklama”

- Soru 3: Görselle verilen ve bölüm özetinde kabul edilen içerik: 25 yılı aşan bölge deneyimi; lisanslı/profesyonel rehberler; güvenlik; küçük gruplar; konforlu organizasyon; deneyim seviyesine uygun yaklaşım.

- Soru 4: “yaz kıs hizmet vermesi, uzun süredir calısan güvenilir, işini seven ve isinde uzman personel, a sınıfı seyahat acentesi olarak havalimanından havalimanına tüm hizmetleri verebilmesi, dürüst ve güvenilir bir işletme olması”

- Soru 5: “daha cok türkiye den acenteler, dalış ve universite dalıs klüpleri, bireysel müşteriler ve kapı müsterileri”

- Soru 6: “once türkiye sonra fransa ingiltere cok az almanya ve amerika”

- Soru 7: “tr eng fr ve bence de”; Almanca kastedildiği sorularak netleştirildi: “evet”.

- Soru 8: “genellikle google, bazen istagram, tanıdıklar da agırlıklı oluyor, otellerden daha az , acenteler de var tabii”

- Soru 9: “yok.”

- Soru 10: “her seyi”

- Soru 11: “wp nin eski bir sistem olması, user friendly olmaması, sitenin kötü olması ve düzeltilememesi.”

- Soru 12: “icerik korunacak, fakat tasarım degisecek, daha user friendly kısa ve oz, kolay okunacak ve isteyenin ilerlemesine müsade edecek, adfmin panelinde herkesin rahatca ürün ekleyip cıkarabileceği, ve standart olcülerin de korunabileceği bir tasarım. Daha aktif.”

- Soru 13: “kesinlikle iletisimi hızlandırmalı, rezervasyon ve bazı ürünlerin satısını kolaylastırmalı, profesyonelliğimizi, cagı yakaladığımızı ve isimizin en iyisi oldugumuzu gostermeli.”

- Soru 14: “yueterli bilgiyi edinerek rezervasyon asamasında formlarını da doldurmasını ve gerekli bilgileri bize göndererek odemesini de yapıp hemen ürünü satın alabilmesini, ya da yazmak istiyorsa sadece bize yazmasını, kolayca bizimle iletişim kurabilmesini whatsapp ve mail ne isterse”

- Soru 15: “evet bazı ürünleri dogrudan satabilmek bazıları için de sadece bize yazmalarını istiyoruz”

- Soru 16: “web sitesinden iletişimin ya da satısların artması, su anda neredeyse hic yok”

- Soru 17: “bunları degerlendirip barıs a soyleyeceğiz.” Sonradan açık düzeltme: “ubte ye bırakılacak degil sonra verilecek”.

- Soru 18: “bunu da barıs a soyleyeceğiz, zaten kayak sitesinden biliyor.” Sonradan açık düzeltme: “ubte ye bırakılacak degil sonra verilecek”.

- Soru 19: “hazır olanlar da var yeni vermemiz gerekenler de”

- Soru 20: “yorumlar olacak google a baglanacak”

- Soru 21: “daha dinamik, samimi, kurumsal ve elbette premium, kafa karıstırmayan, acık, hızlıca cevap veren”

- Soru 22: “[https://dragomanseakayak.com/tr](https://dragomanseakayak.com/tr) burada kullandıgımız renkler, logomuzun renkleri öncelikli kullanacağız tabii. Bunun dısında profesyonel bir tasarımcı gözüyle vereceğin fikirlere açıgım, denizi, dogayı, güveni çagrıstıran renkler seçilmeli.”

- Soru 23: “mevcut logomuzu koruyacagız.”

- Soru 24: “özellikle aklıma gelen bir site yok, seakayak sitesini de yeni yaptık onu begeniyorum sadelik ve kolaylık acısından”

- Soru 25: “su an burada [https://dragoman-turkey.com/shop/](https://dragoman-turkey.com/shop/) yer alan kitaplara ek olarak deneme dalışı, kekova klasik kano turu ve kekova tekne turu olabilir. Burada istediğimiz zaman yeni bir ürün kolaylıkla ekleyebilmemiz lazım.” Ek açıklama: Kitap sepete doğrudan girebilmeli; turlar/dalışta koşula göre bilgi ve sağlık formları doldurulmalı, uygun müşteri sonrasında satın alabilmeli.

- Soru 26: “Tarihi biz teyid ederiz ama. çünkü girip sitede ayrı ayrı işlememiz gerekiyorsa biz onu unuturuz.”

- Soru 27: “kredi kartıyla ödeme, iban a gönderme,mümkünse sadece kapora ödeme seçeneği de olabilir. Yapı kredi kullanıyoruz, online ödeme sistemi var sanki sanal pos gibi bir şey yapılabiliyorsa (araştır) bununla yapmak istiyorum, yoksa iyzico kullanacagız”

- Soru 28: “blog kesillikle olacak. Halihazırdaki sitedekiler de tasınacak oraya. belki sık sorulan sorular eklenebilir, düşünürüz belki de gereksiz. Üyelik sistemi isterim mesela özel indirimler veririz vs. ama belki hemen değil de sistem bunu yapmak için uygun hazırlanabiliyorsa harika olur. kampanyalar değil ama haberler gibi dinamik bir alan, öne cıkarmak istediğimiz turları, teklifleri, ya da blog yazılarını koyabileceğimiz bir yer olmalı.”

- Soru 29: “bizde var, ubt de aldı” (hangi soruya ait olduğu daha sonra açıkça “29” olarak düzeltildi).

- Soru 30: “flywheel, ubt devamını bize soyler”

- Soru 31: “evet” (mevcut kurumsal e-postalar korunacak).

- Soru 32: “hazır degil, iptel koşulları biraz bellli ama üstünden geçmem gerekiyor.”

- Soru 33: “ubt ye bırakıyorum”

- Soru 34: “mümkün olsa belli kişilerin belli yerlere erişimini bir admin in yönetmesini elbette isterim. yok olmuyorsa belirli yöneticiler yani cogunlukla ben”

- Soru 35: “evet” (Google İşletme Profili var).

- Soru 36: “instagram facebook youtube”

- Soru 37: “evet” (ücretli reklam düşünülüyor).

- Soru 38: “Kaş'ta dalış, Kaş tatil, Kekova seakayak ya da deniz kanosu, kaş ta yürüyüş turları, tekne turları, Kaş open water kursu, Kaş deneme Dalışı vs vs liste uzun tabii nigilizceleri almancaları, fransızcaları ruscaları”

- Soru 39: “ubt ile kararlaştırıldı. başlangıc olarak site hizmete girene kadar çalışmaları için 250 eur + masraflar. sonrasında vereceği düzenli bakım, ekstra hizmetler vs için 25 Eur / saat ama bu belki biraz fazla bakıcaz.”

- Soru 40: “ben ve draman”

- Soru 41: “eski siteden kendisi çekecek, ekleme cıkarma ve düzeltmeleri ben takip edeceğim.”

- Soru 42: “giriş yetkilerini aldı, word press e girebiliyor, onun dışında ihtiyacları nedir bilmiyorum, mümkünse fotograf vs cok zaman ben harcayamayabilirim su anda”

- Soru 43: “temel özellikler ve sayfalarıyla hazır olması önemli, linklerin çalışır olması lazım ki karekodlar vs yapılabilsin.”

- Soru 44: “kendisi karar versin. ama tasarım hazır olduğunda genel hatlara bankmak isterim tabii.”

- Soru 45: “belirlediğimiz kişiler çoğunlukla ben. ama dil desteği olmalı, ben çevirmeyeceğim yani.” Açıklama: “evet. cevirsin ancak biz onaylayalım.”

- Soru 46: “tabii ki”. Açıklama: “kılavuzun sayfa sayfa olmasına gerek yok, kısaca acıklamalar olması yeterli”.

- Soru 47: “ğer düzenli bir bakım gerekiyorsa ubt.”

- Soru 48: “seakayak admin panelinde de revizyon talebi oluşturuyoruz o güzel.”

- Soru 49: “info adresine direk düşmeli. mümkünse o mailde bir onay olabilir miydi acaba gördüm işlem yapıyorum gibi. kayakta siteye koymustu barıs ama o cok aktif kullanılamıyor. Bunu konusalım nasıl yapabiliriz.” Öneri sonrası: “harika bu yapılabiliyorsa işleme alsa zaten gerisi rezervasyondan devam eder. sanki ekstradan tamamlandı yüküne gerek yok.”

- Soru 50: “üyelik sistemi düşüneceklerimiz arasında ilk seferde olmasına gerek yok. Bütün bunların yanında bir de konustuk mu bilemedim ama direk satın alınamyan seyler için direk e mail at whatsapptan son vs gibi seceneklerin her sayfada kolayca görünür olması lazım, hem bilgisayar hem de telefondan tabletten girişlerde”


## 31 Ekim 2026 güncel karar — DeepL çevirilerinin yayını

UBT kabulü: Ana dildeki içerik yayınlandığında DeepL API ile hazırlanan çeviriler ayrıca dil onayı beklemeden yayınlanır. UBT çeviri kontrolü üstlenmez; müşteri fark ettiği hataları yönetim panelinden düzeltebilir. Bu karar, belgenin önceki bölümlerindeki dil başına yayın öncesi onay zorunluluğunun ve E11 kapsamındaki onaysız çeviriyi engelleme beklentisinin yerine geçer. Çeviri üretiminin ve yayın akışının bu kuralla çalışması, müşterinin panelden metin düzeltebilmesi doğrulanmalıdır. Ana içerik taslakken bu karar tek başına yayın yetkisi vermez. Mevcut yayınlanmış çevirilerin kaynak metin değişikliği sonrası davranışı, ayrıca değiştirilmedikçe önceki kurala tabidir.

## 31 Ekim 2026 güncel karar — Eski içeriğin tamamının aktarılması

UBT açık talimatı: Eski sitedeki içeriğin tamamı alınacak; blog dahil aktarılacak içerik seçilerek daraltılmayacak. Önceki açıklamalardaki hangi eski yazıların aktarılacağının müşteri seçimine bağlı olduğu yorumu geçersizdir. Metinler, yazılar, sayfalar ve ilişkili görseller içerik envanteriyle takip edilerek korunur. Tur anlatımlarının etkinlik kayıtlarıyla eşleştirilmesi içerik kaybına yol açmamalıdır; mevcut SEO/URL eşleştirme kuralları korunur. Aktarımın tamam olması, tüm kayıtların otomatik olarak yayına açılması anlamına gelmez; mevcut taslak ve yayın akışı geçerlidir. İlk görünüm tesliminde bütün kayıtların tek tek aktarılmış olması ön koşulu değişmez; tam içerik aktarımı proje kapsamındadır.

## 31 Ekim 2026 — iyzico / POSNET görüşme özeti

[Ödeme Altyapısı Alternatifleri: iyzico ve Yapı Kredi POSNET](./iyzico-posnet-gorusme-ozeti.md) proje kaynaklarına eklendi. Tam karşılaştırma tablosu, değerlendirmeler, eksik bilgiler ve görüşmede başvurulan kaynaklar bu belgede korunur.

İşletme uzun süredir iyzico kullanıyor ve hizmetten memnun değil; somut memnuniyetsizlik nedenleri henüz verilmedi. Kabul edilen karar sırası: önce işletmeye karşılaştırma tablosu sunulacak, sağlayıcı değişikliği bundan sonra kararlaştırılacak. POSNET'e geçiş onayı yoktur; başvuru veya entegrasyon yapılmamıştır. Mevcut iyzico sözleşmesi ve işletmeye özel yazılı POSNET teklifi olmadan fiyat/üstünlük sonucu çıkarılmaz. Görüşme özeti sağlayıcı özelliklerinin bu dokümantasyon oturumunda yeniden doğrulandığı anlamına gelmez.

Bu ek, önceki ertelenmiş araştırma kaydına karar öncesi karşılaştırma belgesini ekler; kendiliğinden yeni araştırma, başvuru, sağlayıcı seçimi veya entegrasyon başlatmaz. MVP ve sonraki ödeme fazı sınırı korunur. Eksik ticari bilgiler ve entegrasyon uyumu değerlendirme aşamasında tamamlanır.

## 31 Ekim 2026 kabulü — Kaynak metin değişince çevirilerin korunması

Türkçe kaynak metin değiştiğinde mevcut çeviriler ve müşterinin elle yaptığı düzeltmeler korunur; panelde “Çeviri güncellenmeli” uyarısı gösterilir. Müşteri istediğinde panelden DeepL ile yeniden çeviri başlatabilir. Kaynak değişikliği kendiliğinden yeniden çeviri yaparak mevcut metni ezmez. Bu karar, ayrı dil onayı beklemeden yayın kuralıyla birlikte uygulanır; ayrı çeviri onayı süreci yeniden eklenmez. Doğrulamada kaynak değişikliği sonrası mevcut metnin korunması, uyarının görünmesi ve panelden yeniden çevirinin başlatılabilmesi kontrol edilir.

## 31 Ekim 2026 — Yönetim panelinde geliştirici cookbook'u

UBT talimatı: Yönetim panelinde geliştirici için bir cookbook / teknik devir rehberi hazırlanacak. UBT bulunmadığında görevi devralan geliştirici gerekli bilgileri buradan alabilecek. Bu rehber, müşteriye yönelik kısa panel kullanım kılavuzundan ayrı bir ihtiyacı karşılar.

Rehber uygulamanın gerçek son durumunu esas alır: sistem yapısı ve kod deposu, geliştirme/çalıştırma, kurulum ve yayın adımları, ortam ayarlarının açıklamaları, servis bağlantıları ve hesapların nereden yönetildiği, içerik/çeviri/talep akışları, bakım, yedekleme ve geri yükleme, yaygın sorunların çözümü ve bilinen eksikler. Henüz kurulmamış servisler hazırmış gibi anlatılmaz; uygulama ilerledikçe bilgiler güncellenir. Şifreler, API anahtarları ve kişisel/sağlık verileri rehbere yazılmaz; gerekli erişimlerin güvenli şekilde nereden temin edileceği açıklanır. Teknik rehbere erişim yetkili yönetici/geliştirici erişimiyle sınırlandırılır; ziyaretçiye açık olmaz. Teslimde rehberin panelden erişilebilirliği ve gerçek kurulumla tutarlılığı kontrol edilir.

## 31 Ekim 2026 — Müşteri revizyon sistemi ve panel kullanım kılavuzu

UBT talimatı: Müşteri yönetim panelinden revizyon isteği açabilecek. Ayrıca panelin nasıl kullanılacağını açıklayan müşteri kullanım kılavuzu panel içinde bulunacak. Bunlar geliştirici cookbook'undan ayrı bölümlerdir. Önceden kabul edilmiş SeaKayak benzeri revizyon ve pratik kullanım kılavuzu gereksinimleri bu kaynakla somutlaştırılır.

Referans: https://github.com/ubterzioglu/dmseakayak . 31 Ekim incelemesinde main dalındaki src/pages/admin/RevisionsPanel.tsx ve src/pages/admin/GuidePanel.tsx okundu. Revizyon panelinde isteyen kişi, açıklama, 1–10 aciliyet, Açık/Devam Ediyor/Tamamlandı durumları, talep altı yorumlar, aktif durum filtreleri ve tamamlananlar bölümü bulunuyor. Bu yapı yeni projenin mevcut rol/yetki ve veri koruma kurallarına uyarlanarak referans alınacak; eski projeye özel kişiler, raporlar ve bağlantılar doğrudan taşınmayacak. Kaynakta bulunması her teknik davranışın değiştirilmeden kopyalanacağı anlamına gelmez.

Kılavuz referansı GuidePanel.tsx ve onun kullandığı src/pages/admin/guide-content.ts dosyasıdır. Kılavuz teknik bilgi gerektirmeyen dilde her panel bölümünün amacı, adım adım kullanımı, ipuçları ve sık karşılaşılan sorunları anlatacak; yeni paneldeki gerçek işlevlere göre güncellenecek. Geliştirici cookbook'u teknik işletim/devir içindir; müşteri rehberi günlük kullanım içindir.

Teslim kontrolü: müşteri yetkisiyle revizyon oluşturma, kayıtların kalıcılığı, durum/yorum takibi ve yetki sınırları; kullanım kılavuzunun panelden açılması ve gerçek ekranlarla tutarlılığı doğrulanacak. Bu oturumda yalnızca kaynak kod incelendi ve gereksinim kaydedildi; yeni sistem uygulanmadı veya test edilmedi.

## 31 Ekim 2026 — DeepL hata ve kota uyarısı

UBT yanıtı: DeepL çalışmadığında veya kotası dolduğunda yönetim panelinde uyarı gösterilecek; gerekirse DeepL kotası/paketi yenilenecek. Mevcut kota uyarıları korunur. Bu yanıt otomatik ücretli paket satın alma veya abonelik yükseltme yetkisi değildir. Çevirisi oluşmamış içerik tamamlanmış gibi gösterilmez. UBT bu yanıtta Türkçe içeriğin çeviri beklerken otomatik yayınlanması konusunda ayrıca karar vermedi; yanıt bu yönde genişletilmez.

## 31 Ekim 2026 kabulü — Revizyon e-posta bildirimleri

Müşteri yeni revizyon isteği açtığında UBT'ye e-posta bildirimi gönderilir. İstek çözülüp Tamamlandı durumuna getirildiğinde müşteriye çözülme bildirimi e-postası gönderilir. Bildirim doğru revizyon kaydıyla ilişkilendirilir. Gerçek alıcı adresleri kurulumda belirlenir; adres uydurulmaz. Bildirim hatası revizyon kaydını veya tamamlanma bilgisini silmez. Doğrulamada yeni istek → UBT bildirimi ve Tamamlandı → müşteri bildirimi akışları, doğru alıcı ve kayıt eşleşmesi kontrol edilir; gerçek teslim testi yapılmadan başarılı gönderim iddia edilmez.

## 31 Ekim 2026 kabulü — Tamamlanan revizyonun yeniden açılması

Müşteri, Tamamlandı durumundaki revizyonda sorunun devam ettiğini görürse aynı isteği yeniden Açık durumuna getirebilir. Yeni ve kopuk bir istek oluşturulmaz; önceki açıklamalar ve yorumlar aynı revizyon kaydında korunur. Mevcut erişim yetkileri uygulanır. Doğrulamada müşterinin tamamlanmış isteği yeniden açabilmesi ve önceki yazışmaların korunması kontrol edilir.

## 31 Ekim 2026 kabulü — Revizyon ekran görüntüleri

Müşteri revizyon isteğine veya bu isteğin altındaki yorumuna ekran görüntüsü ekleyebilir. Görseller ilgili istek/yorum kaydına bağlanır ve yalnızca o revizyona erişim yetkisi olan panel kullanıcılarına açılır. Yüklemede dosya türü ve boyutu sunucu tarafında doğrulanır; teknik sınırları uygulayıcı belirler. Bu karar genel amaçlı dosya paylaşım sistemi kapsamı eklemez. Doğrulamada isteğe ve yoruma ekran görüntüsü ekleme, doğru kayıtla eşleşme ve yetkisiz erişimin engellenmesi kontrol edilir.

## 31 Ekim 2026 kabulü — Revizyon yorum bildirimleri

UBT revizyon isteğine yorum yazdığında müşteriye, müşteri yanıt/yorum yazdığında UBT'ye e-posta bildirimi gönderilir. Bildirim ilgili revizyonla eşleşir; yorum yazanın kendisine aynı yorum için bildirim gönderilmez. Önceden kabul edilmiş yeni istek ve tamamlanma bildirimleri korunur. E-posta hatası yorum kaydını silmez. Doğrulamada iki yöndeki yorum bildirimleri ve doğru alıcı/kayıt eşleşmesi kontrol edilir.

## 31 Ekim 2026 kabulü — Müşteri ekibinde ortak revizyon görünürlüğü

Müşteri ekibinde revizyon erişimi olan yetkili kişiler birbirlerinin açtığı revizyonları görebilir ve yorum yapabilir. Bu erişim yalnızca isteği açan kişiyle sınırlandırılmaz. Mevcut rol/yetki sınırları korunur; karar tüm panel kullanıcılarına veya ziyaretçilere revizyon erişimi vermez. Doğrulamada iki yetkili müşteri hesabıyla ortak görünürlük ve yorum, yetkisiz hesapla erişimin reddi kontrol edilir.

## 31 Ekim 2026 kabulü — Google ile giriş, Supabase ve yönetici erişimi

UBT kararı: Yönetim panelinde Google ile giriş (Google Auth) ve arka planda Supabase kullanılacak. Ana Yönetici panelden yönetici/personel erişimi ekleyip kaldırabilecek; mevcut rol ve kişiye özel yetki modeli korunacak. Google hesabıyla giriş yapmak tek başına panel yetkisi vermez; yalnızca yetkilendirilmiş hesaplar erişebilir. Erişimi kaldırılan kişinin mevcut oturumu üzerinden de korunan işlemleri sürdürememesi sağlanır. Erişim kaldırma, kişinin önceki revizyonlarını, yorumlarını veya işlem kayıtlarını silmez. Yetkiler sunucu/veri katmanında uygulanır. Önceki tüm panel kullanıcılarında 2FA gereksinimi kaldırılmadı; Google ile girişin tek başına bu gereksinimi karşıladığı varsayılmaz. Gerçek servis yapılandırması ve erişimler uygulama aşamasında tamamlanır.

Doğrulama: yetkili hesap ekleme ve Google ile giriş, yetkisiz Google hesabının reddi, rol sınırları, erişim kaldırıldıktan sonra mevcut oturumdan veri/işlem erişiminin reddi ve geçmiş kayıtların korunması. Bu kayıt teknoloji/iş kuralı kararıdır; servis kurulumu veya çalışan entegrasyon değildir.

## 31 Ekim 2026 kabulü — Revizyon bildirimlerinin ekip alıcıları

UBT yanıtı: Revizyon e-posta bildirimleri herkese gidebilir. Bu bağlamda alıcılar, revizyon erişimi olan aktif müşteri ekibi hesapları ve UBT'dir; ziyaretçiler veya revizyon yetkisi olmayan panel hesapları dahil değildir. Yeni revizyon, yorum ve Tamamlandı bildirimleri yalnızca isteği açan veya yorum yapan müşteriyle sınırlandırılmaz. Önceki dar alıcı tariflerinin yerine bu ortak ekip alıcı kuralı geçer; yorumu yazanın kendi yorumuna bildirim almaması kuralı korunur. Erişimi kaldırılan hesaplar sonraki bildirimlere dahil edilmez. Alıcı listesi ve kayıt eşleşmesi bildirim testlerinde doğrulanır.

## 31 Ekim 2026 kabulü — Konaklama talebinde oda sayısı

Konaklama talep formunda ziyaretçinin istediği oda sayısını belirtebileceği alan bulunur ve değer talep kaydında saklanır. Bu alan otomatik oda tahsisi veya müsaitlik onayı oluşturmaz. Oda tipi ve diğer konaklama tercihleri mevcut isteğe bağlı not alanında belirtilebilir. Doğrulamada oda sayısının pozitif tam sayı olması ve talep kaydında korunması kontrol edilir.

## 31 Ekim 2026 kabulü — Ulaşımda çocuk koltuğu talebi

Ulaşım talebinde ziyaretçi gerektiğinde çocuk koltuğu isteğini ve ilgili çocuğun yaşını belirtebilir. Birden fazla çocuk için koltuk isteniyorsa ilgili yaşlar da belirtilebilir. Bu bilgiler ulaşım talebinde korunur. Araç ve çocuk koltuğu uygunluğu ekip tarafından sonradan teyit edilir; form koltuk temin garantisi veya otomatik uygunluk onayı vermez. Doğrulamada bu bilgilerin doğru ulaşım talebine kaydedildiği kontrol edilir.

## 31 Ekim 2026 kabulü — Ulaşım ve konaklama alındı e-postaları

Ulaşım veya konaklama talebi başarıyla kalıcı kaydedildiğinde talep sahibine alındı e-postası gönderilir. Mesaj, talebin alındığını ve ekibin iletişime geçeceğini belirtir; kesin rezervasyon, müsaitlik veya ödeme onayı vermez. İki hizmetin ayrı form ve ayrı talep olması kuralı korunur; e-posta doğru hizmet ve talep kaydıyla eşleşir. Etkinlik alındı e-postaları için kabul edilmiş Zoho gönderim yaklaşımı ve mevcut dil kuralları uygulanır. İşletme bildirimi korunur. E-posta hatası talebi silmez; kaydolmamış talep için alındı e-postası gönderilmez. Gerçek teslim ve kayıt eşleşmesi uygulama aşamasında doğrulanır.

## 31 Ekim 2026 — Mevcut servis envanteri ve geçiş incelemesi

[Servis envanteri ve geçiş kontrolü](./Dragoman_Servis_Envanteri_Gecis.md) kullanıcı tarafından verilen Flywheel, DigitalOcean, Namecheap, Cloudflare, Mailchimp, Cobaltapps, CodeCanyon ve Insync bilgilerini içerir. Claude Code, geliştirme/aktarım sırasında gerçek görevleri ve bağlantıları inceleyerek hangi servislerin güncelleneceğini UBT ile ele alacak; DNS/hosting/SSL, e-posta kayıtları, eski WordPress bağımlılıkları ve geri dönüş planını birlikte değerlendirecek. Henüz hesap erişimi, servis değişikliği veya kapatma yapılmadı. Teknik cookbook güncel envantere bağlanacak. Servislerin tümünün taşınacağı, kapatılacağı veya değiştirilmesi gerektiği varsayılmaz.



