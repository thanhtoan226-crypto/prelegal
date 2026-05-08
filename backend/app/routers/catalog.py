from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.templates import (
    extract_fields,
    get_catalog,
    render_template,
    render_template_html,
    resolve_doc_type,
)

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


class RenderRequest(BaseModel):
    fields: dict[str, Any] = {}


@router.get("")
async def list_catalog():
    return get_catalog()


@router.get("/{slug}")
async def get_document_type(slug: str):
    doc = resolve_doc_type(slug)
    fields = extract_fields(slug)
    return {
        "slug": doc["_slug"],
        "name": doc["name"],
        "description": doc["description"],
        "filename": doc["filename"],
        "fields": fields,
    }


@router.post("/{slug}/render")
async def render_document(slug: str, req: RenderRequest):
    resolve_doc_type(slug)

    markdown = render_template(slug, req.fields)
    html = render_template_html(slug, req.fields)

    if markdown is None or html is None:
        raise HTTPException(status_code=500, detail="Failed to render template.")

    return {"markdown": markdown, "html": html}
