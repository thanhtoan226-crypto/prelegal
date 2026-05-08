from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from fastapi import HTTPException

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "templates"
CATALOG_PATH = TEMPLATES_DIR.parent / "catalog.json"

_span_re = re.compile(
    r'<span class="(coverpage|orderform|keyterms|businessterms|sow)_link">([^<]+)</span>'
)
_header_span_re = re.compile(r'<span class="header_[23]"[^>]*>([^<]+)</span>')
_bracket_re = re.compile(r"\[([^\]]+)\]")
_id_re = re.compile(r' id="[^"]*"')

_slug_map: dict[str, dict[str, Any]] | None = None
_template_cache: dict[str, str] = {}
_field_cache: dict[str, list[str]] = {}


def _slugify(filename: str) -> str:
    return filename.removesuffix(".md").lower()


def _normalize_quotes(text: str) -> str:
    return text.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')


def _load_catalog_raw() -> list[dict[str, Any]]:
    with open(CATALOG_PATH) as f:
        return json.load(f)


def _build_slug_map() -> dict[str, dict[str, Any]]:
    global _slug_map
    if _slug_map is not None:
        return _slug_map
    catalog = _load_catalog_raw()
    _slug_map = {}
    for entry in catalog:
        slug = _slugify(entry["filename"])
        entry["_slug"] = slug
        _slug_map[slug] = entry
    _slug_map["mutual-nda"]["_companion"] = "Mutual-NDA-coverpage.md"
    return _slug_map


def get_catalog() -> list[dict[str, Any]]:
    slug_map = _build_slug_map()
    result = []
    for slug, entry in slug_map.items():
        result.append({
            "slug": slug,
            "name": entry["name"],
            "description": entry["description"],
            "filename": entry["filename"],
        })
    return result


def get_doc_type(slug: str) -> dict[str, Any] | None:
    slug_map = _build_slug_map()
    return slug_map.get(slug)


def resolve_doc_type(slug: str) -> dict[str, Any]:
    doc = get_doc_type(slug)
    if doc:
        return doc
    closest = find_closest_match(slug)
    suggestion = f" Did you mean '{closest['name']}'?" if closest else ""
    raise HTTPException(
        status_code=404,
        detail=f"Document type '{slug}' not found.{suggestion}",
    )


def _preprocess_nda_coverpage(md: str) -> str:
    md = _normalize_quotes(md)
    md = md.replace(
        "[Evaluating whether to enter into a business relationship with the other party.]",
        '<span class="coverpage_link">Purpose</span>',
    )
    md = md.replace(
        "[Today's date]",
        '<span class="coverpage_link">Effective Date</span>',
    )
    md = _bracket_re.sub(
        lambda m: f'<span class="coverpage_link">{m.group(1)}</span>'
        if m.group(1) not in ("x", " ")
        else m.group(0),
        md,
    )
    return md


def load_template(slug: str) -> str | None:
    if slug in _template_cache:
        return _template_cache[slug]

    slug_map = _build_slug_map()
    entry = slug_map.get(slug)
    if not entry:
        return None

    template_path = TEMPLATES_DIR / entry["filename"]
    if not template_path.exists():
        return None

    md = template_path.read_text()
    md = _normalize_quotes(md)

    companion = entry.get("_companion")
    if companion:
        companion_path = TEMPLATES_DIR / companion
        if companion_path.exists():
            cover = companion_path.read_text()
            cover = _preprocess_nda_coverpage(cover)
            md = cover + "\n\n---\n\n" + md

    _template_cache[slug] = md
    return md


def extract_fields(slug: str) -> list[str]:
    if slug in _field_cache:
        return _field_cache[slug]

    md = load_template(slug)
    if not md:
        return []

    seen: set[str] = set()
    fields: list[str] = []
    for match in _span_re.finditer(md):
        name = match.group(2)
        possessive = name.endswith("'s")
        base = name.removesuffix("'s")
        if base not in seen:
            seen.add(base)
            fields.append(base)
        if possessive and name not in seen:
            seen.add(name)

    _field_cache[slug] = fields
    return fields


def _resolve_field(field_name: str, fields: dict[str, str]) -> str | None:
    value = fields.get(field_name)
    if value is None and field_name.endswith("'s"):
        value = fields.get(field_name.removesuffix("'s"))
    return value


def _flatten_fields(fields: dict[str, Any]) -> dict[str, str]:
    result: dict[str, str] = {}
    def _flatten(obj: dict[str, Any], prefix: str = "") -> None:
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                _flatten(v, key)
            elif v is not None and v != "":
                result[key] = str(v)
    _flatten(fields)
    return result


def render_template(slug: str, fields: dict[str, Any]) -> str | None:
    md = load_template(slug)
    if not md:
        return None

    flat = _flatten_fields(fields)

    def _replace_span(m: re.Match) -> str:
        value = _resolve_field(m.group(2), flat)
        if value is None:
            return f"**[{m.group(2)}]**"
        return f"**{value}**"

    md = _span_re.sub(_replace_span, md)

    def _replace_header(m: re.Match) -> str:
        level = "##" if "header_2" in m.group(0) else "###"
        return f"{level} {m.group(1)}"

    md = _header_span_re.sub(_replace_header, md)
    md = _id_re.sub("", md)
    return md


def render_template_html(slug: str, fields: dict[str, Any]) -> str | None:
    md = load_template(slug)
    if not md:
        return None

    flat = _flatten_fields(fields)

    def _replace_span_html(m: re.Match) -> str:
        value = _resolve_field(m.group(2), flat)
        if value is None:
            return f'<span style="color: #888; font-style: italic;">[{m.group(2)}]</span>'
        escaped = value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
        return f"<strong>{escaped}</strong>"

    md = _span_re.sub(_replace_span_html, md)

    def _replace_header_html(m: re.Match) -> str:
        level = "h2" if "header_2" in m.group(0) else "h3"
        return f"<{level}>{m.group(1)}</{level}>"

    md = _header_span_re.sub(_replace_header_html, md)
    md = _id_re.sub("", md)

    return f"""<div style="font-family: Georgia, 'Times New Roman', serif; color: #111; line-height: 1.6; font-size: 11pt; max-width: 170mm;">
{md}
</div>"""


def find_closest_match(query: str) -> dict[str, Any] | None:
    catalog = get_catalog()
    query_lower = query.lower()
    query_words = set(query_lower.split())

    best: dict[str, Any] | None = None
    best_score = 0.0

    for entry in catalog:
        name_lower = entry["name"].lower()
        desc_lower = entry["description"].lower()

        score = 0.0
        for qw in query_words:
            if qw in name_lower:
                score += 0.5
            elif qw in desc_lower:
                score += 0.2

        if query_words:
            score /= len(query_words)

        if score > best_score:
            best_score = score
            best = entry

    if best and best_score > 0.2:
        return best
    return None
