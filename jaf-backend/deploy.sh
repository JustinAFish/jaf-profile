#!/bin/bash

# JAF Backend AWS Lambda Deployment Script
# This script builds and deploys the FastAPI application to AWS Lambda using SAM

set -e  # Exit on any error

echo "🚀 Starting JAF Backend Lambda deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    print_error "SAM CLI is not installed. Please install it first:"
    echo "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not configured or credentials are invalid."
    echo "Please run 'aws configure' to set up your credentials."
    exit 1
fi

print_status "AWS CLI and SAM CLI are properly configured ✅"

# Validate environment variables (optional - you can skip this in production)
print_status "Checking environment variables..."

if [ -f ".env" ]; then
    print_status "Found .env file - make sure to set these as SAM parameters"
    print_warning "Environment variables in .env file will NOT be automatically used"
    print_warning "You need to pass them as parameters during deployment"
else
    print_warning "No .env file found - all configuration must be passed as parameters"
fi

# Build the application
print_status "Building SAM application..."
sam build --use-container --cached --parallel

if [ $? -ne 0 ]; then
    print_error "SAM build failed!"
    exit 1
fi

print_status "Build completed successfully ✅"

# Deploy the application
print_status "Deploying to AWS..."

# Check if this is the first deployment
if [ ! -f "samconfig.toml" ] || ! grep -q "stack_name" samconfig.toml 2>/dev/null; then
    print_status "Running guided deployment (first time)..."
    sam deploy --guided
else
    print_status "Deploying with existing configuration..."
    sam deploy
fi

if [ $? -ne 0 ]; then
    print_error "Deployment failed!"
    exit 1
fi

print_status "Deployment completed successfully! 🎉"

# Get the API endpoint
print_status "Retrieving API endpoint..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name jaf-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`JafBackendApi`].OutputValue' \
    --output text 2>/dev/null)

if [ -n "$API_ENDPOINT" ]; then
    echo ""
    echo "🌐 Your API is available at: $API_ENDPOINT"
    echo "📝 Health check: ${API_ENDPOINT}health"
    echo "💬 Chat endpoint: ${API_ENDPOINT}api/chat"
    echo ""
else
    print_warning "Could not retrieve API endpoint. Check CloudFormation console."
fi

print_status "Deployment script completed!" 