# Dragoman sitesini yayınlama

Site statik dosyalardan oluşur: sunucuda Node.js ya da veritabanı gerekmez, nginx dosyaları olduğu gibi verir. Formlar talepleri doğrudan tarayıcıdan Supabase'e (`submit-request` Edge Function) gönderir. Personel paneli (`panel/` klasörü) aynı sunucuda `/panel/` altında yayınlanır; o da statik dosyalardır ve verileri tarayıcıdan Supabase'ten okur.

Aşama A önizlemesidir. Her sayfa arama motorlarına kapalıdır (sayfalarda noindex, `X-Robots-Tag: noindex, nofollow` başlığı, `robots.txt` her şeyi engeller, `sitemap.xml` yok). Üçü de tek bir bayrağa, `VITE_PUBLIC_RELEASE`'e bağlıdır; açılış adımları aşağıda "Arama motorlarına açma". `/__demo/` sayfası bütün sayfaların listesidir ve yalnız önizlemede vardır.

`robots.txt`, `sitemap.xml` ve her dilin blog akışı (`/blog/feed.xml`, `/tr/blog/feed.xml`, …) build sırasında `scripts/postbuild.mjs` ile üretilir; `public/` altında elle tutulmaz. `llms.txt` (yapay zekâ araçları için kısa tanım ve bağlantılar) `public/llms.txt` içinde sabittir.

## Coolify ile (notyetbro.club böyle çalışıyor)

Coolify siteyi GitHub'dan çeker ve repo kökündeki `Dockerfile` ile kurar: `app/` (site) ve `panel/` (personel paneli) ayrı ayrı Node 24 ile build edilir, çıkan dosyalar `deploy/nginx/dragoman.conf` ayarıyla nginx 1.27'den verilir. Site imajda `/var/www/dragoman/`, panel `/var/www/dragoman/panel/` klasöründedir. Sunucuya dosya kopyalanmaz.

**Yeni sürümü yayınlamak:** değişiklikleri `main` dalına push et, sonra Coolify'da uygulamanın sağ üstündeki **Redeploy**'a bas. Build 3-5 dakika sürer; ilerlemesi "Deployment Logs"ta görünür. Build hata verirse eski sürüm yayında kalır.

**Uygulama ayarları** (bir kez yapılır; yeni bir Coolify uygulaması kurarken de bunlar):

| Ayar | Değer |
| --- | --- |
| Git Source | `ubterzioglu/dragomanew`, dal `main` |
| Build strategy | Dockerfile |
| Base directory | `/` |
| Dockerfile location | `/Dockerfile` |
| Ports Exposes | `80` |

**Build değişkenleri.** Hepsinin Dockerfile'da varsayılanı var; Coolify'da yalnız değiştirmek gerekince **build değişkeni** olarak eklenir:

| Değişken | Varsayılan | Ne işe yarar |
| --- | --- | --- |
| `VITE_SITE_ORIGIN` | `https://notyetbro.club` | Sitenin adresi (canonical, hreflang). Kalıcı alan adına geçerken yeni adresle (ör. `https://dragoman-turkey.com`) ver. |
| `VITE_SUPABASE_URL` | projenin adresi, `https://<proje>.supabase.co` | Formların ve panelin bağlandığı Supabase projesi. Sayfaların ve panelin `connect-src` kuralına bu adres yazılır. Boş ya da `https://` olmayan bir değer build'i durdurur. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | projenin `sb_publishable_…` anahtarı | Formların ve panelin kullandığı açık anahtar. `sb_publishable_` ile başlamayan her değer build'i durdurur: `sb_secret_…` (gizli anahtar), `eyJ…` (eski JWT anon/service_role anahtarı), boş ya da yanlış yazılmış değer. Hata iletisi hangisi olduğunu söyler. |
| `VITE_PUBLIC_RELEASE` | boş | Yayın kararına kadar **boş** kalır. `true` verilirse site arama motorlarına açılır: sayfalardaki noindex ve örnek içerik bandı kalkar, `robots.txt` açılır, `sitemap.xml` üretilir, nginx `X-Robots-Tag` başlığını göndermez (panel hariç). |

