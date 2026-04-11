# JAF Backend - AWS Lambda Deployment Guide

This guide explains how to deploy the JAF Backend FastAPI application to AWS Lambda using SAM (Serverless Application Model).

## 📋 Prerequisites

Before deploying, ensure you have:

1. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure  # Set up your AWS credentials
   ```

2. **SAM CLI** installed
   ```bash
   # macOS
   brew install aws-sam-cli
   
   # Or download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
   ```

3. **Docker** installed (required for SAM builds)
   ```bash
   docker --version
   ```

4. **Required Environment Variables** - you'll need these values ready:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `PINECONE_API_KEY` - Your Pinecone API key  
   - `PINECONE_ENVIRONMENT` - Your Pinecone environment (e.g., "us-east1-gcp")
   - `PINECONE_INDEX_NAME` - Your Pinecone index name
   - `PINECONE_NAMESPACE` - Your Pinecone namespace (optional)
   - `JWT_SECRET_KEY` - A secure secret key for JWT tokens
   - `LANGSMITH_API_KEY` - Your LangSmith API key (optional)

## 🚀 Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build the application
sam build

# Deploy (first time - guided)
sam deploy --guided

# Deploy (subsequent times)
sam deploy
```

## ⚙️ Detailed Setup

### 1. Project Structure

The Lambda deployment adds these files to your project:

```
jaf-backend/
├── template.yaml              # SAM template
├── lambda_handler.py          # Lambda entry point  
├── requirements-lambda.txt    # Lambda-specific dependencies
├── dependencies/
│   └── requirements.txt       # Layer dependencies
├── samconfig.toml            # SAM configuration
├── deploy.sh                 # Deployment script
└── README-Lambda.md          # This file
```

### 2. Configuration

#### SAM Template (`template.yaml`)
- Defines the Lambda function, API Gateway, and dependencies layer
- Uses parameters for environment variables (secure)
- Sets up proper IAM permissions

#### Lambda Handler (`lambda_handler.py`)
- Wraps your FastAPI app using Mangum for Lambda compatibility
- Handles API Gateway event conversion

#### Dependencies Layer
- Packages all Python dependencies into a Lambda layer
- Keeps the main function package small and fast

### 3. Environment Variables

During deployment, you'll be prompted to enter:

```
Parameter OpenAIApiKey []: your-openai-api-key
Parameter PineconeApiKey []: your-pinecone-api-key  
Parameter PineconeEnvironment []: us-east1-gcp
Parameter PineconeIndexName []: jaf-index
Parameter PineconeNamespace []: 
Parameter JwtSecretKey []: your-secure-jwt-secret
Parameter LangsmithApiKey []: your-langsmith-key
```

## 🔧 Advanced Configuration

### Custom SAM Configuration

Edit `samconfig.toml` to customize:

```toml
[default.deploy.parameters]
region = "us-west-2"  # Change AWS region
stack_name = "my-jaf-backend"  # Change stack name
```

### Memory and Timeout Settings

Edit `template.yaml` to adjust Lambda settings:

```yaml
Globals:
  Function:
    Timeout: 900        # Max 15 minutes
    MemorySize: 1024    # 1GB memory
```

### VPC Configuration (Optional)

If you need VPC access, add to your function in `template.yaml`:

```yaml
JafBackendFunction:
  Type: AWS::Serverless::Function
  Properties:
    # ... existing properties
    VpcConfig:
      SecurityGroupIds:
        - sg-12345678
      SubnetIds:
        - subnet-12345678
        - subnet-87654321
```

## 📊 Monitoring and Debugging

### CloudWatch Logs

View Lambda logs:
```bash
sam logs -n JafBackendFunction --stack-name jaf-backend --tail
```

### Local Testing

Test the API locally:
```bash
# Start local API
sam local start-api

# Test endpoints
curl http://localhost:3000/
curl http://localhost:3000/health
```

### Lambda Function Testing

Test individual Lambda function:
```bash
sam local invoke JafBackendFunction -e events/test-event.json
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear SAM cache
   rm -rf .aws-sam/
   sam build --use-container
   ```

2. **Memory Issues**
   - Increase `MemorySize` in template.yaml
   - Consider using provisioned concurrency for large models

3. **Cold Start Performance**
   ```yaml
   # Add provisioned concurrency
   ProvisionedConcurrencyConfig:
     ProvisionedConcurrencyAutoPublishingEnabled: true
   ```

4. **Dependencies Too Large**
   - Remove unnecessary packages from requirements-lambda.txt
   - Use Lambda layers for large dependencies

### Environment Variable Issues

If environment variables aren't working:

1. Check parameter values in CloudFormation console
2. Verify parameter names match template.yaml
3. Check Lambda function environment variables in AWS console

### API Gateway Issues

Common API Gateway problems:

1. **CORS Issues**: Already configured in the FastAPI app
2. **Path Issues**: The template uses `/{proxy+}` to catch all paths
3. **Binary Content**: May need to configure binary media types

## 🔄 Updates and Redeployment

### Update Code
```bash
# Make your changes
git add .
git commit -m "Update application"

# Redeploy
./deploy.sh
```

### Update Dependencies
```bash
# Edit requirements-lambda.txt and dependencies/requirements.txt
# Then redeploy
sam build
sam deploy
```

### Update Configuration
```bash
# Edit template.yaml
# Then redeploy
sam deploy
```

## 💰 Cost Optimization

### Lambda Pricing Factors
- **Requests**: $0.20 per 1M requests
- **Duration**: Based on memory and execution time
- **Data Transfer**: Standard AWS rates

### Optimization Tips
1. **Right-size Memory**: Start with 1024MB, adjust based on performance
2. **Optimize Cold Starts**: Keep dependencies minimal
3. **Use Provisioned Concurrency**: For predictable traffic patterns
4. **Monitor with CloudWatch**: Track performance and costs

## 🏗️ Architecture

```
Internet → API Gateway → Lambda Function → Pinecone/OpenAI
                           ↓
                      CloudWatch Logs
```

### Key Components
- **API Gateway**: Handles HTTP requests and routing
- **Lambda Function**: Runs your FastAPI application
- **Lambda Layer**: Contains Python dependencies
- **CloudWatch**: Logging and monitoring
- **IAM Roles**: Secure access permissions

## Automated tests (API)

From `jaf-backend/`:

```bash
pip install -r requirements-dev.txt
pytest
```

Tests mock the RAG pipeline so OpenAI and Pinecone are not required. Optional real-service checks can be marked `@pytest.mark.integration` (excluded from default runs).

## 📞 Support

If you encounter issues:

1. Check CloudWatch logs for errors
2. Verify all environment variables are set correctly
3. Test locally with `sam local start-api`
4. Check AWS service limits and quotas

For AWS-specific issues, consult the [AWS Lambda documentation](https://docs.aws.amazon.com/lambda/). 