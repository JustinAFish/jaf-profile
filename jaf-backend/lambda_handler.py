"""
Lambda handler for JAF Backend FastAPI application.
Uses Mangum to adapt the FastAPI app for AWS Lambda.
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
LAMBDA_TASK_ROOT = os.environ.get('LAMBDA_TASK_ROOT', os.path.dirname(os.path.abspath(__file__)))
if LAMBDA_TASK_ROOT not in sys.path:
    sys.path.insert(0, LAMBDA_TASK_ROOT)

# Handle deprecated pinecone plugin error
try:
    # Import the FastAPI app
    from app.main import app
    from mangum import Mangum
except Exception as e:
    if "pinecone-plugin-inference" in str(e) and "deprecated" in str(e).lower():
        print(f"⚠️  WARNING: Deprecated Pinecone plugin detected. This is a known issue.")
        print(f"Error: {e}")
        
        # Try to work around by removing problematic modules from sys.modules
        modules_to_remove = [key for key in sys.modules.keys() if 'pinecone' in key.lower()]
        for module in modules_to_remove:
            if module in sys.modules:
                del sys.modules[module]
        
        # Try importing again
        try:
            from app.main import app
            from mangum import Mangum
        except Exception as retry_error:
            print(f"❌ Failed to import after retry: {retry_error}")
            raise
    else:
        raise

# Create the Lambda handler
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    Lambda function handler that processes API Gateway events.
    
    Args:
        event: The event dict that contains the request data
        context: The context dict that contains the runtime information
    
    Returns:
        Response dict with statusCode, body, and headers
    """
    return handler(event, context) 