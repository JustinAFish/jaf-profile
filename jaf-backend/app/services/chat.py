"""
/backend/app/services/chat.py
Service for processing chat messages through the RAG pipeline.
"""

from typing import List, Dict, Any, Optional
from app.core.models import ChatResponse, AssistantResponse
from app.core.rag import RAGPipeline
from functools import lru_cache

class ChatService:
    """Service for processing chat messages"""
    
    def __init__(self):
        """Initialize with RAG pipeline"""
        self.rag_pipeline = self._get_rag_pipeline()
    
    @lru_cache(maxsize=1)
    def _get_rag_pipeline(self) -> RAGPipeline:
        """Get or create cached RAGPipeline instance"""
        print("Creating new RAGPipeline instance for ChatService")
        return RAGPipeline()
    
    async def process_message(
        self, 
        content: str, 
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> ChatResponse:
        """
        Process a chat message and return a response
        
        Args:
            content: The content of the user's message
            conversation_history: Optional list of previous messages
            
        Returns:
            ChatResponse: Contains the assistant's response and sources
        """
        # Convert the conversation history to MessageHistory objects if provided
        formatted_history = None
        if conversation_history:
            from app.core.models import MessageHistory
            formatted_history = [
                MessageHistory(
                    role=str(msg.get('role')),
                    content=str(msg.get('content')),
                )
                for msg in conversation_history
            ]
        
        # Get response from RAG pipeline
        assistant_response: AssistantResponse = await self.rag_pipeline.get_response(
            question=content,
            conversation_history=formatted_history
        )
        
        # Convert sources to dictionaries with all required fields
        sources_dicts = [
            {
                "title": source.title,
                "content": source.content,
                "document_title": source.document_title,
                "document_path": source.document_path,
                "relevance": source.relevance
            }
            for source in assistant_response.sources
        ]
        
        # Convert to ChatResponse
        return ChatResponse(
            response=assistant_response.answer,
            sources=sources_dicts,
            escalate_to_hypercare=assistant_response.needs_escalation,
        )