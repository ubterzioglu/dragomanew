# Dragoman — Claude Code için uçtan uca uygulama rehberi

**Tarih:** 29 Ekim 2026  
**Amaç:** Uygulayıcının mevcut kararları tekrar sormadan, kapsamı büyütmeden ve eksik müşteri içeriklerinde durmadan ilerlemesi. Bu rehber geliştirme ve teslim sırasını açıklar; yalnızca E2E test planı değildir. Bu dosyanın hazırlanması geliştirmeyi başlatmaz.


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


## 1. Önce okunacaklar ve karar önceliği

**Güncel oturum bağlamı:** [31 Ekim handover](./Dragoman_Handover_2026-10-31.md). Kapsam için V6 esas alınır.

1. [Brief V6](./Dragoman_Proje_Brief_V6.md): kapsam, kabul edilmiş yerleşimler, dört dil, teknoloji referansı, iş kuralları ve yayın kabul ölçütleri.
2. Bu rehber: karar sınırları, çalışma sırası, senaryolar ve teslim kanıtları.
3. [Sağlık formu gereksinimleri](./Dragoman_Saglik_Formu_Gereksinimleri.md) ve [kaynak PDF](./sources/forms/try-saglik-formu-tr-21.pdf).
4. [WordPress analizi](../cloner/analysis/Dragoman_WordPress_Analizi.md), [SEO/GEO araştırması](./Dragoman_SEO_GEO_Arastirma_2026-10-26.md) ve [ödeme notu](./Dragoman_Odeme_Kararlari.md): ilgili uygulama ayrıntıları.

V5, V4, ilk müşteri yanıtları ve kronolojik devir kayıtları tarihsel kaynaktır. Güncel V6 ile çelişiyorsa eski kararı yeniden uygulama. Bu rehber V6'nın kapsamını daraltmaz veya genişletmez; belirsizlikte önce ilgili güncel bölümü ve kaynakları incele. Yeni kullanıcı talimatı varsa sonraki açık talimat esas alınır.

## 2. Soru sormadan verilebilecek kararlar

| Konu | Uygulanacak yaklaşım |
| --- | --- |
| Görsel ayrıntılar | Logo ve marka karakterini koruyarak font, ton, ölçü, boşluk, görsel kırpımı ve küçük etkileşimleri modern/neat/lean ilkesine göre tutarlı biçimde seç. Her ayrıntı için seçenek listesi veya onay sorusu açma. |
| Mobil yerleşim | Kabul edilmiş menü, üç ana etkinliğin keşfi, tek sütun detay ve sabit işlem alanını koru; kesin ölçüleri ve kırılma noktalarını uygulayıcı belirler. |
| İçerik eksikleri | Önce yerel kaynaklardan uygun içerik al; eksikleri açıkça temsili mockup içerikle tamamla. Nihai tur listesi, fiyat, ekip bilgisi veya metin gelmeden şablonları hazırlayabilirsin. |
| Görsel seçimi | İndirilen gerçek görselleri inceleyip konuyla ilgili olanları seç; kaynak dosyaları koru, kullanım kopyalarını optimize et. Her fotoğraf için ayrı seçim sorusu sorma. Kaynakta karşılığı yoksa temsili görsel kullan. |
| Sayfa ve içerik düzeni | V6 Bölüm 4.8'deki bütün şablon gruplarını oluştur. İçerik girişi sade başlık/metin/fotoğraflar; fiyat, süre, kategori, SSS gibi gerekli işlevsel alanlar ilgili şablonda korunur. Serbest sayfa kurucu ekleme. |
| Form içeriği | İlk etkinlik talebi için kabul edilmiş alanları kullan. Ulaşım ve konaklama için bu rehberdeki güncel ayrı form alanlarını kullan. Katılımcı sağlık formunu ayrı hazırla. İçeriklerin sonradan düzenlenmesini destekle. |
| Dil örnekleri | TR/EN/FR/DE yerleşimini örnek metinlerle kontrol et. DeepL erişimi şablon aşamasını durdurmaz. Ana içerik yayındaysa üretilmiş çeviri için ayrı dil onayı beklenmez. |
| Teknik ayrıntılar | Önce mevcut repo ve yapılandırmayı incele. V6 Bölüm 10.1'deki React/TypeScript/Vite/Tailwind/Supabase referansını dikkate al; dosya düzeni ve bileşen sınırları gibi olağan tercihleri kendin çöz. SEO'nun ilk HTML gereğini sağlayan çözümü açıkla; mimariyi kendiliğinden başka bir stack'e taşıma. |
| Ek özellikler | Ayrı panel önizlemesi, etkinlik filtreleri, gelişmiş form tasarım ürünü veya yeni ticari entegrasyon ekleme. V6'daki sonraki faz işlerini ilk tasarım teslimine çekme. |

## 3. Eksik bilgiyle ilerleme ve soru sorma sınırı

Bir eksik yalnızca belirli bir entegrasyonu veya yayını etkiliyorsa o parçayı işaretle ve bağımsız işleri tamamla. Eksik müşteri içeriklerinin tamamını kullanıcıya yeni bir soru listesi olarak geri gönderme.

