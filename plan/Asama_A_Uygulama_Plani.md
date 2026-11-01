# Dragoman — Aşama A uygulama planı (dolu ziyaretçi şablonları)

> Batch'ler halinde yazılıyor. Token limiti yarıda kesilirse bile her tamamlanmış batch kendi başına kullanılabilir.
> Durum: [x] Batch 1 · [x] 2 · [x] 3 · [x] 4 · [x] 5 · [x] 6 · [x] 7 · [x] 8 · [x] 9 (sorular, en sonda) — TÜM BATCH'LER YAZILDI

---

## UYGULAMA DURUMU (31.10.2026, plan moduna dönüşte güncellendi)

Ayrıntılı kayıt: `tmp/docs/asama-a-ilerleme.md`. Commit/push yok.

> **31.10.2026:** `cloner/` ve `docs/` repo içinde git dışı `tmp/` altına taşındı (`tmp/cloner/`, `tmp/docs/`). Bu plandaki `cloner/…` ve `docs/…` yolları artık `tmp/` önekiyle okunur.

**M0 — BİTTİ.** `app/` kuruldu (React 19.3, Vite 8.3, Tailwind 4.3, TS 7.0, Vitest 5.0, sharp, fontsource Barlow/Barlow Condensed, lucide, zod, RHF, embla). SSG kanıtı geçti: `dist/tr/diving/index.html` içinde başlık, SSS yanıtı, iç bağlantı ve noindex JS olmadan mevcut.

**M1 — YARIDA.** Bitenler:
- `src/i18n/locales.ts`, `src/i18n/pages.ts` (`localePath`, `pageAlternates`, `assertSafeSlug`)
- `src/i18n/ui/{tr,en,fr,de,index}.ts` (`getUi`, `formatTemplate`), `src/i18n/LocaleContext.tsx`
- `src/lib/siteConfig.ts` (`telHref`, `mailHref`), `src/lib/env.ts`
- `src/styles/app.css` (token + font), `src/components/seo/PageHead.tsx`
- `tests/unit/{pages,ui,siteConfig}.test.ts` → **12/12 geçiyor**

M1'de kalanlar (sırayla):
1. `src/app/routeHandle.ts`: handle tipi `{ locale, alternates, cta? }`.
2. `src/app/routes.tsx`: spike'ı sil; her dil × her sabit sayfa için rota üret; `RootLayout`, `useMatches()` ile handle'ı okur.
3. Layout bileşenleri (`src/components/layout/`): `SampleBanner`, `SkipLink`, `Logo`, `LanguageSwitcher` (4 bağlantı, `hreflang`/`aria-current`), `Header` (iki satırlı masaüstü, Dalış alt menüsü: tüm dalış/Cankurtarma/Kaş dalış noktaları; mobil panel Esc ile kapanır, odak geri döner), `Footer`, `MobileActionBar` (WhatsApp + bağlama göre CTA; mobilde `pb-20`).
4. `scripts/brand-assets.mjs`: logo ve favicon'dan `public/brand/` kullanım kopyaları üretilir (kaynak salt-okunur).
5. `public/robots.txt` = `Disallow: /`; 404 rotası.
6. M4'e kadar sayfa gövdeleri geçici bileşen olacak (`PendingPage`, yalnızca PageHead + h1). M7'de grep ile **0 kalıntı** kontrol edilir.
7. Kapı: `npm run typecheck`, `npm test`, `npm run build` yeşil; 4 dilde başlık/alt bilgi gezilebilir; ilerleme dosyası güncellenir.

**Sonra:** M2 ∥ M3 → M4 → M5 → M6 → M7 → M8 (Batch 7 tablosu geçerli).

### Uygulamada ortaya çıkan sapmalar (onaylı plandan farklar)
| Plan | Gerçekleşen | Gerekçe |
|---|---|---|
| React Router (sürüm belirtilmemiş) | **v6.30.6** | `vite-react-ssg` `react-router-dom/server.js` import ediyor, v7'de bu yol yok (denendi). v6'daki 2 orta seviye açığa karşı önlem: tüm iç adresler `localePath()`'ten üretilir ve `assertSafeSlug` ters eğik çizgi ile `../`'yi reddeder. Hydration verisi build'de üretiliyor. Aşama B'de yeniden ele alınacak. |
| react-i18next | **Tiplenmiş sözlük + `LocaleContext`** | SSG eşzamanlı render ediyor (kuyruk 20); global i18n dil durumu sayfalara yanlış dil basabilir. Eksik anahtar derleme hatası verir. |
| Rotalar `/about/`, `/diving/lifeguard-training/` vb. | **Eski WP slug'ları birebir korunur** | `translation-matrix.csv` + `legacy-menus.csv`: EN `/dragoman/`, TR `/tr/diving/`, `/tr/rezervasyon-ve-iletisim/`, `/tr/cankurtarma-merkezi/` (menüde Dalış altında, adres kökte); FR `/fr/plongee/`… DE için yeni Almanca slug. Ürün: `/product/{slug}/` (EN eski önek). |
| Logo (aranacaktı) | Bulundu: `dragoman-logo-transparent-e95d6bdb5f76.png`, favicon `favicon-512x512-1-463c40e1296f.png` | Renkler: yeşil `#006C50` (birincil), turuncu `#E06C08` (vurgu), metinde turuncu `#A34E00` (AA) |
| Font (seçilecekti) | Barlow + Barlow Condensed (self-host) | Logonun dar geometrik formuyla uyumlu, latin-ext |

---

## BATCH 1 — Bağlam, kapsam, sınırlar, mevcut durum

### 1.1 Bağlam
Dragoman (Kaş/Kekova dalış, deniz kanosu, outdoor) WordPress sitesini yeniden yapıyor. Hedef MVP yayını **1 Aralık 2026**. Başlangıç talimatı (`claudeguides/Dragoman_Claude_Code_Baslangic.md`) şunu söylüyor: **önce yalnızca Aşama A**; UBT dolu şablonları toplu değerlendirdikten sonra panel/kalıcılık/bildirim (Aşama B) başlar. Bu plan yalnızca Aşama A'yı kapsar; B'ye ait hiçbir şey Aşama A'da gerçek çalışmaz.

