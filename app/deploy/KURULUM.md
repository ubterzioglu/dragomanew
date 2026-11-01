# Dragoman sitesini sunucuya kurma

Site statik dosyalardan oluşur: sunucuda Node.js ya da veritabanı gerekmez, nginx dosyaları olduğu gibi verir.

## Paketin içi

- `site/`: sitenin bütün dosyaları (sayfalar, görseller, betikler).
- `dragoman.conf`: nginx ayarı.
- `KURULUM.md`: bu not.

Aşama A önizlemesidir. Her sayfa arama motorlarına kapalıdır (noindex, `robots.txt` her şeyi engeller). `/__demo/` sayfası bütün sayfaların listesidir ve yalnız önizlemede vardır.

## Kurulum

1. **Dosyaları kopyala.** Sunucudaki site klasörünü (örnek: `/var/www/dragoman`) boşalt ve `site/` klasörünün **içindekileri** oraya kopyala. Eski sürümün dosyalarını silmek gerekir; yeni sürüm başka dosya adları kullanır.
2. **nginx ayarını koy.** `dragoman.conf` dosyasını `/etc/nginx/conf.d/` altına kopyala ve şu satırları sunucuna göre düzelt:
   - `listen 80;` ve `listen [::]:80;`: nginx'in dinlediği port (IPv6 kullanılmıyorsa ikinci satır silinebilir);
   - `server_name notyetbro.club;`: alan adı;
   - `root /var/www/dragoman;`: 1. adımdaki klasör.

   Aynı alan adı için eski bir `server { … }` bloğu varsa onu kaldır; aynı ada iki blok olmamalı.
3. **Ayarı dene ve yükle:** `sudo nginx -t`. "test is successful" yazıyorsa `sudo systemctl reload nginx` (ya da `sudo nginx -s reload`).

**nginx bir Docker kapsayıcısında çalışıyorsa** (Coolify vb.):

- Site klasörünü ve `dragoman.conf` dosyasını kapsayıcıya kalıcı bağlama olarak ver (volume ya da Coolify "persistent storage"). Kapsayıcının içine kopyalanan dosyalar, kapsayıcı yeniden kurulunca silinir.
- Denetleme ve yükleme komutlarını kapsayıcıda çalıştır: `docker exec <kapsayıcı> nginx -t`, sonra `docker exec <kapsayıcı> nginx -s reload`.

## Kontrol

- `https://notyetbro.club/` açılıyor, yazı tipi Barlow (eski sürümde Poppins'ti).
- `https://notyetbro.club/tr` adresi `/tr/` adresine geçiyor.
- `https://notyetbro.club/olmayan-sayfa/` "Page not found" gösteriyor (İngilizce 404 sayfası, durum kodu 404).
- `https://notyetbro.club/tr/olmayan-sayfa/` "Sayfa bulunamadı" gösteriyor (Türkçe 404 sayfası). Fransızca ve Almanca da aynı: `/fr/…`, `/de/…`.
- `https://notyetbro.club/__demo/` sayfa listesini gösteriyor.

## Açık not

`http://notyetbro.club/` (s'siz) şu an 404 dönüyor; `https://` adresine yönlendirmiyor. Bunu sunucunun önündeki proxy'de düzeltmek gerekir. Düzeltildikten sonra `dragoman.conf` içindeki `Strict-Transport-Security` satırının başındaki `#` kaldırılabilir.
