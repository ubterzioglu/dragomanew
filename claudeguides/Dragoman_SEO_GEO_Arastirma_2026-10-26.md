# Dragoman — Güncel SEO ve GEO araştırması

**Kontrol tarihi:** 26 Ekim 2026  
**Uygulama belgesi:** [Güncel Brief V6, Bölüm 9](./Dragoman_Proje_Brief_V6.md). Araştırma önce V5'e işlendi; aynı gereksinimler V6'da korunur.  
**Amaç:** Claude Code için kaynaklı, uygulanabilir gereksinim ve kabul ölçütleri hazırlamak. Bu çalışma canlı site taraması, Search Console hesabı incelemesi, sıralama testi veya anahtar kelime hacim analizi değildir. Ödeme araştırması ertelenmiş olarak kalır.

## Sonuç ve karar yaklaşımı

Dragoman için öncelik, kabul edilmiş modern/neat/lean arayüzü koruyan güçlü teknik SEO ile gerçek işletme/etkinlik bilgisidir. GEO burada üretken arama yanıtlarında keşfedilmeyi ifade eder; harita/yerel SEO ile aynı terim değildir. Uygulama ayrıntıları V5'e işlendi; bu not kaynak ve güncellik izidir. Gereksinimler yazıldı, henüz site üzerinde uygulanıp test edilmedi.

## Güncel resmî bulgular