| Eksik veya belirsiz konu | Şimdi yapılacak | Gerçek kullanımdan önce gereken |
| --- | --- | --- |
| Nihai fiyat, stok, tarih, içerik ve yasal metin | Yerel kaynak/temsili içerikle sayfa ve alanları hazırla; örnek durumunu belli et. | UBT/Dragoman'ın gerçek bilgi ve içerik onayı. |
| Veritabanı, e-posta, DeepL veya Google servis erişimi | Şablon ve bağlantı arayüzlerini test verileriyle hazırla; hangi erişimin eksik olduğunu kaydet. | Yetkili hesap/ortam bilgileri ve ilgili bağlantının gerçek testleri. Gizli anahtarlar kod veya belgede tutulmaz. |
| Google yorum bağlantısı | İlk şablonda temsili yorum alanı; sonraki aşamada veri yöntemi ve maliyet incelemesi. | Gerçek veri kaynağı ve kullanım koşullarına uygun bağlantı. Sahte yorumları yayına çıkarma. |
| Sağlık formunun kalan içerik kararları | Kaynak soruları Evet/Hayır seçenekleriyle göster; yeni formda hiçbir cevap seçili gelmez. Dalış ve Outdoor için ayrı form kayıtlarını aynı başlangıç içeriğiyle hazırla; etkinlikte form seçimini destekle. Yaşla ilişkili alt madde gösterimini kaydet. İmza yöntemi kesindir: çevrimiçi yanıt, etkinlik öncesinde merkezde kâğıt imza; imza çizme ekleme. | Koşullu alt maddeler ve gerekli veri işleme kararları; Outdoor içeriği sonradan bağımsız farklılaştırılabilir. Otomatik tıbbi uygunluk/ret kuralı icat etme. |
| POS, kur, kapora veya e-Fatura sağlayıcısı | Mevcut faz sınırını koru; canlı tahsilat veya fatura vaadi oluşturma. | Kullanıcı araştırmayı yeniden açtığında sağlayıcı ve ticari koşul kararı. Ödeme araştırması şu anda ertelenmiş durumda. |
| Görsellerin veya kaynak klasörün başka makinede bulunmaması | Önce belgelenmiş yolları ve mevcut çalışma klasörünü kontrol et; bulunan kaynaklarla devam et. | Eksik dosya gerçekten gerekiyorsa yalnızca o dosyanın konumunu iste. |

Gerçekten gerekli soruları gerekçesi ve önerilen çözümüyle birlikte, aynı aşamada toplu ve kısa sor. Özellikle yeni maliyet, kapsam/mimari değişikliği, onaylanmamış sağlık/hukuk kuralı veya canlı yayın gibi kullanıcıya ait kararları kendiliğinden verme. Mevcut açık onayları yeniden sorma. UBT'nin kabul ettiği genel görünüm değerlendirmesi aşamasını atlama; sessizlik onay değildir.

## 4. Kaynaklar ve çalışma yeri

**SEO geçiş planı:** V6 Bölüm 9.2 içindeki 31 Ekim SEO değerini koruyarak geçiş planı uygulanır. Search Console verisiyle önceliklendirme, kategori adreslerinin korunması, yönlendirme süresi, hosting kapatma koşulu ve yayın sonrası izleme E13/E14/E16 kanıtlarıyla teslim edilir.

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

**Sade kapsam ve veri ilişkileri — 31 Ekim 2026:** Etkinlik kopyalama özelliği UBT tarafından gereksiz bulunarak kapsam dışında bırakıldı. Kabul edilen layout/veri ilişkilerinin özeti [Layout ve veri ilişkileri taslağında](./Dragoman_Layout_Veri_Iliskileri.md) toplandı. Bu belge V6 kapsamını değiştirmez; kesin tablo/alan adlarını uygulayıcı belirler. Dalış ve Outdoor ayrı etkinliklerdir; ortak kayıtla iki kategoriye bağlama önerisi kabul edilmedi. Sağlık formunun ayrıntı sorularına geri dönmeden, sade layout/veri yapısıyla ilerlenir.

**Deniz kanosu içerik kaynağı — 31 Ekim 2026, UBT kararı:** Deniz kanosu etkinliklerinin başlangıç envanteri ve içeriklerinde https://dragomanseakayak.com/tr/ ve ilgili tur/deneyim detay sayfaları esas alınır. Eski dragoman-turkey.com/sea-kayak/ sayfasıyla ad, süre, rota veya program çelişirse bu kaynak önceliklidir; aynı turun eski ve yeni anlatımı iki ayrı etkinlik olarak çoğaltılmaz. Kaynak seçimi bütün metin/fiyatların otomatik yayın onayı değildir; mevcut taslak, güncel çeviri ve yayın kabulü kuralları korunur. Deniz Kanosu başlangıç listesi: günlük Kekova Klasik, Kekova Batı, Kekova Doğu; çok günlük Kekova Körfezi (2 gün/1 gece), Işık Kıyısı (4 gün/3 gece), Kekova Deniz Kayağı & Gulet Turu (7 gün/6 gece), Likya Kayak & Konfor Kaçamağı (7 gün/6 gece), Karia Kıyısı (7 gün/6 gece); ayrıca TRAK Signature Deneyimi ayrı deneyim kaydıdır. Özel/kişiye özel tur sayfası programı müşteriye göre hazırlanan teklif hizmeti için kaynak olur; buradaki genel ifadelerden yeni adlandırılmış Outdoor ürünleri uydurulmaz. Outdoor için mevcut ayrı etkinlik envanteri korunur; yeni kaynakta karşılığı bulunmaması silme gerekçesi değildir.

| Kaynak | Doğrulanmış yerel konum |
| --- | --- |
| Dokümantasyon ve yeni çalışma klasörü | `C:\temp_private\dragomanew` |
| Eski içeriklerin çıkarılmış kopyası | `C:\temp_private\dragomanew\cloner\extracted` |
| İçerik/dil/URL/ürün envanterleri | `C:\temp_private\dragomanew\cloner\analysis` |
| Gerçek görseller | `C:\temp_private\dragoman\cloner\images` — 323 dosya |
| Görsel adres/dosya eşleştirmesi | `C:\temp_private\dragoman\cloner\media-download-manifest.json` |
| Sağlık formu PDF'si | `C:\temp_private\dragomanew\claudeguides\sources\forms\try-saglik-formu-tr-21.pdf` |

`dragoman` görsel kaynağı ile `dragomanew` çalışma klasörünü karıştırma. Kaynaklar yereldir; GitHub adresinin bulunması bütün bu dosyaların uzak depoda olduğu anlamına gelmez. Uygulamaya başlarken mevcut dosya/kod durumunu kontrol et; önceki boş repo tespitini süresiz güncel varsayma. Ham exportlar ve kaynak arşivleri için mevcut `.gitignore` kararını koru.

