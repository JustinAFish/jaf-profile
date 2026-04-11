"""
/backend/app/core/rag.py
Implements the RAG (Retrieval Augmented Generation) pipeline that combines document 
search with AI generation. This core component finds relevant documentation based 
on user queries and uses it to generate accurate, sourced responses to dealership 
questions.
"""

from typing import Dict, List, Tuple, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.retrievers import BaseRetriever
from app.services.pinecone_service import PineconeService
from app.services.llm import LLMService
from app.core.models import Source, AssistantResponse, MessageHistory
import os
from functools import lru_cache
from pydantic import BaseModel
from app.config import get_settings

"""
Custom retriever that preserves relevance scores from Pinecone's vector search in document
metadata. By implementing my own _aget_relevant_documents, I ensure relevance scores from Pinecone's 
vector search are kept in the document metadata.
"""

class ScoredRetriever(BaseRetriever, BaseModel):
    pinecone_service: PineconeService
    
    @classmethod
    def from_service(cls, pinecone_service: PineconeService) -> "ScoredRetriever":
        return cls(pinecone_service=pinecone_service)
    
    async def _aget_relevant_documents(self, query:str):
        docs = self.pinecone_service.similarity_search(query)
        print(f"Retrieved docs with scores in custom retriever: {[doc.metadata.get('relevance', 0) for doc in docs]}")
        return docs
    
    def _get_relevant_documents(self, query: str):
        raise NotImplementedError("Use async version")
    
    class Config:
        arbitrary_types_allowed = True
        
@lru_cache(maxsize=1) # Cache this so we can only use one PineconeService
def get_pinecone_service():
    """Get or create cached Pinecone service instance."""
    print("Initializing Pinecone service...")
    return PineconeService()

@lru_cache(maxsize=1) # Cache this so we can only use one LLMService
def get_llm_service():
    """Get or create cached LLM service instance."""
    print("Initializing LLM service...")
    return LLMService()

class RAGPipeline:
    
    def __init__(self):
        """Initialise services and prompt template"""
        
        try:
            
            # Get or created cached service instances
            self.pinecone_service = get_pinecone_service()
            self.llm_service = get_llm_service()
            
            # Get config settings
            self.settings = get_settings()
            
            # Set up the prompt template 
            print("Setting up prompt template...")
            self.prompt = PromptTemplate.from_template(self.settings.SYSTEM_PROMPT)

            # Initialize the retriever with the cached Pinecone service
            print("Setting up retriever...")
            self.retriever = ScoredRetriever.from_service(self.pinecone_service)
            
            print("RAGPipeline initialization complete!") 
        
        except Exception as e:
            print(f"Error during initialization: {str(e)}")
            raise
        
    def format_source(self, doc) -> Source:
        """Format a document into a Source model (so a class 'Source' found in models.py)."""
        
        # Get the source file path from metadata
        path = doc.metadata.get('source_file', 'Unknown Document')
        
        # Create a readable title from the filename
        filename = os.path.basename(path)
        title = (
            filename
            .replace('.pdf', '')
            .replace('.docx', '')
        )
        
        return Source(
            title=title,
            content=doc.page_content,
            document_title=title,
            document_path=path,
            relevance=doc.metadata.get('relevance', 0)
        )

    def format_conversation_history(self, history: Optional[List[MessageHistory]]) -> str:
        """Format conversation history for the prompt."""
        
        if not history:
            return "This is the start of the conversation."
            
        formatted_history = ["Previous conversation:"]
        for msg in history:
            role = "User" if msg.role == "user" else "Assistant"
            formatted_history.append(f"{role}: {msg.content}")
        
        return "\n".join(formatted_history)
    
    async def get_response(
        self,
        question: str,
        conversation_history: Optional[List[MessageHistory]] = None,
        relevance_threshold: float = 0.5
    ) -> AssistantResponse:
        """
        Retrieves relevant documents and generates an AI response based on user question.
        
        Args:
            question: The user's question
            conversation_history: Previous messages for context
            relevance_threshold: Minimum similarity score (0-10) for documents to be considered relevant. Optional override (defaults to config.py value)
            
        Returns:
            AssistantResponse: Contains AI answer, source document, and escalation status
        """
        
        try:
            
            # Use the parameter relevance_threshold if provided, otherwise use config.py value
            threshold = relevance_threshold if relevance_threshold is not None else self.settings.RAG_RELEVANCE_THRESHOLD
            
            print(f"\nProcessing question: {question}")
            
            # Get documents from Pinecone
            print("\nRetrieving documents...")
            docs = await self.retriever.ainvoke(question)
            print(f"Retrieved {len(docs)} documents")
            
            #Print Documents in console
            print("\nDocument relevance score and content")
            for doc in docs:
                print(f"Score: {doc.metadata.get('relevance', 0)}")
                print(f"Content: {doc.page_content[:self.settings.RAG_PREVIEW_LENGTH]}...\n")
                
            # Filter documents based on relevance threshold
            relevant_docs = [
                doc for doc in docs
                if doc.metadata.get('relevance', 0) >= threshold
            ]
            
            print(f"Found {len(relevant_docs)} documents above relevance threshold {threshold}")
            
            # Throw error if no relevant documents were returned
            if not relevant_docs:
                print("No sufficiently relevant documents found!")
                return AssistantResponse(
                    answer="I apologize, but I couldn't find any sufficiently relevant information in our documentation. Let me connect you with our Hypercare team for assistance.",
                    sources=[],
                    needs_escalation=True,
                    escalation_reason=f"No documents found with relevance above {threshold}"
                )
                
            # Sort documents by relevance
            relevant_docs.sort(key=lambda x: x.metadata.get('relevance', 0), reverse=True)
            
            # Formate context and conversation history
            context = "\n\n".join(
                f"[Relevance: {doc.metadata.get('relevance', 0):.2f}]\n{doc.page_content}"
                for doc in relevant_docs
            )
            conversation_context = self.format_conversation_history(conversation_history)
            print(f"\nFormatted context length: {len(context)} characters")
            
            print("\nGetting LLM response...")
            prompt_content = self.prompt.format(
                context=context,
                question=question,
                conversation_context=conversation_context
            )
            
            messages = [{"role": "user", "content": prompt_content}]
            response = await self.llm_service.get_chat_response(messages[0]["content"])
            print(f"Got response: {response[:100]}...")
            
            #Format sources using the actual relevance score from metadata
            sources = [self.format_source(doc) for doc in relevant_docs]
            
            return AssistantResponse(
                answer=response,
                sources=sources,
                needs_escalation=False
            )
    
        except Exception as e:
            print(f"Error in RAG pipeline: {str(e)}")
            import traceback
            traceback.print_exc()
            return AssistantResponse(
                answer="I apologize, but I couldn't find any sufficiently relevant information in our documentation. Please contact Justin directly to support you with this question. He will be happy to help you.",
                sources=[],
                needs_escalation=True,
                escalation_reason=str(e)
            )
    
            
    
    
    