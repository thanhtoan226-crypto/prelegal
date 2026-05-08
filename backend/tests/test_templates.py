import pytest

from app.templates import (
    extract_fields,
    find_closest_match,
    get_catalog,
    get_doc_type,
    load_template,
    render_template,
    render_template_html,
)


def test_get_catalog():
    catalog = get_catalog()
    assert len(catalog) == 12
    slugs = [c["slug"] for c in catalog]
    assert "mutual-nda" in slugs
    assert "csa" in slugs
    assert "dpa" in slugs


def test_get_doc_type():
    doc = get_doc_type("mutual-nda")
    assert doc is not None
    assert doc["name"] == "Mutual Non-Disclosure Agreement"


def test_get_doc_type_not_found():
    assert get_doc_type("nonexistent") is None


def test_load_template():
    md = load_template("mutual-nda")
    assert md is not None
    assert "Mutual Non-Disclosure Agreement" in md
    assert "Standard Terms" in md


def test_load_template_not_found():
    assert load_template("nonexistent") is None


def test_load_template_csa():
    md = load_template("csa")
    assert md is not None
    assert "Cloud Service Agreement" in md


def test_extract_fields_mutual_nda():
    fields = extract_fields("mutual-nda")
    assert "Purpose" in fields
    assert "Effective Date" in fields
    assert "Governing Law" in fields


def test_extract_fields_csa():
    fields = extract_fields("csa")
    assert "Customer" in fields
    assert "Provider" in fields
    assert "Governing Law" in fields


def test_extract_fields_not_found():
    assert extract_fields("nonexistent") == []


def test_render_template():
    md = render_template("mutual-nda", {"Purpose": "Testing", "Governing Law": "Delaware"})
    assert md is not None
    assert "**Testing**" in md
    assert "**Delaware**" in md


def test_render_template_placeholder():
    md = render_template("mutual-nda", {})
    assert md is not None
    assert "**[Purpose]**" in md


def test_render_template_possessive():
    md = render_template("csa", {"Customer": "Acme Corp"})
    assert md is not None
    # Both "Customer" and "Customer's" should resolve
    assert "**Acme Corp**" in md


def test_render_template_html():
    html = render_template_html("mutual-nda", {"Purpose": "Testing"})
    assert html is not None
    assert "<strong>Testing</strong>" in html


def test_render_template_html_placeholder():
    html = render_template_html("mutual-nda", {})
    assert html is not None
    assert "[Purpose]" in html


def test_find_closest_match():
    match = find_closest_match("non-disclosure agreement")
    assert match is not None
    assert match["slug"] == "mutual-nda"


def test_find_closest_match_csa():
    match = find_closest_match("cloud service")
    assert match is not None
    assert match["slug"] == "csa"


def test_find_closest_match_no_match():
    match = find_closest_match("xyzzyqwerty")
    assert match is None
