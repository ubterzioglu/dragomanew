# Dragoman web sitesi yenileme projesi — Brief V5

**Tarih:** 26 Ekim 2026  
**Hedef MVP yayını:** 1 Aralık 2026  
**Geliştirici ve teknik işletim:** UBT (Umut Barış Terzioğlu)  
**İşletme ve nihai yayın kararı:** Dragoman; müşteri ve Murat Draman  
**Belge durumu:** Güncel çalışma briefi ve karar kaydı; dokümantasyon devam ediyor. Bir özelliğin burada yer alması, geliştirildiği, testten geçtiği veya müşteri tarafından yayına onaylandığı anlamına gelmez. V4 önceki sürüm olarak korunmuştur.

## 1. Amaç, kaynaklar ve karar dili

Dragoman'ın mevcut WordPress sitesi yeniden hazırlanacak. Site Kaş ve Kekova çevresindeki dalış, deniz kanosu, doğa ve kültür etkinliklerini açık biçimde tanıtacak; ziyaretçilerin doğru ürüne ulaşmasını, iletişim kurmasını ve uygun ürünlerde rezervasyon talebi veya satın alma başlatmasını sağlayacak. İçerik kısa bir özetle başlayacak, ayrıntı isteyenler ilerleyebilecek. Telefon, tablet ve masaüstü kullanımı birlikte tasarlanacak.

