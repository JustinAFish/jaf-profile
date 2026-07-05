"""
Main FastAPI application: CORS, lifespan, routing.
"""

from contextlib import asynccontextmanager
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.rate_limit import limiter

BACKEND_DIR = Path(__file__).parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

load_dotenv(BACKEND_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

from app.api.chat import router as chat_router
from app.config import get_settings

try:
    settings = get_settings()
except Exception as e:
    logger.error("Error loading settings: %s", e)

    class MinimalSettings:
        APP_TITLE = "JAF"
        APP_DESCRIPTION = "GenAI-powered assistant for consultants"
        APP_VERSION = "1.0.0"

    settings = MinimalSettings()


def _cors_allowlist(st) -> tuple[list[str], bool]:
    raw = getattr(st, "CORS_ORIGINS", None) or ""
    parts = [p.strip() for p in str(raw).split(",") if p.strip()]
    if parts:
        return parts, True
    # No explicit allowlist: fall back to the known frontend in production
    # (avoids a wide-open "*"); development stays permissive for local work.
    if getattr(st, "ENVIRONMENT", "development") == "production":
        fallback = getattr(st, "CORS_PRODUCTION_FALLBACK", "") or ""
        fallback_parts = [p.strip() for p in fallback.split(",") if p.strip()]
        if fallback_parts:
            return fallback_parts, True
    return ["*"], False


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.services.pinecone_service import PineconeService

        pinecone_service = PineconeService()
        doc_count = pinecone_service.count_documents()
        logger.info("Pinecone document count: %s", doc_count)
    except Exception as e:
        logger.warning("Startup Pinecone check skipped: %s", e)
    yield


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=getattr(settings, "APP_VERSION", "1.0.0"),
    lifespan=lifespan,
)

# Per-IP rate limiting (slowapi). Routes opt in via @limiter.limit(...).
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_allow_origins, _allow_credentials = _cors_allowlist(settings)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "JAF Backend",
        "version": settings.APP_VERSION if hasattr(settings, "APP_VERSION") else "1.0.0",
    }


@app.get("/health")
async def detailed_health_check():
    try:
        missing_vars = (
            settings.validate_for_production()
            if hasattr(settings, "validate_for_production")
            else []
        )

        if missing_vars:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "error": f"Missing required environment variables: {', '.join(missing_vars)}",
                    "environment": getattr(settings, "ENVIRONMENT", "unknown"),
                },
            )

        return {
            "status": "healthy",
            "service": "JAF Backend",
            "version": settings.APP_VERSION if hasattr(settings, "APP_VERSION") else "1.0.0",
            "environment": getattr(settings, "ENVIRONMENT", "unknown"),
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)},
        )


app.include_router(chat_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
