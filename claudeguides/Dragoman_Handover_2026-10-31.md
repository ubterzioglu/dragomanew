# Dragoman — Yeni oturum handover

**Tarih:** 31 Ekim 2026
**Güncel brief:** V6; V7 oluşturulmadı.
**Amaç:** UBT belgeleri tamamlayınca Claude Code ile geliştirme yaptıracak. Bu oturum dokümantasyon oturumudur; uygulama veya yayın başlamadı.

## 1. Önce buradan başla

1. [Brief V6](./Dragoman_Proje_Brief_V6.md): bütün kapsam ve kabul edilmiş iş kuralları.
2. [Layout ve veri ilişkileri](./Dragoman_Layout_Veri_Iliskileri.md): 31 Ekim derlemesi; temel içerik, seçenek ve talep ilişkileri. Zoho/iletişim/son SEO ekleri için ayrıca V6 ve rehberi oku.
3. [Claude Code uygulama rehberi](./Dragoman_Claude_Code_Uygulama_Rehberi.md): E01–E17 ile son ek E2E kontrolleri, teslim sırası ve eksik erişimle ilerleme.
4. [Sağlık gereksinimleri](./Dragoman_Saglik_Formu_Gereksinimleri.md): yalnızca ilgili sağlık işi gerektiğinde; kullanıcı bu konuya takılınmasını istemiyor.
5. [29 Ekim handover](./Dragoman_Handover_2026-10-29.md): önceki ayrıntılı bağlam ve sonradan eklenen kayıtlar. Güncel devam başlangıcı bu 31 Ekim belgesidir.

Diğer kaynaklar: cloner/analysis altındaki WordPress analizi, SEO/GEO araştırması ve ödeme notu. V6, özetlerin yerine geçer; özet V6 kapsamını daraltmaz.

## 2. Kullanıcının çalışma tercihi ve mevcut durak

Kullanıcı sade çözüm istiyor. Sürekli küçük özellik/onay sorusu üretme; kabul edilmiş konuları yeniden açma. Gerçek layout, veri ilişkisi ve uçtan uca müşteri akışı kararları gerekirse tek tek ve somut örnekle sorulur. Teknik tablo/alan adları ve olağan tasarım ayrıntıları Claude Code tarafından seçilebilir.

Etkinlik kopyalama önerisi “Gerek yok overengineering” diye reddedildi. Form açıkken fiyat değişmesine özel uyarı/yeniden onay önerisi de fazla hassas bulunup reddedildi. Bu özellikleri başka adla geri ekleme. Mevcut sunucu fiyat doğrulaması ve Dragoman fiyat teyidi yeterlidir.

Kullanıcı özellikle sağlık formu ayrıntılarından layout ve database konusuna yönlendirdi. Son önerilmiş 45 yaş koşullu gösterimi kabul edilmedi; zorunlu kural sayma. Sağlık ayrıntı sorularına kendiliğinden geri dönme.

Son tamamlanan iş: Kullanıcı SEO değerini kaybetmeme önerilerini plana yazdırdı. V6 Bölüm 9.2, E13/E14/E16 ekleri ve 29 Ekim handover güncellendi. Son talimat yeni oturum için handover hazırlamak; bu turda yeni kapsam sorusu yok.

## 3. Dosya konumları

| Kullanım | Konum |
| --- | --- |
| Güncel belgeler ve yeni proje | C:\temp_private\dragomanew |
| Kaynak metinler | C:\temp_private\dragomanew\cloner\extracted |
| İçerik/dil/URL envanterleri | C:\temp_private\dragomanew\cloner\analysis |
| Gerçek görseller | C:\temp_private\dragoman\cloner\images |
| Görsel eşleştirmesi | C:\temp_private\dragoman\cloner\media-download-manifest.json |
| Sağlık kaynak PDF | C:\temp_private\dragomanew\claudeguides\sources\forms\try-saglik-formu-tr-21.pdf |
| Repo | https://github.com/ubterzioglu/dragomanew |

Sohbetin bağlı olduğu yerel proje OneDrive içindeki dragomannewsite olabilir. Bu oturumun belge işlemleri açıkça C:\temp_private\dragomanew içinde yapıldı; klasörleri karıştırma. GitHub var diye son belgelerin push edildiğini varsayma. Bu oturum commit/push yapmadı.

Önceki oturumda 323 görsel indirilmiş ve SHA-256/boyut doğrulaması yapılmıştı; tekrar indirme. Bütün görseller için konu/kalite seçimi yapılmış değil.

## 4. Layout ve veritabanı kararları

