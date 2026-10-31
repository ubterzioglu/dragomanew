# Dragoman — Yeni sohbet için güncel handover

**Tarih:** 29 Ekim 2026  
**Kullanıcı / geliştirici:** UBT — Umut Barış Terzioğlu  
**İşletme ve yayın kararı:** Dragoman / Murat Draman  
**Hedef MVP:** 1 Aralık 2026  
**Güncel brief:** [Dragoman_Proje_Brief_V6.md](./Dragoman_Proje_Brief_V6.md). V7 oluşturulmadı. V5 ve eski briefler korunuyor.

## 1. Nerede kaldık?

**Son kabul — SEO geçiş planı, 31 Ekim 2026:** Kullanıcı SEO değerini koruma önerilerinin plana yazılmasını istedi. V6 Bölüm 9.2 ve rehber E13/E14/E16 kontrolleri güncellendi: aynı alan adı ve kategori adresleri, Search Console başlangıç verisi/öncelikleri, ilgili hedefe kalıcı yönlendirme, en az bir yıllık koruma, eski hostingin doğrulama sonrası kapatılması ve yayın sonrası izleme. Bu çalışma SEO denetimi veya canlı geçiş değildir; Search Console verileri henüz alınmadı.

**Müşteri talep alındı e-postası ve Zoho — 31 Ekim 2026, UBT kabulü:** Etkinlik talebi başarıyla kalıcı kayda alındığında rezervasyon sahibinin e-posta adresine talep alındı bildirimi gönderilir. Bu gönderim için Zoho kullanılacaktır. E-postada etkinlik, tercih edilen tarih, kişi sayısı, varsa seçenek/kişi dağılımı ve talep anındaki fiyat özeti bulunur; fiyat talep üzerine ise toplam uydurulmaz. Mesaj talebin alındığını ve kesin rezervasyon için ekibin iletişime geçeceğini açıkça belirtir; rezervasyon, müsaitlik veya ödeme onayı değildir. Bildirim mevcut müşteri dili ve onaylı e-posta şablonu kurallarına uyar; sağlık yanıtları veya diğer katılımcıların özel bağlantıları eklenmez. İşletmenin info@dragoman-turkey.com bildirimi ayrıca korunur. Kaydedilmeyen talep için başarı/alındı e-postası gönderilmez. E-posta gönderim hatası kalıcı talep kaydını silmez ve yeniden talep yaratma nedeni değildir. Zoho hesabı, kullanılacak ürün/gönderim yöntemi ve gerçek servis erişimleri bağlantı aşamasında doğrulanır; bu karar Zoho CRM, yeni müşteri takip sistemi veya ücretli abonelik onayı eklemez.

**Sade kapsam ve veri ilişkileri — 31 Ekim 2026:** Etkinlik kopyalama özelliği UBT tarafından gereksiz bulunarak kapsam dışında bırakıldı. Kabul edilen layout/veri ilişkilerinin özeti [Layout ve veri ilişkileri taslağında](./Dragoman_Layout_Veri_Iliskileri.md) toplandı. Bu belge V6 kapsamını değiştirmez; kesin tablo/alan adlarını uygulayıcı belirler. Dalış ve Outdoor ayrı etkinliklerdir; ortak kayıtla iki kategoriye bağlama önerisi kabul edilmedi. Sağlık formunun ayrıntı sorularına geri dönmeden, sade layout/veri yapısıyla ilerlenir.

Kullanıcı, dokümantasyon tamamlandığında belgeleri **Claude Code'a verip geliştirmeyi orada yaptıracak**. Bu sohbetin işi kapsamı, iş akışlarını ve uçtan uca uygulama/test gereksinimlerini netleştirmek. Site geliştirmeye, görsel mockup üretmeye veya canlı yayına başlanmadı. Görseller indirildi; bu, uygulamaya entegre edildikleri anlamına gelmez.

Kullanıcının son amacı: **Claude'un bir sürü ek soru sormadan ilerleyebilmesi.** Bunun için olağan tasarım kararlarını uygulayıcıya bırakıyor; gerçek müşteri içeriklerini daha sonra kendisi düzenleyecek. Gereksiz iş yükü, yeni özellik ve mikro tasarım sorusu istemiyor. Önemli açık iş kararlarını tek tek, kısa öneriyle sor; kabul edilmiş konuları tekrar açma. Eksik müşteri içeriğini bütün geliştirmeyi durduran bağımlılık haline getirme.

