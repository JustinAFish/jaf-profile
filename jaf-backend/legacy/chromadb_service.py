"""
# Legacy: moved from app/services/chromadb_service.py (not imported by the app).
Service for managing ChromaDB vector search operations. Provides a cached
singleton interface for vector similarity searches and document retrieval. This 
service component handles all database interactions, vector search operations, 
and integrates with the embeddings system to enable semantic document retrieval.
It includes debugging and testing capabilities to verify search functionality
and result scoring.
"""

from typing import List
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from app.core.embeddings import EmbeddingsManager
from app.config import get_settings 
from functools import lru_cache
import os

class ChromaDBService:
    """Service for interacting with ChromaDB vector search."""

    @lru_cache(maxsize=1)
    def __init__(self):
        """Initialize ChromaDB connection and vector store."""
       
        # Get settings from the config class
        settings = get_settings()
        self.max_docs = settings.RAG_MAX_DOCUMENTS
       
        # Create the embeddings manager
        self.embeddings_manager = EmbeddingsManager()
        
       # Initialize ChromaDB client (cloud or local)
        if settings.CHROMA_USE_CLOUD:
            print("Initializing ChromaDB Cloud client...")
            self.chroma_client = chromadb.CloudClient(
                # api_key=settings.CHROMA_API_KEY,
                # tenant=settings.CHROMA_TENANT,
                # database=settings.CHROMA_DATABASE
                api_key='ck-GkyHPvqgrkwsq6K3ctt3Do1jDXuoVPB2kfvMgTeVhGHU',
                tenant='4f7ddef7-9d8c-44de-8455-ed2b8c6f9ea4',
                database='jaf-vector'
            )
            print(f"Connected to ChromaDB Cloud - Tenant: {settings.CHROMA_TENANT}, Database: {settings.CHROMA_DATABASE}")
        else:
            print("Initializing ChromaDB local client...")
            # Ensure the ChromaDB directory exists for local client
            chroma_db_path = settings.CHROMA_DB_PATH
            os.makedirs(chroma_db_path, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=chroma_db_path,
                settings=ChromaSettings(
                    allow_reset=True,
                    anonymized_telemetry=False
                )
            )
            print(f"Connected to ChromaDB Local - Path: {chroma_db_path}")
        
        # Create or get the collection
        collection_name = settings.CHROMA_COLLECTION_NAME
        
        try:
            # Try to get existing collection
            self.collection = self.chroma_client.get_collection(
                name=collection_name,
                embedding_function=None  # We'll handle embeddings through LangChain
            )
            print(f"Using existing ChromaDB collection: {collection_name}")
        except Exception:
            print(f"Error getting collection: {collection_name}")
            # Create new collection if it doesn't exist
            # self.collection = self.chroma_client.create_collection(
            #     name=collection_name,
            #     embedding_function=None  # We'll handle embeddings through LangChain
            # )
            # print(f"Created new ChromaDB collection: {collection_name}")
        
        # Create the Chroma vector store using LangChain
        self.vector_store = Chroma(
            client=self.chroma_client,
            collection_name=collection_name,
            embedding_function=self.embeddings_manager.get_client()
        )

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
                # ChromaDB returns distance, convert to similarity score (1 - distance)
                # Clamp the score to be between 0 and 1
                similarity_score = max(0.0, min(1.0, 1.0 - score))
                doc.metadata['relevance'] = float(similarity_score)
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
        Add documents to the ChromaDB vector store.
        
        Args:
            documents: List of Document objects to add
            
        Returns:
            List of document IDs that were added
        """
        try:
            ids = self.vector_store.add_documents(documents)
            print(f"Added {len(documents)} documents to ChromaDB")
            return ids
        except Exception as e:
            raise Exception(f"Error adding documents: {str(e)}")
    
    def delete_collection(self):
        """Delete the collection (useful for testing or data refresh)."""
        try:
            collection_name = get_settings().CHROMA_COLLECTION_NAME
            self.chroma_client.delete_collection(name=collection_name)
            print(f"Deleted ChromaDB collection: {collection_name}")
        except Exception as e:
            print(f"Error deleting collection: {str(e)}")
    
    def count_documents(self) -> int:
        """Get the number of documents in the collection."""
        try:
            return self.collection.count()
        except Exception as e:
            print(f"Error counting documents: {str(e)}")
            return 0 