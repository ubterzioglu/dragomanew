# Dragoman — Layout ve veri ilişkileri taslağı

**Tarih:** 31 Ekim 2026
**Durum:** Kabul edilmiş kararların uygulayıcı için özeti. SQL şeması, çalışan uygulama veya test sonucu değildir. Kapsam ve ayrıntılı iş kuralları için [Brief V6](./Dragoman_Proje_Brief_V6.md) esas alınır; yeni sürüm oluşturulmadı.


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


## 1. Uygulama sınırı

Tablo/alan adları, teknik ilişkiler ve bileşen ayrıntılarını Claude Code belirler. Aşağıdaki iş ilişkileri korunur. Kullanıcı sade çözüm istiyor; etkinlik kopyalama özelliğini gereksiz bulup reddetti. Yeni kolaylık özellikleri veya mikro tasarım soruları eklenmez. Önce dolu ziyaretçi şablonları, UBT değerlendirmesi, ardından panel ve çalışan bağlantılar sırası korunur. Ödeme araştırması ertelenmiş kalır.

## 2. Layout ile veri karşılığı

| Ziyaretçi/panel alanı | Veri ilişkisi ve davranış |
| --- | --- |
| Ana sayfa | Beş kategori; üç fotoğraflı Dalış/Deniz Kanosu/Outdoor açılışı ve V6 bölüm sırası. Öne çıkanlar ilgili içerik kayıtlarına bağlanır. |
| Kategori sayfası | Kategori → alt gruplar → etkinlik kartları. Alt grupların ve gruplar içindeki kartların sırası panelden elle yönetilir. |
| Etkinlik detayı | Her etkinlik ayrı kayıt; Dalış, Deniz Kanosu ve Outdoor ortak detay şablonunu kullanır. İçerik ve isteğe bağlı bölümler ilgili etkinliğe aittir; boş bölümler gösterilmez. |
| Fotoğraflar | Etkinlik ile medya bağlantıları; aynı görselin farklı içeriklerde kullanılmasına mevcut medya kuralları izin verir. |
| SSS | Etkinliğe bağlı soru/yanıtlar; sade düzenleme ve mevcut dil onayı kuralları. |
| Gün gün program | Etkinliğe bağlı sıralı gün başlığı/açıklaması kayıtları. Program yoksa bölüm görünmez. |
| Seçenekler | Etkinlik → seçenekler; yemekli/yemeksiz veya ekipmanlı/ekipmansız tek etkinlik sayfasında gösterilir. |
| Talep formu | Talep → tek etkinlik; talep → seçilen seçenek satırları ve kişi adetleri. |
| Panel | İçerik yönetimi, sıralama, yayın ve arşiv; mevcut rol/2FA ve dil onayları uygulanır. |

Dalış ve Outdoor ayrı aktivite kayıtlarıdır; bir kaydı iki ana kategoride ortak kullanma önerisi kabul edilmedi. Aynı adlı turlar farklı kategorilerde farklı hizmetler olabilir: Outdoor Kekova Classic tekne turu ile Deniz Kanosu Kekova Klasik aynı kayıt değildir. Her kaydın ayrı kimliği ve çakışmayan sayfa adresi olur; kesin URL düzenini uygulayıcı mevcut SEO kurallarıyla belirler.

Dalış alt gruplarının önceki konuşmadaki yeniden gruplama tablosu öneriydi; bütün etiketler kesinleşmiş gibi dayatılmaz. Mevcut sayfa grupları ve yerel envanter başlangıç kaynağıdır. Alt gruplar düzenlenebilir hazırlanır; nihai içerik listesi şablon geliştirmeyi bekletmez. Ortak şablon, bütün isteğe bağlı alanların her etkinlikte doldurulması zorunluluğu değildir. Mağaza ve Ulaşım/Konaklama ortak Etkinlik yapısına zorla dahil edilmez.

## 3. İçerik kaynakları