- Modern, temiz ve yalın arayüz; mevcut logo. Slogan aynen: Once a Dragoman, always a Dragoman.
- Beş kategori: Dalış, Deniz Kanosu, Doğa Aktiviteleri, Ulaşım ve Konaklama, Mağaza. Menü, üç fotoğraflı açılış ve ana sayfa sırası V6 içinde kesin.
- Dalış, Deniz Kanosu ve Outdoor ortak Etkinlik veri yapısı ve ortak detay şablonu kullanır; her aktivite ayrı kimlikli bağımsız kayıttır. Bu, aynı kaydın farklı ana kategorilerde paylaşılması demek değildir. Dalış ile Outdoor farklı aktivitelerdir.
- Kategori → alt grup → etkinlik kartları. Alt grupların ve içlerindeki kartların sırası panelden elle yönetilir; sıralama kalıcıdır. Kesin kontrol biçimini uygulayıcı seçer.
- Detayda başlık, özet, fotoğraflar, anlatım, gerekli bilgiler, SSS ve talep işlemi bulunur. Boş isteğe bağlı bölümler görünmez. Ayrı sayfa kurucu veya panel önizlemesi yok.
- Çok günlük turlarda sıralı gün başlığı/açıklaması kayıtları var. Program girilmemişse bölüm gösterilmez.
- Arşivlenen etkinlik ziyaretçi listelerinden/öne çıkanlardan kalkar ve yeni talep almaz. İçerik, seçenek ve eski talepler korunur; yetkili kişi tekrar yayınlayabilir. URL davranışı mevcut SEO kurallarına uyar.
- Mağaza ile Ulaşım/Konaklama bu kararla zorla Etkinlik modeline dahil edilmez. Ulaşım/Konaklama talep formu zaten kabul edilmişti; nihai alanları sonra UBT düzenleyecek.
- Etkinlik kopyalama yok.

## 5. Seçenek, fiyat ve talep kararları

- Yemekli/yemeksiz veya ekipmanlı/ekipmansız seçenekleri aynı etkinliğe bağlı ayrı seçenek kayıtlarıdır; ayrı sayfalar oluşturulmaz.
- Grup talebinde seçenek başına kişi sayısı girilir; örneğin 4 kişi = 2 yemekli + 2 yemeksiz. Negatif olmayan tam sayılar; toplam talep kişi sayısına eşit olmalı. Bu ilk aşamada katılımcı isimleri istenmez.
- Kategori kartında karşılaştırılabilir seçeneklerin en düşük sunulan fiyatı “...’dan başlayan” gösterilir. Detayda seçenek fiyatları görünür. Kart fiyatı seçeneklerden türetilir.
- “Fiyat talep üzerine” panelden seçilir; kart ve detay aynı ifadeyi gösterir. Aynı talep formu kullanılır; eksik fiyat sıfır değildir, toplam uydurulmaz.
- Sayısal fiyatlarda seçenek/adet özeti gösterilir: 2 × 60 EUR + 2 × 45 EUR = 210 EUR. Kesin fiyatın Dragoman tarafından teyit edileceği belirtilir. Sunucu hesap/doğrulaması korunur; özel fiyat değişti uyarısı/yeniden onayı yok.
- Fiyat temelleri (kişi/grup/paket) veya para birimleri doğrudan karıştırılmaz. V6 EUR ana fiyat/TL karşılığı ve mevcut sezon/kademe/ek hizmet kuralları korunur.
- Talepte seçenek kimliği, talep anındaki adı, adet, fiyat/para birimi ve varsa hesap özeti korunur. Sonraki fiyat düzenlemesi geçmiş talebi değiştirmez.
- Her talep tek etkinlik içindir. Ayrı dalış/kano iki talep; hazır çok aktiviteli paket kendi tek kaydıyla tek talep. Çok etkinlikli sepet eklenmez. Kitap sepeti ve sonraki ödeme fazı ayrı kapsamdır.
- İlk form: etkinlik otomatik seçili; ad-soyad, e-posta, tercih edilen tarih, kişi sayısı zorunlu; telefon/mesaj isteğe bağlı; ilgili seçenek dağılımı eklenir. Sağlık yanıtları burada alınmaz.

## 6. İçerik kaynakları ve etkinlikler

Dalış: https://dragoman-turkey.com/diving/
Outdoor: https://dragoman-turkey.com/outdoor-activities/
Deniz Kanosu için esas kaynak: https://dragomanseakayak.com/tr/ ve ilgili detayları. Kullanıcı açıkça bu kaynağı baz almamızı istedi. Eski sea-kayak sayfasıyla çelişen ad/süre/programda yeni kaynak esas; aynı tur çoğaltılmaz.