Supabase adresi ve `sb_publishable_` anahtarı zaten her ziyaretçinin tarayıcısına gider, gizli değildir; bu yüzden Dockerfile'da durabilir. Supabase projesi değişirse ikisini birlikte değiştir. Gizli anahtarlar (`SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_ACCESS_TOKEN`) bu uygulamaya hiç girmez: build değişkeni olarak verilen her şey herkese açık dosyalara yazılır.

## Personel paneli (`/panel/`)

Adres `https://notyetbro.club/panel/`, giriş sayfası `/panel/giris`. Panel tek sayfalık bir uygulamadır: `/panel/` altında dosya olmayan her adres panelin `index.html`'ini alır, hangi ekranın açılacağına panel karar verir. Sitenin sayfalarından ayrı başlıklarla gelir:

- kendi `Content-Security-Policy` başlığı: yalnız kendi dosyaları, `connect-src` içinde Supabase adresi, `img-src` içinde `data:` (iki adımlı doğrulamanın QR kodu), `frame-ancestors 'none'`;
- `X-Robots-Tag: noindex, nofollow` (site yayına açıldıktan sonra da);
- `index.html` hiç saklanmaz (`no-store`), `/panel/assets/` altındaki adı hash'li dosyalar 1 yıl önbellekte kalır. Eksik bir dosya 404 döner, panel sayfası değil.