- Dalış: https://dragoman-turkey.com/diving/ ve yerel çıkarılmış kaynaklar.
- Outdoor: https://dragoman-turkey.com/outdoor-activities/ ve yerel çıkarılmış kaynaklar. Çok aktiviteli turlar, yürüyüş, bisiklet, coasteering, tekne, kültür ve özel turlar mevcut kaynak gruplarıdır.
- Deniz Kanosu: https://dragomanseakayak.com/tr/ ve ilgili detay sayfaları önceliklidir. Eski Sea Kayak sayfasıyla çelişirse yeni kaynak esas alınır; aynı tur iki kez oluşturulmaz.

Deniz Kanosu başlangıç envanteri:

| Grup | Etkinlikler |
| --- | --- |
| Günlük | Kekova Klasik; Kekova Batı; Kekova Doğu |
| Çok günlük | Kekova Körfezi (2 gün/1 gece); Işık Kıyısı (4 gün/3 gece); Kekova Deniz Kayağı & Gulet (7 gün/6 gece); Likya Kayak & Konfor Kaçamağı (7 gün/6 gece); Karia Kıyısı (7 gün/6 gece) |
| Ayrı deneyim | TRAK Signature Deneyimi |

Özel/kişiye özel program kaynakları hazır yeni Outdoor etkinlikleri uydurmak için kullanılmaz. Kaynak seçimi metin/fiyatların otomatik yayın onayı değildir. Nihai bilgiler ve dört dil onayı yayın aşamasında tamamlanır.

## 4. Fiyat, seçenek ve talep ilişkisi

1. Seçeneklerin kendi kimlikleri vardır ve tek etkinliğe bağlıdır. Seçenekler için ayrı etkinlik sayfaları açılmaz.
2. Seçenekli grup talebinde her seçeneğe kişi sayısı verilir. Adetler negatif olmayan tam sayıdır ve toplamları talebin kişi sayısına eşittir. İlk talepte bu dağılım için katılımcı isimleri istenmez.
3. Seçenekler karşılaştırılabilir fiyat temeline sahipse kategori kartı en düşük sunulan fiyatı “...’dan başlayan” biçiminde gösterir; detay bütün seçenekleri gösterir. Kart tutarı seçeneklerden türetilir.
4. Panelde “Fiyat talep üzerine” seçilebilir. Kart ve detay bu ifadeyi gösterir; talep aynı formdan alınır. Boş fiyat ücretsiz değildir; bu biçimde toplam hesaplanmaz.
5. Sayısal, kişi başına fiyat örneğinde 2 × 60 EUR + 2 × 45 EUR = 210 EUR özeti gösterilir. Kesin fiyatın Dragoman teyidi gerektirdiği belirtilir. Kişi/paket temelleri veya para birimleri doğrudan karıştırılmaz.
6. Talep fiyatı sunucuda doğrulanır. Talep satırı kullanılan seçenek kimliğini, talep anındaki ad/fiyat/para birimi ve adedi, talep de hesaplanan özeti korur. Fiyatın sonradan değişmesi eski talebi değiştirmez.
7. Her talep tek etkinlik içindir. Ayrı dalış ve kano iki taleptir. Hazır çok aktiviteli paket tek etkinlik kaydı üzerinden tek taleptir; içerdiği aktiviteler otomatik ek talepler üretmez.

V6 içindeki EUR ana fiyat, TL karşılığı, kişi/grup/kademeli ve sezonluk fiyat, ek hizmet ve ödeme fazı kuralları bu özetle kaldırılmaz. Seçenek örnekleri bütün fiyatları kişi başına indirgemez. Güncel kapsamta desteklenmeyen veya henüz gerçek değeri olmayan fiyat kuralı için tutar uydurulmaz. Talep fiyat özeti ödeme oturumu değildir.

## 5. Katılımcılar ve formlar