## 5. Aşama A — Dolu ziyaretçi şablonları

**Hedef:** UBT'nin bütün site görünümünü tek değerlendirmede inceleyebilmesi.

- Ana sayfa, beş kategori, etkinlik/tur/eğitim detayı, Dalış altındaki Cankurtarma, kitap/ürün listesi ve detayı, blog listesi ve yazısı, hakkımızda/ekip, iletişim/yasal sayfalar ile Ulaşım/Konaklama bölümlerini hazırla.
- Her şablon grubunu uygun kaynak veya temsili içerikle doldur. Tüm eski içeriklerin aktarılması gerekmez; farklı sayfa türleri ve içerik uzunlukları temsil edilir.
- V6'daki iki satırlı masaüstü menüyü, üç fotoğraflı açılışı ve yedi bölümlük ana sayfa sırasını uygula. Slogan: **Once a Dragoman, always a Dragoman.**
- Etkinlik talebi, Ulaşım/Konaklama talebi ve ayrı katılımcı sağlık formunun örnek görünümünü göster. Bağlantısız formu gerçek kayıt/başarılı e-posta gibi sunma; örnek işlem mesajı açık olsun.
- Mobil, tablet, masaüstü; kısa/uzun içerik; dört dilin yerleşimi; klavye kullanımı; boş isteğe bağlı bölümler ve temel gezinmeyi kontrol et.
- Gerçek müşteri verisi, ödeme veya e-posta gönderimi gerektirmeden incelenebilir ilk teslim hazırla. Örnek içeriklerin kamusal yayını/indekslenmesi yapılmaz.

**Çıkış:** Açılabilen yerel gösterim, nasıl açılacağı, sayfa listesi, kullanılan örnekler, önemli ekran görüntüleri ve kontrollerin gerçek sonuçları. UBT genel görünümü değerlendirir ve toplu düzeltmeleri iletir. Sonraki uygulama aşaması bu değerlendirmeden sonra gelir.

## 6. Aşama B — Yönetim ve çalışan talep akışları

**Müşteri talep alındı e-postası ve Zoho — 31 Ekim 2026, UBT kabulü:** Etkinlik talebi başarıyla kalıcı kayda alındığında rezervasyon sahibinin e-posta adresine talep alındı bildirimi gönderilir. Bu gönderim için Zoho kullanılacaktır. E-postada etkinlik, tercih edilen tarih, kişi sayısı, varsa seçenek/kişi dağılımı ve talep anındaki fiyat özeti bulunur; fiyat talep üzerine ise toplam uydurulmaz. Mesaj talebin alındığını ve kesin rezervasyon için ekibin iletişime geçeceğini açıkça belirtir; rezervasyon, müsaitlik veya ödeme onayı değildir. Bildirim mevcut müşteri dili ve onaylı e-posta şablonu kurallarına uyar; sağlık yanıtları veya diğer katılımcıların özel bağlantıları eklenmez. İşletmenin info@dragoman-turkey.com bildirimi ayrıca korunur. Kaydedilmeyen talep için başarı/alındı e-postası gönderilmez. E-posta gönderim hatası kalıcı talep kaydını silmez ve yeniden talep yaratma nedeni değildir. Zoho hesabı, kullanılacak ürün/gönderim yöntemi ve gerçek servis erişimleri bağlantı aşamasında doğrulanır; bu karar Zoho CRM, yeni müşteri takip sistemi veya ücretli abonelik onayı eklemez.

**Talep başına tek etkinlik — 31 Ekim 2026, UBT kabulü:** Her etkinlik talebi veritabanında tek bir etkinlik kaydıyla ilişkilendirilir. Aynı etkinliğin seçeneklerine göre kişi dağılımı tek talepte tutulabilir; başka bir etkinliğin seçenekleri bu talebe eklenmez. Ayrı dalış ve deniz kanosu etkinlikleri isteyen ziyaretçi iki ayrı talep gönderir. Önceden tanımlanmış çok aktiviteli hazır paket, kendi bağımsız etkinlik kaydı üzerinden tek talep olarak alınır; paketin içerdiği aktiviteler kendiliğinden ayrı talepler oluşturmaz. İlk etkinlik talebi aşamasına çok etkinlikli sepet veya birleşik rezervasyon akışı eklenmez. Bu karar Mağaza veya sonraki ödeme fazının mevcut kapsamını değiştirmez.

**Talep formunda fiyat özeti — 31 Ekim 2026, UBT kabulü:** Sayısal fiyatı bulunan etkinlik seçeneklerinde talep formu seçilen seçeneklerin kişi sayısı ve birim fiyatını satır satır, hesaplanan toplamla birlikte gösterir. Örnek: 2 yemekli × 60 EUR + 2 yemeksiz × 45 EUR = 210 EUR. Özet, talep anındaki hesap olarak etiketlenir; kesin fiyatın Dragoman tarafından teyit edileceği belirtilir. Seçenek adetleri değişince özet güncellenir. Kişi başına fiyatın geçerli olduğu örnekte adet × birim fiyat kullanılır; farklı kişi/paket fiyat temelleri veya para birimleri doğrudan toplanmaz, mevcut onaylı fiyat/kur kuralları uygulanır. “Fiyat talep üzerine” etkinliklerde toplam gösterilmez; eksik fiyat sıfır sayılmaz ve hesaplanamayan toplam uydurulmaz. Sayısal fiyatlar ve hesaplanan özet sunucuda doğrulanır; istemciden gelen tutar doğru kabul edilmez. Talep anındaki seçenek, adet, birim fiyat/para birimi ve hesaplanmış özet korunur; sonraki fiyat değişiklikleri eski talebi değiştirmez. Bu özet tahsilat, kesin fiyat veya rezervasyon onayı değildir.

