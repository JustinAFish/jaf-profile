"""
RAG pipeline: Pinecone retrieval + LLM generation.
"""

import asyncio
import logging
import os
from functools import lru_cache
from typing import List, Optional

from langchain_core.prompts import PromptTemplate
from langchain_core.retrievers import BaseRetriever
from pydantic import BaseModel, ConfigDict

from app.config import get_settings
from app.core.models import AssistantResponse, MessageHistory, Source
from app.services.llm import LLMService
from app.services.pinecone_service import PineconeService
from app.services.reranker import CohereReranker

logger = logging.getLogger(__name__)


class ScoredRetriever(BaseRetriever, BaseModel):
    pinecone_service: PineconeService

    model_config = ConfigDict(arbitrary_types_allowed=True)

    @classmethod
    def from_service(cls, pinecone_service: PineconeService) -> "ScoredRetriever":
        return cls(pinecone_service=pinecone_service)

    async def _aget_relevant_documents(self, query: str):
        # similarity_search does blocking network/embedding I/O; keep it off the event loop.
        docs = await asyncio.to_thread(self.pinecone_service.similarity_search, query)
        logger.debug(
            "Retriever scores: %s",
            [doc.metadata.get("relevance", 0) for doc in docs],
        )
        return docs

    def _get_relevant_documents(self, query: str):
        raise NotImplementedError("Use async version")


@lru_cache(maxsize=1)
def get_pinecone_service():
    logger.info("Initializing Pinecone service")
    return PineconeService()


@lru_cache(maxsize=1)
def get_llm_service():
    logger.info("Initializing LLM service")
    return LLMService()


@lru_cache(maxsize=1)
def get_reranker():
    logger.info("Initializing Cohere reranker")
    return CohereReranker()


class RAGPipeline:
    def __init__(self):
        try:
            self.pinecone_service = get_pinecone_service()
            self.llm_service = get_llm_service()
            self.reranker = get_reranker()
            self.settings = get_settings()
            self.prompt = PromptTemplate.from_template(self.settings.SYSTEM_PROMPT)
            self.retriever = ScoredRetriever.from_service(self.pinecone_service)
            logger.info("RAGPipeline initialization complete")
        except Exception as e:
            logger.exception("RAGPipeline initialization failed")
            raise

    def format_source(self, doc) -> Source:
        path = doc.metadata.get("source_file", "Unknown Document")
        filename = os.path.basename(path)
        title = filename.replace(".pdf", "").replace(".docx", "")

        return Source(
            title=title,
            content=doc.page_content,
            document_title=title,
            document_path=path,
            relevance=doc.metadata.get("relevance", 0),
        )

    def format_conversation_history(
        self, history: Optional[List[MessageHistory]]
    ) -> str:
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
        relevance_threshold: Optional[float] = None,
    ) -> AssistantResponse:
        try:
            threshold = (
                relevance_threshold
                if relevance_threshold is not None
                else self.settings.RAG_RELEVANCE_THRESHOLD
            )

            logger.info("Processing question (len=%s)", len(question))
            docs = await self.retriever.ainvoke(question)
            logger.info("Retrieved %s candidate documents from Pinecone", len(docs))

            docs = await self.reranker.rerank(question, docs)
            logger.info(
                "After reranking: %d documents. Scores: %s",
                len(docs),
                [round(doc.metadata.get("relevance", 0), 3) for doc in docs],
            )

            for doc in docs:
                logger.debug(
                    "Doc relevance=%s preview=%s",
                    doc.metadata.get("relevance", 0),
                    doc.page_content[: self.settings.RAG_PREVIEW_LENGTH],
                )

            relevant_docs = [
                doc
                for doc in docs
                if doc.metadata.get("relevance", 0) >= threshold
            ]

            logger.info(
                "Documents above threshold %s: %s",
                threshold,
                len(relevant_docs),
            )

            if not relevant_docs:
                return AssistantResponse(
                    answer=(
                        "I apologize, but I couldn't find any sufficiently relevant "
                        "information to answer that. Please contact Justin directly and "
                        "he'll be happy to help you with this question."
                    ),
                    sources=[],
                    needs_escalation=True,
                    escalation_reason=f"No documents found with relevance above {threshold}",
                )

            relevant_docs.sort(
                key=lambda x: x.metadata.get("relevance", 0), reverse=True
            )

            context = "\n\n".join(
                f"[Relevance: {doc.metadata.get('relevance', 0):.2f}]\n{doc.page_content}"
                for doc in relevant_docs
            )
            conversation_context = self.format_conversation_history(
                conversation_history
            )
            logger.debug("Context length: %s characters", len(context))

            prompt_content = self.prompt.format(
                context=context,
                question=question,
                conversation_context=conversation_context,
            )

            response = await self.llm_service.get_chat_response(prompt_content)
            logger.info("LLM response length: %s", len(response))

            display_min = self.settings.RAG_SOURCES_DISPLAY_MIN_RELEVANCE
            sources = [
                self.format_source(doc)
                for doc in relevant_docs
                if doc.metadata.get("relevance", 0) > display_min
            ]

            return AssistantResponse(
                answer=response,
                sources=sources,
                needs_escalation=False,
            )

        except Exception as e:
            logger.exception("Error in RAG pipeline")
            return AssistantResponse(
                answer=(
                    "I apologize, but I couldn't find any sufficiently relevant "
                    "information in our documentation. Please contact Justin directly "
                    "to support you with this question. He will be happy to help you."
                ),
                sources=[],
                needs_escalation=True,
                escalation_reason=str(e),
            )