Bu belge, müşterinin ilk 50 yanıtını içeren [önceki brief](./Dragoman_Proje_Brief.md), yüklenen `Dragoman_Proje_Brief_V2(1).md` temelinin bu çalışma alanına aktarılmış V3 taslağı ve [paylaşılan BRIEF EXTENTIONS görüşmesindeki](https://chatgpt.com/share/6adf227e-9bb4-83eb-a1fb-50be0e08fe31) kararlar birleştirilerek hazırlanmıştır. Paylaşılan kayıtta **25/25 detaylandırma yanıtının tamamı** ve bunlardan önceki ayrıntılı geliştirici kararları görülmüştür. Bu görüşmedeki UBT yanıtları geliştirici kararıdır; müşteri adına ticari/hukuki onay olarak yazılmaz.

**Durum terimleri:** **Karar** müşteri briefinde veya UBT review'unda açıkça kabul edilen kuraldır. **MVP** 1 Aralık'ta hedeflenen kapsamdır. **Sonraki faz** ilk yayından sonra ayrıca hazırlanıp etkinleştirilecek iştir. **Açık** müşteri, UBT veya hizmet sağlayıcısından bilgi/onay bekleyen konudur. Teknik tercih ve hukuki uygunluk, ticari kararın yerini almaz.

### 1.1 V5'in kaynakları ve çalışma yöntemi

V5, [V4 kapsam kaydını](./Dragoman_Proje_Brief_V4.md), sonraki [layout kararlarını](./Dragoman_Layout_Kararlari.md), [ödeme karar notunu](./Dragoman_Odeme_Kararlari.md), [WordPress içerik analizini](../cloner/analysis/Dragoman_WordPress_Analizi.md) ve [26 Ekim 2026 SEO/GEO araştırmasını](./Dragoman_SEO_GEO_Arastirma_2026-10-26.md) birleştirir. V4'ten gelen işlevsel gereksinimler ve Ek A'daki ilk 50 müşteri yanıtı korunur. V5'te yeni kararlar ilgili bölümlere işlenmiştir; eski sürümdeki bir ifadeyle çelişirse sonraki açık UBT yanıtı ve V5'in güncel kuralı esas alınır. Tarihsel müşteri yanıtları güncel kuralın yerine geçirilmez.

- **GitHub deposu:** [ubterzioglu/dragomanew](https://github.com/ubterzioglu/dragomanew)
- **Yerel çalışma klasörü:** `C:\temp_private\dragomanew`
- **Çalışma yöntemi:** UBT dokümantasyonu tamamladığında uygulama belgesini Claude Code'a verecek. Bu görüşmenin işi gereksinimleri ve kararları belgelemektir. Görsel taslak veya uygulama geliştirmeye geçiş kararı alınmadı; V5'in kaydedilmesi de dokümantasyonun tamamlandığı anlamına gelmez.
- **Geliştirme sırası:** Önce kabul edilen sayfa türlerinin tekrar kullanılabilir şablonları ve içerik alanları hazırlanacak. Gerçek içerikler daha sonra UBT tarafından, gerektiğinde müşterinin tercihlerine göre doldurulacak. Kesin tur/eğitim/yazı listesi şablon geliştirmeye başlama ön koşulu değildir; içerik ve yayın onayları yayına hazırlık aşamasında tamamlanır.
- **Uygulayıcının sorumluluğu:** Kabul edilmiş kapsam ve yerleşimleri koruyarak görsel/teknik ayrıntıları önerip uygulamak; açık müşteri kararlarını, fiyatları, yasal metinleri veya sağlayıcı seçimini uydurmamak. Geliştirme ve teknik işletim sorumlusu UBT; nihai işletme/yayın kararı Dragoman'dadır.
- **Doğrulanmış başlangıç:** Yeni klasörde WordPress kaynak arşivi ve dokümantasyon incelendi. Yeni site uygulaması, entegrasyon veya canlı geçiş bu çalışmada oluşturulmadı. Eski WordPress içerik kaydındaki `publish` durumu yeni sitede otomatik yayın yetkisi değildir.

## 2. Marka, hedef kitle ve tasarım

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

MVP sayfa grupları: ana sayfa; Dragoman/hakkımızda ve ekip; dalış ve eğitimler; deniz kanosu/Kekova; diğer doğa ve kültür etkinlikleri; yurtdışı dalış turları; kitaplar ve diğer ürünler; blog/haberler; iletişim; gerekli yasal metinler. Beş ana kategori ve temel sayfa şablonları aşağıda kabul edilmiş kararlardır. Kesin alt gruplar, yayına girecek etkinlik listesi ve nihai URL haritası içerik envanterinde tamamlanır. Haberler/öne çıkanlar alanında tur, teklif, duyuru veya blog yazısı panelden seçilebilir. **SSS kesin gereksinimdir**; etkinlik detaylarında ilgili onaylı soru-cevaplar sunulur.

**19/25 kararı:** UBT mevcut WordPress'teki sayfa, blog, ürün ve görselleri topluca aktarır; aktarılan içerikler **taslak** kalır. Dragoman içeriği inceleyip düzeltir ve onayladıklarını yayınlar. EN/FR/DE çeviriler DeepL API ile hazırlanır ve dil bazında ayrıca onaylanır. Mümkün olan görsel ve açıklamalar korunur. Eski adresler korunur veya yeni karşılıklarına 301 yönlendirilir. İlk müşteri briefinin 17–18. sorularındaki içerik seçimi ve metin uzunluğu **müşteriden sonradan gelecek karardır**; UBT'ye devredilmiş sayılmaz. QR kodlu materyaller için yayınlanan hedef URL'ler kararlı tutulur. Google yorumları gösterilecektir; veri kaynağı, kullanım koşulu ve teknik yöntem UBT tarafından doğrulanır.

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
- **Mobil işlem alanı:** Altta sabit WhatsApp ve sayfaya/etkin satış yöntemine uygun Rezervasyon/İletişim alanı bulunur. İçerik ve formlar kapanmaz. Masaüstü üst menüsünün kaydırmada sabit kalması ayrıca kesinleştirilmiş bir karar değildir.
- **Ulaşım ve Konaklama:** Ayrı ana kategori olması kabul edildi; bağımsız satış mı, talep/iletişim mi sunacağı açık kalır.

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

Üstte kategori başlığı, kısa tanıtım ve bir kapak fotoğrafı yer alır. Ardından etkinlikler anlaşılır alt başlıklarla gruplanır ve fotoğraflı kartlarla sunulur. Kartta ad, kısa açıklama, süre, varsa onaylı fiyat ve **İncele** düğmesi bulunur; ayrı etkinlik detay sayfasına geçilir. Masaüstünde kartlar yan yana, mobilde tek sütundur. Kesin masaüstü sütun sayısı belirlenmedi.

Dalış için deneme dalışı/sertifikalı dalışlar/eğitimler; Deniz Kanosu için günlük/çok günlük turlar örnek gruplardır. Doğa Aktiviteleri arşivinde çok aktiviteli turlar, yürüyüş, bisiklet, coasteering, tekne, kültür ve özel turlar bulunuyor. Bunlar kesin yayın/alt menü listesi değildir; güncel ürün envanteriyle doğrulanır. Mağazada kitap kartları; Ulaşım ve Konaklama'da transfer ve konaklama için iki ayrı bölüm kullanılır.

### 4.4 Etkinlik detay sayfası — kabul edildi

Üstte etkinlik adı ve kısa özet bulunur. Masaüstünde sol tarafta fotoğraf galerisi, deneyimin anlatımı, program, dahil/hariç hizmetler, katılım koşulları ve buluşma bilgileri yer alır. Sağda sayfa kaydırılırken görünür kalan bilgi kutusunda varsa onaylı fiyat, süre, temel bilgiler ve **Rezervasyon Talebi** düğmesi bulunur. Düğme ilgili etkinliğin talep formuna götürür.

Mobilde tek sütun ve altta kararlaştırılan sabit WhatsApp ile sayfaya uygun Rezervasyon/İletişim alanı kullanılır. Formu başlatmak, tarih müsaitliğinin onaylanması veya ödeme yapılması anlamına gelmez. Bölüm 5'teki ürün yöntemi ve faz ayrımı korunur; farklı işlem yöntemindeki ürünlere yanlış satın alma/talep vaadi gösterilmez.

### 4.5 Cankurtarma Eğitimleri — yerleşim kabul edildi, hizmet kapsamı geçici

UBT hizmetin devamı için **“Devam ediyor diyelim şimdilik.”** yanıtını verdi. Daha sonra **Dalış menüsünün altında Cankurtarma Eğitimleri adlı ayrı sayfa** olmasını kabul etti. Beş ana kategori korunur; altıncı ana kategori eklenmez.

Eski Türkçe sayfada Bronz, Gümüş, Altın ve belge yenileme bölümleri var; bunlar sayfada gruplanabilir. Hangi eğitimlerin halen sunulduğu, fiyatlar, koşullar ve diğer dillerdeki metinler müşteriyle doğrulanır. Menü konumu kararı, eski eğitim/koşulların yayına kabulü veya nihai ürün listesi değildir.

### 4.6 WordPress export incelemesi ve kaynak dosyalar

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

UBT, bütün bu sayfa türleri için önce **template/şablon** hazırlanacağını, içerikleri daha sonra kendisinin veya müşterinin isteğine göre kendisinin dolduracağını belirtti. Şu aşamada her etkinliğin adını, aktif/arşiv durumunu veya kesin metnini tek tek belirlemek şablon geliştirmeyi bekletmez.

| Şablon grubu | Hazırlanacak yapı |
| --- | --- |
| Ana sayfa | Kabul edilen açılış ve bölüm sırası; panelden seçilecek fotoğraf, başlık, öne çıkan içerik ve diğer alanlar |
| Kategori / liste | Kısa tanıtım, kapak, yönetilebilir alt gruplar ve ilgili içerikten üretilen kartlar |
| Etkinlik / tur / eğitim detayı | Kabul edilen galeri, özet, program, dahil/hariç, koşullar, buluşma, SSS ve uygun talep/iletişim alanları; aynı yapı farklı içeriklerle yeniden kullanılabilir |
| Kitap / ürün | Liste kartı ve ürün detayı; baskı dili, açıklama, görseller, fiyat/stok/teslim alanları ve faza uygun işlem |
| Blog / haber / duyuru | İçerik listesi ve yazı detayı; metin, medya, tarih, ilgili içerik ve SEO alanları |
| Hakkımızda / ekip | Marka anlatısı ve yönetilebilir ekip içerikleri; kesin kişi ve metinler sonradan girilir |
| İletişim / yasal içerik | İletişim bilgileri ve ilgili form/bağlantı yapısı; düzenlenebilir yasal metin sayfaları |
| Ulaşım ve Konaklama | Kabul edilmiş iki bölümün içerik yapısı; işlem yöntemi konusu görüşmenin sonunda ele alınacak, şimdiden seçilmiş sayılmaz |

**İçerik yönetimi:** Başlık, kısa özet, metin, fotoğraf/galeri, kategori, sıralama ve şablona özgü alanlar yetkili kullanıcı tarafından doldurulur. İsteğe bağlı alan veya bölüm boşsa temiz biçimde gizlenir; zorunlu alanlar yayın öncesinde doğrulanır. Uzun/kısa metin ve dört dilde farklı uzunluklar kartları ve sayfa düzenini bozmamalıdır. Bu karar serbest sayfa tasarım editörü veya kapsam dışı yeni içerik türleri talebi değildir; onaylanmış düzeni koruyan tekrar kullanılabilir şablonlar esastır.

**Geliştirme / yayın ayrımı:** Şablonlar açıkça örnek olduğu belirtilen geliştirme verileriyle kontrol edilebilir. Örnek metin, görsel, fiyat veya ürün stoğu gerçek onaylı içerik olarak yayınlanmaz ve indekslenmez. Nihai başlık, ürün listesi, görsel, fiyat ve koşullar için UBT/Dragoman'ın içerik girişi ve mevcut onay akışları geçerlidir. Şablonun hazır olması gerçek ödeme, e-Fatura veya rezervasyon entegrasyonunun tamamlandığı anlamına gelmez.

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

1. Ziyaretçi ürünü, açıklamasını, fiyatını ve varsa koşullarını görür; tercih ettiği tarihi ve kişi sayısını girer.
2. Ürünün satış yöntemi ve fazdaki etkin işlemine göre doğrudan işlem, koşullu form veya iletişim yolu açılır.
3. Katılım formu gereken grup rezervasyonunda **her katılımcı için ayrı** bilgi ve yanıt alınır. Rezervasyonu yapan kişinin formu diğerlerinin yerine geçmez. Her katılımcıya kendi formu için özel güvenli bağlantı gönderilir. Ödeme, formlar tamamlanmadan alınabilir; gerekli form ve onaylar **etkinlik öncesinde** tamamlanır.
4. Ürüne özel sağlık/katılım yanıtlarından insan değerlendirmesi gerektirenler otomatik “uygun” sayılmaz. Çocuk ve veli onayı, formların tamamlanma son tarihi ve formu kimin doldurabileceği ayrıca belirlenir.
5. Tarih seçimi kesin müsaitlik veya onay vaadi değildir. Dragoman tarihi ve gerekiyorsa katılım koşullarını teyit eder; personelin ayrıca müsaitlik takvimi tutması zorunlu değildir.
6. Talep, iletişim bilgileri ve ürün/tarih/katılımcı sayısıyla yetkili ekibe ulaşır; kayıt ve durum işletme tarafından görülebilir.
7. **1/25 geliştirici kararı, ödeme fazı açıldığında:** Ödeme alındığında rezervasyon **Onay Bekliyor** durumunda kalır. Dragoman tarih ve katılım uygunluğunu kontrol edip onayladığında **Onaylandı** olur. Ödeme, tek başına kesin rezervasyon anlamına gelmez. Durum değişiklikleri müşteriye e-postayla bildirilir. Bu ödeme öncesi/sonrası işleyişin ticari ve hukuki koşulları Dragoman tarafından yayın öncesi teyit edilir.

**2/25 geliştirici kararı, ödeme fazı açıldığında:** Dragoman rezervasyonu onaylayamazsa alternatif tarih önerebilir. Müşteri yeni tarihi kabul ederse rezervasyon o tarihe taşınır ve Dragoman onayıyla kesinleşir. Müşteri reddederse iade süreci başlatılır; iade, ödemenin yapıldığı para biriminde yürütülür ve müşteri seçtiği dilde bilgilendirilir. Görüşmede “önceden kararlaştırılmış karma iade sistemi”ne atıf vardır; bu sistemin ayrıntılı kuralı eldeki dökümde bulunmadığından V3'te uydurulmaz ve uygulama öncesi doğrulanır.

Eksik form için katılımcıya etkinlikten **72 ve 24 saat önce** otomatik e-posta gider; Dragoman panelde eksikleri görür. Etkinlik günündeki eksikler işaretlenir ve ekip gerekli form/onayları kontrol ederek katılım durumunu belirler. Katılımcı gönderdiği formu düzenleyebilir; değişiklik Dragoman'a bildirilir ve gerektiğinde yeniden değerlendirilir. Katılımcı değişikliğini rezervasyon sahibi talep eder; Dragoman onayından sonra yeni kişiye form bağlantısı gönderilir. Kişi sayısı veya tarih değişikliği müşteri talebi ve Dragoman onayıyla yapılır; gerekirse ek ödeme/iade veya alternatif tarih uygulanır. Tarih değişikliğinde eski fiyatı koruma veya fark uygulama kararını Dragoman verir.

Üye olmadan satın alma desteklenir. Müşteri e-postasındaki güvenli kişisel bağlantıyla rezervasyonunu yönetir; bağlantı etkinlik tamamlanana kadar geçerlidir. İptal/iade, katılımcı veya iletişim bilgisi değişikliği gibi hassas işlemlerde ek e-posta doğrulaması istenir. Müşteri rezervasyon numarası ve e-postasıyla yeni güvenli bağlantı talep edebilir. Talebin alınması, ödeme, tarih teyidi, uygunluk onayı ve kesin rezervasyon ayrı durumlardır. 1 Aralık MVP'sinde POS hazır değilse ödeme durumları canlı tahsilat akışı olarak sunulmaz; yalnızca rezervasyon talebi alınır.

## 7. Ödeme, iptal/iade ve fatura

Dragoman kredi kartı ve IBAN havalesi ister; mümkünse bazı ürünlerde kapora da düşünülür. **V5 güncel kararı:** Sağlayıcı seçimi açık. Yapı Kredi Sanal POS/POSNET **entegrasyonu kolaysa kullanılabilecek adaydır**; kolaylığı henüz doğrulanmadı. UBT iyzico dışındaki alternatiflerin de araştırılmasını istedi, ardından **“Bunu şimdi yapma ama not al”** diyerek araştırmayı sonraya bıraktı. Araştırma şu anda sürdürülmez; seçilmiş sağlayıcı varmış gibi entegrasyon başlatılmaz. iyzico otomatik yedek kabul edilmez; tamamen elendiği de varsayılmaz. V4'ün “POSNET uygun değilse iyzico” yaklaşımı bu güncel notla değiştirilmiştir. Ayrıntılı kayıt: [Ödeme kararları](./Dragoman_Odeme_Kararlari.md).

Araştırma yeniden açıldığında entegrasyon belgeleri, test ortamı, geliştirme/bakım eforu, komisyon, EUR/TL tahsilat ve hesaba aktarım koşulları, yabancı kartlar, 3D Secure, iade ve mutabakat değerlendirilir. POS sağlayıcısı ve canlı açılış tarihi henüz kesin değildir. Banka/sağlayıcı hesabı Dragoman adına açılır. Kart bilgileri uygulamada saklanmaz; sağlayıcının güvenli akışı kullanılır. Başarı, başarısızlık ve tekrarlanan sağlayıcı bildirimi siparişte tutarlı tek sonuç üretmelidir. EUR/TL hedefi sağlayıcı/işyeri yetkileri doğrulanmadan her kart için koşulsuz destek sözüne dönüştürülmez.

Havale bildirimi tek başına “ödendi” durumu yaratmaz; Dragoman'ın banka teyidi gerekir. Havale bekleme süresi, IBAN gösterimi ve teyit yetkisi müşteri kararıdır. **3–5/25 kararları:** Her etkinlikte tam ödeme, yüzde kapora veya sabit kapora seçilebilir; kalan ödeme zamanı panelden belirlenir. Son tarihten **7 ve 2 gün önce** ödeme bağlantılı e-posta gönderilir, gecikme panelde görünür. Gecikmede Dragoman süreyi uzatır, yeni bağlantı gönderir veya iptal sürecini başlatır. Somut oran/tutar ve uygulanacak ürünler Dragoman ürün cetvelinden gelir.

Müşteri rezervasyon üzerinden iptal talebi açabilir; Dragoman koşulları değerlendirip varsa iade tutarını belirler. İade karma yürür: POS desteklerse panelden başlatılır, desteklemezse Dragoman manuel iadeyi yapıp panelde kaydeder. İade **orijinal ödeme para birimindedir**; tam veya kısmi iadelerin toplamı ödenen tutarı aşamaz. Ana yönetici iade yetkisi ve personel başına EUR limiti verir. Limit rezervasyon başına **toplam iade** üzerinde uygulanır; parçalı iadeyle aşılamaz. TL iadesi yetki limitinde siparişin ödeme anında sabitlenen orijinal kuruyla EUR'ya çevrilir. Hizmet ve kitap için nihai iptal/iade metinleri Dragoman tarafından onaylanır.

Fatura için fatura türü, işletmenin mali süreçleri, gerekli alıcı bilgileri, vergi/para birimi işleyişi, sağlayıcı ve e-Fatura yetkisi Dragoman/mali müşavir tarafından netleştirilir. e-Fatura **sonraki fazdır**; POS ile aynı tarihte hazır olacağı varsayılmaz. Fatura kesimi ve iade/iptal belgeleri için mali/hukuki kararlar UBT'nin tek başına belirleyeceği kurallar değildir. MVP'de kullanıcıya otomatik e-Fatura kesildiği söylenmez.

**Fiyat/KDV ve e-Fatura fazı kararları:** Ürün fiyatı KDV dahil girilir; sistem KDV hariç tutar ve KDV tutarını hesaplar. KDV oranı hazır seçenekten veya gerektiğinde özel oranla ürün bazında tanımlanır. Finansal raporda KDV dahil/hariç/tutar ayrı gösterilir. Uygun e-Fatura/e-Arşiv sağlayıcısı mevcut muhasebe sistemi öğrenildikten sonra seçilir. Ödeme tamamlandığında fatura **yetkili Dragoman personelinin kontrol/onayıyla** oluşturulur; ana yönetici fatura yetkisi verebilir. Satın almada bireysel/kurumsal seçim ve ülkeye göre gerekli alanlar gösterilir. Müşteri fatura oluşmadan bilgileri düzenleyebilir; sonrasında düzeltme talebi açar. Fatura müşteriye e-postayla gönderilir, güvenli rezervasyon sayfasından görüntülenip indirilir. Resmî fatura dili mevzuata uygun, bildirim e-postası müşterinin seçtiği dildedir. E-posta başarısızsa **5, 15 ve 60 dakika** sonra üç deneme yapılır; Bekliyor, Yeniden Deneniyor, Gönderildi, Teslim Edildi, Teslim Edilemedi durumları izlenir ve kalıcı hata Dragoman'a bildirilir. Bu işlevler 23/25 uyarınca sonraki fazda açılır.

## 8. Yönetim paneli, çeviri ve bildirim

Yetkili ekip teknik yardım almadan ürün ekler/düzenler/yayından kaldırır; işlem yöntemi, EUR fiyatı, kitap stoku, kargo bölgesi/ücreti, blog ve öne çıkan içeriği yönetir. Fotoğraf oranları ve yerleşimler panel kullanımıyla bozulmamalıdır. Kısa, pratik yönetim kılavuzu teslim edilir. SeaKayak panelindekine benzer revizyon talebi oluşturma istenir.

**15/25 kararı — roller ve yetkiler:** Ana Yönetici, Rezervasyon Sorumlusu, Muhasebe ve İçerik Editörü gibi hazır roller bulunur; bir personele birden fazla rol atanabilir. Ana yönetici kişiye özel yetkileri ayrıca açıp kapatabilir. Rezervasyon, iade, fatura, rapor, içerik ve çeviri onayı yetkileri ayrıdır. Sınırlar hem arayüzde hem sunucu/veri katmanında uygulanır. Yetki değişikliği ve işlemi yapan kişi kaydedilir. Hangi gerçek personele hangi rolün verileceği Dragoman tarafından listelenir.

**16/25 kararı — panel güvenliği:** Yönetim paneline erişen **tüm personel** için iki aşamalı doğrulama zorunludur. İlk kullanımdan önce TOTP uyumlu doğrulama uygulaması kurulumu tamamlanır; güvenli kurtarma kodları sağlanır. Başarısız girişlerde hız sınırlaması, güvenli oturum yönetimi ve erişim kayıtları uygulanır. 2FA, rol/yetki kontrolünün yerine geçmez. Panel canlıya açılmadan bu güvenlik şartı karşılanır.

Yayın dilleri TR, EN, FR, DE'dir. **19/25 kararına göre DeepL API** ile EN/FR/DE çevirileri hazırlanır; hesap, API erişimi, maliyet, kota ve entegrasyon UBT tarafından doğrulanır. Çeviri yetkili kişi tarafından **dil bazında onaylanmadan yayınlanmaz**. Kaynak metin değiştiğinde ilgili çeviri yeniden gözden geçirme durumuna alınır. Her dilin onaylayıcısı ve abonelik ayrıntıları Dragoman adına netleştirilir. Eksik veya onaysız çeviri ham metin olarak yayınlanmaz.

**Çeviri iş akışı:** Kaynak dil Türkçedir. DeepL **Free API** ürün, tur, kurs, blog, sayfa, e-posta, görsel ALT ve SEO metinlerinde kullanılır. Yeni içerik otomatik çeviri taslağı oluşturur; Türkçe metin güncellendiğinde yeniden çeviri yönetici tarafından başlatılır. Eski onaylı çeviri yayında kalır ve panelde **Güncelleme Gerekli** uyarısı alır; yeni çeviri ayrı taslak ve onay sürecindedir. Yetkili kişi çeviriyi elle düzenleyip onaylayabilir; tekil ve toplu çeviri/onay desteklenir, toplu işler kotaya göre sıraya alınır. Ana yönetici EN, FR ve DE onay yetkilerini ayrı verir. Taslaklar panelde anında görünür; onay bekleyenler için ilgili yetkililere her gün **Türkiye saatiyle 09.00** özet e-posta gider. Üç gün onaysız kalanlar gecikmiş işaretlenir ve ana yönetici bilgilendirilir. Kota **%80**'de erken, **%100**'de kritik uyarı verir. Otomatik e-posta şablonlarının Türkçe kaynağı panelden düzenlenir; her dilin onayı ve yeni sürümünün yayını bağımsızdır.

**17/25 kararı — detaylı audit log:** Rezervasyon, ödeme, iade, fiyat, ürün, içerik, yetki ve çeviri onayı gibi önemli panel işlemleri; işlemi yapan kullanıcı, tarih/saat, işlem türü ve uygun alanlarda önceki/yeni değerle kaydedilir. Ana yönetici kayıtları kullanıcı, tarih aralığı ve işlem türüne göre filtreler; audit log'a yalnızca ana yönetici erişir. Şifreler, kart verileri ve sağlık beyanlarının tam içeriği log'a yazılmaz. 23/25 aşamalı yayın kararı gereği detaylı arayüz ve geçmiş filtreleri sonraki fazda etkinleştirilebilir; MVP'de canlı işlemler için gerekli güvenlik/operasyon kayıtları tutulur.

Her sayfada, her cihazda WhatsApp ve e-posta kolay bulunur. Satış ve rezervasyon bildirimleri `info@dragoman-turkey.com` adresine gider; mevcut kurumsal e-postalar korunur. “İşleme Aldım” işlemi kimin talebi üstlendiğini diğer yetkililere göstermelidir. E-postadan tek tıklamayla işlem yapılacaksa bağlantı yetkilendirmesi ve süresi güvenli biçimde tasarlanır; yetkisiz erişimle kayıt sahiplenilemez. Ayrı “Tamamlandı” düğmesi işletmeye zorunlu iş yükü olarak eklenmez. E-posta teslim edilemezse talep panelde kaybolmamalı; yetkili kişi kayıtları görüntüleyebilmelidir. Gerçek personel/rol atamaları Dragoman tarafından sağlanır.

**Talep ve bildirim kararları:** Rezervasyon, ödeme ve değişiklik bildirimleri `info@dragoman-turkey.com` adresine gider ve panelden izlenir. İlk işleme alan çalışan sorumlu olur; ana yönetici sorumluyu değiştirebilir. Sorumlu, talebi başka yetkiliye doğrudan devredebilir; yeni kişiye e-posta ve panel bildirimi gider, ayrıca kabul adımı gerekmez. Personel yetkisi kapsamındaki tüm talepleri ve **Bana Atananlar** filtresini görür. Talep takibinde yalnızca **Bekliyor** ve **İşleme Alındı** durumları vardır. İşleme alınmayan talep için haftanın her günü 7/24, **iki saatte bir** hatırlatma yapılır; aynı zamandaki talepler tek özet e-postada toplanır. Ana yönetici aralığı değiştirir veya sistemi kapatır. İşlem/etkinlik tamamlandıktan **30 gün** sonra talep aranabilir arşive taşınır; yalnızca ana yönetici yeniden aktifleştirir veya aktif/arşiv kayıtlarını Excel/CSV dışa aktarır. Veri silme/saklama süresi kayıt türü ve yasal yükümlülüğe göre ayrıca belirlenir. Otomatik müşteri bildirimleri seçilen TR/EN/FR/DE dilinde gönderilir.

**14/25 kararı — mobil işlem alanı:** Mobil ekranın altında sabit WhatsApp ve Rezervasyon/İletişim alanı yer alır. Gösterilen ikinci işlem sayfa türüne ve ürünün satış yöntemine göre değişir; ödeme hazır değilse satın alma vaadi gösterilmez. Sabit alan formları, içerikleri veya ödeme düğmelerini kapatmaz. Tablet ve masaüstünde de iletişim ve rezervasyon yolları kolay erişilir.

## 9. SEO, ölçüm ve medya

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

**SEO-08:** Eşdeğer onaylı dil sayfaları kendisini ve karşılıklı diğer sürümleri tam URL'li `hreflang` ile tanımlar. `tr`, `en`, `fr`, `de` dil kodları temel alınır; kanıtlanmamış bölgesel sürümler üretilmez. `x-default` uygun varsayılan/selektör sayfası için tanımlanabilir. Eksik/onaysız Almanca sayfaya etiket verilmez; olmayan karşılık ana sayfaya eşdeğermiş gibi bağlanmaz. `html lang` erişilebilirlik için doğru yazılır; tek başına dil SEO'sunun yerine geçmez. [Google dil sürümleri](https://developers.google.com/search/docs/specialty/international/localized-versions).

### 9.4 İçerik, arama niyeti ve SSS

**SEO-09:** Her onaylı dil sayfasında benzersiz, açıklayıcı `<title>`, kısa meta açıklaması, görünür ana başlık ve anlamlı alt başlıklar bulunur. Panelde bunlar ayrı düzenlenebilir; açıklama/başlık önizlemesi yaklaşık gösterimdir, Google'ın aynısını kullanma taahhüdü değildir. Sabit “60/160 karakter” sınırları yayın engeli yapılmaz. Konu/konum doğal biçimde ifade edilir. [Başlık rehberi](https://developers.google.com/search/docs/appearance/title-link), [snippet rehberi](https://developers.google.com/search/docs/appearance/snippet).

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

**24/25 kararı:** UBT otomatik ve manuel uçtan uca testleri yapar. Dragoman gerçek kullanım senaryolarıyla kullanıcı kabul testini yapar ve **yayın onayını verir**. UBT'nin teknik test başarısı, Dragoman'ın işletme kabulünün yerine geçmez. Aşağıdaki liste MVP kabulünü somutlaştırır; ödeme ve e-Fatura sonraki fazda ayrıca kabul edilir.

| No | MVP kabul senaryosu | Geçme ölçütü |
| --- | --- | --- |
| K1 | Dört dil ve temel sayfalar | Onaylı TR/EN/FR/DE içerik açılır; menü, iç bağlantı, logo ve temel sayfalar telefon/tablet/masaüstünde çalışır; mobil sabit işlem alanı içerik ve formları kapatmaz |
| K1a | Kabul edilen layout | İki satırlı masaüstü menü, mobil açılır menü, üç fotoğraflı açılış ve yedi bölümlük ana sayfa sırası uygulanır; kategori kartları ilgili detaylara, etkinlik talep düğmesi doğru forma gider |
| K1b | Temiz ve yalın kullanım | Ziyaretçi etkinlikleri, temel bilgileri ve talep/iletişim yollarını kolay bulur; farklı metin/dil ve ekran boyutları okunabilirliği bozmaz; görünür kalan bilgi/işlem alanları içeriği kapatmaz |
| K1c | SSS | İlgili etkinliğin onaylı soru-cevapları doğru dilde görünür; açılıp kapanma klavye/dokunmayla kullanılabilir; yanıtlar taranabilir içeriktir; boş veya onaysız içerik yayınlanmaz |
| K1d | Tekrar kullanılabilir şablonlar | Yetkili kullanıcı aynı kategori/etkinlik/yazı/ürün şablonundan farklı içerikler oluşturur; boş isteğe bağlı bölümler gizlenir, zorunlu alanlar yayın öncesi doğrulanır; uzun/kısa ve farklı dilde metinler düzeni bozmaz; örnek veriler canlıya çıkmaz |
| K2 | İletişim | Her sayfadan WhatsApp/e-posta açılır; form gönderimi kayda ve `info@dragoman-turkey.com` bildirimine ulaşır |
| K3 | Ürün ve rezervasyon talebi | Ürün, tarih tercihi ve kişi sayısıyla talep oluşturulur; ziyaretçi kesin rezervasyon/ödeme yapıldığına dair yanlış mesaj almaz |
| K4 | Katılımcı formları | Form gereken üründe her katılımcının ayrı kaydı alınır; eksik ve inceleme gerektiren yanıtlar uygunluk onayı olmadan geçmez |
| K5 | İçerik yönetimi ve erişim | Yetkili kişi ürünü ve işlem yöntemini düzenler; değişiklik doğru sayfada görünür; çoklu rol/özel yetki sunucu tarafında uygulanır; tüm panel kullanıcıları 2FA ile girer |
| K6 | Çeviri onayı | Otomatik çevrilen içerik onay bekler; onaysız metin yayında görünmez; kaynak değişince yeniden inceleme gerekir |
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

## 13. Müşteriye sorulacaklar review sonrası

Aşağıdaki sorular, uygulama veya ticari metin için gereken **açık kararları** toplar. 1–2/25 geliştirici yanıtları ödeme sonrası onay ve alternatif tarih/iade akışını tarif eder; müşteri adına ticari koşul onayı sayılmaz. Yanıtlar alındıkça bu tabloya karar tarihi ve sahibi eklenir.

**Görüşme sırası notu:** UBT, Ulaşım ve Konaklama'nın teklif/talep formu mu yoksa yalnızca WhatsApp/e-posta yönlendirmesi mi kullanacağı konusunun **görüşmenin sonunda** ele alınmasını istedi. Ayrı ana kategori ve iki bölüm kararı korunur; işlem yöntemi açık kalır. Sunulmuş teklif/talep akışı kabul edilmiş sayılmaz. Bu erteleme hizmeti kapsamdan çıkarmak veya otomatik olarak sonraki yayın fazına taşımak değildir. Ödeme sağlayıcısı araştırmasının ayrıca ertelenmesi de geçerlidir.

| Öncelik | Soru / beklenen veri | Karar sahibi |
| --- | --- | --- |
| P0 | UBT'nin ödeme → Onay Bekliyor → Dragoman onayı ve onaylanamazsa alternatif tarih/iade akışını Dragoman ticari koşul olarak kabul ediyor mu? İptal/iade süreleri ve istisnaları nedir? | Dragoman / Draman |
| P0 | 1 Aralık ürün listesi, her ürünün görünür işlem yöntemi ve rezervasyon talebi metni nedir? | Dragoman / Draman |
| P0 | Ürün başına EUR fiyat, kişi/grup/sezon/çocuk/ekstra kuralları ve kitap stokları nedir? | Dragoman |
| P0 | Form soruları, insan inceleme eşikleri, çocuk/veli onayı, eksik form ve sağlık verisinin saklanması nasıl olacak? | Dragoman; hukuki danışmanlık gerektiğinde |
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
| P2 | Üyelik/özel indirim ve ileri otomasyonlardan hangileri sonraki talep olacak? Ulaşım/Konaklama'nın ana kategori olması kabul edildi; bağımsız satış mı, talep/iletişim mi sunacağı ayrıca açık. SSS'nin varlığı kesinleşti; soru-cevap içerikleri onaylanacak. | Dragoman / Draman |
| P2 | Bakım ücreti, servis seviyesi, masraf kalemleri ve yeni özellik onay yolu nasıl kesinleşecek? | Dragoman / UBT |

## 14. Teslim ve karar kayıtları

**Güncel çalışma belgesi V5'tir.** V4 ve daha eski sürümler karar izi için korunur. Bu sürüm, dokümantasyon devam ederken kaydedilmiş birleştirilmiş durumdur; Claude Code'a nihai uygulama devri verildiği veya geliştirme emri başlatıldığı anlamına gelmez. Sonraki açık yanıtlar ayrıca kaydedilerek ilerlenir.

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



