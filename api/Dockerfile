FROM python:3.11-slim

# Set working directory to app root
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy API requirements and install Python dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy API code
COPY api/ ./api/

# Copy React frontend
COPY react-frontend/ ./react-frontend/

# Build React frontend
WORKDIR /app/react-frontend
RUN npm install && npm run build

WORKDIR /app

# Expose port
EXPOSE 5000

# Run the application
CMD ["gunicorn", "api.app:app", "--bind", "0.0.0.0:5000"]
