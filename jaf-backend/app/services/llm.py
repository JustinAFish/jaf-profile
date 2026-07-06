"""
/backend/app/services/llm.py
Service for managing interactions with OpenAI's language models. Provides a cached
singleton interface for making chat completions and accessing the underlying model.
This service component handles all direct LLM interactions, ensuring consistent 
configuration and error handling across the application.
"""

import logging
import os
from typing import AsyncIterator
from openai import AsyncOpenAI
from langchain_openai.chat_models import ChatOpenAI
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
    """Service for interacting with OpenAI. Instantiate once via get_llm_service() in core/rag.py."""

    def __init__(self):
        """Initialize OpenAI client with settings from config"""
        settings = get_settings()
        self.model_name = settings.OPENAI_MODEL_NAME

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
        
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY
        )

        # Initialize LangChain model for compatibility with existing code
        # LangSmith will automatically trace these calls if enabled
        self.model = ChatOpenAI(
            openai_api_key=settings.OPENAI_API_KEY,
            model=self.model_name,
            temperature=settings.OPENAI_TEMPERATURE
        )

    async def get_chat_response(self, prompt: str) -> str:
        """Get a chat completion for the given prompt"""
        try:
            completion = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return completion.choices[0].message.content or ""
        except Exception as e:
            raise Exception(f"Error getting chat response: {str(e)}")

    async def stream_chat_response(self, prompt: str) -> AsyncIterator[str]:
        """Yield content deltas from a streaming chat completion for the given prompt."""
        stream = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "user", "content": prompt}
            ],
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
