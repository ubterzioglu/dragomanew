/**
 * Spindora SEO Analyzer — tarayıcı + service worker ortak modülü
 * DOMParser ile parse edilmiş belge veya document üzerinde çalışır.
 */
(function initSpindoraSEO(global) {
    'use strict';

    var TITLE_MIN = 50;
    var TITLE_MAX = 60;
    var DESC_MIN = 135;
    var DESC_MAX = 160;
    var MIN_WORDS = 700;
    var KEYWORD_DENSITY_MAX = 4.5;

    var OG_EXPECTED = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];

    function getVisibleText(doc) {
        var body = doc.body;
        if (!body) return '';
        var clone = body.cloneNode(true);
        var scripts = clone.querySelectorAll('script, style, noscript');
        for (var i = 0; i < scripts.length; i++) scripts[i].remove();
        return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    /**
     * Görünür metni satır listesine çevirir (Ahrefs Metin görünümüne yakın).
     * SPA’larda innerText tek parça dönebildiği için blok + etiket kırılımı kullanılır.
     */
    function linesFromSemanticBlocks(root) {
        var sel =
            'h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, figcaption, dt, dd, pre, caption, address, summary, [role="heading"]';
        var all = root.querySelectorAll(sel);
        var out = [];
        var i;
        var par;
        var hasAncestor;
        for (i = 0; i < all.length; i++) {
            var el = all[i];
            if (el.closest('script, style, noscript, svg, template')) continue;
            hasAncestor = false;
            par = el.parentElement;
            while (par && par !== root) {
                if (par.matches && par.matches(sel)) {
                    hasAncestor = true;
                    break;
                }
                par = par.parentElement;
            }
            if (hasAncestor) continue;
            if (el.querySelector(sel)) continue;
            var line = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
            if (line) out.push(line);
        }
        return out;
    }

    /**
     * Kapanış etiketlerinden yapay satır kırılımı (düz metin çıkarımı).
     */
    function linesFromBrokenHtml(clone, docRef) {
        var owner = docRef && docRef.createElement ? docRef : document;
        var html = clone.innerHTML || '';
        html = html.replace(/<br\s*\/?>/gi, '\n');
        html = html.replace(
            /<\/(p|h[1-6]|li|div|section|article|header|footer|nav|main|aside|tr|blockquote|figure)>/gi,
            '\n'
        );
        var div = owner.createElement('div');
        div.innerHTML = html;
        var text = div.textContent || '';
        return text
            .split('\n')
            .map(function (s) {
                return s.replace(/\s+/g, ' ').trim();
            })
            .filter(Boolean);
    }

    function extractBotViewTextLines(doc) {
        var body = doc.body;
        if (!body) return [];
        var clone = body.cloneNode(true);
        var rm = clone.querySelectorAll('script, style, noscript, svg, template');
        for (var i = 0; i < rm.length; i++) rm[i].remove();

        var primary = '';
        if (typeof clone.innerText === 'string') {
            primary = clone.innerText;
        } else {
            primary = clone.textContent || '';
        }
        primary = String(primary)
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n');

        var lines = primary
            .split('\n')
            .map(function (s) {
                return s.replace(/[ \t]+$/, '').trim();
            })
            .filter(Boolean);

        if (lines.length <= 3 && primary.length > 400) {
            lines = linesFromSemanticBlocks(clone);
        }
        if (lines.length <= 3 && primary.length > 400) {
            var broken = linesFromBrokenHtml(clone, doc);
            if (broken.length > lines.length) {
                lines = broken;
            }
        }
        if (!lines.length && primary.trim()) {
            lines = [primary.replace(/\s+/g, ' ').trim()];
        }
        return lines;
    }

    function extractBotViewPlainText(doc) {
        return extractBotViewTextLines(doc).join('\n');
    }

    function countWords(text) {
        if (!text || !text.trim()) return 0;
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    function countPhraseOccurrences(text, phrase) {
        if (!phrase || !phrase.trim()) return 0;
        var p = phrase.trim().replace(/\s+/g, ' ');
        var lower = text.toLowerCase();
        var needle = p.toLowerCase();
        var count = 0;
        var pos = 0;
        while (true) {
            var idx = lower.indexOf(needle, pos);
            if (idx === -1) break;
            count++;
            pos = idx + Math.max(needle.length, 1);
        }
        return count;
    }

    /**
     * h1–h6 veya role="heading" + aria-level (Web bileşenleri / erişilebilirlik).
     */
    function getHeadingLevel(el) {
        if (!el || el.nodeType !== 1) return 0;
        var tag = el.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) return parseInt(tag.charAt(1), 10);
        if (el.getAttribute && el.getAttribute('role') === 'heading') {
            var al = el.getAttribute('aria-level');
            if (al) {
                var n = parseInt(al, 10);
                if (n >= 1 && n <= 6) return n;
            }
        }
        return 0;
    }

    /**
     * Light DOM + açık shadow root’lar; canlı sayfada görsel sıra (çoğu SPA/Web Components için gerekli).
     */
    function collectHeadingSequence(doc) {
        var nodes = [];
        function walk(node) {
            if (!node) return;
            if (node.nodeType === 11) {
                for (var c = node.firstElementChild; c; c = c.nextElementSibling) walk(c);
                return;
            }
            if (node.nodeType !== 1) return;
            var lv = getHeadingLevel(node);
            if (lv) nodes.push(node);
            var ch = node.children;
            for (var i = 0; i < ch.length; i++) walk(ch[i]);
            if (node.shadowRoot) walk(node.shadowRoot);
        }
        var root = doc.body || doc.documentElement;
        if (root) walk(root);

        if (nodes.length > 1 && typeof nodes[0].getBoundingClientRect === 'function') {
            try {
                var r0 = nodes[0].getBoundingClientRect();
                var r1 = nodes[1].getBoundingClientRect();
                var hasLayout =
                    Math.abs(r0.top - r1.top) > 0.5 ||
                    Math.abs(r0.left - r1.left) > 0.5 ||
                    r0.width > 0 ||
                    r1.width > 0;
                if (hasLayout) {
                    nodes.sort(function (a, b) {
                        var ra = a.getBoundingClientRect();
                        var rb = b.getBoundingClientRect();
                        if (Math.abs(ra.top - rb.top) > 1) return ra.top - rb.top;
                        return ra.left - rb.left;
                    });
                }
            } catch (e) {
                /* yoksay — DFS sırası kalır */
            }
        }

        var list = [];
        for (var j = 0; j < nodes.length; j++) {
            list.push({
                level: getHeadingLevel(nodes[j]),
                text: (nodes[j].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            });
        }
        return list;
    }

    /**
     * H1–H6 sırası: ilk başlık H1 olmalı; seviye en fazla 1 artabilir (atlama yok).
     */
    function analyzeHeadingHierarchy(doc) {
        var list = collectHeadingSequence(doc);

        var errors = [];
        var h1Count = 0;
        for (var hi = 0; hi < list.length; hi++) {
            if (list[hi].level === 1) h1Count++;
        }

        if (list.length === 0) {
            return {
                ok: true,
                label: 'OK',
                status: 'OK',
                detail: 'Bu sayfada H1–H6 başlığı bulunmuyor; içerik tipine göre başlık eklemek isteyebilirsiniz.',
                sequence: [],
                h1Count: 0,
                errors: [],
            };
        }

        if (h1Count > 1) {
            errors.push({
                code: 'MULTIPLE_H1',
                message: 'Sayfada birden fazla H1 kullanılmış; tek sayfa için tek H1 önerilir.',
                fix: 'Fazla H1’leri birleştirin veya alt başlık seviyelerine (H2, H3) taşıyın.',
            });
        }

        if (list[0].level !== 1) {
            errors.push({
                code: 'FIRST_NOT_H1',
                message:
                    'İlk başlık H1 olmalı; şu an ilk sırada H' +
                    list[0].level +
                    ' var' +
                    (h1Count > 0 ? ' (H1 sayfada daha aşağıda görünüyor).' : '.'),
                fix:
                    h1Count > 0
                        ? 'H1’i içerik akışında en üste taşıyın veya üstteki H' +
                        list[0].level +
                        ' seviyesini düşürün.'
                        : 'Sayfayı H1 ile açın veya üstteki başlığı H1 yapın.',
            });
        }

        for (var k = 1; k < list.length; k++) {
            if (list[k].level === 1 && list[k - 1].level > 1) {
                errors.push({
                    code: 'H1_AFTER_LOWER',
                    message:
                        'H1, daha düşük seviyeli bir başlıktan (H' +
                        list[k - 1].level +
                        ') sonra geliyor; ana başlık genelde en üstte ve tek olmalıdır.',
                    fix: 'H1’i sayfanın başına taşıyın veya bu konumdaki H1’i H2/H3 yapın.',
                });
                break;
            }
        }

        for (var j = 1; j < list.length; j++) {
            var prev = list[j - 1].level;
            var curr = list[j].level;
            if (curr > prev + 1) {
                errors.push({
                    code: 'SKIP_LEVEL',
                    message:
                        'Başlık sırasında seviye atlanmış: H' +
                        prev +
                        ' sonrasında doğrudan H' +
                        curr +
                        ' var (arada H' +
                        (prev + 1) +
                        ' beklenir).',
                    fix:
                        'Araya eksik seviyeyi ekleyin veya başlık seviyelerini yeniden düzenleyin.',
                    afterHeading: list[j - 1].text,
                });
            }
        }

        var ok = errors.length === 0;
        return {
            ok: ok,
            label: ok ? 'OK' : 'Hata',
            status: ok ? 'OK' : 'Hata',
            detail: ok
                ? 'Başlık sırası şu an tutarlı görünüyor.'
                : errors.map(function (e) {
                    return e.message + ' ' + e.fix;
                }).join(' '),
            errors: errors,
            sequence: list,
            h1Count: h1Count,
        };
    }

    function normalizeComparableUrl(urlString) {
        try {
            var u = new URL(urlString);
            var path = u.pathname;
            if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
            return (u.origin + path + u.search).toLowerCase();
        } catch (e) {
            return '';
        }
    }

    function analyzeTitle(doc) {
        var t = doc.querySelector('title');
        var text = t ? (t.textContent || '').trim() : '';
        var len = text.length;
        var status;
        var label;
        if (len >= TITLE_MIN && len <= TITLE_MAX) {
            status = 'OK';
            label = 'OK';
        } else if (len < TITLE_MIN) {
            status = 'Kısa';
            label = 'Kısa';
        } else {
            status = 'Uzun';
            label = 'Uzun';
        }
        return {
            metric: 'Title',
            length: len,
            text: text.slice(0, 200),
            status: status,
            label: label,
            ok: status === 'OK',
            hint:
                status === 'OK'
                    ? 'Uzunluk, arama sonuçları için uygun bir aralıkta görünüyor.'
                    : status === 'Uzun'
                        ? 'Title Uzunluğu İdeal Uzunluk Olan 50 - 60 Karakter Barajını Geçiyor. Başlık SERP\'te Kesilebilir ve CTR Oranını Düşürebilir. 50 - 60 Karakter aralığında güncelleyin.'
                        : 'Arama sonuçlarında daha iyi görünmesi için yaklaşık ' +
                        TITLE_MIN +
                        '–' +
                        TITLE_MAX +
                        ' karakter aralığını hedefleyebilirsiniz.',
        };
    }

    function analyzeMetaDescription(doc) {
        var meta = doc.querySelector('meta[name="description"], meta[name="Description"]');
        var text = meta ? (meta.getAttribute('content') || '').trim() : '';
        var len = text.length;
        var status;
        if (!text) {
            return {
                metric: 'Meta Description',
                length: 0,
                text: '',
                status: 'Eksik',
                label: 'Eksik',
                ok: false,
                hint:
                    'Meta açıklaması eklemeniz, arama sonuçlarında sayfanızın özetinin görünmesine yardımcı olur.',
            };
        }
        if (len >= DESC_MIN && len <= DESC_MAX) {
            status = 'OK';
        } else if (len < DESC_MIN) {
            status = 'Kısa';
        } else {
            status = 'Uzun';
        }
        return {
            metric: 'Meta Description',
            length: len,
            text: text.slice(0, 300),
            status: status,
            label: status,
            ok: status === 'OK',
            hint:
                status === 'OK'
                    ? 'Meta açıklaması uzunluğu uygun görünüyor.'
                    : 'Özet metnini yaklaşık ' + DESC_MIN + '–' + DESC_MAX + ' karakter civarında tutmayı düşünebilirsiniz.',
        };
    }

    function analyzeH1(doc) {
        var seq = collectHeadingSequence(doc);
        var texts = [];
        var n = 0;
        for (var hi = 0; hi < seq.length; hi++) {
            if (seq[hi].level === 1) {
                n++;
                var tx = (seq[hi].text || '').trim();
                if (tx) texts.push(tx);
            }
        }
        var h1TextDisplay = '';
        if (n === 0) {
            h1TextDisplay = '';
        } else if (n === 1) {
            h1TextDisplay = texts[0] || '—';
        } else {
            h1TextDisplay = texts.length ? texts.slice(0, 5).join(' · ') + (texts.length > 5 ? ' …' : '') : '—';
        }
        var status;
        var label;
        if (n === 1) {
            status = 'OK';
            label = 'OK';
        } else if (n === 0) {
            status = 'Eksik';
            label = 'Eksik';
        } else {
            status = 'Hatalı';
            label = 'Birden fazla H1';
        }
        return {
            metric: 'H1',
            count: n,
            h1Text: h1TextDisplay,
            status: status,
            label: label,
            ok: n === 1,
            hint:
                n === 1
                    ? 'Sayfada tek bir H1 kullanımı SEO için uygundur.'
                    : n === 0
                        ? 'Sayfada H1 Etiketi Bulunamadı. SEO Açısından Her Sayfada 1 Adet H1 Etiketi Bulunmalıdır.'
                        : 'Birden Fazla H1 Kullanımı SEO Açısından Zararlıdır. Sadece Hedef Anahtar Kelimenizi H1 Yapmanız Önerilir.',
        };
    }

    /**
     * Sayfa URL'sine ait WebPage/Article JSON-LD tarihlerini toplar.
     */
    function validDateValue(value) {
        var raw = typeof value === 'string' ? value.trim() :
            value && typeof value === 'object' && value['@value'] ? String(value['@value']).trim() : '';
        return raw && !isNaN(new Date(raw).getTime()) ? raw : '';
    }

    function collectJsonLdDateFields(node, bucket, pageUrl) {
        if (node === null || node === undefined) return;
        if (Array.isArray(node)) {
            for (var i = 0; i < node.length; i++) collectJsonLdDateFields(node[i], bucket, pageUrl);
            return;
        }
        if (typeof node !== 'object') return;
        if (node['@graph'] && Array.isArray(node['@graph'])) {
            collectJsonLdDateFields(node['@graph'], bucket, pageUrl);
        }
        var types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        var isPage = types.some(function (type) {
            return type === 'WebPage' || type === 'Article' || type === 'NewsArticle' || type === 'BlogPosting';
        });
        if (!isPage) return;
        var nodeUrl = node.url || node.mainEntityOfPage || node['@id'];
        if (nodeUrl && typeof nodeUrl === 'object') nodeUrl = nodeUrl['@id'] || nodeUrl.url;
        if (nodeUrl && pageUrl && normalizeComparableUrl(new URL(String(nodeUrl), pageUrl).href) !== normalizeComparableUrl(pageUrl)) return;
        if (pageUrl && !nodeUrl && types.indexOf('WebPage') === -1) return;
        if (!bucket.publishedRaw) bucket.publishedRaw = validDateValue(node.datePublished);
        if (!bucket.modifiedRaw) bucket.modifiedRaw = validDateValue(node.dateModified);
    }

    function datesFromJsonLdScripts(doc, pageUrl) {
        var bucket = { publishedRaw: '', modifiedRaw: '' };
        var scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (var s = 0; s < scripts.length; s++) {
            var raw = (scripts[s].textContent || '').trim();
            if (!raw) continue;
            try {
                collectJsonLdDateFields(JSON.parse(raw), bucket, pageUrl);
            } catch (e) {
                /* yoksay */
            }
        }
        return bucket;
    }

    function getFirstMetaContent(doc, selectors) {
        for (var i = 0; i < selectors.length; i++) {
            var el = doc.querySelector(selectors[i]);
            if (el) {
                var c = (el.getAttribute('content') || '').trim();
                if (c) return c;
            }
        }
        return '';
    }

    function formatDateForDisplay(raw) {
        if (!raw) return '';
        var d = new Date(raw);
        if (!isNaN(d.getTime())) {
            try {
                return d.toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            } catch (e) {
                return String(raw).slice(0, 80);
            }
        }
        return String(raw).slice(0, 120);
    }

    /**
     * Yayın / güncelleme tarihi: meta, Open Graph ve JSON-LD.
     */
    function analyzePageDates(doc, pageUrl) {
        var jd = datesFromJsonLdScripts(doc, pageUrl);
        var pub = getFirstMetaContent(doc, [
            'meta[property="article:published_time"]',
            'meta[property="og:published_time"]',
            'meta[name="date"]',
            'meta[name="pubdate"]',
            'meta[itemprop="datePublished"]',
        ]);
        pub = validDateValue(pub);
        if (!pub) {
            var tPub = doc.querySelector('time[itemprop="datePublished"], [itemprop="datePublished"]');
            if (tPub) {
                pub = validDateValue((tPub.getAttribute('datetime') || '').trim() || (tPub.textContent || '').trim());
            }
        }
        if (!pub) pub = jd.publishedRaw;

        var mod = getFirstMetaContent(doc, [
            'meta[property="article:modified_time"]',
            'meta[property="og:updated_time"]',
            'meta[name="revised"]',
            'meta[itemprop="dateModified"]',
        ]);
        mod = validDateValue(mod);
        if (!mod) {
            var tMod = doc.querySelector('time[itemprop="dateModified"], [itemprop="dateModified"]');
            if (tMod) {
                mod = validDateValue((tMod.getAttribute('datetime') || '').trim() || (tMod.textContent || '').trim());
            }
        }
        if (!mod) mod = jd.modifiedRaw;

        function pack(raw) {
            raw = validDateValue(raw);
            if (!raw) {
                return { present: false, raw: '', display: '' };
            }
            return { present: true, raw: raw, display: formatDateForDisplay(raw) };
        }

        return {
            metric: 'Sayfa tarihleri',
            published: pack(pub),
            modified: pack(mod),
        };
    }

    function analyzeCanonical(doc, pageUrl) {
        var link = doc.querySelector('link[rel="canonical"], link[rel="Canonical"]');
        var href = link ? (link.getAttribute('href') || '').trim() : '';
        if (!href) {
            return {
                metric: 'Canonical',
                href: '',
                status: 'Eksik',
                label: 'Öneri',
                ok: false,
                hint: 'Canonical etiketi eklemeniz önerilir.',
            };
        }
        var resolved;
        try {
            resolved = new URL(href, pageUrl).href;
        } catch (e) {
            return {
                metric: 'Canonical',
                href: href,
                status: 'Hatalı',
                label: 'Geçersiz adres',
                ok: false,
                hint: 'Canonical bağlantısı okunamadı; adresi kontrol etmenizi öneririz.',
            };
        }
        var a = normalizeComparableUrl(pageUrl);
        var b = normalizeComparableUrl(resolved);
        var match = a === b;
        return {
            metric: 'Canonical',
            href: resolved,
            status: match ? 'OK' : 'Hatalı',
            label: match ? 'OK' : 'Uyumsuzluk',
            ok: match,
            hint: match
                ? 'Canonical adresi, bu sayfanın adresiyle uyumlu görünüyor.'
                : 'Canonical ile açık adres aynı değil; arama motorları için tek ve doğru URL’yi işaret etmek iyi olur.',
        };
    }

    function analyzeImagesAlt(doc) {
        var imgs = doc.querySelectorAll('img');
        var total = imgs.length;
        if (total === 0) {
            return {
                metric: 'Görsel Alt',
                total: 0,
                missing: 0,
                empty: 0,
                described: 0,
                missingSources: [],
                status: 'OK',
                label: 'OK',
                ok: true,
                hint: 'Sayfada görsel yok.',
            };
        }
        var missing = 0;
        var empty = 0;
        var described = 0;
        var missingSources = [];
        for (var i = 0; i < imgs.length; i++) {
            var alt = imgs[i].getAttribute('alt');
            if (alt === null) {
                missing++;
                missingSources.push(imgs[i].getAttribute('src') || '');
            } else if (String(alt).trim() === '') {
                empty++;
            } else {
                described++;
            }
        }
        var ok = missing === 0;
        return {
            metric: 'Görsel Alt',
            total: total,
            missing: missing,
            empty: empty,
            described: described,
            missingSources: missingSources,
            status: ok ? 'OK' : 'Uyarı',
            label: ok ? 'OK' : 'Alt niteliği eksik',
            ok: ok,
            hint: ok
                ? 'Tüm görsellerde alt niteliği var; boş değerlerin dekoratif kullanımı ayrıca gözden geçirilmelidir.'
                : 'Alt niteliği olmayan görsellere bağlama uygun alt metni veya dekoratifse alt="" ekleyin.',
        };
    }

    function analyzeWordCount(doc) {
        var text = getVisibleText(doc);
        var words = countWords(text);
        var ok = words >= MIN_WORDS;
        return {
            metric: 'İçerik Uzunluğu',
            words: words,
            status: ok ? 'OK' : 'Öneri',
            label: ok ? 'OK' : 'Kısa',
            ok: ok,
            hint: ok
                ? 'İçerik uzunluğu yeterli (' + MIN_WORDS + '+ kelime).'
                : 'İçerik kısa, en az ' + MIN_WORDS + ' kelime önerilir',
        };
    }

    function analyzeOpenGraph(doc) {
        var metas = doc.querySelectorAll('meta[property^="og:"]');
        var found = {};
        var ogTags = [];
        for (var i = 0; i < metas.length; i++) {
            var prop = metas[i].getAttribute('property');
            var content = (metas[i].getAttribute('content') || '').trim();
            if (prop) {
                var pl = prop.toLowerCase();
                if (content) found[pl] = true;
                ogTags.push({ property: pl, value: content || null });
            }
        }
        var missing = [];
        for (var j = 0; j < OG_EXPECTED.length; j++) {
            var key = OG_EXPECTED[j];
            if (!found[key]) missing.push(key);
        }
        var ok = missing.length === 0;
        return {
            metric: 'Open Graph',
            found: Object.keys(found),
            missing: missing,
            ogTags: ogTags,
            status: ok ? 'OK' : 'Eksik',
            label: ok ? 'OK' : 'Eksik etiket',
            ok: ok,
            hint: ok
                ? 'Paylaşım önizlemeleri için temel OG etiketleri mevcut görünüyor.'
                : missing.length
                    ? 'Eksik Open Graph etiketleri: ' + missing.join(', ') + '.'
                    : '',
        };
    }

    /** Şema türü: Schema.org / JSON-LD İngilizce adı (Organization, WebSite, …). */
    function schemaTypeEnglish(raw) {
        var s = String(raw || '');
        if (s.indexOf('JSON-LD (parse') === 0) return 'JSON-LD (parse error)';
        if (s.indexOf('JSON-LD: ') === 0) s = s.substring(9).trim();
        else if (s.indexOf('Microdata: ') === 0) {
            var rest = s.substring(11).trim();
            try {
                var u = new URL(rest);
                var seg = u.pathname.split('/').filter(Boolean).pop();
                s = (seg || rest).split('#').pop();
            } catch (e) {
                s = rest.split('/').pop() || rest;
                s = s.split('#').pop();
            }
        }
        return s.trim();
    }

    function extractSchemaTypes(doc) {
        var types = [];
        var scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (var i = 0; i < scripts.length; i++) {
            var raw = (scripts[i].textContent || '').trim();
            if (!raw) continue;
            try {
                var data = JSON.parse(raw);
                collectJsonLdTypes(data, types);
            } catch (e) {
                types.push({ type: 'JSON-LD (parse hatası)', raw: raw.slice(0, 80) });
            }
        }
        var items = doc.querySelectorAll('[itemtype]');
        for (var k = 0; k < items.length; k++) {
            var it = items[k].getAttribute('itemtype');
            if (it) types.push({ type: 'Microdata: ' + it });
        }
        return types;
    }

    function collectJsonLdTypes(node, out) {
        if (node === null || node === undefined) return;
        if (Array.isArray(node)) {
            for (var i = 0; i < node.length; i++) collectJsonLdTypes(node[i], out);
            return;
        }
        if (typeof node === 'object') {
            if (node['@graph'] && Array.isArray(node['@graph'])) {
                collectJsonLdTypes(node['@graph'], out);
            }
            var t = node['@type'];
            if (t) {
                var list = Array.isArray(t) ? t : [t];
                for (var j = 0; j < list.length; j++) out.push({ type: 'JSON-LD: ' + String(list[j]) });
            }
            for (var key in node) {
                if (key === '@type' || key === '@context') continue;
                if (typeof node[key] === 'object') collectJsonLdTypes(node[key], out);
            }
        }
    }

    function analyzeSchema(doc) {
        var schemas = extractSchemaTypes(doc);
        var unique = [];
        var seen = {};
        for (var i = 0; i < schemas.length; i++) {
            var s = schemas[i].type;
            if (!seen[s]) {
                seen[s] = true;
                var item = schemas[i];
                item.label = schemaTypeEnglish(item.type);
                unique.push(item);
            }
        }
        var count = unique.length;
        var ok = count >= 10;
        var hint;
        var status;
        var label;
        if (count >= 10) {
            status = 'OK';
            label = 'OK';
            hint = count + ' farklı şema türü tespit edildi (arama motorları için zengin sonuç).';
        } else if (count === 0) {
            status = 'Eksik';
            label = 'Yok';
            hint =
                'Sayfada yapılandırılmış veri (şema) bulunamadı. Arama Motorlarının Sitenizi Daha İyi Anlaması İçin Schema Eklemelisiniz.';
        } else {
            status = 'Zayıf';
            label = 'Zayıf';
            hint =
                'Yetersiz ve Zayıf Schema Türü Hatası. ' + count + ' farklı şema türü tespit edildi.';
        }
        return {
            metric: 'Yapılandırılmış veri',
            items: unique,
            count: count,
            status: status,
            label: label,
            ok: ok,
            hint: hint,
        };
    }

    function analyzeKeywordDensity(doc, keyword) {
        if (!keyword || !String(keyword).trim()) {
            return {
                metric: 'Anahtar Kelime Yoğunluğu',
                density: null,
                status: '—',
                label: '—',
                ok: true,
                hint: 'Anahtar kelime girilmedi; yoğunluk kontrolü atlandı.',
            };
        }
        var text = getVisibleText(doc);
        var totalWords = countWords(text);
        if (totalWords === 0) {
            return {
                metric: 'Hedef kelime dengesi',
                density: 0,
                fillPercent: 0,
                status: 'Bilgi',
                label: 'Metin yok',
                ok: false,
                hint: 'Bu sayfada okunabilir metin bulunamadı; analiz için içerik gerekir.',
            };
        }
        var phrase = String(keyword).trim();
        var occ = countPhraseOccurrences(text, phrase);
        var phraseWords = countWords(phrase);
        var contributing = occ * Math.max(phraseWords, 1);
        var density = (contributing / totalWords) * 100;
        var rounded = Math.round(density * 100) / 100;
        var ok = density <= KEYWORD_DENSITY_MAX;
        var fillPercent = Math.min(100, Math.round((rounded / KEYWORD_DENSITY_MAX) * 100));
        return {
            metric: 'Hedef kelime dengesi',
            keyword: phrase,
            density: rounded,
            fillPercent: fillPercent,
            status: ok ? 'OK' : 'Öneri',
            label: ok ? 'OK' : 'İyileştirme önerisi',
            ok: ok,
            hint: ok
                ? 'Hedef kelimeniz metinle uyumlu bir sıklıkta görünüyor.'
                : 'Hedef kelime metinde Çok Sık Tekrarlanıyor. Keyword Stuffing Oluşturabilir ve Spam Cezası verilebilir. Doğal akış için alternatif kelimeler ile değiştirin. Anahtar Kelime Yoğunluğunu Azaltın.',
        };
    }

    function includesKeyword(text, keyword) {
        var source = String(text || '').trim().toLowerCase();
        var needle = String(keyword || '').trim().toLowerCase();
        if (!source || !needle) return false;
        return source.indexOf(needle) !== -1;
    }

    function analyzePremiumKeywordSignals(doc, keyword, parts) {
        if (!keyword || !String(keyword).trim()) return null;
        var phrase = String(keyword).trim();
        var visibleText = getVisibleText(doc);
        var first100 = visibleText.split(/\s+/).filter(Boolean).slice(0, 100).join(' ');
        var h1Nodes = collectHeadingSequence(doc).filter(function (x) { return x.level === 1; });
        var h1Texts = h1Nodes.map(function (x) { return x.text || ''; });
        var imgs = doc.querySelectorAll('img');
        var altKeywordUsed = false;
        for (var i = 0; i < imgs.length; i++) {
            var alt = (imgs[i].getAttribute('alt') || '').trim();
            if (includesKeyword(alt, phrase)) {
                altKeywordUsed = true;
                break;
            }
        }

        var checks = [
            {
                key: 'title_keyword',
                label: 'Anahtar kelime title içinde',
                ok: includesKeyword(parts.title.text, phrase),
            },
            {
                key: 'title_length',
                label: 'Title uzunluğu 40-60',
                ok: parts.title.length >= 40 && parts.title.length <= 60,
            },
            {
                key: 'meta_keyword',
                label: 'Anahtar kelime meta description içinde',
                ok: includesKeyword(parts.meta.text, phrase),
            },
            {
                key: 'meta_length',
                label: 'Description uzunluğu 140-160',
                ok: parts.meta.length >= 140 && parts.meta.length <= 160,
            },
            {
                key: 'first_100_words',
                label: 'Anahtar kelime ilk 100 kelimede',
                ok: includesKeyword(first100, phrase),
            },
            {
                key: 'h1_keyword',
                label: 'H1 içinde anahtar kelime',
                ok: h1Texts.some(function (t) { return includesKeyword(t, phrase); }),
            },
            {
                key: 'single_h1',
                label: 'Tek H1 kullanımı',
                ok: parts.h1.count === 1,
            },
            {
                key: 'h1_h6_hierarchy',
                label: 'H1-H6 hiyerarşisi',
                ok: !!parts.hierarchy.ok,
            },
            {
                key: 'keyword_density',
                label: 'Anahtar kelime yoğunluğu uygun',
                ok: parts.keyword && parts.keyword.density !== null ? !!parts.keyword.ok : false,
            },
            {
                key: 'schema_quality',
                label: 'Teknik SEO schemaları yeterli',
                ok: !!parts.schema.ok,
            },
            {
                key: 'canonical',
                label: 'Canonical doğru',
                ok: !!parts.canonical.ok,
            },
            {
                key: 'content_length',
                label: 'İçerik uzunluğu yeterli',
                ok: !!parts.wordCount.ok,
            },
            {
                key: 'alt_missing',
                label: 'Alt niteliği eksiği yok',
                ok: parts.imagesAlt.missing === 0,
            },
            {
                key: 'alt_keyword_usage',
                label: 'Alt textlerde anahtar kelime var',
                ok: altKeywordUsed,
            },
            {
                key: 'open_graph',
                label: 'Open Graph etiketleri tam',
                ok: !!parts.openGraph.ok,
            },
        ];

        var passed = checks.filter(function (c) { return c.ok; }).length;
        return {
            metric: 'Premium anahtar kelime teknik analizi',
            keyword: phrase,
            checks: checks,
            passed: passed,
            total: checks.length,
            score: Math.round((passed / checks.length) * 100),
        };
    }

    /**
     * @param {'full'|'technical'|'content'} mode
     *   full — tüm metrikler (anahtar kelime yoğunluğu girildiyse dahil);
     *   technical — Teknik SEO sekmesi: title…schema + H1 sayısı (hiyerarşi cezası yok; içerik sekmesinde detay);
     *   content — İçerik sekmesi: H1, hiyerarşi, anahtar kelime yoğunluğu.
     */
    function computeScore(parts, mode) {
        mode = mode || 'full';
        var score = 100;
        var deductions = [];

        function sub(points, reason) {
            score -= points;
            deductions.push({ points: points, reason: reason });
        }

        if (mode === 'full') {
            if (!parts.title.ok) sub(10, 'Title uzunluğu');
            if (!parts.meta.ok) sub(10, 'Meta description');
            if (!parts.h1.ok) sub(15, 'H1');
            if (!parts.hierarchy.ok) sub(15, 'H1–H6 hiyerarşisi');
            if (!parts.canonical.ok) sub(10, 'Canonical');
            if (!parts.imagesAlt.ok) sub(5, 'Alt metinleri');
            if (!parts.wordCount.ok) sub(10, 'İçerik uzunluğu');
            if (!parts.openGraph.ok) sub(5, 'Open Graph');
            if (!parts.schema.ok) sub(3, 'Yapılandırılmış veri');
            if (parts.keyword && parts.keyword.density !== null && !parts.keyword.ok) sub(10, 'Anahtar kelime yoğunluğu');
        } else if (mode === 'technical') {
            if (!parts.title.ok) sub(10, 'Title uzunluğu');
            if (!parts.meta.ok) sub(10, 'Meta description');
            if (!parts.h1.ok) sub(15, 'H1');
            if (!parts.canonical.ok) sub(10, 'Canonical');
            if (!parts.imagesAlt.ok) sub(5, 'Alt metinleri');
            if (!parts.wordCount.ok) sub(10, 'İçerik uzunluğu');
            if (!parts.openGraph.ok) sub(5, 'Open Graph');
            if (!parts.schema.ok) sub(3, 'Yapılandırılmış veri');
        } else if (mode === 'content') {
            if (!parts.h1.ok) sub(15, 'H1');
            if (!parts.hierarchy.ok) sub(15, 'H1–H6 hiyerarşisi');
            if (parts.keyword && parts.keyword.density !== null && !parts.keyword.ok) sub(10, 'Anahtar kelime yoğunluğu');
        }

        if (score < 0) score = 0;
        return { score: Math.round(score), deductions: deductions };
    }

    /**
     * @param {Document} doc
     * @param {string} pageUrl - sayfanın tam URL’si
     * @param {{ targetKeyword?: string }} options
     */
    function analyzeDocument(doc, pageUrl, options) {
        options = options || {};
        var title = analyzeTitle(doc);
        var meta = analyzeMetaDescription(doc);
        var h1 = analyzeH1(doc);
        var hierarchy = analyzeHeadingHierarchy(doc);
        var canonical = analyzeCanonical(doc, pageUrl);
        var imagesAlt = analyzeImagesAlt(doc);
        var wordCount = analyzeWordCount(doc);
        var openGraph = analyzeOpenGraph(doc);
        var schema = analyzeSchema(doc);
        var keyword = analyzeKeywordDensity(doc, options.targetKeyword);
        var premiumKeyword = analyzePremiumKeywordSignals(doc, options.targetKeyword, {
            title: title,
            meta: meta,
            h1: h1,
            hierarchy: hierarchy,
            canonical: canonical,
            imagesAlt: imagesAlt,
            wordCount: wordCount,
            openGraph: openGraph,
            schema: schema,
            keyword: keyword,
        });
        var pageDates = analyzePageDates(doc, pageUrl);

        var parts = {
            title: title,
            meta: meta,
            h1: h1,
            hierarchy: hierarchy,
            canonical: canonical,
            imagesAlt: imagesAlt,
            wordCount: wordCount,
            openGraph: openGraph,
            schema: schema,
            keyword: keyword,
            premiumKeyword: premiumKeyword,
            pageDates: pageDates,
        };

        var scoringFull = computeScore(parts, 'full');
        var scoringTechnical = computeScore(parts, 'technical');
        var scoringContent = computeScore(parts, 'content');

        return {
            pageUrl: pageUrl,
            analyzedAt: new Date().toISOString(),
            parts: parts,
            score: scoringFull.score,
            scoreTechnical: scoringTechnical.score,
            scoreContent: scoringContent.score,
            scoreDetail: scoringFull.deductions,
        };
    }

    function parseHtmlToDocument(html, pageUrl) {
        var parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }

    function analyzeHtmlString(html, pageUrl, options) {
        var doc = parseHtmlToDocument(html, pageUrl);
        return analyzeDocument(doc, pageUrl, options);
    }

    function metaByProperty(doc, prop) {
        var el = doc.querySelector('meta[property="' + prop + '"]');
        return el ? (el.getAttribute('content') || '').trim() : '';
    }

    function metaByName(doc, name) {
        var el = doc.querySelector('meta[name="' + name + '"], meta[property="' + name + '"]');
        return el ? (el.getAttribute('content') || '').trim() : '';
    }

    /** Şema önerisi: alt türler üst kavramı karşılar (ör. Restaurant → LocalBusiness). */
    var SCHEMA_HINT_SATISFIES = {
        localbusiness: [
            'localbusiness',
            'restaurant',
            'foodestablishment',
            'store',
            'dentist',
            'pharmacy',
            'hotel',
            'lodgingbusiness',
        ],
        organization: ['organization', 'newsmediaorganization', 'corporation', 'brand', 'educationalorganization'],
        webpage: ['webpage', 'collectionpage', 'itempage', 'contactpage', 'aboutpage'],
        website: ['website'],
        service: ['service', 'professionalservice', 'financialservice', 'taxiservice', 'homeservice'],
        professionalservice: ['professionalservice', 'service', 'localbusiness'],
        product: ['product', 'productgroup', 'productmodel'],
        itemlist: ['itemlist', 'collectionpage'],
        breadcrumblist: ['breadcrumblist'],
        faqpage: ['faqpage'],
        person: ['person'],
        physician: ['physician', 'medicalbusiness'],
        newsarticle: ['newsarticle', 'article', 'blogposting', 'scholarlyarticle'],
        article: ['article', 'newsarticle', 'blogposting'],
        blogposting: ['blogposting', 'article', 'newsarticle'],
        newsmediaorganization: ['newsmediaorganization', 'organization'],
        softwareapplication: ['softwareapplication', 'webapplication', 'mobileapplication'],
        webapplication: ['webapplication', 'softwareapplication'],
        recipe: ['recipe'],
        course: ['course', 'learningresource'],
        educationalorganization: ['educationalorganization', 'collegeoruniversity', 'school', 'university'],
        event: ['event', 'businessevent', 'musicevent', 'theaterevent', 'sportsevent'],
        eventseries: ['eventseries', 'event'],
        contactpage: ['contactpage', 'webpage'],
        medicalorganization: [
            'medicalorganization',
            'hospital',
            'medicalclinic',
            'dentist',
            'physician',
            'pharmacy',
            'veterinarycare',
            'optician',
            'primarycare',
            'communityhealth',
            'emergency',
            'medicalbusiness',
        ],
        hospital: ['hospital', 'medicalorganization'],
        medicalclinic: ['medicalclinic', 'medicalorganization'],
        dentist: ['dentist', 'medicalorganization'],
        pharmacy: ['pharmacy', 'medicalorganization'],
        medicalwebpage: ['medicalwebpage', 'webpage'],
        medicalscholarlyarticle: ['medicalscholarlyarticle', 'scholarlyarticle'],
        medicalcondition: [
            'medicalcondition',
            'infectiousdisease',
            'medicalsignorsymptom',
            'pathologicalprocess',
            'psychologicalcondition',
        ],
        drug: ['drug', 'drugclass', 'dietarysupplement'],
        medicalprocedure: [
            'medicalprocedure',
            'therapeuticprocedure',
            'surgicalprocedure',
            'diagnosticprocedure',
            'palliativeprocedure',
            'percutaneousprocedure',
            'physicaltherapy',
        ],
        medicaltest: ['medicaltest', 'pathologytest', 'bloodtest', 'medicalimaging', 'imagingtest'],
        medicalguideline: ['medicalguideline'],
        videoobject: ['videoobject'],
        howto: ['howto'],
        speakablespecification: ['speakablespecification'],
        offer: ['offer', 'aggregateoffer'],
        aggregateoffer: ['aggregateoffer', 'offer'],
        review: ['review'],
        aggregaterating: ['aggregaterating'],
        brand: ['brand'],
        merchantreturnpolicy: ['merchantreturnpolicy'],
        onlinestore: ['onlinestore', 'store'],
        store: ['store', 'onlinestore', 'localbusiness'],
        itempage: ['itempage'],
        imageobject: ['imageobject'],
        imagegallery: ['imagegallery'],
        productgroup: ['productgroup'],
        liveblogposting: ['liveblogposting'],
        techarticle: ['techarticle'],
        podcastseries: ['podcastseries'],
        podcastepisode: ['podcastepisode'],
        discussionforumposting: ['discussionforumposting'],
        openinghoursspecification: ['openinghoursspecification'],
        place: ['place', 'administrativearea', 'city', 'country'],
        postaladdress: ['postaladdress'],
        contactpoint: ['contactpoint'],
        aboutpage: ['aboutpage'],
        profilepage: ['profilepage'],
        corporation: ['corporation'],
        ngo: ['ngo'],
        governmentorganization: ['governmentorganization'],
        jobposting: ['jobposting'],
        webapi: ['webapi'],
        mobileapplication: ['mobileapplication', 'softwareapplication'],
        dataset: ['dataset'],
        nutritioninformation: ['nutritioninformation'],
        courseinstance: ['courseinstance'],
        learningresource: ['learningresource'],
        occupation: ['occupation'],
        collegeoruniversity: ['collegeoruniversity', 'educationalorganization', 'university'],
        school: ['school', 'educationalorganization'],
        businessevent: ['businessevent', 'event'],
        musicevent: ['musicevent', 'event'],
        theaterevent: ['theaterevent', 'event'],
        sportsevent: ['sportsevent', 'event'],
    };

    function collectCanonicalSchemaTypeSet(doc) {
        var schemas = extractSchemaTypes(doc);
        var seenRaw = {};
        var set = {};
        for (var i = 0; i < schemas.length; i++) {
            var raw = schemas[i].type;
            if (seenRaw[raw]) continue;
            seenRaw[raw] = true;
            var en = schemaTypeEnglish(raw);
            if (!en || en.indexOf('parse') !== -1) continue;
            var parts = en.split(/[,/|]/);
            for (var p = 0; p < parts.length; p++) {
                var t = parts[p].trim().toLowerCase().replace(/\s+/g, '');
                if (t) set[t] = true;
            }
        }
        return set;
    }

    function typePresentInSet(typeSet, canonical) {
        var key = canonical.toLowerCase().replace(/\s+/g, '');
        var candidates = SCHEMA_HINT_SATISFIES[key];
        if (!candidates) candidates = [key];
        for (var i = 0; i < candidates.length; i++) {
            if (typeSet[candidates[i]]) return true;
        }
        return false;
    }

    var SCHEMA_HINT_LIST = {
        ecommerce: [
            { type: 'WebSite', detailTr: 'SearchAction, publisher, potentialAction; site içi arama ve dil.' },
            {
                type: 'Organization veya Brand',
                detailTr: 'Satıcı / marka kimliği; logo, sameAs, müşteri hizmetleri.',
                checkAny: ['Organization', 'Brand'],
            },
            { type: 'WebPage veya ItemPage', detailTr: 'PDP ve kategori üstü sayfa; isPartOf ilişkisi.', checkAny: ['WebPage', 'ItemPage'] },
            { type: 'BreadcrumbList', detailTr: 'Kategori → alt kategori → ürün iz düşümü.' },
            { type: 'Product', detailTr: 'sku, gtin, brand, color/size varyantları, offers, review, isVariantOf.' },
            { type: 'Offer veya AggregateOffer', detailTr: 'Fiyat, stok, satıcı, kargo, teslimat süresi.', checkAny: ['Offer', 'AggregateOffer'] },
            { type: 'Review veya AggregateRating', detailTr: 'Yıldız ve yorum snippet’leri.', checkAny: ['Review', 'AggregateRating'] },
            { type: 'MerchantReturnPolicy', detailTr: 'İade süresi, ücret ve koşullar (ürün veya mağaza düzeyi).' },
            {
                type: 'ItemList, CollectionPage veya Store',
                detailTr: 'Liste vitrini, koleksiyon veya fiziksel / online mağaza.',
                checkAny: ['ItemList', 'CollectionPage', 'Store'],
            },
            { type: 'ProductGroup', detailTr: 'Varyant ailesi (renk, beden, paket seçenekleri).' },
            { type: 'FAQPage', detailTr: 'Ürün, kargo, ödeme ve iade SSS.' },
            { type: 'VideoObject', detailTr: 'Ürün tanıtım, kurulum ve güvenlik videoları.' },
            { type: 'HowTo', detailTr: 'Montaj, kullanım ve bakım adımları.' },
            { type: 'ImageObject', detailTr: 'Ürün görseli veya ImageGallery düğümleri.' },
            {
                type: 'LocalBusiness veya OnlineStore',
                detailTr: 'Mağazadan teslim al, showroom veya yerel satıcı.',
                checkAny: ['LocalBusiness', 'OnlineStore'],
            },
            { type: 'Person', detailTr: 'Satıcı veya marka yüzü (influencer iş birliği).' },
            { type: 'SpeakableSpecification', detailTr: 'Sesli asistan için kısa ürün özeti (opsiyonel).' },
        ],
        news: [
            { type: 'WebSite', detailTr: 'SearchAction, inLanguage, publisher, RSS / alternates.' },
            {
                type: 'Organization veya NewsMediaOrganization',
                detailTr: 'Yayıncı kimliği; sameAs ve doğrulanmış hesaplar.',
                checkAny: ['Organization', 'NewsMediaOrganization'],
            },
            {
                type: 'NewsArticle, Article, BlogPosting, LiveBlogPosting veya TechArticle',
                detailTr: 'Haber veya analiz; headline, datePublished, dateModified, author.',
                checkAny: ['NewsArticle', 'Article', 'BlogPosting', 'LiveBlogPosting', 'TechArticle'],
            },
            { type: 'WebPage', detailTr: 'Sayfa düzeyi isPartOf, speakable ve ana varlık.' },
            { type: 'BreadcrumbList', detailTr: 'Bölüm, konu ve etiket hiyerarşisi.' },
            { type: 'Person', detailTr: 'Yazar, editör veya muhabir profili.' },
            { type: 'ImageObject', detailTr: 'Kapak görseli ve foto haber meta verisi.' },
            { type: 'VideoObject', detailTr: 'Video haber, canlı yayın kaydı veya embed.' },
            {
                type: 'PodcastSeries veya PodcastEpisode',
                detailTr: 'Sesli haber veya podcast bölümleri.',
                checkAny: ['PodcastSeries', 'PodcastEpisode'],
            },
            { type: 'DiscussionForumPosting', detailTr: 'Forum köşesi veya okur yorumları (topluluk).' },
            { type: 'FAQPage', detailTr: 'SSS, fact-check veya düzeltme kutusu.' },
            { type: 'ItemList', detailTr: 'Manşet, öne çıkanlar, etiket ve konu listeleri.' },
            { type: 'SpeakableSpecification', detailTr: 'Sesli özet (opsiyonel).' },
        ],
        service: [
            { type: 'WebSite', detailTr: 'SearchAction; hizmet bölgesi ve dil.' },
            {
                type: 'LocalBusiness, Organization veya ProfessionalService',
                detailTr: 'İşletme kimliği; adres, geo, telefon, openingHours.',
                checkAny: ['LocalBusiness', 'Organization', 'ProfessionalService'],
            },
            { type: 'Service', detailTr: 'Hizmet adı, sağlayıcı, hizmet alanı, süre ve kapsam.' },
            { type: 'WebPage veya ContactPage', detailTr: 'Hizmet açıklaması, teklif veya iletişim.', checkAny: ['WebPage', 'ContactPage'] },
            { type: 'BreadcrumbList', detailTr: 'Konum, kategori ve hizmet hiyerarşisi.' },
            { type: 'FAQPage', detailTr: 'Süreç, fiyat, garanti ve iptal SSS.' },
            { type: 'Review veya AggregateRating', detailTr: 'Müşteri yorumları ve ortalama puan.', checkAny: ['Review', 'AggregateRating'] },
            { type: 'OpeningHoursSpecification', detailTr: 'Çalışma saatleri (şube bazlı veya özel günler).' },
            { type: 'Place veya PostalAddress', detailTr: 'Hizmet bölgesi, şube veya adres.', checkAny: ['Place', 'PostalAddress'] },
            { type: 'Offer', detailTr: 'Teklif, paket fiyatı veya ücretsiz ön görüşme.' },
            { type: 'ImageObject', detailTr: 'Ekip, araç, önce/sonra veya showroom.' },
            { type: 'VideoObject', detailTr: 'Hizmet tanıtım ve referans videoları.' },
            { type: 'HowTo', detailTr: 'Randevu, keşif veya başvuru adımları.' },
            { type: 'ItemList', detailTr: 'Hizmet paketleri, şube veya uzman listesi.' },
            { type: 'Person', detailTr: 'Uzman, danışman veya ekip üyesi.' },
            { type: 'JobPosting', detailTr: 'Kariyer ve iş ilanı sayfaları.' },
        ],
        corporate: [
            { type: 'Organization', detailTr: 'logo, address, contactPoint, sameAs, foundingDate, legalName.' },
            {
                type: 'Corporation, NGO veya GovernmentOrganization',
                detailTr: 'Mümkünse hukukî alt tür (anonim, STK, kamu kurumu) ile netleştirin.',
                checkAny: ['Corporation', 'NGO', 'GovernmentOrganization'],
            },
            { type: 'WebSite', detailTr: 'SearchAction, site haritası ve çoklu dil.' },
            { type: 'WebPage, AboutPage veya ContactPage', detailTr: 'Kurumsal, hakkımızda, iletişim ve yasal.', checkAny: ['WebPage', 'AboutPage', 'ContactPage'] },
            { type: 'BreadcrumbList', detailTr: 'İç site ve bölüm hiyerarşisi.' },
            { type: 'Brand', detailTr: 'Alt markalar ve ürün hatları.' },
            { type: 'FAQPage', detailTr: 'Yatırımcı, tedarikçi veya müşteri SSS.' },
            { type: 'Person', detailTr: 'Yönetim kurulu veya ekip.' },
            { type: 'JobPosting', detailTr: 'Açık pozisyonlar ve başvuru.' },
            { type: 'Event', detailTr: 'Webinar, lansman, genel kurul veya fuar.' },
            { type: 'LocalBusiness', detailTr: 'Genel merkez veya tek şube (adres).' },
            { type: 'VideoObject', detailTr: 'Kurumsal film ve yıllık rapor özeti.' },
            { type: 'ImageObject', detailTr: 'Logo varyantları ve tesis görselleri.' },
            { type: 'ItemList', detailTr: 'Ofis, şube veya iştirak listesi.' },
            { type: 'HowTo', detailTr: 'Başvuru, tedarik veya süreç rehberleri.' },
            { type: 'Article veya BlogPosting', detailTr: 'Kurumsal blog ve basın bültenleri.', checkAny: ['Article', 'BlogPosting'] },
        ],
        saas: [
            {
                type: 'SoftwareApplication, WebApplication veya MobileApplication',
                detailTr: 'Uygulama adı, sürüm, işletim sistemi, featureList, permissions.',
                checkAny: ['SoftwareApplication', 'WebApplication', 'MobileApplication'],
            },
            { type: 'Organization', detailTr: 'Şirket ve marka; sameAs, yatırımcı ve yasal bilgi.' },
            { type: 'WebSite', detailTr: 'Dokümantasyon, durum sayfası ve blog bağlantıları.' },
            { type: 'WebPage', detailTr: 'Özellik, fiyatlandırma, SLA ve güvenlik sayfaları.' },
            { type: 'BreadcrumbList', detailTr: 'Dokümantasyon ve ürün hiyerarşisi.' },
            { type: 'Product', detailTr: 'Plan / paket; abonelik, deneme ve Offer koşulları.' },
            { type: 'Offer veya AggregateOffer', detailTr: 'Net fiyatlandırma, para birimi ve faturalama.', checkAny: ['Offer', 'AggregateOffer'] },
            { type: 'Review veya AggregateRating', detailTr: 'Kullanıcı ve G2/Capterra tarzı puanlar.', checkAny: ['Review', 'AggregateRating'] },
            { type: 'FAQPage', detailTr: 'SSS, faturalama ve teknik destek.' },
            { type: 'TechArticle veya Article', detailTr: 'Changelog, teknik makale ve duyurular.', checkAny: ['TechArticle', 'Article'] },
            { type: 'WebAPI', detailTr: 'API referans, endpoint ve şema açıklamaları.' },
            { type: 'VideoObject', detailTr: 'Onboarding, webinar ve eğitim videoları.' },
            { type: 'HowTo', detailTr: 'Entegrasyon ve kurulum adımları.' },
            { type: 'ItemList', detailTr: 'Entegrasyonlar, modüller veya fiyat planları.' },
            { type: 'Dataset', detailTr: 'Örnek veri veya açık veri (API dokümanı).' },
            { type: 'ContactPoint veya ContactPage', detailTr: 'Satış, destek ve güvenlik iletişimi.', checkAny: ['ContactPoint', 'ContactPage'] },
            { type: 'SpeakableSpecification', detailTr: 'Sesli özet (opsiyonel).' },
        ],
        recipe: [
            { type: 'Recipe', detailTr: 'ingredients, recipeInstructions, nutrition, image, totalTime, recipeYield.' },
            { type: 'Organization', detailTr: 'Site veya içerik markası.' },
            { type: 'WebSite', detailTr: 'Yemek bölümü veya tam site bağlamı.' },
            { type: 'WebPage', detailTr: 'Tarif URL’si ve sayfa kimliği.' },
            { type: 'BreadcrumbList', detailTr: 'Kategori → alt kategori → tarif.' },
            { type: 'Person', detailTr: 'Şef veya içerik üreticisi.' },
            { type: 'ImageObject', detailTr: 'Tamamlanmış tabak veya adım görselleri.' },
            { type: 'VideoObject', detailTr: 'Videolu tarif veya kısa format.' },
            { type: 'Article veya BlogPosting', detailTr: 'Hikayeli içerik veya blog girişi.', checkAny: ['Article', 'BlogPosting'] },
            { type: 'Review veya AggregateRating', detailTr: 'Tarif puanı ve kullanıcı yorumu.', checkAny: ['Review', 'AggregateRating'] },
            { type: 'NutritionInformation', detailTr: 'Makro / mikro besin değerleri (Recipe ile ilişkili).' },
            { type: 'FAQPage', detailTr: 'Alerjen, porsiyon veya diyet SSS.' },
            { type: 'HowTo', detailTr: 'Adım adım tarif (Recipe ile birlikte veya ayrı).' },
            { type: 'ItemList', detailTr: 'Benzer tarifler veya menü listesi.' },
            { type: 'SpeakableSpecification', detailTr: 'Sesli malzeme özeti (opsiyonel).' },
        ],
        education: [
            {
                type: 'Course, EducationalOrganization, CollegeOrUniversity veya School',
                detailTr: 'Program veya kurum; akreditasyon, adres ve iletişim.',
                checkAny: ['Course', 'EducationalOrganization', 'CollegeOrUniversity', 'School'],
            },
            { type: 'Organization', detailTr: 'Üst marka veya eğitim ağı.' },
            { type: 'WebSite', detailTr: 'Program kataloğu, başvuru ve LMS bağlantıları.' },
            { type: 'WebPage', detailTr: 'Ders koşulları, modül ve sınav sayfaları.' },
            { type: 'BreadcrumbList', detailTr: 'Fakülte → program → ders.' },
            { type: 'CourseInstance', detailTr: 'Belirli dönem / sınıf oturumu (başlangıç-bitiş).' },
            { type: 'LearningResource', detailTr: 'Ders materyali, ödev veya interaktif içerik.' },
            { type: 'Person', detailTr: 'Eğitmen, danışman veya koç.' },
            { type: 'Event', detailTr: 'Kayıt günü, oryantasyon, mezuniyet veya sınav takvimi.' },
            { type: 'FAQPage', detailTr: 'Başvuru, burs ve vize SSS.' },
            { type: 'VideoObject', detailTr: 'Ders kaydı, kampüs turu ve canlı ders.' },
            { type: 'ItemList', detailTr: 'Program, modül veya sertifika listesi.' },
            { type: 'Article veya BlogPosting', detailTr: 'Eğitim blogu ve duyurular.', checkAny: ['Article', 'BlogPosting'] },
            { type: 'Offer', detailTr: 'Ücret, burs, taksit ve erken kayıt.' },
            { type: 'Occupation', detailTr: 'Mezuniyet sonrası meslek ve kariyer yolu.' },
        ],
        events: [
            {
                type: 'Event, EventSeries, BusinessEvent, MusicEvent, SportsEvent veya TheaterEvent',
                detailTr: 'Tarih-saat, yer, Organizer, performer, durum.',
                checkAny: ['Event', 'EventSeries', 'BusinessEvent', 'MusicEvent', 'SportsEvent', 'TheaterEvent'],
            },
            { type: 'Organization veya Place', detailTr: 'Düzenleyen kurum veya mekan.', checkAny: ['Organization', 'Place'] },
            { type: 'WebSite', detailTr: 'Takvim, bilet ve sanatçı bağlantıları.' },
            { type: 'WebPage', detailTr: 'Tekil etkinlik veya turne sayfası.' },
            { type: 'BreadcrumbList', detailTr: 'Şehir / tür / etkinlik hiyerarşisi.' },
            { type: 'Offer', detailTr: 'Bilet fiyatı, koltuk sınıfı ve ücret koşulları.' },
            { type: 'Product', detailTr: 'Bilet veya yan ürün (merch) satışı.' },
            { type: 'Person', detailTr: 'Sanatçı, konuşmacı veya sporcu.' },
            { type: 'FAQPage', detailTr: 'Giriş, iptal, yaş sınırı ve bilet SSS.' },
            { type: 'VideoObject', detailTr: 'Tanıtım fragmanı ve özet kayıt.' },
            { type: 'ImageObject', detailTr: 'Afiş ve görsel galeri.' },
            { type: 'Review veya AggregateRating', detailTr: 'Etkinlik veya mekan değerlendirmesi.', checkAny: ['Review', 'AggregateRating'] },
            { type: 'ItemList', detailTr: 'Çoklu tarih, turne veya sanatçı listesi.' },
        ],
        health: [
            { type: 'WebSite', detailTr: 'Kurumsal arama (SearchAction), dil ve yayın politikası ile güçlendirin.' },
            {
                type: 'MedicalOrganization, Hospital, MedicalClinic, Physician, Dentist veya Pharmacy',
                detailTr:
                    'Tesis veya hekim işletmesi: adres, geo, openingHours, medicalSpecialty, isAcceptingNewPatients (uygunsa).',
                checkAny: [
                    'MedicalOrganization',
                    'Hospital',
                    'MedicalClinic',
                    'Physician',
                    'Dentist',
                    'Pharmacy',
                    'VeterinaryCare',
                    'Optician',
                ],
            },
            {
                type: 'Organization',
                detailTr: 'Holding, grup veya marka üst kimliği (MedicalOrganization ile birlikte sık kullanılır).',
            },
            {
                type: 'WebPage veya MedicalWebPage',
                detailTr: 'MedicalWebPage: medicalAudience, lastReviewed, reviewedBy, mainEntity (YMYL için önemli).',
                checkAny: ['WebPage', 'MedicalWebPage'],
            },
            { type: 'BreadcrumbList', detailTr: 'Bölüm, branş ve içerik hiyerarşisi.' },
            {
                type: 'Article, MedicalScholarlyArticle, NewsArticle veya BlogPosting',
                detailTr: 'Sağlık haberi, bilgilendirme veya makale; author, datePublished, medicalAudience.',
                checkAny: ['MedicalScholarlyArticle', 'Article', 'NewsArticle', 'BlogPosting'],
            },
            {
                type: 'MedicalCondition, Drug veya MedicalProcedure',
                detailTr: 'Hastalık / sendrom, ilaç veya tetkik–tedavi süreçleri (associatedAnatomy, uyarılar vb.).',
                checkAny: ['MedicalCondition', 'Drug', 'MedicalProcedure'],
            },
            {
                type: 'MedicalTest',
                detailTr: 'Laboratuvar, patoloji veya görüntüleme testi sayfaları (usesDevice, normalRange uygunsa).',
            },
            {
                type: 'MedicalGuideline',
                detailTr: 'Klinik kılavuz, protokol veya resmi öneri metinleri.',
            },
            {
                type: 'Person veya Physician',
                detailTr: 'Hekim / uzman profili; MedicalAudience veya affiliation ile kuruma bağlayın.',
                checkAny: ['Person', 'Physician'],
            },
            {
                type: 'Service veya MedicalProcedure (hizmet satırı)',
                detailTr: 'Muayene paketi, tetkik veya tedavi hizmeti listesi (offers, areaServed).',
                checkAny: ['Service', 'MedicalProcedure'],
            },
            { type: 'FAQPage', detailTr: 'Hastalık, randevu veya tedavi hakkında SSS (tıbbi içerikte dikkatli kullanın).' },
            {
                type: 'Product',
                detailTr: 'Tıbbi cihaz, takviye veya satışa sunulan ürünler; Offer, uyarı ve uygunluk bilgisi.',
            },
            {
                type: 'VideoObject',
                detailTr: 'Eğitim, egzersiz veya prosedür anlatım videoları (thumbnail, transcript).',
            },
            { type: 'HowTo', detailTr: 'İlaç uygulama, yaralanma bakımı veya evde bakım adımları.' },
            {
                type: 'ItemList',
                detailTr: 'Branş listesi, hekim listesi veya hizmet paketleri dizisi.',
            },
            {
                type: 'SpeakableSpecification',
                detailTr: 'Sesli asistanlar için özetlenebilir kritik cevaplar (health content için opsiyonel).',
            },
        ],
    };

    var SCHEMA_HINT_USER_LABELS = {
        corporate: 'Kurumsal / marka sitesi',
        ecommerce: 'E-ticaret',
        news: 'Haber / blog',
        service: 'Hizmet / yerel işletme',
        health: 'Sağlık / tıp (hastane, klinik, bilgilendirme)',
        saas: 'Yazılım uygulaması / SaaS',
        recipe: 'Yemek / tarif sitesi',
        education: 'Eğitim / kurs sitesi',
        events: 'Etkinlik / bilet sitesi',
    };

    /**
     * Schema önerisi: yalnızca kullanıcı `profileId` seçimi (otomatik tahmin yok).
     * @param {object} [options]
     * @param {string} [options.profileId] — corporate | ecommerce | news | service | health | saas | recipe | education | events
     */
    function analyzeSchemaSiteHints(doc, pageUrl, options) {
        options = options || {};
        var typeSet = collectCanonicalSchemaTypeSet(doc);
        var raw = options.profileId != null ? String(options.profileId).trim() : '';
        var rows = raw ? SCHEMA_HINT_LIST[raw] : null;
        if (!rows || !SCHEMA_HINT_USER_LABELS[raw]) {
            return {
                siteType: { id: '', labelTr: '', reasons: [] },
                recommendations: [],
                missingCount: 0,
                pageUrl: pageUrl,
                profileIdUsed: '',
                error: 'SITE_TYPE_REQUIRED',
            };
        }

        var profile = {
            id: raw,
            labelTr: SCHEMA_HINT_USER_LABELS[raw],
            reasons: [],
        };
        var recommendations = [];
        var missing = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var present = false;
            if (row.checkAny && row.checkAny.length) {
                for (var j = 0; j < row.checkAny.length; j++) {
                    if (typePresentInSet(typeSet, row.checkAny[j])) {
                        present = true;
                        break;
                    }
                }
            } else {
                present = typePresentInSet(typeSet, row.type);
            }
            if (!present) missing++;
            recommendations.push({
                type: row.type,
                detailTr: row.detailTr,
                present: present,
            });
        }
        return {
            siteType: profile,
            recommendations: recommendations,
            missingCount: missing,
            pageUrl: pageUrl,
            profileIdUsed: profile.id,
        };
    }

    /** Ahrefs tarzı OG + Twitter listesi (popup’ta gösterim). */
    function analyzeSocialView(doc, pageUrl) {
        var ogProps = [
            'og:title',
            'og:type',
            'og:image',
            'og:url',
            'og:description',
            'og:site_name',
        ];
        var og = [];
        for (var i = 0; i < ogProps.length; i++) {
            var p = ogProps[i];
            og.push({ property: p, value: metaByProperty(doc, p) || null });
        }
        var twNames = [
            'twitter:card',
            'twitter:site',
            'twitter:title',
            'twitter:description',
            'twitter:image',
            'twitter:creator',
        ];
        var twitter = [];
        for (var j = 0; j < twNames.length; j++) {
            var tn = twNames[j];
            twitter.push({ name: tn, value: metaByName(doc, tn) || null });
        }
        var ogMissing = [];
        for (var k = 0; k < OG_EXPECTED.length; k++) {
            var key = OG_EXPECTED[k];
            if (!metaByProperty(doc, key)) ogMissing.push(key);
        }
        return {
            pageUrl: pageUrl,
            og: og,
            twitter: twitter,
            ogIncomplete: ogMissing.length > 0,
            ogMissing: ogMissing,
        };
    }

    function extractImagesBasic(doc, pageUrl) {
        var imgs = doc.querySelectorAll('img[src]');
        var out = [];
        for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i];
            var src = img.getAttribute('src');
            if (!src) continue;
            var abs;
            try {
                abs = new URL(src, pageUrl).href;
            } catch (e) {
                continue;
            }
            var w = img.getAttribute('width');
            var h = img.getAttribute('height');
            out.push({
                src: abs,
                alt: (img.getAttribute('alt') || '').trim(),
                widthAttr: w ? parseInt(w, 10) : null,
                heightAttr: h ? parseInt(h, 10) : null,
            });
        }
        return out;
    }

    function extractOutgoingLinks(doc, pageUrl) {
        var anchors = doc.querySelectorAll('a[href]');
        var seen = {};
        var out = [];
        for (var i = 0; i < anchors.length; i++) {
            var a = anchors[i];
            var href = (a.getAttribute('href') || '').trim();
            if (!href || href.charAt(0) === '#' || href.toLowerCase().indexOf('javascript:') === 0) continue;
            var resolved;
            try {
                resolved = new URL(href, pageUrl).href;
            } catch (e) {
                continue;
            }
            if (seen[resolved]) continue;
            seen[resolved] = true;
            var rel = (a.getAttribute('rel') || '').toLowerCase();
            var nofollow = rel.indexOf('nofollow') !== -1;
            var text = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220);
            out.push({
                href: resolved,
                text: text,
                nofollow: nofollow,
            });
        }
        return out;
    }

    function extractJsonLdRoots(doc) {
        var roots = [];
        var scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (var s = 0; s < scripts.length; s++) {
            var raw = (scripts[s].textContent || '').trim();
            if (!raw) continue;
            try {
                var data = JSON.parse(raw);
                var items = [];
                if (Array.isArray(data)) items = data;
                else if (data['@graph'] && Array.isArray(data['@graph'])) items = data['@graph'];
                else items = [data];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (!item || typeof item !== 'object') continue;
                    var t = item['@type'];
                    var title = Array.isArray(t) ? t.join(', ') : t || 'Thing';
                    roots.push({ title: String(title), data: item });
                }
            } catch (e) {
                roots.push({ title: 'JSON-LD (parse error)', error: true, raw: raw.slice(0, 400) });
            }
        }
        return roots;
    }

    /**
     * JSON-LD ağacında GEO için anlamlı düğümleri sayar (iç içe @graph dahil).
     */
    function geoDeepScanJsonLd(obj, depth, acc) {
        if (!obj || typeof obj !== 'object' || depth > 14) return;
        if (Array.isArray(obj)) {
            var a;
            for (a = 0; a < obj.length; a++) geoDeepScanJsonLd(obj[a], depth + 1, acc);
            return;
        }
        var t = obj['@type'];
        if (t) {
            var ts = Array.isArray(t) ? t : [t];
            var ti;
            for (ti = 0; ti < ts.length; ti++) {
                var tn = ts[ti] ? String(ts[ti]) : '';
                if (!tn) continue;
                acc.types[tn] = true;
                acc.typedNodes++;
                if (tn === 'SpeakableSpecification') acc.hasSpeakable = true;
                if (tn === 'BreadcrumbList') acc.hasBreadcrumb = true;
                if (tn === 'VideoObject' || tn === 'Clip') acc.hasVideoObject = true;
                if (tn === 'FAQPage' || tn === 'HowTo' || tn === 'QAPage') acc.hasFaqHow = true;
                if (tn === 'Product') acc.hasProduct = true;
                if (tn === 'Review' || tn === 'UserReview') acc.hasReview = true;
                if (tn === 'AggregateRating') acc.hasAggregateRating = true;
                if (tn === 'Person') acc.hasPerson = true;
                if (tn === 'Organization' || tn === 'Corporation' || tn === 'LocalBusiness') acc.hasOrganization = true;
                if (tn === 'WebSite' || tn === 'WebPage') acc.hasWebSiteOrPage = true;
                if (tn === 'Article' || tn === 'NewsArticle' || tn === 'BlogPosting') acc.hasArticleFamily = true;
            }
        }
        if (obj.author) acc.seenAuthor = true;
        if (obj.publisher) acc.seenPublisher = true;
        if (obj.datePublished) acc.seenDatePub = true;
        if (obj.dateModified) acc.seenDateMod = true;
        if (obj.headline) acc.seenHeadline = true;
        if (obj.description) acc.seenDescription = true;
        if (obj.image) acc.seenImage = true;
        if (obj.sameAs) {
            if (Array.isArray(obj.sameAs)) acc.sameAsHits += obj.sameAs.length;
            else acc.sameAsHits++;
        }
        if (obj.mainEntityOfPage) acc.seenMainEntity = true;
        for (var k in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
            if (k === '@context') continue;
            geoDeepScanJsonLd(obj[k], depth + 1, acc);
        }
    }

    function geoInitAcc() {
        return {
            types: {},
            typedNodes: 0,
            hasSpeakable: false,
            hasBreadcrumb: false,
            hasVideoObject: false,
            hasFaqHow: false,
            hasProduct: false,
            hasReview: false,
            hasAggregateRating: false,
            hasPerson: false,
            hasOrganization: false,
            hasWebSiteOrPage: false,
            hasArticleFamily: false,
            seenAuthor: false,
            seenPublisher: false,
            seenDatePub: false,
            seenDateMod: false,
            seenHeadline: false,
            seenDescription: false,
            seenImage: false,
            sameAsHits: 0,
            seenMainEntity: false,
        };
    }

    /** Ortalama cümle uzunluğu (kelime); metin örnekleme. */
    function geoAvgWordsPerSentence(text, maxSample) {
        if (!text || !text.trim()) return 0;
        var chunk = text.replace(/\s+/g, ' ').trim();
        if (maxSample && chunk.length > maxSample) chunk = chunk.slice(0, maxSample);
        var parts = chunk.split(/[.!?]+/).filter(function (s) {
            return s.replace(/\s+/g, ' ').trim().length > 0;
        });
        if (!parts.length) return 0;
        var total = 0;
        var p;
        for (p = 0; p < parts.length; p++) total += countWords(parts[p]);
        return total / parts.length;
    }

    /**
     * Generative Engine Optimization (GEO) — genişletilmiş sayfa sinyalleri.
     */
    function analyzeGeo(doc, pageUrl) {
        var visibleText = getVisibleText(doc);
        var wordCount = countWords(visibleText);

        var mainEl =
            doc.querySelector('main article') ||
            doc.querySelector('main') ||
            doc.querySelector('[role="main"]') ||
            doc.querySelector('article') ||
            doc.body;
        var mainText = '';
        if (mainEl) {
            var mc = mainEl.cloneNode(true);
            var rm = mc.querySelectorAll('script, style, noscript, svg, template');
            var r;
            for (r = 0; r < rm.length; r++) rm[r].remove();
            mainText = (mc.textContent || '').replace(/\s+/g, ' ').trim();
        }
        var mainWordCount = countWords(mainText);
        var mainRatio = wordCount > 0 ? mainWordCount / wordCount : 0;

        var h2n = doc.querySelectorAll('h2').length;
        var h3n = doc.querySelectorAll('h3').length;
        var lists = doc.querySelectorAll('ul, ol');
        var richLists = 0;
        var li;
        for (li = 0; li < lists.length; li++) {
            if (lists[li].querySelectorAll('li').length >= 2) richLists++;
        }
        var tableCount = doc.querySelectorAll('table').length;
        var bqCount = doc.querySelectorAll('blockquote').length;
        var dlTerms = doc.querySelectorAll('dl dt').length;
        var figureN = doc.querySelectorAll('figure').length;
        var figcaptionN = doc.querySelectorAll('figcaption').length;
        var preCode = doc.querySelectorAll('pre, code').length;
        var hasMain = !!doc.querySelector('main');
        var hasArticleLandmark = !!doc.querySelector('article');

        var firstPLen = 0;
        var leadWords = 0;
        var scope = doc.querySelector('main article, main, article, body');
        if (scope) {
            var fp = scope.querySelector('p');
            if (fp) {
                var fpt = (fp.textContent || '').replace(/\s+/g, ' ').trim();
                firstPLen = fpt.length;
                leadWords = countWords(fpt);
            }
            var leadSlice = (scope.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 900);
            if (!leadWords && leadSlice) leadWords = countWords(leadSlice);
        }

        var questionHeadings = 0;
        var hx = doc.querySelectorAll('h2, h3');
        var hi;
        for (hi = 0; hi < hx.length; hi++) {
            var ht = (hx[hi].textContent || '').trim();
            if (ht.indexOf('?') !== -1) questionHeadings++;
            else if (/^(nedir|nasıl|ne zaman|kim|hangi|mi\b|mı\b|mu\b|mü\b|why|what|how|when)\b/i.test(ht)) {
                questionHeadings++;
            }
        }

        var avgSentLen = geoAvgWordsPerSentence(mainText || visibleText, 8000);
        var sentOk = avgSentLen >= 10 && avgSentLen <= 32;

        var strongN = doc.querySelectorAll('strong, b').length;
        var emN = doc.querySelectorAll('em, i').length;
        var timeN = doc.querySelectorAll('time[datetime]').length;
        var citeN = doc.querySelectorAll('cite, blockquote[cite]').length;

        var bylineHit =
            !!doc.querySelector(
                '[rel="author"], [itemprop="author"], [class*="author"], [class*="byline"], [class*="post-author"], [class*="entry-author"]'
            );

        var roots = extractJsonLdRoots(doc);
        var jsonLdBlocks = roots.length;
        var parseErrors = 0;
        var ldAcc = geoInitAcc();
        var ri;
        for (ri = 0; ri < roots.length; ri++) {
            if (roots[ri].error) {
                parseErrors++;
                continue;
            }
            geoDeepScanJsonLd(roots[ri].data, 0, ldAcc);
        }

        var typesFound = ldAcc.types;
        var hasPersonSchema = ldAcc.hasPerson;
        var hasOrgSchema = ldAcc.hasOrganization;
        var hasArticleType = ldAcc.hasArticleFamily || typesFound.WebPage;
        var hasFaqHow = ldAcc.hasFaqHow;
        var hasProduct = ldAcc.hasProduct;
        var hasSpeakable = ldAcc.hasSpeakable;
        var hasBreadcrumb = ldAcc.hasBreadcrumb;
        var hasVideoLd = ldAcc.hasVideoObject;
        var hasRichSnippet = ldAcc.hasReview || ldAcc.hasAggregateRating;
        var ldTypedNodes = ldAcc.typedNodes;

        var metaAuthor =
            metaByName(doc, 'author') ||
            metaByProperty(doc, 'article:author') ||
            metaByProperty(doc, 'og:article:author');
        var authorFromSchema = hasPersonSchema || ldAcc.seenAuthor;
        var authorSignal = !!(metaAuthor && metaAuthor.length > 1) || authorFromSchema || bylineHit;

        var pubMeta =
            metaByProperty(doc, 'article:published_time') ||
            metaByName(doc, 'article:published_time') ||
            metaByProperty(doc, 'og:published_time');
        var modMeta =
            metaByProperty(doc, 'article:modified_time') ||
            metaByName(doc, 'article:modified_time') ||
            metaByProperty(doc, 'og:updated_time');

        var publishedInJsonLd = ldAcc.seenDatePub;
        var modifiedInJsonLd = ldAcc.seenDateMod;

        var hasPublished = !!(pubMeta || publishedInJsonLd);
        var hasModified = !!(modMeta || modifiedInJsonLd);
        var publisherSignal = ldAcc.seenPublisher || hasOrgSchema;

        var origin = '';
        var pagePath = '';
        try {
            var purl = new URL(pageUrl);
            origin = purl.origin;
            pagePath = purl.pathname || '';
        } catch (e1) {
            origin = '';
        }

        var anchors = doc.querySelectorAll('a[href]');
        var extDomains = {};
        var extFollow = 0;
        var hasGovEduWiki = false;
        var ai;
        for (ai = 0; ai < anchors.length; ai++) {
            var a = anchors[ai];
            var href = (a.getAttribute('href') || '').trim();
            if (!href || href.charAt(0) === '#' || href.toLowerCase().indexOf('javascript:') === 0) continue;
            var relA = (a.getAttribute('rel') || '').toLowerCase();
            if (relA.indexOf('nofollow') !== -1) continue;
            try {
                var abs = new URL(href, pageUrl);
                if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue;
                if (origin && abs.origin === origin) continue;
                extFollow++;
                extDomains[abs.hostname] = true;
                var h = abs.hostname.toLowerCase();
                if (
                    h.indexOf('.gov') !== -1 ||
                    h.indexOf('.edu') !== -1 ||
                    h.indexOf('wikipedia.org') !== -1 ||
                    h.indexOf('wikidata.org') !== -1
                ) {
                    hasGovEduWiki = true;
                }
            } catch (e2) { }
        }
        var uniqueExtDomains = Object.keys(extDomains).length;

        var imageAlts = analyzeImagesAlt(doc);
        var imgs = doc.querySelectorAll('img');
        var imgRatio = imgs.length ? (imgs.length - imageAlts.missing) / imgs.length : 1;

        var videos = doc.querySelectorAll('video').length;
        var iframes = doc.querySelectorAll('iframe[src]').length;
        var pictureN = doc.querySelectorAll('picture').length;

        var titleEl = doc.querySelector('title');
        var titleText = titleEl ? (titleEl.textContent || '').trim() : '';
        var metaDesc = metaByName(doc, 'description');
        var ogTitle = metaByProperty(doc, 'og:title');
        var ogDesc = metaByProperty(doc, 'og:description');
        var ogImage = metaByProperty(doc, 'og:image');
        var twCard = metaByName(doc, 'twitter:card');
        var twTitle = metaByName(doc, 'twitter:title');
        var twDesc = metaByName(doc, 'twitter:description');
        var ogSection = metaByProperty(doc, 'article:section');
        var canon = doc.querySelector('link[rel="canonical"]');
        var canonHref = canon ? (canon.getAttribute('href') || '').trim() : '';
        var canonSelf = false;
        if (canonHref && pageUrl) {
            try {
                canonSelf = new URL(canonHref).href.split('#')[0] === pageUrl.split('#')[0];
            } catch (e3) {
                canonSelf = false;
            }
        }

        var htmlLang = (doc.documentElement && doc.documentElement.getAttribute('lang')) || '';
        var hasLang = !!(htmlLang && htmlLang.trim().length >= 2);
        var hreflangN = doc.querySelectorAll('link[rel="alternate"][hreflang]').length;

        var viewportOk = !!doc.querySelector('meta[name="viewport"]');
        var robotsContent = '';
        var robotsMeta = doc.querySelector('meta[name="robots"]');
        if (robotsMeta) robotsContent = (robotsMeta.getAttribute('content') || '').toLowerCase();
        var robotsNoindex = robotsContent.indexOf('noindex') !== -1;

        var isHttps = false;
        try {
            isHttps = new URL(pageUrl).protocol === 'https:';
        } catch (eH) {
            isHttps = false;
        }

        function clamp(n, lo, hi) {
            return Math.max(lo, Math.min(hi, n));
        }

        var PMAX = 20;

        /** Sütun 1: İçerik & biçim (20) */
        var c1 = 0;
        if (wordCount >= 400) c1 += 4;
        if (wordCount >= 900) c1 += 3;
        if (wordCount >= 1800) c1 += 2;
        if (mainRatio >= 0.35) c1 += 3;
        if (richLists >= 1 || tableCount >= 1) c1 += 2;
        if (tableCount >= 1) c1 += 1;
        if (bqCount >= 1 || dlTerms >= 1) c1 += 1;
        if (figureN >= 1 || figcaptionN >= 1) c1 += 1;
        if (h2n >= 2) c1 += 1;
        if (questionHeadings >= 1) c1 += 2;
        if (firstPLen >= 40) c1 += 2;
        if (sentOk) c1 += 2;
        if (leadWords >= 35) c1 += 1;
        if (strongN + emN >= 3) c1 += 1;
        c1 = clamp(c1, 0, PMAX);

        /** Sütun 2: Şema derinliği (20) */
        var c2 = 0;
        if (jsonLdBlocks > 0 && parseErrors === 0) c2 += 4;
        if (hasArticleType) c2 += 4;
        if (hasFaqHow) c2 += 3;
        if (hasOrgSchema || typesFound.WebSite) c2 += 2;
        if (hasBreadcrumb) c2 += 2;
        if (hasSpeakable) c2 += 2;
        if (hasVideoLd || hasProduct) c2 += 2;
        if (hasRichSnippet) c2 += 1;
        if (ldTypedNodes >= 4) c2 += 2;
        if (ldAcc.seenHeadline && ldAcc.seenDescription) c2 += 1;
        if (ldAcc.seenImage) c2 += 1;
        c2 -= Math.min(parseErrors * 3, 9);
        c2 = clamp(c2, 0, PMAX);

        /** Sütun 3: Kimlik & kaynak (20) */
        var c3 = 0;
        if (authorSignal) c3 += 5;
        if (publisherSignal) c3 += 4;
        if (hasPublished) c3 += 4;
        if (hasModified) c3 += 2;
        if (uniqueExtDomains >= 2) c3 += 3;
        else if (uniqueExtDomains === 1) c3 += 1;
        if (hasGovEduWiki) c3 += 2;
        if (ldAcc.sameAsHits >= 1) c3 += 2;
        if (citeN >= 1 || bqCount >= 1) c3 += 1;
        if (timeN >= 1) c3 += 1;
        c3 = clamp(c3, 0, PMAX);

        /** Sütun 4: Meta & yüzey (20) */
        var c4 = 0;
        if (ogTitle && ogDesc) c4 += 5;
        else if (ogTitle || ogDesc) c4 += 2;
        if (ogImage) c4 += 3;
        if (twCard) c4 += 2;
        if (twTitle || twDesc) c4 += 1;
        if (metaDesc && metaDesc.length >= 70) c4 += 3;
        else if (metaDesc) c4 += 1;
        if (canonHref) c4 += 3;
        if (canonSelf) c4 += 1;
        if (titleText.length >= 28 && titleText.length <= 72) c4 += 2;
        if (ogSection || metaByProperty(doc, 'article:tag')) c4 += 1;
        c4 = clamp(c4, 0, PMAX);

        /** Sütun 5: Teknik & medya (20) */
        var c5 = 0;
        if (viewportOk) c5 += 3;
        if (hasLang) c5 += 3;
        if (!robotsNoindex) c5 += 5;
        else c5 -= 8;
        if (hreflangN >= 1) c5 += 2;
        if (isHttps) c5 += 2;
        if (imgs.length === 0 || imgRatio >= 0.8) c5 += 4;
        else if (imgRatio >= 0.45) c5 += 2;
        if (videos >= 1 || iframes >= 1) c5 += 2;
        if (pictureN >= 1) c5 += 1;
        if (preCode >= 1 && wordCount >= 500) c5 += 1;
        c5 = clamp(c5, 0, PMAX);

        var total = Math.round(c1 + c2 + c3 + c4 + c5);
        total = clamp(total, 0, 100);

        var grade = 'D';
        if (total >= 90) grade = 'A';
        else if (total >= 75) grade = 'B';
        else if (total >= 60) grade = 'C';

        function pillarDef(id, name, score, maxPts, items) {
            return { id: id, name: name, score: score, max: maxPts, items: items };
        }

        function item(ok, label, okHint, failHint) {
            return { label: label, ok: ok, hint: ok ? okHint : failHint };
        }

        var okContentDepth = wordCount >= 500 && mainRatio >= 0.3;
        var failContentDepth =
            (wordCount < 500 ? 'Metin en az ~500 kelime olacak şekilde genişletilmeli. ' : '') +
            (mainRatio < 0.3
                ? 'Asıl metni <main> veya <article> içine alın; menü, footer ve kenar çubuğu metnini ana gövdeden ayırın. '
                : '') +
            (wordCount >= 500 && mainRatio < 0.3
                ? ''
                : wordCount < 500
                    ? 'Konuyu alt başlıklarla derinleştirin.'
                    : '');

        var okHeadings =
            h2n >= 2 && questionHeadings >= 1 && strongN + emN >= 2;
        var failHeadings =
            (h2n < 2 ? 'En az iki H2 ekleyin; konuyu bölümlere ayırın. ' : '') +
            (questionHeadings < 1
                ? 'En az bir H2 veya H3 başlığını soru cümlesi veya “Nedir / Nasıl …” formatında yazın. '
                : '') +
            (strongN + emN < 2
                ? 'Önemli terimler için en az 2 yerde <strong> veya <em> kullanın (süs için değil, anlam vurgusu için).'
                : '');

        var okRhythm = firstPLen >= 40 && sentOk;
        var failRhythm =
            (firstPLen < 40
                ? 'İlk paragrafı 2–4 cümleyle konunun özetini verecek şekilde uzatın. '
                : '') +
            (!sentOk
                ? 'Çok uzun veya tek kelimelik cümleleri bölün; ortalama cümle başına yaklaşık 12–28 kelime hedefleyin.'
                : '');

        var okLists = richLists >= 1 || tableCount >= 1 || dlTerms >= 1 || figureN >= 1;
        var failLists =
            'En az birini ekleyin: (1) İki veya daha fazla maddeli <ul>/<ol>, (2) karşılaştırma için <table>, (3) terimler için <dl><dt><dd>, (4) görsel + açıklama için <figure> ve <figcaption>.';

        var okSchemaBase = jsonLdBlocks > 0 && parseErrors === 0 && hasArticleType;
        var failSchemaBase =
            jsonLdBlocks === 0
                ? '<head> içine <script type="application/ld+json"> ekleyin. Önce WebPage veya Article ile sayfa konusunu tanımlayın. '
                : parseErrors > 0
                    ? 'JSON-LD sözdizimini düzeltin (tırnak, virgül, kapanmayan süslü parantez). Hatalı blokları kaldırın veya doğrulayıcı ile test edin. '
                    : !hasArticleType
                        ? '"@type" alanına Article, NewsArticle, BlogPosting veya WebPage ekleyin; headline ve url alanlarını doldurun. '
                        : '';

        var okRichTypes =
            hasFaqHow ||
            hasProduct ||
            hasRichSnippet ||
            hasVideoLd ||
            ldTypedNodes >= 6;
        var failRichTypes =
            'İçeriğe uygun en az birini ekleyin: SSS sayfasında FAQPage + Question/Answer; adım adım içerikte HowTo; ürün sayfasında Product + Offer; yorum varsa Review veya AggregateRating. Alternatif: ilişkili birden fazla entity ile şema grafiğini genişleterek düğüm sayısını artırın.';

        var okNavSchema = hasBreadcrumb || hasSpeakable || (ldAcc.seenImage && ldAcc.seenHeadline);
        var failNavSchema =
            'BreadcrumbList ile site hiyerarşisini verin; veya Article/WebPage içinde image + headline birlikte tanımlayın. Sesli özet uyumu için SpeakableSpecification eklemeyi düşünün.';

        var okLdDensity = ldTypedNodes >= 3;
        var failLdDensity =
            'Şemada birden fazla @type düğümü olsun (ör. Organization + WebSite + Article). @graph kullanıyorsanız ilişkili nesneleri aynı blokta birleştirin.';

        var okAuthor = authorSignal;
        var failAuthor =
            'Şunlardan birini yapın: <meta name="author" content="...">, <meta property="article:author" content="...">, şemada Person veya sayfada yazar satırı (ör. class veya rel="author" bağlantısı).';

        var okPublisher = publisherSignal;
        var failPublisher =
            'JSON-LD içinde publisher: { "@type": "Organization", "name": "...", "logo": {...} } kullanın veya Organization şeması ekleyin.';

        var okDates = hasPublished && hasModified;
        var failDates =
            !hasPublished && !hasModified
                ? 'article:published_time ve article:modified_time meta etiketlerini veya şemada datePublished / dateModified ekleyin.'
                : !hasPublished
                    ? 'Yayın tarihi eksik: article:published_time veya datePublished ekleyin.'
                    : 'Güncelleme tarihi eksik: article:modified_time veya dateModified ekleyin.';

        var okExt = uniqueExtDomains >= 2 || hasGovEduWiki;
        var failExt =
            'Metinde güvenilir kaynaklara en az iki farklı siteye (nofollow olmayan) bağlantı verin; mümkünse .edu, .gov veya Wikipedia gibi otorite alanlarından birini dahil edin.';

        var okSame = ldAcc.sameAsHits >= 1 || citeN >= 1;
        var failSame =
            'Kurum veya kişi şemasına sameAs dizisi ekleyin (sosyal profil veya resmi site). Kaynak gösterirken <blockquote cite="..."> veya <cite> kullanın.';

        var okOg = !!(ogTitle && ogDesc && ogImage);
        var failOg =
            (!ogTitle ? 'og:title eksik. ' : '') +
            (!ogDesc ? 'og:description eksik. ' : '') +
            (!ogImage ? 'og:image eksik (önerilen en az 1200px genişlikte kare veya yatay görsel). ' : '') +
            'Her üçünü <meta property="og:..."> olarak <head> içine ekleyin.';

        var okTw = !!twCard && (!!twTitle || !!ogTitle);
        var failTw =
            !twCard
                ? '<meta name="twitter:card" content="summary_large_image"> ekleyin. '
                : '' + (!twTitle && !ogTitle ? 'twitter:title veya og:title tanımlayın.' : '');

        var okMetaTitle = !!metaDesc && metaDesc.length >= 80 && titleText.length >= 40 && titleText.length <= 60;
        var failMetaTitle =
            (!metaDesc || metaDesc.length < 80
                ? '<meta name="description" içeriğini 80–160 karakter aralığında, tıklamayı özendiren özetle doldurun. '
                : '') +
            (titleText.length < 40 || titleText.length > 60
                ? '<title> uzunluğunu yaklaşık 40–60 karakter aralığına getirin (konu + marka).'
                : '');

        var okCanon = !!canonHref;
        var failCanon =
            '<link rel="canonical" href="https://site.com/ozgun-sayfa"> ekleyin. Parametreli URL’lerde ana içeriğin tek adresini seçin; kopya sayfalar aynı canonical’ı paylaşmasın.';

        var okNoindex = !robotsNoindex;
        var failNoindex =
            'meta name="robots" içinde noindex var. Sayfanın indekslenmesi gerekiyorsa noindex’i kaldırın veya yalnızca gereksiz varyantlarda kullanın.';

        var okVpLang = viewportOk && hasLang;
        var failVpLang =
            (!viewportOk ? '<meta name="viewport" content="width=device-width, initial-scale=1"> ekleyin. ' : '') +
            (!hasLang ? '<html lang="tr"> (veya içerik diliniz) ekleyin.' : '');

        var okImgAlt = imgs.length === 0 || imgRatio >= 0.75;
        var failImgAlt =
            'Alt niteliği olmayan görsellere bağlama uygun açıklama veya dekoratifse alt="" ekleyin. Şu an yaklaşık %' +
            Math.round(imgRatio * 100) +
            ' görselde alt niteliği var.';

        var okMedia = videos + iframes >= 1 || pictureN >= 1;
        var failMedia =
            'İçeriği zenginleştirin: <video>, YouTube/Vimeo <iframe> veya responsive <picture><source> ile WebP/AVIF kullanın.';

        var okHttps = isHttps;
        var failHttps = 'Siteyi HTTPS üzerinden yayınlayın; SSL sertifikası ve tüm kaynakların https ile yüklendiğinden emin olun.';

        var pillars = [
            pillarDef('content', 'İçerik & biçim', c1, PMAX, [
                item(
                    okContentDepth,
                    'Metin derinliği ve ana içerik oranı',
                    'İyi optimize: Metin yeterli ve ana konu metni gövdede toplanmış; özetlenebilirlik için uygun.',
                    failContentDepth || 'Metin derinliği veya ana içerik oranını yukarıdaki adımlarla iyileştirin.'
                ),
                item(
                    okHeadings,
                    'Başlık, soru formu ve vurgular',
                    'İyi optimize: Alt başlıklar, soru tipi başlıklar ve vurgular okunabilirliği destekliyor.',
                    failHeadings || 'Başlık ve vurgu önerilerini uygulayın.'
                ),
                item(
                    okRhythm,
                    'Özet & cümle ritmi',
                    'İyi optimize: Giriş özeti ve cümle uzunlukları dengeli; akış net.',
                    failRhythm || 'Giriş ve cümle ritmini düzenleyin.'
                ),
                item(
                    okLists,
                    'Listeler, tablolar, tanımlar veya görseller',
                    'İyi optimize: Liste, tablo, tanım veya görsel blokları içeriği yapılandırıyor.',
                    failLists
                ),
            ]),
            pillarDef('schema', 'Şema derinliği', c2, PMAX, [
                item(
                    okSchemaBase,
                    'Hatasız JSON-LD ve içerik tipi',
                    'İyi optimize: Yapılandırılmış veri geçerli ve sayfa tipi (Article/WebPage vb.) tanımlı.',
                    failSchemaBase
                ),
                item(
                    okRichTypes,
                    'Zengin türler (SSS, HowTo, ürün, yorum vb.)',
                    'İyi optimize: İçeriğe uygun zengin şema türleri veya yeterince detaylı şema grafiği kullanılıyor.',
                    failRichTypes
                ),
                item(
                    okNavSchema,
                    'Navigasyon / Speakable / görsel şemada',
                    'İyi optimize: Breadcrumb, speakable veya görsel+başlık ile bağlam netleştirilmiş.',
                    failNavSchema
                ),
                item(okLdDensity, 'Şema yoğunluğu', 'İyi optimize: Birden fazla şema düğümü ile ilişkiler iyi kurulmuş.', failLdDensity),
            ]),
            pillarDef('trust', 'Kimlik & kaynak', c3, PMAX, [
                item(
                    okAuthor,
                    'Yazar veya byline',
                    'İyi optimize: Kim yazdığı net (meta, şema veya sayfa üzerinde yazar bilgisi).',
                    failAuthor
                ),
                item(
                    okPublisher,
                    'Yayıncı / kurum',
                    'İyi optimize: Yayın kurumu veya kurum şeması ile güven sinyali verilmiş.',
                    failPublisher
                ),
                item(
                    okDates,
                    'Tarih ve tazelik',
                    'İyi optimize: Hem yayın hem güncelleme tarihi mevcut; tazelik anlaşılıyor.',
                    failDates
                ),
                item(
                    okExt,
                    'Dış referans çeşitliliği',
                    'İyi optimize: Dış kaynak çeşitliliği veya güvenilir alan bağlantıları yeterli.',
                    failExt
                ),
                item(
                    okSame,
                    'sameAs veya alıntı öğeleri',
                    'İyi optimize: Profil/kurumsal bağlantılar (sameAs) veya alıntı öğeleri kullanılmış.',
                    failSame
                ),
            ]),
            pillarDef('surface', 'Meta & yüzey', c4, PMAX, [
                item(
                    okOg,
                    'Open Graph (başlık + açıklama + görsel)',
                    'İyi optimize: Paylaşım önizlemesi için başlık, açıklama ve görsel tam.',
                    failOg
                ),
                item(okTw, 'Twitter kartı', 'İyi optimize: X (Twitter) kartı ve başlık paylaşıma hazır.', failTw),
                item(
                    okMetaTitle,
                    'Meta açıklama ve başlık uzunluğu',
                    'İyi optimize: Sayfa başlığı ve meta açıklama uzunlukları önerilen aralıkta.',
                    failMetaTitle
                ),
                item(okCanon, 'Canonical', 'İyi optimize: Tekil adres (canonical) tanımlı; kopya adres karmaşası azaltılmış.', failCanon),
            ]),
            pillarDef('technical', 'Teknik & medya', c5, PMAX, [
                item(
                    okNoindex,
                    'Arama indeksine uygunluk',
                    'İyi optimize: Bu sayfada arama motorlarının indekslemesini engelleyen bir robots kuralı görünmüyor; listelenmeye uygun.',
                    failNoindex
                ),
                item(
                    okVpLang,
                    'Viewport ve dil',
                    'İyi optimize: Mobil uyum (viewport) ve sayfa dili (lang) doğru ayarlanmış.',
                    failVpLang
                ),
                item(
                    okImgAlt,
                    'Görsellerde alt niteliği',
                    imgs.length === 0
                        ? 'Sayfada görsel yok.'
                        : 'Görsellerde alt niteliği var; boş alt değerlerinin dekoratif kullanımı ayrıca incelenmelidir.',
                    failImgAlt
                ),
                item(
                    okMedia,
                    'Video / gömülü içerik / modern görsel',
                    'İyi optimize: Video, gömülü oynatıcı veya modern görsel (picture) ile içerik zenginleştirilmiş.',
                    failMedia
                ),
                item(
                    okHttps,
                    'HTTPS veya güvenli bağlantı',
                    'İyi optimize: Site güvenli bağlantı (HTTPS) ile sunuluyor.',
                    failHttps
                ),
            ]),
        ];

        return {
            pageUrl: pageUrl,
            analyzedAt: new Date().toISOString(),
            score: total,
            grade: grade,
            pillars: pillars,
            stats: {
                wordCount: wordCount,
                mainWordCount: mainWordCount,
                mainContentRatio: Math.round(mainRatio * 100),
                avgWordsPerSentence: Math.round(avgSentLen * 10) / 10,
                h2Count: h2n,
                h3Count: h3n,
                richListCount: richLists,
                tableCount: tableCount,
                blockquoteCount: bqCount,
                dlTermCount: dlTerms,
                figureCount: figureN,
                questionHeadingCount: questionHeadings,
                firstParagraphChars: firstPLen,
                jsonLdBlockCount: jsonLdBlocks,
                jsonLdTypedNodes: ldTypedNodes,
                jsonLdParseErrors: parseErrors,
                uniqueExternalDomains: uniqueExtDomains,
                externalFollowLinks: extFollow,
                imageCount: imgs.length,
                imageAltRatio: Math.round(imgRatio * 100),
                imageAltEmptyCount: imageAlts.empty,
                imageAltDescribedCount: imageAlts.described,
                imageAltMissingCount: imageAlts.missing,
                hasMain: hasMain,
                hasArticle: hasArticleLandmark,
                hasSpeakable: hasSpeakable,
                hasBreadcrumb: hasBreadcrumb,
                sameAsInLd: ldAcc.sameAsHits,
                videoTagCount: videos,
                iframeCount: iframes,
                hreflangCount: hreflangN,
                robotsNoindex: robotsNoindex,
                https: isHttps,
            },
        };
    }

    /**
     * GEO İçerik Analizi — Yapay zeka arama motorlarının bir sayfayı kaynak
     * olarak gösterirken baktığı içerik sinyallerini analiz eder.
     * Tablo, soru-cevap yapıları, istatistik, alıntı, doğrudan cevap vb.
     */
    function analyzeGeoContent(doc, pageUrl) {
        var visibleText = getVisibleText(doc);
        var wordCount = countWords(visibleText);

        /* --- Scope: ana içerik alanı --- */
        var scope =
            doc.querySelector('main article') ||
            doc.querySelector('main') ||
            doc.querySelector('[role="main"]') ||
            doc.querySelector('article') ||
            doc.body;
        var scopeText = '';
        if (scope) {
            var sc = scope.cloneNode(true);
            var rm = sc.querySelectorAll('script, style, noscript, svg, template');
            for (var ri = 0; ri < rm.length; ri++) rm[ri].remove();
            scopeText = (sc.textContent || '').replace(/\s+/g, ' ').trim();
        }

        /* ===== 1. DOĞRUDAN CEVAP & ÖZET ===== */
        var firstP = scope ? scope.querySelector('p') : null;
        var firstPText = firstP ? (firstP.textContent || '').replace(/\s+/g, ' ').trim() : '';
        var firstPWords = countWords(firstPText);
        var directAnswerOk = firstPWords >= 20 && firstPWords <= 80;

        var first200Words = scopeText.split(/\s+/).slice(0, 200).join(' ');
        var hasDefinitionPattern = /\b(nedir|ne demek|anlamı|tanımı|kısaca|özetle|is a|refers to|means|defined as)\b/i.test(first200Words);

        /* ===== 2. SORU-CEVAP YAPILARI ===== */
        var allHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        var questionHeadings = [];
        var questionPatternTR = /\?|^(ne |nedir|nasıl|ne zaman|neden|kim|kaç|hangi|mi |mı |mu |mü |mıdır|midir|nerede)/i;
        var questionPatternEN = /\?|^(what|how|why|when|where|who|which|is |are |can |do |does |should )/i;
        for (var qi = 0; qi < allHeadings.length; qi++) {
            var qText = (allHeadings[qi].textContent || '').trim();
            if (questionPatternTR.test(qText) || questionPatternEN.test(qText)) {
                questionHeadings.push({
                    tag: allHeadings[qi].tagName,
                    text: qText.length > 120 ? qText.slice(0, 120) + '…' : qText,
                });
            }
        }
        var questionCount = questionHeadings.length;

        /* FAQ schema kontrolü */
        var roots = extractJsonLdRoots(doc);
        var hasFaqSchema = false;
        var hasHowToSchema = false;
        var hasOrgSchema = false;
        var hasPersonSchema = false;
        var sameAsCount = 0;
        for (var fi = 0; fi < roots.length; fi++) {
            if (roots[fi].error) continue;
            var raw = JSON.stringify(roots[fi].data || '');
            if (raw.indexOf('FAQPage') !== -1) hasFaqSchema = true;
            if (raw.indexOf('HowTo') !== -1) hasHowToSchema = true;
            if (raw.indexOf('Organization') !== -1) hasOrgSchema = true;
            if (raw.indexOf('Person') !== -1) hasPersonSchema = true;
            var sameAsMatches = raw.match(/"sameAs"\s*:/g) || [];
            sameAsCount += sameAsMatches.length;
        }

        /* details/summary soru-cevap (accordion FAQ) */
        var detailsSummary = doc.querySelectorAll('details > summary');
        var accordionFaqCount = 0;
        for (var di = 0; di < detailsSummary.length; di++) {
            var sText = (detailsSummary[di].textContent || '').trim();
            if (questionPatternTR.test(sText) || questionPatternEN.test(sText) || sText.length > 10) {
                accordionFaqCount++;
            }
        }

        /* ===== 3. TABLO KULLANIMI ===== */
        var tables = doc.querySelectorAll('table');
        var tableCount = tables.length;
        var wellStructuredTables = 0;
        var tableDetails = [];
        for (var ti = 0; ti < tables.length; ti++) {
            var tbl = tables[ti];
            var hasThead = !!tbl.querySelector('thead');
            var hasTh = tbl.querySelectorAll('th').length > 0;
            var rowCount = tbl.querySelectorAll('tr').length;
            var caption = tbl.querySelector('caption');
            var captionText = caption ? (caption.textContent || '').trim() : '';
            var isWell = (hasThead || hasTh) && rowCount >= 2;
            if (isWell) wellStructuredTables++;
            tableDetails.push({
                rows: rowCount,
                hasHeader: hasThead || hasTh,
                hasCaption: !!captionText,
                wellStructured: isWell,
            });
        }

        /* ===== 4. İSTATİSTİK & VERİ KALİTESİ ===== */
        var statPattern = /(\d{1,3}(?:[.,]\d{1,3})?)\s*(%|yüzde|oran|milyon|milyar|bin|trilyon|percent|million|billion)/gi;
        var statMatches = scopeText.match(statPattern) || [];
        var statCount = statMatches.length;

        var numericDataPattern = /\b\d{2,}\b/g;
        var numericHits = (scopeText.match(numericDataPattern) || []).length;

        /* Yıl referansları (güncellik sinyali) */
        var currentYear = new Date().getFullYear();
        var yearPattern = new RegExp('\\b(' + currentYear + '|' + (currentYear - 1) + ')\\b', 'g');
        var yearRefs = (scopeText.match(yearPattern) || []).length;

        /* ===== 5. ALINTI & KAYNAK GÖSTERİMİ ===== */
        var blockquotes = doc.querySelectorAll('blockquote');
        var bqCount = blockquotes.length;
        var bqWithCite = 0;
        for (var bi = 0; bi < blockquotes.length; bi++) {
            if (blockquotes[bi].getAttribute('cite') || blockquotes[bi].querySelector('cite')) bqWithCite++;
        }
        var citeElements = doc.querySelectorAll('cite').length;

        /* Inline kaynak linkleri (metin içi referans) */
        var anchors = scope ? scope.querySelectorAll('a[href]') : [];
        var origin = '';
        try { origin = new URL(pageUrl).origin; } catch (e) { }
        var inlineSourceLinks = 0;
        var authorityLinks = 0;
        var uniqueRefDomains = {};
        for (var ai = 0; ai < anchors.length; ai++) {
            var href = (anchors[ai].getAttribute('href') || '').trim();
            if (!href || href.charAt(0) === '#') continue;
            try {
                var absUrl = new URL(href, pageUrl);
                if (absUrl.protocol !== 'http:' && absUrl.protocol !== 'https:') continue;
                if (origin && absUrl.origin === origin) continue;
                inlineSourceLinks++;
                uniqueRefDomains[absUrl.hostname] = true;
                var host = absUrl.hostname.toLowerCase();
                if (host.indexOf('.gov') !== -1 || host.indexOf('.edu') !== -1 ||
                    host.indexOf('wikipedia.org') !== -1 || host.indexOf('wikidata.org') !== -1 ||
                    host.indexOf('ncbi.nlm.nih.gov') !== -1 || host.indexOf('scholar.google') !== -1 ||
                    host.indexOf('nature.com') !== -1 || host.indexOf('science.org') !== -1) {
                    authorityLinks++;
                }
            } catch (e2) { }
        }
        var uniqueRefDomainCount = Object.keys(uniqueRefDomains).length;

        /* ===== 6. YAPISAL İÇERİK ZENGİNLİĞİ ===== */
        var lists = doc.querySelectorAll('ul, ol');
        var richListCount = 0;
        var orderedListCount = 0;
        for (var li = 0; li < lists.length; li++) {
            var lic = lists[li].querySelectorAll('li').length;
            if (lic >= 2) richListCount++;
            if (lists[li].tagName === 'OL' && lic >= 2) orderedListCount++;
        }

        var dlCount = doc.querySelectorAll('dl').length;
        var figureCount = doc.querySelectorAll('figure').length;
        var figcaptionCount = doc.querySelectorAll('figcaption').length;
        var preCodeCount = doc.querySelectorAll('pre, code').length;
        var strongEmCount = doc.querySelectorAll('strong, b, em, i').length;

        /* ===== 7. YAZAR & GÜVENİLİRLİK ===== */
        var metaAuthor = metaByName(doc, 'author') || metaByProperty(doc, 'article:author');
        var bylineHit = !!doc.querySelector(
            '[rel="author"], [itemprop="author"], [class*="author"], [class*="byline"]'
        );
        var hasAuthor = !!(metaAuthor || bylineHit);

        var pageDates = analyzePageDates(doc, pageUrl);
        var hasPublished = pageDates.published.present;
        var hasModified = pageDates.modified.present;

        /* ===== 8. SPEAKABLE & YAPAY ZEKA İPUÇLARI ===== */
        var hasSpeakable = false;
        for (var si = 0; si < roots.length; si++) {
            if (roots[si].error) continue;
            var sRaw = JSON.stringify(roots[si].data || '');
            if (sRaw.indexOf('Speakable') !== -1 || sRaw.indexOf('speakable') !== -1) hasSpeakable = true;
        }

        /* meta robots - AI bot erişimi */
        var robotsMeta = doc.querySelector('meta[name="robots"]');
        var robotsContent = robotsMeta ? (robotsMeta.getAttribute('content') || '').toLowerCase() : '';
        var robotsNoindex = robotsContent.indexOf('noindex') !== -1;
        var googleBotMeta = doc.querySelector('meta[name="googlebot"]');
        var bingBotMeta = doc.querySelector('meta[name="bingbot"]');
        var aiBotMetaRaw =
            robotsContent +
            ' ' +
            (googleBotMeta ? (googleBotMeta.getAttribute('content') || '').toLowerCase() : '') +
            ' ' +
            (bingBotMeta ? (bingBotMeta.getAttribute('content') || '').toLowerCase() : '');
        var aiBotExplicitBlock =
            aiBotMetaRaw.indexOf('noai') !== -1 ||
            aiBotMetaRaw.indexOf('none') !== -1 ||
            aiBotMetaRaw.indexOf('nosnippet') !== -1 ||
            aiBotMetaRaw.indexOf('max-snippet:0') !== -1 ||
            aiBotMetaRaw.indexOf('noindex') !== -1;
        var aiBotAccessLevel = aiBotExplicitBlock ? 0 : robotsNoindex ? 1 : 2;

        /* ===== 8.5 YENI SINYALLER (AI görünürlük odaklı) ===== */
        var titleText = ((doc.querySelector('title') || {}).textContent || '').trim().toLowerCase();
        var h1Text = ((doc.querySelector('h1') || {}).textContent || '').trim().toLowerCase();
        var scopeLower = (scopeText || '').toLowerCase();

        /* Entity / marka netliği */
        var siteNameMeta = metaByProperty(doc, 'og:site_name') || metaByName(doc, 'application-name');
        var publisherMeta = metaByName(doc, 'publisher') || metaByProperty(doc, 'article:publisher');
        var contactSignals = doc.querySelectorAll('a[href*="iletisim"], a[href*="contact"], a[href^="tel:"], a[href^="mailto:"]').length;
        var entityScore = 0;
        if (hasOrgSchema || hasPersonSchema) entityScore++;
        if (sameAsCount >= 1 || siteNameMeta || publisherMeta || contactSignals >= 1) entityScore++;

        /* Intent coverage (alt niyet kümeleri) */
        var intentSurface = (titleText + ' ' + h1Text + ' ' + scopeLower.slice(0, 2500)).toLowerCase();
        var intentBuckets = [
            /\b(fiyat|ucret|ücret|maliyet|price|cost|teklif)\b/i,
            /\b(nasil|nasıl|how to|adim|adım|kurulum|rehber)\b/i,
            /\b(karsilastirma|karşılaştırma|vs\b|fark|compare|alternatif)\b/i,
            /\b(sorun|problem|hata|cozum|çözüm|fix)\b/i,
            /\b(nedir|ne demek|what is|tanim|tanım)\b/i,
            /\b(fayda|avantaj|neden|benefit)\b/i,
        ];
        var intentCoverageCount = 0;
        for (var ib = 0; ib < intentBuckets.length; ib++) {
            if (intentBuckets[ib].test(intentSurface)) intentCoverageCount++;
        }

        /* Render / crawl kalite (ilk HTML içinde anlamlı içerik oranı yaklaşımı) */
        var visibleWordCount = countWords(visibleText);
        var scopeWordCount = countWords(scopeText);
        var mainContentRatio = visibleWordCount > 0 ? scopeWordCount / visibleWordCount : 0;
        var inlineScripts = doc.querySelectorAll('script:not([src])');
        var heavyInlineScriptCount = 0;
        for (var isx = 0; isx < inlineScripts.length; isx++) {
            if ((inlineScripts[isx].textContent || '').length > 1800) heavyInlineScriptCount++;
        }
        var renderCrawlScore = 0;
        if (mainContentRatio >= 0.45) renderCrawlScore++;
        if (mainContentRatio >= 0.65 && heavyInlineScriptCount <= 4) renderCrawlScore++;

        /* İç link topikal destek */
        var internalLinkCount = 0;
        var topicalInternalLinkCount = 0;
        var uniqueInternalPaths = {};
        var topicTerms = (h1Text + ' ' + titleText)
            .split(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]+/)
            .filter(function (w) { return w && w.length >= 4; })
            .slice(0, 10);
        for (var iai = 0; iai < anchors.length; iai++) {
            var ihref = (anchors[iai].getAttribute('href') || '').trim();
            if (!ihref || ihref.charAt(0) === '#') continue;
            try {
                var iurl = new URL(ihref, pageUrl);
                if (iurl.protocol !== 'http:' && iurl.protocol !== 'https:') continue;
                if (origin && iurl.origin !== origin) continue;
                internalLinkCount++;
                uniqueInternalPaths[iurl.pathname] = true;
                var aText = (anchors[iai].textContent || '').toLowerCase();
                var hPath = iurl.pathname.toLowerCase();
                var topicalHit = false;
                for (var tt = 0; tt < topicTerms.length; tt++) {
                    var term = topicTerms[tt].toLowerCase();
                    if (term.length < 4) continue;
                    if (aText.indexOf(term) !== -1 || hPath.indexOf(term) !== -1) {
                        topicalHit = true;
                        break;
                    }
                }
                if (topicalHit) topicalInternalLinkCount++;
            } catch (e5) { }
        }
        var uniqueInternalPathCount = Object.keys(uniqueInternalPaths).length;
        var internalTopicalSupportLevel = 0;
        if (topicalInternalLinkCount >= 2) internalTopicalSupportLevel++;
        if (topicalInternalLinkCount >= 4 && uniqueInternalPathCount >= 3) internalTopicalSupportLevel++;

        /* Orijinallik / uzmanlık sinyalleri */
        var originalityPattern =
            /\b(vaka|case study|deneyim|sahada|gercek proje|gerçek proje|biz test ettik|we tested|our data|benchmark|metodoloji|methodology|kendi verilerimiz)\b/i;
        var originalityHits = (scopeText.match(new RegExp(originalityPattern.source, 'gi')) || []).length;
        var expertiseSignalLevel = 0;
        if (originalityHits >= 1 || statCount >= 3) expertiseSignalLevel++;
        if ((originalityHits >= 2 || bqWithCite >= 1) && hasAuthor) expertiseSignalLevel++;

        /* ===== 9. CÜMLE KALİTESİ & OKUNURLU ===== */
        var avgSentLen = geoAvgWordsPerSentence(scopeText || visibleText, 8000);
        var sentOk = avgSentLen >= 10 && avgSentLen <= 30;

        /* Paragraf sayısı */
        var paragraphs = scope ? scope.querySelectorAll('p') : [];
        var nonEmptyParagraphs = 0;
        for (var pi = 0; pi < paragraphs.length; pi++) {
            if (countWords((paragraphs[pi].textContent || '').trim()) >= 5) nonEmptyParagraphs++;
        }

        /* ===== 10. BAŞLIK HİYERARŞİSİ ===== */
        var h1Count = doc.querySelectorAll('h1').length;
        var h2Count = doc.querySelectorAll('h2').length;
        var h3Count = doc.querySelectorAll('h3').length;
        var hierarchyOk = h1Count === 1 && h2Count >= 2;

        /* ===== PUANLAMA ===== */
        function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

        /* check helper: her madde hangi puanı kırdı/kazandı, neden, ne yapılmalı */
        function chk(ok, pts, label, okMsg, failMsg, fix, optionalWhenFail) {
            var isOptional = !ok && optionalWhenFail === true;
            return {
                ok: ok,
                optional: isOptional,
                pts: pts,
                label: label,
                msg: ok ? okMsg : failMsg,
                fix: ok ? '' : fix,
            };
        }

        /* ===== Kategori 1: Doğrudan Cevap Uygunluğu (20p) ===== */
        var c1_checks = [];
        var s1 = 0;

        var c1a = directAnswerOk;
        if (c1a) s1 += 6; else if (firstPWords >= 10) s1 += 2;
        var c1aMsg = firstPWords < 20
            ? 'İlk paragrafınız çok kısa (' + firstPWords + ' kelime). Yapay zeka en az 20 kelimelik bir özet bekler.'
            : 'İlk paragrafınız çok uzun (' + firstPWords + ' kelime). Yapay zeka 80 kelimeden kısa özetleri tercih eder.';
        c1_checks.push(chk(c1a, 6,
            'İlk paragraf net bir cevap veriyor mu?',
            'Evet, ilk paragraf ' + firstPWords + ' kelimelik güzel bir özet.',
            c1aMsg,
            'Sayfanın en başına 2-3 cümlelik (20-80 kelime) bir özet paragraf yazın. Yapay zeka bir soruya cevap ararken ilk paragrafı alıntılar, o yüzden giriş paragrafı çok önemli.'
        ));

        var c1b = hasDefinitionPattern;
        if (c1b) s1 += 4;
        c1_checks.push(chk(c1b, 4,
            'İçerikte tanım cümlesi var mı?',
            'Evet, "nedir", "ne demek" gibi tanım kalıpları bulundu. Yapay zeka bu cümleleri kaynak gösterir.',
            'İçeriğinizde "X nedir?", "X ne demek?" gibi tanım cümleleri yok. Yapay zeka bir konuyu açıklarken tam da bu kalıpları arar ve alıntılar.',
            'İçeriğinize "X nedir?", "Kısaca X, şu demektir..." gibi tanım cümleleri ekleyin. Bu kalıplar yapay zekanın sizi kaynak gösterme ihtimalini ciddi artırır.'
        ));

        var c1c = wordCount >= 800;
        if (wordCount >= 300) s1 += 2;
        if (wordCount >= 800) s1 += 2;
        if (wordCount >= 1500) s1 += 2;
        c1_checks.push(chk(c1c, 6,
            'Yeterli içerik derinliği var mı? (' + wordCount + ' kelime)',
            'Evet, ' + wordCount + ' kelime yeterli derinlikte.',
            'Sadece ' + wordCount + ' kelime var. Yapay zeka detaylı içerikleri tercih eder, kısa içerikleri genelde es geçer.',
            'İçeriğinizi en az 800 kelimeye çıkarın. Konuyu alt başlıklarla bölümlere ayırın. Detaylı içerikler yapay zeka tarafından daha güvenilir bulunur.'
        ));

        var c1d = sentOk;
        if (c1d) s1 += 2;
        c1_checks.push(chk(c1d, 2,
            'Cümleler okunabilir uzunlukta mı? (ort. ' + Math.round(avgSentLen) + ' kelime)',
            'Evet, cümle uzunluğu dengeli.',
            'Cümleleriniz ' + (avgSentLen < 10 ? 'çok kısa' : 'çok uzun') + ' (ort. ' + Math.round(avgSentLen) + ' kelime). Yapay zeka doğal akan, okunabilir metinleri tercih eder.',
            'Cümlelerinizi 12-28 kelime arasında tutun. Çok kısa cümleler bilgi vermez, çok uzun cümleler de anlaşılmaz.'
        ));

        var c1e = nonEmptyParagraphs >= 3;
        if (c1e) s1 += 2;
        c1_checks.push(chk(c1e, 2,
            'Yeterli paragraf var mı? (' + nonEmptyParagraphs + ' paragraf)',
            'Evet, paragraf yapınız düzgün.',
            'Sadece ' + nonEmptyParagraphs + ' paragraf var. Yapay zeka blok halindeki metinleri okumakta zorlanır.',
            'İçeriğinizi en az 3-4 ayrı paragrafa bölün. Her paragraf bir fikri anlatsın. Paragraflar yapay zekanın bilgiyi parça parça çekmesini kolaylaştırır.'
        ));
        s1 = clamp(s1, 0, 20);

        /* ===== Kategori 2: Soru-Cevap Yapıları (20p) ===== */
        var c2_checks = [];
        var s2 = 0;

        var c2a = questionCount >= 6;
        if (questionCount >= 1) s2 += 2;
        if (questionCount >= 3) s2 += 2;
        if (questionCount >= 6) s2 += 3;
        if (questionCount >= 10) s2 += 2;
        c2_checks.push(chk(c2a, 9,
            'Başlıklarda soru formatı kullanılmış mı? (' + questionCount + ' adet)',
            questionCount + ' adet soru başlık var. ' + (questionCount >= 10 ? 'Ideal seviyede!' : 'İyi ama ideali 10-15 arası.'),
            questionCount === 0
                ? 'Hiçbir başlığınız soru formatında değil. Yapay zekaya soru soran kullanıcılar sizin sayfanızı bulamaz.'
                : 'Sadece ' + questionCount + ' soru başlık var, en az 6 olmalı. Ideali 10-15 arası.',
            'Başlıklarınızı "X Nedir?", "X Nasıl Yapılır?", "X\'in Faydaları Neler?" gibi soru formatına çevirin. En az 6, idealde 10-15 soru başlık hedefleyin.'
        ));

        var c2b = hasFaqSchema;
        if (c2b) s2 += 5;
        c2_checks.push(chk(c2b, 5,
            'SSS (FAQ) yapısı kodda işaretli mi?',
            'Evet, FAQPage yapısı var. Yapay zeka soru-cevaplarınızı direkt alıntılayabilir.',
            'Sayfanızda soru-cevaplar olsa bile kodda FAQ olarak işaretlenmemiş. Yapay zeka işaretlenmemiş soruları görmezden gelebilir.',
            'Geliştiricinizden sayfaya FAQPage schema eklemesini isteyin. Bu yapı yapay zekanın soru-cevaplarınızı direkt alıntılamasını sağlar.'
        ));

        var howToIntentPattern = /\b(nasil yapilir|nasıl yapılır|adim adim|adım adım|step by step|kurulum|montaj|rehber|guide)\b/i;
        var howToIntentSignals = howToIntentPattern.test(scopeText) || orderedListCount >= 1;
        var c2c = !howToIntentSignals || hasHowToSchema;
        if (c2c && hasHowToSchema) s2 += 3;
        c2_checks.push(chk(c2c, 3,
            'Nasıl yapılır adımları kodda işaretli mi?',
            hasHowToSchema
                ? 'Evet, HowTo yapısı var. Yapay zeka adımlarınızı sırasıyla gösterebilir.'
                : 'Bu içerikte adım bazlı bir anlatım sinyali zayıf, HowTo zorunlu değil.',
            'Adım içeren içeriklerde HowTo işaretlemesi yok. "Nasıl yapılır" aramalarında bu yapı görünürlüğü destekler.',
            'Eğer içerikte adım adım süreç anlatıyorsanız HowTo schema ekleyin. Adım içermeyen içeriklerde bu yapı zorunlu değildir.'
        ));

        var c2d = accordionFaqCount >= 1;
        if (c2d) s2 += 3;
        c2_checks.push(chk(c2d, 3,
            'Açılır-kapanır SSS bölümü var mı? (' + accordionFaqCount + ' adet)',
            accordionFaqCount + ' adet açılır-kapanır soru bölümü var.',
            'Sayfada açılır-kapanır soru-cevap bölümü yok. Bu format hem ziyaretçiler hem yapay zeka için bilgiyi kolayca bulmayı sağlar.',
            'Sık sorulan soruları açılır-kapanır formatında ekleyin. Yapay zeka bu yapıları kolayca okuyup alıntılayabilir.'
        ));

        var c2e = intentCoverageCount >= 4;
        if (intentCoverageCount >= 2) s2 += 2;
        if (intentCoverageCount >= 4) s2 += 2;
        c2_checks.push(chk(c2e, 4,
            'Alt niyet kümeleri kapsanmış mı? (' + intentCoverageCount + '/6)',
            'Evet, içerik farklı kullanıcı niyetlerini iyi kapsıyor.',
            'Niyet kapsaması düşük (' + intentCoverageCount + '/6). Yapay zeka farklı sorgu niyetlerinde bu sayfayı daha az seçebilir.',
            'Başlıklara fiyat, nasıl yapılır, karşılaştırma, sorun/çözüm ve tanım niyetlerini yayarak kapsamı artırın.'
        ));
        s2 = clamp(s2, 0, 20);

        /* ===== Kategori 3: Yapısal İçerik Zenginliği (20p) ===== */
        var c3_checks = [];
        var s3 = 0;

        var c3a = wellStructuredTables >= 1;
        if (c3a) s3 += 5;
        if (tableCount >= 2) s3 += 2;
        c3_checks.push(chk(c3a, 7,
            'Karşılaştırma tablosu var mı? (' + wellStructuredTables + '/' + tableCount + ')',
            wellStructuredTables + ' adet düzgün tablo var. Yapay zeka karşılaştırma sorularında tabloları direkt gösterir.',
            tableCount > 0
                ? tableCount + ' tablo var ama başlık satırları eksik.'
                : 'Hiç tablo yok. Fiyat, özellik veya karşılaştırma sorularında tablo olan sayfalar tercih edilir.',
            tableCount > 0
                ? 'Tablolarınıza başlık satırı ekleyin.'
                : 'Karşılaştırmalı bilgi varsa tablo olarak düzenleyin.'
        ));

        var c3b = richListCount >= 1;
        if (c3b) s3 += 3;
        if (orderedListCount >= 1) s3 += 2;
        c3_checks.push(chk(c3b, 5,
            'Liste var mı? (' + richListCount + ' liste, ' + orderedListCount + ' numaralı)',
            richListCount + ' adet liste kullanılmış.',
            'İçerikte liste yok. Yapay zeka bilgileri maddeler halinde göstermeyi sever.',
            'Önemli bilgileri madde madde listeleyin. Adım adım anlatıyorsanız numaralı liste kullanın.'
        ));

        var c3c = figureCount >= 1 && figcaptionCount >= 1;
        if (c3c) s3 += 3;
        c3_checks.push(chk(c3c, 3,
            'Görsellerin altında açıklama var mı?',
            'Evet, görseller açıklama yazısıyla eşleştirilmiş.',
            'Görsellerin altında açıklama yazısı yok. Yapay zeka görseli anlayamaz, açıklama yazısından ne olduğunu öğrenir.',
            'Görsellerin altına kısa açıklama yazıları ekleyin. Yapay zeka görsel + açıklama ikilisini kaynak olarak alıntılayabilir.'
        ));

        var c3d = hierarchyOk;
        if (c3d) s3 += 3;
        c3_checks.push(chk(c3d, 3,
            'Başlık yapısı düzgün mü? (H1: ' + h1Count + ', H2: ' + h2Count + ')',
            '1 ana başlık ve ' + h2Count + ' alt başlık ile güzel bölümlenmiş.',
            h1Count !== 1
                ? 'H1 sayısı ' + h1Count + ', tam olarak 1 tane olmalı.'
                : 'Sadece ' + h2Count + ' alt başlık var, en az 2 olmalı.',
            h1Count !== 1
                ? 'Tek bir H1 bırakın, diğerlerini H2 yapın.'
                : 'İçeriği en az 2 alt başlığa (H2) bölün.'
        ));

        var c3e = renderCrawlScore >= 1;
        if (renderCrawlScore >= 1) s3 += 1;
        if (renderCrawlScore >= 2) s3 += 1;
        c3_checks.push(chk(c3e, 2,
            'Render/crawl kalitesi yeterli mi?',
            'Evet, içerik gövdesi ilk HTML içinde yeterince görünür.',
            'İçeriğin ana gövde oranı düşük veya render yükü yüksek görünüyor. AI tarayıcıları içeriğin bir kısmını kaçırabilir.',
            'Ana içeriği ilk HTML içinde görünür tutun; aşırı büyük inline script bloklarını azaltın.'
        ));

        if (dlCount >= 1) s3 += 2;
        if (preCodeCount >= 1) s3 += 1;
        if (strongEmCount >= 3) s3 += 1;
        s3 = clamp(s3, 0, 20);

        /* ===== Kategori 4: Kanıt & Doğrulanabilirlik (20p) ===== */
        var c4_checks = [];
        var s4 = 0;

        var c4a = statCount >= 3;
        if (statCount >= 1) s4 += 3;
        if (statCount >= 3) s4 += 2;
        c4_checks.push(chk(c4a, 5,
            'Somut rakam ve istatistik var mı? (' + statCount + ' adet)',
            statCount + ' adet istatistik bulundu.',
            statCount > 0
                ? 'Sadece ' + statCount + ' rakam var, daha fazlası lazım. Yapay zeka veriye dayalı cevaplar vermek ister.'
                : 'İçerikte hiç rakam veya istatistik yok. Yapay zeka "ne kadar?", "yüzde kaç?" sorularında veri olan sayfaları tercih eder.',
            'Somut rakamlar ekleyin: "%40 artış", "2.5 milyon kullanıcı" gibi. Rakamlar yapay zekanın içeriğinizi somut ve güvenilir bulmasını sağlar.'
        ));

        var c4b = yearRefs >= 1;
        if (c4b) s4 += 3;
        c4_checks.push(chk(c4b, 3,
            'Güncel yıl referansı var mı?',
            'Evet, içerikte güncel yıl referansı var.',
            'Güncel yıl referansı yok. Yapay zeka eski görünen içerikleri kaynak olarak tercih etmez, güncel olanları ister.',
            '"' + currentYear + ' verilerine göre..." gibi güncel tarih referansları ekleyin. İçeriğin taze olduğunu gösteren yıl referansları yapay zeka için önemli bir sinyal.'
        ));

        var c4c = authorityLinks >= 1;
        if (bqCount >= 1) s4 += 2;
        if (bqWithCite >= 1) s4 += 2;
        if (citeElements >= 1) s4 += 1;
        if (inlineSourceLinks >= 2) s4 += 2;
        if (uniqueRefDomainCount >= 3) s4 += 2;
        if (c4c) s4 += 3;
        c4_checks.push(chk(c4c, 3,
            'Güvenilir kaynaklara link var mı? (' + authorityLinks + ' adet)',
            'Evet, resmi/akademik kaynaklara link verilmiş.',
            'Güvenilir dış kaynak linki görünmüyor. Bu her sayfada zorunlu değildir, ancak bilgi odaklı içeriklerde güven sinyalini artırır.',
            'İçerik bilgi/araştırma odaklıysa güvenilir kaynaklara referans eklemek faydalıdır. Ürün/hizmet sayfalarında zorunlu değildir.',
            true
        ));

        var c4d = inlineSourceLinks >= 2 && uniqueRefDomainCount >= 2;
        c4_checks.push(chk(c4d, 4,
            'Farklı dış kaynaklara referans var mı? (' + uniqueRefDomainCount + ' site)',
            uniqueRefDomainCount + ' farklı siteden ' + inlineSourceLinks + ' dış link var.',
            'Dış kaynak sayısı düşük (' + uniqueRefDomainCount + ' site). Bu metrik her sayfada zorunlu değildir; daha çok bilgi içeriklerinde güçlendirici bir sinyaldir.',
            'Bilgi ve karşılaştırma içeriklerinde farklı güvenilir kaynaklara referans vermek AI Botlarının İçeriğinize güvenmesini sağlar.',
            true
        ));

        var c4e = bqCount >= 1;
        c4_checks.push(chk(c4e, 2,
            'Uzman alıntısı var mı? (' + bqCount + ' adet)',
            bqCount + ' adet alıntı var.',
            'Uzman alıntısı yok. Bu her içerikte zorunlu değildir; olduğunda güven sinyalini güçlendirir.',
            'Mümkün olan içeriklerde uzman görüşü veya alıntı eklemek kalite sinyalini artırır. Ürün/hizmet sayfalarında zorunlu değildir.',
            true
        ));
        s4 = clamp(s4, 0, 20);

        /* ===== Kategori 5: Güvenilirlik Sinyalleri (20p) ===== */
        var c5_checks = [];
        var s5 = 0;

        var c5a = hasAuthor;
        if (c5a) s5 += 5;
        c5_checks.push(chk(c5a, 5,
            'İçeriği kimin yazdığı belli mi?',
            'Evet, yazar bilgisi mevcut.',
            'Yazarın kim olduğu belli değil. Yapay zeka yazarı belli olmayan içeriklere güvenmez.',
            'Sayfaya yazar adı ekleyin. "Yazan: Spindora Ekibi, SEO uzmanı" gibi bir satır yeterli. Yapay zeka yazarı belli olan içerikleri daha güvenilir bulur.'
        ));

        var c5b = hasPublished;
        if (c5b) s5 += 3;
        c5_checks.push(chk(c5b, 3,
            'Yayın tarihi belirtilmiş mi?',
            'Evet, yayın tarihi var.',
            'Geçerli bir sayfa yayın tarihi bulunamadı.',
            'Sayfaya uygun yayın tarihini görünür içerikte ve WebPage/Article JSON-LD veya meta etiketinde belirtin.'
        ));

        var c5c = hasModified;
        if (c5c) s5 += 3;
        c5_checks.push(chk(c5c, 3,
            'Son güncelleme tarihi var mı?',
            'Evet, güncelleme tarihi mevcut.',
            'Geçerli bir sayfa güncelleme tarihi bulunamadı.',
            'Gerçek içerik güncellemesinin tarihini görünür içerikte ve WebPage/Article JSON-LD veya meta etiketinde belirtin.'
        ));

        var c5d = hasSpeakable;
        if (c5d) s5 += 3;
        c5_checks.push(chk(c5d, 3,
            'Sesli asistanlar için işaretleme var mı?',
            'Evet, Speakable işaretleme var.',
            'Sesli asistan işaretlemesi yok. Google Asistan ve Siri gibi sesli yapay zekalar hangi kısmı okuması gerektiğini bilemiyor.',
            'Geliştiricinizden Speakable schema eklemesini isteyin. Bu sayede sesli aramalarda yapay zeka içeriğinizi sesli olarak okuyabilir.'
        ));

        var c5e = !robotsNoindex;
        if (c5e) s5 += 3;
        c5_checks.push(chk(c5e, 3,
            'Yapay zeka botları sayfayı görebiliyor mu?',
            'Evet, sayfa yapay zeka botlarına açık.',
            'Sayfa noindex ile engellenmiş! Yapay zeka bu sayfayı göremez.',
            'Geliştiricinizden noindex etiketini kaldırmasını isteyin.'
        ));

        var c5f = hasFaqSchema || hasHowToSchema;
        if (c5f) s5 += 3;
        c5_checks.push(chk(c5f, 3,
            'FAQ veya HowTo işaretlemesi var mı?',
            'Evet, yapay zeka bu işaretlemeleri direkt okuyabilir.',
            'FAQ veya HowTo işaretlemesi yok. Bu işaretlemeler yapay zekanın içeriğinizi anında anlamasını ve kullanıcıya göstermesini sağlar.',
            'Geliştiricinizden FAQ veya HowTo schema eklemesini isteyin. Bu işaretlemeler olmadan yapay zeka içeriğinizi yapılandırılmış kaynak olarak gösteremez.'
        ));

        var c5g = aiBotAccessLevel >= 1;
        if (aiBotAccessLevel >= 1) s5 += 1;
        if (aiBotAccessLevel >= 2) s5 += 1;
        c5_checks.push(chk(c5g, 2,
            'AI bot erişilebilirlik sinyali uygun mu?',
            'Meta robot sinyalleri AI botlar için engelleyici görünmüyor.',
            'Meta robot sinyallerinde AI botları kısıtlayabilecek işaretler var.',
            'robots meta / googlebot / bingbot etiketlerinde noindex, nosnippet, max-snippet:0 gibi kısıtlayıcıları gözden geçirin.'
        ));

        var c5h = entityScore >= 1;
        if (entityScore >= 1) s5 += 1;
        if (entityScore >= 2) s5 += 1;
        c5_checks.push(chk(c5h, 2,
            'Entity/marka sinyali net mi?',
            'Organization/Person ve marka sinyalleri yeterli görünüyor.',
            'Marka veya yazar kimliği sinyalleri zayıf görünüyor.',
            'Organization/Person şeması, sameAs bağlantıları ve publisher/site adı sinyallerini tamamlayın.'
        ));

        var c5i = internalTopicalSupportLevel >= 1;
        if (internalTopicalSupportLevel >= 1) s5 += 1;
        if (internalTopicalSupportLevel >= 2) s5 += 1;
        c5_checks.push(chk(c5i, 2,
            'İç link topikal destek yeterli mi?',
            'Konuya ilgili iç link desteği mevcut.',
            'İç linklerde topikal destek düşük; konu kümesi zayıf görünüyor.',
            'Aynı konu kümesine bağlı 3+ iç sayfaya metin içinden bağlantı verin; anchor metinleri konuya yakın olsun.'
        ));

        var c5j = expertiseSignalLevel >= 1;
        if (expertiseSignalLevel >= 1) s5 += 1;
        if (expertiseSignalLevel >= 2) s5 += 1;
        c5_checks.push(chk(c5j, 2,
            'Orijinallik/uzmanlık sinyali var mı?',
            'Özgün veri veya uzmanlık sinyalleri bulunuyor.',
            'İçerik daha çok genel anlatımda kalıyor; özgün uzmanlık sinyali zayıf.',
            'Vaka, test sonucu, özgün veri veya metodoloji bölümü ekleyin; mümkünse yazarı ve kaynağıyla destekleyin.'
        ));
        s5 = clamp(s5, 0, 20);

        var total = clamp(s1 + s2 + s3 + s4 + s5, 0, 100);
        var grade = 'D';
        if (total >= 85) grade = 'A';
        else if (total >= 65) grade = 'B';
        else if (total >= 45) grade = 'C';

        /* Kategori skorları + her birinin check detayları */
        var categories = [
            {
                id: 'direct-answer',
                name: 'Doğrudan Cevap Uygunluğu',
                desc: 'Yapay zeka bir soruya cevap verirken, hemen net cevap bulabildigi sayfaları kaynak gösterir.',
                score: s1,
                max: 20,
                checks: c1_checks,
            },
            {
                id: 'qa-structure',
                name: 'Soru-Cevap Yapıları',
                desc: 'Kullanıcılar yapay zekaya soru sorar. Sayfanızda bu soruların cevabı başlıklarda geçiyorsa eşleşme olur.',
                score: s2,
                max: 20,
                checks: c2_checks,
            },
            {
                id: 'structural-richness',
                name: 'Yapısal İçerik Zenginliği',
                desc: 'Tablolar, listeler ve düzgün başlıklar yapay zekanın bilgiyi çıkarmasını kolaylaştırır.',
                score: s3,
                max: 20,
                checks: c3_checks,
            },
            {
                id: 'evidence',
                name: 'Kanıt & Doğrulanabilirlik',
                desc: 'Yapay zeka rakam, kaynak ve alıntı olan içeriklere daha çok güvenir.',
                score: s4,
                max: 20,
                checks: c4_checks,
            },
            {
                id: 'trust-signals',
                name: 'Güvenilirlik Sinyalleri',
                desc: 'Kim yazmış, ne zaman yazmış, güncel mi — yapay zeka bunlara bakarak güvenilirliğe karar verir.',
                score: s5,
                max: 20,
                checks: c5_checks,
            },
        ];

        return {
            pageUrl: pageUrl,
            analyzedAt: new Date().toISOString(),
            score: total,
            grade: grade,
            categories: categories,
            details: {
                wordCount: wordCount,
                firstParagraphWords: firstPWords,
                directAnswerOk: directAnswerOk,
                hasDefinitionPattern: hasDefinitionPattern,
                questionHeadingCount: questionCount,
                questionHeadings: questionHeadings.slice(0, 10),
                hasFaqSchema: hasFaqSchema,
                hasHowToSchema: hasHowToSchema,
                accordionFaqCount: accordionFaqCount,
                tableCount: tableCount,
                wellStructuredTables: wellStructuredTables,
                tableDetails: tableDetails.slice(0, 5),
                statCount: statCount,
                yearReferences: yearRefs,
                blockquoteCount: bqCount,
                blockquoteWithCite: bqWithCite,
                citeElements: citeElements,
                inlineSourceLinks: inlineSourceLinks,
                authorityLinks: authorityLinks,
                uniqueRefDomains: uniqueRefDomainCount,
                richListCount: richListCount,
                orderedListCount: orderedListCount,
                dlCount: dlCount,
                figureWithCaption: Math.min(figureCount, figcaptionCount),
                codeBlockCount: preCodeCount,
                strongEmCount: strongEmCount,
                h1Count: h1Count,
                h2Count: h2Count,
                h3Count: h3Count,
                hasAuthor: hasAuthor,
                hasPublished: hasPublished,
                hasModified: hasModified,
                hasSpeakable: hasSpeakable,
                robotsNoindex: robotsNoindex,
                aiBotAccessLevel: aiBotAccessLevel,
                entityScore: entityScore,
                intentCoverageCount: intentCoverageCount,
                renderCrawlScore: renderCrawlScore,
                mainContentRatio: Math.round(mainContentRatio * 100),
                internalLinkCount: internalLinkCount,
                topicalInternalLinkCount: topicalInternalLinkCount,
                uniqueInternalPaths: uniqueInternalPathCount,
                internalTopicalSupportLevel: internalTopicalSupportLevel,
                originalityHits: originalityHits,
                expertiseSignalLevel: expertiseSignalLevel,
                avgSentenceLength: Math.round(avgSentLen * 10) / 10,
                paragraphCount: nonEmptyParagraphs,
            },
        };
    }

    global.SpindoraSEO = {
        analyzeDocument: analyzeDocument,
        analyzeHtmlString: analyzeHtmlString,
        parseHtmlToDocument: parseHtmlToDocument,
        extractBotViewPlainTextFromDocument: function (doc) {
            return extractBotViewPlainText(doc);
        },
        extractBotViewPlainTextFromHtml: function (html, baseUrl) {
            return extractBotViewPlainText(parseHtmlToDocument(html, baseUrl || 'about:blank'));
        },
        extractBotViewTextLinesFromDocument: function (doc) {
            return extractBotViewTextLines(doc);
        },
        extractBotViewTextLinesFromHtml: function (html, baseUrl) {
            return extractBotViewTextLines(parseHtmlToDocument(html, baseUrl || 'about:blank'));
        },
        analyzeSocialView: analyzeSocialView,
        extractImagesBasic: extractImagesBasic,
        extractOutgoingLinks: extractOutgoingLinks,
        extractJsonLdRoots: extractJsonLdRoots,
        analyzeSchemaSiteHints: analyzeSchemaSiteHints,
        analyzeGeo: analyzeGeo,
        analyzeGeoContent: analyzeGeoContent,
        schemaTypeEnglish: schemaTypeEnglish,
        TITLE_RANGE: [TITLE_MIN, TITLE_MAX],
        DESC_RANGE: [DESC_MIN, DESC_MAX],
        MIN_WORDS: MIN_WORDS,
    };
})(typeof self !== 'undefined' ? self : typeof globalThis !== 'undefined' ? globalThis : this);
