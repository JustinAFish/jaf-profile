"""
/backend/tests/test_stream.py
Tests for the POST /api/chat/stream SSE endpoint: frame format, event ordering
(token* → final → done), and the mid-stream error path. Uses the FakeChatService
dependency override from conftest — no OpenAI/Pinecone calls.
"""

import json


def _parse_sse(body: str):
    """Split an SSE body into (event, data_json) tuples in arrival order."""
    events = []
    for frame in body.split("\n\n"):
        if not frame.strip():
            continue
        event, data = None, None
        for line in frame.split("\n"):
            if line.startswith("event: "):
                event = line[len("event: "):]
            elif line.startswith("data: "):
                data = json.loads(line[len("data: "):])
        events.append((event, data))
    return events


def test_stream_message_success(client):
    with client.stream(
        "POST",
        "/api/chat/stream",
        json={"content": "Hello world"},
    ) as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        body = "".join(response.iter_text())

    events = _parse_sse(body)

    tokens = [d for e, d in events if e == "token"]
    assert "".join(tokens) == "Echo: Hello world"

    finals = [d for e, d in events if e == "final"]
    assert len(finals) == 1
    assert finals[0]["escalate_to_hypercare"] is False
    assert finals[0]["sources"][0]["title"] == "Doc"

    # final must come after all tokens, done must terminate the stream
    assert [e for e, _ in events[-2:]] == ["final", "done"]


def test_stream_message_error_emits_error_and_done(failing_rag_client):
    with failing_rag_client.stream(
        "POST",
        "/api/chat/stream",
        json={"content": "boom"},
    ) as response:
        assert response.status_code == 200
        body = "".join(response.iter_text())

    events = _parse_sse(body)
    assert events[-1][0] == "done"
    assert any(e == "error" and "simulated RAG failure" in d["detail"] for e, d in events)