**Kategori içi elle sıralama — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı kategori sayfasındaki alt grupların sırasını ve her alt grup içindeki etkinlik kartlarının sırasını panelden elle değiştirebilir. Sıralama veritabanında ilgili kategori/alt grup ilişkisiyle kalıcı tutulur ve ziyaretçi sayfasında uygulanır; alfabetik veya eklenme tarihi sırası zorunlu değildir. Aynı sıralama mevcut dört dilde ilgili yayınlanmış içeriklere uygulanır; ayrı dil sıralama ürünü eklenmez. Bir kategori veya alt gruptaki sıralama değişikliği diğerlerini etkilemez. Arşivli veya yayın onayı olmayan içerik sıralama nedeniyle görünür hale gelmez. Panelde sıralama işleminin kesin kontrol biçimini uygulayıcı sade yönetim ilkesiyle belirler.

**Etkinlik arşivleme — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı panelden artık sunulmayan etkinliği arşivleyebilir. Arşivlenen etkinlik ziyaretçi kategori listeleri, kartları ve öne çıkan seçimlerinin yayındaki çıktılarından kaldırılır. İçerik, seçenekler ve mevcut taleplerle ilişkiler veritabanında korunur; arşivleme silme değildir. Arşivlenmiş etkinlik için yeni talep kabul edilmez; eski talepler yetkili panelde kendi kayıtlarıyla okunabilir. Etkinlik tekrar yayına alınabilir; mevcut yetki, güncel çeviri ve yayın koşulları yeniden uygulanır. Eski detay URL adresinin karşılığı, mevcut SEO-02 ve yönlendirme kurallarına göre belirlenir; arşivleme alakasız ana sayfa yönlendirmesi veya mevcut talep verilerinin silinmesi anlamına gelmez.

**Gün gün tur programı — 31 Ekim 2026, UBT kabulü:** Çok günlük etkinliklerde panelden sıralı program maddeleri eklenebilir; her madde gün başlığı ve açıklama içerir (örneğin 1. Gün, 2. Gün). Maddeler ilgili etkinliğe bağlı ayrı kayıtlar olarak tutulur; sıraları korunur ve güncel dört dil ve çeviri kuralları uygulanır. Etkinlik detayındaki ortak şablon bu programı gün sırasıyla gösterir. Günlük turda veya program girilmeyen etkinlikte boş program bölümü ve başlığı gösterilmez. Program düzenlemek yeni sayfa tasarımı veya kod değişikliği gerektirmez; serbest sayfa kurucu kapsamı oluşturmaz.

**Fiyat talep üzerine — 31 Ekim 2026, UBT kabulü:** Panelde etkinlik için “Fiyat talep üzerine” fiyat gösterim biçimi seçilebilir. Bu durumda kategori kartında ve detay sayfasında sayısal tutar yerine ilgili dilde bu ifade gösterilir; boş fiyat sıfır veya ücretsiz olarak yorumlanmaz. Ziyaretçi aynı etkinlik talep formundan tarih ve kişi sayısını, varsa seçeneklere göre kişi dağılımını iletir. Talep ilgili etkinlik ve seçeneklerle kaydolur; yeni bir teklif formu veya ayrı iş akışı gerekmez. Bu fiyat biçimi seçiliyken kartta “başlayan” tutarı hesaplanmaz ve kesin toplam uydurulmaz. Veri modelinde bu fiyat biçimi sayısal fiyat gösteriminden ayırt edilir. Sayısal fiyat veya “başlayan” gösterimi kullanılan etkinlikler için önceki kurallar korunur; talep gönderimi kesin fiyat, müsaitlik veya rezervasyon onayı değildir.

**Seçenekli etkinlikte kart fiyatı — 31 Ekim 2026, UBT kabulü:** Bir etkinlikte birden fazla fiyat seçeneği varsa kategori kartında sunulan seçeneklerin en düşük geçerli fiyatı, kişi/paket gibi fiyat temelini koruyarak, ilgili dilde “45 €’dan başlayan” biçiminde gösterilir. Detay sayfasında bütün sunulan seçenekler kendi fiyat ve açıklamalarıyla gösterilir. Kart tutarı ilgili seçeneklerden türetilir; seçeneklerden kopuk ayrı bir tutar girilmez. Farklı para birimleri veya kişi/paket temelleri doğrudan sayısal olarak karşılaştırılmaz; mevcut onaylı fiyat/kur kuralları korunur. Fiyatı bilinmeyen seçenek sıfır tutar sayılmaz. Bu gösterim kesin rezervasyon veya ödeme onayı değildir.

**Grup talebinde seçenek dağılımı — 31 Ekim 2026, UBT kabulü:** Bir etkinlik için birden fazla seçenek sunuluyorsa grup talebinde her seçeneğe kişi sayısı atanabilir; örneğin dört kişiden ikisi yemekli, ikisi yemeksiz olabilir. Seçenek adetleri sıfır veya pozitif tam sayı olmalı ve toplamları talebin kişi sayısına eşit olmalıdır. Sıfır adet seçilmeyen seçenek anlamındadır; negatif/kesirli adet veya toplam uyumsuzluğu geçerli talep olarak kaydedilmez. İlk kısa talepte bu dağılım için katılımcı adları istenmez. Talep, etkinliğe bağlı seçenekler ve her birinin kişi sayısını korur; önceki seçenek kimliği ve talep anındaki ad/fiyat/para birimi bilgilerini koruma kuralı her seçenek satırında geçerlidir. Seçeneksiz etkinlikte seçenek dağılımı istenmez. Bu dağılım kesin rezervasyon, müsaitlik veya tahsilat onayı değildir.

