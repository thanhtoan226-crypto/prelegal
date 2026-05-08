from typing import Any

from litellm import acompletion
from pydantic import BaseModel, Field

from app.config import settings
from app.templates import extract_fields, get_doc_type

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT_TEMPLATE = """You are a friendly legal document assistant helping a user create a {doc_name}.

{doc_description}

Your job is to have a natural conversation to gather the information needed to fill out the document. You should:
1. Ask one or two questions at a time - don't overwhelm the user
2. Extract field values from what the user says and include them in the fields object
3. Be conversational and helpful - explain what each field means if the user asks
4. If the user provides information for multiple fields at once, extract all of them
5. When you have enough information for the document, let the user know they can review and download it
6. Never ask about fields the user has already provided - check the current field values below
7. Always confirm what you've extracted in your message text
8. ALWAYS ask a follow-on question about a missing or unclear field, unless ALL fields are filled. Never leave the user without a clear next step.

Key fields to collect:
{field_list}

For field values, use simple string values. Use the exact field names listed above as keys in the fields object. For example, if the field list includes 'Customer', use 'Customer' as the key.

Only fill in fields in the fields object if the user has clearly provided or implied that information. Do not guess or make up values. Leave fields you don't have information for as null.

If the user asks about a type of document you cannot create, explain that you can only help with the document types listed above, and suggest the closest match from what's available."""

OPENING_TEMPLATE = """Hi! I'll help you create a {doc_name}. {doc_description}

Let's get started - could you tell me about the parties involved?"""


class ChatResponse(BaseModel):
    message: str = Field(description="Your conversational reply to the user")
    fields: dict[str, Any] = Field(
        default_factory=dict,
        description="Any field values you can extract from the conversation so far. Only include fields with known values.",
    )


def _describe_field_status(fields: dict[str, Any]) -> str:
    lines = []
    flat = _flatten(fields)
    for key, value in flat.items():
        if value and value != "":
            lines.append(f"  {key}: FILLED = {value}")
        else:
            lines.append(f"  {key}: EMPTY")
    return "\n".join(lines)


def _flatten(d: dict, parent_key: str = "", sep: str = ".") -> dict:
    items = {}
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.update(_flatten(v, new_key, sep))
        else:
            items[new_key] = v
    return items


def _build_field_list(slug: str) -> str:
    field_names = extract_fields(slug)
    lines = []
    for name in field_names:
        lines.append(f"- {name}")
    return "\n".join(lines)


def build_system_prompt(slug: str, current_fields: dict[str, Any]) -> str:
    doc = get_doc_type(slug)
    if not doc:
        raise ValueError(f"Unknown document type: {slug}")

    field_list = _build_field_list(slug)
    system_content = SYSTEM_PROMPT_TEMPLATE.format(
        doc_name=doc["name"],
        doc_description=doc["description"],
        field_list=field_list,
    )

    field_status = _describe_field_status(current_fields)
    if field_status.strip():
        system_content += f"\n\nCurrent field values:\n{field_status}"

    return system_content


def build_opening_message(slug: str) -> str:
    doc = get_doc_type(slug)
    if not doc:
        return "Hello! How can I help you today?"

    return OPENING_TEMPLATE.format(
        doc_name=doc["name"],
        doc_description=doc["description"],
    )


async def call_doc_chat(
    slug: str,
    messages: list[dict[str, str]],
    current_fields: dict[str, Any],
) -> ChatResponse:
    system_content = build_system_prompt(slug, current_fields)
    all_messages = [{"role": "system", "content": system_content}] + messages

    response = await acompletion(
        model=MODEL,
        messages=all_messages,
        response_format=ChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=settings.OPENROUTER_API_KEY,
    )

    content = response.choices[0].message.content
    return ChatResponse.model_validate_json(content)
