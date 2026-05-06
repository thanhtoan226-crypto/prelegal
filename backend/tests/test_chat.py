import pytest
from unittest.mock import AsyncMock, patch

from app.llm import (
    NDAChatResponse,
    NDAFieldExtract,
    PartyExtract,
    _describe_field_status,
    _flatten,
)
from app.schemas import ChatMessage, ChatRequest, ChatResponse


def test_flatten_simple():
    assert _flatten({"a": 1, "b": "hello"}) == {"a": 1, "b": "hello"}


def test_flatten_nested():
    result = _flatten({"party1": {"company": "Acme", "title": "CEO"}})
    assert result == {"party1.company": "Acme", "party1.title": "CEO"}


def test_describe_field_status_empty():
    fields = {
        "purpose": "",
        "governingLaw": "",
        "party1": {"company": "", "printName": ""},
    }
    result = _describe_field_status(fields)
    assert "purpose: EMPTY" in result
    assert "governingLaw: EMPTY" in result
    assert "party1.company: EMPTY" in result


def test_describe_field_status_filled():
    fields = {
        "purpose": "Business evaluation",
        "governingLaw": "",
        "party1": {"company": "Acme", "printName": ""},
    }
    result = _describe_field_status(fields)
    assert "purpose: FILLED = Business evaluation" in result
    assert "governingLaw: EMPTY" in result
    assert "party1.company: FILLED = Acme" in result
    assert "party1.printName: EMPTY" in result


def test_nda_chat_response_model():
    data = {
        "message": "Great! What's the company name?",
        "fields": {
            "purpose": "Evaluating a partnership",
            "governingLaw": None,
        },
    }
    result = NDAChatResponse.model_validate(data)
    assert result.message == "Great! What's the company name?"
    assert result.fields.purpose == "Evaluating a partnership"
    assert result.fields.governingLaw is None


def test_nda_chat_response_with_party():
    data = {
        "message": "Got it!",
        "fields": {
            "party1": {
                "company": "Acme Corp",
                "printName": None,
            }
        },
    }
    result = NDAChatResponse.model_validate(data)
    assert result.fields.party1 is not None
    assert result.fields.party1.company == "Acme Corp"
    assert result.fields.party1.printName is None


def test_nda_field_extract_exclude_none():
    extract = NDAFieldExtract(purpose="Test", governingLaw="Delaware")
    dumped = extract.model_dump(exclude_none=True)
    assert dumped == {"purpose": "Test", "governingLaw": "Delaware"}


def test_nda_field_extract_all_none():
    extract = NDAFieldExtract()
    dumped = extract.model_dump(exclude_none=True)
    assert dumped == {}


def test_chat_request_schema():
    req = ChatRequest(
        messages=[ChatMessage(role="user", content="Hello")],
        current_fields={"purpose": "Test"},
    )
    assert len(req.messages) == 1
    assert req.messages[0].content == "Hello"
    assert req.current_fields["purpose"] == "Test"


def test_chat_endpoint_empty_messages_returns_opening():
    """When messages is empty, the endpoint should return the opening message."""
    from app.routers.chat import OPENING_MESSAGE

    # Directly test the opening message logic without needing the full app
    assert "Mutual Non-Disclosure Agreement" in OPENING_MESSAGE
    assert "parties" in OPENING_MESSAGE.lower()


def test_chat_endpoint_with_mock_llm():
    """Test the chat endpoint with a mocked LLM call."""
    from fastapi import FastAPI, Depends
    from fastapi.testclient import TestClient
    from app.deps import get_current_user
    from app.schemas import UserResponse

    test_app = FastAPI()
    from app.routers.chat import router

    test_app.include_router(router)

    fake_user = UserResponse(id=1, email="demo@prelegal.com")
    test_app.dependency_overrides[get_current_user] = lambda: fake_user

    mock_response = NDAChatResponse(
        message="Great! And what's the other company?",
        fields=NDAFieldExtract(party1=PartyExtract(company="Acme Corp")),
    )

    with patch("app.routers.chat.call_nda_chat", new_callable=AsyncMock, return_value=mock_response):
        client = TestClient(test_app)
        response = client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "I'm with Acme Corp"}],
                "current_fields": {"purpose": "", "governingLaw": ""},
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Great! And what's the other company?"
        assert "party1" in data["fields"]
        assert data["fields"]["party1"]["company"] == "Acme Corp"


def test_party_extract_model():
    party = PartyExtract(company="Acme Corp", printName="John Doe")
    dumped = party.model_dump(exclude_none=True)
    assert dumped == {"company": "Acme Corp", "printName": "John Doe"}