### 1.2 Okunan kaynaklar (planın dayanağı)
Başlangıç talimatı, Uygulama Rehberi (tamamı), Handover 31 Ekim, Brief V6 (Bölüm 1–5, 9, 10.1), README, Layout_Veri_Iliskileri, Sağlık_Formu_Gereksinimleri, `cloner/analysis` (summary, translation-matrix, legacy-menus, activity-candidates, products, redirect, hero-media). **Henüz okunmadı:** Layout_Kararlari (M4 öncesi okunacak), Servis_Envanteri_Gecis, Odeme_Kararlari, iyzico-posnet özeti (bağlantı aşamasında gerekir, Aşama A'yı bloklamaz).

### 1.3 Mevcut durum (doğrulandı)
- `C:\temp_private\dragomanew`: `claudeguides/`, `cloner/`, `docs/`, `plan/`, `tmp/`, `.git`, `.gitignore`, `README.md`. **Uygulama kodu yok** (package.json yok). Silinecek/ezilecek çalışma yok; yine de ilk adımda `docs/`, `tmp/`, `plan/` içeriği listelenip dokunulmayacak.
- `.gitignore`: `cloner/source|archive|extracted|*.xml` zaten yerelde tutuluyor; `.env*` ignore. Görseller `C:\temp_private\dragoman\cloner\images` (323 dosya doğrulandı) — repo dışı.
- Node v24.13.1, npm 11.8.0 mevcut.
- Not: `cloner/archive/dragoman-icerik1/` içinde `extracted` ile aynı içerik kopyası var; kaynak olarak yalnızca `cloner/extracted` + `cloner/analysis` kullanılır.

### 1.4 Aşama A'da YAPILACAK
Ana sayfa · 5 kategori sayfası · etkinlik/tur/eğitim detayı · Cankurtarma (Dalış altında) · mağaza liste+detay · blog liste+yazı · hakkımızda/ekip · iletişim + yasal sayfalar · Ulaşım ve Konaklama (ayrı iki form) · etkinlik talep formu, ulaşım formu, konaklama formu, katılımcı sağlık formu **örnek görünümleri** · TR/EN/FR/DE · mobil/tablet/masaüstü · klavye erişimi · gerçek çalıştırılmış kontrol sonuçları + ekran görüntüleri.

### 1.5 Aşama A'da YAPILMAYACAK (kesin sınır)
Gerçek kayıt/e-posta/ödeme/canlı yayın · Supabase/Google Auth/panel · DeepL çağrısı (EN/FR/DE metinler örnek) · Zoho · Search Console · Google yorum API'si · Instagram/video aktarımı · etkinlik kopyalama · çok etkinlikli sepet · özel fiyat değişti uyarısı · ayrı panel önizlemesi · ek etkinlik filtreleri · serbest sayfa kurucu · yeni sağlık kararı · ödeme sağlayıcı seçimi · mimariyi başka stack'e taşıma · hosting/DNS değişikliği.
Formlar "ÖRNEK — kayıt/e-posta gönderilmedi" mesajı gösterir; başarı/alındı e-postası taklit etmez.

### 1.6 Kesin sabitler (koda aynen girer)
- Slogan: **Once a Dragoman, always a Dragoman.** (EN aynen, çevrilmez)
- Menü (masaüstü iki satır): yardımcı satır = Hakkımızda · Blog · İletişim · Dil; ana satır = Logo + Dalış · Deniz Kanosu · Doğa Aktiviteleri · Ulaşım ve Konaklama · Mağaza. Mobil: logo + dil + açılır menü + sabit alt şerit (WhatsApp + Rezervasyon/İletişim).
- Ana sayfa sırası (7 bölüm): 3 fotoğraflı açılış → Ulaşım/Konaklama + Mağaza kısayolları → Öne çıkanlar → Neden Dragoman → Google yorumları (temsili) → Son blog yazıları → İletişim/footer.
- İletişim tek kaynaktan (tek `siteConfig`): Dragoman Travel Agency · TÜRSAB A4615 · Uzunçarşı Cad. No:15 Kaş 07580 Antalya · +90 242 836 3614 · +90 533 290 1463 · wa.me/905332901463 · info@dragoman-turkey.com · sosyal bağlantılar (Instagram/Facebook/LinkedIn/YouTube/Maps).
- Deniz kanosu içeriği önceliği: `dragomanseakayak.com/tr/` (çelişkide eski sea-kayak sayfasına üstün). Başlangıç listesi: Kekova Klasik/Batı/Doğu; Kekova Körfezi 2g/1n, Işık Kıyısı 4g/3n, Kekova Deniz Kayağı & Gulet 7g/6n, Likya Kayak & Konfor Kaçamağı 7g/6n, Karia Kıyısı 7g/6n; TRAK Signature Deneyimi.
- Fiyatlar: kaynak fiyat güncel varsayılmaz → UI'da "örnek/doğrulanmadı" etiketi.

### 1.7 Açıkça dokunulmayacak açık kararlar
Çeviri beklerken Türkçe yayın davranışı · ulaşım/konaklamanın Bekliyor/İşleme Alındı akışı · Google yorum veri yöntemi · ödeme sağlayıcısı · Cankurtarma güncel kapsamı · sağlık formu koşullu alt maddeleri. Hepsi "bekliyor" olarak işaretlenir, Aşama A'yı bloklamaz.

---

## BATCH 2 — Mimari ve SEO / ilk HTML yaklaşımı

### 2.1 Teknoloji (V6 §10.1 referansı korunur, yeni stack yok)
React + TypeScript (strict) + Vite + Tailwind CSS v4 + **React Router v6.30** (v7, `vite-react-ssg` ile çalışmıyor) + arayüz metinleri için **tiplenmiş sözlük** (react-i18next değil; gerekçe üstteki sapma tablosunda) + React Hook Form + Zod + lucide-react + Embla Carousel (galeri) + Vitest + Playwright.
**Aşama A'da kurulmayanlar:** Supabase, TanStack Query, Quill/DOMPurify, Framer Motion (gerek kalırsa sonra). Neden: A'da veri statik; gereksiz bağımlılık yok.
Sürümler pin'lenmez; kurulumdan önce güncel kurulum/uyum bilgisi Context7 ile doğrulanır (özellikle Tailwind ve SSG eklentisi sürüm uyumu).

### 2.2 SEO-01 "ilk HTML" çözümü — build-time prerender (SSG)
V6 SEO-01 SPA'nın ilk yanıtında içerik olmamasını kabul etmiyor; "yalnızca istemci metadatası yetmez". Çözüm: **Vite-yerel statik ön-işleme (SSG)**.
- Birincil aday: `vite-react-ssg` (React Router rotalarını build'de HTML'e basar, dil rotalarını destekler). Yedek: kendi `renderToString` prerender betiği (Vite SSR build + rota listesi).
- **Karar M0 spike'ında verilir** (Batch 7): `dist/` içinde `/tr/diving/index.html` vb. dosyalarda başlık, özet, SSS metni ve iç bağlantıların **JS çalışmadan** bulunduğu `curl`/dosya taramasıyla kanıtlanır. Kanıt çıkmazsa yedeğe geçilir; Next.js'e **geçilmez**.
- Hydration sonrası etkileşim (menü, galeri, SSS, form) istemcide çalışır. SSS yanıtları DOM'da vardır (`<details>`/erişilebilir disclosure), yani ilk HTML'dedir.
- Rota başına `<title>`, meta description, canonical, hreflang (dört dil + x-default), OG etiketleri build'de üretilir (`react-helmet-async` veya SSG eklentisinin head API'si).
- Ben bu yaklaşımı teslim notunda UBT için kısa açıklayacağım (başlangıç talimatı bunu istiyor).