**Supabase tarafında bir kez yapılacaklar** (Coolify'da değil, Supabase panelinde):

- Authentication → URL Configuration → Redirect URLs: `https://notyetbro.club/panel/` ekle. Google girişi buraya döner; liste dışındaki adrese dönüş reddedilir.
- Edge Function secret'ları: `ALLOWED_ORIGINS` sitenin adresini içermeli (`https://notyetbro.club`), yoksa tarayıcı form gönderimini CORS yüzünden engeller. `PANEL_URL=https://notyetbro.club/panel/` işletme e-postasındaki bağlantıdır.
- Alan adı değişince bu üç yerde de yeni adresi yaz.

## Yayın öncesi kontrol listesi

- **İçerik değiştiyse veritabanını da güncelle.** Etkinlik talepleri, `app/src/content` içindeki etkinlik ve seçenek kimliklerine göre değil, Supabase'teki `events` ve `event_options` tablolarına göre doğrulanır. İçerik ileri gidip tablo geride kalırsa talep reddedilir (bilinmeyen etkinlik ya da seçenek). `app/src/content` altında herhangi bir değişiklikten sonra, Redeploy'dan önce:
  1. `app/` içinde `npm run db:seed` (`supabase/seed.sql` yeniden üretilir; commit'e girer).
  2. Üretilen dosyayı uzak veritabanına uygula: repo kökünde `supabase db query --linked -f supabase/seed.sql`.
  3. İsteğe bağlı kontrol: `app/` içinde `SUPABASE_URL` ve `SUPABASE_SECRET_KEY` ortam değişkenleriyle `npm run check:events`. İçerik ile veritabanı arasındaki her farkı listeler ve fark varsa 1 ile çıkar. Gizli anahtar yalnız ortam değişkeninden okunur, hiçbir yere yazılmaz; `verify`'ın parçası değildir.
- Panel build'i (`panel/` içinde `npm run build`, Dockerfile'da da aynı) sonunda `scripts/check-dist.mjs` koşar: `dist/index.html` içinde satır içi `<script>`, `<style>` ya da `style=` varsa build durur, çünkü panelin CSP başlığı (`script-src 'self'`, `style-src 'self'`, hash yok) bunları tarayıcıda sessizce engeller. Tek başına: `npm run check:panel-dist`.

## Arama motorlarına açma (yayın günü)

Yalnız içerik onayı ve yayın kararından sonra. Hepsi tek bayrakla olur; kodda değişiklik gerekmez.

1. **Önce yerelde dene** (`app/` içinde, PowerShell): `$env:VITE_PUBLIC_RELEASE='true'; $env:VITE_SITE_ORIGIN='https://<kalıcı-alan-adı>'; npm run build; npm run check:dist`. `check:dist` yayın kurallarını uygular: hiçbir açık sayfada noindex yok, `sitemap.xml` var ve her canonical adresi içeriyor, `robots.txt` yapay zekâ tarayıcılarına (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot, Applebot, …) izin veriyor ve `Sitemap:` satırı doğru. Sonra `npm run seo-report` ile puanlara bak. Bitince `npm run build:demo` ile dist'i yeniden önizleme build'ine çevir.
2. **Coolify'da bayrağı aç:** uygulamanın build değişkenlerine `VITE_PUBLIC_RELEASE=true` ekle (alan adı değiştiyse `VITE_SITE_ORIGIN` da), sonra **Redeploy**. Aynı bayrak Dockerfile'da nginx ayarındaki `__ROBOTS_DEFAULT__` yerine boş değer yazar.
3. **Yayında kontrol et:**
   - `curl -sI https://<alan-adı>/` çıktısında `X-Robots-Tag` satırı **yok**; `curl -sI https://<alan-adı>/panel/` çıktısında `X-Robots-Tag: noindex, nofollow` **var**.
   - `https://<alan-adı>/robots.txt` içinde `Disallow: /` (tek başına) yok; `Disallow: /panel/`, `/__demo/` ve katılımcı formları var; son satır `Sitemap: https://<alan-adı>/sitemap.xml`.
   - `https://<alan-adı>/sitemap.xml` açılıyor; blog yazılarında `<lastmod>` var.
   - Ana sayfanın kaynağında `name="robots"` satırı ve örnek içerik bandı yok; `/__demo/` 404 dönüyor.
   - `https://<alan-adı>/blog/feed.xml` ve `/tr/blog/feed.xml` açılıyor.
   - `tmp/docs/tools/yayin-kontrol.ps1 -Release` (yerel araç) aynı başlık kurallarını yayın moduna göre denetler.
4. **Google Search Console:** alan adını (Domain property, DNS TXT ile) doğrula, Sitemaps bölümüne `https://<alan-adı>/sitemap.xml` gönder, URL Inspection ile ana sayfayı ve bir dil ana sayfasını (`/tr/`) "Request indexing" ile iste. Bing Webmaster Tools'a da aynı sitemap'i ekle (Search Console'dan içe aktarılabilir).
5. Alan adı değiştiyse eski adresten (`notyetbro.club`) yenisine kalıcı (301) yönlendirmeyi proxy'de kur; canonical adresler build'de `VITE_SITE_ORIGIN`'dan gelir.
6. **Marka/varlık bağlantıları (alan adı taşındıktan sonra):** Dragoman için bir Wikidata kaydı (ve varsa Crunchbase sayfası) aç; adreslerini `src/lib/siteConfig.ts` içindeki `social` listesine ekle. Bu liste schema'daki `sameAs` alanını besler. 2 Kasım 2026'daki GEO denetiminde (`geo audit`) "Knowledge Graph pillars" 1/4 çıktı; o tarihte yalnız LinkedIn vardı. Wikipedia sayfası kod dışı ve isteğe bağlı bir iş.
7. **GEO denetimini yeniden çalıştır:** `uvx --from geo-optimizer-skill geo audit --url https://<alan-adı> --verbose`. Araç localhost'u kabul etmez, bu yüzden yalnız yayından sonra ölçülebilir. Bilinçli olarak yapılmayanlar: ana sayfada FAQPage (görünür SSS yok), `/.well-known/ai.txt` ve `/ai/*.json` (standart değil, brief'te yayın şartı değil), ana sayfaya build tarihli `dateModified` (sahte tazelik sinyali olur).

## Düz nginx ile (Coolify olmadan)

1. **Build et:**
   - `app/` klasöründe `VITE_SITE_ORIGIN=https://<alan-adı>`, `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` ile `npm ci` ve `npm run build`. Çıktı `app/dist/`; içindeki `.vite/` klasörü sunucuya gerekmez.
   - `panel/` klasöründe aynı iki Supabase değişkeniyle `npm ci` ve `npm run build`. Çıktı `panel/dist/`.
2. **Dosyaları kopyala.** Sunucudaki site klasörünü (örnek: `/var/www/dragoman`) boşalt; `app/dist/` klasörünün **içindekileri** oraya, `panel/dist/` klasörünün içindekileri `/var/www/dragoman/panel/` altına kopyala. Eski sürümün dosyalarını silmek gerekir; yeni sürüm başka dosya adları kullanır.
3. **nginx ayarını koy.** `deploy/nginx/dragoman.conf` dosyasını `/etc/nginx/conf.d/` altına kopyala ve şu satırları sunucuna göre düzelt:
   - `listen 80;` ve `listen [::]:80;`: nginx'in dinlediği port (IPv6 kullanılmıyorsa ikinci satır silinebilir);
   - `server_name notyetbro.club;`: alan adı;
   - `root /var/www/dragoman;`: 2. adımdaki klasör;
   - `__SUPABASE_ORIGIN__`: Supabase adresinin başı, ör. `https://<proje>.supabase.co` (sonunda `/` olmadan). Bu yazı dosyada kalırsa panel Supabase'e bağlanamaz.
   - `__ROBOTS_DEFAULT__`: Aşama A'da `noindex, nofollow`; site `VITE_PUBLIC_RELEASE=true` ile build edildiyse boş bırak (`default "";`). nginx boş değerde başlığı hiç göndermez; `/panel/` satırı her durumda `noindex, nofollow` kalır.

   Aynı alan adı için eski bir `server { … }` bloğu varsa onu kaldır; aynı ada iki blok olmamalı.
4. **Ayarı dene ve yükle:** `sudo nginx -t`. "test is successful" yazıyorsa `sudo systemctl reload nginx` (ya da `sudo nginx -s reload`).

## Kontrol

- `https://notyetbro.club/` açılıyor, yazı tipi Barlow; aşağı kaydırdıkça zemin turkuaza dönüyor, sağ alttaki gösterge 0 m'den 30 m'ye çıkıyor (Firefox'ta da).
- `https://notyetbro.club/tr` adresi `/tr/` adresine geçiyor.
- `https://notyetbro.club/olmayan-sayfa/` "Page not found" gösteriyor (İngilizce 404 sayfası, durum kodu 404). `/TR/` gibi büyük harfli adresler de 404.
- `https://notyetbro.club/tr/olmayan-sayfa/` "Sayfa bulunamadı" gösteriyor (Türkçe 404 sayfası). Fransızca ve Almanca da aynı: `/fr/…`, `/de/…`.
- `https://notyetbro.club/__demo/` sayfa listesini gösteriyor.
- Bir form gönderilince talep numarası (`DRG-…`) görünüyor; tarayıcı konsolunda CSP ya da CORS hatası yok.
- `https://notyetbro.club/panel/` ve `/panel/giris` panelin giriş ekranını açıyor; `/panel` adresi `/panel/` adresine geçiyor.

## Açık not

`http://notyetbro.club/` (s'siz) şu an 404 dönüyor; `https://` adresine yönlendirmiyor. Bunu sunucunun önündeki proxy'de (Coolify'da uygulamanın https yönlendirme ayarı) düzeltmek gerekir. Düzeltildikten sonra `dragoman.conf` içindeki `Strict-Transport-Security` satırının başındaki `#` kaldırılabilir.
