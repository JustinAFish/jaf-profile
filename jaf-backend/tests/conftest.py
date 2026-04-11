"""
Shared fixtures: FastAPI TestClient with RAG pipeline mocked (no Pinecone/OpenAI).
"""

import sys
import types

import pytest
from fastapi.testclient import TestClient

_stub_ps = types.ModuleType("app.services.pinecone_service")


class PineconeService:  # noqa: D101
    def __init__(self, *args, **kwargs):
        pass

    def similarity_search(self, query: str, k: int | None = None):
        return []

    def count_documents(self) -> int:
        return 0


_stub_ps.PineconeService = PineconeService
sys.modules["app.services.pinecone_service"] = _stub_ps

from app.main import app  # noqa: E402
from app.api import chat as chat_api  # noqa: E402
from app.core.models import AssistantResponse, ChatResponse, Source  # noqa: E402


class FakeRAGPipeline:
    """Minimal stand-in for RAGPipeline used only in tests."""

    def __init__(self, *, fail: bool = False):
        self.fail = fail

    async def get_response(
        self,
        question: str,
        conversation_history=None,
        relevance_threshold: float = 0.5,
    ):
        if self.fail:
            raise RuntimeError("simulated RAG failure")
        return AssistantResponse(
            answer=f"Echo: {question}",
            sources=[
                Source(
                    title="Doc",
                    content="excerpt",
                    document_title="Doc",
                    document_path="/x.pdf",
                    relevance=0.9,
                )
            ],
            needs_escalation=False,
        )


class FakeChatService:
    """Mirrors ChatService.process_message for dependency override."""

    def __init__(self, rag: FakeRAGPipeline):
        self._rag = rag

    async def process_message(self, content: str, conversation_history=None):
        ar = await self._rag.get_response(content, conversation_history)
        return ChatResponse(
            response=ar.answer,
            sources=ar.sources,
            escalate_to_hypercare=ar.needs_escalation,
        )


@pytest.fixture
def fake_rag() -> FakeRAGPipeline:
    return FakeRAGPipeline()


@pytest.fixture
def client(fake_rag: FakeRAGPipeline):
    app.dependency_overrides[chat_api.get_chat_service] = lambda: FakeChatService(
        fake_rag
    )
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def failing_rag_client():
    bad = FakeRAGPipeline(fail=True)
    app.dependency_overrides[chat_api.get_chat_service] = lambda: FakeChatService(bad)
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
