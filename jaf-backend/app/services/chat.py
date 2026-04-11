"""
Service for processing chat messages through the RAG pipeline.
"""
import logging
from functools import lru_cache
from typing import List, Optional

from app.core.models import AssistantResponse, ChatResponse, MessageHistory
from app.core.rag import RAGPipeline

logger = logging.getLogger(__name__)


class ChatService:
    """Service for processing chat messages"""

    def __init__(self):
        self.rag_pipeline = self._get_rag_pipeline()

    @lru_cache(maxsize=1)
    def _get_rag_pipeline(self) -> RAGPipeline:
        logger.debug("Creating RAGPipeline for ChatService")
        return RAGPipeline()

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