| Bulgu | Dragoman'a etkisi | Kaynak |
| --- | --- | --- |
| Google'ın 2026 AI rehberi SEO temelini kullanıyor; özel AI şeması ve llms.txt zorunluluğu yok. | Önce içerik, indeksleme ve doğru veri; kanıtlanmamış GEO dosyaları yayın şartı değil. | [AI optimizasyon rehberi](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) |
| Search generative AI katılımı Search Console'da ayrı kontrol ediliyor. | Mülk ve devralınan tercih kontrol listesine girdi; eğitim/robots ile karıştırılmıyor. | [Katılım kontrolü](https://support.google.com/webmasters/answer/16908024) |
| Google AI gösterimleri için ayrı rapor var; yeterli gösterim yoksa rapor görünmeyebilir. | Sadece eski “tümü Web raporunda” yaklaşımına dayanılmıyor; veri yokluğu kaydediliyor. | [Generative AI performance](https://support.google.com/webmasters/answer/16984139) |
| Bing atıfları ölçüyor; 13 Ekim 2026'da Topics Portfolio beta duyuruldu. | Atıf ile ziyaret/sıralama ayrı tutuluyor, beta erişimi şart koşulmuyor. | [AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/), [Topics Portfolio](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/) |
| OAI-SearchBot arama, GPTBot eğitim amacıyla ayrı yönetiliyor. | ChatGPT arama erişimi için eğitim izni otomatik açılmıyor. | [OpenAI Docs: crawlers](https://developers.openai.com/api/docs/bots) |
| Google farklı diller için ayrı URL öneriyor; otomatik dil yönlendirmesi keşfi engelleyebiliyor. | Önceki tarayıcı dili algılama kuralı, dil önerisi ve sabit dil adreslerini koruyacak şekilde netleştirildi. | [Çok dilli site rehberi](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) |
| FAQ zengin sonuçları 7 Mayıs 2026'dan itibaren kaldırıldı. | SSS kesin gereksinim olarak kalıyor; amaç yararlı görünür içerik, özel sonuç vaadi değil. | [Google değişiklik kaydı](https://developers.google.com/search/updates#may-2026) |
| İşletmenin kendi sitesindeki kendi yorumları, üçüncü taraf widget ile de gelse LocalBusiness/Organization yıldız sonucuna uygun değil. | Google yorumları görsel içerik olarak gösterilebilir; işletme puanı ürün puanına çevrilmez. | [Review kuralları](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) |

**Kaynak güncelliği:** AI ölçümü ve katılımı için yeni 2026 rehberi/rapor belgeleri, daha genel eski AI sayfasına göre esas alındı. Haziran duyurusundaki 31 Ağustos 2026 güncellemesi raporun genel dağıtımını açıklıyor; gerçek hesap/veri durumu yine uygulamada kontrol edilecek. [Google duyurusu](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports).

## V5'e işlenen uygulama başlıkları

| Alan | Belgedeki karşılığı |
| --- | --- |
| İlk HTML, durum kodları, canonical, sitemap, geçici/özel sayfalar | SEO-01–SEO-06 |
| TR/EN/FR/DE adresler, onaylı dil ilişkileri ve dil seçici | SEO-07–SEO-08 |
| Başlık/açıklama, etkinlik/kitap bilgi alanları ve SSS | SEO-09–SEO-11 |
| İşletme, breadcrumb, kitap ve koşullu etkinlik/tur yapısal verisi | SEO-12 |
| İşletme profili, medya ve performans | SEO-13–SEO-15 |
| Arama/eğitim bot ayrımı, Google katılımı ve içerik yaklaşımı | GEO-01–GEO-03 |
| Google/Bing ve izinli iş sonucu ölçümü, panel alanları | Bölüm 9.8 |
| Yayın kabulü | K7a–K7h |

## Projeye özgü çıkarımlar ve sınırlar

- **Çıkarım:** Yerel exportta Almanca içerik yok; dört dil hedefini karşılamak için metin/çeviri onayı teslimi gerekiyor. Onaysız DE sayfasına hreflang eklemek çözüm değildir.
- **Çıkarım:** Kano turlarının blog türünde, eğitimlerin uzun sayfaların içinde olması yeni sayfa eşleştirmesi ve bağlantı planı gerektiriyor. 85 export adresi tüm gerçek trafik/QR envanteri sayılmaz.
- **Çıkarım:** Yerel arşivde medya dosyası yok. Gerçek fotoğraf edinimi ve boyut/ALT kontrolü, hem tasarım hem görsel keşif için bağımlılık.
- **Proje kararı:** Kamusal içerikte SSR/SSG veya eşdeğer ilk HTML sunumu tercih edilecek. Google'ın yalnızca bu yöntemlerle indekslediği iddia edilmiyor; farklı botların JavaScript kabiliyetleri aynı değil.
- **Saha hedefi:** LCP ≤ 2,5 saniye, INP ≤ 200 ms, CLS ≤ 0,1; yeterli veride cihaz türüne göre 75. yüzdelik. Ön yayın laboratuvar sonucu saha verisiyle eşitlenmiyor. [Eşikler](https://developers.google.com/search/docs/appearance/core-web-vitals), [ölçüm yöntemi](https://web.dev/articles/vitals).
- **Koşullu öneriler:** TouristTrip semantiği ve IndexNow otomasyonu veri/efor uygunsa değerlendirilebilir. Merchant Center, AI rezervasyon protokolü veya ayrı ücretli SEO aracı otomatik MVP kapsamı değil.
- Sıralama, indekslenme veya AI atfı garanti değil. Arama hacmi, mevcut dönüşüm oranı ve canlı performans ölçülmedi; bunlar hakkında sayı üretilmedi.

## Diğer birincil kaynaklar ve kullanım yerleri

| Kaynak | V5'te desteklediği konu |
| --- | --- |
| [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Render ve ilk HTML yaklaşımı |
| [Canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | Tutarlı ana adres sinyalleri |
| [Site geçişi](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | URL eşleştirme, hata/yönlendirme ve saklama |
| [XML sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) | Yayınlanan adreslerin bildirimi |
| [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | Tarama ile indeks/erişim kontrolünün ayrımı |
| [hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions) | Karşılıklı dil ilişkileri |
| [Başlıklar](https://developers.google.com/search/docs/appearance/title-link) | Açıklayıcı title, keyfi karakter zorunluluğundan kaçınma |
| [Snippet](https://developers.google.com/search/docs/appearance/snippet) | Meta açıklaması ve Google gösteriminin ayrımı |
| [Meta etiketler](https://developers.google.com/search/docs/crawling-indexing/special-tags) | Meta keywords'ün Google tarafından kullanılmaması |
| [Spam politikaları](https://developers.google.com/search/docs/essentials/spam-policies) | Manipülatif toplu içerik ve gizli metinlerden kaçınma |
| [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization) | İşletme kimliği ve resmî profiller |
| [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business) | Gerçek işletme bilgileri |
| [TravelAgency](https://schema.org/TravelAgency) | Uygunsa işletme alt türü |
| [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) | Sayfa hiyerarşisi |
| [Product](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) | Doğru kitap/teklif verisi |
| [Event](https://developers.google.com/search/docs/appearance/structured-data/event) | Gerçek tarihli etkinlik uygunluğu |
| [TouristTrip](https://schema.org/TouristTrip) | Google özel sonucu varsayılmadan anlamsal tur tanımı |
| [Yerel sıralama](https://support.google.com/business/answer/7091?hl=en) | Doğru ve güncel işletme profili |
| [Görsel SEO](https://developers.google.com/search/docs/appearance/google-images) | img/picture, gerçek kaynak ve keşfedilebilirlik |
| [IndexNow](https://www.indexnow.org/documentation) | Sonraki fazda isteğe bağlı değişiklik bildirimi |

Kaynaklar resmî/birincil belgelerden seçildi. Bu araştırmada harici hizmete mesaj gönderilmedi, hesap ayarı değiştirilmedi veya yayın yapılmadı. Sonraki uygulamada yeniden değişmiş olabilecek platform özellikleri aynı resmî kaynaklardan kontrol edilmelidir.


