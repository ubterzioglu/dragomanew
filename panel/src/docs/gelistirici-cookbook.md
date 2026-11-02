# Geliştirici rehberi

Dragoman projesine yeni katılan geliştirici için tarifler. Her tarif "ne zaman", "hangi dosyalar", "hangi komut" sırasıyla yazıldı. Bu dosyanın asıl yeri `docs/gelistirici-cookbook.md`; `npm run sync:shared` onu panele (`panel/src/docs/gelistirici-cookbook.md`) kopyalar ve panelde yalnız ana yönetici görür. Kopyayı elle düzenlemeyin.

Komutlar Windows PowerShell için yazıldı. Supabase CLI projeye bağımlılık olarak eklenmedi; `npx supabase …` ile çalıştırılır.

Proje sahibine ulaşılamıyorsa önce 18. bölümü okuyun.

## 1. Repo haritası

| Klasör | Ne var |
| --- | --- |
| `app/` | Ziyaretçi sitesi. Vite + React, `vite-react-ssg` ile statik sayfalar, dört dil (tr, en, fr, de). Birim testleri `app/tests/unit`, e2e testleri `app/tests/e2e` (Playwright). |
| `app/src/shared/` | Site, panel ve Edge Function'ların ortak kuralları: `content/` (şema, doğrulama, yayın kopyası, çeviri yardımcıları) ve `requests/` (form modeli, talep yükü, fiyat kuralları). **Asıl kaynak burası.** |
| `app/scripts/` | Build adımları: `fetch-content.mjs` (içerik kaynağı), `postbuild.mjs`, `check-dist.mjs`, `sync-shared.mjs`, `generate-supabase-seed.mjs`. |
| `app/deploy/` | `nginx/dragoman.conf` (site + panel, CSP başlıkları) ve `KURULUM.md` (Coolify kurulum notu). |
| `panel/` | Personel paneli, `/panel/` altında. Ayrı Vite + React uygulaması, kendi `package.json`'u. Testler `panel/tests`. |
| `panel/src/shared/` | `app/src/shared`'in birebir kopyası. Elle düzenlenmez. |
| `panel/src/docs/` | Kullanım kılavuzu (`kilavuz/*.md`), güncelleme notları (`guncellemeler.md`) ve bu rehberin kopyası. |
| `supabase/migrations/` | Veritabanı şeması, yetkiler (RLS), RPC'ler, deploy kuyruğu. |
| `supabase/tests/database/` | pgTAP testleri. |
| `supabase/functions/` | Edge Function'lar: `submit-request`, `publish-content`, `translate-content`, `content-release`, `site-deploy`. Ortak kod `_shared/`. |
| `supabase/config.toml` | Yerel yığın ayarı; fonksiyonların `entrypoint`, `import_map`, `verify_jwt` ayarları da burada. |
| `Dockerfile` | Site + panel build'i ve nginx imajı (Coolify bunu kullanır). |
| `tmp/docs/` | Proje notları: `DURUM.md` (durum, verilmiş kararlar, çalışma notları), `PLAN.md` (açık işler), `dalga1-sozlesme.md` ve `dalga2-sozlesme.md` (teknik sözleşmeler), `tools/` (yayın sonrası kontrol betikleri). Repoda tutulmaz; kopyasını proje sahibinden alın. |

## 2. Yerel kurulum

1. Bağımlılıklar:

   ```powershell
   cd app;   npm install    # postinstall, lint araçlarını app/tools/lint içine kurar
   cd ..\panel; npm install
   ```

2. Docker çalışıyor olmalı (Rancher Desktop ya da Docker Desktop).
3. Yerel Supabase'i, gerekmeyen servisler kapalı olarak başlatın:

   ```powershell
   npx supabase start -x realtime,storage-api,imgproxy,logflare,vector,supavisor,studio,postgres-meta
   npx supabase status    # API URL ve publishable key burada
   ```

4. Ortam dosyaları (hepsi git dışında; değerleri kimseyle paylaşmayın, commit etmeyin):
   - `app/.env.local`: `app/.env.example`'dan kopyalayın. Yerel yığın için `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` (`supabase status` çıktısından).
   - `panel/.env.local`: `panel/.env.example`'dan. Aynı iki değer; yerelde e-postayla giriş formu için `VITE_PANEL_DEV_EMAIL_LOGIN=true`. Üretim build'i bu formu tamamen çıkarır.
   - `supabase/functions/.env`: `supabase/functions/.env.example`'dan. Yerel fonksiyonlar için.