**Etkinlik seçenekleri — 31 Ekim 2026, UBT kabulü:** Aynı etkinliğin yemekli/yemeksiz veya ekipmanlı/ekipmansız gibi seçenekleri ayrı etkinlik sayfaları oluşturmaz. Seçenekler ilgili etkinlik kaydına bağlı, ayrı kimlikli kayıtlar olarak yönetilir; tek detay sayfasında kendi açıklama ve fiyatlarıyla gösterilir. Seçenek sunulan etkinlikte müşteri talep gönderirken tercihini seçer ve seçim ilgili talebe kaydedilir. Seçenek kimliği ile talep anındaki ad/açıklama ve gösterilen fiyat/para birimi bilgisi korunur; sonraki seçenek veya fiyat düzenlemesi eski talebin anlamını değiştirmez. Bu seçim kesin müsaitlik, rezervasyon veya ödeme onayı oluşturmaz; mevcut fiyat ve faz kuralları geçerlidir. İlk talebin kabul edilmiş alanlarına yalnızca ilgili etkinliğin seçenek seçimi eklenir; sağlık bilgisi bu aşamaya taşınmaz. Yeni bir gelişmiş ürün yapılandırma aracı kapsamı oluşturulmaz.

**Ortak etkinlik yapısı — 30 Ekim 2026, UBT kabulü:** Dalış, Deniz Kanosu ve Outdoor etkinlikleri veritabanında ortak Etkinlik yapısını kullanır; her etkinlik ayrı kimliği olan bağımsız bir kayıttır. Kategori, başlık, açıklama, fotoğraflar, süre, fiyat, SSS ve kullanılacak form ilgili etkinlik kaydıyla ilişkilendirilir. Mevcut dil, taslak/yayın, fiyat ve form kuralları korunur. Ziyaretçi tarafında ortak etkinlik detay şablonu kullanılır; boş bırakılan isteğe bağlı bölümler gösterilmez. Yeni etkinlik panelden eklenerek aynı şablonda sunulur; her etkinlik için yeniden sayfa tasarımı veya kod değişikliği gerekmez. Ortak etkinlik yapısı, ayrı Dalış ve Outdoor sağlık formu kayıtlarını birleştirmez. Mağaza ile Ulaşım/Konaklama bu kararla etkinlik yapısına zorunlu olarak dahil edilmez. Kesin tablo adları ve teknik ilişki düzeni uygulayıcıya bırakılır.

**Ayrı Dalış ve Outdoor formları — 29 Ekim 2026, UBT kabulü:** Yönetimde etkinlik için kullanılacak sağlık formu seçilebilir. Dalış ve Outdoor başlangıçta aynı kaynak metin, soru ve alanları içerir; veritabanında ayrı kimlikleri olan iki bağımsız form tanımı olarak tutulur. Yalnızca farklı adla gösterilen tek ortak form kaydı kullanılmaz. Ayrı tablo zorunlu değildir; ayrı form kayıtları yeterlidir. Her formun içerik düzenlemeleri ve sürümleri bağımsızdır; birindeki değişiklik diğerine yansımaz. Katılımcı yanıtı kullanılan form kimliği ve gönderim anındaki sürümle ilişkilendirilir; sonraki değişiklikler eski yanıtları bozmaz. Outdoor içeriği daha sonra ayrıca farklılaştırılabilir; mevcut aynı içerikle başlama kararı geliştirmeyi bekletmez. Bu karar kaynak metnin tıbbi anlamını değiştirmez veya otomatik uygunluk onayı oluşturmaz.

V6'nın MVP kapsamını ve mevcut faz ayrımını esas alarak panel, veri kaydı, bildirim ve gerekli servis bağlantılarını tamamla. En az şu ilişkilerin tutarlı olması gerekir:

- İçerik, kategori, dil sürümü, taslak/yayın durumu ve çeviri güncelleme durumu.
- Etkinlik ile talep; rezervasyon ile ayrı katılımcılar; katılımcı ile kendi form yanıtları.
- Düzenlenebilir formun alan kimlikleri/sürümü ile gönderim anındaki yanıtlar; sonraki düzenleme eski yanıtları bozmaz.
- Talep ile üstlenen personel; bildirim başarısız olsa da kalıcı talep kaydı korunur.
- Kullanıcı, rol, işlem yetkisi ve 2FA; hassas veri erişimi yalnızca arayüzde gizleme ile sınırlandırılmaz.

Bu ilişkiler yeni tablo/API isimlerini dayatmaz; uygulayıcı uygun veri modelini seçer. İkinci aşamada gerçek bağlantı gerektiren testleri test ortamı ve temsili verilerle yap. Mock servis başarısını gerçek e-posta teslimi, gerçek DeepL yanıtı veya gerçek müşteri kaydı olarak raporlama.

## 7. Uçtan uca senaryolar ve tamamlanma ölçütleri

**E13/E14/E16 SEO geçiş kanıtı:** Alan adının ve üç mevcut kategori adresinin korunduğunu; Search Console erişimi varsa öncelikli sayfa/sorgu ve bağlantı verisinin geçiş öncesi kaydedildiğini kontrol et. Öncelikli eski/QR adresleri ilgili çalışan hedefe ulaşmalı; yönlendirme zinciri, ilgisiz ana sayfa hedefi veya canlı noindex engeli olmamalıdır. Kategori içeriği yeni kart düzeni nedeniyle kaybolmamalı; dil, blog ve görsel adresleri eşleştirme kontrolüne dahil edilmelidir. En az bir yıllık yönlendirme koruması, eski hosting kapatma koşulu, geri dönüş ve yayın sonrası izleme teslim notunda yer almalıdır. Erişilemeyen Search Console verisi veya henüz oluşmamış yayın sonrası ölçüm başarılı test gibi raporlanmaz. Kontroller temsili geliştirme ortamı ve gerçek yayın kontrolleri olarak ayrılır.

**E02/K2 iletişim bağlantıları kontrolü:** İletişim sayfası ve footer içinde kullanıcı tarafından verilen işletme adı, TÜRSAB A4615, adres, telefon, mobil ve e-postanın tutarlı gösterildiğini doğrula. Telefon bağlantıları doğru numaraları, e-posta info@dragoman-turkey.com adresini, mobil WhatsApp işlemi https://wa.me/905332901463 hedefini açmalıdır. Harici arama veya mesaj gönderimi yapmadan bağlantı hedefleri kontrol edilir.

