# Dragoman — WordPress içerik analizi ve layout bulguları

**İnceleme tarihi:** 26 Ekim 2026  
**Kaynak:** 25 Ekim 2026 tarihli dragoman-turkey.com WordPress exportu  
**Kapsam:** Yerel XML, iki çıkarılmış içerik klasörü ve arşivler. Canlı siteye HTTP kontrolü veya medya indirme yapılmadı. Bulgular bu exportun durumunu anlatır; sonradan değişmiş canlı siteyi doğrulamaz.

## 1. Sonuç

Yeni sitenin bilgi mimarisini ve sayfa şablonlarını hazırlamak için kullanılabilir bir içerik temeli var. Eski sayfaları aynı uzunluk ve düzenle taşımak yerine, kategori sayfalarından kısa kartlarla ayrı etkinlik detaylarına ilerleyen yapı önerildi. Bu yapı, daha önce kabul edilen üç fotoğraflı ana sayfa açılışını destekler. İnceleme sırasında öneri durumunda olan kategori ve detay şablonlarının temel yerleşimleri sonraki ayrı UBT yanıtlarıyla kabul edildi; güncel kayıt layout karar dosyasındadır.

İki `dragoman-icerik` klasörü dosya bazında birebir aynı. ZIP de aynı içeriği taşıyor. Tek inceleme kopyası `extracted/` altında bırakıldı; diğerleri silinmeden `archive/` içine alındı.

## 2. Doğrulanmış envanter

| Kayıt türü | Adet | Açıklama |
| --- | ---: | --- |
| Sayfa | 49 | Dil sürümleri, sistem sayfaları ve ana sayfa içerikleri dahil |
| Yazı | 25 | Haber/blog yanında ayrıntılı tur içerikleri de var |
| WooCommerce ürün | 11 | Dört kitap/kitap baskısı için dil sayfaları; 11 farklı fiziksel ürün olarak sayılmamalı |
| Tekrar kullanılabilir blok | 3 | Ürün kartı, kategori kapağı ve alt menüyle ilgili bloklar |
| Medya kaydı | 958 | 323 farklı medya adresi; gerçek dosyalar klasörde yok |
| Menü öğesi | 36 | Dil ve hesap/mobil menüleri dahil |
| Contact Form 7 form tanımı | 4 | Genel iletişim ve üç dilde rezervasyon formları |
| Diğer | 54 | CSS, font, global stil, navigasyon ve kupon kayıtları |
| **Toplam XML öğesi** | **1.140** | Tüm kayıt türlerinin toplamı |

İçerik inceleme kümesi: **88 kayıt = 49 sayfa + 25 yazı + 11 ürün + 3 blok.** Bu 88 kaydın çıkarılmış HTML'i kaynak XML ile birebir eşleşiyor.

### URL'ye göre dil dağılımı

| Tür | EN | TR | FR | DE |
| --- | ---: | ---: | ---: | ---: |
| Sayfa | 16 | 17 | 16 | 0 |
| Yazı | 9 | 9 | 7 | 0 |
| Ürün | 4 | 4 | 3 | 0 |
| Blok | 3 | 0 | 0 | 0 |

Dil bilgisi URL'den çıkarıldı; metnin gerçekten o dilde olduğu veya çevirisinin onaylandığı varsayılmadı. Eşleştirmeler WPML veritabanı ilişkisi yerine başlık/URL ve içerik konusu üzerinden editoryal olarak yapıldı. [Çeviri matrisi](./translation-matrix.csv) seçilmiş 27 konu grubunu kapsar; tüm sitenin kesin çeviri ilişkileri dökümü değildir.

## 3. Beş ana kategori ve önerilen içerik ayrımı

