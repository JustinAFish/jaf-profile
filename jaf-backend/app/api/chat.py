"""
FastAPI router for chat: delegates to ChatService (RAG pipeline).
"""
import logging
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.models import ChatMessage, ChatResponse
from app.core.rate_limit import CHAT_RATE_LIMIT, limiter
from app.services.chat import ChatService

logger = logging.getLogger(__name__)
router = APIRouter()


@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    return ChatService()


@router.post("/chat/message", response_model=ChatResponse)
@limiter.limit(CHAT_RATE_LIMIT)
async def process_message(
    request: Request,
    message: ChatMessage,
    chat_service: ChatService = Depends(get_chat_service),
):
    """
    Process a chat message and return response with structured sources.

    Rate-limited per client IP (CHAT_RATE_LIMIT) since this endpoint is public
    and drives paid OpenAI/Pinecone/Cohere calls.
    """
    try:
        return await chat_service.process_message(
            message.content,
            message.conversation_history,
        )
    except Exception as e:
        logger.exception("Error in process_message")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}",
        ) from e