**E05/E09 müşteri alındı e-postası kontrolü:** Başarılı etkinlik talebinde işletme bildiriminin yanında rezervasyon sahibine de Zoho üzerinden alındı e-postası gönderildiğini doğrula. E-postadaki etkinlik, tercih edilen tarih, kişi sayısı, seçenek dağılımı ve varsa fiyat özeti kayıtla eşleşmeli; dil doğru olmalı ve kesin rezervasyon vaadi bulunmamalıdır. Fiyat talep üzerine ise toplam, sağlık yanıtları ve diğer kişilerin güvenli bağlantıları e-postada bulunmamalıdır. Kayıt başarısızsa alındı e-postası oluşmamalı; Zoho gönderimi başarısızsa talep panelde korunmalıdır. Temsili servis testi ile gerçek Zoho gönderim/alıcıya ulaşma kontrolü ayrı raporlanır; yalnızca gönderim isteğinin kabulü teslim edildi kanıtı değildir.

**E05 tek etkinlikli talep kontrolü:** Dalış ve deniz kanosu için ayrı talepler oluştur; her kaydın yalnızca ilgili etkinliğe bağlı olduğunu doğrula. Aynı etkinliğin birden fazla seçeneği tek talepte kişi dağılımıyla tutulabilmeli; başka etkinliğin kimlik/seçeneklerini aynı talebe ekleme girişimi sunucuda da reddedilmelidir. Tanımlı çok aktiviteli hazır paket için tek talep oluşmalı; paket içeriği otomatik ek talepler üretmemelidir.

**E05/E12 talep fiyat özeti kontrolü:** İki yemekli × 60 EUR ve iki yemeksiz × 45 EUR seçimiyle satırları ve 210 EUR toplamını doğrula; adet değişince özet güncellenmelidir. Sunucu istemcinin değiştirdiği tutarı esas almamalı, geçerli seçenek ve fiyatlardan hesaplamalıdır. “Fiyat talep üzerine” durumunda toplam gösterilmemeli; eksik fiyat sıfır sayılmamalı, farklı para birimleri veya fiyat temelleri doğrudan toplanmamalıdır. Talep anındaki fiyat özeti sonraki seçenek/fiyat düzenlemelerinden etkilenmemeli ve kesin fiyatın işletme teyidi gerektirdiği görünmelidir.

**E03/E12 kategori sıralama kontrolü:** Panelden iki alt grubun sırasını ve bir alt gruptaki etkinlik kartlarının sırasını değiştir. Sayfa yenilendiğinde ve yeni oturumda sıralama korunmalı, ziyaretçi sayfasında ve mevcut dil sürümlerinde uygun yayınlanmış içeriklere uygulanmalıdır. Diğer kategori/alt grup sıraları değişmemeli; arşivli veya onaysız içerik görünür hale gelmemelidir.

**E01/E05/E12 etkinlik arşivleme kontrolü:** Geçmiş talebi olan etkinliği arşivle; kategori ve öne çıkan listelerinde görünmediğini, doğrudan veri isteğiyle de yeni talep oluşturulamadığını doğrula. Etkinlik içeriği, seçenekleri ve eski taleplerin bağlantıları panelde korunmalıdır. Yeniden yayına alma mevcut yetki ve dil onayı kurallarıyla çalışmalı; eski URL davranışı mevcut SEO kurallarıyla uyumlu olmalıdır.

**E03/E12 gün gün program kontrolü:** Çok günlük etkinliğe üç gün başlığı ve açıklaması ekle; doğru etkinlikte doğru sırayla ve seçilen dilin onaylı içeriğiyle gösterildiğini doğrula. Bir etkinliğin programını düzenlemek diğerini etkilememeli. Program girilmeyen günlük veya çok günlük etkinlikte boş bölüm/başlık görünmemeli. Uzun açıklamalar mobil ve masaüstü yerleşimini bozmamalıdır.

**E03/E05/E12 talep üzerine fiyat kontrolü:** Panelde “Fiyat talep üzerine” seçilen etkinliğin kart ve detayında sayısal tutar veya ücretsiz ifadesi yerine doğru metnin gösterildiğini doğrula. Aynı talep formundan tarih, kişi sayısı ve varsa seçenek dağılımı ile kayıt oluşturulabilmeli; sayısal fiyat yokluğu talebi engellememeli, sıfır fiyat veya kesin toplam üretilmemelidir. Fiyat gösterim biçimi değişince kart ve detay birlikte güncellenmeli; eski taleplerin talep anındaki fiyat bilgisi korunmalıdır.

**E03/E12 kart başlangıç fiyatı kontrolü:** Aynı fiyat temeli ve para biriminde yemekli 60 EUR, yemeksiz 45 EUR seçenekleriyle kartın “45 €’dan başlayan” göstermesini, detayda iki seçeneğin de görünmesini doğrula. En düşük sunulan seçenek fiyatı değişince kart güncellenmeli; sunulmayan seçenek hesaplamaya dahil edilmemelidir. Fiyatı bulunmayan seçenek sıfır sayılmamalı; farklı para birimleri veya fiyat temelleri doğrudan karşılaştırılmamalıdır.

**E05 grup seçenek toplamı kontrolü:** Dört kişilik talebi iki yemekli ve iki yemeksiz olarak gönder; iki seçenek satırı ve adetlerin doğru kaydedildiğini doğrula. Toplam üç veya beş, negatif ya da kesirli adet ve başka etkinliğe ait seçenek sunucu tarafında da reddedilmelidir. Tek seçeneğe dört kişi atanması geçerlidir; sıfır adet diğer seçeneği seçilmiş saymaz. Kişi sayısı değişince dağılımın toplamı yeniden doğrulanır. İlk talep bu işlem için katılımcı isimleri istemez; seçeneksiz etkinlikte dağılım gerektirmez.

