#!/usr/bin/env python3
"""
Helper script to update samconfig.toml with environment variables from .env file
This makes it easier to run SAM local with the correct environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import sys

def main():
    # Load environment variables from .env file
    env_file = Path(__file__).parent.parent / ".env"
    if not env_file.exists():
        print(f"❌ Error: .env file not found at {env_file}")
        print("Please create a .env file with your API keys first.")
        sys.exit(1)
    
    load_dotenv(env_file)
    
    # Get required environment variables
    required_vars = {
        "OPENAI_API_KEY": "OpenAIApiKey",
        "PINECONE_API_KEY": "PineconeApiKey", 
        "PINECONE_ENVIRONMENT": "PineconeEnvironment",
        "PINECONE_INDEX_NAME": "PineconeIndexName",
        "PINECONE_NAMESPACE": "PineconeNamespace"
    }
    
    optional_vars = {
        "JWT_SECRET_KEY": "JwtSecretKey",
        "LANGSMITH_API_KEY": "LangsmithApiKey"
    }
    
    # Check if all required variables are present
    missing_vars = []
    param_overrides = []
    
    for env_var, sam_param in required_vars.items():
        value = os.getenv(env_var)
        if not value:
            missing_vars.append(env_var)
        else:
            param_overrides.append(f'{sam_param}="{value}"')
    
    if missing_vars:
        print(f"❌ Error: Missing required environment variables in .env file:")
        for var in missing_vars:
            print(f"   - {var}")
        sys.exit(1)
    
    # Add optional variables
    for env_var, sam_param in optional_vars.items():
        value = os.getenv(env_var, "")
        param_overrides.append(f'{sam_param}="{value}"')
    
    # Create the parameter override string
    override_string = " ".join(param_overrides)
    
    print("✅ Environment variables loaded successfully!")
    print("\n📋 Parameter overrides for SAM local:")
    print(f'parameter_overrides = "{override_string}"')
    
    # Provide instructions
    print("\n📝 Instructions:")
    print("1. Copy the parameter_overrides line above")
    print("2. Update your samconfig.toml file:")
    print("   - Replace the parameter_overrides line in [default.local_start_api.parameters]")
    print("   - Replace the parameter_overrides line in [default.local_start_lambda.parameters]")
    print("3. Run: sam local start-api --host 0.0.0.0 --port 8000")
    
    print("\n🔒 Security Note:")
    print("Never commit API keys to version control. The .env file should be in .gitignore.")

if __name__ == "__main__":
    main() 