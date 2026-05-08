import pytest
from unittest.mock import AsyncMock, patch

from app.llm import ChatResponse, _describe_field_status, _flatten, build_opening_message
from app.schemas import ChatMessage, ChatRequest


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


def test_chat_response_model():
    data = {
        "message": "Great! What's the company name?",
        "fields": {
            "purpose": "Evaluating a partnership",
            "governingLaw": None,
        },
    }
    result = ChatResponse.model_validate(data)
    assert result.message == "Great! What's the company name?"
    assert result.fields["purpose"] == "Evaluating a partnership"
    assert result.fields["governingLaw"] is None


def test_chat_response_empty_fields():
    data = {
        "message": "Hello!",
        "fields": {},
    }
    result = ChatResponse.model_validate(data)
    assert result.message == "Hello!"
    assert result.fields == {}


def test_build_opening_message():
    msg = build_opening_message("mutual-nda")
    assert "Mutual Non-Disclosure Agreement" in msg
    assert "parties" in msg.lower() or "party" in msg.lower()


def test_chat_request_schema():
    req = ChatRequest(
        messages=[ChatMessage(role="user", content="Hello")],
        current_fields={"purpose": "Test"},
        doc_type="mutual-nda",
    )
    assert len(req.messages) == 1
    assert req.messages[0].content == "Hello"
    assert req.current_fields["purpose"] == "Test"
    assert req.doc_type == "mutual-nda"


def test_chat_request_requires_doc_type():
    with pytest.raises(Exception):
        ChatRequest(
            messages=[ChatMessage(role="user", content="Hello")],
            current_fields={},
        )


def test_chat_endpoint_empty_messages_returns_opening():
    from fastapi import FastAPI, Depends
    from fastapi.testclient import TestClient
    from app.deps import get_current_user
    from app.schemas import UserResponse
    from app.routers.chat import router

    test_app = FastAPI()
    test_app.include_router(router)

    fake_user = UserResponse(id=1, email="demo@prelegal.com")
    test_app.dependency_overrides[get_current_user] = lambda: fake_user

    client = TestClient(test_app)
    response = client.post(
        "/api/chat",
        json={
            "messages": [],
            "current_fields": {},
            "doc_type": "mutual-nda",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "Mutual Non-Disclosure Agreement" in data["message"]


def test_chat_endpoint_with_mock_llm():
    from fastapi import FastAPI, Depends
    from fastapi.testclient import TestClient
    from app.deps import get_current_user
    from app.schemas import UserResponse
    from app.routers.chat import router

    test_app = FastAPI()
    test_app.include_router(router)

    fake_user = UserResponse(id=1, email="demo@prelegal.com")
    test_app.dependency_overrides[get_current_user] = lambda: fake_user

    mock_response = ChatResponse(
        message="Great! And what's the other company?",
        fields={"party1.company": "Acme Corp"},
    )

    with patch("app.routers.chat.call_doc_chat", new_callable=AsyncMock, return_value=mock_response):
        client = TestClient(test_app)
        response = client.post(
            "/api/chat",
            json={
                "messages": [{"role": "user", "content": "I'm with Acme Corp"}],
                "current_fields": {"purpose": "", "governingLaw": ""},
                "doc_type": "mutual-nda",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Great! And what's the other company?"
        assert data["fields"]["party1.company"] == "Acme Corp"


def test_chat_endpoint_invalid_doc_type():
    from fastapi import FastAPI, Depends
    from fastapi.testclient import TestClient
    from app.deps import get_current_user
    from app.schemas import UserResponse
    from app.routers.chat import router

    test_app = FastAPI()
    test_app.include_router(router)

    fake_user = UserResponse(id=1, email="demo@prelegal.com")
    test_app.dependency_overrides[get_current_user] = lambda: fake_user

    client = TestClient(test_app)
    response = client.post(
        "/api/chat",
        json={
            "messages": [],
            "current_fields": {},
            "doc_type": "nonexistent-doc",
        },
    )
    assert response.status_code == 404
