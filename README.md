# Dragoman yeni web sitesi

**Yeni sohbette başlangıç:** [29 Ekim güncel handover](./claudeguides/Dragoman_Handover_2026-10-29.md). Son sağlık formu kararları, görsel kaynakları, Claude Code rehberi ve devam noktaları bu belgededir. Esas kapsam belgesi V6'dır.

- GitHub: https://github.com/ubterzioglu/dragomanew
- Yerel çalışma klasörü: `C:\temp_private\dragomanew`
- Hedef MVP yayını: **1 Aralık 2026**

## Güncel durum — 1 Kasım 2026

- **Aşama A ziyaretçi sitesi hazır ve önizlemede:** [notyetbro.club](https://notyetbro.club/) (arama motorlarına kapalı; metin, görsel ve fiyatlar örnek). Kod `app/` altında: React 19, TypeScript, Vite, Tailwind CSS 4. `vite-react-ssg` dört dilde 197 sayfayı önceden üretilmiş HTML olarak çıkarır.
- **Geliştirme:** `app/` klasöründe `npm ci`, sonra `npm run dev`. Her değişiklikten sonra `npm run verify` (tip denetimi, lint, birim testleri, build, bağlantı denetimi, uçtan uca testler).
- **Yayın:** `main` dalına push, ardından Coolify'da Redeploy. Ayrıntı: [app/deploy/KURULUM.md](./app/deploy/KURULUM.md).
- **Açık olanlar:** müşteri kararları ve teyit bekleyen içerik (fiyatlar, görsel hakları, ekip, yorumlar, yasal metinler), eksik görseller, kalıcı alan adına geçiş. Aşama B (Supabase formları, yönetim paneli, bildirimler) henüz başlamadı.

Aşağıdaki bölümler dokümantasyon aşamasının (26–29 Ekim 2026) kaydıdır.

## Çalışma ve teslim yöntemi

UBT, dokümantasyon tamamlandığında belgeyi **Claude Code'a vererek uygulamayı geliştirecek**. Bu oturumun kapsamı brief, içerik envanteri, layout kararları ve uygulanabilir devir dokümantasyonunu tamamlamaktır. Görsel taslak veya çalışan site hazırlığı bu aşamanın sonraki adımı olarak varsayılmaz. Nihai uygulama belgesi, kesin kararları, geliştiricinin önerebileceği ayrıntıları ve müşteri kararı bekleyen konuları açıkça ayırmalıdır. V4 kapsam kaydı korunur; tamamlanan dokümantasyon Claude Code için tutarlı bir başlangıç noktası sağlamalıdır.

**Güncel birleştirilmiş çalışma belgesi:** [Dragoman_Proje_Brief_V6.md](./claudeguides/Dragoman_Proje_Brief_V6.md). Dokümantasyon devam ediyor. V5 ve V4, önceki sürümler olarak değiştirilmeden korundu.

**Geliştirme sırası — 29 Ekim 2026:** Önce ziyaretçinin göreceği bütün kapsam içi sayfa şablonları, uygun `cloner` kaynakları ve eksikleri tamamlayan mockup içeriklerle dolu hazırlanacak. UBT genel görünümü değerlendirip toplu tasarım düzeltmelerini ele aldıktan sonra yönetim paneli, form kayıtları ve bildirim bağlantıları tamamlanacak. Nihai içerikleri UBT daha sonra güncelleyecek. Kesin etkinlik/yazı listesi bu ilk aşamayı bekletmez; içerik, dil, test ve yayın onayları ilgili yayın aşamasında tamamlanır. Ayrıntılar V6 Bölüm 1.1, 4.8 ve 11'de.

**Son sadelik kararları:** Başlık, metin ve fotoğraflarla blog tarzı içerik girişi; ayrı panel önizlemesi ve ek etkinlik filtreleri yok. İlk etkinlik formu başlangıç alanlarıyla, Ulaşım/Konaklama talep formu mockup alanlarla hazırlanacak; formlar sonradan düzenlenebilir. Marka sloganı: **Once a Dragoman, always a Dragoman.**

**Tasarım ilkesi:** Modern, özenli, temiz ve yalın (neat/lean) bir arayüz; ziyaretçinin etkinlik bulma, bilgi edinme, rezervasyon talebi ve iletişim görevlerine kolay erişim. Kabul edilmiş yerleşim kararları korunur; kesin görsel ölçüler ve küçük etkileşim ayrıntıları bu ilkeye göre uygulayıcı tarafından tasarlanır. Ayrıntılar [layout kararlarında](./claudeguides/Dragoman_Layout_Kararlari.md).

**Önceki teknoloji bilgisi:** “Teknolojileri söyle” sohbetindeki eski `ubterzioglu/dragoman` repo incelemesinde React, TypeScript, Vite, Tailwind CSS ve Supabase/PostgreSQL listesi bulunuyor. Bu referans güncel V6 Bölüm 10.1'de korunuyor; teknoloji bilgisi hiç verilmemiş gibi yeniden seçim sorulmaz. Yeni repo uygulaması ve güncel sürümler henüz doğrulanmış değildir; SEO ilk HTML gereği ve güncel DeepL/dört dil kararları korunur.

## Devam ederken okunacaklar

**Claude Code'a devir:** Önce [Brief V6](./claudeguides/Dragoman_Proje_Brief_V6.md), ardından [uçtan uca uygulama rehberi](./claudeguides/Dragoman_Claude_Code_Uygulama_Rehberi.md) okunur. Rehber; soru sormadan verilebilecek kararları, mockup ile ilerleme sınırlarını, kaynak yollarını, geliştirme sırasını ve E01–E17 senaryolarını tek yerde toplar. V6 kapsam ve iş kuralları için esas belgedir. Sağlık formu dahil kaynak dosyalar da erişilebilir olmalıdır; tek başına GitHub adresi bütün yerel kaynakların mevcut olduğu anlamına gelmez.

**Katılımcı sağlık formu — 29 Ekim 2026:** UBT'nin Dalış ve Outdoor için verdiği PDF alındı. [Soru/alan envanteri ve uygulama gereksinimleri](./claudeguides/Dragoman_Saglik_Formu_Gereksinimleri.md), [kaynak PDF](./claudeguides/sources/forms/try-saglik-formu-tr-21.pdf) ve V6 Bölüm 6.1 birlikte okunur. Bu form ilk kısa rezervasyon talebinden ayrıdır; Sağlık soruları siteden yanıtlanır; katılımcı ve gerekiyorsa veli/vasi etkinlik öncesinde merkezde kâğıt formu imzalar. Sitede imza çizme yoktur. Evet/Hayır yanıtlarının hiçbiri yeni formda önceden seçili gelmez; boş yanıt Hayır sayılmaz. Outdoor'da dalışa özgü metinlerin kullanımı ve koşullu alt maddeler ayrıca netleştirilecektir.

1. [Devir belgesi](./claudeguides/Dragoman_Handover_2026-10-26.md) — proje bağlamı, fazlar, bağımlılıklar ve yeni repo notu.
2. [Proje briefi V6](./claudeguides/Dragoman_Proje_Brief_V6.md) — güncel kapsam, şablon geliştirme sırası, kabul edilen layout, SEO/GEO, teknoloji referansı ve ödeme notlarının birleştirilmiş kaydı. [V5](./claudeguides/Dragoman_Proje_Brief_V5.md) ve [V4](./claudeguides/Dragoman_Proje_Brief_V4.md) önceki sürümler olarak korunur.
3. [Layout kararları](./claudeguides/Dragoman_Layout_Kararlari.md) — kabul edilen ilk ekran, ana kategoriler, üst menü, ana sayfa akışı, kategori ve etkinlik detay şablonları; dört temel layout önerisi de kabul edildi.
4. [WordPress içerik analizi](./tmp/cloner/analysis/Dragoman_WordPress_Analizi.md) — eski sitenin içerik, dil, ürün ve medya envanteri; layout için yeni bulgular.
5. [Ödeme kararları](./claudeguides/Dragoman_Odeme_Kararlari.md) — sağlayıcı seçimi açık; POSNET entegrasyonu kolaysa aday, iyzico dışı alternatiflerin araştırılması sonraya bırakıldı.
6. [SEO/GEO araştırması — 26 Ekim 2026](./claudeguides/Dragoman_SEO_GEO_Arastirma_2026-10-26.md) — güncel resmî kaynaklar, bulgular ve V6'da korunan SEO-01–SEO-15 / GEO-01–GEO-03 gereksinimleri; K7a–K7h kabul ölçütleri.

V3 ve ilk brief kaynak/önceki sürüm olarak korunur. İlk briefin görsel eki `claudeguides/Dragoman_Proje_Brief_assets` klasöründedir.

## Son durum — 29 Ekim 2026

Yeni repo başlangıcında uygulama kodu bulunmuyor. Mevcut çalışma belgeleri buraya devam amacıyla kopyalandı. İlk ekran için üç fotoğraflı etkinlik düzeni, üst menü, ana sayfanın bölüm sırası, kategori ve etkinlik detay şablonları kabul edildi. Masaüstünde yardımcı/ana satır; mobilde logo, dil seçimi ve açılır menü kullanılır. Kategori sayfalarında kapak, kısa tanıtım, gruplar ve etkinlik kartları bulunur; mağazada kitap kartları, ulaşım/konaklamada iki bölüm kullanılır. Etkinlik detayında solda galeri/içerik, sağda kaydırmada görünür bilgi/talep kutusu; mobilde tek sütun ve sabit işlem alanı kullanılır. Cankurtarma Eğitimleri, Dalış menüsü altında ayrı sayfa olarak yer alır. Şablonlar mevcut kaynak ve mockup içeriklerle doldurulacak; nihai görseller, metinler, alt gruplar ve güncel eğitim kapsamı yayın öncesinde tamamlanacak. Görsel ayrıntılar kabul edilen ilkelerle uygulayıcı tarafından hazırlanacak.

WordPress kaynakları [cloner](./tmp/cloner/README.md) altında düzenlenip analiz edildi. 49 sayfa, 25 yazı, 11 ürün ve 3 blok kaydı var. 29 Ekim'de medya exportundaki 323 farklı görselin tamamı `C:\temp_private\dragoman\cloner\images` klasörüne indirildi; başarısız indirme yok. Kaynak adresi/dosya eşleştirmesi aynı klasörün üstündeki `media-download-manifest.json` dosyasında bulunuyor. Gerçek görsel klasörü `dragoman`, bu dokümantasyon klasörü ise `dragomanew` altındadır. Ham kaynaklar, çıkarılmış içerik ve yedek kopyalar kök `.gitignore` ile yerelde tutuluyor. Uygulamaya içerik aktarımı henüz yapılmadı.

**İlk teslim sınırı:** V6 Bölüm 1.2, Claude Code'un kaynak yollarını ve dolu şablon teslimini tanımlar. Her eski içeriğin aktarılması ilk tasarım değerlendirmesini bekletmez; tüm kapsam içi sayfa türleri temsil edilir.

SEO/GEO gereksinimleri 26 Ekim 2026'da güncel Google, Microsoft/Bing, OpenAI ve diğer birincil belgelerle araştırılıp V5 Bölüm 9'a işlendi. Dil algılama kuralı sabit dil URL'lerini koruyacak şekilde netleştirildi; yapısal veri, bot/eğitim ayrımı, AI görünürlük raporları ve performans hedefleri belgelendi. Canlı hesap/performans denetimi yapılmadı. Ödeme sağlayıcısı araştırması ertelenmiş olarak kalır.

Bu belgelerde tarif edilen işlevler uygulanmış veya test edilmiş sayılmaz. Bu hazırlık GitHub'a dosya yükleme veya canlıya yayınlama içermez.

