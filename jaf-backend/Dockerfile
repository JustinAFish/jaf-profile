# Build stage
FROM python:3.11-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies (requirements.txt references -c constraints.txt)
COPY requirements.txt constraints.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim AS runner

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application code
COPY . .

# Set production environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV ENVIRONMENT=production

# Expose port
EXPOSE 8000

# Start the application with reduced workers for Render
# Using only 1 worker to avoid memory issues and process conflicts
# Using the start script for better error handling
CMD ["python", "start.py"] 