5. Çalıştırma:

   ```powershell
   cd app;   npm run dev        # site: http://localhost:5173
   cd panel; npm run dev        # panel: http://127.0.0.1:5175/panel/
   npx supabase functions serve --env-file supabase/functions/.env
   ```

   Panel dev sunucusu `127.0.0.1`'e sabit; `supabase/config.toml`'daki `auth.site_url` ile aynı olmalı. Yerel e-postalar Mailpit'e düşer (adres `supabase status` çıktısında).
6. Yerel veritabanını sıfırlamak (migration'lar + `supabase/seed.sql`):

   ```powershell
   npx supabase db reset --local
   ```

## 3. Doğrulama komutları

Commit'ten önce dokunduğunuz parçanın komutlarını çalıştırın.

| Parça | Komut | Not |
| --- | --- | --- |
| Site | `cd app; npm run verify` | typecheck + lint + birim testleri + demo build + `check:dist` + Playwright e2e. |
| Site (hızlı) | `npm run typecheck`, `npm run lint`, `npm test` | |
| Panel | `cd panel; npm run typecheck; npm run lint; npx vitest run; npm run build` | `build` sonunda `check-dist.mjs` panel çıktısını kontrol eder. |
| Veritabanı | `npx supabase db reset --local; npx supabase test db` | pgTAP boş veritabanı varsayar; testten önce sıfırlayın. |
| Seed güncel mi | `cd app; node scripts/generate-supabase-seed.mjs --check` | |
| Ortak kod kopyaları | `cd app; npx vitest run tests/unit/sharedSync.test.ts` | |

Edge Function'ların testleri site tarafında, Vitest ile çalışır: `app/tests/unit/*Handler.test.ts` dosyaları `supabase/functions/<ad>/handler.ts`'i doğrudan içe aktarır. `npm test` bunları da koşar.

## 4. Ortak kod ve `npm run sync:shared`

Deno fonksiyonları ve panel `app/` içinden import edemez (panelin Docker aşaması yalnız `panel/` klasörünü kopyalar). Bu yüzden ortak dosyalar birebir kopyalanır.

`app/scripts/sync-shared.mjs` şunları kopyalar:

| Kaynak | Hedefler |
| --- | --- |
| `app/src/shared/requests/*.ts` | `supabase/functions/_shared/requests/`, `panel/src/shared/requests/` |
| `app/src/shared/content/*.ts` | `supabase/functions/_shared/content/`, `panel/src/shared/content/` |
| `docs/gelistirici-cookbook.md` | `panel/src/docs/gelistirici-cookbook.md` |

Tarif:

1. Değişikliği yalnız kaynakta yapın (`app/src/shared/...` ya da bu dosya).
2. `cd app; npm run sync:shared`. Kaynakta silinen `.ts` dosyası hedeflerden de silinir.
3. `npx vitest run tests/unit/sharedSync.test.ts` geçmeli. Bir kopya farklıysa bu test kırmızı olur.
4. Kaynağı ve kopyaları aynı commit'e koyun.

## 5. Yeni migration ve pgTAP testi

1. Dosya açın:

   ```powershell
   npx supabase migration new kisa_aciklama
   ```

   Dosya `supabase/migrations/<zaman>_kisa_aciklama.sql` olarak oluşur.
2. Kurallar (mevcut migration'lardaki desen):
   - Fonksiyonlarda `set search_path = ''` ve tam adlar (`public.`, `private.`).
   - Yetki yardımcıları `private` şemasında; `revoke all … from public, anon` ve yalnız gereken role `grant`.
   - Her yeni tabloda RLS açık; politikalar etkin personel satırı + yetki ister (`private.can(...)`).
   - Var olan bir fonksiyonun adını değiştirmek yerine gövdesini değiştirin (örnek: `20261102120000_staff_aal1.sql`, `private.has_aal2()` adı korunarak aal1'i de kabul eder hâle getirildi).
3. Test dosyası: `supabase/tests/database/NN_konu.test.sql`. İskelet:

   ```sql
   begin;
   create extension if not exists pgtap with schema extensions;
   select plan(3);
   -- oturum taklidi:
   select set_config('request.jwt.claims', '{"role": "authenticated", "aal": "aal1"}', true);
   select ok(private.has_aal2(), 'açıklama');
   select * from finish();
   rollback;
   ```

4. Çalıştırın: `npx supabase db reset --local; npx supabase test db`.
5. Seed etkileniyorsa: `cd app; npm run db:seed` (`supabase/seed.sql`'i yeniden yazar).
6. Uzak projeye uygulamak (proje bağlı):

   ```powershell
   npx supabase db push --dry-run
   npx supabase db push
   ```

## 6. Edge Function: yazma, test etme, canlıya yükleme

Her fonksiyonun klasöründe aynı düzen var: `index.ts` (ortam değişkenlerini okur, bağımlılıkları kurar), `handler.ts` (saf istek işleyici, test edilen kısım), `store.ts` (veritabanı erişimi), `types.ts`, `deno.json` (import map; sürümler sabit, ör. `npm:zod@4.6.7`).

1. Yeni fonksiyon için klasörü mevcut birinden kopyalayın ve `supabase/config.toml`'a ekleyin:

   ```toml
   [functions.yeni-fonksiyon]
   enabled = true
   verify_jwt = false
   import_map = "./functions/yeni-fonksiyon/deno.json"
   entrypoint = "./functions/yeni-fonksiyon/index.ts"
   ```

   `verify_jwt = false`: kimlik kontrolünü fonksiyonun kendisi yapar (`_shared/auth/staff.ts` personel ve yetki kontrolü, `_shared/http/` CORS ve istek sınırları).
2. Testi `app/tests/unit/<ad>Handler.test.ts` olarak yazın; `handler.ts`'i içe aktarıp sahte `store` ile çağırın (örnek: `siteDeployHandler.test.ts`).
3. Yerelde deneme: `npx supabase functions serve --env-file supabase/functions/.env`.
4. Ortak koda dokunduysanız önce `npm run sync:shared`.
5. Canlıya yükleme:

   ```powershell
   npx supabase functions deploy <ad> --project-ref usyhwjboxjmjsxlwnqqr --yes
   ```

6. Yeni bir gizli değer gerekiyorsa adını bu rehberin 12. bölümüne ve `supabase/functions/.env.example`'a ekleyin; değeri Supabase Dashboard → Edge Functions → Secrets'a girin.

## 7. Yeni içerik alanı ya da içerik tipi

İçerik veritabanında `public.content_entries` tablosunda JSON taslak (`draft`) ve yayınlanmış hâl (`published`) olarak durur. Şema tek yargıçtır: panel kaydederken, `publish-content` yayınlarken ve site build'i yayın kopyasını alırken aynı zod şemasını kullanır.

### Var olan tipe alan eklemek

1. **Şema:** `app/src/shared/content/schema.ts` içinde ilgili şemaya (ör. `eventSchema`) alanı ekleyin. Eski kayıtlar bozulmasın diye yeni alanı önce isteğe bağlı (`.optional()`) yapın. Çevrilecek metinse yerelleştirilmiş metin tipini kullanın.
2. Gerekirse `app/src/shared/content/validate.ts`'e çapraz kontrol ekleyin.
3. `cd app; npm run sync:shared`.
4. **Panel editörü:** `panel/src/lib/content/editorConfig.ts` içinde tipin alan listesine (ör. `EVENT`) bir `FieldConfig` ekleyin: `key`, Türkçe `label`, `kind` (`text`, `textarea`, `list`, `blocks`, `plain`, `media`, `select`, `number`, `boolean`, `date`, `slug`, `object`, `items`, `references`), gerekirse `group: 'details' | 'seo'`, `optional`, `help`. Yeni kayıtların başlangıç değeri `panel/src/lib/content/draft.ts` → `emptyDraft`.
5. **Site:** alanı gösteren bileşeni güncelleyin (ör. etkinlik için `app/src/features/event/EventDetailPage.tsx`). Yerelleştirilmiş değer `app/src/content/localize.ts` → `pick()` ile okunur.
6. **Örnek veri:** `app/src/content/data/` altındaki fixture'a değer ekleyin (testler, demo build ve e2e bunu kullanır). Seed'i yenileyin: `npm run db:seed`.
7. Testler: `app` için `npm run verify`, panel için `npx vitest run` (`contentEditor.test.ts`).

### Yeni içerik tipi

Yukarıdakilere ek olarak:

- Migration: `public.content_type` enum'una değer ekleyin (`alter type public.content_type add value '...'`).
- `app/src/shared/content/schema.ts` → `CONTENT_TYPES` ve yeni şema; `release.ts`'te yayın kopyasına girişi.
- Site: `app/src/content/staticRepository.ts` / `pageContent.ts` ve sayfa bileşeni, rota (`app/src/app/routePaths.ts`).
- Panel: `editorConfig.ts` → `TYPE_CONFIG` ve `EDITABLE_TYPES`, `draft.ts` → `emptyDraft`. Sıralanacaksa `panel/src/lib/content/ordering.ts` → `ORDER_TYPES`.
- `publish-content` planı: `supabase/functions/publish-content/plan.ts` (arşivlenebilir mi, sıralanabilir mi).
- Kullanım kılavuzunu (`panel/src/docs/kilavuz/icerik.md`) güncelleyin.

## 8. Form alanı eklemek

İki yol var:

- **Ek alan (kod gerekmez):** ana yönetici panelde **Formlar** → form → **Yeni alan** ile ekler ve **Yayınla**'ya basar. En fazla 10 ek alan; türler: kısa metin, uzun metin, sayı, seçim listesi, onay kutusu, tarih. Site ve `submit-request` yayınlanmış form sürümünü (`form_versions`) okur; her talep `formVersion`'ını saklar.
- **Yeni temel alan (kod):**
  1. `app/src/shared/requests/forms.ts` → `CORE_KEYS` ve ilgili formun yerleşik tanımı; doğrulama `app/src/shared/requests/schemas.ts`, yük `payload.ts`.
  2. `npm run sync:shared`.
  3. Site formu: `app/src/features/forms/` (ör. `LodgingForm.tsx`, `Field.tsx`, `formDefinition.tsx`).
  4. Fonksiyon: `supabase/functions/submit-request/` ve e-posta şablonu `supabase/functions/_shared/mail/templates.ts`, metinler `strings.ts`.
  5. Panel: talep ayrıntısında alanın Türkçe adı (`panel/src/lib/format.ts`), form editöründe temel alan adı (`panel/src/lib/forms/editor.ts`).
  6. Örnek form verisi `app/src/content/data/forms.ts`; `npm run db:seed`.
  7. Yayınlanmış bir alanın anahtarı ve türü değiştirilemez (`validateDefinition` reddeder); gerekirse gizlenir.

## 9. İçerik yayın akışı

```
Panel "Yayınla"
  → publish-content (Edge Function; personel + content.publish kontrolü, şema doğrulama)
  → public.content_releases (yeni yayın kopyası, numaralı)
  → public.site_deploys (kuyruk satırı: queued, not_before)
  → pg_cron "dragoman-site-deploy" (her dakika) → private.dispatch_site_deploy()
  → pg_net POST → site-deploy (Edge Function; x-dispatch-secret kontrolü)
  → Coolify Deploy Webhook (force=true)
  → Docker build: CONTENT_SOURCE=release → scripts/fetch-content.mjs → content-release fonksiyonu
  → yeni container; /release.json yeni yayın numarasını gösterir
```

Ayrıntılar:

- Kuyruk ardışık yayınları toplar. Süreler `public.app_settings`'ten okunur (`private.setting_seconds`): `deploy_debounce_seconds` (varsayılan 60), `deploy_max_wait_seconds` (300), `deploy_min_gap_seconds` (180).
- `COOLIFY_DEPLOY_URL` / `COOLIFY_API_TOKEN` yoksa satır `skipped` (`not_configured`) olur; panelde "Atlandı (kurulum ayarlı değil)". O durumda Coolify'da elle **Redeploy** gerekir.
- `fetch-content.mjs` release modunda hiçbir zaman fixture'a düşmez. Yayın bozuk ya da yoksa build başarısız olur ve eski container yayında kalır.
- Release build şunları da üretir: `src/content/release/release.json`, `public/release.json` (`{releaseId, createdAt}`), `build-meta/nginx-redirects.map` (slug değişikliği 301'leri), `build-meta/media/` (panel yüklemelerinin türevleri).
- Yerelde release build denemek için:

  ```powershell
  cd app; $env:CONTENT_SOURCE = 'release'; npm run build
  ```

  `CONTENT_SOURCE` boşsa ya da `fixture` ise `app/src/content/data` kullanılır (testler ve demo build bunu ister).
- Panel, yayının siteye ulaştığını sitenin `/release.json`'unu okuyarak anlar (`panel/src/lib/publish/deployState.ts`). Tetiklemeden 15 dakika sonra hâlâ eskiyse gecikme uyarısı gösterir.

## 10. Coolify ve Dockerfile

- Coolify ayarı: base directory `/`, Dockerfile `/Dockerfile`. Ayrıntı `app/deploy/KURULUM.md`.
- Build değişkenleri (Coolify → Environment Variables, build-time):

  | Ad | Ne işe yarar |
  | --- | --- |
  | `VITE_SUPABASE_URL` | Supabase proje adresi. Sitenin ve panelin CSP `connect-src`'ine de yazılır. |
  | `VITE_SUPABASE_PUBLISHABLE_KEY` | Yalnız `sb_publishable_…` anahtarı. Dockerfile `sb_secret_…` ve eski JWT anahtarlarını reddeder; bu değer tarayıcıya gider. |
  | `VITE_SITE_ORIGIN` | canonical ve hreflang kökü. Alan adı değişince güncellenir. |
  | `VITE_PUBLIC_RELEASE` | Boş = arama motorlarına kapalı (robots, noindex, `X-Robots-Tag`). `true` üçünü birlikte açar. |
  | `CONTENT_SOURCE` | Varsayılan `release` (2026-11-02'den beri). |
  | `CONTENT_RELEASE_ID` | Boş = en son yayın. Bir sayı = o yayına sabitle (acil geri dönüş). |

- Hiçbir gizli değeri build değişkeni olarak vermeyin; build değişkenleri paketlere girer.
- Site aşaması yüklenen fotoğrafların türevlerini BuildKit önbelleğinde tutar (`/cache/media`).

## 11. Acil geri dönüş (`CONTENT_RELEASE_ID`)

Yanlış bir içerik yayınlandı ve panelden düzeltmek zaman alacaksa:

1. Panelde **Yayın** → **Son yayınlar**'dan son sağlam yayının numarasını bulun.
2. Coolify → Environment Variables: `CONTENT_RELEASE_ID=<numara>`.
3. **Redeploy**. Site o yayından kurulur. `content-release` son 20 yayını verir; daha eskisine dönülemez.
4. İçeriği panelde düzeltip yayınlayın.
5. `CONTENT_RELEASE_ID`'yi tekrar boşaltın ve Redeploy edin. Boşaltmayı unutursanız sonraki yayınlar siteye gitmez.

Kod hatası için geri dönüş ayrıdır: Coolify'da önceki deploy'u seçin ya da hatalı commit'i `git revert` edip push edin.

## 12. Gizli değerler ve Vault (yalnız adlar)

Değerler hiçbir dosyaya, commit'e, log'a ya da sohbete yazılmaz. `app/.env.local` gibi yerel dosyalardaki değerleri başka yere kopyalamayın.

**Supabase Edge Functions → Secrets:**

| Ad | Kullanan |
| --- | --- |
| `ALLOWED_ORIGINS` | Tarayıcıdan çağrılan bütün fonksiyonlar (CORS; site ve panel kökleri) |
| `THROTTLE_SALT` | `submit-request` (IP yerine HMAC; en az 32 karakter) |
| `BUSINESS_EMAIL`, `PANEL_URL` | `submit-request` (işletmeye "yeni talep" e-postası) |
| `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | `submit-request` (Zoho SMTP, örtük TLS). Eksikse talep yine kaydedilir, e-posta `smtp_not_configured` ile kalır. |
| `DEEPL_API_KEY` | `translate-content` |
| `DEPLOY_DISPATCH_SECRET` | `site-deploy` (Vault'taki `deploy_dispatch_secret` ile aynı olmalı) |
| `COOLIFY_DEPLOY_URL`, `COOLIFY_API_TOKEN` | `site-deploy` |

Platformun kendisinin verdikleri (girilmez): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY(S)` / `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY(S)` / `SUPABASE_SERVICE_ROLE_KEY`.

**Supabase Vault** (`private.dispatch_site_deploy()` okur):

- `site_deploy_url`: `site-deploy` fonksiyonunun adresi.
- `deploy_dispatch_secret`: `DEPLOY_DISPATCH_SECRET` ile aynı değer.

**Diğer yerler:**

- Supabase Auth → Providers → Google: OAuth istemci kimliği ve sırrı.
- Coolify build değişkenleri: 10. bölümdeki tablo (hiçbiri gizli değil).
- Yerel: `app/.env.local`, `panel/.env.local`, `supabase/functions/.env` (git dışında). Uzak CLI komutları için `SUPABASE_ACCESS_TOKEN` ortam değişkeni; ekrana yazdırmadan kullanın.

## 13. CSP kuralları

- **Site:** her sayfaya build sırasında meta CSP yazılır (`app/src/lib/contentSecurityPolicy.ts`, `app/vite.config.ts`). Satır içi script'ler SHA-256 özetiyle izinlidir; `'unsafe-eval'` yoktur. Bu yüzden zod `jitless` çalışır: `app/src/lib/zodConfig.ts`, `main.tsx`'te ilk import'tur. Yeni bir giriş noktası şema çalıştırıyorsa bu import'tan sonra yüklenmelidir. Test: `app/tests/unit/contentSecurityPolicy.test.ts`.
- **Panel:** CSP nginx başlığında (`app/deploy/nginx/dragoman.conf`, `/panel/` için `default-src 'self'; script-src 'self'; style-src 'self'; …`). Satır içi stil ve script yoktur: `style={...}` kullanmayın, yalnız Tailwind sınıfları; HTML enjeksiyonu (`dangerouslySetInnerHTML`) yok. Markdown React elemanlarına çevrilerek gösterilir.
- `connect-src` ve panelin `img-src`'i Supabase kökünü içerir; Dockerfile `__SUPABASE_ORIGIN__` yer tutucusunu `VITE_SUPABASE_URL`'den doldurur.
- Yeni bir dış kaynak (font, CDN, API) eklemek CSP değişikliği demektir; önce kendi sunucunuzdan sunmayı düşünün.

## 14. `security.txt` yıllık yenileme

- Dosya: `app/public/.well-known/security.txt` (`Contact:` ve `Expires:` satırları).
- `app/scripts/lib/seoChecks.mjs` → `checkSecurityTxt`, `npm run check:dist` içinde (dolayısıyla `npm run verify`'da) çalışır. `Expires`'a 30 günden az kalınca kontrol kırmızı olur.
- Yenileme: `Expires` tarihini bir yıl ileri alın (ISO biçimi), `npm run verify`, commit (`chore: renew security.txt`).

## 15. Kullanım kılavuzu ve güncelleme notları

- **Her kullanıcıya dönük değişiklikte** `panel/src/docs/guncellemeler.md`'ye not ekleyin. Biçim: en üstte en yeni gün, `## YYYY-MM-DD` başlığı, altında `- ` ile başlayan, kullanıcının diliyle tek satırlık maddeler ("Ne değişti, sizin için ne anlama geliyor"). Teknik terim yok.
- Bir ekranın düğmeleri, adımları ya da yetkisi değiştiyse ilgili kılavuz dosyasını da güncelleyin: `panel/src/docs/kilavuz/<bölüm>.md`.
- Kılavuz dosyasının biçimi sabittir (panel ayrıştırır):
  1. 1. satır `# Başlık`, sonra boş satır;
  2. tek paragraf "ne işe yarar" özeti (2–3 cümle; ekrandaki **Bu ekran ne işe yarar?** kutusunda görünür);
  3. `## Nasıl kullanılır` (ekrandaki gerçek düğme adlarıyla numaralı adımlar), `## Dikkat`, `## Kimler kullanabilir`.
  - `sss.md`'de `## Nasıl kullanılır` yerine `## Sık sorulanlar` olabilir.
- Bu rehberi değiştirdiyseniz `npm run sync:shared` çalıştırın.

## 16. Panel erişim kuralı

- Panele girmek için oturum (Google ya da e-posta + şifre) yetmez; `public.staff_members`'ta **etkin** bir satır gerekir. Hesap ilk girişte `link_staff_account()` ile bu satıra bağlanır.
- 2026-11-02'den beri aal1 oturum yeterli; TOTP istenmez (`20261102120000_staff_aal1.sql`). Her politika yine etkin personel satırı + yetki ister.
- Personel dışı kayıtları `before_user_created` kancası reddeder; kayıt formu yoktur.
- Yetkiler: rol + `extra_permissions`, veritabanında `public.my_permissions()`. Panelin `panel/src/lib/permissions.ts` dosyası bunun aynasıdır; düğmeyi gizlemek koruma değildir, karar veritabanınındır. Roller: `main_admin` (hepsi), `reservations` (`requests.read`, `requests.work`), `accounting` (`requests.read`), `content` (`content.edit`, `content.translate`). Yayın (`content.publish`) yalnız `main_admin`'de ya da kişiye özel `extra_permissions` ile.
- Yalnız şifreyle girecek bir çalışan için personel satırına ek olarak Supabase Auth'ta e-postası doğrulanmış bir kullanıcı açılmalıdır.

## 17. Commit kuralları

- Biçim: `<tür>: <açıklama>`; türler `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `style`. Açıklama İngilizce ve kullanıcının göreceği etkiyi anlatır (ör. `feat: staff sign in with Google or e-mail and password, without an authenticator app`).
- Commit'ten önce 3. bölümdeki doğrulama komutları yeşil olmalı.
- Ortak kodu değiştirdiyseniz kaynağı ve kopyaları aynı commit'e koyun.
- Kullanıcıya dönük değişiklikte `panel/src/docs/guncellemeler.md` notu aynı commit'te olsun.
- Kökteki `seo-analyzer.js` proje sahibinindir; commit etmeyin.

## 18. Proje sahibi yokken

Proje sahibine ulaşılamazken işi sürdüren geliştirici için. Kodu, testleri ve yayını kendiniz yürütürsünüz. Dragoman'ın ve proje sahibinin vereceği kararları vermezsiniz; onları not edip bekletirsiniz.

### Devralınacaklar

Proje sahibi ayrılmadan önce hepsi elinizde olmalı. Eksik olan varsa ona bağlı işi yapamazsınız; eksiği not edin.

| Ne | Ne için |
| --- | --- |
| GitHub reposuna push yetkisi | Kod yayını |
| Coolify hesabı (site uygulamasında Redeploy, Environment Variables, Logs) | Kod yayını, elle Redeploy, acil geri dönüş (11. bölüm) |
| Supabase projesi `usyhwjboxjmjsxlwnqqr` üyeliği ve kendi `SUPABASE_ACCESS_TOKEN`'ınız | Migration, fonksiyon yükleme, loglar, Secrets |
| Panelde `main_admin` hesabı | **Yayın** ekranı, **Siteyi şimdi yeniden kur**, **Kullanıcılar** |
| `tmp/docs/DURUM.md` ve `tmp/docs/PLAN.md`'nin güncel kopyası | Son durum, verilmiş kararlar, açık işler |
| Yerel ortam dosyalarının değerleri ya da nereden alınacakları | 2. bölüm |

Claude Code ile çalışıyorsanız oturumu `tmp/docs/DURUM.md devam et` ile başlatın; belgenin 6. bölümü ilk adımları ve tuzakları anlatır.

### Her iş günü

1. **Site:** `https://notyetbro.club/` (alan adı değiştiyse yenisi) açılıyor mu? `/release.json`'daki `releaseId`, panelde **Yayın** → **Son yayınlar**'daki en yeni numarayla aynı olmalı.
2. **Kurulumlar** (panel → **Yayın**):
   - **Atlandı (kurulum ayarlı değil):** Coolify değerleri Secrets'ta yok. Coolify'da **Redeploy**'a siz basın. Basılmazsa içerik ekibinin yayınları siteye gitmez.
   - **Tetiklenemedi** bir saatten uzun sürüyorsa: Supabase → Edge Functions → `site-deploy` → Logs, sonra elle Redeploy.
   - **Kurulum gecikti, ana yöneticiye haber verin:** ana yönetici sizsiniz. Coolify'da build logunu açın. Build kırıldıysa ziyaretçiler eski siteyi görür (9. bölüm). Sebep içerikse 11. bölüm, kodsa sorunlu commit'i `git revert` edip push edin.
3. **Formlar:** Supabase → Edge Functions → `submit-request` → Logs. 5xx ya da tekrarlayan hata varsa ilk iş budur; bozuk form talep kaybettirir.
4. **E-posta:** SMTP Secrets'ı girilene kadar yeni talepler e-posta bildirimi göndermez (`smtp_not_configured`). Rezervasyon ekibi talepleri panelde **Talepler**'den takip etmeli; bildiklerinden emin olun.

### Her hafta

- Panel → **Yayın** → **DeepL kullanımı**: kota bitmek üzereyse içerik ekibine söyleyin. Ücretli plana geçmek proje sahibinin kararıdır.
- Supabase Dashboard: proje duraklatılmış (**Paused**) görünüyorsa **Restore**; kota uyarısı varsa not edin.
- `npm audit` (`app/` ve `panel/`): yeni yüksek ya da kritik bir açık varsa yükseltmeyi ayrı bir `fix:` commit'iyle yapın ve 3. bölümdeki komutları çalıştırın.

### Tek başınıza yapabilecekleriniz

- `PLAN.md`'deki kod işleri (karar bekleyenler hariç) ve hata düzeltmeleri.
- Commit, push ve Coolify'da Redeploy; 3. bölümdeki komutlar yeşilse.
- Uzak Supabase'e migration (`db push`) ve fonksiyon yükleme (5. ve 6. bölümler).
- Acil geri dönüş: içerik için 11. bölüm; kod için Coolify'da önceki deploy ya da `git revert`.
- Panelden içerik yayını, yalnız Dragoman'ın istediği değişiklik için.
- Sızan bir anahtarı yenilemek (aşağıdaki tablo).

### Proje sahibini bekleyecekler

- Uzak veriyi ya da hesapları silmek veya sıfırlamak: uzak veritabanını sıfırlamak, tablo boşaltmak, yayın silmek, Auth kullanıcısı ya da personel satırı silmek.
- Force-push, `main` geçmişini değiştirmek, repo ayarları (görünürlük, dal koruması, üyeler).
- Arama motorlarına açmak (`VITE_PUBLIC_RELEASE=true`), alan adı, DNS ve `VITE_SITE_ORIGIN`.
- Yeni panel kullanıcısı açmak, rol ya da yetki değiştirmek. Talepler kişisel veri içerir.
- Dragoman'ın kararları: fiyatların teyidi (`priceVerified`), görsel hakları, yasal metinler, ekip bilgileri, sağlık formu kuralları. Bunlar örnek ya da taslak olarak kalır.
- Ücretli hesap, plan yükseltme ya da yeni üçüncü taraf servis (GA4, Google Places API vb.).
- `DURUM.md`'deki verilmiş kararları değiştirmek.

### Sorun çıkarsa

| Belirti | İlk bakılacak yer | Ne yapılır |
| --- | --- | --- |
| Site açılmıyor ya da 502 | Coolify → site uygulaması → Logs ve son deploy | Önceki sağlam deploy'a dönün. Sebep son commit'se `git revert`, push, Redeploy. |
| Yanlış içerik yayında | Panel → **Yayın** → **Son yayınlar** | 11. bölüm |
| Formlar hata veriyor | `submit-request` logları | Alan adı değiştiyse `ALLOWED_ORIGINS`. "Çok fazla istek" 10 dakikada 5 sınırıdır; hata değildir. Son fonksiyon yüklemesi bozduysa önceki commit'ten yeniden yükleyin. |
| Panele kimse giremiyor | Supabase → Authentication → Logs | 16. bölüm; Auth `site_url` ve dönüş adresleri |
| Çeviri çalışmıyor | **DeepL kullanımı**, `translate-content` logları | Kota bittiyse dönem başını bekleyin. |
| Bir anahtar commit'e, log'a ya da sohbete düştü | 12. bölüm | Hemen yenileyin, eskisini iptal edin, Secrets'ı güncelleyin, not bırakın. Git geçmişinden silmek force-push ister; onu proje sahibine bırakın. |

### Not bırakmak

- Her iş günü sonunda `DURUM.md` 8. bölüme bir satır yazın: tarih, ne yapıldı, commit. Biten işin kutusunu `PLAN.md`'de işaretleyin.
- Karar bekleyen her soruyu `PLAN.md`'nin 1. ve 2. bölümlerine yazın: seçenekler ve öneriniz.
- Canlıda sorun yaşandıysa ne zaman başladığını, ne görüldüğünü, ne yaptığınızı ve şimdiki durumu yazın.
- Dönüşte iki dosyayı proje sahibine geri verin.