Deniz kanosu başlangıç listesi:
- Günlük: Kekova Klasik, Kekova Batı, Kekova Doğu.
- Çok günlük: Kekova Körfezi (2 gün/1 gece), Işık Kıyısı (4 gün/3 gece), Kekova Deniz Kayağı & Gulet (7 gün/6 gece), Likya Kayak & Konfor Kaçamağı (7 gün/6 gece), Karia Kıyısı (7 gün/6 gece).
- TRAK Signature Deneyimi ayrı deneyim kaydı.
- Özel/kişiye özel tur sayfası teklif hizmeti kaynağıdır; genel anlatımdan yeni Outdoor etkinliği uydurulmaz. Outdoor mevcut ayrı listesi korunur.

Outdoor mevcut kaynak grupları: çok aktiviteli, yürüyüş, bisiklet, coasteering, tekne, kültür ve özel turlar. Dalış için konuşmada sunulan yeni gruplama tablosu öneriydi; bütün etiketler ayrıca onaylanmış gibi dayatılmaz. Kaynak grupları/yerel envanterle dolu şablon hazırlanabilir; nihai liste geliştirmeyi durdurmaz.

Aynı adlı Outdoor tekne turu ve deniz kanosu turu ayrı kayıtlardır. Yeni kaynağın süreleri eskiye göre günceldir; içerik kaynağı seçimi bütün fiyat/metinlerin otomatik yayın onayı değildir.

## 7. Zoho ve iletişim

Etkinlik talebi başarıyla kalıcı kaydolunca rezervasyon sahibine Zoho üzerinden alındı e-postası gönderilecek. Etkinlik, tercih edilen tarih, kişi sayısı, varsa seçenek dağılımı ve fiyat özeti bulunacak; kesin rezervasyon olmadığı ve ekibin iletişime geçeceği söylenecek. Mevcut dil/onay kuralları uygulanır. info@dragoman-turkey.com işletme bildirimi ayrıca korunur.

Zoho hatası talep kaydını silmez. Kaydolmamış talep için alındı e-postası yok. Ürün (Mail/ZeptoMail vb.), yöntem, hesap erişimi ve gerçek teslim testi henüz seçilmedi/doğrulanmadı. Zoho CRM veya ücretli abonelik onayı verilmedi. Sağlık verileri e-postaya yazılmaz.

| İletişim | Kullanıcının verdiği bilgi |
| --- | --- |
| İşletme | Dragoman Travel Agency / TÜRSAB A4615 |
| Adres | Uzunçarşı Cad. No: 15 KAŞ 07580 Antalya TÜRKİYE |
| Telefon | +90 242 836 3614 |
| Mobil | +90 533 290 1463 |
| WhatsApp | https://wa.me/905332901463 |
| E-posta | info@dragoman-turkey.com |

İletişim/footer/sabit WhatsApp bunları ortak kaynaktan kullanacak. Telefon ve e-posta bağlantı hedefleri E2E kontrolünde yer alıyor.

Kullanıcı tarafından verilen profil kaynakları:
- Maps: https://maps.app.goo.gl/8CHPeMSWYjqhSYJe6 — kısa adres Dragoman Diving and Outdoor kaydına yönleniyor; yönlendirme kontrol edildi.
- Instagram: https://www.instagram.com/dragomandivingandoutdoors/
- Facebook: https://www.facebook.com/dragomandivingandoutdoor
- LinkedIn: https://www.linkedin.com/company/dragoman-diving-outdoor/home/
- YouTube: https://www.youtube.com/@dragomanturkey669

Kaynaklar üç belgeye işlendi. Hesap erişimi verilmedi, akış/video aktarımı veya yorum API entegrasyonu kurulmadı. Instagram içeriği okunamadı. Maps için önceki “iletişim/yorum kaydı olarak mı?” sorusu ayrıca yanıtlanmadı; bu kayıt kullanıcı kaynağıdır, gerçek yorum entegrasyonu yöntemini doğrulama yerine geçmez.

## 8. Son SEO planı

V6 Bölüm 9.2 ve E13/E14/E16 eklerine işlendi:
1. dragoman-turkey.com korunur. SeaKayak kaynak alan adını kapatma/birleştirme/yönlendirme kararı yok.
2. /diving/, /sea-kayak/, /outdoor-activities/ kategori adresleri ve anlamlı kategori içerikleri korunur; yeni detaylar bunlara bağlanır.
3. Erişim varsa Search Console sayfa/sorgu performansı ve bağlantı verileri, analitik/sitemap/QR/eski URL envanteriyle birleştirilerek öncelikli adresler ve geçiş öncesi başlangıç verisi çıkarılır. Bu veriler henüz alınmadı. Şablon geliştirmeyi durdurmaz.
4. Değişen adresler en ilgili yeni karşılığa tek adımda 301/308; ilgisiz ana sayfaya toplu yönlendirme yok. Karşılıksız kaldırılan içerik 404/410. Yönlendirmeler en az bir yıl; kalıcı QR adresleri mümkün olduğunca sürekli korunur.
5. Dil, blog, görsel ve QR adresleri; canonical/hreflang/sitemap/ilk HTML/canlı noindex kontrol edilir.
6. Yeni altyapı doğrulanmadan eski hosting kapatılmaz; geri dönüş planı korunur. Yayın sonrası indeks/hata/organik performans başlangıç verisiyle karşılaştırılır. Sıralama/kayıpsız geçiş garantisi yok.

