"""Rebuild the local WordPress content audit without network calls or imports.

Python 3.12, standard library only. Raw XML/HTML is data, never executable code.
Language is inferred from URL, not asserted from WPML translation metadata.
"""

from __future__ import annotations

import csv
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from collections import Counter, defaultdict
import unicodedata
from urllib.parse import parse_qsl, urlencode, unquote, urljoin, urlsplit, urlunsplit
import xml.etree.ElementTree as ET
import zipfile


ROOT = Path(__file__).resolve().parents[1]
XML_PATH = ROOT / "source/dragomandivingandoutdoors.WordPress.2026-10-25.xml"
OUT = ROOT / "analysis"
NS = {"wp": "http://wordpress.org/export/1.2/", "content": "http://purl.org/rss/1.0/modules/content/"}
SITE = "https://dragoman-turkey.com/"
HOSTS = {"dragoman-turkey.com", "www.dragoman-turkey.com"}
CONTENT_TYPES = {"page", "post", "product", "wp_block"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}
HOME_IDS = {"2", "335", "936"}
CATEGORY_IDS = {"26": "diving", "28": "sea-kayak", "30": "outdoor", "32": "transport"}
GROUPS = {
    "home": ("2", "335", "936"),
    "diving": ("26", "905", "327"),
    "sea-kayak": ("28", "326", "939"),
    "outdoor": ("30", "325", "961"),
    "transport": ("32", "417", "963"),
    "shop": ("8", "20", "16"),
    "about": ("34", "377", "959"),
    "contact": ("36", "380", "957"),
    "blog-index": ("450", "683", "954"),
    "dive-sites": ("595", "720", "965"),
    "privacy": ("3", "971", "973"),
    "terms": ("12", "975", "977"),
    "participation": ("1033", "1052", "1056"),
    "lifeguard": (None, "865", None),
    "kayak-classic": ("567", "1671", "1670"),
    "kayak-west": ("508", "1683", "1682"),
    "kayak-east": ("544", "1677", "1676"),
    "lycian-kayak": ("590", "1659", "1658"),
    "maldives-2026": ("667", "848", "922"),
    "raja-2027": ("2217", "1884", "2233"),
    "sharm-2026": (None, "1987", None),
    "webinar": ("1792", "1799", "1798"),
    "raja-earlier": ("455", "458", None),
    "book-diving-guide": ("15", "165", None),
    "book-mediterranean-en": ("41", "162", "995"),
    "book-mediterranean-fr": ("158", "164", "993"),
    "book-mediterranean-tr": ("126", "166", "994"),
}


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value or "")).strip()


def language(url: str) -> str:
    first = urlsplit(url).path.strip("/").split("/")[0]
    return first if first in {"tr", "fr", "de"} else "en"


def clean_url(value: str, base: str = SITE) -> str:
    absolute = urljoin(base, html.unescape(value.strip()))
    parts = urlsplit(absolute)
    # Keep ordinary routing queries; redact any access credentials in URL data.
    query = [(k, "[REDACTED]" if re.search(r"token|password|secret|nonce|auth|signature|email|api.?key", k, re.I) else v)
             for k, v in parse_qsl(parts.query, keep_blank_values=True)]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


def url_key(url: str) -> str:
    parts = urlsplit(url)
    host = (parts.hostname or "").lower().removeprefix("www.")
    return host + unicodedata.normalize("NFC", unquote(parts.path)).rstrip("/")