Talep ile katılımcılar, katılımcı ile kendi form yanıtları ilişkilidir. İlk talepte yalnızca mevcut kısa alanlar ve ilgili seçenek dağılımı vardır. Etkinlik/tarih teyidi sırasında Dragoman diğer katılımcıların ad-soyad ve e-postalarını alıp talebe ekler; her kişiye kendi güvenli bağlantısı gider.

Etkinlikte kullanılacak form seçilir. Dalış ve Outdoor aynı başlangıç içeriğine sahip, ayrı kimlikli iki form tanımıdır; içerik ve sürümleri bağımsızdır. Ayrı tablo zorunlu değildir. Yanıt kullanılan form kimliği ve sürümünü korur. Ortak etkinlik şablonu bu iki formu birleştirmez. Sağlık verisinin erişim sınırları, korumalı geçmişi ve kâğıt imza kuralları [sağlık gereksinimleri](./Dragoman_Saglik_Formu_Gereksinimleri.md) içindedir. Bu form kapsamı Deniz Kanosu için kendiliğinden genişletilmez. Son önerilmiş 45 yaş koşullu gösterimi kabul edilmiş karar değildir.

## 6. Dil, yayın ve geçmişin korunması

İçerik kimliği ile TR/EN/FR/DE dil sürümleri ilişkilidir; her dilin onayı ve mevcut çeviri güncelleme davranışı korunur. Medya, seçenek metinleri, SSS ve gün programı mevcut dil kurallarına uyar. İçerik sıralaması diller arasında ortaktır; her dil yalnızca uygun onaylı içeriklerini gösterir.

Arşivlenen etkinlik ziyaretçi listeleri ve öne çıkanlardan kalkar; yeni talep kabul etmez. İçerik, seçenek ve geçmiş talepler korunur. Yetkili kişi mevcut yayın koşullarıyla yeniden yayına alabilir. Eski URL davranışı V6 SEO kurallarına göre uygulanır; arşivleme fiziksel silme veya ilgisiz ana sayfa yönlendirmesi değildir.

Talep takip durumları Bekliyor/İşleme Alındı olarak kalır. İçerik yayın/arşiv durumu, sağlık incelemesi ve ileride ödeme/rezervasyon onayı ayrı kavramlardır. Personel rolleri, sorumlu ataması ve bildirim ilişkileri V6 Bölüm 8 kapsamındadır.

## 7. Uygulayıcının doğrulayacağı sonuçlar

[Uygulama rehberindeki](./Dragoman_Claude_Code_Uygulama_Rehberi.md) E01–E17 senaryoları ve ek kontroller geçerlidir. Özellikle kayıtların bağımsızlığı, etkinlik/seçenek eşleşmesi, kişi toplamı, fiyat özeti, dil onayı, arşivleme ve eski taleplerin korunması sınanır. Şablon aşamasında görünüm ve örnek gezinme; panel aşamasında kalıcılık ve yetki sınırları doğrulanır. Bu belge hazırlanırken uygulama veya E2E testleri çalıştırılmadı.
## 8. Ulaşım ve konaklama talep alanları — 31 Ekim 2026 kabulü

UBT aşağıdaki başlangıç alanlarını kabul etti. Gerektikçe sonradan düzenlenebilir; doğrudan satış, ödeme veya müsaitlik onayı eklemez. Bu kayıt, V6 içindeki nihai alanların daha sonra UBT tarafından düzenleneceği açıklamasını başlangıç alanları bakımından somutlaştırır.

- **Ulaşım:** Tek yön/gidiş-dönüş, nereden → nereye, tarih ve saat, kişi sayısı, ad-soyad ve e-posta; telefon ve not isteğe bağlı. Uçuş numarası gibi ayrıntılar ekip tarafından sonraki iletişimde alınabilir. İlk önerideki zorunluluk ayrımı korunur.
- **Konaklama:** Giriş–çıkış tarihleri, yetişkin ve çocuk sayısı, ad-soyad ve e-posta zorunlu; telefon ve konaklama tercihini anlatan not isteğe bağlı.

