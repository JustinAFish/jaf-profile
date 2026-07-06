"""
Service for processing chat messages through the RAG pipeline.
"""
import logging
from functools import lru_cache
from typing import Any, AsyncIterator, List, Optional, Tuple

from app.core.models import AssistantResponse, ChatResponse, MessageHistory
from app.core.rag import RAGPipeline

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_rag_pipeline() -> RAGPipeline:
    """Build the RAGPipeline once and reuse it (avoids re-establishing API/DB clients per request)."""
    logger.debug("Creating RAGPipeline for ChatService")
    return RAGPipeline()


class ChatService:
    """Service for processing chat messages"""

    def __init__(self):
        self.rag_pipeline = get_rag_pipeline()

    async def process_message(
        self,
        content: str,
        conversation_history: Optional[List[MessageHistory]] = None,
    ) -> ChatResponse:
        assistant_response: AssistantResponse = await self.rag_pipeline.get_response(
            question=content,
            conversation_history=conversation_history,
        )

        return ChatResponse(
            response=assistant_response.answer,
            sources=assistant_response.sources,
            escalate_to_hypercare=assistant_response.needs_escalation,
        )

    async def stream_message(
        self,
        content: str,
        conversation_history: Optional[List[MessageHistory]] = None,
    ) -> AsyncIterator[Tuple[str, Any]]:
        """
        Streaming variant of process_message: yields ("token", str) events for answer
        deltas, then one ("final", dict) event carrying sources and escalation state.
        """
        async for item in self.rag_pipeline.stream_response(
            question=content,
            conversation_history=conversation_history,
        ):
            if isinstance(item, AssistantResponse):
                yield (
                    "final",
                    {
                        "sources": [s.model_dump() for s in item.sources],
                        "escalate_to_hypercare": item.needs_escalation,
                    },
                )
            else:
                yield ("token", item)
