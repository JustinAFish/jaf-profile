#!/usr/bin/env python3
"""
Start script for JAF backend application.
Provides proper error handling and environment validation for production deployments.
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add backend directory to Python path
BACKEND_DIR = Path(__file__).parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

def main():
    """Main entry point for the application"""
    try:
        # Import here to catch import errors
        from app.config import get_settings
        
        # Load settings
        settings = get_settings()
        
        # Validate critical environment variables in production
        if settings.ENVIRONMENT == "production":
            missing_vars = settings.validate_for_production()
            if missing_vars:
                print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
                print("Please set these variables in your deployment environment.")
                sys.exit(1)
        
        # Get port from environment or default to 8000
        port = int(os.getenv("PORT", 8000))
        
        print(f"Starting JAF backend on port {port}")
        print(f"Environment: {settings.ENVIRONMENT}")
        
        # Start the server
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            workers=1,  # Single worker for Render
            access_log=True,
            proxy_headers=True,
            timeout_keep_alive=5
        )
        
    except ImportError as e:
        print(f"Import error: {e}")
        print("Make sure all dependencies are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 