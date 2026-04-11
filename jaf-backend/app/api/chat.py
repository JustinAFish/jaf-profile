"""
/backend/app/api/chat.py
FastAPI router handling the chat functionality for jaf,
directs incoming web requests to the right handler functions.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from app.core.models import ChatMessage, ChatResponse, Source, AssistantResponse, MessageHistory
from app.core.rag import RAGPipeline
from pydantic import BaseModel, Field
from typing import List, Optional
from functools import lru_cache
from app.services.chat import ChatService

router = APIRouter()

@lru_cache(maxsize=1)
def get_rag_pipeline() -> RAGPipeline:
    """Get or create cached RAGPipeline instance"""
    print("Creating new RAGPipeline instance")
    return RAGPipeline()

@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    """Get or create cached ChatService instance"""
    print("Creating new ChatService instance")
    return ChatService()

class ChatMessageWithHistory(ChatMessage):
    """Extend ChatMessage model that includes conversation history"""
    conversation_history: Optional[List[dict]] = None
    
@router.post("/chat/message", response_model=ChatResponse)
async def process_message(
    message: ChatMessageWithHistory,
    rag: RAGPipeline = Depends(get_rag_pipeline)
    ):
    """
    Process a chat message and return response with structured sources.
    
    Args:
        message: The chat message with optional conversation history
        rag: RAGPipeline instance (injected by FastAPI)
        
    Returns:
        ChatResponse: Contains the assistant's response, sources, and escalation status
    """
    try:
        # Convert the conversation history to MessageHistory objects
        # Done for type safety and validation purposes
        conversation_history = None
        if message.conversation_history:
            conversation_history = [
                MessageHistory(
                    role=str(msg.get('role')),
                    content=str(msg.get('content')),
                )
                for msg in message.conversation_history
            ]
        
        # Get response from RAG pipeline with conversation history
        assistant_response: AssistantResponse = await rag.get_response(
            question=message.content,
            conversation_history=conversation_history
        )

        # Convert AssistantResponse to ChatResponse for API consistency
        return ChatResponse(
            response=assistant_response.answer,
            sources=assistant_response.sources,
            escalate_to_hypercare=assistant_response.needs_escalation,
        )
        
    except Exception as e:
        print(f"Error in process_message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )