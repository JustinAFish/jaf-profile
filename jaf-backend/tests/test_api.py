"""HTTP API tests with mocked RAG (see conftest.py)."""

import pytest


def test_root_health(client):
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"
    assert "JAF" in data.get("service", "")


def test_detailed_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "healthy"


def test_chat_message_success(client):
    r = client.post(
        "/api/chat/message",
        json={"content": "What is your experience with Python?"},
    )
    assert r.status_code == 200
    body = r.json()
    assert "response" in body
    assert "sources" in body
    assert "escalate_to_hypercare" in body
    assert isinstance(body["sources"], list)
    assert len(body["sources"]) >= 1
    assert body["sources"][0]["title"] == "Doc"
    assert body["escalate_to_hypercare"] is False


def test_chat_message_with_history(client):
    r = client.post(
        "/api/chat/message",
        json={
            "content": "Follow-up question",
            "conversation_history": [
                {"role": "user", "content": "Hi"},
                {"role": "assistant", "content": "Hello"},
            ],
        },
    )
    assert r.status_code == 200
    assert "Follow-up question" in r.json()["response"]


def test_chat_message_validation_error(client):
    r = client.post("/api/chat/message", json={})
    assert r.status_code == 422


def test_chat_message_rag_error(failing_rag_client):
    r = failing_rag_client.post(
        "/api/chat/message",
        json={"content": "Anything"},
    )
    assert r.status_code == 500
    assert "Error processing message" in r.json().get("detail", "")
