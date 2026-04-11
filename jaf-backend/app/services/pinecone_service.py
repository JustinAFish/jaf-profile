"""
/backend/app/services/pinecone_service.py
Service for managing Pinecone vector search operations. Provides a cached
singleton interface for vector similarity searches and document retrieval. This 
service component handles all database interactions, vector search operations, 
and integrates with the embeddings system to enable semantic document retrieval.
It includes debugging and testing capabilities to verify search functionality
and result scoring.
"""

from typing import List, Optional
import os
import sys
from functools import lru_cache

# Handle deprecated pinecone plugin import issues
try:
    from pinecone import Pinecone
except Exception as e:
    if "pinecone-plugin-inference" in str(e) and "deprecated" in str(e).lower():
        print(f"⚠️  WARNING: Deprecated Pinecone plugin detected, attempting workaround...")
        
        # Remove pinecone modules from cache and try again
        modules_to_remove = [key for key in sys.modules.keys() if 'pinecone' in key.lower()]
        for module in modules_to_remove:
            if module in sys.modules:
                print(f"Removing module: {module}")
                del sys.modules[module]
        
        # Import again
        from pinecone import Pinecone
    else:
        raise

from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document
from app.core.embeddings import EmbeddingsManager
from app.config import get_settings


class PineconeService:
    """Service for interacting with Pinecone vector search."""

    @lru_cache(maxsize=1)
    def __init__(self):
        """Initialize Pinecone connection and vector store."""
       
        # Get settings from the config class
        settings = get_settings()
        self.max_docs = settings.RAG_MAX_DOCUMENTS
       
        # Create the embeddings manager
        self.embeddings_manager = EmbeddingsManager()
        
        # Initialize Pinecone client
        print("Initializing Pinecone client...")
        if not settings.PINECONE_API_KEY:
            raise ValueError("PINECONE_API_KEY environment variable is required")
            
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        
        # Get or create the index
        index_name = settings.PINECONE_INDEX_NAME
        self.namespace = settings.PINECONE_NAMESPACE
        
        # Get the index
        self.index = self.pc.Index(index_name)
        
        # Create the Pinecone vector store using LangChain
        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings_manager.get_client(),
            namespace=self.namespace
        )
        
        print(f"Connected to Pinecone - Index: {index_name}, Namespace: {self.namespace}")

    def similarity_search(self, query: str, k: int = None) -> List[Document]:
        """Perform similarity search for given query text."""
        try:
            # Use provided k or fall back to configured max_docs (from config.py)
            k = k if k is not None else self.max_docs
            
            docs_and_scores = self.vector_store.similarity_search_with_score(query, k=k)
            
            # Create a dictionary for all source documents and put the relevance scores in manually
            processed_docs = []
            for doc, score in docs_and_scores:
                if doc.metadata is None:
                    doc.metadata = {}
                # Pinecone returns cosine similarity score (higher is better)
                # Clamp the score to be between 0 and 1
                similarity_score = max(0.0, min(1.0, float(score)))
                doc.metadata['relevance'] = similarity_score
                processed_docs.append(doc)
                print(f"Processing document with score {similarity_score}")
                
            return processed_docs
        except Exception as e:
            raise Exception(f"Error performing similarity search: {str(e)}")

    def get_retriever(self, k: int = None):
        """Get a retriever instance configured for similarity search."""
        
        # Use provided k or fall back to configured max_docs
        k = k if k is not None else self.max_docs
        
        return self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
    
    def add_documents(self, documents: List[Document]) -> List[str]:
        """
        Add documents to the Pinecone vector store.
        
        Args:
            documents: List of Document objects to add
            
        Returns:
            List of document IDs that were added
        """
        try:
            ids = self.vector_store.add_documents(documents)
            print(f"Added {len(documents)} documents to Pinecone")
            return ids
        except Exception as e:
            raise Exception(f"Error adding documents: {str(e)}")
    
    def delete_namespace(self):
        """Delete all vectors in the namespace (useful for testing or data refresh)."""
        try:
            self.index.delete(delete_all=True, namespace=self.namespace)
            print(f"Deleted all documents in Pinecone namespace: {self.namespace}")
        except Exception as e:
            print(f"Error deleting namespace: {str(e)}")
    
    def count_documents(self) -> int:
        """Get the number of documents in the namespace."""
        try:
            stats = self.index.describe_index_stats()
            namespace_stats = stats.get('namespaces', {}).get(self.namespace, {})
            return namespace_stats.get('vector_count', 0)
        except Exception as e:
            print(f"Error counting documents: {str(e)}")
            return 0 