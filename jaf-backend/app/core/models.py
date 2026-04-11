"""
/backend/app/core/models.py
Defines the data models/schemas used throughout the application for type safety
and validation. These Pydantic models ensure consistent data structure for chat
messages, responses, and error handling.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# Chat
class MessageHistory(BaseModel):
    """Model for a message in the conversation history"""
    role: str
    content: str

class ChatMessage(BaseModel):
    """Input message model with conversation history"""
    content: str
    conversation_history: Optional[List[MessageHistory]] = Field(
        default=None,
        description="Previous messages in the conversation",
    )
    chat_id: Optional[str] = Field(
        default=None,
        description="Client-side chat id; accepted for forward compatibility, not persisted",
    )

class Source(BaseModel):
    """Enhanced model for a source reference with document metadata"""
    title: str = Field(description="Title or section name of the source document")
    content: str = Field(description="Relevant excerpt from the source")
    document_title: str = Field(description="Full document title for linking")
    document_path: str = Field(description="Path or identifier for the document")
    relevance: float = Field(description="Relevance score from 0-1", ge=0, le=1)

class AssistantResponse(BaseModel):
    """Structured output for the assistant's response"""
    answer: str = Field(description="The main response to the user's question")
    sources: List[Source] = Field(description="List of relevant sources used")
    needs_escalation: bool = Field(description="Whether this needs escalation to Hypercare")
    escalation_reason: Optional[str] = Field(description="Reason for escalation if needed", default=None)

class ChatResponse(BaseModel):
    """API response model that wraps AssistantResponse"""
    response: str
    sources: List[Source]
    escalate_to_hypercare: bool
    

