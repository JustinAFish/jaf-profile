# 🚀 JAF Backend - Production Deployment Guide

This guide covers secure deployment of your JAF Backend to AWS Lambda for production use.

## ✅ **YES, IT WILL WORK IN PRODUCTION!**

Your application is properly configured to work in AWS Lambda production environment with:
- ✅ Proper environment variable handling (no `.env` file dependency)
- ✅ Secure API key management via SAM parameters
- ✅ Fixed Pinecone plugin deprecation issues
- ✅ Lambda-optimized configuration loading
- ✅ Production validation checks

## 🔒 Security & Best Practices

### ✅ What We Fixed
- **Environment Variables**: Now use Pydantic's automatic loading instead of direct `os.environ` calls
- **Lambda Detection**: Automatically detects Lambda environment and skips `.env` file loading
- **API Key Security**: Removed hardcoded secrets from configuration files
- **Error Handling**: Added graceful handling for deprecated Pinecone plugins

### 🚨 Security Warnings
- **Never commit API keys** to version control
- **Use guided deployment** for secure parameter input
- **Consider AWS Secrets Manager** for production secrets management

## 🚀 Deployment Options

### Option 1: Secure Guided Deployment (Recommended)

```bash
# Use the secure deployment script
./deploy-production.sh

# Choose option 1 for guided deployment
# You'll be prompted to enter your API keys securely
```

### Option 2: Automated Deployment (CI/CD)

```bash
# Set environment variables
export OPENAI_API_KEY="your-openai-key"
export PINECONE_API_KEY="your-pinecone-key"
export PINECONE_ENVIRONMENT="us-east-1"
export PINECONE_INDEX_NAME="jaf-vectordb"
export PINECONE_NAMESPACE="default"

# Run automated deployment
./deploy-production.sh
# Choose option 2
```

### Option 3: Manual SAM Deployment

```bash
# Build
sam build

# Deploy with parameters
sam deploy \
  --parameter-overrides \
    OpenAIApiKey="your-openai-key" \
    PineconeApiKey="your-pinecone-key" \
    PineconeEnvironment="us-east-1" \
    PineconeIndexName="jaf-vectordb" \
    PineconeNamespace="default" \
    JwtSecretKey="$(openssl rand -base64 32)" \
    LangsmithApiKey=""
```

## 🔧 Configuration Details

### Environment Variables in Production

Your Lambda function will receive these environment variables from the SAM template:

| Environment Variable | SAM Parameter | Description |
|---------------------|---------------|-------------|
| `OPENAI_API_KEY` | `OpenAIApiKey` | OpenAI API key for LLM |
| `PINECONE_API_KEY` | `PineconeApiKey` | Pinecone API key |
| `PINECONE_ENVIRONMENT` | `PineconeEnvironment` | Pinecone environment |
| `PINECONE_INDEX_NAME` | `PineconeIndexName` | Your Pinecone index name |
| `PINECONE_NAMESPACE` | `PineconeNamespace` | Pinecone namespace |
| `LANGSMITH_API_KEY` | `LangsmithApiKey` | LangSmith tracing key |
| `ENVIRONMENT` | (Global) | Set to "production" |

### Lambda-Specific Settings

```yaml
# From template.yaml
Globals:
  Function:
    Timeout: 900        # 15 minutes max
    MemorySize: 1024    # 1GB memory
    Environment:
      Variables:
        ENVIRONMENT: production
        PYTHONPATH: /var/task
```

## 🧪 Testing Production Deployment

### 1. Test the API
```bash
# Get your API URL from deployment output or AWS Console
API_URL="https://your-api-gateway-url.amazonaws.com/Prod"

# Test health endpoint
curl "$API_URL/"

# Test chat endpoint
curl -X POST "$API_URL/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"content": "What is your expertise?"}'
```

### 2. Monitor Logs
```bash
# View real-time logs
sam logs -n JafBackendFunction --stack-name jaf-backend --tail

# Or use AWS CLI
aws logs tail /aws/lambda/jaf-backend-JafBackendFunction --follow
```

## 🏗️ Architecture in Production

```
Internet → API Gateway → Lambda Function → Pinecone/OpenAI
                      ↓
                 CloudWatch Logs
```

### Key Components:
- **API Gateway**: Handles HTTP requests and routing
- **Lambda Function**: Runs your FastAPI application
- **Lambda Layer**: Contains Python dependencies (pinecone, langchain, etc.)
- **CloudWatch**: Logs and monitoring
- **IAM Role**: Automatically created with minimal permissions

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. API Keys Not Working
```bash
# Check environment variables in Lambda console
aws lambda get-function-configuration \
  --function-name jaf-backend-JafBackendFunction
```

#### 2. Pinecone Connection Issues
- Verify your Pinecone API key is valid
- Check Pinecone index name and environment
- Ensure index exists in your Pinecone account

#### 3. Timeout Issues
- Increase Lambda timeout in `template.yaml` (max 15 minutes)
- Optimize your code for faster responses
- Consider async processing for long operations

#### 4. Memory Issues
- Increase Lambda memory in `template.yaml`
- Monitor CloudWatch metrics

### Debug Commands

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks --stack-name jaf-backend

# Test Lambda function directly
sam local invoke JafBackendFunction -e events/test-event.json

# View Lambda configuration
aws lambda get-function --function-name jaf-backend-JafBackendFunction
```

## 🔄 Updates & Maintenance

### Updating Your Application
```bash
# Make your code changes
# Then redeploy
./deploy-production.sh
```

### Updating Dependencies
```bash
# Update requirements.txt
# Then rebuild and redeploy
sam build
sam deploy
```

### Updating API Keys
```bash
# Use AWS CLI to update environment variables
aws lambda update-function-configuration \
  --function-name jaf-backend-JafBackendFunction \
  --environment Variables='{
    "OPENAI_API_KEY":"new-key",
    "PINECONE_API_KEY":"new-key"
  }'
```

## 📊 Monitoring & Metrics

### CloudWatch Metrics
- Invocations
- Duration
- Errors
- Throttles
- Memory Usage

### Custom Monitoring
- Add CloudWatch custom metrics in your code
- Set up alarms for error rates
- Monitor API Gateway metrics

## 🎯 Production Checklist

Before deploying to production:

- [ ] ✅ API keys are secure and not in version control
- [ ] ✅ Pinecone index is created and populated with data
- [ ] ✅ Test endpoints work correctly
- [ ] ✅ CloudWatch logging is configured
- [ ] ✅ Error handling is implemented
- [ ] ✅ Timeout and memory settings are appropriate
- [ ] ✅ Backup strategy for Pinecone data
- [ ] ✅ Monitoring and alerting are set up

## 🚀 Ready to Deploy!

Your JAF Backend is production-ready! Use the secure deployment script:

```bash
./deploy-production.sh
```

Choose guided deployment for your first deployment, and you'll have a fully functional API running on AWS Lambda! 🎉 