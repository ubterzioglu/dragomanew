# Dragoman sitesini yayınlama

Site statik dosyalardan oluşur: sunucuda Node.js ya da veritabanı gerekmez, nginx dosyaları olduğu gibi verir. Formlar talepleri doğrudan tarayıcıdan Supabase'e (`submit-request` Edge Function) gönderir. Personel paneli (`panel/` klasörü) aynı sunucuda `/panel/` altında yayınlanır; o da statik dosyalardır ve verileri tarayıcıdan Supabase'ten okur.

Aşama A önizlemesidir. Her sayfa arama motorlarına kapalıdır (noindex, `robots.txt` her şeyi engeller). `/__demo/` sayfası bütün sayfaların listesidir ve yalnız önizlemede vardır.

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
| `VITE_PUBLIC_RELEASE` | boş | Yayın kararına kadar **boş** kalır; verilirse site arama motorlarına açılır. |

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
