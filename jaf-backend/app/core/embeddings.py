"""
/backend/app/core/embeddings.py
Manages text embeddings using OpenAI's embedding API. Embeddings are vector 
representations of text that allow us to perform semantic similarity searches
in our RAG system, helping find relevant documentation for user queries.
"""

from typing import List
import os
from langchain_openai import OpenAIEmbeddings
from app.config import get_settings

class EmbeddingsManager:
    """Manages text embeddings using OpenAI's embedding API"""
    
    def __init__(self):
        """Initialize with OpenAI API key and model name"""
        
        settings = get_settings()

        self.embeddings_client = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model="text-embedding-ada-002"  # This is the standard embeddings model
        )
        
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        
        try:
            return self.embeddings_client.embed_documents(texts)
        except Exception as e:
            print(f"Error generating embeddings: {str(e)}")
            raise e
        
    async def generate_query_embedding(self, query: str) -> List[float]:
        """Generate an embedding for a query text"""
        
        try:
            return self.embeddings_client.embed_query(query)
        except Exception as e:
            raise Exception(f"Error generating query embedding: {str(e)}")
         
    def get_client(self) -> OpenAIEmbeddings:
        """Return the underlying OpenAI embeddings client"""
        
        return self.embeddings_client