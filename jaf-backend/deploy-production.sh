#!/bin/bash

# JAF Backend - Secure Production Deployment Script
# This script handles secure deployment to AWS Lambda with proper secret management

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI is configured"
}

# Check if SAM CLI is installed
check_sam_cli() {
    if ! command -v sam &> /dev/null; then
        print_error "SAM CLI is not installed. Please install it first."
        exit 1
    fi
    
    print_success "SAM CLI is available"
}

# Security check for secrets
security_check() {
    print_status "Performing security checks..."
    
    # Check if .env file exists (should not be deployed)
    if [ -f ".env" ]; then
        print_warning ".env file detected - this will NOT be deployed (good!)"
    fi
    
    # Check for hardcoded secrets in samconfig.toml
    if grep -q "sk-proj\|pcsk_\|lsv2_pt" samconfig.toml; then
        print_error "Hardcoded API keys detected in samconfig.toml!"
        print_error "This is a security risk. API keys should be passed as parameters."
        exit 1
    fi
    
    print_success "Security checks passed"
}

# Load environment variables from .env for parameter generation
load_env_vars() {
    if [ -f ".env" ]; then
        print_status "Loading environment variables from .env file..."
        export $(grep -v '^#' .env | xargs)
        print_success "Environment variables loaded"
    else
        print_warning "No .env file found. You'll need to enter API keys manually."
    fi
}

# Deploy function
deploy() {
    local deployment_mode=$1
    
    print_status "Starting deployment in ${deployment_mode} mode..."
    
    # Build the application
    print_status "Building SAM application..."
    sam build
    print_success "Build completed"
    
    if [ "$deployment_mode" = "guided" ]; then
        # Guided deployment - will prompt for parameters
        print_status "Starting guided deployment (you'll be prompted for API keys)..."
        print_warning "NEVER commit the generated samconfig.toml with API keys to version control!"
        
        sam deploy --guided
        
    elif [ "$deployment_mode" = "auto" ]; then
        # Automated deployment with environment variables
        print_status "Starting automated deployment with environment variables..."
        
        # Check if required environment variables are set
        if [ -z "$OPENAI_API_KEY" ] || [ -z "$PINECONE_API_KEY" ]; then
            print_error "Required environment variables not set:"
            print_error "  OPENAI_API_KEY"
            print_error "  PINECONE_API_KEY"
            print_error "Please set these in your .env file or environment"
            exit 1
        fi
        
        # Deploy with parameters
        sam deploy \
            --parameter-overrides \
                OpenAIApiKey="$OPENAI_API_KEY" \
                PineconeApiKey="$PINECONE_API_KEY" \
                PineconeEnvironment="${PINECONE_ENVIRONMENT:-us-east-1}" \
                PineconeIndexName="${PINECONE_INDEX_NAME:-jaf-vectordb}" \
                PineconeNamespace="${PINECONE_NAMESPACE:-default}" \
                JwtSecretKey="${JWT_SECRET_KEY:-$(openssl rand -base64 32)}" \
                LangsmithApiKey="${LANGSMITH_API_KEY:-}"
    fi
    
    print_success "Deployment completed!"
}

# Get stack outputs
get_outputs() {
    print_status "Retrieving stack outputs..."
    
    local stack_name="jaf-backend"
    local api_url=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query 'Stacks[0].Outputs[?OutputKey==`JafBackendApi`].OutputValue' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$api_url" ]; then
        print_success "API Gateway URL: $api_url"
        print_status "Test your API with: curl $api_url"
    else
        print_warning "Could not retrieve API URL. Check AWS Console for stack outputs."
    fi
}

# Clean up function
cleanup() {
    print_status "Cleaning up build artifacts..."
    rm -rf .aws-sam/build 2>/dev/null || true
    print_success "Cleanup completed"
}

# Main script
main() {
    echo "🚀 JAF Backend Production Deployment"
    echo "===================================="
    
    # Perform checks
    check_aws_cli
    check_sam_cli
    security_check
    
    # Load environment variables
    load_env_vars
    
    # Ask for deployment mode
    echo ""
    echo "Choose deployment mode:"
    echo "1) Guided deployment (recommended for first time)"
    echo "2) Automated deployment (uses .env file)"
    echo "3) Cleanup only"
    echo ""
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            deploy "guided"
            get_outputs
            ;;
        2)
            deploy "auto"
            get_outputs
            ;;
        3)
            cleanup
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Deployment process completed!"
    print_status "Your JAF Backend is now running on AWS Lambda"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@" 