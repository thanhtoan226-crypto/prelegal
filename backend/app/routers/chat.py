import logging

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_current_user
from app.llm import call_nda_chat
from app.schemas import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

OPENING_MESSAGE = (
    "Hi! I'll help you create a Mutual Non-Disclosure Agreement. "
    "This is a standard agreement where two parties agree to keep each other's confidential information private.\n\n"
    "Let's start with the basics: Can you tell me about the two parties involved? "
    "For each party, I'll need the company name, a contact person's name and title, and an address for legal notices."
)


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    conversation = [m.model_dump() for m in req.messages]

    if not conversation:
        return ChatResponse(message=OPENING_MESSAGE, fields={})

    try:
        result = await call_nda_chat(conversation, req.current_fields)
    except Exception:
        logger.exception("AI service error")
        raise HTTPException(status_code=502, detail="AI service error. Please try again.")

    fields = result.fields.model_dump(exclude_none=True)
    return ChatResponse(message=result.message, fields=fields)
