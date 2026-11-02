# Dragoman Panel

Site taleplerini ve panel kullanıcılarını yöneten personel paneli. `/panel/` altında çalışan ayrı bir Vite uygulaması: React 19, TypeScript (strict), Tailwind 4, `react-router` 7, `@supabase/supabase-js`. Arayüz Türkçedir.

| Adres | İçerik |
| --- | --- |
| `/panel/giris` | Google ile ya da e-posta + şifreyle giriş (kayıt formu yoktur). Yerelde, açıksa e-posta bağlantısıyla geliştirme girişi de görünür. |
| `/panel/sifre` | Giriş yapmış kişinin kendi şifresini belirlemesi / değiştirmesi (en az 12 karakter). Google ile girenler buradan şifre belirleyip sonra e-posta + şifreyle de girebilir. |
| `/panel/` | Sekmeler: Bekliyor, İşleme Alındı, Bana Atananlar. Ayrıntıda form değerleri, etkinliğin talep anındaki hâli, tahmini fiyat ve geçmiş. İşlemler: İşleme Al, Devret, Sorumlu değiştir (yalnızca ana yönetici). |
| `/panel/kullanicilar` | Yalnızca ana yönetici: liste, ekleme, rol değiştirme, pasifleştirme. |

Girişten sonra panel `link_staff_account()` çağırır. Sonuç boşsa (adres etkin personele ait değil ya da e-posta doğrulanmamış) "Erişim yok" gösterilir. İki adımlı doğrulama (TOTP) istenmez (2026-11-02 kararı): etkin bir personelin her oturumu (Google ya da e-posta + şifre, `aal1`) rolünün izin verdiği her şeye erişir; Google hesabının güvenliği Google'a bırakılmıştır. Her yetkiyi veritabanı (RLS ve RPC'ler) denetler, paneldeki gizli düğmeler yalnızca kolaylıktır.

## Yerelde çalıştırma

Docker ve Supabase CLI (v2.122) gerekir. Uzak projeye asla `link` ya da `push` yapmayın.

```powershell
# Repo kökünde
supabase start
supabase db reset      # migration'lar ve seed
supabase status        # "API URL" ve "Publishable" anahtarını not edin
```

`config.toml` içindeki auth ayarları (site_url, şifre uzunluğu, `before_user_created` kancası) yalnızca `supabase start` sırasında okunur. Dosya değiştiyse önce `supabase stop`, sonra `supabase start` çalıştırın.

```powershell
cd panel
npm install
Copy-Item .env.example .env.local
# .env.local:
#   VITE_SUPABASE_URL=http://127.0.0.1:54321
#   VITE_SUPABASE_PUBLISHABLE_KEY=<supabase status çıktısındaki publishable anahtar>
#   VITE_PANEL_DEV_EMAIL_LOGIN=true
npm run dev
```

Panel <http://127.0.0.1:5175/panel/> adresinde açılır. Bu adres `config.toml` içindeki `site_url` ve yönlendirme listesiyle aynıdır.

### İlk ana yönetici

Kanca, etkin `staff_members` satırı olmayan her adresi reddeder; bu yüzden önce kendinizi ekleyin. Studio'nun SQL düzenleyicisi (<http://127.0.0.1:54323>) ya da `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres` ile:

```sql
insert into public.staff_members (email, full_name, role)
values ('siz@ornek.com', 'Adınız Soyadınız', 'main_admin');
```

E-posta küçük harfe çevrilerek saklanır. Diğer kullanıcıları sonra `/panel/kullanicilar` sayfasından ekleyin.

### E-posta ile giriş (yalnızca yerel)

Form yalnızca `npm run dev` ile ve `VITE_PANEL_DEV_EMAIL_LOGIN=true` iken görünür; üretim derlemesinde hiç yer almaz.

1. `/panel/giris` sayfasında adresinizi girip **Giriş bağlantısı gönder**'e basın.
2. E-postayı Mailpit'te açın (<http://127.0.0.1:54324>) ve bağlantıya aynı tarayıcıda tıklayın. Yerel Supabase'in varsayılan şablonu yalnızca bağlantı içerir, kod göndermez.

### E-posta + şifreyle giriş

Önce bir kez Google ile (yerelde e-posta bağlantısıyla) girip `/panel/sifre` sayfasından şifre belirleyin; sonra `/panel/giris` sayfasındaki e-posta + şifre formuyla girebilirsiniz. Hatalı adres ve hatalı şifre aynı uyarıyı verir. Personel olmayan adresler için hesap açılamaz (`before_user_created` kancası).

Daha önce TOTP kurmuş bir hesap `insufficient_aal` hatası alırsa eski kaydı silin:

```sql
delete from auth.mfa_factors
where user_id = (select id from auth.users where email = 'siz@ornek.com');
```

### Google ile giriş

Bir Google Cloud OAuth istemcisi gerekir. Kimliği ve gizli anahtarı `supabase start` çalıştıran ortamda `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` ve `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` olarak tanımlayın (`supabase/config.toml` bu iki adı okur). Google'daki yönlendirme adresi: `http://127.0.0.1:54321/auth/v1/callback`.

### Deneme talebi

```sql
insert into public.requests (kind, locale, full_name, email, payload, idempotency_key)
values ('contact', 'tr', 'Deneme Kişi', 'deneme@ornek.com', '{"message": "Merhaba"}', gen_random_uuid());
```

## Kontroller

```powershell
npm run typecheck
npm run lint
npm test
npm run build      # dist/ (base /panel/)
```

## Notlar

- Panel yalnızca publishable anahtarla çalışır; secret ya da service-role anahtarı görmez.
- `staff_members.extra_permissions` panelde gösterilmez ve ayarlanmaz: panel, kişinin kendi eklerini okuyamaz (istemci yalnızca `id, full_name, role, active` sütunlarını görür), bu yüzden menüleri ve düğmeleri yalnızca role göre gösterir. Veritabanı ise ekleri tanır (`private.role_can`). Ek yetkiyi elle SQL ile vermeyin; gerekirse önce kişinin kendi yetkilerini döndüren bir RPC (ör. `public.my_permissions()`) eklenmeli.
- Pasifleştirilen ya da rolü değişen kişinin açık paneli, personel satırını her token yenilemesinde, sekmeye dönüldüğünde ve sekme açıkken 5 dakikada bir yeniden okur. Veritabanı erişimi ise hemen keser.
- Yayın: repo kökündeki `Dockerfile` paneli ayrı bir aşamada build eder ve sitenin yanına `/panel/` altına koyar. `app/deploy/nginx/dragoman.conf` bu yolu kendi CSP başlığıyla verir (`img-src data:`, Supabase adresi için `connect-src`); `index.html` saklanmaz, hash'li dosyalar bir yıl önbellekte kalır. Ayrıntılar ve Supabase tarafındaki tek seferlik ayarlar için `app/deploy/KURULUM.md`.
- Google sağlayıcısı barındırılan projede henüz açık değilken giriş düğmesi "Google girişi henüz açılmadı" uyarısıyla döner; sağlayıcı açılınca ek bir değişiklik gerekmez.
