# Dragoman sitesini yayınlama

Site statik dosyalardan oluşur: sunucuda Node.js ya da veritabanı gerekmez, nginx dosyaları olduğu gibi verir.

Aşama A önizlemesidir. Her sayfa arama motorlarına kapalıdır (noindex, `robots.txt` her şeyi engeller). `/__demo/` sayfası bütün sayfaların listesidir ve yalnız önizlemede vardır.

## Coolify ile (notyetbro.club böyle çalışıyor)

Coolify siteyi GitHub'dan çeker ve repo kökündeki `Dockerfile` ile kurar: `app/` klasörü Node 24 ile build edilir, çıkan dosyalar `deploy/nginx/dragoman.conf` ayarıyla nginx 1.27'den verilir. Sunucuya dosya kopyalanmaz.

**Yeni sürümü yayınlamak:** değişiklikleri `main` dalına push et, sonra Coolify'da uygulamanın sağ üstündeki **Redeploy**'a bas. Build 2-3 dakika sürer; ilerlemesi "Deployment Logs"ta görünür. Build hata verirse eski sürüm yayında kalır.

**Uygulama ayarları** (bir kez yapılır; yeni bir Coolify uygulaması kurarken de bunlar):

| Ayar | Değer |
| --- | --- |
| Git Source | `ubterzioglu/dragomanew`, dal `main` |
| Build strategy | Dockerfile |
| Base directory | `/` |
| Dockerfile location | `/Dockerfile` |
| Ports Exposes | `80` |

**Ortam değişkenleri:** Aşama A için gerekmez. `VITE_SITE_ORIGIN` verilmezse Dockerfile `https://notyetbro.club` kullanır; kalıcı alan adına geçerken bu değişkeni yeni adresle (ör. `https://dragoman-turkey.com`) **build değişkeni** olarak ekle. `VITE_PUBLIC_RELEASE` yayın kararına kadar **boş** kalır; verilirse site arama motorlarına açılır. Supabase'in gizli anahtarları (`SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_ACCESS_TOKEN`) bu uygulamaya hiç girmez.

## Düz nginx ile (Coolify olmadan)

1. **Build et:** `app/` klasöründe `VITE_SITE_ORIGIN=https://<alan-adı>` ile `npm ci` ve `npm run build`. Çıktı `app/dist/`; içindeki `.vite/` klasörü sunucuya gerekmez.
2. **Dosyaları kopyala.** Sunucudaki site klasörünü (örnek: `/var/www/dragoman`) boşalt ve `dist/` klasörünün **içindekileri** oraya kopyala. Eski sürümün dosyalarını silmek gerekir; yeni sürüm başka dosya adları kullanır.
3. **nginx ayarını koy.** `deploy/nginx/dragoman.conf` dosyasını `/etc/nginx/conf.d/` altına kopyala ve şu satırları sunucuna göre düzelt:
   - `listen 80;` ve `listen [::]:80;`: nginx'in dinlediği port (IPv6 kullanılmıyorsa ikinci satır silinebilir);
   - `server_name notyetbro.club;`: alan adı;
   - `root /var/www/dragoman;`: 2. adımdaki klasör.

   Aynı alan adı için eski bir `server { … }` bloğu varsa onu kaldır; aynı ada iki blok olmamalı.
4. **Ayarı dene ve yükle:** `sudo nginx -t`. "test is successful" yazıyorsa `sudo systemctl reload nginx` (ya da `sudo nginx -s reload`).

## Kontrol

- `https://notyetbro.club/` açılıyor, yazı tipi Barlow; aşağı kaydırdıkça zemin turkuaza dönüyor, sağ alttaki gösterge 0 m'den 30 m'ye çıkıyor (Firefox'ta da).
- `https://notyetbro.club/tr` adresi `/tr/` adresine geçiyor.
- `https://notyetbro.club/olmayan-sayfa/` "Page not found" gösteriyor (İngilizce 404 sayfası, durum kodu 404). `/TR/` gibi büyük harfli adresler de 404.
- `https://notyetbro.club/tr/olmayan-sayfa/` "Sayfa bulunamadı" gösteriyor (Türkçe 404 sayfası). Fransızca ve Almanca da aynı: `/fr/…`, `/de/…`.
- `https://notyetbro.club/__demo/` sayfa listesini gösteriyor.

## Açık not

`http://notyetbro.club/` (s'siz) şu an 404 dönüyor; `https://` adresine yönlendirmiyor. Bunu sunucunun önündeki proxy'de (Coolify'da uygulamanın https yönlendirme ayarı) düzeltmek gerekir. Düzeltildikten sonra `dragoman.conf` içindeki `Strict-Transport-Security` satırının başındaki `#` kaldırılabilir.