**31 Ekim devam durumu:** Layout ve veri ilişkileri taslağı hazırlandı. Son kabul edilen kararlar aşağıdaki devam kayıtlarında ve V6 içinde yer alır. Sağlık formu gönderim zamanı önceki kabul edilmiş karardır; güncel çalışma yalnızca bu konuya dönmez. Etkinlik kopyalama reddedildi; yeni özellik ve mikro soru üretmeden uygulayıcıya yeterli ilişki özeti verildi.

## 2. Önce okunacak belgeler

| Belge | Görevi |
| --- | --- |
| [Brief V6](./Dragoman_Proje_Brief_V6.md) | Güncel kapsam, iş kuralları, layout, teknoloji referansı, fazlar ve K kabul ölçütleri. Esas belge. |
| [Claude Code uygulama rehberi](./Dragoman_Claude_Code_Uygulama_Rehberi.md) | Tekrar sorulmayacak tercihler, eksik bilgiyle ilerleme, kaynak yolları, aşama teslimleri ve E01–E17 uçtan uca senaryolar. |
| [Sağlık formu gereksinimleri](./Dragoman_Saglik_Formu_Gereksinimleri.md) | Kaynak PDF'nin bütün soru/alanları ve son sağlık formu kararları. Bölüm 5–6 güncel kuralları içerir. |
| [Kaynak sağlık PDF'si](./sources/forms/try-saglik-formu-tr-21.pdf) | Kullanıcının Dalış ve Outdoor için verdiği boş form; değiştirilmeden korundu. |
| [WordPress analizi](../cloner/analysis/Dragoman_WordPress_Analizi.md) | Eski içerik, çeviri, ürün, medya ve URL envanterleri. Medya dosyalarının eksikliği ilk analiz tarihine aittir; sonradan indirildi. |
| [SEO/GEO araştırması](./Dragoman_SEO_GEO_Arastirma_2026-10-26.md) | 26 Ekim'deki birincil kaynak araştırması; V6'da 15 SEO, 3 GEO gereksinimi ve K7a–K7h kontrolü korunuyor. |
| [Ödeme notu](./Dragoman_Odeme_Kararlari.md) | Sağlayıcı seçimi açık; araştırma kullanıcı tarafından ertelendi. |
| [Layout kararları](./Dragoman_Layout_Kararlari.md) | Kronolojik karar izi. Sağlık formunun son kararları için V6 ve sağlık gereksinimlerine bak. |
| [26 Ekim handover](./Dragoman_Handover_2026-10-26.md) | Önceki bağlam ve tarihsel kayıt. Güncel devam başlangıcı bu 29 Ekim belgesidir. |

Eski sürümdeki açık notlar sonraki açık kullanıcı kararını geçersiz kılmaz. Ana briefteki Ek A'nın 50 müşteri yanıtı ve 25 geliştirici karar tablosu korunmuştur. Belgelerde istenen işlev, uygulanmış/test edilmiş işlev demek değildir.

## 3. Klasörleri karıştırma

| Kullanım | Konum |
| --- | --- |
| Güncel dokümantasyon ve yeni proje çalışma yeri | `C:\temp_private\dragomanew` |
| GitHub adresi | `https://github.com/ubterzioglu/dragomanew` |
| Çıkarılmış eski site metinleri | `C:\temp_private\dragomanew\cloner\extracted` |
| İçerik/dil/ürün/URL CSV ve raporları | `C:\temp_private\dragomanew\cloner\analysis` |
| İlk XML'nin korunan kopyası | `C:\temp_private\dragomanew\cloner\source\dragomandivingandoutdoors.WordPress.2026-10-25.xml` |
| Kullanıcının son işaret ettiği eski proje arşivi | `C:\temp_private\dragoman\cloner` |
| 29 Ekim medya XML'si | `C:\temp_private\dragoman\cloner\dragomandivingandoutdoors.WordPress.2026-10-29.xml` |
| İndirilmiş gerçek görseller | `C:\temp_private\dragoman\cloner\images` |
| Görsel URL/dosya/SHA-256 eşleştirmesi | `C:\temp_private\dragoman\cloner\media-download-manifest.json` |
| Projeye kopyalanan sağlık formu | `C:\temp_private\dragomanew\claudeguides\sources\forms\try-saglik-formu-tr-21.pdf` |
| PDF'nin kullanıcının verdiği özgün konumu | `C:\Users\baris-terzioglu\OneDrive - adesso Group\Desktop\try-saglik-formu-tr-21.pdf` |

Sohbetin eski çalışma dizini OneDrive'daki `dragomannewsite` olabilir. Dosya işlemlerinde **açıkça `C:\temp_private\dragomanew` çalışma dizinini kullan**. `dragoman` ile `dragomanew` farklı klasörlerdir. GitHub'da tüm kaynaklar varmış gibi varsayma; bu çalışmada commit/push veya yayın yapılmadı. Uygulamaya geçilirse mevcut repo durumu ayrıca incelenir.

## 4. Görseller — tamamlanan iş

- Yeni XML yalnızca 958 medya kaydı içeriyor; 323 farklı görsel adresi var. Bunlar önceki exporttaki aynı 323 adres; XML görsellerin dosya içeriğini taşımıyor.
- Kullanıcı indirme talimatı verdi. **323 görselin tamamı indirildi, başarısız indirme yok.** Toplam **87.003.713 bayt**; dosyaların boyutları ve SHA-256 değerleri manifest ile doğrulandı.
- Dosyalar yukarıdaki `dragoman\cloner\images` klasöründe. Kaynak basenamesine URL hash eki eklenmiş dosya adları var; eşleştirme manifestte.
- Henüz konu/kalite/kırpım açısından bütün görseller görsel olarak değerlendirilmedi. Yerleşim ve nihai yayın görsel seçimi yapılmadı. Gereksiz yere yeniden indirme yapma.
- Eski analizlerdeki “gerçek görseller yerelde yok” cümleleri 26 Ekim durumudur; yeni indirme kaydını esas al.
- WordPress içerik analizi: 49 sayfa, 25 yazı, 11 ürün, 3 blok = 88 içerik kaydı. 11 ürün kaydı dört kitabın/baskının dil sayfalarıdır; 11 bağımsız ürün sayılmaz. Eski içerikler taslak kaynak, otomatik yayın onayı değil.

## 5. Kabul edilmiş temel yön

- Modern, temiz, yalın, kolay erişilebilir **neat/lean** arayüz. Mevcut logo korunur. Görsel ölçü/font/ton/kırpım ve küçük etkileşimleri Claude Code bütünlük içinde seçer; her ayrıntı için soru sormaz.
- Slogan aynen: **Once a Dragoman, always a Dragoman.** Kesin konumu kullanıcı tarafından seçilmedi; sloganı değiştirme veya kendiliğinden çevirme.
- Ana sayfanın önceliği bütün etkinlikler. Beş kategori: Dalış, Deniz Kanosu, Doğa Aktiviteleri, Ulaşım ve Konaklama, Mağaza.
- Fotoğraf temelli üç etkinlik açılışı; devamında Ulaşım/Konaklama + Mağaza, öne çıkanlar, Neden Dragoman, Google yorumları, blog, iletişim/footer. Menü ve detay yerleşimi V6'daki gibi.
- Cankurtarma Dalış altında ayrı sayfa. Hizmetin devamı geçici çalışma varsayımı; güncel eğitim kapsamı sonra doğrulanacak.
- SSS kesin; etkinlik detayında düzenlenebilir, taranabilir soru-cevaplar. Google'da özel görünüm/sıralama garantisi yok.
- İçerik girişi başlık, metin ve fotoğraflarla blog tarzı sade. Gerekli fiyat/süre/kategori/SSS gibi işlevsel alanlar korunur. **Ayrı panel önizlemesi, ek süre/deneyim filtresi, serbest sayfa kurucu veya gelişmiş form tasarım ürünü yok.**
- Şablonlar boş olmayacak: uygun `cloner` metin ve gerçek görselleri kullanılır; eksikler mockup içerikle tamamlanır. UBT nihai metin/fiyat/ürün bilgilerini sonra değiştirir. Örnek içerikler canlıya/indekse çıkmaz.
- İlk etkinlik talebi: etkinlik otomatik seçili; ad-soyad, e-posta, tercih edilen tarih ve kişi sayısı zorunlu; telefon/mesaj isteğe bağlı. Form içeriği ve alanlar sonradan düzenlenebilir.
- Ulaşım/Konaklama için de **talep formu kabul edildi**; mockup alanlarla başlanacak, nihai bilgileri UBT müşteriden alacak. Artık “form mu yalnız WhatsApp mı?” sorusu açık değil. Bağımsız doğrudan satış kararı eklenmedi.

## 6. Geliştirme sırası ve fazlar

1. Claude Code önce bütün kapsam içi ziyaretçi **sayfa türlerini dolu örneklerle** hazırlar. Bütün eski içeriklerin tek tek aktarılması ilk tasarım teslimini bekletmez.
2. UBT genel görünümü değerlendirir; tasarım düzeltmelerini topluca ele alır. Bu değerlendirme atlanmaz, sessizlik onay sayılmaz.
3. Ardından yönetim paneli, kalıcı form kayıtları, bildirimler ve gerekli servis bağlantıları tamamlanır.
4. İlgili yayın aşamasında gerçek içerik/dil onayları, güvenlik, veri işleme, servis erişimleri ve işletme kabulü tamamlanır. Mockup test başarısı gerçek servis testi veya yayın onayı değildir.
5. POS/e-Fatura ve diğer gelişmiş işler mevcut sonraki faz sınırında kalır. **Ödeme araştırmasını şimdi yapma.** POSNET entegrasyonu kolaysa aday; kolaylığı doğrulanmış değil. iyzico otomatik yedek değil; sağlayıcı seçilmedi.

Önceki teknoloji referansı React/TypeScript/Vite/Tailwind/Supabase/PostgreSQL ve yardımcı araçlar; V6 Bölüm 10.1'de. Kaynak eski repo hakkındaki önceki “Teknolojileri söyle” sohbeti. Yeni uygulama veya kesin sürüm pinleri varmış gibi davranma; teknoloji hiç verilmemiş gibi sıfırdan sorma. SEO ilk HTML gereğiyle uyum çözümü uygulama başında açıklanacak; otomatik Next.js geçişi varsayılmayacak.

TR/EN/FR/DE; kaynak Türkçe, DeepL Free API taslak ve her dilde bağımsız insan onayı. Ayrıntılı çeviri, rol/2FA, yedek, bildirim, fiyat/kur ve ödeme kuralları V6'da; bu özet bunların yerine geçmez.

## 7. Sağlık formu — kesinleşen bütün son kararlar

Kaynak PDF tek sayfalık **Dragoman Dalış ve Outdoor Merkezi Sağlık Belgesi**. Metin ve görsel sayfa okundu; özgün dosya projeye değiştirilmeden kopyalandı. PDF SHA-256: `3efdb39a81fb3db1da131c13e95f0223537e441b59bf7f05b8e0ab93480a301e`.

Üç ana soru, 45 yaş üstü sorusuna bağlı üç alt madde ve 29 geçmiş/mevcut durum maddesi var; envanterde **SF01–SF35**. Ayrıca katılımcı ve veli/vasi için ad-soyad, tarih ve imza alanları var. Basılı yanıt çizgileri mevcut; dijital Evet/Hayır seçimi sonraki UBT kararıdır.

1. **Kapsam:** Kullanıcı PDF'yi Dalış ve Outdoor için verdi. Devam sohbetinde kabul: Dalış ve Outdoor başlangıçta aynı içerikle, veritabanında ayrı kimlikli ve bağımsız sürümlenen iki form kaydı olarak hazırlanır. Etkinlikte form seçimi sunulur; bir formun düzenlenmesi diğerini etkilemez. Outdoor içeriği daha sonra farklılaştırılabilir. Bunu kendiliğinden Deniz Kanosu veya bütün kategorilere genişletme.
2. **Ayrı aşama:** İlk kısa rezervasyon talebinde sağlık sorusu yok. İlgili her katılımcı kendi güvenli bağlantısından ayrı sağlık formu doldurur.
3. **Gönderim zamanı:** İlk talepte bağlantı gönderilmez. Ekip etkinlik ve tarihi müşteriyle teyit ettikten sonra bağlantılar gönderilir. Yalnızca İşleme Alındı olması veya ileride ödeme yapılması teyidin yerine geçmez. Etkinlik/tarih teyidi sağlık uygunluğu veya kesin katılım onayı değil.
4. **Yanıtlar:** Evet/Hayır; yeni formda hiçbir yanıt önceden seçili değil. Boş yanıt Hayır sayılmaz. Geçerli zorunlu sorular yanıtlanmadan tamamlandı sayılmaz. Katılımcının daha önce kaydettiği yanıtların düzenlemede görünmesi varsayılan cevap vermek değildir.
5. **Evet halinde:** Herhangi bir Evet yanıtı form gönderimini engellemez; ilgili katılımcı formunda **İnceleme gerekiyor** işareti ve yetkili ekibe bildirim oluşur. Sistem otomatik kabul/ret vermez. Tüm cevaplar Hayır olsa da otomatik tıbbi uygunluk onayı verilmez.
6. **Durumlar ayrı:** İnceleme işareti sağlık formuna aittir; talep takibinin Bekliyor/İşleme Alındı durumlarına yeni bir genel durum eklenmiş sayılmaz. Ödeme ve rezervasyon onay durumları da ayrı.
7. **İmza:** Yanıtlar sitede, **imza etkinlik öncesinde merkezde kâğıt formda**. Gerekiyorsa veli/vasi de kâğıdı imzalar. Siteye imza çizme/elektronik imza hizmeti yok. Çevrimiçi tamamlandı, fiziksel imza alındı demek değil. Otomatik PDF üretimi, tarama/yükleme veya doktor raporu yükleme kendiliğinden kapsam değil.
8. **Grup gizliliği:** Rezervasyon sahibi diğerlerinin yalnızca form tamamlandı/tamamlanmadı durumunu görür. Sağlık yanıtlarını, inceleme işaretini ve ayrıntılarını göremez. İlgili katılımcı ve sağlık erişim yetkisi olan Dragoman ekibi erişebilir. Rezervasyon sahibi kendisi katılımcıysa kendi formuna erişir. Bu sınır API/veri/doğrudan bağlantıda da uygulanır.
9. **Yanıt düzenleme:** Katılımcı gönderimden sonra yanıtı değiştirebilir. Yetkili ekibe yeniden bildirim gider; önceki yanıtlar, sürüm ve değişiklik zamanı korumalı sağlık geçmişinde kalır. Eski inceleme kararı yeni yanıtlara otomatik onay olarak aktarılmaz. Geçmiş diğer rezervasyon sahibine açılmaz.
10. **Veri sızıntısı önlemi:** Sağlık yanıtları e-posta gövdesine, analitiğe veya genel audit log'a yazılmaz. Bildirim güvenli panele yönlendirir; sağlık geçmişi ayrı korumalı kayıttır. Saklama/silme ve hukuki metinler ilgili gerçek kullanımdan önce netleştirilecek.

Bu kararlar V6 Bölüm 6.1, sağlık formu gereksinimleri ve uygulama rehberinin **E07/E08 ek kontrollerine** işlendi. Soru envanteri hazırlanmış olsa da dijital sağlık formu geliştirilmedi; E2E senaryoları yazıldı, uygulama testleri çalıştırılmadı.

## 8. Halen gerçek bilgi veya karar gerektirenler

Şablon geliştirmeyi bekletmeyen içerik bilgileri: nihai ürün listesi, fiyat/stok/tarih, metin/fotoğraf seçimleri, eğitim kapsamı ve onaylı çeviriler. Mockup ile ilerlenir; UBT sonra doldurur.

Sağlık özelinde açıklar:

- **Kesinleşti:** Dalış ve Outdoor ayrı veritabanı kayıtlarıdır; başlangıç içeriği aynıdır. Etkinlikte sağlık formu seçilir. İçerik ve sürümler bağımsızdır; geçmiş yanıtlar form kimliği/sürümüyle korunur. Outdoor içeriği daha sonra farklılaştırılır; bu konu geliştirme engeli değildir.
- SF03 yaş/alt risk maddelerinin koşullu gösterimi; SF13 “Kapalı veya açık yerlerde bulunmama” gibi kaynakta belirsiz ifadelerin onaylı karşılığı. Tıbbi anlamı tahmin ederek değiştirme.
- Gerçek inceleme yetkilileri ve işletmenin değerlendirme koşulları; gerekiyorsa doktor değerlendirme süreci. Herhangi bir Evet için inceleme işareti kuralını tekrar sorma.
- Reşit olmayanlarda ayrıntılı veli/vasi temsil ve erişim süreci. Rezervasyon sahibi olmak otomatik temsil yetkisi sağlamaz; kâğıt imza yöntemi zaten seçildi.
- Sağlık verisi saklama/silme, veri işleme metinleri ve dört dilin onayı.
- **Devam sohbetinde kabul edilen grup alıcı kararı:** Dragoman etkinlik/tarih teyidi sırasında diğer katılımcıların ad-soyad ve e-postalarını alıp talebe ekler; sistem her katılımcının güvenli bağlantısını kendi e-postasına gönderir. İlk talep formu sade kalır. Karar V6, sağlık gereksinimleri ve E07 kontrolüne işlendi. Gönderim arayüzünün kesin biçimi ayrıca seçilmedi; uygulayıcı sade tasarım ilkesini korur.

Diğer bağlantılar/yayın: gerçek hosting/veritabanı, e-posta, DeepL, Google yorum ve ölçüm erişimleri; olası maliyet onayları; yasal metinler; yayın kabulü. Ücretli servis veya canlı değişiklik onayı varsayma. POS ve e-Fatura seçimi/araştırması hâlâ ertelenmiş.

## 9. Yeni sohbette önerilen devam

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

**Talep başına tek etkinlik — 31 Ekim 2026, UBT kabulü:** Her etkinlik talebi veritabanında tek bir etkinlik kaydıyla ilişkilendirilir. Aynı etkinliğin seçeneklerine göre kişi dağılımı tek talepte tutulabilir; başka bir etkinliğin seçenekleri bu talebe eklenmez. Ayrı dalış ve deniz kanosu etkinlikleri isteyen ziyaretçi iki ayrı talep gönderir. Önceden tanımlanmış çok aktiviteli hazır paket, kendi bağımsız etkinlik kaydı üzerinden tek talep olarak alınır; paketin içerdiği aktiviteler kendiliğinden ayrı talepler oluşturmaz. İlk etkinlik talebi aşamasına çok etkinlikli sepet veya birleşik rezervasyon akışı eklenmez. Bu karar Mağaza veya sonraki ödeme fazının mevcut kapsamını değiştirmez.

**Talep formunda fiyat özeti — 31 Ekim 2026, UBT kabulü:** Sayısal fiyatı bulunan etkinlik seçeneklerinde talep formu seçilen seçeneklerin kişi sayısı ve birim fiyatını satır satır, hesaplanan toplamla birlikte gösterir. Örnek: 2 yemekli × 60 EUR + 2 yemeksiz × 45 EUR = 210 EUR. Özet, talep anındaki hesap olarak etiketlenir; kesin fiyatın Dragoman tarafından teyit edileceği belirtilir. Seçenek adetleri değişince özet güncellenir. Kişi başına fiyatın geçerli olduğu örnekte adet × birim fiyat kullanılır; farklı kişi/paket fiyat temelleri veya para birimleri doğrudan toplanmaz, mevcut onaylı fiyat/kur kuralları uygulanır. “Fiyat talep üzerine” etkinliklerde toplam gösterilmez; eksik fiyat sıfır sayılmaz ve hesaplanamayan toplam uydurulmaz. Sayısal fiyatlar ve hesaplanan özet sunucuda doğrulanır; istemciden gelen tutar doğru kabul edilmez. Talep anındaki seçenek, adet, birim fiyat/para birimi ve hesaplanmış özet korunur; sonraki fiyat değişiklikleri eski talebi değiştirmez. Bu özet tahsilat, kesin fiyat veya rezervasyon onayı değildir.

**Kategori içi elle sıralama — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı kategori sayfasındaki alt grupların sırasını ve her alt grup içindeki etkinlik kartlarının sırasını panelden elle değiştirebilir. Sıralama veritabanında ilgili kategori/alt grup ilişkisiyle kalıcı tutulur ve ziyaretçi sayfasında uygulanır; alfabetik veya eklenme tarihi sırası zorunlu değildir. Aynı sıralama mevcut dört dilde ilgili yayınlanmış içeriklere uygulanır; ayrı dil sıralama ürünü eklenmez. Bir kategori veya alt gruptaki sıralama değişikliği diğerlerini etkilemez. Arşivli veya yayın onayı olmayan içerik sıralama nedeniyle görünür hale gelmez. Panelde sıralama işleminin kesin kontrol biçimini uygulayıcı sade yönetim ilkesiyle belirler.

**Etkinlik arşivleme — 31 Ekim 2026, UBT kabulü:** Yetkili kullanıcı panelden artık sunulmayan etkinliği arşivleyebilir. Arşivlenen etkinlik ziyaretçi kategori listeleri, kartları ve öne çıkan seçimlerinin yayındaki çıktılarından kaldırılır. İçerik, seçenekler ve mevcut taleplerle ilişkiler veritabanında korunur; arşivleme silme değildir. Arşivlenmiş etkinlik için yeni talep kabul edilmez; eski talepler yetkili panelde kendi kayıtlarıyla okunabilir. Etkinlik tekrar yayına alınabilir; mevcut yetki, dil onayı ve yayın koşulları yeniden uygulanır. Eski detay URL adresinin karşılığı, mevcut SEO-02 ve yönlendirme kurallarına göre belirlenir; arşivleme alakasız ana sayfa yönlendirmesi veya mevcut talep verilerinin silinmesi anlamına gelmez.

**Gün gün tur programı — 31 Ekim 2026, UBT kabulü:** Çok günlük etkinliklerde panelden sıralı program maddeleri eklenebilir; her madde gün başlığı ve açıklama içerir (örneğin 1. Gün, 2. Gün). Maddeler ilgili etkinliğe bağlı ayrı kayıtlar olarak tutulur; sıraları korunur ve mevcut dört dil/onay kuralları uygulanır. Etkinlik detayındaki ortak şablon bu programı gün sırasıyla gösterir. Günlük turda veya program girilmeyen etkinlikte boş program bölümü ve başlığı gösterilmez. Program düzenlemek yeni sayfa tasarımı veya kod değişikliği gerektirmez; serbest sayfa kurucu kapsamı oluşturmaz.

**Fiyat talep üzerine — 31 Ekim 2026, UBT kabulü:** Panelde etkinlik için “Fiyat talep üzerine” fiyat gösterim biçimi seçilebilir. Bu durumda kategori kartında ve detay sayfasında sayısal tutar yerine ilgili dilde bu ifade gösterilir; boş fiyat sıfır veya ücretsiz olarak yorumlanmaz. Ziyaretçi aynı etkinlik talep formundan tarih ve kişi sayısını, varsa seçeneklere göre kişi dağılımını iletir. Talep ilgili etkinlik ve seçeneklerle kaydolur; yeni bir teklif formu veya ayrı iş akışı gerekmez. Bu fiyat biçimi seçiliyken kartta “başlayan” tutarı hesaplanmaz ve kesin toplam uydurulmaz. Veri modelinde bu fiyat biçimi sayısal fiyat gösteriminden ayırt edilir. Sayısal fiyat veya “başlayan” gösterimi kullanılan etkinlikler için önceki kurallar korunur; talep gönderimi kesin fiyat, müsaitlik veya rezervasyon onayı değildir.

**Seçenekli etkinlikte kart fiyatı — 31 Ekim 2026, UBT kabulü:** Bir etkinlikte birden fazla fiyat seçeneği varsa kategori kartında sunulan seçeneklerin en düşük geçerli fiyatı, kişi/paket gibi fiyat temelini koruyarak, ilgili dilde “45 €’dan başlayan” biçiminde gösterilir. Detay sayfasında bütün sunulan seçenekler kendi fiyat ve açıklamalarıyla gösterilir. Kart tutarı ilgili seçeneklerden türetilir; seçeneklerden kopuk ayrı bir tutar girilmez. Farklı para birimleri veya kişi/paket temelleri doğrudan sayısal olarak karşılaştırılmaz; mevcut onaylı fiyat/kur kuralları korunur. Fiyatı bilinmeyen seçenek sıfır tutar sayılmaz. Bu gösterim kesin rezervasyon veya ödeme onayı değildir.

**Grup talebinde seçenek dağılımı — 31 Ekim 2026, UBT kabulü:** Bir etkinlik için birden fazla seçenek sunuluyorsa grup talebinde her seçeneğe kişi sayısı atanabilir; örneğin dört kişiden ikisi yemekli, ikisi yemeksiz olabilir. Seçenek adetleri sıfır veya pozitif tam sayı olmalı ve toplamları talebin kişi sayısına eşit olmalıdır. Sıfır adet seçilmeyen seçenek anlamındadır; negatif/kesirli adet veya toplam uyumsuzluğu geçerli talep olarak kaydedilmez. İlk kısa talepte bu dağılım için katılımcı adları istenmez. Talep, etkinliğe bağlı seçenekler ve her birinin kişi sayısını korur; önceki seçenek kimliği ve talep anındaki ad/fiyat/para birimi bilgilerini koruma kuralı her seçenek satırında geçerlidir. Seçeneksiz etkinlikte seçenek dağılımı istenmez. Bu dağılım kesin rezervasyon, müsaitlik veya tahsilat onayı değildir.

**Etkinlik seçenekleri — 31 Ekim 2026, UBT kabulü:** Aynı etkinliğin yemekli/yemeksiz veya ekipmanlı/ekipmansız gibi seçenekleri ayrı etkinlik sayfaları oluşturmaz. Seçenekler ilgili etkinlik kaydına bağlı, ayrı kimlikli kayıtlar olarak yönetilir; tek detay sayfasında kendi açıklama ve fiyatlarıyla gösterilir. Seçenek sunulan etkinlikte müşteri talep gönderirken tercihini seçer ve seçim ilgili talebe kaydedilir. Seçenek kimliği ile talep anındaki ad/açıklama ve gösterilen fiyat/para birimi bilgisi korunur; sonraki seçenek veya fiyat düzenlemesi eski talebin anlamını değiştirmez. Bu seçim kesin müsaitlik, rezervasyon veya ödeme onayı oluşturmaz; mevcut fiyat ve faz kuralları geçerlidir. İlk talebin kabul edilmiş alanlarına yalnızca ilgili etkinliğin seçenek seçimi eklenir; sağlık bilgisi bu aşamaya taşınmaz. Yeni bir gelişmiş ürün yapılandırma aracı kapsamı oluşturulmaz.

**Deniz kanosu içerik kaynağı — 31 Ekim 2026, UBT kararı:** Deniz kanosu etkinliklerinin başlangıç envanteri ve içeriklerinde https://dragomanseakayak.com/tr/ ve ilgili tur/deneyim detay sayfaları esas alınır. Eski dragoman-turkey.com/sea-kayak/ sayfasıyla ad, süre, rota veya program çelişirse bu kaynak önceliklidir; aynı turun eski ve yeni anlatımı iki ayrı etkinlik olarak çoğaltılmaz. Kaynak seçimi bütün metin/fiyatların otomatik yayın onayı değildir; mevcut taslak, dil onayı ve yayın kabulü kuralları korunur. Deniz Kanosu başlangıç listesi: günlük Kekova Klasik, Kekova Batı, Kekova Doğu; çok günlük Kekova Körfezi (2 gün/1 gece), Işık Kıyısı (4 gün/3 gece), Kekova Deniz Kayağı & Gulet Turu (7 gün/6 gece), Likya Kayak & Konfor Kaçamağı (7 gün/6 gece), Karia Kıyısı (7 gün/6 gece); ayrıca TRAK Signature Deneyimi ayrı deneyim kaydıdır. Özel/kişiye özel tur sayfası programı müşteriye göre hazırlanan teklif hizmeti için kaynak olur; buradaki genel ifadelerden yeni adlandırılmış Outdoor ürünleri uydurulmaz. Outdoor için mevcut ayrı etkinlik envanteri korunur; yeni kaynakta karşılığı bulunmaması silme gerekçesi değildir.

**30 Ekim devam kararı:** 

1. Bu handover'ı ve V6'yı esas al. Sağlıkla ilgili devam için gereksinim belgesinin Bölüm 5–6'sını ve rehberde E07/E08 eklerini oku.
2. Kullanıcı isterse tek tek kalan gerçek iş akışı sorularını sor; yukarıdaki kabul edilmiş soruları yeniden açma. Grup bağlantılarının alıcısı devam sohbetinde kararlaştırıldı; aynı soruyu yeniden açma. Kullanıcının güncel yönlendirmesine göre layout/veri ilişkilerinden devam et; sağlık ayrıntı sorularını kendiliğinden yeniden açma.
3. Her kabulü brief + ilgili gereksinim + E2E kontrolünde tutarlı güncelle. Kaynak PDF'yi, eski briefleri ve Ek A'yı değiştirme.
4. Kullanıcı yeni sürüm isterse ayrıca sürümle; kendi başına V7 kaydedildi deme. Güncel çalışma V6.
5. Ödeme araştırmasına veya site kodlamaya otomatik geçme. Kullanıcı dokümantasyonu Claude Code'a verecek.

## 10. Bu oturumda doğrulananlar

- İndirilen 323 görsel: boyut ve SHA-256 doğrulaması başarılı; görsel uygunluk seçimi henüz yok.
- Kaynak PDF kopyası: SHA-256 doğrulandı; tek sayfa görsel/metin incelemesi yapıldı; 35 soru/alt madde kaydedildi.
- Belge bağlantıları ve E01–E17 senaryo numaraları kontrol edildi. E07/E08'e son sağlık akışı kontrolleri eklendi.
- Ek A metninin SHA-256 değeri: `6e3d9fe12bc2291c3ebedc8f54535f49667039a3f1f9a4f174bff5827a67571c` (UTF-8 metin, standart satır sonları). 50 müşteri yanıtı korundu.
- V5 SHA-256: `44031a4204f725493cf1550540fff01390205acc6fe81dfe1e0303adfd5a2bd8`; önceki sürüm değişmedi.
- Kontroller dokümantasyon/dosya bütünlüğü kontrolleridir. Çalışan site, gerçek form gönderimi, ödeme, e-posta entegrasyonu veya E2E uygulama testi yapılmadı.


