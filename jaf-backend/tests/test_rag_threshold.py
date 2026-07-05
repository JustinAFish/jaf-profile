"""
Unit test for RAGPipeline threshold plumbing: when no relevance_threshold is
passed, get_response must fall back to settings.RAG_RELEVANCE_THRESHOLD (not a
hardcoded default). conftest stubs app.services.pinecone_service before import.
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

from langchain_core.documents import Document

from app.core.rag import RAGPipeline


def _make_pipeline(settings_threshold: float, doc_scores: list[float]) -> RAGPipeline:
    """Build a RAGPipeline with mocked collaborators (skips __init__/real services)."""
    pipeline = RAGPipeline.__new__(RAGPipeline)

    settings = MagicMock()
    settings.RAG_RELEVANCE_THRESHOLD = settings_threshold
    settings.RAG_SOURCES_DISPLAY_MIN_RELEVANCE = 0.75
    settings.RAG_PREVIEW_LENGTH = 200
    pipeline.settings = settings

    docs = [
        Document(
            page_content=f"doc-{i}",
            metadata={"relevance": score, "source_file": f"doc-{i}.pdf"},
        )
        for i, score in enumerate(doc_scores)
    ]

    retriever = MagicMock()
    retriever.ainvoke = AsyncMock(return_value=docs)
    pipeline.retriever = retriever

    reranker = MagicMock()
    reranker.rerank = AsyncMock(return_value=docs)
    pipeline.reranker = reranker

    llm = MagicMock()
    llm.get_chat_response = AsyncMock(return_value="answer")
    pipeline.llm_service = llm

    prompt = MagicMock()
    prompt.format = MagicMock(return_value="prompt")
    pipeline.prompt = prompt

    return pipeline


def test_get_response_uses_settings_threshold_when_none():
    # Settings threshold above every doc score => nothing survives => escalation.
    # If the old hardcoded 0.5 default were used instead, these docs would pass.
    pipeline = _make_pipeline(settings_threshold=0.95, doc_scores=[0.9, 0.6])

    result = asyncio.run(pipeline.get_response("q"))

    assert result.needs_escalation is True
    assert result.sources == []


def test_get_response_respects_explicit_threshold_argument():
    pipeline = _make_pipeline(settings_threshold=0.95, doc_scores=[0.9, 0.6])

    result = asyncio.run(pipeline.get_response("q", relevance_threshold=0.5))

    assert result.needs_escalation is False
    # Only the 0.9 doc clears the 0.75 display minimum for citations.
    assert len(result.sources) == 1
