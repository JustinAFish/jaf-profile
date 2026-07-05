# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FastAPI backend for a RAG-powered chat assistant (portfolio/interview assistant for Justin Fish). Retrieves relevant document chunks from Pinecone and answers questions with an OpenAI LLM, with a Cohere reranking step in between. Deployable to Railway (primary) or AWS Lambda (secondary, via SAM).

## Commands

```bash
# Install deps (use the venv already in the repo, or create one)
pip install -r requirements-dev.txt   # pulls in requirements.txt + test tools

# Run the API locally (reload enabled)
python start.py                        # or: uvicorn app.main:app --reload

# Tests
pytest                                  # runs tests/, RAG pipeline is mocked (no OpenAI/Pinecone needed)
pytest tests/test_api.py::test_chat_message_success   # single test
pytest -m integration                  # real OpenAI/Pinecone calls, needs secrets — excluded by default

# Document ingestion (populates Pinecone from scripts/ingest_data/)
python scripts/ingest_documents.py

# Lambda (secondary deployment path)
sam build && sam deploy
sam local start-api                    # local Lambda emulation via API Gateway
```

There is no configured linter/formatter in this repo — don't assume `ruff`/`black` are wired into CI.

## Architecture

Request flow: `app/api/chat.py` → `app/services/chat.py` (`ChatService`) → `app/core/rag.py` (`RAGPipeline`) → Pinecone retrieval → Cohere rerank → OpenAI completion.

- **`app/core/rag.py`** — the actual pipeline. `RAGPipeline.get_response()`: retrieves `RAG_CANDIDATES_K` candidates via `ScoredRetriever`, reranks with `CohereReranker` down to `RAG_RERANK_TOP_N`, filters by `RAG_RELEVANCE_THRESHOLD`, and if nothing survives, returns a canned escalation response (`needs_escalation=True`) instead of calling the LLM. Sources returned to the client are further filtered by `RAG_SOURCES_DISPLAY_MIN_RELEVANCE` (stricter than the inclusion threshold — a doc can be used as LLM context without being shown as a citation).
- **Service singletons** — `PineconeService`, `LLMService`, and `CohereReranker` are each built once via `@lru_cache(maxsize=1)` factory functions in `app/core/rag.py` (`get_pinecone_service`, `get_llm_service`, `get_reranker`), then wrapped by `RAGPipeline`. `RAGPipeline` itself is cached the same way via the module-level `get_rag_pipeline()` factory in `app/services/chat.py`, which `ChatService` calls in its constructor. Don't add per-request instantiation of these — the caching is intentional to avoid re-establishing API/DB clients on every request.
- **Cohere reranking is optional** — `CohereReranker` degrades gracefully to raw cosine similarity if `COHERE_API_KEY` is unset or the `cohere` package/API call fails; it never raises out of `rerank()`.
- **Config** (`app/config.py`) — a single Pydantic `Settings` object (env-loaded, cached via `get_settings()`) holds all tunables, including the full `SYSTEM_PROMPT` template. This prompt template is filled with `conversation_context`, `context` (retrieved docs), and `question` in `RAGPipeline.get_response()`. When adjusting retrieval/rerank behavior, the relevant knobs (`RAG_CANDIDATES_K`, `RAG_RERANK_TOP_N`, `RAG_RELEVANCE_THRESHOLD`, `RAG_SOURCES_DISPLAY_MIN_RELEVANCE`) all live here, not scattered in the pipeline code.
- **`app/main.py`** — app assembly only (CORS from `CORS_ORIGINS` env, `/` and `/health` health checks, lifespan hook that pings Pinecone doc count at startup). `/health` reflects `validate_for_production()` — it 503s if `OPENAI_API_KEY`/`PINECONE_API_KEY` are missing and `ENVIRONMENT=production`, while `/` always returns healthy (kept dumb so platform health checks pass even before secrets are configured, e.g. during a fresh Railway deploy).
- **Testing** (`tests/conftest.py`) — `app.services.pinecone_service` is replaced with a stub module in `sys.modules` *before* `app.main` is imported, so tests never touch Pinecone/OpenAI. `client`/`failing_rag_client` fixtures override the `get_chat_service` FastAPI dependency with a `FakeChatService`/`FakeRAGPipeline`. Follow this pattern (dependency override + module stub) rather than mocking deeper internals when adding new endpoint tests.
- **Dual deployment**: `start.py`/`Dockerfile`/`railway.json` are the Railway path (plain uvicorn). `lambda_handler.py`/`template.yaml`/`samconfig.toml`/`dependencies/` are the Lambda path (Mangum-wrapped ASGI app). Both boot the same `app.main:app` — avoid deployment-specific logic inside `app/`.

## Commenting style

Four places get comments; everything else stays silent.

**1. File-level docstring** — top of every file, before imports. First line is the file's path (matches this repo's existing convention, e.g. `/backend/app/services/pinecone_service.py`), then two or three sentences: what the module does, and any key behavioral notes a reader would otherwise have to reconstruct from the code.

```python
"""
/backend/app/services/reranker.py
Reranks candidate documents using Cohere Rerank v2 (rerank-v4.0-pro).

If COHERE_API_KEY is not configured, the service falls back to returning
the documents unchanged (preserving the original cosine scores).
"""
```

**2. Non-obvious fields/settings** — an inline `#` comment on individual Pydantic fields or dataclass attributes only when the name alone doesn't fully explain the behavior, unit, or constraint. Self-evident fields (`OPENAI_API_KEY`, `ENVIRONMENT`) get nothing.

```python
RAG_RELEVANCE_THRESHOLD: float = 0.5  # Minimum relevance score to include a document in LLM context
RAG_SOURCES_DISPLAY_MIN_RELEVANCE: float = 0.75  # Citations omit chunks unless relevance is strictly greater than this (0–1)
RAG_MAX_DOCUMENTS: int = 3  # Maximum number of documents to retrieve (k) — kept for legacy use
```

**3. Public class/function docstring** — one sentence on the exported symbol that names the key behavioral pattern, not a restatement of the file docstring. Use a short `Args:`/`Returns:` block only when a parameter or return value isn't obvious from its name and type hint.

```python
def similarity_search(self, query: str, k: int = None) -> List[Document]:
    """Perform similarity search for given query text."""

def add_documents(self, documents: List[Document]) -> List[str]:
    """
    Add documents to the Pinecone vector store.

    Args:
        documents: List of Document objects to add

    Returns:
        List of document IDs that were added
    """
```

**4. Internal helper docstring** — single-line `"""…"""` on internal/private functions whose name alone would mislead or leave intent ambiguous. Skip it when the name is fully self-describing.

```python
def format_conversation_history(self, history: Optional[List[MessageHistory]]) -> str:
    """Format prior turns into the block injected into SYSTEM_PROMPT's {conversation_context}."""
```

Inline `#` comments elsewhere are reserved for non-obvious logic that cannot be named away — a hidden constraint, a subtle invariant, a workaround for a specific bug (e.g. the `pinecone-plugin-inference` import guard in `pinecone_service.py`).