Bu alanlar dokümantasyon kararıdır; çalışan form oluşturulmadı.

**Ayrı hizmet talepleri — 31 Ekim 2026, UBT kabulü:** Ulaşım ve konaklama ayrı formlardan gönderilir ve ayrı talep kayıtları olarak takip edilir. İki hizmeti birlikte seçtiren birleşik form veya tek talep kaydı kullanılmaz; organizasyonların karışmaması amaçlanır. Her iki hizmeti isteyen ziyaretçi iki ayrı talep gönderir.

**Konaklamada çocuk yaşları — 31 Ekim 2026, UBT kabulü:** Çocuk sayısı sıfırdan büyükse her çocuk için yaş bilgisi sorulur ve konaklama talebinde korunur. Çocuk yoksa yaş alanları gösterilmez. Bilgi, ekibin uygun konaklama ve fiyat teklifini hazırlaması içindir; otomatik fiyat veya müsaitlik onayı üretmez.

**Gidiş-dönüş ulaşım — 31 Ekim 2026, UBT kabulü:** Gidiş-dönüş seçildiğinde dönüş tarihi ve saati için ayrı alanlar açılır. İki yönün bilgileri aynı ulaşım talebinde saklanır. Tek yön seçiminde dönüş alanları gösterilmez.

## 9. Çeviri işleyişi — 31 Ekim 2026, yeni soru turu

UBT açıklaması: Çeviriler DeepL API ile yapılacak; UBT çeviri kontrolü üstlenmeyecek. Müşteri fark ettiği metin sorunlarını yönetim panelinden düzeltebilecek. Bu açıklama tek başına otomatik yayın veya dil bazında yayın öncesi onayın kaldırılması kararı olarak yorumlanmaz; bu nokta takip sorusunda netleştirilecek.

## 31 Ekim 2026 güncel karar — DeepL çevirilerinin yayını

UBT kabulü: Ana dildeki içerik yayınlandığında DeepL API ile hazırlanan çeviriler ayrıca dil onayı beklemeden yayınlanır. UBT çeviri kontrolü üstlenmez; müşteri fark ettiği hataları yönetim panelinden düzeltebilir. Bu karar, belgenin önceki bölümlerindeki dil başına yayın öncesi onay zorunluluğunun ve E11 kapsamındaki onaysız çeviriyi engelleme beklentisinin yerine geçer. Çeviri üretiminin ve yayın akışının bu kuralla çalışması, müşterinin panelden metin düzeltebilmesi doğrulanmalıdır. Ana içerik taslakken bu karar tek başına yayın yetkisi vermez. Mevcut yayınlanmış çevirilerin kaynak metin değişikliği sonrası davranışı, ayrıca değiştirilmedikçe önceki kurala tabidir.

## 31 Ekim 2026 güncel karar — Eski içeriğin tamamının aktarılması

UBT açık talimatı: Eski sitedeki içeriğin tamamı alınacak; blog dahil aktarılacak içerik seçilerek daraltılmayacak. Önceki açıklamalardaki hangi eski yazıların aktarılacağının müşteri seçimine bağlı olduğu yorumu geçersizdir. Metinler, yazılar, sayfalar ve ilişkili görseller içerik envanteriyle takip edilerek korunur. Tur anlatımlarının etkinlik kayıtlarıyla eşleştirilmesi içerik kaybına yol açmamalıdır; mevcut SEO/URL eşleştirme kuralları korunur. Aktarımın tamam olması, tüm kayıtların otomatik olarak yayına açılması anlamına gelmez; mevcut taslak ve yayın akışı geçerlidir. İlk görünüm tesliminde bütün kayıtların tek tek aktarılmış olması ön koşulu değişmez; tam içerik aktarımı proje kapsamındadır.

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