| Kategori | Kaynaktaki yapı | Yeni layout için öneri |
| --- | --- | --- |
| Dalış | EN sayfasında yaklaşık 23.500 karakter, 35 başlık; merkez, tekne, dalış seçenekleri ve eğitimler bir arada | Merkez/tekne tanıtımını kısa tut; deneyim ve eğitim seçeneklerini gruplandırıp ayrı detaylara aç |
| Deniz Kanosu | EN sayfasında yaklaşık 9.400 karakter; günlük ve çok günlük turlar | İki anlaşılır grup; tur kartından ilgili detay sayfasına geçiş |
| Doğa Aktiviteleri | EN sayfasında yaklaşık 15.000 karakter; 7 ana etkinlik grubu | Çok aktiviteli turlar, yürüyüş, bisiklet, coasteering, tekne, kültür ve özel turlar için grup başlıkları |
| Ulaşım ve Konaklama | İki konaklama örneği; Dalaman/Antalya transfer bilgileri | Aynı kategori içinde iki net bölüm; güncel seçenekler ve işlem yöntemi müşteri tarafından doğrulanmalı |
| Mağaza | Kaş Dalış Rehberi ve Tropikal Akdeniz'in üç dil baskısı | Ürün kartlarında kitap/baskı dilini site arayüz dilinden ayrı belirt |

**Kano içerikleri:** Kekova Classic, West ve East ile Lycian Kayak & Comfort Escape için EN/TR/FR ayrı yazılar mevcut. Bunlar yalnızca blog girdisi olarak ele alınmamalı; yeni tur detay sayfaları için içerik kaynağıdır. Uzun kategori sayfasındaki aynı turlarla birleştirilirken çift içerik oluşturulmamalı. Diğer kano başlıkları arasında Kekova Sound, Coast of Light ve Karian Shore bulunuyor. Canlı sitenin önbellekli web sonuçlarındaki farklı adlar bu exporta otomatik uygulanmadı.

**Yurtdışı dalış turları:** Maldivler 2026 ve Raja Ampat 2027 için üç dilde içerik, Sharm El Sheikh 2026 için bu exportta yalnızca Türkçe ayrı yazı var. Ana menüye yeni bir üst kategori ekleme kararı alınmadı; Dalış altında veya öne çıkanlar içinde konumlandırma önerisi ayrıca değerlendirilir. 25–31 Ekim 2026 Sharm turu, 1 Aralık hedef yayını için geçmiş tarihli olacaktır; aktif teklif gibi taşınmamalı.

**65 aday satırı:** [Etkinlik adayları](./activity-candidates.csv), başlıklara gömülü eğitim/turlar ile bazı ayrı içerik kaynaklarını listeler. Aynı tur hem kategori başlığında hem yazıda geçebilir; 65 benzersiz veya halen satılan ürün anlamına gelmez. Satışa/yayına alınacak kesin liste için müşteri kararı gerekir.

## 4. Layout bakımından önemli ek bulgular

### Ana sayfaları yanlışlıkla eleme

ID **2**, **335** ve **936** boş başlıklı olsa da EN/TR/FR ana sayfa içeriği taşıyor. TR/FR URL'lerinde `sample-page` geçmesi bunları örnek içerik yapmaz. Üç dilin bölüm yapısı tamamen aynı değil; aynı yeni şablona aktarılmadan önce içerik eşitlemesi gerekir. ID **1**, “Hello world!” ise ayrı bir gerçek örnek yazı adayıdır; yayına taşınmaması önerilir.

### Cankurtarma için müşteri kararı

Türkçe **Cankurtarma** sayfası (ID 865) ve Türkçe ana menüde buna ait öğe var. İçerikte Bronz, Gümüş, Altın eğitimleri ve belge yenileme bölümleri bulunuyor. EN/FR karşılığı bu exportta görünmüyor. UBT, inceleme sonrasında **“Devam ediyor diyelim şimdilik.”** yanıtını verdi. Bu nedenle hizmetin devam ettiği geçici çalışma varsayımıyla planlamada yer ayrılır. Güncel eğitim kapsamı ve menü konumu açık kalır; beş ana kategoriye altıncı kategori ekleme kararı alınmadı.

### Boş gövde her zaman eksik içerik değildir

Dokuz kayıtta metin gövdesi yok: Shop/Checkout/Blog sayfalarının üç dildeki karşılıkları. Bunlar ürün, ödeme veya yazı listesini dinamik olarak gösterebilir. Sepet ve hesap sayfaları da WooCommerce kısa kodları içeriyor. Yeni sitede eski kısa kodlar çalışır bileşen olarak kopyalanamaz; ilgili şablonlar yeniden hazırlanır.

### Formlar mevcut gereksinimi tek başına karşılamıyor

