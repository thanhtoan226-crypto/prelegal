from typing import Any, Literal, Optional

from litellm import acompletion
from pydantic import BaseModel, Field

from app.config import settings

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly legal document assistant helping a user create a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a natural conversation to gather the information needed to fill out the MNDA. You should:
1. Ask one or two questions at a time - don't overwhelm the user
2. Extract field values from what the user says and include them in the fields object
3. Be conversational and helpful - explain what each field means if the user asks
4. If the user provides information for multiple fields at once, extract all of them
5. When you have enough information for the document, let the user know they can review and download it
6. Never ask about fields the user has already provided - check the current field values below
7. Always confirm what you've extracted in your message text

Key fields to collect:
- purpose: How will confidential information be used? (default: evaluating a business relationship)
- effectiveDate: When does the agreement start? (YYYY-MM-DD format)
- mndaTermType: Does it expire after a number of years ("expires"), or continue until terminated ("continues")?
- mndaTermYears: Number of years for MNDA term (if expires)
- confidentialityTermType: Does confidentiality expire after years ("expires"), or last in perpetuity ("perpetuity")?
- confidentialityTermYears: Number of years for confidentiality term (if expires)
- governingLaw: Which US state's laws govern the agreement?
- jurisdiction: Which courts have jurisdiction? (e.g. "courts located in New Castle, DE")
- modifications: Any changes to the standard terms? (optional)
- party1 and party2: For each party - printName, title, company, noticeAddress, date

For the term types: use exactly "expires" or "continues" for mndaTermType, and "expires" or "perpetuity" for confidentialityTermType.

Only fill in fields in the fields object if the user has clearly provided or implied that information. Do not guess or make up values. Leave fields you don't have information for as null."""


class PartyExtract(BaseModel):
    printName: Optional[str] = Field(default=None, description="Full printed name")
    title: Optional[str] = Field(default=None, description="Job title")
    company: Optional[str] = Field(default=None, description="Company or organization name")
    noticeAddress: Optional[str] = Field(default=None, description="Email or postal address for notices")
    date: Optional[str] = Field(default=None, description="Signing date in YYYY-MM-DD format")


class NDAFieldExtract(BaseModel):
    purpose: Optional[str] = Field(default=None, description="How confidential information may be used")
    effectiveDate: Optional[str] = Field(default=None, description="Effective date in YYYY-MM-DD format")
    mndaTermType: Optional[Literal["expires", "continues"]] = Field(default=None, description="Either 'expires' or 'continues'")
    mndaTermYears: Optional[str] = Field(default=None, description="Number of years for MNDA term")
    confidentialityTermType: Optional[Literal["expires", "perpetuity"]] = Field(default=None, description="Either 'expires' or 'perpetuity'")
    confidentialityTermYears: Optional[str] = Field(default=None, description="Number of years for confidentiality term")
    governingLaw: Optional[str] = Field(default=None, description="US state for governing law, e.g. 'Delaware'")
    jurisdiction: Optional[str] = Field(default=None, description="City/county and state for jurisdiction")
    modifications: Optional[str] = Field(default=None, description="Any modifications to standard MNDA terms")
    party1: Optional[PartyExtract] = Field(default=None, description="First party information")
    party2: Optional[PartyExtract] = Field(default=None, description="Second party information")


class NDAChatResponse(BaseModel):
    message: str = Field(description="Your conversational reply to the user")
    fields: NDAFieldExtract = Field(description="Any NDA fields you can extract from the conversation so far")


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


async def call_nda_chat(
    messages: list[dict[str, str]],
    current_fields: dict[str, Any],
) -> NDAChatResponse:
    field_status = _describe_field_status(current_fields)
    system_content = SYSTEM_PROMPT + f"\n\nCurrent field values:\n{field_status}"

    all_messages = [{"role": "system", "content": system_content}] + messages

    response = await acompletion(
        model=MODEL,
        messages=all_messages,
        response_format=NDAChatResponse,
        reasoning_effort="low",
        extra_body=EXTRA_BODY,
        api_key=settings.OPENROUTER_API_KEY,
    )

    content = response.choices[0].message.content
    return NDAChatResponse.model_validate_json(content)