**E05/E12 etkinlik seçeneği kontrolü:** Yemekli/yemeksiz ve ekipmanlı/ekipmansız örneklerinde tek etkinlik detay sayfasından seçim yapıp talep gönder. Kaydın doğru etkinlik ve seçenekle eşleştiğini; seçenekli etkinlikte eksik veya başka etkinliğe ait geçersiz seçimin kabul edilmediğini doğrula. Seçeneksiz etkinlikte gereksiz seçim alanı gösterilmez. Seçeneğin adı veya fiyatı sonradan değişince önceki talepteki seçim ve o anda gösterilen fiyat bilgisi korunmalıdır. Talep kesin rezervasyon veya ödeme onayı üretmez.

**E03/E12 ortak etkinlik kontrolü:** Panelden Dalış, Deniz Kanosu ve Outdoor için ayrı etkinlikler ekle; doğru kategori ve kendi içerikleriyle ortak detay şablonunda açıldıklarını doğrula. Bir kaydı düzenlemek diğer etkinlikleri değiştirmemeli. Boş isteğe bağlı bölümler ziyaretçiye boş başlık/alan olarak gösterilmemeli. Yeni etkinlik eklemek kod veya yeni sayfa tasarımı gerektirmemeli; seçilmiş form doğru etkinlikle eşleşmeli.

**E07/E08 ayrı form kontrolü:** Aynı başlangıç içeriğine sahip Dalış ve Outdoor kayıtlarının farklı form kimlikleri olduğunu doğrula. Etkinlikte seçilen formun katılımcıya açıldığını kontrol et. Outdoor sorusunu değiştirince Dalış içeriği ve sürümü değişmemeli; eski gönderimler kendi form kimliği, alanları ve sürümüyle okunabilmelidir. Aynı soruların iki formda bulunması yanıt kayıtlarını birbirine karıştırmamalıdır.

**E07 ek alıcı kontrolü:** Dört kişilik talepte ilk form yalnızca rezervasyon sahibinin iletişim bilgilerini ister. Dragoman etkinlik/tarih teyidi sırasında diğer katılımcıların ad-soyad ve e-postalarını talebe ekleyebilmelidir. Her katılımcının ayrı güvenli bağlantısının kendi e-postasına gitmesi ve doğru katılımcı kaydına açılması kontrol edilir. Rezervasyon sahibine diğer katılımcıların bağlantıları veya sağlık yanıtları topluca gönderilmez. Gerçek e-posta teslim testi ile temsili servis testi ayrı raporlanır.

**E07'ye dahil bağlantı gönderim zamanı kontrolü:** İlk talep kaydı veya yalnızca İşleme Alındı işlemi sağlık formu bağlantısı göndermemelidir. Dragoman etkinlik/tarihi müşteriyle teyit ettikten sonra ilgili katılımcıların ayrı güvenli bağlantıları gönderilmelidir. Bu teyit sağlık uygunluğu veya kesin katılım onayı durumuna dönüştürülmemelidir. Sağlık formu gönderimi ilk kısa talep aşamasına çekilmemeli; sonraki ödeme fazında ödeme başarısı tek başına teyit yerine kullanılmamalıdır.

**E08'e dahil gönderim sonrası değişiklik kontrolü:** Katılımcı gönderdiği yanıtı değiştirdiğinde yeni sürüm kaydolmalı, önceki yanıt yetkili sağlık geçmişinde korunmalı ve yetkili ekibe yeniden bildirim oluşmalıdır. Bildirimde sağlık yanıtları bulunmamalı; genel audit log'a sağlık geçmişi kopyalanmamalıdır. Rezervasyon sahibi başka katılımcının önceki yanıtlarına da erişememelidir. Eski inceleme kararı değiştirilmiş yanıtlara otomatik onay gibi uygulanmamalı; güncel Evet yanıtı inceleme kuralı korunmalıdır. Doğrulamada hem Hayır → Evet hem Evet → Hayır değişikliğinde geçmiş ve bildirim kontrol edilir; değişiklik otomatik katılım kabulü veya reddi üretmez.

**E07'ye dahil grup rezervasyonu erişim kontrolü:** Aynı rezervasyondaki A ve B katılımcılarıyla ve rezervasyon sahibiyle test et. Rezervasyon sahibi diğer katılımcıların yalnızca form tamamlama durumunu görebilmeli; sağlık yanıtları, inceleme işareti ve inceleme ayrıntıları ona gönderilen veri yanıtında dahi bulunmamalıdır. Başkasının form bağlantısını/kayıt kimliğini kullanarak erişim reddedilmelidir. Katılımcı kendi kaydına, yalnızca yetkili Dragoman personeli gerekli sağlık kayıtlarına erişebilmelidir. Rezervasyon sahibi kendisi de katılımcıysa kendi formunu görebilir. Yetkisi olmayan personelde de veri erişimi reddedilmelidir; yalnızca arayüz gizlemesi yeterli değildir.

**E08'e dahil sağlık inceleme kontrolü:** Geçerli bir sağlık sorusuna Evet yanıtıyla form gönderildiğinde ilgili katılımcının formu kaydolmalı, İnceleme gerekiyor işareti oluşmalı ve yetkili ekibe bildirim akışı çalışmalıdır. Sağlık yanıtları e-posta gövdesinde bulunmamalıdır. Form gönderimi veya bu işaret otomatik kabul/ret, ödeme ya da rezervasyon durumu değişikliği üretmemelidir. Tüm yanıtlarda Hayır senaryosu da otomatik tıbbi uygunluk onayı üretmemelidir. Eksik zorunlu yanıtın gönderimi engellemesiyle, Evet yanıtının gönderime izin verip inceleme başlatması ayrı test edilir.

Bu tablo uygulayıcıya test kapsamını verir. Araç ve test dosyası düzeni mevcut projeye göre belirlenir. Yerleşim değerlendirmesini gereksiz ayrıntıda otomatik testlerle büyütme; iş akışları, veri kaybı ve yetki sınırlarını anlamlı testlerle doğrula.