Exportta bir genel iletişim formu ve EN/TR/FR rezervasyon formu tanımı var. Rezervasyon formlarında ad, e-posta, etkinlik seçimi, tur adı ve serbest açıklama alanları bulunuyor. Ayrı tarih/kişi sayısı ve katılımcı/sağlık soruları için yapılandırılmış alanlar bu tanımlarda görülmedi. V4'ün talep ve katılımcı akışları yeni form düzeni gerektiriyor. Form tanımı, çalışan e-posta teslimi veya kayıt saklama kanıtı değildir; gönderilmiş rezervasyon verisi olarak değerlendirilmedi.

### Mağaza stokları belirli değil

11 ürün kaydının tamamında stok yönetimi `no`, durum `instock`, stok miktarı boş. Bu nedenle yeni siteye gerçek stok sayısı çıkarılamıyor. Eski fiyat alanlarında Dalış Rehberi için 30, Akdeniz kitapları için 39 var; bunlar tarihsel ham değerlerdir. Export site para birimi ayarını sağlamadığından bu alanlardan para birimi tek başına doğrulanamaz. Fiyat, baskı/stok ve gönderim koşulları müşteri onayıyla tamamlanır. Dalış Rehberi'nin FR ürün sayfası bu exportta yok; kitabın Fransızca baskısı olup olmadığı buradan çıkarılamaz.

## 5. Medya

- 958 attachment kaydı **323 farklı adrese** karşılık geliyor. Bu, dosya içeriği/hash bakımından 323 benzersiz görsel olduğunun doğrulaması değildir.
- Yerel arşivde gerçek JPG/PNG/video/PDF dosyası yok; WordPress dosya adresleri ve bazı görsel ölçüleri var. Üç fotoğraflı açılış için görüntüler ayrıca edinilip incelenmeli.
- 849 medya kaydında ALT meta alanı boş. Aynı adrese bağlı kayıtlardan en az birinin dolu olması hesaba katıldığında **286 farklı medya adresinde hiçbir dolu ALT meta alanı yok**. Sayfa içindeki `img alt` metinleri bu ölçüme dahil değildir.
- 16 kayıtta boyut metası bulunamadı. Bulunan ölçüler kaynak metadata değerleridir; dosya açılarak doğrulanmadı.
- Üç İngilizce kategori gövdesinden **49 görsel kullanım satırı** çıkarıldı. [Görsel adayları](./hero-media-candidates.csv) ilk teknik inceleme listesidir; bazı satırlar aynı dosyaya veya küçük illüstrasyonlara işaret edebilir. Fotoğraf kalitesi, uygun kırpım ve kullanım hakkı onayı yerine geçmez.

Önerilen sonraki medya işi: 323 adresi tek medya manifestinde toplamak, orijinalleri indirmek, dosya bazında eşleşmeleri/ölçüleri kontrol etmek ve üç etkinlik kategorisi için kısa bir kapak seçkisi hazırlamak. Bu incelemede indirme veya nihai fotoğraf seçimi yapılmadı.

## 6. Bağlantı ve yönlendirme hazırlığı

İçerik gövdelerinde 118 bağlantı kullanımı incelendi:

| Durum | Kullanım adedi |
| --- | ---: |
| Exportta hedef içeriği bulunan site içi bağlantı | 64 |
| İletişim bağlantısı | 15 |
| Harici bağlantı | 26 |
| Eski Flywheel adresi | 4 |
| Hedefi exportta bulunmayan site içi adres | 6 |
| `?page_id=` gibi sorgulu iç bağlantı | 2 |
| Medya bağlantısı | 1 |

Bu sayılar bağlantı kullanımıdır; benzersiz URL adedi değildir. Eksik hedefler **doğrulanmış 404 olarak işaretlenmedi**; dil kökü veya WordPress yönlendirmesi olabilir. İletişim bağlantılarında eski `/en/reservation-and-contact/` ve dil ön eki eksik Türkçe adresler bulunuyor. [Bağlantı listesi](./links.csv) içerik bazında takip sağlar.

[Yönlendirme adayları](./redirect-candidates.csv) 85 sayfa/yazı/ürün kaynak adresini içerir. Yeni URL alanları bilerek boştur. Nihai URL yapısı seçildiğinde korunacak adresler ve 301 karşılıkları tamamlanır; liste şu anda uygulanmış yönlendirme değildir. Yeniden tasarım sırasında `sample-page` ana sayfaları ve QR hedefleri ayrıca izlenmelidir.

