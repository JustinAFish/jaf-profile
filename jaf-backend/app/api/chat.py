"""
FastAPI router for chat: delegates to ChatService (RAG pipeline).
"""
import logging
from functools import lru_cache

from fastapi import APIRouter, Depends, HTTPException
from app.core.models import ChatMessage, ChatResponse
from app.services.chat import ChatService

logger = logging.getLogger(__name__)
router = APIRouter()


@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    return ChatService()


@router.post("/chat/message", response_model=ChatResponse)
async def process_message(
    message: ChatMessage,
    chat_service: ChatService = Depends(get_chat_service),
):
    """
    Process a chat message and return response with structured sources.
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