### 2.3 Dil ve URL şeması (geçici, tek yerde değiştirilebilir)
- Dört dil: TR (kaynak) / EN / FR / DE; ayrı kalıcı adresler; tarayıcı dili yalnızca ilk öneri, açık URL'ye zorla yönlendirme yok (V6 §9.2 dil kuralı).
- **Şema (envanterle doğrulandı):** EN kökte, `/tr/ /fr/ /de/` önekli; sabit sayfa slug'ları **eski WP adresleriyle birebir** (`src/i18n/pages.ts`). İçerik slug'ları (etkinlik, yazı, ürün) içerik verisinde dil başına. Önek seçimi tek dosyada (`src/i18n/locales.ts`), böylece V6'daki "nihai URL haritası" kararı kod değişikliği gerektirmeden uygulanabilir.
- Dil seçici: aynı içeriğin ilgili dil sürümüne gider; sürüm yoksa o dilin kategori/ana sayfasına (404 değil).

### 2.4 Örnek içerik indekslenmez (V6 §4.8, rehber §5)
- `VITE_PUBLIC_RELEASE=false` (varsayılan): her sayfada `<meta name="robots" content="noindex,nofollow">`, `robots.txt` = Disallow: /, sitemap üretilmez, hreflang/canonical yine üretilir (E13 sınaması için) ama noindex ile birlikte.
- Gövde köşesinde küçük, kaldırılabilir "ÖRNEK İÇERİK — yayın değil" şeridi (env ile kapanır).
- Canlı yayın bayrağı Aşama A'da hiçbir yerde `true` yapılmaz; yayın kontrolü Aşama "yayın hazırlığı"na bırakılır.

### 2.5 Veri erişim katmanı (Aşama B'ye geçişi ucuz yapar)
Sayfalar veriye yalnızca bir `ContentRepository` arayüzünden (listCategories, getEvent, listEventsBySubgroup, listPosts, …) ulaşır. Aşama A'da implementasyon `src/content/` altındaki tiplenmiş statik dosyalardır; Aşama B'de aynı arayüz Supabase ile değiştirilir, sayfalara dokunulmaz. Salt-okunur, immutable veri; mutasyon yok.

### 2.6 Klasör yapısı (önerilen; dosyalar 200–400 satır, en çok 800)
```
dragomanew/
  app/                      ← yeni uygulama (kök sade kalsın; claudeguides/cloner/docs dokunulmaz)
    src/
      app/                  rotalar, layout, head/SEO
      components/           ui/ (Button, Card, Disclosure…), layout/ (Header, Footer, MobileBar)
      features/             home/ category/ event/ shop/ blog/ about/ contact/ legal/ transport/ forms/
      content/              statik veri + ContentRepository
      i18n/                 locales.ts, ui strings (tr|en|fr|de)
      lib/                  price.ts, options.ts, siteConfig.ts (iletişim tek kaynak)
    public/                 robots.txt, optimize edilmiş görseller çıktısı hariç
    scripts/                images:optimize, content:build, verify
    tests/                  unit (Vitest), e2e (Playwright)
```
**Karar:** uygulama `app/` alt klasöründe (repo kökünü dokümanlarla karışmaktan korur). Alternatif kök-seviyesi kurulum soru olarak Batch 9'da.

### 2.7 Test yaklaşımı (kullanıcı kuralı: TDD, ≥%80 mantık kapsamı)
Saf mantık TDD ile yazılır: fiyat özeti (`2×60 + 2×45 = 210 EUR`), "…'dan başlayan" kart fiyatı, seçenek dağılımı doğrulaması (toplam = kişi sayısı, negatif/kesirli red), "Fiyat talep üzerine" (toplam yok, eksik fiyat 0 değil), içerik seçicileri (boş bölüm gizleme, arşiv/taslak filtresi), iletişim bağlantı üretimi. Sunum bileşenleri için kapsam yüzdesi hedeflenmez; Playwright E2E + ekran görüntüsü.

---

## BATCH 3 — Veri / içerik katmanı (kaynak ↔ örnek ayrımı, dört dil)