36 eski menü öğesi [menü envanterinde](./legacy-menus.csv) bulunur. EN ana menüde verilen beş kategori doğrulanıyor; TR menüde ayrıca Cankurtarma var. Bazı mağaza menü öğelerinin hedef bilgisi exportta boş olduğundan menüyü körlemesine yeniden üretmek uygun değildir. Ana/yardımcı satır yerleşimi halen öneri durumundadır.

## 7. Yayına hazırlık için açık kararlar

1. **Cankurtarma:** Hizmetin devamı şimdilik çalışma varsayımıdır. Sonraki UBT yanıtıyla Dalış altında ayrı Cankurtarma Eğitimleri sayfası kabul edildi; güncel eğitim kapsamı ve koşulları müşteriyle doğrulanmalı.
2. **Aktif envanter:** Eski başlıklardan hangi dalış/eğitim/tur seçenekleri gerçekten sunuluyor? Güncel fiyat, süre, dahil/hariç ve katılım koşulları nedir?
3. **Mağaza:** Dört kitap/baskı için güncel stok ve fiyat; FR arayüzde eksik ürünün gösterimi nasıl olacak?
4. **Görseller:** Orijinal medya erişimi ve kullanım hakları; üç kategori için seçilecek fotoğraflar.
5. **Diller:** Almanca içeriğin hazırlanması ve eksik TR/EN/FR karşılıkların tamamlanması; dil bazında onay.
6. **Layout:** Üst menü, ana sayfanın bölüm sırası, kategori ve etkinlik detay şablonlarının temel yerleşimi sonraki görüşmede kabul edildi. Cankurtarma Eğitimleri, Dalış altında ayrı sayfa olarak kabul edildi. Diğer kesin alt gruplar, görseller, metinler ve nihai müşteri tasarım onayı açık kalır. Güncel karar kaydı: [Layout kararları](../../docs/Dragoman_Layout_Kararlari.md).

Bu rapor yeni ticari, hukuki, içerik veya görsel onay oluşturmaz. V4 ve kabul edilmiş layout kararları korunur; aktarım taslak olarak planlanır.

## 8. Dosyalar ve doğrulama

| Çıktı | Kullanımı |
| --- | --- |
| [summary.json](./summary.json) | Sayılar, kaynak özeti ve doğrulama sonucu |
| [content-inventory.csv](./content-inventory.csv) | 88 içeriğin türü, URL dili, uzunluğu, bileşen sayıları ve kontrol işaretleri |
| [page-sections.csv](./page-sections.csv) | Sayfa/yazı içindeki başlıklar ve kaynak sıraları |
| [activity-candidates.csv](./activity-candidates.csv) | Ayrı etkinlik detaylarına dönüştürülebilecek adaylar |
| [translation-matrix.csv](./translation-matrix.csv) | Seçilmiş konu gruplarının dil eşleşmeleri |
| [products.csv](./products.csv) | Tarihsel ürün alanları ve stok eksikleri |
| [media-inventory.csv](./media-inventory.csv) | 958 medya kaydı ve metadata ölçüleri |
| [duplicate-media.csv](./duplicate-media.csv) | Aynı medya adresini paylaşan kayıtlar |
| [hero-media-candidates.csv](./hero-media-candidates.csv) | Kategori içi görsel kaynaklarının teknik aday listesi |
| [legacy-menus.csv](./legacy-menus.csv) | 36 eski menü öğesi |
| [links.csv](./links.csv) | Gövde bağlantıları ve yerel hedef sınıflandırması |
| [redirect-candidates.csv](./redirect-candidates.csv) | Yeni URL kararı bekleyen kaynak adresler |
| [organization-manifest.json](./organization-manifest.json) | 200 kaynak dosyanın eski/yeni konumu ve SHA-256 değeri |

Doğrulama: **200 kaynak dosyada taşıma sonrası hash farkı yok; iki klasör ve ZIP birebir aynı; 88 çıkarılmış HTML kaynak XML ile aynı; içerik ID kümeleri eşleşiyor.** Görsellerin indirilmesi, canlı HTTP kontrolleri ve yeni site uygulama testleri bu incelemenin kapsamına dahil edilmedi.
