from typing import Any, Literal

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str


class AuthResponse(BaseModel):
    user: UserResponse


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict[str, Any]


class ChatResponse(BaseModel):
    message: str
    fields: dict[str, Any]