| No | Aşama | Senaryo ve beklenen sonuç | Brief karşılığı |
| --- | --- | --- | --- |
| E01 | A | Ana sayfa → kategori → kart → doğru detay → ilgili talep görünümü; bozuk hedef yok. | K1, K1a |
| E02 | A | Mobil menü, dil seçici ve sabit WhatsApp/işlem alanı kullanılabilir; içerik ve form kapanmaz. | K1, K1b |
| E03 | A | Bütün şablon grupları dolu; uzun/kısa ve dört dilde metin düzeni bozmaz; boş isteğe bağlı bölüm gizlenir. | K1d |
| E04 | A | SSS klavye/dokunmayla açılır; yanıtlar sayfa içeriğindedir. Ayrı panel önizlemesi ve ek etkinlik filtresi eklenmemiştir. | K1c, K1e |
| E05 | B | İlk talepte etkinlik otomatik seçilir; gerekli alanlar doğrulanır; tek kullanıcı işlemi yanlışlıkla çoğaltılmış talep üretmez; kayıt ve işletme bildirimi kontrol edilir. Mesaj kesin rezervasyon/ödeme vaadi içermez. | K2, K3 |
| E06 | B | Ulaşım/Konaklama talebi doğru hizmet bilgisiyle kaydolur; örnek alanlar panelden değiştirilebilir; gerçek fiyat/müsaitlik onayı verilmez. | K2, K3 |
| E07 | B | Her katılımcının güvenli bağlantısı kendi formuna açılır; başka katılımcı/rezervasyon verisine erişilemez. Dalış/Outdoor kaynak alanları eksiksiz eşlenir. | K4, K9 |
| E08 | B | Yeni formda bütün Evet/Hayır seçenekleri boş başlar; katılımcı kendisi seçer. Geçerli zorunlu soru yanıtsızsa form tamamlandı sayılmaz. Form değişince önceki gönderimin alan ve yanıtları korunur; yanıtsız alan Hayır sayılmaz; sağlık yanıtları otomatik uygunluk kararı üretmez. Çevrimiçi tamamlanma kâğıt imzası alınmış gibi gösterilmez; merkezde katılımcı/gerekiyorsa veli-vasi imzası gerektiği bildirilir. İmza çizme veya elektronik imza hizmeti eklenmez. | K4 |
| E09 | B | E-posta hatasında talep panelde kalır; yetkili kişi işleme alabilir, üstlenen görünür; hatırlatma/devir davranışı V6'ya uyar. | K2, K8 |
| E10 | B | İçerik düzenleme, taslak ve yayın yetkileri doğru çalışır; yetkisiz kullanıcı doğrudan veri isteğiyle sınırı aşamaz; panelde 2FA uygulanır. | K5, K9 |
| E11 | B | Ana içerikle birlikte çeviriler ayrı onaysız yayınlanır; kaynak değişince mevcut çeviri ve elle düzeltmeler korunur, güncelleme uyarısı oluşur; müşteri yeniden çeviri başlatabilir; DeepL hata/kota uyarısı doğrulanır. | K6 |
| E12 | B | Form alanı, metni veya içeriği sonradan düzenlenebilir; yeni içerik aynı şablonu kullanır; eski kayıtlar kaybolmaz. | K1d, K3, K5 |
| E13 | Yayın hazırlığı | İlk HTML, dil URL'leri, canonical/hreflang, sitemap, robots ve taslak/özel erişimler V6'ya göre kontrol edilir; örnek içerik yayına/indekse çıkmaz. | K7, K7a, K7b, K7d |
| E14 | Yayın hazırlığı | WordPress URL/QR eşleştirmesi, ilgili hedefe yönlendirme ve gerçek görsel/hız kontrolleri kanıtlanır. Yeni sitede olmayan saha verisi varmış gibi raporlanmaz. | K7c, K7f, K9a |
| E15 | Yayın hazırlığı | Çerez reddinde zorunlu olmayan etiketler çalışmaz; izinli olaylar sağlık/kişisel yanıt taşımaz; uygun şema ve ölçüm erişimleri kontrol edilir. | K7e, K7g, K7h, K9 |
| E16 | Yayın hazırlığı | Yedek/geri yükleme, medya kullanımı ve gerçek işletme senaryoları doğrulanır; Dragoman yayın onayı alınır. | K9, K9b, K10 |
| E17 | Sonraki faz | Ödeme/kapora/kur/iade/stok ve e-Fatura testleri V6 Bölüm 11'deki ayrı faz kabulüne göre yapılır; A/B aşamalarını ödeme sağlayıcısı seçilmedi diye bekletmez. | POS ve e-Fatura fazı kabulü |

Kontrolleri **Geçti**, **Başarısız**, **Dış bilgi/erişim bekliyor** veya **Bu aşamada kapsam dışı** olarak raporla. Çalıştırılmayan test Geçti değildir. Birinci aşama teslimi, bütün B/yayın/ödeme senaryolarının tamamlandığı anlamına gelmez.

## 8. Her aşamanın teslim özeti

Kısa teslim notunda şunlar bulunsun:

1. Neler hazır, hangi sayfalar/akışlar incelenebilir ve nasıl açılır?
2. Hangi içerikler kaynak, hangileri mockup; hangi servisler gerçek, hangileri test/temsili?
3. Hangi kontroller gerçekten yapıldı; sonuçlar ve varsa ekran görüntüsü/rapor konumu nedir?
4. Sadece ilgili sonraki aşamayı etkileyen eksik erişimler veya müşteri kararları neler?
5. UBT'den beklenen tek aşama değerlendirmesi veya gerçekten gereken toplu kararlar neler?

Uygulanmamış özelliği tamamlandı, mockup form gönderimini gerçek kayıt veya teknik başarıyı işletme yayın onayı olarak sunma. Yeni tasarım soruları dizisi açmak yerine onaylanmış sınırlar içinde somut ve değerlendirilebilir teslim üret.

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