Google URL ve hosting geçiş rehberleri bu oturumda açılıp kontrol edildi; V6 kaynak bağlantıları içerir. Bu SEO araştırması canlı site denetimi değildir.

## 9. Sağlıkta bu oturumun ek kararları

Dalış ve Outdoor başlangıçta aynı içerikli ama ayrı kimlikli, bağımsız içerik/sürüm kayıtlarıdır. Etkinlikte form seçilir. Ayrı tablo şart değil, ayrı kayıt şart. Yanıt doğru form/sürüme bağlanır; ileride biri değişince diğeri etkilenmez.

Etkinlik/tarih teyidi sırasında Dragoman diğer katılımcıların ad-soyad/e-postalarını alıp talebe ekler; her kişiye doğrudan kendi e-postasına özel güvenli bağlantı gönderilir. İlk kısa form büyümez. Önceki gizlilik, erişim, Evet incelemesi, yanıt geçmişi ve merkezde kâğıt imza kuralları korunur; ayrıntıları sağlık gereksinimlerinde. Deniz Kanosu için sağlık kapsamı kendiliğinden genişletilmez.

## 10. Sonraki oturum nasıl devam etmeli?

Önce bu belge, V6 ve rehberi oku. Yeni özellik listesi çıkarmadan mevcut kapsamın eksik/çelişen yerlerini kontrol et. E2E derinleştirme normal müşteri akışı, veri kaybı, bildirimler ve yetki sınırları içindir; her teknik uç durum için kullanıcıya yeni ürün kararı sorma.

Açık müşteri içerikleri, gerçek servis hesapları, Zoho gönderim yöntemi, Search Console erişimi, Google yorum yöntemi, dil onayı ve ilgili yayın/veri işleme koşulları kendi aşamalarında tamamlanır. Ödeme araştırması hâlâ ertelenmiş. Bu aşamada uygulama geliştirmeye otomatik geçme. Mevcut teknoloji referansı V6 Bölüm 10.1 içinde; sıfırdan stack sorusu veya kendiliğinden mimari değişimi yok.

İlk uygulama teslimi dolu ziyaretçi şablonlarıdır; UBT genel görünümü değerlendirir, sonra panel/kalıcı kayıt/bildirim bağlantıları tamamlanır. Eksik fiyat/tur metni gibi bilgiler mockup ile temsil edilir, örnek içerik yayına/indekse çıkmaz.

## 11. Doğrulama durumu

Belgeler ve ek test senaryoları yazıldı; çalışan site, veritabanı, Zoho gönderimi, Google yorum bağlantısı, Search Console analizi veya E2E uygulama testi yapılmadı. Commit/push/yayın yok. Önceki V5 dosyasının SHA-256 değeri bu oturumda tekrar doğrulandı: 44031a4204f725493cf1550540fff01390205acc6fe81dfe1e0303adfd5a2bd8. Eski briefler ve Ek A korunacak. Bu özetin oluşması dokümantasyonun tamamlandığı veya yayın onayı anlamına gelmez.
## Son derleme ve Claude Code’a devir — 31 Ekim 2026

Bu handover'ın önceki bölümleri gün içindeki önceki durumu anlatır. Son soru turlarının kararları V6, uygulama rehberi ve veri ilişkileri belgesinin başındaki Güncel uygulama özeti bölümünde birleştirildi. Ayrı çeviri onayı kaldırıldı; tüm eski içerik aktarımı kesinleştirildi; hizmet formları, Google/Supabase, revizyon sistemi ve bildirimler, müşteri rehberi ve geliştirici cookbook'u güncellendi. Servis envanteri ve ödeme karşılaştırma kaynağı eklendi.

Yeni uygulayıcı başlangıcı: [Claude Code başlangıç talimatı](./Dragoman_Claude_Code_Baslangic.md). Önce Aşama A dolu ziyaretçi şablonları, ardından UBT toplu görünüm değerlendirmesi; panel ve gerçek bağlantılar sonra. İki yanıtsız karar (çeviri beklerken Türkçe yayın davranışı; ulaşım/konaklama operasyon takibi) açık işaretlendi. Bu dokümantasyon turunda uygulama, entegrasyon, canlı test, commit/push veya yayın yapılmadı.


