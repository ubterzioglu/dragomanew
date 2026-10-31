# Dragoman — Mevcut servisler ve yeni siteye geçiş kontrolü

Tarih: 31 Ekim 2026
Durum: Kullanıcının verdiği envanter; hesaplara giriş yapılmadı, servislerin gerçek görevleri ve bağlantıları doğrulanmadı. Şifre içermez.

| Servis | Kullanıcının belirttiği kullanım | Adres | Kullanıcı / e-posta |
| --- | --- | --- | --- |
| Flywheel | Ana web sitesi | https://app.getflywheel.com | dragoman |
| DigitalOcean | Hosting ve DNS | https://cloud.digitalocean.com | admin@dragoman-turkey.com |
| Namecheap | Alan adları ve SSL | https://namecheap.com | dragomanturkey |
| Cloudflare | Görev ve hesap bilgisi henüz verilmedi | — | — |
| Mailchimp | E-posta pazarlama servisi; mevcut bağlantılar incelenecek | https://mailchimp.com | admin@dragoman-turkey.com |
| Cobaltapps | WordPress Genesis theme | http://cobaltapps.com/ | dragoman-turkey / admin@dagoman-turkey.com |
| CodeCanyon | WordPress eklentileri | http://codecanyon.net/ | dragoman-turkey / admin@dagoman-turkey.com |
| Insync | Mevcut kullanım amacı doğrulanacak | https://insynchq.com | admin@dragoman-turkey.com |

Cobaltapps ve CodeCanyon için verilen e-postada “dagoman” yazıyor; bilgi aynen korunmuştur. Yazım hatası mı, gerçek hesap adresi mi olduğu hesap işlemi gerektiğinde doğrulanacak. Cloudflare hesap/görev bilgisi verilmedi. Servis adından aktif kullanım, abonelik veya geçiş gerekliliği çıkarılmaz.

## Claude Code ile ele alınacak geçiş işi

UBT talimatı: Yeni site geliştirilirken ve aktarılırken bu servislerden hangilerinin güncelleneceği Claude Code ile görüşülerek belirlenmeli. Önce gerçek mevcut yapı çıkarılmalı; ardından servis bazında yapılacak değişiklik, korunacak bağlantı ve gerekiyorsa daha sonra kapatılacak hizmet somutlaştırılmalı. Bu envanter hesap değişikliği veya kapatma talimatı değildir.

- Alan adının kayıt kuruluşu, yetkili DNS sağlayıcısı, nameserver'lar ve web trafiğinin gerçek hedefi belirlenir. DigitalOcean ve Cloudflare görevleri varsayımla birbirinin yerine geçirilmez.
- Yeni hosting hedefi hazır olduğunda hangi web DNS kayıtlarının değişeceği, Cloudflare kullanılıyorsa proxy/önbellek ayarları ve SSL sertifikası/yenileme düzeni kontrol edilir. Namecheap'in bildirilen SSL rolü ayrıca doğrulanır.
- E-posta hizmetini kesmemek için mevcut MX, SPF, DKIM ve DMARC kayıtları envantere alınır; Zoho ve Mailchimp gönderim bağlantılarıyla birlikte değerlendirilir. Web sitesi geçişi gerekçesiyle e-posta kayıtları gelişigüzel değiştirilmez.
- Flywheel/eski WordPress'in içerik, medya, URL ve gerekli yedekleri alınır; önceki SEO yönlendirme ve geri dönüş planı uygulanır. Yeni site doğrulanmadan eski hosting kapatılmaz.
- Mailchimp'in mevcut form, liste ve site bağlantıları varsa belirlenir; yeni sitede korunması gereken bağlantılar aktarım planına işlenir. Yeni pazarlama akışı veya abonelik kararı bu envanterle eklenmez.
- Cobaltapps ve CodeCanyon ürünlerinin mevcut işlevleri ve lisansları envantere alınır; yeni sistemde gereken işlevlerin karşılandığı kontrol edilir. WordPress tema/eklenti kodlarının otomatik taşınacağı veya aboneliklerin hemen kapatılacağı varsayılmaz.
- Insync'in hangi dosya, yedek veya senkronizasyon işi için kullanıldığı belirlenir; ilgiliyse yeni dosya/yedek düzeniyle bağlantısı planlanır.

Geçiş tesliminde servis bazında “doğrulanan görev / gereken değişiklik / sorumlu / erişim ihtiyacı / doğrulama ve geri dönüş” kaydı hazırlanır. Gerçek değişiklikler ve test sonuçları yapılmadan tamamlandı denmez. Hesap envanteri yalnızca yetkili teknik devir alanında kullanılır; müşteriye açık web içeriğine konulmaz. Geliştirici cookbook'u bu envantere ve geçişte kesinleşen gerçek işletim bilgilerine dayanır.


