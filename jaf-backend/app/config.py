"""
/backend/app/config.py
Configuration management for the Honda FutureSales Support Assistant.
Handles all environment variables and application settings using Pydantic.
Provides type-safe configuration with automatic environment variable loading
and validation. Uses LRU caching to prevent repeated environment variable reads.
"""

from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache
from typing import Optional
import os
from pathlib import Path

# Only load .env file if we're not in a Lambda environment
# Lambda gets environment variables from the SAM template
if not os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
    import dotenv
    dotenv.load_dotenv()

# Get the absolute path to the root directory (two levels up from this file)
ROOT_DIR = Path(__file__).parent.parent.parent

class Settings(BaseSettings):
    """
    Application settings/configurations using Pydantic BaseSettings.
    Environmental variables will be automatically loaded from .env file
    """

    # OpenAI Configuration - Made optional for initial startup
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL_NAME: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0.0    # default temperature for deterministic outputs
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Pinecone Configuration (for vector database)
    # Use Pydantic's automatic environment variable loading instead of direct os.environ calls
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: Optional[str] = None
    PINECONE_INDEX_NAME: Optional[str] = None
    PINECONE_NAMESPACE: Optional[str] = None
    
    # Legacy ChromaDB Configuration (kept for reference during migration)
    # CHROMA_USE_CLOUD: bool = os.environ.get("CHROMA_USE_CLOUD", "true").lower() == "true"
    # CHROMA_DB_PATH: str = "./chroma_db"  # Local path for ChromaDB persistence (fallback)
    # CHROMA_COLLECTION_NAME: str = "documents"  # Collection name for vector storage
    # CHROMA_API_KEY: Optional[str] = os.environ.get("CHROMA_API_KEY")
    # CHROMA_TENANT: str = os.environ.get("CHROMA_TENANT")
    # CHROMA_DATABASE: str = os.environ.get("CHROMA_DATABASE")
    
    
    # LangSmith Configuration
    LANGSMITH_TRACING: str = "false"
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGSMITH_API_KEY: Optional[str] = None
    LANGSMITH_PROJECT: str = "default"

    # APP Configuration
    APP_TITLE: str = "JAF"
    APP_DESCRIPTION: str = (
        "GenAI-powered assistant for consulatants to improve their quality of work and efficiencies."
    )
    APP_VERSION: str = "1.0.0"
    
    # Environment
    ENVIRONMENT: str = "development"

    # CORS: comma-separated origins; empty = allow all (credentials disabled)
    CORS_ORIGINS: Optional[str] = None
    
    # System Prompt Configuration
    SYSTEM_PROMPT: str = """
    You are an expert technical consultant at a leading technology consulting firm in a job interview.
    Your role is to provide precise, well-structured repsonses to the interviewer's questions emphasising your business acumen, technical skills and product expertise.

    {conversation_context}

    Context from relevant documents:
    {context}

    Current Question: {question}

    Instructions:

    Answer based only on the context provided above. If the context is not relevant to the question, say "Please contact Justin directly to support you with this question. He will be happy to help you."
    Ensure to respond in the best manner to get the job.
    Consider the conversation history when formulating your response.
    If the context contains relevant information, provide it clearly and concisely.
    If the context lacks the necessary details, state so explicitly.
    For procedural queries, provide step-by-step instructions when available.
    Do not assume or infer information beyond the provided context. If uncertain, indicate so.
    If a requester submits an inquiry in a language other than English, translate it first, retrieve the appropriate response, and then translate it back into the original language.
    Maintain consistency with prior responses to ensure uniformity across replies.
    Never say anything that will put you a risk of not being hired.

    Answer:"""

    SYSTEM_PROMPT_CLASSIFICATION: str = """
        
        Answer:"""

    # RAG Configuration
    RAG_RELEVANCE_THRESHOLD: float = (
        0.5  # Minimum similarity score to consider a document relevant
    )
    RAG_SOURCES_DISPLAY_MIN_RELEVANCE: float = (
        0.75  # Citations omit chunks unless relevance is strictly greater than this (0–1)
    )
    RAG_MAX_DOCUMENTS: int = 3  # Maximum number of documents to retrieve (k)

    # Debugging
    RAG_PREVIEW_LENGTH: int = 200  # Length of document preview in logs

    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra fields to handle legacy environment variables
    )

    def validate_for_production(self) -> list[str]:
        """
        Validate that all required environment variables are set for production use.
        Returns list of missing required variables.
        """
        missing_vars = []
        
        if self.ENVIRONMENT == "production":
            if not self.OPENAI_API_KEY:
                missing_vars.append("OPENAI_API_KEY")
            
            if not self.PINECONE_API_KEY:
                missing_vars.append("PINECONE_API_KEY")
        
        return missing_vars

@lru_cache()
def get_settings() -> Settings:
    """
    Create and cache settings instance.
    Returns:
        Settings: Application settings
    """
    return Settings()
