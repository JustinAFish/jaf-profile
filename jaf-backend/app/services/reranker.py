"""
/backend/app/services/reranker.py
Reranks candidate documents using Cohere Rerank v2 (rerank-v4.0-pro).

The reranker is a cross-encoder: it reads the query and each document
together in a single forward pass, producing a precise relevance score
that is far more accurate than cosine similarity from vector search.

If COHERE_API_KEY is not configured, the service falls back to returning
the documents unchanged (preserving the original cosine scores).
"""

import logging
from typing import List

from langchain_core.documents import Document

from app.config import get_settings

logger = logging.getLogger(__name__)


class CohereReranker:
    """Reranks documents using Cohere Rerank v2 API."""

    def __init__(self):
        self.settings = get_settings()
        self._client = None

        if self.settings.COHERE_API_KEY:
            try:
                import cohere
                self._client = cohere.AsyncClientV2(
                    api_key=self.settings.COHERE_API_KEY
                )
                logger.info(
                    "CohereReranker initialised (model=%s)",
                    self.settings.COHERE_RERANK_MODEL,
                )
            except ImportError:
                logger.warning(
                    "cohere package not installed; reranking disabled. "
                    "Install with: pip install cohere"
                )
        else:
            logger.warning(
                "COHERE_API_KEY not set; reranking disabled — "
                "falling back to raw cosine similarity scores"
            )

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def rerank(
        self, query: str, docs: List[Document]
    ) -> List[Document]:
        """
        Rerank documents against the query.

        Returns docs sorted by Cohere relevance_score (descending), with
        doc.metadata['relevance'] updated to the reranked score. If the
        reranker is unavailable the original list is returned unchanged.
        """
        if not self.is_available or not docs:
            return docs

        try:
            response = await self._client.rerank(
                model=self.settings.COHERE_RERANK_MODEL,
                query=query,
                documents=[doc.page_content for doc in docs],
                top_n=self.settings.RAG_RERANK_TOP_N,
            )

            reranked: List[Document] = []
            for result in response.results:
                doc = docs[result.index]
                doc.metadata["relevance"] = float(result.relevance_score)
                reranked.append(doc)

            logger.debug(
                "Reranked %d candidates → %d results. Scores: %s",
                len(docs),
                len(reranked),
                [round(r.relevance_score, 3) for r in response.results],
            )
            return reranked

        except Exception:
            logger.exception(
                "Cohere rerank call failed; falling back to original order"
            )
            return docs