class Body(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.text: list[str] = []
        self.headings: list[dict] = []
        self.links: list[dict] = []
        self.images: list[dict] = []
        self.anchor_ids: set[str] = set()
        self.stack: list[tuple[str, list[str], dict]] = []
        self.skip = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if tag in {"script", "style"}:
            self.skip += 1
        if a.get("id"):
            self.anchor_ids.add(a["id"])
        if tag == "a" and a.get("name"):
            self.anchor_ids.add(a["name"])
        if re.fullmatch(r"h[1-6]", tag) or tag == "a":
            self.stack.append((tag, [], a))
        if tag == "img":
            ids = re.findall(r"\bwp-image-(\d+)\b", a.get("class") or "")
            self.images.append({"src": a.get("src") or "", "alt": a.get("alt") or "", "attachment_id": ids[0] if ids else ""})
        if tag in {"p", "div", "br", "li", "td", "h1", "h2", "h3", "h4"}:
            self.text.append(" ")

    def handle_data(self, data: str) -> None:
        if not self.skip:
            self.text.append(data)
            for _, chunks, _ in self.stack:
                chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self.skip:
            self.skip -= 1
        for i in range(len(self.stack) - 1, -1, -1):
            opened, chunks, attrs = self.stack[i]
            if opened != tag:
                continue
            text = compact("".join(chunks))
            if tag == "a" and attrs.get("href"):
                self.links.append({"href": attrs["href"], "label": text})
            elif tag.startswith("h"):
                self.headings.append({"level": int(tag[1]), "text": text})
            del self.stack[i]
            break


def field(item: ET.Element, path: str) -> str:
    return item.findtext(path, default="", namespaces=NS) or ""


def safe_cell(value):
    # CSV files can be opened in Excel without interpreting imported text as formulas.
    if isinstance(value, str) and value.lstrip().startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def write_csv(name: str, rows: list[dict], columns: list[str]) -> None:
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns, extrasaction="raise")
        writer.writeheader()
        writer.writerows({key: safe_cell(value) for key, value in row.items()} for row in rows)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    OUT.mkdir(exist_ok=True)
    channel = ET.parse(XML_PATH).getroot().find("channel")
    assert channel is not None
    items = channel.findall("item")
    raw_by_id = {field(x, "wp:post_id"): x for x in items}
    type_counts = Counter(field(x, "wp:post_type") for x in items)
    records = []
    bodies = {}
    media = []
    meta_by_id = {}
    products = []
    forms = []
    menus = []
    for item in items:
        ident = field(item, "wp:post_id")
        typ = field(item, "wp:post_type")
        meta = {field(m, "wp:meta_key"): field(m, "wp:meta_value") for m in item.findall("wp:postmeta", NS)}
        meta_by_id[ident] = meta
        if typ == "nav_menu_item":
            object_id = meta.get("_menu_item_object_id", "")
            target_item = raw_by_id.get(object_id)
            target_url = meta.get("_menu_item_url", "") or (field(target_item, "link") if target_item is not None else "")
            target_title = field(target_item, "title") if target_item is not None else ""
            menus.append({"id": ident, "menu": ";".join(compact(x.text or "") for x in item.findall("category") if x.get("domain") == "nav_menu"),
                          "order": field(item, "wp:menu_order"), "parent_menu_id": meta.get("_menu_item_menu_item_parent", ""),
                          "object_id": object_id, "label": compact(field(item, "title") or target_title),
                          "target": clean_url(target_url) if target_url else "", "status": "legacy_menu_reference_not_new_layout_approval"})
        if typ == "attachment":
            serialized = meta.get("_wp_attachment_metadata", "")
            width = re.search(r's:5:"width";i:(\d+);', serialized)
            height = re.search(r's:6:"height";i:(\d+);', serialized)
            media.append({"id": ident, "title": compact(field(item, "title")), "url": clean_url(field(item, "wp:attachment_url")),
                          "parent": field(item, "wp:post_parent"), "file": meta.get("_wp_attached_file", ""),
                          "width_metadata": int(width[1]) if width else "", "height_metadata": int(height[1]) if height else "",
                          "alt_present": bool(compact(meta.get("_wp_attachment_image_alt", ""))), "url_language": language(field(item, "link"))})
        if typ == "wpcf7_contact_form":
            forms.append({"id": ident, "title": compact(field(item, "title")),
                          "fields": [{"type": a, "name": b} for a, b in re.findall(r"\[([a-z][a-z0-9_*]+)\s+([a-zA-Z0-9_-]+)", meta.get("_form", ""))]})
        if typ not in CONTENT_TYPES:
            continue
        body = Body()
        source_html = field(item, "content:encoded")
        body.feed(source_html)
        bodies[ident] = body
        text = compact("".join(body.text))
        url = field(item, "link")
        flags = []
        if not text:
            flags.append("no_body_text_check_dynamic_content")
        if not compact(field(item, "title")):
            flags.append("missing_title_home_candidate" if ident in HOME_IDS else "missing_title")
        if "[contact-form-7" in source_html:
            flags.append("contact_form_shortcode")
        if "[woocommerce_" in source_html:
            flags.append("woocommerce_shortcode")
        if re.search(r"flywheelsites\.com", source_html, re.I):
            flags.append("legacy_host_reference")
        if re.search(r"\{\{|\{[^{}]*(?:address|email|phone)[^{}]*\}|\[insert|suggested text", text, re.I):
            flags.append("possible_template_placeholder_manual_review")
        if len(text) > 9000:
            flags.append("long_content_split_candidate")
        if ident == "1":
            flags.append("hello_world_sample_exclude_candidate")
        records.append({"id": ident, "type": typ, "url_language": language(url), "title": compact(field(item, "title")),
                        "url": clean_url(url), "slug": field(item, "wp:post_name"), "status": field(item, "wp:status"),
                        "date": field(item, "wp:post_date"), "text_characters": len(text), "heading_count": len(body.headings),
                        "inline_image_count": len(body.images), "link_count": len(body.links), "flags": ";".join(flags), "import_status": "draft_only"})
        if typ == "product":
            products.append({"id": ident, "url_language": language(url), "title": compact(field(item, "title")), "url": clean_url(url),
                             "historical_price": meta.get("_price", ""), "currency": "not_exported_as_site_option",
                             "stock_management": meta.get("_manage_stock", ""), "historical_stock_status": meta.get("_stock_status", ""),
                             "stock_quantity": meta.get("_stock", ""), "thumbnail_id": meta.get("_thumbnail_id", ""),
                             "gallery_ids": meta.get("_product_image_gallery", ""), "migration_status": "customer_price_stock_approval_required"})

    by_id = {x["id"]: x for x in records}
    known_pages = {url_key(x["url"]): x for x in records}
    media_by_key = defaultdict(list)
    for m in media:
        media_by_key[url_key(m["url"])].append(m["id"])
        serialized = meta_by_id[m["id"]].get("_wp_attachment_metadata", "")
        for filename in re.findall(r's:4:"file";s:\d+:"([^"]+)";', serialized):
            media_by_key[url_key(urljoin(m["url"], filename.split("/")[-1]))].append(m["id"])

    links = []
    sections = []
    hero = []
    media_by_id = {x["id"]: x for x in media}
    for rec in records:
        ident = rec["id"]
        body = bodies[ident]
        for order, heading in enumerate(body.headings, 1):
            sections.append({"source_id": ident, "language": rec["url_language"], "source_url": rec["url"], "order": order,
                             "level": heading["level"], "heading": heading["text"]})
        for link in body.links:
            target = clean_url(link["href"], rec["url"])
            parts = urlsplit(target)
            key = url_key(target)
            host = (parts.hostname or "").lower()
            if parts.scheme in {"mailto", "tel", "sms", "whatsapp"}:
                kind = "contact_link_not_http_checked"
            elif parts.scheme not in {"http", "https"}:
                kind = "unsupported_scheme_manual_review"
            elif host.endswith("flywheelsites.com"):
                kind = "legacy_host_manual_mapping"
            elif host not in HOSTS:
                kind = "external_not_http_checked"
            elif parts.query:
                kind = "internal_query_manual_review"
            elif key in known_pages:
                target_record = known_pages[key]
                if parts.fragment and unquote(parts.fragment) not in bodies[target_record["id"]].anchor_ids:
                    kind = "internal_fragment_not_found_in_export"
                else:
                    kind = "internal_content_present_in_export"
            elif key in media_by_key or "/wp-content/uploads/" in parts.path:
                kind = "media_reference_not_downloaded"
            else:
                kind = "internal_target_absent_from_export_not_a_confirmed_404"
            links.append({"source_id": ident, "language": rec["url_language"], "source_url": rec["url"],
                          "label": link["label"], "target": target, "classification": kind})
        if ident in CATEGORY_IDS and ident != "32":
            for image in body.images:
                src = clean_url(image["src"], rec["url"])
                ids = set(media_by_key.get(url_key(src), []))
                if image["attachment_id"]:
                    ids.add(image["attachment_id"])
                candidates = [media_by_id[i] for i in sorted(ids, key=int) if i in media_by_id]
                representative = candidates[0] if candidates else {}
                hero.append({"category": CATEGORY_IDS[ident], "source_id": ident, "inline_url": src,
                             "attachment_ids": ",".join(sorted(ids, key=int)), "original_url": representative.get("url", ""),
                             "width_metadata": representative.get("width_metadata", ""), "height_metadata": representative.get("height_metadata", ""),
                             "inline_alt_present": bool(compact(image["alt"])), "selection_status": "metadata_candidate_not_visually_reviewed"})

    translations = []
    for group, ids in GROUPS.items():
        row = {"group": group, "match_method": "editorial_title_and_url_match_not_wpml_relationship"}
        for lang, ident in zip(("en", "tr", "fr"), ids):
            row[lang + "_id"] = ident or ""
            row[lang + "_url"] = by_id[ident]["url"] if ident else ""
        row["de_id"] = ""
        row["review_status"] = "draft_translation_and_customer_review_required"
        translations.append(row)

    activities = []
    # Selected sections only. Heading candidates need review; no synthetic SKUs or pricing.
    for ident in CATEGORY_IDS:
        current_h2 = ""
        for h in bodies[ident].headings:
            if h["level"] == 2:
                current_h2 = h["text"]
            if h["level"] != 3:
                continue
            if ident == "26" and not re.match(r"SSI |React Right|Equipment Techniques|Dry Suit", h["text"]):
                continue
            if ident == "26" and h["text"] in {"SSI Diving Courses", "SSI Professional Level Courses", "SSI Speciality Courses"}:
                continue
            activities.append({"category": CATEGORY_IDS[ident], "source_id": ident, "source_url": by_id[ident]["url"],
                               "section": current_h2, "candidate_name": h["text"], "source_format": "embedded_heading",
                               "status": "candidate_not_approved_for_publication"})
    for ident in ("567", "508", "544", "590", "667", "2217", "1987", "865"):
        rec = by_id[ident]
        activities.append({"category": "sea-kayak" if ident in {"567", "508", "544", "590"} else "diving",
                           "source_id": ident, "source_url": rec["url"], "section": "standalone_source",
                           "candidate_name": rec["title"], "source_format": rec["type"], "status": "candidate_not_approved_for_publication"})

    redirects = [{"source_id": rec["id"], "old_url": rec["url"], "language": rec["url_language"], "new_url": "",
                  "status": "exclude_sample_candidate" if rec["id"] == "1" else "mapping_required_after_url_design",
                  "note": "home_content_do_not_discard_due_to_sample_slug" if rec["id"] in HOME_IDS else ""}
                 for rec in records if rec["type"] in {"page", "post", "product"}]

    preserved = json.loads((OUT / "organization-manifest.json").read_text(encoding="utf-8-sig"))
    integrity_failures = [x["CurrentPath"] for x in preserved if digest(ROOT / x["CurrentPath"]) != x["SHA256"].lower()]
    extracted = json.loads((ROOT / "extracted/icerikler.json").read_text(encoding="utf-8-sig"))
    mismatches = [str(x["id"]) for x in extracted if x["content_html"] != field(raw_by_id[str(x["id"])], "content:encoded")]
    actual_extract = {str(p.relative_to(ROOT / "extracted")).replace("\\", "/"): digest(p) for p in (ROOT / "extracted").rglob("*") if p.is_file()}
    actual_duplicate = {str(p.relative_to(ROOT / "archive/dragoman-icerik1")).replace("\\", "/"): digest(p) for p in (ROOT / "archive/dragoman-icerik1").rglob("*") if p.is_file()}
    with zipfile.ZipFile(ROOT / "archive/dragoman-icerik.zip") as archive:
        zip_extract = {name: hashlib.sha256(archive.read(name)).hexdigest() for name in archive.namelist() if not name.endswith("/")}
    local_media_files = [str(p.relative_to(ROOT)) for folder in (ROOT / "source", ROOT / "extracted", ROOT / "archive")
                         for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS | {".mp4", ".webm", ".mov", ".pdf"}]
    snapshot = {
        "audit_date": "2026-10-26", "source_export_date": "2026-10-25", "source_site": field(channel, "link"),
        "source_sha256": digest(XML_PATH), "total_xml_items": len(items), "counts_by_type": dict(type_counts),
        "content_records": len(records), "content_by_type_and_url_language": dict(Counter(f'{x["type"]}/{x["url_language"]}' for x in records)),
        "media_records": len(media), "unique_exact_media_urls": len({x["url"] for x in media}),
        "unique_normalized_media_paths": len({url_key(x["url"]) for x in media}),
        "media_missing_alt_records": sum(not x["alt_present"] for x in media),
        "media_without_size_metadata": sum(not x["width_metadata"] or not x["height_metadata"] for x in media),
        "unique_media_paths_without_any_alt_metadata": sum(not any(x["alt_present"] for x in media if url_key(x["url"]) == key) for key in {url_key(x["url"]) for x in media}),
        "local_media_files": local_media_files, "content_flags": dict(Counter(flag for x in records for flag in x["flags"].split(";") if flag)),
        "link_classifications": dict(Counter(x["classification"] for x in links)),
        "contact_forms": forms, "legacy_menus": dict(Counter(x["menu"] for x in menus)),
        "activity_candidate_rows": len(activities), "hero_metadata_candidates": len(hero),
        "verification": {"preserved_files": len(preserved), "integrity_failures": integrity_failures,
                         "extracted_records": len(extracted), "xml_content_ids_equal_extracted_ids": set(by_id) == {str(x["id"]) for x in extracted},
                         "extracted_html_mismatch_ids": mismatches, "duplicate_folders_equal": actual_extract == actual_duplicate,
                         "zip_equals_extracted_folder": zip_extract == actual_extract},
        "limitations": ["No network or HTTP status checks", "No image files downloaded or visually reviewed", "No complete WordPress database/theme/plugin backup", "URL language does not certify actual language or translation approval", "New page URLs and publication require decisions", "Product currency is not verified by export site options"],
    }
    write_csv("content-inventory.csv", records, list(records[0]))
    write_csv("media-inventory.csv", media, list(media[0]))
    write_csv("links.csv", links, list(links[0]))
    write_csv("page-sections.csv", sections, list(sections[0]))
    write_csv("translation-matrix.csv", translations, list(translations[0]))
    write_csv("activity-candidates.csv", activities, list(activities[0]))
    write_csv("hero-media-candidates.csv", hero, list(hero[0]))
    write_csv("products.csv", products, list(products[0]))
    write_csv("redirect-candidates.csv", redirects, list(redirects[0]))
    write_csv("legacy-menus.csv", menus, list(menus[0]))
    duplicate_media = [{"normalized_path": key, "attachment_ids": ",".join(x["id"] for x in media if url_key(x["url"]) == key),
                        "record_count": sum(url_key(x["url"]) == key for x in media)}
                       for key, count in Counter(url_key(x["url"]) for x in media).items() if count > 1]
    write_csv("duplicate-media.csv", duplicate_media, ["normalized_path", "attachment_ids", "record_count"])
    (OUT / "summary.json").write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    assert not integrity_failures, integrity_failures
    assert not mismatches, mismatches
    assert snapshot["verification"]["xml_content_ids_equal_extracted_ids"]
    assert actual_extract == actual_duplicate == zip_extract
    print(json.dumps(snapshot, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
