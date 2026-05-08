import logging

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user
from app.llm import build_opening_message, call_doc_chat
from app.schemas import ChatRequest, ChatResponse
from app.templates import resolve_doc_type

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    resolve_doc_type(req.doc_type)

    conversation = [m.model_dump() for m in req.messages]

    if not conversation:
        opening = build_opening_message(req.doc_type)
        return ChatResponse(message=opening, fields={})

    try:
        result = await call_doc_chat(req.doc_type, conversation, req.current_fields)
    except Exception:
        logger.exception("AI service error")
        raise HTTPException(status_code=502, detail="AI service error. Please try again.")

    fields = {k: v for k, v in result.fields.items() if v is not None}
    return ChatResponse(message=result.message, fields=fields)
