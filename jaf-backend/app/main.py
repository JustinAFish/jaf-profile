"""
/backend/app/main.py
Main FastAPI application entry point for the Honda FutureSales Support Assistant.
Sets up the API server with CORS middleware for frontend communication,
configures routing, and manages the core application settings.
Serves as the central point for API endpoint registration and server configuration.
"""

from pathlib import Path
import sys
import os

# Add backend directory to Python path first
BACKEND_DIR = Path(__file__).parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Load Modules
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv(BACKEND_DIR / '.env')

# Import app Modules
from app.api.chat import router as chat_router

from app.config import get_settings

try:
    settings = get_settings()
except Exception as e:
    print(f"Error loading settings: {e}")
    # Create minimal settings for health check
    class MinimalSettings:
        APP_TITLE = "JAF"
        APP_DESCRIPTION = "GenAI-powered assistant for consultants"
        APP_VERSION = "1.0.0"
    settings = MinimalSettings()

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize and populate Pinecone on startup if empty"""
    try:
        from app.services.pinecone_service import PineconeService
        import sys
        import os
        
        # Add scripts directory to path for imports
        scripts_path = os.path.join(os.path.dirname(__file__), '..', 'scripts')
        if scripts_path not in sys.path:
            sys.path.append(scripts_path)
        
        # Note: DocumentIngestor requires full langchain packages
        # from ingest_documents import DocumentIngestor
        
        # Check if Pinecone is empty
        pinecone_service = PineconeService()
        doc_count = pinecone_service.count_documents()
        
        print(f"Pinecone currently has {doc_count} documents")
        print("Note: Document ingestion disabled to reduce Lambda package size")
        
        # if doc_count == 0:
        #     print("Pinecone is empty, ingesting documents...")
            
        #     # Look for documents to ingest
        #     document_paths = [
        #         "data/Justin_Fish_CV_2025.pdf",  # if copied to backend
        #         "../frontend/public/data/Justin_Fish_CV_2025.pdf",  # original location
        #         "/app/data/Justin_Fish_CV_2025.pdf",  # absolute docker path
        #     ]
            
        #     ingestor = DocumentIngestor()
        #     documents_ingested = False
            
        #     for doc_path in document_paths:
        #         if os.path.exists(doc_path):
        #             print(f"Found document at {doc_path}, ingesting...")
        #             documents = ingestor.load_single_file(doc_path)
        #             if documents:
        #                 ingestor.ingest_documents(documents)
        #                 documents_ingested = True
        #                 print(f"Successfully ingested {len(documents)} document chunks")
        #                 break
            
        #     if not documents_ingested:
        #         print("Warning: No documents found to ingest. Available paths:")
        #         for path in document_paths:
        #             print(f"  - {path} (exists: {os.path.exists(path)})")
        # else:
        #     print("Pinecone already populated, skipping ingestion")
            
    except Exception as e:
        print(f"Error during startup document ingestion: {e}")
        # Don't fail startup if ingestion fails
        pass

# Health check endpoint for Render
@app.get("/")
async def health_check():
    """Health check endpoint for deployment platforms"""
    return {
        "status": "healthy", 
        "service": "JAF Backend",
        "version": settings.APP_VERSION if hasattr(settings, 'APP_VERSION') else "1.0.0"
    }

@app.get("/health")
async def detailed_health_check():
    """Detailed health check with environment validation"""
    try:
        # Use the settings validation method
        missing_vars = settings.validate_for_production() if hasattr(settings, 'validate_for_production') else []
        
        if missing_vars:
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "error": f"Missing required environment variables: {', '.join(missing_vars)}",
                    "environment": getattr(settings, 'ENVIRONMENT', 'unknown')
                }
            )
        
        return {
            "status": "healthy",
            "service": "JAF Backend",
            "version": settings.APP_VERSION if hasattr(settings, 'APP_VERSION') else "1.0.0",
            "environment": getattr(settings, 'ENVIRONMENT', 'unknown')
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

app.include_router(chat_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)