### 3.1 Envanter (cloner/analysis'ten doğrulandı)
88 kayıt: 49 sayfa, 25 yazı, 11 ürün satırı (= 4 kitap/baskı), 3 blok. Dil: TR/EN/FR var, **DE yok**. Etkinlik adayları (hepsi `candidate_not_approved_for_publication`): Dalış 28, Outdoor 22, Deniz Kanosu 11, Ulaşım 4. Medya: 958 kayıt / 323 dosya, **849 kaydın alt metni yok**. Mevcut URL dili: EN kökte, TR/FR önekli (redirect/menü CSV'lerinden) → Batch 2'deki şema önerisi uyumlu.

### 3.2 Tiplenmiş varlıklar (Zod şemalı, `src/content/schema.ts`)
`Localized<T> = { tr: T; en?: T; fr?: T; de?: T }` (TR zorunlu kaynak dil).
- **Category** (5) → **Subgroup** (sıralı) → **Event**.
- **Event** (Dalış/Kano/Outdoor ortak yapı, bağımsız kimlik): kategori, alt grup, sıra, slug/başlık/özet/anlatım (dil başına), süre etiketi, galeri, dahil/hariç, koşullar, buluşma, SSS[], gün-gün program[] (boşsa bölüm gizli), `priceDisplay: 'numeric' | 'on_request'`, **options[]** (kimlik, ad, açıklama, fiyat|null, para birimi, fiyat temeli), `formKind: 'diving' | 'outdoor'`, `status: 'draft'|'published'|'archived'`, `origin`.
- **EventOption**, **ItineraryDay**, **FaqItem**, **Post**, **Product** (kitap: dil/baskı, fiyat, stok/teslim alanları – doldurulmuş ama "örnek"), **TeamMember**, **Page** (hakkımızda, iletişim, yasal, Cankurtarma, Kaş dalış noktaları gibi zengin metin sayfaları), **MediaAsset** (kaynak dosya, kullanım kopyaları, 4 dilli alt metin, konu etiketi), **Testimonial** (yalnızca `sample:true`).
- Ulaşım/Konaklama ve Mağaza zorla Event modeline sokulmaz (V6/handover): kendi hafif tipleri (`TransportOffer`, `LodgingOffer`, `Product`).
- Her kayıtta `origin: 'cloner' | 'kayak-site' | 'mockup'` + `sourceRef` (WP id/URL). Fiyatta ayrıca `priceVerified:false` → UI'da "örnek fiyat" etiketi (kaynak fiyatlar güncel varsayılmaz).

### 3.3 Kaynak → veri hattı
1. `scripts/content-extract` (tek seferlik, deterministik): `cloner/extracted/**.md` + `cloner/analysis/*.csv` okur, seçili kayıtlar için **kürate edilmiş TS/JSON tohum** üretir ve repoya commit edilir. Ham `cloner/*` zaten `.gitignore`'da; yazar/form/kupon alanları (kişisel veri) **tohuma taşınmaz**.
2. Deniz Kanosu için `https://dragomanseakayak.com/tr/` ve tur detayları okunur (M3'te, salt-okunur); eski sea-kayak sayfasıyla çelişkide yeni kaynak kazanır, aynı tur çoğaltılmaz. Instagram/video alınmaz.
3. `scripts/content-report`: her sayfa/kayıt için `origin`, eksik çeviri, alt metin eksikliği, fiyat doğrulanmamış listesi üretir → teslimdeki **"kaynak/örnek ayrımı"** tablosu elle yazılmaz, bu çıktıdan gelir.

### 3.4 Dolu şablon için temsili içerik kümesi (tüm eski içeriği aktarmaz; aktarım kapsamı eksilmez, Aşama B/aktarım)
| Alan | Aşama A'da gösterilecek | Not |
|---|---|---|
| Dalış | ~7–8 etkinlik, 3 alt grup (Deneme dalışı · Sertifikalı dalışlar/eğitimler · Dalış noktaları/ek) | 28 adaydan; her tipten ≥1 |
| Cankurtarma | Dalış altında ayrı sayfa: Bronz/Gümüş/Altın/Belge yenileme grupları | kapsam geçici etiketi |
| Deniz Kanosu | 9 kayıt (3 günlük, 5 çok günlük, TRAK) – gün-gün programla 2–3 çok günlük | yeni kaynak esas |
| Outdoor | ~7 etkinlik, her kaynak grubundan 1 (çok aktiviteli, yürüyüş, bisiklet, coasteering, tekne, kültür, özel tur) | |
| Ulaşım | 2 bölüm (transfer, konaklama) ×2–3 örnek kart | mockup |
| Mağaza | 4 kitap/baskı kartı + detay | WP fiyatı "örnek" |
| Blog | 6–8 yazı (kısa/uzun/görselli/görselsiz karışık) + liste | 25'in tamamı aktarım aşamasında |
| Sayfalar | Hakkımızda+ekip (mockup kişiler), İletişim, Gizlilik/Şartlar (**yer tutucu yasal metin, etiketli**), Kaş dalış noktaları (zengin metin sayfası) | |
| Yorumlar | 3–4 temsili yorum, "örnek" etiketi, gerçek yorum gibi sunulmaz | |

### 3.5 Fiyat/seçenek davranış vitrini (rehber §6/§7 örnekleriyle birebir)
En az: (a) seçenekli, sayısal → kartta "45 €'dan başlayan", detayda iki seçenek (yemekli 60 / yemeksiz 45), (b) tek fiyatlı, (c) **"Fiyat talep üzerine"** (kartta/detayda ifade, toplam yok), (d) fiyatı bilinmeyen seçenek (0 sayılmaz), (e) seçeneksiz etkinlik (dağılım alanı yok). Para birimi/temel karışımı doğrudan toplanmaz.

### 3.6 Dört dil kuralları
- TR = kaynak. EN/FR: eski sitede varsa gerçek çeviri kullanılır (origin:cloner). **DE: kaynak yok → örnek metin** (açıkça işaretli, DeepL çağrılmaz).
- Eksik alan TR'ye düşer ama `data-i18n-fallback` işaretlenir; `content-report` sayısını verir; testte temsilî kümede **sıfır sessiz fallback** aranır (eksik çeviri "tamamlandı" sayılmaz).
- Uzunluk testi için bilerek: 1 çok kısa, 1 çok uzun (DE en uzun) kayıt.
- Arayüz sabit metinleri (menü, düğme, form etiketi, hata mesajları, çerez/sahte-gönderim notları) `src/i18n/{tr,en,fr,de}.ts`; sloganı çevirmez.

---

## BATCH 4 — Sayfa / şablon envanteri ve bileşenler

### 4.1 Rota tablosu (eski WP slug'ları korunur; kaynak `src/i18n/pages.ts`)
| # | Şablon (V6 §4.8) | EN | TR | Notlar |
|---|---|---|---|---|
| 1 | Ana sayfa | `/` | `/tr/` | 7 bölüm, kabul edilen sıra |
| 2 | Kategori ×4 | `/diving/` `/sea-kayak/` `/outdoor-activities/` `/transportation-and-accomodation/` | `/tr/diving/` `/tr/deniz-kanosu/` `/tr/doga-etkinlikleri/` `/tr/ulasim-konaklama/` | eski yazım hatalı `accomodation` slug'ı korunur (V6: yazım düzeltmesi için URL değiştirilmez), başlıkta "Accommodation" |
| 3 | Mağaza | `/shop/` | `/tr/dukkan/` | kitap kartları |
| 4 | Etkinlik/tur/eğitim detayı | `/{kategori}/{etkinlik}/` | `/tr/{kategori}/{etkinlik}/` | ortak şablon; nihai URL haritası sonra |
| 5 | Cankurtarma | `/lifeguard-training/` | `/tr/cankurtarma-merkezi/` (eski adres) | menüde Dalış altında, adres kökte |
| 6 | Kitap detay | `/product/{slug}/` | `/tr/urun/{slug}/` | EN'de eski `/product/` öneki |
| 7 | Blog liste / yazı | `/blog/` `/blog/{slug}/` | `/tr/blog/…` | |
| 8 | Hakkımızda + ekip | `/dragoman/` | `/tr/dragoman/` | eski adres; mockup ekip kartları |
| 9 | İletişim | `/contact/` | `/tr/rezervasyon-ve-iletisim/` | tek kaynaktan iletişim bilgisi + örnek form + harita bağlantısı |
| 10 | Yasal | `/privacy-policy/` `/terms-and-conditions/` | `/tr/gizlilik-politikasi/` `/tr/sartlar-ve-kosullar/` | **yer tutucu metin, etiketli** |
| 11 | Zengin metin sayfası | `/kas-dive-sites/` | `/tr/kas-dalis-noktalari/` | WP 595/720 |
| 12 | Ulaşım & Konaklama | kategori sayfasında `#transport` + `#lodging`, her biri kendi formuyla | | ayrı form, ayrı talep kaydı |
| 13 | Etkinlik talep formu | detayda `#request` | | etkinlik otomatik seçili |
| 14 | Sağlık formu (örnek) | `/participant-form/diving/` `/…/outdoor/` | `/tr/katilimci-formu/…` | her zaman noindex; iki ayrı tanım |
| 15 | 404 | `*` | | |
| — | **Gösterim dizini** (yalnız A) | `/__demo/` | | tüm sayfalar + `origin` etiketleri; release'de kapalı |

FR/DE karşılıkları `pages.ts`'te: FR eski adresler (`/fr/plongee/`, `/fr/kayak-de-mer/` …), DE yeni Almanca slug'lar.

### 4.2 Bileşen kataloğu (tekrar kullanılır; 1 dosya ≈ 1 sorumluluk)
- **Layout:** `Header` (iki satırlı masaüstü; mobilde logo+dil+menü), `MegaMenu/Dropdown` (Dalış altında Cankurtarma), `LanguageSwitcher`, `Footer` (siteConfig'ten), `MobileActionBar` (WhatsApp + bağlama uygun CTA; `safe-area` ve içerik alt boşluğu; odak gizlenmez), `SampleBanner`.
- **Ana sayfa:** `HeroTriptych` (3 foto, masaüstü yan yana, mobil kaydırmalı snap), `QuickLinks` (Ulaşım/Konaklama, Mağaza), `FeaturedRail`, `WhyDragoman`, `TestimonialsSample`, `LatestPosts`, `ContactStrip`.
- **Liste:** `CategoryHero`, `SubgroupSection`, `EventCard` (ad, kısa açıklama, süre, fiyat bloğu, **İncele**), `ProductCard`, `PostCard`.
- **Detay:** `Gallery` (Embla + klavye + alt metin), `EventInfoBox` (sticky; fiyat/süre/temel bilgi/Rezervasyon Talebi), `ItineraryList` (gün gün; boşsa render yok), `IncludesExcludes`, `Conditions`, `MeetingPoint`, `FaqDisclosure` (native `<details>` tabanlı, klavye+dokunma, yanıtlar DOM'da), `OptionsTable`.
- **Formlar:** `EventRequestForm`, `PriceSummary`, `OptionDistribution`, `TransportForm`, `LodgingForm`, `ContactForm`, `HealthFormDemo` (hepsi RHF + Zod; Batch 6).
- **Ortak UI:** `Button`, `Badge` (Örnek / Kaynak / Fiyat doğrulanmadı), `Section`, `RichText`, `Picture` (AVIF/WebP + width/height, lazy), `Breadcrumbs`, `SkipLink`.
- **Kural:** isteğe bağlı veri boşsa **bileşen null döner** (başlık da yok) — tek yardımcı `hasContent()`.

### 4.3 Tasarım sistemi (UBT: modern, neat, lean; ayrıntıyı ben seçerim, soru açmam)
- Token'lar Tailwind teması + CSS değişkeni: renk (logo/marka renklerinden), tipografi ölçeği, boşluk, yarıçap, gölge. Kırılmalar: ~640 / 768 / 1024 / 1280 (gerekirse ayarlanır).
- Yazı tipleri **kendi sunucumuzdan** (Google Fonts CDN yok → izinsiz üçüncü taraf istek ve KVKK/GDPR riski yok). TR/FR/DE aksan desteği zorunlu seçim kriteri.
- Hareket: yalnız işlevsel geçişler; `prefers-reduced-motion` saygısı.
- Erişilebilirlik hedefi WCAG 2.2 AA: kontrast, görünür odak, atla-bağlantısı, ≥24px (tercihen 44px) dokunma hedefi, sabit alt şerit odağı örtmez, formda `aria` hata mesajları.
- Logo bulundu: `cloner/images/dragoman-logo-transparent-e95d6bdb5f76.png` + favicon. Marka renkleri: yeşil `#006C50` (birincil, AA), turuncu `#E06C08` (vurgu), metinde turuncu `#A34E00`. Yazı tipi: Barlow + Barlow Condensed.
- Kaşıkla yedirme değil: tasarım yönü kararı `design notes` olarak teslimde 1 paragraf; UBT toplu değerlendirir.

### 4.4 Gezinme ve etkileşim kuralları
Menü klavye ile açılıp kapanır (Esc, ok/Tab); mobil menü odak tuzağı; dil seçici mevcut sayfanın karşılığına gider; kart tamamı tıklanır ama **İncele** düğmesi de gerçek bağlantıdır; Rezervasyon Talebi → `#request`'e kayar ve etkinliği/başlangıç seçeneğini önceden seçer; ana sayfa ↔ kategori ↔ kart ↔ detay ↔ talep zinciri bozuk hedefsiz (E01).

---

## BATCH 5 — Görsel hattı (323 görsel)

### 5.1 İlkeler
- Kaynak klasör `C:\temp_private\dragoman\cloner\images` **salt-okunur**; yeniden indirme yok; dosyalar taşınmaz/silinmez/yeniden adlandırılmaz.
- Eşleştirme: `media-download-manifest.json` (URL↔dosya), `cloner/analysis/media-inventory.csv`, `duplicate-media.csv`, `hero-media-candidates.csv`.
- Hiçbir görsel için "tek tek seçim sorusu" yok (rehber §2). Kaynakta karşılığı yoksa belirgin işaretli temsili görsel.

### 5.2 Konu/kalite seçimi
1. Contact-sheet üretimi: 323 dosya ≈ 30'ar görsellik ~11 ızgara PNG (dosya adı etiketli) → `Read` ile görsel inceleme (geçici dizin: scratchpad, repoya girmez).
2. Her sayfa tipi için ihtiyaç listesi: 3 hero (Dalış/Kano/Outdoor aynı renk-kırpım uyumunda), kategori kapakları (4+Mağaza), etkinlik galerileri, blog kapakları, ekip, hakkımızda, WhyDragoman, kitap kapakları.
3. Çıktı: `app/src/content/media-selection.json` → `{ id, sourceFile, topic, alt{tr,en,fr,de}, focalPoint, usage[], rights:'unverified' }`. Alt metinler (849 eksik) **ben yazarım**, DE/FR/EN örnek olarak işaretli.
4. Kullanım hakkı Dragoman'a ait (V6 §9) → `rights:'unverified'`, raporda belirtilir; yayın öncesi gereken kalem olarak listelenir.

### 5.3 Optimizasyon (scripts/images-optimize, `sharp`)
- Girdi: seçilen dosyalar. Çıktı: `app/public/media/{id}-{w}.avif|webp|jpg`, w ∈ {480, 800, 1280, 1920} (kaynak küçükse upscale yok), `width/height` metadata → `Picture` bileşeni `srcset/sizes`, `loading=lazy` (hero hariç `fetchpriority=high`), CLS yok.
- Hash tabanlı idempotency (aynı girdi → yeniden işleme yok, `content-hash-cache` deseni).
- EXIF/GPS temizlenir (konum verisi sızmasın).
- Çıktı boyutu ölçülür; ≲15 MB ise repoya commit, değilse `.gitignore` + betikle yeniden üret (karar teslimde belirtilir).
- Beklenen hedef: hero ≤200 KB (AVIF 1280w), LCP hedefi lokal ölçümde < 2.5 s (lab, kanıt Lighthouse ile; saha verisi yok → öyle raporlanır).

---

## BATCH 6 — Formlar (yalnızca örnek davranış; gerçek kayıt/e-posta YOK)

### 6.1 Ortak mekanik
- React Hook Form + Zod; doğrulama, hata mesajları (alanın yanında, `aria-describedby`), dört dilde.
- Gönderim soyutlaması: `FormSubmitter` arayüzü; A'da `DemoSubmitter` → ağ çağrısı **yok**, kalıcılık **yok** (localStorage dahil; özellikle sağlık formunda), analitik **yok**. Başarı yerine belirgin bant: **"ÖRNEK GÖNDERİM — kayıt oluşturulmadı, e-posta gönderilmedi."** Aşama B'de `DemoSubmitter` yerine gerçek implementasyon takılır.
- Çift tıklama: gönderim sırasında düğme devre dışı (B'deki "çoğaltılmış talep üretmez" davranışının ön yüzü).
- Kesin rezervasyon/ödeme/müsaitlik vaadi içeren metin yok; "ekip iletişime geçecek, kesin fiyat Dragoman tarafından teyit edilir" ibaresi var.

### 6.2 Etkinlik talep formu (detay sayfasında `#request`)
Etkinlik otomatik seçili (salt-okunur çip) · ad-soyad* · e-posta* · tercih edilen tarih* · kişi sayısı* · telefon · mesaj · (seçenekli etkinlikte) **seçenek dağılımı**. Sağlık alanı **yok**.
- `OptionDistribution`: seçenek başına 0 veya pozitif tam sayı; **toplam = kişi sayısı** değilse hata; negatif/kesirli red; kişi sayısı değişince yeniden doğrulama; tek seçeneğe tüm kişiler geçerli; seçeneksiz etkinlikte alan gösterilmez.
- `PriceSummary` (yalnız sayısal fiyat): satır satır `2 × 60 EUR + 2 × 45 EUR = 210 EUR`, "talep anındaki hesap" etiketi, "kesin fiyat Dragoman tarafından teyit edilir"; adet değişince güncellenir; **"Fiyat talep üzerine"** → toplam yok; fiyatsız seçenek 0 sayılmaz; farklı para birimi/fiyat temeli doğrudan toplanmaz (özet yerine "hesaplanamıyor, ekip teyit eder").
- Sunucu doğrulaması B'dedir; A'da hesap saf fonksiyonda (`lib/price.ts`) ve TDD ile yazılır, B'de sunucuda aynı mantık yeniden kullanılır.
- Not: gönderen e-postanın "alındı" davranışı (Zoho) A'da yok; formun altında tek satır "örnek" notu.

### 6.3 Ulaşım formu (`#transport`) — ayrı talep
Tek yön / gidiş-dönüş · nereden · nereye · tarih-saat · (gidiş-dönüşte) dönüş tarih-saat · kişi sayısı · **çocuk koltuğu** isteği → işaretlenirse ≥1 çocuk yaşı alanı (çoklu, ekle/çıkar) · ad-soyad* · e-posta* · telefon/not isteğe bağlı. "Koltuk temini garantisi değildir, ekip teyit eder" ibaresi.

### 6.4 Konaklama formu (`#lodging`) — ayrı talep
Giriş & çıkış tarihi (çıkış > giriş) · yetişkin · çocuk sayısı → **her çocuk için yaş** · **oda sayısı** (pozitif tam sayı) · ad-soyad* · e-posta* · telefon ve tercih notu isteğe bağlı (oda tipi notta). "Müsaitlik onayı değildir" ibaresi.
- Ulaşım/Konaklama operasyon durumu (Bekliyor/İşleme Alındı) açık karar → A'da hiç gösterilmez.

### 6.5 İletişim formu
Ad-soyad* · e-posta* · konu · mesaj*; yanında tek-kaynak iletişim bilgileri; örnek gönderim bandı.

### 6.6 Katılımcı sağlık formu (örnek görünüm) — iki ayrı tanım
- İki bağımsız tanım nesnesi: `healthForms.diving` ve `healthForms.outdoor` (ayrı id/sürüm; başlangıçta aynı soru kümesi; biri değişince diğeri etkilenmez – kod yapısında kanıtlanır). Etkinlik verisinde `formKind` ile seçilir.
- İçerik: kaynak PDF'den 35 madde — SF01–SF02 ana sorular, SF03 + SF04–SF06 alt maddeler (**yaş koşullu gösterim yok**; kabul edilmedi, hepsi görünür, ilişki görsel gruplama ile korunur), SF07–SF35 geçmiş/mevcut durumlar. Kaynak ifadeler **olduğu gibi** (SF13 gibi belirsiz maddeler dahil; yorum/düzeltme yok). Kimlik: katılımcı ad-soyad; reşit olmayan için veli/vasi ad-soyad alanı (PDF'de olduğu kadar; doğum tarihi/telefon/acil kişi/rapor yükleme/pazarlama izni **eklenmez**).
- Evet/Hayır: **hiçbiri önceden seçili değil**; boş ≠ Hayır; gönderimde yanıtsız zorunlu soru → form tamamlandı sayılmaz, hata soru yanında; "Evet" varsa gönderilebilir, ekranda "İnceleme gerekebilir; ekip değerlendirir" (otomatik uygun/ret yok).
- Bildirim bandı: "Siteden yanıtlamanız kâğıt imzanın yerine geçmez; etkinlik öncesi merkezde katılımcı ve gerekiyorsa veli/vasi formu imzalar." İmza çizme/e-imza yok.
- Veri yok: bu sayfa yalnızca örnek; gerçek sağlık yanıtı saklanmaz/gönderilmez/loglanmaz; `noindex`.
- Dil: TR kaynak; EN/FR/DE metinler **"ÖRNEK ÇEVİRİ — onaylı değil"** etiketiyle (tıbbi anlamı değiştirmemek için sözcük sadakatiyle; DeepL yok).

---

## BATCH 7 — Uygulama sırası (milestone'lar, her biri kapı + ilerleme kaydı)

> Her milestone sonunda `docs/asama-a-ilerleme.md` güncellenir (ne bitti, ne kaldı, sonraki adım) → oturum/token kesilse bile devam noktası net. Hiçbir milestone commit/push yapmaz (kullanıcı istemedikçe).

| M | İçerik | Çıkış kapısı |
|---|---|---|
| **M0** Keşif + spike | `git status`, `docs/ tmp/ plan/` içeriğini listele (dokunma); Layout_Veri_Iliskileri/Layout_Kararlari/analysis CSV'lerini oku; Context7 ile Vite/Tailwind/SSG eklentisi güncel kurulum doğrulaması; `app/` iskeleti; **SSG kanıtı** (1 rota, JS'siz HTML'de içerik) | SSG çalışıyor → devam; çalışmıyorsa yedek prerender; mimari değişikliği yok |
| **M1** Temel | Tailwind token'ları, self-host font, layout (Header/Footer/MobileBar), 4 dil rota + `locales.ts`, `siteConfig` (iletişim), SampleBanner, noindex/robots, lint+typecheck+vitest ayakta | boş iskelet 4 dilde gezilebilir, build yeşil |
| **M2** Görseller ∥ **M3** İçerik (paralel; bağımsız dosyalar) | M2: contact sheet → seçim → optimize → `media-selection.json`. M3: schema, extract, kayak-site oku, tohum, `content-report`, **TDD**: price/options/selectors | M2: seçilen görseller `public/media`'da; M3: rapor çıktısı + testler yeşil |
| **M4** Şablonlar | Ana sayfa → kategori → etkinlik detay → Cankurtarma → mağaza liste/detay → blog → hakkımızda → iletişim/yasal → ulaşım/konaklama → 404 → `/__demo/` dizini. Sıra: ortak bileşenler önce, sonra sayfalar (gruplar paralel yürütülebilir) | tüm 15 şablon gerçek içerikle açılıyor, bozuk iç bağlantı 0 |
| **M5** Formlar | 6.2–6.6, sınır durumları, `DemoSubmitter` | örnek gönderim bandı + doğrulamalar çalışıyor |
| **M6** Dil / uzunluk / erişilebilirlik cilası | 4 dil tüm sayfalar, kısa/uzun stres kayıtları, klavye turları, kontrast, odak, mobil sabit şerit çakışmaları | E02–E04 el testi temiz |
| **M7** Doğrulama | Batch 8'deki tüm kontroller; **ayrı geçiş**: `code-reviewer` + `security-reviewer` (yazar kendini onaylamaz); bulgular düzeltilir, tekrar çalıştırılır | rapor "Geçti/Başarısız/…" gerçek çıktılarla |
| **M8** Teslim paketi | Batch 8.5 | UBT'ye teslim notu |

**Ajan/paralellik:** M2∥M3; M4 sayfa grupları (home/kategori+detay/mağaza+blog/statik sayfalar+formlar) paralel `executor` işleri; Batch 8 kontrolleri paralel. Yazma ve inceleme ayrı bağlamlarda.
**Risk azaltma sırası:** önce görsel kanıt (M0 spike + M1), sonra içerik; en büyük belirsizlik (SSG) en başta çözülür.

---

## BATCH 8 — Doğrulama planı ve teslim paketi

### 8.1 Kontrol matrisi (rehber E01–E04 + Aşama A'ya düşen K maddeleri)
| Kontrol | Nasıl (gerçekten çalıştırılır) | Kanıt |
|---|---|---|
| **E01** ana sayfa→kategori→kart→detay→talep zinciri | Playwright: her dilde zinciri tıkla; ayrıca prerender çıktısındaki **tüm iç `href`'ler** için tarayıcısız crawler: 0 bozuk hedef | test çıktısı + crawler raporu |
| **E02** mobil menü, dil seçici, sabit WhatsApp/CTA | Playwright 390×844: menü aç/kapa, dil değiştir, sabit şerit form alanını/odağı örtmüyor; **tel:/mailto:/wa.me href değerleri** doğrulanır (tıklayıp harici arama/mesaj yok) | test + ekran görüntüsü |
| **E03** tüm şablon grubu dolu; kısa/uzun/4 dil; boş isteğe bağlı bölüm gizli | 15 şablon × 4 dil render testi; uzun-DE ve kısa kayıtlar; boş SSS/program/galeri kayıtlı fixture'larda başlık da yok; ekran görüntüsü 390/768/1440 | screenshot matrisi |
| **E04** SSS klavye/dokunma, yanıtlar sayfada; ayrı önizleme/filtre **yok** | Enter/Space ile aç-kapa; prerender HTML'de yanıt metni (JS'siz); olumsuz kontrol: filtre/önizleme bileşeni yok | test + HTML grep |
| Form örnek davranışı | Doğrulama hataları; seçenek toplamı≠kişi hatası; 2×60+2×45=210 EUR; "talep üzerine" toplam yok; sağlık formunda hiç ön seçim yok & boş≠Hayır; **form gönderiminde sıfır ağ isteği** (Playwright request izleme) ve bant görünür | test |
| İlk HTML (SEO-01, E13 ön kontrolü) | `dist/**/*.html` içinde başlık/özet/SSS/iç bağlantı JS'siz bulunur (script devre dışı Playwright + dosya grep) | rapor |
| Örnek içerik indekslenmez (E13) | tüm sayfalarda `noindex,nofollow`, `robots.txt` Disallow, sitemap yok, hreflang/canonical doğru dilde | rapor |
| Üçüncü taraf istek/gizlilik | build'de dış font/CDN/analitik isteği 0 (ağ izleme) | rapor |
| Erişilebilirlik | axe-core (her şablon, 2 viewport) + elle klavye turu; sorun listesi | rapor |
| Performans (lab) | Lighthouse mobil: ana sayfa, kategori, detay; CLS/LCP; **saha verisi değil** diye etiketlenir | rapor |
| Mantık birim testleri | Vitest; saf mantık modüllerinde ≥%80 | coverage çıktısı |
| Statik kalite | `tsc --noEmit`, eslint, build; "TODO/test.skip/stub" tarama (kullanıcı kuralı: yer tutucu = engel) | komut çıktıları |
| İletişim tutarlılığı (E02/K2 A'ya düşen kısım) | iletişim sayfası + footer + sabit şerit aynı `siteConfig`ten; metin eşleşmesi testi | test |

Raporlama sınıfları (rehber §7): **Geçti / Başarısız / Dış bilgi-erişim bekliyor / Bu aşamada kapsam dışı**. Çalıştırılmayan kontrol "Geçti" yazılmaz. Başarısızlar saklanmaz; düzeltilip yeniden koşulur, ilk ve son sonuç belirtilir.

### 8.2 Ekran görüntüsü matrisi
Viewport: 390×844 · 768×1024 · 1440×900. Sayfalar: ana sayfa, 4 kategori + mağaza, 1 kısa + 1 uzun + 1 çok günlük + 1 "talep üzerine" + 1 seçenekli etkinlik detayı, Cankurtarma, kitap detay, blog liste/yazı, hakkımızda, iletişim, yasal, ulaşım/konaklama formları, sağlık formu (dalış/outdoor), 404. Dil: ana sayfa + 1 uzun detay 4 dilde. Çıktı: `docs/asama-a-teslim/ekran-goruntuleri/` (dosya adı: `{viewport}_{dil}_{sayfa}.png`).

### 8.3 Bağımsız inceleme (yazarla ayrı)
`code-reviewer` (genel + TS), `security-reviewer` (özellikle: form verisinin hiçbir yere gitmemesi, sağlık formunda kalıcılık yok, secret yok, repoya kişisel veri/WP yazar-kupon verisi girmemesi, dış istek yok). CRITICAL/HIGH düzeltilir.

### 8.4 Yerel çalıştırma (UBT için açma adımları — teslim notuna girer)
```
cd C:\temp_private\dragomanew\app
npm install
npm run demo        # build + prerender + preview
→ http://localhost:4173/        (dev: npm run dev → http://localhost:5173/)
→ Sayfa dizini: /__demo/
```
Node ≥ gerektiği sürüm `engines` ile yazılır (yerelde v24.13.1, npm 11.8.0 doğrulandı).

### 8.5 Teslim paketi (`docs/asama-a-teslim/`; `docs/` içeriği M0'da kontrol, çakışırsa `teslim/`)
1. `README_GOSTERIM.md` — nasıl açılır, rota/sayfa listesi, dil URL şeması, SEO-ilk-HTML açıklaması (kısa).
2. `kaynak-ornek-ayrimi.md` — `content-report` çıktısından: her sayfa/kayıt için origin (cloner / kayak-site / mockup), eksik çeviri, alt metin durumu, fiyat doğrulanmadı listesi, görsel hak durumu.
3. `kontrol-sonuclari.md` — 8.1 matrisi gerçek sonuçlarla + komut çıktı özetleri.
4. `ekran-goruntuleri/`.
5. `gercek-vs-temsili.md` — hangi servisler gerçek (hiçbiri), hangileri yok/temsili; Aşama B'ye devreden **bekleyen erişimler** (Supabase, Google OAuth, Zoho, DeepL, Search Console, yorum yöntemi) tek tablo.
6. `acik-kararlar.md` — çeviri beklerken TR yayın, ulaşım/konaklama operasyon akışı, Cankurtarma kapsamı, sağlık koşullu maddeler, nihai URL haritası, ödeme sağlayıcısı (hepsi "onaylanmış sayılmaz").
7. `design-notes.md` — 1 sayfa tasarım yönü (renk/font/ızgara kararları + gerekçe) → UBT toplu geri bildirimi için.
UBT'den beklenen **tek** aksiyon: toplu görünüm değerlendirmesi (rehber §8).

---

## BATCH 9 — Riskler, varsayımlar ve sorular (EN SONDA)

### 9.1 Riskler
| Risk | Etki | Önlem |
|---|---|---|
| Vite SPA + SEO-01 ilk-HTML şartı | Şartı karşılamayan teslim | M0'da SSG kanıtı; yedek özel prerender; stack değişmez |
| 323 görselin kalite/hak durumu bilinmiyor | Yanlış/izinsiz görsel | `rights:'unverified'`, rapor, temsili görsel işaretli |
| Ham WP verisinde kişisel veri (yazar, form, kupon) | Kamuya açık repoya sızma | yalnız kürate tohum commit; security-reviewer taraması |
| Dış kaynak (dragomanseakayak.com) içeriğinin değişmesi/erişilememesi | Kano içeriği eksik | kaynak okunamazsa o kayıtlar `mockup` işaretli; çift anlatım yok |
| Sağlık metinlerinin yabancı dil çevirisi | Tıbbi anlam kayması | TR kaynak + "ÖRNEK ÇEVİRİ — onaylı değil" etiketi, kural/yorum eklenmez |
| Token/oturum kesintisi | Yarım iş | her milestone sonunda `docs/asama-a-ilerleme.md` |
| Kapsam kayması (filtre, önizleme, sepet…) | Reddedilmiş özellik geri gelir | Batch 1.5 listesi; olumsuz E2E kontrolü |

### 9.2 Varsayımlarım (itiraz edilmezse böyle uygulanır)
EN kökte / TR-FR-DE önekli URL, eski slug'lar korunur (4.1) · etkinlik slug şeması `/{kategori}/{slug}/` · etkinlik talep formu detay sayfasında `#request` · `/__demo/` dizin sayfası A'ya özel · Cankurtarma eski adresinde (`/tr/cankurtarma-merkezi/`), menüde Dalış altında · eski yazım hatalı `accomodation` slug'ı korunur · mobil hero kaydırmalı snap (üç yığılmış kart zorunlu değil) · yasal sayfalar yer tutucu · hiçbir commit/push yok · self-host font · React Router v6 + iki açığa karşı önlem (sapma tablosu).

### 9.3 UBT'ye sorular (yalnızca gerçekten sana ait olanlar; kabul edilmiş konular yeniden sorulmuyor)
1. **Uygulama klasörü:** `app/` alt klasörü mü (öneri), repo kökü mü?
2. **Sağlık formunun EN/FR/DE metni:** etiketli örnek çeviri mi (öneri), yoksa yabancı dillerde TR kaynak + "çeviri bekleniyor" notu mu?
3. **Yürütme ritmi ve git:** Aşama A'yı kesintisiz mi, M1 sonunda onay kapısıyla mı yürüteyim; commit/dal politikası?
*(Logo dosyası M0'da aranır; bulunamazsa ancak o zaman sorulur.)*

### 9.4 UBT cevapları (kesinleşti)
1. Klasör → **`app/` alt klasörü**.
2. Sağlık EN/FR/DE → **etiketli örnek çeviri** ("ÖRNEK ÇEVİRİ — onaylı değil").
3. Ritim → **kesintisiz M0–M8, commit/push yok**; her milestone sonunda `docs/asama-a-ilerleme.md`.
