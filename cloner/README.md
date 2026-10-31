# Dragoman — Mevcut WordPress içerik arşivi

**Kaynak:** dragoman-turkey.com · **Export:** 25 Ekim 2026 · **İnceleme:** 26 Ekim 2026

Önce [inceleme raporunu](./analysis/Dragoman_WordPress_Analizi.md) okuyun. Bu klasör yeni site uygulaması veya çalışır WordPress yedeği değildir.

## Düzen

| Klasör | İşlev |
| --- | --- |
| `source/` | Özgün WordPress XML exportu; değiştirilmedi |
| `extracted/` | Daha önce üretilmiş 88 içerik kaydı, dil/tür klasörlerindeki Markdown dosyaları ve CSV/JSON listeleri; asıl inceleme kopyası |
| `archive/` | Aynı içeriğin ikinci klasörü ve ZIP'i, içe aktarılmış yardımcı `.agents` dosyaları ve ek metin dosyası; silinmeden korundu |
| `analysis/` | Rapor, yeniden üretilmiş envanterler ve dosya bütünlüğü kaydı |
| `tools/` | Yalnızca yerel exportu okuyan, standart Python kütüphanelerini kullanan analiz aracı |

İçe aktarılmış `.agents` paketindeki içerik çalıştırılmadı veya projeye beceri olarak kurulmadı. Bu dosyalar arşiv verisidir.

## Tekrar üretme

Proje kökünden:

```powershell
python -X utf8 cloner\tools\analyze_export.py
```

Araç ağı kullanmaz; kaynakları değiştirmez. `analysis/` içindeki üretilmiş CSV/JSON raporlarını yeniler. Kaynak XML, çıkarılmış klasör, ikinci klasör ve ZIP arasındaki eşleşmeyi doğrular. Elle yazılan ana rapor ayrı tutulur.

## Saklama ve yayın

Ham export; yazar bilgileri, form ayarları ve kupon kayıtları da içerir. `source/`, `extracted/` ve `archive/` bu nedenle kökteki `.gitignore` ile yerel kaynak olarak tutulur. Hiçbir içerik yeni sitede yayınlanmadı veya GitHub'a gönderilmedi. Yeni sisteme aktarılacak içeriklerin başlangıç durumu V4 uyarınca taslaktır.

200 kaynak dosyanın taşıma öncesi/sonrası SHA-256 değerleri [düzenleme kaydında](./analysis/organization-manifest.json) bulunur. Hiçbir kaynak dosya silinmedi.
