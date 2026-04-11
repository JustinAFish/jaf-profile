"""
/backend/app/services/llm.py
Service for managing interactions with OpenAI's language models. Provides a cached
singleton interface for making chat completions and accessing the underlying model.
This service component handles all direct LLM interactions, ensuring consistent 
configuration and error handling across the application.
"""

import logging
import os
from typing import Any, Dict
from openai import OpenAI
from langchain_openai.chat_models import ChatOpenAI
from langchain_core.messages import HumanMessage
from functools import lru_cache
from app.config import get_settings

logger = logging.getLogger(__name__)

# LangSmith tracing setup
try:
    from langsmith import Client as LangSmithClient
    from langchain_core.callbacks.manager import CallbackManager
    # Note: LangChainTracer might not be available in minimal langchain-core
    # from langchain_core.tracers.langchain import LangChainTracer
    LANGSMITH_AVAILABLE = True
except ImportError:
    LANGSMITH_AVAILABLE = False

class LLMService:
    """Service for interating with OpenAI"""
    
    @lru_cache(maxsize=1)
    def __init__(self):
        """Initialize OpenAI client with settings from config"""
        settings = get_settings()
        
        # Set up LangSmith environment variables if available
        if LANGSMITH_AVAILABLE and settings.LANGSMITH_TRACING.lower() == "true":
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGSMITH_ENDPOINT
            if settings.LANGSMITH_API_KEY:
                os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY
            os.environ["LANGCHAIN_PROJECT"] = settings.LANGSMITH_PROJECT
            logger.info(
                "LangSmith tracing enabled for project: %s",
                settings.LANGSMITH_PROJECT,
            )
        
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )
        
        # Initialize LangChain model for compatibility with existing code
        # LangSmith will automatically trace these calls if enabled
        self.model = ChatOpenAI(
            openai_api_key=settings.OPENAI_API_KEY,
            model="gpt-4o-mini",
            temperature=settings.OPENAI_TEMPERATURE
        )
    
    async def get_chat_response(self, prompt: str) -> str:
        """Get a chat completion for the given prompt"""
        try:
            # Use direct OpenAI client for better control
            completion = self.client.chat.completions.create(
                model="gpt-4o-mini",
                store=True,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error getting chat response: {str(e)}")
    
    def get_model(self) -> ChatOpenAI:
        """Return the underlying ChatOpenAI model for direct use."""
        return self.model
    
        